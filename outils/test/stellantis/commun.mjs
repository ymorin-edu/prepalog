// Suite de tests de Prepalog — les aides COMMUNES des blocs Stellantis (`stellantis-13.3` …). Créé le 26/10/2026 avec ENT-13.3, sur le modèle de
// `outils/test/ikea/commun.mjs` (sous-dossier exprès : le lanceur refuse tout `.mjs` posé directement dans `outils/test/` qui ne serait pas dans `BLOCS`).
// Reprend `ouvrirIkea` (montage de la séance dans une page à elle, vrais clics à la souris, courriel par phrases, note) et ajoute les aides du geste tableur.

export { proche } from '../pelleau/commun.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ouvrirIkea } from '../ikea/commun.mjs';

export const ouvrirStellantis = ouvrirIkea;

// SheetJS pour fabriquer le classeur « de l'élève » (comme les blocs Cdiscount).
export async function chargerXlsx(baseXlsx) {
  if (!baseXlsx) throw new Error('module xlsx introuvable — npm install --no-save --no-package-lock xlsx@0.18.5');
  return import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
}
