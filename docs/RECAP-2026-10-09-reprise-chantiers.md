# Reprise des derniers chantiers de l'audit — écrit le 09/10/2026 pour la conversation suivante

> Page de relais entre deux conversations Claude Code. Elle dit où en est la feuille de route
> `docs/chantiers.md` à la fin du lot C, ce qui reste, qui décide quoi, et comment on a travaillé.
> La feuille de route fait foi ; cette page n'est qu'un résumé daté. Le message d'ouverture à coller
> dans la conversation suivante est à la fin.

## Où on en est (VÉRIFIÉ : commits sur `main`, suite 926/926 au dernier push)

- **Lots A, B et C livrés**, commités et poussés les 08 et 09/10/2026 (chantiers 1 à 6, 8 à 11, 13 à 18,
  plus 17 bis). Consoles Firestore et RTDB publiées le 09/10 **avant** le chantier 16.
- **Dernier commit** : `2e0b0a8` (décision ENT-5.3). Dernière suite entière : 926 cas verts (chantier 18).
- `docs/EN-COURS.md` est vide. Aucun fichier de `core/`, `styles/`, `activites/`, `contenus/` n'est modifié
  hors commit. Les fichiers modifiés ou non suivis qui restent dans `git status` sont à Cowork
  (`docs/briefs/ENT-6.*`, `docs/briefs/france-boissons/`, `docs/briefs/MOTEUR-vue-tournee-camion.md`,
  `.claude/`) : ne pas y toucher, ne pas les commiter.

## Console Firebase

- `database.rules.json` du chantier 16 **publié par Tristan le 09/10/2026** (après 16 h). `firestore.rules` inchangé
  depuis la publication du matin. Rien n'attend dans la console.

## Ce qui reste, dans l'ordre de la feuille de route

| # | Chantier | Attend | Modèle |
|---|---|---|---|
| 7 | Quota Spark (C9) : mesurer, puis supprimer les écritures inutiles | **La mesure de Tristan en console** après une vraie séance d'une heure. Ne pas lancer avant. | Sonnet |
| 12 | CAP OL et niveaux (C8) : référentiel, défaut de niveau d'un groupe, `TAB-4` en `niveaux: ['cap']` | **Le relevé du référentiel CAP OL par Cowork** (fiche). | Sonnet |
| 9c bis | `entreprise.js` : sortir cartes de messages, questions au fil, accueil, copie rendue (≈ 1 851 → ≈ 1 460 lignes) | « Plus tard » : quand les questions au fil seront stabilisées. Un seul chantier moteur à la fois. | Sonnet |
| 19 | Reliquats SCE / Spartoo (C15) : acter ou annuler la règle « Spartoo tel quel » | **Décision de Tristan** (ENT-1.1 refondue le 06/10 ; `COLORS`/`SHIP` déjà sortis du moteur par 9b). | — |
| 20 | Stratelog (C19) : troisième côté ou entreprise Simulog de plus ? | **Cadrage en Cowork.** Si troisième côté, s'appuyer sur `estSimulog(meta)` (chantier 10, livré). | Opus (cadrage) |

## Points ouverts relevés pendant le lot C (aucun ne bloque)

- `contenus/tab2-stocks.js` : 151 valeurs attendues **recopiées** de la Suite Logistique, sans générateur
  (TAB-1, 3 et 4 en ont un). Règle du projet : recalculé, pas recopié. **Décision de Tristan** : générateur
  (petit chantier à part, Sonnet) ou statu quo. Rien n'a été touché (alerte 5).
- ENT-5.3 : corrigé de trame **non branché**, décision de Tristan du 09/10 (option B). Clos.
- Contrastes vus pendant le chantier 15, non corrigés : boutons principaux de Boost en thème sombre (3,7 au
  lieu de 4,5), pastille blanche sur ambre en sombre (2,1), étiquettes « A · RAPIDE / B · MOYENNE / C · LENTE »
  du rangement Smoby en clair (3,2 à 3,8). Un petit chantier `styles/` + vues, Sonnet, si Tristan le veut.
- `ecriture: 'tous'` du magasin : le semis de l'enseignant écrit `meta/ouvert/{table}` (chantier 16), mais
  l'écran du tableau ne lit pas `ecriture` : un élève ne modifie que ses lignes, en démo comme en réel.
  Le faire lire ouvrirait les lignes des autres à chacun. **Décision de Tristan**, noté dans la fiche.
