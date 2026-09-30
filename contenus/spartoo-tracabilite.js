// Spartoo — séance « traçabilité ». Troisième et dernière séance de l'environnement.
//
// Un défaut de fabrication est signalé sur le lot que l'élève a réceptionné en séance 1. Il
// doit remonter la chaîne dans les deux sens — d'où vient ce lot, chez qui il est parti —
// puis bloquer ce qu'il en reste et rendre compte par écrit.
//
// L'univers (catalogue, fournisseurs, clients, thème) est celui de `spartoo.js`, et la
// livraison est celle de `spartoo-reception.js` : on ne duplique ni l'un ni l'autre. Ce
// fichier ne porte que ce qui appartient à la séance.
//
// Deux choses sont semées à l'ouverture :
//
//   1. L'AVAL, pour tout le monde. La commande de la séance 2 ne touche aucune référence du
//      lot : sans ces trois commandes-là, `.getlot` n'aurait aucune sortie à montrer et il
//      n'y aurait personne à retrouver. Ce sont les commandes des jours qui ont suivi la
//      réception, déjà préparées et validées — l'élève n'a pas à les rejouer.
//   2. L'AMONT, seulement si le lot n'existe pas dans la base. Un élève qui a manqué la
//      séance 1 n'a ni entrée ni lot à remonter : on lui pose alors la réception d'un
//      collègue, déjà contrôlée. Celui qui a fait la séance 1 travaille sur la sienne.

import { LOT, BL, ANNONCE, COLIS, attendu } from './spartoo-reception.js';
import { CATALOGUE } from './spartoo.js';

/* ------------------------------------------------------------------ constantes */

export { LOT };

// L'adresse de M. Morin. Le compte rendu se fait en répondant à son message : c'est cette
// adresse que les jalons cherchent dans les messages sortants.
export const DIRECTION = 'direction@spartoo.example';

// La réception du collègue, pour l'élève qui n'a pas fait la séance 1. Numéro distinct de
// celui de la séance 1 : si l'élève ouvre la réception plus tard, les deux coexistent sans
// s'écraser, et le lot reste remontable dans les deux cas.
const REC_COLLEGUE = 'REC-04118';
const COLLEGUE = 'Sonia Ferret';

// Ce qui est parti chez les clients depuis la réception. Les quantités sont plafonnées à
// l'ouverture par ce que le lot contient réellement : un élève qui n'a réceptionné que
// 6 paires d'une référence ne peut pas en avoir vendu 3 s'il n'en est entré que 2.
const VENTES = [
  { no: 'CMD-048301', customerId: 'C0011', ship: 'COL', jours: 4,
    lignes: [{ sku: 'PM-SUE-RG-39', qty: 2 }] },
  { no: 'CMD-048307', customerId: 'C0019', ship: 'REL', jours: 3,
    lignes: [{ sku: 'PM-SUE-MA-41', qty: 1 }, { sku: 'PM-RSX-BL-42', qty: 2 }] },
  { no: 'CMD-048312', customerId: 'C0026', ship: 'CHR', jours: 2,
    lignes: [{ sku: 'PM-SUE-RG-39', qty: 1 }] },
];

export const EXERCICE = 'Exercice 3 : traçabilité d’un lot et blocage qualité';

export const ACCUEIL = {
  titre: 'Remonter un lot, puis le bloquer',
  kpis: ['mail', 'commandes'],
  etapes: [
    ['Lire les deux messages', 'Puma signale un défaut de fabrication. M. Morin dit ce qu’il attend de vous et sous quelle forme.'],
    ['Remonter le lot', 'Console : .getlot suivi du numéro de lot. Vous obtenez les entrées, les sorties, les documents et les clients.'],
    ['Noter l’amont', 'Quand le lot est entré, sous quel numéro de réception, et chez quel fournisseur.'],
    ['Noter l’aval', 'Quelles commandes sont parties avec des paires de ce lot, et pour quels clients.'],
    ['Bloquer ce qui reste', 'Menu Blocage qualité : référence par référence, la quantité qui reste de ce lot. Cherchez d’abord combien il en reste sur chacune.'],
    ['Rendre compte à M. Morin', 'Répondez à son message : le lot, sa date d’entrée, le fournisseur, les commandes touchées et ce que vous avez bloqué.'],
  ],
};

