// Lidl — la plateforme logistique et direction régionale de Meaux (Seine-et-Marne) : l'UNIVERS commun des séances ENT-21.1 à 21.6 (2de GATL,
// entreprise n° 21 ; C1.3 préparer la réception en 21.1 et 21.2, OTM-C1.4 la cotation en 21.3 et 21.5, AGO-2.2 et AGO-1.3 la facture et la
// fiche fournisseur en 21.4 et 21.6) et les DOCUMENTS et blocs de fiche qu'elles partagent.
// Cadrage : `docs/briefs/lidl/CADRAGE-lidl-2de.md` ; données : `contenus/lidl-donnees.js` ; fabrique : `contenus/fabrique-fiches.js`.
//
// L'élève découvre trois métiers autour d'un même camion : la réception avec Fatou (cheffe de quai), le transport avec Mehdi (service transport),
// la comptabilité des fournisseurs avec Claire. Tous CONSTRUITS, prénoms seuls ; aucune parole n'est prêtée à un salarié réel. Tutoiement.

import { catalogueSimple } from './entreprise-commun.js';
import {
  ZONES, QUAIS, zoneDe, PRODUITS, CONTROLES, LIMITES, releveJuste, HEURES, zoneCamion, planning, MIN_PALETTE, MIN_CONTROLE, duree,
  GRILLE, FROID, HAYON, ATTENTE, zoneKm, cotation, COUT_KM, COUT_HEURE, MARGE, revient, prixVente,
  TVA, etatLigne, htCorrige, tvaDe, ttcDe, jourLong, echeance, echeancesPossibles, finDecade, CHAMPS, champsAJour, nombreFr, euros,
} from './lidl-donnees.js';
import { memes, proche } from './fabrique-fiches.js';

// ─────────────────────────────────────────── l'univers
export const LOGO = './contenus/trames/logos/lidl.svg';
export const ENTREPRISE = {
  id: 'lidl',
  nom: 'Lidl',
  sousTitre: 'Plateforme logistique et direction régionale de Meaux (Seine-et-Marne)',
  exercice: 'À la plateforme',
  logo: LOGO,
};
export const VOCAB = { unit: 'palette', unitPl: 'palettes', sizeLabel: '', sizeShort: '', configWord: '', icone: 'palette', mailDomain: 'lidl.example' };
// Charte : le bleu du logo officiel (#0050aa, relevé dans le SVG de Wikimedia Commons le 27/10/2026), texte blanc posé dessus (contraste 7,9:1).
export const THEME = { accent: '#0050aa', surAccent: '#ffffff', papier: true };
export const CATALOGUE = catalogueSimple(Object.entries(PRODUITS).map(([ref, x]) => ({ ref: ref.toUpperCase(), designation: x.nom, marque: 'Produit construit',
  categorie: 'Produit', fournisseur: 'F-LI', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-LI', brand: 'Lidl', name: 'Fournisseurs (construits)', adr: '', cp: '77100', ville: 'Meaux', contact: '', tel: '',
  email: 'reception@lidl.example', delai: 2, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Lidl et sa plateforme de Meaux (Seine-et-Marne) : 55 000 m², dont 28 000 m² de produits secs et 24 000 m² de froid '
  + '(de +14 °C à -28 °C), ouverte en 2022, qui livre 61 magasins ; la direction régionale y a ses bureaux. Construits : les quais, les fournisseurs, '
  + 'les camions, les rendez-vous, les tarifs, les coûts, les factures et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  fatou: { nom: 'Fatou', role: 'cheffe de quai à la réception (ta tutrice pour la réception)', appel: 'Fatou', registre: 'tu',
    metier: 'Cheffe de quai, réception', phrase: 'Je prépare l’arrivée des camions des fournisseurs : les rendez-vous, les quais, les contrôles.' },
  mehdi: { nom: 'Mehdi', role: 'agent du service transport (ton tuteur pour le transport)', appel: 'Mehdi', registre: 'tu',
    metier: 'Service transport', phrase: 'J’organise la livraison des magasins : je compare ce que coûtent les transporteurs et nos propres camions.' },
  claire: { nom: 'Claire', role: 'comptable fournisseurs à la direction régionale (ta tutrice pour la comptabilité)', appel: 'Claire', registre: 'tu',
    metier: 'Comptable fournisseurs', phrase: 'Je contrôle les factures des fournisseurs, je prépare leur paiement et je tiens leurs fiches à jour.' },
};
export const MAIL_FATOU = 'fatou@lidl.example';
export const MAIL_MEHDI = 'mehdi@lidl.example';
export const MAIL_CLAIRE = 'claire@lidl.example';
export const TUTEUR_RECEPTION = { nom: 'Fatou, cheffe de quai', mail: MAIL_FATOU, appel: 'Fatou' };
export const TUTEUR_TRANSPORT = { nom: 'Mehdi, service transport', mail: MAIL_MEHDI, appel: 'Mehdi' };
export const TUTEUR_COMPTA = { nom: 'Claire, comptable fournisseurs', mail: MAIL_CLAIRE, appel: 'Claire' };
export const PERSONNES = { fatou: EQUIPE.fatou, mehdi: EQUIPE.mehdi, claire: EQUIPE.claire };

// ─────────────────────────────────────────── aides
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pied = (t) => `<p class="li-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="li-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="li-doc" aria-label="${ech(titre)}">${corps}</article>` });
const entete = (t, st) => `<div class="li-entete"><img class="li-logo" src="${LOGO}" alt="Lidl"><div><p class="li-t">${ech(t)}</p>${st ? `<p class="li-st">${ech(st)}</p>` : ''}</div></div>`;
const prod = (refs) => refs.map((r) => PRODUITS[r].nom).join(', ');

export const STYLE = `
--douce:#555047;
.li-doc{padding:14px 18px 0}
.li-doc p{margin:0 0 8px}
.li-entete{display:flex; gap:12px; align-items:center; border-bottom:2px solid #555047; padding-bottom:6px; margin-bottom:10px}
.li-logo{height:36px; width:auto}
.li-t{margin:0; font-size:1.06rem; font-weight:800}
.li-st{margin:2px 0 0; font-size:.84rem; color:var(--douce)}
.li-ul{margin:4px 0 8px; padding-left:20px; font-size:.93rem}
.li-ul li{margin:4px 0}
.li-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.li-loi{margin:4px 0 8px; padding:4px 10px; border-left:3px solid #555047; font-size:.92rem}
.li-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.li-table th, .li-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left; vertical-align:top}
.li-table th{color:var(--douce); font-weight:600}
.li-table .li-d{text-align:right; white-space:nowrap}
.li-h{margin:10px 0 2px; font-weight:700}
.li-mail{border:1px solid #d6d0c3; border-radius:6px; padding:8px 12px; margin:6px 0}
.li-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents communs
export const DOC_SITE = doc('site', 'La plateforme de Meaux', 'La plateforme', `${entete('La plateforme logistique de Meaux', 'Seine-et-Marne (77), à l’est de Paris')}
  <p>Lidl vend surtout des produits alimentaires dans environ <b>1 600 magasins</b> en France. Chaque plateforme régionale reçoit les produits des
    <b>fournisseurs</b>, les garde à la bonne température et prépare les livraisons de ses magasins.</p>
  <ul class="li-ul">
    <li>En activité depuis <b>juin 2022</b>, inaugurée en <b>septembre 2022</b> : <b>55 000 m²</b>.</li>
    <li><b>28 000 m²</b> pour les produits secs, <b>24 000 m²</b> de cellules froides, de <b>+14 °C à -28 °C</b>, dont environ 6 700 m² pour les
      fruits et légumes, gardés un peu sous +10 °C.</li>
    <li>Elle livre <b>61 magasins</b>. Les bureaux de la <b>direction régionale</b> sont sur le site : la comptabilité des fournisseurs y travaille.</li>
    <li>Le non-alimentaire reste à l’entrepôt voisin de Crégy-lès-Meaux.</li>
  </ul>
  ${pied('Document pédagogique. Sources : Réussir (26/09/2022), étude de cas Condair (xpair), Bourse Inside (17/09/2026).')}`);

export const DOC_EQUIPE = doc('equipe', 'L’équipe', 'L’équipe', `${entete('Les personnes de ton stage', 'Prénoms imaginés pour l’exercice')}
  <table class="li-table"><thead><tr><th scope="col">Qui</th><th scope="col">Ce qu’il ou elle fait</th></tr></thead><tbody>
    ${Object.values(EQUIPE).map((p) => `<tr><td><b>${ech(p.nom)}</b><br><span class="li-st">${ech(p.metier)}</span></td><td>${ech(p.phrase)}</td></tr>`).join('')}
  </tbody></table>
  ${pied('Équipe et prénoms CONSTRUITS pour l’exercice. Document pédagogique.')}`);

// C1.3 : les zones, les quais, les températures.
export const DOC_ZONES = doc('zones', 'Les zones et les quais', 'Les zones', `${entete('Les zones et les quais de réception', 'Chaque produit a sa zone, chaque zone ses quais')}
  <table class="li-table"><thead><tr><th scope="col">Zone</th><th scope="col">Produits</th><th scope="col">Quais</th></tr></thead><tbody>
    ${ZONES.map((z) => `<tr><td><b>${ech(z.lib)}</b></td><td>${ech(z.ex)}</td>
      <td>${z.quais.map((q) => `quai ${q}`).join(' et ')}</td></tr>`).join('')}
  </tbody></table>
  <div class="li-regle"><b>La chaîne du froid</b> ne doit jamais être rompue : un produit frais ou surgelé va directement de son camion à sa zone, par un
    quai de sa zone. Températures à respecter à l’arrivée : <b>frais : +${LIMITES.frais.max} °C au plus</b> ; <b>surgelés : ${LIMITES.surgele.max} °C au plus</b>
    (la loi) ; <b>fruits et légumes : de +${LIMITES.fl.min} à +${LIMITES.fl.max} °C</b>. Hors de ces limites, on ne décharge pas : on prévient la cheffe de quai.</div>
  ${pied('Températures du site RÉELLES (de +14 à -28 °C ; surgelés à -18 °C au plus, arrêté du 21/12/2009) ; quais et limites des fruits et légumes CONSTRUITS. Document pédagogique.')}`);

export const DOC_RECEPTION = doc('reception', 'Préparer une réception', 'La réception', `${entete('Préparer et contrôler une réception', 'Le livret de la cheffe de quai')}
  <ol class="li-ul">
    <li>Le fournisseur prend <b>rendez-vous</b> : un créneau d’une heure, sur un quai de la zone de ses produits.</li>
    <li>Avant l’arrivée, on prépare le quai, le chariot, la place en zone et le <b>bon de commande</b>.</li>
    <li>À l’arrivée, on contrôle : la <b>température</b> du camion et des produits ; le <b>nombre de palettes</b>, comparé à la commande ;
      l’<b>état</b> des palettes et des emballages ; les <b>dates limites</b> (DLC) des produits frais.</li>
    <li>Un problème ? On l’écrit sur le bon de livraison, <b>avant de signer</b> (une « réserve » précise), et on prévient la cheffe de quai.</li>
  </ol>
  <p>Les <b>prix</b> ne se contrôlent pas au quai : la comptabilité les vérifie sur la facture.</p>
  ${pied('Procédure CONSTRUITE d’après l’usage. Document pédagogique.')}`);

const tdZone = (z) => ech(zoneDe(z).court);
export const docCamions = (get) => doc('camions', 'Les camions du matin', 'Les camions', (db) => `${entete('Les camions attendus ce matin', 'Le planning de la réception')}
  <table class="li-table"><thead><tr><th scope="col">Camion</th><th scope="col">Fournisseur</th><th scope="col">Produits</th><th class="li-d" scope="col">Palettes</th></tr></thead><tbody>
    ${get(db).map((c) => `<tr><td><b>${c.id}</b></td><td>${ech(c.de)}</td><td>${ech(prod(c.produits))}</td><td class="li-d">${c.palettes}</td></tr>`).join('')}
  </tbody></table>${pied('Fournisseurs et camions CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export const docReleves = (R) => doc('releves', 'Les relevés de température', 'Les relevés', `${entete('Les relevés de température à l’arrivée', 'Thermomètre du quai')}
  <table class="li-table"><thead><tr><th scope="col">Relevé</th><th scope="col">Camion</th><th class="li-d" scope="col">Température lue</th></tr></thead><tbody>
    ${R.map((r) => `<tr><td>${r.id}</td><td>${ech(r.camion)}</td><td class="li-d">${r.t > 0 ? '+' : ''}${n(r.t)} °C</td></tr>`).join('')}
  </tbody></table>${pied('Relevés CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export const docRdv = (D) => doc('rdv', 'Les demandes de rendez-vous', 'Les rendez-vous', `${entete('Les demandes de rendez-vous du lundi 9 novembre', 'Dans l’ordre où elles sont arrivées')}
  <table class="li-table"><thead><tr><th scope="col">Ordre</th><th scope="col">Fournisseur</th><th scope="col">Produits</th><th class="li-d" scope="col">Palettes</th><th class="li-d" scope="col">Heure demandée</th></tr></thead><tbody>
    ${D.map((c, i) => `<tr><td>${i + 1} · <b>${c.id}</b></td><td>${ech(c.de)}</td><td>${ech(prod(c.produits))}</td><td class="li-d">${c.palettes}</td><td class="li-d">${c.heure} h</td></tr>`).join('')}
  </tbody></table>
  <div class="li-regle"><b>La règle des rendez-vous</b> : un créneau d’<b>une heure</b> par quai. On traite les demandes <b>dans l’ordre d’arrivée</b> :
    si tous les quais de la zone sont déjà pris à l’heure demandée, le camion passe à l’<b>heure suivante</b> où un quai de sa zone est libre.<br>
    <b>La durée de déchargement</b> : ${MIN_PALETTE} minutes par palette, plus ${MIN_CONTROLE} minutes de contrôle.</div>
  ${pied('Demandes, règle des créneaux et durées CONSTRUITES pour l’exercice. Document pédagogique.')}`);

// OTM-C1.4 : la grille du transporteur, les coûts de la plateforme.
export const DOC_GRILLE = doc('grille', 'La grille du transporteur', 'La grille', `${entete('La grille tarifaire du transporteur frigorifique', 'Livraison des magasins, prix hors taxes')}
  <table class="li-table"><thead><tr><th scope="col">Distance plateforme → magasin</th><th class="li-d" scope="col">Prix par palette</th></tr></thead><tbody>
    ${GRILLE.map((g) => `<tr><td>${ech(g.lib)}</td><td class="li-d">${euros(g.prix)}</td></tr>`).join('')}
  </tbody></table>
  <ul class="li-ul">
    <li><b>Supplément froid</b> (camion frigorifique, produits frais ou surgelés) : <b>+${FROID * 100} %</b> du prix du transport.</li>
    <li><b>Hayon</b> (le magasin n’a pas de quai) : <b>${euros(HAYON)}</b> par livraison.</li>
    <li><b>Attente</b> au magasin : les 30 premières minutes sont gratuites, puis <b>${euros(ATTENTE)} par heure entamée</b>.</li>
  </ul>
  <p>Le prix total = le transport + le supplément froid + les prestations annexes (hayon, attente).</p>
  ${pied('Grille, supplément et prestations CONSTRUITS pour l’exercice (forme usuelle d’une grille de transport). Document pédagogique.')}`);
export const DOC_COUTS = doc('couts', 'Nos coûts', 'Nos coûts', `${entete('Ce que coûte notre propre camion', 'Le contrôle de gestion de la plateforme')}
  <ul class="li-ul">
    <li><b>${euros(COUT_KM)} par kilomètre</b> parcouru (carburant, entretien, péage) : on compte l’<b>aller et le retour</b>.</li>
    <li><b>${euros(COUT_HEURE)} par heure</b> de conducteur.</li>
  </ul>
  <p><b>Coût de revient</b> = kilomètres (aller et retour) × ${n(COUT_KM)} + heures × ${n(COUT_HEURE)}.<br>
    Si la plateforme faisait payer cette livraison, son <b>prix de vente</b> serait le coût de revient + <b>${MARGE * 100} %</b>.</p>
  ${pied('Coûts et marge CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export const docMagasins = (get) => doc('magasins', 'Les magasins', 'Les magasins', (db) => `${entete('Les magasins à livrer', 'Distance depuis la plateforme')}
  <table class="li-table"><thead><tr><th scope="col">Magasin</th><th class="li-d" scope="col">Distance</th></tr></thead><tbody>
    ${get(db).magasins.map((m) => `<tr><td>Magasin ${m.id.slice(1)}</td><td class="li-d">${m.km} km</td></tr>`).join('')}
  </tbody></table>${pied('Magasins et distances CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export const docLivraison = (get) => doc('livraison', 'La livraison à chiffrer', 'La livraison', (db) => { const L = get(db).livraison;
  return `${entete('La livraison à chiffrer', 'Bon de livraison du transporteur')}
  <table class="li-table"><tbody>
    <tr><th scope="row">Magasin</th><td>Magasin ${L.magasin.slice(1)} (${L.km} km)</td></tr>
    <tr><th scope="row">Palettes</th><td>${L.palettes} palettes de produits ${tdZone(L.zone)}</td></tr>
    <tr><th scope="row">Hayon</th><td>${L.hayon ? 'oui : le magasin n’a pas de quai' : 'non : le magasin a un quai'}</td></tr>
    <tr><th scope="row">Attente au magasin</th><td>${L.attente} minutes</td></tr>
    <tr><th scope="row">Durée de la tournée (notre camion)</th><td>${L.heures} heures</td></tr>
  </tbody></table>${pied('Livraison CONSTRUITE pour l’exercice. Document pédagogique.')}`; });

// AGO-2.2 et AGO-1.3 : la facture, la règle de paiement, le courrier et la fiche du fournisseur.
const p2 = (x) => euros(x);
export const docFacture = (get) => doc('facture', 'Les trois documents', 'La facture', (db) => { const F = get(db);
  return `${entete(`${F.fournisseur} : livraison du ${jourLong(F.livraison)}`, `Facture n° ${F.no}`)}
  <p class="li-h">1. Le bon de commande (ce que nous avons commandé)</p>
  <table class="li-table"><thead><tr><th scope="col">Produit</th><th class="li-d" scope="col">Quantité</th><th class="li-d" scope="col">Prix unitaire HT</th></tr></thead><tbody>
    ${F.lignes.map((l, i) => `<tr><td>L${i + 1} · ${ech(l.lib)}</td><td class="li-d">${l.cmd}</td><td class="li-d">${p2(l.prix)}</td></tr>`).join('')}</tbody></table>
  <p class="li-h">2. Le bon de réception (ce que le quai a reçu)</p>
  <table class="li-table"><thead><tr><th scope="col">Produit</th><th class="li-d" scope="col">Quantité reçue</th></tr></thead><tbody>
    ${F.lignes.map((l, i) => `<tr><td>L${i + 1} · ${ech(l.lib)}</td><td class="li-d">${l.recu}</td></tr>`).join('')}</tbody></table>
  <p class="li-h">3. La facture du fournisseur</p>
  <table class="li-table"><thead><tr><th scope="col">Produit</th><th class="li-d" scope="col">Quantité</th><th class="li-d" scope="col">Prix unitaire HT</th><th class="li-d" scope="col">Montant HT</th></tr></thead><tbody>
    ${F.lignes.map((l, i) => `<tr><td>L${i + 1} · ${ech(l.lib)}</td><td class="li-d">${l.factQ}</td><td class="li-d">${p2(l.factP)}</td><td class="li-d">${p2(l.factQ * l.factP)}</td></tr>`).join('')}</tbody></table>
  ${pied('Fournisseur, produits, quantités et prix CONSTRUITS pour l’exercice. Document pédagogique.')}`; });
export const DOC_PAIEMENT = doc('paiement', 'Payer un fournisseur', 'Le paiement', `${entete('Contrôler une facture et préparer le paiement', 'La procédure de la comptabilité fournisseurs')}
  <ol class="li-ul">
    <li>On <b>rapproche</b> trois documents, ligne par ligne : le bon de commande, le bon de réception, la facture.</li>
    <li>On ne paie que ce qui a été <b>reçu</b>, au <b>prix de la commande</b> : montant HT à payer = quantité reçue × prix commandé.</li>
    <li>On ajoute la <b>TVA à ${n(TVA * 100)} %</b> (produits alimentaires) : TVA = HT × ${String(TVA).replace('.', ',')} ; TTC = HT + TVA (au centime).</li>
  </ol>
  <div class="li-loi"><b>Le délai de paiement</b> des produits alimentaires périssables : au plus tard <b>30 jours après la fin de la décade de livraison</b>
    (Code de commerce, L441-11). Les décades : du 1er au 10, du 11 au 20, du 21 à la fin du mois. Exemple : livré le 4 mars → fin de décade le 10 mars →
    à payer au plus tard le 9 avril.</div>
  ${pied('Règle de délai RÉELLE (résumé de la loi, pas une citation) ; procédure CONSTRUITE d’après l’usage. Document pédagogique.')}`);
const ligneFiche = (k, v) => `<tr><th scope="row">${ech(CHAMPS.find((c) => c.v === k).lib)}</th><td>${ech(v)}</td></tr>`;
export const docCourrier = (get) => doc('courrier', 'Le courrier et le courriel', 'Le courrier', (db) => { const F = get(db);
  return `${entete('Deux messages du fournisseur ?', 'Reçus à la comptabilité cette semaine')}
  <div class="li-mail"><b>Courrier papier, signé du gérant, sur l’en-tête du fournisseur</b> (${ech(F.fournisseur)})<br>
    Nous vous informons de changements dans nos coordonnées :<ul class="li-ul">${Object.entries(F.courrier).map(([k, v]) => `<li>${ech(CHAMPS.find((c) => c.v === k).lib)} : ${ech(v)}</li>`).join('')}</ul></div>
  <div class="li-mail"><b>Courriel reçu de « comptabilite.fournisseur@mail-rapide.example »</b><br>
    URGENT. Notre banque a changé. Merci de payer notre prochaine facture sur le nouveau RIB joint, dès aujourd’hui. Ne répondez pas à ce message :
    nous sommes injoignables par téléphone cette semaine.</div>
  ${pied('Courrier et courriel CONSTRUITS pour l’exercice (le courriel imite une fraude réelle et courante, « au faux fournisseur »). Document pédagogique.')}`; });
export const docFiche = (get) => doc('fiche', 'La fiche du fournisseur', 'La fiche', (db) => { const F = get(db);
  return `${entete('La fiche du fournisseur', `${F.fournisseur}, telle qu’elle est enregistrée`)}
  <table class="li-table"><tbody>${ligneFiche('adresse', F.fiche.adresse)}${ligneFiche('telephone', F.fiche.telephone)}${ligneFiche('contact', F.fiche.contact)}
    ${ligneFiche('rib', 'FR76 •••• •••• •••• (enregistré à l’ouverture du compte)')}</tbody></table>
  <p>On ne met à jour une fiche que d’après un document sûr. Un changement de <b>RIB</b> se vérifie toujours en <b>rappelant le fournisseur au numéro
    déjà enregistré</b>, jamais au numéro donné dans la demande.</p>
  ${pied('Fiche CONSTRUITE pour l’exercice (numéros fictifs). Document pédagogique.')}`; });

// ─────────────────────────────────────────── les blocs de fiche partagés et leurs jalons
const CH_ZONES = ZONES.map((z) => ({ v: z.v, lib: z.lib }));
// La zone de produits (ids `zone-1…`) ou de camions (ids `zone-C1…`).
export const blocsZonesProduits = (refs) => refs.map((r, i) => ({ type: 'liste', id: `zone-${i + 1}`, lib: PRODUITS[r].nom, vide: 'Choisir la zone…',
  manque: `la zone de « ${PRODUITS[r].nom} »`, choix: CH_ZONES }));
export const jalonsZonesProduits = (refs, { poids, groupe }) => refs.map((r, i) => ({ id: `zone-${i + 1}`, titre: `La zone de « ${PRODUITS[r].nom} »`, groupe, poids,
  attendu: zoneDe(PRODUITS[r].zone).lib, juste: (v) => v[`zone-${i + 1}`] === PRODUITS[r].zone }));
export const blocsZonesCamions = (C) => C.map((c) => ({ type: 'liste', id: `zone-${c.id}`, lib: `${c.id} · ${c.de} (${prod(c.produits)})`, vide: 'Choisir la zone…',
  manque: `la zone du camion ${c.id}`, choix: CH_ZONES }));
export const jalonsZonesCamions = (C, { poids, groupe }) => C.map((c, i) => ({ id: `zone-${i + 1}`, titre: `La zone du camion ${c.id}`, groupe, poids,
  attendu: zoneDe(zoneCamion(c)).lib, juste: (v) => v[`zone-${c.id}`] === zoneCamion(c) }));

// OTM-C1.4.
const CH_GRILLE = GRILLE.map((g) => ({ v: g.v, lib: g.lib }));
export const blocsZonesKm = (M) => M.map((m) => ({ type: 'choix', id: `km-${m.id}`, lib: `Magasin ${m.id.slice(1)} (${m.km} km)`, manque: `la zone du magasin ${m.id.slice(1)}`, choix: CH_GRILLE }));
export const jalonsZonesKm = (get, { poids, groupe }) => get(null).magasins.map((m0, i) => ({ id: `km-${i + 1}`, titre: `La zone du magasin n° ${i + 1}`, groupe, poids,
  attendu: (db) => GRILLE.find((g) => g.v === zoneKm(get(db).magasins[i].km)).lib,
  juste: (v, db) => { const m = get(db).magasins[i]; return v[`km-${m.id}`] === zoneKm(m.km); } }));
export const blocsCotation = () => [
  { type: 'nombre', id: 'transport', lib: 'Le prix du transport (palettes × prix par palette)', unite: '€', min: 0, manque: 'le prix du transport' },
  { type: 'nombre', id: 'froid', lib: 'Le supplément froid', unite: '€', min: 0, manque: 'le supplément froid' },
  { type: 'nombre', id: 'annexes', lib: 'Les prestations annexes (hayon et attente)', unite: '€', min: 0, manque: 'les prestations annexes' },
  { type: 'nombre', id: 'total', lib: 'Le prix total de la livraison', unite: '€', min: 0, manque: 'le prix total' }];
const LIB_COT = { transport: 'Le prix du transport', froid: 'Le supplément froid', annexes: 'Les prestations annexes', total: 'Le prix total' };
export const jalonsCotation = (get, { poids, groupe }) => ['transport', 'froid', 'annexes', 'total'].map((k) => ({ id: k, titre: LIB_COT[k], groupe, poids,
  attendu: (db) => euros(cotation(get(db).livraison)[k]), juste: (v, db) => proche(v[k], cotation(get(db).livraison)[k], 0.011) }));
export const blocsRevient = () => [
  { type: 'nombre', id: 'revient', lib: 'Le coût de revient avec notre camion', unite: '€', min: 0, manque: 'le coût de revient' },
  { type: 'nombre', id: 'prix', lib: 'Le prix de vente (coût de revient + 20 %)', unite: '€', min: 0, manque: 'le prix de vente' }];
export const jalonsRevient = (get, { revient: pr, prix: pp, groupe }) => [
  { id: 'revient', titre: 'Le coût de revient', groupe, poids: pr,
    attendu: (db) => { const L = get(db).livraison; return `${L.km * 2} km × ${n(COUT_KM)} + ${L.heures} h × ${n(COUT_HEURE)} = ${euros(revient(L))}`; },
    juste: (v, db) => proche(v.revient, revient(get(db).livraison), 0.011) },
  { id: 'prix', titre: 'Le prix de vente', groupe, poids: pp, attendu: (db) => `${euros(revient(get(db).livraison))} × ${n(1 + MARGE)} = ${euros(prixVente(get(db).livraison))}`,
    juste: (v, db) => proche(v.prix, prixVente(get(db).livraison), 0.011) }];

// AGO-2.2 et AGO-1.3.
const ETATS = [{ v: 'conforme', lib: 'Conforme' }, { v: 'quantite', lib: 'Écart de quantité' }, { v: 'prix', lib: 'Écart de prix' }];
export const blocsRapprochement = (F) => F.lignes.map((l, i) => ({ type: 'choix', id: `ligne-${i + 1}`, lib: `L${i + 1} · ${l.lib}`, manque: `la ligne ${i + 1}`, choix: ETATS }));
export const jalonsRapprochement = (get, { poids, groupe }) => get(null).lignes.map((l0, i) => ({ id: `ligne-${i + 1}`, titre: `La ligne n° ${i + 1} de la facture`, groupe, poids,
  attendu: (db) => ETATS.find((e) => e.v === etatLigne(get(db).lignes[i])).lib, juste: (v, db) => v[`ligne-${i + 1}`] === etatLigne(get(db).lignes[i]) }));
export const blocsMontants = () => [
  { type: 'nombre', id: 'ht', lib: 'Le montant HT à payer', unite: '€', min: 0, manque: 'le montant HT' },
  { type: 'nombre', id: 'tva', lib: 'La TVA', unite: '€', min: 0, manque: 'la TVA' },
  { type: 'nombre', id: 'ttc', lib: 'Le montant TTC à payer', unite: '€', min: 0, manque: 'le montant TTC' }];
export const jalonsMontants = (get, { poids, groupe }) => [
  { id: 'ht', titre: 'Le montant HT à payer', groupe, poids, attendu: (db) => { const F = get(db); return `${F.lignes.map((l) => `${l.recu} × ${n(l.prix)}`).join(' + ')} = ${euros(htCorrige(F))}`; },
    juste: (v, db) => proche(v.ht, htCorrige(get(db)), 0.011) },
  { id: 'tva', titre: 'La TVA', groupe, poids, attendu: (db) => `${euros(htCorrige(get(db)))} × ${String(TVA).replace('.', ',')} = ${euros(tvaDe(get(db)))}`, juste: (v, db) => proche(v.tva, tvaDe(get(db)), 0.011) },
  { id: 'ttc', titre: 'Le montant TTC', groupe, poids, attendu: (db) => euros(ttcDe(get(db))), juste: (v, db) => proche(v.ttc, ttcDe(get(db)), 0.011) }];
export const blocEcheance = (F) => ({ type: 'liste', id: 'echeance', lib: `Livré le ${jourLong(F.livraison)} : à payer au plus tard le…`, vide: 'Choisir la date…',
  manque: 'la date de paiement', choix: echeancesPossibles(F).map((x) => ({ v: x, lib: jourLong(x) })) });
export const jalonEcheance = (get, { poids, groupe }) => ({ id: 'echeance', titre: 'La date limite de paiement', groupe, poids,
  attendu: (db) => { const F = get(db); return `fin de décade le ${jourLong(finDecade(F.livraison))}, + 30 jours : ${jourLong(echeance(F))}`; },
  juste: (v, db) => v.echeance === echeance(get(db)) });
export const RIB = [{ v: 'appeler', lib: 'Je rappelle le fournisseur au numéro déjà enregistré sur sa fiche, avant tout changement' },
  { v: 'changer', lib: 'Je change le RIB tout de suite : c’est urgent' }, { v: 'repondre', lib: 'Je réponds au courriel pour demander le RIB en entier' }];
export const blocsFiche = () => [
  { type: 'cases', id: 'champs', titre: 'Ce que tu mets à jour sur la fiche, d’après le courrier signé', choix: CHAMPS },
  { type: 'choix', id: 'rib', lib: 'Le courriel qui demande un nouveau RIB', colonne: true, manque: 'ce que tu fais du courriel', choix: RIB }];
export const jalonsFiche = (get, { champs, rib, groupe }) => [
  { id: 'champs', titre: 'La fiche mise à jour', groupe, poids: champs, attendu: (db) => champsAJour(get(db)).map((k) => CHAMPS.find((c) => c.v === k).lib).join(' ; '),
    juste: (v, db) => memes(v.champs || [], champsAJour(get(db))) },
  { id: 'rib', titre: 'Le courriel du RIB', groupe, poids: rib, attendu: RIB[0].lib, juste: (v) => v.rib === 'appeler' }];

// ─────────────────────────────────────────── la banque « Avant de commencer » (préparation : la plateforme ; droit : la loi)
const q = (de) => (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de, doc, rubrique, enonce, choix, juste, retour });
const banque = (de) => { const Q = q(de); return [
  Q('magasins', 'preparation', 'site', 'La plateforme de Meaux livre…', [{ v: '61', lib: '61 magasins' }, { v: '1600', lib: 'tous les magasins de France' },
    { v: 'clients', lib: 'les clients chez eux' }], '61', 'Chaque plateforme régionale livre les magasins de sa région : 61 pour Meaux.'),
  Q('froid', 'preparation', 'site', 'Une grande partie de la plateforme est…', [{ v: 'froid', lib: 'froide : de +14 °C à -28 °C, selon les produits' },
    { v: 'chauffee', lib: 'chauffée pour les clients' }, { v: 'magasin', lib: 'un magasin ouvert au public' }], 'froid', '24 000 m² de cellules froides : le frais, les fruits et légumes, les surgelés.'),
  Q('direction', 'preparation', 'site', 'Sur le même site que l’entrepôt, il y a aussi…', [{ v: 'direction', lib: 'les bureaux de la direction régionale' },
    { v: 'usine', lib: 'une usine de yaourts' }, { v: 'port', lib: 'un port' }], 'direction', 'La comptabilité des fournisseurs travaille à deux pas des quais.'),
  Q('produits', 'preparation', 'site', 'Lidl vend surtout…', [{ v: 'alimentaire', lib: 'des produits alimentaires' }, { v: 'meubles', lib: 'des meubles' },
    { v: 'voitures', lib: 'des voitures' }], 'alimentaire', 'Le non-alimentaire reste à l’entrepôt de Crégy-lès-Meaux.'),
  Q('surgele', 'droit', 'site', 'Selon la loi, un produit surgelé doit rester…', [{ v: 'moins18', lib: 'à -18 °C ou plus froid' }, { v: 'zero', lib: 'à 0 °C' },
    { v: 'ambiant', lib: 'à température ambiante' }], 'moins18', 'Au-dessus de -18 °C, la chaîne du froid est rompue.'),
  Q('donnees', 'droit', 'site', 'Le nom et le téléphone du contact d’un fournisseur…', [{ v: 'personnelles', lib: 'sont des données personnelles : on les protège' },
    { v: 'publiques', lib: 'peuvent être donnés à n’importe qui' }, { v: 'rien', lib: 'ne sont pas concernés par la loi' }], 'personnelles', 'Le RGPD protège toutes les données qui désignent une personne.'),
]; };
export const BANQUE_RECEPTION = banque('fatou');
export const BANQUE_TRANSPORT = banque('mehdi');
export const BANQUE_COMPTA = banque('claire');
const ouverture = (de, B) => (o = {}) => ({ id: 'avant-de-commencer', de, titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis « La plateforme » à gauche et réponds à mes questions.',
  documents: ['site'], tirage: { preparation: 2, droit: 1 }, questions: B.map((x) => x.id), ...o });
export const OUVERTURE_RECEPTION = ouverture('fatou', BANQUE_RECEPTION);
export const OUVERTURE_TRANSPORT = ouverture('mehdi', BANQUE_TRANSPORT);
export const OUVERTURE_COMPTA = ouverture('claire', BANQUE_COMPTA);

export { ZONES, QUAIS, PRODUITS, CONTROLES, releveJuste, HEURES, zoneCamion, planning, duree, cotation, revient, prixVente, etatLigne, htCorrige, tvaDe, ttcDe,
  echeance, jourLong, zoneDe, euros, nombreFr };
