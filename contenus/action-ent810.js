// ENT-8.10 — Action, évaluation « recevoir un camion dans un nouveau site » : le contenu de la séance (brief
// `docs/briefs/ENT-8.10-action-evaluation-reception.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8.2 et §8.5 bis).
// Univers commun : `contenus/action.js` (lu, jamais modifié ici). Les deux sites : `contenus/action-eval-sites.js` (partagé avec ENT-8.5 et 8.6, lu).
// Données pures : `contenus/action-ent810-donnees.js`. Activité : `activites/action-evaluation-reception.js`. Questions :
// `contenus/questions/ENT-8.10.js`. Corrigé : `contenus/corriges/ENT-8.10.js`.
//
// Mercredi 13 janvier, 6 h 30 (aucune année écrite), le lendemain d’ENT-8.6, dans le MÊME site tiré (Onnaing / GXO, ou Belleville-en-Beaujolais /
// Kuehne+Nagel) ; le tuteur (Karim ou Sandrine) est en réunion : l’élève reçoit SEUL le camion de décoration, quai 3, 7 h. CAP OL, ÉVALUATION de
// CAP-C1.3 et CAP-C1.4, en copie rendue (`copie: true`) : rien ne remonte pendant le travail, une seule remise (« Rendre ma copie » du bandeau),
// note figée ; aucun bilan, aucun « Corriger », aucun mot cliquable, rien à l’écran ne dit juste ou faux ; pastilles « fait ».
//   Avant de commencer (noté, 4 points, « Le droit » à gauche) → ① Le protocole du quai 3 (fiche : 3 situations TIRÉES) → ② Au quai : accueillir
//   le chauffeur (Dialogue face à face, en évaluation : la première réponse compte, aucune réaction) → ③ Le quai 3 (inspection sur la scène, UNE
//   anomalie tirée, rien n’arrête ; dépose dirigée en copie : le premier clic pose ; contrôle des 4 palettes, 1 problème + 1 piège tirés ; réserves,
//   signature ; la clôture NE rend PAS la copie, `rendCopie: false`) → ④ rendre compte par phrases (« ma réception » jugée sur SES décisions) →
//   Rendre ma copie.
// La barre « Étape suivante » n’existe pas en évaluation (moteur) : l’ordre se lit au menu « Mon poste », chaque écran reste fermé tant que le
// précédent n’est pas fait, et les messages du tuteur annoncent l’écran suivant (écart dit au compte rendu, comme ENT-8.6).
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) : voir l’en-tête de `contenus/action-ent810-donnees.js` et `MENTION`. « Le droit » : C. trav. R4515-4 et R4515-8
// (recopiés de `DOC_DROIT_QUAI`, relus sur Légifrance le 17/10/2026 par ENT-8.7), C. com. L133-3, 1er alinéa (recopié d’ENT-8.8, relu sur
// Légifrance le 17/10/2026), C. com. L133-1 (RELU sur Légifrance par Claude Code le 17/10/2026 : LEGIARTI000006220288, version en vigueur depuis
// le 21/09/2000).

import { apresFiche, dialogueFini } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS, TUTEUR } from './questions/ENT-8.10.js';
import * as ACTION from './action.js';
import { PIED, ech, protocoleSecurite, STYLE_PROTOCOLE, DROIT_CONSULTE } from './action.js';
import {
  ID, ID_VOLET, QUAI_ID, FICHE_ID, DIALOGUE, PHRASES_ID, QUAI_NUM, REPLIQUES, JUSTES_DIALOGUE, FIN_DIALOGUE, TIRAGE,
  siteEleve, equipeDe, specProtocole, situationsDe, texteSituation, choixDe, melangerPour, quaiDe, quaiDeBase, jeuDeBase, duRole, ligneReception,
} from './action-ent810-donnees.js';

export { ID, QUAI_ID, PHRASES_ID, TIRAGE };

// ─────────────────────────────────────────────────────────────── l’entreprise de CETTE séance (le site est tiré : bandeau neutre)
export const ENTREPRISE = { ...ACTION.ENTREPRISE,
  sousTitre: 'Un nouvel entrepôt d’Action — commerce à petits prix', exercice: 'Évaluation : recevoir un camion dans un nouveau site' };
