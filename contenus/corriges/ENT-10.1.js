// Corrigé d'ENT-10.1 (Transports Pelleau, de Plabennec à l'entrepôt neuf), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/pelleau-ent101-donnees.js`) : ses tâches de « Qui est qui ? » (3, + 1 chez un confirmé), ses
// 4 étapes de l'histoire et leur ordre de départ, ses travaux de « Ce que fait Pelleau » (3, + 1), ses situations de « Ce que je change »
// (2, + 1). `CORRIGE` donne ce qui est commun ; `corrigeEleve` rend le corrigé d'un élève, calculé depuis sa base (jamais recopié). La carte
// est la même pour tous (Saint-Pol-de-Léon : confirmé seulement). Chargé aussi sous Node (test des corrigés) : aucun import du moteur.

import {
  ID, TIRAGE, LIEUX_CARTE, PERSONNES, METIERS, TACHES, ETAPES_HISTOIRE, TRAVAUX, SITUATIONS, tachesSocle, etapesDe, etapesJustes,
  travauxSocle, situationsSocle, libPersonne, libMetier, libEtape, libSituation,
} from '../pelleau-ent101-donnees.js';
import { FRANCE } from '../france-contours.js';

// Même forme que `corrigeLocaliser` de `core/types/localiser.js` (nom, région et département en clair avec leur code, ville, bonus).
const REG = new Map(FRANCE.regions.map((r) => [r.code, r])), DEP = new Map(FRANCE.deps.map((d) => [d.code, d]));
const CARTE = LIEUX_CARTE.map((l) => ({ id: l.id, nom: l.nom, bonus: !!l.bonus, ville: l.ville,
  region: `${REG.get(l.region).nom} (${l.region})`, departement: `${DEP.get(l.dep).nom} (${l.dep})` }));
const lieuEnClair = (c) => `${c.nom} : région ${c.region} · département ${c.departement} · ville ${c.ville}`;
const chrono = ETAPES_HISTOIRE.slice().sort((a, b) => a.an - b.an);

