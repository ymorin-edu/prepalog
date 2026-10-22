// ENT-8.13 — Action, « la palette d'à côté » : les DONNÉES PURES de la séance (le stock du soir, les palettes tirées par élève, la palette de
// Kevin et la nuit, l'entrepôt d'un élève pour le mode `palettier` à deux phases, les phrases du compte rendu calculées SUR SON CHEMIN). Aucun effet
// de bord à l'import, aucune dépendance au navigateur : le contenu (`contenus/action-ent813.js`), les questions (`contenus/questions/ENT-8.13.js`), le
// corrigé (`contenus/corriges/ENT-8.13.js`) et les tests l'importent. Brief : `docs/briefs/ENT-8.13-action-palette-a-cote.md` ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-palettier.md` §3 et §4 (elles passent avant le brief là où elles diffèrent).
//
// VÉRIFIÉ (Cowork, brief §2) : l'entrepôt Action d'Ensuès-la-Redonne exploité par Geodis ; la préparation à la voix à Ensuès (offre France Travail
// 191TDTN) ; Action livre la région marseillaise depuis Ensuès (communiqué de 2023) ; C. trav. L4122-1 (texte repris d'ENT-8.11).
// CONSTRUIT (dit dans la séance, `MENTION`) : l'allée, les adresses et le stock (ceux d'ENT-8.11, LUS : plan, stock de départ, produits et cartons) ;
// les palettes « à évacuer cette nuit » ; la fin de poste du jeudi soir, le lendemain à 6 h ; Kevin qui pousse et pose sa palette sans scan ; Yanis,
// préparateur (personnage NOUVEAU, construit, sans visage) ; « le magasin de Marseille » (aucun magasin nommé, aucune adresse). Samia et Kevin : univers
// `contenus/action.js`. Aucune parole prêtée à un salarié réel.
//
// LE SOIR (un jeudi, 20 h 30 ; aucune date écrite) : deux palettes au sol. P1 (adresse libre : l'échauffement, non notée) ; P3, dont l'adresse
// donnée est OCCUPÉE par une palette « à évacuer cette nuit » (produit `EVA`) ; le système a une ADRESSE LIBRE à donner (`adresseLibre`, au sol, dans
// la même allée, loin de P3). Le même soir, Kevin pose SA palette P9 « à côté » de son adresse (occupée elle aussi par une palette à évacuer), sans
// scan : l'élève ne la voit que comme un emplacement occupé. LA NUIT : les deux palettes à évacuer partent (les deux adresses données se libèrent) ;
// P3 restée en réception est posée par Kevin, sans scan, à `alleeVers` (un emplacement libre de la MÊME travée que son adresse).
// LE LENDEMAIN (6 h) : la palette cherchée est P3 si le système la croit ailleurs que là où elle est, sinon P9 (`paletteCherchee`, lot 5).
//
// LE TIRAGE (par élève, graine = son identifiant + « |action-palette-a-cote », `tirerJeu` de `core/tirage.js`) : trois produits DIFFÉRENTS (P1, P3,
// P9) ; P3 et P9 au sol dans deux allées différentes, chacune sur un emplacement LIBRE du stock d'ENT-8.11 qui reçoit une palette à évacuer ; dans
// la travée de chacune, au moins un autre emplacement libre au sol (`alleeVers` pour P3, `posee` pour P9) ; autour de P3 (même travée, travées
// voisines du même côté) deux emplacements libres au moins (de quoi « poser à côté ») ; l'adresse libre de P3 au sol, dans son allée, hors de ses
// voisines ; P1 au sol, libre, hors des travées de P3, de P9 et de l'adresse libre, et hors de leurs voisines. En cherchant dans la travée de
// l'adresse vide, la palette se trouve en 3 ouvertures au plus (l'adresse vide, puis les deux autres emplacements). ⚠ Le jeu d'un élève est une
// fonction de son identifiant ET de ce fichier (et du stock d'ENT-8.11) : ne rien changer pendant qu'une classe joue la séance.

import { tirerJeu, graineDeBase, hasard, niveauEleve } from '../core/tirage.js';
import { PRODUITS, CODES, PLAN, STOCK as STOCK_811, adresse, decoupe, poidsDe, MAIL_DOMAINE, MENTION_ALLEE, unDe } from './action-ent811-donnees.js';

