// Point d'entrée : amorçage, connexion, accueil, ouverture d'une activité.

import { demarrerBackend, B } from './backend.js';
import { CONFIG, DEMO } from './config.js';
import { ech, toast, entete, brancherEntete, messageErreur } from './ui.js';
import { activiteVisible, raisonCachee, courtNiveau, libelleNiveaux, demiDe } from './niveaux.js';
import { chargerActivites, activite, RUBRIQUES, ICONES, activitesDeRubrique, entreprisesDe, intentionDe } from '../activites/index.js';
import { ouvrirJeu, surEchec } from './store.js';
import { rendreEspaceProf } from './prof.js';
import { verrou, seancesDuParcours, versionDuParcours, baseDe, appliquerReprise } from './parcours.js';
import { amenagements } from './amenagements.js';

// Une sauvegarde ou une lecture qui échoue doit se voir (voir core/store.js).
surEchec((genre) => toast(genre === 'sauvegarde'
  ? "Ton travail n'a pas pu être enregistré (connexion ou accès). Reste sur la page et préviens ton professeur."
  : "Des données de la séance ne peuvent pas être lues (connexion ou accès). Préviens ton professeur.", 7000));

const app = document.getElementById('app');
let profil = null;
let groupeActif = null;
let jeuOuvert = null;
let rubriqueActive = null;   // null = pastilles d'accueil ; sinon id de la rubrique ouverte
let entrepriseActive = null; // rubrique rangée par entreprise (Simulog) : null = les logos ; sinon id de l'entreprise

// L'enseignant retrouve le groupe sur lequel il travaillait, d'une séance à l'autre.
const CLE_GROUPE = 'prepalog:groupe:';
const groupeMemorise = (uid) => { try { return localStorage.getItem(CLE_GROUPE + uid); } catch (e) { return null; } };
const memoriserGroupe = (uid, gid) => { try { localStorage.setItem(CLE_GROUPE + uid, gid || ''); } catch (e) {} };

// Le nettoyage que l'activité ouverte a déclaré (`ctx.surSortie`) : arrêt des minuteries,
// dernière sauvegarde. Appelé quelle que soit la sortie : bouton du site, bouton de la séance,
// flèche « Précédent » du navigateur, déconnexion.
let surSortie = null;

function fermerJeuCourant() {
  if (surSortie) { const f = surSortie; surSortie = null; try { f(); } catch (e) { console.error(e); } }
  if (jeuOuvert) { try { jeuOuvert.fermer(); } catch (e) {} jeuOuvert = null; }
  B.fermerJeux();
  // Filet de sécurité : une activité immersive repeint <body> à ses couleurs. Quelle que
  // soit la façon dont on la quitte, le site doit retrouver sa charte.
  document.body.classList.remove('immersion');
  document.body.removeAttribute('style');
}

// ---------------------------------------------------------------- historique
// Chaque écran (accueil, rubrique, entreprise, activité, espace enseignant) est une étape de
// l'historique du navigateur : « Précédent » revient d'un écran en arrière au lieu de quitter le
// site (décision du 04/10/2026). L'adresse ne change pas : recharger ramène à l'accueil.
// Les onglets de l'espace enseignant et les écrans internes d'une séance ne sont pas des étapes.
//
// `s` désigne la session de connexion (unique, même d'un rechargement à l'autre) : une étape
// d'une session précédente (autre élève sur le même poste, après une déconnexion, ou page
// rechargée) n'est jamais réaffichée. `n` est le rang de l'étape, et
// `pile` garde les écrans de la session pour qu'un bouton retour du site recule dans
// l'historique (au lieu d'empiler) quand il mène à l'étape précédente.
const ACCUEIL = { rub: null, ent: null, act: null, prof: null };
const PAGE = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let numSession = 0;
let sessionNav = '';
let pile = [];
let rang = 0;

