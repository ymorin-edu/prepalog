// ENT-8.15 — Action, « prendre en charge une préparation » : le contenu de la séance (brief `docs/briefs/ENT-8.15-action-preparer.md`). CAP OL,
// GUIDAGE de CAP-C3.1. Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (défauts, inspection, mission, phrases) :
// `contenus/action-ent815-donnees.js`. Activité : `activites/action-preparer.js`. Questions : `contenus/questions/ENT-8.15.js`. Corrigé :
// `contenus/corriges/ENT-8.15.js`.
//
// Un lundi, 6 h (AUCUNE date écrite). Quatre écrans, chacun ouvert après le précédent :
//   ① Prendre mon poste (vue « Inspection du poste ») : deux défauts tirés (le quai, le transpalette n° 1) ; Samia répond toujours « C'est noté,
//      prends le transpalette 2. » ; un défaut jamais signalé arrête l'élève (guidage), sans le nommer ;
//   ② Lire ma mission (fiche à 4 listes) : à gauche, l'écran d'accueil du terminal, dessiné avec LA mission de l'élève ;
//   ③ Préparer (Plan d'entrepôt, préparation guidée à la voix, chantier E-8) : 5 lignes, aucune exception, une palette ; seules les lignes sont
//      jugées ; ni film ni étiquettes (« Yanis filme et étiquette ta palette », `terminal.finir: false`) ;
//   ④ Rendre compte : Samia écrit à « Vérifier ma préparation » ; réponse par phrases, « la commande est prête » jugée sur LA MISSION.
// « Corriger » rouvre la fiche et le message ; ni l'inspection ni la préparation (lignes dites au terminal : `finFige`).
//
// VÉRIFIÉ : C. trav. L3163-1 (en entier) et L3163-2 (premier alinéa, première phrase), recopiés par Claude Code le 25/10/2026 sur
// code.travail.gouv.fr (le Code du travail numérique, qui reprend Légifrance). CONSTRUIT : `MENTION` (dite dans la séance et au pied des documents).

import { apresFiche, apresGeste, apresMail, tous, inspectionFinie } from '../core/declencheurs.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { etapesInspection, verifierInspection } from '../core/types/inspection.js';
import { projection, boiteEcran, transpaletteElectrique, boitesTranspalette } from '../core/iso.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.15.js';
import { ENTREPRISE as ENT_ACTION, EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, ech } from './action.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, INSPECTION_ID, FICHE_ID, PHRASES_ID, SAMIA_MAIL, SUJETS, GESTE, DEFAUTS_SITE, ENGINS, inspectionPour,
  inspectionDe, entrepotDe, jeuDeBase, missionDeBase, courtDe, lignesFiche, melangerPour, SALUTATIONS, POLITESSES, finsDe, choixPrete,
  MENTION_PREPA,
} from './action-ent815-donnees.js';

export { ID, ENTREPOT_ID, INSPECTION_ID, FICHE_ID, PHRASES_ID };

export const ENTREPRISE = { ...ENT_ACTION, exercice: 'Bienvenue chez Geodis' };

// Le contrôle au chargement : les huit inspections possibles (2 défauts du site × 4 de l'engin) sont acceptées par la vue.
DEFAUTS_SITE.forEach((s) => ENGINS.forEach((e) => {
  const F = verifierInspection(inspectionPour(s, e));
  if (F.length) throw new Error(`ENT-8.15 : l'inspection (site ${s}, engin ${e}) est refusée par la vue — ${F.join(' ; ')}`);
}));

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « un lundi, 6 h », sans date
// La Messagerie affiche l'horodatage : le DERNIER LUNDI (aujourd'hui si on est lundi), plus le temps réellement passé depuis l'ouverture.
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 7 - 1) % 7));
  d.setHours(h, mn, 0, 0);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return d.getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const gesteFait = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || gesteFait(db, `fiche:${id}:envoyer`);
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
export const preparationVerifiee = (db) => !!(etatPlan(db) && etatPlan(db).verifs > 0) || gesteFait(db, GESTE('verifier'));
const reponduSamia = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
export const INSPECTION = (graine) => inspectionDe(graine);
const inspectionFaite = inspectionFinie(INSPECTION_ID);
export const posteFait = (db) => inspectionFaite(db, ID);

