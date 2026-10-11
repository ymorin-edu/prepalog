// Le TERMINAL VOCAL — un panneau qui DIT une phrase à la fois et attend une réponse tapée au clavier.
//
// Écrit le 11/10/2026 (chantier D-6, lot 2, demande au moteur du brief `docs/briefs/ENT-6.6-france-boissons-inventaire.md`
// §7.2), d'après la maquette validée de 6.7 (`docs/briefs/france-boissons/maquette-6.7-preparation-vocale.html`) : boîtier
// sombre, écran, champ de réponse, « Valider », « Répète ». Commun à l'inventaire (ENT-6.6, sous-mode comptage du stockage
// de masse) et, plus tard, à la préparation vocale (ENT-6.7, chantier D-7) : rien ici ne connaît les fûts ni les couloirs.
// La vue hôte (`entrepot-masse.js`) lui donne ses LIGNES, déjà rédigées :
//
//   { id: 'M04', lieu: 'Couloir M04.', code: '63', question: 'Pelforth Blonde fût 20 L. Lot S19. Combien de fûts ?' }
//
// Le dialogue d'une ligne : « <lieu> Code de contrôle ? » → le code (faux : « Code faux. … », redemandé, compté) →
// « <question> » → un nombre → « Compris : n. » → la ligne suivante. L'ordre est IMPOSÉ, pas de retour sur une ligne validée ;
// une case vide ne fait rien (0 est une réponse, rien n'en est pas une). Après la dernière ligne : `textes.fin`.
// Le terminal ne juge RIEN : il range les réponses ; les jalons de la vue hôte les comparent à ce qui est vrai.
// Le texte est TOUJOURS affiché. Le son (lot 3) passera par `parler()` : il ne parle pas encore.
//
// L'état, rangé par la vue hôte dans la base de l'élève (cloisonné par séance) :
//   { i: n° de la ligne en cours, phase: 'code' | 'reponse', reponses: { M01: 15 }, codesFaux: { M01: 2 },
//     journal: [{ q: 't' | 'e', x: texte, ko?: 1, h: date }], debut, fin }
// `journal` : ce qui s'est dit, horodaté (le terminal dit `t`, l'élève `e`) ; la préparation (6.7) en fera son bilan.

import { ech } from '../texte.js';

export const terminalNeuf = () => ({ i: 0, phase: 'code', reponses: {}, codesFaux: {}, journal: [], debut: null, fin: null });
const JOURNAL_MAX = 300;
const TEXTES = {
  code: 'Code de contrôle ?',
  codeFaux: 'Code faux. Vérifie le lieu.',
  chiffres: 'Je n’ai pas compris. Réponds avec des chiffres.',
  compris: (n) => `Compris : ${n}.`,
  fin: 'Terminé.',
};

// La phrase que le terminal dit maintenant (celle qu'on attend de l'élève), ou la phrase de fin.
export function phraseTerminal(T, lignes, textes = {}) {
  const X = Object.assign({}, TEXTES, textes);
  if (T.fin || T.i >= lignes.length) return X.fin;
  const l = lignes[T.i];
  return T.phase === 'code' ? `${l.lieu} ${X.code}` : l.question;
}

// L'élève répond `saisie`. Change l'état (pur, sans navigateur : les tests l'appellent aussi) et rend ce qui s'est passé :
// null (rien : case vide ou terminal fini), 'chiffres', 'codeFaux', 'code', 'reponse' (une ligne finie) ou 'fin' (la dernière).
export function repondreTerminal(T, lignes, saisie, textes = {}, h = Date.now()) {
  const X = Object.assign({}, TEXTES, textes);
  const v = String(saisie == null ? '' : saisie).replace(/\s+/g, '');
  if (!v || T.fin || T.i >= lignes.length) return null;
  const l = lignes[T.i];
  if (!T.debut) T.debut = h;
  const dit = (q, x, ko) => { T.journal.push(ko ? { q, x, ko: 1, h } : { q, x, h }); };
  dit('t', phraseTerminal(T, lignes, textes));
  dit('e', v);
  let evt;
  if (!/^\d{1,4}$/.test(v)) { dit('t', X.chiffres, true); evt = 'chiffres'; }
  else if (T.phase === 'code') {
    if (v === String(l.code)) { T.phase = 'reponse'; evt = 'code'; }
    else { T.codesFaux[l.id] = (T.codesFaux[l.id] || 0) + 1; dit('t', X.codeFaux, true); evt = 'codeFaux'; }
  } else {
    const n = Number(v);
    T.reponses[l.id] = n;
    dit('t', X.compris(n));
    T.i += 1; T.phase = 'code';
    if (T.i >= lignes.length) { T.fin = h; evt = 'fin'; } else evt = 'reponse';
  }
  if (T.journal.length > JOURNAL_MAX) T.journal.splice(0, T.journal.length - JOURNAL_MAX);
  return evt;
}

