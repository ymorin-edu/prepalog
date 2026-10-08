// Le SOCLE de la base d'un élève : le stock, les mouvements (avec le numéro de lot qui voyage avec eux), les lots (premier entré,
// premier sorti), les clients et les fournisseurs (ceux de la séance, plus ceux que l'élève a créés à la console).
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 5) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterBase({ db, prenom, CUSTOMERS, CM, SUPPLIERS })` reçoit la base de CET élève. Il ne garde
// AUCUNE copie de `db.stock` ni de `db.moves` : la remise à zéro (`reinitialiser`) vide `db` puis le remplit de tableaux neufs,
// donc chaque fonction relit `db` à l'appel. Rend : `stockDe`, `mouvement`, `restesParLot`, `sortirFifo`, `resteDuLot`,
// `tousClients`, `tousFournisseurs`, `clientDe`, `codeSuivant`. Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js`.

import { pad } from './entreprise-outils.js';

export function monterBase({ db, prenom, CUSTOMERS, CM, SUPPLIERS }) {
  const stockDe = (sku) => { const q = db.stock[sku]; return q == null ? 0 : q; };

  // Le numéro de lot voyage avec le mouvement. C'est lui qui rend la traçabilité possible :
  // sans lui, on sait qu'une paire est sortie, pas de quelle livraison elle venait.
  function mouvement(sku, type, delta, ref, lot) {
    db.moves.push({ ts: Date.now(), sku, type, delta, after: db.stock[sku], ref: ref || 'Console', lot: lot || '', by: prenom });
  }
  const tousClients = () => CUSTOMERS.concat(db.customers || []);
  const tousFournisseurs = () => SUPPLIERS.concat(db.suppliers || []);
  const clientDe = (id) => CM[id] || (db.customers || []).find((c) => c.id === id) || { prenom: '?', nom: '', adr: '', cp: '', ville: '', email: '', tel: '', id };
  function codeSuivant(liste, prefixe, largeur) {
    let mx = 0;
    liste.forEach((x) => { const n = parseInt(String(x.id).replace(/\D/g, ''), 10); if (!isNaN(n) && n > mx) mx = n; });
    return prefixe + pad(mx + 1, largeur);
  }

  // Ce qui reste de chaque lot pour une référence. Le stock de départ n'a pas de lot :
  // il est compté à part, et sort le premier — premier entré, premier sorti.
  function restesParLot(sku) {
    const parLot = new Map();
    db.moves.forEach((m) => {
      if (m.sku !== sku || !m.lot) return;
      parLot.set(m.lot, (parLot.get(m.lot) || 0) + m.delta);
    });
    let identifie = 0;
    parLot.forEach((q) => { identifie += Math.max(0, q); });
    const out = [{ lot: '', reste: Math.max(0, stockDe(sku) - identifie) }];
    parLot.forEach((q, lot) => { if (q > 0) out.push({ lot, reste: q }); });
    return out;
  }

  // Une sortie consomme les lots dans l'ordre : elle peut donc donner plusieurs
  // mouvements, un par lot entamé. C'est ce découpage qui permet, plus tard, de dire
  // quel client a reçu quel lot.
  function sortirFifo(sku, qty, type, ref) {
    let reste = qty;
    restesParLot(sku).forEach((x) => {
      if (reste <= 0) return;
      const pris = Math.min(reste, x.reste);
      if (pris <= 0) return;
      db.stock[sku] = stockDe(sku) - pris;
      mouvement(sku, type, -pris, ref, x.lot);
      reste -= pris;
    });
    if (reste > 0) { db.stock[sku] = stockDe(sku) - reste; mouvement(sku, type, -reste, ref, ''); }
  }

  // Ce qui reste d'un lot pour une référence : la somme des mouvements qui le portent.
  // Jamais une valeur écrite d'avance — si l'élève a réceptionné 10 paires au lieu de 12,
  // c'est 10 qui comptent.
  function resteDuLot(sku, lot) {
    let n = 0;
    db.moves.forEach((m) => { if (m.sku === sku && String(m.lot || '').toUpperCase() === lot) n += m.delta; });
    return Math.max(0, n);
  }

  return { stockDe, mouvement, restesParLot, sortirFifo, resteDuLot, tousClients, tousFournisseurs, clientDe, codeSuivant };
}
