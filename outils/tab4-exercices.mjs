// TAB-4 — calcule les contrôles des treize exercices et écrit contenus/tab4-cap-ol.js.
//
//     node outils/tab4-exercices.mjs
//
// Les données viennent de outils/tab4-donnees.json, le MÊME fichier que lit
// outils/tab4-classeurs.py. Une seule source : un chiffre changé là change le classeur et
// le corrigé ensemble.
//
// RÈGLE DE MIGRATION, tenue depuis TAB-1 : le générateur RECALCULE les valeurs attendues
// depuis les données, il ne les recopie pas. Aucun nombre attendu ne figure dans le JSON.
//
// Ce que TAB-4 n'a pas, et qu'il faut remplacer : TAB-1, TAB-2 et TAB-3 venaient de la
// Suite Logistique, dont les corrigés impératifs ont été exécutés avec des comparateurs
// instrumentés, puis confrontés aux valeurs recalculées. Ici il n'existe aucun corrigé
// d'origine à confronter, puisque le module est neuf. Trois vérifications prennent sa
// place, faites à chaque génération, et le script échoue si l'une d'elles tombe :
//
//   1. chaque cellule visée est VIDE dans le classeur modèle — si la réponse y était déjà,
//      l'exercice n'en serait pas un ;
//   2. chaque cellule visée tombe dans une colonne déclarée `aRemplir`, ou sur une case
//      d'indicateur — un contrôle qui pointerait à côté passerait sinon inaperçu ;
//   3. aucune case à remplir du classeur n'est laissée sans contrôle — sinon l'élève
//      travaillerait pour rien sur une cellule que personne ne regarde.
//
// Le test de la suite ajoute un quatrième filet, écrit à la main : il dépose un classeur
// rempli des valeurs attendues et exige le sans-faute, et il porte des repères de position
// explicites (E12:E18 pour cap01, C22:C27 pour cap13) qui ne passent pas par la géométrie
// du JSON. Un garde-fou qui réutiliserait le calcul qu'il vérifie ne vérifierait rien.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.join(ICI, '..');
const DONNEES = path.join(RACINE, 'outils', 'tab4-donnees.json');
const CLASSEURS = path.join(RACINE, 'contenus', 'tab4');
const SORTIE = path.join(RACINE, 'contenus', 'tab4-journee-entrepot.js');

const d = JSON.parse(fs.readFileSync(DONNEES, 'utf8'));
const GEO = d.geometrie;
const CAT = new Map(d.catalogue.map((a) => [a.ref, a]));

// ------------------------------------------------------------------- outillage
const lettre = (i) => String.fromCharCode(65 + i); // 0 → A ; au-delà de Z, inutile ici.

/** Index (0-based) d'une colonne par sa clé, dans le tableau d'un exercice. */
function indexColonne(ex, cle) {
  const i = ex.tableau.colonnes.findIndex((c) => c.cle === cle);
  if (i < 0) throw new Error(`${ex.id} : colonne « ${cle} » absente du tableau`);
  return i;
}

const colonneDe = (ex, cle) => lettre(indexColonne(ex, cle));
const ligneDe = (j) => GEO.premiereLigne + j;

/** La valeur d'une donnée : celle de la ligne, sinon celle du catalogue. */
function valeur(ligne, cle) {
  if (cle in ligne) return ligne[cle];
  const art = CAT.get(ligne.ref);
  if (art && cle in art) return art[cle];
  throw new Error(`donnée « ${cle} » introuvable pour ${JSON.stringify(ligne)}`);
}

const nombres = (ex, cle) => ex.tableau.lignes.map((l) => valeur(l, cle));
const somme = (xs) => xs.reduce((a, b) => a + b, 0);

/** Première ligne du bloc d'indicateurs — même règle que dans le script Python. */
function premiereLigneIndicateurs(ex) {
  return GEO.premiereLigne + ex.tableau.lignes.length - 1 + GEO.decalageIndicateurs;
}

