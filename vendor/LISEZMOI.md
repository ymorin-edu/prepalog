# vendor/ — bibliothèques extérieures, servies par le site lui-même

## Pourquoi ce dossier

Prepalog ne charge **aucune bibliothèque depuis un CDN**. Tout ce dont une activité a
besoin est servi depuis le dépôt.

La raison est concrète : les filtrages académiques bloquent régulièrement les hébergeurs
de bibliothèques publics (cdnjs, unpkg, jsdelivr). Une activité de dépôt de classeur qui
irait chercher son lecteur Excel sur cdnjs tomberait alors en panne **en séance, devant la
classe**, pour une raison qui n'a rien à voir avec le code. Un fichier de plus dans le
dépôt coûte moins cher qu'une heure perdue.

Effet secondaire appréciable : le site fonctionne hors ligne une fois chargé.

## Contenu

| Fichier | Rôle | Version | Licence |
|---|---|---|---|
| `xlsx.full.min.js` | SheetJS — lecture des classeurs `.xlsx` par `core/types/tableur.js` | 0.18.5 | Apache-2.0 (`xlsx.LICENSE`) |
| `firebase/firebase-app.js` | noyau du SDK Firebase, registre des applications | 10.13.0 | Apache-2.0 (`firebase/firebase.LICENSE`) |
| `firebase/firebase-auth.js` | authentification (Google pour les profs, matricule pour les élèves) | 10.13.0 | idem |
| `firebase/firebase-firestore.js` | identités, groupes, travaux, jeux privés | 10.13.0 | idem |
| `firebase/firebase-database.js` | Realtime Database — jeux de données partagés | 10.13.0 | idem |

SheetJS : 861 Ko, chargés **à la demande** : seules les activités de dépôt de classeur
déclenchent le téléchargement, jamais les quiz ni les scénarios. Une fois par session.

SDK Firebase : 855 Ko, chargés **uniquement en mode réel**, par
`core/backend-firebase.js`. En mode démonstration, aucun des quatre fichiers n'est
demandé. Les trois modules dépendants importent `./firebase-app.js` en relatif, donc
les quatre partagent bien la même instance d'application.

### Le cas Firebase : ce qui reste dehors, et pourquoi

Verser le SDK supprime la dépendance au CDN `gstatic.com` — celle qui empêchait le mode
réel de **démarrer** si l'académie filtrait ce domaine. Elle ne supprime pas, et ne peut
pas supprimer, les appels au **service** Firebase lui-même : une base de données en ligne
se joint par le réseau. En mode réel, le navigateur parle donc à
`*.firebaseio.com`, `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, au
domaine d'authentification du projet (`*.firebaseapp.com`) et, pour la connexion Google
par fenêtre surgissante, à `apis.google.com`.

La règle « aucune requête hors du domaine » reste donc **entière en mode démonstration**,
qui est le mode du site publié et celui de toute la suite de tests. En mode réel, elle
devient « aucune requête hors du domaine, sauf le service de données lui-même » — ce qui
est la définition d'une application en ligne, et se filtre différemment : un établissement
qui bloque `googleapis.com` bloque aussi Google Docs, ce n'est pas le même risque qu'un
CDN de bibliothèques bloqué.

## Ailleurs dans le dépôt

Les polices suivent la même règle mais vivent avec le reste de l'habillage :
`styles/polices.css` et `styles/polices/` (Inter, IBM Plex Mono, licence SIL OFL 1.1).
Elles venaient de Google Fonts, qui recevait l'adresse IP de chaque élève à chaque
chargement.

**Le site ne fait donc plus aucune requête hors de son propre domaine.** Deux tests le
vérifient : toute requête sortante observée pendant la suite la fait échouer, et un test
dédié importe `core/backend-firebase.js` — le seul module qui allait chercher son code
dehors — pour contrôler que ses quatre `import()` résolvent bien dans `vendor/`.

## Mettre à jour

### SheetJS

```
npm pack xlsx@<version>
tar -xzf xlsx-<version>.tgz package/dist/xlsx.full.min.js package/LICENSE
```

Puis remplacer les deux fichiers ici et relancer `node outils/test.mjs` : le test de
correction d'un classeur déposé passe par cette bibliothèque et signalera toute rupture.

### SDK Firebase

Le paquet npm `firebase` livre **exactement** les bundles servis par
`gstatic.com/firebasejs/<version>/`. Aucune compilation n'est donc nécessaire :

```
npm pack firebase@<version>
tar -xzf firebase-<version>.tgz \
  package/firebase-app.js package/firebase-auth.js \
  package/firebase-firestore.js package/firebase-database.js
```

Deux retouches, et deux seulement, sur les fichiers extraits :

1. dans `firebase-auth.js`, `firebase-firestore.js` et `firebase-database.js`, l'unique
   `import ... from "https://www.gstatic.com/firebasejs/<version>/firebase-app.js"` devient
   `from "./firebase-app.js"` ;
2. le commentaire `//# sourceMappingURL=...` de fin de fichier est retiré, les `.map`
   n'étant pas versés.

Rien d'autre n'est touché — les deux occurrences de l'URL `gstatic.com` qui subsistent dans
`firebase-app.js` sont des noms de journal, pas des requêtes. Mettre à jour ensuite le
numéro de version dans le tableau ci-dessus, dans `firebase.LICENSE`, et relancer
`node outils/test.mjs`.
