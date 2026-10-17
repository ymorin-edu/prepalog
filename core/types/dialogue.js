// La vue « DIALOGUE À CHOIX » : l'écran TÉLÉPHONE d'une séance d'entreprise (14/10/2026, brief
// `docs/briefs/MOTEUR-vue-dialogue.md`, lot 1 : la vue seule, essayée sur `outils/essai-dialogue.html` ; le lot 2 la branche
// dans `entreprise.js`).
//
// L'élève TÉLÉPHONE à quelqu'un. L'interlocuteur parle (une bulle) ; l'élève choisit ce qu'il répond parmi 2 à 4 répliques.
// Une réponse maladroite fait RÉAGIR l'interlocuteur comme le ferait une vraie personne, et l'élève répond à nouveau ; la
// réplique maladroite se grise (« déjà dit ») : personne n'est bloqué. Rien ne dit « juste » ou « faux » pendant l'appel :
// c'est la réaction du personnage qui le dit, et le ✓ / ✗ n'arrive qu'au bandeau de fin (jalons de la séance).
// En ÉVALUATION : aucune réaction corrective, aucun grisé ; la première réponse est LA réponse, l'interlocuteur enchaîne.
//
// ── CE QUE LA SÉANCE DÉCLARE (`telephone` dans `creerEntreprise`, lot 2) ─────────────────────────────────────────────
//   telephone: {
//     libelle: 'Téléphone',                 // entrée du menu (défaut)
//     quand: (db) => booléen,               // facultatif : l'entrée n'apparaît qu'une fois vrai
//     situation: 'Appelle le quai…',        // ce que montre l'écran avant tout appel
//     face: true,                           // facultatif : le dialogue se joue EN FACE À FACE (17/10/2026, ENT-8.7) : « Aller le voir »,
//                                           //   « Terminer », « Revenir le voir », « Personnes »… plus aucun mot de téléphone à l'écran
//                                           //   (table `LIBELLES`) ; refuse les `leurres` ; tout le reste (état, gestes, jalons) ne change pas
//     dialogues: [{
//       id: 'quai',                         // clé de l'état, JAMAIS modifiée
//       de: 'mehdi',                        // une personne de la séance ({ nom, role, appel? })
//       contact: { nom: 'Quai de réception — Rouvignies', detail: 'poste 214' },
//       quand: (db) => booléen,             // facultatif : le contact n'apparaît qu'une fois vrai
//       mode: 'guidage' | 'evaluation',     // facultatif (défaut : évaluation si la séance est une copie)
//       repliques: [{
//         id: 'accueil', dit: 'Quai de réception…' | (db) => texte,
//         choix: [{ v: 'presente', juste: true, lib: 'Bonjour, c’est {prenom}…' },
//                 { v: 'camion', lib: 'Salut…', reaction: 'Euh… bonjour. C’est qui ?' },
//                 { v: 'sec', lib: '…', reaction: '…', accepte: true },   // réagit ET passe à la suite (compte une reprise)
//                 { v: 'x', lib: '…', neutre: 'D’accord.' }],              // évaluation : phrase neutre avant la suite
//         selon: (db) => ({ dit?, libs?: { <v>: texte } }),   // textes calculés UNE FOIS, à l'arrivée de la réplique
//         melanger: false,                  // facultatif : choix dans l'ordre déclaré
//         actif: false,                     // facultatif : réplique mise de côté sans la supprimer
//         niveaux: ['confirme'],            // facultatif : la réplique n'est JOUÉE qu'à ces niveaux d'élève (lot 4, voir ci-dessous)
//       }],
//       fin: 'Bonne journée !',             // facultatif : dernière bulle de l'interlocuteur
//     }],
//     leurres: [{ id: 'claire', nom: 'Claire Vasseur', detail: 'transport amont',   // facultatif : contacts SANS dialogue
//                 message: 'Bonjour, vous êtes sur la messagerie de…', quand? }],    // (messagerie vocale, appel rangé)
//   }
// Les contacts (dialogues et leurres) sont classés par ordre alphabétique, comme un répertoire. Un seul appel à la fois.
// Appeler un leurre range { id, at } dans `etat['@leurres']` ; la séance le lit (et le fait payer) par `leurresAppeles`.
// `{prenom}` est remplacé par le prénom de l'élève dans `dit`, `lib`, `reaction`, `neutre`, `fin`. La réponse rangée est la
// CLÉ `v` du choix, jamais son rang : reformuler, réordonner, ajouter un choix ne change rien pour qui a déjà joué.
// Un choix peut porter `vers: '<id de réplique>'` (embranchement, lot 3) ; sans `vers`, l'appel est linéaire. Un choix juste
// (ou `accepte`) part vers sa réplique ; un choix maladroit qui porte `vers` fait AUSSI avancer (« Ce n'est pas de notre faute » →
// « le client s'énerve ») : il compte une reprise, sa `reaction` est alors facultative (la réplique visée parle). Contrôle : toute
// réplique atteignable mène au bout de l'appel par les bonnes réponses (pas de boucle sans issue).
// ÉVALUATION (copie, ou `mode: 'evaluation'`) : une `reaction` est facultative (elle n'est jamais montrée) ; `neutre` (facultatif,
// par choix) est dit avant la réplique suivante. Après la remise, l'appel se relit (« Relire l'appel »), rien ne s'écrit.
// Tout ce qui est mal déclaré empêche la vue de se créer, avec un message qui nomme le dialogue et la réplique.
//
// CONTENU SELON LE NIVEAU DE L'ÉLÈVE (lot 4, 17/10/2026, briefs ENT-8.7 §7.4 et ENT-8.8 §6 bis ; choix de Tristan : option 3).
// Le niveau ('standard', 'confirme', 'accompagne') est celui de `db.aisance`, lu par `niveauEleve` (`core/tirage.js`) ; TOUJOURS
// 'standard' en évaluation (copie) et pour l'enseignant. Deux réglages, facultatifs, qui ne changent rien quand ils sont absents :
//   - sur un CHOIX, `niveaux: ['standard', 'confirme']` : le choix n'est MONTRÉ qu'à ces niveaux (l'accompagné voit 2 réponses au
//     lieu de 3 : les deux autres portent `niveaux`) ;
//   - sur une RÉPLIQUE, `niveaux: ['confirme']` : la réplique n'est JOUÉE qu'à ces niveaux (une question de plus au confirmé) ; aux
//     autres niveaux, l'appel passe directement à la réplique suivante, comme si elle n'existait pas.
// Le niveau d'un appel est RANGÉ à son début (`appel.niveau`) : un réglage changé ensuite ne touche pas un appel commencé (un appel
// d'avant le lot 4, sans `niveau`, se joue au standard : tout ce qui n'a pas `niveaux` y est). Les gestes (`signaux`) portent toutes
// les répliques, jouées ou non. Contrôle au chargement, pour CHAQUE niveau dès qu'un `niveaux` est déclaré : il reste 2 à 4 choix
// et la bonne réponse à chaque réplique jouée, chaque `vers` vise une réplique jouée à ce niveau, et toute branche finit ; les
// messages disent le niveau. `repliquesPour(D, niveau)` rend les répliques jouées à un niveau, avec leurs choix montrés.
//
// ── L'ÉTAT (cloisonné par séance dans la base : `db.dialogues[<séance>]`) ────────────────────────────────────
//   { <dialogue>: { appels: [{ debut, fin?, niveau?, ordres: { <réplique>: [v, …] }, textes: { <réplique>: { dit?, libs? } },
//                              pas: [{ r, v, at }], reprises }] } }
// Le premier appel est le premier essai ; « Rappeler » (correction) en ajoute un. La position dans l'appel se DÉDUIT des
// `pas` (rien d'autre n'est rangé) : un rechargement retrouve l'appel à la même réplique, mêmes textes, même ordre, mêmes grisés.
//
// ── CE QUE `creerTelephone` REND ──────────────────────────────────────────────────────────────────────────────────────
//   { id, nav: { libelle }, quand, situation, dialogues, signaux, etatNeuf, html(etat, api), brancher(z, etat, api) }
//   api : { estProf, graine, prenom, db, seance, sauver(), figee, evaluation, rappel(id) → booléen, signal(geste), delai,
//           apresFin(id) }   (`seance` est passé aux `quand(db, seance)` ; `apresFin` : le moteur redessine son menu au raccrochage)
// Lot 2 (14/10/2026) : branchée par `entreprise.js` (option `telephone`, écran « telephone »), état dans
// `db.dialogues[<séance>]`, lectures pour les jalons plus bas (`appelRetenuDe`, `jalonDialogue`), `dialogueFini` dans
// `core/declencheurs.js`.
// L'enseignant joue l'appel sur une copie en mémoire : rien n'est écrit.

