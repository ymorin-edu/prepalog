// ENT-8.19 — Action, évaluation « préparer une commande dans un autre site » : le contenu de la séance (brief
// `docs/briefs/ENT-8.19-action-evaluation-preparation.md`). CAP OL, ÉVALUATION de CAP-C3.1 à C3.3, en copie rendue (`copie: true`). Univers commun :
// `contenus/action.js` (lu, jamais modifié). Données pures : `contenus/action-ent819-donnees.js`. Activité : `activites/action-evaluation-preparation.js`.
// Questions : `contenus/questions/ENT-8.19.js`. Corrigé : `contenus/corriges/ENT-8.19.js`.
//
// Un mardi, 6 h (AUCUNE date écrite), dans le MÊME site tiré qu'ENT-8.5, 8.6, 8.10 et 8.14 (Onnaing / GXO, ou Belleville-en-Beaujolais /
// Kuehne+Nagel) : « De retour chez {prestataire} à {site} pour une journée. » Avant de commencer (noté, 4 points) → ① Prendre mon poste (inspection
// en copie : un défaut tiré, « C'est noté. », rien n'arrête l'élève) → ② Lire ma mission (fiche, l'écran du terminal à gauche : quai, heure) →
// ③ Préparer et monter (E-8 en copie : 7 lignes, un abîmé, un emplacement vide, l'ordre du circuit amène un fragile avant un lourd ; film,
// étiquettes ; « Valider ma préparation » fige sans verdict) → « Rendre ma copie » (le bandeau du moteur ; `rendCopie: false`).
// Copie rendue : rien ne dit juste ou faux, ni règle, ni bilan, ni « Corriger », aucun mot cliquable, aucune question au fil. Le terminal parle
// quand même (il guide, il ne corrige pas). Le montage se juge SUR CE QUI EST POSÉ (`montageSurPose`, décision de Tristan du 25/10/2026).

import { apresFiche, inspectionFinie } from '../core/declencheurs.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { etapesInspection, verifierInspection } from '../core/types/inspection.js';
import { QUESTIONS, TUTEUR } from './questions/ENT-8.19.js';
import { svgTerminal, TEXTE_L3163_1, TEXTE_L3163_2 } from './action-ent815.js';
import * as ACTION from './action.js';
import { STYLE_DOCUMENTS, PIED, ech } from './action.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, INSPECTION_ID, FICHE_ID, SUJETS, GESTE, DEFAUTS, inspectionPour, inspectionDe, siteEleve, equipeDe, entrepotDe,
  jeuDeBase, missionDeBase, courtDe, anomaliesDe, lignesFiche, melangerPour, MENTION_PREPA, MAGASINS_SITE,
} from './action-ent819-donnees.js';

export { ID, ENTREPOT_ID, INSPECTION_ID, FICHE_ID };

// Le contrôle au chargement : les six inspections possibles sont acceptées par la vue.
DEFAUTS.forEach((d) => {
  const F = verifierInspection(inspectionPour(d, 'Karim'));
  if (F.length) throw new Error(`ENT-8.19 : l'inspection (défaut ${d}) est refusée par la vue — ${F.join(' ; ')}`);
});

// ─────────────────────────────────────────────────────────────── l'entreprise de CETTE séance (le site est tiré : bandeau neutre)
export const ENTREPRISE = { ...ACTION.ENTREPRISE,
  sousTitre: 'Un nouvel entrepôt d’Action — commerce à petits prix', exercice: 'Évaluation : préparer une commande dans un autre site' };
