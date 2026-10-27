// Vue « Bord de ligne » — l'élève tient l'approvisionnement des postes d'une ligne de montage qui consomme pendant qu'il travaille :
// quand un contenant se vide, sa carte kanban tombe dans la boîte ; il envoie un robot (deux contenants, une charge maximale) chercher
// des contenants pleins au transstockeur avant que le poste ne manque. Un poste qui manque ARRÊTE LA LIGNE. Chantier moteur du 27/10/2026
// (brief `docs/briefs/MOTEUR-vue-bord-de-ligne.md`) : la logique et le dessin de la page d'essai du 26/10/2026
// (`docs/briefs/stellantis/maquette-bord-de-ligne.html`) DÉPLACÉS ici. Rien de Stellantis : la séance déclare ses postes, ses pièces,
// sa séquence, ses robots et son camion ; la vue fournit l'atelier, les gestes, les jalons. Servira aussi à Royal Canin, Airbus, Haribo.
//
// Ce que la séance déclare (option `ligne` de `creerEntreprise`) :
//   ligne: {
//     id: 'st-ligne-136',                        // un id par séance (état : db.lignes[<séance>][<id>])
//     libelle: 'Bord de ligne',                  // l'entrée du menu (défaut : « Bord de ligne »)
//     lieu: 'Montage · ligne 3008 / 5008',       // sous le titre (facultatif)
//     qui: { prenom: 'Karim', poste: 'chef d’équipe logistique' },   // qui explique et envoie le message du camion (facultatif)
//     temps: 'guidage' | 'entrainement' | 'evaluation',
//     debut: '06:00', minutes: 60,               // heure de début et durée de la matinée, en minutes de ligne (une voiture par minute)
//     secondes: 2,                               // secondes réelles par minute de ligne (défaut : 2 en guidage, 1,2 en entraînement, 1,3 en évaluation)
//     modeles: [{ id: '3008' }, { id: '5008', long: true }],         // les modèles (long : la voiture dessinée plus longue)
//     sequence: ['3008', '3008', '5008', …],     // le motif des modèles, qui se répète
//     postes: [{ id: 'roue', poste: 'Poste 1', zone: 'roues', nom: 'Roues complètes', piece: 'roue', contenant: 'palette',
//                par: 28, kg: 560, besoin: { 3008: 4, 5008: 4 }, depart: [12, 28], stock: 20 }, …],   // 2 à 5 postes
//       // par : pièces dans un contenant plein ; kg : poids d'un contenant plein ; besoin : pièces par voiture, pour chaque modèle ;
//       // depart : ce qui reste dans les contenants au bord de ligne au début (le premier est « en cours ») ; stock : contenants pleins
//       // au transstockeur ; piece : le dessin (`PIECES_LIGNE`).
//     robots: { nombre: 2, places: 2, kgMax: 1000, trajet: 5, retour: 1, urgent: 3, urgents: 2 },
//       // trajet : minutes du transstockeur au bord de ligne ; retour : minutes pour revenir ; urgent : trajet d'un appel urgent ;
//       // urgents : appels urgents permis dans la matinée (0 = aucun)
//     personnes: 1200,                           // personnes immobilisées par une ligne arrêtée (vérifié pour Sochaux)
//     camion: {                                  // facultatif : le camion d'un poste annoncé en retard
//       poste: 'pdb', annonce: '06:20', prevu: '06:30', arrivee: '07:15', contenants: 8, de: 'Karim',
//       secours: '06:38',                        // l'arrivée du convoi de secours (facultatif)
//       decisions: [{ v: 'secours', lib: '…', juste: true, secours: true, retour: '…' }, { v: 'attendre', lib: '…', retour: '…' }, …],
//     },
//     aides: { carte: '…', deux: '…', bas: '…', arret: '…' },       // textes du collègue en guidage (facultatifs : la vue en a)
//     fin: 'Phrase de la fin de la matinée (facultative).',
//   }
// ou une FONCTION de la graine (modèle du tri) : `ligne: (graine, { niveau, copie }) => ({ … })`, même id pour toutes les graines.
//
// TOUT SE CALCULE, rien ne s'écrit (brief §3) : la couverture d'un poste (combien de voitures il tient avec ce qu'il a au bord de ligne,
// d'après la séquence), l'heure d'arrêt quand le camion est en retard (bord de ligne + robots en route + transstockeur, « si rien ne
// change et que la ligne tourne sans autre arrêt », calculée À L'INSTANT du message, sur le bord de ligne de l'élève), les voitures
// perdues si l'on attend le camion (arrivée annoncée − heure d'arrêt). Une déclaration fautive empêche la séance de se charger.
//
// UNE MINUTE DE LIGNE (`minuteLigne`) : le camion arrivé remplit le transstockeur ; les robots arrivés posent leurs contenants ; la voiture
// du moment passe si chaque poste a ses pièces (elle les consomme, un contenant vidé fait tomber sa carte), sinon la ligne est arrêtée
// cette minute (aucune voiture) ; puis l'heure avance ; à l'heure de l'annonce, le message du camion s'ouvre (la ligne attend la réponse).
//
// LES TROIS TEMPS (brief §2, page d'essai) :
//   - guidage : ralenti, « tient N voitures » sous chaque poste, le collègue ARRÊTE LA LIGNE au premier geste (première carte, deux cartes
//     à grouper, poste qui baisse, premier arrêt) ; réponses au camion corrigées tout de suite ; bilan ; « Recommencer la matinée » ;
//   - entraînement : plus vite, couverture cachée, aucun retour avant le bilan ; « Recommencer » permis ;
//   - évaluation (séance `copie`) : comme l'entraînement, aucun bilan pour l'élève (la note se lit au Suivi), jamais rejouée.
//   Le PREMIER résultat compte (règle du dépôt). La ligne ne tourne qu'après « Démarrer la matinée », jamais onglet caché, ni pendant une
//   pause, une explication, le message du camion ou une question au fil (`gele()`) ; pendant ces arrêts, aucun robot ne part. Le
//   tiers-temps de l'élève allonge la minute (× 4/3).
//
// L'état, rangé par le moteur dans la base de l'élève, cloisonné par séance : `db.lignes[<séance>][<id>]` = la matinée (voir
// `matineeNeuve`) et `premier` (le résumé de la première matinée finie). Ce qui est DESSINÉ (voitures, robots en route, cartes qui
// volent) se calcule, jamais rangé. Sauvé à chaque geste et toutes les 5 minutes de ligne.
//
// Les jalons (`jalonLigne`, à poser dans `etapes` avec `poids` et `groupe`) : `voitures` (part des voitures montées AU-DELÀ de ce que la
// ligne monte sans aucun geste), `arret` (aucune minute d'arrêt : tout ; 10 minutes ou plus : rien ; au prorata entre), `groupes` (part
// des robots qui ne sont pas partis à moitié vides alors qu'une autre carte attendait et tenait dans la charge), `heure`, `perdues`,
// `decision` (les réponses au camion), `complet` (matinée finie). « À faire » tant que la matinée n'est pas finie. AUCUN JALON NE SE GAGNE
// SANS AGIR : sans un robot envoyé, tout vaut 0.
//
// Gestes publiés : `ligne:<id>:envoi` (premier robot envoyé), `ligne:<id>:camion` (décision prise), `ligne:<id>:fini` (matinée finie).
// API reçue du moteur : { db, seance, estProf, signal(nom), gele(), figee, tiersTemps, sauver() }.

import { ech } from '../texte.js';
import { auClavier } from '../gestes.js';
import { graineDeBase, niveauEleve } from '../tirage.js';

export const TEMPS_LIGNE = ['guidage', 'entrainement', 'evaluation'];
export const MESURES_LIGNE = ['voitures', 'arret', 'groupes', 'heure', 'perdues', 'decision', 'complet'];
export const SECONDES_LIGNE = { guidage: 2, entrainement: 1.2, evaluation: 1.3 };
export const ARRET_TOLERE = 10;          // minutes d'arrêt au-delà desquelles le jalon `arret` vaut 0
const PLACES_POSTE = 2;                  // deux emplacements par poste : « en cours », « d'avance »
const ID = /^[a-z0-9][a-z0-9-]*$/i;
const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Les pièces dessinées (une par poste). `vb` : viewBox du symbole ; `cap` : pièces dessinées dans un contenant plein ; `cols`, `w`, `h` :
// leur rangement dans l'emplacement. Dessins de la page d'essai (roue, rétroviseur, planche de bord, siège), plus deux génériques.
export const PIECES_LIGNE = {
  roue: { vb: '-10 -10 20 20', cap: 14, cols: 3, w: 17, h: 17, nom: 'Roues',
    svg: '<circle r="9" class="lg-pf"/><circle r="5" fill="#fdfbf7"/><circle r="1.6" class="lg-pf"/>' },
  retro: { vb: '-10 -10 20 20', cap: 15, cols: 3, w: 17, h: 17, nom: 'Rétros',
    svg: '<path d="M-8,-5 Q-8,-8 -4,-8 L6,-7 Q9,-6 9,-1 L8,4 Q7,7 3,7 L-5,6 Q-8,5 -8,2 Z" class="lg-p"/><path d="M-6,-4 L5,-4 L5,3 L-5,3 Z" fill="#c9d3df" stroke="#1a1915" stroke-width=".8"/>' },
  pdb: { vb: '-14 -8 28 16', cap: 10, cols: 2, w: 26, h: 14, nom: 'Planches',
    svg: '<path d="M-13,-2 Q-13,-6 -8,-6 L9,-6 Q13,-6 13,-1 L13,4 L-13,4 Z" class="lg-p"/><rect x="-3" y="-4.5" width="8" height="5" fill="#1a1915"/><circle cx="-8" cy="-1" r="2.2" fill="none" stroke="#1a1915" stroke-width="1"/>' },
  siege: { vb: '-10 -10 20 20', cap: 6, cols: 3, w: 17, h: 17, nom: 'Sièges',
    svg: '<path d="M-5,-9 Q-2,-10 0,-8 L1,2 L-4,2 Z" class="lg-p"/><path d="M-6,2 L8,2 Q9,6 6,7 L-6,7 Z" class="lg-p"/>' },
  faisceau: { vb: '-10 -10 20 20', cap: 12, cols: 3, w: 17, h: 17, nom: 'Faisceaux',
    svg: '<path d="M-8,4 Q-8,-7 0,-7 Q8,-7 8,0 Q8,6 2,6 Q-3,6 -3,1 Q-3,-3 1,-3" fill="none" stroke="#1a1915" stroke-width="1.8"/><rect x="5" y="3" width="5" height="4" fill="#1a1915"/><rect x="-10" y="3" width="4" height="4" class="lg-p"/>' },
  bac: { vb: '-10 -10 20 20', cap: 12, cols: 3, w: 17, h: 17, nom: 'Pièces',
    svg: '<rect x="-7" y="-6" width="14" height="12" rx="2" class="lg-p"/><path d="M-4,-1 L4,-1" stroke="#1a1915" stroke-width="1.2"/>' },
};