// ─────────────────────────────────────────────────────────────── les documents
// L'écran d'accueil du terminal, dessiné avec LA mission de l'élève (étape ②).
export function svgTerminal(M) {
  const L = [`Mission ${M.num}`, 'Magasin :', M.magasin, `${M.lignes} lignes · ${M.cartons} cartons`, `Quai ${M.quai}`, `Départ du camion : ${M.depart}`];
  return `<svg class="ac815-fig" viewBox="0 0 300 330" role="img" aria-label="${ech(`L’écran du terminal : ${L.join(' ')}`)}">
  <rect x="40" y="6" width="220" height="318" rx="26" fill="#3a3a3a" stroke="#1d1d1d" stroke-width="3"/>
  <rect x="58" y="34" width="184" height="190" rx="6" fill="#eef4fa" stroke="#1d1d1d" stroke-width="1.5"/>
  <rect x="58" y="34" width="184" height="26" rx="6" fill="#195799"/>
  <text x="150" y="52" font-size="13" font-weight="800" text-anchor="middle" fill="#fff">Préparation</text>
  ${L.map((t, i) => `<text x="68" y="${84 + i * 26}" font-size="${i === 2 ? (t.length > 24 ? 10.5 : 12) : 13}" font-weight="${i === 0 || i === 2 ? 800 : 600}" fill="#1d1d1d">${ech(t)}</text>`).join('')}
  ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${78 + c * 50}" y="${240 + r * 26}" width="40" height="18" rx="4" fill="#5b5b5b"/>`).join('')).join('')}
  <circle cx="150" cy="20" r="3" fill="#777"/></svg>`;
}
const DOC_TERMINAL = { id: 'terminal-accueil', titre: 'L’écran du terminal', court: 'Le terminal',
  html: (db) => `<article class="ac-doc" aria-label="L’écran du terminal">
    <p class="ac-t">L’écran du terminal</p><p class="ac-st">Ce que ton terminal affiche quand tu prends ta mission.</p>
    ${svgTerminal(missionDeBase(db))}${PIED(`Dessin construit pour l’exercice. ${MENTION_PREPA}`)}</article>` };
// Le même écran, avec une mission d'exemple (« Avant de commencer » : aucune réponse de la fiche).
const DOC_TERMINAL_EX = { id: 'terminal-exemple', titre: 'Un terminal', court: 'Un terminal',
  html: `<article class="ac-doc" aria-label="Un terminal">${svgTerminal({ num: '4000', magasin: 'Magasin de l’exemple', lignes: 4, cartons: 16, quai: 2, depart: '9 h 00' })}${PIED('Dessin construit pour l’exercice.')}</article>` };
const DOC_POSTE = { id: 'poste', titre: 'Ta matinée', court: 'Ta matinée',
  html: `<article class="ac-doc" aria-label="Ta matinée">
    <p class="ac-t">Ta matinée à la préparation</p>
    <p class="ac-st">Un lundi, 6 h</p>
    <p>Tu es en stage chez <b>Geodis</b>, à l’entrepôt Action d’Ensuès-la-Redonne. Aujourd’hui, tu es [[préparateur]].</p>
    <p>Préparer, c’est prendre dans le stock ce qu’un magasin a commandé. Tu prends les cartons au <b>niveau 1</b>, au sol : le [[picking]].</p>
    <p>Tu n’as pas de bon papier : le <b>terminal</b> te dit, à la voix, chaque [[ligne]] de ta [[mission]], dans l’ordre du [[circuit de prélèvement]].</p>
    <p>La commande prête va sur le [[quai]] de son camion.</p>
    <p>Ta [[tutrice]] : <b>Samia</b>, cheffe d’équipe. <b>Yanis</b>, préparateur, filme et étiquette les palettes.</p>
    ${PIED('Samia et Yanis sont construits pour l’exercice.')}
  </article>` };
// Le transpalette électrique (kit iso, comme Pelleau : aucune photo libre au dépôt).
const DESSIN_TP = (() => {
  const I = projection({ unite: 150, origine: [300, 80] });
  const sol = I.face([[-0.5, -0.4, 0], [1.4, -0.4, 0], [1.4, 2.4, 0], [-0.5, 2.4, 0]], '#e4dfd3', 'none');
  const r = boiteEcran(I, boitesTranspalette('ok', [0, 0]), 26);
  return `<svg class="ac815-fig" viewBox="${r.x} ${r.y} ${r.w} ${r.h}" role="img" aria-label="Un engin jaune à deux fourches, avec un long manche et un capot qui porte le numéro 1">${sol}${transpaletteElectrique(I, [0, 0], 'ok', { n: 1 })}</svg>`;
})();
const DOC_ENGIN = { id: 'dessin-engin', titre: 'Un engin de l’entrepôt', court: 'Un engin',
  html: `<article class="ac-doc" aria-label="Un engin de l’entrepôt">${DESSIN_TP}${PIED('Dessin construit pour l’exercice.')}</article>` };
// « Le droit » : C. trav. L3163-1 (en entier) et L3163-2 (première phrase), recopiés le 25/10/2026 (voir l'en-tête).
export const TEXTE_L3163_1 = ['Pour l’application du présent chapitre, est considéré comme travail de nuit :',
  '1° Pour les jeunes travailleurs de plus de seize ans et de moins de dix-huit ans, tout travail entre 22 heures et 6 heures ;',
  '2° Pour les jeunes travailleurs de moins de seize ans, tout travail entre 20 heures et 6 heures.'];
export const TEXTE_L3163_2 = ['Le travail de nuit est interdit pour les jeunes travailleurs.', '[…]'];
const cite = (T) => `<div class="ac-cite">${T.map((p, i) => `<p>${i === 0 ? '« ' : ''}${p}${i === T.length - 1 ? ' »' : ''}</p>`).join('')}</div>`;
const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-t">Le droit : les jeunes et la nuit</p>
    <p class="ac-art"><b>Code du travail, article L3163-1</b></p>${cite(TEXTE_L3163_1)}
    <p class="ac-art"><b>Code du travail, article L3163-2</b> (début)</p>${cite(TEXTE_L3163_2)}
    ${PIED('Textes réels, recopiés du Code du travail numérique (code.travail.gouv.fr, qui reprend Légifrance), consulté le 25/10/2026.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-art{margin:10px 0 2px; font-size:.95rem}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ac-cite p{margin:0 0 4px}
.ac815-fig{display:block; width:100%; max-width:340px; height:auto; margin:4px auto 10px}
.ac815-fig text{font-family:system-ui, sans-serif}
`;
export const DOCUMENTS = [DOC_POSTE, DOC_TERMINAL, DOC_TERMINAL_EX, DOC_ENGIN, DOC_DROIT];

