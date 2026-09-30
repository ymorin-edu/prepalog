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

861 Ko, chargés **à la demande** : seules les activités de dépôt de classeur déclenchent
le téléchargement, jamais les quiz ni les scénarios. Une fois par session.

## Ailleurs dans le dépôt

Les polices suivent la même règle mais vivent avec le reste de l'habillage :
`styles/polices.css` et `styles/polices/` (Inter, IBM Plex Mono, licence SIL OFL 1.1).
Elles venaient de Google Fonts, qui recevait l'adresse IP de chaque élève à chaque
chargement.

**Le site ne fait donc plus aucune requête hors de son propre domaine.** Un test le
vérifie : toute requête sortante observée pendant la suite le fait échouer.

## Mettre à jour

Récupérer le fichier depuis npm, sans installer quoi que ce soit dans le dépôt :

```
npm pack xlsx@<version>
tar -xzf xlsx-<version>.tgz package/dist/xlsx.full.min.js package/LICENSE
```

Puis remplacer les deux fichiers ici et relancer `node outils/test.mjs` : le test de
correction d'un classeur déposé passe par cette bibliothèque et signalera toute rupture.
