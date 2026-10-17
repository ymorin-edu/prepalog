// ENT-8.7 — Action, « on décharge ensemble ». SQUELETTE posé par le chef de chantier (17/10/2026) pour que la séance soit au registre
// et au socle CAP pendant que les quatre séances de la réception (ENT-8.7 à 8.10) se construisent en parallèle ; la séance complète
// remplace ce fichier (brief `docs/briefs/ENT-8.7-action-decharger.md`, décisions : `docs/briefs/COORDINATION-action.md` §8).

export const meta = {
  id: 'action-decharger',
  code: 'ENT-8.7',
  titre: 'Action — on décharge ensemble',
  desc: 'Appliquer le protocole de sécurité du quai, accueillir le chauffeur, vérifier que le quai et le camion sont sûrs avant de décharger, et diriger le déchargement.',
  rubrique: 'simulog',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.3'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  precedente: 'action-avant-noel',
  pret: false,
};

export function rendre(racine) {
  racine.innerHTML = '<p>Séance en construction.</p>';
}
