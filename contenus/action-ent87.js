// ENT-8.7 — Action, « on décharge ensemble » : le contenu de la séance (brief `docs/briefs/ENT-8.7-action-decharger.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-action.md` §8). CAP OL, GUIDAGE de CAP-C1.3 (prendre en charge les opérations de réception). Univers commun :
// `contenus/action.js` (lu ; ENT-8.7 y a AJOUTÉ `DOC_DROIT_QUAI`, `protocoleSecurite`, `STYLE_PROTOCOLE`). Données pures (protocole, banque,
// anomalie, quai, dialogue) : `contenus/action-ent87-donnees.js`. Activité : `activites/action-decharger.js`. Questions :
// `contenus/questions/ENT-8.7.js`. Corrigé : `contenus/corriges/ENT-8.7.js`.
//
// Mardi 9 novembre, 6 h 45 → 7 h 30 (aucune année écrite), suite directe d'ENT-8.2 : le camion du Havre, quai 2, 7 h. UN ÉCRAN PAR ÉTAPE (§0 bis
// d'ENT-8.3) — la consigne de Samia en haut, l'écran suivant ouvert à l'envoi du précédent, la barre « Étape suivante » :
//   ① Le protocole du quai 2 (fiche, le protocole, « Le droit » et la photo du chariot à gauche ; 3 situations TIRÉES + « qui décharge ») ;
//   ② Au quai : accueillir le chauffeur (vue Dialogue à choix, face à face, Marc) ;
//   ③ Le quai 2 (quai iso : inspection sur la scène, UNE anomalie TIRÉE de la graine ; Kevin décharge au chariot frontal, l'élève choisit la case de
//      chaque palette ; le quai s'arrête quand la 4e palette est posée).
// Rien n'est jugé à l'écran (sauf les réactions de Marc et de Kevin, qui ne disent ni juste ni faux) ; le bilan détaillé dit juste / à corriger.

import { apresFiche, dialogueFini, quaiDecharge } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { graineDeBase, niveauEleve } from '../core/tirage.js';
import { QUESTIONS } from './questions/ENT-8.7.js';
import { EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, mailDe, figure, DOC_DROIT_QUAI, protocoleSecurite, STYLE_PROTOCOLE } from './action.js';
import {
  ID, ID_VOLET, QUAI_ID, FICHE_ID, DIALOGUE, SPEC_PROTOCOLE, TIRAGE, ENGIN, REPLIQUES, JUSTES_DIALOGUE, FIN_DIALOGUE,
  situationsDe, situationsBonus, choixDe, melangerPour, quaiDe, anomalieDe, anomalieBonusDe, PALETTES, SAMIA_QUAI,
} from './action-ent87-donnees.js';

export { TIRAGE };

// ─────────────────────────────────────────────────────────────── l'heure du scénario (mardi 9 novembre, aucune année écrite)
// Le 9 novembre de l'année scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l'année d'avant), comme ENT-8.2.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 10, 9, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche « déjà envoyée une fois » : vraie aussi pendant une correction (« Corriger » retire `envoye`, le geste reste rangé).
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
// Le quai de CET élève (sa graine ET son niveau, lot 4 : comme le moteur) et son état.
export const quaiEleve = (db) => quaiDe(graineDeBase(db), { niveau: niveauEleve(db) });
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;

// ─────────────────────────────────────────────────────────────── les documents (reconstitués ; pieds « Document pédagogique »)
const PIED_DESSIN = 'Dessin construit pour l’exercice.';
const dessin = (id, titre, svg) => ({ id, titre, court: titre,
  html: `<article class="ac-doc" aria-label="${titre}"><p class="ac-t">${titre}</p>${svg}${PIED(PIED_DESSIN)}</article>` });
