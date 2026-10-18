// CHEP (centre de service de Templemars, Nord) — l'univers commun des séances ENT-9.x (1re, C2.5 : traiter les retours des supports
// de charge). Créé par ENT-9.1 (brief `docs/briefs/ENT-9.1-chep-compte-palettes.md`), la première séance construite ; cadrage commun :
// `docs/briefs/COORDINATION-chep.md` (qui fait foi pour l'univers, le vocabulaire et les règles de calcul). Partagé par 9.1 à 9.4 :
// À LIRE, jamais à redéclarer dans une séance (identité, charte, l'équipe, les clients, le lexique, les conditions de location, les
// documents « CHEP en bref » et « Le droit », les gabarits des documents, la fonction `solde`). Chaque séance apporte ses documents
// tirés, ses fiches et ses jalons.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (coordination §2, recherche web de Cowork du 17/10/2026)
//
// Vérifié : CHEP fait de la location-gestion de palettes (filiale du groupe Brambles, en France depuis 1981 ; pools bleu CHEP, rouge LPR,
// brique Logipal) ; le loueur met des palettes à disposition d'un « émetteur », la location court jusqu'au transfert vers un
// « distributeur », transfert que l'émetteur déclare ; les palettes ne sont pas numérotées, le système repose sur la bonne foi des
// déclarations ; le loueur collecte, trie, répare et remet en circulation ; les palettes Europe (EPAL) s'échangent hors pool (Autorité de la
// concurrence, décision 09-D-33 du 10/11/2009, §10, §12, §29, §31, §32). CHEP France en 2025 : 260 salariés, 28 centres de service, plus de
// 45 millions de mouvements pour 1 400 clients (L'Officiel des transporteurs, 28/05/2026). Centre de Templemars : premier centre de tri et de
// réparation de CHEP en France, ouvert en 1984, le plus gros du réseau ; chiffres de 2017 (Terra Nuna, 11/10/2017) : 85 à 100 salariés,
// environ 100 camions par jour, 5 millions de palettes par an, une palette pèse environ 25 kg. Les Hauts-de-France sont le principal bassin de
// l'endive, campagne d'octobre à avril, cours à l'expédition par colis de 5 kg (DRAAF Hauts-de-France, bilan 2023-2024). Code civil : art. 1709
// (louage de choses), 1732 (le locataire répond des pertes et dégradations), 1103 (force obligatoire du contrat). Règlement (UE) 2025/40
// (PPWR), applicable depuis le 12/08/2026 : 40 % d'emballages de transport réutilisables au 1/01/2030 (trans.info, 07/10/2026).
// Vérifié par Claude Code le 18/10/2026 : le bleu d'accent du site chep.com (#0078bf, balise theme-color et feuille de style du site ; ce
// n'est pas un hex de charte publiée) ; les noms fictifs ci-dessous ne désignent aucune entreprise réelle (recherche web, voir le compte
// rendu du brief 9.1) ; la lecture des trois articles du Code civil et le format 1 200 × 1 000 de la palette bleue : voir le compte rendu.
// Construit (dit en pied de chaque document) : le service « relation clients et flux », Sandrine Delattre, Grégory Vandamme, Yannick Desmet ;
// tous les clients (émetteurs, distributeurs), leurs contacts, le transporteur de la collecte ; les numéros de compte et de documents, les
// quantités, le prix de location (0,04 € HT par palette et par jour), le délai de déclaration du contrat, le portail clients (nom et
// présentation : aucun écran réel de CHEP n'a été vu ni copié).
//
// Charte : le bleu de la marque reste au bandeau et au menu. Le bleu n'est ni rouge ni vert : le moteur ne le retire pas de la zone de
// travail (`core/types/entreprise-theme.js`). Le bleu du site (#0078bf) ne tient pas les 4,5 : 1 sur le fond papier pour du texte courant :
// l'accent est assombri (#006eb0, 4,8 : 1 sur le fond de page) et le bleu du site reste au nom « CHEP » du bandeau, en gros et en gras.
// Pas de logo image (accord de Tristan non demandé) : le nom en texte (`contenus/trames/logos/chep-texte.svg`). Thème papier : les documents
// sont des papiers clairs. Sur les cartes (9.2, 9.4), le bleu garde son sens (le client et son emplacement), le vert donne l'ordre.

