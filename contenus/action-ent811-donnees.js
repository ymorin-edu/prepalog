// ENT-8.11 — Action, « ranger à la bonne adresse » : les DONNÉES PURES de la séance (l'allée construite, ses plaques de charge, le stock de
// départ, les produits et leur colisage, le tirage des palettes par élève, l'entrepôt d'un élève pour le mode `palettier`, la fiche « Lire une
// adresse », les phrases du message à Kevin calculées sur CE QUE L'ÉLÈVE A CONFIÉ). Aucun effet de bord à l'import, aucune dépendance au
// navigateur : le contenu (`contenus/action-ent811.js`), les questions (`contenus/questions/ENT-8.11.js`), le corrigé
// (`contenus/corriges/ENT-8.11.js`) et les tests l'importent. Brief : `docs/briefs/ENT-8.11-action-ranger.md` ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-palettier.md` §3 (elles passent avant le brief là où elles diffèrent).
//
// VÉRIFIÉ (Cowork, 15 et 21/10/2026, brief §2) : l'entrepôt d'Action à Ensuès-la-Redonne, exploité par Geodis ; les catégories de produits
// d'Action (communiqué du 15/10/2020) dont viennent les huit produits ; le matériel roulant et l'informatique appartiennent à Action, Geodis
// fournit le personnel (Gomet') ; la catégorie 5 des CACES R489 = chariots à mât rétractable.
// CONSTRUIT (dit dans la séance, `MENTION_ALLEE`) : TOUT le stockage d'Ensuès — l'allée (allées A et B, 4 travées, 4 niveaux, 3 emplacements),
// les adresses, les plaques de charge (N2 1 500 kg, N3 1 200 kg, N4 1 000 kg ; le sol n'a pas de plaque, COORDINATION §3 n° 6), le stock de
// départ, les emplacements hors service ; les produits (désignations génériques, aucune marque), leur colisage et leurs poids ; le camion
// du jour ; l'usage d'un terminal à scanner ; la répartition opérateur / cariste. Samia (cheffe d'équipe, tutrice), Kevin (cariste) et Julie
// (agent administratif) sont construits (univers `contenus/action.js`) : aucun visage, aucune parole prêtée à un salarié réel.
//
// LE COLISAGE (COORDINATION §3 n° 14 : les données fixent les cartons de chaque produit) : une palette = un produit, toujours le même nombre de
// cartons ; poids = cartons × kg d'un carton + 25 kg de palette (le support), CALCULÉ ici et par la vue, jamais recopié.
//   LES 36 × 13 = 493 kg · NET 40 × 13 = 545 kg · CRO 32 × 12,5 = 425 kg · CAH 30 × 9 = 295 kg · SER 40 × 6 = 265 kg · BOU 60 × 3 = 205 kg ·
//   BOI 24 × 4 = 121 kg · PEL 24 × 3 = 97 kg. SEUIL « LOURDE » : 400 kg (les trois lourds du brief, et eux seuls, le dépassent).
//
// LE TIRAGE (par élève, graine = son identifiant + « |action-ranger », `tirerJeu` de `core/tirage.js`) : six produits DIFFÉRENTS — P5 parmi les
// lourds, P3 parmi les normaux ou légers, P1, P2, P4 et P6 parmi tous ; les adresses parmi les emplacements LIBRES du stock fixe :
//   P1 au sol (N1) de l'allée A, P2 au sol de l'allée B, P3 en N2 ou N3, P4 et P6 en N2 à N4, P5 en N3 ou N4 sur un niveau dont le stock
//   + P5 DÉPASSE la plaque, sa nouvelle adresse en N2 (elle est en hauteur : l'élève la CONFIE, COORDINATION §3 n° 14) ;
//   P3, P4, P6 et la nouvelle adresse de P5 sur QUATRE NIVEAUX DIFFÉRENTS, aucun sur le niveau de P5 : aucune palette de l'élève n'en
//   alourdit une autre, donc « P1 à P4 ne dépassent jamais » tient quel que soit l'ordre de ses gestes (s'il range à la bonne adresse).
// P6 (bonus du confirmé, `niveaux: ['confirme']`) est tirée pour TOUS (le moteur exige les mêmes palettes à tous les niveaux) et n'est montrée
// qu'au confirmé. ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : ne pas changer le tirage, le stock ou le colisage
// pendant qu'une classe joue la séance.

