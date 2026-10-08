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
// Comment l'élève appelle la personne : `appel`, sinon le premier mot de son nom.
export const appel = (p) => (p && (p.appel || String(p.nom || '').split(' ')[0])) || '';

/* ================================================================ contrôle au chargement */
export function compilerQuestions(Q, equipe) {
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
    if (!['fil', 'transition'].includes(q.type)) err(`${ici} : \`type\` doit valoir 'fil' ou 'transition'`);
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
    if (!q.reflexion && !q.groupe) err(`${ici} : une question notée nomme son \`groupe\` (sa ligne au bilan de fin)`);
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
  const liste = toutes.filter((q) => q.actif !== false);
  const notees = liste.filter((q) => !q.reflexion);
  if (notees.length && !(typeof Q.part === 'number' && Q.part > 0)) err('`part` (les points sur 20 réservés aux questions notées) manque');
  return {
    id: Q.id, part: notees.length ? Q.part : 0, personnes, liste, notees,
    parId: new Map(liste.map((q) => [q.id, q])),
    fil: liste.filter((q) => q.type === 'fil'),
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
  return M.notees.map((q) => ({
    id: `question:${q.id}`, titre: q.groupe, groupe: q.groupe, question: q.id,
    poids: (M.part * (q.poids || 1)) / somme,
    verifier(db) {
      const r = reponse(db, M, q.id);
      if (!r || r.premiere == null) return { status: 'attente' };
      return { status: r.premiere === q.juste ? 'ok' : 'ko' };
    },
  }));
}

// L'ordre d'affichage des choix : tiré par élève (même graine, même ordre, sur tous les postes), sauf `melanger: false`.
export function ordreChoix(M, q, graine) {
  if (q.melanger === false) return q.choix.slice();
  return hasard(`${graine || ''}|${M.id}|${q.id}`).melanger(q.choix);
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
  } else if (q.reflexion) {
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
