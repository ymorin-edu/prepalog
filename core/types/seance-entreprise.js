// Fabrique de séance d'entreprise (chantier 8 de la feuille de route, 08/10/2026).
//
// Avant : chacune des séances d'entreprise recopiait 23 à 32 lignes identiques (les neuf clés de
// l'univers, `etapes`/`accueil`/`volet` lus du contenu, `rubrique`, `immersif`, `tables`, `portee`,
// `bareme`, les chemins de `corrige` et de `trame`, `rendre`…). Ici, tout ce qui se déduit se déduit.
//
//   import { seanceEntreprise } from '../core/types/seance-entreprise.js';
//   import * as PICARD from '../contenus/picard.js';            // l'univers de l'entreprise
//   import * as SEANCE from '../contenus/picard-ent42.js';      // le contenu de CETTE séance
//   const s = seanceEntreprise(PICARD, SEANCE, {
//     id: 'picard-ent42', code: 'ENT-4.2', titre: '…', desc: '…', niveaux: ['1re'],
//     competences: ['C1.4', 'C1.3'], temps: 'entrainement', trame: 'picard-deux-camions',
//     pret: true, ouverture: 'prof',
//   }, { menu: [], exercice: '…', quai: SEANCE.QUAI_ENT42 });
//   export const meta = s.meta;
//   export const rendre = s.rendre;
//   // export const noter = s.noter;     // seulement pour une évaluation (`copie: true`)
//
// CE QUI EST DÉDUIT (une valeur écrite dans `meta` l'emporte toujours sur la valeur déduite) :
//   - dans `meta` : `rubrique: 'simulog'`, `immersif: true`, `portee: 'eleve'`, `tables: {}`,
//     `bareme` = nombre de jalons (`SEANCE.ETAPES.length`), `corrige` = `./contenus/corriges/<code>.js`
//     (`corrige: false` = cette séance n'a pas de corrigé : la clé disparaît du `meta`) ;
//   - pour `creerEntreprise` : les neuf clés de l'univers (ci-dessous) et deux clés d'univers FACULTATIVES (`couleurs`,
//     `livraisons` : ce que le moteur n'importe plus des contenus, lot 9b ; absentes, elles ne font rien refuser), `etapes` ← `SEANCE.ETAPES`,
//     `accueil` ← `SEANCE.ACCUEIL`, `volet` ← `SEANCE.VOLET`, `copie` ← `meta.copie`, et `trame`
//     (liens du bandeau) ← `./contenus/trames/<code>-<slug>-trame-eleve.pdf|docx`, où le `<slug>` est
//     déclaré UNE fois dans `meta.trame` (il ne se déduit pas de l'`id`). Pas de `meta.trame` = pas
//     de trame. `meta.trame` est consommé ici : la clé n'est pas dans le `meta` rendu (le bandeau
//     lit la trame dans la configuration du moteur, jamais dans `meta`).
//
// L'ORDRE, du plus faible au plus fort : l'univers de l'entreprise < le contenu de la séance (une
// clé de même nom exportée par `contenus/<séance>.js`, ex. un `CATALOGUE` propre à la séance) <
// `options` (ce que la séance passe elle-même). Tout le reste (`menu`, `quai`, `plan`, `tournee`,
// `planning`, `entrepot`, `lexique`, `exercice`, `stockOuvert`, `sansTrame`…) se range dans
// `options` et part tel quel à `creerEntreprise`. Rien n'est ajouté pour `menu` : sans lui, tous
// les écrans de données restent (règle de Tristan, « au moindre doute l'écran reste »).
//
// REFUS (la séance ne se charge pas, avec son `id` dans le message) : un `meta` sans `id` ou sans
// `code`, un contenu sans `ETAPES`, une clé d'univers introuvable nulle part, un `meta.trame` qui
// n'est pas un nom (la forme `{ pdf, docx }` se passe en `options`).

import { creerEntreprise } from './entreprise.js';
import { estTirage, fautesTirage, aDesBonus } from '../tirage.js';

// Les neuf clés qui décrivent l'entreprise et que `creerEntreprise` exige.
export const CLES_UNIVERS = ['ENTREPRISE', 'VOCAB', 'CATALOGUE', 'SUPPLIERS', 'SUP_BY_ID', 'CUSTOMERS', 'CM',
  'baseDeDepart', 'THEME'];

// Deux clés d'univers FACULTATIVES (chantier 9, lot 9b, 08/10/2026) : les couleurs des variantes d'un catalogue et les
// modes de livraison des commandes. Le moteur n'importe plus aucun fichier de `contenus/` : l'univers qui en a besoin
// les exporte (Spartoo : couleurs et livraisons ; Cdiscount : livraisons), les autres n'ont rien à déclarer.
export const CLES_FACULTATIVES = ['couleurs', 'livraisons'];

