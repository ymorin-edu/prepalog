// ENT-10.2 — Transports Pelleau : les DONNÉES PURES de la séance « mon premier jour dans l'entrepôt neuf » (brief
// `docs/briefs/ENT-10.2-pelleau-premier-jour.md` §6.1, §6.2, §6.3, §6 bis ; décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md`
// §2, qui passent avant le brief). Aucun effet de bord, aucune interface, aucun dessin : importé par le contenu (`contenus/pelleau-ent102.js`),
// les questions (`contenus/questions/ENT-10.2.js`), le corrigé (`contenus/corriges/ENT-10.2.js`, chargé aussi sous Node) et les tests.
//
// CE QUI EST TIRÉ, CE QUI EST FIXE
//   - Le défaut du site (brief §6.1, décision 5 de Tristan : toujours présent en guidage) : `extincteur` absent au quai B OU plan de
//     circulation (`affichage`) absent, tiré sur la graine de l'élève (`db.tirage.graine`, celle que reçoit la vue « Inspection du poste »),
//     moitié-moitié ; l'autre objet du site est en ordre. Le transpalette n° 1 est en ordre, son avertisseur SONNE et doit être essayé.
//   - Les lectures du planning (2 au socle, 1 en bonus du confirmé) : tirage mémorisé (`declarerTirage`).
//   - Le planning lui-même : UNE GRILLE FIXE pour toute la classe (décision 12 du chef : pas de tirage du planning). ÉCART AVEC LE BRIEF §6.2 :
//     le brief faisait dépendre la grille du défaut (« quai B fermé » dans la variante extincteur) ; la grille fixe met donc TOUS les camions
//     du matin au quai A (le quai B n'a rien), ce qui tient dans les deux variantes. Le quai B interdit (variante extincteur) est jugé par le
//     jalon de la carte, sur le défaut de l'élève, jamais par la grille.
//   - Les phrases du compte rendu : la ligne « ce qui manque » est CALCULÉE sur le défaut de l'élève, la ligne « l'heure » LUE dans la grille.
//
// Le transpalette n° 2 n'est PAS déclaré (brief : « hors poste, non déclaré ») : la vue ne dessine pas un engin que ne nomme aucun point
// (question posée au chef dans le compte rendu du brief).

import { declarerTirage, hasard, graineDeBase } from '../core/tirage.js';

export const ID = 'pelleau-premier-jour';
export const ID_VOLET = 'pelleau-ent102';
export const VISITE_ID = 'pelleau-visite-102';
export const INSPECTION_ID = 'pelleau-poste-102';
export const PLANNING_ID = 'pelleau-quais-102';
export const PHRASES_ID = 'compte-rendu-erwan-102';
export const JOUR = 5;   // 5 mai (2026) : aucun jour de la semaine écrit
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { attente: 'en-attendant', lire: 'lire-planning' };

// ─────────────────────────────────────────────────────────────── le défaut du site (tiré sur la graine de l'élève)
export const DEFAUTS = ['extincteur', 'affichage'];
// `graine` = l'identifiant de l'élève (`db.tirage.graine`). Une graine vide (contrôle au chargement, enseignant) donne aussi un défaut.
export const defautDe = (graine) => (hasard(`${graine || ''}|${ID}|defaut-site`).entier(0, 1) ? 'affichage' : 'extincteur');
export const defautDeBase = (db) => defautDe(graineDeBase(db || {}));
// Ce que chaque défaut fait dire (inspection, fiche « En attendant », question B, phrases, corrigé).
export const SITE = {
  extincteur: {
    objet: 'extincteur', absent: 'absent', present: 'present',
    lib: 'Extincteur absent au quai B', libOk: 'Extincteur en place au quai B',
    repare: 'Bien vu. L’extincteur du quai B arrive après-demain.',
    manque: 'L’extincteur du quai B n’est pas là.',
    question: 'L’extincteur manque. Qui doit le faire installer ?',
    phrase: 'Il manque l’extincteur du quai B : je travaille au quai A.',
  },
  affichage: {
    objet: 'affichage', absent: 'absent', present: 'affiche',
    lib: 'Plan de circulation absent au quai B', libOk: 'Plan de circulation affiché au quai B',
    repare: 'Bien vu. Le plan sera affiché demain.',
    manque: 'Le plan de circulation n’est pas affiché.',
    question: 'Le plan de circulation n’est pas affiché. Qui doit s’en occuper ?',
    phrase: 'Le plan de circulation n’est pas affiché : Yann m’a montré le sens.',
  },
};
const autre = (d) => (d === 'extincteur' ? 'affichage' : 'extincteur');