import { ech } from '../ui.js';
import { garderFocus, retrouverFocus, auClavier } from '../gestes.js';
import { hasard, niveauEleve, NIVEAUX_ELEVE } from '../tirage.js';

const ID_OK = /^[a-z0-9][a-z0-9-]*$/;
// Le niveau d'un appel qui commence : celui de l'élève dans la séance, 'standard' en évaluation (copie) et pour l'enseignant.
const niveauDe = (api) => (api.estProf ? 'standard' : niveauEleve(api.db || {}, { copie: !!api.evaluation }));
// Un choix ou une réplique est-il présent à ce niveau ? (sans `niveaux` : partout)
const auNiveau = (x, n) => !Array.isArray(x.niveaux) || x.niveaux.includes(n);
// Les répliques JOUÉES à un niveau, chacune avec les choix MONTRÉS à ce niveau (lot 4) ; sans `niveaux` nulle part, les répliques telles quelles.
export const repliquesPour = (D, niveau) => (D.parNiveau && D.parNiveau[niveau]) || D.repliques;
const DELAI = 700;                      // ms avant la réponse de l'interlocuteur : un effet d'affichage, rien ne s'y compte

// LES TEXTES DU MOTEUR À L'ÉCRAN, en deux jeux : au téléphone (par défaut) et en face à face (`face: true`, 17/10/2026, ENT-8.7 :
// un stagiaire accueille un chauffeur sur le quai). Une seule table : rien d'autre dans la vue ne dit « appel » à l'élève.
// (Les contacts sans dialogue — messagerie vocale, « Ça sonne… » — n'existent qu'au téléphone : `face` les refuse.)
const LIBELLES = {
  telephone: {
    titre: 'Contacts', aucun: 'Aucun numéro à appeler pour l’instant.', situation: 'Choisis un numéro à appeler.',
    appeler: '📞 Appeler', rappeler: '📞 Rappeler', reprendre: 'Reprendre l’appel', relire: 'Relire l’appel', terminer: 'Raccrocher',
    etatEnCours: 'Appel en cours', etatFini: 'Appel terminé', statutEnCours: 'En communication', statutFini: 'Appel terminé', aria: 'Appel',
  },
  face: {
    titre: 'Personnes', aucun: 'Personne à voir pour l’instant.', situation: 'Choisis qui aller voir.',
    appeler: 'Aller le voir', rappeler: 'Revenir le voir', reprendre: 'Reprendre', relire: 'Relire', terminer: 'Terminer',
    etatEnCours: 'En face à face', etatFini: 'Terminé', statutEnCours: 'En face à face', statutFini: 'Terminé', aria: 'Entretien',
  },
};

const nomDe = (p) => (p && (p.appel || String(p.nom || '').split(' ')[0])) || '';
const avecPrenom = (t, prenom) => String(t == null ? '' : t).replace(/\{prenom\}/g, prenom || '');

