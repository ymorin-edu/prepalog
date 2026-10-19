// ENT-10.3 — Transports Pelleau, « on commence quand même ? » : le contenu de la séance (brief `docs/briefs/ENT-10.3-pelleau-on-commence-quand-meme.md` ;
// décisions du chef de chantier `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant le brief). CAP OL, ENTRAÎNEMENT de CAP-C1.2 (prendre son poste),
// ERREUR INDUITE TIRÉE : « le site n'est pas fini » ou « l'engin n'a pas été contrôlé ». Univers commun : `contenus/pelleau.js` (À LIRE). Données pures
// (tirage, inspection, dialogues, fiche, phrases) : `contenus/pelleau-ent103-donnees.js` (y lire la liste des ÉCARTS avec le brief). Activité :
// `activites/pelleau-on-commence-quand-meme.js`. Questions : `contenus/questions/ENT-10.3.js`. Corrigé : `contenus/corriges/ENT-10.3.js`.
//
// 6 mai 2026, 6 h (aucun jour de la semaine écrit : FDR §0.7, décision 9 du chef). Erwan est en réunion jusqu'à 8 h : l'élève prend son poste avec Yann,
// pressé (un camion à 6 h 30). Écrans :
//   ① « Avec Yann » (face à face) : « J'ai sorti le transpalette n° 2, vas-y ! » ; ② « Mon poste » : vue « Inspection du poste » (défaut TIRÉ, deux
//   transpalettes, pas d'arrêt) ; ③ « Avec Yann » encore : il insiste ; ④ la fiche « Signalement » (trois listes calculées sur le défaut) ; ⑤ rendre
//   compte à Erwan par phrases (vu et fait CALCULÉS).
// Rien n'est jugé à l'écran ; le bandeau de fin dit ✓ / ✗ par bloc, et la case avec `bilanDetail`. « Corriger » rouvre la fiche et les phrases ; jamais les
// dialogues ni l'inspection (`finFige`).
//
// VÉRIFIÉ / CONSTRUIT :
//   Vérifié : code.travail.gouv.fr (consulté le 19/10/2026) confirme le début du 1er alinéa de L4122-1 (« il incombe à chaque travailleur de prendre soin,
//   en fonction de sa formation et selon ses possibilités… ») ; le reste de l'alinéa est repris de mémoire et N'A PAS été relu mot à mot sur Légifrance
//   (à faire par Tristan). D4153-27, R4153-40, R4153-51 : textes de `contenus/pelleau.js` (`ARTICLES_JEUNES`, Légifrance, 19/10/2026). Liste « Ma prise de
//   poste » : d'après l'INRS (ED 36, document ancien), mise en forme construite.
//   Construit (dit dans la séance) : la réunion d'Erwan, le camion de 6 h 30, les défauts tirés, Yann et ses répliques (à relire à l'écran), le site.

import { apresFiche, apresMail, dialogueFini, inspectionFinie } from '../core/declencheurs.js';
import { etapesInspection, sceneCharge, VUES_INSPECTION } from '../core/types/inspection.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { niveauEleve } from '../core/tirage.js';
import { projection, boiteEcran, transpaletteElectrique, boitesTranspalette } from '../core/iso.js';
import { QUESTIONS } from './questions/ENT-10.3.js';
import { EQUIPE, LEXIQUE, MENTION, LOGO, ARTICLES_JEUNES, DROIT_CONSULTE, STYLE_DOCUMENTS, PIED, mailDe, heureScenario, ech, pied } from './pelleau.js';
import {
  ID, ID_VOLET, INSPECTION_ID, DIALOGUE_1, DIALOGUE_2, PHRASES_ID, JOUR, FICHES, LIGNES, LIB_LIGNES, MANQUE_LIGNES, inspectionDe, REPLIQUES_1, FIN_1,
  JUSTE_1, REPLIQUES_2, FIN_2, JUSTE_2, choixSignalement, justeSignalement, jeuDeBase, phrasesCompteRendu, envoyee, valeurDe, dejaEnvoyee, melangerPour,
} from './pelleau-ent103-donnees.js';

