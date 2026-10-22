// Mode « palettier » de la vue Plan d'entrepôt : ranger À L'ADRESSE DONNÉE par le système (chantier E-7, lot 1,
// 21/10/2026, brief `docs/briefs/MOTEUR-palettier-adresse-donnee.md` et décisions du chef `docs/briefs/COORDINATION-palettier.md` §3).
//
// Chez Action (CAP), c'est le SYSTÈME qui donne l'adresse : l'élève lit l'adresse sur la palette, va à l'emplacement, le
// regarde de près, puis pose au sol (niveau 1) ou confie la palette au cariste au-dessus du sol ; s'il ne peut pas ranger
// là, il signale. C'est l'inverse du mode `rangement` (Smoby, ENT-5.5 : l'élève choisit d'après des critères), d'où un
// mode à part, dans son fichier : il EMPRUNTE à `entrepot.js` le plan vu de dessus, la travée de face, les adresses, la
// charge d'un niveau (`chargeNiveau`), les occupants et les emplacements hors service, comme le fait la visite. Rien du
// dessin de Smoby ne change : la travée de face n'a gagné que des réglages, chacun absent = le dessin d'avant.
//
// Une déclaration (exemple complet : `contenus/palettier-essai.js`, page d'essai `outils/essai-palettier.html`) :
//
//   entrepot: {
//     id, libelle, mode: 'palettier',
//     personnage: { nom, role, date, texte },            // texte : une chaîne, ou { guidage, entrainement, evaluation }
//     plan: { allees, cotes: { A1: { charge: { 2: 1500, 3: 1200, 4: 1000 } } }, travees, niveaux (≤ 4), emplacements,
//             horsService, zones: { quais } },            // comme le rangement ; le sol (N1) n'a ni plaque ni limite
//     produits: { LES: { nom, court? } }, stock: { 'A1-T01-N1-E1': { produit: 'LES', kg: 493 } },   // pas de gammes
//     palettes: [
//       { id: 'P1', nom: 'Lessive liquide 3 L', cartons: 24, kg: 13, adresse: 'A1-T03-N1-E2' },   // kg : UN carton
//       { id: 'P5', …, adresse: 'A1-T02-N3-E2', nouvelleAdresse: 'A1-T04-N2-E3' },  // à signaler ; le système donne la nouvelle
//       { id: 'P7', …, adresse: '…', aSignaler: true },                             // à signaler, sans nouvelle adresse
//       { id: 'P6', …, niveaux: ['confirme'] },                                       // présente au confirmé seulement : jalons bonus
//       { id: 'P8', …, adresse: 'A1-T03-N1-E1', adresseLibre: 'A1-T01-N1-E2' },     // LOT 3 : son adresse est OCCUPÉE (stock de départ) ;
//     ],                                                   // « Demander une adresse libre » donne l'adresse libre (voir plus bas)
//     cariste: { nom: 'Kevin', niveaux: [2, 3, 4], monte: 'validation' },   // monte : 'validation' (défaut) ou (db) => booléen
//     aideCharge: 'somme' | 'pose' | 'plaque',   // vue de près : plaque + déjà posé + somme / plaque + déjà posé / plaque seule (défaut)
//     verdict: 'critere' | 'adresse',            // après « Valider » : nom du critère faux / critère et adresse attendue ; absent = rien
//     regles: { titre?, entete?, lignes: [html…], encadre?, ouvertes?: true },   // « Les règles ▾ » (jamais en copie) ; `ouvertes` : dépliées au chargement en guidage
//     terminal: { nom: 'Terminal', scan: 'palette-emplacement' | 'emplacement' },   // LOT 2 : le scan (voir plus bas) ; absent = pas de scan
//   }
//
// LE SCAN (lot 2, 22/10/2026). `terminal` active le Terminal (le boîtier du terminal vocal, renommé, sans voix, mode « scanner » :
// `terminal.js`) à la place de l'encart « Système », et un SECOND temps pour chaque palette : la poser (ou la confier) ne suffit pas,
// il faut la SCANNER pour que le système sache où elle est. Deux scans, toujours dans le même ordre (décision de Tristan, 21/10/2026) :
// la PALETTE d'abord (clic sur son étiquette, code-barres dessiné : sur sa carte, sur la palette dans la vue de près, dans la zone
// « À monter »), l'EMPLACEMENT ensuite (clic sur l'étiquette d'adresse de la vue de près). `scan: 'emplacement'` (variante de la
// page d'essai) : un seul clic, l'étiquette de l'emplacement confirme la palette qui s'y trouve. Le Terminal dit « Scanne la
// palette. » puis « P1 — Lessive liquide 3 L. Scanne l'emplacement. » ; « A1-T03-N1-E2 — Lessive liquide 3 L — 24 cartons. Confirmé. »
// si c'est l'adresse que le système attend pour cette palette (`adresse`, ou `nouvelleAdresse` reçue après signalement) et que la
// palette y est posée ou confiée ; sinon « Ce n'est pas l'adresse de cette palette. » (rouge, compté dans `scansRefuses`, trace
// jamais notée seule). Refus sans trace : « Range d'abord la palette. » (palette en réception ou en main), « Scanne d'abord la
// palette. ». Les lignes du système (nouvelle adresse, signalement enregistré, demande envoyée à Kevin) passent dans le journal du
// Terminal (la fenêtre modale du signalement reste). Les phrases du Terminal sont dites aussi en copie (c'est l'outil, pas une aide).
// Sans `terminal` : le lot 1 tel quel (ni boîtier, ni étiquette cliquable, ni jalon `scan-`).
//
// ADRESSE PRISE, ADRESSE LIBRE (lot 3, 22/10/2026). Une palette qui déclare `adresseLibre` a une adresse donnée OCCUPÉE (le stock de
// départ y est ; contrôlé au chargement, comme l'adresse libre qui doit être libre, au niveau 1 ou à un niveau du cariste ; pas avec
// `nouvelleAdresse` ni `aSignaler`). Trois chemins, tous permis par la vue (c'est la séance qui juge) : (1) ouvrir l'emplacement de
// l'adresse donnée avec la palette en main (« Occupé »), cliquer « Demander une adresse libre » (vue de près d'un emplacement occupé) :
// le Terminal et la fenêtre « Message du système » disent « Adresse libre pour P3 (Bougies parfumées) : A1-T02-N1-E3. », la carte
// porte « Nouvelle adresse », `libres: { P3: adresse }` ; la palette se range là et se scanne ; (2) poser « à côté » sans rien demander :
// permis, le scan y est REFUSÉ (« Ce n'est pas l'adresse de cette palette. ») et le système la croit toujours à l'adresse donnée ;
// (3) la laisser dans l'allée : « Valider » reste possible. Pour une palette sans `adresseLibre`, le bouton répond « Pas d'autre adresse :
// A1-T03-N1-E2 est libre. » (rien d'écrit, aucun geste). Le bouton n'existe que si une palette au moins déclare `adresseLibre`.
//
// Le poids d'une palette = cartons × kg + 25 (le support), CALCULÉ ici (ENT-8.11 §6), jamais recopié.
//
// GESTES publiés (tous inscrits dans `signaux`, préfixés `entrepot:<id>:`) : `prendre:<P>` (palette prise en main, en
// réception ou reprise), `poser:<P>` (pose réussie au sol), `confier:<P>` (confiée au cariste), `signaler:<P>`, `ouvrir`
// (toute ouverture d'un emplacement de près, publiée à chaque fois : `api.signal` ne retient que la première), `monter`
// (le bouton « Faire monter les palettes » : l'élève demande à Kevin de monter ce qui attend dans « À monter »), `valider`, et,
// avec `terminal`, `scan:<P>` (le second scan réussi : la palette est confirmée à son adresse) ; et, pour chaque palette qui déclare
// `adresseLibre` (lot 3), `occupe:<P>` (l'emplacement de son adresse donnée ouvert de près AVEC cette palette en main, ou la palette prise
// alors que cet emplacement est ouvert : publié à chaque fois, la base retient le premier) et `adresseLibre:<P>` (« Demander une adresse
// libre » pressé pour cette palette).
// Après « Valider », plus aucun geste.
//
// L'ÉTAT, dans `db.entrepots[<id>]` (cloisonné par séance), lu par les lots 2 à 6 :
//   { enMain: 'P1' | null, posees: { P1: 'A1-T03-N1-E2' }, confiees: { P3: 'A2-T02-N3-E1' },
//     signalees: { P5: { motif: 'charge', adresse: 'A1-T02-N3-E2' } }, nouvelles: { P5: 'A1-T04-N2-E3' },
//     tentativesHaut: 0, valide: false, at: null, premierGeste: null }
// Avec `terminal` s'y ajoutent (créées au premier dessin, absentes sinon) : `scan: { P1: 'A1-T03-N1-E2' }` (second scan réussi : ce que
// le système croit), `scansRefuses: n` (trace), `scanAttente: 'P1' | null` (palette scannée, l'emplacement est attendu), `terminal`
// (le journal et la phrase du Terminal). Une palette reprise perd son scan.
// Une palette confiée est MONTÉE (dessinée à son emplacement) quand Kevin la monte : au bouton « Faire monter les palettes »
// (sans `monte` ou `monte: 'validation'` : tout de suite), à la validation (`monte: 'validation'` seulement), ou dès que
// `monte(db)` est vrai (relu à chaque dessin). Le résultat n'est pas rangé : il est calculé (`montees`). Le bouton écrit, une
// fois pressé, `monterDemande: true` (la demande survit à un rechargement) et, sans fonction `monte`, `monteesIds` (les palettes
// qu'il a montées) ; à la validation s'écrit `monteesValidation` (les palettes montées À CE MOMENT) : une palette confiée mais
// pas montée alors n'est pas rangée (`place-<P>` faux). Ces clés n'existent pas dans l'état neuf.
//
// JALONS (ids stables ; `attente` avant « Valider », `ok` / `ko` après, jamais `attente` après) :
//   `place-<P>`   palette à ranger : posée au sol, ou confiée, À SON ADRESSE ; signalée à tort (son adresse était possible) = ko ;
//   `signale-<P>` palette à signaler (`nouvelleAdresse` ou `aSignaler`) : signalée DEPUIS son adresse, avec un motif vrai,
//                 non rangée à son adresse d'origine, puis (si le système a donné une nouvelle adresse) rangée à la nouvelle ;
//   `pasPoseHaut` aucune tentative de pose au-dessus du sol, et toutes les palettes traitées (posée, confiée ou signalée) ;
//   `charge`      aucune palette posée ou confiée au-delà d'une plaque, et toutes les palettes traitées.
//   `adresseLibre-<P>` (lot 3, À LA PLACE de `place-<P>` pour une palette à `adresseLibre`) : adresse libre demandée ET palette posée
//                 (ou confiée et montée) à CETTE adresse ; posée à côté sans demander, restée en réception, ou demandée mais posée
//                 ailleurs = ko. Le scan est jugé par `scan-<P>` seul (l'adresse attendue y est l'adresse libre une fois demandée).
// (« toutes les palettes » ne compte pas les palettes bonus du confirmé : en laisser une en réception ne coûte rien à ces deux gardes.)
//   `scan-<P>`    (avec `terminal`, une palette qui n'est pas `aSignaler` sans nouvelle adresse) : `scan[P]` est l'adresse que le
//                 système attend (la nouvelle adresse reçue, sinon l'adresse donnée) ; ko sinon, jamais `attente` après « Valider ».
//                 En copie la nouvelle adresse n'est jamais donnée : `scan-P5` y reste ko (la palette signalée ne se range pas).
// Les jalons d'une palette `niveaux: ['confirme']` sont `bonus: true`. LA VÉRITÉ d'un emplacement (`verite`) : hors service
// → `abime` ; stock de départ ou une autre palette de l'élève (à la fin) → `occupe` ; charge du niveau (stock + toutes les
// autres palettes de l'élève, à la fin) + la palette > plaque → `charge`. `autre` n'est jamais vrai.
//
// LE COMPTAGE (lot 4, 22/10/2026 : « compter au Terminal, à l'aveugle, en cartons », ENT-8.12 puis ENT-8.14 en copie). Une liste
// d'adresses AU SOL (niveau 1 : on compte depuis le sol, décision 12), le stock que croit le système et le réel dessiné :
//
//   comptage: {
//     adresses: [   // dans l'ordre de la liste (rang 1 … n, 8 au plus), toutes au niveau 1
//       { adresse: 'A1-T03-N1-E2', produit: 'LES', systeme: 36, reel: 33, couche: [3, 3], couches: 4, cle: 'manque' },
//       { …, niveaux: ['confirme'] },   // au confirmé seulement (en fin de liste) : jalons bonus
//     ],
//     recompte: 'ecart' | 'jamais',   // défaut 'ecart' : un compte différent du système propose de recompter
//     aideCouche: true,               // la vue de près écrit « 3 × 3 = 9 par couche » (jamais le total) ; défaut false
//   },
//   terminal: { nom: 'Terminal' },    // obligatoire : on compte au Terminal ; `palettes` devient facultatif
//
// `couche: [W, D]` et `couches` donnent la palette pleine (W × D × couches) ; `reel` la dessine (`pileCartons` d'entrepot.js, le
// dessin de la préparation) : couches du dessous complètes, cartons manquants sur la couche du dessus, cartons en trop posés
// dessus (une couche au plus). `produit` : un code de `produits` ou une désignation ; une adresse absente du stock est OCCUPÉE par
// la déclaration du comptage (ajoutée au stock de la vue) ; présente, elle garde son produit. `systeme` n'apparaît JAMAIS dans la
// page avant « Terminer le comptage » ; la travée de face n'écrit ni poids ni plaque, la vue de près ni plaque ni capteur (le
// poids d'une palette donnerait le nombre de cartons).
// Le geste : ouvrir l'emplacement de près (la palette dessinée), cliquer son ÉTIQUETTE (le scan ; « A1-T03-N1-E2 — Lessive liquide
// 3 L. Combien de cartons ? »), taper le nombre dans le champ du Terminal. Égal au système (ou `recompte: 'jamais'`) : « Compris. » ;
// différent : « Quantité différente. Recompter ou confirmer ? » (deux boutons du Terminal, ni le nombre ni le sens), « Recompter »
// redemande, « Confirmer » garde. Taper sans scan : « Scanne d'abord l'adresse. » (trace `sansScan`). Une adresse hors liste se
// compte (« Compris. »), gardée en trace (`horsListe`). Un compte se refait en rescannant l'adresse : le dernier confirmé compte.
// « Terminer le comptage » (confirmation s'il reste des adresses) fige tout ; avec `verdict`, hors copie, chaque ligne de la liste
// dit « ✓ » ou « ✗ compte » (« · réel : n » avec 'adresse').
// Avec `palettes` ET `comptage` (ENT-8.14), le comptage vient après « Valider mon rangement » (qui ne rend alors pas la copie :
// « Terminer le comptage » la rend) ; les phases nommées sont le lot 6.
// GESTES : `compte:<rang>` (compte confirmé), `compte:scan` (adresse scannée pour compter), `compte:fin` (« Terminer le comptage »).
// ÉTAT : `comptage: { scanne, enCours: { rang, compte } | null, comptes: { 1: 33 }, premiers, propositions: { 1: n }, recomptes:
// { 1: n }, horsListe: [{ adresse, compte }], sansScan, fini, at }` (absent sans `comptage`).
// JALONS (par rang de la liste, la même pour tous ; `attente` avant « Terminer », jamais après) : `compte-<rang>` (dernier compte
// confirmé = réel) ; `recompte-<cle ou rang>` (non comptée → ko ; le Terminal a proposé de recompter → ok si « Recompter » choisi
// au moins une fois ; rien proposé → ok) ; `scanAvant` (ko si rien n'est compté). Exports d'entrepot.js : `ecartsConfirmes`,
// `etatComptage`.