export const VOCAB = { ...ACTION.VOCAB, mailDomain: 'action-stage.example' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « un mardi, 6 h », sans date
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
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
export const preparationValidee = (db) => !!(etatPlan(db) && etatPlan(db).valide);
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
export const INSPECTION = (graine) => inspectionDe(graine);
const inspectionFaite = inspectionFinie(INSPECTION_ID);
export const posteFait = (db) => inspectionFaite(db, ID);

// ─────────────────────────────────────────────────────────────── les documents
const DOC_TERMINAL = { id: 'terminal-accueil', titre: 'L’écran du terminal', court: 'Le terminal',
  html: (db) => `<article class="ac-doc" aria-label="L’écran du terminal">
    <p class="ac-t">L’écran du terminal</p><p class="ac-st">Ce que ton terminal affiche quand tu prends ta mission.</p>
    ${svgTerminal(missionDeBase(db))}${PIED('Dessin construit pour l’exercice.')}</article>` };
const docStage = (db) => { const S = siteEleve(db), Q = equipeDe(S);
  return `<article class="ac-doc" aria-label="Ta journée">
    <p class="ac-t">Ta journée chez ${ech(S.prestataire)}</p>
    <p class="ac-st">Un mardi, 6 h</p>
    <p>De retour chez <b>${ech(S.prestataire)}</b>, à l’entrepôt Action ${ech(S.deSite)}, pour une journée. Aujourd’hui, tu es préparateur.</p>
    <p>${ech(Q.tuteur)}, ${ech(Q.chef)}, est ton tuteur ; ${ech(Q.cariste)}, cariste, descend la réserve.</p>
    ${PIED(`${ech(Q.tuteur)} et ${ech(Q.cariste)} sont construits pour l’exercice.`)}</article>`; };
const DOC_STAGE = { id: 'stage', titre: 'Ta journée', court: 'Ta journée', html: docStage };
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
export const DOCUMENTS = [DOC_STAGE, DOC_TERMINAL, DOC_DROIT];

// ─────────────────────────────────────────────────────────────── ② la fiche « Ma mission »
// Les textes fixes du moteur (bouton d'envoi) ne connaissent pas le site : ils disent « ton tuteur ».
export const FICHE = {
  id: FICHE_ID, libelle: 'Lire ma mission', titre: 'Ma mission',
  sousTitre: 'L’écran de ton terminal est à gauche. Choisis la bonne réponse sur chaque ligne.',
  documents: ['terminal-accueil'], largeurDocs: 1,
  bouton: 'Ouvrir la fiche « Ma mission »',
  blocs: (db) => lignesFiche(missionDeBase(db)).map((l, i) => ({ type: 'liste', id: l.id, lib: `${i + 1}. ${l.lib}`, vide: 'Choisir…', manque: l.manque,
    choix: melangerPour(db, `fiche-${l.id}`, l.choix) })),
  envoi: { bouton: 'Envoyer à ton tuteur', a: 'ton tuteur', suite: 'Merci, c’est noté.', incomplet: true },
};

// ─────────────────────────────────────────────────────────────── les messages du tuteur (au tu ; jamais juste ni faux ; aucune date)
const mail = (prenom, db, subject, text, o = {}) => { const Q = equipeDe(siteEleve(db));
  return { folder: 'in', ts: tsScenario(o.heure || '06:00', { db, decalage: o.decalage || 0 }),
    from: Q.tuteur, fromMail: Q.mailTuteur, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) }; };
const signeDe = (db) => equipeDe(siteEleve(db)).tuteur;
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => { const S = siteEleve(db), Q = equipeDe(S);
    return { mails: [mail(prenom, db, SUJETS.accueil,
      `Bonjour ${prenom}, content de te revoir chez ${S.prestataire} ! Aujourd’hui, tu prépares une commande. Commence par prendre ton poste : regarde le quai et le transpalette n° 1.\n\n`
        + `${Q.cariste} descend la réserve si un emplacement est vide.\n\n${Q.tuteur}`)] }; },
  declencheurs: [
    { id: 'mission', quand: inspectionFaite,
      semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.mission, `Merci. Voici ta mission : lis l’écran de ton terminal et remplis la fiche « Ma mission ».\n\n${signeDe(db)}`,
        { heure: '06:15', extra: { ouvreFiche: FICHE_ID } })] }) },
    { id: 'fin', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.fin,
        `Merci. Maintenant, prépare ta commande : le Plan de l’entrepôt est dans le menu. Quand ta palette est filmée et étiquetée, clique « Valider ma préparation », puis « Rendre ma copie », en haut de l’écran.\n\n${signeDe(db)}`,
        { heure: '06:20' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 25/10/2026, brief §5)
// 16 points de jalons + 4 d'ouverture (`part: 4`) = 20. Prendre en charge 4 (défaut 1,5, aucun faux 0,5 ; mission 1 + 1) · Déstocker 6 (lignes
// normales 0,6 × 5, abîmé 1,5, vide dit 0,75 et ligne reprise 0,75) · Conditionner 6 (lourds 1, fragiles 1, poids 0,5, hauteur 0,5, film 1,
// étiquettes 2). L'essai de l'avertisseur est jugé sans poids ni ligne. Rien n'est vrai sans geste : l'inaction vaut 0.
export const GROUPES = { charge: 'Prendre en charge', destocker: 'Déstocker', conditionner: 'Conditionner' };
export const POIDS = {
  'securite-defaut': 1.5, 'securite-aucun-faux': 0.5, 'mission-quai': 1, 'mission-heure': 1,
  'ligne-1': 0.6, 'ligne-2': 0.6, 'ligne-3': 0.6, 'ligne-4': 0.6, 'ligne-5': 0.6, 'abime-dit': 1.5, 'vide-dit': 0.75, 'vide-reprise': 0.75,
  lourds: 1, fragiles: 1, poids: 0.5, hauteur: 0.5, film: 1, etiquettes: 2,
};
const TITRES_POSTE = { 'securite-defaut': 'Le défaut du poste, signalé avant de prendre le poste', 'securite-aucun-faux': 'Aucun faux signalement' };
const jalonsPoste = etapesInspection(INSPECTION, ID, { copie: true }).map((e) => (/^essai-/.test(e.id)
  ? Object.assign(e, { titre: 'L’avertisseur du transpalette n° 1 essayé (non noté)', poids: 0, compte: false })
  : Object.assign(e, { titre: TITRES_POSTE[e.id], groupe: GROUPES.charge, poids: POIDS[e.id] })));
const LIB_FICHE = { quai: 'le quai', heure: 'l’heure du camion' };
const jalonFiche = (l) => ({ id: `mission-${l}`, titre: `Ma mission : ${LIB_FICHE[l]}`, groupe: GROUPES.charge, poids: POIDS[`mission-${l}`],
  ecran: `fiche:${FICHE_ID}`,
  verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return valeurDe(db, FICHE_ID, l) === 'juste' ? ok : ko; } });
