> *Copie du 02/10/2026 de la fiche `claude/prepalog-nomenclature.md` du projet Claude PREPALOG
> (source de conception : le projet). Voir `docs/LISEZMOI.md`. Le tableau « État des activités »
> date du 01/10 : le registre `activites/index.js` fait foi pour l'état actuel (ENT-2.x Cdiscount et
> ENT-3.x Boost y ont été ajoutés depuis).*

# Prepalog — nomenclature des activités

Arrêtée le 30/09/2026, avant toute migration de contenu. À respecter pour chaque activité
ajoutée. **Règle d'ordre inversée le 01/10/2026**, et **numéros à deux niveaux ouverts le
même jour** (voir « L'ordre d'affichage »).

## Trois notions distinctes

| Champ | Rôle | Peut changer ? |
|---|---|---|
| `id` | clé technique, écrite dans les chemins Firestore et Realtime Database | **jamais** |
| `code` | ce que l'élève lit sur la tuile (`ACT-1`), et ce qui décide de son rang | librement |
| `rubrique` | la pastille d'accueil où l'activité s'affiche | librement |

Conséquence pratique : on peut renommer un module, le recoder et le déplacer de pastille
sans perdre un seul score d'élève. On ne peut **jamais** changer son `id`.

Format de l'`id` : minuscules, tirets, sans numéro ni préfixe de rubrique — `magasin`,
`quiz-flux`, `reception-plateforme`. Le fichier de l'activité porte le même nom :
`activites/<id>.js`.

## Préfixes de code — par nature de travail

| Préfixe | Nature | Exemples |
|---|---|---|
| `DEC` | découverte, notions | DEC-1 La chaîne logistique |
| `ACT` | outil ou activité métier | ACT-1 Base du magasin, ACT-2 Préparation, ACT-3 Réception, ACT-4 Agenda, ACT-5 Flotte |
| `ENT` | environnement d'entreprise complet (LogiSim) | ENT-1.1 Spartoo réception, ENT-1.2 Spartoo préparation, ENT-1.3 Spartoo traçabilité, ENT-2.1 TechPro… |
| `TAB` | tableur | TAB-1 Excel pas à pas, TAB-2 Stocks, TAB-3 Calculs commerciaux, TAB-4 CAP OL, TAB-5 Inventaire |
| `REF` | exercices par compétence du référentiel | REF-1 à REF-3 (pôles 1, 2, 3) |
| `SCE` | scénario évalué | SCE-1 Yves Rocher, SCE-2 Foot Locker, SCE-3 Bouygues, SCE-4 Brasseries, SCE-5 Réception plateforme |
| `QUI` | quiz d'entraînement | QUI-1 Calcul, QUI-2 Géo, QUI-3 Français, QUI-4 CACES, QUI-5 Flux logistiques |
| `MES` | messagerie | MES-1 |

Le préfixe dit **ce que l'élève fait**, pas de quel domaine il s'agit. C'est ce qui permet
à un scénario couvrant réception *et* stockage de garder un code clair, et à l'ajout d'un
domaine de ne rien casser.

`ENT` ne prête pas à confusion avec l'ancien `ENT-1 Calcul` de la Suite Logistique
(entraînement) : ces quiz passent sous `QUI`, le préfixe est donc libre.

Motif du changement : l'ancien système mélangeait nature (`OP`, `C`, `EC`, `ENT`, `T`) et
niveau (`2DE`) ; le code ne correspondait plus à la pastille (`chaine` en catégorie
`operations` mais affiché dans Logistique) ; et `C-1` à `C-7` recouvrait deux choses
différentes (apprendre Excel / pôles de compétences).

### Numéros à deux niveaux — `ENT-1.1`

Idée de Tristan, le 01/10/2026. Un environnement d'entreprise n'est pas *une* activité mais
**une suite de séances dans la même entreprise, sur la même base**. Le numéro le dit :

> **premier nombre = l'entreprise, second = la séance.**

Spartoo est donc `ENT-1.1` (réception), `ENT-1.2` (préparation), `ENT-1.3` (traçabilité), et
TechPro Distribution prendra `ENT-2.1`, `ENT-2.2`… *(TechPro est abandonnée depuis le 02/10 ;
`ENT-2.x` est utilisé par Cdiscount, `ENT-3.x` par Boost.)*

Ce que ça règle : avec la numérotation à plat, les trois séances Spartoo occupaient `ENT-1`,
`ENT-2`, `ENT-3`, et TechPro aurait dû commencer à `ENT-4` — un numéro qui ne dit rien de
l'entreprise — ou obliger à renuméroter Spartoo. Ajouter une séance au milieu d'une séquence
posait le même problème. À deux niveaux, chaque entreprise a son espace de numérotation.

La forme à deux niveaux n'est pas réservée à `ENT` : le tri l'accepte pour n'importe quel
préfixe, et un troisième niveau marcherait aussi. À n'utiliser que là où il y a vraiment une
hiérarchie, sinon un numéro simple reste plus lisible pour l'élève.

