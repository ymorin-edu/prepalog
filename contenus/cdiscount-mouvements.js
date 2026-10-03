// Cdiscount — ENT-2.1 « Le stock raconte ». Guidage, C1.6.
//
// Première séance de l'environnement Cdiscount. L'élève ne touche pas au stock : il le LIT.
// Recadrée le 03/10/2026 (brief `docs/briefs/ENT-2.1-recadrage.md`) : ce matin, la commande
// CMD-731602 d'une cliente a été annulée — le site affichait les écouteurs en stock, le
// préparateur a trouvé l'emplacement vide. L'élève relie chaque mouvement de la semaine à son
// document (réception, bon de préparation, retour, constat de casse), refait le calcul à l'envers
// (stock d'aujourd'hui → stock du jour de l'inventaire), puis compare chaque document à son
// mouvement : le constat de casse DEM-26-0027 dit 2 boîtiers écrasés, le terminal n'en a sorti
// qu'un. Le stock réel est donc d'un écouteur en dessous du stock système, qui dit encore 1.
//
// Ce que la séance installe, et que les suivantes supposent :
//   - un mouvement de stock a toujours un DOCUMENT d'origine ;
//   - le stock d'aujourd'hui = stock de l'inventaire + entrées − sorties ;
//   - toutes les sorties ne sont pas des ventes (casse), toutes les entrées ne sont pas des
//     achats (retour client) ;
//   - un document et son mouvement peuvent ne pas dire la même chose : c'est là que le stock
//     du système décroche du stock réel (et que le site vend ce qu'on n'a plus).
//
// Deux stocks se suivent dans le volet : le stock SYSTÈME (les mouvements) et le stock RÉEL (le
// même, où la casse compte pour `CASSE.constatee`). Le « Stock trouvé » des bons de préparation
// est lu sur le stock réel : c'est ce que le préparateur a vu dans le rayon.
//
// Niveau de l'élève (`db.aisance`, figé par le moteur à la première ouverture, jamais montré) :
// un confirmé a trois documents de plus sur les écouteurs (`EN_PLUS_CONFIRME`), de somme nulle.
// Stock actuel, stock d'inventaire et casse ne changent pas ; les jalons relisent tout dans la base.
//
// Volume (règle de `claude/prepalog-montee-en-competences.md`, guidage = peu d'opérations) :
// 5 références, 12 documents, 20 mouvements (confirmé : 15 et 23). Déclaré dans `VOLUME`, repris
// dans le `meta`. La commande annulée n'a fait bouger aucun stock : elle n'y compte pas.
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`) : la cliente, sa commande, sa
// réclamation, les quantités, l'équipe. Le lien « stock du logiciel = disponibilité affichée sur
// le site » est la logique générale du commerce en ligne, pas un fait publié par Cdiscount.
//
// Messages en cours de séance (option B, brief `docs/briefs/MOTEUR-messages-en-cours-de-seance.md`).
// À l'ouverture : Bienvenue et mission de Nadia. Le retour client et le constat de casse arrivent
// quand l'élève a envoyé à Nadia un premier compte rendu « Stock actuel : … », juste ou faux
// (`apresMail`, `core/declencheurs.js`). Le mot de clôture de Nadia arrive quand la ligne « Ce qui
// cloche » a été envoyée remplie, juste ou fausse.

import { CUSTOMERS, EQUIPE, mailBienvenue, sousCatalogue } from './cdiscount.js';
import { apresMail, ligne, nombres, nrm } from '../core/declencheurs.js';

// Lues aussi par ENT-2.4 (`cdiscount-regularise.js`), qui les importe d'ici.
export { ligne, nombres };

/* ------------------------------------------------------------------ périmètre */

// Les cinq références de l'allée : celles de la zone A que l'élève retrouvera en ENT-2.3.
export const MODELES = ['CAB-USBC-1M', 'CHG-20W', 'ECO-BT-01', 'BAT-10K', 'COQ-UNI-01'];
export const CATALOGUE = sousCatalogue(MODELES);

const [CAB, CHG, ECO, BAT, COQ] = MODELES;

// L'article sur lequel porte l'enquête. Les quatre autres bougent aussi : il faut trier.
export const CIBLE = ECO;

// Le stock compté au dernier inventaire, il y a sept jours. C'est la base de départ de
// l'élève : les mouvements de la semaine viennent s'y ajouter à l'ouverture. Les écouteurs
// étaient bas (4) : c'est ce qui a fait venir la réception du lendemain.
export const INVENTAIRE = { [CAB]: 30, [CHG]: 30, [ECO]: 4, [BAT]: 10, [COQ]: 40 };
export const JOURS_DEPUIS_INVENTAIRE = 7;

export const VOLUME = { references: 5, documents: 12, mouvements: 20 };

/* ------------------------------------------------------------------ la semaine */

// Les documents de la semaine, dans l'ordre. `j` = jours avant aujourd'hui, `h` = heure.
// Chaque document fait bouger une ou plusieurs références ; c'est lui qu'on retrouve dans la
// colonne « Origine » de l'onglet Mouvements.
const RECEPTIONS = [
  { no: 'REC-26-0412', supId: 'F01', j: 6, h: 9.2, bl: 'BL-KB-88213', lot: 'LOT-KB-2638', transporteur: 'Kabeo, livraison directe',
    lignes: [[CAB, 40, [20, 20]], [CHG, 20, [20]], [BAT, 12, [12]]] },
  { no: 'REC-26-0415', supId: 'F02', j: 5, h: 10, bl: 'BL-SN-40517', lot: 'LOT-SN-2639', transporteur: 'Geodis, tournée 7',
    lignes: [[ECO, 10, [10]]] },
];

const COMMANDES = [
  { no: 'CMD-731402', client: 'C0003', ship: 'COL', j: 6, h: 15.5, lignes: [[ECO, 2], [COQ, 1]] },
  { no: 'CMD-731455', client: 'C0008', ship: 'REL', j: 5, h: 14.3, lignes: [[CAB, 3], [CHG, 1]] },
  { no: 'CMD-731488', client: 'C0012', ship: 'COL', j: 4, h: 11, lignes: [[ECO, 1], [BAT, 2]] },
  { no: 'CMD-731530', client: 'C0005', ship: 'CHR', j: 3, h: 14, lignes: [[ECO, 3], [CAB, 2], [COQ, 2]] },
  { no: 'CMD-731545', client: 'C0010', ship: 'REL', j: 3, h: 16.4, lignes: [[BAT, 1], [COQ, 2]] },
  { no: 'CMD-731561', client: 'C0015', ship: 'REL', j: 2, h: 10.25, lignes: [[ECO, 3]] },
  { no: 'CMD-731578', client: 'C0007', ship: 'COL', j: 1, h: 9.6, lignes: [[ECO, 2]] },
  { no: 'CMD-731590', client: 'C0014', ship: 'CHR', j: 1, h: 15.2, lignes: [[ECO, 2]] },
];

// Confirmé (`db.aisance === 'confirme'`) : trois documents de plus sur les écouteurs, de somme
// nulle (+6 − 3 − 3). Le stock ne passe jamais sous zéro (4 + 6 = 10, puis 7 avant CMD-731402).
const EN_PLUS_CONFIRME = {
  receptions: [
    { no: 'REC-26-0409', supId: 'F02', j: 7, h: 14, bl: 'BL-SN-40488', lot: 'LOT-SN-2637', transporteur: 'Geodis, tournée 7',
      lignes: [[ECO, 6, [6]]] },
  ],
  commandes: [
    { no: 'CMD-731420', client: 'C0001', ship: 'COL', j: 6, h: 11, lignes: [[ECO, 3]] },
    { no: 'CMD-731515', client: 'C0017', ship: 'REL', j: 4, h: 13.5, lignes: [[ECO, 3]] },
  ],
};

// La commande de la cliente, ce matin : une paire d'écouteurs, emplacement vide à la
// préparation → annulée (`annulee`, brief MOTEUR-statut-annulee). AUCUN mouvement de stock : la
// citer parmi les commandes « parties avec des écouteurs », c'est ne pas avoir lu les mouvements.
export const ANNULEE = { no: 'CMD-731602', client: 'C0019', ship: 'COL', j: 0, h: 7.4, lignes: [[ECO, 1]],
  motif: 'Rupture : emplacement A-02-1 vide à la préparation' };
export const RECLAMATION = "J'ai commandé des écouteurs affichés en stock sur le site, et ce matin on m'annonce que ma commande est annulée. C'était pour un cadeau. Ce n'est pas sérieux.";

// Un retour client (le client de CMD-731402 renvoie une paire d'écouteurs neuve, emballage
// intact : elle revient en rayon — il est JUSTE, c'est la fausse piste) et une casse : le
// constat dit 2 boîtiers écrasés (`constatee`), le terminal n'en a sorti qu'un (`qty`). C'est
// l'erreur que l'élève doit trouver.
export const RETOUR = { no: 'RET-26-0091', commande: 'CMD-731402', sku: ECO, qty: 1, j: 4, h: 16.75 };
export const CASSE = { no: 'DEM-26-0027', sku: ECO, qty: 1, constatee: 2, j: 3, h: 9.5 };

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

export function dateInventaire(now = Date.now()) {
  return quand(now, JOURS_DEPUIS_INVENTAIRE, 7);
}

/* ------------------------------------------------------------------ base et volet */

export const EXERCICE = 'Exercice 1 : lire le stock et ses mouvements';

export const ACCUEIL = {
  titre: 'Faire parler le stock, dans l’ordre',
  kpis: ['mail', 'stock'],
  etapes: [
    ['Lire le message de Nadia Ferrand', 'Messagerie. Elle vous dit ce qui s’est passé ce matin, sur quel article porte l’enquête et ce qu’elle attend dans votre réponse.'],
    ['Trouver le stock actuel', 'Menu Stock (code donné par votre enseignant), ou console : .getstock suivi de la référence.'],
    ['Envoyer le stock actuel à Nadia Ferrand', 'Messagerie : Répondre à son message, compléter la première ligne, Envoyer. La suite arrive ensuite dans la messagerie.'],
    ['Lister les mouvements de l’article', 'Stock, onglet Mouvements, ou console : .movements suivi de la référence. Chaque ligne a un type et une origine.'],
    ['Relier chaque mouvement à son document', 'Une réception (menu Réceptions), une commande client (menu Commandes), un retour, une casse (Messagerie).'],
    ['Refaire le calcul à l’envers', 'Partez du stock actuel, retirez les entrées, rajoutez les sorties : vous devez retomber sur le stock de l’inventaire.'],
    ['Comparer chaque document à son mouvement', 'La quantité écrite sur le document est-elle celle qui est entrée ou sortie du stock ?'],
    ['Répondre à Nadia Ferrand', 'Recopiez les sept lignes de son message dans votre réponse, complétées.'],
  ],
};

// La base d'un élève qui n'a rien fait : le stock compté au dernier inventaire. La semaine
// arrive par le volet, avec ses mouvements, ses documents et ses messages.
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: { ...INVENTAIRE }, moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [], _depart: [] };
}

const CLIENTS = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));
const cliente = () => `Mme ${CLIENTS[ANNULEE.client].nom}`;

// Le message de mission. Les sept lignes à recopier sont celles que lisent les jalons : on
// n'évalue pas sur une règle cachée.
export const LIGNES_REPONSE = [
  'Stock actuel :',
  'Réception :',
  'Commandes :',
  'Retour :',
  'Casse :',
  'Stock au dernier inventaire :',
  'Ce qui cloche :',
];

function mailMission(prenom, now) {
  const inv = fdate(dateInventaire(now));
  // À l'ouverture, la consigne arrive après la Bienvenue. Elle demande DEUX envois : d'abord le stock
  // actuel seul, ce qui fait écrire le service retours et le quai (le déclencheur du volet), puis la
  // réponse complète en sept lignes (texte B choisi par Tristan le 03/10/2026, recadré le même jour :
  // la réclamation de la cliente, « avant le Black Friday » sans délai chiffré, cinquième tâche).
  return { folder: 'in', ts: now - 3600e3 * 2, from: `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`,
    fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: `Écouteurs ${ECO} : commande annulée, racontez-moi la semaine`, kind: 'text',
    // Le champ « Répondre » s'ouvre avec les sept intitulés déjà écrits : l'élève ne tape que ses réponses.
    amorce: LIGNES_REPONSE.map((l) => `${l} `).join('\n'),
    text: `Bonjour ${prenom},\n\nCe matin, la commande ${ANNULEE.no} de ${cliente()} a été annulée. Elle avait commandé une paire d'écouteurs sans fil (référence ${ECO}), affichés en stock sur le site. Au moment de préparer, le préparateur a trouvé l'emplacement ${CATALOGUE.VM[ECO].loc} vide.\n\nVoici ce qu'elle nous a écrit : « ${RECLAMATION} »\n\nLe système, lui, dit encore qu'il en reste un. Tant qu'il le dit, le site continue de vendre des écouteurs que nous n'avons pas. Avant le Black Friday, je veux savoir où le système s'est trompé.\n\nOn a fait l'inventaire de l'allée A-01 à A-04 le ${inv}. Tout ce qui s'est passé depuis est dans le système. Pour cet article seulement :\n\n1. Relevez son stock actuel.\n2. Listez ses mouvements depuis l'inventaire (Stock, onglet Mouvements, ou console : .movements ${ECO}).\n3. Pour chaque mouvement, retrouvez le document qui l'a provoqué : une réception fournisseur (menu Réceptions), une commande client (menu Commandes : un bon de préparation BP-xxxxxx porte les mêmes chiffres que sa commande CMD-xxxxxx), un retour client ou un constat de casse (ils vous écriront dans la messagerie).\n4. Refaites le calcul à l'envers : à partir du stock actuel, retrouvez le stock compté le jour de l'inventaire.\n5. Comparez chaque document à son mouvement : la quantité écrite sur le document est-elle celle qui est entrée ou sortie du stock ?\n\nOn procède en deux temps.\n\nD'abord, relevez le stock actuel et envoyez-le-moi tout de suite, sur une seule ligne : ${LIGNES_REPONSE[0]} … Je préviens alors le service retours et le quai, qui vous écriront.\n\nEnsuite, quand vous aurez tout retrouvé, renvoyez-moi la réponse complète en recopiant ces sept lignes :\n\n${LIGNES_REPONSE[0]} (le nombre d'écouteurs en stock aujourd'hui)\n${LIGNES_REPONSE[1]} (les numéros des réceptions REC-… qui ont fait entrer des écouteurs, et la quantité entrée)\n${LIGNES_REPONSE[2]} (les numéros CMD-… de toutes les commandes parties avec des écouteurs, et seulement celles-là)\n${LIGNES_REPONSE[3]} (le numéro du document de retour client)\n${LIGNES_REPONSE[4]} (le numéro du constat de casse)\n${LIGNES_REPONSE[5]} (votre calcul, avec le résultat à la fin de la ligne)\n${LIGNES_REPONSE[6]} (le document dont la quantité ne correspond pas à son mouvement, et l'écart à la fin de la ligne)\n\nUne ligne par information, s'il vous plaît : c'est comme ça que je les relis.\n\nMerci,\n${EQUIPE.cheffe.nom}` };
}

// Vrai dès qu'une réponse envoyée à Nadia porte la ligne « Ce qui cloche » REMPLIE (un mot suffit,
// juste ou faux : l'arrivée du mot de clôture ne doit rien révéler). L'amorce telle quelle, non.
// Condition propre à la séance : `apresMail` exige un nombre, et une réponse « DEM-26-0027 » seule
// n'en a pas une fois la référence retirée.
function apresCeQuiCloche(db) {
  return (db.mails || []).some((m) => {
    if (m.folder !== 'out' || nrm(m.toMail) !== nrm(EQUIPE.cheffe.mail)) return false;
    const l = ligne(m.text, LIGNES_REPONSE[6]);
    if (l === null) return false;
    const apres = l.includes(':') ? l.slice(l.indexOf(':') + 1) : l.replace(/^\s*ce qui cloche/i, '');
    return apres.trim() !== '';
  });
}

export const VOLET = {
  id: 'mouvements-1',
  semer(prenom, db) {
    const now = Date.now();
    const confirme = !!db && db.aisance === 'confirme';
    const mouvements = [];
    const receptions = [];
    const orders = [];

    [...RECEPTIONS, ...(confirme ? EN_PLUS_CONFIRME.receptions : [])].forEach((r) => {
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
    receptions.sort((a, b) => a.ts - b.ts);

    [...COMMANDES, ...(confirme ? EN_PLUS_CONFIRME.commandes : [])].forEach((c) => {
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

    // Le « Stock trouvé » du bon de préparation : ce que le préparateur a vu dans le rayon juste
    // avant sa sortie, c'est-à-dire le stock RÉEL — celui où la casse compte pour ce que dit le
    // constat (2), pas pour ce qui a été saisi (1). Il décroche du système à partir de la casse.
    const reel = { ...((db && db.stock) || INVENTAIRE) };
    mouvements.forEach((m) => {
      if (m.type === TYPES.preparation) {
        const o = orders.find((x) => bp(x.no) === m.ref);
        if (o) o.prep.rows[m.sku].seen = reel[m.sku] || 0;
      }
      const delta = m.ref === CASSE.no ? -CASSE.constatee : m.delta;
      reel[m.sku] = (reel[m.sku] || 0) + delta;
    });
    orders.sort((a, b) => a.prep.at - b.prep.at);

    // La commande de la cliente, ce matin : passée la veille au soir, annulée à la préparation.
    // Son bon reste lisible, figé : stock trouvé 0 (le stock réel), ligne « Rupture », rien de sorti.
    // L'annulation est datée de ce matin, mais jamais dans le futur (séance ouverte très tôt).
    const tAnnul = Math.min(quand(now, ANNULEE.j, ANNULEE.h), now - 3600e3 * 0.25);
    const rowsAnnul = {};
    ANNULEE.lignes.forEach(([s]) => {
      rowsAnnul[s] = { seen: Math.max(0, reel[s] || 0), loc: CATALOGUE.VM[s].loc, qty: 0, status: 'crit' };
    });
    orders.push({ no: ANNULEE.no, date: quand(now, 1, 20.6), customerId: ANNULEE.client, ship: ANNULEE.ship,
      lines: ANNULEE.lignes.map(([s, q]) => ({ sku: s, qty: q })),
      prep: { rows: rowsAnnul, doc: true, validated: true, complete: false, at: tAnnul - 3600e3 * 0.1, par: 'Équipe préparation' },
      annulee: { motif: ANNULEE.motif, at: tAnnul } });

    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    // Le retour client et la casse n'arrivent PAS ici : voir `declencheurs` ci-dessous.
    const mails = [
      ...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 26)]),
      mailMission(prenom, now),
    ];

    return { receptions, orders, mouvements, mails };
  },
  // Le retour client et le constat de casse arrivent quand l'élève a envoyé à Nadia une ligne
  // « Stock actuel : » avec un nombre, JUSTE OU FAUX : l'arrivée ne doit rien révéler (alerte 28),
  // et l'amorce envoyée telle quelle (sans nombre) ne déclenche rien. Aucun jalon n'en dépend.
  // Leurs mouvements de stock sont posés à l'ouverture avec leur vraie date ; seuls les mails
  // portent l'heure d'arrivée. Garde par l'objet : une base qui a déjà ces mails (reprise d'avant
  // l'option B) ne les reçoit pas en double.
  declencheurs: [{
    id: 'documents',
    quand: apresMail({ a: EQUIPE.cheffe.mail, ligne: LIGNES_REPONSE[0], nombre: true }),
    semer(prenom, db) {
      const now = Date.now();
      const deja = (re) => ((db && db.mails) || []).some((m) => re.test(m.subject || ''));
      const c = CLIENTS[COMMANDES[0].client];
      const loc = CATALOGUE.VM[CASSE.sku].loc;
      const mails = [];
      if (!deja(/^Retour client RET-/)) mails.push({ folder: 'in', ts: now + 1000, from: EQUIPE.retours.nom, fromMail: EQUIPE.retours.mail, to: prenom,
        subject: `Retour client ${RETOUR.no} remis en stock`, kind: 'text',
        text: `Bonjour,\n\nRetour client enregistré.\n\nDocument : ${RETOUR.no}\nCommande d'origine : ${RETOUR.commande} (${c.prenom} ${c.nom}, ${c.ville})\nArticle : ${RETOUR.sku}, écouteurs sans fil Bluetooth\nQuantité : ${RETOUR.qty}\nMotif du client : « ne me convient pas »\nContrôle : emballage d'origine intact, article neuf\nDécision : remis en stock à l'emplacement ${CATALOGUE.VM[RETOUR.sku].loc}\n\nService retours, Cestas` });
      // Le constat dit ce qui s'est passé dans l'allée (2 boîtiers) ; le terminal n'en a sorti
      // qu'un (le mouvement). « Saisi sur le terminal » : l'élève doit aller comparer, rien ne
      // lui dit que la saisie est fausse.
      if (!deja(/^Constat de casse DEM-/)) mails.push({ folder: 'in', ts: now + 2000, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Constat de casse ${CASSE.no}`, kind: 'text',
        text: `Bonjour,\n\nConstat de casse.\n\nDocument : ${CASSE.no}\nArticle : ${CASSE.sku}, écouteurs sans fil Bluetooth\nQuantité : ${CASSE.constatee}\nCirconstance : un carton est tombé du chariot en allée ${loc.slice(0, 4)} ; deux boîtiers d'écouteurs sont écrasés, invendables.\nDécision : sortis du stock et mis au rebut. Saisi sur le terminal.\n\n${EQUIPE.quai.nom}` });
      return { mails };
    },
  }, {
    // Le mot de clôture de Nadia : NEUTRE (alerte 28), il arrive que « Ce qui cloche » soit juste ou
    // faux. Il annonce la séance suivante (toute l'allée). Aucun jalon n'en dépend.
    id: 'cloture',
    quand: apresCeQuiCloche,
    semer(prenom, db) {
      if (((db && db.mails) || []).some((m) => m.folder === 'in' && /^Votre enquête sur les écouteurs/.test(m.subject || ''))) return { mails: [] };
      return { mails: [{ folder: 'in', ts: Date.now() + 1000, from: `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`,
        fromMail: EQUIPE.cheffe.mail, to: prenom, subject: 'Votre enquête sur les écouteurs', kind: 'text',
        text: `Bonjour ${prenom},\n\nMerci, je relis. Une erreur sur un article, il y en a peut-être d'autres : la prochaine fois, on regarde toute l'allée.\n\n${EQUIPE.cheffe.nom}` }] };
    },
  }],
};