const ecranCourant = (act = null, prof = null) => ({ rub: rubriqueActive, ent: entrepriseActive, act, prof });
const memeEcran = (a, b) => !!a && !!b && a.rub === b.rub && a.ent === b.ent && a.act === b.act && a.prof === b.prof;

function poserEtape(e, remplacer) {
  if (!remplacer) rang += 1;
  pile.length = rang;
  pile[rang] = e;
  const st = { prepalog: true, s: sessionNav, n: rang, ...e };
  if (remplacer) history.replaceState(st, ''); else history.pushState(st, '');
}

function nouvelleSession(e) {
  numSession += 1;
  sessionNav = PAGE + '-' + numSession;
  pile = []; rang = 0;
  poserEtape(e, true);
}

// Affiche l'écran `e` sans toucher à l'historique.
async function afficher(e) {
  rubriqueActive = e.rub; entrepriseActive = e.ent;
  if (e.prof != null) return vueProf(e.prof || undefined);
  if (e.act) {
    const ouverte = await vueActivite(e.act);
    // Activité devenue inaccessible (verrou, groupe) : on montre l'écran d'où elle s'ouvre.
    if (!ouverte) { history.replaceState({ prepalog: true, s: sessionNav, n: rang, ...ecranCourant() }, ''); pile[rang] = ecranCourant(); return vueAccueil(); }
    return;
  }
  return vueAccueil();
}

// Va à l'écran `e` comme le ferait l'utilisateur. Si c'est l'étape précédente de l'historique,
// on y recule (« ← ACCUEIL » puis Précédent ne rouvre pas l'écran qu'on vient de quitter) ;
// sinon on empile une étape.
async function aller(e) {
  if (rang > 0 && memeEcran(pile[rang - 1], e)) { history.back(); return; }
  if (e.act) {
    rubriqueActive = e.rub; entrepriseActive = e.ent;
    // L'étape n'est posée que si l'activité s'ouvre vraiment (pas de verrou, groupe présent).
    await vueActivite(e.act, () => poserEtape(e));
    return;
  }
  poserEtape(e);
  return afficher(e);
}

window.addEventListener('popstate', (ev) => {
  const st = ev.state;
  // Personne de connecté : on reste sur la connexion, quelle que soit l'étape visée.
  if (!profil) return;
  if (!st || !st.prepalog || st.s !== sessionNav) {
    // Étape d'une autre session (ou hors du site) : l'accueil de l'utilisateur connecté.
    rubriqueActive = null; entrepriseActive = null;
    nouvelleSession(ACCUEIL);
    vueAccueil();
    return;
  }
  rang = st.n;
  const e = { rub: st.rub ?? null, ent: st.ent ?? null, act: st.act ?? null, prof: st.prof ?? null };
  pile[rang] = e;
  afficher(e);
});

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
  // Un élève d'un demi-groupe suit les réglages de son demi-groupe là où il en a (MOTEUR-demi-groupes).
  const demi = estProf ? null : demiDe(groupe, profil.uid);
  const visibles = mods.filter((m) => estProf || activiteVisible(m.meta, groupe, demi));
  const cachee = (m) => (estProf ? raisonCachee(m.meta, groupe) : null);

  const rub = rubriqueActive ? RUBRIQUES.find((r) => r.id === rubriqueActive) : null;
  const cartouche = `
    ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil, logo: rub?.id === 'simulog' ? 'simulog' : undefined })}
    ${!estProf && !groupe ? `<div class="avis avis-err">Vous n'êtes rattaché à aucun groupe. Prévenez votre enseignant.</div>` : ''}
    ${estProf && !groupeActif ? `<div class="avis">Aucun groupe actif. Ouvrez l'espace enseignant pour en créer un.</div>` : ''}`;

  // ---- niveau 2 : une rubrique ouverte, ses activités en tuiles
  if (rub) {
    let acts = activitesDeRubrique(rub, visibles);

    // Rubrique rangée par entreprise (Simulog) : d'abord les logos, puis les séances de
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
    const verrous = {}, validees = {};
    await Promise.all(acts.map(async (x) => {
      try { verrous[x.meta.id] = await verrou(metas, x.meta, profil, groupeActif); } catch (e) { verrous[x.meta.id] = null; }
    }));
    // « validée ✓ » sur la tuile d'une séance de parcours dont l'élève a la photo de fin (bandeau de fin de séance,
    // 06/10/2026) — pas une photo d'une version périmée de la base (core/parcours.js).
    if (profil.role === 'eleve') {
      const bases = {};
      await Promise.all(acts.filter((x) => x.meta.parcours).map(async (x) => {
        try {
          const j = x.meta.jeuId || x.meta.id;
          const b = await (bases[j] || (bases[j] = baseDe(profil.uid, j)));
          const V = versionDuParcours(metas, x.meta);
          validees[x.meta.id] = !!(b.points && b.points[x.meta.id] && (!V || b.versionBase === V));
        } catch (e) { /* rien à marquer */ }
      }));
    }
    const tete = ent
      ? `<button class="lien-accueil" id="btnSimulog">← ${ech(rub.label.toUpperCase())}</button>
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
              ${validees[m.meta.id] ? '<span class="tuile-validee" data-validee>validée ✓</span>' : ''}
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

    document.getElementById('btnAccueil')?.addEventListener('click', () => aller(ACCUEIL));
    document.getElementById('btnSimulog')?.addEventListener('click', () =>
      aller({ ...ACCUEIL, rub: rubriqueActive }));
    document.querySelectorAll('[data-ent]').forEach((b) => b.addEventListener('click', () =>
      aller({ ...ACCUEIL, rub: rubriqueActive, ent: b.dataset.ent })));

    document.querySelectorAll('[data-rub]').forEach((b) => b.addEventListener('click', () => {
      const r = RUBRIQUES.find((x) => x.id === b.dataset.rub);
      const acts = activitesDeRubrique(r, visibles);
      // Une rubrique à activité unique ouvre directement : un clic de moins. Sauf une rubrique
      // rangée par entreprise : toujours logos, puis séances (décision de Tristan, 02/10/2026).
      if (acts.length === 1 && !r.parEntreprise) return aller({ ...ACCUEIL, act: acts[0].meta.id });
      aller({ ...ACCUEIL, rub: r.id });
    }));

    document.querySelectorAll('[data-act]').forEach((b) =>
      b.addEventListener('click', () => aller(ecranCourant(b.dataset.act))));

    // `prof` : '' = l'espace enseignant à son premier onglet, 'suivi' = le suivi de classe.
    document.getElementById('btnProfEspace')?.addEventListener('click', () => aller({ ...ACCUEIL, prof: '' }));
    document.getElementById('btnProfSuivi')?.addEventListener('click', () => aller({ ...ACCUEIL, prof: 'suivi' }));
  }
}

// ------------------------------------------------------------------- activité
// Rend `false` si l'activité ne s'ouvre pas (le message dit pourquoi). `avant` est appelé une
// fois les vérifications passées, juste avant de dessiner (pose de l'étape d'historique).
async function vueActivite(aid, avant) {
  const m = await activite(aid);
  if (!m) { toast('Activité introuvable.'); return false; }

  if (m.meta.portee !== 'eleve' && !groupeActif) {
    toast("Cette activité demande un groupe. L'enseignant doit en activer un.");
    return false;
  }
  // Parcours strict : une séance dont la précédente n'est pas validée reste fermée.
  {
    const raison = await verrou((await chargerActivites()).map((x) => x.meta), m.meta, profil, groupeActif);
    if (raison) { toast(raison); return false; }
  }
  if (avant) avant();
  // L'écran d'où l'activité s'ouvre : c'est là que ramènent « ← RUBRIQUE » et « Quitter ».
  const origine = ecranCourant();

  // Une activité « immersive » prend toute la page : pas de bandeau Prepalog, pas de titre
  // de module. L'élève doit avoir l'impression d'entrer dans le logiciel de l'entreprise,
  // pas d'ouvrir un chapitre du site. C'est le module qui dessine alors son propre en-tête
  // et son propre bouton de sortie.
  if (m.meta.immersif) {
    app.innerHTML = `<div id="hoteActivite" class="immersif"><div class="vide">Chargement…</div></div>`;
  } else {
    app.innerHTML = `
      ${entete({ marque: CONFIG.marque, institution: CONFIG.institution, profil, logo: rubriqueActive === 'simulog' ? 'simulog' : undefined })}
      <button class="lien-accueil" id="btnRetour">← ${rubriqueActive ? ech((RUBRIQUES.find((r) => r.id === rubriqueActive) || {}).label || 'RETOUR').toUpperCase() : 'ACCUEIL'}</button>
      <h1>${ech(m.meta.titre)}</h1>
      <p class="note">${ech(m.meta.code || '')} ${m.meta.desc ? '· ' + ech(m.meta.desc) : ''}
        ${m.meta.bareme ? (m.meta.notation === 'avancement'
          ? `· ${m.meta.bareme} étapes suivies`
          : `· noté sur ${m.meta.bareme}`) : ''}</p>
      <div id="hoteActivite"><div class="vide">Chargement…</div></div>`;
    brancherEntete(async () => { fermerJeuCourant(); await B.deconnexion(); });
    document.getElementById('btnRetour').addEventListener('click', () => aller(origine));
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
    // Base de classe : une par demi-groupe ; l'élève sans demi-groupe (et l'enseignant) ont celle de la classe.
    demi: demiDe(objGroupe, profil.uid),
  });

  // VERSION DE BASE (refonte d'ENT-1.1, 06/10/2026, brief ENT-1.1-spartoo-quai §7.4, décision de Tristan :
  // « quelle que soit l'avancée, on repart à 0 »). Une base d'une version antérieure du parcours (`versionBase`
  // des séances, voir core/parcours.js) est remise À NEUF à son ouverture, une seule fois : tout part, photos
  // de fin de séance comprises ; les scores du parcours et les déblocages manuels des séances suivantes sont
  // effacés du suivi (l'élève en a le droit sur ses propres résultats). Aucun geste de l'enseignant. Une base
  // neuve reçoit simplement le numéro.
  if (m.meta.portee === 'eleve' && (m.meta.parcours || m.meta.immersif)) {
    try {
      const metas = (await chargerActivites()).map((x) => x.meta);
      const V = versionDuParcours(metas, m.meta);
      const base = jeuOuvert.etat();
      if (V && base.versionBase !== V) {
        const ancienne = !!base.v;
        if (ancienne) Object.keys(base).forEach((k) => delete base[k]);
        base.versionBase = V;
        jeuOuvert.sauver();
        if (ancienne && profil.role === 'eleve' && groupeActif) {
          for (const x of seancesDuParcours(metas, m.meta)) {
            await B.poserNote(groupeActif, profil.uid, x.id, null).catch(() => {});
            if (x.precedente) await B.poserNote(groupeActif, profil.uid, '_debloque-' + x.id, null).catch(() => {});
          }
        }
        if (ancienne) toast('Cette séance a été refaite : ton travail repart de zéro.');
      }
    } catch (e) { /* une version illisible ne doit jamais empêcher d'ouvrir la séance */ }
  }

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
  // que l'élève a réellement fait. Sans photo (séance débloquée à la main, ou base par séance comme
  // Smoby), la base de départ. Les photos de S et des suivantes sont retirées : ces séances sont à
  // refaire. Le détail est dans `appliquerReprise` (core/parcours.js).
  if (m.meta.portee === 'eleve' && profil.role === 'eleve' && groupeActif && (m.meta.parcours || m.meta.immersif)) {
    try {
      const metas = (await chargerActivites()).map((x) => x.meta);
      const lireDrapeau = (id) => B.lireScore(groupeActif, profil.uid, '_reprise-' + id);
      if (await appliquerReprise(metas, m.meta, jeuOuvert.etat(), lireDrapeau)) {
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

  // La séance qui suit celle-ci dans son parcours (bandeau de fin de séance : « ENT-1.2 … est ouverte »).
  let suivante = null;
  if (m.meta.parcours) {
    try {
      const L = seancesDuParcours((await chargerActivites()).map((x) => x.meta), m.meta);
      const s = L[L.findIndex((x) => x.id === m.meta.id) + 1];
      if (s) suivante = { code: s.code, titre: s.titre };
    } catch (e) { /* pas de nom : le bandeau dit seulement « validée » */ }
  }

  // La dernière note écrite en base depuis l'ouverture de l'activité (voir `enregistrer`).
  let derniereNote = null;
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
    // La fiche d'intention du scénario (`ENTREPRISES`, activites/index.js). Transmise telle
    // quelle : c'est la vue qui décide de ne la montrer qu'à l'enseignant.
    intention: intentionDe(m.meta.code),
    suivante,
    // Sortie de l'environnement, pour une activité immersive qui dessine son propre bouton.
    // La rubrique et l'entreprise ouvertes sont gardées : on revient à la liste des séances
    // de l'entreprise, pas à l'accueil général.
    quitter() { aller(origine); },
    // L'activité déclare ici ce qu'il faut faire en la quittant (minuteries, dernière
    // sauvegarde). Appelé une fois, quelle que soit la sortie, Précédent du navigateur compris.
    surSortie(fn) { surSortie = fn; },
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
    // `opts.siChange` : pour une vue qui remonte la note à chaque geste (entreprise, animation).
    // Une note identique à la dernière envoyée depuis l'ouverture n'est pas réécrite : sans ça,
    // chaque clic coûte une lecture et une écriture en base, et une classe épuise le quota gratuit
    // de Firebase dans la journée. Les vues à bouton « Valider » ne le passent pas : chaque envoi
    // y reste une tentative, même à score égal. `opts.cle` : ce qui est comparé, quand une partie
    // du détail bouge toute seule (le temps passé) et ne doit pas, à elle seule, déclencher l'écriture.
    async enregistrer(res, opts = {}) {
      if (!m.meta.bareme || profil.role !== 'eleve' || !groupeActif) return;
      // Une évaluation ne remonte rien pendant le travail : seule la remise compte.
      if (m.meta.copie) return;
      const note = { score: res.score, max: res.max, detail: res.detail || null };
      const cle = opts.cle ?? JSON.stringify(note);
      if (opts.siChange && cle === derniereNote) return;
      try { await B.ecrireScore(groupeActif, profil.uid, aid, note); derniereNote = cle; }
      catch (e) { toast("Le score n'a pas pu être enregistré."); }
    },
    // Le temps passé seul (repérage, brief MOTEUR-temps-passe) : une écriture légère, envoyée toutes les
    // 2 minutes par la vue, qui ne touche ni au score ni aux tentatives. Mêmes gardes qu'`enregistrer`.
    // Rend false si le résultat n'existe pas encore (la vue le crée alors par `enregistrer`), null si
    // rien n'est à écrire ici. Un échec (réseau) est silencieux : le prochain envoi rattrape.
    async enregistrerTemps(secondes) {
      if (!m.meta.bareme || profil.role !== 'eleve' || !groupeActif || m.meta.copie) return null;
      try { return await B.majTemps(groupeActif, profil.uid, aid, m.meta.id, secondes); }
      catch (e) { return null; }
    },
  };

  m.rendre(document.getElementById('hoteActivite'), ctx);
  return true;
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
    retour: () => aller(ACCUEIL),
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
    // Et un historique propre : Précédent ne remonte jamais vers les écrans de la session d'avant.
    nouvelleSession(ACCUEIL);
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