export const minutesDe = (h) => { const [a, b] = String(h).split(':').map(Number); return a * 60 + b; };
const pad = (n) => String(n).padStart(2, '0');
export const hhmm = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const plur = (n, s, p = `${s}s`) => (n > 1 ? p : s);
const fr = (x) => String(x).replace('.', ',');
const entier = (x) => Number.isInteger(x);

/* ================================================================ la déclaration */
export function verifierLigne(D, { copie = false } = {}) {
  const f = [];
  if (!D || typeof D !== 'object') return ['la déclaration doit être un objet'];
  if (typeof D.id !== 'string' || !ID.test(D.id)) f.push('il faut un `id` (lettres, chiffres, tirets)');
  if (!TEMPS_LIGNE.includes(D.temps)) f.push(`\`temps\` : ${TEMPS_LIGNE.join(', ')}`);
  else if (copie && D.temps !== 'evaluation') f.push('une séance `copie` ne joue qu’une matinée d’évaluation');
  else if (!copie && D.temps === 'evaluation') f.push('une matinée d’évaluation demande une séance `copie`');
  if (!HEURE.test(D.debut || '')) f.push('`debut` : une heure « HH:MM »');
  if (!entier(D.minutes) || D.minutes < 10 || D.minutes > 240) f.push('`minutes` : la durée de la matinée, de 10 à 240');
  if (D.secondes != null && !(typeof D.secondes === 'number' && D.secondes > 0 && D.secondes <= 10)) f.push('`secondes` : entre 0 et 10');
  const modeles = Array.isArray(D.modeles) ? D.modeles : [];
  if (!modeles.length || modeles.some((m) => !m || typeof m.id !== 'string' || !m.id)) f.push('`modeles` : une liste de { id }');
  const idsM = modeles.map((m) => m && m.id);
  if (new Set(idsM).size !== idsM.length) f.push('deux modèles ont le même id');
  if (!Array.isArray(D.sequence) || !D.sequence.length) f.push('`sequence` : le motif des modèles, non vide');
  else D.sequence.forEach((m) => { if (!idsM.includes(m)) f.push(`la séquence cite le modèle inconnu « ${m} »`); });
  const R = D.robots || {};
  if (!entier(R.nombre) || R.nombre < 1 || R.nombre > 4) f.push('`robots.nombre` : de 1 à 4');
  if (!entier(R.places) || R.places < 1 || R.places > 3) f.push('`robots.places` : de 1 à 3 contenants');
  if (!(R.kgMax > 0)) f.push('`robots.kgMax` : la charge maximale, en kg');
  if (!entier(R.trajet) || R.trajet < 1) f.push('`robots.trajet` : en minutes, au moins 1');
  if (!entier(R.retour) || R.retour < 0) f.push('`robots.retour` : en minutes');
  const urgents = R.urgents == null ? 0 : R.urgents;
  if (!entier(urgents) || urgents < 0) f.push('`robots.urgents` : un nombre d’appels urgents');
  if (urgents > 0 && (!entier(R.urgent) || R.urgent < 1 || R.urgent >= R.trajet)) f.push('`robots.urgent` : un trajet plus court que `trajet`');
  if (!entier(D.personnes) || D.personnes < 1) f.push('`personnes` : les personnes immobilisées par un arrêt');
  const postes = Array.isArray(D.postes) ? D.postes : [];
  if (postes.length < 2 || postes.length > 5) f.push('`postes` : de 2 à 5 postes');
  const idsP = postes.map((p) => p && p.id);
  if (new Set(idsP).size !== idsP.length) f.push('deux postes ont le même id');
  postes.forEach((p) => {
    if (!p) return;
    const q = `le poste « ${p.id} »`;
    if (typeof p.id !== 'string' || !ID.test(p.id)) f.push(`${q} : un \`id\` (lettres, chiffres, tirets)`);
    if (!p.nom || !p.poste) f.push(`${q} : \`nom\` et \`poste\``);
    if (!PIECES_LIGNE[p.piece]) f.push(`${q} : \`piece\` parmi ${Object.keys(PIECES_LIGNE).join(', ')}`);
    if (!entier(p.par) || p.par < 1) f.push(`${q} : \`par\`, les pièces d’un contenant plein`);
    if (!(p.kg > 0)) f.push(`${q} : \`kg\`, le poids d’un contenant plein`);
    else if (R.kgMax > 0 && p.kg > R.kgMax) f.push(`${q} : un contenant de ${p.kg} kg ne tient pas dans un robot (${R.kgMax} kg)`);
    const b = p.besoin || {};
    idsM.forEach((m) => { if (!entier(b[m]) || b[m] < 0) f.push(`${q} : \`besoin.${m}\`, les pièces par voiture`); });
    Object.keys(b).forEach((m) => { if (!idsM.includes(m)) f.push(`${q} : besoin d’un modèle inconnu « ${m} »`); });
    if (idsM.length && idsM.every((m) => !b[m])) f.push(`${q} : il ne sert à aucun modèle`);
    if (!Array.isArray(p.depart) || !p.depart.length || p.depart.length > PLACES_POSTE) f.push(`${q} : \`depart\`, 1 ou 2 contenants au bord de ligne`);
    else p.depart.forEach((x) => { if (!entier(x) || x < 1 || x > p.par) f.push(`${q} : un contenant de départ entre 1 et ${p.par} pièces`); });
    if (!entier(p.stock) || p.stock < 0) f.push(`${q} : \`stock\`, les contenants pleins au transstockeur`);
  });
  const C = D.camion;
  if (C != null) {
    if (!idsP.includes(C.poste)) f.push(`le camion livre un poste inconnu « ${C.poste} »`);
    ['annonce', 'prevu', 'arrivee'].forEach((k) => { if (!HEURE.test(C[k] || '')) f.push(`\`camion.${k}\` : une heure « HH:MM »`); });
    if (C.secours != null && !HEURE.test(C.secours)) f.push('`camion.secours` : une heure « HH:MM »');
    if (!entier(C.contenants) || C.contenants < 1) f.push('`camion.contenants` : au moins 1');
    if (HEURE.test(D.debut || '') && entier(D.minutes) && [C.annonce, C.prevu, C.arrivee].every((h) => HEURE.test(h || ''))) {
      const d = minutesDe(D.debut), a = minutesDe(C.annonce) - d, p = minutesDe(C.prevu) - d, r = minutesDe(C.arrivee) - d;
      if (a < 1 || a >= D.minutes) f.push('le camion est annoncé hors de la matinée');
      if (!(p > a)) f.push('le camion est annoncé après son heure prévue');
      if (!(r > p)) f.push('le camion n’est pas en retard (arrivée avant l’heure prévue)');
      if (C.secours != null && HEURE.test(C.secours)) { const s = minutesDe(C.secours) - d; if (!(s > a && s < r)) f.push('le convoi de secours doit arriver entre l’annonce et le camion'); }
    }
    const dec = Array.isArray(C.decisions) ? C.decisions : [];
    if (dec.length < 2 || dec.length > 4) f.push('`camion.decisions` : de 2 à 4 choix');
    if (dec.some((x) => !x || typeof x.v !== 'string' || !x.lib)) f.push('`camion.decisions` : des { v, lib }');
    if (dec.filter((x) => x && x.juste).length !== 1) f.push('`camion.decisions` : une seule décision juste');
    if (dec.some((x) => x && x.secours) && C.secours == null) f.push('une décision appelle le convoi de secours, mais `camion.secours` manque');
  }
  return f;
}

/* ================================================================ la matinée (calculs purs) */
const modeleDe = (D, i) => D.sequence[i % D.sequence.length];
const surLigne = (st, p) => st.pos[p].reduce((s, x) => s + x, 0);
const posteDe = (D, id) => D.postes.find((p) => p.id === id);
const rel = (D, h) => minutesDe(h) - minutesDe(D.debut);
export const secondesMinute = (D, { tiersTemps = false } = {}) => (D.secondes || SECONDES_LIGNE[D.temps]) * (tiersTemps ? 4 / 3 : 1);

