// ENT-8.3 — Action, « un autre site, un autre prestataire » : le contenu de la séance (brief `docs/briefs/ENT-8.3-action-autre-site.md`,
// décisions du chef de chantier dans `docs/briefs/COORDINATION-action.md` §6.2). Univers commun : `contenus/action.js` (lu ; seuls les lieux
// de Roques et d’Onnaing y ont été ajoutés). Données pures : `contenus/action-ent83-donnees.js`. Activité : `activites/action-autre-site.js`.
// Questions : `contenus/questions/ENT-8.3.js`. Corrigé : `contenus/corriges/ENT-8.3.js`.
//
// Lundi 7 décembre, 8 h (aucune année écrite). Nouvelle PFMP de l’élève, chez GXO à Labastide-Saint-Pierre ; tuteur : Romain (construit).
// CAP OL, ENTRAÎNEMENT de CAP-C1.1 (deuxième temps, après ENT-8.1). Un écran par étape (décision de Tristan du 16/10/2026) :
//   Avant de commencer → ① la carte de France (Labastide, Roques, le port du Havre ; Onnaing chez un confirmé) → ② « Qui est qui ? »
//   (document « Le réseau d’Action en France » à gauche) → ③ « La chaîne de Romain » (dessin à gauche, deux cases fausses tirées : l’erreur
//   induite) → ④ « Ce que je change » (la remorque à deux planchers à gauche) → bilan. Chaque écran s’ouvre à l’envoi du précédent ; la
//   barre « Étape suivante » y mène sans passer par la Messagerie ; Romain écrit quand même un message court à chaque étape.
// Rien n’est jugé à l’écran ; le bandeau de fin (5 lignes, détaillé : `bilanDetail`) ; « Corriger » rouvre les fiches fausses, jamais la
// carte ni une question (`finFige`).
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) — voir aussi l’en-tête de `contenus/action-ent83-donnees.js` et `MENTION` ci-dessous :
//   Vérifié (brief §2, recherche de Cowork) : Labastide-Saint-Pierre (82) construit par Action, exploité par XPO puis GXO, magasins du Sud ;
//   Onnaing (59), GXO, le plus récent ; Moissy-Cramayel, ID Logistics puis XPO puis GXO ; Belleville et Verrières-en-Anjou, Kuehne+Nagel ;
//   Ensuès, Geodis ; semi-remorques à deux planchers ; environ 150 nouveautés par semaine ; l’arrivée annoncée d’Action à Roques.
//   Construit : Romain et ses messages ; que Labastide livre Roques ; les premières livraisons de ce magasin ; le trajet Le Havre →
//   Labastide → Roques ; la chaîne de Romain et ses erreurs ; les situations de « Ce que je change ». Textes de Cowork écrits tels quels.
//   Le livret d’accueil GXO publié n’est PAS recopié.

import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { apresFiche, localiserFini } from '../core/declencheurs.js';
import { QUESTIONS, ROMAIN } from './questions/ENT-8.3.js';
import * as ACTION from './action.js';
import { LEXIQUE, LOGO, STYLE_DOCUMENTS, PIED, PIED_RECONSTITUTION, ech, figure } from './action.js';

import {
  ID, VUE, ID_VOLET, FICHES, TIRAGE, LIEUX_83, FLUX_83, RESEAU_83, EXPLOITANTS, ROLES, CASES, CHAMPS_CHAINE, IMAGES_83,
  entrepotsDe, acteursDe, situationsSocle, situationsDe, chaineDessinee, etiquettesDe, jugerChaine, champEntrepot, champActeur,
  champSituation, choixSituation, fiche, dejaEnvoyee,
} from './action-ent83-donnees.js';

export { ID, VUE, ID_VOLET, FICHES, TIRAGE } from './action-ent83-donnees.js';

// ─────────────────────────────────────────────────────────────── l’entreprise de CETTE séance (le site change : GXO à Labastide)
// Les clés de même nom exportées ici remplacent celles de l’univers (règle de la fabrique) : le bandeau ne dit plus « Geodis, Ensuès ».
export const ENTREPRISE = { ...ACTION.ENTREPRISE,
  sousTitre: 'Entrepôt GXO de Labastide-Saint-Pierre (82) — commerce à petits prix', exercice: 'Bienvenue chez GXO' };
