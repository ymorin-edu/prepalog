// ENT-6.1 — France Boissons, « bienvenue à Buchelay : qui fait quoi » : les données de la séance (brief
// `docs/briefs/ENT-6.1-france-boissons-organigramme.md`). Univers commun : `contenus/france-boissons.js`.
// Questions : `contenus/questions/ENT-6.1.js`. Activité : `activites/france-boissons-organigramme.js`.
//
// L'élève, en renfort à l'accueil de la plateforme (lundi 14 juin 2027, 8 h) :
//   0. regarde la vidéo projetée par le professeur et remplit « Ce que j'ai vu » (non notée, s'envoie vide) ;
//   1. lit le message d'Inès, l'organigramme (avec SES cases vides, lettrées A, B, C — D pour un confirmé) et l'annuaire ;
//   2. remplit et envoie la fiche « Qui fait quoi ? » (cases vides, chef de Lucas, liens hiérarchiques / fonctionnels) ;
//   3. répond au point d'étape d'Inès (`qui-decide-conges`, noté) ;
//   4. transfère le courrier du matin, message par message (« Transférer à… », chantier D-1) ; Karim pose une question de
//      réflexion au premier transfert ;
//   5. fin : bandeau ✓ / ✗ par bloc, « Corriger » rouvre la fiche et les seuls messages mal transférés.
//
// TIRAGE (brief §6 bis, `core/tirage.js`) : trois banques — `cases` (la case de Karim fixe + 1 facile + 1 difficile ;
// confirmé : + 1 difficile), `liens` (la tournée de Karim fixe + 1 facile, 2 moyens, 1 difficile ; confirmé : + 1 moyen,
// 1 difficile), `courrier` (Malo fixe + 1 facile, 1 moyen, 1 difficile ; confirmé : + 1 moyen, 1 difficile). Équité
// (`verifier`) : au moins 2 liens hiérarchiques et 2 fonctionnels, au moins 3 destinataires différents.
// Les ids des pièces ne changent JAMAIS (`retiree: true` pour mettre de côté) : ils sont rangés dans la base des élèves.
//
// Valeurs attendues CALCULÉES depuis les banques (le poste de la case, l'attendu du lien, le destinataire du message),
// jamais recopiées ; dans les tests, écrites à la main.
//
// Le JEU DE L'ÉLÈVE dans les écrans (organigramme à cases vides, lignes de la fiche, ordre des choix) : le moteur ne sait
// pas encore déclarer une fiche ou un document « fonction de la base de l'élève » (demande au moteur, §7.3 du brief).
// En attendant, l'activité fabrique le moteur de la séance À L'OUVERTURE, pour l'élève qui l'ouvre : `jeuAOuverture(ctx)`
// range le tirage (comme le moteur le ferait, par `TIRAGE.assurer`), puis `optionsPour(jeu)` rend sa fiche, ses documents
// et ses jalons. Voir l'en-tête de `activites/france-boissons-organigramme.js`.

import { apresFiche, apresTransfert } from '../core/declencheurs.js';
import { transfertDe } from '../core/types/transfert.js';
import { declarerTirage, hasard } from '../core/tirage.js';
import { EQUIPE, ORDRE_ANNUAIRE, ORDRE_LECTURE, LEXIQUE as LEXIQUE_FB, MENTION, mailDe, EXTERIEURS,
  organigrammeHtml, DOC_ANNUAIRE, STYLE_DOCUMENTS } from './france-boissons.js';
import { QUESTIONS } from './questions/ENT-6.1.js';

export const ID = 'france-boissons-organigramme';
const QFQ = 'qui-fait-quoi';
const VU = 'vu';

// La fiche envoyée, lue comme `ficheEnvoyee` (core/types/fiche.js) sans importer ce module (il tire core/ui.js).
function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}

// ─────────────────────────────────────────────────────────────── les banques (brief §6 bis)

// Les cases vides de l'organigramme. Hélène n'est jamais vide (elle donne le sommet).
export const BANQUE_CASES = [
  { id: 'case-karim', poste: 'karim' },                                   // fixe : le chef de Lucas, fil de 6.3, 6.8, 6.9
  { id: 'case-ines', poste: 'ines', difficulte: 'facile' },
  { id: 'case-lucas', poste: 'lucas', difficulte: 'facile' },
  { id: 'case-thomas', poste: 'thomas', difficulte: 'difficile' },        // se confond avec Nadia
  { id: 'case-nadia', poste: 'nadia', difficulte: 'difficile' },          // se confond avec Thomas
];

