// ENT-8.13 — Action, « la palette d'à côté » : le contenu de la séance (brief `docs/briefs/ENT-8.13-action-palette-a-cote.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-palettier.md` §3 et §4, qui passent avant le brief là où elles diffèrent). CAP OL, ENTRAÎNEMENT de CAP-C1.5
// (mettre en stock), avec ERREUR INDUITE. Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (stock du soir, tirage,
// entrepôt d'un élève, phrases) : `contenus/action-ent813-donnees.js`. Activité : `activites/action-palette-a-cote.js`. Questions :
// `contenus/questions/ENT-8.13.js`. Corrigé : `contenus/corriges/ENT-8.13.js`.
//
// Un jeudi, 20 h 30, puis le lendemain, 6 h (AUCUNE date écrite, décision de Tristan). UN SEUL ENTREPÔT À DEUX PHASES (lot 5 du chantier E-7) :
//   ① le soir : deux palettes au sol, P1 (l'échauffement, non notée) et P3, dont l'adresse donnée est prise. Au premier « Occupé » sur P3, Kevin écrit :
//      « Mets-la à côté, on verra demain. » (aucun choix dans le message : c'est le geste au palettier qui compte). Trois chemins : demander une adresse
//      libre au Terminal, ranger là et scanner (le bon) ; poser à côté sans scan ; laisser en réception. « Valider mon rangement » : Samia dit bonsoir,
//      aucun verdict (le lendemain dira tout) ;
//   ② le lendemain (bouton « Le lendemain, 6 h ») : Yanis, préparateur (construit), écrit l'adresse où le Terminal l'envoie, vide : celle de la palette
//      cherchée (`paletteCherchee` : P3 si le système la croit ailleurs que là où elle est, sinon P9, la palette que Kevin a posée à côté sans scan).
//      L'élève ouvre des emplacements, la trouve, la transfère (la palette, puis l'emplacement), « Valider mon transfert » ;
//   ③ Samia écrit au transfert (ou à « Valider mon transfert » s'il n'y en a pas) : l'élève rend compte par PHRASES calculées SUR SON CHEMIN.
// Rien n'est jugé à l'écran avant « Valider mon transfert » ; ensuite le nom du critère sur la carte (l'adresse attendue en plus chez l'accompagné) ;
// le bilan détaillé dit juste / à corriger. « Corriger » rouvre le message à Samia, jamais le palettier (`finFige`).
//
// VÉRIFIÉ : voir l'en-tête de `contenus/action-ent813-donnees.js` ; Code du travail L4122-1 : le texte d'ENT-8.11 (`TEXTE_L4122_1`, recopié sur
// code.travail.gouv.fr le 22/10/2026). CONSTRUIT : `MENTION` (dit dans la séance et au pied des documents).

import { apresGeste, apresMail, tous } from '../core/declencheurs.js';
import { etapesPalettier, etatPalettier, paletteCherchee } from '../core/types/entrepot.js';
import { phrasesJustes } from '../core/phrases.js';
import { niveauEleve } from '../core/tirage.js';
import { QUESTIONS } from './questions/ENT-8.13.js';
import { ENTREPRISE as ENT_ACTION, EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, ech } from './action.js';
import { TEXTE_L4122_1, svgEtiquette } from './action-ent811.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, PHRASES_ID, SUJETS, KEVIN_MAIL, SAMIA_MAIL, YANIS_MAIL, GESTE, unDe, entrepotDe, jeuDeBase, nomDe, trouveEnDe,
  lignesCompte, SALUTATIONS, finsDe, FAUTE_KEVIN, CONSIGNE_MATIN, MENTION_ALLEE,
} from './action-ent813-donnees.js';

export { ID, ENTREPOT_ID, PHRASES_ID };

export const ENTREPRISE = { ...ENT_ACTION, exercice: 'Bienvenue chez Geodis' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « un jeudi, 20 h 30 », puis « le lendemain, 6 h », sans date
// Aucune date n'est écrite ; la Messagerie affiche pourtant l'horodatage de chaque message (même compromis qu'ENT-8.11 et 8.12) : le lendemain est le
// DERNIER VENDREDI (aujourd'hui si on est vendredi : jamais une date à venir), le soir la veille ; plus le temps réellement passé depuis l'ouverture.
export function tsScenario(hhmm, { db, decalage = 0, matin = false } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 7 - 5) % 7));
  if (!matin) d.setDate(d.getDate() - 1);
  d.setHours(h, mn, 0, 0);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return d.getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
