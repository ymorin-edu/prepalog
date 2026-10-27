// La Redoute — Quai 30, Wattrelos : l'UNIVERS commun des séances ENT-17.1 à 17.5 (Terminale, C2.2 « optimiser les préparations de commandes » par
// l'emballage, C3.3 « proposer des axes d'amélioration dans le cadre d'une démarche RSE ») et la FABRIQUE de leurs écrans. Cadrage :
// `docs/briefs/la-redoute/CADRAGE-la-redoute-tle.md` ; données : `contenus/la-redoute-donnees.js`.
//
// L'élève est adjoint(e) à la responsable d'exploitation du poste emballage et retours (rôle et prénoms CONSTRUITS ; l'entrepôt, sa mécanisation, la
// règle européenne sur le vide des colis et la loi AGEC sont réels). Deux gestes : choisir l'emballage juste de chaque commande et mesurer ce qu'on
// économise (17.1, 17.2) ; trier les retours vers la bonne filière et calculer le taux de remise en vente (17.3, 17.4 erreur induite) ; les deux en
// évaluation (17.5). Chaque compte rendu propose un axe d'amélioration (C3.3). Aucune vue nouvelle : documents joints, fiche, réponse par phrases,
// questions au fil. Claire tutoie l'élève.

import { catalogueSimple } from './entreprise-commun.js';
import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { FORMATS, FORMAT, CALAGE, VIDE_MAX, AVANT, ARTICLES, FILIERES, volArticles, emballage, retours, travailDeJulien, nombreFr } from './la-redoute-donnees.js';

// ─────────────────────────────────────────── l'univers
export const ENTREPRISE = {
  id: 'la-redoute',
  nom: 'La Redoute',
  sousTitre: 'Quai 30, Wattrelos (Nord) — emballage et retours',
  exercice: 'Emballer juste, trier les retours',
  logo: './contenus/trames/logos/la-redoute.svg',
};
export const VOCAB = { unit: 'article', unitPl: 'articles', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'quai30.example' };
// Un bleu nuit CONSTRUIT (pas la charte de la marque) : ni rouge ni vert dans la zone de travail.
export const THEME = { accent: '#2f4a6b', papier: true };
export const CATALOGUE = catalogueSimple(Object.entries(ARTICLES).map(([ref, a]) => ({ ref, designation: a.nom, marque: 'Article construit', categorie: a.souple ? 'Textile' : 'Rigide', fournisseur: 'F-LR', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-LR', brand: 'La Redoute', name: 'Quai 30', adr: '', cp: '', ville: 'Wattrelos', contact: '', tel: '', email: 'quai30@quai30.example', delai: 1, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Quai 30, l’entrepôt de La Redoute à Wattrelos (environ 42 000 m², mécanisé, exploité par ID Logistics), la règle européenne '
  + 'sur le vide des colis (règlement (UE) 2025/40, à partir de 2030) et la loi AGEC. Construits : les formats d’emballage, les articles, les commandes, '
  + 'les retours, les règles du poste et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  claire: { nom: 'Claire', role: 'responsable d’exploitation, emballage et retours (ta responsable)', appel: 'Claire' },
  julien: { nom: 'Julien', role: 'opérateur au poste retours', appel: 'Julien' },
};
const CLAIRE = { nom: 'Claire, responsable d’exploitation', mail: 'claire@quai30.example' };
export const MAIL_CLAIRE = CLAIRE.mail;
export const PERSONNES = { claire: EQUIPE.claire, julien: EQUIPE.julien };

// ─────────────────────────────────────────── aides
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pied = (t) => `<p class="lr-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace('%', '').replace(/g$/i, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
const memes = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const des = (cmd) => cmd.map((a) => ARTICLES[a].nom).join(' + ');
const fmtNom = (f) => FORMAT[f].nom.toLowerCase();

export const STYLE = `
--douce:#555047;
.lr-doc{padding:14px 18px 0}
.lr-doc p{margin:0 0 8px}
.lr-t{margin:0; font-size:1.08rem; font-weight:800}
.lr-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.lr-ul{margin:4px 0 8px; padding-left:20px; font-size:.92rem}
.lr-ul li{margin:4px 0}
.lr-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.lr-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.lr-table th, .lr-table td{border-bottom:1px solid #d6d0c3; padding:4px 6px; text-align:left; vertical-align:top}
.lr-table th{color:var(--douce); font-weight:600}
.lr-table .lr-d{text-align:right; white-space:nowrap}
.lr-table th.lr-d{white-space:normal}
.lr-doc{overflow-x:auto}
.lr-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.lr-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents
function docPoste(D, texte) {
  return { id: 'poste', titre: 'Ton poste', court: 'Ton poste',
    html: `<article class="lr-doc" aria-label="Ton poste">
    <p class="lr-t">Ton poste</p>
    <p class="lr-st">Quai 30 — Wattrelos (Nord) — ${ech(D.jour)}</p>
    <p>Tu es adjoint(e) à <b>Claire</b>, la responsable d’exploitation du poste <b>emballage et retours</b>. Tu organises le travail, tu mesures, et tu
      proposes des améliorations : moins de carton, moins de vide transporté, moins d’articles perdus.</p>
    ${texte}
    <p><b>Ce qui est réel</b> : Quai 30 est l’entrepôt de La Redoute à Wattrelos, environ 42 000 m², pour la mode et les petits articles. Il est très
      mécanisé (stockeurs automatiques, navettes, tri automatique, postes où la marchandise vient à l’opérateur) : jusqu’à 3 500 commandes par heure,
      préparées en moins de deux heures, livrées le lendemain en France. Depuis 2025, ID Logistics, qui l’exploite, y sert aussi d’autres marques.</p>
    ${pied(`Document pédagogique. ${MENTION}`)}
  </article>` };
}
const docCommandes = (D) => ({ id: 'commandes', titre: 'Les commandes à emballer', court: 'Les commandes',
  html: `<article class="lr-doc" aria-label="Les commandes à emballer">
    <p class="lr-t">Commandes à emballer — ${ech(D.jour)}</p>
    <p class="lr-st">Une commande = un colis</p>
    <table class="lr-table"><thead><tr><th scope="col">Commande</th><th scope="col">Articles</th></tr></thead>
      <tbody>${D.commandes.map(([c, L]) => `<tr><td class="lr-mono">${c}</td><td>${ech(des(L))}</td></tr>`).join('')}</tbody></table>
    ${pied('Commandes CONSTRUITES pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });
const docArticles = () => ({ id: 'articles', titre: 'Les articles', court: 'Les articles',
  html: `<article class="lr-doc" aria-label="Les articles">
    <p class="lr-t">Les articles : volume et nature</p>
    <p class="lr-st">Volume plié ou dans sa boîte, en litres</p>
    <table class="lr-table"><thead><tr><th scope="col">Article</th><th class="lr-d" scope="col">Volume</th><th scope="col">Nature</th></tr></thead>
      <tbody>${Object.values(ARTICLES).map((a) => `<tr><td>${ech(a.nom)}</td><td class="lr-d">${n(a.litres)} L</td><td>${a.souple ? 'souple' : a.fragile ? 'rigide, <b>fragile</b>' : 'rigide'}</td></tr>`).join('')}</tbody></table>
    ${pied('Articles et volumes CONSTRUITS pour l’exercice. Document pédagogique.')}
  </article>` });
const docRegleEmballage = () => ({ id: 'regle-emballage', titre: 'La règle d’emballage', court: 'Règle emballage',
  html: `<article class="lr-doc" aria-label="Règle d’emballage">
    <p class="lr-t">La règle d’emballage du poste</p>
    <table class="lr-table"><thead><tr><th scope="col">Format</th><th class="lr-d" scope="col">Volume</th><th class="lr-d" scope="col">Poids de l’emballage</th></tr></thead>
      <tbody>${FORMATS.map((f) => `<tr><td>${ech(f.nom)}</td><td class="lr-d">${f.litres} L</td><td class="lr-d">${f.grammes} g</td></tr>`).join('')}</tbody></table>
    <ol class="lr-ul">
      <li><b>Volume utile</b> = volume des articles + <b>${CALAGE} L de calage par article fragile</b>.</li>
      <li>On prend le <b>plus petit</b> format dont le volume est au moins égal au volume utile.</li>
      <li>La <b>pochette</b> seulement si <b>tous</b> les articles sont souples.</li>
    </ol>
    <p class="lr-regle"><b>Taux de vide</b> = (volume du format − volume des articles) ÷ volume du format × 100. Le calage compte comme du vide.<br>
      Jusqu’ici, le poste mettait tout en <b>carton ${AVANT}</b> (carton L si le M est trop petit).</p>
    <p class="lr-st">Exemple : un pull (3 L) et un vase (4 L, fragile) : volume utile 3 + 4 + 2 = 9 L → carton M (16 L) ; vide (16 − 7) ÷ 16 × 100 = 56,25 %.</p>
    ${pied('Formats et règle CONSTRUITS pour l’exercice ; la définition du taux de vide est celle du règlement (UE) 2025/40. Document pédagogique.')}
  </article>` });
const docRetours = (D) => ({ id: 'retours', titre: 'Les retours du jour', court: 'Les retours',
  html: `<article class="lr-doc" aria-label="Les retours du jour">
    <p class="lr-t">Retours clients ouverts — ${ech(D.jour)}</p>
    <p class="lr-st">Ce que voit l’opérateur à l’ouverture du colis</p>
    <table class="lr-table"><thead><tr><th scope="col">Retour</th><th scope="col">Article</th><th scope="col">État constaté</th></tr></thead>
      <tbody>${D.retours.map(([r, a, , vu]) => `<tr><td class="lr-mono">${r}</td><td>${ech(ARTICLES[a].nom)}</td><td>${ech(vu)}</td></tr>`).join('')}</tbody></table>
    ${pied('Retours CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });
const docRegleRetours = () => ({ id: 'regle-retours', titre: 'La règle de tri des retours', court: 'Règle retours',
  html: `<article class="lr-doc" aria-label="Règle de tri des retours">
    <p class="lr-t">La règle de tri des retours</p>
    <table class="lr-table"><thead><tr><th scope="col">Ce qu’on constate</th><th scope="col">Filière</th></tr></thead><tbody>
      <tr><td>Étiquette attachée, article neuf</td><td><b>${FILIERES.stock}</b> (revendu tel quel)</td></tr>
      <tr><td>Sans étiquette (essayé), aucun défaut</td><td><b>${FILIERES.recond}</b> : contrôle, repassage, nouvel emballage, puis revente</td></tr>
      <tr><td>Petit défaut (tache légère, couture décousue)</td><td><b>${FILIERES.don}</b></td></tr>
      <tr><td>Hors d’usage (déchiré, troué, brûlé)</td><td><b>${FILIERES.recyclage}</b> (filière textile)</td></tr>
    </tbody></table>
    <p class="lr-regle">On ne détruit <b>jamais</b> un article. <b>Taux de remise en vente</b> = (remis en stock + reconditionnés) ÷ nombre de retours × 100,
      arrondi au dixième. Un don n’est pas une vente.</p>
    ${pied('Règle CONSTRUITE pour l’exercice. Document pédagogique.')}
  </article>` });
function docTriJulien(D) {
  return { id: 'tri-julien', titre: `Le tri de ${D.collegue}`, court: `Le tri de ${D.collegue}`,
    html: `<article class="lr-doc" aria-label="Tri de ${ech(D.collegue)}">
    <p class="lr-t">Fiche de tri — poste retours</p>
    <p class="lr-st">Remplie par ${ech(D.collegue)} ce matin</p>
    <table class="lr-table"><thead><tr><th scope="col">Retour</th><th scope="col">Filière</th></tr></thead>
      <tbody>${D.retours.map(([r]) => `<tr><td class="lr-mono">${r}</td><td>${ech(FILIERES[D.triCollegue[r]])}</td></tr>`).join('')}</tbody></table>
    <p class="lr-st">Note de ${ech(D.collegue)} : « Taux de remise en vente : ${n(travailDeJulien(D).taux)} %. »</p>
    ${pied('Fiche CONSTRUITE pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
}
const docDroit = () => ({ id: 'droit', titre: 'Le droit : emballages et invendus', court: 'Le droit',
  html: `<article class="lr-doc" aria-label="Le droit : emballages et invendus">
    <p class="lr-t">Le droit : emballages et invendus</p>
    <ul class="lr-ul">
      <li><b>Règlement (UE) 2025/40</b> sur les emballages, article 24 : à partir du <b>1er janvier 2030</b>, un emballage de commerce électronique ne devra pas
        avoir plus de <b>${VIDE_MAX} % de vide</b>. Le calage (papier, coussins d’air) compte comme du vide.</li>
      <li><b>Loi AGEC</b> (anti-gaspillage pour une économie circulaire, 2020) : il est interdit de <b>détruire</b> les invendus non alimentaires (vêtements
        compris) ; on les réemploie, on les donne ou on les recycle.</li>
      <li>La <b>RSE</b> (responsabilité sociétale des entreprises) : l’entreprise tient compte des effets de son activité sur l’environnement et la société,
        au-delà de ce que la loi impose.</li>
    </ul>
    ${pied('Résumé pour l’exercice (pas une citation des textes). Document pédagogique.')}
  </article>` });

// ─────────────────────────────────────────── la fiche
const nb = (id, lib, unite, manque) => ({ type: 'nombre', id, lib, unite, min: 0, manque });
function blocsEmb(D, num) {
  const fmts = FORMATS.map((f) => ({ v: f.id, lib: f.nom }));
  return [{ type: 'cadre', titre: `${num}. L’emballage des commandes`, large: true, blocs: [
    ...D.commandes.map(([c, L]) => ({ type: 'liste', id: `fmt-${c}`, lib: `${c} — ${des(L)}`, manque: `le format de ${c}`, choix: fmts })),
    ...D.vide.map((c) => nb(`vide-${c}`, `Taux de vide de ${c}`, '%', `le taux de vide de ${c}`)),
    nb('apres', 'Poids total des emballages avec tes formats', 'g', 'le poids des emballages'),
    nb('gain', `Emballage économisé par rapport au carton ${AVANT} pour tout`, 'g', 'l’emballage économisé'),
  ] }];
}
function blocsRet(D, num) {
  const fils = Object.entries(FILIERES).map(([v, lib]) => ({ v, lib }));
  return [{ type: 'cadre', titre: `${num}. Le tri des retours`, large: true, blocs: [
    ...D.retours.map(([r, a, , vu]) => ({ type: 'liste', id: `fil-${r}`, lib: `${r} — ${ARTICLES[a].nom} : ${vu}`, manque: `la filière de ${r}`, choix: fils })),
    nb('taux', 'Taux de remise en vente (arrondi au dixième)', '%', 'le taux de remise en vente'),
  ] }];
}
function blocsJulien(D, num) {
  return [{ type: 'cadre', titre: `${num}. Le tri de ${D.collegue}`, large: true, blocs: [
    { type: 'cases', id: 'erreurs', titre: `Les retours que ${D.collegue} a envoyés dans la mauvaise filière`, choix: D.retours.map(([r, a]) => ({ v: r, lib: `${r} — ${ARTICLES[a].nom}` })) },
    { type: 'choix', id: 'cause', lib: `Qu’est-ce qui ne va pas dans son taux de ${n(travailDeJulien(D).taux)} % ?`, colonne: true, manque: 'son taux', choix: [
      { v: 'don', lib: 'Il a compté les dons comme des ventes' },
      { v: 'diviseur', lib: 'Il a divisé par le nombre d’articles remis en stock' },
      { v: 'juste', lib: 'Rien : son taux est juste' }] },
    nb('taux', 'Le vrai taux de remise en vente (arrondi au dixième)', '%', 'le vrai taux'),
  ] }];
}

// ─────────────────────────────────────────── l'état de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};

// ─────────────────────────────────────────── les phrases (de l'élève à Claire : tu poli)
function phrases(D, K, prenom) {
  const id = `compte-rendu-${D.code.slice(4).replace('.', '')}`;
  const salut = { id: 'salutation', choix: ['Bonjour Claire,', 'Salut Claire !!', 'Coucou,'], juste: 0 };
  const fin = { id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 };
  const lignes = [salut];
  if (K.emb) {
    const E = emballage(D);
    const grammes = (a, b) => `Avec mes formats, on passe de ${n(a)} g à ${n(b)} g d’emballage : ${n(a - b)} g de moins sur ces ${D.commandes.length} colis.`;
    const plus = D.commandes.reduce((t, [c]) => t + FORMAT[E.formats[c] === 'pochette' ? 'S' : E.formats[c]].grammes, 0);
    lignes.push({ id: 'gain', choix: [grammes(E.avant, E.apres), grammes(E.avant, plus), grammes(E.apres + E.gain * 2, E.apres)], juste: 0 });
    const c0 = D.vide[D.vide.length - 1], cmd = D.commandes.find((x) => x[0] === c0)[1], f = FORMAT[E.formats[c0]];
    const videPar = (v) => `${c0} : ${n(v)} % de vide, ${E.vides[c0] > VIDE_MAX ? 'au-delà de' : 'dans'} la limite de ${VIDE_MAX} % qui s’appliquera en 2030.`;
    const surArticles = Math.round(((f.litres - volArticles(cmd)) / volArticles(cmd)) * 10000) / 100;
    const sansCalage = Math.round(((f.litres - (volArticles(cmd) + CALAGE * cmd.filter((a) => ARTICLES[a].fragile).length)) / f.litres) * 10000) / 100;
    const faux2 = sansCalage !== E.vides[c0] ? sansCalage : Math.round((100 - E.vides[c0]) * 100) / 100;
    lignes.push({ id: 'vide', choix: [videPar(E.vides[c0]), videPar(surArticles), videPar(faux2)], juste: 0 });
    lignes.push({ id: 'axe-emballage', choix: [
      'Je propose d’afficher la règle au poste et de choisir le format à chaque commande, plutôt qu’un carton M pour tout.',
      'Je propose de tout mettre en carton L : plus besoin de réfléchir, et rien ne s’abîme.',
      'Je propose de remplir le vide avec plus de papier de calage pour que les colis soient bien pleins.'], juste: 0 });
  }
  if (K.ret) {
    const R = retours(D);
    const nbF = (k, f = R.filieres) => D.retours.filter(([r]) => f[r] === k).length;
    const tri = (a, b, c, d) => `Sur ${D.retours.length} retours : ${a} remis en stock, ${b} reconditionné${b > 1 ? 's' : ''}, ${c} donné${c > 1 ? 's' : ''}, ${d} recyclé${d > 1 ? 's' : ''}.`;
    const [s, r, dn, rc] = ['stock', 'recond', 'don', 'recyclage'].map((k) => nbF(k));
    lignes.push({ id: 'tri', choix: [tri(s, r, dn, rc), tri(s + r, 0, dn, rc), tri(s, r, 0, dn + rc)], juste: 0 });
    if (D.collegue) {
      const J = travailDeJulien(D);
      lignes.push({ id: 'erreur', choix: [`${D.collegue} a mal trié ${liste(J.faux)}, et il a compté les dons comme des ventes.`,
        `Le tri de ${D.collegue} est juste, seul son taux est faux.`, `${D.collegue} a mal trié ${J.faux[0]} ; son taux est juste.`], juste: 0 });
    }
    const pct = (x) => `Taux de remise en vente : ${n(x)} %.`;
    lignes.push({ id: 'taux', choix: [pct(R.taux), pct(Math.round(((s + r + dn) / D.retours.length) * 1000) / 10), pct(Math.round((s / D.retours.length) * 1000) / 10)], juste: 0 });
    lignes.push({ id: 'axe-retours', choix: [
      'Je propose de faire réparer les petits défauts (coutures) pour qu’ils repartent en vente au lieu du don.',
      'Je propose de jeter les articles tachés : on gagnera du temps au tri.',
      'Je propose de remettre en stock tous les articles sans défaut, étiquette ou non, sans les contrôler.'], juste: 0 });
  }
  lignes.push(fin);
  return { id, melanger: true, lignes };
}

// ─────────────────────────────────────────── la fabrique d'une séance
// D : le jeu ; O : { id, K ({ emb, ret }), poids, titre, consigne, poste, objet, etape, questions }.
export function seance(D, O) {
  const K = O.K;
  const suffixe = D.code.slice(4).replace('.', '');
  const FICHE_ID = `fiche-${suffixe}`, VOLET_ID = `lr-${suffixe}`;
  const P = phrases(D, K, '{prenom}');
  const PHRASES_ID = P.id;
  const E = K.emb ? emballage(D) : null, R = K.ret ? retours(D) : null;

  const docs = [docPoste(D, O.poste)];
  if (K.emb) docs.push(docCommandes(D), docArticles(), docRegleEmballage());
  if (K.ret) docs.push(docRetours(D), ...(D.collegue ? [docTriJulien(D)] : []), docRegleRetours());
  docs.push(docDroit());
  const DOCUMENTS = docs;
  let num = 1;
  const blocs = [];
  if (K.emb) blocs.push(...blocsEmb(D, num++));
  if (K.ret) blocs.push(...(D.collegue ? blocsJulien(D, num++) : blocsRet(D, num++)));
  const surFicheDocs = DOCUMENTS.map((d) => d.id).filter((x) => x !== 'poste' && x !== 'droit');
  const FICHE = {
    id: FICHE_ID, libelle: 'Fiche de travail', titre: O.titre, sousTitre: 'À gauche : les documents et les règles du poste. Calcule au brouillon ou à la calculatrice.',
    documents: surFicheDocs, largeurDocs: 1.3, defile: true, bouton: 'Ouvrir la fiche de travail', blocs,
    envoi: { bouton: 'Envoyer la fiche à Claire', a: 'Claire', suite: 'Écris-lui maintenant ton compte rendu, dans la Messagerie.' },
  };
  const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decale || 0), from: CLAIRE.nom, fromMail: CLAIRE.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
  const VOLET = {
    id: VOLET_ID,
    semer: (prenom) => ({ mails: [mail(prenom, O.objet, `Bonjour ${prenom} !\n\n${O.consigne}\n\nClaire`, { decale: -3600e3, extra: { pieces: DOCUMENTS.map((d) => d.id).filter((x) => x !== 'droit'), ouvreFiche: FICHE_ID } })] }),
    declencheurs: [
      { id: 'compte', quand: apresFiche(FICHE_ID),
        semer: (prenom) => ({ mails: [mail(prenom, 'Ton compte rendu', `Bonjour ${prenom},\n\nJ’ai ta fiche. Écris-moi en quelques lignes ce que tu as trouvé `
          + 'et ce que tu proposes d’améliorer : je le présente au point RSE de vendredi.\n\nClaire', { extra: { phrases: phrases(D, K, prenom) } })] }) },
      { id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye,
        semer: (prenom) => ({ mails: [mail(prenom, 'Merci', `Merci ${prenom}. Je regarde ta fiche et ton compte rendu.\n\nClaire`, { decale: 1000 })] }) },
    ],
  };

  // ── les jalons
  const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
  const W = O.poids;
  const G = { emb: 'L’emballage', ret: 'Les retours', compte: 'Le compte rendu' };
  const surFiche = (id, titre, groupe, juste, poids = W[id]) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_ID}`,
    verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return juste(valeursDe(db, FICHE_ID)) ? ok : ko; } });
  const proche = (k, attendu) => (v) => Math.abs(lireNombre(v[k]) - attendu) < 0.051;
  const ETAPES = [];
  if (K.emb) {
    for (const [c] of D.commandes) ETAPES.push(surFiche(`fmt-${c}`, `${c} : son emballage`, G.emb, (v) => v[`fmt-${c}`] === E.formats[c], W.format));
    for (const c of D.vide) ETAPES.push(surFiche(`vide-${c}`, `Le taux de vide de ${c}`, G.emb, proche(`vide-${c}`, E.vides[c]), W.vide));
    ETAPES.push(surFiche('apres', 'Le poids des emballages', G.emb, proche('apres', E.apres)));
    ETAPES.push(surFiche('gain', 'L’emballage économisé', G.emb, proche('gain', E.gain)));
  }
  if (K.ret) {
    if (D.collegue) {
      const J = travailDeJulien(D);
      ETAPES.push(surFiche('erreurs', `Les erreurs de tri de ${D.collegue}`, G.ret, (v) => Array.isArray(v.erreurs) && memes(v.erreurs, J.faux)));
      ETAPES.push(surFiche('cause', `Ce qui ne va pas dans son taux`, G.ret, (v) => v.cause === 'don'));
    } else {
      for (const [r] of D.retours) ETAPES.push(surFiche(`fil-${r}`, `${r} : sa filière`, G.ret, (v) => v[`fil-${r}`] === R.filieres[r], W.filiere));
    }
    ETAPES.push(surFiche('taux', 'Le taux de remise en vente', G.ret, proche('taux', R.taux)));
  }
  const cles = P.lignes.map((l) => l.id).filter((x) => x !== 'salutation' && x !== 'fin');
  ETAPES.push({ id: 'compte-rendu', titre: 'Le compte rendu à Claire', groupe: G.compte, poids: W['compte-rendu'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return cles.every((l) => r.justes.includes(l)) ? ok : ko; } });
  const manque = ETAPES.filter((e) => typeof e.poids !== 'number');
  if (manque.length) throw new Error(`${D.code} : jalon sans poids (${manque.map((e) => e.id).join(', ')})`);

  const ficheFaite = (db) => envoyee(db, FICHE_ID);
  const rendu = (db) => phrasesJustes(db, PHRASES_ID).envoye;
  const PASTILLES = [{ libelle: 'La fiche', fait: ficheFaite }, { libelle: 'Le compte rendu', fait: rendu }];
  const SUITE = [{ vue: 'fiche', libelle: 'La fiche de travail', fait: ficheFaite }, { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu à Claire', fait: rendu }];
  const ACCUEIL = {
    titre: O.titre, kpis: ['mail'],
    etapes: [
      ['Lire le message de Claire', 'Menu Messagerie. Les documents sont joints, avec les règles du poste.'],
      ['① La fiche de travail', O.etape],
      ['② Le compte rendu', 'Réponds à Claire, une phrase par ligne, avec ta proposition d’amélioration.'],
      ['Bon à savoir', MENTION],
    ],
  };
  const OPTIONS = { menu: [], exercice: O.titre, sansTrame: 'Tout se fait à l’écran', documents: DOCUMENTS, documentsStyle: STYLE, fiches: [FICHE],
    pastilles: PASTILLES, suite: SUITE, equipe: EQUIPE, ...(O.questions ? { questions: O.questions } : {}) };
  return { ID: O.id, FICHE_ID, PHRASES_ID, VOLET_ID, E, R, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS };
}

// ─────────────────────────────────────────── la banque « Avant de commencer » (commune aux cinq séances)
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'claire', doc, rubrique, enonce, choix, juste, retour });
export const BANQUE = [
  q('vide', 'preparation', 'poste', 'Un carton de 16 L contient un pull de 3 L. Que transporte-t-on surtout ?',
    [{ v: 'air', lib: 'De l’air : plus de 80 % du carton est vide' }, { v: 'pull', lib: 'Le pull' }, { v: 'calage', lib: 'Du calage utile' }], 'air',
    'Un colis trop grand, c’est plus de carton, plus de calage et moins de colis par camion.'),
  q('pochette', 'preparation', 'poste', 'Pourquoi met-on un T-shirt dans une pochette plutôt que dans un carton ?',
    [{ v: 'souple', lib: 'Il est souple et ne casse pas : la pochette suffit et pèse bien moins' }, { v: 'joli', lib: 'C’est plus joli' }, { v: 'cher', lib: 'La pochette est plus solide' }], 'souple',
    'On adapte l’emballage au produit : pas de carton pour ce qui ne craint rien.'),
  q('retour', 'preparation', 'poste', 'Un client renvoie une robe essayée, sans étiquette, sans défaut. On la…',
    [{ v: 'controle', lib: 'contrôle et la prépare pour la revendre' }, { v: 'jette', lib: 'jette' }, { v: 'stock', lib: 'remet en stock telle quelle, sans regarder' }], 'controle',
    'Un article essayé repart en vente après contrôle : c’est le reconditionnement.'),
  q('rse', 'preparation', 'poste', 'La RSE, c’est…',
    [{ v: 'effets', lib: 'tenir compte des effets de son activité sur l’environnement et la société' }, { v: 'pub', lib: 'une publicité' }, { v: 'taxe', lib: 'une taxe sur les colis' }], 'effets',
    'Responsabilité sociétale des entreprises : l’entreprise s’améliore au-delà de ce que la loi impose.'),
  q('agec', 'droit', 'droit', 'Un pull invendable a un petit trou. Que permet la loi AGEC ?',
    [{ v: 'donner', lib: 'Le donner, le faire réemployer ou le recycler, mais pas le détruire' }, { v: 'bruler', lib: 'Le brûler' }, { v: 'tout', lib: 'Tout, c’est l’entreprise qui décide' }], 'donner',
    'Depuis la loi AGEC, détruire un invendu non alimentaire est interdit.'),
  q('ppwr', 'droit', 'droit', 'À partir de 2030, un colis de commerce en ligne ne pourra pas avoir plus de…',
    [{ v: '50', lib: '50 % de vide' }, { v: '10', lib: '10 % de vide' }, { v: '90', lib: '90 % de vide' }], '50',
    'Règlement européen sur les emballages (2025/40), article 24 : 50 % de vide au plus, calage compris.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'claire', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de t’y mettre, regarde les documents à gauche et réponds à mes questions.',
  documents: ['poste', 'droit'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
