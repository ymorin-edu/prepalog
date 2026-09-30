// Point d'entrée : amorçage, connexion, accueil, ouverture d'une activité.

import { demarrerBackend, B } from './backend.js';
import { CONFIG, DEMO } from './config.js';
import { ech, toast, entete, brancherEntete } from './ui.js';
import { logoSrc } from './theme.js';
import { activiteVisible, courtNiveau, libelleNiveaux } from './niveaux.js';
import { chargerActivites, activite, RUBRIQUES, ICONES, activitesDeRubrique } from '../activites/index.js';
import { ouvrirJeu } from './store.js';
import { rendreEspaceProf } from './prof.js';

const app = document.getElementById('app');
let profil = null;
let groupeActif = null;
let jeuOuvert = null;
let rubriqueActive = null;   // null = pastilles d'accueil ; sinon id de la rubrique ouverte

// L'enseignant retrouve le groupe sur lequel il travaillait, d'une séance à l'autre.
const CLE_GROUPE = 'prepalog:groupe:';
const groupeMemorise = (uid) => { try { return localStorage.getItem(CLE_GROUPE + uid); } catch (e) { return null; } };
const memoriserGroupe = (uid, gid) => { try { localStorage.setItem(CLE_GROUPE + uid, gid || ''); } catch (e) {} };

function fermerJeuCourant() {
  if (jeuOuvert) { try { jeuOuvert.fermer(); } catch (e) {} jeuOuvert = null; }
  B.fermerJeux();
  // Filet de sécurité : une activité immersive repeint <body> à ses couleurs. Quelle que
  // soit la façon dont on la quitte, le site doit retrouver sa charte.
  document.body.classList.remove('immersion');
  document.body.removeAttribute('style');
}