// « Le lien est-il hiérarchique ? »
const H = 'hierarchique', F = 'fonctionnel';
export const BANQUE_LIENS = [
  { id: 'lien-karim-tournee', texte: 'Karim donne à Lucas sa tournée du jour.', attendu: H },
  { id: 'lien-nadia-cariste', texte: 'Nadia demande à un cariste de ranger les fûts dans l’allée M.', attendu: H, difficulte: 'facile' },
  { id: 'lien-ines-formulaire', texte: 'Inès envoie à Lucas le formulaire de congés à remplir.', attendu: F, difficulte: 'facile' },
  { id: 'lien-helene-objectif', texte: 'Hélène fixe à Thomas l’objectif « zéro accident » de l’entrepôt.', attendu: H, difficulte: 'facile' },
  { id: 'lien-nadia-quai', texte: 'Nadia indique à Lucas à quel quai charger son camion.', attendu: F, difficulte: 'moyen' },
  { id: 'lien-lucas-attestation', texte: 'Lucas demande à Inès une attestation d’employeur.', attendu: F, difficulte: 'moyen' },
  { id: 'lien-thomas-heures', texte: 'Thomas valide les heures supplémentaires de Nadia.', attendu: H, difficulte: 'moyen' },
  { id: 'lien-karim-horaire', texte: 'Karim prévient Nadia que le camion de la côte part à 6 h.', attendu: F, difficulte: 'moyen' },
  { id: 'lien-helene-recrutement', texte: 'Hélène valide le recrutement d’un saisonnier proposé par Karim.', attendu: H, difficulte: 'difficile' },
  { id: 'lien-thomas-securite', texte: 'Thomas rappelle à Lucas qu’on ne fume pas sur le quai.', attendu: F, difficulte: 'difficile' },
  { id: 'lien-karim-preparateur', texte: 'Karim demande à un préparateur de finir vite le chargement de Lucas.', attendu: F, difficulte: 'difficile' },
];

