> *Copie du 02/10/2026 de la fiche `claude/prepalog-inventaire-format.md` du projet Claude
> PREPALOG (source de conception : le projet). Voir `docs/LISEZMOI.md`. Les renvois au tableau des
> chantiers (`prepalog-chantiers-en-cours.md`) pointent vers une fiche restée dans le projet : une
> demande au moteur s'inscrit désormais dans la section « Demandes au moteur » du brief de la
> séance (`docs/briefs/MODELE.md`).*

# Prepalog — format des données de l'inventaire et du catalogue simple (chantier E, 02/10/2026)

> **État : livré le 02/10/2026 au soir (chantier E)**, testé (bloc `inventaire`, 33 cas ; suite
> entière 223/223). Exemple complet et page d'essai : `outils/essai-inventaire.js` et
> `outils/essai-inventaire.html` (entreprise fictive LogiDémo).

**À lire par toute conversation qui écrit une séance d'inventaire** (Cdiscount ENT-2.2 et ENT-2.4 en
premier, chantier D) **ou un catalogue d'articles sans couleur ni taille.** Ce format est **fixé** :
le chantier E (écran « Inventaire ») le construit tel quel. Une séance qui a besoin d'autre chose
l'inscrit dans les « demandes au moteur » ; elle n'invente pas son propre format.