export const VOCAB = { ...ACTION.VOCAB, mailDomain: 'action-stage.example' };
export const THOMAS = { nom: 'Thomas', role: 'chauffeur, camion de décoration', appel: 'Thomas', registre: 'vous' };
export const EQUIPE_810 = { tuteur: TUTEUR, thomas: THOMAS };

// ─────────────────────────────────────────────────────────────── l’heure du scénario (mercredi 13 janvier, aucune année écrite)
const anJanvier = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() + 1 : d.getFullYear(); };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anJanvier(), 0, 13, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const inspectionFigee = (db) => !!(etatQuai(db) && etatQuai(db).securite && etatQuai(db).securite.fait);
export const deposeFinie = (db) => { const e = etatQuai(db), P = quaiDeBase(db).camions[0].palettes;
  return !!(e && e.depose && P.every((p) => e.depose[p.id] && e.depose[p.id].pose)); };
export const signe = (db) => !!(etatQuai(db) && etatQuai(db).signe);
export const compteRenduEnvoye = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });

// ─────────────────────────────────────────────────────────────── les documents (reconstitués ; pieds « Document pédagogique »)
const PIED_DESSIN = 'Dessin construit pour l’exercice.';
// La cale (dessin en traits, recopié d’ENT-8.7) : une roue de remorque, et contre le pneu, un coin posé au sol.
const SVG_CALE = `<svg class="d810" viewBox="0 0 280 170" role="img" aria-label="Une roue de remorque, et un objet en forme de coin posé au sol contre le pneu"
  fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
  <defs><pattern id="d810sol" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="currentColor" stroke-width="1"/></pattern></defs>
  <rect x="10" y="146" width="260" height="12" fill="url(#d810sol)" stroke="none"/><path d="M10 146 H270"/>
  <path d="M20 26 H260 V58 H20 Z"/><path d="M70 58 V64 M170 58 V64"/>
  <circle cx="120" cy="104" r="42"/><circle cx="120" cy="104" r="26"/><circle cx="120" cy="104" r="7"/>
  <path d="M163 146 L222 146 L163 104 Z"/><path d="M175 140 L203 140"/>
</svg>`;
// Le carton écrasé (dessin en traits, recopié d’ENT-8.8).
const T = 'fill="none" stroke="#2b2824" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const SVG_CARTON = `<svg class="d810" viewBox="0 0 320 230" role="img" aria-label="Dessin d’un carton dont le coin avant est enfoncé et plié">
  <g ${T}>
    <path d="M40 90 L100 50 L270 50 L232 76 L168 90 Z"/><path d="M160 50 L100 90" stroke-dasharray="6 5"/>
    <path d="M40 90 H168 L188 124 L210 132 V210 H40 Z"/>
    <path d="M210 132 L232 76 L270 50 V170 L210 210"/>
    <path d="M168 90 L188 124 L232 76 M188 124 L210 132"/>
    <path d="M182 100 L196 96 M186 108 L206 98 M192 116 L216 92" stroke-width="1.6"/>
  </g>
  <text x="20" y="24" font-size="13" fill="#2b2824">Un carton reçu sur une palette</text></svg>`;
const dessin = (id, titre, svg) => ({ id, titre, court: titre,
  html: `<article class="ac-doc" aria-label="${titre}"><p class="ac-t">${titre}</p>${svg}${PIED(PIED_DESSIN)}</article>` });

// Le protocole du quai 3 DU SITE de l’élève (gabarit `protocoleSecurite` de l’univers, spec par site dans les données).
export const DOC_PROTOCOLE = { id: 'protocole', titre: 'Protocole de sécurité — quai 3', court: 'Le protocole du quai 3',
  html: (db) => protocoleSecurite(specProtocole(siteEleve(db))) };
const DOC_PROTOCOLE_ENTETE = { id: 'protocole-entete', titre: 'Un protocole de sécurité', court: 'Un protocole',
  html: (db) => protocoleSecurite(specProtocole(siteEleve(db)), { entete: true }) };

// « Le droit » (à gauche d’« Avant de commencer », sans mot cliquable) — textes RECOPIÉS mot pour mot :
//   R4515-4, R4515-8 : de `DOC_DROIT_QUAI` (`contenus/action.js`, relus sur Légifrance le 17/10/2026 : LEGIARTI000018529684, LEGIARTI000018529676) ;
//   L133-3, 1er alinéa : d’ENT-8.8 (LEGIARTI000021486442, en vigueur depuis le 10/12/2009, relu le 17/10/2026) ;
//   L133-1 : relu sur Légifrance par Claude Code le 17/10/2026 (LEGIARTI000006220288, version en vigueur depuis le 21/09/2000).
export const TEXTE_R4515_4 = 'Les opérations de chargement ou de déchargement, font l’objet d’un document écrit, dit “protocole de sécurité”, remplaçant le plan de prévention.';
export const TEXTE_R4515_8 = 'Le protocole de sécurité est établi dans le cadre d’un échange entre les employeurs intéressés, préalablement à la réalisation de l’opération.';
export const TEXTE_L133_1 = ['Le voiturier est garant de la perte des objets à transporter, hors les cas de la force majeure.',
  'Il est garant des avaries autres que celles qui proviennent du vice propre de la chose ou de la force majeure.',
  'Toute clause contraire insérée dans toute lettre de voiture, tarif ou autre pièce quelconque, est nulle.'];
export const TEXTE_L133_3 = 'La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois '
  + 'jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire '
  + 'ou par lettre recommandée, sa protestation motivée.';
export const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-gros">LE DROIT</p>
    <p class="ac-st">Deux articles du Code du travail, deux du Code de commerce (le voiturier = le transporteur)</p>
    <p class="ac-art"><b>Code du travail, article R4515-4</b></p>
    <p class="ac-loi">« ${TEXTE_R4515_4} »</p>
    <p class="ac-art"><b>Code du travail, article R4515-8</b> (1er alinéa)</p>
    <p class="ac-loi">« ${TEXTE_R4515_8} »</p>
    <p class="ac-art"><b>Code de commerce, article L133-1</b></p>
    <div class="ac-loi">${TEXTE_L133_1.map((t, i) => `<p>${i ? '' : '« '}${t}${i === TEXTE_L133_1.length - 1 ? ' »' : ''}</p>`).join('')}</div>
    <p class="ac-art"><b>Code de commerce, article L133-3</b> (1er alinéa)</p>
    <p class="ac-loi">« ${TEXTE_L133_3} »</p>
    ${PIED(`Textes réels, recopiés de Légifrance (consulté le ${DROIT_CONSULTE}).`)}
  </article>` };
