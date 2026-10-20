// ENT-8.10 — Action, évaluation « recevoir un camion dans un nouveau site » : les DONNÉES PURES de la séance (site de l’élève, équipe, protocole
// du quai 3 par site, banque des situations, anomalie de la scène, palettes du camion de décoration et leurs anomalies, dialogue de Thomas,
// phrase « ma réception » calculée sur ce que l’élève a décidé au quai). Aucun effet de bord à l’import, sauf les CONTRÔLES (la séance refuse de
// s’ouvrir si une situation a deux consignes qui s’appliquent, ou si le tirage des palettes ne donne aucun jeu conforme). Importé par le contenu
// (`contenus/action-ent810.js`), les questions (`contenus/questions/ENT-8.10.js`) et le corrigé (`contenus/corriges/ENT-8.10.js`).
// Brief `docs/briefs/ENT-8.10-action-evaluation-reception.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8.2 et §8.5 bis.
//
// SÉANCES CLOISONNÉES : aucun import d’un fichier d’une autre séance. Les deux sites et le tirage du site (fonction pure de l’identifiant de
// l’élève : le MÊME site qu’en ENT-8.5 et 8.6) viennent de `contenus/action-eval-sites.js` (module partagé, lu sans rien y changer) ; les
// collègues du site, la banque des situations (ENT-8.7), les cinq objets de la scène (ENT-8.7), le tirage des anomalies des palettes (ENT-8.8) et
// le contrôle des situations (ENT-8.7) sont RECOPIÉS ici.
//
// VÉRIFIÉ (brief ENT-8.5 §2, recherche de Cowork) : Onnaing (59), exploité par GXO ; Belleville-en-Beaujolais (69), exploité par Kuehne+Nagel.
// CONSTRUIT (dit dans la séance, `MENTION`) : les collègues (Onnaing : Karim, Léo, Manon ; Belleville : Sandrine, Hugo, Chloé — brief ENT-8.6 §11),
// le protocole du quai 3 de chaque site (d’après l’article R4515-6 du Code du travail : consignes, vitesses, postes d’urgence, lieux INVENTÉS ;
// textes écrits par Claude Code le 17/10/2026, aucune consigne juste identique mot pour mot à celles d’ENT-8.7), le chauffeur Thomas et ses
// répliques (écrites par Claude Code, aucune bonne réponse identique à ENT-8.7), le fournisseur (« un fournisseur de décoration »), le
// transporteur (sans nom), les 4 palettes du camion (désignations génériques, références « DEC- », quantités), les anomalies, le n° du bon de
// livraison, les lots.
//
// ⚠ Le jeu d’un élève est une fonction de son identifiant ET de ce fichier : ne rien changer aux banques, aux listes ni aux formules pendant
// qu’une classe passe l’évaluation (le jeu des élèves changerait).

import { declarerTirage, hasard, tirerJeu, graineDeBase } from '../core/tirage.js';
import { siteDe, siteDeBase, SITES, SITE_DEFAUT } from './action-eval-sites.js';

export const ID = 'action-evaluation-reception';
export const ID_VOLET = 'action-ent810';
export const QUAI_ID = 'action-quai-evaluation';      // un id de quai par séance (COORDINATION §8.2 n° 2) : `db.quais` n’est pas cloisonné par séance
export const FICHE_ID = 'protocole-810';
export const DIALOGUE = 'thomas';
export const PHRASES_ID = 'compte-rendu-810';
export const DOCUMENT = 'Bon de livraison — lettre de voiture';
export const BL_NUMERO = 'DEC-1301-03';                 // CONSTRUIT
export const QUAI_NUM = 3, QUAI_VOISIN = 4;

// ─────────────────────────────────────────────────────────────── le site et l’équipe de l’élève
export const siteEleve = (db) => siteDeBase(db, ID);
// Le site d’une graine (l’identifiant de l’élève, `db.tirage.graine`) : le même que `siteDeBase` (graine du tirage sans « |<séance> »).
export const siteDeGraine = (g) => SITES[siteDe(g)] || SITES[SITE_DEFAUT];
// Les collègues, par site (CONSTRUITS, brief ENT-8.6 §11 ; recopiés d’ENT-8.6).
export const COLLEGUES = { onnaing: { cariste: 'Léo', agent: 'Manon' }, belleville: { cariste: 'Hugo', agent: 'Chloé' } };
const sansAccent = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export function equipeDe(S) {
  const C = COLLEGUES[S.id] || COLLEGUES.onnaing;
  const dom = S.tuteur.mail.split('@')[1];
  const chef = S.tuteur.fonction.replace(/ à la réception$/, '');
  return { tuteur: S.tuteur.prenom, chef, leChef: S.id === 'belleville' ? 'la cheffe d’équipe' : 'le chef d’équipe',
    cariste: C.cariste, agent: C.agent, mailTuteur: S.tuteur.mail, mailAgent: `${sansAccent(C.agent)}@${dom}` };
}