export const soirValide = (db) => !!(etatPlan(db) && etatPlan(db).valide);
export const lendemainValide = (db) => !!(etatPlan(db) && etatPlan(db).lendemain && etatPlan(db).lendemain.valide);
const reponduSamia = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
// Le CHEMIN de l'élève, lu dans la base (null avant le lendemain) : la palette cherchée et ce qu'il en a fait.
export function cheminDe(db) {
  const c = paletteCherchee(db, entrepotDe);
  if (!c) return null;
  const E = etatPalettier(db, entrepotDe);
  const L = E.lendemain || {};
  const chemin = c.id !== 'P3' ? 'kevin' : (E.posees.P3 || E.confiees.P3) ? 'posee' : 'reception';
  return { chemin, id: c.id, nom: c.nom, systeme: c.adresseSysteme, reelle: c.adresseReelle, trouvee: !!L.trouvee,
    vers: L.transfert ? L.transfert.vers : null };
}

// ─────────────────────────────────────────────────────────────── les documents (dessins en traits, construits ; aucune image nouvelle)
const T = 'fill="none" stroke="#2b2824" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const TXT = 'stroke="none" fill="#2b2824"';
// Une palette chargée vue de face (des cartons sur une palette), en traits.
const palette = (x, y, w, h) => {
  const ch = h - 10, cw = w / 3;
  let s = `<rect x="${x}" y="${y + ch}" width="${w}" height="10"/><path d="M${x + 6} ${y + h} v-4 M${x + w / 2} ${y + h} v-4 M${x + w - 6} ${y + h} v-4"/>`;
  [0, 1].forEach((r) => [0, 1, 2].forEach((k) => { s += `<rect x="${x + k * cw}" y="${y + r * ch / 2}" width="${cw}" height="${ch / 2}"/>`; }));
  return s;
};
// L'allée encombrée : deux rangées de racks vues en perspective, une palette posée au milieu de l'allée de circulation. Personne.
const SVG_ALLEE = `<svg class="ac813-fig" viewBox="0 0 420 260" role="img" aria-label="Une allée d’entrepôt entre deux rangées de racks, vue de face : une palette chargée est posée au milieu de l’allée, sur le passage">
  <defs><pattern id="ac813sol" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="#2b2824" stroke-width="0.8"/></pattern></defs>
  <g ${T}>
    <path d="M20 250 L170 120 M400 250 L250 120 M170 120 H250"/>
    <path d="M20 250 V20 L170 60 V120 M60 216 V30 M110 172 V45 M150 138 V56 M20 90 L170 85 M20 170 L170 105"/>
    <path d="M400 250 V20 L250 60 V120 M360 216 V30 M310 172 V45 M270 138 V56 M400 90 L250 85 M400 170 L250 105"/>
    ${palette(145, 150, 130, 76)}
  </g>
  <rect x="135" y="227" width="150" height="7" fill="url(#ac813sol)" stroke="none"/>
  <text x="210" y="252" font-size="12" text-anchor="middle" ${TXT}>l’allée de circulation</text></svg>`;
// Un emplacement vu de près : deux montants, la lisse et son étiquette, et rien au-dessus. Personne.
const SVG_VIDE = `<svg class="ac813-fig" viewBox="0 0 380 250" role="img" aria-label="Un emplacement de rack vu de près, entre deux montants : l’étiquette d’adresse sur la lisse du bas, et rien au-dessus">
  <defs><pattern id="ac813sol2" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="#2b2824" stroke-width="0.8"/></pattern></defs>
  <g ${T}><path d="M40 240 V10 M340 240 V10" stroke-width="3"/><path d="M40 40 H340" stroke-width="3.4"/>
    <path d="M40 60 L60 40 M340 60 L320 40" stroke-width="1.2"/></g>
  <rect x="40" y="226" width="300" height="12" fill="url(#ac813sol2)" stroke="none"/>
  <path d="M30 238 H350" ${T}/>
  <rect x="130" y="196" width="120" height="26" rx="3" fill="#fdfbf7" stroke="#2b2824" stroke-width="1.6"/>
  <text x="190" y="214" font-size="13" font-weight="800" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" ${TXT}>B2-T03-N1-E2</text></svg>`;
