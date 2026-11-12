// ENT-25.1 — « Et si tu choisissais la Logistique ? » : la vitrine du Bac Pro Logistique pour les 2de GATL (semaine des filières, novembre 2026).
// Demande de Tristan du 12/11/2026 (fil « Préparer la semaine des filières en 2de ») : « le but est de mettre en avant le BAC PRO logistique », 2de GATL, 1 h.
// Brief et compte rendu : `docs/briefs/ENT-25.1-vitrine-logistique.md` ; activité : `activites/vitrine-logistique.js` ; corrigé : `contenus/corriges/ENT-25.1.js`.
//
// Ce n'est pas une entreprise : c'est un tour de quatre entreprises RÉELLES déjà vérifiées dans Prepalog (séances de Terminale et de CAP), où travaillent
// des logisticiens. Un arrêt court par entreprise (un document, une fiche, un petit geste), puis « Le Bac Pro Logistique en bref » et « lequel t'a plu ? ».
//   ① Amazon, Brétigny-sur-Orge (ENT-19.x) : le chemin d'un article quand le robot apporte l'armoire au poste ;
//   ② Stellantis, Sochaux (ENT-13.x) : une voiture par minute, ce que la logistique amène au bord de la ligne ;
//   ③ Airbus Helicopters, Marignane (ENT-18.x) : la pièce d'un hélicoptère au sol (AOG), le transport le plus rapide ou le moins cher ;
//   ④ Royal Canin, Aimargues (ENT-16.x) : 85 % exportés, et quel lot sortir d'abord (FEFO) ;
//   ⑤ Le Bac Pro Logistique en bref (Onisep, relevé le 12/11/2026) : trois vrai ou faux, et le poste préféré (non jugé).
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) : les faits d'entreprise sont ceux, déjà vérifiés, des univers `contenus/amazon.js`, `stellantis.js`, `airbus.js`,
// `royal-canin.js` (leurs `MENTION`) ; le Bac Pro d'après la fiche Onisep « Bac pro métiers de la logistique » (relevée le 12/11/2026). Construits : Sarah
// (élève de Terminale qui fait visiter), les étapes détaillées du chemin d'un article, les trois prestataires d'Airbus et leurs prix, les trois lots de
// Royal Canin et leurs dates, les roues par heure (on compte 4 roues par voiture).
// Notation : vitrine non comptée dans les compétences (`competences: []`) ; 20 points pour que l'élève voie un résultat (à l'envoi de chaque fiche).

import { catalogueSimple } from './entreprise-commun.js';

