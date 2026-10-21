# Coordination du chantier E-7 « palettier à adresse donnée » (ENT-8.11 à 8.14) — décisions du chef de chantier

**Date** : 21/10/2026 au soir. **Qui décide** : Claude (Fable), chef de chantier, sur délégation de Tristan (« chef de
chantier, tu délègues toujours »). Les sous-agents construisent (Opus : lots 1, 4, 5 et les séances en guidage ; Sonnet :
lots 0, 2, 3, 6, correctifs, tests, doc) ; Fable relit les diffs, commite par nom et pousse. **Ce fichier est la mémoire
du chantier** : ce qu'il faut pour reprendre si la conversation s'arrête. Le *quoi* est dans les briefs ; le *comment* et
les questions tranchées en route sont ici.

Références : `docs/briefs/MOTEUR-palettier-adresse-donnee.md` (brief moteur), `MOTEUR-palettier-adresse-donnee-etat-des-lieux.md`
(état des lieux du 21/10, 14 décisions de Tristan), `ENT-8.11-action-ranger.md`, `ENT-8.12-action-inventaire-tournant.md`,
`ENT-8.13-action-palette-a-cote.md`, `ENT-8.14-action-evaluation-stock.md` (tous corrigés par Cowork le 21/10 au soir),
`docs/decisions.md` (ligne du 21/10 « palettier à adresse donnée »), `docs/chantiers.md` (E-7).

## 1. Règles de conduite (celles des chantiers Action et Pelleau)

- **Aucun sous-agent ne commite ni ne pousse.** Fable commite par nom à chaque compte rendu, pousse quand l'arbre est propre
  et la suite verte.
- Un sous-agent n'écrit que dans les fichiers de sa mission ; deux sous-agents n'écrivent jamais le même fichier en même
  temps (`outils/test.mjs`, `activites/index.js`, `CREDITS.md` : par **ajout de ligne** seulement).
- **Un seul lot à la fois dans `core/types/entreprise.js`, `core/types/entrepot.js`, `core/types/terminal.js`,
  `styles/entrepot.css`** (fichiers sensibles).
- Ports des serveurs de test : **8120** (lot 0), 8121 (lot 1), 8122 (lot 2), 8124 (lot 4), 8123 (lot 3), 8125 (lot 5),
  8126 (lot 6), 8131 à 8134 (ENT-8.11 à 8.14). Un processus s'arrête par PID, jamais par nom.
- Les constructeurs rendent des captures 1366 × 768 que Fable regarde avant de commiter ; chaque cas de test est éprouvé
  dans les deux sens (sabotage → cas tombé) et le compte rendu le dit, en VÉRIFIÉ / SUPPOSÉ.
- Interdit aux sous-agents : ajouter les fichiers de Cowork au commit (`docs/briefs/ENT-*`), arrêter un processus par son
  nom, réécrire un cas de test existant sans le dire.

## 2. Ordre et dépendances (décision de Tristan, un lot à la fois)

| Ordre | Lot | Modèle | Arrêt pour Tristan ? |
|---|---|---|---|
| 1 | **0** — entrepôt tiré par élève (fonction, comme le quai) ; base lisible par la vue | Sonnet | non |
| 2 | **1** — mode `palettier` (fichier à part), vue de près, cariste, « À monter », signaler, Valider qui fige, jalons | Opus | **oui : page d'essai** |
| 3 | **2** — scanner (terminal « Terminal » sans voix, mode journal, `scan`, `ouSystemeCroit`) | Sonnet | **oui : page d'essai, deux variantes** |
| 4 | **4** — compter à l'aveugle (cartons dessinés sortis de la préparation, recomptage, `ecartsConfirmes`, travée sans poids) | Opus | non (captures) |
| 5 | **3** — adresse prise / adresse libre / poser sans scanner | Sonnet | non |
| 6 | **5** — le lendemain (phases, palette de Kevin, nuit, ouvertures, transfert) | Opus | non (captures) |
| 7 | **6** — évaluation en copie, phases ranger / compter, `rendCopie: false`, plan par site | Sonnet | non |

Les séances se construisent dès que leurs lots sont verts : ENT-8.11 après le lot 2, ENT-8.12 après le lot 4, ENT-8.13
après le lot 5, ENT-8.14 après le lot 6. Une séance peut se construire **pendant** le lot suivant (fichiers disjoints) ;
un bloc de tests par séance (`action-811` … `action-814`), bloc moteur nouveau `palettier` (alerte 7).

## 3. Décisions du chef sur ce que les briefs laissent ouvert

1. **Ids du recompte (ENT-8.12 §11 n° 1, « à confirmer à la construction »)** : la vue rend `compte-<rang>` et
   `recompte-<rang>` ; une adresse de la liste peut déclarer une clé (`cle: 'manque'`) qui remplace le rang dans
   `recompte-<cle>` seulement. ENT-8.12 pèse `recompte-manque` et `recompte-surplus` ; les comptes restent `compte-1` …
   `compte-6`. Sans clé, rien ne change.
2. **Poids à 5/6 de point (ENT-8.12 §11 n° 2)** : le constructeur du lot 4 vérifie si le contrôle « somme = 20 » tolère
   des décimales qui ne tombent pas juste ; s'il refuse, **on le dit à Tristan avant de toucher aux poids**.
3. **Recomptage en copie (ENT-8.14 §11 n° 4, « reste à dire »)** : tranché par le n° 1 du même paragraphe : le Terminal le
   propose en copie comme en séance de travail, aucun poids dessus.

## 4. Suivi

| Lot / séance | État | Commit |
|---|---|---|
| 0 | lancé le 21/10/2026 (Sonnet) | — |

## 5. Alertes à dire à Tristan à la livraison

- **7** : `outils/test.mjs` touché (bloc `palettier`, blocs `action-811` à `action-814`) ; `outils/test/socle.mjs`
  (`ATTENDU_CAP`) si le socle l'exige.
- **8** : quatre activités ajoutées (ENT-8.11 à 8.14).
- **9** : Action est réelle ; ce qui est construit (Samia, Kevin, Julie, Yanis, plans, plaques) est dit dans les comptes rendus.
