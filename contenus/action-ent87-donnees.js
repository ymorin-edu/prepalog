// ENT-8.7 — Action, « on décharge ensemble » : les DONNÉES PURES de la séance (brief `docs/briefs/ENT-8.7-action-decharger.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-action.md` §8). Aucun effet de bord à l'import, sauf le CONTRÔLE du contenu (il lève une erreur en clair si
// une situation du protocole a deux consignes qui s'appliquent, ou si un texte de la fiche n'est pas dans le protocole). Importé par le contenu
// (`contenus/action-ent87.js`), les questions (`contenus/questions/ENT-8.7.js`) et le corrigé (`contenus/corriges/ENT-8.7.js`).
//
// VÉRIFIÉ / CONSTRUIT (brief §2) :
//   Vérifié (Cowork, 15 et 16/10/2026) : Action, l'entrepôt d'Ensuès-la-Redonne exploité par Geodis, le hub d'import du Havre. Textes de loi : voir
//   `DOC_DROIT_QUAI` dans `contenus/action.js` (recopiés sur Légifrance le 17/10/2026).
//   CONSTRUIT (dit dans la séance) : le protocole du quai 2 (reconstitué d'après l'article R4515-6, consignes et valeurs inventées : 10 km/h, local
//   chauffeurs, CACES R489 catégorie 3, poste d'urgence, point de rassemblement), le transporteur « Transports Seine-Provence » (nom déjà écrit sur
//   la lettre de voiture d'ENT-8.2), le chauffeur Marc, le chargement du camion (`CAMION_HAVRE`), la scène du quai et les cases de dépose. Les
//   gestes de quai (cale, clés, niveleur, lampe, butoirs) sont la pratique courante, sans source officielle relue sur ces gestes précis.
//   Les textes du protocole, du dialogue, des réponses de Samia et des situations sont ceux de Cowork (brief §4, §6.1, §6.2, §6 bis), tels quels ;
//   les choix « autres consignes » de chaque situation sont posés par Claude Code (le brief dit seulement « 2 ou 3 autres consignes du même
//   protocole ») : à relire à l'écran.

import { declarerTirage, hasard } from '../core/tirage.js';
import { CAMION_HAVRE } from './action.js';

export const ID = 'action-decharger';
export const ID_VOLET = 'action-ent87';
export const QUAI_ID = 'action-quai2-decharger';   // un id de quai par séance (COORDINATION §8.2 n° 2) : `db.quais` n'est pas cloisonné par séance
export const FICHE_ID = 'protocole';
export const DIALOGUE = 'marc';

