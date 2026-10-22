// Le TERMINAL VOCAL — un panneau qui DIT une phrase à la fois et attend une réponse tapée au clavier.
//
// Écrit le 11/10/2026 (chantier D-6, lot 2, demande au moteur du brief `docs/briefs/ENT-6.6-france-boissons-inventaire.md`
// §7.2), d'après la maquette validée de 6.7 (`docs/briefs/france-boissons/maquette-6.7-preparation-vocale.html`) : boîtier
// sombre, écran, champ de réponse, « Valider », « Répète ». Commun à l'inventaire (ENT-6.6, sous-mode comptage du stockage
// de masse) et à la préparation vocale (ENT-6.7, chantier D-7) : rien ici ne connaît les fûts ni les couloirs.
// La vue hôte lui donne ses LIGNES, déjà rédigées :
//
//   { id: 'M04', lieu: 'Couloir M04.', code: '63', question: 'Pelforth Blonde fût 20 L. Lot S19. Combien de fûts ?' }
//
// Le dialogue d'une ligne : « <lieu> Code de contrôle ? » → le code (faux : « Code faux. … », redemandé, compté) →
// « <question> » → un nombre → « Compris : n. » → la ligne suivante. L'ordre est IMPOSÉ, pas de retour sur une ligne validée ;
// une case vide ne fait rien (0 est une réponse, rien n'en est pas une). Après la dernière ligne : `textes.fin`.
// Le terminal ne juge RIEN : il range les réponses ; les jalons de la vue hôte les comparent à ce qui est vrai.
// Le texte est TOUJOURS affiché. Le SON (lot 3) : réglage de l'enseignant seul, par groupe (« Conduite de séance », coupé par
// défaut, `ctx.sonTerminal`) ; l'élève peut le couper pour lui, jamais l'activer. Voix = synthèse du navigateur, voix installées
// sur le poste seulement (`localService`, langue fr) : aucune requête réseau. Pas de voix → texte seul, sans message.
//
// LA PRÉPARATION (chantier D-7, lot 1, 12/10/2026 ; brief ENT-6.7 §4 étape 1 et §7.1). Une ligne qui déclare `prends` est une
// ligne de préparation ; les autres champs sont facultatifs :
//
//   { id: 'L3', lieu: 'Côté A, travée 03, niveau 1.', code: '49', question: 'Affligem Blonde, vingt litres, lot S18. Prends 2.',
//     prends: 2, pose: 'Pose tes fûts.',
//     remplacement: { id: 'L4', lieu: 'Côté B, travée 03, niveau 1.', code: '83', question: (n) => `Affligem Blonde, … lot S24. Prends ${n}.`,
//                     pose: '…' } }
//
// - La quantité tapée doit être EXACTEMENT ce qui reste à prendre : moins → « Tu dois prendre n. Si tu ne peux pas, dis … »
//   (les mots déclarés), plus → « Trop. Prends n. » ; les deux sont refusés et tracés en rouge. La quantité juste est acceptée
//   quoi que l'élève ait pris (le terminal ne voit pas le fût cabossé : c'est le piège de la séance).
// - Les MOTS (`creerTerminal({ mots })`, déclarés par la vue hôte) : `{ id, lib, combien }`. Pendant la question d'une ligne de
//   préparation, et une seule fois par ligne. `combien: true` → « <Mot> : combien ? » (de 1 à ce qui reste) → « Compris : 1
//   abîmé. » puis « Prends <reste>. » ; sans `combien` (Emplacement vide) → toute la ligne est signalée, « Compris : emplacement
//   vide. », la ligne passe (0 pris). « Répète » n'est pas un mot : il redit la phrase sans rien écrire.
// - Toute exception sur une ligne qui déclare `remplacement` AJOUTE cette ligne juste après, avec `prends` = la quantité
//   signalée ; sa `question` peut être une fonction de cette quantité. Rien n'est rangé que l'exception : la liste des lignes
//   se recalcule (`lignesDuTerminal`).
// - `pose` : après une quantité acceptée (non nulle), le terminal dit cette phrase et ATTEND : le champ se ferme jusqu'à ce que
//   la vue hôte appelle `poser()` (la marchandise est posée) ; alors seulement la ligne suivante. Une fonction reçoit la
//   quantité prise (« Pose ton fût. » / « Pose tes 2 fûts. », lot 4).
// - « Ce que le terminal sait de toi » : `bilanTerminal` (lignes, durée, codes faux, lignes par heure), non noté.
//
// LE NOM ET LE MODE « SCANNER » (chantier E-7, lot 2, 22/10/2026, palettier à adresse donnée ; `entrepot-palettier.js`) :
// - `creerTerminal({ nom: 'Terminal' })` remplace « TERMINAL VOCAL » (en-tête et étiquette d'accessibilité) ; avec un nom, la mention
//   « sans son » ne s'affiche pas (ce terminal n'a pas de voix). Absent = « TERMINAL VOCAL », comme avant.
// - `creerTerminal({ nom, mode: 'scanner' })` : le MÊME boîtier sans champ à taper ni ordre de lignes. Il montre la PHRASE EN COURS
//   (« Scanne la palette. », puis « P1 — Lessive liquide 3 L. Scanne l'emplacement. ») et le JOURNAL des 5 dernières lignes, que la VUE
//   alimente : `TERM.dire(T, ligne, { refus })` (un refus est en texte rouge, sans aplat) et `TERM.attendre(T, phrase)` (la ligne
//   d'attente : le comptage du lot 4 s'en servira pour attendre le scan d'une adresse, comme `poser()` attend la pose). État :
//   `terminalScannerNeuf()` = { journal: [{ q: 't', x, ko?, h }], attente }, rangé par la vue hôte.
// - LA SAISIE EN MODE « SCANNER » (lot 4, 22/10/2026, le comptage du palettier) : `TERM.attendre(T, phrase, { saisie: true })` ouvre
//   le CHAMP À CHIFFRES du boîtier (avec « Valider ») ; `{ choix: [['recompter', 'Recompter'], ['confirmer', 'Confirmer']] }` pose des
//   boutons sous l'écran (le champ se ferme si `saisie` est absent). Les deux sont rangés dans l'état (`T.saisie`, `T.choix`) et
//   ABSENTS par défaut : sans eux, le boîtier du lot 2 (ni champ ni bouton). La vue reçoit ce que l'élève fait par
//   `TERM.brancher(racine, T, { saisir(texte), choisir(id), focus })` (`focus` : le champ, ou le premier bouton, prend le focus) ;
//   le terminal ne juge rien. `TERM.dire(T, texte, { eleve: true })` écrit une ligne de l'élève (« › 33 ») dans le journal.
//
// L'état, rangé par la vue hôte dans la base de l'élève (cloisonné par séance) :
//   { i: n° de la ligne en cours, phase: 'code' | 'reponse' | 'combien' | 'pose', reponses: { M01: 15 }, codesFaux: { M01: 2 },
//     exceptions: { L3: { mot: 'abime', n: 1 } }, mot: { id, lib } (pendant « combien ? »),
//     journal: [{ q: 't' | 'e', x: texte, ko?: 1, h: date }], debut, fin }
// `journal` : ce qui s'est dit, horodaté (le terminal dit `t`, l'élève `e`). `reponses` : le nombre tapé (la quantité PRISE).

