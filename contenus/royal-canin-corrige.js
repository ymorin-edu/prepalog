// Les corrigés des séances Royal Canin (ENT-16.1 à 16.5) : tout se recalcule depuis les données (`contenus/royal-canin-donnees.js`). N'importe que des
// données pures : se charge aussi sous Node.

import { REF, JOURS, OBJECTIF_COUVERTURE, CAPACITE_CANAL, ZONES, indicateurs, implantation, preparationExport, fdate, nombreFr as n } from './royal-canin-donnees.js';

const pts = (x) => `${n(x)} point${x >= 2 ? 's' : ''}`;
const et = (L) => (L.length ? L.join(', ') : 'aucune');

export function corrigeRoyalCanin(D, { titre, K, poids: W, questions }) {
  const items = [];
  let k = 0;
  const it = (etapeTitre, texte, rep, note = '') => items.push({ etape: ++k, etapeTitre, genre: 'question', texte, rep, note });
  if (K.ind) {
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
  return { code: D.code, titre, trame: '(pas de trame : tout se fait à l’écran)', items };
}
