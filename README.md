# Prepalog

Plateforme d'activités pour la famille des métiers GATL. Multi-enseignants : chacun ses
groupes, cloisonnés. Les activités s'autocorrigent et remontent automatiquement dans le
suivi de classe.

## Démarrer

Ouvrez `index.html` par un petit serveur local (les modules ES ne se chargent pas en
`file://`) :

```
python -m http.server 8000
```

puis http://localhost:8000. Sans fichier de configuration, le site démarre en **mode
démonstration** : tout est enregistré dans le navigateur, aucune connexion réseau. C'est le
mode à utiliser pour développer et tester.

## Passer en mode réel

Copiez `prepalog-config.exemple.json` en `prepalog-config.json` et renseignez la
configuration Firebase du projet ainsi que la liste des super-administrateurs (les adresses
Google autorisées à créer le premier compte enseignant).

Ce fichier n'est pas versionné : il est délibérément séparé du code pour survivre aux
mises à jour.

Dans la console Firebase :

1. Activer **Authentication** → Google, et E-mail/mot de passe (les élèves se connectent
   par matricule, transformé en adresse interne `matricule@prepalog.local`).
2. Activer **Cloud Firestore** et **Realtime Database**.
3. Coller `firestore.rules` et `database.rules.json` dans leurs onglets de règles respectifs.

## Ajouter une activité

1. Créer `activites/mon-activite.js` :

```js
import { creerQCM, sceller } from '../core/types/qcm.js';

export const meta = {
  id: 'ent2', code: 'ENT-2', titre: 'Mon activité',
  desc: 'Une phrase de présentation.',
  rubrique: 'quiz',     // doit exister dans activites/index.js
  bareme: 10,           // présence d'un barème = apparaît dans le suivi de classe
                        // (le suivi affiche une note sur 20 : voir core/notes.js)
  // pas de `niveaux` : par défaut, tout est ouvert à tous les niveaux
  portee: 'eleve',      // 'eleve' | 'equipe' | 'groupe' | 'commun'
  pret: true,
};

const moteur = creerQCM({ questions: sceller([ /* ... */ ]) });
export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
```

2. Ajouter une ligne dans `activites/index.js`.

C'est tout : l'accueil, les droits, la sauvegarde du score, l'export CSV et le suivi de
classe suivent automatiquement.

## Les portées de jeu de données

| Portée | Où vivent les données | Usage |
|---|---|---|
| `eleve` | Firestore, document privé | chacun sa base |
| `equipe` | Realtime Database | binôme, îlot |
| `groupe` | Realtime Database | base commune à la classe |
| `commun` | Realtime Database | référentiel partagé entre tous les groupes |

Changer de portée = changer un mot dans `meta`. Le reste du code de l'activité est
identique.

Pour une activité à tables (type `tableau`), déclarez `tables` dans `meta` et exportez
éventuellement `graines` : l'enseignant pourra installer ce contenu de départ en un clic
depuis « Conduite de séance ».

## Thème clair / sombre

Le bouton en haut à droite bascule entre les deux. Trois états : `auto` (suit le réglage du
système d'exploitation, c'est le défaut), `clair`, `sombre`. Le choix est enregistré dans le
navigateur de la personne, il ne remonte pas en base.

Les deux thèmes partagent les mêmes noms de variables CSS (`--fond`, `--panneau`, `--encre`,
`--ardoise-fond`…) : **une nouvelle activité n'a jamais à connaître le thème actif**, il lui
suffit d'utiliser les variables et les classes existantes.

Le logo est fourni en deux versions, `styles/logo.png` (disque ardoise) et
`styles/logo-sombre.png` (disque éclairci), échangées automatiquement. Un script en tête
d'`index.html` pose le thème avant le premier rendu pour éviter le clignotement blanc.

## Types d'activité disponibles

- `core/types/qcm.js` — choix unique ou multiple, réponses scellées par empreinte
- `core/types/ordre.js` — remise en ordre d'étapes, un point par scénario entièrement réussi
- `core/types/assoc.js` — rangement d'étiquettes dans des catégories
- `core/types/numerique.js` — saisie de nombres avec tolérance, virgule française acceptée
- `core/types/tableur.js` — dépôt d'un classeur Excel, contrôle cellule par cellule
- `core/types/tableau.js` — base de données à tables liées, quelle que soit la portée
- `core/types/lien.js` — le travail se fait sur un support extérieur (Padlet, Digipad) ;
  l'activité déclare `notation: 'prof'` et sa note se saisit dans « Suivi de classe »

## Niveaux et notation

Deux règles arrêtées le 01/10/2026.

**Par défaut, tout est ouvert à tous les niveaux.** Aucune activité ne déclare de `niveaux` :
c'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir ce jour-là. Le mécanisme
de filtrage reste dans `core/niveaux.js`, prêt à resservir — il suffit d'ajouter
`niveaux: ['1re', 'tle']` à un `meta`, ou à la ligne d'un exercice de série.

