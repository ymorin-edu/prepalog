// Les QUESTIONS AU FIL d'une séance d'entreprise (08/10/2026, brief `docs/briefs/MOTEUR-questions-au-fil.md`, lot 2).
//
// Les questions de la trame passent À L'ÉCRAN, au moment du geste, posées par un collègue (décisions de Tristan du
// 07/10/2026). Deux sortes, qu'une séance mélange question par question :
//   - « fil » : la question arrive PENDANT le travail, quand un geste a eu lieu (`quand(db)`). Un panneau s'ouvre à
//     droite ; l'élève peut regarder (menu, stock, messages, documents) mais ne touche plus à son travail tant qu'il
//     n'a pas répondu (le moteur gèle l'écran) ;
//   - « transition » : un écran « point d'étape » s'ouvre entre deux écrans de travail, après un envoi (`apres(db)`) ;
//     ses 1 à 3 questions préparent l'écran suivant, qu'il garde fermé (`ferme`) jusqu'aux réponses.
// Pas de « répondre plus tard ». Une réponse fausse ne bloque jamais : l'élève voit le retour et continue.
//
// ── CE QUE LA SÉANCE DÉCLARE (un fichier de données à part : `contenus/questions/<séance>.js`) ──────────────
//   export const QUESTIONS = {
//     id: 'fb-commande',            // l'id de la SÉANCE (meta.id) : clé de l'état dans la base, contrôlée à l'ouverture
//     part: 4,                      // points sur 20 réservés aux questions notées (les jalons de la séance font le reste)
//     personnes: { Karim: { nom: 'Karim Benali', role: 'chef d’équipe' } },   // ou `equipe` passé à creerEntreprise
//     etapes: [{ id: 'avant-malo', de: 'Ines', apres: apresFiche('bon'), ferme: 'repondre:malo',
//                titre: 'Point d’étape avant de répondre à Malo', situation: 'J’ai bien ton bon…',
//                continuer: 'répondre à Malo', questions: ['qui-utilise-le-bon'] }],
//     liste: [
//       { id: 'ou-verifier', type: 'fil', de: 'Karim', quand: (db) => …, enonce: '…',
//         choix: [{ v: 'stock', lib: 'Dans le stock' }, …], juste: 'stock', retour: '…', groupe: 'Où vérifier',
//         apres: 'bilan' },                       // facultatif : « Merci, je note », correction au bilan seulement
//       { id: 'qui-utilise-le-bon', type: 'transition', de: 'Ines', enonce, choix, juste, retour, groupe },
//       { id: 'vides', type: 'fil', de: 'Karim', quand, reflexion: true, enonce, choix, retour },   // non notée
//     ],
//   };
// L'ÉCRAN « AVANT DE COMMENCER » (10/10/2026, brief `docs/briefs/MOTEUR-avant-de-commencer.md`) : un écran d'ouverture, SANS
// condition, en tête du menu. Les questions s'y suivent une à une, les documents (ou images) à gauche. Elles ne comptent PAS
// dans la note et rien ne le dit à l'élève : corrigées à l'écran (✓ / ✗ + retour), sans jalon. Tant qu'il n'a pas répondu à
// toutes, le reste du menu est fermé ; une réponse fausse ne bloque jamais ; une séance déjà commencée n'est pas bloquée.
//   ouverture: { id: 'avant-de-commencer', de: 'ines', titre: 'Avant de commencer', situation: 'Bonjour !…',
//                documents: ['commande-malo', { id: 'photos', court: 'Photos', titre: '…', type: 'images',
//                  images: [{ src: './contenus/images/…jpg', alt: '…', legende: '…', credit: 'Photo : …, Unsplash' }] }],
//                continuer: 'lire mes messages', questions: ['qui-est-malo', …] },
//   liste: [{ id: 'qui-est-malo', type: 'ouverture', de: 'ines', enonce, choix, juste, retour,
//             doc: 'fiche-client',                  // ce que le bloc de gauche montre pour cette question (un id de `documents`)
//             aide: 'Regarde la [[fiche client]].' }],   // facultative ; l'aide se replie, avec « Voir le document »
// LA CALCULETTE du site (10/10/2026) : `ouverture.calculette: true` la pose sur l'écran tant qu'il est affiché (booléen, refusé sinon ;
// absente tant que le contenu ne la déclare pas). Une réflexion peut porter `apres: 'bilan'` : « Merci, je note » à l'écran, ce que pense
// le collègue arrive avec le bandeau de fin.
// EN ÉVALUATION (lot 2, décisions de Tristan du 10/10/2026) : `ouverture.part: 4` (points sur 20) rend l'écran NOTÉ. Alors :
// aucune aide ni mot cliquable, un choix « Je ne sais pas » toujours en dernier, pas de correction avant le bilan
// (« Réponse enregistrée. »), et l'élève est prévenu d'une phrase. Barème par question de poids 1 : juste = +1 ;
// « Je ne sais pas » = 0 ; fausse = − 1 ÷ (nombre de mauvaises réponses) ; la part ne descend jamais sous 0. Un seul jalon.
// Champs facultatifs d'une question : `poids` (1 par défaut, dans la `part`), `actif: false` (mise de côté),
// `melanger: false` (choix dans l'ordre déclaré), `libre: true` (réflexion seulement : une ou deux phrases),
// `rattrapage(db)` (condition de secours, en plus de celle du moteur). La séance branche le tout en une ligne :
// `creerEntreprise({ …, questions: QUESTIONS })` ; le moteur ajoute lui-même un jalon par question notée.
//
// La SOUPLESSE (décision 4 de Tristan) : la réponse rangée est la CLÉ `v` du choix, jamais son rang. Reformuler un
// choix, changer leur ordre, en ajouter un : rien ne bouge pour les élèves. L'`id` d'une question ne change jamais.
// Pas de numéro dans les textes (« Question 1 sur 2 » est calculé). Voir `activites/FICHE-SEANCE.md`.
//
// ── L'ÉTAT DANS LA BASE DE L'ÉLÈVE (cloisonné par séance) ──────────────────────────────────────────────────
//   db.questions[<séance>][<question>] = { arrivee, premiere: 'stock', duree, sorties?, horsPage?, libre? }
//   db.questions[<séance>]['@etapes'][<point d'étape>] = heure d'arrivée
// `premiere` : la clé du PREMIER choix validé, écrite une fois. `duree` : secondes entre l'arrivée et la réponse.
// `sorties` / `horsPage` : les sorties de page pendant la question (§4.8 bis), rangées avec la réponse.
// Rien n'est écrit pour l'enseignant. « Réinitialiser » n'efface pas les réponses (`entreprise.js`).
//
// Tout ce qui est mal déclaré empêche la séance de s'ouvrir, avec un message qui nomme la question : une faute de
// frappe tombe dans la suite de tests (`outils/test/questions.mjs` charge tous les fichiers), jamais en classe.

