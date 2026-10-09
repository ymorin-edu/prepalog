// Deux gestes d'interface que les vues se recopiaient (chantier 14, 09/10/2026) : la confirmation en deux
// clics et la conservation du focus clavier après un redessin. Comme `texte.js`, ce module n'a AUCUN accès au
// navigateur à l'import (les vues de transport, importées par des contenus de séance, se chargent aussi hors
// navigateur) : tout ce qui touche au DOM se fait à l'appel. `ui.js` ré-exporte le tout.

/* ============================================================ au clavier ? */
// « Au clavier seulement » (charte : conserver le focus d'un redessin à l'autre, mais un clic de souris ne
// déplace rien). Un seul suivi pour toutes les vues : la dernière entrée de l'utilisateur était-elle une touche ?
let clavier = false;
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', () => { clavier = true; }, true);
  document.addEventListener('pointerdown', () => { clavier = false; }, true);
}
export const auClavier = () => clavier;

/* ============================================================ confirmation en deux clics */
// Le premier clic ARME (le bouton change de libellé, la vue se redessine), le second AGIT. `etat` porte le
// drapeau, `cle` est son nom : le drapeau reste dans l'état de la vue, là où le redessin et les « Annuler »
// savent le remettre à faux. Rend FAUX au premier clic (l'appelant redessine puis s'arrête), VRAI au second
// (le drapeau est déjà retombé : l'appelant agit).
//   if (!secondClic(ui, 'arme')) { redessiner(); return; }
//   …l'action…
// Ce que ce geste NE fait PAS, exprès : pas de délai (un bouton armé le reste jusqu'à « Annuler » ou jusqu'au
// prochain redessin qui remet le drapeau à faux, c'est la règle de chaque vue) ; pas de libellé (chaque vue écrit
// le sien, ses élèves le lisent depuis des semaines).
//   garder : au second clic, le drapeau reste VRAI (l'appelant le remet à faux quand l'action est finie : le
//   bouton reste « armé » pendant l'envoi de la copie).
export function secondClic(etat, cle, { garder = false } = {}) {
  if (!etat[cle]) { etat[cle] = true; return false; }
  if (!garder) etat[cle] = false;
  return true;
}

/* ============================================================ conserver le focus */
const echapper = (v) => String(v).replace(/["\\]/g, '\\$&');

// Un sélecteur qui retrouvera l'élément après un redessin : `id`, sinon `data-cle` (l'attribut que les vues
// posent exprès), sinon son premier attribut `data-*`. Rend `null` si rien ne le désigne.
function selecteurDe(el) {
  if (el.id) return `#${CSS.escape(el.id)}`;
  if (el.dataset && el.dataset.cle != null) return `[data-cle="${echapper(el.dataset.cle)}"]`;
  const noms = el.getAttributeNames ? el.getAttributeNames().filter((n) => n.startsWith('data-')) : [];
  return noms.length ? `[${noms[0]}="${echapper(el.getAttribute(noms[0]))}"]` : null;
}

// Avant de redessiner : ce qui a le focus dans `zones` (un conteneur ou une liste), seulement au clavier.
// Rend `null` sinon. Se range tel quel et se rend à `retrouverFocus`.
export function memoriserFocus(zones) {
  const L = [].concat(zones).filter(Boolean);
  const a = typeof document !== 'undefined' ? document.activeElement : null;
  if (!clavier || !a || a === document.body) return null;
  const zone = L.find((z) => z.contains(a));
  const sel = zone && selecteurDe(a);
  if (!sel) return null;
  const rang = Array.from(zone.querySelectorAll(sel)).indexOf(a);
  let debut = null, fin = null;
  try { debut = a.selectionStart; fin = a.selectionEnd; } catch (e) { /* champ sans curseur (case, liste) */ }
  return { sel, rang: Math.max(rang, 0), debut, fin };
}

// Après le redessin : remet le focus. `cible` vient de `memoriserFocus`, ou c'est un sélecteur écrit par la vue
// (`ui.focus`). Seulement au clavier ; jamais sur un élément grisé. Rend vrai si le focus a été posé.
//   siPerdu : ne rien faire si un élément a déjà pris le focus (la vue l'a placé exprès : elle gagne).
//   defilement : par défaut le focus ne fait pas défiler la page (il était déjà à l'écran avant le redessin).
export function retrouverFocus(zones, cible, { siPerdu = false, defilement = false } = {}) {
  if (!cible || !clavier) return false;
  if (siPerdu) {
    const a = document.activeElement;
    if (a && a !== document.body && a.isConnected) return false;
  }
  const sel = typeof cible === 'string' ? cible : cible.sel;
  for (const z of [].concat(zones).filter(Boolean)) {
    const tous = z.querySelectorAll(sel);
    const el = (typeof cible === 'string' ? tous[0] : tous[cible.rang]) || tous[0];
    if (!el || el.disabled) continue;
    el.focus({ preventScroll: !defilement });
    if (typeof cible === 'object' && cible.debut != null && el.setSelectionRange) {
      try { el.setSelectionRange(cible.debut, cible.fin); } catch (e) { /* type de champ sans curseur */ }
    }
    return true;
  }
  return false;
}

// Redessiner en gardant le focus clavier : `garderFocus(zone, () => { zone.innerHTML = …; })`.
export function garderFocus(zones, redessiner, options) {
  const cible = memoriserFocus(zones);
  const r = redessiner();
  retrouverFocus(zones, cible, options);
  return r;
}
