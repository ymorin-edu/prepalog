// ENT-8.4 — Action, « la semaine avant Noël ». SQUELETTE posé par le chef de chantier (16/10/2026) ; la séance complète
// remplace ce fichier (brief `docs/briefs/ENT-8.4-action-avant-noel.md`, décisions : `docs/briefs/COORDINATION-action.md` §6).

export const meta = {
  id: 'action-avant-noel',
  code: 'ENT-8.4',
  titre: 'Action — la semaine avant Noël',
  desc: 'Repérer les lieux d’une réception, dire qui fait quoi, trouver et corriger une erreur du planigramme, reconnaître les documents du camion et rendre compte à son tuteur.',
  rubrique: 'simulog',
  niveaux: ['cap'],
  competences: [],
  competencesCap: ['CAP-C1.2'],
  temps: 'entrainement',
  bareme: 20,
  parcours: true,
  precedente: 'action-autre-site',
  pret: false,
};

export function rendre(racine) {
  racine.innerHTML = '<p>Séance en construction.</p>';
}
