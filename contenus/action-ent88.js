// ENT-8.8 — Action, « on vérifie qu'il ne manque rien » : le contenu de la séance (brief `docs/briefs/ENT-8.8-action-controler.md` ; décisions du
// chef de chantier : `docs/briefs/COORDINATION-action.md` §8). CAP OL, GUIDAGE de CAP-C1.4 (contrôler les quantités et l'état de la livraison).
// Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (tirage des anomalies, quai d'un élève, phrases calculées) :
// `contenus/action-ent88-donnees.js`. Activité : `activites/action-controler.js`. Questions : `contenus/questions/ENT-8.8.js`. Corrigé :
// `contenus/corriges/ENT-8.8.js`.
//
// Mardi 9 novembre, 7 h 30 (aucune année écrite) : la suite immédiate d'ENT-8.7. Les 4 palettes du camion du Havre (`CAMION_HAVRE`) sont en
// zone de réception du quai 2, Marc (le chauffeur) attend. UN ÉCRAN PAR ÉTAPE :
//   ① le quai 2 (vue quai iso, `commence: 'controle'` : la vue s'ouvre à l'étape ③) — compter, faire le tour, lire l'étiquette, décider chaque
//      palette (anomalies TIRÉES par élève), écrire les réserves sur le « Bon de livraison — lettre de voiture », faire signer Marc, clore ;
//   ② rendre compte à Samia par phrases à choisir, les phrases CALCULÉES sur le tirage de l'élève (ses palettes, ses quantités), semées quand
//      le chauffeur a signé (comme ENT-6.4).
// Rien n'est jugé à l'écran pendant le travail ; le bilan détaillé dit juste / à corriger par case. « Corriger » rouvre le compte rendu, jamais
// le quai (`finFige`).
//
// VÉRIFIÉ : Action, l'entrepôt d'Ensuès-la-Redonne exploité par Geodis (voir `contenus/action.js`) ; le Code de commerce, art. L133-3, 1er alinéa,
// RECOPIÉ sur Légifrance le 17/10/2026 (LEGIARTI000021486442, version en vigueur depuis le 10/12/2009 ; apostrophe typographique).
// CONSTRUIT (dit dans la séance) : Samia, Kevin, Julie, Marc, le transporteur « Transports Seine-Provence », le quai 2 (un dessin), les palettes et
// leurs défauts, le n° du bon de livraison, les lots, les dessins (carton écrasé, palette pleine, étiquette). Les textes des messages, des phrases
// et des retours sont ceux de Cowork (brief §4, §4 bis, §4 ter, §6.3), écrits tels quels ; ce qui est ajouté est signalé « CONSTRUIT par Claude Code ».

import { apresMail } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.8.js';
import { EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, PIED_RECONSTITUTION, CAMION_HAVRE, mailDe, ech, figure } from './action.js';
import {
  ID, ID_VOLET, QUAI_ID, PHRASES_ID, DOCUMENT, BL_NUMERO, CONSIGNE_SAMIA, jeuDeBase, duRole, quaiDe, quaiDeBase, phrasesCompteRendu,
} from './action-ent88-donnees.js';

export { ID, QUAI_ID, PHRASES_ID };

// ─────────────────────────────────────────────────────────────── l'heure du scénario (mardi 9 novembre, aucune année écrite)
// Le 9 novembre de l'année scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l'année d'avant), comme ENT-8.2.
// Heure d'ouverture + temps réellement passé.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 10, 9, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const signe = (db) => !!(etatQuai(db) && etatQuai(db).signe);
export const clos = (db) => !!(etatQuai(db) && etatQuai(db).fini);
const envoye = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });

// ─────────────────────────────────────────────────────────────── les documents (reconstitués)
// « Le droit » : C. com. L133-3, 1er alinéa, RECOPIÉ de Légifrance le 17/10/2026 (LEGIARTI000021486442, en vigueur depuis le 10/12/2009).
export const TEXTE_L133_3 = 'La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois '
  + 'jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire '
  + 'ou par lettre recommandée, sa protestation motivée.';