// Le courrier du matin. Messages courts, signés ; extérieurs au VOUS, collègues au TU. `a` : le destinataire attendu.
// Expéditeurs, prénoms et textes CONSTRUITS ; l'heure de la brasserie (mercredi 14 h) est celle de 6.4.
const msg = (id, a, difficulte, de, deMail, sujet, texte) => ({ id, a, difficulte, de, deMail, sujet, texte });
export const BANQUE_COURRIER = [
  msg('msg-malo', 'ines', undefined, 'La Cabane à Malo', EXTERIEURS.malo.mail, 'Commande de vendredi',             // fixe (prépare 6.2)
    'Bonjour,\n\nJe vous envoie demain ma commande de [[fût|fûts]] pour vendredi : à qui dois-je l’adresser ?\n\nMalo — La Cabane à Malo (bar de la côte)'),
  msg('msg-amandine-planning', 'karim', 'facile', 'Amandine (chauffeur-livreur)', mailDe('amandine'), 'Ma tournée de jeudi',
    'Salut,\n\nJe n’ai pas reçu ma tournée de jeudi.\n\nAmandine'),
  msg('msg-attestation', 'ines', 'facile', 'Cariste de la plateforme', mailDe('cariste'), 'Attestation d’employeur',
    'Bonjour,\n\nIl me faut une attestation d’employeur pour mon logement. Merci !\n\nUn cariste de la plateforme'),
  msg('msg-brasserie-quai', 'nadia', 'facile', 'Brasserie de Mons-en-Barœul', 'expeditions@brasserie-mons.example', 'Livraison de mercredi',
    'Bonjour,\n\nNotre camion arrivera mercredi à 14 h : à quel quai doit-il se présenter ?\n\nLe service des expéditions — Brasserie de Mons-en-Barœul'),
  msg('msg-medecine', 'ines', 'facile', 'Service de santé au travail', 'secretariat@sante-travail.example', 'Visite médicale du 22 juin',
    'Bonjour,\n\nNous vous confirmons la visite médicale d’un de vos caristes le 22 juin.\n\nLe secrétariat du service de santé au travail'),
  msg('msg-rack', 'thomas', 'moyen', 'Préparateur de commandes', mailDe('preparation'), 'Allée B',
    'Salut,\n\nUne lisse de rack est pliée dans l’allée B.\n\nUn préparateur'),
  msg('msg-facture-consignes', 'ines', 'moyen', 'Restaurant client', 'gerance@restaurant-client.example', 'Votre facture',
    'Bonjour,\n\nVotre facture compte 3 fûts vides que nous vous avons pourtant rendus (la [[consigne]]).\n\nLa gérance du restaurant'),
  msg('msg-garage', 'karim', 'moyen', 'Garage poids lourds', 'atelier@garage-pl.example', 'Camion électrique n° 3',
    'Bonjour,\n\nLe camion électrique n° 3 sera prêt jeudi midi.\n\nL’atelier du garage poids lourds'),
  msg('msg-chauffeur-quai', 'nadia', 'moyen', 'Julien (chauffeur-livreur)', mailDe('julien'), 'Mon chargement de demain',
    'Salut,\n\nJe ne sais pas dans quel ordre charger mes palettes demain.\n\nJulien'),
  msg('msg-candidature', 'ines', 'difficile', 'Candidat chauffeur saisonnier', 'candidat.saisonnier@exemple-mail.example', 'Candidature',
    'Bonjour,\n\nVoici mon CV pour le poste de chauffeur saisonnier.\n\nUn candidat'),
  msg('msg-echange-conges', 'karim', 'difficile', 'Lucas (chauffeur-livreur)', mailDe('lucas'), 'Mes congés',
    'Salut,\n\nJe voudrais échanger ma semaine de congés avec Julien.\n\nLucas'),
  msg('msg-partir-tot', 'nadia', 'difficile', 'Préparateur de commandes', mailDe('preparation'), 'Vendredi',
    'Salut,\n\nEst-ce que je peux finir à 15 h vendredi ?\n\nUn préparateur'),
  msg('msg-journaliste', 'helene', 'difficile', 'Journaliste, quotidien local', 'redaction@quotidien-local.example', 'Un article sur la plateforme',
    'Bonjour,\n\nJe prépare un article sur votre première année à Buchelay.\n\nUn journaliste du quotidien local'),
];

// L'équité du socle (re-tirage sinon) : sans elle, « hiérarchique » coché partout ou « tout à Inès » rapporterait des points.
export function ecartsEquite(jeu) {
  const E = [];
  const L = (jeu.pieces && jeu.pieces.liens) || [];
  const h = L.filter((p) => p.attendu === H).length, f = L.filter((p) => p.attendu === F).length;
  if (h < 2) E.push(`liens : ${h} hiérarchique(s) dans le socle (2 au moins)`);
  if (f < 2) E.push(`liens : ${f} fonctionnel(s) dans le socle (2 au moins)`);
  const dest = new Set(((jeu.pieces && jeu.pieces.courrier) || []).map((p) => p.a));
  if (dest.size < 3) E.push(`courrier : ${dest.size} destinataire(s) différent(s) dans le socle (3 au moins)`);
  return E;
}

export const TIRAGE = declarerTirage({
  banques: {
    cases: { pieces: BANQUE_CASES, fixes: ['case-karim'], melange: { facile: 1, difficile: 1 },
      bonus: { confirme: { difficile: 1 } }, ordre: 'fixe' },
    liens: { pieces: BANQUE_LIENS, fixes: ['lien-karim-tournee'], melange: { facile: 1, moyen: 2, difficile: 1 },
      bonus: { confirme: { moyen: 1, difficile: 1 } }, ordre: 'melange' },
    courrier: { pieces: BANQUE_COURRIER, fixes: ['msg-malo'], melange: { facile: 1, moyen: 1, difficile: 1 },
      bonus: { confirme: { moyen: 1, difficile: 1 } }, ordre: 'melange' },
  },
  verifier: ecartsEquite,
});
TIRAGE.lier(ID);

// ─────────────────────────────────────────────────────────────── le jeu de l'élève, lu dans sa base