const dessin = (id, titre, svg, pied = 'Dessin construit pour l’exercice.') => ({ id, titre, court: titre,
  html: `<article class="ac-doc" aria-label="${ech(titre)}">${svg}${PIED(pied)}</article>` });
const DOC_ALLEE = dessin('allee-encombree', 'Une allée', SVG_ALLEE);
const DOC_VIDE = dessin('emplacement-vide', 'Un emplacement', SVG_VIDE, `Dessin construit pour l’exercice. ${MENTION_ALLEE}`);
const DOC_ETIQUETTE = dessin('etiquette', 'Une étiquette', svgEtiquette('A1-T02-N1-E3'), `Dessin construit pour l’exercice. ${MENTION_ALLEE}`);
const DOC_POSTE = { id: 'poste', titre: 'Ta fin de poste', court: 'Ta fin de poste',
  html: `<article class="ac-doc" aria-label="Ta fin de poste">
    <p class="ac-t">Ta fin de poste</p>
    <p class="ac-st">Un jeudi, 20 h 30</p>
    <p>Tu es en stage chez <b>Geodis</b>, à l’entrepôt Action d’Ensuès-la-Redonne. Dernière demi-heure : tu ranges <b>deux palettes</b> au sol.</p>
    <p>Le système donne une <b>[[adresse donnée|adresse]]</b> à chaque palette. Tu ranges, puis tu <b>[[scanner|scannes]]</b> au Terminal.</p>
    <p>Demain matin, à 6 h, <b>Yanis</b>, [[préparateur]], préparera dans cette allée les commandes des magasins de la région marseillaise.</p>
    <p>Ta [[tutrice]] : <b>Samia</b>, cheffe d’équipe. <b>Kevin</b>, [[cariste]], est là pour la réserve.</p>
    ${PIED('Samia, Kevin et Yanis sont construits pour l’exercice.')}
  </article>` };
