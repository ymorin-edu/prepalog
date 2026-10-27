// Leroy Merlin — la plateforme logistique nationale de Réau (Seine-et-Marne) : l'UNIVERS commun des séances ENT-20.1 à 20.8 (1re Bac Pro,
// entreprise n° 20 ; C1.2 sécurité en 20.1 à 20.4, C2.1 demande des clients en 20.5 à 20.8) et les DOCUMENTS et blocs de fiche qu'elles partagent.
// Cadrage : `docs/briefs/leroy-merlin/CADRAGE-leroy-merlin-1re.md` ; données : `contenus/leroy-merlin-donnees.js` ; fabrique : `contenus/fabrique-fiches.js`.
//
// L'élève est en PFMP à Réau : avec Samir (chef d'équipe, tuteur) pour la sécurité, puis avec Nadia (responsable du service clients logistique)
// pour la demande des clients. Kevin et Jordan (collègues) font les erreurs induites. Tous CONSTRUITS, prénoms seuls ; aucune parole n'est prêtée
// à un salarié réel. Tutoiement. Aucune vue nouvelle.

import { catalogueSimple } from './entreprise-commun.js';
import { FRANCE } from './france-contours.js';
import {
  RISQUES, NIVEAUX, SITUATIONS, mesureJuste, EPI, QUAI, QUAI_DEPART, tf, tg, PRODUITS, TYPES, KG_ENCOMBRANT, poidsCommande, encombrant, livraison,
  jourLong, plusJours, tauxService, nombreFr,
} from './leroy-merlin-donnees.js';
import { memes, proche } from './fabrique-fiches.js';

// ─────────────────────────────────────────── l'univers
export const LOGO = './contenus/trames/logos/leroy-merlin.svg';
export const ENTREPRISE = {
  id: 'leroy-merlin',
  nom: 'Leroy Merlin',
  sousTitre: 'Plateforme logistique nationale de Réau (Seine-et-Marne)',
  exercice: 'À la plateforme',
  logo: LOGO,
};
export const VOCAB = { unit: 'colis', unitPl: 'colis', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'leroymerlin.example' };
// Charte : le vert du logo officiel (#7bb51c, relevé dans le SVG de Wikimedia Commons le 27/10/2026), texte foncé posé dessus (contraste 8:1).
// Charte VERTE : le moteur la garde au bandeau et au menu, jamais dans la zone où l'élève travaille (décision de Tristan du 05/10/2026).
export const THEME = { accent: '#7bb51c', surAccent: '#1d1d1b', papier: true };
export const CATALOGUE = catalogueSimple(Object.values(PRODUITS).map((x) => ({ ref: x.ref.toUpperCase(), designation: x.nom, marque: 'Produit construit',
  categorie: 'Produit', fournisseur: 'F-LM', stock: 0 })));
export const SUPPLIERS = [{ id: 'F-LM', brand: 'Leroy Merlin', name: 'Fournisseurs (construits)', adr: '', cp: '77550', ville: 'Réau', contact: '', tel: '',
  email: 'reception@leroymerlin.example', delai: 2, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Leroy Merlin et sa plateforme de Réau (Seine-et-Marne) : 72 000 m², plateforme nationale depuis 2021, en partie automatisée '
  + '(chariots automatiques), qui livre les magasins de l’enseigne et les clients du site internet ; colis de moins de 30 kg livrés le lendemain, '
  + 'encombrants en trois jours. Construits : les situations de travail, les accidents et les heures, les commandes, les clients, les stocks et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  samir: { nom: 'Samir', role: 'chef d’équipe (ton tuteur pour la sécurité)', appel: 'Samir', registre: 'tu',
    metier: 'Chef d’équipe', phrase: 'J’organise l’équipe du quai et des allées. La sécurité passe avant la vitesse : c’est moi qui te forme.' },
  kevin: { nom: 'Kevin', role: 'préparateur de commandes', appel: 'Kevin', registre: 'tu',
    metier: 'Préparateur de commandes', phrase: 'Je prépare les commandes des magasins. Cette semaine, j’ai fait le relevé des risques de l’allée 12.' },
  nadia: { nom: 'Nadia', role: 'responsable du service clients logistique (ta tutrice pour les clients)', appel: 'Nadia', registre: 'tu',
    metier: 'Responsable du service clients logistique', phrase: 'Je réponds aux magasins et aux clients du site : où est la commande, quand arrive-t-elle, que faire s’il manque quelque chose.' },
  jordan: { nom: 'Jordan', role: 'agent du service clients logistique', appel: 'Jordan', registre: 'tu',
    metier: 'Agent du service clients', phrase: 'Je réponds aux clients qui demandent leur date de livraison.' },
};
export const MAIL_SAMIR = 'samir@leroymerlin.example';
export const MAIL_NADIA = 'nadia@leroymerlin.example';
export const TUTEUR_SECU = { nom: 'Samir, chef d’équipe', mail: MAIL_SAMIR, appel: 'Samir' };
export const TUTEUR_CLIENTS = { nom: 'Nadia, service clients logistique', mail: MAIL_NADIA, appel: 'Nadia' };
export const PERSONNES = { samir: EQUIPE.samir, nadia: EQUIPE.nadia };

// ─────────────────────────────────────────── aides
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pied = (t) => `<p class="lm-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
const kg = (x) => `${n(x)} kg`;
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="lm-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="lm-doc" aria-label="${ech(titre)}">${corps}</article>` });
const entete = (t, st) => `<div class="lm-entete"><img class="lm-logo" src="${LOGO}" alt="Leroy Merlin"><div><p class="lm-t">${ech(t)}</p>${st ? `<p class="lm-st">${ech(st)}</p>` : ''}</div></div>`;

export const STYLE = `
--douce:#555047;
.lm-doc{padding:14px 18px 0}
.lm-doc p{margin:0 0 8px}
.lm-entete{display:flex; gap:12px; align-items:center; border-bottom:2px solid #555047; padding-bottom:6px; margin-bottom:10px}
.lm-logo{height:34px; width:auto}
.lm-t{margin:0; font-size:1.06rem; font-weight:800}
.lm-st{margin:2px 0 0; font-size:.84rem; color:var(--douce)}
.lm-ul{margin:4px 0 8px; padding-left:20px; font-size:.93rem}
.lm-ul li{margin:4px 0}
.lm-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.lm-loi{margin:4px 0 8px; padding:4px 10px; border-left:3px solid #555047; font-size:.92rem}
.lm-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.lm-table th, .lm-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left; vertical-align:top}
.lm-table th{color:var(--douce); font-weight:600}
.lm-table .lm-d{text-align:right; white-space:nowrap}
.lm-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.lm-mail{border:1px solid #d6d0c3; border-radius:6px; padding:8px 12px; margin:6px 0}
.lm-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents communs
export const DOC_SITE = doc('site', 'La plateforme de Réau', 'La plateforme', `${entete('La plateforme logistique de Réau', 'Seine-et-Marne (77), au sud-est de Paris')}
  <p>Leroy Merlin vend des produits de bricolage, de jardin et de maison dans ses magasins et sur son site internet. La plateforme de
    <b>Réau</b> reçoit les produits des fournisseurs, les stocke et prépare les commandes des <b>magasins</b> et des <b>clients du site</b>.</p>
  <ul class="lm-ul">
    <li>Inaugurée en <b>avril 2019</b> : <b>72 000 m²</b> en 12 cellules ; plateforme <b>nationale</b> depuis l’été 2021.</li>
    <li>La moitié du site, <b>36 000 m²</b>, est <b>automatisée</b> : 27 chariots automatiques circulent dans des allées réservées.</li>
    <li>Environ <b>3 600 mouvements de palettes par jour</b>, <b>4 000 références</b>, des livraisons vers <b>140 magasins</b> et vers les clients
      du site internet.</li>
    <li>Objectif affiché : <b>zéro accident du travail</b>.</li>
    <li>Leroy Merlin a trois plateformes nationales : <b>Réau</b>, <b>Dourges</b> (Pas-de-Calais) et <b>Valence</b> (Drôme), et des plateformes
      régionales et internet confiées à des prestataires.</li>
    <li>Pour un client du site : un <b>colis de moins de 30 kg</b> est livré le <b>lendemain</b> ; un produit <b>encombrant</b>, en <b>trois jours</b>.</li>
  </ul>
  ${pied('Document pédagogique. Sources : EcommerceMag (01/04/2021), Stratégies Logistique (11/08/2022 et 07/10/2022).')}`);

export const DOC_EQUIPE = doc('equipe', 'L’équipe', 'L’équipe', `${entete('Les personnes de ta PFMP', 'Prénoms imaginés pour l’exercice')}
  <table class="lm-table"><thead><tr><th scope="col">Qui</th><th scope="col">Ce qu’il ou elle fait</th></tr></thead><tbody>
    ${Object.values(EQUIPE).map((p) => `<tr><td><b>${ech(p.nom)}</b><br><span class="lm-st">${ech(p.metier)}</span></td><td>${ech(p.phrase)}</td></tr>`).join('')}
  </tbody></table>
  ${pied('Équipe et prénoms CONSTRUITS pour l’exercice. Document pédagogique.')}`);

// La sécurité : les principes de prévention, les EPI, la circulation.
export const DOC_PREVENTION = doc('prevention', 'Prévenir les risques', 'La prévention', `${entete('Prévenir les risques à la plateforme', 'Le livret d’accueil sécurité')}
  <p><b>Un danger</b> (une charge lourde, un chariot, une palette en hauteur) devient un <b>risque</b> quand une personne y est exposée.
    Pour chaque risque, on choisit la mesure dans cet ordre :</p>
  <ol class="lm-ul">
    <li><b>Supprimer le danger</b> quand c’est possible (nettoyer, évacuer, couper le moteur, ne pas entrer dans une zone dangereuse).</li>
    <li>Sinon, <b>protéger tout le monde</b> : protection collective (aide mécanique, balisage, plan de circulation, passages piétons).</li>
    <li>En dernier, <b>protéger la personne</b> : équipement de protection individuelle (EPI).</li>
  </ol>
  <div class="lm-regle"><b>Les EPI obligatoires</b> dans les allées et au quai : <b>chaussures de sécurité</b>, <b>gilet haute visibilité</b>,
    <b>gants de manutention</b>. Pas de bijoux (une bague s’accroche), pas de casque audio (tu n’entends plus les chariots).</div>
  <ul class="lm-ul">
    <li><b>Circulation</b> : les piétons marchent dans les passages marqués au sol ; on ne coupe jamais une allée de chariots.</li>
    <li><b>Allées automatisées</b> : réservées aux chariots automatiques ; on n’y entre qu’après avoir fait arrêter l’allée.</li>
    <li><b>Port de charges</b> : au-delà de 25 kg, on prend une aide mécanique ; on plie les jambes, le dos droit, la charge près du corps.</li>
    <li><b>Une anomalie</b> (charge qui dépasse, produit au sol, cartons qui s’entassent) : on balise, on traite ou on prévient le chef d’équipe.</li>
  </ul>
  <div class="lm-loi"><b>Ce que dit la loi</b> (Code du travail, résumé) : l’employeur évite les risques, combat les risques à la source et donne la
    priorité à la protection collective sur la protection individuelle (article L4121-2). Un homme ne porte habituellement plus de 55 kg que si le
    médecin du travail l’a reconnu apte, et une femme pas plus de 25 kg (article R4541-9).</div>
  ${pied('Livret CONSTRUIT pour l’exercice (le seuil de 25 kg du site est une règle interne construite). Résumé de la loi, pas une citation. Document pédagogique.')}`);

export const DOC_QUAI = doc('quai', 'Le protocole de sécurité au quai', 'Le protocole', `${entete('Le protocole de sécurité au quai', 'Chargement et déchargement des camions')}
  <p>Chaque transporteur qui vient charger ou décharger a un <b>protocole de sécurité</b> écrit, signé avec la plateforme : il dit où aller,
    qui fait quoi et les consignes à respecter (Code du travail, articles R4515-4 et suivants).</p>
  <ul class="lm-ul">
    <li>Le chauffeur se présente à l’accueil avec ses documents : on lui remet le protocole et son numéro de quai.</li>
    <li>Le camion à quai : moteur coupé, frein serré, <b>clé remise au quai</b>, camion <b>calé</b>. Personne n’entre dans la remorque avant.</li>
    <li>Pendant la manutention, le chauffeur attend dans la <b>zone chauffeurs</b>, jamais dans la zone des chariots.</li>
    <li>Le cariste vérifie le <b>feu</b> du quai et le <b>niveleur</b> avant d’entrer dans la remorque.</li>
    <li>Le chauffeur ne reprend sa clé qu’à la fin, quand le cariste est sorti.</li>
  </ul>
  ${pied('Consignes du site CONSTRUITES pour l’exercice (le protocole écrit est une obligation réelle). Document pédagogique.')}`);

export const htmlAccidents = (A) => `<table class="lm-table"><tbody>
    <tr><td>Heures travaillées en ${A.annee}</td><td class="lm-d">${n(A.heures)} h</td></tr>
    <tr><td>Accidents du travail avec arrêt</td><td class="lm-d">${A.accidents}</td></tr>
    <tr><td>Jours d’arrêt de travail</td><td class="lm-d">${A.jours} jours</td></tr></tbody></table>
  <div class="lm-regle"><b>Taux de fréquence</b> = accidents avec arrêt × 1 000 000 ÷ heures travaillées<br>
    <b>Taux de gravité</b> = jours d’arrêt × 1 000 ÷ heures travaillées<br><span class="lm-st">Arrondis au centième.</span></div>`;
export const docAccidents = (get) => doc('accidents', 'Les accidents de l’année', 'Les accidents', (db) => { const A = get(db);
  return `${entete(`Les accidents du travail en ${A.annee}`, 'Le tableau de bord sécurité de l’équipe')}${htmlAccidents(A)}${A.causes ? `
    <table class="lm-table"><thead><tr><th scope="col">Cause</th><th class="lm-d" scope="col">Accidents</th></tr></thead><tbody>
    ${A.causes.map((c) => `<tr><td>${ech(c.cause)}</td><td class="lm-d">${c.n}</td></tr>`).join('')}</tbody></table>` : ''}
    ${pied('Chiffres CONSTRUITS pour l’exercice (les formules sont les formules officielles). Document pédagogique.')}`; });

// ─────────────────────────────────────────── C2.1 : les documents
export const DOC_LIVRAISON = doc('livraison', 'Les règles de livraison', 'Les règles', `${entete('Répondre à un client : les règles', 'Le service clients logistique')}
  <ul class="lm-ul">
    <li>Un <b>client interne</b> est un <b>magasin Leroy Merlin</b> : la plateforme lui livre ses produits pour ses rayons. Un <b>client externe</b>
      est une personne ou une entreprise qui achète : un particulier, un artisan, une entreprise.</li>
    <li>Commande du site internet : on additionne le <b>poids de toute la commande</b> (poids d’un produit × quantité).</li>
    <li>Moins de <b>${KG_ENCOMBRANT} kg</b> en tout, et aucun produit de ${KG_ENCOMBRANT} kg ou plus : c’est un <b>colis</b>, livré le <b>jour de livraison suivant</b> la commande (J+1).</li>
    <li>${KG_ENCOMBRANT} kg ou plus en tout, ou un produit de ${KG_ENCOMBRANT} kg ou plus : c’est un <b>encombrant</b>, livré le <b>troisième jour de livraison</b> (J+3).</li>
    <li>On livre <b>du lundi au samedi</b> : le <b>dimanche ne compte pas</b>. Une commande du samedi en colis arrive le lundi.</li>
  </ul>
  <div class="lm-regle"><b>Le taux de service</b> = commandes livrées complètes et à la date promise ÷ commandes livrées × 100.</div>
  ${pied('Règles de délai RÉELLES (J+1 pour un colis de moins de 30 kg, J+3 pour un encombrant, 2022) ; jours de livraison et calcul du poids CONSTRUITS pour l’exercice. Document pédagogique.')}`);

export const htmlDemandes = (D) => `<p class="lm-st">Messages reçus le ${jourLong(D.jour)}.</p>${D.demandes.map((d) => `<div class="lm-mail"><b>${d.id} · ${ech(d.de)}</b><br>${ech(d.texte)}</div>`).join('')}`;
export const docDemandes = (get) => doc('demandes', 'Les demandes du jour', 'Les demandes', (db) => `${entete('Les demandes du jour', 'La boîte du service clients')}
  ${htmlDemandes(get(db))}${pied('Demandes, clients et magasins demandeurs CONSTRUITS pour l’exercice. Document pédagogique.')}`);
export const htmlCommandes = (D) => `<table class="lm-table"><thead><tr><th scope="col">Commande</th><th scope="col">Passée le</th><th scope="col">Produits</th><th class="lm-d" scope="col">Poids d’un produit</th></tr></thead><tbody>
    ${D.commandes.map((c) => `<tr><td class="lm-mono">${c.id}<br><span class="lm-st">${ech(c.client)}</span></td><td>${jourLong(c.jour)}</td>
      <td>${c.lignes.map((l) => `${l.qte} × ${ech(PRODUITS[l.ref].nom)}`).join('<br>')}</td><td class="lm-d">${c.lignes.map((l) => kg(PRODUITS[l.ref].kg)).join('<br>')}</td></tr>`).join('')}
  </tbody></table>`;
export const docCommandes = (get) => doc('commandes', 'Les commandes du site', 'Les commandes', (db) => `${entete('Les commandes du site internet', 'Le système de gestion des commandes')}
  ${htmlCommandes(get(db))}${get(db).service ? `<p>Cette semaine : <b>${n(get(db).service.livrees)}</b> commandes livrées, dont <b>${n(get(db).service.aTemps)}</b> complètes et à la date promise.</p>` : ''}
  ${pied('Commandes, produits et poids CONSTRUITS pour l’exercice. Document pédagogique.')}`);

// ENT-20.3 : le relevé de Kevin (sa grille, telle qu'il l'a remplie).
export const htmlKevin = (L) => `<table class="lm-table"><thead><tr><th scope="col">Ligne</th><th scope="col">Situation</th><th scope="col">Risque noté</th><th scope="col">Mesure proposée</th></tr></thead><tbody>
    ${L.map((x, i) => `<tr><td>${i + 1}</td><td>${ech(SITUATIONS[x.s].texte)}</td><td>${ech(RISQUES.find((r) => r.v === x.risque).lib)}</td>
      <td>${ech(SITUATIONS[x.s].mesures.find((m) => m.v === x.mesure).lib)}</td></tr>`).join('')}</tbody></table>`;
export const docKevin = (L) => doc('kevin', 'Le relevé de Kevin', 'Le relevé', `${entete('Relevé des risques — allée 12 et quai 6', 'Rempli par Kevin, préparateur de commandes')}
  ${htmlKevin(L)}${pied('Relevé CONSTRUIT pour l’exercice. Document pédagogique.')}`);

// ENT-20.7 : les réponses de Jordan (la date qu'il a promise à chaque client).
export const docJordan = (get) => doc('jordan', 'Les réponses de Jordan', 'Les réponses', (db) => { const D = get(db);
  return `${entete('Les dates promises par Jordan', `Réponses envoyées aux clients, ${jourLong(D.jour)}`)}
  <table class="lm-table"><thead><tr><th scope="col">Commande</th><th scope="col">Passée le</th><th scope="col">Produits</th><th class="lm-d" scope="col">Poids d’un produit</th><th scope="col">Date promise</th></tr></thead><tbody>
    ${D.commandes.map((c) => `<tr><td class="lm-mono">${c.id}<br><span class="lm-st">${ech(c.client)}</span></td><td>${jourLong(c.jour)}</td>
      <td>${c.lignes.map((l) => `${l.qte} × ${ech(PRODUITS[l.ref].nom)}`).join('<br>')}</td><td class="lm-d">${c.lignes.map((l) => kg(PRODUITS[l.ref].kg)).join('<br>')}</td>
      <td>${jourLong(c.promis)}</td></tr>`).join('')}
  </tbody></table>${pied('Commandes et réponses CONSTRUITES pour l’exercice. Document pédagogique.')}`; });

// ─────────────────────────────────────────── les blocs de fiche partagés et leurs jalons
const CH_RISQUES = RISQUES.map((r) => ({ v: r.v, lib: r.lib }));
// Le risque de chaque situation (`cles` : les situations, dans l'ordre). Ids `risque-1…`.
export const blocsRisques = (cles) => cles.map((k, i) => ({ type: 'liste', id: `risque-${i + 1}`, lib: SITUATIONS[k].texte, vide: 'Choisir le risque…',
  manque: `le risque de la situation ${i + 1}`, choix: CH_RISQUES }));
export const jalonsRisques = (get, { poids, groupe }) => get(null).map((k, i) => ({ id: `risque-${i + 1}`, titre: `Le risque de la situation n° ${i + 1}`, groupe, poids,
  titreBilan: (db) => `Le risque : « ${SITUATIONS[get(db)[i]].texte.slice(0, 60)}… »`,
  attendu: (db) => RISQUES.find((r) => r.v === SITUATIONS[get(db)[i]].risque).lib, juste: (v, db) => v[`risque-${i + 1}`] === SITUATIONS[get(db)[i]].risque }));
// La meilleure mesure de chaque situation. Ids `mesure-1…`.
export const blocsMesures = (cles, avecTexte = true) => cles.map((k, i) => ({ type: 'liste', id: `mesure-${i + 1}`, lib: avecTexte ? SITUATIONS[k].texte : `Situation ${i + 1}`,
  vide: 'Choisir la mesure…', manque: `la mesure de la situation ${i + 1}`, choix: SITUATIONS[k].mesures.map((x) => ({ v: x.v, lib: x.lib })) }));
export const jalonsMesures = (get, { poids, groupe }) => get(null).map((k, i) => ({ id: `mesure-${i + 1}`, titre: `La mesure de la situation n° ${i + 1}`, groupe, poids,
  titreBilan: (db) => `La mesure : « ${SITUATIONS[get(db)[i]].texte.slice(0, 60)}… »`,
  attendu: (db) => mesureJuste(get(db)[i]).lib, juste: (v, db) => v[`mesure-${i + 1}`] === SITUATIONS[get(db)[i]].juste }));
// Le niveau de la bonne mesure. Ids `niveau-1…`.
export const blocsNiveaux = (cles) => cles.map((k, i) => ({ type: 'liste', id: `niveau-${i + 1}`, lib: mesureJuste(k).lib, vide: 'Choisir…', manque: `le niveau de la mesure ${i + 1}`,
  choix: NIVEAUX }));
export const jalonsNiveaux = (cles, { poids, groupe }) => cles.map((k, i) => ({ id: `niveau-${i + 1}`, titre: `Le niveau de la mesure n° ${i + 1}`, groupe, poids,
  attendu: NIVEAUX.find((x) => x.v === mesureJuste(k).niveau).lib, juste: (v) => v[`niveau-${i + 1}`] === mesureJuste(k).niveau }));
// Les EPI.
export const blocEpi = () => ({ type: 'cases', id: 'epi', titre: 'Ce que tu portes dans les allées et au quai', choix: EPI.map((x) => ({ v: x.v, lib: x.lib })) });
export const jalonEpi = ({ poids, groupe }) => ({ id: 'epi', titre: 'Les EPI', groupe, poids, attendu: EPI.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
  juste: (v) => memes(v.epi || [], EPI.filter((x) => x.juste).map((x) => x.v)) });
// Le protocole au quai : l'ordre (une étape juste à son rang = un jalon).
export const blocQuai = () => ({ type: 'ordre', id: 'quai', titre: 'Dans l’ordre', consigne: 'De l’arrivée du camion à son départ.', choix: QUAI_DEPART.map((x) => QUAI.find((e) => e.v === x)) });
export const jalonsQuai = ({ poids, groupe }) => QUAI.map((e, k) => ({ id: `quai-${k + 1}`, titre: `Le protocole : « ${e.lib} » à sa place`, groupe, poids, attendu: `étape ${k + 1}`,
  juste: (v) => Array.isArray(v.quai) && v.quai[k] === e.v }));
// Les taux.
export const blocsTaux = () => [
  { type: 'nombre', id: 'tf', lib: 'Le taux de fréquence', min: 0, manque: 'le taux de fréquence' },
  { type: 'nombre', id: 'tg', lib: 'Le taux de gravité', min: 0, manque: 'le taux de gravité' }];
export const jalonsTaux = (get, { tf: ptf, tg: ptg, groupe }) => [
  { id: 'tf', titre: 'Le taux de fréquence', groupe, poids: ptf, attendu: (db) => { const A = get(db); return `${A.accidents} × 1 000 000 ÷ ${n(A.heures)} = ${n(tf(A))}`; },
    juste: (v, db) => proche(v.tf, tf(get(db)), 0.011) },
  { id: 'tg', titre: 'Le taux de gravité', groupe, poids: ptg, attendu: (db) => { const A = get(db); return `${A.jours} × 1 000 ÷ ${n(A.heures)} = ${n(tg(get(db)))}`; },
    juste: (v, db) => proche(v.tg, tg(get(db)), 0.011) }];

// C2.1 : le type de chaque demande. Ids `type-D1…`.
export const blocsTypes = (D) => D.demandes.map((d) => ({ type: 'choix', id: `type-${d.id}`, lib: `${d.id} · ${d.de}`, manque: `le type de client de ${d.id}`, choix: TYPES }));
export const jalonsTypes = (get, { poids, groupe }) => get(null).demandes.map((d, i) => ({ id: `type-${i + 1}`, titre: `Le client de la demande n° ${i + 1}`, groupe, poids,
  attendu: (db) => TYPES.find((t) => t.v === get(db).demandes[i].type).lib, juste: (v, db) => { const x = get(db).demandes[i]; return v[`type-${x.id}`] === x.type; } }));
// Les dates proposées : du jour de la commande au 4e jour de livraison après.
export const datesPossibles = (c) => { const L = [c.jour]; for (let k = 1; k <= 4; k++) L.push(plusJours(c.jour, k)); const dim = plusDim(c.jour); if (dim && !L.includes(dim)) L.splice(2, 0, dim); return [...new Set(L)].sort(); };
// Le dimanche qui suit (s'il tombe dans la fenêtre), pour que « compter le dimanche » soit une erreur possible.
function plusDim(iso) { const t = new Date(`${iso}T00:00:00Z`); for (let k = 1; k <= 4; k++) { t.setUTCDate(t.getUTCDate() + 1); if (t.getUTCDay() === 0) return t.toISOString().slice(0, 10); } return null; }
// Le poids et la date de livraison de chaque commande. Ids `poids-W-…`, `date-W-…`.
export const blocsCommandes = (D) => D.commandes.flatMap((c) => [
  { type: 'nombre', id: `poids-${c.id}`, lib: `${c.id} (${c.client}) : le poids de la commande`, unite: 'kg', min: 0, manque: `le poids de ${c.id}` },
  { type: 'liste', id: `date-${c.id}`, lib: `${c.id} : la date de livraison`, vide: 'Choisir la date…', manque: `la date de ${c.id}`,
    choix: datesPossibles(c).map((x) => ({ v: x, lib: jourLong(x) })) }]);
export const jalonsCommandes = (get, { poids: pp, date: pd, groupe }) => get(null).commandes.flatMap((c, i) => [
  { id: `poids-${i + 1}`, titre: `Le poids de la commande n° ${i + 1}`, groupe, poids: pp, attendu: (db) => kg(poidsCommande(get(db).commandes[i])),
    juste: (v, db) => { const C = get(db).commandes[i]; return proche(v[`poids-${C.id}`], poidsCommande(C)); } },
  { id: `date-${i + 1}`, titre: `La date de livraison de la commande n° ${i + 1}`, groupe, poids: pd,
    attendu: (db) => { const C = get(db).commandes[i]; return `${jourLong(livraison(C))} (${encombrant(C) ? 'encombrant, J+3' : 'colis, J+1'})`; },
    juste: (v, db) => { const C = get(db).commandes[i]; return v[`date-${C.id}`] === livraison(C); } }]);
export const blocTaux = () => ({ type: 'nombre', id: 'service', lib: 'Le taux de service de la semaine', unite: '%', min: 0, manque: 'le taux de service' });
export const jalonTaux = (get, { poids, groupe }) => ({ id: 'service', titre: 'Le taux de service', groupe, poids,
  attendu: (db) => { const S = get(db).service; return `${n(S.aTemps)} ÷ ${n(S.livrees)} × 100 = ${n(tauxService(S))} %`; },
  juste: (v, db) => proche(v.service, tauxService(get(db).service), 0.11) });

// ─────────────────────────────────────────── la banque « Avant de commencer » (préparation : la plateforme ; droit : la loi)
const q = (de) => (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de, doc, rubrique, enonce, choix, juste, retour });
const banque = (de) => { const Q = q(de); return [
  Q('nationale', 'preparation', 'site', 'Réau est une plateforme…', [{ v: 'nationale', lib: 'nationale, comme Dourges et Valence' }, { v: 'magasin', lib: 'un grand magasin' },
    { v: 'usine', lib: 'une usine de fabrication' }], 'nationale', 'Une plateforme nationale livre les magasins de toute la France.'),
  Q('auto', 'preparation', 'site', 'Dans la partie automatisée de Réau…', [{ v: 'chariots', lib: 'des chariots automatiques circulent dans des allées réservées' },
    { v: 'personne', lib: 'il n’y a plus aucun salarié sur le site' }, { v: 'rien', lib: 'rien ne bouge la nuit' }], 'chariots', 'Les allées automatisées sont réservées : on n’y entre pas sans les faire arrêter.'),
  Q('clients', 'preparation', 'site', 'Réau prépare les commandes…', [{ v: 'deux', lib: 'des magasins de l’enseigne et des clients du site internet' },
    { v: 'magasins', lib: 'des magasins seulement' }, { v: 'usines', lib: 'des usines' }], 'deux', 'Deux sortes de clients : les magasins (internes) et les clients du site (externes).'),
  Q('delai', 'preparation', 'site', 'Un colis de moins de 30 kg commandé sur le site est livré…', [{ v: 'lendemain', lib: 'le lendemain' }, { v: 'semaine', lib: 'dans la semaine' },
    { v: 'mois', lib: 'dans le mois' }], 'lendemain', 'Le lendemain pour un colis ; trois jours pour un encombrant.'),
  Q('prevention', 'droit', 'site', 'Selon le Code du travail, l’employeur doit d’abord…', [{ v: 'source', lib: 'combattre le risque à la source, avant de donner des EPI' },
    { v: 'epi', lib: 'donner des EPI, c’est suffisant' }, { v: 'rien', lib: 'laisser chaque salarié se protéger seul' }], 'source', 'La protection collective passe avant la protection individuelle (L4121-2).'),
  Q('salarie', 'droit', 'site', 'Le salarié, lui…', [{ v: 'soin', lib: 'prend soin de sa sécurité et de celle de ses collègues' }, { v: 'rien', lib: 'n’a aucune obligation de sécurité' },
    { v: 'chef', lib: 'peut ignorer les consignes s’il est pressé' }], 'soin', 'Chaque salarié a une obligation de sécurité, selon sa formation (L4122-1).'),
]; };
export const BANQUE_SECU = banque('samir');
export const BANQUE_CLIENTS = banque('nadia');
const ouverture = (de, B) => (o = {}) => ({ id: 'avant-de-commencer', de, titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis « La plateforme » à gauche et réponds à mes questions.',
  documents: ['site'], tirage: { preparation: 2, droit: 1 }, questions: B.map((x) => x.id), ...o });
export const OUVERTURE_SECU = ouverture('samir', BANQUE_SECU);
export const OUVERTURE_CLIENTS = ouverture('nadia', BANQUE_CLIENTS);

// ─────────────────────────────────────────── la carte de France (20.1)
export const LOCALISER = {
  id: 'leroy-merlin-carte', libelle: 'Carte de France', titre: 'Les trois plateformes nationales', contours: FRANCE, vue: 'leroy-merlin-carte', poids: 0.5, groupe: 'La carte',
  objet: 'La carte',
  message: 'Place maintenant les trois plateformes nationales de Leroy Merlin sur la carte de France : la nôtre, Dourges et Valence (menu « Carte de France »).',
  lieux: [
    { id: 'reau', lettre: 'R', type: 'entrepot', nom: 'Plateforme de Réau', role: 'La plateforme de ta PFMP.',
      ville: 'Réau', dep: '77', region: '11', lonlat: [2.6230, 48.6100], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Melun', lonlat: [2.6550, 48.5390] }, { ville: 'Meaux', lonlat: [2.8780, 48.9600] }, { ville: 'Provins', lonlat: [3.2990, 48.5600] }],
      reperes: [{ ville: 'Paris', lonlat: [2.3484, 48.8535] }], indice: 'Au sud-est de Paris, près de Melun.', etiq: 'b' },
    { id: 'dourges', lettre: 'D', type: 'site', nom: 'Plateforme de Dourges', role: 'Une plateforme nationale, au nord.',
      ville: 'Dourges', dep: '62', region: '32', lonlat: [2.9850, 50.4370], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Arras', lonlat: [2.7810, 50.2910] }, { ville: 'Calais', lonlat: [1.8580, 50.9510] }, { ville: 'Béthune', lonlat: [2.6400, 50.5300] }],
      reperes: [{ ville: 'Lille', lonlat: [3.0573, 50.6292] }], indice: 'Au sud de Lille.', etiq: 'g' },
    { id: 'valence', lettre: 'V', type: 'site', nom: 'Plateforme de Valence', role: 'Une plateforme nationale, au sud.',
      ville: 'Valence', dep: '26', region: '84', lonlat: [4.8920, 44.9330], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Montélimar', lonlat: [4.7500, 44.5580] }, { ville: 'Romans-sur-Isère', lonlat: [5.0510, 45.0430] }, { ville: 'Die', lonlat: [5.3700, 44.7530] }],
      reperes: [{ ville: 'Lyon', lonlat: [4.8357, 45.7640] }], indice: 'Au sud de Lyon, dans la vallée du Rhône.', etiq: 'h' },
  ],
  fin: { titre: 'Trois plateformes pour toute la France',
    texte: 'Dourges au nord, Réau près de Paris, Valence au sud : chaque magasin est livré par la plateforme la plus proche. Les prénoms et les situations de tes séances sont imaginés pour l’exercice.' },
};

export { SITUATIONS, RISQUES, NIVEAUX, QUAI, PRODUITS, jourLong, livraison, poidsCommande, encombrant, tf, tg, tauxService };