// Les cases vides (socle puis bonus) et leurs lettres : A, B, C (D) dans l'ORDRE DE LECTURE de l'organigramme (de haut
// en bas, puis de gauche à droite), pas dans l'ordre du tirage. → { poste: 'A', … }
export function lettresDe(db) {
  const vides = [...TIRAGE.piecesTirees(db, 'cases'), ...TIRAGE.piecesBonus(db, 'cases')].map((p) => p.poste);
  return Object.fromEntries(ORDRE_LECTURE.filter((p) => vides.includes(p)).map((p, i) => [p, 'ABCD'[i]]));
}
export const champCase = (lettre) => `case-${String(lettre).toLowerCase()}`;
// Les situations de la fiche, dans l'ordre de l'élève : le socle (ordre tiré) puis les cas bonus.
export const liensDe = (db) => [...TIRAGE.piecesTirees(db, 'liens'), ...TIRAGE.piecesBonus(db, 'liens')];
// Le courrier, dans l'ORDRE D'ARRIVÉE : Malo d'abord (pièce fixe), puis les messages tirés. Les cas bonus d'un confirmé
// s'intercalent (2e et 4e après Malo), pour que le DERNIER message soit toujours du socle : le premier bilan (et la fin
// de séance) tombe au dernier transfert, cas bonus compris.
export function courrierSocleDe(db) {
  const S = TIRAGE.piecesTirees(db, 'courrier');
  const malo = S.find((p) => p.id === 'msg-malo');
  return [malo, ...S.filter((p) => p.id !== 'msg-malo')].filter(Boolean);
}
export const courrierBonusDe = (db) => TIRAGE.piecesBonus(db, 'courrier');
export function courrierDe(db) {
  const [malo, a, b, c] = courrierSocleDe(db), [x, y] = courrierBonusDe(db);
  return [malo, a, x, b, y, c].filter(Boolean);
}

// Le jeu de l'élève pour les écrans (organigramme, fiche, jalons). `null` : le jeu « modèle » (contrôle au chargement).
export function jeuDe(db) {
  const rec = TIRAGE.tirage(db);
  return {
    graine: (rec && rec.graine) || 'modele',
    lettres: lettresDe(db),
    liens: liensDe(db),
    courrierSocle: courrierSocleDe(db).map((p) => p.id),
    courrierBonus: courrierBonusDe(db).map((p) => p.id),
  };
}
export function jeuModele() {
  const db = { tirages: { [ID]: TIRAGE.tirer(`modele|${ID}`) } };
  return jeuDe(db);
}

// À l'ouverture, AVANT que le moteur soit fabriqué : le tirage de l'élève est rangé dans sa base exactement comme le
// moteur le ferait (`TIRAGE.assurer`, même graine : identifiant + id de la séance ; même niveau : celui que le moteur
// fige dans `db.aisance`, règle recopiée de `core/types/entreprise.js`, `figerAisance`). Le moteur trouve ensuite le
// tirage déjà là et n'y touche pas. Rend le jeu de l'élève.
const NIVEAUX = ['standard', 'confirme', 'accompagne'];
export function jeuAOuverture(ctx) {
  const db = ctx.jeu.etat();
  const estProf = ctx.profil.role === 'prof';
  const prenom = ctx.profil.prenom || ctx.profil.nom || 'Élève';
  const aisance = db.aisancePour === ID && NIVEAUX.includes(db.aisance) ? db.aisance
    : (!estProf && NIVEAUX.includes(ctx.aisance) ? ctx.aisance : 'standard');
  if (TIRAGE.assurer(db, { uid: ctx.profil.uid || prenom, aisance, copie: false })) ctx.jeu.sauver();
  return jeuDe(db);
}

// ─────────────────────────────────────────────────────────────── les fiches

const NOMS = ORDRE_ANNUAIRE.map((id) => ({ v: id, lib: EQUIPE[id].nom }));
const melange = (graine, cle, L) => hasard(`${graine}|${ID}|${cle}`).melanger(L);

