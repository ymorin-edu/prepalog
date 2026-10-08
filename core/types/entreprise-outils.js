// Les OUTILS communs de l'environnement d'entreprise : les formats (euros, dates, comparaison de textes, pastilles) et les
// aides « articles » (désignation, couleur, taille, état du stock) qui suivent le catalogue de la séance.
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 3) : le code est celui d'avant, mot pour mot.
// Module PUR : les formats ne reçoivent rien ; `creerArticles({ CATALOGUE, VOCAB, couleurs })` reçoit le catalogue, le
// vocabulaire et les couleurs de la séance (les trois options du même nom de `creerEntreprise`) et rend les aides.
// Ne pas l'appeler `entreprise-commun.js` (ce nom existe dans `contenus/`). Un module `entreprise-*.js` n'importe JAMAIS
// `entreprise.js` (import circulaire) : `entreprise.js` ré-exporte `eur`, `fdate`, `fdt`, `norm`, `normLoc`.

import { ech } from '../ui.js';

/* ------------------------------------------------------------------ formats */
export const eur = (n) => Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
export const fdate = (t) => new Date(t).toLocaleDateString('fr-FR');
export const fdt = (t) => new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export const normLoc = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');
export const pad = (n, l) => String(n).padStart(l, '0');   // 7, 2 → « 07 » (numéro de commande, allée)

export const pastille = (texte, ton) => `<span class="pastille ${ton}">${ech(texte)}</span>`;

// Les aides « articles » d'une séance. `couleurs` : { code: [nom, teinte] } (l'option `couleurs`, absente = aucune pastille).
export function creerArticles({ CATALOGUE, VOCAB, couleurs }) {
  const { VARIANTS } = CATALOGUE;
  const COLORS = couleurs || {};
  const unite = (n) => ((n > 1 || n === 0) ? VOCAB.unitPl : VOCAB.unit);
  // Catalogue « simple » (02/10/2026, chantier E) : des articles sans couleur ni taille — un
  // câble, une batterie, un carton de vin. Jusque-là l'environnement ne connaissait que la
  // chaussure de Spartoo (« modèle-couleur-taille ») et plantait sur un article sans couleur.
  // Pour un tel catalogue (`catalogueSimple`, contenus/entreprise-commun.js), les colonnes
  // Couleur et Taille disparaissent partout ; rien ne change pour Spartoo.
  const SIMPLE = !!CATALOGUE.simple;
  // Les exemples des champs et de l'aide de la console : une vraie référence du catalogue de la séance
  // (05/10/2026 : une référence Spartoo écrite en dur s'affichait dans toutes les entreprises).
  const REF_EX = VARIANTS.length ? VARIANTS[0].sku : '';
  const MODELE_EX = VARIANTS.length ? VARIANTS[0].model.ref : '';
  const label = (v) => [v.model.brand, v.model.name].filter(Boolean).join(' ');
  const nomCouleur = (c) => (COLORS[c] ? COLORS[c][0] : '');
  const swatch = (c) => (COLORS[c] ? `<span class="teinte" style="background:${COLORS[c][1]}"></span>${ech(COLORS[c][0])}` : '');
  // La précision « Noir · T.42 » sous une désignation, et les deux colonnes Couleur / Taille.
  const precision = (v) => (SIMPLE || !v ? '' : `<div class="note">${ech(nomCouleur(v.color))} · ${ech(VOCAB.sizeShort)}${v.size}</div>`);
  const precisionTexte = (v) => (SIMPLE ? '' : ` ${nomCouleur(v.color)} ${VOCAB.sizeShort}${v.size}`);
  const thVariante = (couleur = 'Couleur') => (SIMPLE ? '' : `<th>${couleur}</th><th class="num">${ech(VOCAB.sizeLabel)}</th>`);
  const tdVariante = (v, teinte) => (SIMPLE ? '' : (v ? `<td>${teinte ? swatch(v.color) : ech(nomCouleur(v.color))}</td><td class="num">${v.size}</td>` : '<td>—</td><td class="num">—</td>'));
  const etatStock = (q, min) => (q <= 0 ? ['Rupture', 'crit'] : (q <= min ? ['Faible', 'warn'] : ['OK', 'ok']));
  const pastilleStock = (q, min) => { const s = etatStock(q, min); return pastille(s[0], s[1]); };
  return { SIMPLE, unite, label, nomCouleur, swatch, precision, precisionTexte, thVariante, tdVariante,
    etatStock, pastilleStock, REF_EX, MODELE_EX };
}
