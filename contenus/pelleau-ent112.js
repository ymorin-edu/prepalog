// ENT-10.12 — Transports Pelleau, « évaluation : contrôler la réception » : le contenu de la séance (brief `docs/briefs/ENT-10.12-pelleau-evaluation-controle.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant le brief). Univers commun : `contenus/pelleau.js` (lu, jamais modifié
// ici). Données pures (tirage des anomalies et de la palette de Kervéguen, quai d'un élève, phrases calculées) : `contenus/pelleau-ent112-donnees.js`. Activité :
// `activites/pelleau-evaluation-controle.js`. Questions : `contenus/questions/ENT-10.12.js`. Corrigé : `contenus/corriges/ENT-10.12.js`. Dernière séance de Pelleau.
//
// 26 mai 2026, 8 h (aucun jour de la semaine écrit). CAP OL, ÉVALUATION de CAP-C1.4, en copie rendue (`copie: true`) : contrôler seul les quatre palettes de la ramasse,
// sans aide. Rien ne remonte pendant le travail, une seule remise (« Rendre ma copie » du bandeau), note figée ; aucun bilan, aucun « Corriger », aucun mot cliquable,
// rien à l'écran ne dit juste ou faux (aucune réaction de Loïc, aucun accusé d'Erwan qui reprenne ce que l'élève a décidé ou écrit). Modèles : ENT-10.8 (copie, quai qui
// ne rend pas la copie, remise) et ENT-10.10 / 10.11 (le contrôle ; la palette de Kervéguen à refuser).
//   Avant de commencer (noté, 4 questions tirées, aucune aide) → ① le quai A (vue quai iso, `commence: 'controle'` : compter, faire le tour, LIRE L'ÉTIQUETTE, décider
//   chaque palette ; réserves sur la feuille de ramasse ; signature de Loïc ; le quai ne rend PAS la copie) → ② rendre compte à Erwan (phrases à choisir, CALCULÉES sur le
//   tirage de l'élève) → « Rendre ma copie ». La barre « Étape suivante » n'existe pas en évaluation (moteur) : l'ordre se lit au menu.
// Le TIRAGE (voir `contenus/pelleau-ent112-donnees.js`) : deux palettes à problème (une facile, une moyenne parmi un colis caché, un manquant, ou — une copie sur trois — la
// palette de la Ferme de Kervéguen, des plants à garder entre 4 et 8 °C, à REFUSER dans un entrepôt ambiant), un piège de comptage, une palette conforme.
//
// VÉRIFIÉ : voir l'en-tête de `contenus/pelleau.js` (Pelleau, son entrepôt AMBIANT seulement, les plants de pommes de terre à garder entre 4 et 8 °C, jamais au gel ;
// Code civil 1927, 1928, 1932 recopiés de Légifrance). CONSTRUIT (dit dans la séance : pied des documents, `MENTION_112`, avertissement du quai) : Erwan, Loïc, Yann, la
// Ferme de Kervéguen (fictive), le quai A (un dessin), les palettes et leurs défauts, la feuille de ramasse, les étiquettes, les dessins en traits (palette pleine,
// carton écrasé, sac percé).

import { apresMail } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-10.12.js';
import { EQUIPE, MENTION, LOGO, DOC_DROIT_DEPOT, DOC_PELLEAU, STYLE_DOCUMENTS, mailDe, heureScenario, pied, entete } from './pelleau.js';
import {
  ID, ID_VOLET, QUAI_ID, PHRASES_ID, JOUR, FR_NUMERO, DOCUMENT, jeuDeBase, duRole, kerveguenDe, quaiDe, quaiDeBase, lignesContenu, phrasesCompteRendu,
} from './pelleau-ent112-donnees.js';

export { ID, ID_VOLET, QUAI_ID, PHRASES_ID };