// ─────────────────────────────────────────────────────────────── les consignes du protocole du quai 2 (texte du brief §6.1, une phrase par ligne)
// `applique` : les situations de la banque auxquelles la consigne S'APPLIQUE (table écrite à la main ; elle sert au contrôle : une seule
// consigne qui s'applique parmi les choix d'une situation). Une consigne qui « s'applique aussi un peu » est déclarée, pour qu'on ne la propose
// jamais en piège à cette situation (ex. « le chauffeur attend au local » pour « le chauffeur veut aider »).
export const CONSIGNES = {
  'c-epi': { rub: 'securite', texte: 'Gilet haute visibilité et chaussures de sécurité pour toute personne sur le quai, chauffeur compris.', applique: ['s-gilet'] },
  'c-immobile': { rub: 'securite', texte: 'Camion à quai : moteur coupé, clés remises au réceptionnaire, cale posée.', applique: ['s-partir'] },
  'c-entrer': { rub: 'securite', texte: 'Personne n’entre dans la remorque avant que le niveleur soit posé et la lampe de quai allumée.', applique: [] },
  'c-gerbage': { rub: 'securite', texte: 'Pas de gerbage en zone de réception.', applique: [] },
  'c-vitesse': { rub: 'acces', texte: 'Vitesse 10 km/h dans la cour.', applique: ['s-vitesse'] },
  'c-butoirs': { rub: 'acces', texte: 'Marche arrière jusqu’aux butoirs.', applique: [] },
  'c-pietons': { rub: 'acces', texte: 'Les piétons ne passent que par l’allée piétonne.', applique: ['s-pieton'] },
  'c-attente': { rub: 'acces', texte: 'Le chauffeur attend au local chauffeurs pendant le déchargement et le contrôle.', applique: ['s-partir', 's-aider', 's-gilet'] },
  'c-depart': { rub: 'acces', texte: 'Le chauffeur ne repart qu’après la signature des documents.', applique: ['s-partir'] },
  'c-chariot': { rub: 'engins', texte: 'Chariot élévateur frontal, conduit par un cariste titulaire du CACES R489 catégorie 3 et autorisé par Geodis.', applique: ['s-aider'] },
  'c-chauffeur': { rub: 'engins', texte: 'Le chauffeur ne décharge pas.', applique: ['s-aider'] },
  'c-sst': { rub: 'secours', texte: 'Accident : prévenir le sauveteur secouriste du travail (SST) de l’équipe et la cheffe d’équipe.', applique: ['s-blesse'] },
  'c-urgence': { rub: 'secours', texte: 'Numéro d’urgence interne : poste 500.', applique: ['s-blesse'] },
  'c-trousse': { rub: 'secours', texte: 'Trousse de secours au bureau de la réception.', applique: ['s-blesse'] },
  'c-rassemblement': { rub: 'secours', texte: 'Évacuation : point de rassemblement, devant le poste de garde.', applique: [] },
  'c-responsable': { rub: 'responsable', texte: 'Samia, cheffe d’équipe réception.', applique: ['s-responsable', 's-aerosols'] },
  'c-aerosols': { rub: 'produits', texte: 'Marchandises non alimentaires d’Action. Aérosols (produits inflammables) : le transporteur le signale, la cheffe d’équipe décide des précautions.', applique: ['s-aerosols'] },
};
const ids = (rub) => Object.keys(CONSIGNES).filter((k) => CONSIGNES[k].rub === rub).map((id) => ({ id, texte: CONSIGNES[id].texte }));

// La spec du protocole du quai 2 d'Ensuès (forme : en-tête de `protocoleSecurite`, `contenus/action.js`). Tout est CONSTRUIT.
export const SPEC_PROTOCOLE = {
  exploitant: 'Geodis',
  site: 'centre de distribution Action, Ensuès-la-Redonne',
  quai: 2, quais: 4, vitesse: 10,
  transporteur: 'Transports Seine-Provence',
  provenance: 'livraisons répétitives du hub d’import du Havre',
  etabli: 'Établi avant la première livraison, entre Geodis et le transporteur.',
  consignes: {
    securite: ids('securite'), acces: ids('acces'), engins: ids('engins'), secours: ids('secours'),
    responsable: { id: 'c-responsable', texte: CONSIGNES['c-responsable'].texte }, produits: ids('produits'),
  },
  signatures: [{ pour: 'Geodis', qui: 'le responsable du site' }, { pour: 'Transports Seine-Provence', qui: 'la gérante' }],
};

