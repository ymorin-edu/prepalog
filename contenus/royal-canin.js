// Royal Canin — l'entrepôt de produits finis d'Aimargues : l'UNIVERS commun des séances ENT-16.1 à 16.5 (Terminale, C1.6 indicateurs de stock, C2.2
// préparation, C3.1 adaptation au produit et au flux) et la FABRIQUE de leurs écrans. Cadrage : `docs/briefs/royal-canin/CADRAGE-royal-canin-tle.md` ;
// données : `contenus/royal-canin-donnees.js`.
//
// L'élève est adjoint(e) à la responsable de l'entrepôt de produits finis (rôle et prénoms CONSTRUITS ; l'entrepôt, son équipement et les volumes de
// l'usine sont réels). Trois gestes, chacun dans ses séances : lire les indicateurs du mois (rotation, couverture, taux de service) et dire quoi faire
// (16.1, 16.2) ; implanter la zone de picking selon le poids et la demande, et calculer les réappros des canaux (16.3) ; préparer une commande export
// selon la durée de vie restante exigée par le client, en FEFO (16.4, erreur induite) ; les trois en évaluation (16.5). Aucune vue nouvelle :
// documents joints, fiche, réponse par phrases, questions au fil. Sandrine tutoie l'élève.

import { catalogueSimple } from './entreprise-commun.js';
import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { REFS, REF, JOURS, OBJECTIF_COUVERTURE, CAPACITE_CANAL, ZONES, indicateurs, implantation, preparationExport, fdate, nombreFr } from './royal-canin-donnees.js';

