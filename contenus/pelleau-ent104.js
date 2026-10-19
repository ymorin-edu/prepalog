// ENT-10.4 — Transports Pelleau, évaluation « prendre son poste » : le contenu de la séance (brief
// `docs/briefs/ENT-10.4-pelleau-evaluation-prise-de-poste.md` ; décisions du chef de chantier `docs/briefs/COORDINATION-pelleau.md` §2, qui passent
// avant le brief). CAP OL, ÉVALUATION de CAP-C1.2 (prendre son poste), en copie rendue (`copie: true`) : rien ne remonte pendant le travail, une
// seule remise (bouton « Rendre ma copie » du bandeau), note figée ; aucun bilan, aucun « Corriger », aucun mot cliquable, rien à l'écran ne dit
// juste ou faux. Univers commun : `contenus/pelleau.js` (À LIRE). Données pures (défauts tirés, inspection, dialogue, planning, lectures,
// phrases) : `contenus/pelleau-ent104-donnees.js`. Activité : `activites/pelleau-evaluation-prise-de-poste.js`. Questions :
// `contenus/questions/ENT-10.4.js`. Corrigé : `contenus/corriges/ENT-10.4.js`. Modèles : ENT-10.2 (la structure) et ENT-8.6 (l'évaluation).
//
// 11 mai 2026, 7 h (aucun jour de la semaine écrit : FDR §0.7, décision 9 du chef ; le brief en écrit un, § 0, non repris). Erwan est en réunion :
// l'élève prend son poste seul. Écrans, un par étape :
//   Avant de commencer (noté, 4 / 20, sans aide) → ① Où est-ce ? (fiche, plan numéroté dont les numéros sont TIRÉS) → ② Mon poste (vue « Inspection
//   du poste » en copie : deux défauts tirés, un point en ordre, avertisseur à essayer, « C'est noté. », rien ne se répare, pas d'arrêt) →
//   ③ Yann (dialogue en face à face, évaluation : il presse, une réplique juste calculée sur le défaut du site) → ④ Lire le planning (fiche,
//   lectures tirées) puis le planning des quais (une carte à poser ; `rendCopie: false` : l'envoi ne rend pas la copie) → ⑤ Rendre compte à Erwan
//   par phrases → « Rendre ma copie ».
//
// VÉRIFIÉ / CONSTRUIT (brief §2 : « comme ENT-10.2 et 10.3 ») — voir aussi l'en-tête de `contenus/pelleau.js` et celui d'ENT-10.2 :
//   Vérifié : rien de nouveau (l'INRS ED 36 n'est plus lue ici : aucune liste « Ma prise de poste », aucun « Le droit » : évaluation sans aide).
//   Construit (dit dans la séance, `MENTION_104`) : le plan de l'entrepôt (schéma, pas le vrai plan), le planning du 11 mai et ses camions
//   (Loïc, Ar Vag, un départ pour Rungis), les transpalettes n° 1 et 2, les défauts, Erwan, Yann, Loïc, Maëlys, la Biscuiterie Ar Vag et Agri-Kerlann
//   (entreprises fictives).
//   Dessins : l'engin d'« Avant de commencer » est tracé par le kit iso (`core/iso.js`) ; la photo des racks est celle de Pelleau (`PHOTOS.racks`).

import { apresFiche, apresPlanning, apresMail, dialogueFini, inspectionFinie } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { etapesInspection, verifierInspection } from '../core/types/inspection.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { projection, boiteEcran, transpaletteElectrique, boitesTranspalette } from '../core/iso.js';
import { QUESTIONS } from './questions/ENT-10.4.js';
import { EQUIPE, MENTION, LOGO, STYLE_DOCUMENTS, PIED, mailDe, heureScenario, ech, pied } from './pelleau.js';
import {
  ID, ID_VOLET, INSPECTION_ID, DIALOGUE_ID, PLANNING_ID, PHRASES_ID, JOUR, FICHES, DEFAUTS_SITE, ENGINS, inspectionDe, inspectionPour,
  REPLIQUES, JUSTE_PRESSE, FIN_DIALOGUE, LIEUX_PLAN, NUMEROS, QUAIS, CAMIONS, CARTE, ECHELLE, LECTURES, HEURE_ARVAG, QUAI_ARVAG, heureLue, minutesDe,
  lieuxDe, lecturesTirees, planDe, numeroDe, melangerPour, phrasesCompteRendu, defautSiteDeBase, envoyee, valeurDe, dejaEnvoyee, planningEnvoye, placeCarte,
} from './pelleau-ent104-donnees.js';

