// Deux petits outils de texte, SANS aucun accès au navigateur à l'import : les corrigés de séance et
// les modules de contenu (`contenus/`) se chargent aussi hors navigateur (Node), et `ui.js`, lui,
// ne s'y charge pas. Les vues importent d'ici ; `ui.js` les ré-exporte pour les anciens imports.
// (Chantier 14, 09/10/2026 : ces deux fonctions étaient recopiées dans huit fichiers.)

// Échappement HTML : `& < > " '`. Rend '' pour `null` et `undefined`.
export function ech(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Un nombre sur deux chiffres (horloges : 07, 14).
export const pad2 = (n) => String(n).padStart(2, '0');
