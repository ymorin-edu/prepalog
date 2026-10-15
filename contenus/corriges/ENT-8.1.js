// Corrigé d’ENT-8.1 (Action, d’où viennent les produits du magasin de Nîmes ?), montré dans l’onglet « Corrigés » de l’enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/action-ent81-donnees.js`) : ses acteurs de « Qui est qui ? » (Geodis + 3), ses situations de
// « Ce que je change » (3, + 1 chez un confirmé) et l’ordre de départ de « La chaîne ». `CORRIGE` donne ce qui est commun ; `corrigeEleve`
// rend le corrigé d’un élève, calculé depuis sa base (jamais recopié). La carte est la même pour tous (Labastide : confirmé seulement).

import { ID, TIRAGE, ROLES, CHAINE, PLACE_JUSTE, acteursDe, situationsSocle, ordreDepart, libRole, libChaine } from '../action-ent81-donnees.js';
import { LIEUX } from '../action.js';
import { FRANCE } from '../france-contours.js';

// Le corrigé se calcule ici depuis l’univers et les contours, sans importer le moteur : le test des corrigés de trame
// (`outils/test/spartoo.mjs`) charge chaque corrigé sous Node, où `window` n’existe pas. Même forme que `corrigeLocaliser`
// de `core/types/localiser.js` (nom, région et département en clair avec leur code, ville, bonus).
const REG = new Map(FRANCE.regions.map((r) => [r.code, r])), DEP = new Map(FRANCE.deps.map((d) => [d.code, d]));
const CARTE = LIEUX.map((l) => ({ id: l.id, nom: l.nom, bonus: !!l.bonus, ville: l.ville,
  region: `${REG.get(l.region).nom} (${l.region})`, departement: `${DEP.get(l.dep).nom} (${l.dep})` }));
const lieuEnClair = (c) => `${c.nom} : région ${c.region} · département ${c.departement} · ville ${c.ville}`;

export const CORRIGE = {
  code: 'ENT-8.1',
  titre: 'Action — d’où viennent les produits du magasin de Nîmes ?',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame et cours d’une demi-page de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Qui est qui ?', genre: 'tableau', texte: 'Les 7 acteurs de la banque et leur rôle (chaque élève en a 4 : Geodis + 3 tirés)',
      entetes: ['Acteur', 'Rôle attendu'],
      reponses: TIRAGE.decl.banques.acteurs.pieces.map((p) => [p.nom, libRole(p.role)]),
      note: `Les 7 rôles sont offerts à chaque ligne : ${ROLES.map((r) => r.lib).join(' · ')}. Piège : Action (possède les magasins) et le magasin de Nîmes (vend aux clients).` },
    { etape: 2, etapeTitre: 'La carte de France', genre: 'tableau', texte: 'Lieu par lieu (même carte pour tous ; Labastide : confirmé seulement)',
      entetes: ['Lieu', 'Région', 'Département', 'Ville'],
      reponses: CARTE.map((c) => [`${c.nom}${c.bonus ? ' (bonus)' : ''}`, c.region, c.departement, c.ville]),
      note: 'Notés au PREMIER essai : la région et le département (0,75 chacun) ; la ville se joue sans note. Après deux erreurs sur une même étape, la bonne zone est entourée. La carte ne se rejoue pas.' },
    { etape: 3, etapeTitre: 'La chaîne', genre: 'question', texte: 'L’ordre juste, et « Toi, tu travailles ici »',
      rep: `${CHAINE.map((c) => c.lib).join(' → ')}. Ici : ${libChaine(PLACE_JUSTE)}.`,
      note: 'L’ordre de départ est mélangé par élève et n’est jamais l’ordre juste : envoyer sans rien toucher est faux.' },
    { etape: 4, etapeTitre: 'Ce que je change', genre: 'tableau', texte: 'Les 8 situations de la banque (chaque élève en a 3 : une facile, une moyenne, une difficile)',
      entetes: ['Situation', 'Ce qui arrive au magasin de Nîmes'],
      reponses: TIRAGE.decl.banques.situations.pieces.map((p) => [`${p.texte} (${p.difficulte})`, (p.choix.find((c) => c.v === p.juste) || {}).lib]) },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '16 jalons pondérés et 3 questions notées, total 20 : Qui est qui ? 4 (1 par acteur) ; la carte 4,5 (région et département des 3 lieux, 0,75 chacun) ; '
        + 'la chaîne 4 (ordre 2,5 ; où tu travailles 1,5) ; ce que je change 3,5 (facile 1, moyenne 1,25, difficile 1,25) ; questions de Samia 4 '
        + '(A le lien Action-Geodis 1,5 ; D les conteneurs 1,5 ; E qui remarque l’erreur 1). C (pourquoi Marseille) n’est pas notée.',
      note: 'Poids validés par Tristan le 15/10/2026 (option B). Premier bilan, puis « Corriger » rouvre les fiches fausses (note = moyenne du premier bilan et de la première correction). '
        + 'Confirmé : lieu bonus (Labastide, 2 cas) et situation bonus (1 cas), +0,5 par cas juste, caché à l’élève.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const items = [];
  acteursDe(db).forEach((p, i) => items.push({ genre: 'fait', texte: `Qui est qui ? ligne ${i + 1} : ${p.nom}`, rep: libRole(p.role) }));
  CARTE.filter((c) => !c.bonus).forEach((c) => items.push({ genre: 'fait', texte: `Carte : ${c.nom}`, rep: lieuEnClair(c) }));
  CARTE.filter((c) => c.bonus).forEach((c) => items.push({ genre: 'fait', bonus: true, texte: `Carte : ${c.nom} (confirmé)`, rep: lieuEnClair(c) }));
  items.push({ genre: 'fait', texte: 'La chaîne : son ordre de départ', rep: ordreDepart(db).map(libChaine).join(' · ') });
  items.push({ genre: 'fait', texte: 'La chaîne : ordre juste et lieu de travail', rep: `${CHAINE.map((c) => c.lib).join(' → ')} ; ici : ${libChaine(PLACE_JUSTE)}` });
  const sit = (p, i, bonus) => ({ genre: 'fait', bonus, texte: `Ce que je change, ligne ${i + 1} (${p.difficulte}) : ${p.texte}`,
    rep: (p.choix.find((c) => c.v === p.juste) || {}).lib });
  const socle = situationsSocle(db);
  socle.forEach((p, i) => items.push(sit(p, i, false)));
  TIRAGE.piecesBonus(db, 'situations').forEach((p, k) => items.push(sit(p, socle.length + k, true)));
  if (socle[0]) items.push({ genre: 'fait', texte: 'Question E (Samia) : sa situation', rep: `« ${socle[0].texte} » → le personnel du magasin, en ouvrant les colis ou en remplissant le rayon` });
  if (!ouvert) {
    return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une situation et le lieu de Labastide).', items };
  }
  return { texte: '', items };
}
