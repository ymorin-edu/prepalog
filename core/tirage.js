// Le tirage d'un jeu de données par élève — évaluations (décision de Tristan du 03/10/2026,
// `docs/briefs/DECISION-jeu-unique-evaluations.md`). Écrit pour Picard ENT-4.4 (chantier P6),
// GÉNÉRIQUE : il ne connaît ni le quai ni l'inventaire. Cdiscount ENT-2.5 s'en servira.
//
// Le principe :
//   - la GRAINE est l'identifiant de l'élève (`ctx.profil.uid`), rangée dans sa base à la
//     première ouverture (`db.tirage.graine`) : même jeu sur un autre poste, après rechargement,
//     après réouverture de la copie, et l'enseignant qui ramasse la copie le retrouve depuis la
//     base seule (`noter(db)` n'a pas d'identifiant sous la main) ;
//   - la séance déclare `{ tirer(hasard, graine) → jeu, verifier(jeu) → [écarts], secours }` :
//     `tirer` puise dans sa réserve, `verifier` dit en clair ce qui viole les contraintes
//     d'équité (liste vide = jeu conforme), `secours` est un jeu fixe et conforme ;
//   - `tirerJeu` retire tant que le jeu n'est pas conforme (graine « uid#1 », « uid#2 »…), et rend
//     le secours après `essais` échecs : AUCUN jeu hors règle n'atteint un élève. La suite de
//     tests tire quelques centaines de graines et exige zéro secours.
//
// ⚠ Le tirage est une fonction pure de la graine : changer la réserve ou le code de `tirer` CHANGE
// le jeu des élèves. Ne rien y toucher entre l'ouverture d'une évaluation et le ramassage.

// Empreinte 32 bits d'un texte (FNV-1a) : la même partout, navigateur comme Node.
export function empreinte(texte) {
  let h = 0x811c9dc5;
  const s = String(texte == null ? '' : texte);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// Un générateur pseudo-aléatoire (mulberry32) et ses outils, à partir d'une graine texte.
export function hasard(graine) {
  let a = empreinte(graine) || 1;
  const reel = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const entier = (min, max) => min + Math.floor(reel() * (max - min + 1));
  const melanger = (liste) => {
    const L = liste.slice();
    for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(reel() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
    return L;
  };
  return {
    reel, entier, melanger,
    choisir: (liste) => liste[Math.floor(reel() * liste.length)],
    // n éléments distincts, dans un ordre tiré.
    prendre: (liste, n) => melanger(liste).slice(0, n),
    // Un décimal entre min et max, arrondi au dixième (une température, un poids).
    dixieme: (min, max) => Math.round((min + reel() * (max - min)) * 10) / 10,
  };
}

// Le jeu d'une graine. `decl` : { tirer(h, graine), verifier(jeu), secours, essais? }.
// Rend `{ jeu, essai, secours }` : `essai` = numéro du tirage retenu, `secours` = vrai si aucun
// tirage n'était conforme (le jeu fixe de la séance a été donné à la place).
export function tirerJeu(decl, graine) {
  const essais = decl.essais || 40;
  for (let n = 0; n < essais; n++) {
    const g = n ? `${graine}#${n}` : String(graine);
    let jeu = null;
    try { jeu = decl.tirer(hasard(g), g); } catch (e) { jeu = null; }
    if (jeu && !(decl.verifier(jeu) || []).length) return { jeu, essai: n, secours: false };
  }
  return { jeu: decl.secours, essai: -1, secours: true };
}

// La graine rangée dans la base de l'élève ('' tant qu'elle n'a pas été posée).
export const graineDeBase = (db) => String((db && db.tirage && db.tirage.graine) || '');

// À l'ouverture : pose la graine (l'identifiant de l'élève) si la base n'en a pas. Rend vrai si
// la base a changé (à sauver). Une graine déjà posée n'est JAMAIS remplacée.
export function poserGraine(db, uid) {
  if (!db || graineDeBase(db)) return false;
  db.tirage = { graine: String(uid || 'anonyme'), pose: Date.now() };
  return true;
}