import { ech } from '../ui.js';
import { hasard } from '../tirage.js';

const ID_OK = /^[a-z0-9][a-z0-9-]*$/;
export const CLE_ETAPES = '@etapes';
export const CLE_OUVERTURE = '@ouverture';
export const NSP = '@nsp';                                   // la clé de « Je ne sais pas » (évaluation)
export const PHRASE_PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
// Comment l'élève appelle la personne : `appel`, sinon le premier mot de son nom.
export const appel = (p) => (p && (p.appel || String(p.nom || '').split(' ')[0])) || '';

/* ================================================================ contrôle au chargement */
export function compilerQuestions(Q, equipe, documentsSeance) {
  const err = (m) => { throw new Error(`questions${Q && Q.id ? ` de ${Q.id}` : ''} : ${m}`); };
  if (!Q || typeof Q !== 'object') err('le bloc est vide');
  if (!Q.id || typeof Q.id !== 'string') err('il manque l’`id` (celui de la séance : clé de l’état dans la base de l’élève)');
  const personnes = Object.assign({}, equipe || {}, Q.personnes || {});
  const toutes = Q.liste || [];
  if (!Array.isArray(toutes)) err('`liste` doit être un tableau');
  const ids = new Set();
  toutes.forEach((q, k) => {
    const ici = `question ${q && q.id ? `« ${q.id} »` : `n° ${k + 1}`}`;
    if (!q || !q.id) err(`${ici} : il manque l’\`id\``);
    if (!ID_OK.test(q.id)) err(`${ici} : l’id ne prend que des minuscules sans accent, des chiffres et des tirets`);
    if (ids.has(q.id)) err(`${ici} : id en double`);
    ids.add(q.id);
    if (!['fil', 'transition', 'ouverture'].includes(q.type)) err(`${ici} : \`type\` doit valoir 'fil', 'transition' ou 'ouverture'`);
    if (!personnes[q.de]) err(`${ici} : \`de\` = « ${q.de} » n’est pas une personne de la séance (${Object.keys(personnes).join(', ') || 'aucune déclarée'})`);
    if (!q.enonce) err(`${ici} : il manque l’\`enonce\``);
    if (!q.retour) err(`${ici} : il manque le \`retour\` (ce que dit ${q.de} après la réponse)`);
    if (q.libre) {
      if (!q.reflexion) err(`${ici} : \`libre\` n’est permis que pour une question de réflexion (non notée)`);
    } else {
      if (!Array.isArray(q.choix) || q.choix.length < 2 || q.choix.length > 4) err(`${ici} : il faut 2 à 4 choix`);
      const vs = new Set();
      q.choix.forEach((c) => {
        if (!c || !c.v || !c.lib) err(`${ici} : chaque choix porte une clé courte \`v\` et un texte \`lib\``);
        if (vs.has(c.v)) err(`${ici} : clé \`v\` = « ${c.v} » en double`);
        vs.add(c.v);
      });
      if (q.reflexion) { if (q.juste != null) err(`${ici} : une question de réflexion n’a pas de \`juste\``); }
      else if (!vs.has(q.juste)) err(`${ici} : \`juste\` = « ${q.juste} » n’est pas une clé des choix (${[...vs].join(', ')})`);
    }
    if (q.type === 'ouverture') {
      if (q.reflexion || q.libre) err(`${ici} : une question d’ouverture a une bonne réponse (ni \`reflexion\` ni \`libre\`)`);
      if (q.groupe != null || q.poids != null || q.apres != null || q.quand != null) err(`${ici} : une question d’ouverture ne compte pas dans la note (ni \`groupe\`, ni \`poids\`, ni \`apres\`, ni \`quand\`)`);
      if (typeof q.doc !== 'string' || !q.doc) err(`${ici} : il manque \`doc\` (l’id du document que le bloc de gauche montre)`);
      if (q.aide != null && (typeof q.aide !== 'string' || !q.aide)) err(`${ici} : \`aide\` est un texte`);
    } else if (!q.reflexion && !q.groupe) err(`${ici} : une question notée nomme son \`groupe\` (sa ligne au bilan de fin)`);
    if (q.type === 'fil' && typeof q.quand !== 'function') err(`${ici} : une question au fil a une condition \`quand(db)\``);
    if (q.rattrapage != null && typeof q.rattrapage !== 'function') err(`${ici} : \`rattrapage\` est une condition (db) => vrai ou faux`);
    if (q.poids != null && !(typeof q.poids === 'number' && q.poids > 0)) err(`${ici} : \`poids\` est un nombre positif`);
    if (q.apres != null && q.apres !== 'bilan') err(`${ici} : \`apres\` ne peut valoir que 'bilan'`);
  });
  const parIdTout = new Map(toutes.map((q) => [q.id, q]));
  const eids = new Set();
  const citees = new Set();
  const etapes = (Q.etapes || []).map((e, k) => {
    const ici = `point d’étape ${e && e.id ? `« ${e.id} »` : `n° ${k + 1}`}`;
    if (!e || !e.id || !ID_OK.test(e.id)) err(`${ici} : il manque l’\`id\` (minuscules, chiffres et tirets)`);
    if (eids.has(e.id)) err(`${ici} : id en double`);
    eids.add(e.id);
    if (!personnes[e.de]) err(`${ici} : \`de\` = « ${e.de} » n’est pas une personne de la séance`);
    if (typeof e.apres !== 'function') err(`${ici} : il faut la condition d’arrivée \`apres(db)\` (un envoi du parcours)`);
    if (!Array.isArray(e.questions) || !e.questions.length || e.questions.length > 3) err(`${ici} : il cite 1 à 3 questions`);
    e.questions.forEach((id) => {
      const q = parIdTout.get(id);
      if (!q) err(`${ici} : cite une question inconnue « ${id} »`);
      if (q.type !== 'transition') err(`${ici} : cite « ${id} », qui n’est pas une question de transition`);
      if (citees.has(id)) err(`${ici} : « ${id} » est déjà citée par un autre point d’étape`);
      citees.add(id);
    });
    if (e.ferme != null && !/^(ecran|repondre):.+$/.test(e.ferme)) err(`${ici} : \`ferme\` vaut 'ecran:<écran>' ou 'repondre:<clé du mail>'`);
    return { ...e, questions: e.questions.filter((id) => parIdTout.get(id).actif !== false) };
  });
  toutes.filter((q) => q.type === 'transition' && !citees.has(q.id))
    .forEach((q) => err(`la question de transition « ${q.id} » n’est citée par aucun point d’étape`));
  // L'écran d'ouverture (au plus un par séance).
  const ouvQ = toutes.filter((q) => q.type === 'ouverture');
  let ouverture = null;
  if (Q.ouverture != null) {
    const o = Q.ouverture, ici = 'l’écran d’ouverture';
    if (!o || typeof o !== 'object') err(`${ici} doit être un objet`);
    if (!o.id || !ID_OK.test(o.id)) err(`${ici} : il manque l’\`id\` (minuscules, chiffres et tirets)`);
    if (!personnes[o.de]) err(`${ici} : \`de\` = « ${o.de} » n’est pas une personne de la séance`);
    if (o.part != null && !(typeof o.part === 'number' && o.part > 0)) err(`${ici} : \`part\` (les points sur 20 de l’évaluation) est un nombre positif`);
    if (o.calculette != null && typeof o.calculette !== 'boolean') err(`${ici} : \`calculette\` vaut true ou false (la calculette du site sur l’écran)`);
    if (!Array.isArray(o.questions) || !o.questions.length) err(`${ici} ne cite aucune question`);
    if (!Array.isArray(o.documents) || !o.documents.length) err(`${ici} n’a aucun document à montrer à gauche`);
    const connus = new Set(documentsSeance || []);
    const docs = new Map();
    o.documents.forEach((d, k) => {
      if (typeof d === 'string') {
        if (!connus.has(d)) err(`${ici} : le document « ${d} » n’existe pas dans les \`documents\` de la séance (${[...connus].join(', ') || 'aucun'})`);
        docs.set(d, { id: d });
      } else {
        if (!d || d.type !== 'images' || !d.id || !ID_OK.test(d.id)) err(`${ici} : le visuel n° ${k + 1} doit porter un \`id\` et \`type: 'images'\``);
        if (!d.court) err(`${ici} : le visuel « ${d.id} » n’a pas de nom court (\`court\`)`);
        if (!Array.isArray(d.images) || !d.images.length) err(`${ici} : le visuel « ${d.id} » n’a aucune image`);
        d.images.forEach((im, j) => {
          if (!im || !im.src || !im.alt) err(`${ici} : image n° ${j + 1} de « ${d.id} » : il faut \`src\` et \`alt\``);
          if (/^(https?:)?\/\//i.test(String(im.src))) err(`${ici} : image n° ${j + 1} de « ${d.id} » : aucune image d’un autre domaine (règle du dépôt)`);
          if (!im.credit) err(`${ici} : image n° ${j + 1} de « ${d.id} » : il manque le crédit affiché sous l’image (\`credit\`)`);
        });
        docs.set(d.id, d);
      }
    });
    const vus = new Set();
    o.questions.forEach((id) => {
      const q = parIdTout.get(id);
      if (!q) err(`${ici} cite une question inconnue « ${id} »`);
      if (q.type !== 'ouverture') err(`${ici} cite « ${id} », qui n’est pas une question d’ouverture`);
      if (vus.has(id)) err(`${ici} cite « ${id} » deux fois`);
      vus.add(id);
      if (!docs.has(q.doc)) err(`question « ${id} » : \`doc\` = « ${q.doc} » n’est pas un document de l’écran d’ouverture (${[...docs.keys()].join(', ')})`);
      if (o.part != null) {
        if (q.aide != null) err(`question « ${id} » : en évaluation (\`part\`), une question n’a aucune \`aide\``);
        if (/\[\[/.test(q.enonce + (q.choix || []).map((c) => c.lib).join(' '))) err(`question « ${id} » : en évaluation, aucun mot cliquable (\`[[mot]]\`) dans l’énoncé ni les choix`);
        if ((q.choix || []).some((c) => c.v === NSP)) err(`question « ${id} » : la clé « ${NSP} » est réservée à « Je ne sais pas »`);
      }
    });
    ouvQ.forEach((q) => { if (!vus.has(q.id)) err(`la question d’ouverture « ${q.id} » n’est citée par l’écran d’ouverture`); });
    const actives = o.questions.filter((id) => parIdTout.get(id).actif !== false);
    // LE TIRAGE PAR ÉLÈVE (lot 3, 10/10/2026) : `tirage: { preparation: 2, droit: 2 }` = combien de questions de chaque
    // rubrique l'élève reçoit. Les questions citées sont alors la BANQUE ; chaque rubrique en compte au moins le double.
    if (o.tirage != null) {
      const T = o.tirage;
      if (!T || typeof T !== 'object' || Array.isArray(T) || !Object.keys(T).length) err(`${ici} : \`tirage\` est un objet { rubrique: nombre de questions tirées }`);
      Object.entries(T).forEach(([r, n]) => {
        if (!Number.isInteger(n) || n < 1) err(`${ici} : \`tirage.${r}\` est un entier positif`);
        const dans = actives.filter((id) => parIdTout.get(id).rubrique === r).length;
        if (dans < 2 * n) err(`${ici} : la rubrique « ${r} » tire ${n} question${n > 1 ? 's' : ''} mais la banque n’en compte que ${dans} (il en faut au moins ${2 * n}, le double)`);
      });
      actives.forEach((id) => { const q = parIdTout.get(id); if (!(q.rubrique in T)) err(`question « ${id} » : \`rubrique\` = « ${q.rubrique} » n’est pas une rubrique du \`tirage\` (${Object.keys(T).join(', ')})`); });
      actives.forEach((id) => {
        const q = parIdTout.get(id);
        if (q.variante == null) return;
        if (typeof q.variante !== 'function') err(`question « ${id} » : \`variante\` est une fonction (hasard) => { enonce, libs, retour? }`);
        for (let s = 0; s < 30; s++) {
          let v; try { v = q.variante(hasard(`essai${s}`)); } catch (x) { err(`question « ${id} » : \`variante\` plante (${x.message})`); }
          if (!v || typeof v.enonce !== 'string' || !v.enonce) err(`question « ${id} » : \`variante\` doit rendre un \`enonce\``);
          const libs = v.libs || {};
          const lib = q.choix.map((c) => libs[c.v]);
          if (lib.some((l) => typeof l !== 'string' || !l)) err(`question « ${id} » : \`variante\` doit rendre un texte pour chaque clé de choix (${q.choix.map((c) => c.v).join(', ')})`);
          if (new Set(lib).size !== lib.length) err(`question « ${id} » : \`variante\` rend deux choix identiques (graine d’essai ${s})`);
        }
      });
    } else {
      toutes.filter((q) => q.type === 'ouverture').forEach((q) => {
        if (q.rubrique != null || q.variante != null) err(`question « ${q.id} » : \`rubrique\` et \`variante\` n’ont de sens qu’avec un \`tirage\` de l’écran d’ouverture`);
      });
    }
    if (!actives.length) err(`${ici} n’a plus aucune question active`);
    ouverture = { ...o, questions: actives, docs };
  } else if (ouvQ.length) err(`la question d’ouverture « ${ouvQ[0].id} » n’a pas d’écran d’ouverture (\`ouverture\` manque)`);
  const liste = toutes.filter((q) => q.actif !== false);
  const notees = liste.filter((q) => !q.reflexion && q.type !== 'ouverture');
  if (notees.length && !(typeof Q.part === 'number' && Q.part > 0)) err('`part` (les points sur 20 réservés aux questions notées) manque');
  return {
    id: Q.id, part: notees.length ? Q.part : 0, personnes, liste, notees,
    parId: new Map(liste.map((q) => [q.id, q])),
    fil: liste.filter((q) => q.type === 'fil'),
    ouverture,
    etapes: etapes.filter((e) => e.questions.length),
  };
}

/* ================================================================ état, jalons */
export const reponses = (db, M) => (db && db.questions && db.questions[M.id]) || {};
export const reponse = (db, M, id) => reponses(db, M)[id] || null;
export const repondu = (r) => !!(r && (r.premiere != null || r.libre != null));
export const etapeArrivee = (db, M, eid) => !!(reponses(db, M)[CLE_ETAPES] || {})[eid];
export const etapeFaite = (db, M, e) => e.questions.every((id) => repondu(reponse(db, M, id)));

// Un jalon par question notée active : « à faire » sans réponse, juste si la PREMIÈRE réponse est la clé `juste`.
// Jamais d'`ecran` : « Corriger » ne rouvre pas une question. Poids = part × poids / somme des poids.
export function etapesQuestions(M) {
  const somme = M.notees.reduce((t, q) => t + (q.poids || 1), 0);
  const ouv = M.ouverture && M.ouverture.part != null ? [{
    id: 'ouverture', titre: 'Les questions', groupe: 'Les questions', poids: M.ouverture.part,
    fraction: (db) => noteOuverture(db, M).fraction,
    verifier(db) {
      const n = noteOuverture(db, M);
      if (n.repondues < n.sur) return { status: 'attente' };
      return { status: n.fraction > 0 ? 'ok' : 'ko' };
    },
  }] : [];
  return ouv.concat(M.notees.map((q) => ({
    id: `question:${q.id}`, titre: q.groupe, groupe: q.groupe, question: q.id,
    poids: (M.part * (q.poids || 1)) / somme,
    verifier(db) {
      const r = reponse(db, M, q.id);
      if (!r || r.premiere == null) return { status: 'attente' };
      return { status: r.premiere === q.juste ? 'ok' : 'ko' };
    },
  })));
}

// L'ordre d'affichage des choix : tiré par élève (même graine, même ordre, sur tous les postes), sauf `melanger: false`.
// En évaluation, « Je ne sais pas » est ajouté en dernier, jamais mélangé.
export const enEvaluation = (M, q) => !!(M.ouverture && M.ouverture.part != null && q.type === 'ouverture');
export function ordreChoix(M, q, graine) {
  const L = q.melanger === false ? q.choix.slice() : hasard(`${graine || ''}|${M.id}|${q.id}`).melanger(q.choix);
  return enEvaluation(M, q) ? L.concat([{ v: NSP, lib: 'Je ne sais pas' }]) : L;
}

// La part des questions d'ouverture en évaluation. Par question (poids 1) : juste +1, « Je ne sais pas » 0, fausse
// −1 ÷ (mauvaises réponses) ; plancher à 0. `fraction` ∈ [0, 1] ; `points` = fraction × part.
export function noteOuverture(db, M) {
  const o = M.ouverture;
  if (!o || o.part == null) return null;
  let total = 0, justes = 0, nsp = 0, faux = 0, repondues = 0;
  const ids = idsOuverture(db, M);
  ids.forEach((id) => {
    const q = M.parId.get(id), r = reponse(db, M, id);
    if (!repondu(r)) return;
    repondues += 1;
    if (r.premiere === q.juste) { total += 1; justes += 1; }
    else if (r.premiere === NSP) nsp += 1;
    else { total -= 1 / (q.choix.length - 1); faux += 1; }
  });
  const fraction = Math.max(0, total) / ids.length;
  return { part: o.part, fraction, points: fraction * o.part, justes, nsp, faux, repondues, sur: ids.length, tirees: ids };
}

/* ================================================================ rendu */
// Une question, dans le panneau ou sur l'écran du point d'étape.
//   o = { graine, choisi (clé choisie, pas encore validée), estProf, corrigee (✓ / ✗ montrés), merci (« Merci, je note »),
//         numero ('Question 1 sur 2'), sortie (l'élève a quitté la page pendant la question), copie }
export function htmlQuestion(M, q, r, o = {}) {
  const P = M.personnes[q.de], qui = ech(appel(P));
  const fait = repondu(r);
  const prise = fait ? r.premiere : o.choisi;
  let corps;
  if (q.libre) {
    corps = `<textarea class="qf-libre" data-q-libre="${ech(q.id)}" rows="3" aria-label="Ta réponse"
      ${fait || o.estProf ? 'disabled' : ''}>${ech(fait ? r.libre : (o.brouillon || ''))}</textarea>`;
  } else {
    corps = `<div class="qf-choix" role="group" aria-label="Choix de réponse">${ordreChoix(M, q, o.graine).map((c) => {
      const bonne = o.estProf && !q.reflexion && c.v === q.juste;
      return `<button type="button" class="qf-c${prise === c.v ? ' qf-pris' : ''}${bonne ? ' qf-bonne' : ''}" data-q-choix="${ech(c.v)}"
        data-q="${ech(q.id)}" data-cle="c-${ech(q.id)}-${ech(c.v)}" aria-pressed="${prise === c.v ? 'true' : 'false'}"
        ${fait || o.estProf ? 'disabled' : ''}>${ech(c.lib)}${bonne ? ' <span class="qf-bonne-mot">bonne réponse</span>' : ''}</button>`;
    }).join('')}</div>`;
  }
  let suite = '';
  if (o.estProf) {
    suite = `<p class="qf-retour"><b>Ce que dit ${qui} après la réponse :</b> ${ech(q.retour)}</p>`;
  } else if (!fait) {
    const pret = q.libre ? true : !!o.choisi;
    suite = `<div class="qf-rep"><button type="button" class="btn btn-p" data-q-repondre="${ech(q.id)}" data-cle="r-${ech(q.id)}"
      ${pret ? '' : 'disabled'}>Répondre</button><span class="note">Une seule réponse compte : la première.</span></div>`;
  } else if (o.evalOuv) {
    suite = '<p class="qf-retour" data-q-enregistree>Réponse enregistrée.</p>';
  } else if (q.reflexion && !(o.merci && q.apres === 'bilan')) {
    suite = `<p class="qf-retour"><b>Ce qu’en pense ${qui} :</b> ${ech(q.retour)}</p>`;
  } else if (o.merci) {
    suite = `<p class="qf-retour" data-q-merci>${o.copie ? '« Merci, je note. »' : '« Merci, je note. On en reparle à la fin de la séance. »'}</p>`;
  } else {
    const ok = r.premiere === q.juste;
    suite = `<p class="qf-verdict ${ok ? 'qf-ok' : 'qf-ko'}" data-q-verdict="${ok ? 'ok' : 'ko'}">${ok ? '✓ C’est ça.' : '✗ Pas tout à fait.'}</p>
      <p class="qf-retour"><b>${qui} :</b> ${ech(q.retour)}</p>`;
  }
  return `<div class="qf-q" data-question="${ech(q.id)}">
    ${o.numero ? `<p class="qf-num">${ech(o.numero)}</p>` : ''}
    <p class="qf-enonce">${ech(q.enonce)}</p>
    ${o.aide || ''}
    ${q.reflexion ? '<p class="note qf-reflexion">Pour réfléchir : il n’y a pas une seule bonne réponse, choisis la tienne.</p>' : ''}
    ${corps}${suite}
    ${o.sortie && !o.estProf ? '<p class="note qf-sortie" data-q-sortie>Tu as quitté la page pendant la question : ton enseignant le verra.</p>' : ''}
  </div>`;
}

// Le panneau d'une question au fil (non modal : le menu reste utilisable).
export function htmlPanneau(M, q, r, o = {}) {
  const P = M.personnes[q.de];
  return `<div class="qf-panneau" role="dialog" aria-modal="false" aria-labelledby="qfTitre" data-q-panneau="${ech(q.id)}">
    <h2 id="qfTitre" class="qf-titre"><span aria-hidden="true">?</span> ${ech(appel(P))} te pose une question</h2>
    ${P.role ? `<p class="note qf-role">${ech(P.nom)}, ${ech(P.role)}</p>` : ''}
    ${htmlQuestion(M, q, r, o)}
    ${repondu(r) && !o.estProf ? '<button type="button" class="btn btn-p qf-reprendre" data-q-reprendre data-cle="reprendre">Reprendre mon travail</button>' : ''}
  </div>`;
}

// L'écran « point d'étape ».
export function htmlEtape(M, e, db, o = {}) {
  const P = M.personnes[e.de], qui = appel(P);
  const n = e.questions.length;
  const fini = etapeFaite(db, M, e);
  return `<div class="ent-tete"><h2>Point d’étape avec ${ech(qui)}</h2>${P.role ? `<p class="note">${ech(P.nom)}, ${ech(P.role)}</p>` : ''}</div>
    <section class="panneau qf-etape" data-q-etape="${ech(e.id)}">
      ${e.situation ? `<p class="qf-situation"><b>${ech(qui)} :</b> « ${ech(e.situation)} »</p>` : ''}
      ${e.questions.map((id, k) => htmlQuestion(M, M.parId.get(id), reponse(db, M, id),
        { ...o.parQuestion(id), numero: n > 1 ? `Question ${k + 1} sur ${n}` : '' })).join('')}
      ${o.estProf ? '' : `<div class="qf-continuer"><button type="button" class="btn btn-p" data-q-continuer="${ech(e.id)}" ${fini ? '' : 'disabled'}>Continuer${
        e.continuer ? ` : ${ech(e.continuer)}` : ''} →</button>${fini ? '' : '<span class="note">Réponds aux questions pour continuer : une réponse fausse ne bloque pas.</span>'}</div>`}
    </section>`;
}

/* ================================================================ l'écran « Avant de commencer » */
export const ouvertureRepondues = (db, M) => (M.ouverture ? idsOuverture(db, M).filter((id) => repondu(reponse(db, M, id))).length : 0);
export const ouvertureFaite = (db, M) => !M.ouverture || ouvertureRepondues(db, M) === idsOuverture(db, M).length;

/* ---- le tirage par élève (lot 3) ----
   `db.questions[<séance>]['@tirage'] = { graine, ids: [ordre], q: { <id>: { enonce, libs, retour? } }, at }` : rangé à la
   première ouverture, JAMAIS refait (banque enrichie, mélange changé : sans effet pour un élève qui a déjà ouvert).
   Sans enregistrement (enseignant, copie jamais ouverte), toute la banque est montrée. */
export const CLE_TIRAGE = '@tirage';
export const tirageRange = (db, M) => (M.ouverture && M.ouverture.tirage ? reponses(db, M)[CLE_TIRAGE] || null : null);
export function idsOuverture(db, M) {
  const o = M.ouverture, rec = tirageRange(db, M);
  if (!rec) return o.questions;
  const ok = new Set(o.questions);
  return rec.ids.filter((id) => ok.has(id));        // une question retirée de la banque disparaît sans bloquer l'élève
}
// Le tirage d'une graine : par rubrique, `n` questions de la banque ; l'ordre d'ensemble est tiré aussi ; les questions à
// `variante` reçoivent leurs valeurs (rangées avec le tirage). Fonction pure de (graine, séance).
export function tirerOuverture(M, graine) {
  const o = M.ouverture, base = `${graine}|${M.id}`;
  let ids = [];
  Object.entries(o.tirage).forEach(([rub, n]) => {
    ids = ids.concat(hasard(`${base}|${rub}`).prendre(o.questions.filter((id) => M.parId.get(id).rubrique === rub), n));
  });
  ids = hasard(`${base}|ordre`).melanger(ids);
  const q = {};
  ids.forEach((id) => { const f = M.parId.get(id).variante; if (f) q[id] = f(hasard(`${base}|${id}`)); });
  return { graine: String(graine), ids, q, at: Date.now() };
}
// À l'ouverture (élève seulement) : range le tirage s'il n'y en a pas. Rend vrai si la base a changé (à sauver).
export function rangerTirageOuverture(db, M, graine) {
  if (!M.ouverture || !M.ouverture.tirage || tirageRange(db, M)) return false;
  if (!db.questions) db.questions = {};
  if (!db.questions[M.id]) db.questions[M.id] = {};
  db.questions[M.id][CLE_TIRAGE] = tirerOuverture(M, graine);
  return true;
}
// La question telle que CET élève la voit (valeurs tirées posées sur l'énoncé et les choix).
export function questionTiree(db, M, q) {
  const rec = tirageRange(db, M), v = rec && rec.q && rec.q[q.id];
  if (!v) return q;
  return { ...q, enonce: v.enonce, retour: v.retour || q.retour, choix: q.choix.map((c) => ({ ...c, lib: (v.libs || {})[c.v] || c.lib })) };
}

// Un visuel (images) : les photos, leur légende et leur crédit. Les images sont servies par le dépôt (jamais d'autre domaine).
function htmlVisuel(d) {
  return `<div class="ent-doc qo-visuel" data-ouv-visuel="${ech(d.id)}"><h3 class="qo-titre-doc">${ech(d.titre || d.court)}</h3>
    ${d.images.map((im) => `<figure class="qo-fig"><img src="${ech(im.src)}" alt="${ech(im.alt)}">
      <figcaption>${im.legende ? `${ech(im.legende)}<br>` : ''}<span class="note">${ech(im.credit)}</span></figcaption></figure>`).join('')}</div>`;
}

// L'aide d'une question : repliée, avec le bouton qui ramène le bloc de gauche au bon document. Le texte porte ses
// `[[mots]]` cliquables (le moteur les transforme après l'affichage).
const htmlAide = (q, ouverte) => (q.aide ? `<details class="qo-aide" data-ouv-aide="${ech(q.id)}"${ouverte ? ' open' : ''}><summary>Aide</summary><p>${ech(q.aide)}
  <button type="button" class="btn btn-s qo-voir" data-ouv-voir="${ech(q.doc)}" data-cle="voir-${ech(q.id)}">Voir le document</button></p></details>` : '');

// L'écran. À gauche, les documents en onglets ; à droite, UNE question à la fois, avec ses pastilles.
//   o = { estProf, k (rang de la question), doc (l'onglet ouvert), feuille(id) → html d'un document, parQuestion(id) → options }
export function htmlOuverture(M, db, o = {}) {
  const ov = M.ouverture, P = M.personnes[ov.de], qui = ech(appel(P));
  const ids = idsOuverture(db, M), n = ids.length;
  const k = Math.min(Math.max(o.k || 0, 0), n - 1);
  const q = questionTiree(db, M, M.parId.get(ids[k]));
  const toutes = ouvertureFaite(db, M);
  const sel = ov.docs.has(o.doc) ? o.doc : q.doc;
  const docs = [...ov.docs.values()];
  const court = (d) => (d.type === 'images' ? d.court : o.court(d.id));
  const pastilles = ids.map((id, i) => {
    const fait = repondu(reponse(db, M, id));
    return `<button type="button" role="tab" class="qo-pas${i === k ? ' qo-cur' : ''}${fait ? ' qo-faite' : ''}" data-ouv-aller="${i}"
      data-cle="pas-${i}" aria-selected="${i === k}" aria-label="Question ${i + 1}${fait ? ', répondue' : ''}">${fait ? '✓' : i + 1}</button>`;
  }).join('');
  const nb = ouvertureRepondues(db, M);
  const dernier = k === n - 1;
  return `<div class="ent-tete"><h2>${ech(ov.titre || 'Avant de commencer')}, avec ${qui}</h2>${P.role ? `<p class="note">${ech(P.nom)}, ${ech(P.role)}</p>` : ''}</div>
    ${ov.situation ? `<p class="qf-situation"><b>${qui} :</b> « ${ech(ov.situation)} »</p>` : ''}
    ${ov.part != null ? `<p class="qf-situation" data-ouv-penalite><b>${qui} :</b> « ${ech(PHRASE_PENALITE)} »</p>` : ''}
    <div class="qo-cols" data-ouverture="${ech(ov.id)}">
      <section class="panneau qo-docs" aria-label="Documents">
        <div class="qo-onglets" role="tablist">${docs.map((d) => `<button type="button" role="tab" class="qo-onglet" data-ouv-doc="${ech(d.id)}"
          data-cle="onglet-${ech(d.id)}" aria-selected="${d.id === sel}">${ech(court(d))}</button>`).join('')}</div>
        <div class="qo-feuille" role="tabpanel">${ov.docs.get(sel).type === 'images' ? htmlVisuel(ov.docs.get(sel)) : o.feuille(sel)}</div>
      </section>
      <section class="panneau qo-bloc" aria-label="Questions">
        <div class="qo-pastilles" role="tablist" aria-label="Les questions">${pastilles}<span class="note" data-ouv-compte>${nb} sur ${n} répondues</span></div>
        ${htmlQuestion(M, q, reponse(db, M, q.id), { ...o.parQuestion(q.id), numero: `Question ${k + 1} sur ${n}`,
          aide: o.estProf ? '' : htmlAide(q, o.aideOuverte && o.aideOuverte(q.id)) })}
        <div class="qo-nav${ov.calculette === true ? ' qo-calc' : ''}">
          <button type="button" class="btn btn-s" data-ouv-aller="${k - 1}" data-cle="precedente" ${k === 0 ? 'disabled' : ''}>← Précédente</button>
          ${!dernier ? `<button type="button" class="btn btn-s" data-ouv-aller="${k + 1}" data-cle="suivante">Suivante →</button>`
            : o.estProf ? ''
            : toutes ? `<button type="button" class="btn btn-p" data-ouv-continuer data-cle="continuer">Continuer${ov.continuer ? ` : ${ech(ov.continuer)}` : ''} →</button>`
            : '<span class="note">Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.</span>'}
        </div>
      </section>
    </div>`;
}