import { tirerJeu, graineDeBase, hasard, niveauEleve } from '../core/tirage.js';

export const ID = 'action-ranger';
export const ID_VOLET = 'action-ent811';
export const ENTREPOT_ID = 'action-ranger';      // les gestes publiés : `entrepot:action-ranger:<geste>`
export const FICHE_ID = 'adresse';
export const PHRASES_ID = 'kevin';
export const SUPPORT_KG = 25;
export const SEUIL_LOURDE = 400;
export const MAIL_DOMAINE = 'geodis-ensues.example';   // celui de l'univers (`contenus/action.js`, VOCAB.mailDomain)
export const KEVIN_MAIL = `kevin@${MAIL_DOMAINE}`;
export const SAMIA_MAIL = `samia@${MAIL_DOMAINE}`;
// Les sujets des messages (lus par `kevinMonte` et par les tests).
export const SUJETS = { accueil: 'Cet après-midi : le rangement', rack: 'Au rack !', signalement: 'Ton signalement', kevin: 'Des palettes pour moi ?',
  monte: 'Je monte', fin: 'Demain matin' };

// ─────────────────────────────────────────────────────────────── les produits (catégories réelles d'Action, désignations génériques)
export const PRODUITS = {
  LES: { nom: 'Lessive liquide 3 L', court: 'Lessive', carton: 'carton de 4 bidons de 3 L', categorie: 'entretien de la maison', kg: 13, cartons: 36, classe: 'lourd' },
  NET: { nom: 'Nettoyant multi-usages 1 L', court: 'Nettoyant', carton: 'carton de 12 flacons de 1 L', categorie: 'entretien de la maison', kg: 13, cartons: 40, classe: 'lourd' },
  CRO: { nom: 'Croquettes pour chien 4 kg', court: 'Croquettes', carton: 'carton de 3 sacs de 4 kg', categorie: 'animaux', kg: 12.5, cartons: 32, classe: 'lourd' },
  CAH: { nom: 'Cahiers grand format', court: 'Cahiers', carton: 'carton de 20 cahiers', categorie: 'bureau et loisirs créatifs', kg: 9, cartons: 30, classe: 'normal' },
  SER: { nom: 'Serviettes de bain', court: 'Serviettes', carton: 'carton de 10 serviettes', categorie: 'mode et linge de maison', kg: 6, cartons: 40, classe: 'normal' },
  BOU: { nom: 'Bougies parfumées', court: 'Bougies', carton: 'carton de 12 bougies', categorie: 'décoration', kg: 3, cartons: 60, classe: 'leger' },
  BOI: { nom: 'Boîtes de rangement 10 L', court: 'Boîtes', carton: 'carton de 6 boîtes', categorie: 'articles ménagers', kg: 4, cartons: 24, classe: 'leger' },
  PEL: { nom: 'Peluches', court: 'Peluches', carton: 'carton de 12 peluches', categorie: 'jouets et loisirs', kg: 3, cartons: 24, classe: 'leger' },
};
export const CODES = Object.keys(PRODUITS);
export const LOURDS = CODES.filter((k) => PRODUITS[k].classe === 'lourd');
export const NON_LOURDS = CODES.filter((k) => PRODUITS[k].classe !== 'lourd');
// Le poids d'une palette pleine d'un produit (cartons × kg + 25), arrondi au centième comme la vue.
export const poidsDe = (k) => Math.round((PRODUITS[k].cartons * PRODUITS[k].kg + SUPPORT_KG) * 100) / 100;
export const estLourde = (k) => poidsDe(k) >= SEUIL_LOURDE;

