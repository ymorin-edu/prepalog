// ENT-10.8 — Transports Pelleau, « évaluation : recevoir le camion de ramasse » : le contenu de la séance (brief
// `docs/briefs/ENT-10.8-pelleau-evaluation-reception.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant le
// brief). Univers commun : `contenus/pelleau.js` (À LIRE). Données pures (le jeu tiré, le planning, la feuille, les annonces, le quai, le dialogue, ce qui
// s'en calcule) : `contenus/pelleau-ent108-donnees.js`. Activité : `activites/pelleau-evaluation-reception.js`. Questions : `contenus/questions/ENT-10.8.js`.
// Corrigé : `contenus/corriges/ENT-10.8.js`.
//
// 19 mai 2026, 7 h (aucun jour de la semaine écrit). CAP OL, ÉVALUATION de CAP-C1.3, en copie rendue (`copie: true`) : recevoir seul le camion de ramasse de
// bout en bout, sans aide. Rien ne remonte pendant le travail, une seule remise (« Rendre ma copie » du bandeau), note figée ; aucun bilan, aucun
// « Corriger », aucun mot cliquable, rien à l'écran ne dit juste ou faux (aucune réaction de Loïc ni de Yann, aucun accusé de Maëlys qui reprenne ce que
// l'élève a écrit). Le modèle d'évaluation est ENT-8.10 ; la structure est celle d'ENT-10.6 (quai tiré par élève, dépose par client).
//   Avant de commencer (noté, 4 points) → ① Préparer (fiche de 3 lignes : l'heure et le quai de Loïc lus dans LE PLANNING, le nombre de palettes annoncées
//   par un client tiré) → ② Au quai : accueillir Loïc (Dialogue face à face, deux tours, la première réponse compte) → ③ Le quai (inspection sur la scène,
//   UN défaut tiré, rien n'arrête ; dépose par client, le premier clic pose ; le quai s'arrête quand la dernière palette est posée et ne rend PAS la copie)
//   → ④ Rapprocher (fiche : pour chaque client les palettes reçues et le résultat contre son annonce, puis « la feuille de ramasse est-elle juste ? ») →
//   ⑤ Rendre compte à Maëlys (phrases à choisir) → Rendre ma copie.
// La barre « Étape suivante » n'existe pas en évaluation (moteur) : l'ordre se lit au menu, chaque écran reste fermé tant que le précédent n'est pas fait.
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/pelleau.js` (univers) et de `contenus/pelleau-ent108-donnees.js`. Les documents de la séance (planning
// des quais, feuille de ramasse, annonces, règles du quai, « Ta matinée », étiquette) sont CONSTRUITS et portent le pied imposé (`PIED`). Aucune consigne
// de « Corriger » : une évaluation ne se rouvre pas.

import { apresFiche, apresMail, dialogueFini, quaiDecharge } from '../core/declencheurs.js';
import { jalonsQuai } from '../core/types/quai.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { graineDeBase } from '../core/tirage.js';
import { QUESTIONS } from './questions/ENT-10.8.js';
import { EQUIPE, MENTION, LOGO, PALETTE_AR_VAG, STYLE_DOCUMENTS, PIED, mailDe, heureScenario, ech, pied, entete } from './pelleau.js';
import {
  ID, ID_VOLET, QUAI_ID, DIALOGUE, FICHES, PHRASES_ID, JOUR, BL, CLIENTS_108, NOM_DIT, nomClient, jeuDeBase, quaiDe, quaiDeBase, REPLIQUES, JUSTES_DIALOGUE,
  FIN_DIALOGUE, LIGNES_PREPARER, nombres, RESULTATS, champRecues, champResultat, CHAMP_FEUILLE, CHAMP_CORRECTION, CHOIX_FEUILLE, CHOIX_CORRECTION,
  feuilleJuste, correctionJuste, sensFeuille, compte, annonce, feuille, colisFeuille, colisAnnonces, uniteDe, produitDe, resultat, pal, choixEcart, ligneRecu,
  SALUTATIONS, fins, GRILLES, QUAIS, placeDeLoic,
} from './pelleau-ent108-donnees.js';

export { ID, ID_VOLET, QUAI_ID, DIALOGUE, FICHES, PHRASES_ID } from './pelleau-ent108-donnees.js';

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
// Le quai de CET élève et son état.
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── les documents (construits ; pied imposé)
const DATE_DOC = `${JOUR} mai`;
// Le planning des quais DE CET élève (une des deux grilles) : une case par quai et par créneau, une seule contient « Loïc ».
export const DOC_PLANNING = { id: 'planning-108', titre: `Planning des quais — ${DATE_DOC}`, court: 'Le planning des quais',
  html: (db) => { const g = GRILLES[jeuDeBase(db).grille]; return `<article class="pe-doc" aria-label="Planning des quais du ${DATE_DOC}">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    ${entete('Planning des quais', [DATE_DOC, 'Entrepôt de Gouesnou', 'Bureau transport'])}
    <table class="pe-tab"><thead><tr><th>Heure</th>${QUAIS.map((q) => `<th>Quai ${q}</th>`).join('')}</tr></thead>
    <tbody>${g.map(([h, ...cases]) => `<tr><td class="pe-nb">${ech(h)}</td>${cases.map((c) => `<td>${ech(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    ${pied()}
  </article>`; } };
// La feuille de ramasse de CET élève : une ligne par client, ce que Loïc a ÉCRIT (palettes, colis). Aucune observation, aucun total.
export const DOC_FEUILLE = { id: 'feuille-ramasse-108', titre: 'Feuille de ramasse de Loïc', court: 'La feuille de ramasse',
  html: (db) => { const jeu = jeuDeBase(db); return `<article class="pe-doc" aria-label="Feuille de ramasse de Loïc">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    ${entete('Feuille de ramasse', [`N° ${BL}`, DATE_DOC, 'Conducteur : Loïc', 'Porteur Pelleau'])}
    <table class="pe-tab"><thead><tr><th>Expéditeur</th><th>Palettes</th><th>Colis</th><th>Signature du client</th></tr></thead>
    <tbody>${CLIENTS_108.map((c) => `<tr><td>${ech(nomClient(c))}</td><td class="pe-nb">${feuille(jeu, c)}</td>
      <td>${colisFeuille(jeu, c)} ${ech(uniteDe(c, colisFeuille(jeu, c)))}</td><td>signé</td></tr>`).join('')}</tbody></table>
    <p class="pe-st">Le client signe quand Loïc charge ses palettes.</p>
    ${pied()}
  </article>`; } };
// L'annonce d'un client : ce qu'il PRÉVOIT de confier (son courriel), qui peut différer de ce que Loïc a chargé.
const docAnnonce = (c) => ({ id: `annonce-${c}-108`, titre: `Annonce de ${nomClient(c)}`, court: `L’annonce ${NOM_DIT[c]}`,
  html: (db) => { const jeu = jeuDeBase(db); const nom = produitDe(c); return `<article class="pe-doc" aria-label="Annonce de ${ech(nomClient(c))}">
    <p class="pe-t">Courriel reçu par l’entrepôt</p>
    <p class="pe-mail"><b>De :</b> ${ech(nomClient(c))} — service expéditions<br><b>À :</b> Transports Pelleau, entrepôt de Gouesnou<br>
      <b>Objet :</b> Palettes confiées le ${DATE_DOC}</p>
    <p>Bonjour,</p>
    <p>Nous vous confions ce jour <b>${pal(annonce(jeu, c))}</b> de ${ech(nom.charAt(0).toLowerCase() + nom.slice(1))}
      (${colisAnnonces(jeu, c)} ${ech(uniteDe(c, colisAnnonces(jeu, c)))}), à garder dans votre entrepôt. Votre conducteur passe les prendre ce matin.</p>
    <p>Cordialement,<br>Le service expéditions, ${ech(nomClient(c))}</p>
    ${pied()}
  </article>`; } });
export const DOCS_ANNONCES = CLIENTS_108.map(docAnnonce);
// « Les règles du quai » (lues à « Avant de commencer » seulement ; aucun mot cliquable en évaluation).
export const DOC_REGLES = { id: 'regles-quai-108', titre: 'Les règles du quai', court: 'Les règles du quai',
  html: `<article class="pe-doc" aria-label="Les règles du quai">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Les règles du quai</p>
    <p class="pe-st">Entrepôt de Gouesnou — écrites par Erwan, responsable de l’entrepôt</p>
    <ul class="pe-ul">
      <li>Le conducteur recule jusqu’aux butoirs, <b>coupe le moteur</b> et <b>pose la cale</b>.</li>
      <li>Pendant le déchargement, le conducteur <b>attend au local</b>. Il ne décharge pas.</li>
      <li>Avant d’entrer dans le camion : niveleur posé, <b>lampe de quai allumée</b>.</li>
      <li>Le chariot élévateur : Yann seulement.</li>
      <li>Chaque palette va dans la zone de <b>son client</b> : lis l’étiquette de la palette avant de poser.</li>
      <li>Pas de gerbage (une palette sur une autre) en zone de réception.</li>
    </ul>
    <p class="pe-st" style="margin-top:8px">Règles construites pour l’exercice, d’après les règles courantes d’un protocole de sécurité.</p>
    ${pied()}
  </article>` };
// « Ta matinée » (écran « Avant de commencer ») : la situation, sans rien de ce qu'on demande.
export const DOC_MATINEE = { id: 'matinee-108', titre: 'Ta matinée', court: 'Ta matinée',
  html: `<article class="pe-doc" aria-label="Ta matinée">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Ta matinée</p>
    <p class="pe-st">${DATE_DOC} — entrepôt de Gouesnou</p>
    <p>Loïc, conducteur Pelleau, rentre de sa ramasse. Dans son camion : les palettes de <b>plusieurs clients</b>, qui les confient
      à Pelleau pour les garder.</p>
    <p><b>Yann</b> décharge au chariot élévateur. <b>Toi</b>, tu reçois le camion : tu prépares, tu accueilles Loïc, tu regardes le quai, tu dis à Yann où poser
      chaque palette et tu rends compte à <b>Maëlys</b>, au bureau transport.</p>
    ${pied('Document pédagogique — reconstitution, non contractuel. Les clients cités sont des entreprises fictives. Loïc, Yann, Maëlys et Erwan sont imaginés pour l’exercice.')}
  </article>` };
// Une étiquette de palette (dessinée en texte) : ce qu'on y lit.
export const DOC_ETIQUETTE = { id: 'etiquette-108', titre: 'Une étiquette de palette', court: 'Une étiquette',
  html: `<article class="pe-doc" aria-label="Une étiquette de palette">
    <p class="pe-t">Une étiquette de palette</p>
    <div class="pe-etiq">
      <p><span>EXPÉDITEUR</span><b>${ech(nomClient('ar-vag'))}</b></p>
      <p><span>DESTINATAIRE</span><b>Transports Pelleau — entrepôt de Gouesnou</b></p>
      <p><span>CONTENU</span><b>${ech(produitDe('ar-vag').toUpperCase())} — ${ech(PALETTE_AR_VAG.ref)}</b></p>
      <p><span>COLIS</span><b>${PALETTE_AR_VAG.colis} ${ech(PALETTE_AR_VAG.unitePl)}</b></p>
    </div>
    ${pied()}
  </article>` };
export const STYLE = `${STYLE_DOCUMENTS}
.pe-tab{width:100%; border-collapse:collapse; margin:4px 0 8px; font-size:.9rem}
.pe-tab th,.pe-tab td{border:1px solid #cfc8ba; padding:5px 7px; text-align:left; vertical-align:top}
.pe-tab th{font-size:.82rem}
.pe-nb{text-align:center; white-space:nowrap}
.pe-mail{font-size:.88rem; color:var(--douce); border-bottom:1px solid #e3ded3; padding-bottom:6px}
.pe-etiq{border:2px solid var(--encre); border-radius:4px; padding:8px 12px; margin:6px 0 10px; font-family:inherit}
.pe-etiq p{display:flex; gap:10px; margin:0 0 6px; align-items:baseline}
.pe-etiq span{flex:0 0 7.5em; font-size:.74rem; letter-spacing:.04em; color:var(--douce)}
`;
export const DOCUMENTS = [DOC_PLANNING, DOC_FEUILLE, ...DOCS_ANNONCES, DOC_REGLES, DOC_MATINEE, DOC_ETIQUETTE];
const IDS_ANNONCES = DOCS_ANNONCES.map((d) => d.id);
const piecesDepart = [DOC_PLANNING.id, DOC_FEUILLE.id, ...IDS_ANNONCES];

// ─────────────────────────────────────────────────────────────── ① la fiche « Préparer » (3 lignes)
const ligneListe = (db) => (l) => ({ type: 'liste', id: l.id, lib: typeof l.lib === 'function' ? l.lib(jeuDeBase(db)) : l.lib, vide: 'Choisir…', manque: l.manque,
  choix: l.choix || nombres(l.max) });
export const FICHE_PREPARER = {
  id: FICHES.preparer, libelle: 'Préparer', titre: 'Préparer la réception',
  sousTitre: 'Lis le planning, la feuille de ramasse et les annonces, à gauche.',
  documents: piecesDepart,
  bouton: 'Ouvrir la fiche « Préparer »',
  blocs: (db) => LIGNES_PREPARER.map(ligneListe(db)),
  envoi: { bouton: 'Envoyer la fiche à Maëlys', a: 'Maëlys', suite: 'Merci, c’est noté.', incomplet: true },
};

// ─────────────────────────────────────────────────────────────── ② « Au quai » : accueillir Loïc (face à face, collègue : tu)
export const SITUATION_ACCUEIL = 'Loïc arrive avec la ramasse. Va l’accueillir.';
export const TELEPHONE = {
  face: true,
  libelle: 'Au quai',
  situation: SITUATION_ACCUEIL,
  dialogues: [{ id: DIALOGUE, de: 'loic', contact: { nom: 'Loïc', detail: 'conducteur, retour de ramasse' }, repliques: REPLIQUES, fin: FIN_DIALOGUE }],
};

// ─────────────────────────────────────────────────────────────── ④ la fiche « Rapprocher » (un cadre par client, un cadre pour la feuille)
// Les MÊMES six lignes pour tous les élèves : la forme de la fiche ne dit rien du jeu.
export const FICHE_RAPPROCHER = {
  id: FICHES.rapprocher, libelle: 'Rapprocher', titre: 'Rapprocher des annonces',
  sousTitre: 'Pour chaque client : ce qui est arrivé, puis ce que ça donne par rapport à son annonce. Ensuite, la feuille de ramasse.',
  documents: [DOC_FEUILLE.id, ...IDS_ANNONCES],
  bouton: 'Ouvrir la fiche « Rapprocher »',
  quand: (db) => quaiDecharge(QUAI_ID)(db),
  grille: true,
  blocs: [
    ...CLIENTS_108.map((c) => ({ type: 'cadre', titre: nomClient(c), blocs: [
      { type: 'liste', id: champRecues(c), lib: 'Palettes reçues', vide: 'Choisir…', manque: `les palettes reçues de ${NOM_DIT[c]}`, choix: nombres(5) },
      { type: 'liste', id: champResultat(c), lib: 'Résultat', vide: 'Choisir…', manque: `le résultat pour ${NOM_DIT[c]}`, choix: RESULTATS },
    ] })),
    { type: 'cadre', titre: 'La feuille de ramasse', blocs: [
      { type: 'liste', id: CHAMP_FEUILLE, lib: 'La feuille de Loïc est…', vide: 'Choisir…', manque: 'ce que tu penses de la feuille', choix: CHOIX_FEUILLE },
      { type: 'liste', id: CHAMP_CORRECTION, lib: 'Que fais-tu de la feuille ?', vide: 'Choisir…', manque: 'ce que tu fais de la feuille', choix: CHOIX_CORRECTION },
    ] },
  ],
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Merci, c’est noté.', incomplet: true },
};

// ─────────────────────────────────────────────────────────────── ⑤ rendre compte à Maëlys (phrases à choisir)
export const phrasesCompteRendu = (prenom, db) => { const jeu = jeuDeBase(db); return { id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS, juste: 0 },
  { id: 'recu', texte: ligneRecu(jeu) },
  { id: 'ecart', choix: choixEcart(jeu), juste: 0 },
  { id: 'fin', choix: fins(prenom), juste: 0 },
] }; };

// ─────────────────────────────────────────────────────────────── les messages (au tu ; 19 mai 2026, jamais le jour de la semaine ; jamais juste ni faux)
const MAELYS = { nom: EQUIPE.maelys.nom, mail: mailDe('maelys') };
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR, o.heure || '06:30', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJETS = { accueil: 'La ramasse de Loïc', quai: 'Loïc arrive', yann: 'Yann est prêt', rapprocher: 'Les palettes sont triées', compte: 'Alors, la ramasse ?',
  fin: 'Merci' };
const reponduAMaelys = (db) => phrasesJustes(db, PHRASES_ID).envoye;

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, MAELYS, SUJETS.accueil,
      `Salut ${prenom}, ce matin, Erwan te laisse gérer la réception de la ramasse de Loïc. Voici le planning des quais, sa feuille de ramasse et les annonces des clients. `
        + `Prépare la réception.\n\nMaëlys`,
      { db, extra: { pieces: piecesDepart, ouvreFiche: FICHES.preparer } }),
  ] }),
  declencheurs: [
    { id: 'accueil', quand: apresFiche(FICHES.preparer),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, SUJETS.quai, `${SITUATION_ACCUEIL} Menu « Au quai ».\n\nErwan`, { db, heure: '07:25' })] }) },
    { id: 'quai', quand: dialogueFini(DIALOGUE),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, SUJETS.yann,
        'Yann est prêt à décharger. Avant qu’il entre dans le camion, regarde le quai (menu « Le quai »).\n\nErwan', { db, heure: '07:32' })] }) },
    { id: 'rapprocher', quand: quaiDecharge(QUAI_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, SUJETS.rapprocher,
        'Les palettes sont triées. Pour chaque client, compare ce qui est arrivé avec ce qu’il a annoncé, et regarde la feuille de ramasse.\n\nErwan',
        { db, heure: '07:48', extra: { pieces: [DOC_FEUILLE.id, ...IDS_ANNONCES], ouvreFiche: FICHES.rapprocher } })] }) },
    { id: 'compte-rendu', quand: apresFiche(FICHES.rapprocher),
      semer: (prenom, db) => ({ mails: [mail(prenom, MAELYS, SUJETS.compte,
        'Alors, la ramasse ?\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nMaëlys',
        { db, heure: '07:54', extra: { phrases: phrasesCompteRendu(prenom, db) } })] }) },
    // La fin : neutre (Maëlys ne reprend pas ce que l'élève a écrit), et la remise.
    { id: 'fin', quand: apresMail({ a: MAELYS.mail }), semer: (prenom, db) => ({ mails: [mail(prenom, MAELYS, SUJETS.fin,
      `Merci ${prenom}.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nMaëlys`, { db, heure: '08:00' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de l'ouverture = 20 ; poids du brief §5, validés par Tristan le 18/10/2026 à 22 h 03)
// Préparer 2 (3 × 2/3) · Accueillir Loïc 2 (1 + 1) · Avant de décharger 3 (défaut 2, aucun faux 1) · Trier par client 4 (1 par palette, premier clic) ·
// Rapprocher 3 (reçues 0,75 × 2 ; résultat ou, pour l'erreur de feuille, « la palette » et « la correction » 0,75 × 2) · Rendre compte 2 (l'écart 1,5 ; forme 0,5).
// Rien n'est vrai avant un envoi (fiches, phrases), le raccrochage (dialogue), le figeage de l'inspection (« C'est bon ») ou la dernière palette posée
// (dépose) : l'inaction vaut 0. « Aucun faux signalement » est faux si rien n'a été signalé (moteur).
export const GROUPES = { preparer: 'Préparer', accueil: 'Accueillir Loïc', avant: 'Avant de décharger', trier: 'Trier par client', rapprocher: 'Rapprocher',
  compte: 'Rendre compte' };
const ECRAN = { preparer: `fiche:${FICHES.preparer}`, rapprocher: `fiche:${FICHES.rapprocher}`, phrases: `phrases:${PHRASES_ID}` };
const juge = (db, ficheId, champ, juste) => (!envoyee(db, ficheId) ? attente : valeurDe(db, ficheId, champ) === juste ? ok : ko);
const jalonAccueil = (id, replique, titre) => {
  const j = jalonDialogue({ seance: ID, dialogue: DIALOGUE, id, titre, groupe: GROUPES.accueil, poids: 1,
    juge: (appel) => premiereReponse(appel, replique) === JUSTES_DIALOGUE[replique] });
  delete j.ecran;
  return j;
};
// Le quai DE L'ÉLÈVE : la ligne de la vue (`jalonsQuai`), jugée seulement quand l'étape est finie.
export const ligneQuai = (db, id) => jalonsQuai(db, quaiDeBase(db)).L.find((l) => l.id === id) || null;
const inspectionFigee = (db) => !!(etatQuai(db) && etatQuai(db).securite && etatQuai(db).securite.fait);
const dechargeFini = (db) => !!(etatQuai(db) && etatQuai(db).dechargeFini);
const jalonQuai = (id, titre, groupe, poids, fini, ligne) => ({ id, titre, groupe, poids,
  verifier(db) { if (!fini(db)) return attente; const l = ligne(db); if (!l) throw new Error(`ligne du quai « ${id} » absente`); return l.ok ? ok : ko; } });
const lignePhrases = (id, titre, lignes, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: ECRAN.phrases,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko; } });
const val = (db, champ) => valeurDe(db, FICHES.rapprocher, champ);
// Les deux derniers jalons de « Rapprocher » (0,75 chacun) : sans erreur de feuille, le résultat d'un client ET la feuille jugée juste (ou rien à corriger) —
// jamais gratuit de crier au loup ; avec l'erreur de feuille, « la palette » (quel sens) et « la correction » (qui corrige).
const jalonResultat = (c, voie) => ({ id: `rapprocher-resultat-${c}`, titre: `Rapprocher : ${nomClient(c)}, le résultat`, groupe: GROUPES.rapprocher, poids: 0.75,
  ecran: ECRAN.rapprocher,
  titreBilan: (db) => (jeuDeBase(db).ecart === 'feuille' ? (voie === 'palette' ? 'Rapprocher : la palette mal notée sur la feuille' : 'Rapprocher : la correction de la feuille')
    : `Rapprocher : ${nomClient(c)}, le résultat${voie === 'palette' ? ' (et la feuille jugée juste)' : ' (et rien à corriger)'}`),
  verifier(db) {
    if (!envoyee(db, FICHES.rapprocher)) return attente;
    const jeu = jeuDeBase(db);
    if (jeu.ecart === 'feuille') return (voie === 'palette' ? val(db, CHAMP_FEUILLE) === feuilleJuste(jeu) : val(db, CHAMP_CORRECTION) === correctionJuste(jeu)) ? ok : ko;
    const autre = voie === 'palette' ? val(db, CHAMP_FEUILLE) === feuilleJuste(jeu) : val(db, CHAMP_CORRECTION) === correctionJuste(jeu);
    return val(db, champResultat(c)) === resultat(jeu, c) && autre ? ok : ko;
  } });

export const ETAPES = [
  ...LIGNES_PREPARER.map((l) => ({ id: `preparer-${l.id}`, titre: `Préparer : « ${l.id === 'heure' ? 'l’heure du camion' : l.id === 'quai' ? 'le quai' : 'les palettes annoncées'} »`,
    groupe: GROUPES.preparer, poids: 2 / 3, ecran: ECRAN.preparer, verifier: (db) => juge(db, FICHES.preparer, l.id, l.juste(jeuDeBase(db))) })),
  jalonAccueil('accueil-feuille', 'feuille', 'Accueillir Loïc : ce que tu lui demandes'),
  jalonAccueil('accueil-regles', 'regles', 'Accueillir Loïc : ce qu’il fait pendant le déchargement'),
  // Le défaut est UN des quatre objets, tiré par élève : l'id du jalon est le même pour tous, sa ligne de la vue suit le défaut de l'élève.
  jalonQuai('securite-defaut', 'Avant de décharger : le défaut signalé avant de décharger', GROUPES.avant, 2, inspectionFigee,
    (db) => ligneQuai(db, `securite-${jeuDeBase(db).defaut}`)),
  jalonQuai('securite-aucun-faux', 'Avant de décharger : aucun faux signalement', GROUPES.avant, 1, inspectionFigee, (db) => ligneQuai(db, 'securite-aucun-faux')),
  // Une ligne par palette (le premier clic compte) ; le titre ne dit pas la case.
  ...[1, 2, 3, 4].map((k) => jalonQuai(`depose-P${k}`, `Trier par client : la palette P${k}`, GROUPES.trier, 1, dechargeFini, (db) => ligneQuai(db, `depose-P${k}`))),
  ...CLIENTS_108.map((c) => ({ id: `rapprocher-recues-${c}`, titre: `Rapprocher : ${nomClient(c)}, palettes reçues`, groupe: GROUPES.rapprocher, poids: 0.75,
    ecran: ECRAN.rapprocher, verifier: (db) => juge(db, FICHES.rapprocher, champRecues(c), String(compte(jeuDeBase(db), c))) })),
  jalonResultat('ar-vag', 'palette'),
  jalonResultat('agri-kerlann', 'correction'),
  // Rendre compte : le contenu (l'écart) 1,5 ; la forme (salutation, fin) 0,5.
  lignePhrases('cr-ecart', 'Rendre compte : l’écart', ['ecart'], 1.5),
  lignePhrases('cr-salutation', 'Rendre compte : la salutation', ['salutation'], 0.25),
  lignePhrases('cr-fin', 'Rendre compte : la fin du message', ['fin'], 0.25),
];

// ─────────────────────────────────────────────────────────────── pastilles, ordre des écrans, accueil, options
export const PASTILLES = [
  { libelle: 'Préparer', fait: (db) => envoyee(db, FICHES.preparer) },
  { libelle: 'Au quai', fait: (db, seance) => dialogueFini(DIALOGUE)(db, seance || ID) },
  { libelle: 'Le quai', fait: quaiDecharge(QUAI_ID) },
  { libelle: 'Rapprocher', fait: (db) => envoyee(db, FICHES.rapprocher) },
  { libelle: 'Rendre compte', fait: reponduAMaelys },
];
// L'ordre des écrans de travail (menu ; le moteur ne montre pas la barre « Étape suivante » en évaluation).
export const SUITE = [
  { vue: 'fiche', libelle: 'Préparer', fait: (db) => envoyee(db, FICHES.preparer) },
  { vue: 'telephone', libelle: 'Au quai : accueillir Loïc', fait: dialogueFini(DIALOGUE) },
  { vue: 'quai', libelle: 'Le quai : inspecter, puis trier', fait: quaiDecharge(QUAI_ID) },
  { vue: `fiche:${FICHES.rapprocher}`, libelle: 'Rapprocher', fait: (db) => envoyee(db, FICHES.rapprocher) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Maëlys', fait: reponduAMaelys },
];
export const MENTION_108 = `${MENTION} Pour cette séance : le planning des quais, la feuille de ramasse, les annonces des clients, les règles du quai et le quai (un dessin) sont construits.`;
export const ACCUEIL = {
  titre: 'Évaluation : recevoir le camion de ramasse',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Maëlys', 'Menu Messagerie : le planning, la feuille de ramasse et les annonces sont joints.'],
    ['① Préparer', 'Lis le planning, la feuille de ramasse et les annonces, puis remplis la fiche.'],
    ['② Au quai', 'Va accueillir Loïc.'],
    ['③ Le quai', 'Regarde le quai avant de décharger, puis dis à Yann où poser chaque palette.'],
    ['④ Rapprocher', 'Compare ce qui est arrivé avec les annonces, et regarde la feuille de ramasse.'],
    ['⑤ Rendre compte', 'Réponds à Maëlys, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION_108],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : recevoir le camion de ramasse',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_PREPARER, FICHE_RAPPROCHER],
  telephone: TELEPHONE,
  quai: quaiDe,
  suite: SUITE,
  pastilles: PASTILLES,
  questions: QUESTIONS,
  fermetures: {
    telephone: { ouvertSi: (db) => envoyee(db, FICHES.preparer), message: 'Après la fiche « Préparer »' },
    quai: { ouvertSi: (db, seance) => dialogueFini(DIALOGUE)(db, seance), message: 'Après l’accueil de Loïc' },
  },
};
export { sensFeuille, placeDeLoic, graineDeBase };