// ─────────────────────────────────────────────────────────────── le protocole du quai 3, PAR SITE (tout CONSTRUIT)
// Les détails propres à chaque site : vitesse dans la cour, poste d’urgence, où est le local chauffeurs (dit aussi par la bonne réponse de
// l’attente au dialogue), qui signe pour le site.
export const DETAILS = {
  onnaing: { vitesse: 15, poste: 300, local: 'au bout de l’allée piétonne', site: 'entrepôt Action d’Onnaing' },
  belleville: { vitesse: 20, poste: 600, local: 'à gauche des quais', site: 'entrepôt Action de Belleville-en-Beaujolais' },
};
// Les consignes : un texte (fonction du site) et `applique` = les situations de la banque auxquelles elle S’APPLIQUE (table recopiée d’ENT-8.7 :
// elle sert au contrôle, une seule consigne qui s’applique parmi les choix d’une situation).
export const CONSIGNES_810 = {
  'c-epi': { rub: 'securite', texte: () => 'Sur le quai, tout le monde porte gilet haute visibilité et chaussures de sécurité, chauffeur aussi.', applique: ['s-gilet'] },
  'c-immobile': { rub: 'securite', texte: () => 'Avant de décharger : moteur coupé, clés au réceptionnaire, cale contre la roue.', applique: ['s-partir'] },
  'c-entrer': { rub: 'securite', texte: () => 'On n’entre dans la remorque qu’avec le niveleur posé et la lampe allumée.', applique: [] },
  'c-gerbage': { rub: 'securite', texte: () => 'Jamais une palette sur une autre en zone de réception.', applique: [] },
  'c-vitesse': { rub: 'acces', texte: (S) => `Dans la cour, on roule à ${DETAILS[S.id].vitesse} km/h au plus.`, applique: ['s-vitesse'] },
  'c-butoirs': { rub: 'acces', texte: () => 'Le camion se met à quai en marche arrière, jusqu’aux butoirs.', applique: [] },
  'c-pietons': { rub: 'acces', texte: () => 'À pied, on circule seulement dans l’allée piétonne.', applique: ['s-pieton'] },
  'c-attente': { rub: 'acces', texte: (S) => `Pendant le déchargement et le contrôle, le chauffeur attend au local chauffeurs, ${DETAILS[S.id].local}.`, applique: ['s-partir', 's-aider', 's-gilet'] },
  'c-depart': { rub: 'acces', texte: () => 'Le chauffeur repart seulement quand les documents sont signés.', applique: ['s-partir'] },
  'c-chariot': { rub: 'engins', texte: (S) => `Déchargement au chariot frontal, par un cariste qui a le CACES R489 catégorie 3 et l’autorisation de ${S.prestataire}.`, applique: ['s-aider'] },
  'c-chauffeur': { rub: 'engins', texte: () => 'Le chauffeur ne participe pas au déchargement.', applique: ['s-aider'] },
  'c-sst': { rub: 'secours', texte: (S) => `En cas d’accident : appeler le sauveteur secouriste du travail (SST) de l’équipe et prévenir ${equipeDe(S).leChef}.`, applique: ['s-blesse'] },
  // Le poste d’urgence et la trousse tiennent sur une ligne (le protocole doit tenir à l’écran sans défiler, 1366 × 768).
  'c-urgence': { rub: 'secours', texte: (S) => `Urgence : poste ${DETAILS[S.id].poste} ; trousse au bureau de la réception.`, applique: ['s-blesse'] },
  'c-rassemblement': { rub: 'secours', texte: () => 'Évacuation : rassemblement à côté du poste de garde.', applique: [] },
  'c-responsable': { rub: 'responsable', texte: (S) => `${S.tuteur.prenom}, ${S.tuteur.fonction}.`, applique: ['s-responsable', 's-aerosols'] },
  'c-aerosols': { rub: 'produits', texte: (S) => `Produits inflammables (aérosols…) : le transporteur prévient, ${equipeDe(S).leChef} décide des précautions.`, applique: ['s-aerosols'] },
};
export const texteConsigne = (id, S) => CONSIGNES_810[id].texte(S);
const parRub = (rub, S) => Object.keys(CONSIGNES_810).filter((k) => CONSIGNES_810[k].rub === rub).map((id) => ({ id, texte: texteConsigne(id, S) }));
// La spec du protocole du quai 3 d’un site (forme : en-tête de `protocoleSecurite`, `contenus/action.js`).
export function specProtocole(S) {
  return {
    exploitant: S.prestataire,
    site: DETAILS[S.id].site,
    quai: QUAI_NUM, quais: 4, vitesse: DETAILS[S.id].vitesse,
    transporteur: 'celui du fournisseur',
    provenance: 'décoration, livraisons répétitives',
    etabli: 'Établi avant la première livraison.',
    consignes: {
      securite: parRub('securite', S), acces: parRub('acces', S), engins: parRub('engins', S), secours: parRub('secours', S),
      responsable: { id: 'c-responsable', texte: texteConsigne('c-responsable', S) }, produits: parRub('produits', S),
    },
    signatures: [{ pour: S.prestataire, qui: 'responsable du site' }, { pour: 'le transporteur', qui: 'gérant' }],
  };
}

