// Corrigé d'ENT-5.5 (Smoby, ranger et saisir l'entrée), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/smoby-ent55.js`) et le moteur du plan
// d'entrepôt (`bonnesReponses`, `fautesEntrepot`) : bonnes adresses, saisie de l'entrée, stock, message.
// Rien n'est recopié.

import { ENTREPOT, PALETTES, ATTENDU, PORTEURS_APRES, STOCK_DEPART, PHRASES_STOCK, PHRASES_KN, LOT } from '../smoby-ent55.js';
import { bonnesReponses } from '../../core/types/entrepot.js';

const B = bonnesReponses(ENTREPOT);
const juste = (l) => (l.texte != null ? l.texte : l.choix[l.juste]);
const contrainte = (p) => [p.contrainte, p.litige && 'en litige'].filter(Boolean).join(', ') || '—';
const P4 = ATTENDU.find((a) => a.palette === 'P4');

export const CORRIGE = {
  code: 'ENT-5.5',
  titre: 'Smoby — ranger et saisir l’entrée',
  items: [
    { etape: 1, etapeTitre: 'Ranger les palettes', genre: 'tableau', texte: 'Les bonnes adresses (calculées sur le stock de départ)',
      contexte: 'Jalons 1 à 4 : la palette est posée ET aucun critère n’est faux à son adresse. Toute adresse de la liste est juste.',
      entetes: ['Palette', 'Produit', 'Poids', 'Rotation', 'Contrainte', 'Bonnes adresses'],
      reponses: PALETTES.map((p) => [p.id, p.nom, `${p.kg} kg`, p.rotation, contrainte(p), B[p.id].join(', ')]) },
    { etape: 2, etapeTitre: 'Saisir l’entrée en stock', genre: 'tableau', texte: 'Le bon de réception',
      contexte: `Numéro de lot : ${LOT} (non noté). Jalons 5 et 6 : la quantité RÉELLEMENT reçue, ligne acceptée (avec ou sans réserve). Jalon 7 : P3 « En litige », seulement si la réception est validée.`,
      entetes: ['Palette', 'Réf.', 'Annoncé (BL)', 'Compté', 'Décision'],
      reponses: ATTENDU.map((a) => [a.palette, a.sku, String(a.annonce), String(a.compte),
        a.litige ? 'En litige (zone litiges) : n’entre pas en stock' : a.compte < a.annonce ? 'Accepté sous réserve' : 'Accepté']) },
    { etape: 3, etapeTitre: 'Vérifier l’écran Stock', genre: 'question', texte: 'Porteurs Little Smoby en stock après l’entrée',
      rep: `${PORTEURS_APRES} cartons (${STOCK_DEPART[P4.sku]} au départ + ${P4.compte} reçus)`,
      note: `Jalon 8. Pièges : ${STOCK_DEPART[P4.sku] + P4.annonce} (la quantité du BL) et ${STOCK_DEPART[P4.sku]} (entrée pas validée). Message juste : ${PHRASES_STOCK.lignes.map(juste).join(' ')}` },
    { etape: 4, etapeTitre: 'Répondre à Kuehne+Nagel', genre: 'question', texte: 'Le message juste (phrases à choisir)',
      rep: PHRASES_KN.lignes.map(juste).join(' '),
      note: 'Jalon 9 : toutes les lignes justes. Le dernier envoi compte. « Demain » : nous sommes mercredi 9 décembre.' },
  ],
};
