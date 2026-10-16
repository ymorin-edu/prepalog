// ENT-8.3 — Action, « un autre site, un autre prestataire ». SQUELETTE posé par le chef de chantier (16/10/2026) pour que
// `precedente: 'action-autre-site'` existe pendant la construction d'ENT-8.4 ; la séance complète remplace ce fichier
// (brief `docs/briefs/ENT-8.3-action-autre-site.md`, décisions : `docs/briefs/COORDINATION-action.md` §6).

export const meta = {
  id: 'action-autre-site',
  code: 'ENT-8.3',
  titre: 'Action — un autre site, un autre prestataire',
  desc: 'Situer un autre entrepôt et un nouveau magasin d’Action, reconnaître qui exploite quel entrepôt, corriger la chaîne d’un produit et dire ce que change le travail de l’opérateur.',
  rubrique: 'simulog',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.1'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  precedente: 'action-prise-de-poste',
  pret: false,
};

export function rendre(racine) {
  racine.innerHTML = '<p>Séance en construction.</p>';
}
