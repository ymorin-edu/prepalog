# Chantier moteur — Logisim rangé par entreprise

**Statut** : à implémenter — maquette cliquable faite et choix tranchés par Tristan le 02/10/2026
**Date** : 02/10/2026
**Conversation d'origine** : Claude Code, après la construction d'ENT-3.3
**Modèle** : Opus (vue nouvelle de `core/app.js`)

## 1. Ce que Tristan veut

Aujourd'hui, un clic sur la pastille **Logisim** affiche toutes les séances en vrac (ENT-1.1 à ENT-3.3).
Demain : l'élève clique sur **Logisim** → il voit **les logos des entreprises** → il clique sur un logo →
il retrouve **les séances de cette entreprise**.

## 2. Décisions de Tristan (02/10/2026)

1. **Carte d'entreprise = le logo seul** : ni nom, ni métier, ni nombre de séances sur la carte (le nom
   reste dans `title`/`aria-label`/`alt` pour l'accessibilité).
2. **Une entreprise qui n'a qu'une séance ouverte montre quand même la liste** : toujours le même chemin
   logo → liste (contrairement à une rubrique à activité unique, qui s'ouvre directement : ne pas changer
   cette règle-là pour les autres rubriques).
3. **« Quitter » une séance ramène à la liste des séances de son entreprise**, plus à l'accueil général.
   Le lien « ← LOGISIM » de la liste ramène aux logos, « ← ACCUEIL » des logos ramène à l'accueil.
4. En tête de la liste d'une entreprise : le logo, puis le **nom** et le **métier** (ex. « Boost —
   Logistique e-commerce, Nîmes »). Les tuiles des séances sont les tuiles actuelles (code, titre, desc,
   étiquette « Cachée aux élèves » chez l'enseignant).
5. **Plaque claire sous les logos**, fixe quel que soit le thème (`#f7f4ee` dans la maquette, pas de blanc
   pur) : sans elle, en thème sombre (que voit un élève dont le poste est réglé en sombre), Cdiscount et Boost
   deviennent illisibles. Le blanc du JPEG de Spartoo est fondu par `mix-blend-mode: multiply`.
   *Choix de Claude Code signalé à Tristan, pas d'objection à ce jour* ; si la couleur devient une variable
   CSS, la déclarer dans **les trois blocs** de `styles/base.css`.

## 3. Maquette

`G:\Mon Drive\Travail\Logistique\1L\Claude outputs\essai-logisim-entreprises.html` (autonome, double-clic).
Elle reprend `styles/base.css`, les logos et les séances réels ; bascule élève / enseignant en haut.
C'est la référence visuelle : son CSS propre (`.entreprises`, `.entreprise`, `.plaque`, `.entreprise-tete`)
est à reprendre dans `styles/base.css`.

## 4. Construction proposée

- **Quelle entreprise pour une séance** : le premier nombre du `code` (`ENT-3.2` → 3). Une petite table
  dans `activites/index.js`, une ligne par entreprise : `{ n: 1, nom: 'Spartoo', metier: 'Vente de chaussures
  en ligne', logo: './contenus/trames/logos/spartoo.jpg' }`, puis Cdiscount (`cdiscount.png`, « Entrepôt de
  Cestas — suivi des stocks ») et Boost (`boost.png`, « Logistique e-commerce — Nîmes »). Les noms et métiers
  sont les `sousTitre` déjà dans `contenus/spartoo.js`, `cdiscount.js`, `boost.js` — ne pas importer ces
  contenus à l'accueil (lourds), recopier les deux textes dans la table. Une entreprise nouvelle = une ligne.
- Une séance Logisim dont le numéro n'est dans aucune ligne de la table ne doit **pas disparaître** :
  la montrer (par exemple sous une carte « Autres ») et le garder par un test.
- Une entreprise sans séance visible pour l'élève n'a pas de carte. L'enseignant voit toutes les cartes.
- `core/app.js` : `vueAccueil` (niveau 2 d'une rubrique, l. ~119) gagne un niveau « entreprise » pour la
  seule rubrique `logisim` ; l'état `rubriqueActive` se complète d'une entreprise active. Le retour de
  séance est aux lignes ~309 (`quitter() { vueAccueil(); }`) et ~345 (`retour`) : y garder l'entreprise.
  Un changement de session repart toujours de l'accueil (l. ~383-385).
- Le parcours (`verrou`, séances grisées) et l'étiquette enseignant (`cachee`) s'appliquent aux tuiles de
  la liste d'une entreprise exactement comme aujourd'hui.

## 5. Tests

- **Tests existants à réécrire (le dire à Tristan)** : ils cliquent `[data-rub="logisim"]` puis
  directement une tuile `[data-act=…]` — il faudra passer par le logo :
  `outils/test/spartoo.mjs` (l. ~52, ~264, ~360, ~505) et `outils/test-seances.mjs` (l. ~118, ~128).
  `outils/test/socle.mjs` (ordre des tuiles par rubrique, liste Logisim) lit le registre, pas l'écran :
  a priori inchangé, à vérifier. `outils/test/visibilite.mjs` : à vérifier.
- Nouveaux cas (bloc `socle` ou un bloc dédié) : les trois logos et rien d'autre sur la carte ; une
  entreprise à une seule séance montre la liste ; « Quitter » ramène à la liste de l'entreprise ;
  « ← LOGISIM » ramène aux logos ; un élève ne voit pas la carte d'une entreprise sans séance ouverte ;
  une séance au numéro inconnu reste visible ; aucune requête hors du domaine (logos locaux).
- Éprouver chaque nouveau test par un sabotage. Suite entière avant le push (`core/` et `styles/` touchés).

## 6. Critères de validation par Tristan

En local (`lancer.bat`, Ctrl+Maj+R) : (1) Logisim → trois logos ; (2) un logo → ses séances, avec son nom et
son métier en tête ; (3) Quitter une séance → retour à la liste de l'entreprise ; (4) en élève, seules les
séances `pret: true` ; en enseignant, toutes, étiquetées ; (5) lisible en thème clair et sombre ; (6) aucune
erreur dans la console.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
