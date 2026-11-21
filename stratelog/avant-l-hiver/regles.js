// Stratelog — « Avant l'Hiver » (épisode 1, 2de) : les règles du jeu, en calcul pur.
//
// Ce fichier ne touche ni à l'écran ni à la base : il reçoit l'état des villes et les registres déposés,
// il rend l'état suivant et le journal de chaque ville. Il se teste donc sans navigateur
// (`node --test "stratelog/**/*.test.mjs"`), à part de la suite Simulog.
//
// Source de la règle : fiche « stratelog-ep1-allege » (partie 1, règle à jour du 05/10/2026) et simulateur
// de référence v15 (`stratelog-sim-v15.py`), dans les fichiers du projet. Les choix faits ici là où la fiche
// ne dit rien sont marqués « CHOIX » et listés dans stratelog/LISEZMOI.md.

// ----------------------------------------------------------------- constantes
export const SAISONS = ['Été', 'Automne', 'Hiver', 'Printemps', 'Été', 'Automne', 'Hiver'];
export const DERNIER_TOUR = 7;
export const TOUR_VOL = 4;            // coup de main dès le tour 4
export const TOUR_CHANCELLERIE = 4;   // Chancellerie constructible dès le tour 4
export const PA = 4;                  // points d'action par ville et par tour
export const CHARRETTE = 20;          // unités au plus par charrette
export const COUT_CHARRETTE = 2;      // deniers de transport par charrette
export const SOLDE_GUET = 10;
export const COUT_COUP = 20;
export const PEAGE = 3;
export const REP_FAMINE = 10;
export const REP_PRIS = 2;
export const BONUS_REGISTRE = 2;
export const DIVISEUR = 175;          // barème proposé, à recaler après la 1re partie

export const BUTINS = { pierre: 10, grain: 10, bois: 30, impot: null };
export const PRIX = { grain: 4, bois: 3, pierre: 5, drap: 12 };
export const MARCHANDISES = Object.keys(PRIX);

// d = deniers, b = bois, p = pierre, pts = points de score, unique = une seule par ville
export const BATIMENTS = {
  champ:        { nom: 'Champ', d: 60, b: 20, p: 0, pts: 4 },
  bucheron:     { nom: 'Bûcheron', d: 30, b: 0, p: 0, pts: 3 },
  carriere:     { nom: 'Carrière', d: 50, b: 10, p: 0, pts: 6 },
  atelier:      { nom: 'Atelier de drapier', d: 80, b: 20, p: 10, pts: 12 },
  grenier:      { nom: 'Grenier', d: 50, b: 30, p: 0, pts: 10 },
  halle:        { nom: 'Halle', d: 60, b: 20, p: 20, pts: 15 },
  quartier:     { nom: 'Quartier', d: 40, b: 30, p: 0, pts: 10 },
  guet:         { nom: 'Tour de guet', d: 30, b: 0, p: 0, pts: 3, unique: true },
  choeur:       { nom: 'Église : chœur', d: 50, b: 10, p: 20, pts: 20, unique: true },
  nef:          { nom: 'Église : nef', d: 50, b: 10, p: 20, pts: 20, unique: true },
  chancellerie: { nom: 'Chancellerie', d: 50, b: 10, p: 0, pts: 2, unique: true },
};

export const CARTES = {
  calme:          { nom: 'Saison calme', cible: false },
  grand_froid:    { nom: 'Grand froid', cible: false },
  recolte_maigre: { nom: 'Récolte maigre', cible: false },
  belle_recolte:  { nom: 'Belle récolte', cible: false },
  foire:          { nom: 'Foire', cible: false },
  rats:           { nom: 'Rats au grenier', cible: false },
  incendie:       { nom: 'Incendie', cible: true },
  route_coupee:   { nom: 'Route coupée', cible: true },
  commande:       { nom: 'Commande du Seigneur', cible: true },
};
export const PAQUET = ['calme', 'calme', 'calme', 'grand_froid', 'recolte_maigre', 'belle_recolte', 'foire', 'rats',
  'incendie', 'route_coupee', 'commande'];

