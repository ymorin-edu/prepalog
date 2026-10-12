// Page d'ESSAI des dessins de l'allée de picking (chantier D-7, lot 2, 12/10/2026) : chaque objet nouveau du kit iso
// (`core/iso.js`, section « l'allée de picking ») dans ses états, puis une allée assemblée à la main. Rien n'est cliquable :
// l'allée jouable vient au lot 3, le montage des palettes au lot 4. Les contenus des tiroirs sont ceux du brief ENT-6.7 §4.

import * as K from '../core/iso.js';

// Un dessin : on le pose dans un <svg>, puis on recadre la vue sur ce qui a été dessiné.
function planche(hote, titre, legende, dessin, unite = 120) {
  const I = K.projection({ unite, origine: [400, 200] });
  const fig = document.createElement('figure');
  fig.className = 'kit-planche';
  fig.innerHTML = `<svg role="img" aria-label="${titre}">${K.DEFS}<rect class="kit-fond" fill="#f6f2e9"/>${dessin(I)}</svg>`
    + `<figcaption><b>${titre}</b> — ${legende}</figcaption>`;
  hote.append(fig);
  const sv = fig.querySelector('svg'), fond = sv.querySelector('.kit-fond');
  const bb = sv.getBBox(), m = 12;
  sv.setAttribute('viewBox', `${bb.x - m} ${bb.y - m} ${bb.width + 2 * m} ${bb.height + 2 * m}`);
  Object.entries({ x: bb.x - m, y: bb.y - m, width: bb.width + 2 * m, height: bb.height + 2 * m }).forEach(([k, v]) => fond.setAttribute(k, v));
}

// Les huit emplacements du brief (§4, étape 1).
const EMPL = {
  'A-T01': { type: 'casier', n: 8, capsule: 'bleu', designation: 'Eau minérale 1 L', code: '36' },
  'B-T01': { type: 'casier', n: 6, capsule: 'jaune', designation: 'Limonade 1 L', code: '58' },
  'A-T02': { type: 'fut', n: 5, litres: 20, bande: 'or', designation: 'Pelforth Blonde 20 L', code: '24' },
  'B-T02': { type: 'fut', n: 4, litres: 20, bande: 'bleu', designation: 'Edelweiss 20 L', code: '71' },
  'A-T03': { type: 'fut', n: 2, litres: 20, bande: 'cuivre', abimes: 1, designation: 'Affligem Blonde 20 L', lot: 'S18', code: '49' },
  'B-T03': { type: 'fut', n: 5, litres: 20, bande: 'cuivre', designation: 'Affligem Blonde 20 L', lot: 'S24', code: '83' },
  'A-T04': { type: 'fut', n: 7, litres: 30, bande: 'rouge', designation: 'Heineken 30 L', code: '17' },
  'B-T04': { type: 'fut', n: 0, litres: 20, bande: 'rouge', designation: 'Heineken 20 L', code: '62' },
};
const contenu = (e) => ({ type: e.type, n: e.n, litres: e.litres, bande: e.bande, capsule: e.capsule, abimes: e.abimes });