export { ID, ID_VOLET, INSPECTION_ID, DIALOGUE_1, DIALOGUE_2, PHRASES_ID, FICHES, LIGNES } from './pelleau-ent103-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const confirme = (db) => niveauEleve(db) === 'confirme';

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; pied imposé)
// « Ma prise de poste » : la liste d'ENT-10.2 (même matière, autre séance : copiée, jamais importée). Jointe au standard, pas au confirmé.
const DOC_PRISE_DE_POSTE = { id: 'prise-de-poste-103', titre: 'Ma prise de poste', court: 'Ma prise de poste',
  html: `<article class="pe-doc" aria-label="Ma prise de poste">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Ma prise de poste</p>
    <p class="pe-st">À vérifier chaque matin, avant de commencer.</p>
    <p class="pe-art"><b>1. Mon poste</b></p>
    <ul class="pe-ul pe-coche">
      <li>Mes [[EPI]] : chaussures de sécurité, gilet.</li>
      <li>Un [[extincteur]] à chaque quai, à sa place.</li>
      <li>Le [[plan de circulation]] affiché.</li>
      <li>L’[[allée piétonne]] libre.</li>
    </ul>
    <p class="pe-art"><b>2. Mon transpalette</b></p>
    <ul class="pe-ul pe-coche">
      <li>Les freins.</li>
      <li>L’[[avertisseur]] : je l’essaie.</li>
      <li>L’élévation des fourches.</li>
      <li>La batterie : chargée et bien branchée.</li>
      <li>Pas de fuite sous l’engin.</li>
      <li>L’[[arrêt d’urgence]] sur le [[timon]].</li>
    </ul>
    ${pied(`${PIED} Liste d’après l’INRS (brochure ED 36, transpalettes électriques) ; mise en forme construite.`)}
  </article>` };

// « Le droit » : L4122-1 (1er alinéa) et le rappel d'ENT-10.2 (D4153-27, R4153-40). Voir l'en-tête pour ce qui est vérifié.
const L4122_1 = 'Conformément aux instructions qui lui sont données par l’employeur, dans les conditions prévues au règlement intérieur pour les entreprises tenues d’en élaborer un, '
  + 'il incombe à chaque travailleur de prendre soin, en fonction de sa formation et selon ses possibilités, de sa santé et de sa sécurité ainsi que de celles des autres personnes '
  + 'concernées par ses actes ou ses omissions au travail.';
const loi = (L) => `<div class="pe-loi">${L.map((p, i) => `<p>${i === 0 ? '« ' : ''}${ech(p)}${i === L.length - 1 ? ' »' : ''}</p>`).join('')}</div>`;
const DOC_DROIT_103 = { id: 'droit-103', titre: 'Le droit : chacun, pour sa sécurité et celle des autres', court: 'Le droit',
  html: `<article class="pe-doc" aria-label="Le droit : chacun, pour sa sécurité et celle des autres">
    <p class="pe-t">Le droit : chacun, pour sa sécurité et celle des autres</p>
    <p class="pe-st">Code du travail — ce que chaque salarié ou stagiaire doit faire, et ce que la loi dit des jeunes et des engins</p>
    <p class="pe-art"><b>Code du travail, article L4122-1</b> (1er alinéa)</p>
    ${loi([L4122_1])}
    <p class="pe-art"><b>Code du travail, article D4153-27</b></p>
    ${loi(ARTICLES_JEUNES['D4153-27'])}
    <p class="pe-art"><b>Code du travail, article R4153-51</b></p>
    ${loi(ARTICLES_JEUNES['R4153-51'])}
    ${pied(`Textes réels (consultés le ${DROIT_CONSULTE}) ; le 1er alinéa de L4122-1 reste à relire sur Légifrance.`)}
  </article>` };