**Un module, une note sur 20.** Le suivi de classe ramène tout score automatique à une note
sur 20, arrondie au demi-point, quel que soit le nombre d'exercices du module. Le score brut
reste enregistré tel quel et s'affiche en infobulle ; une note saisie à la main garde son
barème, et les jalons d'un environnement d'entreprise restent des jalons. Le détail est
dans `core/notes.js`.

## Conduite de séance

Depuis l'espace enseignant : ouvrir ou fermer une activité pour le groupe, semer le contenu
de départ, **geler** une base partagée en lecture seule à la fin de l'heure, réinitialiser,
exporter le suivi en CSV.

## Aucune dépendance extérieure

**Le site ne fait aucune requête hors de son propre domaine.** Ni CDN, ni Google Fonts.

- **SheetJS**, qui lit les classeurs déposés : `vendor/xlsx.full.min.js`, chargé à la
  demande par les seules activités de dépôt (voir `vendor/LISEZMOI.md`).
- **Inter et IBM Plex Mono** : `styles/polices.css` et `styles/polices/`. Grâce à
  `unicode-range`, une page française ne télécharge que le sous-ensemble `latin`, soit
  cinq fichiers et environ 110 Ko.

Deux raisons. La première est pratique : les filtrages académiques bloquent régulièrement
cdnjs comme fonts.googleapis.com. Une activité de dépôt qui irait chercher son lecteur
Excel au dehors tomberait en panne en séance, devant la classe. La seconde tient au droit :
chaque chargement depuis Google transmettait l'adresse IP de l'élève à un tiers, sans
consentement et sans nécessité.

Un test garde la règle : toute requête sortante observée pendant la suite la fait échouer.
Effet secondaire, le site fonctionne hors ligne une fois chargé.

## Tester

`outils/test.mjs` lance **60 vérifications** de bout en bout avec Playwright en mode
démonstration : connexion enseignant et élève, création de groupe et de comptes, base
partagée, les huit mécaniques d'activité, ouverture et fermeture d'une activité pour un
groupe, conversion du score en note sur 20, saisie d'une note à la main dans le suivi de
classe, correction d'un classeur déposé, suppression d'un groupe et sort de ses élèves,
polices servies par le dépôt, absence de dépendance extérieure, thème clair/sombre.

Les séries de tableur ont chacune leur vérification de contenu, et TAB-4 en a deux : l'une
contrôle les positions visées par les corrigés avec des repères écrits à la main, l'autre
dépose trois classeurs remplis des valeurs attendues et exige le sans-faute.

Deux de ces vérifications ne passent pas par le navigateur : le filtrage par niveau et le
calcul de la note sur 20 sont contrôlés **à l'unité**, sur des valeurs fabriquées. Aucun
contenu du dépôt ne les exerce plus — tout est ouvert à tous les niveaux — et un garde-fou
adossé à un seul cas de contenu disparaîtrait avec ce contenu.

```
npm install --no-save --no-package-lock playwright xlsx@0.18.5
npx playwright install chromium
node outils/test.mjs
```

Depuis le 02/10/2026 (190 cas à cette date), la suite est découpée en **un fichier par bloc**
dans `outils/test/` : `socle`, `spartoo`, `groupes`, `dependances`, `transport`, `boost`,
`quiz`, `carte`, plus `commun.mjs` (serveur, navigateur, page partagée). `outils/test.mjs` est
le lanceur : même commande, même bilan. Pour ne lancer qu'un bloc, `node outils/test.mjs boost`
(plusieurs : `node outils/test.mjs boost carte`). `spartoo` et `groupes` s'appuient sur l'élève
et les groupes créés par le socle : lancés seuls, ils sont précédés du socle. Un nouveau bloc
s'inscrit dans la liste `BLOCS` du lanceur, qui refuse de partir s'il en trouve un oublié.

Installation **locale** et non globale : un paquet posé par `npm i -g` n'est pas résolu par
un `import 'playwright'` depuis le dossier du projet. `node_modules/` est ignoré par git.
`xlsx` ne sert qu'à fabriquer le classeur rempli du test de correction.

La suite tourne sous Windows comme sous Linux depuis le 01/10/2026. Elle n'avait jamais
tourné qu'ailleurs, et deux conversions de chemin manquaient : `fileURLToPath` pour la
racine servie, `pathToFileURL` pour les `import()` dynamiques. Sans la première, le serveur
de test répondait 404 à tout et la page restait blanche — un symptôme qui ne désigne en
rien sa cause.

## Limite assumée

L'autocorrection a lieu dans le navigateur : les corrigés sont techniquement accessibles à
qui sait ouvrir les outils de développement. Les réponses de QCM sont stockées sous forme
d'empreinte, ce qui décourage la curiosité ordinaire, mais l'outil reste **formatif**. Toute
évaluation notée doit rester sur support surveillé.

## Hébergement

GitHub Pages, branche `main`, racine. Le fichier `.nojekyll` évite tout traitement Jekyll.
Aucune étape de compilation : ce qui est dans le dépôt est ce qui est servi.
