// Les corrigés des séances Royal Canin (ENT-16.1 à 16.6) : tout se recalcule depuis les données (`contenus/royal-canin-donnees.js`). N'importe que des
// données pures : se charge aussi sous Node.

import { REF, JOURS, OBJECTIF_COUVERTURE, CAPACITE_CANAL, ZONES, indicateurs, implantation, preparationExport, fdate, nombreFr as n } from './royal-canin-donnees.js';

const pts = (x) => `${n(x)} point${x >= 2 ? 's' : ''}`;
const et = (L) => (L.length ? L.join(', ') : 'aucune');

// Au tableur (`tab` : `stockAuTableur`, `jalonsTab` : les jalons et leurs poids) : les formules attendues, et les valeurs quand le jeu est le même pour tous.
function itemsTableur(it, D, tab, jalonsTab, W) {
  const p = (id) => { const j = jalonsTab.find((x) => x.id === id); return j ? j.poids : 0; };
  if (tab.filtre) it(`Le bon export (${pts(W.export)})`, 'Extractions, critère « Site »', 'Site = Aimargues : les lignes de Cambrai ne sont pas les nôtres.', 'Une erreur d’export ne se paie qu’une fois : le fichier se corrige contre l’export que l’élève a fait.');
  it(`Les formules (${pts(['moyen', 'rotation', 'conso', 'couverture'].reduce((t, x) => t + p(x), 0))})`, 'Stock moyen, rotation, consommation par jour, couverture',
    `Stock moyen =(début+fin)/2 · Rotation =sorties/stock moyen · Conso par jour =sorties/${JOURS} · Couverture =stock fin/conso par jour, recopiées vers le bas.`,
    'Un nombre tapé à la main est refusé : la formule est exigée.');
  it(`L’alerte (${pts(p('alerte'))})`, 'Fonction SI', `=SI(couverture<délai;"Rupture";SI(couverture>${OBJECTIF_COUVERTURE};"Surstock";"OK"))`,
    'Une couverture égale au délai n’est pas une rupture (les jeux n’en ont aucune à moins d’une demi-journée du délai).');
  it(`Le taux de service (${pts(p('service'))})`, 'Feuille « Commandes »', '=complètes/commandées, au format pourcentage (sans ×100).');
  if (D.ind) {
    const I = indicateurs(D);
    it('Les valeurs (le même jeu pour tous)', `Couverture comparée au délai ; surstock au-delà de ${OBJECTIF_COUVERTURE} jours`,
      `Ruptures : ${et(I.rupture)} (la plus urgente : ${I.urgente}) · surstocks : ${et(I.surstock)} · taux de service ${n(I.service)} %.`,
      D.ind.map(([r]) => `${r} rotation ${n(I.par[r].rotation)}, ${n(I.par[r].couverture)} j / ${I.par[r].delai} j`).join(' · '));
  } else {
    it('Les valeurs', 'Tirées pour chaque élève', 'Voir le corrigé de l’élève (ses ruptures, ses surstocks, son taux de service).');
  }
}

// Le corrigé d'UN élève, pour une séance dont les valeurs sont tirées : ses indicateurs, calculés depuis son tirage.
export function corrigeTableurEleve(tab, base) {
  const J = tab.jeu(base), I = tab.I(base);
  return { texte: 'Les indicateurs de cet élève (calculés depuis son tirage).', items: [
    ...J.ind.map(([r]) => ({ genre: 'fait', texte: `${r} — ${REF[r].nom}`,
      rep: `rotation ${n(I.par[r].rotation)} · couverture ${n(I.par[r].couverture)} j pour ${I.par[r].delai} j de délai · ${I.rupture.includes(r) ? 'Rupture' : I.surstock.includes(r) ? 'Surstock' : 'OK'}` })),
    { genre: 'fait', texte: 'Taux de service', rep: `${n(J.lignes.completes)} ÷ ${n(J.lignes.commandees)} = ${n(I.service)} %` },
    { genre: 'fait', texte: 'La rupture la plus urgente', rep: I.urgente || 'aucune' },
  ] };
}

