// ENT-10.4 — Transports Pelleau : les DONNÉES PURES de l'évaluation « prendre son poste » (brief
// `docs/briefs/ENT-10.4-pelleau-evaluation-prise-de-poste.md` §4 à §6 bis ; décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md`
// §2, qui passent avant le brief). Aucun effet de bord, aucune interface, aucun dessin : importé par le contenu (`contenus/pelleau-ent104.js`),
// les questions (`contenus/questions/ENT-10.4.js`), le corrigé (`contenus/corriges/ENT-10.4.js`, chargé aussi sous Node) et les tests.
// Cette séance n'importe RIEN d'une autre séance (FDR §0.12) : ce qui ressemble à ENT-10.2 est recopié ici.
//
// CE QUI EST TIRÉ (par élève, sur sa graine `db.tirage.graine`, celle que reçoit la vue « Inspection du poste »), CE QUI EST FIXE
//   - Le défaut du SITE : extincteur du quai B absent OU plan de circulation absent (moitié-moitié). ÉCART AVEC LE BRIEF §4 (« extincteur quai A
//     ou B, ou affichage », un tiers chacun) : la scène du quai de la vue est toujours celle du « Quai B » (le nom du quai n'est pas déclarable) ;
//     un défaut « au quai A » contredirait la porte dessinée.
//   - Le défaut de l'ENGIN (transpalette n° 1) : un parmi six, uniforme (brief §4, §6 bis) : fourche tordue, roue abîmée, batterie débranchée,
//     arrêt d'urgence absent, fuite, avertisseur muet (le seul qu'on ne voit pas : il ne se trouve qu'en essayant l'avertisseur).
//   - Le transpalette n° 2 est TOUJOURS en ordre (point déclaré en ordre : c'est le piège « ne signaler que ce qui ne va pas », et l'engin que la
//     bonne réplique à Yann prend). Pas d'essai déclaré sur le n° 2 : il ajouterait un second jalon « avertisseur essayé » que le barème du
//     brief (une case de 0,5) ne prévoit pas.
//   - Les 3 lieux de « Où est-ce ? » (parmi 6) et les numéros du plan (permutation de 1 à 7) ; les 2 lectures du planning (facile + moyen).
//   - LE PLANNING EST FIXE, une seule grille pour toute la classe (décision 12 du chef : pas de tirage du planning) : ÉCART AVEC LE BRIEF
//     §4 étape 4 (trois grilles, client de la carte tiré). La grille est celle de CETTE séance (autre que celle d'ENT-10.2). Le quai B interdit
//     (variante extincteur) est jugé par le jalon de la carte, sur le défaut de l'élève, jamais par la grille.
//   - Les phrases du compte rendu : « engin » et « site » CALCULÉES sur le tirage, « heure » LUE dans la grille.

import { declarerTirage, hasard, graineDeBase } from '../core/tirage.js';

export const ID = 'pelleau-evaluation-prise-de-poste';
export const ID_VOLET = 'pelleau-ent104';
export const INSPECTION_ID = 'pelleau-poste-104';
export const DIALOGUE_ID = 'pelleau-dialogue-104';
export const PLANNING_ID = 'pelleau-planning-104';
export const PHRASES_ID = 'compte-rendu-erwan-104';
export const JOUR = 11;   // 11 mai (2026) : aucun jour de la semaine écrit
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { ou: 'ou-est-ce-104', lire: 'lire-planning-104' };