/* ================================================================ contrôle au chargement */
// `evaluation` : la séance est une copie (le mode par défaut de ses dialogues est alors l'évaluation, où une `reaction` est facultative).
export function compilerTelephone(T, personnes = {}, { evaluation = false } = {}) {
  const err = (m) => { throw new Error(`telephone : ${m}`); };
  if (!T || typeof T !== 'object') err('le bloc est vide');
  if (T.quand != null && typeof T.quand !== 'function') err('`quand` est une fonction (db) => booléen');
  if (T.face != null && typeof T.face !== 'boolean') err('`face` vaut true ou false (le dialogue se joue en face à face, sans mot de téléphone)');
  if (T.face === true && Array.isArray(T.leurres) && T.leurres.length) err('face à face : pas de leurres (messagerie vocale)');
  if (!Array.isArray(T.dialogues) || !T.dialogues.length) err('il faut au moins un dialogue dans `dialogues`');
  const ids = new Set();
  const dialogues = T.dialogues.map((d, k) => {
    const ici = `dialogue ${d && d.id ? `« ${d.id} »` : `n° ${k + 1}`}`;
    if (!d || !d.id || !ID_OK.test(d.id)) err(`${ici} : l’id ne prend que des minuscules sans accent, des chiffres et des tirets`);
    if (ids.has(d.id)) err(`${ici} : id en double`);
    ids.add(d.id);
    if (!personnes[d.de]) err(`${ici} : \`de\` = « ${d.de} » n’est pas une personne de la séance (${Object.keys(personnes).join(', ') || 'aucune déclarée'})`);
    if (!d.contact || !d.contact.nom) err(`${ici} : il manque \`contact.nom\` (la ligne de la liste des contacts)`);
    if (d.quand != null && typeof d.quand !== 'function') err(`${ici} : \`quand\` est une fonction (db) => booléen`);
    if (d.mode != null && !['guidage', 'evaluation'].includes(d.mode)) err(`${ici} : \`mode\` vaut 'guidage' ou 'evaluation'`);
    const enEval = d.mode ? d.mode === 'evaluation' : evaluation;
    const repliques = (d.repliques || []).filter((r) => r && r.actif !== false);
    if (!repliques.length) err(`${ici} : il faut au moins une réplique active`);
    const rids = new Set();
    repliques.forEach((r) => {
      const la = `${ici}, réplique ${r.id ? `« ${r.id} »` : 'sans id'}`;
      if (!r.id || !ID_OK.test(r.id)) err(`${la} : l’id ne prend que des minuscules sans accent, des chiffres et des tirets`);
      if (rids.has(r.id)) err(`${la} : id en double`);
      rids.add(r.id);
      if (!r.dit || !['string', 'function'].includes(typeof r.dit)) err(`${la} : il manque \`dit\` (ce que dit l’interlocuteur : un texte ou (db) => texte)`);
      verifierNiveaux(r, `${la} : \`niveaux\` de la réplique`, err);
      if (!Array.isArray(r.choix) || r.choix.length < 2 || r.choix.length > 4) err(`${la} : il faut 2 à 4 choix`);
      const vs = new Set();
      r.choix.forEach((c) => {
        if (!c || !c.v || !c.lib) err(`${la} : chaque choix porte une clé courte \`v\` et un texte \`lib\``);
        if (vs.has(c.v)) err(`${la} : clé \`v\` = « ${c.v} » en double`);
        vs.add(c.v);
        verifierNiveaux(c, `${la} : \`niveaux\` du choix « ${c.v} »`, err);
      });
      const justes = r.choix.filter((c) => c.juste);
      if (justes.length !== 1) err(`${la} : il faut exactement un choix \`juste: true\` (${justes.length} trouvé${justes.length > 1 ? 's' : ''})`);
      r.choix.forEach((c) => {
        // Un choix non juste qui part vers une autre réplique (`vers`) peut se passer de réaction : la réplique visée parle.
        if (!c.juste && !c.reaction && !c.vers && !enEval) err(`${la} : le choix « ${c.v} » n’est pas juste et n’a pas de \`reaction\` (ce que répond l’interlocuteur)`);
        if (c.juste && (c.reaction || c.accepte)) err(`${la} : le choix juste « ${c.v} » n’a ni \`reaction\` ni \`accepte\``);
        if (c.accepte && !c.reaction) err(`${la} : le choix « ${c.v} » est \`accepte\` mais n’a pas de \`reaction\``);
        if (c.neutre != null && (typeof c.neutre !== 'string' || !c.neutre.trim())) err(`${la} : \`neutre\` du choix « ${c.v} » est une phrase (ou absent)`);
      });
      if (r.selon != null) {
        if (typeof r.selon !== 'function') err(`${la} : \`selon\` est une fonction (db) => { dit?, libs? }`);
        let t; try { t = r.selon({}) || {}; } catch (x) { err(`${la} : \`selon\` plante sur une base vide (${x.message})`); }
        Object.keys(t.libs || {}).forEach((v) => { if (!vs.has(v)) err(`${la} : \`selon\` rend la clé « ${v} », qui n’est pas un choix (${[...vs].join(', ')})`); });
      }
      if (typeof r.dit === 'function') { try { r.dit({}); } catch (x) { err(`${la} : \`dit\` plante sur une base vide (${x.message})`); } }
    });
    // LES EMBRANCHEMENTS (lot 3) : chaque `vers` vise une réplique, et TOUTE BRANCHE FINIT. Les répliques qu'on peut atteindre
    // (par n'importe quel choix : en évaluation, chaque réponse fait avancer) ; depuis chacune, la suite des bonnes réponses doit
    // arriver au bout de l'appel sans repasser deux fois au même endroit. En guidage, les maladresses se grisent et la bonne
    // réponse reste : c'est elle qui garantit qu'aucun élève ne tourne en rond.
    repliques.forEach((r) => r.choix.forEach((c) => {
      if (c.vers != null && !rids.has(c.vers)) err(`${ici}, réplique « ${r.id} » : \`vers\` = « ${c.vers} » n’est pas une réplique`);
    }));
    // PAR NIVEAU (lot 4) : dès qu'un `niveaux` est déclaré, les répliques jouées et les choix montrés à chaque niveau sont vérifiés à part
    // (2 à 4 choix, la bonne réponse présente, `vers` vers une réplique jouée, toute branche finit) ; sans `niveaux`, une seule passe, celle
    // d'aujourd'hui, avec les mêmes messages.
    const avecNiveaux = repliques.some((r) => Array.isArray(r.niveaux) || r.choix.some((c) => Array.isArray(c.niveaux)));
    const parNiveau = {};
    (avecNiveaux ? NIVEAUX_ELEVE : ['standard']).forEach((n) => {
      const ou = avecNiveaux ? ` au niveau « ${n} »` : '';
      const Rn = repliques.filter((r) => auNiveau(r, n)).map((r) => ({ ...r, choix: r.choix.filter((c) => auNiveau(c, n)) }));
      if (!Rn.length) err(`${ici} : aucune réplique jouée${ou}`);
      const idsN = new Set(Rn.map((r) => r.id));
      if (avecNiveaux) Rn.forEach((r) => {
        const la = `${ici}, réplique « ${r.id} »`;
        if (r.choix.length < 2 || r.choix.length > 4) err(`${la} : il faut 2 à 4 choix${ou} (${r.choix.length} montré${r.choix.length > 1 ? 's' : ''})`);
        if (!r.choix.some((c) => c.juste)) err(`${la} : la bonne réponse manque${ou} (son \`niveaux\` ne le comprend pas)`);
        r.choix.forEach((c) => { if (c.vers != null && !idsN.has(c.vers)) err(`${la} : \`vers\` = « ${c.vers} » n’est pas une réplique jouée${ou}`); });
      });
      const atteintes = new Set([0]);
      for (const pile = [0]; pile.length;) {
        const i = pile.pop();
        Rn[i].choix.forEach((c) => { const j = suivante(Rn, i, c); if (j < Rn.length && !atteintes.has(j)) { atteintes.add(j); pile.push(j); } });
      }
      [...atteintes].sort((a, b) => a - b).forEach((depart) => {
        const vus = new Set();
        for (let i = depart; i < Rn.length;) {
          if (vus.has(i)) err(`${ici} : depuis la réplique « ${Rn[depart].id} », les bonnes réponses tournent en rond (réplique « ${Rn[i].id} ») : l’appel ne finit jamais${ou}`);
          vus.add(i);
          i = suivante(Rn, i, Rn[i].choix.find((c) => c.juste));
        }
      });
      parNiveau[n] = Rn;
    });
    return { ...d, repliques, parNiveau: avecNiveaux ? parNiveau : null, personne: personnes[d.de] };
  });
  // LES CONTACTS SANS DIALOGUE (« leurres », décision de Tristan du 14/10/2026) : ils répondent par une messagerie vocale.
  // Choisir QUI appeler fait partie de C2.6.2 : chaque appel est rangé, la séance le lit (et le fait payer) par `leurresAppeles`.
  if (T.leurres != null && !Array.isArray(T.leurres)) err('`leurres` est une liste de contacts { id, nom, detail?, message }');
  const leurres = (T.leurres || []).map((l, k) => {
    const ici = `contact sans dialogue ${l && l.id ? `« ${l.id} »` : `n° ${k + 1}`}`;
    if (!l || !l.id || !ID_OK.test(l.id)) err(`${ici} : l’id ne prend que des minuscules sans accent, des chiffres et des tirets`);
    if (ids.has(l.id)) err(`${ici} : id déjà pris par un autre contact`);
    ids.add(l.id);
    if (!l.nom) err(`${ici} : il manque \`nom\``);
    if (!l.message) err(`${ici} : il manque \`message\` (ce que dit la messagerie vocale)`);
    if (l.quand != null && typeof l.quand !== 'function') err(`${ici} : \`quand\` est une fonction (db) => booléen`);
    return { ...l };
  });
  return { libelle: T.libelle || 'Téléphone', quand: T.quand || null, situation: T.situation || '', dialogues, leurres, face: T.face === true };
}