// ─────────────────────────────────────────────────────────────── la banque « situations » (recopiée d’ENT-8.7 ; le cariste est celui du site)
// JAMAIS de pièce supprimée ni renumérotée (banque figée par le bloc `tirage-niveaux`). `{cariste}` est rempli par `texteSituation`.
export const BANQUE_SITUATIONS = [
  { id: 's-pieton', difficulte: 'facile', texte: 'Un collègue à pied traverse devant le quai pendant que {cariste} décharge.', juste: 'c-pietons', choix: ['c-pietons', 'c-vitesse', 'c-gerbage'] },
  { id: 's-aider', difficulte: 'facile', texte: 'Le chauffeur propose d’aider {cariste} avec son transpalette.', juste: 'c-chauffeur', choix: ['c-chauffeur', 'c-pietons', 'c-gerbage'] },
  { id: 's-vitesse', difficulte: 'facile', texte: 'Un camion entre dans la cour à vive allure.', juste: 'c-vitesse', choix: ['c-vitesse', 'c-butoirs', 'c-epi'] },
  { id: 's-partir', difficulte: 'moyen', texte: 'Le chauffeur veut repartir avant la fin du contrôle.', juste: 'c-depart', choix: ['c-depart', 'c-vitesse', 'c-chauffeur', 'c-gerbage'] },
  { id: 's-blesse', difficulte: 'moyen', texte: '{cariste} se coince la main en descendant du chariot.', juste: 'c-sst', choix: ['c-sst', 'c-chariot', 'c-epi', 'c-gerbage'] },
  { id: 's-gilet', difficulte: 'moyen', texte: 'Le chauffeur descend de sa cabine sans gilet.', juste: 'c-epi', choix: ['c-epi', 'c-vitesse', 'c-chauffeur', 'c-butoirs'] },
  { id: 's-responsable', difficulte: 'difficile', texte: 'Le chauffeur demande qui commande le quai.', juste: 'c-responsable', choix: ['c-responsable', 'c-chariot', 'c-chauffeur', 'c-vitesse'] },
  { id: 's-aerosols', difficulte: 'difficile', texte: 'Le chauffeur dit qu’une palette contient des aérosols.', juste: 'c-aerosols', choix: ['c-aerosols', 'c-gerbage', 'c-epi', 'c-chariot'] },
];
export const texteSituation = (s, S) => s.texte.replace(/\{cariste\}/g, equipeDe(S).cariste);
export const choixDe = (s, S) => s.choix.map((c) => ({ v: c, lib: texteConsigne(c, S) }));

