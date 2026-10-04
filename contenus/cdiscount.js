// Cdiscount (entrepôt de Cestas) — l'univers de l'environnement ENT-2.x.
//
// C1.6 « Gérer le suivi des stocks », pour les 1L. Série recadrée le 03/10/2026
// (`docs/briefs/COORDINATION-cdiscount.md`) :
//
//   ENT-2.1 « Le stock raconte »                      guidage
//   ENT-2.2 « Ce que disent les chiffres »            guidage du geste tableur (à venir)
//   ENT-2.3 « Inventaire tournant »                   entraînement
//   ENT-2.4 « Régularisé à l'aveugle »                erreur induite
//   ENT-2.5 « Le compte à rebours »                   évaluation (à venir)
//   ENT-2.6 bonus                                      entraînement (à venir)
//
// Ce fichier porte ce qui est COMMUN à toutes — identité, charte, catalogue, emplacements,
// fournisseurs, clients. Chaque séance apporte son stock, ses mouvements, ses messages et ses
// jalons dans son propre fichier `contenus/cdiscount-<séance>.js`.
//
// **Une base par séance, pas une base partagée.** Chez Spartoo, les trois séances partagent la
// base de l'élève parce qu'un même lot traverse la réception, la préparation et la traçabilité.
// Ici, chaque séance est une JOURNÉE différente au même entrepôt, avec son propre périmètre
// (une allée, puis un rayon entier) : la base de l'une ne sert pas à l'autre, et le volume doit
// pouvoir monter d'une séance à l'autre sans traîner l'historique de la précédente.
// Conséquence pratique : chaque séance ne montre que SES références (`sousCatalogue`), pour
// qu'un élève de guidage ne se noie pas dans vingt-quatre lignes de stock.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT — à dire aux élèves, règle du projet
//
// Vérifié (sources dans `claude/prepalog-c16-cadrage-1L.md`, relevé du 02/10/2026) :
//   - Cdiscount est un e-commerçant fondé en 1998 à Bordeaux, avec une place de marché ;
//   - son entrepôt de **Cestas** (Gironde) traite les colis de moins de 30 kg ;
//   - sa filiale logistique s'appelle C-Logistics ;
//   - la charte (couleurs relevées sur cdiscount.com) et le logo.
//
// Construit, et assumé comme tel :
//   - TOUT le catalogue : articles, marques, prix, emplacements, seuils. Les marques
//     (Kabeo, Sonoria, Klicko, Lumiza, Protéo, Voltéo, Gardéo, Actimo) sont INVENTÉES : on ne
//     fabrique pas de faux stock au nom d'une marque réelle ;
//   - les fournisseurs, les clients, les numéros de documents, les personnes de l'équipe ;
//   - l'organisation de l'entrepôt en zones A, B, C : le vrai Cestas fait plus de 100 000 m²,
//     on n'en montre qu'un rayon de petits articles.
//
// **Téléphones** dans la plage 05 36 49 xx xx, réservée par l'Arcep à la fiction, et
// adresses de courriel en `.example` : aucun numéro ni aucune boîte réelle n'est jointe
// depuis un exercice.
//
// **Logo** (`contenus/trames/logos/cdiscount.png`) : récupéré sur cdiscount.com le 02/10/2026,
// SVG de 3 789 octets, SHA-256 6c92c9252d07915d876710fd6c1a26ce89c9746a6978b13bd0934dd88fb93973,
// blanc sur le site ; recoloré dans le bleu de la charte pour se lire sur fond blanc. Il va sur
// le bandeau et sur les trames, **jamais** en en-tête d'un document commercial fabriqué.

import { catalogueSimple, pad, rng } from './entreprise-commun.js';
import { hasard } from '../core/tirage.js';

/* ====================================================== identité et vocabulaire ====== */

export const ENTREPRISE = {
  id: 'cdiscount',
  nom: 'Cdiscount',
  sousTitre: 'Entrepôt de Cestas — suivi des stocks',
  exercice: 'Suivi des stocks et inventaire',
  logo: './contenus/trames/logos/cdiscount.png',
};

// Des articles SIMPLES : une référence = un article, sans couleur ni taille (catalogue simple du
// moteur, chantier E, décision de Tristan du 02/10/2026 — format dans
// `claude/prepalog-inventaire-format.md`). Un conditionnement différent est un autre article :
// « Ampoule LED E27, lot de 3 » a sa propre référence.
export const VOCAB = {
  unit: 'article', unitPl: 'articles',
  icone: 'carton',
  mailDomain: 'cdiscount.example',
};

/* ============================================================= la charte de Cdiscount ==
 * Relevée sur cdiscount.com le 02/10/2026 (cadrage C1.6), pas inventée.
 *
 *   #3732ff  bleu électrique   la couleur de la marque : bandeau du site, logo
 *   #211db6  bleu foncé        survols
 *   #dbe5ff  bleu pâle         aplats clairs
 *   #000098  marine
 *   #f2f3f5  gris de fond      #e4e7eb filet
 *   #ff506e  rose              #ff1e3c rouge, #ffe8ee rose pâle
 *   #293847  texte             #7a8999 gris doux
 *
 * Hors charte, VALIDÉ par Tristan le 02/10/2026 : le vert « conforme » #0a8449 (texte blanc,
 * aplat pâle #e3f4ea), pour qu'un écart nul se lise d'un coup d'œil — l'accent reste bleu, le
 * vert reste distinct (alerte n° 27).
 *
 * Police de la charte : Hind Madurai. **Non servie** : le moteur ne sait pas changer de police
 * par entreprise, et Tristan a choisi le 02/10 de rester en Inter plutôt que d'ouvrir une
 * demande au moteur.
 *
 * Cdiscount est un site CLAIR : le module garde le thème du site (pas de palette `sombre`),
 * et seul l'accent passe au bleu de la marque.
 */
export const CHARTE = {
  bleu: '#3732ff', bleuFonce: '#211db6', bleuPale: '#dbe5ff', marine: '#000098',
  fond: '#f2f3f5', filet: '#e4e7eb', rose: '#ff506e', rouge: '#ff1e3c', rosePale: '#ffe8ee',
  texte: '#293847', grisDoux: '#7a8999',
  conforme: '#0a8449', conformePale: '#e3f4ea',
};

export const THEME = {
  accent: CHARTE.bleu,
  surAccent: '#ffffff',
};

/* ==================================================================== fournisseurs ====== */

