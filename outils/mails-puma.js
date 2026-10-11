// Outil enseignant en lecture seule (voir outils/mails-puma.html) : le mail à Puma de chaque élève d'un groupe, jugé
// par le jalon « reserve » d'ENT-1.1. Aucune écriture, aucun rangement local.

import { demarrerBackend } from '../core/backend.js';
import { DEMO } from '../core/config.js';
import * as SP from '../contenus/spartoo.js';
import * as S from '../contenus/spartoo-reception.js';

const $ = (id) => document.getElementById(id);
const ech = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const etat = (t) => { $('etat').textContent = t; };
const criteres = S.ETAPES.filter((e) => e.id.startsWith('reserve-'));   // lot, manquant, colis abîmé : un jalon chacun
const adressePuma = SP.SUP_BY_ID.F003.email;

let B = null, prof = null;

async function demarrer() {
  B = await demarrerBackend();
  if (DEMO) { etat('Pas de configuration Firebase valide : le site est en mode démonstration, il n\'y a rien à lire.'); $('connexion').hidden = true; return; }
  prof = B.profilCourant ? B.profilCourant() : null;
  if (prof && prof.role === 'prof') await apresConnexion();
}

async function apresConnexion() {
  $('connexion').hidden = true;
  etat('Chargement de vos groupes…');
  const groupes = await B.groupesDuProf(prof.uid);
  $('groupe').innerHTML = groupes.map((g) => `<option value="${ech(g.id)}">${ech(g.nom || g.id)}</option>`).join('');
  $('groupe').hidden = !groupes.length; $('lire').hidden = !groupes.length;
  etat(groupes.length ? '' : 'Aucun groupe trouvé pour ce compte.');
}

$('connexion').addEventListener('click', async () => {
  try { etat('Connexion…'); prof = await B.connexionProf(); await apresConnexion(); } catch (e) { etat('Connexion refusée : ' + (e.message || e)); }
});

// Le verdict des trois jalons sur des mails donnés, critère par critère, avec les points gagnés.
function jugerMails(mails) {
  const db = { mails };
  const r = criteres.map((e) => { const x = e.verifier(db, SP); return { ok: x.status === 'ok', poids: e.poids, ligne: String(x.detail || '').split('\n').pop() }; });
  return { lignes: r.map((x) => (x.ok ? '✓ ' : '✗ ') + x.ligne + ' (' + (x.ok ? x.poids : 0) + ' / ' + x.poids + ')'), points: r.reduce((n, x) => n + (x.ok ? x.poids : 0), 0), sur: r.reduce((n, x) => n + x.poids, 0) };
}

$('lire').addEventListener('click', async () => {
  const liste = $('liste');
  liste.innerHTML = '';
  try {
    etat('Lecture du groupe…');
    const eleves = await B.elevesDuGroupe($('groupe').value);
    let sans = 0, justes = 0, faux = 0, n = 0;
    for (const el of eleves) {
      n += 1; etat(`Élève ${n} sur ${eleves.length}…`);
      const s = await B.lireJeuPrive(el.uid, 'spartoo');
      let db = s ? s.data : null;
      if (typeof db === 'string') { try { db = JSON.parse(db); } catch (e) { db = null; } }
      const sortants = ((db && db.mails) || []).filter((m) => m.folder === 'out').sort((a, b) => a.ts - b.ts);
      const aPuma = sortants.filter((m) => String(m.toMail || '').trim().toLowerCase() === adressePuma.toLowerCase());
      const autres = sortants.filter((m) => !aPuma.includes(m));
      const nom = `${ech(el.prenom)} ${ech(el.nom)}`;
      if (!aPuma.length) {
        sans += 1;
        liste.insertAdjacentHTML('beforeend', `<div class="carte"><h2>${nom}</h2><span class="gris">Aucun mail envoyé à Puma (${adressePuma}).</span>`
          + (autres.length ? `<div>Autres mails envoyés : ${autres.map((m) => ech(m.toMail || m.to || '?') + ' — ' + ech(m.subject || '')).join(' · ')}</div>` : '') + '</div>');
        continue;
      }
      const global = jugerMails(aPuma);
      if (global.points === global.sur) justes += 1; else faux += 1;
      liste.insertAdjacentHTML('beforeend', `<div class="carte"><h2>${nom} — <span class="${global.points === global.sur ? 'ok' : 'ko'}">${global.points} / ${global.sur}</span></h2>`
        + aPuma.map((m) => `<div class="gris">Envoyé le ${ech(new Date(m.ts).toLocaleString('fr-FR'))} — objet : ${ech(m.subject || '')}</div><pre>${ech(m.text || '')}</pre>`).join('')
        + `<ul class="criteres">${global.lignes.map((l) => `<li>${ech(l)}</li>`).join('')}</ul></div>`);
    }
    etat(`${eleves.length} élève(s) : ${justes} avec 2,5 / 2,5, ${faux} avec des points perdus, ${sans} sans mail à Puma.`);
  } catch (e) { etat('Lecture impossible : ' + (e.message || e)); }
});

demarrer().catch((e) => etat('Démarrage impossible : ' + (e.message || e)));