// Étape 0 — « Ce que j'ai vu » (vidéo projetée par le professeur). Aucun jalon : envoyer vide = passer. L'ordre des choix
// est tiré par élève (graine du tirage) et rangé avec lui.
export const QUESTIONS_VIDEO = [
  { id: 'haute', lib: 'En haute saison, combien de tournées partent de Buchelay chaque jour ?',
    choix: [['18', '18'], ['30', '30'], ['150', '150'], ['2300', '2 300']], juste: '30' },
  { id: 'basse', lib: 'Et en basse saison ?', choix: [['18', '18'], ['30', '30'], ['80', '80'], ['2300', '2 300']], juste: '18' },
  { id: 'objectif', lib: 'Quel est l’objectif prioritaire de la plateforme ?',
    choix: [['zero-accident', 'Zéro accident'], ['2-heures', 'Livrer en moins de 2 heures'], ['zero-carton', 'Zéro carton perdu']], juste: 'zero-accident' },
  { id: 'electriques', lib: 'Combien de camions électriques la vidéo annonce-t-elle ?', choix: [['2', '2'], ['10', '10'], ['35', '35']], juste: '10' },
];
export function ficheVu(graine) {
  return {
    id: VU, libelle: 'Ce que j’ai vu', titre: 'Ce que j’ai vu — la plateforme en vidéo',
    sousTitre: 'Ton professeur projette une vidéo d’1 min 30 sur la plateforme de Buchelay. Regarde-la, puis réponds. '
      + 'Si la vidéo ne passe pas, envoie la fiche vide : ce n’est pas noté.',
    bouton: 'Ouvrir la fiche « Ce que j’ai vu »',
    blocs: QUESTIONS_VIDEO.map((q) => ({ type: 'liste', id: q.id, lib: q.lib, vide: 'Choisir…',
      choix: melange(graine, `vu-${q.id}`, q.choix).map(([v, lib]) => ({ v, lib })) })),
    envoi: { bouton: 'Envoyer la fiche à Inès', a: 'Inès', suite: 'Inès va te répondre.', incomplet: true },
  };
}

// Étape 2 — « Qui fait quoi ? » : les cases vides (une liste par lettre), le chef de Lucas, les liens (oui = hiérarchique).
export const ENCADRE = 'Lien hiérarchique : ton chef. Il te donne ton travail, décide et valide tes demandes.\n'
  + 'Lien fonctionnel : un collègue d’un autre service qui t’aide, t’informe ou te donne une règle à suivre, sans être ton chef.';
export const CHOIX_CHEF = ['karim', 'nadia', 'ines', 'helene'];
export function ficheQui(jeu) {
  const lettres = Object.values(jeu.lettres).sort();
  return {
    id: QFQ, libelle: 'Qui fait quoi ?', titre: 'Qui fait quoi ? — la plateforme de Buchelay',
    sousTitre: 'L’organigramme et les fiches de chacun sont à gauche. Complète la fiche, puis envoie-la à Inès.',
    documents: ['organigramme', 'annuaire'],
    bouton: 'Ouvrir la fiche « Qui fait quoi ? »',
    blocs: [
      { type: 'encadre', titre: 'Hiérarchique ou fonctionnel ?', texte: `\n${ENCADRE}` },
      { type: 'cadre', titre: '1. Les cases vides de l’organigramme', consigne: 'Complète chaque case vide de l’organigramme.',
        blocs: lettres.map((l) => ({ type: 'liste', id: champCase(l), lib: `Case ${l}`, vide: 'Choisir…', manque: `la case ${l}`, choix: NOMS })) },
      { type: 'cadre', titre: '2. Le chef de Lucas', blocs: [
        { type: 'liste', id: 'chefLucas', lib: 'Lucas dépend hiérarchiquement de', vide: 'Choisir…', manque: 'le chef de Lucas',
          choix: melange(jeu.graine, 'chef', CHOIX_CHEF).map((id) => ({ v: id, lib: EQUIPE[id].nom })) }] },
      { type: 'cadre', titre: '3. Le lien est-il hiérarchique ?', consigne: 'Pour chaque situation : oui si le lien est hiérarchique, non s’il est fonctionnel.',
        blocs: [{ type: 'ouinon', id: 'liens', entete: 'Situation', manque: '{n} situation(s) sans réponse',
          colonnes: [{ id: H, lib: 'Lien hiérarchique ?' }], lignes: jeu.liens.map((p) => ({ id: p.id, lib: p.texte })) }] },
    ],
    envoi: { bouton: 'Envoyer la fiche à Inès', a: 'Inès', suite: 'Inès va te répondre.' },
  };
}

