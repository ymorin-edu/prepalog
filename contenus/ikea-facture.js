// IKEA — le contrôle de la facture du prestataire de livraison : la mécanique COMMUNE à ENT-12.4 (guidage, facture de février) et ENT-12.8 (évaluation, facture de mars).
// Données pures, sans interface (se charge aussi sous Node : corrigés, tests). Univers : `contenus/ikea.js`.
//
// CONSTRUIT (choix de Tristan du 26/10/2026 : le prestataire n'est PAS nommé) : le tarif ci-dessous, les bons de livraison, la facture, les clients (noms fictifs,
// initiale seule à l'écran). Rien n'est repris d'un document réel. Le tarif entre IKEA et son prestataire n'est pas public.
//
// LE PRINCIPE. Douze créneaux de livraison (`SLOTS`) donnent douze bons signés. La facture reprend chaque bon sur une ligne, au tarif ; on y injecte des ERREURS :
//   doublon   · une livraison facturée deux fois (même bon, même date)                                   → on conteste la ligne en trop
//   tarif     · une livraison « devant chez vous » facturée au prix « dans la pièce »                     → mauvais tarif
//   nonfaite  · une livraison manquée (client absent, prévenu) facturée comme une livraison complète       → livraison non faite
//   supp      · un supplément d'étage facturé alors que l'immeuble a un ascenseur                         → supplément indu
//   qte       · un colis de plus facturé qu'il n'y en a sur le bon                                        → quantité fausse
//   calcul    · le total HT de la facture ne correspond pas à la somme de ses lignes                      → erreur de calcul
// Le montant JUSTE se recalcule toujours depuis les bons et le tarif (`prixDu`) : rien n'est recopié.

export const TARIF = {
  devant: 28,          // € HT : livraison « devant chez vous » (pied de l'immeuble)
  piece: 46,           // € HT : livraison « dans la pièce de votre choix »
  etage: 6,            // € HT par étage sans ascenseur (mode « dans la pièce » seulement)
  colisInclus: 3,      // colis compris dans le prix
  colisEnPlus: 5,      // € HT par colis au-delà
  manquee: 0.3,        // livraison manquée (client absent, prévenu) : 30 % du prix de la livraison seule (sans supplément)
};
export const TVA = 0.2;
export const arrondi = (n) => Math.round(n * 100) / 100;
export const ttc = (ht) => arrondi(ht * (1 + TVA));
export const tva = (ht) => arrondi(ht * TVA);

export const MODES_LIB = { devant: 'Devant chez vous', piece: 'Dans la pièce' };

// Un bon : { mode, etages (sans ascenseur), colis, issue: 'livre' | 'absent', reserve? } ; le prix dû pour ce bon.
export function prixDu(b) {
  if (b.issue === 'absent') return arrondi(TARIF.manquee * TARIF[b.mode]);
  return arrondi(TARIF[b.mode] + (b.mode === 'piece' ? TARIF.etage * b.etages : 0) + TARIF.colisEnPlus * Math.max(0, b.colis - TARIF.colisInclus));
}
// Le prix d'une ligne de facture : { mode, etages, colis, issue }, tel que le prestataire l'a facturé (peut être faux).
export const prixLigne = (l) => arrondi(TARIF[l.mode] + (l.mode === 'piece' ? TARIF.etage * l.etages : 0) + TARIF.colisEnPlus * Math.max(0, l.colis - TARIF.colisInclus));