// ─────────────────────────────────────────────────────────────── les défauts tirés (sur la graine de l'élève)
export const DEFAUTS_SITE = ['extincteur', 'affichage'];
export const ENGINS = ['fourcheTordue', 'roueAbimee', 'batterie', 'arretUrgence', 'fuite', 'avertisseur'];
// `graine` = l'identifiant de l'élève (`db.tirage.graine`). Une graine vide (contrôle au chargement, enseignant) donne aussi un défaut.
export const defautSiteDe = (graine) => (hasard(`${graine || ''}|${ID}|defaut-site`).entier(0, 1) ? 'affichage' : 'extincteur');
export const defautEnginDe = (graine) => ENGINS[hasard(`${graine || ''}|${ID}|defaut-engin`).entier(0, ENGINS.length - 1)];
export const defautSiteDeBase = (db) => defautSiteDe(graineDeBase(db || {}));
export const defautEnginDeBase = (db) => defautEnginDe(graineDeBase(db || {}));
const autreSite = (d) => (d === 'extincteur' ? 'affichage' : 'extincteur');
// Ce que chaque défaut du site fait dire (inspection, bonne réplique à Yann, phrase du compte rendu, corrigé).
export const SITE = {
  extincteur: { objet: 'extincteur', absent: 'absent', present: 'present',
    lib: 'Extincteur absent au quai B', libOk: 'Extincteur en place au quai B',
    refuse: 'on travaille au quai A, où il y a un extincteur',
    phrase: 'Il manque l’extincteur du quai B : je travaille au quai A.' },
  affichage: { objet: 'affichage', absent: 'absent', present: 'affiche',
    lib: 'Plan de circulation absent au quai B', libOk: 'Plan de circulation affiché au quai B',
    refuse: 'tu me montres le sens de circulation',
    phrase: 'Le plan de circulation n’est pas affiché : je demande à Yann de me montrer le sens.' },
};
// Ce que chaque défaut de l'engin fait dire (le libellé sert au bilan et au corrigé, jamais à l'écran de l'élève pendant l'inspection).
export const ENGIN = {
  fourcheTordue: { lib: 'Fourche tordue sur le transpalette n° 1', desc: 'une fourche est tordue' },
  roueAbimee: { lib: 'Roue abîmée sur le transpalette n° 1', desc: 'une roue est abîmée' },
  batterie: { lib: 'Batterie débranchée sur le transpalette n° 1', desc: 'la batterie est débranchée' },
  arretUrgence: { lib: 'Arrêt d’urgence absent sur le transpalette n° 1', desc: 'le bouton d’arrêt d’urgence manque' },
  fuite: { lib: 'Fuite sous le transpalette n° 1', desc: 'il y a une fuite sous l’engin' },
  avertisseur: { lib: 'Avertisseur muet sur le transpalette n° 1', desc: 'l’avertisseur ne sonne pas' },
};
export const phraseEngin = (e) => `J’ai contrôlé le transpalette n° 1 : ${ENGIN[e].desc}. Je ne m’en sers pas.`;
export const PHRASE_ENGIN_OK = 'J’ai contrôlé le transpalette n° 1 : il est en ordre.';
// Un AUTRE défaut que le sien, pour le piège de la phrase (le suivant dans la liste : déterministe).
export const autreEngin = (e) => ENGINS[(ENGINS.indexOf(e) + 1) % ENGINS.length];

// L'inspection pour un couple (défaut du site, défaut de l'engin) : mêmes `id`, mêmes ordres, 2 défauts et 1 essai pour TOUTES les graines
// (l'étape n° k des jalons lit la k-ième ligne du jeu de la base de l'élève). Copie : premier clic, « C'est noté. », rien ne se répare, aucun arrêt.
export function inspectionPour(site, engin) {
  const S = SITE[site], E = ENGIN[engin];
  return {
    id: INSPECTION_ID, libelle: 'Mon poste', qui: 'Erwan',
    consigne: 'Regarde ton poste et le transpalette n° 1. Clique ce qui ne va pas, puis signale-le.',
    vues: ['charge', 'quai'],
    points: [
      { id: 'site-manque', objet: S.objet, etat: S.absent, ok: false, lib: S.lib },
      { id: 'engin-defaut', objet: 'transpalette', n: 1, etat: engin, ok: false, lib: E.lib },
      { id: 'tp2', objet: 'transpalette', n: 2, etat: 'ok', ok: true, lib: 'Transpalette n° 2 en ordre' },
    ],
    essai: { objet: 'transpalette', n: 1, resultat: engin === 'avertisseur' ? 'muet' : 'sonne' },
    arret: false,
    commencer: 'C’est bon, je prends mon poste',
  };
}
export const inspectionDe = (graine) => inspectionPour(defautSiteDe(graine), defautEnginDe(graine));

// ─────────────────────────────────────────────────────────────── la bonne réplique à Yann (calculée sur le défaut du site)
export const libRefuse = (site) => `Je prends le n° 2 après l’avoir contrôlé, je mets le n° 1 de côté, et ${SITE[site].refuse}. Je préviens Erwan.`;
export const REPLIQUES = [
  { id: 'presse', dit: 'On a un camion dans dix minutes. Prends le n° 1, on verra ce soir.',
    selon: (db) => ({ libs: { refuse: libRefuse(defautSiteDeBase(db)) } }),
    choix: [
      { v: 'refuse', juste: true, lib: libRefuse(defautSiteDe('')) },
      { v: 'cede', lib: 'D’accord, je prends le n° 1.' },
      { v: 'doucement', lib: 'Je prends le n° 1, mais je roule doucement.' },
      { v: 'sans-controle', lib: 'Je prends le n° 2 sans le contrôler : il est neuf.' },
    ] },
];
export const JUSTE_PRESSE = REPLIQUES[0].choix.find((c) => c.juste).v;
export const FIN_DIALOGUE = 'Bon. À tout à l’heure.';

// ─────────────────────────────────────────────────────────────── « Où est-ce ? » : les 7 lieux du plan et les 6 questions
// `n` = le rond du dessin (le contenu le dessine) ; le numéro affiché chez l'élève est `plan[n − 1]` (permutation tirée). Le 7e lieu, les
// quais, n'est jamais demandé : c'est le 7e choix (brief : « les 7 lieux du plan »).
export const LIEUX_PLAN = [
  { n: 1, nom: 'le vestiaire' }, { n: 2, nom: 'le local de charge' }, { n: 3, nom: 'le bureau transport' }, { n: 4, nom: 'la zone de réception' },
  { n: 5, nom: 'la zone de contrôle' }, { n: 6, nom: 'la zone litiges' }, { n: 7, nom: 'les quais A et B' },
];
export const BANQUE_LIEUX = [
  { id: 'l-reception', n: 4, q: 'Où attendent les palettes déchargées ?', difficulte: 'facile' },
  { id: 'l-vestiaire', n: 1, q: 'Où met-on ses EPI ?', difficulte: 'facile' },
  { id: 'l-charge', n: 2, q: 'Où recharge-t-on le transpalette ?', difficulte: 'moyen' },
  { id: 'l-bureau', n: 3, q: 'Où Maëlys tient-elle le planning ?', difficulte: 'moyen' },
  { id: 'l-controle', n: 5, q: 'Où compte-t-on les colis ?', difficulte: 'difficile' },
  { id: 'l-litiges', n: 6, q: 'Où met-on une palette abîmée ?', difficulte: 'difficile' },
];
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7].map((k) => ({ v: String(k), lib: `n° ${k}` }));
export const estPermutation = (p) => Array.isArray(p) && p.length === 7 && [...p].sort((a, b) => a - b).join(',') === '1,2,3,4,5,6,7';

