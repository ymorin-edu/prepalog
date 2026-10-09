// Réglages propres à un élève, posés par l'enseignant (brief MOTEUR-tiers-temps, 03/10/2026 ; niveaux par scénario :
// brief MOTEUR-tirage-et-niveaux, lot 1, 09/10/2026).
//
// Deux réglages indépendants, rangés dans le profil de l'élève :
//   - `niveaux` : le niveau de l'élève PAR SCÉNARIO (une entreprise : ENT-6.x = France Boissons), `{ '<n°>': 'confirme'
//     | 'accompagne' }`. La clé est le premier nombre du `code` de la séance (`ENT-6.4` → '6'), comme la table
//     `ENTREPRISES` (activites/index.js). Absent = 'standard' : on ne range jamais 'standard'. Un élève peut être
//     confirmé chez Smoby et standard chez France Boissons. Le moteur ne grossit RIEN de lui-même : seule une séance
//     qui le prévoit dans son contenu lit `ctx.aisance` (le niveau du scénario de la séance ouverte), recopié et figé
//     dans `db.aisance`. « Accompagné » : contenu à concevoir ; en attendant, il reçoit le contenu standard (les
//     contenus testent `db.aisance === 'confirme'`). Le nom `aisance` évite toute confusion avec le niveau de CLASSE du
//     groupe (`niveauGroupe`).
//     MIGRATION SANS ÉCRITURE : l'ancien réglage unique `aisance: 'confirme'` (avant le 09/10/2026, lu seulement par
//     Cdiscount ENT-2.x) se lit comme `niveaux['2'] = 'confirme'` tant que `niveaux['2']` n'existe pas. Le premier
//     réglage enregistré dans l'onglet « Niveaux » écrit `niveaux` et retire `aisance` (les deux backends).
//   - `tiersTemps` : booléen. Une épreuve chronométrée multiplie ses seuils de temps par 4/3.
//     C'est un aménagement (PAP, PPS) : donnée de santé indirecte. Il ne s'affiche qu'à
//     l'élève concerné et dans l'onglet « Comptes élèves » de l'enseignant, jamais dans une vue
//     de classe projetable, et il n'est pas exporté.
//
// Seul l'enseignant écrit ces champs : les règles Firestore n'autorisent l'élève à changer que `nom` et `prenom` sur
// son propre profil (liste blanche, audit du 08/10/2026), donc ni `niveaux`, ni `aisance`, ni `tiersTemps`.
// Un champ absent vaut le défaut (standard partout, pas de tiers-temps).

export const NIVEAUX = [
  { id: 'standard', label: 'Standard' },
  { id: 'confirme', label: 'Confirmé' },
  { id: 'accompagne', label: 'Accompagné' },
];
const RANGES = ['confirme', 'accompagne'];     // les seuls rangés dans `niveaux` ('standard' = absent)
export const libelleNiveauEleve = (id) => (NIVEAUX.find((x) => x.id === id) || NIVEAUX[0]).label;

// LA RÈGLE DE PROPOSITION (§1 point 9 du brief, décision de Tristan du 08/10/2026) : le site PROPOSE « Confirmé » à un
// élève standard d'un scénario qui a, sur au moins `seances` séances de ce scénario, un premier bilan ≥ `noteMin` / 20
// ET un temps passé sous la médiane du groupe (`temps: 'mediane'`) pour cette séance. Rien ne change sans un clic de
// l'enseignant. Le seul endroit à toucher pour affiner.
export const PROPOSITION = { seances: 2, noteMin: 16, temps: 'mediane' };

export const CHAMPS_AMENAGEMENTS = ['niveaux', 'tiersTemps'];

// Le scénario d'une séance : le premier nombre de son code, en texte (`ENT-6.4` → '6'), ou null.
export function scenarioDe(code) {
  const m = String(code || '').match(/\d+/);
  return m ? String(Number(m[0])) : null;
}

