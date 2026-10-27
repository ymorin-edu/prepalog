// Royal Canin — les indicateurs du stock AU TABLEUR (décision de Tristan du 27/10/2026 : « la partie calcul sur des extractions Excel avec correction »,
// comme le geste tableur de Cdiscount ENT-2.2 / 2.6 et de Stellantis ENT-13.3). Importable sous Node.
//
// L'élève exporte l'état du stock du mois (menu Extractions), ajoute dans son tableur le stock moyen, la rotation, la consommation par jour, la couverture
// et l'alerte (fonction SI), calcule le taux de service sur la feuille « Commandes », puis dépose son fichier (menu Fichiers) : le site le corrige.
// Une erreur d'export ne se paie qu'une fois : tout se contrôle contre l'export que l'élève a RÉELLEMENT fait (`propres`).
//
// Quatre séances s'en servent, chacune avec SA déclaration (une déclaration de tirage = une séance) :
//   - ENT-16.1 (guidage) : le jeu fixe `D161` (vingt références), pas de filtre, retour détaillé, redépôt illimité ;
//   - ENT-16.2 (entraînement) : valeurs TIRÉES par élève, 24 références d'Aimargues et 8 de Cambrai à écarter (critère « Site »), retour « n sur m » ;
//   - ENT-16.3 (présenter à la réunion) : valeurs TIRÉES, 24 références d'Aimargues, retour détaillé (on présente des chiffres justes) ;
//   - ENT-16.6 (évaluation) : valeurs TIRÉES, Cambrai à écarter, aucune indication, un seul dépôt.
// Les chiffres sont CONSTRUITS (voir `contenus/royal-canin-donnees.js`).

import { declarerTirage, hasard } from '../core/tirage.js';
import { resultatDepot, statutExport, exportFait } from '../core/types/export-tableur.js';
import { REF, REFS_AIMARGUES, REFS_CAMBRAI, SITE, AUTRE_SITE, JOURS, OBJECTIF_COUVERTURE, D161, indicateurs } from './royal-canin-donnees.js';

export const COLONNES = ['Site', 'Référence', 'Produit', 'Stock début', 'Stock fin', 'Sorties', 'Délai (j)'];
// Les colonnes que l'élève ajoute, dans l'ordre de la fiche méthode, et les trois mots de l'alerte.
export const AJOUTS = { moyen: 'Stock moyen', rotation: 'Rotation', conso: 'Conso par jour', couverture: 'Couverture', alerte: 'Alerte' };
export const ALERTES = { rupture: 'Rupture', surstock: 'Surstock', ok: 'OK' };
export const FEUILLE = 'Stock', FEUILLE_CMD = 'Commandes', LIGNE_SERVICE = 'Taux de service';

export const AIDE = 'SI(test ; si vrai ; si faux) — un SI dans un SI : SI(test1 ; "A" ; SI(test2 ; "B" ; "C")) — un pourcentage se met au format « % » '
  + '(la cellule affiche 92 %, elle vaut 0,92). Une formule commence par = .';

const des = (r) => `${REF[r].nom}, sac ${REF[r].kg} kg`;
const ligneExport = (site) => ([r, deb, fin, sorties]) => [site, r, des(r), deb, fin, sorties, REF[r].delai];

