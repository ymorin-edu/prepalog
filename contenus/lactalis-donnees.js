// Lactalis — le rappel des laits infantiles (2017-2018) : les DONNÉES PURES des séances ENT-14.1 à 14.4 (1re, C3.2 « assurer la traçabilité »).
// Importé par l'univers (`contenus/lactalis.js`), les contenus de séance (`contenus/lactalis-ent14x.js`), les questions et les tests. Cadrage :
// `docs/briefs/lactalis/CADRAGE-lactalis-1re.md`.
//
// L'élève ne travaille PAS chez Lactalis : il est à la plateforme régionale d'une enseigne de supermarchés de l'Ouest (CONSTRUITE, jamais nommée),
// qui a reçu des laits infantiles fabriqués à Craon (Mayenne) et les a livrés à ses magasins. Personne de Lactalis ne parle dans la séance.
//
// VÉRIFIÉ (recherche web, 26/10/2026) : l'usine Lactalis Nutrition Santé de Craon (Mayenne) ; les marques Picot et Milumel parmi les produits rappelés ;
// le 2 décembre 2017, retrait-rappel de 12 lots (contamination à Salmonella Agona, nourrissons malades) ; le 10 décembre, plus de 600 lots ;
// le 21 décembre, TOUS les produits de nutrition infantile fabriqués ou conditionnés à Craon depuis le 15 février 2017 ; le 14 janvier 2018, tous
// les produits de l'usine, quelle que soit leur date (12 millions de boîtes, 83 pays) ; des enseignes ont reconnu avoir vendu des boîtes APRÈS le rappel.
// CONSTRUIT : la plateforme, l'enseigne, les magasins (les villes de Mayenne sont réelles, les magasins non), les prénoms, les références, les
// désignations, les quantités, les numéros de réception et de bon, les NUMÉROS DE LOT et leur format (le vrai format Lactalis n'est pas repris :
// aucun lot de ces séances n'est un vrai lot rappelé). Les douze lots de l'avis du 2 décembre sont construits.

// ─────────────────────────────────────────── les articles (marques réelles, références et désignations construites)
export const ARTICLES = [
  { ref: 'PIC1-800', designation: 'Picot lait 1er âge — boîte 800 g', marque: 'Picot' },
  { ref: 'PIC2-800', designation: 'Picot lait 2e âge — boîte 800 g', marque: 'Picot' },
  { ref: 'PICAR-800', designation: 'Picot lait anti-régurgitation — boîte 800 g', marque: 'Picot' },
  { ref: 'MIL1-900', designation: 'Milumel lait 1er âge — boîte 900 g', marque: 'Milumel' },
  { ref: 'MIL2-900', designation: 'Milumel lait 2e âge — boîte 900 g', marque: 'Milumel' },
  { ref: 'MILC-900', designation: 'Milumel lait de croissance — boîte 900 g', marque: 'Milumel' },
];
export const ARTICLE = Object.fromEntries(ARTICLES.map((a) => [a.ref, a]));

// ─────────────────────────────────────────── les magasins de l'enseigne (villes réelles, magasins construits)
export const MAGASINS = [
  { id: 'laval', nom: 'Laval' },
  { id: 'chateau-gontier', nom: 'Château-Gontier' },
  { id: 'mayenne', nom: 'Mayenne' },
  { id: 'evron', nom: 'Évron' },
  { id: 'ernee', nom: 'Ernée' },
  { id: 'craon', nom: 'Craon' },
  { id: 'meslay', nom: 'Meslay-du-Maine' },
];
export const MAGASIN = Object.fromEntries(MAGASINS.map((m) => [m.id, m]));

// ─────────────────────────────────────────── le numéro de lot (format CONSTRUIT)
// CR-AAMMJJ-E : CR = usine de Craon ; AAMMJJ = date de fabrication (année, mois, jour) ; E = équipe (A, B ou C).
export function dateDuLot(lot) {
  const x = /^CR-(\d\d)(\d\d)(\d\d)-[A-C]$/.exec(String(lot || ''));
  return x ? `20${x[1]}-${x[2]}-${x[3]}` : null;
}
export const fdateIso = (iso) => { const [a, m, j] = iso.split('-'); return `${j}/${m}/${a}`; };
// La règle de l'avis du 21 décembre 2017 : fabriqué à Craon DEPUIS le 15 février 2017 (le 15 compris).
export const REGLE_21_DECEMBRE = '2017-02-15';
export const viseParLaRegle = (lot) => { const d = dateDuLot(lot); return !!d && d >= REGLE_21_DECEMBRE; };