// `niveaux` (facultatif) : une liste non vide de niveaux connus.
function verifierNiveaux(x, ou, err) {
  if (x.niveaux == null) return;
  if (!Array.isArray(x.niveaux) || !x.niveaux.length || x.niveaux.some((n) => !NIVEAUX_ELEVE.includes(n))) err(`${ou} est une liste parmi ${NIVEAUX_ELEVE.join(', ')}`);
}

// L'indice de la réplique qui suit, après le choix `c` à la réplique `i` (au-delà du dernier : l'appel est fini).
function suivante(repliques, i, c) {
  if (c && c.vers) return repliques.findIndex((r) => r.id === c.vers);
  return i + 1;
}

/* ================================================================ lectures (jalons, corrigés) */
export const appels = (etatD) => (etatD && etatD.appels) || [];
export const appelEnCours = (etatD) => appels(etatD).find((a) => !a.fin) || null;
// Le DERNIER appel terminé (raccroché), ou null : c'est lui que lisent les jalons (un élève qui rappelle est lu sur son rappel).
export const appelRetenu = (etatD) => { const L = appels(etatD).filter((a) => a.fin); return L.length ? L[L.length - 1] : null; };
export const reprises = (appel) => (appel && appel.reprises) || 0;
// La clé `v` du PREMIER choix dit à cette réplique dans cet appel (ou null).
export const premiereReponse = (appel, r) => { const p = appel && (appel.pas || []).find((x) => x.r === r); return p ? p.v : null; };
// Les contacts sans dialogue que l'élève a appelés (ids, dans l'ordre, sans doublon). Avec `avant: '<dialogue>'` : seulement
// ceux appelés AVANT le premier appel de ce dialogue (« il s'est trompé de numéro avant d'appeler le quai »).
export const CLE_LEURRES = '@leurres';
export function leurresAppeles(etat, { avant } = {}) {
  const L = (etat && etat[CLE_LEURRES]) || [];
  const debut = avant ? ((appels(etat && etat[avant])[0] || {}).debut ?? Infinity) : Infinity;
  return [...new Set(L.filter((x) => x.at < debut).map((x) => x.id))];
}