// ─────────────────────────────────────────────────────────────── le planning des quais (grille IDENTIQUE pour toute la classe)
// Construit (jamais le jour de la semaine). Le retour de ramasse de Loïc, la livraison du transporteur pour Ar Vag (quai A) et un départ de
// Pelleau (quai B).
const toMin = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
export const minutesDe = toMin;
const z2 = (n) => String(n).padStart(2, '0');
export const versHHMM = (m) => `${z2(Math.floor(m / 60))}:${z2(m % 60)}`;
export const heureLue = (m) => `${Math.floor(m / 60)} h${m % 60 ? ` ${z2(m % 60)}` : ''}`;
export const QUAIS = [{ id: 'A', nom: 'Quai A' }, { id: 'B', nom: 'Quai B' }];
export const nomQuai = (q) => (QUAIS.find((x) => x.id === q) || {}).nom || q;
export const CAMIONS = [
  { id: 'loic', quai: 'A', de: '07:15', a: '08:00', titre: 'Retour de ramasse (Loïc)', court: 'Loïc', lib: 'le camion de Loïc' },
  { id: 'arvag', quai: 'A', de: '09:30', a: '10:30', titre: 'Livraison pour Ar Vag (transporteur)', court: 'Ar Vag', lib: 'la livraison pour Ar Vag' },
  { id: 'rungis', quai: 'B', de: '10:00', a: '11:00', titre: 'Départ pour Rungis (Pelleau)', court: 'Rungis', lib: 'le départ pour Rungis' },
];
// La carte à poser : Agri-Kerlann, une heure, entre 10 h et 12 h.
export const CARTE = { id: 'agri-kerlann', titre: 'Agri-Kerlann — 1 h', court: 'Agri-Kerlann', des: '10:00', avant: '12:00', duree: 60 };
export const ECHELLE = { debut: '06:00', fin: '12:00', pas: 15 };

