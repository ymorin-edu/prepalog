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
import { meilleurScore } from './notes.js';
import { uidCourt, idGroupe, responsable, libelleProf, gardeSuppressionEleve, gardeSuppressionGroupe, lisible } from './collegues.js';

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
    const profil = { uid: user.uid, ...s.data() };
    // Chantier 11 : un enseignant écrit son adresse dans son propre profil (les règles le permettent),
    // pour qu'un collègue puisse l'ajouter à un groupe en la tapant. Un échec ne gêne en rien.
    if (profil.role === 'prof' && user.email) {
      const mail = user.email.toLowerCase();
      if (String(profil.email || '').toLowerCase() !== mail) {
        try { await FS.updateDoc(dref('users', user.uid), { email: mail }); profil.email = mail; } catch (e) { /* sans gravité */ }
      }
    }
    return profil;
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
    // Un groupe dont on a été retiré (un collègue vous a enlevé de ses enseignants) est refusé en lecture par
    // les règles : pour l'écran c'est un groupe qui n'existe plus pour vous, pas une panne (chantier 11).
    async groupe(gid) {
      try {
        const s = await FS.getDoc(dref('groupes', gid));
        return s.exists() ? { id: gid, ...s.data() } : null;
      } catch (e) {
        if (e && e.code === 'permission-denied') return null;
        throw e;
      }
    },
    // Où en est ce groupe pour l'enseignant connecté : 'mien' (il y figure), 'autre' (il existe chez un collègue :
    // lecture refusée par les règles, ou lisible sans lui dans `profs`) ou 'absent' (supprimé). `groupe()` rend
    // `null` pour les deux derniers ; la garde de suppression d'un élève a besoin de les distinguer (un
    // groupe disparu n'empêche plus de supprimer, un groupe de collègue oui).
    async etatGroupe(gid) {
      try {
        const s = await FS.getDoc(dref('groupes', gid));
        if (!s.exists()) return 'absent';
        return courant && (s.data().profs || []).includes(courant.uid) ? 'mien' : 'autre';
      } catch (e) {
        if (e && e.code === 'permission-denied') return 'autre';
        throw e;
      }
    },
    // Chantier 11 (09/10/2026) : le nom d'abord. Si un collègue a déjà un groupe de ce nom, la lecture du
    // document est REFUSÉE par les règles (firestore.rules : on ne lit que ses groupes, ou un groupe
    // inexistant) ; c'est le signal « nom pris par un autre » : le groupe prend alors le suffixe de
    // l'enseignant (« 1l1-ab12cd ») et s'affiche « 1L1 » comme l'autre. Lisible = le groupe est à moi.
    async creerGroupe({ nom, annee, niveau, profUid }) {
      const base = idGroupe(nom) || ('g' + Math.random().toString(36).slice(2, 8));
      const dejaMoi = () => new Error('Vous avez déjà un groupe de ce nom.');
      let gid = base;
      try {
        if ((await FS.getDoc(dref('groupes', gid))).exists()) throw dejaMoi();
      } catch (e) {
        if (!e || e.code !== 'permission-denied') throw e;
        gid = `${base}-${uidCourt(profUid)}`;
        if ((await FS.getDoc(dref('groupes', gid))).exists()) throw dejaMoi();
      }
      const ref = dref('groupes', gid);
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
    // Une clé pointée (`ouverts.quiz-flux`) ne change QUE ce champ : deux enseignants du même groupe
    // qui ouvrent chacun une séance ne s'écrasent plus (chantier 11). Les segments passent par
    // `FieldPath` (les identifiants de séance portent des tirets), comme `majTemps`.
    async majGroupe(gid, patch) {
      const cles = Object.keys(patch);
      if (!cles.some((k) => k.includes('.'))) { await FS.updateDoc(dref('groupes', gid), patch); return; }
      const [premier, ...suite] = cles;
      const chemin = (k) => new FS.FieldPath(...k.split('.'));
      await FS.updateDoc(dref('groupes', gid), chemin(premier), patch[premier],
        ...suite.flatMap((k) => [chemin(k), patch[k]]));
    },

    // ---- plusieurs enseignants (chantier 11) ----
    // « Prénom Nom » d'enseignants à partir de leurs identifiants (étiquette « groupe de … »).
    async nomsProfs(uids) {
      const sortie = {};
      await Promise.all([...new Set(uids)].map(async (u) => {
        try {
          const s = await FS.getDoc(dref('users', u));
          sortie[u] = s.exists() ? libelleProf(s.data()) : '';
        } catch (e) { sortie[u] = ''; }
      }));
      return sortie;
    },

    // Le responsable (premier de `profs`) ajoute un collègue à son groupe, par son adresse. Deux
    // écritures non atomiques : le groupe (Firestore), puis le miroir des droits (Realtime Database).
    // Si la seconde échoue, le collègue est bien dans le groupe : le message le dit et renvoie au
    // bouton « Reconstruire l'accès », qui recopie `profs` dans le miroir.
    async ajouterCollegue(gid, email) {
      if (!courant) throw new Error('Connexion requise.');
      const mail = String(email || '').trim().toLowerCase();
      if (!mail) throw new Error("Tapez l'adresse du collègue.");
      const g = await this.groupe(gid);
      if (!g) throw new Error('Groupe introuvable.');
      if (responsable(g) !== courant.uid) throw new Error('Seul le responsable du groupe peut y ajouter un collègue.');
      let trouves;
      try {
        trouves = (await FS.getDocs(FS.query(cref('users'), FS.where('email', '==', mail))))
          .docs.filter((d) => d.data().role === 'prof');
      } catch (e) { throw new Error(lisible(e, "La recherche n'a pas abouti.")); }
      if (!trouves.length) {
        throw new Error("Aucun enseignant avec cette adresse : il doit s'être connecté une fois après avoir été autorisé.");
      }
      const uid = trouves[0].id;
      if ((g.profs || []).includes(uid)) throw new Error('Cet enseignant est déjà dans le groupe.');
      await FS.updateDoc(dref('groupes', gid), { profs: FS.arrayUnion(uid) });
      try {
        ouvrirRt();
        await DB.update(DB.ref(rt, `acces/${gid}/profs`), { [uid]: true });
      } catch (e) {
        throw new Error(`${libelleProf(trouves[0].data()) || mail} est dans le groupe, mais ses droits sur les bases partagées `
          + `n'ont pas pu être écrits : cliquez sur « Reconstruire l'accès ».`);
      }
      return { uid, nom: libelleProf(trouves[0].data()) || mail };
    },

    // Retirer un collègue (le responsable) ou quitter un groupe (le collègue lui-même). Le miroir des
    // droits d'abord, puis le groupe : si la seconde écriture échoue, le collègue a perdu ses droits
    // sur les bases partagées mais figure encore dans la liste, et « Reconstruire l'accès » le
    // rétablit ; dans l'autre ordre il garderait un accès que rien ne sait effacer.
    // Rend ce qui RESTE dans le groupe, que l'écran dit.
    async retirerCollegue(gid, uid) {
      if (!courant) throw new Error('Connexion requise.');
      const g = await this.groupe(gid);
      if (!g) throw new Error('Groupe introuvable.');
      const moi = courant.uid;
      if (responsable(g) === uid) throw new Error('Le responsable du groupe ne peut pas être retiré.');
      if (uid !== moi && responsable(g) !== moi) throw new Error('Seul le responsable du groupe peut retirer un collègue.');
      if (!(g.profs || []).includes(uid)) throw new Error("Cet enseignant n'est pas dans le groupe.");
      const crees = (await this.elevesDuGroupe(gid)).filter((e) => e.creePar === uid).length;
      ouvrirRt();
      await DB.remove(DB.ref(rt, `acces/${gid}/profs/${uid}`));
      try {
        await FS.updateDoc(dref('groupes', gid), { profs: FS.arrayRemove(uid) });
      } catch (e) {
        throw new Error("Ses droits sur les bases partagées sont retirés, mais il figure encore dans la liste du groupe : recommencez.");
      }
      return { restes: [
        ...(crees ? [`${crees} élève${crees > 1 ? 's' : ''} qu'il a créé${crees > 1 ? 's' : ''} dans le groupe`] : []),
        'ses écritures dans les bases partagées',
      ] };
    },

    // Retire un élève d'UN groupe sans rien supprimer : ni son profil, ni son code, ni ses travaux.
    // C'est ce que fait un enseignant pour un élève qu'il n'a pas le droit de supprimer. S'il n'a plus
    // de groupe, il réapparaît dans « Élèves sans groupe » chez celui qui l'a créé.
    async detacherEleve(uid, gid) {
      if (!courant) throw new Error('Connexion requise.');
      const g = await this.groupe(gid);
      if (!g || !(g.profs || []).includes(courant.uid)) throw new Error("Ce groupe n'est pas le vôtre.");
      ouvrirRt();
      await DB.remove(DB.ref(rt, `acces/${gid}/eleves/${uid}`));
      await FS.updateDoc(dref('users', uid), { groupes: FS.arrayRemove(gid) });
      return { restes: ['ses travaux dans ce groupe', 'sa ligne dans les bases partagées'] };
    },

    // Réécrit le miroir d'accès d'un groupe côté Realtime Database (chantier 6, 08/10/2026).
    // `creerGroupe()` écrit Firestore puis `acces/{gid}` ; si la seconde écriture échoue
    // (enseignant absent de `profsGlobaux`), le groupe existe sans droits côté base temps réel
    // et rien ne le répare. Source de vérité : le document Firestore du groupe (ses `profs`) et
    // les profils de ses élèves. Écriture seule, rien n'est supprimé. Refusée par les règles si
    // l'enseignant n'est pas dans `profsGlobaux` ET que le miroir n'existe pas (ou ne le cite pas). Depuis le
    // lot 11b du chantier 11 : un miroir qui existe ne se réécrit que par un enseignant qu'il cite, même global.
    async reconstruireAcces(gid) {
      if (!courant) throw new Error('Connexion requise.');
      const g = await this.groupe(gid);
      if (!g) throw new Error('Groupe introuvable.');
      if (!(g.profs || []).includes(courant.uid)) throw new Error("Ce groupe n'est pas le vôtre.");
      const profs = new Set(g.profs);
      const eleves = await this.elevesDuGroupe(gid);
      const maj = {};
      profs.forEach((p) => { maj[`profs/${p}`] = true; });
      eleves.forEach((e) => { maj[`eleves/${e.uid}`] = true; });
      ouvrirRt();
      try {
        await DB.update(DB.ref(rt, `acces/${gid}`), maj);
      } catch (e) {
        if (/permission/i.test((e && (e.code || e.message)) || '')) {
          throw new Error("Ton compte ne peut pas écrire cet accès côté Realtime Database. Si le groupe est celui d'un collègue qui t'a ajouté, c'est lui (le responsable) qui doit cliquer sur « Reconstruire l'accès » ; sinon, voir la procédure d'amorçage (profsGlobaux).");
        }
        throw e;
      }
      return { profs: profs.size, eleves: eleves.length };
    },

    // Niveau et tiers-temps d'un élève (voir core/amenagements.js). Les règles Firestore
    // refusent qu'un élève écrive ces champs sur son propre profil. Le premier réglage des niveaux par scénario
    // retire l'ancien niveau unique `aisance` (migration, core/amenagements.js).
    async majAmenagements(uid, patch) {
      const p = filtrerAmenagements(patch);
      if ('niveaux' in p) p.aisance = FS.deleteField();
      await FS.updateDoc(dref('users', uid), p);
    },
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
    // l'intérêt d'un champ `groupes` multiple.
    //
    // `aids` : les identifiants d'activités connus (registre `activites/index.js`), transmis à
    // `supprimerEleve()` pour effacer les lignes de classement des élèves qui partent.
    // Chantier 6 (08/10/2026) — ce que la suppression d'un groupe laisse volontairement : les
    // lignes de classement des élèves seulement DÉTACHÉS (ils existent encore, avec leur autre
    // groupe) ; leur champ `gid` désigne alors un groupe disparu, sans autre effet qu'un
    // libellé de groupe sur le classement commun.
    //
    // Chantier 11 (09/10/2026) : GARDE EN TÊTE, avant la première écriture. Seul le responsable (premier de
    // `profs`) supprime un groupe ; un collègue le QUITTE (`retirerCollegue`). Un refus au milieu
    // laisserait un groupe à moitié vidé.
    async supprimerGroupe(gid, { aids = [] } = {}) {
      if (!courant) throw new Error('Connexion requise.');
      let g0 = null;
      try {
        const sg = await FS.getDoc(dref('groupes', gid));
        g0 = sg.exists() ? { id: gid, ...sg.data() } : null;
      } catch (e) {
        // Lecture refusée = le groupe est à un autre enseignant : rien n'est tenté.
        if (e && e.code === 'permission-denied') throw new Error("Ce groupe n'est pas le vôtre.");
        throw e;
      }
      if (g0) {
        const refus = (g0.profs || []).includes(courant.uid) ? gardeSuppressionGroupe(g0, courant.uid)
          : "Ce groupe n'est pas le vôtre.";
        if (refus) throw new Error(refus);
      }
      const eleves = await this.elevesDuGroupe(gid);
      // Les groupes de l'enseignant, lus UNE fois (et non pour chaque élève) : ils servent à
      // retrouver les travaux d'un élève dans un groupe que son profil ne cite plus.
      const groupesProf = courant ? await this.groupesDuProf(courant.uid) : [];
      let supprimes = 0, detaches = 0, comptes = 0;
      const restes = [];
      for (const el of eleves) {
        if ((el.groupes || []).length <= 1) {
          // supprimerEleve() fait le reste : travaux, jeux privés, classements,
          // acces/{gid}/eleves/{uid}, profil, puis le compte. Il tourne tant que `acces/{gid}`
          // existe encore, donc avant la purge du miroir plus bas — dans l'autre ordre il se
          // ferait refuser. `nettoyerGroupes: false` : les entrées demiDe/equipes de CE groupe
          // partent avec son document, inutile de le réécrire élève par élève.
          // `sansGarde` : la garde de groupe ci-dessus a déjà établi que vous en êtes le responsable, et cet
          // élève n'a pas d'autre groupe (il part avec lui).
          const r = await this.supprimerEleve(el.uid, { aids, groupesProf, nettoyerGroupes: false, sansGarde: true });
          supprimes++;
          if (r && r.compte) comptes++;
          if (r && r.restes) restes.push(...r.restes);
          continue;
        }
        const s = await FS.getDocs(cref('travaux', gid, 'eleves', el.uid, 'activites'));
        for (const d of s.docs) await FS.deleteDoc(d.ref);
        await FS.updateDoc(dref('users', el.uid), { groupes: FS.arrayRemove(gid) });
        detaches++;
      }
      // Ordre d'effacement INTANGIBLE : élèves (ci-dessus), puis jeux/{gid}, puis le miroir
      // acces/{gid} — dont dépendent les droits des deux écritures d'avant —, puis le groupe.
      ouvrirRt();
      await DB.remove(DB.ref(rt, `jeux/${gid}`));
      await DB.remove(DB.ref(rt, `acces/${gid}`));
      await FS.deleteDoc(dref('groupes', gid));
      return { eleves: eleves.length, supprimes, detaches, comptes, restes };
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
          erreurs.push(`${e.prenom} ${e.nom} : ${lisible(err, 'échec')}`);
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

    // Suppression complète d'un élève : travaux, jeux privés, lignes de classement, miroirs de
    // droits, entrées dans les documents de groupe, profil, et le compte d'authentification
    // lui-même.
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
    //
    // Chantier 6 (08/10/2026) — ce qui part en plus, et ce qui est NOMMÉ comme restant :
    //  - `classements/{aid}/{uid}` pour chaque `aid` de la liste `aids` (le registre des
    //    activités, fourni par l'appelant ; une ligne absente n'est pas une erreur). Un refus
    //    n'arrête pas la suppression : il est rendu dans `restes`.
    //  - les travaux `travaux/{gid}/eleves/{uid}/activites/*` de TOUS les groupes de
    //    l'enseignant, et plus seulement ceux que le profil de l'élève cite (un profil retouché
    //    à la console peut en avoir perdu). Firestore ne sait pas chercher les travaux d'un
    //    élève sans connaître le `gid` (aucune règle ne donne accès à un groupe de collections) :
    //    un groupe qui n'est ni cité par le profil ni à cet enseignant reste hors d'atteinte.
    //    Un groupe cité par le profil mais refusé (collègue, groupe disparu) n'arrête plus la
    //    suppression : il est nommé dans `restes`.
    //  - son entrée `demiDe[uid]` et `equipes[uid]` dans tous les groupes de l'enseignant.
    //  Reste volontairement : ses lignes dans les bases partagées de ses groupes
    //  (`jeux/{gid}/…`), qui appartiennent à la classe. Les drapeaux `_reprise-*` partent avec
    //  les travaux (l'élève, lui, ne peut pas les effacer : firestore.rules).
    //
    // `groupesProf` : les groupes de l'enseignant s'ils sont déjà connus (supprimerGroupe les
    // lit une fois). `nettoyerGroupes: false` : ne pas toucher aux documents de groupe.
    //
    // Chantier 11 (09/10/2026) — GARDE EN TÊTE, avant la première écriture (la suppression est en six
    // étapes non atomiques : un refus à la dernière laisserait un élève sans travaux ni base privée).
    // On ne supprime que ce qu'on a créé ou dont on est responsable ; un élève qui est aussi dans le
    // groupe d'un collègue, ou créé par un collègue dans un groupe dont on n'est pas responsable, ne se
    // supprime pas : on le détache (`detacherEleve`). Voir core/collegues.js.
    async supprimerEleve(uid, { aids = [], groupesProf = null, nettoyerGroupes = true, sansGarde = false } = {}) {
      const s = await FS.getDoc(dref('users', uid));
      const el = s.exists() ? s.data() : null;
      const gidsProfil = (el && el.groupes) || [];
      const profs = groupesProf || (courant ? await this.groupesDuProf(courant.uid) : []);
      if (!sansGarde && courant) {
        // Les groupes cités par le profil et qui ne sont pas à moi : seuls ceux qui existent chez un collègue
        // arrêtent la suppression (un groupe disparu est seulement nommé dans `restes`).
        const idsMiens = new Set(profs.map((g) => g.id));
        const etrangers = [];
        for (const gid of gidsProfil) {
          if (!idsMiens.has(gid) && (await this.etatGroupe(gid)) !== 'absent') etrangers.push(gid);
        }
        const refus = gardeSuppressionEleve(el, { moi: courant.uid, groupes: profs, etrangers });
        if (refus) throw new Error(refus);
      }
      const idsProf = new Set(profs.map((g) => g.id));
      const restes = [];

      for (const gid of new Set([...gidsProfil, ...idsProf])) {
        try {
          const t = await FS.getDocs(cref('travaux', gid, 'eleves', uid, 'activites'));
          for (const d of t.docs) await FS.deleteDoc(d.ref);
        } catch (e) {
          // Dans un groupe de l'enseignant, un échec est un vrai échec : on s'arrête, l'élève
          // existe encore et l'on peut recommencer. Ailleurs (groupe d'un collègue, groupe
          // disparu), c'est un refus attendu : on le nomme et on continue.
          if (idsProf.has(gid)) throw e;
          restes.push(`travaux dans le groupe « ${gid} » (pas à vous, ou groupe disparu)`);
        }
      }
      const pj = await FS.getDocs(cref('prives', uid, 'jeux'));
      for (const d of pj.docs) await FS.deleteDoc(d.ref);

      ouvrirRt();
      if (aids.length) {
        const refus = [];
        await Promise.all(aids.map((aid) => DB.remove(DB.ref(rt, `classements/${aid}/${uid}`))
          .catch(() => { refus.push(aid); })));
        if (refus.length) {
          restes.push(`lignes de classement refusées (${refus.length} activité${refus.length > 1 ? 's' : ''})`);
        }
      }
      for (const gid of gidsProfil) await DB.remove(DB.ref(rt, `acces/${gid}/eleves/${uid}`));

      if (nettoyerGroupes) {
        for (const g of profs) {
          const patch = {};
          if (g.demiDe && uid in g.demiDe) patch[`demiDe.${uid}`] = FS.deleteField();
          if (g.equipes && uid in g.equipes) patch[`equipes.${uid}`] = FS.deleteField();
          if (Object.keys(patch).length) await FS.updateDoc(dref('groupes', g.id), patch);
        }
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
      return { compte, restes };
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
      // Note posée par l'enseignant : figée pour l'élève (firestore.rules, 08/10/2026). On le dit
      // avant d'écrire, pour que l'élève lise la cause et non un « n'a pas pu être enregistré ».
      if (a && a.parProf && courant?.role === 'eleve') {
        throw Object.assign(new Error('note posée par l’enseignant'), { code: 'note-prof' });
      }
      const nouv = {
        ...res, uid, aid, gid,
        nom: courant?.nom || '', prenom: courant?.prenom || '',
        tentatives: (a?.tentatives || 0) + 1,
        meilleur: meilleurScore(a, res),
        dateMaj: Date.now(),
      };
      await FS.setDoc(ref, nouv);
      return nouv;
    },
    // Le temps passé seul (repérage) — voir le même nom dans backend-demo.js. Un seul champ mis à jour
    // (chemin par `FieldPath` : les identifiants de séance portent des tirets), sans lecture préalable :
    // le jeu privé est sauvé au même moment, le temps ne repart donc jamais d'une valeur plus basse.
    // `updateDoc` échoue sur un document absent : on rend false, la vue le crée. Les règles
    // (firestore.rules) refusent déjà l'écriture d'une copie rendue.
    async majTemps(gid, uid, aid, idSeance, secondes) {
      const ref = dref('travaux', gid, 'eleves', uid, 'activites', aid);
      try {
        await FS.updateDoc(ref, new FS.FieldPath('detail', 'indicateurs', idSeance, 'temps'), secondes, 'dateMaj', Date.now());
        return true;
      } catch (e) {
        if (e && e.code === 'not-found') return false;
        throw e;
      }
    },
    // Copie rendue (évaluation, `meta.copie`) : une seule remise, note figée — voir le même
    // nom dans backend-demo.js. La garde de l'élève est dans firestore.rules : un document qui
    // porte `rendu` ne se modifie plus que par l'enseignant du groupe.
    async rendreCopie(gid, uid, aid, res) {
      const ref = dref('travaux', gid, 'eleves', uid, 'activites', aid);
      const anc = await FS.getDoc(ref);
      if (anc.exists() && anc.data().rendu) throw new Error('copie déjà rendue');
      if (anc.exists() && anc.data().parProf && courant?.role === 'eleve') {
        throw Object.assign(new Error('note posée par l’enseignant'), { code: 'note-prof' });
      }
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
        // Repli : les règles ne couvrent pas la requête « toutes activités » (il faudrait un chemin
        // `{path=**}`), elle est refusée ; on interroge alors élève par élève (N lectures de plus).
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
    // `onValue` rend LA FONCTION qui retire l'écoute (pas le rappel d'origine) : c'est elle qu'il faut
    // appeler. Avant le 08/10/2026 on la passait à `off`, qui compare des rappels et ne retirait rien.
    // `erreur` est appelé si les règles refusent la lecture (sans lui, écran vide sans un mot).
    ecouterJeu(chemin, table, cb, erreur) {
      ouvrirRt();
      const r = DB.ref(rt, `${chemin}/${table}`);
      const retirer = DB.onValue(r, (s) => {
        const v = s.val() || {};
        cb(Object.keys(v).map((id) => ({ id, ...v[id] })));
      }, (e) => { console.error('Écoute refusée :', `${chemin}/${table}`, e); if (erreur) erreur(e); });
      const stop = () => { try { retirer(); } catch (e) {} ecouteurs.delete(stop); };
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
    // C'est aussi ce que la règle de sécurité exige : sous `classements/`, un élève n'a le
    // droit d'écrire que la ligne dont la clé est son propre uid.
    async poserLigne(chemin, table, id, ligne) {
      ouvrirRt();
      // Les classements promettent l'anonymat (entrainement.js) : le nom complet n'y est jamais
      // écrit, seul `nom` (nom court, si l'élève l'a voulu) l'est.
      const anonyme = chemin.startsWith('classements/');
      await DB.set(DB.ref(rt, `${chemin}/${table}/${id}`), {
        ...ligne,
        _par: courant?.uid || null,
        ...(anonyme ? {} : { _parNom: `${courant?.prenom || ''} ${courant?.nom || ''}`.trim() }),
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
    ecouterMeta(chemin, cb, erreur) {
      ouvrirRt();
      const r = DB.ref(rt, `${chemin}/meta`);
      const retirer = DB.onValue(r, (s) => cb(s.val() || {}),
        (e) => { console.error('Écoute refusée :', `${chemin}/meta`, e); if (erreur) erreur(e); });
      const stop = () => { try { retirer(); } catch (e) {} ecouteurs.delete(stop); };
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