// Inventés, un par marque. Adresses : des communes réelles, des sociétés qui n'existent pas,
// sans numéro de rue.
export const SUPPLIERS = [
  { id: 'F01', brand: 'Kabeo', name: 'Kabeo Distribution', adr: 'Parc d\'activités de la Garonne', cp: '33130', ville: 'Bègles',
    contact: 'Julie Castaing', tel: '05 36 49 10 11', email: 'commandes@kabeo.example', delai: 3, franco: 600, pay: '45 jours fin de mois', moq: 20 },
  { id: 'F02', brand: 'Sonoria', name: 'Sonoria Audio France', adr: 'Zone industrielle des Pins', cp: '33700', ville: 'Mérignac',
    contact: 'Romain Lafargue', tel: '05 36 49 10 22', email: 'pro@sonoria.example', delai: 4, franco: 800, pay: '60 jours net', moq: 10 },
  { id: 'F03', brand: 'Klicko', name: 'Klicko Périphériques', adr: 'Technopole Bordeaux Montesquieu', cp: '33650', ville: 'Martillac',
    contact: 'Inès Duprat', tel: '05 36 49 10 33', email: 'b2b@klicko.example', delai: 3, franco: 500, pay: '30 jours fin de mois', moq: 12 },
  { id: 'F04', brand: 'Lumiza', name: 'Lumiza Éclairage', adr: 'Zone d\'activités du Courneau', cp: '33610', ville: 'Canéjan',
    contact: 'Thierry Bouscat', tel: '05 36 49 10 44', email: 'commandes@lumiza.example', delai: 5, franco: 400, pay: '45 jours net', moq: 24 },
  { id: 'F05', brand: 'Protéo', name: 'Protéo Accessoires', adr: 'Parc logistique de Bersol', cp: '33600', ville: 'Pessac',
    contact: 'Sandrine Labat', tel: '05 36 49 10 55', email: 'ventes@proteo.example', delai: 2, franco: 300, pay: '30 jours net', moq: 30 },
  { id: 'F06', brand: 'Voltéo', name: 'Voltéo Électricité', adr: 'Zone industrielle de Bersol', cp: '33600', ville: 'Pessac',
    contact: 'Marc Dupuy', tel: '05 36 49 10 66', email: 'pro@volteo.example', delai: 4, franco: 500, pay: '45 jours fin de mois', moq: 20 },
  { id: 'F07', brand: 'Gardéo', name: 'Gardéo Petit électroménager', adr: 'Parc d\'activités Mios Entreprises', cp: '33380', ville: 'Mios',
    contact: 'Claire Moras', tel: '05 36 49 10 77', email: 'commandes@gardeo.example', delai: 6, franco: 900, pay: '60 jours fin de mois', moq: 6 },
  { id: 'F08', brand: 'Actimo', name: 'Actimo Sport & Loisirs', adr: 'Zone d\'activités de Pot au Pin', cp: '33610', ville: 'Cestas',
    contact: 'Yann Lalanne', tel: '05 36 49 10 88', email: 'b2b@actimo.example', delai: 4, franco: 600, pay: '45 jours net', moq: 10 },
];
export const SUP_BY_ID = (() => { const o = {}; SUPPLIERS.forEach((s) => { o[s.id] = s; }); return o; })();

/* ======================================================================= catalogue ====== */

