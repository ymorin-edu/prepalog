// Cdiscount — ENT-2.1 « Le stock raconte ». Guidage, C1.6.
//
// Première séance de l'environnement Cdiscount. L'élève ne touche pas au stock : il le LIT.
// Une semaine s'est écoulée depuis le dernier inventaire de l'allée des écouteurs ; la cheffe
// d'équipe veut comprendre comment le stock d'écouteurs est arrivé où il est. L'élève relie
// chaque mouvement à son document (réception, bon de préparation, retour, constat de casse),
// puis refait le calcul à l'envers : stock d'aujourd'hui → stock du jour de l'inventaire.
//
// Ce que la séance installe, et que les trois suivantes supposent :
//   - un mouvement de stock a toujours un DOCUMENT d'origine ;
//   - le stock d'aujourd'hui = stock de l'inventaire + entrées − sorties ;
//   - toutes les sorties ne sont pas des ventes (casse), toutes les entrées ne sont pas des
//     achats (retour client).
//
// Volume (règle de `claude/prepalog-montee-en-competences.md`, guidage = peu d'opérations) :
// 5 références, 10 documents, 19 mouvements. Déclaré dans `VOLUME`, repris dans le `meta`.
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`).

import { CUSTOMERS, EQUIPE, mailBienvenue, sousCatalogue } from './cdiscount.js';

/* ------------------------------------------------------------------ périmètre */

// Les cinq références de l'allée : celles de la zone A que l'élève retrouvera en ENT-2.2.
export const MODELES = ['CAB-USBC-1M', 'CHG-20W', 'ECO-BT-01', 'BAT-10K', 'COQ-UNI-01'];
export const CATALOGUE = sousCatalogue(MODELES);

const [CAB, CHG, ECO, BAT, COQ] = MODELES;

// L'article sur lequel porte l'enquête. Les quatre autres bougent aussi : il faut trier.
export const CIBLE = ECO;

// Le stock compté au dernier inventaire, il y a sept jours. C'est la base de départ de
// l'élève : les mouvements de la semaine viennent s'y ajouter à l'ouverture.
export const INVENTAIRE = { [CAB]: 30, [CHG]: 30, [ECO]: 24, [BAT]: 10, [COQ]: 40 };
export const JOURS_DEPUIS_INVENTAIRE = 7;

export const VOLUME = { references: 5, documents: 10, mouvements: 19 };

/* ------------------------------------------------------------------ la semaine */

// Les documents de la semaine, dans l'ordre. `j` = jours avant aujourd'hui, `h` = heure.
// Chaque document fait bouger une ou plusieurs références ; c'est lui qu'on retrouve dans la
// colonne « Origine » de l'onglet Mouvements.
const RECEPTIONS = [
  { no: 'REC-26-0412', supId: 'F01', j: 6, h: 9.2, bl: 'BL-KB-88213', lot: 'LOT-KB-2638', transporteur: 'Kabeo, livraison directe',
    lignes: [[CAB, 40, [20, 20]], [CHG, 20, [20]], [BAT, 12, [12]]] },
  { no: 'REC-26-0415', supId: 'F02', j: 5, h: 10, bl: 'BL-SN-40517', lot: 'LOT-SN-2639', transporteur: 'Geodis, tournée 7',
    lignes: [[ECO, 12, [12]]] },
];

const COMMANDES = [
  { no: 'CMD-731402', client: 'C0003', ship: 'COL', j: 6, h: 15.5, lignes: [[ECO, 2], [COQ, 1]] },
  { no: 'CMD-731455', client: 'C0008', ship: 'REL', j: 5, h: 14.3, lignes: [[CAB, 3], [CHG, 1]] },
  { no: 'CMD-731488', client: 'C0012', ship: 'COL', j: 4, h: 11, lignes: [[ECO, 1], [BAT, 2]] },
  { no: 'CMD-731530', client: 'C0005', ship: 'CHR', j: 3, h: 14, lignes: [[ECO, 3], [CAB, 2], [COQ, 2]] },
  { no: 'CMD-731561', client: 'C0015', ship: 'REL', j: 2, h: 10.25, lignes: [[ECO, 2]] },
  { no: 'CMD-731602', client: 'C0019', ship: 'COL', j: 1, h: 13.7, lignes: [[ECO, 1], [BAT, 1], [CHG, 2]] },
];

// Un retour client (le client de CMD-731402 renvoie une paire d'écouteurs neuve, emballage
// intact : elle revient en rayon) et une casse (un boîtier écrasé au quai).
export const RETOUR = { no: 'RET-26-0091', commande: 'CMD-731402', sku: ECO, qty: 1, j: 4, h: 16.75 };
export const CASSE = { no: 'DEM-26-0027', sku: ECO, qty: 1, j: 3, h: 9.5 };

export const TYPES = {
  reception: 'Entrée : réception',
  preparation: 'Sortie : préparation',
  retour: 'Entrée : retour client',
  casse: 'Sortie : casse',
};

/* ------------------------------------------------------------------ outils */

const JOUR = 3600e3 * 24;
const minuit = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const quand = (now, j, h) => minuit(now) - j * JOUR + Math.round(h * 3600e3);
const bp = (cmd) => 'BP-' + cmd.replace('CMD-', '');
const fdate = (t) => new Date(t).toLocaleDateString('fr-FR');
const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function dateInventaire(now = Date.now()) {
  return quand(now, JOURS_DEPUIS_INVENTAIRE, 7);
}

/* ------------------------------------------------------------------ base et volet */

export const EXERCICE = 'Exercice 1 : lire le stock et ses mouvements';

export const ACCUEIL = {
  titre: 'Faire parler le stock, dans l’ordre',
  kpis: ['mail', 'stock'],
  etapes: [
    ['Lire le message de Nadia Ferrand', 'Messagerie. Elle vous dit sur quel article porte l’enquête et ce qu’elle attend dans votre réponse.'],
    ['Trouver le stock actuel', 'Menu Stock (code donné par votre enseignant), ou console : .getstock suivi de la référence.'],
    ['Lister les mouvements de l’article', 'Stock, onglet Mouvements, ou console : .movements suivi de la référence. Chaque ligne a un type et une origine.'],
    ['Relier chaque mouvement à son document', 'Une réception (menu Réceptions), une commande client (menu Commandes), un retour, une casse (Messagerie).'],
    ['Refaire le calcul à l’envers', 'Partez du stock actuel, retirez les entrées, rajoutez les sorties : vous devez retomber sur le stock de l’inventaire.'],
    ['Répondre à Nadia Ferrand', 'Recopiez les six lignes de son message dans votre réponse, complétées.'],
  ],
};

// La base d'un élève qui n'a rien fait : le stock compté au dernier inventaire. La semaine
// arrive par le volet, avec ses mouvements, ses documents et ses messages.
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: { ...INVENTAIRE }, moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [], _depart: [] };
}

const CLIENTS = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));

// Le message de mission. Les six lignes à recopier sont celles que lisent les jalons : on
// n'évalue pas sur une règle cachée.
export const LIGNES_REPONSE = [
  'Stock actuel :',
  'Réception :',
  'Commandes :',
  'Retour :',
  'Casse :',
  'Stock au dernier inventaire :',
];

function mailMission(prenom, now) {
  const inv = fdate(dateInventaire(now));
  // Ordre d'arrivée = ordre de la trame (Bienvenue, consigne, retour, casse). Les deux documents
  // sont datés APRÈS la consigne : Nadia les « a fait suivre ». Le mouvement de stock garde sa
  // vraie date ; seul le mail porte l'heure de sa réception.
  return { folder: 'in', ts: now - 3600e3 * 3, from: `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`,
    fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: 'Écouteurs ECO-BT-01 : racontez-moi la semaine', kind: 'text',
    // Le champ « Répondre » s'ouvre avec les six intitulés déjà écrits : l'élève ne tape que ses réponses.
    amorce: LIGNES_REPONSE.map((l) => `${l} `).join('\n'),
    text: `Bonjour ${prenom},\n\nOn a fait l'inventaire de l'allée A-01 à A-04 le ${inv}. Depuis, le stock des écouteurs sans fil (référence ${ECO}) a beaucoup bougé et je veux comprendre pourquoi avant le prochain comptage.\n\nTout est dans le système. Pour cet article seulement :\n\n1. Relevez son stock actuel.\n2. Listez ses mouvements depuis l'inventaire (Stock, onglet Mouvements, ou console : .movements ${ECO}).\n3. Pour chaque mouvement, retrouvez le document qui l'a provoqué : une réception fournisseur (menu Réceptions), une commande client (menu Commandes : un bon de préparation BP-xxxxxx porte les mêmes chiffres que sa commande CMD-xxxxxx), un retour client ou un constat de casse (je vous les ai fait suivre dans la messagerie).\n4. Refaites le calcul à l'envers : à partir du stock actuel, retrouvez le stock compté le jour de l'inventaire.\n\nRépondez à ce message en recopiant ces six lignes et en les complétant :\n\n${LIGNES_REPONSE[0]} (le nombre d'écouteurs en stock aujourd'hui)\n${LIGNES_REPONSE[1]} (le numéro de la réception REC-… qui a fait entrer des écouteurs, et la quantité entrée)\n${LIGNES_REPONSE[2]} (les numéros CMD-… de toutes les commandes parties avec des écouteurs, et seulement celles-là)\n${LIGNES_REPONSE[3]} (le numéro du document de retour client)\n${LIGNES_REPONSE[4]} (le numéro du constat de casse)\n${LIGNES_REPONSE[5]} (votre calcul, avec le résultat à la fin de la ligne)\n\nUne ligne par information, s'il vous plaît : c'est comme ça que je les relis.\n\nMerci,\n${EQUIPE.cheffe.nom}` };
}

export const VOLET = {
  id: 'mouvements-1',
  semer(prenom, db) {
    const now = Date.now();
    const mouvements = [];
    const receptions = [];
    const orders = [];

    RECEPTIONS.forEach((r) => {
      const ts = quand(now, r.j, r.h);
      const rows = {};
      let n = 0;
      const colis = [];
      r.lignes.forEach(([s, q, cartons]) => {
        rows[s] = { annonce: q, compte: q, etat: 'ok', decision: 'accepte' };
        cartons.forEach((c) => colis.push({ no: ++n, sku: s, qty: c, etat: 'ok' }));
        mouvements.push({ sku: s, type: TYPES.reception, delta: q, ref: r.no, lot: r.lot, ts, by: EQUIPE.quai.nom });
      });
      receptions.push({ no: r.no, supId: r.supId, ts, transporteur: r.transporteur,
        bl: { no: r.bl, date: ts - JOUR, lot: r.lot, lines: r.lignes.map(([s, q]) => ({ sku: s, qty: q })) },
        colis, ctrl: { lot: r.lot, rows, validated: true, at: ts + 3600e3 * 0.5 } });
    });

    COMMANDES.forEach((c) => {
      const ts = quand(now, c.j, c.h);
      const rows = {};
      c.lignes.forEach(([s, q]) => {
        const v = CATALOGUE.VM[s];
        rows[s] = { seen: '', loc: v.loc, qty: q, status: 'ok' };
        mouvements.push({ sku: s, type: TYPES.preparation, delta: -q, ref: bp(c.no), ts, by: 'Équipe préparation' });
      });
      orders.push({ no: c.no, date: ts - 3600e3 * 5, customerId: c.client, ship: c.ship,
        lines: c.lignes.map(([s, q]) => ({ sku: s, qty: q })),
        prep: { rows, doc: true, validated: true, complete: true, at: ts, par: 'Équipe préparation' } });
    });

    const tRetour = quand(now, RETOUR.j, RETOUR.h);
    mouvements.push({ sku: RETOUR.sku, type: TYPES.retour, delta: RETOUR.qty, ref: RETOUR.no, ts: tRetour, by: EQUIPE.retours.nom });
    const tCasse = quand(now, CASSE.j, CASSE.h);
    mouvements.push({ sku: CASSE.sku, type: TYPES.casse, delta: -CASSE.qty, ref: CASSE.no, ts: tCasse, by: EQUIPE.quai.nom });

    // Le stock « après » de chaque mouvement se calcule dans l'ordre où le moteur les reçoit :
    // il faut donc les lui donner dans l'ordre du temps.
    mouvements.sort((a, b) => a.ts - b.ts);

    // Le « vu en stock » du bon de préparation : ce que le préparateur a lu au moment de
    // préparer, c'est-à-dire le stock juste avant sa sortie.
    const courant = { ...((db && db.stock) || INVENTAIRE) };
    mouvements.forEach((m) => {
      if (m.type === TYPES.preparation) {
        const o = orders.find((x) => bp(x.no) === m.ref);
        if (o) o.prep.rows[m.sku].seen = courant[m.sku] || 0;
      }
      courant[m.sku] = (courant[m.sku] || 0) + m.delta;
    });

    const c = CLIENTS[COMMANDES[0].client];
    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    const mails = [
      ...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 26)]),
      { folder: 'in', ts: now - 3600e3 * 2, from: EQUIPE.retours.nom, fromMail: EQUIPE.retours.mail, to: prenom,
        subject: `Retour client ${RETOUR.no} remis en stock`, kind: 'text',
        text: `Bonjour,\n\nRetour client enregistré.\n\nDocument : ${RETOUR.no}\nCommande d'origine : ${RETOUR.commande} (${c.prenom} ${c.nom}, ${c.ville})\nArticle : ${RETOUR.sku}, écouteurs sans fil Bluetooth\nQuantité : ${RETOUR.qty}\nMotif du client : « ne me convient pas »\nContrôle : emballage d'origine intact, article neuf\nDécision : remis en stock à l'emplacement ${CATALOGUE.VM[RETOUR.sku].loc}\n\nService retours, Cestas` },
      { folder: 'in', ts: now - 3600e3 * 1, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Constat de casse ${CASSE.no}`, kind: 'text',
        text: `Bonjour,\n\nConstat de casse.\n\nDocument : ${CASSE.no}\nArticle : ${CASSE.sku}, écouteurs sans fil Bluetooth\nQuantité : ${CASSE.qty}\nCirconstance : un carton est tombé du chariot en allée A-02 ; un boîtier d'écouteurs est écrasé, invendable.\nDécision : sorti du stock et mis au rebut.\n\n${EQUIPE.quai.nom}` },
      mailMission(prenom, now),
    ];

    return { receptions, orders, mouvements, mails };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Cinq jalons, sur le modèle de la traçabilité Spartoo (ENT-1.3) : ils lisent la réponse de
 * l'élève à Nadia Ferrand, et retiennent son meilleur essai. Aucun retour n'est donné à
 * l'élève pendant l'exercice.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente aucune réponse envoyée
 *   na      l'élève n'en est pas encore là (la semaine n'est pas semée)
 *
 * **Rien n'est écrit en dur** : le stock actuel, la réception, les commandes, le retour, la
 * casse et le stock d'inventaire se déduisent des mouvements de la base de l'élève.
 *
 * Lecture d'une ligne : on prend la DERNIÈRE ligne de la réponse qui porte l'intitulé (un
 * élève qui se corrige en bas de message est lu sur sa correction), on en retire les
 * références (ECO-BT-01, REC-26-0415…) et les dates, et on lit les nombres qui restent.
 * Pour un résultat, c'est le DERNIER nombre de la ligne qui compte : « 27 − 12 − 1 + 10 = 24 »
 * se lit 24, et le calcul reste visible pour l'enseignant.
 */

const stockDe = (db, s) => (db.stock && db.stock[s] != null ? db.stock[s] : 0);
const mouvementsCible = (db) => (db.moves || []).filter((m) => m.sku === CIBLE);

function reponses(db) {
  return (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(EQUIPE.cheffe.mail))
    .sort((a, b) => a.ts - b.ts);
}

function meilleur(mails, juger) {
  const evals = mails.map(juger);
  return evals.find((e) => e.ok) || evals[evals.length - 1];
}

// La dernière ligne qui porte l'intitulé (comparaison sans accents ni majuscules).
export function ligne(texte, intitule) {
  const cle = nrm(intitule).replace(/\s*:$/, '');
  const l = String(texte || '').split(/\r?\n/).filter((x) => nrm(x).includes(cle));
  return l.length ? l[l.length - 1] : null;
}

// Les nombres d'une ligne, une fois retirés les références et les dates.
export function nombres(l) {
  const propre = String(l || '')
    .replace(/\b[A-Z]{2,}[A-Z0-9]*(?:-[A-Z0-9]+)+\b/gi, ' ')
    .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, ' ');
  return (propre.match(/\d+/g) || []).map((x) => parseInt(x, 10));
}

