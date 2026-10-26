// Corrigé d'ENT-12.6 (IKEA, « l'armoire de Mme Benali »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/ikea-ent126-donnees.js`) : le second client (1 sur 4), la marge de la caisse (les deux commandes tiennent ou non) et l'ordre de départ des colis.
// `CORRIGE` donne ce qui est commun ; `corrigeEleve` rend le corrigé d'un élève, CALCULÉ depuis sa base. N'importe que les données pures : se charge aussi sous Node.

import {
  ID, TIRAGE, BENALI, CLIENTS2, LEURRES, SEUIL_KG, SEUIL_M, CAISSE_M3, MARGE_PARCOURS, aDeux, rang, volume, arr2, mLib, dimLib, meilleurParcours, longueurParcours,
  jeuDeVal, jeuDe, colisDe, ordreDepart, seuilParcours,
} from '../ikea-ent126-donnees.js';

const RANG = ['lourd ou long', 'normal', 'fragile'];
const etat = (c) => `${c.lib} : ${c.kg} kg, ${dimLib(c)}, à ${c.pos} m du quai — ${aDeux(c) ? 'à deux' : 'seul'} (${RANG[rang(c)]})`;

export const CORRIGE = {
  code: 'ENT-12.6',
  titre: 'IKEA — l’armoire de Mme Benali',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Le bon (4 points)', genre: 'question', texte: 'Les colis des deux commandes, et eux seuls',
      rep: `Les cinq colis de Mme Benali (armoire en trois colis, canapé en deux) et les trois colis du second client (tiré parmi ${CLIENTS2.map((c) => c.client).join(', ')}). `
        + `Les deux colis à ne pas prendre (${LEURRES.map((c) => c.lib.split(' — ')[0]).join(', ')}) sont d’une autre commande.`,
      note: 'Le bon dit les numéros de commande : il faut les rapprocher de ceux des colis. Les huit exacts, aucun en plus ni en moins : 4 points, sinon 0.' },
    { etape: 2, etapeTitre: 'Le prélèvement (4 + 2 points)', genre: 'question', texte: 'L’ordre des colis et le parcours',
      rep: 'Les colis lourds ou longs d’abord (le plus proche du quai au plus lointain), les colis normaux ensuite, les colis fragiles à la fin.',
      note: `Ordre juste : 4 points (plusieurs ordres conviennent : seul le rang compte). Parcours : 2 points si la longueur du parcours est au plus celle du plus court des ordres justes + ${MARGE_PARCOURS} m (pour chaque élève). `
        + 'Départ mélangé par élève : jamais déjà juste, jamais déjà sous le seuil.' },
    { etape: 3, etapeTitre: 'Seul ou à deux ? (4 points)', genre: 'question', texte: 'Qui porte quoi',
      rep: `À deux : un colis de plus de ${SEUIL_KG} kg ou de plus de ${SEUIL_M} m de long. Seul : les autres. Les cinq colis de Mme Benali sont tous à deux ; chez le second client, un seul colis l’est. `
        + 'Cas limites : 25 kg ou 2 m pile se portent seuls.',
      note: 'Consigne de la zone CONSTRUITE, plus prudente que la loi (le Code du travail parle de 55 kg portés de façon habituelle). Les huit lignes justes : 4 points, sinon 0 (tout mettre « à deux » ne rapporte rien).' },
    { etape: 4, etapeTitre: 'La caisse mobile (2 points)', genre: 'question', texte: 'Le volume des deux commandes, et tiennent-elles ?',
      rep: `Volume = longueur × largeur × hauteur de chaque colis, additionnés (entre 2 et 2,2 m³ selon le second client). La caisse contient ${CAISSE_M3} m³ au plus (une seule source) : on compare avec la place qui reste.`,
      note: 'Le volume juste à 0,1 m³ près et la bonne réponse (tiennent ou non) : 2 points. La marge est tirée : les commandes tiennent pour la moitié des élèves.' },
    { etape: 5, etapeTitre: 'Les questions de Moussa (4 points)', genre: 'question', texte: 'Trois questions notées au fil du travail',
      rep: 'Pourquoi commencer par le plus lourd (en bas du chariot, n’écrase rien) 1,5 · pourquoi à deux (lourd et long : risque pour le dos et les autres) 1,5 · ton parcours et le plus court (un seul sens : les lourds en s’éloignant, le reste au retour) 1, corrigée au bilan.',
      note: 'Une réflexion non notée : porter 60 kg tous les jours (seulement si le médecin du travail a reconnu l’aptitude). « Avant de commencer » (trois questions tirées) n’est pas noté.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const J = jeuDe(db), colis = colisDe(db), M = meilleurParcours(colis);
  const items = [
    { genre: 'fait', texte: 'Le second client', rep: `${J.client.client} (commande ${J.client.num})` },
    { genre: 'fait', texte: 'Les huit colis', rep: colis.map(etat).join(' · ') },
    { genre: 'fait', texte: 'Son ordre de départ', rep: ordreDepart(db).map((id) => colis.find((c) => c.id === id).lib.split(' — ')[0] + ` (${colis.find((c) => c.id === id).pos} m)`).join(' · ') },
    { genre: 'fait', texte: 'Un ordre juste et le plus court', rep: `${M.ordre.map((id) => colis.find((c) => c.id === id).lib.split(' — ')[0] + ` (${colis.find((c) => c.id === id).pos} m)`).join(' · ')} — ${M.m} m ; seuil du jalon : ${seuilParcours(db)} m` },
    { genre: 'fait', texte: 'La caisse mobile', rep: `Volume des deux commandes : ${mLib(J.total)} m³ ; déjà chargé : ${mLib(J.deja)} m³ ; place libre avant chargement : ${mLib(arr2(CAISSE_M3 - J.deja))} m³, pour ${mLib(J.total)} m³ à charger → ${J.marge >= 0 ? 'elles tiennent' : 'elles ne tiennent pas'}` },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
