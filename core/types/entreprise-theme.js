// Le THÈME d'une entreprise : les variables CSS posées sur <body> et sur la page, et le jugement « charte rouge ou verte ».
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 2) : le code est celui d'avant, mot pour mot.
// Module PUR : il ne reçoit que la charte (`THEME`, l'option du même nom de `creerEntreprise`) et rend du texte ou un booléen.
// Les 43 valeurs du thème « papier » sont recopiées de `styles/base.css` et `styles/entrepot.css` (à garder ensemble ; leur
// dédoublonnage est le chantier 12). Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

const enRgb = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16)).join(',');

// L'encre à poser SUR un aplat de cette couleur, choisie par sa luminance. Elle sert à
// la pastille d'ordre de passage de la carte, dessinée en `--vert` : la menthe de Boost
// (#25c998) est claire, et l'encre blanche du site y devenait illisible — deux pour un
// de contraste sur un chiffre de dix pixels, au vidéoprojecteur. La calculer évite de
// demander une couleur de plus à chaque entreprise, et une charte peut toujours imposer
// la sienne avec `surVert`.
const surCouleur = (h) => {
  const [r, g, b] = h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? '#07261c' : '#ffffff';
};

// Une charte ROUGE ou VERTE garde sa couleur sur le bandeau et le menu, jamais dans la zone où
// l'élève travaille (décision de Tristan, 05/10/2026) : le rouge y voudrait dire « faux », le vert
// « juste ». Là, l'accent devient l'encre du texte (classe `ent-travail-neutre`, styles/base.css).
// Reconnu à la teinte : rouge (≤ 20° ou ≥ 330°) ou vert (75° à 170°), assez saturé pour être une couleur.
export const accentRougeOuVert = (h) => {
  if (!h) return false;
  const [r, g, b] = h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2, sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.35) return false;
  const t = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const teinte = (t * 60 + 360) % 360;
  return teinte <= 20 || teinte >= 330 || (teinte >= 75 && teinte <= 170);
};

export function styleTheme(THEME) {
  const v = [];
  // THEME.papier (03/10/2026, Picard) : l'entreprise impose le thème clair « papier » de
  // Prepalog, quel que soit le réglage du poste. Sans lui, un poste réglé en sombre
  // (Windows) affichait le bleu nuit de Picard sur fond sombre : illisible (Tristan).
  // Mêmes valeurs que `:root` dans styles/base.css (à garder ensemble), puis l'accent de
  // l'entreprise par-dessus. Les couleurs propres à la vue quai suivent aussi.
  if (THEME.papier && !THEME.sombre) {
    v.push('--fond:#f4f1ea', '--panneau:#fdfbf7', '--survol:#f9f6ef', '--filet:#e3ded3',
      '--encre:#1a1915', '--encre-douce:#555047',
      '--ardoise:#107c41', '--ardoise-fond:#107c41', '--sur-ardoise:#ffffff', '--ardoise-clair:#e3f1e8',
      '--terre:#9c620a', '--vert:#0b7a41', '--vert-fond:#0a8449', '--sur-vert:#ffffff', '--vert-pale:#e4f1e5',
      '--rouge:#9d2727', '--gele-fond:#fcf3e2', '--toast-fond:#1a1915', '--toast-texte:#ffffff',
      '--ombre:0 1px 2px rgba(40,34,24,.06)', '--quai-froid:#2a6fb0', '--quai-chaud:#b8431b',
      '--pl-alpha:.30', '--pl-fenetre:rgba(156,98,10,.13)', '--pl-hachure:rgba(85,80,71,.18)', '--pl-ambre:#7d4e07', '--pl-rouge:#9d2727',
      // Le décor du plan d'entrepôt (mêmes valeurs que `:root` dans styles/entrepot.css).
      '--pe-montant:#2f5f9e', '--pe-lisse:#e07b1a', '--pe-plaque:#f3d04a', '--pe-sol:#e4dfd3', '--pe-sol2:#d6d0c2',
      '--pe-carton:#c89a63', '--pe-carton-trait:#8f6532', '--pe-gris:#bdb7aa', '--pe-gris-trait:#8a8478',
      '--pe-sur-gris:#1a1915', '--pe-jaune-sol:#e5b800', '--pe-litige:rgba(157,39,39,.10)',
      '--pe-hachure:rgba(157,39,39,.35)', '--pe-bande:201,120,10', '--pe-visite:#6b3fa0', '--pe-visite-voile:rgba(107,63,160,.16)',
      'color-scheme:light');
  }
  const a = THEME.accent;
  if (a) {
    v.push(`--ardoise:${a}`, `--ardoise-fond:${a}`,
      `--sur-ardoise:${THEME.surAccent || '#ffffff'}`,
      `--ardoise-clair:rgba(${enRgb(a)},.11)`);
  }
  const P = THEME.sombre;
  if (P) {
    v.push(
      `--fond:${P.fond}`, `--panneau:${P.panneau}`, `--survol:${P.survol}`,
      `--filet:${P.filet}`, `--encre:${P.encre}`, `--encre-douce:${P.encreDouce}`,
      // Sur fond sombre, l'accent des textes et des bordures doit être plus clair que
      // celui des aplats pleins, sinon il disparaît.
      `--ardoise:${P.accent}`, `--ardoise-fond:${P.accentFond || P.accent}`,
      `--ardoise-clair:${P.accentClair || `rgba(${enRgb(P.accent)},.14)`}`,
      `--terre:${P.terre}`, `--vert:${P.vert}`, `--rouge:${P.rouge}`,
      `--sur-vert:${P.surVert || surCouleur(P.vert)}`,
      `--ent-bandeau:${P.bandeau || P.panneau}`,
      `--ent-side:${P.menu || P.bandeau || 'transparent'}`,
      `--ent-bandeau-txt:${P.encre}`,
      `--ent-marque:${P.accent}`,
      `--ent-badge:${P.accentFond || P.accent}`,
      // Un message flottant sombre disparaîtrait sur ce fond : il prend l'accent.
      `--toast-fond:${P.accentFond || P.accent}`, '--toast-texte:#ffffff',
      '--gele-fond:#2a1a12',
      '--ombre:0 1px 2px rgba(0,0,0,.45)',
      'color-scheme:dark');
  }
  return v.join(';');
}
