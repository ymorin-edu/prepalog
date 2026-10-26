// Les corrigés des séances Lactalis (ENT-14.1 à 14.4) : tout se recalcule depuis les données (`contenus/lactalis-donnees.js`). N'importe que des données
// pures : se charge aussi sous Node.

import { bilan, travailDeTheo, MAGASIN, ARTICLE, dateDuLot, fdateIso } from './lactalis-donnees.js';

const noms = (ids) => ids.map((id) => MAGASIN[id].nom).join(', ') || 'aucun';
const lotTxt = (l) => `${l.lot} (${ARTICLE[l.ref].designation}, fabriqué le ${fdateIso(dateDuLot(l.lot))})`;

export function corrigeLactalis(D, { titre, poids: W, questions }) {
  const B = bilan(D);
  const items = [];
  let k = 0;
  const it = (etapeTitre, texte, rep, note = '') => items.push({ etape: ++k, etapeTitre, genre: 'question', texte, rep, note });
  if (D.collegue) {
    const T = travailDeTheo(D);
    const L = B.lots.find((l) => l.lot === T.oublie);
    it(`Le lot oublié (${W.oublies} points) et sa cause (${W.pourquoi})`, 'Ce que le relevé a oublié',
      `${lotTxt(L)} : fabriqué le 15, il est visé (« depuis le 15 février » comprend le 15). Cause : la borne lue comme « après le 15 février ».`,
      `Lots du relevé de ${D.collegue} : ${T.lots.join(', ')}.`);
    it(`Les magasins (${W.magasins} + ${W.apres} points)`, 'Pas prévenus, et livrés après l’avis',
      `Pas prévenus : ${noms(T.magasinsOublies)} · livré après l’avis du ${D.avis.date} : ${noms(B.apres)}.`,
      `${D.collegue} avait prévenu : ${noms(T.magasins)}.`);
    it(`Ce qui reste et le blocage (${W.reste} + ${W.bloque} + ${W['rien-de-trop']} points)`, 'Le lot oublié',
      `Reste ${T.resteOublie} boîtes (${L.recu} reçues − ${L.parti} parties) : bloquer ${T.resteOublie} boîtes de ${T.refOublie} sur le lot ${T.oublie}, rien d’autre.`,
      'Les blocages de Théo sont déjà faits ; aucun autre lot ne doit être bloqué par l’élève.');
  } else {
    it(`Les lots visés (${W.lots} points)`, D.avis.mode === 'liste' ? 'Les lots de l’avis passés chez nous' : 'Les lots reçus que la règle vise',
      B.lots.filter((l) => l.vise).map(lotTxt).join(' · '),
      D.avis.mode === 'liste' ? 'Les autres lots de l’avis ne sont jamais entrés : rien à faire pour eux.'
        : `Pas visés (fabriqués avant le 15/02/2017) : ${B.lots.filter((l) => !l.vise).map((l) => l.lot).join(', ')}.`);
    it(`Les magasins et les boîtes parties (${W.magasins} + ${W.partis}${D.urgent ? ` + ${W.apres}` : ''} points)`, 'L’aval',
      `Magasins : ${noms(B.magasins)} · boîtes parties : ${B.partis}${D.urgent ? ` · livré après l’avis : ${noms(B.apres)}` : ''}.`,
      B.lots.filter((l) => l.vise).map((l) => `${l.lot} : ${l.parti} parties`).join(' · '));
    it(`Ce qui reste et le blocage (${W.restant} + ${W.bloque} par lot + ${W['rien-de-trop']} points)`, 'Le stock bloqué',
      `${B.restant} boîtes en tout : ${B.aBloquer.map((x) => `${x.reste} de ${x.ref} sur le lot ${x.lot}`).join(' · ')}.`,
      'Un lot visé parti en entier n’a rien à bloquer (mais ses magasins sont à prévenir) ; un autre lot de la même référence reste vendable.');
  }
  it(`Le compte rendu (${W['compte-rendu']} point${W['compte-rendu'] > 1 ? 's' : ''})`, 'Les phrases justes',
    'Les lignes qui reprennent exactement le relevé (lots, boîtes bloquées, magasins' + (D.urgent || D.collegue ? ', magasin livré après l’avis' : '') + ') · « Madame, Monsieur, » et « Cordialement, … » (non notées).');
  it('Les questions', questions.texte, questions.rep, questions.note || '');
  return { code: D.code, titre, trame: '(pas de trame : tout se fait à l’écran)', items };
}