export function matineeNeuve(D) {
  const st = {
    parti: false, t: 0, n: 0, arret: 0, rupture: null, pos: {}, stock: {}, cartes: [], k: 0,
    robots: Array.from({ length: D.robots.nombre }, () => ({ libre: 0, liv: null, ret: null })),
    envois: 0, doubles: 0, demiVides: 0, urgents: 0, delais: [], coach: {}, evt: 0, rep: {}, fait: false,
    camion: D.camion ? { arrivee: rel(D, D.camion.prevu), livre: false, statut: 'prevu' } : null,
  };
  D.postes.forEach((p) => { st.pos[p.id] = p.depart.slice(); st.stock[p.id] = p.stock; });
  return st;
}
// Combien de voitures, à partir de la voiture `n`, peut-on monter avec `q` pièces du poste `p` ?
function voituresAvec(D, p, q, n) {
  let k = 0, reste = q;
  for (; k < 1000; k++) { const b = p.besoin[modeleDe(D, n + k)]; if (reste < b) break; reste -= b; }
  return k;
}
// La couverture d'un poste : combien de voitures il tient avec ce qu'il a au bord de ligne.
export const couverture = (D, st, id) => voituresAvec(D, posteDe(D, id), surLigne(st, id), st.n);
// Les pièces du poste en route sur un robot.
const enRoute = (D, st, id) => st.robots.reduce((s, r) => s + (r.liv ? r.liv.p.filter((x) => x === id).length : 0), 0) * posteDe(D, id).par;
// L'heure (en minutes depuis le début) où la ligne s'arrêtera faute du poste `id`, si rien ne change et qu'elle tourne sans autre arrêt.
export function heureArret(D, st, id) {
  const p = posteDe(D, id);
  return st.t + voituresAvec(D, p, surLigne(st, id) + enRoute(D, st, id) + st.stock[id] * p.par, st.n);
}

function consommer(D, st, p, q) {
  const pile = st.pos[p.id];
  while (q > 0 && pile.length) {
    const pris = Math.min(q, pile[0]);
    pile[0] -= pris; q -= pris;
    if (pile[0] === 0) { pile.shift(); st.k += 1; st.cartes.push({ k: st.k, p: p.id, t: st.t }); }
  }
}
// Une minute de ligne. Rend ce qui s'est passé : { cartes: [ids de poste], fini, annonce }.
export function minuteLigne(D, st) {
  const out = { cartes: [], fini: false, annonce: false };
  if (st.fait) return out;
  const C = st.camion;
  if (C && !C.livre && st.t >= C.arrivee) { C.livre = true; st.stock[D.camion.poste] += D.camion.contenants; C.statut = 'livre'; }
  for (const r of st.robots) {
    if (r.liv && st.t >= r.liv.a) {
      r.liv.p.forEach((id) => { if (st.pos[id].length < PLACES_POSTE) st.pos[id].push(posteDe(D, id).par); });
      r.ret = { de: r.liv.a, x: r.liv.x };
      r.liv = null;
    }
  }
  const m = modeleDe(D, st.n);
  const manque = D.postes.filter((p) => surLigne(st, p.id) < p.besoin[m]);
  if (manque.length) { st.arret += 1; st.rupture = manque.map((p) => p.id); }
  else {
    st.rupture = null;
    const avant = st.k;
    D.postes.forEach((p) => consommer(D, st, p, p.besoin[m]));
    out.cartes = st.cartes.filter((c) => c.k > avant).map((c) => c.p);
    st.n += 1;
  }
  st.t += 1;
  if (C && D.camion && st.t === rel(D, D.camion.annonce) && !st.evt) { ouvrirCamion(D, st); out.annonce = true; }
  if (st.t >= D.minutes) { st.fait = true; out.fini = true; }
  return out;
}

// Le message du camion : l'arrivée recule, l'heure d'arrêt et les voitures perdues se calculent maintenant, sur ce bord de ligne.
function ouvrirCamion(D, st) {
  const C = D.camion;
  st.camion.arrivee = rel(D, C.arrivee); st.camion.statut = 'retard';
  const h = heureArret(D, st, C.poste);
  const perdues = Math.max(0, st.camion.arrivee - h);
  const distincts = (L) => L.filter((v, i) => L.indexOf(v) === i);
  const heures = distincts([h, rel(D, C.arrivee), h + 10, h - 10].filter((v) => v > st.t)).sort((a, b) => a - b);
  const pertes = distincts([perdues, perdues + D.robots.trajet, rel(D, C.arrivee) - rel(D, C.prevu), Math.max(0, perdues - 10)]).sort((a, b) => a - b);
  st.evt = 1;
  st.rep = { heureJuste: h, perduesJuste: perdues, heures, pertes };
}

// Envoyer un robot avec les cartes `ks`. Rend { ok, motif } ; ne touche à rien si c'est refusé.
export function envoyerRobot(D, st, ks, { urgent = false } = {}) {
  const R = D.robots;
  const r = st.robots.find((x) => !x.liv && x.libre <= st.t);
  const cartes = ks.map((k) => st.cartes.find((c) => c.k === k)).filter(Boolean);
  if (!cartes.length || cartes.length !== ks.length) return { ok: false, motif: 'cartes' };
  if (!r) return { ok: false, motif: 'robot' };
  if (cartes.length > R.places) return { ok: false, motif: 'places' };
  const kg = cartes.reduce((s, c) => s + posteDe(D, c.p).kg, 0);
  if (kg > R.kgMax) return { ok: false, motif: 'lourd' };
  const besoin = {};
  cartes.forEach((c) => { besoin[c.p] = (besoin[c.p] || 0) + 1; });
  const vide = Object.keys(besoin).find((p) => st.stock[p] < besoin[p]);
  if (vide) return { ok: false, motif: 'stock', poste: vide };
  if (urgent && st.urgents >= (R.urgents || 0)) return { ok: false, motif: 'urgents' };
  // À moitié vide : il restait une place, et une autre carte attendait qui tenait dans la charge (et dont le contenant existe).
  if (cartes.length < R.places && st.cartes.some((c) => !ks.includes(c.k) && kg + posteDe(D, c.p).kg <= R.kgMax
    && st.stock[c.p] - (besoin[c.p] || 0) >= 1)) st.demiVides += 1;
  Object.entries(besoin).forEach(([p, n]) => { st.stock[p] -= n; });
  cartes.forEach((c) => st.delais.push(st.t - c.t));
  const d = urgent ? R.urgent : R.trajet;
  r.liv = { a: st.t + d, d: st.t, p: cartes.map((c) => c.p), x: Math.max(...cartes.map((c) => D.postes.findIndex((p) => p.id === c.p))) };
  r.libre = st.t + d + R.retour; r.ret = null;
  st.cartes = st.cartes.filter((c) => !ks.includes(c.k));
  st.envois += 1; if (cartes.length > 1) st.doubles += 1; if (urgent) st.urgents += 1;
  return { ok: true, robot: st.robots.indexOf(r), a: st.t + d };
}
// Répondre au message du camion (`q` : heure, perdues, decision). Rend true si la réponse est prise.
export function repondreCamion(D, st, q, v) {
  const ordre = { heure: 1, perdues: 2, decision: 3 };
  if (!D.camion || st.evt !== ordre[q]) return false;
  if (q === 'decision') {
    const x = D.camion.decisions.find((c) => c.v === v);
    if (!x) return false;
    st.rep.decision = v;
    if (x.secours && !st.camion.livre) { st.camion.arrivee = Math.max(st.t, rel(D, D.camion.secours)); st.camion.statut = 'secours'; }
  } else {
    const n = Number(v);
    if (!(q === 'heure' ? st.rep.heures : st.rep.pertes).includes(n)) return false;
    st.rep[q] = n;
  }
  st.evt += 1;
  return true;
}
// La matinée jouée sans aucun geste : combien de voitures monte-t-elle ? (le zéro du jalon `voitures`)
export function voituresSansGeste(D) {
  const st = matineeNeuve(D);
  while (!st.fait) minuteLigne(D, st);
  return st.n;
}
export function resumeMatinee(D, st) {
  const juste = D.camion ? D.camion.decisions.find((x) => x.juste).v : null;
  return {
    n: st.n, arret: st.arret, envois: st.envois, doubles: st.doubles, demiVides: st.demiVides, urgents: st.urgents,
    delai: st.delais.length ? Math.round((st.delais.reduce((a, b) => a + b, 0) / st.delais.length) * 10) / 10 : null,
    ...(D.camion ? { heure: st.rep.heure ?? null, heureJuste: st.rep.heureJuste ?? null, perdues: st.rep.perdues ?? null,
      perduesJuste: st.rep.perduesJuste ?? null, decision: st.rep.decision ?? null, decisionJuste: juste } : {}),
  };
}

/* ================================================================ l'état et les jalons */
export const etatLigne = (db, seance, id) => (db && db.lignes && db.lignes[seance] && db.lignes[seance][id]) || null;
export const declarationLigne = (decl, db, { copie = false } = {}) => (typeof decl === 'function'
  ? decl(graineDeBase(db || {}) || '', { niveau: niveauEleve(db || {}, { copie }), copie }) : decl);