// ─────────────────────────────────────────── le tirage d'un mois
// `h` : un générateur (`hasard`). Chaque référence reçoit une catégorie (rupture, surstock, à l'heure), puis une consommation par jour (une dizaine
// de sacs), un stock de fin qui donne une couverture loin des seuils (au moins une demi-journée du délai, un jour des 15 jours), et un stock de début.
// Une des références « à l'heure » est PRESQUE en rupture (couverture à moins d'un jour et demi au-dessus du délai) : le piège du seuil.
const ARRONDI = 10;
function uneReference(h, r, cat) {
  const d = REF[r].delai;
  const c = (REF[r].kg >= 8 ? h.entier(3, 9) : h.entier(6, 20)) * 10;
  const cible = cat === 'rupture' ? h.dixieme(Math.max(0.6, d - 3), d - 0.7)
    : cat === 'presque' ? h.dixieme(d + 0.6, d + 1.4)
      : cat === 'surstock' ? h.dixieme(16.5, 30) : h.dixieme(d + 0.7, 14);
  const fin = Math.max(ARRONDI, Math.round((cible * c) / ARRONDI) * ARRONDI);
  const deb = Math.max(ARRONDI, Math.round((fin * (0.4 + h.reel() * 2)) / ARRONDI) * ARRONDI);
  return [r, deb, fin, c * JOURS];
}
export function tirerMois(h, refs, { ruptures, surstocks }) {
  const ordre = h.melanger(refs);
  const cat = {};
  ordre.forEach((r, i) => { cat[r] = i < ruptures ? 'rupture' : i < ruptures + surstocks ? 'surstock' : i === ruptures + surstocks ? 'presque' : 'ok'; });
  const lignes = refs.map((r) => uneReference(h, r, cat[r]));
  const commandees = h.entier(120, 180) * 10;
  const completes = Math.round(commandees * h.dixieme(90, 98.5) / 100);
  return { lignes, commandees, completes };
}
// Ce qui rend un mois injouable : une couverture trop près d'un seuil, une catégorie au mauvais compte, deux ruptures aussi urgentes l'une que l'autre.
export function ecartsMois(lignes, { ruptures, surstocks }) {
  const E = [];
  const cov = (l) => l[2] / (l[3] / JOURS);
  let nR = 0, nS = 0, presque = 0;
  const manques = [];
  for (const l of lignes) {
    const d = REF[l[0]].delai, k = cov(l);
    if (k < d) { nR++; manques.push(d - k); if (d - k < 0.5) E.push(`${l[0]} : rupture trop près du délai`); if (k < 0.3) E.push(`${l[0]} : couverture presque nulle`); }
    else if (k > OBJECTIF_COUVERTURE) { nS++; if (k - OBJECTIF_COUVERTURE < 1) E.push(`${l[0]} : surstock trop près de 15 jours`); }
    else { if (k - d < 0.5) E.push(`${l[0]} : trop près du délai`); if (OBJECTIF_COUVERTURE - k < 0.5) E.push(`${l[0]} : trop près de 15 jours`); if (k - d <= 1.5) presque++; }
    if (l[1] <= 0 || l[2] <= 0 || l[3] <= 0) E.push(`${l[0]} : valeur nulle`);
  }
  if (nR !== ruptures) E.push(`${nR} ruptures au lieu de ${ruptures}`);
  if (nS !== surstocks) E.push(`${nS} surstocks au lieu de ${surstocks}`);
  if (!presque) E.push('aucune référence presque en rupture');
  manques.sort((a, b) => b - a);
  if (manques.length > 1 && manques[0] - manques[1] < 0.3) E.push('deux ruptures aussi urgentes l’une que l’autre');
  return E;
}