// Le panneau. `lignes`, `textes` : de la vue hôte ; `titre` : la deuxième moitié de l'en-tête (« Inventaire tournant »).
export function creerTerminal({ lignes, textes = {}, titre = '' }) {
  const ui = { saisie: '', flash: false, focus: false };
  const VU = 5;     // les dernières phrases échangées, au-dessus de la phrase en cours
  // Le son (lot 3) : rien pour l'instant, le texte suffit (le terminal se comprend sans son, brief §10).
  const parler = () => {};
  return {
    html(T, { estProf = false } = {}) {
      const fini = !!T.fin;
      const passe = T.journal.slice(-VU).map((j) => (j.q === 'e'
        ? `<div class="vt-moi">› ${ech(j.x)}</div>`
        : `<div class="vt-passe${j.ko ? ' vt-ko' : ''}">${ech(j.x)}</div>`)).join('');
      const actu = `<div class="vt-actu${ui.flash ? ' vt-flash' : ''}" data-vt-actu>${ech(phraseTerminal(T, lignes, textes))}</div>`;
      ui.flash = false;
      const att = T.phase === 'code' ? 'code' : 'nombre';
      const faux = Object.entries(T.codesFaux || {});
      const prof = !estProf ? '' : `<details class="pe-prof vt-prof" data-vt-prof><summary>Côté enseignant : le terminal</summary>
        <div>Ligne ${Math.min(T.i + 1, lignes.length)} sur ${lignes.length}${fini ? ' — terminé' : ''}</div>
        <div>Réponses : ${lignes.filter((l) => l.id in T.reponses).map((l) => `${ech(l.id)} ${T.reponses[l.id]}`).join(' · ') || 'aucune'}</div>
        <div data-vt-faux>Codes faux (trace, non notée) : ${faux.length ? faux.map(([id, n]) => `${ech(id)} ×${n}`).join(' · ') : 'aucun'}</div></details>`;
      return `<div class="vt" data-terminal data-vt-ligne="${T.i}" data-vt-phase="${fini ? 'fin' : T.phase}">
        <div class="vt-boitier" role="group" aria-label="Terminal vocal">
          <div class="vt-tete"><span class="vt-led" aria-hidden="true"></span>TERMINAL VOCAL${titre ? ` · ${ech(titre)}` : ''}<span class="vt-son">sans son</span></div>
          <div class="vt-ecran" aria-live="polite">${passe}${actu}</div>
          <form class="vt-saisie" data-vt-form autocomplete="off">
            <input data-vt-champ inputmode="numeric" autocomplete="off" maxlength="6" value="${ech(fini ? '' : ui.saisie)}"
              placeholder="${fini ? '' : att === 'code' ? 'code' : 'nombre'}" aria-label="Ta réponse au terminal" ${fini ? 'disabled' : ''}>
            <button type="submit" class="vt-btn" data-vt-valider ${fini ? 'disabled' : ''}>Valider</button>
          </form>
          <div class="vt-mots"><button type="button" class="vt-btn" data-vt-repete>Répète</button></div>
        </div>${prof}</div>`;
    },
    // `api` : { sauver, redessiner, signal(evt, ligne), clavier() }.
    brancher(racine, T, api) {
      const el = racine.querySelector('[data-terminal]');
      if (!el) return;
      const champ = el.querySelector('[data-vt-champ]');
      champ.addEventListener('input', () => { ui.saisie = champ.value; });
      el.querySelector('[data-vt-form]').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const l = lignes[T.i];
        const evt = repondreTerminal(T, lignes, champ.value, textes);
        ui.focus = true;
        if (!evt) { champ.focus({ preventScroll: true }); return; }
        ui.saisie = '';
        parler(phraseTerminal(T, lignes, textes));
        api.sauver();
        if (api.signal) api.signal(evt, l);
        api.redessiner();
      });
      el.querySelector('[data-vt-repete]').addEventListener('click', () => {
        ui.flash = true; ui.focus = true;
        parler(phraseTerminal(T, lignes, textes));
        api.redessiner();
      });
      // Le focus revient au champ après une réponse (on enchaîne les lignes au clavier), jamais en arrivant sur l'écran.
      if (ui.focus) {
        ui.focus = false;
        (T.fin ? el.querySelector('[data-vt-repete]') : champ).focus({ preventScroll: true });
      }
    },
  };
}
