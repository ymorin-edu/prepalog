// ENT-8.9 — Action, « la palette de Lucas ». SQUELETTE posé par le chef de chantier (17/10/2026) pour que la séance soit au registre
// et au socle CAP pendant que les quatre séances de la réception (ENT-8.7 à 8.10) se construisent ; la séance complète remplace ce
// fichier (brief `docs/briefs/ENT-8.9-action-labastide-reception.md`, décisions : `docs/briefs/COORDINATION-action.md` §8).

export const meta = {
  id: 'action-palette-lucas',
  code: 'ENT-8.9',
  titre: 'Action — la palette de Lucas',
  desc: 'Recevoir seul un camion de jouets à Labastide, de l’accueil du chauffeur aux réserves, puis traiter une palette abîmée acceptée sans réserve la veille.',
  rubrique: 'simulog',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3', 'CAP-C1.4'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  precedente: 'action-controler',
  pret: false,
};

export function rendre(racine) {
  racine.innerHTML = '<p>Séance en construction.</p>';
}
