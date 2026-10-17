// ENT-8.10 — Action, évaluation « recevoir un camion dans un nouveau site ». SQUELETTE posé par le chef de chantier (17/10/2026) pour
// que la séance soit au registre et au socle CAP pendant que les quatre séances de la réception (ENT-8.7 à 8.10) se construisent ; la
// séance complète remplace ce fichier et ajoute `copie: true` et `noter` (brief `docs/briefs/ENT-8.10-action-evaluation-reception.md`,
// décisions : `docs/briefs/COORDINATION-action.md` §8).

export const meta = {
  id: 'action-evaluation-reception',
  code: 'ENT-8.10',
  titre: 'Action — évaluation : recevoir un camion dans un nouveau site',
  desc: 'Appliquer le protocole de sécurité, accueillir le chauffeur, vérifier le quai et le camion, faire décharger, contrôler les palettes, écrire les réserves et rendre compte.',
  rubrique: 'simulog',
  immersif: true,
  portee: 'eleve',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3', 'CAP-C1.4'],
  temps: 'evaluation',
  bareme: 20,
  pret: false,
};

export function rendre(racine) {
  racine.innerHTML = '<p>Séance en construction.</p>';
}
