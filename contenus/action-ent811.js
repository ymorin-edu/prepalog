// ENT-8.11 — Action, « ranger à la bonne adresse » : le contenu de la séance (brief `docs/briefs/ENT-8.11-action-ranger.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-palettier.md` §3, qui passent avant le brief là où elles diffèrent). CAP OL, GUIDAGE de CAP-C1.5 (mettre en
// stock). Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (allée, stock, produits, tirage, entrepôt d'un élève, fiche,
// phrases) : `contenus/action-ent811-donnees.js`. Activité : `activites/action-ranger.js`. Questions : `contenus/questions/ENT-8.11.js`. Corrigé :
// `contenus/corriges/ENT-8.11.js`.
//
// Un mardi, 13 h 30 (AUCUNE date écrite, décision de Tristan du 21/10/2026) : l'élève revient à Ensuès, chez Geodis, après Labastide et son site
// d'évaluation, et range le camion du matin. UN ÉCRAN PAR ÉTAPE (§0 bis d'ENT-8.3) :
//   ① la fiche « Lire une adresse » (l'étiquette dessinée d'un emplacement à gauche, adresse TIRÉE), envoyée à Samia ;
//   ② le Plan de l'entrepôt, mode `palettier` (lots 0, 1, 2 du chantier E-7) : 5 palettes (6 au confirmé), poser au sol, confier à Kevin au-dessus,
//      signaler P5 (le Terminal donne la nouvelle adresse), scanner (la palette, puis l'emplacement), « Faire monter les palettes », « Valider » ;
//   ③ Kevin écrit au geste « Faire monter » (COORDINATION n° 17) ; l'élève répond par PHRASES calculées sur ce qu'il a confié ; Kevin répond, et
//      ses palettes montent (`cariste.monte` lit sa réponse dans la base).
// Rien n'est jugé à l'écran (le Terminal et le système ne disent jamais « juste ») ; après « Valider », le nom du critère faux sur chaque carte
// (l'adresse attendue en plus chez l'accompagné) ; le bilan détaillé dit juste / à corriger. « Corriger » rouvre la fiche et le message à Kevin,
// jamais le rangement (figé à « Valider », `finFige`).
//
// VÉRIFIÉ : Action, l'entrepôt d'Ensuès-la-Redonne exploité par Geodis ; le matériel roulant, l'informatique et les méthodes appartiennent à
// Action, Geodis fournit le personnel (Gomet', relevé par Cowork, brief §2) ; les catégories de produits d'Action. Code du travail RECOPIÉ par
// Claude Code le 22/10/2026 sur code.travail.gouv.fr (le Code du travail numérique, qui reprend Légifrance ; Légifrance ne se lit pas par script) :
// art. L4121-1 (LEGIARTI000035640828, en vigueur depuis le 01/10/2017), en entier ; art. L4122-1 (LEGIARTI000006903153, en vigueur depuis le
// 01/05/2008), alinéas 1 et 3 (le 2e coupé « […] »).
// CONSTRUIT : voir l'en-tête de `contenus/action-ent811-donnees.js`, `MENTION` et `MENTION_ALLEE` (dits dans la séance et en pied des dessins).

import { apresFiche, apresGeste, apresMail, tous } from '../core/declencheurs.js';
import { etapesPalettier, palettesConfiees } from '../core/types/entrepot.js';
import { phrasesJustes } from '../core/phrases.js';
import { niveauEleve } from '../core/tirage.js';
import { QUESTIONS } from './questions/ENT-8.11.js';
import { ENTREPRISE as ENT_ACTION, EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, ech } from './action.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, FICHE_ID, PHRASES_ID, SUJETS, KEVIN_MAIL, SAMIA_MAIL, PRODUITS, PLAQUES, PALETTES_IDS, GESTE, unDe, gesteFait,
  entrepotDe, jeuDeBase, adresseFiche, lignesFiche, melangerPour, choixDemande, SALUTATIONS, POLITESSES, finsDe, MENTION_ALLEE,
} from './action-ent811-donnees.js';

