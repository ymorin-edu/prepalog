// Amazon — le centre de distribution robotisé de Brétigny-sur-Orge (Essonne) : l'UNIVERS commun des séances ENT-19.1 à 19.10 (CAP OL,
// entreprise n° 19, 3e entreprise de la progression CAP du 18/10/2026) et les DOCUMENTS et blocs de fiche qu'elles partagent.
// Cadrage : `docs/briefs/amazon/CADRAGE-amazon-cap.md` ; données : `contenus/amazon-donnees.js` ; fabrique : `contenus/fabrique-fiches.js`.
//
// L'élève est stagiaire en PFMP au poste de rangement puis de prélèvement et d'emballage. Karima (manageuse de la zone, sa tutrice), Théo
// (« problem solver ») et Inès (emballage) sont CONSTRUITS, prénoms seuls ; aucune parole n'est prêtée à un salarié réel. Tutoiement.
// Aucune vue nouvelle : documents joints, fiches courtes (une consigne par écran), carte « Localiser » en 19.1, réponse par phrases.

import { catalogueSimple } from './entreprise-commun.js';
import { FRANCE } from './france-contours.js';
import {
  ARTICLES, CASES, KG_LOURD, SECURITE, POSTE192, PLANIGRAMME, RETARD_MAX, ACTIONS, CARTONS, TOLERANCE_G, ECOGESTES, FRAGILES,
  regleCassee, jugerRangement, casesJustes, adresse, compte, ecart, actionJuste, cartonJuste, aCaler, poidsAttendu, pesee, nombreFr, FAITS,
} from './amazon-donnees.js';
import { memes, proche } from './fabrique-fiches.js';

// ─────────────────────────────────────────── l'univers
export const LOGO = './contenus/trames/logos/amazon.svg';
export const ENTREPRISE = {
  id: 'amazon',
  nom: 'Amazon',
  sousTitre: 'Centre de distribution de Brétigny-sur-Orge (Essonne) — la marchandise vient à toi',
  exercice: 'Au poste',
  logo: LOGO,
};
export const VOCAB = { unit: 'article', unitPl: 'articles', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'amazon.example' };
// Charte d'amazon.fr (relevé du 27/10/2026) : le bleu-noir du bandeau #232f3e (« squid ink ») et l'orange #ff9900 de la flèche ; l'accent
// retenu est le bleu-noir (l'orange, à 2,1:1 sur le papier, ne tient pas le contraste du texte). Police Amazon Ember, non embarquée.
export const THEME = { accent: '#232f3e', papier: true };
export const CATALOGUE = catalogueSimple(Object.values(ARTICLES).map((x) => ({ ref: x.ref.toUpperCase(), designation: x.nom, marque: 'Article construit',
  categorie: 'Article', fournisseur: 'F-AMZ', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-AMZ', brand: 'Amazon', name: 'Vendeurs (construits)', adr: '', cp: '', ville: 'Brétigny-sur-Orge', contact: '', tel: '',
  email: 'reception@amazon.example', delai: 1, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Amazon et son centre de distribution de Brétigny-sur-Orge (Essonne) : 70 000 m² sur trois niveaux, environ 4 000 robots, '
  + '4 500 salariés, 500 000 colis préparés par jour en moyenne ; les robots apportent l’armoire au poste, l’emplacement choisi au rangement devient '
  + 'l’adresse de l’article, le système désigne le carton et un colis au mauvais poids sort de la ligne. Construits : les armoires et leurs cases, '
  + 'les règles du poste, les articles, les commandes, les cartons, les vendeurs, les camions et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  karima: { nom: 'Karima', role: 'manageuse de la zone de rangement (ta tutrice)', appel: 'Karima', registre: 'tu',
    metier: 'Manageuse de zone', phrase: 'J’organise le travail de la zone et je suis ta tutrice : je te donne ta mission et je suis ton travail.' },
  theo: { nom: 'Théo', role: '« problem solver »', appel: 'Théo', registre: 'tu',
    metier: 'Problem solver', phrase: 'Je règle les problèmes : un article abîmé, une case vide, un colis qui n’a pas le bon poids. Appuie sur « Aide », je viens.' },
  ines: { nom: 'Inès', role: 'agente d’emballage', appel: 'Inès', registre: 'tu',
    metier: 'Agente d’emballage', phrase: 'J’emballe les commandes : je scanne l’article, je prends le carton que le système me donne, je cale et je ferme.' },
};
export const MAIL_KARIMA = 'karima@amazon.example';
export const TUTEUR = { nom: 'Karima, manageuse de zone', mail: MAIL_KARIMA, appel: 'Karima' };
export const PERSONNES = { karima: EQUIPE.karima, theo: EQUIPE.theo };

// ─────────────────────────────────────────── aides
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = 'Document pédagogique — reconstitution, non contractuel.';
const pied = (t = PIED) => `<p class="az-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
const kg = (x) => `${n(x)} kg`;
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="az-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="az-doc" aria-label="${ech(titre)}">${corps}</article>` });
const entete = (t, st) => `<div class="az-entete"><img class="az-logo" src="${LOGO}" alt="Amazon"><div><p class="az-t">${ech(t)}</p>${st ? `<p class="az-st">${ech(st)}</p>` : ''}</div></div>`;

