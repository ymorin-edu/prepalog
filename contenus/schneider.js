// Schneider Electric — le centre de distribution d'Évreux (Eure) : l'UNIVERS commun des séances ENT-22.1 à 22.10 (CAP OL, entreprise n° 22,
// 4e entreprise de la progression CAP du 18/10/2026 : le positionnement EP1 sur la réception) et les DOCUMENTS et blocs de fiche qu'elles partagent.
// Cadrage : `docs/briefs/schneider/CADRAGE-schneider-cap.md` ; données : `contenus/schneider-donnees.js` ; fabrique : `contenus/fabrique-fiches.js`.
//
// L'élève est stagiaire en PFMP à la réception : accueillir les camions, contrôler les livraisons, ranger les palettes, suivre l'inventaire. Nadia
// (cheffe d'équipe de la réception, sa tutrice), Julien (cariste) et Mehdi (agent de quai) sont CONSTRUITS, prénoms seuls ; aucune parole n'est
// prêtée à un salarié réel. Tutoiement. Aucune vue nouvelle : documents joints, fiches courtes (une consigne par écran), carte « Localiser » en
// 22.1, réponse par phrases.

import { catalogueSimple } from './entreprise-commun.js';
import { FRANCE } from './france-contours.js';
import {
  PRODUITS, KG_AIDE, QUAIS, PRECONTROLE, precontroleJuste, aAider, STATUTS, statut, manque, abimes, DECISIONS, decision, reserves,
  PLAQUE, PARTIES, partiesDe, jugerRangement, adressesJustes, RELEVE, releveJuste, ECARTS, ecartJuste, nombreFr, nomDe, plaqueJuste, PLAQUE_CHOIX,
} from './schneider-donnees.js';
import { memes, proche } from './fabrique-fiches.js';

// ─────────────────────────────────────────── l'univers
export const LOGO = './contenus/trames/logos/schneider-electric.svg';
export const ENTREPRISE = {
  id: 'schneider',
  nom: 'Schneider Electric',
  sousTitre: 'Centre de distribution d’Évreux (Eure) — la réception',
  exercice: 'À la réception',
  logo: LOGO,
};
export const VOCAB = { unit: 'colis', unitPl: 'colis', sizeLabel: '', sizeShort: '', configWord: '', icone: 'palette', mailDomain: 'schneider.example' };
// Charte de se.com (relevé du 27/10/2026, page d'accueil et feuilles de style) : le vert « Life Is On » #3dcd58 (`--se-primary`, boutons), le
// logotype en #009530. Texte foncé posé sur le vert (contraste 9:1). Charte VERTE : le moteur la garde au bandeau et au menu, jamais dans la zone
// où l'élève travaille (décision de Tristan du 05/10/2026).
export const THEME = { accent: '#3dcd58', surAccent: '#1d1d1b', papier: true };
export const CATALOGUE = catalogueSimple(Object.values(PRODUITS).map((x) => ({ ref: x.id.toUpperCase(), designation: x.nom, marque: 'Produit construit',
  categorie: 'Matériel électrique', fournisseur: 'F-SE', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-SE', brand: 'Schneider Electric', name: 'Usines et fournisseurs (construits)', adr: '', cp: '', ville: 'Évreux', contact: '', tel: '',
  email: 'reception@schneider.example', delai: 1, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Schneider Electric et son centre de distribution d’Évreux : 43 000 m² en six cellules, environ 350 salariés et '
  + '40 000 références (2019), 12 000 à 21 000 lignes de commande par jour, des livraisons vers 120 pays, un drone d’inventaire et des exosquelettes '
  + 'pour les cartons de plus de 25 kg ; en 2025, premier centre « circulaire » du groupe. Construits : les camions, les quais, les scellés, '
  + 'les bons de livraison, les comptages, les adresses, la plaque de charge, les palettes, les produits et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  nadia: { nom: 'Nadia', role: 'cheffe d’équipe de la réception (ta tutrice)', appel: 'Nadia', registre: 'tu',
    metier: 'Cheffe d’équipe réception', phrase: 'J’organise la réception : le planigramme, les quais, l’équipe. Je suis ta tutrice. Un problème au quai ? Tu m’appelles.' },
  mehdi: { nom: 'Mehdi', role: 'agent de quai', appel: 'Mehdi', registre: 'tu',
    metier: 'Agent de quai', phrase: 'J’accueille les chauffeurs, je fais le pré-contrôle, je décharge et je contrôle les livraisons.' },
  julien: { nom: 'Julien', role: 'cariste', appel: 'Julien', registre: 'tu',
    metier: 'Cariste', phrase: 'Je range les palettes dans les cellules, à l’adresse que donne le terminal, et je recompte quand le drone n’est pas d’accord.' },
};
export const MAIL_NADIA = 'nadia@schneider.example';
export const TUTEUR = { nom: 'Nadia, cheffe d’équipe réception', mail: MAIL_NADIA, appel: 'Nadia' };
export const PERSONNES = { nadia: EQUIPE.nadia, mehdi: EQUIPE.mehdi, julien: EQUIPE.julien };

// ─────────────────────────────────────────── aides
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = 'Document pédagogique — reconstitution, non contractuel.';
const pied = (t = PIED) => `<p class="se-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
const kg = (x) => `${n(x)} kg`;
const m = (x) => `${n(x)} m`;
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="se-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="se-doc" aria-label="${ech(titre)}">${corps}</article>` });
const entete = (t, st) => `<div class="se-entete"><img class="se-logo" src="${LOGO}" alt="Schneider Electric"><div><p class="se-t">${ech(t)}</p>${st ? `<p class="se-st">${ech(st)}</p>` : ''}</div></div>`;

