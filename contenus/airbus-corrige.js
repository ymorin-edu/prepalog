// Les corrigés des séances Airbus Helicopters (ENT-18.1 à 18.5) : tout se recalcule depuis les données (`contenus/airbus-donnees.js`). N'importe que des
// données pures : se charge aussi sous Node.

import { PRESTAS, PRESTA, volumetrique, offre, bilan, travailDeSofiane, nombreFr as n } from './airbus-donnees.js';

const pts = (x) => `${n(x)} point${x >= 2 ? 's' : ''}`;
const nom = (p) => PRESTA[p].nom.split(' (')[0];

export function corrigeAirbus(D, { titre, poids: W, questions }) {
  const B = bilan(D);
  const items = [];
  let k = 0;
  const it = (etapeTitre, texte, rep, note = '') => items.push({ etape: ++k, etapeTitre, genre: 'question', texte, rep, note });
  if (D.collegue) {
    const J = travailDeSofiane(D);
    it(`Les réservations de ${D.collegue} (${pts(W.erreurs)} + ${pts(W.cause)})`, 'Mauvais prestataire ou coût faux',
      J.faux.map((no) => `${no} : ${nom(D.choixCollegue[no])}, ${n(J.couts[no])} € → ${nom(B.presta[no])}, ${n(B.off[no].cout)} €`).join(' · '),
      `Cause : il prend le poids réel (jamais le volumétrique) et le moins cher même pour un hélicoptère au sol.`);
  }
  it(`Les prestataires (${pts(W.presta)} par colis)`, 'Possibles = acceptent le colis et livrent à temps ; AOG → le plus rapide ; sinon → le moins cher',
    D.expeditions.map((E) => {
      const possibles = PRESTAS.filter((p) => offre(E, p.id).ok).map((p) => `${nom(p.id).toLowerCase()} ${n(offre(E, p.id).cout)} €`);
      const exclus = PRESTAS.filter((p) => !offre(E, p.id).ok).map((p) => `${nom(p.id).toLowerCase()} (${offre(E, p.id).pourquoi})`);
      return `${E.no}${E.aog ? ' (AOG)' : ''} : ${possibles.join(', ')}${exclus.length ? ` — exclus : ${exclus.join(', ')}` : ''} → ${nom(B.presta[E.no])}`;
    }).join(' · '));
  for (const no of D.calcul || D.expeditions.map((E) => E.no)) {
    const E = D.expeditions.find((x) => x.no === no), p = B.presta[no], P = PRESTA[p], o = B.off[no];
    const md = E.danger && P.md ? ` + ${P.md} € (marchandise dangereuse)` : '';
    it(`${no} (${o.taxable != null ? `${pts(W[`tax-${no}`] ?? W.tax)} + ` : ''}${pts(W[`cout-${no}`] ?? W.cout)})`, `${nom(p)}`,
      o.taxable != null
        ? `Volumétrique ${E.colis.L} × ${E.colis.l} × ${E.colis.h} ÷ ${n(P.diviseur)} = ${n(volumetrique(E.colis, p))} kg ; réel ${n(E.colis.kg)} kg → taxable ${o.taxable} kg ; `
          + `${n(P.parKg)} × ${o.taxable} = ${n(P.parKg * o.taxable)} €${P.parKg * o.taxable < P.minimum ? ` → minimum ${P.minimum} €` : ''}${md}${o.cout !== P.parKg * o.taxable ? ` = ${n(o.cout)} €` : ''}.`
        : `${n(P.parKm)} € × ${n(E.km)} km = ${n(P.parKm * E.km)} €${P.minimum && P.parKm * E.km < P.minimum ? ` → minimum ${P.minimum} €` : ''}${md}${o.cout !== P.parKm * E.km ? ` = ${n(o.cout)} €` : ''}.`);
  }
  if (B.danger.length) it(`La marchandise dangereuse (${pts(W.danger)})`, 'Déclaration et étiquette, préparées par l’expéditeur', `${B.danger.join(', ')} (batterie lithium-ion, classe 9).`);
  it(`Le compte rendu (${pts(W['compte-rendu'])})`, 'Les phrases justes', 'Les lignes qui reprennent exactement la fiche · « Bonjour Nathalie, » et « Bonne journée, … » (non notées).');
  it('Les questions', questions.texte, questions.rep, questions.note || '');
  return { code: D.code, titre, trame: '(pas de trame : tout se fait à l’écran)', items };
}