// ─────────────────────────────────────────────────────────────── les jalons (14 : 13 ici + la question du point d'étape)
// Poids validés par défaut (brief §5 et §11) : organigramme 5 (Karim 2, deux cases à 1,5), chef de Lucas 2, liens 5
// (cinq à 1), courrier 6 (quatre à 1,5), point d'étape 2 (`part` du fichier de questions). Total 20.
// Chaque jalon reste « à faire » jusqu'à l'envoi (fiche) ou au transfert (message) ; rien n'est vrai par inaction.
// Le jalon d'une case compare la réponse au POSTE de la case de l'élève (sa lettre vient du tirage), jamais à une lettre.
// Le courrier : le jalon juge le DERNIER destinataire (`a`) ; le premier bilan est figé par le moteur (`bilan1`).
export const GROUPES = { orga: 'L’organigramme', chef: 'Le chef de Lucas', liens: 'Hiérarchique ou fonctionnel', courrier: 'Le courrier du matin' };
const ECRAN_FICHE = `fiche:${QFQ}`;
const attente = { status: 'attente' };

function jugerCase(db, p) {
  const f = ficheEnvoyee(db, QFQ);
  if (!f.envoye) return attente;
  if (!p) throw new Error('case absente du tirage de l’élève');
  const v = f.valeurs[champCase(lettresDe(db)[p.poste])];
  return v === p.poste ? { status: 'ok' } : { status: 'ko', detail: v ? 'Faux.' : 'Case vide.' };
}
function jugerLien(db, p) {
  const f = ficheEnvoyee(db, QFQ);
  if (!f.envoye) return attente;
  if (!p) throw new Error('situation absente du tirage de l’élève');
  const r = f.valeurs.liens && f.valeurs.liens[p.id] && f.valeurs.liens[p.id][H];
  return r === (p.attendu === H) ? { status: 'ok' } : { status: 'ko' };
}
function jugerMessage(db, p) {
  if (!p) throw new Error('message absent du tirage de l’élève');
  const t = transfertDe(db, p.id, ID);
  if (!t.fait) return attente;
  return t.a === p.a ? { status: 'ok' } : { status: 'ko', detail: `Transféré à ${EQUIPE[t.a] ? EQUIPE[t.a].nom : t.a}.` };
}

// Les jalons pour CE jeu : seuls les écrans de « Corriger » des messages (`transfert:<clé>`) dépendent de l'élève.
export function etapesPour(jeu) {
  const J = jeu || jeuModele();
  const casesSocle = (db) => TIRAGE.piecesTirees(db, 'cases');
  return [
    { id: 'case-karim', titre: 'Organigramme : la case de Karim', groupe: GROUPES.orga, ecran: ECRAN_FICHE, poids: 2,
      verifier: (db) => jugerCase(db, casesSocle(db)[0]) },
    { id: 'case-2', titre: 'Organigramme : la première case tirée', groupe: GROUPES.orga, ecran: ECRAN_FICHE, poids: 1.5,
      verifier: (db) => jugerCase(db, casesSocle(db)[1]) },
    { id: 'case-3', titre: 'Organigramme : la seconde case tirée', groupe: GROUPES.orga, ecran: ECRAN_FICHE, poids: 1.5,
      verifier: (db) => jugerCase(db, casesSocle(db)[2]) },
    { id: 'chef-lucas', titre: 'Le chef de Lucas', groupe: GROUPES.chef, ecran: ECRAN_FICHE, poids: 2,
      verifier(db) {
        const f = ficheEnvoyee(db, QFQ);
        if (!f.envoye) return attente;
        return f.valeurs.chefLucas === 'karim' ? { status: 'ok' } : { status: 'ko' };
      } },
    ...[0, 1, 2, 3, 4].map((i) => ({ id: `lien-${i + 1}`, titre: `Lien n° ${i + 1} : hiérarchique ou fonctionnel`, groupe: GROUPES.liens,
      ecran: ECRAN_FICHE, poids: 1, verifier: (db) => jugerLien(db, TIRAGE.piecesTirees(db, 'liens')[i]) })),
    ...[0, 1, 2, 3].map((i) => ({ id: i ? `courrier-${i + 1}` : 'courrier-malo',
      titre: i ? `Courrier : le message tiré n° ${i}` : 'Courrier : le message de Malo', groupe: GROUPES.courrier,
      ecran: `transfert:${J.courrierSocle[i]}`, poids: 1.5, verifier: (db) => jugerMessage(db, courrierSocleDe(db)[i]) })),
    // Les cas bonus du confirmé : sans poids ni groupe, `null` quand l'élève ne les a pas reçus (caché à l'élève).
    { id: 'case-bonus', bonus: true, ecran: ECRAN_FICHE, titre: 'Organigramme : case en plus',
      verifier: (db) => { const p = TIRAGE.piecesBonus(db, 'cases')[0]; return p ? jugerCase(db, p) : null; } },
    ...[0, 1].map((i) => ({ id: `lien-bonus-${i + 1}`, bonus: true, ecran: ECRAN_FICHE, titre: `Lien en plus n° ${i + 1}`,
      verifier: (db) => { const p = TIRAGE.piecesBonus(db, 'liens')[i]; return p ? jugerLien(db, p) : null; } })),
    ...[0, 1].map((i) => ({ id: `courrier-bonus-${i + 1}`, bonus: true, titre: `Courrier : message en plus n° ${i + 1}`,
      ...(J.courrierBonus[i] ? { ecran: `transfert:${J.courrierBonus[i]}` } : {}),
      verifier: (db) => { const p = courrierBonusDe(db)[i]; return p ? jugerMessage(db, p) : null; } })),
  ];
}
// Les jalons « modèle » (exigés par la fabrique au chargement ; l'ouverture les remplace par ceux de l'élève).
export const ETAPES = etapesPour(null);

