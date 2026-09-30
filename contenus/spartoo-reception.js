// Spartoo — séance « réception ». Deuxième volet écrit pour l'environnement, le premier à
// faire entrer de la marchandise dans le stock de l'élève.
//
// L'univers (catalogue, fournisseurs, clients, thème) est celui de `spartoo.js` : on ne le
// duplique pas. Ce fichier ne porte que ce qui appartient à la séance — ses messages, sa
// livraison, la marche à suivre affichée sur l'accueil, et ses trois jalons.
//
// Rien n'est prérempli. Le bon de livraison annonce, les colis sur le quai disent la vérité,
// et c'est l'élève qui compte, compare, décide et saisit. Il voit ensuite le résultat dans
// son propre stock : c'est tout l'objet de la séance.

/* ------------------------------------------------------------------ constantes */

export const REC = 'REC-04127';
export const LOT = 'LOT-PM-2609';
export const BL = 'BL-77421';

// Ce que le fournisseur annonce, et ce qu'il a réellement expédié. L'écart est volontaire :
// sans lui, le contrôle à réception serait une formalité.
//
//   PM-SUE-RG-39 : 12 annoncées, 12 reçues en deux colis intacts        → conforme
//   PM-SUE-MA-41 :  8 annoncées,  6 reçues en deux colis intacts        → il manque 2
//   PM-RSX-BL-42 :  6 annoncées,  6 reçues dans un carton enfoncé       → réserve sur l'état
export const ANNONCE = [
  { sku: 'PM-SUE-RG-39', qty: 12 },
  { sku: 'PM-SUE-MA-41', qty: 8 },
  { sku: 'PM-RSX-BL-42', qty: 6 },
];

export const COLIS = [
  { no: 1, sku: 'PM-SUE-RG-39', qty: 6, etat: 'ok' },
  { no: 2, sku: 'PM-SUE-RG-39', qty: 6, etat: 'ok' },
  { no: 3, sku: 'PM-SUE-MA-41', qty: 4, etat: 'ok' },
  { no: 4, sku: 'PM-SUE-MA-41', qty: 2, etat: 'ok' },
  { no: 5, sku: 'PM-RSX-BL-42', qty: 6, etat: 'abime' },
];

export const EXERCICE = 'Exercice 1 : réception d’une livraison fournisseur';

export const ACCUEIL = {
  titre: 'Réceptionner une livraison, dans l’ordre',
  kpis: ['mail', 'receptions', 'stock', 'rupture'],
  etapes: [
    ['Lire la procédure et le bon de livraison', 'Les deux sont dans la Messagerie. Le bon de livraison donne les quantités annoncées et le numéro de lot.'],
    ['Compter les colis reçus', 'Menu Réceptions : additionnez les colis référence par référence. Le transporteur ne dépose pas toujours ce qui est annoncé.'],
    ['Remplir le bon de réception', 'Quantité annoncée, quantité comptée, état des colis, décision. Le logiciel ne corrige rien : ce que vous saisissez fait foi.'],
    ['Valider la réception', 'Les quantités acceptées entrent en stock, avec leur numéro de lot.'],
    ['Vérifier votre travail', 'Console : .getstock, .movements, .getlot. Vous devez retrouver vos entrées.'],
    ['Signaler les réserves au fournisseur', 'Un message à Puma, avec le numéro de lot, ce qui manque et ce qui est abîmé.'],
  ],
};

/* ------------------------------------------------------- le volet de la séance */