// Les LECTURES, calculées sur une grille (la vraie, ou une grille modifiée par un test) : { q, choix: [{ v, lib }], juste, justes }.
export function lecturesDe(camions = CAMIONS) {
  const loic = camions.filter((c) => c.id === 'loic');
  const arvag = camions.filter((c) => c.id === 'arvag');
  const L = loic[0] || null, G = arvag[0] || null;
  const heures = [...new Set(camions.flatMap((c) => [toMin(c.de), toMin(c.a)]))].sort((a, b) => a - b);
  const choixHeures = (juste) => [juste, ...heures.filter((m) => m !== juste)].slice(0, 4).sort((a, b) => a - b)
    .map((m) => ({ v: versHHMM(m), lib: heureLue(m) }));
  const R = {};
  R['l-loic-heure'] = { q: 'À quelle heure Loïc revient-il au quai ?', juste: L ? L.de : null, justes: loic.map((c) => c.de),
    choix: choixHeures(L ? toMin(L.de) : null) };
  R['l-loic-quai'] = { q: 'À quel quai Loïc se met-il ?', juste: L ? L.quai : null, justes: loic.map((c) => c.quai),
    choix: QUAIS.map((q) => ({ v: q.id, lib: q.nom })) };
  // Le premier moment où le quai de Loïc est libre après lui : la fin de son créneau, s'il n'y a pas de camion juste après.
  {
    const libre = L && !camions.some((c) => c !== L && c.quai === L.quai && toMin(c.de) <= toMin(L.a) && toMin(c.a) > toMin(L.a)) ? toMin(L.a) : null;
    R['l-premier-libre'] = { q: `Après Loïc, à quelle heure le ${L ? nomQuai(L.quai).replace(/^Q/, 'q') : 'quai'} est-il libre ?`,
      juste: libre != null ? versHHMM(libre) : null, justes: libre != null ? [versHHMM(libre)] : [], choix: choixHeures(libre) };
  }
  R['l-combien'] = { q: 'Combien de camions sont prévus ce matin ?', juste: String(camions.length), justes: [String(camions.length)],
    choix: [1, 2, 3, 4].map((k) => ({ v: String(k), lib: String(k) })) };
  R['l-fin-arvag'] = { q: 'À quelle heure la livraison pour Ar Vag libère-t-elle son quai ?', juste: G ? G.a : null, justes: arvag.map((c) => c.a),
    choix: choixHeures(G ? toMin(G.a) : null) };
  return R;
}
// Les places justes de la carte (quai, minute de début), avec le défaut du site de l'élève : un quai libre pendant l'heure, dans la fenêtre, et
// jamais le quai B quand son extincteur manque.
export function placesJustes(site, camions = CAMIONS) {
  const P = [];
  QUAIS.forEach((q) => {
    if (site === 'extincteur' && q.id === 'B') return;
    for (let m = toMin(CARTE.des); m + CARTE.duree <= toMin(CARTE.avant); m += ECHELLE.pas) {
      if (!camions.some((c) => c.quai === q.id && toMin(c.de) < m + CARTE.duree && toMin(c.a) > m)) P.push([q.id, m]);
    }
  });
  return P;
}
// Le CONTRÔLE de la grille (au chargement : la séance refuse de s'ouvrir s'il rend quelque chose) — chaque lecture a UNE seule bonne réponse,
// parmi ses choix, sans choix en double ; la carte a au moins une place juste DANS LES DEUX VARIANTES du site ; heures sur le quart d'heure,
// dans l'échelle ; pas deux camions à la fois sur un quai.
export function ecartsGrille(camions = CAMIONS) {
  const E = [];
  Object.entries(lecturesDe(camions)).forEach(([id, x]) => {
    if (x.justes.length !== 1) E.push(`lecture ${id} : ${x.justes.length} bonne(s) réponse(s) sur la grille au lieu d'une`);
    else if (!x.choix.some((c) => c.v === x.juste)) E.push(`lecture ${id} : la bonne réponse n'est pas dans les choix`);
    if (x.choix.length < 2) E.push(`lecture ${id} : moins de 2 choix`);
    if (new Set(x.choix.map((c) => c.v)).size !== x.choix.length) E.push(`lecture ${id} : deux choix identiques`);
  });
  camions.forEach((c) => {
    [c.de, c.a].forEach((h) => { if (toMin(h) % ECHELLE.pas || toMin(h) < toMin(ECHELLE.debut) || toMin(h) > toMin(ECHELLE.fin)) E.push(`camion ${c.id} : ${h} hors du quart d'heure ou de l'échelle`); });
    if (toMin(c.de) >= toMin(c.a)) E.push(`camion ${c.id} : il repart avant d'arriver`);
    camions.forEach((d) => { if (d !== c && d.quai === c.quai && toMin(d.de) < toMin(c.a) && toMin(d.a) > toMin(c.de) && c.id < d.id) E.push(`camions ${c.id} et ${d.id} en même temps au ${nomQuai(c.quai)}`); });
  });
  DEFAUTS_SITE.forEach((d) => { if (!placesJustes(d, camions).length) E.push(`la carte « ${CARTE.court} » n’a aucune place juste (défaut du site : ${d})`); });
  return E;
}
{ const E = ecartsGrille(); if (E.length) throw new Error(`ENT-10.4 : le planning ne tient pas — ${E.join(' ; ')}`); }
export const LECTURES = lecturesDe();

// Ce que disent les phrases, LU dans la grille.
const ARVAG = CAMIONS.find((c) => c.id === 'arvag');
const LOIC = CAMIONS.find((c) => c.id === 'loic');
export const HEURE_ARVAG = heureLue(toMin(ARVAG.de));                      // « 9 h 30 »
export const QUAI_ARVAG = nomQuai(ARVAG.quai).replace(/^Q/, 'q');          // « quai A »
const AUTRE_QUAI = nomQuai(QUAIS.find((q) => q.id !== ARVAG.quai).id).replace(/^Q/, 'q');