// ─────────────────────────────────────────────────────────────── les messages

const INES = { nom: EQUIPE.ines.nom, mail: mailDe('ines') };
const mail = (prenom, de, deMail, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decalage || 0), from: de, fromMail: deMail,
  to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const parId = new Map(BANQUE_COURRIER.map((p) => [p.id, p]));

// Un message du courrier, à transférer à l'une des six personnes de l'annuaire (dans l'ordre de l'annuaire).
const messageCourrier = (prenom, p, decalage = 1) => mail(prenom, p.de, p.deMail, p.sujet, p.texte,
  { decalage, extra: { cle: p.id, transfert: { a: ORDRE_ANNUAIRE } } });
// L'accusé de réception du destinataire CHOISI, juste ou faux : neutre, signé de lui (jamais « ce n'est pas pour moi »).
function accuse(cle, prenom, db) {
  const t = transfertDe(db, cle, ID), P = EQUIPE[t.a], p = parId.get(cle);
  if (!P || !p) return null;
  return { mails: [mail(prenom, P.nom, mailDe(t.a), `TR : ${p.sujet}`, `Bien reçu, merci.\n\n${P.nom}`)] };
}
// Le point d'étape répondu (juste ou faux) : le courrier peut commencer.
const pointDEtapeFait = (db) => {
  const r = db && db.questions && db.questions[ID] && db.questions[ID]['qui-decide-conges'];
  return !!(r && r.premiere != null);
};

