// Vue « inventaire » — compter, constater les écarts, enquêter, décider, valider.
//
// Écrite le 02/10/2026 (chantier E), d'après la maquette validée par Tristan le même jour
// (`G:\Mon Drive\Travail\Logistique\1L\Claude outputs\prepalog-maquette-inventaire-cdiscount.html`).
// Elle vit dans l'environnement d'entreprise (`entreprise.js`), comme le plan et la tournée :
// elle ne connaît aucune entreprise. Tout ce qui est propre à une séance — les lignes à compter,
// le relevé, les décisions attendues, les explications — vient de la déclaration `inventaire`.
//
// LE FORMAT DES DONNÉES est fixé dans la fiche du projet `claude/prepalog-inventaire-format.md`.
// Il est partagé avec les séances Cdiscount (chantier D) : ne pas le changer sans la mettre à
// jour, et sans le dire à Tristan.
//
// Quatre étapes, celles de la maquette :
//   1. saisir le comptage — à l'aveugle par défaut : le stock du système est caché, et
//      l'environnement bloque aussi l'écran Stock et les commandes de console qui le donnent ;
//   2. constater les écarts — calculés par l'écran (guidage) ou par l'élève (entraînement,
//      évaluation) : réglage `ecarts` de la séance ;
//   3. traiter chaque écart — ouvrir ses mouvements, puis décider : régulariser (avec un motif),
//      ne pas régulariser et remettre la marchandise en rayon, ou demander un recomptage ;
//   4. valider — récapitulatif, taux d'écart, puis validation DÉFINITIVE : les régularisations
//      partent dans les Mouvements du Stock comme « Ajustement inventaire ».
//
// Choix de Tristan derrière ces règles (02/10/2026) : comptage à l'aveugle ; qui calcule les
// écarts, réglable par séance ; motif obligatoire ; relevé par la messagerie OU comptage
// physique au magasin pédagogique, sans changer d'écran ; correction affichée réglable par
// séance (`correction`) ; les indices de l'enquête arrivent par la messagerie, pas dans l'écran.
//
// Ce que la vue ne fait PAS elle-même : toucher au stock. Elle demande à l'environnement
// d'ajuster (`api.ajuster`), qui écrit le mouvement avec ses lots, comme `.setstock`.
//
// COMPTAGES D'UNE AUTRE VUE (12/10/2026, chantier D-6 lot 4, demande ENT-6.6 §7.3). Deux ajouts,
// sans rien changer pour Cdiscount :
//   - des LIGNES LIBRES, hors catalogue : `{ cle: 'M01', emplacement: 'M01', designation: 'Heineken
//     30 L — lot S20', systeme: 16, attendu, motif, explication }`. `cle` remplace `ref` (une même
//     référence peut être comptée dans deux couloirs) ; `systeme` est le stock du logiciel, écrit par
//     la séance (construit) : il n'y a pas de `db.stock` derrière. Une régularisation d'une ligne
//     libre reste dans l'état de l'inventaire (aucun mouvement de stock).
//   - `source: 'comptages'` avec `comptages(db)` : la séance rend ce que l'élève a compté ailleurs
//     (le terminal du plan d'entrepôt, `comptagesTerminal`), `{ M01: 15, … }`, ou `null` tant que
//     ce comptage n'est pas fini — l'écran attend alors (`attenteComptage`). Fini, l'écran s'ouvre
//     sur les écarts : le comptage est repris tel quel, non modifiable, et le stock du logiciel
//     n'apparaît qu'à ce moment.
// Réglages qui vont avec (tous facultatifs) : `actions` (les décisions proposées, dans l'ordre :
// `['regul', 'rayon']`), `libelles` (`{ rayon: 'Remettre en place' }`), `taux: false` (pas de taux
// d'écart dans l'écran), `mouvements` (la colonne « voir les mouvements » ; absente par défaut sur
// des lignes libres), `conseil` (le texte d'en tête du traitement, HTML de la séance).

const ACTIONS = [
  ['regul', 'Régulariser le stock du système'],
  ['rayon', 'Ne pas régulariser : remettre la marchandise en rayon'],
  ['recompter', 'Demander un recomptage'],
];
const MOTIFS_DEFAUT = ['Casse', 'Erreur de prélèvement', 'Erreur de réception', 'Démarque inconnue', 'Autre'];
const ETAPES = ['Saisir le comptage', 'Constater les écarts', 'Traiter les écarts', "Valider l'inventaire"];
const CONSEIL_DEFAUT = `Avant de toucher au stock, <b>cherchez la cause</b> de chaque écart : ouvrez ses mouvements, lisez vos
        messages. Un écart n'est pas toujours une perte.`;

// La clé d'une ligne (celle de l'état de l'élève) : `cle` pour une ligne libre, sinon sa référence.
export const cleDe = (l) => (l.cle != null ? String(l.cle) : l.ref);
// Ce qu'on affiche d'une ligne : du catalogue pour une ligne d'article, de la ligne pour une ligne libre.
function infoLigne(l, VM) {
  const v = l.cle == null ? VM[l.ref] : null;
  if (v) return { emplacement: v.loc, reference: l.ref, designation: [v.model.brand, v.model.name].filter(Boolean).join(' '), cout: v.model.cost || 0 };
  return { emplacement: l.emplacement || (l.cle != null ? String(l.cle) : ''), reference: l.ref || '', designation: l.designation || l.ref || '', cout: l.cout || 0 };
}

