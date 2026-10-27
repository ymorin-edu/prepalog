// Lactalis — le rappel des laits infantiles (décembre 2017) : l'UNIVERS commun des séances ENT-14.1 à 14.4 (1re, C3.2 « assurer la traçabilité »)
// et la FABRIQUE de leurs écrans. Cadrage : `docs/briefs/lactalis/CADRAGE-lactalis-1re.md` ; données : `contenus/lactalis-donnees.js`.
//
// L'élève est agent(e) logistique au service traçabilité de la plateforme régionale d'une enseigne de supermarchés de l'Ouest (CONSTRUITE, jamais
// nommée). Un avis de retrait-rappel tombe : il remonte les lots (amont : le registre des réceptions), retrouve les magasins livrés (aval : le registre
// des expéditions), bloque ce qui reste chez nous (écran « Blocage qualité » du moteur, lot par lot) et rend compte au service qualité de l'enseigne.
// Aucune vue nouvelle : documents joints, fiche, écran de blocage, réponse par phrases, questions au fil.
//
// Chaque séance déclare son jeu (`D14x` de `lactalis-donnees.js`), ses poids et ses questions, et appelle `seance(...)` qui rend tout le reste.

import { catalogueSimple } from './entreprise-commun.js';
import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { ARTICLES, ARTICLE, MAGASINS, MAGASIN, bilan, travailDeTheo, tsDe, dateDuLot, fdateIso, REGLE_21_DECEMBRE } from './lactalis-donnees.js';

// ─────────────────────────────────────────── l'univers
export const ENTREPRISE = {
  id: 'lactalis',
  nom: 'Plateforme régionale Ouest',
  sousTitre: 'Enseigne de supermarchés (construite) — le rappel des laits infantiles Lactalis, 2017',
  exercice: 'Tracer un lot rappelé',
};
export const VOCAB = {
  unit: 'boîte', unitPl: 'boîtes',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'plateforme-ouest.example',
};
// Un bleu ardoise : la plateforme est construite, elle n'a pas de charte ; ni rouge (« faux ») ni vert (« juste »).
export const THEME = { accent: '#35577a', papier: true };

export const CATALOGUE = catalogueSimple(ARTICLES.map((a) => ({
  ref: a.ref, designation: a.designation, marque: a.marque, categorie: 'Nutrition infantile', fournisseur: 'F-LNS', stock: 0,
})));
export const SUPPLIERS = [
  { id: 'F-LNS', brand: 'Lactalis Nutrition Santé', name: 'Lactalis Nutrition Santé, usine de Craon (Mayenne)', adr: '', cp: '', ville: 'Craon',
    contact: '', tel: '', email: 'service-clients@fournisseur.example', delai: 3, franco: 0, pay: '30 jours net', moq: 1 },
];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : le rappel des laits infantiles fabriqués par Lactalis Nutrition Santé à Craon (Mayenne) en décembre 2017, ses dates et sa règle, '
  + 'les marques Picot et Milumel. Construits : la plateforme et son enseigne, les magasins, les prénoms, les références, les quantités et les numéros de lot.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  julien: { nom: 'Julien', role: 'responsable de la plateforme (ton responsable)', appel: 'Julien' },
  qualite: { nom: 'Service qualité de l’enseigne', role: 'service qualité', appel: 'le service qualité' },
};
const JULIEN = { nom: 'Julien, responsable de la plateforme', mail: 'julien@plateforme-ouest.example' };
export const MAIL_QUALITE = 'qualite@enseigne-ouest.example';
const QUALITE = { nom: 'Service qualité de l’enseigne', mail: MAIL_QUALITE };

// Le règlement (CE) n° 178/2002, article 19, paragraphe 1 (première phrase) : texte cité dans `TEXTES` plus bas.
export { ARTICLE_19 } from './lactalis-droit.js';
import { ARTICLE_19, SOURCE_19 } from './lactalis-droit.js';

// ─────────────────────────────────────────── aides
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = 'Document pédagogique — reconstitution, non contractuel.';
const pied = (t = PIED) => `<p class="lx-pied">${ech(t)}</p>`;
const n = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
export const nomsMagasins = (ids) => liste(ids.map((id) => MAGASIN[id].nom));
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
const memes = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