// LE CONTRÔLE de la banque (recopié d’ENT-8.7) : 3 ou 4 choix distincts, tous des consignes du protocole, la juste parmi eux, et UNE SEULE
// consigne de ses choix qui s’applique au cas (la juste).
export function ecartsSituations(B = BANQUE_SITUATIONS, C = CONSIGNES_810) {
  const E = [];
  B.forEach((s) => {
    if (!Array.isArray(s.choix) || s.choix.length < 3 || s.choix.length > 4) E.push(`${s.id} : ${s.choix && s.choix.length} choix au lieu de 3 ou 4`);
    if (new Set(s.choix).size !== s.choix.length) E.push(`${s.id} : deux choix identiques`);
    s.choix.forEach((c) => { if (!C[c]) E.push(`${s.id} : la consigne « ${c} » n’est pas dans le protocole`); });
    if (!s.choix.includes(s.juste)) E.push(`${s.id} : la consigne juste n’est pas parmi les choix`);
    const sapplique = s.choix.filter((c) => C[c] && C[c].applique.includes(s.id));
    if (sapplique.length !== 1 || sapplique[0] !== s.juste) E.push(`${s.id} : ${sapplique.length} consigne(s) qui s’appliquent parmi les choix (${sapplique.join(', ')}) au lieu de la seule juste`);
  });
  return E;
}
{ const E = ecartsSituations(); if (E.length) throw new Error(`ENT-8.10 : la fiche du protocole ne tient pas — ${E.join(' ; ')}`); }

// Le tirage mémorisé des situations (ni bonus ni niveau : évaluation).
export const TIRAGE = declarerTirage({
  banques: { situations: { pieces: BANQUE_SITUATIONS, melange: { facile: 1, moyen: 1, difficile: 1 }, ordre: 'melange' } },
});
TIRAGE.lier(ID);
const parId = (id) => BANQUE_SITUATIONS.find((p) => p.id === id);
export const DEFAUT_SITUATIONS = ['s-pieton', 's-partir', 's-responsable'];
export const situationsDe = (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, 'situations') : DEFAUT_SITUATIONS.map(parId));
const graineTirage = (db) => { const r = TIRAGE.tirage(db); return r ? r.graine : ''; };
export const melangerPour = (db, quoi, L) => (graineTirage(db) ? hasard(`${graineTirage(db)}|${quoi}`).melanger(L) : L.slice());

// ─────────────────────────────────────────────────────────────── l’inspection sur la scène (objets d’ENT-8.7 ; réponses NEUTRES en évaluation)
// Le collègue qui reçoit les signalements est le cariste du site. En évaluation rien ne dit juste ou faux : la même phrase pour un défaut
// signalé et pour un point en ordre (« C’est noté. » ; un clic à côté ne pose plus de marque depuis le 20/10/2026) ; la scène se répare quand même sous les yeux de l’élève (moteur, écart dit au compte rendu).
export const NOTE = 'C’est noté.';
export const OBJETS = {
  cabine: { sur: 'vide', danger: 'conduite', libOk: 'Cabine vide, moteur coupé', libKo: 'Chauffeur au volant, moteur allumé' },
  cale: { sur: 'posee', danger: 'absente', libOk: 'Cale de roue posée', libKo: 'Cale de roue absente' },
  butoirs: { sur: 'enPlace', danger: 'absents', libOk: 'Butoirs de quai en place', libKo: 'Butoirs de quai absents' },
  niveleur: { sur: 'pose', danger: 'releve', libOk: 'Niveleur posé', libKo: 'Niveleur relevé, pas posé sur la remorque' },
  lampe: { sur: 'allumee', danger: 'eteinte', libOk: 'Lampe de quai allumée', libKo: 'Lampe de quai éteinte' },
};
// UNE anomalie, facile ou moyen (brief §6 bis) : parmi les quatre premières (jamais les butoirs, difficiles), tirée de la GRAINE de la base.
export const ANOMALIES_SOCLE = ['cabine', 'cale', 'niveleur', 'lampe'];
export const anomalieDe = (graine) => hasard(`${graine == null ? '' : graine}|${ID}|anomalie`).choisir(ANOMALIES_SOCLE);
export const consigneScene = (Q) => `Avant que ${Q.cariste} entre dans le camion, regarde le quai et le camion. Si quelque chose ne va pas, signale-le à ${Q.cariste}.`;
export function securiteDe(anomalie, S) {
  const Q = equipeDe(S);
  return {
    mode: 'scene',
    consigne: consigneScene(Q),
    points: Object.entries(OBJETS).map(([objet, o]) => (objet === anomalie
      ? { id: objet, objet, etat: o.danger, ok: false, lib: o.libKo, repare: NOTE }
      : { id: objet, objet, etat: o.sur, ok: true, lib: o.libOk, repare: NOTE })),
    signaler: { qui: Q.cariste, rien: NOTE, fin: 'Dis-moi quand on peut décharger.' },
  };
}

