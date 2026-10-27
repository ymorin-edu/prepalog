// Yves Rocher — la plateforme logistique de La Villouët, à La Gacilly (Morbihan) : l'UNIVERS commun des séances ENT-23.1 à 23.6 (2de Bac Pro,
// entreprise n° 23) et les DOCUMENTS et blocs de fiche qu'elles partagent. Cadrage : `docs/briefs/yves-rocher/CADRAGE-yves-rocher-2de.md` ;
// données : `contenus/yves-rocher-donnees.js` ; fabrique : `contenus/fabrique-fiches.js`.
//
// L'élève est stagiaire en PFMP : à la préparation des commandes des boutiques (Soizic, cheffe d'équipe, sa tutrice ; Maël, préparateur), puis au
// service qui répond aux boutiques (Inès). Prénoms seuls, tous CONSTRUITS ; aucune parole n'est prêtée à un salarié réel. Tutoiement entre
// collègues, vouvoiement dans une réponse à une boutique. Aucune vue nouvelle : documents joints, fiches courtes, réponse par phrases.

import { catalogueSimple } from './entreprise-commun.js';
import {
  PRODUITS, TYPES, typeDe, ordreDe, nomDe, cartons, detail, STATUTS, statutDe, DECISIONS, decisionDe, TOURNEES, JOURS, HEURE_LIMITE, SORTS,
} from './yves-rocher-donnees.js';
import { memes } from './fabrique-fiches.js';