import { ech, pad2 } from '../texte.js';
import { niveauEleve, graineDeBase, NIVEAUX_ELEVE } from '../tirage.js';
import { creerTerminal, terminalScannerNeuf, direTerminal } from './terminal.js';

const nb = (n) => Number(n).toLocaleString('fr-FR');
const kg = (n) => `${nb(n)} kg`;
const decoupe = (a) => {
  const m = /^([A-Z]+\d+)-T(\d+)-N(\d+)-E(\d+)$/.exec(String(a || ''));
  return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null;
};

// Les motifs d'un signalement, dans l'ordre des boutons (au « tu »).
export const MOTIFS = [['occupe', 'C’est occupé'], ['charge', 'La charge serait dépassée'], ['abime', 'L’emplacement est abîmé'], ['autre', 'Autre']];
const MOTIF_IDS = MOTIFS.map((m) => m[0]);
export const AIDES_CHARGE = ['somme', 'pose', 'plaque'];
export const VERDICTS = ['critere', 'adresse'];
export const SCANS = ['palette-emplacement', 'emplacement'];
export const RECOMPTES = ['ecart', 'jamais'];
// Le support d'une palette (ENT-8.11 §6) et le poids d'une palette chargée, calculé, arrondi au centième.
export const SUPPORT_KG = 25;
export const poidsPalette = (cartons, kgCarton) => Math.round((cartons * kgCarton + SUPPORT_KG) * 100) / 100;

/* ================================================================ compilation */
// Appelée par `compiler` (entrepot.js) après le plan, le stock et les produits, qui sont ceux du rangement. Remplit `M.pal`
// (le même objet que lisent `chargeNiveau` et `occupant` : le poids d'une palette y est son poids TOTAL), et pose
// `M.cariste`, `M.aide`, `M.verdict`, `M.jalons`. Une déclaration fautive ne se charge pas.
export function compilerPalettier(M, err) {
  const P = M.P;
  // Avec un comptage (lot 4), les palettes à ranger sont facultatives (ENT-8.12 ne fait que compter).
  if (P.palettes != null && !Array.isArray(P.palettes)) err('palettes : une liste');
  if (P.comptage == null && !(P.palettes || []).length) err('aucune palette à ranger (palettes)');
  const C = P.cariste;
  let cariste = null;
  if (C) {
    if (!C.nom) err('cariste : il manque le nom');
    const tous = []; for (let n = 2; n <= M.N; n++) tous.push(n);
    const niveaux = C.niveaux || tous;
    if (!Array.isArray(niveaux) || !niveaux.length || niveaux.some((n) => !tous.includes(n))) err(`cariste : niveaux à choisir parmi ${tous.join(', ')} (le sol, N1, c'est l'élève)`);
    if (C.monte != null && C.monte !== 'validation' && typeof C.monte !== 'function') err('cariste.monte : « validation » ou une fonction de la base (db) => vrai / faux');
    cariste = { nom: String(C.nom), role: C.role || 'cariste', niveaux: niveaux.slice(), monte: C.monte == null ? 'validation' : C.monte };
  }
  const prises = new Map();   // adresse → palette qui la déclare (adresse ou nouvelle adresse)
  const verifierAdresse = (ou, a, quoi) => {
    const d = decoupe(a);
    if (!d || !M.existe.has(a)) err(`${ou} : ${quoi} inconnue (${a})`);
    if (prises.has(a)) err(`${ou} : ${quoi} ${a} est déjà celle de ${prises.get(a)}`);
    return d;
  };
  (P.palettes || []).forEach((p, i) => {
    const ou = `palette ${p && p.id ? p.id : `n° ${i + 1}`}`;
    if (!p || !p.id) err(`${ou} : il manque un id`);
    if (M.pal[p.id]) err(`${ou} déclarée deux fois`);
    if (!p.nom) err(`${ou} : il manque le nom`);
    if (!(Number.isInteger(p.cartons) && p.cartons > 0)) err(`${ou} : cartons (un nombre entier de cartons)`);
    if (!(p.kg > 0)) err(`${ou} : kg (le poids d'UN carton)`);
    const d = verifierAdresse(ou, p.adresse, 'adresse');
    prises.set(p.adresse, p.id);
    const aSignaler = p.nouvelleAdresse != null || p.aSignaler === true;
    if (p.nouvelleAdresse != null) {
      const dn = verifierAdresse(ou, p.nouvelleAdresse, 'nouvelle adresse');
      prises.set(p.nouvelleAdresse, p.id);
      if (dn.n > 1 && !(cariste && cariste.niveaux.includes(dn.n))) err(`${ou} : sa nouvelle adresse est au niveau N${dn.n}, que le cariste ne dessert pas`);
    }
    // Lot 3 : l'adresse donnée est prise, le système a une adresse libre à donner (occupation contrôlée plus bas, une fois le stock complet).
    if (p.adresseLibre != null) {
      if (p.nouvelleAdresse != null || p.aSignaler === true) err(`${ou} : adresseLibre ne va pas avec nouvelleAdresse ni aSignaler (une palette a UNE façon de s'en sortir)`);
      const dl = verifierAdresse(ou, p.adresseLibre, 'adresse libre');
      prises.set(p.adresseLibre, p.id);
      if (dl.n > 1 && !(cariste && cariste.niveaux.includes(dl.n))) err(`${ou} : son adresse libre est au niveau N${dl.n}, que le cariste ne dessert pas`);
    }
    if (!aSignaler && d.n > 1 && !(cariste && cariste.niveaux.includes(d.n))) err(`${ou} : son adresse est au niveau N${d.n}, que le cariste ne dessert pas (déclarer « cariste »)`);
    if (p.niveaux != null && !(Array.isArray(p.niveaux) && p.niveaux.length === 1 && p.niveaux[0] === 'confirme')) {
      err(`${ou} : niveaux — seul ['confirme'] est prévu (une palette bonus du confirmé), parmi ${NIVEAUX_ELEVE.join(', ')}`);
    }
    M.pal[p.id] = { id: p.id, nom: String(p.nom), cartons: p.cartons, kgCarton: p.kg, kg: poidsPalette(p.cartons, p.kg),
      adresse: p.adresse, nouvelleAdresse: p.nouvelleAdresse || null, adresseLibre: p.adresseLibre || null, aSignaler,
      niveaux: p.niveaux ? p.niveaux.slice() : null, bonus: !!p.niveaux };
  });
  const aPal = Object.keys(M.pal).length > 0;
  const aLibre = Object.values(M.pal).some((p) => p.adresseLibre);
  if (aPal && !Object.values(M.pal).some((p) => !p.bonus)) err('toutes les palettes sont des bonus du confirmé : il en faut au moins une pour tous');
  const aide = P.aideCharge == null ? 'plaque' : P.aideCharge;
  if (!AIDES_CHARGE.includes(aide)) err(`aideCharge : ${AIDES_CHARGE.join(', ')} (absent = plaque)`);
  if (P.verdict != null && !VERDICTS.includes(P.verdict)) err(`verdict : ${VERDICTS.join(', ')} (absent = rien)`);
  // LE TERMINAL (lot 2) : un objet { nom, scan } ; absent = pas de scan (le lot 1 tel quel).
  let terminal = null;
  if (P.terminal != null) {
    const T = P.terminal;
    if (typeof T !== 'object' || Array.isArray(T) || !T.nom) err('terminal : un objet avec un nom, par exemple { nom: \'Terminal\' }');
    if (T.scan != null && !SCANS.includes(T.scan)) err(`terminal.scan : ${SCANS.join(', ')} (absent = palette-emplacement)`);
    terminal = { nom: String(T.nom), scan: T.scan || 'palette-emplacement' };
  }
  const comptage = P.comptage != null ? compilerComptage(M, P.comptage, terminal, err) : null;
  // Lot 3, une fois le stock complet (le comptage l'a peut-être augmenté) : l'adresse donnée est OCCUPÉE, l'adresse libre est LIBRE.
  Object.values(M.pal).filter((p) => p.adresseLibre).forEach((p) => {
    const ou = `palette ${p.id}`;
    if (!M.stock[p.adresse]) err(`${ou} : son adresse ${p.adresse} doit être occupée dans le stock de départ (adresseLibre : l’adresse donnée est prise)`);
    if (M.stock[p.adresseLibre]) err(`${ou} : son adresse libre ${p.adresseLibre} est occupée dans le stock de départ (elle doit être libre)`);
    if (M.hs.has(p.adresseLibre)) err(`${ou} : son adresse libre ${p.adresseLibre} est hors service (elle doit être libre)`);
  });
  const jalons = [];
  Object.values(M.pal).forEach((p) => {
    const b = p.bonus ? { bonus: true } : {};
    jalons.push(p.aSignaler
      ? { id: `signale-${p.id}`, type: 'signale', palette: p.id, lib: `${p.id} signalée avec le bon motif (${p.nom})`, ...b }
      : p.adresseLibre
        ? { id: `adresseLibre-${p.id}`, type: 'libre', palette: p.id, lib: `${p.id} rangée à l’adresse libre demandée (${p.nom})`, ...b }
        : { id: `place-${p.id}`, type: 'place', palette: p.id, lib: `${p.id} rangée à son adresse (${p.nom})`, ...b });
    // Le scan : une palette signalée sans nouvelle adresse ne se range pas, donc ne se scanne pas : pas de jalon.
    if (terminal && !(p.aSignaler && !p.nouvelleAdresse)) {
      jalons.push({ id: `scan-${p.id}`, type: 'scan', palette: p.id, lib: `${p.id} scannée à son adresse (${p.nom})`, ...b });
    }
  });
  if (aPal) {
    jalons.push({ id: 'pasPoseHaut', type: 'pasPoseHaut', lib: 'Aucune palette posée soi-même au-dessus du sol' });
    jalons.push({ id: 'charge', type: 'charge', lib: 'Aucune plaque de charge dépassée' });
  }
  // Le comptage (lot 4) : après les jalons du rangement, par RANG de la liste (la même pour tous les élèves).
  if (comptage) {
    comptage.adresses.forEach((x) => jalons.push({ id: `compte-${x.rang}`, type: 'compte', comptage: true, rang: x.rang,
      lib: `Adresse n° ${x.rang} de la liste bien comptée`, ...(x.bonus ? { bonus: true } : {}) }));
    comptage.adresses.forEach((x) => jalons.push({ id: `recompte-${x.cle || x.rang}`, type: 'recompte', comptage: true, rang: x.rang,
      lib: x.cle ? `Recompté quand le compte ne collait pas (${x.cle})` : `Adresse n° ${x.rang} : recomptée quand le compte ne collait pas`,
      ...(x.bonus ? { bonus: true } : {}) }));
    jalons.push({ id: 'scanAvant', type: 'scanAvant', comptage: true, lib: 'Adresse scannée avant de compter' });
  }
  Object.assign(M, { cariste, aide, verdict: P.verdict || null, jalons, terminal, comptage, aPal, aLibre });
}