## L'ordre d'affichage

**L'affichage suit les numéros de module.** Dans une rubrique, TAB-1, puis TAB-2, TAB-3,
puis TAB-5 ; ENT-1.1, ENT-1.2, ENT-1.3. Pour déplacer une activité, on change son `code` —
on ne déplace pas sa ligne dans `ACTIVITES`.

Le tri est fait par `ordonner()` dans `activites/index.js`, **avant** le remplissage du
cache : l'accueil, les colonnes du suivi de classe et la conduite de séance héritent donc
tous du même ordre. Trois précisions :

- **les familles gardent l'ordre de la liste `ACTIVITES`.** Le rang d'une famille est celui
  de sa première apparition. Sans cela, un tri alphabétique ferait passer `QUI` après `TAB`
  et casserait la progression pédagogique de l'accueil ;
- **la comparaison se fait segment par segment, pas comme un décimal.** `ENT-1.10` doit
  venir après `ENT-1.9`, alors que `1.10 < 1.9` si on les lit comme des nombres à virgule.
  C'est le piège classique des numéros de version, et il se déclencherait dès la dixième
  séance d'une entreprise. Un numéro plus court passe avant celui qui le prolonge : `ENT-1`
  avant `ENT-1.1` ;
- un `code` hors forme `XXX-9` ou `XXX-9.9` garde sa place, et deux activités de même code
  gardent l'ordre de la liste (`sort` est stable). Une coquille dans un `code` ne doit pas
  faire disparaître une activité de l'accueil.

Une rubrique qui liste des `ids` explicites (`magasin`) garde cet ordre : c'est une liste
écrite à la main, pas une famille.

### Pourquoi la règle a été inversée le 01/10/2026

Jusque-là, c'était le contraire : l'ordre était celui de la liste `ACTIVITES`, et les
numéros étaient censés le suivre — réordonner les tuiles imposait de renuméroter les codes.

Ça n'a pas tenu. `TAB-5 Inventaire` avait été ajouté avant `TAB-1` et `TAB-2`, et se
retrouvait **affiché en premier** dans la rubrique Tableur, dans les colonnes du suivi de
classe et dans la conduite de séance : un seul oubli, visible à trois endroits, et rien
pour le signaler. Et la règle demandait de renuméroter TAB-5 en TAB-4 — un numéro déjà
réservé au CAP OL.

La règle inversée est plus solide pour trois raisons : le `code` est ce que l'élève lit sur
la tuile, donc c'est lui qui doit décider du rang ; déplacer un module devient un changement
de numéro au lieu d'un déplacement de ligne, qui est précisément l'opération qu'on oublie ;
et un trou dans la numérotation (TAB-3 puis TAB-5, parce que TAB-4 n'est pas migré) devient
inoffensif au lieu d'être une incohérence.

### Ce qui garde la règle

Le test **« rubriques : les activités sont rangées par numéro de module »** dans le bloc
`socle` de `outils/test/`. Il lit l'ordre calculé par le noyau pour chaque rubrique, exige que les
numéros croissent dans chaque famille, et porte deux repères explicites :
`TAB-1 TAB-2 TAB-3 TAB-5` et `ENT-1.1 ENT-1.2 ENT-1.3`. Son comparateur est écrit **à part**
de celui du noyau, exprès — un test qui réutiliserait la fonction qu'il vérifie ne vérifie
rien — et il contrôle au passage son propre comparateur sur `1.9` / `1.10`.

Éprouvé dans les deux sens, trois fois :

- rouge quand on remet TAB-5 avant TAB-1 *et* qu'on neutralise le tri (message :
  « rubrique Tableur : TAB-5 TAB-1 TAB-2 TAB-3 ») ;
- **vert quand le tri est là mais que la liste est en désordre** — c'est cet essai qui prouve
  que le tri fait le travail, et pas seulement le rangement de la liste ;
- en renommant les séances Spartoo en `ENT-1.1`, `ENT-1.10`, `ENT-2.1` pour simuler une
  dixième séance et une deuxième entreprise, l'ordre calculé reste
  `ENT-1.1 ENT-1.10 ENT-2.1`.

Le comparateur du noyau a aussi été éprouvé seul, sur son code tel qu'il est livré : séances
en désordre, deux entreprises, numéro court contre numéro long, familles, et code mal formé
conservé à sa place.

## Niveaux

`core/niveaux.js`. Quatre niveaux : `2de` (Seconde GATL), `1re` (Première Bac Pro),
`tle` (Terminale Bac Pro), `cap` (CAP Opérateur logistique).

**Un élève = un groupe = un niveau.** Le niveau est choisi à la création du groupe et
stocké sur le groupe (`groupes/{gid}.niveau`).

Une activité déclare `niveaux: ['2de', '1re']` — un ou plusieurs. Sans ce champ, elle vaut
pour tous les niveaux.

