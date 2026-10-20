// ENT-10.10 — Transports Pelleau, « le contrôle, seul » : le contenu de la séance (brief `docs/briefs/ENT-10.10-pelleau-controle-seul.md` ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant le brief). CAP OL, ENTRAÎNEMENT de CAP-C1.4 (contrôler les quantités et l'état
// de la livraison). Univers commun : `contenus/pelleau.js` (lu, jamais modifié ici). Données pures (tirage des anomalies, quai d'un élève, phrases
// calculées) : `contenus/pelleau-ent110-donnees.js`. Activité : `activites/pelleau-controle-seul.js`. Questions : `contenus/questions/ENT-10.10.js`.
// Corrigé : `contenus/corriges/ENT-10.10.js`. Modèle : ENT-10.9 (même séance, avec Erwan à côté) ; ce fichier n'importe rien d'ENT-10.9.
//
// 21 mai 2026, 8 h (aucun jour de la semaine écrit). Même camion que la veille, mêmes clients ; Erwan est au bureau : l'élève contrôle SEUL, aides de comptage
// éteintes. Les 4 palettes de la ramasse du matin sont déjà triées par client en zone de réception ; Loïc attend au local. Pelleau GARDE la marchandise de
// ses clients (C. civ. 1927, 1932) : les réserves s'écrivent quand même, sur la feuille de ramasse, et Loïc les signe. UN ÉCRAN PAR ÉTAPE :
//   ① le quai A (vue quai iso, `commence: 'controle'` : la vue s'ouvre à l'étape ③) — compter, faire le tour, lire l'étiquette, décider chaque palette
//      (anomalies TIRÉES par élève, dont, un tirage sur trois, un ARTICLE DIFFÉRENT : l'étiquette des sacs dit l'engrais, la feuille dit le terreau),
//      écrire les réserves sur la feuille de ramasse, faire signer Loïc, clore. Cartons (Ar Vag) et SACS dessinés (Agri-Kerlann) sur le même quai ;
//   ② rendre compte à Erwan par phrases à choisir, CALCULÉES sur le tirage de l'élève, semées quand Loïc a signé.
// Rien n'est jugé à l'écran pendant le travail ; le bilan détaillé dit juste / à corriger par case. « Corriger » rouvre le compte rendu, jamais le quai.
//
// VÉRIFIÉ : voir l'en-tête de `contenus/pelleau.js` (Pelleau, son entrepôt ambiant ; Code civil 1927, 1928, 1932 recopiés de Légifrance).
// CONSTRUIT (dit dans la séance : pied des documents, `MENTION_110`, avertissement du quai) : Erwan, Yann, Loïc, Maëlys, les clients (fictifs), le quai A
// (un dessin), les palettes et leurs défauts, l'engrais d'Agri-Kerlann (référence et désignation), la feuille de ramasse, les étiquettes, les dessins en
// traits. Les textes des messages, des phrases et des retours sont ceux du brief ; ce qui est ajouté est signalé « CONSTRUIT par Claude Code ».

import { apresMail } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-10.10.js';
import { EQUIPE, LEXIQUE, MENTION, LOGO, DOC_DROIT_DEPOT, STYLE_DOCUMENTS, mailDe, heureScenario, ech, pied, entete } from './pelleau.js';
import {
  ID, ID_VOLET, QUAI_ID, PHRASES_ID, JOUR, DOCUMENT, FR_NUMERO, CLIENTS_110, nomClient, jeuDeBase, duRole, quaiDe, quaiDeBase, phrasesCompteRendu,
} from './pelleau-ent110-donnees.js';

export { ID, QUAI_ID, PHRASES_ID };

// ─────────────────────────────────────────────────────────────── lectures de la base
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const signe = (db) => !!(etatQuai(db) && etatQuai(db).signe);
export const clos = (db) => !!(etatQuai(db) && etatQuai(db).fini);
const envoye = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });

// ─────────────────────────────────────────────────────────────── les documents (reconstitués ; pied imposé)
const DATE_DOC = `${JOUR} mai`;
// L'en-tête de la feuille de ramasse (pour « Avant de commencer » : les lignes des palettes ne sont PAS montrées, elles sont au quai).
export const DOC_FEUILLE_ENTETE = { id: 'feuille-entete-110', titre: 'La feuille de ramasse de Loïc', court: 'La feuille de ramasse',
  html: `<article class="pe-doc" aria-label="La feuille de ramasse de Loïc, en-tête">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    ${entete('Feuille de ramasse', [`N° ${FR_NUMERO}`, DATE_DOC, 'Conducteur : Loïc', 'Porteur Pelleau'])}
    <p>Expéditeurs : ${CLIENTS_110.map((c) => `<b>${ech(nomClient(c))}</b>`).join(' et ')}.</p>
    <p>4 palettes : une ligne par palette (tu les lis au quai).</p>
    <p class="pe-st"><b>Réserves à l’arrivée à l’entrepôt</b></p>
    <div class="pe-res" aria-label="Case réserves, vide"></div>
    <p class="pe-st">Signatures : l’entrepôt, le conducteur</p>
    <div class="pe-res" aria-label="Case signatures, vide"></div>
    ${pied()}
  </article>` };
// « Ta matinée » (écran « Avant de commencer ») : la situation, sans rien de ce qu'on demande.
export const DOC_MATINEE = { id: 'matinee-110', titre: 'Ta matinée', court: 'Ta matinée',
  html: `<article class="pe-doc" aria-label="Ta matinée">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Ta matinée</p>
    <p class="pe-st">${DATE_DOC}, 8 h — entrepôt de Gouesnou, quai A</p>
    <p>Les 4 palettes de la ramasse de ce matin sont <b>triées par client</b> en zone de réception. Pelleau va les <b>garder</b> pour ses clients.</p>
    <p>Toi, tu les <b>contrôles</b>, <b>seul</b> : <b>Erwan</b>, ton tuteur, est au bureau. Loïc, le conducteur, attend au local.</p>
    ${pied('Document pédagogique — reconstitution, non contractuel. Les clients cités sont des entreprises fictives. Loïc, Yann, Maëlys et Erwan sont imaginés pour l’exercice.')}
  </article>` };