// « Ton stage » : le site, la date, l’équipe (aucune réponse d’un jalon).
const docStage = (db) => { const S = siteEleve(db), Q = equipeDe(S);
  return `<article class="ac-doc" aria-label="Ton stage">
    <p class="ac-t">Ton stage chez ${ech(S.prestataire)}</p>
    <p class="ac-st">Mercredi 13 janvier, 6 h 30</p>
    <p>Tu es en stage (PFMP) chez <b>${ech(S.prestataire)}</b>, à l’entrepôt Action <b>${ech(S.deSite)}</b>. Ce matin, tu reçois <b>seul</b> le camion de décoration, au <b>quai 3</b>.</p>
    <p>${ech(S.tuteur.mot.replace(/^t/, 'T'))} : <b>${ech(Q.tuteur)}</b>, ${ech(Q.chef)}, en réunion ce matin. <b>${ech(Q.cariste)}</b>, cariste, décharge le camion. Le chauffeur s’appelle <b>Thomas</b>.</p>
    ${PIED(`${ech(Q.tuteur)}, ${ech(Q.cariste)} et Thomas sont construits pour l’exercice.`)}
  </article>`; };

export const STYLE = `${ACTION.STYLE_DOCUMENTS}${STYLE_PROTOCOLE}
.ac-gros{margin:0 0 4px; font-size:1.4rem; font-weight:900; letter-spacing:.04em}
.pr-2{grid-template-columns:minmax(0, 150px) 1fr}
.d810{display:block; width:100%; max-width:380px; height:auto; margin:6px auto 8px; color:#2b2824}
.d810 text{font-family:inherit}
`;
export const DOCUMENTS = [DOC_PROTOCOLE, DOC_DROIT, DOC_PROTOCOLE_ENTETE, { id: 'stage', titre: 'Ton stage', court: 'Ton stage', html: docStage },
  dessin('dessin-cale', 'Devant la roue', SVG_CALE), dessin('carton-ecrase', 'Un carton', SVG_CARTON)];