export const SUJET_ACCUEIL = 'Bienvenue à Buchelay';
export const VOLET = {
  id: 'fb-ent61',
  semer: (prenom) => ({ mails: [mail(prenom, INES.nom, INES.mail, SUJET_ACCUEIL,
    `Bonjour ${prenom}, bienvenue à Buchelay !\n\n`
      + 'Ce matin, tu tiens l’accueil avec moi : avant tout, regarde l’[[organigramme]] de la plateforme et les fiches de chacun (en pièces jointes).\n\n'
      + 'Complète la fiche « Qui fait quoi ? » et renvoie-la-moi. Ensuite, je te confie le courrier du matin.\n\nInès',
    { decalage: -60000, extra: { pieces: ['organigramme', 'annuaire'], ouvreFiche: QFQ } })] }),
  declencheurs: [
    // La fiche vidéo envoyée (même vide) : les bonnes réponses, sans note.
    { id: 'vu', quand: apresFiche(VU), semer: (prenom) => ({ mails: [mail(prenom, INES.nom, INES.mail, 'RE : Ce que j’ai vu',
      'Merci ! Pour retenir : 30 tournées par jour en haute saison, 18 en basse saison, zéro accident comme objectif prioritaire, '
        + '10 camions électriques. On en reparle cette semaine.\n\nInès')] }) },
    // Les accusés de réception, un par message de la banque (seuls ceux de l'élève arrivent : au transfert).
    ...BANQUE_COURRIER.map((p) => ({ id: `accuse-${p.id}`, quand: apresTransfert(p.id), semer: (prenom, db) => accuse(p.id, prenom, db) })),
    // Le courrier commence après le point d'étape (réponse juste ou fausse) : Inès part en réunion, Malo écrit.
    { id: 'courrier-1', quand: pointDEtapeFait, semer: (prenom, db) => ({ mails: [
      mail(prenom, INES.nom, INES.mail, 'Le courrier du matin',
        'Je pars en réunion avec Hélène. Le courrier du matin arrive dans ta messagerie : [[transférer|transfère]] chaque message '
          + 'à la personne qui doit s’en occuper (« Transférer à… », sous le message).\n\nInès'),
      messageCourrier(prenom, courrierDe(db)[0], 2)] }) },
    // Chaque message suivant arrive après le transfert du précédent, quel que soit le destinataire.
    ...[2, 3, 4, 5, 6].map((k) => ({ id: `courrier-${k}`,
      quand: (db, s) => { const L = courrierDe(db); return !!L[k - 1] && apresTransfert(L[k - 2].id)(db, s); },
      semer: (prenom, db) => ({ mails: [messageCourrier(prenom, courrierDe(db)[k - 1], 2)] }) })),
    // Tout le courrier transféré : la fin de la matinée, et la transition vers ENT-6.2.
    { id: 'fin', quand: (db, s) => { const L = courrierDe(db); return L.length > 0 && L.every((p) => apresTransfert(p.id)(db, s)); },
      semer: (prenom) => ({ mails: [mail(prenom, INES.nom, INES.mail, 'Merci pour ce matin',
        'Merci pour ce matin ! Demain, tu commences avec moi : un bar de la côte, La Cabane à Malo, va nous envoyer sa commande.\n\nInès', { decalage: 3 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: {
    [QFQ]: (prenom) => ({ mails: [mail(prenom, INES.nom, INES.mail, 'RE : Qui fait quoi ?', `Merci ${prenom}, j’ai bien reçu ta fiche corrigée.\n\nInès`)] }),
    ...Object.fromEntries(BANQUE_COURRIER.map((p) => [p.id, (prenom, n, db) => accuse(p.id, prenom, db)])),
  },
};

// ─────────────────────────────────────────────────────────────── l'accueil

export const LEXIQUE = LEXIQUE_FB;
export const ACCUEIL = {
  titre: 'Bienvenue à Buchelay : qui fait quoi',
  kpis: ['mail'],
  etapes: [
    ['La plateforme en vidéo', 'Ton professeur projette une vidéo d’1 min 30 sur la plateforme de Buchelay. Regarde-la, puis réponds aux questions '
      + 'de la fiche « Ce que j’ai vu » (menu). Si la vidéo ne passe pas, envoie la fiche vide : ce n’est pas noté.'],
    ['Lire le message d’Inès', 'Menu Messagerie : l’[[organigramme]] de la plateforme et les fiches de chacun sont joints.'],
    ['Remplir la fiche « Qui fait quoi ? »', 'Complète chaque case vide de l’organigramme, puis réponds aux autres questions et envoie la fiche à Inès.'],
    ['Le courrier du matin', 'Les messages arrivent dans la Messagerie : transfère chacun à la personne qui doit s’en occuper (« Transférer à… »).'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance, pour un jeu

// Le document « organigramme » de l'élève : l'organigramme commun, avec SES cases vides.
export const organigrammeEleve = (jeu) => ({ id: 'organigramme', titre: 'Organigramme simplifié de la plateforme', court: 'Organigramme',
  html: organigrammeHtml({ vides: jeu.lettres }) });

export function optionsPour(jeu) {
  const J = jeu || jeuModele();
  return {
    menu: [],
    exercice: 'Séance 1 : bienvenue à Buchelay',
    sansTrame: 'Tout se fait à l’écran',
    lexique: LEXIQUE,
    equipe: EQUIPE,
    questions: QUESTIONS,
    documents: [organigrammeEleve(J), DOC_ANNUAIRE],
    documentsStyle: STYLE_DOCUMENTS,
    fiches: [ficheVu(J.graine), ficheQui(J)],
    etapes: etapesPour(J),
  };
}
