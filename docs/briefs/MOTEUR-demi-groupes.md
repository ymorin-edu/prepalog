# Brief de chantier — MOTEUR : demi-groupes dans une classe (1L → 1L1 / 1L2)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md puis implémente le brief docs/briefs/MOTEUR-demi-groupes.md. Annonce la durée et dis-moi avant de coder si tu vois un point qui contredit le code.
> ```

**Statut** : livré (06/10/2026)
**Date du brief** : 05/10/2026
**Modèle** : Opus (touche `core/app.js` et la visibilité des séances pour les élèves).
**Durée estimée par Cowork** : 3 à 4 h, dont la moitié en tests (ouverture et bases partagées, élève par élève).

## 1. Besoin et décisions de Tristan (05/10/2026)

La classe de 1L est coupée en deux demi-groupes (1L1 et 1L2) qui ne travaillent pas toujours en même temps.
Aujourd'hui un élève n'a qu'un groupe (= la classe) : impossible de dire à quelle moitié il appartient.

Décisions :

1. **Noms libres**, déclarés par l'enseignant pour chaque classe dans l'onglet **Groupes** (« 1L1, 1L2 » ; deux ou
   plus). Renommer un demi-groupe ne doit rien casser.
2. **Affectation dans « Comptes élèves »** : une liste déroulante par élève (« — », 1L1, 1L2), à côté de Niveau et
   Tiers-temps, enregistrée au changement, sans redessiner (même mécanique que `regler()` : un refus remet la valeur).
3. Le demi-groupe sert à **trois choses** :
   - **Filtrer le suivi** : Suivi de classe, Compétences et exports reçoivent un sélecteur « Toute la classe / 1L1 /
     1L2 ».
   - **Ouvrir par demi-groupe** : dans Conduite de séance, ouvrir (ou fermer) une séance pour 1L1 seulement.
   - **Bases partagées séparées** : une séance à `portee: 'groupe'` donne une base par demi-groupe.

## 2. Ce que le code fait déjà (lu le 05/10/2026, à revérifier)

- Le **groupe** Firestore (`groupes/{gid}`) porte déjà `ouverts: {aid: bool}` et `equipes: {uid: eqId}`. Les équipes sont
  le précédent exact : une table « élève → sous-ensemble » rangée **dans le document du groupe**, écrite par
  `B.majGroupe()`, lue par l'élève via `B.groupe()` (`core/app.js`, `eqId: objGroupe?.equipes?.[profil.uid]`).
- Chemin des bases partagées : `core/store.js`, `cheminDe()` → `jeux/{gid}/{aid}` (groupe), `jeux/{gid}/{aid}__{eqId}`
  (équipe).
- Visibilité : `activiteVisible(meta, groupe)` et `raisonCachee()` dans `core/niveaux.js`, appelés par `core/app.js`.

## 3. À construire

### Stockage (dans le document du groupe, comme `equipes`)

- `demis: [{ id: 'd1', nom: '1L1' }, { id: 'd2', nom: '1L2' }]` — l'**id** est technique et stable (jamais le nom :
  noms libres, renommables, peuvent contenir des caractères interdits dans un chemin RTDB).
- `demiDe: { uid: 'd1' }` — affectation des élèves. Absent = aucun demi-groupe.
- `ouvertsDemi: { d1: { aid: bool } }` — réglages d'ouverture propres à un demi-groupe.

Pourquoi dans le groupe et pas dans le profil élève : un élève peut appartenir à plusieurs groupes (tableau `groupes`),
son demi-groupe dépend de la classe. Et **aucune règle Firebase ne change** (à vérifier, voir §4).

### Onglet Groupes

Pour chaque classe : un champ « Demi-groupes » (ajouter, renommer, retirer). Retirer un demi-groupe : voir §4.

### Comptes élèves

Colonne « Demi-groupe » (liste déroulante) seulement si la classe a des demi-groupes. L'export de la liste d'élèves
gagne cette colonne.

### Conduite de séance

- En haut, un sélecteur « Réglages pour : Toute la classe | 1L1 | 1L2 » (absent si pas de demi-groupes).
- **Règle de priorité** : pour un élève de d1, `ouvertsDemi.d1[aid]` s'il est défini, sinon le réglage de la classe
  (`ouverts[aid]`, puis le défaut par niveau / `ouverture: 'prof'`). « Toute la classe » reste donc le réglage par
  défaut, le demi-groupe ne fait que le contredire.
- Sous un demi-groupe, chaque ligne dit d'où vient son état : étiquette « comme la classe » ou « réglé pour 1L1 », et
  un moyen de revenir au réglage de la classe (supprimer la clé, pas l'écrire à `false`).
- Les boutons **Semer / Geler / Réinitialiser** des bases partagées agissent sur la base du demi-groupe choisi (et sur
  la base de classe pour « Toute la classe »).
- L'enseignant, lui, continue de tout voir (règle du 02/10/2026) ; ses étiquettes « fermée / à ouvrir » doivent tenir
  compte du demi-groupe choisi.

### Côté élève

- `activiteVisible` / `raisonCachee` reçoivent le demi-groupe de l'élève (`groupe.demiDe?.[uid]`) et appliquent la
  priorité ci-dessus.
- `cheminDe('groupe', …)` : si l'élève a un demi-groupe → `jeux/{gid}/{aid}~{demiId}` (séparateur à choisir, distinct de
  `__` des équipes) ; sinon `jeux/{gid}/{aid}` comme aujourd'hui. `equipe` et `commun` ne changent pas.
- Rien ne change pour une classe sans demi-groupes (cas de toutes les classes actuelles).

### Suivi de classe, Compétences, exports

Sélecteur « Toute la classe / 1L1 / 1L2 » qui filtre les lignes élèves (et les moyennes affichées). Le nom du fichier
exporté porte le demi-groupe (`suivi-1L-1L1.csv`). Les résultats ne bougent pas : ils restent rangés par classe
(`travaux/{gid}/…`), le demi-groupe n'est qu'un filtre.

## 4. Points d'attention

- **Règles Firebase** : a priori aucune modification (le prof met déjà à jour tout le document du groupe ;
  `jeux/{gid}/$cle` accepte n'importe quelle clé). **À confirmer avant de coder** ; si une règle change, la publier dans
  la console (alerte 1).
- Conséquence connue : un élève de 1L1 peut techniquement lire la base partagée de 1L2 (même classe, même droit de
  lecture sur `jeux/{gid}`). Acceptable : c'est déjà le cas entre équipes. Le dire à Tristan.
- **Retirer un demi-groupe** (alerte 4) : ne rien laisser d'invisible. Ses bases `jeux/{gid}/*~{id}` sont effacées
  (confirmation qui le dit), `demiDe` et `ouvertsDemi` nettoyés ; ses élèves repassent « — ». `supprimerGroupe()` efface
  déjà tout `jeux/{gid}` : son ordre ne change pas.
- **Changer un élève de demi-groupe** en cours d'année : ses résultats ne bougent pas ; il passe sur la base partagée
  de son nouveau demi-groupe. Le dire dans la note sous le tableau.
- Élève sans demi-groupe alors que la classe en a : il suit les réglages de la classe et la base de classe. Le signaler
  dans Comptes élèves (« 3 élèves sans demi-groupe »), sans bloquer.
- Mode démonstration (`backend-demo.js`) : `majGroupe` est générique, rien à ajouter a priori.

## 5. Tests (nouveau bloc `demi-groupes`, une ligne dans `BLOCS` — alerte 7 si `outils/test.mjs` est touché)

- Classe sans demi-groupes : aucun sélecteur, aucune colonne, comportement identique (non-régression).
- Déclarer 1L1/1L2, affecter A à 1L1 et B à 1L2 ; ouvrir une séance `ouverture: 'prof'` pour 1L1 seulement → A la voit,
  B non ; « revenir au réglage de la classe » → les deux suivent la classe.
- Séance fermée pour la classe, ouverte pour 1L2 → seul B la voit (le demi-groupe contredit la classe).
- Base `portee: 'groupe'` : A écrit une ligne, B ne la voit pas ; un élève sans demi-groupe ne voit ni l'une ni l'autre.
- Renommer 1L1 en « 1L-A » : affectations, ouvertures et base intactes.
- Retirer 1L2 : sa base est effacée, **la base de 1L1 reste** (nommer ce qui reste), B repasse « — ».
- Filtre du suivi : sous 1L1, A seul ; l'export contient A seul.
- Éprouver chaque test dans les deux sens (sabotage de la priorité, du chemin, du filtre).

## 6. Compte rendu (à remplir par Claude Code)

**Livré le 06/10/2026** (Claude Code, Opus). Bloc de tests `demi-groupes` : 12 cas, éprouvés dans les deux sens
(priorité, chemin des bases, filtre du suivi, effacement au retrait : chaque sabotage fait tomber au moins un cas).

Ce qui a été fait, conforme au brief :

- **Stockage** dans le document du groupe : `demis`, `demiDe`, `ouvertsDemi`. Id technique `d` + horodatage (jamais
  réutilisé), nom libre (40 caractères au plus, unique dans la classe sans tenir compte des majuscules).
- **Groupes** : panneau « Demi-groupes de <classe active> » (ajouter, renommer au changement, retirer). On règle les
  demi-groupes de la classe **active** ; pour une autre classe, l'activer d'abord.
- **Comptes élèves** : colonne « Demi-groupe » (seulement si la classe en a), enregistrée sans redessiner, refus = valeur
  remise ; avis « N élèves sans demi-groupe » mis à jour en direct ; colonne dans l'export de la liste ; supprimer un
  élève retire aussi son affectation (rien d'invisible dans le groupe).
- **Visibilité** (`core/niveaux.js`) : `forcage(meta, groupe, demi)` applique la priorité demi-groupe → classe → niveau /
  `ouverture: 'prof'`. Une affectation à un demi-groupe disparu ne compte pas (l'élève suit la classe).
- **Conduite de séance** : sélecteur « Réglages pour », étiquettes « comme la classe » / « réglé pour 1L1 » + bouton
  « revenir au réglage de la classe » (supprime la clé). Sous « Toute la classe », une étiquette dit quel demi-groupe
  contredit la ligne (« ouverte pour 1L2 »). Semer / Geler / Réinitialiser agissent sur la base du demi-groupe choisi.
- **Accueil de l'enseignant** : une séance fermée à la classe mais ouverte à un demi-groupe dit « ouverte pour 1L2
  seulement ».
- **Bases** : `jeux/{gid}/{aid}~{demi}` ; élève sans demi-groupe et enseignant sous « Toute la classe » = base de classe.
  Retirer un demi-groupe efface ses bases (nouvelle fonction `B.effacerJeu`, dans les deux backends) **avant** de
  nettoyer le groupe : un effacement interrompu laisse le demi-groupe en place, on peut recommencer.
- **Suivi, Compétences, exports** : sélecteur « Élèves : » ; fichiers `suivi-<classe>-<demi>.csv`,
  `competences-<classe>-<demi>.csv`. Sous un demi-groupe, « Ramasser les copies » ne ramasse que ses élèves (l'autre
  moitié peut encore être en train de composer).

Décisions prises en route (reportées dans `docs/decisions.md`) :

1. **Un seul choix de demi-groupe pour Suivi, Compétences et Conduite de séance** : l'enseignant qui a 1L1 devant lui
   le choisit une fois ; il revient à « Toute la classe » quand on change de classe active.
2. **Ramassage des copies filtré** par le demi-groupe choisi.
3. Correctif au passage : Semer / Geler / Réinitialiser tiennent compte de `jeuId` (comme l'élève). Sans effet
   aujourd'hui (ACT-1 Magasin n'en a pas).

Vérifié : règles Firebase **inchangées** (l'enseignant met déjà à jour tout le document du groupe et a l'écriture sur
`jeux/{gid}` ; `~` est permis dans une clé RTDB) — rien à publier dans la console. Non couvert par la suite : le mode réel
(Firestore/RTDB), comme toujours ; `effacerJeu` en mode réel est un `remove()` sur un chemin que les règles ouvrent déjà
à l'enseignant.

Limite connue (acceptée par le brief) : un élève de 1L1 peut techniquement lire la base de 1L2 (même classe, même droit
de lecture sur `jeux/{gid}`), comme entre équipes. Seule ACT-1 Magasin a aujourd'hui une base de classe.