// ─────────────────────────────────────────── les quatre jeux de données
// receptions : [date jj/mm/aaaa, n° de réception, référence, lot, boîtes reçues]
// expeditions : [date, n° de bon, magasin, référence, lot, boîtes]
// Les dates sont celles des registres de la plateforme ; aucun total n'est écrit ici, tout se calcule (`bilan`).

// ENT-14.1 — guidage, lundi 4 décembre 2017 : l'avis du 2 décembre donne une LISTE de douze lots.
export const D141 = {
  code: 'ENT-14.1', jour: { iso: '2017-12-04', lib: 'lundi 4 décembre 2017' },
  avis: { date: '02/12/2017', mode: 'liste', lots: [
    ['CR-170718-A', 'PIC1-800'], ['CR-170718-B', 'PIC1-800'], ['CR-170719-A', 'PIC1-800'], ['CR-170720-A', 'MIL1-900'],
    ['CR-170905-A', 'PIC2-800'], ['CR-170906-B', 'PIC2-800'], ['CR-170912-C', 'MIL2-900'], ['CR-171003-A', 'PICAR-800'],
    ['CR-171004-B', 'PICAR-800'], ['CR-171012-A', 'PIC1-800'], ['CR-171019-C', 'MILC-900'], ['CR-171025-B', 'MIL1-900'],
  ] },
  receptions: [
    ['04/09/2017', 'REC-17-0911', 'PIC1-800', 'CR-170718-A', 144],
    ['04/09/2017', 'REC-17-0911', 'MIL1-900', 'CR-170720-B', 96],
    ['02/10/2017', 'REC-17-1008', 'PIC2-800', 'CR-170905-A', 120],
    ['02/10/2017', 'REC-17-1008', 'MILC-900', 'CR-170830-C', 72],
    ['06/11/2017', 'REC-17-1104', 'PIC1-800', 'CR-171012-B', 144],
    ['06/11/2017', 'REC-17-1104', 'PICAR-800', 'CR-171003-A', 48],
    ['06/11/2017', 'REC-17-1104', 'MIL2-900', 'CR-171010-C', 96],
  ],
  expeditions: [
    ['11/09/2017', 'BL-17-20114', 'laval', 'PIC1-800', 'CR-170718-A', 72],
    ['11/09/2017', 'BL-17-20117', 'craon', 'MIL1-900', 'CR-170720-B', 48],
    ['25/09/2017', 'BL-17-20351', 'mayenne', 'PIC1-800', 'CR-170718-A', 48],
    ['09/10/2017', 'BL-17-20622', 'chateau-gontier', 'PIC2-800', 'CR-170905-A', 60],
    ['16/10/2017', 'BL-17-20740', 'evron', 'MILC-900', 'CR-170830-C', 36],
    ['06/11/2017', 'BL-17-21205', 'laval', 'PIC2-800', 'CR-170905-A', 60],
    ['13/11/2017', 'BL-17-21318', 'ernee', 'PICAR-800', 'CR-171003-A', 12],
    ['13/11/2017', 'BL-17-21321', 'meslay', 'PIC1-800', 'CR-171012-B', 48],
    ['27/11/2017', 'BL-17-21560', 'craon', 'MIL2-900', 'CR-171010-C', 24],
  ],
};

// ENT-14.2 — entraînement, vendredi 22 décembre 2017 : l'avis du 21 décembre donne une RÈGLE (fabriqué à Craon depuis le 15/02/2017).
export const D142 = {
  code: 'ENT-14.2', jour: { iso: '2017-12-22', lib: 'vendredi 22 décembre 2017' },
  avis: { date: '21/12/2017', mode: 'regle' },
  receptions: [
    ['05/09/2017', 'REC-17-0915', 'PIC1-800', 'CR-170131-A', 96],
    ['05/09/2017', 'REC-17-0915', 'MIL1-900', 'CR-170622-B', 96],
    ['03/10/2017', 'REC-17-1012', 'PIC2-800', 'CR-170214-C', 72],
    ['03/10/2017', 'REC-17-1012', 'MILC-900', 'CR-170811-A', 72],
    ['07/11/2017', 'REC-17-1109', 'PICAR-800', 'CR-170302-B', 48],
    ['07/11/2017', 'REC-17-1109', 'MIL2-900', 'CR-170207-A', 96],
    ['04/12/2017', 'REC-17-1203', 'PIC1-800', 'CR-171109-A', 144],
    ['04/12/2017', 'REC-17-1203', 'MIL1-900', 'CR-171115-C', 96],
  ],
  expeditions: [
    ['12/09/2017', 'BL-17-20212', 'laval', 'MIL1-900', 'CR-170622-B', 48],
    ['12/09/2017', 'BL-17-20215', 'ernee', 'PIC1-800', 'CR-170131-A', 48],
    ['10/10/2017', 'BL-17-20688', 'evron', 'MIL1-900', 'CR-170622-B', 48],
    ['10/10/2017', 'BL-17-20690', 'laval', 'PIC1-800', 'CR-170131-A', 48],
    ['16/10/2017', 'BL-17-20755', 'mayenne', 'MILC-900', 'CR-170811-A', 36],
    ['17/10/2017', 'BL-17-20771', 'ernee', 'PIC2-800', 'CR-170214-C', 36],
    ['14/11/2017', 'BL-17-21340', 'craon', 'PICAR-800', 'CR-170302-B', 24],
    ['14/11/2017', 'BL-17-21342', 'meslay', 'MIL2-900', 'CR-170207-A', 48],
    ['11/12/2017', 'BL-17-21802', 'chateau-gontier', 'PIC1-800', 'CR-171109-A', 48],
  ],
};

