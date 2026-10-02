// Boost — ENT-3.3, « la tournée à corriger ». C2.4, organiser une tournée de livraison.
//
// Troisième des quatre séances de C2.4 : l'ERREUR INDUITE. ENT-3.1 (guidage) a appris le geste,
// ENT-3.2 (entraînement) l'a fait refaire sous trois contraintes — la charge utile, le train de
// 16 h 10, le créneau de la Pâtisserie Arnaud. Ici l'élève ne construit pas : il CONTRÔLE la
// tournée d'une collègue, dit quelles contraintes elle ne tient pas en le chiffrant, puis la répare.
// Brief : `docs/briefs/ENT-3.3-boost-tournee-a-corriger.md` ; décisions de Tristan du 02/10/2026
// dans `docs/decisions.md`.
//
//   · même journée qu'ENT-3.2 : même carte, mêmes huit clients, mêmes contraintes. La carte est
//     IMPORTÉE (`boost-ent32-carte.js`), pas recopiée ; la feuille de calcul est la même ;
//   · la tournée d'Inès (tournée « B ») : la Mercerie Pellet (12 kg, la plus petite commande)
//     laissée à quai, puis l'ordre le plus court. Deux contraintes violées sur trois — surcharge et
//     créneau raté —, le train est TENU : c'est le leurre, qui vérifie que l'élève n'accuse pas
//     tout. Son raisonnement est plausible (« une commande reste à quai : la plus petite » ;
//     « le plus court donne de la marge ») : c'est la leçon d'ENT-3.2 appliquée à moitié ;
//   · la tournée est déjà posée à l'ouverture (`etatInitial`, une seule fois, voir tournee.js) et
//     les jauges ne disent rien (`sansVerdict`) : le diagnostic se calcule, il ne se lit pas ;
//   · l'élève répond à Inès en recopiant six lignes à intitulé — une par contrainte (tenue ou
//     non), puis trois chiffres (poids chargé, arrivée chez la Pâtisserie, arrivée à la gare).
//     Décision de Tristan du 02/10 : une ligne PAR contrainte plutôt qu'une liste, pour que
//     l'élève se prononce aussi sur le leurre et que « tout cocher » n'existe pas.
//
// ── Ce qui est vérifié, ce qui est construit ────────────────────────────────────────────
// Boost, son métier et le vélo-cargo jusqu'à la gare : vérifiés, voir l'en-tête de
// `contenus/boost.js`. Inès, son message, sa tournée et ses chiffres sont CONSTRUITS (prénom
// inventé, métier réel de livreuse à vélo-cargo) ; les commerces sont ceux, inventés, d'ENT-3.2.
//
// ── Rien n'est recopié ──────────────────────────────────────────────────────────────────
// Les contraintes violées, le poids chargé et les heures que les jalons attendent sont
// RECALCULÉS depuis la tournée d'Inès par le bilan du moteur — le même code que les clics. La
// meilleure tournée est celle d'ENT-3.2, recalculée par son `optimum()` (énumération des 5 040
// ordres). Seul le test écrit les valeurs à la main (218 kg, 15 h 27, 15 h 50).

import { creerTournee } from '../core/types/tournee.js';
import * as E32 from './boost-ent32.js';

export const TRANSPORT_ID = 'boost-ent33';

/* ===================================================================== la journée ====== */

// La journée d'ENT-3.2, telle quelle.
export const JOURNEE = E32.JOURNEE;
export const CLIENTS = E32.CLIENTS;
export const CRENEAU = E32.CRENEAU;
export const A_QUAI = E32.A_QUAI;
export const optimum = E32.optimum;

const h = (m) => { const r = Math.round(m); return `${Math.floor(r / 60)} h ${String(r % 60).padStart(2, '0')}`; };
const nomDe = (id) => (CLIENTS.find((c) => String(c.id) === String(id)) || {}).nom || id;
const idDe = (nom) => String(CLIENTS.find((c) => c.nom === nom).id);

// La collègue. Prénom inventé, métier réel (décision de Tristan, 02/10/2026).
export const INES = { nom: 'Inès', role: 'livreuse vélo-cargo', mail: 'ines.livraison@boost.example' };