export const STYLE = `
--douce:#555047;
.se-doc{padding:14px 18px 0}
.se-doc p{margin:0 0 8px}
.se-entete{display:flex; gap:12px; align-items:center; border-bottom:2px solid #1d1d1b; padding-bottom:6px; margin-bottom:10px}
.se-logo{height:28px; width:auto}
.se-t{margin:0; font-size:1.06rem; font-weight:800}
.se-st{margin:2px 0 0; font-size:.84rem; color:var(--douce)}
.se-ul{margin:4px 0 8px; padding-left:20px; font-size:.93rem}
.se-ul li{margin:4px 0}
.se-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.se-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.se-table th, .se-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left; vertical-align:top}
.se-table th{color:var(--douce); font-weight:600}
.se-table .se-d{text-align:right; white-space:nowrap}
.se-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.se-moi{font-weight:800}
.se-carte{border:2px solid #1d1d1b; border-radius:6px; padding:8px 12px; margin:6px 0 10px; font-size:.92rem}
.se-loi{margin:4px 0 8px; padding:4px 10px; border-left:3px solid #555047}
.se-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents communs
export const DOC_SITE = doc('site', 'Le centre d’Évreux', 'Le centre d’Évreux', `${entete('Le centre de distribution d’Évreux', 'Eure (27), en Normandie')}
  <p>Schneider Electric fabrique du <b>matériel électrique</b> : disjoncteurs, prises, tableaux électriques, bornes de recharge, variateurs…
    Le centre d’<b>Évreux</b> reçoit ces produits des usines du groupe, les range, prépare les commandes des distributeurs et les expédie.</p>
  <ul class="se-ul">
    <li><b>43 000 m²</b>, en <b>six cellules</b> de 6 000 m². Bâti en 2014.</li>
    <li>Environ <b>350 salariés</b> et <b>40 000 références</b> de produits (2019).</li>
    <li>De <b>12 000 à 21 000 lignes de commande</b> par jour, <b>24 heures sur 24</b>, cinq jours sur sept. Les produits partent vers <b>120 pays</b>.</li>
    <li>Des outils numériques : un <b>drone d’inventaire</b> qui compte les colis dans les rayonnages, des chariots automatisés, et des
      <b>exosquelettes</b> pour porter les cartons de plus de 25 kg.</li>
    <li>En 2025, le Forum économique mondial l’a reconnu comme le <b>premier centre de distribution « circulaire »</b> du groupe : moins d’énergie,
      moins de plastique, des produits repris chez les clients.</li>
  </ul>
  <p>L’usine du <b>Vaudreuil</b>, dans l’Eure aussi, fabrique des <b>contacteurs</b>. Le <b>siège social</b> du groupe est à <b>Rueil-Malmaison</b>
    (Hauts-de-Seine).</p>
  ${pied('Document pédagogique. Sources : Voxlog et CCI Normandie (06/11/2019) ; Schneider Electric et The Manufacturer (16/09/2025) ; FrenchWeb (06/03/2019) pour Le Vaudreuil ; se.com (siège).')}`);

export const DOC_EQUIPE = doc('equipe', 'L’équipe de la réception', 'L’équipe', `${entete('L’équipe de la réception', 'Prénoms imaginés pour l’exercice')}
  <table class="se-table"><thead><tr><th scope="col">Qui</th><th scope="col">Ce qu’il ou elle fait</th></tr></thead><tbody>
    ${Object.values(EQUIPE).map((x) => `<tr><td><b>${ech(x.nom)}</b><br><span class="se-st">${ech(x.metier)}</span></td><td>${ech(x.phrase)}</td></tr>`).join('')}
    <tr><td><b>Toi</b><br><span class="se-st">Stagiaire</span></td><td>Tu aides au quai : tu lis le planigramme, tu fais le pré-contrôle et le contrôle avec Mehdi, puis tu suis le rangement avec Julien.</td></tr>
  </tbody></table>
  ${pied('Équipe et prénoms CONSTRUITS pour l’exercice. Document pédagogique.')}`);

export const DOC_PROTOCOLE = doc('protocole', 'Au quai : le protocole', 'Le protocole', `${entete('Accueillir un camion au quai', 'Le protocole de sécurité du centre')}
  <ol class="se-ul">
    <li>Le camion se met à quai, au quai écrit sur le <b>planigramme</b>. Le chauffeur <b>coupe le moteur</b>.</li>
    <li>Le chauffeur te <b>remet ses clés</b> : le camion ne peut pas partir pendant le déchargement.</li>
    <li>Tu compares le <b>numéro du scellé</b> (le plomb des portes) avec l’<b>avis d’expédition</b>. Pas le même numéro, ou pas de scellé :
      tu <b>n’ouvres pas</b>, tu appelles Nadia. Un camion qui n’est pas sur le planigramme : tu appelles Nadia aussi.</li>
    <li>Tu coupes le scellé et tu ouvres les portes.</li>
    <li><b>Pré-contrôle</b> : tu comptes les palettes et tu regardes leur état. Une palette en moins, en plus, ou abîmée : tu décharges quand même,
      et tu notes le problème pour les <b>réserves</b>.</li>
    <li>Tu décharges, palette par palette. Le chauffeur attend en <b>salle des chauffeurs</b> : il ne décharge pas, il ne monte pas sur le quai.</li>
  </ol>
  <div class="se-regle"><b>Porter à la main</b> : un colis de plus de ${KG_AIDE} kg se porte avec un <b>exosquelette</b> ou <b>à deux</b>.
    Jambes pliées, dos droit, colis près du corps.</div>
  <div class="se-loi"><p><b>Ce que dit la loi</b> (Code du travail, articles R4515-4 à R4515-11) : un chargement ou un déchargement fait par une
    entreprise extérieure suit un <b>protocole de sécurité</b> écrit, échangé entre le transporteur et l’entreprise d’accueil.</p></div>
  ${pied('Protocole CONSTRUIT pour l’exercice (le protocole de sécurité écrit est une obligation réelle). Résumé de la loi, pas une citation. Document pédagogique.')}`);

export const DOC_CONTROLE = doc('controle', 'Contrôler la livraison', 'Le contrôle', `${entete('Contrôler une livraison', 'Après le déchargement')}
  <ol class="se-ul">
    <li>Pour chaque ligne du <b>bon de livraison</b>, tu compares le nombre de colis écrit avec le nombre de colis <b>comptés</b>.</li>
    <li>Tu regardes l’<b>état</b> de chaque colis : écrasé, éventré, mouillé, percé…</li>
    <li>Chaque ligne est <b>conforme</b>, ou bien il en <b>manque</b>, il y en a <b>trop</b>, ou un colis est <b>abîmé</b>.</li>
  </ol>
  <div class="se-regle"><b>Les réserves</b> : un seul problème, et tu acceptes la livraison <b>avec des réserves</b> écrites sur la lettre de
    voiture, <b>avant</b> que le chauffeur signe et parte. Une réserve dit <b>combien</b>, <b>quoi</b> et <b>quel problème</b> : « 2 colis manquants
    (interrupteurs différentiels) ». « Sous réserve de déballage » ne dit rien : <b>elle ne vaut rien</b>.</div>
  <div class="se-loi"><p><b>Ce que dit la loi</b> (Code de commerce, article L133-3) : après la réception, le destinataire a <b>trois jours</b>
    (hors jours fériés) pour confirmer ses réserves au transporteur par une lettre recommandée ou un acte d’huissier. Sans réserve précise,
    il ne peut plus rien réclamer.</p></div>
  ${pied('Règles du poste CONSTRUITES pour l’exercice ; résumé de la loi, pas une citation. Document pédagogique.')}`);

export const DOC_RANGER = doc('ranger', 'Ranger une palette', 'Ranger', `${entete('Ranger une palette dans la cellule', 'Le palettier et sa plaque de charge')}
  <p>Une <b>adresse</b> se lit en quatre parties : <span class="se-mono">C3-12-07-2</span> = cellule <b>C3</b>, allée <b>12</b>, colonne <b>07</b>,
    niveau <b>2</b>. Le niveau <b>0</b> est au sol.</p>
  <table class="se-table"><caption class="se-st" style="text-align:left">La plaque de charge du palettier</caption>
    <thead><tr><th scope="col">Niveaux</th><th class="se-d" scope="col">Charge maximale par emplacement</th><th class="se-d" scope="col">Hauteur maximale de la palette</th></tr></thead><tbody>
    ${PLAQUE.map((x) => `<tr><td>${x.niveaux.join(' et ')}</td><td class="se-d">${kg(x.kg)}</td><td class="se-d">${m(x.h)}</td></tr>`).join('')}
  </tbody></table>
  <ol class="se-ul">
    <li>L’emplacement est <b>libre</b>.</li>
    <li>La palette ne pèse <b>pas plus</b> que la charge maximale du niveau.</li>
    <li>La palette n’est <b>pas plus haute</b> que la hauteur maximale du niveau.</li>
  </ol>
  <div class="se-regle"><b>Les gestes</b> : je scanne l’étiquette de la palette ; le terminal me donne une adresse ; je pose la palette ; je scanne
    l’étiquette de l’emplacement pour confirmer. Le système <b>enregistre</b> alors l’adresse : il sait où est la palette. Une adresse qui ne
    respecte pas la plaque de charge : <b>je ne monte pas</b>, je le signale.</div>
  ${pied('Adresses, plaque de charge et règles CONSTRUITES pour l’exercice. Document pédagogique.')}`);

// ─────────────────────────────────────────── les documents qui dépendent du jeu
const valeur = (x, db) => (typeof x === 'function' ? x(db) : x);
export function htmlPlanigramme(plan, mon) {
  return `<table class="se-table"><thead><tr><th scope="col">Camion</th><th scope="col">D’où il vient</th><th scope="col">Heure</th><th scope="col">Quai</th>
    <th class="se-d" scope="col">Palettes</th><th scope="col">Avis d’expédition</th><th scope="col">Scellé annoncé</th></tr></thead><tbody>
    ${plan.map((c) => `<tr${c.id === mon ? ' class="se-moi"' : ''}><td>${c.id}${c.id === mon ? ' (le tien)' : ''}</td><td>${ech(c.de)}</td><td>${c.heure}</td><td>${c.quai}</td>
      <td class="se-d">${c.palettes}</td><td class="se-mono">${c.avis}</td><td class="se-mono">${c.scelle}</td></tr>`).join('')}
  </tbody></table>`;
}
export const docPlanigramme = (get, titre = 'Le planigramme du jour') => doc('planigramme', titre, 'Le planigramme', (db) => { const J = valeur(get, db);
  return `${entete(titre, 'Les camions attendus à la réception')}${htmlPlanigramme(J.plan, J.mon)}${pied('Camions, heures, quais et scellés CONSTRUITS pour l’exercice. Document pédagogique.')}`; });
export function htmlPrecontrole(sits) {
  return sits.map((S, i) => `<div class="se-carte"><b>Situation ${i + 1}</b> — ${ech(S.camion)}
    <table class="se-table"><thead><tr><th scope="col"></th><th scope="col">L’avis d’expédition dit</th><th scope="col">Au quai, tu vois</th></tr></thead><tbody>
      <tr><th scope="row">Sur le planigramme</th><td>${S.avis.planifie ? 'oui' : 'non'}</td><td>—</td></tr>
      <tr><th scope="row">Scellé</th><td class="se-mono">${S.avis.scelle}</td><td class="se-mono">${S.vu.scelle}</td></tr>
      <tr><th scope="row">Palettes</th><td>${S.avis.planifie ? S.avis.palettes : '—'}</td><td>${S.vu.palettes}</td></tr>
      <tr><th scope="row">État</th><td>—</td><td>${ech(S.vu.etat)}</td></tr>
    </tbody></table></div>`).join('');
}
export const docPrecontrole = (get) => doc('precontrole', 'Le pré-contrôle', 'Le pré-contrôle', (db) => `${entete('Au quai, avant d’ouvrir', 'Ce que dit l’avis, ce que tu vois')}
  ${htmlPrecontrole(valeur(get, db))}${pied('Situations CONSTRUITES pour l’exercice. Document pédagogique.')}`);
export const docColis = (get) => doc('colis', 'Les colis à porter', 'Les colis', (db) => `${entete('Les colis à porter à la main', 'Au déchargement')}
  <table class="se-table"><thead><tr><th scope="col">Colis</th><th class="se-d" scope="col">Poids</th></tr></thead><tbody>
    ${valeur(get, db).map((id) => `<tr><td>${ech(nomDe(id))}</td><td class="se-d">${kg(PRODUITS[id].kg)}</td></tr>`).join('')}
  </tbody></table>${pied('Poids CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export function htmlBL(bl) {
  return `<p class="se-st">Bon de livraison <b class="se-mono">${ech(bl.no)}</b> — expéditeur : ${ech(bl.de)}</p>
    <table class="se-table"><thead><tr><th scope="col">Ligne</th><th scope="col">Produit</th><th class="se-d" scope="col">Colis sur le bon</th>
      <th class="se-d" scope="col">Colis comptés</th><th scope="col">État</th></tr></thead><tbody>
    ${bl.lignes.map((L) => `<tr><td>${L.id}</td><td>${ech(nomDe(L.prod))}</td><td class="se-d">${L.bl}</td><td class="se-d">${L.compte}</td>
      <td>${L.abimes ? `<b>${L.abimes} ${ech(L.defaut)}</b>` : 'bon état'}</td></tr>`).join('')}
    </tbody></table>`;
}
export const docBL = (get) => doc('bl', 'Le bon de livraison et le comptage', 'Le bon de livraison', (db) => `${entete('Le bon de livraison et le comptage', 'Ce qui est écrit, ce qui est compté')}
  ${htmlBL(valeur(get, db))}${pied('Bon de livraison et comptage CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export function htmlEmplacements(R) {
  return `<table class="se-table"><thead><tr><th scope="col">Adresse</th><th scope="col">Niveau</th><th scope="col">État</th></tr></thead><tbody>
    ${[...R.libres.map((a) => [a, 'libre']), ...R.occupes.map((a) => [a, 'occupé'])].sort().map(([a, e]) => `<tr><td class="se-mono">${a}</td><td>${partiesDe(a).niveau}</td><td>${e}</td></tr>`).join('')}
    </tbody></table>
    <table class="se-table"><caption class="se-st" style="text-align:left">Les palettes à ranger</caption>
    <thead><tr><th scope="col">Palette</th><th scope="col">Produit</th><th class="se-d" scope="col">Poids</th><th class="se-d" scope="col">Hauteur</th></tr></thead><tbody>
    ${R.palettes.map((p) => `<tr><td>${p.id}</td><td>${ech(nomDe(p.prod))}</td><td class="se-d">${kg(p.kg)}</td><td class="se-d">${m(p.h)}</td></tr>`).join('')}
    </tbody></table>`;
}
export const docEmplacements = (get) => doc('emplacements', 'Les emplacements et les palettes', 'Les emplacements', (db) => `${entete('L’allée à ranger', 'Les emplacements, les palettes')}
  ${htmlEmplacements(valeur(get, db))}${pied('Adresses et palettes CONSTRUITES pour l’exercice. Document pédagogique.')}`);
export function htmlDrone(L, avecMain) {
  return `<table class="se-table"><thead><tr><th scope="col">Adresse</th><th scope="col">Produit</th><th class="se-d" scope="col">Le système dit</th>
    <th class="se-d" scope="col">Le drone a compté</th>${avecMain ? '<th class="se-d" scope="col">Julien a recompté</th>' : ''}</tr></thead><tbody>
    ${L.map((I) => `<tr><td class="se-mono">${I.adr}</td><td>${ech(nomDe(I.prod))}</td><td class="se-d">${I.systeme}</td><td class="se-d">${I.drone}</td>${avecMain ? `<td class="se-d">${I.main}</td>` : ''}</tr>`).join('')}
    </tbody></table>`;
}
export const docDrone = (get) => doc('drone', 'Le passage du drone', 'Le drone', (db) => `${entete('Le passage du drone d’inventaire', 'Colis comptés à chaque adresse')}
  ${htmlDrone(valeur(get, db), false)}${pied('Comptages CONSTRUITS pour l’exercice (le drone d’inventaire d’Évreux est réel). Document pédagogique.')}`);
export const docRecompte = (get) => doc('recompte', 'Le recomptage de Julien', 'Le recomptage', (db) => `${entete('Le recomptage à la main', 'Julien a recompté toutes les adresses')}
  ${htmlDrone(valeur(get, db), true)}${pied('Comptages CONSTRUITS pour l’exercice. Document pédagogique.')}`);

// ─────────────────────────────────────────── les blocs de fiche partagés et leurs jalons
const CHOIX_QUAIS = QUAIS.map((q) => ({ v: q, lib: q }));
// Le planigramme : le quai et le nombre de palettes de « ton » camion.
export const blocsQuai = (J) => [
  { type: 'liste', id: 'quai', lib: 'À quel quai se met ton camion ?', vide: 'Choisir…', manque: 'le quai', choix: CHOIX_QUAIS },
  { type: 'nombre', id: 'palettes', lib: 'Combien de palettes sont annoncées ?', unite: 'palettes', min: 0, entier: true, manque: 'le nombre de palettes' },
];
export const jalonsQuai = (get, { quai: pq, palettes: pp, groupe }) => {
  const mien = (db) => { const J = get(db); return J.plan.find((c) => c.id === J.mon); };
  return [
    { id: 'quai', titre: 'Le planigramme : le quai', groupe, poids: pq, attendu: (db) => mien(db).quai, juste: (v, db) => v.quai === mien(db).quai },
    { id: 'palettes', titre: 'Le planigramme : les palettes annoncées', groupe, poids: pp, attendu: (db) => `${mien(db).palettes}`, juste: (v, db) => proche(v.palettes, mien(db).palettes) },
  ];
};
// Le pré-contrôle : une décision par situation.
export const blocsPrecontrole = (sits) => sits.map((S, i) => ({ type: 'choix', id: `sit-${i + 1}`, lib: `Situation ${i + 1}`, colonne: true, manque: `la situation ${i + 1}`, choix: PRECONTROLE }));
export const jalonsPrecontrole = (get, { poids, groupe }) => get(null).map((_, i) => ({ id: `sit-${i + 1}`, titre: `Le pré-contrôle : la situation n° ${i + 1}`, groupe, poids,
  attendu: (db) => PRECONTROLE.find((x) => x.v === precontroleJuste(get(db)[i])).lib, juste: (v, db) => v[`sit-${i + 1}`] === precontroleJuste(get(db)[i]) }));
// Les colis à porter avec une aide.
export const blocLourds = (ids) => ({ type: 'cases', id: 'lourds', titre: `Les colis à porter avec un exosquelette ou à deux`, choix: ids.map((id) => ({ v: id, lib: `${nomDe(id)} (${kg(PRODUITS[id].kg)})` })) });
export const jalonLourds = (get, { poids, groupe }) => ({ id: 'lourds', titre: 'Les colis de plus de 25 kg', groupe, poids,
  attendu: (db) => aAider(get(db)).map(nomDe).join(' ; '), juste: (v, db) => memes(v.lourds || [], aAider(get(db))) });
// Le contrôle : le statut de chaque ligne, les quantités, la décision, la réserve.
export const blocsLignes = (bl) => bl.lignes.map((L) => ({ type: 'liste', id: `ligne-${L.id}`, lib: `${L.id} : ${nomDe(L.prod)}`, vide: 'Choisir…', manque: `la ligne ${L.id}`, choix: STATUTS }));
export const jalonsLignes = (get, { poids, groupe }) => get(null).lignes.map((L0, i) => ({ id: `ligne-${i + 1}`, titre: `Le contrôle : la ligne ${L0.id}`, groupe, poids,
  attendu: (db) => STATUTS.find((x) => x.v === statut(get(db).lignes[i])).lib, juste: (v, db) => { const L = get(db).lignes[i]; return v[`ligne-${L.id}`] === statut(L); } }));
export const blocsQuantites = () => [
  { type: 'nombre', id: 'manque', lib: 'Combien de colis manquent en tout ?', unite: 'colis', min: 0, entier: true, manque: 'les colis manquants' },
  { type: 'nombre', id: 'abimes', lib: 'Combien de colis sont abîmés en tout ?', unite: 'colis', min: 0, entier: true, manque: 'les colis abîmés' },
];
export const jalonsQuantites = (get, { manque: pm, abimes: pa, groupe }) => [
  { id: 'manque', titre: 'Le contrôle : les colis manquants', groupe, poids: pm, attendu: (db) => `${manque(get(db).lignes)}`, juste: (v, db) => proche(v.manque, manque(get(db).lignes)) },
  { id: 'abimes', titre: 'Le contrôle : les colis abîmés', groupe, poids: pa, attendu: (db) => `${abimes(get(db).lignes)}`, juste: (v, db) => proche(v.abimes, abimes(get(db).lignes)) },
];
export const blocsReserve = (bl) => [
  { type: 'choix', id: 'decision', lib: 'Que fais-tu de la livraison ?', colonne: true, manque: 'ta décision', choix: DECISIONS },
  { type: 'liste', id: 'reserve', lib: 'Ce que tu écris sur la lettre de voiture', vide: 'Choisir…', manque: 'la réserve', choix: reserves(bl.lignes) },
];
export const jalonsReserve = (get, { decision: pd, reserve: pr, groupe }) => [
  { id: 'decision', titre: 'La décision', groupe, poids: pd, attendu: (db) => DECISIONS.find((x) => x.v === decision(get(db).lignes)).lib,
    juste: (v, db) => v.decision === decision(get(db).lignes) },
  { id: 'reserve', titre: 'La réserve écrite', groupe, poids: pr, attendu: (db) => reserves(get(db).lignes).find((x) => x.v === 'juste').lib, juste: (v) => v.reserve === 'juste' },
];
// Le rangement : une adresse par palette (les palettes posées avant comptent).
const CHOIX_ADR = (R) => [...R.libres, ...R.occupes].sort().map((a) => ({ v: a, lib: a }));
export const blocsRangement = (R) => R.palettes.map((p, i) => ({ type: 'liste', id: `adr-${i + 1}`, lib: `${p.id} : ${nomDe(p.prod)} (${kg(p.kg)}, ${m(p.h)})`, vide: 'Choisir…',
  manque: `l’adresse de la palette ${p.id}`, choix: CHOIX_ADR(R) }));
const pourquoi = { adresse: 'emplacement occupé', deja: 'une autre palette y est déjà', poids: 'trop lourde pour ce niveau', hauteur: 'trop haute pour ce niveau' };
export function jalonsRangement(get, { poids, groupe }) {
  return get(null).palettes.map((p0, i) => ({ id: `adr-${i + 1}`, titre: `Ranger : la palette ${p0.id}`, groupe, poids,
    attendu: (db) => { const R = get(db); return `une adresse libre qui respecte la plaque de charge (pour cette palette seule : ${adressesJustes(R.libres, R.palettes[i]).join(', ')} ; les palettes rangées avant elle comptent aussi)`; },
    juste: (v, db) => { const R = get(db); return jugerRangement(R.libres, R.palettes, R.palettes.map((_, k) => v[`adr-${k + 1}`]))[i] === null; } }));
}
export const pourquoiFaux = (R, v) => jugerRangement(R.libres, R.palettes, R.palettes.map((_, k) => v[`adr-${k + 1}`])).map((x) => (x ? pourquoi[x] : null));
// Lire une adresse.
export const blocsAdresse = (adr) => ['cellule', 'allee', 'colonne', 'niveau'].map((k, i) => ({ type: 'liste', id: `part-${k}`, lib: `« ${partiesDe(adr)[k]} » dans ${adr}, c’est…`,
  vide: 'Choisir…', manque: `la partie ${i + 1}`, choix: PARTIES }));
export const jalonsAdresse = ({ poids, groupe }) => ['cellule', 'allee', 'colonne', 'niveau'].map((k) => ({ id: `part-${k}`, titre: `L’adresse : ${PARTIES.find((x) => x.v === k).lib}`,
  groupe, poids, attendu: PARTIES.find((x) => x.v === k).lib, juste: (v) => v[`part-${k}`] === k }));
// La plaque de charge.
export const blocPlaque = (S) => ({ type: 'choix', id: 'plaque', lib: `Le terminal te donne l’adresse ${S.adr} pour une palette de ${kg(S.kg)}. Que fais-tu ?`, colonne: true,
  manque: 'ce que tu fais', choix: PLAQUE_CHOIX });
export const jalonPlaque = (get, { poids, groupe }) => ({ id: 'plaque', titre: 'La plaque de charge', groupe, poids,
  attendu: (db) => PLAQUE_CHOIX.find((x) => x.v === plaqueJuste(get(db).kg, get(db).adr)).lib, juste: (v, db) => v.plaque === plaqueJuste(get(db).kg, get(db).adr) });
// L'inventaire du drone.
export const blocsReleve = (L) => L.map((I, i) => ({ type: 'choix', id: `rel-${i + 1}`, lib: `${I.adr} : ${nomDe(I.prod)}`, colonne: true, manque: `l’adresse ${I.adr}`, choix: RELEVE }));
export const jalonsReleve = (get, { poids, groupe }) => get(null).map((I0, i) => ({ id: `rel-${i + 1}`, titre: `Le drone : l’adresse n° ${i + 1}`, groupe, poids,
  titreBilan: (db) => `Le drone : ${get(db)[i].adr}`, attendu: (db) => RELEVE.find((x) => x.v === releveJuste(get(db)[i])).lib, juste: (v, db) => v[`rel-${i + 1}`] === releveJuste(get(db)[i]) }));
export const aRecompter = (L) => L.filter((I) => I.drone !== I.systeme);
export const blocsEcarts = (L) => aRecompter(L).map((I) => ({ type: 'choix', id: `ecart-${I.adr}`, lib: `${I.adr} : ${nomDe(I.prod)}`, colonne: true, manque: `l’adresse ${I.adr}`, choix: ECARTS }));
export const jalonsEcarts = (get, { poids, groupe }) => aRecompter(get(null)).map((_, i) => ({ id: `ecart-${i + 1}`, titre: `L’écart : l’adresse à recompter n° ${i + 1}`, groupe, poids,
  titreBilan: (db) => `L’écart : ${aRecompter(get(db))[i].adr}`, attendu: (db) => ECARTS.find((x) => x.v === ecartJuste(aRecompter(get(db))[i])).lib,
  juste: (v, db) => { const I = aRecompter(get(db))[i]; return v[`ecart-${I.adr}`] === ecartJuste(I); } }));

// ─────────────────────────────────────────── la banque « Avant de commencer » (CAP : les notions du scénario, jamais notée sauf en évaluation)
const q = (id, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'nadia', doc: 'site', rubrique: 'preparation', enonce, choix, juste, retour });
export const BANQUE = [
  q('vend', 'Le centre d’Évreux, c’est…', [{ v: 'distrib', lib: 'un centre qui reçoit, range et expédie du matériel électrique' }, { v: 'usine', lib: 'une usine qui fabrique des voitures' },
    { v: 'magasin', lib: 'un magasin ouvert aux particuliers' }], 'distrib', 'Il reçoit les produits des usines et prépare les commandes des distributeurs.'),
  q('planigramme', 'Le planigramme de la réception dit…', [{ v: 'camions', lib: 'quels camions arrivent, à quelle heure et à quel quai' }, { v: 'salaires', lib: 'les salaires de l’équipe' },
    { v: 'menu', lib: 'le menu de la cantine' }], 'camions', 'C’est le premier document que tu lis en prenant ton poste.'),
  q('scelle', 'Le scellé d’un camion sert à…', [{ v: 'preuve', lib: 'prouver que personne n’a ouvert les portes pendant le transport' }, { v: 'decor', lib: 'décorer le camion' },
    { v: 'fermer', lib: 'fermer le camion pour la nuit' }], 'preuve', 'Pas le bon numéro : tu n’ouvres pas, tu appelles ta cheffe.'),
  q('reserve', 'Une réserve sur la lettre de voiture…', [{ v: 'precise', lib: 'dit combien, quoi et quel problème' }, { v: 'deballage', lib: 'dit « sous réserve de déballage »' },
    { v: 'apres', lib: 's’écrit le lendemain' }], 'precise', 'Une réserve précise, écrite avant que le chauffeur parte.'),
  q('plaque', 'La plaque de charge du palettier dit…', [{ v: 'charge', lib: 'le poids maximal par emplacement, niveau par niveau' }, { v: 'prix', lib: 'le prix du palettier' },
    { v: 'nom', lib: 'le nom du cariste' }], 'charge', 'Une palette trop lourde pour un niveau ne s’y monte jamais.'),
  q('drone', 'Le drone d’inventaire d’Évreux…', [{ v: 'compte', lib: 'compte les colis dans les rayonnages' }, { v: 'livre', lib: 'livre les colis aux clients' },
    { v: 'filme', lib: 'surveille les salariés' }], 'compte', 'Quand le drone et le système ne sont pas d’accord, on recompte à la main.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'nadia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis « Le centre d’Évreux » à gauche et réponds à mes questions.',
  documents: ['site'], tirage: { preparation: 3 }, questions: BANQUE.map((x) => x.id), ...o });

// ─────────────────────────────────────────── la carte de France (22.1)
export const LOCALISER = {
  id: 'schneider-carte', libelle: 'Carte de France', titre: 'Où sont les sites ?', contours: FRANCE, vue: 'schneider-carte', poids: 1, groupe: 'La carte',
  objet: 'La carte',
  message: 'Place maintenant trois sites de Schneider Electric sur la carte de France : notre centre, l’usine qui nous envoie les contacteurs et le siège du groupe (menu « Carte de France »).',
  lieux: [
    { id: 'evreux', lettre: 'E', type: 'entrepot', nom: 'Centre de distribution d’Évreux', role: 'Le centre où tu fais ton stage.',
      ville: 'Évreux', dep: '27', region: '28', lonlat: [1.1508, 49.0241], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Vernon', lonlat: [1.4848, 49.0929] }, { ville: 'Bernay', lonlat: [0.5985, 49.0889] }, { ville: 'Les Andelys', lonlat: [1.4115, 49.2462] }],
      reperes: [{ ville: 'Paris', lonlat: [2.3484, 48.8535] }], indice: 'À l’ouest de Paris, en Normandie.', etiq: 'b' },
    { id: 'vaudreuil', lettre: 'U', type: 'usine', nom: 'Usine du Vaudreuil', role: 'L’usine qui fabrique les contacteurs.',
      ville: 'Le Vaudreuil', dep: '27', region: '28', lonlat: [1.2097, 49.2539], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Vernon', lonlat: [1.4848, 49.0929] }, { ville: 'Bernay', lonlat: [0.5985, 49.0889] }, { ville: 'Pont-Audemer', lonlat: [0.5157, 49.3553] }],
      reperes: [{ ville: 'Rouen', lonlat: [1.0993, 49.4431] }], indice: 'Au sud de Rouen, dans le même département que le centre.', etiq: 'h' },
    { id: 'rueil', lettre: 'S', type: 'site', nom: 'Siège social du groupe', role: 'Le siège de Schneider Electric.',
      ville: 'Rueil-Malmaison', dep: '92', region: '11', lonlat: [2.1897, 48.8778], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Antony', lonlat: [2.2980, 48.7540] }, { ville: 'Gennevilliers', lonlat: [2.2934, 48.9334] }, { ville: 'Issy-les-Moulineaux', lonlat: [2.2700, 48.8240] }],
      reperes: [{ ville: 'Paris', lonlat: [2.3484, 48.8535] }], indice: 'Juste à l’ouest de Paris.', etiq: 'd' },
  ],
  flux: ['vaudreuil', 'evreux'],
  fin: { titre: 'De l’usine au centre, puis vers 120 pays',
    texte: 'Les contacteurs du Vaudreuil font 25 km pour arriver à Évreux ; de là, les commandes partent vers toute la France et 120 pays. Les prénoms, les camions et les palettes de tes séances sont imaginés pour l’exercice.' },
};
export { PRODUITS, KG_AIDE, nomDe };