// ─────────────────────────────────────────────────────────────── ② la fiche « Ma mission »
export const FICHE = {
  id: FICHE_ID, libelle: 'Ma mission', titre: 'Ma mission',
  sousTitre: 'L’écran de ton terminal est à gauche. Lis ta [[mission]] et choisis la bonne réponse sur chaque ligne.',
  documents: ['terminal-accueil'], largeurDocs: 1,
  bouton: 'Ouvrir la fiche « Ma mission »',
  blocs: (db) => lignesFiche(missionDeBase(db)).map((l, i) => ({ type: 'liste', id: l.id, lib: `${i + 1}. ${l.lib}`, vide: 'Choisir…', manque: l.manque,
    choix: melangerPour(db, `fiche-${l.id}`, l.choix) })),
  envoi: { bouton: 'Envoyer à Samia', a: 'Samia', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ④ les phrases du message à Samia, calculées sur LA MISSION
export const phrasesSamia = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'prete', choix: (d) => choixPrete(missionDeBase(d)), juste: 0 },
  { id: 'politesse', choix: POLITESSES.slice(), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jamais juste ni faux ; aucune date)
const SAMIA = { nom: EQUIPE.samia.nom, mail: SAMIA_MAIL };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:00', { db: o.db, decalage: o.decalage || 0 }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const ACCUEIL_SAMIA = 'Aujourd’hui, tu passes à la préparation. Tu suis la voix du terminal, adresse après adresse. D’abord, ton transpalette.';
export const MISSION_SAMIA = 'Ton transpalette est prêt. Lis ta mission sur le terminal, puis la fiche « Ma mission ».';
export const PARTI_SAMIA = 'C’est ça. Casque sur les oreilles : c’est parti.';
export const COMMANDE_SAMIA = 'Alors, ta commande ?';
export const FIN_SAMIA = 'Merci. Demain, la commande sera plus longue, et tout ne sera pas en place.';
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(SAMIA, prenom, SUJETS.accueil,
    `Bonjour ${prenom} ! ${ACCUEIL_SAMIA.replace('ton transpalette', 'ton [[transpalette électrique|transpalette]]')}\n\nSamia`, { heure: '06:00' })] }),
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '06:40' })] }),
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '06:50' })] }),
  },
  declencheurs: [
    // Le poste pris : la mission.
    { id: 'mission', quand: inspectionFaite,
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.mission, `${MISSION_SAMIA}\n\nSamia`, { db, heure: '06:08', extra: { ouvreFiche: FICHE_ID } })] }) },
    // La fiche envoyée (juste ou non) : au circuit. « Le droit » joint (pour q-nuit).
    { id: 'parti', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.poste,
        `${PARTI_SAMIA}\n\nLe terminal te dit une adresse. Tu y vas, tu lis le [[code de contrôle|code]] sur la [[lisse]], tu le tapes. Il te dit combien prendre.\n\n`
          + 'Je te joins « Le droit », à lire.\n\nSamia', { db, heure: '06:12', extra: { pieces: ['droit'] } })] }) },
    // « Vérifier ma préparation » : Samia demande où en est la commande (phrases calculées sur la mission).
    { id: 'commande', quand: apresGeste(GESTE('verifier')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.commande,
        `${COMMANDE_SAMIA.replace('Alors,', `Alors, ${prenom},`)}\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nSamia`,
        { db, heure: '06:45', extra: { phrases: phrasesSamia(prenom) } })] }) },
    { id: 'fin', quand: tous(apresGeste(GESTE('verifier')), apresMail({ a: SAMIA.mail })),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.fin, `${FIN_SAMIA}\n\nSamia`, { db, heure: '06:55' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 25/10/2026, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant « C'est bon, je prends mon poste », l'envoi de la fiche, la fin du
// terminal ni l'envoi du message : l'inaction vaut 0. L'essai de l'avertisseur est jugé sans poids ni ligne (il sert à trouver l'avertisseur muet).
export const GROUPES = { poste: 'Prendre mon poste', mission: 'Lire ma mission', circuit: 'Suivre le circuit', compte: 'Rendre compte à Samia' };
export const POIDS = {
  'securite-site-defaut': 2, 'securite-tp1-defaut': 2, 'securite-aucun-faux': 1,
  'mission-magasin': 1, 'mission-cartons': 1, 'mission-quai': 1, 'mission-heure': 1,
  'ligne-1': 1, 'ligne-2': 1, 'ligne-3': 1, 'ligne-4': 1, 'ligne-5': 1,
  'cr-forme': 1, 'cr-message': 1,
};
const TITRES_POSTE = { 'securite-site-defaut': 'Le défaut du quai, signalé avant de prendre le poste',
  'securite-tp1-defaut': 'Le défaut du transpalette n° 1, signalé avant de prendre le poste', 'securite-aucun-faux': 'Aucun faux signalement' };
const jalonsPoste = etapesInspection(INSPECTION, ID).map((e) => (e.id === 'essai-1'
  ? Object.assign(e, { titre: 'L’avertisseur du transpalette n° 1 essayé (non noté)', poids: 0, compte: false })
  : Object.assign(e, { titre: TITRES_POSTE[e.id], groupe: GROUPES.poste, poids: POIDS[e.id] })));
const LIB_FICHE = { magasin: 'le magasin', cartons: 'le nombre de cartons', quai: 'le quai', heure: 'l’heure du camion' };
const jalonFiche = (l) => ({ id: `mission-${l}`, titre: `Ma mission : ${LIB_FICHE[l]}`, groupe: GROUPES.mission, poids: POIDS[`mission-${l}`],
  ecran: `fiche:${FICHE_ID}`,
  verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return valeurDe(db, FICHE_ID, l) === 'juste' ? ok : ko; } });
// Les lignes : le titre commun (la liste vient de la déclaration de référence), le produit de L'ÉLÈVE au bilan.
const jalonsCircuit = etapesEntrepot(entrepotDe).map((e, k) => Object.assign(e, { titre: `Ligne ${k + 1} : la bonne quantité, au bon emplacement`,
  titreBilan: (db) => { const l = jeuDeBase(db).lignes[k]; return l ? `Ligne ${k + 1} : ${l.q} ${courtDe(l.produit)} en ${l.a}` : null; },
  groupe: GROUPES.circuit, poids: POIDS[e.id] }));
const ECRAN = `phrases:${PHRASES_ID}`;
export const ETAPES = [
  ...jalonsPoste,
  ...['magasin', 'cartons', 'quai', 'heure'].map(jalonFiche),
  ...jalonsCircuit,
  { id: 'cr-forme', titre: 'Le message à Samia : la salutation et la politesse', groupe: GROUPES.compte, poids: POIDS['cr-forme'], ecran: ECRAN,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return ['salutation', 'politesse'].every((l) => r.justes.includes(l)) ? ok : ko; } },
  { id: 'cr-message', titre: 'Le message à Samia : la commande prête, le magasin et le quai', groupe: GROUPES.compte, poids: POIDS['cr-message'], ecran: ECRAN,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return r.justes.includes('prete') ? ok : ko; } },
];
{
  const ids = ETAPES.filter((e) => e.poids).map((e) => e.id).sort().join();
  if (ids !== Object.keys(POIDS).sort().join()) throw new Error(`ENT-8.15 : les jalons notés ne sont pas ceux du barème (${ids})`);
}

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'inspection', libelle: 'Prendre mon poste', fait: posteFait },
  { vue: 'fiche', libelle: 'Lire ma mission', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'entrepot', libelle: 'Préparer ma commande', fait: preparationVerifiee },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Samia', fait: reponduSamia },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_815 = {
  ...LEXIQUE,
  préparateur: 'Personne qui prélève les produits dans l’entrepôt pour préparer les commandes des magasins.',
  mission: 'Ce que le terminal te donne à faire : une commande pour un magasin, avec ses lignes, son quai et l’heure du camion.',
  ligne: 'Une ligne de commande : un produit, son adresse, combien en prendre.',
  'circuit de prélèvement': 'Le chemin que le terminal te fait suivre dans l’entrepôt : on monte une allée, on redescend l’autre, sans revenir en arrière.',
  'code de contrôle': 'Les deux chiffres écrits sur l’étiquette de l’emplacement. Tu les tapes : le système sait que tu es devant le bon emplacement.',
  lisse: 'La barre horizontale du rack, au-dessus de l’emplacement : l’étiquette y est collée.',
  picking: 'Les emplacements au sol (niveau 1) où les préparateurs prennent les cartons des commandes.',
  'transpalette électrique': 'Transpalette à moteur : il soulève et déplace la palette. Le préparateur le conduit à pied, avec le timon.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), la préparation à la voix à Ensuès, '
  + `les magasins Action du Sud-Est, le Code du travail. ${MENTION_PREPA} Construits aussi : le poste et ses défauts, Samia et Yanis, le terminal et ses `
  + 'messages, les produits (sans marque).';
export const ACCUEIL = {
  titre: 'Prendre en charge une préparation',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Prendre mon poste', 'Regarde le quai et le transpalette n° 1. Signale ce qui ne va pas.'],
    ['② Lire ma mission', 'La fiche, avec l’écran du terminal à gauche.'],
    ['③ Préparer ma commande', 'Plan de l’entrepôt : suis la voix du terminal, adresse après adresse.'],
    ['④ Rendre compte à Samia', 'Elle t’écrit quand tu vérifies ta préparation. Une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Ton poste et ta préparation sont faits : ils ne se refont pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 15 : prendre en charge une préparation',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_815,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  inspection: INSPECTION,
  fiche: FICHE,
  entrepot: entrepotDe,
  suite: SUITE,
  equipe: { ...EQUIPE, yanis: { nom: 'Yanis', role: 'préparateur', appel: 'Yanis', registre: 'tu' } },
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  fermetures: {
    fiche: { ouvertSi: posteFait, message: 'Après « Prendre mon poste »' },
    entrepot: { ouvertSi: (db) => dejaEnvoyee(FICHE_ID)(db), message: 'Après la fiche « Ma mission »' },
  },
};
