// Corrigé d'ENT-6.1 (France Boissons, bienvenue à Buchelay), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/france-boissons-ent61.js`, §6 bis du brief) : ses cases vides, ses situations,
// son courrier. `CORRIGE` donne ce qui est commun (vidéo, fiche « Ce que j'ai vu », organigramme complet, banques et
// barème) ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, calculé depuis sa base (jamais recopié), cas bonus du
// confirmé marqués « bonus ». Un élève qui n'a pas encore ouvert la séance : son tirage standard se calcule quand même
// (graine = son identifiant + l'id de la séance).

import { EQUIPE, ORDRE_ANNUAIRE, FICHES_QUI } from '../france-boissons.js';
import { ID, TIRAGE, BANQUE_CASES, BANQUE_LIENS, BANQUE_COURRIER, QUESTIONS_VIDEO, lettresDe, courrierSocleDe, courrierBonusDe,
  ETAPES } from '../france-boissons-ent61.js';

const nom = (id) => (EQUIPE[id] ? EQUIPE[id].nom : id);
const attenduLien = (p) => (p.attendu === 'hierarchique' ? 'Hiérarchique (oui)' : 'Fonctionnel (non)');
const diff = (p) => p.difficulte || 'fixe';
const VIDEO = 'https://www.youtube.com/watch?v=LRa0qgI7Weo';

export const CORRIGE = {
  code: 'ENT-6.1',
  titre: 'France Boissons — bienvenue à Buchelay',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran)',
  items: [
    { etape: 0, etapeTitre: 'La plateforme en vidéo (non notée)', genre: 'fait', texte: 'La vidéo à projeter',
      rep: `« Présentation de la Plateforme de France Boissons à Buchelay », Grand Paris Seine & Oise, YouTube, 20/06/2025 : ${VIDEO} (environ 1 min 30).`,
      note: 'Elle n’est pas dans le site (aucune requête hors du domaine) : la projeter depuis YouTube avant la séance. '
        + 'Minutage détaillé : relevé image par image de Cowork (fiche « prepalog-fb-video-buchelay »), non copié dans le dépôt. '
        + 'Si la vidéo ne passe pas, les élèves envoient la fiche vide : rien n’est noté, la suite n’en dépend pas.' },
    { etape: 0, etapeTitre: 'La plateforme en vidéo (non notée)', genre: 'tableau', texte: 'Fiche « Ce que j’ai vu » : les réponses',
      contexte: 'Ordre des choix tiré par élève. À l’envoi, Inès redonne les bonnes réponses (formatif, aucun jalon).',
      entetes: ['Question', 'Réponse'],
      reponses: QUESTIONS_VIDEO.map((q) => [q.lib, q.choix.find(([v]) => v === q.juste)[1]]) },
    { etape: 1, etapeTitre: 'L’organigramme et l’annuaire', genre: 'tableau', texte: 'L’organigramme complet (construit)',
      contexte: 'Traits pleins = lien hiérarchique ; pointillés = lien fonctionnel (Inès ↔ tous les services ; Nadia ↔ chauffeurs, ordre de chargement).',
      entetes: ['Personne', 'Poste', 'Rend compte à', 'Dirige'],
      reponses: ORDRE_ANNUAIRE.map((id) => [nom(id), EQUIPE[id].role, FICHES_QUI[id].rend, FICHES_QUI[id].dirige]) },
    { etape: 2, etapeTitre: 'La fiche « Qui fait quoi ? »', genre: 'tableau', texte: 'Les cases vides possibles',
      contexte: 'Chaque élève : la case de Karim, une facile et une difficile (un confirmé : une difficile de plus). Lettres A, B, C (D) dans l’ordre de lecture (de haut en bas, puis de gauche à droite).',
      entetes: ['Case', 'Réponse', 'Difficulté'],
      reponses: BANQUE_CASES.map((p) => [`case de ${nom(p.poste)}`, nom(p.poste), diff(p)]) },
    { etape: 2, etapeTitre: 'La fiche « Qui fait quoi ? »', genre: 'question', texte: 'Lucas dépend hiérarchiquement de…', rep: 'Karim.' },
    { etape: 2, etapeTitre: 'La fiche « Qui fait quoi ? »', genre: 'tableau', texte: 'Le lien est-il hiérarchique ? (banque)',
      contexte: 'Chaque élève : la situation fixe, 1 facile, 2 moyennes, 1 difficile, au moins 2 hiérarchiques et 2 fonctionnelles (un confirmé : 1 moyenne et 1 difficile de plus).',
      entetes: ['Situation', 'Réponse', 'Difficulté'],
      reponses: BANQUE_LIENS.map((p) => [p.texte, attenduLien(p), diff(p)]) },
    { etape: 3, etapeTitre: 'Point d’étape avec Inès (noté, 2 points)', genre: 'question',
      texte: 'À qui transmettre la demande de congés de Lucas pour qu’elle soit décidée ?',
      rep: 'Karim : son chef décide (il connaît les tournées) ; Inès enregistre le congé une fois décidé (lien fonctionnel).' },
    { etape: 4, etapeTitre: 'Le courrier du matin', genre: 'tableau', texte: 'Les messages possibles et leur destinataire',
      contexte: 'Chaque élève : Malo d’abord, puis 1 facile, 1 moyen, 1 difficile, au moins 3 destinataires différents (un confirmé : 1 moyen et 1 difficile de plus, intercalés).',
      entetes: ['De', 'Le message', 'Transférer à', 'Difficulté'],
      reponses: BANQUE_COURRIER.map((p) => [p.de, p.texte.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (m, a, b) => b || a).split('\n\n')[1] || '', nom(p.a), diff(p)]) },
    { etape: 4, etapeTitre: 'Le courrier du matin', genre: 'reflexion', texte: 'Question de Karim au premier transfert (non notée) : pourquoi ne pas tout envoyer à Hélène ?',
      pistes: ['Hélène serait débordée : chaque service traite ce qui le concerne.', 'Elle ne connaît pas le détail des tournées ou du quai.',
        'On ne dérange la directrice que pour ce qu’elle seule peut décider.'] },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Sur 20 : l’organigramme 5 (case de Karim 2, deux cases tirées à 1,5), le chef de Lucas 2, hiérarchique ou fonctionnel 5 (cinq situations à 1), le courrier 6 (quatre messages à 1,5, jugés sur le destinataire), le point d’étape 2.',
      note: 'Règle du premier bilan : « Corriger » rouvre la fiche et les seuls messages mal transférés ; la note devient la moyenne du premier bilan et de l’état à la première correction. Cas bonus du confirmé : +0,5 par cas juste, 2 au plus, caché à l’élève.' },
  ],
};

