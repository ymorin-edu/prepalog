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

### Décisions prises après l'audit des quatre briefs (sous-agent Sonnet, lecture seule, 21/10 au soir) — à corriger par Tristan à l'écran

4. **Noms des gestes publiés par le mode `palettier`** (aucun lot ne les nommait ; un `apresGeste` sur un nom non publié
   empêche la séance de s'ouvrir). Tous préfixés `entrepot:<id>:` et inscrits dans `signaux` : `prendre:<P>` (palette prise
   en réception), `poser:<P>`, `confier:<P>`, `signaler:<P>`, `occupe:<P>` (lot 3), `scan:<P>` (second scan réussi, lot 2),
   `valider` (« Valider mon rangement », remplace le `verifier` écrit dans ENT-8.11 §4), `ouvrir` (toute ouverture
   d'emplacement de près, publié à chaque fois : « première ouverture » = premier `apresGeste`), `compte:<rang>` (compte
   confirmé, lot 4), `compte:fin` (« Terminer le comptage »), `phase:<nom>` (passage à une phase, lot 5), `trouvee`,
   `transfert` (lot 5). Le lot qui crée un geste l'écrit dans `activites/FICHE-SEANCE.md` avant de rendre.
5. **Jalons du lot 1** : `place-<P>`, `signale-<P>`, `pasPoseHaut`, et **`charge`** (garde : aucune palette posée ou confiée
   au-delà d'une plaque, compté seulement si toutes les palettes sont traitées ; ENT-8.11 §5 le pèse 1 sans le nommer).
   Un jalon « sans poids » se déclare `poids: 0` (un jalon sans `poids` vaut 1 : `entreprise.js:430`). Les décimales
   s'écrivent telles quelles en code (`5/6`, jamais `0,83`) : la somme est contrôlée à 1e-6.
6. **Pas de plaque de charge au sol** : le niveau 1 n'a ni plaque ni limite (`entrepot.js:167`) ; les « 3 000 kg / N1 » des
   briefs 8.11 et 8.14 ne se codent pas, et « charge du niveau 1 respectée » n'existe pas.
7. **Une erreur ne se paie qu'une fois** : ENT-8.13, « C'est la faute de Kevin » ne coûte que la forme (la ligne « ce qui
   s'est passé » reste neutre) ; ENT-8.14, `adresseLibre-P5` = adresse libre demandée **et** palette rangée là, le scan
   n'est jugé que par `scan-P5` ; « signaler P1 à tort » coûte `place-P1` (décision 6 de Tristan), pas un `signale-P1`.
8. **Fiche des écarts (ENT-8.12, 8.14)** : les jalons vont **par rang de ligne** de la fiche de l'élève (`ecart-1`,
   `ecart-2` : « je le signale » puis « cause »), titre calculé par `titreBilan` ; une fiche sans ligne = faux.
   `ecartsConfirmes(db, P)` (lot 4) rend `[{ rang, adresse, produit, compte, systeme, sens: 'manque' | 'surplus' }]`,
   **vide tant que le comptage n'est pas terminé** (l'aveugle tient jusqu'à « Terminer le comptage »).
9. **Lot 4, deux ajouts** : une **liste des adresses à compter** toujours visible (adresse, cochée quand comptée, jamais
   un nombre ; le Terminal ne montre que ses 5 dernières lignes) ; une option **`aideCouche: true`** qui écrit, pour la
   palette ouverte, les cartons par couche (« 3 × 3 = 9 par couche »), jamais le total (ENT-8.12 accompagné).
10. **Lot 5 : une seule palette cherchée.** Le bonus « seconde adresse vide » du confirmé d'ENT-8.13 (proposé par Cowork)
    est **retiré** ; le confirmé joue la même enquête. Tristan peut le rétablir (≈ 1 h de plus au lot 5).
11. **Kevin et la hauteur** : pas de contradiction avec ENT-8.7 (Kevin décharge au frontal catégorie 3 au quai ; dans les
    allées, le palettier en hauteur se sert au **rétractable, catégorie 5**, que le CAP n'a pas) : `q-kevin` reste telle
    quelle, et le texte de Samia peut le dire en un mot.
12. **Comptage d'ENT-8.12 et 8.14 au niveau 1 seulement** (picking) : l'élève ne monte pas, et une palette au niveau 2 ne se
    compte pas depuis le sol. La banque des 12 adresses et les 4 de l'évaluation sont au sol ; les rôles (manque, surplus,
    conforme) ne dépendent pas du niveau. **Question posée à Tristan** (il peut préférer des adresses en hauteur comptées
    depuis le sol).
13. **ENT-8.14, ouverture** : formulations neutres comme ENT-8.10 (« ton tuteur », « l'entreprise qui t'accueille » : le moteur
    ne remplace pas `{tuteur}` dans une question d'ouverture) ; `e-adresse` cite l'allée A ou B (pas C, absente de
    Belleville). Le plan par site se lit avec `siteDeGraine` et `COLLEGUES` **importés depuis `contenus/action-ent810-donnees.js`**
    (le module des sites reste lu, jamais modifié).
14. **ENT-8.11** : les données fixent le **nombre de cartons par palette** et le seuil « lourde » (le brief ne les donne pas) ;
    la nouvelle adresse de P5 est en hauteur, donc « la confie » ; l'accueil dit en une phrase le **retour à Ensuès** après
    Labastide et le site d'évaluation.
15. Le corps du brief moteur reste périmé sur trois points (`compte-<adresse>`, `apresSignalement`, pas de lot 0) : **ce
    fichier (§3) fait foi**, un renvoi est ajouté en tête du brief.

## 4. Suivi

| Lot / séance | État | Commit |
|---|---|---|
| 0 | lancé le 21/10/2026 (Sonnet) | — |

## 5. Alertes à dire à Tristan à la livraison

- **7** : `outils/test.mjs` touché (bloc `palettier`, blocs `action-811` à `action-814`) ; `outils/test/socle.mjs`
  (`ATTENDU_CAP`) si le socle l'exige.
- **8** : quatre activités ajoutées (ENT-8.11 à 8.14).
- **9** : Action est réelle ; ce qui est construit (Samia, Kevin, Julie, Yanis, plans, plaques) est dit dans les comptes rendus.