import { catalogueSimple } from './entreprise-commun.js';

export const ENTREPRISE = {
  id: 'chep',
  nom: 'CHEP',
  sousTitre: 'Centre de service de Templemars (59) — relation clients et flux',
  exercice: 'Bienvenue au service relation clients et flux',
};

export const VOCAB = {
  unit: 'palette', unitPl: 'palettes',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'chep-templemars.example',
};

export const THEME = { accent: '#006eb0', papier: true };

export const LIEUX = {
  centre: 'Centre de service CHEP de Templemars (59), au sud de Lille',
};

// ─────────────────────────────────────────── l'équipe (construite) : au TU entre collègues, au VOUS avec les clients
export const EQUIPE = {
  sandrine: { nom: 'Sandrine Delattre', role: 'responsable relation clients (ta tutrice)', appel: 'Sandrine', registre: 'tu' },
  gregory: { nom: 'Grégory Vandamme', role: 'chef d’équipe au quai des retours', appel: 'Grégory', registre: 'tu' },
  yannick: { nom: 'Yannick Desmet', role: 'exploitant transport (il affrète les collectes)', appel: 'Yannick', registre: 'tu' },
};
export const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// ─────────────────────────────────────────── les clients (TOUS fictifs : une faute de déclaration ne s'attribue jamais à une entreprise réelle)
// Les émetteurs : ils reçoivent des palettes de CHEP et y chargent leur marchandise. `compte` : le numéro de compte palettes (construit).
export const EMETTEURS = {
  ternois: { id: 'ternois', nom: 'Endives du Ternois', forme: 'coopérative d’endives', ville: 'Saint-Pol-sur-Ternoise (62)', compte: 'ET-62-0417',
    produit: 'endives', contact: { nom: 'Hélène Caron', civ: 'Madame Caron', role: 'Responsable logistique', mail: 'h.caron@endives-du-ternois.example' } },
  lys: { id: 'lys', nom: 'Légumes de la Lys', forme: 'producteur de légumes', ville: 'Estaires (59)', compte: 'LL-59-0882',
    produit: 'légumes', contact: { nom: 'Thomas Deroo', civ: 'Monsieur Deroo', role: 'Responsable expéditions', mail: 't.deroo@legumes-de-la-lys.example' } },
};
// Les distributeurs : des plates-formes de produits frais, enseignes fictives dans des villes réelles. Tous sous contrat CHEP (coordination §4,
// règle 3). Vérifiés libres le 18/10/2026. « Distri Escaut » (Dourges), prévu par la coordination pour 9.2 et 9.4, désignait une vraie
// société de Caudry (SIREN 902223692) : renommé « Primeurs du Delta » le 18/10/2026 pour ENT-9.2 (nom vérifié libre sur les registres
// d’entreprises ; la plate-forme Delta 3 de Dourges est réelle, l’enseigne est inventée).
export const DISTRIBUTEURS = {
  'frais-nord': { id: 'frais-nord', nom: 'Frais du Nord', ville: 'Lesquin (59)', lib: 'Frais du Nord (Lesquin)' },
  'halles-artois': { id: 'halles-artois', nom: 'Halles d’Artois', ville: 'Douai (59)', lib: 'Halles d’Artois (Douai)' },
  'hainaut-primeurs': { id: 'hainaut-primeurs', nom: 'Hainaut Primeurs', ville: 'Prouvy (59)', lib: 'Hainaut Primeurs (Prouvy)' },
  marchelys: { id: 'marchelys', nom: 'MarchéLys', ville: 'Roubaix (59)', lib: 'MarchéLys (Roubaix)' },
  dourges: { id: 'dourges', nom: 'Primeurs du Delta', ville: 'Dourges (62)', lib: 'Primeurs du Delta (Dourges)' },
  'opale-frais': { id: 'opale-frais', nom: 'Opale Frais', ville: 'Dunkerque (59)', lib: 'Opale Frais (Dunkerque)' },
};
// Le transporteur sous-traitant de la collecte (9.2, 9.4) : fictif.
export const TRANSPORTEUR = { nom: 'Transports Lys-Escaut', ville: 'Lomme (59)' };
// Le centre de service, partenaire des émissions et des retours.
export const CENTRE = { id: 'templemars', nom: 'CHEP Templemars', lib: 'CHEP Templemars (centre de service)' };