// ─────────────────────────────────────────────────────────────── la banque « situations » (brief §6 bis ; JAMAIS de pièce supprimée ni renumérotée)
// `juste` : la consigne qui s'applique ; `choix` : la juste et 2 ou 3 autres consignes du MÊME protocole (l'ordre affiché est mélangé par élève).
export const BANQUE_SITUATIONS = [
  { id: 's-pieton', difficulte: 'facile', texte: 'Un collègue à pied traverse devant le quai pendant que Kevin décharge.', juste: 'c-pietons', choix: ['c-pietons', 'c-vitesse', 'c-gerbage'] },
  { id: 's-aider', difficulte: 'facile', texte: 'Le chauffeur propose d’aider Kevin avec son transpalette.', juste: 'c-chauffeur', choix: ['c-chauffeur', 'c-pietons', 'c-gerbage'] },
  { id: 's-vitesse', difficulte: 'facile', texte: 'Un camion entre dans la cour à vive allure.', juste: 'c-vitesse', choix: ['c-vitesse', 'c-butoirs', 'c-epi'] },
  { id: 's-partir', difficulte: 'moyen', texte: 'Le chauffeur veut repartir avant la fin du contrôle.', juste: 'c-depart', choix: ['c-depart', 'c-vitesse', 'c-chauffeur', 'c-gerbage'] },
  { id: 's-blesse', difficulte: 'moyen', texte: 'Kevin se coince la main en descendant du chariot.', juste: 'c-sst', choix: ['c-sst', 'c-chariot', 'c-epi', 'c-gerbage'] },
  { id: 's-gilet', difficulte: 'moyen', texte: 'Le chauffeur descend de sa cabine sans gilet.', juste: 'c-epi', choix: ['c-epi', 'c-vitesse', 'c-chauffeur', 'c-butoirs'] },
  { id: 's-responsable', difficulte: 'difficile', texte: 'Le chauffeur demande qui commande le quai.', juste: 'c-responsable', choix: ['c-responsable', 'c-chariot', 'c-chauffeur', 'c-vitesse'] },
  { id: 's-aerosols', difficulte: 'difficile', texte: 'Le chauffeur dit qu’une palette contient des aérosols.', juste: 'c-aerosols', choix: ['c-aerosols', 'c-gerbage', 'c-epi', 'c-chariot'] },
];
// La ligne fixe « qui décharge » (rubrique 3 du protocole).
export const ENGIN = { id: 'engin', lib: 'Qui décharge le camion du Havre, et avec quoi ?', juste: 'kevin-frontal',
  choix: [{ v: 'kevin-frontal', lib: 'Kevin, cariste, au chariot élévateur frontal' }, { v: 'moi-frontal', lib: 'toi, au chariot élévateur frontal' },
    { v: 'chauffeur-transpalette', lib: 'le chauffeur, au transpalette' }, { v: 'moi-gerbeur', lib: 'toi, au gerbeur' }] };

// LE CONTRÔLE du contenu (la séance refuse de s'ouvrir s'il rend quelque chose) : chaque situation a 3 ou 4 choix distincts, tous des consignes du
// protocole, sa consigne juste parmi eux, et UNE SEULE consigne de ses choix qui s'applique au cas (la juste).
export function ecartsSituations(B = BANQUE_SITUATIONS, C = CONSIGNES) {
  const E = [];
  B.forEach((s) => {
    if (!Array.isArray(s.choix) || s.choix.length < 3 || s.choix.length > 4) E.push(`${s.id} : ${s.choix && s.choix.length} choix au lieu de 3 ou 4`);
    if (new Set(s.choix).size !== s.choix.length) E.push(`${s.id} : deux choix identiques`);
    s.choix.forEach((c) => { if (!C[c]) E.push(`${s.id} : la consigne « ${c} » n’est pas dans le protocole`); });
    if (!s.choix.includes(s.juste)) E.push(`${s.id} : la consigne juste n’est pas parmi les choix`);
    const sapplique = s.choix.filter((c) => C[c] && C[c].applique.includes(s.id));
    if (sapplique.length !== 1 || sapplique[0] !== s.juste) E.push(`${s.id} : ${sapplique.length} consigne(s) qui s’appliquent parmi les choix (${sapplique.join(', ')}) au lieu de la seule juste`);
  });
  return E;
}
{ const E = ecartsSituations(); if (E.length) throw new Error(`ENT-8.7 : la fiche du protocole ne tient pas — ${E.join(' ; ')}`); }

export const TIRAGE = declarerTirage({
  banques: { situations: { pieces: BANQUE_SITUATIONS, melange: { facile: 1, moyen: 1, difficile: 1 }, bonus: { confirme: { moyen: 1 } }, ordre: 'melange' } },
});
TIRAGE.lier(ID);
const parId = (id) => BANQUE_SITUATIONS.find((p) => p.id === id);
// Sans tirage (base vide au chargement, enseignant) : la première de chaque difficulté.
export const DEFAUT_SITUATIONS = ['s-pieton', 's-partir', 's-responsable'];
export const situationsDe = (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, 'situations') : DEFAUT_SITUATIONS.map(parId));
export const situationsBonus = (db) => TIRAGE.piecesBonus(db, 'situations');
const graineTirage = (db) => { const r = TIRAGE.tirage(db); return r ? r.graine : ''; };
// L'ordre des choix d'une ligne, tiré par élève (graine du tirage + ligne), rangé nulle part : il se recalcule pareil à chaque dessin.
export const melangerPour = (db, quoi, L) => (graineTirage(db) ? hasard(`${graineTirage(db)}|${quoi}`).melanger(L) : L.slice());
export const choixDe = (s) => s.choix.map((c) => ({ v: c, lib: CONSIGNES[c].texte }));

// ─────────────────────────────────────────────────────────────── l'inspection sur la scène (brief §4 étape 3, §6 bis « anomalies »)
// Les cinq objets de la vue, leur état sûr, leur état dangereux, la réponse de Samia (point par point, texte du brief) et les `lib` du bilan.
export const OBJETS = {
  cabine: { sur: 'vide', danger: 'conduite', libOk: 'Cabine vide, moteur coupé', libKo: 'Chauffeur au volant, moteur allumé',
    repare: 'Bien vu : je fais couper le moteur, Marc me donne ses clés et va au local.' },
  cale: { sur: 'posee', danger: 'absente', libOk: 'Cale de roue posée', libKo: 'Cale de roue absente', repare: 'Bien vu : je fais poser la cale.' },
  butoirs: { sur: 'enPlace', danger: 'absents', libOk: 'Butoirs de quai en place', libKo: 'Butoirs de quai absents',
    repare: 'Bien vu : on ne décharge pas à ce quai sans butoirs, je préviens la maintenance… et je les fais remettre.' },
  niveleur: { sur: 'pose', danger: 'releve', libOk: 'Niveleur posé', libKo: 'Niveleur relevé, pas posé sur la remorque', repare: 'Bien vu : je pose le niveleur.' },
  lampe: { sur: 'allumee', danger: 'eteinte', libOk: 'Lampe de quai allumée', libKo: 'Lampe de quai éteinte', repare: 'Bien vu : j’allume la lampe de quai.' },
};
// Le socle : UNE anomalie parmi les quatre premières (brief §6 bis : facile ou moyen, même valeur au bilan). Tirée de la GRAINE de la base
// (`db.tirage.graine`, l'identifiant de l'élève, posée par le moteur) parce que le quai est une fonction de la graine (`quai: (graine, …) => …`,
// comme ENT-4.4). ⚠ Ne pas changer cette liste ni la formule pendant qu'une classe joue la séance (l'anomalie des élèves changerait).
export const ANOMALIES_SOCLE = ['cabine', 'cale', 'niveleur', 'lampe'];
export const anomalieDe = (graine) => hasard(`${graine == null ? '' : graine}|${ID}|anomalie`).choisir(ANOMALIES_SOCLE);
// LE BONUS DU CONFIRMÉ (lot 4, 17/10/2026, brief §6 bis) : une 2e anomalie parmi les autres objets (butoirs compris), tirée de la graine aussi,
// à part du socle (le socle d'un confirmé est celui d'un standard de même graine). Jalon `bonus-danger` (`bonus: true`), sans effet sur la note du socle.
export const anomalieBonusDe = (graine) => {
  const socle = anomalieDe(graine);
  return hasard(`${graine == null ? '' : graine}|${ID}|anomalie-bonus`).choisir(Object.keys(OBJETS).filter((o) => o !== socle));
};
// La vue où se trouve chaque objet (pour la consigne de l'accompagné : elle nomme la VUE, jamais l'objet — décision 9 de Tristan, brief §6 bis).
export const VUE_DE = { cabine: 'dehors', cale: 'dehors', butoirs: 'dehors', niveleur: 'dedans', lampe: 'dedans' };
export const REGARDE = { dehors: 'Regarde dehors.', dedans: 'Regarde dedans, porte ouverte.' };