export const VOCAB = { ...ACTION.VOCAB, mailDomain: 'gxo-labastide.example' };
export const EQUIPE_83 = { romain: ROMAIN };

// ─────────────────────────────────────────────────────────────── l’heure du scénario (lundi 7 décembre, aucune année écrite)
// Le 7 décembre de l’année scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l’année d’avant), comme ENT-8.1.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 11, 7, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── ① la carte de France (vue « Localiser »)
// Mêmes niveaux qu’en ENT-8.1 (question ouverte n° 1, défaut tranché par le chef de chantier) : l’entraînement vient des lieux nouveaux.
export const LOCALISER = {
  id: VUE, libelle: 'Carte de France', titre: 'Retrouve où nous sommes, où va la marchandise et d’où elle arrive.', contours: FRANCE,
  lieux: LIEUX_83,
  flux: FLUX_83,
  reseau: RESEAU_83,
  fin: { titre: 'Le chemin des produits vers Roques',
    texte: 'Les produits arrivent d’Asie au Havre, l’entrepôt de Labastide prépare les commandes des magasins du Sud-Ouest. Le nouveau magasin '
      + 'de Roques est à une heure de route. (Le trajet du Havre à Labastide, puis à Roques, est imaginé pour l’exercice ; le point de Roques est au centre de la commune.)' },
};

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
export const MENTION = 'Réels : Action, GXO (qui fait tourner l’entrepôt de Labastide-Saint-Pierre pour Action), Geodis, Kuehne+Nagel et leurs entrepôts, '
  + 'le port du Havre, l’arrivée annoncée d’Action à Roques. Construit : Romain, le trajet du Havre à Labastide puis à Roques, le fait que '
  + 'Labastide livre ce magasin, la chaîne de Romain, tous les documents. Les points de Roques et d’Onnaing sont au centre de la commune.';

// Pour « Avant de commencer » : le contexte du stage (aucune réponse d’un jalon).
const DOC_STAGE = { id: 'stage', titre: 'Ton stage chez GXO', court: 'Ton stage',
  html: `<article class="ac-doc" aria-label="Ton stage chez GXO">
    <p class="ac-t">Ton stage chez GXO</p>
    <p class="ac-st">Lundi 7 décembre, 8 h</p>
    <p>Tu commences un nouveau stage (PFMP) chez <b>GXO</b>, à l’entrepôt de <b>Labastide-Saint-Pierre</b>, dans le Tarn-et-Garonne.</p>
    <p>GXO est un [[prestataire logistique]] : il fait tourner l’entrepôt pour <b>Action</b>, qui vend des produits à petits prix.</p>
    <p>Ton [[tuteur]] : <b>Romain</b>, chef d’équipe à la réception.</p>
    ${figure('entrepot')}
    ${PIED('Romain est construit pour l’exercice.')}
  </article>` };

// « Le réseau d’Action en France » (brief §4, étape 2) : six entrepôts, faits VÉRIFIÉS du §2, en phrases, dans un ordre différent de la
// fiche (dont l’ordre est tiré par élève). Aucune année.
export const DOC_RESEAU = { id: 'reseau', titre: 'Le réseau d’Action en France', court: 'Le réseau d’Action',
  html: `<article class="ac-doc" aria-label="Le réseau d’Action en France">
    <img class="ac-logo" src="${LOGO}" alt="Logo d’Action">
    <p class="ac-t">Le réseau d’Action en France</p>
    <p class="ac-st">Action possède les marchandises et choisit, pour chaque entrepôt, une entreprise qui le fait tourner : un [[prestataire logistique]]. Action est le [[donneur d’ordres]].</p>
    <div class="ac-l"><span class="ac-n">1</span><p><b>Ensuès-la-Redonne</b>, près de Marseille : c’est <b>Geodis</b> qui fait tourner cet entrepôt.</p></div>
    <div class="ac-l"><span class="ac-n">2</span><p><b>Moissy-Cramayel</b>, près de Paris : d’abord ID Logistics, puis XPO ; aujourd’hui, c’est <b>GXO</b>.</p></div>
    <div class="ac-l"><span class="ac-n">3</span><p><b>Belleville</b>, dans le Rhône : c’est <b>Kuehne+Nagel</b>.</p></div>
    <div class="ac-l"><span class="ac-n">4</span><p><b>Labastide-Saint-Pierre</b>, près de Montauban : c’est <b>GXO</b>. Il livre les magasins du Sud-Ouest.</p></div>
    <div class="ac-l"><span class="ac-n">5</span><p><b>Verrières-en-Anjou</b>, près d’Angers : c’est <b>Kuehne+Nagel</b>.</p></div>
    <div class="ac-l"><span class="ac-n">6</span><p><b>Onnaing</b>, dans le Nord, le plus récent : c’est <b>GXO</b>.</p></div>
    ${PIED(PIED_RECONSTITUTION)}
  </article>` };