// « Ton matin » : le contexte du stage, pour « Avant de commencer ».
const DOC_STAGE = { id: 'stage-103', titre: 'Ton matin', court: 'Ton matin',
  html: `<article class="pe-doc" aria-label="Ton matin">
    <p class="pe-t">Ton matin à l’entrepôt</p>
    <p class="pe-st">6 mai, 6 h</p>
    <p>Tu es en stage (PFMP) aux <b>Transports Pelleau</b>, dans l’entrepôt neuf de Gouesnou. <b>Erwan</b>, ton [[tuteur]], est en réunion jusqu’à 8 h.</p>
    <p>Tu prends ton poste avec <b>Yann</b>. Un camion arrive à 6 h 30. Avant de commencer : tes [[EPI]], ton poste, ton engin. Maëlys tient le [[planning des quais]].</p>
    <p>À la fin, tu dois [[rendre compte]] à Erwan.</p>
    ${pied('Document pédagogique — Erwan et Yann sont imaginés pour l’exercice.')}
  </article>` };

// Les deux DESSINS d'« Avant de commencer » (kit iso, aucune photo libre au dépôt : comme ENT-10.2).
function dessinIso(I, interieur, boites, aria) {
  const r = boiteEcran(I, boites, 26);
  return `<svg class="pe-dessin" viewBox="${r.x} ${r.y} ${r.w} ${r.h}" role="img" aria-label="${ech(aria)}">${interieur}</svg>`;
}
const DESSIN_FOURCHES = (() => {
  const I = projection({ unite: 150, origine: [300, 80] });
  const sol = I.face([[-0.5, -0.4, 0], [1.4, -0.4, 0], [1.4, 2.4, 0], [-0.5, 2.4, 0]], '#e4dfd3', 'none');
  return dessinIso(I, sol + transpaletteElectrique(I, [0, 0], 'ok', { n: 1 }), boitesTranspalette('ok', [0, 0]),
    'Un engin jaune à deux fourches, avec un long manche et un capot qui porte le numéro 1');
})();
const [VX, VY, VW, VH] = VUES_INSPECTION.charge.viewBox;
const DESSIN_CHARGE = `<svg class="pe-dessin" viewBox="${VX} ${VY} ${VW} ${VH}" role="img" aria-label="Le local de charge : deux engins jaunes branchés par un câble à une borne fixée au mur">${
  sceneCharge({ 'transpalette-1': 'ok', 'transpalette-2': 'ok' })}</svg>`;
const DOC_DESSIN_FOURCHES = { id: 'dessin-fourches-103', titre: 'Un engin de l’entrepôt', court: 'Un engin',
  html: `<article class="pe-doc" aria-label="Un engin de l’entrepôt">${DESSIN_FOURCHES}<p class="pe-st">Dessin construit pour l’exercice.</p></article>` };
