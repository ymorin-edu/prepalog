// Stratelog, Avant l'Hiver : le poste (élève, Seigneur, tableau projeté) branché sur la base de classe.
//
// Ce fichier relie trois choses : la base (lignes lues et écrites, voir l'en-tête de partie.js), les gestes (partie.js)
// et les écrans (ecrans.js). Il ne calcule rien du jeu lui-même.
//   - L'ÉLÈVE écoute l'état du Seigneur et la table de sa ville ; il n'écrit que SA ligne (présence, lot de rôles pris,
//     cases de ses rôles, choix du nom et du blason, dépôt du registre).
//   - LE SEIGNEUR (l'enseignant) écoute tout ; chaque geste écrit un nouvel état, après une photo de l'ancien (retour
//     arrière geste par geste). Son poste reporte aussi les choix des élèves (nom, blason) et pose les notes à la fin.
// Une seule partie par classe : la base `jeux/{groupe}/stratelog-avant-l-hiver`, demi-groupes compris (l'enseignant et
// tous les élèves du groupe doivent lire la même).

import { B } from '../../core/backend.js';
import * as R from './regles.js';
import * as P from './partie.js';
import { SYMBOLES } from './symboles.js';
import { FIGURES, TEINTES } from './blasons.js';
import { ecranEleve, ecranSeigneur, ecranTableau, ecranVilleJeu, ech, mmss } from './ecrans.js';
import { logo } from './dessins.js';

const PRESENCE_TOUS_LES = 4 * 60000;
const clone = (x) => JSON.parse(JSON.stringify(x));
const pad = (n) => String(n).padStart(4, '0');
const nomCourt = (e) => `${e.prenom || ''} ${(e.nom || '').slice(0, 1)}${e.nom ? '.' : ''}`.trim() || 'Élève';
const ROLE_DU_CHAMP = { besoin: 'I', grenier: 'I', reserve: 'I', recu: 'I', q: 'M', ch: 'M', mt: 'M', halle: 'O', caisse: 'B', coup: 'B' };

// ------------------------------------------------------------------------------------- calculatrice (celle du jeu)
function calculer(txt) {
  const s = txt.replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '');
  let i = 0;
  const nombre = () => { const m = s.slice(i).match(/^\d+(\.\d+)?/); if (!m) throw new Error('nombre attendu'); i += m[0].length; return parseFloat(m[0]); };
  const facteur = () => {
    if (s[i] === '-') { i++; return -facteur(); }
    if (s[i] === '(') { i++; const v = somme(); if (s[i] !== ')') throw new Error('parenthèse'); i++; return v; }
    return nombre();
  };
  const produit = () => { let v = facteur(); while (s[i] === '*' || s[i] === '/') { const o = s[i++]; const w = facteur(); if (o === '/' && w === 0) throw new Error('division par zéro'); v = o === '*' ? v * w : v / w; } return v; };
  const somme = () => { let v = produit(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; const w = produit(); v = o === '+' ? v + w : v - w; } return v; };
  const v = somme(); if (i < s.length) throw new Error('calcul incomplet');
  return Math.round(v * 1e6) / 1e6;
}
const enFr = (x) => String(x).replace('.', ',');
const TOUCHES = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '(', ')', 'C', '⌫', '+', '='];
const calculatrice = () => `<button type="button" class="calc-ouvrir" id="calc-ouvrir" aria-expanded="false" aria-controls="calc">${logo('calculette', 26)} Calculatrice</button>
  <section class="calc" id="calc" hidden aria-label="Calculatrice">
    <div class="ligne" style="justify-content:space-between"><b>Calculatrice</b><button type="button" class="petit" id="calc-fermer">Fermer</button></div>
    <p class="calc-hist" id="calc-hist" aria-live="polite">&nbsp;</p>
    <input type="text" id="calc-ecran" inputmode="decimal" autocomplete="off" aria-label="Calcul" placeholder="0">
    <div class="calc-touches">${TOUCHES.map((k) => `<button type="button" data-touche="${k}" class="${k === '=' ? 'primaire' : ''}">${k}</button>`).join('')}</div>
    <button type="button" id="calc-haut" class="petit">Arrondir au-dessus</button>
  </section>`;