export { ID, ENTREPOT_ID, FICHE_ID, PHRASES_ID };

export const ENTREPRISE = { ...ENT_ACTION, exercice: 'Bienvenue chez Geodis' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « un mardi, 13 h 30 », sans date
// Aucune date n'est écrite (ni dans les textes, ni dans un document) ; la Messagerie affiche pourtant l'horodatage de chaque message : on prend
// le DERNIER MARDI (aujourd'hui si on est mardi) à l'heure du scénario, plus le temps réellement passé depuis l'ouverture. Rien à recaler si la
// progression bouge.
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
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || gesteFait(db, `fiche:${id}:envoyer`);
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
export const rangementValide = (db) => !!(etatPlan(db) && etatPlan(db).valide);
const reponduKevin = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const nomDe = (db, id) => PRODUITS[jeuDeBase(db).produit[id]].nom;
const nb = (n) => Number(n).toLocaleString('fr-FR');

// ─────────────────────────────────────────────────────────────── les documents (dessins en traits, construits ; aucune image nouvelle)
const PIED_DESSIN = `Dessin construit pour l’exercice. ${MENTION_ALLEE}`;
const T = 'fill="none" stroke="#2b2824" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const TXT = 'stroke="none" fill="#2b2824"';
// Un code à barres décoratif, tiré des lettres de l'adresse (le même dessin pour la même adresse).
function codeBarres(a, x0, y0, largeur, haut) {
  const W = [];
  [...a].forEach((ch, i) => { const c = ch.charCodeAt(0); W.push(1 + (c % 3), 1 + ((c >> 2) % 2), 2 + ((c + i) % 2), 1); });
  const total = W.reduce((t, w) => t + w, 0), k = largeur / total;
  let x = x0, s = '';
  W.forEach((w, i) => { if (i % 2 === 0) s += `<rect x="${(x).toFixed(1)}" y="${y0}" width="${(w * k).toFixed(1)}" height="${haut}" fill="#2b2824"/>`; x += w * k; });
  return s;
}
// L'étiquette d'un emplacement, collée sur la lisse sous l'emplacement (flèche vers le haut).
export function svgEtiquette(a, legende = 'Collée sur la lisse du rack, sous l’emplacement (la flèche).') {
  return `<svg class="ac811-fig" viewBox="0 0 380 170" role="img" aria-label="Une étiquette d’emplacement collée sur une poutre de rack : l’adresse ${ech(a)}, un code-barres et une flèche vers le haut">
    <g ${T}><rect x="6" y="52" width="368" height="74" rx="3"/><path d="M6 60 H374 M6 118 H374" stroke-width="1.2"/>
      <rect x="44" y="64" width="300" height="50" rx="3" fill="#fdfbf7"/>
      <path d="M64 108 V74 M56 82 L64 72 L72 82" stroke-width="2.6"/></g>
    <text x="206" y="88" font-size="24" font-weight="800" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" ${TXT}>${ech(a)}</text>
    ${codeBarres(a, 96, 94, 220, 14)}
    <text x="190" y="152" font-size="12" text-anchor="middle" ${TXT}>${ech(legende)}</text></svg>`;
}
// La travée de face : 4 niveaux (le sol = niveau 1), 3 emplacements par niveau.
const SVG_TRAVEE = (() => {
  const yN = { 1: 228, 2: 172, 3: 116, 4: 60 }, X = [70, 160, 250, 340];
  let s = `<svg class="ac811-fig" viewBox="0 0 470 262" role="img" aria-label="Une travée de rack vue de face : quatre niveaux, le niveau 1 au sol, trois emplacements par niveau, numérotés 1, 2, 3 de gauche à droite">
    <defs><pattern id="ac811sol" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="#2b2824" stroke-width="1"/></pattern></defs>
    <rect x="40" y="230" width="330" height="10" fill="url(#ac811sol)" stroke="none"/>
    <g ${T}><path d="M70 230 V18 M340 230 V18"/>${[2, 3, 4].map((n) => `<path d="M70 ${yN[n]} H340" stroke-width="3.4"/>`).join('')}
      <path d="M40 230 H370"/><path d="M160 ${yN[4] - 4} V230 M250 ${yN[4] - 4} V230" stroke-dasharray="4 4" stroke-width="1.2"/></g>`;
  [1, 2, 3].forEach((e) => { s += `<text x="${(X[e - 1] + X[e]) / 2}" y="14" font-size="13" font-weight="700" text-anchor="middle" ${TXT}>E${e}</text>`; });
  s += `<text x="2" y="14" font-size="11" ${TXT}>emplacements</text>`;
  [1, 2, 3, 4].forEach((n) => {
    const y = n === 1 ? 210 : yN[n] - 22;
    s += `<text x="62" y="${y}" font-size="13" font-weight="700" text-anchor="end" ${TXT}>N${n}</text>`;
  });
  s += `<text x="350" y="208" font-size="12.5" ${TXT}>niveau 1 :</text><text x="350" y="222" font-size="12.5" ${TXT}>le sol (picking)</text>
    <path d="M356 62 V160" ${T} stroke-width="1.4"/><path d="M352 66 L356 58 L360 66" ${T} stroke-width="1.4"/>
    <text x="364" y="104" font-size="12.5" ${TXT}>niveaux 2 à 4 :</text><text x="364" y="118" font-size="12.5" ${TXT}>la réserve</text>
    <text x="205" y="256" font-size="12" text-anchor="middle" ${TXT}>L’adresse se lit : allée et côté – travée – niveau – emplacement.</text></svg>`;
  return s;
})();
// La plaque de charge, fixée au bout du rack (les plaques de l'allée, construites ; le sol n'en a pas).
const SVG_PANNEAU = `<svg class="ac811-fig" viewBox="0 0 380 240" role="img" aria-label="Le bout d’un rack ; un panneau y est fixé avec trois lignes : niveau 2, 1 500 kilos ; niveau 3, 1 200 kilos ; niveau 4, 1 000 kilos">
  <g ${T}><path d="M60 230 V10 M110 230 V10"/><path d="M60 40 L110 70 M110 70 L60 100 M60 100 L110 130 M110 130 L60 160 M60 160 L110 190" stroke-width="1.4"/>
    <path d="M20 230 H360"/><rect x="128" y="40" width="226" height="150" rx="6" fill="#fdfbf7" stroke-width="2.6"/><path d="M110 70 H128 M110 160 H128"/></g>
  <text x="241" y="66" font-size="15" font-weight="900" text-anchor="middle" ${TXT}>CHARGE MAX PAR NIVEAU</text>
  ${[2, 3, 4].map((n, i) => `<text x="150" y="${100 + i * 30}" font-size="16" ${TXT}>Niveau ${n}</text><text x="334" y="${100 + i * 30}" font-size="16" font-weight="800" text-anchor="end" ${TXT}>${nb(PLAQUES[n])} kg</text>`).join('')}
  </svg>`;
// Un chariot à mât rétractable vu de côté : le mât très haut, une palette au bout des fourches ; personne dans la cabine.
const SVG_CHARIOT = `<svg class="ac811-fig" viewBox="0 0 360 260" role="img" aria-label="Un chariot vu de côté, vide de conducteur : un mât très haut, une palette chargée tout en haut, au bout des fourches, au-dessus de deux bras posés au sol">
  <defs><pattern id="ac811sol2" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="#2b2824" stroke-width="1"/></pattern></defs>
  <rect x="10" y="246" width="340" height="8" fill="url(#ac811sol2)" stroke="none"/>
  <g ${T}><path d="M10 246 H350"/>
    <rect x="34" y="176" width="130" height="52" rx="6"/><circle cx="62" cy="234" r="12"/><circle cx="140" cy="234" r="8"/>
    <path d="M44 176 V118 H140 V176 M44 132 H140"/>
    <path d="M164 222 H306 M296 222 V240 M290 246 h12"/><circle cx="296" cy="240" r="6"/>
    <path d="M182 228 V20 M198 228 V20 M182 60 H198 M182 120 H198 M182 180 H198"/>
    <path d="M198 64 H216 V30 M216 64 H310"/>
    <rect x="218" y="54" width="92" height="10"/><rect x="222" y="16" width="40" height="38"/><rect x="266" y="16" width="40" height="38"/></g>
  </svg>`;
const dessin = (id, titre, svg, pied = PIED_DESSIN) => ({ id, titre, court: titre, html: `<article class="ac-doc" aria-label="${ech(titre)}">${svg}${PIED(pied)}</article>` });

// « Lire une adresse » (étape 1, à gauche de la fiche) : l'étiquette de L'ADRESSE TIRÉE et la travée de face.
export const DOC_LIRE = { id: 'lire-adresse', titre: 'Lire une adresse', court: 'Lire une adresse',
  html: (db) => `<article class="ac-doc" aria-label="Lire une adresse">
    <p class="ac-t">Lire une adresse</p><p class="ac-st">L’étiquette d’un emplacement, puis une travée vue de face.</p>
    ${svgEtiquette(adresseFiche(db))}${SVG_TRAVEE}${PIED(PIED_DESSIN)}</article>` };
const DOC_ETIQUETTE = dessin('etiquette', 'Une étiquette', svgEtiquette('A1-T02-N3-E1'));
const DOC_TRAVEE = dessin('travee', 'Une travée', SVG_TRAVEE);
const DOC_PANNEAU = dessin('panneau', 'Au bout du rack', SVG_PANNEAU);
const DOC_CHARIOT = dessin('chariot', 'Un chariot', SVG_CHARIOT, 'Dessin construit pour l’exercice.');
const DOC_STAGE = { id: 'stage', titre: 'Ton après-midi au rangement', court: 'Ton après-midi',
  html: `<article class="ac-doc" aria-label="Ton après-midi au rangement">
    <p class="ac-t">Ton après-midi au rangement</p>
    <p class="ac-st">Un mardi, 13 h 30</p>
    <p>Te revoilà en stage chez <b>Geodis</b>, à l’entrepôt Action d’Ensuès-la-Redonne, après Labastide et l’entrepôt de ton évaluation.</p>
    <p>Cet après-midi, tu ranges les palettes du camion de ce matin. Le système donne une <b>adresse</b> à chaque palette.</p>
    <p>Ta [[tutrice]] : <b>Samia</b>, cheffe d’équipe. <b>Kevin</b>, [[cariste]], monte les palettes en hauteur.</p>
    ${PIED('Samia et Kevin sont construits pour l’exercice.')}
  </article>` };
// q-materiel : deux lignes, fait VÉRIFIÉ (Gomet', relevé par Cowork le 21/10/2026, brief §2).
const DOC_ACTION_GEODIS = { id: 'action-geodis', titre: 'Action et Geodis à Ensuès', court: 'Action et Geodis',
  html: `<article class="ac-doc" aria-label="Action et Geodis à Ensuès">
    <p class="ac-t">Action et Geodis à Ensuès</p>
    <div class="ac-l"><span class="ac-n">1</span><p>L’entrepôt d’Ensuès-la-Redonne est celui d’<b>Action</b> : les chariots, l’informatique et les méthodes de travail appartiennent à Action.</p></div>
    <div class="ac-l"><span class="ac-n">2</span><p>C’est <b>Geodis</b>, une entreprise de logistique, qui fournit le personnel et fait tourner l’entrepôt pour Action.</p></div>
    ${PIED('D’après un article de Gomet’ sur le Parc des Aiguilles, à Ensuès-la-Redonne.')}
  </article>` };
// « Le droit » : C. trav. L4121-1 (en entier) et L4122-1 (alinéas 1 et 3), RECOPIÉS le 22/10/2026 (voir l'en-tête).
export const TEXTE_L4121_1 = ['L’employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs.',
  'Ces mesures comprennent :', '1° Des actions de prévention des risques professionnels, y compris ceux mentionnés à l’article L. 4161-1 ;',
  '2° Des actions d’information et de formation ;', '3° La mise en place d’une organisation et de moyens adaptés.',
  'L’employeur veille à l’adaptation de ces mesures pour tenir compte du changement des circonstances et tendre à l’amélioration des situations existantes.'];
export const TEXTE_L4122_1 = ['Conformément aux instructions qui lui sont données par l’employeur, dans les conditions prévues au règlement intérieur pour les '
  + 'entreprises tenues d’en élaborer un, il incombe à chaque travailleur de prendre soin, en fonction de sa formation et selon ses possibilités, de sa '
  + 'santé et de sa sécurité ainsi que de celles des autres personnes concernées par ses actes ou ses omissions au travail.', '[…]',
  'Les dispositions du premier alinéa sont sans incidence sur le principe de la responsabilité de l’employeur.'];
const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-t">Le droit : qui organise la sécurité ?</p>
    <p class="ac-art"><b>Code du travail, article L4121-1</b></p>
    <div class="ac-cite">${TEXTE_L4121_1.map((p, i) => `<p>${i === 0 ? '« ' : ''}${p}${i === TEXTE_L4121_1.length - 1 ? ' »' : ''}</p>`).join('')}</div>
    <p class="ac-art"><b>Code du travail, article L4122-1</b> (alinéas 1 et 3)</p>
    <div class="ac-cite">${TEXTE_L4122_1.map((p, i) => `<p>${i === 0 ? '« ' : ''}${p}${i === TEXTE_L4122_1.length - 1 ? ' »' : ''}</p>`).join('')}</div>
    ${PIED('Textes réels, recopiés du Code du travail numérique (code.travail.gouv.fr, qui reprend Légifrance), consulté le 22/10/2026.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-art{margin:10px 0 2px; font-size:.95rem}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ac-cite p{margin:0 0 4px}
.ac811-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px auto 10px; color:#2b2824}
.ac811-fig text{font-family:inherit}
`;
export const DOCUMENTS = [DOC_LIRE, DOC_ETIQUETTE, DOC_TRAVEE, DOC_PANNEAU, DOC_CHARIOT, DOC_STAGE, DOC_ACTION_GEODIS, DOC_DROIT];

// ─────────────────────────────────────────────────────────────── ① la fiche « Lire une adresse »
export const FICHE = {
  id: FICHE_ID, libelle: 'Lire une adresse', titre: 'Lire une adresse',
  sousTitre: 'L’étiquette est à gauche. Pour chaque morceau de l’[[adresse]], choisis ce qu’il veut dire.',
  documents: ['lire-adresse'], largeurDocs: 1.15,
  bouton: 'Ouvrir la fiche « Lire une adresse »',
  blocs: (db) => lignesFiche(adresseFiche(db)).map((l, i) => ({ type: 'liste', id: l.id, lib: `${i + 1}. ${l.lib}`, vide: 'Choisir…', manque: l.manque,
    choix: melangerPour(db, `fiche-${l.id}`, l.choix) })),
  envoi: { bouton: 'Envoyer à Samia', a: 'Samia', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ③ les phrases du message à Kevin, calculées UNE FOIS, à l'arrivée de son message
export const presentesDe = (db) => PALETTES_IDS.filter((id) => id !== 'P6' || niveauEleve(db) === 'confirme');
export const phrasesKevin = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'demande', choix: (d) => choixDemande(palettesConfiees(d, entrepotDe), presentesDe(d)), juste: 0 },
  { id: 'politesse', choix: POLITESSES.slice(), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jamais juste ni faux ; aucune date)
const SAMIA = { nom: EQUIPE.samia.nom, mail: SAMIA_MAIL }, KEVIN = { nom: EQUIPE.kevin.nom, mail: KEVIN_MAIL };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '13:30', { db: o.db, decalage: o.decalage || 0 }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const ACCUEIL_SAMIA = 'Cet après-midi, tu ranges le camion de ce matin. Le système donne une adresse à chaque palette. Au sol, tu ranges ; plus haut, '
  + 'c’est Kevin. Et tu scannes toujours.';
export const CONSIGNE_SAMIA = 'Prends une palette, va à son adresse. Niveau 1 : tu poses. Plus haut : tu vérifies la plaque, puis tu confies à Kevin. Et tu '
  + 'scannes : la palette, puis l’emplacement.';
export const MONTER_SAMIA = 'Avant de valider, clique « Faire monter les palettes » et réponds à Kevin : une palette qui n’est pas montée ne compte pas comme rangée.';
export const SIGNALEMENT_SAMIA = 'C’est noté. Suis ce que te dit le Terminal.';
export const KEVIN_DEMANDE = 'Tu as des palettes pour moi ?';
export const KEVIN_MONTE = 'OK, je monte ça tout de suite.';
export const FIN_SAMIA = 'Demain matin, 6 h : inventaire tournant dans cette allée.';
const SIGNALER_TOUT = unDe(...PALETTES_IDS.map((id) => apresGeste(GESTE(`signaler:${id}`))));
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(SAMIA, prenom, SUJETS.accueil,
    `Bonjour ${prenom} ! Te revoilà à Ensuès, après Labastide et l’entrepôt de ton évaluation.\n\n${ACCUEIL_SAMIA.replace('une adresse', 'une [[adresse]]')}\n\n`
      + 'D’abord, la fiche « Lire une adresse ».\n\nSamia',
    { heure: '13:30', extra: { ouvreFiche: FICHE_ID } })] }),
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '14:10' })] }),
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(KEVIN, prenom, 'Bien reçu', 'Bien reçu.\n\nKevin', { db, heure: '14:10' })] }),
  },
  declencheurs: [
    // La fiche envoyée (juste ou non) : au rack. Les deux documents des questions de Samia sont joints.
    { id: 'rack', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.rack,
        `Bien reçu. Maintenant, au rack !\n\n${CONSIGNE_SAMIA.replace('la plaque', 'la [[plaque de charge|plaque]]').replace('confies à Kevin', 'confies à Kevin, le [[cariste]]')}\n\n${MONTER_SAMIA}\n\n`
          + 'Je te joins deux documents à lire : « Action et Geodis à Ensuès » et « Le droit ».\n\nSamia',
        { db, heure: '13:40', extra: { pieces: ['action-geodis', 'droit'] } })] }) },
    // Le premier signalement, QUEL QU'IL SOIT (juste ou à tort) : le même commentaire ; la nouvelle adresse vient du Terminal, jamais de Samia.
    { id: 'signalement', quand: SIGNALER_TOUT,
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.signalement, `${SIGNALEMENT_SAMIA}\n\nSamia`, { db, heure: '13:50' })] }) },
    // Kevin écrit au geste « Faire monter les palettes » (COORDINATION n° 17) ; si l'élève a validé sans l'avoir fait, à « Valider » (personne
    // n'est bloqué : le message à Kevin se renvoie, mais le rangement est figé et ses palettes ne sont pas montées). Les phrases sont calculées
    // ICI, sur les palettes qu'il a confiées.
    { id: 'kevin', quand: unDe(apresGeste(GESTE('monter')), apresGeste(GESTE('valider'))),
      semer: (prenom, db) => ({ mails: [mail(KEVIN, prenom, SUJETS.kevin,
        `Salut ${prenom} ! ${KEVIN_DEMANDE}\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nKevin`,
        { db, heure: '14:00', extra: { phrases: phrasesKevin(prenom) } })] }) },
    // La réponse envoyée : Kevin monte (`kevinMonte`, lu par la vue, regarde ce message).
    { id: 'kevin-monte', quand: apresMail({ a: KEVIN.mail }),
      semer: (prenom, db) => ({ mails: [mail(KEVIN, prenom, SUJETS.monte, `${KEVIN_MONTE}\n\nKevin`, { db, heure: '14:02' })] }) },
    { id: 'fin', quand: tous(apresGeste(GESTE('valider')), apresMail({ a: KEVIN.mail })),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.fin, `Merci ${prenom}. ${FIN_SAMIA}\n\nSamia`, { db, heure: '14:15' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 21/10/2026, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant l'envoi (fiche, phrases) ni avant « Valider » (plan) : l'inaction
// vaut 0 (`charge` et `pasPoseHaut` ne sont comptés que si toutes les palettes sont traitées). Le plan n'a pas d'`ecran` : il ne se rouvre pas.
export const GROUPES = { adresse: 'Lire une adresse', sol: 'Ranger au niveau 1', plaque: 'La plaque de charge', kevin: 'Passer la main à Kevin',
  scan: 'Scanner', forme: 'Le message à Kevin' };
export const POIDS = {
  'adresse-cote': 1, 'adresse-travee': 1, 'adresse-niveau': 1,
  'place-P1': 2, 'place-P2': 2,
  'signale-P5': 2, charge: 1,
  'place-P3': 1, 'place-P4': 1, pasPoseHaut: 0,
  'scan-P1': 0.6, 'scan-P2': 0.6, 'scan-P3': 0.6, 'scan-P4': 0.6, 'scan-P5': 0.6,
  'kevin-forme': 1,
};
// Le titre (le même pour tous : la liste vient de la déclaration de référence) et le titre du bilan (le produit de L'ÉLÈVE).
const avecNom = (id, quoi) => [`${id} ${quoi}`, (db) => `${id} (${nomDe(db, id)}) ${quoi}`];
const PLAN_JALON = {
  'place-P1': [GROUPES.sol, ...avecNom('P1', 'posée au sol, à son adresse')],
  'place-P2': [GROUPES.sol, ...avecNom('P2', 'posée au sol, à son adresse')],
  'signale-P5': [GROUPES.plaque, ...avecNom('P5', 'signalée, puis rangée à sa nouvelle adresse')],
  charge: [GROUPES.plaque, 'Aucune palette au-delà d’une plaque de charge'],
  'place-P3': [GROUPES.kevin, ...avecNom('P3', 'confiée à Kevin à son adresse, et montée')],
  'place-P4': [GROUPES.kevin, ...avecNom('P4', 'confiée à Kevin à son adresse, et montée')],
  pasPoseHaut: [null, 'Aucune palette posée soi-même au-dessus du sol'],
  ...Object.fromEntries(['P1', 'P2', 'P3', 'P4', 'P5'].map((id) => [`scan-${id}`, [GROUPES.scan, ...avecNom(id, 'scannée à son adresse')]])),
};
const ORDRE = ['place-P1', 'place-P2', 'signale-P5', 'charge', 'place-P3', 'place-P4', 'pasPoseHaut', 'scan-P1', 'scan-P2', 'scan-P3', 'scan-P4', 'scan-P5'];
function jalonsPlan() {
  const L = etapesPalettier(entrepotDe);
  const socle = L.filter((e) => !e.bonus), bonus = L.filter((e) => e.bonus);
  const ids = socle.map((e) => e.id);
  const manque = ORDRE.filter((id) => !ids.includes(id)), deTrop = ids.filter((id) => !ORDRE.includes(id));
  if (manque.length || deTrop.length) {
    throw new Error(`ENT-8.11 : les jalons du plan ne sont pas ceux attendus (manquent : ${manque.join(', ') || '—'} ; en trop : ${deTrop.join(', ') || '—'})`
      + ' — le scan (lot 2 du chantier E-7) est-il livré ?');
  }
  const S = ORDRE.map((id) => {
    const e = socle.find((x) => x.id === id), [groupe, titre, titreBilan] = PLAN_JALON[id];
    // `pasPoseHaut` : la garde non notée (poids 0, COORDINATION n° 5), sans ligne au bandeau (`compte: false`) : une tentative de pose en hauteur
    // est refusée par la vue et reste en trace, elle n'enlève rien (brief §5).
    if (id === 'pasPoseHaut') return Object.assign(e, { titre, poids: 0, compte: false });
    return Object.assign(e, { titre, titreBilan: titreBilan || titre, groupe, poids: POIDS[id] });
  });
  // Les bonus du confirmé (P6) : sans poids ni groupe, `null` chez qui n'a pas P6.
  return [...S, ...bonus.map((e) => Object.assign(e, { titre: e.id === 'place-P6' ? 'P6 confiée à son adresse (bonus)' : 'P6 scannée à son adresse (bonus)' }))];
}
const jalonFiche = (l) => ({ id: `adresse-${l}`, titre: `Lire une adresse : la ligne « ${l} »`, groupe: GROUPES.adresse, poids: POIDS[`adresse-${l}`],
  ecran: `fiche:${FICHE_ID}`,
  titreBilan: (db) => { const L = lignesFiche(adresseFiche(db)).find((x) => x.id === l); return `Lire une adresse : ${L.lib}`; },
  verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return valeurDe(db, FICHE_ID, l) === l ? ok : ko; } });
export const ETAPES = [
  ...['cote', 'travee', 'niveau'].map(jalonFiche),
  ...jalonsPlan(),
  { id: 'kevin-forme', titre: 'Le message à Kevin : la salutation et la politesse', groupe: GROUPES.forme, poids: POIDS['kevin-forme'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return ['salutation', 'politesse'].every((l) => r.justes.includes(l)) ? ok : ko; } },
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'fiche', libelle: 'Lire une adresse', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'entrepot', libelle: 'Ranger les palettes', fait: rangementValide },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Répondre à Kevin', fait: reponduKevin },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_811 = {
  ...LEXIQUE,
  adresse: 'Le code qui dit où ranger une palette : allée et côté, travée, niveau, emplacement (par exemple A1-T03-N2-E1).',
  allée: 'Couloir entre deux rangées de racks. Chaque allée a deux côtés (A1 et A2 pour l’allée A).',
  travée: 'Une tranche de rack entre deux montants, numérotée le long de l’allée (T01, T02…).',
  niveau: 'Un étage du rack. Le niveau 1, c’est le sol ; les niveaux 2, 3, 4 sont au-dessus.',
  emplacement: 'La place d’une palette sur un niveau d’une travée (E1, E2, E3 de gauche à droite).',
  picking: 'Les emplacements au sol où les préparateurs prennent les cartons des commandes.',
  réserve: 'Les niveaux au-dessus du sol : on y stocke des palettes pleines, qu’on descend quand le picking se vide.',
  'plaque de charge': 'Panneau fixé au bout du rack qui dit combien de kilos chaque niveau peut porter au plus.',
  scanner: 'Lire un code-barres avec le terminal, pour que le système enregistre où est la palette.',
  cariste: 'Personne qui conduit un chariot élévateur pour charger, décharger et ranger les palettes.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), les catégories de produits d’Action, le '
  + 'Code du travail. Construits pour l’exercice : l’allée, les adresses, les plaques de charge et le stock (Action et Geodis ne publient pas '
  + 'l’organisation de l’entrepôt d’Ensuès), Samia, Kevin et Julie, le camion du jour, les produits (sans marque) et leurs poids, le terminal et ses messages.';
export const ACCUEIL = {
  titre: 'Ranger à la bonne adresse',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Lire une adresse', 'La fiche, avec l’étiquette à gauche.'],
    ['② Ranger les palettes', 'Plan de l’entrepôt : prends une palette, va à son adresse, pose ou confie à Kevin, scanne.'],
    ['③ Répondre à Kevin', 'Il t’écrit quand tu fais monter les palettes. Une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Ton rangement est validé : il ne se refait pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 11 : ranger à la bonne adresse',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_811,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  entrepot: entrepotDe,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  fermetures: {
    entrepot: { ouvertSi: (db) => dejaEnvoyee(FICHE_ID)(db), message: 'Après la fiche « Lire une adresse »' },
  },
};