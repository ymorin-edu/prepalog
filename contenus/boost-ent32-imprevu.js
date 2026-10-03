// Boost — ENT-3.2, l'IMPRÉVU de la phase 2 : ce qui change dans la journée quand le message de
// M. Morin arrive. Données pures, sans import : lues par la séance (`contenus/boost-ent32.js`)
// ET par l'outil de calage (`outils/carte/calibrer.mjs`), qui vérifie qu'elles tiennent les
// propriétés du brief `docs/briefs/ENT-3.2-imprevu.md` (§4). Un seul endroit où elles s'écrivent.
//
// Choix de Tristan du 03/10/2026, parmi trois imprévus calés par énumération complète :
//   · l'Atelier Ribot (c3) annule sa commande ;
//   · le créneau CHANGE DE CLIENT : la Pâtisserie Arnaud (c6) n'en a plus, l'Épicerie Roussel
//     (c8) ferme tôt et n'accepte qu'avant 14 h 55 (recalé au chantier D, lot 2 : 14 h 40 avant).
// Avancer le créneau de la Pâtisserie, comme dans la maquette, ne forçait rien : la meilleure
// tournée de la phase 1 commence chez elle (arrivée vers 14 h 34 au plus tôt), donc l'élève
// n'avait qu'à retirer le client annulé. Ici, AUCUNE des 264 tournées justes de la phase 1 ne
// tient plus, même client annulé retiré : il faut replanifier.
//
// Tout est CONSTRUIT (commerces inventés, annulation, fermeture) : rien de réel chez Boost.

export const IMPREVU = {
  annules: ['c3'],
  creneaux: {
    c6: null,
    c8: { avant: 14 * 60 + 55, libelle: 'livraison avant 14 h 55' },
  },
  // La Cave Teissier reste à quai (le message le dit) : sans ça, le client annulé libère assez
  // de place pour que plusieurs commandes puissent rester à quai, et le calcul n'a plus une
  // seule réponse. Décision de Tristan, 03/10/2026.
  aQuai: 'c5',
};