// ─────────────────────────────────────────────────────────────── lectures de la base
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const signe = (db) => !!(etatQuai(db) && etatQuai(db).signe);
export const clos = (db) => !!(etatQuai(db) && etatQuai(db).fini);
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });
const repondu = (db) => phrasesJustes(db, PHRASES_ID).envoye;

// ─────────────────────────────────────────────────────────────── les documents (reconstitués ; pied imposé)
const DATE_DOC = `${JOUR} mai`;
// L'en-tête de la feuille de ramasse (pour « Avant de commencer » : les lignes des palettes ne sont PAS montrées, elles sont au quai ; aucun expéditeur nommé).
export const DOC_FEUILLE_ENTETE = { id: 'feuille-entete-112', titre: 'La feuille de ramasse de Loïc', court: 'La feuille de ramasse',
  html: `<article class="pe-doc" aria-label="La feuille de ramasse de Loïc, en-tête">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    ${entete('Feuille de ramasse', [`N° ${FR_NUMERO}`, DATE_DOC, 'Conducteur : Loïc', 'Porteur Pelleau'])}
    <p>4 palettes : une ligne par palette (tu les lis au quai).</p>
    <p class="pe-st"><b>Réserves à l’arrivée à l’entrepôt</b></p>
    <div class="pe-res" aria-label="Case réserves, vide"></div>
    <p class="pe-st">Signatures : l’entrepôt, le conducteur</p>
    <div class="pe-res" aria-label="Case signatures, vide"></div>
    ${pied()}
  </article>` };
// « Ta matinée » (écran « Avant de commencer ») : la situation, sans rien de ce qu'on demande.
export const DOC_MATINEE = { id: 'matinee-112', titre: 'Ta matinée', court: 'Ta matinée',
  html: `<article class="pe-doc" aria-label="Ta matinée">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Ta matinée</p>
    <p class="pe-st">${DATE_DOC}, 8 h — entrepôt de Gouesnou, quai A</p>
    <p>Les 4 palettes de la ramasse de ce matin sont <b>triées par client</b> en zone de réception. Pelleau va les <b>garder</b> pour ses clients.</p>
    <p>Toi, tu les <b>contrôles</b>, seul. Loïc, le conducteur, est rentré de sa ramasse. <b>Erwan</b>, ton tuteur, est au bureau.</p>
    ${pied('Document pédagogique — reconstitution, non contractuel. Les clients cités sont des entreprises fictives. Loïc, Yann et Erwan sont imaginés pour l’exercice.')}
  </article>` };
