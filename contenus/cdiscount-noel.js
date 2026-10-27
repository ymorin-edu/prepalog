// Cdiscount — le pic de Noël : la FABRIQUE des séances ENT-2.7 à 2.10 (1re, C2.2 « optimiser les préparations de commandes en fonction des demandes »).
// Cadrage : `docs/briefs/cdiscount-noel/CADRAGE-cdiscount-noel-1re.md` ; données : `contenus/cdiscount-noel-donnees.js`. L'univers (charte, logo,
// équipe) est celui des séances Cdiscount (`contenus/cdiscount.js`) ; chaque contenu de séance exporte en plus son `CATALOGUE`, sa `baseDeDepart` et un
// `ENTREPRISE` au sous-titre du pic.
//
// L'élève est dans l'équipe de la zone de préparation MANUELLE « M » de l'entrepôt de Cestas (la zone est CONSTRUITE). Trois gestes de C2.2, un par
// séance, puis les trois en évaluation : classer les références par la demande (ABC) et rapprocher la classe A du poste d'emballage (2.7) ; choisir
// entre la préparation commande par commande et par lots (2.8) ; contrôler le calcul de l'effectif du jour de pic (2.9, erreur induite). Aucune vue
// nouvelle : documents joints, fiche, réponse par phrases, questions au fil. Les collègues tutoient l'élève (règle du 06/10/2026), il répond au tu poli.

import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { ENTREPRISE as ENT_CDISCOUNT, EQUIPE as EQUIPE_CDISCOUNT, CATALOGUE as CAT_CDISCOUNT, sousCatalogue } from './cdiscount.js';
import { abc, implantation, preparation, effectif, distanceDe, refDe, empDe, nombreFr } from './cdiscount-noel-donnees.js';

export const ENTREPRISE = { ...ENT_CDISCOUNT, sousTitre: 'Entrepôt de Cestas — zone de préparation manuelle, pic de Noël', exercice: 'Préparer le pic de Noël' };
export const catalogueDe = (refs) => sousCatalogue(refs);
export const baseDeDepart = () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] });
const des = (ref) => (CAT_CDISCOUNT.MM[ref] ? CAT_CDISCOUNT.MM[ref].name : ref);

export const MENTION = 'Réels : l’entrepôt de Cdiscount à Cestas (Gironde), ses robots Skypod pour les petits articles depuis 2016, le Black Friday 2018 '
  + '(156 commandes par seconde au plus fort, des équipes d’entrepôt triplées, surtout par l’intérim) et le Code du travail. Construits : la zone de '
  + 'préparation manuelle M, ses emplacements et ses distances, les références et leurs marques, les lignes, les commandes, les prévisions, les effectifs et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite : Nadia vient des séances ENT-2.1 à 2.6, Yanis est nouveau)
export const EQUIPE = {
  nadia: { nom: 'Nadia Ferrand', role: 'cheffe d’équipe (ta responsable)', appel: 'Nadia' },
  yanis: { nom: 'Yanis', role: 'chef d’équipe de la préparation de nuit', appel: 'Yanis' },
};
const NADIA = { nom: `${EQUIPE_CDISCOUNT.cheffe.nom}, cheffe d’équipe`, mail: EQUIPE_CDISCOUNT.cheffe.mail };
export const MAIL_NADIA = NADIA.mail;
export const PERSONNES = { nadia: EQUIPE.nadia, yanis: EQUIPE.yanis };

// Le Code du travail, art. L1251-6 (extrait), relu sur code.travail.gouv.fr le 26/10/2026.
export const L1251_6 = 'Il ne peut être fait appel à un salarié temporaire que pour l’exécution d’une tâche précise et temporaire dénommée « mission » […]';
export const L1251_6_CAS = 'Accroissement temporaire de l’activité de l’entreprise';
const SOURCE_DROIT = 'Code du travail, article L1251-6 (extrait), code.travail.gouv.fr, consulté le 26/10/2026';

