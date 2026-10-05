// Univers d'ESSAI de la vue « animation à questions » (core/types/animation.js) — 05/10/2026.
//
// La page `outils/essai-animation.html` et le bloc de tests `outils/test/animation.mjs` montent le vrai
// moteur d'entreprise sur le contenu d'essai (la maquette d'ENT-6.5 reproduite, `contenus/animation-essai.js`).
// `animation` : un autre contenu (les tests y passent une copie accélérée ou volontairement fautive).

import { catalogueSimple } from '../contenus/entreprise-commun.js';
import { ANIMATION_ESSAI } from '../contenus/animation-essai.js';
import { etapesAnimation } from '../core/types/animation.js';

export function univers({ animation = ANIMATION_ESSAI, animations = null, kpis = null } = {}) {
  const liste = animations || [animation];
  return {
    ENTREPRISE: { id: 'essai-animation', nom: 'France Boissons — essai de l’animation', sousTitre: 'Plateforme — stockage de masse',
      exercice: "Essai de l'écran Animation" },
    VOCAB: { unit: 'unité', unitPl: 'unités', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ESSAI', designation: 'Article d’essai' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: liste.flatMap((A) => etapesAnimation(A)), exercice: "Essai de l'écran Animation",
    animations: liste, sansTrame: "Tout à l'écran",
    accueil: kpis ? { kpis } : null,
  };
}