export function corrigeRoyalCanin(D, { titre, K, poids: W, questions, tab = null, jalonsTab = [] }) {
  const items = [];
  let k = 0;
  const it = (etapeTitre, texte, rep, note = '') => items.push({ etape: ++k, etapeTitre, genre: 'question', texte, rep, note });
  if (K.ind && tab) itemsTableur(it, D, tab, jalonsTab, W);
  else if (K.ind) {
    const I = indicateurs(D);
    for (const r of D.calcul) {
      const [, deb, fin, sorties, delai] = D.ind.find((x) => x[0] === r);
      const P = I.par[r];
      it(`${r} (${pts(W.rotation)} + ${pts(W.couverture)})`, 'Rotation et couverture',
        `Stock moyen (${n(deb)} + ${n(fin)}) ÷ 2 = ${n(P.sm)} ; rotation ${n(sorties)} ÷ ${n(P.sm)} = ${n(P.rotation)} · consommation ${n(sorties)} ÷ ${JOURS} = ${n(P.conso)} par jour ;`
        + ` couverture ${n(fin)} ÷ ${n(P.conso)} = ${n(P.couverture)} jours (délai ${delai} j).`);
    }
    it(`Ruptures et surstocks (${pts(W.rupture)} + ${pts(W.surstock)})`, `Couverture < délai : risque de rupture ; couverture > ${OBJECTIF_COUVERTURE} j : surstock`,
      `Risque de rupture : ${et(I.rupture)} · surstock : ${et(I.surstock)}.`,
      D.ind.map(([r]) => `${r} ${n(I.par[r].couverture)} j / ${I.par[r].delai} j`).join(' · '));
    it(`Le taux de service (${pts(W.service)})`, 'Lignes complètes ÷ lignes commandées × 100', `${n(D.lignes.completes)} ÷ ${n(D.lignes.commandees)} × 100 = ${n(I.service)} %.`);
  }
  if (K.impl) {
    const M = implantation(D);
    it(`La zone de picking (${pts(W.zone)} par référence)`, 'La première ligne de la règle qui convient : moins de 5 colis → réserve ; sinon 8 kg ou plus → sol ; sinon canal',
      D.impl.map(([r, c]) => `${r} (${c} colis/j, ${REF[r].kg} kg) → ${ZONES[M.zones[r]]}`).join(' · '));
    if ((D.reappro || []).length) it(`Les réappros (${pts(W.reappro)} par canal)`, `Colis par jour ÷ ${CAPACITE_CANAL}, arrondi au-dessus`,
      D.reappro.map((r) => { const c = D.impl.find((x) => x[0] === r)[1]; return `${r} : ${c} ÷ ${CAPACITE_CANAL} = ${n(c / CAPACITE_CANAL)} → ${M.reappros[r]}`; }).join(' · '));
  }
  if (K.export) {
    const E = D.export, X = preparationExport(E);
    if (D.collegue) {
      it(`La préparation de ${D.collegue} (${pts(W.nonconformes)} + ${pts(W.cause)})`, 'Les lots trop courts et la cause',
        `Limite : ${fdate(E.aujourdhui)} + ${E.exigeMois} mois = ${fdate(X.limite)}. ${D.collegue} a pris ${X.fifo.map(([l, q]) => `${l} (${q})`).join(', ')} en FIFO ;`
        + ` non conformes : ${X.fifoNonConformes.join(', ')}. Cause : FIFO sans vérifier la DDM exigée.`);
    }
    it(`La commande export (${pts(W.lots)} + ${pts(W.quantites)})`, `FEFO parmi les lots dont la DDM est au ${fdate(X.limite)} ou après`,
      `${X.prises.map(([l, q]) => `${q} palette${q > 1 ? 's' : ''} du lot ${l}`).join(' + ')} (= ${E.palettes} palettes).`,
      `Écartés : ${X.nonConformes.join(', ')} (trop courts pour ce client).`);
  }
  it(`Le compte rendu (${pts(W['compte-rendu'])})`, 'Les phrases justes', 'Les lignes qui reprennent exactement la fiche · « Bonjour Sandrine, » et « Bonne journée, … » (non notées).');
  it('Les questions', questions.texte, questions.rep, questions.note || '');
  return { code: D.code, titre, trame: tab ? '(pas de trame : tout se fait à l’écran et dans le tableur)' : '(pas de trame : tout se fait à l’écran)', items };
}
