// ENT-10.3 — Transports Pelleau, « on commence quand même ? » : les DONNÉES PURES de la séance (brief `docs/briefs/ENT-10.3-pelleau-on-commence-quand-meme.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant le brief : 9 aucun jour de la semaine, 10 ids suffixés `-103`,
// 11 `dialogueFini` et « Signaler à Erwan », 13 aucun chiffre attendu écrit à la main). Aucun effet de bord, aucune interface, aucun dessin : importé par le
// contenu (`contenus/pelleau-ent103.js`), les questions (`contenus/questions/ENT-10.3.js`), le corrigé (`contenus/corriges/ENT-10.3.js`, chargé aussi sous
// Node) et les tests.
//
// ERREUR INDUITE (entraînement de CAP-C1.2) : c'est Yann, pressé, qui pousse à commencer sans contrôler ou à faire avec ce qui manque. Yann n'est pas méchant :
// il est pressé et il croit bien faire.
//
// CE QUI EST TIRÉ (fonction pure de la graine = l'identifiant de l'élève, `db.tirage.graine` ; rien n'est rangé) :
//   - `variante` : « S » (le site n'est pas fini : extincteur du quai B ou plan de circulation absent) ou « E » (l'engin n'a pas été contrôlé : le
//     transpalette n° 2, que Yann a sorti, a un défaut) ; moitié-moitié ;
//   - `defaut` : le défaut de l'élève. S : `extincteur` ou `affichage` ; E : `fourcheTordue`, `batterie`, `fuite`, `roueAbimee`, `arretUrgence` ou
//     `avertisseur` (muet : seul l'essai le montre), uniforme ;
//   - tout le reste (inspection, dialogue de Yann, fiche, phrases, corrigé) est CALCULÉ sur ce défaut : aucun texte ne nomme un autre défaut que le sien,
//     sauf les pièges.
//   ⚠ Ne pas changer la formule ni les listes pendant qu'une classe joue la séance (le jeu des élèves changerait) : un cas de test le rappelle.
//
// ÉCARTS AVEC LE BRIEF (dits au chef dans le compte rendu) :
//   1. Le quai dessiné par la vue « Inspection du poste » porte « QUAI B » sur sa porte (la vue n'offre pas de nom de quai) : le site manque donc de
//      l'extincteur / du plan DU QUAI B et l'élève travaille au quai A (comme ENT-10.2). Le brief disait l'inverse.
//   2. Les trois « points en ordre » : l'inspection déclare toujours les trois mêmes objets (transpalette n° 2, extincteur, plan) en plus du n° 1, dont
//      exactement un est en défaut (ids `defaut`, `ordre-1`, `ordre-2`, `tp1` pour toutes les graines : la vue le demande) ; le brief n'en voulait qu'un.
//   3. Le n° 2 est dessiné et cliquable dans les deux variantes (décision du chef sur la question d'ENT-10.2) ; ses deux avertisseurs s'essaient
//      (`essai-1`, `essai-2`, 0,5 chacun = les « avertisseur(s) essayé(s) 1 » du brief).
//   4. « Juste au 2e tour » (réplique « Tu l'as contrôlé, toi ? ») : la vue ne le sait pas ; repli de la feuille : seule la PREMIÈRE réponse compte.
//   5. Pas d'arrêt de l'inspection (`arret: false`, le brief le dit ; la phrase d'arrêt d'ENT-10.2 n'existe pas ici).

import { hasard, graineDeBase } from '../core/tirage.js';

export const ID = 'pelleau-on-commence-quand-meme';
export const ID_VOLET = 'pelleau-ent103';
export const INSPECTION_ID = 'pelleau-poste-103';
export const DIALOGUE_1 = 'pelleau-yann-103-1';
export const DIALOGUE_2 = 'pelleau-yann-103-2';
export const PHRASES_ID = 'compte-rendu-erwan-103';
export const JOUR = 6;   // 6 mai (2026) : aucun jour de la semaine écrit
export const FICHES = { signalement: 'signalement-103' };
// Les trois lignes de la fiche « Signalement » (ids des listes : ils entrent dans les gestes `fiche:signalement-103:<ligne>`).
export const LIGNES = { quoi: 'quoi', pas: 'pas', fait: 'fait' };