// « Pelleau en bref » de l'univers, SANS ses mots cliquables (une évaluation n'en a aucun) : `[[mot|texte]]` → `texte`, `[[mot]]` → `mot`.
export const DOC_PELLEAU_112 = { ...DOC_PELLEAU, id: 'pelleau-112',
  html: DOC_PELLEAU.html.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1') };
// Trois dessins en traits (CONSTRUITS par Claude Code, aucune image nouvelle) : une palette pleine (rien à compter : les colonnes sont coupées par « … »), un carton
// écrasé, un sac percé.
const T = 'fill="none" stroke="#2b2824" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const rangee = (y, txt) => `${[20, 78, 136].map((x) => `<rect x="${x}" y="${y}" width="52" height="34" rx="2"/>`).join('')}
    <text x="214" y="${y + 23}" font-size="20" stroke="none" fill="#2b2824" text-anchor="middle">…</text><rect x="246" y="${y}" width="52" height="34" rx="2"/>
    <text x="312" y="${y + 22}" font-size="13" stroke="none" fill="#2b2824">${txt}</text>`;
const SVG_PALETTE = `<svg class="pe112-fig" viewBox="0 0 440 210" role="img" aria-label="Dessin d’une palette pleine vue de face : des couches de colis toutes complètes, posées sur une palette en bois">
  <g ${T}>${rangee(20, 'couche du dessus')}${rangee(58, 'couche')}${rangee(96, 'couche')}${rangee(134, 'couche')}
    <rect x="14" y="172" width="290" height="10"/><path d="M24 182 V196 M159 182 V196 M294 182 V196 M14 196 H304"/></g>
  <text x="14" y="16" font-size="13" fill="#2b2824">Toutes les couches ont le même nombre de colis.</text></svg>`;
const SVG_CARTON = `<svg class="pe112-fig" viewBox="0 0 320 230" role="img" aria-label="Dessin d’un carton dont le coin avant est enfoncé et plié">
  <g ${T}>
    <path d="M40 90 L100 50 L270 50 L232 76 L168 90 Z"/><path d="M160 50 L100 90" stroke-dasharray="6 5"/>
    <path d="M40 90 H168 L188 124 L210 132 V210 H40 Z"/>
    <path d="M210 132 L232 76 L270 50 V170 L210 210"/>
    <path d="M168 90 L188 124 L232 76 M188 124 L210 132"/>
    <path d="M182 100 L196 96 M186 108 L206 98 M192 116 L216 92" stroke-width="1.6"/>
  </g>
  <text x="20" y="24" font-size="13" fill="#2b2824">Un carton reçu sur une palette</text></svg>`;
const SVG_SAC = `<svg class="pe112-fig" viewBox="0 0 360 230" role="img" aria-label="Dessin d’un sac de terreau couché : son flanc est déchiré et du terreau s’en échappe en petit tas">
  <g ${T}>
    <path d="M40 70 Q36 120 40 170 Q180 186 320 170 Q324 120 320 70 Q180 54 40 70 Z"/>
    <path d="M56 72 Q52 120 56 168 M304 72 Q308 120 304 168" stroke-dasharray="5 4" stroke-width="1.8"/>
    <path d="M120 64 Q116 120 120 178 M200 62 Q196 120 200 180" stroke-width="1.8"/>
    <path d="M226 120 L236 110 L244 124 L254 112 L262 126 L272 116 L278 130 L266 140 L256 132 L246 144 L236 134 Z" fill="#2b2824"/>
    <path d="M250 146 Q262 176 286 196 Q248 206 214 198 Q236 182 244 150" fill="#6b5a45" stroke-width="2"/>
  </g>
  <text x="128" y="126" font-size="13" font-weight="700" fill="#2b2824">TERREAU</text>
  <text x="20" y="28" font-size="13" fill="#2b2824">Un sac reçu sur une palette</text></svg>`;
export const DOC_PALETTE_PLEINE = { id: 'palette-pleine-112', titre: 'Une palette pleine', court: 'Une palette pleine',
  html: `<article class="pe-doc" aria-label="Une palette pleine">${SVG_PALETTE}${pied('Dessin construit pour l’exercice.')}</article>` };
export const DOC_CARTON = { id: 'carton-ecrase-112', titre: 'Un carton', court: 'Un carton',
  html: `<article class="pe-doc" aria-label="Un carton">${SVG_CARTON}${pied('Dessin construit pour l’exercice.')}</article>` };
export const DOC_SAC = { id: 'sac-perce-112', titre: 'Un sac', court: 'Un sac',
  html: `<article class="pe-doc" aria-label="Un sac">${SVG_SAC}${pied('Dessin construit pour l’exercice.')}</article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.pe-res{border:1.5px solid #555047; min-height:36px; margin:2px 0 8px; border-radius:2px}
.pe112-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px 0 10px}
.pe112-fig text{font-family:inherit}
`;
export const DOCUMENTS = [DOC_DROIT_DEPOT, DOC_PELLEAU_112, DOC_FEUILLE_ENTETE, DOC_MATINEE, DOC_PALETTE_PLEINE, DOC_CARTON, DOC_SAC];

// ─────────────────────────────────────────────────────────────── les messages d'Erwan (au tu ; 26 mai 2026, jamais le jour de la semaine ; jamais juste ni faux)
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR, o.heure || '08:00', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: ERWAN.nom, fromMail: ERWAN.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJETS = { quai: 'Les palettes de la ramasse', compte: 'Ton compte rendu', fin: 'Merci' };
// Le premier message : les palettes sont triées ; la consigne (aucune palette nommée, rien sur le froid, rien sur les défauts).
export const TEXTE_QUAI = 'Les 4 palettes de ce matin sont triées. Je suis au bureau : tu contrôles seul. Pour chaque palette : compte, fais le tour, lis l’étiquette, puis décide. '
  + 'Un problème ? Une réserve précise sur la feuille de ramasse, et Loïc la signe.\n\nOuvre « Le quai A ».\n\nErwan';
// Le compte rendu demandé quand le quai est clos : les mêmes mots pour tous (la ligne sur la palette de Kervéguen n'existe que pour qui en a une, mais le message ne le dit pas).
export const TEXTE_COMPTE = 'Le contrôle est fait. Rends-moi compte : ce que tu as contrôlé, ce que tu as fait des palettes.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nErwan';
export const TEXTE_FIN = (prenom) => `Merci ${prenom}.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nErwan`;

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.quai, `Bonjour ${prenom} ! ${TEXTE_QUAI}`, { db, heure: '08:00', extra: { pieces: [DOC_DROIT_DEPOT.id] } })] }),
  declencheurs: [
    // Le quai clos (Loïc a signé, il est reparti) : le compte rendu à Erwan. Les phrases sont calculées ICI, sur le tirage de l'élève.
    { id: 'compte-rendu', quand: clos,
      semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.compte, TEXTE_COMPTE, { db, heure: '08:40', extra: { phrases: phrasesCompteRendu(prenom, jeuDeBase(db)) } })] }) },
    // La fin : neutre, toujours le même message (Erwan ne reprend ni ne juge ce que l'élève a écrit), et la remise.
    { id: 'fin', quand: apresMail({ a: ERWAN.mail }), semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.fin, TEXTE_FIN(prenom), { db, heure: '08:45' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de l'ouverture = 20 ; poids du brief §5, validés par Tristan le 18/10/2026 à 22 h 03)
// Contrôler les palettes 8 (les deux sans problème 1,5 chacune ; les deux à problème 2,5 chacune : comptage ET décision) · Réserves et signature 4 (réserve juste 1,5 × 2,
// pas de déballage 0,5, signature 0,5) · Rendre compte 4 (le contenu 3, la forme 1). Les palettes sont TIRÉES : un jalon = un RÔLE (sa palette change d'un élève à l'autre),
// `titreBilan` nomme la palette de l'élève. Les jalons du quai ne sont jugés qu'une fois la feuille signée (plus rien n'y bouge), le compte rendu qu'une fois envoyé :
// rien n'est vrai par inaction. Pour la palette de Kervéguen (quand la copie en a une), la « réserve » est la ligne de REFUS de la feuille.
export const GROUPES = { palettes: 'Contrôler les palettes', reserves: 'Réserves et signature', compte: 'Rendre compte' };
export const POIDS = {
  'palette-facile': 2.5, 'palette-moyen': 2.5, 'palette-piege': 1.5, 'palette-conforme': 1.5,
  'reserve-facile': 1.5, 'reserve-moyen': 1.5, deballage: 0.5, signature: 0.5, 'cr-contenu': 3, 'cr-forme': 1,
};
const ligneQuai = (db, id) => jalonsQuai(db, quaiDeBase(db)).L.find((l) => l.id === id) || {};
const idDe = (db, role) => duRole(jeuDeBase(db), role).id;
const jalonPalette = (role) => ({ id: `palette-${role}`, titre: `Contrôler une palette ${role === 'facile' || role === 'moyen' ? 'à problème' : 'sans problème'} : comptage et décision`,
  groupe: GROUPES.palettes, poids: POIDS[`palette-${role}`],
  titreBilan: (db) => `Palette ${idDe(db, role)}${role === 'moyen' && kerveguenDe(jeuDeBase(db)) ? ', de la Ferme de Kervéguen' : ''}`,
  verifier(db) {
    if (!signe(db)) return attente;
    const pid = idDe(db, role), c = ligneQuai(db, `${pid}-comptage`), d = ligneQuai(db, `${pid}-decision`);
    return c.ok && d.ok ? ok : ko(`comptage : ${c.fait} — décision : ${d.fait}`);
  } });
const jalonReserve = (role) => ({ id: `reserve-${role}`, titre: `Réserves : ${role === 'facile' ? 'la première palette à problème' : 'la seconde palette à problème'}`,
  groupe: GROUPES.reserves, poids: POIDS[`reserve-${role}`],
  titreBilan: (db) => `Réserve écrite : palette ${idDe(db, role)}`,
  verifier(db) {
    if (!signe(db)) return attente;
    const l = ligneQuai(db, `${idDe(db, role)}-reserve`);
    return l.ok ? ok : ko(`écrit : ${l.fait}`);
  } });
const lignePhrases = (id, titre, lignes) => ({ id, titre, groupe: GROUPES.compte, poids: POIDS[id], ecran: `phrases:${PHRASES_ID}`,
  verifier(db) {
    const r = phrasesJustes(db, PHRASES_ID);
    if (!r.envoye) return attente;
    return (typeof lignes === 'function' ? lignes(db) : lignes).every((l) => r.justes.includes(l)) ? ok : ko();
  } });

export const ETAPES = [
  jalonPalette('facile'),
  jalonPalette('moyen'),
  jalonPalette('piege'),
  jalonPalette('conforme'),
  jalonReserve('facile'),
  jalonReserve('moyen'),
  { id: 'deballage', titre: 'Pas de mention « sous réserve de déballage »', groupe: GROUPES.reserves, poids: POIDS.deballage,
    verifier(db) { if (!signe(db)) return attente; return ligneQuai(db, 'deballage').ok ? ok : ko('mention ajoutée'); } },
  { id: 'signature', titre: 'La feuille de ramasse signée par Loïc', groupe: GROUPES.reserves, poids: POIDS.signature,
    verifier(db) { return signe(db) ? ok : attente; } },
  // Rendre compte : le contenu (les réserves, la zone litiges et, s'il y en a une, la palette non stockée) 3 ; la forme (salutation ET fin) 1.
  lignePhrases('cr-contenu', 'Le compte rendu : les réserves, la zone litiges et la palette non stockée', (db) => lignesContenu(jeuDeBase(db))),
  lignePhrases('cr-forme', 'Le compte rendu : la salutation et la fin', ['salutation', 'fin']),
];

// ─────────────────────────────────────────────────────────────── pastilles, ordre des écrans, accueil, options
export const PASTILLES = [
  { libelle: 'Le quai A', fait: clos },
  { libelle: 'Rendre compte', fait: repondu },
];
// L'ordre des écrans de travail (menu ; le moteur ne montre pas la barre « Étape suivante » en évaluation).
export const SUITE = [
  { vue: 'quai', libelle: 'Le quai A : contrôler les palettes', fait: clos },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Erwan', fait: repondu },
];
export const MENTION_112 = `${MENTION} Pour cette séance : le quai A (un dessin), les palettes, leurs défauts, la feuille de ramasse et les clients (entreprises fictives) sont construits.`;
export const ACCUEIL = {
  titre: 'Évaluation : contrôler la réception',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Erwan', 'Menu Messagerie : « Le droit » est joint.'],
    ['① Le quai A', 'Pour chaque palette : compter, faire le tour, lire l’étiquette, décider. Puis les réserves et la signature de Loïc.'],
    ['② Rendre compte', 'Réponds à Erwan, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION_112],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : contrôler la réception',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  quai: quaiDe,
  suite: SUITE,
  pastilles: PASTILLES,
  questions: QUESTIONS,
};
// Pour les tests et le corrigé : le document du quai.
export { DOCUMENT };
