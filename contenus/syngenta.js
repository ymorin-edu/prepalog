// Syngenta — ranger des produits dangereux à l'usine d'Aigues-Vives : l'UNIVERS commun des séances ENT-15.1 à 15.4 (1re, C3.1 « adapter le processus
// logistique selon le type de produit ou de flux » et C1.5 « mettre en stock les produits ») et la FABRIQUE de leurs écrans. Cadrage :
// `docs/briefs/syngenta/CADRAGE-syngenta-1re.md` ; données : `contenus/syngenta-donnees.js`.
//
// L'élève est magasinier(ère) au magasin des produits finis de l'usine (le magasin, ses cellules et ses règles sont CONSTRUITS ; l'usine, son classement
// Seveso seuil haut et ses produits liquides phytosanitaires sont réels). Les palettes arrivent des lignes de conditionnement : il lit les pictogrammes
// de chaque produit, choisit la cellule (ou la zone d'attente quand la cellule est pleine), calcule la rétention nécessaire et rend compte à Karim,
// le responsable du magasin (construit). Aucune vue nouvelle : documents joints, fiche, réponse par phrases, questions au fil. Karim tutoie l'élève.

import { catalogueSimple } from './entreprise-commun.js';
import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { PICTOS, CELLULES, CELLULE, ATTENTE, PRODUIT, PRODUITS, bilan, travailDeLucas, litres, nombreFr } from './syngenta-donnees.js';