/* ============================ Suivi de l'exercice ============================
 * Six jalons, sur le modèle de la traçabilité Spartoo (ENT-1.3) : ils lisent la réponse de
 * l'élève à Nadia Ferrand, et retiennent son meilleur essai. Aucun retour n'est donné à
 * l'élève pendant l'exercice.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente aucune réponse envoyée
 *   na      l'élève n'en est pas encore là (la semaine n'est pas semée)
 *
 * **Rien n'est écrit en dur** : le stock actuel, les réceptions, les commandes, le retour, la
 * casse, le stock d'inventaire et l'écart de la casse se déduisent de la base de l'élève (seule
 * la quantité CONSTATÉE vient de `CASSE.constatee` : elle n'existe que sur le papier).
 *
 * Lecture d'une ligne : on prend la DERNIÈRE ligne de la réponse qui porte l'intitulé (un
 * élève qui se corrige en bas de message est lu sur sa correction), on en retire les
 * références (ECO-BT-01, REC-26-0415…) et les dates, et on lit les nombres qui restent.
 * Pour un résultat, c'est le DERNIER nombre de la ligne qui compte : « 1 − 11 + 14 = 4 »
 * se lit 4, et le calcul reste visible pour l'enseignant.
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

// `ligne()` et `nombres()` : `core/declencheurs.js` (partagées avec le déclencheur du volet).

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
    titre: 'Réceptions des écouteurs retrouvées (numéros et quantité)',
    verifier(db) {
      const entrees = mouvementsCible(db).filter((m) => m.type === TYPES.reception);
      if (!entrees.length) return { status: 'na' };
      const mails = reponses(db);
      if (!mails.length) return { status: 'attente' };
      const recs = [...new Set(entrees.map((m) => m.ref))];
      const qte = entrees.reduce((n, m) => n + m.delta, 0);
      const parRec = Object.fromEntries(recs.map((r) => [r, entrees.filter((m) => m.ref === r).reduce((n, m) => n + m.delta, 0)]));
      // Les autres réceptions de la semaine n'ont pas fait entrer d'écouteurs : les citer,
      // c'est ne pas avoir lu la colonne « Réf. ».
      const autres = [...new Set((db.moves || []).filter((m) => m.type === TYPES.reception && !recs.includes(m.ref)).map((m) => m.ref))];
      const best = meilleur(mails, (msg) => {
        const l = ligne(msg.text, LIGNES_REPONSE[1]);
        const L = String(l || '').toUpperCase();
        const cites = recs.filter((r) => L.includes(r));
        const intrus = autres.filter((r) => L.includes(r));
        const n = nombres(l);
        // La quantité : le total, ou (plusieurs réceptions) la quantité de chacune.
        const aQte = n.includes(qte) || recs.every((r) => n.includes(parRec[r]));
        const ok = l !== null && cites.length === recs.length && !intrus.length && aQte;
        return { ok, ts: msg.ts,
          detail: envoye(msg) + (l === null ? 'Ligne « Réception » absente.'
            : `Réception(s) ${recs.join(', ')} : ${cites.length} citée(s) sur ${recs.length}`
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
      const annulees = (db.orders || []).filter((o) => o.annulee).map((o) => o.no);
      // Lue sur la ligne « Commandes » seulement (recadrage du 03/10/2026) : la ligne « Ce qui
      // cloche » peut parler d'une commande, la faute s'y paie (jalon 6), pas une seconde fois ici.
      const best = meilleur(mails, (msg) => {
        const l = ligne(msg.text, LIGNES_REPONSE[2]);
        const t = String(l || '').toUpperCase();
        const manquent = cmds.filter((c) => !t.includes(c));
        const intrus = toutes.filter((c) => !cmds.includes(c) && t.includes(c));
        const intrusAnnulees = intrus.filter((c) => annulees.includes(c));
        const intrusAutres = intrus.filter((c) => !annulees.includes(c));
        return { ok: l !== null && !manquent.length && !intrus.length, ts: msg.ts,
          detail: envoye(msg) + (l === null ? 'Ligne « Commandes » absente.'
            : `${cmds.length - manquent.length} commande(s) citée(s) sur ${cmds.length}.`
              + (manquent.length ? `\nManque : ${manquent.join(', ')}` : '')
              + (intrusAutres.length ? `\nCitée(s) à tort (sans écouteurs) : ${intrusAutres.join(', ')}` : '')
              + (intrusAnnulees.length ? `\nCitée à tort : ${intrusAnnulees.join(', ')}, commande annulée : elle n'a fait bouger aucun stock` : '')) };
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
  {
    id: 'erreur',
    titre: 'Erreur trouvée : le document qui ne correspond pas à son mouvement, et l’écart',
    verifier(db) {
      // La saisie se lit dans les mouvements de la base ; le constat, sur le papier (`CASSE.constatee`).
      const saisis = mouvementsCible(db).filter((m) => m.ref === CASSE.no);
      if (!saisis.length) return { status: 'na' };
      const mails = reponses(db);
      if (!mails.length) return { status: 'attente' };
      const saisie = -saisis.reduce((n, m) => n + m.delta, 0);
      const ecart = CASSE.constatee - saisie;
      // Tous les autres documents de la base : les citer, c'est accuser un document juste (le
      // retour client est la fausse piste naturelle).
      const autres = [...new Set([
        ...(db.moves || []).map((m) => m.ref),
        ...(db.moves || []).filter((m) => /^BP-/.test(m.ref || '')).map((m) => 'CMD-' + m.ref.replace('BP-', '')),
        ...(db.orders || []).map((o) => o.no),
        ...(db.receptions || []).map((r) => r.no),
      ])].filter((r) => r && r !== CASSE.no);
      const best = meilleur(mails, (msg) => {
        const l = ligne(msg.text, LIGNES_REPONSE[6]);
        const L = String(l || '').toUpperCase();
        const cite = L.includes(CASSE.no);
        const intrus = autres.filter((r) => L.includes(r));
        const n = nombres(l);
        const lu = n.length ? n[n.length - 1] : null;
        return { ok: l !== null && cite && !intrus.length && lu === ecart, ts: msg.ts,
          detail: envoye(msg) + (l === null ? 'Ligne « Ce qui cloche » absente.'
            : `Document ${CASSE.no} : ${cite ? 'cité' : 'absent'}`
              + (intrus.length ? ` ; cite aussi ${intrus.join(', ')}, qui n'est pas le document en cause` : '')
              + `\nÉcart lu en fin de ligne : ${lu === null ? '(aucun nombre)' : lu} — attendu ${ecart} (constat ${CASSE.constatee}, saisi ${saisie}).\nLigne : ${l.trim()}`) };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
];