const DOC_DESSIN_CHARGE = { id: 'dessin-charge-103', titre: 'Le local de charge', court: 'Le local de charge',
  html: `<article class="pe-doc" aria-label="Le local de charge">${DESSIN_CHARGE}<p class="pe-st">Dessin construit pour l’exercice.</p></article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.pe-coche{list-style:none; padding-left:4px}
.pe-coche li::before{content:"☐"; margin-right:8px; font-size:1.05rem}
.pe-dessin{display:block; width:100%; max-height:340px; margin:4px auto 6px}
`;
export const DOCUMENTS = [DOC_PRISE_DE_POSTE, DOC_DROIT_103, DOC_STAGE, DOC_DESSIN_FOURCHES, DOC_DESSIN_CHARGE];
// Les pièces jointes du premier message : le confirmé n'a pas la liste « Ma prise de poste » (aide éteinte, brief §5).
const piecesDepart = (db) => (confirme(db) ? [DOC_DROIT_103.id] : [DOC_PRISE_DE_POSTE.id, DOC_DROIT_103.id]);

// ─────────────────────────────────────────────────────────────── ①③ « Avec Yann » (face à face, collègue : tu)
export const TELEPHONE = {
  face: true,
  libelle: 'Avec Yann',
  situation: 'Erwan est en réunion jusqu’à 8 h. Yann prépare le camion de 6 h 30.',
  dialogues: [
    { id: DIALOGUE_1, de: 'yann', contact: { nom: 'Yann, 6 h 05', detail: 'avant de prendre ton poste' }, repliques: REPLIQUES_1, fin: FIN_1 },
    { id: DIALOGUE_2, de: 'yann', contact: { nom: 'Yann, après ton contrôle', detail: 'il revient te voir' }, repliques: REPLIQUES_2, fin: FIN_2,
      quand: inspectionFinie(INSPECTION_ID) },
  ],
};

// ─────────────────────────────────────────────────────────────── ② mon poste (vue « Inspection du poste », fonction de la graine)
export const INSPECTION = (graine, o) => inspectionDe(graine, o);
const inspectionFaite = inspectionFinie(INSPECTION_ID);

// ─────────────────────────────────────────────────────────────── ④ la fiche « Signalement » (comme une étiquette de consignation, construite)
const ligneListe = (db, ligne) => ({ type: 'liste', id: LIGNES[ligne], lib: LIB_LIGNES[ligne], vide: 'Choisir…', manque: MANQUE_LIGNES[ligne],
  choix: melangerPour(db, `signalement-${ligne}`, choixSignalement(jeuDeBase(db))[ligne]).map((c) => ({ v: c.v, lib: c.lib })) });
export const FICHE_SIGNALEMENT = {
  id: FICHES.signalement, libelle: 'Signalement', titre: 'Fiche de signalement',
  sousTitre: 'Erwan veut tout par écrit. Remplis les trois lignes.',
  bouton: 'Ouvrir la fiche « Signalement »',
  quand: (db) => dialogueFini(DIALOGUE_2)(db, ID),
  blocs: (db) => ['quoi', 'pas', 'fait'].map((l) => ligneListe(db, l)),
  envoi: { bouton: 'Poser la fiche et l’envoyer à Erwan', a: 'Erwan', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── les messages (au tu ; 6 mai, aucun jour de la semaine)
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const YANN = { nom: EQUIPE.yann.nom, mail: mailDe('yann') };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(o.jour || JOUR, o.heure || '06:00', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (de, texte) => (prenom, n, db) => ({ mails: [mail(prenom, de, 'Bien reçu', `${texte}\n\n${de.nom}`, { db, heure: '08:02', decalage: n })] });

export const MESSAGE_ERWAN = (prenom, db) => `Bonjour ${prenom}, demain je suis en réunion jusqu’à 8 h. Prends ton poste avec Yann : va le voir (menu « Avec Yann »), puis regarde ton poste (menu « Mon poste »).\n\n`
  + `S’il y a un problème, écris-le-moi. Je te joins ${confirme(db) ? '« Le droit »' : '« Ma prise de poste » et « Le droit »'}.\n\nErwan`;
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, ERWAN, 'Demain matin', MESSAGE_ERWAN(prenom, db), { db, jour: JOUR - 1, heure: '18:00', extra: { pieces: piecesDepart(db) } }),
  ] }),
  // « Corriger » : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [FICHES.signalement]: accuse(ERWAN, 'Merci, j’ai ta nouvelle fiche.'), [PHRASES_ID]: accuse(ERWAN, 'Merci, j’ai ton nouveau message.') },
  declencheurs: [
    { id: 'yann-revient', quand: inspectionFaite,
      semer: (prenom, db) => ({ mails: [mail(prenom, YANN, 'Alors ?', 'Alors, tu as fini ? Passe me voir (menu « Avec Yann »), le camion arrive.\n\nYann',
        { db, heure: '06:15' })] }) },
    { id: 'fiche', quand: dialogueFini(DIALOGUE_2),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Ta fiche',
        'Je suis toujours en réunion. Pour que ce soit écrit, remplis la fiche « Signalement » et envoie-la-moi.\n\nErwan',
        { db, heure: '06:40', extra: { ouvreFiche: FICHES.signalement } })] }) },
    { id: 'compte-rendu', quand: apresFiche(FICHES.signalement),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Rends-moi compte',
        'Je sors de réunion. [[rendre compte|Rends-moi compte]] de ton matin.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nErwan',
        { db, heure: '08:00', extra: { phrases: phrasesCompteRendu(prenom, db) } })] }) },
    { id: 'fin', quand: apresMail({ a: ERWAN.mail }),
      // Toujours le même message : Erwan ne dit pas si le détail est juste.
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Merci', `Merci ${prenom}, j’ai lu ta fiche. On en reparle tout à l’heure, avec Yann.\n\nErwan`,
        { db, heure: '08:05' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 18/10/2026 à 22 h 03, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant le raccrochage (dialogues), la prise de poste (inspection), l'envoi (fiche,
// phrases) : l'inaction vaut 0. Les dialogues et l'inspection n'ont pas d'`ecran` : « Corriger » ne les rouvre pas (`finFige`). Mêmes ids pour tous les élèves.
export const GROUPES = { avant: 'Avant le premier geste', poste: 'Mon poste', ceder: 'Ne pas céder', signaler: 'Signaler par écrit', compte: 'Rendre compte' };
const POIDS_INSPECTION = { 'securite-defaut': 3.5, 'essai-1': 0.5, 'essai-2': 0.5, 'securite-aucun-faux': 1.5 };
const TITRES_INSPECTION = { 'securite-defaut': 'Mon poste : le défaut signalé avant de prendre le poste', 'essai-1': 'Mon poste : l’avertisseur du transpalette n° 1 essayé',
  'essai-2': 'Mon poste : l’avertisseur du transpalette n° 2 essayé', 'securite-aucun-faux': 'Mon poste : aucun faux signalement' };
const jalonYann = (dialogue, replique, id, titre, groupe, poids, juste) => {
  const j = jalonDialogue({ seance: ID, dialogue, id, titre, groupe, poids, juge: (appel) => premiereReponse(appel, replique) === juste[replique] });
  delete j.ecran;
  return j;
};
const jalonsInspection = etapesInspection(INSPECTION, ID).map((e) => Object.assign(e, { groupe: GROUPES.poste, poids: POIDS_INSPECTION[e.id], titreBilan: TITRES_INSPECTION[e.id] }));
const ligneFiche = (ligne, titre) => ({ id: `signalement-${ligne}`, titre, groupe: GROUPES.signaler, poids: 1, ecran: `fiche:${FICHES.signalement}`,
  verifier: (db) => (!envoyee(db, FICHES.signalement) ? attente : valeurDe(db, FICHES.signalement, LIGNES[ligne]) === justeSignalement(jeuDeBase(db), ligne) ? ok : ko) });
const ligneCR = (id, titre, lignes, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko; } });

