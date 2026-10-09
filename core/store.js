// Jeux de données à portée variable.
//
// C'est la seule notion que l'auteur d'une activité manipule. Il déclare une portée,
// il reçoit un objet `jeu` qui sait lire, écrire, écouter, exporter et se réinitialiser.
// Passer une activité de « chacun sa base » à « base de classe » = changer un mot.
//
//   portee: 'eleve'   → Firestore, blob JSON privé. 1 écriture par sauvegarde.
//   portee: 'groupe'  → Realtime Database, partagé avec toute la classe (ou son demi-groupe).
//
// Les portées 'equipe' et 'commun' ont été retirées le 09/10/2026 (chantier 16) : aucune séance ni
// aucun écran ne s'en servait, et les règles `communs/` n'avaient aucun consommateur.

import { B } from './backend.js';

export const PORTEES = ['eleve', 'groupe'];

// Un échec de sauvegarde ou d'écoute ne doit jamais rester muet (hors-ligne, document trop gros,
// règle qui refuse = travail perdu). L'application branche ici un message à l'écran ; le moteur
// d'une séance, lui, n'a rien à savoir. Un même message n'est répété qu'après 15 secondes.
let alerte = null;
let derniere = 0;
export function surEchec(f) { alerte = f; }
export function signalerEchec(genre, e) {
  console.error(`Prepalog : échec (${genre})`, e);
  if (!alerte || Date.now() - derniere < 15000) return;
  derniere = Date.now();
  try { alerte(genre, e); } catch (x) {}
}

// `demi` : le demi-groupe de l'élève (brief MOTEUR-demi-groupes). Une base de classe y est
// propre à chaque demi-groupe : `jeux/{gid}/{aid}~{demi}`. Sans demi-groupe, la base de classe de toujours.
export function cheminDe(aid, gid, demi) {
  return demi ? `jeux/${gid}/${aid}~${demi}` : `jeux/${gid}/${aid}`;
}

// ---------------------------------------------------------------- portée élève
function jeuPrive(aid, uid, tables) {
  let data = null;
  let minuteur = null;
  const auditeurs = [];
  const prevenir = () => auditeurs.forEach((cb) => cb(data));

  async function charger() {
    const s = await B.lireJeuPrive(uid, aid);
    let brut = s ? s.data : null;
    if (typeof brut === 'string') { try { brut = JSON.parse(brut); } catch (e) { brut = null; } }
    data = brut || {};
    Object.keys(tables).forEach((t) => { if (!data[t]) data[t] = []; });
    return data;
  }

  function sauverPlusTard() {
    clearTimeout(minuteur);
    minuteur = setTimeout(() => B.ecrireJeuPrive(uid, aid, data).catch((e) => signalerEchec('sauvegarde', e)), 500);
  }

  return {
    portee: 'eleve', partage: false, chemin: null,
    async ouvrir() { await charger(); return this; },
    lignes(table) { return data[table] || []; },
    ecouter(table, cb) { const f = () => cb(data[table] || []); auditeurs.push(f); f(); return () => {}; },
    async ajouter(table, ligne) {
      const id = ligne.id || 'l' + Math.random().toString(36).slice(2, 9);
      (data[table] = data[table] || []).push({ ...ligne, id, _ts: Date.now() });
      sauverPlusTard(); prevenir(); return id;
    },
    async modifier(table, id, patch) {
      const l = (data[table] || []).find((x) => x.id === id);
      if (l) Object.assign(l, patch, { _ts: Date.now() });
      sauverPlusTard(); prevenir();
    },
    async supprimer(table, id) {
      data[table] = (data[table] || []).filter((x) => x.id !== id);
      sauverPlusTard(); prevenir();
    },
    async incrementer(table, id, champ, delta) {
      const l = (data[table] || []).find((x) => x.id === id);
      if (!l) return null;
      l[champ] = (Number(l[champ]) || 0) + delta;
      sauverPlusTard(); prevenir(); return l[champ];
    },
    async vider(table) { data[table] = []; sauverPlusTard(); prevenir(); },
    // Accès direct au blob, pour les activités dont l'état n'est pas une liste de lignes :
    // un environnement d'entreprise tient tout son ERP dans un seul objet JSON (stock,
    // mouvements, messages, commandes). On le modifie puis on appelle sauver().
    etat() { return data; },
    sauver() { sauverPlusTard(); prevenir(); },
    async semer(graines) {
      Object.keys(graines).forEach((t) => {
        data[t] = graines[t].map((l, i) => ({ id: 'g' + i, ...l, _ts: Date.now() }));
      });
      sauverPlusTard(); prevenir();
    },
    meta: { gele: false },
    ecouterMeta(cb) { cb({ gele: false }); return () => {}; },
    async majMeta() {},
    async vidange() { clearTimeout(minuteur); await B.ecrireJeuPrive(uid, aid, data); },
    fermer() { clearTimeout(minuteur); if (data) B.ecrireJeuPrive(uid, aid, data).catch((e) => signalerEchec('sauvegarde', e)); },
  };
}