// ─────────────────────────────────────────────────────────────── le camion de décoration (4 palettes CONSTRUITES)
// Désignations génériques (aucune marque), références « DEC- » + 5 chiffres, quantités inventées. Dimensions en cartons (largeur × profondeur ×
// couches) déduites de `parCouche` comme en ENT-8.8 : 8 → 4 × 2, 6 → 3 × 2, 5 → 5 × 1.
export const CAMION = {
  fournisseur: 'Un fournisseur de décoration',
  transporteur: 'Transporteur routier',
  chauffeur: 'Thomas',
  palettes: [
    { id: 'P1', ref: 'DEC-41207', designation: 'Cadres photo, lot de 3', couches: 5, parCouche: 8, cartons: 40, contenu: 'lots de 3 cadres' },
    { id: 'P2', ref: 'DEC-38615', designation: 'Vases en verre, lot de 2', couches: 4, parCouche: 5, cartons: 20, contenu: 'lots de 2 vases' },
    { id: 'P3', ref: 'DEC-52930', designation: 'Guirlandes lumineuses, 5 m', couches: 6, parCouche: 6, cartons: 36, contenu: 'guirlandes de 5 m' },
    { id: 'P4', ref: 'DEC-27748', designation: 'Coussins 40 × 40 cm', couches: 3, parCouche: 6, cartons: 18, contenu: 'coussins' },
  ],
};
export const dims = (p) => { const D = p.parCouche % 2 === 0 ? 2 : 1; return { W: p.parCouche / D, D, L: p.couches }; };
export const PALETTES = CAMION.palettes.map((p) => ({ ...p, ...dims(p) }));
const palette = (id) => PALETTES.find((p) => p.id === id);

