// Corrigé d'ENT-13.1 (Stellantis, « une voiture par minute »), montré dans l'onglet « Corrigés » de l'enseignant.
// Chaque élève a reçu SON ordre de départ, SES voitures du jour et SA part de 5008 (`contenus/stellantis-ent131-donnees.js`) ; `CORRIGE` donne ce qui est commun, `corrigeEleve` le tirage d'un élève.
// N'importe que les données pures : se charge aussi sous Node.

import { ID, TIRAGE, VOYAGE, ORDRE_VOYAGE, libEtape, ordreDepart, voituresDuJour, partCinq, cinqCents, PAR_HEURE, STOCK_RAISONS, MANQUE_EFFETS, JUSTE_STOCK, JUSTE_MANQUE, PHRASES, phrasesDepart } from '../stellantis-ent131-donnees.js';

const lib = (liste, v) => (liste.find((x) => x.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-13.1',
  titre: 'Stellantis — une voiture par minute',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'La carte de France (4 points)', genre: 'question', texte: 'Où sont l’usine et son fournisseur voisin ?',
      rep: 'Usine de Sochaux : région Bourgogne-Franche-Comté (27), département du Doubs (25). Équipementier voisin : Rougegoutte, Territoire de Belfort (90), même région.',
      note: 'Notés au PREMIER essai : la région et le département de chaque lieu (1 point chacun). La ville se joue sans note. Les places sont approchées (centre de la commune). Lieu bonus du confirmé, non noté : Lure-Malbouhans (Haute-Saône, 70).' },
    { etape: 2, etapeTitre: 'Le voyage d’une pièce (5 points)', genre: 'question', texte: 'L’ordre juste des 8 étapes',
      rep: VOYAGE.map((e) => e.lib).join(' → '),
      note: 'Départ mélangé par élève (au moins deux inversions). Ordre exact : 5 points, sinon 0.' },
    { etape: 3, etapeTitre: 'Les chiffres de l’usine (5 points)', genre: 'tableau', texte: 'Les quatre réponses',
      entetes: ['Question', 'Réponse attendue'],
      reponses: [
        ['Voitures par heure (1 point)', `${PAR_HEURE}`],
        ['Nombre de 5008 du jour (2 points)', 'voitures du jour × part de 5008 ÷ 100, à 3 % près (voir le tirage de l’élève)'],
        ['Pourquoi si peu de stock (1 point)', lib(STOCK_RAISONS, JUSTE_STOCK)],
        ['Une pièce manque au bord de la ligne (1 point)', lib(MANQUE_EFFETS, JUSTE_MANQUE)],
      ],
      note: 'Rien n’est vrai avant l’envoi de la fiche.' },
    { etape: 4, etapeTitre: 'Usine ou entrepôt ? (3 points)', genre: 'tableau', texte: 'Six phrases, 0,5 point chacune',
      entetes: ['Phrase', 'Réponse attendue'],
      reponses: PHRASES.map((p) => [p.lib, p.juste === 'usine' ? 'Plutôt l’usine de Sochaux' : 'Plutôt un entrepôt de distribution']),
      note: 'Les phrases sont dans un ordre différent pour chaque élève.' },
    { etape: 5, etapeTitre: 'Les questions de Karim (3 points)', genre: 'question', texte: 'Quatre questions notées au fil du travail (0,75 chacune)',
      rep: 'Rougegoutte : la pièce peut arriver le jour même · le transstockeur : 6 minutes, donc 6 voitures · 1 km devenu 150 à 200 m : cinq à sept fois plus court · ★ l’externalisation : des fournisseurs spécialisés, l’usine se concentre sur le montage (corrigée au bilan).',
      note: 'Une réflexion non notée, posée à tous en fin de séance (les voitures garées à Lure-Malbouhans en 2022). « Avant de commencer » (trois questions tirées) n’est pas noté.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const v = voituresDuJour(db), p = partCinq(db);
  const items = [
    { genre: 'fait', texte: 'Le voyage : son ordre de départ', rep: ordreDepart(db).map((x) => libEtape(x)).join(' · ') },
    { genre: 'fait', texte: 'Le voyage : l’ordre juste', rep: ORDRE_VOYAGE.map((x) => libEtape(x)).join(' → ') },
    { genre: 'fait', texte: 'Les 5008 du jour', rep: `${v} voitures, dont ${p} % de 5008 : ${v} × ${p} ÷ 100 = ${Math.round(cinqCents(v, p))} environ.` },
    { genre: 'fait', texte: 'Usine ou entrepôt : son ordre', rep: phrasesDepart(db).map((x) => x.id).join(' · ') },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