export function monter(hote) {
  planche(hote, 'Fûts', '20 L et 30 L, bande de marque ; le dernier est cabossé', (I) =>
    [['or', 20], ['bleu', 20], ['cuivre', 20], ['rouge', 30], ['gris', 30]].map(([b, l], k) => K.futDebout(I, k * .5, 0, 0, { bande: b, litres: l })).join('')
    + K.futDebout(I, 2.7, 0, 0, { bande: 'cuivre', litres: 20, abime: true }), 220);
  planche(hote, 'Casiers', 'pleins (capsules bleues, jaunes), vide (goulots ouverts, ENT-6.10), pile de trois', (I) =>
    K.casier(I, 0, 0, 0, { capsule: 'bleu' }) + K.casier(I, .55, 0, 0, { capsule: 'jaune' }) + K.casier(I, 1.1, 0, 0, { vide: true })
    + [0, 1, 2].map((n) => K.casier(I, 1.7, 0, n * K.CASIER.h, { vide: true })).join(''), 220);
  planche(hote, 'Travées, côté A', 'A-T01 (casiers), A-T03 (2 fûts dont 1 cabossé, devant), A-T04 (7 fûts, tiroir tiré vers l’allée) : tiroir en N1, N2-N3 vides',
    (I) => ['A-T01', 'A-T03', 'A-T04'].map((a, k) => K.traveePicking(I, k * 2.1, 0, { cote: 'A', contenu: contenu(EMPL[a]), sortie: a === 'A-T04' ? .35 : 0 })).join(''), 80);
  planche(hote, 'Travées, côté B', 'B-T03 (5 fûts rangés côté allée, derrière), B-T04 vide, en transparence comme dans l’allée',
    (I) => ['B-T03', 'B-T04'].map((a, k) => K.traveePicking(I, k * 2.1, 0, { cote: 'B', contenu: contenu(EMPL[a]), voile: .3 })).join(''), 80);
  planche(hote, 'Vue de près', 'A-T03, étages du dessus en transparence, étiquette de lisse avec le code (le fût cabossé devant)', (I) => {
    const e = EMPL['A-T03'];
    return K.traveePicking(I, 0, 0, { cote: 'A', contenu: contenu(e), voileHaut: .3,
      etiquette: { adresse: 'A-T03-N1', designation: e.designation, lot: e.lot, code: e.code } });
  }, 170);
  planche(hote, 'Palettes client', 'P1 juste (6 cases, film 4 tours, étiquettes avant + dessus) ; P2 fautive (fûts sur casiers, 2e couche, film 2 tours)', (I) => {
    const f = (l, b) => ({ type: 'fut', litres: l, bande: b }), c = { type: 'casier', capsule: 'bleu' };
    return K.paletteClient(I, 0, 0, { piles: [[f(30, 'rouge')], [f(30, 'rouge')], [f(30, 'rouge')], [f(20, 'or'), c], [f(20, 'or'), c], [f(20, 'cuivre'), c]], film: 4, etiquettes: ['avant', 'arriere', 'dessus'] })
      + K.paletteClient(I, 1.7, 0, { piles: [[c, f(30, 'rouge')], [c, f(30, 'rouge')], [c, f(30, 'rouge')], [f(30, 'rouge'), f(30, 'rouge')], [f(20, 'cuivre')], []], film: 2, etiquettes: ['avant', 'droite'], casesVisibles: true });
  }, 170);
  planche(hote, 'Préparateur', 'casque et terminal à la ceinture (sans visage) ; à droite, le même de dos', (I) =>
    K.personne(I, 0, 0, { casque: true, terminal: true }) + K.personne(I, 1, 0, { casque: true, terminal: true, dos: true }), 160);
  planche(hote, 'Allée assemblée', 'côté A au fond, côté B devant en transparence, préparateur devant A-T03 (le lot 3 en fera la vue jouable)', (I) => {
    let s = I.face([[-0.3, -0.3, 0], [8.7, -0.3, 0], [8.7, 4.5, 0], [-0.3, 4.5, 0]], '#e4dfd3', '#c9c3b6');
    s += I.face([[-0.3, 1.05, 0], [8.7, 1.05, 0], [8.7, 3.15, 0], [-0.3, 3.15, 0]], '#efeadf', 'none');
    const x = (t) => (4 - t) * 2.1;
    [1, 2, 3, 4].forEach((t) => { s += K.traveePicking(I, x(t), 0, { cote: 'A', contenu: contenu(EMPL[`A-T0${t}`]) }); });
    s += K.personne(I, x(3) + .9, 1.6, { casque: true, terminal: true, dos: true });
    [1, 2, 3, 4].forEach((t) => { s += K.traveePicking(I, x(t), 3.2, { cote: 'B', contenu: contenu(EMPL[`B-T0${t}`]), voile: .28 }); });
    return s;
  }, 70);
}