// LE COMPTAGE (lot 4) : contrôle la liste, et OCCUPE les adresses absentes du stock (copies du stock et des produits de la vue :
// la déclaration de la séance n'est jamais modifiée). Une déclaration fautive ne se charge pas.
function compilerComptage(M, Q, terminal, err) {
  if (typeof Q !== 'object' || Array.isArray(Q) || !Array.isArray(Q.adresses) || !Q.adresses.length) {
    err('comptage : une liste d’adresses à compter (comptage: { adresses: [{ adresse, produit, systeme, reel, couche, couches }] })');
  }
  if (Q.adresses.length > 8) err('comptage : 8 adresses au plus (la liste tient au-dessus du Terminal)');
  if (!terminal) err('comptage : on compte au Terminal, déclarer terminal: { nom: \'Terminal\' }');
  if (Q.recompte != null && !RECOMPTES.includes(Q.recompte)) err(`comptage.recompte : ${RECOMPTES.join(', ')} (absent = ecart)`);
  if (Q.aideCouche != null && typeof Q.aideCouche !== 'boolean') err('comptage.aideCouche : true ou false');
  const stock = Object.assign({}, M.stock), produits = Object.assign({}, M.produits);
  const vues = new Set(), cles = new Set();
  let bonusVu = false;
  const adresses = Q.adresses.map((x, i) => {
    const rang = i + 1, ou = `comptage, adresse n° ${rang}`;
    if (!x || typeof x !== 'object') err(`${ou} : un objet { adresse, produit, systeme, reel, couche, couches }`);
    const d = decoupe(x.adresse);
    if (!d || !M.existe.has(x.adresse)) err(`${ou} : adresse inconnue (${x.adresse})`);
    if (d.n !== 1) err(`${ou} : ${x.adresse} n’est pas au niveau 1 (on compte depuis le sol : l’élève ne monte pas)`);
    if (M.hs.has(x.adresse)) err(`${ou} : ${x.adresse} est hors service`);
    if (vues.has(x.adresse)) err(`${ou} : ${x.adresse} est déjà dans la liste`);
    vues.add(x.adresse);
    if (!(Number.isInteger(x.systeme) && x.systeme >= 0)) err(`${ou} : systeme (le nombre entier de cartons que croit le système)`);
    if (!(Number.isInteger(x.reel) && x.reel >= 1)) err(`${ou} : reel (le nombre entier de cartons dessinés, 1 au moins)`);
    const pos = (n, max) => Number.isInteger(n) && n >= 1 && n <= max;
    if (!(Array.isArray(x.couche) && x.couche.length === 2 && x.couche.every((n) => pos(n, 5)))) err(`${ou} : couche [W, D] (cartons en largeur et en profondeur, de 1 à 5)`);
    if (!pos(x.couches, 6)) err(`${ou} : couches (le nombre de couches de la palette pleine, de 1 à 6)`);
    const par = x.couche[0] * x.couche[1], plein = par * x.couches;
    if (x.reel <= par * (x.couches - 1)) err(`${ou} : reel ${x.reel} laisse la couche du dessus vide (${x.couches} couches de ${par} : plus de ${par * (x.couches - 1)} cartons, ou une couche de moins)`);
    if (x.reel > plein + par) err(`${ou} : reel ${x.reel} : une couche au plus de cartons en trop posés dessus (${plein + par} au plus)`);
    if (x.cle != null) {
      if (typeof x.cle !== 'string' || !/^[a-z][a-z0-9_]*$/i.test(x.cle)) err(`${ou} : cle (un mot qui commence par une lettre, ex. 'manque')`);
      if (cles.has(x.cle)) err(`${ou} : la clé « ${x.cle} » est déjà prise`);
      cles.add(x.cle);
    }
    let bonus = false;
    if (x.niveaux != null) {
      if (!(Array.isArray(x.niveaux) && x.niveaux.length === 1 && x.niveaux[0] === 'confirme')) err(`${ou} : niveaux — seul ['confirme'] est prévu (une adresse bonus du confirmé)`);
      bonus = bonusVu = true;
    } else if (bonusVu) err(`${ou} : les adresses du confirmé (niveaux: ['confirme']) viennent en fin de liste`);
    // Le produit : celui du stock si l'adresse y est ; sinon la déclaration du comptage l'occupe (un code de `produits`, ou une
    // désignation, qui devient un produit de la vue).
    let code;
    const st = stock[x.adresse];
    if (st) {
      if (x.produit != null && x.produit !== st.produit && x.produit !== (produits[st.produit] || {}).nom) err(`${ou} : le stock de ${x.adresse} est ${st.produit}, pas ${x.produit}`);
      code = st.produit;
    } else {
      if (!x.produit || typeof x.produit !== 'string') err(`${ou} : produit (un code de produits, ou la désignation du produit)`);
      code = x.produit;
      if (!produits[code]) produits[code] = { nom: code, court: code.split(' ')[0] };
      stock[x.adresse] = { produit: code, kg: 0, compte: rang };
    }
    return { rang, adresse: x.adresse, produit: code, nom: String(produits[code].nom), systeme: x.systeme, reel: x.reel,
      couche: x.couche.slice(), couches: x.couches, cle: x.cle || null, bonus, niveaux: bonus ? ['confirme'] : null };
  });
  if (!adresses.some((x) => !x.bonus)) err('comptage : toutes les adresses sont des bonus du confirmé : il en faut au moins une pour tous');
  M.stock = stock; M.produits = produits;
  return { adresses, recompte: Q.recompte || 'ecart', aideCouche: Q.aideCouche === true };
}

/* ==================================================================== le modèle */
export const etatPalettierNeuf = () => ({ enMain: null, posees: {}, confiees: {}, signalees: {}, nouvelles: {}, tentativesHaut: 0,
  valide: false, at: null, premierGeste: null });
const normal = (e) => Object.assign(etatPalettierNeuf(), e || {});
// Une palette est-elle là pour cet élève ? (`niveaux: ['confirme']` : au confirmé seulement.)
const presente = (p, niveau) => !p.niveaux || p.niveaux.includes(niveau);
export const presentes = (M, niveau) => Object.values(M.pal).filter((p) => presente(p, niveau));
// Où est chaque palette rangée à la fin : posée au sol, ou confiée (son emplacement de destination).
export const placement = (e) => Object.assign({}, e.posees || {}, e.confiees || {});
const traitee = (e, pl, id) => !!(pl[id] || (e.signalees || {})[id]);
const plaqueDe = (M, d) => M.cotes[d.c].charge[d.n];

// La VÉRITÉ d'un emplacement `a` pour la palette `p` : ce qui empêche vraiment de l'y ranger, d'après le stock de départ et ce
// que l'élève a rangé ailleurs (`pl`, sans compter `p`). Vide = l'adresse était possible.
export function verite(M, pl, p, a) {
  const d = decoupe(a);
  if (!d) return [];
  const F = [];
  if (M.hs.has(a)) F.push('abime');
  if (M.stock[a] || Object.keys(pl).some((id) => id !== p.id && pl[id] === a)) F.push('occupe');
  if (d.n > 1 && M.chargeNiveau(pl, d, p.id) + p.kg > plaqueDe(M, d) + 1e-9) F.push('charge');
  return F;
}
// La palette `p` est-elle rangée (posée ou confiée) sur un niveau dont elle fait dépasser la plaque ?
function depasse(M, pl, p) {
  const d = decoupe(pl[p.id]);
  return !!d && d.n > 1 && M.chargeNiveau(pl, d, p.id) + p.kg > plaqueDe(M, d) + 1e-9;
}
// Les critères faux d'une palette, d'après l'état (les noms montrés après « Valider ») : 'signalement', 'adresse',
// 'scan' (avec `terminal`, lot 2), 'plaque de charge'.
export function fautesPalette(M, e, p) {
  e = normal(e);
  const pl = placement(e), s = e.signalees[p.id], ou = pl[p.id];
  const F = [];
  // Confiée au cariste mais PAS montée au moment de « Valider » : elle n'est pas rangée (décision de Tristan, 21/10/2026).
  // `monteesValidation` est écrit à la validation (ce que Kevin avait monté, la validation comprise) ; un état validé sans cette
  // clé (d'avant le bouton) garde le jugement d'avant.
  const nonMontee = !!(e.valide && Array.isArray(e.monteesValidation) && e.confiees[p.id] && !e.monteesValidation.includes(p.id));
  if (p.adresseLibre) {
    // Lot 3 : la bonne adresse est l'adresse libre, et seulement une fois DEMANDÉE ; poser « à côté » sans demander est faux.
    if (!(e.libres || {})[p.id] || ou !== p.adresseLibre || nonMontee) F.push('adresse');
  } else if (!p.aSignaler) {
    if (s && !verite(M, pl, p, p.adresse).length) F.push('signalement');
    if (ou !== p.adresse || nonMontee) F.push('adresse');
  } else {
    if (!(s && s.adresse === p.adresse && verite(M, pl, p, p.adresse).includes(s.motif))) F.push('signalement');
    const nouvelle = e.nouvelles[p.id];
    if (ou === p.adresse || (nouvelle && ou !== nouvelle) || nonMontee) F.push('adresse');
  }
  if (aJalonScan(M, p) && (e.scan || {})[p.id] !== attendueScan(e, p)) F.push('scan');
  if (depasse(M, pl, p)) F.push('plaque de charge');
  return F;
}
// L'adresse que le système attend pour une palette : la nouvelle adresse reçue après signalement, l'adresse libre une fois demandée
// (lot 3), sinon l'adresse donnée.
const attendueScan = (e, p) => (e.nouvelles || {})[p.id] || (e.libres || {})[p.id] || p.adresse;
// Le jalon `scan-<P>` existe-t-il pour cette palette ? (avec `terminal`, sauf une palette signalée sans nouvelle adresse)
const aJalonScan = (M, p) => !!M.terminal && !(p.aSignaler && !p.nouvelleAdresse);
// Où le système croit la palette : l'adresse scannée si elle existe, sinon la nouvelle adresse reçue, sinon l'adresse libre demandée
// (lot 3), sinon l'adresse donnée (une palette posée « à côté » sans rien demander : l'adresse donnée, occupée).
export function ouSystemeCroitPalettier(M, e, id) {
  const p = M.pal[id];
  if (!p) return null;
  e = normal(e);
  return (e.scan || {})[id] || e.nouvelles[id] || (e.libres || {})[id] || p.adresse;
}

// Les jalons d'un état, pour un élève de niveau `niveau` (les palettes absentes pour lui n'ont pas de jalon).
export function jalonsPalettier(M, e, niveau = 'standard') {
  e = normal(e);
  const ps = presentes(M, niveau), ids = new Set(ps.map((p) => p.id));
  const pl = placement(e), v = !!e.valide;
  // La garde « toutes les palettes traitées » ne compte pas les palettes bonus du confirmé : en laisser une en réception ne coûte pas
  // `charge` ni `pasPoseHaut` (retouche du 22/10/2026, relevée par ENT-8.11). Une palette bonus posée trop haut ou en surcharge compte quand même.
  const toutes = ps.filter((p) => !p.bonus).every((p) => traitee(e, pl, p.id));
  // Le comptage (lot 4) : ses jalons sont jugés à « Terminer le comptage » (`fini`), pas à « Valider ».
  const C = normalC(e), liste = listeComptage(M, niveau), rangs = new Set(liste.map((x) => x.rang)), vC = !!C.fini;
  return M.jalons.filter((j) => (!j.palette || ids.has(j.palette)) && (!j.rang || rangs.has(j.rang))).map((j) => {
    if (j.comptage) {
      const ok = okComptage(M, C, j, liste);
      return { id: j.id, lib: j.lib, palette: null, rang: j.rang || null, bonus: !!j.bonus, ok: vC && ok, etat: vC ? (ok ? 'ok' : 'ko') : 'attente' };
    }
    let ok;
    if (j.type === 'scan') ok = !fautesPalette(M, e, M.pal[j.palette]).includes('scan');
    else if (j.palette) {
      const F = fautesPalette(M, e, M.pal[j.palette]);
      ok = !F.includes('adresse') && !F.includes('signalement');
    } else if (j.type === 'pasPoseHaut') ok = toutes && !(e.tentativesHaut > 0);
    else ok = toutes && !ps.some((p) => depasse(M, pl, p));
    return { id: j.id, lib: j.lib, palette: j.palette || null, bonus: !!j.bonus, ok: v && ok, etat: v ? (ok ? 'ok' : 'ko') : 'attente' };
  });
}

// Le détail rangé avec la note (l'enseignant le lit).
export function detailPalettier(M, e, L) {
  e = normal(e);
  const C = normalC(e);
  return { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok, etat: l.etat, ...(l.bonus ? { bonus: true } : {}) })),
    posees: Object.assign({}, e.posees), confiees: Object.assign({}, e.confiees),
    signalees: Object.fromEntries(Object.entries(e.signalees).map(([id, s]) => [id, s.motif])),
    tentativesHaut: e.tentativesHaut || 0, valide: !!e.valide, premierGeste: e.premierGeste || null,
    ...(M.terminal ? { scans: Object.assign({}, e.scan), scansRefuses: e.scansRefuses || 0 } : {}),
    ...(M.aLibre ? { libres: Object.assign({}, e.libres) } : {}),
    // Le comptage (lot 4) : ses comptes confirmés, les « Recompter » choisis, les propositions du Terminal, la trace hors liste et
    // les nombres tapés sans scan (jamais notés seuls).
    ...(M.comptage ? { comptage: { comptes: Object.assign({}, C.comptes), recomptes: Object.assign({}, C.recomptes),
      propositions: Object.assign({}, C.propositions), horsListe: C.horsListe.map((h) => Object.assign({}, h)), sansScan: C.sansScan || 0,
      fini: !!C.fini } } : {}) };
}

/* ================================================================ le comptage (lot 4) */
export const comptageNeuf = () => ({ scanne: null, enCours: null, comptes: {}, premiers: {}, propositions: {}, recomptes: {},
  horsListe: [], sansScan: 0, fini: false, at: null });
const normalC = (e) => Object.assign(comptageNeuf(), (e && e.comptage) || {});
// La liste d'un élève : les adresses de son niveau (celles du confirmé, en fin de liste, au confirmé seulement), dans l'ordre.
export const listeComptage = (M, niveau = 'standard') => (M.comptage ? M.comptage.adresses.filter((x) => presente(x, niveau)) : []);
const compte = (C, r) => (C.comptes || {})[r];
function okComptage(M, C, j, liste) {
  if (j.type === 'scanAvant') return liste.some((x) => compte(C, x.rang) != null);
  const x = M.comptage.adresses[j.rang - 1];
  if (j.type === 'compte') return compte(C, j.rang) === x.reel;
  // recompte, règle unique (décision de Tristan, 21/10/2026) : non comptée → faux ; le Terminal a proposé de recompter → juste si
  // « Recompter » a été choisi au moins une fois ; rien proposé (compte égal au système, ou `recompte: 'jamais'`) → juste.
  if (compte(C, j.rang) == null) return false;
  return !((C.propositions || {})[j.rang] > 0) || (C.recomptes || {})[j.rang] > 0;
}
// Les ÉCARTS CONFIRMÉS : vide tant que le comptage n'est pas terminé (l'aveugle tient jusque-là).
export function ecartsComptage(M, e, niveau = 'standard') {
  const C = normalC(e);
  if (!M.comptage || !C.fini) return [];
  return listeComptage(M, niveau).filter((x) => compte(C, x.rang) != null && compte(C, x.rang) !== x.systeme).map((x) => ({
    rang: x.rang, adresse: x.adresse, produit: x.nom, compte: compte(C, x.rang), systeme: x.systeme,
    sens: compte(C, x.rang) < x.systeme ? 'manque' : 'surplus' }));
}
export function etatLisibleComptage(M, e) {
  const C = normalC(e);
  return { comptes: Object.assign({}, C.comptes), recomptes: Object.assign({}, C.recomptes),
    horsListe: C.horsListe.map((h) => Object.assign({}, h)), fini: !!C.fini };
}
// Ce qu'il y a à compter à une adresse (le dessin de la vue de près) : une adresse de la liste (son réel), un autre stock au sol
// (une palette pleine, format tiré de l'adresse : un compte hors liste n'est qu'une trace), une palette de l'élève posée au sol
// (ENT-8.14 : ses cartons). Rien (null) : libre, hors service, ou au-dessus du sol.
export function aCompter(M, e, a) {
  const d = decoupe(a);
  if (!d || d.n !== 1 || M.hs.has(a)) return null;
  const x = M.comptage && M.comptage.adresses.find((y) => y.adresse === a);
  if (x) return { nom: x.nom, couche: x.couche, couches: x.couches, reel: x.reel };
  const h = [...a].reduce((s, c) => (s * 31 + c.charCodeAt(0)) % 9973, 7);
  const W = 2 + (h % 2), D = 2 + ((h >> 1) % 2);
  const st = M.stock[a];
  if (st) { const L = 3 + ((h >> 2) % 2); return { nom: String((M.produits[st.produit] || {}).nom || st.produit), couche: [W, D], couches: L, reel: W * D * L }; }
  const id = Object.keys((e && e.posees) || {}).find((k) => e.posees[k] === a);
  if (id && M.pal[id]) { const p = M.pal[id]; return { nom: p.nom, couche: [W, D], couches: Math.ceil(p.cartons / (W * D)), reel: p.cartons }; }
  return null;
}
// La phrase que le Terminal attend pendant le comptage.
function phraseComptage(M, e, fige) {
  const C = e.comptage;
  if (fige) return 'Terminé.';
  if (C.enCours) return 'Quantité différente. Recompter ou confirmer ?';
  if (C.scanne) { const q = aCompter(M, e, C.scanne); return `${C.scanne} — ${q ? q.nom : ''}. Combien de cartons ?`; }
  return 'Scanne l’adresse.';
}
const dit = (e, x, o) => direTerminal(e.terminal, x, o);
// LES GESTES DU COMPTAGE, purs (l'état seul : `e.comptage` et le journal du Terminal `e.terminal`). Chacun rend le geste à publier
// (sans le préfixe `entrepot:<id>:`) ou null.
// Le scan d'une adresse (clic sur l'étiquette de l'emplacement vu de près, au sol).
export function scannerComptage(M, e, a) {
  const C = e.comptage;
  if (C.fini) return null;
  if (C.enCours) { dit(e, 'Recompte ou confirme d’abord.', { refus: true }); return null; }
  if (!aCompter(M, e, a)) { dit(e, 'Rien à compter ici.', { refus: true }); return null; }
  C.scanne = a;
  return 'compte:scan';
}
// Un nombre tapé au Terminal (`v` : le texte du champ).
export function saisirComptage(M, e, v, niveau = 'standard') {
  const C = e.comptage;
  const s = String(v == null ? '' : v).replace(/\s+/g, '');
  if (C.fini || C.enCours || !s) return null;
  const phrase = phraseComptage(M, e, false);
  dit(e, phrase); dit(e, s, { eleve: true });
  if (!C.scanne) { C.sansScan = (C.sansScan || 0) + 1; dit(e, 'Scanne d’abord l’adresse.', { refus: true }); return null; }
  if (!/^\d{1,4}$/.test(s)) { dit(e, 'Je n’ai pas compris. Réponds avec des chiffres.', { refus: true }); return null; }
  const n = Number(s), a = C.scanne;
  const x = listeComptage(M, niveau).find((y) => y.adresse === a);
  if (!x) { C.horsListe = [...(C.horsListe || []), { adresse: a, compte: n }]; C.scanne = null; dit(e, 'Compris.'); return null; }
  const r = x.rang;
  if ((C.premiers || {})[r] == null) C.premiers = Object.assign({}, C.premiers, { [r]: n });
  if (M.comptage.recompte === 'jamais' || n === x.systeme) {
    C.comptes = Object.assign({}, C.comptes, { [r]: n }); C.scanne = null; dit(e, 'Compris.');
    return `compte:${r}`;
  }
  // Différent du système : le Terminal propose de recompter, sans dire de combien ni dans quel sens.
  C.enCours = { rang: r, compte: n };
  C.propositions = Object.assign({}, C.propositions, { [r]: ((C.propositions || {})[r] || 0) + 1 });
  return null;
}
// « Recompter » (efface, redemande) ou « Confirmer » (garde le compte).
export function choisirComptage(M, e, choix) {
  const C = e.comptage, X = C.enCours;
  if (C.fini || !X || !['recompter', 'confirmer'].includes(choix)) return null;
  dit(e, phraseComptage(M, e, false)); dit(e, choix === 'recompter' ? 'Recompter' : 'Confirmer', { eleve: true });
  C.enCours = null;
  if (choix === 'recompter') { C.recomptes = Object.assign({}, C.recomptes, { [X.rang]: ((C.recomptes || {})[X.rang] || 0) + 1 }); return null; }
  C.comptes = Object.assign({}, C.comptes, { [X.rang]: X.compte }); C.scanne = null; dit(e, 'Compris.');
  return `compte:${X.rang}`;
}
// « Terminer le comptage » : tout se fige.
export function terminerComptage(e) {
  const C = e.comptage;
  if (C.fini) return null;
  Object.assign(C, { fini: true, at: Date.now(), scanne: null, enCours: null });
  return 'compte:fin';
}

// Ce qu'attend chaque palette, sur le stock de départ (enseignant, page d'essai ; JAMAIS montré à l'élève).
export function attendusPalettier(M) {
  return Object.fromEntries(Object.values(M.pal).map((p) => {
    const d = decoupe(p.adresseLibre || p.adresse);
    const x = p.aSignaler ? { signaler: verite(M, {}, p, p.adresse), puis: p.nouvelleAdresse }
      : { adresse: p.adresseLibre || p.adresse, geste: d.n === 1 ? 'poser' : 'confier', ...(p.adresseLibre ? { demander: true, donnee: p.adresse } : {}) };
    if (p.bonus) x.niveaux = p.niveaux.slice();
    if (aJalonScan(M, p)) x.scan = p.nouvelleAdresse || p.adresseLibre || p.adresse;
    return [p.id, x];
  }).concat(M.comptage ? M.comptage.adresses.map((x) => [`compte-${x.rang}`, { comptage: true, rang: x.rang, adresse: x.adresse,
    produit: x.nom, reel: x.reel, systeme: x.systeme, ...(x.cle ? { cle: x.cle } : {}), ...(x.bonus ? { niveaux: ['confirme'] } : {}) }]) : []));
}

// Les palettes que le cariste a montées : avec `monte(db)`, toutes les confiées dès que la fonction est vraie ; sinon celles
// que le bouton « Faire monter » a montées (`monteesIds`), et toutes les confiées à la validation.
export function montees(M, e, db) {
  const C = M.cariste;
  e = normal(e);
  if (!C) return [];
  if (typeof C.monte === 'function') {
    let ok;
    try { ok = !!C.monte(db || {}); } catch (x) { ok = false; }
    return ok ? Object.keys(e.confiees) : [];
  }
  if (e.valide) return Object.keys(e.confiees);
  const ids = Array.isArray(e.monteesIds) ? e.monteesIds : [];
  return Object.keys(e.confiees).filter((id) => ids.includes(id));
}

// LU PAR UNE SÉANCE (exports d'`entrepot.js`) : les palettes confiées (les phrases du message à Kevin), l'état en clair.
export function confieesPalettier(M, e, niveau = 'standard') {
  e = normal(e);
  return presentes(M, niveau).filter((p) => e.confiees[p.id]).map((p) => ({ id: p.id, nom: p.nom, adresse: e.confiees[p.id] }));
}
export function etatLisiblePalettier(M, e, db) {
  e = normal(e);
  return { enMain: e.enMain || null, posees: Object.assign({}, e.posees), confiees: Object.assign({}, e.confiees),
    signalees: Object.fromEntries(Object.entries(e.signalees).map(([id, s]) => [id, s.motif])),
    nouvelles: Object.assign({}, e.nouvelles), montees: montees(M, e, db), tentativesHaut: e.tentativesHaut || 0, valide: !!e.valide,
    ...(M.terminal ? { scans: Object.assign({}, e.scan), scansRefuses: e.scansRefuses || 0 } : {}),
    ...(M.aLibre ? { libres: Object.assign({}, e.libres) } : {}) };
}

// La déclaration d'un élève quand la séance passe une FONCTION `(graine, { niveau, copie })` (lot 0) : la même que celle
// que construit le moteur pour sa base (graine et niveau lus dans la base), gardée par graine, niveau et copie.
const TIRES = new WeakMap();
export function declarationDe(E, db, { copie = false } = {}) {
  if (typeof E !== 'function') return E;
  const g = graineDeBase(db), niveau = niveauEleve(db, { copie });
  let C = TIRES.get(E);
  if (!C) TIRES.set(E, (C = new Map()));
  const k = `${g}|${niveau}|${copie ? 1 : 0}`;
  if (!C.has(k)) C.set(k, E(g, { niveau, copie }));
  return C.get(k);
}