// ─────────────────────────────────────────────────────────────── l'allée (construite)
export const COTES = ['A1', 'A2', 'B1', 'B2'];
export const PLAQUES = { 2: 1500, 3: 1200, 4: 1000 };   // charge max d'UN niveau ; le sol (N1) n'en a pas
export const HORS_SERVICE = ['B1-T01-N2-E1', 'A2-T04-N3-E2'];
export const PLAN = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
  cotes: Object.fromEntries(COTES.map((c) => [c, { charge: { ...PLAQUES } }])),
  travees: 4, niveaux: 4, emplacements: 3,
  horsService: HORS_SERVICE.slice(),
  zones: { quais: ['QUAI 2'] },
};
const z2 = (n) => String(n).padStart(2, '0');
export const adresse = (c, t, n, e) => `${c}-T${z2(t)}-N${n}-E${e}`;
export const decoupe = (a) => { const m = /^([AB]\d)-T(\d+)-N(\d)-E(\d)$/.exec(String(a || '')); return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null; };
export const niveauDe = (a) => { const d = decoupe(a); return d ? `${d.c}-T${z2(d.t)}-N${d.n}` : ''; };
export const TOUTES = COTES.flatMap((c) => [1, 2, 3, 4].flatMap((t) => [1, 2, 3, 4].flatMap((n) => [1, 2, 3].map((e) => adresse(c, t, n, e)))));

// LE STOCK DE DÉPART : le même pour toute la classe, fabriqué par une règle fixe (graine constante), environ la moitié des emplacements occupés.
// Au sol, des palettes de picking de tous les produits ; en N3 et N4, environ un niveau sur trois porte DEUX palettes lourdes (de quoi faire
// dépasser la plaque à P5) ; les autres niveaux portent 0 à 2 palettes normales ou légères.
function fabriquerStock() {
  const H = hasard('action-ent811|stock');
  const S = {};
  COTES.forEach((c) => [1, 2, 3, 4].forEach((t) => [1, 2, 3, 4].forEach((n) => {
    if (n === 1) { [1, 2, 3].forEach((e) => { const k = H.choisir(CODES); if (H.reel() < 0.55) S[adresse(c, t, n, e)] = k; }); return; }
    if (n >= 3 && H.reel() < 0.4) {
      // Deux palettes lourdes dont la somme reste SOUS la plaque (un rack n'est jamais déjà surchargé) ; avec la plus légère des lourdes
      // (425 kg) en plus, elle la dépasse toujours (N3 : 850 + 425 > 1 200 ; N4 : 850 + 425 > 1 000).
      const libre = H.entier(1, 3);
      let paire;
      do { paire = [H.choisir(LOURDS), H.choisir(LOURDS)]; } while (poidsDe(paire[0]) + poidsDe(paire[1]) > PLAQUES[n]);
      [1, 2, 3].filter((e) => e !== libre).forEach((e, i) => { S[adresse(c, t, n, e)] = paire[i]; });
      return;
    }
    H.prendre([1, 2, 3], H.entier(0, 2)).forEach((e) => { S[adresse(c, t, n, e)] = H.choisir(NON_LOURDS); });
  })));
  HORS_SERVICE.forEach((a) => { delete S[a]; });
  return Object.fromEntries(Object.entries(S).map(([a, k]) => [a, { produit: k, kg: poidsDe(k) }]));
}
export const STOCK = fabriquerStock();
// La charge que le stock de départ met sur le niveau de `a` (côté, travée, niveau).
export const chargeStock = (a) => { const n = niveauDe(a); return Object.entries(STOCK).filter(([x]) => niveauDe(x) === n).reduce((t, [, s]) => t + s.kg, 0); };
export const plaqueDe = (a) => PLAQUES[decoupe(a).n];
export const libre = (a) => !STOCK[a] && !HORS_SERVICE.includes(a);
const allee = (a) => decoupe(a).c[0];