// Un nombre saisi (« 60 », « 60,0 », « 60 voitures » ne passe pas : la case refuse ce qui n'est pas un nombre entier).
const lireNombre = (s) => { const t = String(s == null ? '' : s).replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'); return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };

export const ID = 'vitrine-logistique';
export const ID_VOLET = 'vitrine-251';
export const FICHES = { amazon: 'amazon-251', stellantis: 'stellantis-251', airbus: 'airbus-251', royal: 'royal-251', bac: 'bac-251' };
export const JOUR = { iso: '2026-11-16', lib: 'lundi 16 novembre 2026' };

const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LOGOS = {
  amazon: './contenus/trames/logos/amazon.svg',
  stellantis: './contenus/trames/logos/stellantis.svg',
  airbus: './contenus/trames/logos/airbus.svg',
  royal: './contenus/trames/logos/royal-canin.svg',
};

// ─────────────────────────────────────────────────────────────── l'univers (le lycée, pas une entreprise)
export const ENTREPRISE = {
  id: 'vitrine-logistique',
  nom: 'Le Bac Pro Logistique',
  sousTitre: 'Semaine des filières — quatre entreprises où travaillent les logisticiens',
  exercice: 'La visite',
  logo: './contenus/trames/logos/prepalog.png',
};
export const VOCAB = { unit: 'article', unitPl: 'articles', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'lycee.example' };
// L'accent de Prepalog (le vert de `--ardoise`, clair) : le moteur le remplace par l'encre dans la zone de travail (charte verte, décision du 05/10/2026).
export const THEME = { accent: '#107c41', papier: true };
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

// ─────────────────────────────────────────────────────────────── les données des fiches (les réponses justes)
export const CHEMIN = [
  { v: 'camion', lib: 'Le camion d’un vendeur livre ses articles au centre' },
  { v: 'ranger', lib: 'Un agent range chaque article dans une case d’armoire : cette case devient son adresse' },
  { v: 'commande', lib: 'Un client commande l’article sur internet' },
  { v: 'robot', lib: 'Un robot soulève l’armoire et l’apporte au poste du préparateur' },
  { v: 'emballer', lib: 'Le préparateur prend l’article et l’emballe dans le carton que le système lui donne' },
  { v: 'peser', lib: 'Le colis est pesé : s’il n’a pas le bon poids, il sort de la ligne' },
];
export const ORDRE_CHEMIN = CHEMIN.map((e) => e.v);
// Départ fixe, le même pour tous (une vitrine, pas de tirage) : 13 inversions sur 15, jamais l'ordre juste.
export const DEPART_CHEMIN = ['emballer', 'robot', 'peser', 'commande', 'camion', 'ranger'];
export const QUI_BOUGE = [
  { v: 'preparateur', lib: 'Le préparateur, qui marche dans les allées' },
  { v: 'robot', lib: 'Le robot, qui apporte l’armoire au préparateur' },
  { v: 'client', lib: 'Le client, qui vient chercher son colis' },
];
export const QUI_BOUGE_JUSTE = 'robot';

export const ROUES_PAR_VOITURE = 4;
export const PAR_HEURE = 60;
export const ROUES_HEURE = PAR_HEURE * ROUES_PAR_VOITURE;   // 240
export const RETARD = [
  { v: 'sans', lib: 'On monte la voiture sans la pièce, on l’ajoutera plus tard' },
  { v: 'arret', lib: 'La ligne s’arrête : des centaines de personnes ne peuvent plus travailler' },
  { v: 'rien', lib: 'Rien : le magasin enverra la pièce à la fin de la journée' },
];
export const RETARD_JUSTE = 'arret';

export const PRESTATAIRES = [
  { v: 'coursier', lib: 'Coursier dédié', delai: 'livré le jour même', prix: '950 €' },
  { v: 'express', lib: 'Express aérien', delai: 'livré le lendemain', prix: '210 €' },
  { v: 'messagerie', lib: 'Messagerie', delai: 'livré en 3 jours', prix: '45 €' },
];
export const CAS_AIRBUS = [
  { id: 'aog', lib: 'Un hélicoptère du SAMU est bloqué au sol à Lyon : il attend cette pièce pour repartir.', juste: 'coursier', manque: 'l’hélicoptère au sol' },
  { id: 'revision', lib: 'Une école de pilotage veut une pièce pour la révision de son hélicoptère, prévue dans deux semaines.', juste: 'messagerie', manque: 'la révision' },
];

export const EXPORT_PCT = 85;
export const LOTS = [
  { v: 'L-2611', lib: 'Lot L-2611 : à consommer de préférence avant le 12/05/2027' },
  { v: 'L-2604', lib: 'Lot L-2604 : à consommer de préférence avant le 03/02/2027' },
  { v: 'L-2618', lib: 'Lot L-2618 : à consommer de préférence avant le 20/08/2027' },
];
export const LOT_JUSTE = 'L-2604';

export const VRAI_FAUX = [{ v: 'vrai', lib: 'Vrai' }, { v: 'faux', lib: 'Faux' }];
export const AFFIRMATIONS = [
  { id: 'pfmp', lib: 'En Bac Pro Logistique, on passe environ 20 semaines en entreprise sur les trois ans.', juste: 'vrai' },
  { id: 'engins', lib: 'On apprend à conduire des engins de manutention, comme les chariots.', juste: 'vrai' },
  { id: 'apres', lib: 'Après le Bac Pro Logistique, on ne peut pas continuer ses études.', juste: 'faux' },
];
export const POSTES = [
  { v: 'amazon', lib: 'Amazon : préparer les commandes avec les robots' },
  { v: 'stellantis', lib: 'Stellantis : alimenter la ligne des voitures' },
  { v: 'airbus', lib: 'Airbus Helicopters : expédier les pièces urgentes' },
  { v: 'royal', lib: 'Royal Canin : suivre les stocks et les lots' },
  { v: 'aucun', lib: 'Aucun pour l’instant' },
];

// ─────────────────────────────────────────────────────────────── lecture de la base
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => fiche(db, id).envoye || geste(db, `fiche:${id}:envoyer`);
export const memeOrdre = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
export function departChemin(db) {
  return DEPART_CHEMIN.map((v) => ({ v, lib: (CHEMIN.find((e) => e.v === v) || {}).lib || v }));
}

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; le logo de chaque entreprise en tête)
export const STYLE = `
--douce:#555047;
.vl-doc{padding:14px 18px 0}
.vl-doc p{margin:0 0 8px}
.vl-logo{display:block; height:30px; width:auto; max-width:180px; margin:0 0 8px}
.vl-t{margin:0; font-size:1.08rem; font-weight:800}
.vl-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.vl-ul{margin:4px 0 8px; padding-left:20px; font-size:.95rem}
.vl-ul li{margin:4px 0}
.vl-table{border-collapse:collapse; width:100%; font-size:.92rem; margin:4px 0 10px}
.vl-table th,.vl-table td{border:1px solid #d9d3c6; padding:5px 8px; text-align:left; vertical-align:top}
.vl-table thead th{font-weight:700}
.vl-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
const pied = (t) => `<p class="vl-pied">${ech(t)}</p>`;
const logo = (cle, nom) => `<img class="vl-logo" src="${LOGOS[cle]}" alt="${ech(nom)}">`;

export const DOC_AMAZON = { id: 'amazon-251', titre: 'Amazon à Brétigny-sur-Orge', court: 'Amazon',
  html: `<article class="vl-doc" aria-label="Amazon à Brétigny-sur-Orge">
    ${logo('amazon', 'Amazon')}
    <p class="vl-t">Amazon : la marchandise vient à toi</p>
    <p class="vl-st">Centre de distribution de Brétigny-sur-Orge (Essonne)</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">La taille</th><td><b>70 000 m²</b> sur trois niveaux, environ <b>4 500 salariés</b>.</td></tr>
      <tr><th scope="row">Les robots</th><td>Environ <b>4 000 robots</b>. Le préparateur ne court pas dans les allées : le robot <b>soulève l’armoire</b> et l’apporte à son poste.</td></tr>
      <tr><th scope="row">Le volume</th><td>En moyenne <b>500 000 colis</b> préparés par jour.</td></tr>
      <tr><th scope="row">Le contrôle</th><td>Chaque colis est pesé. Un colis qui n’a pas le bon poids <b>sort de la ligne</b> pour être vérifié.</td></tr>
    </tbody></table>
    <p>En Bac Pro Logistique, tu apprends à <b>ranger</b> et à <b>préparer les commandes</b>, comme ici.</p>
    ${pied('Réels : le centre Amazon de Brétigny-sur-Orge, sa taille, ses robots, ses salariés et ses colis par jour, la pesée des colis. Document pédagogique.')}
  </article>` };

export const DOC_STELLANTIS = { id: 'stellantis-251', titre: 'Stellantis à Sochaux', court: 'Stellantis',
  html: `<article class="vl-doc" aria-label="Stellantis à Sochaux">
    ${logo('stellantis', 'Stellantis')}
    <p class="vl-t">Stellantis : une voiture par minute</p>
    <p class="vl-st">Usine de Sochaux (Doubs), où l’on monte les Peugeot 3008 et 5008</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">La ligne</th><td>Environ <b>1 045 voitures par jour</b> : <b>une par minute</b>.</td></tr>
      <tr><th scope="row">Les camions</th><td>Environ <b>250 camions</b> et <b>500 fournisseurs</b> par jour apportent les pièces.</td></tr>
      <tr><th scope="row">La logistique</th><td>Elle amène chaque pièce <b>au bord de la ligne</b>, au bon poste, juste à temps.</td></tr>
      <tr><th scope="row">Si ça manque</th><td>Une chaîne à l’arrêt immobilise environ <b>1 200 personnes</b>.</td></tr>
    </tbody></table>
    <p>En Terminale Logistique, tu apprends la <b>logistique industrielle</b> : alimenter une ligne de production sans jamais l’arrêter.</p>
    ${pied('Réels : l’usine Stellantis de Sochaux, ses voitures par jour, ses camions et fournisseurs, les personnes immobilisées par un arrêt de chaîne. Document pédagogique.')}
  </article>` };

export const DOC_AIRBUS = { id: 'airbus-251', titre: 'Airbus Helicopters à Marignane', court: 'Airbus Helicopters',
  html: `<article class="vl-doc" aria-label="Airbus Helicopters à Marignane">
    ${logo('airbus', 'Airbus')}
    <p class="vl-t">Airbus Helicopters : une pièce pour un hélicoptère au sol</p>
    <p class="vl-st">Site de Marignane (Bouches-du-Rhône), magasin des pièces de rechange</p>
    <p>Airbus Helicopters a livré <b>361 hélicoptères</b> en 2024. Ses clients : secours, gendarmerie, transport sanitaire, écoles de pilotage. Quand un hélicoptère
      attend une pièce pour voler, on dit qu’il est <b>AOG</b> (« au sol ») : la pièce doit partir <b>au plus vite</b>.</p>
    <p class="vl-st" style="margin-top:10px">Les trois transports possibles (prix construits pour l’exercice)</p>
    <table class="vl-table"><thead><tr><th>Transport</th><th>Délai</th><th>Prix</th></tr></thead><tbody>
      ${PRESTATAIRES.map((p) => `<tr><td>${ech(p.lib)}</td><td>${ech(p.delai)}</td><td>${ech(p.prix)}</td></tr>`).join('')}
    </tbody></table>
    <p><b>La règle :</b> hélicoptère au sol, le plus <b>rapide</b>. Sinon, le moins <b>cher</b> qui arrive à temps.</p>
    <p>En Bac Pro Logistique, tu apprends à <b>confier une expédition</b> à un transporteur : au bon prix et à temps.</p>
    ${pied('Réels : Airbus Helicopters, son site de Marignane, son magasin de pièces de rechange, ses livraisons de 2024, le service AOG. Construits : les trois transports, leurs délais et leurs prix, la règle. Document pédagogique.')}
  </article>` };

export const DOC_ROYAL = { id: 'royal-251', titre: 'Royal Canin à Aimargues', court: 'Royal Canin',
  html: `<article class="vl-doc" aria-label="Royal Canin à Aimargues">
    ${logo('royal', 'Royal Canin')}
    <p class="vl-t">Royal Canin : des croquettes pour le monde entier</p>
    <p class="vl-st">Entrepôt de produits finis d’Aimargues (Gard)</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">La production</th><td>Royal Canin produit ses croquettes à Aimargues et à Cambrai : environ <b>349 000 tonnes</b> en 2024.</td></tr>
      <tr><th scope="row">L’export</th><td>Environ <b>85 %</b> partent à l’étranger, vers plus de 100 pays.</td></tr>
      <tr><th scope="row">L’entrepôt</th><td><b>1 800</b> emplacements de palettes, des terminaux radio qui guident les préparateurs.</td></tr>
    </tbody></table>
    <p><b>La règle des lots :</b> chaque lot porte une date « à consommer de préférence avant ». On fait partir d’abord le lot dont la date est <b>la plus proche</b>.
      On l’appelle <b>FEFO</b> : premier périmé, premier sorti.</p>
    <p>En Terminale Logistique, tu apprends à <b>piloter les stocks</b> et à suivre les lots.</p>
    ${pied('Réels : Royal Canin, ses usines d’Aimargues et de Cambrai, ses tonnes de 2024 et leur part exportée, l’entrepôt d’Aimargues, le FEFO. Construits : les trois lots et leurs dates. Document pédagogique.')}
  </article>` };

export const DOC_BAC = { id: 'bac-251', titre: 'Le Bac Pro Logistique en bref', court: 'Le Bac Pro Logistique',
  html: `<article class="vl-doc" aria-label="Le Bac Pro Logistique en bref">
    <p class="vl-t">Le Bac Pro Logistique en bref</p>
    <p class="vl-st">Bac pro « Métiers de la logistique », en 1re et en Terminale, après la 2de GATL</p>
    <ul class="vl-ul">
      <li>Il forme à <b>toute la chaîne logistique</b> : recevoir, ranger, suivre les stocks, préparer les commandes, expédier, organiser une petite équipe.</li>
      <li>Tu apprends à <b>conduire des engins de manutention</b> (les chariots) en sécurité.</li>
      <li>Tu passes environ <b>20 semaines en entreprise</b> (les PFMP) sur les trois ans.</li>
      <li>Des métiers : <b>préparateur de commandes</b>, <b>magasinier cariste</b>, agent de transit, puis chef d’équipe.</li>
      <li>Après le bac : travailler, ou continuer, par exemple en <b>BTS Gestion des transports et logistique associée</b>.</li>
    </ul>
    <p>Les quatre entreprises de la visite recrutent des logisticiens : dans un entrepôt, une usine, un aéroport ou un magasin de pièces.</p>
    ${pied('D’après la fiche Onisep « Bac pro métiers de la logistique », relevée le 12/11/2026. Document pédagogique.')}
  </article>` };

export const DOCUMENTS = [DOC_AMAZON, DOC_STELLANTIS, DOC_AIRBUS, DOC_ROYAL, DOC_BAC];

// ─────────────────────────────────────────────────────────────── les fiches
const envoi = { bouton: 'Envoyer la fiche à Sarah', a: 'Sarah', suite: 'Sarah va te répondre.' };
export const FICHE_AMAZON = {
  id: FICHES.amazon, libelle: '① Amazon', titre: 'Amazon : le chemin d’un article',
  sousTitre: 'Lis le document « Amazon », à gauche.',
  documents: [DOC_AMAZON.id],
  bouton: 'Ouvrir la fiche « Amazon »',
  blocs: (db) => [
    { type: 'ordre', id: 'chemin', titre: 'Le chemin d’un article', consigne: 'Remets les étapes dans l’ordre, de la première à la dernière.', choix: departChemin(db) },
    { type: 'liste', id: 'bouge', lib: 'Chez Amazon, qui se déplace pour que le préparateur ait l’article ?', vide: 'Choisir…', manque: 'qui se déplace', choix: QUI_BOUGE },
  ],
  envoi,
};
export const FICHE_STELLANTIS = {
  id: FICHES.stellantis, libelle: '② Stellantis', titre: 'Stellantis : une voiture par minute',
  sousTitre: 'Lis le document « Stellantis ». Calcule de tête ou au brouillon.',
  documents: [DOC_STELLANTIS.id],
  bouton: 'Ouvrir la fiche « Stellantis »',
  quand: dejaEnvoyee(FICHES.amazon),
  blocs: [
    { type: 'nombre', id: 'parheure', lib: 'La ligne sort une voiture par minute. Combien de voitures en une heure ?', unite: 'voitures', min: 0, entier: true, manque: 'les voitures par heure' },
    { type: 'nombre', id: 'roues', lib: 'Chaque voiture a 4 roues. Combien de roues la logistique amène-t-elle au bord de la ligne en une heure ?', unite: 'roues', min: 0, entier: true,
      manque: 'les roues par heure' },
    { type: 'liste', id: 'retard', lib: 'Une pièce n’arrive pas au bord de la ligne. Que se passe-t-il ?', vide: 'Choisir…', manque: 'la pièce en retard', choix: RETARD },
  ],
  envoi,
};
export const FICHE_AIRBUS = {
  id: FICHES.airbus, libelle: '③ Airbus Helicopters', titre: 'Airbus Helicopters : quel transport ?',
  sousTitre: 'Lis le document « Airbus Helicopters » et sa règle. Choisis le transport de chaque pièce.',
  documents: [DOC_AIRBUS.id],
  bouton: 'Ouvrir la fiche « Airbus Helicopters »',
  quand: dejaEnvoyee(FICHES.stellantis),
  blocs: CAS_AIRBUS.map((c) => ({ type: 'liste', id: c.id, lib: c.lib, vide: 'Choisir le transport…', manque: c.manque,
    choix: PRESTATAIRES.map((p) => ({ v: p.v, lib: `${p.lib} (${p.delai}, ${p.prix})` })) })),
  envoi,
};
export const FICHE_ROYAL = {
  id: FICHES.royal, libelle: '④ Royal Canin', titre: 'Royal Canin : l’export et les lots',
  sousTitre: 'Lis le document « Royal Canin » et sa règle des lots.',
  documents: [DOC_ROYAL.id],
  bouton: 'Ouvrir la fiche « Royal Canin »',
  quand: dejaEnvoyee(FICHES.airbus),
  blocs: [
    { type: 'nombre', id: 'export', lib: 'Sur 100 tonnes de croquettes, combien de tonnes partent à l’étranger ?', unite: 'tonnes', min: 0, entier: true, manque: 'les tonnes exportées' },
    { type: 'liste', id: 'lot', lib: 'Une commande arrive. Trois lots sont en stock. Lequel sors-tu en premier ?', vide: 'Choisir le lot…', manque: 'le lot', choix: LOTS },
  ],
  envoi,
};
export const FICHE_BAC = {
  id: FICHES.bac, libelle: '⑤ Et toi ?', titre: 'Et toi, en Logistique ?',
  sousTitre: 'Lis le document « Le Bac Pro Logistique en bref ». Vrai ou faux ?',
  documents: [DOC_BAC.id],
  bouton: 'Ouvrir la fiche « Et toi ? »',
  quand: dejaEnvoyee(FICHES.royal),
  blocs: [
    ...AFFIRMATIONS.map((a) => ({ type: 'liste', id: a.id, lib: a.lib, vide: 'Vrai ou faux ?', manque: 'un vrai ou faux', choix: VRAI_FAUX })),
    { type: 'liste', id: 'prefere', lib: 'Lequel de ces quatre postes t’a le plus plu ? (Il n’y a pas de mauvaise réponse.)', vide: 'Choisir…', manque: 'ton poste préféré', choix: POSTES },
  ],
  envoi,
};
export const FICHES_LISTE = [FICHE_AMAZON, FICHE_STELLANTIS, FICHE_AIRBUS, FICHE_ROYAL, FICHE_BAC];

// ─────────────────────────────────────────────────────────────── les jalons (20 points ; rien n'est vrai avant l'envoi : l'inaction vaut 0)
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const juge = (b) => (b ? ok : ko);
const nb = (v) => lireNombre(v);
export const GROUPES = { amazon: '① Amazon', stellantis: '② Stellantis', airbus: '③ Airbus Helicopters', royal: '④ Royal Canin', bac: '⑤ Le Bac Pro Logistique' };
export const POIDS = { chemin: 4, bouge: 1, parheure: 2, roues: 2, retard: 1, aog: 2, revision: 2, export: 1, lot: 2, vf: 1 };
const jalon = (id, titre, groupe, fid, ecran, poids, test) => ({ id, titre, groupe, ecran, poids,
  verifier(db) { const f = fiche(db, fid); return !f.envoye ? attente : juge(test(f.valeurs)); } });
export const ETAPES = [
  jalon('chemin', 'Amazon : les 6 étapes du chemin dans l’ordre', GROUPES.amazon, FICHES.amazon, 'fiche', POIDS.chemin, (V) => memeOrdre(V.chemin, ORDRE_CHEMIN)),
  jalon('bouge', 'Amazon : c’est le robot qui se déplace', GROUPES.amazon, FICHES.amazon, 'fiche', POIDS.bouge, (V) => V.bouge === QUI_BOUGE_JUSTE),
  jalon('parheure', 'Stellantis : 60 voitures par heure', GROUPES.stellantis, FICHES.stellantis, `fiche:${FICHES.stellantis}`, POIDS.parheure, (V) => nb(V.parheure) === PAR_HEURE),
  jalon('roues', 'Stellantis : 240 roues par heure', GROUPES.stellantis, FICHES.stellantis, `fiche:${FICHES.stellantis}`, POIDS.roues, (V) => nb(V.roues) === ROUES_HEURE),
  jalon('retard', 'Stellantis : sans la pièce, la ligne s’arrête', GROUPES.stellantis, FICHES.stellantis, `fiche:${FICHES.stellantis}`, POIDS.retard, (V) => V.retard === RETARD_JUSTE),
  ...CAS_AIRBUS.map((c) => jalon(c.id, c.id === 'aog' ? 'Airbus : l’hélicoptère au sol part en coursier (le plus rapide)' : 'Airbus : la révision part en messagerie (le moins cher à temps)',
    GROUPES.airbus, FICHES.airbus, `fiche:${FICHES.airbus}`, POIDS[c.id], (V) => V[c.id] === c.juste)),
  jalon('export', 'Royal Canin : 85 tonnes sur 100 partent à l’étranger', GROUPES.royal, FICHES.royal, `fiche:${FICHES.royal}`, POIDS.export, (V) => nb(V.export) === EXPORT_PCT),
  jalon('lot', 'Royal Canin : le lot à la date la plus proche sort d’abord', GROUPES.royal, FICHES.royal, `fiche:${FICHES.royal}`, POIDS.lot, (V) => V.lot === LOT_JUSTE),
  ...AFFIRMATIONS.map((a) => jalon(`vf-${a.id}`, `Le Bac Pro : « ${a.lib} » ${a.juste === 'vrai' ? 'Vrai' : 'Faux'}`, GROUPES.bac, FICHES.bac, `fiche:${FICHES.bac}`, POIDS.vf,
    (V) => V[a.id] === a.juste)),
];

// ─────────────────────────────────────────────────────────────── les messages de Sarah (au tu)
export const EQUIPE = { sarah: { nom: 'Sarah', role: 'élève de Terminale Bac Pro Logistique (ta guide)', appel: 'Sarah', registre: 'tu' } };
const SARAH = { nom: 'Sarah', mail: 'sarah@lycee.example' };
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '08:00'), from: SARAH.nom, fromMail: SARAH.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (sujet) => (prenom, n, db) => ({ mails: [mail(prenom, `RE : ${sujet}`, 'Merci, j’ai ta nouvelle fiche.\n\nSarah', { db, heure: '09:00' })] });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [mail(prenom, 'Bienvenue : on part en visite !',
    `Salut ${prenom} ! Je m’appelle Sarah, je suis en Terminale Bac Pro Logistique.\n\n`
      + 'Aujourd’hui, je te fais visiter quatre vraies entreprises où travaillent des logisticiens : Amazon, Stellantis, Airbus Helicopters et Royal Canin. '
      + 'À chaque arrêt, tu lis un court document et tu fais ce qu’on y fait vraiment.\n\n'
      + 'Premier arrêt : le centre Amazon de Brétigny-sur-Orge. Lis le document « Amazon », puis ouvre la fiche.\n\nSarah',
    { db, extra: { pieces: [DOC_AMAZON.id], ouvreFiche: FICHES.amazon } })] }),
  declencheurs: [
    { id: 'stellantis', quand: dejaEnvoyee(FICHES.amazon), semer: (prenom, db) => ({ mails: [mail(prenom, 'Deuxième arrêt : Stellantis',
      'Merci ! Chez Amazon, ce sont les robots qui marchent. On file à Sochaux, dans l’usine Stellantis : ici, une voiture sort chaque minute, et la logistique ne doit jamais '
        + 'laisser la ligne sans pièces.\n\nLis le document « Stellantis », puis ouvre la fiche.\n\nSarah',
      { db, heure: '08:15', extra: { pieces: [DOC_STELLANTIS.id], ouvreFiche: FICHES.stellantis } })] }) },
    { id: 'airbus', quand: dejaEnvoyee(FICHES.stellantis), semer: (prenom, db) => ({ mails: [mail(prenom, 'Troisième arrêt : Airbus Helicopters',
      'On descend à Marignane, près de Marseille, chez Airbus Helicopters. Ici, une pièce peut faire repartir un hélicoptère de secours : il faut choisir le bon transport.\n\n'
        + 'Lis le document « Airbus Helicopters », puis ouvre la fiche.\n\nSarah',
      { db, heure: '08:30', extra: { pieces: [DOC_AIRBUS.id], ouvreFiche: FICHES.airbus } })] }) },
    { id: 'royal', quand: dejaEnvoyee(FICHES.airbus), semer: (prenom, db) => ({ mails: [mail(prenom, 'Quatrième arrêt : Royal Canin',
      'Dernière entreprise : Royal Canin, à Aimargues, dans le Gard. Des croquettes pour chiens et chats, qui partent dans le monde entier.\n\n'
        + 'Lis le document « Royal Canin », puis ouvre la fiche.\n\nSarah',
      { db, heure: '08:45', extra: { pieces: [DOC_ROYAL.id], ouvreFiche: FICHES.royal } })] }) },
    { id: 'bac', quand: dejaEnvoyee(FICHES.royal), semer: (prenom, db) => ({ mails: [mail(prenom, 'Et toi, en Logistique ?',
      'Tu as vu quatre métiers de la logistique : préparer les commandes, alimenter une ligne, expédier une pièce urgente, suivre les stocks. Tout ça, on l’apprend en Bac Pro Logistique.\n\n'
        + 'Lis le document « Le Bac Pro Logistique en bref », puis ouvre la dernière fiche.\n\nSarah',
      { db, heure: '09:00', extra: { pieces: [DOC_BAC.id], ouvreFiche: FICHES.bac } })] }) },
    { id: 'fin', quand: dejaEnvoyee(FICHES.bac), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour la visite',
      'Merci pour cette visite ! Tu as fait en une heure un petit bout de ce qu’on fait en 1re et en Terminale Logistique. '
        + 'Si tu as des questions sur la filière, pose-les à ton professeur : il y a aussi les élèves de 1re et de Terminale pour te répondre.\n\nSarah',
      { db, heure: '09:15' })] }) },
  ],
  corrections: {
    [FICHES.amazon]: accuse('Amazon'), [FICHES.stellantis]: accuse('Stellantis'), [FICHES.airbus]: accuse('Airbus Helicopters'),
    [FICHES.royal]: accuse('Royal Canin'), [FICHES.bac]: accuse('Et toi ?'),
  },
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE = {
  'centre de distribution': 'Un entrepôt qui reçoit les articles, les range, puis prépare et expédie les commandes des clients.',
  'bord de ligne': 'L’endroit, juste à côté de la ligne de montage, où la logistique dépose les pièces dont chaque poste a besoin.',
  'AOG': '« Aircraft on ground » : un avion ou un hélicoptère bloqué au sol, qui attend une pièce pour repartir.',
  'FEFO': '« Premier périmé, premier sorti » : on fait partir d’abord le lot dont la date est la plus proche.',
  'PFMP': 'Période de formation en milieu professionnel : les stages en entreprise du lycée professionnel.',
  'BTS': 'Brevet de technicien supérieur : un diplôme en deux ans après le bac.',
};
export const MENTION = 'Réels : Amazon (Brétigny-sur-Orge), Stellantis (Sochaux), Airbus Helicopters (Marignane), Royal Canin (Aimargues) et leurs chiffres, déjà vérifiés pour d’autres séances '
  + 'de Prepalog ; le Bac Pro Logistique d’après la fiche Onisep (relevée le 12/11/2026). Construits : Sarah, les étapes détaillées du chemin d’un article, '
  + 'les transports d’Airbus et leurs prix, les lots de Royal Canin et leurs dates.';
export const ACCUEIL = {
  titre: 'Et si tu choisissais la Logistique ?',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Sarah', 'Menu Messagerie : Sarah, élève de Terminale, te fait visiter quatre entreprises.'],
    ['① Amazon', 'Remets dans l’ordre le chemin d’un article.'],
    ['② Stellantis', 'Une voiture par minute : deux petits calculs.'],
    ['③ Airbus Helicopters', 'Choisis le transport de deux pièces.'],
    ['④ Royal Canin', 'L’export et le lot à sortir en premier.'],
    ['⑤ Et toi ?', 'Le Bac Pro Logistique en bref, et le poste qui t’a plu.'],
    ['Bon à savoir', MENTION],
  ],
};
export const SUITE = [
  { vue: 'fiche', libelle: '① Amazon', fait: dejaEnvoyee(FICHES.amazon) },
  { vue: `fiche:${FICHES.stellantis}`, libelle: '② Stellantis', fait: dejaEnvoyee(FICHES.stellantis) },
  { vue: `fiche:${FICHES.airbus}`, libelle: '③ Airbus Helicopters', fait: dejaEnvoyee(FICHES.airbus) },
  { vue: `fiche:${FICHES.royal}`, libelle: '④ Royal Canin', fait: dejaEnvoyee(FICHES.royal) },
  { vue: `fiche:${FICHES.bac}`, libelle: '⑤ Et toi ?', fait: dejaEnvoyee(FICHES.bac) },
];
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'La visite',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: FICHES_LISTE,
  fermetures: {
    [`fiche:${FICHES.stellantis}`]: { ouvertSi: dejaEnvoyee(FICHES.amazon), message: 'Après « ① Amazon »' },
    [`fiche:${FICHES.airbus}`]: { ouvertSi: dejaEnvoyee(FICHES.stellantis), message: 'Après « ② Stellantis »' },
    [`fiche:${FICHES.royal}`]: { ouvertSi: dejaEnvoyee(FICHES.airbus), message: 'Après « ③ Airbus Helicopters »' },
    [`fiche:${FICHES.bac}`]: { ouvertSi: dejaEnvoyee(FICHES.royal), message: 'Après « ④ Royal Canin »' },
  },
};