export const STYLE = `
--douce:#555047;
.lx-doc{padding:14px 18px 0}
.lx-doc p{margin:0 0 8px}
.lx-t{margin:0; font-size:1.08rem; font-weight:800}
.lx-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.lx-ul{margin:4px 0 8px; padding-left:20px; font-size:.92rem}
.lx-ul li{margin:4px 0}
.lx-loi{margin:2px 0 6px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.lx-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047; font-weight:700}
.lx-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.lx-table th, .lx-table td{border-bottom:1px solid #d6d0c3; padding:4px 6px; text-align:left}
.lx-table th{color:var(--douce); font-weight:600}
.lx-table .lx-d{text-align:right; white-space:nowrap}
.lx-table th.lx-d{white-space:normal}
.lx-doc{overflow-x:auto}
.lx-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.lx-lot{font-family:ui-monospace, Consolas, monospace; font-size:1.3rem; letter-spacing:.06em; margin:6px 0}
.lx-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents communs
const docLireLot = () => ({ id: 'lire-lot', titre: 'Lire un numéro de lot', court: 'Le numéro de lot',
  html: `<article class="lx-doc" aria-label="Lire un numéro de lot">
    <p class="lx-t">Lire un numéro de lot</p>
    <p class="lx-st">Le numéro est imprimé sur chaque boîte et sur chaque carton, et recopié à la réception</p>
    <p class="lx-lot">CR-170412-A</p>
    <ul class="lx-ul">
      <li><b>CR</b> : l’usine où le lait a été fabriqué (CR = Craon, en Mayenne).</li>
      <li><b>170412</b> : la date de fabrication, dans l’ordre <b>année, mois, jour</b> : 17 = 2017, 04 = avril, 12 = le 12. Fabriqué le <b>12/04/2017</b>.</li>
      <li><b>A</b> : l’équipe qui l’a fabriqué (A, B ou C).</li>
    </ul>
    <p>Toutes les boîtes d’un même lot ont été fabriquées ensemble : si l’une pose problème, on retire tout le lot, et seulement lui.</p>
    ${pied('Format de lot CONSTRUIT pour l’exercice (le vrai format de l’usine n’est pas repris ; aucun numéro de ces séances n’est un vrai lot). Document pédagogique.')}
  </article>` });

const docDroit = () => ({ id: 'droit', titre: 'Le droit : retirer du marché', court: 'Le droit',
  html: `<article class="lx-doc" aria-label="Le droit : retirer du marché">
    <p class="lx-t">Le droit : qui doit retirer ?</p>
    <p class="lx-st">Règlement (CE) n° 178/2002 du Parlement européen et du Conseil, article 19, paragraphe 1</p>
    <p class="lx-loi">« ${ech(ARTICLE_19)} »</p>
    <p>« Exploitant » : toute entreprise du secteur alimentaire, celle qui fabrique comme celle qui <b>distribue</b>.</p>
    <p>Un <b>retrait</b> enlève le produit de la vente avant qu’il arrive au consommateur ; un <b>rappel</b> demande aux consommateurs qui l’ont acheté
      de ne pas le consommer et de le rapporter.</p>
    ${pied(`Texte de loi (réel) — source : ${SOURCE_19}.`)}
  </article>` });

function docAvis(D) {
  const A = D.avis;
  const corps = A.mode === 'liste'
    ? `<p>Les lots ci-dessous de laits infantiles fabriqués à l’usine de Craon (Mayenne) doivent être <b>retirés de la vente</b> et <b>rappelés</b> :
        une contamination par une salmonelle a été trouvée sur le site de production.</p>
      <table class="lx-table"><thead><tr><th scope="col">Numéro de lot</th><th scope="col">Produit</th></tr></thead>
        <tbody>${A.lots.map(([l, ref]) => `<tr><td class="lx-mono">${ech(l)}</td><td>${ech(ARTICLE[ref].designation)}</td></tr>`).join('')}</tbody></table>`
    : `<p>Après de nouveaux contrôles, la mesure est <b>étendue</b>. Doivent être retirés de la vente et rappelés :</p>
      <p class="lx-regle">Tous les produits de nutrition infantile fabriqués ou conditionnés à l’usine de Craon (Mayenne) depuis le 15 février 2017, quel que soit le numéro de lot.</p>
      <p>Les listes de lots envoyées avant cet avis ne suffisent plus : <b>lisez la date de fabrication de chaque lot</b>.</p>`;
  return { id: 'avis', titre: `L’avis de retrait-rappel du ${A.date}`, court: 'L’avis de rappel',
    html: `<article class="lx-doc" aria-label="Avis de retrait-rappel">
    <p class="lx-t">Avis de retrait-rappel — ${ech(A.date)}</p>
    <p class="lx-st">Transmis par le service qualité de l’enseigne à toutes ses plateformes et à tous ses magasins</p>
    ${corps}
    <p>À faire <b>immédiatement</b> : ne plus expédier aucune boîte de ces lots, bloquer le stock, et dire au service qualité quels magasins ont été livrés.</p>
    ${pied(A.mode === 'liste'
      ? 'Reconstitution : le retrait-rappel de 12 lots du 2 décembre 2017 est réel ; la mise en page et les numéros de lot sont CONSTRUITS. Document pédagogique, non contractuel.'
      : 'Reconstitution : l’extension du 21 décembre 2017 aux produits fabriqués à Craon depuis le 15 février 2017 est réelle ; la mise en page est CONSTRUITE. Document pédagogique, non contractuel.')}
  </article>` };
}

const docReceptions = (D) => ({ id: 'receptions', titre: 'Le registre des réceptions', court: 'Les réceptions',
  html: `<article class="lx-doc" aria-label="Registre des réceptions">
    <p class="lx-t">Registre des réceptions — laits infantiles</p>
    <p class="lx-st">Ce qui est ENTRÉ à la plateforme : une ligne par lot reçu (le numéro de lot est recopié du carton)</p>
    <table class="lx-table"><thead><tr><th scope="col">Date</th><th scope="col">Réception</th><th scope="col">Référence</th><th scope="col">Produit</th><th scope="col">Lot</th><th class="lx-d" scope="col">Boîtes</th></tr></thead>
      <tbody>${D.receptions.map(([d, no, ref, lot, q]) => `<tr><td>${d}</td><td class="lx-mono">${no}</td><td class="lx-mono">${ref}</td><td>${ech(ARTICLE[ref].designation)}</td>
        <td class="lx-mono">${lot}</td><td class="lx-d">${n(q)}</td></tr>`).join('')}</tbody></table>
    <p class="lx-st" style="margin-top:8px">Fournisseur de toutes ces lignes : Lactalis Nutrition Santé, usine de Craon (Mayenne).</p>
    ${pied('Registre CONSTRUIT pour l’exercice (références, quantités, numéros). Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

const docExpeditions = (D) => ({ id: 'expeditions', titre: 'Le registre des expéditions', court: 'Les expéditions',
  html: `<article class="lx-doc" aria-label="Registre des expéditions">
    <p class="lx-t">Registre des expéditions — laits infantiles</p>
    <p class="lx-st">Ce qui est SORTI vers les magasins de l’enseigne : une ligne par lot et par bon de livraison</p>
    <table class="lx-table"><thead><tr><th scope="col">Date</th><th scope="col">Bon</th><th scope="col">Magasin</th><th scope="col">Référence</th><th scope="col">Lot</th><th class="lx-d" scope="col">Boîtes</th></tr></thead>
      <tbody>${D.expeditions.map(([d, no, mag, ref, lot, q]) => `<tr><td>${d}</td><td class="lx-mono">${no}</td><td>${ech(MAGASIN[mag].nom)}</td><td class="lx-mono">${ref}</td>
        <td class="lx-mono">${lot}</td><td class="lx-d">${n(q)}</td></tr>`).join('')}</tbody></table>
    ${pied('Registre CONSTRUIT pour l’exercice (magasins fictifs dans des villes réelles de la Mayenne). Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

function docPoste(D, texte) {
  return { id: 'poste', titre: 'Ton poste', court: 'Ton poste',
    html: `<article class="lx-doc" aria-label="Ton poste">
    <p class="lx-t">Ton poste</p>
    <p class="lx-st">Service traçabilité de la plateforme régionale Ouest — ${ech(D.jour.lib)}</p>
    <p>Tu es agent(e) logistique à la <b>plateforme régionale</b> d’une enseigne de supermarchés de l’Ouest. La plateforme reçoit les produits des fabricants et
      livre les <b>magasins</b> de l’enseigne en Mayenne. Ton responsable : <b>Julien</b>.</p>
    ${texte}
    <p><b>Ce qui s’est passé (réel)</b> : en décembre 2017, une salmonelle est trouvée dans l’usine de laits infantiles de Lactalis à Craon (Mayenne) ; des nourrissons
      tombent malades. Le 2 décembre, 12 lots sont rappelés ; le 10 décembre, plus de 600 ; le 21 décembre, tous les produits fabriqués à Craon depuis le 15 février 2017.
      Des enseignes ont reconnu avoir encore vendu des boîtes <b>après</b> le rappel.</p>
    ${pied(`Document pédagogique. ${MENTION}`)}
  </article>` };
}

// ENT-14.3 : le relevé de Théo (ce qu'il a envoyé le 22/12).
function docReleve(D) {
  const T = travailDeTheo(D);
  return { id: 'releve', titre: `Le relevé de ${D.collegue} du ${D.traite}`, court: `Le relevé de ${D.collegue}`,
    html: `<article class="lx-doc" aria-label="Relevé de ${ech(D.collegue)}">
    <p class="lx-t">Relevé de traçabilité — avis du ${ech(D.avis.date)}</p>
    <p class="lx-st">Fait par ${ech(D.collegue)} le ${ech(D.traite)} et envoyé au service qualité</p>
    <p><b>Lots visés passés chez nous :</b></p>
    <ul class="lx-ul">${T.lots.map((l) => `<li class="lx-mono">${l}</li>`).join('')}</ul>
    <p><b>Bloqué le ${ech(D.traite)} :</b></p>
    <table class="lx-table"><thead><tr><th scope="col">Lot</th><th scope="col">Référence</th><th class="lx-d" scope="col">Boîtes bloquées</th></tr></thead>
      <tbody>${T.blocages.map((b) => `<tr><td class="lx-mono">${b.lot}</td><td class="lx-mono">${b.ref}</td><td class="lx-d">${b.q}</td></tr>`).join('')}</tbody></table>
    <p style="margin-top:8px"><b>Magasins prévenus :</b> ${ech(nomsMagasins(T.magasins))}.</p>
    <p class="lx-st">Note de ${ech(D.collegue)} : « J’ai gardé les lots fabriqués après le 15 février. »</p>
    ${pied('Relevé CONSTRUIT pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
}

// ─────────────────────────────────────────── la fiche
const choixLots = (lots) => lots.map((l) => ({ v: l, lib: `${l} — ${ARTICLE[lotRef(l)] ? ARTICLE[lotRef(l)].designation : ''}` }));
let REF_DE_LOT = {};
const lotRef = (l) => REF_DE_LOT[l];
const choixMagasins = MAGASINS.map((m) => ({ v: m.id, lib: m.nom }));

function blocsTracer(D) {
  const lots = D.avis.mode === 'liste' ? D.avis.lots.map(([l]) => l) : D.receptions.map((r) => r[3]);
  const avecApres = !!D.urgent;
  return [
    { type: 'cadre', titre: '1. L’amont : les lots', large: true, blocs: [
      { type: 'cases', id: 'lots', titre: D.avis.mode === 'liste' ? 'Les lots de l’avis qui sont passés chez nous' : 'Les lots reçus que l’avis vise',
        consigne: D.avis.mode === 'liste' ? 'Cherche chaque lot de l’avis dans le registre des réceptions.' : 'Lis la date de fabrication de chaque lot reçu et compare-la à la règle de l’avis.',
        choix: choixLots(lots) },
    ] },
    { type: 'cadre', titre: '2. L’aval : les magasins', large: true, blocs: [
      { type: 'cases', id: 'magasins', titre: 'Les magasins livrés avec un lot visé', consigne: 'Cherche chaque lot visé dans le registre des expéditions.', choix: choixMagasins },
      ...(avecApres ? [{ type: 'cases', id: 'apres', titre: `Parmi eux, ceux livrés le ${D.avis.date} ou après (après l’avis)`, choix: choixMagasins }] : []),
      { type: 'nombre', id: 'partis', lib: 'Boîtes des lots visés parties en magasin (en tout)', unite: 'boîtes', min: 0, entier: true, manque: 'les boîtes parties en magasin' },
    ] },
    { type: 'cadre', titre: '3. Ce qui reste chez nous', large: true, blocs: [
      { type: 'nombre', id: 'restant', lib: 'Boîtes des lots visés encore à la plateforme (en tout)', unite: 'boîtes', min: 0, entier: true, manque: 'les boîtes encore chez nous' },
    ] },
  ];
}

function blocsControle(D) {
  return [
    { type: 'cadre', titre: `1. Le relevé de ${D.collegue}`, large: true, blocs: [
      { type: 'cases', id: 'oublies', titre: `Les lots visés que le relevé de ${D.collegue} a oubliés`, consigne: 'Compare chaque lot reçu à la règle de l’avis, puis au relevé.',
        choix: choixLots(D.receptions.map((r) => r[3])) },
      { type: 'choix', id: 'pourquoi', lib: `Pourquoi ${D.collegue} s’est-il trompé ?`, colonne: true, manque: 'la raison de l’erreur', choix: [
        { v: 'borne', lib: 'Il a lu « depuis le 15 février » comme « après le 15 février » : le 15 est compris' },
        { v: 'registre', lib: 'Le lot n’était pas dans le registre des réceptions' },
        { v: 'usine', lib: 'Le lot vient d’une autre usine que Craon' },
      ] },
    ] },
    { type: 'cadre', titre: '2. Les magasins', large: true, blocs: [
      { type: 'cases', id: 'magasins', titre: `Les magasins qui ont reçu ce lot et que ${D.collegue} n’a pas prévenus`, choix: choixMagasins },
      { type: 'cases', id: 'apres', titre: 'Parmi eux, ceux livrés après l’avis', choix: choixMagasins },
    ] },
    { type: 'cadre', titre: '3. Ce qui reste du lot oublié', large: true, blocs: [
      { type: 'nombre', id: 'reste', lib: 'Boîtes du lot oublié encore à la plateforme', unite: 'boîtes', min: 0, entier: true, manque: 'les boîtes encore chez nous' },
    ] },
  ];
}

// ─────────────────────────────────────────── l'état de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};
// Les blocages qualité faits PAR L'ÉLÈVE (le collègue d'ENT-14.3 a les siens, semés à son nom).
export const blocagesEleve = (db, collegue) => ((db && db.moves) || []).filter((m) => m.type === 'Blocage qualité' && (!collegue || m.by !== collegue));
// Ce qui reste d'un lot dans la base (toutes les lignes qui le portent).
export const resteLot = (db, lot) => ((db && db.moves) || []).reduce((t, m) => t + (String(m.lot || '').toUpperCase() === lot ? m.delta : 0), 0);

// ─────────────────────────────────────────── les phrases du compte rendu (au vous : on écrit à un service)
function phrases(D, B, prenom) {
  const id = `compte-rendu-${D.code.slice(4).replace('.', '')}`;
  const salut = { id: 'salutation', choix: ['Madame, Monsieur,', 'Salut,', 'Coucou la qualité,'], juste: 0 };
  const fin = { id: 'fin', choix: [`Cordialement, ${prenom}, service traçabilité, plateforme régionale Ouest`, 'Bisous', 'À plus !'], juste: 0 };
  const nonVises = B.lots.filter((l) => !l.vise).map((l) => l.lot);
  const intacts = MAGASINS.map((m) => m.id).filter((x) => !B.magasins.includes(x));
  const mags = (ids) => (ids.length ? `Magasins livrés avec ces lots : ${nomsMagasins(ids)}. Il faut retirer ces boîtes de leurs rayons.` : 'Aucun magasin n’a été livré avec ces lots.');
  if (D.collegue) {
    const T = travailDeTheo(D);
    const voisin = nonVises.find((l) => l < T.oublie) || nonVises[0];
    return { id, melanger: true, lignes: [salut,
      { id: 'lot', choix: [`Le relevé du ${D.traite} a oublié le lot ${T.oublie}, fabriqué le ${fdateIso(dateDuLot(T.oublie))} : il est visé par l’avis.`,
        `Le relevé du ${D.traite} a oublié le lot ${voisin}, fabriqué le ${fdateIso(dateDuLot(voisin))} : il est visé par l’avis.`,
        `Le relevé du ${D.traite} était complet : aucun lot n’a été oublié.`], juste: 0 },
      { id: 'bloque', choix: [`Nous avons bloqué les ${T.resteOublie} boîtes qui restaient de ce lot.`,
        `Nous avons bloqué les ${B.lots.find((l) => l.lot === T.oublie).recu} boîtes de ce lot.`,
        'Nous n’avons rien bloqué : ce lot est déjà parti en magasin.'], juste: 0 },
      { id: 'magasins', choix: [`Magasins livrés avec ce lot et pas encore prévenus : ${nomsMagasins(T.magasinsOublies)}. Il faut retirer ces boîtes de leurs rayons.`,
        `Magasins livrés avec ce lot et pas encore prévenus : ${nomsMagasins(T.magasins)}. Il faut retirer ces boîtes de leurs rayons.`,
        'Aucun magasin n’a reçu ce lot.'], juste: 0 },
      urgent(D, B), fin] };
  }
  const L = B.vises;
  const plus = nonVises.length ? [...L, nonVises[0]].sort() : L;
  const lignes = [salut,
    { id: 'lots', choix: [`Lots visés passés par notre plateforme : ${liste(L)}.`,
      `Lots visés passés par notre plateforme : ${liste(L.slice(0, -1))}.`,
      `Lots visés passés par notre plateforme : ${liste(plus)}.`,
      'Aucun lot visé n’est passé par notre plateforme.'], juste: 0 },
    { id: 'bloque', choix: [`Nous avons bloqué les ${B.restant} boîtes de ces lots qui restaient chez nous.`,
      `Nous avons bloqué les ${B.partis} boîtes de ces lots qui restaient chez nous.`,
      `Nous avons bloqué les ${B.partis + B.restant} boîtes de ces lots qui restaient chez nous.`,
      'Nous n’avons rien bloqué : tout est déjà parti en magasin.'], juste: 0 },
    { id: 'magasins', choix: [mags(B.magasins), mags(B.magasins.slice(0, -1)), mags([...B.magasins, intacts[0]].filter(Boolean)), mags([])], juste: 0 },
  ];
  if (D.urgent) lignes.push(urgent(D, B));
  lignes.push(fin);
  return { id, melanger: true, lignes };
}
function urgent(D, B) {
  const a = B.apres;
  const autre = B.magasins.find((x) => !a.includes(x));
  return { id: 'urgent', choix: [`Le magasin de ${nomsMagasins(a)} a été livré après l’avis : il faut le prévenir en premier, des boîtes peuvent être en rayon aujourd’hui.`,
    `Le magasin de ${nomsMagasins([autre])} a été livré après l’avis : il faut le prévenir en premier, des boîtes peuvent être en rayon aujourd’hui.`,
    'Aucun magasin n’a été livré après l’avis.'], juste: 0 };
}

// ─────────────────────────────────────────── la fabrique d'une séance
// D : le jeu de `lactalis-donnees.js` ; O : { id (meta.id), poids: { <jalon>: points }, consigne (texte du mail de Julien), poste (HTML du document
// « Ton poste »), questions (QUESTIONS du fichier de questions, ou rien) }. Rend tout ce que lit `seanceEntreprise` + OPTIONS.
export function seance(D, O) {
  D.receptions.forEach((r) => { REF_DE_LOT[r[3]] = r[2]; });
  if (D.avis.mode === 'liste') D.avis.lots.forEach(([l, ref]) => { REF_DE_LOT[l] = ref; });
  const B = bilan(D);
  const T = D.collegue ? travailDeTheo(D) : null;
  const suffixe = D.code.slice(4).replace('.', '');
  const FICHE_ID = `releve-${suffixe}`, VOLET_ID = `lx-${suffixe}`;
  const P = phrases(D, B, '{prenom}');
  const PHRASES_ID = P.id;

  const DOCUMENTS = [docPoste(D, O.poste), docAvis(D), docLireLot(), docReceptions(D), docExpeditions(D), ...(T ? [docReleve(D)] : []), docDroit()];
  const FICHE = {
    id: FICHE_ID, libelle: T ? 'Contrôle du relevé' : 'Relevé de traçabilité', titre: T ? `Contrôler le relevé de ${D.collegue}` : 'Relevé de traçabilité',
    sousTitre: T ? 'À gauche : l’avis, les registres et le relevé. Trouve ce qui manque.' : 'À gauche : l’avis et les deux registres. Remonte les lots, puis descends vers les magasins.',
    documents: ['avis', 'receptions', 'expeditions', ...(T ? ['releve'] : []), 'lire-lot'], largeurDocs: 1.4, defile: true,
    bouton: T ? 'Ouvrir le contrôle du relevé' : 'Ouvrir le relevé de traçabilité',
    blocs: T ? blocsControle(D) : blocsTracer(D),
    envoi: { bouton: 'Envoyer le relevé à Julien', a: 'Julien', suite: 'Bloque maintenant ce qui reste, dans « Blocage qualité », puis réponds au service qualité.' },
  };

  // Les mouvements : ce qui est entré, ce qui est sorti (et, en 14.3, ce que Théo a bloqué).
  function mouvements() {
    const M = [];
    D.receptions.forEach(([d, no, ref, lot, q]) => M.push({ sku: ref, type: 'Entrée : réception', delta: q, ref: no, lot, ts: tsDe(d, 7), by: 'Équipe réception' }));
    D.expeditions.forEach(([d, no, mag, ref, lot, q]) => M.push({ sku: ref, type: 'Sortie : préparation', delta: -q, ref: no, lot, ts: tsDe(d, 6), by: 'Équipe préparation' }));
    if (T) T.blocages.forEach((b) => M.push({ sku: b.ref, type: 'Blocage qualité', delta: -b.q, ref: `Avis du ${D.avis.date}`, lot: b.lot, ts: tsDe(D.traite, 15), by: D.collegue }));
    return M.sort((a, b) => a.ts - b.ts);
  }
  function heure(db, hhmm) {
    const [a, m, j] = D.jour.iso.split('-').map(Number);
    const [h, mn] = hhmm.split(':').map(Number);
    const ouvert = (db && db.volets && db.volets[VOLET_ID]) || 0;
    return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
  }
  const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '09:00'), from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
  const VOLET = {
    id: VOLET_ID,
    semer: (prenom, db) => ({
      mouvements: mouvements(),
      mails: [mail(prenom, JULIEN, T ? `Le relevé de ${D.collegue} à contrôler` : `Avis de rappel du ${D.avis.date} : à traiter maintenant`,
        `Bonjour ${prenom} !\n\n${O.consigne}\n\nJulien`,
        { db, heure: '08:30', extra: { pieces: ['poste', 'avis', 'receptions', 'expeditions', ...(T ? ['releve'] : []), 'lire-lot'], ouvreFiche: FICHE_ID } })],
    }),
    declencheurs: [
      { id: 'qualite', quand: apresFiche(FICHE_ID),
        semer: (prenom, db) => ({ mails: [mail(prenom, QUALITE, T ? `Avis du ${D.avis.date} : votre correction` : `Avis du ${D.avis.date} : votre compte rendu`,
          `Bonjour,\n\n${T ? `Julien nous dit qu’un lot a pu échapper au relevé du ${D.traite}.` : `Nous attendons le compte rendu de votre plateforme pour l’avis du ${D.avis.date}.`} `
            + 'Merci de nous dire, une fois le stock bloqué : les lots concernés, ce que vous avez bloqué, et les magasins à prévenir.\n\nLe service qualité',
          { db, heure: '09:30', extra: { phrases: phrases(D, B, prenom) } })] }) },
      { id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye,
        semer: (prenom, db) => ({ mails: [mail(prenom, JULIEN, 'Merci', `Merci ${prenom}. Je regarde ton relevé et ton compte rendu.\n\nJulien`, { db, heure: '10:00' })] }) },
    ],
  };

  // ── les jalons
  const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
  const W = O.poids;
  const G = T
    ? { releve: 'Le relevé contrôlé', blocage: 'Le lot oublié bloqué', compte: 'Le compte rendu' }
    : { amont: 'L’amont : les lots', aval: 'L’aval : les magasins', blocage: 'Le stock bloqué', compte: 'Le compte rendu' };
  const surFiche = (id, titre, groupe, juste) => ({ id, titre, groupe, poids: W[id], ecran: `fiche:${FICHE_ID}`,
    verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return juste(valeursDe(db, FICHE_ID)) ? ok : ko; } });
  const cases = (k, attendu) => (v) => Array.isArray(v[k]) && v[k].length > 0 && memes(v[k], attendu);
  const casesOuVide = (k, attendu) => (v) => Array.isArray(v[k]) && memes(v[k], attendu);
  const nombre = (k, attendu) => (v) => lireNombre(v[k]) === attendu;
  const rendu = (db) => phrasesJustes(db, PHRASES_ID).envoye;
  const collegue = T ? D.collegue : null;
  // Jugé quand le compte rendu est parti : il dit ce qui a été bloqué, et le blocage d'un lot ne passe pas « faux » pendant qu'on bloque le suivant.
  const jalonBloque = (lot, titre) => ({ id: `bloque-${lot}`, titre, groupe: G.blocage, poids: W.bloque,
    verifier(db) { if (!rendu(db)) return attente; return resteLot(db, lot) === 0 ? ok : ko; } });
  const rienDeTrop = { id: 'rien-de-trop', titre: 'Aucun lot non visé bloqué', groupe: G.blocage, poids: W['rien-de-trop'],
    verifier(db) {
      if (!rendu(db)) return attente;
      const L = blocagesEleve(db, collegue);
      if (!L.length) return ko;
      const permis = T ? [T.oublie] : B.vises;
      return L.every((m) => permis.includes(String(m.lot || '').toUpperCase())) ? ok : ko;
    } };
  const compte = (lignesCle) => ({ id: 'compte-rendu', titre: 'Le compte rendu au service qualité', groupe: G.compte, poids: W['compte-rendu'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignesCle.every((l) => r.justes.includes(l)) ? ok : ko; } });

  let ETAPES;
  if (T) {
    ETAPES = [
      surFiche('oublies', 'Le lot oublié trouvé', G.releve, cases('oublies', [T.oublie])),
      surFiche('pourquoi', 'La cause de l’oubli', G.releve, (v) => v.pourquoi === 'borne'),
      surFiche('magasins', 'Les magasins pas encore prévenus', G.releve, cases('magasins', T.magasinsOublies)),
      surFiche('apres', 'Le magasin livré après l’avis', G.releve, cases('apres', B.apres)),
      surFiche('reste', 'Ce qui reste du lot oublié', G.releve, nombre('reste', T.resteOublie)),
      jalonBloque(T.oublie, `Le lot oublié bloqué : ${T.oublie}`),
      rienDeTrop,
      compte(['lot', 'bloque', 'magasins', 'urgent']),
    ];
  } else {
    ETAPES = [
      surFiche('lots', 'Les lots visés passés chez nous', G.amont, cases('lots', B.vises)),
      surFiche('magasins', 'Les magasins livrés avec un lot visé', G.aval, cases('magasins', B.magasins)),
      ...(D.urgent ? [surFiche('apres', 'Le magasin livré après l’avis', G.aval, casesOuVide('apres', B.apres))] : []),
      surFiche('partis', 'Les boîtes parties en magasin', G.aval, nombre('partis', B.partis)),
      surFiche('restant', 'Les boîtes encore chez nous', G.blocage, nombre('restant', B.restant)),
      ...B.aBloquer.map((x) => jalonBloque(x.lot, `Stock bloqué : lot ${x.lot}`)),
      rienDeTrop,
      compte(D.urgent ? ['lots', 'bloque', 'magasins', 'urgent'] : ['lots', 'bloque', 'magasins']),
    ];
  }
  const manque = ETAPES.filter((e) => typeof e.poids !== 'number');
  if (manque.length) throw new Error(`${D.code} : jalon sans poids (${manque.map((e) => e.id).join(', ')})`);

  const releveFait = (db) => envoyee(db, FICHE_ID);
  const bloqueFait = (db) => blocagesEleve(db, collegue).length > 0;
  const PASTILLES = [
    { libelle: T ? 'Le contrôle' : 'Le relevé', fait: releveFait },
    { libelle: 'Le blocage', fait: bloqueFait },
    { libelle: 'Le compte rendu', fait: rendu },
  ];
  const SUITE = [
    { vue: 'fiche', libelle: T ? 'Le contrôle du relevé' : 'Le relevé de traçabilité', fait: releveFait },
    { vue: 'blocage', libelle: 'Le blocage qualité', fait: (db) => bloqueFait(db) || rendu(db) },
    { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu au service qualité', fait: rendu },
  ];
  const ACCUEIL = {
    titre: T ? 'Contrôler un relevé de traçabilité' : 'Tracer les lots d’un avis de rappel',
    kpis: ['mail'],
    etapes: [
      ['Lire le message de Julien', 'Menu Messagerie. Les documents sont joints : l’avis, les registres, le numéro de lot.'],
      T ? ['① Le contrôle', `Compare chaque lot reçu à la règle de l’avis, puis au relevé de ${D.collegue} : trouve ce qui manque et chez qui ce lot est parti.`]
        : ['① Le relevé', 'L’amont : les lots visés dans le registre des réceptions. L’aval : les magasins dans le registre des expéditions. Puis ce qui reste chez nous.'],
      ['② Le blocage', 'Menu Blocage qualité : lot par lot, la référence et la quantité qui reste. Le blocage ne touche que le lot visé.'],
      ['③ Le compte rendu', 'Réponds au service qualité, une phrase par ligne.'],
      ['Bon à savoir', MENTION],
    ],
  };
  const OPTIONS = {
    menu: ['blocage'],
    exercice: ACCUEIL.titre,
    sansTrame: 'Tout se fait à l’écran',
    documents: DOCUMENTS,
    documentsStyle: STYLE,
    fiches: [FICHE],
    pastilles: PASTILLES,
    suite: SUITE,
    equipe: EQUIPE,
    ...(O.questions ? { questions: O.questions } : {}),
  };
  return { ID: O.id, FICHE_ID, PHRASES_ID, VOLET_ID, B, T, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS };
}

// ─────────────────────────────────────────── la banque « Avant de commencer » (commune aux quatre séances)
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'julien', doc, rubrique, enonce, choix, juste, retour });
export const BANQUE = [
  q('tracabilite', 'preparation', 'poste', 'La traçabilité, c’est pouvoir…',
    [{ v: 'suivre', lib: 'retrouver d’où vient un produit et où il est parti' }, { v: 'ranger', lib: 'ranger un produit au bon emplacement' }, { v: 'compter', lib: 'compter le stock une fois par an' }], 'suivre',
    'Remonter vers le fabricant (l’amont) et descendre vers les clients (l’aval) : c’est ce qui permet de retirer un lot sans tout jeter.'),
  q('aval', 'preparation', 'expeditions', 'Pour savoir dans quels magasins un lot est parti, tu lis…',
    [{ v: 'exp', lib: 'le registre des expéditions' }, { v: 'rec', lib: 'le registre des réceptions' }, { v: 'cat', lib: 'le catalogue des produits' }], 'exp',
    'Les expéditions disent ce qui est sorti et vers quel magasin : c’est l’aval. Les réceptions disent ce qui est entré : c’est l’amont.'),
  q('lot', 'preparation', 'lire-lot', 'Un numéro de lot sert à…',
    [{ v: 'groupe', lib: 'retrouver toutes les boîtes fabriquées ensemble' }, { v: 'prix', lib: 'donner le prix de la boîte' }, { v: 'place', lib: 'dire où ranger la boîte' }], 'groupe',
    'Si un lot pose problème, on retire tout ce lot et seulement lui : les autres lots de la même référence restent vendables.'),
  q('date-lot', 'preparation', 'lire-lot', 'Le lot CR-170908-C a été fabriqué le…',
    [{ v: 'juste', lib: '08/09/2017' }, { v: 'inverse', lib: '17/09/2008' }, { v: 'mois', lib: '09/08/2017' }], 'juste',
    'Année, mois, jour : 17 = 2017, 09 = septembre, 08 = le 8. Fabriqué le 08/09/2017, par l’équipe C.'),
  q('retrait', 'droit', 'droit', 'Enlever un produit des rayons avant qu’un client l’achète, c’est…',
    [{ v: 'retrait', lib: 'un retrait' }, { v: 'rappel', lib: 'un rappel' }, { v: 'inventaire', lib: 'un inventaire' }], 'retrait',
    'Le retrait arrête la vente ; le rappel s’adresse aux clients qui ont déjà acheté le produit.'),
  q('distributeur', 'droit', 'droit', 'La plateforme n’a pas fabriqué ce lait. D’après l’article 19, doit-elle le retirer ?',
    [{ v: 'oui', lib: 'Oui : elle le distribue, elle doit engager le retrait et prévenir' }, { v: 'non', lib: 'Non : c’est au fabricant seul de le faire' }, { v: 'attendre', lib: 'Seulement si un client se plaint' }], 'oui',
    'L’article vise tout exploitant qui a importé, produit, transformé, fabriqué ou distribué le produit : la plateforme distribue, elle est concernée.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'julien', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Un avis de rappel est arrivé. Avant de t’y mettre, regarde les documents à gauche et réponds à mes questions.',
  documents: ['poste', 'lire-lot', 'expeditions', 'droit'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
export const PERSONNES = { julien: EQUIPE.julien, qualite: EQUIPE.qualite };
export { REGLE_21_DECEMBRE };