// ─────────────────────────────────────────────────────────────── ① la fiche « Le protocole du quai 3 » (3 situations tirées)
// Les textes fixes du moteur (sous-titre, bouton d’envoi) ne connaissent pas le site : ils disent « ton tuteur ».
const ligneSituation = (db, s) => { const S = siteEleve(db), t = texteSituation(s, S);
  return { type: 'choix', id: s.id, lib: `${t} Que dit le protocole ?`, colonne: true,
    choix: melangerPour(db, s.id, choixDe(s, S)), manque: `ce que dit le protocole (« ${t.replace(/\.$/, '')} »)` }; };
export const FICHE = {
  id: FICHE_ID, libelle: 'Le protocole du quai 3', titre: 'Le protocole du quai 3',
  sousTitre: 'Lis le protocole de sécurité du quai 3, puis dis ce qu’il faut faire dans chaque cas.',
  documents: ['protocole'], largeurDocs: 1.75, serree: true, defile: true,
  bouton: 'Ouvrir la fiche « Le protocole du quai 3 »',
  blocs: (db) => situationsDe(db).map((s) => ligneSituation(db, s)),
  envoi: { bouton: 'Envoyer la fiche à ton tuteur', a: 'ton tuteur', suite: 'Merci, c’est noté.', incomplet: true },
};

// ─────────────────────────────────────────────────────────────── ② « Au quai » : accueillir le chauffeur (face à face, évaluation)
export const SITUATION_ACCUEIL = 'Le camion de décoration arrive au quai 3 (planigramme : quai 3, 7 h). Accueille le chauffeur et installe-le comme le dit le protocole.';
export const TELEPHONE = {
  face: true,
  libelle: 'Au quai',
  situation: SITUATION_ACCUEIL,
  dialogues: [{ id: DIALOGUE, de: 'thomas', contact: { nom: 'Thomas', detail: 'chauffeur, camion de décoration' }, repliques: REPLIQUES, fin: FIN_DIALOGUE }],
};

// ─────────────────────────────────────────────────────────────── ④ rendre compte (phrases ; seule « ma réception » est notée)
export const phrasesCompteRendu = (prenom, db) => { const Q = equipeDe(siteEleve(db));
  return { id: PHRASES_ID, melanger: true, lignes: [
    { id: 'salutation', choix: [`Bonjour ${Q.tuteur},`, `Salut ${Q.tuteur},`, 'Madame, Monsieur le directeur,'], juste: 0 },
    { id: 'reception', choix: (d) => ligneReception(d).choix, juste: (d) => ligneReception(d).juste },
    { id: 'fin', choix: [`Je reste au quai. ${prenom}`, 'Cordialement', 'À plus.'], juste: 0 },
  ] }; };

// ─────────────────────────────────────────────────────────────── les messages du tuteur (au tu ; date du scénario ; jamais juste ni faux)
const mail = (prenom, db, subject, text, o = {}) => { const Q = equipeDe(siteEleve(db));
  return { folder: 'in', ts: tsScenario(o.heure || '06:30', { db, decalage: o.decalage || 0 }),
    from: Q.tuteur, fromMail: Q.mailTuteur, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) }; };
const signeDe = (db) => equipeDe(siteEleve(db)).tuteur;
const reponduAuTuteur = (db) => ((db && db.mails) || []).some((m) => m.folder === 'out' && m.phrases && m.phrases.id === PHRASES_ID);
export const SUJETS = { accueil: 'Ce matin, tu reçois le camion de décoration', chauffeur: 'Le camion est là', quai: 'Le quai 3', compte: 'Fais-moi le point', fin: 'Merci' };