// ─────────────────────────────────────────────────────────────── les défauts possibles
// Un défaut, tout ce qu'on en dit. `objet`/`n`/`etat` : ce que déclare la vue d'inspection ; `lib` : le bilan ; `vu` : la phrase du compte rendu ;
// `qui` : la question B ; `pas` et `fait` : les cases JUSTES de la fiche ; `faitPhrase` : la phrase juste « ce que j'ai fait » du compte rendu ;
// `yann` : la réplique de Yann à la deuxième rencontre et les quatre réponses de l'élève (la juste est `refuse`).
const ENGIN = (etat, lib, vu) => ({ genre: 'engin', objet: 'transpalette', n: 2, etat, lib, libOk: 'Transpalette n° 2 en ordre', vu,
  qui: 'Qui fait réparer le transpalette n° 2 ?',
  pas: { v: 'tp2', lib: 'Ne pas utiliser le transpalette n° 2' },
  fait: { v: 'tp1', lib: 'J’ai pris le n° 1, contrôlé, et mis le n° 2 de côté' },
  faitPhrase: 'J’ai pris le n° 1 et mis le n° 2 de côté.',
  yann: { dit: 'Le n° 2 marche, roule doucement, ça ira. On commence quand même ?',
    refuse: 'Je prends le n° 1, je l’ai contrôlé. Le n° 2, je le mets de côté avec un mot pour Erwan.',
    commence: 'D’accord, je roule doucement.', bricole: 'Je le répare moi-même.', abandon: 'Je décharge à la main, sans engin.' } });
const SITE = (objet, etat, sain, lib, libOk, vu, qui, pas, fait, faitPhrase, yann) => ({ genre: 'site', objet, etat, sain, lib, libOk, vu, qui, pas, fait, faitPhrase, yann });
export const DEFAUTS = {
  extincteur: SITE('extincteur', 'absent', 'present', 'Extincteur absent au quai B', 'Extincteur en place au quai B',
    'Il manque l’extincteur du quai B.', 'Qui fait installer l’extincteur ?',
    { v: 'quai-b', lib: 'Ne pas travailler au quai B' }, { v: 'quai-a', lib: 'On travaille au quai A, où il y a un extincteur' },
    'On a travaillé au quai A, où il y a un extincteur.',
    { dit: 'L’extincteur du quai B arrive cette semaine. On commence quand même ?',
      refuse: 'On travaille au quai A, où il y en a un, et je préviens Erwan par écrit.', commence: 'Oui, on commence.',
      bricole: 'Je prends l’extincteur du quai A pour le mettre au quai B.', abandon: 'Je rentre chez moi.' }),
  affichage: SITE('affichage', 'absent', 'affiche', 'Plan de circulation absent au quai B', 'Plan de circulation affiché au quai B',
    'Le plan de circulation du quai B n’est pas affiché.', 'Qui fait afficher le plan de circulation ?',
    { v: 'sens', lib: 'Ne pas rouler sans connaître le sens de circulation' }, { v: 'sens-montre', lib: 'Yann m’a montré le sens de circulation' },
    'Yann m’a montré le sens de circulation.',
    { dit: 'Le plan de circulation sera affiché cette semaine. On commence quand même ?',
      refuse: 'Montre-moi le sens de circulation, et je préviens Erwan par écrit.', commence: 'Oui, on roule.',
      bricole: 'Je dessine un plan moi-même.', abandon: 'On ne travaille pas aujourd’hui.' }),
  fourcheTordue: ENGIN('fourcheTordue', 'Transpalette n° 2 : fourche tordue', 'Le transpalette n° 2 a une fourche tordue.'),
  batterie: ENGIN('batterie', 'Transpalette n° 2 : batterie pas chargée (câble débranché)', 'Le transpalette n° 2 a une batterie pas chargée.'),
  fuite: ENGIN('fuite', 'Transpalette n° 2 : fuite sous l’engin', 'Le transpalette n° 2 fuit : il y a une flaque dessous.'),
  roueAbimee: ENGIN('roueAbimee', 'Transpalette n° 2 : roue abîmée', 'Le transpalette n° 2 a une roue abîmée.'),
  arretUrgence: ENGIN('arretUrgence', 'Transpalette n° 2 : bouton d’arrêt d’urgence absent', 'Le transpalette n° 2 n’a plus son bouton d’arrêt d’urgence.'),
  avertisseur: ENGIN('avertisseur', 'Transpalette n° 2 : avertisseur muet', 'L’avertisseur du transpalette n° 2 ne sonne pas.'),
};
export const CLES_SITE = ['extincteur', 'affichage'];
export const CLES_ENGIN = ['fourcheTordue', 'batterie', 'fuite', 'roueAbimee', 'arretUrgence', 'avertisseur'];
export const CLES = [...CLES_SITE, ...CLES_ENGIN];