// Vingt-quatre articles, trois zones. Les huit premiers et leurs emplacements sont ceux de la
// maquette de l'écran Inventaire validée le 02/10 (`prepalog-maquette-inventaire-cdiscount.html`),
// avec le même prix d'achat (c'est lui qui valorise le stock et les écarts d'inventaire), pour que
// l'entraînement (ENT-2.3) retombe sur ce que Tristan a vu.
//
// Format du catalogue simple (`catalogueSimple`, `contenus/entreprise-commun.js`). Le stock de
// départ n'est PAS ici : chaque séance pose le sien dans sa `baseDeDepart`.
//
// Emplacement : zone-allée-niveau, comme chez Spartoo (A-02-1 = zone A, allée 02, niveau 1).
// Un emplacement par référence : c'est ce qu'on compte en inventaire tournant.
const ARTICLES = [
  // zone A — téléphonie et informatique (les huit articles de la maquette)
  { ref: 'CAB-USBC-1M', marque: 'Kabeo', designation: 'Câble USB-C vers USB-C, 1 m', categorie: 'Téléphonie', prix: 9.99, cout: 4.9,
    emplacement: 'A-01-1', min: 15, max: 80, fournisseur: 'F01', description: 'Câble de charge et de données, gaine tressée.' },
  { ref: 'CHG-20W', marque: 'Kabeo', designation: 'Chargeur secteur USB-C 20 W', categorie: 'Téléphonie', prix: 19.99, cout: 9.9,
    emplacement: 'A-01-2', min: 10, max: 50, fournisseur: 'F01', description: 'Chargeur rapide une prise USB-C.' },
  { ref: 'ECO-BT-01', marque: 'Sonoria', designation: 'Écouteurs sans fil Bluetooth', categorie: 'Audio', prix: 39.99, cout: 19.9,
    emplacement: 'A-02-1', min: 8, max: 35, fournisseur: 'F02', description: 'Écouteurs intra-auriculaires et leur boîtier de charge.' },
  { ref: 'SOU-SF-02', marque: 'Klicko', designation: 'Souris sans fil', categorie: 'Informatique', prix: 24.99, cout: 12.5,
    emplacement: 'A-02-2', min: 8, max: 30, fournisseur: 'F03', description: 'Souris optique, récepteur USB.' },
  { ref: 'BAT-10K', marque: 'Kabeo', designation: 'Batterie externe 10 000 mAh', categorie: 'Téléphonie', prix: 39.99, cout: 24.9,
    emplacement: 'A-03-1', min: 6, max: 25, fournisseur: 'F01', description: 'Batterie de poche, deux sorties USB.' },
  { ref: 'CLE-64G', marque: 'Klicko', designation: 'Clé USB 64 Go', categorie: 'Informatique', prix: 14.99, cout: 8.9,
    emplacement: 'A-03-2', min: 10, max: 40, fournisseur: 'F03', description: 'Clé USB 3.2, boîtier métal.' },
  { ref: 'AMP-LED-E27', marque: 'Lumiza', designation: 'Ampoule LED E27, lot de 3', categorie: 'Maison', prix: 12.99, cout: 6.9,
    emplacement: 'A-04-1', min: 15, max: 60, fournisseur: 'F04', description: 'Trois ampoules LED blanc chaud, culot E27, sous blister.' },
  { ref: 'COQ-UNI-01', marque: 'Protéo', designation: 'Coque de protection universelle', categorie: 'Téléphonie', prix: 14.99, cout: 7.5,
    emplacement: 'A-04-2', min: 15, max: 70, fournisseur: 'F05', description: 'Coque souple ajustable, pour écrans de 6 à 6,7 pouces.' },
  // zone A, suite
  { ref: 'CAS-FIL-01', marque: 'Sonoria', designation: 'Casque audio filaire', categorie: 'Audio', prix: 29.99, cout: 13.4,
    emplacement: 'A-05-1', min: 6, max: 25, fournisseur: 'F02', description: 'Casque arceau, câble jack 3,5 mm.' },
  { ref: 'SUP-VOIT', marque: 'Protéo', designation: 'Support téléphone pour voiture', categorie: 'Téléphonie', prix: 12.99, cout: 4.8,
    emplacement: 'A-05-2', min: 10, max: 40, fournisseur: 'F05', description: 'Support à pince pour grille d\'aération.' },
  { ref: 'CLA-SF-01', marque: 'Klicko', designation: 'Clavier sans fil AZERTY', categorie: 'Informatique', prix: 29.99, cout: 14.2,
    emplacement: 'A-06-1', min: 6, max: 25, fournisseur: 'F03', description: 'Clavier fin, récepteur USB, disposition française.' },
  { ref: 'HUB-USB-4', marque: 'Klicko', designation: 'Hub USB 4 ports', categorie: 'Informatique', prix: 17.99, cout: 7.9,
    emplacement: 'A-06-2', min: 8, max: 30, fournisseur: 'F03', description: 'Répartiteur quatre ports USB.' },
  // zone B — maison
  { ref: 'MUL-4P', marque: 'Voltéo', designation: 'Multiprise 4 prises avec interrupteur', categorie: 'Maison', prix: 14.99, cout: 6.2,
    emplacement: 'B-01-1', min: 10, max: 40, fournisseur: 'F06', description: 'Multiprise 1,5 m, interrupteur lumineux.' },
  { ref: 'PIL-AA-8', marque: 'Voltéo', designation: 'Piles alcalines AA, lot de 8', categorie: 'Maison', prix: 7.99, cout: 3.1,
    emplacement: 'B-01-2', min: 20, max: 90, fournisseur: 'F06', description: 'Huit piles LR6 sous blister.' },
  { ref: 'VEI-LED', marque: 'Lumiza', designation: 'Veilleuse LED à détecteur', categorie: 'Maison', prix: 9.99, cout: 3.7,
    emplacement: 'B-02-1', min: 8, max: 30, fournisseur: 'F04', description: 'Veilleuse à brancher, s\'allume dans le noir.' },
  { ref: 'BOU-17L', marque: 'Gardéo', designation: 'Bouilloire électrique 1,7 L', categorie: 'Cuisine', prix: 29.99, cout: 13.9,
    emplacement: 'B-02-2', min: 4, max: 18, fournisseur: 'F07', description: 'Bouilloire inox, arrêt automatique.' },
  { ref: 'GRP-2F', marque: 'Gardéo', designation: 'Grille-pain 2 fentes', categorie: 'Cuisine', prix: 24.99, cout: 11.2,
    emplacement: 'B-03-1', min: 4, max: 16, fournisseur: 'F07', description: 'Grille-pain, sept niveaux de brunissage.' },
  { ref: 'MIX-PLG', marque: 'Gardéo', designation: 'Mixeur plongeant', categorie: 'Cuisine', prix: 27.99, cout: 12.6,
    emplacement: 'B-03-2', min: 4, max: 16, fournisseur: 'F07', description: 'Mixeur plongeant 600 W, pied inox.' },
  // zone C — sport et loisirs
  { ref: 'GOU-ISO-75', marque: 'Actimo', designation: 'Gourde isotherme 750 ml', categorie: 'Sport', prix: 19.99, cout: 7.4,
    emplacement: 'C-01-1', min: 8, max: 35, fournisseur: 'F08', description: 'Gourde inox double paroi.' },
  { ref: 'COR-SAU', marque: 'Actimo', designation: 'Corde à sauter réglable', categorie: 'Sport', prix: 9.99, cout: 3.2,
    emplacement: 'C-01-2', min: 8, max: 30, fournisseur: 'F08', description: 'Corde à roulements, poignées mousse.' },
  { ref: 'TAP-YOG', marque: 'Actimo', designation: 'Tapis de yoga', categorie: 'Sport', prix: 24.99, cout: 9.8,
    emplacement: 'C-02-1', min: 5, max: 20, fournisseur: 'F08', description: 'Tapis antidérapant 6 mm, sangle de transport.' },
  { ref: 'BAL-FOOT', marque: 'Actimo', designation: 'Ballon de football', categorie: 'Sport', prix: 14.99, cout: 5.9,
    emplacement: 'C-02-2', min: 6, max: 25, fournisseur: 'F08', description: 'Ballon cousu, taille 5, livré dégonflé.' },
  { ref: 'LAM-FRO', marque: 'Lumiza', designation: 'Lampe frontale LED', categorie: 'Sport', prix: 16.99, cout: 6.3,
    emplacement: 'C-03-1', min: 6, max: 25, fournisseur: 'F04', description: 'Lampe frontale, trois modes, piles fournies.' },
  { ref: 'ELA-FIT-3', marque: 'Actimo', designation: 'Bandes élastiques de fitness, lot de 3', categorie: 'Sport', prix: 12.99, cout: 4.4,
    emplacement: 'C-03-2', min: 8, max: 30, fournisseur: 'F08', description: 'Trois bandes de résistance différente.' },
];

