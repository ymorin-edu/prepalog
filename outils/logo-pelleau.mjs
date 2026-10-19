// Récupère le logo des Transports Pelleau sur leur site (chantier Pelleau, lot A, 19/10/2026).
//
//   node outils/logo-pelleau.mjs
//
// Le site n'offre aucun logo en SVG : le logo de l'en-tête est un PNG (Logo-TP-V2.png, 1940 px de large, celui que le
// site déclare aussi comme logo de l'organisation dans ses métadonnées). Le script :
// 1. lit la page d'accueil et en tire l'adresse du logo (balise « Logo-TP-V2.png » de l'en-tête) ;
// 2. télécharge ce PNG et l'écrit TEL QUEL dans contenus/trames/logos/pelleau.png (aucun octet modifié) ;
// 3. le relit, vérifie la signature PNG, les dimensions (lues dans l'en-tête) et que l'empreinte relue est celle reçue ;
// 4. affiche taille, dimensions, type de couleur et SHA-256.
// Le logo ne dépend d'aucun réseau une fois dans le dépôt. Alerte 10 de CLAUDE.md : jamais de base64 recopié à la main.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PAGE = 'https://www.transports-pelleau.fr/';
const DOSSIER = join(dirname(fileURLToPath(import.meta.url)), '..', 'contenus', 'trames', 'logos');
const PNG = join(DOSSIER, 'pelleau.png');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const entetes = { 'User-Agent': 'Mozilla/5.0' };

const accueil = await fetch(PAGE, { headers: entetes });
if (!accueil.ok) throw new Error(`Page d'accueil refusée : ${accueil.status}`);
const html = await accueil.text();
const trouve = html.match(/https:\/\/www\.transports-pelleau\.fr\/wp-content\/uploads\/\d{4}\/\d{2}\/Logo-TP-V2\.png/);
if (!trouve) throw new Error('Logo introuvable dans la page d\'accueil');
const SOURCE = trouve[0];
console.log(`Source : ${SOURCE}`);

const rep = await fetch(SOURCE, { headers: entetes });
if (!rep.ok) throw new Error(`Téléchargement refusé : ${rep.status}`);
const octets = Buffer.from(await rep.arrayBuffer());
console.log(`Reçu : ${octets.length} octets, SHA-256 ${sha(octets)}`);
writeFileSync(PNG, octets);

const relu = readFileSync(PNG);
if (sha(relu) !== sha(octets)) throw new Error('Le PNG relu ne correspond pas au PNG reçu');
if (relu.subarray(1, 4).toString() !== 'PNG') throw new Error('Le fichier reçu n\'est pas un PNG');
if (relu.subarray(-8, -4).toString('hex') !== '49454e44') throw new Error('PNG tronqué (bloc IEND absent)');
console.log(`pelleau.png : ${relu.length} octets, SHA-256 ${sha(relu)}`);
console.log(`PNG : ${relu.readUInt32BE(16)} x ${relu.readUInt32BE(20)}, type de couleur ${relu[25]} (6 = RGBA, 2 = RVB, 3 = palette)`);
