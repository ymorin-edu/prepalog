// Corrigé d'ENT-5.6 (Smoby, la palette de la commande de Noël), montré dans l'onglet « Corrigés » de
// l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/smoby-ent56.js`) et le moteur du plan
// d'entrepôt (`attendusPreparation`) : lignes du bon, réapprovisionnement, palette, mètres. Rien n'est recopié.

import { ENTREPOT, COMMANDE } from '../smoby-ent56.js';
import { attendusPreparation } from '../../core/types/entrepot.js';

const A = attendusPreparation(ENTREPOT);
const P = ENTREPOT.produits;
const virg = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
const classe = (k) => P[k].classe || '—';
const rupture = COMMANDE.lignes.find((l) => (ENTREPOT.picking[l.a] || {}).q < l.q);
const meme = (a) => Object.entries(ENTREPOT.stock).filter(([x, s]) => x.slice(0, 6) === a.slice(0, 6) && !x.includes('-N1-')
  && s.produit === ENTREPOT.stock[a].produit).map(([x]) => x);

export const CORRIGE = {
  code: 'ENT-5.6',
  titre: 'Smoby — la palette de la commande de Noël',
  items: [
    { etape: 1, etapeTitre: 'Prélever les lignes', genre: 'tableau', texte: `Le bon de préparation ${COMMANDE.num}, dans l’ordre du serpentin`,
      contexte: 'Jalon 1 : les six lignes en quantité juste, rien hors commande. Les jalons 3 à 9 ne comptent que si ce jalon est vrai.',
      entetes: ['Ligne', 'Adresse', 'Produit', 'Classe', 'Quantité'],
      reponses: COMMANDE.lignes.map((l, i) => [String(i + 1), l.a, P[l.produit].nom, classe(l.produit), String(l.q)]) },
    { etape: 2, etapeTitre: 'Traiter la rupture', genre: 'question', texte: `Ligne ${COMMANDE.lignes.indexOf(rupture) + 1} : ${P[rupture.produit].nom}`,
      rep: `${ENTREPOT.picking[rupture.a].q} cartons au picking pour ${rupture.q} commandés (minimum ${ENTREPOT.picking[rupture.a].min}) : « Descente de la réserve », puis une palette ${P[rupture.produit].nom} au-dessus : ${meme(rupture.a).join(', ')}.`,
      note: 'Jalon 2. Refusés : une palette d’une autre référence (le Porteur juste au-dessus), un picking au-dessus de son minimum, un emplacement N1.' },
    { etape: 3, etapeTitre: 'Monter, filmer, étiqueter', genre: 'question', texte: 'La palette juste',
      rep: `${virg(A.poids)} kg (≤ ${COMMANDE.kgMax}) · ${virg(A.hauteur)} m (≤ ${virg(COMMANDE.hMax)}) · film 3 à 5 tours · étiquettes sur 2 côtés opposés et le dessus.`,
      note: 'Jalons 3 à 8 : lourds prélevés en premier (rien de lourd après un non-lourd), fragiles en dernier (rien après un fragile).' },
    { etape: 4, etapeTitre: 'Le parcours', genre: 'question', texte: 'Mètres parcourus',
      rep: `${Math.round(A.serpentin)} m en serpentin, dans l’ordre du bon.`,
      note: `Jalon 9 : mètres ≤ ${Math.round(A.serpentin)} m, sans marge, seulement si les lignes sont justes. Le bon suivi dans le désordre : ${Math.round(A.desordre.metres)} m (${A.desordre.tours} tours).` },
  ],
};