const TITRES_PLAN = {
  'abime-dit': '« Abîmé : 1 » dit, et la quantité reprise sur la même pile', 'vide-dit': '« Emplacement vide » dit', 'vide-reprise': 'La ligne reprise après la réserve',
  lourds: 'Les lourds en bas', fragiles: 'Les fragiles en haut', poids: 'Le poids de la palette', hauteur: 'La hauteur de la palette',
  film: 'Le film : 3 à 5 tours', etiquettes: 'Les étiquettes : deux faces opposées et le dessus',
};
const normalesDe = (db) => { const j = jeuDeBase(db), A = anomaliesDe(j); return j.lignes.filter((l, k) => k !== A.abime.k && k !== A.vide.k); };
const jalonsPlan = etapesEntrepot(entrepotDe, { copie: true }).map((e) => {
  const m = /^ligne-(\d)$/.exec(e.id);
  if (m) {
    const k = +m[1] - 1;
    return Object.assign(e, { titre: `Ligne normale n° ${k + 1} : la bonne quantité, au bon emplacement`, groupe: GROUPES.destocker, poids: POIDS[e.id],
      titreBilan: (db) => { const l = normalesDe(db)[k]; return l ? `${l.q} ${courtDe(l.produit)} en ${l.a}` : null; } });
  }
  const groupe = ['abime-dit', 'vide-dit', 'vide-reprise'].includes(e.id) ? GROUPES.destocker : GROUPES.conditionner;
  return Object.assign(e, { titre: TITRES_PLAN[e.id], titreBilan: TITRES_PLAN[e.id], groupe, poids: POIDS[e.id] });
});
export const ETAPES = [
  ...jalonsPoste,
  ...['quai', 'heure'].map(jalonFiche),
  ...jalonsPlan,
];
{
  const ids = ETAPES.filter((e) => e.poids).map((e) => e.id).sort().join();
  if (ids !== Object.keys(POIDS).sort().join()) throw new Error(`ENT-8.19 : les jalons notés ne sont pas ceux du barème (${ids})`);
}

// ─────────────────────────────────────────────────────────────── pastilles, ordre des écrans, accueil, options
export const PASTILLES = [
  { libelle: 'Prendre mon poste', fait: posteFait },
  { libelle: 'Lire ma mission', fait: (db) => envoyee(db, FICHE_ID) },
  { libelle: 'Préparer et monter', fait: preparationValidee },
];
export const SUITE = [
  { vue: 'inspection', libelle: 'Prendre mon poste', fait: posteFait },
  { vue: 'fiche', libelle: 'Lire ma mission', fait: (db) => envoyee(db, FICHE_ID) },
  { vue: 'entrepot', libelle: 'Préparer et monter ma palette', fait: preparationValidee },
];
export const MENTION = 'Réels : Action ; GXO, qui fait tourner l’entrepôt Action d’Onnaing (réception, stockage, préparation, expédition, retours) ; '
  + `Kuehne+Nagel, qui fait tourner celui de Belleville-en-Beaujolais ; les magasins Action de ${MAGASINS_SITE.onnaing.nom} et de ${MAGASINS_SITE.belleville.nom} ; `
  + `le Code du travail. ${MENTION_PREPA} Construits aussi : l’entrepôt de préparation de chaque site, que ce site livre ce magasin, le poste et son `
  + 'défaut, la commande, l’abîmé, l’emplacement vide, ton tuteur ou ta tutrice et le cariste, le terminal et ses messages, les produits (sans marque).';
export const ACCUEIL = {
  titre: 'Évaluation : préparer une commande dans un autre site',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de ton tuteur', 'Menu Messagerie.'],
    ['① Prendre mon poste', 'Regarde le quai et le transpalette n° 1. Signale ce qui ne va pas.'],
    ['② Lire ma mission', 'La fiche, avec l’écran du terminal à gauche.'],
    ['③ Préparer et monter ma palette', 'Plan de l’entrepôt : suis le terminal, dis ce qui ne va pas, monte, filme, étiquette. Puis « Valider ma préparation ».'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION],
  ],
};
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Évaluation : préparer une commande dans un autre site',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: { tuteur: TUTEUR },
  questions: QUESTIONS,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  inspection: INSPECTION,
  fiche: FICHE,
  entrepot: entrepotDe,
  pastilles: PASTILLES,
  fermetures: {
    fiche: { ouvertSi: posteFait, message: 'Après « Prendre mon poste »' },
    entrepot: { ouvertSi: (db) => envoyee(db, FICHE_ID), message: 'Après la fiche « Ma mission »' },
  },
};