/* ================================================================== le tirage des palettes */
// Les rôles (brief §6.3) : P1, P2 au sol ; P3, P4 pour Kevin ; P5 à signaler (nouvelle adresse en N2, à confier) ; P6 bonus du confirmé.
export const ROLES = { P1: 'sol', P2: 'sol', P3: 'reserve', P4: 'reserve', P5: 'signaler', P6: 'bonus' };
const tient = (a, k) => chargeStock(a) + poidsDe(k) <= plaqueDe(a) + 1e-9;
const depasse = (a, k) => chargeStock(a) + poidsDe(k) > plaqueDe(a) + 1e-9;
const libresOu = (filtre) => TOUTES.filter((a) => libre(a) && filtre(decoupe(a)));
function tirer(h) {
  const pris = new Set();
  const prendreProduit = (liste) => { const k = h.choisir(liste.filter((x) => !pris.has(x))); pris.add(k); return k; };
  const produit = { P5: prendreProduit(LOURDS), P3: prendreProduit(NON_LOURDS) };
  ['P1', 'P2', 'P4', 'P6'].forEach((id) => { produit[id] = prendreProduit(CODES); });
  const niveauxPris = new Set();
  const choisirA = (cands) => { const a = h.choisir(cands); if (!a) throw new Error('aucune adresse'); niveauxPris.add(niveauDe(a)); return a; };
  const ad = {};
  ad.P1 = h.choisir(libresOu((d) => d.n === 1 && d.c[0] === 'A'));
  ad.P2 = h.choisir(libresOu((d) => d.n === 1 && d.c[0] === 'B'));
  ad.P5 = choisirA(libresOu((d) => d.n >= 3).filter((a) => depasse(a, produit.P5)));
  const haut = (id, niveaux) => choisirA(libresOu((d) => niveaux.includes(d.n)).filter((a) => !niveauxPris.has(niveauDe(a)) && tient(a, produit[id])));
  const nouvelle = haut('P5', [2]);
  ad.P3 = haut('P3', [2, 3]);
  ad.P4 = haut('P4', [2, 3, 4]);
  ad.P6 = haut('P6', [2, 3, 4]);
  return { produit, adresse: ad, nouvelle };
}
// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré). Rejouées sur 200 graines par le bloc de tests.
export function verifier(jeu) {
  const f = [];
  if (!jeu || !jeu.produit || !jeu.adresse) return ['jeu incomplet'];
  const ids = Object.keys(ROLES);
  const P = jeu.produit, A = jeu.adresse;
  if (ids.some((id) => !PRODUITS[P[id]])) return ['produit inconnu'];
  if (new Set(ids.map((id) => P[id])).size !== ids.length) f.push('deux palettes du même produit');
  if (!LOURDS.includes(P.P5)) f.push('P5 n’est pas lourde');
  if (LOURDS.includes(P.P3)) f.push('P3 est lourde');
  const toutes = [...ids.map((id) => A[id]), jeu.nouvelle];
  if (toutes.some((a) => !decoupe(a) || !libre(a))) f.push('une adresse inconnue, occupée ou hors service');
  if (new Set(toutes).size !== toutes.length) f.push('deux palettes à la même adresse');
  const d = (a) => decoupe(a) || {};
  if (d(A.P1).n !== 1 || allee(A.P1) !== 'A') f.push('P1 pas au sol de l’allée A');
  if (d(A.P2).n !== 1 || allee(A.P2) !== 'B') f.push('P2 pas au sol de l’allée B');
  if (![2, 3].includes(d(A.P3).n)) f.push('P3 pas en N2 ou N3');
  if (![2, 3, 4].includes(d(A.P4).n) || ![2, 3, 4].includes(d(A.P6).n)) f.push('P4 ou P6 pas en réserve');
  if (![3, 4].includes(d(A.P5).n)) f.push('P5 pas en N3 ou N4');
  if (d(jeu.nouvelle).n !== 2) f.push('nouvelle adresse de P5 pas en N2');
  if (f.length) return f;
  if (!depasse(A.P5, P.P5)) f.push('P5 ne dépasse pas la plaque à son adresse');
  if (chargeStock(A.P5) > plaqueDe(A.P5)) f.push('le niveau de P5 dépasse déjà sa plaque sans elle');
  if (!tient(jeu.nouvelle, P.P5)) f.push('P5 dépasse à sa nouvelle adresse');
  ['P3', 'P4', 'P6'].forEach((id) => { if (!tient(A[id], P[id])) f.push(`${id} dépasse la plaque`); });
  const hauts = [A.P3, A.P4, A.P6, jeu.nouvelle].map(niveauDe);
  if (new Set(hauts).size !== 4) f.push('deux palettes en réserve sur le même niveau');
  if (hauts.includes(niveauDe(A.P5))) f.push('une palette sur le niveau de P5');
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-action-ent811').jeu;
if (!DECL.secours) throw new Error('ENT-8.11 : le tirage ne donne aucun jeu conforme (tirer et verifier se contredisent)');
export const TIRAGE = DECL;

const jeux = new Map();
// Le jeu d'une graine (l'identifiant de l'élève ; '' : le jeu de référence, vu par l'enseignant), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

// Les palettes d'un jeu, au format du mode `palettier` (kg : UN carton ; la vue calcule le poids).
export function palettesDuJeu(jeu) {
  return Object.keys(ROLES).map((id) => {
    const k = jeu.produit[id], P = PRODUITS[k];
    const p = { id, nom: P.nom, cartons: P.cartons, kg: P.kg, adresse: jeu.adresse[id] };
    if (id === 'P5') p.nouvelleAdresse = jeu.nouvelle;
    if (id === 'P6') p.niveaux = ['confirme'];
    return p;
  });
}

/* ================================================================== l'entrepôt d'un élève (lot 0 : fonction de la graine) */
// KEVIN MONTE quand il a répondu au message de l'élève (« OK, je monte ça tout de suite. ») : son message est dans la base. Relu par la vue à
// chaque dessin (`cariste.monte`).
// Un rangement VALIDÉ avant sa réponse (rien n'était monté à « Valider », `monteesValidation` vide) reste tel quel : ses palettes restent « à monter »
// (le jalon `place-` les compte non rangées ; l'écran le montre aussi).
export function kevinMonte(db) {
  const repondu = ((db && db.mails) || []).some((m) => m && m.folder === 'in' && m.fromMail === KEVIN_MAIL && m.subject === SUJETS.monte);
  const e = db && db.entrepots && db.entrepots[ENTREPOT_ID];
  return repondu && !(e && e.valide && Array.isArray(e.monteesValidation) && !e.monteesValidation.length);
}
export const CONSIGNE_PLAN = 'Range les palettes de la réception.';   // neutre (§6 bis) : ni combien, ni qu'une est à signaler
export const REGLES = {
  titre: 'Les règles',
  entete: 'Ranger à l’adresse donnée',
  lignes: [
    'L’<b>adresse</b> est sur l’étiquette de la palette : allée et côté, travée, niveau, emplacement.',
    '<b>Niveau 1, au sol</b> (le picking) : tu poses toi-même.',
    '<b>Au-dessus du sol</b> (la réserve) : tu regardes la plaque de charge, puis tu <b>confies</b> la palette à Kevin.',
    'Tu ne peux pas ranger à l’adresse (occupée, charge dépassée, emplacement abîmé) : tu <b>signales</b>.',
    'Toujours <b>scanner</b> : la palette, puis l’emplacement.',
    'Avant de valider : <b>Faire monter les palettes</b>, puis réponds à Kevin. Une palette pas montée ne compte pas comme rangée.',
  ],
};
// La déclaration de l'élève (graine, niveau). Accompagné : la somme de charge faite (« déjà posé + ta palette ») et, après « Valider »,
// l'adresse attendue ; standard et confirmé : la plaque et le « déjà posé » (guidage, décision de Tristan). « Les règles » dépliées au départ, sauf
// au confirmé. Aucune copie (guidage).
export function entrepotDe(graine, { niveau = 'standard' } = {}) {
  const jeu = jeuDe(graine);
  const accompagne = niveau === 'accompagne';
  return {
    id: ENTREPOT_ID, libelle: 'Plan de l’entrepôt', mode: 'palettier',
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'mardi, 13 h 30', texte: CONSIGNE_PLAN },
    plan: PLAN,
    produits: Object.fromEntries(CODES.map((k) => [k, { nom: PRODUITS[k].nom, court: PRODUITS[k].court }])),
    stock: STOCK,
    palettes: palettesDuJeu(jeu),
    cariste: { nom: 'Kevin', niveaux: [2, 3, 4], monte: kevinMonte },
    aideCharge: accompagne ? 'somme' : 'pose',
    verdict: accompagne ? 'adresse' : 'critere',
    terminal: { nom: 'Terminal' },
    // « Les règles ▾ » dépliées au chargement (guidage) pour le standard et l'accompagné ; repliées au confirmé.
    regles: niveau === 'confirme' ? REGLES : { ...REGLES, ouvertes: true },
  };
}