// L'inspection d'un élève (vue « Inspection du poste », fonction de la graine) : mêmes ids et même structure pour toutes les graines
// (1 défaut, 1 essai). `site-manque` = le défaut tiré (non réparable : il reste absent après le signalement) ; `site-en-ordre` = l'autre
// objet du site, en ordre (le piège : ne pas le signaler) ; `tp1` = le transpalette n° 1, en ordre, avertisseur qui sonne.
export function inspectionDe(graine) {
  const d = defautDe(graine), D = SITE[d], O = SITE[autre(d)];
  return {
    id: INSPECTION_ID, libelle: 'Mon poste', qui: 'Erwan',
    consigne: 'Avec ta liste, regarde ton poste et ton transpalette. Clique ce qui ne va pas, puis signale-le.',
    vues: ['charge', 'quai'],
    points: [
      { id: 'tp1', objet: 'transpalette', n: 1, etat: 'ok', ok: true, lib: 'Transpalette n° 1 en ordre' },
      { id: 'site-manque', objet: D.objet, etat: D.absent, ok: false, reparable: false, lib: D.lib, repare: D.repare },
      { id: 'site-en-ordre', objet: O.objet, etat: O.present, ok: true, lib: O.libOk },
    ],
    essai: { objet: 'transpalette', n: 1, resultat: 'sonne' },
    arret: 'Attends : regarde encore ton poste avec la liste.',
    commencer: 'C’est bon, je prends mon poste',
    bilan: 'Avant de prendre ton poste, on regarde tout ce qui est sur la liste.',
  };
}

// ─────────────────────────────────────────────────────────────── « En attendant » (fiche à cases, choix selon le défaut)
// Les deux justes, puis les pièges (brief §4, étape 2). Les clés sont neutres ; l'ordre affiché est tiré par élève.
export const CASES_ATTENTE = {
  extincteur: [
    { v: 'quai-a', lib: 'Je travaille au quai A, où il y a un extincteur.', juste: true },
    { v: 'noter', lib: 'Je le note dans mon compte rendu à Erwan.', juste: true },
    { v: 'quai-b', lib: 'Je travaille au quai B comme d’habitude.', juste: false },
    { v: 'deplacer', lib: 'Je prends l’extincteur du quai A pour le mettre au quai B.', juste: false },
    { v: 'rentrer', lib: 'Je rentre chez moi.', juste: false },
  ],
  affichage: [
    { v: 'sens', lib: 'Je demande à Yann de me montrer le sens de circulation.', juste: true },
    { v: 'noter', lib: 'Je le note dans mon compte rendu à Erwan.', juste: true },
    { v: 'ou-je-veux', lib: 'Je roule où je veux.', juste: false },
    { v: 'dessiner', lib: 'J’affiche moi-même un plan dessiné à la main.', juste: false },
    { v: 'pas-poste', lib: 'Je ne prends pas mon poste.', juste: false },
  ],
};
export const casesAttente = (db) => CASES_ATTENTE[defautDeBase(db)];
export const attenteJuste = (d, coches) => CASES_ATTENTE[d].every((c) => c.juste === (coches || []).includes(c.v));