// Le résumé qui compte : la première matinée finie (« Recommencer » ne l'efface pas), sinon la matinée finie en cours.
export const resultatLigne = (D, st) => (!st ? null : st.premier || (st.fait ? resumeMatinee(D, st) : null));
export function partLigne(D, R, mesure, n0) {
  if (!R) return null;
  const agi = R.envois > 0;
  switch (mesure) {
    case 'voitures': return agi && D.minutes > n0 ? Math.max(0, Math.min(1, (R.n - n0) / (D.minutes - n0))) : 0;
    case 'arret': return agi ? Math.max(0, 1 - R.arret / ARRET_TOLERE) : 0;
    case 'groupes': return agi ? 1 - R.demiVides / R.envois : 0;
    case 'heure': return R.heure != null && R.heure === R.heureJuste ? 1 : 0;
    case 'perdues': return R.perdues != null && R.perdues === R.perduesJuste ? 1 : 0;
    case 'decision': return R.decision != null && R.decision === R.decisionJuste ? 1 : 0;
    default: return agi ? 1 : 0;   // complet
  }
}
// Un jalon de la vue, à poser dans `etapes` (la séance y ajoute `poids` et `groupe`). « À faire » tant que la matinée n'est pas finie ;
// ensuite `ok` avec la part juste (`fraction`), ou `ko` si rien n'est juste.
export function jalonLigne(decl, seance, { id, titre, mesure, copie = false } = {}) {
  if (typeof seance !== 'string' || !seance.trim()) throw new Error('jalonLigne(decl, seance, …) : il faut l’id de la séance (l’état est rangé sous db.lignes[séance][id])');
  if (!MESURES_LIGNE.includes(mesure)) throw new Error(`jalonLigne : mesure inconnue « ${mesure} » (${MESURES_LIGNE.join(', ')})`);
  const D0 = declarationLigne(decl, {}, { copie });
  if (['heure', 'perdues', 'decision'].includes(mesure) && !D0.camion) throw new Error(`jalonLigne « ${id || mesure} » : la matinée n’a pas de camion`);
  const zeros = new Map();
  const zero = (D) => { const k = JSON.stringify([D.postes, D.sequence, D.minutes, D.camion]); if (!zeros.has(k)) zeros.set(k, voituresSansGeste(D)); return zeros.get(k); };
  const part = (db) => {
    const D = declarationLigne(decl, db, { copie });
    const R = resultatLigne(D, etatLigne(db, seance, D.id));
    return R ? partLigne(D, R, mesure, zero(D)) : null;
  };
  return {
    id: id || `ligne-${mesure}`, titre: titre || id || mesure,
    verifier(db) { const p = part(db); return p == null ? { status: 'attente' } : { status: p > 0 ? 'ok' : 'ko' }; },
    fraction(db) { const p = part(db); return p == null ? 0 : p; },
  };
}
export const etapesLigne = (decl, seance, { copie = false } = {}) => {
  const D0 = declarationLigne(decl, {}, { copie });
  return MESURES_LIGNE.filter((m) => D0.camion || !['heure', 'perdues', 'decision'].includes(m))
    .map((m) => jalonLigne(decl, seance, { id: `ligne-${m}`, titre: m, mesure: m, copie }));
};

// Les lignes du bilan (bilan à l'écran, corrigé de l'enseignant).
export function lignesBilan(D, R) {
  const L = [
    { id: 'voitures', lib: 'Voitures montées', ton: `${R.n} sur ${D.minutes}`, ok: R.n >= D.minutes },
    { id: 'arret', lib: 'Minutes de ligne arrêtée', ton: String(R.arret), ok: R.arret === 0 },
    { id: 'perdu', lib: 'Temps de travail perdu', ton: R.arret ? `${R.arret} min × ${D.personnes.toLocaleString('fr-FR')} personnes = ${(R.arret * D.personnes).toLocaleString('fr-FR')} minutes, soit ${fr(Math.round((R.arret * D.personnes) / 6) / 10)} heures` : 'aucun', ok: R.arret === 0 },
    { id: 'groupes', lib: 'Robots envoyés (dont partis à moitié vides alors qu’une autre carte attendait)', ton: `${R.envois} (${R.demiVides})`, ok: R.envois > 0 && R.demiVides === 0 },
    { id: 'delai', lib: 'Délai moyen entre la carte et l’envoi', ton: R.delai == null ? '—' : `${fr(R.delai)} min`, ok: null },
    { id: 'urgents', lib: 'Appels urgents', ton: String(R.urgents), ok: null },
  ];
  if (D.camion) {
    const d0 = minutesDe(D.debut), dec = (v) => (D.camion.decisions.find((x) => x.v === v) || {}).lib;
    L.push({ id: 'heure', lib: 'Heure d’arrêt prévue (camion)', ton: R.heure == null ? '—' : hhmm(d0 + R.heure), bon: R.heureJuste == null ? '—' : hhmm(d0 + R.heureJuste), ok: R.heure != null && R.heure === R.heureJuste });
    L.push({ id: 'perdues', lib: 'Voitures perdues si l’on attend le camion', ton: R.perdues == null ? '—' : String(R.perdues), bon: R.perduesJuste == null ? '—' : String(R.perduesJuste), ok: R.perdues != null && R.perdues === R.perduesJuste });
    L.push({ id: 'decision', lib: 'Ta décision', ton: dec(R.decision) || '—', bon: dec(R.decisionJuste), ok: R.decision === R.decisionJuste });
  }
  return L;
}

/* ================================================================ le dessin */
const W = 1000, LIGNE_Y = 118, ALLEE_Y = 352, SORTIE_X = 222, PAS = 150;
const posteX = (D, i) => { const n = D.postes.length; return n === 1 ? 600 : 390 + i * ((n >= 5 ? 900 : 840) - 390) / (n - 1); };
const largeurEmpl = (D) => Math.min(58, Math.floor(((D.postes.length >= 5 ? 112 : 150) - 12) / 2));
const symboles = (D) => [...new Set(D.postes.map((p) => p.piece))].map((k) => `<symbol id="lg-ic-${k}" viewBox="${PIECES_LIGNE[k].vb}">${PIECES_LIGNE[k].svg}</symbol>`).join('');
const icone = (D, id) => posteDe(D, id).piece;