// ─────────────────────────────────────────────────────────────── les banques, le tirage (ni bonus ni niveau : évaluation)
export const BANQUE_LECTURES = [
  { id: 'l-loic-heure', difficulte: 'facile' }, { id: 'l-loic-quai', difficulte: 'facile' },
  { id: 'l-premier-libre', difficulte: 'moyen' }, { id: 'l-combien', difficulte: 'moyen' }, { id: 'l-fin-arvag', difficulte: 'moyen' },
];
export const valeurs104 = (h) => ({ plan: h.melanger([1, 2, 3, 4, 5, 6, 7]) });
export function ecartsJeu(jeu) {
  const E = [];
  const V = jeu.valeurs || {};
  if (!estPermutation(V.plan)) E.push('le plan : les numéros ne sont pas une permutation de 1 à 7');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    lieux: { pieces: BANQUE_LIEUX, melange: { facile: 1, moyen: 1, difficile: 1 }, ordre: 'melange' },
    lectures: { pieces: BANQUE_LECTURES, melange: { facile: 1, moyen: 1 }, ordre: 'melange' },
  },
  valeurs: valeurs104,
  verifier: ecartsJeu,
});
TIRAGE.lier(ID);
const parId = (B, id) => B.find((p) => p.id === id);
// Sans tirage (base vide au chargement, enseignant) : un jeu témoin fixe, conforme.
export const DEFAUT = { lieux: ['l-reception', 'l-charge', 'l-controle'], lectures: ['l-loic-heure', 'l-premier-libre'], plan: [3, 6, 1, 7, 2, 5, 4] };
export const lieuxDe = (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, 'lieux') : DEFAUT.lieux.map((id) => parId(BANQUE_LIEUX, id)));
export const lecturesTirees = (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, 'lectures') : DEFAUT.lectures.map((id) => parId(BANQUE_LECTURES, id)));
// La permutation du plan : `plan[n − 1]` = le numéro, chez l'élève, du rond qui porte `n` dans le dessin.
export const planDe = (db) => { const p = TIRAGE.tirage(db) ? TIRAGE.valeursTirees(db).plan : null; return estPermutation(p) ? p : DEFAUT.plan; };
export const numeroDe = (db, lieu) => String(planDe(db)[lieu.n - 1]);
// L'ordre des cases d'une liste, tiré par élève (sans graine : l'ordre déclaré).
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db || {}); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };

// ─────────────────────────────────────────────────────────────── rendre compte (phrases à choisir, `juste: 0`, mélangées à l'écran)
export const phrasesCompteRendu = (prenom, db) => {
  const s = defautSiteDeBase(db), e = defautEnginDeBase(db);
  return { id: PHRASES_ID, melanger: true, lignes: [
    { id: 'salutation', choix: ['Bonjour Erwan,', 'Salut mon grand,', 'Monsieur le directeur général,'], juste: 0 },
    { id: 'engin', choix: [phraseEngin(e), phraseEngin(autreEngin(e)), PHRASE_ENGIN_OK], juste: 0 },
    { id: 'site', choix: [SITE[s].phrase, 'Il ne manque rien.', SITE[autreSite(s)].phrase], juste: 0 },
    { id: 'heure', choix: [`La Biscuiterie Ar Vag livre à ${HEURE_ARVAG} au ${QUAI_ARVAG}.`,
      `La Biscuiterie Ar Vag livre à ${heureLue(toMin(LOIC.de))} au ${AUTRE_QUAI}.`, 'La Biscuiterie Ar Vag ne livre pas ce matin.'], juste: 0 },
    { id: 'fin', choix: [`À tout à l’heure. ${prenom}`, 'Bisous', 'Voilà.'], juste: 0 },
  ] };
};

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche déjà envoyée une fois : la suite ne se referme pas.
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
export const planningEnvoye = (db) => !!(db && db.plannings && db.plannings[PLANNING_ID] && db.plannings[PLANNING_ID].v1);
// La place envoyée de la carte : { r: 'A' | 'B', … } ou null.
export const placeCarte = (db) => { const v = planningEnvoye(db) ? db.plannings[PLANNING_ID].v1 : null; return (v && v.place && v.place[CARTE.id]) || null; };