import { ech } from '../texte.js';
const eur = (n) => Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const fdt = (t) => new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
// Un écart se lit avec son signe : « −3 » est un manque, « +3 » un surplus. Le vrai signe moins.
const signe = (n) => (n > 0 ? '+' + n : String(n).replace('-', '−'));
const classeEcart = (n) => (n < 0 ? 'inv-moins' : n > 0 ? 'inv-plus' : 'inv-nul');
const virgule = (n) => String(n).replace('.', ',');

// Ce que l'élève tape : « 15 », « -3 », « −3 » (le vrai signe moins, que certains claviers
// donnent), « 2,5 ». Rien d'autre n'est un nombre. Vide → null.
export function lireNombre(brut) {
  const t = String(brut == null ? '' : brut).trim().replace(/\s/g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (t === '' || !/^[+-]?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}
const entierPositif = (brut) => { const n = lireNombre(brut); return n != null && Number.isInteger(n) && n >= 0 ? n : null; };

// Les réglages de la séance, avec leurs valeurs par défaut (voir la fiche du format).
function reglages(INV) {
  const libres = (INV.lignes || []).some((l) => l.cle != null);
  const actions = Array.isArray(INV.actions) && INV.actions.length ? ACTIONS.filter(([k]) => INV.actions.includes(k)) : ACTIONS;
  const libelles = Object.assign({}, INV.libelles || {});
  return {
    source: ['physique', 'comptages'].includes(INV.source) ? INV.source : 'releve',
    actions: actions.map(([k, t]) => [k, libelles[k] || t]),
    taux: INV.taux !== false,
    mouvements: INV.mouvements != null ? !!INV.mouvements : !libres,
    conseil: INV.conseil || CONSEIL_DEFAUT,
    aveugle: INV.aveugle !== false,
    ecarts: INV.ecarts === 'ecran' ? 'ecran' : 'eleve',
    correction: ['detaillee', 'verdict', 'aucune'].includes(INV.correction) ? INV.correction : 'verdict',
    motifObligatoire: INV.motifObligatoire !== false,
    motifs: Array.isArray(INV.motifs) && INV.motifs.length ? INV.motifs : MOTIFS_DEFAUT,
  };
}

// LE PÉRIMÈTRE (04/10/2026, lot 0 de la refonte Cdiscount) : les lignes que l'élève traite.
// Sans `perimetre` dans la déclaration, toutes. Avec `perimetre(db)`, la séance calcule sur la
// base de l'élève les références qu'il compte : un tableau (gardé dans l'ordre des
// emplacements), ou `null` tant que rien n'est choisi — l'écran affiche alors
// `attentePerimetre` et ne crée pas d'état. Le relevé de la messagerie, lui, reste complet.
export function lignesInventaire(INV, db, VM) {
  if (typeof INV.perimetre !== 'function') return INV.lignes;
  const p = INV.perimetre(db || {});
  if (!Array.isArray(p)) return null;
  const garde = new Set(p);
  const loc = (l) => infoLigne(l, VM || {}).emplacement || cleDe(l);
  return INV.lignes.filter((l) => garde.has(cleDe(l)))
    .map((l, i) => [l, i]).sort((a, b) => loc(a[0]).localeCompare(loc(b[0])) || a[1] - b[1]).map(([l]) => l);
}

// L'état vierge d'un inventaire, avec la PHOTO du stock système : c'est contre elle que les
// écarts se calculent, même si le stock bouge ensuite (une commande préparée entre-temps).
// `lignes` : le périmètre (toutes les lignes par défaut).
// Ligne libre : le stock du logiciel est celui que la séance écrit (`systeme`).
// Comptages d'une autre vue (`source: 'comptages'`) : repris tels quels, et l'écran part des écarts.
const systemeDe = (l, stockDe) => (l.systeme != null ? l.systeme : stockDe(l.ref));
export function etatNeuf(INV, stockDe, lignes = INV.lignes, db = {}) {
  const systeme = {}, saisie = {};
  lignes.forEach((l) => { systeme[cleDe(l)] = systemeDe(l, stockDe); });
  let etape = 1;
  if (INV.source === 'comptages') {
    const C = (typeof INV.comptages === 'function' && INV.comptages(db)) || {};
    lignes.forEach((l) => { if (C[cleDe(l)] != null) saisie[cleDe(l)] = String(C[cleDe(l)]); });
    etape = 2;
  }
  return { etape, systeme, saisie, ecarts: {}, decisions: {}, recomptes: {}, taux: '', valide: null, ajustements: [] };
}

/* ======================================================================== le bilan
 * La lecture que l'écran fait de l'état — et que les jalons d'une séance refont à l'identique
 * en l'important. Une seule fonction pour l'écran et la note : ils ne peuvent pas diverger.
 */
export function bilanInventaire(db, INV, CATALOGUE) {
  const R = reglages(INV);
  const e = db && db.inventaires && db.inventaires[INV.id];
  const VM = (CATALOGUE && CATALOGUE.VM) || {};
  const perimetre = lignesInventaire(INV, db, VM);
  const vide = { commence: false, valide: false, saisieOk: false, ecartsOk: null, tauxOk: null,
    justes: 0, notees: (perimetre || []).filter((l) => l.attendu).length, lignes: [], tauxAttendu: null };
  if (!e || !perimetre) return vide;
  let sommeAbs = 0, sommeSys = 0, justes = 0, notees = 0;
  let saisieOk = true, ecartsOk = true;
  const lignes = perimetre.map((l) => {
    const k = cleDe(l), info = infoLigne(l, VM);
    const systeme = e.systeme[k] != null ? e.systeme[k] : 0;
    const premier = entierPositif(e.saisie[k]);
    if (premier == null || (R.source === 'releve' && premier !== l.compte)) saisieOk = false;
    const recompte = e.recomptes[k] != null ? e.recomptes[k] : null;
    const compte = recompte != null ? recompte : premier;
    const ecartPremier = premier == null ? null : premier - systeme;
    const ecart = compte == null ? null : compte - systeme;
    if (ecartPremier != null) sommeAbs += Math.abs(ecartPremier);
    sommeSys += systeme;
    // Un écart non saisi est faux, même sur une ligne sans écart (« une ligne sans écart s'écrit 0 »).
    if (R.ecarts === 'eleve' && ecartPremier != null && lireNombre(e.ecarts[k]) !== ecartPremier) ecartsOk = false;
    const d = e.decisions[k] || {};
    let juste = null;
    if (l.attendu) {
      notees++;
      if (l.attendu === 'regul') juste = d.action === 'regul' && (!l.motif || d.motif === l.motif);
      else juste = d.action === l.attendu;
      if (juste) justes++;
    }
    const cout = info.cout;
    return { cle: k, ref: l.ref || k, emplacement: info.emplacement, designation: info.designation,
      systeme, premier, recompte, compte, ecartPremier, ecart, valeur: ecartPremier == null ? null : ecartPremier * cout,
      action: d.action || '', motif: d.motif || '', attendu: l.attendu || null, motifAttendu: l.motif || null,
      explication: l.explication || '', juste };
  });
  const tauxAttendu = sommeSys ? Math.round(sommeAbs / sommeSys * 1000) / 10 : 0;
  const tauxSaisi = lireNombre(e.taux);
  return {
    commence: true, valide: !!e.valide, etape: e.etape, saisieOk,
    ecartsOk: R.ecarts === 'eleve' ? ecartsOk : null,
    tauxOk: R.ecarts === 'eleve' && R.taux ? (tauxSaisi != null && Math.abs(tauxSaisi - tauxAttendu) <= 0.1 + 1e-9) : null,
    tauxAttendu, sommeAbs, sommeSys, justes, notees, lignes,
    ajustements: (e.ajustements || []).slice(),
  };
}

/* ================================================================ le relevé papier
 * Le relevé de comptage tel que l'équipe l'a rempli, affiché dans la messagerie quand la
 * séance envoie un message `kind: 'releve'`. Les quantités viennent des lignes de
 * l'inventaire : la séance ne les écrit qu'une fois.
 */
export function releveHtml(INV, CATALOGUE, mail) {
  const VM = (CATALOGUE && CATALOGUE.VM) || {};
  return `<div class="inv-papier">
    <b>Relevé de comptage</b>
    <div class="note">${INV.titre ? ech(INV.titre) + ' · ' : ''}campagne ${ech(INV.id)}</div>
    <table><tbody>${INV.lignes.map((l) => `<tr><td class="mono">${ech(VM[l.ref] ? VM[l.ref].loc : '')}</td>
      <td class="mono">${ech(l.ref)}</td><td class="num"><b>${l.compte == null ? '' : l.compte}</b></td></tr>`).join('')}</tbody></table>
    ${mail && mail.remarque ? `<div class="inv-remarque">${ech(mail.remarque)}</div>` : ''}
  </div>`;
}

/* =================================================================== la vue */
export function creerInventaire(INV, CATALOGUE) {
  const R = reglages(INV);
  const VM = (CATALOGUE && CATALOGUE.VM) || {};
  // L'état d'affichage, hors de la base : quelle ligne a ses mouvements ouverts, quel message.
  const ui = { ouvert: null, msg: null };
  const ligneDe = (ref) => INV.lignes.find((l) => K(l) === ref);
  // Les lignes du périmètre, relues sur la base à chaque dessin (`api.db`) ; toutes sans périmètre.
  let LG = INV.lignes;
  const fixer = (api) => { LG = lignesInventaire(INV, api && api.db, VM) || []; };
  // La base que lit le bilan : celle de l'élève (le périmètre en dépend), l'état de l'écran dedans.
  const baseDe = (e, api) => Object.assign({}, (api && api.db) || {}, { inventaires: { [INV.id]: e } });
  const inconnues = INV.lignes.filter((l) => l.cle == null && !VM[l.ref]).map((l) => l.ref);
  // La clé d'une ligne dans l'état, ce qu'on en affiche, et le nom qu'on lui donne dans les tableaux : sa
  // référence (article du catalogue) ou sa désignation (ligne libre : « Heineken 30 L — lot S20 »).
  const K = cleDe, I = (l) => infoLigne(l, VM);
  const nomDe = (l) => (l.cle != null ? I(l).designation : l.ref);
  // Une valeur d'écart n'a de sens qu'avec un prix d'achat : sans aucun, la colonne disparaît.
  const avecValeur = () => LG.some((l) => I(l).cout);
  const NOMS_ETAPES = R.source === 'comptages' ? ['Compter', ...ETAPES.slice(1)] : ETAPES;
  const LIB_ACTION = Object.fromEntries(R.actions);
  const libres = () => LG.some((l) => l.cle != null);
  // Comptages d'une autre vue : tant qu'ils ne sont pas finis (et que l'écran n'a pas d'état), il attend.
  const attenteComptage = (db) => R.source === 'comptages' && !(db && db.inventaires && db.inventaires[INV.id])
    && !(typeof INV.comptages === 'function' && INV.comptages(db || {}));

  const message = () => (ui.msg ? `<div class="avis ${ui.msg[0] === 'ok' ? 'avis-ok' : 'avis-err'}" data-inv-msg>${ui.msg[1]}</div>` : '');
  const pastilles = (etape, valide) => `<ol class="inv-etapes">${NOMS_ETAPES.map((t, i) => {
    const n = i + 1, cls = valide || n < etape ? 'fait' : n === etape ? 'cours' : '';
    return `<li class="${cls}">${n}. ${ech(t)}</li>`;
  }).join('')}</ol>`;

  // Le compte retenu d'une ligne : le recomptage s'il y en a un, sinon le premier comptage.
  const compteDe = (e, ref) => (e.recomptes[ref] != null ? e.recomptes[ref] : entierPositif(e.saisie[ref]));
  const lignesAvecEcart = (e) => LG.filter((l) => {
    const p = entierPositif(e.saisie[K(l)]);
    return p != null && p !== e.systeme[K(l)];
  });

  /* ------------------------------------------------------------- étape 1 */
  function vueSaisie(e) {
    const consigne = R.source === 'releve'
      ? 'Reportez les quantités du <b>relevé de comptage</b> (il est dans la messagerie), emplacement par emplacement.'
      : 'Saisissez les quantités que vous avez <b>comptées dans les rayons</b>, emplacement par emplacement.';
    return `<section class="panneau">
      <p>${consigne}</p>
      <div class="ent-scroll"><table><thead><tr><th>Emplacement</th><th>Référence</th><th>Désignation</th>
        <th class="num">Stock système</th><th class="num">Compté</th></tr></thead><tbody>
      ${LG.map((l) => `<tr><td class="mono">${ech(I(l).emplacement)}</td>
        <td class="mono">${ech(I(l).reference || K(l))}</td><td>${ech(I(l).designation)}</td>
        <td class="num">${R.aveugle ? '<span class="note inv-cache">caché</span>' : e.systeme[K(l)]}</td>
        <td class="num"><input type="text" inputmode="numeric" class="inv-champ" data-inv-saisie="${ech(K(l))}"
          value="${ech(e.saisie[K(l)] == null ? '' : e.saisie[K(l)])}" aria-label="Quantité comptée ${ech(K(l))}"></td></tr>`).join('')}
      </tbody></table></div>
      ${message()}
      <div class="rangee"><button class="btn btn-p" data-inv-aller="2">Valider le comptage</button></div>
      ${R.aveugle ? `<p class="note">Comptage à l'aveugle : on compte ce qu'on voit, sans être influencé par le chiffre du
        système. Le stock reste masqué (écran Stock et console) jusqu'à la validation du comptage.</p>` : ''}
    </section>`;
  }

  /* ------------------------------------------------------------- étape 2 */
  function vueEcarts(e) {
    const eleve = R.ecarts === 'eleve', valeur = avecValeur();
    return `<section class="panneau">
      ${R.source === 'comptages' ? `<p class="note" data-inv-comptages>Vos comptages sont repris tels quels : ils ne se modifient plus. Le stock du
        logiciel apparaît maintenant.</p>` : ''}
      <p>${eleve ? "Calculez l'<b>écart</b> de chaque ligne : <b>compté − système</b> (un manque est négatif, un surplus positif)."
        : "L'écran a calculé les écarts. <b>Vérifiez-les</b>, puis passez au traitement."}</p>
      <div class="ent-scroll"><table><thead><tr><th>Emplacement</th><th>Référence</th><th class="num">Système</th>
        <th class="num">Compté</th><th class="num">Écart</th>${valeur ? "<th class=\"num\">Valeur de l'écart</th>" : ''}</tr></thead><tbody>
      ${LG.map((l) => {
        const c = entierPositif(e.saisie[K(l)]), ec = c - e.systeme[K(l)];
        return `<tr><td class="mono">${ech(I(l).emplacement)}</td><td class="mono">${ech(nomDe(l))}</td>
          <td class="num">${e.systeme[K(l)]}</td><td class="num">${c == null ? '—' : c}</td>
          <td class="num">${eleve
            ? `<input type="text" inputmode="numeric" class="inv-champ" data-inv-ecart="${ech(K(l))}" value="${ech(e.ecarts[K(l)] == null ? '' : e.ecarts[K(l)])}" aria-label="Écart ${ech(K(l))}">`
            : `<b class="${classeEcart(ec)}" data-inv-ecart-calcule="${ech(K(l))}">${signe(ec)}</b>`}</td>
          ${valeur ? `<td class="num">${eleve ? '<span class="note">au bilan</span>' : `<span class="${classeEcart(ec)}">${eur(ec * I(l).cout)}</span>`}</td>` : ''}</tr>`;
      }).join('')}
      </tbody></table></div>
      ${message()}
      <div class="rangee"><button class="btn btn-p" data-inv-aller="3">Traiter les écarts →</button></div>
      ${R.actions.some(([k]) => k === 'recompter') ? `<p class="note">Le comptage est clos : pour vérifier une quantité, demandez un recomptage à l'étape suivante.</p>` : ''}
    </section>`;
  }

  /* ------------------------------------------------------------- étape 3 */
  function mouvementsDe(ref, moves) {
    const depuis = INV.depuis || 0;
    const liste = (moves || []).filter((m) => m.sku === ref && (m.ts || 0) >= depuis);
    return `<div class="inv-mvt" data-inv-mvts="${ech(ref)}"><b>Mouvements de ${ech(ref)}${INV.depuis ? ' depuis le dernier inventaire' : ''}</b>
      ${liste.length ? `<div class="ent-scroll"><table><thead><tr><th>Date</th><th>Type</th><th class="num">Qté</th>
        <th class="num">Stock après</th><th>Lot</th><th>Origine</th><th>Par</th></tr></thead><tbody>
        ${liste.map((m) => `<tr><td>${fdt(m.ts)}</td><td>${ech(m.type)}</td>
          <td class="num"><b class="mono ${m.delta < 0 ? 'faux' : 'juste'}">${m.delta > 0 ? '+' : ''}${m.delta}</b></td>
          <td class="num">${m.after}</td><td class="mono">${m.lot ? ech(m.lot) : '—'}</td>
          <td class="mono">${ech(m.ref)}</td><td>${ech(m.by)}</td></tr>`).join('')}</tbody></table></div>`
        : '<p class="note">Aucun mouvement sur cette période.</p>'}
      <p class="note">D'autres informations peuvent être arrivées par la messagerie.</p></div>`;
  }

  function vueTraitement(e, api) {
    const lignes = lignesAvecEcart(e);
    if (!lignes.length) {
      return `<section class="panneau"><div class="avis avis-ok">Aucun écart : le stock du système correspond au comptage.</div>
        ${message()}<div class="rangee"><button class="btn btn-s" data-inv-aller="2">← Revenir aux écarts</button>
        <button class="btn btn-p" data-inv-aller="4">Valider l'inventaire →</button></div></section>`;
    }
    return `<section class="panneau">
      <div class="avis" data-inv-conseil>${R.conseil}</div>
      <div class="ent-scroll"><table><thead><tr><th>Emplacement</th><th>Référence</th><th class="num">Écart</th>
        ${R.mouvements ? '<th>Enquête</th>' : ''}<th>Décision</th><th>Motif</th></tr></thead><tbody>
      ${lignes.map((l) => {
        const d = e.decisions[K(l)] || {}, c = compteDe(e, K(l)), ec = c - e.systeme[K(l)];
        const recompte = e.recomptes[K(l)] != null;
        // En comptage physique, l'élève recompte lui-même : il saisit ce qu'il a trouvé.
        const champRecompte = d.action === 'recompter' && R.source === 'physique'
          ? `<div class="inv-recompte"><label>Recompté : <input type="text" inputmode="numeric" class="inv-champ" data-inv-recompte="${ech(K(l))}"
              value="${recompte ? e.recomptes[K(l)] : ''}" aria-label="Quantité recomptée ${ech(K(l))}"></label></div>` : '';
        return `<tr data-inv-ligne="${ech(K(l))}"><td class="mono">${ech(I(l).emplacement)}</td><td class="mono">${ech(nomDe(l))}</td>
          <td class="num"><b class="${classeEcart(ec)}" data-inv-ecart-ligne>${signe(ec)}</b>${recompte ? `<div class="note">recompté : ${e.recomptes[K(l)]}</div>` : ''}</td>
          ${R.mouvements ? `<td><button class="inv-lien" data-inv-ouvrir="${ech(K(l))}">${ui.ouvert === K(l) ? 'fermer' : 'voir les mouvements'}</button></td>` : ''}
          <td><select data-inv-action="${ech(K(l))}" aria-label="Décision ${ech(K(l))}"><option value="">— choisir —</option>
            ${R.actions.map(([k, t]) => `<option value="${k}" ${d.action === k ? 'selected' : ''}>${ech(t)}</option>`).join('')}</select>${champRecompte}</td>
          <td>${d.action === 'regul' ? `<select data-inv-motif="${ech(K(l))}" aria-label="Motif ${ech(K(l))}"><option value="">— motif —</option>
            ${R.motifs.map((m) => `<option ${d.motif === m ? 'selected' : ''}>${ech(m)}</option>`).join('')}</select>` : '<span class="note">—</span>'}</td></tr>
          ${R.mouvements && ui.ouvert === K(l) ? `<tr class="inv-sous"><td colspan="6">${mouvementsDe(K(l), api.mouvements())}</td></tr>` : ''}`;
      }).join('')}
      </tbody></table></div>
      ${message()}
      <div class="rangee"><button class="btn btn-s" data-inv-aller="2">← Revenir aux écarts</button>
        <button class="btn btn-p" data-inv-aller="4">Valider l'inventaire →</button></div>
    </section>`;
  }

  /* ------------------------------------------------------------- étape 4 */
  // Les mouvements que la validation va passer : un par régularisation, l'écart restant après
  // un éventuel recomptage.
  function ajustementsPrevus(e) {
    return lignesAvecEcart(e).filter((l) => (e.decisions[K(l)] || {}).action === 'regul')
      .map((l) => ({ ref: K(l), nom: nomDe(l), libre: l.cle != null, delta: compteDe(e, K(l)) - e.systeme[K(l)], motif: (e.decisions[K(l)] || {}).motif || '' }))
      .filter((a) => a.delta !== 0);
  }

  function vueValidation(e, b) {
    const prevus = ajustementsPrevus(e);
    const eleve = R.ecarts === 'eleve';
    const recap = lignesAvecEcart(e).map((l) => {
      const d = e.decisions[K(l)] || {};
      return `<tr><td class="mono">${ech(nomDe(l))}</td><td>${ech(LIB_ACTION[d.action] || '—')}${d.action === 'regul' ? ` <span class="note">(${ech(d.motif || 'sans motif')})</span>` : ''}</td></tr>`;
    }).join('');
    return `<section class="panneau">
      ${recap ? `<h3>Vos décisions</h3><div class="ent-scroll"><table><thead><tr><th>Référence</th><th>Décision</th></tr></thead><tbody>${recap}</tbody></table></div>` : ''}
      <h3>${libres() ? 'Ce qui sera régularisé dans le logiciel' : 'Ce qui partira dans les Mouvements du Stock'}</h3>
      ${prevus.length ? `<ul class="inv-prevus">${prevus.map((a) => `<li class="mono">Ajustement inventaire · ${ech(a.nom)} · ${signe(a.delta)} · ${ech(INV.id)}${a.motif ? ' · ' + ech(a.motif) : ''}</li>`).join('')}</ul>`
        : '<p class="note">Aucun ajustement : le stock du système ne bougera pas.</p>'}
      ${!R.taux ? '' : `<h3>Taux d'écart d'inventaire</h3>
      ${eleve ? `<p>Calculez le taux d'écart <b>en quantité, avant traitement</b> : somme des écarts sans leur signe ÷ somme des
          stocks système × 100, arrondi au dixième.</p>
        <div class="champ"><label for="invTaux">Taux d'écart (%)</label>
          <input id="invTaux" type="text" inputmode="decimal" class="inv-champ" data-inv-taux value="${ech(e.taux || '')}"></div>`
        : `<p>Taux d'écart en quantité, avant traitement : ${b.sommeAbs} ÷ ${b.sommeSys} × 100 = <b data-inv-taux-calcule>${virgule(b.tauxAttendu.toFixed(1))} %</b>.</p>`}`}
      ${message()}
      <div class="avis">La validation est <b>définitive</b> : les ajustements sont passés et l'inventaire ne peut plus être modifié.</div>
      <div class="rangee"><button class="btn btn-s" data-inv-aller="3">← Revenir au traitement</button>
        <button class="btn btn-p" data-inv-valider>Valider définitivement l'inventaire</button></div>
    </section>`;
  }

  function vueBilan(e, b) {
    const passes = (e.ajustements || []);
    const mvts = passes.length
      ? `<ul class="inv-prevus">${passes.map((a) => `<li class="mono">Ajustement inventaire · ${ech(a.nom || a.ref)} · ${signe(a.delta)} · ${ech(a.origine)}</li>`).join('')}</ul>`
      : '<p class="note">Aucun ajustement n\'a été passé.</p>';
    let correction = '';
    const notees = b.lignes.filter((l) => l.attendu);
    if (R.correction !== 'aucune' && notees.length) {
      const pourquoi = R.correction === 'detaillee';
      correction = `<h3>${b.justes} décision${b.justes > 1 ? 's' : ''} juste${b.justes > 1 ? 's' : ''} sur ${b.notees}</h3>
        <div class="ent-scroll"><table><thead><tr><th>Référence</th><th>Votre décision</th><th></th>${pourquoi ? "<th>Ce qu'il fallait voir</th>" : ''}</tr></thead><tbody>
        ${notees.map((l) => `<tr data-inv-verdict="${ech(K(l))}"><td class="mono">${ech(l.cle === l.ref ? l.ref : `${l.emplacement} · ${l.designation}`)}</td>
          <td>${ech(LIB_ACTION[l.action] || 'aucune (pas d\'écart constaté)')}${l.action === 'regul' ? ` <span class="note">(${ech(l.motif || 'sans motif')})</span>` : ''}</td>
          <td>${l.juste ? '<span class="pastille ok">juste</span>' : '<span class="pastille crit">à revoir</span>'}</td>
          ${pourquoi ? `<td>${ech(l.explication)}</td>` : ''}</tr>`).join('')}</tbody></table></div>
        ${R.ecarts === 'eleve' && R.taux ? `<p>Taux d'écart : ${b.tauxOk ? '<span class="pastille ok">juste</span>' : `<span class="pastille crit">à revoir</span>${pourquoi ? ` — il fallait ${b.sommeAbs} ÷ ${b.sommeSys} × 100 = ${virgule(b.tauxAttendu.toFixed(1))} %` : ''}`}</p>` : ''}`;
    }
    return `<section class="panneau">
      <div class="avis avis-ok" data-inv-valide>Inventaire ${ech(INV.id)} validé le ${fdt(e.valide)}.</div>
      ${correction}
      <h3>${libres() ? 'Régularisé dans le logiciel' : 'Passé dans les Mouvements du Stock'}</h3>${mvts}
    </section>`;
  }

  /* ----------------------------------------------------------- navigation */
  function aller(n, e, api) {
    ui.msg = null;
    const refuser = (t) => { ui.msg = ['err', t]; api.redessiner(); };
    if (n === 2 && e.etape === 1) {
      const manque = LG.filter((l) => entierPositif(e.saisie[K(l)]) == null);
      if (manque.length) return refuser(`Il manque ${manque.length} quantité${manque.length > 1 ? 's' : ''} (ou elle n'est pas un nombre entier) : ${manque.map((l) => ech(I(l).emplacement || K(l))).join(', ')}.`);
      if (R.source === 'releve') {
        const faux = LG.filter((l) => entierPositif(e.saisie[K(l)]) !== l.compte);
        if (faux.length) return refuser(`${faux.length} quantité${faux.length > 1 ? 's ne correspondent' : ' ne correspond'} pas au relevé : relisez-le ligne par ligne (${faux.map((l) => ech(I(l).emplacement || K(l))).join(', ')}).`);
      }
    }
    if (n === 3 && e.etape === 2 && R.ecarts === 'eleve') {
      const comptees = LG.filter((l) => entierPositif(e.saisie[K(l)]) != null);
      const vides = comptees.filter((l) => lireNombre(e.ecarts[K(l)]) == null);
      if (vides.length) return refuser(`Il manque ${vides.length} écart${vides.length > 1 ? 's' : ''}. Une ligne sans écart s'écrit 0.`);
      // En évaluation, aucun retour : l'écart faux est gardé tel quel et compté au bilan.
      if (R.correction !== 'aucune') {
        const faux = comptees.filter((l) => lireNombre(e.ecarts[K(l)]) !== entierPositif(e.saisie[K(l)]) - e.systeme[K(l)]);
        if (faux.length) return refuser(`${faux.length} écart${faux.length > 1 ? 's sont faux' : ' est faux'}. Rappel : écart = compté − système (un manque est négatif).`);
      }
    }
    if (n === 4 && e.etape === 3) {
      const lignes = lignesAvecEcart(e);
      const sans = lignes.filter((l) => !(e.decisions[K(l)] || {}).action);
      if (sans.length) return refuser(`Décidez de chaque écart avant de valider (${sans.map((l) => ech(K(l))).join(', ')}).`);
      const sansMotif = lignes.filter((l) => (e.decisions[K(l)] || {}).action === 'regul' && !(e.decisions[K(l)] || {}).motif);
      if (R.motifObligatoire && sansMotif.length) return refuser(`Une régularisation sans motif est refusée : ${sansMotif.map((l) => ech(K(l))).join(', ')}.`);
      const nonRecomptes = lignes.filter((l) => (e.decisions[K(l)] || {}).action === 'recompter' && e.recomptes[K(l)] == null);
      if (nonRecomptes.length) return refuser(`Saisissez la quantité recomptée : ${nonRecomptes.map((l) => ech(K(l))).join(', ')}.`);
      const persistent = lignes.filter((l) => (e.decisions[K(l)] || {}).action === 'recompter' && compteDe(e, K(l)) !== e.systeme[K(l)]);
      if (persistent.length) return refuser(`Après recomptage, l'écart demeure (${persistent.map((l) => ech(K(l))).join(', ')}) : régularisez, ou remettez la marchandise en rayon.`);
    }
    // On ne revient jamais au comptage : il est clos. Un chiffre douteux se recompte.
    if (n === 1 && e.etape > 1) return;
    e.etape = n;
    api.sauver();
    api.redessiner();
  }

  function valider(e, api) {
    ui.msg = null;
    if (R.ecarts === 'eleve' && R.taux && lireNombre(e.taux) == null) {
      ui.msg = ['err', "Calculez le taux d'écart avant de valider (un nombre, par exemple 4,2)."];
      return api.redessiner();
    }
    if (R.ecarts === 'eleve' && R.taux && R.correction !== 'aucune') {
      const b = bilanInventaire(baseDe(e, api), INV, CATALOGUE);
      if (!b.tauxOk) { ui.msg = ['err', "Le taux d'écart est faux. Rappel : somme des écarts sans leur signe ÷ somme des stocks système × 100."]; return api.redessiner(); }
    }
    const passes = [];
    ajustementsPrevus(e).forEach((a) => {
      const origine = `${INV.id}${a.motif ? ' · ' + a.motif : ''}`;
      // Une ligne libre n'a pas de stock derrière elle dans l'environnement : la régularisation reste dans l'état.
      if (!a.libre) api.ajuster(a.ref, a.delta, origine);
      passes.push({ ref: a.ref, nom: a.nom, delta: a.delta, motif: a.motif, origine });
    });
    e.ajustements = passes;
    e.valide = Date.now();
    api.sauver();
    api.toast(passes.length ? `Inventaire validé : ${passes.length} ajustement${passes.length > 1 ? 's' : ''} passé${passes.length > 1 ? 's' : ''}.` : 'Inventaire validé.');
    // Le menu aussi (une fiche peut attendre la validation, ENT-6.6) ; sans l'environnement d'entreprise, l'écran seul.
    (api.redessinerTout || api.redessiner)();
  }

  return {
    nav: { id: 'inventaire', libelle: INV.libelle || 'Inventaire' },
    id: INV.id,
    // Le stock est-il masqué ailleurs ? Oui en comptage à l'aveugle, tant que le comptage
    // n'est pas validé — y compris avant la première ouverture de l'écran : sinon l'élève
    // irait noter le stock avant de commencer.
    bloqueStock: (etat) => R.aveugle && !(etat && (etat.etape >= 2 || etat.valide)),
    etatNeuf: (stockDe, db) => etatNeuf(INV, stockDe, lignesInventaire(INV, db, VM) || [], db),
    releve: (mail) => releveHtml(INV, CATALOGUE, mail),
    // Périmètre pas encore choisi, ou comptage d'une autre vue pas fini : l'écran attend, sans créer d'état.
    attente: (db) => lignesInventaire(INV, db, VM) == null || attenteComptage(db),
    attenteHtml: (db) => `<div class="ent-tete"><h2>${ech(INV.titre || 'Inventaire')}</h2></div>
      <div class="avis" data-inv-attente>${ech(attenteComptage(db)
        ? INV.attenteComptage || 'Termine d’abord le comptage : l’inventaire s’ouvrira avec tes comptages.'
        : INV.attentePerimetre || 'En attente de la liste des références à compter.')}</div>`,
    // Périmètre agrandi après le début (robustesse) : les lignes nouvelles prennent leur photo du
    // moment. Rien ne bouge après la validation. Rend vrai si l'état a changé.
    completer(e, db, stockDe) {
      if (!e || e.valide) return false;
      let change = false;
      (lignesInventaire(INV, db, VM) || []).forEach((l) => {
        if (e.systeme[K(l)] == null) { e.systeme[K(l)] = systemeDe(l, stockDe); change = true; }
      });
      return change;
    },

    html(e, api) {
      const tete = `<div class="ent-tete"><h2>${ech(INV.titre || 'Inventaire')}</h2>
        <p class="note">Campagne <span class="mono">${ech(INV.id)}</span>${INV.sousTitre ? ' · ' + ech(INV.sousTitre) : ''}</p></div>`;
      if (inconnues.length) {
        return tete + `<div class="avis avis-err">Inventaire mal déclaré : référence${inconnues.length > 1 ? 's' : ''} absente${inconnues.length > 1 ? 's' : ''} du catalogue (${inconnues.map(ech).join(', ')}).</div>`;
      }
      fixer(api);
      const b = bilanInventaire(baseDe(e, api), INV, CATALOGUE);
      const corps = e.valide ? vueBilan(e, b)
        : e.etape === 1 ? vueSaisie(e) : e.etape === 2 ? vueEcarts(e) : e.etape === 3 ? vueTraitement(e, api) : vueValidation(e, b);
      return tete + pastilles(e.etape, !!e.valide) + corps;
    },

    brancher(z, e, api) {
      fixer(api);
      // Les saisies sont rangées à chaque frappe, sans redessiner : le curseur reste en place.
      const ranger = (sel, cle, champ) => z.querySelectorAll(sel).forEach((el) => {
        const maj = () => { if (e.valide) return; e[champ][el.dataset[cle]] = el.value; api.sauver(); };
        el.addEventListener('input', maj); el.addEventListener('change', maj);
      });
      if (e.etape === 1) ranger('[data-inv-saisie]', 'invSaisie', 'saisie');
      if (e.etape === 2) ranger('[data-inv-ecart]', 'invEcart', 'ecarts');
      z.querySelector('[data-inv-taux]')?.addEventListener('input', (ev) => { e.taux = ev.target.value; api.sauver(); });
      z.querySelectorAll('[data-inv-aller]').forEach((btn) => btn.addEventListener('click', () => aller(Number(btn.dataset.invAller), e, api)));
      z.querySelectorAll('[data-inv-ouvrir]').forEach((btn) => btn.addEventListener('click', () => {
        ui.ouvert = ui.ouvert === btn.dataset.invOuvrir ? null : btn.dataset.invOuvrir; api.redessiner();
      }));
      z.querySelectorAll('[data-inv-action]').forEach((s) => s.addEventListener('change', () => {
        const ref = s.dataset.invAction, l = ligneDe(ref);
        const d = e.decisions[ref] || (e.decisions[ref] = { action: '', motif: '' });
        d.action = s.value;
        if (s.value !== 'regul') d.motif = '';
        // Le recomptage d'un relevé est fourni par la séance (`recompte`) ; sans lui, on
        // retrouve le même chiffre — compter deux fois la même erreur arrive aussi.
        if (s.value === 'recompter' && R.source === 'releve' && e.recomptes[ref] == null) {
          e.recomptes[ref] = l.recompte != null ? l.recompte : l.compte;
        }
        ui.msg = null; api.sauver(); api.redessiner();
      }));
      z.querySelectorAll('[data-inv-motif]').forEach((s) => s.addEventListener('change', () => {
        const d = e.decisions[s.dataset.invMotif] || (e.decisions[s.dataset.invMotif] = { action: 'regul', motif: '' });
        d.motif = s.value; api.sauver();
      }));
      z.querySelectorAll('[data-inv-recompte]').forEach((el) => el.addEventListener('change', () => {
        const n = entierPositif(el.value);
        if (n == null) delete e.recomptes[el.dataset.invRecompte]; else e.recomptes[el.dataset.invRecompte] = n;
        api.sauver(); api.redessiner();
      }));
      z.querySelector('[data-inv-valider]')?.addEventListener('click', () => valider(e, api));
    },
  };
}