export { ID, ID_VOLET, INSPECTION_ID, DIALOGUE_ID, PLANNING_ID, PHRASES_ID, FICHES, TIRAGE } from './pelleau-ent104-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// Le contrôle au chargement : les douze inspections possibles (2 défauts du site × 6 défauts de l'engin) sont acceptées par la vue ; la séance
// refuse de s'ouvrir sinon (on ne découvre pas en classe qu'un objet ne se dessine pas).
DEFAUTS_SITE.forEach((s) => ENGINS.forEach((e) => {
  const F = verifierInspection(inspectionPour(s, e));
  if (F.length) throw new Error(`ENT-10.4 : l'inspection (site ${s}, engin ${e}) est refusée par la vue — ${F.join(' ; ')}`);
}));

// ─────────────────────────────────────────────────────────────── le plan de l'entrepôt, ronds aux numéros TIRÉS
// Vue de dessus, sans un seul nom de lieu écrit (le plan ne donne pas les réponses) : chaque lieu se reconnaît à ce qu'il contient (casiers,
// chargeurs et transpalettes, bureau, palettes filmées, palettes à problème, racks), les quais à leur nom. Schéma CONSTRUIT.
const ENCRE = '#2b2824', GRIS = 'rgba(43,40,36,.12)';
const rond = (n, x, y, perm) => `<g class="pe-num"><circle cx="${x}" cy="${y}" r="20" fill="#f7f3ea" stroke="${ENCRE}" stroke-width="3"/>`
  + `<text x="${x}" y="${y + 8}" text-anchor="middle" font-size="24" font-weight="800" fill="${ENCRE}">${perm[n - 1]}</text></g>`;