// La cale (dessin en traits) : une roue de remorque, et contre le pneu, un coin posé au sol.
const SVG_CALE = `<svg class="d87" viewBox="0 0 280 170" role="img" aria-label="Une roue de remorque, et un objet en forme de coin posé au sol contre le pneu"
  fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
  <defs><pattern id="d87sol" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="currentColor" stroke-width="1"/></pattern></defs>
  <rect x="10" y="146" width="260" height="12" fill="url(#d87sol)" stroke="none"/><path d="M10 146 H270"/>
  <path d="M20 26 H260 V58 H20 Z"/><path d="M70 58 V64 M170 58 V64"/>
  <circle cx="120" cy="104" r="42"/><circle cx="120" cy="104" r="26"/><circle cx="120" cy="104" r="7"/>
  <path d="M163 146 L222 146 L163 104 Z"/><path d="M175 140 L203 140"/>
</svg>`;
// Les feux de quai (dessin en traits, lisible en noir et blanc) : à côté de la porte, un boîtier à deux feux ; celui du haut est allumé (rayons).
const SVG_FEUX = `<svg class="d87" viewBox="0 0 280 170" role="img" aria-label="Une porte de quai fermée vue de dehors ; à côté, un boîtier à deux feux, celui du haut allumé"
  fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
  <path d="M10 160 H270"/><path d="M30 20 H170 V160 M30 20 V160"/>
  <path d="M30 45 H170 M30 70 H170 M30 95 H170 M30 120 H170"/>
  <rect x="200" y="40" width="40" height="80" rx="6"/>
  <circle cx="220" cy="62" r="12"/><circle cx="220" cy="98" r="12"/>
  <path d="M220 62 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" fill="currentColor"/>
  <path d="M220 40 V30 M240 48 L248 42 M200 48 L192 42 M244 62 H254 M186 62 H196"/>
  <path d="M220 120 V160"/>
</svg>`;
export const DOC_PROTOCOLE = { id: 'protocole-quai2', titre: 'Protocole de sécurité — quai 2', court: 'Le protocole du quai 2', html: protocoleSecurite(SPEC_PROTOCOLE) };
const DOC_PROTOCOLE_ENTETE = { id: 'protocole-entete', titre: 'Un protocole de sécurité', court: 'Un protocole', html: protocoleSecurite(SPEC_PROTOCOLE, { entete: true }) };
const DOC_CHARIOT = { id: 'photo-chariot', titre: 'Le matériel du quai 2', court: 'Le matériel',
  image: { src: './contenus/images/action/chariot-elevateur.jpg', alt: 'Un engin orange à siège, avec un mât et deux fourches à l’avant, dans un entrepôt',
    mention: 'Photo d’un autre entrepôt — Ani Set / Pexels' } };
const DOC_STAGE = { id: 'stage', titre: 'Ton stage à la réception', court: 'Ton stage',
  html: `<article class="ac-doc" aria-label="Ton stage à la réception">
    <p class="ac-t">Ton stage à la réception</p>
    <p class="ac-st">Mardi 9 novembre, 6 h 45</p>
    <p>Tu es en stage (PFMP) chez <b>Geodis</b>, à l’entrepôt Action d’Ensuès-la-Redonne. Ce matin, le camion du Havre arrive au <b>quai 2</b>.</p>
    <p>Ta [[tutrice]] : <b>Samia</b>, cheffe d’équipe. <b>Kevin</b>, cariste, décharge le camion. Le chauffeur s’appelle <b>Marc</b>.</p>
    ${figure('quai')}
    ${PIED('Samia, Kevin et Marc sont construits pour l’exercice.')}
  </article>` };
export const STYLE = `${STYLE_DOCUMENTS}${STYLE_PROTOCOLE}
.d87{display:block; width:100%; max-width:380px; height:auto; margin:6px auto 8px; color:#2b2824}
`;
export const DOCUMENTS = [DOC_PROTOCOLE, DOC_DROIT_QUAI, DOC_CHARIOT, DOC_PROTOCOLE_ENTETE, DOC_STAGE,
  dessin('dessin-cale', 'Devant la roue', SVG_CALE), dessin('dessin-feux', 'À côté de la porte de quai', SVG_FEUX)];