- Une mention de TechPro reste dans un commentaire de `core/types/entreprise.js` (ligne ~103) : suivi
  moteur d'une ligne, à glisser dans le prochain chantier qui touche ce fichier.
- Attentes fixes (`waitForTimeout`) non traitées dans les blocs transport (29), socle (25), inventaire (24),
  picard (16) : le chantier 13 n'a traité que boost, cdiscount, spartoo.
- `.claude/worktrees/` n'est ignoré que par `.git/info/exclude` (local à ce poste). Sans conséquence tant
  que personne ne fait `git add -A`.
- Le test d'`EN-COURS.md` (chantier 18) vérifie la forme et les chemins, pas qu'une session efface sa ligne.

## Comment on a travaillé (à reprendre tel quel)

- **Fable coordonne sans coder** ; **un sous-agent Sonnet par étape**, avec une consigne complète :
  fichiers autorisés et interdits, tests éprouvés dans les deux sens (sabotage noté avec son message),
  suite entière verte avant push, `git add` par nom, ligne dans `decisions.md`, état dans `chantiers.md`,
  inscription puis effacement dans `EN-COURS.md`, compte rendu de 15 lignes maximum en VÉRIFIÉ / SUPPOSÉ.
  Fable relit le diff des points qui comptent avant de dire « livré ». Opus seulement pour un cadrage.
- **Avant de lancer une étape** : dire à Tristan la durée prévue et ce qui la prend, si elle touche
  `outils/test.mjs` ou `commun.mjs`, et quels cas de test existants elle réécrit. **Une seule question à la
  fois**, avec les options et un conseil.
- **Preuves qui ont bien servi** : empreintes de rendu (HTML, styles calculés de chaque élément, PNG) avant
  et après sur des écrans à horloge et hasard figés ; séance factice ajoutée au registre pour prouver qu'un
  test ne dépend plus du nombre de séances ; deux suites lancées en parallèle.
- **Pièges rencontrés, à interdire aux sous-agents** :
  - `taskkill /im python.exe` (ou `node.exe`) coupe le serveur local de Tristan : arrêter un processus par
    son PID seulement.
  - `git pull --rebase` est refusé tant que les fichiers de Cowork sont modifiés dans l'arbre : faire
    `git fetch`, vérifier que `origin/main` n'a rien de neuf (`git status -sb` : pas de « behind »), puis
    pousser directement. Si « behind », s'arrêter et le dire.
  - Un sous-agent qui finit avec un travail de fond encore actif peut réécrire sa ligne d'`EN-COURS.md`
    après l'avoir effacée : vérifier `git status` après chaque compte rendu, retirer la ligne périmée.
  - Les pages d'essai `outils/essai-*.html` chargent les feuilles de `styles/` à la main : une feuille
    nouvelle doit y être ajoutée (le chantier 15 l'a fait pour les cinq feuilles créées).
  - Chercher avec `git grep`, jamais `grep -r` (copies du dépôt dans `.claude/worktrees/`).

## Message d'ouverture à coller dans la conversation suivante

```
Coordination des derniers chantiers de l'audit (Prepalog). Lis CLAUDE.md en entier, puis
docs/RECAP-2026-10-09-reprise-chantiers.md (où on en est, ce qui reste, pièges), puis docs/chantiers.md
(la feuille de route fait foi). Lance git status et lis docs/EN-COURS.md : si une autre session écrit
dans le dépôt, dis-le-moi avant tout. Les fichiers modifiés de docs/briefs/ et .claude/ ne sont pas à toi.
Même façon de travailler que pour les lots B et C : tu coordonnes sans coder, un sous-agent Sonnet par
étape avec une consigne complète, compte rendu de 15 lignes maximum, relecture du diff avant de me dire
« livré », VÉRIFIÉ et SUPPOSÉ distingués, une seule question à la fois. Interdis aux sous-agents
d'arrêter un processus par son nom et de commiter les fichiers de Cowork.
Aujourd'hui : [7 — voici ma mesure en console : …] / [12 — Cowork a posé le relevé CAP OL dans … ] /
[19 — ma décision sur Spartoo : …] / [20 — cadrage Stratelog] / [tab2-stocks : générateur oui/non].
Annonce-moi la durée prévue et ce qui la prend, puis lance.
```
