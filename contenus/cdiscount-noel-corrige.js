// Les corrigés des séances Cdiscount « pic de Noël » (ENT-2.7 à 2.10) : tout se recalcule depuis les données (`contenus/cdiscount-noel-donnees.js`).
// N'importe que des données pures : se charge aussi sous Node.

import { abc, implantation, preparation, effectif, distanceDe, empDe, nombreFr as n } from './cdiscount-noel-donnees.js';

const pts = (x) => `${n(x)} point${x >= 2 ? 's' : ''}`;

export function corrigeNoel(D, { titre, poids: W, K, questions }) {
  const items = [];
  let k = 0;
  const it = (etapeTitre, texte, rep, note = '') => items.push({ etape: ++k, etapeTitre, genre: 'question', texte, rep, note });
  if (K.abc) {
    const A = abc(D), I = implantation(D);
    let cumul = 0;
    const suite = A.tri.slice(0, A.classeA.length + 1).map(([r, x]) => { cumul += x; return `${r} ${x} (${n(Math.round(cumul * 1000 / A.total) / 10)} %)`; }).join(' · ');
    it(`La classe A (${pts(W.classeA)} + ${pts(W.pctLignes)}${W.pctRefs ? ` + ${pts(W.pctRefs)}` : ''})`, 'Trier, additionner, s’arrêter à 80 %',
      `Classe A : ${A.classeA.join(', ')} — ${n(A.lignesA)} lignes sur ${n(A.total)} = ${n(A.pctLignes)} % des lignes, ${A.classeA.length} références sur ${A.tri.length} = ${n(A.pctRefs)} %.`,
      `Cumul dans l’ordre : ${suite}.`);
    it(`L’implantation (${K.places ? `${pts(W.m1)} par emplacement` : pts(W.emplacements)}${K.marche ? ` + ${pts(W.avant)} + ${pts(W.apres)}` : ''})`, 'Au plus près du poste',
      A.classeA.map((r) => `${r} en ${I.places[r]} (${distanceDe(D, I.places[r])} m, aujourd’hui ${empDe(D, r)} à ${distanceDe(D, empDe(D, r))} m)`).join(' · '),
      K.marche ? `Marche de la semaine (2 × lignes × distance) : avant ${A.classeA.map((r) => `2 × ${D.lignes[r]} × ${distanceDe(D, empDe(D, r))}`).join(' + ')} = ${n(I.avant)} m ; `
        + `après ${A.classeA.map((r) => `2 × ${D.lignes[r]} × ${distanceDe(D, I.places[r])}`).join(' + ')} = ${n(I.apres)} m.` : '');
  }
  if (K.prep) {
    const P = preparation(D);
    it(`La méthode (${pts(W.cmd)} + ${pts(W.lots)}${K.minutes ? ` + ${pts(W.marche)} + ${pts(W.tri)}` : ''} + ${pts(W.methode)})`, 'Commande par commande ou par lots',
      `Commande par commande : ${P.parCommande.map((x) => x[1]).join(' + ')} = ${n(P.cmd)} m · par lots de ${D.chariot} : ${P.parLot.map((x) => x[1]).join(' + ')} = ${n(P.lot)} m`
        + `${K.minutes ? ` · marche gagnée ${n(P.cmd - P.lot)} s = ${n(P.marche)} min · tri ${P.nLignes} lignes × ${D.tri} s = ${n(P.tri)} min` : ''} · méthode : ${P.methode === 'lots' ? 'par lots' : 'commande par commande'} (gain net ${n(P.gainNet)} min).`,
      'Une tournée = 2 × la plus grande distance d’aller (on passe devant les autres emplacements).');
  }
  if (K.eff) {
    const E = effectif(D);
    it(`L’effectif (${K.erreurs ? `${pts(W.erreurs)} + ` : ''}${pts(W.besoin)} + ${pts(W.interim)}${K.retard ? ` + ${pts(W.retard)}` : ''})`, 'Lignes ÷ (productivité × heures), arrondi au-dessus',
      `${n(D.prevision.lignes)} ÷ (${D.productivite} × ${D.heures}) = ${n(Math.round(E.brut * 100) / 100)} → ${E.besoin} préparateurs ; ${E.besoin} − ${D.permanents} = ${E.interim} intérimaires.`
        + (E.collegue ? ` Erreurs de ${D.collegue} : les colis au lieu des lignes, l’arrondi vers le bas (${E.collegue.besoin} préparateurs, ${E.collegue.interim} intérimaires). `
          + `Avec ${E.collegue.besoin} préparateurs : ${n(D.prevision.lignes)} − ${E.collegue.besoin} × ${E.parPrep} = ${n(E.retard)} lignes en retard.` : ''),
      D.collegue ? 'Pas d’erreur sur la productivité, la durée du poste ni les permanents.' : `Piège : la prévision donne aussi ${n(D.prevision.colis)} colis.`);
  }
  it(`La proposition à Nadia (${pts(W['compte-rendu'])})`, 'Les phrases justes', 'Les lignes qui reprennent exactement la fiche · « Bonjour Nadia, » et « Bonne journée, … » (non notées).');
  it('Les questions', questions.texte, questions.rep, questions.note || '');
  return { code: D.code, titre, trame: '(pas de trame : tout se fait à l’écran)', items };
}