// ─────────────────────────────────────────── une séance au tableur
// `o` : { id (séance), mois, fichier, fixe (un jeu { ind, lignes }) | refs + quotas, autres (vrai : Cambrai à écarter), indications, retour }.
export function stockAuTableur(o) {
  const ID_EXPORT = 'stock', ID_DEPOT = 'indicateurs';
  const quotas = o.quotas || { ruptures: 3, surstocks: 4 };
  const refs = o.refs || REFS_AIMARGUES;
  const quotasCambrai = { ruptures: 1, surstocks: 2 };
  // Le tirage : une banque qui ne sert qu'à décrire les références (toutes fixes) ; ce qui change d'un élève à l'autre, ce sont les valeurs.
  const TIRAGE = o.fixe ? null : declarerTirage({
    banques: { refs: { pieces: refs.map((r) => ({ id: r, titre: `${r} — ${REF[r].nom}` })), fixes: refs.slice(), melange: {}, ordre: 'fixe' } },
    valeurs: (h) => ({ mois: tirerMois(h, refs, quotas), ...(o.autres ? { cambrai: tirerMois(h, REFS_CAMBRAI, quotasCambrai).lignes } : {}) }),
    verifier: (jeu) => {
      const V = jeu.valeurs || {};
      const E = ecartsMois((V.mois && V.mois.lignes) || [], quotas).map((x) => `Aimargues : ${x}`);
      if (o.autres) ecartsMois(V.cambrai || [], quotasCambrai).forEach((x) => E.push(`Cambrai : ${x}`));
      return E;
    },
    essais: 200,
  });
  // Sans tirage rangé (corrigé de la page, base vide, contrôle au chargement) : un jeu d'exemple conforme, toujours le même.
  let exemple = null;
  const jeuExemple = () => {
    if (exemple) return exemple;
    for (let i = 0; i < 500 && !exemple; i++) {
      const h = hasard(`exemple|${o.id}|${i}`);
      const mois = tirerMois(h, refs, quotas);
      const cambrai = o.autres ? tirerMois(h, REFS_CAMBRAI, quotasCambrai).lignes : [];
      if (!ecartsMois(mois.lignes, quotas).length && (!o.autres || !ecartsMois(cambrai, quotasCambrai).length)) exemple = { mois, cambrai };
    }
    return exemple;
  };
  // Le jeu de CET élève, au format des indicateurs (`ind` : [réf, début, fin, sorties, délai], `lignes`), plus les lignes de Cambrai.
  function jeu(db) {
    if (o.fixe) return { ind: o.fixe.ind, lignes: o.fixe.lignes, cambrai: [] };
    const V = TIRAGE.valeursTirees(db);
    const X = V && V.mois && Array.isArray(V.mois.lignes) && V.mois.lignes.length === refs.length ? { mois: V.mois, cambrai: V.cambrai || [] } : jeuExemple();
    return { ind: X.mois.lignes.map((l) => [...l, REF[l[0]].delai]), lignes: { commandees: X.mois.commandees, completes: X.mois.completes }, cambrai: X.cambrai };
  }
  const I = (db) => indicateurs({ ind: jeu(db).ind, lignes: jeu(db).lignes });

  // Les contrôles : chaque colonne ajoutée, calculée sur la ligne de l'export de l'élève ; le taux de service sur la feuille « Commandes ».
  // Les `attendu` se calculent sur chaque ligne de l'export de l'élève (passée par le moteur) : jamais en dur.
  function controles(db) {
    const n = (l, c) => Number(l[c]);
    const moyen = (l) => (n(l, 'Stock début') + n(l, 'Stock fin')) / 2;
    const conso = (l) => n(l, 'Sorties') / JOURS;
    const couv = (l) => n(l, 'Stock fin') / conso(l);
    const alerte = (l) => (couv(l) < n(l, 'Délai (j)') ? ALERTES.rupture : couv(l) > OBJECTIF_COUVERTURE ? ALERTES.surstock : ALERTES.ok);
    const L = jeu(db).lignes;
    const filtre = (l) => l['Référence'] != null && String(l['Référence']).trim() !== '';
    const cle = ['Site', 'Référence'];
    const col = (id, libelle, titre, attendu, x = {}) => ({ type: 'colonne', id, libelle, feuille: FEUILLE, titre, cle, filtre, attendu, formule: true, ...x });
    return [
      col('moyen', `Colonne « ${AJOUTS.moyen} » (début + fin, divisé par 2)`, AJOUTS.moyen, moyen),
      col('rotation', `Colonne « ${AJOUTS.rotation} » (sorties ÷ stock moyen)`, AJOUTS.rotation, (l) => n(l, 'Sorties') / moyen(l)),
      col('conso', `Colonne « ${AJOUTS.conso} » (sorties ÷ ${JOURS} jours ouvrés)`, AJOUTS.conso, conso),
      col('couverture', `Colonne « ${AJOUTS.couverture} » (stock fin ÷ consommation par jour)`, AJOUTS.couverture, couv),
      col('alerte', `Colonne « ${AJOUTS.alerte} » (fonction SI : Rupture, Surstock ou OK)`, AJOUTS.alerte, alerte, { formule: false, fonctions: ['IF'] }),
      { type: 'table', id: 'service', libelle: `Le taux de service (feuille « ${FEUILLE_CMD} », au format pourcentage, sans ×100)`, feuille: FEUILLE_CMD,
        cle: 'Indicateur', colonne: 'Valeur', attendu: { [LIGNE_SERVICE]: L.completes / L.commandees }, formule: true },
    ];
  }
  const filtres = o.autres ? [{ id: 'site', libelle: 'Site', colonne: 'Site', juste: SITE, tous: 'Tous les sites' }] : undefined;
  const TABLEUR = {
    aide: AIDE,
    exports: [{
      id: ID_EXPORT, liste: `État du stock — ${o.mois}`, fichier: o.fichier,
      indications: o.indications || 1,
      ...(filtres ? { filtres, autres: (db) => jeu(db).cambrai.map(ligneExport(AUTRE_SITE)) } : {}),
      feuilles: [
        { nom: FEUILLE, colonnes: COLONNES, lignes: (db) => jeu(db).ind.map(ligneExport(SITE)) },
        { nom: FEUILLE_CMD, colonnes: ['Indicateur', 'Valeur'],
          lignes: (db) => [['Lignes commandées', jeu(db).lignes.commandees], ['Lignes livrées complètes', jeu(db).lignes.completes], [LIGNE_SERVICE, null]] },
      ],
    }],
    depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', ...(o.retour ? { retour: o.retour } : {}), controles },
  };
  const resultat = (db) => resultatDepot(db, ID_DEPOT);
  const depose = (db) => !!resultat(db).depose;
  const juste = (db, id) => { const c = resultat(db).controles[id]; return !!(c && c.ok); };
  return {
    ID_EXPORT, ID_DEPOT, TIRAGE, TABLEUR, jeu, I, controles, depose, juste,
    exporte: (db) => exportFait(db, ID_EXPORT),
    statutExport: (db) => statutExport(db, ID_EXPORT, ID_DEPOT),
    filtre: !!filtres,
  };
}

// ─────────────────────────────────────────── les quatre séances au tableur (une instance chacune : un tirage = une séance)
export const T161 = stockAuTableur({ id: 'royal-canin-indicateurs', mois: 'octobre', fichier: 'royal-canin-stock-octobre.xlsx', fixe: D161, indications: 1, retour: 'guidage' });
export const T162 = stockAuTableur({ id: 'royal-canin-indicateurs-novembre', mois: 'novembre', fichier: 'royal-canin-stock-novembre.xlsx', autres: true, indications: 3 });
export const T163 = stockAuTableur({ id: 'royal-canin-reunion', mois: 'décembre', fichier: 'royal-canin-stock-decembre.xlsx', indications: 1, retour: 'guidage' });
export const T166 = stockAuTableur({ id: 'royal-canin-evaluation', mois: 'mars', fichier: 'royal-canin-stock-mars.xlsx', autres: true, indications: 4 });