function fondHtml(D) {
  let h = `<line x1="10" y1="378" x2="990" y2="378" class="lg-doux"/>`
    + `<line x1="${SORTIE_X}" y1="${ALLEE_Y + 22}" x2="980" y2="${ALLEE_Y + 22}" stroke="#8b857a" stroke-dasharray="8 6" stroke-width="1.5"/>`
    + `<text x="600" y="402" class="lg-lbl" text-anchor="middle">allée des robots, du transstockeur au bord de ligne</text>`
    + `<rect x="14" y="20" width="196" height="300" rx="4" class="lg-trait"/>`
    + `<text x="112" y="40" class="lg-lblf" text-anchor="middle">Transstockeur</text><text x="112" y="55" class="lg-lbl" text-anchor="middle">contenants pleins</text>`
    + `<rect x="198" y="296" width="24" height="24" class="lg-trait"/><text x="210" y="336" class="lg-lbl" text-anchor="middle">sortie</text>`
    + `<text x="20" y="400" class="lg-lbl">quai des camions</text>`
    + `<text x="260" y="22" class="lg-lblf">Ligne de montage</text><text x="400" y="22" class="lg-lbl">une voiture par minute →</text>`
    + `<rect x="250" y="${LIGNE_Y}" width="740" height="10" rx="3" fill="#e3ded3" stroke="#8b857a"/>`;
  for (let x = 262; x < 990; x += 24) h += `<circle cx="${x}" cy="${LIGNE_Y + 5}" r="2" fill="#8b857a"/>`;
  D.postes.forEach((p, i) => {
    const x = posteX(D, i);
    h += `<g transform="translate(${x - largeurEmpl(D) + 6},${LIGNE_Y + 20})"><circle cx="0" cy="6" r="5" class="lg-trait" style="fill:#fdfbf7"/><path d="M0,11 L0,26 M-7,16 L7,16 M0,26 L-5,36 M0,26 L5,36" class="lg-trait"/></g>`
      + `<text x="${x}" y="${LIGNE_Y + 34}" class="lg-lblf" text-anchor="middle">${ech(p.poste)}</text>`
      + `<text x="${x}" y="${LIGNE_Y + 48}" class="lg-lbl" text-anchor="middle">${ech(p.zone || '')}</text>`;
  });
  h += `<g transform="translate(232,175)"><rect width="66" height="46" rx="4" class="lg-trait" style="fill:#fdfbf7"/><rect x="10" y="6" width="46" height="5" fill="#1a1915"/>`
    + `<text x="33" y="62" class="lg-lbl" text-anchor="middle">boîte kanban</text></g>`;
  return h;
}
function piecesHtml(D, p, reste, x, y, w, hgt) {
  const I = PIECES_LIGNE[p.piece], cap = Math.min(p.par, I.cap), par = p.par / cap;
  const n = Math.ceil(reste / par), cols = I.cols, k = Math.min(1, (w - 8) / (cols * I.w)), tw = I.w * k, th = I.h * k;
  let h = '';
  for (let i = 0; i < n; i++) {
    const c = i % cols, l = Math.floor(i / cols);
    const ix = x + 4 + c * (w - 8) / cols + ((w - 8) / cols - tw) / 2, iy = y + hgt - 4 - (l + 1) * (th - 1);
    if (iy < y + 12) break;
    h += `<use href="#lg-ic-${p.piece}" x="${ix.toFixed(1)}" y="${iy.toFixed(1)}" width="${tw.toFixed(1)}" height="${th.toFixed(1)}"/>`;
  }
  return h;
}
function etatHtml(D, st, { couvertures }) {
  let h = '';
  const hRang = Math.min(56, 250 / D.postes.length);
  D.postes.forEach((p, i) => {
    const y = 66 + i * hRang;
    h += `<use href="#lg-ic-${p.piece}" x="20" y="${y + 4}" width="${p.piece === 'pdb' ? 28 : 22}" height="20"/>`
      + `<text x="20" y="${y + 38}" class="lg-lbl" style="font-size:10px">${ech(PIECES_LIGNE[p.piece].nom)}</text>`
      + `<text x="66" y="${y + 20}" class="lg-num" text-anchor="end" style="font-size:12px" data-l-stock="${ech(p.id)}">${st.stock[p.id]}</text>`;
    for (let k = 0; k < 20; k++) {
      const c = k % 10, l = Math.floor(k / 10);
      h += `<rect x="${72 + c * 12.8}" y="${y + 4 + l * 20}" width="11" height="18" rx="1.5" class="lg-case${k < st.stock[p.id] ? ' lg-pleine' : ''}"/>`;
    }
  });
  const C = st.camion, d0 = minutesDe(D.debut);
  if (C && C.livre && st.t - C.arrivee < 6) {
    h += `<g transform="translate(110,382)"><rect x="-88" y="-34" width="70" height="30" rx="2" class="lg-trait" style="fill:#fdfbf7"/><path d="M-18,-26 L0,-26 L8,-14 L8,-4 L-18,-4 Z" class="lg-trait" style="fill:#fdfbf7"/>`
      + `<circle cx="-72" cy="-3" r="5" class="lg-pneu"/><circle cx="-2" cy="-3" r="5" class="lg-pneu"/><text x="-53" y="-15" class="lg-lbl" text-anchor="middle" style="font-size:10px">${D.camion.contenants}</text></g>`
      + `<text x="20" y="414" class="lg-lbl" style="font-size:11px">camion livré à ${hhmm(d0 + C.arrivee)}</text>`;
  } else if (C && !C.livre) {
    h += `<text x="20" y="414" class="${C.statut === 'retard' ? 'lg-bas' : 'lg-lbl'}" style="font-size:11px">camion : ${C.statut === 'retard' ? 'en retard' : C.statut === 'secours' ? 'convoi de secours' : 'prévu'}, ${hhmm(d0 + C.arrivee)}</text>`;
  }
  const w = largeurEmpl(D);
  D.postes.forEach((p, i) => {
    const x0 = posteX(D, i) - w - 3, y0 = 182, pile = st.pos[p.id];
    const rupt = st.rupture && st.rupture.includes(p.id);
    for (let k = 0; k < PLACES_POSTE; k++) {
      const x = x0 + k * (w + 6), c = pile[k];
      h += `<rect x="${x}" y="${y0}" width="${w}" height="96" rx="3" fill="${c ? '#fdfbf7' : 'none'}" stroke="${c ? '#1a1915' : '#8b857a'}" stroke-width="${c ? 1.5 : 1.2}"${c ? '' : ' stroke-dasharray="4 3"'}/>`
        + `<text x="${x + w / 2}" y="${y0 + 10}" class="lg-lbl" text-anchor="middle" style="font-size:9.5px">${k ? 'd’avance' : 'en cours'}</text>`;
      if (c) h += piecesHtml(D, p, c, x, y0, w, 96) + `<text x="${x + w / 2}" y="${y0 + 110}" class="lg-num" text-anchor="middle" data-l-reste="${ech(p.id)}-${k}">${c}</text>`;
    }
    const cv = couverture(D, st, p.id), bas = cv <= D.robots.trajet + 1;
    h += `<circle cx="${posteX(D, i) + w - 6}" cy="${LIGNE_Y + 30}" r="7" fill="${rupt ? 'none' : bas && couvertures ? '#9c620a' : 'none'}" stroke="${rupt ? '#9d2727' : '#1a1915'}" stroke-width="${rupt ? 3 : 1.4}"/>`;
    if (rupt) h += `<text x="${posteX(D, i)}" y="${y0 + 128}" class="lg-alerte" text-anchor="middle" style="font-size:13px">✗ RUPTURE</text>`;
    else if (couvertures) h += `<text x="${posteX(D, i)}" y="${y0 + 128}" class="${bas ? 'lg-bas' : 'lg-lbl'}" text-anchor="middle" data-l-couv="${ech(p.id)}">tient ${cv} ${plur(cv, 'voiture')}</text>`;
  });
  st.cartes.slice(0, 6).forEach((c, k) => {
    h += `<g transform="translate(${238 + (k % 3) * 18},${183 + Math.floor(k / 3) * 14})"><rect width="16" height="12" rx="1.5" class="lg-carte-vol"/><use href="#lg-ic-${icone(D, c.p)}" x="2" y="1" width="12" height="10"/></g>`;
  });
  if (st.cartes.length) h += `<circle cx="296" cy="177" r="10" fill="#9c620a"/><text x="296" y="181" text-anchor="middle" style="font:700 12px system-ui,sans-serif;fill:#fdfbf7">${st.cartes.length}</text>`;
  if (st.rupture) h += `<text x="620" y="${LIGNE_Y - 62}" class="lg-alerte" text-anchor="middle" style="font-size:15px">✗ LIGNE ARRÊTÉE — ${D.personnes.toLocaleString('fr-FR')} personnes attendent</text>`;
  return h;
}
function voitureHtml(M) {
  const L = M && M.long ? 112 : 98, k = L / 100, X = (v) => (v * k).toFixed(1);
  let h = `<path class="lg-voiture" d="M0,-10 L0,-22 Q1,-27 8,-28 L${X(26)},-30 L${X(40)},-44 Q${X(43)},-47 ${X(48)},-47 L${X(80)},-47 Q${X(86)},-47 ${X(90)},-41 L${X(97)},-30 Q${X(100)},-28 ${X(100)},-22 L${X(100)},-10 Z"/>`
    + `<path class="lg-vitre" d="M${X(42)},-31 L${X(49)},-42 L${X(64)},-42 L${X(64)},-31 Z"/><path class="lg-vitre" d="M${X(67)},-31 L${X(67)},-42 L${X(80)},-42 L${X(86)},-31 Z"/>`;
  if (M && M.long) h += `<path class="lg-vitre" d="M${X(88)},-31 L${X(84)},-40 L${X(89)},-40 L${X(94)},-31 Z"/>`;
  for (const w of [20, 80]) h += `<circle cx="${X(w)}" cy="-8" r="9" class="lg-pneu"/><circle cx="${X(w)}" cy="-8" r="4" fill="#fdfbf7"/>`;
  return `${h}<text x="${X(50)}" y="-16" text-anchor="middle" style="font:700 11px ui-monospace,Consolas,monospace;fill:#1a1915">${ech(M ? M.libelle || M.id : '')}</text>`;
}
function robotHtml(D, i, charge) {
  let h = '';
  charge.forEach((id, k) => { h += `<rect x="${-20 + k * 21}" y="-34" width="19" height="20" rx="2" class="lg-carte-vol"/><use href="#lg-ic-${icone(D, id)}" x="${-18 + k * 21}" y="-31" width="15" height="15"/>`; });
  return `${h}<rect x="-24" y="-14" width="48" height="14" rx="5" class="lg-robot"/><circle cx="-14" cy="2" r="4" class="lg-pneu"/><circle cx="14" cy="2" r="4" class="lg-pneu"/>`
    + `<text x="0" y="-4" text-anchor="middle" style="font:700 9px ui-monospace,Consolas,monospace;fill:#1a1915">R${i + 1}</text>`;
}

/* ================================================================ la vue */
const AIDES = (D) => ({
  carte: `<b>Une carte kanban vient de tomber.</b> Un contenant s’est vidé : le poste travaille maintenant sur son <b>contenant d’avance</b>. La carte dit quoi rapporter. Clique-la, puis « Envoyer un robot ». Le robot met ${D.robots.trajet} minutes : il doit arriver avant que le contenant d’avance soit vide (regarde « tient … voitures » sous le poste).`,
  deux: `<b>Deux cartes attendent.</b> Tu n’as que ${D.robots.nombre} ${plur(D.robots.nombre, 'robot')} : un robot porte <b>${D.robots.places} contenants et ${D.robots.kgMax.toLocaleString('fr-FR')} kg</b> au plus. Si le poids le permet, mets les deux cartes dans le même robot : l’autre reste libre pour la suite.`,
  bas: `<b>Un poste baisse.</b> Il ne tient plus que quelques voitures, et sa carte attend dans la boîte. Le robot met ${D.robots.trajet} minutes : envoie-le maintenant${D.robots.urgents ? `, ou en appel urgent (${D.robots.urgent} minutes, ${D.robots.urgents} par matinée)` : ''}.`,
  arret: `<b>La ligne est arrêtée.</b> Un poste n’a plus de quoi monter la voiture du moment : plus aucune voiture n’avance tant que le robot n’a pas livré. ${D.personnes.toLocaleString('fr-FR')} personnes attendent. Envoie ce qui manque, et anticipe la prochaine fois.`,
  ...(D.aides || {}),
});
const MOTIFS_REFUS = {
  robot: 'Aucun robot libre : attends le retour du premier.', places: (D) => `Un robot ne porte que ${D.robots.places} contenants.`,
  lourd: (D) => `Trop lourd pour un seul robot (${D.robots.kgMax.toLocaleString('fr-FR')} kg au plus).`, urgents: 'Plus d’appel urgent possible dans cette matinée.',
  stock: (D, x) => `Plus aucun contenant de ${posteDe(D, x.poste).nom.toLowerCase()} au transstockeur.`, cartes: 'Choisis une ou deux cartes.',
};

