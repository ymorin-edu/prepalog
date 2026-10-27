// Les corrigés des séances Syngenta (ENT-15.1 à 15.4) : tout se recalcule depuis les données (`contenus/syngenta-donnees.js`). N'importe que des données
// pures : se charge aussi sous Node.

import { bilan, travailDeLucas, PRODUIT, CELLULE, ATTENTE, litres, nombreFr as n } from './syngenta-donnees.js';

const pts = (x) => `${n(x)} point${x >= 2 ? 's' : ''}`;
const ou = (c) => (c === ATTENTE ? 'zone d’attente' : `cellule ${c.slice(1)}`);

export function corrigeSyngenta(D, { titre, poids: W, questions }) {
  const B = bilan(D);
  const items = [];
  let k = 0;
  const it = (etapeTitre, texte, rep, note = '') => items.push({ etape: ++k, etapeTitre, genre: 'question', texte, rep, note });
  const calc = (c) => {
    const ajout = D.palettes.filter((p) => B.rangement[p[0]] === c);
    const part = CELLULE[c].inflammable ? 50 : 20;
    return `${CELLULE[c].nom} : ${n(D.etat[c][0])} L${ajout.map((p) => ` + ${n(litres(p))}`).join('')} = ${n(B.volumes[c])} L ; ${part} % = ${n(Math.round(B.volumes[c] * part / 100))} L`
      + ` → rétention ${n(B.retentions[c])} L${B.retentions[c] === 800 ? ' (minimum de 800 L)' : ''} ; installée ${n(D.etat[c][2])} L : ${B.suffit[c] ? 'suffit' : 'NE suffit PAS'}.`;
  };
  if (D.collegue) {
    const L = travailDeLucas(D);
    it(`Les palettes mal rangées (${pts(W.erreurs)})`, `Le plan de ${D.collegue}`,
      L.faux.map((p) => { const r = D.palettes.find((x) => x[0] === p)[1]; return `${p} (${r}, ${PRODUIT[r].pictos.join(' + ')}) : ${ou(D.planCollegue[p])} → ${ou(B.rangement[p])}`; }).join(' · '),
      'Les autres palettes du plan sont bien rangées.');
    it(`La rétention de la cellule 1 (${pts(W.cause)} + ${pts(W['vol-C1'])} + ${pts(W['ret-C1'])} + ${pts(W['suf-C1'])})`, 'Refaire le calcul',
      `Erreur : 20 % au lieu de 50 %. ${calc('C1')}`, `${D.collegue} : ${n(L.volC1)} L × 20 % → ${n(L.retC1)} L, « OK ».`);
  } else {
    it(`Le rangement (${pts(W.palette)} par palette)`, 'La cellule du danger le plus fort, dans l’ordre des numéros',
      D.palettes.map(([p, r]) => `${p} ${r} (${PRODUIT[r].pictos.join(' + ')}) → ${ou(B.rangement[p])}`).join(' · '),
      B.attente.length ? `Cellule pleine : ${B.attente.join(', ')} en zone d’attente (jamais dans une autre cellule).` : '');
    it('La rétention', 'Volume stocké après rangement, puis 50 % (cellule 1) ou 20 %, 800 L au moins', D.retention.map(calc).join(' '));
  }
  it(`Le compte rendu (${pts(W['compte-rendu'])})`, 'Les phrases justes', 'Les lignes qui reprennent exactement la fiche · « Bonjour Karim, » et « Bonne journée, … » (non notées).');
  it('Les questions', questions.texte, questions.rep, questions.note || '');
  return { code: D.code, titre, trame: '(pas de trame : tout se fait à l’écran)', items };
}