/* ------------------------------------------------------- outils sur les lots */

const majLot = (s) => String(s || '').toUpperCase().replace(/\s+/g, '');
const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Les mouvements d'un lot, tels qu'ils sont dans la base de l'élève. Tout ce qui suit s'en
// déduit : aucun jalon n'écrit en dur ce qui est entré, sorti ou resté.
export function mouvementsDuLot(db) {
  return (db.moves || []).filter((m) => majLot(m.lot) === LOT);
}

// Entré, sorti, bloqué et restant, référence par référence.
export function bilanDuLot(db) {
  const mv = mouvementsDuLot(db);
  const par = new Map();
  mv.forEach((m) => {
    if (!par.has(m.sku)) par.set(m.sku, { sku: m.sku, entre: 0, sorti: 0, bloque: 0 });
    const x = par.get(m.sku);
    if (m.delta > 0) x.entre += m.delta;
    else if (m.type === 'Blocage qualité') x.bloque += -m.delta;
    else x.sorti += -m.delta;
  });
  const lignes = Array.from(par.values());
  lignes.forEach((x) => { x.reste = x.entre - x.sorti - x.bloque; });
  return lignes;
}

/* ------------------------------------------------------- le volet de la séance */

export const VOLET = {
  id: 'tracabilite-1',
  semer(prenom, db) {
    const now = Date.now();
    const jour = 3600e3 * 24;
    const mouvements = [];
    const receptions = [];

    // L'amont. Le lot est-il déjà entré dans la base de l'élève ?
    const dejaEntre = (db.moves || []).some((m) => majLot(m.lot) === LOT && m.delta > 0);
    if (!dejaEntre) {
      const att = attendu();
      const rows = {};
      att.forEach((a) => { rows[a.sku] = { annonce: a.annonce, compte: a.compte, etat: a.etat, decision: a.decision }; });
      const tRec = now - jour * 6;
      receptions.push({
        no: REC_COLLEGUE, supId: 'F003', ts: tRec, transporteur: 'Geodis, tournée 14',
        bl: { no: BL, date: tRec - jour, lot: LOT, lines: ANNONCE.map((l) => ({ ...l })) },
        colis: COLIS.map((c) => ({ ...c })),
        ctrl: { lot: LOT, rows, validated: true, at: tRec },
      });
      att.forEach((a) => {
        if (a.entre > 0) {
          mouvements.push({ sku: a.sku, type: 'Entrée : réception', delta: a.entre,
            ref: REC_COLLEGUE, lot: LOT, ts: tRec, by: COLLEGUE });
        }
      });
    }

    // Ce que le lot contient, une fois l'amont posé : la base de l'élève, plus ce qu'on
    // vient éventuellement d'y ajouter.
    const dispo = {};
    (db.moves || []).forEach((m) => { if (majLot(m.lot) === LOT) dispo[m.sku] = (dispo[m.sku] || 0) + m.delta; });
    mouvements.forEach((m) => { dispo[m.sku] = (dispo[m.sku] || 0) + m.delta; });

    // Les sorties partent après la dernière entrée du lot : un élève qui a réceptionné ce
    // matin ne doit pas voir des ventes datées d'avant sa propre réception.
    let dernier = 0;
    (db.moves || []).forEach((m) => { if (majLot(m.lot) === LOT && m.delta > 0 && m.ts > dernier) dernier = m.ts; });
    mouvements.forEach((m) => { if (m.delta > 0 && m.ts > dernier) dernier = m.ts; });
    const base = Math.max(dernier + 3600e3, now - jour * 5);

    const orders = [];
    VENTES.forEach((v, i) => {
      // On ne vend que ce que le lot a réellement en stock.
      const lignes = [];
      v.lignes.forEach((l) => {
        const q = Math.min(l.qty, Math.max(0, dispo[l.sku] || 0));
        if (q > 0) { lignes.push({ sku: l.sku, qty: q }); dispo[l.sku] -= q; }
      });
      if (!lignes.length) return;
      const ts = Math.min(now - 3600e3, base + jour * i + 3600e3 * 2);
      const rows = {};
      lignes.forEach((l) => {
        const va = CATALOGUE.VM[l.sku];
        rows[l.sku] = { seen: l.qty, loc: va ? va.loc : '', qty: l.qty, status: 'ok' };
      });
      orders.push({
        no: v.no, date: ts - 3600e3 * 6, customerId: v.customerId, ship: v.ship,
        lines: lignes.map((l) => ({ ...l })),
        prep: { rows, doc: true, validated: true, complete: true, at: ts, par: COLLEGUE },
      });
      lignes.forEach((l) => {
        mouvements.push({ sku: l.sku, type: 'Sortie : préparation', delta: -l.qty,
          ref: 'BP-' + v.no.replace('CMD-', ''), lot: LOT, ts, by: COLLEGUE });
      });
    });

    const mails = [
      { folder: 'in', ts: now - 3600e3 * 5, from: 'Puma France, B2B — qualité',
        fromMail: 'b2b@puma-pro.example', to: prenom,
        subject: 'URGENT — rappel qualité sur le lot ' + LOT, kind: 'text',
        text: `Madame, Monsieur,\n\nNotre service qualité a identifié un défaut de fabrication sur le lot ${LOT} : le collage de la semelle est insuffisant sur une partie de la production. Le défaut n'est pas visible à l'œil nu.\n\nNous vous demandons de :\n\n1. ne plus expédier aucune paire de ce lot,\n2. nous indiquer les commandes déjà livrées avec des articles de ce lot, afin que nous prenions contact avec les clients concernés,\n3. isoler le stock restant en attendant nos instructions de retour.\n\nCe lot ne concerne que les articles que nous vous avons livrés sous ce numéro. Les paires de la même référence issues de nos livraisons précédentes ne sont pas en cause.\n\nNous restons à votre disposition.\n\nCordialement,\nMarc Oberlé\nPuma France, B2B` },
      { folder: 'in', ts: now - 3600e3 * 3, from: 'M. Morin, responsable logistique',
        fromMail: DIRECTION, to: prenom,
        subject: 'Lot ' + LOT + ' : traçabilité et blocage, aujourd’hui', kind: 'text',
        text: `Bonjour ${prenom},\n\nVous avez vu le message de Puma. Le lot ${LOT} est celui qui est entré chez nous à la réception. C'est exactement pour ce moment-là qu'on recopie un numéro de lot sur un bon de réception.\n\nVoici ce que j'attends de vous, dans cet ordre :\n\n1. Remontez le lot. Dans la console, .getlot suivi du numéro de lot vous donne tout : ce qui est entré, sous quel numéro de réception et quel jour, puis ce qui est sorti, avec le bon de préparation, la commande et le client.\n\n2. Bloquez le stock restant, référence par référence. Menu « Blocage qualité » : vous indiquez le lot, la référence complète, la quantité et le motif. Attention, c'est à vous de trouver quelles références sont concernées et combien il en reste sur chacune — l'écran ne vous le dira pas. Le blocage ne touche que ce lot : les paires de la même référence venues d'une autre livraison restent vendables.\n\n3. Rendez-moi compte en répondant à ce message. Je dois y trouver, écrit noir sur blanc :\n   - le numéro du lot ;\n   - la date à laquelle il est entré en stock, au format jj/mm/aaaa ;\n   - le nom du fournisseur ;\n   - le numéro de chaque commande partie avec des paires de ce lot, sous la forme CMD-000000 ;\n   - ce que vous avez bloqué.\n\nSoyez précis sur les numéros : c'est ce document que Puma va lire.\n\nMerci,\nM. Morin` },
    ];

    return { receptions, orders, mouvements, mails };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Trois jalons, sur le modèle des deux autres séances. Aucun retour n'est donné à l'élève
 * pendant l'exercice : il travaille, l'enseignant voit le résultat.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente il est commencé, la validation manque
 *   na      l'élève n'en est pas encore là
 *
 * Tout ce qui est attendu se déduit de la base : la date d'entrée, le fournisseur, les
 * commandes touchées et le reste à bloquer viennent des mouvements du lot, jamais d'une
 * valeur écrite ici.
 */

const fdate = (t) => new Date(t).toLocaleDateString('fr-FR');

// Les messages de compte rendu, du plus ancien au plus récent.
function comptesRendus(db) {
  return (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(DIRECTION))
    .sort((a, b) => a.ts - b.ts);
}

// Le jalon retient le meilleur essai : un élève qui s'est repris n'est pas puni pour son
// premier jet, mais il ne gagne rien à envoyer dix messages vides.
function meilleur(mails, juger) {
  const evals = mails.map(juger);
  return evals.find((e) => e.ok) || evals[evals.length - 1];
}

export const ETAPES = [
  {
    id: 'amont',
    titre: 'Lot identifié dans le compte rendu (numéro, date d’entrée, fournisseur)',
    verifier(db, U) {
      const entrees = mouvementsDuLot(db).filter((m) => m.delta > 0).sort((a, b) => a.ts - b.ts);
      if (!entrees.length) return { status: 'na' };
      const mails = comptesRendus(db);
      if (!mails.length) return { status: 'attente' };

      const date = fdate(entrees[0].ts);
      const v = U.CATALOGUE.VM[entrees[0].sku];
      const sup = v ? U.SUP_BY_ID[v.model.sup] : null;
      const marque = sup ? sup.brand : '';

      const best = meilleur(mails, (msg) => {
        const t = String(msg.text || '');
        const aLot = t.toUpperCase().includes(LOT);
        // La date est demandée au format jj/mm/aaaa dans le message de M. Morin comme dans
        // la trame : on n'évalue pas sur une règle cachée.
        const aDate = t.includes(date);
        const aSup = !!marque && nrm(t).includes(nrm(marque));
        return {
          ok: aLot && aDate && aSup,
          detail: `Compte rendu envoyé le ${new Date(msg.ts).toLocaleString('fr-FR')}.\n`
            + `Numéro de lot ${LOT} : ${aLot ? 'présent' : 'absent'}\n`
            + `Date d'entrée en stock ${date} : ${aDate ? 'présente' : 'absente ou mal écrite'}\n`
            + `Fournisseur ${marque || '(inconnu)'} : ${aSup ? 'nommé' : 'non nommé'}`,
          ts: msg.ts,
        };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
  {
    id: 'aval',
    titre: 'Commandes livrées avec ce lot retrouvées et citées',
    verifier(db) {
      const sorties = mouvementsDuLot(db).filter((m) => m.delta < 0 && m.type !== 'Blocage qualité');
      const cmds = [];
      sorties.forEach((m) => {
        const o = (db.orders || []).find((x) => 'BP-' + x.no.replace('CMD-', '') === m.ref);
        if (o && !cmds.includes(o.no)) cmds.push(o.no);
      });
      if (!cmds.length) return { status: 'na' };
      const mails = comptesRendus(db);
      if (!mails.length) return { status: 'attente' };

      const best = meilleur(mails, (msg) => {
        const t = String(msg.text || '').toUpperCase();
        const trouvees = cmds.filter((no) => t.includes(no));
        const manquantes = cmds.filter((no) => !t.includes(no));
        return {
          ok: manquantes.length === 0,
          detail: `Compte rendu envoyé le ${new Date(msg.ts).toLocaleString('fr-FR')}.\n`
            + `${trouvees.length} commande(s) citée(s) sur ${cmds.length} : ${trouvees.join(', ') || '—'}\n`
            + (manquantes.length ? `Manque : ${manquantes.join(', ')}` : 'Toutes les commandes concernées sont citées.'),
          ts: msg.ts,
        };
      });
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
  {
    id: 'blocage',
    titre: 'Stock restant du lot bloqué, référence par référence',
    verifier(db) {
      const lignes = bilanDuLot(db).filter((x) => x.entre > 0);
      if (!lignes.length) return { status: 'na' };
      if (!lignes.some((x) => x.bloque > 0)) return { status: 'attente' };
      const tout = lignes.every((x) => x.reste === 0);
      const detail = lignes.map((x) => `${x.sku} : ${x.reste === 0 ? 'correct' : 'à corriger'} — `
        + `${x.entre} entrée(s), ${x.sorti} vendue(s), ${x.bloque} bloquée(s), `
        + (x.reste === 0 ? 'rien ne reste de ce lot' : `il reste ${x.reste} ${x.reste > 1 ? 'paires' : 'paire'} à bloquer`)).join('\n');
      const dernier = mouvementsDuLot(db).filter((m) => m.type === 'Blocage qualité')
        .reduce((t, m) => Math.max(t, m.ts), 0);
      return { status: tout ? 'ok' : 'ko', detail, ts: dernier || undefined };
    },
  },
];
