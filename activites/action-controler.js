// ENT-8.8 — Action, « on vérifie qu'il ne manque rien ». SQUELETTE posé par le chef de chantier (17/10/2026) pour que la séance soit au
// registre et au socle CAP pendant que les quatre séances de la réception (ENT-8.7 à 8.10) se construisent en parallèle ; la séance
// complète remplace ce fichier (brief `docs/briefs/ENT-8.8-action-controler.md`, décisions : `docs/briefs/COORDINATION-action.md` §8).

export const meta = {
  id: 'action-controler',
  code: 'ENT-8.8',
  titre: 'Action — on vérifie qu’il ne manque rien',
  desc: 'Contrôler les palettes du camion contre le bon de livraison, repérer les cartons abîmés ou manquants, écrire des réserves précises, faire signer le chauffeur et rendre compte.',
  rubrique: 'simulog',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.4'],
  temps: 'guidage',
  bareme: 20,
  parcours: true,
  precedente: 'action-decharger',
  pret: false,
};

export function rendre(racine) {
  racine.innerHTML = '<p>Séance en construction.</p>';
}