// ------------------------------------------------------------------------------------------------------ le poste
export function monter(hote, ctx) {
  const moi = { uid: ctx.profil.uid, prof: ctx.profil.role === 'prof' };
  const gid = ctx.groupe;
  if (!gid) { hote.innerHTML = '<p class="vide">Ouvre la partie depuis un groupe.</p>'; return; }
  const chemin = `jeux/${gid}/${ctx.meta.id}`;
  const arrets = [];
  const minuteries = [];

  let E = null; let etatLu = false; let lignesEtat = [];
  const Lv = {};                 // id de ville → { uid: ligne }
  let photos = [];               // [{ id, lib, json }] (Seigneur)
  let eleves = [];               // [{ uid, nom }] (Seigneur)
  let mien = null;               // ma ligne (élève), source de vérité de ce que j'écris
  let maVille = null;            // la table écoutée par l'élève
  let notesEnCours = false;
  let demande = false;           // un dessin est déjà demandé pour la prochaine image
  let stopVille = null;          // arrêt de l'écoute de la table de ma ville (élève)
  // (Tout est déclaré ici : en démonstration, une écoute répond tout de suite, avant la suite de ce fichier.)
  const ui = { onglet: 'I', fiche: null, placer: null, aideRes: null, ouvert: {}, vue: moi.prof ? 'seigneur' : 'eleve',
    choixVille: { nom: '', fig: null, teinte: 'gueules' }, msgVille: '', rolesVus: '' };

  hote.innerHTML = `${SYMBOLES}<div class="strat"><div class="page"><nav class="postes" aria-label="Choisir l'écran" ${moi.prof ? '' : 'hidden'}></nav><main class="ecran jeu" aria-live="off"></main>${calculatrice()}</div></div>`;
  const racine = hote.querySelector('.strat');
  const nav = racine.querySelector('.postes');
  const ecran = racine.querySelector('main');

  const L = () => Object.assign({}, ...Object.values(Lv), mien ? { [moi.uid]: mien } : {});

  // ------------------------------------------------------------------------------------------- écritures
  function poser(table, id, ligne) {
    return B.poserLigne(chemin, table, id, ligne).catch((e) => { console.error(e); signaler('L’enregistrement a échoué : vérifie la connexion.'); });
  }
  let minuteurMien = null;
  function ecrireMien(tout = false) {
    if (!mien || !maVille) return;
    clearTimeout(minuteurMien);
    const go = () => poser(P.tableVille(maVille), moi.uid, { json: JSON.stringify(mien) });
    if (tout) go(); else minuteurMien = setTimeout(go, 250);
  }
  // Un geste du Seigneur : photo de l'état d'avant (si `lib`), puis le nouvel état.
  async function geste(E2, lib) {
    if (!E2) return;
    if (lib && E) {
      const n = (E.nPhotos || 0) + 1;
      await poser(P.TABLE_PHOTOS, `p${pad(n)}`, { lib, json: JSON.stringify(E) });
      E2.nPhotos = n;
    }
    E = E2;
    dessiner();
    await poser(P.TABLE_ETAT, P.LIGNE_ETAT, { json: JSON.stringify(E2) });
  }
  async function revenir() {
    const p = [...photos].sort((a, b) => (a.id < b.id ? 1 : -1))[0];
    if (!p) return;
    let E2; try { E2 = JSON.parse(p.json); } catch (e) { return; }
    photos = photos.filter((x) => x.id !== p.id);
    E = E2; dessiner();
    await poser(P.TABLE_ETAT, P.LIGNE_ETAT, { json: p.json });
    await B.supprimerLigne(chemin, P.TABLE_PHOTOS, p.id).catch(() => {});
  }
  function signaler(t) { const s = racine.querySelector('.signal'); if (s) s.textContent = t; else ecran.insertAdjacentHTML('afterbegin', `<p class="alerte signal">${ech(t)}</p>`); }

  // ----------------------------------------------------------------------------------------------- écoutes
  arrets.push(B.ecouterJeu(chemin, P.TABLE_ETAT, (lignes) => {
    lignesEtat = lignes;
    let E2 = P.lireEtat(lignes);
    // Un état posé par un élève (la base le laisse créer une ligne absente) n'est pas une partie : le Seigneur le remplace.
    const l = lignes.find((x) => x.id === P.LIGNE_ETAT);
    if (E2 && l && l._par && eleves.some((e) => e.uid === l._par)) E2 = null;
    E = E2; etatLu = true;
    if (moi.prof && !E) { geste(P.etatNeuf()); return; }
    if (!moi.prof) suivreMaVille();
    apresChangement();
  }, (e) => console.error(e)));

  if (moi.prof) {
    P.IDS.forEach((id) => arrets.push(B.ecouterJeu(chemin, P.tableVille(id), (lignes) => { Lv[id] = P.lireLignes(lignes); apresChangement(); }, (e) => console.error(e))));
    arrets.push(B.ecouterJeu(chemin, P.TABLE_PHOTOS, (lignes) => { photos = lignes.filter((x) => typeof x.json === 'string'); dessiner(); }, (e) => console.error(e)));
    B.elevesDuGroupe(gid).then((l) => { eleves = l.map((e) => ({ uid: e.uid, nom: nomCourt(e) })); if (E && E2Invalide()) geste(P.etatNeuf()); dessiner(); }).catch((e) => console.error(e));
  }
  const E2Invalide = () => { const l = lignesEtat.find((x) => x.id === P.LIGNE_ETAT); return !!(l && l._par && eleves.some((e) => e.uid === l._par)); };

  // L'élève écoute la table de SA ville (et la change s'il change de ville).
  function suivreMaVille() {
    const id = E && E.membres ? E.membres[moi.uid] || null : null;
    if (id === maVille) return;
    if (stopVille) { stopVille(); stopVille = null; }
    Object.keys(Lv).forEach((k) => delete Lv[k]);
    maVille = id; mien = null;
    if (!id) return;
    let premier = true;
    stopVille = B.ecouterJeu(chemin, P.tableVille(id), (lignes) => {
      const Lu = P.lireLignes(lignes);
      if (premier) {
        premier = false;
        mien = Lu[moi.uid] ? { ...Lu[moi.uid] } : { uid: moi.uid };
        mien.ville = id; mien.vu = Date.now();
        ecrireMien(true);
      }
      delete Lu[moi.uid];
      Lv[id] = Lu;
      apresChangement();
    }, (e) => console.error(e));
  }

  // Ce que le poste du Seigneur fait tout seul quand la base change : reporter les choix des élèves, poser les notes.
  function apresChangement() {
    if (moi.prof && E) {
      const E2 = P.reporterChoix(E, L());
      if (E2) { geste(E2); return; }
      if (E.phase === 'fin' && !E.notesPosees && !notesEnCours) poserNotes();
    }
    dessiner();
  }
  async function poserNotes() {
    notesEnCours = true;
    const N = P.notesEleves(E);
    try {
      for (const u of Object.keys(N)) await B.poserNote(gid, u, ctx.meta.id, { score: N[u].note, max: 20 });
      await geste({ ...clone(E), notesPosees: true });
    } catch (e) { console.error(e); signaler('Les notes n’ont pas pu être posées dans le suivi de classe.'); }
    notesEnCours = false;
  }

  // Présence de l'élève : renouvelée tant que l'écran est ouvert.
  if (!moi.prof) minuteries.push(setInterval(() => { if (mien) { mien.vu = Date.now(); ecrireMien(true); } }, PRESENCE_TOUS_LES));
  // Une présence vieillit, le compte à rebours tourne : on redessine sans attendre la base.
  minuteries.push(setInterval(() => majChronos(), 500));
  minuteries.push(setInterval(() => dessiner(), 30000));

  // --------------------------------------------------------------------------------------------- contexte
  function contexte(id) {
    const now = Date.now(); const Ld = L();
    const C = { E, L: Ld, moi, now, id, ui, eleves, derniere: null, tit: null, dr: null, rendu: false, peut: () => false };
    if (moi.prof) { const p = [...photos].sort((a, b) => (a.id < b.id ? 1 : -1))[0]; C.derniere = p ? p.lib : null; }
    if (E && id && E.partie && ['tour', 'carte', 'resolu'].includes(E.phase)) {
      C.tit = P.titulaires(E, Ld, id, now);
      C.dr = P.brouillon(E, Ld, id, C.tit);
      C.rendu = E.phase !== 'tour' || P.aRendu(E, Ld, id);
      C.peut = (r) => !moi.prof && E.phase === 'tour' && !C.rendu && C.tit.role[r] === moi.uid;
    }
    return C;
  }
  const villeEleve = () => (E && E.membres ? E.membres[moi.uid] || null : null);

  // ----------------------------------------------------------------------------------------------- dessin
  function dessiner() {
    if (demande) return;
    demande = true;
    requestAnimationFrame(() => { demande = false; peindre(); });
  }
  function peindre() {
    if (!etatLu) { ecran.innerHTML = '<p class="attente">Ouverture de la partie…</p>'; return; }
    // Ce qui est en cours de saisie survit au redessin (une écriture d'un camarade ne vide pas ma case).
    const a = document.activeElement;
    const garde = a && racine.contains(a) && a.id ? { id: a.id, val: a.value, sel: (() => { try { return a.selectionStart; } catch (e) { return null; } })() } : null;
    const enSaisie = garde && (a.tagName === 'INPUT' && (a.type === 'text' || a.type === 'number')) && a.id !== 'calc-ecran';
    const id = moi.prof ? (P.IDS.includes(ui.vue) ? ui.vue : null) : villeEleve();
    const C = contexte(id);
    // L'onglet suit le rôle : quand je reçois mes rôles, j'arrive sur le premier.
    if (!moi.prof && C.tit) {
      const mes = C.tit.rolesDe(moi.uid).join('');
      if (mes && mes !== ui.rolesVus) { ui.onglet = mes[0]; }
      ui.rolesVus = mes;
    }
    if (moi.prof) {
      const b = (v, t) => `<button type="button" data-vue="${v}" aria-pressed="${ui.vue === v}">${t}</button>`;
      nav.innerHTML = `<span class="etiq">Écran</span>${b('seigneur', 'Le Seigneur (toi)')}${b('tableau', 'Tableau projeté')}${E && E.villes ? E.villes.map((v) => b(v.id, `Voir ${ech(v.nom)}`)).join('') : ''}`;
    }
    ecran.classList.toggle('projo', ui.vue === 'tableau');
    ecran.classList.toggle('jeu', ui.vue !== 'tableau');
    let h;
    if (!moi.prof) h = ecranEleve(C);
    else if (ui.vue === 'tableau') h = ecranTableau(C);
    else if (id && E && E.partie) h = `<p class="note">Tu regardes l’écran de ${ech(P.villeDe(E, id).nom)} tel que ses élèves le voient (sans pouvoir y écrire).</p>${ecranVilleJeu(C)}`;
    else h = ecranSeigneur(C);
    ecran.innerHTML = h;
    // Calculatrice : visible si le Seigneur l'autorise (lui la voit toujours).
    const bc = racine.querySelector('#calc-ouvrir');
    const calcOk = moi.prof || !E || E.reglages.calc;
    bc.hidden = !calcOk; if (!calcOk) { racine.querySelector('#calc').hidden = true; bc.setAttribute('aria-expanded', 'false'); }
    majChronos();
    if (garde) {
      const x = document.getElementById(garde.id);
      if (x && racine.contains(x)) {
        if (enSaisie && x.value !== garde.val) x.value = garde.val;
        if (!x.disabled) { x.focus({ preventScroll: true }); try { if (garde.sel !== null && x.setSelectionRange) x.setSelectionRange(garde.sel, garde.sel); } catch (e) { /* champ nombre */ } }
      }
    }
  }
  function majChronos() {
    if (!E || !E.chrono) return;
    const ms = P.restant(E);
    racine.querySelectorAll('[data-chrono]').forEach((el) => {
      const b = el.querySelector('b'); if (b) b.textContent = mmss(ms);
      el.classList.toggle('urgent', ms <= 60000 && ms > 0);
      el.classList.toggle('fini', ms === 0 && E.phase === 'tour');
      const t = el.querySelector('span');
      if (t) t.textContent = E.phase !== 'tour' ? 'saison close' : ms === 0 ? 'temps écoulé' : E.chrono.fin ? 'pour rendre les registres' : E.chrono.restant >= E.reglages.minutes * 60000 ? 'à lancer' : 'en pause';
    });
  }

  // ------------------------------------------------------------------------------------- gestes de l'élève
  // Modifier le brouillon de la ville : seulement les cases de MES rôles, recopiées dans ma ligne.
  function modifier(role, f) {
    const id = villeEleve(); if (!id || !mien) return;
    const C = contexte(id);
    if (!C.dr || !C.peut(role)) return;
    const dr = clone(C.dr);
    f(dr, C);
    const t = P.tour(E); const now = Date.now();
    mien.parts = mien.parts || {};
    C.tit.rolesDe(moi.uid).forEach((r) => { mien.parts[r] = P.partEcrite(r, dr, t, now); });
    ecrireMien();
    dessiner();
  }
  function prendre(i) {
    const id = villeEleve(); const C = contexte(id); if (!C.tit || !mien) return;
    mien.claim = { tour: P.tour(E), n: C.tit.n, lot: i, t: Date.now() }; mien.lache = null;
    ecrireMien(true); dessiner();
  }
  function lacher(i) {
    const id = villeEleve(); const C = contexte(id); if (!C.tit || !mien) return;
    const A = E.attrib && E.attrib[id];
    mien.lache = { tour: P.tour(E), n: C.tit.n, lot: i, k: A ? A.k : 0 }; mien.claim = null;
    ecrireMien(true); dessiner();
  }
  function deposer() {
    const id = villeEleve(); const C = contexte(id);
    if (!C.peut('B') || P.erreurs(E.partie, id, C.dr).length) return;
    mien.depot = { tour: P.tour(E), t: Date.now(), o: (E.ouv && E.ouv[id]) || 0, d: P.decisionsDe(C.dr), places: C.dr.places };
    ecrireMien(true); dessiner();
  }
  function validerVille() {
    const B0 = ui.choixVille; const nommer = E.reglages.nommage === 'eleves';
    if (nommer && !String(B0.nom || '').trim()) { ui.msgVille = 'Écris le nom de la ville (ou tire-le).'; dessiner(); return; }
    if (B0.fig === null || B0.fig === undefined) { ui.msgVille = 'Choisis une figure pour le blason.'; dessiner(); return; }
    mien.choix = { t: Date.now(), nom: nommer ? String(B0.nom).trim().slice(0, 28) : null, fig: B0.fig, teinte: B0.teinte };
    ui.msgVille = 'Envoyé au Seigneur.';
    ecrireMien(true); dessiner();
  }

  // ---------------------------------------------------------------------------------- gestes du Seigneur
  const maintenant = () => Date.now();
  const titDe = (id) => P.titulaires(E, L(), id, maintenant());
  function deplacerEleve(uid, id) {
    const E2 = P.deplacer(E, uid, id || null);
    const e = eleves.find((x) => x.uid === uid); if (e) E2.noms[uid] = e.nom;
    geste(E2, 'élève déplacé');
  }
  function former(mode) { geste(P.formerVilles(E, eleves, mode), mode === 'hasard' ? 'villes tirées' : 'villes à faire à la main'); }

  // ---------------------------------------------------------------------------------------------- événements
  function surClic(ev) {
    const b = ev.target.closest('button');
    // Le plateau : une case où bâtir, ou un bâtiment à ouvrir.
    if (!b) {
      const pl = ev.target.closest('[data-place]');
      if (pl && ui.placer) {
        const k = ui.placer; ui.placer = null;
        modifier('O', (dr) => { dr.chantiers.push(k); dr.places.push(pl.dataset.place.split(',').map(Number)); });
        dessiner(); return;
      }
      const c = ev.target.closest('[data-case]');
      if (c) { ui.fiche = c.dataset.case; peindre(); const f = racine.querySelector('#fermer-fiche'); if (f) f.focus(); return; }
      if (ev.target.matches('[data-fermer-fond]')) { ui.fiche = null; dessiner(); }
      return;
    }
    if (b.disabled) return;
    const d = b.dataset; const id = b.id;
    // Calculatrice
    const ecr = racine.querySelector('#calc-ecran'); const hist = racine.querySelector('#calc-hist');
    const ouvrirCalc = (o) => { racine.querySelector('#calc').hidden = !o; racine.querySelector('#calc-ouvrir').setAttribute('aria-expanded', String(o)); if (o) ecr.focus(); };
    if (id === 'calc-ouvrir') return ouvrirCalc(racine.querySelector('#calc').hidden);
    if (id === 'calc-fermer') return ouvrirCalc(false);
    if (d.calc !== undefined) return ouvrirCalc(true);
    if (id === 'calc-haut') { try { const r = Math.ceil(calculer(ecr.value || '0')); hist.textContent = `arrondi au-dessus de ${ecr.value}`; ecr.value = enFr(r); } catch (e) { hist.textContent = 'Calcul impossible'; } return; }
    if (d.touche) {
      const k = d.touche;
      if (k === 'C') { ecr.value = ''; hist.innerHTML = '&nbsp;'; } else if (k === '⌫') ecr.value = ecr.value.slice(0, -1);
      else if (k === '=') { try { const r = calculer(ecr.value); hist.textContent = `${ecr.value} =`; ecr.value = enFr(r); } catch (e) { hist.textContent = `Calcul impossible : ${e.message}`; } } else ecr.value += k;
      return;
    }
    // Navigation (les deux postes)
    if (d.vue) { ui.vue = d.vue; ui.fiche = null; ui.placer = null; return dessiner(); }
    if (d.voir) { ui.vue = d.voir; ui.fiche = null; return dessiner(); }
    if (d.onglet) { ui.onglet = d.onglet; return dessiner(); }
    if (d.aideRes) { ui.aideRes = ui.aideRes === d.aideRes ? null : d.aideRes; return dessiner(); }
    if (id === 'fermer-fiche') { ui.fiche = null; return dessiner(); }
    if (id === 'annuler-placer') { ui.placer = null; return dessiner(); }
    if (!E) return;

    if (!moi.prof) {
      if (d.prendre !== undefined) return prendre(Number(d.prendre));
      if (d.lacher !== undefined) return lacher(Number(d.lacher));
      if (id === 'tirernom') { ui.choixVille.nom = P.tirerNoms(1, E.villes.map((v) => v.nom))[0]; return dessiner(); }
      if (d.fig !== undefined) { ui.choixVille.fig = Number(d.fig); return dessiner(); }
      if (d.teinte) { ui.choixVille.teinte = d.teinte; return dessiner(); }
      if (id === 'validerville') return validerVille();
      if (d.eq) return modifier('I', (dr) => { dr.equipes[d.eq] = Math.max(0, (dr.equipes[d.eq] || 0) + Number(d.pas)); });
      if (d.ajoutOp) {
        modifier('M', (dr) => { dr.ops.push({ id: `o${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`, sens: d.ajoutOp, m: d.m || 'grain', q: '', ch: '', montant: '', recu: '' }); });
        setTimeout(() => { const n = racine.querySelectorAll('[id^="q"]'); const x = n[n.length - 1]; if (x) { x.focus(); x.scrollIntoView({ block: 'center' }); } }, 50);
        return;
      }
      if (d.retirerOp !== undefined) return modifier('M', (dr) => { dr.ops.splice(Number(d.retirerOp), 1); });
      if (d.bat) {
        if (d.bat === 'nef') return modifier('O', (dr) => { const ch = (E.plans[villeEleve()] || []).find((p) => p.k === 'choeur'); dr.chantiers.push('nef'); dr.places.push(ch ? [ch.x, ch.y] : null); });
        ui.placer = d.bat; ui.fiche = null; dessiner();
        setTimeout(() => { const p = racine.querySelector('.plateau'); if (p) p.scrollIntoView({ block: 'center' }); }, 50);
        return;
      }
      if (d.debat) return modifier('O', (dr) => { const i = dr.chantiers.lastIndexOf(d.debat); if (i >= 0) { dr.chantiers.splice(i, 1); dr.places.splice(i, 1); } });
      if (d.cible) return modifier('B', (dr) => { if (dr.coup) dr.coup.cible = d.cible; });
      if (d.butin) return modifier('B', (dr) => { if (dr.coup) dr.coup.butin = d.butin; });
      if (id === 'deposer') return deposer();
      return;
    }

    // Le Seigneur
    const now = maintenant();
    if (id === 'annuler') return revenir();
    if (id === 'hasard') return former('hasard');
    if (id === 'main') return former('main');
    if (d.de) { const v = P.villeDe(E, d.de); return geste(P.nommer(E, d.de, P.tirerNoms(1, E.villes.map((x) => x.nom))[0]), `nom de ${v ? v.nom : 'la ville'}`); }
    if (id === 'pretes') return geste(P.villesPretes(E), 'villes prêtes');
    if (d.presence) return geste(P.marquerPresence(E, d.presence, d.valeur === '1'), `présence de ${E.noms[d.presence] || 'un élève'}`);
    if (d.rouvrir) return geste(P.rouvrir(E, d.rouvrir), 'registre rouvert');
    if (d.tirerbl) return geste(P.poserBlason(E, d.tirerbl, { fig: Math.floor(Math.random() * FIGURES.length), teinte: TEINTES[Math.floor(Math.random() * TEINTES.length)].id }), 'blason tiré');
    if (['lancer', 'pause', 'plus1', 'remise'].includes(id)) return geste(P.chrono(E, id, now));
    if (id === 'ouvrir') { if (P.manquesOuverture(E, L(), now).length) return; return geste(P.ouvrirTour(E, L(), now), 'tour ouvert'); }
    if (id === 'forcer') return geste(P.forcerRendu(E, L(), now), 'rendu forcé');
    if (id === 'clore') return geste(P.clore(E, L(), now), 'registres clos');
    if (id === 'resoudre') return geste(P.resoudre(E, L(), now), 'saison résolue');
    if (id === 'suivant') return geste(P.suivant(E), E.partie.tour === R.DERNIER_TOUR ? 'partie terminée' : 'saison suivante');
  }

  function surChangement(ev) {
    const x = ev.target; const id = x.id || ''; const d = x.dataset || {};
    if (id === 'calc-ecran') return;
    if (!E) return;
    if (!moi.prof) {
      if (id === 'nomville') { ui.choixVille.nom = x.value; return; }
      if (id === 'reserve') return modifier('I', (dr) => { dr.reserve = x.checked; });
      if (id === 'coup') return modifier('B', (dr) => { dr.coup = x.checked ? { cible: '', butin: '' } : null; });
      if (['besoin', 'grenier', 'halle', 'caisse'].includes(id)) return modifier(ROLE_DU_CHAMP[id], (dr) => { dr.reg[id] = x.value; });
      const m = id.match(/^(q|ch|mt|recu)(\d+)$/);
      if (m) {
        const champ = { q: 'q', ch: 'ch', mt: 'montant', recu: 'recu' }[m[1]];
        return modifier(ROLE_DU_CHAMP[m[1]], (dr) => { const o = dr.ops[Number(m[2])]; if (o) o[champ] = x.value; });
      }
      return;
    }
    if (id === 'nbv') {
      const E2 = P.regler(E, { nbVilles: Number(x.value) });
      return geste(E.mode ? P.formerVilles(E2, eleves, E.mode) : E2, 'nombre de villes');
    }
    if (id === 'nommage') return geste(E.villes.length ? P.renommerNommage(E, x.value) : P.regler(E, { nommage: x.value }), 'nom des villes');
    if (id === 'rot') return geste(P.regler(E, { rotation: x.checked }), 'changement de rôle');
    if (id === 'opt-aide') return geste(P.regler(E, { aide: x.checked }));
    if (id === 'opt-calc') return geste(P.regler(E, { calc: x.checked }));
    if (id === 'minutes') return geste(P.regler(E, { minutes: Math.max(1, Math.min(60, Number(x.value) || 12)) }));
    if (d.ville !== undefined) return deplacerEleve(d.ville, x.value);
    if (d.nom || d.renom) { const v = d.nom || d.renom; if (String(x.value).trim()) return geste(P.nommer(E, v, x.value), 'ville renommée'); return; }
    if (d.reattr) { const [v, i] = d.reattr.split('|'); return geste(P.reattribuer(E, L(), v, Number(i), x.value || null, titDe(v)), 'rôle réattribué'); }
    const vide = x.name && x.name.match(/^vide-([A-E])$/);
    if (vide) return geste(P.choisirVide(E, vide[1], x.value), 'ville sans présent');
  }

  function surTouche(ev) {
    if (ev.key === 'Escape' && (ui.fiche || ui.placer)) { ui.fiche = null; ui.placer = null; dessiner(); return; }
    if (ev.target.id === 'calc-ecran' && ev.key === 'Enter') {
      ev.preventDefault();
      const ecr = ev.target; const hist = racine.querySelector('#calc-hist');
      try { const r = calculer(ecr.value); hist.textContent = `${ecr.value} =`; ecr.value = enFr(r); } catch (e) { hist.textContent = `Calcul impossible : ${e.message}`; }
      return;
    }
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const pl = ev.target.closest && ev.target.closest('[data-place]');
    const c = ev.target.closest && ev.target.closest('[data-case]');
    if ((pl && ui.placer) || c) { ev.preventDefault(); ev.target.closest('[data-place],[data-case]').dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  }
  const surBascule = (ev) => { const t = ev.target; if (t.id && t.id.startsWith('m-')) ui.ouvert[t.id] = t.open; };

  racine.addEventListener('click', surClic);
  racine.addEventListener('change', surChangement);
  racine.addEventListener('keydown', surTouche);
  racine.addEventListener('toggle', surBascule, true);

  dessiner();

  // ---------------------------------------------------------------------------------------------- sortie
  ctx.surSortie(() => {
    minuteries.forEach(clearInterval);
    clearTimeout(minuteurMien);
    if (mien && maVille) poser(P.tableVille(maVille), moi.uid, { json: JSON.stringify(mien) });
    arrets.forEach((s) => { try { s(); } catch (e) { /* déjà arrêtée */ } });
    if (stopVille) stopVille();
  });
}