export const CATALOGUE = catalogueSimple(ARTICLES);

// Le catalogue réduit au périmètre d'une séance. Les écrans Catalogue, Stock et la console ne
// connaissent alors que ces articles : une séance de guidage sur cinq références montre cinq
// lignes, pas vingt-quatre.
export function sousCatalogue(refs) {
  const inconnus = refs.filter((r) => !CATALOGUE.VM[r]);
  if (inconnus.length) throw new Error(`Articles Cdiscount inconnus : ${inconnus.join(', ')}`);
  return catalogueSimple(ARTICLES.filter((a) => refs.includes(a.ref)));
}

/* ========================================================================== clients ====== */

// Inventés, sur le modèle de Spartoo : prénoms et noms courants, villes réelles de la région
// et d'ailleurs, rues génériques. Ils ne servent qu'à donner un destinataire aux commandes.
function genClients() {
  const FN = ['Camille', 'Lucas', 'Léa', 'Hugo', 'Emma', 'Nathan', 'Chloé', 'Louis', 'Manon', 'Théo', 'Inès', 'Enzo',
    'Sarah', 'Maxime', 'Jade', 'Tom', 'Laura', 'Yanis', 'Clara', 'Antoine'];
  const LN = ['Lacoste', 'Darrieux', 'Bernard', 'Martin', 'Dubois', 'Laffitte', 'Petit', 'Durand', 'Garcia', 'Moreau',
    'Lafon', 'Simon', 'Roux', 'Vincent', 'Fournier', 'Mercier', 'Blanc', 'Guérin', 'Boyer', 'Faure'];
  const ST = ['rue des Lilas', 'avenue Jean Jaurès', 'rue Victor Hugo', 'cours Gambetta', 'rue de la République',
    'allée des Tilleuls', 'rue Pasteur', 'chemin des Vignes', 'place du Marché', 'rue Nationale'];
  const CT = [['Bordeaux', '33000'], ['Mérignac', '33700'], ['Pessac', '33600'], ['Toulouse', '31000'], ['Nantes', '44000'],
    ['Lyon', '69003'], ['Lille', '59000'], ['Montpellier', '34000'], ['Rennes', '35000'], ['Pau', '64000'],
    ['Angoulême', '16000'], ['Limoges', '87000']];
  const nrm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const r = rng(1998);
  const CUSTOMERS = [], CM = {};
  FN.forEach((fn, i) => {
    const ln = LN[(i * 7 + 3) % LN.length], c = CT[(i * 5 + 2) % CT.length];
    const tel = '06 ' + [0, 0, 0, 0].map(() => pad(Math.floor(r() * 100), 2)).join(' ');
    const cu = { id: 'C' + pad(i + 1, 4), prenom: fn, nom: ln, email: `${nrm(fn)}.${nrm(ln)}@mail.example`, tel,
      adr: (1 + Math.floor(r() * 98)) + ' ' + ST[(i * 3) % ST.length], cp: c[1], ville: c[0],
      since: new Date(2020 + Math.floor(r() * 6), Math.floor(r() * 12), 1 + Math.floor(r() * 27)).getTime(),
      nb: 1 + Math.floor(r() * 9) };
    CUSTOMERS.push(cu); CM[cu.id] = cu;
  });
  return { CUSTOMERS, CM };
}
const _c = genClients();
export const CUSTOMERS = _c.CUSTOMERS;
export const CM = _c.CM;