const palette = (x, y, w = 34) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>`
  + `<path d="M${x} ${y + w / 3} H${x + w} M${x} ${y + 2 * w / 3} H${x + w}" stroke="${ENCRE}" stroke-width="1"/>`;
const casier = (x, y) => `<rect x="${x}" y="${y}" width="22" height="34" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>`
  + `<path d="M${x} ${y + 10} H${x + 22}" stroke="${ENCRE}" stroke-width=".8"/><circle cx="${x + 17}" cy="${y + 22}" r="1.8" fill="${ENCRE}"/>`;
const engin = (x, y) => `<path d="M${x} ${y} H${x + 30} M${x} ${y + 10} H${x + 30} M${x + 30} ${y - 3} V${y + 13} M${x + 30} ${y + 5} H${x + 48}"
  fill="none" stroke="${ENCRE}" stroke-width="2.2" stroke-linecap="round"/>`;
const eclair = (x, y) => `<path d="M${x + 8} ${y} L${x} ${y + 20} L${x + 7} ${y + 20} L${x + 2} ${y + 38} L${x + 16} ${y + 14} L${x + 9} ${y + 14} L${x + 14} ${y} Z" fill="${ENCRE}"/>`;
const rack = (y) => `<rect x="350" y="${y}" width="490" height="22" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>`
  + `<path d="${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => `M${350 + k * 49} ${y} V${y + 22}`).join(' ')}" stroke="${ENCRE}" stroke-width="1"/>`;
export function planNumerote(perm) {
  return `<svg class="pe-plan" viewBox="0 0 900 560" role="img" aria-label="Plan de l’entrepôt, vue de dessus : sept lieux numérotés de 1 à 7, les deux quais en haut">
  <g fill="none" stroke="${ENCRE}">
    <path d="M214 14 V64 M296 14 V64 M564 14 V64 M646 14 V64" stroke-width="1" stroke-dasharray="6 6"/>
    <path d="M40 70 H860 V520 H40 Z" stroke-width="5" stroke-linejoin="miter"/>
    <path d="M40 120 H150 V350 H40" stroke-width="3"/>
    <rect x="50" y="380" width="130" height="130" stroke-width="3"/><rect x="190" y="380" width="130" height="130" stroke-width="3"/>
  </g>
  <rect x="210" y="64" width="90" height="12" fill="rgba(43,40,36,.35)" stroke="${ENCRE}" stroke-width="1.5"/>
  <rect x="560" y="64" width="90" height="12" fill="rgba(43,40,36,.35)" stroke="${ENCRE}" stroke-width="1.5"/>
  <text x="255" y="52" text-anchor="middle" font-size="16" font-weight="700" fill="${ENCRE}">Quai A</text>
  <text x="605" y="52" text-anchor="middle" font-size="16" font-weight="700" fill="${ENCRE}">Quai B</text>
  ${rond(7, 430, 110, perm)}
  <rect x="160" y="130" width="620" height="96" fill="none" stroke="${ENCRE}" stroke-width="2" stroke-dasharray="8 5"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => palette(178 + 66 * k, 150)).join('')}
  ${rond(4, 745, 178, perm)}
  <rect x="58" y="150" width="74" height="34" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.8"/>
  <rect x="82" y="154" width="26" height="14" fill="none" stroke="${ENCRE}" stroke-width="1.6"/><circle cx="95" cy="208" r="10" fill="none" stroke="${ENCRE}" stroke-width="1.8"/>
  ${rond(3, 95, 290, perm)}
  <rect x="160" y="250" width="300" height="96" fill="none" stroke="${ENCRE}" stroke-width="2" stroke-dasharray="8 5"/>
  <rect x="180" y="272" width="120" height="36" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.8"/><rect x="200" y="278" width="26" height="24" fill="none" stroke="${ENCRE}" stroke-width="1.6"/>
  <rect x="330" y="258" width="34" height="44" fill="none" stroke="${ENCRE}" stroke-width="1.8"/><path d="M337 270 H357 M337 280 H357 M337 290 H350" stroke="${ENCRE}" stroke-width="1.4"/>
  ${palette(390, 262)}
  ${rond(5, 430, 322, perm)}
  <rect x="500" y="250" width="280" height="96" fill="none" stroke="${ENCRE}" stroke-width="2" stroke-dasharray="8 5"/>
  ${[520, 566, 612].map((x) => `${palette(x, 268)}<text x="${x + 17}" y="${268 + 27}" text-anchor="middle" font-size="26" font-weight="900" fill="${ENCRE}">!</text>`).join('')}
  ${rond(6, 730, 310, perm)}
  ${[0, 1, 2, 3, 4].map((k) => casier(60 + 24 * k, 392)).join('')}
  ${rond(1, 115, 470, perm)}
  <rect x="202" y="392" width="14" height="22" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>${eclair(226, 392)}
  ${engin(200, 436)}${engin(200, 456)}
  ${rond(2, 262, 490, perm)}
  ${[380, 408, 458, 486].map(rack).join('')}
