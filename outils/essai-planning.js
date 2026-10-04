// Univers d'ESSAI de la vue « Planning » (core/types/planning.js) — 04/10/2026.
//
// La page `outils/essai-planning.html` et le bloc de tests `outils/test/planning.mjs` montent le vrai
// moteur d'entreprise sur un des trois cas de la maquette v8 (`contenus/planning-essai.js`), avec des
// réglages que la séance, elle, fixe une fois pour toutes : le cas, le temps pédagogique, élève ou
// enseignant. L'aléa arrive par la messagerie, comme dans une séance (déclencheur `phasePlanning: 2`).

import { catalogueSimple } from '../contenus/entreprise-commun.js';
import { CAS, voletEssai } from '../contenus/planning-essai.js';
import { etapesPlanning } from '../core/types/planning.js';

const NOMS = {
  quai: ['Smoby — essai du planning', 'Plateforme de Moirans-en-Montagne (39) — expéditions'],
  perso: ['Smoby — essai du planning', 'Plateforme de Moirans-en-Montagne (39) — équipe de préparation'],
  chauf: ['Kuehne+Nagel — essai du planning', 'Agence Route de Besançon (25) — exploitation'],
};

export function univers({ cas = 'quai', temps = 'guidage', planning = null } = {}) {
  const P = planning || CAS[cas];
  const [nom, sousTitre] = NOMS[cas] || NOMS.quai;
  return {
    ENTREPRISE: { id: 'essai-planning', nom, sousTitre, exercice: "Essai de l'écran Planning" },
    VOCAB: { unit: 'unité', unitPl: 'unités', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ESSAI', designation: 'Article d’essai' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: etapesPlanning(P), exercice: "Essai de l'écran Planning",
    volet: P.alea ? voletEssai(P) : null,
    planning: P, copie: temps === 'evaluation', sansTrame: "Tout à l'écran",
  };
}