// ENT-14.3 — erreur induite, mercredi 27 décembre 2017 : Théo a traité l'avis du 21 décembre le 22, mais il a lu « depuis le 15 février » comme
// « après le 15 février » et a oublié le lot fabriqué le 15. Ses blocages sont faits (justes) ; le lot oublié est parti le 26/12, APRÈS l'avis.
export const D143 = {
  code: 'ENT-14.3', jour: { iso: '2017-12-27', lib: 'mercredi 27 décembre 2017' },
  avis: { date: '21/12/2017', mode: 'regle' },
  collegue: 'Théo',
  traite: '22/12/2017',
  oublie: 'CR-170215-B',
  receptions: [
    ['06/09/2017', 'REC-17-0918', 'MIL1-900', 'CR-170209-A', 96],
    ['06/09/2017', 'REC-17-0918', 'PIC1-800', 'CR-170704-C', 144],
    ['03/10/2017', 'REC-17-1014', 'PIC2-800', 'CR-170215-B', 96],
    ['03/10/2017', 'REC-17-1014', 'MIL2-900', 'CR-170823-A', 72],
    ['08/11/2017', 'REC-17-1111', 'PICAR-800', 'CR-170210-C', 48],
    ['08/11/2017', 'REC-17-1111', 'MILC-900', 'CR-171002-B', 72],
  ],
  expeditions: [
    ['13/09/2017', 'BL-17-20240', 'evron', 'MIL1-900', 'CR-170209-A', 48],
    ['13/09/2017', 'BL-17-20243', 'mayenne', 'PIC1-800', 'CR-170704-C', 72],
    ['16/10/2017', 'BL-17-20760', 'laval', 'PIC2-800', 'CR-170215-B', 24],
    ['17/10/2017', 'BL-17-20777', 'mayenne', 'MIL2-900', 'CR-170823-A', 36],
    ['15/11/2017', 'BL-17-21360', 'craon', 'PICAR-800', 'CR-170210-C', 24],
    ['20/11/2017', 'BL-17-21455', 'meslay', 'MILC-900', 'CR-171002-B', 24],
    ['26/12/2017', 'BL-17-22020', 'ernee', 'PIC2-800', 'CR-170215-B', 24],
  ],
};

// ENT-14.4 — évaluation (copie rendue), vendredi 22 décembre 2017, 14 h : l'avis est arrivé la veille au soir et personne ne l'a encore traité ;
// les camions de 6 h sont partis. Jeu neuf : borne du 15 février des deux côtés, un lot parti en entier, un magasin livré ce matin.
export const D144 = {
  code: 'ENT-14.4', jour: { iso: '2017-12-22', lib: 'vendredi 22 décembre 2017' },
  avis: { date: '21/12/2017', mode: 'regle' },
  urgent: true,
  receptions: [
    ['04/09/2017', 'REC-17-0907', 'MILC-900', 'CR-170128-B', 72],
    ['04/09/2017', 'REC-17-0907', 'PIC2-800', 'CR-170615-A', 120],
    ['02/10/2017', 'REC-17-1005', 'PIC1-800', 'CR-170214-A', 96],
    ['02/10/2017', 'REC-17-1005', 'MIL1-900', 'CR-170215-C', 96],
    ['06/11/2017', 'REC-17-1102', 'MIL2-900', 'CR-170920-B', 72],
    ['06/11/2017', 'REC-17-1102', 'PICAR-800', 'CR-170112-A', 48],
    ['05/12/2017', 'REC-17-1201', 'PIC1-800', 'CR-171102-C', 144],
    ['05/12/2017', 'REC-17-1201', 'MILC-900', 'CR-171108-A', 72],
  ],
  expeditions: [
    ['11/09/2017', 'BL-17-20120', 'craon', 'MILC-900', 'CR-170128-B', 36],
    ['11/09/2017', 'BL-17-20124', 'evron', 'PIC2-800', 'CR-170615-A', 60],
    ['09/10/2017', 'BL-17-20630', 'evron', 'PIC2-800', 'CR-170615-A', 60],
    ['09/10/2017', 'BL-17-20633', 'laval', 'PIC1-800', 'CR-170214-A', 48],
    ['16/10/2017', 'BL-17-20748', 'mayenne', 'MIL1-900', 'CR-170215-C', 48],
    ['13/11/2017', 'BL-17-21310', 'ernee', 'MIL2-900', 'CR-170920-B', 24],
    ['13/11/2017', 'BL-17-21314', 'meslay', 'PICAR-800', 'CR-170112-A', 24],
    ['11/12/2017', 'BL-17-21810', 'craon', 'PIC1-800', 'CR-170214-A', 24],
    ['22/12/2017', 'BL-17-22004', 'chateau-gontier', 'PIC1-800', 'CR-171102-C', 48],
  ],
};

