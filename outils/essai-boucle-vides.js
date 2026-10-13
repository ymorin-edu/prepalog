// Page d'ESSAI des dessins de la boucle des vides (chantier D-10, lot 2, 13/10/2026) : chaque objet nouveau du kit iso (`core/iso.js`,
// section « la boucle des vides ») dans ses états, puis la carte assemblée à la main. Rien n'est cliquable : l'animation vient ensuite
// (brief ENT-6.10 §4.4a, §11 : « une capture de chaque objet montrée à Tristan avant de brancher »).

import * as K from '../core/iso.js';

// Un dessin : on le pose dans un <svg>, puis on recadre la vue sur ce qui a été dessiné.
function planche(hote, titre, legende, dessin, unite = 120) {
  const I = K.projection({ unite, origine: [400, 200] });
  const fig = document.createElement('figure');
  fig.className = 'kit-planche';
  fig.dataset.planche = titre;
  fig.innerHTML = `<svg role="img" aria-label="${titre}">${K.DEFS}<rect class="kit-fond" fill="#f6f2e9"/>${dessin(I)}</svg>`
    + `<figcaption><b>${titre}</b> — ${legende}</figcaption>`;
  hote.append(fig);
  const sv = fig.querySelector('svg'), fond = sv.querySelector('.kit-fond');
  const bb = sv.getBBox(), m = 12;
  sv.setAttribute('viewBox', `${bb.x - m} ${bb.y - m} ${bb.width + 2 * m} ${bb.height + 2 * m}`);
  Object.entries({ x: bb.x - m, y: bb.y - m, width: bb.width + 2 * m, height: bb.height + 2 * m }).forEach(([k, v]) => fond.setAttribute(k, v));
}

// La carte de la boucle : la brasserie au fond, la plateforme au milieu, le bar de Malo au bord de la mer ; la route les relie.
export const CARTE = {
  route: [[3, 4.6], [3, 12.6], [22.5, 12.6], [22.5, 8.2]],
  brasserie: [0, 0], lavage: [7.4, .6], plateforme: [9, 7.6], bar: [20.6, 4.8],
  arrets: { brasserie: [3, 5.6], plateforme: [12.5, 12.6], malo: [22.5, 8.4] },
};
export function carte(I, camion) {
  let s = I.face([[-2.5, -3.2, 0], [27, -3.2, 0], [27, 15.5, 0], [-2.5, 15.5, 0]], '#ddd5c2', 'none');
  s += K.route(I, CARTE.route);
  s += K.batiment(I, 'brasserie', ...CARTE.brasserie, { nom: 'Brasserie (Mons-en-Barœul)' });
  s += K.batiment(I, 'lavage', ...CARTE.lavage, { nom: 'Lavage' });
  s += K.batiment(I, 'plateforme', ...CARTE.plateforme, { nom: 'Plateforme de Buchelay' });
  s += K.batiment(I, 'bar', ...CARTE.bar, { nom: 'La Cabane à Malo' });
  if (camion) s += K.porteurRideaux(I, camion.x, camion.y, camion.sens, { charge: camion.charge });
  return s;
}

export function monter(hote) {
  planche(hote, 'Porteur à rideaux, les quatre sens', 'vers la droite (pleins), vers la gauche (vides), vers l’élève (pleins), vers le fond (rien) : '
    + 'rideau entrouvert à l’arrière, on voit le chargement', (I) =>
    K.porteurRideaux(I, 0, 0, 'E', { charge: 'pleins' }) + K.porteurRideaux(I, 0, 4.5, 'O', { charge: 'vides' })
    + K.porteurRideaux(I, 6, 0, 'S', { charge: 'pleins' }) + K.porteurRideaux(I, 9.5, 0, 'N'), 70);
  planche(hote, 'Porteur de près', 'vers la droite, chargé de vides (fûts à bouchon gris, casier de bouteilles vides) ; à droite, rideau fermé', (I) =>
    K.porteurRideaux(I, 0, 0, 'E', { charge: 'vides' }) + K.porteurRideaux(I, 4.6, 0, 'E', { charge: 'pleins', rideau: 'ferme' }), 130);
  planche(hote, 'Fûts', 'plein (bande de marque) et vide (bouchon gris)', (I) =>
    K.futDebout(I, 0, 0, 0, { litres: 30, bande: 'rouge' }) + K.futVide(I, .6, 0, 0, { litres: 30 }) + K.futVide(I, 1.2, 0, 0, { litres: 30 }), 260);
  planche(hote, 'Plateforme de Buchelay', 'entrepôt bardé, six portes de quai à butoirs, bureau vitré', (I) => K.batiment(I, 'plateforme', 0, 0, { nom: 'Plateforme de Buchelay' }), 60);
  planche(hote, 'Bar de plage', 'la mer derrière, le sable, la cabane en planches, l’auvent rayé, un parasol, deux tables', (I) => K.batiment(I, 'bar', 0, 0, { nom: 'La Cabane à Malo' }), 80);
  planche(hote, 'Brasserie et lavage', 'brique et sheds, cheminée, trois cuves ; le bâtiment de lavage à côté', (I) =>
    K.batiment(I, 'brasserie', 0, 0, { nom: 'Brasserie' }) + K.batiment(I, 'lavage', 7.4, .6, { nom: 'Lavage' }), 60);
  planche(hote, 'Route', 'enrobé, bas-côtés, ligne médiane en tirets ; deux virages', (I) => K.route(I, [[0, 0], [0, 4], [6, 4], [6, 1]]), 50);
  planche(hote, 'La carte de la boucle (assemblée)', 'le camion part plein de la plateforme vers Malo', (I) =>
    carte(I, { x: 16, y: 12.6, sens: 'E', charge: 'pleins' }), 34);
}