// ─────────────────────────────────────────────────────────────── le jeu d'une graine
const MEMO = new Map();
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (MEMO.has(g)) return MEMO.get(g);
  const flux = (nom) => hasard(`${g}|${ID}|${nom}`);
  const variante = flux('variante').entier(0, 1) ? 'E' : 'S';
  const defaut = variante === 'S' ? flux('site').choisir(CLES_SITE) : flux('engin').choisir(CLES_ENGIN);
  const jeu = Object.freeze({ graine: g, variante, defaut });
  MEMO.set(g, jeu);
  return jeu;
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
export const defautDeBase = (db) => jeuDeBase(db).defaut;
export const D = (cle) => DEFAUTS[cle];
// Un autre défaut que celui de l'élève, choisi sur sa graine (le piège de « ce que j'ai vu »), et trois défauts faux pour la fiche.
export const autreDefaut = (jeu) => hasard(`${jeu.graine}|${ID}|autre`).choisir(CLES.filter((c) => c !== jeu.defaut));
export const faux3 = (jeu) => hasard(`${jeu.graine}|${ID}|faux3`).prendre(CLES.filter((c) => c !== jeu.defaut), 3);

// ─────────────────────────────────────────────────────────────── l'inspection (vue « Inspection du poste », fonction de la graine)
// Mêmes `id` pour toutes les graines : `tp1` (n° 1, en ordre), `defaut` (l'objet en défaut de l'élève), `ordre-1` et `ordre-2` (les deux autres objets
// parmi transpalette n° 2, extincteur, plan, en ordre). Deux essais : le n° 1 sonne ; le n° 2 est muet seulement quand son défaut est l'avertisseur.
const OBJETS_TIRES = [
  { cle: 'tp2', objet: 'transpalette', n: 2 }, { cle: 'extincteur', objet: 'extincteur' }, { cle: 'affichage', objet: 'affichage' },
];
const OK = {
  tp2: { etat: 'ok', lib: 'Transpalette n° 2 en ordre' },
  extincteur: { etat: 'present', lib: DEFAUTS.extincteur.libOk },
  affichage: { etat: 'affiche', lib: DEFAUTS.affichage.libOk },
};
const cleObjet = (d) => (d.objet === 'transpalette' ? 'tp2' : d.objet);
// Le texte « signalement reçu » : identique que le point soit en défaut ou non (Erwan est en réunion, il ne dit pas si c'est juste). Voir `signaler`
// (clé `signaler.reponse` du moteur depuis le 20/10/2026 : la phrase unique, sans astuce sur `repare`, `rien`, `deja` ni `fin`).
export const REPONSE_ERWAN = 'Reçu. Je lis ça à ma sortie de réunion.';
export function inspectionDe(graine, { niveau = 'standard' } = {}) {
  const jeu = jeuDe(graine), d = D(jeu.defaut), cle = cleObjet(d);
  let k = 0;
  const points = [{ id: 'tp1', objet: 'transpalette', n: 1, etat: 'ok', ok: true, lib: 'Transpalette n° 1 en ordre' }];
  OBJETS_TIRES.forEach((o) => {
    const base = o.n ? { objet: o.objet, n: o.n } : { objet: o.objet };
    if (o.cle === cle) points.push({ id: 'defaut', ...base, etat: d.etat, ok: false, reparable: false, lib: d.lib });
    else points.push({ id: `ordre-${++k}`, ...base, etat: OK[o.cle].etat, ok: true, lib: OK[o.cle].lib });
  });
  return {
    id: INSPECTION_ID, libelle: 'Mon poste', qui: 'Erwan',
    consigne: niveau === 'confirme' ? 'Regarde ton poste et tes deux transpalettes. Clique ce qui ne va pas, puis signale-le.'
      : 'Avec ta liste, regarde ton poste et tes deux transpalettes. Clique ce qui ne va pas, puis signale-le.',
    vues: ['charge', 'quai'],
    points,
    essai: [{ objet: 'transpalette', n: 1, resultat: 'sonne' }, { objet: 'transpalette', n: 2, resultat: jeu.defaut === 'avertisseur' ? 'muet' : 'sonne' }],
    arret: false,
    commencer: 'C’est bon, je prends mon poste',
    // Erwan est en réunion : la même réponse à tout signalement, défaut ou non (rien ne dit « juste » ou « faux » ici).
    signaler: { reponse: REPONSE_ERWAN, vide: 'Il faut d’abord cliquer ce que tu veux signaler.' },
    bilan: 'Avant de prendre ton poste, on regarde tout ce qui est sur la liste et on signale ce qui ne va pas.',
  };
}