// ─────────────────────────────────────────────────────────────── le planning des quais (grille IDENTIQUE pour toute la classe)
// Construit. Le retour de ramasse de Loïc et la livraison du transporteur pour Agri-Kerlann (brief §6.2), tous deux au quai A (voir l'en-tête).
const toMin = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
export const minutesDe = toMin;
const z2 = (n) => String(n).padStart(2, '0');
export const versHHMM = (m) => `${z2(Math.floor(m / 60))}:${z2(m % 60)}`;
export const heureLue = (m) => `${Math.floor(m / 60)} h${m % 60 ? ` ${z2(m % 60)}` : ''}`;
export const QUAIS = [{ id: 'A', nom: 'Quai A' }, { id: 'B', nom: 'Quai B' }];
export const nomQuai = (q) => (QUAIS.find((x) => x.id === q) || {}).nom || q;
export const CAMIONS = [
  { id: 'loic', quai: 'A', de: '07:30', a: '08:15', titre: 'Retour de ramasse (Loïc)', court: 'Loïc', lib: 'le camion de Loïc' },
  { id: 'agri', quai: 'A', de: '09:00', a: '10:00', titre: 'Livraison pour Agri-Kerlann (transporteur)', court: 'Agri-Kerlann',
    lib: 'la livraison pour Agri-Kerlann' },
];
// La carte à poser : la Biscuiterie Ar Vag, une heure, entre 10 h et 12 h.
export const CARTE = { id: 'ar-vag', titre: 'Biscuiterie Ar Vag — 1 h', court: 'Ar Vag', des: '10:00', avant: '12:00', duree: 60 };
export const ECHELLE = { debut: '06:00', fin: '12:00', pas: 15 };

// Les LECTURES, calculées sur une grille (la vraie, ou une grille modifiée par un test) : { q, choix: [{ v, lib }], juste, justes }.
export function lecturesDe(camions = CAMIONS) {
  const loic = camions.filter((c) => c.id === 'loic');
  const agri = camions.filter((c) => c.id === 'agri');
  const L = loic[0] || null, G = agri[0] || null;
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
  R['l-fin-agri'] = { q: 'À quelle heure la livraison pour Agri-Kerlann libère-t-elle son quai ?', juste: G ? G.a : null, justes: agri.map((c) => c.a),
    choix: choixHeures(G ? toMin(G.a) : null) };
  return R;
}
// Les places justes de la carte (quai, minute de début), avec le défaut de l'élève : un quai libre pendant l'heure, dans la fenêtre, et
// jamais le quai B quand son extincteur manque.
export function placesJustes(defaut, camions = CAMIONS) {
  const P = [];
  QUAIS.forEach((q) => {
    if (defaut === 'extincteur' && q.id === 'B') return;
    for (let m = toMin(CARTE.des); m + CARTE.duree <= toMin(CARTE.avant); m += ECHELLE.pas) {
      if (!camions.some((c) => c.quai === q.id && toMin(c.de) < m + CARTE.duree && toMin(c.a) > m)) P.push([q.id, m]);
    }
  });
  return P;
}
// Le CONTRÔLE de la grille (au chargement : la séance refuse de s'ouvrir s'il rend quelque chose) — chaque lecture a UNE seule bonne réponse,
// parmi ses choix, sans choix en double ; la carte a au moins une place juste DANS LES DEUX VARIANTES ; heures sur le quart d'heure, dans
// l'échelle ; pas deux camions à la fois sur un quai.
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
  DEFAUTS.forEach((d) => { if (!placesJustes(d, camions).length) E.push(`la carte « ${CARTE.court} » n’a aucune place juste (défaut ${d})`); });
  return E;
}
{ const E = ecartsGrille(); if (E.length) throw new Error(`ENT-10.2 : le planning ne tient pas — ${E.join(' ; ')}`); }
export const LECTURES = lecturesDe();

// Ce que disent les phrases et le dernier message, LU dans la grille.
const LOIC = CAMIONS.find((c) => c.id === 'loic');
export const HEURE_LOIC = heureLue(toMin(LOIC.de));                         // « 7 h 30 »
export const QUAI_LOIC = nomQuai(LOIC.quai).replace(/^Q/, 'q');             // « quai A »
const SUIVANT = CAMIONS.filter((c) => c !== LOIC).sort((a, b) => toMin(a.de) - toMin(b.de))[0];
const AUTRE_QUAI = nomQuai(QUAIS.find((q) => q.id !== LOIC.quai).id).replace(/^Q/, 'q');

// ─────────────────────────────────────────────────────────────── le tirage des lectures (brief §6.2, §6 bis)
export const BANQUE_LECTURES = [
  { id: 'l-loic-heure', difficulte: 'facile' }, { id: 'l-loic-quai', difficulte: 'facile' },
  { id: 'l-premier-libre', difficulte: 'moyen' }, { id: 'l-combien', difficulte: 'moyen' },
  { id: 'l-fin-agri', difficulte: 'difficile' },
];
export const TIRAGE = declarerTirage({
  banques: {
    lectures: { pieces: BANQUE_LECTURES, melange: { facile: 1, moyen: 1 }, bonus: { confirme: { difficile: 1 } }, ordre: 'melange' },
  },
});
TIRAGE.lier(ID);
const parId = (id) => BANQUE_LECTURES.find((p) => p.id === id);
// Sans tirage (base vide au chargement, enseignant) : la première de chaque difficulté.
export const DEFAUT_LECTURES = ['l-loic-heure', 'l-premier-libre'];
export const lecturesTirees = (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, 'lectures') : DEFAUT_LECTURES.map(parId));
export const lecturesBonus = (db) => TIRAGE.piecesBonus(db, 'lectures');
// L'ordre des cases d'une fiche, tiré par élève (sans graine : l'ordre déclaré).
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db || {}); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };

// ─────────────────────────────────────────────────────────────── rendre compte (phrases à choisir, `juste: 0`, mélangées à l'écran)
export const phrasesCompteRendu = (prenom, db) => {
  const d = defautDeBase(db);
  return { id: PHRASES_ID, melanger: true, lignes: [
    { id: 'salutation', choix: ['Bonjour Erwan,', 'Salut mon grand,', 'Monsieur le directeur général,'], juste: 0 },
    { id: 'engin', choix: ['J’ai contrôlé le transpalette n° 1 : il est en ordre.', 'Je n’ai pas eu le temps de regarder le transpalette.',
      'Le transpalette n° 1 est en panne.'], juste: 0 },
    { id: 'manque', choix: [SITE[d].phrase, 'Il ne manque rien.', SITE[autre(d)].phrase], juste: 0 },
    { id: 'heure', choix: [`Loïc revient à ${HEURE_LOIC} au ${QUAI_LOIC}.`, `Loïc revient à ${heureLue(toMin(SUIVANT.de))} au ${AUTRE_QUAI}.`,
      'Loïc ne revient pas ce matin.'], juste: 0 },
    { id: 'fin', choix: [`Je suis au quai A. ${prenom}`, 'Bisous', 'À plus.'], juste: 0 },
  ] };
};

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche déjà envoyée une fois (même rouverte par « Corriger » ensuite) : la suite ne se referme pas.
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
export const visiteFinie = (db) => geste(db, `entrepot:${VISITE_ID}:visite:fin`);
export const planningEnvoye = (db) => !!(db && db.plannings && db.plannings[PLANNING_ID] && db.plannings[PLANNING_ID].v1);
// La place envoyée de la carte : { r: 'A' | 'B', … } ou null.
export const placeCarte = (db) => { const v = planningEnvoye(db) ? db.plannings[PLANNING_ID].v1 : null; return (v && v.place && v.place[CARTE.id]) || null; };