export function creerLigne(decl, { copie = false, graine = '', niveau = 'standard' } = {}) {
  const COPIE = !!copie;
  let D;
  try { D = typeof decl === 'function' ? decl(graine, { niveau, copie: COPIE }) : decl; }
  catch (x) { throw new Error(`ligne : la fonction de la graine ne marche pas (${x && x.message ? x.message : x})`); }
  const fautes = verifierLigne(D, { copie: COPIE });
  if (fautes.length) throw new Error(`ligne${D && typeof D.id === 'string' && D.id ? ` « ${D.id} »` : ''} : ${fautes.join(' ; ')}`);
  const geste = (g) => `ligne:${D.id}:${g}`;
  const signaux = [geste('envoi'), geste('fini'), ...(D.camion ? [geste('camion')] : [])];
  const qui = D.qui && D.qui.prenom ? D.qui : null;
  const d0 = minutesDe(D.debut);
  const guidage = D.temps === 'guidage';
  const aides = AIDES(D);
  const MODELES = Object.fromEntries(D.modeles.map((m) => [m.id, m]));
  // L'interface en mémoire (ce qui n'est pas du travail) : les cartes choisies, l'appel urgent coché, la pause, l'explication ouverte,
  // le dernier retour, le retour d'une réponse au camion (guidage).
  const ui = { sel: [], urgent: false, pause: false, coach: null, retour: '', evtRetour: null, evtEtape: null, acc: 0 };
  const completer = (st) => { if (!st || st.t == null) Object.assign(st, matineeNeuve(D)); return st; };

  function consigne(api) {
    const s = secondesMinute(D, { tiersTemps: !!(api && api.tiersTemps) });
    const base = `Tu tiens l’approvisionnement de ${D.postes.length} postes de la ligne. Quand un contenant se vide, sa <b>carte kanban</b> tombe dans la boîte : envoie un robot chercher un contenant plein au transstockeur avant que le poste n’en manque. Un robot porte <b>${D.robots.places} contenants et ${D.robots.kgMax.toLocaleString('fr-FR')} kg</b> au plus.`;
    if (D.temps === 'evaluation') return `${base} Seul(e) : aucune aide ne s’affiche, aucun bilan. Une minute de ligne dure ${fr(Math.round(s * 10) / 10)} s.`;
    if (D.temps === 'entrainement') return `${base} Sans aide : ce que tient chaque poste n’est pas affiché, compte les pièces. Une minute de ligne dure ${fr(Math.round(s * 10) / 10)} s.`;
    return `${base} Ici la ligne est ralentie ; ${qui ? ech(qui.prenom) : 'ton tuteur'} l’arrête au premier geste pour t’expliquer.`;
  }
  const charge = (st) => ui.sel.reduce((s, k) => { const c = st.cartes.find((x) => x.k === k); return s + (c ? posteDe(D, c.p).kg : 0); }, 0);
  const bloque = (api) => !!(api && api.figee);
  const evtOuvert = (st) => (st.evt >= 1 && st.evt <= 3) || !!ui.evtRetour;
  const arretee = (st, api) => !st.parti || st.fait || ui.pause || !!ui.coach || evtOuvert(st) || bloque(api) || !!(api.gele && api.gele());

  function cartesHtml(st, dis) {
    if (!st.cartes.length) return `<div class="lg-vide">Aucune carte : tous les postes ont leurs deux contenants.</div>`;
    return st.cartes.map((c) => {
      const p = posteDe(D, c.p), age = st.t - c.t;
      return `<button type="button" class="lg-carte" data-l="carte" data-k="${c.k}" aria-pressed="${ui.sel.includes(c.k)}"${dis ? ' disabled' : ''}>
        <svg viewBox="${PIECES_LIGNE[p.piece].vb}" aria-hidden="true">${PIECES_LIGNE[p.piece].svg}</svg>
        <span class="lg-d">${ech(p.nom)}<small>${ech(p.poste)} · 1 ${ech(p.contenant || 'contenant')} de ${p.par} · ${p.kg.toLocaleString('fr-FR')} kg</small></span>
        <span class="lg-age${age >= 3 ? ' lg-vieux' : ''}" data-l-age="${c.k}">${age} min</span></button>`;
    }).join('');
  }
  function robotsHtml(st) {
    return st.robots.map((r, i) => {
      let e = 'libre, au transstockeur';
      if (r.liv) e = `en route · au bord de ligne à ${hhmm(d0 + r.liv.a)}`;
      else if (r.libre > st.t) e = `revient · libre à ${hhmm(d0 + r.libre)}`;
      return `<div class="lg-robot-l"><span class="lg-nom">R${i + 1}</span><span>${e}</span></div>`;
    }).join('');
  }
  function panneauHtml(st, api) {
    const dis = !st.parti || st.fait || bloque(api) || ui.pause || !!ui.coach || evtOuvert(st);
    const kg = charge(st), trop = ui.sel.length > D.robots.places || kg > D.robots.kgMax;
    const libre = st.robots.some((r) => !r.liv && r.libre <= st.t);
    const reste = (D.robots.urgents || 0) - st.urgents;
    return `<h3>Boîte kanban <small>cartes à traiter</small></h3>
      <div class="lg-cartes" data-l-cartes>${cartesHtml(st, dis)}</div>
      <div class="lg-charge${trop ? ' lg-trop' : ''}" data-l-charge>${ui.sel.length ? `Chargement : ${ui.sel.length} ${plur(ui.sel.length, 'contenant')}, ${kg.toLocaleString('fr-FR')} kg sur ${D.robots.kgMax.toLocaleString('fr-FR')}.` : `Choisis une ou ${D.robots.places > 1 ? 'deux' : 'une'} carte${D.robots.places > 1 ? 's' : ''}.`}</div>
      <div class="lg-robots" data-l-robots>${robotsHtml(st)}</div>
      <div class="lg-actions">
        <button type="button" class="btn btn-p" data-l="envoyer"${!ui.sel.length || trop || dis || !libre ? ' disabled' : ''}>Envoyer un robot</button>
        ${D.robots.urgents ? `<label class="lg-urg"><input type="checkbox" data-l="urgent"${ui.urgent ? ' checked' : ''}${dis || reste <= 0 ? ' disabled' : ''}> appel urgent (${reste} ${plur(reste, 'restant')})</label>` : ''}
      </div>
      <div class="lg-retour" data-l-retour aria-live="polite">${ui.retour}</div>`;
  }
  function stockHtml(st) {
    const C = st.camion;
    return `<h3>Transstockeur <small>contenants pleins</small></h3>
      <table class="lg-mag"><tbody>${D.postes.map((p) => `<tr><td>${ech(p.nom)}</td><td>${ech(p.contenant || 'contenant')}s de ${p.par}</td><td class="lg-n">${st.stock[p.id]}</td></tr>`).join('')}</tbody></table>
      ${C ? `<div class="lg-camion${C.statut === 'retard' ? ' lg-retard' : ''}">${C.livre ? `Camion de ${ech(posteDe(D, D.camion.poste).nom.toLowerCase())} livré (${D.camion.contenants} ${ech(posteDe(D, D.camion.poste).contenant || 'contenant')}s).`
        : `Camion de ${ech(posteDe(D, D.camion.poste).nom.toLowerCase())} (${D.camion.contenants} ${ech(posteDe(D, D.camion.poste).contenant || 'contenant')}s) : ${C.statut === 'retard' ? 'en retard' : C.statut === 'secours' ? 'convoi de secours' : 'prévu'}, arrivée ${hhmm(d0 + C.arrivee)}.`}</div>` : ''}`;
  }
  function sequenceHtml(st) {
    const L = []; for (let k = 0; k < 12; k++) { const m = modeleDe(D, st.n + k); L.push(`<span class="${MODELES[m].long ? 'lg-long' : ''}">${ech(MODELES[m].libelle || m)}</span>`); }
    return `Voitures à venir : ${L.join('')}`;
  }
  function evtHtml(st) {
    if (!D.camion || !evtOuvert(st)) return '';
    const etape = ui.evtRetour ? ui.evtEtape : st.evt;
    const C = D.camion, p = posteDe(D, C.poste), de = C.de || (qui && qui.prenom) || 'Ton tuteur';
    const tete = `<div class="lg-de">Message de ${ech(de)} · ${hhmm(d0 + st.t)}</div>`;
    const retour = ui.evtRetour ? `<div class="lg-evt-retour" data-l-evt-retour>${ui.evtRetour}</div><button type="button" class="btn btn-p" data-l="evt-suite">Continuer</button>` : '';
    const dis = ui.evtRetour ? ' disabled' : '';
    if (etape === 1) {
      return `${tete}<h3>Le camion de ${ech(p.nom.toLowerCase())} aura du retard</h3>
        <p>Le transporteur vient d’appeler : le camion, prévu à <b>${hhmm(minutesDe(C.prevu))}</b>, arrivera vers <b>${hhmm(minutesDe(C.arrivee))}</b>.</p>
        <p>Regarde ce qui reste au bord de ligne, sur les robots et au transstockeur. <b>Si rien ne change et que la ligne tourne sans autre arrêt, à quelle heure s’arrêtera-t-elle faute de ${ech(p.nom.toLowerCase())} ?</b></p>
        <div class="lg-choix" role="group">${st.rep.heures.map((v) => `<button type="button" data-l="rep" data-q="heure" data-v="${v}"${dis}>vers ${hhmm(d0 + v)}</button>`).join('')}</div>${retour}`;
    }
    if (etape === 2) {
      return `${tete}<h3>Combien de voitures perdues ?</h3>
        <p>Une voiture par minute. <b>Si tu attends le camion (${hhmm(minutesDe(C.arrivee))}), combien de voitures la ligne ne montera-t-elle pas entre son arrêt et l’arrivée du camion ?</b></p>
        <div class="lg-choix lg-choix-l" role="group">${st.rep.pertes.map((v) => `<button type="button" data-l="rep" data-q="perdues" data-v="${v}"${dis}>${v === 0 ? 'aucune' : `${v} ${plur(v, 'voiture')}`}</button>`).join('')}</div>${retour}`;
    }
    return `${tete}<h3>Que fais-tu ?</h3>
      <p>Un arrêt de la ligne immobiliserait environ <b>${D.personnes.toLocaleString('fr-FR')} personnes</b>.</p>
      <div class="lg-choix" role="group">${C.decisions.map((x) => `<button type="button" data-l="rep" data-q="decision" data-v="${ech(x.v)}"${dis}>${ech(x.lib)}</button>`).join('')}</div>${retour}`;
  }
  function bilanHtml(st, api) {
    if (D.temps === 'evaluation' && !(api && api.estProf)) {
      return `<div class="lg-bilan" data-l-bilan><h3>Matinée terminée</h3><p>Ta matinée est enregistrée. Elle sera corrigée avec ta copie.</p>${D.fin ? `<p>${ech(D.fin)}</p>` : ''}</div>`;
    }
    const R = resumeMatinee(D, st), P = st.premier;
    const L = lignesBilan(D, R);
    const camion = !!D.camion;
    return `<div class="lg-bilan" data-l-bilan><h3>Le bilan de ta matinée</h3>
      ${P && st.rejoue ? '<p class="note">Seule ta première matinée compte pour la note.</p>' : ''}
      <table class="lg-tab"><thead><tr><th></th><th>Ta matinée</th>${camion ? '<th>Le juste</th>' : ''}<th></th></tr></thead><tbody>${L.map((l) =>
        `<tr data-l-ligne="${l.id}"><td>${ech(l.lib)}</td><td>${ech(l.ton)}</td>${camion ? `<td>${ech(l.bon || '')}</td>` : ''}<td class="${l.ok == null ? '' : l.ok ? 'lg-ok' : 'lg-ko'}">${l.ok == null ? '' : l.ok ? '✓' : '✗'}</td></tr>`).join('')}</tbody></table>
      ${R.arret ? `<p>Chaque minute d’arrêt, c’est une voiture de moins et ${D.personnes.toLocaleString('fr-FR')} personnes qui attendent.</p>` : ''}
      ${D.fin ? `<p>${ech(D.fin)}</p>` : ''}
      ${!bloque(api) ? '<p class="lg-ligne"><button type="button" class="btn" data-l="rejouer">Recommencer la matinée</button></p>' : ''}</div>`;
  }
  function departHtml(st, api) {
    return `<div class="lg-depart" data-l-depart>
      ${guidage ? `<p><b>${qui ? ech(qui.prenom) : 'Ton tuteur'} :</b> à gauche, le transstockeur et ses contenants pleins ; au milieu, la ligne et ses postes, chacun avec deux emplacements (« en cours », « d’avance ») ; les robots attendent à la sortie du transstockeur. À droite, la boîte kanban et les robots. Je t’arrête dès qu’il se passe quelque chose de nouveau.</p>` : ''}
      <button type="button" class="btn btn-p" data-l="demarrer"${bloque(api) ? ' disabled' : ''}>Démarrer la matinée (${hhmm(d0)})</button></div>`;
  }
  function contenuHtml(st, api) {
    completer(st);
    const titre = D.titre || '';
    const tete = `<div class="lg-tete"><b>${ech(titre || 'Bord de ligne')}</b>${D.lieu ? `<span>${ech(D.lieu)}</span>` : ''}
      <span class="lg-compteurs"><span data-l-horloge>${hhmm(d0 + st.t)}</span><span data-l-compteur>${st.n} / ${D.minutes} voitures</span></span></div>
      <p class="lg-consigne">${qui ? `<b>${ech(qui.prenom)}${qui.poste ? `, ${ech(qui.poste)}` : ''}</b>` : ''}${consigne(api)}</p>`;
    if (st.fait && !ui.coach) return `${tete}${bilanHtml(st, api)}`;
    return `${tete}
      <div class="lg-grille">
        <div class="lg-zone">
          <div class="lg-barre"><span class="lg-vit">une voiture par minute ${guidage ? '(ralentie)' : '(accélérée)'}</span>
            <button type="button" class="btn lg-pause" data-l="pause"${!st.parti || st.fait || bloque(api) ? ' disabled' : ''}>${ui.pause ? '▶ Reprendre' : '⏸ Pause'}</button></div>
          <svg class="lg-scene" data-l-scene viewBox="0 0 ${W} 420" role="img" aria-label="L’atelier : le transstockeur, les robots, la ligne et ses postes">
            <defs>${symboles(D)}</defs><g>${fondHtml(D)}</g><g data-l-etat>${etatHtml(D, st, { couvertures: guidage })}</g><g data-l-voitures></g><g data-l-robots-s></g><g data-l-vols></g>
          </svg>
          <div class="lg-arret" data-l-arret role="alert">${st.rupture ? `✗ Ligne arrêtée depuis ${st.arretCourant || 1} min : plus de ${ech(st.rupture.map((id) => posteDe(D, id).nom.toLowerCase()).join(', '))} au bord de ligne. ${D.personnes.toLocaleString('fr-FR')} personnes attendent.` : ''}</div>
          <div class="lg-sequence" data-l-sequence>${sequenceHtml(st)}</div>
          ${!st.parti ? departHtml(st, api) : ''}
          <div class="lg-coach${ui.coach ? ' lg-ouv' : ''}" data-l-coach role="status">${ui.coach ? `${aides[ui.coach]}<br><button type="button" class="btn btn-p" data-l="coach-ok">J’ai compris, on continue</button>` : ''}</div>
          <div class="lg-evt${evtOuvert(st) ? ' lg-ouv' : ''}" data-l-evt role="dialog" aria-label="Message">${evtHtml(st)}</div>
        </div>
        <div class="lg-droite">
          <div class="lg-zone" data-l-panneau>${panneauHtml(st, api)}</div>
          <div class="lg-zone" data-l-stockz>${stockHtml(st)}</div>
        </div>
      </div>`;
  }
  function html(st, api) {
    return `<section class="lg" data-ligne="${ech(D.id)}" data-l-ligne${COPIE ? ' data-l-copie' : ''}>${contenuHtml(completer(st), api)}</section>`;
  }

  function brancher(z, st, api) {
    const racine = z.querySelector('[data-l-ligne]');
    if (!racine) return;
    completer(st);
    const reduit = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vols = [];
    let derniereSauvegarde = st.t;
    const sauver = () => { derniereSauvegarde = st.t; api.sauver && api.sauver(); };
    const sel = (s) => racine.querySelector(s);
    function rendre() {
      const a = document.activeElement;
      const avant = a && racine.contains(a) && a.dataset && a.dataset.l ? `[data-l="${a.dataset.l}"]${a.dataset.k ? `[data-k="${a.dataset.k}"]` : ''}${a.dataset.v ? `[data-v="${a.dataset.v}"]` : ''}` : null;
      racine.innerHTML = contenuHtml(st, api);
      if (avant && auClavier()) {
        const b = racine.querySelector(avant) || racine.querySelector('[data-l="coach-ok"],[data-l="evt-suite"],[data-l="rep"],[data-l="envoyer"]');
        if (b && !b.disabled) b.focus({ preventScroll: true });
      }
    }
    // Ce qui change à chaque minute, sans refaire les boutons (un clic en cours ne se perd pas) ; le panneau des cartes n'est refait que
    // si les cartes, les robots ou le stock ont changé.
    let signature = '';
    function maj() {
      if (!sel('[data-l-scene]')) { rendre(); return; }
      const h = sel('[data-l-horloge]'); if (h) h.textContent = hhmm(d0 + st.t);
      const c = sel('[data-l-compteur]'); if (c) c.textContent = `${st.n} / ${D.minutes} voitures`;
      sel('[data-l-etat]').innerHTML = etatHtml(D, st, { couvertures: guidage });
      sel('[data-l-sequence]').innerHTML = sequenceHtml(st);
      const ar = sel('[data-l-arret]');
      ar.textContent = st.rupture ? `✗ Ligne arrêtée depuis ${st.arretCourant || 1} min : plus de ${st.rupture.map((id) => posteDe(D, id).nom.toLowerCase()).join(', ')} au bord de ligne. ${D.personnes.toLocaleString('fr-FR')} personnes attendent.` : '';
      const sig = JSON.stringify([st.cartes.map((x) => x.k), st.robots, st.stock, st.camion, st.urgents, ui.sel, ui.urgent, st.parti, st.fait]);
      if (sig !== signature) {
        signature = sig;
        const a = document.activeElement, k = a && racine.contains(a) && a.dataset ? a.dataset.k || a.dataset.l : null;
        sel('[data-l-panneau]').innerHTML = panneauHtml(st, api);
        sel('[data-l-stockz]').innerHTML = stockHtml(st);
        if (k && auClavier()) { const b = racine.querySelector(`[data-k="${k}"]`) || racine.querySelector(`[data-l="${k}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
      } else {
        st.cartes.forEach((x) => { const e = racine.querySelector(`[data-l-age="${x.k}"]`); if (e) { const age = st.t - x.t; e.textContent = `${age} min`; e.classList.toggle('lg-vieux', age >= 3); } });
      }
    }
    // Le collègue (guidage) : il arrête la ligne la première fois que quelque chose de nouveau arrive.
    function coachSi() {
      if (!guidage || ui.coach || st.fait || bloque(api)) return false;
      const vu = st.coach;
      let cle = null;
      if (st.rupture && !vu.arret) cle = 'arret';
      else if (st.cartes.length && !vu.carte) cle = 'carte';
      else if (vu.carte && st.cartes.length >= 2 && D.robots.places > 1 && !vu.deux && st.robots.some((r) => !r.liv && r.libre <= st.t)) cle = 'deux';
      else if (vu.carte && !vu.bas && st.cartes.some((x) => couverture(D, st, x.p) <= D.robots.trajet)) cle = 'bas';
      if (!cle) return false;
      vu[cle] = true; ui.coach = cle;
      return true;
    }
    function uneMinute() {
      const avant = st.arret;
      const out = minuteLigne(D, st);
      st.arretCourant = st.rupture ? (st.arretCourant || 0) + (st.arret > avant ? 1 : 0) : 0;
      if (!reduit) out.cartes.forEach((id) => vols.push({ x: posteX(D, D.postes.findIndex((p) => p.id === id)), id, t0: performance.now() }));
      ui.sel = ui.sel.filter((k) => st.cartes.some((c) => c.k === k));
      if (out.fini) {
        ui.pause = false;
        if (!st.premier) st.premier = resumeMatinee(D, st);
        api.signal && api.signal(geste('fini'));
        sauver(); rendre(); return out;
      }
      const coach = coachSi();
      if (out.annonce || coach) { sauver(); rendre(); return out; }
      if (st.t - derniereSauvegarde >= 5) sauver();
      maj();
      return out;
    }
    function refus(motif, x) { const m = MOTIFS_REFUS[motif]; ui.retour = `<span class="lg-ko">✗ ${ech(typeof m === 'function' ? m(D, x || {}) : m)}</span>`; }
    function envoyer() {
      if (arretee(st, api)) return;
      const premier = st.envois === 0;
      const r = envoyerRobot(D, st, ui.sel.slice(), { urgent: ui.urgent });
      if (!r.ok) { refus(r.motif, r); rendre(); return; }
      ui.retour = `R${r.robot + 1} part : livraison au bord de ligne à ${hhmm(d0 + r.a)}.`;
      ui.sel = []; ui.urgent = false;
      if (premier) api.signal && api.signal(geste('envoi'));
      sauver(); rendre();
    }
    function repondre(q, v) {
      if (bloque(api) || ui.evtRetour) return;
      const etape = st.evt;
      if (!repondreCamion(D, st, q, v)) return;
      if (guidage) {
        const ok = q === 'heure' ? st.rep.heure === st.rep.heureJuste : q === 'perdues' ? st.rep.perdues === st.rep.perduesJuste : D.camion.decisions.find((x) => x.v === v).juste;
        const p = posteDe(D, D.camion.poste);
        const pourquoi = q === 'heure'
          ? `Il reste ${surLigne(st, p.id) + enRoute(D, st, p.id) + st.stock[p.id] * p.par} ${ech(p.nom.toLowerCase())} en tout (bord de ligne, robots et transstockeur), et la ligne en monte une voiture par minute : elle s’arrêtera vers ${hhmm(d0 + st.rep.heureJuste)}.`
          : q === 'perdues' ? `Arrivée du camion moins heure d’arrêt : ${st.rep.perduesJuste} ${plur(st.rep.perduesJuste, 'voiture')}.` : '';
        const x = q === 'decision' ? D.camion.decisions.find((c) => c.v === v) : null;
        // Le message reste ouvert sur la question répondue, le temps de lire le retour (« Continuer »).
        ui.evtRetour = `${ok ? '<span class="lg-ok">✓ Juste.</span>' : '<span class="lg-ko">✗ Pas tout à fait.</span>'} ${ech(pourquoi)}${x && x.retour ? ` ${ech(x.retour)}` : ''}`;
        ui.evtEtape = etape;
      } else {
        const x = q === 'decision' ? D.camion.decisions.find((c) => c.v === v) : null;
        ui.retour = x && x.retour ? ech(x.retour) : 'Réponse notée.';
      }
      if (q === 'decision' && !guidage) api.signal && api.signal(geste('camion'));
      sauver(); rendre();
    }
    function evtSuite() {
      if (!ui.evtRetour) return;
      const fin = ui.evtEtape === 3;
      ui.evtRetour = null; ui.evtEtape = null;
      if (fin) api.signal && api.signal(geste('camion'));
      rendre();
    }
    racine.addEventListener('click', (ev) => {
      if (api.gele && api.gele()) return;
      const b = ev.target.closest && ev.target.closest('[data-l]');
      if (!b || b.disabled) return;
      const quoi = b.dataset.l;
      if (bloque(api)) return;
      if (quoi === 'demarrer') { if (!st.parti) { st.parti = true; ui.acc = 0; sauver(); rendre(); } }
      else if (quoi === 'pause') { if (st.parti && !st.fait) { ui.pause = !ui.pause; rendre(); } }
      else if (quoi === 'coach-ok') { ui.coach = null; coachSi(); rendre(); }
      else if (quoi === 'carte') {
        if (!st.parti || st.fait || ui.pause || ui.coach || evtOuvert(st)) return;
        const k = +b.dataset.k;
        ui.sel = ui.sel.includes(k) ? ui.sel.filter((x) => x !== k) : [...ui.sel, k];
        ui.retour = ''; rendre();
      } else if (quoi === 'urgent') { ui.urgent = !!b.checked; }
      else if (quoi === 'envoyer') envoyer();
      else if (quoi === 'rep') repondre(b.dataset.q, b.dataset.v);
      else if (quoi === 'evt-suite') evtSuite();
      else if (quoi === 'rejouer') {
        if (!st.fait || D.temps === 'evaluation') return;
        const { premier, coach } = st;
        Object.keys(st).forEach((k) => delete st[k]);
        Object.assign(st, matineeNeuve(D), { premier, coach, rejoue: true });
        Object.assign(ui, { sel: [], urgent: false, pause: false, coach: null, retour: '', evtRetour: null, evtEtape: null, acc: 0 });
        sauver(); rendre();
      }
    });
    // L'horloge : par écart d'horloge, arrêtée onglet caché, en pause, pendant une explication, le message du camion ou une question au fil.
    let dernier = Date.now();
    const minuterie = setInterval(() => {
      if (!racine.isConnected) { clearInterval(minuterie); return; }
      const t = Date.now(), dt = Math.min(1, (t - dernier) / 1000);
      dernier = t;
      if (arretee(st, api) || (typeof document !== 'undefined' && document.hidden)) return;
      ui.acc += dt;
      const s = secondesMinute(D, { tiersTemps: !!api.tiersTemps });
      if (ui.acc >= s) { ui.acc -= s; uneMinute(); }
    }, 100);
    // L'animation (voitures qui avancent, robots qui roulent, cartes qui volent) : rien n'est rangé, tout se calcule.
    function animer() {
      if (!racine.isConnected) return;
      const gV = sel('[data-l-voitures]'), gR = sel('[data-l-robots-s]'), gF = sel('[data-l-vols]');
      if (gV && gR && gF) {
        const s = secondesMinute(D, { tiersTemps: !!api.tiersTemps });
        const p = reduit || arretee(st, api) ? 0 : Math.min(1, ui.acc / s);
        const marche = !st.rupture && !st.fait;
        let h = '';
        for (let j = st.n + 1; j >= st.n - 6; j--) {
          if (j < 0) continue;
          const x = 255 + (st.n + (marche ? p : 0) - j) * PAS;
          if (x > 1000 || x < 250) continue;
          h += `<g transform="translate(${x.toFixed(1)},${LIGNE_Y})">${voitureHtml(MODELES[modeleDe(D, j)])}</g>`;
        }
        gV.innerHTML = h;
        const tf = st.t + p;
        h = '';
        st.robots.forEach((r, i) => {
          const garage = SORTIE_X + 14 + i * 52;
          let x = garage, chargeR = [];
          if (r.liv) { const f = Math.min(1, Math.max(0, (tf - r.liv.d) / Math.max(1, r.liv.a - r.liv.d))); x = garage + (posteX(D, r.liv.x) - garage) * f; chargeR = r.liv.p; }
          else if (r.ret && tf < r.libre) { const f = Math.min(1, Math.max(0, (tf - r.ret.de) / Math.max(1, r.libre - r.ret.de))); x = posteX(D, r.ret.x) + (garage - posteX(D, r.ret.x)) * f; }
          h += `<g transform="translate(${x.toFixed(1)},${ALLEE_Y + 18})">${robotHtml(D, i, chargeR)}</g>`;
        });
        gR.innerHTML = h;
        const now = performance.now();
        for (let i = vols.length - 1; i >= 0; i--) if (now - vols[i].t0 > 800) vols.splice(i, 1);
        gF.innerHTML = vols.map((v) => { const f = (now - v.t0) / 800, x = v.x + (255 - v.x) * f, y = 190 - Math.sin(f * Math.PI) * 60;
          return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><rect x="-9" y="-7" width="18" height="14" rx="1.5" class="lg-carte-vol"/><use href="#lg-ic-${icone(D, v.id)}" x="-7" y="-6" width="14" height="12"/></g>`; }).join('');
      }
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(animer);
    }
    animer();
    // Pour les tests : faire passer des minutes sans attendre (s'arrête à une explication, au message du camion ou à la fin), lire l'écran.
    racine.__ligne = {
      avancer(n = 1) { for (let i = 0; i < n; i++) { if (arretee(st, api)) break; uneMinute(); } return { t: st.t, n: st.n, arret: st.arret }; },
      lire: () => ({ sel: ui.sel.slice(), coach: ui.coach, pause: ui.pause, retour: ui.retour }),
      declaration: D,
    };
  }

  return {
    id: D.id,
    nav: { libelle: D.libelle || 'Bord de ligne' },
    signaux,
    copie: COPIE,
    declaration: D,
    etatNeuf: () => matineeNeuve(D),
    html,
    brancher,
  };
}
