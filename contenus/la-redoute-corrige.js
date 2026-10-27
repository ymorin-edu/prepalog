// Les corrigés des séances La Redoute (ENT-17.1 à 17.5) : tout se recalcule depuis les données (`contenus/la-redoute-donnees.js`). N'importe que des
// données pures : se charge aussi sous Node.

import { FORMAT, ARTICLES, CALAGE, AVANT, FILIERES, volArticles, volUtile, avantDe, emballage, retours, travailDeJulien, nombreFr as n } from './la-redoute-donnees.js';

const pts = (x) => `${n(x)} point${x >= 2 ? 's' : ''}`;

export function corrigeLaRedoute(D, { titre, K, poids: W, questions }) {
  const items = [];
  let k = 0;
  const it = (etapeTitre, texte, rep, note = '') => items.push({ etape: ++k, etapeTitre, genre: 'question', texte, rep, note });
  if (K.emb) {
    const E = emballage(D);
    it(`Les emballages (${pts(W.format)} par commande)`, `Volume utile (articles + ${CALAGE} L par fragile) → le plus petit format ; pochette si tout est souple`,
      D.commandes.map(([c, L]) => `${c} : ${n(volArticles(L))} L${volUtile(L) !== volArticles(L) ? ` + calage = ${n(volUtile(L))} L` : ''}${L.every((a) => ARTICLES[a].souple) ? ', souple' : ''} → ${FORMAT[E.formats[c]].nom}`).join(' · '));
    it(`Le taux de vide (${pts(W.vide)} par commande)`, '(volume du format − volume des articles) ÷ volume du format × 100',
      D.vide.map((c) => { const L = D.commandes.find((x) => x[0] === c)[1], f = FORMAT[E.formats[c]]; return `${c} : (${f.litres} − ${n(volArticles(L))}) ÷ ${f.litres} × 100 = ${n(E.vides[c])} %`; }).join(' · '),
      'Le calage compte comme du vide.');
    it(`Le poids et l’économie (${pts(W.apres)} + ${pts(W.gain)})`, `Avec les formats choisis, puis par rapport au carton ${AVANT} pour tout`,
      `Après : ${D.commandes.map(([c]) => FORMAT[E.formats[c]].grammes).join(' + ')} = ${n(E.apres)} g · avant : ${D.commandes.map(([, L]) => FORMAT[avantDe(L)].grammes).join(' + ')} = ${n(E.avant)} g · économie ${n(E.gain)} g.`);
  }
  if (K.ret) {
    const R = retours(D);
    if (D.collegue) {
      const J = travailDeJulien(D);
      it(`Le tri de ${D.collegue} (${pts(W.erreurs)} + ${pts(W.cause)})`, 'Les retours mal triés et ce qui fausse son taux',
        J.faux.map((r) => `${r} : ${FILIERES[D.triCollegue[r]]} → ${FILIERES[R.filieres[r]]}`).join(' · ') + ` · son taux (${n(J.taux)} %) compte les dons comme des ventes.`);
    } else {
      it(`Le tri des retours (${pts(W.filiere)} par retour)`, 'Neuf → stock ; essayé sans défaut → reconditionnement ; petit défaut → don ; hors d’usage → recyclage',
        D.retours.map(([r]) => `${r} → ${FILIERES[R.filieres[r]]}`).join(' · '));
    }
    it(`Le taux de remise en vente (${pts(W.taux)})`, '(remis en stock + reconditionnés) ÷ retours × 100',
      `${R.vendus} ÷ ${D.retours.length} × 100 = ${n(R.taux)} %.`, 'Un don n’est pas une vente.');
  }
  it(`Le compte rendu (${pts(W['compte-rendu'])})`, 'Les phrases justes', 'Les lignes qui reprennent exactement la fiche, et l’amélioration qui respecte la règle et la loi · « Bonjour Claire, » et « Bonne journée, … » (non notées).');
  it('Les questions', questions.texte, questions.rep, questions.note || '');
  return { code: D.code, titre, trame: '(pas de trame : tout se fait à l’écran)', items };
}