export const ETAPES = [
  jalonYann(DIALOGUE_1, 'depart', 'controle-d-abord', 'Avant le premier geste : « je contrôle d’abord », dit à Yann dès la première réponse', GROUPES.avant, 1.5, JUSTE_1),
  ...jalonsInspection,
  jalonYann(DIALOGUE_2, 'insiste', 'ne-pas-ceder', 'Ne pas céder : la bonne réponse à Yann dès la première réponse', GROUPES.ceder, 3, JUSTE_2),
  ligneFiche('quoi', 'Signaler par écrit : ce qui ne va pas'),
  ligneFiche('pas', 'Signaler par écrit : ce qu’on ne fait pas'),
  ligneFiche('fait', 'Signaler par écrit : ce que tu as fait'),
  ligneCR('cr-vu', 'Le compte rendu : ce que tu as vu', ['vu'], 0.75),
  ligneCR('cr-fait', 'Le compte rendu : ce que tu as fait', ['fait'], 0.75),
  ligneCR('cr-salutation', 'Le compte rendu : la salutation', ['salutation'], 0.5),
  ligneCR('cr-fin', 'Le compte rendu : la fin du message', ['fin'], 0.5),
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, lexique, accueil, options
export const PASTILLES = [
  { libelle: 'Yann', fait: dialogueFini(DIALOGUE_1) },
  { libelle: 'Mon poste', fait: (db) => inspectionFaite(db, ID) },
  { libelle: 'Signalement', fait: dejaEnvoyee(FICHES.signalement) },
  { libelle: 'Compte rendu', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
// L'ordre des écrans de travail (barre « Étape suivante » et menu « Mon poste », CAP).
export const SUITE = [
  { vue: 'telephone', libelle: 'Avec Yann, avant de prendre ton poste', fait: dialogueFini(DIALOGUE_1) },
  { vue: 'inspection', libelle: 'Mon poste', fait: (db) => inspectionFaite(db, ID) },
  { vue: 'telephone', libelle: 'Avec Yann, après ton contrôle', fait: dialogueFini(DIALOGUE_2) },
  { vue: 'fiche', libelle: 'Signalement', fait: dejaEnvoyee(FICHES.signalement) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu à Erwan', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const LEXIQUE_103 = {
  ...LEXIQUE,
  EPI: 'Équipements de protection individuelle : chaussures de sécurité, gilet, gants.',
  'local de charge': 'Local où l’on recharge les batteries des engins électriques.',
  'transpalette électrique': 'Transpalette à moteur : on marche à côté et on le guide avec le timon.',
  avertisseur: 'Le klaxon de l’engin : il prévient les piétons.',
  'arrêt d’urgence': 'Gros bouton qui coupe tout de suite le moteur de l’engin.',
  timon: 'Le long manche avec lequel on guide le transpalette.',
  extincteur: 'Appareil pour éteindre un début de feu. Il doit être à sa place, visible et dégagé.',
  'plan de circulation': 'Plan affiché qui montre où roulent les engins et où marchent les piétons.',
  'allée piétonne': 'Passage marqué au sol, réservé aux personnes à pied.',
  'planning des quais': 'Tableau qui montre quel camion arrive, à quelle heure, à quel quai.',
  'rendre compte': 'Dire à son responsable ce qu’on a fait ou vu, même quand tout va bien.',
};
export const MENTION_103 = `${MENTION} Construits aussi : la réunion d’Erwan, le camion de 6 h 30, les défauts à trouver et les paroles de Yann.`;
export const ACCUEIL = {
  titre: 'On commence quand même ?',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Erwan', 'Menu Messagerie.'],
    ['① Avec Yann', 'Il t’attend, pressé. Menu Avec Yann.'],
    ['② Mon poste', 'Contrôle ton poste et tes transpalettes, signale ce qui ne va pas.'],
    ['③ Avec Yann, encore', 'Il revient te voir après ton contrôle.'],
    ['④ Signaler par écrit', 'Remplis la fiche « Signalement » pour Erwan.'],
    ['⑤ Rendre compte', 'Réponds à Erwan, une phrase par ligne.'],
    ['Bon à savoir', MENTION_103],
  ],
};
export const FIN_FIGE = 'Ce matin-là ne se rejoue pas : Yann a déjà entendu ta réponse.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 3 : on commence quand même ?',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_103,
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_SIGNALEMENT],
  telephone: TELEPHONE,
  inspection: INSPECTION,
  // « Mon poste » n'ouvre qu'après la première rencontre avec Yann.
  fermetures: { inspection: { ouvertSi: (db, seance) => dialogueFini(DIALOGUE_1)(db, seance), message: 'Après ton échange avec Yann' } },
  pastilles: PASTILLES,
  suite: SUITE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