// La tournée d'Inès : la plus petite commande à quai, puis le plus court parmi les sept autres.
// Désignée par les NOMS des commerces, pour qu'une erreur d'identifiant se voie à la lecture.
const QUAI_INES = 'Mercerie Pellet';
export const COLLEGUE = {
  ordre: ['Herboristerie Mazel', 'Atelier Ribot', 'Épicerie Roussel', 'Torréfaction Guiraud',
    'Papeterie Bonnet', 'Pâtisserie Arnaud', 'Cave Teissier'].map(idDe),
  quai: [idDe(QUAI_INES)],
  depart: true,
  arrivee: true,
};

/* ================================================================= la tournée (carte) ==== */
// La vue d'ENT-3.2, avec trois différences : la tournée d'Inès est posée à l'ouverture, les jauges
// ne donnent aucun verdict, et la consigne demande de contrôler avant de réparer. Le plan est passé
// à la tournée seule : pas de menu « Plan de Nîmes », tous les clients sont déjà sur la carte.

export const TOURNEE = Object.assign({}, E32.TOURNEE, {
  plan: E32.PLAN,
  titre: 'La tournée d’Inès, à contrôler puis à corriger',
  consigne: `Inès a préparé la tournée du vélo-cargo : elle est déjà construite ci-dessous (départ à `
    + `${h(JOURNEE.depart)}, ordre de passage, commande laissée à quai). Contrôlez-la AVANT d’y toucher : `
    + `la feuille de calcul suit la tournée affichée. Comparez le poids chargé à la charge utile `
    + `(${JOURNEE.chargeUtile} kg), l’arrivée à la gare au train de ${h(JOURNEE.limite)}`
    + (CRENEAU ? ` et l’arrivée à la ${CRENEAU.nom} à son créneau (avant ${h(CRENEAU.creneau.avant)})` : '')
    + `. Répondez à Inès, puis réparez la tournée en cliquant sur la carte. « Retrouver la tournée de `
    + `départ » remet celle d’Inès.`,
  etatInitial: COLLEGUE,
  sansVerdict: true,
});

// Le bilan d'une tournée, par la même vue que l'écran.
const VUE = creerTournee(TOURNEE);

/* ======================================================== le diagnostic attendu ====== */
// Recalculé depuis la tournée d'Inès, jamais écrit en dur. `null` si la journée ne permet pas
// de diagnostic (par exemple un créneau supprimé).
export function diagnostic() {
  const b = VUE.bilan(Object.assign({ report: {}, juge: {} }, COLLEGUE, { depart: 1, arrivee: 1 }));
  const c = CRENEAU ? b.creneaux.find((x) => String(x.id) === String(CRENEAU.id)) : null;
  if (!c || c.arrivee == null || b.arrivee == null) return null;
  return {
    surcharge: b.cumuls.charge > JOURNEE.chargeUtile,
    trainManque: !!b.enRetard,
    creneauRate: !!c.rate,
    poids: b.cumuls.charge,
    arriveeClient: c.arrivee,
    arriveeGare: b.arrivee,
    km: b.km,
  };
}

/* ======================================================= la réponse à Inès ============ */
// Six lignes à recopier ; les jalons ne lisent que celles-là — pas de règle cachée.
export const LIGNES_REPONSE = {
  charge: 'Charge utile :',
  train: `Train de ${h(JOURNEE.limite)} :`,
  // « la » : le client à créneau de cette journée est la Pâtisserie Arnaud.
  creneau: `Créneau de ${CRENEAU ? `la ${CRENEAU.nom}` : 'la livraison'} :`,
  poids: 'Poids chargé :',
  client: `Arrivée à ${CRENEAU ? `la ${CRENEAU.nom}` : 'chez le client à créneau'} :`,
  gare: 'Arrivée à la gare :',
};
// Ce que l'élève choisit sur les trois premières lignes : tenue, ou pas.
const CHOIX = {
  charge: ['respectée', 'dépassée'],
  train: ['attrapé', 'manqué'],
  creneau: ['tenu', 'raté'],
};

const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();