// LES LECTURES SUR LA BASE (lot 2) : l'état d'un dialogue est cloisonné par séance, `db.dialogues[<séance>][<dialogue>]`.
// Un jalon reçoit la base seule : la séance passe son propre id (celui de son `meta`).
export const dialogueDe = (db, seance, id) => (db && db.dialogues && db.dialogues[seance] && db.dialogues[seance][id]) || null;
export const appelRetenuDe = (db, seance, id) => appelRetenu(dialogueDe(db, seance, id));
// Un jalon tout prêt (à poser dans `etapes`) : « à faire » tant qu'aucun appel n'est terminé (rien de vrai avant, un appel
// abandonné reste à faire), puis `juge(appel, db)` sur le DERNIER appel terminé. `ecran: 'dialogue:<id>'` : « Corriger »
// rouvre ce contact avec « Rappeler ». Le moteur vérifie à l'ouverture que le dialogue existe dans la séance.
export function jalonDialogue({ seance, dialogue, juge, ...jalon }) {
  if (!seance || !dialogue || typeof juge !== 'function') throw new Error('jalonDialogue : il faut { seance, dialogue, juge(appel, db) }');
  return { ...jalon, dialogue, ecran: `dialogue:${dialogue}`,
    verifier(db) {
      const a = appelRetenuDe(db, seance, dialogue);
      if (!a) return { status: 'attente' };
      return { status: juge(a, db) ? 'ok' : 'ko' };
    } };
}
// Le journal court des appels TERMINÉS, pour l'enseignant (remonte avec la note, lu dans le Repérage) : par dialogue, un
// élément par appel { reprises, pas: 'réplique:clé …' } ; les contacts sans dialogue appelés. Rien d'un appel en cours :
// la note ne se réécrit pas à chaque réplique.
export function journalCourt(etat) {
  const J = {};
  Object.entries(etat || {}).forEach(([id, eD]) => {
    if (id === CLE_LEURRES) { if (eD && eD.length) J[CLE_LEURRES] = eD.map((x) => x.id); return; }
    const L = appels(eD).filter((a) => a.fin).map((a) => ({ reprises: reprises(a), pas: (a.pas || []).map((p) => `${p.r}:${p.v}`).join(' ') }));
    if (L.length) J[id] = L;
  });
  return Object.keys(J).length ? J : null;
}

/* ================================================================ le déroulé d'un appel */
// Tout se DÉDUIT des pas : où en est l'appel, les bulles dans l'ordre, les choix grisés à la réplique en cours.
// Les répliques sont celles du niveau de l'appel (`appel.niveau`, rangé à son début ; un appel sans niveau se joue au standard).
export function deroule(D, appel, { prenom = '', evaluation = false } = {}) {
  const R = repliquesPour(D, (appel && appel.niveau) || 'standard'), lui = nomDe(D.personne);
  const textes = (appel && appel.textes) || {};
  const dit = (r) => avecPrenom(textes[r.id] && textes[r.id].dit != null ? textes[r.id].dit : (typeof r.dit === 'string' ? r.dit : ''), prenom);
  const lib = (r, c) => avecPrenom((textes[r.id] && textes[r.id].libs && textes[r.id].libs[c.v]) || c.lib, prenom);
  let i = 0;
  const bulles = [{ qui: 'lui', t: dit(R[0]), r: R[0].id }];
  const grises = new Set();
  ((appel && appel.pas) || []).forEach((p) => {
    const r = R[i];
    if (!r || p.r !== r.id) return;                       // un pas d'une réplique retirée depuis : ignoré
    const c = r.choix.find((x) => x.v === p.v);
    if (!c) return;
    bulles.push({ qui: 'moi', t: lib(r, c), r: r.id, v: c.v });
    let passe = false;
    if (evaluation) {
      if (c.neutre) bulles.push({ qui: 'lui', t: avecPrenom(c.neutre, prenom) });
      passe = true;
    } else if (c.juste) passe = true;
    else {
      // Une maladresse : le personnage réagit (s'il y a une réaction), la réponse se grise ; elle fait avancer si elle est
      // `accepte` ou si elle part vers une autre réplique (`vers` : la conversation prend une autre tournure).
      if (c.reaction) bulles.push({ qui: 'lui', t: avecPrenom(c.reaction, prenom), reaction: true });
      grises.add(c.v);
      passe = !!(c.accepte || c.vers);
    }
    if (passe) {
      grises.clear();
      i = suivante(R, i, c);
      if (i < R.length) bulles.push({ qui: 'lui', t: dit(R[i]), r: R[i].id });
    }
  });
  const fini = i >= R.length;
  if (fini && D.fin) bulles.push({ qui: 'lui', t: avecPrenom(D.fin, prenom) });
  return { replique: fini ? null : R[i], fini, bulles, grises, lui, lib };
}

/* ================================================================ la vue */
export function creerTelephone(T, { personnes = {}, evaluation = false } = {}) {
  const M = compilerTelephone(T, personnes, { evaluation });
  const parId = new Map(M.dialogues.map((D) => [D.id, D]));
  const leurreDe = new Map(M.leurres.map((l) => [l.id, l]));
  const TX = LIBELLES[M.face ? 'face' : 'telephone'];       // les textes du moteur à l'écran
  const signaux = M.dialogues.flatMap((D) => [`dialogue:${D.id}:appeler`, ...D.repliques.map((r) => `dialogue:${D.id}:${r.id}`), `dialogue:${D.id}:fin`])
    .concat(M.leurres.map((l) => `dialogue:${l.id}:appeler`));
  const etatNeuf = () => ({});
  // L'état de l'écran (pas de la base) : le contact ouvert, la réponse en train d'arriver, la copie de l'enseignant.
  const ui = { sel: null, attente: false, jeton: 0, prof: null, vide: false };

  const estEval = (D, api) => (D.mode ? D.mode === 'evaluation' : !!api.evaluation);
  const etatDe = (etat, api) => (api.estProf ? (ui.prof || (ui.prof = {})) : etat);
  const visibles = (api) => M.dialogues.filter((D) => api.estProf || !D.quand || D.quand(api.db || {}, api.seance));
  const leurresVisibles = (api) => M.leurres.filter((l) => api.estProf || !l.quand || l.quand(api.db || {}, api.seance));
  const nomContact = (x) => (leurreDe.has(x.id) ? x.nom : x.contact.nom);
  // Un contact sans dialogue qu'on vient d'appeler : sa messagerie vocale, puis « Raccrocher ».
  function htmlLeurre(l) {
    return `<section class="dlg-appel" aria-label="${ech(`Appel : ${l.nom}`)}">
      <header class="dlg-tete"><span class="dlg-initiale grande" aria-hidden="true">${ech(l.nom.slice(0, 1).toUpperCase())}</span>
        <span class="dlg-qui"><b>${ech(l.nom)}</b>${l.detail ? `<span>${ech(l.detail)}</span>` : ''}</span>
        <span class="dlg-statut">Messagerie vocale</span></header>
      <div class="dlg-fil" data-dlg-fil aria-live="polite">${ui.attente
        ? '<div class="dlg-bulle lui points" aria-label="Ça sonne…"><span></span><span></span><span></span></div>'
        : `<div class="dlg-bulle lui"><span class="dlg-dit">Messagerie vocale</span>${ech(l.message)}</div>`}</div>
      <div class="dlg-reponses"><button type="button" class="dlg-btn plein dlg-raccrocher" data-dlg-raccrocher-leurre>Raccrocher</button></div></section>`;
  }

  // L'arrivée d'une réplique : ordre des choix tiré (graine de l'élève + dialogue + réplique + numéro de l'appel) et textes
  // calculés, rangés une fois. Ne bouge plus ensuite.
  function arriver(D, appel, n, r, api) {
    if (!r || (appel.ordres && appel.ordres[r.id])) return;
    const vs = r.choix.map((c) => c.v);
    (appel.ordres || (appel.ordres = {}))[r.id] = r.melanger === false ? vs : hasard(`${api.graine || ''}|${D.id}|${r.id}|${n}`).melanger(vs);
    const t = {};
    if (typeof r.dit === 'function') t.dit = String(r.dit(api.db || {}) || '');
    if (r.selon) {
      const s = r.selon(api.db || {}) || {};
      if (s.dit != null) t.dit = String(s.dit);
      if (s.libs) t.libs = Object.fromEntries(Object.entries(s.libs).filter(([v, x]) => vs.includes(v) && x).map(([v, x]) => [v, String(x)]));
    }
    if (Object.keys(t).length) (appel.textes || (appel.textes = {}))[r.id] = t;
  }

  /* ---------------------------------------------------------------- dessin */
  // Les contacts dans l'ordre alphabétique, comme un répertoire : le bon numéro n'est pas toujours le premier.
  function htmlContacts(E, api) {
    const L = [...visibles(api), ...leurresVisibles(api)].sort((a, b) => nomContact(a).localeCompare(nomContact(b), 'fr'));
    if (!L.length) return `<p class="note">${ech(TX.aucun)}</p>`;
    const occupe = M.dialogues.find((x) => appelEnCours(E[x.id]));
    return `<ul class="dlg-contacts">${L.map((D) => {
      if (leurreDe.has(D.id)) {
        return `<li class="dlg-contact${ui.sel === D.id ? ' choisi' : ''}">
          <span class="dlg-initiale" aria-hidden="true">${ech(D.nom.slice(0, 1).toUpperCase())}</span>
          <span class="dlg-qui"><b>${ech(D.nom)}</b>${D.detail ? `<span>${ech(D.detail)}</span>` : ''}</span>
          ${api.figee || occupe ? '' : `<button type="button" class="dlg-btn plein" data-dlg-appeler="${ech(D.id)}">📞 Appeler</button>`}</li>`;
      }
      const eD = E[D.id], enCours = appelEnCours(eD), fait = appelRetenu(eD);
      const etat = enCours ? TX.etatEnCours : fait ? TX.etatFini : '';
      let bouton;
      // Copie rendue (évaluation) : on relit ce qui a été dit, on n'appelle plus. `data-libre` : le verrou de la copie le laisse passer.
      const relire = `<button type="button" class="dlg-btn lien" data-dlg-journal="${ech(D.id)}" data-libre>${ech(TX.relire)}</button>`;
      if (api.figee) bouton = (enCours || fait) && ui.sel !== D.id ? relire : '';
      else if ((enCours && ui.sel === D.id) || (occupe && occupe !== D)) bouton = '';
      else if (enCours) bouton = `<button type="button" class="dlg-btn plein" data-dlg-appeler="${ech(D.id)}">${ech(TX.reprendre)}</button>`;
      else if (!fait) bouton = `<button type="button" class="dlg-btn plein" data-dlg-appeler="${ech(D.id)}">${ech(TX.appeler)}</button>`;
      else if (!api.figee && !estEval(D, api) && (api.estProf || (api.rappel && api.rappel(D.id)))) bouton = `<button type="button" class="dlg-btn" data-dlg-appeler="${ech(D.id)}">${ech(TX.rappeler)}</button>`;
      else bouton = relire;
      return `<li class="dlg-contact${ui.sel === D.id ? ' choisi' : ''}">
        <span class="dlg-initiale" aria-hidden="true">${ech(nomDe(D.personne).slice(0, 1).toUpperCase())}</span>
        <span class="dlg-qui"><b>${ech(D.contact.nom)}</b>${D.contact.detail ? `<span>${ech(D.contact.detail)}</span>` : ''}
          ${etat ? `<span class="dlg-etat">${etat}</span>` : ''}</span>
        ${bouton}</li>`;
    }).join('')}</ul>`;
  }

  function htmlBulles(bulles, lui, moi) {
    return bulles.map((b) => (b.points
      ? `<div class="dlg-bulle lui points" aria-label="${ech(lui)} répond…"><span></span><span></span><span></span></div>`
      : `<div class="dlg-bulle ${b.qui}${b.reaction ? ' reaction' : ''}"><span class="dlg-dit">${ech(b.qui === 'lui' ? lui : moi)}</span>${ech(b.t)}</div>`)).join('');
  }

  function htmlAppel(D, E, api) {
    const eD = E[D.id], enCours = appelEnCours(eD), appel = enCours || appelRetenu(eD);
    const P = D.personne, lui = nomDe(P), moi = api.prenom || 'Toi';
    const evaluation = estEval(D, api);
    const X = deroule(D, appel, { prenom: api.prenom, evaluation });
    let bulles = X.bulles;
    if (enCours && ui.attente) {
      const k = bulles.map((b) => b.qui).lastIndexOf('moi');
      bulles = bulles.slice(0, k + 1).concat([{ points: true }]);
    }
    let bas = '';
    if (enCours && !api.figee) {
      if (ui.attente) bas = '<div class="dlg-reponses"><p class="dlg-titre-rep">Ta réponse</p></div>';
      else if (X.fini) bas = `<div class="dlg-reponses"><button type="button" class="dlg-btn plein dlg-raccrocher" data-dlg-raccrocher>${ech(TX.terminer)}</button></div>`;
      else {
        const r = X.replique;
        const ordre = (enCours.ordres && enCours.ordres[r.id]) || r.choix.map((c) => c.v);
        const choix = ordre.map((v) => r.choix.find((c) => c.v === v)).filter(Boolean);
        bas = `<div class="dlg-reponses" role="group" aria-label="Ta réponse"><p class="dlg-titre-rep">Ta réponse</p>${choix.map((c) => {
          const gris = !evaluation && X.grises.has(c.v);
          return `<button type="button" class="dlg-choix${gris ? ' dit' : ''}" data-dlg-choix="${ech(c.v)}"${gris ? ' disabled aria-disabled="true"' : ''}>
            <span class="dlg-choix-txt">${ech(X.lib(r, c))}</span>${gris ? '<span class="dlg-deja">déjà dit</span>' : ''}${api.estProf && c.juste ? '<span class="dlg-attendue">réponse attendue</span>' : ''}</button>`;
        }).join('')}</div>`;
      }
    }
    const statut = enCours ? TX.statutEnCours : `${TX.statutFini}${appel && appel.fin ? ` à ${heure(appel.fin)}` : ''}`;
    return `<section class="dlg-appel" aria-label="${ech(`${TX.aria} : ${D.contact.nom}`)}">
      <header class="dlg-tete"><span class="dlg-initiale grande" aria-hidden="true">${ech(lui.slice(0, 1).toUpperCase())}</span>
        <span class="dlg-qui"><b>${ech(P.nom || lui)}</b><span>${ech([P.role, D.contact.nom].filter(Boolean).join(' · '))}</span></span>
        <span class="dlg-statut${enCours ? ' en-cours' : ''}">${statut}</span></header>
      <div class="dlg-fil" data-dlg-fil aria-live="polite">${htmlBulles(bulles, lui, moi)}</div>
      ${bas}</section>`;
  }

  function html(etat, api) {
    const E = etatDe(etat, api);
    // Un appel en cours se retrouve en ouvrant l'écran ; sinon, le journal du dernier appel terminé.
    if (!ui.sel && !ui.vide) {
      const L = visibles(api);
      const D = L.find((x) => appelEnCours(E[x.id])) || L.find((x) => appelRetenu(E[x.id]));
      if (D) ui.sel = D.id;
    }
    const D = ui.sel && parId.get(ui.sel);
    const droite = ui.sel && leurreDe.has(ui.sel) ? htmlLeurre(leurreDe.get(ui.sel))
      : D && (appelEnCours(E[D.id]) || appelRetenu(E[D.id])) ? htmlAppel(D, E, api)
      : `<div class="dlg-repos"><p>${ech(M.situation || TX.situation)}</p></div>`;
    return `<div class="dlg" data-dlg>
      <aside class="dlg-gauche"><h2 class="dlg-h">${ech(TX.titre)}</h2>${htmlContacts(E, api)}</aside>
      <div class="dlg-droite">${droite}</div></div>`;
  }

  /* ---------------------------------------------------------------- actions */
  function brancher(z, etat, api) {
    const E = etatDe(etat, api);
    const ecrire = () => { if (!api.estProf) api.sauver(); };
    const signal = (g) => { if (!api.estProf && api.signal) api.signal(g); };
    const delai = () => (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 0
      : (api.delai != null ? api.delai : DELAI));
    function redessiner(focus) {
      garderFocus(z, () => { z.innerHTML = html(etat, api); });
      relier();
      const fil = z.querySelector('[data-dlg-fil]');
      if (fil) fil.scrollTop = fil.scrollHeight;
      if (focus && auClavier()) retrouverFocus(z, focus);
    }
    function relier() {
      z.querySelectorAll('[data-dlg-appeler]').forEach((b) => b.addEventListener('click', () => appeler(b.dataset.dlgAppeler)));
      z.querySelectorAll('[data-dlg-journal]').forEach((b) => b.addEventListener('click', () => { ui.sel = b.dataset.dlgJournal; ui.vide = false; redessiner(); }));
      z.querySelectorAll('[data-dlg-choix]:not([disabled])').forEach((b) => b.addEventListener('click', () => repondre(b.dataset.dlgChoix)));
      z.querySelector('[data-dlg-raccrocher]')?.addEventListener('click', raccrocher);
      z.querySelector('[data-dlg-raccrocher-leurre]')?.addEventListener('click', () => { ui.sel = null; ui.attente = false; ui.jeton++; ui.vide = true; redessiner('[data-dlg-appeler]'); });
    }
    function appeler(id) {
      ui.vide = false;
      if (leurreDe.has(id)) { appelerLeurre(id); return; }
      const D = parId.get(id);
      if (!D || api.figee) return;
      const eD = E[id] || (E[id] = { appels: [] });
      ui.sel = id; ui.attente = false;
      if (!appelEnCours(eD)) {
        const deja = appelRetenu(eD);
        if (deja && (estEval(D, api) || !(api.estProf || (api.rappel && api.rappel(id))))) { redessiner(); return; }
        // Le niveau de l'élève est rangé avec l'appel (lot 4) : les répliques jouées et les choix montrés sont ceux de ce niveau jusqu'au bout.
        const niveau = niveauDe(api);
        const appel = { debut: Date.now(), niveau, ordres: {}, textes: {}, pas: [], reprises: 0 };
        eD.appels.push(appel);
        arriver(D, appel, eD.appels.length, repliquesPour(D, niveau)[0], api);
        if (eD.appels.length === 1) signal(`dialogue:${id}:appeler`);
        ecrire();
      }
      redessiner('[data-dlg-choix]:not([disabled])');
    }
    // Un contact sans dialogue : l'appel est rangé (l'heure compte : avant ou après le bon numéro), la messagerie répond.
    function appelerLeurre(id) {
      if (api.figee || M.dialogues.some((x) => appelEnCours(E[x.id]))) return;
      (E[CLE_LEURRES] || (E[CLE_LEURRES] = [])).push({ id, at: Date.now() });
      signal(`dialogue:${id}:appeler`);
      ecrire();
      ui.sel = id;
      const ms = delai();
      if (!ms) { redessiner('[data-dlg-raccrocher-leurre]'); return; }
      ui.attente = true;
      const j = ++ui.jeton;
      redessiner();
      setTimeout(() => {
        if (j !== ui.jeton || !z.isConnected) return;
        ui.attente = false;
        redessiner('[data-dlg-raccrocher-leurre]');
      }, ms);
    }
    function repondre(v) {
      if (ui.attente || api.figee) return;              // un double-clic ne dit pas deux répliques
      const D = parId.get(ui.sel), eD = D && E[D.id], appel = eD && appelEnCours(eD);
      if (!appel) return;
      const evaluation = estEval(D, api);
      const avant = deroule(D, appel, { prenom: api.prenom, evaluation });
      const r = avant.replique;
      const c = r && r.choix.find((x) => x.v === v);
      if (!c || (!evaluation && avant.grises.has(v))) return;
      const premiere = !appel.pas.some((p) => p.r === r.id);
      appel.pas.push({ r: r.id, v, at: Date.now() });
      if (!c.juste) appel.reprises = (appel.reprises || 0) + 1;
      const apres = deroule(D, appel, { prenom: api.prenom, evaluation });
      if (apres.replique && apres.replique !== r) arriver(D, appel, eD.appels.length, apres.replique, api);
      if (premiere && eD.appels.length === 1) signal(`dialogue:${D.id}:${r.id}`);
      ecrire();
      const ms = delai();
      if (!ms) { redessiner('[data-dlg-choix]:not([disabled]), [data-dlg-raccrocher]'); return; }
      ui.attente = true;
      const j = ++ui.jeton;
      redessiner();
      setTimeout(() => {
        if (j !== ui.jeton || !z.isConnected) { ui.attente = false; return; }
        ui.attente = false;
        redessiner('[data-dlg-choix]:not([disabled]), [data-dlg-raccrocher]');
      }, ms);
    }
    function raccrocher() {
      const D = parId.get(ui.sel), eD = D && E[D.id], appel = eD && appelEnCours(eD);
      if (api.figee || !appel || !deroule(D, appel, { evaluation: estEval(D, api) }).fini) return;
      appel.fin = Date.now();
      signal(`dialogue:${D.id}:fin`);
      ecrire();
      redessiner('[data-dlg-appeler], [data-dlg-journal]');
      // Le moteur redessine son menu (un écran ouvert par `dialogueFini`, la marque « appel en cours » qui part).
      if (!api.estProf && api.apresFin) api.apresFin(D.id);
    }
    ui.attente = false; ui.jeton++;
    relier();
    const fil = z.querySelector('[data-dlg-fil]');
    if (fil) fil.scrollTop = fil.scrollHeight;
  }

  return { id: 'telephone', nav: { libelle: M.libelle }, quand: M.quand, situation: M.situation, dialogues: M.dialogues, leurres: M.leurres, face: M.face,
    signaux, etatNeuf, html, brancher,
    // Pour la page d'essai et l'enseignant : oublier la copie jouée par l'enseignant, rouvrir l'écran au repos.
    oublier() { ui.prof = null; ui.sel = null; ui.attente = false; ui.vide = false; ui.jeton++; },
    // « Corriger » (moteur) : l'écran s'ouvre sur ce contact.
    ouvrir(id) { if (parId.has(id)) { ui.sel = id; ui.vide = false; ui.attente = false; ui.jeton++; } },
    // Un appel est-il en cours dans cet état (questions au fil retenues, marque au menu) ?
    enCours: (etat) => M.dialogues.some((D) => appelEnCours(etat && etat[D.id])) };
}

const heure = (t) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