// ─────────────────────────────────────────────────────────────── le dialogue de Yann (face à face)
// Première rencontre : la même pour tous. Seule la PREMIÈRE réponse compte (« Tu l'as contrôlé, toi ? » ne rachète pas : repli, voir l'en-tête).
export const REPLIQUES_1 = [
  { id: 'depart', dit: 'Salut ! Le camion de 6 h 30 arrive, faut aller vite. J’ai sorti le transpalette n° 2 pour toi, vas-y !', choix: [
    { v: 'controle', juste: true, lib: 'Je le contrôle d’abord, ça prend deux minutes.' },
    { v: 'vas-y', lib: 'D’accord, j’y vais.', reaction: 'Vas-y, vite… Tu n’oublies rien ? Erwan tient à sa liste.' },
    { v: 'tu-as', lib: 'Tu l’as contrôlé, toi ?', reaction: 'Euh… non. Fais-le, alors.' },
    { v: 'attends', lib: 'Je t’attends, fais-le pour moi.', reaction: 'Moi ? J’ai le camion qui arrive, je n’ai pas le temps !' }] },
];
export const FIN_1 = 'Allez, fais vite. Je file au quai.';
export const JUSTE_1 = { depart: 'controle' };
// Deuxième rencontre : le texte de Yann et les quatre réponses suivent le défaut de l'élève (les clés et la juste sont les mêmes pour tous). Les réactions
// sont les mêmes pour toutes les variantes (elles ne disent ni juste ni faux).
export const REPLIQUES_2 = [
  { id: 'insiste', dit: 'Bon. On commence quand même ?', choix: [
    { v: 'refuse', juste: true, lib: 'Je ne commence pas comme ça, et je préviens Erwan par écrit.' },
    { v: 'commence', lib: 'Oui, on commence.', reaction: 'Et si Erwan nous demande pourquoi on n’a rien dit ?' },
    { v: 'bricole', lib: 'Je le fais moi-même.', reaction: 'Tout seul ? Ce n’est pas notre boulot, ça.' },
    { v: 'abandon', lib: 'Je pars.', reaction: 'Hé, pas si vite ! Il y a quand même un camion qui arrive.' }],
    selon: (db) => { const y = D(defautDeBase(db)).yann;
      return { dit: y.dit, libs: { refuse: y.refuse, commence: y.commence, bricole: y.bricole, abandon: y.abandon } }; } },
];
export const FIN_2 = 'OK, t’as raison. On fait comme ça.';
export const JUSTE_2 = { insiste: 'refuse' };

