// Les conditions des messages DÉCLENCHÉS (option B, « un collègue écrit pendant que tu
// travailles », 03/10/2026, brief `docs/briefs/MOTEUR-messages-en-cours-de-seance.md`).
//
// Un volet d'entreprise peut déclarer des messages qui arrivent en cours de séance
// (`volet.declencheurs`, voir `core/types/entreprise.js`) : une seule fois, quand une condition
// `quand(db)` devient vraie. Ce fichier fabrique ces conditions, sur deux gestes métier :
//
//   quand: apresJalon(ETAPES, 'feuille')                     l'élève a fini une étape
//   quand: apresMail({ a: CHEFFE, ligne: 'Stock actuel :', nombre: true })   il a rendu compte
//   quand: apresPlanning('smoby-quais')                      il a envoyé son planning
//   quand: apresFiche('selection')                           il a envoyé sa fiche
//   quand: apresGeste('quai:fb-quai:decharger')              il a fait ce geste dans une vue (lot 3, 08/10/2026)
//   quand: apresTransfert('msg-malo')                         il a transféré ce message (chantier D-1, 09/10/2026)
//   quand: dialogueFini('quai')                              il a raccroché un appel fini (vue Téléphone, 14/10/2026)
//   quand: localiserFini('action-carte')                     il a atteint le bilan de la carte (vue Localiser, 15/10/2026)
//   quand: quaiDecharge('quai-action')                       la dernière palette est posée, quai arrêté (`arret: 'dechargement'`, 17/10/2026)
//   quand: inspectionFinie('pelleau-poste-102')              il a pris son poste (vue Inspection du poste, 19/10/2026)
//   quand: tous(apresJalon(…), apresMail(…))                 les deux
//
// Une condition reçoit `(db, seance)` : `seance` est l'id de la séance (les gestes sont cloisonnés par séance).
//
// Décision de Tristan : **aucun clic de menu, aucune ouverture d'écran, aucune minuterie** ne
// déclenche quoi que ce soit (un élève qui clique partout au début ferait arriver la suite).
// Une condition n'est ni un jalon ni un point du barème : elle ne compte pas dans le suivi.

// Comparaison sans accents ni majuscules.
export const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// La dernière ligne d'un texte qui porte l'intitulé (un élève qui se corrige en bas de message
// est lu sur sa correction). Venue d'ENT-2.1, partagée avec ENT-2.4.
export function ligne(texte, intitule) {
  const cle = nrm(intitule).replace(/\s*:$/, '');
  const l = String(texte || '').split(/\r?\n/).filter((x) => nrm(x).includes(cle));
  return l.length ? l[l.length - 1] : null;
}

// Les nombres d'une ligne, une fois retirés les références (ECO-BT-01, REC-26-0415…) et les dates.
export function nombres(l) {
  const propre = String(l || '')
    .replace(/\b[A-Z]{2,}[A-Z0-9]*(?:-[A-Z0-9]+)+\b/gi, ' ')
    .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, ' ');
  return (propre.match(/\d+/g) || []).map((x) => parseInt(x, 10));
}

// Vrai quand l'étape `id` de la séance est réussie (`status: 'ok'`).
// **Réservé aux étapes dont l'élève voit lui-même qu'elles sont finies** (ENT-3.2 : la feuille
// de calcul affichée « vérifiée ») : sur une étape qu'on ne lui corrige pas à l'écran, l'arrivée
// du message lui dirait « c'est juste » (alerte 28). `U` = l'univers, si l'étape s'en sert.
export function apresJalon(etapes, id, U) {
  return (db) => {
    const e = (etapes || []).find((x) => x.id === id);
    return !!e && e.verifier(db, U).status === 'ok';
  };
}