/* ========================================================================== l'équipe ===== */

// Les personnes de l'entrepôt que l'élève croise dans la messagerie. Inventées.
export const EQUIPE = {
  cheffe: { nom: 'Nadia Ferrand', role: 'cheffe d’équipe stock', mail: 'n.ferrand@cdiscount.example' },
  retours: { nom: 'Service retours', mail: 'retours.cestas@cdiscount.example' },
  quai: { nom: 'Kevin Larrieu', role: 'cariste', mail: 'k.larrieu@cdiscount.example' },
  inventaire: { nom: 'Équipe inventaire', mail: 'inventaire.cestas@cdiscount.example' },
};

// Le message de bienvenue, le même pour toutes les séances : chaque séance est une journée à
// part, et l'élève y arrive comme un nouveau venu dans l'équipe stock.
export function mailBienvenue(prenom, ts) {
  return { folder: 'in', ts, from: `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`,
    fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: 'Bienvenue à l’entrepôt de Cestas', kind: 'text',
    text: `Bonjour ${prenom},\n\nBienvenue dans l'équipe stock de l'entrepôt Cdiscount de Cestas, en Gironde. Ici, on expédie chaque jour des milliers de petits colis de moins de 30 kg, commandés sur cdiscount.com.\n\nNotre travail : que le stock affiché dans le système soit le stock réel, celui qui est dans les rayons. Si le système se trompe, on vend des articles qu'on n'a plus, ou on rachète ce qu'on a déjà.\n\nVous aurez besoin de trois écrans :\n- Stock : les quantités par référence, et l'onglet Mouvements, qui garde la trace de tout ce qui est entré et sorti (le code d'accès vous est donné par votre enseignant) ;\n- Réceptions et Commandes : les documents qui ont fait bouger le stock ;\n- la Console, par exemple .movements suivi d'une référence, pour ne voir que les mouvements d'un article.\n\nBon courage,\n${EQUIPE.cheffe.nom}` };
}