// ─────────────────────────────────────────── les conditions de location (extrait reconstitué ; coordination §2, brief 9.1 §6.3)
export const PRIX_LOCATION = 0.04;   // € HT par palette et par jour (construit)
export const DELAI_CORRECTION = 60;  // jours après la facture (pratique publique de CHEP, à généraliser avec prudence)
export const CONDITIONS = [
  'Les palettes restent la propriété de CHEP.',
  `La location est due pour chaque palette inscrite au compte du client, chaque jour (${String(PRIX_LOCATION).replace('.', ',')} € HT par palette et par jour).`,
  'L’émetteur déclare chaque transfert sur le portail au plus tard le jour ouvré suivant l’expédition.',
  'Un transfert ne se déclare que vers un distributeur sous contrat CHEP.',
  'Seules les palettes CHEP se déclarent.',
  `Une erreur de déclaration se corrige dans les ${DELAI_CORRECTION} jours qui suivent la facture.`,
];

// ─────────────────────────────────────────── le compte palettes (coordination §4, règle 1 : calculé, jamais recopié)
// solde = solde de départ + émissions − transferts déclarés − retours (± corrections). Chaque argument : un nombre ou une liste de nombres.
const somme = (x) => (Array.isArray(x) ? x.reduce((s, n) => s + (Number(n) || 0), 0) : Number(x) || 0);
export function solde({ depart = 0, emissions = 0, transferts = 0, retours = 0, corrections = 0 } = {}) {
  return somme(depart) + somme(emissions) - somme(transferts) - somme(retours) + somme(corrections);
}
// Le coût d'une location : n palettes × j jours × le prix, en euros (arrondi au centime).
export const coutLocation = (n, jours) => Math.round(n * jours * PRIX_LOCATION * 100) / 100;

// ─────────────────────────────────────────── formats
export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const z2 = (n) => String(n).padStart(2, '0');
// « mar. 12/01 » ; `long` : « mardi 12/01/2027 » ; `annee` : « 12/01/2027 ».
export function date(iso, { long = false, annee = false } = {}) {
  const [a, m, j] = iso.split('-').map(Number);
  const jour = JOURS[new Date(a, m - 1, j).getDay()];
  if (annee) return `${z2(j)}/${z2(m)}/${a}`;
  return long ? `${jour} ${z2(j)}/${z2(m)}/${a}` : `${jour.slice(0, 3)}. ${z2(j)}/${z2(m)}`;
}
// L'heure d'un message : celle du SCÉNARIO, jamais la date réelle (règle de Tristan du 10/10/2026). Avec `db` et `volet`, on ajoute le temps
// réellement passé depuis l'ouverture de la séance : un message déclenché arrive « quelques minutes après ».
export function heureScenario(iso, hhmm, { db, volet, decalage = 0 } = {}) {
  const [a, m, j] = iso.split('-').map(Number), [h, mn] = hhmm.split(':').map(Number);
  const ouvert = db && db.volets && volet ? db.volets[volet] : 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(a, m - 1, j, h, mn).getTime() + ecoule + decalage;
}
export const nombre = (n) => new Intl.NumberFormat('fr-FR').format(n);
export const euros = (n) => `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} €`;
export const palettes = (n) => `${nombre(n)} palette${Math.abs(n) > 1 ? 's' : ''}`;
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ─────────────────────────────────────────── le lexique commun (coordination §3, le même dans les quatre séances)
export const LEXIQUE = {
  pool: 'Un parc de palettes partagé entre de nombreuses entreprises, géré par un loueur qui les récupère et les remet en état.',
  'location-gestion': 'CHEP reste propriétaire des palettes. Le client paie pour s’en servir, chaque jour où elles sont sur son compte.',
  émetteur: 'L’entreprise qui reçoit des palettes de CHEP et y charge sa marchandise (un producteur, un industriel).',
  distributeur: 'L’entreprise qui reçoit la marchandise sur les palettes (une plate-forme, un magasin). Elle doit avoir un contrat avec CHEP.',
  émission: 'CHEP livre des palettes vides à un émetteur : elles entrent sur son compte.',
  transfert: 'Les palettes partent chez un distributeur : elles passent du compte de l’émetteur à celui du distributeur, une fois le transfert déclaré.',
  retour: 'Les palettes reviennent dans un centre de service CHEP : elles sortent du compte du client.',
  solde: 'Le nombre de palettes dont le client est responsable, et dont il paie la location.',
  ramasse: 'L’enlèvement des palettes vides chez les distributeurs, pour les ramener au centre de service. On dit aussi « collecte ».',
  collecte: 'L’enlèvement des palettes vides chez les distributeurs, pour les ramener au centre de service. On dit aussi « ramasse ».',
  'centre de service': 'Le site où CHEP trie, contrôle, répare et stocke les palettes avant de les réémettre.',
  'palette Europe': 'Une palette en bois brut, marquée EPAL, qu’on échange une pour une. Elle n’appartient pas au pool CHEP.',
  'autre pool': 'Des palettes louées par un autre loueur (rouges chez LPR, brique chez Logipal). Elles ne se créditent pas sur un compte CHEP.',
  'bon de collecte': 'Le document qui accompagne les palettes vides collectées : le nombre annoncé par le distributeur.',
  réserve: 'Ce qu’on écrit sur le bon quand ce qu’on reçoit ne correspond pas à ce qui est annoncé.',
};

// ─────────────────────────────────────────── ce que le moteur exige (aucun article en jeu)
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}

// ─────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
// Les classes `ch-*` (propres à CHEP). Le cadre « Supports de charge » (`ch-supports`) est repérable par sa bordure, jamais surligné :
// l'élève doit le trouver dans chaque document (brief 9.1, ergonomie).
export const STYLE_DOCUMENTS = `
--douce:#555047;
.ch-doc{padding:14px 18px 0}
.ch-doc p{margin:0 0 8px}
.ch-t{margin:0; font-size:1.05rem; font-weight:800}
.ch-st{margin:2px 0 10px; font-size:.82rem; color:var(--douce)}
.ch-entete{display:flex; justify-content:space-between; align-items:baseline; gap:8px; border-bottom:2px solid var(--encre); padding-bottom:6px; margin-bottom:8px}
.ch-entete b{font-size:1.02rem; letter-spacing:.02em}
.ch-entete span{font-size:.78rem; color:var(--douce); text-align:right}
.ch-dl{display:grid; grid-template-columns:150px 1fr; gap:4px 12px; margin:6px 0 0; font-size:.9rem}
.ch-dl dt{color:var(--douce)}
.ch-dl dd{margin:0}
.ch-ul{margin:6px 0 0; padding-left:20px; font-size:.9rem}
.ch-ul li{margin:4px 0}
.ch-ol{margin:6px 0 0; padding-left:22px; font-size:.9rem}
.ch-ol li{margin:5px 0}
.ch-t2{border-collapse:collapse; width:100%; margin:6px 0; font-size:.86rem}
.ch-t2 th, .ch-t2 td{border:1px solid #d6cfc2; padding:4px 6px; text-align:left; vertical-align:top}
.ch-t2 th{font-weight:700}
.ch-t2 td.ch-n, .ch-t2 th.ch-n{text-align:right}
.ch-supports{border:2px solid var(--encre); border-radius:4px; padding:6px 10px; margin:10px 0; font-size:.92rem}
.ch-supports b{font-size:1.02rem}
.ch-gros{font-size:1.02rem; font-weight:800}
.ch-tampon{display:inline-block; border:2px solid var(--encre); border-radius:4px; padding:2px 8px; font-weight:800; letter-spacing:.06em; font-size:.8rem; margin-left:8px}
.ch-cite{margin:4px 0 8px; padding-left:10px; border-left:3px solid #d6cfc2; font-size:.88rem}
.ch-src{margin-top:10px !important; font-size:.76rem; color:var(--douce)}
.ch-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
export const PIED = (quoi) => `<p class="ch-pied">${quoi}</p>`;
export const PIED_RECONSTITUE = 'Document reconstitué — document pédagogique Prepalog. CHEP et son centre de Templemars sont réels ; les clients, les personnes, les numéros et les quantités sont construits.';

// Un en-tête de document : qui l'émet, à droite ses références.
const entete = (qui, refs) => `<div class="ch-entete"><b>${ech(qui)}</b><span>${refs.map(ech).join('<br>')}</span></div>`;
// Le cadre « Supports de charge » : les lignes (texte déjà échappé par l'appelant), en gras pour la ligne principale.
export const cadreSupports = (lignes, { titre = 'Supports de charge' } = {}) => `<div class="ch-supports"><span class="ch-st" style="display:block;margin:0 0 4px">${ech(titre)}</span>${lignes.join('<br>')}</div>`;

// Le bon d'émission : CHEP Templemars livre des palettes vides à un émetteur (elles ENTRENT sur son compte).
export function docBonEmission({ numero, iso, client, qte, camion = '' }) {
  return `<article class="ch-doc" aria-label="Bon d’émission ${ech(numero)}">
    ${entete('CHEP — centre de service de Templemars', [`Bon d’[[émission]] n° ${numero}`, `Compte ${client.compte}`])}
    <p class="ch-t">Bon d’émission — livraison de palettes vides</p>
    <p class="ch-st">Date de livraison : ${date(iso, { long: true })}</p>
    <dl class="ch-dl">
      <dt>Livré à</dt><dd>${ech(client.nom)} — ${ech(client.ville)}</dd>
      <dt>Compte client</dt><dd>${ech(client.compte)}</dd>
      <dt>Livré par</dt><dd>Camion CHEP depuis le [[centre de service]] de Templemars${camion ? ` (${ech(camion)})` : ''}</dd>
    </dl>
    ${cadreSupports([`<b>Palettes CHEP 1 200 × 1 000 livrées : ${palettes(qte)}</b>`, 'Ces palettes sont inscrites au compte du client à la date de livraison.'])}
    <p class="ch-st">Signature du chauffeur et du réceptionnaire : <span class="ch-tampon">REÇU</span></p>
    ${PIED(PIED_RECONSTITUE)}
  </article>`;
}

// Le bordereau de livraison d'un émetteur : sa marchandise part chez un distributeur. `supports` : { chep, europe, lpr } (nombres, 0 = absent).
// `duplicata` : le même bordereau envoyé deux fois (mention en tête). Le cadre dit « palettes CHEP », « palettes Europe (EPAL) » et « palettes
// rouges LPR » avec leur marquage : un pool ne se reconnaît jamais à sa seule couleur (impression noir et blanc).
export function docBordereau({ numero, iso, de, a, lignes, supports, duplicata = false }) {
  const S = { chep: 0, europe: 0, lpr: 0, ...supports };
  const total = S.chep + S.europe + S.lpr;
  const detail = [];
  if (S.chep) detail.push(`${palettes(S.chep)} <b>CHEP</b> 1 200 × 1 000 (bleues, marquées « CHEP »)`);
  if (S.europe) detail.push(`${palettes(S.europe)} [[palette Europe|Europe]] 1 200 × 800 (bois brut, marquées « EPAL ») — échange une pour une`);
  if (S.lpr) detail.push(`${palettes(S.lpr)} [[autre pool|LPR]] 1 200 × 1 000 (rouges, marquées « LPR »)`);
  const unSeul = detail.length === 1;
  const cadre = unSeul
    ? [`<b>${detail[0]}</b>`]
    : [`<b>Total : ${palettes(total)}</b>, dont :`, ...detail.map((d) => `— ${d}`)];
  return `<article class="ch-doc" aria-label="Bordereau de livraison ${ech(numero)}">
    ${entete(de.nom, [`${ech(de.forme)} — ${ech(de.ville)}`, `Bordereau de livraison n° ${numero}${duplicata ? ' <span class="ch-tampon">DUPLICATA</span>' : ''}`])}
    <p class="ch-t">Bordereau de livraison</p>
    <p class="ch-st">Expédié le ${date(iso, { long: true })}${duplicata ? ' — copie envoyée une seconde fois' : ''}</p>
    <dl class="ch-dl">
      <dt>Destinataire</dt><dd>${ech(a.nom)} — plate-forme de produits frais, ${ech(a.ville)}</dd>
      <dt>Transport</dt><dd>Camion frigorifique, départ du quai de ${ech(de.ville.replace(/\s*\(\d+\)$/, ''))}</dd>
    </dl>
    <table class="ch-t2"><thead><tr><th scope="col">Désignation</th><th scope="col" class="ch-n">Colis</th><th scope="col" class="ch-n">Poids net</th></tr></thead>
      <tbody>${lignes.map((l) => `<tr><td>${ech(l.designation)}</td><td class="ch-n">${nombre(l.colis)}</td><td class="ch-n">${nombre(l.poids)} kg</td></tr>`).join('')}</tbody></table>
    ${cadreSupports(cadre)}
    <p class="ch-st">Marchandise reçue conforme, le destinataire : <span class="ch-tampon">SIGNÉ</span></p>
    ${PIED(PIED_RECONSTITUE)}
  </article>`;
}

// Le bon de retour : un émetteur rend des palettes vides au centre de service (elles SORTENT de son compte).
export function docBonRetour({ numero, iso, client, qte, motif = 'surplus de campagne' }) {
  return `<article class="ch-doc" aria-label="Bon de retour ${ech(numero)}">
    ${entete('CHEP — centre de service de Templemars', [`Bon de [[retour]] n° ${numero}`, `Compte ${client.compte}`])}
    <p class="ch-t">Bon de retour — palettes vides rendues au centre de service</p>
    <p class="ch-st">Date de réception au centre : ${date(iso, { long: true })}</p>
    <dl class="ch-dl">
      <dt>Rendues par</dt><dd>${ech(client.nom)} — ${ech(client.ville)}</dd>
      <dt>Compte client</dt><dd>${ech(client.compte)}</dd>
      <dt>Motif</dt><dd>${ech(motif)}</dd>
      <dt>Contrôle au quai</dt><dd>Comptées et triées au quai des retours de Templemars</dd>
    </dl>
    ${cadreSupports([`<b>Palettes CHEP rendues : ${palettes(qte)}</b>`, 'Ces palettes sortent du compte du client à la date de réception.'])}
    <p class="ch-st">Chef d’équipe du quai des retours : <span class="ch-tampon">CONTRÔLÉ</span></p>
    ${PIED(PIED_RECONSTITUE)}
  </article>`;
}

// La commande de palettes : un émetteur commande des palettes vides, à livrer plus tard (pas encore un mouvement).
export function docCommande({ numero, iso, client, qte, livraisonIso }) {
  return `<article class="ch-doc" aria-label="Commande de palettes ${ech(numero)}">
    ${entete(client.nom, [`${ech(client.forme)} — ${ech(client.ville)}`, `Commande n° ${numero}`])}
    <p class="ch-t">Commande de palettes vides à CHEP</p>
    <p class="ch-st">Passée le ${date(iso, { long: true })} sur le portail clients — compte ${ech(client.compte)}</p>
    <dl class="ch-dl">
      <dt>Demandé</dt><dd><b>${palettes(qte)}</b> CHEP 1 200 × 1 000, vides</dd>
      <dt>Livraison souhaitée</dt><dd><b>${date(livraisonIso, { long: true })}</b>, au quai de ${ech(client.ville.replace(/\s*\(\d+\)$/, ''))}</dd>
      <dt>Statut</dt><dd>Commande enregistrée — en attente de livraison par le centre de Templemars</dd>
    </dl>
    ${cadreSupports(['Aucune palette livrée à ce jour : la livraison fera l’objet d’un bon d’[[émission]].'], { titre: 'Supports de charge' })}
    ${PIED(PIED_RECONSTITUE)}
  </article>`;
}

// Le relevé du compte d'un client à une date : le solde (document CHEP, la ligne de départ du relevé que l'élève fait).
export function docReleve({ client, iso, solde: s, periode }) {
  return `<article class="ch-doc" aria-label="Relevé du compte ${ech(client.compte)}">
    ${entete('CHEP — portail clients', [`Relevé du compte ${client.compte}`, ech(client.nom)])}
    <p class="ch-t">Relevé du compte palettes</p>
    <p class="ch-st">${periode ? `${ech(periode)} — ` : ''}arrêté au ${date(iso, { long: true })}</p>
    <dl class="ch-dl">
      <dt>Client</dt><dd>${ech(client.nom)} — ${ech(client.ville)}</dd>
      <dt>Pool</dt><dd>Palettes CHEP 1 200 × 1 000</dd>
    </dl>
    ${cadreSupports([`<b>[[solde|Solde]] du compte au ${date(iso)} : ${palettes(s)} CHEP</b>`,
    `C’est le nombre de palettes dont ${ech(client.nom)} est responsable à cette date, et dont la location est due chaque jour.`], { titre: 'Solde' })}
    <p class="ch-st">Les mouvements déclarés après cette date apparaîtront sur le relevé suivant.</p>
    ${PIED(PIED_RECONSTITUE)}
  </article>`;
}

// Les conditions de location (extrait reconstitué, brief 9.1 §6.3, pied mot pour mot).
export const DOC_CONDITIONS = { id: 'conditions', titre: 'Conditions de location (extrait)', court: 'Conditions de location',
  html: `<article class="ch-doc" aria-label="Conditions de location">
    ${entete('CHEP France', ['Contrat de [[location-gestion]] de palettes', 'Extrait des conditions'])}
    <p class="ch-t">Conditions de location — extrait</p>
    <p class="ch-st">Ce que le client s’engage à faire quand il signe avec CHEP</p>
    <ol class="ch-ol">${CONDITIONS.map((c, i) => `<li><b>Art. ${i + 1}.</b> ${i === 2 ? c.replace('transfert', '[[transfert]]') : i === 3 ? c.replace('distributeur', '[[distributeur]]') : c}</li>`).join('')}</ol>
    ${PIED('Extrait reconstitué à partir du fonctionnement public du pool (Autorité de la concurrence, 2009 ; CHEP) — document pédagogique, non contractuel.')}
  </article>` };

// CHEP en bref (pour « Avant de commencer » : l'information est donnée, la question la fait lire). Faits vérifiés et datés (coordination §2).
export const DOC_CHEP = { id: 'chep', titre: 'CHEP en bref', court: 'CHEP en bref',
  html: `<article class="ch-doc" aria-label="CHEP en bref">
    <p class="ch-t">CHEP en bref</p>
    <p class="ch-st">Ce que tu dois savoir avant de commencer</p>
    <ul class="ch-ul">
      <li><b>CHEP</b> loue des palettes : c’est de la [[location-gestion]]. CHEP reste propriétaire des palettes bleues, les met à disposition des
        entreprises, les récupère, les trie, les répare et les remet en circulation. On parle d’un [[pool]] de palettes. CHEP est une filiale du
        groupe Brambles et travaille en France depuis 1981 (source : Autorité de la concurrence, 2009).</li>
      <li>Le fonctionnement : CHEP livre des palettes vides à un [[émetteur]] (un producteur, un industriel), qui y charge sa marchandise et
        l’expédie à un [[distributeur]] (une plate-forme, un magasin). <b>La location court jusqu’au [[transfert]]</b> vers le distributeur, et
        <b>c’est l’émetteur qui déclare ce transfert</b>. Les palettes ne sont pas numérotées : tout repose sur les déclarations (même source).</li>
      <li>Une [[palette Europe]] (bois brut, marquée EPAL) ne fait pas partie du pool : elle s’échange une pour une. Les palettes rouges sont
        celles d’un [[autre pool]], LPR.</li>
      <li><b>CHEP France en 2025</b> : 260 salariés, 28 centres de service, plus de 45 millions de mouvements pour 1 400 clients, environ 900
        transports par jour (source : L’Officiel des transporteurs, 28/05/2026).</li>
      <li>Le <b>[[centre de service]] de Templemars</b>, au sud de Lille, est le premier centre de tri et de réparation de CHEP en France, ouvert
        en 1984, et le plus gros du réseau. Chiffres de 2017 : 85 à 100 salariés, environ 100 camions par jour, 5 millions de palettes par an.
        Les palettes y sont inspectées, triées, réparées et stockées avant de repartir chez un client. Une palette pèse environ 25 kg
        (source : Terra Nuna, 11/10/2017 — chiffres de l’époque).</li>
      <li>CHEP sert surtout les <b>fruits et légumes</b>. Les Hauts-de-France sont le principal bassin de production de l’<b>endive</b>, en
        campagne d’octobre à avril ; elle s’expédie en colis de 5 kg (source : DRAAF Hauts-de-France, bilan 2023-2024).</li>
    </ul>
    ${PIED('Document pédagogique Prepalog, à partir de sources publiques citées. Le service relation clients et les personnes de la séance sont construits.')}
  </article>` };

// Le droit : les trois articles du Code civil (texte mot pour mot : voir le compte rendu du brief 9.1 pour leur relecture) et le règlement
// européen sur les emballages (résumé, source et date). L'article 1732 compte pour la séance : le locataire répond des palettes perdues.
export const ARTICLES = {
  1709: 'Le louage des choses est un contrat par lequel l’une des parties s’oblige à faire jouir l’autre d’une chose pendant un certain temps, et moyennant un certain prix que celle-ci s’oblige de lui payer.',
  1732: 'Il répond des dégradations ou des pertes qui arrivent pendant sa jouissance, à moins qu’il ne prouve qu’elles ont eu lieu sans sa faute.',
  1103: 'Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits.',
};
export const DOC_DROIT = { id: 'droit', titre: 'Le droit : louer des palettes', court: 'Le droit',
  html: `<article class="ch-doc" aria-label="Le droit : louer des palettes">
    <p class="ch-t">Le droit : louer des palettes</p>
    <p class="ch-st">Code civil — trois articles qui s’appliquent au contrat entre CHEP et ses clients</p>
    <p><b>Article 1709</b> (le louage de choses, c’est-à-dire la location)</p>
    <p class="ch-cite">« ${ARTICLES[1709]} »</p>
    <p><b>Article 1732</b> (le locataire répond de la chose louée)</p>
    <p class="ch-cite">« ${ARTICLES[1732]} »</p>
    <p><b>Article 1103</b> (le contrat s’impose à ceux qui l’ont signé)</p>
    <p class="ch-cite">« ${ARTICLES[1103]} »</p>
    <p class="ch-st" style="margin-top:12px">Ce que ça veut dire pour un client de CHEP</p>
    <ul class="ch-ul">
      <li>Le client <b>loue</b> les palettes : il paie pour s’en servir pendant un temps, elles ne lui appartiennent jamais.</li>
      <li>Pendant qu’il les a, il <b>répond des palettes perdues ou abîmées</b>, sauf s’il prouve que ce n’est pas de sa faute.</li>
      <li>Ce qu’il a signé (déclarer chaque transfert, payer la location chaque jour) <b>s’impose à lui comme une loi</b>.</li>
    </ul>
    <p class="ch-st" style="margin-top:12px">Et l’Europe ?</p>
    <p>Le <b>règlement (UE) 2025/40 sur les emballages</b> (PPWR), applicable depuis le 12 août 2026, pousse au <b>réemploi</b> : au 1er janvier 2030,
      au moins 40 % des emballages de transport visés, palettes comprises, devront être réutilisables et suivis dans un système de réemploi
      (70 % en 2040). Louer des palettes dans un pool est une façon de réemployer, mais le règlement n’oblige personne à louer
      (source : trans.info, 07/10/2026).</p>
    <p class="ch-pied">Textes réels — sources : Code civil, art. 1709, 1732 et 1103 (Légifrance) ; règlement (UE) 2025/40 (résumé d’après trans.info, 07/10/2026).</p>
  </article>` };