export const SAMIA_QUAI = 'Kevin est prêt. Avant qu’il entre dans le camion, regarde le quai et le camion. Si quelque chose ne va pas, signale-le-moi.';
// La scène : le socle `anomalie` en danger ; `bonus` (confirmé) : un 2e objet en danger ; `niveau` 'accompagne' : la consigne dit où regarder.
export function securiteDe(anomalie, { bonus = null, niveau = 'standard' } = {}) {
  const dangers = [anomalie].concat(bonus ? [bonus] : []);
  return {
    mode: 'scene',
    consigne: niveau === 'accompagne' ? `${SAMIA_QUAI} ${REGARDE[VUE_DE[anomalie]]}` : SAMIA_QUAI,
    points: Object.entries(OBJETS).map(([objet, o]) => (dangers.includes(objet)
      ? { id: objet, objet, etat: o.danger, ok: false, lib: o.libKo, repare: o.repare }
      : { id: objet, objet, etat: o.sur, ok: true, lib: o.libOk, repare: o.repare })),
    signaler: { qui: 'Samia', rien: 'Là, je ne vois rien qui cloche.' },
  };
}

// ─────────────────────────────────────────────────────────────── le camion du Havre et la dépose dirigée (variante A, COORDINATION §8.2 n° 1)
// Les 4 palettes de `CAMION_HAVRE` (pièce fixe partagée avec ENT-8.8), en palettes de cartons du quai : couches × cartons par couche = W × D × L
// (ENT-8.7 n'en montre que l'aspect : aucune n'est contrôlée ici).
const DIMS = { 8: [4, 2], 6: [3, 2], 5: [5, 1] };
export const PALETTES = CAMION_HAVRE.palettes.map((p, i) => {
  const [W, D] = DIMS[p.parCouche];
  return { id: p.id, ref: p.ref, nom: p.designation, bl: p.cartons, W, D, L: p.couches, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: p.ref, nom: p.designation.toUpperCase(), poids: '1 carton', lot: `HAV-0911-${i + 1}` } };
});
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne', reaction: 'Là, c’est l’allée piétonne : je ne pose pas ici.' },
  { id: 'R1' }, { id: 'R2' }, { id: 'R3' }, { id: 'R4' },
  { id: 'quai3-1', sol: 'autre-quai', legende: 'Quai 3', peinte: false, nom: 'Devant le quai 3', reaction: 'Ça, c’est la zone du quai 3.' }] };
export const TEXTE_ARRET = 'Les 4 palettes sont en zone de réception. Le contrôle, c’est la prochaine fois.';