const envoye = (msg) => `Réponse envoyée le ${new Date(msg.ts).toLocaleString('fr-FR')}.\n`;

export const ETAPES = [
  {
    id: 'actuel',
    titre: 'Stock actuel des écouteurs relevé',
    verifier(db) {
      if (!mouvementsCible(db).length) return { status: 'na' };
      const mails = reponses(db);
      if (!mails.length) return { status: 'attente' };
      const attendu = stockDe(db, CIBLE);
      const best = meilleur(mails, (msg) => {
        const l = ligne(msg.text, LIGNES_REPONSE[0]);
        const n = nombres(l);
        const lu = n.length ? n[n.length - 1] : null;
        return { ok: lu === attendu, ts: msg.ts,
          detail: envoye(msg) + (l === null ? 'Ligne « Stock actuel » absente.'
            : `Lu : ${lu === null ? '(aucun nombre)' : lu} — attendu ${attendu}.`) };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
  {
    id: 'reception',
    titre: 'Réception des écouteurs retrouvée (numéro et quantité)',
    verifier(db) {
      const entrees = mouvementsCible(db).filter((m) => m.type === TYPES.reception);
      if (!entrees.length) return { status: 'na' };
      const mails = reponses(db);
      if (!mails.length) return { status: 'attente' };
      const recs = [...new Set(entrees.map((m) => m.ref))];
      const qte = entrees.reduce((n, m) => n + m.delta, 0);
      // Les autres réceptions de la semaine n'ont pas fait entrer d'écouteurs : les citer,
      // c'est ne pas avoir lu la colonne « Réf. ».
      const autres = [...new Set((db.moves || []).filter((m) => m.type === TYPES.reception && !recs.includes(m.ref)).map((m) => m.ref))];
      const best = meilleur(mails, (msg) => {
        const l = ligne(msg.text, LIGNES_REPONSE[1]);
        const L = String(l || '').toUpperCase();
        const cites = recs.filter((r) => L.includes(r));
        const intrus = autres.filter((r) => L.includes(r));
        const aQte = nombres(l).includes(qte);
        const ok = l !== null && cites.length === recs.length && !intrus.length && aQte;
        return { ok, ts: msg.ts,
          detail: envoye(msg) + (l === null ? 'Ligne « Réception » absente.'
            : `Réception ${recs.join(', ')} : ${cites.length === recs.length ? 'citée' : 'absente'}`
              + (intrus.length ? ` ; cite aussi ${intrus.join(', ')}, qui n'a pas fait entrer d'écouteurs` : '')
              + `\nQuantité entrée ${qte} : ${aQte ? 'présente' : 'absente'}`) };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
  {
    id: 'commandes',
    titre: 'Commandes parties avec des écouteurs citées, et seulement elles',
    verifier(db) {
      const sorties = mouvementsCible(db).filter((m) => m.type === TYPES.preparation);
      if (!sorties.length) return { status: 'na' };
      const mails = reponses(db);
      if (!mails.length) return { status: 'attente' };
      const cmds = [...new Set(sorties.map((m) => 'CMD-' + m.ref.replace('BP-', '')))];
      const toutes = (db.orders || []).map((o) => o.no);
      const best = meilleur(mails, (msg) => {
        const t = String(msg.text || '').toUpperCase();
        const manquent = cmds.filter((c) => !t.includes(c));
        const intrus = toutes.filter((c) => !cmds.includes(c) && t.includes(c));
        return { ok: !manquent.length && !intrus.length, ts: msg.ts,
          detail: envoye(msg) + `${cmds.length - manquent.length} commande(s) citée(s) sur ${cmds.length}.`
            + (manquent.length ? `\nManque : ${manquent.join(', ')}` : '')
            + (intrus.length ? `\nCitée(s) à tort (sans écouteurs) : ${intrus.join(', ')}` : '') };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
  {
    id: 'retour-casse',
    titre: 'Retour client et casse identifiés',
    verifier(db) {
      const mv = mouvementsCible(db);
      const ret = [...new Set(mv.filter((m) => m.type === TYPES.retour).map((m) => m.ref))];
      const cas = [...new Set(mv.filter((m) => m.type === TYPES.casse).map((m) => m.ref))];
      if (!ret.length && !cas.length) return { status: 'na' };
      const mails = reponses(db);
      if (!mails.length) return { status: 'attente' };
      const best = meilleur(mails, (msg) => {
        const lr = String(ligne(msg.text, LIGNES_REPONSE[3]) || '').toUpperCase();
        const lc = String(ligne(msg.text, LIGNES_REPONSE[4]) || '').toUpperCase();
        const okR = ret.every((r) => lr.includes(r)), okC = cas.every((r) => lc.includes(r));
        return { ok: okR && okC, ts: msg.ts,
          detail: envoye(msg) + `Retour ${ret.join(', ')} : ${okR ? 'trouvé' : 'absent de la ligne « Retour »'}\n`
            + `Casse ${cas.join(', ')} : ${okC ? 'trouvée' : 'absente de la ligne « Casse »'}` };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
  {
    id: 'inventaire',
    titre: 'Stock du dernier inventaire recalculé à partir des mouvements',
    verifier(db) {
      const mv = mouvementsCible(db);
      if (!mv.length) return { status: 'na' };
      const mails = reponses(db);
      if (!mails.length) return { status: 'attente' };
      // Le stock du jour de l'inventaire : aujourd'hui, moins tout ce qui a bougé depuis.
      const attendu = stockDe(db, CIBLE) - mv.reduce((n, m) => n + m.delta, 0);
      const best = meilleur(mails, (msg) => {
        const l = ligne(msg.text, LIGNES_REPONSE[5]);
        const n = nombres(l);
        const lu = n.length ? n[n.length - 1] : null;
        return { ok: lu === attendu, ts: msg.ts,
          detail: envoye(msg) + (l === null ? 'Ligne « Stock au dernier inventaire » absente.'
            : `Lu en fin de ligne : ${lu === null ? '(aucun nombre)' : lu} — attendu ${attendu}.\nLigne : ${l.trim()}`) };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
];
