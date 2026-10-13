// Corrigé d'ENT-7.1 (Decathlon, ton premier conteneur), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/decathlon-ent71-donnees.js`, brief §6 bis) : son conteneur, ses prix, l'offre en retard
// (le rail ou la barge), l'offre hors liste, et pour un confirmé deux offres de plus. `CORRIGE` donne ce qui est commun (le besoin, la
// méthode, le barème) ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, calculé depuis sa base (jamais recopié). Un élève qui n'a
// pas encore ouvert la séance : son tirage standard se calcule quand même (graine = son identifiant + l'id de la séance).

import { ID, TIRAGE, LIMITE, BUDGET, CRITERES, CRITERE_JUSTE, JUSTIFS, JUSTIF_JUSTE, jeuEleve } from '../decathlon-ent71-donnees.js';
import { quand, euros, kg, FACTEURS } from '../decathlon.js';

const oui = (b) => (b ? 'oui' : 'non');
const fr = (x) => new Intl.NumberFormat('fr-FR').format(x);

export const CORRIGE = {
  code: 'ENT-7.1',
  titre: 'Decathlon — ton premier conteneur',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame courte de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Lire le besoin', genre: 'tableau', texte: 'Le cadre ① du comparateur (le même pour tous)',
      entetes: ['Case', 'Réponse attendue'],
      reponses: [['Arrivée au quai au plus tard le', quand(LIMITE.iso, LIMITE.h, { long: true })], ['Budget maximum', `${euros(BUDGET)} HT`],
        ['Pour départager', CRITERES.find((c) => c.v === CRITERE_JUSTE).lib]],
      note: 'Pièges : la date de mise à disposition (mardi 26/01 à 8 h) recopiée ; le 27/01 ; l’heure oubliée ; le critère « le prix le plus bas ».' },
    { etape: 2, etapeTitre: 'Trier, comparer, décider', genre: 'question', texte: 'La méthode (les chiffres de chaque élève : choisir l’élève ci-dessus)',
      rep: '1. Écarter l’offre HORS LISTE (même moins chère et moins émettrice). 2. Écarter l’offre référencée qui arrive APRÈS jeudi 28/01 à 14 h '
        + '(le rail ou la barge, selon le tirage de l’élève). 3. Entre les deux qui restent (la route et l’autre), retenir celle qui émet le moins de '
        + `CO₂. Justification : « ${JUSTIFS.find((j) => j.v === JUSTIF_JUSTE).lib} »`,
      note: 'La route est toujours la moins chère des offres référencées, et jamais la bonne réponse. Deux voisins n’ont pas forcément la même '
        + 'réponse (barge ou rail). CO₂ = poids du conteneur (t) × km de chaque tronçon × facteur (kg CO₂ par tonne-km) : camion '
        + `${fr(FACTEURS.camion)} (ADEME), barge ${fr(FACTEURS.barge)} et rail ${fr(FACTEURS.rail)} (construits) ; km de la carte des itinéraires.` },
    { etape: 3, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '7 jalons pondérés et 3 questions notées, total 20 : lire le besoin 3 (date et heure 1,5 ; budget et critère 1,5), trier 7 (hors liste 3 ; '
        + 'hors délai 4), comparer 4 (prix et CO₂ des deux offres qui restent), décider 3 (offre 2, justification 1), questions de Claire 3 (information '
        + 'CO₂, conteneur en retard, liste référencée : 1 chacune). Rien n’est vrai avant l’envoi ; inaction 0. Une offre écartée mal reportée ne coûte '
        + 'rien au jalon « comparer » ; l’offre retenue est jugée sur le réel, même si le tri était faux.',
      note: 'Poids validés par Tristan le 13/10/2026. Confirmé : deux offres de plus (+0,5 chacune si écartée pour la bonne raison, caché à l’élève).' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const J = jeuEleve(db);
  const items = [
    { genre: 'fait', texte: 'Son conteneur', rep: `${J.conteneur} · scellé ${J.scelle} · poids brut ${kg(J.poids)}` },
    { genre: 'tableau', texte: 'Ses offres, dans l’ordre de sa fiche',
      entetes: ['Devis', 'Dans la liste ?', 'Arrivée au quai', 'Tient la date ?', 'Prix', 'CO₂'],
      reponses: J.offres.filter((o) => !o.slot.startsWith('bonus')).map((o) => [`${o.lettre} — ${o.nom}`, oui(o.referencee),
        quand(o.arrivee.iso, o.arrivee.h), oui(o.tient), euros(o.prix), kg(o.co2)]) },
  ];
  const B = J.offres.filter((o) => o.slot.startsWith('bonus'));
  if (B.length) {
    items.push({ genre: 'tableau', bonus: true, texte: 'Offres en plus (fin de tableau)', entetes: ['Devis', 'Dans la liste ?', 'Arrivée au quai', 'Tient la date ?', 'Écartée parce que'],
      reponses: B.map((o) => [`${o.lettre} — ${o.nom}`, oui(o.referencee), quand(o.arrivee.iso, o.arrivee.h), oui(o.tient),
        o.ecarte === 'liste' ? 'hors liste' : 'arrive trop tard']) });
  }
  items.push({ genre: 'question', texte: 'Sa réponse attendue',
    rep: `${J.enRetard.nom} arrive trop tard ; ${J.horsListe.nom} est hors liste. Restent ${J.restantes.map((o) => `${o.nom} (${euros(o.prix)}, ${kg(o.co2)})`).join(' et ')}. `
      + `Retenir : ${J.bonne.lettre} — ${J.bonne.nom}, ${kg(J.bonne.co2)} de CO₂.` });
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus deux offres).', items };
  return { texte: '', items };
}