// ------------------------------------------------------------------ hasard
// Générateur à graine (mulberry32) : une partie rejouée avec la même graine donne le même résultat.
export function hasard(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------ petits calculs
export const saisonDu = (tour) => (tour === 0 ? 'Été' : SAISONS[tour - 1]);   // tour d'essai : un été
export const charrettesPour = (q) => (q > 0 ? Math.ceil(q / CHARRETTE) : 0);
export const equipesDe = (hab) => Math.floor(hab / 10);

export function prix(m, saison, carte = null) {
  let p = PRIX[m];
  if (m === 'grain') p += ({ 'Été': -1, 'Hiver': 2, 'Printemps': 2 })[saison] || 0;
  if (m === 'drap' && carte === 'foire') p = 16;
  return p;
}

// Besoin en grain d'une saison : habitants ÷ 2 arrondi au-dessus, × 1,5 l'hiver (arrondi au-dessus).
export function besoinGrain(hab, saison, carte = null) {
  let b = Math.ceil(hab / 2);
  if (saison === 'Hiver') b = Math.ceil(b * 1.5);
  if (carte === 'grand_froid') b += 20;
  return b;
}

// Équipes qu'un champ réclame : 3 l'été, 1 l'automne, aucune sinon.
export const equipesParChamp = (saison) => ({ 'Été': 3, 'Automne': 1 })[saison] || 0;

export function recolteParChamp(saison, carte, equipes) {
  let base = ({ 'Été': 50, 'Automne': 20 })[saison] || 0;
  if (base && carte === 'recolte_maigre') base -= 10;
  if (base && carte === 'belle_recolte') base += 10;
  const besoin = equipesParChamp(saison);
  return besoin === 0 ? base : Math.floor(base * Math.min(equipes, besoin) / besoin);
}

// ------------------------------------------------------------------- état
export function villeDeDepart() {
  return {
    hab: 100, deniers: 300, grain: 80, bois: 40, pierre: 20, drap: 0,
    bats: { champ: 3, bucheron: 1 }, enCours: [], rep: 10, log: 120, capGrain: 150, capHalle: 100,
    quai: [],            // charrettes en attente : { m, q, tour, origine: 'achat'|'butin'|'relivraison'|'reste', achat? }
    aRelivrer: [],       // manquant d'une livraison avec écart, relivré au tour suivant si la réserve est juste
    resteMarche: [],     // marchandise payée qui n'a pas tenu dans les charrettes écrites : livrée au tour suivant
    bonus: 0, famines: 0, ecartFait: false,
  };
}

export function nouvellePartie({ villes, graine = 1, toursEcart = null }) {
  const r = hasard(graine);
  const etat = {};
  const ecart = {};
  villes.forEach((id) => {
    etat[id] = villeDeDepart();
    // Tour de la livraison avec écart : fixé à l'avance par l'enseignant (2 à 5), sinon tiré.
    ecart[id] = toursEcart && toursEcart[id] ? toursEcart[id] : 2 + Math.floor(r() * 4);
  });
  return { tour: 0, villes: [...villes], etat, ecart, paquet: melanger([...PAQUET], r), graine, historique: [] };
}

function melanger(t, r) {
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}

// Fin du tour d'essai : toutes les villes repartent de l'état de départ (décision de Tristan, 05/10).
export function remettreAZero(partie) {
  const p = structuredClone(partie);
  p.villes.forEach((id) => { p.etat[id] = villeDeDepart(); });
  p.tour = 1;
  return p;
}

export function points(v) {
  return Object.entries(v.bats).reduce((a, [b, n]) => a + BATIMENTS[b].pts * n, 0);
}
export function score(v) {
  return Math.floor(v.hab / 4) + points(v) + Math.floor(v.deniers / 50) + v.rep * 3 + v.bonus;
}

// Note formative sur 20 : score sur 14 (plafonné) + classement sur 6 (écart régulier de 6 à 2, au demi-point).
// CHOIX : deux villes à égalité de score prennent la même note de classement (la meilleure des deux places).
export function notes(scores, diviseur = DIVISEUR) {
  const ids = Object.keys(scores);
  const n = ids.length;
  const bareme = (k) => (n === 1 ? 6 : Math.round((6 - 4 * k / (n - 1)) * 2) / 2);
  const tri = [...ids].sort((a, b) => scores[b] - scores[a]);
  const res = {};
  ids.forEach((id) => {
    const rang = tri.findIndex((x) => scores[x] === scores[id]);
    const s14 = Math.max(0, Math.min(14, scores[id] / diviseur * 14));   // un score négatif (famines) compte 0
    res[id] = { rang: rang + 1, surQuatorze: Math.round(s14 * 10) / 10, classement: bareme(rang),
      note: Math.round((s14 + bareme(rang)) * 10) / 10 };
  });
  return res;
}

// --------------------------------------------------------- livraisons
// Ce que le Marché charge pour un achat : exactement les charrettes écrites (le moteur exécute ce qui est écrit).
// `ecart` : vrai si c'est l'achat touché par la livraison avec écart (la dernière charrette arrive incomplète).
export function livrer(achat, { tour, ecart = false } = {}) {
  const n = Math.max(0, Math.floor(achat.charrettes || 0));
  const charge = Math.min(achat.q, n * CHARRETTE);
  const charrettes = [];
  for (let k = 0; k < n; k++) {
    const q = Math.max(0, Math.min(CHARRETTE, charge - k * CHARRETTE));
    charrettes.push({ m: achat.m, q, tour, origine: 'achat' });
  }
  let manque = 0;
  if (ecart && charrettes.length) {
    manque = Math.max(5, Math.round(achat.q * 0.25 / 5) * 5);
    const der = charrettes[charrettes.length - 1];
    manque = Math.min(manque, der.q);
    der.q -= manque;
  }
  return { charrettes, reste: achat.q - charge, manque };
}

// L'achat touché par l'écart ce tour-ci : le premier achat de bois ou de pierre d'au moins 10 unités.
export function achatEnEcart(v, achats, tour, tourEcart) {
  if (v.ecartFait || tour !== tourEcart) return -1;
  return achats.findIndex((a) => (a.m === 'bois' || a.m === 'pierre') && a.q >= 10);
}

// ------------------------------------------------- dépôt : ce qui sort tout de suite
// Coût, recette, charrettes : ce que vaut chaque opération, au prix de la saison (sans la carte, tirée après le dépôt).
export function coutAchat(a, saison) { return a.q * prix(a.m, saison) + Math.max(0, a.charrettes || 0) * COUT_CHARRETTE; }
export function qVendue(a) { return Math.min(a.q, Math.max(0, a.charrettes || 0) * CHARRETTE); }
export function recetteVente(a, saison) { return qVendue(a) * prix(a.m, saison) - Math.max(0, a.charrettes || 0) * COUT_CHARRETTE; }

const vide = () => ({ achats: [], ventes: [], chantiers: [], equipes: {}, coup: null, reserve: false, registre: {} });
export const decisionsVides = vide;

// Les valeurs justes du registre de la ville pour ce tour.
export function attendus(partie, id, d) {
  const v = partie.etat[id];
  const tour = partie.tour;
  const saison = saisonDu(tour);
  const iEcart = achatEnEcart(v, d.achats, tour, partie.ecart[id]);
  const achats = d.achats.map((a, i) => {
    const l = livrer(a, { tour, ecart: i === iEcart });
    return { charrettes: charrettesPour(a.q), cout: a.q * prix(a.m, saison) + charrettesPour(a.q) * COUT_CHARRETTE,
      recu: l.charrettes.reduce((s, c) => s + c.q, 0) };
  });
  const ventes = d.ventes.map((a) => ({ charrettes: charrettesPour(a.q),
    recette: a.q * prix(a.m, saison) - charrettesPour(a.q) * COUT_CHARRETTE }));
  const mv = (m) => d.achats.filter((a) => a.m === m).reduce((s, a) => s + a.q, 0)
    - d.ventes.filter((a) => a.m === m).reduce((s, a) => s + qVendue(a), 0);
  const chantier = (k) => d.chantiers.reduce((s, b) => s + BATIMENTS[b][k], 0);
  const halle = v.capHalle - (v.bois + v.pierre + v.drap + mv('bois') + mv('pierre') + mv('drap') - chantier('b') - chantier('p'));
  return {
    besoin: besoinGrain(v.hab, saison),
    grenier: v.capGrain - (v.grain + mv('grain')),
    halle,
    caisse: caisseApresDepot(v, d, saison),
    achats, ventes,
    reserve: iEcart >= 0,
  };
}

export function caisseApresDepot(v, d, saison) {
  return v.deniers
    - d.achats.reduce((s, a) => s + coutAchat(a, saison), 0)
    + d.ventes.reduce((s, a) => s + recetteVente(a, saison), 0)
    - d.chantiers.reduce((s, b) => s + BATIMENTS[b].d, 0)
    - (gardee(v, d) ? SOLDE_GUET : 0)
    - (d.coup ? COUT_COUP : 0);
}

const gardee = (v, d) => !!v.bats.guet && (d.equipes.guet || 0) > 0;

// Cases obligatoires : besoin, grenier, caisse à chaque tour ; les autres seulement si l'action a eu lieu.
// Une case vide compte fausse. Rend { juste, cases: [{ cle, attendu, donne, juste }] }.
export function corriger(partie, id, d) {
  const a = attendus(partie, id, d);
  const r = d.registre || {};
  const cases = [];
  const voir = (cle, attendu, donne) => {
    const ok = donne !== undefined && donne !== null && donne !== '' && (typeof attendu === 'boolean'
      ? !!donne === attendu : Number(donne) === attendu);
    cases.push({ cle, attendu, donne: donne ?? null, juste: ok });
  };
  voir('besoin', a.besoin, r.besoin);
  voir('grenier', a.grenier, r.grenier);
  voir('caisse', a.caisse, r.caisse);
  const touche = d.chantiers.length || [...d.achats, ...d.ventes].some((x) => x.m !== 'grain');
  if (touche) voir('halle', a.halle, r.halle);
  a.achats.forEach((x, i) => {
    voir(`achat${i}.charrettes`, x.charrettes, d.achats[i].charrettes);
    voir(`achat${i}.cout`, x.cout, (r.achats || [])[i]?.cout);
    voir(`achat${i}.recu`, x.recu, (r.achats || [])[i]?.recu);
  });
  a.ventes.forEach((x, i) => {
    voir(`vente${i}.charrettes`, x.charrettes, d.ventes[i].charrettes);
    voir(`vente${i}.recette`, x.recette, (r.ventes || [])[i]?.recette);
  });
  if (d.achats.length) voir('reserve', a.reserve, d.reserve);
  return { juste: cases.every((c) => c.juste), cases, attendus: a };
}

// ------------------------------------------------------------- validation
// Ce que l'écran doit refuser avant le dépôt. Rend une liste de phrases (vide = dépôt possible).
export function valider(partie, id, d) {
  const v = partie.etat[id];
  const tour = partie.tour;
  const saison = saisonDu(tour);
  const err = [];
  const pa = d.achats.length + d.ventes.length + d.chantiers.length + (d.coup ? 1 : 0);
  if (pa > PA) err.push(`${pa} actions pour ${PA} points d'action.`);
  [...d.achats, ...d.ventes].forEach((a) => {
    if (!MARCHANDISES.includes(a.m) || !(a.q > 0)) err.push('Une opération au Marché est incomplète.');
  });
  d.ventes.forEach((a) => { if (qVendue(a) > v[a.m]) err.push(`Pas assez de ${a.m} à vendre.`); });
  // Chantiers : payés au dépôt, avec le bois et la pierre du stock.
  let b = 0; let p = 0;
  const vus = {};
  d.chantiers.forEach((x) => {
    const B = BATIMENTS[x];
    if (!B) { err.push('Bâtiment inconnu.'); return; }
    b += B.b; p += B.p; vus[x] = (vus[x] || 0) + 1;
    if (B.unique && (v.bats[x] || v.enCours.includes(x) || vus[x] > 1)) err.push(`${B.nom} : une seule par ville.`);
    if (x === 'nef' && !v.bats.choeur) err.push('La nef vient après le chœur : le chœur doit être achevé.');
    if (x === 'chancellerie' && tour < TOUR_CHANCELLERIE) err.push(`La Chancellerie se construit à partir du tour ${TOUR_CHANCELLERIE}.`);
  });
  const venduDe = (m) => d.ventes.filter((a) => a.m === m).reduce((s, a) => s + qVendue(a), 0);
  if (b > v.bois - venduDe('bois')) err.push('Pas assez de bois pour ces chantiers.');
  if (p > v.pierre - venduDe('pierre')) err.push('Pas assez de pierre pour ces chantiers.');
  // Équipes
  const e = d.equipes || {};
  const tot = Object.values(e).reduce((s, n) => s + (n || 0), 0);
  if (tot > equipesDe(v.hab)) err.push(`${tot} équipes affectées pour ${equipesDe(v.hab)} disponibles.`);
  if ((e.champ || 0) > equipesParChamp(saison) * (v.bats.champ || 0)) err.push('Trop d’équipes aux champs pour cette saison.');
  if ((e.atelier || 0) > (v.bats.atelier || 0)) err.push('Plus d’équipes que d’ateliers.');
  if ((e.bucheron || 0) > (v.bats.bucheron || 0)) err.push('Plus d’équipes que de bûcherons.');
  if ((e.carriere || 0) > (saison === 'Hiver' ? 0 : (v.bats.carriere || 0))) err.push('Trop d’équipes à la carrière (rien l’hiver).');
  if ((e.guet || 0) > (v.bats.guet ? 1 : 0)) err.push('Une seule équipe garde la tour, et il faut une tour.');
  // Coup de main
  if (d.coup) {
    if (tour < TOUR_VOL) err.push(`Pas de coup de main avant le tour ${TOUR_VOL}.`);
    if (!partie.villes.includes(d.coup.cible) || d.coup.cible === id) err.push('Coup de main : ville visée invalide.');
    if (!(d.coup.butin in BUTINS)) err.push('Coup de main : butin invalide.');
  }
  if (caisseApresDepot(v, d, saison) < 0) err.push('La caisse ne suffit pas.');
  return err;
}

// Équipes placées d'office pour une ville qui n'a rien rendu (décision de Tristan, 21/11 : pas de double sanction) :
// champs d'abord, puis quai, atelier, carrière (sauf l'hiver), bûcheron. Jamais la garde de la tour.
export function equipesDOffice(v, saison) {
  let n = equipesDe(v.hab);
  const e = {};
  const besoins = [['champ', equipesParChamp(saison) * (v.bats.champ || 0)], ['dech', v.quai.length],
    ['atelier', v.bats.atelier || 0], ['carriere', saison === 'Hiver' ? 0 : (v.bats.carriere || 0)], ['bucheron', v.bats.bucheron || 0]];
  besoins.forEach(([poste, b]) => { const x = Math.min(b, n); e[poste] = x; n -= x; });
  return e;
}

// --------------------------------------------------------------- résolution
// `decisions` : { [id]: décisions déposées | null (pas de dépôt) | 'sommeil' }.
// `carte` : clé de CARTES ou null ; `cible` : ville visée par une carte ciblée.
// Rend { partie (tour suivant), journal: { [id]: { ... } } }. L'ordre suit la fiche, § 12.
export function resoudreTour(partie0, decisions, { carte = null, cible = null } = {}) {
  const partie = structuredClone(partie0);
  const tour = partie.tour;
  const saison = saisonDu(tour);
  const E = partie.etat;
  const ids = partie.villes;
  const J = {};
  const D = {};
  ids.forEach((id) => {
    const dec = decisions[id];
    J[id] = { tour, saison, carte, vise: cible === id, evenements: [] };
    if (dec === 'sommeil') { D[id] = 'sommeil'; J[id].sommeil = true; return; }
    D[id] = dec ? { ...vide(), ...dec, equipes: { ...(dec.equipes || {}) } } : null;
    if (!dec) { J[id].sansDepot = true; J[id].equipesDOffice = equipesDOffice(E[id], saison); }
  });
  const actives = ids.filter((id) => D[id] !== 'sommeil');

  // 0. Correction des registres (photo au moment du dépôt, donc avant tout changement).
  actives.forEach((id) => {
    if (!D[id]) return;
    const c = corriger(partie, id, D[id]);
    J[id].registre = c;
  });

  // 1. Dépôt : ce qui se paie tout de suite. Relivraisons et restes du Marché placés au quai.
  const charrettesMarche = {};
  actives.forEach((id) => {
    const v = E[id]; const d = D[id];
    v.aRelivrer.forEach((x) => v.quai.push({ ...x, tour, origine: 'relivraison' }));
    v.aRelivrer = [];
    v.resteMarche.forEach((x) => {
      charrettesPour(x.q) && Array.from({ length: charrettesPour(x.q) }, (_, k) =>
        v.quai.push({ m: x.m, q: Math.min(CHARRETTE, x.q - k * CHARRETTE), tour, origine: 'reste' }));
      v.deniers -= charrettesPour(x.q) * COUT_CHARRETTE;     // CHOIX : le transport du reste se paie à sa livraison
    });
    v.resteMarche = [];
    charrettesMarche[id] = 0;
    if (!d) return;
    const iEcart = achatEnEcart(v, d.achats, tour, partie.ecart[id]);
    d.achats.forEach((a, i) => {
      v.deniers -= coutAchat(a, saison);
      const l = livrer(a, { tour, ecart: i === iEcart });
      l.charrettes.forEach((c) => v.quai.push({ ...c, achat: i }));
      if (l.reste > 0) v.resteMarche.push({ m: a.m, q: l.reste });
      if (i === iEcart) {
        v.ecartFait = true;
        J[id].ecart = { m: a.m, commande: a.q, manque: l.manque, reserve: !!d.reserve };
        if (d.reserve) v.aRelivrer.push({ m: a.m, q: l.manque });
      }
      charrettesMarche[id] += Math.max(0, a.charrettes || 0);
    });
    J[id].ventesBrutes = 0;
    d.ventes.forEach((a) => {
      const q = qVendue(a);
      v[a.m] -= q;
      v.deniers += recetteVente(a, saison);
      J[id].ventesBrutes += q * prix(a.m, saison);
      if (a.m === 'drap' && carte === 'foire') { v.deniers += q * (16 - 12); J[id].ventesBrutes += q * 4; }
      charrettesMarche[id] += Math.max(0, a.charrettes || 0);
    });
    d.chantiers.forEach((b) => {
      const B = BATIMENTS[b];
      v.deniers -= B.d; v.bois -= B.b; v.pierre -= B.p;
      v.enCours.push(b);
    });
    if (d.coup) v.deniers -= COUT_COUP;
  });

  // 2. Garde de la tour : solde payée.
  const garde = {};
  actives.forEach((id) => {
    garde[id] = !!D[id] && gardee(E[id], D[id]);
    if (garde[id]) { E[id].deniers -= SOLDE_GUET; J[id].garde = true; }
  });

  // 3. Coups de main sur l'impôt.
  const volsStock = {}; ids.forEach((id) => { volsStock[id] = []; });
  const volsImpot = [];
  if (tour >= TOUR_VOL) {
    actives.forEach((id) => {
      const d = D[id]; if (!d || !d.coup) return;
      const { cible: c, butin } = d.coup;
      if (D[c] === 'sommeil') { J[id].evenements.push({ type: 'coup-sans-cible', cible: c }); return; }
      if (butin === 'impot') {
        if (garde[c]) { E[id].rep -= REP_PRIS; J[id].coup = { cible: c, butin, pris: true }; J[c].evenements.push({ type: 'voleur-pris' }); }
        else volsImpot.push({ voleur: id, c });
      } else volsStock[c].push({ voleur: id, butin });
    });
  }

  // 5. Pour chaque ville, dans l'ordre de la fiche.
  const recus = {}; ids.forEach((id) => { recus[id] = []; });
  actives.forEach((id) => {
    const v = E[id]; const d = D[id] || vide(); const j = J[id];
    const e = D[id] ? d.equipes : j.equipesDOffice;
    // Déchargement : 1 équipe = 1 charrette, les plus anciennes d'abord. Route coupée : le bois et la pierre
    // achetés ce tour ne se déchargent pas (ils arrivent au tour suivant).
    let cap = e.dech || 0;
    const restent = [];
    const routeCoupee = carte === 'route_coupee' && cible === id;
    j.decharge = [];
    v.quai.forEach((c) => {
      const bloque = routeCoupee && c.tour === tour && c.origine === 'achat' && (c.m === 'bois' || c.m === 'pierre');
      if (cap > 0 && !bloque) { cap -= 1; v[c.m] += c.q; j.decharge.push(c); } else restent.push(c);
    });
    v.quai = restent;
    // Vols de pierre, grain, bois.
    volsStock[id].forEach(({ voleur, butin }) => {
      if (garde[id]) {
        E[voleur].rep -= REP_PRIS; J[voleur].coup = { cible: id, butin, pris: true }; j.evenements.push({ type: 'voleur-pris' });
        return;
      }
      const q = Math.min(BUTINS[butin], v[butin]);
      v[butin] -= q;
      J[voleur].coup = { cible: id, butin, pris: false, q };
      j.evenements.push({ type: 'vole', butin, q });
      for (let k = 0; k < charrettesPour(q); k++) recus[voleur].push({ m: butin, q: Math.min(CHARRETTE, q - k * CHARRETTE), origine: 'butin' });
    });
    // Production selon les équipes.
    let eqChamp = e.champ || 0; let recolte = 0;
    for (let k = 0; k < (v.bats.champ || 0); k++) {
      const n = Math.min(equipesParChamp(saison), eqChamp); eqChamp -= n;
      recolte += recolteParChamp(saison, carte, n);
    }
    const prod = { grain: recolte, bois: 20 * (e.bucheron || 0), pierre: saison === 'Hiver' ? 0 : 15 * (e.carriere || 0), drap: 8 * (e.atelier || 0) };
    MARCHANDISES.forEach((m) => { v[m] += prod[m]; });
    j.production = prod;
    // Consommation et effets de la carte.
    const bz = besoinGrain(v.hab, saison, carte);
    const manque = Math.max(0, bz - v.grain);
    v.grain = Math.max(0, v.grain - bz);
    j.consommation = bz;
    if (carte === 'rats') { const r = Math.floor(v.grain / 10); v.grain -= r; j.rats = r; }
    if (carte === 'incendie' && cible === id) {
      if (garde[id]) j.evenements.push({ type: 'incendie-evite' });
      else { const q = Math.min(30, v.bois); v.bois -= q; j.evenements.push({ type: 'incendie', q }); }
    }
    if (carte === 'commande' && cible === id && (e.atelier || 0) > 0) { v.deniers += 40; j.evenements.push({ type: 'commande' }); }
    // Débordements : la moitié de ce qui dépasse est perdue.
    const exc = Math.max(0, v.grain - v.capGrain);
    const perduGrain = Math.floor(exc / 2); v.grain -= perduGrain;
    const tot = v.bois + v.pierre + v.drap;
    const exc2 = Math.max(0, tot - v.capHalle);
    const perduHalle = {};
    if (exc2) ['bois', 'pierre', 'drap'].forEach((m) => { const q = Math.round(Math.floor(exc2 / 2) * v[m] / tot); v[m] -= q; perduHalle[m] = q; });
    j.debordement = { grain: perduGrain, ...perduHalle };
    // Famine ou croissance.
    if (manque) {
      const partis = Math.min(manque, Math.floor(v.hab / 3));
      v.hab -= partis; v.rep -= REP_FAMINE; v.famines += 1;
      j.famine = { manque, partis };
    } else {
      const avant = v.hab;
      v.hab = Math.min(v.log, v.hab + Math.floor(v.hab / 10));
      j.croissance = v.hab - avant;
    }
    // Chantiers achevés, sauf famine (ils restent payés et s'achèvent au premier tour sans famine).
    j.acheves = [];
    if (!manque) {
      v.enCours.forEach((b) => {
        v.bats[b] = (v.bats[b] || 0) + 1;
        if (b === 'grenier') v.capGrain += 150;
        if (b === 'halle') v.capHalle += 100;
        if (b === 'quartier') v.log += 40;
        if (b === 'choeur') v.rep += 3;
        j.acheves.push(b);
      });
      v.enCours = [];
    }
    // Impôt : habitants ÷ 5, moins 10 % des ventes du tour.
    j.impot = Math.floor(v.hab / 5);
    const taxe = Math.floor((j.ventesBrutes || 0) / 10);
    v.deniers += j.impot - taxe;
    j.taxe = taxe;
  });

  // 6. Vol de l'impôt.
  volsImpot.forEach(({ voleur, c }) => {
    const imp = J[c].impot; E[c].deniers -= imp; E[voleur].deniers += imp;
    J[voleur].coup = { cible: c, butin: 'impot', pris: false, q: imp };
    J[c].evenements.push({ type: 'vole', butin: 'impot', q: imp });
  });

  // 7. Péage de la Chancellerie : 3 deniers par charrette achetée ou vendue par une rivale, payés par le Seigneur.
  actives.forEach((id) => {
    if (!E[id].bats.chancellerie) return;
    const n = ids.filter((x) => x !== id).reduce((s, x) => s + (charrettesMarche[x] || 0), 0) * PEAGE;
    E[id].deniers += n; J[id].peage = n;
  });

  // 8. Le butin arrive au quai des voleurs.
  ids.forEach((id) => { recus[id].forEach((c) => E[id].quai.push({ ...c, tour })); });

  // 9. Bonus du registre, score.
  actives.forEach((id) => {
    if (J[id].registre && J[id].registre.juste) { E[id].bonus += BONUS_REGISTRE; J[id].bonusRegistre = true; }
  });
  ids.forEach((id) => { J[id].score = score(E[id]); });

  partie.historique.push({ tour, carte, cible });
  partie.tour = tour + 1;
  return { partie, journal: J };
}

// Carte de la saison : aucune au tour d'essai ni au tour 1 ; sinon la suivante du paquet (préparé ou mélangé).
export function tirerCarte(partie, r = Math.random) {
  if (partie.tour <= 1) return { carte: null, cible: null };
  const deja = partie.historique.filter((h) => h.carte).length;
  const carte = partie.paquet[deja % partie.paquet.length];
  const cible = CARTES[carte].cible ? partie.villes[Math.floor(r() * partie.villes.length)] : null;
  return { carte, cible };
}
