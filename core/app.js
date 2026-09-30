// Point d'entrée : amorçage, connexion, accueil, ouverture d'une activité.

import { demarrerBackend, B } from './backend.js';
import { CONFIG, DEMO } from './config.js';
import { ech, toast, entete, brancherDeconnexion } from './ui.js';
import { chargerActivites, activite, RUBRIQUES } from '../activites/index.js';
import { ouvrirJeu } from './store.js';
import { rendreEspaceProf } from './prof.js';

const app = document.getElementById('app');
let profil = null;
let groupeActif = null;
let jeuOuvert = null;

function fermerJeuCourant() {
  if (jeuOuvert) { try { jeuOuvert.fermer(); } catch (e) {} jeuOuvert = null; }
  B.fermerJeux();
}

// ------------------------------------------------------------------ connexion
function vueConnexion() {
  app.innerHTML = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil: null })}
    ${DEMO ? `<div class="avis"><strong>Mode démonstration.</strong> Aucune connexion réseau :
      tout est enregistré dans ce navigateur. Ajoutez <code>prepalog-config.json</code> pour passer en mode réel.</div>` : ''}
    <div class="grille grille-2">
      <section class="panneau">
        <h2>Élève</h2>
        <div class="champ"><label for="mat">Matricule</label><input id="mat" autocomplete="off"></div>
        <div class="champ"><label for="code">Code</label><input id="code" type="password" autocomplete="off"></div>
        <button class="btn btn-p" id="btnEleve">Entrer</button>
        <div id="errEleve"></div>
      </section>
      <section class="panneau">
        <h2>Enseignant</h2>
        <p class="note">Connexion par compte Google. Les nouveaux enseignants sont autorisés par l'administrateur.</p>
        ${DEMO ? `<div class="champ"><label for="mail">Adresse (démonstration)</label>
          <input id="mail" value="prof.demo@prepalog.local"></div>` : ''}
        <button class="btn" id="btnProf">Connexion enseignant</button>
        <div id="errProf"></div>
      </section>
    </div>`;

  document.getElementById('btnEleve').addEventListener('click', async () => {
    const z = document.getElementById('errEleve');
    z.innerHTML = '';
    try {
      await B.connexionEleve(document.getElementById('mat').value, document.getElementById('code').value);
    } catch (e) { z.innerHTML = `<div class="avis avis-err">${ech(e.message)}</div>`; }
  });

  document.getElementById('btnProf').addEventListener('click', async () => {
    const z = document.getElementById('errProf');
    z.innerHTML = '';
    try {
      await B.connexionProf(DEMO ? document.getElementById('mail').value : undefined);
    } catch (e) { z.innerHTML = `<div class="avis avis-err">${ech(e.message)}</div>`; }
  });
}

// -------------------------------------------------------------------- accueil
async function vueAccueil() {
  fermerJeuCourant();
  const mods = await chargerActivites();
  const estProf = profil.role === 'prof';

  if (!estProf) {
    groupeActif = (profil.groupes || [])[0] || null;
  }
  const groupe = groupeActif ? await B.groupe(groupeActif) : null;

  const visibles = mods.filter((m) => {
    if (!m.meta.pret) return false;
    if (estProf) return true;
    return !groupe || groupe.ouverts?.[m.meta.id] !== false;
  });

  const bandes = [...new Set(RUBRIQUES.map((r) => r.bande))].sort();

  app.innerHTML = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil })}
    <h1>Bonjour ${ech(profil.prenom || profil.nom || '')}</h1>
    ${groupe ? `<p class="note">Groupe : <span class="etiq">${ech(groupe.nom)}</span></p>` : ''}
    ${!estProf && !groupe ? `<div class="avis avis-err">Vous n'êtes rattaché à aucun groupe. Prévenez votre enseignant.</div>` : ''}
    ${estProf && !groupeActif ? `<div class="avis">Aucun groupe actif. Ouvrez l'espace enseignant pour en créer un.</div>` : ''}
    ${bandes.map((b) => {
      const rubs = RUBRIQUES.filter((r) => r.bande === b);
      const contenu = rubs.map((r) => {
        const acts = visibles.filter((m) => m.meta.rubrique === r.id);
        return acts.map((m) => `
          <button class="pastille" data-act="${ech(m.meta.id)}">
            <span class="code">${ech(m.meta.code || '')}</span>
            <span class="titre">${ech(m.meta.titre)}</span>
            <span class="desc">${ech(m.meta.desc || '')}</span>
          </button>`).join('');
      }).join('');
      if (!contenu) return '';
      return `<div class="bande-titre">${rubs.map((r) => ech(r.label)).join(' · ')}</div>
              <div class="pastilles">${contenu}</div>`;
    }).join('')}
    ${estProf ? `<div class="bande-titre">Espace enseignant</div>
      <div class="pastilles"><button class="pastille" id="btnProfEspace">
        <span class="titre">Groupes, comptes et suivi</span>
        <span class="desc">Créer un groupe, générer les comptes, consulter les résultats, conduire la séance.</span>
      </button></div>` : ''}`;

  brancherDeconnexion(async () => { fermerJeuCourant(); await B.deconnexion(); });
  document.querySelectorAll('[data-act]').forEach((b) =>
    b.addEventListener('click', () => vueActivite(b.dataset.act)));
  const bp = document.getElementById('btnProfEspace');
  if (bp) bp.addEventListener('click', () => vueProf());
}

// ------------------------------------------------------------------- activité
async function vueActivite(aid) {
  const m = await activite(aid);
  if (!m) return toast('Activité introuvable.');

  if (m.meta.portee !== 'eleve' && !groupeActif) {
    return toast("Cette activité demande un groupe. L'enseignant doit en activer un.");
  }

  app.innerHTML = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil })}
    <button class="retour" id="btnRetour">← Retour à l'accueil</button>
    <h1>${ech(m.meta.titre)}</h1>
    <p class="note">${ech(m.meta.code || '')} ${m.meta.desc ? '· ' + ech(m.meta.desc) : ''}
      ${m.meta.bareme ? `· noté sur ${m.meta.bareme}` : ''}</p>
    <div id="hoteActivite"><div class="vide">Chargement…</div></div>`;

  brancherDeconnexion(async () => { fermerJeuCourant(); await B.deconnexion(); });
  document.getElementById('btnRetour').addEventListener('click', () => vueAccueil());

  fermerJeuCourant();
  jeuOuvert = await ouvrirJeu({
    aid, portee: m.meta.portee, tables: m.meta.tables || {},
    uid: profil.uid, gid: groupeActif,
    eqId: (await B.groupe(groupeActif))?.equipes?.[profil.uid],
  });

  const ctx = {
    profil, groupe: groupeActif, meta: m.meta, jeu: jeuOuvert,
    async enregistrer(res) {
      if (!m.meta.bareme || profil.role !== 'eleve' || !groupeActif) return;
      try { await B.ecrireScore(groupeActif, profil.uid, aid, { score: res.score, max: res.max, detail: res.detail || null }); }
      catch (e) { toast("Le score n'a pas pu être enregistré."); }
    },
  };

  m.rendre(document.getElementById('hoteActivite'), ctx);
}

// ------------------------------------------------------------- espace prof
async function vueProf() {
  fermerJeuCourant();
  app.innerHTML = `${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil })}<div id="hoteProf"></div>`;
  brancherDeconnexion(async () => { await B.deconnexion(); });
  await rendreEspaceProf(document.getElementById('hoteProf'), {
    profil,
    groupeActif,
    setGroupe: (gid) => { groupeActif = gid; },
    retour: () => vueAccueil(),
  });
  // L'espace enseignant peut changer le groupe actif : on le relit au retour.
}

// ------------------------------------------------------------------ amorçage
(async function demarrer() {
  await demarrerBackend();
  B.onAuth(async (p) => {
    profil = p;
    if (!p) { fermerJeuCourant(); vueConnexion(); return; }
    if (p.role === 'prof' && !groupeActif) {
      const gs = await B.groupesDuProf(p.uid);
      groupeActif = gs[0]?.id || null;
    }
    await vueAccueil();
  });
})();

// Sauvegarde de sûreté si l'élève ferme l'onglet au milieu d'une activité.
window.addEventListener('pagehide', () => { if (jeuOuvert) jeuOuvert.vidange?.(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && jeuOuvert) jeuOuvert.vidange?.();
});