// ------------------------------------------------- les contrôles, par type de calcul
//
// Chaque fonction rend la liste des contrôles d'une colonne remplie ligne à ligne. Le
// libellé porte le numéro de ligne : c'est ce que l'élève lit dans son tableau de
// résultats, et il doit pouvoir retrouver la cellule sans compter.

function parLigne(ex, cle, libelle, calculer, tolerance) {
  const col = colonneDe(ex, cle);
  return ex.tableau.lignes.map((ligne, j) => {
    const attendu = calculer(ligne, j);
    const c = { cellule: `${col}${ligneDe(j)}`, libelle: `${libelle}, ligne ${ligneDe(j)}`, attendu };
    if (typeof attendu === 'number' && tolerance) c.tolerance = tolerance;
    return c;
  });
}

const CALCULS = {
  // L'élève recopie une donnée que la consigne lui fournit : aucun calcul, mais le bon
  // emplacement. C'est l'exercice 1, et c'est le geste le plus souvent raté.
  saisie: (ex, k) => parLigne(ex, k.colonne, k.libelle, (l) => valeur(l, k.colonne)),

  difference: (ex, k) => parLigne(ex, k.colonne, k.libelle,
    (l) => valeur(l, k.de) - valeur(l, k.moins), k.tolerance),

  egalite: (ex, k) => parLigne(ex, k.colonne, k.libelle,
    (l) => valeur(l, k.de) === valeur(l, k.et)),

  plusMoins: (ex, k) => parLigne(ex, k.colonne, k.libelle,
    (l) => valeur(l, k.base) + valeur(l, k.plus) - valeur(l, k.moins), k.tolerance),

  produit: (ex, k) => parLigne(ex, k.colonne, k.libelle,
    (l) => valeur(l, k.de) * valeur(l, k.par), k.tolerance),

  produitDivise: (ex, k) => parLigne(ex, k.colonne, k.libelle,
    (l) => (valeur(l, k.de) * valeur(l, k.par)) / k.divisePar, k.tolerance),

  // `<` strict, comme la formule donnée aux élèves : un stock égal au mini n'est pas en
  // alerte. C'est le cas que les exercices 9 et 10 font exprès rencontrer.
  siSeuil: (ex, k) => parLigne(ex, k.colonne, k.libelle,
    (l) => (valeur(l, k.valeur) < valeur(l, k.seuil) ? k.siVrai : k.siFaux)),

  conversionVolume: (ex, k) => {
    const sorties = [];
    ex.tableau.lignes.forEach((ligne, j) => {
      const r = ligneDe(j);
      const enM = [];
      k.dimensions.forEach((dim) => {
        const v = valeur(ligne, dim.cm) / k.diviseur;
        enM.push(v);
        sorties.push({
          cellule: `${colonneDe(ex, dim.m)}${r}`,
          libelle: `${dim.libelle}, ligne ${r}`, attendu: v, tolerance: k.tolerance,
        });
      });
      sorties.push({
        cellule: `${colonneDe(ex, k.volume.colonne)}${r}`,
        libelle: `${k.volume.libelle}, ligne ${r}`,
        attendu: enM.reduce((a, b) => a * b, 1), tolerance: k.volume.tolerance,
      });
    });
    return sorties;
  },

  // Rien à remplir dans le tableau : tout le travail est dans le bloc d'indicateurs.
  indicateurs: () => [],
};

// ----------------------------------------------------- les contrôles des indicateurs
const INDICATEURS = {
  somme: (ex, t) => somme(nombres(ex, t.colonne)),
  nb: (ex, t) => nombres(ex, t.colonne).length,
  min: (ex, t) => Math.min(...nombres(ex, t.colonne)),
  max: (ex, t) => Math.max(...nombres(ex, t.colonne)),
  moyenne: (ex, t) => somme(nombres(ex, t.colonne)) / nombres(ex, t.colonne).length,
  ecartSommes: (ex, t) => somme(nombres(ex, t.colonne)) - somme(nombres(ex, t.moins)),
  sommeGroupe: (ex, t) => somme(ex.tableau.lignes
    .filter((l) => l[t.groupe] === t.valeur)
    .map((l) => valeur(l, t.colonne))),
  // La somme d'une colonne que l'élève vient lui-même de calculer : on refait le calcul
  // ligne à ligne plutôt que de lire les contrôles déjà émis, pour ne pas faire dépendre
  // un attendu d'un autre attendu.
  sommeCalculee: (ex) => {
    const k = ex.calcul;
    const parLigneValeur = ex.tableau.lignes.map((l) => (k.type === 'produit'
      ? valeur(l, k.de) * valeur(l, k.par)
      : (valeur(l, k.de) * valeur(l, k.par)) / k.divisePar));
    return somme(parLigneValeur);
  },
};

function controlesIndicateurs(ex) {
  const totaux = ex.totaux || [];
  const premiere = premiereLigneIndicateurs(ex);
  return totaux.map((t, i) => {
    const calculer = INDICATEURS[t.type];
    if (!calculer) throw new Error(`${ex.id} : indicateur « ${t.type} » inconnu`);
    const c = {
      cellule: `${GEO.colonneIndicateurs}${premiere + i}`,
      libelle: t.libelle,
      attendu: calculer(ex, t),
    };
    if (t.tolerance) c.tolerance = t.tolerance;
    return c;
  });
}

// --------------------------------------------------------- les trois vérifications
function cellulesARemplir(ex) {
  /* Toutes les cases beiges du classeur, déduites de la même déclaration que le Python. */
  const refs = new Set();
  ex.tableau.colonnes.forEach((col, i) => {
    if (!col.aRemplir) return;
    ex.tableau.lignes.forEach((_, j) => refs.add(`${lettre(i)}${ligneDe(j)}`));
  });
  const premiere = premiereLigneIndicateurs(ex);
  (ex.totaux || []).forEach((_, i) => refs.add(`${GEO.colonneIndicateurs}${premiere + i}`));
  return refs;
}

function verifier(ex, controles, XLSX) {
  const fichier = path.join(CLASSEURS, `${ex.id}-${ex.fichier}.xlsx`);
  if (!fs.existsSync(fichier)) {
    throw new Error(`${ex.id} : classeur absent — lancez d'abord outils/tab4-classeurs.py`);
  }
  const f = XLSX.read(fs.readFileSync(fichier)).Sheets['Exercice'];
  if (!f) throw new Error(`${ex.id} : le classeur n'a pas d'onglet « Exercice »`);

  const attendues = cellulesARemplir(ex);
  const visees = new Set(controles.map((c) => c.cellule));

  controles.forEach((c) => {
    // 1. la cellule doit être vide dans le modèle.
    if (f[c.cellule] !== undefined && f[c.cellule].v !== undefined && f[c.cellule].v !== '') {
      throw new Error(`${ex.id} : le modèle contient déjà une réponse en ${c.cellule}`);
    }
    // 2. et elle doit être une case à remplir, pas une cellule au hasard.
    if (!attendues.has(c.cellule)) {
      throw new Error(`${ex.id} : le contrôle ${c.cellule} ne tombe pas sur une case à remplir`);
    }
  });

  // 3. aucune case à remplir ne doit rester sans contrôle.
  const oubliees = [...attendues].filter((r) => !visees.has(r));
  if (oubliees.length) {
    throw new Error(`${ex.id} : ${oubliees.length} case(s) à remplir sans contrôle : ${oubliees.join(', ')}`);
  }
  return fichier;
}

// --------------------------------------------------------------------- l'écriture
const guillemets = (s) => JSON.stringify(s);

function ecrireControle(c) {
  const bouts = [`cellule: ${guillemets(c.cellule)}`, `libelle: ${guillemets(c.libelle)}`,
    `attendu: ${typeof c.attendu === 'string' ? guillemets(c.attendu) : c.attendu}`];
  if (c.tolerance) bouts.push(`tolerance: ${c.tolerance}`);
  return `    { ${bouts.join(', ')} },`;
}

function ecrireExercice(ex, numero, controles) {
  return ['  {',
    `    id: ${guillemets(ex.id)},`,
    `    titre: ${guillemets(`${numero} — ${ex.titre}`)},`,
    `    groupe: ${guillemets(ex.bloc)},`,
    `    objectif: ${guillemets(ex.objectif)},`,
    `    moment: ${guillemets(ex.moment)},`,
    `    geste: ${guillemets(ex.geste)},`,
    `    fichier: ${guillemets(`${ex.id}-${ex.fichier}.xlsx`)},`,
    '    controles: [',
    controles.map(ecrireControle).join('\n'),
    '    ],',
    '  },'].join('\n');
}

async function main() {
  // xlsx n'est pas une dépendance du site : il ne sert qu'aux outils, comme pour les tests.
  let XLSX = null;
  for (const base of [process.env.NODE_PATH, path.join(RACINE, 'node_modules'),
    '/usr/local/lib/node_modules', '/usr/lib/node_modules'].filter(Boolean)) {
    const cible = path.join(base, 'xlsx', 'xlsx.mjs');
    if (fs.existsSync(cible)) { XLSX = await import(pathToFileURL(cible).href); break; }
  }
  if (!XLSX) throw new Error('module xlsx introuvable — npm install -g xlsx@0.18.5');
  XLSX.set_fs(fs);

  const morceaux = [];
  let total = 0;
  d.exercices.forEach((ex, i) => {
    const calculer = CALCULS[ex.calcul.type];
    if (!calculer) throw new Error(`${ex.id} : calcul « ${ex.calcul.type} » inconnu`);
    const controles = [...calculer(ex, ex.calcul), ...controlesIndicateurs(ex)];
    if (!controles.length) throw new Error(`${ex.id} : aucun contrôle`);
    verifier(ex, controles, XLSX);
    morceaux.push(ecrireExercice(ex, i + 1, controles));
    total += controles.length;
    console.log(`  ${ex.id} — ${controles.length} contrôles — ${ex.titre}`);
  });

  const entete = `// TAB-4 — Une journée en entrepôt, chez ${d.entreprise.nom}.
//
// ⚠️ FICHIER GÉNÉRÉ — ne pas modifier à la main.
// Sources : outils/tab4-donnees.json (les données) et outils/tab4-exercices.mjs (le calcul).
// Après toute modification des données, relancer LES DEUX outils, dans cet ordre :
//     python outils/tab4-classeurs.py
//     node outils/tab4-exercices.mjs
//
// ${d.exercices.length} exercices, ${total} contrôles, tous corrigés automatiquement.
// Les classeurs modèles sont dans contenus/tab4/ et sont FABRIQUÉS, non repris de la Suite
// Logistique : aucun corrigé caché ne peut y voyager.
//
// Les exercices suivent une seule journée de travail, de la réception du matin à
// l'expédition du soir, et les mêmes références d'un bout à l'autre. L'ordre est une
// progression de gestes Excel : saisir, soustraire, comparer, SOMME, formule à trois
// termes, multiplier, MIN/MAX, puis SI — d'abord donné, ensuite écrit par l'élève —, puis
// la référence figée et les conversions. Ne pas réordonner sans refaire cette progression.
//
// Les valeurs attendues portent toutes leurs décimales, sans arrondi intermédiaire ; les
// tolérances sont déclarées dans le JSON, au plus près de ce qui est demandé (0,02 € sur
// un montant, 0,01 kg sur un poids, 0,001 m³ sur un volume).

export const EXERCICES = [
`;
  fs.writeFileSync(SORTIE, entete + morceaux.join('\n') + '\n];\n', 'utf8');
  console.log(`\ncontenus/tab4-journee-entrepot.js écrit — ${d.exercices.length} exercices, ${total} contrôles.`);
}

main().catch((e) => { console.error('ÉCHEC : ' + e.message); process.exit(1); });
