// Corrigé d’ENT-11.1 (Mondial Relay, le voyage d’un colis), montré dans l’onglet « Corrigés » de l’enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/mondial-relay-ent111-donnees.js`) : le colis d’Inès (pièce fixe) + six colis de la banque (deux faciles,
// trois moyens, un difficile ; un confirmé en reçoit deux de plus) et l’ordre de départ du voyage. `CORRIGE` donne ce qui est commun ;
// `corrigeEleve` rend le corrigé d’un élève, CALCULÉ depuis sa base et les règles (`classer`), jamais recopié.

import { ID, TIRAGE, VOYAGE, COLIS, CLASSES, classer, colisDe, ordreDepart, libVoyage, libClasse, decrireColis } from '../mondial-relay-ent111-donnees.js';
import { REGLES_COLIS } from '../mondial-relay.js';
import { FRANCE } from '../france-contours.js';

const REG = new Map(FRANCE.regions.map((r) => [r.code, r])), DEP = new Map(FRANCE.deps.map((d) => [d.code, d]));
const reg = REG.get('44'), dep = DEP.get('10');

export const CORRIGE = {
  code: 'ENT-11.1',
  titre: 'Mondial Relay — le voyage d’un colis',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'La carte de France', genre: 'question', texte: 'Où est le hub de Buchères ?',
      rep: `Région ${reg.nom} (44) · département ${dep.nom} (10) · ville Buchères, près de Troyes.`,
      note: 'Notés au PREMIER essai : la région et le département (2 points chacun). La ville se joue sans note. Après deux erreurs sur une même étape, la bonne zone est entourée. La carte ne se rejoue pas.' },
    { etape: 2, etapeTitre: 'Le voyage du colis', genre: 'question', texte: 'L’ordre juste des 7 étapes',
      rep: VOYAGE.map((e) => e.lib).join(' → '),
      note: 'Départ mélangé par élève et jamais à une inversion de l’ordre juste. Ordre exact : 6 points ; une seule inversion (deux étapes voisines échangées) : 3 points ; sinon 0.' },
    { etape: 3, etapeTitre: 'Peut-il voyager ?', genre: 'tableau', texte: 'Les 13 colis de la banque et leur classement (chaque élève en a 7 : le colis d’Inès + 6 tirés)',
      entetes: ['Colis', 'Classement attendu'],
      reponses: COLIS.map((c) => [`${decrireColis(c)}${c.difficulte ? ` (${c.difficulte})` : ''}${c.interdit ? ` — contient : ${c.interdit}` : ''}`, libClasse(classer(c))]),
      note: `Règle : locker si le colis respecte ${REGLES_COLIS.locker.poidsMax} kg, ${REGLES_COLIS.locker.longueurMax} cm de long et ${REGLES_COLIS.locker.sommeMax} cm pour les trois côtés ; `
        + `sinon Point Relais s’il respecte ${REGLES_COLIS.relais.poidsMax} kg, ${REGLES_COLIS.relais.longueurMax} cm et ${REGLES_COLIS.relais.sommeMax} cm ; sinon refusé, ou refusé d’office si le contenu est interdit. `
        + `Classes proposées : ${CLASSES.map((c) => c.lib).join(', ')}.` },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '16 jalons pondérés et 3 questions notées, total 20 : la carte 4 (région 2, département 2) ; le voyage 6 (ordre exact 3 + ordre à une inversion près 3) ; '
        + 'les règles du colis 6 (le colis d’Inès 0,75 ; les six colis tirés 0,875 chacun) ; les questions de Romain 4 (le colis au hub 1,5 ; le colis non retiré 1,5 ; le colis de 27 kg 1). '
        + 'Les deux questions de réflexion (axes routiers, Points Relais des petits villages) ne sont pas notées.',
      note: 'Poids validés par Tristan le 26/10/2026. Premier bilan, puis « Corriger » rouvre les fiches fausses (note = moyenne du premier bilan et de la première correction). '
        + 'Confirmé : deux colis difficiles en plus, +0,5 par cas juste, caché à l’élève.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const items = [];
  items.push({ genre: 'fait', texte: 'Le voyage : son ordre de départ', rep: ordreDepart(db).map(libVoyage).join(' · ') });
  items.push({ genre: 'fait', texte: 'Le voyage : l’ordre juste', rep: VOYAGE.map((e) => e.lib).join(' → ') });
  const socle = colisDe(db).length - TIRAGE.piecesBonus(db, 'colis').length;
  colisDe(db).forEach((c, i) => items.push({ genre: 'fait', bonus: i >= socle,
    texte: `Peut-il voyager ? ligne ${i + 1} : ${decrireColis(c)}${c.interdit ? ` (contient : ${c.interdit})` : ''}`, rep: libClasse(classer(c)) }));
  if (!ouvert) {
    return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus deux colis difficiles).', items };
  }
  return { texte: '', items };
}
