// Backend Firebase.
//  - Firestore : identités, groupes, travaux, jeux privés. Peu de lectures, pas de temps réel.
//  - Realtime Database : jeux de données partagés. Facturée à la bande passante, pas à la
//    lecture : c'est ce qui rend la collaboration temps réel soutenable sur le plan gratuit.
//
// Discipline de connexion : la Realtime Database plafonne à 100 connexions simultanées sur
// le plan gratuit. On ne s'y connecte donc QUE pendant une activité à base partagée, et
// fermerJeux() coupe la connexion en sortant du module.

import { CONFIG, matEmail, matMdp } from './config.js';

const CDN = 'https://www.gstatic.com/firebasejs/10.13.0/';

export async function creerBackendFirebase() {
  const [AP, AU, FS, DB] = await Promise.all([
    import(CDN + 'firebase-app.js'),
    import(CDN + 'firebase-auth.js'),
    import(CDN + 'firebase-firestore.js'),
    import(CDN + 'firebase-database.js'),
  ]);

  const app = AP.initializeApp(CONFIG.firebase);
  const auth = AU.getAuth(app);
  const fs = FS.getFirestore(app);
  const rt = DB.getDatabase(app);

  let courant = null;
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
        AU.onAuthStateChanged(auth, async (u) => {
          courant = await chargerProfil(u);
          notifier();
          res(courant);
        });
      });
    },

    onAuth(cb) { auditeursAuth.push(cb); cb(courant); },

    async connexionProf() {
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

    async elevesDuGroupe(gid) {
      const q = FS.query(cref('users'), FS.where('groupes', 'array-contains', gid));
      const s = await FS.getDocs(q);
      return s.docs.map((d) => ({ uid: d.id, ...d.data() }))
        .filter((u) => u.role === 'eleve')
        .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, 'fr'));
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

    async supprimerEleve(uid) {
      // Le document part ; le compte Auth doit être retiré depuis la console Firebase.
      await FS.deleteDoc(dref('users', uid));
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

    fermerJeux() {
      ecouteurs.forEach((stop) => { try { stop(); } catch (e) {} });
      ecouteurs.clear();
      if (rtActif) { DB.goOffline(rt); rtActif = false; }
    },
  };
}