import { ech } from '../texte.js';

export const terminalNeuf = () => ({ i: 0, phase: 'code', reponses: {}, codesFaux: {}, journal: [], debut: null, fin: null });
export const terminalScannerNeuf = () => ({ journal: [], attente: '' });
const JOURNAL_MAX = 300;
const minus = (s) => String(s).charAt(0).toLowerCase() + String(s).slice(1);
const TEXTES = {
  code: 'Code de contrôle ?',
  codeFaux: 'Code faux. Vérifie le lieu.',
  chiffres: 'Je n’ai pas compris. Réponds avec des chiffres.',
  compris: (n) => `Compris : ${n}.`,
  fin: 'Terminé.',
  moins: (n, libs) => `Tu dois prendre ${n}.${libs.length ? ` Si tu ne peux pas, dis ${libs.slice(0, -1).join(', ')}${libs.length > 1 ? ' ou ' : ''}${libs[libs.length - 1]}.` : ''}`,
  trop: (n) => `Trop. Prends ${n}.`,
  prends: (n) => `Prends ${n}.`,
  combien: (lib) => `${lib} : combien ?`,
  entre: (max) => (max > 1 ? `Réponds un nombre de 1 à ${max}.` : 'Réponds 1.'),
  comprisMot: (n, lib, combien) => (combien ? `Compris : ${n} ${minus(lib)}.` : `Compris : ${minus(lib)}.`),
};

