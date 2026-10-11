// Univers d'ESSAI de la vue « Plan d'entrepôt » (core/types/entrepot.js) — 04/10/2026.
//
// La page `outils/essai-entrepot.html` et le bloc de tests `outils/test/entrepot.mjs` montent le vrai
// moteur d'entreprise sur un cas de la maquette v2 (`contenus/entrepot-essai.js`), avec des réglages
// que la séance, elle, fixe une fois pour toutes : le cas, le temps pédagogique, élève ou enseignant.

import { catalogueSimple } from '../contenus/entreprise-commun.js';
import { CAS } from '../contenus/entrepot-essai.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { THEME } from '../contenus/smoby.js';
import { THEME as THEME_FB } from '../contenus/france-boissons.js';
import { MASSE } from '../contenus/entrepot-masse-essai.js';

// `masse` : le stockage de masse d'ENT-6.5 (chantier D-5), dans la charte de France Boissons.
export function univers({ cas = 'rangement', temps = 'guidage', entrepot = null } = {}) {
  const P = entrepot || (cas === 'masse' ? MASSE : CAS[cas]);
  const masse = P.mode === 'masse';
  return {
    ENTREPRISE: masse ? { id: 'essai-entrepot', nom: 'France Boissons — essai de la zone de masse', sousTitre: 'Plateforme — stockage de masse', exercice: 'Essai de l’écran Plan d’entrepôt' }
      : { id: 'essai-entrepot', nom: 'Smoby — essai du plan d’entrepôt',
      sousTitre: 'Plateforme de Moirans-en-Montagne (39) — stockage', exercice: 'Essai de l’écran Plan d’entrepôt' },
    VOCAB: { unit: 'unité', unitPl: 'unités', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ESSAI', designation: 'Article d’essai' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: masse ? THEME_FB : THEME,     // la charte de l'entreprise, comme dans la séance
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: etapesEntrepot(P), exercice: 'Essai de l’écran Plan d’entrepôt',
    entrepot: P, copie: temps === 'evaluation', sansTrame: "Tout à l'écran",
    menu: ['receptions', 'stock'],     // un menu court, comme une séance Smoby (la visite tient sans défiler)
  };
}