// ─────────────────────────────────────────── aides
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = 'Document pédagogique — reconstitution, non contractuel.';
const pied = (t = PIED) => `<p class="cn-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace('%', '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
const memes = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

export const STYLE = `
--douce:#555047;
.cn-doc{padding:14px 18px 0}
.cn-doc p{margin:0 0 8px}
.cn-t{margin:0; font-size:1.08rem; font-weight:800}
.cn-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.cn-ul{margin:4px 0 8px; padding-left:20px; font-size:.92rem}
.cn-ul li{margin:4px 0}
.cn-loi{margin:2px 0 6px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.cn-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.cn-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.cn-table th, .cn-table td{border-bottom:1px solid #d6d0c3; padding:4px 6px; text-align:left}
.cn-table th{color:var(--douce); font-weight:600}
.cn-table .cn-d{text-align:right; white-space:nowrap}
.cn-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.cn-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents
function docPoste(D, texte) {
  return { id: 'poste', titre: 'Ton poste', court: 'Ton poste',
    html: `<article class="cn-doc" aria-label="Ton poste">
    <p class="cn-t">Ton poste</p>
    <p class="cn-st">Entrepôt Cdiscount de Cestas (Gironde) — zone de préparation manuelle M — ${ech(D.jour)}</p>
    <p>Tu es préparateur(trice) de commandes dans la <b>zone M</b>, une allée où l’on prépare à la main les articles qui ne passent pas par les robots.
      Au bout de l’allée, le <b>poste d’emballage</b> : chaque commande y part en colis. Ta responsable : <b>Nadia</b>.</p>
    ${texte}
    <p><b>Ce qui est réel</b> : à Cestas, les petits articles sont préparés depuis 2016 par des robots (Skypod). Pour le Black Friday 2018, Cdiscount a
      annoncé jusqu’à 156 commandes par seconde au plus fort de la journée, et des équipes d’entrepôt triplées, surtout par des intérimaires.</p>
    ${pied(`Document pédagogique. ${MENTION}`)}
  </article>` };
}

const docDroit = () => ({ id: 'droit', titre: 'Le droit : l’intérim', court: 'Le droit',
  html: `<article class="cn-doc" aria-label="Le droit : l’intérim">
    <p class="cn-t">Le droit : quand peut-on prendre des intérimaires ?</p>
    <p class="cn-st">Code du travail, article L1251-6</p>
    <p class="cn-loi">« ${ech(L1251_6)} »</p>
    <p>L’article donne ensuite la liste des seuls cas permis. Parmi eux : <span class="cn-loi" style="display:inline-block">« ${ech(L1251_6_CAS)} »</span></p>
    <p>L’<b>intérimaire</b> est salarié de l’<b>agence d’intérim</b> (l’entreprise de travail temporaire) : c’est elle qui le paie. Elle le <b>met à disposition</b>
      de l’entrepôt pour une mission, avec un contrat signé pour cette mission.</p>
    <p>Le pic de Noël est un accroissement <b>temporaire</b> : il passe en quelques semaines. Un besoin qui dure toute l’année ne se couvre pas par l’intérim.</p>
    ${pied(`Texte de loi (réel) — source : ${SOURCE_DROIT}. Les phrases hors guillemets sont un résumé pour l’exercice.`)}
  </article>` });

const docMethodeAbc = () => ({ id: 'methode-abc', titre: 'Méthode : la classe A et son implantation', court: 'Méthode ABC',
  html: `<article class="cn-doc" aria-label="Méthode ABC">
    <p class="cn-t">Méthode : la classe A et son implantation</p>
    <p class="cn-st">La fiche méthode de l’équipe</p>
    <ul class="cn-ul">
      <li>Une <b>ligne de commande</b>, c’est une référence dans une commande, quelle que soit la quantité : 3 écouteurs et 1 câble dans une commande = 2 lignes.</li>
      <li>On range les références de la <b>plus demandée</b> à la moins demandée (en lignes), et on additionne les lignes dans cet ordre.</li>
      <li>La <b>classe A</b>, ce sont les premières références, jusqu’à <b>atteindre 80 %</b> des lignes : la référence qui fait atteindre 80 % est en classe A.</li>
      <li><b>Implantation</b> : la classe A va aux emplacements <b>les plus proches</b> du poste d’emballage, la plus demandée au plus près.</li>
      <li><b>Distance</b> : on compte un aller-retour par ligne, du poste à l’emplacement et retour, soit <b>2 fois</b> la distance d’aller.</li>
    </ul>
    <p class="cn-st">Exemple (une autre allée) : 3 références font 600, 300 et 100 lignes sur 1 000. 600 = 60 % ; 600 + 300 = 900 = 90 % : la classe A, ce sont les
      deux premières. Une référence rangée à 10 m avec 600 lignes : 2 × 600 × 10 = 12 000 m de marche.</p>
    ${pied('Fiche méthode CONSTRUITE pour l’exercice (la méthode ABC est une méthode réelle et courante). Document pédagogique.')}
  </article>` });

const docMethodeLots = (D) => ({ id: 'methode-lots', titre: 'Méthode : commande par commande ou par lots', court: 'Méthode lots',
  html: `<article class="cn-doc" aria-label="Méthode lots">
    <p class="cn-t">Méthode : commande par commande ou par lots</p>
    <p class="cn-st">La fiche méthode de l’équipe</p>
    <ul class="cn-ul">
      <li><b>Commande par commande</b> : une tournée par commande. Le préparateur va jusqu’à l’emplacement <b>le plus loin</b> de la commande et revient :
        2 × la plus grande distance d’aller (il passe devant les autres emplacements en chemin).</li>
      <li><b>Par lots</b> : une tournée prend plusieurs commandes d’un coup, dans l’ordre d’arrivée, <b>${D.chariot} commandes au plus</b> (le chariot a ${D.chariot} bacs).
        La tournée va jusqu’à l’emplacement le plus loin <b>de tout le lot</b> et revient.</li>
      <li>Par lots, on prélève en vrac ; au poste, il faut ensuite <b>trier</b> par commande : <b>${D.tri} secondes par ligne</b>.</li>
      <li>On marche à <b>1 mètre par seconde</b> : 60 m de marche = 1 minute.</li>
    </ul>
    <p class="cn-st">Exemple : deux commandes, l’une à 10 m, l’autre à 10 m et 30 m. Commande par commande : 2 × 10 + 2 × 30 = 80 m. En un lot : 2 × 30 = 60 m.</p>
    ${pied('Fiche méthode CONSTRUITE pour l’exercice (temps et vitesse simplifiés). Document pédagogique.')}
  </article>` });

const docMethodeEffectif = (D) => ({ id: 'methode-effectif', titre: 'Méthode : l’effectif d’une journée', court: 'Méthode effectif',
  html: `<article class="cn-doc" aria-label="Méthode effectif">
    <p class="cn-t">Méthode : combien de préparateurs pour une journée ?</p>
    <p class="cn-st">La fiche méthode de l’équipe</p>
    <p class="cn-regle">Préparateurs = lignes à préparer ÷ (lignes par heure × heures du poste)<br>On arrondit au nombre <b>entier supérieur</b>.<br>
      Intérimaires = préparateurs − permanents présents.</p>
    <ul class="cn-ul">
      <li>On compte en <b>lignes</b> : c’est la ligne qui fait marcher le préparateur. Un colis peut contenir plusieurs lignes.</li>
      <li>Productivité de la zone M : <b>${D.productivite} lignes par heure</b> et par préparateur ; poste de <b>${D.heures} heures</b> de préparation.</li>
      <li>Permanents (CDI) de la zone M : <b>${D.permanents}</b>.</li>
    </ul>
    <p class="cn-st">Exemple : 1 000 lignes, 50 lignes par heure, 6 heures : 1 000 ÷ 300 = 3,33 → 4 préparateurs (avec 3, il resterait 100 lignes).</p>
    ${pied('Fiche méthode CONSTRUITE pour l’exercice (productivité et durée construites). Document pédagogique.')}
  </article>` });

const docLignes = (D) => ({ id: 'lignes', titre: `Les lignes de la semaine ${D.semaine}`, court: 'Les lignes',
  html: `<article class="cn-doc" aria-label="Lignes de la semaine">
    <p class="cn-t">Lignes de commande de la zone M — semaine ${D.semaine}</p>
    <p class="cn-st">Export du logiciel de l’entrepôt, une ligne par référence, dans l’ordre des emplacements</p>
    <table class="cn-table"><thead><tr><th scope="col">Emplacement</th><th scope="col">Référence</th><th scope="col">Article</th><th class="cn-d" scope="col">Lignes</th></tr></thead>
      <tbody>${D.allee.map(([e, , r]) => `<tr><td class="cn-mono">${e}</td><td class="cn-mono">${r}</td><td>${ech(des(r))}</td><td class="cn-d">${n(D.lignes[r])}</td></tr>`).join('')}</tbody></table>
    ${pied('Export CONSTRUIT pour l’exercice (références, lignes, emplacements). Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

const docAllee = (D) => ({ id: 'allee', titre: 'Le plan de l’allée M', court: 'L’allée M',
  html: `<article class="cn-doc" aria-label="Plan de l’allée M">
    <p class="cn-t">Plan de l’allée M</p>
    <p class="cn-st">Le poste d’emballage est au début de l’allée. Distance d’ALLER, du poste à l’emplacement</p>
    <table class="cn-table"><thead><tr><th scope="col">Emplacement</th><th class="cn-d" scope="col">Distance depuis le poste</th><th scope="col">Rangé là aujourd’hui</th></tr></thead>
      <tbody>${D.allee.map(([e, d, r]) => `<tr><td class="cn-mono">${e}</td><td class="cn-d">${d} m</td><td><span class="cn-mono">${r}</span> — ${ech(des(r))}</td></tr>`).join('')}</tbody></table>
    ${pied('Plan CONSTRUIT pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

const docCommandes = (D) => ({ id: 'commandes', titre: 'Les commandes de la vague', court: 'La vague',
  html: `<article class="cn-doc" aria-label="Commandes de la vague">
    <p class="cn-t">Vague de préparation — zone M</p>
    <p class="cn-st">Les commandes dans leur ordre d’arrivée ; une ligne = une référence (la quantité ne change pas la marche)</p>
    <table class="cn-table"><thead><tr><th scope="col">Ordre</th><th scope="col">Commande</th><th scope="col">Lignes (emplacement — référence)</th></tr></thead>
      <tbody>${D.commandes.map(([c, emps], i) => `<tr><td>${i + 1}</td><td class="cn-mono">${c}</td><td>${emps.map((e) => `<span class="cn-mono">${e}</span> — ${ech(refDe(D, e))}`).join('<br>')}</td></tr>`).join('')}</tbody></table>
    ${pied('Commandes CONSTRUITES pour l’exercice (aucun client réel). Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

const docPrevision = (D) => ({ id: 'prevision', titre: `La prévision du ${D.pic}`, court: 'La prévision',
  html: `<article class="cn-doc" aria-label="Prévision du jour de pic">
    <p class="cn-t">Prévision de la zone M — ${ech(D.pic)}</p>
    <p class="cn-st">Transmise par le service planification, d’après les ventes des années précédentes</p>
    <table class="cn-table"><tbody>
      <tr><th scope="row">Commandes attendues</th><td class="cn-d">${n(D.prevision.commandes)}</td></tr>
      <tr><th scope="row">Colis à expédier</th><td class="cn-d">${n(D.prevision.colis)}</td></tr>
      <tr><th scope="row">Lignes à préparer</th><td class="cn-d">${n(D.prevision.lignes)}</td></tr>
    </tbody></table>
    ${pied('Prévision CONSTRUITE pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

function docCalculYanis(D) {
  const E = effectif(D);
  return { id: 'calcul-yanis', titre: `Le calcul de ${D.collegue}`, court: `Le calcul de ${D.collegue}`,
    html: `<article class="cn-doc" aria-label="Le calcul de ${ech(D.collegue)}">
    <p class="cn-t">Effectif de la zone M — ${ech(D.pic)}</p>
    <p class="cn-st">Calcul fait par ${ech(D.collegue)} le ${ech(D.jour)}, à envoyer à l’agence d’intérim avant vendredi</p>
    <p class="cn-regle">${n(D.prevision[D.base])} ÷ (${D.productivite} × ${D.heures}) = ${n(D.prevision[D.base])} ÷ ${n(E.parPrep)} = ${n(Math.round(E.collegue.brut * 100) / 100)}<br>
      → <b>${E.collegue.besoin} préparateurs</b><br>${E.collegue.besoin} − ${D.permanents} permanents = <b>${E.collegue.interim} intérimaires à demander</b></p>
    <p class="cn-st">Note de ${ech(D.collegue)} : « J’ai pris la prévision des colis, et j’ai arrondi au plus près. »</p>
    ${pied('Calcul CONSTRUIT pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
}

// ─────────────────────────────────────────── les blocs de la fiche
const choixRefs = (D) => D.allee.map(([, , r]) => ({ v: r, lib: `${r} — ${des(r)}` }));
const choixEmps = (D) => D.allee.map(([e, d]) => ({ v: e, lib: `${e} (${d} m)` }));
const nb = (id, lib, unite, manque, entier = true) => ({ type: 'nombre', id, lib, unite, min: 0, ...(entier ? { entier: true } : {}), manque });

function blocsAbc(D, { pctRefs, places, avantApres, emplacements }) {
  const proches = D.allee.slice().sort((a, b) => a[1] - b[1]);
  return [
    { type: 'cadre', titre: '1. La classe A', large: true, blocs: [
      { type: 'cases', id: 'classeA', titre: 'Les références de classe A', consigne: 'Range les références de la plus demandée à la moins demandée, additionne, arrête-toi à 80 %.', choix: choixRefs(D) },
      nb('pctLignes', 'Part des lignes faite par la classe A', '%', 'la part des lignes'),
      ...(pctRefs ? [nb('pctRefs', 'Part des références que représente la classe A', '%', 'la part des références')] : []),
    ] },
    { type: 'cadre', titre: '2. L’implantation', large: true, blocs: [
      ...(places ? proches.slice(0, places).map(([e, d], i) => ({ type: 'liste', id: `m${i + 1}`, lib: `Référence à ranger en ${e} (${d} m du poste)`, manque: `la référence de ${e}`, choix: choixRefs(D) })) : []),
      ...(emplacements ? [{ type: 'cases', id: 'emplacements', titre: 'Les emplacements où ranger la classe A', consigne: 'Regarde le plan de l’allée.', choix: choixEmps(D) }] : []),
      ...(avantApres ? [nb('avant', 'Marche de la semaine pour la classe A, rangée comme aujourd’hui', 'm', 'la marche d’aujourd’hui'),
        nb('apres', 'Marche de la semaine pour la classe A, rangée comme tu le proposes', 'm', 'la marche après')] : []),
    ] },
  ];
}
function blocsPreparation(D, { minutes }) {
  return [
    { type: 'cadre', titre: minutes ? '1. Les deux méthodes' : '3. Les deux méthodes', large: true, blocs: [
      nb('cmd', 'Marche pour toute la vague, commande par commande', 'm', 'la marche commande par commande'),
      nb('lots', `Marche pour toute la vague, par lots de ${D.chariot} commandes`, 'm', 'la marche par lots'),
      ...(minutes ? [nb('marche', 'Minutes de marche gagnées par les lots', 'min', 'les minutes gagnées', false),
        nb('tri', 'Minutes de tri ajoutées par les lots', 'min', 'les minutes de tri', false)] : []),
      { type: 'choix', id: 'methode', lib: 'La méthode que tu proposes pour cette vague', colonne: true, manque: 'la méthode', choix: [
        { v: 'lots', lib: `Par lots de ${D.chariot} commandes` }, { v: 'commande', lib: 'Commande par commande' }] },
    ] },
  ];
}
function blocsEffectif(D, { erreurs, retard }) {
  return [
    ...(erreurs ? [{ type: 'cadre', titre: `1. Le calcul de ${D.collegue}`, large: true, blocs: [
      { type: 'cases', id: 'erreurs', titre: `Les erreurs du calcul de ${D.collegue}`, consigne: 'Compare son calcul à la fiche méthode et à la prévision.', choix: [
        { v: 'colis', lib: 'Il est parti des colis au lieu des lignes' },
        { v: 'arrondi', lib: 'Il a arrondi vers le bas' },
        { v: 'productivite', lib: 'Il s’est trompé de productivité' },
        { v: 'heures', lib: 'Il s’est trompé de durée du poste' },
        { v: 'permanents', lib: 'Il a oublié de retirer les permanents' },
      ] },
    ] }] : []),
    { type: 'cadre', titre: erreurs ? '2. Le bon calcul' : '4. L’effectif du jour de pic', large: true, blocs: [
      nb('besoin', 'Préparateurs nécessaires', 'préparateurs', 'les préparateurs'),
      nb('interim', 'Intérimaires à demander à l’agence', 'intérimaires', 'les intérimaires'),
      ...(retard ? [nb('retard', `Lignes qui ne seraient pas préparées avec l’effectif de ${D.collegue}`, 'lignes', 'les lignes en retard')] : []),
    ] },
  ];
}

// ─────────────────────────────────────────── l'état de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};

// ─────────────────────────────────────────── les phrases (de l'élève à Nadia : tu poli)
// Chaque ligne : la juste en premier (`juste: 0`), mélangées à l'écran ; les fausses reprennent les erreurs qu'on attend.
function phrases(D, K, prenom) {
  const id = `proposition-${D.code.slice(4).replace('.', '')}`;
  const salut = { id: 'salutation', choix: ['Bonjour Nadia,', 'Yo Nadia,', 'Coucou chef,'], juste: 0 };
  const fin = { id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 };
  const lignes = [salut];
  if (K.abc) {
    const A = abc(D), I = implantation(D);
    const quatre = A.tri.slice(0, A.classeA.length + 1).map((x) => x[0]);
    const moins = A.tri.slice(0, A.classeA.length - 1).map((x) => x[0]);
    const pct = (L) => Math.round(L.reduce((t, r) => t + D.lignes[r], 0) * 100 / A.total);
    const phr = (L) => `Classe A : ${liste(L)}, soit ${L.length} références sur ${A.tri.length} pour ${pct(L)} % des lignes.`;
    lignes.push({ id: 'classe', choix: [phr(A.classeA), phr(quatre), phr(moins)], juste: 0 });
    const P = I.places, ordre = A.classeA;
    const inverse = Object.fromEntries(ordre.map((r, i) => [r, I.emplacements[ordre.length - 1 - i]]));
    const pl = (M) => `Je propose de ranger ${liste(ordre.map((r) => `${r} en ${M[r]}`))}.`;
    lignes.push({ id: 'implantation', choix: [pl(P), pl(inverse), 'Je propose de laisser chaque référence à sa place.'], juste: 0 });
    if (K.marche) lignes.push({ id: 'gain', choix: [`Pour la classe A, la marche de la semaine passerait de ${n(I.avant)} m à ${n(I.apres)} m.`,
      `Pour la classe A, la marche de la semaine passerait de ${n(I.avant / 2)} m à ${n(I.apres / 2)} m.`,
      `Pour la classe A, la marche de la semaine passerait de ${n(I.apres)} m à ${n(I.avant)} m.`], juste: 0 });
  }
  if (K.prep) {
    const P = preparation(D);
    if (K.minutes) {
      lignes.push({ id: 'mesures', choix: [`Pour la vague : ${n(P.cmd)} m commande par commande, ${n(P.lot)} m par lots de ${D.chariot}.`,
        `Pour la vague : ${n(P.lot)} m commande par commande, ${n(P.cmd)} m par lots de ${D.chariot}.`,
        `Pour la vague : ${n(P.cmd / 2)} m commande par commande, ${n(P.lot / 2)} m par lots de ${D.chariot}.`], juste: 0 });
      lignes.push({ id: 'bilan', choix: [`Les lots font gagner ${n(P.marche)} min de marche et ajoutent ${n(P.tri)} min de tri.`,
        `Les lots font gagner ${n(P.marche)} min de marche et n’ajoutent rien.`,
        `Les lots font gagner ${n(P.marche + P.tri)} min de marche et ajoutent ${n(P.tri)} min de tri.`], juste: 0 });
    }
    lignes.push({ id: 'methode', choix: [`Je propose de préparer la vague par lots de ${D.chariot} commandes.`,
      'Je propose de garder la préparation commande par commande.', `Je propose de préparer la vague en un seul lot de ${D.commandes.length} commandes.`], juste: 0 });
  }
  if (K.eff) {
    const E = effectif(D);
    if (D.collegue) {
      lignes.push({ id: 'erreur', choix: [`Le calcul de ${D.collegue} part des colis (${n(D.prevision.colis)}) au lieu des lignes (${n(D.prevision.lignes)}), et arrondit vers le bas.`,
        `Le calcul de ${D.collegue} est juste.`, `Le calcul de ${D.collegue} oublie de retirer les permanents.`], juste: 0 });
    }
    lignes.push({ id: 'interim', choix: [`Il faut ${E.besoin} préparateurs, donc ${E.interim} intérimaires avec nos ${D.permanents} permanents.`,
      `Il faut ${E.besoin} préparateurs, donc ${E.besoin} intérimaires.`,
      `Il faut ${Math.floor(E.brut)} préparateurs, donc ${Math.floor(E.brut) - D.permanents} intérimaires avec nos ${D.permanents} permanents.`,
      ...(D.collegue ? [] : [`Il faut ${Math.ceil(D.prevision.colis / E.parPrep)} préparateurs, donc ${Math.ceil(D.prevision.colis / E.parPrep) - D.permanents} intérimaires avec nos ${D.permanents} permanents.`])], juste: 0 });
    if (D.collegue) lignes.push({ id: 'consequence', choix: [`Avec ${E.collegue.besoin} préparateurs, ${n(E.retard)} lignes ne seraient pas préparées lundi.`,
      `Avec ${E.collegue.besoin} préparateurs, toutes les lignes seraient préparées lundi.`,
      `Avec ${E.collegue.besoin} préparateurs, ${n(D.prevision.lignes - D.prevision.colis)} lignes ne seraient pas préparées lundi.`], juste: 0 });
  }
  lignes.push(fin);
  return { id, melanger: true, lignes };
}

// ─────────────────────────────────────────── la fabrique d'une séance
// D : le jeu ; O : { id (meta.id), K (quels gestes : abc, places, pctRefs, marche, emplacements, prep, minutes, eff, erreurs, retard), poids, consigne,
// poste, objet (objet du premier mail), documents (ids, dans l'ordre), questions }.
export function seance(D, O) {
  const K = O.K;
  const suffixe = D.code.slice(4).replace('.', '');
  const FICHE_ID = `fiche-${suffixe}`, VOLET_ID = `cn-${suffixe}`;
  const P = phrases(D, K, '{prenom}');
  const PHRASES_ID = P.id;
  const A = K.abc ? abc(D) : null, I = K.abc ? implantation(D) : null, PR = K.prep ? preparation(D) : null, E = K.eff ? effectif(D) : null;

  const FAB = { poste: () => docPoste(D, O.poste), lignes: () => docLignes(D), allee: () => docAllee(D), commandes: () => docCommandes(D),
    prevision: () => docPrevision(D), 'calcul-yanis': () => docCalculYanis(D), 'methode-abc': docMethodeAbc, 'methode-lots': () => docMethodeLots(D),
    'methode-effectif': () => docMethodeEffectif(D), droit: docDroit };
  const DOCUMENTS = O.documents.map((id) => FAB[id]());
  const blocs = [
    ...(K.abc ? blocsAbc(D, { pctRefs: K.pctRefs, places: K.places ? A.classeA.length : 0, avantApres: K.marche, emplacements: K.emplacements }) : []),
    ...(K.prep ? blocsPreparation(D, { minutes: K.minutes }) : []),
    ...(K.eff ? blocsEffectif(D, { erreurs: K.erreurs, retard: K.retard }) : []),
  ];
  const surFicheDocs = O.documents.filter((x) => x !== 'poste' && x !== 'droit');
  const FICHE = {
    id: FICHE_ID, libelle: 'Fiche de calcul', titre: O.ficheTitre, sousTitre: 'À gauche : les documents et la fiche méthode. Le calcul se fait au brouillon ou à la calculatrice.',
    documents: surFicheDocs, largeurDocs: 1.3, defile: true, bouton: 'Ouvrir la fiche de calcul', blocs,
    envoi: { bouton: 'Envoyer la fiche à Nadia', a: 'Nadia', suite: 'Écris-lui maintenant ta proposition, dans la Messagerie.' },
  };

  const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decale || 0), from: NADIA.nom, fromMail: NADIA.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
  const VOLET = {
    id: VOLET_ID,
    semer: (prenom) => ({
      mails: [mail(prenom, O.objet, `Bonjour ${prenom} !\n\n${O.consigne}\n\nNadia`, { decale: -3600e3, extra: { pieces: O.documents, ouvreFiche: FICHE_ID } })],
    }),
    declencheurs: [
      { id: 'proposition', quand: apresFiche(FICHE_ID),
        semer: (prenom) => ({ mails: [mail(prenom, 'Ta proposition', `Bonjour ${prenom},\n\nJ’ai ta fiche. Écris-moi maintenant ta proposition en quelques lignes : `
          + 'je la transmets au responsable de la zone.\n\nNadia', { extra: { phrases: phrases(D, K, prenom) } })] }) },
      { id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye,
        semer: (prenom) => ({ mails: [mail(prenom, 'Merci', `Merci ${prenom}. Je regarde ta fiche et ta proposition.\n\nNadia`, { decale: 1000 })] }) },
    ],
  };

  // ── les jalons
  const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
  const W = O.poids;
  const G = { abc: 'La classe A', impl: 'L’implantation', prep: 'La méthode de préparation', eff: 'L’effectif du jour de pic', compte: 'La proposition à Nadia' };
  const surFiche = (id, titre, groupe, juste) => ({ id, titre, groupe, poids: W[id], ecran: `fiche:${FICHE_ID}`,
    verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return juste(valeursDe(db, FICHE_ID)) ? ok : ko; } });
  const cases = (k, attendu) => (v) => Array.isArray(v[k]) && v[k].length > 0 && memes(v[k], attendu);
  const nombre = (k, attendu) => (v) => Math.abs(lireNombre(v[k]) - attendu) < 1e-9;
  const ETAPES = [];
  if (K.abc) {
    ETAPES.push(surFiche('classeA', 'Les références de classe A', G.abc, cases('classeA', A.classeA)));
    ETAPES.push(surFiche('pctLignes', 'La part des lignes de la classe A', G.abc, nombre('pctLignes', A.pctLignes)));
    if (K.pctRefs) ETAPES.push(surFiche('pctRefs', 'La part des références de la classe A', G.abc, nombre('pctRefs', A.pctRefs)));
    if (K.places) A.classeA.forEach((r, i) => ETAPES.push(surFiche(`m${i + 1}`, `${I.emplacements[i]} : la bonne référence`, G.impl, (v) => v[`m${i + 1}`] === r)));
    if (K.emplacements) ETAPES.push(surFiche('emplacements', 'Les emplacements de la classe A', G.impl, cases('emplacements', I.emplacements)));
    if (K.marche) {
      ETAPES.push(surFiche('avant', 'La marche d’aujourd’hui', G.impl, nombre('avant', I.avant)));
      ETAPES.push(surFiche('apres', 'La marche après l’implantation', G.impl, nombre('apres', I.apres)));
    }
  }
  if (K.prep) {
    ETAPES.push(surFiche('cmd', 'La marche commande par commande', G.prep, nombre('cmd', PR.cmd)));
    ETAPES.push(surFiche('lots', 'La marche par lots', G.prep, nombre('lots', PR.lot)));
    if (K.minutes) {
      ETAPES.push(surFiche('marche', 'Les minutes de marche gagnées', G.prep, nombre('marche', PR.marche)));
      ETAPES.push(surFiche('tri', 'Les minutes de tri ajoutées', G.prep, nombre('tri', PR.tri)));
    }
    ETAPES.push(surFiche('methode', 'La méthode choisie', G.prep, (v) => v.methode === PR.methode));
  }
  if (K.eff) {
    if (K.erreurs) ETAPES.push(surFiche('erreurs', `Les erreurs de ${D.collegue}`, G.eff, cases('erreurs', ['colis', 'arrondi'])));
    ETAPES.push(surFiche('besoin', 'Les préparateurs nécessaires', G.eff, nombre('besoin', E.besoin)));
    ETAPES.push(surFiche('interim', 'Les intérimaires à demander', G.eff, nombre('interim', E.interim)));
    if (K.retard) ETAPES.push(surFiche('retard', 'Les lignes en retard avec l’effectif de Yanis', G.eff, nombre('retard', E.retard)));
  }
  const cles = P.lignes.map((l) => l.id).filter((x) => x !== 'salutation' && x !== 'fin');
  ETAPES.push({ id: 'compte-rendu', titre: 'La proposition à Nadia', groupe: G.compte, poids: W['compte-rendu'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return cles.every((l) => r.justes.includes(l)) ? ok : ko; } });
  const manque = ETAPES.filter((e) => typeof e.poids !== 'number');
  if (manque.length) throw new Error(`${D.code} : jalon sans poids (${manque.map((e) => e.id).join(', ')})`);

  const ficheFaite = (db) => envoyee(db, FICHE_ID);
  const rendu = (db) => phrasesJustes(db, PHRASES_ID).envoye;
  const PASTILLES = [{ libelle: 'La fiche de calcul', fait: ficheFaite }, { libelle: 'La proposition', fait: rendu }];
  const SUITE = [
    { vue: 'fiche', libelle: 'La fiche de calcul', fait: ficheFaite },
    { vue: 'mail', mail: PHRASES_ID, libelle: 'La proposition à Nadia', fait: rendu },
  ];
  const ACCUEIL = {
    titre: O.ficheTitre,
    kpis: ['mail'],
    etapes: [
      ['Lire le message de Nadia', 'Menu Messagerie. Les documents sont joints, avec la fiche méthode.'],
      ['① La fiche de calcul', O.etape],
      ['② La proposition', 'Réponds à Nadia, une phrase par ligne.'],
      ['Bon à savoir', MENTION],
    ],
  };
  const OPTIONS = {
    menu: [],
    exercice: O.ficheTitre,
    sansTrame: 'Tout se fait à l’écran',
    documents: DOCUMENTS,
    documentsStyle: STYLE,
    fiches: [FICHE],
    pastilles: PASTILLES,
    suite: SUITE,
    equipe: EQUIPE,
    ...(O.questions ? { questions: O.questions } : {}),
  };
  const refs = D.allee ? D.allee.map((x) => x[2]) : ['ECO-BT-01'];
  return { ID: O.id, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS, CATALOGUE: catalogueDe(refs) };
}

// ─────────────────────────────────────────── la banque « Avant de commencer » (commune aux quatre séances)
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'nadia', doc, rubrique, enonce, choix, juste, retour });
export const BANQUE = [
  q('ligne', 'preparation', 'poste', 'Une cliente commande 3 paires d’écouteurs et 1 câble. Combien de lignes de commande ?',
    [{ v: '2', lib: '2 lignes' }, { v: '4', lib: '4 lignes' }, { v: '1', lib: '1 ligne' }], '2',
    'Une ligne = une référence dans la commande, quelle que soit la quantité : écouteurs et câble, 2 lignes.'),
  q('classe-a', 'preparation', 'poste', 'Dans un entrepôt, la « classe A », ce sont…',
    [{ v: 'peu', lib: 'les quelques références qui font la plupart des lignes' }, { v: 'cheres', lib: 'les références les plus chères' },
      { v: 'lourdes', lib: 'les références les plus lourdes' }], 'peu',
    'Peu de références font l’essentiel du travail : c’est elles qu’on range au plus près.'),
  q('pres-du-poste', 'preparation', 'poste', 'Près du poste d’emballage, on range de préférence…',
    [{ v: 'demandes', lib: 'les articles les plus demandés' }, { v: 'nouveaux', lib: 'les articles arrivés en dernier' }, { v: 'alpha', lib: 'les articles dans l’ordre alphabétique' }], 'demandes',
    'Chaque ligne fait marcher le préparateur : ce qui sort souvent doit être près.'),
  q('par-lots', 'preparation', 'poste', 'Préparer « par lots », c’est…',
    [{ v: 'plusieurs', lib: 'prendre plusieurs commandes dans une même tournée, puis les trier' }, { v: 'palette', lib: 'préparer une palette entière' },
      { v: 'gros', lib: 'préparer d’abord les grosses commandes' }], 'plusieurs',
    'Une seule tournée pour plusieurs commandes : moins de marche, mais un tri à faire au poste.'),
  q('motif', 'droit', 'droit', 'Pour le pic de Noël, l’entrepôt peut prendre des intérimaires parce que…',
    [{ v: 'accroissement', lib: 'c’est un accroissement temporaire de l’activité' }, { v: 'moins-cher', lib: 'c’est toujours moins cher qu’un CDI' },
      { v: 'toujours', lib: 'on peut prendre des intérimaires pour n’importe quel poste' }], 'accroissement',
    'L’article L1251-6 limite l’intérim à une liste de cas : l’accroissement temporaire de l’activité en fait partie.'),
  q('employeur', 'droit', 'droit', 'Qui paie le salaire d’un intérimaire ?',
    [{ v: 'agence', lib: 'L’agence d’intérim' }, { v: 'entrepot', lib: 'L’entrepôt où il travaille' }, { v: 'etat', lib: 'L’État' }], 'agence',
    'L’intérimaire est salarié de l’agence d’intérim, qui le met à disposition de l’entrepôt pour une mission.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'nadia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Le pic de Noël approche. Avant de t’y mettre, regarde les documents à gauche et réponds à mes questions.',
  documents: ['poste', 'droit'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
export { distanceDe };
