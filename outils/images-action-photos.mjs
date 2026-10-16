// Récupère les deux photos libres (Pexels) ajoutées au dossier contenus/images/action/ le 16/10/2026.
// Usage : node outils/images-action-photos.mjs
// Pexels refuse le téléchargement fait par fetch() de node (403) : on passe par curl, avec un en-tête
// de navigateur. Chaque fichier est écrit, RELU depuis le disque, vérifié (JPEG complet : début FFD8 et fin FFD9,
// dimensions lues dans l'en-tête, taille < 250 Ko) et son SHA-256 est affiché pour CREDITS.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DOSSIER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'contenus', 'images', 'action');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36';
const PHOTOS = [
  { fichier: 'porte-quai-numero.jpg', id: 34968619, largeur: 1200 }, // Simeon Galabov, quais B56 à B60
  { fichier: 'chariot-elevateur.jpg', id: 8760709, largeur: 1200 }, // Ani Set, chariot orange sans personne
];

function dimensionsJpeg(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), l: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('dimensions introuvables');
}

for (const p of PHOTOS) {
  const url = `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=${p.largeur}`;
  const cible = path.join(DOSSIER, p.fichier);
  execFileSync('curl', ['-s', '-L', '-f', '-A', UA, '-o', cible, url]);
  const buf = fs.readFileSync(cible); // relecture depuis le disque
  const debut = buf[0] === 0xff && buf[1] === 0xd8;
  const fin = buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9;
  const { l, h } = dimensionsJpeg(buf);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  const ok = debut && fin && buf.length < 250 * 1024;
  console.log(`${ok ? 'OK ' : 'ECHEC'} ${p.fichier} ${l}x${h} ${buf.length} o sha256=${sha}`);
  if (!ok) process.exitCode = 1;
}
