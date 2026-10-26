// ENT-13.3 — Stellantis Sochaux, « la méthode ABC au tableur » : les DONNÉES de la séance (tirage des sorties, export, contrôles du dépôt). Importable sous Node.
// Brief : `docs/briefs/ENT-13.3-stellantis-methode-abc.md` (§4 à §6 bis). Séance : `contenus/stellantis-ent133.js`.
//
// Chaque élève a SES sorties de la semaine 37 : mêmes 18 références (24 pour un élève « confirmé », mêmes contrôles), valeurs tirées avec un contrôle
// d'équité (aucune égalité, seuils nets, 4 A / 5 B / 9 C ; voir `stellantis-abc.js`). Le tirage est rangé à la première ouverture et ne change plus.

import { declarerTirage, hasard } from '../core/tirage.js';
import { REFS, N_STANDARD, N_CONFIRME, refsDe, parEmplacement, REF_AU_MEILLEUR } from './stellantis.js';
import { classer, jeuSorties, ecartsEquite, REPARTITION, EXEMPLE_18 } from './stellantis-abc.js';
import { resultatDepot } from '../core/types/export-tableur.js';

export const ID = 'stellantis-methode-abc';
export const ID_VOLET = 'abc-1';
export const ID_EXPORT = 'sorties';
export const ID_DEPOT = 'abc';
export const FICHIER = 'stellantis-sorties-semaine37.xlsx';
export const COLONNES = ['Référence', 'Désignation', 'Famille', 'Emplacement', 'Sorties'];

// ─────────────────────────────────────────────────────────────── le tirage
// Une banque qui ne sert qu'à décrire les références (toutes « fixes » : la même pièce pour tous) ; ce qui change d'un élève à l'autre, ce sont les sorties (`valeurs`).
export const TIRAGE = declarerTirage({
  banques: {
    refs: {
      pieces: REFS.map((r) => ({ id: r.ref, titre: `${r.ref} — ${r.designation}` })),
      fixes: REFS.map((r) => r.ref),
      melange: {},
      ordre: 'fixe',
    },
  },
  valeurs: (h) => ({ s18: jeuSorties(h, N_STANDARD).map((x) => x.v), s24: jeuSorties(h, N_CONFIRME).map((x) => x.v) }),
  verifier: (jeu) => {
    const E = [];
    [['s18', N_STANDARD], ['s24', N_CONFIRME]].forEach(([cle, n]) => {
      const L = refsDe(n).map((r, i) => ({ ref: r.ref, v: jeu.valeurs[cle][i] }));
      ecartsEquite(L, REPARTITION[n]).forEach((e) => E.push(`${cle} : ${e}`));
      // La question « une référence C au meilleur emplacement » a besoin que l'ancien rangement ait donné la meilleure place à une référence C.
      if (classer(L).classe[REF_AU_MEILLEUR] !== 'C') E.push(`${cle} : ${REF_AU_MEILLEUR} n'est pas en C`);
    });
    return E;
  },
  essais: 150,
});

const estConfirme = (db) => !!db && db.aisance === 'confirme';
// Les références de CET élève, avec leurs sorties (dans l'ordre des références). Sans tirage rangé (corrigé de la page, base vide) : le jeu d'exemple.
export function sorties(db) {
  const n = estConfirme(db) ? N_CONFIRME : N_STANDARD;
  const V = TIRAGE.valeursTirees(db);
  const L = V && V[n === N_CONFIRME ? 's24' : 's18'];
  const valeurs = Array.isArray(L) && L.length === n ? L : jeuSorties(hasard('exemple-133'), n).map((x) => x.v);
  return refsDe(n).map((r, i) => ({ ...r, v: valeurs[i] }));
}
// Ce que le tableur de l'élève doit donner : total, part, cumul, classe par référence.
export const calcul = (db) => classer(sorties(db).map((x) => ({ ref: x.ref, v: x.v })));
// Les références de l'export dans l'ordre des emplacements (la liste n'est pas triée sur les sorties : c'est le geste à faire).
export const lignesExport = (db) => parEmplacement(sorties(db)).map((r) => [r.ref, r.designation, r.famille, r.emplacement, r.v]);

// ─────────────────────────────────────────────────────────────── le dépôt
export const AIDE = 'SOMME(plage) — SI(test ; si vrai ; si faux) — un pourcentage se met au format « % » (la cellule affiche 32 %, elle vaut 0,32). Une formule commence par = .';

export function controles(db, propres = null) {
  const K = calcul(db);
  const L = (propres || []).filter((l) => l['Référence'] != null && String(l['Référence']).trim() !== '');
  const T = propres ? L.reduce((s, l) => s + (Number(l['Sorties']) || 0), 0) : K.total;
  const part = (l) => Number(l['Sorties']) / T;
  const cumul = {}, classe = {};
  // Cumul et classe se recalculent sur l'export que l'élève a réellement fait (une erreur d'export ne se paie qu'une fois).
  const cl = classer(L.map((l) => ({ ref: l['Référence'], v: Number(l['Sorties']) })));
  L.forEach((l) => { cumul[l['Référence']] = cl.cumul[l['Référence']]; classe[l['Référence']] = cl.classe[l['Référence']]; });
  const filtre = (l) => l['Référence'] != null && String(l['Référence']).trim() !== '';
  const cle = ['Référence'];
  return [
    { type: 'table', id: 'total', libelle: 'Total des sorties (fonction SOMME, ligne « Total »)', feuille: 'Sorties',
      cle: 'Désignation', colonne: 'Sorties', attendu: { Total: T }, fonctions: ['SUM'] },
    { type: 'colonne', id: 'part', libelle: 'Colonne « Part » (au format pourcentage, sans ×100)', feuille: 'Sorties', titre: 'Part', cle, filtre,
      attendu: (l) => part(l), formule: true },
    { type: 'colonne', id: 'cumul', libelle: 'Colonne « Cumul » (liste triée par sorties décroissantes)', feuille: 'Sorties', titre: 'Cumul', cle, filtre,
      attendu: (l) => cumul[l['Référence']], formule: true },
    { type: 'colonne', id: 'classe', libelle: 'Colonne « Classe » (fonction SI)', feuille: 'Sorties', titre: 'Classe', cle, filtre,
      attendu: (l) => classe[l['Référence']], fonctions: ['IF'] },
  ];
}

export const TABLEUR = {
  aide: AIDE,
  exports: [{
    id: ID_EXPORT, liste: 'Sorties de la semaine 37', fichier: FICHIER,
    indications: 1,
    feuilles: [{ nom: 'Sorties', colonnes: COLONNES, lignes: lignesExport }],
  }],
  depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', retour: 'guidage', controles },
};

// ─────────────────────────────────────────────────────────────── ce que les jalons et les questions lisent
const resultat = (db) => resultatDepot(db, ID_DEPOT);
export const depose = (db) => !!resultat(db).depose;
// Un contrôle du MEILLEUR dépôt est juste (guidage : redépôt illimité).
export const juste = (db, id) => { const c = resultat(db).controles[id]; return !!(c && c.ok); };
// Les A de l'élève : leur nombre et leur part des sorties (calculés sur les bonnes données ; la question n'est posée qu'une fois la classe juste).
export function lesA(db) {
  const K = calcul(db);
  const A = K.ordre.filter((r) => K.classe[r] === 'A');
  return { n: A.length, part: A.reduce((s, r) => s + K.part[r], 0), refs: A, total: K.ordre.length };
}
// La référence C que l'ancien rangement a mise au meilleur emplacement (la question « que faire ? »).
export const refMalPlacee = () => REF_AU_MEILLEUR;