export const CORRIGE = {
  code: 'ENT-10.1',
  titre: 'Transports Pelleau — de Plabennec à l’entrepôt neuf',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame et demi-page de cours de Cowork après validation à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Qui est qui ?', genre: 'tableau', texte: 'Les 7 tâches de la banque et qui les fait (chaque élève en a 3 : une facile, une moyenne, une difficile, 3 personnes différentes)',
      entetes: ['Tâche', 'Qui la fait'],
      reponses: TACHES.map((p) => [`${p.texte} (${p.difficulte})`, libPersonne(p.qui)]),
      note: `Les 4 personnes sont offertes à chaque ligne : ${PERSONNES.map((p) => p.lib).join(' · ')}.` },
    { etape: 2, etapeTitre: 'La carte de France', genre: 'tableau', texte: 'Lieu par lieu (même carte pour tous ; Saint-Pol-de-Léon : confirmé seulement)',
      entetes: ['Lieu', 'Région', 'Département', 'Ville'],
      reponses: CARTE.map((c) => [`${c.nom}${c.bonus ? ' (bonus)' : ''}`, c.region, c.departement, c.ville]),
      note: 'Notés au PREMIER essai : la région et le département (1 point chacun) ; la ville se joue sans note. Après deux erreurs sur une même étape, la bonne zone est entourée. La carte ne se rejoue pas.' },
    { etape: 3, etapeTitre: 'L’histoire de Pelleau', genre: 'tableau', texte: 'Les 6 étapes de la banque, dans l’ordre (chaque élève en a 4 : toujours 2026, une d’avant 1960, deux d’après)',
      entetes: ['Année', 'Étape'],
      reponses: chrono.map((e) => [String(e.an), e.lib]),
      note: 'L’ordre de départ est mélangé par élève et ne place AUCUNE étape à son rang juste : envoyer sans rien toucher vaut 0. 0,75 par étape à sa place.' },
    { etape: 4, etapeTitre: 'Ce que fait Pelleau', genre: 'tableau', texte: 'Les 6 travaux de la banque et leur métier (chaque élève en a 3, de 3 métiers différents)',
      entetes: ['Travail', 'Métier'],
      reponses: TRAVAUX.map((p) => [`${p.texte} (${p.difficulte})`, libMetier(p.metier)]),
      note: `Les 3 métiers sont offerts à chaque ligne : ${METIERS.map((m) => m.lib).join(' · ')}.` },
    { etape: 5, etapeTitre: 'Ce que je change', genre: 'tableau', texte: 'Les 4 situations de la banque (chaque élève en a 2)',
      entetes: ['Situation', 'Ce qui se passe'],
      reponses: SITUATIONS.map((p) => [p.texte, libSituation(p)]) },
    { etape: 6, etapeTitre: 'Les questions d’Erwan', genre: 'question', texte: 'Les réponses attendues',
      rep: 'A (carte, Rungis) : 6 h du matin, le lendemain. B (après « Ce que fait Pelleau ») : pour garder ses clients, il transporte et il garde leur marchandise. '
        + 'D (« Ce que je change », corrigée au bilan) : Pelleau, qui la garde (Code civil, art. 1927, 1928 et 1932). C (réflexion, non notée) : pas de réponse attendue.' },
    { etape: 7, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '18 jalons pondérés (16 points) et 3 questions notées (4 points), total 20 : Qui est qui ? 3 (1 par tâche) ; la carte 6 (région et département des 3 lieux, 1 chacun) ; '
        + 'l’histoire 3 (0,75 par étape à sa place) ; ce que fait Pelleau 2 (2/3 par travail) ; ce que je change 2 (1 par situation) ; questions d’Erwan 4 '
        + '(A 1 ; B 1,5 ; D 1,5). C n’est pas notée.',
      note: 'Poids validés par Tristan le 18/10/2026. Premier bilan, puis « Corriger » rouvre les fiches fausses (note = moyenne du premier bilan et de la première correction). '
        + 'Confirmé : une tâche, un travail, une situation et le lieu de Saint-Pol-de-Léon (2 cas) en plus, +0,5 par cas juste, caché à l’élève.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const items = [];
  const ligne = (fiche, p, i, rep, bonus) => ({ genre: 'fait', bonus, texte: `${fiche}, ligne ${i + 1} : ${p.texte}`, rep });
  const T = tachesSocle(db), TB = TIRAGE.piecesBonus(db, 'taches');
  T.forEach((p, i) => items.push(ligne('Qui est qui ?', p, i, libPersonne(p.qui), false)));
  TB.forEach((p, k) => items.push(ligne('Qui est qui ?', p, T.length + k, libPersonne(p.qui), true)));
  CARTE.forEach((c) => items.push({ genre: 'fait', bonus: c.bonus, texte: `Carte : ${c.nom}${c.bonus ? ' (confirmé)' : ''}`, rep: lieuEnClair(c) }));
  items.push({ genre: 'fait', texte: 'L’histoire : son ordre de départ', rep: etapesDe(db).map((p) => libEtape(p.id)).join(' · ') });
  items.push({ genre: 'fait', texte: 'L’histoire : l’ordre juste', rep: etapesJustes(db).map((id) => `${ETAPES_HISTOIRE.find((e) => e.id === id).an} ${libEtape(id)}`).join(' → ') });
  const M = travauxSocle(db), MB = TIRAGE.piecesBonus(db, 'travaux');
  M.forEach((p, i) => items.push(ligne('Ce que fait Pelleau', p, i, libMetier(p.metier), false)));
  MB.forEach((p, k) => items.push(ligne('Ce que fait Pelleau', p, M.length + k, libMetier(p.metier), true)));
  const S = situationsSocle(db), SB = TIRAGE.piecesBonus(db, 'situations');
  S.forEach((p, i) => items.push(ligne('Ce que je change', p, i, libSituation(p), false)));
  SB.forEach((p, k) => items.push(ligne('Ce que je change', p, S.length + k, libSituation(p), true)));
  if (!ouvert) {
    return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une tâche, un travail, une situation et le lieu de Saint-Pol-de-Léon).', items };
  }
  return { texte: '', items };
}
