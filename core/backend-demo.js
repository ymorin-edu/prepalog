// Backend de démonstration : tout en localStorage, aucune connexion réseau.
// Sert au développement, aux tests automatisés et au repli si Firebase est absent.

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
        u[uid] = { role: 'prof', email: mail, nom: 'Enseignant', prenom: 'Démo', groupes: [] };
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
    async creerGroupe({ nom, annee, profUid }) {
      const g = groupes();
      const gid = nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid16();
      if (g[gid]) throw new Error('Un groupe porte déjà ce nom.');
      g[gid] = { nom, annee, profs: [profUid], code: Math.random().toString(36).slice(2, 6).toUpperCase(), ouverts: {}, equipes: {} };
      setGroupes(g);
      return { id: gid, ...g[gid] };
    },
    async majGroupe(gid, patch) {
      const g = groupes();
      if (!g[gid]) throw new Error('Groupe introuvable.');
      g[gid] = { ...g[gid], ...patch };
      setGroupes(g);
    },
    async elevesDuGroupe(gid) {
      const u = users();
      return Object.keys(u).filter((k) => u[k].role === 'eleve' && (u[k].groupes || []).includes(gid))
        .map((k) => ({ uid: k, ...u[k] }))
        .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, 'fr'));
    },
    async creerEleves(gid, liste, progres) {
      const u = users();
      const faits = [], erreurs = [];
      liste.forEach((e, i) => {
        const m = String(e.matricule).trim().toLowerCase();
        if (Object.values(u).some((x) => x.matricule === m)) {
          erreurs.push(`${e.prenom} ${e.nom} : matricule ${m} déjà utilisé`);
        } else {
          u[uid16()] = { role: 'eleve', nom: e.nom, prenom: e.prenom, matricule: m, code: e.code, groupes: [gid] };
          faits.push(e);
        }
        if (progres) progres(i + 1, liste.length);
      });
      setUsers(u);
      return { faits, erreurs };
    },
    async supprimerEleve(uid) {
      const u = users(); delete u[uid]; setUsers(u);
    },

    // ---- travaux ----
    async lireScore(gid, uid, aid) { return lire(`travaux/${gid}/${uid}/${aid}`, null); },
    async ecrireScore(gid, uid, aid, res) {
      const cle = `travaux/${gid}/${uid}/${aid}`;
      const anc = lire(cle, null);
      const nouv = {
        ...res, uid, aid, gid,
        nom: courant?.nom || '', prenom: courant?.prenom || '',
        tentatives: (anc?.tentatives || 0) + 1,
        meilleur: Math.max(anc?.meilleur ?? -1, res.score),
        dateMaj: Date.now(),
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
    async majLigne(chemin, table, id, patch) {
      const k = `${chemin}/${table}`;
      const t = lire(k, {});
      if (!t[id]) throw new Error('Ligne introuvable.');
      t[id] = { ...t[id], ...patch };
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
      if (!t[id]) throw new Error('Ligne introuvable.');
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
    fermerJeux() { /* rien à fermer en démo */ },
  };
}