// ─────────────────────────────────────────────────────────────── les douze créneaux (le rôle de chacun porte l'erreur qu'on peut y injecter)
export const SLOTS = [
  { id: 'a', mode: 'devant', etages: 0, colis: 2 },
  { id: 'b', mode: 'piece', etages: 3, colis: 3 },
  { id: 'c', mode: 'piece', etages: 4, colis: 5, role: 'qte' },
  { id: 'd', mode: 'devant', etages: 0, colis: 1, role: 'tarif' },
  { id: 'e', mode: 'piece', etages: 0, colis: 3, role: 'supp' },               // immeuble avec ascenseur
  { id: 'f', mode: 'piece', etages: 2, colis: 4, issue: 'absent', role: 'nonfaite' },
  { id: 'g', mode: 'devant', etages: 0, colis: 2, reserve: 'colis 2 : carton déchiré, article intact' },   // une réserve PRÉCISE : la ligne reste juste
  { id: 'h', mode: 'piece', etages: 1, colis: 3 },
  { id: 'i', mode: 'devant', etages: 0, colis: 4 },
  { id: 'j', mode: 'piece', etages: 5, colis: 3 },
  { id: 'k', mode: 'devant', etages: 0, colis: 1 },
  { id: 'l', mode: 'piece', etages: 0, colis: 2 },
];
export const NOMS_CLIENTS = ['Roux', 'Diallo', 'Martin', 'Nguyen', 'Lefèvre', 'Morel', 'Haddad', 'Perrin', 'Garcia', 'Lambert', 'Costa', 'Mercier', 'Blanc', 'Fabre', 'Sanchez', 'Giraud'];
export const PRENOMS_INIT = ['M.', 'Mme'];

// Les erreurs possibles : le créneau qui la porte, son motif (clé du bloc de la fiche), son libellé, son niveau (équité de l'évaluation).
export const ERREURS = {
  doublon: { motif: 'doublon', lib: 'Livraison facturée deux fois', niveau: 'facile' },
  calcul: { motif: 'calcul', lib: 'Total HT faux (la somme des lignes ne donne pas ce total)', niveau: 'facile' },
  tarif: { motif: 'tarif', lib: 'Mauvais tarif (livraison « dans la pièce » facturée, le bon dit « devant chez vous »)', niveau: 'moyen', role: 'tarif' },
  qte: { motif: 'tarif', lib: 'Colis facturés en trop (plus que sur le bon)', niveau: 'moyen', role: 'qte' },
  nonfaite: { motif: 'nonfaite', lib: 'Livraison non faite facturée comme une livraison complète', niveau: 'difficile', role: 'nonfaite' },
  supp: { motif: 'tarif', lib: 'Supplément d’étage facturé alors que l’immeuble a un ascenseur', niveau: 'difficile', role: 'supp' },
};
// Les trois blocs « cases » de la fiche, dans lesquels l'élève coche les lignes contestées.
export const MOTIFS = [
  { id: 'doublon', lib: 'Livraison facturée deux fois' },
  { id: 'tarif', lib: 'Mauvais tarif ou supplément indu' },
  { id: 'nonfaite', lib: 'Livraison non faite facturée comme faite' },
];

const JOURS = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26];   // jours ouvrés d'un mois de 28 jours (février 2027, mars 2027 : on garde le début)

