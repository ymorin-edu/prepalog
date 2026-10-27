// ENT-19.8 — Amazon, « la commande du jeudi » : ENTRAÎNEMENT de CAP-C3.1, C3.2 et C3.3, CAP OL. Un prélèvement plus long (un article abîmé, une
// case vide, un t-shirt de la mauvaise taille), puis l'emballage de trois commandes (une à deux articles, une cafetière en verre à caler) et
// une pesée.
// Univers : `contenus/amazon.js` ; données : `P198`, `E198` de `contenus/amazon-donnees.js` ; questions : `contenus/questions/ENT-19.8.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : prélever 6,5 (1,3 × 5) · les cartons 4,5 (1,5 × 3) · le calage 1 ·
// la pesée 1 · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_PRELEVER, DOC_CARTONS, docPrelevement, docCommandes, docPesees, blocsPrelevement, jalonsPrelevement, blocsCartons,
  jalonsCartons, blocCaler, jalonCaler, blocsPesees, jalonsPesees } from './amazon.js';
import { P198, E198 } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.8.js';

export * from './amazon.js';

const getP = () => P198;
const getE = () => E198;

const S = seanceFiches(U, {
  id: 'amazon-jeudi', prefixe: '198', titre: 'La commande du jeudi', exercice: 'Séance 8 : la commande du jeudi',
  documents: [DOC_SITE, DOC_PRELEVER, DOC_CARTONS, docPrelevement(getP), docCommandes(getE), docPesees(getE)],
  pas: [
    { id: 'lignes', libelle: 'Prélever', titre: 'Ce que tu fais à chaque ligne', sousTitre: 'Cinq lignes : regarde bien chaque case.',
      objet: 'Le prélèvement du jeudi', pieces: ['prelever', 'prelevement'], documents: ['prelever', 'prelevement'], largeurDocs: 1.4,
      message: 'Bonjour {prenom} ! Jeudi chargé : cinq lignes à prélever, puis tu passes à l’emballage. Pour chaque ligne, dis-moi ce que tu fais.',
      blocs: blocsPrelevement(P198), jalons: jalonsPrelevement(getP, { poids: 1.3, groupe: 'Prélever' }) },
    { id: 'cartons', libelle: 'Emballer', titre: 'Le carton de chaque commande', sousTitre: 'Une commande peut avoir deux articles : ils se posent l’un sur l’autre.',
      objet: 'L’emballage', pieces: ['cartons', 'commandes'], documents: ['cartons', 'commandes'], largeurDocs: 1.4,
      message: 'Maintenant, l’emballage : le carton de chaque commande, et les colis à caler.',
      blocs: [...blocsCartons(E198), blocCaler(E198)],
      jalons: [...jalonsCartons(getE, { poids: 1.5, groupe: 'Emballer' }), jalonCaler(getE, { poids: 1, groupe: 'Emballer' })] },
    { id: 'pesee', libelle: 'La pesée', titre: 'La pesée en fin de ligne', sousTitre: 'Le poids attendu et le poids lu sont à gauche.',
      objet: 'La pesée', pieces: ['pesees', 'cartons'], documents: ['pesees', 'cartons'],
      message: 'Un de tes colis arrive sur la balance. Part-il vers le camion ?',
      blocs: blocsPesees(E198), jalons: jalonsPesees(getE, { poids: 1, groupe: 'La pesée' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Ton compte rendu, s’il te plaît : Théo a trois problèmes à régler.',
    lignes: (prenom) => [SALUT,
      { id: 'prelev', choix: ['J’ai signalé trois lignes : un t-shirt de la mauvaise taille, une bougie abîmée et une case vide.', 'J’ai tout pris, même la bougie abîmée.', 'J’ai pris un t-shirt L à la place du M.'], juste: 0 },
      { id: 'caler', choix: ['J’ai calé la cafetière en verre avec du papier.', 'J’ai mis la cafetière dans une enveloppe.', 'Je n’ai rien calé.'], juste: 0 },
      { id: 'pesee', choix: ['Le colis 512-1 pesait trop lourd : il est sorti de la ligne, chez Théo.', 'Le colis 512-1 est parti vers le camion.', 'Le colis 512-1 pesait trop peu.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Dis ce que tu fais à chaque ligne.', 'Choisis les cartons et cale les fragiles.', 'Dis si le colis part.', 'Réponds à Karima, une phrase par ligne.'],
  fin: 'Merci {prenom}. Théo ouvre le colis 512-1 : un article de trop, sans doute.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