// Le corrigé d'un élève : ses cases (lettre → personne attendue), ses situations, son courrier dans l'ordre d'arrivée.
export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } };
  const L = lettresDe(db);
  const parLettre = (P) => P.map((p) => [`Case ${L[p.poste]}`, nom(p.poste), diff(p)]).sort((a, b) => a[0].localeCompare(b[0]));
  const items = [
    { genre: 'tableau', texte: 'Ses cases vides', entetes: ['Case', 'Réponse attendue', 'Difficulté'], reponses: parLettre(TIRAGE.piecesTirees(db, 'cases')) },
  ];
  const cb = TIRAGE.piecesBonus(db, 'cases');
  if (cb.length) items.push({ genre: 'tableau', bonus: true, texte: 'Case en plus', entetes: ['Case', 'Réponse attendue', 'Difficulté'], reponses: parLettre(cb) });
  items.push({ genre: 'tableau', texte: 'Ses situations (dans l’ordre de sa fiche)', entetes: ['Situation', 'Réponse attendue', 'Difficulté'],
    reponses: TIRAGE.piecesTirees(db, 'liens').map((p) => [p.texte, attenduLien(p), diff(p)]) });
  const lb = TIRAGE.piecesBonus(db, 'liens');
  if (lb.length) items.push({ genre: 'tableau', bonus: true, texte: 'Situations en plus (en fin de tableau)', entetes: ['Situation', 'Réponse attendue', 'Difficulté'],
    reponses: lb.map((p) => [p.texte, attenduLien(p), diff(p)]) });
  items.push({ genre: 'tableau', texte: 'Son courrier', entetes: ['De', 'Objet', 'Transférer à', 'Difficulté'],
    reponses: courrierSocleDe(db).map((p) => [p.de, p.sujet, nom(p.a), diff(p)]) });
  const mb = courrierBonusDe(db);
  if (mb.length) items.push({ genre: 'tableau', bonus: true, texte: 'Messages en plus (arrivés en 3e et 5e position)', entetes: ['De', 'Objet', 'Transférer à', 'Difficulté'],
    reponses: mb.map((p) => [p.de, p.sujet, nom(p.a), diff(p)]) });
  if (!ouvert) {
    return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une case, deux situations et deux messages).', items };
  }
  const etat = ETAPES.filter((e) => !e.bonus).map((e) => {
    let r = { status: 'ko' };
    try { r = e.verifier(db) || r; } catch (x) { r = { status: 'erreur' }; }
    return [e.titre, r.status === 'ok' ? '✓ juste' : r.status === 'attente' ? '— pas fait' : r.status === 'erreur' ? '⚠ erreur' : '✗ faux'];
  });
  items.push({ genre: 'tableau', texte: 'Ce qu’il a fait, jalon par jalon (état actuel)', entetes: ['Jalon', ''], reponses: etat,
    note: 'La question du point d’étape n’est pas dans ce tableau : sa réponse est dans « Conduite de séance ». La note du suivi suit la règle du premier bilan.' });
  return { texte: 'Le tirage de cet élève (cas bonus d’un confirmé marqués « bonus »).', items };
}
