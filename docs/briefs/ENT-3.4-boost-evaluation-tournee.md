# Brief de séance — ENT-3.4 Boost « Évaluation de la tournée »

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 02/10/2026
**Ordre de travail conseillé** : **2/3** — après ENT-3.3, avant ENT-2.4. Tout en `pret: false`, commits fréquents.
**Conversation d'origine** : « Prepalog — chantier A » (cadrage : `prepalog-boost-cadrage-ent32-34`, section « Chantier A — reprise du 02/10 » de `prepalog-chantiers-en-cours`)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-3.4 |
| `id` (jamais modifié ensuite) | à choisir en suivant les `id` voisins d'`activites/index.js` (ex. `boost-evaluation`) — **le noter dans le compte rendu** |
| Titre / desc | « Boost — évaluation de la tournée » / une journée neuve, seul, sans retour : tu rends ta copie |
| Rubrique | simulog |
| Entreprise | Boost (Nîmes), vélo-cargo — `contenus/boost.js` |
| Niveau(x) | 1re Bac Pro Logistique |
| Compétence(s) | C2.4 Organiser une tournée de livraison |
| Temps pédagogique | **évaluation** (coefficient 3 au bulletin) |
| Notation | **copie rendue** : `meta.copie: true` ET `copie: meta.copie` passé à `creerEntreprise` (déclaré d'un seul côté → avis d'erreur à l'écran, voulu) |
| Barème | jalons réussis / jalons, calculé **à la remise** (ou au ramassage), figé |
| `transportId` | **nouveau et propre : `'boost-ent34'`** |
| `pret` à la livraison | **false** |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

Même règle qu'ENT-3.3 : tout est dans `contenus/boost.js`, rien d'ajouté sans vérification. **Adresses des clients : réelles** (Base Adresse Nationale), **clients,
poids, noms et créneau : inventés** — le dire en tête du contenu. Pas de document imitant un document commercial réel.

## 3. Objectif pédagogique

L'élève **organise seul** une tournée complète sur une journée **qu'il n'a jamais vue** : situer les nouveaux clients, arbitrer la charge, tenir le train et le
créneau, chercher un trajet court. **Aucune notion nouvelle** (doctrine : on n'évalue que ce qui a été vu en guidage et entraînement). Il ne voit **aucun jalon**
pendant le travail et ne peut rendre sa copie **qu'une fois**.

## 4. Déroulé

1. **Mail + accueil** (sans total ni masse à écarter, comme ENT-3.2).
2. **Repérage** des nouveaux clients sur la carte réelle (`carte.js`). **Décision de Tristan (02/10) : les clics sur une mauvaise rue comptent dans la note** (`plan.essais`),
   **en évaluation seulement**. Le repérage garde son refus des mauvaises rues.
3. **Feuille de calcul** : même structure qu'ENT-3.2 mais **sans bouton « Vérifier »** (copie : valeurs reportées lues à la remise).
4. **Tournée** : jauges **muettes** (limites seulement), **aucun verdict** (ni « dépassée », ni « créneau raté », ni « limite respectée »), report « Enregistrer mes résultats »
   **sans juste/faux ni refus**.
5. **« Rendre ma copie »** : une seule remise, note figée ; ensuite l'écran affiche **« Copie rendue » sans note** (décision de Tristan, 02/10).
6. **Côté enseignant** : bouton « Ramasser les copies » (copies non rendues notées à ce moment) et « Rouvrir » une copie — déjà livrés (chantier A). Rien à construire.

## 5. Jalons / notation

Les jalons d'une évaluation **lisent les valeurs reportées** (`tournee.report`, `grille.cases`) et le bilan (`VTOUR.bilan`), **jamais `valide` ni `juge`** (jamais posés en copie).
Proposition — **calquée sur ENT-3.2**, 8 jalons (à confirmer, question n° 3) :

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | `reperage` : nouveaux clients tous posés ET essais ratés ≤ seuil | `plan.places`, `plan.essais` | **seuil à fixer par Tristan** (question n° 2) ; rien posé = ko |
| 2 | `choix` : poids à écarter juste **par formule** ET le bon client seul à quai | `grille.cases` + `bilan` | un autre client à quai = ko même sans calcul |
| 3 | `charge` : charge ≤ charge utile | `bilan` | |
| 4 | `horaire` : train pris | `bilan` | exige départ ET arrivée posés |
| 5 | `creneau` : créneau tenu | `bilan.creneauRate` | exige le départ posé |
| 6 | `formules` : calculs de la feuille justes | `grille.cases` | une formule fausse ne fait tomber que ce jalon |
| 7 | `trajet10` : tournée qui **tient tout** puis ≤ 10 % de la meilleure | optimum **recalculé** (`optimum()` de la séance, 5 040 ordres) | tournée qui ne tient pas tout = ko |
| 8 | `trajet5` : idem à ≤ 5 % | idem | |

**Ne rien faire ne rapporte rien** (test). La note n'existe qu'à la remise ; avant, le suivi enseignant montre « en cours ».

## 6. Contenu (données)

Fichiers à créer : `contenus/boost-ent34.js`, `activites/boost-ent34.js` (+ `export const noter = (db) => moteur.noter(db);`, sans quoi « ramasser » répond
« cette activité ne sait pas se noter »), `outils/carte/boost-ent34.json` (journée), `contenus/boost-ent34-carte.js` (**généré**, jamais écrit à la main).

**Une journée NEUVE** (≠ ENT-3.2 et ENT-3.3) — **construire avec le même outillage qu'ENT-3.2** :

- `python outils/carte/construire.py outils/carte/boost-ent34.json` (déterministe ; requiert `shapely`, et les **sources brutes** de la carte — 5 Mo,
  hors dépôt : Drive `essai-plan-osm-sources\`, à copier dans `outils/carte/sources/` ou via `CARTE_SOURCES=`) ;
- **géocodage des adresses** par la Base Adresse Nationale (`api-adresse.data.gouv.fr`, type `housenumber`, score ≥ 0,97) : le conteneur de Cowork n'y accède pas, **le PC de
  Tristan oui** — à faire par Claude Code en local ;
- le build **refuse** un client hors de l'IRIS annoncé, une rue sans nom entier lisible, un client dont la rue la plus proche n'est pas la sienne (garde-fous existants : ne pas les contourner) ;
- **calage** : adapter `outils/carte/calibrer.mjs` à la nouvelle journée (**vérifier s'il est paramétrable ; sinon lui ajouter un paramètre — c'est un outil, pas le moteur**).
  Le calage doit **reproduire le profil d'ENT-3.2** : un seul client écartable pour passer sous la charge utile, **le trajet le plus court rate une contrainte** (contre-intuitif),
  une minorité d'ordres tient tout (ordre de grandeur : 5 à 10 %), un optimum qui diffère du plus court. **Même types de contraintes qu'en ENT-3.2, aucune nouvelle.**
- **vérifier le poids du fichier généré** (ENT-3.2 : ~530 Ko) : il ne doit se charger que pour cette séance.

## 7. Demandes au moteur (si le moteur ne sait pas faire)

Normalement **aucune** : copie rendue, carte, tournée, créneau, feuille sont livrés. **À vérifier en lisant le code avant d'écrire** : en copie, le repérage compte bien les
essais ratés dans `plan.essais` sans les afficher en verdict ; si ce n'est pas le cas, l'inscrire ici et demander un chantier moteur dédié.

## 8. Tests attendus

Bloc `boost`, cas préfixés **« ENT-3.4 »**. **Ajouter le test du suivi enseignant que le chantier A a laissé en attente** (« tant qu'aucune évaluation n'est inscrite »).

- journée : données vérifiées (client sur sa rue, rue la plus proche = la sienne, case recalculée) ; **calage tenu** (le profil ci-dessus) ;
- pendant l'épreuve : **rien ne remonte au suivi**, aucun verdict à l'écran, report sans juste/faux, feuille sans « Vérifier » ;
- remise : **une seule** (la 2ᵉ est refusée), note figée, `ecrireScore` ne la remplace plus, écran « Copie rendue » sans note ;
- **ramasser** une copie non rendue → note calculée et marquée « ramassée » ; **rouvrir** → l'élève peut reprendre ; ensuite re-remise possible ;
- jalons : copie vide = 0 ; copie juste = tout ; **clics sur mauvaise rue** font baisser `reperage` ; `trajet10`/`trajet5` recalculés (jamais recopiés) ;
- `test-seances.mjs` vert ; liste Simulog de `socle.mjs` + ENT-3.4 ; **émulateur Firebase** : les 7 cas de `outils/test-regles.mjs` (`outils\tester-regles.bat`) n'ont jamais tourné — **ne pas s'appuyer dessus tant que Tristan ne les a pas lancés**.

**Sabotages à éprouver** : verdict visible pendant l'épreuve ; 2ᵉ remise acceptée ; essais ratés non comptés ; optimum recopié ; note recalculée après remise ; jalon qui lit `valide`/`juge`.

## 9. Supports pour les élèves

- Trame élève : **non** (le travail se fait à l'écran) ; Corrigé enseignant : à écrire après validation ; Diaporama : non.

## 10. Critères de validation par Tristan

`outils/essai-carte.html?copie` puis la séance dans le site : (1) la journée est **différente** de celle d'ENT-3.2 et a **le même niveau de difficulté** (j'essaie : le plus court ne
tient pas) ; (2) **aucun jalon, aucun verdict** pendant le travail ; (3) « Rendre ma copie » : une fois seulement, puis plus de note à l'écran ; (4) côté prof : ramasser, rouvrir ;
(5) un clic sur une mauvaise rue **fait perdre** quelque chose à la fin ; (6) aucune erreur console.

## 11. Questions ouvertes

- [ ] **1. Quels nouveaux clients, quelle ville de quartiers ?** Même zone que ENT-3.2 (Écusson / Jardins de la Fontaine, sources déjà là) mais **autres adresses** — *recommandé* — ou autre quartier (nouvelle donnée IRIS) ?
- [ ] **2. Seuil du jalon `reperage`** : tous posés ET au plus *n* clics ratés ? *Proposition : n = 3.* Les clics ratés comptent déjà dans la note (décision du 02/10) ; reste à dire **combien** coûtent.
- [ ] **3. 8 jalons ou autre découpage ?** (L'évaluation vaut coefficient 3.)
- [ ] **4. Faut-il un report de la distance totale / de l'heure d'arrivée** (cases de report) en plus de la feuille ? *Par défaut : la feuille porte tout.*
- [ ] **5. Date de mise en ligne** : la copie rendue a-t-elle été jouée en vrai par un élève ? *(non : à tester avec un compte élève avant `pret: true`.)*

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** : *(hash + message)*
- **Reste ouvert** :