export { PRODUITS, CODES, PLAN, decoupe, poidsDe, MENTION_ALLEE, unDe };
export const ID = 'action-palette-a-cote';
export const ID_VOLET = 'action-ent813';
export const ENTREPOT_ID = 'action-palette-a-cote';   // les gestes publiés : `entrepot:action-palette-a-cote:<geste>`
export const PHRASES_ID = 'samia';
export const KEVIN_MAIL = `kevin@${MAIL_DOMAINE}`;
export const SAMIA_MAIL = `samia@${MAIL_DOMAINE}`;
export const YANIS_MAIL = `yanis@${MAIL_DOMAINE}`;
// Les sujets des messages (lus par les tests).
export const SUJETS = { accueil: 'Dernière demi-heure', kevin: 'Elle est prise ?', soir: 'Bonne soirée', yanis: 'C’est vide', matin: 'Ce matin',
  compte: 'C’est réglé ?', fin: 'Merci' };
export const CONSIGNE_SOIR = 'Range les palettes.';   // neutre (§6 bis) : ne dit pas qu'une adresse est prise
export const CONSIGNE_MATIN = 'Trouve la palette. Puis remets-la en ordre au terminal.';
export const BOUTON_LENDEMAIN = 'Le lendemain, 6 h';

// La palette « à évacuer cette nuit » : un produit de la vue, lu de près (« Occupé : À évacuer cette nuit »).
export const EVA = 'EVA';
export const KG_EVA = 300;
export const PRODUITS_VUE = { ...Object.fromEntries(CODES.map((k) => [k, { nom: PRODUITS[k].nom, court: PRODUITS[k].court }])),
  [EVA]: { nom: 'À évacuer cette nuit', court: 'À évacuer' } };

/* ================================================================== le sol, les voisines */
const z2 = (n) => String(n).padStart(2, '0');
export const SOL = ['A1', 'A2', 'B1', 'B2'].flatMap((c) => [1, 2, 3, 4].flatMap((t) => [1, 2, 3].map((e) => adresse(c, t, 1, e))));
export const libreDepart = (a) => !STOCK_811[a];
// La travée (côté compris) d'une adresse : « A1-T02 ».
export const traveeDe = (a) => { const d = decoupe(a); return d ? `${d.c}-T${z2(d.t)}` : ''; };
// Les deux autres emplacements au sol de la même travée.
export const memeTravee = (a) => { const d = decoupe(a); return [1, 2, 3].filter((e) => e !== d.e).map((e) => adresse(d.c, d.t, 1, e)); };
// « À côté » : la même travée et les travées voisines du même côté, au sol.
export const voisines = (a) => {
  const d = decoupe(a);
  return [...memeTravee(a), ...[d.t - 1, d.t + 1].filter((t) => t >= 1 && t <= 4).flatMap((t) => [1, 2, 3].map((e) => adresse(d.c, t, 1, e)))];
};

/* ================================================================== le tirage */
export const PALETTES_IDS = ['P1', 'P3'];
function tirer(h) {
  const pris = new Set();
  const prendreProduit = () => { const k = h.choisir(CODES.filter((x) => !pris.has(x))); pris.add(k); return k; };
  const produit = { P1: prendreProduit(), P3: prendreProduit(), P9: prendreProduit() };
  const a3 = h.choisir(SOL.filter((a) => libreDepart(a) && memeTravee(a).some(libreDepart) && voisines(a).filter(libreDepart).length >= 2));
  const allee = h.choisir(memeTravee(a3).filter(libreDepart));
  const a9 = h.choisir(SOL.filter((a) => a[0] !== a3[0] && libreDepart(a) && memeTravee(a).some(libreDepart)));
  const posee = h.choisir(memeTravee(a9).filter(libreDepart));
  const loin3 = new Set([a3, ...voisines(a3)]);
  const libre = h.choisir(SOL.filter((a) => libreDepart(a) && a[0] === a3[0] && !loin3.has(a) && traveeDe(a) !== traveeDe(a3) && a !== a9 && a !== posee));
  const interdites = new Set([a3, a9, libre, ...voisines(a3), ...voisines(a9)]);
  const travees = new Set([traveeDe(a3), traveeDe(a9), traveeDe(libre)]);
  const a1 = h.choisir(SOL.filter((a) => libreDepart(a) && !interdites.has(a) && !travees.has(traveeDe(a))));
  return { produit, adresse: { P1: a1, P3: a3, P9: a9 }, libre, allee, posee };
}
// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré). Rejouées sur 200 graines par le bloc de tests.
export function verifier(jeu) {
  const f = [];
  if (!jeu || !jeu.produit || !jeu.adresse) return ['jeu incomplet'];
  const P = jeu.produit, A = jeu.adresse;
  if (['P1', 'P3', 'P9'].some((id) => !PRODUITS[P[id]])) return ['produit inconnu'];
  if (new Set([P.P1, P.P3, P.P9]).size !== 3) f.push('deux palettes du même produit');
  const toutes = [A.P1, A.P3, A.P9, jeu.libre, jeu.allee, jeu.posee];
  if (toutes.some((a) => !SOL.includes(a))) return ['une adresse qui n’est pas au sol'];
  if (new Set(toutes).size !== toutes.length) f.push('deux adresses identiques');
  if (toutes.some((a) => !libreDepart(a))) f.push('une adresse déjà prise dans le stock de départ');
  if (A.P3[0] === A.P9[0]) f.push('P3 et P9 dans la même allée');
  if (!memeTravee(A.P3).includes(jeu.allee)) f.push('alleeVers pas dans la travée de P3');
  if (!memeTravee(A.P9).includes(jeu.posee)) f.push('P9 pas posée dans sa travée');
  if (voisines(A.P3).filter(libreDepart).length < 2) f.push('moins de deux emplacements libres autour de P3');
  if (jeu.libre[0] !== A.P3[0] || voisines(A.P3).includes(jeu.libre) || traveeDe(jeu.libre) === traveeDe(A.P3)) f.push('adresse libre de P3 à côté d’elle ou dans une autre allée');
  if ([A.P3, A.P9, jeu.libre].map(traveeDe).includes(traveeDe(A.P1)) || [...voisines(A.P3), ...voisines(A.P9)].includes(A.P1)) f.push('P1 trop près de P3 ou de P9');
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-action-ent813').jeu;
if (!DECL.secours) throw new Error('ENT-8.13 : le tirage ne donne aucun jeu conforme (tirer et verifier se contredisent)');
export const TIRAGE = DECL;

const jeux = new Map();
// Le jeu d'une graine (l'identifiant de l'élève ; '' : le jeu de référence, vu par l'enseignant), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));
// Le stock du soir : celui d'ENT-8.11, plus les deux palettes à évacuer (aux adresses données de P3 et de P9).
export const stockDe = (jeu) => Object.assign({}, STOCK_811, { [jeu.adresse.P3]: { produit: EVA, kg: KG_EVA }, [jeu.adresse.P9]: { produit: EVA, kg: KG_EVA } });
// Une palette pleine d'un produit, au format du mode `palettier` (kg : UN carton ; la vue calcule le poids).
const palette = (id, k, a) => ({ id, nom: PRODUITS[k].nom, cartons: PRODUITS[k].cartons, kg: PRODUITS[k].kg, adresse: a });
export const nomDe = (jeu, id) => PRODUITS[jeu.produit[id]].nom;
// L'ouverture la plus serrée pour `trouveeVite` : 4 (le brief), 3 au confirmé (la même enquête, un peu plus vite : décision n° 10).
export const trouveEnDe = (niveau) => (niveau === 'confirme' ? 3 : 4);

/* ================================================================== l'entrepôt d'un élève (graine, niveau) */
export const REGLES = {
  titre: 'Les règles',
  entete: 'Ranger, retrouver, transférer',
  lignes: [
    'L’<b>adresse</b> est sur l’étiquette de la palette. <b>Niveau 1, au sol</b> : tu poses toi-même.',
    'Toujours <b>scanner</b> : la palette, puis l’emplacement. Le système ne sait que ce que tu scannes.',
    'L’adresse est prise : le <b>Terminal</b> peut donner une <b>adresse libre</b>.',
    'Une palette qui n’est pas à sa place : tu la <b>transfères</b> au Terminal (la palette, puis l’emplacement où elle doit aller).',
  ],
};
// Entraînement : « Les règles » repliées ; de près, la plaque seule (`aideCharge: 'plaque'`) ; après le lendemain, le nom du critère seul
// (l'adresse attendue en plus chez l'accompagné). Aucune copie.
export function entrepotDe(graine, { niveau = 'standard' } = {}) {
  const jeu = jeuDe(graine);
  return {
    id: ENTREPOT_ID, libelle: 'Plan de l’entrepôt', mode: 'palettier',
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'jeudi, 20 h 30', texte: CONSIGNE_SOIR },
    plan: PLAN,
    produits: PRODUITS_VUE,
    stock: stockDe(jeu),
    palettes: [palette('P1', jeu.produit.P1, jeu.adresse.P1), Object.assign(palette('P3', jeu.produit.P3, jeu.adresse.P3), { adresseLibre: jeu.libre })],
    cariste: { nom: 'Kevin', niveaux: [2, 3, 4] },
    aideCharge: 'plaque',
    verdict: niveau === 'accompagne' ? 'adresse' : 'critere',
    terminal: { nom: 'Terminal' },
    regles: REGLES,
    phases: [{ id: 'soir' }, { id: 'lendemain', bouton: BOUTON_LENDEMAIN, date: 'le lendemain, 6 h', consigne: CONSIGNE_MATIN }],
    lendemain: {
      kevin: { palette: palette('P9', jeu.produit.P9, jeu.adresse.P9), posee: jeu.posee },
      nuit: { evacuees: [jeu.adresse.P3, jeu.adresse.P9], alleeVers: jeu.allee },
      trouveEn: trouveEnDe(niveau),
      eleve: 'P3',
    },
  };
}

/* ================================================================== les phrases du compte rendu (brief §6.2), calculées sur SON chemin */
// `ch` : { chemin: 'kevin' (bon geste le soir : on cherche P9) | 'posee' (P3 posée ailleurs que là où le système la croit) | 'reception' (P3 laissée
// en réception, posée la nuit par Kevin), systeme (l'adresse où Yanis est envoyé), reelle (où elle était le matin), trouvee, vers (l'adresse du
// transfert, ou null) }. Chaque ligne : la juste en premier (`juste: 0`), l'ordre affiché est tiré par élève. Une erreur ne se paie qu'une fois :
// « où » et « ce que j'ai fait » sont justes s'ils disent ce qu'il a VRAIMENT fait (pas trouvée, laissée là…). « C'est la faute de Kevin. » ne
// coûte que la forme (COORDINATION n° 7) : la ligne « ce qui s'est passé » est jugée juste avec elle aussi (`contenus/action-ent813.js`).
export const SALUTATIONS = ['Bonjour Samia,', 'Salut,', 'Coucou Samia !'];
export const finsDe = (prenom) => [prenom, 'Bisous'];
export const FAUTE_KEVIN = 'C’est la faute de Kevin.';
export const NE_SAIS_PAS = 'Je ne sais pas.';
export const PASSE = {
  kevin: 'Une palette a été posée hier soir à côté de son adresse, sans scan.',
  posee: 'Hier soir, j’ai posé P3 à côté de son adresse sans la scanner.',
  reception: 'Hier soir, j’ai laissé P3 en réception : elle a été posée cette nuit à côté de son adresse, sans scan.',
};
export const PAS_TROUVEE = 'Je ne l’ai pas trouvée.';
export const LAISSEE = 'Je l’ai laissée là.';
export const PREVENU = 'J’ai prévenu Yanis.';
export const RIEN = 'Je n’ai rien pu transférer.';
export const etaitEn = (a) => `Elle était en ${a}.`;
export const transferee = (a) => `Je l’ai transférée en ${a} et scannée : le système est à jour.`;
// Une autre adresse de la travée de l'adresse vide, ni elle ni celle où était la palette (un piège qui ne dit jamais où elle était).
export const autreAdresse = (systeme, reelle) => memeTravee(systeme).find((a) => a !== reelle);
export function lignesCompte(ch) {
  const chemin = ch && PASSE[ch.chemin] ? ch.chemin : 'kevin';
  const sys = (ch && ch.systeme) || SOL[0];
  const passe = [PASSE[chemin], FAUTE_KEVIN, NE_SAIS_PAS, chemin === 'posee' ? PASSE.reception : PASSE.posee];
  const autre = autreAdresse(sys, ch && ch.reelle);
  const ou = ch && ch.trouvee ? [etaitEn(ch.reelle), etaitEn(sys), etaitEn(autre), PAS_TROUVEE] : [PAS_TROUVEE, etaitEn(sys), etaitEn(autre)];
  const fait = ch && ch.vers ? [transferee(ch.vers), LAISSEE, PREVENU]
    : ch && ch.trouvee ? [LAISSEE, transferee(sys), PREVENU] : [RIEN, transferee(sys), LAISSEE];
  return { passe, ou, fait };
}

/* ================================================================== aides de lecture (contenu, questions, corrigé, tests) */
export const niveauDeBase = (db) => niveauEleve(db);
// Le nom complet d'un geste publié par le plan d'entrepôt (`entrepot:action-palette-a-cote:<geste>`).
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;
// Le geste `nom` est-il rangé dans la base (une fois, avec son heure) ?
export const gesteFait = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Un mélange tiré par élève (graine), le même à chaque ouverture.
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };
