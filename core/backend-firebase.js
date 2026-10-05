// Backend Firebase.
//  - Firestore : identités, groupes, travaux, jeux privés. Peu de lectures, pas de temps réel.
//  - Realtime Database : jeux de données partagés. Facturée à la bande passante, pas à la
//    lecture : c'est ce qui rend la collaboration temps réel soutenable sur le plan gratuit.
//
// Discipline de connexion : la Realtime Database plafonne à 100 connexions simultanées sur
// le plan gratuit. On ne s'y connecte donc QUE pendant une activité à base partagée, et
// fermerJeux() coupe la connexion en sortant du module.

import { CONFIG, matEmail, matMdp } from './config.js';
import { filtrerAmenagements, amenagements } from './amenagements.js';

// Le SDK est servi par le dépôt, pas par gstatic.com : voir vendor/LISEZMOI.md.
// Un CDN bloqué par le filtrage académique empêcherait le mode réel de démarrer du tout.
// Chemins relatifs à ce module — `import()` les résout depuis core/, donc vendor/firebase/.
export const MODULES_SDK = Object.freeze([
  '../vendor/firebase/firebase-app.js',
  '../vendor/firebase/firebase-auth.js',
  '../vendor/firebase/firebase-firestore.js',
  '../vendor/firebase/firebase-database.js',
]);

// Chargement des quatre modules, isolé pour que la suite de tests puisse l'exercer
// sans configuration Firebase : c'est le seul endroit du dépôt qui va chercher du code.
export function chargerSdk() {
  return Promise.all(MODULES_SDK.map((m) => import(m)));
}

export async function creerBackendFirebase() {
  const [AP, AU, FS, DB] = await chargerSdk();

  const app = AP.initializeApp(CONFIG.firebase);
  const auth = AU.getAuth(app);
  const fs = FS.getFirestore(app);
  const rt = DB.getDatabase(app);

  let courant = null;
  let panne = null;     // dernière erreur de démarrage, expliquée à l'écran
  let rtActif = false;
  const ecouteurs = new Set();
  const auditeursAuth = [];
  const notifier = () => auditeursAuth.forEach((cb) => cb(courant));

  const dref = (...p) => FS.doc(fs, ...p);
  const cref = (...p) => FS.collection(fs, ...p);

  function ouvrirRt() {
    if (!rtActif) { DB.goOnline(rt); rtActif = true; }
  }

  async function chargerProfil(user) {
    if (!user) return null;
    const s = await FS.getDoc(dref('users', user.uid));
    if (!s.exists()) return null;
    return { uid: user.uid, ...s.data() };
  }

  return {
    mode: 'firebase',

    async init() {
      // La Realtime Database se connecte à la demande seulement.
      DB.goOffline(rt);
      return new Promise((res) => {
        // Une erreur ici — règles non publiées, service filtré, configuration fausse — ne
        // doit JAMAIS laisser cette promesse en suspens : l'application resterait sur
        // « Chargement… » sans un mot, ce qui est intenable devant une classe. On résout
        // donc toujours, et on garde l'erreur pour que l'interface l'explique.
        const fini = (e) => {
          panne = e || null;
          if (e) courant = null;
          notifier();
          res(courant);
        };
        AU.onAuthStateChanged(auth, async (u) => {
          try {
            courant = await chargerProfil(u);
            fini(null);
          } catch (e) {
            fini(e);
          }
        }, (e) => fini(e));
      });
    },

    // Dernière erreur de démarrage, null si tout va bien.
    panneDemarrage() { return panne; },

    onAuth(cb) { auditeursAuth.push(cb); cb(courant); },

    async connexionProf() {
      panne = null;
      const c = await AU.signInWithPopup(auth, new AU.GoogleAuthProvider());
      const ref = dref('users', c.user.uid);
      const s = await FS.getDoc(ref);
      if (!s.exists()) {
        const mail = (c.user.email || '').toLowerCase();
        if (!(CONFIG.superAdmins || []).map((x) => x.toLowerCase()).includes(mail)) {
          await AU.signOut(auth);
          throw new Error("Ce compte n'est pas encore autorisé. Demandez à l'administrateur de vous ajouter.");
        }
        // Amorçage du tout premier enseignant.
        await FS.setDoc(ref, {
          role: 'prof', email: mail,
          nom: c.user.displayName || 'Enseignant', prenom: '', groupes: [],
        });
      } else if (s.data().role !== 'prof') {
        await AU.signOut(auth);
        throw new Error('Ce compte est un compte élève.');
      }
      courant = await chargerProfil(c.user);
      notifier();
      return courant;
    },

    async connexionEleve(matricule, code) {
      panne = null;
      try {
        await AU.signInWithEmailAndPassword(auth, matEmail(matricule), matMdp(matricule, code));
      } catch (e) {
        throw new Error('Matricule ou code incorrect.');
      }
      courant = await chargerProfil(auth.currentUser);
      if (!courant) throw new Error('Profil introuvable. Prévenez votre enseignant.');
      notifier();
      return courant;
    },

    async deconnexion() {
      this.fermerJeux();
      await AU.signOut(auth);
      courant = null;
      notifier();
    },

    profilCourant() { return courant; },

    // ---- groupes ----
    async groupesDuProf(uid) {
      const q = FS.query(cref('groupes'), FS.where('profs', 'array-contains', uid));
      const s = await FS.getDocs(q);
      return s.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async groupe(gid) {
      const s = await FS.getDoc(dref('groupes', gid));
      return s.exists() ? { id: gid, ...s.data() } : null;
    },
    async creerGroupe({ nom, annee, niveau, profUid }) {
      const gid = nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const ref = dref('groupes', gid);
      if ((await FS.getDoc(ref)).exists()) throw new Error('Un groupe porte déjà ce nom.');
      const data = {
        nom, annee, niveau, profs: [profUid],
        code: Math.random().toString(36).slice(2, 6).toUpperCase(),
        ouverts: {}, equipes: {}, creeLe: Date.now(),
      };
      await FS.setDoc(ref, data);
      // Miroir des droits côté Realtime Database : ses règles ne savent pas lire Firestore.
      ouvrirRt();
      await DB.update(DB.ref(rt, `acces/${gid}/profs`), { [profUid]: true });
      return { id: gid, ...data };
    },
    async majGroupe(gid, patch) { await FS.updateDoc(dref('groupes', gid), patch); },

    // Niveau et tiers-temps d'un élève (voir core/amenagements.js). Les règles Firestore
    // refusent qu'un élève écrive ces deux champs sur son propre profil.
    async majAmenagements(uid, patch) { await FS.updateDoc(dref('users', uid), filtrerAmenagements(patch)); },
    // Relus à l'ouverture d'une séance (une lecture) : l'enseignant a pu cocher pendant que
    // l'élève travaillait, et le profil n'est chargé qu'à la connexion.
    async relireAmenagements() {
      if (!courant) return amenagements(null);
      const s = await FS.getDoc(dref('users', courant.uid));
      return amenagements(s.exists() ? s.data() : null);
    },

    // Suppression d'un groupe. L'ordre compte : les droits côté base temps réel viennent
    // du miroir `acces/{gid}`, donc ce nœud part EN DERNIER — l'effacer d'abord ferait
    // refuser tout le reste.
    //
    // Les élèves qui n'appartiennent qu'à ce groupe partent AVEC lui, compte
    // d'authentification compris. Jusqu'au 01/10/2026 ils étaient seulement détachés, et
    // c'était un cul-de-sac : `elevesDuGroupe()` interroge `users` par appartenance à un
    // groupe, et l'application n'a pas de vue « tous les élèves ». Un élève sans groupe ne
    // remontait donc dans aucun écran — invisible, mais bien présent, avec son profil, son
    // code en clair et son identifiant de connexion. `supprimerEleve()`, le seul outil
    // capable de l'effacer, part de la liste de classe : il était devenu inatteignable.
    // Constaté en production le 01/10/2026, sur un élève de test retiré à la main dans la
    // console.
    //
    // Les élèves rattachés à un autre groupe restent seulement détachés : c'est tout
    // l'intérêt d'un champ `groupes` multiple. `purger: false` rétablit l'ancien
    // comportement pour tous, et ne sert qu'aux tests.
    async supprimerGroupe(gid, { purger = true } = {}) {
      const eleves = await this.elevesDuGroupe(gid);
      let supprimes = 0, detaches = 0, comptes = 0;
      for (const el of eleves) {
        if (purger && (el.groupes || []).length <= 1) {
          // supprimerEleve() fait le reste : travaux, jeux privés, acces/{gid}/eleves/{uid},
          // profil, puis le compte. Il tourne tant que `acces/{gid}` existe encore, donc
          // avant la purge du miroir plus bas — dans l'autre ordre il se ferait refuser.
          const r = await this.supprimerEleve(el.uid);
          supprimes++;
          if (r && r.compte) comptes++;
          continue;
        }
        const s = await FS.getDocs(cref('travaux', gid, 'eleves', el.uid, 'activites'));
        for (const d of s.docs) await FS.deleteDoc(d.ref);
        await FS.updateDoc(dref('users', el.uid), { groupes: FS.arrayRemove(gid) });
        detaches++;
      }
      ouvrirRt();
      await DB.remove(DB.ref(rt, `jeux/${gid}`));
      await DB.remove(DB.ref(rt, `acces/${gid}`));
      await FS.deleteDoc(dref('groupes', gid));
      return { eleves: eleves.length, supprimes, detaches, comptes };
    },

    async elevesDuGroupe(gid) {
      const q = FS.query(cref('users'), FS.where('groupes', 'array-contains', gid));
      const s = await FS.getDocs(q);
      return s.docs.map((d) => ({ uid: d.id, ...d.data() }))
        .filter((u) => u.role === 'eleve')
        .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, 'fr'));
    },

    // Élèves rattachés à aucun groupe — le filet de sécurité de la base.
    //
    // `elevesDuGroupe()` interroge `users` par appartenance à un groupe : un élève dont le
    // champ `groupes` est vide n'apparaît donc nulle part, alors que son profil, son code
    // en clair et son identifiant de connexion existent toujours. Depuis le 01/10/2026
    // l'application n'en fabrique plus — `supprimerGroupe()` emporte ceux qui n'ont que ce
    // groupe — mais une manipulation dans la console Firebase en crée encore : c'est ce que
    // cette liste rend visible, et ce que `rattacherEleve()` répare.
    //
    // Une seule requête, filtrée sur le rôle ; le tri des « sans groupe » se fait ici,
    // Firestore ne sachant pas interroger un tableau vide. Volume visé : moins de 200 élèves.
    async elevesSansGroupe() {
      const q = FS.query(cref('users'), FS.where('role', '==', 'eleve'));
      const s = await FS.getDocs(q);
      return s.docs.map((d) => ({ uid: d.id, ...d.data() }))
        .filter((u) => !((u.groupes || []).length))
        .sort((a, b) => ((a.nom || '') + (a.prenom || '')).localeCompare((b.nom || '') + (b.prenom || ''), 'fr'));
    },

    // Rattache un élève à un groupe. Le miroir `acces/{gid}/eleves` suit, sans quoi l'élève
    // serait membre du groupe côté Firestore mais refusé par les règles de la base temps
    // réel — il verrait le groupe sans pouvoir ouvrir une seule base partagée.
    async rattacherEleve(uid, gid) {
      await FS.updateDoc(dref('users', uid), { groupes: FS.arrayUnion(gid) });
      ouvrirRt();
      await DB.update(DB.ref(rt, `acces/${gid}/eleves`), { [uid]: true });
    },

    async creerEleves(gid, liste, progres) {
      // Instance secondaire : créer un compte connecte l'utilisateur, on ne veut pas
      // déconnecter l'enseignant à chaque élève.
      const app2 = AP.initializeApp(CONFIG.firebase, 'creation' + Date.now());
      const auth2 = AU.getAuth(app2);
      const faits = [], erreurs = [];
      const majAcces = {};
      for (let i = 0; i < liste.length; i++) {
        const e = liste[i];
        try {
          const c = await AU.createUserWithEmailAndPassword(auth2, matEmail(e.matricule), matMdp(e.matricule, e.code));
          await FS.setDoc(dref('users', c.user.uid), {
            role: 'eleve', nom: e.nom, prenom: e.prenom,
            matricule: String(e.matricule).trim().toLowerCase(),
            // Le code est conservé pour que l'enseignant puisse le redonner à l'élève qui
            // l'a perdu. Sans lui, la seule issue serait de réécrire le mot de passe dans
            // la console, un par un : le SDK Admin, qui le ferait depuis l'application,
            // demande un serveur et donc le plan Blaze. Contrepartie assumée : tout
            // enseignant lit tous les profils, donc tous les codes.
            code: e.code || '',
            groupes: [gid], creePar: courant?.uid || null, creeLe: Date.now(),
          });
          majAcces[c.user.uid] = true;
          await AU.signOut(auth2);
          faits.push(e);
        } catch (err) {
          erreurs.push(`${e.prenom} ${e.nom} : ${(err && err.code) || (err && err.message) || 'échec'}`);
        }
        if (progres) progres(i + 1, liste.length);
      }
      try { await AP.deleteApp(app2); } catch (e) {}
      if (Object.keys(majAcces).length) {
        ouvrirRt();
        await DB.update(DB.ref(rt, `acces/${gid}/eleves`), majAcces);
      }
      return { faits, erreurs };
    },

    // Suppression complète d'un élève : travaux, jeux privés, miroirs de droits, profil,
    // et le compte d'authentification lui-même.
    //
    // Ce dernier point mérite une explication. Firebase n'autorise la suppression d'un
    // compte que par son propre titulaire — effacer celui d'un tiers passe par le SDK
    // Admin, donc un serveur, donc le plan Blaze. La parade : le code de l'élève est
    // conservé depuis le 30/09/2026, donc l'application connaît son mot de passe. Elle se
    // connecte à sa place dans une instance secondaire (le procédé de creerEleves) et
    // demande la suppression en son nom. Aucune élévation de privilège : c'est bien le
    // compte lui-même qui agit.
    //
    // Les comptes créés avant cette date n'ont pas de code enregistré : leur profil et
    // leurs données partent, mais l'identifiant survit et devra être retiré de la console.
    async supprimerEleve(uid) {
      const s = await FS.getDoc(dref('users', uid));
      const el = s.exists() ? s.data() : null;
      const gids = (el && el.groupes) || [];

      for (const gid of gids) {
        const t = await FS.getDocs(cref('travaux', gid, 'eleves', uid, 'activites'));
        for (const d of t.docs) await FS.deleteDoc(d.ref);
      }
      const pj = await FS.getDocs(cref('prives', uid, 'jeux'));
      for (const d of pj.docs) await FS.deleteDoc(d.ref);

      if (gids.length) {
        ouvrirRt();
        for (const gid of gids) await DB.remove(DB.ref(rt, `acces/${gid}/eleves/${uid}`));
      }
      await FS.deleteDoc(dref('users', uid));

      let compte = false;
      if (el && el.code && el.matricule) {
        const app2 = AP.initializeApp(CONFIG.firebase, 'suppr' + Date.now());
        try {
          const auth2 = AU.getAuth(app2);
          const c = await AU.signInWithEmailAndPassword(
            auth2, matEmail(el.matricule), matMdp(el.matricule, el.code));
          await AU.deleteUser(c.user);
          compte = true;
        } catch (e) {
          // Code faux, compte déjà absent : les données sont parties, on le signale.
        }
        try { await AP.deleteApp(app2); } catch (e) {}
      }
      return { compte };
    },

    // ---- travaux ----
    async lireScore(gid, uid, aid) {
      const s = await FS.getDoc(dref('travaux', gid, 'eleves', uid, 'activites', aid));
      return s.exists() ? s.data() : null;
    },
    async ecrireScore(gid, uid, aid, res) {
      const ref = dref('travaux', gid, 'eleves', uid, 'activites', aid);
      const anc = await FS.getDoc(ref);
      const a = anc.exists() ? anc.data() : null;
      // Copie rendue : figée. Les règles refuseraient de toute façon l'écriture de l'élève
      // (firestore.rules) ; on ne la tente pas, pour ne pas afficher une erreur à chaque geste.
      if (a && a.rendu) return a;
      const nouv = {
        ...res, uid, aid, gid,
        nom: courant?.nom || '', prenom: courant?.prenom || '',
        tentatives: (a?.tentatives || 0) + 1,
        meilleur: Math.max(a?.meilleur ?? -1, res.score),
        dateMaj: Date.now(),
      };
      await FS.setDoc(ref, nouv);
      return nouv;
    },
    // Copie rendue (évaluation, `meta.copie`) : une seule remise, note figée — voir le même
    // nom dans backend-demo.js. La garde de l'élève est dans firestore.rules : un document qui
    // porte `rendu` ne se modifie plus que par l'enseignant du groupe.
    async rendreCopie(gid, uid, aid, res) {
      const ref = dref('travaux', gid, 'eleves', uid, 'activites', aid);
      const anc = await FS.getDoc(ref);
      if (anc.exists() && anc.data().rendu) throw new Error('copie déjà rendue');
      const nouv = {
        uid, aid, gid,
        nom: res.nom ?? (courant?.nom || ''), prenom: res.prenom ?? (courant?.prenom || ''),
        score: res.score, max: res.max, detail: res.detail || null,
        meilleur: res.score, tentatives: 1,
        rendu: Date.now(), ramasse: !!res.ramasse, dateMaj: Date.now(),
      };
      await FS.setDoc(ref, nouv);
      return nouv;
    },
    // Note posée par l'enseignant (activités `notation: 'prof'`). Elle remplace le score
    // au lieu de s'y ajouter, et n'incrémente pas le compteur de tentatives.
    // `res = null` efface la note. Les règles Firestore autorisent déjà l'écriture par
    // un enseignant du groupe.
    async poserNote(gid, uid, aid, res) {
      const ref = dref('travaux', gid, 'eleves', uid, 'activites', aid);
      if (res === null) { await FS.deleteDoc(ref); return null; }
      const s = await FS.getDoc(ref);
      const a = s.exists() ? s.data() : {};
      const nouv = {
        ...a, uid, aid, gid,
        score: res.score, max: res.max, meilleur: res.score,
        tentatives: a.tentatives || 0,
        parProf: true, dateMaj: Date.now(),
      };
      await FS.setDoc(ref, nouv);
      return nouv;
    },
    async suivi(gid) {
      // Une seule requête pour toute la classe, toutes activités confondues.
      const q = FS.query(FS.collectionGroup(fs, 'activites'), FS.where('gid', '==', gid));
      try {
        const s = await FS.getDocs(q);
        return s.docs.map((d) => d.data());
      } catch (e) {
        // Repli si l'index de groupe de collections n'est pas encore créé.
        const eleves = await this.elevesDuGroupe(gid);
        const out = [];
        for (const el of eleves) {
          const s = await FS.getDocs(cref('travaux', gid, 'eleves', el.uid, 'activites'));
          s.docs.forEach((d) => out.push(d.data()));
        }
        return out;
      }
    },

    // ---- jeu privé ----
    async lireJeuPrive(uid, aid) {
      const s = await FS.getDoc(dref('prives', uid, 'jeux', aid));
      return s.exists() ? s.data() : null;
    },
    async ecrireJeuPrive(uid, aid, data) {
      await FS.setDoc(dref('prives', uid, 'jeux', aid), { data: JSON.stringify(data), ts: Date.now() });
    },

    // ---- jeux partagés (Realtime Database) ----
    ecouterJeu(chemin, table, cb) {
      ouvrirRt();
      const r = DB.ref(rt, `${chemin}/${table}`);
      const h = DB.onValue(r, (s) => {
        const v = s.val() || {};
        cb(Object.keys(v).map((id) => ({ id, ...v[id] })));
      });
      const stop = () => { DB.off(r, 'value', h); ecouteurs.delete(stop); };
      ecouteurs.add(stop);
      return stop;
    },
    async lireTable(chemin, table) {
      ouvrirRt();
      const s = await DB.get(DB.ref(rt, `${chemin}/${table}`));
      const v = s.val() || {};
      return Object.keys(v).map((id) => ({ id, ...v[id] }));
    },
    async ajouterLigne(chemin, table, ligne) {
      ouvrirRt();
      const r = DB.push(DB.ref(rt, `${chemin}/${table}`));
      await DB.set(r, { ...ligne, _par: courant?.uid || null, _parNom: `${courant?.prenom || ''} ${courant?.nom || ''}`.trim(), _ts: Date.now() });
      return r.key;
    },
    // Pose une ligne à une clé CHOISIE par l'appelant, et la remplace si elle existe.
    // `ajouterLigne` ci-dessus laisse la Realtime Database fabriquer la clé (`push`) :
    // un élève qui refait un quiz s'ajouterait une ligne de classement à chaque tentative.
    // Ici la clé est son uid, donc une seule ligne par élève, écrasée quand il fait mieux.
    // C'est aussi ce que la règle de sécurité exige : sous `communs/`, un élève n'a le
    // droit d'écrire que la ligne dont la clé est son propre uid.
    async poserLigne(chemin, table, id, ligne) {
      ouvrirRt();
      await DB.set(DB.ref(rt, `${chemin}/${table}/${id}`), {
        ...ligne,
        _par: courant?.uid || null,
        _parNom: `${courant?.prenom || ''} ${courant?.nom || ''}`.trim(),
        _ts: Date.now(),
      });
      return id;
    },
    async majLigne(chemin, table, id, patch) {
      ouvrirRt();
      await DB.update(DB.ref(rt, `${chemin}/${table}/${id}`), { ...patch, _ts: Date.now() });
    },
    async supprimerLigne(chemin, table, id) {
      ouvrirRt();
      await DB.remove(DB.ref(rt, `${chemin}/${table}/${id}`));
    },
    async incrementer(chemin, table, id, champ, delta) {
      // Transaction : deux élèves qui sortent du stock en même temps ne s'écrasent pas.
      ouvrirRt();
      const res = await DB.runTransaction(DB.ref(rt, `${chemin}/${table}/${id}/${champ}`), (v) => (Number(v) || 0) + delta);
      return res.snapshot.val();
    },
    async viderTable(chemin, table) {
      ouvrirRt();
      await DB.remove(DB.ref(rt, `${chemin}/${table}`));
    },
    ecouterMeta(chemin, cb) {
      ouvrirRt();
      const r = DB.ref(rt, `${chemin}/meta`);
      const h = DB.onValue(r, (s) => cb(s.val() || {}));
      const stop = () => { DB.off(r, 'value', h); ecouteurs.delete(stop); };
      ecouteurs.add(stop);
      return stop;
    },
    async majMeta(chemin, patch) {
      ouvrirRt();
      await DB.update(DB.ref(rt, `${chemin}/meta`), patch);
    },
    // Efface une base partagée entière (tables et meta) : sert à retirer un demi-groupe.
    // Les règles le permettent à l'enseignant du groupe (`.write` sur `jeux/{gid}`).
    async effacerJeu(chemin) {
      ouvrirRt();
      await DB.remove(DB.ref(rt, chemin));
    },

    fermerJeux() {
      ecouteurs.forEach((stop) => { try { stop(); } catch (e) {} });
      ecouteurs.clear();
      if (rtActif) { DB.goOffline(rt); rtActif = false; }
    },
  };
}
