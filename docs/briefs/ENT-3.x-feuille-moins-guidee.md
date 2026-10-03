# Brief de chantier — Feuille de calcul de moins en moins guidée (Boost ENT-3.1 → 3.4)

**Statut** : **reporté** (pas pour le 03/10 : trop de travail). À reprendre après la refonte de la carte d'ENT-3.1
(`docs/briefs/ENT-3.1-refonte-carte.md`).
**Date du brief** : 03/10/2026
**Maquette** : cliquable dans Cowork, 03/10/2026 : « Maquette tableur ENT-3.x » (arrêts cliqués → feuille, poids à
chercher dans le mail, onglets 3.1 / 3.2 / 3.4, tableau comparatif des données de la journée).

## 1. Décisions de Tristan (03/10/2026)

1. **Moins de guidage dans la feuille, séance après séance** :
   - 3.1 : comme aujourd'hui (étapes numérotées, phrase d'aide avec exemple, cellules colorées).
   - 3.2 : plus d'étapes numérotées ni d'exemples, seulement le nom de la grandeur ; conversion heures → minutes
     en **une seule case** ; (aides à la demande comptées dans le suivi : **proposées, non tranchées**).
   - 3.3 : feuille de la collègue Inès déjà remplie, avec une formule fausse à repérer (consigne en trois étapes).
   - 3.4 : aucune explication ; seules les lignes de résultat sont nommées ; **brouillon libre** à droite (non corrigé).
2. **Recherche d'information + saisie** : l'élève clique les arrêts (carte), ils apparaissent dans la feuille dans
   son ordre, **mais le poids n'est pas pré-rempli** : il le cherche dans la fiche du mail et le tape.
   Plus la séance avance, plus il y a de données à chercher : 3.1 le poids seul ; 3.2 poids + vitesse + temps par
   arrêt + départ + charge utile + train + limite du créneau (une phrase de consigne à lire dans le mail) ;
   3.4 idem, avec un mail rédigé de façon moins explicite et le **nombre de colis** en plus.
3. **Les données changent d'une séance à l'autre** (« aucun changement de donnée » déplaît à Tristan : même
   départ, même train, même vitesse). **Règle générale pour tous les scénarios à venir.**
   **Exception : deux séances jouées dans la même journée de travail** (3.2 et 3.3) gardent les mêmes données.

## 2. Valeurs proposées (construites, à recaler avec les vrais clients)

| Séance | Départ | Train | Vitesse | Temps par arrêt | Charge utile | Créneau |
|---|---|---|---|---|---|---|
| 3.1 | 13 h 00 | 16 h 10 | 12 km/h | 6 min | 180 kg | aucun |
| 3.2 (= 3.3) | 14 h 30 | 16 h 45 | 14 km/h (vélo électrique) | 5 min | 200 kg | avant 15 h 15 |
| 3.4 | 9 h 30 | 11 h 50 | 15 km/h | 4 min + 1 min par colis | 160 kg | avant 10 h 30 |

**Rien n'est tiré d'une source sur Boost** : tout est construit (à dire dans les livrables). ENT-3.2 et 3.3 ont
aujourd'hui départ 14 h 10, train 16 h 10, 12 km/h, 6 min, 180 kg, créneau 14 h 45 : le changement demande un
**recalage complet** de 3.2 (et donc de 3.3, qui lui est adossé).

## 3. Demandes au moteur (chantier moteur dédié, un seul à la fois ; **Opus**)

1. **Poids (et colis) non pré-remplis** : dans `tournee.js` (`grille.lignes`), les cases de poids des arrêts passent
   de valeur donnée à saisie `{ saisie: true, attendu: p.kg }`. Le total (`SOMME`) doit se corriger **par rapport à ce
   que l'élève a tapé**, sinon un poids faux donne un total « juste » contre l'attendu : décider du comportement.
2. **Temps de service selon les colis** (3.4) : aujourd'hui `horaire.service` est un nombre fixe par arrêt. Prévoir
   `service = { base: 4, parColis: 1 }` (ou une fonction), appliqué au calcul des arrivées, du créneau et de la
   jauge. Garder compatible avec les séances existantes.
3. **Brouillon libre non corrigé** (3.4) : zone de saisie annexe dans la grille, jamais jugée, qui ne gêne pas la
   lecture des cellules de résultat.
4. **Aides à la demande** (3.2, si retenues) : bouton par ligne, état enregistré dans la base de l'élève, lisible
   dans le suivi (jalon ou information, à décider).
5. Données de la journée **déclarées par la séance** (départ, train, vitesse, service, charge, créneau) et non
   partagées avec ENT-3.1 : vérifier que les séances ne lisent pas toutes `VELO` de `contenus/boost.js`.

## 4. Contenu et alertes

- `calibrer.mjs` à relancer pour chaque journée : garder « il faut écarter un client » et « l'ordre compte ».
  Choisir 3.4 avec de nouveaux clients et de nouveaux poids (pas seulement de nouvelles heures).
- Alerte « séance imminente / fichiers modifiés le jour même » à dire à Tristan avant tout push.
- Alerte 7 : des tests d'ENT-3.2, 3.3 et 3.4 seront réécrits (valeurs écrites à la main) : le dire.
- Supports (trames, corrigés) à régénérer pour toute séance dont les données changent.
- **Ne pas toucher à ENT-3.1 ici** (la carte a son brief propre).

## 5. Questions ouvertes

- [ ] Aides à la demande en 3.2 : oui (comptées dans le suivi) / non.
- [ ] Brouillon libre de 3.4 : acceptable avec des lignes de résultat fixes ?
- [ ] La distance de la tournée reste-t-elle lisible en 3.4 (jauges réduites aux limites) ? À vérifier dans le moteur.
- [ ] 3.4 : valeurs (matinée, 160 kg, colis) à confirmer avec Tristan avant de construire.

## 6. Moteur touché et travail en parallèle *(ajouté le 03/10/2026)*

**Chantier D du plan Boost. Reporté ; le plus gros ; à lancer en dernier.**

| Partie | Fichiers touchés | Nature |
|---|---|---|
| Poids / colis saisis par l'élève (non pré-remplis) | `core/types/tournee.js` (`grille.lignes`), `core/types/grille.js` (correction du total sur ce qu'il a tapé) | **moteur** |
| Temps aux arrêts selon les colis (3.4) | `core/types/tournee.js` (`horaire.service`) | **moteur** |
| Brouillon libre non corrigé (3.4) | `core/types/grille.js`, `styles/base.css` | **moteur** |
| Aides à la demande (3.2, si retenues) | `core/types/tournee.js`, base de l'élève, suivi (`core/prof.js` peut-être) | **moteur** |
| Journée propre à chaque séance (départ, train, vitesse, service, charge, créneau) | `contenus/boost-ent32.js`, `boost-ent34`…, `contenus/boost.js` (`VELO`) | contenu |
| Calage | `outils/carte/calibrer.mjs` | outil |

- **Peut se faire en même temps que** : le choix des **valeurs de chaque journée** et des **clients de 3.4** (script de calage, sans moteur) ; la rédaction des mails ; les trames.
- **Ne pas lancer en même temps** que A ou C (même `tournee.js`, `grille.js`). Un seul chantier moteur à la fois.
- **Interaction avec C** : voir `ENT-3.2-imprevu.md` §12 (qui passe d'abord, et le recalage de l'imprévu).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