// ─────────────────────────────────────────── l'univers
export const ENTREPRISE = {
  id: 'royal-canin',
  nom: 'Royal Canin',
  sousTitre: 'Aimargues (Gard) — entrepôt de produits finis',
  exercice: 'Piloter l’entrepôt de produits finis',
  logo: './contenus/trames/logos/royal-canin.svg',
};
export const VOCAB = { unit: 'sac', unitPl: 'sacs', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'royalcanin.example' };
// Un violet ardoise CONSTRUIT : la charte rouge de la marque n'est pas reprise (le rouge dirait « faux » dans la zone de travail).
export const THEME = { accent: '#4f4a6b', papier: true };
export const CATALOGUE = catalogueSimple(REFS.map((r) => ({ ref: r.ref, designation: `${r.nom}, sac ${r.kg} kg`, marque: 'Royal Canin (référence construite)', categorie: 'Aliment pour animaux', fournisseur: 'F-RC', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-RC', brand: 'Royal Canin', name: 'Usine d’Aimargues (production)', adr: '', cp: '', ville: 'Aimargues', contact: '', tel: '', email: 'production@royalcanin.example', delai: 4, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Royal Canin (groupe Mars), ses usines d’Aimargues et de Cambrai, 349 454 tonnes de croquettes en 2024 dont 85 % exportées, '
  + 'l’entrepôt de produits finis d’Aimargues (1 800 palettes, canaux dynamiques, palettes au sol, terminaux radio). Construits : les références, les stocks, '
  + 'les commandes, les lots et leurs dates, les règles du site, le client export et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  sandrine: { nom: 'Sandrine', role: 'responsable de l’entrepôt de produits finis (ta responsable)', appel: 'Sandrine' },
  mehdi: { nom: 'Mehdi', role: 'chef d’équipe préparation', appel: 'Mehdi' },
};
const SANDRINE = { nom: 'Sandrine, responsable de l’entrepôt', mail: 'sandrine@royalcanin.example' };
export const MAIL_SANDRINE = SANDRINE.mail;
export const PERSONNES = { sandrine: EQUIPE.sandrine, mehdi: EQUIPE.mehdi };

// ─────────────────────────────────────────── aides
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pied = (t) => `<p class="rc-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace('%', '').replace(/j(ours?)?$/i, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
const memes = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const des = (r) => `${REF[r].nom}, sac ${REF[r].kg} kg`;

export const STYLE = `
--douce:#555047;
.rc-doc{padding:14px 18px 0}
.rc-doc p{margin:0 0 8px}
.rc-t{margin:0; font-size:1.08rem; font-weight:800}
.rc-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.rc-ul{margin:4px 0 8px; padding-left:20px; font-size:.92rem}
.rc-ul li{margin:4px 0}
.rc-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.rc-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.rc-table th, .rc-table td{border-bottom:1px solid #d6d0c3; padding:4px 6px; text-align:left; vertical-align:top}
.rc-table th{color:var(--douce); font-weight:600}
.rc-table .rc-d{text-align:right; white-space:nowrap}
.rc-table th.rc-d{white-space:normal}
.rc-doc{overflow-x:auto}
.rc-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.rc-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents
function docPoste(D, texte) {
  return { id: 'poste', titre: 'Ton poste', court: 'Ton poste',
    html: `<article class="rc-doc" aria-label="Ton poste">
    <p class="rc-t">Ton poste</p>
    <p class="rc-st">Entrepôt de produits finis Royal Canin — Aimargues (Gard) — ${ech(D.jour)}</p>
    <p>Tu es adjoint(e) à <b>Sandrine</b>, la responsable de l’entrepôt de produits finis : les sacs de croquettes y arrivent de l’usine voisine et en
      repartent vers les clients de France et de l’étranger. Tu suis les stocks, tu organises la préparation et tu prépares les décisions.</p>
    ${texte}
    <p><b>Ce qui est réel</b> : Royal Canin (groupe Mars) produit ses croquettes à Aimargues et à Cambrai : 349 454 tonnes en 2024, dont environ 85 %
      exportées vers plus de 102 marchés. L’entrepôt de produits finis d’Aimargues compte 1 800 emplacements palettes sur des rayonnages de 7 m, des
      <b>canaux dynamiques</b> à rouleaux pour les petits produits, des palettes au sol pour le prélèvement, et des terminaux radio guidés par le WMS.</p>
    ${pied(`Document pédagogique. ${MENTION}`)}
  </article>` };
}
const docMethodeInd = () => ({ id: 'methode-ind', titre: 'Méthode : les indicateurs du stock', court: 'Méthode indicateurs',
  html: `<article class="rc-doc" aria-label="Méthode indicateurs">
    <p class="rc-t">Méthode : les indicateurs du stock</p>
    <p class="rc-st">La fiche méthode de l’entrepôt (un mois = ${JOURS} jours ouvrés)</p>
    <ul class="rc-ul">
      <li><b>Stock moyen</b> = (stock au début du mois + stock à la fin du mois) ÷ 2.</li>
      <li><b>Rotation</b> du mois = sorties du mois ÷ stock moyen. Une rotation de 3 : le stock moyen est « parti » trois fois dans le mois.</li>
      <li><b>Consommation par jour</b> = sorties du mois ÷ ${JOURS}.</li>
      <li><b>Couverture</b> (en jours) = stock à la fin du mois ÷ consommation par jour : le nombre de jours que le stock tient sans nouvelle livraison.</li>
      <li><b>Surstock</b> : couverture de <b>plus de ${OBJECTIF_COUVERTURE} jours</b> (objectif du site). <b>Risque de rupture</b> : couverture <b>plus courte</b>
        que le délai de réapprovisionnement de la référence.</li>
      <li><b>Taux de service</b> = lignes livrées complètes ÷ lignes commandées × 100.</li>
    </ul>
    <p class="rc-st">Exemple : début 300, fin 500, sorties 1 600 → stock moyen 400, rotation 4, 80 par jour, couverture 500 ÷ 80 = 6,25 jours.</p>
    ${pied('Fiche méthode CONSTRUITE pour l’exercice (les formules sont les formules usuelles ; l’objectif de 15 jours est construit). Document pédagogique.')}
  </article>` });
const docTableau = (D) => ({ id: 'tableau', titre: `Le stock de ${D.mois}`, court: 'Le tableau du mois',
  html: `<article class="rc-doc" aria-label="Le stock du mois">
    <p class="rc-t">État du stock — ${ech(D.mois)}</p>
    <p class="rc-st">Extraction du WMS, en sacs ; délai : du lancement en production à l’arrivée à l’entrepôt, en jours ouvrés</p>
    <table class="rc-table"><thead><tr><th scope="col">Référence</th><th scope="col">Produit</th><th class="rc-d" scope="col">Stock début</th><th class="rc-d" scope="col">Stock fin</th>
      <th class="rc-d" scope="col">Sorties</th><th class="rc-d" scope="col">Délai</th></tr></thead>
      <tbody>${D.ind.map(([r, d, f, s, dl]) => `<tr><td class="rc-mono">${r}</td><td>${ech(des(r))}</td><td class="rc-d">${n(d)}</td><td class="rc-d">${n(f)}</td><td class="rc-d">${n(s)}</td><td class="rc-d">${dl} j</td></tr>`).join('')}</tbody></table>
    <p style="margin-top:8px">Lignes de commande du mois : <b>${n(D.lignes.commandees)}</b> commandées, dont <b>${n(D.lignes.completes)}</b> livrées complètes.</p>
    ${pied('Chiffres CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });
const docMethodePicking = () => ({ id: 'methode-picking', titre: 'Méthode : la zone de picking', court: 'Méthode picking',
  html: `<article class="rc-doc" aria-label="Méthode picking">
    <p class="rc-t">Méthode : où prélever chaque référence ?</p>
    <p class="rc-st">La règle d’implantation de la zone de picking — prends la PREMIÈRE ligne qui convient</p>
    <ol class="rc-ul">
      <li>Moins de <b>5 colis par jour</b> → <b>${ZONES.reserve}</b> : une palette entière en bas pour si peu de sorties, c’est de la place perdue.</li>
      <li>Sinon, sac de <b>8 kg ou plus</b> → <b>${ZONES.sol}</b> : on ne soulève pas des sacs lourds en hauteur, on les prend au sol, palette entière.</li>
      <li>Sinon → <b>${ZONES.canal}</b> : les cartons de petits sacs glissent sur des rouleaux ; on remplit par l’arrière, on prélève par l’avant.</li>
    </ol>
    <p class="rc-regle">Un canal dynamique contient <b>${CAPACITE_CANAL} cartons</b>. Réappros par jour = colis par jour ÷ ${CAPACITE_CANAL}, arrondi à l’entier <b>supérieur</b>.</p>
    ${pied('Règle CONSTRUITE pour l’exercice, à partir de l’équipement réel de l’entrepôt (canaux dynamiques, palettes au sol). Document pédagogique.')}
  </article>` });
const docFlux = (D) => ({ id: 'flux', titre: 'Les sorties par jour', court: 'Les sorties par jour',
  html: `<article class="rc-doc" aria-label="Les sorties par jour">
    <p class="rc-t">Sorties moyennes par jour — zone de picking</p>
    <p class="rc-st">En colis : un sac pour les gros sacs, un carton pour les petits sacs</p>
    <table class="rc-table"><thead><tr><th scope="col">Référence</th><th scope="col">Produit</th><th class="rc-d" scope="col">Poids du sac</th><th class="rc-d" scope="col">Colis par jour</th></tr></thead>
      <tbody>${D.impl.map(([r, c]) => `<tr><td class="rc-mono">${r}</td><td>${ech(REF[r].nom)}${REF[r].carton ? ` (carton de ${REF[r].carton} sacs)` : ''}</td><td class="rc-d">${REF[r].kg} kg</td><td class="rc-d">${c}</td></tr>`).join('')}</tbody></table>
    ${pied('Chiffres CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });
const docMethodeExport = () => ({ id: 'methode-export', titre: 'Méthode : la durée de vie restante', court: 'Méthode export',
  html: `<article class="rc-doc" aria-label="Méthode export">
    <p class="rc-t">Méthode : préparer une commande qui exige une durée de vie restante</p>
    <ul class="rc-ul">
      <li>Chaque lot porte une <b>DDM</b> (date de durabilité minimale, « à consommer de préférence avant »).</li>
      <li>Un client peut exiger un <b>nombre de mois de DDM restante au départ</b> : un lot est <b>conforme</b> si sa DDM tombe <b>le jour limite ou après</b>
        (aujourd’hui + ce nombre de mois).</li>
      <li>Parmi les lots conformes, on prend d’abord celui dont la DDM est <b>la plus proche</b> : c’est le <b>FEFO</b> (premier périmé, premier sorti).</li>
      <li>Les lots trop courts pour ce client ne sont pas perdus : ils partent vers des clients moins exigeants (France, délais courts).</li>
    </ul>
    <p class="rc-st">Exemple : aujourd’hui 1er mai, 6 mois exigés → limite 1er novembre. Un lot au 30 octobre n’est pas conforme ; un lot au 1er novembre l’est.</p>
    ${pied('Fiche méthode CONSTRUITE pour l’exercice (FEFO et DDM sont des notions réelles). Document pédagogique.')}
  </article>` });
function docCommandeExport(D) {
  const E = D.export;
  return { id: 'commande-export', titre: 'La commande export', court: 'La commande export',
    html: `<article class="rc-doc" aria-label="Commande export">
    <p class="rc-t">Commande export — ${ech(fdate(E.aujourdhui))}</p>
    <p class="rc-st">Client : ${ech(E.client)} · départ du camion aujourd’hui</p>
    <table class="rc-table"><tbody>
      <tr><th scope="row">Référence</th><td><span class="rc-mono">${E.ref}</span> — ${ech(des(E.ref))}</td></tr>
      <tr><th scope="row">Quantité</th><td>${E.palettes} palettes</td></tr>
      <tr><th scope="row">Exigence du client</th><td>au moins <b>${E.exigeMois} mois</b> de DDM restante au départ de l’entrepôt</td></tr>
    </tbody></table>
    ${pied('Commande CONSTRUITE pour l’exercice (aucun client réel). Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
}
const docLots = (D) => ({ id: 'lots', titre: `Les lots de ${D.export.ref} en stock`, court: 'Les lots',
  html: `<article class="rc-doc" aria-label="Lots en stock">
    <p class="rc-t">Lots en stock — <span class="rc-mono">${D.export.ref}</span></p>
    <p class="rc-st">Extraction du WMS, ${ech(fdate(D.export.aujourdhui))}, dans l’ordre de fabrication</p>
    <table class="rc-table"><thead><tr><th scope="col">Lot</th><th scope="col">DDM</th><th class="rc-d" scope="col">Palettes</th></tr></thead>
      <tbody>${D.export.lots.map(([l, d, p]) => `<tr><td class="rc-mono">${l}</td><td>${fdate(d)}</td><td class="rc-d">${p}</td></tr>`).join('')}</tbody></table>
    ${pied('Lots CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });
function docPrepMehdi(D) {
  const X = preparationExport(D.export);
  return { id: 'prep-mehdi', titre: `La préparation de ${D.collegue}`, court: `La préparation de ${D.collegue}`,
    html: `<article class="rc-doc" aria-label="Préparation de ${ech(D.collegue)}">
    <p class="rc-t">Bon de préparation — commande export</p>
    <p class="rc-st">Préparé par ${ech(D.collegue)} ce matin, palettes filmées au quai 3</p>
    <table class="rc-table"><thead><tr><th scope="col">Lot</th><th class="rc-d" scope="col">Palettes</th></tr></thead>
      <tbody>${X.fifo.map(([l, q]) => `<tr><td class="rc-mono">${l}</td><td class="rc-d">${q}</td></tr>`).join('')}</tbody></table>
    <p class="rc-st">Note de ${ech(D.collegue)} : « Premier entré, premier sorti, comme d’habitude. »</p>
    ${pied('Bon CONSTRUIT pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
}
const docDroit = () => ({ id: 'droit', titre: 'Le droit : livrer conforme', court: 'Le droit',
  html: `<article class="rc-doc" aria-label="Le droit : livrer conforme">
    <p class="rc-t">Le droit : livrer ce qui a été convenu</p>
    <ul class="rc-ul">
      <li>Le vendeur doit livrer une marchandise <b>conforme</b> à ce qui a été convenu : la quantité, la qualité, et tout ce que la commande fixe (ici, une
        durée de vie restante). Une livraison non conforme peut être <b>refusée</b> par l’acheteur, et coûter un retour, une pénalité, un client.</li>
      <li>La <b>DDM</b> (« à consommer de préférence avant ») n’est pas une <b>DLC</b> (« à consommer jusqu’au », produits frais) : après une DDM, le produit
        n’est pas dangereux, il peut perdre de ses qualités. Les produits proches de leur date se vendent, se déstockent ou se donnent plutôt que d’être jetés.</li>
      <li>Le <b>port de charges</b> fait partie des risques que l’employeur doit évaluer et réduire (organisation du poste, aides à la manutention).</li>
    </ul>
    ${pied('Résumé pour l’exercice (pas une citation de texte de loi). Document pédagogique.')}
  </article>` });

// ─────────────────────────────────────────── la fiche
const nb = (id, lib, unite, manque, entier = false) => ({ type: 'nombre', id, lib, unite, min: 0, ...(entier ? { entier: true } : {}), manque });
const choixRefs = (refs) => refs.map((r) => ({ v: r, lib: `${r} — ${REF[r].nom}` }));
function blocsInd(D, num) {
  return [{ type: 'cadre', titre: `${num}. Les indicateurs de ${D.mois}`, large: true, blocs: [
    ...D.calcul.flatMap((r) => [nb(`rot-${r}`, `${r} : rotation du mois`, '', `la rotation de ${r}`), nb(`couv-${r}`, `${r} : couverture`, 'jours', `la couverture de ${r}`)]),
    { type: 'cases', id: 'rupture', titre: 'Les références en risque de rupture', consigne: 'Compare la couverture de chaque référence à son délai.', choix: choixRefs(D.ind.map((x) => x[0])) },
    { type: 'cases', id: 'surstock', titre: `Les références en surstock (plus de ${OBJECTIF_COUVERTURE} jours de couverture)`, choix: choixRefs(D.ind.map((x) => x[0])) },
    nb('service', `Taux de service de ${D.mois}`, '%', 'le taux de service'),
  ] }];
}
function blocsImpl(D, num) {
  const zones = Object.entries(ZONES).map(([v, lib]) => ({ v, lib }));
  return [{ type: 'cadre', titre: `${num}. La zone de picking`, large: true, blocs: [
    ...D.impl.map(([r]) => ({ type: 'liste', id: `zone-${r}`, lib: `${r} — ${REF[r].nom}, ${REF[r].kg} kg`, manque: `la zone de ${r}`, choix: zones })),
    ...(D.reappro || []).map((r) => nb(`reappro-${r}`, `Réappros par jour du canal de ${r}, s’il est en canal dynamique`, 'réappros', `les réappros de ${r}`, true)),
  ] }];
}
function blocsExport(D, num) {
  const E = D.export;
  return [
    ...(D.collegue ? [{ type: 'cadre', titre: `${num}. La préparation de ${D.collegue}`, large: true, blocs: [
      { type: 'cases', id: 'nonconformes', titre: 'Les lots de sa préparation qui ne respectent pas l’exigence du client', choix: E.lots.map(([l, d]) => ({ v: l, lib: `${l} (DDM ${fdate(d)})` })) },
      { type: 'choix', id: 'cause', lib: `Pourquoi ${D.collegue} s’est-il trompé ?`, colonne: true, manque: 'la cause', choix: [
        { v: 'fifo', lib: 'Il a pris les plus anciens (FIFO) sans vérifier la DDM exigée par le client' },
        { v: 'quantite', lib: 'Il s’est trompé de quantité' },
        { v: 'reference', lib: 'Il s’est trompé de référence' }] },
    ] }] : []),
    { type: 'cadre', titre: `${D.collegue ? num + 1 : num}. La commande export`, large: true, blocs: E.lots.map(([l, d]) => nb(`q-${l}`, `Palettes à prendre sur le lot ${l} (DDM ${fdate(d)})`, 'palettes', `les palettes du lot ${l}`, true)) },
  ];
}

// ─────────────────────────────────────────── l'état de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};

// ─────────────────────────────────────────── les phrases (de l'élève à Sandrine : tu poli)
function phrases(D, K, prenom) {
  const id = `compte-rendu-${D.code.slice(4).replace('.', '')}`;
  const salut = { id: 'salutation', choix: ['Bonjour Sandrine,', 'Salut la cheffe,', 'Yo,'], juste: 0 };
  const fin = { id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 };
  const lignes = [salut];
  if (K.ind) {
    const I = indicateurs(D);
    const rup = (L) => `Risque de rupture : ${liste(L)} (couverture plus courte que le délai) : il faut avancer leur réapprovisionnement.`;
    const sur = (L) => `Surstock : ${liste(L)} (plus de ${OBJECTIF_COUVERTURE} jours de couverture) : on peut retarder leur prochaine production.`;
    // La troisième phrase en oublie une ou en ajoute une : jamais deux phrases identiques quand il n'y en a qu'une.
    const autre = (L, M) => (L.length > 1 ? L.slice(0, 1) : [...L, M[0]]);
    lignes.push({ id: 'rupture', choix: [rup(I.rupture), rup(I.surstock), rup(autre(I.rupture, I.surstock))], juste: 0 });
    lignes.push({ id: 'surstock', choix: [sur(I.surstock), sur(I.rupture), sur(autre(I.surstock, I.rupture))], juste: 0 });
    lignes.push({ id: 'service', choix: [`Taux de service de ${D.mois} : ${n(I.service)} %.`, `Taux de service de ${D.mois} : ${n(Math.round((100 - I.service) * 10) / 10)} %.`,
      `Taux de service de ${D.mois} : ${n(Math.round(D.lignes.commandees / D.lignes.completes * 1000) / 10)} %.`], juste: 0 });
  }
  if (K.impl) {
    const M = implantation(D);
    const par = (z) => D.impl.map((x) => x[0]).filter((r) => M.zones[r] === z);
    const dit = (Z) => `Je propose : ${['canal', 'sol', 'reserve'].filter((z) => Z[z].length).map((z) => `${ZONES[z].split(' (')[0].toLowerCase()} pour ${liste(Z[z])}`).join(' ; ')}.`;
    const juste = { canal: par('canal'), sol: par('sol'), reserve: par('reserve') };
    const lourd = D.impl.map((x) => x[0]).find((r) => M.zones[r] === 'reserve' && REF[r].kg >= 8);
    const faux1 = lourd ? { canal: juste.canal, sol: [...juste.sol, lourd], reserve: juste.reserve.filter((r) => r !== lourd) }
      : { canal: [...juste.canal, ...juste.reserve], sol: juste.sol, reserve: [] };
    const faux2 = juste.sol.length ? { canal: [...juste.canal, ...juste.sol.slice(-1)], sol: juste.sol.slice(0, -1), reserve: juste.reserve }
      : { canal: juste.canal.slice(1), sol: juste.canal.slice(0, 1), reserve: juste.reserve };
    lignes.push({ id: 'implantation', choix: [dit(juste), dit(faux1), dit(faux2)], juste: 0 });
    if (D.reappro && D.reappro.length) {
      const rq = (f) => `Réappros des canaux : ${liste(D.reappro.map((r) => `${f(r)} par jour pour ${r}`))}.`;
      const colis = (r) => D.impl.find((x) => x[0] === r)[1];
      lignes.push({ id: 'reappro', choix: [rq((r) => M.reappros[r]), rq((r) => Math.floor(colis(r) / CAPACITE_CANAL)), rq((r) => colis(r))], juste: 0 });
    }
  }
  if (K.export) {
    const X = preparationExport(D.export);
    const envoie = (P) => `Pour le client export, j’envoie ${liste(P.map(([l, q]) => `${q} palette${q > 1 ? 's' : ''} du lot ${l}`))}.`;
    const tries = D.export.lots.slice().sort((a, b) => (a[1] > b[1] ? -1 : 1));
    let r = D.export.palettes; const longs = [];
    for (const [l, , q] of tries) { if (r <= 0) break; const k = Math.min(q, r); longs.push([l, k]); r -= k; }
    if (D.collegue) lignes.push({ id: 'erreur', choix: [`La préparation de ${D.collegue} contient ${liste(X.fifoNonConformes)} : leur DDM est trop courte pour ce client.`,
      `La préparation de ${D.collegue} est conforme.`, `La préparation de ${D.collegue} n’a pas la bonne quantité.`], juste: 0 });
    lignes.push({ id: 'export', choix: [envoie(X.prises), envoie(X.fifo), envoie(longs)], juste: 0 });
  }
  lignes.push(fin);
  return { id, melanger: true, lignes };
}

// ─────────────────────────────────────────── la fabrique d'une séance
// D : le jeu ; O : { id, K ({ ind, impl, export }), poids, consigne, poste, objet, etape, questions }.
export function seance(D, O) {
  const K = O.K;
  const suffixe = D.code.slice(4).replace('.', '');
  const FICHE_ID = `fiche-${suffixe}`, VOLET_ID = `rc-${suffixe}`;
  const P = phrases(D, K, '{prenom}');
  const PHRASES_ID = P.id;
  const I = K.ind ? indicateurs(D) : null, M = K.impl ? implantation(D) : null, X = K.export ? preparationExport(D.export) : null;

  const docs = [docPoste(D, O.poste)];
  if (K.ind) docs.push(docTableau(D), docMethodeInd());
  if (K.impl) docs.push(docFlux(D), docMethodePicking());
  if (K.export) docs.push(docCommandeExport(D), docLots(D), ...(D.collegue ? [docPrepMehdi(D)] : []), docMethodeExport());
  docs.push(docDroit());
  const DOCUMENTS = docs;
  let num = 1;
  const blocs = [];
  if (K.ind) blocs.push(...blocsInd(D, num++));
  if (K.impl) blocs.push(...blocsImpl(D, num++));
  if (K.export) blocs.push(...blocsExport(D, num++));
  const surFicheDocs = DOCUMENTS.map((d) => d.id).filter((x) => x !== 'poste' && x !== 'droit');
  const FICHE = {
    id: FICHE_ID, libelle: 'Fiche de travail', titre: O.titre, sousTitre: 'À gauche : les documents et les fiches méthode. Calcule au brouillon ou à la calculatrice.',
    documents: surFicheDocs, largeurDocs: 1.3, defile: true, bouton: 'Ouvrir la fiche de travail', blocs,
    envoi: { bouton: 'Envoyer la fiche à Sandrine', a: 'Sandrine', suite: 'Écris-lui maintenant ton compte rendu, dans la Messagerie.' },
  };
  const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decale || 0), from: SANDRINE.nom, fromMail: SANDRINE.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
  const VOLET = {
    id: VOLET_ID,
    semer: (prenom) => ({ mails: [mail(prenom, O.objet, `Bonjour ${prenom} !\n\n${O.consigne}\n\nSandrine`, { decale: -3600e3, extra: { pieces: DOCUMENTS.map((d) => d.id).filter((x) => x !== 'droit'), ouvreFiche: FICHE_ID } })] }),
    declencheurs: [
      { id: 'compte', quand: apresFiche(FICHE_ID),
        semer: (prenom) => ({ mails: [mail(prenom, 'Ton compte rendu', `Bonjour ${prenom},\n\nJ’ai ta fiche. Écris-moi en quelques lignes ce que tu proposes : `
          + 'je le reprends pour la réunion de cet après-midi.\n\nSandrine', { extra: { phrases: phrases(D, K, prenom) } })] }) },
      { id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye,
        semer: (prenom) => ({ mails: [mail(prenom, 'Merci', `Merci ${prenom}. Je regarde ta fiche et ton compte rendu.\n\nSandrine`, { decale: 1000 })] }) },
    ],
  };

  // ── les jalons
  const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
  const W = O.poids;
  const G = { ind: 'Les indicateurs', impl: 'La zone de picking', exp: 'La commande export', compte: 'Le compte rendu' };
  const surFiche = (id, titre, groupe, juste, poids = W[id]) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_ID}`,
    verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return juste(valeursDe(db, FICHE_ID)) ? ok : ko; } });
  const proche = (k, attendu) => (v) => Math.abs(lireNombre(v[k]) - attendu) < 0.051;
  const cases = (k, attendu) => (v) => Array.isArray(v[k]) && v[k].length > 0 && memes(v[k], attendu);
  const ETAPES = [];
  if (K.ind) {
    for (const r of D.calcul) {
      ETAPES.push(surFiche(`rot-${r}`, `La rotation de ${r}`, G.ind, proche(`rot-${r}`, I.par[r].rotation), W.rotation));
      ETAPES.push(surFiche(`couv-${r}`, `La couverture de ${r}`, G.ind, proche(`couv-${r}`, I.par[r].couverture), W.couverture));
    }
    ETAPES.push(surFiche('rupture', 'Les risques de rupture', G.ind, cases('rupture', I.rupture)));
    ETAPES.push(surFiche('surstock', 'Les surstocks', G.ind, cases('surstock', I.surstock)));
    ETAPES.push(surFiche('service', 'Le taux de service', G.ind, proche('service', I.service)));
  }
  if (K.impl) {
    for (const [r] of D.impl) ETAPES.push(surFiche(`zone-${r}`, `${r} : sa zone`, G.impl, (v) => v[`zone-${r}`] === M.zones[r], W.zone));
    for (const r of D.reappro || []) ETAPES.push(surFiche(`reappro-${r}`, `Les réappros de ${r}`, G.impl, proche(`reappro-${r}`, M.reappros[r]), W.reappro));
  }
  if (K.export) {
    if (D.collegue) {
      ETAPES.push(surFiche('nonconformes', `Les lots non conformes de ${D.collegue}`, G.exp, cases('nonconformes', X.fifoNonConformes)));
      ETAPES.push(surFiche('cause', 'La cause de l’erreur', G.exp, (v) => v.cause === 'fifo'));
    }
    const qte = (v, l) => { const x = lireNombre(v[`q-${l}`]); return Number.isNaN(x) ? 0 : x; };
    ETAPES.push(surFiche('lots', 'Les lots choisis', G.exp, (v) => memes(D.export.lots.map((x) => x[0]).filter((l) => qte(v, l) > 0), X.lotsPris)));
    ETAPES.push(surFiche('quantites', 'Les palettes de chaque lot', G.exp, (v) => D.export.lots.every(([l]) => qte(v, l) === ((X.prises.find((x) => x[0] === l) || [l, 0])[1]))));
  }
  const cles = P.lignes.map((l) => l.id).filter((x) => x !== 'salutation' && x !== 'fin');
  ETAPES.push({ id: 'compte-rendu', titre: 'Le compte rendu à Sandrine', groupe: G.compte, poids: W['compte-rendu'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return cles.every((l) => r.justes.includes(l)) ? ok : ko; } });
  const manque = ETAPES.filter((e) => typeof e.poids !== 'number');
  if (manque.length) throw new Error(`${D.code} : jalon sans poids (${manque.map((e) => e.id).join(', ')})`);

  const ficheFaite = (db) => envoyee(db, FICHE_ID);
  const rendu = (db) => phrasesJustes(db, PHRASES_ID).envoye;
  const PASTILLES = [{ libelle: 'La fiche', fait: ficheFaite }, { libelle: 'Le compte rendu', fait: rendu }];
  const SUITE = [{ vue: 'fiche', libelle: 'La fiche de travail', fait: ficheFaite }, { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu à Sandrine', fait: rendu }];
  const ACCUEIL = {
    titre: O.titre, kpis: ['mail'],
    etapes: [
      ['Lire le message de Sandrine', 'Menu Messagerie. Les documents sont joints, avec les fiches méthode.'],
      ['① La fiche de travail', O.etape],
      ['② Le compte rendu', 'Réponds à Sandrine, une phrase par ligne.'],
      ['Bon à savoir', MENTION],
    ],
  };
  const OPTIONS = { menu: [], exercice: O.titre, sansTrame: 'Tout se fait à l’écran', documents: DOCUMENTS, documentsStyle: STYLE, fiches: [FICHE],
    pastilles: PASTILLES, suite: SUITE, equipe: EQUIPE, ...(O.questions ? { questions: O.questions } : {}) };
  return { ID: O.id, FICHE_ID, PHRASES_ID, VOLET_ID, I, M, X, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS };
}

// ─────────────────────────────────────────── la banque « Avant de commencer » (commune aux cinq séances)
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'sandrine', doc, rubrique, enonce, choix, juste, retour });
export const BANQUE = [
  q('rotation', 'preparation', 'poste', 'Une référence a une rotation de 6 sur le mois. Cela veut dire…',
    [{ v: 'six', lib: 'que son stock moyen a été vendu six fois dans le mois' }, { v: 'jours', lib: 'qu’elle reste six jours en stock' }, { v: 'palettes', lib: 'qu’il y en a six palettes' }], 'six',
    'Sorties ÷ stock moyen : plus la rotation est forte, plus le stock « tourne » vite.'),
  q('couverture', 'preparation', 'poste', 'Une référence a 2 jours de couverture et 3 jours de délai de réappro. Que risque-t-on ?',
    [{ v: 'rupture', lib: 'Une rupture : le stock s’épuise avant l’arrivée de la prochaine production' }, { v: 'surstock', lib: 'Un surstock' }, { v: 'rien', lib: 'Rien' }], 'rupture',
    'Le stock tient 2 jours, la livraison en met 3 : un jour sans rien à livrer.'),
  q('fefo', 'preparation', 'poste', 'FEFO veut dire…',
    [{ v: 'perime', lib: 'premier périmé, premier sorti' }, { v: 'entre', lib: 'premier entré, premier sorti' }, { v: 'dernier', lib: 'dernier entré, premier sorti' }], 'perime',
    'On sort d’abord le lot dont la date est la plus proche : il a le moins de temps devant lui.'),
  q('lourd', 'preparation', 'poste', 'Où prélève-t-on de préférence des sacs de 15 kg très demandés ?',
    [{ v: 'sol', lib: 'Sur une palette au sol' }, { v: 'haut', lib: 'En hauteur, pour gagner de la place' }, { v: 'canal', lib: 'Dans un canal dynamique' }], 'sol',
    'Le lourd se prend bas : moins d’effort, moins de risque pour le dos.'),
  q('ddm', 'droit', 'droit', 'Un sac a dépassé sa DDM (« à consommer de préférence avant »). C’est…',
    [{ v: 'qualite', lib: 'un produit qui peut avoir perdu des qualités, pas un produit dangereux' }, { v: 'interdit', lib: 'un produit interdit à la vente et dangereux' },
      { v: 'rien', lib: 'un produit neuf' }], 'qualite',
    'Une DDM n’est pas une DLC : passée la date, le produit n’est pas dangereux, mais on ne le livre pas à un client qui exige une durée de vie restante.'),
  q('conforme', 'droit', 'droit', 'Le client a commandé avec au moins 9 mois de DDM restante. On lui livre un lot à 6 mois. Il peut…',
    [{ v: 'refuser', lib: 'refuser la livraison : elle n’est pas conforme à la commande' }, { v: 'payer', lib: 'seulement payer moins cher' }, { v: 'rien', lib: 'rien du tout' }], 'refuser',
    'Le vendeur doit livrer ce qui a été convenu : une exigence écrite dans la commande en fait partie.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'sandrine', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de t’y mettre, regarde les documents à gauche et réponds à mes questions.',
  documents: ['poste', 'droit'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
