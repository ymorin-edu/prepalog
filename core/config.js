// Configuration. Le fichier prepalog-config.json n'est pas versionné :
// sans lui, l'application démarre en mode démo (tout en localStorage).

export const DEFAUT = {
  firebase: null,          // objet de configuration Firebase
  superAdmins: [],         // adresses Google autorisées à créer des enseignants
  institution: 'Famille des métiers GATL',
  marque: 'Prepalog',
  suffixeMatricule: '@prepalog.local',
};

export let CONFIG = { ...DEFAUT };
export let DEMO = true;

export async function chargerConfig() {
  try {
    const r = await fetch('./prepalog-config.json', { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      CONFIG = { ...DEFAUT, ...j };
    }
  } catch (e) {
    /* pas de fichier : mode démo */
  }
  DEMO = !(CONFIG.firebase && CONFIG.firebase.apiKey && CONFIG.firebase.projectId);
  return CONFIG;
}

// Identifiants dérivés du matricule : aucune adresse e-mail réelle d'élève.
export const matEmail = (m) => String(m).trim().toLowerCase() + CONFIG.suffixeMatricule;
export const matMdp = (m, code) => String(m).trim().toLowerCase() + ':' + String(code).trim();