// ─────────────────────────────────────────── l'univers
export const ENTREPRISE = {
  id: 'syngenta',
  nom: 'Syngenta',
  sousTitre: 'Usine d’Aigues-Vives (Gard) — magasin des produits finis',
  exercice: 'Ranger des produits dangereux',
  logo: './contenus/trames/logos/syngenta.svg',
};
export const VOCAB = {
  unit: 'bidon', unitPl: 'bidons',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'syngenta.example',
};
// Un bleu ardoise CONSTRUIT : la charte de Syngenta n'est pas reprise (seul le logo l'est) ; ni rouge (« faux ») ni vert (« juste »).
export const THEME = { accent: '#46586b', papier: true };
export const CATALOGUE = catalogueSimple(PRODUITS.map((p) => ({ ref: p.ref, designation: p.nom, marque: 'Syngenta (produit construit)', categorie: 'Phytosanitaire', fournisseur: 'F-SYN', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-SYN', brand: 'Syngenta', name: 'Lignes de conditionnement de l’usine', adr: '', cp: '', ville: 'Aigues-Vives', contact: '', tel: '',
  email: 'conditionnement@syngenta.example', delai: 0, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : l’usine Syngenta d’Aigues-Vives (Gard), classée Seveso seuil haut, qui formule et conditionne environ 400 produits phytosanitaires liquides '
  + '(environ 25 millions de litres par an), et les pictogrammes de danger. Construits : le magasin, ses cellules et leurs règles, les produits, les palettes, les volumes et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  karim: { nom: 'Karim', role: 'responsable du magasin des produits finis (ton responsable)', appel: 'Karim' },
  lucas: { nom: 'Lucas', role: 'magasinier de l’équipe du matin', appel: 'Lucas' },
};
const KARIM = { nom: 'Karim, responsable du magasin', mail: 'karim@syngenta.example' };
export const MAIL_KARIM = KARIM.mail;
export const PERSONNES = { karim: EQUIPE.karim, lucas: EQUIPE.lucas };

// ─────────────────────────────────────────── aides
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pied = (t) => `<p class="sy-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(/l$/i, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
const memes = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const nomCellule = (c) => (c === ATTENTE ? 'zone d’attente du quai' : CELLULE[c].nom.replace(' — ', ' (') + ')');
const court = (c) => (c === ATTENTE ? 'zone d’attente' : `cellule ${c.slice(1)}`);
const pictoHtml = (p) => `<span class="sy-picto" title="${ech(PICTOS[p].nom)}"><img src="./contenus/images/syngenta/${p.toLowerCase()}.png" alt="" width="30" height="30"> ${p}</span>`;

export const STYLE = `
--douce:#555047;
.sy-doc{padding:14px 18px 0}
.sy-doc p{margin:0 0 8px}
.sy-t{margin:0; font-size:1.08rem; font-weight:800}
.sy-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.sy-ul{margin:4px 0 8px; padding-left:20px; font-size:.92rem}
.sy-ul li{margin:4px 0}
.sy-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.sy-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.sy-table th, .sy-table td{border-bottom:1px solid #d6d0c3; padding:4px 6px; text-align:left; vertical-align:top}
.sy-table th{color:var(--douce); font-weight:600}
.sy-table .sy-d{text-align:right; white-space:nowrap}
.sy-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.sy-picto{display:inline-flex; align-items:center; gap:4px; margin:0 8px 2px 0; font-size:.8rem; white-space:nowrap}
.sy-picto img{display:block}
.sy-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents
function docPoste(D, texte) {
  return { id: 'poste', titre: 'Ton poste', court: 'Ton poste',
    html: `<article class="sy-doc" aria-label="Ton poste">
    <p class="sy-t">Ton poste</p>
    <p class="sy-st">Magasin des produits finis — usine Syngenta d’Aigues-Vives (Gard) — ${ech(D.jour)}</p>
    <p>Tu es magasinier(ère) au <b>magasin des produits finis</b>. Les palettes de bidons arrivent des lignes de conditionnement ; tu les ranges dans
      la bonne <b>cellule</b>, selon le <b>danger</b> du produit, et tu vérifies que la <b>rétention</b> de la cellule suffit. Ton responsable : <b>Karim</b>.</p>
    ${texte}
    <p><b>Ce qui est réel</b> : l’usine d’Aigues-Vives formule et conditionne environ 400 produits phytosanitaires liquides (herbicides, insecticides,
      fongicides), environ 25 millions de litres par an, en bidons pour les agriculteurs de France et de l’étranger. Elle est classée <b>Seveso seuil haut</b> :
      on y stocke assez de produits dangereux pour qu’un accident puisse être grave, et tout le site est sur rétention.</p>
    ${pied(`Document pédagogique. ${MENTION}`)}
  </article>` };
}

const docPictos = () => ({ id: 'pictos', titre: 'Les pictogrammes de danger', court: 'Les pictogrammes',
  html: `<article class="sy-doc" aria-label="Les pictogrammes de danger">
    <p class="sy-t">Les pictogrammes de danger</p>
    <p class="sy-st">Imprimés sur l’étiquette de chaque bidon (losange à bord rouge, symbole noir) ; un produit peut en avoir plusieurs</p>
    <table class="sy-table"><thead><tr><th scope="col">Code</th><th scope="col">Symbole</th><th scope="col">Ce qu’il veut dire</th></tr></thead>
      <tbody>${Object.entries(PICTOS).map(([c, p]) => `<tr><td>${pictoHtml(c)}</td><td>${ech(p.nom)}</td><td>${ech(p.sens)}</td></tr>`).join('')}</tbody></table>
    ${pied('Pictogrammes réels (règlement européen CLP). Dans les documents de l’exercice, ils sont écrits par leur code (◇ SGH02…) et non dessinés. Document pédagogique.')}
  </article>` });

const docRegle = () => ({ id: 'regle', titre: 'La règle de rangement du magasin', court: 'La règle',
  html: `<article class="sy-doc" aria-label="La règle de rangement">
    <p class="sy-t">La règle de rangement du magasin</p>
    <p class="sy-st">Affichée à l’entrée du magasin</p>
    <p><b>1. La cellule.</b> Un produit va dans la cellule de son danger <b>le plus fort</b>. Lis ses pictogrammes et prends le <b>premier</b> qui convient :</p>
    <ul class="sy-ul">
      <li>◇ SGH02 (flamme) → <b>cellule 1 — inflammables</b>, même s’il a d’autres pictogrammes ;</li>
      <li>sinon ◇ SGH06 (tête de mort) ou ◇ SGH08 (danger pour la santé) → <b>cellule 2 — toxiques</b> ;</li>
      <li>sinon ◇ SGH05 (corrosion) → <b>cellule 3 — corrosifs</b> ;</li>
      <li>sinon (◇ SGH07, ◇ SGH09 seuls) → <b>cellule 4 — autres dangers</b>.</li>
    </ul>
    <p><b>2. Cellule pleine.</b> On range les palettes dans l’ordre de leur numéro. Si la cellule n’a plus de place, la palette reste en <b>zone d’attente du quai</b> :
      <b>jamais</b> dans une autre cellule. On prévient le responsable.</p>
    <p><b>3. La rétention.</b> Sous chaque cellule, un bac de rétention retient le liquide si un bidon fuit. Il doit pouvoir contenir au moins :</p>
    <p class="sy-regle">cellule 1 (inflammables) : <b>50 %</b> du volume stocké dans la cellule · autres cellules : <b>20 %</b><br>
      et jamais moins de <b>800 litres</b> (ou tout le volume, s’il fait moins de 800 litres).</p>
    <p class="sy-st">Volume stocké = ce qui était déjà dans la cellule + ce que tu y ranges. Exemple : 3 000 L dans une cellule de toxiques → 20 % = 600 L → on prend 800 L.</p>
    ${pied('Règle CONSTRUITE pour l’exercice, inspirée des règles courantes des installations classées (ce n’est pas le texte d’un arrêté). Document pédagogique.')}
  </article>` });

const docTransfert = (D) => ({ id: 'transfert', titre: 'Le bon de transfert des palettes', court: 'Les palettes',
  html: `<article class="sy-doc" aria-label="Bon de transfert">
    <p class="sy-t">Bon de transfert — lignes de conditionnement → magasin</p>
    <p class="sy-st">${ech(D.jour)} · palettes à ranger, dans l’ordre de leur numéro · les pictogrammes sont recopiés de l’étiquette</p>
    <table class="sy-table"><thead><tr><th scope="col">Palette</th><th scope="col">Produit</th><th scope="col">Pictogrammes</th><th class="sy-d" scope="col">Bidons</th></tr></thead>
      <tbody>${D.palettes.map(([p, ref, b, l]) => `<tr><td class="sy-mono">${p}</td><td><span class="sy-mono">${ref}</span> — ${ech(PRODUIT[ref].nom)}</td>
        <td>${PRODUIT[ref].pictos.map(pictoHtml).join('')}</td><td class="sy-d">${b} × ${l} L</td></tr>`).join('')}</tbody></table>
    ${pied('Bon CONSTRUIT pour l’exercice (produits, pictogrammes, quantités). Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

const docEtat = (D) => ({ id: 'etat', titre: 'L’état des cellules ce matin', court: 'Les cellules',
  html: `<article class="sy-doc" aria-label="État des cellules">
    <p class="sy-t">État des cellules — ${ech(D.jour)}, 6 h</p>
    <p class="sy-st">Avant le rangement des palettes du bon de transfert</p>
    <table class="sy-table"><thead><tr><th scope="col">Cellule</th><th class="sy-d" scope="col">Déjà stocké</th><th class="sy-d" scope="col">Places libres</th><th class="sy-d" scope="col">Rétention installée</th></tr></thead>
      <tbody>${CELLULES.map((c) => `<tr><td>${ech(c.nom)}</td><td class="sy-d">${n(D.etat[c.id][0])} L</td><td class="sy-d">${D.etat[c.id][1]} palette${D.etat[c.id][1] > 1 ? 's' : ''}</td>
        <td class="sy-d">${n(D.etat[c.id][2])} L</td></tr>`).join('')}</tbody></table>
    ${pied('État CONSTRUIT pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

function docPlanLucas(D) {
  const L = travailDeLucas(D);
  return { id: 'plan-lucas', titre: `Le plan de rangement de ${D.collegue}`, court: `Le plan de ${D.collegue}`,
    html: `<article class="sy-doc" aria-label="Plan de ${ech(D.collegue)}">
    <p class="sy-t">Plan de rangement — ${ech(D.jour)}</p>
    <p class="sy-st">Préparé par ${ech(D.collegue)} hier soir, pour l’équipe du matin</p>
    <table class="sy-table"><thead><tr><th scope="col">Palette</th><th scope="col">Produit</th><th scope="col">Rangée en</th></tr></thead>
      <tbody>${D.palettes.map(([p, ref]) => `<tr><td class="sy-mono">${p}</td><td class="sy-mono">${ref}</td><td>${ech(court(D.planCollegue[p]))}</td></tr>`).join('')}</tbody></table>
    <p style="margin-top:8px"><b>Rétention de la cellule 1</b> : ${n(L.volC1)} L × 20 % = ${n(Math.round(L.volC1 * D.partCollegue))} L → on prend ${n(L.retC1)} L. Installée : ${n(D.etat.C1[2])} L. <b>OK.</b></p>
    ${pied('Plan CONSTRUIT pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
}

const docDroit = () => ({ id: 'droit', titre: 'Le droit : un site Seveso', court: 'Le droit',
  html: `<article class="sy-doc" aria-label="Le droit : un site Seveso">
    <p class="sy-t">Le droit : un site Seveso seuil haut</p>
    <p class="sy-st">Directive européenne 2012/18/UE, dite « Seveso III », et Code de l’environnement (installations classées)</p>
    <ul class="sy-ul">
      <li>Un site qui stocke des produits dangereux au-delà de certaines quantités est classé <b>Seveso</b> : <b>seuil bas</b> ou, au-delà, <b>seuil haut</b>.</li>
      <li>Un site seuil haut doit étudier ses dangers, avoir un plan d’urgence interne, et <b>informer le public</b> : sa fiche d’information se lit par
        exemple sur le site public Géorisques. Un plan de prévention des risques encadre aussi les constructions autour.</li>
      <li>L’<b>étiquette</b> avec les pictogrammes est obligatoire : c’est le fournisseur qui met le produit sur le marché qui la pose (règlement CLP).</li>
    </ul>
    <p>Pour le magasinier, ça se traduit par des règles écrites : où ranger chaque famille de produits, quelles rétentions, quoi faire si quelque chose ne va pas.</p>
    ${pied('Résumé pour l’exercice (pas une citation) : directive 2012/18/UE, règlement (CE) n° 1272/2008 (CLP). Fiche Seveso de l’usine : georisques.gouv.fr, consultée le 26/10/2026.')}
  </article>` });

// ─────────────────────────────────────────── la fiche
const choixCellules = [...CELLULES.map((c) => ({ v: c.id, lib: c.nom })), { v: ATTENTE, lib: 'Zone d’attente du quai (cellule pleine)' }];
const nb = (id, lib, unite, manque) => ({ type: 'nombre', id, lib, unite, min: 0, entier: true, manque });
const idPal = (p) => p.toLowerCase().replace('-', '');     // PAL-12 → pal12

function blocsRanger(D, K) {
  return [
    { type: 'cadre', titre: '1. Le rangement', large: true, blocs: D.palettes.map(([p, ref]) => ({ type: 'liste', id: idPal(p), lib: `${p} — ${ref}`, manque: `la place de ${p}`, choix: choixCellules })) },
    { type: 'cadre', titre: '2. La rétention', large: true, blocs: D.retention.flatMap((c) => [
      ...(K.volume ? [nb(`vol-${c}`, `${CELLULE[c].nom} : volume stocké après le rangement`, 'L', `le volume de la cellule ${c.slice(1)}`)] : []),
      nb(`ret-${c}`, `${CELLULE[c].nom} : rétention nécessaire`, 'L', `la rétention de la cellule ${c.slice(1)}`),
      ...(K.suffit && K.suffit.includes(c) ? [{ type: 'choix', id: `suf-${c}`, lib: `La rétention installée de la cellule ${c.slice(1)} suffit-elle ?`, manque: `si la rétention de la cellule ${c.slice(1)} suffit`,
        choix: [{ v: 'oui', lib: 'Oui' }, { v: 'non', lib: 'Non' }] }] : []),
    ]) },
  ];
}
function blocsControle(D) {
  return [
    { type: 'cadre', titre: `1. Le plan de ${D.collegue}`, large: true, blocs: [
      { type: 'cases', id: 'erreurs', titre: `Les palettes que ${D.collegue} a mal rangées`, consigne: 'Compare chaque palette à la règle de rangement.', choix: D.palettes.map(([p, ref]) => ({ v: p, lib: `${p} — ${ref}` })) },
    ] },
    { type: 'cadre', titre: '2. La rétention de la cellule 1', large: true, blocs: [
      { type: 'choix', id: 'cause', lib: `Le calcul de rétention de ${D.collegue} :`, colonne: true, manque: 'ce qui ne va pas dans le calcul', choix: [
        { v: 'part', lib: 'Il a pris 20 % : pour la cellule 1, c’est 50 %' },
        { v: 'minimum', lib: 'Il a oublié le minimum de 800 litres' },
        { v: 'juste', lib: 'Son calcul est juste' }] },
      nb('vol-C1', 'Volume de la cellule 1 avec le bon rangement', 'L', 'le volume de la cellule 1'),
      nb('ret-C1', 'Rétention nécessaire pour la cellule 1', 'L', 'la rétention de la cellule 1'),
      { type: 'choix', id: 'suf-C1', lib: 'La rétention installée de la cellule 1 suffit-elle ?', manque: 'si la rétention suffit', choix: [{ v: 'oui', lib: 'Oui' }, { v: 'non', lib: 'Non' }] },
    ] },
  ];
}

// ─────────────────────────────────────────── l'état de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};

// ─────────────────────────────────────────── les phrases (de l'élève à Karim : tu poli)
function phrases(D, K, prenom) {
  const id = `compte-rendu-${D.code.slice(4).replace('.', '')}`;
  const B = bilan(D);
  const salut = { id: 'salutation', choix: ['Bonjour Karim,', 'Salut le chef,', 'Yo,'], juste: 0 };
  const fin = { id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 };
  const lignes = [salut];
  if (D.collegue) {
    const L = travailDeLucas(D);
    const dit = (ps) => `Le plan de ${D.collegue} range mal ${liste(ps.map((p) => `${p} (à mettre en ${court(B.rangement[p])})`))}.`;
    lignes.push({ id: 'erreur', choix: [dit(L.faux), dit(L.faux.slice(0, 1)), `Le plan de ${D.collegue} range bien toutes les palettes.`], juste: 0 });
  } else {
    const c1 = D.palettes.map((p) => p[0]).filter((p) => B.rangement[p] === 'C1');
    const double = D.palettes.find((p) => B.rangement[p[0]] === 'C1' && PRODUIT[p[1]].pictos.length > 1 && PRODUIT[p[1]].pictos.some((x) => x === 'SGH06' || x === 'SGH05' || x === 'SGH08'));
    const sans = double ? c1.filter((p) => p !== double[0]) : c1.slice(0, -1);
    const autre = D.palettes.map((p) => p[0]).find((p) => B.rangement[p] === 'C2');
    const dit = (ps) => `En cellule 1 (inflammables), j’ai rangé ${liste(ps)}.`;
    lignes.push({ id: 'inflammables', choix: [dit(c1), dit(sans), dit([...c1, autre].filter(Boolean))], juste: 0 });
  }
  if (B.attente.length) {
    const p = B.attente[0];
    const c = celluleDeP(D, p);
    lignes.push({ id: 'attente', choix: [`${p} attend en zone d’attente du quai : la ${court(c)} est pleine.`,
      `${p} est rangée en cellule 4, il restait de la place.`, 'Toutes les palettes sont rangées.'], juste: 0 });
  }
  for (const c of D.retention) {
    const v = B.volumes[c], r = B.retentions[c], inst = D.etat[c][2];
    const autrePart = CELLULE[c].inflammable ? 0.2 : 0.5;
    const r2 = Math.max(Math.round(v * autrePart), Math.min(800, v));
    const brut = Math.round(v * (CELLULE[c].inflammable ? 0.5 : 0.2));
    const faux2 = r2 !== r ? r2 : (brut !== r ? brut : v);
    const verdict = (x) => (K.suffit && K.suffit.includes(c) ? (inst >= x ? ` : les ${n(inst)} L installés suffisent.` : ` : les ${n(inst)} L installés ne suffisent pas.`) : '.');
    lignes.push({ id: `retention-${c}`, choix: [`${court(c).replace(/^c/, 'C')} : ${n(v)} L stockés, il faut au moins ${n(r)} L de rétention${verdict(r)}`,
      `${court(c).replace(/^c/, 'C')} : ${n(v)} L stockés, il faut au moins ${n(faux2)} L de rétention${verdict(faux2)}`,
      `${court(c).replace(/^c/, 'C')} : ${n(v)} L stockés, pas besoin de rétention.`], juste: 0 });
  }
  lignes.push(fin);
  return { id, melanger: true, lignes };
}
const celluleDeP = (D, p) => { const r = D.palettes.find((x) => x[0] === p)[1]; const pic = PRODUIT[r].pictos;
  return pic.includes('SGH02') ? 'C1' : (pic.includes('SGH06') || pic.includes('SGH08')) ? 'C2' : pic.includes('SGH05') ? 'C3' : 'C4'; };

// ─────────────────────────────────────────── la fabrique d'une séance
// D : le jeu ; O : { id (meta.id), K ({ volume, suffit: [cellules] }), poids, consigne, poste, objet, etape, questions }.
export function seance(D, O) {
  const K = O.K || {};
  const B = bilan(D);
  const L = D.collegue ? travailDeLucas(D) : null;
  const suffixe = D.code.slice(4).replace('.', '');
  const FICHE_ID = `rangement-${suffixe}`, VOLET_ID = `sy-${suffixe}`;
  const P = phrases(D, K, '{prenom}');
  const PHRASES_ID = P.id;

  const DOCUMENTS = [docPoste(D, O.poste), docTransfert(D), docEtat(D), ...(L ? [docPlanLucas(D)] : []), docRegle(), docPictos(), docDroit()];
  const FICHE = {
    id: FICHE_ID, libelle: L ? 'Contrôle du plan' : 'Fiche de rangement', titre: L ? `Contrôler le plan de ${D.collegue}` : 'Fiche de rangement',
    sousTitre: 'À gauche : les palettes, l’état des cellules, la règle et les pictogrammes.',
    documents: ['transfert', 'etat', ...(L ? ['plan-lucas'] : []), 'regle', 'pictos'], largeurDocs: 1.3, defile: true,
    bouton: L ? 'Ouvrir le contrôle du plan' : 'Ouvrir la fiche de rangement',
    blocs: L ? blocsControle(D) : blocsRanger(D, K),
    envoi: { bouton: 'Envoyer la fiche à Karim', a: 'Karim', suite: 'Rends-lui compte maintenant, dans la Messagerie.' },
  };
  const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decale || 0), from: KARIM.nom, fromMail: KARIM.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
  const pieces = ['poste', 'transfert', 'etat', ...(L ? ['plan-lucas'] : []), 'regle', 'pictos'];
  const VOLET = {
    id: VOLET_ID,
    semer: (prenom) => ({ mails: [mail(prenom, O.objet, `Bonjour ${prenom} !\n\n${O.consigne}\n\nKarim`, { decale: -3600e3, extra: { pieces, ouvreFiche: FICHE_ID } })] }),
    declencheurs: [
      { id: 'compte', quand: apresFiche(FICHE_ID),
        semer: (prenom) => ({ mails: [mail(prenom, 'Ton compte rendu', `Bonjour ${prenom},\n\nJ’ai ta fiche. Écris-moi en quelques lignes ce que tu as fait et ce qui ne va pas, `
          + 'je dois le noter dans le registre du magasin.\n\nKarim', { extra: { phrases: phrases(D, K, prenom) } })] }) },
      { id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye,
        semer: (prenom) => ({ mails: [mail(prenom, 'Merci', `Merci ${prenom}. Je regarde ta fiche et ton compte rendu.\n\nKarim`, { decale: 1000 })] }) },
    ],
  };

  // ── les jalons
  const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
  const W = O.poids;
  const G = { ranger: 'Le rangement', ret: 'La rétention', plan: L ? `Le plan de ${D.collegue}` : '', compte: 'Le compte rendu' };
  const surFiche = (id, titre, groupe, juste, poids = W[id]) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_ID}`,
    verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return juste(valeursDe(db, FICHE_ID)) ? ok : ko; } });
  const nombre = (k, attendu) => (v) => lireNombre(v[k]) === attendu;
  const ETAPES = [];
  if (L) {
    ETAPES.push(surFiche('erreurs', 'Les palettes mal rangées', G.plan, (v) => Array.isArray(v.erreurs) && v.erreurs.length > 0 && memes(v.erreurs, L.faux)));
    ETAPES.push(surFiche('cause', 'L’erreur de rétention', G.ret, (v) => v.cause === 'part'));
    ETAPES.push(surFiche('vol-C1', 'Le volume de la cellule 1', G.ret, nombre('vol-C1', B.volumes.C1)));
    ETAPES.push(surFiche('ret-C1', 'La rétention de la cellule 1', G.ret, nombre('ret-C1', B.retentions.C1)));
    ETAPES.push(surFiche('suf-C1', 'La rétention installée suffit-elle ?', G.ret, (v) => v['suf-C1'] === (B.suffit.C1 ? 'oui' : 'non')));
  } else {
    for (const [p] of D.palettes) ETAPES.push(surFiche(idPal(p), `${p} : sa place`, G.ranger, (v) => v[idPal(p)] === B.rangement[p], W.palette));
    for (const c of D.retention) {
      if (K.volume) ETAPES.push(surFiche(`vol-${c}`, `Le volume de la ${court(c)}`, G.ret, nombre(`vol-${c}`, B.volumes[c])));
      ETAPES.push(surFiche(`ret-${c}`, `La rétention de la ${court(c)}`, G.ret, nombre(`ret-${c}`, B.retentions[c])));
      if (K.suffit && K.suffit.includes(c)) ETAPES.push(surFiche(`suf-${c}`, `La rétention installée de la ${court(c)}`, G.ret, (v) => v[`suf-${c}`] === (B.suffit[c] ? 'oui' : 'non')));
    }
  }
  const cles = P.lignes.map((l) => l.id).filter((x) => x !== 'salutation' && x !== 'fin');
  ETAPES.push({ id: 'compte-rendu', titre: 'Le compte rendu à Karim', groupe: G.compte, poids: W['compte-rendu'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return cles.every((l) => r.justes.includes(l)) ? ok : ko; } });
  const manque = ETAPES.filter((e) => typeof e.poids !== 'number');
  if (manque.length) throw new Error(`${D.code} : jalon sans poids (${manque.map((e) => e.id).join(', ')})`);

  const ficheFaite = (db) => envoyee(db, FICHE_ID);
  const rendu = (db) => phrasesJustes(db, PHRASES_ID).envoye;
  const PASTILLES = [{ libelle: L ? 'Le contrôle' : 'Le rangement', fait: ficheFaite }, { libelle: 'Le compte rendu', fait: rendu }];
  const SUITE = [
    { vue: 'fiche', libelle: L ? 'Le contrôle du plan' : 'La fiche de rangement', fait: ficheFaite },
    { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu à Karim', fait: rendu },
  ];
  const ACCUEIL = {
    titre: L ? 'Contrôler un plan de rangement' : 'Ranger des produits dangereux',
    kpis: ['mail'],
    etapes: [
      ['Lire le message de Karim', 'Menu Messagerie. Les documents sont joints : les palettes, les cellules, la règle, les pictogrammes.'],
      ['① La fiche', O.etape],
      ['② Le compte rendu', 'Réponds à Karim, une phrase par ligne.'],
      ['Bon à savoir', MENTION],
    ],
  };
  const OPTIONS = {
    menu: [],
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
  return { ID: O.id, FICHE_ID, PHRASES_ID, VOLET_ID, B, L, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS };
}

// ─────────────────────────────────────────── la banque « Avant de commencer » (commune aux quatre séances)
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'karim', doc, rubrique, enonce, choix, juste, retour });
export const BANQUE = [
  q('flamme', 'preparation', 'pictos', 'Le pictogramme ◇ SGH02 (la flamme) veut dire que le produit est…',
    [{ v: 'inflammable', lib: 'inflammable' }, { v: 'toxique', lib: 'toxique' }, { v: 'chaud', lib: 'à stocker au chaud' }], 'inflammable',
    'La flamme : le produit peut prendre feu. C’est pour ça qu’il a sa propre cellule.'),
  q('deux-pictos', 'preparation', 'regle', 'Un produit porte ◇ SGH02 et ◇ SGH06. Où le ranges-tu ?',
    [{ v: 'c1', lib: 'En cellule 1 (inflammables)' }, { v: 'c2', lib: 'En cellule 2 (toxiques)' }, { v: 'moitie', lib: 'La moitié dans chaque cellule' }], 'c1',
    'La règle prend le danger le plus fort, dans l’ordre : la flamme passe en premier.'),
  q('retention', 'preparation', 'regle', 'Une rétention sert à…',
    [{ v: 'fuite', lib: 'retenir le liquide d’un bidon qui fuit, pour qu’il n’aille pas dans le sol ou l’eau' },
      { v: 'garder', lib: 'garder les bidons au frais' }, { v: 'compter', lib: 'compter les bidons' }], 'fuite',
    'Le bac sous la cellule retient ce qui coule : un pesticide dans la nappe, c’est une pollution grave.'),
  q('pleine', 'preparation', 'regle', 'La cellule 2 est pleine. Que fais-tu de la palette de toxiques ?',
    [{ v: 'attente', lib: 'Je la laisse en zone d’attente et je préviens Karim' }, { v: 'c4', lib: 'Je la mets en cellule 4, il y a de la place' },
      { v: 'allee', lib: 'Je la pose dans l’allée de la cellule 2' }], 'attente',
    'Jamais dans une autre cellule : elle n’a ni la bonne rétention ni les bons voisins.'),
  q('seveso', 'droit', 'droit', 'L’usine est classée « Seveso seuil haut ». Cela veut dire…',
    [{ v: 'dangereux', lib: 'qu’elle stocke assez de produits dangereux pour avoir les règles de prévention les plus strictes' },
      { v: 'grande', lib: 'que c’est une très grande usine' }, { v: 'fermee', lib: 'qu’elle va fermer' }], 'dangereux',
    'Le classement dépend des quantités de produits dangereux : seuil haut, ce sont les obligations les plus fortes.'),
  q('etiquette', 'droit', 'droit', 'Qui doit mettre les pictogrammes de danger sur le bidon ?',
    [{ v: 'fournisseur', lib: 'Le fournisseur qui met le produit sur le marché' }, { v: 'client', lib: 'L’agriculteur qui l’achète' },
      { v: 'personne', lib: 'Personne : c’est facultatif' }], 'fournisseur',
    'Le règlement CLP oblige le fournisseur à étiqueter : ici, c’est Syngenta qui pose l’étiquette avant que le bidon parte.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Des palettes arrivent des lignes. Avant de t’y mettre, regarde les documents à gauche et réponds à mes questions.',
  documents: ['poste', 'regle', 'pictos', 'droit'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
export { litres };