export const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-gros">LE DROIT</p>
    <p class="ac-st">Un texte du Code de commerce (le voiturier = le transporteur)</p>
    <p><b>Code de commerce, article L133-3</b> (1er alinéa)</p>
    <p class="ac-cite">« ${TEXTE_L133_3} »</p>
    ${PIED('Texte réel, recopié de Légifrance (consulté le 17/10/2026).')}
  </article>` };

const PIED_88 = PIED(`${PIED_RECONSTITUTION} Noms du transporteur et du chauffeur construits.`);
// L'en-tête du document du camion (pour « Avant de commencer » : les lignes des palettes ne sont PAS montrées).
const DOC_BL_ENTETE = { id: 'bl-entete', titre: DOCUMENT, court: 'Le document du camion',
  html: `<article class="ac-doc" aria-label="${ech(DOCUMENT)}, en-tête">
    <p class="ac-gros">BON DE LIVRAISON — LETTRE DE VOITURE</p>
    <p class="ac-st">N° <b>${ech(BL_NUMERO)}</b> · transport par route · mardi 9 novembre</p>
    <dl class="ac-dl">
      <dt>Expéditeur</dt><dd>${ech(CAMION_HAVRE.provenance)}</dd>
      <dt>Destinataire</dt><dd>Entrepôt Action / Geodis, Ensuès-la-Redonne</dd>
      <dt>Transporteur</dt><dd>${ech(CAMION_HAVRE.transporteur)} (chauffeur : ${ech(CAMION_HAVRE.chauffeur)})</dd>
      <dt>Marchandise</dt><dd>${CAMION_HAVRE.palettes.length} palettes : une ligne par palette (au quai)</dd>
    </dl>
    <p class="ac-st"><b>Réserves du destinataire</b></p>
    <div class="ac-res" aria-label="Case réserves, vide"></div>
    <p class="ac-st">Signatures : le destinataire, le transporteur</p>
    <div class="ac-res" aria-label="Case signatures, vide"></div>
    ${PIED_88}
  </article>` };
const DOC_STAGE = { id: 'stage', titre: 'Ton stage à la réception', court: 'Ton stage',
  html: `<article class="ac-doc" aria-label="Ton stage à la réception">
    <p class="ac-t">Ton stage à la réception</p>
    <p class="ac-st">Mardi 9 novembre, 7 h 30</p>
    <p>Tu es en stage (PFMP) chez <b>Geodis</b>, à l’entrepôt Action d’Ensuès-la-Redonne. Kevin a déchargé les 4 palettes du camion du Havre au quai 2.</p>
    <p>Maintenant, tu les <b>contrôles</b>. Ta [[tutrice]] : <b>Samia</b>. Le chauffeur, <b>Marc</b>, attend.</p>
    ${figure('colis')}
    ${PIED('Samia, Kevin, Julie et Marc sont construits pour l’exercice.')}
  </article>` };
// Trois dessins en traits (CONSTRUITS par Claude Code, aucune image nouvelle) : une palette pleine (rien à compter : les colonnes sont coupées par
// « … »), un carton écrasé, une étiquette de palette (référence construite, absente du camion).
const T = 'fill="none" stroke="#2b2824" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const rangee = (y, txt) => `${[20, 78, 136].map((x) => `<rect x="${x}" y="${y}" width="52" height="34" rx="2"/>`).join('')}
    <text x="214" y="${y + 23}" font-size="20" stroke="none" fill="#2b2824" text-anchor="middle">…</text><rect x="246" y="${y}" width="52" height="34" rx="2"/>
    <text x="312" y="${y + 22}" font-size="13" stroke="none" fill="#2b2824">${txt}</text>`;
const SVG_PALETTE = `<svg class="ac88-fig" viewBox="0 0 440 210" role="img" aria-label="Dessin d’une palette pleine vue de face : des couches de cartons toutes complètes, posées sur une palette en bois">
  <g ${T}>${rangee(20, 'couche du dessus')}${rangee(58, 'couche')}${rangee(96, 'couche')}${rangee(134, 'couche')}
    <rect x="14" y="172" width="290" height="10"/><path d="M24 182 V196 M159 182 V196 M294 182 V196 M14 196 H304"/></g>
  <text x="14" y="16" font-size="13" fill="#2b2824">Toutes les couches ont le même nombre de cartons.</text></svg>`;
const SVG_CARTON = `<svg class="ac88-fig" viewBox="0 0 320 230" role="img" aria-label="Dessin d’un carton dont le coin avant est enfoncé et plié">
  <g ${T}>
    <path d="M40 90 L100 50 L270 50 L232 76 L168 90 Z"/><path d="M160 50 L100 90" stroke-dasharray="6 5"/>
    <path d="M40 90 H168 L188 124 L210 132 V210 H40 Z"/>
    <path d="M210 132 L232 76 L270 50 V170 L210 210"/>
    <path d="M168 90 L188 124 L232 76 M188 124 L210 132"/>
    <path d="M182 100 L196 96 M186 108 L206 98 M192 116 L216 92" stroke-width="1.6"/>
  </g>
  <text x="20" y="24" font-size="13" fill="#2b2824">Un carton reçu sur une palette</text></svg>`;
export const DOC_PALETTE_PLEINE = { id: 'palette-pleine', titre: 'Une palette pleine', court: 'Une palette pleine',
  html: `<article class="ac-doc" aria-label="Une palette pleine">${SVG_PALETTE}${PIED('Dessin construit pour l’exercice.')}</article>` };
export const DOC_CARTON = { id: 'carton-ecrase', titre: 'Un carton', court: 'Un carton',
  html: `<article class="ac-doc" aria-label="Un carton">${SVG_CARTON}${PIED('Dessin construit pour l’exercice.')}</article>` };
export const DOC_ETIQUETTE = { id: 'etiquette-palette', titre: 'Une étiquette de palette', court: 'Une étiquette',
  html: `<article class="ac-doc" aria-label="Une étiquette de palette">
    <div class="ac88-etiq">
      <p class="ac88-etiq-t">ÉTIQUETTE PALETTE</p>
      <p>Expéditeur : Hub d’import Action, Gonfreville-l’Orcher</p>
      <p>Destinataire : Entrepôt Action, Ensuès-la-Redonne</p>
      <p class="ac88-etiq-ref">Réf. ACT-58214</p>
      <p><b>LAMPES DE CHEVET, LOT DE 2</b></p>
      <p>Lot : HAV-214-0311</p>
      <svg class="ac88-code" viewBox="0 0 160 26" aria-hidden="true">${[0, 4, 6, 11, 15, 17, 22, 25, 29, 31, 36, 40, 43, 47, 52, 54, 58, 63, 66, 70, 74, 77, 81, 86, 88, 93, 97, 100, 105, 108, 112, 117, 119, 124, 128, 131, 136, 139, 143, 148, 151, 155]
        .map((x, i) => `<rect x="${x + 2}" y="2" width="${i % 3 ? 1.5 : 2.5}" height="22" fill="#2b2824"/>`).join('')}</svg>
    </div>
    ${PIED('Étiquette reconstituée : référence et produit construits pour l’exercice.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-gros{margin:0 0 4px; font-size:1.4rem; font-weight:900; letter-spacing:.04em}
.ac-dl{display:grid; grid-template-columns:max-content 1fr; gap:5px 14px; margin:6px 0 12px; font-size:1rem}
.ac-dl dt{font-weight:700}
.ac-dl dd{margin:0}
.ac-res{border:1.5px solid #555047; min-height:36px; margin:2px 0 8px; border-radius:2px}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ac88-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px 0 10px}
.ac88-fig text{font-family:inherit}
.ac88-etiq{border:2px solid #2b2824; border-radius:4px; padding:10px 14px; max-width:380px; margin:6px 0 10px; font-size:.95rem}
.ac88-etiq p{margin:0 0 4px}
.ac88-etiq-t{font-weight:900; letter-spacing:.06em}
.ac88-etiq-ref{font-size:1.25rem; font-weight:800}
.ac88-code{display:block; width:200px; height:auto; margin-top:4px}
`;
export const DOCUMENTS = [DOC_DROIT, DOC_BL_ENTETE, DOC_STAGE, DOC_PALETTE_PLEINE, DOC_CARTON, DOC_ETIQUETTE];

// ─────────────────────────────────────────────────────────────── les messages de Samia (au tu ; date du scénario)
const SAMIA = { nom: EQUIPE.samia.nom, mail: mailDe('samia') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '07:30', { db: o.db, decalage: o.decalage || 0 }),
  from: SAMIA.nom, fromMail: SAMIA.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJET_CONTROLE = 'Le contrôle des palettes';
export const SUJET_COMPTE_RENDU = 'Ton compte rendu';
// Le message de l'étape 1 : la consigne de Cowork (brief §4), avec « Le droit » joint (deux phrases CONSTRUITES par Claude Code pour la pièce
// jointe et le menu).
export const TEXTE_CONTROLE = CONSIGNE_SAMIA.replace(/ Samia$/, '').replace('une réserve précise', 'une [[réserve]] précise')
  + '\n\nOuvre « Le quai 2 ». Je te joins aussi « Le droit » : un texte à connaître.\n\nSamia';

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, SUJET_CONTROLE, TEXTE_CONTROLE, { heure: '07:30', extra: { pieces: ['droit'] } })] }),
  // « Corriger » (le compte rendu seulement) : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '08:05' })] }) },
  declencheurs: [
    // Le BL signé (Marc est reparti) : Samia demande le compte rendu ; les phrases sont calculées ICI, sur le tirage de l'élève, et figées.
    { id: 'compte-rendu', quand: signe,
      semer: (prenom, db) => ({ mails: [mail(prenom, SUJET_COMPTE_RENDU,
        'Marc est reparti. Fais-moi ton compte rendu : ce que tu as reçu, tes réserves, ce que tu as mis de côté.\n\n'
          + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nSamia',
        { db, heure: '07:55', extra: { phrases: phrasesCompteRendu(prenom, jeuDeBase(db)) } })] }) },
    // Le compte rendu envoyé, juste ou faux : Samia ne dit pas si c'est juste (amorce d'ENT-8.11, le rangement).
    { id: 'fin', quand: apresMail({ a: SAMIA.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci',
        `Merci ${prenom}. Julie saisit la réception dans le [[WMS]], et j’envoie tes réserves au transporteur. Demain, on range les palettes.\n\nSamia`,
        { db, heure: '08:00' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 16/10/2026 à 19 h 20, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Les palettes sont TIRÉES : un jalon = un RÔLE (sa palette change d'un élève à l'autre),
// `titreBilan` nomme la palette de l'élève (« Palette P3 »). Les jalons du quai ne sont jugés qu'une fois le document signé (plus rien n'y bouge :
// rien n'est vrai par inaction, et « pas de sous réserve de déballage » demande des réserves écrites).
export const GROUPES = { palettes: 'Contrôler les palettes', reserves: 'Les réserves et la signature', compte: 'Rendre compte' };
export const POIDS = {
  'palette-facile': 2.5, 'palette-moyen': 2.5, 'palette-piege': 1.5, 'palette-conforme': 1.5,
  'reserve-facile': 1.5, 'reserve-moyen': 1.5, deballage: 1, signature: 1,
  'cr-reserves': 1, 'cr-litiges': 1, 'cr-salutation': 0.5, 'cr-fin': 0.5,
};
const ligneQuai = (db, id) => jalonsQuai(db, quaiDeBase(db)).L.find((l) => l.id === id) || {};
const idDuRole = (db, role) => duRole(jeuDeBase(db), role).id;

const jalonPalette = (role) => ({ id: `palette-${role}`, titre: 'Contrôler une palette : comptage et décision', groupe: GROUPES.palettes, poids: POIDS[`palette-${role}`],
  titreBilan: (db) => `Palette ${idDuRole(db, role)}`,
  verifier(db) {
    if (!signe(db)) return attente;
    const pid = idDuRole(db, role), c = ligneQuai(db, `${pid}-comptage`), d = ligneQuai(db, `${pid}-decision`);
    return c.ok && d.ok ? ok : ko(`comptage : ${c.fait} — décision : ${d.fait}`);
  } });
const jalonReserve = (role) => ({ id: `reserve-${role}`, titre: 'Une réserve écrite : quantité et motif', groupe: GROUPES.reserves, poids: POIDS[`reserve-${role}`],
  titreBilan: (db) => `Réserve de la palette ${idDuRole(db, role)}`,
  verifier(db) {
    if (!signe(db)) return attente;
    const l = ligneQuai(db, `${idDuRole(db, role)}-reserve`);
    return l.ok ? ok : ko(`écrit : ${l.fait}`);
  } });
const ligneCR = (id, titre, lignes) => ({ id, titre, groupe: GROUPES.compte, poids: POIDS[id], ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko(); } });

export const ETAPES = [
  jalonPalette('facile'), jalonPalette('moyen'), jalonPalette('piege'), jalonPalette('conforme'),
  jalonReserve('facile'), jalonReserve('moyen'),
  { id: 'deballage', titre: 'Pas de mention « sous réserve de déballage »', groupe: GROUPES.reserves, poids: POIDS.deballage,
    verifier(db) { if (!signe(db)) return attente; return ligneQuai(db, 'deballage').ok ? ok : ko('mention ajoutée'); } },
  { id: 'signature', titre: 'Le document signé par Marc, le chauffeur', groupe: GROUPES.reserves, poids: POIDS.signature,
    verifier(db) { return signe(db) ? ok : attente; } },
  ligneCR('cr-reserves', 'Le compte rendu : tes réserves', ['reserves']),
  ligneCR('cr-litiges', 'Le compte rendu : la zone litiges', ['litiges']),
  ligneCR('cr-salutation', 'Le compte rendu : la salutation', ['salutation']),
  ligneCR('cr-fin', 'Le compte rendu : la fin du message', ['fin']),
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'quai', libelle: 'Le quai 2 : contrôler les palettes', fait: clos },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Samia', fait: envoye },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres CONSTRUITES par Claude Code pour les cinq qui manquaient à l'univers.
export const LEXIQUE_88 = {
  ...LEXIQUE,
  réserve: 'Remarque écrite sur le document du transporteur, avant sa signature, qui dit ce qui ne va pas : quelle palette, quoi, combien.',
  avarie: 'Marchandise abîmée pendant le transport : un carton écrasé, déchiré, mouillé…',
  manquant: 'Ce que le bon de livraison annonce mais qui n’est pas arrivé.',
  couche: 'Un étage de cartons sur une palette. Sous la couche du dessus, toutes les couches sont complètes.',
  'sous réserve de déballage': 'Mention vague parfois écrite sur un bon de livraison : elle ne dit ni quoi ni combien.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), le hub d’import du Havre, le Code de commerce. '
  + 'Construit : Samia, Kevin, Julie et Marc, le transporteur, le quai 2 (un dessin), les palettes et leurs défauts, le bon de livraison et la lettre de voiture.';
export const ACCUEIL = {
  titre: 'On vérifie qu’il ne manque rien',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Le quai 2', 'Pour chaque palette : compter, faire le tour, lire l’étiquette, décider. Puis les [[réserve|réserves]] et la signature de Marc.'],
    ['② Rendre compte', 'Réponds à Samia, une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Le chauffeur a signé et il est reparti : le contrôle ne se refait pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 8 : on vérifie qu’il ne manque rien',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_88,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  quai: quaiDe,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
