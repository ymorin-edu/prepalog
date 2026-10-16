// Corrigé d’ENT-8.3 (Action, un autre site, un autre prestataire), montré dans l’onglet « Corrigés » de l’enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/action-ent83-donnees.js`) : ses entrepôts (Labastide + 2) et ses acteurs (2) de « Qui est qui ? »,
// les deux cases fausses de « La chaîne de Romain », ses situations de « Ce que je change » (3, + 1 chez un confirmé). `CORRIGE` donne ce qui
// est commun ; `corrigeEleve` rend le corrigé d’un élève, calculé depuis sa base (jamais recopié). La carte est la même pour tous (Onnaing :
// confirmé seulement).

import {
  ID, TIRAGE, LIEUX_83, ENTREPOTS, ACTEURS, ROLES, CHAINE, ERREURS, SITUATIONS, entrepotsDe, acteursDe, erreursDe, situationsSocle,
  libRole, libExploitant, justeDeCase,
} from '../action-ent83-donnees.js';
import { FRANCE } from '../france-contours.js';

// Le corrigé se calcule ici depuis les lieux et les contours, sans importer le moteur : le test des corrigés de trame charge chaque
// corrigé sous Node, où `window` n’existe pas. Même forme que `corrigeLocaliser` de `core/types/localiser.js`.
const REG = new Map(FRANCE.regions.map((r) => [r.code, r])), DEP = new Map(FRANCE.deps.map((d) => [d.code, d]));
const CARTE = LIEUX_83.map((l) => ({ id: l.id, nom: l.nom, bonus: !!l.bonus, ville: l.ville,
  region: `${REG.get(l.region).nom} (${l.region})`, departement: `${DEP.get(l.dep).nom} (${l.dep})` }));
const lieuEnClair = (c) => `${c.nom} : région ${c.region} · département ${c.departement} · ville ${c.ville}`;
const justeSit = (p) => (p.choix.find((c) => c.v === p.juste) || {}).lib;

export const CORRIGE = {
  code: 'ENT-8.3',
  titre: 'Action — un autre site, un autre prestataire',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame et cours de Cowork après validation à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'La carte de France', genre: 'tableau', texte: 'Lieu par lieu (même carte pour tous ; Onnaing : confirmé seulement)',
      entetes: ['Lieu', 'Région', 'Département', 'Ville'],
      reponses: CARTE.map((c) => [`${c.nom}${c.bonus ? ' (bonus)' : ''}`, c.region, c.departement, c.ville]),
      note: 'Notés au PREMIER essai : la région et le département (0,75 chacun) ; la ville se joue sans note. Les points de Roques et d’Onnaing sont au centre de la commune. La carte ne se rejoue pas.' },
    { etape: 2, etapeTitre: 'Qui est qui ? (entrepôts)', genre: 'tableau', texte: 'Les 6 entrepôts de la banque et qui les fait tourner (chaque élève : Labastide + 2 tirés, au moins deux exploitants différents)',
      entetes: ['Entrepôt', 'Qui le fait tourner'],
      reponses: ENTREPOTS.map((p) => [p.nom, libExploitant(p.exploitant)]) },
    { etape: 2, etapeTitre: 'Qui est qui ? (rôles)', genre: 'tableau', texte: 'Les 5 acteurs de la banque et leur rôle (chaque élève en a 2 : un facile, un moyen)',
      entetes: ['Acteur', 'Rôle attendu'],
      reponses: ACTEURS.map((p) => [p.nom, libRole(p.role)]),
      note: `Les 7 rôles sont offerts à chaque ligne : ${ROLES.map((r) => r.lib).join(' · ')}.` },
    { etape: 3, etapeTitre: 'La chaîne de Romain', genre: 'tableau', texte: 'La chaîne juste, et les 6 erreurs possibles (chaque élève en a 2, sur deux cases différentes)',
      entetes: ['Case', 'Étiquette juste', 'Erreur possible'],
      reponses: CHAINE.map((c) => [String(c.n), c.lib, ERREURS.filter((e) => e.n === c.n).map((e) => `${e.lib} (${e.niveau})`).join(' ; ') || '—']),
      note: 'Jugée sans ordre : peu importe quelle ligne nomme quelle erreur. Une case juste nommée ne rapporte rien ; la même case nommée deux fois ne compte qu’une fois. 1 point par erreur trouvée, 1 point par erreur corrigée.' },
    { etape: 4, etapeTitre: 'Ce que je change', genre: 'tableau', texte: 'Les 8 situations de la banque (chaque élève en a 3 : une facile, une moyenne, une difficile)',
      entetes: ['Situation', 'Ce qui arrive au magasin de Roques'],
      reponses: SITUATIONS.map((p) => [`${p.texte} (${p.difficulte})`, justeSit(p)]) },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '16 jalons pondérés et 3 questions notées, total 20 : la carte 4,5 (région et département des 3 lieux, 0,75 chacun) ; Qui est qui ? 4 '
        + '(3 entrepôts à 0,75 ; 2 rôles à 0,875) ; la chaîne 4 ; ce que je change 3,5 (facile 1, moyenne 1,25, difficile 1,25) ; questions de Romain 4 '
        + '(L changer de prestataire 1,5 ; N comme chez Geodis 1 ; P les deux planchers 1,5).',
      note: 'Poids validés par Tristan le 15/10/2026. Premier bilan, puis « Corriger » rouvre les fiches fausses (note = moyenne du premier bilan et de la première correction). '
        + 'Confirmé : lieu bonus (Onnaing, 2 cas) et situation bonus (1 cas), +0,5 par cas juste, caché à l’élève.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const items = [];
  CARTE.filter((c) => !c.bonus).forEach((c) => items.push({ genre: 'fait', texte: `Carte : ${c.nom}`, rep: lieuEnClair(c) }));
  CARTE.filter((c) => c.bonus).forEach((c) => items.push({ genre: 'fait', bonus: true, texte: `Carte : ${c.nom} (confirmé)`, rep: lieuEnClair(c) }));
  entrepotsDe(db).forEach((p, i) => items.push({ genre: 'fait', texte: `Qui fait tourner, ligne ${i + 1} : ${p.nom}`, rep: libExploitant(p.exploitant) }));
  acteursDe(db).forEach((p, i) => items.push({ genre: 'fait', texte: `Son rôle, ligne ${i + 1} : ${p.nom}`, rep: libRole(p.role) }));
  erreursDe(db).forEach((e) => items.push({ genre: 'fait', texte: `La chaîne : case n° ${e.n}, dessinée « ${e.lib} »`, rep: `devrait dire « ${justeDeCase(e.n).lib} »` }));
  const sit = (p, i, bonus) => ({ genre: 'fait', bonus, texte: `Ce que je change, ligne ${i + 1} (${p.difficulte}) : ${p.texte}`, rep: justeSit(p) });
  const socle = situationsSocle(db);
  socle.forEach((p, i) => items.push(sit(p, i, false)));
  TIRAGE.piecesBonus(db, 'situations').forEach((p, k) => items.push(sit(p, socle.length + k, true)));
  if (!ouvert) {
    return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une situation et le lieu d’Onnaing).', items };
  }
  return { texte: '', items };
}