// Construit le dossier d'une facture.
//   cfg : { mois: 'févr.' | 'mars', annee, ordre: [12 ids de créneaux], clients: [12 noms], etages: { b, h, j } (étages tirés), erreurs: ['doublon', …],
//           doublonDe: id du créneau recopié, delta: écart du total HT si 'calcul' }
// Rend { bons, lignes, totalAffiche, justes:{ht,tva,ttc}, ecartHT, fautes: { <type>: { lignes:[n°], accepte:[n°] } }, lignesContestees:[n°] }
export function construire(cfg) {
  const ordre = cfg.ordre || SLOTS.map((s) => s.id);
  const E = cfg.erreurs || [];
  const slot = (id) => SLOTS.find((s) => s.id === id);
  // Le doublon prend la place du dernier créneau (douze lignes, onze bons) ; sans doublon, douze bons.
  const nbBons = E.includes('doublon') ? 11 : 12;
  const ids = ordre.slice(0, nbBons);
  const dons = cfg.doublonDe && ids.includes(cfg.doublonDe) ? cfg.doublonDe : ids[ids.length - 1];
  const bons = ids.map((id, i) => {
    const s = { ...slot(id) };
    if (cfg.etages && cfg.etages[id] != null && s.mode === 'piece' && s.etages > 0) s.etages = cfg.etages[id];
    return { n: i + 1, id, bl: `BL-${(cfg.base || 21700) + i * 7 + 3}`, jour: JOURS[i], client: `${i % 3 === 1 ? 'Mme' : 'M.'} ${(cfg.clients || NOMS_CLIENTS)[i]}`,
      mode: s.mode, etages: s.etages, colis: s.colis, issue: s.issue || 'livre', reserve: s.reserve || null, role: s.role || null };
  });
  const lignes = bons.map((b) => ({ bl: b.bl, jour: b.jour, client: b.client, mode: b.mode, etages: b.etages, colis: b.colis, issue: b.issue, id: b.id }));
  const fautes = {};
  const marque = (type, n, accepte) => { fautes[type] = { lignes: [n], accepte: accepte || [n] }; };
  // Les erreurs de ligne : on modifie la ligne facturée (jamais le bon).
  lignes.forEach((l, i) => {
    if (E.includes('tarif') && bons[i].role === 'tarif') { l.mode = 'piece'; marque('tarif', i + 1); }
    if (E.includes('qte') && bons[i].role === 'qte') { l.colis += 1; marque('qte', i + 1); }
    if (E.includes('supp') && bons[i].role === 'supp') { l.etages = 3; marque('supp', i + 1); }
    if (E.includes('nonfaite') && bons[i].role === 'nonfaite') { l.issue = 'livre'; marque('nonfaite', i + 1); }
  });
  lignes.forEach((l, i) => { l.ht = (bons[i].issue === 'absent' && l.issue === 'absent') ? prixDu(bons[i]) : prixLigne(l); });
  if (E.includes('doublon')) {
    const k = bons.findIndex((b) => b.id === dons);
    const copie = { ...lignes[k], doublon: true };
    lignes.push(copie);
    marque('doublon', lignes.length, [k + 1, lignes.length]);
  }
  lignes.forEach((l, i) => { l.n = i + 1; });
  const somme = arrondi(lignes.reduce((s, l) => s + l.ht, 0));
  const delta = E.includes('calcul') ? (cfg.delta || 24) : 0;
  const totalAffiche = arrondi(somme + delta);
  if (E.includes('calcul')) fautes.calcul = { lignes: [], accepte: [] };
  const ht = arrondi(bons.reduce((s, b) => s + prixDu(b), 0));
  const lignesContestees = Object.entries(fautes).filter(([t]) => t !== 'calcul').map(([, f]) => f.lignes[0]).sort((a, b) => a - b);
  return {
    bons, lignes, totalAffiche, somme, justes: { ht, tva: tva(ht), ttc: ttc(ht) }, ecartHT: arrondi(totalAffiche - ht), fautes, lignesContestees, erreurs: E.slice(),
  };
}

// La facture du guidage (février 2027) : la pièce FIXE d'ENT-12.4. Trois erreurs : un doublon, un mauvais tarif, une livraison non faite.
export const GUIDAGE = { mois: 'février', annee: 2027, erreurs: ['doublon', 'tarif', 'nonfaite'], doublonDe: 'h', base: 21700 };
export const FACTURE_GUIDAGE = () => construire(GUIDAGE);

// Les lignes contestées lues dans la fiche : `valeurs[motif]` = valeurs cochées (clé = n° de ligne, texte).
export const coches = (v, motif) => ((v && v[motif]) || []).map(Number).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);

// Ce que la fiche contient-elle de juste ? `v` : valeurs de la fiche ; `F` : le dossier. Rend { trouvees: { type: bool }, surcontestees: [n°] }.
export function juger(v, F) {
  const parMotif = Object.fromEntries(MOTIFS.map((m) => [m.id, coches(v, m.id)]));
  const trouvees = {};
  for (const [t, f] of Object.entries(F.fautes)) {
    if (t === 'calcul') { trouvees[t] = (v && v.total) === 'faux'; continue; }
    const motif = ERREURS[t].motif;
    const dedans = parMotif[motif].filter((n) => f.accepte.includes(n));
    const ailleurs = MOTIFS.some((m) => m.id !== motif && parMotif[m.id].some((n) => f.accepte.includes(n)));
    trouvees[t] = dedans.length === 1 && !ailleurs;
  }
  // Les lignes « justes » contestées : toute ligne cochée qui n'est pas (une alternative de) une erreur.
  const acceptees = Object.values(F.fautes).flatMap((f) => f.accepte);
  const cochees = [...new Set(MOTIFS.flatMap((m) => parMotif[m.id]))];
  const surcontestees = cochees.filter((n) => !acceptees.includes(n));
  return { trouvees, surcontestees, parMotif, cochees };
}
