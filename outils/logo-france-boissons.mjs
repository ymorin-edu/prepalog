// Récupère le logo de France Boissons sur son site et en tire le PNG du dépôt (chantier D-E, 09/10/2026).
//
//   node outils/logo-france-boissons.mjs
//
// 1. télécharge le SVG officiel (celui de l'en-tête du site) et l'écrit TEL QUEL dans
//    contenus/trames/logos/france-boissons.svg (aucun octet modifié) ;
// 2. le relit, vérifie qu'il ne contient ni script ni adresse ni image intégrée ;
// 3. en tire contenus/trames/logos/france-boissons.png (fond transparent, 645 px de large : 3 fois la taille d'origine) avec
//    Chromium (Playwright, déjà utilisé par la suite de tests) ;
// 4. relit les deux fichiers et affiche taille et empreinte SHA-256.
// Le SVG ne dépend d'aucun réseau une fois dans le dépôt. Alerte 10 de CLAUDE.md : jamais de base64 recopié à la main.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SOURCE = 'https://www.france-boissons.fr/wp-content/themes/france-boissons-rgaa-seo-production/assets/images/Logo_FB.svg';
const DOSSIER = join(dirname(fileURLToPath(import.meta.url)), '..', 'contenus', 'trames', 'logos');
const SVG = join(DOSSIER, 'france-boissons.svg');
const PNG = join(DOSSIER, 'france-boissons.png');
const LARGEUR = 645;
const sha = (b) => createHash('sha256').update(b).digest('hex');

const rep = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!rep.ok) throw new Error(`Téléchargement refusé : ${rep.status}`);
const octets = Buffer.from(await rep.arrayBuffer());
console.log(`Reçu : ${octets.length} octets, SHA-256 ${sha(octets)}`);
writeFileSync(SVG, octets);

const svg = readFileSync(SVG, 'utf8');
if (sha(readFileSync(SVG)) !== sha(octets)) throw new Error('Le SVG relu ne correspond pas au SVG reçu');
const sansEspaceDeNoms = svg.replace('xmlns="http://www.w3.org/2000/svg"', '');
if (/<script|<image|<foreignObject|https?:|data:|\bon[a-z]+=/i.test(sansEspaceDeNoms)) throw new Error('Le SVG contient autre chose que du dessin');

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: LARGEUR, height: 200 } });
await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${LARGEUR}px;height:auto}</style>${svg}`);
const png = await page.locator('svg').first().screenshot({ omitBackground: true });
await nav.close();
writeFileSync(PNG, png);

for (const f of [SVG, PNG]) {
  const relu = readFileSync(f);
  console.log(`${f.split(/[\\/]/).pop()} : ${relu.length} octets, SHA-256 ${sha(relu)}`);
}
const relu = readFileSync(PNG);
console.log(`PNG : signature ${relu.subarray(1, 4).toString()}, ${relu.readUInt32BE(16)} x ${relu.readUInt32BE(20)}, type de couleur ${relu[25]} (6 = RGBA)`);