// ─────────────────────────────────────────────────────────────── ① la fiche « Le protocole du quai 2 »
export const SAMIA_PROTOCOLE = 'Le camion du Havre arrive dans un quart d’heure. Avant, lis le protocole de sécurité du quai 2, et dis-moi ce qu’il faut faire dans chaque cas.';
// Une ligne par situation : des boutons radio l'un sous l'autre (`choix`, `colonne`), pas une liste déroulante : une consigne du protocole fait
// jusqu'à 140 signes, un menu déroulant la coupait une fois choisie (vu à l'écran le 17/10/2026). La fiche défile dans sa colonne (`defile`), le
// protocole reste entier à gauche.
const ligneSituation = (db, s) => ({ type: 'choix', id: s.id, lib: `${s.texte} Que dit le protocole ?`, colonne: true,
  choix: melangerPour(db, s.id, choixDe(s)), manque: `ce que dit le protocole (« ${s.texte.replace(/\.$/, '')} »)` });
export const FICHE = {
  id: FICHE_ID, libelle: 'Le protocole du quai 2', titre: 'Le protocole du quai 2',
  sousTitre: `Samia : « ${SAMIA_PROTOCOLE} »`,
  documents: ['protocole-quai2', 'droit-quai', 'photo-chariot'], largeurDocs: 1.75, serree: true, defile: true,
  bouton: 'Ouvrir la fiche « Le protocole du quai 2 »',
  blocs: (db) => [
    ...[...situationsDe(db), ...situationsBonus(db)].map((s) => ligneSituation(db, s)),
    { type: 'choix', id: ENGIN.id, lib: ENGIN.lib, colonne: true, choix: melangerPour(db, ENGIN.id, ENGIN.choix), manque: 'qui décharge, et avec quoi' },
  ],
  envoi: { bouton: 'Envoyer à Samia', a: 'Samia', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ② « Au quai » : accueillir le chauffeur (face à face, vouvoiement)
export const SAMIA_ACCUEIL = 'Le camion est là. Accueille le chauffeur et installe-le comme le dit le protocole. Planigramme : camion du Havre, quai 2, 7 h.';
export const TELEPHONE = {
  face: true,
  libelle: 'Au quai',
  situation: `Samia : « ${SAMIA_ACCUEIL} »`,
  dialogues: [{ id: DIALOGUE, de: 'marc', contact: { nom: 'Marc', detail: 'chauffeur, camion du Havre' }, repliques: REPLIQUES, fin: FIN_DIALOGUE }],
};
export const EQUIPE_87 = { ...EQUIPE, marc: { nom: 'Marc', role: 'chauffeur, camion du Havre', appel: 'Marc', registre: 'vous' } };

// ─────────────────────────────────────────────────────────────── les messages de Samia (au tu ; date du scénario)
const SAMIA = { nom: EQUIPE.samia.nom, mail: mailDe('samia') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:45', { db: o.db, decalage: o.decalage || 0 }),
  from: SAMIA.nom, fromMail: SAMIA.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const merci = (prenom, n, db) => ({ mails: [mail(prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '07:28' })] });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, 'Le protocole du quai 2',
      'Le camion du Havre arrive dans un quart d’heure. Avant, lis le [[protocole de sécurité]] du quai 2, et dis-moi ce qu’il faut faire dans chaque cas.\n\nSamia',
      { extra: { ouvreFiche: FICHE_ID, pieces: ['protocole-quai2', 'droit-quai'] } }),
  ] }),
  corrections: { [FICHE_ID]: merci },
  declencheurs: [
    { id: 'accueil', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le camion est là',
        `${SAMIA_ACCUEIL}\n\nSamia`, { db, heure: '07:00' })] }) },
    { id: 'quai', quand: dialogueFini(DIALOGUE),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Kevin est prêt', `${SAMIA_QUAI}\n\nSamia`, { db, heure: '07:05' })] }) },
    { id: 'fin', quand: quaiDecharge(QUAI_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Les palettes sont au sol',
        'Les palettes sont au sol. Maintenant, on vérifie qu’il ne manque rien.\n\nSamia', { db, heure: '07:25' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 16/10/2026 à 18 h 54, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant le raccrochage (dialogue), l'envoi (fiche), le figeage de
// l'inspection (« C'est bon ») ou la dernière palette posée (dépose) : l'inaction vaut 0. « Aucun faux signalement » est faux si rien n'a été
// signalé (moteur). Le quai n'a pas d'`ecran` : il ne se rouvre pas (`finFige`).
export const GROUPES = { accueil: 'Accueillir le chauffeur', protocole: 'Le protocole', avant: 'Avant de décharger', diriger: 'Diriger le déchargement' };
export const POIDS_SITUATION = { facile: 1, moyen: 1.5, difficile: 1.5 };
const ECRAN_FICHE = `fiche:${FICHE_ID}`;
const juge = (db, id, juste) => (!envoyee(db, FICHE_ID) ? attente : valeurDe(db, FICHE_ID, id) === juste ? ok : ko);
const jalonAccueil = (id, replique, titre, poids) => jalonDialogue({ seance: ID, dialogue: DIALOGUE, id, titre, groupe: GROUPES.accueil, poids,
  juge: (appel) => premiereReponse(appel, replique) === JUSTES_DIALOGUE[replique] });
// Le quai : la ligne de la vue (`jalonsQuai` sur le quai DE L'ÉLÈVE), jugée seulement quand l'étape est finie.
const ligneQuai = (db, id) => jalonsQuai(db, quaiEleve(db)).L.find((l) => l.id === id) || null;
const inspectionFigee = (db) => !!(etatQuai(db) && etatQuai(db).securite && etatQuai(db).securite.fait);
const dechargeFini = (db) => !!(etatQuai(db) && etatQuai(db).dechargeFini);
// Le danger du SOCLE (le confirmé en a un second, `bonus-danger`, qui ne compte pas dans le socle).
export const pointDanger = (db) => quaiEleve(db).securite.points.find((p) => p.id === anomalieDe(graineDeBase(db)));
const jalonQuai = (id, titre, groupe, poids, fini, ligne) => ({ id, titre, groupe, poids,
  verifier(db) { if (!fini(db)) return attente; const l = ligne(db); if (!l) throw new Error(`ligne du quai « ${id} » absente`); return l.ok ? ok : ko; } });

export const ETAPES = [
  jalonAccueil('accueil-salutation', 'arrivee', 'Accueillir le chauffeur : saluer et se présenter', 0.5),
  jalonAccueil('accueil-documents', 'documents', 'Accueillir le chauffeur : les documents demandés', 1),
  jalonAccueil('accueil-quai', 'quai', 'Accueillir le chauffeur : où il se met', 1),
  jalonAccueil('accueil-attente', 'attente', 'Accueillir le chauffeur : ce qu’il fait pendant le déchargement', 1.5),
  jalonAccueil('accueil-fin', 'fin', 'Accueillir le chauffeur : finir poliment', 0.5),
  ...['facile', 'moyen', 'difficile'].map((d) => ({ id: `situation-${d}`, titre: 'Le protocole : une situation', groupe: GROUPES.protocole, poids: POIDS_SITUATION[d], ecran: ECRAN_FICHE,
    // Le bilan détaillé (CAP) : la SITUATION elle-même (l'ordre des lignes est tiré), jamais la consigne attendue.
    titreBilan: (db) => { const s = situationsDe(db).find((x) => x.difficulte === d); return s ? `Le protocole : ${s.texte.replace(/\.$/, '')}` : null; },
    verifier(db) { const s = situationsDe(db).find((x) => x.difficulte === d); if (!s) throw new Error(`situation ${d} absente du tirage`); return juge(db, s.id, s.juste); } })),
  jalonQuai('securite-danger', 'Avant de décharger : le danger signalé avant de décharger', GROUPES.avant, 3, inspectionFigee,
    (db) => ligneQuai(db, `securite-${pointDanger(db).id}`)),
  jalonQuai('securite-aucun-faux', 'Avant de décharger : aucun faux signalement', GROUPES.avant, 1, inspectionFigee, (db) => ligneQuai(db, 'securite-aucun-faux')),
  { id: 'engin', titre: 'Le protocole : qui décharge, et avec quoi', groupe: GROUPES.diriger, poids: 1, ecran: ECRAN_FICHE,
    verifier: (db) => juge(db, ENGIN.id, ENGIN.juste) },
  ...PALETTES.map((p) => jalonQuai(`depose-${p.id}`, `Diriger le déchargement : la palette ${p.id}`, GROUPES.diriger, 0.625, dechargeFini,
    (db) => ligneQuai(db, `depose-${p.id}`))),
  // Le cas bonus du confirmé (sans poids ni groupe, caché à l'élève) : `null` chez qui ne l'a pas reçu.
  { id: 'bonus-situation', titre: 'Le protocole : une situation de plus', bonus: true, ecran: ECRAN_FICHE,
    verifier(db) { const B = situationsBonus(db); if (!B.length) return null; if (!envoyee(db, FICHE_ID)) return attente;
      return B.every((s) => valeurDe(db, FICHE_ID, s.id) === s.juste) ? ok : ko; } },
  // Le 2e danger de la scène du confirmé (lot 4) : `null` chez qui ne l'a pas reçu ; jugé comme le danger du socle, sans effet sur sa note.
  { id: 'bonus-danger', titre: 'Avant de décharger : un danger de plus', bonus: true,
    verifier(db) { if (niveauEleve(db) !== 'confirme') return null; if (!inspectionFigee(db)) return attente;
      const l = ligneQuai(db, `securite-${anomalieBonusDe(graineDeBase(db))}`); if (!l) throw new Error('ligne du quai « bonus-danger » absente'); return l.ok ? ok : ko; } },
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'fiche', libelle: 'Le protocole du quai 2', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'telephone', libelle: 'Au quai : accueillir le chauffeur', fait: dialogueFini(DIALOGUE) },
  { vue: 'quai', libelle: 'Le quai 2 : inspecter, puis décharger', fait: quaiDecharge(QUAI_ID) },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres, CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_87 = {
  ...LEXIQUE,
  'protocole de sécurité': 'Document écrit, préparé avant la première livraison par le site et le transporteur, qui dit comment charger et décharger sans danger sur ce site.',
  'local chauffeurs': 'Pièce d’un site logistique réservée aux chauffeurs des camions, à l’écart des quais.',
  cale: 'Bloc en forme de coin que l’on pose contre une roue du camion pour qu’il ne puisse pas bouger.',
  butoirs: 'Blocs en caoutchouc fixés au bord du quai : le camion recule jusqu’à eux sans abîmer le quai.',
  'allée piétonne': 'Passage marqué au sol, réservé aux personnes à pied, où les engins ne roulent pas.',
  'zone de réception': 'Endroit devant les quais où l’on pose les palettes qui sortent du camion, avant de les contrôler.',
  cariste: 'Personne qui conduit un chariot élévateur pour charger, décharger et ranger les palettes.',
  CACES: 'Certificat qui prouve qu’on sait conduire un engin de manutention (un chariot élévateur, par exemple) en sécurité.',
  'chariot élévateur frontal': 'Chariot élévateur qui porte la palette à l’avant, sur ses deux fourches.',
  anomalie: 'Quelque chose qui n’est pas normal : on ne le règle pas seul, on le signale.',
  gerbage: 'Poser une palette sur une autre.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), le hub d’import du Havre, le Code du travail. '
  + 'Construit : le protocole du quai 2 (d’après le Code du travail ; consignes et valeurs inventées), le transporteur, Marc, Samia et Kevin, le chargement du '
  + 'camion, le quai (un dessin) et ses cases de dépose.';
export const ACCUEIL = {
  titre: 'On décharge ensemble',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Le protocole du quai 2', 'Lis le protocole, puis dis ce qu’il faut faire dans chaque cas.'],
    ['② Au quai', 'Va accueillir le chauffeur du camion du Havre.'],
    ['③ Le quai 2', 'Regarde le quai et le camion avant de décharger, puis dis à Kevin où poser chaque palette.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Le quai se joue une fois : le camion est déchargé.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 7 : on décharge ensemble',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_87,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  telephone: TELEPHONE,
  quai: quaiDe,
  suite: SUITE,
  equipe: EQUIPE_87,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  fermetures: {
    telephone: { ouvertSi: (db) => dejaEnvoyee(FICHE_ID)(db), message: 'Après la fiche « Le protocole du quai 2 »' },
    quai: { ouvertSi: (db, seance) => dialogueFini(DIALOGUE)(db, seance), message: 'Après l’accueil du chauffeur' },
  },
};