// ─────────────────────────────────────────────────────────────── la fiche « Signalement » (3 listes, choix calculés sur le défaut)
// Les clés des choix sont neutres ; l'ordre affiché est tiré par élève (`melangerPour`).
const PAS_FAUX = [{ v: 'rien', lib: 'Ne rien changer à mon travail' }, { v: 'silence', lib: 'Ne rien écrire à personne' }];
const FAIT_FAUX = [{ v: 'comme-d-habitude', lib: 'J’ai commencé comme d’habitude' }, { v: 'attendu', lib: 'J’ai attendu sans rien faire' }];
export function choixSignalement(jeu) {
  const d = D(jeu.defaut);
  const quoi = [{ v: jeu.defaut, lib: d.lib, juste: true }, ...faux3(jeu).map((c) => ({ v: c, lib: D(c).lib }))];
  // « Ce qu'on ne fait pas » : la case juste du défaut, puis un piège (le faux travail d'un autre défaut) et deux inactions.
  const piege = d.pas.v === 'quai-b' ? { v: 'tp2', lib: 'Ne pas utiliser le transpalette n° 2' } : { v: 'quai-b', lib: 'Ne pas travailler au quai B' };
  const pas = [{ ...d.pas, juste: true }, piege, ...PAS_FAUX];
  const fait = [{ ...d.fait, juste: true }, ...FAIT_FAUX, { v: 'tp2-d-abord', lib: 'J’ai commencé avec le n° 2' }];
  return { quoi, pas, fait };
}
export const LIB_LIGNES = {
  quoi: 'Qu’est-ce qui ne va pas ?', pas: 'Ce qu’on ne fait pas', fait: 'Ce que j’ai fait',
};
export const MANQUE_LIGNES = { quoi: 'ce qui ne va pas', pas: 'ce qu’on ne fait pas', fait: 'ce que tu as fait' };
export const justeSignalement = (jeu, ligne) => choixSignalement(jeu)[ligne].find((c) => c.juste).v;

// ─────────────────────────────────────────────────────────────── rendre compte (phrases à choisir, `juste: 0`, mélangées à l'écran)
export const SALUTATIONS = ['Bonjour Erwan,', 'Salut mon grand,', 'Yo,'];
export const fins = (prenom) => [`À tout à l’heure. ${prenom}`, 'Bisous', 'Voilà.'];
export const phrasesCompteRendu = (prenom, db) => {
  const jeu = jeuDeBase(db), d = D(jeu.defaut), a = D(autreDefaut(jeu));
  return { id: PHRASES_ID, melanger: true, lignes: [
    { id: 'salutation', choix: SALUTATIONS, juste: 0 },
    { id: 'vu', choix: [d.vu, 'Tout était en ordre.', a.vu], juste: 0 },
    { id: 'fait', choix: [d.faitPhrase, 'J’ai commencé avec le n° 2.', 'J’ai attendu ton retour sans rien faire.'], juste: 0 },
    { id: 'fin', choix: fins(prenom), juste: 0 },
  ] };
};

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche déjà envoyée une fois (même rouverte par « Corriger » ensuite) : la suite ne se referme pas.
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
// L'ordre des cases d'une liste, tiré par élève (sans graine : l'ordre déclaré).
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db || {}); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };
