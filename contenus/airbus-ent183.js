// ENT-18.3 — Airbus Helicopters, « les flux particuliers » : GUIDAGE de C3.1 (adapter le processus au produit et au flux) et C2.6, Terminale.
// Jeudi 5 novembre : un hélicoptère de secours au sol à Grenoble (AOG : le plus rapide, le coursier), une pale de rotor de 5,50 m (affrètement), une batterie lithium-ion (supplément et déclaration de marchandise dangereuse), un AOG trop loin pour le coursier (express).
// Univers et fabrique : `contenus/airbus.js` ; données : `D183` de `contenus/airbus-donnees.js` ; questions : `contenus/questions/ENT-18.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : chaque prestataire 2 (× 4) · coût du coursier 1,5 · poids taxable de la batterie 1 · son coût 1,5 · la marchandise dangereuse 2 · compte rendu 2 · questions au fil 4 = 20.

import { seance } from './airbus.js';
import { D183 } from './airbus-donnees.js';
import { QUESTIONS } from './questions/ENT-18.3.js';

export * from './airbus.js';

const S = seance(D183, {
  id: 'airbus-flux-particuliers',
  poids: { presta: 2, tax: 1, cout: 1.5, danger: 2, 'compte-rendu': 2 },
  titre: 'Les flux particuliers',
  objet: 'Un hélicoptère au sol, une pale, une batterie',
  consigne: 'Journée chargée : un hélicoptère de secours est cloué au sol à Grenoble, une pale de rotor doit partir, et une batterie lithium-ion aussi. Avec la méthode, choisis le prestataire de chaque colis, calcule le coût d’EXP-1821 et le poids taxable et le coût d’EXP-1823, et dis-moi ce qui part avec une déclaration de marchandise dangereuse.\n\nOuvre la fiche de travail, puis écris-moi ton compte rendu.',
  poste: '<p>Ton travail aujourd’hui : <b>adapter</b> le transport au colis et à l’urgence : un appareil <b>au sol</b>, une pièce <b>hors gabarit</b>, une <b>marchandise dangereuse</b>.</p>',
  etape: 'Le plus rapide pour un hélicoptère au sol, le seul possible pour la pale, le moins cher sinon ; les coûts ; la marchandise dangereuse.',
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS } = S;