// Les lignes telles que le terminal les donne : celles de la vue hôte, plus chaque ligne de remplacement d'une ligne signalée
// (juste après elle, `prends` = la quantité signalée). Calculée, jamais rangée.
export function lignesDuTerminal(lignes, T) {
  const ex = (T && T.exceptions) || {};
  const out = [];
  lignes.forEach((l) => {
    out.push(l);
    if (!l.remplacement || !ex[l.id]) return;
    const R = l.remplacement, n = ex[l.id].n;
    out.push(Object.assign({ id: `${l.id}-r` }, R, { prends: n, remplace: l.id,
      question: typeof R.question === 'function' ? R.question(n) : R.question }));
  });
  return out;
}

// Ce qui reste à prendre sur une ligne de préparation (la quantité demandée moins ce qui a été signalé).
const reste = (T, l) => l.prends - (((T.exceptions || {})[l.id] || {}).n || 0);

// Parmi les voix du navigateur, une voix française installée sur le poste (jamais une voix qui passe par le réseau), ou null.
export function choisirVoix(voix) {
  const l = Array.from(voix || []).filter((v) => v && v.localService === true && /^fr([-_]|$)/i.test(v.lang || ''));
  return l.find((v) => /^fr[-_]fr$/i.test(v.lang)) || l[0] || null;
}

// Ce que le terminal DIT après une réponse : ses phrases depuis la dernière réponse de l'élève (« Compris : 15. », un refus),
// puis la phrase qu'il attend maintenant. Sans réponse encore (ou « Répète ») : la phrase en cours seule.
export function texteParle(T, lignes, textes = {}) {
  let k = T.journal.length;
  while (k > 0 && T.journal[k - 1].q !== 'e') k--;
  const dits = k > 0 ? T.journal.slice(k).filter((j) => j.q === 't').map((j) => j.x) : [];
  dits.push(phraseTerminal(T, lignes, textes));
  return dits.join(' ');
}

// La phrase que le terminal dit maintenant (celle qu'on attend de l'élève), ou la phrase de fin.
export function phraseTerminal(T, lignes, textes = {}) {
  const X = Object.assign({}, TEXTES, textes);
  const L = lignesDuTerminal(lignes, T);
  if (T.fin || T.i >= L.length) return X.fin;
  const l = L[T.i];
  if (T.phase === 'code') return `${l.lieu} ${X.code}`;
  if (T.phase === 'combien') return X.combien((T.mot || {}).lib || '');
  if (T.phase === 'pose') return (typeof l.pose === 'function' ? l.pose(T.reponses[l.id]) : l.pose) || '';
  return (T.exceptions || {})[l.id] ? X.prends(reste(T, l)) : l.question;
}

