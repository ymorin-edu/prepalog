// Registre des activités.
// Ajouter une activité = écrire son fichier, puis ajouter une ligne ici. Rien d'autre :
// l'accueil, les droits, la sauvegarde des scores et le suivi de classe suivent tout seuls.

export const ACTIVITES = [
  () => import('./ent1-flux.js'),
  () => import('./op1-magasin.js'),
];

// Rubriques de l'accueil : libellé, bande d'affichage, et activités retenues.
export const RUBRIQUES = [
  { id: 'magasin', label: 'Magasin', bande: 1, desc: 'La base de données de la classe.' },
  { id: 'quiz', label: 'Quiz', bande: 2, desc: 'Entraînement autocorrigé.' },
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