// « La chaîne de Romain » : 6 cases numérotées reliées par des flèches, dessinées pour CET élève (ses deux cases fausses à leur place, SANS
// aucune marque : même style que les cases justes). Noir et blanc, grand. Sur une base vide : le jeu modèle (contrôle au chargement).
// Deux rangées de trois cases (1 → 2 → 3, puis 4 → 5 → 6), un retour fléché de la case 3 à la case 4 : tient à 1366 × 768 sans défiler.
const FLECHE = '<svg class="ac-fl" viewBox="0 0 22 24" aria-hidden="true"><path d="M1 12 H18 M12 5 L19 12 L12 19" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const RETOUR = '<svg class="ac-ret" viewBox="0 0 600 34" preserveAspectRatio="none" aria-hidden="true"><path d="M500 0 V14 H100 V32 M91 23 L100 32 L109 23" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
const caseHtml = (c) => `<li class="ac-ch-case"><span class="ac-ch-n">${c.n}</span><span class="ac-ch-t">${ech(c.lib)}</span></li>`;
const flecheHtml = '<li class="ac-ch-fl" aria-hidden="true">' + FLECHE + '</li>';
export const docChaine = (db) => { const C = chaineDessinee(db);
  return `<article class="ac-doc" aria-label="La chaîne de Romain">
    <p class="ac-t">La chaîne de Romain</p>
    <p class="ac-st">Le chemin d’un produit jusqu’au nouveau magasin de Roques, dessiné par Romain pour les nouveaux.</p>
    <ol class="ac-ch">${caseHtml(C[0])}${flecheHtml}${caseHtml(C[1])}${flecheHtml}${caseHtml(C[2])}<li class="ac-ch-retour" aria-hidden="true">${RETOUR}</li>${
      caseHtml(C[3])}${flecheHtml}${caseHtml(C[4])}${flecheHtml}${caseHtml(C[5])}</ol>
    ${PIED('Document pédagogique — dessin construit pour l’exercice, non contractuel.')}
  </article>`; };
export const DOC_CHAINE = { id: 'chaine-romain', titre: 'La chaîne de Romain', court: 'La chaîne de Romain', html: docChaine };

