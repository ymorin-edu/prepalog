// ENT-8.9 — Action, « la palette de Lucas » : le contenu de la séance (brief `docs/briefs/ENT-8.9-action-labastide-reception.md` ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-action.md` §8.2 et §8.5). CAP OL, ENTRAÎNEMENT de CAP-C1.3 et CAP-C1.4, avec une ERREUR INDUITE (la palette
// de peluches acceptée sans réserve par Lucas). Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (protocole, tirage,
// quai d'un élève, dialogue, fiche, phrases calculées) : `contenus/action-ent89-donnees.js`. Activité : `activites/action-palette-lucas.js`.
// Questions : `contenus/questions/ENT-8.9.js`. Corrigé : `contenus/corriges/ENT-8.9.js`.
//
// Vendredi 18 décembre, 7 h (aucune année écrite), le lendemain d'ENT-8.4 : deuxième PFMP, chez GXO à l'entrepôt Action de Labastide-Saint-Pierre ;
// tuteur Romain. L'élève fait TOUTE la réception seul, puis traite l'erreur de Lucas. UN ÉCRAN PAR ÉTAPE (§0 bis d'ENT-8.3) :
//   ① Au quai : accueillir le chauffeur (vue Dialogue à choix, face à face, Jan, phrases courtes) ;
//   ② le quai 5 (quai iso COMPLET : inspection sur la scène, 2 anomalies TIRÉES, rien n'arrête ; Lucas décharge, l'élève choisit la case de chaque
//      palette ; contrôle des 4 palettes, aides de comptage éteintes ; réserves sur le « Bon de livraison — lettre de voiture », signature de Jan) ;
//   ③ la palette de Lucas (fiche, le document signé par Lucas, la palette, le calendrier et « Le droit » à gauche ; date de réception TIRÉE) ;
//   ④ rendre compte à Romain (phrases calculées sur CE QUE L'ÉLÈVE A FAIT au quai et répondu à la fiche).
// Rien n'est jugé à l'écran (sauf les réactions de Jan et de Lucas, qui ne disent ni juste ni faux) ; le bilan détaillé dit juste / à corriger.
//
// VÉRIFIÉ : Action, l'entrepôt de Labastide-Saint-Pierre exploité par GXO (brief ENT-8.3 §2). Code de commerce RECOPIÉ sur Légifrance par Claude Code
// le 17/10/2026 (WebFetch) : art. L133-1, alinéas 1 et 2 (LEGIARTI000006220288, en vigueur depuis le 21/09/2000) ; art. L133-3, 1er alinéa
// (LEGIARTI000021486442, en vigueur depuis le 10/12/2009), texte identique à celui d'ENT-8.8. Le brief appelait « 1er alinéa » de L133-1 la phrase
// sur la perte ET les avaries : sur Légifrance, ce sont deux alinéas (perte : 1er ; avaries : 2e) ; les deux sont écrits.
// CONSTRUIT : voir l'en-tête de `contenus/action-ent89-donnees.js` et `MENTION`.

import { apresFiche, apresMail, dialogueFini } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.9.js';
import { ENTREPRISE as ENT_ACTION, VOCAB as VOCAB_ACTION, LEXIQUE, STYLE_DOCUMENTS, PIED, PIED_RECONSTITUTION, ech, protocoleSecurite, STYLE_PROTOCOLE } from './action.js';
import {
  ID, ID_VOLET, QUAI_ID, FICHE_ID, DIALOGUE, PHRASES_ID, DOCUMENT, BL_LUCAS, SPEC_PROTOCOLE, REPLIQUES, JUSTES_DIALOGUE, FIN_DIALOGUE, LIGNES_LUCAS,
  CONSIGNE_ROMAIN, PALETTES, jeuDeBase, duRole, conformes, quaiDe, quaiDeBase, dateLucas, justeLucas, melangerPour, phrasesCompteRendu,
} from './action-ent89-donnees.js';

export { ID, QUAI_ID, FICHE_ID, PHRASES_ID };

// L'entreprise de CETTE séance : l'entrepôt de Labastide, exploité par GXO (comme ENT-8.3 et 8.4 ; le reste de l'univers d'Action est commun).
export const ENTREPRISE = { ...ENT_ACTION, sousTitre: 'Entrepôt GXO de Labastide-Saint-Pierre (82) — commerce à petits prix', exercice: 'Bienvenue chez GXO' };
export const VOCAB = { ...VOCAB_ACTION, mailDomain: 'gxo-labastide.example' };
const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// ─────────────────────────────────────────────────────────────── l'heure du scénario (vendredi 18 décembre, aucune année écrite)
// Le 18 décembre de l'année scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l'année d'avant), comme ENT-8.4.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 11, 18, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const signe = (db) => !!(etatQuai(db) && etatQuai(db).signe);
export const clos = (db) => !!(etatQuai(db) && etatQuai(db).fini);
const inspectionFigee = (db) => !!(etatQuai(db) && etatQuai(db).securite && etatQuai(db).securite.fait);
const deposeFinie = (db) => { const e = etatQuai(db); return !!(e && e.depose && PALETTES.every((p) => e.depose[p.id] && e.depose[p.id].pose)); };
const envoye = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });

// ─────────────────────────────────────────────────────────────── les documents (reconstitués, dessins en traits ; aucune image nouvelle)
const PIED_DESSIN = 'Dessin construit pour l’exercice.';
const T = 'fill="none" stroke="#2b2824" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const TXT = 'stroke="none" fill="#2b2824"';
export const DOC_PROTOCOLE = { id: 'protocole-quai5', titre: 'Protocole de sécurité — quai 5', court: 'Le protocole du quai 5', html: protocoleSecurite(SPEC_PROTOCOLE) };
const DOC_PROTOCOLE_ENTETE = { id: 'protocole-entete', titre: 'Un protocole de sécurité', court: 'Un protocole', html: protocoleSecurite(SPEC_PROTOCOLE, { entete: true }) };

// « Le droit » : L133-1 (alinéas 1 et 2) et L133-3 (1er alinéa), RECOPIÉS de Légifrance le 17/10/2026 (voir l'en-tête).
export const TEXTE_L133_1 = ['Le voiturier est garant de la perte des objets à transporter, hors les cas de la force majeure.',
  'Il est garant des avaries autres que celles qui proviennent du vice propre de la chose ou de la force majeure.'];
export const TEXTE_L133_3 = 'La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois '
  + 'jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire '
  + 'ou par lettre recommandée, sa protestation motivée.';