// ─────────────────────────────────────────── ce qui se déduit d'un jeu (jamais écrit à la main dans les données)
const isoDe = (jjmmaaaa) => { const [j, m, a] = jjmmaaaa.split('/'); return `${a}-${m}-${j}`; };
export const tsDe = (jjmmaaaa, h = 8) => { const [a, m, j] = isoDe(jjmmaaaa).split('-').map(Number); return new Date(a, m - 1, j, h, 0).getTime(); };

// Les lots que l'avis vise, parmi tous les lots du monde (liste) ou parmi ceux qu'on lit (règle).
export function viseParAvis(D, lot) {
  if (D.avis.mode === 'liste') return D.avis.lots.some(([l]) => l === lot);
  return viseParLaRegle(lot);
}

// Le bilan d'un jeu : par lot reçu, la référence, reçu, parti (et chez qui), reste, et s'il est visé.
export function bilan(D) {
  const lots = D.receptions.map(([date, no, ref, lot, q]) => {
    const exp = D.expeditions.filter((e) => e[4] === lot);
    const parti = exp.reduce((t, e) => t + e[5], 0);
    return { lot, ref, recu: q, reception: no, dateReception: date, parti, reste: q - parti, vise: viseParAvis(D, lot),
      magasins: [...new Set(exp.map((e) => e[2]))], expeditions: exp };
  });
  const vises = lots.filter((l) => l.vise);
  const ordreMag = (ids) => MAGASINS.map((m) => m.id).filter((id) => ids.includes(id));
  const apres = D.expeditions.filter((e) => viseParAvis(D, e[4]) && isoDe(e[0]) >= isoDe(D.avis.date)).map((e) => e[2]);
  return {
    lots,
    vises: vises.map((l) => l.lot),
    aBloquer: vises.filter((l) => l.reste > 0).map((l) => ({ lot: l.lot, ref: l.ref, reste: l.reste })),
    partis: vises.reduce((t, l) => t + l.parti, 0),
    restant: vises.reduce((t, l) => t + l.reste, 0),
    magasins: ordreMag([...new Set(vises.flatMap((l) => l.magasins))]),
    apres: ordreMag([...new Set(apres)]),
  };
}

// ENT-14.3 : ce que Théo a fait (le relevé et les blocages), et ce qu'il a oublié.
export function travailDeTheo(D) {
  const B = bilan(D);
  const siens = B.lots.filter((l) => l.vise && l.lot !== D.oublie);
  const oublie = B.lots.find((l) => l.lot === D.oublie);
  const avantLui = (e) => isoDe(e[0]) <= isoDe(D.traite);
  const magTheo = [...new Set(siens.flatMap((l) => l.expeditions.filter(avantLui).map((e) => e[2])))];
  const magOublie = [...new Set(oublie.expeditions.map((e) => e[2]))];
  return {
    lots: siens.map((l) => l.lot),
    // Théo a bloqué, le 22/12, ce qui restait de ses lots ce jour-là.
    blocages: siens.filter((l) => l.reste > 0).map((l) => ({ lot: l.lot, ref: l.ref, q: l.reste })),
    magasins: MAGASINS.map((m) => m.id).filter((id) => magTheo.includes(id)),
    oublie: oublie.lot, refOublie: oublie.ref, resteOublie: oublie.reste,
    // Les magasins qui ont reçu le lot oublié et que Théo n'a pas prévenus.
    magasinsOublies: MAGASINS.map((m) => m.id).filter((id) => magOublie.includes(id) && !magTheo.includes(id)),
  };
}
