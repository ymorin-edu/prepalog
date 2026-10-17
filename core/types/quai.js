// Vue « quai de réception » — recevoir un camion sous contrainte de temps hors froid.
//
// Écrite le 03/10/2026 (chantier P1, brief `docs/briefs/MOTEUR-vue-quai.md`), d'après la
// maquette jouable v8 (`docs/briefs/picard/maquette-quai-picard.html`), qui FAIT FOI pour
// l'interaction : même déroulé, mêmes durées, mêmes textes. Le code de la maquette était
// jetable (un état global, un seul fichier) : ici on reprend le comportement, pas le code.
//
// Elle vit dans l'environnement d'entreprise (`entreprise.js`), comme l'inventaire et la
// tournée, et n'existe que si la séance déclare `quai`. Elle ne connaît AUCUNE entreprise :
// lieu, photos, camion, palettes, coûts des gestes et aides viennent de la déclaration ; les
// couleurs, du `THEME` de l'entreprise. Pilote : Picard (ENT-4.1 à 4.4).
//
// Quatre étapes, un écran par étape :
//   1. le camion arrive — BL et ticket de l'enregistreur (lu portes fermées : pas de temps hors
//      froid), puis « Oui, vous pouvez ouvrir et décharger » ;
//   2. le déchargement, animé sur la photo du quai : le temps hors froid du lot démarre à
//      l'ouverture de la porte, le chauffeur pose les palettes une à une ;
//   3. le contrôle de chaque palette — dessinée en 3D : faire le tour, sonder à cœur, lire
//      l'étiquette, compter, décider (accepter / réserves / refuser) et donner le motif ;
//   4. rentrer le lot accepté en chambre froide (le temps hors froid s'arrête), écrire les
//      réserves précises sur le BL, faire signer le chauffeur, clore.
//
// Deux temps : le TEMPS DU QUAI (simulé, chaque geste coûte des minutes) et le TEMPS HORS FROID
// du lot (un seul pour tout le lot : le transporteur décharge tout). En évaluation, un troisième,
// le TEMPS RÉEL passé : il MESURE, il ne coupe rien (décision de Tristan, 03/10/2026). Il est
// compté par l'environnement, quel que soit l'écran (`entreprise.js`), et rangé ici dans l'état.
//
// L'état vit dans la base de l'élève, sous `db.quais[<quai.id>]` : une séance, un quai.
// Les jalons et la note se lisent avec `jalonsQuai` / `noteQuai`, exportées : la séance les
// importe (`etapesQuai`) et l'écran les affiche au bilan — une seule lecture, pas deux.
//
// PLUSIEURS CAMIONS (03/10/2026, chantier P4, brief `docs/briefs/ENT-4.2-picard-deux-camions.md` §7).
// Quand `camions` en compte plus d'un :
//   - l'écran ① montre tous les camions (BL et ticket de chacun) ; une fois les tickets lus, l'élève
//     choisit le camion à décharger en premier ET une phrase de justification (`quai.ordre`) ;
//   - un seul quai : le suivant attend porte fermée, et ne se met à quai qu'une fois le précédent
//     reparti (BL signé), après une manœuvre (`quai.manoeuvre`, 3 min par défaut, construit) ;
//   - un camion qui attend peut se réchauffer (`rechauffeEnAttente`, °C par minute du temps du quai
//     écoulé avant SON ouverture) : la sonde lit la température réelle, et la décision attendue en
//     découle selon la règle du quai à trois zones (décision de Tristan, 03/10/2026) : −18 °C ou plus
//     froid, la décision déclarée ; entre `quai.seuilReserve` (−18) et `quai.seuilRefus` (−15) :
//     accepter avec réserves — température ; au-dessus de −15 °C : refuser — température ;
//   - un temps hors froid PAR CAMION : chaque lot démarre à l'ouverture de son camion et s'arrête
//     quand il entre en chambre froide ; les étapes ②③④ montrent le camion choisi.
// L'état du PREMIER camion déclaré reste à la racine de l'état (format d'ENT-4.1, inchangé : ses
// bases et ses tests restent valables) ; ceux des suivants vivent dans `suivants[i - 1]`.
// Une palette peut aussi porter plusieurs références (`refs`, une par groupe de couches : un
// comptage et une étiquette par référence) et une étiquette avant déchirée (`etiqAvant:
// 'dechiree'` : la vraie se lit sur la face arrière).
// PALETTE DE FÛTS (chantier D-4, étape 3 ; `rendu: 'iso'` seulement) : `forme: 'fut'` sur la palette (absent = cartons) donne un bac de
// rétention noir portant 8 fûts debout en quinconce 3-2-3, numérotés du fond (1-2-3) à l'avant (6-7-8), de gauche à droite. `manque: [numéros]`
// (places vides), `avarie: { numéro: face }` (une fuite, sur une face extérieure) ; le total (8), le réel et les avaries se calculent. Ni `W`,
// `D`, `L`, `refs`, `etiqAvant`, ni les aides de couches (`verifierQuai` les refuse), et le quai doit déclarer `unite` ; le brouillon de calcul est imposé.
//
// LA FICHE DE CONTRÔLE (04/10/2026, brief `docs/briefs/MOTEUR-quai-fiche-controle.md`, ergonomie arrêtée avec
// Tristan sur `docs/briefs/picard/essai-fiche-controle.html`). À l'étape ③, sous la palette, l'élève note ses
// constats (température à cœur, référence lue, cartons endommagés, cartons manquants) ; à l'étape ④, la fiche
// entière s'affiche à côté des réserves et il les y reporte. Toujours les quatre cases, rien de prérempli, rien
// de corrigé, aucun jalon, et noter ne coûte rien : s'il a mal noté, il recopie son erreur, c'est la réserve qui
// est jugée. Les notes vivent dans `palettes[id].fiche`. Le poste se valide par des boutons (décision, motifs à
// cocher) ; le comptage se note par Entrée ; « Valider » reste cliquable et dit sous la case ce qui manque.
//
// QUAI « DÉJÀ RÉCEPTIONNÉ » (03/10/2026, chantier P5, brief `docs/briefs/ENT-4.3-picard-reception-de-nuit.md` §7).
// `mode: 'controle'` : un collègue a reçu le camion, les palettes sont en chambre froide, l'élève contrôle
// son travail. Pas d'étapes ni d'horloge : deux onglets, « le dossier » (BL signé, ticket, fiche de comptage
// et de sonde, tout pris dans `dossier` du contenu, donc jamais modifiable : rien n'en est rangé dans la
// base) et « en chambre froide » (palette en 3D : faire le tour, re-sonder, relire l'étiquette, recompter ;
// les relevés de l'élève à côté de ceux du collègue, sans verdict). Deux temps, comme ENT-3.3 :
//   - temps 1 « Contrôler » : on regarde, on ne corrige rien (aucun bouton « Bloquer ») ;
//   - temps 2 « Corriger », ouvert par un message déclenché (`phaseQuai: 2` dans `volet.declencheurs`, voir
//     `entreprise.js`) : « Bloquer — qualité » / « Débloquer », puis « J'ai terminé » (deux clics, définitif)
//     qui fige tout et affiche le bilan.
// Un bouton « Messagerie » mène à l'environnement (le diagnostic et la protestation s'y écrivent). Les jalons
// de la vue : la (les) palette(s) à bloquer (`bloquer: true` dans le contenu) et « aucune palette conforme
// bloquée » ; la séance ajoute les siens (messages) par `jalonsDossier: { avant(db, e), apres(db, e) }`.
//
// QUAI SANS FROID (04/10/2026, lot 4 du brief `docs/briefs/MOTEUR-2de-S1.md`, 2de, Smoby). `froid: false` :
// marchandise sèche (des jouets), plus rien de ce qui tient au froid — ni ticket de l'enregistreur ni sa
// question, ni sonde, ni temps hors froid (jauge, afficheur, brume), ni chambre froide, ni note de rapidité
// sur le froid, ni motif « température » ; une décision juste ne demande plus d'avoir sondé. L'étape ④
// rentre les palettes en `zone` (« Zone de réception » par défaut, `zone: { nom }`). `motifs: ['avarie',
// 'manquant']` restreint la liste des motifs proposés (toutes les séances peuvent s'en servir).
// `dechargement: { par: 'cariste', nom: 'Yanis' }` : un chariot élévateur frontal conduit par une
// silhouette sans visage sort les palettes, au lieu du chauffeur au transpalette (légende « Yanis sort la
// palette P2 au chariot »). Un seul camion dans ce mode (plusieurs camions : l'ordre se décide sur les
// tickets, donc sur le froid).
// Avec `rendu: 'iso'` (D-4, étape 5) le chariot est dessiné à l'échelle du quai (voir `planChariot`) : il entre par l'ouverture,
// prend la palette de tête sur ses fourches et la pose à sa place ; les palettes sortent dans l'ordre inverse du chargement ;
// le chauffeur du camion reste debout près de l'accueil. Sans `par: 'cariste'`, le chauffeur tire la palette au transpalette.
//
// DÉCOR FIXE (04/10/2026, ENT-5.4). `photos: { quai, decor: 'fixe', porte, cadre, places, horloge }` : la
// photo du quai est prise porte ouverte, remorque visible. Rien ne s'anime dessus : le chariot sort de
// l'ouverture (`porte`) et pose les palettes sur une dalle dessinée sous la photo (le `cadre` descend
// plus bas que la photo ; `places` dans cette bande). Sans `decor`, la porte se lève comme chez Picard.
//
// SÉCURITÉ AVANT DÉCHARGEMENT (04/10/2026, lot 5). `securite: { scene, points: [{ id, lib, ok }], signaler:
// { bouton, reponse, rien }, arret, commencer, photo }` ajoute une étape ⓪ « Avant de décharger » : une
// scène de trois lignes, chaque point jugé « OK » / « Pas OK », deux boutons « Signaler au chef de quai »
// et « Commencer à décharger ». Les étapes suivantes restent fermées tant que l'élève n'a pas commencé.
// Commencer alors qu'un point faux n'a pas été signalé : en guidage, le chef de quai l'arrête (sans dire
// lequel) et l'élève peut corriger ; en évaluation, rien ne l'arrête. Jalons : `securiteSignalee` (tous
// les points faux signalés AVANT la première tentative de décharger) et `securiteConstat` (chaque point
// jugé, aucun « OK » sur un point faux, aucun « Pas OK » sur un point juste). La liste `points` ne dépend
// pas de l'affichage : la même étape pourra se jouer sur une image à inspecter.
//
// `recommencer: false` (07/10/2026, lot 2 de SMOBY-notation, choix de Tristan) : pas de « Recommencer la réception »
// au bilan (il n'apparaît qu'après la signature) ; le bilan dit à la place que le BL ne se corrige plus. Pour une
// séance notée au premier bilan : refaire le quai après la signature ne doit pas changer ce bilan.
//
// `rendCopie: false` (17/10/2026, trouvé en construisant ENT-8.10, à l'image du Planning) : en évaluation (`copie`), la clôture
// ne rend pas la copie ; le bouton s'appelle « Clore la réception » (deux clics, comme en copie) et d'autres écrans de la séance
// peuvent suivre le quai (un compte rendu après la signature) : la copie se rend plus tard, par un autre écran. Seule valeur
// acceptée : false. Sans cette option, rien ne change.
//
// RENDU 2D ISO (06/10/2026, brief `docs/briefs/ENT-1.1-spartoo-quai.md` §7.8, maquette validée par Tristan :
// `docs/briefs/spartoo/maquette-quai-spartoo-iso.html`). `rendu: 'iso'` remplace les photos et la palette 3D
// par le kit iso (`core/iso.js`) : ① la façade, le camion porteur qui recule à la porte, le chauffeur et sa
// bulle, puis le BL ; ② la porte sectionnelle qui se lève, le chauffeur qui sort la palette au transpalette
// manuel jusqu'à la zone de réception (ce qui est dans la remorque ne se voit que par l'ouverture) ; ③ la
// palette en grand, « ⟲ Tourner / Tourner ⟳ », chaque carton cliquable (son étiquette : n° « x / 12 », réf.,
// lot) ; ④ la palette en zone de réception. Les outils (comptage, fiche, décision, réserves) et les jalons ne
// changent pas (choix de Tristan, 06/10). Le chauffeur pose la palette EN zone de réception : à l'étape ④ il
// n'y a donc rien à « rentrer », la palette y reste quand le chauffeur a signé (comme la maquette). Quai sans
// froid, un seul camion. Le BL peut porter un en-tête (`commande`, `lot`, `expedie` : une date, ou un nombre
// de jours par rapport à aujourd'hui, −1 = la veille) et une colonne « par carton » (`parCarton` des `refs`).
//
// INSPECTION SUR LA SCÈNE (10/10/2026, chantier D-4 étape 2, brief `docs/briefs/MOTEUR-quai-inspection.md` §2). `rendu: 'iso'` +
// `securite: { mode: 'scene', points: [{ id, objet, etat, ok, lib, repare }], arret, consigne, signaler: { qui, rien, fin, vide },
// commencer, bilan }` : l'élève inspecte le quai où il va décharger (cabine, cale, butoirs, niveleur, lampe), à la souris : un clic
// pose une marque numérotée, « Signaler à … » envoie les marques, le chef de quai répond et chaque défaut touché est réparé dans la
// scène ; « C'est bon, on peut décharger » (deux clics) fige l'inspection. Le contenu est validé par `verifierQuai` (au chargement) ;
// l'état de chaque objet (`etatsScene`), les zones (`zonesScene`) et le point touché (`pointTouche`) sont des fonctions pures ;
// les jalons `securite-<id>` et `securite-aucun-faux` se calculent depuis les signaux. Sans `mode`, l'étape ⓪ en liste (lot 5).
//
// UN QUAI EN DEUX SÉANCES (17/10/2026, chantier « quai en deux séances », lot 1, brief `docs/briefs/ENT-8.7-action-decharger.md` §7.1).
// Trois options de la déclaration, qui ne changent RIEN pour une séance qui ne les déclare pas :
//   - `arret: 'dechargement'` (ou `{ etape: 'dechargement', texte }`) : le quai s'arrête quand la dernière palette est posée. Pas d'étapes ③ ④ (ni
//     stepper, ni `aller`, ni écran), un bandeau de fin (`texte`) à la place des boutons, l'état est figé (`e.fini`, comme « Clore ») et le geste
//     `quai:<id>:dechargement` part UNE fois (drapeau `e.dechargeFini`, rangé : un rechargement ne le renvoie pas). Les jalons ne portent que les
//     étapes jouées (ordre, sécurité, ticket). Déclencheur : `quaiDecharge('<id>')` (`core/declencheurs.js`).
//   - `commence: 'controle'` : la vue s'ouvre à l'étape ③, déchargement DÉJÀ fait (palettes en zone de réception, BL en main, chauffeur debout) ;
//     l'état est construit par `etatNeuf`, sans journal ni minutes (l'heure du quai est celle de `debut`, sinon l'arrivée du camion). Pas d'étapes
//     ⓪ ① ② ; jalons : ni `ordre`, ni `securite-*`, ni `ticket`. (Le nom `debut` est pris : c'est l'heure de début du quai.)
//   - `document: 'Bon de livraison — lettre de voiture'` : le nom du document de transport dans les titres de l'écran (défaut : « Bon de livraison »).
// Ces options demandent UN seul camion (le suivant ne se met à quai qu'une fois le BL du précédent signé) ; `commence` demande un quai sans froid
// (un lot déchargé avant l'ouverture n'a pas de temps hors froid à mesurer) ; `arret` et `commence` s'excluent, et refusent `mode: 'controle'`.
//
// LA DÉPOSE DIRIGÉE PAR L'ÉLÈVE (17/10/2026, même chantier, lot 2, feuille `docs/briefs/MOTEUR-depose-dirigee.md`). `depose: { passage, grise,
// cases }` (iso, au chariot frontal) : à l'étape ②, le cariste attend à la sortie du camion avec chaque palette et l'élève clique la case où il
// la pose (guidage : un piège fait réagir le cariste et se grise ; copie : le premier clic pose). État `depose`, geste `quai:<id>:depose`, jalons
// `depose-<palette>` (groupe « Diriger le déchargement »). Format, état et fonctions : section « la dépose dirigée par l'élève » plus bas.

// Pas d'import de `ui.js` : le corrigé d'une séance (`contenus/corriges/`) importe ce module, et la
// suite de tests charge les corrigés hors du navigateur.
import { evaluerGrille, afficher, estFormule } from '../formules.js';
import { projection, facadeQuai, X_PORTE_FACADE, camionPorteur, personne, HAUT_PERSONNE, bulle, horlogeQuai,
  solQuai, niveleur, remorqueInterieur, murQuai, ouvertureQuai, transpaletteManuel, paletteCartons, dimsPalette,
  faceVisible, facesExterieures, lampeQuai, boitesCamion, boitesButoirs, boitesNiveleur, boitesLampe, boiteEcran,
  paletteFuts, facesExterieuresFut, COTE_BAC, dessinerChariotFrontal, DEFS as DEFS_ISO } from '../iso.js';
import { ech } from '../texte.js';
import { retrouverFocus, secondClic } from '../gestes.js';


/* ================================================================== libellés */
export const MOTIFS = {
  aucun: 'aucun motif', temperature: 'Température non conforme', avarie: 'Cartons endommagés',
  manquant: 'Manquant', produit: 'Produit différent de la commande',
};
// L'UNITÉ de ce qu'on compte et de ce qu'on abîme (D-4, étape 4) : `unite: 'fûts'` (le pluriel en -s, le singulier se déduit) ou
// `{ un, des }` ; absente : les cartons. Elle est lue PARTOUT dans les textes du quai (champ chiffré, fiche, BL, comptage, réserves,
// journal, jalons, aides, zoom) : `R.u` est posée par `reglages`. Elle doit être MASCULINE (« endommagés », « manquants »).
export const UNITE_DEFAUT = { un: 'carton', des: 'cartons' };
const texteNet = (t) => (typeof t === 'string' ? t.trim() : '');
export function uniteQuai(Q) {
  const u = Q && Q.unite;
  if (typeof u === 'string') { const t = texteNet(u); return t.length > 1 && t.endsWith('s') ? { un: t.slice(0, -1), des: t } : UNITE_DEFAUT; }
  if (u && typeof u === 'object' && !Array.isArray(u) && texteNet(u.un) && texteNet(u.des)) return { un: texteNet(u.un), des: texteNet(u.des) };
  return UNITE_DEFAUT;
}
const maj = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);
// « ce carton », « cet œuf » : le démonstratif de l'unité.
const ceUnite = (u) => (/^[aeiouyhéèêâîôûœ]/i.test(u.un) ? 'cet' : 'ce');
// Les libellés des motifs de réserve de CE quai : ceux d'aujourd'hui (`MOTIFS`), l'unité dans « endommagés », et les noms que la
// séance déclare (`libelles: { avarie: { nom } }`, idem `manquant` et `produit`).
export function libellesMotifs(Q) {
  const u = uniteQuai(Q), L = (Q && Q.libelles && typeof Q.libelles === 'object' && Q.libelles) || {};
  const nom = (m, defaut) => texteNet(L[m] && L[m].nom) || defaut;
  return Object.assign({}, MOTIFS, {
    avarie: nom('avarie', `${maj(u.des)} endommagés`), manquant: nom('manquant', MOTIFS.manquant), produit: nom('produit', MOTIFS.produit) });
}
// Ce que la réserve ajoute entre parenthèses derrière « endommagé(s) » : la précision déclarée, ou « écrasé(s) » accordé (null).
const precisionAvarie = (Q) => texteNet(Q && Q.libelles && Q.libelles.avarie && Q.libelles.avarie.precision) || null;
export const DECISIONS = { '': '— à décider —', accepter: 'Accepter', reserves: 'Accepter avec réserves', refuser: 'Refuser' };
const VUES = ['vue de l’avant', 'vue du côté droit', 'vue de l’arrière', 'vue du côté gauche'];
const QCM_TICKET = [
  { v: 'rien', lib: 'Rien à signaler, la température est restée stable', court: 'rien à signaler' },
  { v: 'bref', lib: 'Un pic très bref, sans conséquence', court: 'pic bref' },
  { v: 'long', lib: 'Une remontée qui a duré : je la signale et je sonde chaque palette à cœur', court: 'remontée qui a duré' },
];
// Les quatre constats de la fiche de contrôle, dans l'ordre des cases.
const constats = (u) => [
  { k: 'temp', lib: 'Température à cœur', court: 'Temp. à cœur (°C)', unite: '°C' },
  { k: 'ref', lib: 'Référence lue sur l’étiquette', court: 'Réf. lue', unite: '' },
  { k: 'endo', lib: `${maj(u.des)} endommagés`, court: 'Endommagés', unite: u.des, mode: 'numeric' },
  { k: 'manq', lib: `${maj(u.des)} manquants`, court: 'Manquants', unite: u.des, mode: 'numeric' },
];
const ficheNeuve = () => ({ temp: '', ref: '', endo: '', manq: '' });
const CHOIX_DEC = ['accepter', 'reserves', 'refuser'];
const ETAPES = ['① Le camion arrive', '② Déchargement', '③ Contrôle des palettes', '④ Réserves et chambre froide'];
const ETAPES_ISO = ['① Le camion arrive', '② Déchargement', '③ Compter la palette', '④ Réserves et signature'];
const ETAPE_SECU = '⓪ Avant de décharger';
const PLACES_FUTS = 8;   // une palette de fûts a toujours huit places (quinconce 3-2-3)
const COUTS_DEFAUT = { ticket: 2, sonder: 1, tourner: 0.5, etiquette: 0.5, compter: 1, rentrer: 3, ligne: 1, signer: 1 };

/* ==================================================================== formats */
const fmtMin = (m) => { const e = Math.floor(m), s = m - e >= 0.5; if (!e && s) return '30 s'; return s ? `${e} min 30` : `${e} min`; };
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const v1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
const virgule = (n) => String(n).replace('.', ',');
const fmtT = (v) => `${String(v).replace('.', ',').replace('-', '−')} °C`;
const minutesDe = (hm) => { const [h, m] = String(hm || '06:00').split(':').map(Number); return h * 60 + (m || 0); };
const palier = (v, paliers) => { for (const [seuil, pts] of paliers) if (v <= seuil) return pts; return 0; };
// Ce que l'élève tape : « −14,2 », « -14.2 », « 2 ». Vide ou autre chose → NaN.
const nombre = (brut) => {
  const t = String(brut == null ? '' : brut).trim().replace(/\s/g, '').replace(/[−–]/g, '-').replace(',', '.');
  return t === '' || !/^[+-]?\d+(\.\d+)?$/.test(t) ? NaN : Number(t);
};

// Ce que la mini-feuille de calcul dit du détail du comptage (ligne « détail » du bilan en guidage, non
// comptée) : B1 cartons par couche, B2 couches, B3 manquants. La feuille elle-même n'est jamais notée.
const detailDeFeuille = (s) => {
  const v = evaluerGrille((s && s.calcul) || {}).valeurs;
  const t = (ref) => (v[ref] == null ? '' : String(v[ref]));
  return { dCouche: t('B1'), dCouches: t('B2'), dManque: t('B3') };
};

/* =================================================================== réglages */
// La déclaration de la séance, complétée de ses valeurs par défaut, et les palettes de tous les
// camions mises à plat (chacune garde le numéro de son camion). Les valeurs attendues sont
// CALCULÉES depuis la palette, jamais recopiées : cartons réels, manquants, avaries.
function reglages(Q) {
  const camions = (Q.camions || []).map((c, ci) => Object.assign({}, c, {
    // Le camion porte le nom de son fournisseur à l'écran (« camion Glaces Néviane ») ; la lettre ne sert
    // qu'aux identifiants (jalons, attributs).
    lettre: c.lettre || String.fromCharCode(65 + ci), nom: c.nom || c.fournisseur || c.lettre || String.fromCharCode(65 + ci), rechauffe: Number(c.rechauffeEnAttente) || 0 }));
  const palettes = [];
  camions.forEach((c, ci) => (c.palettes || []).forEach((p) => {
    const manque = p.manque || [], avarie = p.avarie || {};
    // Palette de fûts (`forme: 'fut'`, D-4 étape 3) : huit places, toujours ; les manques sont des NUMÉROS de place.
    const reel = p.forme === 'fut' ? PLACES_FUTS - manque.length : p.W * p.D * p.L - manque.length;
    const plus = {};
    // Palette multi-références : chaque référence occupe des couches entières ; ses cartons réels
    // sont CALCULÉS (couches × cartons par couche − ceux qui manquent dans ces couches).
    if (Array.isArray(p.refs) && p.refs.length) {
      plus.refs = p.refs.map((r) => Object.assign({}, r, {
        reel: r.couches.length * p.W * p.D - manque.filter((m) => r.couches.includes(+m.split(',')[2])).length }));
      plus.ref = plus.refs.map((r) => r.ref).join(' + ');
      plus.nom = plus.refs.map((r) => r.nom).join(' / ');
      plus.bl = plus.refs.reduce((t, r) => t + r.bl, 0);
      plus.etiq = plus.refs[0].etiq;
    }
    const bl = plus.bl != null ? plus.bl : p.bl;
    palettes.push(Object.assign({}, p, plus, { camion: ci, manque, avarie, reel,
      avaries: Object.keys(avarie).length, manquants: bl - reel }));
  }));
  const aides = Object.assign({ regleCouches: false, detailComptage: false, repere: false, chefDeQuai: false, consignes: false }, Q.aides || {});
  const froid = Q.froid !== false;
  // Les motifs proposés : tous, ou ceux que la séance déclare ; jamais « température » sans froid.
  const motifs = Object.keys(MOTIFS).filter((m) => m === 'aucun' || ((!Q.motifs || Q.motifs.includes(m)) && (froid || m !== 'temperature')));
  const S = Q.securite && Array.isArray(Q.securite.points) && Q.securite.points.length ? Q.securite : null;
  return {
    froid, motifs, securite: S, scene: !!(S && S.mode === 'scene'), iso: Q.rendu === 'iso', escalier: Q.escalierAccueil === true,
    // L'unité (« carton(s) », « fût(s) »…), les noms des motifs et la précision de l'avarie (D-4, étape 4) : sans rien déclarer,
    // les textes d'aujourd'hui.
    u: uniteQuai(Q), lib: libellesMotifs(Q), precis: precisionAvarie(Q),
    zone: Object.assign({ nom: 'Zone de réception' }, Q.zone || {}),
    lieu: Object.assign({ nom: 'Quai', temp: 4, refrigere: true, chambre: { nom: 'Chambre froide', temp: -23 } }, Q.lieu || {}),
    seuil: Q.seuilHorsFroid || 30,
    seuilRefus: Q.seuilRefus != null ? Q.seuilRefus : -15,
    seuilReserve: Q.seuilReserve != null ? Q.seuilReserve : -18,
    manoeuvre: Q.manoeuvre != null ? Q.manoeuvre : 3,
    D: Object.assign({ ouverture: 0.5, parPalette: 1, par: 'chauffeur' }, Q.dechargement || {}),
    couts: Object.assign({}, COUTS_DEFAUT, Q.couts || {}),
    aides, camions, palettes, multi: camions.length > 1,
    controle: Q.mode === 'controle', dossier: Q.dossier || {},
    // Un second motif proposé pour CHAQUE palette (ENT-4.4 : une palette porte deux problèmes) : la
    // liste ne dit donc pas laquelle. Absent : l'écran d'ENT-4.1 à 4.3, un seul motif.
    deuxMotifs: !!Q.deuxMotifs,
    // La zone de calcul de l'étape ③ : `{ forme: 'feuille' | 'brouillon', rappel }` (absente : pas de zone).
    calcul: Q.calcul && Q.calcul.forme ? { forme: Q.calcul.forme === 'brouillon' ? 'brouillon' : 'feuille', rappel: !!Q.calcul.rappel } : null,
    depart: minutesDe(Q.debut || (camions[0] && camions[0].arrivee)),
    // Un quai en deux séances (lot 1) : la fin après le déchargement (`{ texte }` ou null), le départ au contrôle, le nom du document.
    arretDech: arretDechargement(Q), commence: Q.commence === 'controle', document: texteNet(Q.document) || DOCUMENT_DEFAUT,
    // La dépose dirigée (lot 2) : les cases complétées, le passage et la règle de grisage ; null sans `depose` (ou si elle est mal
    // formée : c'est `verifierQuai` qui la refuse en clair).
    depose: deposeDe(Q),
  };
}
function deposeDe(Q) {
  const D = Q && Q.depose;
  if (!D || typeof D !== 'object' || !Array.isArray(D.cases) || !D.cases.length || !D.cases.every((c) => c && typeof c === 'object')) return null;
  return { cases: normaliserCases(D), passage: Number.isInteger(D.passage) ? D.passage : Math.floor(D.cases.length / 2), grise: D.grise === 'palette' ? 'palette' : 'garde' };
}
// `arret: 'dechargement'` ou `arret: { etape: 'dechargement', texte }` : le texte du bandeau de fin (défaut : les palettes sont en zone). Une valeur
// fautive rend null ici ; c'est `verifierQuai` qui la refuse en clair.
const DOCUMENT_DEFAUT = 'Bon de livraison';
const TEXTE_ARRET_DEFAUT = 'Les palettes sont en zone de réception.';
function arretDechargement(Q) {
  const a = Q && Q.arret;
  if (a === 'dechargement') return { texte: TEXTE_ARRET_DEFAUT };
  if (a && typeof a === 'object' && !Array.isArray(a) && a.etape === 'dechargement') return { texte: texteNet(a.texte) || TEXTE_ARRET_DEFAUT };
  return null;
}
// L'état propre à un camion : à la racine pour le premier, dans `suivants` pour les autres.
const camionNeuf = () => ({ ticketLu: false, ticketRep: null, decharge: false, evts: 0, froid: 0, ouvertA: null,
  rentre: false, heureRentre: null, ecrit: false, lignes: [], deballage: false, mentionEcrite: false, signe: false,
  chefVu: false, passeOutreChef: false, ordreFroidDabord: null, paroleChauffeur: '' });
const K = (e, ci) => (!ci ? e : ((e.suivants || [])[ci - 1] || camionNeuf()));
const unDecharge = (e, R) => R.camions.some((_, ci) => K(e, ci).decharge);
// La température à cœur RÉELLE d'une palette : celle de la déclaration, plus le réchauffement de
// son camion pendant le temps du quai écoulé avant l'ouverture (porte fermée, groupe froid faible).
function tempReelle(p, e, R) {
  const c = R.camions[p.camion];
  if (!c || !c.rechauffe) return p.temp;
  const k = K(e, p.camion);
  const att = Math.max(0, (k.ouvertA != null ? k.ouvertA : (e.minute || 0)) - Math.max(0, minutesDe(c.arrivee) - R.depart));
  return Math.round((p.temp + c.rechauffe * att) * 10) / 10;
}
// La palette telle qu'elle est dans CETTE réception : température réelle, et décision attendue
// recalculée pour un camion qui s'est réchauffé, selon la règle à trois zones (−18 / −15 °C).
function effective(p, e, R) {
  const temp = tempReelle(p, e, R);
  if (R.camions[p.camion].rechauffe && temp > R.seuilRefus) return Object.assign({}, p, { temp, attendu: 'refuser', motifAttendu: 'temperature', motif2Attendu: undefined });
  if (R.camions[p.camion].rechauffe && temp > R.seuilReserve) return Object.assign({}, p, { temp, attendu: 'reserves', motifAttendu: 'temperature', motif2Attendu: undefined });
  return temp === p.temp ? p : Object.assign({}, p, { temp });
}
export const dureeDechargement = (n, D) => D.ouverture + n * D.parPalette;

/* ============================================ inspection sur la scène (chantier D-4, étape 2) */
// `securite.mode: 'scene'` : l'élève inspecte le quai iso où il va décharger (brief `docs/briefs/MOTEUR-quai-inspection.md`
// §2). Ce bloc ne contient que des fonctions PURES (aucun accès au navigateur) : la validation du contenu, l'état de
// chaque objet de la scène, les zones où l'on clique et le point touché par un clic. La vue (`creerQuai`) les assemble.

// Les cinq objets que la scène sait inspecter : la vue où on le voit, ses états, l'état SÛR (celui qu'un signalement
// ou « C'est bon » lui rend), et l'état dessiné quand la séance ne le déclare pas (`null` = pas dessiné : la cale et la
// lampe n'existent que si une séance les demande, pour qu'ENT-1.1 ne change pas d'un pixel).
export const OBJETS_SCENE = {
  cabine: { vue: 'dehors', etats: ['conduite', 'vide'], sur: 'vide', defaut: 'vide' },
  cale: { vue: 'dehors', etats: ['posee', 'absente'], sur: 'posee', defaut: null },
  butoirs: { vue: 'dehors', etats: ['enPlace', 'absents'], sur: 'enPlace', defaut: 'enPlace' },
  niveleur: { vue: 'dedans', etats: ['pose', 'releve'], sur: 'pose', defaut: 'pose' },
  lampe: { vue: 'dedans', etats: ['allumee', 'eteinte'], sur: 'allumee', defaut: null },
};
// Les deux vues : les projections et les cadres de la scène d'arrivée (« dehors ») et de l'intérieur (« dedans »), ceux
// d'ENT-1.1 ; le camion est à la porte du milieu de la façade, reculé jusqu'au bout.
export const VUES_SCENE = {
  dehors: { unite: 54, origine: [330, 150], viewBox: [70, -30, 800, 520] },
  dedans: { unite: 60, origine: [470, 235], viewBox: [290, 0, 640, 480] },
};
const PORTE_CAMION = 1, YR_QUAI = 0.35, MARGE_ZONE = 12;
const PAROLE_ARRET = 'Stop ! Avant d’entrer dans la remorque, tout doit être en sécurité. Regarde encore la scène et signale ce qui ne va pas.';

/* ================================================== le chariot frontal du quai iso (D-4, étape 5) */
// `dechargement.par: 'cariste'` + `rendu: 'iso'` : c'est un chariot frontal, conduit par un cariste sans visage, qui entre dans la
// remorque par l'ouverture, prend la palette de tête sur ses fourches et la pose à sa place d'arrivée, à la place du chauffeur au
// transpalette. Le dessin est celui de la scène animation (`dessinerChariotFrontal`), mis à l'échelle du quai : mètres, projection `I2`.
//
// LE TRAJET. Le chariot est de face au mur (fourches vers la remorque) et il ne se retourne pas : il recule pour sortir, glisse de côté,
// recule encore jusqu'à la place, pose, puis revient À VIDE par le passage libre à gauche de la zone de réception (l'allée) avant de
// se représenter à la porte. Pour que son corps (derrière sa charge) ne se retrouve jamais dans une palette déjà posée, les palettes
// sortent dans l'ordre inverse du chargement : la dernière chargée est la plus près de la porte, donc la première sortie
// (P4, P3, P2, P1 pour quatre palettes) ; la rangée près du mur est ainsi remplie avant la rangée du fond, et les places d'arrivée
// sont exactement celles d'aujourd'hui. Fonction pure : testée sans navigateur.
export const CHARIOT_QUAI = {
  K: 0.85,                 // le chariot de la scène animation (1 m de large, 2,15 m de long), à l'échelle d'un décor où l'ouverture fait 1,2 m
  LEV: 0.2,                // la hauteur des fourches en charge (m)
  DEMI: 0.45,              // demi-largeur du chariot pour les collisions (m)
  V: { avance: 4.42, crabe: 3.12, recule: 3.25, crabeCharge: 2.47, leve: 308 },   // m/s ; durée de la levée ou de la descente des fourches (ms) ; l'ancien rythme × 1,3 (10/10/2026)
};
const CHQ_FL = 1.02 * CHARIOT_QUAI.K, CHQ_BL = 2.15 * CHARIOT_QUAI.K;   // fourches, longueur totale
export const CHARIOT_FL = CHQ_FL, CHARIOT_BL = CHQ_BL;
const chqRect = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });
const chqCoupe = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;
// Ce que le chariot (et sa palette s'il en porte une) occupe au sol, à la position (cx, yc) : cx = milieu, yc = bout des fourches.
function chqEmprise(cx, yc, charge) {
  const d = CHARIOT_QUAI.DEMI;
  let x0 = cx - d, x1 = cx + d, y0 = yc;
  if (charge) { x0 = Math.min(x0, cx - charge[0] / 2); x1 = Math.max(x1, cx + charge[0] / 2); y0 = Math.min(y0, yc + CHQ_FL - charge[1]); }
  return chqRect(x0, y0, x1, yc + CHQ_BL);
}
// Le rectangle balayé par un déplacement en ligne droite (deux positions, mêmes bornes).
const chqBalaye = (a, b, charge) => { const r = chqEmprise(a[0], a[1], charge), s = chqEmprise(b[0], b[1], charge); return chqRect(Math.min(r.x0, s.x0), Math.min(r.y0, s.y0), Math.max(r.x1, s.x1), Math.max(r.y1, s.y1)); };
// `gab` : [[largeur, profondeur]] de chaque palette (dans l'ordre du camion) ; `places` : [[x, y]] de chaque place d'arrivée (coin avant-gauche) ;
// `xPorte` : le milieu de l'ouverture ; `ySlot` : le y de la palette de tête dans la remorque ; `t0` : l'instant où le chariot part.
// Rend { ordre, legs, tLift, tC, tPose, fin, cxGare, yGare, cxPorte } ; chaque `leg` = { t0, t1, a: [cx, yc, lev], b: [cx, yc, lev] }.
export function planChariot({ gab, places, xPorte, ySlot, t0 = 0 }) {
  const { K, LEV, V } = CHARIOT_QUAI, N = gab.length;
  const ordre = gab.map((_, n) => N - 1 - n);
  const gmax = Math.max(...gab.map((g) => g[0]), 2 * CHARIOT_QUAI.DEMI);
  const cxGare = Math.min(...places.map((p) => p[0])) - 0.25 - 0.08 - gmax / 2;
  // Où il attend, au bout de l'allée de gauche : le bout des fourches juste devant le mur, assez près pour que son corps ne touche pas la première rangée de places.
  const Y_GARE = Math.max(0.1, Math.min(0.5, Math.min(...places.map((p) => p[1])) - CHQ_BL - 0.06));
  const legs = [], tLift = [], tC = [], tPose = [];
  let t = t0, pos = [cxGare, Y_GARE, 0];
  legs.push({ t0: 0, t1: t0, a: pos.slice(), b: pos.slice() });
  const aller = (cx, yc, lev, vitesse) => {
    const b = [cx == null ? pos[0] : cx, yc == null ? pos[1] : yc, lev == null ? pos[2] : lev];
    const d = lev != null && lev !== pos[2] ? V.leve : Math.max(250, 1000 * Math.hypot(b[0] - pos[0], b[1] - pos[1]) / vitesse);
    legs.push({ t0: t, t1: t + d, a: pos.slice(), b }); t += d; pos = b;
  };
  const posees = [];
  ordre.forEach((n, u) => {
    const [gw, gd] = gab[n], [xL, yL] = places[n], charge = [gw, gd], cxL = xL + gw / 2;
    // 1. à vide : de l'allée à la porte, puis dans la remorque jusqu'à la palette de tête
    aller(xPorte, null, null, V.crabe);
    aller(null, ySlot + gd - CHQ_FL, null, V.avance);
    // 2. il la lève et la sort en reculant
    tLift[u] = t; aller(null, null, LEV);
    tC[u] = t;
    const ycG = 0.12 + Math.max(0, gd - CHQ_FL), ycT = yL + gd - CHQ_FL;
    aller(null, ycG, null, V.recule);
    // 3. la voie vers la place : tout droit si rien ne gêne, sinon par l'allée de gauche
    const libre = (cxT) => {
      const trajets = [chqBalaye([xPorte, ycG], [cxT, ycG], charge), chqBalaye([cxT, ycG], [cxT, ycT], charge), chqBalaye([cxT, ycT], [cxL, ycT], charge)];
      return trajets.every((r) => posees.every((p) => !chqCoupe(r, p)));
    };
    const cxT = [cxL, cxGare].find(libre);
    const lane = cxT == null ? cxL : cxT;
    if (Math.abs(lane - xPorte) > 1e-6) aller(lane, null, null, V.crabeCharge);
    aller(null, ycT, null, V.recule);
    if (Math.abs(lane - cxL) > 1e-6) aller(cxL, null, null, V.crabeCharge);
    // 4. il pose, dégage ses fourches, puis rentre à vide par l'allée de gauche
    aller(null, null, 0); tPose[u] = t;
    posees.push(chqRect(xL, yL, xL + gw, yL + gd));
    aller(null, yL + gd + 0.06, null, V.avance);
    let yR = pos[1];
    for (let k = 0; k < 60; k++) {
      const r = chqBalaye([cxL, yR], [cxGare, yR], null);
      if (posees.every((p) => !chqCoupe(r, p))) break;
      yR += 0.1;
    }
    if (yR > pos[1]) aller(null, yR, null, V.avance);
    aller(cxGare, null, null, V.crabe);
    aller(null, Y_GARE, null, V.avance);
  });
  return { ordre, legs, tLift, tC, tPose, fin: t, cxGare, yGare: Y_GARE, cxPorte: xPorte };
}
// Où est le chariot à l'instant t, et quelle palette (rang dans l'ordre de sortie) porte-t-il.
export function etatChariot(plan, t) {
  let leg = plan.legs[plan.legs.length - 1];
  for (const l of plan.legs) if (t < l.t1) { leg = l; break; }
  const f = leg.t1 > leg.t0 ? Math.min(1, Math.max(0, (t - leg.t0) / (leg.t1 - leg.t0))) : 1;
  const m = (a, b) => a + (b - a) * f;
  const rang = plan.tLift.findIndex((tl, i) => t >= tl && t < plan.tPose[i]);
  return { cx: m(leg.a[0], leg.b[0]), yc: m(leg.a[1], leg.b[1]), lev: m(leg.a[2], leg.b[2]), porte: rang < 0 ? null : rang };
}

/* ======================================== la dépose dirigée par l'élève (chantier E-5, lot 2) */
// Feuille de coordination `docs/briefs/MOTEUR-depose-dirigee.md` (décisions fixées le 17/10/2026), maquette validée par Tristan :
// `outils/essai-depose.{html,js,css}` (variante A, pièges non peints). Quand le quai déclare `depose` (iso, au chariot frontal),
// le cariste sort chaque palette du camion et ATTEND à la sortie du camion, palette sur les fourches ; les cases libres s'éclairent
// et l'élève clique celle où il la pose. Guidage : une case piège fait réagir le cariste (bulle) et se grise jusqu'à la fin, l'élève
// rechoisit. Évaluation (`copie`) : le premier clic pose, sans réaction ni grisage. Les jalons lisent le PREMIER clic.
//
// Déclaration : `depose: { passage?, grise?, cases: [{ id, sol?, legende?, nom?, reaction?, juste?, peinte? }] }`.
//   - `cases` : 8 au plus, sur UNE ligne devant le mur ; `passage` = combien sont à gauche de la porte (défaut : la moitié) ;
//   - `sol: 'pieton'` (l'allée piétonne) ou `'autre-quai'` (devant le quai voisin, `legende` obligatoire : « Quai 3 ») : un piège ;
//     sans `sol`, une case de la zone de réception, juste par défaut (`juste: false` y demande une `reaction`) ;
//   - `peinte: false` (un piège seulement) : ni contour ni nom au sol, la case ne s'éclaire que pendant le choix ;
//   - `grise` : 'garde' (défaut, une case piège reste grisée jusqu'à la fin) ou 'palette' (grisée pour la palette en cours seulement).
// État : `db.quais[<id>].depose = { <palette>: { premier, essais, pose } }` (une palette sans clic n'a pas d'entrée ; les cases grisées
// et occupées se recalculent). Toutes les fonctions ci-dessous sont pures : `etat` est un objet qui porte `depose` (l'état du quai
// lui-même convient).
export const SOLS_DEPOSE = ['pieton', 'autre-quai'];
export const PREMIERE_BULLE = 'Dis-moi où je pose chaque palette. Pas de gerbage à la réception.';
export const GROUPE_DEPOSE = 'Diriger le déchargement';
const minusculeD = (t) => String(t).charAt(0).toLowerCase() + String(t).slice(1);
export const reactionDefaut = (c) => (c.sol === 'pieton' ? 'Là, c’est l’allée piétonne : je ne pose pas ici.'
  : c.sol === 'autre-quai' ? `Ça, c’est la zone du ${minusculeD(c.legende || 'quai voisin')}.` : '');
export const nomDefaut = (c) => (c.sol === 'pieton' ? `Case ${c.id}, allée piétonne`
  : c.sol === 'autre-quai' ? `Case ${c.id}, devant le ${minusculeD(c.legende || 'quai voisin')}` : `Case ${c.id}`);
const CLES_DEPOSE = ['cases', 'passage', 'grise'];
const CLES_CASE = ['id', 'nom', 'juste', 'reaction', 'sol', 'legende', 'peinte'];
export const MAX_CASES = 8;

// Les écarts de la déclaration `depose` elle-même (la maquette, sans la clé `consigne`) ; [] = rien à redire.
function ecartsDeclarationDepose(D, nbPalettes) {
  const E = [];
  if (!D || typeof D !== 'object' || Array.isArray(D)) return ['depose doit être un objet { cases, passage }'];
  Object.keys(D).forEach((k) => { if (!CLES_DEPOSE.includes(k)) E.push(`depose : clé « ${k} » inconnue (${CLES_DEPOSE.join(', ')})`); });
  const C = D.cases;
  if (!Array.isArray(C) || !C.length) return E.concat(['depose.cases doit être une liste non vide']);
  if (C.length > MAX_CASES) E.push(`depose.cases : ${C.length} cases, ${MAX_CASES} au plus (plan non éprouvé au-delà)`);
  const vus = new Set();
  C.forEach((c, i) => {
    const nom = `depose.cases[${i}]${c && typeof c.id === 'string' && c.id ? ` (« ${c.id} »)` : ''}`;
    if (!c || typeof c !== 'object') { E.push(`${nom} : une case est un objet`); return; }
    Object.keys(c).forEach((k) => { if (!CLES_CASE.includes(k)) E.push(`${nom} : clé « ${k} » inconnue (${CLES_CASE.join(', ')})`); });
    if (typeof c.id !== 'string' || !c.id.trim()) E.push(`${nom} : id vide`);
    else if (vus.has(c.id)) E.push(`${nom} : id en double`);
    else vus.add(c.id);
    if (c.sol !== undefined && !SOLS_DEPOSE.includes(c.sol)) E.push(`${nom} : sol « ${c.sol} » inconnu (${SOLS_DEPOSE.join(', ')})`);
    if (c.juste !== undefined && typeof c.juste !== 'boolean') E.push(`${nom} : juste doit être true ou false`);
    if (c.juste === true && c.sol) E.push(`${nom} : juste: true sur une case « ${c.sol} » (incohérent : la case se dessine comme un piège)`);
    if (c.sol === 'autre-quai' && (typeof c.legende !== 'string' || !c.legende.trim())) E.push(`${nom} : une case « autre-quai » demande sa légende (« Quai 3 »)`);
    ['nom', 'reaction', 'legende'].forEach((k) => { if (c[k] !== undefined && (typeof c[k] !== 'string' || !c[k].trim())) E.push(`${nom} : ${k} vide`); });
    if (c.juste === false && !c.sol && !c.reaction) E.push(`${nom} : une case fausse sans sol demande sa réaction (ce que dit le cariste)`);
    if (c.peinte !== undefined && typeof c.peinte !== 'boolean') E.push(`${nom} : peinte doit être true ou false`);
    if (c.peinte === false && !c.sol) E.push(`${nom} : peinte: false sur une case sans sol (une case juste est toujours peinte au sol)`);
  });
  const P = D.passage === undefined ? Math.floor(C.length / 2) : D.passage;
  if (!Number.isInteger(P) || P < 0 || P > C.length) E.push(`depose.passage : ${D.passage} n’est pas un nombre de cases à gauche de la porte (0 à ${C.length})`);
  else {
    [P - 1, P].forEach((i) => { if (C[i] && C[i].sol === 'autre-quai') E.push(`depose.cases[${i}] : une case « autre-quai » ne touche pas le passage de la porte (la porte du quai voisin tomberait sur celle-ci)`); });
  }
  if (['garde', 'palette'].indexOf(D.grise === undefined ? 'garde' : D.grise) < 0) E.push(`depose.grise : « ${D.grise} » inconnu (garde, palette)`);
  const justes = C.filter((c) => c && (c.juste !== undefined ? c.juste : !c.sol)).length;
  if (Number.isInteger(nbPalettes) && justes < nbPalettes) E.push(`depose : ${nbPalettes} palettes et ${justes} case${justes > 1 ? 's' : ''} juste${justes > 1 ? 's' : ''} : il faut au moins une case juste par palette (une case occupée ne se propose plus, pas de gerbage à la réception)`);
  return E;
}
// Le contrôle de `depose` dans `verifierQuai` (décision 1) : la déclaration, puis ce avec quoi elle se combine. `depose` va avec
// `securite`, `arret: 'dechargement'` et `commence: 'controle'` (la dépose n'y est pas jouée, les palettes sont dans les cases justes).
// Appelée seule (`verifierDepose(Q)`), elle rend la liste de ses écarts.
export function verifierDepose(Q, E = []) {
  if (!Q || typeof Q !== 'object' || Q.depose === undefined) return E;
  const cams = Array.isArray(Q.camions) ? Q.camions : [];
  const n = cams[0] && Array.isArray(cams[0].palettes) ? cams[0].palettes.length : undefined;
  ecartsDeclarationDepose(Q.depose, n).forEach((x) => E.push(x));
  if (Q.rendu !== 'iso') E.push('depose demande `rendu: \'iso\'` (les cases se dessinent sur le quai iso)');
  if (!Q.dechargement || Q.dechargement.par !== 'cariste') E.push('depose demande `dechargement: { par: \'cariste\' }` (c’est le cariste, au chariot frontal, qui attend où poser)');
  if (Q.froid !== false) E.push('depose demande un quai sans froid (`froid: false`), comme tout le rendu iso');
  if (cams.length > 1) E.push('depose demande un seul camion, comme tout le rendu iso');
  if (Q.mode === 'controle') E.push('depose avec mode: \'controle\' : ce mode (quai déjà réceptionné) n’a pas de déchargement');
  return E;
}

// Les cases complétées : sol, légende, peinte, juste, nom (l'étiquette lue au clavier) et réaction du cariste.
export function normaliserCases(D) {
  return D.cases.map((c) => {
    const k = { id: c.id, sol: c.sol || null, legende: c.legende || null, peinte: c.peinte !== false };
    k.juste = c.juste !== undefined ? c.juste : !c.sol;
    k.nom = c.nom || nomDefaut(k);
    k.reaction = c.reaction || reactionDefaut(k);
    return k;
  });
}
export function etatDeposeNeuf() { return { depose: {} }; }
const caseDe = (cases, id) => cases.find((c) => c.id === id) || null;
export const casesOccupees = (etat) => new Set(Object.values(etat.depose).map((d) => d.pose).filter(Boolean));
// Les cases grisées pour la palette en cours : les pièges déjà essayés (toutes palettes avec 'garde', celle-ci avec 'palette') ; aucune en copie.
export function casesGrisees(etat, cases, palette, { copie = false, grise = 'garde' } = {}) {
  const G = new Set();
  if (copie) return G;
  Object.entries(etat.depose).forEach(([p, d]) => {
    if (grise === 'palette' && p !== palette) return;
    d.essais.forEach((id) => { const c = caseDe(cases, id); if (c && !c.juste) G.add(id); });
  });
  return G;
}
// Les cases qui s'éclairent : ni occupées, ni grisées (dans l'ordre des cases).
export function casesProposees(etat, cases, palette, opts = {}) {
  const occ = casesOccupees(etat), gr = casesGrisees(etat, cases, palette, opts);
  return cases.filter((c) => !occ.has(c.id) && !gr.has(c.id)).map((c) => c.id);
}
// Un clic sur la case `id` pour la palette `palette` -> un NOUVEL état, ou le MÊME objet si le clic ne compte pas (case non proposée,
// palette déjà posée). Pose si copie OU case juste ; sinon l'essai est noté et la palette attend toujours.
export function choisirCase(etat, cases, palette, id, opts = {}) {
  const d = etat.depose[palette] || { premier: null, essais: [], pose: null };
  if (d.pose) return etat;
  const c = caseDe(cases, id);
  if (!c || !casesProposees(etat, cases, palette, opts).includes(id)) return etat;
  const n = { premier: d.premier || id, essais: d.essais.concat([id]), pose: opts.copie || c.juste ? id : null };
  return { depose: Object.assign({}, etat.depose, { [palette]: n }) };
}
export function issueDernierChoix(etat, cases, palette) {
  const d = etat.depose[palette];
  if (!d || !d.essais.length) return null;
  const id = d.essais[d.essais.length - 1], c = caseDe(cases, id);
  return d.pose ? { issue: 'pose', case: id } : { issue: 'refus', case: id, reaction: c ? c.reaction : '' };
}
export const paletteEnAttente = (etat, ordre) => ordre.find((p) => !(etat.depose[p] && etat.depose[p].pose)) || null;
export const deposeFinie = (etat, ordre) => paletteEnAttente(etat, ordre) === null;
// Les jalons de la dépose (décision 11) : `ok` = tout posé ET premier choix juste ; rien posé = tous faux (pas de récompense de
// l'inaction) ; `lib` ne dit pas la bonne case, `attendu` la dit (lu au bilan).
export function jalonsDepose(etat, cases, palettes) {
  const fini = palettes.every((p) => etat.depose[p] && etat.depose[p].pose);
  const justes = cases.filter((c) => c.juste).map((c) => c.id).join(', ');
  return palettes.map((p) => {
    const d = etat.depose[p], c = d && d.premier ? caseDe(cases, d.premier) : null;
    return { id: `depose-${p}`, palette: p, lib: `Dépose de la palette ${p}`, ok: !!(fini && c && c.juste),
      premier: d ? d.premier : null, attendu: `une case de la zone de réception (${justes})` };
  });
}

// LA GÉOMÉTRIE (maquette, pure). Monde du quai iso en mètres (projection `unite 60, origine [470, 235]`) : mur en y = 0, porte de
// x = 2,4 à 3,6 (centre 3,0), remorque en y < 0. Les cases sur UNE ligne à `Y0`, `passage` cases à gauche de la porte, les autres à
// droite ; une palette de 0,8 × 1,2 m centrée dans sa case. Le cariste attend à la sortie du camion (`ycSortie`) ; il circule dans
// l'allée derrière les cases (`ycAllee`). Le point d'attente « allée » de la maquette n'est pas repris (décision 2).
export const GEO_DEPOSE = { PAS: 1.05, LARG: 0.95, PROF: 1.4, Y0: 1.6, PAL: [0.8, 1.2], X_PORTE: 3.0, BORD_G: 2.4, BORD_D: 3.6, Y_CAMION: -2.9, PAS_CAMION: 1.3 };
const GD = GEO_DEPOSE;
function suitesDepose(cases, geo, sol) {
  const R = [];
  cases.forEach((c, i) => {
    if (c.sol !== sol) return;
    const der = R[R.length - 1];
    if (der && der.i1 === i - 1) { der.i1 = i; der.x1 = geo[i].x1; } else R.push({ i0: i, i1: i, x0: geo[i].x0, x1: geo[i].x1, legende: c.legende });
  });
  return R;
}
// -> { cases:[{id,x0,x1,y0,y1,px,py,cx,ycPose,peinte}], pieton:[{i0,i1,x0,x1,legende}], autres:[{…, xPorte}], zone:{x0,x1,y0,y1,xNom}|null,
//      sol:{x0,x1,y1}, xPorte, ycCamion, ycSortie, ycAllee }
export function geometrieDepose(cases, passage = Math.floor(cases.length / 2)) {
  const gab = GD.PAL, ec = Math.max(0, gab[1] - CHARIOT_FL);
  const geo = cases.map((c, i) => {
    const x0 = i < passage ? GD.BORD_G - GD.LARG - (passage - 1 - i) * GD.PAS : GD.BORD_D + (i - passage) * GD.PAS;
    const px = x0 + (GD.LARG - gab[0]) / 2, py = GD.Y0 + (GD.PROF - gab[1]) / 2;
    return { id: c.id, x0, x1: x0 + GD.LARG, y0: GD.Y0, y1: GD.Y0 + GD.PROF, px, py, cx: px + gab[0] / 2, ycPose: py + gab[1] - CHARIOT_FL, peinte: c.peinte !== false };
  });
  const z = geo.filter((g, i) => cases[i].sol !== 'autre-quai' && g.peinte);
  const xNom = Math.min(...geo.filter((_, i) => cases[i].juste).map((g) => g.x0));
  return {
    cases: geo,
    pieton: suitesDepose(cases, geo, 'pieton'),
    autres: suitesDepose(cases, geo, 'autre-quai').map((s) => Object.assign(s, { xPorte: (s.x0 + s.x1) / 2 })),
    zone: z.length ? { x0: Math.min(...z.map((g) => g.x0)) - 0.12, x1: Math.max(...z.map((g) => g.x1)) + 0.12, y0: GD.Y0 - 0.12, y1: GD.Y0 + GD.PROF + 0.12, xNom } : null,
    sol: { x0: Math.min(-1.2, Math.min(...geo.map((g) => g.x0)) - 0.6), x1: Math.max(7.5, Math.max(...geo.map((g) => g.x1)) + 0.6), y1: 6.4 },
    xPorte: GD.X_PORTE,
    ycCamion: GD.Y_CAMION + gab[1] - CHARIOT_FL,
    ycSortie: 0.12 + ec,
    ycAllee: GD.Y0 + GD.PROF + 0.12 + ec,
  };
}
// Les trajets du chariot, un par geste (décision 6 : pas de plan précalculé). `legs` = [{ t0, t1, a: [cx, yc, lev], b }] ;
// `marques` = les instants nommés (`leve`, `sortie`, `pose`) ; `arrivee` = la position finale.
function planificateurDepose(depart) {
  const V = CHARIOT_QUAI.V, legs = [], marques = {};
  let t = 0, pos = depart.slice();
  const aller = (cx, yc, lev, vitesse) => {
    const b = [cx == null ? pos[0] : cx, yc == null ? pos[1] : yc, lev == null ? pos[2] : lev];
    if (b[0] === pos[0] && b[1] === pos[1] && b[2] === pos[2]) return;
    const d = lev != null && lev !== pos[2] ? V.leve : Math.max(250, 1000 * Math.hypot(b[0] - pos[0], b[1] - pos[1]) / vitesse);
    legs.push({ t0: t, t1: t + d, a: pos.slice(), b }); t += d; pos = b;
  };
  return { V, aller, marque: (n) => { marques[n] = t; }, fin: () => ({ legs, marques, duree: t, arrivee: pos.slice() }) };
}
// Chercher : avance jusqu'à la palette de tête, lève (`leve`), recule (`sortie`) jusqu'au point d'attente.
export function trajetChercher(geo) {
  const yA = geo.ycSortie, p = planificateurDepose([geo.xPorte, yA, 0]);
  p.aller(null, geo.ycCamion, null, p.V.avance);
  p.marque('leve'); p.aller(null, null, CHARIOT_QUAI.LEV); p.marque('sortie');
  p.aller(null, yA, null, p.V.recule);
  return p.fin();
}
// Poser dans la case `k` (de `geo.cases`) : recule à l'allée, glisse, avance, descend (`pose`), recule, revient à vide au point d'attente.
export function trajetPoser(geo, k) {
  const yA = geo.ycSortie, p = planificateurDepose([geo.xPorte, yA, CHARIOT_QUAI.LEV]);
  p.aller(null, geo.ycAllee, null, p.V.recule);
  p.aller(k.cx, null, null, p.V.crabeCharge);
  p.aller(null, k.ycPose, null, p.V.avance);
  p.aller(null, null, 0); p.marque('pose');
  p.aller(null, geo.ycAllee, null, p.V.recule);
  p.aller(geo.xPorte, null, null, p.V.crabe);
  p.aller(null, yA, null, p.V.avance);
  return p.fin();
}
export function positionSur(legs, t, depart) {
  if (!legs.length) return depart.slice();
  let leg = legs[legs.length - 1];
  for (const l of legs) if (t < l.t1) { leg = l; break; }
  const f = leg.t1 > leg.t0 ? Math.min(1, Math.max(0, (t - leg.t0) / (leg.t1 - leg.t0))) : 1;
  return [0, 1, 2].map((i) => leg.a[i] + (leg.b[i] - leg.a[i]) * f);
}
// Les heurts du chariot (et de sa charge) avec les palettes des AUTRES cases, pour une pose en `k` (décision 13 : pas dans
// `verifierQuai`, un test unitaire vérifie que la variante A n'en a aucun). [] = aucun.
export function heurtsPose(geo, k) {
  const D = CHARIOT_QUAI.DEMI, gab = GD.PAL, H = [];
  const emprise = ([cx, yc, lev]) => ({ x0: Math.min(cx - D, cx - gab[0] / 2), x1: Math.max(cx + D, cx + gab[0] / 2), y0: lev > 0 ? Math.min(yc, yc + CHARIOT_FL - gab[1]) : yc, y1: yc + CHARIOT_BL });
  const coupe = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;
  const legs = trajetPoser(geo, k).legs.concat(trajetChercher(geo).legs);
  legs.forEach((l, n) => {
    const r = emprise(l.a), s = emprise(l.b), b = { x0: Math.min(r.x0, s.x0), x1: Math.max(r.x1, s.x1), y0: Math.min(r.y0, s.y0), y1: Math.max(r.y1, s.y1) };
    geo.cases.forEach((o) => { if (o.id !== k.id && coupe(b, { x0: o.px, x1: o.px + gab[0], y0: o.py, y1: o.py + gab[1] })) H.push(`${k.id} : segment ${n} dans ${o.id}`); });
  });
  return H;
}
// Une réplique en lignes de bulle : une phrase par ligne, coupée à `max` signes (maquette).
function couperBulle(texte, max = 40) {
  const L = [];
  String(texte).split(/(?<=[.!?…])\s+/).forEach((ph) => {
    let l = '';
    ph.split(/\s+/).forEach((m) => { if (l && (l + ' ' + m).length > max) { L.push(l); l = m; } else l = l ? `${l} ${m}` : m; });
    if (l) L.push(l);
  });
  return L;
}
// Le décor propre à la dépose (maquette, partie 3 ; décision 8), avec la projection `I` du quai. Teintes fixes : le dessin iso ne suit
// pas le thème. `matriceSolDe` : un texte ou un pictogramme écrit en mètres, à plat sur le sol (x vers la droite, y vers l'élève).
const POLICE_ISO = 'Inter, system-ui, \'Segoe UI\', Arial, sans-serif';
function matriceSolDe(I) {
  const [ox, oy] = I.P(0, 0, 0), [ax, ay] = I.P(1, 0, 0), [bx, by] = I.P(0, 1, 0);
  return `matrix(${(ax - ox).toFixed(3)},${(ay - oy).toFixed(3)},${(bx - ox).toFixed(3)},${(by - oy).toFixed(3)},${ox.toFixed(1)},${oy.toFixed(1)})`;
}
const surSolDe = (I, contenu) => `<g transform="${matriceSolDe(I)}">${contenu}</g>`;
const rectSolDe = (I, x0, y0, x1, y1, z = 0) => I.pts([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
const n1 = (v) => v.toFixed(1);
// Un pictogramme piéton peint au sol (centré en (x, y), 0,7 m de côté) : carré jaune, silhouette qui marche.
function pictoPieton(I, x, y) {
  const s = 0.7, x0 = x - s / 2, y0 = y - s / 2;
  return surSolDe(I, `<g data-iso-picto="pieton"><rect x="${x0}" y="${y0}" width="${s}" height="${s}" rx="0.06" fill="#e7c628" stroke="#a88a0c" stroke-width="0.02"/>
    <g fill="none" stroke="#1a1915" stroke-width="0.055" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${x + 0.02},${y - 0.14} L${x - 0.03},${y + 0.07} M${x - 0.03},${y + 0.07} L${x - 0.13},${y + 0.25} M${x - 0.03},${y + 0.07} L${x + 0.08},${y + 0.16} L${x + 0.1},${y + 0.27}
        M${x + 0.01},${y - 0.1} L${x - 0.12},${y - 0.01} M${x + 0.01},${y - 0.1} L${x + 0.1},${y - 0.02} L${x + 0.16},${y + 0.06}"/></g>
    <circle cx="${x + 0.04}" cy="${y - 0.22}" r="0.055" fill="#1a1915"/></g>`);
}
// La porte FERMÉE du quai voisin sur le mur, et son panneau (comme celui de `murQuai`).
function porteVoisine(I, xc, legende) {
  const x0 = xc - 0.6, x1 = xc + 0.6;
  let g = `<g data-iso-quai-voisin>${I.face([[x0 - 0.06, 0.0008, 0], [x1 + 0.06, 0.0008, 0], [x1 + 0.06, 0.0008, 2.11], [x0 - 0.06, 0.0008, 2.11]], '#8d969b', 'none')}`;
  g += I.face([[x0, 0.001, 0], [x1, 0.001, 0], [x1, 0.001, 2.05], [x0, 0.001, 2.05]], '#d4d8da', '#8d969b');
  for (let z = 0.2; z < 2.05; z += 0.25) g += `<polyline points="${I.pts([[x0, 0.002, z], [x1, 0.002, z]])}" stroke="#a3abb0"/>`;
  g += I.face([[xc - 0.3, 0.003, 2.25], [xc + 0.3, 0.003, 2.25], [xc + 0.3, 0.003, 2.55], [xc - 0.3, 0.003, 2.55]], '#1f5f3a', '#0f3d24');
  const [lx, ly] = I.P(xc, 0.004, 2.4);
  return g + `<text x="${n1(lx)}" y="${n1(ly + 6)}" text-anchor="middle" font-size="11" font-weight="800" fill="#fdfbf7" transform="rotate(30 ${n1(lx)} ${n1(ly)})">${ech(String(legende).toUpperCase())}</text></g>`;
}
// La bande jaune et noire du seuil d'une porte de quai (celle de `solQuai`), 8 bandes de 15 cm à partir de x0.
const seuilPorte = (I, x0) => { let g = ''; for (let k = 0; k < 8; k++) { const x = x0 + k * 0.15; g += I.face([[x, 0, 0], [x + 0.15, 0, 0], [x + 0.15, 0.18, 0], [x, 0.18, 0]], k % 2 ? '#1b1b1b' : '#e7c628', 'none'); } return g; };
// Une porte piétonne dans le mur, au bout de l'allée piétonne.
function portePietonne(I, xc) {
  const x0 = xc - 0.45, x1 = xc + 0.45, [px, py] = I.P(x1 - 0.12, 0.002, 1.0);
  return `<g data-iso-porte-pietonne>${I.face([[x0, 0.001, 0], [x1, 0.001, 0], [x1, 0.001, 2.0], [x0, 0.001, 2.0]], '#6f7b83', '#4c565d')}`
    + I.face([[x0 + 0.2, 0.002, 1.25], [x1 - 0.2, 0.002, 1.25], [x1 - 0.2, 0.002, 1.75], [x0 + 0.2, 0.002, 1.75]], '#b9cad4', '#4c565d')
    + `<circle cx="${n1(px)}" cy="${n1(py)}" r="2.5" fill="#2b2f33"/></g>`;
}

// Les palettes de fûts (`forme: 'fut'`, D-4 étape 3) : huit places en quinconce 3-2-3 sur un bac de rétention. `manque` = les
// NUMÉROS des places vides (1 à 8), `avarie` = { numéro: face qui fuit }, la face devant être EXTÉRIEURE (un fût qu'un autre cache
// ne se voit pas fuir). Le total, le réel et les fuites se calculent (`reglages`) : une dimension déclarée ne servirait à rien.
const FACES_FUITE = ['N', 'S', 'E', 'W'];
function verifierPalettes(Q, E) {
  const A = (Q && Q.aides) || {};
  let futs = 0;
  ((Q && Q.camions) || []).forEach((c, ci) => ((c && c.palettes) || []).forEach((p, pi) => {
    if (!p || typeof p !== 'object' || p.forme === undefined) return;
    const nom = `camions[${ci}].palettes[${pi}]${typeof p.id === 'string' && p.id ? ` (« ${p.id} »)` : ''}`;
    if (p.forme !== 'fut') { E.push(`${nom} : forme « ${p.forme} » inconnue (la seule valeur est 'fut' ; sans forme, la palette est chargée de cartons)`); return; }
    futs++;
    if (Q.rendu !== 'iso') E.push(`${nom} : une palette de fûts se dessine sur le quai iso (\`rendu: 'iso'\`)`);
    ['W', 'D', 'L', 'refs', 'etiqAvant'].forEach((k) => { if (p[k] !== undefined) E.push(`${nom} : « ${k} » n’a pas de sens pour une palette de fûts (huit places en quinconce 3-2-3 : le total se calcule)`); });
    const ok = (n) => Number.isInteger(n) && n >= 1 && n <= PLACES_FUTS;
    const manque = p.manque === undefined ? [] : p.manque;
    if (!Array.isArray(manque)) E.push(`${nom} : manque doit être la liste des numéros de places vides (de 1 à ${PLACES_FUTS})`);
    else {
      manque.forEach((n) => { if (!ok(n)) E.push(`${nom} : manque : le numéro « ${n} » n’existe pas (les places vont de 1 à ${PLACES_FUTS})`); });
      if (new Set(manque).size !== manque.length) E.push(`${nom} : manque : un numéro est en double`);
    }
    const av = p.avarie === undefined ? {} : p.avarie;
    if (!av || typeof av !== 'object' || Array.isArray(av)) E.push(`${nom} : avarie doit être { numéro: face qui fuit }`);
    else Object.keys(av).forEach((k) => {
      const n = Number(k);
      if (!ok(n) || String(n) !== k) { E.push(`${nom} : avarie : le numéro « ${k} » n’existe pas (les places vont de 1 à ${PLACES_FUTS})`); return; }
      if (!FACES_FUITE.includes(av[k])) E.push(`${nom} : avarie : la face du fût ${n} est « ${av[k]} » (N, S, E ou W)`);
      else if (!facesExterieuresFut(n).includes(av[k])) E.push(`${nom} : avarie : la face ${av[k]} du fût ${n} est cachée par les autres fûts (faces visibles : ${facesExterieuresFut(n).join(', ')})`);
      if (Array.isArray(manque) && manque.includes(n)) E.push(`${nom} : avarie : le fût ${n} est absent, il ne peut pas fuir`);
    });
  }));
  // Sans unité déclarée, le quai parlerait de « cartons » devant des fûts (garde-fou du 10/10/2026, fin du chantier D-4).
  if (futs && Q.unite === undefined) E.push('une palette de fûts demande `unite` (par exemple `\'fûts\'`) : sans elle, le quai parlerait de cartons');
  if (futs) ['regleCouches', 'detailComptage'].forEach((k) => { if (A[k]) E.push(`aides.${k} parle de couches de cartons : sans objet pour une palette de fûts`); });
}

// L'unité, la liste des motifs et leurs libellés (D-4, étape 4). Une unité en -s : « fûts » dit le pluriel, le singulier s'en déduit.
const MOTIFS_LIBELLES = ['avarie', 'manquant', 'produit'];
function verifierUnite(Q, E) {
  const guill = (t) => (typeof t === 'string' ? `« ${t} »` : JSON.stringify(t));
  if (Q.unite !== undefined) {
    const u = Q.unite;
    if (typeof u === 'string') {
      if (!texteNet(u)) E.push('unite : le texte est vide (« fûts », ou { un: \'fût\', des: \'fûts\' })');
      else if (texteNet(u).length < 2 || !texteNet(u).endsWith('s')) E.push(`unite : ${guill(u)} ne finit pas par « s » (écrire le pluriel : « fûts » ; pour un pluriel irrégulier, { un: 'cheval', des: 'chevaux' })`);
    } else if (u && typeof u === 'object' && !Array.isArray(u)) {
      ['un', 'des'].forEach((k) => { if (!texteNet(u[k])) E.push(`unite : « ${k} » manque (il faut { un: 'fût', des: 'fûts' })`); });
    } else E.push('unite : un texte au pluriel (« fûts ») ou { un, des }');
  }
  if (Q.motifs !== undefined) {
    if (!Array.isArray(Q.motifs)) E.push('motifs : la liste des motifs proposés (avarie, manquant, produit, temperature)');
    else Q.motifs.forEach((m) => { if (!Object.prototype.hasOwnProperty.call(MOTIFS, m)) E.push(`motifs : l’id ${guill(m)} n’existe pas (${Object.keys(MOTIFS).filter((k) => k !== 'aucun').join(', ')})`); });
  }
  if (Q.libelles !== undefined) {
    const L = Q.libelles;
    if (!L || typeof L !== 'object' || Array.isArray(L)) E.push('libelles : un objet { avarie: { nom, precision }, manquant: { nom }, produit: { nom } }');
    else Object.keys(L).forEach((m) => {
      if (!MOTIFS_LIBELLES.includes(m)) { E.push(`libelles.${m} : ce motif n’a pas de libellé à déclarer (${MOTIFS_LIBELLES.join(', ')})`); return; }
      const d = L[m];
      if (!d || typeof d !== 'object' || Array.isArray(d)) { E.push(`libelles.${m} : un objet { nom${m === 'avarie' ? ', precision' : ''} }`); return; }
      Object.keys(d).forEach((k) => {
        if (k === 'nom' || (k === 'precision' && m === 'avarie')) { if (!texteNet(d[k])) E.push(`libelles.${m}.${k} : le texte est vide`); }
        else E.push(`libelles.${m}.${k} : inconnu (${m === 'avarie' ? 'nom, precision' : 'nom'})`);
      });
    });
  }
}

// Un quai en deux séances (lot 1) : `arret`, `commence`, `document`. Une valeur inconnue, ou une combinaison qui n'a pas de sens, est refusée en clair.
function verifierDeuxSeances(Q, E) {
  const a = Q.arret;
  let arret = false;
  if (a !== undefined) {
    const etape = typeof a === 'string' ? a : a && typeof a === 'object' && !Array.isArray(a) ? a.etape : undefined;
    if (etape !== 'dechargement') E.push(`arret : ${typeof a === 'string' ? `« ${a} »` : 'cette valeur'} n’existe pas (la seule étape où s’arrêter est 'dechargement', ou { etape: 'dechargement', texte: '…' })`);
    else arret = true;
    if (a && typeof a === 'object' && !Array.isArray(a)) {
      Object.keys(a).filter((k) => k !== 'etape' && k !== 'texte').forEach((k) => E.push(`arret.${k} : inconnu (etape, texte)`));
      if (a.texte !== undefined && !texteNet(a.texte)) E.push('arret.texte : le texte du bandeau de fin est vide (retirer texte pour garder « Les palettes sont en zone de réception. »)');
    }
  }
  const commence = Q.commence !== undefined;
  if (commence && Q.commence !== 'controle') E.push(`commence : « ${Q.commence} » n’existe pas (la seule valeur est 'controle' : la vue s’ouvre à l’étape ③, le déchargement est déjà fait)`);
  if (Q.document !== undefined && !texteNet(Q.document)) E.push('document : le nom du document de transport est vide (par exemple \'Bon de livraison — lettre de voiture\')');
  if (arret && commence) E.push('arret et commence : on ne peut pas à la fois s’arrêter après le déchargement et partir du contrôle (il ne resterait aucune étape)');
  if ((arret || commence) && Q.mode === 'controle') E.push(`${arret ? 'arret' : 'commence'} avec mode: 'controle' : ce mode (quai déjà réceptionné) n’a ni déchargement ni étapes à raccourcir`);
  if ((arret || commence) && Array.isArray(Q.camions) && Q.camions.length > 1) E.push(`${arret ? 'arret' : 'commence'} demande un seul camion (le camion suivant ne se met à quai qu’une fois le BL du précédent signé)`);
  if (commence && Q.commence === 'controle') {
    if (Q.securite) E.push('commence: \'controle\' avec securite : l’inspection se joue avant le déchargement, qui est déjà fait (retirer securite)');
    if (Q.froid !== false) E.push('commence: \'controle\' demande un quai sans froid (froid: false) : un lot déjà déchargé n’a pas de temps hors froid à mesurer');
  }
}

// La liste des écarts d'un contenu de quai, en français courant (liste vide = rien à redire). Appelée par `creerQuai`
// au chargement ; elle ne regarde que ce que ce chantier ajoute (une séance existante n'a rien à y changer).
export function verifierQuai(Q) {
  const E = [];
  verifierPalettes(Q, E);
  if (Q && typeof Q === 'object') { verifierUnite(Q, E); verifierDeuxSeances(Q, E); verifierDepose(Q, E); }
  if (Q && typeof Q === 'object' && Q.rendCopie !== undefined && Q.rendCopie !== false) E.push(`rendCopie : ne prend que la valeur false (reçu « ${Q.rendCopie} »)`);
  const S = Q && Q.securite;
  if (!S || typeof S !== 'object') return E;
  const scene = S.mode === 'scene';
  if (S.mode !== undefined && S.mode !== 'scene') E.push(`securite.mode : « ${S.mode} » n’existe pas (la seule valeur est 'scene' ; sans mode, c’est la liste OK / Pas OK)`);
  if (S.arret !== undefined && typeof S.arret !== 'boolean' && typeof S.arret !== 'string') E.push('securite.arret : false, true ou le texte de l’arrêt');
  if (!scene) {
    if (S.arret === false && Array.isArray(S.points) && S.points.length) E.push('securite.arret: false n’a de sens que pour l’inspection sur la scène (en liste, l’arrêt du chef de quai ne se règle pas) : retirer arret, ou déclarer mode: \'scene\'');
    return E;
  }
  if (Q.rendu !== 'iso') E.push('l’inspection sur la scène demande `rendu: \'iso\'`');
  if (S.photo !== undefined) E.push('securite.photo : en mode scène il n’y a rien à photographier (la scène est dessinée par le quai)');
  const P = S.points;
  if (!Array.isArray(P) || !P.length) { E.push('securite.points : la liste est vide (il faut au moins un point à inspecter)'); return E; }
  const ids = new Set(), objets = new Set();
  P.forEach((p, i) => {
    const nom = `securite.points[${i}]${p && typeof p.id === 'string' && p.id ? ` (« ${p.id} »)` : ''}`;
    if (!p || typeof p !== 'object') { E.push(`${nom} : ce n’est pas un point`); return; }
    if (typeof p.id !== 'string' || !p.id.trim()) E.push(`${nom} : id vide`);
    else {
      if (ids.has(p.id)) E.push(`${nom} : id en double`);
      if (p.id === 'aucun-faux') E.push(`${nom} : l’id « aucun-faux » est réservé (c’est celui du jalon « aucun faux signalement »)`);
      ids.add(p.id);
    }
    const O = OBJETS_SCENE[p.objet];
    if (!O) E.push(`${nom} : objet « ${p.objet} » inconnu (${Object.keys(OBJETS_SCENE).join(', ')})`);
    else {
      if (objets.has(p.objet)) E.push(`${nom} : deux points sur le même objet « ${p.objet} »`);
      objets.add(p.objet);
      if (!O.etats.includes(p.etat)) E.push(`${nom} : état « ${p.etat} » inconnu pour ${p.objet} (${O.etats.join(', ')})`);
      if (p.vue !== undefined && p.vue !== O.vue) E.push(`${nom} : ${p.objet} se voit ${O.vue === 'dehors' ? 'dehors' : 'dedans'}, pas « ${p.vue} »`);
      if (typeof p.ok !== 'boolean') E.push(`${nom} : ok manque (vrai si l’état est sûr, faux si c’est un défaut)`);
      else if (O.etats.includes(p.etat) && p.ok && p.etat !== O.sur) E.push(`${nom} : ok: true sur un état dangereux (${p.objet} « ${p.etat} »)`);
      else if (O.etats.includes(p.etat) && !p.ok && p.etat === O.sur) E.push(`${nom} : ok: false sur l’état sûr (${p.objet} « ${p.etat} »)`);
    }
    if (typeof p.lib !== 'string' || !p.lib.trim()) E.push(`${nom} : lib manque (il sert au bilan, il ne s’affiche jamais pendant l’inspection)`);
  });
  return E;
}

// L'état de chaque objet à un instant : l'état DÉCLARÉ, ou l'état SÛR si le point a été signalé ou si l'inspection est
// figée (« C'est bon »). Calculé, jamais rangé. Un objet non déclaré garde son état d'aujourd'hui (cale et lampe : `null`).
export function etatsScene(S, sec) {
  const E = {};
  Object.keys(OBJETS_SCENE).forEach((o) => { E[o] = OBJETS_SCENE[o].defaut; });
  const vus = new Set();
  ((sec && sec.signaux) || []).forEach((g) => ((g && g.points) || []).forEach((id) => vus.add(id)));
  const fait = !!(sec && sec.fait);
  ((S && S.points) || []).forEach((p) => { E[p.objet] = fait || vus.has(p.id) ? OBJETS_SCENE[p.objet].sur : p.etat; });
  return E;
}

const projeterScene = (vue) => projection({ unite: VUES_SCENE[vue].unite, origine: VUES_SCENE[vue].origine });
// Les zones où l'on clique pour chaque point déclaré, sur l'état dessiné `etats` : `[{ id, vue, rects: [{ x, y, w, h }] }]`
// (unités du viewBox de la vue). L'objet « cabine » a deux rectangles, le pare-brise (où l'on voit le chauffeur) et, tant
// que le moteur tourne, la fumée ; une cale ou des butoirs absents gardent leur zone à l'emplacement de l'objet.
export function zonesScene(S, etats) {
  const cam = boitesCamion(X_PORTE_FACADE[PORTE_CAMION], YR_QUAI, {});
  return ((S && S.points) || []).map((p) => {
    const vue = OBJETS_SCENE[p.objet].vue, I = projeterScene(vue);
    const L = p.objet === 'cabine' ? [cam.cabine].concat(etats.cabine === 'conduite' ? [cam.fumee] : [])
      : p.objet === 'cale' ? [cam.cale]
        : p.objet === 'butoirs' ? [boitesButoirs(PORTE_CAMION)]
          : p.objet === 'niveleur' ? [boitesNiveleur(etats.niveleur === 'releve' ? 'releve' : 'pose')] : [boitesLampe()];
    return { id: p.id, vue, rects: L.map((b) => boiteEcran(I, b, MARGE_ZONE)) };
  });
}
// Le point touché par un clic en (x, y) de la vue `vue` : le PREMIER point déclaré de cette vue dont une zone contient
// le clic, sinon `null` (à côté).
export function pointTouche(S, etats, vue, x, y) {
  const z = zonesScene(S, etats).find((q) => q.vue === vue && q.rects.some((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h));
  return z ? z.id : null;
}

/* ======================================================================= état */
// Le jour de la séance (« aaaa-mm-jj », heure locale) : la date de la réception de nuit sur le BL.
const aujourdhui = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const jourAffiche = (j) => (j ? j.split('-').reverse().join('/') : '');
export function etatNeuf(Q) {
  const R = reglages(Q);
  if (R.controle) {
    const pal = {};
    R.palettes.forEach((p) => { pal[p.id] = paletteNeuve(); });
    return { v: 1, mode: 'controle', phase: 1, jour: aujourdhui(), reel: 0, tiersTemps: false, sel: 0, onglet: 'dossier',
      palettes: pal, fini: false, termine: null };
  }
  const palettes = {};
  R.palettes.forEach((p) => { palettes[p.id] = paletteNeuve(); });
  const e = Object.assign({ v: 1, etape: R.securite && !R.scene ? 0 : 1, minute: 0, reel: 0, tiersTemps: false, sel: 0, journal: [], palettes, fini: false }, camionNeuf());
  if (R.securite) e.securite = securiteNeuve(R.scene);
  // La dépose dirigée (lot 2) : aucune palette choisie (une palette sans clic n'a pas d'entrée).
  if (R.depose) e.depose = etatDeposeNeuf().depose;
  if (R.multi) Object.assign(e, { suivants: R.camions.slice(1).map(camionNeuf), ordre: { premier: null, phrase: null }, actif: 0 });
  // `commence: 'controle'` : le déchargement est DÉJÀ fait. Le camion est ouvert (à l'heure de départ du quai, minute 0), les N palettes sont posées
  // (`evts` = N + 1, comme après la dernière pose), on est à l'étape ③. Ni journal ni minute ajoutés : rien n'a été joué.
  if (R.commence) Object.assign(e, { decharge: true, ouvertA: 0, evts: R.palettes.filter((p) => p.camion === 0).length + 1, etape: 3 });
  return e;
}
// L'étape ⓪ : la réponse à chaque point, les signalements (avec les points « pas OK » à ce moment-là, et
// s'ils viennent après un arrêt du chef de quai), l'arrêt, et le départ du déchargement.
// Mode scène (D-4) : les marques posées sur la scène (`{ n, vue, x, y, point, envoi }`, `envoi` = numéro du signal ou `null`), le compteur
// qui ne réutilise jamais un numéro, les signaux envoyés (`{ points, rien, marques, apresArret }`), la porte de quai ouverte, l'arrêt, le
// figeage (`fait`) et la dernière réponse du chef de quai. Les états des objets se CALCULENT (`etatsScene`), ils ne se rangent pas.
const securiteNeuve = (scene = false) => (scene
  ? { mode: 'scene', marques: [], compteur: 0, signaux: [], ouverte: false, arrete: false, fait: false, chef: '' }
  : { rep: {}, signaux: [], arrete: false, fait: false, chef: '' });
const paletteNeuve = () => ({ vue: 0, vues: [0], sonde: null, compte: null, etiqVue: false, detail: {}, decision: '', motif: 'aucun', res: '', motif2: 'aucun', res2: '', fiche: ficheNeuve(), calcul: {} });

// Une base écrite avec une autre version du contenu : on complète sans rien effacer.
function normaliser(e, R) {
  if (!e.palettes) e.palettes = {};
  R.palettes.forEach((p) => { if (!e.palettes[p.id]) e.palettes[p.id] = paletteNeuve(); });
  if (R.controle) {
    if (!(e.phase >= 1)) e.phase = 1;
    if (!e.jour) e.jour = aujourdhui();
    if (e.onglet !== 'chambre') e.onglet = 'dossier';
    if (!(e.sel >= 0 && e.sel < R.palettes.length)) e.sel = 0;
    if (typeof e.reel !== 'number') e.reel = 0;
    return;
  }
  R.palettes.forEach((p) => { const s = e.palettes[p.id]; s.fiche = Object.assign(ficheNeuve(), s.fiche || {}); if (!s.calcul || typeof s.calcul !== 'object') s.calcul = {}; });
  if (!Array.isArray(e.journal)) e.journal = [];
  if (!Array.isArray(e.lignes)) e.lignes = [];
  if (R.securite && !e.securite) e.securite = securiteNeuve(R.scene);
  if (R.depose && (!e.depose || typeof e.depose !== 'object' || Array.isArray(e.depose))) e.depose = etatDeposeNeuf().depose;
  // (Une base relue peut avoir perdu un `null` ou une liste vide en route : on remet la forme { premier, essais, pose }.)
  if (R.depose) Object.keys(e.depose).forEach((p) => {
    const d = e.depose[p];
    if (!d || typeof d !== 'object') { delete e.depose[p]; return; }
    if (!Array.isArray(d.essais)) d.essais = [];
    if (d.premier === undefined) d.premier = d.essais[0] || null;
    if (d.pose === undefined) d.pose = null;
  });
  // Un quai qui part du contrôle n'a que les étapes ③ et ④ ; un quai qui s'arrête au déchargement, que ⓪ ① ②.
  if (R.commence && !(e.etape >= 3)) e.etape = 3;
  if (R.arretDech && e.etape > 2) e.etape = 2;
  if (R.scene) {
    // Une base écrite avant le mode scène (ou par une autre version du contenu) : on complète sans rien effacer.
    const sec = e.securite;
    sec.mode = 'scene';
    if (!Array.isArray(sec.marques)) sec.marques = [];
    if (!Array.isArray(sec.signaux)) sec.signaux = [];
    if (!(sec.compteur >= 0)) sec.compteur = sec.marques.reduce((m, x) => Math.max(m, +x.n || 0), 0);
    ['ouverte', 'arrete', 'fait'].forEach((k) => { sec[k] = !!sec[k]; });
    if (typeof sec.chef !== 'string') sec.chef = '';
    if (e.etape === 0) e.etape = 1;
  }
  if (typeof e.reel !== 'number') e.reel = 0;
  if (e.sel >= R.palettes.length) e.sel = 0;
  if (R.multi) {
    if (!Array.isArray(e.suivants)) e.suivants = [];
    while (e.suivants.length < R.camions.length - 1) e.suivants.push(camionNeuf());
    if (!e.ordre) e.ordre = { premier: null, phrase: null };
    if (!(e.actif >= 0 && e.actif < R.camions.length)) e.actif = 0;
  }
}

/* ===================================================================== bilan */
// Ce que la réserve doit préciser, selon le motif choisi par l'élève.
const CHAMP_RES = {
  temperature: { mode: 'decimal', attendu: (p) => p.temp, egal: (v, p) => Math.abs(nombre(v) - p.temp) < 0.05 },
  produit: { mode: 'text', attendu: (p) => p.etiq.ref, egal: (v, p) => String(v).trim().toUpperCase() === String(p.etiq.ref).toUpperCase() },
  avarie: { mode: 'numeric', attendu: (p) => p.avaries, egal: (v, p) => nombre(v) === p.avaries },
  manquant: { mode: 'numeric', attendu: (p) => p.manquants, egal: (v, p) => nombre(v) === p.manquants },
  aucun: { mode: 'numeric', attendu: () => '?', egal: () => false },
};
// Le libellé du champ de la réserve : celui d'aujourd'hui, l'unité (R.u) dans les champs chiffrés.
const libChamp = (R, motif) => ({
  temperature: 'Température à cœur relevée (°C)', produit: 'Référence réellement livrée (lue sur l’étiquette)',
  avarie: `Nombre de ${R.u.des} endommagés`, manquant: `Nombre de ${R.u.des} manquants`, aucun: `Nombre de ${R.u.des} concernés`,
}[motif] || `Nombre de ${R.u.des} concernés`);
// Une ligne de réserve : un constat par motif (deux pour une palette à deux problèmes, ENT-4.4).
// `motifs` : [[motif, valeur saisie], …].
function texteLigne(p, decision, motifs, R) {
  const vide = (v) => v === '' || v === undefined || v === null;
  const pl = (v) => (String(v).trim() === '1' ? '' : 's'); // « 1 carton manquant », « 2 cartons manquants »
  const nb = (s) => (s ? R.u.des : R.u.un);               // l'unité accordée au nombre
  const L = motifs.length ? motifs : [['aucun', '']];
  if (decision === 'refuser') {
    const pourquoi = L.map(([motif, v]) => {
      const val = vide(v) ? '…' : v, s = pl(v);
      return motif === 'temperature' ? `température à cœur ${vide(v) ? '…' : fmtT(v)} (−18 °C exigé)`
        : motif === 'produit' ? `produit livré ${val} au lieu de ${p.ref} commandé`
          : motif === 'avarie' ? `${val} ${nb(s)} endommagé${s}` : motif === 'manquant' ? `${val} ${nb(s)} manquant${s}` : 'motif non précisé';
    }).join(' ; ');
    return `${p.id} ${p.ref} : palette REFUSÉE — ${pourquoi}. ${p.reel} ${R.u.des} repris par le chauffeur.`;
  }
  const quoi = L.map(([motif, v]) => {
    const val = vide(v) ? '…' : v, s = pl(v);
    return motif === 'avarie' ? `${val} ${nb(s)} endommagé${s} (${R.precis != null ? R.precis : `écrasé${s}`})`
      : motif === 'manquant' ? `manque ${val} ${nb(s)} (BL ${p.bl}, reçu ${vide(v) ? '…' : p.bl - (+nombre(v))})`
        : motif === 'temperature' ? `température à cœur ${vide(v) ? '…' : fmtT(v)} (−18 °C exigé)` : motif === 'produit' ? `référence livrée ${val}` : 'réserve sans motif';
  }).join(' ; ');
  return `${p.id} ${p.ref} : acceptée sous réserve — ${quoi}.`;
}
// Les motifs attendus d'une palette (un, ou deux avec `motif2Attendu`) et ceux choisis par l'élève
// (le second menu n'existe que si la séance déclare `deuxMotifs`), sans « aucun » ni doublon.
const motifsAttendus = (p) => [p.motifAttendu, p.motif2Attendu].filter((m) => m && m !== 'aucun');
const motifsChoisis = (s) => [...new Set([s.motif, s.motif2].filter((m) => m && m !== 'aucun'))];
const memesMotifs = (p, s) => { const a = motifsAttendus(p), c = motifsChoisis(s); return a.length === c.length && a.every((m) => c.includes(m)); };
// Les motifs en une ligne. `Q` (facultatif) : le contenu du quai, pour ses libellés ; sans lui, ceux d'aujourd'hui (corrigés).
const libMotifsDe = (M, L) => (L.length ? L.map((m) => M[m]).join(' + ') : M.aucun);
export const libMotifs = (L, Q) => libMotifsDe(Q ? libellesMotifs(Q) : MOTIFS, L);
// La valeur saisie pour un motif : `res` pour le premier menu, `res2` pour le second.
const valeurDe = (s, m) => (s.motif === m ? s.res : s.motif2 === m ? s.res2 : '');
const ligneAttendue = (p, R) => texteLigne(p, p.attendu, motifsAttendus(p).map((m) => [m, CHAMP_RES[m].attendu(p)]), R);
// Une décision juste demande la palette sondée (sauf quai sans froid : rien à sonder) ; et, quand
// l'étiquette avant est déchirée, un refus « produit différent » demande d'avoir lu l'étiquette arrière.
const paletteJuste = (p, s, froid = true) => s.decision === p.attendu && memesMotifs(p, s) && (!froid || s.sonde !== null)
  && !(p.etiqAvant === 'dechiree' && p.motifAttendu === 'produit' && !(s.etiqLues || []).includes('arriere'));
// Le comptage : un total, ou un nombre par référence pour une palette multi-références.
const compteJuste = (p, s) => (p.refs ? p.refs.every((r) => s.comptes && +s.comptes[r.ref] === r.reel && s.comptes[r.ref] !== '') : s.compte === p.reel);

// Les jalons, dans l'ordre de la maquette (fonction `jalons()`). `compte: false` : ligne affichée
// au bilan (le détail du comptage, en guidage) mais qui ne compte pas. Aucun jalon n'est vrai par
// inaction : « mention non ajoutée » demande des réserves écrites, « lot rentré » un geste.
export function jalonsQuai(db, Q) {
  const R = reglages(Q);
  if (R.controle) return jalonsControle(db, Q, R);
  const e = db && db.quais && db.quais[Q.id];
  const L = [];
  let pts = 0, max = 0;
  const j = (id, lib, fait, attendu, ok, compte = true) => {
    if (compte) { max++; if (ok) pts++; }
    L.push({ id, lib, fait, attendu, ok: !!ok, compte });
  };
  const s0 = paletteNeuve();
  const E = e || etatNeuf(Q);
  const M = R.multi;
  const suff = (c) => (M ? `-${c.lettre}` : '');
  const libC = (lib, c) => (M ? `${lib} (camion ${c.nom})` : lib);
  // L'ordre des camions et sa justification : un seul jalon, les deux à la fois.
  // `commence: 'controle'` : les étapes ⓪ ① ② ne sont pas jouées, donc ni ordre, ni sécurité, ni ticket (rien « à faire » pour une étape absente).
  if (M && Q.ordre && !R.commence) {
    const O = Q.ordre, o = E.ordre || {}, ph = Object.fromEntries((O.phrases || []).map((x) => [x.v, x.lib]));
    const cP = R.camions[O.premier] || R.camions[0];
    const fait = o.premier != null && unDecharge(E, R) ? `camion ${R.camions[o.premier].nom} d’abord — « ${ph[o.phrase] || 'sans justification'} »` : 'pas encore choisi';
    j('ordre', 'Ordre de déchargement et justification', fait, `camion ${cP.nom} d’abord — « ${ph[O.juste] || O.juste} »`,
      !!e && unDecharge(E, R) && o.premier === O.premier && o.phrase === O.juste);
  }
  // L'étape ⓪ (sécurité) : ses deux jalons d'abord, dans l'ordre du jeu.
  if (R.securite && !R.commence) (R.scene ? jalonsScene(e, R) : jalonsSecurite(e, R)).forEach((l) => j(l.id, l.lib, l.fait, l.attendu, l.ok));
  if (R.froid && !R.commence) R.camions.forEach((c, ci) => {
    const k = K(E, ci);
    const lib = Object.fromEntries((c.qcmTicket && c.qcmTicket.choix || QCM_TICKET).map((x) => [x.v, x.court || x.lib]));
    const attenduTicket = (c.qcmTicket && c.qcmTicket.attendu) || 'long';
    j(`ticket${suff(c)}`, libC('Enregistreur', c), k.ticketLu ? (lib[k.ticketRep] || 'lu, sans réponse') : 'non lu',
      `${lib[attenduTicket] || attenduTicket}${attenduTicket === 'long' ? ', à signaler' : ''}`, !!e && k.ticketLu && k.ticketRep === attenduTicket);
  });
  // La dépose dirigée (lot 2) : un jalon par palette, présents dès la base vide (tous faux), absents quand la dépose n'est pas jouée (`commence`).
  if (R.depose && !R.commence) {
    const ED = { depose: (E && E.depose) || {} }, ids = R.palettes.filter((p) => p.camion === 0).map((p) => p.id);
    jalonsDepose(ED, R.depose.cases, ids).forEach((l) => {
      const c = l.premier ? R.depose.cases.find((x) => x.id === l.premier) : null, d = ED.depose[l.palette];
      const fait = c ? `premier choix : ${c.nom}${d && d.pose && d.pose !== l.premier ? ` (posée ensuite en ${d.pose})` : ''}` : 'pas posée';
      j(l.id, l.lib, fait, l.attendu, l.ok);
    });
  }
  // `arret: 'dechargement'` : ③ et ④ ne sont pas jouées (ni comptage, ni décision, ni réserve, ni signature, ni rentrée) : on s'arrête aux étapes jouées.
  if (R.arretDech) return { L, pts, max };
  const PE = R.palettes.map((p) => effective(p, E, R));
  PE.forEach((p) => {
    const s = (E.palettes && E.palettes[p.id]) || s0;
    if (R.aides.detailComptage) {
      const d = R.calcul && R.calcul.forme === 'feuille' && !p.refs ? detailDeFeuille(s) : (s.detail || {}), couche = p.W * p.D, haut = p.manque.length;
      const okD = +d.dCouche === couche && +d.dCouches === p.L && +(d.dManque || 0) === haut;
      j(`${p.id}-detail`, `${p.id} détail`, d.dCouche ? `${d.dCouche} par couche × ${d.dCouches || '?'} couches − ${d.dManque || 0}` : 'non rempli',
        `${couche} par couche × ${p.L} couches − ${haut}`, okD, false);
    }
    if (p.refs) {
      const c = s.comptes || {};
      j(`${p.id}-comptage`, `${p.id} comptage (${p.refs.length} références)`,
        p.refs.some((r) => c[r.ref] != null && c[r.ref] !== '') ? p.refs.map((r) => `${r.ref} : ${c[r.ref] ?? '?'}`).join(' · ') : 'pas compté',
        p.refs.map((r) => `${r.ref} : ${r.reel} (BL ${r.bl})`).join(' · '), compteJuste(p, s));
    } else {
      j(`${p.id}-comptage`, `${p.id} comptage`, s.compte === null ? 'pas compté' : `${s.compte} ${R.u.des}`, `${p.reel} ${R.u.des} (BL : ${p.bl})`, s.compte === p.reel);
    }
    const fait = s.decision ? `${DECISIONS[s.decision]} — ${libMotifsDe(R.lib, motifsChoisis(s))}${R.froid && s.sonde === null ? ' (sans sonder)' : ''}` : 'sans contrôle ni décision';
    j(`${p.id}-decision`, `${p.id} décision`, fait, `${DECISIONS[p.attendu]} — ${libMotifsDe(R.lib, motifsAttendus(p))}`, paletteJuste(p, s, R.froid));
  });
  // Une ligne de réserve par palette qui en demande une ; pour un camion qui peut se réchauffer, ses
  // palettes ont TOUJOURS un jalon de réserve (le nombre de jalons ne dépend pas du parcours) :
  // « aucune ligne » est juste quand la palette est acceptée, une fois les papiers écrits.
  PE.forEach((p) => {
    const k = K(E, p.camion);
    if (p.attendu === 'accepter' && !R.camions[p.camion].rechauffe) return;
    const l = k.ecrit ? k.lignes.find((x) => x.id === p.id) : null;
    if (p.attendu === 'accepter') {
      j(`${p.id}-reserve`, `${p.id} réserve écrite`, l ? l.texte : (k.ecrit ? 'aucune ligne' : 'réserves non écrites'), 'aucune ligne : palette acceptée', k.ecrit && !l);
      return;
    }
    j(`${p.id}-reserve`, `${p.id} réserve écrite`, l ? l.texte : (k.ecrit ? 'aucune ligne' : 'réserves non écrites'), ligneAttendue(p, R), !!l && l.juste);
  });
  const KS = R.camions.map((_, ci) => K(E, ci));
  if (M) {
    j('deballage', 'Mention « sous réserve de déballage » (tous les BL)', KS.some((k) => k.mentionEcrite) ? 'ajoutée' : 'non ajoutée',
      'non ajoutée (aucune valeur juridique)', KS.every((k) => k.ecrit && !k.mentionEcrite));
  } else {
    j('deballage', 'Mention « sous réserve de déballage »', E.mentionEcrite ? 'ajoutée' : 'non ajoutée', 'non ajoutée (aucune valeur juridique)', E.ecrit && !E.mentionEcrite);
  }
  R.camions.forEach((c, ci) => j(`signature${suff(c)}`, libC('Signature du chauffeur sous les réserves', c), KS[ci].signe ? 'obtenue' : 'pas de signature', 'obtenue', KS[ci].signe));
  R.camions.forEach((c, ci) => j(`rentre${suff(c)}`, R.froid ? libC('Lot rentré en chambre froide', c) : libC(`Palettes rentrées en ${minuscule(R.zone.nom)}`, c),
    KS[ci].rentre ? (R.froid ? `oui, après ${fmtMin(KS[ci].froid)} hors froid` : 'oui') : 'non', 'oui', KS[ci].rentre));
  return { L, pts, max };
}
const minuscule = (t) => String(t).charAt(0).toLowerCase() + String(t).slice(1);

// Les jalons de l'étape ⓪. Aucun n'est vrai par inaction : un signalement demande un clic, un constat
// demande chaque point jugé.
function jalonsSecurite(e, R) {
  const S = R.securite, sec = (e && e.securite) || securiteNeuve();
  const faux = S.points.filter((x) => !x.ok).map((x) => x.id);
  const lib = (id) => (S.points.find((x) => x.id === id) || {}).lib || id;
  const L = [];
  if (faux.length) {
    const bon = (sec.signaux || []).find((g) => !g.apresArret && faux.every((id) => (g.points || []).includes(id)));
    const g0 = (sec.signaux || [])[0];
    const fait = bon ? `signalé : ${faux.map(lib).join(', ')}`
      : g0 ? `signalé${g0.apresArret ? ' après l’arrêt du chef de quai' : ''} : ${(g0.points || []).map(lib).join(', ') || 'rien de précis'}`
        : (sec.arrete ? 'arrêté par le chef de quai avant d’avoir signalé' : 'rien signalé');
    L.push({ id: 'securiteSignalee', lib: 'Danger signalé avant de décharger', fait, attendu: `signaler : ${faux.map(lib).join(', ')}`, ok: !!bon });
  }
  const rep = sec.rep || {};
  const juges = S.points.filter((x) => rep[x.id]);
  const justes = S.points.every((x) => rep[x.id] === (x.ok ? 'ok' : 'ko'));
  L.push({ id: 'securiteConstat', lib: 'Constat de sécurité juste',
    fait: juges.length ? S.points.map((x) => `${x.lib} : ${rep[x.id] === 'ok' ? 'OK' : rep[x.id] === 'ko' ? 'pas OK' : '?'}`).join(' · ') : 'rien de coché',
    attendu: S.points.map((x) => `${x.lib} : ${x.ok ? 'OK' : 'pas OK'}`).join(' · '), ok: justes });
  return L;
}

// Les jalons de l'inspection sur la scène (D-4) : un par défaut (`ok: false`), « signalé avant de décharger » (le point est dans un
// signal envoyé avant l'arrêt du chef de quai), puis « aucun faux signalement » (au moins un signal, et aucun ne touche un point
// conforme ni ne tombe à côté). Aucun n'est vrai par inaction. Les `lib` restent NEUTRES (ils peuvent se lire pendant la séance) :
// le défaut est nommé dans `attendu`, qui ne se lit qu'au bilan.
function jalonsScene(e, R) {
  const S = R.securite, sec = (e && e.securite) || securiteNeuve(true);
  const signaux = Array.isArray(sec.signaux) ? sec.signaux : [];
  const point = (id) => S.points.find((x) => x.id === id) || null;
  const qui = (S.signaler && S.signaler.qui) || 'le chef de quai';
  const L = [];
  S.points.filter((x) => !x.ok).forEach((x, i) => {
    const avant = signaux.some((g) => !g.apresArret && (g.points || []).includes(x.id));
    const apres = !avant && signaux.some((g) => (g.points || []).includes(x.id));
    L.push({ id: `securite-${x.id}`, lib: `Danger n° ${i + 1} signalé avant de décharger`,
      fait: avant ? 'signalé avant de décharger' : apres ? `signalé seulement après l’arrêt de ${qui}` : sec.fait ? 'jamais signalé' : 'pas signalé',
      attendu: `signaler : ${x.lib}`, ok: avant });
  });
  const faux = signaux.filter((g) => (g.rien || 0) > 0 || (g.points || []).some((id) => point(id) && point(id).ok));
  const aTort = [...new Set([].concat(...faux.map((g) => (g.points || []).filter((id) => point(id) && point(id).ok))))].map((id) => point(id).lib);
  const cote = faux.reduce((t, g) => t + (g.rien || 0), 0);
  L.push({ id: 'securite-aucun-faux', lib: 'Aucun faux signalement',
    fait: !signaux.length ? 'rien signalé' : !faux.length ? 'aucun faux signalement'
      : [aTort.length ? `signalé à tort : ${aTort.join(', ')}` : '', cote ? `${cote} marque${cote > 1 ? 's' : ''} à côté de tout danger` : ''].filter(Boolean).join(' · '),
    attendu: 'au moins un signalement, et aucun sur un point conforme ni à côté', ok: signaux.length > 0 && !faux.length });
  return L;
}

// Quai « déjà réceptionné » : les jalons du contenu sur les messages (`jalonsDossier.avant`, le diagnostic),
// ceux de la vue sur le blocage, puis ceux du contenu après (`apres`, la protestation). Aucun n'est vrai par
// inaction : « aucune palette conforme bloquée » demande d'avoir bloqué quelque chose.
function jalonsControle(db, Q, R) {
  const e = db && db.quais && db.quais[Q.id];
  const L = [];
  let pts = 0, max = 0;
  const ajouter = (l) => {
    const compte = l.compte !== false;
    if (compte) { max++; if (l.ok) pts++; }
    L.push(Object.assign({}, l, { ok: !!l.ok, compte }));
  };
  const D = Q.jalonsDossier || {};
  // Un jalon de contenu qui plante sur une base incomplète ne fait rien tomber : il manque, c'est tout.
  const lire = (f) => { try { return (f && f(db || {}, e || null)) || []; } catch (x) { return []; } };
  lire(D.avant).forEach(ajouter);
  const s = (p) => (e && e.palettes && e.palettes[p.id]) || {};
  const aBloquer = R.palettes.filter((p) => p.bloquer);
  const bloquees = R.palettes.filter((p) => s(p).bloque);
  aBloquer.forEach((p) => ajouter({ id: `${p.id}-bloquee`, lib: `${p.id} bloquée (qualité)`, fait: s(p).bloque ? 'bloquée' : 'non bloquée',
    attendu: 'bloquée', ok: !!s(p).bloque }));
  const aTort = bloquees.filter((p) => !p.bloquer);
  ajouter({ id: 'bloque-autres', lib: 'Aucune palette conforme bloquée',
    fait: bloquees.length ? `bloquée${bloquees.length > 1 ? 's' : ''} : ${bloquees.map((p) => p.id).join(', ')}` : 'aucune palette bloquée',
    attendu: `seulement ${aBloquer.map((p) => p.id).join(', ')}`, ok: bloquees.length > 0 && !aTort.length });
  lire(D.apres).forEach(ajouter);
  return { L, pts, max };
}

// Les étapes à donner à `creerEntreprise` : un jalon compté = une étape du suivi.
export function etapesQuai(Q) {
  const ids = jalonsQuai({}, Q).L.filter((l) => l.compte);
  return ids.map(({ id, lib }) => ({
    id, titre: lib,
    // Les jalons de la dépose dirigée font UNE ligne du bandeau de fin (jamais « P3 ✗ » : la case nommée fausse donnerait la réponse).
    // `ponderer` (contenus/ponderation.js) garde ce groupe tant que le barème ne donne pas de bloc à ces jalons.
    ...(/^depose-/.test(id) ? { groupe: GROUPE_DEPOSE } : {}),
    verifier(db) {
      const l = jalonsQuai(db, Q).L.find((x) => x.id === id);
      return { status: l && l.ok ? 'ok' : 'attente' };
    },
  }));
}

// Les étapes d'un quai TIRÉ PAR ÉLÈVE (ENT-4.4, `core/tirage.js`) : `quaiDe(graine)` rend la
// déclaration du quai d'une graine. Les identifiants des jalons dépendent du jeu (la réserve écrite
// de P3 n'existe que si P3 porte un aléa) : l'étape n° k est donc le k-ième jalon compté du jeu DE LA
// BASE lue. Le tirage garantit la même structure à tous (même nombre de jalons, dans le même ordre :
// la suite de tests le vérifie sur des centaines de graines).
// `niveauDe(db)` (facultatif, lot 4 du 17/10/2026) : le niveau de l'élève passé en second argument à `quaiDe`, comme le fait le
// moteur (`quai: (graine, { niveau }) => …`, voir `entreprise.js`) ; absent, 'standard' pour tous (ENT-4.4, qui ne lit pas le niveau).
export function etapesQuaiTire(quaiDe, graineDeBase, niveauDe = () => 'standard') {
  const ref = jalonsQuai({}, quaiDe('', { niveau: 'standard' })).L.filter((l) => l.compte);
  let nRes = 0;
  return ref.map((l, k) => ({
    id: `j${k + 1}`,
    titre: /-reserve$/.test(l.id) ? `Réserve écrite n° ${++nRes}` : l.lib,
    verifier(db) {
      const L = jalonsQuai(db, quaiDe(graineDeBase(db), { niveau: niveauDe(db) })).L.filter((x) => x.compte);
      return { status: L[k] && L[k].ok ? 'ok' : 'attente' };
    },
  }));
}

// La note d'évaluation sur 20 (brief §6) : 15 points de réception (jalons) + 5 de rapidité
// (hors froid et temps réel), seulement si la réception est COMPLÈTE, et en proportion des
// palettes justes. Seuils et poids viennent de `quai.note` (réglage du contenu).
export function noteQuai(db, Q) {
  const R = reglages(Q);
  const N = Object.assign({ reception: 15, horsFroid: [[20, 3], [25, 2], [30, 1]], reel: [[12, 2], [16, 1]], tiersTemps: 4 / 3 }, Q.note || {});
  const e = (db && db.quais && db.quais[Q.id]) || etatNeuf(Q);
  const { L, pts, max } = jalonsQuai(db, Q);
  const s = (p) => (e.palettes && e.palettes[p.id]) || paletteNeuve();
  const KS = R.camions.map((_, ci) => K(e, ci));
  const complet = R.palettes.every((p) => s(p).decision) && KS.every((k) => k.rentre && k.signe);
  const justes = R.palettes.filter((p) => paletteJuste(effective(p, e, R), s(p), R.froid)).length;
  const prop = R.palettes.length ? justes / R.palettes.length : 0;
  const fac = e.tiersTemps ? N.tiersTemps : 1;
  // Plusieurs camions : la rapidité se lit sur le lot resté le plus longtemps hors du froid.
  const froidMax = Math.max(0, ...KS.map((k) => k.froid || 0));
  // Quai sans froid : la rapidité ne se lit que sur le temps réel.
  const ptsFroid = R.froid && KS.every((k) => k.decharge) ? palier(froidMax, N.horsFroid) : 0;
  const ptsReel = palier((e.reel || 0) / 60, N.reel.map(([m, p]) => [m * fac, p]));
  const maxVitesse = (R.froid && N.horsFroid[0] ? N.horsFroid[0][1] : 0) + (N.reel[0] ? N.reel[0][1] : 0);
  const vitesse = complet ? (ptsFroid + ptsReel) * prop : 0;
  const reception = max ? pts / max * N.reception : 0;
  const note = Math.round((reception + vitesse) * 100) / 100;
  return { score: note, max: N.reception + maxVitesse, L, pts, nJalons: max, complet, justes, nPalettes: R.palettes.length,
    prop, ptsFroid, ptsReel, vitesse, reception, froid: froidMax, reel: e.reel || 0, tiersTemps: !!e.tiersTemps, N, fac, sansFroid: !R.froid };
}

/* ============================================================ palette en 3D */
// Projection isométrique. Rotation de la palette : on change les coordonnées (i, j) selon la vue.
function tourner(i, j, W, D, r) {
  if (r === 0) return [i, j];
  if (r === 1) return [D - 1 - j, i];
  if (r === 2) return [W - 1 - i, D - 1 - j];
  return [j, W - 1 - i];
}
function tournerDir([dx, dy], r) {
  if (r === 0) return [dx, dy];
  if (r === 1) return [-dy, dx];
  if (r === 2) return [-dx, -dy];
  return [dy, -dx];
}
function palette3d(p, s, repereOn) {
  const r = s.vue, W2 = (r % 2) ? p.D : p.W, D2 = (r % 2) ? p.W : p.D;
  const S = 34, H = 26;
  const cx = 230 + (D2 - W2) * S * 0.866 / 2;
  const base = 330 - (W2 + D2) * S * 0.5;
  const P = (a, b, z) => [cx + (a - b) * S * 0.866, base + (a + b) * S * 0.5 - z * H];
  const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#5e4424" stroke-width="1" ${extra}/>`;
  let o = '';
  const z0 = -0.55, z1 = 0;
  o += poly([P(0, 0, z1), P(W2, 0, z1), P(W2, D2, z1), P(0, D2, z1)], '#c9a46b');
  o += poly([P(W2, 0, z0), P(W2, D2, z0), P(W2, D2, z1), P(W2, 0, z1)], '#a07a43');
  o += poly([P(0, D2, z0), P(W2, D2, z0), P(W2, D2, z1), P(0, D2, z1)], '#8a6634');
  const manque = new Set(p.manque);
  // Carton repère : en vue de face, le plus haut à gauche (i = 0, j = D-1, couche la plus haute présente).
  let kRep = p.L - 1; while (kRep > 0 && manque.has(`0,${p.D - 1},${kRep}`)) kRep--;
  const repere = repereOn ? `0,${p.D - 1},${kRep}` : null;
  const boites = [];
  for (let k = 0; k < p.L; k++) for (let i = 0; i < p.W; i++) for (let j = 0; j < p.D; j++) {
    if (manque.has(`${i},${j},${k}`)) continue;
    const [a, b] = tourner(i, j, p.W, p.D, r);
    const av = p.avarie[`${i},${j},${k}`];
    boites.push({ a, b, k, av: av ? tournerDir(av, r) : null, rep: `${i},${j},${k}` === repere });
  }
  boites.sort((x, y) => (x.a + x.b + x.k) - (y.a + y.b + y.k) || x.k - y.k);
  const fr = tournerDir([0, 1], r), frb = tournerDir([0, -1], r);
  // Multi-références : chaque carton appartient à la référence de sa couche (bande de couleur sur ses
  // côtés, étiquette de SA référence). Étiquette avant déchirée : on en pose aussi sur la face arrière.
  const refDe = (k) => (p.refs ? p.refs.find((x) => x.couches.includes(k)) : null);
  const arriere = p.etiqAvant === 'dechiree';
  for (const { a, b, k, av, rep } of boites) {
    const top = [P(a, b, k + 1), P(a + 1, b, k + 1), P(a + 1, b + 1, k + 1), P(a, b + 1, k + 1)];
    const droite = [P(a + 1, b, k), P(a + 1, b + 1, k), P(a + 1, b + 1, k + 1), P(a + 1, b, k + 1)];
    const gauche = [P(a, b + 1, k), P(a + 1, b + 1, k), P(a + 1, b + 1, k + 1), P(a, b + 1, k + 1)];
    o += poly(top, '#e6cfa3') + poly(droite, '#c9a26a') + poly(gauche, '#b08550');
    o += `<line x1="${((top[0][0] + top[3][0]) / 2).toFixed(1)}" y1="${((top[0][1] + top[3][1]) / 2).toFixed(1)}" x2="${((top[1][0] + top[2][0]) / 2).toFixed(1)}" y2="${((top[1][1] + top[2][1]) / 2).toFixed(1)}" stroke="#a88a5a" stroke-width="2"/>`;
    const rf = refDe(k);
    const surFace = (F) => (u, v) => [F[0][0] + (F[1][0] - F[0][0]) * u + (F[3][0] - F[0][0]) * v, F[0][1] + (F[1][1] - F[0][1]) * u + (F[3][1] - F[0][1]) * v];
    if (rf && rf.teinte) for (const F of [droite, gauche]) { const m = surFace(F); o += `<polygon data-q-bande points="${[m(0, .74), m(1, .74), m(1, .9), m(0, .9)].map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="${rf.teinte}"/>`; }
    if (rep) {
      const c = [(top[0][0] + top[2][0]) / 2, (top[0][1] + top[2][1]) / 2];
      o += `<g data-q-repere><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="15" ry="9" fill="#f6f1e4" style="stroke:var(--ardoise)" stroke-width="1.5"/><text x="${c[0].toFixed(1)}" y="${(c[1] + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" style="fill:var(--ardoise)">${ech(p.id)}</text></g>`;
    }
    // L'étiquette du carton, sur la face avant de la palette quand elle est tournée vers l'élève
    // (et sur la face arrière pour une palette dont l'étiquette avant est déchirée).
    const etiquette = (dir, cle, dechiree) => {
      const F = dir[0] === 1 && dir[1] === 0 ? droite : dir[0] === 0 && dir[1] === 1 ? gauche : null;
      if (!F) return '';
      const m = surFace(F);
      const ln = (u1, v1_, u2, v2) => `<line x1="${m(u1, v1_)[0].toFixed(1)}" y1="${m(u1, v1_)[1].toFixed(1)}" x2="${m(u2, v2)[0].toFixed(1)}" y2="${m(u2, v2)[1].toFixed(1)}" stroke="#777" stroke-width="1"/>`;
      const corps = dechiree
        ? poly([m(.3, .2), m(.52, .2), m(.46, .3), m(.58, .38), m(.5, .5), m(.62, .62), m(.3, .62)], '#f6f1e4', 'stroke-width=".6" data-q-dechiree')
        : `${poly([m(.3, .2), m(.75, .2), m(.75, .62), m(.3, .62)], '#f6f1e4', 'stroke-width=".6"')}${ln(.36, .35, .68, .35)}${ln(.36, .48, .6, .48)}`;
      return `<g class="quai-etiq-clic" data-q-etiq data-k="${ech(cle)}"><title>Lire l'étiquette</title>${corps}</g>`;
    };
    o += etiquette(fr, rf ? rf.ref : 'avant', arriere);
    if (arriere) o += etiquette(frb, 'arriere', false);
    // Carton écrasé : visible seulement si son côté abîmé fait face à l'élève.
    const face = av && av[0] === 1 && av[1] === 0 ? droite : av && av[0] === 0 && av[1] === 1 ? gauche : null;
    if (face) {
      const m = (u, v) => [face[0][0] + (face[1][0] - face[0][0]) * u + (face[3][0] - face[0][0]) * v, face[0][1] + (face[1][1] - face[0][1]) * u + (face[3][1] - face[0][1]) * v];
      o += `<g data-q-avarie>${poly([m(.15, .25), m(.5, .05), m(.85, .3), m(.75, .8), m(.35, .9), m(.2, .6)], '#6e4c22', 'opacity=".85"')}`;
      o += `<polyline points="${[m(.25, .5), m(.45, .35), m(.55, .6), m(.75, .45)].map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#2b1c0b" stroke-width="1.5"/></g>`;
    }
  }
  o += `<text x="230" y="372" text-anchor="middle" font-size="12" style="fill:var(--encre-douce)">${ech(p.id)} · ${VUES[r]}</text>`;
  return o;
}

/* ============================================ la palette filmée (vue de face) */
// Pour le déchargement et la chambre froide. (x, y) = milieu du bas de la palette ; e = échelle.
const f1 = (n) => n.toFixed(1);
const pts = (a) => a.map((q) => q.map(f1).join(',')).join(' ');
function paletteFace(p, x, y, e, o = {}) {
  const cw = 32 * e, ch = 27 * e, W = p.W, Lc = p.L, w = W * cw, h = Lc * ch;
  const dx = p.D * 7 * e, dy = p.D * 5.5 * e, hb = 13 * e;
  const X = x - w / 2, Y = y - hb;
  const manque = new Set(p.manque);
  let s = '';
  if (o.ombre !== false) s += `<ellipse cx="${f1(x + dx / 2)}" cy="${f1(y + 2 * e)}" rx="${f1(w * .62 + dx / 2)}" ry="${f1(9 * e)}" fill="#000" opacity=".28"/>`;
  s += `<polygon points="${pts([[X, Y], [X + w, Y], [X + w + dx, Y - dy], [X + dx, Y - dy]])}" fill="#b98f55"/>`;
  s += `<polygon points="${pts([[X + w, Y], [X + w + dx, Y - dy], [X + w + dx, y - dy], [X + w, y]])}" fill="#7d5a2c"/>`;
  s += `<rect x="${f1(X)}" y="${f1(Y)}" width="${f1(w)}" height="${f1(hb * .35)}" fill="#c99d61"/>`;
  for (const u of [0, .5, 1]) {
    const bx = X + (w - 14 * e) * u;
    s += `<rect x="${f1(bx)}" y="${f1(Y + hb * .35)}" width="${f1(14 * e)}" height="${f1(hb * .65)}" fill="#a77d45"/>`;
  }
  s += `<rect x="${f1(X)}" y="${f1(y - hb * .2)}" width="${f1(w)}" height="${f1(hb * .2)}" fill="#8f6a37"/>`;
  const top = Lc - 1;
  const colPleine = (i) => { for (let j = 0; j < p.D; j++) if (!manque.has(`${i},${j},${top}`)) return true; return false; };
  for (let k = 0; k < Lc; k++) {
    for (let i = 0; i < W; i++) {
      if (k === top && !colPleine(i)) continue;
      const cx = X + i * cw, cy = Y - (k + 1) * ch;
      s += `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(cw)}" height="${f1(ch)}" fill="${(i + k) % 2 ? '#d2ad73' : '#c9a265'}" stroke="#6e5128" stroke-width="${f1(Math.max(.5, .9 * e))}"/>`;
      s += `<line x1="${f1(cx)}" y1="${f1(cy + ch * .5)}" x2="${f1(cx + cw)}" y2="${f1(cy + ch * .5)}" stroke="#ad8a55" stroke-width="${f1(1.4 * e)}"/>`;
    }
  }
  const hTop = (colPleine(W - 1) ? Lc : Lc - 1) * ch, hTopG = (colPleine(0) ? Lc : Lc - 1) * ch;
  s += `<polygon points="${pts([[X + w, Y], [X + w + dx, Y - dy], [X + w + dx, Y - dy - hTop], [X + w, Y - hTop]])}" fill="#a98450" stroke="#6e5128" stroke-width="${f1(.8 * e)}"/>`;
  s += `<polygon points="${pts([[X, Y - hTopG], [X + w, Y - hTop], [X + w + dx, Y - dy - hTop], [X + dx, Y - dy - hTopG]])}" fill="#e2c48e" stroke="#6e5128" stroke-width="${f1(.8 * e)}"/>`;
  s += `<polygon points="${pts([[X, Y], [X + w, Y], [X + w + dx, Y - dy], [X + w + dx, Y - dy - hTop], [X + w, Y - hTop], [X, Y - hTopG]])}" fill="url(#quaiFilm)"/>`;
  for (let u = 1; u < 4; u++) {
    const yy = Y - h * u / 4;
    s += `<line x1="${f1(X)}" y1="${f1(yy + 6 * e)}" x2="${f1(X + w + dx)}" y2="${f1(yy - dy - 4 * e)}" stroke="#fff" stroke-opacity=".22" stroke-width="${f1(1.2 * e)}"/>`;
  }
  const ew = 30 * e, eh = 22 * e, ex = X + w / 2 - ew / 2, ey = Y - h * .55;
  s += `<rect x="${f1(ex)}" y="${f1(ey)}" width="${f1(ew)}" height="${f1(eh)}" fill="#f7f4ec" stroke="#888" stroke-width="${f1(.6 * e)}"/>`;
  if (e > .3) s += `<text x="${f1(ex + ew / 2)}" y="${f1(ey + eh * .68)}" text-anchor="middle" font-size="${f1(12 * e)}" font-weight="700" fill="#0b1f6b" font-family="system-ui,sans-serif">${ech(p.id)}</text>`;
  return s;
}
const DEFS_FILM = `<linearGradient id="quaiFilm" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/>
  <stop offset=".6" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>`;

const silhouette = (t = 48) => `<svg viewBox="0 0 60 60" width="${t}" height="${t}" aria-hidden="true"><circle cx="30" cy="20" r="11" style="fill:var(--filet)"/><path d="M8 58c2-14 11-22 22-22s20 8 22 22z" style="fill:var(--filet)"/></svg>`;
function signature(c, graine) {
  const g = graine === 1 ? [18, 34, 30, 8, 46, 40] : [22, 40, 16, 6, 52, 30];
  const d = `M8 ${g[1]} C ${g[0]} 4, ${g[0] + 20} 4, ${g[0] + 10} ${g[1]} S ${g[0] + 2} 50, ${g[0] + 24} 30`
    + ` C ${g[0] + 40} ${g[2]}, ${g[0] + 50} ${g[3] + 40}, ${g[0] + 64} 28`
    + ` S ${g[0] + 86} ${g[4]}, ${g[0] + 100} 26 S ${g[0] + 124} ${g[5]}, ${g[0] + 150} 24`;
  return `<svg viewBox="0 0 190 54"><path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

const reduit = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
// L'afficheur du thermomètre à sonde : « −19,6 ».
const lcd = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',');

/* ==================================================================== la vue */
export function creerQuai(Q, opts = {}) {
  const R = reglages(Q);
  const EVAL = !!opts.copie;
  const A = R.aides;
  const C = R.couts;
  const M = R.multi;
  // Les palettes de chaque camion ; `ca(e)` = le camion montré aux étapes ②③④ (le seul, ou celui
  // que l'élève a choisi parmi les camions déchargés).
  const PAL = R.camions.map((_, ci) => R.palettes.filter((p) => p.camion === ci));
  const cam = R.camions[0] || {};
  const ca = (e) => (M ? (e.actif || 0) : 0);
  const hhmm = (m) => { const t = R.depart + m; const h = Math.floor(t / 60) % 24, mm = Math.floor(t % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}${t % 1 ? '’30' : ''}`; };
  const formule = (ci = 0) => { const n = PAL[ci].length; return `${n} palettes × ${fmtMin(R.D.parPalette)} + ${fmtMin(R.D.ouverture)} d’ouverture = ${fmtMin(dureeDechargement(n, R.D))}`; };
  const fictif = (nom, f) => `${ech(nom)}${f ? ' (fictif)' : ''}`;
  const lieuMin = R.lieu.nom.charAt(0).toLowerCase() + R.lieu.nom.slice(1);
  const F = R.froid, SEC = R.securite;
  const ISO = R.iso;
  // Un quai en deux séances (lot 1) : ARRET = la vue s'arrête au déchargement (`{ texte }`), COMMENCE = elle part du contrôle, DOC = le nom du document.
  const ARRET = R.arretDech, COMMENCE = R.commence, DOC = R.document;
  // Le mode scène (D-4) : l'inspection se joue sur le quai iso ; sinon la liste OK / Pas OK de l'étape ⓪ (inchangée).
  const SCENE = R.scene, LISTE = !!SEC && !R.scene;
  const SEUIL_SECU = SCENE ? 2 : 1;   // à partir de quelle étape il faut avoir figé l'inspection
  const ecarts = verifierQuai(Q);
  if (ecarts.length) throw new Error(`quai ${Q.id} : ${ecarts.join(' ; ')}`);
  // Le rendu iso ne sait (pour l'instant) qu'un quai sans froid à un camion : on le dit au chargement.
  if (ISO && (F || M || R.controle)) throw new Error(`quai ${Q.id} : \`rendu: 'iso'\` demande un quai sans froid (\`froid: false\`), à un seul camion`);
  const zoneMin = minuscule(R.zone.nom);
  // Qui sort les palettes : le chauffeur au transpalette, ou un cariste au chariot élévateur.
  const CARISTE = R.D.par === 'cariste';
  // Sur le quai iso (D-4, étape 5) le cariste conduit un chariot frontal dessiné à l'échelle du décor (`planChariot`, `imageIsoChariot`).
  const CARISTE_ISO = ISO && CARISTE;
  const quiSort = CARISTE ? (R.D.nom || 'Le cariste') : 'Le chauffeur';
  // La dépose dirigée (lot 2, voir en tête de la section « dépose dirigée ») : la géométrie des cases remplace les places d'arrivée
  // (`placesIso` / `zoneIso`) ; les palettes sortent dans l'ordre inverse du chargement (P4, P3, P2, P1). JOUEE : la dépose se joue
  // à l'étape ② (pas sous `commence`, où les palettes sont déjà dans les cases justes).
  const DEPOSE = R.depose, GEO = DEPOSE ? geometrieDepose(DEPOSE.cases, DEPOSE.passage) : null;
  const JOUEE = !!DEPOSE && !COMMENCE;
  const ORDRE_DEP = DEPOSE ? PAL[0].map((p) => p.id).reverse() : [];
  const OPTS_DEP = { copie: EVAL, grise: DEPOSE ? DEPOSE.grise : 'garde' };
  const secuFaite = (e) => !SEC || !!(e.securite && e.securite.fait);
  const accepte = (s) => s.decision === 'accepter' || s.decision === 'reserves';
  const st = (e, p) => e.palettes[p.id];
  // Quai sans froid : la fiche n'a pas de case « température », les motifs sont ceux que la séance garde.
  const CONST = constats(R.u).filter((c) => R.froid || c.k !== 'temp');
  const MOTIFS_Q = R.motifs.filter((m) => m !== 'aucun');
  const nomCam = (ci) => `camion ${R.camions[ci].nom}`;
  // L'état d'écran : ce qui n'est pas du travail (chef de quai affiché, animation en cours…).
  // `tente` : la palette dont « Valider » a été cliqué avec un manque (le message s'écrit sous la case) ;
  // `sonde` : la palette qui vient d'être sondée (l'afficheur se stabilise une fois, pas à chaque redessin).
  const ui = { chef4: false, arme: false, arme4: false, armeRaz: false, anim: null, lancer: false, jouerCf: false, focus: null,
    tente: null, tropMotifs: false, sonde: null, arretSecu: false, arrivee: false, rejeu1: false, anim1: null, t0a: null,
    vueScene: 'dehors', levee: null, armeScene: false,
    // Dépose dirigée : le texte à annoncer (région `aria-live`) au prochain dessin ; `visDep` / `animDep` : l'image et le contrôleur d'une
    // animation en cours (étape B ; toujours null ici, les pauses se dessinent depuis la base par `visDe`).
    annonceDep: '', visDep: null, animDep: null };

  // Chaque geste avance l'horloge du quai, et le temps hors froid de CHAQUE lot sorti du camion et
  // pas encore rentré en chambre froide.
  function avancer(e, min, texte) {
    e.minute += min;
    if (F) R.camions.forEach((_, ci) => { const k = K(e, ci); if (k.decharge && !e.fini && !k.rentre) k.froid += min; });
    e.journal.unshift(`${hhmm(e.minute)} — ${texte} (+${fmtMin(min)})`);
    if (e.journal.length > 80) e.journal.length = 80;
  }

  /* ------------------------------------------------------- déchargement animé */
  // Coordonnées dans la photo du quai (1280 × 853 pour Picard). Tout se déduit de la porte.
  const PH = Object.assign({ porte: { x0: 455, x1: 786, y0: 352, y1: 585 }, cadre: [0, 190, 1280, 663], largeur: 1280, hauteur: 853 }, Q.photos || {});
  const PORTE = PH.porte;
  // `photos.decor: 'fixe'` : une photo prise porte OUVERTE (remorque visible, ENT-5.4). Ni porte qui se
  // lève, ni remorque dessinée : la photo reste telle quelle, et le cadre descend sous elle sur une bande
  // de sol dessinée où le chariot pose les palettes (`places` déclarées dans cette bande). `porte` y
  // désigne l'ouverture de la remorque (d'où sort le chariot). `horloge: [x, y]` place l'horloge du quai.
  const FIXE = PH.decor === 'fixe';
  const OUV = { L: PORTE.x0 + 23, R: PORTE.x1 - 23, T: PORTE.y0 + 20, B: PORTE.y1 - 19 };
  const VP = { x: (PORTE.x0 + PORTE.x1) / 2, y: PORTE.y0 + 106 }, PROF = .36;
  const SOL_Y0 = OUV.B, SOL_Y1 = PH.cadre[1] + PH.cadre[3] - 18;
  // Places au sol, de part et d'autre de l'allée centrale : les 5 de la maquette d'abord, puis
  // un rang de plus à droite, puis un second rang en retrait (ENT-4.2 en aura 8).
  const PLACES = PH.places || [[150, 800], [320, 768], [466, 738], [808, 738], [985, 768], [1150, 805], [245, 700], [1060, 700], [80, 712], [1225, 722]];
  // Rendu iso (maquette) : la porte se lève en 1,8 s, puis le chauffeur tire chaque palette en 6 s.
  const [T_OUVRE, T_PORTE, T_DEB, T_PAL, T_TRAJET] = ISO ? [1800, 1800, 1800, 6800, 6000] : [900, 2000, 2700, 2100, 1850];
  // Au chariot (quai iso) le trajet est celui de `planChariot` : la fin et l'instant où chaque palette est posée en viennent, et les palettes sortent dans l'ordre inverse du chargement.
  const fin = (n) => (CARISTE_ISO ? planC().fin + 200 : T_DEB + n * T_PAL + 200);
  const tPoseN = (i) => (CARISTE_ISO ? planC().tPose[i] : T_DEB + i * T_PAL + T_TRAJET);
  const fileP = (P) => (CARISTE_ISO ? P.slice().reverse() : P);
  // La légende de fin du déchargement, au quai iso. Quand le quai s'arrête là (`arret`), personne n'attend de signature.
  const legFinIso = (N, e) => `${hhmm(e.minute)} — ${N > 1 ? `Les ${N} palettes sont en ${zoneMin}.` : `La palette est en ${zoneMin}.`}${ARRET ? '' : ' Le chauffeur attend ta signature.'}`;
  let planMemo = null;
  function planC() {
    if (!planMemo) { const P = PAL[0]; planMemo = planChariot({ gab: P.map(gabarit), places: placesIso(P), xPorte: ISO_X + 0.4, ySlot: ISO_YDEP, t0: T_DEB }); }
    return planMemo;
  }
  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const echelle = (y) => .42 + (y - SOL_Y0) / (SOL_Y1 - SOL_Y0) * .58;

  function interieur(restantes, N) {
    const { L, R: Rr, T, B } = OUV;
    const pr = (x, y, k) => [VP.x + (x - VP.x) * k, VP.y + (y - VP.y) * k];
    const [l2, t2] = pr(L, T, PROF), [r2, b2] = pr(Rr, B, PROF);
    const pw = PORTE.x1 - PORTE.x0, ph = PORTE.y1 - PORTE.y0;
    let s = `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#11161b"/>`;
    s += `<rect x="${L - 14}" y="${T - 14}" width="${Rr - L + 28}" height="${B - T + 14}" fill="#a7afb5"/>`;
    s += `<rect x="${L - 4}" y="${T - 4}" width="${Rr - L + 8}" height="${B - T + 4}" fill="#3a4148"/>`;
    s += `<polygon points="${pts([[L, T], [Rr, T], [r2, t2], [l2, t2]])}" fill="#b8c1c7"/>`;
    s += `<polygon points="${pts([[L, T], [l2, t2], [l2, b2], [L, B]])}" fill="#8f999f"/>`;
    s += `<polygon points="${pts([[Rr, T], [r2, t2], [r2, b2], [Rr, B]])}" fill="#9ea7ad"/>`;
    s += `<polygon points="${pts([[L, B], [Rr, B], [r2, b2], [l2, b2]])}" fill="#5f676c"/>`;
    s += `<rect x="${f1(l2)}" y="${f1(t2)}" width="${f1(r2 - l2)}" height="${f1(b2 - t2)}" fill="#7f8a92"/>`;
    s += `<rect x="${f1(l2 + 18)}" y="${f1(t2 + 3)}" width="${f1(r2 - l2 - 36)}" height="9" rx="2" fill="#8d979f"/>`;
    s += `<line x1="${VP.x}" y1="${T + 6}" x2="${VP.x}" y2="${f1(t2 + 2)}" stroke="#ffffff" stroke-width="5" opacity=".75"/>`;
    for (const k of [.82, .64, .48]) {
      const [a, b] = pr(L, T, k), [c, d] = pr(L, B, k), [ee] = pr(Rr, T, k);
      s += `<line x1="${f1(a)}" y1="${f1(b)}" x2="${f1(c)}" y2="${f1(d)}" stroke="#a7afb6" stroke-width="2"/>`;
      s += `<line x1="${f1(ee)}" y1="${f1(b)}" x2="${f1(ee)}" y2="${f1(d)}" stroke="#b5bcc2" stroke-width="2"/>`;
    }
    for (let u = 1; u < 8; u++) {
      const x = L + (Rr - L) * u / 8, [x2] = pr(x, B, PROF);
      s += `<line x1="${f1(x)}" y1="${B}" x2="${f1(x2)}" y2="${f1(b2)}" stroke="#6c757b" stroke-width="1"/>`;
    }
    // Palettes encore dans la remorque, deux par rang, les plus proches devant.
    const rangs = Math.max(1, Math.ceil(N / 2)), pas = Math.min(.24, .6 / rangs);
    const places = [];
    restantes.forEach((p, m) => {
      const rang = Math.floor(m / 2), cote = m % 2 ? 1 : -1;
      const k = 1 - rang * pas - .04;
      const [x, y] = pr(VP.x + cote * 62, B - 2, k);
      places.push([p, x, y, .42 * k]);
    });
    places.reverse().forEach(([p, x, y, e]) => { s += paletteFace(p, x, y, e, { ombre: false }); });
    s += `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#1c3442" opacity=".30"/>`;
    s += `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#a9d2f0" opacity=".08"/>`;
    s += `<polygon points="${pts([[L - 6, B], [Rr + 6, B], [Rr + 20, PORTE.y1], [L - 20, PORTE.y1]])}" fill="#6b7279"/>`;
    for (let u = 0; u < 14; u++) {
      const x = L - 20 + (Rr - L + 40) * (u + .5) / 14;
      s += `<rect x="${f1(x - 7)}" y="${PORTE.y1 - 5}" width="7" height="5" fill="${u % 2 ? '#1d1d1d' : '#e3b21b'}"/>`;
    }
    return s;
  }
  // Transpalette électrique + chauffeur (silhouette sans visage).
  function transpalette(x, y, e, pas, wPal) {
    let s = '';
    const bx = x - wPal * .18, by = y + 7 * e;
    s += `<ellipse cx="${f1(bx)}" cy="${f1(by + 2 * e)}" rx="${f1(30 * e)}" ry="${f1(6 * e)}" fill="#000" opacity=".3"/>`;
    s += `<rect x="${f1(bx - 22 * e)}" y="${f1(by - 44 * e)}" width="${f1(44 * e)}" height="${f1(44 * e)}" rx="${f1(5 * e)}" fill="#d9a514" stroke="#5b4508" stroke-width="${f1(e)}"/>`;
    s += `<rect x="${f1(bx - 22 * e)}" y="${f1(by - 44 * e)}" width="${f1(44 * e)}" height="${f1(10 * e)}" rx="${f1(4 * e)}" fill="#2b2b2b"/>`;
    s += `<rect x="${f1(bx - 16 * e)}" y="${f1(by - 26 * e)}" width="${f1(32 * e)}" height="${f1(4 * e)}" fill="#2b2b2b" opacity=".5"/>`;
    s += `<circle cx="${f1(bx)}" cy="${f1(by - 1 * e)}" r="${f1(6 * e)}" fill="#1c1c1c"/>`;
    const cx = bx - 58 * e, sol = by + 6 * e, b = Math.sin(pas) * 7 * e, c = '#232a31';
    const hx = cx + 16 * e, hy = sol - 92 * e;
    s += `<line x1="${f1(bx - 6 * e)}" y1="${f1(by - 42 * e)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke="#2b2b2b" stroke-width="${f1(5 * e)}" stroke-linecap="round"/>`;
    s += `<g fill="${c}" stroke="${c}" stroke-linecap="round">`;
    s += `<ellipse cx="${f1(cx)}" cy="${f1(sol + 1 * e)}" rx="${f1(18 * e)}" ry="${f1(4 * e)}" fill="#000" stroke="none" opacity=".3"/>`;
    s += `<line x1="${f1(cx - 5 * e)}" y1="${f1(sol - 60 * e)}" x2="${f1(cx - 7 * e + b)}" y2="${f1(sol - 3 * e)}" stroke-width="${f1(10 * e)}"/>`;
    s += `<line x1="${f1(cx + 5 * e)}" y1="${f1(sol - 60 * e)}" x2="${f1(cx + 7 * e - b)}" y2="${f1(sol - 3 * e)}" stroke-width="${f1(10 * e)}"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 114 * e)}" width="${f1(28 * e)}" height="${f1(58 * e)}" rx="${f1(11 * e)}" stroke="none"/>`;
    s += `<line x1="${f1(cx + 8 * e)}" y1="${f1(sol - 104 * e)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke-width="${f1(8 * e)}"/>`;
    s += `<line x1="${f1(cx - 9 * e)}" y1="${f1(sol - 104 * e)}" x2="${f1(cx - 13 * e - b * .6)}" y2="${f1(sol - 70 * e)}" stroke-width="${f1(8 * e)}"/>`;
    s += `<circle cx="${f1(cx)}" cy="${f1(sol - 128 * e)}" r="${f1(12 * e)}" stroke="none"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 98 * e)}" width="${f1(28 * e)}" height="${f1(6 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 80 * e)}" width="${f1(28 * e)}" height="${f1(5 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += '</g>';
    return s;
  }
  // Chariot élévateur frontal (quai sans froid, `dechargement.par: 'cariste'`) : la palette sur les
  // fourches, le mât juste derrière elle, le cariste assis sous le toit de protection (silhouette sans
  // visage). Vu de trois quarts arrière : il recule depuis la remorque vers sa place au sol.
  function chariot(x, y, e, wPal) {
    let s = '';
    const g = x - wPal / 2 - 4 * e, sol = y + 4 * e;           // bord gauche de la palette, sol
    const c = '#232a31', jaune = '#e0a514', noir = '#22272c';
    s += `<ellipse cx="${f1(g - 44 * e)}" cy="${f1(sol + 2 * e)}" rx="${f1(56 * e)}" ry="${f1(8 * e)}" fill="#000" opacity=".3"/>`;
    // mât (deux montants) et fourches sous la palette
    s += `<rect x="${f1(g - 9 * e)}" y="${f1(sol - 150 * e)}" width="${f1(5 * e)}" height="${f1(150 * e)}" fill="${noir}"/>`;
    s += `<rect x="${f1(g - 2 * e)}" y="${f1(sol - 150 * e)}" width="${f1(5 * e)}" height="${f1(150 * e)}" fill="${noir}"/>`;
    s += `<rect x="${f1(g - 9 * e)}" y="${f1(sol - 152 * e)}" width="${f1(12 * e)}" height="${f1(5 * e)}" fill="${noir}"/>`;
    s += `<rect x="${f1(g)}" y="${f1(sol - 7 * e)}" width="${f1(wPal * .9)}" height="${f1(4 * e)}" fill="#555c63"/>`;
    // carrosserie, contrepoids, roues
    s += `<rect x="${f1(g - 82 * e)}" y="${f1(sol - 52 * e)}" width="${f1(74 * e)}" height="${f1(40 * e)}" rx="${f1(6 * e)}" fill="${jaune}" stroke="#5b4508" stroke-width="${f1(e)}"/>`;
    s += `<rect x="${f1(g - 92 * e)}" y="${f1(sol - 46 * e)}" width="${f1(16 * e)}" height="${f1(36 * e)}" rx="${f1(5 * e)}" fill="${noir}"/>`;
    s += `<circle cx="${f1(g - 22 * e)}" cy="${f1(sol - 10 * e)}" r="${f1(11 * e)}" fill="#1c1c1c"/><circle cx="${f1(g - 22 * e)}" cy="${f1(sol - 10 * e)}" r="${f1(4 * e)}" fill="#777"/>`;
    s += `<circle cx="${f1(g - 70 * e)}" cy="${f1(sol - 9 * e)}" r="${f1(9 * e)}" fill="#1c1c1c"/><circle cx="${f1(g - 70 * e)}" cy="${f1(sol - 9 * e)}" r="${f1(3.5 * e)}" fill="#777"/>`;
    // toit de protection (deux montants et le toit)
    s += `<line x1="${f1(g - 16 * e)}" y1="${f1(sol - 52 * e)}" x2="${f1(g - 18 * e)}" y2="${f1(sol - 124 * e)}" stroke="${noir}" stroke-width="${f1(4 * e)}"/>`;
    s += `<line x1="${f1(g - 74 * e)}" y1="${f1(sol - 52 * e)}" x2="${f1(g - 70 * e)}" y2="${f1(sol - 124 * e)}" stroke="${noir}" stroke-width="${f1(4 * e)}"/>`;
    s += `<rect x="${f1(g - 76 * e)}" y="${f1(sol - 128 * e)}" width="${f1(62 * e)}" height="${f1(6 * e)}" rx="${f1(2 * e)}" fill="${noir}"/>`;
    // le cariste, assis : buste, bras vers le volant, tête sans visage, gilet haute visibilité
    s += `<g fill="${c}" stroke="${c}" stroke-linecap="round">`;
    s += `<rect x="${f1(g - 58 * e)}" y="${f1(sol - 96 * e)}" width="${f1(22 * e)}" height="${f1(44 * e)}" rx="${f1(9 * e)}" stroke="none"/>`;
    s += `<rect x="${f1(g - 58 * e)}" y="${f1(sol - 84 * e)}" width="${f1(22 * e)}" height="${f1(5 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += `<rect x="${f1(g - 58 * e)}" y="${f1(sol - 70 * e)}" width="${f1(22 * e)}" height="${f1(4 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += `<line x1="${f1(g - 40 * e)}" y1="${f1(sol - 86 * e)}" x2="${f1(g - 26 * e)}" y2="${f1(sol - 66 * e)}" stroke-width="${f1(7 * e)}"/>`;
    s += `<circle cx="${f1(g - 47 * e)}" cy="${f1(sol - 106 * e)}" r="${f1(10 * e)}" stroke="none"/>`;
    s += '</g>';
    s += `<line x1="${f1(g - 30 * e)}" y1="${f1(sol - 70 * e)}" x2="${f1(g - 22 * e)}" y2="${f1(sol - 56 * e)}" stroke="${noir}" stroke-width="${f1(3 * e)}"/>`;
    return s;
  }
  // Décor fixe : la dalle du quai sous la photo, du bas de la photo au bas du cadre (béton, joints,
  // bande jaune de l'allée de sécurité au ras de la photo).
  function solFixe() {
    const [cx, cy, cw, chh] = PH.cadre, y0 = PH.hauteur, y1 = cy + chh;
    if (y1 <= y0) return '';
    let s = `<rect x="${cx}" y="${y0}" width="${cw}" height="${y1 - y0}" fill="#9a9c98"/>`;
    s += `<rect x="${cx}" y="${y0}" width="${cw}" height="10" fill="#6f716d"/>`;
    s += `<rect x="${cx}" y="${y0 + 22}" width="${cw}" height="8" fill="#e3b21b"/>`;
    for (let x = cx + 160; x < cx + cw; x += 320) s += `<line x1="${x}" y1="${y0 + 30}" x2="${x}" y2="${y1}" stroke="#8a8c88" stroke-width="2"/>`;
    return s;
  }
  // Brume froide : l'air froid tombe et coule au sol.
  function brume(t) {
    let s = '';
    for (let n = 0; n < 14; n++) {
      const d = T_OUVRE + 300 + n * 330, u = (t - d) / 4200;
      if (u <= 0 || u >= 1) continue;
      const a = Math.sin(u * Math.PI) * .72;
      const x = VP.x + (n % 2 ? 1 : -1) * (20 + (n % 5) * 40) * u, y = SOL_Y0 - 6 + 150 * u;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(80 + 170 * u)}" ry="${f1(16 + 22 * u)}" fill="#eef5fa" opacity="${a.toFixed(2)}"/>`;
    }
    return s;
  }
  /* ------------------------------------------------------------ rendu iso */
  // Les numéros des portes de la façade : celle du quai (« Quai 7 ») et ses voisines.
  const numPorte = (String(R.lieu.nom).match(/\d+/) || [null])[0];
  const PORTES = numPorte ? [String(+numPorte - 1), numPorte, String(+numPorte + 1)] : ['', '', ''];
  // La parole du chauffeur coupée en lignes de bulle (~44 caractères).
  const couper = (t, n = 44) => {
    const L = []; let l = '';
    String(t).split(/\s+/).forEach((m) => { if (l && `${l} ${m}`.length > n) { L.push(l); l = m; } else l = l ? `${l} ${m}` : m; });
    if (l) L.push(l);
    return L;
  };
  const paroleArrivee = () => cam.parole || `Bonjour, livraison ${cam.fournisseur || ''}. Voilà mon bon de livraison.`;
  // ① le camion recule à la porte en D_ARRIVEE ms ; au bout, le chauffeur descend et parle.
  const D_ARRIVEE = 5200;
  function sceneArrivee(t, e) {
    const I = projection({ unite: 54, origine: [330, 150] });
    const f = Math.min(1, t / D_ARRIVEE), ee = 1 - Math.pow(1 - f, 2.2);
    if (SCENE && e) {
      // Mode scène : le camion arrive dans l'état de la scène (chauffeur au volant, fumée…) ; la cale n'est posée qu'à l'arrêt ;
      // le chauffeur n'est descendu que si sa cabine est vide, et ne parle (bulle) qu'une fois l'inspection figée.
      const et = etatsScene(SEC, e.securite);
      return decorDehors(et, { yr: 0.35 + (8.5 - 0.35) * (1 - ee), cale: f >= 1, chauffeur: f >= 1 && et.cabine !== 'conduite', bulle: f >= 1 && !!e.securite.fait });
    }
    let s = facadeQuai(I, PORTES, R.escalier ? { escalier: true } : {}) + camionPorteur(I, X_PORTE_FACADE[1], 0.35 + (8.5 - 0.35) * (1 - ee)) + horlogeQuai(I, 0.2, 0.01, 2.35, cam.arrivee || '');
    if (f >= 1) {
      s += personne(I, 5.05, 3.2);
      const [bx, by] = I.P(5.05, 3.2, HAUT_PERSONNE);
      s += bulle(bx + 6, by - 4, couper(paroleArrivee()));
    }
    return s;
  }
  const legArrivee = (fini) => (fini ? `${cam.arrivee || ''} — Le chauffeur te remet le bon de livraison.`
    : `${cam.arrivee || ''} — Le camion recule à la porte${numPorte ? ` ${numPorte}` : ''}…`);
  // La palette pour le kit : chaque carton numéroté (couche par couche, du fond vers l'avant, de gauche à
  // droite : « 9 / 12 »), sa référence (celle de sa couche), sa face enfoncée, l'étiquette de sa face.
  const DIR_FACE = (d) => (d[1] === 1 ? 'S' : d[1] === -1 ? 'N' : d[0] === 1 ? 'E' : 'W');
  const refDeCouche = (p, k) => (p.refs ? p.refs.find((x) => x.couches.includes(k)) || null : null);
  const marque = (et) => (et && et.marque) || String(cam.fournisseur || '').split(/[\s,]/)[0].toUpperCase();
  function palIso(p) {
    const total = p.W * p.D * p.L, manque = new Set(p.manque), cartons = [];
    for (let k = 0; k < p.L; k++) for (let j = 0; j < p.D; j++) for (let i = 0; i < p.W; i++) {
      const no = 1 + k * p.W * p.D + j * p.W + i, rf = refDeCouche(p, k), et = (rf ? rf.etiq : p.etiq) || {};
      const av = p.avarie[`${i},${j},${k}`];
      cartons.push({ i, j, k, no, ref: rf ? rf.ref : p.ref, absent: manque.has(`${i},${j},${k}`), abime: av ? DIR_FACE(av) : null,
        etiq: { haut: marque(et), no: `${no}/${total}`, ref: et.ref || (rf ? rf.ref : p.ref), bas: et.court || '' } });
    }
    return { nW: p.W, nD: p.D, nL: p.L, total, cartons };
  }
  // Une palette de fûts (D-4, étape 3) : huit places numérotées comme les cartons (rangée du fond 1-2-3, milieu 4-5, avant
  // 6-7-8, de gauche à droite) ; l'étiquette lue est celle de la collerette (la référence réellement livrée).
  const estFut = (p) => p.forme === 'fut';
  const HAS_FUT = R.palettes.some(estFut);
  function palFutsIso(p) {
    const manque = new Set(p.manque);
    return { total: PLACES_FUTS, futs: Array.from({ length: PLACES_FUTS }, (_, k) => ({ no: k + 1, ref: (p.etiq && p.etiq.ref) || p.ref, absent: manque.has(k + 1), fuite: p.avarie[k + 1] || null })) };
  }
  // Le côté du bac d'une palette de fûts à l'échelle du décor (ouverture de porte de 1,2 m, remorque de 3,3 m) : aux étapes ② et ④.
  // À l'étape ③ la palette se voit en grand, avec le bac de 1,30 m.
  const COTE_DECOR = 0.95;
  // (Une palette de fûts est enveloppée d'un groupe `data-iso-pal` : les tests y lisent où elle est ; les cartons de Spartoo ne changent pas.)
  const palSvg = (I, p, x, y, r, o) => (estFut(p) ? `<g data-iso-pal="${ech(p.id)}">${paletteFuts(I, palFutsIso(p), x, y, r, Object.assign({ cote: COTE_DECOR }, o))}</g>` : paletteCartons(I, palIso(p), x, y, r, o));
  // L'emprise au sol d'une palette tournée d'un quart de tour dans la remorque : [largeur en x, profondeur en y].
  const gabarit = (p) => (estFut(p) ? [COTE_DECOR, COTE_DECOR] : dimsPalette(3));
  // ② et ④ : l'intérieur du quai. Les palettes du camion : dans la remorque, en route (le chauffeur la tire,
  // de dos, la main sur le timon), ou posées en zone de réception. `parti` (④, BL signé) : le chauffeur et
  // les palettes refusées sont repartis, la porte est refermée.
  const I2 = ISO ? projection({ unite: 60, origine: [470, 235] }) : null;
  const ISO_X = 2.6, ISO_YDEP = -2.9, ISO_YARR = 2.1;
  // Les places d'arrivée en zone de réception : une palette = la place d'aujourd'hui ; plusieurs = deux colonnes, la
  // rangée du fond remplie la première (une palette qui glisse de côté ne rencontre ainsi aucune palette déjà posée).
  function placesIso(P) {
    const N = P.length, G = P.map(gabarit), gw = Math.max(...G.map((g) => g[0])), gd = Math.max(...G.map((g) => g[1]));
    const nc = Math.min(N, 2), nr = Math.ceil(N / nc);
    return P.map((_, n) => [ISO_X + (0.8 - gw) / 2 + (n % nc) * (gw + 0.2), ISO_YARR + (nr - 1 - Math.floor(n / nc)) * (gd + 0.2)]);
  }
  // Le cadre de la zone de réception autour de ces places (l'unique palette garde la zone d'aujourd'hui).
  function zoneIso(L) {
    const xs = L.map((q) => q[0]), ys = L.map((q) => q[1]);
    return [Math.min(...xs) - 0.25, Math.max(...xs) + 0.95 + 0.45, 1.9, Math.max(...ys) + 0.95 + 0.3];
  }
  function imageIso(t, e, attente, o = {}) {
    // La dépose dirigée : l'image d'une pause, calculée de la base (ou celle d'une animation en cours, étape B).
    if (DEPOSE) return imageDepose(ui.visDep || visDe(e, { toutes: !!o.toutes }), e, o);
    if (CARISTE_ISO) return imageIsoChariot(t, e, attente, o);
    const P = PAL[ca(e)], N = P.length, depart = (n) => T_DEB + n * T_PAL;
    const G = P.map(gabarit), L = placesIso(P), pasDep = P.every(estFut) ? 1.05 : 1.3;
    const xc = (n) => ISO_X + (0.8 - G[n][0]) / 2;   // la palette centrée sur la porte (0,8 m de large : ISO_X, comme avant)
    // Mode scène : si l'élève a déjà ouvert la porte de quai pendant l'inspection, l'étape ② démarre porte levée.
    const ouv = attente || o.parti ? 0 : SCENE && e.securite && e.securite.ouverte ? 1 : Math.min(1, t / T_PORTE);
    const et = SCENE ? etatsScene(SEC, e.securite) : null;
    const lp = et && et.lampe ? lampeQuai(I2, et.lampe) : { cone: '', tete: '' };
    const pos = [], sur = new Set();
    let enCours = null, nb = 0;
    // Les palettes qui attendent avancent d'un cran quand celle d'avant a fait la moitié du chemin (0,8 s de glissement).
    const decale = (n) => { let d = 0; for (let k = 0; k < n; k++) d += Math.min(1, Math.max(0, (t - depart(k) - T_TRAJET / 2) / 800)); return d; };
    P.forEach((p, n) => {
      if (attente || t < depart(n)) { pos.push([p, xc(n), ISO_YDEP - (n - (attente ? 0 : decale(n))) * pasDep]); return; }
      if (t >= depart(n) + T_TRAJET) { nb++; sur.add(p.id); pos.push([p, L[n][0], L[n][1]]); return; }
      const f = (t - depart(n)) / T_TRAJET, u = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      // Sorties de la porte, les palettes qui vont à une autre colonne glissent de côté avant d'atteindre leur place.
      const y = ISO_YDEP + (L[n][1] - ISO_YDEP) * u, gl = Math.min(1, Math.max(0, (y - 0.05) / 1.05));
      enCours = n; pos.push([p, xc(n) + (L[n][0] - xc(n)) * gl, y]);
    });
    const garder = o.parti ? pos.filter(([p]) => accepte(st(e, p))) : pos;
    // Le chauffeur : invisible tant que la porte n'est pas presque levée ; il tire la palette en cours, ou
    // attend à côté de la dernière posée.
    let tp = '', ch = '', yt = 0, yc = 0;
    if (!attente && !o.parti && t >= T_OUVRE - 200) {
      const k = enCours != null ? enCours : Math.max(0, nb - 1);
      const [pk, xp, yp] = pos[k] || [null, ISO_X, ISO_YARR];
      const gk = pk ? gabarit(pk) : [0.8, 1.2], xk = xp + (gk[0] - 0.8) / 2;   // la roue du transpalette au milieu du devant de la palette
      const tire = enCours != null || nb === 0;
      yt = yp + gk[1]; yc = yt + 0.62 + (tire ? 0 : 0.5);
      const T = transpaletteManuel(I2, xk, yt);
      tp = T.svg;
      const marche = enCours != null ? ((t - depart(enCours)) / 600) % 1 : null;
      // Plusieurs palettes : le chauffeur qui attend se met à côté de la dernière posée (pas devant, hors du cadre).
      const cote = !tire && N > 1;
      if (cote) { yt = -99; yc = yp + 0.3; }
      ch = personne(I2, cote ? xp + gk[0] + 0.45 : xk + .62, cote ? yc : yc + 0.05, { dos: tire, main: tire ? T.poignee : null, pas: marche });
      if (cote) tp = '';
    }
    const dedans = (y) => y < 0.02;
    const pal = (p, x, y, yMin, yMax) => palSvg(I2, p, x, y, 3, { yMin: Math.max(yMin, -3.6), yMax, lisible: false });
    let s = solQuai(I2, R.zone.nom, N > 1 ? { zone: zoneIso(L) } : {});
    s += `<g clip-path="url(#quaiIsoOuv)">${remorqueInterieur(I2)}${niveleur(I2, 'dedans', et ? et.niveleur : 'pose')}${lp.cone}${garder.slice().sort((a, b) => a[2] - b[2]).map(([p, x, y]) => pal(p, x, y, -99, 0)).join('')}${tp && dedans(yt) ? tp : ''}${ch && dedans(yc) ? ch : ''}</g>`;
    s += murQuai(I2, ouv, R.lieu.nom) + niveleur(I2, 'dehors', et ? et.niveleur : 'pose') + lp.tete;
    s += garder.slice().sort((a, b) => (a[1] + a[2]) - (b[1] + b[2])).map(([p, x, y]) => pal(p, x, y, 0, 99)).join('');
    s += (tp && !dedans(yt) ? tp : '') + (ch && !dedans(yc) ? ch : '');
    s += horlogeQuai(I2, 6.6, 0.01, 2.25, hhmm(e.minute).slice(0, 5));
    let leg;
    if (attente) leg = `${hhmm(e.minute)} — Le camion est à quai, porte fermée.`;
    else if (t < T_DEB) leg = `${hhmm(e.minute)} — La porte du ${lieuMin} se lève.`;
    else if (nb < N) leg = `${hhmm(e.minute)} — ${quiSort} sort la palette ${P[enCours ?? nb].id} au transpalette (${Math.min(nb + 1, N)} sur ${N}).`;
    else leg = legFinIso(N, e);
    return { iso: s, leg, nb, pastilles: P.map((p) => `<i class="${sur.has(p.id) ? 'sur' : ''}">${ech(p.id)}</i>`).join('') };
  }
  // ② et ④ au chariot frontal (D-4, étape 5) : le chariot de `planChariot` entre par l'ouverture, prend la palette de tête sur ses fourches,
  // la sort et la pose à sa place d'arrivée (les mêmes places qu'avec le chauffeur). Le chauffeur du camion reste debout près de l'accueil.
  // Le chariot est coupé au mur comme les palettes : la part qui est dans la remorque se dessine dans le clip de l'ouverture (`dedans`),
  // la part qui est devant le mur après lui (`dehors`). `o.parti` (④, BL signé) : le chauffeur est reparti, le chariot reste garé.
  function imageIsoChariot(t, e, attente, o = {}) {
    const P = PAL[ca(e)], N = P.length, plan = planC(), K = CHARIOT_QUAI.K;
    const G = P.map(gabarit), L = placesIso(P), pasDep = P.every(estFut) ? 1.05 : 1.3;
    const rangDe = []; plan.ordre.forEach((n, u) => { rangDe[n] = u; });
    const xc = (n) => ISO_X + (0.8 - G[n][0]) / 2;
    const ouv = attente || o.parti ? 0 : SCENE && e.securite && e.securite.ouverte ? 1 : Math.min(1, t / T_PORTE);
    const et = SCENE ? etatsScene(SEC, e.securite) : null;
    const lp = et && et.lampe ? lampeQuai(I2, et.lampe) : { cone: '', tete: '' };
    const ch = etatChariot(plan, attente ? 0 : t);
    // La file dans la remorque avance d'un cran quand la palette d'avant est sortie.
    const decale = (u) => { let d = 0; for (let j = 0; j < u; j++) d += Math.min(1, Math.max(0, (t - plan.tC[j] - 700) / 800)); return d; };
    const pos = [], sur = new Set();
    let nb = 0, enCours = null;
    P.forEach((p, n) => {
      const u = rangDe[n];
      if (attente || t < plan.tLift[u]) pos.push([p, xc(n), ISO_YDEP - (u - (attente ? 0 : decale(u))) * pasDep]);
      else if (t >= plan.tPose[u]) { nb++; sur.add(p.id); pos.push([p, L[n][0], L[n][1]]); }
      else enCours = u;
    });
    const garder = o.parti ? pos.filter(([p]) => accepte(st(e, p))) : pos;
    const pal = (p, x, y, yMin, yMax) => palSvg(I2, p, x, y, 3, { yMin: Math.max(yMin, -3.6), yMax, lisible: false });
    const dedans = [], dehors = [];
    garder.forEach(([p, x, y]) => { const [gw, gd] = gabarit(p), cle = x + gw / 2 + y + gd / 2; dedans.push([cle, pal(p, x, y, -99, 0)]); dehors.push([cle, pal(p, x, y, 0, 99)]); });
    // Le chariot : sa projection est celle du quai, à l'échelle K, posée sur le bout de ses fourches ; la palette portée suit ses fourches.
    const portee = enCours != null ? P[plan.ordre[enCours]] : null, [gwp, gdp] = portee ? gabarit(portee) : [0, 0];
    const y0 = ch.yc, Ik = projection({ unite: I2.unite * K, origine: I2.P(ch.cx - 0.5 * K, y0, 0) });
    const yPal = ch.yc + CHARIOT_FL - gdp, xPal = ch.cx - gwp / 2;
    const dessin = (yMin, yMax) => {
      const charge = portee ? `<g transform="translate(0 ${(-ch.lev * I2.unite).toFixed(2)})">${pal(portee, xPal, yPal, yMin, yMax)}</g>` : '';
      return dessinerChariotFrontal(Ik, { x: 0, y: 0, lev: ch.lev / K, chargeSvg: charge, coupe: { yMin: (yMin - y0) / K, yMax: (yMax - y0) / K }, gilet: true }, {});
    };
    const cleCh = ch.cx + ch.yc + CHARIOT_BL / 2;
    if (Math.min(ch.yc, portee ? yPal : ch.yc) < 0.02) dedans.push([cleCh, `<g data-iso-chariot="dedans">${dessin(-99, 0)}</g>`]);
    if (ch.yc + CHARIOT_BL > 0) dehors.push([cleCh, `<g data-iso-chariot="dehors">${dessin(0, 99)}</g>`]);
    const trier = (liste) => liste.sort((a, b) => a[0] - b[0]).map((x) => x[1]).join('');
    let s = solQuai(I2, R.zone.nom, N > 1 ? { zone: zoneIso(L) } : {});
    s += `<g clip-path="url(#quaiIsoOuv)">${remorqueInterieur(I2)}${niveleur(I2, 'dedans', et ? et.niveleur : 'pose')}${lp.cone}${trier(dedans)}</g>`;
    s += murQuai(I2, ouv, R.lieu.nom) + niveleur(I2, 'dehors', et ? et.niveleur : 'pose') + lp.tete;
    s += trier(dehors);
    if (!o.parti) s += personne(I2, 6.5, 1.4);
    s += horlogeQuai(I2, 6.6, 0.01, 2.25, hhmm(e.minute).slice(0, 5));
    let leg;
    if (attente) leg = `${hhmm(e.minute)} — Le camion est à quai, porte fermée.`;
    else if (t < T_DEB) leg = `${hhmm(e.minute)} — La porte du ${lieuMin} se lève.`;
    else if (nb < N) leg = `${hhmm(e.minute)} — ${quiSort} sort la palette ${P[plan.ordre[enCours != null ? enCours : nb]].id} au chariot (${Math.min(nb + 1, N)} sur ${N}).`;
    else leg = legFinIso(N, e);
    return { iso: s, leg, nb, pastilles: P.map((p) => `<i class="${sur.has(p.id) ? 'sur' : ''}">${ech(p.id)}</i>`).join('') };
  }
  /* ------------------------------------------- la dépose dirigée : image, cases, bulle (lot 2) */
  // Les cases des palettes au sol : une palette posée est dans SA case (l'état fait foi) ; avec `toutes` (sous `commence`, à ④, ou une
  // fois tout posé), les autres prennent les cases justes libres dans l'ordre du contenu (P1 → première case juste…).
  function casesDesPalettes(e, toutes) {
    const D = (e && e.depose) || {}, posees = {}, occ = new Set();
    PAL[0].forEach((p) => { const d = D[p.id]; if (d && d.pose && GEO.cases.some((g) => g.id === d.pose) && !occ.has(d.pose)) { posees[p.id] = d.pose; occ.add(d.pose); } });
    if (toutes) {
      const libres = DEPOSE.cases.filter((c) => c.juste && !occ.has(c.id)).map((c) => c.id);
      PAL[0].forEach((p) => { if (!posees[p.id] && libres.length) posees[p.id] = libres.shift(); });
    }
    return posees;
  }
  const etatDep = (e) => ({ depose: (e && e.depose) || {} });
  const enAttenteDep = (e) => paletteEnAttente(etatDep(e), ORDRE_DEP);
  const deposeEnCours = (e) => JOUEE && !deposeFinie(etatDep(e), ORDRE_DEP);
  // Où le cariste reste une fois tout posé : au point d'attente (la sortie du camion, dans le passage de la porte), fourches baissées,
  // à vide. (Garé dans l'allée derrière les cases, il couvrait le nom de la zone et les cases du devant.)
  const GARE_DEP = GEO ? [GEO.xPorte, GEO.ycSortie, 0] : null;
  // Ce qu'on voit à une pause, calculé de la base (décision 7) : `vis = { pos: [cx, yc, lev], portee, posees: { palette: case }, camion:
  // [palettes dans la remorque, tête d'abord], retard }`. Pendant le choix, le cariste attend à la sortie du camion, la palette en attente
  // sur les fourches ; la file restante est dans la remorque. Fonction pure (de `e`) : un rechargement retombe sur la même image.
  function visDe(e, o = {}) {
    const k = K(e, 0), toutes = COMMENCE || !!o.toutes || (k.decharge && !deposeEnCours(e));
    const posees = casesDesPalettes(e, toutes);
    if (toutes) return { pos: GARE_DEP.slice(), portee: null, posees, camion: [], retard: 0 };
    if (!k.decharge || !(k.evts >= 1)) return { pos: GARE_DEP.slice(), portee: null, posees: {}, camion: ORDRE_DEP.slice(), retard: 0 };
    const att = enAttenteDep(e);
    return { pos: [GEO.xPorte, GEO.ycSortie, CHARIOT_QUAI.LEV], portee: att, posees, camion: ORDRE_DEP.filter((id) => id !== att && !posees[id]), retard: 0 };
  }
  const palDep = (p, x, y, yMin, yMax) => palSvg(I2, p, x, y, 3, { yMin: Math.max(yMin, -3.6), yMax, lisible: false });
  // Une palette posée, centrée dans sa case (une palette de fûts est plus large et moins profonde qu'une palette de cartons).
  const dansCase = (p, g) => { const [gw, gd] = gabarit(p); return [g.x0 + (GD.LARG - gw) / 2, g.y0 + (GD.PROF - gd) / 2]; };
  // Le chariot (comme `imageIsoChariot`) : la projection du quai à l'échelle K posée sur le bout des fourches, la palette portée sur les
  // fourches, coupé au mur (`yMin` / `yMax` monde).
  function chariotDep(pos, portee, yMin, yMax) {
    const Kc = CHARIOT_QUAI.K, [cx, yc, lev] = pos;
    const Ik = projection({ unite: I2.unite * Kc, origine: I2.P(cx - 0.5 * Kc, yc, 0) });
    let charge = '';
    if (portee) { const [gw, gd] = gabarit(portee); charge = `<g transform="translate(0 ${(-lev * I2.unite).toFixed(2)})">${palDep(portee, cx - gw / 2, yc + CHARIOT_FL - gd, yMin, yMax)}</g>`; }
    return dessinerChariotFrontal(Ik, { x: 0, y: 0, lev: lev / Kc, chargeSvg: charge, coupe: { yMin: (yMin - yc) / Kc, yMax: (yMax - yc) / Kc }, gilet: true }, {});
  }
  // Le chauffeur du camion : pas à ② (comme la maquette validée : un personnage près d'un piège attirerait l'œil), seulement à ④, où il
  // attend la signature, debout à droite de la dernière case (sa place d'aujourd'hui, x = 6,5, tombe sur les cases).
  const CHAUFFEUR_DEP = GEO ? [Math.max(...GEO.cases.map((g) => g.x1)) + 0.45, 1.0] : null;
  // Le sol (calculé une fois) : la dalle élargie, la zone de réception et son nom à la première case juste (`solQuai`), l'allée piétonne
  // (bande hachurée, pictogrammes), la zone du quai voisin, les cases peintes (contour fin et nom au sol). Une case `peinte: false`
  // n'a rien au sol : elle ne s'éclaire que pendant le choix.
  let solDepMemo = null;
  function solDepose() {
    if (solDepMemo) return solDepMemo;
    const S = GEO.sol, Z = GEO.zone, I = I2;
    let s = solQuai(I, `${R.zone.nom} — ${R.lieu.nom}`, { zone: [Z.x0, Z.x1, Z.y0, Z.y1], sol: [S.x0, S.x1, S.y1], nomAuSol: [Z.xNom, Z.y1 + 0.42] });
    GEO.pieton.forEach((a, n) => {
      const x0 = a.x0 - 0.12, x1 = a.x1 + 0.12, id = `quaiAllee${n}`;
      let raies = '';
      for (let y = -2; y < S.y1 + 2; y += 0.42) raies += `<polygon points="${I.pts([[x0, y, 0], [x1, y + (x1 - x0), 0], [x1, y + (x1 - x0) + 0.16, 0], [x0, y + 0.16, 0]])}" fill="rgba(231,198,40,.62)"/>`;
      s += `<g data-iso-allee-pietonne><clipPath id="${id}"><polygon points="${rectSolDe(I, x0, 0, x1, S.y1)}"/></clipPath>`;
      s += `<polygon points="${rectSolDe(I, x0, 0, x1, S.y1)}" fill="rgba(231,198,40,.16)"/><g clip-path="url(#${id})">${raies}</g>`;
      s += `<polyline points="${I.pts([[x0, 0, 0], [x0, S.y1, 0]])}" stroke="#d1a90f" stroke-width="3.5" fill="none"/><polyline points="${I.pts([[x1, 0, 0], [x1, S.y1, 0]])}" stroke="#d1a90f" stroke-width="3.5" fill="none"/>`;
      s += pictoPieton(I, (x0 + x1) / 2, 0.75) + pictoPieton(I, (x0 + x1) / 2, 4.3);
      s += surSolDe(I, `<text x="${x0 + 0.08}" y="5.35" font-size="0.26" font-weight="800" fill="#555047" font-family="${POLICE_ISO}">PIÉTONS</text>`) + '</g>';
    });
    GEO.autres.forEach((a) => {
      s += `<g data-iso-zone-voisine><polygon points="${rectSolDe(I, a.x0 - 0.12, GD.Y0 - 0.12, a.x1 + 0.12, GD.Y0 + GD.PROF + 0.12)}" fill="rgba(231,198,40,.08)" stroke="#d1a90f" stroke-width="3" stroke-dasharray="10 6"/>`;
      s += surSolDe(I, `<text x="${a.x0 - 0.05}" y="${GD.Y0 + GD.PROF + 0.42}" font-size="0.3" font-weight="800" fill="#555047" font-family="${POLICE_ISO}">${ech(String(a.legende).toUpperCase())}</text>`) + '</g>';
      s += seuilPorte(I, a.xPorte - 0.6);
    });
    GEO.cases.forEach((g) => {
      if (!g.peinte) return;
      s += `<g data-iso-case-peinte="${ech(g.id)}"><polygon points="${rectSolDe(I, g.x0, g.y0, g.x1, g.y1, 0.002)}" fill="none" stroke="#6d675b" stroke-width="1.6"/>`;
      s += surSolDe(I, `<text x="${(g.x0 + g.x1) / 2}" y="${g.y0 + 0.62}" text-anchor="middle" font-size="0.4" font-weight="800" fill="#6d675b" font-family="${POLICE_ISO}">${ech(g.id)}</text>`) + '</g>';
    });
    return (solDepMemo = s);
  }
  // Le mur : celui du quai (`murQuai`, porte levée de `ouv`), prolongé au besoin, la porte fermée du quai voisin, la porte piétonne, l'horloge.
  function murDepose(ouv, e) {
    const S = GEO.sol, m = ['#b9b3a6', '#c9c3b6', '#a9a397'];
    let g = S.x0 < -1.2 ? I2.boite(S.x0, -0.3, 0, -1.2 - S.x0, 0.3, 2.7, m) : '';
    g += murQuai(I2, ouv, R.lieu.nom);
    if (S.x1 > 7.5) g += I2.boite(7.5, -0.3, 0, S.x1 - 7.5, 0.3, 2.7, m);
    GEO.autres.forEach((a) => { g += porteVoisine(I2, a.xPorte, a.legende); });
    GEO.pieton.forEach((a) => { g += portePietonne(I2, (a.x0 + a.x1) / 2); });
    return g + horlogeQuai(I2, 1.0, 0.01, 2.25, hhmm(e.minute).slice(0, 5));
  }
  // Le cadre (viewBox) : le mur au-dessus des cases, la remorque, l'allée où le chariot circule, le chauffeur de ④.
  let cadreDepMemo = null;
  function cadreDep() {
    if (cadreDepMemo) return cadreDepMemo;
    const xs = GEO.cases.map((g) => g.x0).concat(GEO.cases.map((g) => g.x1));
    const x0 = Math.min(...xs) - 0.3, x1 = Math.max(...xs) + 0.3, yBas = GEO.ycAllee + CHARIOT_BL + 0.15;
    const cx0 = Math.min(...GEO.cases.map((g) => g.cx)) - 0.5, cx1 = Math.max(...GEO.cases.map((g) => g.cx)) + 0.5;
    const pts = [[x0, 0, 2.75], [x1, 0, 2.75], [x0, GD.Y0 + GD.PROF + 0.7, 0], [x1, GD.Y0 + GD.PROF + 0.7, 0], [cx0, yBas, 0], [cx1, yBas, 0], [3.6, -3.6, 2.05], [2.4, -3.6, 2.1],
      [CHAUFFEUR_DEP[0] + 0.4, CHAUFFEUR_DEP[1], 0], [CHAUFFEUR_DEP[0], CHAUFFEUR_DEP[1], 2.0]];
    const P = pts.map((p) => I2.P(...p));
    const a = Math.min(...P.map((p) => p[0])) - 10, b = Math.min(...P.map((p) => p[1])) - 10;
    return (cadreDepMemo = [Math.floor(a), Math.floor(b), Math.ceil(Math.max(...P.map((p) => p[0])) + 10 - a), Math.ceil(Math.max(...P.map((p) => p[1])) + 10 - b)]);
  }
  // L'image d'un instant (une pause, ou un instant d'une animation à l'étape B) : la remorque et sa file, les palettes posées, le chariot.
  // `o.parti` (④, BL signé) : le chauffeur et les palettes refusées sont repartis, la porte est refermée.
  // Pendant un geste (étape B), `vis` porte aussi `ouv` (la porte qui se lève), `minute` (l'heure montrée : celle de la base moins ce
  // qui n'est pas encore arrivé à l'écran) et `leg` (ce que fait le cariste) ; absents à une pause.
  function imageDepose(vis, e, o = {}) {
    if (vis.minute != null) e = Object.assign({}, e, { minute: vis.minute });
    const k = K(e, 0), P = PAL[0], N = P.length, Pp = (id) => P.find((p) => p.id === id);
    const ouv = o.parti || !k.decharge ? 0 : vis.ouv != null ? vis.ouv : 1;
    const et = SCENE ? etatsScene(SEC, e.securite) : null;
    const lp = et && et.lampe ? lampeQuai(I2, et.lampe) : { cone: '', tete: '' };
    const pas = P.every(estFut) ? 1.05 : GD.PAS_CAMION;
    const dedans = [], dehors = [];
    vis.camion.forEach((id, r) => {
      const p = Pp(id);
      if (!p) return;
      const [gw, gd] = gabarit(p), x = GD.X_PORTE - gw / 2, y = GD.Y_CAMION - (r + vis.retard) * pas;
      dedans.push([x + gw / 2 + y + gd / 2, palDep(p, x, y, -99, 0)]);
    });
    let nb = 0;
    Object.keys(vis.posees).forEach((id) => {
      const p = Pp(id), g = GEO.cases.find((c) => c.id === vis.posees[id]);
      if (!p || !g) return;
      nb++;
      if (o.parti && !accepte(st(e, p))) return;
      const [x, y] = dansCase(p, g), [gw, gd] = gabarit(p);
      dehors.push([x + gw / 2 + y + gd / 2, `<g data-iso-posee="${ech(p.id)}" data-iso-case="${ech(g.id)}">${palDep(p, x, y, 0, 99)}</g>`]);
    });
    const portee = vis.portee ? Pp(vis.portee) : null, [cx, yc] = vis.pos;
    const yPal = portee ? yc + CHARIOT_FL - gabarit(portee)[1] : yc, cle = cx + yc + CHARIOT_BL / 2;
    if (Math.min(yc, yPal) < 0.02) dedans.push([cle, `<g data-iso-chariot="dedans">${chariotDep(vis.pos, portee, -99, 0)}</g>`]);
    if (yc + CHARIOT_BL > 0) dehors.push([cle, `<g data-iso-chariot="dehors">${chariotDep(vis.pos, portee, 0, 99)}</g>`]);
    const trier = (L) => L.sort((a, b) => a[0] - b[0]).map((x) => x[1]).join('');
    let s = solDepose();
    s += `<g clip-path="url(#quaiIsoOuv)">${remorqueInterieur(I2)}${niveleur(I2, 'dedans', et ? et.niveleur : 'pose')}${lp.cone}${trier(dedans)}</g>`;
    s += murDepose(ouv, e) + niveleur(I2, 'dehors', et ? et.niveleur : 'pose') + lp.tete + trier(dehors);
    if (o.toutes && !o.parti) s += personne(I2, CHAUFFEUR_DEP[0], CHAUFFEUR_DEP[1]);
    let leg;
    if (vis.leg) leg = vis.leg;
    else if (!k.decharge) leg = `${hhmm(e.minute)} — Le camion est à quai, porte fermée.`;
    else if (portee) leg = `${hhmm(e.minute)} — ${texteAttente(portee.id)}`;
    else leg = legFinIso(N, e);
    return { iso: s, leg, nb, pastilles: P.map((p) => `<i class="${vis.posees[p.id] ? 'sur' : ''}">${ech(p.id)}</i>`).join('') };
  }
  // « Kevin attend avec la palette P4 (Torchons…, 1 sur 4). Où la pose-t-il ? »
  function texteAttente(id) {
    const p = PAL[0].find((x) => x.id === id), rang = ORDRE_DEP.indexOf(id) + 1;
    return `${quiSort} attend avec la palette ${id} (${p && p.nom ? `${p.nom}, ` : ''}${rang} sur ${ORDRE_DEP.length}). Où la pose-t-il ?`;
  }
  const texteFinDep = () => (ARRET ? ARRET.texte : `Les ${PAL[0].length} palettes sont en ${zoneMin}.`);
  // La couche des cases (décision 9), au-dessus de tout : chaque case proposée est un bouton (rôle, tabindex, NOM, jamais le verdict) ;
  // une case grisée : hachures, sans rôle ni tabindex ; une case occupée : absente.
  function coucheCases(e) {
    if (!JOUEE) return '';
    const k = K(e, 0), ED = etatDep(e);
    const p = k.decharge && k.evts >= 1 && !ui.animDep && !e.fini ? paletteEnAttente(ED, ORDRE_DEP) : null;
    const proposees = p ? casesProposees(ED, DEPOSE.cases, p, OPTS_DEP) : [];
    const grisees = casesGrisees(ED, DEPOSE.cases, p, OPTS_DEP);
    return GEO.cases.map((g, i) => {
      const pts = rectSolDe(I2, g.x0, g.y0, g.x1, g.y1, 0.004), c = DEPOSE.cases[i];
      if (proposees.includes(g.id)) {
        return `<g class="quai-case" data-q="depose" data-c="${ech(g.id)}" role="button" tabindex="0" aria-label="${ech(c.nom)}"><polygon class="quai-case-zone" points="${pts}"/><polygon class="quai-case-halo" points="${pts}"/><polygon class="quai-case-trait" points="${pts}"/></g>`;
      }
      if (grisees.has(g.id)) return `<g class="quai-case-grisee" data-case-grisee="${ech(g.id)}" aria-hidden="true"><polygon points="${pts}" fill="url(#quaiCaseGrise)" stroke="#7d776c" stroke-width="2" stroke-dasharray="5 4"/></g>`;
      return '';
    }).join('');
  }
  // Ce que dit le cariste à la pause : sa réaction au dernier clic faux (guidage), sinon sa consigne avant la première palette (guidage et copie).
  function texteBulleDep(e) {
    if (!JOUEE || e.fini || ui.animDep) return '';
    const k = K(e, 0);
    if (!k.decharge || !(k.evts >= 1)) return '';
    const ED = etatDep(e), p = paletteEnAttente(ED, ORDRE_DEP);
    if (!p) return '';
    const is = issueDernierChoix(ED, DEPOSE.cases, p);
    if (is && is.issue === 'refus') return is.reaction;
    if (p === ORDRE_DEP[0] && !(ED.depose[p] && ED.depose[p].essais.length)) return PREMIERE_BULLE;
    return '';
  }
  // La bulle du cariste (décision 10) : la bulle du quai (`bulle`), la pointe sur sa tête ; si la boîte couvrait une case, elle remonte
  // au-dessus de la plus haute case qu'elle survole et sa pointe s'allonge jusqu'à la tête (une case à choisir n'est jamais cachée).
  function bulleDep(pos, texte) {
    const [x, y] = I2.P(pos[0], pos[1] + 1.32, 1.58), lignes = couperBulle(texte);
    const bx = x - 34, W = Math.max(...lignes.map((l) => l.length)) * 7.6 + 28;   // largeur majorée (la bulle mesure son texte)
    const sous = GEO.cases.filter((g) => { const xs = [[g.x0, g.y0], [g.x1, g.y0], [g.x1, g.y1], [g.x0, g.y1]].map(([a, b]) => I2.P(a, b, 0)[0]); return Math.max(...xs) > bx && Math.min(...xs) < bx + W; });
    const haut = sous.length ? Math.min(...sous.map((g) => I2.P(g.x0, g.y0, 0)[1])) : Infinity;
    const yp = Math.min(y, haut + 4);   // le bas de la boîte de `bulle` est à 14 px au-dessus de sa pointe : 10 px au-dessus de la case
    const queue = yp < y - 0.5 ? `<path d="M${n1(x - 2.4)},${n1(yp - 15)} L${n1(x)},${n1(y)} L${n1(x + 12)},${n1(yp - 15)}" fill="#fff" stroke="#2c2c2c" stroke-width="1.5" stroke-linejoin="round"/>` : '';
    return `<g data-q-bulle-cariste>${bulle(x, yp, lignes)}${queue}</g>`;
  }

  // Le dégradé métallique des fûts n'est posé que si le quai en a (le dessin des autres séances reste octet pour octet le même).
  // La hachure des cases grisées (dépose dirigée), seulement si le quai déclare `depose`.
  const defsIso = () => `<defs><clipPath id="quaiIsoOuv"><polygon points="${ouvertureQuai(I2)}"/></clipPath>${DEPOSE ? '<pattern id="quaiCaseGrise" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><rect width="8" height="8" fill="rgba(120,116,108,.30)"/><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(85,80,71,.55)" stroke-width="3"/></pattern>' : ''}</defs>${HAS_FUT ? DEFS_ISO : ''}`;
  // ③ la palette en grand, tournée de `s.vue` quarts de tour ; chaque carton présent est cliquable.
  const NOMS_FACES = ['avant', 'côté droit', 'arrière', 'côté gauche'];
  function paletteIso(p, s) {
    // Une palette de fûts : bac de 1,30 m, carré (la rotation ne change pas son emprise).
    const r = s.vue, [W, D] = estFut(p) ? [COTE_BAC, COTE_BAC] : dimsPalette(r), I = projection({ unite: 150, origine: [470, 190] });
    const ox = -W / 2 + 0.85, oy = -D / 2 + 0.2;
    let o = I.face([[ox - 1.2, oy - 1.0, 0], [ox + W + 1.0, oy - 1.0, 0], [ox + W + 1.0, oy + D + 1.0, 0], [ox - 1.2, oy + D + 1.0, 0]], '#e4dfd3', 'none');
    o += `<polygon points="${I.pts([[ox - .25, oy - .25, 0], [ox + W + .25, oy - .25, 0], [ox + W + .25, oy + D + .25, 0], [ox - .25, oy + D + .25, 0]])}" fill="none" stroke="#d1a90f" stroke-width="3" stroke-dasharray="10 6"/>`;
    // Chaque carton (ou chaque fût) présent est cliquable : un clic lit son étiquette.
    o += estFut(p)
      ? paletteFuts(I, palFutsIso(p), ox, oy, r, { cote: COTE_BAC, lisible: true, sel: s.carton, attrs: (f) => `class="quai-etiq-clic" data-q-etiq data-k="avant" data-q-carton="${f.no}"` })
      : paletteCartons(I, palIso(p), ox, oy, r, { lisible: true, sel: s.carton,
        attrs: (c) => `class="quai-etiq-clic" data-q-etiq data-k="${ech(p.refs ? c.ref : 'avant')}" data-q-carton="${c.no}"` });
    const [fx, fy] = I.P(ox + W / 2, oy + D + 0.55, 0);
    o += `<text x="${fx.toFixed(1)}" y="${fy.toFixed(1)}" text-anchor="middle" font-size="14" font-weight="700" fill="#555047" transform="rotate(30 ${fx.toFixed(1)} ${fy.toFixed(1)})">face ${NOMS_FACES[r]} de la palette</text>`;
    return o;
  }
  // L'étiquette du carton cliqué, lisible, et ce qu'on voit de son état DEPUIS LA VUE ACTUELLE.
  function zoomFut(p, s, cm) {
    const P = palFutsIso(p), f = s.carton ? P.futs.find((x) => x.no === s.carton && !x.absent) : null;
    if (!f) return `<span class="note">🔍 Clique sur un ${R.u.un} de la palette : son étiquette s’affiche ici (${fmtMin(C.etiquette)} la première fois).</span>`;
    const et = p.etiq || {}, vu = f.fuite && faceVisible(s.vue, f.fuite);
    return `<div class="quai-etiq quai-etiq-carton" data-q-etiquette data-q-carton-vu="${f.no}">
        <div class="quai-etiq-l1"><b>${ech(cm.fournisseur)}</b><span>${ech(maj(R.u.un))} <b>${f.no}</b> / ${P.total}</span></div>
        ${Q.destinataire ? `<div class="quai-etiq-dest">→ ${ech(Q.destinataire)}</div>` : ''}
        <div class="quai-etiq-ref">${ech(et.ref)}</div><div>${ech(et.nom)}</div><div>${ech(et.poids)}</div>
        <div>${et.commande ? `Cde ${ech(et.commande)} · ` : ''}Lot ${ech(et.lot)}</div>
        <div class="quai-code">||| |||| || ||||| | ||| ${ech(String(et.ref).replace(/-/g, ''))}</div></div>
      <div class="quai-etat-carton" data-q-etat-carton>${vu ? '<b class="quai-depasse">⚠ Fuite</b> sur cette face.' : `Ce que tu vois de ${ceUnite(R.u)} ${ech(R.u.un)} depuis ici : <b>intact</b>.`}</div>
      <div class="quai-reconst">Étiquette reconstituée, non contractuelle.</div>`;
  }
  function zoomCarton(p, s, cm) {
    if (estFut(p)) return zoomFut(p, s, cm);
    const P = palIso(p), c = s.carton ? P.cartons.find((x) => x.no === s.carton && !x.absent) : null;
    if (!c) return `<span class="note">🔍 Clique sur un ${R.u.un} de la palette : son étiquette s’affiche ici (${fmtMin(C.etiquette)} la première fois pour chaque référence).</span>`;
    const rf = refDeCouche(p, c.k), et = (rf ? rf.etiq : p.etiq) || {};
    const vu = c.abime && facesExterieures(c, p.W, p.D).includes(c.abime) && faceVisible(s.vue, c.abime);
    return `<div class="quai-etiq quai-etiq-carton" data-q-etiquette data-q-carton-vu="${c.no}">
        <div class="quai-etiq-l1"><b>${ech(cm.fournisseur)}</b><span>${ech(maj(R.u.un))} <b>${c.no}</b> / ${P.total}</span></div>
        ${Q.destinataire ? `<div class="quai-etiq-dest">→ ${ech(Q.destinataire)}</div>` : ''}
        <div class="quai-etiq-ref">${ech(et.ref)}</div><div>${ech(et.nom)}</div><div>${ech(et.poids)}</div>
        <div>${et.commande ? `Cde ${ech(et.commande)} · ` : ''}Lot ${ech(et.lot)}</div>
        <div class="quai-code">||| |||| || ||||| | ||| ${ech(String(et.ref).replace(/-/g, ''))}</div></div>
      <div class="quai-etat-carton" data-q-etat-carton>${vu ? `<b class="quai-depasse">⚠ ${maj(ceUnite(R.u))} ${ech(R.u.un)} est enfoncé</b> sur cette face.` : `Ce que tu vois de ${ceUnite(R.u)} ${ech(R.u.un)} depuis ici : <b>intact</b>.`}<br><span class="note">Couche ${c.k + 1} en partant du bas.</span></div>
      <div class="quai-reconst">Étiquette reconstituée, non contractuelle.</div>`;
  }

  // L'image à l'instant t : les morceaux dynamiques de la scène, et la légende.
  function image(t, e, attente) {
    if (ISO) return imageIso(t, e, attente);
    const P = PAL[ca(e)];
    const depart = (n) => T_DEB + n * T_PAL;
    const montee = attente || FIXE ? 0 : ease((t - T_OUVRE) / T_PORTE);
    const posees = [];
    let mobile = '', enCours = null;
    P.forEach((p, n) => {
      const [xf, yf] = PLACES[n % PLACES.length];
      if (attente) return;
      if (t >= depart(n) + T_TRAJET) posees.push([p, xf, yf]);
      else if (t >= depart(n)) {
        const u = ease((t - depart(n)) / T_TRAJET);
        const x0 = VP.x, y0 = SOL_Y0 + 4, cx = VP.x + (xf - VP.x) * .12, cy = yf - 10;
        const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * xf, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * yf;
        const ee = echelle(y);
        mobile = CARISTE ? chariot(x, y, ee, p.W * 32 * ee) + paletteFace(p, x, y, ee)
          : paletteFace(p, x, y, ee) + transpalette(x, y, ee, (t - depart(n)) / 110, p.W * 32 * ee);
        enCours = n;
      }
    });
    posees.sort((a, b) => a[2] - b[2]);
    const nb = posees.length;
    let leg;
    if (attente) leg = `${hhmm(e.minute)} — Le camion est à quai, portes fermées.`;
    else if (FIXE && t < T_DEB) leg = `${hhmm(e.minute)} — ${quiSort} entre dans la remorque ${CARISTE ? 'au chariot' : 'au transpalette'}.`;
    else if (t < T_OUVRE) leg = `${hhmm(e.minute)} — Le chauffeur ouvre les portes arrière de sa remorque.`;
    else if (t < T_DEB) leg = F ? `${hhmm(e.minute)} — La porte du quai se lève : l'air froid s'échappe et tombe au sol. Le temps hors froid démarre.` : `${hhmm(e.minute)} — La porte du quai se lève.`;
    else if (nb < P.length) leg = `${hhmm(e.minute)} — ${quiSort} sort la palette ${P[enCours ?? nb].id} ${CARISTE ? 'au chariot' : 'au transpalette'} (${Math.min(nb + 1, P.length)} sur ${P.length}).`;
    else leg = `${hhmm(e.minute)} — Les ${P.length} palettes sont sur le quai.${ARRET ? '' : ' Le camion attend la fin de tes contrôles.'}`;
    const posIds = new Set(posees.map((q) => q[0].id));
    return {
      porte: FIXE ? '' : `translate(0 ${f1(-montee * (PORTE.y1 - PORTE.y0 + 3))})`,
      remorque: FIXE ? '' : interieur(attente ? P : P.filter((_, n) => t < depart(n)), P.length),
      brume: attente || !F ? '' : brume(t),
      posees: posees.map(([p, x, y]) => paletteFace(p, x, y, echelle(y))).join(''),
      mobile, leg, nb,
      pastilles: P.map((p) => `<i class="${posIds.has(p.id) ? 'sur' : ''}">${ech(p.id)}</i>`).join(''),
    };
  }
  function scene2(e) {
    const ci = ca(e), k = K(e, ci), N = PAL[ci].length, cm = R.camions[ci];
    // (Dépose dirigée : pendant le dernier geste, la dernière palette est déjà posée dans la base mais pas encore à l'écran : ② n'est
    // pas finie tant que le cariste n'est pas revenu. `ui.animDep` est toujours null sans `depose`.)
    const fini = k.evts > N && !ui.animDep, attente = !k.decharge;
    const im = DEPOSE ? imageIso(0, e, attente) : image(fini ? fin(N) : 0, e, attente);
    const [cx, cy, cw, chh] = PH.cadre;
    const pw = PORTE.x1 - PORTE.x0, ph = PORTE.y1 - PORTE.y0;
    const ax = PORTE.x1 + 14;
    const [hx, hy] = PH.horloge || [ax, PORTE.y0 + 78];
    const tempQuai = `${R.lieu.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.temp).toFixed(1))} °C`;
    const barre = `<div class="quai-barre2">
      <div><div class="quai-compteur2">${DEPOSE ? `Palettes en ${ech(zoneMin)}` : 'Palettes sur le quai'} : <b data-q-nb>${im.nb} / ${N}</b><span class="quai-pastilles2" data-q-past>${im.pastilles}</span></div>
        <div class="note">${M ? `Camion ${ech(cm.nom)}, ${fictif(cm.transporteur, cm.fictif)} · ` : ''}Durée du déchargement : <b>${formule(ci)}</b> de temps du quai</div></div>
      <div class="quai-ligne">
        <button class="btn" data-q="passer" ${fini || attente || (DEPOSE && !ui.animDep) ? 'hidden' : ''}>⏩ Passer l'animation</button>
        <button class="btn" data-q="revoir" data-libre ${fini && !DEPOSE ? '' : 'hidden'}>↺ Revoir le déchargement</button>
        ${ARRET ? '' : `<button class="btn btn-p" data-q="vers3" data-libre ${fini ? '' : 'disabled'}>${ISO ? 'Compter la palette' : 'Contrôler les palettes'} →</button>`}
      </div>
    </div>`;
    // `arret: 'dechargement'` : une fois la dernière palette posée, le bandeau de fin remplace « Compter la palette » (ni Valider, ni Clore, ni Recommencer).
    const bandeau = ARRET && fini ? `<p class="quai-fin-decharge" role="status" data-q-fin-decharge>${ech(ARRET.texte)}</p>` : '';
    // La dépose dirigée : le <svg> est un groupe (les cases y sont des boutons) ; le dessin est caché aux lecteurs d'écran, la couche des
    // cases et la bulle du cariste se posent par-dessus ; la région `aria-live` reçoit ce que dit le cariste (la bulle SVG n'est pas lue).
    if (DEPOSE) {
      const vis = ui.visDep || visDe(e), [vx, vy, vw, vh] = cadreDep(), texte = texteBulleDep(e);
      // La consigne reste affichée pendant un geste (sinon la barre sautait à chaque pause).
      const choix = JOUEE && !fini && !attente && !e.fini;
      // `data-q-phase` : 'attente' (porte fermée), 'geste' (le cariste roule : aucune case), 'choix' (pause : les cases se proposent),
      // 'fin' (tout posé) ; pendant un geste, `data-q-geste` dit lequel ('porte', 'chercher', 'poser'), mis à jour par la boucle.
      const phase = !JOUEE ? 'fin' : attente ? 'attente' : ui.animDep ? 'geste' : !(k.evts >= 1) ? 'attente' : deposeEnCours(e) && !e.fini ? 'choix' : 'fin';
      return `<div class="quai-scene2 quai-iso quai-depose" data-q-phase="${phase}"${ui.animDep ? ` data-q-geste="${ui.animDep.quoi || ''}"` : ''}>
        <svg data-q-scene2 viewBox="${vx} ${vy} ${vw} ${vh}" role="group" aria-label="${ech(R.lieu.nom)} vu de l’intérieur : le camion à quai, ${ech(minuscule(quiSort))} au chariot, la ${ech(zoneMin)} et ses cases">
          ${defsIso()}<g data-g="iso" aria-hidden="true">${im.iso}</g><g data-g="cases">${coucheCases(e)}</g><g data-g="bulle" aria-hidden="true">${texte ? bulleDep(vis.pos, texte) : ''}</g>
        </svg>
        <div class="quai-legende" data-q-leg>${ech(im.leg)}</div>
      </div>
      ${choix ? `<p class="quai-consigne-depose">${ech(quiSort)} sort les palettes une à une. Pour chacune, <b>clique la case de la ${ech(zoneMin)}</b> où il doit la poser.</p>` : ''}
      <p class="quai-sr" aria-live="polite" data-q-annonce></p>
      ${bandeau}${barre}
      ${A.consignes ? `<p class="quai-aide">Sur une plateforme, c’est <b>un cariste</b> qui décharge, au chariot élévateur.${ARRET ? '' : ' Toi, tu ne signes rien tant que tu n’as pas compté.'}</p>` : ''}`;
    }
    if (ISO) {
      return `<div class="quai-scene2 quai-iso">
        <svg data-q-scene2 viewBox="290 0 640 ${N > 2 ? 540 : 480}" role="img" aria-label="${ech(R.lieu.nom)} : la porte se lève, ${ech(minuscule(quiSort))} sort ${N > 1 ? 'les palettes' : 'la palette'} ${CARISTE_ISO ? 'au chariot élévateur' : 'au transpalette'} jusqu’en ${ech(zoneMin)}">
          ${defsIso()}<g data-g="iso">${im.iso}</g>
        </svg>
        <div class="quai-legende" data-q-leg>${ech(im.leg)}</div>
      </div>
      ${bandeau}${barre}
      ${A.consignes ? `<p class="quai-aide">${CARISTE_ISO ? 'Sur une plateforme, c’est <b>un cariste</b> qui décharge, au chariot élévateur.' : 'Chez un transporteur de messagerie, c’est souvent <b>le chauffeur</b> qui décharge, au transpalette.'}${ARRET ? '' : ' Toi, tu ne signes rien tant que tu n’as pas compté.'}</p>` : ''}`;
    }
    return `<div class="quai-scene2">
      <svg data-q-scene2 viewBox="${cx} ${cy} ${cw} ${chh}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${ech(R.lieu.nom)} : ${FIXE ? 'la remorque est ouverte' : 'la porte s’ouvre'}, ${ech(minuscule(quiSort))} sort les palettes une à une ${CARISTE ? 'au chariot élévateur' : 'au transpalette'}">
        <defs>
          <clipPath id="quaiCPorte"><rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}"/></clipPath>
          <clipPath id="quaiCPorte2"><rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}"/></clipPath>
          <filter id="quaiFlou" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
          ${DEFS_FILM}
        </defs>
        <image href="${ech(PH.quai)}" x="0" y="0" width="${PH.largeur}" height="${PH.hauteur}"/>
        ${FIXE ? `<g data-q-sol>${solFixe()}</g><g data-g="remorque"></g><g data-g="porte"></g>` : `<g clip-path="url(#quaiCPorte)">
          <g data-g="remorque">${im.remorque}</g>
          <g data-g="porte" transform="${im.porte}"><image href="${ech(PH.quai)}" x="0" y="0" width="${PH.largeur}" height="${PH.hauteur}" clip-path="url(#quaiCPorte2)"/></g>
        </g>`}
        ${F ? `<g aria-label="Afficheur de température du quai">
          <rect x="${ax}" y="${PORTE.y0 + 14}" width="96" height="54" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text x="${ax + 48}" y="${PORTE.y0 + 30}" text-anchor="middle" font-size="10" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${ech(R.lieu.nom.toUpperCase())}</text>
          <text data-q-afficheur x="${ax + 48}" y="${PORTE.y0 + 56}" text-anchor="middle" font-size="18" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tempQuai}</text>
        </g>` : ''}
        <g aria-label="Horloge du quai">
          <rect x="${hx}" y="${hy}" width="96" height="44" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text data-q-mur-lib x="${hx + 48}" y="${hy + 14}" text-anchor="middle" font-size="9" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${EVAL ? 'TEMPS PASSÉ' : 'HEURE DU QUAI'}</text>
          <text data-q-mur x="${hx + 48}" y="${hy + 36}" text-anchor="middle" font-size="18" font-weight="700" fill="#ffd27a" font-family="ui-monospace,Consolas,monospace">${EVAL ? mmss(e.reel) : hhmm(e.minute).slice(0, 5)}</text>
        </g>
        <g data-g="brume" filter="url(#quaiFlou)">${im.brume}</g>
        <g data-g="posees">${im.posees}</g>
        <g data-g="mobile">${im.mobile}</g>
      </svg>
      <div class="quai-legende" data-q-leg>${ech(im.leg)}</div>
    </div>
    ${bandeau}${barre}
    ${A.consignes && F && !ARRET ? `<p class="quai-aide">Le quai est réfrigéré (<b>${tempQuai}</b>, voir l'afficheur à droite de la porte), mais c'est bien plus chaud que la remorque à ${fmtT((cm.ticket && cm.ticket.consigne) || -20)}. Dès que la porte s'ouvre, <b>tout le lot sort du froid</b> : regarde la jauge en haut, elle a démarré. Le chauffeur pose les palettes ; à toi ensuite de les contrôler <b>vite et bien</b>, chaque geste coûte du temps.</p>` : ''}
    ${A.consignes && !F && !ARRET ? `<p class="quai-aide">${ech(quiSort)} pose les palettes sur le quai. À toi ensuite de les contrôler <b>une par une</b> : faire le tour, compter, lire l'étiquette, décider.</p>` : ''}`;
  }
  // Le contrôleur de l'animation, posé sur la scène affichée. Les événements du temps du quai
  // (porte ouverte, chaque palette posée) ne passent qu'une fois, jamais en « revoir » ; s'ils
  // n'ont pas tous eu lieu quand l'écran disparaît, ils sont appliqués d'un coup. Une seule
  // sauvegarde, à la fin de l'animation (15/10/2026, quota : chaque palette en coûtait une) ; une page
  // rechargée en plein déchargement le termine d'un coup à la réouverture (`html`), rien n'est perdu.
  function evenements(e, t, ci = ca(e)) {
    let fait = false;
    const k = K(e, ci), P = PAL[ci];
    if (k.evts === 0 && t >= T_OUVRE) {
      k.evts = 1; avancer(e, R.D.ouverture, `${FIXE ? 'remorque ouverte' : 'porte du quai ouverte'}, début du déchargement${M ? ` du ${nomCam(ci)}` : ''}`); fait = true;
    }
    while (k.evts >= 1 && k.evts <= P.length && t >= tPoseN(k.evts - 1)) {
      avancer(e, R.D.parPalette, `${fileP(P)[k.evts - 1].id} posée sur le quai`); k.evts++; fait = true;
    }
    return fait;
  }
  function animer(z, e, api, rejeu) {
    const svg = z.querySelector('[data-q-scene2]');
    if (!svg) return null;
    const g = (n) => svg.querySelector(`[data-g="${n}"]`);
    const N = PAL[ca(e)].length, FIN = fin(N);
    let t = 0, t0 = null, raf = null, touche = false;
    const a = {
      rejeu,
      finir() {
        cancelAnimationFrame(raf); raf = null;
        if (ui.anim === a) ui.anim = null;
        if (!rejeu && (evenements(e, FIN) || touche)) api.sauver();
      },
    };
    const dessinerT = () => {
      const im = image(t, e, false);
      if (ISO) g('iso').innerHTML = im.iso;
      else {
        g('porte').setAttribute('transform', im.porte);
        g('remorque').innerHTML = im.remorque;
        g('brume').innerHTML = im.brume;
        g('posees').innerHTML = im.posees;
        g('mobile').innerHTML = im.mobile;
      }
      const q = (s) => z.querySelector(s);
      if (q('[data-q-leg]')) q('[data-q-leg]').textContent = im.leg;
      if (q('[data-q-nb]')) q('[data-q-nb]').textContent = `${im.nb} / ${N}`;
      if (q('[data-q-past]')) q('[data-q-past]').innerHTML = im.pastilles;
    };
    const boucle = (now) => {
      if (!svg.isConnected) { a.finir(); return; }
      if (t0 === null) t0 = now - t;
      t = now - t0;
      if (!rejeu && evenements(e, t)) { touche = true; majHorloges(z, e); }
      dessinerT();
      if (t >= FIN) { a.finir(); api.redessiner(); return; }
      raf = requestAnimationFrame(boucle);
    };
    ui.anim = a;
    raf = requestAnimationFrame(boucle);
    return a;
  }

  /* ------------------------------------------------------ chambre froide (④) */
  function sceneCf(e, u) {
    if (!F) return sceneZone(e, u);
    let s = `<defs>${DEFS_FILM}</defs>`;
    s += '<rect x="0" y="0" width="640" height="300" fill="#3a4349"/>';
    s += '<polygon points="0,210 640,210 640,300 0,300" fill="#59636a"/>';
    s += '<rect x="0" y="0" width="250" height="210" fill="#d5dade"/>';
    for (let x = 0; x < 250; x += 50) s += `<line x1="${x}" y1="0" x2="${x}" y2="210" stroke="#b9c0c5" stroke-width="2"/>`;
    s += '<rect x="70" y="40" width="130" height="170" fill="#0f2233"/>';
    for (let k = 0; k < 9; k++) s += `<rect x="${72 + k * 14.2}" y="42" width="13" height="168" fill="#cfe6f7" opacity=".35"/>`;
    const tc = `${R.lieu.chambre.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.chambre.temp).toFixed(1))} °C`.replace('-', '−');
    s += `<rect x="85" y="6" width="100" height="28" rx="3" fill="#1b2228"/><text x="135" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tc}</text>`;
    s += `<text x="20" y="232" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.chambre.nom)}</text>`;
    s += '<rect x="540" y="60" width="100" height="150" fill="#cfd4d8"/><rect x="552" y="72" width="88" height="138" fill="#1d252b"/>';
    s += '<text x="590" y="232" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">Camion (refus)</text>';
    s += `<text x="320" y="292" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.nom)} · ${R.lieu.temp > 0 ? '+' : ''}${virgule(R.lieu.temp)} °C</text>`;
    const P = PAL[ca(e)];
    const acc = P.filter((p) => accepte(st(e, p))), ref = P.filter((p) => !accepte(st(e, p)));
    const items = [];
    const pasA = Math.min(48, 220 / Math.max(1, acc.length));
    acc.forEach((p, k) => {
      const x0 = 300 + k * pasA, y0 = 262, uu = Math.max(0, Math.min(1, u * 1.4 - k * .1));
      const x = x0 + (135 - x0) * uu, y = y0 + (205 - y0) * uu, ee = .55 - .15 * uu;
      items.push([y, uu >= 1 ? '' : paletteFace(p, x, y, ee), uu < 1 ? 1 - uu * .9 : 0]);
    });
    const pasR = Math.min(48, 150 / Math.max(1, ref.length));
    ref.forEach((p, k) => {
      const x0 = 420 + k * pasR, y0 = 262;
      items.push([y0, paletteFace(p, x0, y0, .55) + `<text x="${x0}" y="${y0 + 16}" text-anchor="middle" font-size="11" font-weight="700" fill="#ff9a8a" font-family="system-ui">refusée</text>`, 1]);
    });
    items.sort((a, b) => a[0] - b[0]).forEach(([, gg, o]) => { s += `<g opacity="${o.toFixed(2)}">${gg}</g>`; });
    if (u >= 1 && acc.length) s += `<text x="135" y="130" text-anchor="middle" font-size="13" fill="#cfe6f7" font-family="system-ui">${acc.length} palettes au froid ✓</text>`;
    return s;
  }
  // Quai sans froid : la zone de réception, à gauche, sans afficheur de température. La zone est un
  // marquage AU SOL (le sol commence à y = 210), son nom sur un panneau au mur ; les palettes refusées
  // attendent devant le camion, à l'écart des acceptées (aucune ne se cache derrière une autre).
  function sceneZone(e, u) {
    let s = `<defs>${DEFS_FILM}</defs>`;
    s += '<rect x="0" y="0" width="640" height="300" fill="#4a5258"/>';
    s += '<polygon points="0,210 640,210 640,300 0,300" fill="#6a737a"/>';
    s += '<polygon points="22,222 258,222 268,280 12,280" fill="none" stroke="#e3b21b" stroke-width="3" stroke-dasharray="10 6"/>';
    s += '<rect x="65" y="150" width="140" height="26" rx="3" fill="#2b3237" stroke="#e3b21b" stroke-width="1.5"/>';
    s += `<text x="135" y="168" text-anchor="middle" font-size="13" font-weight="700" fill="#f2f4f5" font-family="system-ui">${ech(R.zone.nom)}</text>`;
    s += '<rect x="540" y="60" width="100" height="150" fill="#cfd4d8"/><rect x="552" y="72" width="88" height="138" fill="#1d252b"/>';
    s += '<text x="590" y="50" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">Camion (refus)</text>';
    s += `<text x="400" y="292" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.nom)}</text>`;
    const P = PAL[ca(e)];
    const acc = P.filter((p) => accepte(st(e, p))), ref = P.filter((p) => !accepte(st(e, p)));
    const items = [];
    const pasA = Math.min(48, 150 / Math.max(1, acc.length));
    acc.forEach((p, k) => {
      const x0 = 300 + k * pasA, y0 = 262, uu = Math.max(0, Math.min(1, u * 1.4 - k * .1));
      const xf = 60 + k * Math.min(60, 150 / Math.max(1, acc.length)), yf = 268;
      items.push([y0 + (yf - y0) * uu, paletteFace(p, x0 + (xf - x0) * uu, y0 + (yf - y0) * uu, .55 - .07 * uu), 1]);
    });
    const pasR = Math.min(48, 70 / Math.max(1, ref.length));
    ref.forEach((p, k) => {
      const x0 = 530 + k * pasR, y0 = 262;
      items.push([y0, paletteFace(p, x0, y0, .55) + `<text x="${x0}" y="${y0 + 16}" text-anchor="middle" font-size="11" font-weight="700" fill="#ff9a8a" font-family="system-ui">refusée</text>`, 1]);
    });
    items.sort((a, b) => a[0] - b[0]).forEach(([, gg, o]) => { s += `<g opacity="${o.toFixed(2)}">${gg}</g>`; });
    if (u >= 1 && acc.length) s += `<text x="135" y="138" text-anchor="middle" font-size="13" fill="#f2f4f5" font-family="system-ui">${acc.length} palette${acc.length > 1 ? 's' : ''} rangée${acc.length > 1 ? 's' : ''} ✓</text>`;
    return s;
  }
  function jouerCf(z, e) {
    const svg = z.querySelector('[data-q-cf]');
    if (!svg) return;
    if (reduit()) { svg.innerHTML = sceneCf(e, 1); return; }
    let t0 = null;
    const pas = (now) => {
      if (!svg.isConnected) return;
      if (t0 === null) t0 = now;
      const u = Math.min(1, (now - t0) / 2600);
      svg.innerHTML = sceneCf(e, u);
      if (u < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  /* -------------------------------------------------------------- horloges */
  function horloges(e) {
    const lieu = `quai ${R.lieu.refrigere ? 'réfrigéré' : 'non réfrigéré'} ${R.lieu.temp > 0 ? '+' : ''}${virgule(R.lieu.temp)} °C`;
    // Une jauge par lot : un seul camion (format d'ENT-4.1), ou une par camion.
    const jauge = (ci) => {
      const k = K(e, ci), lt = M ? R.camions[ci].lettre : '', nm = M ? R.camions[ci].nom : '';
      const trop = k.decharge && k.froid > R.seuil && !e.fini && !k.rentre;
      const attr = (nom) => (M ? `${nom}="${lt}"` : nom);
      return `<div class="quai-horloge quai-h-froid">
        <div class="quai-lib">Temps hors froid ${M ? `du lot du camion ${ech(nm)}` : 'du lot'}</div>
        <div class="quai-val" ${attr('data-q-froid')}>${k.decharge ? `<span class="${k.froid > R.seuil ? 'quai-depasse' : ''}">${fmtMin(k.froid)}</span>` : `— <span class="note">${M ? 'porte fermée' : 'camion fermé'}</span>`}</div>
        <div class="quai-jauge"><i data-q-jauge style="width:${k.decharge ? Math.min(100, k.froid / (R.seuil * 1.5) * 100) : 0}%"></i></div>
        <div class="note" ${attr('data-q-nfroid')}>${trop
          ? (A.consignes ? '<span class="quai-depasse">Repère dépassé : la marchandise se réchauffe. Termine tes contrôles et rentre le lot.</span>' : '<span class="quai-depasse">Repère dépassé.</span>')
          : `${M ? 'démarre à l’ouverture de ce camion' : 'démarre quand le transporteur décharge'} · repère construit : ${R.seuil} min (${lieu})${k.rentre ? ' · arrêté : lot en chambre froide' : ''}`}</div>
      </div>`;
    };
    return `<div class="quai-horloges">
      <div class="quai-horloge">
        <div class="quai-lib">Horloge du quai (temps simulé)</div>
        <div class="quai-val" data-q-heure>${hhmm(e.minute)}</div>
        <div class="note">avance seulement quand tu fais un geste</div>
      </div>
      ${F ? R.camions.map((_, ci) => jauge(ci)).join('') : ''}
      ${EVAL ? `<div class="quai-horloge quai-h-reel">
        <div class="quai-lib">Temps passé (temps réel)</div>
        <div class="quai-val" data-q-reel>${mmss(e.reel)}</div>
        <div class="note">${e.tiersTemps ? 'mesuré, ne coupe rien · tiers-temps : seuils × 4/3' : 'mesuré, ne coupe rien : il compte dans la note de rapidité'}</div>
      </div>` : ''}
    </div>`;
  }
  // Mise à jour en place, sans redessiner (animation, chrono) : le reste de l'écran ne bouge pas.
  function majHorloges(z, e) {
    const h = z.querySelector('.quai-horloges');
    if (h) h.outerHTML = horloges(e);
    const mur = z.querySelector('[data-q-mur]');
    if (mur) mur.textContent = EVAL ? mmss(e.reel) : hhmm(e.minute).slice(0, 5);
  }

  /* ---------------------------------------------------------------- écrans */
  // Le BL d'un camion : une ligne par palette, une par référence pour une palette multi-références.
  // En-tête (commande, date d'expédition, lot) et colonne « par carton » : seulement si le contenu les déclare
  // (ENT-1.1). `expedie` : une date, ou un nombre de jours par rapport à aujourd'hui (−1 = la veille).
  const dateExpedition = (v) => (typeof v === 'number' ? new Date(Date.now() + v * 864e5).toLocaleDateString('fr-FR') : v);
  const blEntete = (ci) => {
    const c = R.camions[ci], L = [['Commande', c.commande], ['Expédié le', c.expedie != null ? dateExpedition(c.expedie) : null], ['Transporteur', c.commande || c.lot ? c.transporteur : null], ['N° de lot', c.lot]].filter(([, v]) => v);
    return L.length ? `<div class="quai-bl-entete" data-q-bl-entete>${L.map(([l, v]) => `<span>${l}</span><b${l === 'N° de lot' ? ' data-q-bl-lot' : ''}>${ech(v)}</b>`).join('')}</div>` : '';
  };
  const blHtml = (ci = 0) => {
    const parC = PAL[ci].some((p) => (p.refs || []).some((r) => r.parCarton));
    const lignes = PAL[ci].map((p) => (p.refs || [p]).map((r) => `<tr><td>${ech(p.id)}</td><td class="mono">${ech(r.ref)}</td><td>${ech(r.nom)}</td><td class="num">${r.bl}</td>${parC ? `<td class="num">${ech(r.parCarton || '')}</td>` : ''}</tr>`).join('')).join('');
    const total = parC ? `<tr class="quai-bl-total"><td colspan="3">${PAL[ci].length} palette${PAL[ci].length > 1 ? 's' : ''}${PAL[ci].some((p) => p.refs) ? ' mixte' + (PAL[ci].length > 1 ? 's' : '') : ''}</td><td class="num"><b>${PAL[ci].reduce((t, p) => t + p.bl, 0)}</b></td><td></td></tr>` : '';
    return `${blEntete(ci)}<table class="quai-bl"><thead><tr><th>Palette</th><th>Réf.</th><th>Désignation</th><th class="num">${ech(maj(R.u.des))}</th>${parC ? `<th class="num">Par ${ech(R.u.un)}</th>` : ''}</tr></thead>
    <tbody>${lignes}${total}</tbody></table>`;
  };
  function ticketTexte(ci = 0) {
    const cm = R.camions[ci], T = cm.ticket || {};
    const lignes = ['  ENREGISTREUR TEMP.  ', ` Remorque ${T.remorque || ''}  ${T.societe || ''}`, ` Consigne : ${Number(T.consigne ?? -20).toFixed(1)} C`,
      ` Depart  : ${T.depart || '00:00'}`, ' --------------------- ', '  HEURE      TEMP. C'];
    (T.releves || []).forEach(([h, t]) => lignes.push(`  ${h}      ${Number(t).toFixed(1).padStart(6)}`));
    lignes.push(' --------------------- ', ` Arrivee : ${cm.arrivee || ''}`, ' Signature chauffeur :', '', '  ~~~~~~~~~~~~~~~~~ ');
    return lignes.join('\n');
  }
  // Le ticket d'un camion et la question « ce que montre le ticket » (`data-c` : le camion).
  function blocTicket(e, ci) {
    const cm = R.camions[ci], k = K(e, ci);
    const choix = (cm.qcmTicket && cm.qcmTicket.choix) || QCM_TICKET;
    const c = M ? ` data-c="${ci}"` : '';
    return `<button class="btn" data-q="ticket"${c} ${k.ticketLu || e.fini ? 'disabled' : ''}>Lire le ticket${M ? ` du camion ${ech(cm.nom)}` : ''} <span class="quai-cout">· ${fmtMin(C.ticket)}</span></button>
      ${k.ticketLu ? `<div class="quai-ticket" data-q-ticket${M ? `="${cm.lettre}"` : ''}>${ech(ticketTexte(ci))}</div>
      <div class="quai-qcm" role="radiogroup" aria-label="Ce que montre le ticket${M ? ` du camion ${ech(cm.nom)}` : ''}">
        <b>Ce que montre le ticket :</b>
        ${choix.map((x) => `<label><input type="radio" name="quaiTicket${M ? `-${ci}` : ''}" data-q="ticketRep"${c} value="${ech(x.v)}" ${k.ticketRep === x.v ? 'checked' : ''} ${e.fini ? 'disabled' : ''}> ${ech(x.lib)}</label>`).join('')}
      </div>` : ''}`;
  }

  function ecran1(e) {
    if (M) return ecran1Multi(e);
    if (!F) return ecran1SansFroid(e);
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="Remorques frigorifiques à quai devant un entrepôt">
        <div class="quai-legende">${ech(cam.arrivee || '')} — ${ech(R.lieu.nom)}. Le camion de ${fictif(cam.transporteur, cam.fictif)} vient de se mettre à quai, portes fermées.</div>
      </div>
      <div class="quai-chauffeur">${silhouette()}
        <p><b>Le chauffeur :</b> « Bonjour, livraison ${ech(cam.fournisseur)} pour le ${ech(lieuMin)}. Voilà mon bon de livraison et le ticket de l'enregistreur. Je peux ouvrir ? »</p>
      </div>
      <div class="quai-grille2">
        <div class="quai-doc">
          <div class="quai-doc-titre">📄 ${ech(DOC)}</div>
          ${blHtml()}
          <div class="quai-reconst">BL n° ${ech(cam.bl)} — Document pédagogique, reconstitution, non contractuel.</div>
        </div>
        <div class="quai-doc">
          <div class="quai-doc-titre">🧾 Ticket de l'enregistreur de température</div>
          ${blocTicket(e, 0)}
        </div>
      </div>
      <p class="note">Tant que les portes sont fermées, la marchandise est au froid : c'est le bon moment pour lire les papiers.</p>
      <p><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini || !secuFaite(e) ? 'disabled' : ''}>« Oui, vous pouvez ouvrir et décharger »</button>
        <span class="quai-cout">le chauffeur pose toutes les palettes sur le quai ; le temps hors froid démarre · durée : ${formule()}</span></p>
    </section>`;
  }

  // L'étape ⓪ : constater avant de décharger (lot 5). Les réponses se figent quand le déchargement commence.
  function ecran0(e) {
    const sec = e.securite, fige = sec.fait || e.fini, dis = fige ? 'disabled' : '';
    const S0 = SEC, sig = S0.signaler || {};
    // Chaque point : deux boutons « OK » / « Pas OK », comme la décision du poste de contrôle.
    const lignes = S0.points.map((x) => `<tr data-q-point="${ech(x.id)}"><th scope="row" id="qLibSecu-${ech(x.id)}">${ech(x.lib)}</th>
        <td><div class="quai-choix" role="radiogroup" aria-labelledby="qLibSecu-${ech(x.id)}">${['ok', 'ko'].map((v) => `<button type="button" id="qSecu-${ech(x.id)}-${v}" role="radio" aria-checked="${sec.rep[x.id] === v}" class="${sec.rep[x.id] === v ? 'on' : ''}" data-q="secu" data-p="${ech(x.id)}" data-v="${v}" ${dis}>${v === 'ok' ? 'OK' : 'Pas OK'}</button>`).join('')}</div></td></tr>`).join('');
    return `<section class="quai-carte" data-q-securite>
      <h2 class="quai-h2"><span class="quai-pastille-etape">0</span>Avant de décharger : la sécurité</h2>
      ${S0.photo ? `<div class="quai-photo"><img src="${ech(S0.photo)}" alt="${ech(S0.alt || 'Le camion à quai')}"></div>` : ''}
      <p class="quai-secu-scene">${ech(S0.scene || '')}</p>
      <table class="quai-secu"><thead><tr><th scope="col">À vérifier</th><th scope="col">Mon constat</th></tr></thead><tbody>${lignes}</tbody></table>
      ${sec.chef ? `<div class="quai-alerte" role="status" data-q-secu-chef><b>Le chef de quai :</b> « ${ech(sec.chef)} »</div>` : ''}
      ${ui.arretSecu ? `<div class="quai-alerte" role="alert" data-q-secu-arret><b>Le chef de quai :</b> « ${ech(S0.arret || 'Stop ! Avant d’entrer dans la remorque, tout doit être en sécurité. Regarde encore la liste et signale ce qui ne va pas.')} »</div>` : ''}
      <p class="quai-ligne">
        <button class="btn" data-q="signaler" ${dis}>${ech(sig.bouton || 'Signaler au chef de quai')}</button>
        <button class="btn btn-p" data-q="commencer" ${dis}>${ech(S0.commencer || 'Commencer à décharger')} →</button>
      </p>
      ${sec.fait ? '<p class="note">Le déchargement a commencé : ce constat est figé.</p>' : ''}
    </section>`;
  }

  /* ------------------------------------------------ l'inspection sur la scène (mode scène, D-4) */
  // Voir `verifierQuai` pour le contenu et le brief `docs/briefs/MOTEUR-quai-inspection.md` §2.2 pour le comportement. Les
  // états des objets ne sont JAMAIS rangés : `etatsScene` les calcule depuis les signaux envoyés et le figeage. Rien dans le
  // DOM de la scène ne nomme un objet (ni `title`, ni `tabindex`, ni `role`, ni attribut `data-*` : les zones se calculent).
  const SG = SCENE ? Object.assign({ qui: 'le chef de quai', rien: 'Là, je ne vois rien qui cloche.', fin: 'Tu me dis quand on peut décharger.',
    vide: 'Qu’est-ce qui ne va pas ? Clique d’abord sur ce que tu veux me signaler.' }, SEC.signaler || {}) : null;
  // « à le chef de quai » se dit « au chef de quai ».
  const aQui = (q) => (/^le /i.test(q) ? `au ${q.slice(3)}` : /^les /i.test(q) ? `aux ${q.slice(4)}` : /^la /i.test(q) ? `à la ${q.slice(3)}` : `à ${q}`);
  const majuscule = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);
  // Le chauffeur descendu de sa cabine : près de l'accueil chauffeurs, assez à gauche pour que sa bulle tienne dans le cadre.
  const X_CH = 6.4, Y_CH = 2.2;
  // La vue « dehors » dans l'état `et` : façade, camion (cabine, fumée, cale), horloge, et le chauffeur s'il est descendu.
  // `o.yr` : le recul du camion ; `o.cale` : poser la cale (faux pendant la manœuvre) ; `o.bulle` : le chauffeur parle.
  function decorDehors(et, o = {}) {
    const I = projeterScene('dehors');
    const conduit = et.cabine === 'conduite';
    const cote = Object.assign({}, conduit ? { cabine: 'conduite', fumee: true } : {}, et.cale && o.cale !== false ? { cale: et.cale } : {});
    const facade = Object.assign(SEC.points.some((p) => p.objet === 'butoirs') ? { butoirs: { porte: PORTE_CAMION, etat: et.butoirs } } : {}, R.escalier ? { escalier: true } : {});
    let s = facadeQuai(I, PORTES, facade) + camionPorteur(I, X_PORTE_FACADE[PORTE_CAMION], o.yr != null ? o.yr : YR_QUAI, cote)
      + horlogeQuai(I, 0.2, 0.01, 2.35, cam.arrivee || '');
    if (o.chauffeur) {
      s += personne(I, X_CH, Y_CH);
      if (o.bulle) { const [bx, by] = I.P(X_CH, Y_CH, HAUT_PERSONNE); s += bulle(bx + 6, by - 4, couper(paroleArrivee())); }
    }
    return s;
  }
  // La vue « dedans » : l'intérieur du quai, la porte levée de `ouv` (0 fermée, 1 ouverte), la remorque et ses palettes vues par
  // l'ouverture, le niveleur et la lampe dans leur état, une personne sur le quai. Aucune palette n'est encore sortie.
  function decorDedans(et, ouv, e) {
    const I = I2;
    const lp = et.lampe ? lampeQuai(I, et.lampe) : { cone: '', tete: '' };
    const pasDep = PAL[0].every(estFut) ? 1.05 : 1.3;
    const pal = fileP(PAL[0]).map((p, n) => [p, ISO_X + (0.8 - gabarit(p)[0]) / 2, ISO_YDEP - n * pasDep]).sort((a, b) => a[2] - b[2])
      .map(([p, x, y]) => palSvg(I, p, x, y, 3, { yMin: -3.6, yMax: 0, lisible: false })).join('');
    return solQuai(I, R.zone.nom)
      + `<g clip-path="url(#quaiIsoOuv)">${remorqueInterieur(I)}${niveleur(I, 'dedans', et.niveleur)}${lp.cone}${pal}</g>`
      + murQuai(I, ouv, R.lieu.nom) + niveleur(I, 'dehors', et.niveleur) + lp.tete
      + personne(I, 6.0, 1.4) + horlogeQuai(I, 6.6, 0.01, 2.25, hhmm(e.minute).slice(0, 5));
  }
  // Les marques posées sur la vue `vue` : un rond d'encre à contour épais et son numéro (ni vert ni rouge : ce n'est pas un
  // verdict). Une marque envoyée est grisée en tirets et n'est plus cliquable.
  const marquesSvg = (sec, vue) => sec.marques.filter((m) => m.vue === vue).map((m) => {
    const env = m.envoi != null;
    return `<g data-q-marque="${m.n}"><circle cx="${m.x}" cy="${m.y}" r="12" fill="rgba(255,255,255,.88)" stroke="${env ? '#6b6b6b' : '#1a1915'}" stroke-width="${env ? 2 : 3.5}"${env ? ' stroke-dasharray="4 3" opacity=".55"' : ''}/>`
      + `<text x="${m.x}" y="${(m.y + 4.6).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" font-family="system-ui,sans-serif" fill="#1a1915">${m.n}</text></g>`;
  }).join('');
  const texteMarques = (sec) => { const n = sec.marques.filter((m) => m.envoi == null).length; return n ? `${n} marque${n > 1 ? 's' : ''} à envoyer` : ''; };
  const ouvertureLevee = () => (ui.levee == null ? 1 : Math.min(1, (performance.now() - ui.levee) / T_PORTE));
  // L'écran d'inspection : la consigne, la scène (l'une des deux vues), les boutons, la réponse du chef de quai.
  function inspection(e) {
    const sec = e.securite;
    const vue = sec.ouverte && ui.vueScene === 'dedans' ? 'dedans' : 'dehors';
    const et = etatsScene(SEC, sec);
    const ouv = vue === 'dedans' ? ouvertureLevee() : 0;
    if (ui.levee != null && ouv >= 1) ui.levee = null;
    const [vx, vy, vw, vh] = VUES_SCENE[vue].viewBox;
    const decor = vue === 'dehors' ? decorDehors(et, { chauffeur: et.cabine !== 'conduite' }) : decorDedans(et, ouv, e);
    const dis = e.fini ? 'disabled' : '';
    const versVue = !sec.ouverte ? `<button class="btn" data-q="sc-ouvrir" ${dis}>Ouvrir la porte de quai</button>`
      : vue === 'dehors' ? `<button class="btn" data-q="sc-vue" data-v="dedans" ${dis}>Voir dedans →</button>` : `<button class="btn" data-q="sc-vue" data-v="dehors" ${dis}>← Revoir dehors</button>`;
    return `<div data-q-securite-scene>
      <p class="quai-secu-scene" data-q-consigne>${ech(SEC.consigne || 'Clique sur ce qui ne va pas, puis signale-le.')}</p>
      <div class="quai-scene2 quai-iso quai-inspection">
        <svg data-q-inspection data-vue="${vue}" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="${vue === 'dehors' ? 'Le quai vu de dehors' : 'Le quai vu de l’intérieur'}">${vue === 'dedans' ? defsIso() : ''}<g data-g="iso">${decor}</g><g data-q-marques>${marquesSvg(sec, vue)}</g></svg>
      </div>
      <p class="quai-ligne">${versVue}</p>
      <div data-q-secu-chef role="status" ${sec.chef ? 'class="quai-alerte"' : ''}>${sec.chef ? `<b>${ech(majuscule(SG.qui))} :</b> « ${ech(sec.chef)} »` : ''}</div>
      ${ui.arretSecu ? `<div class="quai-alerte" role="alert" data-q-secu-arret><b>${ech(majuscule(SG.qui))} :</b> « ${ech(typeof SEC.arret === 'string' ? SEC.arret : PAROLE_ARRET)} »</div>` : ''}
      <p class="quai-ligne">
        <button class="btn" data-q="sc-signaler" ${dis}>${ech(SG.bouton || `Signaler ${aQui(SG.qui)}`)}</button>
        <span class="note" data-q-nb-marques>${texteMarques(sec)}</span>
        <button class="btn btn-p${ui.armeScene ? ' quai-arme' : ''}" data-q="sc-decharger" ${dis}>${ui.armeScene ? 'On décharge, c’est définitif : cliquez pour confirmer' : `${ech(SEC.commencer || 'C’est bon, on peut décharger')} →`}</button>
        ${ui.armeScene ? '<button class="btn" data-q="sc-desarmer">Annuler</button>' : ''}
      </p>
    </div>`;
  }
  // « Signaler » : les marques pas encore envoyées partent en un signal. La réponse se compose : la réparation de chaque défaut
  // touché qui ne l'était pas encore (dans l'ordre de déclaration), « rien » une seule fois s'il y a une marque à côté, un
  // point conforme ou un défaut déjà réparé, puis la fin. Les états réparés ne sont pas rangés : `etatsScene` les relit.
  function signalerScene(e, api, signal) {
    const sec = e.securite;
    if (!sec || sec.fait) return;
    ui.armeScene = false;
    const envoyer = sec.marques.filter((m) => m.envoi == null);
    if (!envoyer.length) { sec.chef = SG.vide; api.sauver(); api.redessiner(); return; }
    const deja = new Set();
    sec.signaux.forEach((g) => (g.points || []).forEach((id) => deja.add(id)));
    const points = [...new Set(envoyer.map((m) => m.point).filter(Boolean))];
    const rien = envoyer.filter((m) => !m.point).length;
    sec.signaux.push({ points, rien, marques: envoyer.map((m) => m.n), apresArret: !!sec.arrete });
    envoyer.forEach((m) => { m.envoi = sec.signaux.length; });
    const textes = SEC.points.filter((x) => points.includes(x.id) && !x.ok && !deja.has(x.id)).map((x) => x.repare || 'Bien vu, je m’en occupe.');
    if (rien > 0 || SEC.points.some((x) => points.includes(x.id) && (x.ok || deja.has(x.id)))) textes.push(SG.rien);
    textes.push(SG.fin);
    sec.chef = textes.join(' ');
    ui.arretSecu = false;
    signal('signaler');
    api.sauver(); api.redessiner();
  }
  // « C'est bon, on peut décharger » (second clic) : un défaut jamais signalé arrête l'élève (sauf `arret: false` et en
  // évaluation) ; sinon l'inspection est figée, les défauts restants passent à l'état sûr sans un mot, et la suite d'aujourd'hui
  // commence (le chauffeur descendu parle, le BL, « Oui, vous pouvez décharger »).
  function validerScene(e, api, signal) {
    const sec = e.securite;
    if (!sec || sec.fait) return;
    const signales = new Set();
    sec.signaux.forEach((g) => (g.points || []).forEach((id) => signales.add(id)));
    const oublie = SEC.points.some((x) => !x.ok && !signales.has(x.id));
    if (oublie && !EVAL && SEC.arret !== false) { sec.arrete = true; ui.arretSecu = true; api.sauver(); api.redessiner(); return; }
    signal('decharger');
    sec.fait = true; sec.marques = sec.marques.filter((m) => m.envoi != null);
    ui.arretSecu = false; ui.armeScene = false; ui.vueScene = 'dehors'; ui.levee = null;
    e.etape = 1;
    api.sauver(); api.redessiner(); if (api.haut) api.haut();
  }
  // Le branchement de l'écran d'inspection : boutons, et un seul écouteur de clic sur le <svg> (le décor est réécrit par
  // `innerHTML`, les nœuds changent ; le <svg> et la couche des marques, eux, restent).
  function brancherScene(z, e, api, on, geste) {
    const sec = e.securite;
    const signal = (n) => { if (api.signal) api.signal(`scene:${Q.id}:${n}`); };
    const actif = () => !e.fini && !sec.fait;
    on('sc-ouvrir', geste(() => {
      if (!actif() || sec.ouverte) return;
      sec.ouverte = true; ui.vueScene = 'dedans'; ui.armeScene = false;
      ui.levee = reduit() ? null : performance.now();   // moins d'animations : la porte est levée tout de suite
      api.sauver(); api.redessiner();
    }));
    on('sc-vue', geste((ev, b) => {
      if (!actif()) return;
      ui.vueScene = b.dataset.v === 'dedans' && sec.ouverte ? 'dedans' : 'dehors';
      if (ui.vueScene === 'dehors') ui.levee = null;
      ui.armeScene = false;
      api.redessiner();
    }));
    on('sc-signaler', geste(() => signalerScene(e, api, signal)));
    on('sc-decharger', geste(() => {
      if (!actif()) return;
      if (!secondClic(ui, 'armeScene')) { api.redessiner(); return; }
      validerScene(e, api, signal);
    }));
    on('sc-desarmer', () => { ui.armeScene = false; api.redessiner(); });
    const svg = z.querySelector('[data-q-inspection]');
    if (!svg) return;
    const vue = svg.dataset.vue, decor = svg.querySelector('[data-g="iso"]'), couche = svg.querySelector('[data-q-marques]');
    // La porte qui se lève (1,8 s) : seul le décor est réécrit, les marques et les écouteurs restent.
    if (vue === 'dedans' && ui.levee != null) {
      const pas = () => {
        if (!svg.isConnected) return;
        const u = ouvertureLevee();
        decor.innerHTML = decorDedans(etatsScene(SEC, sec), u, e);
        if (u >= 1) { ui.levee = null; return; }
        requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    }
    svg.addEventListener('click', (ev) => {
      if (!actif() || ui.levee != null) return;   // pendant la levée de la porte, la scène ne répond pas
      const sur = ev.target.closest && ev.target.closest('[data-q-marque]');
      if (sur) {
        // Une marque pas encore envoyée se retire d'un clic ; une marque envoyée est inerte (ni retirée, ni nouvelle marque dessous).
        const k = sec.marques.findIndex((m) => m.n === +sur.getAttribute('data-q-marque'));
        if (k >= 0 && sec.marques[k].envoi == null) { sec.marques.splice(k, 1); changerMarques(); }
        return;
      }
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const M = svg.getScreenCTM();
      if (!M) return;
      const p = pt.matrixTransform(M.inverse());
      const [vx, vy, vw, vh] = VUES_SCENE[vue].viewBox;
      if (p.x < vx || p.x > vx + vw || p.y < vy || p.y > vy + vh) return;   // dans la marge autour du dessin
      const x = Math.round(p.x * 10) / 10, y = Math.round(p.y * 10) / 10;
      sec.compteur = (sec.compteur || 0) + 1;
      sec.marques.push({ n: sec.compteur, vue, x, y, point: pointTouche(SEC, etatsScene(SEC, sec), vue, x, y), envoi: null });
      changerMarques();
    });
    function changerMarques() {
      api.sauver();
      if (ui.armeScene) { ui.armeScene = false; api.redessiner(); return; }
      couche.innerHTML = marquesSvg(sec, vue);
      const t = z.querySelector('[data-q-nb-marques]');
      if (t) t.textContent = texteMarques(sec);
    }
  }

  // Rendu iso : le camion recule à la porte (une fois par ouverture de page, sauf « Revoir »), puis le chauffeur
  // parle et remet le BL ; alors seulement viennent le BL et « Oui, vous pouvez décharger ».
  const arriveeVue = (e) => !ui.rejeu1 && (ui.arrivee || e.decharge || reduit());
  function ecran1Iso(e) {
    const vu = arriveeVue(e);
    // Mode scène, inspection pas encore figée : une fois l'arrivée jouée, la scène à inspecter remplace l'animation ; ni bulle ni BL.
    const inspecte = SCENE && !e.securite.fait;
    if (inspecte && vu) return `<section class="quai-carte">${inspection(e)}</section>`;
    const apres = `<div class="quai-apres-arrivee" data-q-apres-arrivee ${vu ? '' : 'hidden'}>
        <div class="quai-doc quai-papier">
          <div class="quai-doc-titre">📄 ${ech(DOC)} n° ${ech(cam.bl)}${cam.fournisseur ? ` — ${ech(cam.fournisseur)}` : ''}</div>
          ${blHtml()}
          <div class="quai-reconst">Document pédagogique, reconstitution, non contractuel.</div>
        </div>
        ${Q.noteBL ? `<p class="note">${ech(Q.noteBL)}</p>` : ''}
        <p class="quai-ligne"><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini || !secuFaite(e) ? 'disabled' : ''}>« Oui, vous pouvez décharger »</button>
          <button class="btn" data-q="revoir1" data-libre>↺ Revoir l’arrivée</button>
          <span class="quai-cout">${ech(quiSort)} pose ${PAL[0].length > 1 ? 'les palettes' : 'la palette'} en ${ech(zoneMin)} · durée : ${formule()}</span></p>
      </div>`;
    return `<section class="quai-carte">
      <div class="quai-scene2 quai-iso">
        <svg data-q-arrivee viewBox="70 -30 800 520" role="img" aria-label="${ech(R.lieu.nom)} : un camion porteur recule à la porte. Le chauffeur : « ${ech(paroleArrivee())} »">${sceneArrivee(vu ? D_ARRIVEE : 0, e)}</svg>
        <div class="quai-legende" data-q-leg>${ech(legArrivee(vu))}</div>
      </div>
      ${SCENE && vu ? '' : `<p class="quai-ligne" data-q-passer1 ${vu ? 'hidden' : ''}><button class="btn" data-q="passer1" data-libre>⏩ Passer l'animation</button></p>`}
      ${inspecte ? '' : apres}
    </section>`;
  }
  // Un redessin en pleine manœuvre (autre geste, autre écran) : la manœuvre reprend où elle en était (`ui.t0a`).
  function animerArrivee(z, api, e) {
    const svg = z.querySelector('[data-q-arrivee]');
    if (!svg) return;
    let fini = false;
    const finir = () => {
      if (fini) return; fini = true;
      ui.arrivee = true; ui.rejeu1 = false; ui.anim1 = null; ui.t0a = null;
      if (svg.isConnected) api.redessiner();
    };
    const pas = (now) => {
      if (fini || !svg.isConnected) return;
      if (ui.t0a == null) ui.t0a = now;
      const t = now - ui.t0a;
      svg.innerHTML = sceneArrivee(t, e);
      if (t >= D_ARRIVEE) { finir(); return; }
      requestAnimationFrame(pas);
    };
    ui.anim1 = { finir };
    requestAnimationFrame(pas);
  }

  // Quai sans froid : le BL seul (pas de ticket), puis l'ordre de décharger.
  function ecran1SansFroid(e) {
    if (ISO) return ecran1Iso(e);
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="${ech(PH.altArrivee || 'Camion à quai devant un entrepôt')}">
        <div class="quai-legende">${ech(cam.arrivee || '')} — ${ech(R.lieu.nom)}. Le camion de ${fictif(cam.transporteur, cam.fictif)} est à quai, portes fermées.</div>
      </div>
      <div class="quai-chauffeur">${silhouette()}
        <p><b>Le chauffeur :</b> « ${ech(cam.parole || `Bonjour, livraison ${cam.fournisseur || ''}. Voilà mon bon de livraison. Je peux ouvrir ?`)} »</p>
      </div>
      <div class="quai-doc">
        <div class="quai-doc-titre">📄 ${ech(DOC)}</div>
        ${blHtml()}
        <div class="quai-reconst">BL n° ${ech(cam.bl)} — Document pédagogique, reconstitution, non contractuel.</div>
      </div>
      <p><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini || !secuFaite(e) ? 'disabled' : ''}>« Oui, vous pouvez ouvrir et décharger »</button>
        <span class="quai-cout">${ech(quiSort)} ${CARISTE ? 'sort' : 'pose'} toutes les palettes sur le quai · durée : ${formule()}</span></p>
    </section>`;
  }

  // Plusieurs camions : les papiers de chacun, puis le choix de l'ordre et sa justification, puis
  // un camion à la fois sur l'unique quai.
  const tousLus = (e) => !F || R.camions.every((_, ci) => K(e, ci).ticketLu);
  const auQuai = (e) => R.camions.findIndex((_, ci) => K(e, ci).decharge && !K(e, ci).signe);
  function peutDecharger(e, ci) {
    const k = K(e, ci);
    if (k.decharge || e.fini) return false;
    if (!secuFaite(e)) return false;
    if (!unDecharge(e, R)) return tousLus(e) && e.ordre && e.ordre.premier === ci && !!e.ordre.phrase;
    return auQuai(e) < 0;
  }
  function boutonDecharger(e, ci) {
    const premier = !unDecharge(e, R);
    const lib = premier ? `« Oui, vous pouvez ouvrir et décharger » — camion ${ech(R.camions[ci].nom)}` : `Faire mettre à quai le camion ${ech(R.camions[ci].nom)} et décharger`;
    const cout = premier ? `durée : ${formule(ci)}` : `manœuvre ${fmtMin(R.manoeuvre)}, puis ${formule(ci)}`;
    return `<p class="quai-ligne"><button class="btn btn-p" data-q="decharger" data-c="${ci}" ${peutDecharger(e, ci) ? '' : 'disabled'}>${lib}</button>
      <span class="quai-cout">${cout}</span></p>`;
  }
  function ecran1Multi(e) {
    const O = Q.ordre || {}, o = e.ordre || {}, engage = unDecharge(e, R), lus = tousLus(e);
    const etat = (ci) => { const k = K(e, ci); return k.signe ? 'reparti, BL signé' : k.decharge ? 'à quai, porte ouverte' : 'attend porte fermée'; };
    const cartes = R.camions.map((c, ci) => `<div class="quai-doc" data-q-camion="${ech(c.lettre)}">
        <div class="quai-doc-titre">🚚 Camion ${ech(c.nom)} — arrivé à ${ech(c.arrivee || '')}</div>
        <p class="note">${fictif(c.fournisseur, c.fictif)} · transporteur ${fictif(c.transporteur, c.fictif)} · ${PAL[ci].length} palettes · <b data-q-etat-camion>${etat(ci)}</b></p>
        <div class="quai-chauffeur">${silhouette(36)}<p><b>Le chauffeur :</b> « ${ech(c.parole || `Bonjour, livraison ${c.fournisseur}. Voilà mon bon de livraison et le ticket de l'enregistreur.`)} »</p></div>
        <div class="quai-doc-titre">📄 ${ech(DOC)}</div>
        ${blHtml(ci)}
        <div class="quai-reconst">BL n° ${ech(c.bl)} — Document pédagogique, reconstitution, non contractuel.</div>
        <div class="quai-doc-titre" style="margin-top:10px">🧾 Ticket de l'enregistreur de température</div>
        ${blocTicket(e, ci)}
      </div>`).join('');
    const radios = (nom, q, items, val) => items.map((x) => `<label><input type="radio" name="${nom}" data-q="${q}" value="${ech(x.v)}" ${String(val) === String(x.v) ? 'checked' : ''} ${engage || e.fini ? 'disabled' : ''}> ${ech(x.lib)}</label>`).join('');
    const choix = lus ? `<div class="quai-grille2">
        <div class="quai-qcm" role="radiogroup" aria-label="Le camion à décharger en premier">${radios('quaiPremier', 'premier', R.camions.map((c, ci) => ({ v: ci, lib: `Le camion ${c.nom}` })), o.premier)}</div>
        <div class="quai-qcm" role="radiogroup" aria-label="Pourquoi"><b>Pourquoi ?</b>${radios('quaiPhrase', 'phrase', O.phrases || [], o.phrase)}</div>
      </div>` : '<p class="note">Lis d’abord le ticket de chaque camion : c’est là que se décide l’ordre.</p>';
    const suite = engage ? R.camions.map((_, ci) => (K(e, ci).decharge ? '' : boutonDecharger(e, ci))).join('')
      : (o.premier != null && R.camions[o.premier] ? boutonDecharger(e, o.premier) : '');
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="Remorques frigorifiques à quai devant un entrepôt">
        <div class="quai-legende">${ech(hhmm(0))} — ${ech(R.lieu.nom)}. ${['', 'Un', 'Deux', 'Trois', 'Quatre'][R.camions.length] || R.camions.length} camions frigorifiques attendent, portes fermées. Un seul quai : un camion à la fois.</div>
      </div>
      <div class="quai-grille2">${cartes}</div>
      <p class="note">Tant que les portes sont fermées, rien ne sort du froid du camion : c'est le bon moment pour lire les papiers.</p>
      <div class="quai-doc" data-q-ordre>
        <div class="quai-doc-titre">${ech(O.question || 'Quel camion faites-vous décharger en premier ?')}</div>
        ${choix}
        ${suite}
      </div>
    </section>`;
  }

  // Le choix du camion montré aux étapes ③ et ④ (seulement les camions déjà ouverts).
  const choixCamion = (e) => (M ? `<div class="quai-onglets" role="tablist" aria-label="Camion">${R.camions.map((c, ci) => (K(e, ci).decharge
    ? `<button role="tab" data-q="camion" data-libre data-c="${ci}" aria-selected="${ci === ca(e)}" class="${ci === ca(e) ? 'on' : ''}">🚚 Camion ${ech(c.nom)}<span class="quai-etat">${K(e, ci).signe ? 'reparti' : 'à quai'}</span></button>` : '')).join('')}</div>` : '');

  function zoomEtiquette(p, s, cm) {
    const cle = s.etiqMontre || (s.etiqVue ? 'avant' : null);
    if (!cle) return `<span class="note">🔍 Clique sur l'étiquette d'un ${R.u.un} pour la lire de près (${fmtMin(C.etiquette)}).</span>`;
    if (cle === 'avant' && p.etiqAvant === 'dechiree') {
      return `<div class="quai-etiq quai-etiq-dechiree" data-q-etiquette>${ech(cm.fournisseur)}${F ? ' — produit surgelé, cons…' : ' — …'}<br><i>(étiquette déchirée : la référence et la désignation sont arrachées, illisibles)</i></div>`;
    }
    const r = p.refs ? (p.refs.find((x) => x.ref === cle) || p.refs[0]) : null;
    const et = r ? r.etiq : p.etiq;
    return `<div class="quai-etiq" data-q-etiquette><b>${ech(cm.fournisseur)}</b>${F ? ' — produit surgelé, conserver à −18 °C' : ''}<br>Réf. ${ech(et.ref)}<br><b>${ech(et.nom)}</b><br>Contenu : ${ech(et.poids)}<br>Lot : ${ech(et.lot)}${et.ddm ? ` · À consommer de préférence avant fin : ${ech(et.ddm)}` : ''}<div class="quai-code">||| |||| || ||||| | ||| 3 760000 ${ech(String(et.ref).replace('-', ''))}</div></div><div class="quai-reconst">Étiquette reconstituée, non contractuelle.</div>`;
  }

  // Ce que dit l'onglet d'une palette.
  const etatOnglet = (q, sq) => (sq.valide ? '✓ validée'
    : [F && sq.sonde !== null ? 'sondée' : null, (q.refs ? sq.comptes && Object.keys(sq.comptes).length : sq.compte !== null) ? 'comptée' : null,
      sq.decision ? 'décidée' : null].filter(Boolean).join(', ') || 'à contrôler');
  // La phrase sous le comptage : ce qui est noté, ou comment le noter.
  const texteCompte = (p, s) => {
    if (p.refs) {
      const notes = p.refs.filter((r) => s.comptes && s.comptes[r.ref] != null && s.comptes[r.ref] !== '');
      return notes.length ? `Comptage noté : ${notes.map((r) => `${r.ref} : ${s.comptes[r.ref]} (BL : ${r.bl})`).join(' · ')}.` : 'Tape chaque total puis Entrée : il est noté.';
    }
    return s.compte !== null && s.compte !== undefined ? `Comptage noté : ${s.compte} ${R.u.des} (BL : ${p.bl}).`
      : R.calcul ? 'Reporte le résultat de ton calcul, puis Entrée : il est noté.' : 'Tape le total puis Entrée : il est noté.';
  };
  // Ce qui manque pour valider une palette (demande de Tristan, 03/10/2026) : le comptage noté (chaque
  // référence d'une palette multi-références), la décision, et un motif pour des réserves ou un refus.
  // La fiche de contrôle n'en fait pas partie : elle n'est pas corrigée.
  const manques = (p, s) => ({
    compte: !(p.refs ? p.refs.every((r) => s.comptes && s.comptes[r.ref] != null && s.comptes[r.ref] !== '') : s.compte !== null && s.compte !== undefined),
    decision: !s.decision,
    motif: !!s.decision && s.decision !== 'accepter' && !motifsChoisis(s).length,
  });

  // La fiche de contrôle de la palette ouverte : quatre cases (trois sans froid), l'unité à côté.
  // FICHE PAR RÉFÉRENCE (rendu iso, palette multi-références ; demande de Tristan, 06/10/2026) : une ligne par
  // référence, colonnes « RAS » (case à cocher), « Cartons endommagés », « Cartons manquants ». Comme la fiche
  // ordinaire : rien de prérempli, rien de corrigé, aucun jalon. État : `fiche.parRef[réf.] = { ras, endo, manq }`.
  const ficheParRef = (p) => ISO && !!p.refs;
  const ligneRef = (s, ref) => Object.assign({ ras: false, endo: '', manq: '' }, ((s.fiche && s.fiche.parRef) || {})[ref] || {});
  const ficheBlocRefs = (p, s, dis) => `<div class="quai-doc quai-fiche" data-q-fiche="${ech(p.id)}">
      <div class="quai-doc-titre"><span class="quai-num">3</span> 📝 Ma fiche de contrôle — ${ech(p.id)}</div>
      <table class="quai-fiche-refs"><thead><tr><th scope="col">Référence</th><th scope="col">RAS</th><th scope="col">${ech(maj(R.u.des))} endommagés</th><th scope="col">${ech(maj(R.u.des))} manquants</th></tr></thead>
        <tbody>${p.refs.map((r) => { const l = ligneRef(s, r.ref), id = `qFr-${ech(r.ref)}`;
    return `<tr data-q-fiche-ref="${ech(r.ref)}"><th scope="row" class="mono" id="${id}">${ech(r.ref)}</th>
          <td><input type="checkbox" data-q-fr="ras" data-ref="${ech(r.ref)}" aria-label="RAS ${ech(r.ref)}" ${l.ras ? 'checked' : ''} ${dis}></td>
          <td><input type="text" inputmode="numeric" autocomplete="off" class="quai-fr-nb" data-q-fr="endo" data-ref="${ech(r.ref)}" aria-label="${ech(maj(R.u.des))} endommagés ${ech(r.ref)}" value="${ech(l.endo)}" ${dis}></td>
          <td><input type="text" inputmode="numeric" autocomplete="off" class="quai-fr-nb" data-q-fr="manq" data-ref="${ech(r.ref)}" aria-label="${ech(maj(R.u.des))} manquants ${ech(r.ref)}" value="${ech(l.manq)}" ${dis}></td></tr>`; }).join('')}</tbody></table>
    </div>`;
  const ficheBloc = (p, s, dis) => (ficheParRef(p) ? ficheBlocRefs(p, s, dis) : `<div class="quai-doc quai-fiche" data-q-fiche="${ech(p.id)}">
      <div class="quai-doc-titre"><span class="quai-num">3</span> 📝 Ma fiche de contrôle — ${ech(p.id)} <span class="quai-fiche-ref">${ech(p.ref)}</span></div>
      <div class="quai-fiche-champs">${CONST.map((c) => `<label for="qFiche-${c.k}">${c.lib}</label>
        <span class="quai-fiche-val"><input id="qFiche-${c.k}" type="text" inputmode="${c.mode || 'text'}" autocomplete="off" data-q-fiche-k="${c.k}" value="${ech(s.fiche[c.k])}" ${dis}><span class="quai-unite">${c.unite}</span></span>`).join('')}</div>
    </div>`);
  // La fiche entière, en lecture, à l'étape ④ : l'élève y lit ce qu'il reporte dans ses réserves.
  // À l'étape ④, la fiche par référence se relit telle quelle (une ligne par référence).
  const ficheTableauRefs = (e, ci) => `<div class="quai-doc quai-fiche" data-q-fiche4>
      <div class="quai-doc-titre">📝 Ma fiche de contrôle <span class="quai-fiche-ref">notée à l’étape 3</span></div>
      <table class="quai-bl"><thead><tr><th>Palette</th><th>Référence</th><th>RAS</th><th>Endommagés</th><th>Manquants</th></tr></thead>
        <tbody>${PAL[ci].map((p) => (p.refs || []).map((r) => { const l = ligneRef(st(e, p), r.ref), v = (x) => (String(x || '').trim() ? ech(x) : '<span class="note">—</span>');
    return `<tr data-q-fiche4-ligne="${ech(r.ref)}"><td>${ech(p.id)}</td><td class="mono">${ech(r.ref)}</td><td data-k="ras">${l.ras ? '✓' : '<span class="note">—</span>'}</td><td data-k="endo">${v(l.endo)}</td><td data-k="manq">${v(l.manq)}</td></tr>`; }).join('')).join('')}</tbody></table>
    </div>`;
  const ficheTableau = (e, ci) => (PAL[ci].some(ficheParRef) ? ficheTableauRefs(e, ci) : ficheTableauCases(e, ci));
  const ficheTableauCases = (e, ci) => `<div class="quai-doc quai-fiche" data-q-fiche4>
      <div class="quai-doc-titre">📝 Ma fiche de contrôle <span class="quai-fiche-ref">notée à l’étape 3</span></div>
      <table class="quai-bl"><thead><tr><th>Palette</th>${CONST.map((c) => `<th>${c.court}</th>`).join('')}</tr></thead>
        <tbody>${PAL[ci].map((p) => `<tr data-q-fiche4-ligne="${ech(p.id)}"><td>${ech(p.id)}</td>${CONST.map((c) => {
    const v = String(st(e, p).fiche[c.k] || '').trim();
    return `<td data-k="${c.k}">${v ? ech(v) : '<span class="note">—</span>'}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table>
    </div>`;

  // Le thermomètre à sonde (appareil générique, sans marque), planté dans un carton : un objet, comme le
  // BL, ses couleurs ne suivent pas le thème. `anime` : l'afficheur part de la température du quai et se
  // stabilise (`animerSonde`) ; sinon il montre directement la valeur, « HOLD ».
  function sonde(p, s, anime) {
    const v = Number(s.sonde);
    return `<div class="quai-sonde" data-q-sonde="${lcd(v)}">
      <svg viewBox="0 0 330 120" role="img" aria-label="Thermomètre à sonde planté dans un ${R.u.un} de ${ech(p.id)} : ${lcd(v)} °C à cœur">
        <defs><linearGradient id="quaiSondeBoitier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5560"/><stop offset="1" stop-color="#2b333b"/></linearGradient></defs>
        <rect x="200" y="58" width="122" height="54" fill="#cfa86c" stroke="#7a5a2c"/>
        <path d="M200 70 h122" stroke="#b08a55" stroke-width="2"/>
        <text x="261" y="100" text-anchor="middle" font-size="10" fill="#5e4424" font-family="system-ui,sans-serif">${ech(p.id)}</text>
        <path d="M150 52 C180 50 196 44 214 46" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>
        <rect x="210" y="40" width="22" height="12" rx="3" fill="#2b333b"/>
        <path d="M232 46 L262 46 L262 58" fill="none" stroke="#9aa4ad" stroke-width="3"/>
        <path d="M262 58 L262 96" stroke="#b9c2ca" stroke-width="3" stroke-linecap="round"/>
        <rect x="8" y="8" width="146" height="104" rx="14" fill="url(#quaiSondeBoitier)" stroke="#1b2127"/>
        <rect x="20" y="18" width="122" height="54" rx="5" fill="#b9c7a6" stroke="#1b2127" stroke-width="2"/>
        <text data-q-lcd x="132" y="62" text-anchor="end" font-family="Consolas,'Courier New',monospace" font-size="30" font-weight="700" fill="#1e2a1a">${lcd(anime ? Number(R.lieu.temp) || 0 : v)}</text>
        <text x="134" y="34" text-anchor="end" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="#1e2a1a">°C</text>
        <text data-q-stab x="26" y="32" font-family="system-ui,sans-serif" font-size="9" font-weight="700" fill="#1e2a1a">${anime ? 'STAB…' : 'HOLD'}</text>
        <circle cx="48" cy="92" r="9" fill="#9d2727" stroke="#1b2127"/><circle cx="80" cy="92" r="9" fill="#55606a" stroke="#1b2127"/><circle cx="112" cy="92" r="9" fill="#55606a" stroke="#1b2127"/>
      </svg>
    </div>`;
  }
  // ~1,2 s pour se stabiliser, « STAB… » clignote ; `prefers-reduced-motion` : la valeur directement.
  function animerSonde(z, cible) {
    const el = z.querySelector('[data-q-lcd]'), stab = z.querySelector('[data-q-stab]');
    if (!el) return;
    const finir = () => { el.textContent = lcd(cible); if (stab) stab.textContent = 'HOLD'; };
    if (reduit()) { finir(); return; }
    const depart = Number(R.lieu.temp) || 0;
    let t0 = null;
    const pas = (t) => {
      if (!el.isConnected) return;
      if (t0 === null) t0 = t;
      const u = Math.min(1, (t - t0) / 1200);
      if (u >= 1) { finir(); return; }
      const k = 1 - Math.pow(1 - u, 3);
      el.textContent = lcd(Math.round((depart + (cible - depart) * k) * 10) / 10);
      if (stab) stab.textContent = Math.floor(t / 250) % 2 ? 'STAB…' : '';
      requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  // La zone de calcul (maquette validée par Tristan le 04/10/2026, `docs/briefs/picard/maquette-quai-calcul.html`) :
  // un petit tableur où l'élève calcule son comptage. Jamais noté, jamais recopié : il REPORTE lui-même le
  // résultat dans « Total ». `feuille` : lignes nommées en colonne A, valeurs et formule en B (guidage,
  // entraînement) ; `brouillon` : 2 colonnes × 5 lignes vides (évaluation, et palette multi-références).
  // Les cases se pointent au clic pendant qu'on écrit une formule (geste du tableur).
  const lignesFeuille = () => [`${maj(R.u.des)} dans une couche complète`, 'Nombre de couches', `${maj(R.u.des)} manquants dans la couche du dessus`, 'Total (formule)'];
  const formeCalcul = (p) => (R.calcul ? (R.calcul.forme === 'brouillon' || p.refs || p.forme === 'fut' ? 'brouillon' : 'feuille') : null);
  const casesCalcul = (p) => (formeCalcul(p) === 'feuille' ? ['B1', 'B2', 'B3', 'B4'] : ['A1', 'B1', 'A2', 'B2', 'A3', 'B3', 'A4', 'B4', 'A5', 'B5']);
  // Le résultat affiché à côté d'une case qui porte une formule (« = 57 », « #VALEUR! »), et l'aide d'une
  // erreur fréquente : multiplier avec « x ».
  const resultatCase = (s, ref, r) => {
    const brut = String((s.calcul || {})[ref] || '').trim();
    if (!estFormule(brut)) return { html: '', aide: '' };
    const err = r.erreurs[ref];
    const aide = err && /[x×]/i.test(brut.slice(1)) ? 'Pour multiplier, le tableur veut une étoile : *' : '';
    if (err) return { html: `<span class="quai-calc-err" data-q-res>${ech(err)}</span>`, aide };
    const v = afficher(ref, r);
    return { html: v === '' ? '' : `<span class="quai-calc-res" data-q-res>= ${ech(v)}</span>`, aide };
  };
  function caseCalcul(s, ref, r, dis, saisie) {
    const x = resultatCase(s, ref, r);
    return `<td data-q-ref="${ref}" class="${saisie ? 'quai-calc-saisie' : ''}"><div class="quai-calc-case"><input id="qCase-${ref}" data-q-case="${ref}" value="${ech((s.calcul || {})[ref] || '')}" aria-label="Case ${ref}" autocomplete="off" spellcheck="false" ${dis}>${x.html}</div>${x.aide ? `<div class="quai-calc-aide" data-q-calc-aide>${x.aide}</div>` : ''}</td>`;
  }
  function zoneCalcul(p, s, dis) {
    const forme = formeCalcul(p);
    if (!forme) return '';
    const r = evaluerGrille(s.calcul || {});
    if (forme === 'brouillon') {
      return `<table class="quai-calc" data-q-calc="brouillon"><thead><tr><th></th><th>A</th><th>B</th></tr></thead><tbody>
        ${[1, 2, 3, 4, 5].map((n) => `<tr><td class="quai-calc-num">${n}</td>${caseCalcul(s, `A${n}`, r, dis)}${caseCalcul(s, `B${n}`, r, dis)}</tr>`).join('')}</tbody></table>`;
    }
    return `<table class="quai-calc" data-q-calc="feuille"><thead><tr><th></th><th>A</th><th class="quai-calc-colb">B</th></tr></thead><tbody>
      ${lignesFeuille().map((l, i) => `<tr><td class="quai-calc-num">${i + 1}</td><td class="quai-calc-lib" data-q-ref="A${i + 1}">${l}</td>${caseCalcul(s, `B${i + 1}`, r, dis, i === 3)}</tr>`).join('')}</tbody></table>`;
  }

  // ① Compter : l'explication (guidage), le rappel de la formule (si déclaré), la zone de calcul, le total.
  function blocCompter(p, s, dis, m, vu) {
    const alerte = (k, t) => (vu && m[k] ? `<span class="quai-manque" role="alert" data-q-manque="${k}">${t}</span>` : '');
    const d = s.detail || {};
    const disC = dis || (s.valide ? 'disabled' : '');
    const explication = [
      A.consignes ? (p.forme === 'fut' ? `<div class="quai-aide">Compte les ${R.u.des} de la palette, place par place. Regarde bien s’il manque une place dans le bac. Fais le tour de la palette si besoin.</div>`
        : `<div class="quai-aide">Pour compter sans tout compter : combien de ${R.u.des} dans <b>une</b> couche ? combien de couches ? Puis regarde bien la couche du dessus : combien de ${R.u.des} y manquent ? Fais le tour de la palette si besoin.</div>`) : '',
      A.regleCouches ? `<div class="quai-aide">Règle du quai : sur une palette, toutes les couches <b>sous la couche du dessus</b> sont complètes. Les ${R.u.des} que tu ne vois pas au cœur sont donc bien là.${A.repere ? ` Le ${R.u.un} marqué <b>${ech(p.id)}</b> te sert de repère quand tu fais le tour.` : ''}</div>` : '',
    ].join('');
    const rappel = R.calcul && R.calcul.rappel && formeCalcul(p) === 'feuille'
      ? `<div class="quai-rappel" data-q-rappel><b>Rappel :</b> total = ${R.u.des} dans une couche × nombre de couches − manquants. En B4 : tape <code>=</code>, clique sur B1, tape <code>*</code>, clique sur B2, tape <code>-</code>, clique sur B3, puis Entrée → <code>=B1*B2-B3</code></div>` : '';
    const detail = A.detailComptage && !p.refs && !R.calcul ? `<div class="quai-detail">
        <label for="qdCouche">${ech(maj(R.u.des))} dans une couche complète</label><input id="qdCouche" type="number" min="0" data-q-detail="dCouche" value="${ech(d.dCouche ?? '')}" ${dis}>
        <label for="qdCouches">Nombre de couches</label><input id="qdCouches" type="number" min="0" data-q-detail="dCouches" value="${ech(d.dCouches ?? '')}" ${dis}>
        <label for="qdManque">${ech(maj(R.u.des))} manquants dans la couche du dessus</label><input id="qdManque" type="number" min="0" data-q-detail="dManque" value="${ech(d.dManque ?? '')}" ${dis}>
      </div>` : '';
    const comptage = p.refs
      ? `<div class="quai-champ"><span class="quai-lib-champ">${ech(maj(R.u.des))} comptés, référence par référence <span class="quai-cout">· ${fmtMin(C.compter)} par référence</span></span>
          ${p.refs.map((r) => `<label for="qCompte-${ech(r.ref)}">${ech(r.ref)} — ${ech(r.nom)}</label><input id="qCompte-${ech(r.ref)}" class="quai-court" type="number" min="0" inputmode="numeric" data-q-compte-ref="${ech(r.ref)}" value="${s.comptes && s.comptes[r.ref] != null ? s.comptes[r.ref] : ''}" ${disC}>`).join('')}
          <span class="note" data-q-rcompte>${ech(texteCompte(p, s))}</span>${alerte('compte', 'Note le comptage de chaque référence.')}
        </div>`
      : `<div class="quai-champ">
          <label for="qCompte">Total : ${R.u.des} comptés sur cette palette <span class="quai-cout">· ${fmtMin(C.compter)}</span></label>
          <input id="qCompte" class="quai-court" type="number" min="0" inputmode="numeric" data-q-compte value="${s.compte ?? ''}" ${disC}>
          <span class="note" data-q-rcompte>${ech(texteCompte(p, s))}</span>${alerte('compte', 'Note le comptage.')}
        </div>`;
    return `<div class="quai-doc quai-bloc" data-q-bloc="compter">
        <div class="quai-doc-titre"><span class="quai-num">1</span> Compter${R.calcul ? ` <span class="quai-fiche-ref">${formeCalcul(p) === 'brouillon' ? 'brouillon de calcul, libre' : 'zone de calcul'}</span>` : ''}</div>
        ${explication}${rappel}${zoneCalcul(p, s, disC)}${detail}${comptage}
      </div>`;
  }

  // ④ Décider : la décision, les motifs et « Valider » ; une fois validée, le résumé et « Modifier ».
  // En dessous, « Palette suivante » (la palette d'après dans l'ordre) ; sur la dernière, à la place, le même
  // bouton « Contrôles terminés → réserves » qu'en haut à droite (`fin`, demande de Tristan, 04/10/2026).
  function blocValidation(p, s, dis, fin, m, vu) {
    const L = PAL[p.camion], apres = L[L.indexOf(p) + 1];
    const suivante = apres ? `<div class="quai-ligne"><button class="btn" data-q="suivante" data-libre data-n="${R.palettes.indexOf(apres)}">Palette suivante : ${ech(apres.id)} →</button></div>`
      : `<div class="quai-ligne" data-q-vers4-bas>${fin}</div>`;
    if (s.valide) {
      return `<div class="quai-resume" data-q-resume><div><b>✓ ${ech(p.id)} validée :</b> ${DECISIONS[s.decision]}${s.decision !== 'accepter' ? ` — ${ech(libMotifsDe(R.lib, motifsChoisis(s)))}` : ''}</div>
          <div class="note">${ech(texteCompte(p, s))}</div>
          <div class="quai-ligne"><button class="btn" data-q="modifier" ${dis}>Modifier</button></div>
        </div>${suivante}`;
    }
    const alerte = (k, t) => (vu && m[k] ? `<span class="quai-manque" role="alert" data-q-manque="${k}">${t}</span>` : '');
    const decision = `<div class="quai-champ"><span class="quai-lib-champ" id="qLibDec">Décision</span>
        <div class="quai-choix" role="radiogroup" aria-labelledby="qLibDec">${CHOIX_DEC.map((k) => `<button type="button" id="qDec-${k}" role="radio" aria-checked="${s.decision === k}" class="${s.decision === k ? 'on' : ''}" data-q="dec" data-v="${k}" ${dis}>${DECISIONS[k]}</button>`).join('')}</div>
        ${alerte('decision', 'Choisis une décision.')}</div>`;
    const choisis = motifsChoisis(s);
    const motif = s.decision === 'reserves' || s.decision === 'refuser'
      ? `<div class="quai-champ"><span class="quai-lib-champ" id="qLibMot">Motif ${s.decision === 'refuser' ? 'du refus' : 'de la réserve'}${R.deuxMotifs ? ' <span class="quai-cout">· deux au plus</span>' : ''}</span>
          <div class="quai-choix quai-choix-motif" role="group" aria-labelledby="qLibMot">${MOTIFS_Q.map((k) => `<button type="button" id="qMot-${k}" aria-pressed="${choisis.includes(k)}" class="${choisis.includes(k) ? 'on' : ''}" data-q="motif" data-v="${k}" ${dis}>${ech(R.lib[k])}</button>`).join('')}</div>
          ${ui.tropMotifs ? '<span class="quai-manque" role="alert" data-q-trop>Deux motifs au plus : décoche-en un d’abord.</span>' : ''}${alerte('motif', 'Donne le motif.')}</div>`
      : '';
    return `<div class="quai-doc quai-bloc" data-q-bloc="decider">
        <div class="quai-doc-titre"><span class="quai-num">4</span> Décider</div>
        ${decision}${motif}
        <div class="quai-ligne"><button class="btn btn-p" data-q="valider" ${dis}>✓ Valider ${ech(p.id)}</button></div>
      </div>
      ${suivante}`;
  }

  function ecran3(e) {
    const ci = ca(e), cm = R.camions[ci];
    const p = R.palettes[e.sel], s = st(e, p), k = K(e, p.camion);
    const fige = e.fini || k.rentre || k.ecrit;
    const dis = fige ? 'disabled' : '';
    const onglets = R.palettes.map((q, n) => (q.camion !== ci ? ''
      : `<button role="tab" data-q="sel" data-libre data-n="${n}" aria-selected="${n === e.sel}" class="${n === e.sel ? 'on' : ''}">${ech(q.id)}<span class="quai-etat">${etatOnglet(q, st(e, q))}</span></button>`)).join('');
    // Passer aux réserves : en haut à droite, toujours avec confirmation (qui dit ce qui n'est pas validé).
    const nonVal = PAL[ci].filter((q) => !st(e, q).valide).length;
    const vers4 = ui.arme4
      ? `<button class="btn quai-arme" data-q="vers4" data-libre>${nonVal ? `${nonVal} palette${nonVal > 1 ? 's' : ''} non validée${nonVal > 1 ? 's' : ''} : passer quand même ?` : 'Passer aux réserves ?'} Cliquez pour confirmer</button>
        <button class="btn" data-q="desarmer4" data-libre>Annuler</button>`
      : `<button class="btn${nonVal ? '' : ' btn-p'}" data-q="vers4" data-libre>Contrôles terminés → réserves et ${F ? 'chambre froide' : ech(zoneMin)}</button>`;
    const m = manques(p, s), vu = ui.tente === p.id;
    // Disposition (maquette du 04/10/2026) : la palette reste à l'écran à gauche pendant que la colonne de
    // droite suit l'ordre du travail — compter, sonder et lire l'étiquette, noter sur la fiche, décider.
    return `<section class="quai-carte">
      <div class="quai-titre-ligne">
        <h2 class="quai-h2"><span class="quai-pastille-etape">3</span>Le quai : contrôler chaque palette${M ? ` du camion ${ech(cm.nom)}` : ''}</h2>
        <div class="quai-ligne" data-q-vers4>${vers4}</div>
      </div>
      ${choixCamion(e)}
      <div class="quai-onglets" role="tablist" data-q-onglets>${onglets}</div>
      <details class="quai-rappel-bl" data-libre><summary data-libre>📄 Revoir ${DOC === DOCUMENT_DEFAUT ? 'le bon de livraison' : 'le document'}${M ? ` du camion ${ech(cm.nom)}` : ''}</summary>${blHtml(ci)}</details>
      <div class="quai-poste quai-poste-egal">
        <div class="quai-gauche quai-collee">
          ${ISO ? `<div class="quai-scene quai-scene-iso">
            <div class="quai-ligne quai-tourner">
              <button class="btn" data-q="tourner" data-sens="-1" ${dis}>⟲ Tourner</button><button class="btn" data-q="tourner" ${dis}>Tourner ⟳</button>
              <span class="quai-vue-lib" data-q-vues>vue de ${NOMS_FACES[s.vue] === 'avant' || NOMS_FACES[s.vue] === 'arrière' ? 'l’' : 'du '}${NOMS_FACES[s.vue]} · faces vues : ${[0, 1, 2, 3].map((k) => `<span class="quai-face-vue${s.vues.includes(k) ? ' vu' : ''}" aria-hidden="true"></span>`).join('')} <span class="quai-sr">${s.vues.length} sur 4</span></span>
              <span class="quai-cout">· ${fmtMin(C.tourner)} par quart de tour</span>
            </div>
            <svg data-q-palette viewBox="250 0 520 420" role="img" aria-label="Palette ${ech(p.id)} : clique sur un ${R.u.un} pour lire son étiquette">${HAS_FUT ? DEFS_ISO : ''}${paletteIso(p, s)}</svg>
          </div>` : `<div class="quai-scene">
            <svg data-q-palette viewBox="40 40 380 340" role="img" aria-label="Palette ${ech(p.id)} vue en trois dimensions">${palette3d(p, s, A.repere)}</svg>
            <div class="quai-vue-lib">Côtés déjà vus : ${s.vues.length} sur 4</div>
            <button class="btn" data-q="tourner" ${dis}>↻ Faire le tour de la palette <span class="quai-cout">· ${fmtMin(C.tourner)}</span></button>
          </div>`}
        </div>
        <div class="quai-outils">
          ${blocCompter(p, s, dis, m, vu)}
          <div class="quai-doc quai-bloc" data-q-bloc="sonder">
            <div class="quai-doc-titre"><span class="quai-num">2</span> ${F ? 'Sonder et lire l’étiquette' : 'Lire l’étiquette'}</div>
            ${F ? `<div class="quai-ligne"><button class="btn" data-q="sonder" ${dis}>Sonder à cœur <span class="quai-cout">· ${fmtMin(C.sonder)}</span></button></div>
            ${s.sonde !== null ? sonde(p, s, ui.sonde === p.id) : ''}` : ''}
            <div class="quai-zoom">${ISO ? zoomCarton(p, s, R.camions[p.camion]) : zoomEtiquette(p, s, R.camions[p.camion])}</div>
          </div>
          ${ficheBloc(p, s, dis)}
          ${blocValidation(p, s, dis, vers4, m, vu)}
        </div>
      </div>
      <div class="quai-journal" aria-live="polite">${e.journal.map((l) => `<div>${ech(l)}</div>`).join('')}</div>
    </section>`;
  }

  const aEcrire = (e, ci = 0) => PAL[ci].filter((p) => ['reserves', 'refuser'].includes(st(e, p).decision));
  const toutFini = (e) => R.camions.every((_, ci) => K(e, ci).rentre && K(e, ci).signe);
  function ecran4(e, api) {
    const ci = ca(e), k = K(e, ci), cm = R.camions[ci], P = PAL[ci], N = P.length;
    const toutDecide = P.every((p) => st(e, p).decision);
    const liste = aEcrire(e, ci);
    const nAcc = P.filter((p) => accepte(st(e, p))).length;
    let form;
    if (!toutDecide) form = `<p class="note">Décide d'abord pour chaque palette (étape 3) : il en reste ${P.filter((p) => !st(e, p).decision).length}.</p>`;
    else if (!liste.length) form = '<p class="note">Aucune palette refusée ou acceptée sous réserve : tu écriras « Néant ».</p>';
    else {
      form = liste.map((p) => {
        const s = st(e, p), mo = CHAMP_RES[s.motif] ? s.motif : 'aucun', c = Object.assign({ lib: libChamp(R, mo) }, CHAMP_RES[mo]);
        const dis4 = k.signe || e.fini ? 'disabled' : '';
        // Second motif (ENT-4.4) : un second constat, une seconde valeur.
        const m2 = R.deuxMotifs && s.motif2 && s.motif2 !== 'aucun' && s.motif2 !== s.motif ? Object.assign({ lib: libChamp(R, s.motif2) }, CHAMP_RES[s.motif2]) : null;
        return `<div class="quai-res-ligne"><b>${ech(p.id)} — ${DECISIONS[s.decision]} · ${ech(libMotifsDe(R.lib, motifsChoisis(s)))}</b>
          <label class="quai-res-lib">${ech(c.lib)} <input class="quai-court" id="qRes-${ech(p.id)}" data-q-res="${ech(p.id)}" type="text" inputmode="${c.mode === 'text' ? 'text' : c.mode}" value="${ech(s.res)}" ${dis4}></label>
          ${m2 ? `<label class="quai-res-lib">${ech(m2.lib)} <input class="quai-court" id="qRes2-${ech(p.id)}" data-q-res2="${ech(p.id)}" type="text" inputmode="${m2.mode === 'text' ? 'text' : m2.mode}" value="${ech(s.res2 || '')}" ${dis4}></label>` : ''}</div>`;
      }).join('');
    }
    const lignes = k.ecrit ? ((k.lignes.length ? k.lignes.map((l) => `<div>${ech(l.texte)}</div>`).join('') : '<div>Néant — marchandise reçue conforme.</div>') + (k.mentionEcrite ? '<div>Sous réserve de déballage.</div>' : '')) : '';
    const parole = k.paroleChauffeur || (k.signe ? 'C’est signé. Je recharge les palettes refusées et j’y vais. Bonne journée !' : k.ecrit ? 'Faites voir ce que vous avez écrit… Je signe ?' : 'J’attends vos papiers pour signer. Mes autres clients m’attendent aussi.');
    const prof = api.estProf;
    const ouvert = unDecharge(e, R);
    let clore;
    if (EVAL && !prof) {
      clore = `<button class="btn btn-p${ui.arme ? ' quai-arme' : ''}" data-q="clore" ${!ouvert || e.fini || !toutFini(e) || api.copieRendue() ? 'disabled' : ''}>${ui.arme ? (Q.rendCopie === false ? 'Clore définitivement ? Cliquez pour confirmer' : 'Rendre définitivement ? Cliquez pour confirmer') : (Q.rendCopie === false ? 'Clore la réception' : 'Clore la réception et rendre ma copie')}</button>
        ${ui.arme ? '<button class="btn" data-q="desarmer">Annuler</button>' : ''}`;
    } else {
      clore = `<button class="btn btn-p" data-q="clore" ${!ouvert || e.fini || !toutFini(e) ? 'disabled' : ''}>Clore la réception</button>`;
    }
    // Plusieurs camions : celui qui est reparti libère le quai pour le suivant.
    const reste = M ? R.camions.map((_, cj) => cj).filter((cj) => !K(e, cj).decharge) : [];
    const suivant = M && k.signe && reste.length && !e.fini
      ? `<div class="quai-doc" data-q-suivant><p>Le camion ${ech(cm.nom)} repart, le quai est libre. ${reste.map((cj) => `Le camion ${ech(R.camions[cj].nom)}`).join(', ')} attend porte fermée.</p>${reste.map((cj) => boutonDecharger(e, cj)).join('')}</div>` : '';
    return `<section class="quai-carte">
      <h2 class="quai-h2"><span class="quai-pastille-etape">4</span>${ISO ? 'Écrire les réserves sur le BL, faire signer le chauffeur' : `${F ? 'Rentrer le lot en chambre froide' : `Rentrer les palettes en ${ech(zoneMin)}`}, écrire les réserves, faire signer`}${M ? ` — camion ${ech(cm.nom)}` : ''}</h2>
      ${choixCamion(e)}
      ${A.consignes && ISO ? `<p class="quai-aide">Écris tes réserves <b>sur le BL</b>, puis fais-les signer par le chauffeur. La palette reste en ${ech(zoneMin)}.<br>
        Une réserve doit être <b>précise</b> : quelle palette, quoi, combien. « Sous réserve de déballage » ne vaut rien : ce n'est pas une réserve.</p>` : ''}
      ${A.consignes && !F && !ISO ? `<p class="quai-aide">Règle du quai : <b>rentre les palettes acceptées</b> en ${ech(zoneMin)}, puis <b>écris tes réserves sur le BL</b> et fais-les signer par le chauffeur.<br>
        Une réserve doit être <b>précise</b> : quelle palette, quoi, combien. « Sous réserve de déballage » ne vaut rien : ce n'est pas une réserve.</p>` : ''}
      ${A.consignes && F ? `<p class="quai-aide">Règle du quai : <b>le froid d'abord, les papiers ensuite</b>. 1) <b>Rentre le lot</b> accepté en chambre froide (le temps hors froid s'arrête). 2) <b>Écris tes réserves sur le BL</b> et fais-les signer par le chauffeur. Le chauffeur peut attendre ; les surgelés, non.<br>
        Une réserve doit être <b>précise</b> : quelle palette, quoi, combien. « Sous réserve de déballage » ne vaut rien : ce n'est pas une réserve.</p>` : ''}
      ${ui.chef4 ? `<div class="quai-alerte" role="alert" data-q-chef>
        <p><b>Le chef de quai :</b> « Attends ! Tes palettes sont toujours sur le quai. <b>Rentre d'abord le lot accepté en chambre froide</b> : le chauffeur, lui, peut attendre cinq minutes ; les surgelés, non. Les papiers, tu les feras juste après. »</p>
        <button class="btn btn-p" data-q="chefRentrer">D'accord, je rentre le lot d'abord</button>
        <button class="btn" data-q="chefPapiers">J'écris quand même les réserves</button>
      </div>` : ''}
      ${A.chefDeQuai && k.mentionEcrite ? '<div class="quai-alerte" role="alert" data-q-chef-deballage><b>Le chef de quai :</b> « « Sous réserve de déballage », ça ne te protège de rien : ça ne dit ni quoi, ni combien, ni sur quelle palette. Ce sont tes réserves précises qui comptent. »</div>' : ''}
      <div class="quai-grille2">
        <div class="quai-gauche">${ISO ? `<div class="quai-doc">
          <div class="quai-doc-titre">📦 ${ech(R.zone.nom)}</div>
          <svg class="quai-cf quai-iso" data-q-cf viewBox="${DEPOSE ? cadreDep().join(' ') : `200 60 640 ${N > 2 ? 520 : 470}`}" role="img" aria-label="La palette en ${ech(zoneMin)}${k.signe ? ', le chauffeur est reparti' : ', le chauffeur attend'}">${defsIso()}${imageIso(DEPOSE ? 0 : fin(N), e, false, { parti: k.signe, toutes: true }).iso}</svg>
          <p class="note" data-q-etatcf>${k.signe ? `Le chauffeur est reparti. ${nAcc > 1 ? `Les ${nAcc} palettes restent` : 'La palette reste'} en ${ech(zoneMin)}.` : `${toutDecide ? `${nAcc} palette${nAcc > 1 ? 's' : ''} en ${ech(zoneMin)}. ` : ''}Le chauffeur attend ta signature.`}</p>
        </div>` : `<div class="quai-doc">
          <div class="quai-doc-titre">${F ? `🧊 ${ech(R.lieu.chambre.nom)}` : `📦 ${ech(R.zone.nom)}`}</div>
          <svg class="quai-cf" data-q-cf viewBox="0 0 640 300" role="img" aria-label="${F ? 'Le quai et l\'entrée de la chambre froide' : `Le quai et la ${ech(zoneMin)}`}">${sceneCf(e, k.rentre ? 1 : 0)}</svg>
          <p class="note" data-q-etatcf>${k.rentre ? `Lot rentré à ${hhmm(k.heureRentre ?? e.minute)} : ${nAcc} palettes en ${F ? 'chambre froide' : ech(zoneMin)}, ${N - nAcc} refusée(s) au quai.`
            : (toutDecide ? `${nAcc} palettes à rentrer${F ? ` · temps hors froid : ${fmtMin(k.froid)}` : ''}.` : 'Décide d’abord pour chaque palette.')}</p>
          <button class="btn btn-p" data-q="rentrer" ${!k.decharge || !toutDecide || k.rentre || e.fini ? 'disabled' : ''}>${F ? 'Rentrer le lot accepté en chambre froide' : `Rentrer les palettes acceptées en ${ech(zoneMin)}`} <span class="quai-cout">· ${fmtMin(C.rentrer)} de manutention</span></button>
          <p class="note">Les palettes refusées restent au quai et repartent dans le camion.</p>
        </div>`}
        ${ficheTableau(e, ci)}</div>
        <div class="quai-doc">
          <div class="quai-doc-titre">✍️ Tes réserves</div>
          <div>${form}</div>
          <label class="quai-res-ligne quai-case"><input type="checkbox" data-q-deballage ${k.deballage ? 'checked' : ''} ${k.signe || e.fini || !toutDecide ? 'disabled' : ''}> Ajouter la mention « Sous réserve de déballage »</label>
          <div class="quai-ligne"><button class="btn" data-q="ecrire" ${!k.decharge || !toutDecide || k.signe || e.fini ? 'disabled' : ''}>${k.ecrit ? 'Réécrire les réserves' : 'Écrire les réserves sur le BL'} <span class="quai-cout">· ${fmtMin(Math.max(1, liste.length) * C.ligne)}</span></button></div>
        </div>
      </div>
      <div class="quai-doc quai-papier">
        <div class="quai-doc-titre">📄 ${ech(DOC)} n° ${ech(cm.bl)} — exemplaire du destinataire</div>
        ${blHtml(ci)}
        <div class="quai-zone-res"><div class="quai-lib-res">Réserves du destinataire :</div><div class="quai-manuscrit" data-q-lignes>${lignes}</div></div>
        <div class="quai-signatures">
          <div><div class="quai-lib-res">Le réceptionnaire (${ech(Q.destinataire || '')}${Q.destinataire ? ', ' : ''}${ech(R.lieu.nom)})</div><div class="quai-sig" data-q-sig-moi>${k.ecrit ? signature('#1d3a7a', 1) : ''}</div></div>
          <div><div class="quai-lib-res">Le chauffeur (${ech(cm.transporteur)})</div><div class="quai-sig" data-q-sig-chauffeur>${k.signe ? signature('#222', 2) : ''}</div></div>
        </div>
        <div class="quai-reconst">Document pédagogique, reconstitution, non contractuel.</div>
      </div>
      <div class="quai-chauffeur" data-q-parole>${silhouette(40)}<p><b>Le chauffeur :</b> « ${ech(parole)} »</p></div>
      <p class="quai-ligne"><button class="btn" data-q="signer" ${!k.ecrit || k.signe || e.fini ? 'disabled' : ''}>Faire signer le chauffeur <span class="quai-cout">· ${fmtMin(C.signer)}</span></button>
        ${clore}</p>
      ${suivant}
      ${bilan(e, api)}
    </section>`;
  }

  function bilan(e, api) {
    if (!e.fini) return '';
    if (EVAL && !api.estProf) {
      return `<div class="avis" data-q-bilan>Réception close${api.copieRendue() ? ' et copie rendue' : ''}. Ton enseignant te donnera la note.</div>`;
    }
    const db = { quais: { [Q.id]: e } };
    const { L } = jalonsQuai(db, Q);
    const tableau = `<table class="quai-bilan" data-q-bilan><thead><tr><th></th><th>Ce que tu as fait</th><th>Attendu</th><th></th></tr></thead><tbody>${L.map((l) => `<tr data-jalon="${ech(l.id)}"><td>${ech(l.lib)}</td><td>${ech(l.fait)}</td><td>${ech(l.attendu)}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ à revoir'}${l.compte ? '' : ' <span class="note">(non compté)</span>'}</td></tr>`).join('')}</tbody></table>`;
    // Mode scène : si un jalon de sécurité est faux, la phrase du contenu (`securite.bilan`) explique pourquoi.
    const phraseSecu = SCENE && SEC.bilan && L.some((l) => /^securite-/.test(l.id) && !l.ok) ? `<p class="note" data-q-bilan-securite>${ech(SEC.bilan)}</p>` : '';
    let teteProf = '';
    if (EVAL) {
      const n = noteQuai(db, Q);
      teteProf = `<details open class="quai-note-prof"><summary class="note">Côté enseignant : note ${v1(n.score)}/${n.max}</summary>${tableauNote(n)}</details>`;
    }
    const ordre = (k) => (k.rentre ? (k.ordreFroidDabord
      ? ' Tu as rentré le lot <b>avant</b> d’écrire les papiers : bon réflexe, le chauffeur attend, les surgelés non.'
      : ` Tu as écrit les papiers <b>avant</b> de rentrer le lot${k.passeOutreChef ? ', malgré le chef de quai' : ''} : le temps hors froid a continué de tourner pendant ce temps. <b>Règle à retenir : le froid d’abord, les papiers ensuite.</b>`) : '');
    const temps = M
      ? R.camions.map((c, ci) => {
        const k = K(e, ci);
        // Le camion qui se réchauffe : ce que son attente a coûté, lu sur la sonde.
        const tMax = Math.max(...PAL[ci].map((p) => tempReelle(p, e, R)));
        const zone = tMax > R.seuilRefus ? `, au-dessus de ${fmtT(R.seuilRefus)} : à refuser`
          : tMax > R.seuilReserve ? `, entre ${fmtT(R.seuilReserve)} et ${fmtT(R.seuilRefus)} : à accepter avec réserves (température relevée)` : '';
        const chaud = c.rechauffe && k.decharge
          ? ` Il a attendu ${fmtMin(k.ouvertA)} porte fermée, groupe froid faible : ses palettes sont sorties à ${fmtT(tMax)} à cœur${zone}.`
          : '';
        return `<p class="note" data-q-bilan-camion="${ech(c.lettre)}">Camion ${ech(c.nom)} : temps hors froid du lot ${k.decharge ? fmtMin(k.froid) : '—'} (repère ${R.seuil} min).${chaud}${ordre(k)}</p>`;
      }).join('')
      : (F ? `<p class="note">Temps hors froid du lot : ${e.decharge ? fmtMin(e.froid) : '—'} (repère ${R.seuil} min).${ordre(e)}</p>` : '');
    return `<div class="quai-bilan-bloc">
      <h3>Bilan de ta réception</h3>
      ${teteProf}${tableau}
      ${phraseSecu}
      ${temps}
      <p class="note" data-q-reel-bilan>Temps réel passé : ${mmss(e.reel)} (mesuré pour caler les seuils de l'évaluation, non noté).</p>
      ${Q.bonASavoir ? `<p class="note">${Q.bonASavoir}</p>` : ''}
      ${EVAL ? '' : Q.recommencer === false ? '<p class="note" data-q-fige>Le camion est reparti : le BL ne se corrige plus.</p>'
        : `<p><button class="btn${ui.armeRaz ? ' quai-arme' : ''}" data-q="recommencer">${ui.armeRaz ? 'Tout effacer et recommencer ? Cliquez pour confirmer' : 'Recommencer la réception'}</button></p>`}
    </div>`;
  }
  function tableauNote(n) {
    const sf = n.N.horsFroid.map(([m, p], i) => `${i ? '' : '≤ '}${m} min${i ? '' : ''} : ${p}`).join(' · ');
    const sr = n.N.reel.map(([m, p]) => `≤ ${v1(m * n.fac)} min : ${p}`).join(' · ');
    return `<table class="quai-note" data-q-note><tbody>
      <tr><td>Réception</td><td>${n.pts}/${n.nJalons} jalons</td><td>${v1(n.reception)} / ${n.N.reception}</td></tr>
      ${n.sansFroid ? '' : `<tr><td>Temps hors froid</td><td>${fmtMin(n.froid)}</td><td>${n.ptsFroid} / ${n.N.horsFroid[0][1]} (${sf})</td></tr>`}
      <tr><td>Temps réel</td><td>${mmss(n.reel)}${n.tiersTemps ? ' (tiers-temps)' : ''}</td><td>${n.ptsReel} / ${n.N.reel[0][1]} (${sr})</td></tr>
      <tr><td>Rapidité retenue</td><td>${n.complet ? `réception complète, ${n.justes}/${n.nPalettes} palettes justes` : 'réception incomplète : pas de points de rapidité'}</td><td>${v1(n.vitesse)} / ${n.max - n.N.reception}</td></tr>
    </tbody></table>`;
  }

  /* --------------------------------------------------------------- gestes */
  function ecrireReserves(e, api, ci = ca(e)) {
    const k = K(e, ci);
    const liste = aEcrire(e, ci);
    k.lignes = liste.map((p) => {
      const s = st(e, p), pe = effective(p, e, R), choisis = motifsChoisis(s);
      // Juste : la bonne décision, les bons motifs, et pour chacun la bonne valeur (deux constats,
      // deux quantités pour une palette à deux problèmes).
      const juste = s.decision === pe.attendu && memesMotifs(pe, s)
        && choisis.every((m) => { const v = valeurDe(s, m); return v !== '' && v != null && CHAMP_RES[m].egal(v, pe); });
      const vals = choisis.map((m) => [m, valeurDe(s, m)]);
      return { id: p.id, texte: texteLigne(p, s.decision, vals, R), juste, vide: !vals.length || vals.some(([, v]) => String(v == null ? '' : v).trim() === '') };
    });
    avancer(e, Math.max(1, liste.length) * C.ligne, `réserves écrites sur le BL${M ? ` du ${nomCam(ci)}` : ''} (${liste.length} ligne${liste.length > 1 ? 's' : ''})`);
    k.ecrit = true; k.paroleChauffeur = ''; k.mentionEcrite = !!k.deballage;
    api.sauver(); api.redessiner();
  }
  function rentrer(e, api, ci = ca(e)) {
    const k = K(e, ci);
    const n = PAL[ci].filter((p) => accepte(st(e, p))).length;
    avancer(e, C.rentrer, `lot${M ? ` du ${nomCam(ci)}` : ''} rentré en ${F ? 'chambre froide' : zoneMin} (${n} palettes)`);
    k.ordreFroidDabord = !k.ecrit;
    k.rentre = true; k.heureRentre = e.minute;
    ui.jouerCf = true;
    api.sauver(); api.redessiner();
  }
  function aller(e, n, api) {
    if ((ARRET && n > 2) || (COMMENCE && n < 3)) return;   // une étape absente (arret / commence) ne s'atteint pas
    if (n > 2 && (deposeEnCours(e) || ui.animDep)) return;  // dépose dirigée : ③ attend que la dernière palette soit posée (et montrée)
    if (n >= SEUIL_SECU && !secuFaite(e)) return;
    if (n > 1 && !unDecharge(e, R)) return;
    if (ui.anim) ui.anim.finir();
    e.etape = n; ui.chef4 = false; ui.tente = null; ui.tropMotifs = false; ui.arme4 = false;
    api.sauver(); api.redessiner();
    if (api.haut) api.haut();
  }
  // Ouvrir un camion. Le premier : une fois l'ordre choisi et justifié. Les suivants : quand le quai
  // est libre (camion précédent reparti), après la manœuvre de mise à quai.
  function decharger(e, ci, api) {
    const k = K(e, ci);
    if (k.decharge || !secuFaite(e)) return;
    if (M) {
      if (!peutDecharger(e, ci)) return;
      if (unDecharge(e, R)) avancer(e, R.manoeuvre, `${nomCam(ci)} mis à quai à la place du camion reparti`);
      e.actif = ci; e.sel = R.palettes.indexOf(PAL[ci][0]);
    }
    k.decharge = true; k.ouvertA = e.minute; k.evts = 0; e.etape = 2; ui.lancer = true; ui.chef4 = false;
    api.sauver(); api.redessiner(); if (api.haut) api.haut();
  }

  /* ----------------------------------------------------- la dépose dirigée : les gestes (lot 2) */
  // La porte s'ouvre (une fois) : le temps du quai compte l'ouverture, comme le premier événement de `evenements`.
  function ouvrirDepose(e) {
    const k = K(e, 0);
    if (k.evts === 0) { k.evts = 1; avancer(e, R.D.ouverture, 'porte du quai ouverte, début du déchargement'); }
  }
  // L'ANIMATION PAR GESTE (décision 6, étape B). `gestes` = [{ quoi: 'porte' | 'chercher' | 'poser', palette, case }], DÉJÀ appliqués à
  // la base, qui est sauvée AVANT de jouer (l'état fait foi : une page rechargée en plein geste retombe sur la pause suivante, `visDe`) ;
  // l'animation ne fait que montrer le passage de l'image d'avant à celle de la pause suivante. `ui.visDep` = l'image de l'instant (que
  // `scene2` / `imageIso` dessinent à la place de `visDe`), `ui.animDep` = le contrôleur (tant qu'il existe : aucune case proposée, pas
  // de bulle, clics et clavier ignorés, « Passer l'animation » visible). La boucle `requestAnimationFrame` réécrit le dessin à chaque
  // image (comme `animer`) ; « Passer » finit la chaîne, donc va jusqu'à la pause suivante. Mouvement réduit : aucune boucle, la pause
  // tout de suite. `ensuite` prépare l'annonce de la pause ; le redessin qui la montre est fait ici. Les horloges : comme pendant `animer`,
  // l'heure montrée rattrape celle de la base à l'instant où la chose arrive à l'écran (porte levée, palette posée).
  function jouerDepose(e, gestes, ensuite, api) {
    arreterDep();
    if (reduit()) { api.sauver(); ensuite(); api.redessiner(); return; }
    let t = 0;
    const chaine = gestes.map((g) => {
      const tr = g.quoi === 'porte' ? { legs: [], marques: {}, duree: T_PORTE, arrivee: null }
        : g.quoi === 'chercher' ? trajetChercher(GEO) : trajetPoser(GEO, GEO.cases.find((c) => c.id === g.case));
      const c = Object.assign({ t0: t, tr, libere: g.quoi === 'porte' ? R.D.ouverture : g.quoi === 'poser' ? R.D.parPalette : 0 }, g);
      t += tr.duree;
      return c;
    });
    const A = { e, chaine, duree: t, fait: new Set(), debut: null, t: 0, raf: null, z: null, focus: ui.focus, quoi: chaine[0].quoi, minuteVue: null, ensuite, api };
    A.finir = () => finirDep(A, true);
    A.boucle = (now) => boucleDep(A, now);
    ui.animDep = A;
    ui.visDep = visAvantDep(e, gestes);
    appliquerDep(A, 0);
    api.sauver();
    api.redessiner();   // le dessin de l'instant 0 ; `brancher` accroche la boucle à la scène (`brancherDep`)
  }
  // L'image d'avant le premier geste. Avant `chercher` : le cariste à vide au point d'attente, la file entière moins les palettes posées.
  // Avant `poser` : il attend à la sortie du camion, la palette sur les fourches (la pause qu'on vient de quitter).
  function visAvantDep(e, gestes) {
    const g = gestes.find((x) => x.quoi !== 'porte'), posees = casesDesPalettes(e, false);
    const portee = g && g.quoi === 'poser' ? g.palette : null;
    if (portee) delete posees[portee];
    const porte = gestes.some((x) => x.quoi === 'porte');
    return { pos: [GEO.xPorte, GEO.ycSortie, portee ? CHARIOT_QUAI.LEV : 0], portee, posees, camion: ORDRE_DEP.filter((id) => id !== portee && !posees[id]), retard: 0, ouv: porte ? 0 : null };
  }
  // L'image à l'instant t de la chaîne (maquette, `appliquer`) : les instants nommés passés sont appliqués une fois (`leve` : la palette
  // quitte la file et monte sur les fourches ; `pose` : elle est dans sa case), le chariot est interpolé, la file glisse d'un cran pendant
  // que le cariste recule (de `sortie` + 200 ms jusqu'à la fin du geste, pour que la pause ne fasse pas sauter la file).
  function appliquerDep(A, t) {
    const V = ui.visDep;
    for (const g of A.chaine) {
      const tl = t - g.t0, M = g.tr.marques;
      if (!A.fait.has(g)) {
        if (g.quoi === 'chercher' && tl >= M.leve) { A.fait.add(g); V.camion = V.camion.filter((x) => x !== g.palette); V.portee = g.palette; V.retard = 1; }
        else if (g.quoi === 'poser' && tl >= M.pose) { A.fait.add(g); V.posees = Object.assign({}, V.posees, { [g.palette]: g.case }); V.portee = null; }
        else if (g.quoi === 'porte' && tl >= g.tr.duree) A.fait.add(g);
      }
      if (g.quoi === 'chercher' && A.fait.has(g)) { const d0 = M.sortie + 200, d1 = g.tr.duree; V.retard = 1 - Math.min(1, Math.max(0, (tl - d0) / Math.max(1, d1 - d0))); }
    }
    const g = A.chaine.find((x) => t < x.t0 + x.tr.duree) || A.chaine[A.chaine.length - 1];
    V.pos = positionSur(g.tr.legs, t - g.t0, g.tr.legs.length ? g.tr.legs[0].a : V.pos);
    if (g.quoi === 'porte') V.ouv = Math.min(1, Math.max(0, (t - g.t0) / T_PORTE));
    else if (V.ouv != null) V.ouv = 1;
    V.minute = A.e.minute - A.chaine.reduce((s, x) => s + (A.fait.has(x) ? 0 : x.libere), 0);
    A.quoi = g.quoi;
    const h = hhmm(V.minute), N = ORDRE_DEP.length;
    V.leg = g.quoi === 'porte' ? `${h} — La porte du ${lieuMin} se lève.`
      : g.quoi === 'chercher' ? `${h} — ${quiSort} sort la palette ${g.palette} du camion (${ORDRE_DEP.indexOf(g.palette) + 1} sur ${N}).`
        : `${h} — ${quiSort} pose la palette ${g.palette} (${minuscule((DEPOSE.cases.find((c) => c.id === g.case) || { nom: g.case }).nom)}).`;
  }
  // Une image de la boucle : l'instant, le dessin, la légende, le compteur ; les horloges quand l'heure montrée change. La scène a
  // disparu (autre étape, autre vue, séance quittée) : on saute à la pause, sans redessin (la base est déjà sauvée).
  function boucleDep(A, now) {
    A.raf = null;
    if (ui.animDep !== A) return;
    const z = A.z, svg = z && z.isConnected ? z.querySelector('[data-q-scene2]') : null;
    if (!svg || !svg.isConnected) { finirDep(A, false); return; }
    if (A.debut === null) A.debut = now - A.t;
    A.t = now - A.debut;
    if (A.t >= A.duree) { finirDep(A, true); return; }
    appliquerDep(A, A.t);
    const V = ui.visDep, im = imageDepose(V, A.e);
    const gi = svg.querySelector('[data-g="iso"]');
    if (gi) gi.innerHTML = im.iso;
    const q = (s) => z.querySelector(s);
    if (q('[data-q-leg]')) q('[data-q-leg]').textContent = im.leg;
    if (q('[data-q-nb]')) q('[data-q-nb]').textContent = `${im.nb} / ${PAL[0].length}`;
    if (q('[data-q-past]')) q('[data-q-past]').innerHTML = im.pastilles;
    const sc = svg.closest('[data-q-phase]');
    if (sc && sc.dataset.qGeste !== A.quoi) sc.dataset.qGeste = A.quoi;
    if (V.minute !== A.minuteVue) { A.minuteVue = V.minute; majHorloges(z, eVuDep(A.e)); }
    A.raf = requestAnimationFrame(A.boucle);
  }
  // Accrocher la boucle à la scène qu'on vient de dessiner (premier dessin du geste, ou un redessin en plein geste : la boucle continue
  // sur la nouvelle scène, au même instant).
  function brancherDep(z) {
    const A = ui.animDep;
    if (!A) return;
    A.z = z;
    if (!A.raf) A.raf = requestAnimationFrame(A.boucle);
  }
  // La fin d'une chaîne : la pause suivante, dessinée depuis la base (`visDe`). `montrer` : la scène est à l'écran (fin normale ou
  // « Passer ») : annonce, focus, redessin ; sinon on efface seulement le geste.
  function finirDep(A, montrer) {
    if (ui.animDep !== A) return;
    if (A.raf) cancelAnimationFrame(A.raf);
    A.raf = null;
    ui.animDep = null; ui.visDep = null; ui.focus = A.focus;
    if (montrer) { A.ensuite(); A.api.redessiner(); }
  }
  // Un geste qui ne doit pas survivre (la vue redessinée pour une autre base, une autre étape) : effacé, sans redessin.
  function arreterDep() { if (ui.animDep) finirDep(ui.animDep, false); }
  // L'état que montrent les horloges : l'heure de la base, ou pendant un geste l'heure montrée à l'écran.
  const eVuDep = (e) => (ui.visDep && ui.visDep.minute != null ? Object.assign({}, e, { minute: ui.visDep.minute }) : e);
  // Ce que la région `aria-live` annonce à une pause : la consigne du cariste avant la première palette, puis la palette en attente.
  function annoncePause(e) {
    const p = enAttenteDep(e);
    if (!p) return texteFinDep();
    const d = etatDep(e).depose[p];
    return `${p === ORDRE_DEP[0] && !(d && d.essais.length) ? `${quiSort} : « ${PREMIERE_BULLE} » ` : ''}${texteAttente(p)}`;
  }
  // Après un redessin, au clavier seulement : le focus va à la case proposée qui suit `cid` (sinon la première).
  function focusApresDep(e, cid) {
    const ED = etatDep(e), p = paletteEnAttente(ED, ORDRE_DEP);
    if (!p) return null;
    const L = casesProposees(ED, DEPOSE.cases, p, OPTS_DEP), ids = DEPOSE.cases.map((c) => c.id), dep = ids.indexOf(cid);
    const s = L.find((id) => ids.indexOf(id) > dep) || L[0];
    return s ? `[data-q="depose"][data-c="${s}"]` : null;
  }
  // Un clic (ou Entrée / Espace) sur une case. Guidage : un piège est refusé (réaction du cariste, case grisée, l'élève rechoisit) ; une
  // case juste est posée. Copie : le premier clic pose. Chaque pose avance le temps du quai et `evts` (comme une palette posée hier) ;
  // la première publie le geste `quai:<id>:depose` ; la dernière finit le déchargement (bandeau `arret`, ou ③ ouverte).
  function choisirDepose(e, cid, api) {
    if (!JOUEE || e.fini || ui.animDep) return;
    const k = K(e, 0);
    if (!k.decharge || !(k.evts >= 1)) return;
    const ED = etatDep(e), p = paletteEnAttente(ED, ORDRE_DEP);
    if (!p) return;
    const n = choisirCase(ED, DEPOSE.cases, p, cid, OPTS_DEP);
    if (n === ED) return;
    e.depose = n.depose;
    const is = issueDernierChoix(n, DEPOSE.cases, p), c = DEPOSE.cases.find((x) => x.id === cid);
    if (is.issue === 'refus') {
      ui.annonceDep = `${quiSort} : « ${is.reaction} » Choisis une autre case.`;
      ui.focus = focusApresDep(e, cid);
      api.sauver(); api.redessiner();
      return;
    }
    avancer(e, R.D.parPalette, `${p} posée en ${cid}`);
    k.evts++;
    if (Object.values(e.depose).filter((d) => d.pose).length === 1 && api.signal) api.signal(`quai:${Q.id}:depose`);
    const suite = enAttenteDep(e);
    ui.focus = focusApresDep(e, cid);
    jouerDepose(e, [{ quoi: 'poser', palette: p, case: cid }].concat(suite ? [{ quoi: 'chercher', palette: suite }] : []), () => {
      ui.annonceDep = `Palette ${p} posée : ${c.nom}. ${suite ? texteAttente(suite) : texteFinDep()}`;
    }, api);
  }

  if (R.controle) return vueControle();

  /* ================================================ quai « déjà réceptionné » */
  // Voir l'en-tête du fichier. Le camion est reparti, les palettes sont en chambre froide ; tout ce que
  // le collègue a fait vient de `Q.dossier` (jamais de la base) : le temps 1 est figé par construction.
  function vueControle() {
    const DOS = R.dossier;
    const ui2 = { armeFin: false, msgCompte: '', focus: null };
    const P = PAL[0];
    const fiche = (p) => (DOS.fiche || []).find((f) => f.id === p.id) || {};
    const sc = (e, p) => e.palettes[p.id];
    const phase2 = (e) => (e.phase || 1) >= 2;
    const qui = DOS.receptionnaire || 'le collègue';
    const heure = DOS.heure || '';

    const dossierHtml = (e) => {
      const lignes = (DOS.reserves || []).map((l) => `<div>${ech(l)}</div>`).join('') || '<div>Néant.</div>';
      const tete = '<thead><tr><th>Palette</th><th class="num">${ech(maj(R.u.des))} comptés</th><th class="num">T° à cœur</th><th>Décision</th><th>Remarque</th></tr></thead>';
      const rangs = P.map((p) => {
        const f = fiche(p);
        return `<tr data-q-fiche="${ech(p.id)}"><td>${ech(p.id)}</td><td class="num">${ech(f.compte ?? '')}</td><td class="num">${f.temp != null ? fmtT(f.temp) : ''}</td><td>${ech(f.decision || '')}</td><td class="quai-main">${ech(f.remarque || '')}</td></tr>`;
      }).join('');
      return `<div class="quai-grille2" data-q-dossier>
        <div class="quai-doc quai-papier">
          <div class="quai-doc-titre">📄 Bon de livraison n° ${ech(cam.bl)} — exemplaire du destinataire</div>
          <p class="note">${fictif(cam.fournisseur, cam.fictif)} · transporteur ${fictif(cam.transporteur, cam.fictif)} · réceptionné le <b data-q-jour>${ech(jourAffiche(e.jour))}</b> à <b>${ech(heure)}</b>, ${ech(R.lieu.nom)}</p>
          ${blHtml(0)}
          <div class="quai-zone-res"><div class="quai-lib-res">Réserves du destinataire :</div><div class="quai-manuscrit" data-q-lignes>${lignes}</div></div>
          <div class="quai-signatures">
            <div><div class="quai-lib-res">Le réceptionnaire (${ech(Q.destinataire || '')}${Q.destinataire ? ', ' : ''}${ech(qui)})</div><div class="quai-sig">${signature('#1d3a7a', 1)}</div></div>
            <div><div class="quai-lib-res">Le chauffeur (${ech(cam.transporteur)})</div><div class="quai-sig">${signature('#222', 2)}</div></div>
          </div>
          <div class="quai-reconst">Document pédagogique, reconstitution, non contractuel.</div>
        </div>
        <div class="quai-doc">
          <div class="quai-doc-titre">🧾 Ticket de l'enregistreur de température</div>
          <div class="quai-ticket" data-q-ticket>${ech(ticketTexte(0))}</div>
          <div class="quai-reconst">Ticket reconstitué, non contractuel.</div>
        </div>
      </div>
      <div class="quai-doc quai-papier" data-q-fiche-tableau>
        <div class="quai-doc-titre">📋 ${ech(DOS.titreFiche || 'Fiche de comptage et de sonde')} — ${ech(qui)}, ${ech(heure)}</div>
        <table class="quai-bl">${tete}<tbody>${rangs}</tbody></table>
        ${DOS.mot ? `<p class="quai-main" data-q-mot>${ech(DOS.mot)}</p>` : ''}
        <div class="quai-reconst">${ech(qui)} est un personnage fictif. Document pédagogique, reconstitution, non contractuel.</div>
      </div>`;
    };

    // La chambre froide vue de face : les palettes au froid, les bloquées dans la zone à part.
    const sceneChambre = (e) => {
      let o = `<defs>${DEFS_FILM}</defs><rect x="0" y="0" width="700" height="190" fill="#2f3a42"/><rect x="0" y="150" width="700" height="40" fill="#46525a"/>`;
      o += '<rect x="470" y="12" width="222" height="170" rx="6" fill="none" stroke="#e0a090" stroke-width="2" stroke-dasharray="7 5"/>';
      o += '<text x="581" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#ffb9a8" font-family="system-ui">Zone de blocage qualité</text>';
      const tc = `${R.lieu.chambre.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.chambre.temp).toFixed(1))} °C`.replace('-', '−');
      o += `<text x="12" y="24" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.chambre.nom)} · ${tc}</text>`;
      const libres = P.filter((p) => !sc(e, p).bloque), bl = P.filter((p) => sc(e, p).bloque);
      libres.forEach((p, k) => { o += paletteFace(p, 60 + k * 90, 172, 0.5); });
      bl.forEach((p, k) => {
        const x = 528 + k * 105;
        o += paletteFace(p, x, 172, 0.5);
        // L'étiquette juste au-dessus de la palette (hauteur de `paletteFace` à l'échelle 0,5).
        const y = Math.round(172 - 6.5 - p.L * 13.5 - 28);
        o += `<g data-q-etiq-bloque="${ech(p.id)}"><rect x="${x - 50}" y="${y}" width="100" height="22" rx="3" fill="#f6f1e4" stroke="#b8431b" stroke-width="2"/><text x="${x}" y="${y + 15}" text-anchor="middle" font-size="10" font-weight="700" fill="#9d2727" font-family="system-ui">BLOQUÉ — QUALITÉ</text></g>`;
      });
      return o;
    };

    const chambreHtml = (e) => {
      const p = R.palettes[e.sel], s = sc(e, p), f = fiche(p);
      const dis = e.fini ? 'disabled' : '';
      const onglets = P.map((q, n) => {
        const sq = sc(e, q);
        const fait = [sq.compte !== null ? 'recomptée' : null, sq.sonde !== null ? 'sondée' : null, sq.bloque ? 'bloquée' : null].filter(Boolean).join(', ') || 'à contrôler';
        return `<button role="tab" data-q="sel" data-libre data-n="${n}" aria-selected="${n === e.sel}" class="${n === e.sel ? 'on' : ''}">${ech(q.id)}<span class="quai-etat">${fait}</span></button>`;
      }).join('');
      const bloc = phase2(e)
        ? `<div class="quai-ligne">${s.bloque
          ? `<button class="btn" data-q="debloquer" ${dis}>Débloquer ${ech(p.id)}</button><span class="quai-constat" data-q-bloquee>🔒 Bloquée — qualité, en zone à part</span>`
          : `<button class="btn" data-q="bloquer" ${dis}>🔒 Bloquer ${ech(p.id)} — qualité</button>`}</div>`
        : '<p class="note" data-q-pas-bloquer>Temps 1 : tu contrôles, tu ne corriges rien. Le blocage s’ouvrira après ton diagnostic au chef de quai.</p>';
      const etiq = s.etiqMontre || s.etiqVue ? zoomEtiquette(p, s, cam) : `<span class="note">🔍 Clique sur l’étiquette d’un ${R.u.un} pour la lire de près.</span>`;
      return `<svg class="quai-cf" data-q-chambre viewBox="0 0 700 190" role="img" aria-label="La chambre froide : les palettes au froid et la zone de blocage qualité">${sceneChambre(e)}</svg>
      <div class="quai-onglets" role="tablist" aria-label="Palette">${onglets}</div>
      <details class="quai-rappel-bl" data-libre><summary data-libre>📄 Revoir le bon de livraison</summary>${blHtml(0)}</details>
      <div class="quai-poste">
        <div class="quai-scene">
          <svg data-q-palette viewBox="0 0 460 380" role="img" aria-label="Palette ${ech(p.id)} vue en trois dimensions">${palette3d(p, s, false)}</svg>
          <div class="quai-vue-lib">Côtés déjà vus : ${s.vues.length} sur 4</div>
          <button class="btn" data-q="tourner" ${dis}>↻ Faire le tour de la palette</button>
        </div>
        <div class="quai-outils">
          <div class="quai-ligne"><button class="btn" data-q="sonder" ${dis}>Sonder à cœur</button>
            ${s.sonde !== null ? `<span class="quai-constat" data-q-sonde>${virgule(Number(s.sonde).toFixed(1)).replace('-', '−')} °C à cœur maintenant</span>` : ''}</div>
          <p class="note">Fiche de ${ech(qui)} à ${ech(heure)} : <b data-q-fiche-temp>${f.temp != null ? fmtT(f.temp) : '—'}</b> à cœur.</p>
          <div class="quai-zoom">${etiq}</div>
          <div class="quai-champ">
            <label for="qCompte">Ton comptage : ${R.u.des} sur cette palette</label>
            <div class="quai-ligne"><input id="qCompte" class="quai-court" type="number" min="0" inputmode="numeric" data-q-compte value="${s.compte ?? ''}" ${dis}>
              <button class="btn" data-q="compter" ${dis}>Noter mon comptage</button></div>
            <span class="note" data-q-rcompte>${ui2.msgCompte ? ech(ui2.msgCompte) : `${s.compte !== null ? `Ton comptage : ${s.compte} ${R.u.des} · ` : ''}fiche de ${ech(qui)} : ${ech(f.compte ?? '—')} · BL : ${p.bl}.`}</span>
          </div>
          ${bloc}
        </div>
      </div>`;
    };

    const bilanControle = (e, api) => {
      if (!e.fini) return '';
      const db = api.db ? api.db() : { quais: { [Q.id]: e } };
      const { L, pts, max } = jalonsQuai(db, Q);
      return `<div class="quai-bilan-bloc">
        <h3>Bilan de ton contrôle</h3>
        <p class="note">${pts} jalon${pts > 1 ? 's' : ''} juste${pts > 1 ? 's' : ''} sur ${max}.</p>
        <table class="quai-bilan" data-q-bilan><thead><tr><th></th><th>Ce que tu as fait</th><th>Attendu</th><th></th></tr></thead><tbody>${L.map((l) => `<tr data-jalon="${ech(l.id)}"><td>${ech(l.lib)}</td><td>${ech(l.fait)}</td><td>${ech(l.attendu)}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ à revoir'}</td></tr>`).join('')}</tbody></table>
        ${Q.bonASavoir ? `<p class="note">${Q.bonASavoir}</p>` : ''}
      </div>`;
    };

    const finHtml = (e) => {
      if (!phase2(e)) return '';
      const fin = e.fini
        ? `<p class="quai-constat" data-q-termine>Terminé à ${new Date(e.termine || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ')} : le dossier est figé.</p>`
        : `<button class="btn btn-p${ui2.armeFin ? ' quai-arme' : ''}" data-q="terminer">${ui2.armeFin ? 'C’est définitif : plus aucun changement possible. Cliquez pour confirmer' : 'J’ai terminé'}</button>
           ${ui2.armeFin ? '<button class="btn" data-q="desarmerFin">Annuler</button>' : ''}`;
      return `<div class="quai-doc" data-q-fin>
        ${DOS.rappelProtestation ? `<p class="quai-aide" data-q-rappel>${DOS.rappelProtestation}</p>` : ''}
        <div class="quai-ligne">${fin}</div>
      </div>`;
    };

    return {
      id: Q.id,
      nav: { libelle: Q.libelle || 'Quai de réception' },
      etatNeuf: () => etatNeuf(Q),
      jalons: (db) => jalonsQuai(db, Q),
      note: null,
      tic() {},
      // Le message déclenché qui ouvre le temps 2 (`phaseQuai` dans `entreprise.js`) : une fois, sans retour.
      passerPhase(e, n) { normaliser(e, R); if (n > (e.phase || 1)) e.phase = n; },
      html(e, api) {
        normaliser(e, R);
        const t2 = phase2(e);
        const bandeau = t2
          ? `<div class="quai-temps quai-temps-2" data-q-temps="2"><b>Temps 2 — Corriger.</b> ${e.fini ? 'Tu as terminé : le dossier est figé, ton bilan est en bas.' : 'Bloque ce qui doit l’être (onglet « En chambre froide »), écris au transporteur s’il le faut (Messagerie), puis « J’ai terminé ».'}</div>`
          : `<div class="quai-temps" data-q-temps="1"><b>Temps 1 — Contrôler.</b> Le travail de ${ech(qui)} est figé : tu peux tout relire, recompter, re-sonder, mais rien corriger. Quand tu sais ce qui ne va pas, envoie ton diagnostic au chef de quai (Messagerie, réponds à son message).</div>`;
        const onglet = (v, lib) => `<button role="tab" data-q="onglet" data-libre data-v="${v}" aria-selected="${e.onglet === v}" class="${e.onglet === v ? 'on' : ''}">${lib}</button>`;
        return `<div class="quai quai-controle" data-quai="${ech(Q.id)}" data-q-phase="${t2 ? 2 : 1}">
          <div class="quai-tete">
            <div><h2>${ech(Q.titre || R.lieu.nom)}</h2>
              <div class="note">Livraison « ${fictif(cam.fournisseur, cam.fictif)} » · transporteur ${fictif(cam.transporteur, cam.fictif)} · réceptionnée à ${ech(heure)} par ${ech(qui)} (personnage fictif) · camion reparti, palettes en chambre froide</div></div>
            <button class="btn" data-q="messagerie" data-libre>✉ Messagerie</button>
          </div>
          ${Q.avertissement ? `<div class="quai-avert">${Q.avertissement}</div>` : ''}
          ${bandeau}
          <div class="quai-onglets quai-onglets-dossier" role="tablist" aria-label="Le dossier">${onglet('dossier', `📁 Le dossier de ${ech(qui)}`)}${onglet('chambre', '🧊 En chambre froide')}</div>
          <section class="quai-carte">${e.onglet === 'chambre' ? chambreHtml(e) : dossierHtml(e)}</section>
          ${finHtml(e)}
          ${bilanControle(e, api)}
        </div>`;
      },
      brancher(z, e, api) {
        const p = () => R.palettes[e.sel];
        const s = () => sc(e, p());
        const geste = (fn) => (ev, b) => { if (e.fini) return; fn(ev, b); };
        const on = (cle, fn) => z.querySelectorAll(`[data-q="${cle}"]`).forEach((b) => b.addEventListener('click', (ev) => fn(ev, b)));
        const refaire = () => { api.sauver(); api.redessiner(); };
        z.querySelectorAll('[data-q], input').forEach((el) => el.addEventListener('focus', () => {
          ui2.focus = el.id ? `#${el.id}` : el.dataset.q ? `[data-q="${el.dataset.q}"]${el.dataset.n ? `[data-n="${el.dataset.n}"]` : ''}${el.dataset.v ? `[data-v="${el.dataset.v}"]` : ''}` : null;
        }));
        retrouverFocus(z, ui2.focus, { defilement: true });
        on('messagerie', () => { if (api.messagerie) api.messagerie(); });
        on('onglet', (ev, b) => { e.onglet = b.dataset.v === 'chambre' ? 'chambre' : 'dossier'; ui2.msgCompte = ''; refaire(); });
        on('sel', (ev, b) => { e.sel = +b.dataset.n; ui2.msgCompte = ''; refaire(); });
        on('tourner', geste(() => { const ss = s(); ss.vue = (ss.vue + 1) % 4; if (!ss.vues.includes(ss.vue)) ss.vues.push(ss.vue); refaire(); }));
        // La sonde lit la température d'AUJOURD'HUI : après des heures en chambre froide, tout est froid.
        on('sonder', geste(() => { s().sonde = p().temp; refaire(); }));
        on('compter', geste(() => {
          const v = parseInt(z.querySelector('[data-q-compte]').value, 10);
          if (Number.isNaN(v)) { ui2.msgCompte = `Écris d’abord le nombre de ${R.u.des} que tu as comptés.`; api.redessiner(); return; }
          ui2.msgCompte = ''; s().compte = v; refaire();
        }));
        z.querySelector('[data-q-palette]')?.addEventListener('click', (ev) => {
          const g = ev.target.closest('[data-q-etiq]');
          if (!g || e.fini) return;
          const cle = g.dataset.k || 'avant', ss = s();
          if (!Array.isArray(ss.etiqLues)) ss.etiqLues = [];
          ss.etiqMontre = cle; if (!ss.etiqLues.includes(cle)) ss.etiqLues.push(cle); ss.etiqVue = true;
          refaire();
        });
        // Bloquer / débloquer : seulement au temps 2, tant que « J'ai terminé » n'est pas cliqué.
        on('bloquer', geste(() => { if (!phase2(e)) return; s().bloque = true; refaire(); }));
        on('debloquer', geste(() => { if (!phase2(e)) return; s().bloque = false; refaire(); }));
        on('terminer', geste(() => {
          if (!phase2(e)) return;
          if (!secondClic(ui2, 'armeFin')) { api.redessiner(); return; }
          e.fini = true; e.termine = Date.now(); refaire();
        }));
        on('desarmerFin', () => { ui2.armeFin = false; api.redessiner(); });
      },
    };
  }

  return {
    // `quai:<id>:dechargement` (fin du déchargement, une fois) n'existe que si le quai s'arrête là (`arret`) : la liste des autres séances ne change pas.
    // `quai:<id>:depose` (première palette posée par l'élève, une fois) n'existe que si le quai déclare `depose`.
    signaux: [`quai:${Q.id}:decharger`, `quai:${Q.id}:valider`, `quai:${Q.id}:cloturer`].concat(SCENE ? [`scene:${Q.id}:signaler`, `scene:${Q.id}:decharger`] : [], ARRET ? [`quai:${Q.id}:dechargement`] : [], DEPOSE ? [`quai:${Q.id}:depose`] : []),
    id: Q.id,
    nav: { libelle: Q.libelle || 'Quai de réception' },
    etatNeuf: () => etatNeuf(Q),
    jalons: (db) => jalonsQuai(db, Q),
    note: Q.note || EVAL ? (db) => noteQuai(db, Q) : null,
    // Le jeu reçu, l'attendu et la réponse, jalon par jalon (quai tiré par élève, ENT-4.4) : rangé
    // dans le `detail` de la copie pour l'enseignant (des objets : Firestore refuse les tableaux de tableaux).
    resume: (db) => jalonsQuai(db, Q).L.filter((l) => l.compte).map((l) => ({ lib: l.lib, fait: l.fait, attendu: l.attendu, ok: l.ok })),
    // Le chrono réel, appelé chaque seconde par l'environnement : mise à jour en place.
    tic(z, e) {
      if (!z) return;
      const r = z.querySelector('[data-q-reel]');
      if (r) r.textContent = mmss(e.reel);
      const mur = z.querySelector('[data-q-mur]');
      if (mur && EVAL) mur.textContent = mmss(e.reel);
    },
    html(e, api) {
      normaliser(e, R);
      // Un déchargement interrompu (rechargement de page en pleine animation) : ce qui restait
      // du temps du quai s'applique d'un coup.
      R.camions.forEach((_, ci) => {
        const k = K(e, ci);
        // (Dépose dirigée : pas de rattrapage, l'état de la dépose fait foi ; seule l'ouverture de la porte, si la page a été rechargée
        // entre « Décharger » et la première pause, se rattrape.)
        if (JOUEE) { if (k.decharge && k.evts === 0 && !ui.lancer) { ouvrirDepose(e); api.sauver(); } return; }
        if (k.decharge && k.evts <= PAL[ci].length && !ui.anim && !ui.lancer) { evenements(e, fin(PAL[ci].length), ci); api.sauver(); }
      });
      // La palette sélectionnée appartient au camion montré.
      if (M && R.palettes[e.sel] && R.palettes[e.sel].camion !== ca(e) && PAL[ca(e)].length) e.sel = R.palettes.indexOf(PAL[ca(e)][0]);
      const ouvert = unDecharge(e, R);
      // Étape ⓪ (sécurité) : tant que l'élève n'a pas commencé à décharger, ou s'il y revient pour relire.
      const etape0 = ouvert ? (e.etape ?? 1) || 1 : (LISTE && (!secuFaite(e) || e.etape === 0) ? 0 : 1);
      const etape = ARRET && etape0 > 2 ? 2 : COMMENCE && etape0 < 3 ? 3 : etape0;
      // Dépose dirigée : un geste en cours ne survit pas à un dessin d'une autre base (base remise à zéro) ni d'une autre étape.
      if (ui.animDep && (ui.animDep.e !== e || etape !== 2)) arreterDep();
      const corps = etape === 0 ? ecran0(e) : etape === 1 ? ecran1(e) : etape === 2 ? `<section class="quai-carte">${scene2(e)}</section>` : etape === 3 ? ecran3(e) : ecran4(e, api);
      const libs4 = ISO ? ETAPES_ISO.slice() : (M ? ['① Les camions arrivent'].concat(ETAPES.slice(1)) : ETAPES.slice()).map((l, i) => (i === 3 && !F ? `④ Réserves et ${zoneMin}` : l));
      const libs = LISTE ? [ETAPE_SECU].concat(libs4) : libs4;
      const n0 = LISTE ? 0 : 1;   // numéro de la première étape affichée
      const tete = M
        ? R.camions.map((c) => `Camion « ${fictif(c.nom, c.fictif)} », transporteur ${fictif(c.transporteur, c.fictif)}`).join(' · ')
        : `Livraison « ${fictif(cam.fournisseur, cam.fictif)} » · camion ${F ? 'frigorifique ' : ''}${fictif(cam.transporteur, cam.fictif)}`;
      return `<div class="quai" data-quai="${ech(Q.id)}">
        <div class="quai-tete">
          <div><h2>${ech(Q.titre || R.lieu.nom)}</h2>
            <div class="note">${tete}</div></div>
        </div>
        ${Q.avertissement ? `<div class="quai-avert">${Q.avertissement}</div>` : ''}
        ${horloges(eVuDep(e))}
        <nav class="quai-stepper" aria-label="Étapes de la réception">
          ${libs.map((l, i) => [l, i + n0]).filter(([, n]) => (ARRET ? n <= 2 : COMMENCE ? n >= 3 : true)).map(([l, n]) => { const ferme = (n >= SEUIL_SECU && !secuFaite(e)) || (n > 1 && !ouvert) || (n > 2 && (deposeEnCours(e) || !!ui.animDep));
            return `<button data-q="etape" data-libre data-n="${n}" class="${etape === n ? 'on' : ''}" ${ferme ? 'disabled' : ''} ${etape === n ? 'aria-current="step"' : ''}>${l}</button>`; }).join('')}
        </nav>
        ${corps}
      </div>`;
    },
    brancher(z, e, api) {
      const p = () => R.palettes[e.sel];
      const s = () => st(e, p());
      const kc = () => K(e, ca(e));
      const ciDe = (b) => (b && b.dataset.c != null ? +b.dataset.c : 0);
      const geste = (fn) => (ev, b) => { if (e.fini) return; fn(ev, b); };
      const on = (cle, fn) => z.querySelectorAll(`[data-q="${cle}"]`).forEach((b) => b.addEventListener('click', (ev) => fn(ev, b)));
      // Le focus suit l'élève qui travaille au clavier d'un redessin à l'autre.
      z.querySelectorAll('[data-q], input, select').forEach((el) => el.addEventListener('focus', () => {
        ui.focus = el.id ? `#${el.id}` : el.dataset.q ? `[data-q="${el.dataset.q}"]${el.dataset.n ? `[data-n="${el.dataset.n}"]` : ''}${el.dataset.c ? `[data-c="${el.dataset.c}"]` : ''}` : null;
      }));
      retrouverFocus(z, ui.focus, { defilement: true });

      // `arret: 'dechargement'` : la dernière palette est posée (fin de l'animation, « Passer l'animation », mouvement réduit ou page rechargée : tous ces chemins
      // finissent ici, par un redessin). Le quai se fige comme après « Clore » et le geste part UNE fois : le drapeau est rangé dans l'état, un rechargement ne le renvoie pas.
      // (Dépose dirigée : pas pendant le dernier geste ; le geste de fin part quand le cariste est revenu, ou au rechargement.)
      if (ARRET && !ui.animDep && !e.dechargeFini && kc().decharge && kc().evts > PAL[0].length) {
        e.dechargeFini = true; e.fini = true;
        if (api.signal) api.signal(`quai:${Q.id}:dechargement`);
        api.sauver();
      }

      on('etape', (ev, b) => {
        const n = +b.dataset.n;
        if (n === 0 && LISTE) { if (ui.anim) ui.anim.finir(); e.etape = 0; api.sauver(); api.redessiner(); return; }
        aller(e, n, api);
      });
      // L'étape ⓪ : chaque réponse est rangée tout de suite ; rien n'est corrigé avant la fin.
      on('secu', geste((ev, b) => {
        const sec = e.securite;
        if (!sec || sec.fait || !SEC.points.some((x) => x.id === b.dataset.p) || !['ok', 'ko'].includes(b.dataset.v)) return;
        sec.rep[b.dataset.p] = b.dataset.v; api.sauver(); api.redessiner();
      }));
      on('signaler', geste(() => {
        const sec = e.securite;
        if (!sec || sec.fait) return;
        const ko = SEC.points.filter((x) => sec.rep[x.id] === 'ko').map((x) => x.id);
        const sig = SEC.signaler || {};
        if (!ko.length) { sec.chef = sig.vide || 'Qu’est-ce qui ne va pas ? Coche « Pas OK » sur ce que tu veux me signaler.'; api.sauver(); api.redessiner(); return; }
        sec.signaux.push({ points: ko, apresArret: !!sec.arrete });
        const vrai = SEC.points.some((x) => !x.ok && ko.includes(x.id));
        sec.chef = vrai ? (sig.reponse || 'Bien vu, je m’en occupe. Tu peux décharger.') : (sig.rien || 'Je viens voir… Ce que tu me signales est en ordre.');
        ui.arretSecu = false;
        api.sauver(); api.redessiner();
      }));
      on('commencer', geste(() => {
        const sec = e.securite;
        if (!sec || sec.fait) return;
        // Un point faux pas encore signalé : en guidage, le chef de quai arrête l'élève (sans dire lequel).
        const signales = new Set([].concat(...sec.signaux.map((g) => g.points || [])));
        const oublie = SEC.points.some((x) => !x.ok && !signales.has(x.id));
        if (oublie && !EVAL) { sec.arrete = true; ui.arretSecu = true; api.sauver(); api.redessiner(); return; }
        sec.fait = true; ui.arretSecu = false; e.etape = 1;
        api.sauver(); api.redessiner(); if (api.haut) api.haut();
      }));
      on('ticket', geste((ev, b) => {
        const ci = ciDe(b), k = K(e, ci);
        if (k.ticketLu) return;
        k.ticketLu = true; avancer(e, C.ticket, M ? `ticket de l’enregistreur du ${nomCam(ci)} lu` : 'ticket de l’enregistreur lu');
        api.sauver(); api.redessiner();
      }));
      z.querySelectorAll('[data-q="ticketRep"]').forEach((r) => r.addEventListener('change', () => { if (e.fini) return; K(e, ciDe(r)).ticketRep = r.value; api.sauver(); }));
      // L'ordre et sa justification : libres tant qu'aucun camion n'est ouvert.
      z.querySelectorAll('[data-q="premier"], [data-q="phrase"]').forEach((r) => r.addEventListener('change', () => {
        if (e.fini || unDecharge(e, R)) return;
        if (r.dataset.q === 'premier') e.ordre.premier = +r.value; else e.ordre.phrase = r.value;
        api.sauver(); api.redessiner();
      }));
      // GESTES (questions au fil, lot 3) : `quai:<id>:decharger`, `quai:<id>:valider` (une palette), `quai:<id>:cloturer`.
      const sig = (n) => { if (api.signal) api.signal(`quai:${Q.id}:${n}`); };
      on('decharger', geste((ev, b) => { sig('decharger'); decharger(e, ciDe(b), api); }));
      if (SCENE) brancherScene(z, e, api, on, geste);
      if (ISO && z.querySelector('[data-q-arrivee]') && !arriveeVue(e)) animerArrivee(z, api, e);
      on('passer1', () => { if (ui.anim1) ui.anim1.finir(); else { ui.arrivee = true; ui.rejeu1 = false; ui.t0a = null; api.redessiner(); } });
      on('revoir1', () => { ui.rejeu1 = true; ui.t0a = null; api.redessiner(); });
      on('camion', (ev, b) => {
        const ci = ciDe(b);
        if (!K(e, ci).decharge || ci === ca(e)) return;
        if (ui.anim) ui.anim.finir();
        e.actif = ci; e.sel = R.palettes.indexOf(PAL[ci][0]); ui.chef4 = false; ui.tente = null;
        api.sauver(); api.redessiner();
      });
      // Le déchargement démarre dans l'écran qu'on vient de dessiner. `prefers-reduced-motion` :
      // pas d'animation, la fin directement (palettes posées, temps du quai compté).
      if (ui.lancer) {
        ui.lancer = false;
        // Dépose dirigée : la porte se lève (sauf si l'inspection l'a déjà ouverte), le cariste va chercher la première palette, puis la
        // pause « choix ».
        if (JOUEE) {
          ouvrirDepose(e);
          const porte = !(SCENE && e.securite && e.securite.ouverte);
          jouerDepose(e, (porte ? [{ quoi: 'porte' }] : []).concat([{ quoi: 'chercher', palette: ORDRE_DEP[0] }]), () => { ui.annonceDep = annoncePause(e); }, api);
          return;
        }
        if (reduit()) { evenements(e, fin(PAL[ca(e)].length)); api.sauver(); api.redessiner(); return; }
        animer(z, e, api, false);
      }
      // Dépose dirigée : un clic sur une case, ou Entrée / Espace sur la case qui a le focus (un <g role="button"> ne reçoit pas de clic
      // du clavier). Puis l'annonce du cariste, posée 30 ms après le dessin dans la région `aria-live` (vide au dessin : elle est lue).
      if (JOUEE) {
        brancherDep(z);   // un geste en cours : la boucle reprend sur cette scène
        on('depose', geste((ev, b) => choisirDepose(e, b.dataset.c, api)));
        const sv = z.querySelector('[data-q-scene2]');
        if (sv) {
          sv.addEventListener('keydown', (ev) => {
            const g = ev.target && ev.target.closest ? ev.target.closest('[data-q="depose"]') : null;
            if (!g || (ev.key !== 'Enter' && ev.key !== ' ')) return;
            ev.preventDefault();
            if (!e.fini) choisirDepose(e, g.dataset.c, api);
          });
        }
        const an = z.querySelector('[data-q-annonce]');
        if (an && ui.annonceDep) { const t = ui.annonceDep; ui.annonceDep = ''; setTimeout(() => { if (an.isConnected) an.textContent = t; }, 30); }
      }
      // (Dépose dirigée : « Passer » finit le geste en cours et ceux qui s'enchaînent, jusqu'à la pause suivante ; le redessin est le sien.)
      on('passer', () => { if (ui.animDep) { ui.animDep.finir(); return; } if (ui.anim) ui.anim.finir(); api.redessiner(); });
      on('revoir', () => {
        if (kc().evts <= PAL[ca(e)].length) return;
        api.redessiner();
        const z2 = api.zone();
        z2.querySelector('[data-q="revoir"]')?.setAttribute('hidden', '');
        z2.querySelector('[data-q="passer"]')?.removeAttribute('hidden');
        if (!reduit()) animer(z2, e, api, true);
      });
      on('vers3', () => aller(e, 3, api));
      on('vers4', () => {
        if (!secondClic(ui, 'arme4')) { api.redessiner(); return; }
        aller(e, 4, api);
      });
      on('desarmer4', () => { ui.arme4 = false; api.redessiner(); });
      // Valider une palette (décision de Tristan, 03/10/2026 ; ergonomie du 04/10/2026) : toujours
      // cliquable. S'il manque quelque chose, le message s'écrit sous la case concernée et le focus y va ;
      // sinon la palette passe en résumé, sur place (« Modifier » la rouvre).
      on('valider', geste(() => {
        sig('valider');
        const pal = p(), ss = s(), m = manques(pal, ss);
        if (m.compte || m.decision || m.motif) {
          ui.tente = pal.id; api.redessiner();
          const z2 = api.zone();
          const vide = pal.refs && pal.refs.find((r) => !(ss.comptes && ss.comptes[r.ref] != null && ss.comptes[r.ref] !== ''));
          const cible = m.compte ? (vide ? `[data-q-compte-ref="${vide.ref}"]` : '#qCompte') : m.decision ? '#qDec-accepter' : `#qMot-${MOTIFS_Q[0]}`;
          const el = z2.querySelector(cible);
          if (el) el.focus();
          return;
        }
        ss.valide = true; ui.tente = null; ui.tropMotifs = false; ui.arme4 = false;
        api.sauver(); api.redessiner();
      }));
      on('modifier', geste(() => { const k = K(e, p().camion); if (k.rentre || k.ecrit) return; s().valide = false; ui.tente = null; api.sauver(); api.redessiner(); }));
      const choisir = (n) => { e.sel = n; ui.tente = null; ui.tropMotifs = false; ui.arme4 = false; api.sauver(); api.redessiner(); };
      on('sel', (ev, b) => choisir(+b.dataset.n));
      // « Palette suivante » : la vue remonte aux onglets des palettes, pour repartir de la palette et de
      // « Compter » (demande de Tristan, 04/10/2026).
      on('suivante', (ev, b) => {
        choisir(+b.dataset.n);
        api.zone().querySelector('[data-q-onglets]')?.scrollIntoView({ block: 'start', behavior: reduit() ? 'auto' : 'smooth' });
      });
      // La décision : trois boutons. « Accepter » efface les motifs.
      on('dec', geste((ev, b) => {
        const ss = s();
        if (ss.valide || !CHOIX_DEC.includes(b.dataset.v)) return;
        ss.decision = b.dataset.v; ui.tropMotifs = false;
        if (ss.decision === 'accepter') { ss.motif = 'aucun'; ss.motif2 = 'aucun'; }
        api.sauver(); api.redessiner();
      }));
      // Les motifs, à cocher : un seul (le clic remplace), ou deux au plus avec `deuxMotifs` (ENT-4.4) ; un
      // troisième est refusé. Recliquer décoche. Le premier coché reste `motif` (et sa valeur `res`).
      on('motif', geste((ev, b) => {
        const ss = s(), m = b.dataset.v;
        if (ss.valide || !MOTIFS_Q.includes(m) || !['reserves', 'refuser'].includes(ss.decision)) return;
        const m1 = ss.motif && ss.motif !== 'aucun' ? ss.motif : null, m2 = R.deuxMotifs && ss.motif2 && ss.motif2 !== 'aucun' ? ss.motif2 : null;
        ui.tropMotifs = false;
        if (!R.deuxMotifs) { ss.motif = m1 === m ? 'aucun' : m; ss.motif2 = 'aucun'; }
        else if (m1 === m) { ss.motif = m2 || 'aucun'; ss.res = m2 ? ss.res2 : ss.res; ss.motif2 = 'aucun'; if (m2) ss.res2 = ''; }
        else if (m2 === m) ss.motif2 = 'aucun';
        else if (!m1) ss.motif = m;
        else if (!m2) ss.motif2 = m;
        else ui.tropMotifs = true;
        api.sauver(); api.redessiner();
      }));
      on('tourner', geste((ev, b) => {
        const ss = s(); ss.vue = (ss.vue + (b && b.dataset.sens === '-1' ? 3 : 1)) % 4; if (!ss.vues.includes(ss.vue)) ss.vues.push(ss.vue);
        avancer(e, C.tourner, `${p().id} : ${VUES[ss.vue]}`); api.sauver(); api.redessiner();
      }));
      // La sonde lit la température RÉELLE (un camion qui a attendu s'est réchauffé) ; le thermomètre se
      // stabilise une fois, juste après ce geste.
      on('sonder', geste(() => { if (!F) return; s().sonde = tempReelle(p(), e, R); ui.sonde = p().id; avancer(e, C.sonder, `${p().id} sondée`); api.sauver(); api.redessiner(); }));
      if (ui.sonde) {
        const id = ui.sonde; ui.sonde = null;
        if (id === p().id && s().sonde !== null) animerSonde(z, Number(s().sonde));
      }
      // Le comptage : le total tapé est noté par Entrée ou en quittant la case, avec le coût `compter` ; une
      // case par référence pour une palette multi-références. Mise à jour EN PLACE, sans redessiner : un
      // clic sur un bouton juste après la frappe (la case perd le focus) doit arriver à ce bouton.
      const noterCompte = (i) => {
        const pal = p(), ss = s(), k = K(e, pal.camion);
        if (e.fini || ss.valide || k.rentre || k.ecrit) return;
        const v = parseInt(String(i.value).trim(), 10);
        if (Number.isNaN(v)) return;
        if (pal.refs) {
          const ref = i.dataset.qCompteRef;
          if (ss.comptes && ss.comptes[ref] === v) return;
          ss.comptes = Object.assign({}, ss.comptes || {}, { [ref]: v });
          avancer(e, C.compter, `${pal.id} : ${ref} ${v} ${R.u.des} notés`);
        } else {
          if (ss.compte === v) return;
          ss.compte = v;
          avancer(e, C.compter, `${pal.id} : ${v} ${R.u.des} notés`);
        }
        api.sauver();
        majHorloges(z, e);
        const r = z.querySelector('[data-q-rcompte]');
        if (r) r.textContent = texteCompte(pal, ss);
        if (!manques(pal, ss).compte) z.querySelector('[data-q-manque="compte"]')?.remove();
        const o = z.querySelector(`[data-q="sel"][data-n="${e.sel}"] .quai-etat`);
        if (o) o.textContent = etatOnglet(pal, ss);
        const j = z.querySelector('.quai-journal');
        if (j) j.innerHTML = e.journal.map((l) => `<div>${ech(l)}</div>`).join('');
      };
      z.querySelectorAll('[data-q-compte], [data-q-compte-ref]').forEach((i) => {
        i.addEventListener('change', () => noterCompte(i));
        i.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); noterCompte(i); } });
      });
      // La zone de calcul : l'état suit la frappe, les résultats se recalculent SUR PLACE (un redessin ferait
      // perdre le curseur au milieu d'une formule). Rien n'est noté ni recopié dans « Total ».
      const casesCalc = [...z.querySelectorAll('[data-q-case]')];
      const marquer = () => {
        const a = document.activeElement;
        const f = a && a.dataset && a.dataset.qCase && estFormule(a.value) ? a.value.toUpperCase() : '';
        const refs = new Set(f.match(/[A-Z]\d+/g) || []);
        z.querySelectorAll('[data-q-ref]').forEach((td) => td.classList.toggle('quai-pointee', refs.has(td.dataset.qRef)));
      };
      const recalculer = () => {
        const ss = s(), r = evaluerGrille(ss.calcul);
        casesCalc.forEach((i) => {
          const td = i.closest('td'), x = resultatCase(ss, i.dataset.qCase, r);
          td.querySelector('[data-q-res]')?.remove(); td.querySelector('[data-q-calc-aide]')?.remove();
          if (x.html) i.insertAdjacentHTML('afterend', x.html);
          if (x.aide) td.insertAdjacentHTML('beforeend', `<div class="quai-calc-aide" data-q-calc-aide>${x.aide}</div>`);
        });
        marquer();
      };
      casesCalc.forEach((i) => {
        i.addEventListener('input', () => { if (e.fini) return; s().calcul[i.dataset.qCase] = i.value; api.sauver(); recalculer(); });
        i.addEventListener('focus', marquer);
        i.addEventListener('blur', () => setTimeout(marquer, 0));
        // Entrée : la case du dessous (comme un tableur), puis le total.
        i.addEventListener('keydown', (ev) => {
          if (ev.key !== 'Enter') return;
          ev.preventDefault();
          const ref = i.dataset.qCase, dessous = z.querySelector(`[data-q-case="${ref[0]}${+ref.slice(1) + 1}"]`);
          (dessous || z.querySelector('[data-q-compte]:not(:disabled), [data-q-compte-ref]:not(:disabled)'))?.focus();
        });
      });
      // Pointer une case (geste du tableur) : pendant qu'on écrit une formule, juste après « = », un signe, une
      // parenthèse ou un point-virgule, un clic sur une autre case écrit sa référence au curseur, sans quitter
      // la formule. Ailleurs, le clic va dans la case, comme dans Excel.
      z.querySelectorAll('[data-q-ref]').forEach((td) => td.addEventListener('mousedown', (ev) => {
        const a = document.activeElement;
        if (!a || !a.dataset || !a.dataset.qCase || a.disabled || td.dataset.qRef === a.dataset.qCase || !estFormule(a.value)) return;
        const pos = a.selectionStart ?? a.value.length, avant = a.value.slice(0, pos);
        if (!/[=+\-*/(;:]\s*$/.test(avant)) return;
        ev.preventDefault();
        a.value = avant + td.dataset.qRef + a.value.slice(a.selectionEnd ?? pos);
        const n = pos + td.dataset.qRef.length;
        a.setSelectionRange(n, n);
        a.dispatchEvent(new Event('input', { bubbles: true }));
      }));
      // La fiche de contrôle : l'état suit la frappe (sans redessiner, sans coût) ; Entrée passe à la case
      // suivante, puis à la décision (la fiche vient juste avant, maquette du 04/10/2026).
      // La fiche par référence : l'état suit la frappe et la case RAS, sans redessiner, sans coût.
      z.querySelectorAll('[data-q-fr]').forEach((i) => i.addEventListener(i.type === 'checkbox' ? 'change' : 'input', () => {
        if (e.fini) return;
        const ss = s(), ref = i.dataset.ref;
        if (!ss.fiche.parRef) ss.fiche.parRef = {};
        ss.fiche.parRef[ref] = Object.assign(ligneRef(ss, ref), { [i.dataset.qFr]: i.type === 'checkbox' ? i.checked : i.value });
        api.sauver();
      }));
      const casesFiche = [...z.querySelectorAll('[data-q-fiche-k]')];
      casesFiche.forEach((i, n) => {
        i.addEventListener('input', () => { if (e.fini) return; s().fiche[i.dataset.qFicheK] = i.value; api.sauver(); });
        i.addEventListener('keydown', (ev) => {
          if (ev.key !== 'Enter') return;
          ev.preventDefault();
          const suite = casesFiche[n + 1] || z.querySelector('[data-q="dec"]:not(:disabled)');
          if (suite) suite.focus();
        });
      });
      z.querySelector('[data-q-palette]')?.addEventListener('click', (ev) => {
        const g = ev.target.closest('[data-q-etiq]');
        const k = K(e, p().camion);
        if (!g || e.fini || k.rentre || k.ecrit) return;
        // Une étiquette = une face (avant, arrière) ou une référence ; chacune ne coûte qu'une fois.
        const cle = g.dataset.k || 'avant', ss = s();
        if (!Array.isArray(ss.etiqLues)) ss.etiqLues = ss.etiqVue ? ['avant'] : [];
        ss.etiqMontre = cle;
        // Rendu iso : le carton cliqué (son étiquette, son état vu d'ici).
        if (g.dataset.qCarton) ss.carton = +g.dataset.qCarton;
        if (!ss.etiqLues.includes(cle)) {
          ss.etiqLues.push(cle); ss.etiqVue = true;
          const quoi = cle === 'avant' ? '' : cle === 'arriere' ? ' (face arrière)' : ` (${cle})`;
          avancer(e, C.etiquette, `${p().id} : étiquette lue${quoi}`);
        }
        api.sauver(); api.redessiner();
      });
      z.querySelectorAll('[data-q-detail]').forEach((i) => i.addEventListener('input', () => { s().detail[i.dataset.qDetail] = i.value; api.sauver(); }));
      z.querySelectorAll('[data-q-res]').forEach((i) => i.addEventListener('input', () => { e.palettes[i.dataset.qRes].res = i.value; api.sauver(); }));
      z.querySelectorAll('[data-q-res2]').forEach((i) => i.addEventListener('input', () => { e.palettes[i.dataset.qRes2].res2 = i.value; api.sauver(); }));
      z.querySelector('[data-q-deballage]')?.addEventListener('change', (ev) => { kc().deballage = ev.target.checked; api.sauver(); });
      on('rentrer', geste(() => { ui.chef4 = false; rentrer(e, api); }));
      on('ecrire', geste(() => {
        // Guidage : apprendre l'ordre (le froid d'abord, les papiers ensuite) sans l'imposer.
        const k = kc();
        if (A.chefDeQuai && F && !k.rentre && !k.chefVu) { k.chefVu = true; ui.chef4 = true; api.sauver(); api.redessiner(); api.zone().querySelector('[data-q-chef]')?.scrollIntoView({ block: 'center' }); return; }
        ecrireReserves(e, api);
      }));
      on('chefRentrer', geste(() => { ui.chef4 = false; rentrer(e, api); }));
      on('chefPapiers', geste(() => { ui.chef4 = false; kc().passeOutreChef = true; ecrireReserves(e, api); }));
      on('signer', geste(() => {
        const k = kc();
        // Guidage : le chauffeur refuse de signer une réserve sans valeur.
        const vides = k.lignes.filter((l) => l.vide);
        if (A.chefDeQuai && vides.length) {
          k.paroleChauffeur = `Votre réserve sur ${vides.map((l) => l.id).join(', ')} ne dit pas combien ni quoi. Une réserve pas précise, ça ne vaut rien. Complétez et je signe.`;
          api.sauver(); api.redessiner(); return;
        }
        k.signe = true; k.paroleChauffeur = '';
        if (ISO && !k.rentre) { k.rentre = true; k.heureRentre = e.minute; }
        avancer(e, C.signer, `BL${M ? ` du ${nomCam(ca(e))}` : ''} signé par le chauffeur, réserves comprises`);
        api.sauver(); api.redessiner();
      }));
      on('clore', geste(() => {
        if (!toutFini(e)) return;
        sig('cloturer');
        if (EVAL && !api.estProf) {
          if (!secondClic(ui, 'arme')) { api.redessiner(); return; }
          e.fini = true; api.sauver(); api.redessiner(); if (Q.rendCopie !== false) api.rendreCopie(); return;
        }
        e.fini = true; api.sauver(); api.redessiner();
      }));
      on('desarmer', () => { ui.arme = false; api.redessiner(); });
      on('recommencer', () => {
        if (Q.recommencer === false) return;
        if (!secondClic(ui, 'armeRaz')) { api.redessiner(); return; }
        ui.vueScene = 'dehors'; ui.levee = null; ui.armeScene = false; ui.arretSecu = false;
        api.recommencer();
      });
      if (ui.jouerCf) { ui.jouerCf = false; jouerCf(z, e); }
    },
  };
}