Visibilité, dans l'ordre (`activiteVisible()`) :

1. `ouverts[id] === false` → fermée, même si le niveau correspond ;
2. `ouverts[id] === true` → **ouverte, même hors niveau** ;
3. sinon, le niveau du groupe décide.

L'enseignant garde donc le dernier mot : dans « Conduite de séance », les activités sont
présentées en deux blocs, « Niveau du groupe » (cochées d'office) et « Autres niveaux »
(décochées, à cocher pour ouvrir). Une activité ouverte hors niveau porte une étiquette
orange « ouverte hors niveau ».

### Niveau par exercice

Un module qui porte une série d'exercices de difficulté inégale déclare un `niveaux` sur
**chaque exercice**, en plus de celui du module. Le `niveaux` du module dit à quelles
classes la tuile apparaît ; celui de l'exercice dit lesquelles le voient à l'intérieur.

Le moteur s'appuie sur `concerneNiveau(niveaux, niveauGroupe)` (`core/niveaux.js`) et sur
`ctx.niveauGroupe`, ajouté au contrat d'activité. Un exercice sans `niveaux` vaut pour
tous. L'enseignant voit toujours la série entière, chaque exercice étiqueté de son niveau :
il doit pouvoir préparer sa séance sans changer de compte.

Le barème suit : un élève est noté sur le nombre d'exercices **qu'on lui propose**, pas sur
le total du module. Le `max` part avec le score, le suivi de classe l'utilise.

## Trois façons d'être noté

| `notation` | Ce que montre le suivi | Exemple |
|---|---|---|
| absent | score automatique sur le barème | QCM, association, tableur |
| `'prof'` | une case de saisie, note posée à la main | scénarios sur Padlet |
| `'avancement'` | jalons franchis, `3 / 3` — pas une note | environnements d'entreprise |

`bareme` reste obligatoire dans les trois cas : c'est lui qui fait entrer l'activité dans le
suivi de classe.

## Champs de `meta`

```js
export const meta = {
  id: 'quiz-flux',            // jamais modifié
  code: 'QUI-5',              // affiché, et décide du rang dans la rubrique
  titre: 'Les flux logistiques',
  desc: 'Une phrase.',
  rubrique: 'quiz',           // pastille d'accueil
  niveaux: ['2de', '1re'],    // vide ou absent = tous niveaux
  competences: [],            // ex. ['C1.2', 'C1.3'] — pour le livret, plus tard
  bareme: 6,                  // présence = apparaît dans le suivi de classe
  notation: 'prof',           // absent | 'prof' | 'avancement' (voir ci-dessus)
  portee: 'eleve',            // 'eleve' | 'equipe' | 'groupe' | 'commun'
  tables: {},                 // pour le type tableau, et les séries d'exercices
  pret: true,
};
```

## État des activités au 01/10/2026

Dans l'ordre d'affichage, qui est celui des codes.

| id | code | rubrique | niveaux | portée |
|---|---|---|---|---|
| `chaine-logistique` | DEC-1 | logistique | 2de, 1re, CAP | élève |
| `magasin` | ACT-1 | magasin | tous | groupe |
| `quiz-flux` | QUI-5 | quiz | 2de, 1re | élève |
| `zones-entrepot` | QUI-6 | quiz | 2de, 1re, CAP | élève |
| `calculs-stock` | QUI-7 | quiz | 1re, Tle | élève |
| `excel-pas-a-pas` | TAB-1 | tableur | tous | élève |
| `excel-stock` | TAB-2 | tableur | 2de, 1re, Tle — et par exercice | élève |
| `calculs-commerciaux` | TAB-3 | tableur | tous | élève |
| `inventaire-tableur` | TAB-5 | tableur | 1re, Tle | élève |
| `yves-rocher` | SCE-1 | scenario | tous | élève |
| `foot-locker` | SCE-2 | scenario | tous | élève |
| `bouygues-telecom` | SCE-3 | scenario | tous | élève |
| `brasseries-gatinais` | SCE-4 | scenario | tous | élève |
| `reception-plateforme` | SCE-5 | scenario | tous | élève |
| `spartoo-reception` | ENT-1.1 | logisim | tous | élève |
| `spartoo` | ENT-1.2 | logisim | tous | élève |
| `spartoo-tracabilite` | ENT-1.3 | logisim | tous | élève |

**TAB-4 est réservé au CAP OL**, pas encore migré : le trou entre TAB-3 et TAB-5 est voulu.

Les trois séances Spartoo portaient `ENT-1`, `ENT-2`, `ENT-3` jusqu'au 01/10/2026 au soir.
Les `id` n'ont pas bougé, donc **aucun score d'élève n'est perdu** ; seules les étiquettes
changent, y compris dans les exports CSV déjà imprimés.

Reste à migrer : TAB-4 (CAP OL), les pôles de compétences (REF-1 à REF-3), les quiz
d'entraînement et les modules transport. *(TechPro Distribution : abandonnée le 02/10.)*