// La remorque à deux planchers (dessin du chantier images, à l’encre : sur un fond clair, même si le thème est sombre).
export const DOC_REMORQUE = { id: 'remorque', titre: 'Le camion qui livre les magasins', court: 'Le camion',
  html: `<article class="ac-doc" aria-label="Le camion qui livre les magasins">
    <p class="ac-t">Le camion qui livre les magasins</p>
    <p class="ac-st">Ce camion part de Labastide pour Roques.</p>
    <figure class="ac-fig ac-trait"><img src="${ech(IMAGES_83.remorque.src)}" alt="${ech(IMAGES_83.remorque.alt)}"><figcaption>${ech(IMAGES_83.remorque.mention)}</figcaption></figure>
    ${PIED('Document pédagogique — dessin construit pour l’exercice.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-n{color:#1a1915}
.ac-ch{list-style:none; margin:8px 0 10px; padding:0; display:grid; grid-template-columns:1fr 24px 1fr 24px 1fr; align-items:stretch; color:#1a1915}
.ac-ch-case{display:flex; flex-direction:column; align-items:flex-start; gap:6px; border:2px solid #1a1915; border-radius:6px; padding:8px 10px;
  background:rgba(253,251,247,.6); min-height:92px}
.ac-ch-n{flex:none; display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border:2px solid #1a1915; border-radius:50%;
  font-weight:800; font-size:1.05rem}
.ac-ch-t{font-size:1.02rem; font-weight:600; line-height:1.28}
.ac-ch-fl{display:flex; align-items:center; justify-content:center}
.ac-fl{width:20px; height:22px}
.ac-ch-retour{grid-column:1 / -1; height:34px}
.ac-ret{display:block; width:100%; height:34px}
.ac-trait{max-width:none; background:rgba(253,251,247,.92); padding:8px; border:1px solid #e3ded3; border-radius:4px}
.ac-trait img{color:#1a1915}
`;

// ─────────────────────────────────────────────────────────────── les fiches (document à gauche, consigne de Romain en haut)
export const FICHE_QUI = {
  id: FICHES.qui, libelle: 'Qui est qui ?', titre: 'Qui est qui ?',
  sousTitre: 'Romain : « Lis le document à gauche. Dis qui fait tourner chaque entrepôt, puis le rôle de chaque acteur. »',
  documents: ['reseau'],
  bouton: 'Ouvrir la fiche « Qui est qui ? »',
  quand: (db) => localiserFini(VUE)(db, ID) || dejaEnvoyee(FICHES.qui)(db),
  blocs: (db) => [
    { type: 'cadre', titre: 'Qui fait tourner cet entrepôt ?', blocs: entrepotsDe(db).map((p, i) => ({ type: 'liste', id: champEntrepot(i), lib: p.nom,
      vide: 'Choisir…', manque: p.nom, choix: EXPLOITANTS })) },
    { type: 'cadre', titre: 'Quel est son rôle ?', blocs: acteursDe(db).map((p, i) => ({ type: 'liste', id: champActeur(i), lib: p.nom,
      vide: 'Choisir…', manque: p.nom, choix: ROLES })) },
  ],
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va te répondre.' },
};
export const FICHE_CHAINE = {
  id: FICHES.chaine, libelle: 'La chaîne de Romain', titre: 'Corriger la chaîne',
  sousTitre: 'Romain : « J’ai dessiné le chemin d’un produit jusqu’à Roques. J’ai fait deux erreurs : trouve les deux cases fausses et dis ce qu’elles devraient dire. »',
  documents: ['chaine-romain'], largeurDocs: 1.25,
  bouton: 'Ouvrir la fiche « La chaîne de Romain »',
  blocs: (db) => {
    const E = etiquettesDe(db);
    return CHAMPS_CHAINE.map((c, i) => ({ type: 'cadre', titre: `Erreur ${i + 1}`, blocs: [
      { type: 'liste', id: c.cas, lib: 'La case n°', vide: 'Choisir…', manque: `le numéro de la case (erreur ${i + 1})`, choix: CASES },
      { type: 'liste', id: c.etiq, lib: 'devrait dire', vide: 'Choisir…', manque: `ce que la case devrait dire (erreur ${i + 1})`, choix: E },
    ] }));
  },
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va te répondre.' },
};
export const FICHE_CHANGE = {
  id: FICHES.change, libelle: 'Ce que je change', titre: 'Ce que je change',
  sousTitre: 'Romain : « Ce que tu fais ici se voit au magasin de Roques. Pour chaque situation, choisis ce qui arrive là-bas. »',
  documents: ['remorque'],
  bouton: 'Ouvrir la fiche « Ce que je change »',
  blocs: (db) => situationsDe(db).map((p, i) => ({ type: 'liste', id: champSituation(i), lib: p.texte, vide: 'Au magasin de Roques…',
    manque: `la situation ${i + 1}`, choix: choixSituation(db, p) })),
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va te répondre.' },
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de questions = 20)
// Poids validés par Tristan le 15/10/2026 (brief §5) : La carte de France 4,5 (0,75 × région et département des 3 lieux) · Qui est qui ? 4
// (3 entrepôts à 0,75 ; 2 rôles à 0,875) · La chaîne de Romain 4 (erreur trouvée 1 × 2 ; erreur corrigée 1 × 2) · Ce que je change 3,5
// (facile 1, moyenne 1,25, difficile 1,25) · Les questions de Romain 4 (`part`). Rien n’est vrai avant l’envoi d’une fiche ou le premier
// essai d’une étape de la carte : l’inaction vaut 0. Les lignes se lisent par RANG dans la fiche, jamais par un id visible dans la page.
export const GROUPES = { carte: 'La carte de France', qui: 'Qui est qui ?', chaine: 'La chaîne de Romain', change: 'Ce que je change' };
export const POIDS_SITUATION = { facile: 1, moyen: 1.25, difficile: 1.25 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };
const ECRAN = { qui: `fiche:${FICHES.qui}`, chaine: `fiche:${FICHES.chaine}`, change: `fiche:${FICHES.change}` };

// L’entrepôt de la ligne : `fixe` = Labastide ; `k` = le k-ième entrepôt TIRÉ (dans l’ordre de la fiche de l’élève).
function entrepotDe(db, quoi) {
  const L = entrepotsDe(db);
  const idx = quoi === 'fixe' ? L.findIndex((p) => p.id === 'labastide')
    : L.map((p, i) => [p, i]).filter(([p]) => p.id !== 'labastide')[quoi]?.[1] ?? -1;
  return [L[idx], idx];
}
function jugerEntrepot(db, quoi) {
  const f = fiche(db, FICHES.qui);
  if (!f.envoye) return attente;
  const [p, i] = entrepotDe(db, quoi);
  if (!p) throw new Error(`entrepôt « ${quoi} » absent du tirage de l’élève`);
  return f.valeurs[champEntrepot(i)] === p.exploitant ? ok : ko;
}
function jugerActeur(db, k) {
  const f = fiche(db, FICHES.qui);
  if (!f.envoye) return attente;
  const p = acteursDe(db)[k];
  if (!p) throw new Error(`acteur n° ${k + 1} absent du tirage de l’élève`);
  return f.valeurs[champActeur(k)] === p.role ? ok : ko;
}
function jugerChaineJalon(db, i, quoi) {
  const f = fiche(db, FICHES.chaine);
  if (!f.envoye) return attente;
  const r = jugerChaine(db, f.valeurs)[i];
  if (!r) throw new Error(`erreur n° ${i + 1} absente du tirage de l’élève`);
  return r[quoi] ? ok : ko;
}
function situationDe(db, d) {
  const L = situationsSocle(db), i = L.findIndex((p) => p.difficulte === d);
  return [L[i], i];
}
function jugerSituation(db, p, i) {
  const f = fiche(db, FICHES.change);
  if (!f.envoye) return attente;
  if (!p) throw new Error('situation absente du tirage de l’élève');
  return f.valeurs[champSituation(i)] === p.juste ? ok : ko;
}

export const ETAPES = [
  ...etapesLocaliser(LOCALISER, ID).map((j) => (j.bonus ? j : Object.assign(j, { poids: 0.75, groupe: GROUPES.carte }))),
  ...[['labastide', 'fixe'], ['tire-1', 0], ['tire-2', 1]].map(([id, quoi]) => ({
    id: `qui-entrepot-${id}`, titre: 'Qui est qui ? : qui fait tourner un entrepôt', groupe: GROUPES.qui, ecran: ECRAN.qui, poids: 0.75,
    // Le bilan détaillé (CAP) : le nom de l’entrepôt, tel qu’écrit sur la fiche (jamais son exploitant).
    titreBilan: (db) => { const [p] = entrepotDe(db, quoi); return p ? `Qui fait tourner : ${p.nom}` : null; },
    verifier: (db) => jugerEntrepot(db, quoi) })),
  ...[0, 1].map((k) => ({
    id: `qui-acteur-${k + 1}`, titre: 'Qui est qui ? : le rôle d’un acteur', groupe: GROUPES.qui, ecran: ECRAN.qui, poids: 0.875,
    titreBilan: (db) => { const p = acteursDe(db)[k]; return p ? `Son rôle : ${p.nom}` : null; },
    verifier: (db) => jugerActeur(db, k) })),
  // La chaîne, jugée SANS ORDRE (brief §5) ; titres sans numéro de case, sans chiffre.
  ...[['trouvee', 'trouvée'], ['corrigee', 'corrigée']].flatMap(([quoi, mot]) => [0, 1].map((i) => ({
    id: `chaine-${quoi}-${i + 1}`, titre: `La chaîne : ${i ? 'l’autre' : 'une'} erreur ${mot}`, groupe: GROUPES.chaine, ecran: ECRAN.chaine, poids: 1,
    titreBilan: `La chaîne : ${i ? 'l’autre' : 'une'} erreur ${mot}`,
    verifier: (db) => jugerChaineJalon(db, i, quoi) }))),
  ...['facile', 'moyen', 'difficile'].map((d) => ({
    id: `change-${d}`, titre: 'Ce que je change : ce qui arrive au magasin', groupe: GROUPES.change, ecran: ECRAN.change, poids: POIDS_SITUATION[d],
    // Le bilan détaillé (CAP) : le rang de la situation sur la fiche de l’élève (l’ordre y est tiré).
    titreBilan: (db) => { const i = situationDe(db, d)[1]; return i >= 0 ? `Ce que je change : la situation n° ${i + 1}` : null; },
    verifier: (db) => { const [p, i] = situationDe(db, d); return jugerSituation(db, p, i); } })),
  // Le cas bonus du confirmé : sans poids ni groupe, `null` quand l’élève ne l’a pas reçu (caché à l’élève). Le lieu bonus de la carte
  // (Onnaing) rend ses deux jalons bonus par `etapesLocaliser`.
  { id: 'change-bonus', bonus: true, ecran: ECRAN.change, titre: 'Ce que je change : situation en plus',
    verifier: (db) => { const p = TIRAGE.piecesBonus(db, 'situations')[0]; return p ? jugerSituation(db, p, situationsSocle(db).length) : null; } },
];

// ─────────────────────────────────────────────────────────────── les messages de Romain (au tu ; date du scénario)
const ROMAIN_MAIL = { nom: ROMAIN.nom, mail: `romain@${VOCAB.mailDomain}` };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '08:00', { db: o.db, decalage: o.decalage || 0 }),
  from: ROMAIN_MAIL.nom, fromMail: ROMAIN_MAIL.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (sujet) => (prenom, n, db) => ({ mails: [mail(prenom, `RE : ${sujet}`, 'Merci, j’ai ta nouvelle fiche.\n\nRomain', { db, decalage: 1 })] });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, 'Bienvenue chez GXO',
    `Bonjour ${prenom}, bienvenue chez GXO à Labastide-Saint-Pierre ! Je suis Romain, chef d’équipe à la réception, ton [[tuteur]] pour ce stage.\n\n`
      + 'Ici, on travaille pour Action, comme Geodis à Ensuès. Cette semaine, on prépare les premières livraisons du nouveau magasin de Roques.\n\n'
      + 'Commence par la carte.\n\nRomain')] }),
  declencheurs: [
    { id: 'qui', quand: localiserFini(VUE), semer: (prenom, db) => ({ mails: [mail(prenom, 'Qui est qui ?',
      'Bravo. Action a plusieurs [[entrepôt|entrepôts]], et ce n’est pas toujours la même entreprise qui les fait tourner. Lis le document et remplis la fiche.\n\nRomain',
      { db, decalage: 1, extra: { ouvreFiche: FICHES.qui } })] }) },
    { id: 'chaine', quand: apresFiche(FICHES.qui), semer: (prenom, db) => ({ mails: [mail(prenom, 'La chaîne de Romain',
      'J’ai dessiné le chemin d’un produit jusqu’à Roques pour les nouveaux. J’ai fait deux erreurs. Trouve-les et corrige-les.\n\nRomain',
      { db, decalage: 1, extra: { ouvreFiche: FICHES.chaine } })] }) },
    { id: 'change', quand: apresFiche(FICHES.chaine), semer: (prenom, db) => ({ mails: [mail(prenom, 'Ce que je change',
      'Dernière chose : ce que tu fais ici se voit au magasin de Roques. Pour chaque situation, choisis ce qui arrive là-bas.\n\nRomain',
      { db, decalage: 1, extra: { ouvreFiche: FICHES.change } })] }) },
    { id: 'fin', quand: apresFiche(FICHES.change), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci',
      `Merci ${prenom}. Jeudi 17, avant Noël, tu viens avec moi à la réception : ça va être chargé.\n\nRomain`, { db, decalage: 2 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: { [FICHES.qui]: accuse('Qui est qui ?'), [FICHES.chaine]: accuse('La chaîne de Romain'), [FICHES.change]: accuse('Ce que je change') },
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
// Les mots du brief (§4) ; tournure neutre, niveau CAP. « remorque à deux planchers » décrit l’objet sans dire à quoi il sert (question P).
export const LEXIQUE_83 = {
  'prestataire logistique': 'Entreprise qui fait la logistique pour le compte d’une autre. GXO est le prestataire d’Action à Labastide : il fait tourner l’entrepôt, les produits restent à Action.',
  'donneur d’ordres': 'L’entreprise qui confie un travail à une autre et lui dit quoi faire. Pour GXO, le donneur d’ordres est Action.',
  entrepôt: LEXIQUE.entrepôt,
  hub: 'Grand site où arrivent les produits venus de loin, avant de repartir vers les entrepôts.',
  'porte-conteneurs': 'Très grand bateau qui transporte des conteneurs d’un port à l’autre.',
  tuteur: LEXIQUE.tuteur,
  'remorque à deux planchers': 'Remorque de camion qui a un second plancher, à mi-hauteur : elle a deux étages.',
  filmer: LEXIQUE.filmer,
  emplacement: 'Place précise où l’on range une palette dans l’entrepôt (une allée, une colonne, un niveau).',
};
export const ACCUEIL = {
  titre: 'Un autre site, un autre prestataire',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Romain', 'Menu Messagerie.'],
    ['① La carte de France', 'Place chaque lieu sur la carte : sa région, son département, sa ville.'],
    ['② Qui est qui ?', 'Lis le document à gauche, puis remplis la fiche.'],
    ['③ La chaîne de Romain', 'Trouve les deux erreurs de Romain et corrige-les.'],
    ['④ Ce que je change', 'Pour chaque situation, choisis ce qui arrive au magasin de Roques.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'La carte et les questions de Romain se jouent au premier essai : elles ne se rejouent pas.';

// L’ordre des écrans de travail (barre « Étape suivante » et menu « Mon poste », CAP, 16/10/2026). Le premier écran de fiche garde la vue
// `fiche` (la première de `fiches`), les autres `fiche:<id>`.
export const SUITE = [
  { vue: 'localiser', libelle: 'Carte de France', fait: localiserFini(VUE) },
  { vue: 'fiche', libelle: 'Qui est qui ?', fait: dejaEnvoyee(FICHES.qui) },
  { vue: `fiche:${FICHES.chaine}`, libelle: 'La chaîne de Romain', fait: dejaEnvoyee(FICHES.chaine) },
  { vue: `fiche:${FICHES.change}`, libelle: 'Ce que je change', fait: dejaEnvoyee(FICHES.change) },
];
// Chaque fiche s’ouvre à l’envoi de l’étape d’avant (un écran par étape, §0 bis n° 3) : grisée au menu jusque-là, avec la raison.
// « Qui est qui ? » ne passe PAS par une fermeture mais par `quand` (fiche absente du menu jusqu’à la fin de la carte) : le menu n’est pas
// redessiné à la fin de la carte (limite connue du moteur, journal du chantier §5), une entrée grisée « Après la carte de France » y
// resterait affichée alors que la barre « Étape suivante » mène déjà à la fiche (vu à l’écran le 16/10/2026).
export const FERMETURES = {
  [`fiche:${FICHES.chaine}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.qui)(db), message: 'Après « Qui est qui ? »' },
  [`fiche:${FICHES.change}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.chaine)(db), message: 'Après « La chaîne de Romain »' },
};
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Séance 3 : un autre site, un autre prestataire',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_83,
  equipe: EQUIPE_83,
  questions: QUESTIONS,
  documents: [DOC_STAGE, DOC_RESEAU, DOC_CHAINE, DOC_REMORQUE],
  documentsStyle: STYLE,
  fiches: [FICHE_QUI, FICHE_CHAINE, FICHE_CHANGE],
  localiser: LOCALISER,
  fermetures: FERMETURES,
  finFige: FIN_FIGE,
};