// Vrai dès qu'un mail ENVOYÉ (dossier 'out') à l'adresse `a` existe — un brouillon ou un mail
// reçu ne comptent pas. Si `ligne` est donnée, le mail doit porter une ligne avec cet intitulé ;
// avec `nombre: true`, cette ligne doit contenir au moins un nombre (références et dates retirées ;
// l'intitulé ne doit donc pas porter de chiffre).
// **Juste ou faux, peu importe** : `nombre` écarte seulement l'envoi vide (l'amorce telle quelle).
// Ne jamais conditionner l'arrivée à une réponse juste : elle la révélerait, et l'élève qui se
// trompe resterait bloqué.
export function apresMail({ a, ligne: intitule, nombre = false } = {}) {
  return (db) => (db.mails || []).some((m) => {
    if (m.folder !== 'out' || nrm(m.toMail) !== nrm(a)) return false;
    if (!intitule) return true;
    const l = ligne(m.text, intitule);
    if (l === null) return false;
    return !nombre || nombres(l).length > 0;
  });
}

// Vrai dès que l'élève a ENVOYÉ la version `version` de son planning (vue Planning, 04/10/2026,
// `core/types/planning.js`) : envoyer son planning au chef est un geste métier, comme envoyer un mail.
// **Juste ou faux, peu importe** : la condition ne regarde pas le contenu de la version (sinon elle
// la révélerait). Modèle : l'aléa des plannings d'essai (`phasePlanning: 2`).
export function apresPlanning(id, version = 1) {
  return (db) => !!(db.plannings && db.plannings[id] && db.plannings[id][`v${version}`]);
}

// Vrai dès que l'élève a ENVOYÉ la fiche `id` (fiche à remplir, `core/types/fiche.js`, 04/10/2026).
// **Juste ou faux, peu importe** : envoyer sa fiche est le geste, son contenu n'est pas regardé.
export function apresFiche(id) {
  return (db) => !!(db.fiches && db.fiches[id] && db.fiches[id].envoye);
}

// Vrai dès que l'élève a fait le GESTE `nom` dans une vue de la séance (questions au fil, lot 3, 08/10/2026) : poser une
// carte du planning, choisir dans une fiche, décharger au quai, valider un rangement… Chaque vue publie la liste de ses
// gestes (`signaux`, voir l'en-tête de chaque vue et `activites/FICHE-SEANCE.md`) ; un nom qu'aucune vue de la séance ne
// connaît empêche la séance de s'ouvrir (le moteur lit `.gestes` sur la condition). **Juste ou faux, peu importe** :
// le geste est rangé (`db.gestes[<séance>][<nom>]` = heure, une fois), jamais ce qu'il a donné.
export function apresGeste(nom) {
  const f = (db, seance) => !!(db && db.gestes && db.gestes[seance] && db.gestes[seance][nom]);
  f.gestes = [nom];
  return f;
}

// Vrai dès que l'élève a TRANSFÉRÉ le message de clé `idMail` (bouton « Transférer à… » de la messagerie, chantier D-1,
// 09/10/2026, `core/types/transfert.js`) ; sans `idMail`, dès qu'un message quelconque de la séance est transféré.
// **Juste ou faux, peu importe** : le destinataire n'est jamais regardé (sinon l'arrivée du message suivant dirait
// « c'est juste », et l'élève qui se trompe resterait bloqué). Cloisonné par séance : `db.transferts[<séance>]`.
export function apresTransfert(idMail) {
  return (db, seance) => {
    const S = db && db.transferts && db.transferts[seance];
    if (!S) return false;
    return idMail == null ? Object.keys(S).length > 0 : !!S[idMail];
  };
}

// Vrai dès qu'un appel du dialogue `id` est TERMINÉ (l'élève a raccroché à la fin de l'appel ; vue « Dialogue à choix »,
// écran Téléphone, `core/types/dialogue.js`, 14/10/2026). **Juste ou faux, peu importe** : les réponses ne sont pas
// regardées. Un appel commencé puis laissé ne compte pas. Cloisonné par séance : `db.dialogues[<séance>][<id>]`. Sert aux
// `fermetures` (`ouvertSi` reçoit aussi la séance), aux `quand` et aux déclencheurs. `.dialogues` : contrôlé au chargement.
export function dialogueFini(id) {
  const f = (db, seance) => {
    const D = db && db.dialogues && db.dialogues[seance] && db.dialogues[seance][id];
    return !!(D && (D.appels || []).some((a) => a && a.fin));
  };
  f.dialogues = [id];
  return f;
}

