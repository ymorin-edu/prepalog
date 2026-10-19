// Récupère deux photos des Transports Pelleau sur leur site (chantier Pelleau, ENT-10.1, 19/10/2026, accord de Tristan).
//
//   node outils/photos-pelleau.mjs
//
// Les deux photos sont les grandes images d'en-tête de deux pages du site. Le site en publie aussi une version « 1536 px de large »
// (celle que WordPress fabrique lui-même) : on prend celle-là, donc AUCUNE retouche de notre part et pas plus de 1600 px. Le script :
// 1. vérifie que la page citée référence bien l'image d'origine (sinon le site a changé : on s'arrête) ;
// 2. télécharge la version 1536 px et l'écrit TEL QUELLE dans contenus/images/pelleau/<nom>.jpg ;
// 3. la relit, vérifie la signature JPEG (début FFD8, fin FFD9), les dimensions (lues dans l'en-tête) et que l'empreinte relue est
//    celle reçue ;
// 4. affiche taille, dimensions et SHA-256.
// Les photos ne dépendent d'aucun réseau une fois dans le dépôt. Alerte 10 de CLAUDE.md : jamais de base64 recopié à la main.
// Aucune photo ne montre une personne identifiable (vérifié à l'écran) ; crédits dans CREDITS.md.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = 'https://www.transports-pelleau.fr/';
const UPLOADS = RACINE + 'wp-content/uploads/';
const DOSSIER = join(dirname(fileURLToPath(import.meta.url)), '..', 'contenus', 'images', 'pelleau');
const PHOTOS = [
  { nom: 'camion-pelleau-port.jpg', page: RACINE + 'transport-de-marchandises/',
    origine: '2026/01/Camion_Home-3.jpg', version: '2026/01/Camion_Home-3-1536x863.jpg', attendu: [1536, 863] },
  { nom: 'entrepot-racks.jpg', page: RACINE + 'stockage-de-marchandises/',
    origine: '2026/07/P1435113-HDR-scaled-e1784800221280.jpg', version: '2026/07/P1435113-HDR-scaled-e1784800221280-1536x824.jpg',
    attendu: [1536, 824] },
];
const sha = (b) => createHash('sha256').update(b).digest('hex');
const entetes = { 'User-Agent': 'Mozilla/5.0' };

// Dimensions d'un JPEG : premier bloc « début de trame » (SOF0 à SOF3).
function dimensionsJpeg(b) {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('Dimensions JPEG introuvables');
}

mkdirSync(DOSSIER, { recursive: true });
for (const p of PHOTOS) {
  const page = await fetch(p.page, { headers: entetes });
  if (!page.ok) throw new Error(`${p.page} refusée : ${page.status}`);
  if (!(await page.text()).includes(UPLOADS + p.origine)) throw new Error(`${p.page} ne cite plus ${p.origine}`);
  const rep = await fetch(UPLOADS + p.version, { headers: entetes });
  if (!rep.ok) throw new Error(`Téléchargement de ${p.version} refusé : ${rep.status}`);
  const octets = Buffer.from(await rep.arrayBuffer());
  const fichier = join(DOSSIER, p.nom);
  writeFileSync(fichier, octets);

  const relu = readFileSync(fichier);
  if (sha(relu) !== sha(octets)) throw new Error(`${p.nom} relu ne correspond pas à ce qui a été reçu`);
  if (relu[0] !== 0xff || relu[1] !== 0xd8) throw new Error(`${p.nom} n'est pas un JPEG`);
  if (relu[relu.length - 2] !== 0xff || relu[relu.length - 1] !== 0xd9) throw new Error(`${p.nom} est tronqué (FFD9 absent)`);
  const [l, h] = dimensionsJpeg(relu);
  if (l !== p.attendu[0] || h !== p.attendu[1]) throw new Error(`${p.nom} : ${l} x ${h} au lieu de ${p.attendu.join(' x ')}`);
  if (l > 1600) throw new Error(`${p.nom} dépasse 1600 px de large`);
  console.log(`${p.nom} : ${relu.length} octets, ${l} x ${h} px, SHA-256 ${sha(relu)}`);
  console.log(`  source : ${UPLOADS + p.version} (page ${p.page})`);
}