// ─────────────────────────────────────────────────────────────── le tirage des palettes (règles d’ENT-8.8, recopiées et réduites)
// Par élève (graine = son identifiant + « |action-evaluation-reception ») : UNE palette à problème (`ecrase-face`, `ecrase-cache` ou `manquant`,
// une chance sur trois chacun), UNE palette au piège `couche-normale` (couche du dessus à moitié vide, le BL dit le même nombre), DEUX conformes.
// Quantités FIXES (celles d’ENT-8.8) : 2 cartons écrasés devant, 1 derrière, 2 manquants ; la couche « normale » garde la moitié de sa couche du
// dessus (arrondie au-dessous).
export const QTE = { face: 2, cache: 1, manquant: 2 };
export const PROBLEMES = ['ecrase-face', 'ecrase-cache', 'manquant'];
export const ROLES = ['probleme', 'piege', 'conforme-1', 'conforme-2'];
export const ATTENDU = {
  'ecrase-face': ['reserves', 'avarie'], 'ecrase-cache': ['reserves', 'avarie'], manquant: ['reserves', 'manquant'],
  'couche-normale': ['accepter', 'aucun'], conforme: ['accepter', 'aucun'],
};
const dessus = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const avant = ({ W, D, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},${D - 1},${k}`); return c; };
const arriere = ({ W, L }) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };
export const moitieDessus = (p) => Math.floor((p.W * p.D) / 2);

function tirer(h) {
  const ordre = h.melanger(PALETTES.map((p) => p.id));
  const probleme = h.choisir(PROBLEMES);
  // Les deux conformes gardent l’ordre des palettes (P1 avant P4) : « conforme-1 » est la première des deux.
  const conf = [ordre[2], ordre[3]].sort();
  const role = { [ordre[0]]: 'probleme', [ordre[1]]: 'piege', [conf[0]]: 'conforme-1', [conf[1]]: 'conforme-2' };
  return { palettes: PALETTES.map((p) => {
    const r = role[p.id], a = r === 'probleme' ? probleme : r === 'piege' ? 'couche-normale' : 'conforme';
    const plein = p.W * p.D * p.L;
    let manque = [];
    const avarie = {};
    if (a === 'ecrase-face') h.prendre(avant(p), QTE.face).forEach((c) => { avarie[c] = [0, 1]; });
    if (a === 'ecrase-cache') h.prendre(arriere(p), QTE.cache).forEach((c) => { avarie[c] = [0, -1]; });
    if (a === 'manquant') manque = h.prendre(dessus(p), QTE.manquant);
    if (a === 'couche-normale') manque = h.prendre(dessus(p), moitieDessus(p));
    return { id: p.id, role: r, anomalie: a, manque, avarie, bl: a === 'couche-normale' ? plein - manque.length : plein };
  }) };
}
// Les contraintes d’équité, en clair (liste vide = jeu conforme ; sinon il est retiré).
export function verifier(jeu) {
  const f = [];
  const P = jeu && jeu.palettes;
  if (!Array.isArray(P) || P.length !== PALETTES.length) return [`il faut ${PALETTES.length} palettes`];
  if (P.map((p) => p.id).join() !== PALETTES.map((p) => p.id).join()) f.push('palettes mal numérotées');
  if ([...P.map((p) => p.role)].sort().join() !== [...ROLES].sort().join()) f.push(`rôles : ${P.map((p) => p.role)}`);
  P.forEach((p) => {
    const d = palette(p.id);
    if (!d) return;
    const plein = d.W * d.D * d.L, av = Object.keys(p.avarie || {});
    const attendue = p.role === 'probleme' ? PROBLEMES : p.role === 'piege' ? ['couche-normale'] : ['conforme'];
    if (!attendue.includes(p.anomalie)) f.push(`${p.id} : anomalie ${p.anomalie} pour le rôle ${p.role}`);
    if (p.anomalie === 'couche-normale' && d.cartons !== plein) f.push(`${p.id} : le piège sur une palette déjà incomplète au départ`);
    if (new Set(p.manque).size !== p.manque.length || p.manque.some((c) => !dessus(d).includes(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    const face = { 'ecrase-face': [avant(d), 1], 'ecrase-cache': [arriere(d), -1] }[p.anomalie];
    if (av.length && (!face || av.some((c) => !face[0].includes(c) || p.avarie[c][0] !== 0 || p.avarie[c][1] !== face[1]))) f.push(`${p.id} : carton écrasé hors de sa face`);
    const ok = {
      'ecrase-face': !p.manque.length && av.length === QTE.face && p.bl === plein,
      'ecrase-cache': !p.manque.length && av.length === QTE.cache && p.bl === plein,
      manquant: p.manque.length === QTE.manquant && !av.length && p.bl === plein,
      'couche-normale': p.manque.length === moitieDessus(d) && p.manque.length > 0 && !av.length && p.bl === plein - p.manque.length,
      conforme: !p.manque.length && !av.length && p.bl === plein,
    }[p.anomalie];
    if (!ok) f.push(`${p.id} : quantités hors règle pour ${p.anomalie}`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-action-ent810').jeu;
if (!DECL.secours) throw new Error('ENT-8.10 : le tirage des palettes ne donne aucun jeu conforme (tirer et verifier se contredisent)');
export const TIRAGE_PALETTES = DECL;
const jeux = new Map();
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE_PALETTES, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));
export const duRole = (jeu, role) => jeu.palettes.find((p) => p.role === role);
export const quantite = (p) => (p.anomalie === 'manquant' ? p.manque.length : Object.keys(p.avarie).length);
export const reelDe = (p) => { const d = palette(p.id); return d.W * d.D * d.L - p.manque.length; };

// ─────────────────────────────────────────────────────────────── le quai d’un élève (complet, mode copie)
// Variante A de la dépose (COORDINATION §8.2 n° 1) : 6 cases sur une ligne, R1 à R4 justes et peintes, l’allée piétonne et la zone devant le
// quai 4, non peintes. Évaluation : le premier clic pose, sans réaction ni case grisée (moteur) ; les `reaction` ne sont jamais montrées.
export const DEPOSE = { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'R1' }, { id: 'R2' }, { id: 'R3' }, { id: 'R4' },
  { id: 'quai4-1', sol: 'autre-quai', legende: `Quai ${QUAI_VOISIN}`, peinte: false, nom: `Devant le quai ${QUAI_VOISIN}` }] };

export function quaiDuJeu(jeu, anomalie, S) {
  const Q = equipeDe(S);
  return {
    id: QUAI_ID,
    libelle: `Le quai ${QUAI_NUM}`,
    rendu: 'iso',
    froid: false,
    titre: `Entrepôt Action — ${S.prestataire}, ${S.site} — Quai ${QUAI_NUM}, réception`,
    destinataire: `Entrepôt Action — ${S.prestataire}, ${S.site}`,
    avertissement: `Réels : Action et ${S.prestataire}. Le quai est un <b>dessin construit</b> : ce n’est pas le vrai quai. Le camion, son chargement, `
      + `les défauts, le bon de livraison et la lettre de voiture, ${Q.cariste} et Thomas sont <b>construits pour l’exercice</b>.`,
    lieu: { nom: `Quai ${QUAI_NUM}`, temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    document: DOCUMENT,
    recommencer: false,
    // Évaluation à plusieurs écrans : la clôture du quai NE rend PAS la copie (option du moteur, décision du chef de chantier du 17/10/2026) ;
    // la copie se rend par « Rendre ma copie », après le compte rendu.
    rendCopie: false,
    motifs: ['avarie', 'manquant'],
    // Aides éteintes (évaluation).
    aides: {},
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: Q.cariste },
    securite: securiteDe(anomalie, S),
    depose: JSON.parse(JSON.stringify(DEPOSE)),
    camions: [{
      transporteur: CAMION.transporteur, fournisseur: CAMION.fournisseur, bl: BL_NUMERO, arrivee: '07:00',
      parole: 'Voici le bon de livraison et la lettre de voiture. J’attends au local chauffeurs.',
      palettes: jeu.palettes.map((t) => {
        const p = palette(t.id), [attendu, motifAttendu] = ATTENDU[t.anomalie];
        return { id: p.id, ref: p.ref, nom: p.designation, bl: t.bl, W: p.W, D: p.D, L: p.L,
          manque: t.manque.slice(), avarie: JSON.parse(JSON.stringify(t.avarie)), attendu, motifAttendu,
          etiq: { ref: p.ref, nom: p.designation.toUpperCase(), poids: p.contenu, lot: `DEC-${p.ref.slice(-3)}-1301` } };
      }),
    }],
  };
}
const quais = new Map();
// Le quai d’une graine (l’identifiant de l’élève) : son site, son anomalie de scène, ses palettes. Une déclaration neuve par graine, en cache.
export function quaiDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!quais.has(g)) quais.set(g, quaiDuJeu(jeuDe(g), anomalieDe(g), siteDeGraine(g)));
  return JSON.parse(JSON.stringify(quais.get(g)));
}
export const quaiDeBase = (db) => quaiDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── le dialogue « Au quai » (Thomas, vouvoiement ; textes CONSTRUITS, par site)
// Aucune bonne réponse identique mot pour mot à ENT-8.7 (Marc). En évaluation : aucune réaction (la première réponse compte), ordre des choix
// tiré par le moteur. La présentation (le prestataire) et le local chauffeurs (son emplacement) changent avec le site (`selon`).
const S_ = (db) => siteEleve(db);
export const presentation = (S) => `Bonjour monsieur, je suis {prenom}, stagiaire à la réception de ${S.prestataire}. Bienvenue.`;
export const attenteJuste = (S) => `Non : vous coupez le moteur, vous me confiez vos clés et vous attendez au local chauffeurs, ${DETAILS[S.id].local}.`;
export const REPLIQUES = [
  { id: 'arrivee', dit: 'Bonjour ! Je viens livrer la décoration pour Action.', selon: (db) => ({ libs: { presente: presentation(S_(db)) } }), choix: [
    { v: 'presente', juste: true, lib: presentation(SITES[SITE_DEFAUT]) },
    { v: 'salut', lib: 'Ouais, c’est pour quoi ?' },
    { v: 'attendez', lib: 'Pas maintenant.' }] },
  { id: 'documents', dit: 'Vous voulez quels papiers ?', choix: [
    { v: 'bl-ldv', juste: true, lib: 'Le bon de livraison et la lettre de voiture, s’il vous plaît.' },
    { v: 'aucun', lib: 'Aucun, on verra après.' },
    { v: 'identite', lib: 'Votre carte d’identité.' }] },
  { id: 'quai', dit: 'Je me mets à quel quai ?', choix: [
    { v: 'quai3', juste: true, lib: 'Quai 3, en marche arrière jusqu’aux butoirs, s’il vous plaît.' },
    { v: 'importe', lib: 'N’importe lequel.' },
    { v: 'quai4', lib: 'Au quai 4.' }] },
  { id: 'attente', dit: 'Pendant que vous déchargez, je reste dans mon camion ?', selon: (db) => ({ libs: { local: attenteJuste(S_(db)) } }), choix: [
    { v: 'local', juste: true, lib: attenteJuste(SITES[SITE_DEFAUT]) },
    { v: 'cabine', lib: 'Oui, restez dans votre cabine.' },
    { v: 'aider', lib: 'Venez plutôt nous donner un coup de main.' }] },
  { id: 'fin', dit: 'Entendu. Je pourrai repartir quand ?', choix: [
    { v: 'fin-poli', juste: true, lib: 'Quand le contrôle sera fini et les papiers signés : je viendrai vous chercher.' },
    { v: 'fin-sec', lib: 'Aucune idée.' },
    { v: 'fin-copain', lib: 'Ciao !' }] },
];
export const JUSTES_DIALOGUE = Object.fromEntries(REPLIQUES.map((r) => [r.id, r.choix.find((c) => c.juste).v]));
export const FIN_DIALOGUE = 'Très bien, à tout à l’heure.';

// ─────────────────────────────────────────────────────────────── « ma réception » : la phrase de ce que l’élève a DÉCIDÉ au quai
// Une erreur ne se paie qu’une fois (brief §0, §5) : la phrase juste dit les réserves que l’élève a écrites (ses palettes acceptées avec
// réserves ou refusées, le motif et le nombre qu’il a saisis), juste ou faux ; aucune réserve : « Tout est conforme, aucune réserve. ».
// Calculée UNE FOIS, quand le message entre dans la base (à la signature : plus rien ne bouge au quai).
export const TOUT_CONFORME = 'Tout est conforme, aucune réserve.';
const pl = (n, un, des) => `${n} ${n > 1 ? des : un}`;
const nombre = (v) => { const n = parseInt(String(v == null ? '' : v).trim(), 10); return Number.isFinite(n) && n > 0 ? n : null; };
const constat = ({ id, motif, n, refus }) => {
  if (refus) return `${id}, palette refusée`;
  if (motif === 'manquant') return n ? `${id}, ${pl(n, 'carton manquant', 'cartons manquants')}` : `${id}, des cartons manquants`;
  if (motif === 'avarie') return n ? `${id}, ${pl(n, 'carton abîmé', 'cartons abîmés')}` : `${id}, des cartons abîmés`;
  return `${id}, une réserve`;
};
export const phraseReserves = (L) => (L.length ? `Réserves signées par Thomas : ${L.slice().sort((a, b) => a.id.localeCompare(b.id)).map(constat).join(' ; ')}.` : TOUT_CONFORME);
// Les constats de l’élève, lus dans l’état du quai : chaque palette « acceptée avec réserves » ou « refusée ».
export function constatsEleve(db) {
  const e = db && db.quais && db.quais[QUAI_ID];
  if (!e || !e.palettes) return [];
  return Object.entries(e.palettes).filter(([, s]) => s && (s.decision === 'reserves' || s.decision === 'refuser'))
    .map(([id, s]) => ({ id, motif: s.motif, n: nombre(s.res), refus: s.decision === 'refuser' }));
}
// Les constats ATTENDUS du jeu (la palette à problème, son motif, sa quantité).
export const constatsJeu = (jeu) => { const p = duRole(jeu, 'probleme'); return [{ id: p.id, motif: ATTENDU[p.anomalie][1], n: quantite(p) }]; };
// La ligne : la phrase de l’élève (rang 0) et trois pièges CALCULÉS (une autre palette, un autre nombre, ou la phrase attendue quand l’élève
// n’a rien écrit), tous différents.
export function ligneReception(db) {
  const jeu = jeuDeBase(db), E = constatsEleve(db);
  const juste = phraseReserves(E);
  const base = E.length ? E : constatsJeu(jeu);
  const autreId = (id) => { const P = jeu.palettes.map((p) => p.id); const libre = P.filter((x) => !base.some((c) => c.id === x)); return libre[0] || P.find((x) => x !== id); };
  const decale = base.map((c, i) => (i ? c : { ...c, id: autreId(c.id) }));
  const plus = base.map((c, i) => (i ? c : { ...c, refus: false, motif: c.motif === 'manquant' ? 'manquant' : 'avarie', n: (c.n || 1) + 1 }));
  const candidats = [E.length ? TOUT_CONFORME : phraseReserves(base), phraseReserves(decale), phraseReserves(plus),
    phraseReserves(base.map((c) => ({ ...c, refus: false, motif: c.motif === 'manquant' ? 'avarie' : 'manquant', n: c.n || 2 })))];
  const choix = [juste];
  candidats.forEach((t) => { if (!choix.includes(t) && choix.length < 4) choix.push(t); });
  return { choix, juste: 0 };
}
