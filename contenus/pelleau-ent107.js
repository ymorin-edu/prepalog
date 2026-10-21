// ENT-10.7 — Transports Pelleau, « la feuille de ramasse se trompe » : le contenu de la séance (brief `docs/briefs/ENT-10.7-pelleau-feuille-de-ramasse.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant le brief). Univers commun : `contenus/pelleau.js`
// (À LIRE). Données pures (jeu tiré, camion, annonces, quai, dialogue, ce qui s'en calcule) : `contenus/pelleau-ent107-donnees.js`. Activité :
// `activites/pelleau-feuille-de-ramasse.js`. Questions : `contenus/questions/ENT-10.7.js`. Corrigé : `contenus/corriges/ENT-10.7.js`.
//
// 18 mai 2026, 7 h → 8 h (aucun jour de la semaine écrit). CAP OL, ENTRAÎNEMENT de CAP-C1.3 avec ERREUR INDUITE : la feuille de ramasse de Loïc, écrite
// trop vite, met UNE palette chez le mauvais client (laquelle, et dans quel sens, est TIRÉ par la graine de l'élève). UN ÉCRAN PAR ÉTAPE :
//   ① Préparer la réception (fiche ; feuille de ramasse, annonces et règles du quai à gauche : la feuille ne colle pas aux annonces, la fiche ne
//      demande que le total et le nombre de clients) ;
//   ② Au quai : accueillir Loïc, qui presse de suivre la feuille (vue Dialogue à choix, face à face, collègue : tu) ;
//   ③ Le quai A (quai iso : inspection sur la scène, un défaut tiré ; Yann décharge au chariot frontal, l'élève choisit la case de chaque palette
//      dans la zone de SON client, lue sur l'étiquette) ;
//   ④ Rapprocher (fiche : reçues et résultat par client contre les annonces, puis « La feuille de ramasse est-elle juste ? ») ;
//   ⑤ Faire corriger la feuille (fiche d'une ligne : qui la corrige ?) ;
//   ⑥ Rendre compte à Maëlys (phrases à choisir, dont l'erreur).
// Rien n'est jugé à l'écran (sauf les réactions de Loïc et de Yann, qui ne disent ni juste ni faux) ; le bilan détaillé dit juste / à corriger.
// « Corriger » rouvre « Préparer », « Rapprocher », « Faire corriger » et les phrases ; ni le dialogue ni le quai (`finFige`).
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/pelleau.js` (univers) et de `contenus/pelleau-ent107-donnees.js`. Les documents de la séance
// (feuille de ramasse FAUSSE, annonces, règles du quai, « Ta matinée », étiquette) sont CONSTRUITS et portent le pied imposé (`PIED`).

import { apresFiche, apresMail, dialogueFini, quaiDecharge } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { graineDeBase, niveauEleve } from '../core/tirage.js';
import { QUESTIONS } from './questions/ENT-10.7.js';
import { EQUIPE, LEXIQUE, MENTION, LOGO, DOC_DROIT_DEPOT, STYLE_DOCUMENTS, PIED, mailDe, heureScenario, ech, pied, entete } from './pelleau.js';
import {
  ID, ID_VOLET, QUAI_ID, DIALOGUE, FICHES, PHRASES_ID, JOUR, BL, CLIENTS_107, NOM_DIT, nomClient, IDS_PALETTES, jeuDe, quaiDe, quaiDeBase, REPLIQUES, JUSTES_DIALOGUE,
  FIN_DIALOGUE, LIGNES_PREPARER, nombres, RESULTATS, clientDe, champRecues, champResultat, CHAMP_FEUILLE, CORRIGER, reellesDe, notees, colisNotes, resultat,
  annonce, colisAnnonces, uniteDe, typeDe, choixFeuille, justeFeuille, choixErreur, ligneRecu, SALUTATIONS, fins, SECURITE_CONSIGNE, pal,
} from './pelleau-ent107-donnees.js';

export { ID, ID_VOLET, QUAI_ID, DIALOGUE, FICHES, PHRASES_ID } from './pelleau-ent107-donnees.js';

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche « déjà envoyée une fois » : vraie aussi pendant une correction (« Corriger » retire `envoye`, le geste reste rangé).
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
// Le jeu de CET élève (sa graine : l'identifiant de l'élève, posée par le moteur à l'ouverture) et son quai. Sans graine (enseignant, base vide) : un jeu fixe.
export const jeuEleve = (db) => jeuDe(graineDeBase(db));
export const quaiEleve = (db) => quaiDeBase(db);
const confirme = (db) => niveauEleve(db) === 'confirme';

// ─────────────────────────────────────────────────────────────── les documents (construits ; pied imposé)
const DATE_DOC = `${JOUR} mai`;
// LA FEUILLE DE RAMASSE (FAUSSE, fonction de la base : elle suit le jeu de l'élève). Une ligne par expéditeur, avec les numéros des palettes que Loïc
// y a notées : jamais le contenu réel de la palette mal notée (le nombre de colis suit le nombre de palettes notées), jamais d'observation, jamais de total.
export const DOC_FEUILLE = { id: 'feuille-ramasse-107', titre: 'Feuille de ramasse de Loïc', court: 'La feuille de ramasse',
  html: (db) => { const jeu = jeuEleve(db); return `<article class="pe-doc" aria-label="Feuille de ramasse de Loïc">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    ${entete('Feuille de ramasse', [`N° ${BL}`,DATE_DOC, 'Conducteur : Loïc', 'Porteur Pelleau'])}
    <table class="pe-tab"><thead><tr><th>Expéditeur</th><th>Palettes</th><th>Numéros</th><th>Colis</th><th>Signature du client</th></tr></thead>
    <tbody>${CLIENTS_107.map((c) => `<tr><td>${ech(nomClient(c))}</td><td class="pe-nb">${notees(jeu, c).length}</td><td>${notees(jeu, c).join(', ')}</td>
      <td>${colisNotes(jeu, c)} ${ech(uniteDe(c, colisNotes(jeu, c)))}</td><td>signé</td></tr>`).join('')}</tbody></table>
    <p class="pe-st">Le client signe quand Loïc charge ses palettes.</p>
    ${pied()}
  </article>`; } };
const docAnnonce = (c) => ({ id: `annonce-${c}-107`, titre: `Annonce de ${nomClient(c)}`, court: `L’annonce ${NOM_DIT[c]}`,
  html: `<article class="pe-doc" aria-label="Annonce de ${ech(nomClient(c))}">
    <p class="pe-t">Courriel reçu par l’entrepôt</p>
    <p class="pe-mail"><b>De :</b> ${ech(nomClient(c))} — service expéditions<br><b>À :</b> Transports Pelleau, entrepôt de Gouesnou<br>
      <b>Objet :</b> Palettes confiées le ${DATE_DOC}</p>
    <p>Bonjour,</p>
    <p>Nous vous confions ce jour <b>${pal(annonce(c))}</b> de ${ech(typeDe(c).designation.charAt(0).toLowerCase() + typeDe(c).designation.slice(1))}
      (${colisAnnonces(c)} ${ech(uniteDe(c, colisAnnonces(c)))}), à garder dans votre entrepôt. Votre conducteur passe les prendre ce matin.</p>
    <p>Cordialement,<br>Le service expéditions, ${ech(nomClient(c))}</p>
    ${pied()}
  </article>` });
export const DOCS_ANNONCES = CLIENTS_107.map(docAnnonce);
export const DOC_REGLES = { id: 'regles-quai-107', titre: 'Les règles du quai', court: 'Les règles du quai',
  html: `<article class="pe-doc" aria-label="Les règles du quai">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Les règles du quai</p>
    <p class="pe-st">Entrepôt de Gouesnou — écrites par Erwan, responsable de l’entrepôt</p>
    <ul class="pe-ul">
      <li>Le conducteur recule jusqu’aux butoirs, <b>coupe le moteur</b> et <b>pose la cale</b>.</li>
      <li>Pendant le déchargement, le conducteur <b>attend au local</b>. Il ne décharge pas.</li>
      <li>Avant d’entrer dans le camion : [[niveleur]] posé, <b>lampe de quai allumée</b>.</li>
      <li>Le chariot élévateur : Yann seulement.</li>
      <li>Chaque palette va dans la zone de <b>son client</b> : lis l’[[étiquette de palette|étiquette]] avant de poser.</li>
      <li>Pas de [[gerber|gerbage]] en zone de réception.</li>
    </ul>
    <p class="pe-st" style="margin-top:8px">Règles construites pour l’exercice, d’après les règles courantes d’un protocole de sécurité.</p>
    ${pied()}
  </article>` };
// « Ta matinée » (écran « Avant de commencer ») : la situation, sans rien de ce qu'on demande.
export const DOC_MATINEE = { id: 'matinee-107', titre: 'Ta matinée', court: 'Ta matinée',
  html: `<article class="pe-doc" aria-label="Ta matinée">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Ta matinée</p>
    <p class="pe-st">${DATE_DOC}, 7 h — entrepôt de Gouesnou, quai A</p>
    <p>Loïc, conducteur Pelleau, rentre de sa tournée de [[ramasse]]. Dans son camion : les palettes de <b>plusieurs clients</b>, qui les confient
      à Pelleau pour les garder.</p>
    <p><b>Yann</b> décharge au chariot élévateur. <b>Toi</b>, tu lui dis où poser chaque palette.</p>
    <p><b>Maëlys</b>, au bureau transport, attend ton compte rendu. <b>Erwan</b> est ton tuteur.</p>
    ${pied('Document pédagogique — reconstitution, non contractuel. Les clients cités sont des entreprises fictives. Loïc, Yann, Maëlys et Erwan sont imaginés pour l’exercice.')}
  </article>` };
// Une étiquette de palette (dessinée en texte) : ce qu'on y lit.
export const DOC_ETIQUETTE = { id: 'etiquette-107', titre: 'Une étiquette de palette', court: 'Une étiquette',
  html: `<article class="pe-doc" aria-label="Une étiquette de palette">
    <p class="pe-t">Une étiquette de palette</p>
    <div class="pe-etiq">
      <p><span>EXPÉDITEUR</span><b>${ech(nomClient('ar-vag'))}</b></p>
      <p><span>DESTINATAIRE</span><b>Transports Pelleau — entrepôt de Gouesnou</b></p>
      <p><span>CONTENU</span><b>${ech(typeDe('ar-vag').designation.toUpperCase())} — ${ech(typeDe('ar-vag').ref)}</b></p>
      <p><span>COLIS</span><b>${typeDe('ar-vag').colis} ${ech(uniteDe('ar-vag', 2))}</b></p>
    </div>
    ${pied()}
  </article>` };
export const STYLE = `${STYLE_DOCUMENTS}
.pe-tab{width:100%; border-collapse:collapse; margin:4px 0 8px; font-size:.9rem}
.pe-tab th,.pe-tab td{border:1px solid #cfc8ba; padding:5px 7px; text-align:left; vertical-align:top}
.pe-tab th{font-size:.82rem}
.pe-nb{text-align:center}
.pe-mail{font-size:.88rem; color:var(--douce); border-bottom:1px solid #e3ded3; padding-bottom:6px}
.pe-etiq{border:2px solid var(--encre); border-radius:4px; padding:8px 12px; margin:6px 0 10px; font-family:inherit}
.pe-etiq p{display:flex; gap:10px; margin:0 0 6px; align-items:baseline}
.pe-etiq span{flex:0 0 7.5em; font-size:.74rem; letter-spacing:.04em; color:var(--douce)}
`;
export const DOCUMENTS = [DOC_FEUILLE, ...DOCS_ANNONCES, DOC_REGLES, DOC_DROIT_DEPOT, DOC_MATINEE, DOC_ETIQUETTE];
const IDS_ANNONCES = DOCS_ANNONCES.map((d) => d.id);
// Les pièces jointes du premier message : le confirmé n'a pas les « Règles du quai » (aide éteinte, brief §6 bis).
const piecesDepart = (db) => [DOC_FEUILLE.id, ...IDS_ANNONCES, ...(confirme(db) ? [] : [DOC_REGLES.id])];

// ─────────────────────────────────────────────────────────────── ① la fiche « Préparer la réception »
const ligneListe = (l) => ({ type: 'liste', id: l.id, lib: l.lib, vide: 'Choisir…', manque: l.manque, choix: nombres(l.max) });
export const FICHE_PREPARER = {
  id: FICHES.preparer, libelle: 'Préparer la réception', titre: 'Préparer la réception',
  sousTitre: 'Lis la feuille de ramasse et les annonces, à gauche.',
  documents: (db) => piecesDepart(db),
  bouton: 'Ouvrir la fiche « Préparer la réception »',
  blocs: LIGNES_PREPARER.map(ligneListe),
  envoi: { bouton: 'Envoyer la fiche à Maëlys', a: 'Maëlys', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ② « Au quai » : accueillir Loïc (face à face, collègue : tu)
export const ERWAN_ACCUEIL = 'Loïc recule au quai A. Va l’accueillir.';
export const TELEPHONE = {
  face: true,
  libelle: 'Au quai',
  situation: `Erwan : « ${ERWAN_ACCUEIL} »`,
  dialogues: [{ id: DIALOGUE, de: 'loic', contact: { nom: 'Loïc', detail: 'conducteur, retour de ramasse' }, repliques: REPLIQUES, fin: FIN_DIALOGUE }],
};

// ─────────────────────────────────────────────────────────────── ④ la fiche « Rapprocher » (un cadre par client, puis la feuille de Loïc)
// LE RAPPEL DES ÉTIQUETTES (décision de Tristan, 21/10/2026) : pour chaque palette, l'expéditeur lu sur son étiquette au quai, tel que la légende de pause
// le montrait (« P1 — étiquette : Biscuiterie Ar Vag »). Le moteur ne range pas les étiquettes lues : on reprend celles des palettes RÉELLEMENT POSÉES par
// l'élève (`db.quais[QUAI_ID].depose[id].pose`, posée sur la bonne case) ; une palette pas encore posée dit « pas encore vue ». Ce que l'élève a vu, jamais
// la réponse : pas un mot de la feuille, aucune comparaison, aucune mise en évidence. Standard et accompagné seulement : le confirmé n'a pas ce rappel.
export const posee = (db, id) => !!(etatQuai(db) && etatQuai(db).depose && etatQuai(db).depose[id] && etatQuai(db).depose[id].pose);
export const lignesEtiquettes = (db) => { const jeu = jeuEleve(db);
  return IDS_PALETTES.map((id) => (posee(db, id) ? `${id} — étiquette : ${nomClient(clientDe(jeu, id))}` : `${id} — pas encore vue`)); };
export const FICHE_RAPPROCHER = {
  id: FICHES.rapprocher, libelle: 'Rapprocher', titre: 'Rapprocher des annonces',
  sousTitre: 'Pour chaque client : ce qui est arrivé, puis ce que ça donne par rapport à son annonce. Enfin, regarde la feuille de ramasse.',
  documents: [DOC_FEUILLE.id, ...IDS_ANNONCES, DOC_DROIT_DEPOT.id],
  bouton: 'Ouvrir la fiche « Rapprocher »',
  quand: (db) => quaiDecharge(QUAI_ID)(db),
  grille: true,
  // Fonction de la base : l'ordre des trois choix de « La feuille est-elle juste ? » est celui de l'élève (le juste n'est pas toujours au même rang).
  blocs: (db) => [
    ...CLIENTS_107.map((c) => ({ type: 'cadre', titre: nomClient(c), blocs: [
      { type: 'liste', id: champRecues(c), lib: 'Palettes reçues', vide: 'Choisir…', manque: `les palettes reçues de ${NOM_DIT[c]}`, choix: nombres(5) },
      { type: 'liste', id: champResultat(c), lib: 'Résultat', vide: 'Choisir…', manque: `le résultat pour ${NOM_DIT[c]}`, choix: RESULTATS },
    ] })),
    ...(confirme(db) ? [] : [{ type: 'cadre', titre: 'Ce que tu as lu sur les étiquettes, au quai', large: true, blocs: [
      { type: 'encadre', texte: lignesEtiquettes(db).join('\n') },
    ] }]),
    { type: 'cadre', titre: 'La feuille de ramasse de Loïc', large: true, blocs: [
      { type: 'liste', id: CHAMP_FEUILLE, lib: 'La feuille de ramasse est-elle juste ?', vide: 'Choisir…', manque: 'ta réponse sur la feuille de ramasse', choix: choixFeuille(jeuEleve(db)) },
    ] },
  ],
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ⑤ la feuille corrigée (fiche d'une ligne)
export const FICHE_CORRIGER = {
  id: FICHES.corriger, libelle: 'La feuille de ramasse', titre: 'La feuille de ramasse',
  sousTitre: 'Une dernière question sur la feuille de ramasse de Loïc, signée par les clients.',
  documents: [DOC_FEUILLE.id],
  bouton: 'Ouvrir la fiche « La feuille de ramasse »',
  quand: apresFiche(FICHES.rapprocher),
  blocs: [{ type: 'liste', id: CORRIGER.id, lib: CORRIGER.lib, vide: 'Choisir…', manque: 'ta réponse', choix: CORRIGER.choix }],
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ⑥ rendre compte à Maëlys (phrases à choisir)
export const phrasesCompteRendu = (prenom, db) => { const jeu = jeuEleve(db); return { id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS, juste: 0 },
  { id: 'recu', texte: ligneRecu(jeu) },
  { id: 'erreur', choix: choixErreur(jeu).map((x) => x.texte), juste: 0 },
  { id: 'fin', choix: fins(prenom), juste: 0 },
] }; };
// Ce que l'élève a choisi à la ligne « erreur » de son DERNIER envoi (rang dans l'ordre déclaré), ou null.
export function erreurChoisie(db) {
  const L = ((db && db.mails) || []).filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === PHRASES_ID).sort((a, b) => (a.ts - b.ts) || (a.id - b.id));
  const d = L[L.length - 1];
  const c = d && d.phrases.choix ? d.phrases.choix.erreur : undefined;
  return Number.isInteger(c) ? c : null;
}
// La réponse de Maëlys : elle reprend ce que l'élève lui a écrit, sans corriger (règle de Tristan du 10/10/2026).
export const reponseMaelys = (db) => { const c = erreurChoisie(db); const E = choixErreur(jeuEleve(db)); return c === null || !E[c] ? 'Merci, je note.' : E[c].reponse; };

// ─────────────────────────────────────────────────────────────── les messages (au tu ; 18 mai 2026, jamais le jour de la semaine)
const MAELYS = { nom: EQUIPE.maelys.nom, mail: mailDe('maelys') };
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR, o.heure || '07:00', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (de, texte) => (prenom, n, db) => ({ mails: [mail(prenom, de, 'Bien reçu', `${texte}\n\n${de.nom}`, { db, heure: '07:58', decalage: n })] });
const merciMaelys = (prenom, db, heure = '08:00') => mail(prenom, MAELYS, 'RE : Alors, la ramasse ?', `${reponseMaelys(db)}\n\nMaëlys`, { db, heure });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, MAELYS, 'La ramasse de Loïc',
      `Salut ${prenom}, Loïc rentre de sa [[ramasse]] vers 7 h 30, quai A. Voici sa [[feuille de ramasse]] et les [[annonce|annonces]] des clients. `
        + `Prépare la réception.${confirme(db) ? '' : '\n\nJe te joins aussi les règles du quai.'}\n\nMaëlys`,
      { db, extra: { pieces: piecesDepart(db), ouvreFiche: FICHES.preparer } }),
  ] }),
  // « Corriger » : un accusé à chaque renvoi, jamais « juste » ; les phrases renvoyées : Maëlys reprend ce que l'élève a écrit.
  corrections: {
    [FICHES.preparer]: accuse(MAELYS, 'Bien reçu, merci.'),
    [FICHES.rapprocher]: accuse(ERWAN, 'Merci, j’ai ta nouvelle fiche.'),
    [FICHES.corriger]: accuse(ERWAN, 'Merci, j’ai ta nouvelle réponse.'),
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [merciMaelys(prenom, db, '08:02')] }),
  },
  declencheurs: [
    { id: 'accueil', quand: apresFiche(FICHES.preparer),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Loïc arrive', `${ERWAN_ACCUEIL} Menu « Au quai ».\n\nErwan`, { db, heure: '07:25' })] }) },
    { id: 'quai', quand: dialogueFini(DIALOGUE),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Yann est prêt',
        'Yann est prêt à décharger. Avant qu’il entre dans le camion, regarde le quai (menu « Le quai A »).\n\nErwan', { db, heure: '07:32' })] }) },
    { id: 'rapprocher', quand: quaiDecharge(QUAI_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Les palettes sont triées',
        'Les palettes sont triées. Pour chaque client, compare ce qui est arrivé avec ce qu’il a annoncé. Regarde aussi la feuille de ramasse de Loïc.\n\nErwan',
        { db, heure: '07:48', extra: { pieces: [DOC_FEUILLE.id, ...IDS_ANNONCES, DOC_DROIT_DEPOT.id], ouvreFiche: FICHES.rapprocher } })] }) },
    { id: 'corriger', quand: apresFiche(FICHES.rapprocher),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'La feuille de ramasse',
        'Dernière question sur la feuille de ramasse de Loïc : à toi de répondre.\n\nErwan',
        { db, heure: '07:52', extra: { pieces: [DOC_FEUILLE.id], ouvreFiche: FICHES.corriger } })] }) },
    { id: 'compte-rendu', quand: apresFiche(FICHES.corriger),
      semer: (prenom, db) => ({ mails: [mail(prenom, MAELYS, 'Alors, la ramasse ?',
        'Alors, la ramasse ?\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nMaëlys',
        { db, heure: '07:55', extra: { phrases: phrasesCompteRendu(prenom, db) } })] }) },
    { id: 'fin', quand: apresMail({ a: MAELYS.mail }), semer: (prenom, db) => ({ mails: [merciMaelys(prenom, db)] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 18/10/2026 à 22 h 03, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant l'envoi (fiches, phrases), le raccrochage (dialogue), le figeage de
// l'inspection (« C'est bon ») ou la dernière palette posée (dépose) : l'inaction vaut 0. « Aucun faux signalement » est faux si rien n'a été
// signalé (moteur). Le dialogue et le quai n'ont pas d'`ecran` : « Corriger » ne les rouvre pas (`finFige`).
// LES IDS DES JALONS SONT LES MÊMES POUR TOUS LES ÉLÈVES (le tirage ne change que ce qu'ils lisent) : `securite-defaut` lit la ligne du défaut DE l'élève,
// `depose-mal` la ligne de SA palette mal notée (poids 2), `depose-autre-k` celles des trois autres (0,5 chacune).
export const GROUPES = { preparer: 'Préparer la réception', accueil: 'Accueillir Loïc', avant: 'Avant de décharger', trier: 'Trier par client',
  rapprocher: 'Rapprocher', corriger: 'Faire corriger', compte: 'Rendre compte' };
const ECRAN = { preparer: `fiche:${FICHES.preparer}`, rapprocher: `fiche:${FICHES.rapprocher}`, corriger: `fiche:${FICHES.corriger}`, phrases: `phrases:${PHRASES_ID}` };
const juge = (db, ficheId, champ, juste) => (!envoyee(db, ficheId) ? attente : valeurDe(db, ficheId, champ) === juste ? ok : ko);
// Le dialogue : la PREMIÈRE réponse à chaque réplique ; pas d'`ecran` (le dialogue ne se rejoue pas).
const jalonAccueil = (id, replique, titre, poids) => {
  const j = jalonDialogue({ seance: ID, dialogue: DIALOGUE, id, titre, groupe: GROUPES.accueil, poids,
    juge: (appel) => premiereReponse(appel, replique) === JUSTES_DIALOGUE[replique] });
  delete j.ecran;
  return j;
};
// Le quai : la ligne de la vue (`jalonsQuai` sur le quai DE L'ÉLÈVE), jugée seulement quand l'étape est finie.
export const ligneQuai = (db, id) => jalonsQuai(db, quaiEleve(db)).L.find((l) => l.id === id) || null;
const inspectionFigee = (db) => !!(etatQuai(db) && etatQuai(db).securite && etatQuai(db).securite.fait);
const dechargeFini = (db) => !!(etatQuai(db) && etatQuai(db).dechargeFini);
const jalonQuai = (id, titre, groupe, poids, fini, ligneId, o = {}) => ({ id, titre, groupe, poids, ...o,
  verifier(db) { if (!fini(db)) return attente; const l = ligneQuai(db, ligneId(db)); if (!l) throw new Error(`ligne du quai « ${ligneId(db)} » absente`); return l.ok ? ok : ko; } });
// Une ligne par palette au bilan détaillé (« P3, Agri-Kerlann : posée en AK1 ») ; le titre ne dit pas la case.
const titreDepose = (ligneId) => (db) => { const l = ligneQuai(db, ligneId(db)); return l && l.bilan ? `Trier par client : ${l.bilan}` : null; };
export const palettesAutres = (db) => IDS_PALETTES.filter((p) => p !== jeuEleve(db).mal);
const lignePhrases = (id, titre, lignes, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: ECRAN.phrases,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko; } });

export const ETAPES = [
  ...LIGNES_PREPARER.map((l) => ({ id: `preparer-${l.id}`, titre: `Préparer la réception : « ${l.lib} »`, groupe: GROUPES.preparer, poids: 0.5,
    ecran: ECRAN.preparer, verifier: (db) => juge(db, FICHES.preparer, l.id, l.juste()) })),
  jalonAccueil('accueil-feuille', 'feuille', 'Accueillir Loïc : ce que tu lui demandes', 0.5),
  jalonAccueil('accueil-etiquette', 'etiquette', 'Accueillir Loïc : suivre la feuille ou lire les étiquettes', 1.5),
  jalonQuai('securite-defaut', 'Avant de décharger : le défaut signalé avant de décharger', GROUPES.avant, 2, inspectionFigee, (db) => `securite-${jeuEleve(db).defaut}`),
  jalonQuai('securite-aucun-faux', 'Avant de décharger : aucun faux signalement', GROUPES.avant, 1, inspectionFigee, () => 'securite-aucun-faux'),
  jalonQuai('depose-mal', 'Trier par client : une palette', GROUPES.trier, 2, dechargeFini, (db) => `depose-${jeuEleve(db).mal}`,
    { titreBilan: titreDepose((db) => `depose-${jeuEleve(db).mal}`) }),
  ...[0, 1, 2].map((k) => jalonQuai(`depose-autre-${k + 1}`, 'Trier par client : une palette', GROUPES.trier, 0.5, dechargeFini, (db) => `depose-${palettesAutres(db)[k]}`,
    { titreBilan: titreDepose((db) => `depose-${palettesAutres(db)[k]}`) })),
  ...CLIENTS_107.flatMap((c) => [
    { id: `rapprocher-recues-${c}`, titre: `Rapprocher : ${nomClient(c)}, palettes reçues`, groupe: GROUPES.rapprocher, poids: 0.5, ecran: ECRAN.rapprocher,
      verifier: (db) => juge(db, FICHES.rapprocher, champRecues(c), String(reellesDe(jeuEleve(db), c).length)) },
    { id: `rapprocher-resultat-${c}`, titre: `Rapprocher : ${nomClient(c)}, résultat`, groupe: GROUPES.rapprocher, poids: 0.5, ecran: ECRAN.rapprocher,
      verifier: (db) => juge(db, FICHES.rapprocher, champResultat(c), resultat(jeuEleve(db), c)) },
  ]),
  { id: 'rapprocher-feuille', titre: 'Rapprocher : la feuille de ramasse est-elle juste ?', groupe: GROUPES.rapprocher, poids: 2, ecran: ECRAN.rapprocher,
    verifier: (db) => juge(db, FICHES.rapprocher, CHAMP_FEUILLE, justeFeuille(jeuEleve(db))) },
  { id: 'corriger-qui', titre: 'Faire corriger : qui corrige la feuille', groupe: GROUPES.corriger, poids: 1, ecran: ECRAN.corriger,
    verifier: (db) => juge(db, FICHES.corriger, CORRIGER.id, CORRIGER.juste) },
  lignePhrases('cr-erreur', 'Rendre compte : l’erreur de la feuille', ['erreur'], 1),
  lignePhrases('cr-salutation', 'Rendre compte : la salutation', ['salutation'], 0.25),
  lignePhrases('cr-fin', 'Rendre compte : la fin du message', ['fin'], 0.25),
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'fiche', libelle: 'Préparer la réception', fait: dejaEnvoyee(FICHES.preparer) },
  { vue: 'telephone', libelle: 'Au quai : accueillir Loïc', fait: dialogueFini(DIALOGUE) },
  { vue: 'quai', libelle: 'Le quai A : inspecter, puis trier', fait: quaiDecharge(QUAI_ID) },
  { vue: `fiche:${FICHES.rapprocher}`, libelle: 'Rapprocher des annonces', fait: dejaEnvoyee(FICHES.rapprocher) },
  { vue: `fiche:${FICHES.corriger}`, libelle: 'La feuille de ramasse', fait: dejaEnvoyee(FICHES.corriger) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Maëlys', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
// Les mots du brief ; définitions neutres, CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_107 = {
  ...LEXIQUE,
  'feuille de ramasse': 'Document du conducteur : pour chaque expéditeur, ce qu’il a chargé (palettes, colis), signé par le client au chargement.',
  annonce: 'Message d’un client qui dit ce qu’il va nous envoyer : combien de palettes, de quoi.',
  expéditeur: 'Celui qui envoie la marchandise. Ici, le client qui confie ses palettes à Pelleau.',
  'étiquette de palette': 'Étiquette collée sur la palette : à qui elle est (l’expéditeur), ce qu’elle contient, combien de colis.',
  'zone de réception': 'Endroit devant les quais où l’on pose les palettes qui sortent du camion, avant de les contrôler.',
  cale: 'Bloc en forme de coin que l’on pose contre une roue du camion pour qu’il ne puisse pas bouger.',
  niveleur: 'Plaque au bord du quai, posée sur le plancher du camion : elle fait le pont entre le quai et la remorque.',
  rapprocher: 'Comparer deux documents ligne à ligne : ici, ce qui est arrivé et ce que le client a annoncé.',
  écart: 'Différence entre ce qui était prévu et ce qui est arrivé.',
  gerber: 'Poser une palette sur une autre.',
};
export const MENTION_107 = `${MENTION} Pour cette séance : la feuille de ramasse (et son erreur), les annonces des clients, les règles du quai et le quai A (un dessin) sont construits.`;
export const ACCUEIL = {
  titre: 'La feuille de ramasse se trompe',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Maëlys', 'Menu Messagerie : la feuille de ramasse et les annonces sont jointes.'],
    ['① Préparer la réception', 'Combien de palettes arrivent, pour combien de clients ?'],
    ['② Au quai', 'Va accueillir Loïc.'],
    ['③ Le quai A', 'Regarde le quai avant de décharger, puis dis à Yann où poser chaque palette.'],
    ['④ Rapprocher', 'Pour chaque client, compare ce qui est arrivé avec son annonce, puis regarde la feuille de ramasse.'],
    ['⑤ La feuille de ramasse', 'Réponds à la dernière question d’Erwan.'],
    ['⑥ Rendre compte', 'Réponds à Maëlys.'],
    ['Bon à savoir', MENTION_107],
  ],
};
export const FIN_FIGE = 'Le camion est déchargé : le quai ne se rejoue pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 7 : la feuille de ramasse se trompe',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_107,
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_PREPARER, FICHE_RAPPROCHER, FICHE_CORRIGER],
  telephone: TELEPHONE,
  quai: quaiDe,
  suite: SUITE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  fermetures: {
    telephone: { ouvertSi: (db) => dejaEnvoyee(FICHES.preparer)(db), message: 'Après la fiche « Préparer la réception »' },
    quai: { ouvertSi: (db, seance) => dialogueFini(DIALOGUE)(db, seance), message: 'Après l’accueil de Loïc' },
  },
};
// Pour les tests et le corrigé : la consigne de la scène et ce qui se calcule.
export { SECURITE_CONSIGNE, PIED };