export const VOLET = {
  id: 'reception-1',
  semer(prenom) {
    const now = Date.now();
    const reception = {
      no: REC, supId: 'F003', ts: now - 3600e3 * 2,
      transporteur: 'Geodis, tournée 14',
      bl: { no: BL, date: now - 3600e3 * 48, lot: LOT, lines: ANNONCE.map((l) => ({ ...l })) },
      colis: COLIS.map((c) => ({ ...c })),
      ctrl: null,
    };

    return {
      receptions: [reception],
      mails: [
        { folder: 'in', ts: now - 3600e3 * 20, from: 'M. Morin, responsable logistique',
          fromMail: 'direction@spartoo.example', to: prenom,
          subject: 'Procédure de réception : à lire avant de décharger', kind: 'text',
          text: `Bonjour ${prenom},\n\nVous prenez le quai de réception aujourd'hui. Rappel de notre procédure, elle n'a rien d'optionnel :\n\n1. On ne signe jamais un bon de livraison sans avoir compté. Le bon annonce ce que le fournisseur a voulu envoyer, pas ce qui est arrivé.\n2. On compte colis par colis, puis on totalise par référence.\n3. On reporte sur le bon de réception : la quantité annoncée, la quantité comptée, l'état des colis et la décision.\n4. Dès qu'il y a un écart de quantité OU un carton endommagé, la ligne est « acceptée sous réserve » : on l'entre en stock et on signale au fournisseur le jour même. On ne refuse une ligne que si la marchandise est inutilisable.\n5. Le numéro de lot est reporté du bon de livraison. C'est lui qui nous permettra, plus tard, de retrouver d'où vient une paire et chez qui elle est partie. Sans lot, pas de traçabilité.\n\nUne fois la réception validée, vérifiez votre saisie dans la console : .getstock sur une référence, .movements pour les derniers mouvements, .getlot pour suivre le lot entier.\n\nBon courage,\nM. Morin` },
        { folder: 'in', ts: now - 3600e3 * 2, from: 'Puma France, B2B — expéditions',
          fromMail: 'b2b@puma-pro.example', to: prenom,
          subject: 'Bon de livraison ' + BL + ' — expédition du jour', kind: 'bl', rec: REC,
          text: 'Bonjour,\n\nVeuillez trouver ci-dessous le bon de livraison de votre commande. La marchandise a été remise ce matin au transporteur Geodis.\n\nMerci de nous retourner vos éventuelles réserves sous 48 heures, en rappelant le numéro de lot.\n\nCordialement,\nMarc Oberlé\nPuma France, B2B' },
      ],
    };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Trois jalons, sur le modèle de la séance de préparation. Aucun retour n'est donné à
 * l'élève pendant l'exercice : il travaille, l'enseignant voit le résultat.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente il est commencé, la validation manque
 *   na      l'élève n'en est pas encore là
 */

const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const majLot = (s) => String(s || '').toUpperCase().replace(/\s+/g, '');

// Ce que le contrôle aurait dû donner, déduit des colis réellement livrés — jamais écrit
// en dur : si la livraison change, les jalons suivent.
export function attendu() {
  const refs = [];
  ANNONCE.forEach((l) => { if (!refs.includes(l.sku)) refs.push(l.sku); });
  COLIS.forEach((c) => { if (!refs.includes(c.sku)) refs.push(c.sku); });
  return refs.map((sku) => {
    const annonce = ANNONCE.filter((l) => l.sku === sku).reduce((n, l) => n + l.qty, 0);
    const compte = COLIS.filter((c) => c.sku === sku).reduce((n, c) => n + c.qty, 0);
    const abime = COLIS.some((c) => c.sku === sku && c.etat === 'abime');
    const etat = abime ? 'abime' : 'ok';
    const decision = (compte !== annonce || abime) ? 'reserve' : 'accepte';
    return { sku, annonce, compte, etat, decision, entre: decision === 'refuse' ? 0 : compte };
  });
}

const LIB_ETAT = { ok: 'conforme', abime: 'colis endommagé' };
const LIB_DEC = { accepte: 'accepté', reserve: 'accepté sous réserve', refuse: 'refusé' };

export const ETAPES = [
  {
    id: 'controle',
    titre: 'Contrôle à réception du bon ' + BL,
    verifier(db) {
      const r = (db.receptions || []).find((x) => x.no === REC);
      if (!r || !r.ctrl) return { status: 'na' };
      if (!r.ctrl.validated) return { status: 'attente' };
      const c = r.ctrl, att = attendu();
      const lotOk = majLot(c.lot) === LOT;
      const lignes = att.map((a) => {
        const x = c.rows[a.sku] || {};
        const ok = x.annonce === a.annonce && x.compte === a.compte && x.etat === a.etat && x.decision === a.decision;
        return { ...a, ok, x };
      });
      const tout = lotOk && lignes.every((l) => l.ok);
      const detail = `Réception validée le ${new Date(c.at).toLocaleString('fr-FR')}.\n`
        + `Numéro de lot saisi : ${c.lot || '(vide)'} ${lotOk ? '— correct' : '— attendu ' + LOT}\n`
        + lignes.map((l) => `${l.sku} : ${l.ok ? 'correct' : 'à corriger'} — annoncé `
          + `${l.x.annonce === '' || l.x.annonce == null ? '(vide)' : l.x.annonce} (attendu ${l.annonce}), `
          + `compté ${l.x.compte === '' || l.x.compte == null ? '(vide)' : l.x.compte} (attendu ${l.compte}), `
          + `état ${LIB_ETAT[l.x.etat] || '(vide)'} (attendu ${LIB_ETAT[l.etat]}), `
          + `décision ${LIB_DEC[l.x.decision] || '(vide)'} (attendu ${LIB_DEC[l.decision]})`).join('\n');
      return { status: tout ? 'ok' : 'ko', detail, ts: c.at };
    },
  },
  {
    id: 'entree',
    titre: 'Entrée en stock des quantités acceptées, avec le lot',
    verifier(db) {
      const r = (db.receptions || []).find((x) => x.no === REC);
      if (!r || !r.ctrl) return { status: 'na' };
      if (!r.ctrl.validated) return { status: 'attente' };
      const mv = (db.moves || []).filter((m) => m.ref === REC && m.delta > 0);
      const att = attendu();
      const lignes = att.map((a) => {
        const pour = mv.filter((m) => m.sku === a.sku);
        const entre = pour.reduce((n, m) => n + m.delta, 0);
        const lotOk = pour.length > 0 && pour.every((m) => majLot(m.lot) === LOT);
        return { ...a, entreReel: entre, lotOk, ok: entre === a.entre && (a.entre === 0 || lotOk) };
      });
      // Une entrée sur une référence qui n'était ni annoncée ni livrée est une erreur de saisie.
      const intrus = mv.filter((m) => !att.some((a) => a.sku === m.sku));
      const tout = lignes.every((l) => l.ok) && !intrus.length;
      const detail = lignes.map((l) => `${l.sku} : ${l.ok ? 'correct' : 'à corriger'} — `
        + `${l.entreReel} entrée(s) en stock (attendu ${l.entre})`
        + (l.entre > 0 && !l.lotOk ? `, lot absent ou différent de ${LOT}` : '')).join('\n')
        + (intrus.length ? `\nEntrées inattendues : ${intrus.map((m) => m.sku).join(', ')}` : '');
      return { status: tout ? 'ok' : 'ko', detail, ts: r.ctrl.at };
    },
  },
  {
    id: 'reserve',
    titre: 'Réserves signalées à Puma (manquant et colis endommagé)',
    verifier(db, U) {
      const sup = U.SUP_BY_ID.F003;
      if (!sup) return { status: 'na' };
      const mails = (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(sup.email))
        .sort((a, b) => a.ts - b.ts);
      if (!mails.length) return { status: 'attente' };
      const att = attendu();
      const manque = att.filter((a) => a.compte < a.annonce);
      const casse = att.filter((a) => a.etat === 'abime');

      const juger = (msg) => {
        const t = String(msg.text || '').toUpperCase();
        const aLot = t.includes(LOT);
        // La quantité manquante doit être écrite en chiffres : c'est dit noir sur blanc dans
        // la trame, on n'évalue pas sur une règle cachée.
        const aManque = manque.every((a) => t.includes(a.sku) && new RegExp(`\\b${a.annonce - a.compte}\\b`).test(t));
        const aCasse = casse.every((a) => t.includes(a.sku));
        const ok = aLot && aManque && aCasse;
        const detail = `Message envoyé le ${new Date(msg.ts).toLocaleString('fr-FR')} à ${sup.brand}.\n`
          + `Numéro de lot ${LOT} : ${aLot ? 'présent' : 'absent'}\n`
          + `Manquant ${manque.map((a) => `${a.sku} (${a.annonce - a.compte})`).join(', ') || '—'} : ${aManque ? 'signalé' : 'incomplet'}\n`
          + `Colis endommagé ${casse.map((a) => a.sku).join(', ') || '—'} : ${aCasse ? 'signalé' : 'non signalé'}`;
        return { ok, detail, ts: msg.ts };
      };
      const evals = mails.map(juger);
      const best = evals.find((e) => e.ok) || evals[evals.length - 1];
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
];
