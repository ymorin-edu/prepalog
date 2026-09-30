// Thème clair / sombre.
//
// Trois états : 'auto' (suit le réglage du système), 'clair', 'sombre'.
// Le choix est propre à ce navigateur : il n'a pas à remonter en base.
// L'attribut data-theme est posé sur <html> le plus tôt possible pour éviter
// le clignotement blanc au chargement (voir le script en tête d'index.html).

const CLE = 'prepalog:theme';

export function themeEnregistre() {
  try { return localStorage.getItem(CLE) || 'auto'; } catch (e) { return 'auto'; }
}

export function themeEffectif() {
  const t = themeEnregistre();
  if (t !== 'auto') return t;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair';
}

export function appliquerTheme(t) {
  const html = document.documentElement;
  if (t === 'auto') html.removeAttribute('data-theme');
  else html.setAttribute('data-theme', t);
  try { localStorage.setItem(CLE, t); } catch (e) {}
  majLogos();
}

// Bascule simple : on passe à l'inverse de ce qui est affiché, en sortant de 'auto'.
export function basculerTheme() {
  appliquerTheme(themeEffectif() === 'sombre' ? 'clair' : 'sombre');
}

export function logoSrc() {
  return themeEffectif() === 'sombre' ? './styles/logo-sombre.png' : './styles/logo.png';
}

export function majLogos() {
  const src = logoSrc();
  document.querySelectorAll('[data-logo]').forEach((i) => { i.src = src; });
  const f = document.getElementById('favicon');
  if (f) f.href = src;
}

export const ICONE_THEME = `
  <svg class="ico-soleil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
  <svg class="ico-lune" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>`;

// Suit le système tant que l'utilisateur n'a rien choisi.
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeEnregistre() === 'auto') majLogos();
  });
}
