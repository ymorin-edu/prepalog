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

// Un mélange NON biaisé (Fisher-Yates) : rend une copie, ne touche pas à `liste`. Sans second argument, le
// hasard est celui du navigateur (`Math.random`) : un ordre différent à chaque appel, pour les vues qui
// mélangent sans graine (QCM, associer, numérique). Avec `reel` (le tirage d'une graine, voir `hasard`),
// l'ordre est une fonction de la graine. Ne JAMAIS mélanger par un `sort` à comparateur aléatoire : cet ordre
// est biaisé (les premiers éléments restent trop souvent en tête).
export function melangerListe(liste, reel = Math.random) {
  const L = liste.slice();
  for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(reel() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
  return L;
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
  const melanger = (liste) => melangerListe(liste, reel);
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

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// TIRAGE MÉMORISÉ ET BANQUES (chantier D-C, lot 2, 09/10/2026 ; brief `docs/briefs/MOTEUR-tirage-et-niveaux.md` §4).
//
// Pour les séances de GUIDAGE et d'ENTRAÎNEMENT (et les évaluations nouvelles) : une pièce FIXE porte le fil conducteur,
// donnée à tous ; les autres sont TIRÉES dans une BANQUE selon un MÉLANGE de difficultés fixé par la séance (la note reste
// juste d'un élève à l'autre) ; un élève CONFIRMÉ reçoit en plus des cas BONUS (jamais en évaluation). Contrairement à
// `tirerJeu` ci-dessus, le résultat est RANGÉ dans la base à la première ouverture et n'est JAMAIS recalculé :
// `db.tirages[<id de la séance>] = { graine, pieces: { cv: [ids] }, bonus: { cv: [ids] }, valeurs, essai, at, … }`.
// Enrichir la banque, changer le mélange, ajouter une pièce : sans effet pour un élève qui a déjà ouvert la séance.
// Aucun élève bloqué : une pièce rangée devenue introuvable est remplacée par une pièce de même difficulté
// (`remplacees`), un tirage jamais conforme rend le secours (premières pièces de chaque difficulté).
//
// La séance déclare, dans son contenu (`contenus/<séance>.js`), `export const TIRAGE = declarerTirage({ banques, valeurs?,
// verifier?, essais? })` et ses jalons lisent `TIRAGE.piecesTirees(db, 'cv')`, `TIRAGE.piecesBonus(db, 'cv')`,
// `TIRAGE.valeursTirees(db)`. La fabrique (`seance-entreprise.js`) le passe au moteur (option `tirage`), qui le lie à
// l'id de la séance et range le tirage à l'ouverture. Format complet : `activites/FICHE-SEANCE.md`.
// Les évaluations ENT-4.4 et ENT-2.5 (`quai`/`inventaire` fonctions de la graine) gardent `tirerJeu` : ne pas les migrer.

export const DIFFICULTES = ['facile', 'moyen', 'difficile'];
const MARQUE = 'prepalog-tirage-banques';
export const estTirage = (x) => !!(x && x.__tirage === MARQUE);

// Les fautes d'une déclaration, en clair (liste vide = conforme). La fabrique refuse la séance s'il y en a.
export function fautesTirage(decl) {
  const F = [];
  const B = decl && decl.banques;
  if (!B || typeof B !== 'object' || !Object.keys(B).length) return ['« banques » est absent ou vide.'];
  for (const [nom, b] of Object.entries(B)) {
    const P = (b && b.pieces) || [];
    if (!Array.isArray(P) || !P.length) { F.push(`la banque « ${nom} » n'a aucune pièce.`); continue; }
    const vus = new Set();
    P.forEach((p, i) => {
      if (!p || typeof p.id !== 'string' || !p.id) { F.push(`banque « ${nom} », pièce n° ${i + 1} : pas d'« id » texte.`); return; }
      if (vus.has(p.id)) F.push(`banque « ${nom} » : l'id « ${p.id} » est en double.`);
      vus.add(p.id);
      const fixe = (b.fixes || []).includes(p.id);
      if (!fixe && !DIFFICULTES.includes(p.difficulte)) F.push(`banque « ${nom} », pièce « ${p.id} » : difficulté « ${p.difficulte} » (facile, moyen ou difficile).`);
    });
    (b.fixes || []).forEach((id) => { if (!vus.has(id)) F.push(`banque « ${nom} » : la pièce fixe « ${id} » n'est pas dans la banque.`); });
    const melanges = [['melange', b.melange], ['bonus.confirme', b.bonus && b.bonus.confirme]];
    melanges.forEach(([cle, m]) => {
      if (m === undefined) return;
      if (!m || typeof m !== 'object') { F.push(`banque « ${nom} » : « ${cle} » doit être { facile, moyen, difficile }.`); return; }
      Object.keys(m).forEach((d) => {
        if (!DIFFICULTES.includes(d)) F.push(`banque « ${nom} », « ${cle} » : difficulté inconnue « ${d} ».`);
        else if (!Number.isInteger(m[d]) || m[d] < 0) F.push(`banque « ${nom} », « ${cle}.${d} » : un nombre entier attendu.`);
      });
    });
    if (b.bonus && Object.keys(b.bonus).some((k) => k !== 'confirme')) F.push(`banque « ${nom} » : « bonus » ne connaît que « confirme ».`);
    if (b.ordre !== undefined && b.ordre !== 'melange' && b.ordre !== 'fixe') F.push(`banque « ${nom} » : « ordre » vaut 'melange' ou 'fixe'.`);
    // Le socle doit pouvoir être tiré tel que déclaré (pièces non retirées, hors fixes), bonus compris.
    const dispo = (d) => P.filter((p) => p && !p.retiree && !(b.fixes || []).includes(p.id) && p.difficulte === d).length;
    DIFFICULTES.forEach((d) => {
      const besoin = ((b.melange || {})[d] || 0) + (((b.bonus || {}).confirme || {})[d] || 0);
      if (besoin > dispo(d)) F.push(`banque « ${nom} » : ${besoin} pièce(s) « ${d} » demandée(s) (socle + bonus), ${dispo(d)} disponible(s).`);
    });
  }
  if (decl.valeurs !== undefined && typeof decl.valeurs !== 'function') F.push('« valeurs » doit être une fonction (h) => ({ … }).');
  if (decl.verifier !== undefined && typeof decl.verifier !== 'function') F.push('« verifier » doit être une fonction (jeu) => [écarts].');
  return F;
}

// Vrai si la déclaration prévoit des cas bonus (elle doit alors déclarer `meta.niveauxPrevus: ['confirme']`).
export const aDesBonus = (decl) => !!(decl && decl.banques && Object.values(decl.banques)
  .some((b) => b && b.bonus && b.bonus.confirme && Object.values(b.bonus.confirme).some((n) => n > 0)));

export function declarerTirage(decl) {
  if (estTirage(decl)) return decl;
  const banques = (decl && decl.banques) || {};
  const NOMS = Object.keys(banques);
  const parId = Object.fromEntries(NOMS.map((n) => [n, new Map(((banques[n] && banques[n].pieces) || []).map((p) => [p && p.id, p]))]));
  const fixesDe = (n) => (banques[n].fixes || []).slice();
  const rang = (n, id) => banques[n].pieces.findIndex((p) => p.id === id);
  const enOrdreDeBanque = (n, ids) => ids.slice().sort((a, b) => rang(n, a) - rang(n, b));
  const actives = (n) => banques[n].pieces.filter((p) => !p.retiree);
  let id = null;   // l'id de la séance, posé par `lier` (fabrique, puis moteur)

  // Un tirage en ids, à partir d'un générateur `h`. `secours` : les premières pièces de chaque difficulté (ordre de banque).
  function tirerIds(h, { confirme, secours, hv }) {
    const pieces = {}, bonus = {}, difficultes = {};
    NOMS.forEach((n) => {
      const b = banques[n];
      const fixes = fixesDe(n);
      const pool = actives(n).filter((p) => !fixes.includes(p.id));
      const pris = [];
      const prendre = (d, k, exclus) => {
        const cand = pool.filter((p) => p.difficulte === d && !exclus.includes(p.id)).map((p) => p.id);
        return secours ? cand.slice(0, k) : h.prendre(cand, k);
      };
      DIFFICULTES.forEach((d) => { pris.push(...prendre(d, (b.melange || {})[d] || 0, [])); });
      const socle = [...fixes, ...pris];
      pieces[n] = b.ordre === 'fixe' || secours ? [...fixes, ...enOrdreDeBanque(n, pris)] : h.melanger(socle);
      difficultes[n] = Object.fromEntries(socle.map((x) => [x, fixes.includes(x) ? 'fixe' : parId[n].get(x).difficulte]));
      const B = confirme && b.bonus && b.bonus.confirme;
      if (B) {
        const plus = [];
        DIFFICULTES.forEach((d) => { plus.push(...prendre(d, B[d] || 0, [...socle, ...plus])); });
        bonus[n] = b.ordre === 'fixe' || secours ? enOrdreDeBanque(n, plus) : plus;
        plus.forEach((x) => { difficultes[n][x] = parId[n].get(x).difficulte; });
      }
    });
    const out = { pieces, difficultes };
    if (Object.keys(bonus).length) out.bonus = bonus;
    if (decl.valeurs) out.valeurs = decl.valeurs(hv || h);
    return out;
  }
  // Ce que reçoit `verifier` : les pièces elles-mêmes (pas leurs ids), dans l'ordre de l'élève.
  const jeuDe = (t) => ({
    pieces: Object.fromEntries(Object.entries(t.pieces).map(([n, L]) => [n, L.map((x) => parId[n].get(x))])),
    bonus: Object.fromEntries(Object.entries(t.bonus || {}).map(([n, L]) => [n, L.map((x) => parId[n].get(x))])),
    valeurs: t.valeurs,
  });

  const T = {
    __tirage: MARQUE,
    decl,
    banques: NOMS,
    get id() { return id; },
    // Lie la déclaration à SA séance (une déclaration = une séance). Un second id différent est une faute de contenu.
    lier(seance) {
      if (!seance) return;
      if (id && id !== seance) throw new Error(`la déclaration de tirage est déjà liée à la séance « ${id} », pas à « ${seance} ».`);
      id = seance;
    },
    // Le tirage d'une graine, SANS le ranger (tests, corrigé). `confirme` : avec les cas bonus.
    tirer(graine, { confirme = false } = {}) {
      const verif = decl.verifier || (() => []);
      const r = tirerJeu({
        tirer: (h, g) => { const t = tirerIds(h, { confirme, hv: hasard(`${g}|valeurs`) }); return { t, jeu: jeuDe(t) }; },
        verifier: (x) => verif(x.jeu),
        secours: (() => { const t = tirerIds(hasard(`${graine}|secours`), { confirme, secours: true, hv: hasard(`${graine}|valeurs`) }); return { t, jeu: jeuDe(t) }; })(),
        essais: decl.essais,
      }, graine);
      return { ...r.jeu.t, essai: r.essai, secours: r.secours };
    },
    // Le tirage RANGÉ de cette séance dans la base, ou null.
    tirage(db) {
      const T2 = db && db.tirages;
      if (!T2) return null;
      if (id) return T2[id] || null;
      const k = Object.keys(T2);
      return k.length === 1 ? T2[k[0]] : null;
    },
    // À l'ouverture : tire et RANGE si la base n'a pas encore de tirage pour cette séance ; sinon remplace les pièces
    // devenues introuvables. Rend vrai si la base a changé (à sauver). `uid` + id de la séance = la graine.
    assurer(db, { uid, aisance, copie }) {
      if (!db || !id) return false;
      if (!db.tirages) db.tirages = {};
      const rec = db.tirages[id];
      if (!rec) {
        const graine = `${uid || 'anonyme'}|${id}`;
        const confirme = aisance === 'confirme' && !copie;
        const t = T.tirer(graine, { confirme });
        db.tirages[id] = { graine, ...t, at: Date.now() };
        return true;
      }
      return remplacerIntrouvables(rec);
    },
    piecesTirees(db, n) { return lire(T.tirage(db), n, 'pieces'); },
    piecesBonus(db, n) { return lire(T.tirage(db), n, 'bonus'); },
    valeursTirees(db) { const r = T.tirage(db); return (r && r.valeurs) || {}; },
    // Vrai si la pièce `pid` de la banque `n` est un cas bonus de cet élève.
    estBonus(db, n, pid) { const r = T.tirage(db); return !!(r && r.bonus && (r.bonus[n] || []).includes(pid)); },
  };

  // Les pièces d'une liste rangée, prises dans la banque par leur id. Un id remplacé suit son remplaçant ; un id
  // introuvable (sans remplaçant) est omis : jamais d'exception.
  function lire(rec, n, cle) {
    if (!rec || !rec[cle] || !parId[n]) return [];
    const R = (rec.remplacees && rec.remplacees[n]) || {};
    return (rec[cle][n] || []).map((x) => parId[n].get(R[x] || x)).filter(Boolean);
  }
  // Une pièce rangée introuvable dans la banque (supprimée par erreur malgré la règle) : remplacée par une pièce de même
  // difficulté que l'élève n'a pas déjà (non retirée d'abord, dans l'ordre de la banque), notée dans `remplacees`.
  function remplacerIntrouvables(rec) {
    let change = false;
    NOMS.forEach((n) => {
      const ids = [...((rec.pieces || {})[n] || []), ...((rec.bonus || {})[n] || [])];
      if (!ids.length) return;
      const R = (rec.remplacees && rec.remplacees[n]) || {};
      const utilises = new Set(ids.map((x) => R[x] || x));
      ids.forEach((x) => {
        const actuel = R[x] || x;
        if (parId[n].has(actuel)) return;
        const d = ((rec.difficultes || {})[n] || {})[x];
        const libres = banques[n].pieces.filter((p) => !utilises.has(p.id) && !fixesDe(n).includes(p.id));
        const choix = libres.find((p) => !p.retiree && p.difficulte === d) || libres.find((p) => p.difficulte === d)
          || libres.find((p) => !p.retiree) || null;
        if (!choix) return;
        if (!rec.remplacees) rec.remplacees = {};
        if (!rec.remplacees[n]) rec.remplacees[n] = {};
        rec.remplacees[n][x] = choix.id;
        utilises.add(choix.id);
        change = true;
      });
    });
    return change;
  }
  return T;
}

// Le corrigé d'un élève pour une séance tirée (onglet Corrigés de l'enseignant), à composer par le fichier de corrigé :
// `export function corrigeEleve(base) { return corrigeDuTirage(TIRAGE, base, { titre, attendu }) }`. Une pièce = un
// élément : `titre(piece)` (sinon `piece.titre` ou son id), `attendu(piece, valeurs)` (sinon `piece.attendu`) ; les cas
// bonus portent `bonus: true` (l'onglet les marque « bonus »), les valeurs tirées viennent en tête.
export function corrigeDuTirage(T, base, { titre, attendu, texte } = {}) {
  const rec = T.tirage(base);
  if (!rec) return { texte: 'Cet élève n’a pas encore ouvert la séance : pas de tirage.', items: [] };
  const valeurs = T.valeursTirees(base);
  const items = [];
  const V = Object.entries(valeurs);
  if (V.length) items.push({ genre: 'fait', texte: 'Valeurs tirées', rep: V.map(([k, v]) => `${k} : ${v}`).join(' · ') });
  T.banques.forEach((n) => {
    const un = (p, bonus) => ({ genre: 'fait', bonus,
      texte: `${titre ? titre(p) : (p.titre || p.id)}${p.difficulte ? ` (${p.difficulte})` : ''}`,
      rep: String(attendu ? attendu(p, valeurs) : (p.attendu !== undefined ? p.attendu : '')) });
    T.piecesTirees(base, n).forEach((p) => items.push(un(p, false)));
    T.piecesBonus(base, n).forEach((p) => items.push(un(p, true)));
  });
  const rempl = Object.entries(rec.remplacees || {}).flatMap(([n, R]) => Object.entries(R).map(([a, b]) => `${a} → ${b}`));
  return { texte: [texte, rempl.length ? `Pièces remplacées (introuvables dans la banque) : ${rempl.join(', ')}.` : ''].filter(Boolean).join(' '), items };
}