// ------------------------------------------------------------ portées partagées
function jeuPartage(portee, chemin, tables) {
  const arrets = [];
  let meta = {};

  return {
    portee, partage: true, chemin,
    async ouvrir() {
      // En réel la première valeur de `meta` arrive après un aller-retour : on l'attend (3 s au
      // plus), sinon « Geler / dégeler » lirait un `meta` encore vide et gèlerait toujours.
      let prete; const premiere = new Promise((r) => { prete = r; });
      arrets.push(B.ecouterMeta(chemin, (m) => { meta = m || {}; this.meta = meta; prete(); },
        (e) => { signalerEchec('lecture', e); prete(); }));
      await Promise.race([premiere, new Promise((r) => setTimeout(r, 3000))]);
      return this;
    },
    lignes(table) { return this._cache?.[table] || []; },
    ecouter(table, cb) {
      this._cache = this._cache || {};
      const stop = B.ecouterJeu(chemin, table, (lignes) => { this._cache[table] = lignes; cb(lignes); },
        (e) => signalerEchec('lecture', e));
      arrets.push(stop);
      return stop;
    },
    async charger(table) {
      const l = await B.lireTable(chemin, table);
      this._cache = this._cache || {}; this._cache[table] = l;
      return l;
    },
    async ajouter(table, ligne) { return B.ajouterLigne(chemin, table, ligne); },
    async modifier(table, id, patch) { return B.majLigne(chemin, table, id, patch); },
    async supprimer(table, id) { return B.supprimerLigne(chemin, table, id); },
    async incrementer(table, id, champ, delta) { return B.incrementer(chemin, table, id, champ, delta); },
    async vider(table) { return B.viderTable(chemin, table); },
    async semer(graines) {
      for (const t of Object.keys(graines)) {
        await B.viderTable(chemin, t);
        for (const l of graines[t]) await B.ajouterLigne(chemin, t, l);
      }
      // Tables à écriture partagée (`ecriture: 'tous'` dans la déclaration de la table, ex. le stock du magasin) :
      // la règle de la Realtime Database n'ouvre la ligne d'un autre qu'à `meta/ouvert/{table} = 'tous'`, que seul l'enseignant
      // peut écrire (`jeux/{gid}/{cle}/meta`). Le semis est l'écriture qu'il fait, et la seule : ce moment-là est toujours celui
      // d'un enseignant (le bouton « Semer » de son espace), jamais celui d'un élève. Une table non semée garde la règle par défaut.
      const ouvert = {};
      Object.keys(tables || {}).forEach((t) => { if (tables[t] && tables[t].ecriture === 'tous') ouvert[t] = 'tous'; });
      await B.majMeta(chemin, { semeLe: Date.now(), ...(Object.keys(ouvert).length ? { ouvert } : {}) });
    },
    meta,
    ecouterMeta(cb) { const stop = B.ecouterMeta(chemin, cb, (e) => signalerEchec('lecture', e)); arrets.push(stop); return stop; },
    async majMeta(patch) { return B.majMeta(chemin, patch); },
    async vidange() {},
    fermer() { arrets.forEach((s) => { try { s(); } catch (e) {} }); arrets.length = 0; },
  };
}

// ----------------------------------------------------------------- fabrique
export async function ouvrirJeu({ aid, portee, tables = {}, uid, gid, demi }) {
  if (!PORTEES.includes(portee)) throw new Error(`Portée inconnue : ${portee}`);
  const jeu = portee === 'eleve'
    ? jeuPrive(aid, uid, tables)
    : jeuPartage(portee, cheminDe(aid, gid, demi), tables);
  jeu.tables = tables;
  return jeu.ouvrir();
}

// ------------------------------------------------------------------- outils
export function versCSV(lignes, champs) {
  const ech = (v) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const entete = champs.map((c) => ech(c.label || c.cle)).join(';');
  const corps = lignes.map((l) => champs.map((c) => ech(l[c.cle])).join(';'));
  return '﻿' + [entete, ...corps].join('\r\n');
}

export function telecharger(nom, contenu, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([contenu], { type }));
  a.download = nom;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