// ------------------------------------------------------------------ connexion
function vueConnexion() {
  app.innerHTML = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil: null, grand: true })}
    <div class="preambule">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.9"/></svg>
      <span>${ech(CONFIG.preambule)}</span>
    </div>
    ${DEMO ? `<div class="avis"><strong>Mode démonstration.</strong> Aucune connexion réseau :
      tout est enregistré dans ce navigateur. Ajoutez <code>prepalog-config.json</code> pour passer en mode réel.</div>` : ''}
    <div class="connexion">
      <section class="panneau panneau-eleve">
        <h2>Connexion élève</h2>
        <p class="amorce">Saisissez le matricule et le code remis par votre enseignant.</p>
        <div class="duo-champs">
          <div class="champ-fort">
            <label for="mat">Matricule</label>
            <input id="mat" autocomplete="off" inputmode="numeric" placeholder="ex : 2601" autofocus>
          </div>
          <div class="champ-fort">
            <label for="code">Code</label>
            <input id="code" type="password" autocomplete="off" placeholder="votre code">
          </div>
        </div>
        <button class="btn btn-p btn-entrer" id="btnEleve">Entrer</button>
        <div id="errEleve"></div>
      </section>
      <section class="panneau panneau-prof">
        <h2>Enseignant</h2>
        <p class="note">Connexion par compte Google. Les nouveaux enseignants sont autorisés par l'administrateur.</p>
        ${DEMO ? `<div class="champ"><label for="mail">Adresse (démonstration)</label>
          <input id="mail" value="prof.demo@prepalog.local"></div>` : ''}
        <button class="btn" id="btnProf">Connexion enseignant</button>
        <div id="errProf"></div>
      </section>
    </div>
    <p class="pied">${ech(CONFIG.marque)} · ${ech(CONFIG.institution)} — aucune donnée personnelle n'est
      demandée aux élèves en dehors du nom, du prénom et du matricule.</p>`;

  brancherEntete();

  const connecterEleve = async () => {
    const z = document.getElementById('errEleve');
    z.innerHTML = '';
    try {
      await B.connexionEleve(document.getElementById('mat').value, document.getElementById('code').value);
    } catch (e) { z.innerHTML = `<div class="avis avis-err">${ech(e.message)}</div>`; }
  };

  document.getElementById('btnEleve').addEventListener('click', connecterEleve);
  // La touche Entrée vaut validation : les élèves tapent au clavier, pas à la souris.
  ['mat', 'code'].forEach((id) => document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') connecterEleve();
  }));

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

  // Le niveau du groupe décide, sauf forçage explicite par l'enseignant.
  // L'enseignant sans groupe actif voit tout.
  const visibles = mods.filter((m) => activiteVisible(m.meta, groupe));

  const rub = rubriqueActive ? RUBRIQUES.find((r) => r.id === rubriqueActive) : null;
  const cartouche = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil })}
    ${!estProf && !groupe ? `<div class="avis avis-err">Vous n'êtes rattaché à aucun groupe. Prévenez votre enseignant.</div>` : ''}
    ${estProf && !groupeActif ? `<div class="avis">Aucun groupe actif. Ouvrez l'espace enseignant pour en créer un.</div>` : ''}`;

  // ---- niveau 2 : une rubrique ouverte, ses activités en tuiles
  if (rub) {
    const acts = activitesDeRubrique(rub, visibles);
    app.innerHTML = `${cartouche}
      <button class="lien-accueil" id="btnAccueil">← ACCUEIL</button>
      <div class="rubrique-head">
        <span class="rubrique-disc">${ICONES[rub.icone] || ''}</span>
        <div><h1>${ech(rub.label)}</h1><p>${ech(rub.desc || '')}</p></div>
      </div>
      ${acts.length === 0
        ? `<div class="vide">Aucune activité ouverte dans cette rubrique pour l'instant.</div>`
        : `<div class="module-grid">${acts.map((m) => `
            <button class="module-tile" data-act="${ech(m.meta.id)}">
              <span class="code">${ech(m.meta.code || '')}${estProf ? ' · ' + ech(libelleNiveaux(m.meta.niveaux)) : ''}</span>
              <span class="titre">${ech(m.meta.titre)}</span>
              <span class="desc">${ech(m.meta.desc || '')}</span>
            </button>`).join('')}</div>`}`;
    brancher();
    return;
  }

  // ---- niveau 1 : les pastilles, groupées par bande
  const bandes = [...new Set(RUBRIQUES.map((r) => r.bande))].sort((a, b) => a - b);
  const pastillesParBande = bandes.map((b) => {
    const rubs = RUBRIQUES.filter((r) => r.bande === b).map((r) => {
      const n = activitesDeRubrique(r, visibles).length;
      return { r, n };
    }).filter(({ n }) => n > 0 || estProf);
    if (!rubs.length) return '';
    return `<div class="rubriques">${rubs.map(({ r, n }) => `
      <button class="rubrique ${n === 0 ? 'desactivee' : ''}" data-rub="${ech(r.id)}" ${n === 0 ? 'disabled' : ''}>
        <span class="rubrique-disc">${ICONES[r.icone] || ''}</span>
        <span class="rubrique-name">${ech(r.label)}</span>
        <span class="rubrique-count">${n} activité${n > 1 ? 's' : ''}</span>
      </button>`).join('')}</div>`;
  }).filter(Boolean).join('<div class="rubriques-sep"></div>');

  app.innerHTML = `${cartouche}
    <div class="accueil-tete">
      <div class="texte">
        <h1>Bonjour ${ech(profil.prenom || profil.nom || '')}</h1>
        ${groupe ? `<p class="note">Groupe : <span class="etiq">${ech(groupe.nom)}</span>
      <span class="etiq">${ech(courtNiveau(groupe.niveau))}</span></p>` : '<p class="note">&nbsp;</p>'}
      </div>
      <img class="accueil-marque" data-logo src="${logoSrc()}" alt="">
    </div>
    ${pastillesParBande}
    ${estProf ? `<div class="rubriques-sep"></div>
      <div class="rubriques staff">
        <button class="rubrique" id="btnProfEspace">
          <span class="rubrique-disc">${ICONES.comptes}</span>
          <span class="rubrique-name">Groupes<br>et comptes</span>
        </button>
        <button class="rubrique" id="btnProfSuivi">
          <span class="rubrique-disc">${ICONES.suivi}</span>
          <span class="rubrique-name">Suivi<br>de classe</span>
        </button>
      </div>` : ''}`;
  brancher();

  function brancher() {
    brancherEntete(async () => { fermerJeuCourant(); await B.deconnexion(); });

    document.getElementById('btnAccueil')?.addEventListener('click', () => {
      rubriqueActive = null; vueAccueil();
    });

    document.querySelectorAll('[data-rub]').forEach((b) => b.addEventListener('click', () => {
      const r = RUBRIQUES.find((x) => x.id === b.dataset.rub);
      const acts = activitesDeRubrique(r, visibles);
      // Une rubrique à activité unique ouvre directement : un clic de moins.
      if (acts.length === 1) return vueActivite(acts[0].meta.id);
      rubriqueActive = r.id;
      vueAccueil();
    }));

    document.querySelectorAll('[data-act]').forEach((b) =>
      b.addEventListener('click', () => vueActivite(b.dataset.act)));

    document.getElementById('btnProfEspace')?.addEventListener('click', () => vueProf());
    document.getElementById('btnProfSuivi')?.addEventListener('click', () => vueProf('suivi'));
  }
}

// ------------------------------------------------------------------- activité
async function vueActivite(aid) {
  const m = await activite(aid);
  if (!m) return toast('Activité introuvable.');

  if (m.meta.portee !== 'eleve' && !groupeActif) {
    return toast("Cette activité demande un groupe. L'enseignant doit en activer un.");
  }

  // Une activité « immersive » prend toute la page : pas de bandeau Prepalog, pas de titre
  // de module. L'élève doit avoir l'impression d'entrer dans le logiciel de l'entreprise,
  // pas d'ouvrir un chapitre du site. C'est le module qui dessine alors son propre en-tête
  // et son propre bouton de sortie.
  if (m.meta.immersif) {
    app.innerHTML = `<div id="hoteActivite" class="immersif"><div class="vide">Chargement…</div></div>`;
  } else {
    app.innerHTML = `
      ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil })}
      <button class="lien-accueil" id="btnRetour">← ${rubriqueActive ? ech((RUBRIQUES.find((r) => r.id === rubriqueActive) || {}).label || 'RETOUR').toUpperCase() : 'ACCUEIL'}</button>
      <h1>${ech(m.meta.titre)}</h1>
      <p class="note">${ech(m.meta.code || '')} ${m.meta.desc ? '· ' + ech(m.meta.desc) : ''}
        ${m.meta.bareme ? (m.meta.notation === 'avancement'
          ? `· ${m.meta.bareme} étapes suivies`
          : `· noté sur ${m.meta.bareme}`) : ''}</p>
      <div id="hoteActivite"><div class="vide">Chargement…</div></div>`;
    brancherEntete(async () => { fermerJeuCourant(); await B.deconnexion(); });
    document.getElementById('btnRetour').addEventListener('click', () => vueAccueil());
  }

  fermerJeuCourant();
  const objGroupe = groupeActif ? await B.groupe(groupeActif) : null;
  jeuOuvert = await ouvrirJeu({
    aid, portee: m.meta.portee, tables: m.meta.tables || {},
    uid: profil.uid, gid: groupeActif,
    eqId: objGroupe?.equipes?.[profil.uid],
  });

  const ctx = {
    profil, groupe: groupeActif, meta: m.meta, jeu: jeuOuvert,
    // Le niveau de la classe, pour les activités qui portent une série d'exercices de
    // difficulté inégale et n'en montrent que la part qui convient au groupe.
    niveauGroupe: objGroupe?.niveau || null,
    // Code qui déverrouille la vue d'ensemble du stock dans un environnement d'entreprise :
    // l'enseignant le donne au moment qu'il choisit dans la séance.
    codeStock: objGroupe?.codeStock || null,
    // Sortie de l'environnement, pour une activité immersive qui dessine son propre bouton.
    quitter() { vueAccueil(); },
    async deconnexion() { fermerJeuCourant(); await B.deconnexion(); },
    // Le travail déjà enregistré pour cette activité, ou null. Utile aux activités
    // notées à la main : l'élève retrouve sa note en ouvrant le module.
    async lireScore() {
      if (!groupeActif) return null;
      try { return await B.lireScore(groupeActif, profil.uid, aid); } catch (e) { return null; }
    },
    async enregistrer(res) {
      if (!m.meta.bareme || profil.role !== 'eleve' || !groupeActif) return;
      try { await B.ecrireScore(groupeActif, profil.uid, aid, { score: res.score, max: res.max, detail: res.detail || null }); }
      catch (e) { toast("Le score n'a pas pu être enregistré."); }
    },
  };

  m.rendre(document.getElementById('hoteActivite'), ctx);
}

// ------------------------------------------------------------- espace prof
async function vueProf(ongletInitial) {
  fermerJeuCourant();
  app.innerHTML = `${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil })}<div id="hoteProf"></div>`;
  brancherEntete(async () => { await B.deconnexion(); });
  await rendreEspaceProf(document.getElementById('hoteProf'), {
    profil,
    groupeActif,
    onglet: ongletInitial,
    setGroupe: (gid) => { groupeActif = gid; memoriserGroupe(profil.uid, gid); },
    retour: () => { rubriqueActive = null; vueAccueil(); },
  });
  // L'espace enseignant peut changer le groupe actif : on le relit au retour.
}

// ------------------------------------------------------------------ amorçage
(async function demarrer() {
  await demarrerBackend();
  B.onAuth(async (p) => {
    profil = p;
    // Un changement de session repart de l'accueil : sinon la rubrique ouverte par
    // l'utilisateur précédent resterait affichée après la connexion suivante.
    rubriqueActive = null;
    if (!p) { fermerJeuCourant(); groupeActif = null; vueConnexion(); return; }
    if (p.role === 'prof' && !groupeActif) {
      const gs = await B.groupesDuProf(p.uid);
      const memo = groupeMemorise(p.uid);
      groupeActif = (memo && gs.some((g) => g.id === memo)) ? memo : (gs[0]?.id || null);
    }
    await vueAccueil();
  });
})();

// Sauvegarde de sûreté si l'élève ferme l'onglet au milieu d'une activité.
window.addEventListener('pagehide', () => { if (jeuOuvert) jeuOuvert.vidange?.(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && jeuOuvert) jeuOuvert.vidange?.();
});