/* ================================================================== la fiche « Lire une adresse » (brief §4, étape 1 ; §6 bis) */
// Une adresse tirée parmi 8 ; dans chacune, niveau, travée et emplacement sont trois chiffres différents (aucune confusion entre deux réponses).
export const BANQUE_ADRESSES = ['B2-T03-N2-E1', 'A1-T04-N3-E2', 'A2-T01-N4-E3', 'B1-T02-N3-E1', 'A1-T03-N4-E2', 'B2-T01-N2-E3', 'A2-T02-N4-E1', 'B1-T04-N2-E3'];
export const ordinal = (n, f = false) => (n === 1 ? (f ? '1re' : '1er') : `${n}e`);
export const adresseFiche = (db) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|fiche`).choisir(BANQUE_ADRESSES) : BANQUE_ADRESSES[0]; };
// Les trois lignes de la fiche pour une adresse : libellé, choix (le juste en premier : `juste`), ce que dit « Il manque ».
export function lignesFiche(a) {
  const d = decoupe(a), A = d.c[0], c = d.c[1];
  return [
    { id: 'cote', lib: `${d.c} : c’est…`, manque: `ce que veut dire ${d.c}`, juste: 'cote',
      choix: [{ v: 'cote', lib: `l’allée ${A}, côté ${c}` }, { v: 'emplacement', lib: `l’emplacement ${c}` }, { v: 'niveau', lib: `le niveau ${c}` }] },
    { id: 'travee', lib: `T${z2(d.t)} : c’est…`, manque: `ce que veut dire T${z2(d.t)}`, juste: 'travee',
      choix: [{ v: 'travee', lib: `la ${ordinal(d.t, true)} travée de l’allée` }, { v: 'niveau', lib: `le niveau ${d.t}` }, { v: 'quai', lib: `le quai ${d.t}` }] },
    { id: 'niveau', lib: `N${d.n} : c’est…`, manque: `ce que veut dire N${d.n}`, juste: 'niveau',
      choix: [{ v: 'niveau', lib: `le ${ordinal(d.n)} niveau, au-dessus du sol` }, { v: 'sol', lib: 'le sol' }, { v: 'emplacement', lib: `le ${ordinal(d.n)} emplacement` }] },
  ];
}
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };

/* ================================================================== la question `q-adresse` et `q-plaque` (valeurs tirées) */
// `q-adresse` : une adresse de la banque, autre que celle de la fiche et que celles des palettes de l'élève, dont le chiffre du côté n'est pas
// celui du niveau (« Que veut dire le 3 ? » n'a qu'une réponse).
export function adresseQuestion(db) {
  const jeu = jeuDeBase(db), fiche = adresseFiche(db);
  const siennes = new Set([...Object.values(jeu.adresse), jeu.nouvelle]);
  const L = BANQUE_ADRESSES.filter((a) => a !== fiche && !siennes.has(a) && Number(decoupe(a).c[1]) !== decoupe(a).n);
  const g = graineDeBase(db);
  return g ? hasard(`${g}|${ID}|q-adresse`).choisir(L) : L[0];
}
// `q-plaque` : une plaque, un « déjà posé » et une palette TIRÉS (multiples de 50, jamais le poids d'une palette de l'élève), qui dépassent.
export function valeursPlaque(db) {
  const g = graineDeBase(db), h = hasard(`${g || 'reference'}|${ID}|q-plaque`);
  const plaque = h.choisir([800, 1000, 1200]);
  const deja = h.choisir([300, 400, 500]);
  const palette = plaque - deja + 50 * h.entier(1, 4);
  return { plaque, deja, palette };
}

/* ================================================================== les phrases du message à Kevin (brief §6.4), calculées */
const lister = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
export const demande = (L) => (L.length ? `peux-tu monter ${lister(L.map((p) => `${p.id} en ${p.adresse}`))} ?` : 'je n’ai pas de palette à monter pour toi.');
// Une autre adresse : le même niveau, l'emplacement voisin.
const voisine = (a) => { const d = decoupe(a); return d ? adresse(d.c, d.t, d.n, d.e === 3 ? 2 : d.e + 1) : a; };
// `L` : les palettes que l'élève a confiées ([{ id, nom, adresse }], `palettesConfiees`) ; `ids` : toutes ses palettes. La juste dit ce qu'il
// a confié (une erreur ne se paie qu'une fois : cette ligne n'est pas notée) ; les pièges : une autre palette, une autre adresse.
export function choixDemande(L, ids = ['P1', 'P2', 'P3', 'P4', 'P5']) {
  if (!L.length) return [demande([]), demande([{ id: 'P1', adresse: 'A1-T01-N2-E1' }]), demande([{ id: 'P2', adresse: 'B2-T02-N3-E2' }])];
  const autre = ids.find((id) => !L.some((p) => p.id === id)) || 'P1';
  const C = [demande(L), demande([{ ...L[0], id: autre }, ...L.slice(1)]), demande([{ ...L[0], adresse: voisine(L[0].adresse) }, ...L.slice(1)])];
  return [...new Set(C)];
}
export const SALUTATIONS = ['Bonjour Kevin,', 'Yo Kevin,', 'Kevin !'];
export const POLITESSES = ['Merci !', 'Vite.', 'Dépêche.'];
export const finsDe = (prenom) => [prenom, 'Bisous'];

/* ================================================================== aides de lecture (contenu, questions, corrigé, tests) */
export const niveauDeBase = (db) => niveauEleve(db);
export const PALETTES_IDS = Object.keys(ROLES);
// Le nom complet d'un geste publié par le plan d'entrepôt (`entrepot:action-ranger:<geste>`).
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;
// Vraie dès que l'une des conditions l'est ; garde les gestes cités (le moteur les contrôle au chargement), comme `tous` de
// `core/declencheurs.js`, qui n'a pas de « ou ».
export function unDe(...conditions) {
  const f = (db, seance) => conditions.some((c) => c(db, seance));
  f.gestes = conditions.flatMap((c) => (c && Array.isArray(c.gestes) ? c.gestes : []));
  return f;
}
// Le geste `nom` est-il rangé dans la base (une fois, avec son heure) ?
export const gesteFait = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Les palettes LOURDES de l'élève (seuil 400 kg) : `q-plaque` arrive quand l'une d'elles est posée ou confiée.
export const lourdesDe = (db) => { const j = jeuDeBase(db); return PALETTES_IDS.filter((id) => estLourde(j.produit[id])); };
export const MENTION_ALLEE = 'L’allée, les adresses et les plaques de charge sont construites pour l’exercice : Action et Geodis ne publient pas l’organisation de l’entrepôt d’Ensuès.';