// « Le droit » : C. trav. L4122-1 (alinéas 1 et 3), le texte RECOPIÉ pour ENT-8.11 le 22/10/2026 (code.travail.gouv.fr).
const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-t">Le droit : qui donne les consignes ?</p>
    <p class="ac-art"><b>Code du travail, article L4122-1</b> (alinéas 1 et 3)</p>
    <div class="ac-cite">${TEXTE_L4122_1.map((p, i) => `<p>${i === 0 ? '« ' : ''}${p}${i === TEXTE_L4122_1.length - 1 ? ' »' : ''}</p>`).join('')}</div>
    ${PIED('Texte réel, recopié du Code du travail numérique (code.travail.gouv.fr, qui reprend Légifrance), consulté le 22/10/2026.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-art{margin:10px 0 2px; font-size:.95rem}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ac-cite p{margin:0 0 4px}
.ac811-fig,.ac813-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px auto 10px; color:#2b2824}
.ac811-fig text,.ac813-fig text{font-family:inherit}
`;
export const DOCUMENTS = [DOC_POSTE, DOC_ETIQUETTE, DOC_ALLEE, DOC_VIDE, DOC_DROIT];

// ─────────────────────────────────────────────────────────────── ③ les phrases du compte rendu, calculées UNE FOIS, à l'arrivée du message de Samia
export const phrasesSamia = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'passe', choix: (d) => lignesCompte(cheminDe(d)).passe, juste: 0 },
  { id: 'ou', choix: (d) => lignesCompte(cheminDe(d)).ou, juste: 0 },
  { id: 'fait', choix: (d) => lignesCompte(cheminDe(d)).fait, juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });
// Le texte choisi sur une ligne, dans le DERNIER message envoyé (null : rien d'envoyé).
function texteChoisi(db, ligne) {
  const mails = (db && db.mails) || [];
  const decl = mails.find((m) => m.folder === 'in' && m.phrases && m.phrases.id === PHRASES_ID);
  const envois = mails.filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === PHRASES_ID).sort((a, b) => (a.ts - b.ts) || (a.id - b.id));
  const L = decl && decl.phrases.lignes.find((l) => l.id === ligne);
  const dernier = envois[envois.length - 1];
  if (!L || !dernier) return null;
  const c = dernier.phrases.choix && dernier.phrases.choix[ligne];
  return Number.isInteger(c) ? L.choix[c] : '';
}

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jamais juste ni faux ; aucune date)
const SAMIA = { nom: EQUIPE.samia.nom, mail: SAMIA_MAIL }, KEVIN = { nom: EQUIPE.kevin.nom, mail: KEVIN_MAIL }, YANIS = { nom: 'Yanis', mail: YANIS_MAIL };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '20:30', { db: o.db, decalage: o.decalage || 0, matin: !!o.matin }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const ACCUEIL_SAMIA = 'Dernière demi-heure : deux palettes à ranger, et tu pourras partir. Kevin est là pour la réserve.';
export const KEVIN_POUSSE = 'Elle est prise ? Mets-la à côté, on verra demain. Il est tard.';
export const SOIR_SAMIA = 'Bonne soirée ! À demain 6 h.';
export const COMPTE_SAMIA = 'C’est réglé ? Raconte-moi, en trois phrases.';
export const FIN_SAMIA = 'Merci. Une palette posée sans scan, c’est une palette perdue pour le système. On en reparle avec Kevin.';
// Le message de Yanis : l'adresse où le système l'envoie (celle de la palette cherchée, vide). Accompagné : « pas loin » et le produit cherché.
export function texteYanis(db) {
  const c = paletteCherchee(db, entrepotDe);
  const a = c ? c.adresseSysteme : '…';
  const aide = niveauEleve(db) === 'accompagne' && c ? ` Elle doit être pas loin. C’est une palette de ${c.nom}.` : '';
  return `Bonjour ! Le terminal m’envoie en ${a}, niveau 1. C’est vide. Je ne peux pas préparer le magasin de Marseille. Tu peux regarder ?${aide}`;
}
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(SAMIA, prenom, SUJETS.accueil, `Bonsoir ${prenom} ! ${ACCUEIL_SAMIA}\n\nSamia`, { heure: '20:30' })] }),
  corrections: {
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '06:40', matin: true })] }),
  },
  declencheurs: [
    // Kevin pousse au premier « Occupé » sur P3 (son adresse donnée ouverte, P3 en main) : aucun choix dans le message.
    { id: 'kevin', quand: apresGeste(GESTE('occupe:P3')),
      semer: (prenom, db) => ({ mails: [mail(KEVIN, prenom, SUJETS.kevin, `${KEVIN_POUSSE}\n\nKevin`, { db, heure: '20:40' })] }) },
    // « Valider mon rangement » : bonsoir, aucun verdict (le lendemain dira tout).
    { id: 'soir', quand: apresGeste(GESTE('valider')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.soir, `${SOIR_SAMIA}\n\nSamia`, { db, heure: '20:55' })] }) },
    // Le lendemain, 6 h : Yanis (la palette cherchée, lue dans la base), puis la consigne de Samia et « Le droit » (pour q-collegue).
    { id: 'yanis', quand: apresGeste(GESTE('phase:lendemain')),
      semer: (prenom, db) => ({ mails: [mail(YANIS, prenom, SUJETS.yanis, `${texteYanis(db)}\n\nYanis`, { db, heure: '06:00', matin: true })] }) },
    { id: 'matin', quand: apresGeste(GESTE('phase:lendemain')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.matin, `Bonjour ${prenom} ! Yanis t’a écrit. ${CONSIGNE_MATIN}\n\n`
        + 'Je te joins « Le droit », à lire.\n\nSamia', { db, heure: '06:02', matin: true, extra: { pieces: ['droit'] } })] }) },
    // Le transfert enregistré (ou « Valider mon transfert » sans transfert : personne n'est bloqué) : Samia demande le compte rendu, PHRASES
    // calculées ICI, sur le chemin de l'élève.
    { id: 'compte', quand: unDe(apresGeste(GESTE('transfert')), apresGeste(GESTE('valider:lendemain'))),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.compte,
        `${COMPTE_SAMIA}\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nSamia`,
        { db, heure: '06:20', matin: true, extra: { phrases: phrasesSamia(prenom) } })] }) },
    { id: 'fin', quand: tous(apresGeste(GESTE('valider:lendemain')), apresMail({ a: SAMIA.mail })),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.fin, `${FIN_SAMIA}\n\nSamia`, { db, heure: '06:30', matin: true })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 21/10/2026, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant « Valider mon rangement » (le soir), « Valider mon transfert » (le
// lendemain) ni avant l'envoi du compte rendu : l'inaction vaut 0. Le bon geste face à Kevin vaut 3 (adresse libre demandée et rangée là 2, scannée
// 1) : un élève piégé peut avoir 17/20 (décision 4 bis). P1 (l'échauffement) et les deux gardes (`pasPoseHaut`, `charge` : une palette laissée en
// réception les rend fausses, lot 3) sont jugés sans poids ni ligne au bandeau. Le plan n'a pas d'`ecran` : il ne se rouvre pas.
export const GROUPES = { soir: 'Ranger en fin de poste', retrouver: 'Retrouver la palette', transfert: 'La remettre en ordre au terminal',
  compte: 'Rendre compte à Samia', forme: 'Le ton du message' };
export const POIDS = {
  'adresseLibre-P3': 2, 'scan-P3': 1,
  retrouvee: 3, trouveeVite: 1,
  'transfert-place': 2, 'transfert-scan': 3,
  'cr-passe': 1, 'cr-ou': 1, 'cr-fait': 1,
  'cr-forme': 1,
};
const nomP3 = (db) => nomDe(jeuDeBase(db), 'P3');
const PLAN_JALON = {
  'adresseLibre-P3': [GROUPES.soir, 'P3 : adresse libre demandée au Terminal, et rangée là', (db) => `P3 (${nomP3(db)}) : adresse libre demandée au Terminal, et rangée là`],
  'scan-P3': [GROUPES.soir, 'P3 scannée à l’adresse libre', (db) => `P3 (${nomP3(db)}) scannée à l’adresse libre`],
  retrouvee: [GROUPES.retrouver, 'La palette cherchée retrouvée'],
  trouveeVite: [GROUPES.retrouver, 'Retrouvée en 4 ouvertures au plus', (db) => `Retrouvée en ${trouveEnDe(niveauEleve(db))} ouvertures au plus`],
  'transfert-place': [GROUPES.transfert, 'La palette remise à son adresse'],
  'transfert-scan': [GROUPES.transfert, 'Le transfert enregistré au Terminal : le système sait où elle est'],
};
const GARDES = { 'place-P1': 'P1 posée à son adresse (non notée)', 'scan-P1': 'P1 scannée (non notée)',
  pasPoseHaut: 'Aucune palette posée soi-même au-dessus du sol', charge: 'Toutes les palettes rangées sous leur plaque de charge' };
const ORDRE = ['place-P1', 'scan-P1', 'adresseLibre-P3', 'scan-P3', 'pasPoseHaut', 'charge', 'retrouvee', 'trouveeVite', 'transfert-place', 'transfert-scan'];
function jalonsPlan() {
  const L = etapesPalettier(entrepotDe);
  const ids = L.map((e) => e.id);
  const manque = ORDRE.filter((id) => !ids.includes(id)), deTrop = ids.filter((id) => !ORDRE.includes(id));
  if (manque.length || deTrop.length) {
    throw new Error(`ENT-8.13 : les jalons du plan ne sont pas ceux attendus (manquent : ${manque.join(', ') || '—'} ; en trop : ${deTrop.join(', ') || '—'})`
      + ' — les lots 3 et 5 du chantier E-7 sont-ils livrés ?');
  }
  return ORDRE.map((id) => {
    const e = L.find((x) => x.id === id);
    // P1 et les deux gardes : jugés (la séance n'est finie qu'avec eux), sans poids ni ligne au bandeau (`compte: false`).
    if (GARDES[id]) return Object.assign(e, { titre: GARDES[id], poids: 0, compte: false });
    const [groupe, titre, titreBilan] = PLAN_JALON[id];
    return Object.assign(e, { titre, titreBilan: titreBilan || titre, groupe, poids: POIDS[id] });
  });
}
// Le compte rendu : chaque ligne contre la phrase juste de SON chemin. « C'est la faute de Kevin. » sur « ce qui s'est passé » ne coûte que la forme
// (COORDINATION n° 7) : la ligne reste juste ; la forme = salutation, fin, et pas d'accusation.
const ECRAN = `phrases:${PHRASES_ID}`;
const ligneCR = (id, ligne, titre, accepte = () => false) => ({ id, titre, groupe: GROUPES.compte, poids: POIDS[id], ecran: ECRAN,
  verifier(db) {
    const r = phrasesJustes(db, PHRASES_ID);
    if (!r.envoye) return attente;
    return r.justes.includes(ligne) || accepte(texteChoisi(db, ligne)) ? ok : ko;
  } });
export const ETAPES = [
  ...jalonsPlan(),
  ligneCR('cr-passe', 'passe', 'Le compte rendu : ce qui s’est passé', (t) => t === FAUTE_KEVIN),
  ligneCR('cr-ou', 'ou', 'Le compte rendu : où était la palette'),
  ligneCR('cr-fait', 'fait', 'Le compte rendu : ce que tu as fait'),
  { id: 'cr-forme', titre: 'Le ton : la salutation, la fin, et pas d’accusation', groupe: GROUPES.forme, poids: POIDS['cr-forme'], ecran: ECRAN,
    verifier(db) {
      const r = phrasesJustes(db, PHRASES_ID);
      if (!r.envoye) return attente;
      return ['salutation', 'fin'].every((l) => r.justes.includes(l)) && texteChoisi(db, 'passe') !== FAUTE_KEVIN ? ok : ko;
    } },
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'entrepot', libelle: 'Fin de poste : range les palettes', fait: soirValide },
  { vue: 'entrepot', libelle: 'Le lendemain : retrouve la palette', fait: lendemainValide },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Samia', fait: reponduSamia },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_813 = {
  ...LEXIQUE,
  adresse: 'Le code qui dit où ranger une palette : allée et côté, travée, niveau, emplacement (par exemple A1-T03-N1-E2).',
  'adresse donnée': 'L’adresse que le système donne à une palette : là où il croit qu’elle sera rangée.',
  'adresse libre': 'Une adresse que le Terminal donne quand l’adresse donnée est prise : on y range la palette, puis on la scanne.',
  scanner: 'Lire un code-barres avec le terminal, pour que le système enregistre où est la palette.',
  transférer: 'Changer une palette d’emplacement et le dire au système en scannant : la palette, puis le nouvel emplacement.',
  emplacement: 'La place d’une palette sur un niveau d’une travée (E1, E2, E3 de gauche à droite).',
  rupture: 'Un produit qui manque en rayon, au magasin : les clients ne peuvent pas l’acheter.',
  préparateur: 'Personne qui prélève les produits dans l’entrepôt pour préparer les commandes des magasins.',
  cariste: 'Personne qui conduit un chariot élévateur pour charger, décharger et ranger les palettes.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), la préparation des commandes à la voix '
  + 'à Ensuès, les magasins de la région marseillaise livrés depuis Ensuès, le Code du travail. Construits pour l’exercice : l’allée, les adresses, '
  + 'le stock et les palettes à évacuer (Action et Geodis ne publient pas l’organisation de l’entrepôt), Samia, Kevin et Yanis, la fin de poste et '
  + 'le lendemain, le terminal et ses messages, le magasin de Marseille (aucun magasin n’est nommé), les produits (sans marque).';
export const ACCUEIL = {
  titre: 'La palette d’à côté',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Fin de poste', 'Plan de l’entrepôt : range les deux palettes, scanne-les, puis « Valider mon rangement ».'],
    ['② Le lendemain, 6 h', 'Le bouton « Le lendemain, 6 h », sur le plan. Yanis, préparateur, t’écrira.'],
    ['③ Rendre compte à Samia', 'Elle t’écrit quand tout est en ordre. Une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Ton rangement et ton transfert sont validés : ils ne se refont pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 13 : la palette d’à côté',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_813,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  entrepot: entrepotDe,
  suite: SUITE,
  equipe: { ...EQUIPE, yanis: { nom: 'Yanis', role: 'préparateur', appel: 'Yanis', registre: 'tu' } },
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