Choix de Tristan derrière ce format (02/10) : comptage à l'aveugle ; écarts calculés par l'écran
(guidage) ou par l'élève (entraînement, évaluation) ; motif obligatoire ; relevé envoyé par la
messagerie **ou** comptage physique ; correction affichée réglable par séance ; l'enquête se fait
dans les vrais mouvements (affichés dans l'écran) et dans la messagerie ; pendant le comptage à
l'aveugle, l'écran Stock et `.getstock` sont bloqués ; le catalogue s'ouvre aux articles simples.

## 1. Le catalogue simple (articles sans couleur ni taille)

Jusqu'ici le catalogue ne connaissait que la chaussure (référence « modèle-couleur-taille »). Une
entreprise comme Cdiscount déclare ses articles ainsi, dans `contenus/<entreprise>.js` :

```js
import { catalogueSimple } from './entreprise-commun.js';   // à côté de buildCatalog

export const CATALOGUE = catalogueSimple([
  { ref: 'CAB-USBC-1M',            // référence article = SKU (majuscules, chiffres, tirets)
    designation: 'Câble USB-C vers USB-C, 1 m',
    marque: '',                    // facultatif ; affiché devant la désignation s'il existe
    categorie: 'Câbles',
    prix: 9.99,                    // prix de vente TTC
    cout: 4.90,                    // prix d'achat HT — c'est lui qui VALORISE le stock et les écarts
    emplacement: 'A-01-1',
    stock: 64,                     // stock de départ (qty0) ; `baseDeDepart` le pose dans db.stock
    min: 10, max: 80,              // seuil d'alerte et stock maximum
    fournisseur: 'F001',           // identifiant d'un fournisseur de SUPPLIERS
    description: '' },             // facultatif
]);
// → { MODELS, MM, VARIANTS, VM, simple: true } : même forme que buildCatalog, sku = ref.
```

Pour un catalogue simple, l'environnement n'affiche ni colonne Couleur ni colonne Taille (Stock,
Catalogue, Commandes, Réceptions, console). `VOCAB.sizeLabel` / `sizeShort` / `configWord` ne servent
plus ; `VOCAB.unit` / `unitPl` restent (« article » / « articles », par exemple).

## 2. L'inventaire déclaré par la séance (`inventaire` dans `creerEntreprise`)

L'entrée « Inventaire » n'apparaît dans le menu (section Articles) **que si** la séance la déclare.

```js
creerEntreprise({ …, inventaire: {
  id: 'INV-2026-41',             // numéro de campagne : clé de l'état élève, écrit dans les Mouvements
  libelle: 'Inventaire',         // entrée de menu (défaut « Inventaire »)
  titre: 'Inventaire tournant — allée A',
  sousTitre: 'Comptage du vendredi 9 octobre · 8 emplacements',   // facultatif
  source: 'releve',              // 'releve' : quantités fournies par la séance (relevé par la
                                 //   messagerie) — une saisie différente du relevé est refusée ;
                                 // 'physique' : l'élève saisit ce qu'il a compté, rien n'est imposé
  aveugle: true,                 // stock système caché à la saisie + Stock et .getstock bloqués
                                 //   jusqu'à la validation du comptage (défaut true)
  ecarts: 'ecran',               // 'ecran' (guidage) ou 'eleve' : qui calcule les écarts, leur
                                 //   valeur et le taux d'écart (défaut 'eleve')
  correction: 'detaillee',       // 'detaillee' : juste / à revoir + explication ; 'verdict' :
                                 //   juste / à revoir seul ; 'aucune' (évaluation) (défaut 'verdict')
  motifObligatoire: true,        // défaut true
  motifs: ['Casse', 'Erreur de prélèvement', 'Erreur de réception', 'Démarque inconnue', 'Autre'],
                                 // facultatif : c'est la liste par défaut
  depuis: Date.UTC(2026, 8, 28), // facultatif : « voir les mouvements » ne montre que les
                                 //   mouvements postérieurs (le dernier inventaire) ; défaut : tous
  lignes: [                      // dans l'ordre du relevé (en général l'ordre des emplacements)
    { ref: 'CAB-USBC-1M', compte: 64 },                          // pas d'écart attendu
    { ref: 'ECO-BT-01', compte: 15, attendu: 'rayon',
      explication: "Les 3 écouteurs du retour R-2026-207 attendent en zone retours…" },
    { ref: 'BAT-10K', compte: 11, attendu: 'regul', motif: 'Casse',
      explication: "La batterie est détruite : le stock doit baisser de 1, motif Casse." },
    { ref: 'CLE-64G', compte: 33, recompte: 30, attendu: 'recompter',
      explication: "Aucun mouvement n'explique +3 ; le recomptage donne 30." },
  ],
} })
```

- `ref` doit exister dans le catalogue : désignation, emplacement et prix d'achat **viennent du
  catalogue**, jamais de la ligne (une seule source).
- `compte` : obligatoire en mode `releve`, ignoré en mode `physique`.
- `recompte` : la quantité trouvée au recomptage, en mode `releve`. Sans elle, le recomptage
  redonne le comptage. En mode `physique`, l'élève saisit lui-même son recomptage.
- `attendu` : `'regul'` (régulariser, avec `motif` attendu), `'rayon'` (ne pas régulariser :
  remettre en rayon) ou `'recompter'`. Absent : la ligne n'est pas notée.
- **Le stock système** n'est pas écrit dans l'inventaire : c'est `db.stock` au moment où l'élève
  ouvre l'écran pour la première fois (photo gardée dans son état). La séance l'obtient en semant
  ses mouvements (`volet.semer` → `mouvements`) : ce sont eux que l'élève lit pendant l'enquête.

### Le relevé de comptage par la messagerie

La séance l'envoie dans son volet, sans recopier les quantités (elles viennent de `lignes`) :

```js
mails: [{ folder: 'in', ts, from: 'Marc, chef d\'équipe inventaire', subject: 'Relevé de comptage — allée A',
  kind: 'releve', inventaire: 'INV-2026-41',
  text: 'Voici le relevé de ce matin.', remarque: 'A-03-2 : rangé un peu en vrac, compté vite' }]
```

La messagerie affiche alors le texte, puis le relevé « papier » (emplacement, quantité comptée).
Les indices de l'enquête (casse non saisie, retour resté en zone retours…) sont des messages
ordinaires (`text`), à la charge de la séance.

## 3. Ce que l'écran écrit dans la base de l'élève

```js
db.inventaires['INV-2026-41'] = {
  etape: 1,                      // 1 saisir · 2 constater · 3 traiter · 4 valider
  systeme: { 'ECO-BT-01': 18, … },   // photo du stock à l'ouverture
  saisie: { 'ECO-BT-01': '15', … },  // quantités comptées (texte saisi)
  ecarts: { 'ECO-BT-01': '-3', … },  // écarts saisis par l'élève (mode ecarts: 'eleve')
  decisions: { 'ECO-BT-01': { action: 'rayon', motif: '' }, … },
  recomptes: { 'CLE-64G': 30 },
  taux: '',                      // taux d'écart saisi par l'élève (mode 'eleve'), en %
  valide: null,                  // horodatage de la validation définitive, puis rien ne bouge plus
}
```

**À la validation**, chaque régularisation part dans `db.moves` :
`{ type: 'Ajustement inventaire', delta, ref: 'INV-2026-41 · Casse', … }` — une baisse entame les
lots dans l'ordre d'entrée (comme une sortie), une hausse entre sans lot. « Remettre en rayon » et
« recompter » ne créent aucun mouvement.

**Pour les jalons de la séance**, l'écran exporte la lecture qu'il fait lui-même :

```js
import { bilanInventaire } from '../core/types/inventaire.js';
const b = bilanInventaire(db, INVENTAIRE, CATALOGUE);
// → { valide, saisieOk, ecartsOk, tauxOk, justes, notees, lignes: [{ ref, systeme, compte, ecart,
//      valeur, action, motif, juste }], tauxAttendu }
```

Le taux d'écart est **en quantité**, avant traitement : somme des |écarts| ÷ somme des stocks
système × 100, arrondi au dixième (tolérance ± 0,1 point).

## 4. Comportements de l'écran (à connaître pour écrire une séance)

- **Pas de retour au comptage** une fois validé : un chiffre douteux se traite par « recompter ».
- **Saisie en mode `releve`** : toujours contrôlée contre le relevé (c'est une recopie, pas la
  compétence évaluée), quel que soit le réglage `correction`.
- **Écarts et taux saisis par l'élève** : refusés s'ils sont faux, **sauf** avec
  `correction: 'aucune'` (évaluation) — ils sont alors gardés tels quels, et `bilanInventaire`
  les donne faux (`ecartsOk`, `tauxOk`). Un écart s'écrit « −3 », « -3 » ou « 0 ».
- **Taux** : tolérance de ± 0,1 point (3,66 et 3,7 sont justes pour 3,7 %).
- **Recompter** : en mode `releve`, le recomptage prend `recompte` (sinon le même `compte`) ; si
  l'écart demeure après recomptage, la validation est refusée tant que l'élève n'a pas choisi
  « régulariser » ou « remettre en rayon ». En mode `physique`, l'élève saisit son recomptage.
- **Blocage à l'aveugle** (élève seulement, l'enseignant voit tout) : écran Stock, et à la console
  `.getstock`, `.lowstock`, `.stockvalue`, `.movements`, `.getlot`, `.setstock`, `.addstock`,
  `.removestock` — de l'ouverture de la séance jusqu'à la validation du comptage.
- **Validation définitive** : ensuite l'écran n'affiche plus que le bilan. Il n'y a pas de remise à
  zéro propre à l'inventaire : c'est « Réinitialiser » de l'environnement (séance X.1) qui efface tout.
- **Les jalons** d'une séance s'écrivent avec `bilanInventaire` (exemple : « décisions » ok si
  `b.valide && b.justes === b.notees`, « taux » ok si `b.tauxOk`) ; le moteur n'en impose aucun.
