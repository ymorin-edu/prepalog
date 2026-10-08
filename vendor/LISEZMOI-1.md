# Lot « quiz d'entraînement » — QUI-8, prêt à poser

**Rien n'a été écrit dans `GitHub\prepalog`.** Ce dossier attend que l'autre conversation
ait fini et que tu aies commité son lot. Suite de tests : **142/142**, quatorze sabotages
éprouvés, quatorze détections.

## Ce que c'est

Le premier des dix quiz de la Suite Logistique, repris dans Prepalog avec sa mécanique :
écran de rappel, une question à la fois, correction immédiate et expliquée, chronomètre,
bilan, classement par score puis par temps (mon groupe / tous les groupes), et calculette.

Les vingt questions ne sont pas des questions : ce sont vingt **générateurs**, extraits du
fichier source de la Suite Logistique et déposés ici ligne pour ligne. Les nombres changent
à chaque tentative, donc le quiz ne s'apprend pas par cœur.

## À essayer avant tout

`essai/essai-quiz-conversions.html` — **double-clic, ça s'ouvre dans le navigateur.** C'est
le vrai module, sorti du dépôt, dans une page autonome : rien n'est enregistré nulle part,
rien ne sort sur Internet. Tu joues le rôle d'une élève, trois camarades inventés sont déjà
au classement, et un bouton bascule en thème sombre.

## Les fichiers, et comment les poser

### Trois fichiers neufs — à copier tels quels

| Fichier | Rôle |
|---|---|
| `core/quiz.js` | fabrique de questions tirées au sort (outils repris de la Suite) |
| `core/calculette.js` | la calculette flottante, générique |
| `core/types/entrainement.js` | le moteur : rappel, jeu, bilan, classement |

### Deux fichiers de contenu neufs — à copier tels quels

| Fichier | Rôle |
|---|---|
| `contenus/entr-conversions.js` | les 20 générateurs et le rappel |
| `activites/entr-conversions.js` | la déclaration du module QUI-8 |

### Trois fichiers du noyau — versions complètes, à remplacer

Ils ne sont PAS dans le lot en attente de l'autre conversation, donc je les livre entiers.

| Fichier | Ce qui change |
|---|---|
| `core/app.js` | `ctx.groupeNom` ajouté (4 lignes) — le classement affiche « 1 LOG A », pas « 1-log » |
| `core/backend-demo.js` | méthode `poserLigne` ajoutée |
| `core/backend-firebase.js` | méthode `poserLigne` ajoutée |
| `database.rules.json` | un élève peut écrire la ligne de classement dont la clé est son uid |

### Trois ajouts à fusionner — surtout pas à remplacer

Ces trois-là sont **aussi dans le lot de l'autre conversation**. Je ne livre donc que le
morceau à ajouter, et je le fusionnerai moi-même après avoir relu ta version du disque.

| Morceau | Où il va |
|---|---|
| `activites/entr-conversions.js` dans la liste | `activites/index.js`, une ligne après `calculs-stock.js` |
| `styles/_ajout-entrainement.css` | à coller à la fin de `styles/base.css` |
| `outils/_ajout-test.mjs` | à coller dans `outils/test.mjs`, juste avant `console.log('\n=== RÉUSSIS ===')` |

**Le plus simple : tu me dis « c'est commité », et je pose tout, y compris ces trois
fusions, après avoir relu le disque.**

## Trois choses à savoir

**1. Les règles de sécurité ont changé, et elles ne protègent rien tant qu'elles ne sont
pas collées dans la console Firebase.** Le site tourne en mode démonstration, donc rien ne
casse aujourd'hui. Mais au moment de la bascule en mode réel, il faudra publier
`database.rules.json` — sans le bloc `_commentaire`.

**2. Le classement est lu par toutes les classes.** C'est ce que tu as demandé. Du coup le
site n'y écrit que **le prénom et l'initiale du nom** (« Léa D. »), jamais le nom entier.
Si tu préfères le prénom seul, ou les deux lettres, c'est une ligne — `nomCourt` dans
`core/types/entrainement.js`.

**3. Un défaut de la Suite Logistique a été corrigé au passage.** Sur « Combien d'heures
dans 150 minutes ? », deux mauvaises réponses tombaient sur la même valeur (1,5), et la
question se retrouvait avec « Aucune de ces réponses » à la place d'un vrai distracteur.
Le générateur a été corrigé, et l'énumération complète des tirages dit qu'il n'en reste
aucun autre.

## Ce qui reste à faire

Les neuf autres quiz : Proportionnalité et Arrondis (générateurs, comme celui-ci),
Géographie ×3, Français ×3 et CACES R489 — ces sept-là sont des questions figées, et le
moteur les prend déjà (`questions:` au lieu de `generateurs:`). Ils prendront QUI-9 à
QUI-17.