</svg>`;
}
const DOC_PLAN = { id: 'plan-104', titre: 'Plan de l’entrepôt', court: 'Le plan',
  html: (db) => `<article class="pe-doc" aria-label="Plan de l’entrepôt">
    <p class="pe-t">Plan de l’entrepôt de Gouesnou</p>
    <p class="pe-st">Vue de dessus. Les <b>ronds numérotés</b> : les lieux à trouver.</p>
    ${planNumerote(planDe(db))}
    ${pied('Plan construit pour l’exercice : ce n’est pas le vrai plan de l’entrepôt.')}
  </article>` };
// Les numéros affichés sur le plan d'un élève, lus dans le dessin (tests et corrigé).
export const numerosDuPlan = (perm) => [...planNumerote(perm).matchAll(/<g class="pe-num">[\s\S]*?<text[^>]*>(\d)<\/text><\/g>/g)].map((m) => Number(m[1]));

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; pied imposé)
// Le planning des quais : un tableau quais × quarts d'heure, fabriqué depuis la grille (jamais recopié).
const d0 = minutesDe(ECHELLE.debut), d1 = minutesDe(ECHELLE.fin), PAS = ECHELLE.pas;
export function tablePlanning(camions, { vide = false } = {}) {
  const n = (d1 - d0) / PAS;
  let h = '<tr><th scope="col" class="pe-q">Quai</th>';
  for (let m = d0; m < d1; m += 60) h += `<th scope="col" colspan="${60 / PAS}">${heureLue(m)}</th>`;
  h += '</tr>';
  const lignes = QUAIS.map((q) => {
    let s = `<tr><th scope="row" class="pe-q">${ech(q.nom)}</th>`;
    for (let i = 0; i < n;) {
      const m = d0 + i * PAS;
      const c = vide ? null : camions.find((x) => x.quai === q.id && minutesDe(x.de) === m);
      if (c) {
        const span = (minutesDe(c.a) - minutesDe(c.de)) / PAS;
        s += `<td class="pe-pris" colspan="${span}"><b>${ech(c.court)}</b><br>${heureLue(minutesDe(c.de))} – ${heureLue(minutesDe(c.a))}</td>`;
        i += span;
      } else { s += `<td${(m - d0) % 60 === 0 ? ' class="pe-h"' : ''}></td>`; i += 1; }
    }
    return `${s}</tr>`;
  }).join('');
  return `<table class="pe-tab"><colgroup><col class="pe-q">${'<col>'.repeat(n)}</colgroup><thead>${h}</thead><tbody>${lignes}</tbody></table>`;
}
const DOC_PLANNING = { id: 'planning-doc-104', titre: 'Planning des quais — 11 mai', court: 'Planning des quais',
  html: () => `<article class="pe-doc" aria-label="Planning des quais du 11 mai">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Planning des quais — 11 mai, le matin</p>
    <p class="pe-st">Entrepôt de Gouesnou · une case = un quart d’heure</p>
    ${tablePlanning(CAMIONS)}
    <ul class="pe-ul">${CAMIONS.map((c) => `<li><b>${ech(c.titre)}</b> : ${heureLue(minutesDe(c.de))} – ${heureLue(minutesDe(c.a))}, ${ech(QUAIS.find((q) => q.id === c.quai).nom)}</li>`).join('')}</ul>
    ${pied(`${PIED} Camions et horaires construits pour l’exercice.`)}
  </article>` };
// Pour « Avant de commencer » : un planning VIDE (aucun camion de la séance) et le contexte du stage.
const DOC_PLANNING_VIDE = { id: 'planning-vide-104', titre: 'Un planning des quais (vide)', court: 'Un planning',
  html: `<article class="pe-doc" aria-label="Un planning des quais vide">
    <p class="pe-t">Un planning des quais</p>
    <p class="pe-st">Exemple vide : chaque camion prévu prend une case à son quai, de son heure d’arrivée à son heure de départ.</p>
    ${tablePlanning([], { vide: true })}
    ${pied('Document pédagogique — modèle construit pour l’exercice.')}
  </article>` };
const DOC_STAGE = { id: 'stage-104', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="pe-doc" aria-label="Ton poste">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Ton poste</p>
    <p class="pe-st">11 mai, 7 h</p>
    <p>Tu es en stage (PFMP) aux <b>Transports Pelleau</b>, dans l’entrepôt neuf de Gouesnou. Ce matin, tu prends ton poste <b>seul</b>.</p>
    <p>Ton tuteur : <b>Erwan</b>, le responsable de l’entrepôt. Avec toi : <b>Yann</b>, magasinier-cariste, et <b>Maëlys</b>, au bureau transport.</p>
    <p>Ton engin : un transpalette électrique.</p>
    ${pied('Document pédagogique — Erwan, Yann et Maëlys sont imaginés pour l’exercice.')}
  </article>` };