// Passe à la ligne suivante (ou finit) : 'reponse' ou 'fin'.
function avancer(T, lignes, h) {
  T.i += 1; T.phase = 'code';
  if (T.i >= lignesDuTerminal(lignes, T).length) { T.fin = h; return 'fin'; }
  return 'reponse';
}
const dire = (T, h) => (q, x, ko) => { T.journal.push(ko ? { q, x, ko: 1, h } : { q, x, h }); };
const borner = (T) => { if (T.journal.length > JOURNAL_MAX) T.journal.splice(0, T.journal.length - JOURNAL_MAX); };

// L'élève répond `saisie`. Change l'état (pur, sans navigateur : les tests l'appellent aussi) et rend ce qui s'est passé :
// null (rien : case vide, terminal fini ou en attente de la pose), 'chiffres', 'codeFaux', 'code', 'refus' (quantité refusée),
// 'exception' (« combien ? » répondu), 'pris' (quantité acceptée, la pose est attendue), 'reponse' (une ligne finie) ou 'fin'.
// `mots` : ceux du terminal (leurs libellés servent au refus « Si tu ne peux pas, dis … »).
export function repondreTerminal(T, lignes, saisie, textes = {}, h = Date.now(), mots = []) {
  const X = Object.assign({}, TEXTES, textes);
  const v = String(saisie == null ? '' : saisie).replace(/\s+/g, '');
  const L = lignesDuTerminal(lignes, T);
  if (!v || T.fin || T.i >= L.length || T.phase === 'pose') return null;
  const l = L[T.i];
  if (!T.debut) T.debut = h;
  const dit = dire(T, h);
  dit('t', phraseTerminal(T, lignes, textes));
  dit('e', v);
  let evt;
  if (!/^\d{1,4}$/.test(v)) { dit('t', X.chiffres, true); evt = 'chiffres'; }
  else if (T.phase === 'code') {
    if (v === String(l.code)) { T.phase = 'reponse'; evt = 'code'; }
    else { T.codesFaux[l.id] = (T.codesFaux[l.id] || 0) + 1; dit('t', X.codeFaux, true); evt = 'codeFaux'; }
  } else if (T.phase === 'combien') {
    const n = Number(v), max = reste(T, l);
    if (n < 1 || n > max) { dit('t', X.entre(max), true); evt = 'refus'; }
    else {
      const m = T.mot;
      T.exceptions = Object.assign({}, T.exceptions, { [l.id]: { mot: m.id, n } });
      delete T.mot;
      dit('t', X.comprisMot(n, m.lib, true));
      if (reste(T, l) > 0) { T.phase = 'reponse'; evt = 'exception'; }
      else { T.reponses[l.id] = 0; evt = avancer(T, lignes, h); }
    }
  } else if (l.prends != null) {
    const n = Number(v), r = reste(T, l);
    if (n < r) { dit('t', X.moins(r, mots.map((m) => m.lib)), true); evt = 'refus'; }
    else if (n > r) { dit('t', X.trop(r), true); evt = 'refus'; }
    else {
      T.reponses[l.id] = n;
      dit('t', X.compris(n));
      if (l.pose && n > 0) { T.phase = 'pose'; evt = 'pris'; }
      else evt = avancer(T, lignes, h);
    }
  } else {
    const n = Number(v);
    T.reponses[l.id] = n;
    dit('t', X.compris(n));
    evt = avancer(T, lignes, h);
  }
  borner(T);
  return evt;
}

// Mode « scanner » : la vue DIT une ligne (écrite dans le journal, un refus en rouge) ou change la phrase qu'on attend.
// `eleve: true` (lot 4) : la ligne est ce que l'élève a tapé ou choisi (« › 33 »).
export function direTerminal(T, texte, { refus = false, eleve = false } = {}, h = Date.now()) {
  const q = eleve ? 'e' : 't';
  T.journal.push(refus ? { q, x: String(texte), ko: 1, h } : { q, x: String(texte), h });
  borner(T);
}
// `saisie` (le champ à chiffres) et `choix` ([[id, libellé], …], des boutons) : lot 4, absents par défaut (rien n'est écrit dans l'état).
export function attendreTerminal(T, phrase, { saisie = false, choix = null } = {}) {
  T.attente = String(phrase == null ? '' : phrase);
  if (saisie) T.saisie = true; else delete T.saisie;
  if (Array.isArray(choix) && choix.length) T.choix = choix.map(([id, lib]) => [String(id), String(lib)]); else delete T.choix;
}