// Compose le `meta` complet et les options de `creerEntreprise`, sans créer le moteur
// (pour que les tests puissent l'appeler avec de fausses données).
export function composerSeance(UNIVERS, SEANCE, meta, options = {}) {
  const id = meta && meta.id ? meta.id : null;
  const nom = id ? `« ${id} »` : `(sans id${meta && meta.code ? `, code ${meta.code}` : ''})`;
  const refus = (phrase) => { throw new Error(`Séance ${nom} : ${phrase}`); };

  if (!meta || typeof meta !== 'object') refus('le meta est absent.');
  if (!id) refus('le meta n\'a pas d\'« id ».');
  if (!meta.code) refus('le meta n\'a pas de « code ».');
  if (!SEANCE || !Array.isArray(SEANCE.ETAPES)) refus('le contenu de la séance n\'exporte pas ETAPES (la liste des jalons).');
  if (!UNIVERS) refus('l\'univers de l\'entreprise est absent.');
  if (meta.trame !== undefined && typeof meta.trame !== 'string') {
    refus('« trame » du meta est le nom de la trame (ex. \'picard-deux-camions\') ; la forme { pdf, docx } se passe dans les options.');
  }

  // `correction: true` rouvre l'écran des jalons faux (un jalon qui déclare `ecran` : fiche, phrases, planning) et moyenne
  // le premier bilan avec l'état après correction. Sans aucun jalon à `ecran`, il n'y a rien à corriger et la note ne
  // bouge jamais : c'est l'erreur qu'on fait en l'activant sur une séance qui juge en continu (Spartoo, Boost : aucun
  // jalon à `ecran`). Ce contrôle ne PROUVE pas que la séance juge à l'envoi (voir docs/chantiers.md, lot 9a).
  if (meta.correction === true && !SEANCE.ETAPES.some((e) => e && e.ecran)) {
    refus('« correction: true » rouvre l\'écran des jalons faux, et aucun jalon de cette séance ne déclare d\'« ecran » '
      + '(fiche, phrases ou planning) : il n\'y aurait rien à corriger. Une séance qui juge en continu n\'a pas ce drapeau.');
  }

  // 1. Le meta : le déduit, puis ce que la séance écrit.
  const { trame: slug, ...ecrit } = meta;
  const complet = {
    rubrique: 'simulog',
    immersif: true,
    portee: 'eleve',
    tables: {},
    bareme: SEANCE.ETAPES.length,
    corrige: `./contenus/corriges/${meta.code}.js`,
    ...ecrit,
  };
  if (complet.corrige === false) delete complet.corrige;

  // 2. Les options : univers < contenu de la séance < options.
  const opts = {};
  for (const cle of CLES_UNIVERS) {
    const v = [options[cle], SEANCE[cle], UNIVERS[cle]].find((x) => x !== undefined);
    if (v === undefined) {
      refus(`la clé d'univers « ${cle} » n'est ni dans l'univers de l'entreprise, ni dans le contenu de la séance, ni dans les options.`);
    }
    opts[cle] = v;
  }
  for (const cle of CLES_FACULTATIVES) {
    const v = [options[cle], SEANCE[cle], UNIVERS[cle]].find((x) => x !== undefined);
    if (v !== undefined) opts[cle] = v;
  }
  opts.etapes = SEANCE.ETAPES;
  if (SEANCE.ACCUEIL !== undefined) opts.accueil = SEANCE.ACCUEIL;
  if (SEANCE.VOLET !== undefined) opts.volet = SEANCE.VOLET;
  // Le tirage mémorisé (chantier D-C, lot 2) : `export const TIRAGE = declarerTirage({ … })` dans le contenu de la séance.
  if (SEANCE.TIRAGE !== undefined) opts.tirage = SEANCE.TIRAGE;
  if (complet.copie !== undefined) opts.copie = complet.copie;
  if (slug) {
    const base = `./contenus/trames/${meta.code}-${slug}-trame-eleve`;
    opts.trame = { pdf: `${base}.pdf`, docx: `${base}.docx` };
  }
  Object.assign(opts, options);

  // Un tirage déclaré : sans faute, lié à CETTE séance, et une séance qui tire des cas bonus déclare le niveau confirmé.
  const T = opts.tirage;
  if (T && typeof T === 'object' && (estTirage(T) || T.banques)) {
    const decl = estTirage(T) ? T.decl : T;
    const fautes = fautesTirage(decl);
    if (fautes.length) refus(`le tirage : ${fautes.join(' ; ')}`);
    if (aDesBonus(decl) && !(Array.isArray(complet.niveauxPrevus) && complet.niveauxPrevus.includes('confirme'))) {
      refus('le tirage prévoit des cas bonus du confirmé : le meta doit déclarer « niveauxPrevus: [\'confirme\'] ».');
    }
    if (estTirage(T)) { try { T.lier(id); } catch (e) { refus(e.message); } }
  }

  return { meta: complet, options: opts };
}

// La fabrique : rend `{ meta, rendre, noter }`. `noter` n'est exporté par le fichier de séance que
// pour une évaluation (`copie: true`).
export function seanceEntreprise(UNIVERS, SEANCE, meta, options = {}) {
  const { meta: complet, options: opts } = composerSeance(UNIVERS, SEANCE, meta, options);
  // Un refus du moteur (option inconnue, `id` de vue en double…) nomme la séance : sur vingt-quatre séances chargées d'un coup,
  // « l'option « quay » n'existe pas » ne dirait pas laquelle.
  let moteur;
  try { moteur = creerEntreprise(opts); } catch (e) { e.message = `Séance « ${complet.id} » : ${e.message}`; throw e; }
  return {
    meta: complet,
    rendre: (hote, ctx) => moteur.rendre(hote, ctx),
    noter: (db) => moteur.noter(db),
  };
}
