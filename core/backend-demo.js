// Backend de démonstration : tout en localStorage, aucune connexion réseau.
// Sert au développement, aux tests automatisés et au repli si Firebase est absent.

import { filtrerAmenagements, amenagements } from './amenagements.js';
import { meilleurScore } from './notes.js';
import { uidCourt, idGroupe, responsable, libelleProf, gardeSuppressionEleve, gardeSuppressionGroupe, lisible } from './collegues.js';

const P = 'prepalog:';
const lire = (k, d) => { try { const v = localStorage.getItem(P + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const ecrire = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} };
const uid16 = () => 'd' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// Bus d'événements local, pour que les écouteurs se comportent comme en temps réel.
const abonnes = new Map();
function publier(chemin) {
  (abonnes.get(chemin) || []).forEach((cb) => { try { cb(); } catch (e) {} });
}
function abonner(chemin, cb) {
  if (!abonnes.has(chemin)) abonnes.set(chemin, []);
  abonnes.get(chemin).push(cb);
  return () => {
    const l = abonnes.get(chemin) || [];
    const i = l.indexOf(cb);
    if (i >= 0) l.splice(i, 1);
  };
}

// Erreur rendue quand un élève tente d'écrire sur une séance que l'enseignant a notée : le vrai
// service la refuse (PERMISSION_DENIED), ici on la lève à la main pour que la suite la voie.
const erreurNoteFigee = () => Object.assign(new Error('note posée par l’enseignant'), { code: 'note-prof' });

// Applique un patch dont les clés peuvent être pointées (`ouverts.quiz-flux`), comme le fait `updateDoc` du mode
// réel : seul le champ visé change, le reste de l'objet est conservé (deux enseignants qui ouvrent chacun une
// séance ne s'écrasent pas). Une clé sans point remplace le champ entier.
function appliquerPatch(doc, patch) {
  const sortie = { ...doc };
  Object.keys(patch).forEach((cle) => {
    const seg = cle.split('.');
    if (seg.length === 1) { sortie[cle] = patch[cle]; return; }
    let cur = sortie;
    seg.slice(0, -1).forEach((k) => {
      cur[k] = (cur[k] && typeof cur[k] === 'object') ? { ...cur[k] } : {};
      cur = cur[k];
    });
    cur[seg[seg.length - 1]] = patch[cle];
  });
  return sortie;
}

let courant = null;          // { uid, role, nom, prenom, matricule, groupes }
const auditeursAuth = [];

function notifierAuth() { auditeursAuth.forEach((cb) => cb(courant)); }

export function creerBackendDemo() {
  // Amorçage : un enseignant de démonstration, pour pouvoir tout essayer.
  if (!lire('users', null)) {
    ecrire('users', {});
    ecrire('groupes', {});
  }

  const users = () => lire('users', {});
  const setUsers = (u) => ecrire('users', u);
  const groupes = () => lire('groupes', {});
  const setGroupes = (g) => ecrire('groupes', g);

  // Tout ce que l'effacement d'un élève emporte (miroir de supprimerEleve du mode réel).
  // Les travaux sont cherchés dans les groupes de l'enseignant connecté ET dans ceux du profil.
  function effacerEleve(uid, { aids = [], nettoyerGroupes = true } = {}) {
    const u = users();
    const gidsProfil = (u[uid] && u[uid].groupes) || [];
    delete u[uid]; setUsers(u);
    const g = groupes();
    const gidsProf = Object.keys(g).filter((k) => courant && (g[k].profs || []).includes(courant.uid));
    new Set([...gidsProfil, ...gidsProf]).forEach((gid) => {
      const idx = lire(`travauxIdx/${gid}`, []);
      idx.filter((k) => k.startsWith(`${uid}|`)).forEach((k) => {
        const [, aid] = k.split('|');
        try { localStorage.removeItem(`${P}travaux/${gid}/${uid}/${aid}`); } catch (e) {}
      });
      if (idx.some((k) => k.startsWith(`${uid}|`))) ecrire(`travauxIdx/${gid}`, idx.filter((k) => !k.startsWith(`${uid}|`)));
    });
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`${P}prive/${uid}/`))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    aids.forEach((aid) => {
      const k = `classements/${aid}`;
      const t = lire(k, null);
      if (t && uid in t) { delete t[uid]; ecrire(k, t); publier(k); }
    });
    if (nettoyerGroupes) {
      let change = false;
      gidsProf.forEach((gid) => {
        ['demiDe', 'equipes'].forEach((champ) => {
          if (g[gid][champ] && uid in g[gid][champ]) { delete g[gid][champ][uid]; change = true; }
        });
      });
      if (change) setGroupes(g);
    }
  }

  return {
    mode: 'demo',

    async init() {
      const s = lire('session', null);
      if (s && users()[s]) { courant = { uid: s, ...users()[s] }; }
      return courant;
    },

    onAuth(cb) { auditeursAuth.push(cb); cb(courant); },

    async connexionProf(email) {
      const mail = (email || 'prof.demo@prepalog.local').toLowerCase();
      const u = users();
      let uid = Object.keys(u).find((k) => u[k].email === mail);
      if (!uid) {
        uid = uid16();
        // Le premier enseignant de démonstration garde son nom d'origine ; un autre (chantier 11) prend le début de
        // son adresse, pour qu'on les distingue dans « groupe de … ».
        const defaut = mail === 'prof.demo@prepalog.local';
        const debut = mail.split('@')[0];
        u[uid] = defaut ? { role: 'prof', email: mail, nom: 'Enseignant', prenom: 'Démo', groupes: [] }
          : { role: 'prof', email: mail, nom: debut.charAt(0).toUpperCase() + debut.slice(1), prenom: 'Prof', groupes: [] };
        setUsers(u);
      }
      courant = { uid, ...u[uid] };
      ecrire('session', uid);
      notifierAuth();
      return courant;
    },

    async connexionEleve(matricule, code) {
      const m = String(matricule).trim().toLowerCase();
      const u = users();
      const uid = Object.keys(u).find((k) => u[k].matricule === m);
      if (!uid) throw new Error("Matricule inconnu. Vérifiez la saisie ou demandez à votre enseignant.");
      if (String(u[uid].code) !== String(code).trim()) throw new Error('Code incorrect.');
      courant = { uid, ...u[uid] };
      ecrire('session', uid);
      notifierAuth();
      return courant;
    },

    async deconnexion() {
      courant = null;
      ecrire('session', null);
      notifierAuth();
    },

    profilCourant() { return courant; },

    // ---- groupes ----
    async groupesDuProf(uid) {
      const g = groupes();
      return Object.keys(g).filter((k) => (g[k].profs || []).includes(uid)).map((k) => ({ id: k, ...g[k] }));
    },
    async groupe(gid) { const g = groupes()[gid]; return g ? { id: gid, ...g } : null; },
    // Comme en mode réel : 'mien' | 'autre' (existe, sans moi dans `profs`) | 'absent' (supprimé).
    async etatGroupe(gid) {
      const g = groupes()[gid];
      if (!g) return 'absent';
      return courant && (g.profs || []).includes(courant.uid) ? 'mien' : 'autre';
    },
    // Comme en mode réel (chantier 11) : un nom pris par un COLLÈGUE donne un identifiant suffixé de l'uid court
    // de l'enseignant ; un nom déjà pris par soi-même est refusé.
    async creerGroupe({ nom, annee, niveau, profUid }) {
      const g = groupes();
      const base = idGroupe(nom) || uid16();
      let gid = base;
      if (g[gid]) {
        if ((g[gid].profs || []).includes(profUid)) throw new Error('Vous avez déjà un groupe de ce nom.');
        gid = `${base}-${uidCourt(profUid)}`;
        if (g[gid]) throw new Error('Vous avez déjà un groupe de ce nom.');
      }
      g[gid] = { nom, annee, niveau, profs: [profUid], code: Math.random().toString(36).slice(2, 6).toUpperCase(), ouverts: {}, equipes: {} };
      setGroupes(g);
      return { id: gid, ...g[gid] };
    },
    async majGroupe(gid, patch) {
      const g = groupes();
      if (!g[gid]) throw new Error('Groupe introuvable.');
      g[gid] = appliquerPatch(g[gid], patch);
      setGroupes(g);
    },

    // ---- plusieurs enseignants (chantier 11) : les mêmes gardes et les mêmes messages qu'en mode réel ----
    async nomsProfs(uids) {
      const u = users();
      return Object.fromEntries([...new Set(uids)].map((x) => [x, u[x] ? libelleProf(u[x]) : '']));
    },
    async ajouterCollegue(gid, email) {
      if (!courant) throw new Error('Connexion requise.');
      const mail = String(email || '').trim().toLowerCase();
      if (!mail) throw new Error("Tapez l'adresse du collègue.");
      const g = groupes();
      if (!g[gid]) throw new Error('Groupe introuvable.');
      if (responsable(g[gid]) !== courant.uid) throw new Error('Seul le responsable du groupe peut y ajouter un collègue.');
      const u = users();
      const uid = Object.keys(u).find((k) => u[k].role === 'prof' && String(u[k].email || '').toLowerCase() === mail);
      if (!uid) throw new Error("Aucun enseignant avec cette adresse : il doit s'être connecté une fois après avoir été autorisé.");
      if ((g[gid].profs || []).includes(uid)) throw new Error('Cet enseignant est déjà dans le groupe.');
      g[gid].profs = [...(g[gid].profs || []), uid];
      setGroupes(g);
      return { uid, nom: libelleProf(u[uid]) || mail };
    },
    async retirerCollegue(gid, uid) {
      if (!courant) throw new Error('Connexion requise.');
      const g = groupes();
      if (!g[gid]) throw new Error('Groupe introuvable.');
      const moi = courant.uid;
      if (responsable(g[gid]) === uid) throw new Error('Le responsable du groupe ne peut pas être retiré.');
      if (uid !== moi && responsable(g[gid]) !== moi) throw new Error('Seul le responsable du groupe peut retirer un collègue.');
      if (!(g[gid].profs || []).includes(uid)) throw new Error("Cet enseignant n'est pas dans le groupe.");
      const u = users();
      const crees = Object.keys(u).filter((k) => u[k].role === 'eleve' && (u[k].groupes || []).includes(gid) && u[k].creePar === uid).length;
      g[gid].profs = g[gid].profs.filter((x) => x !== uid);
      setGroupes(g);
      return { restes: [
        ...(crees ? [`${crees} élève${crees > 1 ? 's' : ''} qu'il a créé${crees > 1 ? 's' : ''} dans le groupe`] : []),
        'ses écritures dans les bases partagées',
      ] };
    },
    async detacherEleve(uid, gid) {
      if (!courant) throw new Error('Connexion requise.');
      const g = groupes()[gid];
      if (!g || !(g.profs || []).includes(courant.uid)) throw new Error("Ce groupe n'est pas le vôtre.");
      const u = users();
      if (!u[uid]) throw new Error('Élève introuvable.');
      u[uid].groupes = (u[uid].groupes || []).filter((x) => x !== gid);
      setUsers(u);
      return { restes: ['ses travaux dans ce groupe', 'sa ligne dans les bases partagées'] };
    },
    // Même règle qu'en mode réel, et pour la même raison : un élève qui n'appartient qu'à
    // ce groupe part avec lui, sans quoi son profil survit sans jamais plus remonter dans
    // aucun écran (voir le commentaire détaillé dans backend-firebase.js).
    // Chantier 6 (08/10/2026) : chaque élève qui part passe par `effacerEleve()`, le même effacement
    // que `supprimerEleve()` (travaux, base privée, classements) ; avant, seuls le profil et les
    // travaux du groupe partaient, la base privée et les classements restaient.
    // Chantier 11 : seul le responsable (premier de `profs`) supprime ; un collègue du groupe le quitte. La garde passe
    // AVANT toute suppression d'élève. (Un enseignant absent de `profs`, que seuls des tests fabriquent avec un
    // `profUid` à eux, n'est pas arrêté ici : le mode réel, lui, le refuse par les règles.)
    async supprimerGroupe(gid, { aids = [] } = {}) {
      const g0 = groupes()[gid];
      if (g0 && courant && (g0.profs || []).includes(courant.uid)) {
        const refus = gardeSuppressionGroupe(g0, courant.uid);
        if (refus) throw new Error(refus);
      }
      const u0 = users();
      const aPurger = [], aDetacher = [];
      Object.keys(u0).forEach((k) => {
        const gs = u0[k].groupes || [];
        if (!gs.includes(gid)) return;
        if (u0[k].role === 'eleve' && gs.length <= 1) aPurger.push(k); else aDetacher.push(k);
      });
      aPurger.forEach((k) => effacerEleve(k, { aids, nettoyerGroupes: false }));   // garde de groupe déjà passée
      const u = users();
      aDetacher.forEach((k) => { if (u[k]) u[k].groupes = (u[k].groupes || []).filter((x) => x !== gid); });
      setUsers(u);
      const g = groupes(); delete g[gid]; setGroupes(g);
      lire(`travauxIdx/${gid}`, []).forEach((k) => {
        const [uid, aid] = k.split('|');
        try { localStorage.removeItem(`${P}travaux/${gid}/${uid}/${aid}`); } catch (e) {}
      });
      try { localStorage.removeItem(`${P}travauxIdx/${gid}`); } catch (e) {}
      // Le « / » final : `jeux/1l` ne doit pas emporter `jeux/1l-b/…`, groupe au préfixe voisin.
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(`${P}jeux/${gid}/`))
          .forEach((k) => localStorage.removeItem(k));
      } catch (e) {}
      return {
        eleves: aDetacher.length + aPurger.length,
        supprimes: aPurger.length,
        detaches: aDetacher.length,
        comptes: aPurger.length,   // en démonstration, profil et identifiant ne font qu'un
        restes: [],
      };
    },
    async elevesDuGroupe(gid) {
      const u = users();
      return Object.keys(u).filter((k) => u[k].role === 'eleve' && (u[k].groupes || []).includes(gid))
        .map((k) => ({ uid: k, ...u[k] }))
        .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, 'fr'));
    },
    // Élèves rattachés à aucun groupe. Même raison d'être qu'en mode réel : sans cette
    // liste, un élève sans groupe ne remonte dans aucun écran (voir backend-firebase.js).
    async elevesSansGroupe() {
      const u = users();
      return Object.keys(u).filter((k) => u[k].role === 'eleve' && !(u[k].groupes || []).length)
        .map((k) => ({ uid: k, ...u[k] }))
        .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, 'fr'));
    },
    async rattacherEleve(uid, gid) {
      const u = users();
      if (!u[uid]) throw new Error('Élève introuvable.');
      const gs = u[uid].groupes || [];
      if (!gs.includes(gid)) gs.push(gid);
      u[uid].groupes = gs;
      setUsers(u);
    },

    async creerEleves(gid, liste, progres) {
      const u = users();
      const faits = [], erreurs = [];
      liste.forEach((e, i) => {
        const m = String(e.matricule).trim().toLowerCase();
        if (Object.values(u).some((x) => x.matricule === m)) {
          erreurs.push(`${e.prenom} ${e.nom} : matricule ${m} déjà utilisé`);
        } else {
          // `creePar` comme en mode réel : c'est lui qui répartit les élèves sans groupe entre enseignants.
          u[uid16()] = { role: 'eleve', nom: e.nom, prenom: e.prenom, matricule: m, code: e.code, groupes: [gid],
            creePar: courant?.uid || null };
          faits.push(e);
        }
        if (progres) progres(i + 1, liste.length);
      });
      setUsers(u);
      return { faits, erreurs };
    },
    async supprimerEleve(uid, { aids = [], nettoyerGroupes = true } = {}) {
      // Chantier 11 : la même garde qu'en mode réel, avant toute suppression (core/collegues.js).
      if (courant) {
        const g = groupes();
        const miens = Object.keys(g).filter((k) => (g[k].profs || []).includes(courant.uid)).map((k) => ({ id: k, ...g[k] }));
        const idsMiens = new Set(miens.map((x) => x.id));
        const etrangers = ((users()[uid] && users()[uid].groupes) || []).filter((id) => !idsMiens.has(id) && g[id]);
        const refus = gardeSuppressionEleve(users()[uid], { moi: courant.uid, groupes: miens, etrangers });
        if (refus) throw new Error(refus);
      }
      // Comme en réel (voir backend-firebase.js) : le profil, les travaux de tous les groupes de
      // l'enseignant et du profil, la base privée, les lignes de classement, et l'entrée
      // demiDe / equipes de ses groupes.
      // Comme en mode réel : un groupe cité par le profil mais qui n'est pas à moi (la garde ci-dessus a établi
      // qu'il a disparu) est nommé dans ce qui reste.
      const restes = [];
      if (courant) {
        const g = groupes();
        ((users()[uid] && users()[uid].groupes) || []).filter((id) => !(g[id] && (g[id].profs || []).includes(courant.uid)))
          .forEach((id) => restes.push(`travaux dans le groupe « ${id} » (pas à vous, ou groupe disparu)`));
      }
      effacerEleve(uid, { aids, nettoyerGroupes });
      return { compte: true, restes };
    },

    // Réécrit le miroir d'accès côté Realtime Database : en démonstration il n'y en a pas, la
    // fonction réussit sans rien faire (le mode réel la refuse à un enseignant hors profsGlobaux).
    async reconstruireAcces(gid) {
      const g = groupes()[gid];
      if (!g) throw new Error('Groupe introuvable.');
      return { profs: (g.profs || []).length, eleves: (await this.elevesDuGroupe(gid)).length };
    },

    // Niveau et tiers-temps d'un élève (voir core/amenagements.js). Même garde qu'en mode
    // réel, où ce sont les règles Firestore qui la tiennent : seul un enseignant écrit.
    async majAmenagements(uid, patch) {
      if (!courant || courant.role !== 'prof') throw new Error('Réservé à l’enseignant.');
      const u = users();
      if (!u[uid] || u[uid].role !== 'eleve') throw new Error('Élève introuvable.');
      u[uid] = { ...u[uid], ...filtrerAmenagements(patch) };
      setUsers(u);
    },
    // Relus à l'ouverture d'une séance : l'enseignant a pu cocher pendant que l'élève travaillait.
    async relireAmenagements() {
      return amenagements(courant ? users()[courant.uid] : null);
    },

    // ---- travaux ----
    async lireScore(gid, uid, aid) { return lire(`travaux/${gid}/${uid}/${aid}`, null); },
    async ecrireScore(gid, uid, aid, res) {
      const cle = `travaux/${gid}/${uid}/${aid}`;
      const anc = lire(cle, null);
      // Une copie rendue (ou ramassée) est FIGÉE : plus aucun score ne la remplace. Voir
      // `rendreCopie` ci-dessous et `core/copie.js`. Le vrai service le garantit aussi par ses
      // règles (firestore.rules) ; ici, c'est la seule garde.
      if (anc && anc.rendu) return anc;
      // Une note posée par l'enseignant (« mettre 0 », `parProf`) est figée pour l'élève, comme
      // dans firestore.rules (08/10/2026). L'enseignant, lui, la remplace (poserNote).
      if (anc && anc.parProf && courant?.role === 'eleve') throw erreurNoteFigee();
      const nouv = {
        ...res, uid, aid, gid,
        nom: courant?.nom || '', prenom: courant?.prenom || '',
        tentatives: (anc?.tentatives || 0) + 1,
        meilleur: meilleurScore(anc, res),
        dateMaj: Date.now(),
      };
      ecrire(cle, nouv);
      const idx = lire(`travauxIdx/${gid}`, []);
      const k = `${uid}|${aid}`;
      if (!idx.includes(k)) { idx.push(k); ecrire(`travauxIdx/${gid}`, idx); }
      return nouv;
    },
    // Le temps passé seul (repérage) : `detail.indicateurs[idSeance].temps`, sans toucher au score, aux
    // tentatives ni à l'index. Jamais à la baisse. Rend false si le résultat n'existe pas encore.
    async majTemps(gid, uid, aid, idSeance, secondes) {
      const cle = `travaux/${gid}/${uid}/${aid}`;
      const anc = lire(cle, null);
      if (!anc) return false;
      if (anc.rendu || (anc.parProf && courant?.role === 'eleve')) return true;
      const detail = { ...(anc.detail || {}) };
      const ind = { ...(detail.indicateurs || {}) };
      const r = { ...(ind[idSeance] || {}) };
      r.temps = Math.max(r.temps || 0, secondes);
      ind[idSeance] = r; detail.indicateurs = ind;
      ecrire(cle, { ...anc, detail, dateMaj: Date.now() });
      return true;
    },
    // Note posée par l'enseignant sur une activité sans correction automatique
    // (`notation: 'prof'`). Elle remplace le score au lieu de s'y ajouter : une note
    // corrigée à la baisse doit descendre. `res = null` efface la note.
    async poserNote(gid, uid, aid, res) {
      const cle = `travaux/${gid}/${uid}/${aid}`;
      if (res === null) {
        ecrire(cle, null);
        const idx = lire(`travauxIdx/${gid}`, []).filter((k) => k !== `${uid}|${aid}`);
        ecrire(`travauxIdx/${gid}`, idx);
        return null;
      }
      const anc = lire(cle, null) || {};
      const nouv = {
        ...anc, uid, aid, gid,
        score: res.score, max: res.max, meilleur: res.score,
        tentatives: anc.tentatives || 0,
        parProf: true, dateMaj: Date.now(),
      };
      ecrire(cle, nouv);
      const idx = lire(`travauxIdx/${gid}`, []);
      const k = `${uid}|${aid}`;
      if (!idx.includes(k)) { idx.push(k); ecrire(`travauxIdx/${gid}`, idx); }
      return nouv;
    },
    // Copie rendue (évaluation, `meta.copie`) : une seule remise, note figée. L'élève la rend
    // lui-même, ou l'enseignant la ramasse (`ramasse: true`, avec le nom de l'élève). Refusée
    // si une copie est déjà rendue : la première remise fait foi. Le score remplace un 0 posé
    // par l'enseignant quand c'est l'enseignant qui ramasse ; l'élève, lui, ne la remplace plus.
    async rendreCopie(gid, uid, aid, res) {
      const cle = `travaux/${gid}/${uid}/${aid}`;
      const anc = lire(cle, null);
      if (anc && anc.rendu) throw new Error('copie déjà rendue');
      if (anc && anc.parProf && courant?.role === 'eleve') throw erreurNoteFigee();
      const nouv = {
        uid, aid, gid,
        nom: res.nom ?? (courant?.nom || ''), prenom: res.prenom ?? (courant?.prenom || ''),
        score: res.score, max: res.max, detail: res.detail || null,
        meilleur: res.score, tentatives: 1,
        rendu: Date.now(), ramasse: !!res.ramasse, dateMaj: Date.now(),
      };
      ecrire(cle, nouv);
      const idx = lire(`travauxIdx/${gid}`, []);
      const k = `${uid}|${aid}`;
      if (!idx.includes(k)) { idx.push(k); ecrire(`travauxIdx/${gid}`, idx); }
      return nouv;
    },
    async suivi(gid) {
      const idx = lire(`travauxIdx/${gid}`, []);
      return idx.map((k) => {
        const [uid, aid] = k.split('|');
        return { uid, aid, ...lire(`travaux/${gid}/${uid}/${aid}`, {}) };
      });
    },

    // ---- jeu privé (portée élève) ----
    async lireJeuPrive(uid, aid) { return lire(`prive/${uid}/${aid}`, null); },
    async ecrireJeuPrive(uid, aid, data) { ecrire(`prive/${uid}/${aid}`, { data, ts: Date.now() }); },

    // ---- jeux partagés ----
    ecouterJeu(chemin, table, cb) {
      const k = `${chemin}/${table}`;
      const envoyer = () => cb(Object.values(lire(k, {})));
      envoyer();
      return abonner(k, envoyer);
    },
    async lireTable(chemin, table) { return Object.values(lire(`${chemin}/${table}`, {})); },
    async ajouterLigne(chemin, table, ligne) {
      const k = `${chemin}/${table}`;
      const t = lire(k, {});
      const id = ligne.id || uid16();
      t[id] = { ...ligne, id };
      ecrire(k, t); publier(k);
      return id;
    },
    // Pose une ligne à une clé CHOISIE par l'appelant, et la remplace si elle existe.
    // `ajouterLigne` ne peut pas servir à ça en mode réel : la Realtime Database y fabrique
    // la clé elle-même (`push`), donc un élève qui refait un quiz s'ajouterait une ligne de
    // classement de plus à chaque tentative. Ici la clé est l'uid : une ligne par élève.
    async poserLigne(chemin, table, id, ligne) {
      const k = `${chemin}/${table}`;
      const t = lire(k, {});
      t[id] = { ...ligne, id };
      ecrire(k, t); publier(k);
      return id;
    },
    async majLigne(chemin, table, id, patch) {
      const k = `${chemin}/${table}`;
      const t = lire(k, {});
      // Comme `update` de la Realtime Database : une ligne absente est créée.
      t[id] = { ...(t[id] || { id }), ...patch };
      ecrire(k, t); publier(k);
    },
    async supprimerLigne(chemin, table, id) {
      const k = `${chemin}/${table}`;
      const t = lire(k, {});
      delete t[id];
      ecrire(k, t); publier(k);
    },
    async incrementer(chemin, table, id, champ, delta) {
      const k = `${chemin}/${table}`;
      const t = lire(k, {});
      // Comme la transaction du mode réel : une ligne absente est créée.
      if (!t[id]) t[id] = { id };
      t[id][champ] = (Number(t[id][champ]) || 0) + delta;
      ecrire(k, t); publier(k);
      return t[id][champ];
    },
    async viderTable(chemin, table) {
      const k = `${chemin}/${table}`;
      ecrire(k, {}); publier(k);
    },
    ecouterMeta(chemin, cb) {
      const k = `${chemin}/meta`;
      const envoyer = () => cb(lire(k, {}));
      envoyer();
      return abonner(k, envoyer);
    },
    async majMeta(chemin, patch) {
      const k = `${chemin}/meta`;
      ecrire(k, { ...lire(k, {}), ...patch }); publier(k);
    },
    // Efface une base partagée entière (tables et meta) : sert à retirer un demi-groupe.
    // Le « / » final ne laisse pas `magasin~d1` emporter `magasin~d10`.
    async effacerJeu(chemin) {
      try {
        Object.keys(localStorage).filter((k) => k.startsWith(`${P}${chemin}/`)).forEach((k) => {
          localStorage.removeItem(k);
          publier(k.slice(P.length));
        });
      } catch (e) {}
    },
    fermerJeux() { /* rien à fermer en démo */ },
  };
}