// Peut-on dire un mot maintenant ? (pendant la question d'une ligne de préparation, une seule fois par ligne)
export function motPossible(T, lignes) {
  const L = lignesDuTerminal(lignes, T);
  if (T.fin || T.i >= L.length || T.phase !== 'reponse') return false;
  const l = L[T.i];
  return l.prends != null && !(T.exceptions || {})[l.id];
}

// L'élève dit le mot `m` ({ id, lib, combien }). Rend null (impossible maintenant : rien n'est écrit), 'mot' (« combien ? »
// attendu), ou, pour un mot sans « combien » (toute la ligne signalée), 'reponse' / 'fin'.
export function motTerminal(T, lignes, m, textes = {}, h = Date.now()) {
  if (!m || !motPossible(T, lignes)) return null;
  const X = Object.assign({}, TEXTES, textes);
  const l = lignesDuTerminal(lignes, T)[T.i];
  if (!T.debut) T.debut = h;
  const dit = dire(T, h);
  dit('t', phraseTerminal(T, lignes, textes));
  dit('e', m.lib);
  let evt;
  if (m.combien) { T.phase = 'combien'; T.mot = { id: m.id, lib: m.lib }; evt = 'mot'; }
  else {
    T.exceptions = Object.assign({}, T.exceptions, { [l.id]: { mot: m.id, n: l.prends } });
    T.reponses[l.id] = 0;
    dit('t', X.comprisMot(l.prends, m.lib, false));
    evt = avancer(T, lignes, h);
  }
  borner(T);
  return evt;
}

// La vue hôte dit que la marchandise de la ligne en cours est posée : la ligne suivante (ou la fin). Rend null si le terminal
// n'attendait pas de pose, sinon 'reponse' / 'fin'.
export function poseTerminal(T, lignes, h = Date.now()) {
  if (T.fin || T.phase !== 'pose') return null;
  return avancer(T, lignes, h);
}

// « Ce que le terminal sait de toi » (brief ENT-6.7, décision 46), non noté : lignes finies, durée (ms, du premier geste à la
// fin ou à la dernière phrase), codes faux, lignes par heure (arrondi ; null sous une minute ou sans ligne).
export function bilanTerminal(T, lignes) {
  const L = lignesDuTerminal(lignes, T);
  const faites = Math.min(T.fin ? L.length : T.i, L.length);
  const dernier = T.journal.length ? T.journal[T.journal.length - 1].h : null;
  const duree = T.debut ? Math.max(0, (T.fin || dernier || T.debut) - T.debut) : 0;
  const codesFaux = Object.values(T.codesFaux || {}).reduce((s, n) => s + n, 0);
  const parHeure = faites && duree >= 60000 ? Math.round(faites / (duree / 3600000)) : null;
  return { lignes: faites, duree, codesFaux, parHeure };
}

// Le bilan en HTML (écran de la vue hôte, pas le boîtier : teintes du thème). `phrase` : la phrase de la séance, à la fin.
export function htmlBilanTerminal(B, phrase = '') {
  const min = Math.floor(B.duree / 60000), s = Math.round((B.duree % 60000) / 1000);
  const duree = min ? `${min} min ${String(s).padStart(2, '0')} s` : `${s} s`;
  return `<section class="vt-bilan" data-vt-bilan aria-label="Ce que le terminal sait de toi">
    <h3>Ce que le terminal sait de toi</h3>
    <ul>
      <li>Lignes préparées : <b data-vt-b="lignes">${B.lignes}</b></li>
      <li>Durée : <b data-vt-b="duree">${duree}</b></li>
      <li>Codes faux : <b data-vt-b="codes">${B.codesFaux}</b></li>
      <li>Lignes par heure : <b data-vt-b="heure">${B.parHeure == null ? '—' : B.parHeure}</b></li>
    </ul>${phrase ? `<p>${ech(phrase)}</p>` : ''}</section>`;
}

// Le panneau. `lignes`, `textes` : de la vue hôte ; `titre` : la deuxième moitié de l'en-tête (« Inventaire tournant ») ;
// `mots` : les mots d'exception de la préparation ([{ id, lib, combien }], aucun par défaut).
export function creerTerminal({ lignes = [], textes = {}, titre = '', mots = [], nom = '', mode = '' }) {
  const SCAN = mode === 'scanner';
  const NOM = nom ? String(nom).toLocaleUpperCase('fr-FR') : 'TERMINAL VOCAL';
  const ui = { saisie: '', flash: false, focus: false, coupe: false, sonOk: false, focusSon: false };
  const VU = 5;     // les dernières phrases échangées, au-dessus de la phrase en cours
  // Le son : seulement si l'enseignant l'a activé pour le groupe (`ui.sonOk`, relu à chaque dessin) et que l'élève ne l'a pas coupé.
  // Une phrase qui en remplace une autre la coupe. Toute erreur du navigateur est avalée : le texte suffit.
  const parler = (texte) => {
    if (!ui.sonOk || ui.coupe || typeof window === 'undefined') return;
    try {
      const s = window.speechSynthesis;
      if (!s || typeof SpeechSynthesisUtterance !== 'function') return;
      const v = choisirVoix(s.getVoices());
      if (!v) return;
      s.cancel();
      const u = new SpeechSynthesisUtterance(texte);
      u.voice = v; u.lang = v.lang;
      s.speak(u);
    } catch (e) { /* texte seul */ }
  };
  const ligneEnCours = (T) => lignesDuTerminal(lignes, T)[T.i];
  // Le mode « scanner » : la phrase en cours et les 5 dernières lignes, rien à taper (le scan est un clic de la vue hôte).
  // Lot 4 : le champ à chiffres (`T.saisie`) et les boutons de choix (`T.choix`), absents par défaut.
  const htmlScanner = (T) => {
    const passe = (T.journal || []).slice(-VU).map((j) => (j.q === 'e'
      ? `<div class="vt-moi">› ${ech(j.x)}</div>`
      : `<div class="vt-passe${j.ko ? ' vt-ko' : ''}">${ech(j.x)}</div>`)).join('');
    const saisie = T.saisie ? `<form class="vt-saisie" data-vt-form autocomplete="off">
            <input data-vt-champ inputmode="numeric" autocomplete="off" maxlength="6" value="${ech(ui.saisie)}" placeholder="nombre" aria-label="Ta réponse au terminal">
            <button type="submit" class="vt-btn" data-vt-valider>Valider</button></form>` : '';
    const choix = Array.isArray(T.choix) && T.choix.length
      ? `<div class="vt-choix">${T.choix.map(([id, lib]) => `<button type="button" class="vt-btn" data-vt-choix="${ech(id)}">${ech(lib)}</button>`).join('')}</div>` : '';
    return `<div class="vt vt-scan" data-terminal data-vt-mode="scanner">
        <div class="vt-boitier" role="group" aria-label="${ech(nom || 'Terminal')}">
          <div class="vt-tete"><span class="vt-led" aria-hidden="true"></span>${ech(NOM)}${titre ? ` · ${ech(titre)}` : ''}</div>
          <div class="vt-ecran" aria-live="polite">${passe}<div class="vt-actu" data-vt-actu>${ech(T.attente || '')}</div></div>${saisie}${choix}
        </div></div>`;
  };
  // Lot 4 : ce que l'élève tape ou choisit en mode « scanner » va à la vue hôte (`api.saisir`, `api.choisir`) ; elle juge et redessine.
  const brancherScanner = (el, T, api) => {
    const champ = el.querySelector('[data-vt-champ]');
    if (champ) {
      champ.addEventListener('input', () => { ui.saisie = champ.value; });
      el.querySelector('[data-vt-form]').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const v = champ.value;
        ui.saisie = '';
        if (api.saisir) api.saisir(v);
      });
    }
    el.querySelectorAll('[data-vt-choix]').forEach((b) => b.addEventListener('click', () => { if (api.choisir) api.choisir(b.dataset.vtChoix); }));
    if (api.focus) { const c = champ || el.querySelector('[data-vt-choix]'); if (c) c.focus({ preventScroll: true }); }
  };
  return {
    // Mode « scanner » : la vue hôte alimente le journal et la phrase attendue (voir l'en-tête du fichier).
    dire: (T, texte, o) => direTerminal(T, texte, o),
    attendre: (T, phrase, o) => attendreTerminal(T, phrase, o),
    html(T, { estProf = false, son = false } = {}) {
      if (SCAN) return htmlScanner(T);
      ui.sonOk = !!son;
      const fini = !!T.fin;
      const L = lignesDuTerminal(lignes, T);
      const ferme = fini || T.phase === 'pose';
      const passe = T.journal.slice(-VU).map((j) => (j.q === 'e'
        ? `<div class="vt-moi">› ${ech(j.x)}</div>`
        : `<div class="vt-passe${j.ko ? ' vt-ko' : ''}">${ech(j.x)}</div>`)).join('');
      const actu = `<div class="vt-actu${ui.flash ? ' vt-flash' : ''}" data-vt-actu>${ech(phraseTerminal(T, lignes, textes))}</div>`;
      ui.flash = false;
      const att = T.phase === 'code' ? 'code' : T.phase === 'pose' ? '' : 'nombre';
      const faux = Object.entries(T.codesFaux || {});
      const exc = Object.entries(T.exceptions || {});
      const libMot = (id) => (mots.find((m) => m.id === id) || { lib: id }).lib;
      const peutMot = motPossible(T, lignes);
      const prof = !estProf ? '' : `<details class="pe-prof vt-prof" data-vt-prof><summary>Côté enseignant : le terminal</summary>
        <div>Ligne ${Math.min(T.i + 1, L.length)} sur ${L.length}${fini ? ' — terminé' : ''}</div>
        <div>Réponses : ${L.filter((l) => l.id in T.reponses).map((l) => `${ech(l.id)} ${T.reponses[l.id]}`).join(' · ') || 'aucune'}</div>${mots.length
          ? `\n        <div data-vt-exc>Mots : ${exc.length ? exc.map(([id, x]) => `${ech(id)} ${ech(libMot(x.mot))} ${x.n}`).join(' · ') : 'aucun'}</div>` : ''}
        <div data-vt-faux>Codes faux (trace, non notée) : ${faux.length ? faux.map(([id, n]) => `${ech(id)} ×${n}`).join(' · ') : 'aucun'}</div></details>`;
      const boutonsMots = mots.map((m) => `<button type="button" class="vt-btn" data-vt-mot="${ech(m.id)}" ${peutMot ? '' : 'disabled'}>${ech(m.lib)}</button>`).join('');
      return `<div class="vt" data-terminal data-vt-ligne="${T.i}" data-vt-phase="${fini ? 'fin' : T.phase}">
        <div class="vt-boitier" role="group" aria-label="${ech(nom || 'Terminal vocal')}">
          <div class="vt-tete"><span class="vt-led" aria-hidden="true"></span>${ech(NOM)}${titre ? ` · ${ech(titre)}` : ''}${son
            ? `<button type="button" class="vt-son vt-son-btn" data-vt-son aria-pressed="${!ui.coupe}">${ui.coupe ? 'Remettre le son' : 'Couper le son'}</button>`
            : (nom ? '' : '<span class="vt-son">sans son</span>')}</div>
          <div class="vt-ecran" aria-live="polite">${passe}${actu}</div>
          <form class="vt-saisie" data-vt-form autocomplete="off">
            <input data-vt-champ inputmode="numeric" autocomplete="off" maxlength="6" value="${ech(ferme ? '' : ui.saisie)}"
              placeholder="${ferme ? '' : att}" aria-label="Ta réponse au terminal" ${ferme ? 'disabled' : ''}>
            <button type="submit" class="vt-btn" data-vt-valider ${ferme ? 'disabled' : ''}>Valider</button>
          </form>
          <div class="vt-mots"><button type="button" class="vt-btn" data-vt-repete>Répète</button>${boutonsMots}</div>
        </div>${prof}</div>`;
    },
    // `api` : { sauver, redessiner, signal(evt, ligne), clavier() }.
    brancher(racine, T, api) {
      const el = racine.querySelector('[data-terminal]');
      if (!el) return;
      if (SCAN) { brancherScanner(el, T, api || {}); return; }
      const champ = el.querySelector('[data-vt-champ]');
      const apres = (evt, l) => {
        ui.saisie = '';
        parler(texteParle(T, lignes, textes));
        // Le geste AVANT la sauvegarde : c'est elle qui fait arriver une question au fil sur ce geste (sinon au geste suivant).
        if (api.signal) api.signal(evt, l);
        api.sauver();
        api.redessiner();
      };
      champ.addEventListener('input', () => { ui.saisie = champ.value; });
      el.querySelector('[data-vt-form]').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const l = ligneEnCours(T);
        const evt = repondreTerminal(T, lignes, champ.value, textes, Date.now(), mots);
        ui.focus = true;
        if (!evt) { champ.focus({ preventScroll: true }); return; }
        apres(evt, l);
      });
      el.querySelector('[data-vt-repete]').addEventListener('click', () => {
        ui.flash = true; ui.focus = true;
        parler(phraseTerminal(T, lignes, textes));
        api.redessiner();
      });
      el.querySelectorAll('[data-vt-mot]').forEach((b) => b.addEventListener('click', () => {
        const l = ligneEnCours(T);
        const evt = motTerminal(T, lignes, mots.find((m) => m.id === b.dataset.vtMot), textes);
        if (!evt) return;
        ui.focus = true;
        apres(evt, l);
      }));
      // L'élève coupe le son pour lui (et le remet tant que l'enseignant le laisse actif) ; le bouton n'existe pas sinon.
      const bSon = el.querySelector('[data-vt-son]');
      if (bSon) bSon.addEventListener('click', () => {
        ui.coupe = !ui.coupe; ui.focusSon = true;
        try { if (ui.coupe && window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* rien */ }
        if (!ui.coupe) parler(phraseTerminal(T, lignes, textes));
        api.redessiner();
      });
      if (ui.focusSon) { ui.focusSon = false; if (bSon) bSon.focus({ preventScroll: true }); return; }
      // Le focus revient au champ après une réponse (on enchaîne les lignes au clavier), jamais en arrivant sur l'écran ; champ
      // fermé (fin, pose attendue) : sur « Répète ».
      if (ui.focus) {
        ui.focus = false;
        (champ.disabled ? el.querySelector('[data-vt-repete]') : champ).focus({ preventScroll: true });
      }
    },
    // La vue hôte : la marchandise est posée. Rend { evt, ligne } (evt null si rien n'était attendu) ; dit la phrase suivante.
    // À elle de sauver, signaler et redessiner.
    poser(T) {
      const l = ligneEnCours(T);
      const evt = poseTerminal(T, lignes);
      if (evt) parler(phraseTerminal(T, lignes, textes));
      return { evt, ligne: l };
    },
  };
}