// La DERNIÈRE ligne qui porte l'intitulé, sans l'intitulé : ce que l'élève a écrit après. Les
// petits mots ne comptent pas pour reconnaître l'intitulé (« Créneau de Pâtisserie Arnaud » vaut
// « Créneau de la Pâtisserie Arnaud ») ; ce qui suit son dernier mot est rendu tel quel.
const sansArticles = (x) => x.replace(/\b(?:la|le|les|de|du|des|chez|a)\b|\bl'/g, ' ').replace(/\s+/g, ' ').trim();
export function lireLigne(texte, intitule) {
  const cle = sansArticles(nrm(intitule).replace(/\s*:$/, ''));
  const toutes = String(texte || '').split(/\r?\n/).map(nrm).filter((x) => sansArticles(x).includes(cle));
  // Une ligne qui COMMENCE par l'intitulé passe avant une autre qui le cite en passant
  // (« Poids chargé : 218, pour une charge utile de 180 »).
  const debut = toutes.filter((x) => sansArticles(x.replace(/^[^a-z0-9]+/, '')).startsWith(cle));
  const l = debut.length ? debut : toutes;
  if (!l.length) return null;
  const x = l[l.length - 1];
  const fin = cle.split(' ').pop();
  return x.slice(x.indexOf(fin) + fin.length).replace(/^\s*:?\s*/, '');
}

// Tenue (true), non tenue (false), ou illisible (null) : les mots de la liste, une négation qui
// les retourne (« pas dépassée »), et rien si la ligne dit les deux à la fois.
const MOTS = {
  charge: { oui: /respect|\bok\b|\bsous\b|en dessous/, non: /depass|surcharg|\btrop\b|au.dessus/ },
  train: { oui: /attrap|\bpris\b|\btenu|a l'heure|a temps|en avance/, non: /manqu|\brate|loupe|en retard|trop tard/ },
  creneau: { oui: /\btenu|respect|a l'heure|a temps|en avance/, non: /\brate|manqu|loupe|en retard|trop tard|depass/ },
};
export function lireVerdict(cle, morceau) {
  if (morceau == null) return null;
  const s = morceau;
  const oui = MOTS[cle].oui.test(s), non = MOTS[cle].non.test(s);
  if (oui === non) return null;
  const nie = /\b(pas|non|jamais)\b|\bn'/.test(s);
  return nie ? !oui : oui;
}

// Le nombre lu : après le dernier « = » s'il y en a un (« 230 − 12 = 218 kg »), le premier.
export function lireNombre(morceau) {
  if (morceau == null) return null;
  const s = morceau.split('=').pop().replace(/(\d)\s+(\d{3})\b/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2');
  const m = s.match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

// Une heure lue, en minutes depuis minuit : « 15 h 27 », « 15h27 », « 15:27 », « 15 h ». Un
// nombre seul au-delà de 24 se lit en minutes (« 927 »).
export function lireHeure(morceau) {
  if (morceau == null) return null;
  const s = morceau.split('=').pop();
  const m = s.match(/(\d{1,2})\s*(?:h|:)\s*(\d{1,2})?/);
  if (m) {
    const hh = parseInt(m[1], 10), mm = m[2] ? parseInt(m[2], 10) : 0;
    return hh < 24 && mm < 60 ? hh * 60 + mm : null;
  }
  const n = lireNombre(s);
  return n != null && n > 24 ? n : null;
}

const TOLERANCE_MIN = 1;   // l'heure se calcule depuis des kilomètres arrondis au dixième

function reponses(db) {
  return ((db && db.mails) || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(INES.mail))
    .sort((a, b) => a.ts - b.ts);
}
const envoye = (msg) => `Réponse envoyée le ${new Date(msg.ts).toLocaleString('fr-FR')}.\n`;

// Le meilleur essai : le premier juste, sinon le dernier envoyé.
function jalonReponse(db, juger) {
  const D = diagnostic();
  if (!D) return { status: 'na', detail: 'Journée mal calée : pas de diagnostic.' };
  const mails = reponses(db);
  if (!mails.length) return { status: 'attente', detail: 'Aucune réponse envoyée à Inès.' };
  const evals = mails.map((msg) => { const r = juger(msg.text, D); return { ts: msg.ts, ok: r.ok, detail: envoye(msg) + r.detail }; });
  const best = evals.find((e) => e.ok) || evals[evals.length - 1];
  return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
}

const mot = (cle, tenue) => CHOIX[cle][tenue ? 0 : 1];

// Pour les tests et le futur corrigé : une réponse juste, relue dans la journée.
export function reponseAttendue() {
  const D = diagnostic();
  if (!D) return null;
  const L = LIGNES_REPONSE;
  return [
    `${L.charge} ${mot('charge', !D.surcharge)}`,
    `${L.train} ${mot('train', !D.trainManque)}`,
    `${L.creneau} ${mot('creneau', !D.creneauRate)}`,
    `${L.poids} ${D.poids} kg`,
    `${L.client} ${h(D.arriveeClient)}`,
    `${L.gare} ${h(D.arriveeGare)}`,
  ].join('\n');
}

/* ====================================================================== l'accueil ===== */

export const ACCUEIL = {
  titre: 'Une tournée déjà prête… à vérifier',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Inès', 'Menu Messagerie : sa tournée, son raisonnement, et les six lignes qu’elle attend en réponse.'],
    ['Contrôler sa tournée', 'Menu Tournée : elle est déjà construite. Ne la modifiez pas encore — la feuille de calcul suit la tournée affichée.'],
    ['Calculer', `Dans la feuille : le poids chargé, l’heure d’arrivée à la gare${CRENEAU ? ` et chez ${CRENEAU.nom}` : ''}. Comparez chacun à sa contrainte.`],
    ['Répondre à Inès', 'Pour chaque contrainte : tenue ou pas. Puis les trois chiffres qui le prouvent.'],
    ['Réparer la tournée', 'Sur la carte : la bonne commande à quai, un ordre qui tient tout, le plus court possible.'],
  ],
};

/* ======================================================================== le volet ==== */

export const VOLET = {
  id: 'boost-ent33',
  semer(prenom) {
    const now = Date.now();
    const fiche = CLIENTS
      .map((c, i) => `${i + 1}. ${c.nom} — ${c.adresse} — ${c.colis} colis, ${c.kg} kg`
        + (c.creneau ? ` — ${c.creneau.libelle}` : ''))
      .join('\n');
    const L = LIGNES_REPONSE;
    const choix = (cle) => `(${CHOIX[cle][0]} ou ${CHOIX[cle][1]})`;
    return {
      mails: [
        { folder: 'in', ts: now - 3600e3, from: `${INES.nom}, ${INES.role}`,
          fromMail: INES.mail, to: prenom,
          subject: `Ma tournée de cet après-midi : tu peux la vérifier avant que je parte ?`, kind: 'text',
          text: `Salut ${prenom},\n\nJ’ai préparé la tournée du vélo-cargo de cet après-midi. Elle est déjà `
            + `dans l’outil, menu Tournée.\n\nLe rappel : départ de l’entrepôt à ${h(JOURNEE.depart)}, `
            + `${JOURNEE.chargeUtile} kg au plus dans le vélo-cargo, ${JOURNEE.service} minutes par arrêt, `
            + `une douzaine de kilomètres à l’heure en ville, et le train de Paris part de Nîmes-Centre à `
            + `${h(JOURNEE.limite)}.`
            + (CRENEAU ? ` ${CRENEAU.nom} ne reçoit qu’avant ${h(CRENEAU.creneau.avant)}.` : '')
            + `\n\nLes commandes :\n\n${fiche}\n\n`
            + `Mon raisonnement : on sait que tout ne rentre pas dans le vélo-cargo, alors j’ai laissé une commande `
            + `à quai — la ${QUAI_INES}, c’est la plus petite, elle partira demain sans gêner personne. Pour le `
            + `reste, j’ai pris l’ordre le plus court sur la carte : moins de kilomètres, donc forcément de la `
            + `marge partout.\n\nM. Morin veut qu’on se relise à deux avant chaque départ. Tu peux vérifier ? `
            + `Réponds-moi en recopiant ces six lignes et en les complétant :\n\n`
            + `${L.charge} ${choix('charge')}\n${L.train} ${choix('train')}\n${L.creneau} ${choix('creneau')}\n`
            + `${L.poids} (en kg)\n${L.client} (l’heure)\n${L.gare} (l’heure)\n\n`
            + `Une ligne par information, s’il te plaît. Calcule sur MA tournée avant d’y toucher : la feuille `
            + `de calcul suit la tournée affichée. Ensuite, si quelque chose ne va pas, corrige-la directement `
            + `dans l’outil.\n\nMerci !\n${INES.nom}` },
      ],
    };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Six jalons, chacun vaut 1/6 de la note sur 20 (la séance déclare un barème, pas de notation).
 * Le diagnostic et la réparation sont des jalons DISTINCTS (décision de Tristan, 02/10) :
 * l'un peut être juste et l'autre faux, et le suivi le dit.
 *
 *   contraintes  Diagnostic : chaque contrainte dite tenue ou non, et juste (leurre compris)
 *   preuves      Diagnostic : poids chargé, arrivée chez le client à créneau, arrivée à la gare
 *   charge       Réparation : la bonne commande à quai, la charge utile respectée
 *   horaire      Réparation : le train est attrapé
 *   creneau      Réparation : le créneau est tenu
 *   trajet       Réparation : tout est tenu, à moins de 10 % de la meilleure tournée
 *
 * Les jalons de réparation lisent l'état de la tournée par le bilan de la vue, comme ENT-3.2. La
 * tournée d'Inès laissée telle quelle ne vaut AUCUN jalon de réparation : elle est surchargée,
 * et le test le garde ; `inchangee` le dit en plus, en clair.
 */

const etatTournee = (db) => (db && db.transport && db.transport[TRANSPORT_ID] ? db.transport[TRANSPORT_ID].tournee : null);
// L'élève n'a pas encore ouvert la tournée : la tournée d'Inès n'est pas posée.
const ouverte = (e) => !!(e && e.ordre && e.amorce);
const inchangee = (e) => JSON.stringify([e.ordre.map(String), [...(e.quai || [])].map(String).sort(), !!e.depart, !!e.arrivee])
  === JSON.stringify([COLLEGUE.ordre, [...COLLEGUE.quai].sort(), true, true]);
const bonChargement = (e) => {
  const quai = (e.quai || []).map(String);
  return !!A_QUAI && quai.length === 1 && quai[0] === A_QUAI;
};
const INCHANGEE = { status: 'ko', detail: 'La tournée est encore celle d’Inès : rien n’est réparé.' };

// Préambule commun aux jalons de réparation : `null` si le jalon peut juger, sinon son statut.
function avantReparation(e) {
  if (!ouverte(e)) return { status: 'na' };
  if (inchangee(e)) return INCHANGEE;
  return null;
}

export const ETAPES = [
  {
    id: 'contraintes',
    titre: 'Diagnostic · chaque contrainte dite tenue ou non, sans en accuser une à tort',
    verifier(db) {
      return jalonReponse(db, (texte, D) => {
        const attendu = { charge: !D.surcharge, train: !D.trainManque, creneau: !D.creneauRate };
        const lignes = Object.keys(attendu).map((cle) => {
          const lu = lireVerdict(cle, lireLigne(texte, LIGNES_REPONSE[cle]));
          const dit = lu == null ? '(illisible ou absente)' : mot(cle, lu);
          return { ok: lu === attendu[cle], txt: `${LIGNES_REPONSE[cle]} ${dit} — ${lu === attendu[cle] ? 'juste' : 'à revoir'}` };
        });
        return { ok: lignes.every((l) => l.ok), detail: lignes.map((l) => l.txt).join('\n') };
      });
    },
  },
  {
    id: 'preuves',
    titre: 'Diagnostic · les chiffres qui le prouvent (poids chargé, deux heures d’arrivée)',
    verifier(db) {
      return jalonReponse(db, (texte, D) => {
        const poids = lireNombre(lireLigne(texte, LIGNES_REPONSE.poids));
        const client = lireHeure(lireLigne(texte, LIGNES_REPONSE.client));
        const gare = lireHeure(lireLigne(texte, LIGNES_REPONSE.gare));
        const okP = poids != null && Math.abs(poids - D.poids) < 0.5;
        const okC = client != null && Math.abs(client - D.arriveeClient) <= TOLERANCE_MIN + 0.5;
        const okG = gare != null && Math.abs(gare - D.arriveeGare) <= TOLERANCE_MIN + 0.5;
        // Le détail dit ce qui est juste ou à revoir, jamais la valeur attendue : l'élève le lit.
        const dire = (lu, ok, fmt) => `${lu == null ? '(aucun nombre lu)' : fmt(lu)} — ${ok ? 'juste' : 'à revoir'}`;
        return { ok: okP && okC && okG,
          detail: `Poids chargé : ${dire(poids, okP, (x) => `${x} kg`)}\n`
            + `${LIGNES_REPONSE.client} ${dire(client, okC, h)}\n`
            + `Arrivée à la gare : ${dire(gare, okG, h)}` };
      });
    },
  },
  {
    id: 'charge',
    titre: 'Réparation · la bonne commande à quai, la charge utile respectée',
    verifier(db) {
      const e = etatTournee(db);
      const pre = avantReparation(e);
      if (pre) return pre;
      const b = VUE.bilan(e);
      const quai = (e.quai || []).map(String);
      const detail = `${b.cumuls.charge} kg chargés sur ${JOURNEE.chargeUtile} kg utiles ; `
        + (quai.length ? `à quai : ${quai.map(nomDe).join(', ')}.` : 'rien n’est à quai.');
      if (b.cumuls.charge > JOURNEE.chargeUtile) return { status: 'ko', detail };
      return { status: bonChargement(e) ? 'ok' : 'ko', detail };
    },
  },
  {
    id: 'horaire',
    titre: `Réparation · le train de ${h(JOURNEE.limite)} est attrapé`,
    verifier(db) {
      const e = etatTournee(db);
      const pre = avantReparation(e);
      if (pre) return pre;
      const b = VUE.bilan(e);
      if (b.cumuls.charge > JOURNEE.chargeUtile) {
        return { status: 'ko', detail: 'Le vélo-cargo est surchargé : l’horaire ne veut rien dire.' };
      }
      // Une chaîne incomplète raccourcit le trajet : oublier la gare ne doit pas valoir le train.
      if (!b.complete || b.arrivee == null) return { status: 'attente', detail: 'Placez le départ et l’arrivée.' };
      return { status: b.enRetard ? 'ko' : 'ok',
        detail: `Arrivée à la gare à ${h(b.arrivee)} pour un train à ${h(JOURNEE.limite)}, ${b.km.toFixed(1)} km.` };
    },
  },
  {
    id: 'creneau',
    titre: CRENEAU ? `Réparation · le créneau de ${CRENEAU.nom} est tenu` : 'Réparation · le créneau est tenu',
    verifier(db) {
      const e = etatTournee(db);
      const pre = avantReparation(e);
      if (pre) return pre;
      const b = VUE.bilan(e);
      if (b.cumuls.charge > JOURNEE.chargeUtile) {
        return { status: 'ko', detail: 'Le vélo-cargo est surchargé : le créneau ne veut rien dire.' };
      }
      // L'heure chez le client se compte depuis le départ : sans lui, elle serait trop tôt.
      if (!b.departPose) return { status: 'attente', detail: 'Placez le départ.' };
      const c = b.creneaux.find((x) => x.charge);
      if (!c) return { status: 'ko', detail: `${CRENEAU ? CRENEAU.nom : 'Le client à créneau'} n’est pas dans la tournée.` };
      return { status: c.rate ? 'ko' : 'ok', detail: `Arrivée chez ${c.nom} à ${h(c.arrivee)} pour une limite à ${h(c.avant)}.` };
    },
  },
  {
    id: 'trajet',
    titre: 'Réparation · tout est tenu, à moins de 10 % de la meilleure tournée possible',
    verifier(db) {
      const e = etatTournee(db);
      const pre = avantReparation(e);
      if (pre) return pre;
      const opt = optimum();
      if (!opt) return { status: 'na', detail: 'Journée mal calée : pas de meilleure tournée.' };
      const b = VUE.bilan(e);
      if (!b.complete) return { status: 'attente', detail: 'Placez le départ et l’arrivée.' };
      if (!bonChargement(e)) return { status: 'ko', detail: 'Le chargement n’est pas le bon : la distance ne se juge pas.' };
      if (b.cumuls.charge > JOURNEE.chargeUtile) return { status: 'ko', detail: 'Le vélo-cargo est surchargé.' };
      if (b.enRetard || b.creneauRate) {
        return { status: 'ko', detail: `La tournée ne tient pas ${b.enRetard ? 'le train' : 'le créneau'} : la distance ne se juge pas.` };
      }
      const ecart = (b.km / opt.km - 1) * 100;
      return { status: b.km <= opt.km * 1.10 + 1e-9 ? 'ok' : 'ko',
        detail: `${b.km.toFixed(1)} km pour une meilleure tournée de ${opt.km.toFixed(1)} km (${ecart >= 0 ? '+' : ''}${ecart.toFixed(1)} %), seuil 10 %.` };
    },
  },
];
