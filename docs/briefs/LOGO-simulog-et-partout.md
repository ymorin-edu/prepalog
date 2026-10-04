# Brief — Logo Simulog + nouveau logo Prepalog sur tous les écrans

- **Statut** : livré (04/10/2026)
- **Rédigé par** : Cowork, 04/10/2026
- **Modèle conseillé** : Sonnet (affichage, pas de vue nouvelle)
- **Durée estimée** : ~20 min de code, plus la suite complète (~5 min). Un test existant est à
  réécrire (voir §5) : **le dire à Tristan**.

## 1. Ce que veut Tristan

Deux changements, validés le 04/10/2026 :

1. **Logo Simulog** (proposition 01 « écran + carton », option **A** sur la page d'essai) :
   - **la carte Simulog de l'accueil** et l'en-tête de la rubrique Simulog prennent le nouveau
     pictogramme (écran + carton) à la place du bâtiment ;
   - **dans la rubrique Simulog** (liste des entreprises, puis séances d'une entreprise), le
     bandeau vert montre **le logo Simulog seul** à la place du logo Prepalog.
2. **Le logo Prepalog complet (C4-T) sur tous les autres écrans** : activité ouverte (rubriques
   Logistique, Tableur, Quiz, Scénario, Magasin…), espace enseignant, écran de panne. Jusqu'ici il
   n'était qu'à la connexion et à l'accueil (brief `LOGO-bandeau.md`).

Les séances immersives (Spartoo, Cdiscount, Boost, Picard…) **ne changent pas** : elles gardent
le bandeau aux couleurs de l'entreprise et leur bouton Quitter.

## 2. Les fichiers fournis (`docs/briefs/logo/`)

- `simulog-logo-bandeau.svg` → à copier dans `styles/` sous le même nom. Blanc sur fond
  transparent, viewBox 1196 × 520 (même hauteur que `prepalog-logo-bandeau.svg`). Le mot
  « Simulog » est à la **même taille et sur la même ligne de base** que « Prepalog » (police Inter
  Gras convertie en tracés, aucune police à charger). « log » et la face du dessus du carton en
  vert clair `#9be3a8`, comme « log » de Prepalog. Seule adresse : l'espace de noms SVG.
- `simulog-picto.svg` → **pour lecture seulement** : son contenu est à recopier comme nouvelle
  entrée de `ICONES` dans `activites/index.js` (sans l'attribut `xmlns`, comme les autres). Grille
  24 × 24, trait 1,6, `currentColor`, sans remplissage : mêmes règles que les dix autres.

Vérifié à l'écran par Cowork sur une page d'essai qui charge le vrai `styles/base.css`
(clair, sombre, 400 px de large) : `Claude outputs\simulog-essai-logo.html`.

## 3. Ce qu'il faut changer (proposition, à vérifier dans le code)

**`activites/index.js`**
- `ICONES.simulog = <svg …>` (contenu de `simulog-picto.svg`), avec un commentaire d'une ligne
  comme les autres (« écran et carton : le logiciel de l'entreprise »).
- Rubrique `simulog` : `icone: 'simulog'`. `ICONES.entreprise` n'est plus utilisé par aucune
  rubrique : le garder ou le retirer, au choix (grep d'abord).

**`core/ui.js` — `entete()`**
- Le logo complet devient **la règle** : sans option, `prepalog-logo-bandeau.svg`, `alt="Prepalog"`,
  pas de `<span class="marque">`.
- Nouvelle valeur `logo: 'simulog'` → `simulog-logo-bandeau.svg`, `alt="Simulog"`.
- L'ancienne branche (`logo-bandeau.png` + `.marque`) n'a plus d'appelant : la retirer.
  **Ne pas supprimer le fichier** `styles/logo-bandeau.png` dans ce chantier (un test ou un
  autre écran peut encore le citer : grep), ni `styles/logo.png` / `logo-sombre.png` (favicon).
- Mettre à jour le commentaire au-dessus d'`entete()`.

**`core/app.js`**
- `cartouche` de l'accueil (l. ~117) : `logo: rub?.id === 'simulog' ? 'simulog' : undefined`
  (ou équivalent). Le cartouche sert à l'accueil **et** à l'intérieur d'une rubrique : seul
  l'intérieur de Simulog change.
- Activité ouverte non immersive (l. ~279) : si `rubriqueActive === 'simulog'`, logo Simulog ;
  sinon Prepalog. (Cas rare : les séances Simulog sont immersives. À garder pour la cohérence.)
- `vueProf` (l. ~404) et `vuePanne` (l. ~423) : rien à passer, la règle par défaut suffit.
- `logo: 'complet'` devient inutile aux deux appels existants : le retirer ou le laisser
  accepté sans effet, au choix, mais pas les deux formes mélangées.

**`styles/base.css`** : normalement rien. La règle actuelle (pleine hauteur du bandeau, largeur
automatique) suffit : à 72 px de haut, le logo Simulog fait ~166 px de large. Regarder
`docs/EN-COURS.md` avant d'y toucher.

## 4. Ce qu'il ne faut pas faire

- Ne pas toucher au bandeau des séances immersives (`core/types/entreprise.js`, d'ailleurs pris
  par le chantier « Repérage : colonne Documents ouverts » au 04/10).
- Ne pas changer le favicon.
- Ne pas mettre le logo Simulog à l'accueil général : seulement à l'intérieur de la rubrique.

## 5. Tests

Changement dans `core/` et `activites/` : **suite complète avant le push**.

- `outils/test/socle.mjs` contient un cas ajouté le 04/10 qui vérifie « ancien logo + marque
  dans l'espace enseignant ». Il devient faux par décision de Tristan : **le réécrire et le dire
  à Tristan** (règle du CLAUDE.md). Nouvelle attente : logo complet, pas de `.marque`, dans
  l'espace enseignant et dans une activité ouverte (ex. un TAB).
- Cas à ajouter : dans la rubrique Simulog, l'image du bandeau est `simulog-logo-bandeau.svg`
  (`alt="Simulog"`) ; à l'accueil et dans la rubrique Tableur, c'est `prepalog-logo-bandeau.svg`.
  La carte Simulog de l'accueil contient le nouveau pictogramme (par ex. un trait propre au
  dessin, ou un `data-icone` si Claude Code en ajoute un).
- Éprouver dans les deux sens (logo Prepalog dans Simulog → le cas tombe ; logo Simulog partout
  → l'accueil tombe).
- Le test n° 13 (thème) cherche `logo-bandeau` dans l'adresse de l'image : il passe toujours,
  ne pas le toucher.

## 6. Critères de validation par Tristan

À l'écran, en clair et en sombre : accueil (logo Prepalog, carte Simulog avec l'écran + carton) →
clic Simulog (logo Simulog dans le bandeau, même picto dans l'en-tête) → une entreprise (toujours
Simulog) → retour accueil (Prepalog) → une activité Tableur (Prepalog complet, plus de « Prepalog »
écrit à côté de l'ancien camion) → espace enseignant (idem).

## 6 bis. Compte rendu (à remplir par Claude Code)

Livré le 04/10/2026 par Claude Code, dans une copie à part du dépôt (`prepalog-logo`) pour ne pas
toucher aux fichiers non commités de la séance ENT-5.1, ouverte en même temps.

- `styles/simulog-logo-bandeau.svg` : copie à l'identique du fichier fourni (même empreinte SHA-256).
- `activites/index.js` : `ICONES.simulog` (picto fourni, sans `xmlns`, coordonnée `6.3999999999999995`
  arrondie à `6.4`). La rubrique Simulog le prend. **`ICONES.entreprise` retiré** : plus aucun appelant
  (grep). La grille compte toujours dix pictogrammes.
- `core/ui.js` — `entete()` : logo Prepalog complet par défaut, `logo: 'simulog'` → logo Simulog.
  Branche `logo-bandeau.png` + `.marque` retirée. Le paramètre `marque` reste dans la signature
  (les appelants le passent toujours, sans effet).
- `core/app.js` : `logo: 'complet'` retiré des deux appels ; le cartouche de rubrique et l'activité
  ouverte non immersive passent `'simulog'` quand la rubrique est Simulog. Espace enseignant et
  écran de panne : rien à passer.
- **Non touché** : `styles/base.css` (les règles `.entete .marque` et le commentaire qui cite
  `logo-bandeau.png` sont désormais sans effet, à nettoyer lors d'un prochain passage sur ce
  fichier), `styles/logo-bandeau.png`, le favicon, le bandeau des séances immersives.

Tests (`outils/test/socle.mjs`) :
- **Cas 13 bis réécrit** (il attendait l'ancien logo + la marque dans l'espace enseignant). Il
  vérifie maintenant : accueil enseignant (Prepalog, carte Simulog avec l'écran + carton), rubrique
  Tableur et activité TAB ouverte (Prepalog), rubrique Simulog : liste des entreprises puis séances
  d'une entreprise (Simulog, picto dans l'en-tête), retour à l'accueil (Prepalog), espace
  enseignant (Prepalog). Toujours sans `.marque` et avec un logo d'au moins 150 px de large.
- Cas 14 bis (accueil élève, connexion) : seulement renommé vers la nouvelle fonction de contrôle.
- Éprouvé dans les trois sens : logo Prepalog dans Simulog → tombe ; logo Simulog partout →
  l'accueil enseignant et l'accueil élève tombent ; pictogramme altéré → tombe.
- Suite complète : **623/623**.