export const VOLET = {
  id: ID_VOLET,
  // L’accueil : texte du brief (§4), puis une phrase CONSTRUITE pour l’étape ①.
  semer: (prenom, db) => { const Q = equipeDe(siteEleve(db));
    return { mails: [mail(prenom, db, SUJETS.accueil,
      `Bonjour ${prenom}. Ce matin, tu reçois seul le camion de décoration, quai 3, 7 h. ${Q.cariste} décharge, tu diriges et tu contrôles. `
        + `Je suis en réunion : tu me rends compte par message.\n\nD’abord, lis le protocole de sécurité du quai 3 et dis-moi ce qu’il faut faire dans chaque cas.\n\n${Q.tuteur}`,
      { extra: { ouvreFiche: FICHE_ID } })] }; },
  declencheurs: [
    { id: 'chauffeur', quand: apresFiche(FICHE_ID), semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.chauffeur,
      `Merci, c’est noté. Le camion de décoration arrive au quai 3. Va accueillir le chauffeur : menu « Au quai ».\n\n${signeDe(db)}`, { heure: '06:55' })] }) },
    { id: 'quai', quand: dialogueFini(DIALOGUE), semer: (prenom, db) => { const Q = equipeDe(siteEleve(db));
      return { mails: [mail(prenom, db, SUJETS.quai,
        `${Q.cariste} est prêt. Ouvre « Le quai 3 » : regarde le quai et le camion avant qu’il entre, dis-lui où poser chaque palette, puis contrôle `
          + `les palettes, écris tes réserves s’il le faut et fais signer le chauffeur.\n\n${Q.tuteur}`, { heure: '07:02' })] }; } },
    // Le document signé (Thomas peut repartir) : le compte rendu ; les phrases sont calculées ICI, sur ce que l’élève a décidé, et figées.
    { id: 'compte-rendu', quand: signe, semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.compte,
      'Fais-moi le point sur le camion de décoration.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\n' + signeDe(db),
      { heure: '07:40', extra: { phrases: phrasesCompteRendu(prenom, db) } })] }) },
    // La fin : texte du brief (§4), neutre, et la remise.
    { id: 'fin', quand: reponduAuTuteur, semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.fin,
      `Merci ${prenom}.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\n${signeDe(db)}`, { heure: '07:50' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de l’ouverture = 20 ; poids du brief §5)
// Protocole 3 (1 par situation) · Accueillir le chauffeur 3 (0,5 · 0,75 · 0,5 · 0,75 · 0,5) · Avant de décharger 2,5 (danger 2, aucun faux 0,5) ·
// Faire décharger 1 (0,25 × 4, premier clic) · Contrôler les palettes 3,5 (la palette à problème 2, le piège 0,75, les deux conformes 0,375 chacune :
// « 2 sans problème 0,75 chacune » du brief, où les deux conformes font une part) · Réserves et signature 2 (réserve 1, pas de déballage 0,5,
// signature 0,5) · Rendre compte 1 (« ma réception », jugée sur SES décisions). Rien n’est vrai avant la fin de son étape : l’inaction vaut 0.
export const GROUPES = { protocole: 'Le protocole', accueil: 'Accueillir le chauffeur', avant: 'Avant de décharger', decharger: 'Faire décharger',
  palettes: 'Contrôler les palettes', reserves: 'Réserves et signature', compte: 'Rendre compte' };
export const POIDS = {
  'situation-facile': 1, 'situation-moyen': 1, 'situation-difficile': 1,
  'accueil-salutation': 0.5, 'accueil-documents': 0.75, 'accueil-quai': 0.5, 'accueil-attente': 0.75, 'accueil-fin': 0.5,
  'securite-danger': 2, 'securite-aucun-faux': 0.5,
  'depose-P1': 0.25, 'depose-P2': 0.25, 'depose-P3': 0.25, 'depose-P4': 0.25,
  'palette-probleme': 2, 'palette-piege': 0.75, 'palette-conforme-1': 0.375, 'palette-conforme-2': 0.375,
  reserve: 1, deballage: 0.5, signature: 0.5,
  'cr-reception': 1,
};
const ECRAN_FICHE = `fiche:${FICHE_ID}`;
const juge = (db, id, juste) => (!envoyee(db, FICHE_ID) ? attente : valeurDe(db, FICHE_ID, id) === juste ? ok : ko());
const jalonAccueil = (id, replique, titre) => jalonDialogue({ seance: ID, dialogue: DIALOGUE, id, titre, groupe: GROUPES.accueil, poids: POIDS[id],
  juge: (appel) => premiereReponse(appel, replique) === JUSTES_DIALOGUE[replique] });
// Le quai : la ligne de la vue (`jalonsQuai` sur le quai DE L’ÉLÈVE), jugée seulement quand son étape est finie.
const ligneQuai = (db, id) => jalonsQuai(db, quaiDeBase(db)).L.find((l) => l.id === id) || null;
const jalonQuai = (id, titre, groupe, fini, ligne) => ({ id, titre, groupe, poids: POIDS[id],
  verifier(db) { if (!fini(db)) return attente; const l = ligne(db); if (!l) throw new Error(`ligne du quai « ${id} » absente`); return l.ok ? ok : ko(); } });
export const pointDanger = (db) => quaiDeBase(db).securite.points.find((p) => !p.ok);
const idDuRole = (db, role) => duRole(jeuDeBase(db), role).id;
const jalonPalette = (role, titre) => ({ id: `palette-${role}`, titre, groupe: GROUPES.palettes, poids: POIDS[`palette-${role}`],
  titreBilan: (db) => `${titre} (palette ${idDuRole(db, role)})`,
  verifier(db) {
    if (!signe(db)) return attente;
    const pid = idDuRole(db, role), c = ligneQuai(db, `${pid}-comptage`) || {}, d = ligneQuai(db, `${pid}-decision`) || {};
    return c.ok && d.ok ? ok : ko(`comptage : ${c.fait} — décision : ${d.fait}`);
  } });

export const ETAPES = [
  ...['facile', 'moyen', 'difficile'].map((d) => ({ id: `situation-${d}`, titre: 'Le protocole : une situation', groupe: GROUPES.protocole,
    poids: POIDS[`situation-${d}`], ecran: ECRAN_FICHE,
    titreBilan: (db) => { const s = situationsDe(db).find((x) => x.difficulte === d); return s ? `Le protocole : ${texteSituation(s, siteEleve(db)).replace(/\.$/, '')}` : null; },
    verifier(db) { const s = situationsDe(db).find((x) => x.difficulte === d); if (!s) throw new Error(`situation ${d} absente du tirage`); return juge(db, s.id, s.juste); } })),
  jalonAccueil('accueil-salutation', 'arrivee', 'Accueillir le chauffeur : saluer et se présenter'),
  jalonAccueil('accueil-documents', 'documents', 'Accueillir le chauffeur : les documents demandés'),
  jalonAccueil('accueil-quai', 'quai', 'Accueillir le chauffeur : où il se met'),
  jalonAccueil('accueil-attente', 'attente', 'Accueillir le chauffeur : ce qu’il fait pendant le déchargement'),
  jalonAccueil('accueil-fin', 'fin', 'Accueillir le chauffeur : finir poliment'),
  jalonQuai('securite-danger', 'Avant de décharger : le danger signalé avant de décharger', GROUPES.avant, inspectionFigee,
    (db) => ligneQuai(db, `securite-${pointDanger(db).id}`)),
  jalonQuai('securite-aucun-faux', 'Avant de décharger : aucun faux signalement', GROUPES.avant, inspectionFigee, (db) => ligneQuai(db, 'securite-aucun-faux')),
  ...['P1', 'P2', 'P3', 'P4'].map((p) => jalonQuai(`depose-${p}`, `Faire décharger : la palette ${p}`, GROUPES.decharger, deposeFinie,
    (db) => ligneQuai(db, `depose-${p}`))),
  jalonPalette('probleme', 'Contrôler les palettes : la palette à problème'),
  jalonPalette('piege', 'Contrôler les palettes : une palette sans problème'),
  jalonPalette('conforme-1', 'Contrôler les palettes : une palette sans problème'),
  jalonPalette('conforme-2', 'Contrôler les palettes : une palette sans problème'),
  { id: 'reserve', titre: 'Réserves : la réserve écrite (palette, quoi, combien)', groupe: GROUPES.reserves, poids: POIDS.reserve,
    verifier(db) { if (!signe(db)) return attente; const l = ligneQuai(db, `${idDuRole(db, 'probleme')}-reserve`) || {}; return l.ok ? ok : ko(`écrit : ${l.fait}`); } },
  { id: 'deballage', titre: 'Réserves : pas de mention « sous réserve de déballage »', groupe: GROUPES.reserves, poids: POIDS.deballage,
    verifier(db) { if (!signe(db)) return attente; return (ligneQuai(db, 'deballage') || {}).ok ? ok : ko(); } },
  { id: 'signature', titre: 'Réserves : le document signé par le chauffeur', groupe: GROUPES.reserves, poids: POIDS.signature,
    verifier(db) { return signe(db) ? ok : attente; } },
  { id: 'cr-reception', titre: 'Rendre compte : ma réception', groupe: GROUPES.compte, poids: POIDS['cr-reception'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return r.justes.includes('reception') ? ok : ko(); } },
];

// ─────────────────────────────────────────────────────────────── pastilles, ordre des écrans, accueil, options
export const PASTILLES = [
  { libelle: 'Le protocole', fait: (db) => envoyee(db, FICHE_ID) },
  { libelle: 'Au quai', fait: (db, seance) => dialogueFini(DIALOGUE)(db, seance || ID) },
  { libelle: 'Le quai 3', fait: signe },
  { libelle: 'Rendre compte', fait: compteRenduEnvoye },
];
// L’ordre des écrans de travail (menu « Mon poste » ; le moteur ne montre pas la barre « Étape suivante » en évaluation).
export const SUITE = [
  { vue: 'fiche', libelle: 'Le protocole du quai 3', fait: (db) => envoyee(db, FICHE_ID) },
  { vue: 'telephone', libelle: 'Au quai : accueillir le chauffeur', fait: dialogueFini(DIALOGUE) },
  { vue: 'quai', libelle: 'Le quai 3', fait: signe },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte', fait: compteRenduEnvoye },
];
export const MENTION = 'Réels : Action ; GXO, qui fait tourner l’entrepôt Action d’Onnaing ; Kuehne+Nagel, qui fait tourner celui de '
  + 'Belleville-en-Beaujolais ; le Code du travail et le Code de commerce. Construit : le protocole du quai 3 (d’après le Code du travail ; '
  + 'consignes et valeurs inventées), ton tuteur ou ta tutrice et tes collègues, le chauffeur Thomas, le fournisseur et le transporteur, '
  + 'le camion et ses palettes, leurs défauts, le bon de livraison et la lettre de voiture, le quai (un dessin) et ses cases de dépose.';
export const ACCUEIL = {
  titre: 'Évaluation : recevoir un camion dans un nouveau site',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de ton tuteur', 'Menu Messagerie.'],
    ['① Le protocole du quai 3', 'Lis le protocole, puis dis ce qu’il faut faire dans chaque cas.'],
    ['② Au quai', 'Va accueillir le chauffeur du camion de décoration.'],
    ['③ Le quai 3', 'Regarde le quai et le camion avant de décharger, dis au cariste où poser chaque palette, contrôle les palettes, écris tes réserves et fais signer le chauffeur.'],
    ['④ Rendre compte', 'Réponds à ton tuteur, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION],
  ],
};
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Évaluation : recevoir un camion dans un nouveau site',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE_810,
  questions: QUESTIONS,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  telephone: TELEPHONE,
  quai: quaiDe,
  pastilles: PASTILLES,
  fermetures: {
    telephone: { ouvertSi: (db) => envoyee(db, FICHE_ID), message: 'Après la fiche « Le protocole du quai 3 »' },
    quai: { ouvertSi: (db, seance) => dialogueFini(DIALOGUE)(db, seance), message: 'Après l’accueil du chauffeur' },
  },
};
