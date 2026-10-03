// Point d'entrée : amorçage, connexion, accueil, ouverture d'une activité.

import { demarrerBackend, B } from './backend.js';
import { CONFIG, DEMO } from './config.js';
import { ech, toast, entete, brancherEntete, messageErreur } from './ui.js';
import { activiteVisible, raisonCachee, courtNiveau, libelleNiveaux } from './niveaux.js';
import { chargerActivites, activite, RUBRIQUES, ICONES, activitesDeRubrique, entreprisesDe } from '../activites/index.js';
import { ouvrirJeu } from './store.js';
import { rendreEspaceProf } from './prof.js';
import { verrou, seancesDepuis, seancesDuParcours } from './parcours.js';
import { amenagements } from './amenagements.js';

const app = document.getElementById('app');
let profil = null;
let groupeActif = null;
let jeuOuvert = null;
let rubriqueActive = null;   // null = pastilles d'accueil ; sinon id de la rubrique ouverte
let entrepriseActive = null; // rubrique rangée par entreprise (Logisim) : null = les logos ; sinon id de l'entreprise

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
  // L'ENSEIGNANT voit tout (02/10/2026) : les séances en préparation, fermées ou d'un autre
  // niveau gardent leur tuile chez lui, avec une étiquette qui dit ce que voient les élèves.
  const visibles = mods.filter((m) => estProf || activiteVisible(m.meta, groupe));
  const cachee = (m) => (estProf ? raisonCachee(m.meta, groupe) : null);

  const rub = rubriqueActive ? RUBRIQUES.find((r) => r.id === rubriqueActive) : null;
  const cartouche = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil })}
    ${!estProf && !groupe ? `<div class="avis avis-err">Vous n'êtes rattaché à aucun groupe. Prévenez votre enseignant.</div>` : ''}
    ${estProf && !groupeActif ? `<div class="avis">Aucun groupe actif. Ouvrez l'espace enseignant pour en créer un.</div>` : ''}`;

  // ---- niveau 2 : une rubrique ouverte, ses activités en tuiles
  if (rub) {
    let acts = activitesDeRubrique(rub, visibles);

    // Rubrique rangée par entreprise (Logisim) : d'abord les logos, puis les séances de
    // l'entreprise choisie. Toujours le même chemin, même pour une entreprise à une séance.
    let ent = null;
    if (rub.parEntreprise) {
      const ents = entreprisesDe(acts);
      ent = ents.find((e) => e.id === entrepriseActive) || null;
      if (!ent) {
        entrepriseActive = null;
        // La carte = le logo seul ; le nom reste lisible par title, aria-label et alt.
        app.innerHTML = `${cartouche}
          <button class="lien-accueil" id="btnAccueil">← ACCUEIL</button>
          <div class="rubrique-head">
            <span class="rubrique-disc">${ICONES[rub.icone] || ''}</span>
            <div><h1>${ech(rub.label)}</h1><p>${ech(rub.desc || '')} Choisissez une entreprise.</p></div>
          </div>
          ${ents.length === 0
            ? `<div class="vide">Aucune activité ouverte dans cette rubrique pour l'instant.</div>`
            : `<div class="entreprises">${ents.map((e) => `
                <button class="entreprise" data-ent="${ech(e.id)}" title="${ech(e.nom)}" aria-label="${ech(e.nom)}">
                  ${e.logo ? `<span class="plaque"><img src="${ech(e.logo)}" alt="${ech(e.nom)}"></span>`
                    : `<span class="entreprise-autres">${ech(e.nom)}</span>`}
                </button>`).join('')}</div>`}`;
        brancher();
        return;
      }
      acts = ent.acts;
    }

    // Les séances d'un parcours qui ne sont pas encore ouvertes à cet élève : grisées, avec la raison.
    const metas = mods.map((x) => x.meta);
    const verrous = {};
    await Promise.all(acts.map(async (x) => {
      try { verrous[x.meta.id] = await verrou(metas, x.meta, profil, groupeActif); } catch (e) { verrous[x.meta.id] = null; }
    }));
    const tete = ent
      ? `<button class="lien-accueil" id="btnLogisim">← ${ech(rub.label.toUpperCase())}</button>
        <div class="entreprise-tete" data-entreprise="${ech(ent.id)}">
          ${ent.logo ? `<span class="plaque"><img src="${ech(ent.logo)}" alt=""></span>` : ''}
          <div><h1>${ech(ent.nom)}</h1><p>${ech(ent.metier)}</p></div>
        </div>`
      : `<button class="lien-accueil" id="btnAccueil">← ACCUEIL</button>
        <div class="rubrique-head">
          <span class="rubrique-disc">${ICONES[rub.icone] || ''}</span>
          <div><h1>${ech(rub.label)}</h1><p>${ech(rub.desc || '')}</p></div>
        </div>`;
    app.innerHTML = `${cartouche}
      ${tete}
      ${acts.length === 0
        ? `<div class="vide">Aucune activité ouverte dans cette rubrique pour l'instant.</div>`
        : `<div class="module-grid">${acts.map((m) => `
            <button class="module-tile${verrous[m.meta.id] ? ' verrouillee' : ''}" data-act="${ech(m.meta.id)}"
              ${verrous[m.meta.id] ? 'style="opacity:.55"' : ''}>
              <span class="code">${ech(m.meta.code || '')}${estProf ? ' · ' + ech(libelleNiveaux(m.meta.niveaux)) : ''}</span>
              <span class="titre">${ech(m.meta.titre)}</span>
              <span class="desc">${ech(m.meta.desc || '')}</span>
              ${verrous[m.meta.id] ? `<span class="desc"><strong>${ech(verrous[m.meta.id])}</strong></span>` : ''}
              ${cachee(m) ? `<span class="tuile-cachee" data-cachee="${ech(cachee(m))}">Cachée aux élèves : ${ech(cachee(m))}</span>` : ''}
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
      rubriqueActive = null; entrepriseActive = null; vueAccueil();
    });
    document.getElementById('btnLogisim')?.addEventListener('click', () => {
      entrepriseActive = null; vueAccueil();
    });
    document.querySelectorAll('[data-ent]').forEach((b) => b.addEventListener('click', () => {
      entrepriseActive = b.dataset.ent; vueAccueil();
    }));

    document.querySelectorAll('[data-rub]').forEach((b) => b.addEventListener('click', () => {
      const r = RUBRIQUES.find((x) => x.id === b.dataset.rub);
      const acts = activitesDeRubrique(r, visibles);
      // Une rubrique à activité unique ouvre directement : un clic de moins. Sauf une rubrique
      // rangée par entreprise : toujours logos, puis séances (décision de Tristan, 02/10/2026).
      if (acts.length === 1 && !r.parEntreprise) return vueActivite(acts[0].meta.id);
      rubriqueActive = r.id;
      entrepriseActive = null;
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
  // Parcours strict : une séance dont la précédente n'est pas validée reste fermée.
  {
    const raison = await verrou((await chargerActivites()).map((x) => x.meta), m.meta, profil, groupeActif);
    if (raison) return toast(raison);
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
  // `meta.jeuId` permet à plusieurs activités de travailler dans LA MÊME base. C'est ce qui
  // fait tenir ensemble les séances d'un même environnement d'entreprise : l'élève réceptionne
  // une livraison dans une activité, prépare une commande dans la suivante et remonte la
  // traçabilité dans la troisième, sur son propre stock. Les scores, eux, restent enregistrés
  // par activité (`aid`) : chaque séance garde son avancement dans le suivi de classe.
  jeuOuvert = await ouvrirJeu({
    aid: m.meta.jeuId || aid, portee: m.meta.portee, tables: m.meta.tables || {},
    uid: profil.uid, gid: groupeActif,
    eqId: objGroupe?.equipes?.[profil.uid],
  });

  // Reprise demandée par l'enseignant pour un élève bloqué (espace enseignant > Suivi).
  //
  // L'enseignant n'a pas le droit d'écrire dans la base privée d'un élève (règles Firestore :
  // « écrire à sa place reste interdit »), et un effacement ne tiendrait pas si l'élève avait la
  // séance ouverte, car sa fenêtre réécrit sa base en quittant. L'enseignant pose donc un
  // DRAPEAU, `_reprise-<id de la séance>`, dans la zone où il a le droit d'écrire (les travaux de
  // l'élève), et c'est l'élève lui-même qui remet sa base en état à sa prochaine ouverture. La date
  // du drapeau est retenue dans la base : un drapeau n'est appliqué qu'une fois.
  //
  // « Au début de la séance S » = la photo prise à la fin de la séance précédente, c'est-à-dire ce
  // que l'élève a réellement fait. Sans photo (séance débloquée à la main), la base de départ.
  // Les photos de S et des suivantes sont retirées : ces séances sont à refaire.
  if (m.meta.portee === 'eleve' && profil.role === 'eleve' && groupeActif && (m.meta.parcours || m.meta.immersif)) {
    try {
      const metas = (await chargerActivites()).map((x) => x.meta);
      const base = jeuOuvert.etat();
      let derniere = null;
      for (const x of seancesDuParcours(metas, m.meta)) {
        const rep = await B.lireScore(groupeActif, profil.uid, '_reprise-' + x.id);
        if (rep && rep.dateMaj > (base.reprise || 0) && (!derniere || rep.dateMaj > derniere.rep.dateMaj)) derniere = { x, rep };
      }
      if (derniere) {
        const { x, rep } = derniere;
        const photo = x.precedente && base.points && base.points[x.precedente];
        const aDefaire = new Set(seancesDepuis(metas, x).map((y) => y.id));
        const gardees = {};
        Object.keys(base.points || {}).forEach((k) => { if (!aDefaire.has(k)) gardees[k] = base.points[k]; });
        Object.keys(base).forEach((k) => delete base[k]);
        if (photo) Object.assign(base, JSON.parse(JSON.stringify(photo)));
        else Object.keys(m.meta.tables || {}).forEach((t) => { base[t] = []; });
        if (Object.keys(gardees).length) base.points = gardees;
        base.reprise = rep.dateMaj;
        jeuOuvert.sauver();
        toast('Ton enseignant a remis ton travail au début de la séance.');
      }
    } catch (e) { /* un drapeau illisible ne doit jamais empêcher d'ouvrir la séance */ }
  }

  // Niveau et tiers-temps de l'élève (core/amenagements.js), relus ici et non pris du profil
  // chargé à la connexion : l'enseignant a pu les changer pendant que l'élève travaillait. Le
  // profil en mémoire suit, pour qu'aucune vue ne lise une valeur périmée par `ctx.profil`.
  let am = amenagements(profil);
  if (profil.role === 'eleve') {
    try { am = await B.relireAmenagements(); } catch (e) { /* relecture impossible : valeurs de la connexion */ }
    profil.aisance = am.aisance;
    profil.tiersTemps = am.tiersTemps;
  }

  const ctx = {
    profil, groupe: groupeActif, meta: m.meta, jeu: jeuOuvert,
    // Réglés élève par élève par l'enseignant (onglet « Comptes élèves »). `aisance` :
    // 'standard' ou 'confirme' — une séance qui ne le lit pas reste la même pour tous.
    // `tiersTemps` : seuils de temps × 4/3 dans une épreuve chronométrée.
    aisance: am.aisance,
    tiersTemps: am.tiersTemps,
    // Le niveau de la classe, pour les activités qui portent une série d'exercices de
    // difficulté inégale et n'en montrent que la part qui convient au groupe.
    niveauGroupe: objGroupe?.niveau || null,
    // Le nom lisible du groupe. `groupe` ci-dessus n'en porte que l'identifiant : un
    // classement qui mélange les classes doit afficher « 1 LOG », pas « 1-log ». L'objet
    // groupe est déjà chargé ici, donc ça ne coûte aucune lecture de plus.
    groupeNom: objGroupe?.nom || null,
    // Code qui déverrouille la vue d'ensemble du stock dans un environnement d'entreprise :
    // l'enseignant le donne au moment qu'il choisit dans la séance.
    codeStock: objGroupe?.codeStock || null,
    // Sortie de l'environnement, pour une activité immersive qui dessine son propre bouton.
    // La rubrique et l'entreprise ouvertes sont gardées : on revient à la liste des séances
    // de l'entreprise, pas à l'accueil général.
    quitter() { vueAccueil(); },
    async deconnexion() { fermerJeuCourant(); await B.deconnexion(); },
    // Le travail déjà enregistré pour cette activité, ou null. Utile aux activités
    // notées à la main : l'élève retrouve sa note en ouvrant le module.
    async lireScore() {
      if (!groupeActif) return null;
      try { return await B.lireScore(groupeActif, profil.uid, aid); } catch (e) { return null; }
    },
    // Évaluation en « copie rendue » (`meta.copie`, voir core/copie.js) : une seule remise,
    // note figée. Rend la copie enregistrée, ou lève une erreur (déjà rendue, hors groupe).
    async rendreCopie(res) {
      if (!m.meta.copie || profil.role !== 'eleve' || !groupeActif) throw new Error('pas de copie à rendre ici');
      return B.rendreCopie(groupeActif, profil.uid, aid, { score: res.score, max: res.max, detail: res.detail || null });
    },
    async enregistrer(res) {
      if (!m.meta.bareme || profil.role !== 'eleve' || !groupeActif) return;
      // Une évaluation ne remonte rien pendant le travail : seule la remise compte.
      if (m.meta.copie) return;
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
    retour: () => { rubriqueActive = null; entrepriseActive = null; vueAccueil(); },
  });
  // L'espace enseignant peut changer le groupe actif : on le relit au retour.
}

// --------------------------------------------------------------------- panne
// Une erreur de service ne doit jamais se traduire par un écran muet : sans cette vue,
// l'application reste sur « Chargement… » et personne ne sait pourquoi.
function vuePanne(e) {
  console.error('Prepalog : démarrage interrompu.', e);
  const code = (e && (e.code || e.name)) || 'inconnu';
  app.innerHTML = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil: null, grand: true })}
    <div class="avis avis-err">
      <strong>L'application n'a pas pu démarrer.</strong><br>
      ${ech(messageErreur(e))}
    </div>
    <p class="note">Détail technique : <code>${ech(code)}</code></p>
    <div class="rangee">
      <button class="btn btn-p" id="btnReessayer">Réessayer</button>
      <button class="btn btn-s" id="btnPanneDeco">Revenir à la connexion</button>
    </div>`;
  brancherEntete(null);
  document.getElementById('btnReessayer').addEventListener('click', () => location.reload());
  document.getElementById('btnPanneDeco').addEventListener('click', async () => {
    try { await B.deconnexion(); } catch (x) { /* déjà déconnecté */ }
    location.reload();
  });
}

// ------------------------------------------------------------------ amorçage
(async function demarrer() {
  try {
    await demarrerBackend();
  } catch (e) { vuePanne(e); return; }

  B.onAuth(async (p) => {
    profil = p;
    // Un changement de session repart de l'accueil : sinon la rubrique ouverte par
    // l'utilisateur précédent resterait affichée après la connexion suivante.
    rubriqueActive = null;
    entrepriseActive = null;
    if (!p) {
      fermerJeuCourant();
      groupeActif = null;
      // Profil absent parce que le service a refusé, ou simple déconnexion ?
      // Les deux mènent ici, et il faut les distinguer à l'écran.
      const e = B.panneDemarrage?.();
      if (e) { vuePanne(e); return; }
      vueConnexion();
      return;
    }
    try {
      if (p.role === 'prof' && !groupeActif) {
        const gs = await B.groupesDuProf(p.uid);
        const memo = groupeMemorise(p.uid);
        groupeActif = (memo && gs.some((g) => g.id === memo)) ? memo : (gs[0]?.id || null);
      }
      await vueAccueil();
    } catch (e) { vuePanne(e); }
  });
})();

// Sauvegarde de sûreté si l'élève ferme l'onglet au milieu d'une activité.
window.addEventListener('pagehide', () => { if (jeuOuvert) jeuOuvert.vidange?.(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && jeuOuvert) jeuOuvert.vidange?.();
});