/* ======================================================================= la vue */
// `O` : ce que prête `creerEntrepot` — la géométrie du plan (`G`, `AW`), le plan et la travée de face déjà écrits
// (`htmlPlan`, `htmlFace`), l'état d'écran partagé (`ui` : `trav`, `anim`, `focus`, `main`), Échap, le clavier.
export function creerPalettier(P, M, opts, O) {
  const ui = O.ui, G = O.G;
  // `regles: null` : « Les règles » n'ont pas encore été touchées par l'élève (le rangement, lui, part de `false`).
  Object.assign(ui, { pres: null, signaler: false, journal: [], confirmer: false, msg: '', msgType: '', alerte: null, regles: null,
    confirmerFin: false, focusTerm: false });
  const COPIE = !!opts.copie;
  const C = M.cariste, NOM = C ? C.nom : 'le cariste';
  const geste = (n) => `entrepot:${P.id}:${n}`;
  // Le Terminal du lot 2 (mode « scanner ») : absent sans `terminal`, et alors rien de ce qui touche au scan n'existe.
  const TERM = M.terminal ? creerTerminal({ nom: M.terminal.nom, mode: 'scanner' }) : null;
  const DEUX = !!TERM && M.terminal.scan !== 'emplacement';   // deux scans (la palette, puis l'emplacement) ; sinon un seul clic
  const signaux = [...Object.keys(M.pal).flatMap((id) => ['prendre', 'poser', 'confier', 'signaler', ...(TERM ? ['scan'] : [])].map((x) => geste(`${x}:${id}`))),
    ...Object.values(M.pal).filter((p) => p.adresseLibre).flatMap((p) => [geste(`occupe:${p.id}`), geste(`adresseLibre:${p.id}`)]),
    geste('ouvrir'), ...(M.aPal ? [geste('monter'), geste('valider')] : []),
    ...(M.comptage ? [...M.comptage.adresses.map((x) => geste(`compte:${x.rang}`)), geste('compte:scan'), geste('compte:fin')] : [])];
  // LE COMPTAGE (lot 4) est-il l'écran du moment ? Sans palettes, toujours ; avec des palettes (ENT-8.14), après « Valider mon
  // rangement » (les phases nommées sont le lot 6).
  const enComptage = (e) => !!M.comptage && (!M.aPal || !!e.valide);

  function regime(api, e) {
    const rendue = !!(api && api.copieRendue && api.copieRendue());
    const fini = !!(e.comptage && e.comptage.fini);
    return { copie: COPIE, rendue, fige: !!e.valide || rendue, prof: !!(api && api.estProf),
      niveau: niveauEleve(api && api.db, { copie: COPIE }),
      temps: COPIE ? 'evaluation' : (P.temps || (api && api.temps) || 'guidage'),
      // le comptage : son écran, et figé à « Terminer le comptage » (ou copie rendue)
      compte: enComptage(e), cfige: fini || rendue };
  }
  // Ce que chaque dessin recalcule : les palettes de l'élève, où tout est rangé, ce que Kevin a monté, sa liste à compter.
  function calcul(e, R, api) {
    const ps = presentes(M, R.niveau);
    return { ps, ids: new Set(ps.map((p) => p.id)), pl: placement(e), montees: montees(M, e, api && api.db), liste: listeComptage(M, R.niveau) };
  }
  function normaliser(e) {
    if (!e.posees) Object.assign(e, etatPalettierNeuf(), e);
    ['posees', 'confiees', 'signalees', 'nouvelles'].forEach((k) => { if (!e[k]) e[k] = {}; });
    if (M.aLibre && !e.libres) e.libres = {};   // lot 3 : absent de l'état neuf, créé au premier dessin d'une séance qui déclare `adresseLibre`
    if (TERM) {
      if (!e.scan) e.scan = {};
      if (typeof e.scansRefuses !== 'number') e.scansRefuses = 0;
      if (!e.terminal) e.terminal = terminalScannerNeuf();
    }
    if (M.comptage) {
      if (!e.comptage) e.comptage = comptageNeuf();
      else Object.entries(comptageNeuf()).forEach(([k, v]) => { if (!(k in e.comptage)) e.comptage[k] = v; });
    }
  }

  /* ------------------------------------------------------------- les gestes */
  const dire = (t, type) => { ui.msg = t; ui.msgType = type || ''; };
  // LE SYSTÈME parle : une ligne de l'encart « Système », ou, avec `terminal`, une ligne du journal du Terminal (qui survit
  // à un rechargement : elle est rangée dans l'état).
  function direSysteme(texte, e) {
    if (TERM) { TERM.dire(e.terminal, texte); return; }
    ui.journal.push(texte); if (ui.journal.length > 4) ui.journal.shift();
  }
  const noterGeste = (e) => { if (!e.premierGeste) e.premierGeste = Date.now(); };
  const occupeA = (e, a) => !!M.stock[a] || Object.values(placement(e)).includes(a);
  const adresseDe = (e, p) => e.nouvelles[p.id] || (e.libres || {})[p.id] || p.adresse;

  // Prendre une palette (sa carte ou la réception du plan) ; la reprendre si elle est posée ou attend Kevin ; recliquer la
  // palette en main la remet en réception. Rend le geste à publier, ou rien.
  function prendre(e, id, X) {
    if (!X.ids.has(id)) return null;
    if (e.enMain === id) { e.enMain = null; dire(''); return null; }
    if (X.montees.includes(id)) { dire(`<b>${ech(id)}</b> est déjà montée par ${ech(NOM)} : elle ne se reprend plus.`, 'non'); return null; }
    delete e.posees[id]; delete e.confiees[id];
    // Une palette reprise perd son scan : le système ne sait plus où elle est.
    if (e.scan) delete e.scan[id];   // (la palette en attente d'un emplacement est oubliée au dessin suivant : `html`)
    e.enMain = id; ui.signaler = false; ui.confirmer = false; dire('');
    noterGeste(e);
    return `prendre:${id}`;
  }
  function poserIci(e, a) {
    const p = M.pal[e.enMain], d = decoupe(a);
    if (!p) return null;
    noterGeste(e);
    if (d.n > 1) {
      e.tentativesHaut = (e.tentativesHaut || 0) + 1;
      dire(`Au-dessus du sol, c’est ${ech(NOM)} qui monte la palette.`, 'non');
      return null;
    }
    if (occupeA(e, a)) { dire('Emplacement déjà occupé. La palette reste en main.', 'non'); return null; }
    e.posees[p.id] = a; e.enMain = null;
    dire(`<b>${ech(p.id)}</b> posée en <b class="pe-mono">${ech(a)}</b>.`, 'oui');
    return `poser:${p.id}`;
  }
  function confier(e, a) {
    const p = M.pal[e.enMain], d = decoupe(a);
    if (!p || !C) return null;
    noterGeste(e);
    if (d.n === 1) { dire('Au sol, tu poses toi-même.', 'non'); return null; }
    if (!C.niveaux.includes(d.n)) { dire(`${ech(NOM)} ne monte pas au niveau N${d.n}.`, 'non'); return null; }
    if (occupeA(e, a)) { dire('Emplacement déjà occupé. La palette reste en main.', 'non'); return null; }
    e.confiees[p.id] = a; e.enMain = null;
    dire(`<b>${ech(p.id)}</b> confiée à ${ech(NOM)} : elle attend dans la zone « À monter ».`, 'oui');
    return `confier:${p.id}`;
  }
  // Signaler : la palette retourne en réception, marquée. Le système répond (jamais de jugement à l'écran) : la nouvelle
  // adresse si la palette en déclare une, sinon « Signalement enregistré. » ; en copie, « C’est noté. » seulement.
  function signaler(e, a, motif) {
    const p = M.pal[e.enMain];
    if (!p || !MOTIF_IDS.includes(motif)) return null;
    e.signalees[p.id] = { motif, adresse: a }; e.enMain = null; ui.signaler = false;
    noterGeste(e);
    // Chaque signalement ouvre une fenêtre que l'élève doit fermer (retours de Tristan, 21/10/2026) : la nouvelle adresse, ou un
    // accusé de réception NEUTRE (jamais « faux », jamais un point perdu). L'encart « Système » garde sa ligne courte.
    const lib = (MOTIFS.find((m) => m[0] === motif) || [])[1];
    ui.alerte = { id: p.id, nom: p.nom, motif: lib, adresse: null, copie: COPIE };
    if (COPIE) direSysteme('C’est noté.', e);
    else if (p.nouvelleAdresse) {
      e.nouvelles[p.id] = p.nouvelleAdresse; direSysteme(`Nouvelle adresse : ${p.nouvelleAdresse}.`, e);
      ui.alerte.adresse = p.nouvelleAdresse;
    }
    else direSysteme('Signalement enregistré.', e);
    dire(`<b>${ech(p.id)}</b> signalée : elle retourne en réception.`, 'oui');
    return `signaler:${p.id}`;
  }

  /* ------------------------------------------------------- adresse prise, adresse libre (lot 3) */
  // Le geste `occupe:<P>` : l'emplacement de l'adresse DONNÉE d'une palette à `adresseLibre` est ouvert de près avec cette palette en main
  // (l'élève vient d'ouvrir l'emplacement, ou d'y prendre la palette). Rend le geste à publier, ou rien.
  function occupeGeste(e) {
    const p = e.enMain && M.pal[e.enMain];
    return p && p.adresseLibre && ui.pres === p.adresse ? `occupe:${p.id}` : null;
  }
  // « Demander une adresse libre » (la palette en main). Une palette à `adresseLibre` : le système donne l'adresse libre (état `libres`,
  // geste `adresseLibre:<P>`, la carte porte « Nouvelle adresse »). Sinon : « Pas d'autre adresse », rien d'écrit, aucun geste. Dans les
  // deux cas le Terminal (ou l'encart « Système ») et la fenêtre « Message du système » le disent ; en copie aussi (c'est l'outil).
  function demanderLibre(e) {
    const p = M.pal[e.enMain];
    if (!p) return null;
    let brut, html, geste = null;
    if (p.adresseLibre) {
      noterGeste(e);
      e.libres[p.id] = p.adresseLibre; geste = `adresseLibre:${p.id}`;
      brut = `Adresse libre pour ${p.id} (${p.nom}) : ${p.adresseLibre}.`;
      html = `Adresse libre pour <b>${ech(p.id)}</b> (${ech(p.nom)}) : <b class="pe-mono">${ech(p.adresseLibre)}</b>.`;
    } else {
      const a = adresseDe(e, p);
      if (M.stock[a] || M.hs.has(a)) {
        brut = `Pas d’autre adresse pour ${p.id} (${p.nom}).`;
        html = `Pas d’autre adresse pour <b>${ech(p.id)}</b> (${ech(p.nom)}).`;
      } else {
        brut = `Pas d’autre adresse : ${a} est libre.`;
        html = `Pas d’autre adresse : <b class="pe-mono">${ech(a)}</b> est libre.`;
      }
    }
    direSysteme(brut, e);
    ui.alerte = { id: p.id, nom: p.nom, texte: html };
    dire('');
    return geste;
  }

  /* ----------------------------------------------------------------- le scan (lot 2) */
  // La phrase que le Terminal attend maintenant. Calculée de l'état à chaque dessin (elle survit à un rechargement et suit une
  // palette reprise) puis posée par `TERM.attendre`.
  function phraseScan(e, R) {
    if (R.fige) return 'Terminé.';
    if (!DEUX) return 'Scanne l’emplacement.';
    const p = e.scanAttente && M.pal[e.scanAttente];
    return p ? `${p.id} — ${p.nom}. Scanne l’emplacement.` : 'Scanne la palette.';
  }
  const terminalDit = (e, t, refus) => TERM.dire(e.terminal, t, { refus: !!refus });
  // Premier scan : l'étiquette de la palette. Une palette posée ou confiée devient « scannée, l'emplacement est attendu » ;
  // en réception ou en main : « Range d'abord la palette. » (refus sans trace). Rend le geste à publier (jamais : le geste
  // `scan:<P>` est celui du second scan).
  function scannerPalette(e, id, X) {
    if (!TERM || !DEUX || !X.ids.has(id)) return null;
    if (!X.pl[id]) { terminalDit(e, 'Range d’abord la palette.', true); return null; }
    if (e.scan[id]) { terminalDit(e, `${id} est déjà scannée.`); return null; }
    e.scanAttente = id; noterGeste(e);
    return null;
  }
  // Second scan : l'étiquette d'adresse de l'emplacement de près (`a`). Confirmé si c'est l'adresse que le système attend pour la
  // palette ET qu'elle y est posée ou confiée ; sinon refus compté en trace. En un clic (`scan: 'emplacement'`), la palette est
  // celle qui se trouve là.
  function scannerEmplacement(e, a, X) {
    if (!TERM) return null;
    let p;
    if (DEUX) {
      p = e.scanAttente && M.pal[e.scanAttente];
      if (!p) { terminalDit(e, 'Scanne d’abord la palette.', true); return null; }
    } else {
      p = X.ps.find((x) => X.pl[x.id] === a);
      if (!p) { terminalDit(e, 'Aucune palette n’est posée ici.', true); return null; }
    }
    noterGeste(e);
    if (X.pl[p.id] === a && adresseDe(e, p) === a) {
      e.scan[p.id] = a; e.scanAttente = null;
      terminalDit(e, `${a} — ${p.nom} — ${p.cartons} cartons. Confirmé.`);
      return `scan:${p.id}`;
    }
    e.scansRefuses = (e.scansRefuses || 0) + 1;
    terminalDit(e, 'Ce n’est pas l’adresse de cette palette.', true);
    return null;
  }

  /* ------------------------------------------------------------- le dessin */
  // L'état que lisent le plan et la travée de face du rangement : `place` = ce qui est physiquement dans le rack (posées,
  // montées) ; une palette qui attend Kevin ou absente pour cet élève est rangée « ailleurs », hors du plan et de la réception.
  function vueE(e, X) {
    const place = {};
    Object.values(M.pal).forEach((p) => { if (!X.ids.has(p.id)) place[p.id] = 'absente'; });
    Object.assign(place, e.posees);
    Object.entries(e.confiees).forEach(([id, a]) => { place[id] = X.montees.includes(id) ? a : 'à monter'; });
    return { place, vides: [], aideCharge: false };
  }
  const reserves = (e, X) => Object.fromEntries(Object.entries(e.confiees).filter(([id]) => !X.montees.includes(id)).map(([id, a]) => [a, id]));

  // La zone « À MONTER », au pied de chaque allée (trait de l'accent, jamais d'aplat vert) : les palettes confiées que Kevin
  // n'a pas encore montées, avec leur destination.
  function dessusAMonter(e, X, R) {
    if (!C) return '';
    const att = Object.entries(e.confiees).filter(([id]) => !X.montees.includes(id));
    let s = '';
    M.allees.forEach((al) => {
      const x = G.allees[al.id].x + 5, w = O.AW - 10, y = G.yBas - 72, h = 66;
      const ici = att.filter(([, a]) => M.cotes[decoupe(a).c].allee === al.id);
      s += `<g data-pal-amonter="${ech(al.id)}" pointer-events="none"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--panneau)" stroke="var(--ardoise)" stroke-width="2.5" stroke-dasharray="7 4"/>
        <text x="${x + w / 2}" y="${y + 15}" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--ardoise)" font-family="inherit">À MONTER</text>`;
      ici.slice(0, 2).forEach(([id, a], k) => {
        const d = decoupe(a), yy = y + 22 + k * 21;
        // Avec le scan, la place du code-barres est prise à gauche : le texte se resserre (l'adresse complète est dans la liste et le libellé).
        const rang = `<rect x="${x + 4}" y="${yy}" width="${w - 8}" height="18" rx="2" fill="none" stroke="var(--pe-carton-trait)" stroke-width="1.5" data-pal-amonter-p="${ech(id)}"/>
          <text x="${DEUX ? x + 32 : x + w / 2}" y="${yy + 13}" text-anchor="${DEUX ? 'start' : 'middle'}" font-size="${DEUX ? 9.5 : 10}" font-weight="700" fill="var(--encre)" class="pe-mono">${DEUX ? `${ech(id)} N${d.n}-E${d.e}` : `${ech(id)} T${pad2(d.t)}-N${d.n}-E${d.e}`}</text>`;
        // Deux scans : la ligne de la palette est son étiquette (code-barres dessiné à gauche), un clic la scanne.
        if (DEUX && !R.fige) {
          const B = barres(`${id} ${M.pal[id].nom}`);
          s += `<g data-pal-scan-pal="${ech(id)}" data-pe-cle="scanpalzone:${ech(id)}" role="button" tabindex="0" aria-label="Scanner la palette ${ech(id)}" pointer-events="all" style="cursor:pointer">${rang}
            <rect x="${x + 6}" y="${yy + 2}" width="22" height="14" rx="1" fill="#fbfaf6"/><svg x="${x + 7}" y="${yy + 3}" width="20" height="12" viewBox="0 0 ${B.x} 22" preserveAspectRatio="none" aria-hidden="true">${B.bars}</svg></g>`;
        } else s += rang;
      });
      if (ici.length > 2) s += `<text x="${x + w / 2}" y="${y + h - 3}" text-anchor="middle" font-size="9.5" fill="var(--encre-douce)" font-family="inherit">+ ${ici.length - 2}</text>`;
      s += '</g>';
    });
    return s;
  }

  function consigne(e, R, X) {
    const n = (k, t) => `<span class="pe-num">${k}</span>${t}`;
    if (R.compte) return consigneComptage(e, R, X, n);
    if (R.fige) return n('✓', R.copie ? 'Copie rendue.' : 'Rangement validé : il ne change plus.');
    const pm = e.enMain ? M.pal[e.enMain] : null;
    if (!pm) {
      if (X.ps.every((p) => traitee(e, X.pl, p.id))) return n('✓', 'Toutes les palettes sont traitées. Relis, puis clique <b>Valider mon rangement</b>.');
      return n(1, 'Prends une palette en réception (sa carte, en haut).');
    }
    const a = `<b class="pe-mono">${ech(adresseDe(e, pm))}</b>`;
    if (!ui.trav) return n(2, `<b>${ech(pm.id)}</b> en main, adresse ${a}. Clique sa <b>travée</b> sur le plan.`);
    if (!ui.pres) return n(3, `<b>${ech(pm.id)}</b> en main, adresse ${a}. Clique l’<b>emplacement</b> pour le voir de près.`);
    return n(4, `Vérifie l’emplacement, puis choisis : <b>poser</b>${C ? `, <b>confier à ${ech(NOM)}</b>` : ''} ou <b>signaler</b>.`);
  }
  // La barre d'adresse (comme le rangement) : elle se remplit au survol d'un emplacement, avec la consigne à droite.
  function barre(e, R, X, survol) {
    const t = ui.trav ? decoupe(`${ui.trav}-N1-E1`) : null;
    const s = survol ? decoupe(survol) : ui.pres ? decoupe(ui.pres) : null;
    const v = [t && t.c, t && `T${pad2(t.t)}`, s && `N${s.n}`, s && `E${s.e}`];
    const lib = ['allée · côté', 'travée', 'niveau', 'emplacement'];
    const prochain = v.findIndex((x) => !x);
    const cases = v.map((x, i) => `<span class="pe-case${x ? ' pe-plein' : ''}${i === prochain && (i < 2 || t) ? ' pe-attend' : ''}"><b>${x || '?'}</b><small>${lib[i]}</small></span>`)
      .join('<span class="pe-tiret">-</span>');
    return `<span class="pe-lbl">Adresse</span>${cases}<span class="pe-consigne" data-pe-consigne>${consigne(e, R, X)}</span>`;
  }

  // Après « Valider » (hors copie, si la séance le déclare) : le nom du critère faux, ou le critère et l'adresse attendue.
  function verdict(e, p, R) {
    if (!e.valide || R.copie || !M.verdict) return '';
    const F = fautesPalette(M, e, p);
    if (!F.length) return '<span class="pe-verd pe-ok" data-pal-verdict="ok">✓ bien rangée</span>';
    let t = `✗ ${F.join(', ')}`;
    if (M.verdict === 'adresse' && p.adresseLibre && F.includes('adresse')) t += ` · adresse libre à demander, puis ${p.adresseLibre}`;
    else if (M.verdict === 'adresse' && (F.includes('adresse') || F.includes('signalement'))) {
      t += p.aSignaler ? ` · à signaler${p.nouvelleAdresse ? `, puis ${p.nouvelleAdresse}` : ''}` : ` · adresse attendue : ${p.adresse}`;
    } else if (M.verdict === 'adresse' && F.includes('scan')) t += ` · adresse attendue : ${attendueScan(e, p)}`;
    return `<span class="pe-verd pe-ko" data-pal-verdict="ko">${ech(t)}</span>`;
  }
  function carte(e, p, R, X) {
    const nouvelle = e.nouvelles[p.id] || (e.libres || {})[p.id], conf = e.confiees[p.id], mont = X.montees.includes(p.id);
    // Avec le Terminal : une palette posée ou confiée est « à scanner » (jusqu'au second scan), puis « scannée ».
    const sc = TERM && (e.posees[p.id] || conf) ? (e.scan[p.id] ? ' · scannée' : R.fige ? '' : ' · à scanner') : '';
    const etat = (e.enMain === p.id ? 'en main' : e.posees[p.id] ? `posée en ${e.posees[p.id]}`
      : conf ? (mont ? `montée en ${conf}` : `à monter (${NOM})`) : e.signalees[p.id] ? 'signalée' : 'en réception') + sc;
    const cls = `pe-pal pal-carte${e.enMain === p.id ? ' pe-en-main' : ''}${e.posees[p.id] || mont ? ' pe-posee' : ''}${conf && !mont ? ' pal-confiee' : ''}`;
    const bouton = `<button type="button" class="${cls}" data-pe-pal="${ech(p.id)}" data-pe-cle="pal:${ech(p.id)}" ${R.fige ? 'disabled' : ''} aria-pressed="${e.enMain === p.id}" title="${ech(`${p.id} ${p.nom}`)}">
      <span class="pe-ttl"><span class="pe-pid">${ech(p.id)}</span> ${ech(p.nom)}</span>
      <span class="pal-etiq${nouvelle ? ' pal-nouvelle' : ''}" data-pal-etiq="${ech(p.id)}"><small>${nouvelle ? 'Nouvelle adresse' : 'Adresse'}</small> <b class="pe-mono">${ech(nouvelle || p.adresse)}</b></span>
      <span class="pal-info">${p.cartons} cartons · ${kg(p.kg)}</span>
      <span class="pal-etat" data-pal-etat="${ech(p.id)}">${ech(etat)}</span>
      <span class="pe-verd-l" data-pe-verd="${ech(p.id)}">${verdict(e, p, R)}</span></button>`;
    // Deux scans : l'étiquette de la palette (son code-barres) est un bouton à part sous la carte (la carte, elle, prend ou reprend
    // la palette : on ne peut pas imbriquer deux boutons).
    return DEUX ? `<div class="pal-cwrap">${bouton}${etiquettePalette(p, e, R, 'scanpal')}</div>` : bouton;
  }
  function bandeau(e, R, X) {
    if (R.compte) return bandeauComptage(e, R, X);
    const per = P.personnage || {};
    const txt = typeof per.texte === 'string' ? per.texte : ((per.texte || {})[R.temps] || '');
    let act;
    const attend = Object.keys(e.confiees).filter((id) => !X.montees.includes(id));
    if (R.fige) act = `<button type="button" class="btn" disabled>${R.copie ? 'Copie rendue' : 'Rangement validé'}</button>`;
    else if (ui.confirmer) {
      const reste = X.ps.filter((p) => !traitee(e, X.pl, p.id)).length;
      // Avec `monte: 'validation'`, la validation monte ce qui attend : aucun avertissement. Sinon, ces palettes ne comptent pas.
      const perdent = attend.length && C && typeof C.monte === 'function';
      act = `<span class="pe-confirme" data-pal-confirme>${perdent ? `Des palettes attendent ${ech(NOM)} : elles ne compteront pas comme rangées. Valider quand même ?` : 'Valider ?'} Tu ne pourras plus rien changer.${reste ? ` (${reste} palette${reste > 1 ? 's' : ''} encore en réception.)` : ''}
        <button type="button" class="btn btn-p" data-pal="validerOui" data-pe-cle="b:validerOui">Oui, valider</button>
        <button type="button" class="btn" data-pal="validerNon" data-pe-cle="b:validerNon">Non</button></span>`;
    } else act = '<button type="button" class="btn btn-p" data-pal="valider" data-pe-cle="b:valider">Valider mon rangement</button>';
    // « Faire monter les palettes » : actif seulement s'il y a une palette « À monter » et que rien n'est validé.
    if (C && !ui.confirmer) {
      const raison = R.fige ? 'Le rangement est validé : il ne change plus.' : !attend.length ? `Aucune palette n’attend ${NOM} : confie d’abord une palette.`
        : `${NOM} monte les palettes de la zone « À monter ».`;
      act += `<button type="button" class="btn pal-monter" data-pal="monter" data-pe-cle="b:monter" title="${ech(raison)}" ${R.fige || !attend.length ? 'disabled' : ''}>Faire monter les palettes</button>`;
    }
    const regles = reglesHtml(R);
    return `<div class="pe-bandeau pal-bandeau">
      <div class="pe-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${txt}</div>
      <div class="pe-liste"><h3>${ech(P.titreListe || 'Réception : palettes à ranger')}</h3><div class="pe-cartes">${X.ps.map((p) => carte(e, p, R, X)).join('')}</div></div>
      <div class="pe-act">${act}${regles}</div></div>`;
  }

  // « Les règles ▾ » : repliées, sauf `regles.ouvertes: true` en guidage (dépliées au chargement, jusqu'à ce que l'élève les replie).
  function reglesHtml(R) {
    const RG = P.regles;
    const reglesOuvertes = ui.regles == null ? !!(RG && RG.ouvertes) && R.temps === 'guidage' : ui.regles;
    return !R.copie && RG ? `<details class="pe-regles" data-pe-regles ${reglesOuvertes ? 'open' : ''}><summary data-pe-cle="b:regles">${ech(RG.titre || 'Les règles')} ▾</summary>
      <div class="pe-regles-corps"><b>${ech(RG.entete || 'Ranger à l’adresse donnée')}</b><ol>${(RG.lignes || []).map((l) => `<li>${l}</li>`).join('')}</ol>
      ${RG.encadre ? `<div class="pe-encadre">${RG.encadre}</div>` : ''}<div class="pal-regles-note">Clique pour refermer.</div></div></details>` : '';
  }

  /* ------------------------------------------------------------- le comptage (lot 4) : le dessin */
  const resteAcompter = (e, X) => X.liste.filter((x) => compte(e.comptage, x.rang) == null).length;
  function consigneComptage(e, R, X, n) {
    if (R.cfige) return n('✓', R.copie ? 'Copie rendue.' : 'Comptage terminé : il ne change plus.');
    const CQ = e.comptage;
    if (CQ.enCours) return n(4, 'Le Terminal te demande : <b>recompter</b> ou <b>confirmer</b> ?');
    if (CQ.scanne) return n(4, `Compte les cartons de <b class="pe-mono">${ech(CQ.scanne)}</b>, puis tape le nombre au <b>Terminal</b>.`);
    if (!resteAcompter(e, X)) return n('✓', 'Toutes les adresses de la liste sont comptées. Clique <b>Terminer le comptage</b>.');
    if (!ui.trav) return n(1, 'Lis une adresse de la liste <b>À compter</b>, puis clique sa <b>travée</b> sur le plan.');
    if (!ui.pres) return n(2, 'Clique l’<b>emplacement</b> pour le voir de près.');
    return n(3, '<b>Scanne</b> l’étiquette de l’emplacement (un clic), puis compte les cartons.');
  }
  // Le bandeau du comptage : la consigne (neutre : elle ne dit pas qu'il y a des écarts), « Terminer le comptage », les règles.
  function bandeauComptage(e, R, X) {
    const per = P.personnage || {};
    const txt = typeof per.texte === 'string' ? per.texte : ((per.texte || {})[R.temps] || '');
    let act;
    const reste = resteAcompter(e, X);
    if (R.cfige) act = `<button type="button" class="btn" disabled>${R.copie && R.rendue ? 'Copie rendue' : 'Comptage terminé'}</button>`;
    else if (ui.confirmerFin) {
      act = `<span class="pe-confirme" data-pal-confirme-fin>Il reste ${reste} adresse${reste > 1 ? 's' : ''} à compter. Terminer quand même ?
        <button type="button" class="btn btn-p" data-pal="finOui" data-pe-cle="b:finOui">Oui, terminer</button>
        <button type="button" class="btn" data-pal="finNon" data-pe-cle="b:finNon">Non</button></span>`;
    } else act = '<button type="button" class="btn btn-p" data-pal="terminer" data-pe-cle="b:terminer">Terminer le comptage</button>';
    return `<div class="pe-bandeau pal-bandeau pal-bandeau-compte">
      <div class="pe-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${txt}</div>
      <div class="pe-liste pal-compte-consigne" data-pal-compte-consigne><h3>Inventaire tournant : compte les adresses de la liste</h3>
        <p>Pour chaque adresse : ouvre l’emplacement, <b>scanne son étiquette</b>, compte les cartons de la palette, tape le nombre au <b>Terminal</b>.</p></div>
      <div class="pe-act">${act}${reglesHtml(R)}</div></div>`;
  }
  // La liste « À compter » (au-dessus du Terminal) : les adresses dans l'ordre, cochées quand comptées, JAMAIS un nombre. Après
  // « Terminer », hors copie et avec `verdict` : « ✓ » ou « ✗ compte » (« · réel : n » avec 'adresse').
  function listeAcompter(e, R, X) {
    const CQ = e.comptage;
    const verd = (x) => {
      if (!CQ.fini || R.copie || !M.verdict) return '';
      if (compte(CQ, x.rang) === x.reel) return ' <span class="pe-verd pe-ok" data-pal-cverdict="ok">✓</span>';
      return ` <span class="pe-verd pe-ko" data-pal-cverdict="ko">✗ compte${M.verdict === 'adresse' ? ` · réel : ${x.reel}` : ''}</span>`;
    };
    return `<div class="pal-acompter" data-pal-acompter><div class="pal-acompter-t">À compter</div><ol>${X.liste.map((x) => {
      const fait = compte(CQ, x.rang) != null;
      return `<li data-pal-acompter-l="${x.rang}" data-pal-fait="${fait}" aria-label="${ech(`${x.adresse}, ${x.nom} : ${fait ? 'comptée' : 'à compter'}`)}"><span class="pal-coche" aria-hidden="true">${fait ? '☑' : '☐'}</span><b class="pe-mono">${ech(x.adresse)}</b> <span class="pal-acompter-p">${ech((M.produits[x.produit] || {}).court || x.nom)}</span>${verd(x)}</li>`;
    }).join('')}</ol></div>`;
  }
  // L'étiquette d'un emplacement au comptage : un bouton au sol (un clic la scanne), une simple étiquette au-dessus du sol.
  function etiquetteComptage(a, R) {
    if (decoupe(a).n !== 1) return `<div class="pal-etiq-emp" data-pal-etiq-emp="${ech(a)}"><b class="pe-mono">${ech(a)}</b>${codeSvg(a, 'pal-code')}</div>`;
    return `<button type="button" class="pal-etiq-emp pal-scannable" data-pal-etiq-emp="${ech(a)}" data-pal-compte-emp="${ech(a)}" data-pe-cle="scancompte" aria-label="Scanner l’emplacement ${ech(a)}" ${R.cfige ? 'disabled' : ''}>
      <span class="pal-etiq-l1"><b class="pe-mono">${ech(a)}</b><small class="pal-scan-lib">Scanner</small></span>${codeSvg(a, 'pal-code')}</button>`;
  }
  // LA VUE DE PRÈS au comptage : l'étiquette, le niveau, ce qui est là (le produit, jamais un poids), la palette dessinée en
  // perspective (au sol) et, avec `aideCouche`, les cartons d'une couche (jamais le total). Ni plaque, ni capteur.
  function presComptage(e, R) {
    const a = ui.pres;
    const msg = `<div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pal-msg role="status">${ui.msg}</div>`;
    if (!a) return `<div class="pal-pres pal-pres-vide" data-pal-pres="">Clique un <b>emplacement</b> de la travée : tu le vois de près ici.${msg}</div>`;
    const d = decoupe(a), q = aCompter(M, e, a), st = M.stock[a];
    const occ = M.hs.has(a) ? ['hs', 'Emplacement hors service'] : q ? ['stock', q.nom]
      : st ? ['stock', (M.produits[st.produit] || {}).nom || st.produit] : ['libre', 'Libre'];
    let h = etiquetteComptage(a, R);
    h += `<div class="pal-niv"><span>Niveau <b>N${d.n}</b> · ${d.n === 1 ? 'le sol (picking)' : 'réserve, au-dessus du sol'}</span>
      <span class="pal-occ pal-occ-${occ[0]}" data-pal-occ="${occ[0]}">${ech(occ[1])}</span></div>`;
    if (d.n > 1) h += '<div class="pal-sol">Au-dessus du sol : on ne compte pas d’ici.</div>';
    else if (q) {
      const [W, D] = q.couche;
      if (M.comptage.aideCouche) h += `<div class="pal-couche" data-pal-couche>${W} × ${D} = ${W * D} par couche</div>`;
      h += `<div class="pal-compte-pile" data-pal-pile="${ech(a)}">${O.pile([W, D, q.couches], q.reel - W * D * q.couches, `Palette de cartons : ${q.nom}`)}</div>`;
    }
    return `<div class="pal-pres pal-pres-compte" data-pal-pres="${ech(a)}">${h}${msg}</div>`;
  }
  // La colonne de droite au comptage : la liste, le Terminal, la légende, les attendus de l'enseignant.
  function coteComptage(e, R, X) {
    let h = listeAcompter(e, R, X);
    h += `<div class="pal-term" data-pal-term>${TERM.html(e.terminal)}</div>`;
    if (!ui.trav) h += `<div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pal-msg role="status">${ui.msg}</div>`;
    h += `<div class="pe-legende"><span><i class="pe-puce pe-p-stock"></i>occupé</span><span><i class="pe-puce pe-p-hs"></i>hors service</span><span><i class="pe-puce"></i>libre</span></div>`;
    if (R.prof) {
      const CQ = e.comptage;
      h += `<details class="pe-prof"><summary>Côté enseignant : attendus du comptage</summary>${M.comptage.adresses.map((x) => `<div><b>n° ${x.rang}</b> <span class="pe-mono">${ech(x.adresse)}</span> : réel ${x.reel}, système ${x.systeme}${x.reel < x.systeme ? ' (manque)' : x.reel > x.systeme ? ' (surplus)' : ''}${x.bonus ? ' (confirmé)' : ''}</div>`).join('')}
        <div data-pal-trace>Hors liste (trace, non notée) : ${CQ.horsListe.length ? CQ.horsListe.map((t) => `${ech(t.adresse)} ${t.compte}`).join(' · ') : 'aucun'} · tapés sans scan : ${CQ.sansScan || 0}</div></details>`;
    }
    return `<aside class="pal-cote">${h}</aside>`;
  }

  // Un code à barres décoratif tiré d'un texte (adresse, identifiant de palette) : { bars, x } pour un `viewBox="0 0 x 22"`.
  function barres(texte) {
    let x = 0, bars = '';
    [...texte].forEach((ch, i) => {
      const c = ch.charCodeAt(0);
      [1 + (c % 3), 1 + ((c >> 2) % 2), 2 + ((c + i) % 2)].forEach((w, k) => { if (k !== 1) bars += `<rect x="${x}" y="0" width="${w}" height="22" fill="#1a1915"/>`; x += w + 1; });
    });
    return { bars, x };
  }
  const codeSvg = (texte, cls) => { const B = barres(texte); return `<svg class="${cls}" viewBox="0 0 ${B.x} 22" preserveAspectRatio="none" aria-hidden="true">${B.bars}</svg>`; };
  // Une étiquette d'emplacement, comme sur la lisse (code à barres décoratif tiré de l'adresse). Avec `terminal`, c'est un bouton :
  // un clic la scanne (`scan` d'un emplacement ; après « Valider », elle ne se clique plus).
  function etiquette(a, R) {
    if (!TERM) return `<div class="pal-etiq-emp" data-pal-etiq-emp="${ech(a)}"><b class="pe-mono">${ech(a)}</b>${codeSvg(a, 'pal-code')}</div>`;
    return `<button type="button" class="pal-etiq-emp pal-scannable" data-pal-etiq-emp="${ech(a)}" data-pal-scan-emp="${ech(a)}" data-pe-cle="scanemp" aria-label="Scanner l’emplacement ${ech(a)}" ${R.fige ? 'disabled' : ''}>
      <span class="pal-etiq-l1"><b class="pe-mono">${ech(a)}</b><small class="pal-scan-lib">Scanner</small></span>${codeSvg(a, 'pal-code')}</button>`;
  }
  // L'étiquette d'une palette (scan de la palette) : bouton « code-barres + Scanner », sous sa carte ou dans la vue de près.
  const etiquettePalette = (p, e, R, cle, texte) => `<button type="button" class="pal-scan${e.scanAttente === p.id ? ' pal-scan-att' : ''}" data-pal-scan-pal="${ech(p.id)}" data-pe-cle="${cle}:${ech(p.id)}"
      aria-label="Scanner la palette ${ech(p.id)}" aria-pressed="${e.scanAttente === p.id}" ${R.fige ? 'disabled' : ''}>${codeSvg(`${p.id} ${p.nom}`, 'pal-code pal-code-p')}<span>${texte || 'Scanner'}</span></button>`;
  // LA VUE DE PRÈS d'un emplacement : son étiquette, le niveau, ce qui l'occupe, la plaque (jamais au sol), le « déjà posé »
  // et la somme selon `aideCharge`, la palette en main, les trois boutons (les mêmes à tous les niveaux) ou les motifs.
  function pres(e, R, X) {
    const a = ui.pres;
    const msg = `<div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pal-msg role="status">${ui.msg}</div>`;
    if (!a) return `<div class="pal-pres pal-pres-vide" data-pal-pres="">Clique un <b>emplacement</b> de la travée : tu le vois de près ici.${msg}</div>`;
    const d = decoupe(a), cote = M.cotes[d.c], plaque = d.n > 1 ? cote.charge[d.n] : null;
    const st = M.stock[a], aMoi = Object.keys(X.pl).find((id) => X.pl[id] === a && !(e.confiees[id] && !X.montees.includes(id)));
    const res = reserves(e, X)[a];
    const poids = M.aide !== 'plaque';
    const occ = M.hs.has(a) ? ['hs', 'Emplacement hors service']
      : st ? ['stock', `Occupé : ${(M.produits[st.produit] || {}).nom || st.produit}${poids ? ` · ${kg(st.kg)}` : ''}`]
      : aMoi ? ['eleve', `Occupé : ta palette ${aMoi}${poids ? ` · ${kg(M.pal[aMoi].kg)}` : ''}`]
      : res ? ['reserve', `Réservé : ${res}, à monter (${NOM})`] : ['libre', 'Libre'];
    const pm = e.enMain ? M.pal[e.enMain] : null;
    let h = etiquette(a, R);
    h += `<div class="pal-niv"><span>Niveau <b>N${d.n}</b> · ${d.n === 1 ? 'le sol (picking)' : 'réserve, au-dessus du sol'}</span>
      <span class="pal-occ pal-occ-${occ[0]}" data-pal-occ="${occ[0]}">${ech(occ[1])}</span></div>`;
    // La palette posée ici (ou montée ici par le cariste) porte son étiquette : un clic la scanne (deux scans).
    if (DEUX && aMoi) h += `<div class="pal-ta-pal" data-pal-ta-pal="${ech(aMoi)}">${etiquettePalette(M.pal[aMoi], e, R, 'scanpalpres', `Scanner ${ech(aMoi)} · ${ech(M.pal[aMoi].nom)}`)}</div>`;
    if (plaque) {
      let charge = `<div class="pal-plaque" data-pal-plaque>Charge max <b>${kg(plaque)}</b> par niveau</div>`;
      if (poids) {
        const deja = M.chargeNiveau(X.pl, d, null);
        charge += `<div class="pal-capteur" data-pal-capteur role="img" aria-label="Déjà posé sur le niveau N${d.n} : ${kg(deja)}">
          <span class="pal-capteur-t">CHARGE N${d.n}</span><span class="pal-capteur-v"><small>kg</small><b data-pal-deja>${nb(deja)}</b></span><span class="pal-capteur-b">déjà posé</span></div>`;
        if (M.aide === 'somme' && pm) charge += `<div class="pal-somme" data-pal-somme>Avec ta palette <b>${ech(pm.id)}</b> : ${nb(deja)} + ${nb(pm.kg)} = <b>${kg(deja + pm.kg)}</b></div>`;
      }
      h += `<div class="pal-charge">${charge}</div>`;
    } else h += '<div class="pal-sol">Au sol : pas de plaque de charge.</div>';
    if (R.fige) return `<div class="pal-pres" data-pal-pres="${ech(a)}">${h}${msg}</div>`;
    // Pendant le choix du motif, la ligne « En main » cède sa place aux motifs (la carte dit déjà quelle palette est en main).
    if (!(pm && ui.signaler)) h += `<div class="pal-main" data-pal-main>${pm ? `En main : <b title="${ech(pm.nom)}">${ech(pm.id)}</b> (${kg(pm.kg)}), adresse <b class="pe-mono">${ech(adresseDe(e, pm))}</b>`
      : 'Aucune palette en main : prends-en une en réception (en haut).'}</div>`;
    if (pm && ui.signaler) {
      h += `<fieldset class="pal-motifs" data-pal-motifs><legend>On ne peut pas ranger ici : pourquoi ?</legend>
        ${MOTIFS.map(([k, lib]) => `<button type="button" class="btn" data-pal-motif="${k}" data-pe-cle="motif:${k}">${ech(lib)}</button>`).join('')}
        <button type="button" class="btn pal-annuler" data-pal="signalerNon" data-pe-cle="b:signalerNon">Annuler</button></fieldset>`;
    } else if (pm) {
      h += `<div class="pal-boutons">
        <button type="button" class="btn btn-p" data-pal="poser" data-pe-cle="b:poser">Poser ici</button>
        ${C ? `<button type="button" class="btn" data-pal="confier" data-pe-cle="b:confier">Confier à ${ech(NOM)}</button>` : ''}
        ${M.aLibre && (st || aMoi || res) ? '<button type="button" class="btn pal-libre" data-pal="libre" data-pe-cle="b:libre">Demander une adresse libre</button>' : ''}
        <button type="button" class="btn pal-signaler" data-pal="signaler" data-pe-cle="b:signaler">Signaler : on ne peut pas ranger ici</button></div>`;
    }
    return `<div class="pal-pres" data-pal-pres="${ech(a)}">${h}${msg}</div>`;
  }

  function cote(e, R, X, api) {
    if (R.compte) return coteComptage(e, R, X);
    // Journal vide (après un rechargement) : ce que l'état sait encore, les nouvelles adresses et la demande faite à Kevin.
    const attend = C && typeof C.monte === 'function' && e.monterDemande && Object.keys(e.confiees).some((id) => !X.montees.includes(id));
    const L = ui.journal.length ? ui.journal : [...Object.entries(e.nouvelles).map(([id, a]) => `${id} : nouvelle adresse ${a}.`),
      ...Object.entries(e.libres || {}).map(([id, a]) => `${id} : adresse libre ${a}.`),
      ...(attend ? [`Demande envoyée à ${NOM}.`] : [])];
    // Avec `terminal`, le Terminal prend la place de l'encart « Système » (ses lignes sont dans son journal).
    let h = TERM ? `<div class="pal-term" data-pal-term>${TERM.html(e.terminal)}</div>`
      : `<div class="pal-systeme" data-pal-systeme><div class="pal-systeme-t">Système</div>
      <div class="pal-systeme-e" aria-live="polite">${L.length ? L.map((l, i) => `<div class="${i === L.length - 1 ? 'pal-sys-actu' : 'pal-sys-passe'}">${ech(l)}</div>`).join('') : '<span class="pal-sys-vide">—</span>'}</div></div>`;
    if (!ui.trav) h += `<div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pal-msg role="status">${ui.msg}</div>`;
    if (C) {
      const att = Object.entries(e.confiees).filter(([id]) => !X.montees.includes(id));
      h += `<div class="pal-liste-amonter" data-pal-amonter-liste><span class="pe-t">À monter (${ech(NOM)}) :</span>${att.length
        ? att.map(([id, a]) => `<span><b>${ech(id)}</b> → <span class="pe-mono">${ech(a)}</span></span>`).join('') : ' aucune'}</div>`;
    }
    h += `<div class="pe-legende"><span><i class="pe-puce pe-p-stock"></i>occupé</span><span><i class="pe-puce pe-p-eleve"></i>ta palette</span>
      <span><i class="pe-puce pal-p-reserve"></i>à monter</span><span><i class="pe-puce pe-p-hs"></i>hors service</span><span><i class="pe-puce"></i>libre</span></div>`;
    if (R.prof) {
      const A = attendusPalettier(M);
      h += `<details class="pe-prof"><summary>Côté enseignant : attendus</summary>${Object.entries(A).map(([id, x]) => `<div><b>${ech(id)}</b> : ${x.signaler
        ? `signaler (${ech(x.signaler.join(', ') || '—')})${x.puis ? `, puis <span class="pe-mono">${ech(x.puis)}</span>` : ''}`
        : `${x.geste === 'poser' ? 'poser' : `confier à ${ech(NOM)}`} en <span class="pe-mono">${ech(x.adresse)}</span>`}${x.scan ? `, puis scanner (<span class="pe-mono">${ech(x.scan)}</span>)` : ''}${x.niveaux ? ' (confirmé)' : ''}</div>`).join('')}${TERM ? `<div data-pal-scans-refuses>Scans refusés (trace, non notée) : ${e.scansRefuses || 0}</div>` : ''}</details>`;
    }
    return `<aside class="pal-cote">${h}</aside>`;
  }

  function html(e, api) {
    normaliser(e);
    const R = regime(api, e);
    const X = calcul(e, R, api);
    if (e.enMain && (!X.ids.has(e.enMain) || X.pl[e.enMain])) e.enMain = null;
    if (R.fige) { ui.confirmer = false; ui.signaler = false; ui.alerte = null; }
    if (TERM && R.compte) {
      // Le comptage : le champ à chiffres est ouvert tant que rien n'est figé ni en attente de « Recompter / Confirmer ».
      const CQ = e.comptage;
      if (R.cfige) ui.confirmerFin = false;
      TERM.attendre(e.terminal, phraseComptage(M, e, R.cfige), { saisie: !R.cfige && !CQ.enCours,
        choix: !R.cfige && CQ.enCours ? [['recompter', 'Recompter'], ['confirmer', 'Confirmer']] : null });
    } else if (TERM) {
      if (e.scanAttente && !X.pl[e.scanAttente]) e.scanAttente = null;
      TERM.attendre(e.terminal, phraseScan(e, R));
    }
    ui.main = e.enMain;
    const VE = vueE(e, X);
    let espace;
    if (!ui.trav) {
      espace = `<div class="pe-plan">${O.htmlPlan(VE, { bandes: false, parcours: false, eval: false, aideCharge: false, g: false },
        { dessus: R.compte ? '' : dessusAMonter(e, X, R), aria: 'Plan de l’entrepôt : clique une travée pour l’ouvrir' })}</div>`;
    } else {
      const c = M.cotes[ui.trav.split('-')[0]];
      // Au comptage, la travée de face n'écrit ni poids ni plaque, et n'a pas de capteur : un poids donnerait le nombre de cartons.
      const RF = R.compte ? { aideCharge: false, eval: false, sansPoids: true, sansPlaque: true, reserves: {}, choisi: ui.pres }
        : { aideCharge: false, eval: false, sansPoids: M.aide === 'plaque', reserves: reserves(e, X), choisi: ui.pres };
      espace = `<div class="pe-entete"><div class="pe-fil pal-fil">Plan › <b>Travée</b> <span class="pe-mono">${ech(ui.trav)}</span> <span class="pe-petit">(vue depuis l’allée ${ech(c.allee)})</span></div>
          <button type="button" class="btn btn-p pe-retour" data-pal="retour" data-pe-cle="b:retour">← Retour au plan</button></div>
        <div class="pal-partage"><div class="pe-face">${O.htmlFace(VE, RF)}</div><div class="pal-pres-zone">${R.compte ? presComptage(e, R) : pres(e, R, X)}</div></div>`;
    }
    return `<div class="pe pal${DEUX && !R.compte ? ' pal-deux' : ''}${R.compte ? ' pal-compte' : ''}" data-entrepot="${ech(P.id)}" data-pe-mode="palettier" data-pe-phase="${R.compte ? 'comptage' : 'rangement'}" data-pe-temps="${R.temps}" data-pal-valide="${!!e.valide}" data-pal-fini="${!!R.cfige}" data-pe-ouverte="${!!ui.trav}">
      <div class="pe-adresse" data-pe-adresse>${barre(e, R, X, null)}</div>
      ${bandeau(e, R, X)}
      <div class="pal-jeu"><section class="pe-espace">${espace}</section>${cote(e, R, X, api)}</div>${fenetre()}</div>`;
  }
  // La fenêtre « Message du système » : au signalement d'une palette qui reçoit une nouvelle adresse, l'élève doit la fermer.
  function fenetre() {
    const A = ui.alerte;
    if (!A) return '';
    const qui = `<b>${ech(A.id)}</b> (${ech(A.nom)})`;
    const texte = A.texte ? A.texte : A.adresse ? `Nouvelle adresse pour ${qui} : <b class="pe-mono">${ech(A.adresse)}</b>.`
      : A.copie ? `Signalement enregistré pour ${qui} : « ${ech(A.motif)} ». C’est noté.`
        : `Signalement enregistré pour ${qui} : « ${ech(A.motif)} ». Le système ne donne pas d’autre adresse : la palette retourne en réception.`;
    return `<div class="pal-modal-voile" data-pal-modal><div class="pal-modal" role="dialog" aria-modal="true" aria-labelledby="palModalT" aria-describedby="palModalD">
      <h3 id="palModalT">Message du système</h3>
      <p id="palModalD" data-pal-modal-texte>${texte}</p>
      <button type="button" class="btn btn-p" data-pal-modal-ok>Compris</button></div></div>`;
  }

  function brancher(z, e, api) {
    const racine = z.querySelector('.pal');
    if (!racine) return;
    normaliser(e);
    const R = regime(api, e);
    const X = calcul(e, R, api);
    const redessiner = () => api.redessiner();
    const FIGE = R.compte ? R.cfige : R.fige;   // au comptage, c'est « Terminer le comptage » qui fige
    const sig = (n) => { if (n && api.signal && !FIGE) api.signal(geste(n)); };
    const fait = (n) => { sig(n); api.sauver(); redessiner(); };
    const activer = (el, fn) => {
      el.addEventListener('click', fn);
      if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
    };
    const on = (cle, fn) => racine.querySelectorAll(`[data-pal="${cle}"]`).forEach((b) => activer(b, fn));
    // La fenêtre du système se ferme : le focus revient sur la carte de la palette, à la souris comme au clavier.
    const fermerAlerte = () => {
      ui.focus = `pal:${ui.alerte.id}`; ui.focusForce = true; ui.alerte = null; redessiner();
    };
    // Échap : la fenêtre du système, puis les motifs, puis la vue de près, puis la travée.
    const fermer = () => {
      if (ui.alerte) { fermerAlerte(); return true; }
      const volet = racine.querySelector('[data-pe-regles][open]');
      if (volet) { volet.open = false; ui.regles = false; return true; }
      if (ui.signaler) { ui.signaler = false; ui.focus = 'b:signaler'; }
      else if (ui.pres) { ui.focus = `emp:${ui.pres}`; ui.pres = null; }
      else if (ui.trav) { ui.focus = `trav:${ui.trav}`; ui.trav = null; }
      else return false;
      dire(''); redessiner(); return true;
    };
    O.echap(racine, fermer);
    // La hauteur d'écran qui reste sous le bandeau : le plan, la travée et la vue de près y tiennent sans défiler.
    const espace = racine.querySelector('.pe-espace');
    const caler = () => {
      if (!espace.isConnected) { window.removeEventListener('resize', caler); return; }
      const haut = espace.getBoundingClientRect().top + window.scrollY;
      const entete = racine.querySelector('.pe-entete');
      const reste = window.innerHeight - haut - 22 - (entete ? entete.offsetHeight + 6 : 0), min = entete ? 340 : 380;
      racine.style.setProperty('--pe-dispo', `${Math.max(min, Math.round(reste))}px`);
    };
    caler();
    window.addEventListener('resize', caler);
    racine.addEventListener('focusin', (ev) => { const t = ev.target.closest && ev.target.closest('[data-pe-cle]'); if (t) ui.focus = t.dataset.peCle; });
    // La fenêtre est ouverte : rien d'autre n'est branché (aucun geste derrière), tout le reste est inerte, le focus reste dedans.
    const fenetreEl = racine.querySelector('[data-pal-modal]');
    if (fenetreEl) {
      [...racine.children].forEach((c) => { if (c !== fenetreEl) c.setAttribute('inert', ''); });
      const ok = fenetreEl.querySelector('[data-pal-modal-ok]');
      ok.addEventListener('click', fermerAlerte);
      fenetreEl.addEventListener('keydown', (ev) => { if (ev.key === 'Tab') { ev.preventDefault(); ok.focus(); } });
      ok.focus({ preventScroll: true });
      return;
    }
    const det = racine.querySelector('[data-pe-regles]');
    if (det) {
      det.addEventListener('toggle', () => { ui.regles = det.open; });
      // Le volet flotte au-dessus du haut de la travée, du bouton « Retour au plan » et du Terminal et RECOUVRE leurs clics (rien ne
      // se déclenche sous un texte qu'on lit) : un clic sur le volet le referme sans rien faire d'autre ; le premier geste ailleurs que
      // sur son bouton le replie et agit normalement. Le repli est enregistré tout de suite, sinon le dessin suivant le rouvrirait d'office.
      const replier = (ev) => { if (det.open && !det.contains(ev.target)) { det.open = false; ui.regles = false; } };
      racine.addEventListener('pointerdown', replier, true);
      const corps = det.querySelector('.pe-regles-corps');
      if (corps) corps.addEventListener('click', () => { det.open = false; ui.regles = false; });
      racine.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') replier(ev); }, true);
    }
    if ((O.clavier() || ui.focusForce) && ui.focus) {
      const el = racine.querySelector(`[data-pe-cle="${CSS.escape(ui.focus)}"]`);
      if (el) el.focus({ preventScroll: true });
    }
    ui.focusForce = false;
    on('retour', () => { ui.focus = ui.trav ? `trav:${ui.trav}` : null; ui.pres = null; ui.trav = null; ui.signaler = false; dire(''); redessiner(); });
    // Regarder reste permis après « Valider » (ouvrir une travée, un emplacement) ; aucun geste n'est plus publié.
    racine.querySelectorAll('[data-pe-trav]').forEach((g) => activer(g, () => {
      ui.trav = g.dataset.peTrav; ui.pres = null; ui.anim = true; ui.signaler = false; dire('');
      ui.focus = `emp:${ui.trav}-N1-E1`;
      redessiner();
    }));
    const barreEl = racine.querySelector('[data-pe-adresse]');
    racine.querySelectorAll('[data-pe-emp]').forEach((g) => {
      activer(g, () => {
        ui.pres = g.dataset.peEmp; ui.signaler = false; dire('');
        ui.focus = e.enMain && !R.fige ? 'b:poser' : `emp:${ui.pres}`;
        sig(occupeGeste(e));   // lot 3 : l'adresse donnée d'une palette à `adresseLibre`, ouverte avec elle en main
        fait('ouvrir');
      });
      const sur = () => { barreEl.innerHTML = barre(e, R, X, g.dataset.peEmp); };
      const hors = () => { barreEl.innerHTML = barre(e, R, X, null); };
      g.addEventListener('mouseenter', sur); g.addEventListener('focus', sur);
      g.addEventListener('mouseleave', hors); g.addEventListener('blur', hors);
    });
    if (R.compte) { brancherComptage(racine, e, api, R, { on, activer, fait, sig, redessiner }); return; }
    if (R.fige) return;
    racine.querySelectorAll('[data-pe-pal]').forEach((b) => activer(b, () => {
      const g = prendre(e, b.dataset.pePal, X);
      if (g) sig(occupeGeste(e));   // lot 3 : prendre la palette alors que l'emplacement de son adresse donnée est déjà ouvert
      fait(g);
    }));
    // Le scan (lot 2) : l'étiquette d'une palette (carte, vue de près, zone « À monter »), puis celle de l'emplacement de près.
    racine.querySelectorAll('[data-pal-scan-pal]').forEach((b) => activer(b, () => {
      ui.focus = b.dataset.peCle; fait(scannerPalette(e, b.dataset.palScanPal, X));
    }));
    racine.querySelectorAll('[data-pal-scan-emp]').forEach((b) => activer(b, () => {
      ui.focus = b.dataset.peCle; fait(scannerEmplacement(e, b.dataset.palScanEmp, X));
    }));
    on('poser', () => { const n = poserIci(e, ui.pres); ui.focus = n ? `emp:${ui.pres}` : 'b:poser'; fait(n); });
    on('confier', () => { const n = confier(e, ui.pres); ui.focus = n ? `emp:${ui.pres}` : 'b:confier'; fait(n); });
    on('libre', () => { ui.focus = 'b:libre'; fait(demanderLibre(e)); });
    on('signaler', () => { ui.signaler = true; dire(''); ui.focus = `motif:${MOTIF_IDS[0]}`; redessiner(); });
    on('signalerNon', () => { ui.signaler = false; ui.focus = 'b:signaler'; redessiner(); });
    racine.querySelectorAll('[data-pal-motif]').forEach((b) => activer(b, () => { const n = signaler(e, ui.pres, b.dataset.palMotif); ui.focus = `emp:${ui.pres}`; fait(n); }));
    // Faire monter : sans fonction `monte`, Kevin monte tout de suite ce qui attend ; avec `monte(db)`, la demande part et les
    // palettes montent quand la base le dit. Dans les deux cas, le geste `monter` est publié.
    on('monter', () => {
      const att = Object.keys(e.confiees).filter((id) => !X.montees.includes(id));
      if (!att.length || !C) return;
      noterGeste(e); e.monterDemande = true;
      if (typeof C.monte === 'function') { direSysteme(`Demande envoyée à ${NOM}.`, e); ui.focus = 'b:monter'; }
      else {
        e.monteesIds = [...new Set([...(Array.isArray(e.monteesIds) ? e.monteesIds : []), ...att])];
        dire(`${ech(NOM)} a monté ${att.map((id) => `<b>${ech(id)}</b>`).join(', ')}.`, 'oui');
        ui.focus = 'b:valider';
      }
      fait('monter');
    });
    on('valider', () => { ui.confirmer = true; ui.focus = 'b:validerOui'; redessiner(); });
    on('validerNon', () => { ui.confirmer = false; ui.focus = 'b:valider'; redessiner(); });
    on('validerOui', () => {
      ui.confirmer = false; ui.signaler = false; ui.pres = null; ui.trav = null;
      e.enMain = null; e.valide = true; e.at = Date.now(); noterGeste(e);
      e.monteesValidation = montees(M, e, api.db);   // ce que Kevin a monté À CE MOMENT : le reste n'est pas rangé
      sig('valider'); api.sauver();
      // Avec un comptage après le rangement (ENT-8.14), c'est « Terminer le comptage » qui rend la copie.
      if (COPIE && api.rendreCopie && !M.comptage) api.rendreCopie();
      // Tout l'écran, menu compris : un message qui attend le geste `valider` (Kevin, ENT-8.11) arrive tout de suite.
      if (api.redessinerTout) api.redessinerTout(); else redessiner();
    });
  }

  // LE COMPTAGE (lot 4) : le Terminal (champ à chiffres, « Recompter » / « Confirmer »), l'étiquette d'un emplacement au sol (le
  // scan), « Terminer le comptage ». Après « Terminer », regarder reste permis ; plus rien ne se compte.
  function brancherComptage(racine, e, api, R, B) {
    const niveau = R.niveau;
    const termEl = racine.querySelector('[data-pal-term]');
    if (termEl) {
      TERM.brancher(termEl, e.terminal, {
        focus: ui.focusTerm,
        saisir: (v) => { ui.focusTerm = true; noterGeste(e); B.fait(saisirComptage(M, e, v, niveau)); },
        choisir: (k) => { ui.focusTerm = true; B.fait(choisirComptage(M, e, k)); },
      });
    }
    ui.focusTerm = false;
    if (R.cfige) return;
    racine.querySelectorAll('[data-pal-compte-emp]').forEach((b) => B.activer(b, () => {
      const g = scannerComptage(M, e, b.dataset.palCompteEmp);
      if (g) { noterGeste(e); ui.focusTerm = true; } else ui.focus = b.dataset.peCle;
      B.fait(g);
    }));
    const terminer = () => {
      ui.confirmerFin = false; noterGeste(e);
      B.sig(terminerComptage(e)); api.sauver();
      if (COPIE && api.rendreCopie) api.rendreCopie();
      // Tout l'écran, menu compris : un message qui attend `compte:fin` (Samia, ENT-8.12) arrive tout de suite.
      if (api.redessinerTout) api.redessinerTout(); else B.redessiner();
    };
    B.on('terminer', () => {
      if (!resteAcompter(e, calcul(e, R, api))) { terminer(); return; }
      ui.confirmerFin = true; ui.focus = 'b:finOui'; B.redessiner();
    });
    B.on('finNon', () => { ui.confirmerFin = false; ui.focus = 'b:terminer'; B.redessiner(); });
    B.on('finOui', terminer);
  }

  return {
    signaux, id: P.id,
    nav: { libelle: P.libelle || "Plan de l'entrepôt" },
    etatNeuf: etatPalettierNeuf,
    // La calculette du site quand l'élève fait lui-même « déjà posé + sa palette » (aide `pose`), comme le rangement hors guidage.
    calculette: () => M.aide === 'pose',
    // Ce que lisent les tests et la page d'essai.
    lire: () => ({ trav: ui.trav, pres: ui.pres, msg: ui.msg, signaler: ui.signaler, journal: ui.journal.slice() }),
    html, brancher,
  };
}