export const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-gros">LE DROIT</p>
    <p class="ac-st">Deux textes du Code de commerce (le voiturier = le transporteur)</p>
    <p class="ac-art"><b>Code de commerce, article L133-1</b> (alinéas 1 et 2)</p>
    <div class="ac-cite"><p>« ${TEXTE_L133_1[0]}</p><p>${TEXTE_L133_1[1]} »</p></div>
    <p class="ac-art"><b>Code de commerce, article L133-3</b> (1er alinéa)</p>
    <p class="ac-cite">« ${TEXTE_L133_3} »</p>
    ${PIED('Textes réels, recopiés de Légifrance (consulté le 17/10/2026).')}
  </article>` };

// Le document signé par Lucas (reconstitué) : la date de réception est celle tirée pour l'élève ; la case « Réserves » est VIDE.
const SIGNATURE = (d) => `<svg class="ac89-sig" viewBox="0 0 120 34" aria-hidden="true"><path d="${d}" ${T} stroke-width="1.8"/></svg>`;
const SIG_LUCAS = SIGNATURE('M4 24 C10 6 14 6 16 22 C18 30 24 10 30 18 C34 24 38 22 44 14 M44 14 C50 26 58 26 64 16 C70 8 76 24 84 20 L112 16');
const SIG_CHAUFFEUR = SIGNATURE('M6 18 C14 4 22 30 30 16 C36 6 40 28 50 18 C58 10 62 22 70 20 C80 18 90 8 100 22 L114 24');
export const DOC_BL_LUCAS = { id: 'bl-lucas', titre: 'Le document signé par Lucas', court: 'Le document de Lucas',
  html: (db) => { const d = dateLucas(db); return `<article class="ac-doc" aria-label="Le document signé par Lucas">
    <p class="ac-gros">BON DE LIVRAISON — LETTRE DE VOITURE</p>
    <p class="ac-st">N° <b>${ech(BL_LUCAS)}</b> · transport par route</p>
    <dl class="ac-dl">
      <dt>Expéditeur</dt><dd>Un fournisseur de jouets</dd>
      <dt>Destinataire</dt><dd>Entrepôt Action / GXO, Labastide-Saint-Pierre</dd>
      <dt>Marchandise</dt><dd>1 palette : peluches, 24 cartons</dd>
      <dt>Reçu le</dt><dd><b class="ac89-date">${ech(d.jour)}</b></dd>
    </dl>
    <p class="ac-st"><b>Réserves du destinataire</b></p>
    <div class="ac-res" aria-label="Case réserves, vide"></div>
    <div class="ac89-sigs">
      <p>Le destinataire : <b>Lucas</b>${SIG_LUCAS}</p>
      <p>Le chauffeur${SIG_CHAUFFEUR}</p>
    </div>
    ${PIED(`${PIED_RECONSTITUTION} Noms du fournisseur et du transporteur non donnés.`)}
  </article>`; } };

// La palette de peluches vue de dos : 4 couches de 3 cartons, 3 cartons écrasés (coins enfoncés, plis).
const carton = (x, y, ecrase) => `<rect x="${x}" y="${y}" width="66" height="36" rx="2"/>${ecrase
  ? `<path d="M${x + 6} ${y} L${x + 18} ${y + 14} L${x + 34} ${y + 8} L${x + 46} ${y + 20} L${x + 60} ${y}" stroke-width="1.8"/><path d="M${x + 14} ${y + 26} L${x + 26} ${y + 20} M${x + 40} ${y + 30} L${x + 52} ${y + 24}" stroke-width="1.4"/>` : ''}`;
const ECRASES = new Set(['0,1', '2,2', '1,3']);
const SVG_PALETTE_LUCAS = `<svg class="ac89-fig" viewBox="0 0 300 230" role="img" aria-label="Dessin de la palette de peluches vue de dos : quatre couches de trois cartons ; trois cartons sont écrasés">
  <text x="20" y="18" font-size="13" ${TXT}>Face arrière de la palette de peluches</text>
  <g ${T}>${[0, 1, 2, 3].map((k) => [0, 1, 2].map((i) => carton(30 + i * 70, 30 + (3 - k) * 38, ECRASES.has(`${i},${k}`))).join('')).join('')}
    <rect x="24" y="182" width="222" height="10"/><path d="M34 192 V206 M135 192 V206 M236 192 V206 M24 206 H246"/></g>
  <text x="20" y="224" font-size="12" ${TXT}>3 cartons écrasés sur la face arrière</text></svg>`;
export const DOC_PALETTE_LUCAS = { id: 'palette-lucas', titre: 'La palette de Lucas', court: 'La palette',
  html: `<article class="ac-doc" aria-label="La palette de Lucas">${SVG_PALETTE_LUCAS}${PIED(PIED_DESSIN)}</article>` };

// Le calendrier de la semaine : lundi 14 → vendredi 18 décembre, aujourd'hui (vendredi 18) entouré. Aucun jour férié, aucun dimanche.
const JOURS_SEMAINE = [['lundi', 14], ['mardi', 15], ['mercredi', 16], ['jeudi', 17], ['vendredi', 18]];
const SVG_CALENDRIER = `<svg class="ac89-fig" viewBox="0 0 360 150" role="img" aria-label="Calendrier de la semaine : lundi 14, mardi 15, mercredi 16, jeudi 17, vendredi 18 décembre ; vendredi 18, aujourd’hui, est entouré">
  <text x="180" y="18" font-size="14" font-weight="700" text-anchor="middle" ${TXT}>Décembre — cette semaine</text>
  <g ${T}>${JOURS_SEMAINE.map(([j, n], i) => `<rect x="${12 + i * 68}" y="30" width="64" height="76" rx="3"/>`).join('')}
    <ellipse cx="${12 + 4 * 68 + 32}" cy="72" rx="40" ry="50" stroke-width="3"/></g>
  ${JOURS_SEMAINE.map(([j, n], i) => `<text x="${44 + i * 68}" y="52" font-size="12" text-anchor="middle" ${TXT}>${j}</text><text x="${44 + i * 68}" y="90" font-size="26" font-weight="800" text-anchor="middle" ${TXT}>${n}</text>`).join('')}
  <text x="${44 + 4 * 68}" y="140" font-size="13" font-weight="700" text-anchor="middle" ${TXT}>aujourd’hui</text>
  <text x="12" y="140" font-size="12" ${TXT}>Pas de jour férié cette semaine.</text></svg>`;
export const DOC_CALENDRIER = { id: 'calendrier', titre: 'Le calendrier', court: 'Le calendrier',
  html: `<article class="ac-doc" aria-label="Le calendrier de la semaine">${SVG_CALENDRIER}${PIED(PIED_DESSIN)}</article>` };

const DOC_STAGE = { id: 'stage', titre: 'Ton stage à la réception', court: 'Ton stage',
  html: `<article class="ac-doc" aria-label="Ton stage à la réception">
    <p class="ac-t">Ton stage à la réception</p>
    <p class="ac-st">Vendredi 18 décembre, 7 h</p>
    <p>Tu es en stage (PFMP) chez <b>GXO</b>, à l’entrepôt Action de Labastide-Saint-Pierre. Ce matin, tu reçois <b>seul</b> un camion de jouets, au <b>quai 5</b>.</p>
    <p>Ton [[tuteur]] : <b>Romain</b>, chef d’équipe. <b>Lucas</b>, cariste, décharge. <b>Inès</b>, agent administratif. Le chauffeur s’appelle <b>Jan</b> : il parle un peu français.</p>
    ${PIED('Romain, Lucas, Inès et Jan sont construits pour l’exercice.')}
  </article>` };
// Trois pictogrammes du protocole, sans légende (Avant de commencer, `pictogramme`) : une clé, une personne qui marche sur l'allée hachurée, un
// local avec une chaise. Dessins en traits CONSTRUITS par Claude Code.
const SVG_PICTOS = `<svg class="ac89-fig" viewBox="0 0 330 120" role="img" aria-label="Trois petits dessins dans des carrés : une clé ; une personne qui marche sur un passage hachuré ; une petite maison avec une chaise">
  <defs><pattern id="ac89h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V6" stroke="#2b2824" stroke-width="1.2"/></pattern></defs>
  <g ${T}>
    <rect x="10" y="10" width="96" height="96" rx="8"/><circle cx="40" cy="58" r="14"/><path d="M54 58 H92 M80 58 V70 M88 58 V68"/>
    <rect x="117" y="10" width="96" height="96" rx="8"/><rect x="128" y="84" width="74" height="14" fill="url(#ac89h)"/>
    <circle cx="165" cy="26" r="6"/><path d="M165 33 V58 M165 40 L152 50 M165 40 L178 48 M165 58 L154 78 M165 58 L176 78"/>
    <rect x="224" y="10" width="96" height="96" rx="8"/><path d="M240 54 L272 28 L304 54 V96 H240 Z"/><path d="M262 96 V74 H282 V96 M262 80 V66"/>
  </g></svg>`;
const DOC_PICTOS = { id: 'pictos', titre: 'Trois dessins du protocole', court: 'Trois dessins',
  html: `<article class="ac-doc" aria-label="Trois dessins du protocole">${SVG_PICTOS}${PIED(PIED_DESSIN)}</article>` };
// Une palette pleine (Avant de commencer, `couches`) : rien à compter (colonnes coupées par « … »).
const rangee = (y, txt) => `${[20, 78, 136].map((x) => `<rect x="${x}" y="${y}" width="52" height="34" rx="2"/>`).join('')}
    <text x="214" y="${y + 23}" font-size="20" ${TXT} text-anchor="middle">…</text><rect x="246" y="${y}" width="52" height="34" rx="2"/>
    <text x="312" y="${y + 22}" font-size="13" ${TXT}>${txt}</text>`;
const SVG_PALETTE_PLEINE = `<svg class="ac89-fig" viewBox="0 0 440 210" role="img" aria-label="Dessin d’une palette pleine vue de face : des couches de cartons toutes complètes, posées sur une palette en bois">
  <g ${T}>${rangee(20, 'couche du dessus')}${rangee(58, 'couche')}${rangee(96, 'couche')}${rangee(134, 'couche')}
    <rect x="14" y="172" width="290" height="10"/><path d="M24 182 V196 M159 182 V196 M294 182 V196 M14 196 H304"/></g>
  <text x="14" y="16" font-size="13" ${TXT}>Toutes les couches ont le même nombre de cartons.</text></svg>`;
const DOC_PALETTE_PLEINE = { id: 'palette-pleine', titre: 'Une palette pleine', court: 'Une palette pleine',
  html: `<article class="ac-doc" aria-label="Une palette pleine">${SVG_PALETTE_PLEINE}${PIED(PIED_DESSIN)}</article>` };
// La cale, les feux de quai, un carton écrasé : dessins en traits (même dessin qu'ENT-8.7 / 8.8, recopié : séances cloisonnées).
const SVG_CALE = `<svg class="ac89-fig" viewBox="0 0 280 170" role="img" aria-label="Une roue de remorque, et un objet en forme de coin posé au sol contre le pneu" ${T}>
  <defs><pattern id="ac89sol" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="#2b2824" stroke-width="1"/></pattern></defs>
  <rect x="10" y="146" width="260" height="12" fill="url(#ac89sol)" stroke="none"/><path d="M10 146 H270"/>
  <path d="M20 26 H260 V58 H20 Z"/><path d="M70 58 V64 M170 58 V64"/>
  <circle cx="120" cy="104" r="42"/><circle cx="120" cy="104" r="26"/><circle cx="120" cy="104" r="7"/>
  <path d="M163 146 L222 146 L163 104 Z"/><path d="M175 140 L203 140"/></svg>`;
const SVG_FEUX = `<svg class="ac89-fig" viewBox="0 0 280 170" role="img" aria-label="Une porte de quai fermée vue de dehors ; à côté, un boîtier à deux feux, celui du haut allumé" ${T}>
  <path d="M10 160 H270"/><path d="M30 20 H170 V160 M30 20 V160"/>
  <path d="M30 45 H170 M30 70 H170 M30 95 H170 M30 120 H170"/>
  <rect x="200" y="40" width="40" height="80" rx="6"/>
  <circle cx="220" cy="62" r="12"/><circle cx="220" cy="98" r="12"/>
  <path d="M220 62 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" fill="#2b2824"/>
  <path d="M220 40 V30 M240 48 L248 42 M200 48 L192 42 M244 62 H254 M186 62 H196"/>
  <path d="M220 120 V160"/></svg>`;
const SVG_CARTON = `<svg class="ac89-fig" viewBox="0 0 320 230" role="img" aria-label="Dessin d’un carton dont le coin avant est enfoncé et plié">
  <g ${T}>
    <path d="M40 90 L100 50 L270 50 L232 76 L168 90 Z"/><path d="M160 50 L100 90" stroke-dasharray="6 5"/>
    <path d="M40 90 H168 L188 124 L210 132 V210 H40 Z"/>
    <path d="M210 132 L232 76 L270 50 V170 L210 210"/>
    <path d="M168 90 L188 124 L232 76 M188 124 L210 132"/>
    <path d="M182 100 L196 96 M186 108 L206 98 M192 116 L216 92" stroke-width="1.6"/>
  </g>
  <text x="20" y="24" font-size="13" ${TXT}>Un carton reçu sur une palette</text></svg>`;
const dessin = (id, titre, svg) => ({ id, titre, court: titre, html: `<article class="ac-doc" aria-label="${titre}"><p class="ac-t">${titre}</p>${svg}${PIED(PIED_DESSIN)}</article>` });

export const STYLE = `${STYLE_DOCUMENTS}${STYLE_PROTOCOLE}
.ac-gros{margin:0 0 4px; font-size:1.3rem; font-weight:900; letter-spacing:.04em}
.ac-dl{display:grid; grid-template-columns:max-content 1fr; gap:5px 14px; margin:6px 0 10px; font-size:1rem}
.ac-dl dt{font-weight:700}
.ac-dl dd{margin:0}
.ac-res{border:1.5px solid #555047; min-height:34px; margin:2px 0 8px; border-radius:2px}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ac-cite p{margin:0 0 4px}
.ac89-date{font-size:1.15rem}
.ac89-sigs{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:2px 0 6px; font-size:.9rem}
.ac89-sigs p{margin:0; border-top:1px dashed #555047; padding-top:3px}
.ac89-sig{display:block; width:110px; height:auto; margin-top:2px}
.ac89-fig{display:block; width:100%; max-width:420px; height:auto; margin:4px auto 8px; color:#2b2824}
.ac89-fig text{font-family:inherit}
`;
export const DOCUMENTS = [DOC_PROTOCOLE, DOC_DROIT, DOC_BL_LUCAS, DOC_PALETTE_LUCAS, DOC_CALENDRIER, DOC_STAGE, DOC_PROTOCOLE_ENTETE, DOC_PICTOS,
  DOC_PALETTE_PLEINE, dessin('dessin-cale', 'Devant la roue', SVG_CALE), dessin('dessin-feux', 'À côté de la porte de quai', SVG_FEUX),
  dessin('carton-ecrase', 'Un carton', SVG_CARTON)];

// ─────────────────────────────────────────────────────────────── ① « Au quai » : accueillir Jan (face à face, vouvoiement)
// La vue Dialogue n'affiche aucun document (`core/types/dialogue.js` : seulement la `situation`, en texte) : le protocole du quai 5 est donc dit
// en une phrase dans la situation (COORDINATION §8.5, solution de repli), et joint au premier message de Romain.
export const ROMAIN_ACCUEIL = 'Ce matin, tu reçois seul le camion de jouets, quai 5, 7 h. Tu connais le protocole : il est au mur du quai. Ensuite, j’aurai une question sur un camion d’hier.';
export const TELEPHONE = {
  face: true,
  libelle: 'Au quai',
  situation: 'Romain : « Ce matin, tu reçois seul le camion de jouets, quai 5, 7 h. » '
    + 'Au mur du quai 5, le protocole : moteur coupé, clés remises au réceptionnaire, le chauffeur attend au local chauffeurs. Va accueillir Jan.',
  dialogues: [{ id: DIALOGUE, de: 'jan', contact: { nom: 'Jan', detail: 'chauffeur, camion de jouets' }, repliques: REPLIQUES, fin: FIN_DIALOGUE }],
};
export const EQUIPE_89 = {
  romain: { nom: 'Romain', role: 'chef d’équipe à la réception (ton tuteur)', appel: 'Romain', registre: 'tu' },
  lucas: { nom: 'Lucas', role: 'cariste', appel: 'Lucas', registre: 'tu' },
  ines: { nom: 'Inès', role: 'agent administratif', appel: 'Inès', registre: 'tu' },
  jan: { nom: 'Jan', role: 'chauffeur, camion de jouets', appel: 'Jan', registre: 'vous' },
};

// ─────────────────────────────────────────────────────────────── ③ la fiche « La palette de Lucas »
export const INES_LUCAS = 'regarde : la palette de peluches reçue par Lucas a des cartons écrasés. Lucas l’a acceptée sans réserve. Dis-nous ce qu’on fait.';
// Boutons radio l'un sous l'autre (`choix`, `colonne`) et non une liste déroulante : les réponses font jusqu'à 90 signes (même raison qu'ENT-8.7).
export const FICHE = {
  id: FICHE_ID, libelle: 'La palette de Lucas', titre: 'La palette de Lucas',
  sousTitre: `Inès : « ${INES_LUCAS.charAt(0).toUpperCase()}${INES_LUCAS.slice(1)} »`,
  documents: ['bl-lucas', 'palette-lucas', 'calendrier', 'droit'], largeurDocs: 1.2, serree: true, defile: true,
  bouton: 'Ouvrir la fiche « La palette de Lucas »',
  blocs: (db) => LIGNES_LUCAS.map((l, i) => ({ type: 'choix', id: l.id, lib: `${i + 1}. ${l.lib}`, colonne: true, choix: melangerPour(db, l.id, l.choix), manque: l.manque })),
  envoi: { bouton: 'Envoyer à Inès', a: 'Inès', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── les messages (au tu ; date du scénario ; jamais juste ni faux)
const ROMAIN = { nom: 'Romain', mail: mailDe('romain') }, INES = { nom: 'Inès', mail: mailDe('ines') };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '07:00', { db: o.db, decalage: o.decalage || 0 }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJETS = { accueil: 'Le camion de jouets', quai: 'Le camion est à quai', lucas: 'La palette de Lucas', compte: 'Fais-moi le point', fin: 'Merci' };
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(ROMAIN, prenom, SUJETS.accueil,
    `Bonjour ${prenom} ! ${ROMAIN_ACCUEIL.replace('le protocole', 'le [[protocole de sécurité|protocole]]')}\n\nRomain`,
    { heure: '06:55', extra: { pieces: ['protocole-quai5'] } })] }),
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(INES, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nInès', { db, heure: '07:50' })] }),
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(ROMAIN, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nRomain', { db, heure: '07:58' })] }),
  },
  declencheurs: [
    // L'accueil fini : Romain envoie la consigne du quai (aussi en tête du quai), avec « Le droit » joint (phrase de la pièce jointe CONSTRUITE).
    { id: 'quai', quand: dialogueFini(DIALOGUE),
      semer: (prenom, db) => ({ mails: [mail(ROMAIN, prenom, SUJETS.quai,
        `${CONSIGNE_ROMAIN.replace('tes réserves', 'tes [[réserve|réserves]]')}\n\nJe te joins aussi « Le droit » : deux textes à connaître.\n\nRomain`,
        { db, heure: '07:05', extra: { pieces: ['droit'] } })] }) },
    // Le document signé (Jan est reparti) : Inès découvre la palette de Lucas (même déclencheur qu'ENT-8.8 : le BL signé).
    { id: 'lucas', quand: signe,
      semer: (prenom, db) => ({ mails: [mail(INES, prenom, SUJETS.lucas, `${prenom}, ${INES_LUCAS}\n\nInès`,
        { db, heure: '07:35', extra: { ouvreFiche: FICHE_ID } })] }) },
    // La fiche envoyée : Romain demande le point ; les phrases sont calculées ICI, sur le quai et la fiche de l'élève, et figées.
    { id: 'compte-rendu', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(ROMAIN, prenom, SUJETS.compte,
        'Fais-moi le point : ton camion de ce matin, et la palette de Lucas.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nRomain',
        { db, heure: '07:45', extra: { phrases: phrasesCompteRendu(prenom) } })] }) },
    { id: 'fin', quand: apresMail({ a: ROMAIN.mail }),
      semer: (prenom, db) => ({ mails: [mail(ROMAIN, prenom, SUJETS.fin,
        'Merci. Je reparle avec Lucas : faire le tour de chaque palette, à chaque fois.\n\nRomain', { db, heure: '07:55' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5, décision de Cowork sur délégation)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant le raccrochage (dialogue), le figeage de l'inspection, la dernière
// palette posée (dépose), la signature (contrôle) ou l'envoi (fiche, phrases) : l'inaction vaut 0. Le quai n'a pas d'`ecran` : il ne se rouvre pas.
export const GROUPES = { accueil: 'Accueillir le chauffeur', avant: 'Avant de décharger', controle: 'Faire décharger et contrôler',
  lucas: 'La palette de Lucas', compte: 'Rendre compte' };
export const POIDS = {
  'accueil-salutation': 0.5, 'accueil-documents': 0.75, 'accueil-quai': 0.5, 'accueil-attente': 0.75, 'accueil-fin': 0.5,
  'securite-1': 1.25, 'securite-2': 1.25, 'securite-aucun-faux': 0.5,
  'depose-P1': 0.25, 'depose-P2': 0.25, 'depose-P3': 0.25, 'depose-P4': 0.25,
  'palettes-conformes': 0.5, 'palette-piege': 0.5, 'palette-probleme': 1.5, 'reserve-probleme': 1, deballage: 0.5, signature: 0.5,
  'lucas-aurait-du': 1, 'lucas-protester': 1, 'lucas-palette': 1,
  'cr-reception': 0.75, 'cr-lucas': 0.75,
};
const ligneQuai = (db, id) => jalonsQuai(db, quaiDeBase(db)).L.find((l) => l.id === id) || null;
const lq = (db, id) => { const l = ligneQuai(db, id); if (!l) throw new Error(`ligne du quai « ${id} » absente`); return l; };
const jalonQuai = (id, titre, groupe, fini, juger, o = {}) => ({ id, titre, groupe, poids: POIDS[id], ...o,
  verifier(db) { return fini(db) ? juger(db) : attente; } });
const okSi = (b, detail) => (b ? ok : ko(detail));
const paletteJuste = (db, pid) => { const c = lq(db, `${pid}-comptage`), d = lq(db, `${pid}-decision`); return [c.ok && d.ok, `comptage : ${c.fait} — décision : ${d.fait}`]; };
const jalonAccueil = (id, replique, titre) => jalonDialogue({ seance: ID, dialogue: DIALOGUE, id, titre, groupe: GROUPES.accueil, poids: POIDS[id],
  juge: (appel) => premiereReponse(appel, replique) === JUSTES_DIALOGUE[replique] });
const ligneCR = (id, titre, ligne) => ({ id, titre, groupe: GROUPES.compte, poids: POIDS[id], ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return okSi(r.justes.includes(ligne)); } });

export const ETAPES = [
  jalonAccueil('accueil-salutation', 'arrivee', 'Accueillir le chauffeur : saluer et se présenter'),
  jalonAccueil('accueil-documents', 'documents', 'Accueillir le chauffeur : les documents demandés'),
  jalonAccueil('accueil-quai', 'quai', 'Accueillir le chauffeur : où il se met'),
  jalonAccueil('accueil-attente', 'attente', 'Accueillir le chauffeur : moteur, clés, local'),
  jalonAccueil('accueil-fin', 'fin', 'Accueillir le chauffeur : finir poliment'),
  // L'inspection : le danger n° k de la scène de L'ÉLÈVE (n° 1 : le facile, n° 2 : l'autre, dans l'ordre des objets de la vue). Titres neutres.
  ...[0, 1].map((k) => jalonQuai(`securite-${k + 1}`, `Avant de décharger : le danger n° ${k + 1} signalé avant de décharger`, GROUPES.avant, inspectionFigee,
    (db) => { const l = lq(db, `securite-${jeuDeBase(db).scene[k]}`); return okSi(l.ok, l.fait); })),
  jalonQuai('securite-aucun-faux', 'Avant de décharger : aucun faux signalement', GROUPES.avant, inspectionFigee,
    (db) => { const l = lq(db, 'securite-aucun-faux'); return okSi(l.ok, l.fait); }),
  ...PALETTES.map((p) => jalonQuai(`depose-${p.id}`, `Faire décharger : la palette ${p.id}`, GROUPES.controle, deposeFinie,
    (db) => { const l = lq(db, `depose-${p.id}`); return okSi(l.ok, l.fait); })),
  jalonQuai('palettes-conformes', 'Contrôler : les deux palettes conformes', GROUPES.controle, signe,
    (db) => { const R = conformes(jeuDeBase(db)).map((p) => paletteJuste(db, p.id)); return okSi(R.every((r) => r[0]), R.map((r) => r[1]).join(' · ')); },
    { titreBilan: (db) => `Palettes ${conformes(jeuDeBase(db)).map((p) => p.id).join(' et ')}` }),
  jalonQuai('palette-piege', 'Contrôler : une palette (comptage et décision)', GROUPES.controle, signe,
    (db) => okSi(...paletteJuste(db, duRole(jeuDeBase(db), 'piege').id)), { titreBilan: (db) => `Palette ${duRole(jeuDeBase(db), 'piege').id}` }),
  jalonQuai('palette-probleme', 'Contrôler : une palette (comptage et décision)', GROUPES.controle, signe,
    (db) => okSi(...paletteJuste(db, duRole(jeuDeBase(db), 'probleme').id)), { titreBilan: (db) => `Palette ${duRole(jeuDeBase(db), 'probleme').id}` }),
  jalonQuai('reserve-probleme', 'Une réserve écrite : quantité et motif', GROUPES.controle, signe,
    (db) => { const l = lq(db, `${duRole(jeuDeBase(db), 'probleme').id}-reserve`); return okSi(l.ok, `écrit : ${l.fait}`); },
    { titreBilan: (db) => `Réserve de la palette ${duRole(jeuDeBase(db), 'probleme').id}` }),
  jalonQuai('deballage', 'Pas de mention « sous réserve de déballage »', GROUPES.controle, signe, (db) => okSi(lq(db, 'deballage').ok, 'mention ajoutée')),
  jalonQuai('signature', 'Le document signé par Jan, le chauffeur', GROUPES.controle, signe, () => ok),
  ...LIGNES_LUCAS.map((l, i) => ({ id: `lucas-${l.id}`, titre: `La palette de Lucas : ligne ${i + 1}`, titreBilan: `La palette de Lucas : ${l.lib}`,
    groupe: GROUPES.lucas, poids: POIDS[`lucas-${l.id}`], ecran: `fiche:${FICHE_ID}`,
    verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return okSi(valeurDe(db, FICHE_ID, l.id) === justeLucas(db, l.id)); } })),
  ligneCR('cr-reception', 'Le compte rendu : ma réception', 'reception'),
  ligneCR('cr-lucas', 'Le compte rendu : la palette de Lucas', 'lucas'),
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'telephone', libelle: 'Au quai : accueillir le chauffeur', fait: dialogueFini(DIALOGUE) },
  { vue: 'quai', libelle: 'Le quai 5 : inspecter, décharger, contrôler', fait: clos },
  { vue: 'fiche', libelle: 'La palette de Lucas', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Romain', fait: envoye },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_89 = {
  ...LEXIQUE,
  'protocole de sécurité': 'Document écrit, préparé avant la première livraison par le site et le transporteur, qui dit comment charger et décharger sans danger sur ce site.',
  pictogramme: 'Petit dessin qui se comprend sans lire (une clé, un piéton…).',
  réserve: 'Remarque écrite sur le document du transporteur, avant sa signature, qui dit ce qui ne va pas : quelle palette, quoi, combien.',
  avarie: 'Marchandise abîmée pendant le transport : un carton écrasé, déchiré, mouillé…',
  'lettre recommandée': 'Lettre envoyée par La Poste avec une preuve de l’envoi et de la date.',
  'jour férié': 'Jour de fête légale, en général non travaillé (le 25 décembre, par exemple).',
  transporteur: 'Entreprise qui emmène la marchandise du fournisseur jusqu’à l’entrepôt.',
  couche: 'Un étage de cartons sur une palette. Sous la couche du dessus, toutes les couches sont complètes.',
  cale: 'Bloc en forme de coin que l’on pose contre une roue du camion pour qu’il ne puisse pas bouger.',
  'local chauffeurs': 'Pièce d’un site logistique réservée aux chauffeurs des camions, à l’écart des quais.',
};
export const MENTION = 'Réels : Action, GXO (qui fait tourner l’entrepôt de Labastide-Saint-Pierre pour Action), le Code de commerce. '
  + 'Construit : Romain, Lucas, Inès et Jan, le fournisseur et le transporteur, le protocole du quai 5, le camion et ses palettes, leurs défauts, '
  + 'l’erreur de Lucas, les dates, le quai (un dessin) et ses cases de dépose, les documents.';
export const ACCUEIL = {
  titre: 'La palette de Lucas',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Romain', 'Menu Messagerie.'],
    ['① Au quai', 'Va accueillir Jan, le chauffeur du camion de jouets.'],
    ['② Le quai 5', 'Regarde le quai avant que Lucas décharge, dis-lui où poser les palettes, contrôle-les, écris tes [[réserve|réserves]], fais signer Jan.'],
    ['③ La palette de Lucas', 'Lis les documents, puis dis ce qu’on fait.'],
    ['④ Rendre compte', 'Réponds à Romain, une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Jan a signé et il est reparti : la réception ne se refait pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 9 : la palette de Lucas',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_89,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  telephone: TELEPHONE,
  quai: quaiDe,
  suite: SUITE,
  equipe: EQUIPE_89,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  fermetures: {
    quai: { ouvertSi: (db, seance) => dialogueFini(DIALOGUE)(db, seance), message: 'Après l’accueil du chauffeur' },
    fiche: { ouvertSi: (db) => signe(db), message: 'Après la signature du chauffeur, au quai 5' },
  },
};