// Le DESSIN d'« Avant de commencer » (kit iso : aucune photo libre d'un transpalette électrique au dépôt). Le cadre (viewBox) se calcule sur les boîtes.
const DESSIN_ENGIN = (() => {
  const I = projection({ unite: 150, origine: [300, 80] });
  const sol = I.face([[-0.5, -0.4, 0], [1.4, -0.4, 0], [1.4, 2.4, 0], [-0.5, 2.4, 0]], '#e4dfd3', 'none');
  const r = boiteEcran(I, boitesTranspalette('ok', [0, 0]), 26);
  return `<svg class="pe-dessin" viewBox="${r.x} ${r.y} ${r.w} ${r.h}" role="img" aria-label="Un engin jaune à deux fourches, avec un long manche et un capot qui porte le numéro 1">${sol + transpaletteElectrique(I, [0, 0], 'ok', { n: 1 })}</svg>`;
})();
const DOC_DESSIN_ENGIN = { id: 'dessin-engin-104', titre: 'Un engin de l’entrepôt', court: 'Un engin',
  html: `<article class="pe-doc" aria-label="Un engin de l’entrepôt">${DESSIN_ENGIN}<p class="pe-st">Dessin construit pour l’exercice.</p></article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.pe-tab{border-collapse:collapse; width:100%; margin:6px 0 10px; font-size:.78rem; table-layout:fixed}
.pe-tab th,.pe-tab td{border:1px solid #d6d0c3; padding:3px 2px; text-align:center; vertical-align:middle}
.pe-tab td.pe-h,.pe-tab th{border-left:1.5px solid #8f897c}
.pe-tab th.pe-q,.pe-tab col.pe-q{width:62px}
.pe-tab td.pe-pris{background:rgba(85,80,71,.16); line-height:1.15; font-size:.74rem; border:1.5px solid #555047}
.pe-tab td{height:44px}
.pe-dessin{display:block; width:100%; max-height:340px; margin:4px auto 6px}
.pe-plan{display:block; width:100%; height:auto; margin:6px 0 4px}
`;
export const DOCUMENTS = [DOC_PLAN, DOC_PLANNING, DOC_PLANNING_VIDE, DOC_STAGE, DOC_DESSIN_ENGIN];

// ─────────────────────────────────────────────────────────────── ① « Où est-ce ? » (fiche)
// Les textes fixes du moteur (sous-titre, bouton d'envoi) : la fiche part incomplète (évaluation : rien n'est exigé), aucun accusé qui juge.
const ENVOI = (a, suite = 'Merci, c’est noté.') => ({ bouton: `Envoyer la fiche à ${a}`, a, suite, incomplet: true });
export const FICHE_OU = {
  id: FICHES.ou, libelle: 'Où est-ce ?', titre: 'Où est-ce ?',
  sousTitre: 'Sur le plan, trouve le numéro de chaque lieu.',
  documents: ['plan-104'], largeurDocs: 1.6,
  bouton: 'Ouvrir la fiche « Où est-ce ? »',
  blocs: (db) => lieuxDe(db).map((p) => ({ type: 'liste', id: p.id, lib: p.q, vide: 'n° ?', choix: NUMEROS, manque: `le numéro pour « ${p.q.replace(/ \?$/, '')} »` })),
  envoi: ENVOI('Erwan'),
};

// ─────────────────────────────────────────────────────────────── ② mon poste : l'inspection (vue « Inspection du poste », en copie)
// Une FONCTION de la graine : les deux défauts sont tirés par élève (voir les données).
export const INSPECTION = (graine) => inspectionDe(graine);
const inspectionFaite = inspectionFinie(INSPECTION_ID);
const inspectionFaiteBase = (db) => inspectionFaite(db, ID);

// ─────────────────────────────────────────────────────────────── ③ Yann (face à face, évaluation) : il presse, on ne cède pas
export const TELEPHONE = {
  face: true,
  libelle: 'Avec Yann',
  situation: 'Yann t’attend près des quais. Va le voir.',
  dialogues: [{ id: DIALOGUE_ID, de: 'yann', contact: { nom: 'Yann', detail: 'magasinier-cariste' }, repliques: REPLIQUES, fin: FIN_DIALOGUE }],
};
const dialogueFiniBase = (db) => dialogueFini(DIALOGUE_ID)(db, ID);

// ─────────────────────────────────────────────────────────────── ④ « Lire le planning » et le planning des quais
export const FICHE_LIRE = {
  id: FICHES.lire, libelle: 'Lire le planning', titre: 'Lire le planning des quais',
  sousTitre: 'Le planning est à gauche. Réponds aux questions de Maëlys.',
  documents: ['planning-doc-104'], largeurDocs: 1.3,
  bouton: 'Ouvrir la fiche « Lire le planning »',
  quand: (db) => dialogueFiniBase(db) || envoyee(db, FICHES.lire),
  blocs: (db) => lecturesTirees(db).map((p) => { const L = LECTURES[p.id];
    return { type: 'liste', id: p.id, lib: L.q, vide: 'Choisir…', choix: L.choix, manque: 'une réponse' }; }),
  envoi: ENVOI('Maëlys'),
};
// `rendCopie: false` : l'envoi du planning fige la version SANS rendre la copie (d'autres écrans suivent) ; la copie se rend par le bandeau.
export const PLANNING = {
  id: PLANNING_ID, libelle: 'Planning des quais', titre: 'Planning des quais — 11 mai', date: '11 mai',
  rendCopie: false,
  infos: () => ['Agri-Kerlann livre pendant <b>une heure</b>, <b>entre 10 h et 12 h</b>.',
    'Un quai ne reçoit qu’un camion à la fois : les blocs gris pointillés sont déjà pris.',
    'Un camion ne se met qu’à un quai prêt : l’extincteur à sa place.'],
  echelle: { type: 'heures', debut: ECHELLE.debut, fin: ECHELLE.fin, pas: ECHELLE.pas },
  lignes: { titre: 'Quais', liste: QUAIS.map((q) => ({ id: q.id, nom: q.nom,
    occupe: CAMIONS.filter((c) => c.quai === q.id).map((c) => ({ de: c.de, a: c.a, titre: c.titre })) })) },
  cartes: { titre: 'Le camion à placer',
    liste: [{ id: CARTE.id, titre: CARTE.titre, court: CARTE.court, famille: 'agri', des: CARTE.des, avant: CARTE.avant }],
    details: () => [], duree: () => CARTE.duree, nonPosees: () => 'Le camion d’Agri-Kerlann n’est pas encore posé.', legende: ' ' },
  familles: { agri: { couleur: '#8b5cf6', nom: 'violet', legende: 'Agri-Kerlann' } },
  regles: [
    { id: 'quai', type: 'unAlaFois', sur: 'ligne' },
    { id: 'fenetre', type: 'fenetre', message: { debut: () => 'Le camion arrive avant 10 h.', fin: () => 'Le camion finit après 12 h.' } },
  ],
  jalons: [{ id: 'place', lib: 'Le camion sur un quai libre, dans le créneau', regles: ['quai', 'fenetre'] }],
  aides: { consignes: { regles: 'Glisse le camion sur un quai, à l’heure où il arrive (ou clique-le, puis clique la case). Puis envoie le planning.' } },
};

// ─────────────────────────────────────────────────────────────── les messages (au tu ; 11 mai, aucun jour de la semaine ; jamais juste ni faux)
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const MAELYS = { nom: EQUIPE.maelys.nom, mail: mailDe('maelys') };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR, o.heure || '07:00', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, ERWAN, 'Aujourd’hui, tu prends ton poste',
      `Bonjour ${prenom} ! Aujourd’hui, tu prends ton poste seul : je suis en réunion, Yann est aux quais. Tu me rends compte par message.\n\n`
        + 'D’abord, dis-moi où se trouve chaque endroit de l’entrepôt. Ouvre la fiche « Où est-ce ? ».\n\nErwan',
      { extra: { ouvreFiche: FICHES.ou } }),
  ] }),
  declencheurs: [
    { id: 'poste', quand: apresFiche(FICHES.ou),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Ton poste',
        'Prends ton poste. Contrôle ton poste et le transpalette n° 1, et signale-moi ce qui ne va pas. Ouvre « Mon poste ».\n\nErwan',
        { db, heure: '07:10' })] }) },
    { id: 'yann', quand: inspectionFaite,
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Yann t’attend',
        'Yann est aux quais. Va le voir : menu « Avec Yann ».\n\nErwan', { db, heure: '07:15' })] }) },
    { id: 'planning', quand: dialogueFini(DIALOGUE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, MAELYS, 'Le planning des quais',
        `Salut ${prenom}, voici le planning des quais de ce matin. Réponds à mes questions, puis place la livraison d’Agri-Kerlann `
          + '(menu « Planning des quais »).\n\nMaëlys',
        { db, heure: '07:20', extra: { pieces: ['planning-doc-104'], ouvreFiche: FICHES.lire } })] }) },
    { id: 'compte-rendu', quand: apresPlanning(PLANNING_ID),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, MAELYS, 'La livraison d’Agri-Kerlann', 'Merci, je préviens Agri-Kerlann.\n\nMaëlys', { db, heure: '07:24' }),
        mail(prenom, ERWAN, 'Rends-moi compte',
          'Rends-moi compte : ton engin, ce qui manque au site, l’heure du camion d’Ar Vag.\n\n'
            + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nErwan',
          { db, heure: '07:25', extra: { phrases: phrasesCompteRendu(prenom, db) } }),
      ] }) },
    { id: 'fin', quand: apresMail({ a: ERWAN.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Merci',
        `Merci ${prenom}.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nErwan`, { db, heure: '07:28' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 18/10/2026 à 22 h 03, brief §5)
// 16 points de jalons + 4 de l'ouverture (`part: 4`) = 20. Où est-ce ? 2 (2/3 × 3) · Mon poste 6 (défaut du site 2, défaut de l'engin 2,
// avertisseur essayé 0,5, aucun faux 1,5) · Ne pas céder 2 · Le planning 3 (2 lectures 1 + 1, la carte 1) · Rendre compte 3 (engin 0,75, site 0,75,
// heure 0,5, salutation 0,5, fin 0,5 : la forme ne dépasse pas 1). Rien n'est vrai avant un envoi, un « C'est bon, je prends mon poste » ou un
// dialogue terminé : l'inaction vaut 0.
export const GROUPES = { lieux: 'Où est-ce ?', poste: 'Mon poste', ceder: 'Ne pas céder', planning: 'Le planning', compte: 'Rendre compte' };
const POIDS_INSPECTION = { 'securite-site-manque': 2, 'securite-engin-defaut': 2, 'essai-1': 0.5, 'securite-aucun-faux': 1.5 };
const TITRES_INSPECTION = { 'securite-site-manque': 'Mon poste : le défaut du site, signalé avant de prendre le poste',
  'securite-engin-defaut': 'Mon poste : le défaut du transpalette n° 1, signalé avant de prendre le poste',
  'essai-1': 'Mon poste : l’avertisseur du transpalette n° 1 essayé', 'securite-aucun-faux': 'Mon poste : aucun faux signalement' };
const lieuRang = (k) => ({ id: `lieu-${k + 1}`, titre: `Où est-ce ? : la ligne ${k + 1}`, groupe: GROUPES.lieux, poids: 2 / 3, ecran: `fiche:${FICHES.ou}`,
  titreBilan: (db) => { const p = lieuxDe(db)[k]; return p ? `Où est-ce ? : ${p.q.replace(/ \?$/, '')}` : null; },
  verifier(db) { if (!envoyee(db, FICHES.ou)) return attente; const p = lieuxDe(db)[k]; return p && valeurDe(db, FICHES.ou, p.id) === numeroDe(db, p) ? ok : ko; } });
const jalonsInspection = etapesInspection(INSPECTION, ID, { copie: true }).map((e) => Object.assign(e, { groupe: GROUPES.poste, poids: POIDS_INSPECTION[e.id],
  titreBilan: TITRES_INSPECTION[e.id] }));
const lectureRang = (k) => ({ id: `lecture-${k + 1}`, titre: `Le planning : la lecture n° ${k + 1}`, groupe: GROUPES.planning, poids: 1,
  ecran: `fiche:${FICHES.lire}`,
  verifier(db) { if (!envoyee(db, FICHES.lire)) return attente; const p = lecturesTirees(db)[k]; return p && valeurDe(db, FICHES.lire, p.id) === LECTURES[p.id].juste ? ok : ko; } });
// La carte : les règles du planning (quai libre, créneau) ET, quand l'extincteur du quai B manque, jamais au quai B.
const [jalonCarte] = etapesPlanning(PLANNING);
const ligneCR = (id, titre, lignes, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko; } });

export const ETAPES = [
  lieuRang(0), lieuRang(1), lieuRang(2),
  ...jalonsInspection,
  jalonDialogue({ seance: ID, dialogue: DIALOGUE_ID, id: 'refuser', titre: 'Ne pas céder : refuser le n° 1, proposer, prévenir Erwan', groupe: GROUPES.ceder, poids: 2,
    juge: (appel) => premiereReponse(appel, 'presse') === JUSTE_PRESSE }),
  lectureRang(0), lectureRang(1),
  { id: jalonCarte.id, titre: 'Le planning : le camion sur un quai libre et prêt, dans le créneau', groupe: GROUPES.planning, poids: 1,
    ecran: `planning:${PLANNING_ID}`,
    verifier(db) {
      const r = jalonCarte.verifier(db);
      if (r.status !== 'ok') return r;
      const p = placeCarte(db);
      return defautSiteDeBase(db) === 'extincteur' && p && p.r === 'B' ? ko : ok;
    } },
  ligneCR('cr-engin', 'Le compte rendu : ton engin', ['engin'], 0.75),
  ligneCR('cr-site', 'Le compte rendu : ce qui manque au site', ['site'], 0.75),
  ligneCR('cr-heure', 'Le compte rendu : l’heure du camion d’Ar Vag', ['heure'], 0.5),
  ligneCR('cr-salutation', 'Le compte rendu : la salutation', ['salutation'], 0.5),
  ligneCR('cr-fin', 'Le compte rendu : la fin du message', ['fin'], 0.5),
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'Où est-ce ?', fait: dejaEnvoyee(FICHES.ou) },
  { libelle: 'Mon poste', fait: inspectionFaiteBase },
  { libelle: 'Yann', fait: dialogueFiniBase },
  { libelle: 'Planning', fait: (db) => dejaEnvoyee(FICHES.lire)(db) && planningEnvoye(db) },
  { libelle: 'Compte rendu', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
// L'ordre des écrans de travail (menu « Mon poste » ; le moteur ne montre pas la barre « Étape suivante » en évaluation).
export const SUITE = [
  { vue: 'fiche', libelle: 'Où est-ce ?', fait: dejaEnvoyee(FICHES.ou) },
  { vue: 'inspection', libelle: 'Mon poste', fait: inspectionFaiteBase },
  { vue: 'telephone', libelle: 'Avec Yann', fait: dialogueFiniBase },
  { vue: `fiche:${FICHES.lire}`, libelle: 'Lire le planning', fait: dejaEnvoyee(FICHES.lire) },
  { vue: 'planning', libelle: 'Planning des quais', fait: planningEnvoye },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu à Erwan', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const MENTION_104 = `${MENTION} Construits aussi : le plan de l’entrepôt (un schéma), le planning du matin, les deux transpalettes et ce qui ne va pas.`;
export const ACCUEIL = {
  titre: 'Évaluation : prendre mon poste',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Erwan', 'Menu Messagerie.'],
    ['① Où est-ce ?', 'Trouve chaque lieu sur le plan.'],
    ['② Mon poste', 'Contrôle ton poste et ton transpalette, signale ce qui ne va pas.'],
    ['③ Yann', 'Va le voir : il te demande quelque chose.'],
    ['④ Le planning des quais', 'Maëlys t’envoie le planning : lis-le, puis place un camion.'],
    ['⑤ Rendre compte', 'Réponds à Erwan, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION_104],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : prendre mon poste',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_OU, FICHE_LIRE],
  planning: PLANNING,
  inspection: INSPECTION,
  telephone: TELEPHONE,
  // Un écran par étape : chacun ne s'ouvre qu'après le précédent.
  fermetures: {
    inspection: { ouvertSi: (db) => dejaEnvoyee(FICHES.ou)(db), message: 'Après la fiche « Où est-ce ? »' },
    telephone: { ouvertSi: (db) => inspectionFaiteBase(db), message: 'Après « Mon poste »' },
    planning: { ouvertSi: (db) => dejaEnvoyee(FICHES.lire)(db), message: 'Après la fiche « Lire le planning »' },
  },
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