// Des lignes de préparation FABRIQUÉES pour la liste « Lignes de préparation » de l'écran
// Extractions (04/10/2026, export filtré, brief `MOTEUR-export-filtre.md`) : des lignes À ÉCARTER
// — d'autres allées dans la période, ou la bonne allée AVANT la période demandée. Déterministes
// (graine fixe), sans écart (le stock trouvé est celui du logiciel) : elles n'existent que pour que
// le choix des critères compte. Même forme que `lignesPreparation`. `jours` : [min, max] avant
// `now` ; `numero` : premier numéro de bon (choisi hors des bons de la séance).
export function preparationsAEcarter(graine, { refs, jours, n, now, numero, preparateurs }) {
  const h = hasard(graine);
  const minuitDe = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const L = [];
  for (let k = 0; k < n; k++) {
    const sku = refs[h.entier(0, refs.length - 1)];
    const v = CATALOGUE.VM[sku];
    const ts = minuitDe(now) - h.entier(jours[0], jours[1]) * 864e5 + Math.round((8 + h.entier(0, 36) / 4) * 3600e3);
    const stock = h.entier(8, 60);
    L.push({ ts, bon: `BP-${numero + k}`, commande: `CMD-${numero + k}`, sku,
      designation: [v.model.brand, v.model.name].filter(Boolean).join(' '), emplacement: v.loc, qty: h.entier(1, 3),
      logiciel: stock, trouve: stock, preparateur: preparateurs[k % preparateurs.length] });
  }
  return L.sort((a, b) => a.ts - b.ts);
}
// Les références d'une ou plusieurs allées du catalogue.
export const refsAllees = (allees) => Object.keys(CATALOGUE.VM).filter((r) => allees.includes(CATALOGUE.VM[r].loc[0]));
// Le filtre « Allée » d'une liste de lignes de préparation (la lettre de l'emplacement).
export const filtreAllee = (juste) => ({ id: 'allee', libelle: 'Allée', valeur: (l) => String(l.Emplacement || '').slice(0, 1), tous: 'Toutes', juste });

// Les lignes des bons de préparation d'une base, comme les exporte le logiciel (geste tableur,
// 04/10/2026) : une ligne par article préparé, dans l'ordre du temps. « Stock logiciel » = le
// stock du système juste avant la sortie (lu sur le mouvement du bon) ; « Stock trouvé » = ce que
// le préparateur a noté au rayon (`seen`). Fonction PURE de la base : réexporter donne le même
// fichier. `filtre(o, sku)` : garder une commande / une référence (allée, emplacements…).
// Une commande annulée garde la ligne de son bon s'il a été préparé.
export function lignesPreparation(db, CAT, filtre = () => true) {
  const L = [];
  (db.orders || []).forEach((o) => {
    if (!o.prep || !o.prep.rows) return;
    const bon = 'BP-' + o.no.replace('CMD-', '');
    o.lines.forEach((l) => {
      if (!filtre(o, l.sku)) return;
      const m = (db.moves || []).find((x) => x.ref === bon && x.sku === l.sku);
      if (!m) return;
      const v = CAT.VM[l.sku];
      const row = o.prep.rows[l.sku] || {};
      L.push({ ts: m.ts, bon, commande: o.no, sku: l.sku, designation: v ? [v.model.brand, v.model.name].filter(Boolean).join(' ') : l.sku,
        emplacement: v ? v.loc : '', qty: l.qty, logiciel: m.after + l.qty, trouve: row.seen === '' || row.seen == null ? null : Number(row.seen),
        preparateur: m.by || o.prep.par || '' });
    });
  });
  return L.sort((a, b) => a.ts - b.ts || (a.bon < b.bon ? -1 : a.bon > b.bon ? 1 : 0) || (a.emplacement < b.emplacement ? -1 : 1));
}
