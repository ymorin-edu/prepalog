# Brief — Nouveau logo dans le bandeau (connexion + accueil)

- **Statut** : livré (04/10/2026)
- **Rédigé par** : Cowork, 04/10/2026
- **Modèle conseillé** : Sonnet (petit changement d'affichage, pas de vue nouvelle)
- **Durée estimée** : moins de 20 min, plus le temps de la suite complète (~5 min)

## 1. Ce que veut Tristan

Le nouveau logo Prepalog a été validé le 04/10/2026 (variante « C4-T »). **Pour le moment**, il
remplace l'ancien logo **uniquement dans le bandeau vert de l'écran de connexion et de l'écran
d'accueil**. Les autres écrans (intérieur d'une activité, espace enseignant…) gardent le bandeau
actuel, sans changement. L'icône d'onglet (`styles/logo.png`, favicon) ne change pas non plus.

## 2. Le fichier fourni

`docs/briefs/logo/prepalog-logo-bandeau.svg` (6 Ko), à copier dans `styles/` sous le même nom.

- Tracé **blanc sur fond transparent**, comme `logo-bandeau.png` : il se pose sur l'aplat vert
  du bandeau et marche dans les deux thèmes (vérifié à l'écran sur `#107c41` et `#18724a`).
- Il **contient déjà le mot « Prepalog »** (« Prepa » blanc, « log » vert clair `#9be3a8`),
  converti en tracés : aucune police à charger. Contraste de « log » : 3,5:1 sur `#107c41`,
  3,9:1 sur `#18724a` (texte de grande taille, seuil 3:1).
- Rapport largeur/hauteur ≈ 2,87 (viewBox 1493 × 520) : à 96 px de haut il fait ~276 px de
  large, à 72 px ~207 px.
- Aucune requête externe. Seule adresse dans le fichier : l'espace de noms
  `xmlns="http://www.w3.org/2000/svg"`. Si le test « aucune adresse d'hébergeur » le refuse,
  le dire à Tristan plutôt que de retirer l'attribut à l'aveugle.
- Les véhicules sont en traits sans remplissage (le camion a des traits interrompus aux roues),
  donc aucune tache de vert fixe n'apparaît quel que soit le thème.

## 3. Ce qu'il faut changer (proposition, à vérifier dans le code)

Le bandeau est produit par `entete()` dans `core/ui.js` : `<img class="logo"
src="./styles/logo-bandeau.png">` suivi de `<span class="marque">`. Les appels sont dans
`core/app.js` (lus le 04/10/2026, numéros de ligne indicatifs) :

- l. 37, `vueConnexion()` : écran de connexion (`grand: true`) → **nouveau logo** ;
- l. 117, `cartouche` de l'accueil (rubriques, et aussi l'intérieur d'une rubrique qui le
  réutilise) → **nouveau logo** ;
- l. 279 (activité ouverte), l. 404 (`vueProf`, espace enseignant), l. 423 (`vuePanne`, écran
  « l'application n'a pas pu démarrer ») → **inchangés** pour le moment.

Piste : une option de plus pour `entete()` (par ex. `logo: 'complet'`). Quand elle est active :
`src="./styles/prepalog-logo-bandeau.svg"`, `alt="Prepalog"`, et **ne pas afficher le
`<span class="marque">`** (sinon le nom apparaîtrait deux fois). L'institution, le nom de
l'utilisateur et les boutons restent comme avant. Le logo garde la règle actuelle (pleine
hauteur du bandeau, `--h-bandeau`).

Vérifier le bandeau à 560 px de large et moins : le logo doit tenir avec le bouton
« Se déconnecter » sans passer à la ligne de façon disgracieuse.

## 4. Ce qu'il ne faut pas faire

- Ne pas supprimer `styles/logo-bandeau.png` (il sert encore aux autres écrans).
- Ne pas toucher `styles/logo.png` ni `styles/logo-sombre.png` (favicon, `[data-logo]`).
- `styles/base.css` est dans la liste « un seul chantier à la fois » : regarder
  `docs/EN-COURS.md` avant d'y écrire.

## 5. Tests

Changement dans `core/ui.js` (+ peut-être `styles/base.css`) : **suite complète avant le push**.
Si un test vérifie l'image du bandeau ou la présence de `.marque` à l'accueil, le dire à
Tristan avant de le réécrire. Contrôle à l'écran : connexion, accueil élève, accueil enseignant,
puis un écran intérieur (ancien bandeau toujours là), en thème clair et sombre.

## 6. Compte rendu (à remplir par Claude Code)

Livré le 04/10/2026.

- `styles/prepalog-logo-bandeau.svg` : copie à l'identique du fichier fourni (vérifié octet par
  octet). Le test « aucune adresse d'hébergeur » ne le lit pas (il ne lit que `.js`, `.mjs`,
  `.css`, `.html`) et l'espace de noms `w3.org` n'est pas un hébergeur : rien à retirer.
- `core/ui.js` : `entete()` prend une option `logo: 'complet'` → nouveau logo,
  `alt="Prepalog"`, et pas de `<span class="marque">`. Sans l'option, rien ne change.
- `core/app.js` : l'option est passée à l'écran de connexion (l. 37) et au cartouche de
  l'accueil (l. 117, donc aussi l'intérieur d'une rubrique, Simulog compris). Activité ouverte,
  espace enseignant et écran de panne : inchangés.
- `styles/base.css` : **pas touché**. La règle existante (pleine hauteur du bandeau, largeur
  automatique) suffit : 276 × 96 px à la connexion, 207 × 72 px à l'accueil et sous 560 px.
- **Vérifié à l'écran** (navigateur, mode démo) : connexion en sombre (1280 px) et en clair
  (560 px), accueil enseignant (800 et 375 px), espace enseignant (ancien bandeau toujours là).
  Pas de défilement horizontal. À 800 px et en dessous, le nom de l'utilisateur et
  « Se déconnecter » passent sous le logo : **c'était déjà le cas avec l'ancien bandeau**
  (même hauteur de bandeau mesurée avant/après, 120 px à 800 px, 160 px à 375 px).
- Tests (`outils/test/socle.mjs`, deux cas **ajoutés**, aucun réécrit) : nouveau logo sans
  marque à l'accueil enseignant, ancien logo + marque dans l'espace enseignant ; nouveau logo à
  l'accueil élève et à la connexion. Éprouvés dans les deux sens (ancien logo partout → les deux
  tombent ; nouveau logo partout → l'espace enseignant tombe). Le test existant n° 13 (thème)
  cherche `logo-bandeau` dans l'adresse de l'image : il passe toujours (le nouveau nom contient
  ces mots), son message d'erreur parle encore du `.png` mais il n'a pas été modifié.
  Suite complète : 611/611.