// ─────────────────────────────────────────── l'univers
export const LOGO = './contenus/trames/logos/yves-rocher.svg';
export const ENTREPRISE = {
  id: 'yves-rocher',
  nom: 'Yves Rocher',
  sousTitre: 'Plateforme logistique de La Villouët, La Gacilly (Morbihan)',
  exercice: 'À la préparation des commandes',
  logo: LOGO,
};
export const VOCAB = { unit: 'article', unitPl: 'articles', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'yves-rocher.example' };
// Charte d'yves-rocher.fr (relevé du 27/10/2026, logo de l'en-tête) : le vert foncé du logotype #014e2e, texte blanc posé dessus (contraste 10:1).
// Charte VERTE : le moteur la garde au bandeau et au menu, jamais dans la zone où l'élève travaille (décision de Tristan du 05/10/2026).
export const THEME = { accent: '#014e2e', surAccent: '#ffffff', papier: true };
export const CATALOGUE = catalogueSimple(Object.values(PRODUITS).map((x) => ({ ref: x.id.toUpperCase(), designation: x.nom, marque: 'Produit générique (construit)',
  categorie: 'Cosmétique', fournisseur: 'F-YR', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-YR', brand: 'Yves Rocher', name: 'Usines du groupe (construit)', adr: '', cp: '', ville: 'La Gacilly', contact: '', tel: '',
  email: 'plateforme@yves-rocher.example', delai: 1, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Yves Rocher et sa plateforme logistique de La Villouët à La Gacilly (Morbihan) : environ 200 salariés, 21 000 emplacements '
  + 'de palettes, 4 800 références, 280 millions d’articles et 180 000 palettes par an pour les boutiques de France et les filiales (2026) ; '
  + 'la préparation en palettes, en cartons complets ou au détail dans des cartons panachés, avec des chariots qui prennent quatre ou cinq commandes '
  + 'de boutiques à la fois (2016) ; la loi anti-gaspillage. Construits : les produits, les adresses, les colisages, les commandes, les boutiques '
  + 'servies et leurs jours de livraison, les réclamations, l’heure limite, les stocks et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  soizic: { nom: 'Soizic', role: 'cheffe d’équipe de la préparation (ta tutrice)', appel: 'Soizic', registre: 'tu',
    metier: 'Cheffe d’équipe préparation', phrase: 'J’organise la préparation des commandes des boutiques : les chariots, les préparateurs, le contrôle. Je suis ta tutrice.' },
  mael: { nom: 'Maël', role: 'préparateur de commandes', appel: 'Maël', registre: 'tu',
    metier: 'Préparateur de commandes', phrase: 'Je prépare quatre ou cinq commandes de boutiques à la fois avec mon chariot, puis je ferme les cartons.' },
  ines: { nom: 'Inès', role: 'chargée de la relation avec les boutiques', appel: 'Inès', registre: 'tu',
    metier: 'Relation boutiques', phrase: 'Je réponds aux boutiques : leurs demandes, leurs réclamations, les commandes urgentes.' },
};
export const MAIL_SOIZIC = 'soizic@yves-rocher.example';
export const MAIL_INES = 'ines@yves-rocher.example';
export const TUTEUR_PREPA = { nom: 'Soizic, cheffe d’équipe préparation', mail: MAIL_SOIZIC, appel: 'Soizic' };
export const TUTEUR_BOUTIQUES = { nom: 'Inès, relation boutiques', mail: MAIL_INES, appel: 'Inès' };
export const PERSONNES = { soizic: EQUIPE.soizic, mael: EQUIPE.mael, ines: EQUIPE.ines };

// ─────────────────────────────────────────── aides
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = 'Document pédagogique — reconstitution, non contractuel.';
const pied = (t = PIED) => `<p class="yr-pied">${ech(t)}</p>`;
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
const valeur = (x, db) => (typeof x === 'function' ? x(db) : x);
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="yr-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="yr-doc" aria-label="${ech(titre)}">${corps}</article>` });
const entete = (t, st) => `<div class="yr-entete"><img class="yr-logo" src="${LOGO}" alt="Yves Rocher"><div><p class="yr-t">${ech(t)}</p>${st ? `<p class="yr-st">${ech(st)}</p>` : ''}</div></div>`;

export const STYLE = `
--douce:#555047;
.yr-doc{padding:14px 18px 0}
.yr-doc p{margin:0 0 8px}
.yr-entete{display:flex; gap:12px; align-items:center; border-bottom:2px solid #1d1d1b; padding-bottom:6px; margin-bottom:10px}
.yr-logo{height:26px; width:auto}
.yr-t{margin:0; font-size:1.06rem; font-weight:800}
.yr-st{margin:2px 0 0; font-size:.84rem; color:var(--douce)}
.yr-ul{margin:4px 0 8px; padding-left:20px; font-size:.93rem}
.yr-ul li{margin:4px 0}
.yr-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.yr-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.yr-table th, .yr-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left; vertical-align:top}
.yr-table th{color:var(--douce); font-weight:600}
.yr-table .yr-d{text-align:right; white-space:nowrap}
.yr-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.yr-carte{border:2px solid #1d1d1b; border-radius:6px; padding:8px 12px; margin:6px 0 10px; font-size:.92rem}
.yr-loi{margin:4px 0 8px; padding:4px 10px; border-left:3px solid #555047}
.yr-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents communs
export const DOC_SITE = doc('site', 'La plateforme de La Villouët', 'La plateforme', `${entete('La plateforme logistique de La Villouët', 'La Gacilly, Morbihan (56), en Bretagne')}
  <p>Yves Rocher fabrique et vend des <b>produits de beauté</b> : soins du visage, gels douche, shampooings, maquillage, parfums… La marque est née
    à <b>La Gacilly</b>, un village du Morbihan, où le groupe a toujours ses usines et sa plateforme logistique.</p>
  <ul class="yr-ul">
    <li>Les <b>usines</b> du groupe envoient leurs produits à la plateforme de <b>La Villouët</b>, à La Gacilly.</li>
    <li>La plateforme les stocke, prépare les commandes et les expédie aux <b>boutiques Yves Rocher de France</b> et aux <b>filiales</b> du groupe
      à l’étranger. La marque est présente dans plus de <b>90 pays</b>.</li>
    <li>Environ <b>200 salariés</b>, <b>21 000 emplacements</b> de palettes et <b>4 800 références</b> de produits.</li>
    <li>Chaque année : <b>280 millions d’articles</b> préparés et <b>180 000 palettes</b> expédiées.</li>
    <li>Un logiciel de gestion d’entrepôt (le WMS) organise le travail ; chaque année, de <b>25 à 30 %</b> des produits changent (nouvelles gammes).</li>
  </ul>
  <p>Une boutique ne commande pas toujours un carton entier : la plateforme prépare donc des <b>palettes</b>, des <b>cartons complets</b> et des
    <b>cartons panachés</b>, où l’on met des articles <b>au détail</b>.</p>
  ${pied('Document pédagogique. Sources : E-commerce Magazine (08/10/2026) pour les chiffres de la plateforme ; Voxlog (21/11/2016) pour la façon de préparer.')}`);

export const DOC_EQUIPE = doc('equipe', 'L’équipe', 'L’équipe', `${entete('L’équipe avec qui tu travailles', 'Prénoms imaginés pour l’exercice')}
  <table class="yr-table"><thead><tr><th scope="col">Qui</th><th scope="col">Ce qu’il ou elle fait</th></tr></thead><tbody>
    ${Object.values(EQUIPE).map((x) => `<tr><td><b>${ech(x.nom)}</b><br><span class="yr-st">${ech(x.metier)}</span></td><td>${ech(x.phrase)}</td></tr>`).join('')}
    <tr><td><b>Toi</b><br><span class="yr-st">Stagiaire</span></td><td>Tu prépares des commandes avec Soizic et Maël, puis tu aides Inès à répondre aux boutiques.</td></tr>
  </tbody></table>
  ${pied('Équipe et prénoms CONSTRUITS pour l’exercice. Document pédagogique.')}`);

export const DOC_PREPARER = doc('preparer', 'Préparer une commande', 'Préparer', `${entete('Préparer la commande d’une boutique', 'Les règles de la zone de préparation')}
  <p><b>Le colisage</b> : le nombre d’articles dans un carton du fabricant. Exemple : le gel douche se range par cartons de 24.</p>
  <ul class="yr-ul">
    <li>La quantité commandée est un <b>multiple du colisage</b> (48 gels douche = 2 cartons de 24) : tu prends des <b>cartons complets</b>.</li>
    <li>La quantité est <b>plus petite</b> que le colisage (10 gels douche) : tu prends les articles <b>au détail</b> et tu les mets dans le
      <b>carton panaché</b> de la boutique.</li>
    <li>Entre les deux (30 gels douche = 1 carton de 24 et 6 au détail) : des <b>cartons complets</b>, et <b>le reste au détail</b>.</li>
  </ul>
  <div class="yr-regle"><b>L’ordre de prélèvement</b> : une adresse <span class="yr-mono">07-15</span> = allée <b>07</b>, emplacement <b>15</b>.
    Le bon de préparation range les lignes par nom de produit ; toi, tu passes <b>allée par allée, dans l’ordre des numéros</b>, et dans une allée,
    <b>emplacement par emplacement</b>, sans revenir en arrière.</div>
  <div class="yr-regle"><b>Le chariot</b> : il porte <b>quatre bacs</b>, un par boutique. À une adresse, tu prends <b>en une fois</b> les articles de
    toutes les boutiques du chariot, puis tu mets dans chaque bac ce que sa boutique a commandé.</div>
  ${pied('Règles du poste CONSTRUITES pour l’exercice (la préparation en cartons complets et au détail, et le chariot de quatre ou cinq commandes, sont réels : Voxlog, 2016). Document pédagogique.')}`);

export const DOC_REPONDRE = doc('repondre', 'Répondre à une boutique', 'Répondre', `${entete('Répondre à une réclamation d’une boutique', 'Les règles du service')}
  <ol class="yr-ul">
    <li><b>Vérifier d’abord</b> : comparer la réclamation avec la <b>commande</b> de la boutique et le <b>bon de préparation</b> (ce que la
      plateforme a vraiment mis dans les cartons).</li>
    <li><b>Décider</b>, article par article :
      <ul class="yr-ul">
        <li>la plateforme en a préparé <b>moins</b> que commandé : on envoie ce qui manque avec la <b>prochaine livraison</b> de la boutique ;</li>
        <li>des articles sont arrivés <b>cassés</b> et la boutique envoie une <b>photo</b> : on les <b>remplace</b> ;</li>
        <li>l’article n’était <b>pas dans la commande</b> : on l’<b>explique</b> poliment, la boutique peut le commander.</li>
      </ul></li>
    <li><b>Répondre</b> le jour même, en <b>vouvoyant</b> : bonjour, ce qu’on a vérifié, ce qu’on fait et quand, une formule de politesse.</li>
  </ol>
  ${pied('Règles du service CONSTRUITES pour l’exercice. Document pédagogique.')}`);

export const DOC_TOURNEES = doc('tournees', 'Les jours de livraison', 'Les livraisons', `${entete('Les jours de livraison des boutiques', 'Un camion part de la plateforme ces jours-là')}
  <table class="yr-table"><thead><tr><th scope="col">Boutique</th><th scope="col">Livrée le</th></tr></thead><tbody>
    ${Object.entries(TOURNEES).map(([b, j]) => `<tr><td>${ech(b)}</td><td>${j.join(' et ')}</td></tr>`).join('')}
  </tbody></table>
  <p class="yr-st">Les camions du jour sont déjà partis quand le service traite les réclamations : la prochaine livraison n’est jamais le jour même.</p>
  ${pied('Boutiques et jours de livraison CONSTRUITS pour l’exercice. Document pédagogique.')}`);

export const DOC_RETOURS = doc('retours', 'Les retours des boutiques', 'Les retours', `${entete('Les retours des boutiques', 'Que deviennent les articles renvoyés ?')}
  <ul class="yr-ul">
    <li>Un article <b>intact</b> et <b>toujours vendu</b> : on le <b>remet en stock</b>.</li>
    <li>Un article <b>intact</b> qui ne se vend plus (une gamme qui a changé, un coffret de l’an dernier) : on le <b>donne à une association</b>.</li>
    <li>Un article <b>abîmé</b> (flacon qui fuit, cassé) : il part au <b>recyclage</b>.</li>
  </ul>
  <div class="yr-loi"><p><b>Ce que dit la loi</b> (loi anti-gaspillage pour une économie circulaire, dite « AGEC », du 10 février 2020) :
    depuis 2022, une entreprise n’a plus le droit de <b>détruire</b> ses produits <b>non alimentaires</b> invendus. Elle doit les <b>donner</b>,
    les <b>réemployer</b> ou les <b>recycler</b>. Les produits d’hygiène, comme le gel douche ou le shampooing, se donnent en priorité.</p></div>
  ${pied('Règles du poste CONSTRUITES pour l’exercice ; résumé de la loi, pas une citation. Document pédagogique.')}`);

// ─────────────────────────────────────────── les documents qui dépendent de la séance ou du jeu
const colis = (p) => `${PRODUITS[p].parCarton} par carton`;
export function htmlCommande(C) {
  return `<p class="yr-st">Bon de préparation — boutique de <b>${ech(C.boutique)}</b></p>
    <table class="yr-table"><thead><tr><th scope="col">Ligne</th><th scope="col">Produit</th><th scope="col">Adresse</th><th class="yr-d" scope="col">Colisage</th>
      <th class="yr-d" scope="col">Quantité commandée</th></tr></thead><tbody>
    ${C.lignes.map((L, i) => `<tr><td>${i + 1}</td><td>${ech(nomDe(L.prod))}</td><td class="yr-mono">${PRODUITS[L.prod].adr}</td><td class="yr-d">${colis(L.prod)}</td>
      <td class="yr-d">${L.qte}</td></tr>`).join('')}
    </tbody></table>`;
}
export const docCommande = (get, titre = 'Le bon de préparation') => doc('commande', titre, 'La commande', (db) => { const C = valeur(get, db);
  return `${entete(titre, `La commande de la boutique de ${C.boutique}`)}${htmlCommande(C)}${pied('Commande, adresses et colisages CONSTRUITS pour l’exercice. Document pédagogique.')}`; });
export function htmlChariot(C) {
  return C.map((b) => `<div class="yr-carte"><b>Bac ${b.bac}</b> — boutique de ${ech(b.boutique)}
    <table class="yr-table"><thead><tr><th scope="col">Produit</th><th scope="col">Adresse</th><th class="yr-d" scope="col">Colisage</th><th class="yr-d" scope="col">Quantité</th></tr></thead><tbody>
    ${b.lignes.map((L) => `<tr><td>${ech(nomDe(L.prod))}</td><td class="yr-mono">${PRODUITS[L.prod].adr}</td><td class="yr-d">${colis(L.prod)}</td><td class="yr-d">${L.qte}</td></tr>`).join('')}
    </tbody></table></div>`).join('');
}
export const docChariot = (get, titre = 'Ton chariot') => doc('chariot', titre, 'Le chariot', (db) => `${entete(titre, 'Une commande de boutique par bac')}
  ${htmlChariot(valeur(get, db))}${pied('Commandes, adresses et colisages CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export const docControle = (L) => doc('controle', 'Le contrôle du colis', 'Le contrôle', `${entete('Le contrôle du carton panaché', 'Boutique de Lorient — préparé par Maël')}
  <table class="yr-table"><thead><tr><th scope="col">Produit sur le bon</th><th class="yr-d" scope="col">Quantité sur le bon</th><th scope="col">Produit scanné dans le carton</th>
    <th class="yr-d" scope="col">Quantité scannée</th></tr></thead><tbody>
    ${L.map((C) => `<tr><td>${ech(nomDe(C.prod))}${C.teinte ? `, ${C.teinte}` : ''}</td><td class="yr-d">${C.attendu}</td>
      <td>${ech(nomDe(C.prod))}${C.teinteScannee ? `, ${C.teinteScannee}` : ''}</td><td class="yr-d">${C.scanne}</td></tr>`).join('')}
  </tbody></table>${pied('Contrôle CONSTRUIT pour l’exercice. Document pédagogique.')}`);
export function htmlReclamation(R) {
  const casse = R.plaintes.find((p) => p.cas === 'casse');
  return `<div class="yr-carte"><p class="yr-st">Courriel de la boutique de <b>${ech(R.boutique)}</b>, reçu ce ${R.jour} matin</p>
    <p>Bonjour, nous avons reçu ${ech(R.commande)}. ${R.plaintes.map((p) => (p.cas === 'casse'
      ? `${p.qte} ${ech(nomDe(p.prod).toLowerCase())} sont arrivés cassés (photo jointe)`
      : `il nous manque ${p.qte} ${ech(nomDe(p.prod).toLowerCase())}`)).join(' ; ')}. Merci de faire le nécessaire.
    <br>La responsable de la boutique</p>${casse ? `<p class="yr-st">Pièce jointe : photo de ${casse.qte} articles cassés dans le carton.</p>` : ''}</div>
    <table class="yr-table"><caption class="yr-st" style="text-align:left">Le bon de préparation de cette commande</caption>
    <thead><tr><th scope="col">Produit</th><th class="yr-d" scope="col">Commandé</th><th class="yr-d" scope="col">Préparé</th></tr></thead><tbody>
    ${R.bon.map((b) => `<tr><td>${ech(nomDe(b.prod))}</td><td class="yr-d">${b.commande}</td><td class="yr-d">${b.prepare}</td></tr>`).join('')}
    </tbody></table>`;
}
export const docReclamation = (get) => doc('reclamation', 'La réclamation', 'La réclamation', (db) => { const R = valeur(get, db);
  return `${entete('La réclamation d’une boutique', `Boutique de ${R.boutique}`)}${htmlReclamation(R)}${pied('Réclamation, commande et boutique CONSTRUITES pour l’exercice. Document pédagogique.')}`; });
export const docDemandes = (D) => doc('demandes', 'Les demandes du jour', 'Les demandes', `${entete('Les demandes urgentes des boutiques', 'Fin novembre : le pic du « Black Friday »')}
  <p>Fin novembre, les commandes montent : le jour du « Black Friday », elles dépassent de 20 % la moyenne de l’année. Aujourd’hui, trois boutiques
    demandent des articles <b>en plus</b> de leur commande.</p>
  <div class="yr-regle"><b>L’heure limite</b> : une demande reçue avant <b>${HEURE_LIMITE.replace(':', ' h ')}</b> est préparée pour le camion de ce soir ;
    après, elle est préparée demain. Le stock manque ? On envoie <b>ce qu’il y a</b> ce soir, et <b>le reste</b> (le reliquat) part plus tard.</div>
  <table class="yr-table"><thead><tr><th scope="col">Boutique</th><th scope="col">Reçue à</th><th scope="col">Demande</th><th scope="col">En stock</th></tr></thead><tbody>
    ${D.map((d) => `<tr><td>${ech(d.boutique)}</td><td>${d.heure.replace(':', ' h ')}</td><td>${d.lignes.map((l) => `${l.qte} ${ech(nomDe(l.prod).toLowerCase())}`).join(', ')}</td>
      <td>${d.lignes.map((l) => `${d.stock[l.prod]} ${ech(nomDe(l.prod).toLowerCase())}`).join(', ')}</td></tr>`).join('')}
  </tbody></table>
  ${pied('Demandes, heure limite et stocks CONSTRUITS pour l’exercice (la hausse de 20 % du « Black Friday » est réelle : Voxlog, 2016). Document pédagogique.')}`);

// ─────────────────────────────────────────── les blocs de fiche partagés et leurs jalons
// La façon de préparer chaque ligne d'une commande.
export const blocsTypes = (C) => C.lignes.map((L) => ({ type: 'liste', id: `type-${L.prod}`, lib: `${nomDe(L.prod)} : ${L.qte} (${colis(L.prod)})`, vide: 'Choisir…',
  manque: `la ligne ${nomDe(L.prod).toLowerCase()}`, choix: TYPES }));
export const jalonsTypes = (get, { poids, groupe }) => get(null).lignes.map((L0, i) => ({ id: `type-${i + 1}`, titre: `Préparer : la ligne n° ${i + 1}`, groupe, poids,
  titreBilan: (db) => `Préparer : ${nomDe(get(db).lignes[i].prod).toLowerCase()}`, attendu: (db) => TYPES.find((x) => x.v === typeDe(get(db).lignes[i])).lib,
  juste: (v, db) => { const L = get(db).lignes[i]; return v[`type-${L.prod}`] === typeDe(L); } }));
// L'ordre de prélèvement : les produits dans l'ordre du bon (alphabétique), à remettre dans l'ordre des adresses.
export const blocOrdre = (C) => ({ type: 'ordre', id: 'ordre', titre: 'Mon ordre de prélèvement', consigne: 'De la première adresse à la dernière.',
  choix: C.lignes.map((L) => ({ v: L.prod, lib: `${nomDe(L.prod)} (${PRODUITS[L.prod].adr})` })) });
export const jalonsOrdre = (get, { poids, groupe }) => get(null).lignes.map((_, k) => ({ id: `ordre-${k + 1}`, titre: `L’ordre de prélèvement : l’arrêt n° ${k + 1}`, groupe, poids,
  attendu: (db) => { const p = ordreDe(get(db).lignes)[k]; return `${nomDe(p)} (${PRODUITS[p].adr})`; },
  juste: (v, db) => Array.isArray(v.ordre) && v.ordre[k] === ordreDe(get(db).lignes)[k] }));
// La réclamation : une décision par article.
export const blocsReclam = (R) => R.plaintes.map((p) => ({ type: 'choix', id: `rec-${p.prod}`, lib: `${p.qte} ${nomDe(p.prod).toLowerCase()} ${p.cas === 'casse' ? 'cassés' : 'manquants'}, dit la boutique`,
  colonne: true, manque: `la décision pour ${nomDe(p.prod).toLowerCase()}`, choix: DECISIONS }));
export const jalonsReclam = (get, { poids, groupe }) => get(null).plaintes.map((_, i) => ({ id: `rec-${i + 1}`, titre: `La réclamation : l’article n° ${i + 1}`, groupe, poids,
  titreBilan: (db) => `La réclamation : ${nomDe(get(db).plaintes[i].prod).toLowerCase()}`, attendu: (db) => DECISIONS.find((x) => x.v === decisionDe(get(db).plaintes[i])).lib,
  juste: (v, db) => { const p = get(db).plaintes[i]; return v[`rec-${p.prod}`] === decisionDe(p); } }));
export const CHOIX_JOURS = JOURS.map((j) => ({ v: j, lib: j }));
export const CHOIX_SORTS = SORTS;
export { STATUTS, statutDe, cartons, detail, memes };

// ─────────────────────────────────────────── la banque « Avant de commencer » (préparation : la plateforme ; droit : la loi)
const q = (de) => (id, rubrique, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de, doc: 'site', rubrique, enonce, choix, juste, retour });
const banque = (de) => { const Q = q(de); return [
  Q('livre', 'preparation', 'La plateforme de La Villouët livre…', [{ v: 'boutiques', lib: 'les boutiques de France et les filiales à l’étranger' },
    { v: 'usines', lib: 'les usines du groupe' }, { v: 'pharmacies', lib: 'les pharmacies' }], 'boutiques', 'Les usines lui envoient les produits ; elle prépare les commandes des boutiques et des filiales.'),
  Q('ou', 'preparation', 'La plateforme est à…', [{ v: 'gacilly', lib: 'La Gacilly, dans le Morbihan, où la marque est née' }, { v: 'paris', lib: 'Paris' },
    { v: 'lyon', lib: 'Lyon' }], 'gacilly', 'Les usines et la plateforme sont à La Gacilly, en Bretagne.'),
  Q('articles', 'preparation', 'Chaque année, la plateforme prépare environ…', [{ v: '280m', lib: '280 millions d’articles' }, { v: '280', lib: '280 articles' },
    { v: '2800', lib: '2 800 articles' }], '280m', 'Et 180 000 palettes par an.'),
  Q('panache', 'preparation', 'Un carton panaché, c’est…', [{ v: 'detail', lib: 'un carton où l’on met des articles différents, au détail' },
    { v: 'plein', lib: 'un carton complet du fabricant' }, { v: 'vide', lib: 'un carton vide' }], 'detail', 'Une boutique qui veut 10 gels douche ne reçoit pas un carton de 24.'),
  Q('agec', 'droit', 'Selon la loi anti-gaspillage, des produits de beauté invendus mais intacts…', [{ v: 'donner', lib: 'se donnent, se réemploient ou se recyclent' },
    { v: 'detruire', lib: 'peuvent être détruits' }, { v: 'jeter', lib: 'se jettent à la poubelle' }], 'donner', 'Depuis 2022, détruire des invendus non alimentaires est interdit.'),
  Q('ingredients', 'droit', 'Sur l’emballage d’un produit de beauté, la loi oblige à écrire…', [{ v: 'ingredients', lib: 'la liste des ingrédients' },
    { v: 'prix', lib: 'le prix d’achat de la boutique' }, { v: 'vendeur', lib: 'le nom de la vendeuse' }], 'ingredients', 'Le règlement européen sur les cosmétiques l’impose, pour informer et protéger la cliente.'),
]; };
export const BANQUE_PREPA = banque('soizic');
export const BANQUE_BOUTIQUES = banque('ines');
const ouverture = (de, B) => (o = {}) => ({ id: 'avant-de-commencer', de, titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis « La plateforme » à gauche et réponds à mes questions.',
  documents: ['site'], tirage: { preparation: 2, droit: 1 }, questions: B.map((x) => x.id), ...o });
export const OUVERTURE_PREPA = ouverture('soizic', BANQUE_PREPA);
export const OUVERTURE_BOUTIQUES = ouverture('ines', BANQUE_BOUTIQUES);
export { PRODUITS, nomDe, TYPES, typeDe, ordreDe, DECISIONS, decisionDe };