// Les niveaux d'un profil, toujours valides : seulement des clés numériques et 'confirme' / 'accompagne'.
// L'ancien `aisance: 'confirme'` se lit comme Cdiscount confirmé (voir la migration en tête).
export function niveauxDe(profil) {
  const out = {};
  const n = profil && profil.niveaux;
  if (n && typeof n === 'object') {
    Object.keys(n).forEach((k) => { if (/^\d+$/.test(k) && RANGES.includes(n[k])) out[String(Number(k))] = n[k]; });
  }
  const aDeja2 = !!(n && typeof n === 'object' && Object.prototype.hasOwnProperty.call(n, '2'));
  if (!aDeja2 && profil && profil.aisance === 'confirme') out['2'] = 'confirme';
  return out;
}

// Le niveau d'un élève dans un scénario : 'standard', 'confirme' ou 'accompagne'. Toujours valide.
export function niveauScenario(profil, n) {
  const k = n == null ? null : String(n);
  return (k && niveauxDe(profil)[k]) || 'standard';
}

// Les réglages d'un profil, toujours complets et toujours valides.
export function amenagements(profil) {
  return {
    niveaux: niveauxDe(profil),
    tiersTemps: !!(profil && profil.tiersTemps === true),
  };
}

// Ne laisse passer que les deux champs, avec des valeurs valides. `niveaux` est la carte COMPLÈTE du profil (elle
// remplace l'ancienne) : 'standard' n'y est jamais rangé. Le backend qui écrit `niveaux` retire aussi `aisance`.
export function filtrerAmenagements(patch) {
  const p = {};
  if (patch && 'niveaux' in patch) p.niveaux = niveauxDe({ niveaux: patch.niveaux || {} });
  if (patch && 'tiersTemps' in patch) p.tiersTemps = patch.tiersTemps === true;
  return p;
}

// Les niveaux d'un élève après UN changement (`n` → `niveau`), migration comprise : la carte à écrire.
export function niveauxApres(profil, n, niveau) {
  const out = niveauxDe(profil);
  const k = String(n);
  if (RANGES.includes(niveau)) out[k] = niveau; else delete out[k];
  return out;
}

// Médiane d'une liste de nombres (null si vide).
export function mediane(L) {
  const T = L.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  if (!T.length) return null;
  const m = Math.floor(T.length / 2);
  return T.length % 2 ? T[m] : (T[m - 1] + T[m]) / 2;
}

// La PROPOSITION pour un élève dans un scénario (voir `PROPOSITION`). `seances` : les `meta` des séances du scénario ;
// `travaux(uid, aid)` : le résultat rangé (Suivi de classe) ou null ; `uids` : les élèves du groupe (pour la médiane).
// Rend null (rien à afficher) si l'élève n'est pas standard dans ce scénario, s'il a moins de `PROPOSITION.seances`
// séances notées du scénario, ou si la règle n'est pas remplie ; sinon `{ niveau: 'confirme', lignes }`, où chaque
// ligne dit ce qui la fonde : `{ code, note, temps, mediane, retenue }`.
// Premier bilan : `indicateurs[séance].note1` (rangé par le moteur au premier bilan d'une séance `correction`), sinon
// la note de la séance (meilleur score ramené sur 20).
export function proposition({ profil, uid, n, seances, travaux, uids, P = PROPOSITION }) {
  if (niveauScenario(profil, n) !== 'standard') return null;
  const ind = (t, m) => (t && t.detail && t.detail.indicateurs && t.detail.indicateurs[m.id]) || {};
  const noteDe = (t, m) => {
    if (!t) return null;
    const i = ind(t, m);
    if (typeof i.note1 === 'number') return i.note1;
    const max = t.max || m.bareme;
    return typeof t.meilleur === 'number' && max > 0 ? Math.round((t.meilleur / max) * 20 * 2) / 2 : null;
  };
  const lignes = [];
  seances.forEach((m) => {
    const t = travaux(uid, m.id);
    const note = noteDe(t, m);
    if (note === null) return;
    const temps = typeof ind(t, m).temps === 'number' ? ind(t, m).temps : null;
    const med = mediane(uids.map((u) => { const x = travaux(u, m.id); return x ? ind(x, m).temps : null; }));
    const retenue = note >= P.noteMin && temps !== null && med !== null && temps < med;
    lignes.push({ code: m.code, note, temps, mediane: med, retenue });
  });
  // Moins de `P.seances` séances notées : rien (pas assez de données) ; sinon il en faut autant de retenues.
  if (lignes.filter((l) => l.retenue).length < P.seances) return null;
  return { niveau: 'confirme', lignes };
}
