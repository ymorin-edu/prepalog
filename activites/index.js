// Registre des activités et des rubriques d'accueil.
//
// Ajouter une activité = écrire son fichier, puis ajouter une ligne dans ACTIVITES.
// L'accueil, les droits, la sauvegarde des scores et le suivi de classe suivent tout seuls.

export const ACTIVITES = [
  () => import('./chaine-logistique.js'),
  () => import('./magasin.js'),
  () => import('./quiz-flux.js'),
  () => import('./zones-entrepot.js'),
  () => import('./calculs-stock.js'),
  () => import('./inventaire-tableur.js'),
  () => import('./excel-stock.js'),
  // Scénarios : l'ordre d'affichage des tuiles est celui de cette liste.
  () => import('./yves-rocher.js'),
  () => import('./foot-locker.js'),
  () => import('./bouygues-telecom.js'),
  () => import('./brasseries-gatinais.js'),
  () => import('./reception-plateforme.js'),
  // Environnements d'entreprise (LogiSim)
  () => import('./spartoo.js'),
];

// Pictogrammes des pastilles. Trait de 1,7 px, sans remplissage : même famille graphique
// que la Suite Logistique.
export const ICONES = {
  magasin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 5h18M3 12h18M3 19h18M4 5v14M20 5v14"/><rect x="6.5" y="7.5" width="5" height="3.5"/><rect x="13" y="14.5" width="5" height="3.5"/></svg>`,
  logistique: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>`,
  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l3 2M9.5 2h5M12 2v3"/></svg>`,
  scenario: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 6h6l2 2h10v11H3z"/><circle cx="14" cy="14" r="3"/><path d="M16.3 16.3L19 19"/></svg>`,
  tableur: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4" y="3" width="16" height="18"/><path d="M7.5 7.5h9M7.5 11.5h3M13.5 11.5h3M7.5 15.5h3M13.5 15.5h3"/></svg>`,
  transport: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 7h12v10H2z"/><path d="M14 10h4l3 4v3h-7z"/><circle cx="6.5" cy="17.5" r="2.2"/><circle cx="17" cy="17.5" r="2.2"/></svg>`,
  gestion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 4h5.5a2.5 2.5 0 0 1 2.5 2.5V20a2.2 2.2 0 0 0-2.2-1.8H4z"/><path d="M20 4h-5.5A2.5 2.5 0 0 0 12 6.5V20a2.2 2.2 0 0 1 2.2-1.8H20z"/></svg>`,
  entreprise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 21h18M5 21V6l7-3 7 3v15"/><path d="M9.5 9.5h1.5M13 9.5h1.5M9.5 13h1.5M13 13h1.5"/><path d="M10 21v-4h4v4"/></svg>`,
  comptes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c.9-4 3.9-6 7.5-6s6.6 2 7.5 6"/></svg>`,
  suivi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M9 9v11M15 9v11"/></svg>`,
};

// Les pastilles de l'accueil. Une rubrique liste soit des `ids` explicites, soit une
// catégorie (`cat`) qui filtre les activités. `bande` regroupe les pastilles par ligne,
// séparées par un filet.
export const RUBRIQUES = [
  // bande 1 — le cours : découvrir, puis appliquer sur un cas complet
  { id: 'logistique', label: 'Logistique', bande: 1, cat: 'logistique', icone: 'logistique',
    desc: "Découvrir et pratiquer les opérations de la chaîne logistique." },
  { id: 'scenario', label: 'Scénario', bande: 1, cat: 'scenario', icone: 'scenario',
    desc: "Études de cas complètes, sur Padlet ou Digipad, notées par l'enseignant." },

  // bande 2 — l'entraînement
  { id: 'quiz', label: 'Quiz', bande: 2, cat: 'quiz', icone: 'quiz',
    desc: 'Séries de questions courtes, corrigées immédiatement.' },
  { id: 'tableur', label: 'Tableur', bande: 2, cat: 'tableur', icone: 'tableur',
    desc: 'Compléter un classeur, le déposer, obtenir la correction automatique.' },

  // bande 3 — les outils de travail
  { id: 'logisim', label: 'Logisim', bande: 3, cat: 'logisim', icone: 'entreprise',
    desc: "Des environnements d'entreprise complets. Chaque élève travaille dans sa propre base." },
  { id: 'magasin', label: 'Magasin', bande: 3, ids: ['magasin'], icone: 'magasin',
    desc: 'La base du magasin pédagogique : produits, emplacements et état du stock.' },
];

const cache = new Map();

export async function chargerActivites() {
  if (cache.size) return Array.from(cache.values());
  const mods = await Promise.all(ACTIVITES.map((f) => f()));
  mods.forEach((m) => cache.set(m.meta.id, m));
  return Array.from(cache.values());
}

export async function activite(id) {
  await chargerActivites();
  return cache.get(id) || null;
}

// Activités d'une rubrique, dans l'ordre déclaré pour `ids`, par ordre naturel pour `cat`.
export function activitesDeRubrique(rubrique, mods) {
  if (!rubrique) return [];
  if (rubrique.ids) {
    return rubrique.ids.map((id) => mods.find((m) => m.meta.id === id)).filter(Boolean);
  }
  return mods.filter((m) => m.meta.rubrique === rubrique.cat);
}