export const STYLE = `
--douce:#555047;
.az-doc{padding:14px 18px 0}
.az-doc p{margin:0 0 8px}
.az-entete{display:flex; gap:12px; align-items:center; border-bottom:2px solid #232f3e; padding-bottom:6px; margin-bottom:10px}
.az-logo{height:26px; width:auto}
.az-t{margin:0; font-size:1.06rem; font-weight:800}
.az-st{margin:2px 0 0; font-size:.84rem; color:var(--douce)}
.az-ul{margin:4px 0 8px; padding-left:20px; font-size:.93rem}
.az-ul li{margin:4px 0}
.az-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.az-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.az-table th, .az-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left; vertical-align:top}
.az-table th{color:var(--douce); font-weight:600}
.az-table .az-d{text-align:right; white-space:nowrap}
.az-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.az-armoire{border-collapse:separate; border-spacing:4px; width:100%; table-layout:fixed; margin:4px 0 6px}
.az-armoire td{border:2px solid #232f3e; padding:5px 6px; vertical-align:top; font-size:.82rem; height:4.6em}
.az-armoire th{font-size:.8rem; color:var(--douce); font-weight:600; width:2.2em}
.az-case{display:block; font-weight:800; font-size:.92rem}
.az-places{display:block; font-family:ui-monospace, Consolas, monospace; letter-spacing:2px; margin:1px 0 2px}
.az-ecran{border:3px solid #232f3e; border-radius:6px; padding:10px 14px; margin:4px 0 10px; font-size:.95rem}
.az-ecran b{font-size:1.02rem}
.az-loi{margin:4px 0 8px; padding:4px 10px; border-left:3px solid #555047}
.az-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents communs
export const DOC_SITE = doc('site', 'Le centre de Brétigny', 'Le centre de Brétigny', `${entete('Le centre de distribution de Brétigny-sur-Orge', 'Essonne (91), au sud de Paris')}
  <p>Amazon vend sur Internet et livre ses clients en France en un jour ouvré. Le centre de <b>Brétigny-sur-Orge</b> reçoit les produits des
    vendeurs, les range, prépare les commandes et les expédie.</p>
  <ul class="az-ul">
    <li><b>70 000 m²</b> sur <b>trois niveaux</b>, environ <b>4 500 salariés</b>, ouvert jour et nuit, 7 jours sur 7.</li>
    <li>Environ <b>4 000 robots</b> et <b>40 000 armoires mobiles</b> : <b>la marchandise vient à toi</b>. Le robot soulève l’armoire et
      l’apporte devant ton poste. Tu ne marches pas dans les allées.</li>
    <li>En moyenne <b>500 000 colis préparés par jour</b>.</li>
    <li>Au rangement, la case où tu poses l’article <b>devient son adresse</b> : un même article peut être dans plusieurs cases de plusieurs
      armoires (le <b>stockage aléatoire</b>).</li>
  </ul>
  <p>Le premier centre d’Amazon en France a ouvert à <b>Saran</b> (Loiret) en 2007. Le dixième, à <b>Beauvais</b> (Oise), a été inauguré le
    9 octobre 2026.</p>
  ${pied(`Document pédagogique. Sources : reportage « Les coulisses de la conso » et Clubic (10/07/2025) pour Brétigny ; KultureGeek (09/10/2026) pour Beauvais.`)}`);

export const DOC_EQUIPE = doc('equipe', 'L’équipe du poste', 'L’équipe', `${entete('L’équipe de ta zone', 'Prénoms imaginés pour l’exercice')}
  <table class="az-table"><thead><tr><th scope="col">Qui</th><th scope="col">Ce qu’il ou elle fait</th></tr></thead><tbody>
    ${Object.values(EQUIPE).map((p) => `<tr><td><b>${ech(p.nom)}</b><br><span class="az-st">${ech(p.metier)}</span></td><td>${ech(p.phrase)}</td></tr>`).join('')}
    <tr><td><b>Toi</b><br><span class="az-st">Stagiaire</span></td><td>Tu ranges les articles dans les armoires, puis tu prélèves et tu emballes les commandes.</td></tr>
  </tbody></table>
  ${pied('Équipe et prénoms CONSTRUITS pour l’exercice. Document pédagogique.')}`);

export const DOC_SECURITE = doc('securite', 'La sécurité au poste', 'La sécurité', `${entete('La sécurité au poste', 'À lire avant de prendre ton poste')}
  <ul class="az-ul">
    <li><b>Chaussures de sécurité</b> et gilet : avant d’entrer dans la zone, toujours.</li>
    <li>La <b>zone des robots</b> est fermée par une <b>barrière</b>. On n’y entre <b>jamais</b>. Un article est tombé de l’autre côté ? Tu
      appuies sur <b>« Aide »</b> : Théo s’en occupe, les robots s’arrêtent avant qu’il entre.</li>
    <li>Une boîte dépasse ou risque de tomber : tu ne fais <b>pas</b> partir l’armoire, tu préviens Théo.</li>
    <li>Un carton lourd : <b>jambes pliées, dos droit, carton près du corps</b>. Les articles de plus de ${KG_LOURD} kg vont dans les cases du bas.</li>
    <li>Tu ne grimpes jamais sur le poste ni sur l’armoire. Tu ne pousses jamais une armoire : c’est le robot qui la déplace.</li>
  </ul>
  <div class="az-loi"><p><b>Ce que dit la loi</b> (Code du travail) : l’employeur prend les mesures pour protéger la santé et la sécurité des
    salariés (article L4121-1) ; chaque salarié prend soin de sa sécurité et de celle des autres, selon sa formation (article L4122-1).</p></div>
  ${pied('Règles du poste CONSTRUITES pour l’exercice (la zone des robots fermée est réelle). Résumé de la loi, pas une citation. Document pédagogique.')}`);

export const DOC_REGLES = doc('regles', 'Ranger : les règles du poste', 'Les règles', `${entete('Ranger un article : les règles du poste', 'Le robot vient d’apporter l’armoire devant toi')}
  <ol class="az-ul">
    <li><b>La place</b> : chaque case a 3 places. Un petit article prend 1 place, un moyen 2, un grand 3. Choisis une case qui a assez de
      places libres (□ = une place libre).</li>
    <li><b>Jamais deux articles qui se ressemblent</b> dans la même case (deux coques, deux gourdes, deux t-shirts…) : au prélèvement, ton
      collègue pourrait se tromper.</li>
    <li><b>Lourd en bas</b> : un article de plus de ${KG_LOURD} kg va dans une case du bas (niveau A ou B).</li>
  </ol>
  <div class="az-regle"><b>Les gestes</b> : je scanne l’article, je le pose dans la case, je scanne la case. Le système enregistre alors
    l’<b>adresse</b> de l’article : le numéro de l’armoire et la case (par exemple <span class="az-mono">P-0000-B2</span>).</div>
  <p class="az-st">Un article abîmé ne se range pas : je le mets de côté pour Théo.</p>
  ${pied('Règles CONSTRUITES pour l’exercice (que l’emplacement devienne l’adresse est réel). Document pédagogique.')}`);

export const DOC_PRELEVER = doc('prelever', 'Prélever : les règles du poste', 'Prélever', `${entete('Prélever un article : les règles du poste', 'L’écran montre la case et la photo de l’article')}
  <ol class="az-ul">
    <li>Je regarde la <b>case</b> que montre l’écran et la <b>photo</b> de l’article.</li>
    <li>Je prends l’article et je le <b>compare à la photo</b> : la couleur, la taille, le modèle.</li>
    <li>Je le <b>scanne</b>, puis je le pose dans le <b>bac de sa commande</b> et j’appuie sur le bouton vert.</li>
  </ol>
  <div class="az-regle"><b>Quand ça ne va pas</b>, je ne prends rien et je signale à l’écran :
    <ul class="az-ul"><li>la case est <b>vide</b>, ou il y a moins d’articles que demandé ;</li>
      <li>ce n’est <b>pas l’article de la photo</b> (même s’il lui ressemble) ;</li>
      <li>l’article est <b>abîmé</b>.</li></ul>
    Théo vient régler le problème. Je ne prends <b>jamais</b> « celui qui ressemble le plus ».</div>
  ${pied('Règles CONSTRUITES pour l’exercice (la case montrée, la photo à l’écran et le bouton de confirmation sont réels). Document pédagogique.')}`);

export const DOC_FAITS = doc('faits', 'Amazon en chiffres', 'Les chiffres', `${entete('Amazon en chiffres', 'Des faits réels, datés')}
  <table class="az-table"><thead><tr><th scope="col">Le fait</th><th scope="col">D’où il vient</th></tr></thead><tbody>
    <tr><td>Pour le pic d’octobre à décembre 2026, Amazon recrute <b>${n(FAITS.saisonniers)} saisonniers</b> en France, dans <b>${n(FAITS.sites)} sites</b>,
      dont <b>${n(FAITS.saisonniersHdf)}</b> dans les Hauts-de-France.</td><td>Économie Matin, 01/10/2026</td></tr>
    <tr><td>À Brétigny : environ <b>${n(FAITS.robots)} robots</b>, <b>${n(FAITS.salaries)} salariés</b> et <b>${n(FAITS.colisJour)} colis</b> par jour en moyenne.</td>
      <td>« Les coulisses de la conso » et Clubic, 10/07/2025</td></tr>
    <tr><td>Fin 2023, la <b>CNIL</b> a infligé à Amazon France Logistique une amende de <b>32 millions d’euros</b> : elle jugeait trop intrusif le suivi,
      minute par minute, de l’activité des salariés par leur scanner.</td><td>CNIL, décision de décembre 2023 (presse de janvier 2024)</td></tr>
  </tbody></table>
  ${pied('Faits réels résumés pour l’exercice, avec leurs sources. Document pédagogique.')}`);

// ─────────────────────────────────────────── les documents qui dépendent du jeu
const places = (libre) => `${'■'.repeat(3 - libre)}${'□'.repeat(libre)}`;
export function htmlArmoire(A) {
  const lignes = ['D', 'C', 'B', 'A'].map((niv) => `<tr><th scope="row">${niv}</th>${[1, 2, 3].map((c) => {
    const C = A.cases[`${niv}${c}`];
    return `<td><span class="az-case">${niv}${c}</span><span class="az-places" aria-label="${C.libre} place${C.libre > 1 ? 's' : ''} libre${C.libre > 1 ? 's' : ''}">${places(C.libre)}</span>${C.dedans.length ? C.dedans.map((r) => ech(ARTICLES[r].nom)).join(', ') : '<i>vide</i>'}</td>`;
  }).join('')}</tr>`).join('');
  return `<p class="az-st">Armoire <b class="az-mono">${ech(A.no)}</b> — vue de face ; D en haut, A en bas ; ■ = place prise, □ = place libre</p>
    <table class="az-armoire"><thead><tr><th></th><th scope="col">1</th><th scope="col">2</th><th scope="col">3</th></tr></thead><tbody>${lignes}</tbody></table>`;
}
export const docArmoire = (A) => doc('armoire', typeof A === 'function' ? 'L’armoire devant toi' : `L’armoire ${A.no}`, 'L’armoire', (db) => `${entete(`L’armoire ${(typeof A === 'function' ? A(db) : A).no}`, 'Devant ton poste')}
  ${htmlArmoire(typeof A === 'function' ? A(db) : A)}${pied('Armoire et contenu CONSTRUITS pour l’exercice. Document pédagogique.')}`);
const etat = (ref, abimes) => (abimes.includes(ref) ? '<b>boîte écrasée, un coin ouvert</b>' : 'en bon état');
export function htmlBac(refs, abimes = []) {
  return `<table class="az-table"><thead><tr><th scope="col">Article</th><th scope="col">Taille</th><th class="az-d" scope="col">Poids</th><th scope="col">État</th></tr></thead><tbody>
    ${refs.map((r) => { const x = ARTICLES[r]; return `<tr><td>${ech(x.nom)}</td><td>${x.taille} (${x.place} place${x.place > 1 ? 's' : ''})</td><td class="az-d">${kg(x.kg)}</td><td>${etat(r, abimes)}</td></tr>`; }).join('')}
  </tbody></table>`;
}
export const docBac = (get) => doc('bac', 'Le bac à ranger', 'Le bac', (db) => { const J = get(db);
  return `${entete('Le bac à ranger', 'Les articles arrivés du quai de réception')}${htmlBac(J.refs, J.abimes || [])}${pied('Articles CONSTRUITS pour l’exercice. Document pédagogique.')}`; });
export function htmlInventaire(I) {
  return `<p>Le système dit : <b>${I.attendu} × ${ech(ARTICLES[I.ref].nom)}</b>, rangés dans ${I.cases.length} cases. Voici ce que tu vois dans chaque case :</p>
    <table class="az-table"><thead><tr><th scope="col">Adresse</th><th scope="col">Ce que tu vois dans la case</th></tr></thead><tbody>
    ${I.cases.map((c) => `<tr><td class="az-mono">${c.adr}</td><td>${c.vu.map(([r, q]) => `${q} × ${ech(ARTICLES[r].nom)}`).join(' ; ')}</td></tr>`).join('')}
    </tbody></table>`;
}
export const docInventaire = (get) => doc('inventaire', 'L’inventaire', 'L’inventaire', (db) => `${entete('Inventaire d’un article', 'Un même article, plusieurs cases')}
  ${htmlInventaire(get(db))}${pied('Quantités CONSTRUITES pour l’exercice. Document pédagogique.')}`);

// Le prélèvement : l'écran du poste (ce que demande le système) et ce que tu vois dans les cases.
export function htmlPrelevement(P) {
  return `<p class="az-st">Armoire <b class="az-mono">${ech(P.armoire)}</b> devant ton poste. L’écran montre chaque ligne, avec la photo de l’article.</p>
    <table class="az-table"><thead><tr><th scope="col">Ligne</th><th scope="col">L’écran demande</th><th scope="col">Case</th><th scope="col">Ce que tu vois dans la case</th></tr></thead><tbody>
    ${P.lignes.map((L) => `<tr><td>${L.n}</td><td>${L.qte} × ${ech(ARTICLES[L.ref].nom)}${L.bac ? `<br><span class="az-st">pour la commande du bac ${L.bac}</span>` : ''}</td><td class="az-mono">${L.case}</td>
      <td>${L.vu.length ? L.vu.map(([r, q]) => `${q} × ${ech(ARTICLES[r].nom)}`).join(' ; ') : '<i>la case est vide</i>'}${L.abime ? ' — <b>boîte écrasée, un coin ouvert</b>' : ''}</td></tr>`).join('')}
    </tbody></table>`;
}
export const docPrelevement = (get) => doc('prelevement', 'Le prélèvement', 'Le prélèvement', (db) => `${entete('Prélever pour les commandes', 'Ce que demande l’écran, ce que tu vois')}
  ${htmlPrelevement(get(db))}${pied('Commandes et contenu des cases CONSTRUITS pour l’exercice. Document pédagogique.')}`);

export const DOC_CARTONS = doc('cartons', 'Les cartons et la pesée', 'Les cartons', `${entete('Les cartons et la pesée', 'Au poste d’emballage')}
  <table class="az-table"><thead><tr><th scope="col">Carton</th><th scope="col">Dimensions intérieures</th><th class="az-d" scope="col">Poids vide</th></tr></thead><tbody>
    ${CARTONS.map((c) => `<tr><td><b>${ech(c.nom)}</b></td><td>${c.dim.join(' × ')} cm</td><td class="az-d">${kg(c.kg)}</td></tr>`).join('')}
  </tbody></table>
  <ul class="az-ul">
    <li>Le système désigne le <b>plus petit carton</b> où l’article entre. Tu peux prendre plus grand s’il le faut, <b>jamais plus petit</b>.</li>
    <li>Plusieurs articles d’une même commande : on les pose l’un sur l’autre, à plat.</li>
    <li>Un article <b>fragile</b> (verre, céramique) : tu le <b>cales</b> avec du papier.</li>
    <li>À la fin de la ligne, le colis est <b>pesé</b>. Le système connaît le poids attendu (articles + carton). Si l’écart dépasse
      <b>${TOLERANCE_G} g</b>, le colis <b>sort de la ligne</b> et part chez Théo : il manque peut-être un article, ou il y en a un de trop.</li>
    <li>Le <b>film plastique</b> va dans le bac à plastique, les <b>chutes de carton</b> dans la benne à carton : tout se recycle.</li>
    <li>Tu colles l’étiquette du colis : elle porte un <b>numéro</b>, pas le nom du client. Tu ne sais pas à qui part la commande.</li>
  </ul>
  ${pied('Cartons, dimensions et tolérance CONSTRUITS pour l’exercice (le carton désigné par le système et la pesée en fin de ligne sont réels). Document pédagogique.')}`);
export function htmlCommandes(E) {
  return `<table class="az-table"><thead><tr><th scope="col">Commande</th><th scope="col">Articles</th><th scope="col">Dimensions (cm)</th><th class="az-d" scope="col">Poids</th></tr></thead><tbody>
    ${E.commandes.map((c) => `<tr><td class="az-mono">${c.id}</td><td>${c.refs.map((r) => ech(ARTICLES[r].nom)).join('<br>')}</td><td>${c.refs.map((r) => ARTICLES[r].dim.join(' × ')).join('<br>')}</td>
      <td class="az-d">${c.refs.map((r) => kg(ARTICLES[r].kg)).join('<br>')}</td></tr>`).join('')}
    </tbody></table>`;
}
export function htmlPesees(E) {
  return `<table class="az-table"><thead><tr><th scope="col">Colis</th><th class="az-d" scope="col">Poids attendu</th><th class="az-d" scope="col">Poids lu sur la balance</th></tr></thead><tbody>
    ${E.pesees.map((p) => { const c = E.commandes.find((x) => x.id === p.id); return `<tr><td class="az-mono">${p.id}</td><td class="az-d">${kg(poidsAttendu(c.refs, cartonJuste(c.refs)))}</td><td class="az-d">${kg(p.lu)}</td></tr>`; }).join('')}
    </tbody></table>`;
}
export const docCommandes = (get) => doc('commandes', 'Les commandes à emballer', 'Les commandes', (db) => `${entete('Les commandes à emballer', 'Ton poste d’emballage')}
  ${htmlCommandes(get(db))}${pied('Commandes CONSTRUITES pour l’exercice. Document pédagogique.')}`);
export const docPesees = (get) => doc('pesees', 'La pesée', 'La pesée', (db) => `${entete('La pesée en fin de ligne', 'Les colis que tu as fermés')}
  ${htmlPesees(get(db))}${pied('Poids CONSTRUITS pour l’exercice. Document pédagogique.')}`);

// ─────────────────────────────────────────── les blocs de fiche partagés et leurs jalons
const CHOIX_CASES = CASES.map((c) => ({ v: c, lib: c }));
const COTE = { v: 'cote', lib: 'Je le mets de côté pour Théo' };
// Ranger : une liste par article. `avecCote` : la ligne « de côté » est offerte à TOUS les articles (rien ne dit lequel est abîmé).
export const blocsRangement = (refs, avecCote) => refs.map((r, i) => ({ type: 'liste', id: `case-${i + 1}`, lib: ARTICLES[r].nom, vide: 'Choisir…',
  manque: `la case de « ${ARTICLES[r].nom} »`, choix: avecCote ? [...CHOIX_CASES, COTE] : CHOIX_CASES }));
const pourquoi = { place: 'pas assez de places', ressemble: 'un article qui lui ressemble est déjà dans la case', lourd: 'trop lourd pour une case du haut',
  abime: 'abîmé : à mettre de côté', cote: 'en bon état : à ranger', case: 'case inconnue' };
export function jalonsRangement(get, { poids, groupe }) {
  return (get(null).refs).map((r, i) => ({ id: `case-${i + 1}`, titre: `Ranger : l’article n° ${i + 1}`, groupe, poids,
    titreBilan: (db) => `Ranger : « ${ARTICLES[get(db).refs[i]].nom} »`,
    attendu: (db) => { const J = get(db); return J.abimes && J.abimes.includes(J.refs[i]) ? 'de côté pour Théo (abîmé)'
      : `une case qui respecte les trois règles (pour cet article seul : ${casesJustes(J.armoire, J.refs[i]).join(', ')} ; les articles rangés avant lui comptent aussi)`; },
    juste: (v, db) => { const J = get(db); return jugerRangement(J.armoire, J.refs, J.refs.map((_, k) => v[`case-${k + 1}`]), J.abimes || [])[i] === null; } }));
}
export const pourquoiFaux = (J, v) => jugerRangement(J.armoire, J.refs, J.refs.map((_, k) => v[`case-${k + 1}`]), J.abimes || []).map((x) => (x ? pourquoi[x] : null));

// L'inventaire : le total compté et l'écart.
export const ECARTS = [{ v: 'manque', lib: 'Il en manque : je signale l’écart à Théo' }, { v: 'juste', lib: 'Le compte est juste' }, { v: 'trop', lib: 'Il y en a trop : je signale l’écart à Théo' }];
export const blocsInventaire = (I) => [
  { type: 'nombre', id: 'compte', lib: `Combien de « ${ARTICLES[I.ref].nom} » comptes-tu en tout ?`, unite: 'articles', min: 0, entier: true, manque: 'ton compte' },
  { type: 'choix', id: 'ecart', lib: 'Que fais-tu ?', colonne: true, manque: 'ce que tu fais', choix: ECARTS },
];
export const jalonsInventaire = (get, { compte: pc, ecart: pe, groupe }) => [
  { id: 'compte', titre: 'L’inventaire : le compte', groupe, poids: pc, attendu: (db) => `${compte(get(db))}`, juste: (v, db) => proche(v.compte, compte(get(db))) },
  { id: 'ecart', titre: 'L’inventaire : l’écart', groupe, poids: pe, attendu: (db) => ECARTS.find((x) => x.v === ecart(get(db))).lib, juste: (v, db) => v.ecart === ecart(get(db)) },
];

// Le prélèvement : ce que tu fais à chaque ligne.
export const blocsPrelevement = (P) => P.lignes.map((L) => ({ type: 'liste', id: `ligne-${L.n}`, lib: `Ligne ${L.n} : ${L.qte} × ${ARTICLES[L.ref].nom} (case ${L.case})`,
  vide: 'Choisir…', manque: `la ligne ${L.n}`, choix: ACTIONS }));
export const jalonsPrelevement = (get, { poids, groupe }) => get(null).lignes.map((L, i) => ({ id: `ligne-${i + 1}`, titre: `Prélever : la ligne ${i + 1}`, groupe, poids,
  attendu: (db) => ACTIONS.find((x) => x.v === actionJuste(get(db).lignes[i])).lib, juste: (v, db) => v[`ligne-${i + 1}`] === actionJuste(get(db).lignes[i]) }));

// L'emballage : le carton de chaque commande, les colis à caler, la pesée.
const CHOIX_CARTONS = CARTONS.map((c) => ({ v: c.id, lib: `${c.nom} (${c.dim.join(' × ')} cm)` }));
export const blocsCartons = (E) => E.commandes.map((c) => ({ type: 'liste', id: `carton-${c.id}`, lib: `Commande ${c.id}`, vide: 'Choisir…',
  manque: `le carton de la commande ${c.id}`, choix: CHOIX_CARTONS }));
export const jalonsCartons = (get, { poids, groupe }) => get(null).commandes.map((c, i) => ({ id: `carton-${i + 1}`, titre: `Emballer : le carton de la commande n° ${i + 1}`, groupe, poids,
  attendu: (db) => CARTONS.find((k) => k.id === cartonJuste(get(db).commandes[i].refs)).nom,
  juste: (v, db) => { const C = get(db).commandes[i]; return v[`carton-${C.id}`] === cartonJuste(C.refs); } }));
export const blocCaler = (E) => ({ type: 'cases', id: 'caler', titre: 'Les colis où tu mets du papier pour caler', choix: E.commandes.map((c) => ({ v: c.id, lib: `Commande ${c.id}` })) });
export const jalonCaler = (get, { poids, groupe }) => ({ id: 'caler', titre: 'Emballer : les articles fragiles calés', groupe, poids,
  attendu: (db) => get(db).commandes.filter((c) => aCaler(c.refs)).map((c) => c.id).join(', '),
  juste: (v, db) => { const L = get(db).commandes.filter((c) => aCaler(c.refs)).map((c) => c.id); return L.length > 0 && memes(v.caler || [], L); } });
export const PESEES = [{ v: 'part', lib: 'Le colis part vers le camion' }, { v: 'sortir', lib: 'Le colis sort de la ligne : il part chez Théo' }];
export const blocsPesees = (E) => E.pesees.map((p) => ({ type: 'choix', id: `pesee-${p.id}`, lib: `Colis ${p.id}`, manque: `la pesée du colis ${p.id}`, choix: PESEES }));
const peseeJuste = (E, p) => { const c = E.commandes.find((x) => x.id === p.id); return pesee(poidsAttendu(c.refs, cartonJuste(c.refs)), p.lu); };
export const jalonsPesees = (get, { poids, groupe }) => get(null).pesees.map((p, i) => ({ id: `pesee-${i + 1}`, titre: `La pesée du colis n° ${i + 1}`, groupe, poids,
  attendu: (db) => PESEES.find((x) => x.v === peseeJuste(get(db), get(db).pesees[i])).lib,
  juste: (v, db) => { const E = get(db); const p = E.pesees[i]; return v[`pesee-${p.id}`] === peseeJuste(E, p); } }));
export { peseeJuste };

// La sécurité : une situation par liste.
export const blocsSecurite = (cles) => cles.map((k, i) => ({ type: 'liste', id: `secu-${i + 1}`, lib: SECURITE[k].texte, vide: 'Choisir…', manque: `la situation ${i + 1}`,
  choix: SECURITE[k].choix }));
export const jalonsSecurite = (get, { poids, groupe }) => get(null).map((k, i) => ({ id: `secu-${i + 1}`, titre: `La sécurité : la situation n° ${i + 1}`, groupe, poids,
  attendu: (db) => { const s = SECURITE[get(db)[i]]; return s.choix.find((c) => c.v === s.juste).lib; },
  juste: (v, db) => v[`secu-${i + 1}`] === SECURITE[get(db)[i]].juste }));

// Les écogestes.
export const blocEcogestes = () => ({ type: 'cases', id: 'eco', titre: 'Ce que tu fais au poste d’emballage', choix: ECOGESTES.map((x) => ({ v: x.v, lib: x.lib })) });
export const jalonEcogestes = ({ poids, groupe }) => ({ id: 'eco', titre: 'Les écogestes', groupe, poids, attendu: ECOGESTES.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
  juste: (v) => memes(v.eco || [], ECOGESTES.filter((x) => x.juste).map((x) => x.v)) });

// ─────────────────────────────────────────── la banque « Avant de commencer » (CAP : les notions du scénario, jamais notée sauf en évaluation)
const q = (id, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'karima', doc: 'site', rubrique: 'preparation', enonce, choix, juste, retour });
export const BANQUE = [
  q('vient', 'À Brétigny, qui se déplace jusqu’au poste ?', [{ v: 'armoire', lib: 'L’armoire, portée par un robot' }, { v: 'moi', lib: 'Moi, dans les allées' },
    { v: 'client', lib: 'Le client' }], 'armoire', 'La marchandise vient à toi : tu restes au poste.'),
  q('aleatoire', 'Un même article peut être rangé…', [{ v: 'plusieurs', lib: 'dans plusieurs cases de plusieurs armoires' }, { v: 'fixe', lib: 'toujours à la même place' },
    { v: 'alpha', lib: 'par ordre alphabétique' }], 'plusieurs', 'C’est le stockage aléatoire : le système sait où est chaque article.'),
  q('adresse', 'Quand tu ranges un article, son adresse devient…', [{ v: 'case', lib: 'le numéro de l’armoire et la case' }, { v: 'nom', lib: 'le nom de l’article' },
    { v: 'prenom', lib: 'ton prénom' }], 'case', 'Tu scannes la case : le système enregistre l’adresse.'),
  q('barriere', 'La zone des robots…', [{ v: 'jamais', lib: 'on n’y entre jamais : elle est fermée par une barrière' }, { v: 'vite', lib: 'on peut y passer vite' },
    { v: 'pause', lib: 'sert à la pause' }], 'jamais', 'Les robots y roulent seuls. Pour un problème, on appuie sur « Aide ».'),
  q('solver', 'Le « problem solver », c’est…', [{ v: 'collegue', lib: 'le collègue qui règle les problèmes : article abîmé, case vide, mauvais poids' },
    { v: 'robot', lib: 'un robot' }, { v: 'client', lib: 'un client mécontent' }], 'collegue', 'Théo vient quand tu appuies sur « Aide ».'),
  q('carton', 'Le système te désigne un carton. Tu peux…', [{ v: 'grand', lib: 'prendre plus grand s’il le faut, jamais plus petit' },
    { v: 'petit', lib: 'prendre plus petit pour gagner de la place' }, { v: 'rien', lib: 'ne pas mettre de carton' }], 'grand', 'Plus petit, l’article ne rentre pas ou s’abîme.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'karima', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis « Le centre de Brétigny » à gauche et réponds à mes questions.',
  documents: ['site'], tirage: { preparation: 3 }, questions: BANQUE.map((x) => x.id), ...o });

// ─────────────────────────────────────────── la carte de France (19.1)
export const LOCALISER = {
  id: 'amazon-carte', libelle: 'Carte de France', titre: 'Où sont les centres ?', contours: FRANCE, vue: 'amazon-carte', poids: 1, groupe: 'La carte',
  objet: 'La carte',
  message: 'Place maintenant trois centres d’Amazon sur la carte de France : le nôtre, le premier ouvert en France et le dernier inauguré (menu « Carte de France »).',
  lieux: [
    { id: 'bretigny', lettre: 'B', type: 'entrepot', nom: 'Centre de distribution de Brétigny-sur-Orge', role: 'Le centre où tu fais ton stage.',
      ville: 'Brétigny-sur-Orge', dep: '91', region: '11', lonlat: [2.3058, 48.6114], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Évry-Courcouronnes', lonlat: [2.4400, 48.6290] }, { ville: 'Étampes', lonlat: [2.1614, 48.4344] }, { ville: 'Palaiseau', lonlat: [2.2453, 48.7146] }],
      reperes: [{ ville: 'Paris', lonlat: [2.3484, 48.8535] }], indice: 'Au sud de Paris.', etiq: 'b' },
    { id: 'saran', lettre: 'S', type: 'site', nom: 'Centre de Saran', role: 'Le premier centre d’Amazon en France (2007).',
      ville: 'Saran', dep: '45', region: '24', lonlat: [1.8750, 47.9500], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Montargis', lonlat: [2.7330, 47.9975] }, { ville: 'Pithiviers', lonlat: [2.2520, 48.1720] }, { ville: 'Gien', lonlat: [2.6300, 47.6880] }],
      reperes: [{ ville: 'Orléans', lonlat: [1.9093, 47.9029] }], indice: 'Juste au nord d’Orléans.', etiq: 'g' },
    { id: 'beauvais', lettre: 'V', type: 'site', nom: 'Centre de Beauvais', role: 'Le dixième centre, inauguré le 9 octobre 2026.',
      ville: 'Beauvais', dep: '60', region: '32', lonlat: [2.0807, 49.4295], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Compiègne', lonlat: [2.8261, 49.4179] }, { ville: 'Creil', lonlat: [2.4750, 49.2600] }, { ville: 'Noyon', lonlat: [3.0000, 49.5817] }],
      reperes: [{ ville: 'Paris', lonlat: [2.3484, 48.8535] }], indice: 'Au nord de Paris, près d’un aéroport.', etiq: 'h' },
  ],
  fin: { titre: 'Trois centres autour de Paris',
    texte: 'Saran, Brétigny, Beauvais : des centres près des grandes villes, pour livrer les clients en un jour. Les prénoms et les articles de tes séances sont imaginés pour l’exercice.' },
};
export { FRAGILES, regleCassee, adresse, FAITS };