// Vrai quand l'élève a atteint le BILAN de la carte `vue` (vue « Localiser », `core/types/localiser.js`, 15/10/2026) : tous ses
// lieux situés et « Voir le bilan » cliqué. **Juste ou faux, peu importe** (le premier essai n'est pas regardé). Cloisonné par
// séance : `db.localiser[<séance>][<vue>].fini`. Sert aux `fermetures`, aux `quand` et aux déclencheurs (message qui suit la carte).
// `.localisers` : contrôlé au chargement (une vue inconnue empêche la séance de s'ouvrir).
export function localiserFini(vue) {
  const f = (db, seance) => !!(db && db.localiser && db.localiser[seance] && db.localiser[seance][vue] && db.localiser[seance][vue].fini);
  f.localisers = [vue];
  return f;
}

// Vrai quand le quai `id` s'est arrêté après le déchargement (vue Quai, `arret: 'dechargement'`, `core/types/quai.js`, 17/10/2026) : la dernière
// palette est posée et la vue figée. **Juste ou faux, peu importe** : le déchargement n'est pas jugé ici (la dépose, elle, a ses jalons). Lit le
// drapeau `dechargeFini` de l'état du quai, rangé une fois ; un rechargement de page ne le change pas. ATTENTION : l'état du quai vit sous
// `db.quais[<id du quai>]`, **pas cloisonné par séance** comme `db.dialogues` : deux séances qui déclarent le même `id` de quai partagent ce drapeau
// (ENT-8.7 et ENT-8.8 doivent donc avoir des `id` de quai différents). Le paramètre `seance` n'est pas utilisé. `.quais` : la liste des quais cités ;
// `entreprise.js` ne la contrôle pas encore au chargement (une faute de frappe sur l'id ne fait jamais arriver le message).
export function quaiDecharge(id) {
  const f = (db) => !!(db && db.quais && db.quais[id] && db.quais[id].dechargeFini === true);
  f.quais = [id];
  return f;
}

// Vrai quand l'élève a PRIS SON POSTE dans l'inspection `id` (vue « Inspection du poste », `core/types/inspection.js`, 19/10/2026) :
// « C'est bon, je prends mon poste » confirmé, l'inspection figée (pas l'arrêt par le collègue). **Juste ou faux, peu importe** : les
// défauts signalés ne sont pas regardés ici (ils ont leurs jalons). Cloisonné par séance : `db.inspections[<séance>][<id>].fait`.
// Sert aux `fermetures`, aux `quand` et aux déclencheurs. `.inspections` : contrôlé au chargement (un id inconnu empêche la séance de s'ouvrir).
export function inspectionFinie(id) {
  const f = (db, seance) => !!(db && db.inspections && db.inspections[seance] && db.inspections[seance][id] && db.inspections[seance][id].fait === true);
  f.inspections = [id];
  return f;
}

// Les gestes cités par une condition (pour le contrôle au chargement).
export const gestesDe = (f) => (f && Array.isArray(f.gestes) ? f.gestes : []);

// Vrai quand toutes les conditions le sont.
export function tous(...conditions) {
  const f = (db, seance) => conditions.every((c) => c(db, seance));
  f.gestes = conditions.flatMap(gestesDe);
  f.dialogues = conditions.flatMap((c) => (c && Array.isArray(c.dialogues) ? c.dialogues : []));
  f.localisers = conditions.flatMap((c) => (c && Array.isArray(c.localisers) ? c.localisers : []));
  f.quais = conditions.flatMap((c) => (c && Array.isArray(c.quais) ? c.quais : []));
  f.inspections = conditions.flatMap((c) => (c && Array.isArray(c.inspections) ? c.inspections : []));
  return f;
}