export function quaiDuTirage(anomalie, { bonus = null, niveau = 'standard' } = {}) {
  return {
    id: QUAI_ID, rendu: 'iso', froid: false,
    titre: 'Entrepôt Action — Geodis, Ensuès-la-Redonne (13) — Quai 2, réception',
    destinataire: 'Entrepôt Action — Geodis, Ensuès-la-Redonne',
    avertissement: 'Réels : Action et Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action). Le quai est un <b>dessin construit</b> : '
      + 'ce n’est pas le vrai quai. Le camion, son chargement, Marc, Kevin et les cases de dépose sont <b>construits pour l’exercice</b>.',
    lieu: { nom: 'Quai 2', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    document: 'Bon de livraison — lettre de voiture',
    recommencer: false,
    aides: { consignes: true },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Kevin' },
    securite: securiteDe(anomalie, { bonus, niveau }),
    depose: JSON.parse(JSON.stringify(DEPOSE)),
    arret: { etape: 'dechargement', texte: TEXTE_ARRET },
    camions: [{
      transporteur: CAMION_HAVRE.transporteur, fournisseur: 'Hub d’import Action (Le Havre)', bl: 'HAV-0911-02', arrivee: '07:00',
      parole: 'Je vous laisse les documents du camion.',
      // Une copie : le moteur ne doit jamais modifier les palettes que lisent le corrigé et les tests.
      palettes: JSON.parse(JSON.stringify(PALETTES)),
    }],
  };
}
const cache = new Map();
// Le quai d'une graine (l'identifiant de l'élève) ET d'un niveau (lot 4 : le moteur passe `{ niveau, copie }`), toujours le même pour la même
// graine et le même niveau. Sans niveau : le standard (ce que lit le corrigé).
export function quaiDe(graine, { niveau = 'standard' } = {}) {
  const g = String(graine == null ? '' : graine), k = `${g}|${niveau}`;
  if (!cache.has(k)) cache.set(k, quaiDuTirage(anomalieDe(g), { bonus: niveau === 'confirme' ? anomalieBonusDe(g) : null, niveau }));
  return cache.get(k);
}
// Les choix réservés aux niveaux standard et confirmé : l'accompagné voit 2 réponses par réplique, la juste et la première maladresse
// (décision 9 de Tristan, brief §6 bis ; lot 4).
const PLEINS = ['standard', 'confirme'];

// ─────────────────────────────────────────────────────────────── le dialogue « Au quai » (textes du brief §6.2, tels quels ; vouvoiement)
export const REPLIQUES = [
  { id: 'arrivee', dit: 'Bonjour ! Je livre pour Action, j’arrive du Havre.', choix: [
    { v: 'presente', juste: true, lib: 'Bonjour monsieur, bienvenue chez Geodis. Je suis {prenom}, stagiaire à la réception.' },
    { v: 'salut', lib: 'Salut ! C’est pour quoi ?', reaction: 'Euh… bonjour. Je livre, je viens de vous le dire.' },
    { v: 'attendez', lib: 'Attendez là.', reaction: '… Bonjour quand même.', niveaux: PLEINS }] },
  { id: 'documents', dit: 'Je vous donne quoi ?', choix: [
    { v: 'ldv', juste: true, lib: 'Votre lettre de voiture et le bon de livraison, s’il vous plaît.' },
    { v: 'rien', lib: 'Rien, on décharge directement.', reaction: 'Ah bon ? D’habitude, on me demande mes papiers.' },
    { v: 'permis', lib: 'Votre permis de conduire.', reaction: 'Mon permis ? Ce n’est pas un contrôle de police…', niveaux: PLEINS }] },
  { id: 'quai', dit: 'Merci. Je me mets où ?', choix: [
    { v: 'quai2', juste: true, lib: 'Au quai 2, en marche arrière jusqu’aux butoirs.' },
    { v: 'ou', lib: 'Où vous voulez, il y a de la place.', reaction: 'Il y a quatre quais… Lequel ?' },
    { v: 'quai4', lib: 'Au quai 4.', reaction: 'Le quai 4 ? Sur mon papier, c’est le 2. Vous êtes sûr ?', niveaux: PLEINS }] },
  { id: 'attente', dit: 'Je reste dans ma cabine pendant que vous déchargez ?', choix: [
    { v: 'local', juste: true, lib: 'Non : vous coupez le moteur, vous me laissez vos clés et vous attendez au local chauffeurs.' },
    { v: 'cabine', lib: 'Oui, restez au chaud.', reaction: 'D’accord… mais votre protocole ne dit pas ça, il me semble.' },
    { v: 'aider', lib: 'Venez plutôt nous aider à décharger.', reaction: 'Moi ? Je n’ai pas le droit de toucher à vos chariots.', niveaux: PLEINS }] },
  { id: 'fin', dit: 'D’accord. Je peux repartir quand ?', choix: [
    { v: 'fin-poli', juste: true, lib: 'Je viens vous chercher quand le contrôle est fini. Bonne pause !' },
    { v: 'fin-sec', lib: 'Je ne sais pas.', reaction: '… Bon. Je vais attendre.', accepte: true },
    { v: 'fin-copain', lib: 'À plus !', reaction: 'Euh… à tout à l’heure.', accepte: true, niveaux: PLEINS }] },
];
export const JUSTES_DIALOGUE = Object.fromEntries(REPLIQUES.map((r) => [r.id, r.choix.find((c) => c.juste).v]));
export const FIN_DIALOGUE = 'Merci, à tout à l’heure.';