// Quatre dessins en traits (CONSTRUITS par Claude Code, aucune image nouvelle) : une palette pleine (rien à compter : les colonnes sont coupées par
// « … »), un carton écrasé, un sac percé, une étiquette qui ne dit pas l'article de la feuille.
const T = 'fill="none" stroke="#2b2824" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const rangee = (y, txt) => `${[20, 78, 136].map((x) => `<rect x="${x}" y="${y}" width="52" height="34" rx="2"/>`).join('')}
    <text x="214" y="${y + 23}" font-size="20" stroke="none" fill="#2b2824" text-anchor="middle">…</text><rect x="246" y="${y}" width="52" height="34" rx="2"/>
    <text x="312" y="${y + 22}" font-size="13" stroke="none" fill="#2b2824">${txt}</text>`;
const SVG_PALETTE = `<svg class="pe110-fig" viewBox="0 0 440 210" role="img" aria-label="Dessin d’une palette pleine vue de face : des couches de colis toutes complètes, posées sur une palette en bois">
  <g ${T}>${rangee(20, 'couche du dessus')}${rangee(58, 'couche')}${rangee(96, 'couche')}${rangee(134, 'couche')}
    <rect x="14" y="172" width="290" height="10"/><path d="M24 182 V196 M159 182 V196 M294 182 V196 M14 196 H304"/></g>
  <text x="14" y="16" font-size="13" fill="#2b2824">Toutes les couches ont le même nombre de colis.</text></svg>`;
const SVG_CARTON = `<svg class="pe110-fig" viewBox="0 0 320 230" role="img" aria-label="Dessin d’un carton dont le coin avant est enfoncé et plié">
  <g ${T}>
    <path d="M40 90 L100 50 L270 50 L232 76 L168 90 Z"/><path d="M160 50 L100 90" stroke-dasharray="6 5"/>
    <path d="M40 90 H168 L188 124 L210 132 V210 H40 Z"/>
    <path d="M210 132 L232 76 L270 50 V170 L210 210"/>
    <path d="M168 90 L188 124 L232 76 M188 124 L210 132"/>
    <path d="M182 100 L196 96 M186 108 L206 98 M192 116 L216 92" stroke-width="1.6"/>
  </g>
  <text x="20" y="24" font-size="13" fill="#2b2824">Un carton reçu sur une palette</text></svg>`;
// Un sac couché, sa couture à chaque bout, une bande imprimée ; une déchirure dentelée sur le flanc, d'où coule un petit tas de terreau.
const SVG_SAC = `<svg class="pe110-fig" viewBox="0 0 360 230" role="img" aria-label="Dessin d’un sac de terreau couché : son flanc est déchiré et du terreau s’en échappe en petit tas">
  <g ${T}>
    <path d="M40 70 Q36 120 40 170 Q180 186 320 170 Q324 120 320 70 Q180 54 40 70 Z"/>
    <path d="M56 72 Q52 120 56 168 M304 72 Q308 120 304 168" stroke-dasharray="5 4" stroke-width="1.8"/>
    <path d="M120 64 Q116 120 120 178 M200 62 Q196 120 200 180" stroke-width="1.8"/>
    <path d="M226 120 L236 110 L244 124 L254 112 L262 126 L272 116 L278 130 L266 140 L256 132 L246 144 L236 134 Z" fill="#2b2824"/>
    <path d="M250 146 Q262 176 286 196 Q248 206 214 198 Q236 182 244 150" fill="#6b5a45" stroke-width="2"/>
  </g>
  <text x="128" y="126" font-size="13" font-weight="700" fill="#2b2824">TERREAU</text>
  <text x="20" y="28" font-size="13" fill="#2b2824">Un sac reçu sur une palette</text></svg>`;
// Une ligne de la feuille de ramasse et l'étiquette du carton posé en face : les deux ne disent pas le même article (exemple d'Ar Vag, CONSTRUIT : un
// client dont la palette ne se tire jamais en « article différent », pour ne rien souffler de la séance).
const SVG_ETIQUETTE = `<svg class="pe110-fig" viewBox="0 0 440 250" role="img" aria-label="Dessin de deux morceaux de papier : une ligne de la feuille de ramasse qui annonce des biscuits au beurre, et l’étiquette d’un carton qui annonce des biscuits au chocolat">
  <g ${T}><rect x="14" y="28" width="412" height="64" rx="3"/><rect x="14" y="130" width="300" height="104" rx="3"/><path d="M14 156 H314"/></g>
  <text x="14" y="18" font-size="13" fill="#2b2824">Sur la feuille de ramasse</text>
  <text x="26" y="56" font-size="14" font-weight="700" fill="#2b2824">AV-20418 — Biscuits au beurre, cartons de 12 paquets</text>
  <text x="26" y="78" font-size="13" fill="#2b2824">Palette pleine, tous les colis annoncés</text>
  <text x="14" y="120" font-size="13" fill="#2b2824">Sur l’étiquette d’un carton de la palette</text>
  <text x="26" y="148" font-size="13" fill="#2b2824">Expéditeur : Biscuiterie Ar Vag</text>
  <text x="26" y="180" font-size="14" font-weight="700" fill="#2b2824">Réf. AV-20733</text>
  <text x="26" y="204" font-size="14" font-weight="700" fill="#2b2824">BISCUITS AU CHOCOLAT</text>
  <text x="26" y="224" font-size="13" fill="#2b2824">Contenu : 1 carton</text></svg>`;
export const DOC_PALETTE_PLEINE = { id: 'palette-pleine-110', titre: 'Une palette pleine', court: 'Une palette pleine',
  html: `<article class="pe-doc" aria-label="Une palette pleine">${SVG_PALETTE}${pied('Dessin construit pour l’exercice.')}</article>` };
export const DOC_CARTON = { id: 'carton-ecrase-110', titre: 'Un carton', court: 'Un carton',
  html: `<article class="pe-doc" aria-label="Un carton">${SVG_CARTON}${pied('Dessin construit pour l’exercice.')}</article>` };
export const DOC_SAC = { id: 'sac-perce-110', titre: 'Un sac', court: 'Un sac',
  html: `<article class="pe-doc" aria-label="Un sac">${SVG_SAC}${pied('Dessin construit pour l’exercice.')}</article>` };
export const DOC_ETIQUETTE = { id: 'etiquette-110', titre: 'La feuille et l’étiquette', court: 'La feuille et l’étiquette',
  html: `<article class="pe-doc" aria-label="La feuille et l’étiquette">${SVG_ETIQUETTE}${pied('Dessin construit pour l’exercice. Références inventées.')}</article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.pe-res{border:1.5px solid #555047; min-height:36px; margin:2px 0 8px; border-radius:2px}
.pe110-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px 0 10px}
.pe110-fig text{font-family:inherit}
`;
export const DOCUMENTS = [DOC_DROIT_DEPOT, DOC_FEUILLE_ENTETE, DOC_MATINEE, DOC_PALETTE_PLEINE, DOC_CARTON, DOC_SAC, DOC_ETIQUETTE];

// ─────────────────────────────────────────────────────────────── les messages d'Erwan (au tu ; 21 mai 2026, jamais le jour de la semaine)
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR, o.heure || '08:00', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: ERWAN.nom, fromMail: ERWAN.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJET_CONTROLE = 'Le contrôle, seul';
export const SUJET_COMPTE_RENDU = 'Ton compte rendu';
// Le message de l'étape 1 : Erwan est au bureau (CONSTRUIT par Claude Code, d'après le brief §0), la consigne de 10.9, « Le droit » joint. Rien n'y nomme
// une palette ni ne laisse entendre qu'un article pourrait différer.
export const TEXTE_CONTROLE = (() => {
  const c = 'Je suis au bureau ce matin : tu contrôles seul. Les 4 palettes de la ramasse sont triées. Pour chacune : compte, fais le tour, lis l’étiquette, puis décide. '
    + 'Un problème ? Une [[réserve]] précise sur la [[feuille de ramasse]], et Loïc la signe.';
  return `${c}\n\nOuvre « Le quai A ». Je te joins « Le droit » : c’est la marchandise de nos clients, on la garde pour eux.\n\nErwan`;
})();
export const TEXTE_FIN = 'Merci. Maëlys saisit l’entrée en stock avec tes réserves et prévient les clients.\n\nErwan';

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, SUJET_CONTROLE, TEXTE_CONTROLE, { heure: '08:00', extra: { pieces: [DOC_DROIT_DEPOT.id] } })] }),
  // « Corriger » (le compte rendu seulement) : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(prenom, 'Bien reçu', 'Bien reçu, merci.\n\nErwan', { db, heure: '08:40', decalage: n })] }) },
  declencheurs: [
    // La feuille signée (Loïc est reparti) : Erwan demande le compte rendu ; les phrases sont calculées ICI, sur le tirage de l'élève.
    { id: 'compte-rendu', quand: signe,
      semer: (prenom, db) => ({ mails: [mail(prenom, SUJET_COMPTE_RENDU,
        'Loïc est reparti. Ton compte rendu : ce que tu as contrôlé, tes réserves, ce que tu as mis de côté.\n\n'
          + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nErwan',
        { db, heure: '08:30', extra: { phrases: phrasesCompteRendu(prenom, jeuDeBase(db)) } })] }) },
    // Le compte rendu envoyé, juste ou faux : Erwan ne dit pas si c'est juste.
    { id: 'fin', quand: apresMail({ a: ERWAN.mail }), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci', TEXTE_FIN, { db, heure: '08:35' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (« comme ENT-10.9 » : poids validés par Tristan le 18/10/2026 à 22 h 03, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Les palettes sont TIRÉES : un jalon = un RÔLE (sa palette change d'un élève à l'autre),
// `titreBilan` nomme la palette de l'élève (« Palette P3 »). Les jalons du quai ne sont jugés qu'une fois la feuille signée (plus rien n'y bouge :
// rien n'est vrai par inaction, et « pas de sous réserve de déballage » demande des réserves écrites). Le rôle « moyen » est la palette de l'autre
// client : cachée, manquants, ou, au difficile, l'article différent (même poids : la note reste juste d'un élève à l'autre).
export const GROUPES = { palettes: 'Contrôler les palettes', reserves: 'Les réserves et la signature', compte: 'Rendre compte' };
export const POIDS = {
  'palette-facile': 2.5, 'palette-moyen': 2.5, 'palette-piege': 1.5, 'palette-conforme': 1.5,
  'reserve-facile': 1.5, 'reserve-moyen': 1.5, deballage: 1, signature: 1,
  'cr-reserves': 1, 'cr-litiges': 1, 'cr-forme': 1,
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
  { id: 'signature', titre: 'La feuille de ramasse signée par Loïc', groupe: GROUPES.reserves, poids: POIDS.signature,
    verifier(db) { return signe(db) ? ok : attente; } },
  ligneCR('cr-reserves', 'Le compte rendu : tes réserves', ['reserves']),
  ligneCR('cr-litiges', 'Le compte rendu : la zone litiges', ['litiges']),
  // La forme (une case) : la salutation ET la fin du message.
  ligneCR('cr-forme', 'Le compte rendu : la salutation et la fin', ['salutation', 'fin']),
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'quai', libelle: 'Le quai A : contrôler les palettes', fait: clos },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Erwan', fait: envoye },
];
// Les mots du brief (ENT-10.9 §4, « Mots cliquables ») et « article différent » ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_110 = {
  ...LEXIQUE,
  réserve: 'Remarque écrite sur le document, avant la signature, qui dit ce qui ne va pas : quelle palette, quoi, combien.',
  avarie: 'Marchandise abîmée : un carton écrasé, un sac percé, déchiré, mouillé…',
  manquant: 'Un colis prévu sur le document mais qui n’est pas là.',
  couche: 'Un étage de colis sur une palette. Sous la couche du dessus, toutes les couches sont complètes.',
  'feuille de ramasse': 'Document du conducteur : pour chaque palette ramassée chez un client, ce qu’elle contient. Les réserves s’y écrivent.',
  'zone litiges': 'Endroit marqué au sol où l’on met de côté la marchandise qui pose problème, le temps de décider avec le client.',
  dépôt: 'Quand un client confie sa marchandise à garder : Pelleau (le dépositaire) doit la lui rendre telle qu’il l’a reçue.',
  'sous réserve de déballage': 'Mention vague parfois écrite sur un document de transport : elle ne dit ni quoi, ni combien, ni sur quelle palette.',
  'article différent': 'Un produit qui n’est pas celui du document : l’étiquette des colis dit un article, la feuille de ramasse en dit un autre.',
};
export const MENTION_110 = `${MENTION} Pour cette séance : le quai A (un dessin), les palettes, leurs défauts, la feuille de ramasse et les références des articles sont construits.`;
export const ACCUEIL = {
  titre: 'Le contrôle, seul',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Erwan', 'Menu Messagerie : « Le droit » est joint.'],
    ['① Le quai A', 'Seul : pour chaque palette, compter, faire le tour, lire l’étiquette, décider. Puis les [[réserve|réserves]] et la signature de Loïc.'],
    ['② Rendre compte', 'Réponds à Erwan, une phrase par ligne.'],
    ['Bon à savoir', MENTION_110],
  ],
};
export const FIN_FIGE = 'Loïc a signé : le contrôle ne se refait pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 10 : le contrôle, seul',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_110,
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  quai: quaiDe,
  suite: SUITE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
// Pour les tests et le corrigé : le document du quai.
export { DOCUMENT };
