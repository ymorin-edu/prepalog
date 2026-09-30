// Choisit le backend : Firebase si la configuration est présente, démonstration sinon.
// Le reste de l'application ne connaît que `B`.

import { chargerConfig, DEMO } from './config.js';
import { creerBackendDemo } from './backend-demo.js';

export let B = null;

export async function demarrerBackend() {
  await chargerConfig();
  if (DEMO) {
    B = creerBackendDemo();
  } else {
    try {
      const { creerBackendFirebase } = await import('./backend-firebase.js');
      B = await creerBackendFirebase();
    } catch (e) {
      console.warn('Firebase indisponible, repli en mode démonstration.', e);
      B = creerBackendDemo();
    }
  }
  await B.init();
  return B;
}
