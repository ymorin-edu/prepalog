# Feuille de route — Transports Pelleau (entreprise n° 10, CAP OL)

**Date** : 18/10/2026, 22 h. Cadrage validé par Tristan le 18/10/2026 (5 décisions, fiche du projet Cowork `claude/prepalog-cap-pelleau-cadrage.md`) ;
briefs écrits par Cowork **sur délégation** (« fais les recherches et construis les briefs en prenant les décisions ; je décide pour les nouvelles
vues »). Les deux vues nouvelles ont été **choisies par Tristan le 18/10/2026 à 21 h 50** : `MOTEUR-inspection-poste.md` (nouveau dessin) et
`MOTEUR-depose-par-client.md` (étendre la dépose).

Deuxième entreprise de la 1re année de CAP (progression sur 2 ans, v6) : CAP-C1.1 (ouverture), **C1.2, C1.3, C1.4**, chacune avec ses trois temps.
Le numéro 9 est pris par CHEP : Pelleau est l'**entreprise n° 10**, séances **ENT-10.1 à ENT-10.12**.

## Ordre de construction

| Ordre | Quoi | Modèle | Durée estimée par Cowork | Dépend de |
|---|---|---|---|---|
| 1 | `MOTEUR-inspection-poste.md` — **page d'essai cliquable d'abord** (règle de Tristan), puis la vue | Opus | maquette ≈ 3 h ; vue ≈ 1 jour (tests compris) | — |
| 2 | ENT-10.1 se situer (crée l'univers `contenus/pelleau.js` et l'entreprise n° 10) | Opus | ≈ 5 h | — (peut commencer pendant 1) |
| 3 | ENT-10.2, 10.3, 10.4 (prise de poste) | Opus (10.2), Sonnet (10.3, 10.4 : même matière) | ≈ 6 h + 4 h + 4 h | 1, 2 |
| 4 | `MOTEUR-depose-par-client.md` | Opus | ≈ 3 h | — |
| 5 | ENT-10.5 à 10.8 (réception) | Opus (10.5), Sonnet (10.6 à 10.8) | ≈ 5 h + 3 h + 4 h + 4 h | 4 |
| 6 | ENT-10.9 à 10.12 (contrôle) | Opus (10.9), Sonnet (10.10 à 10.12) | ≈ 4 h + 3 h + 4 h + 4 h | 5 (même univers) |

| Bloc | Séances | Temps | État |
|---|---|---|---|
| C1.1 se situer | ENT-10.1 | guidage seul (C1.1 est évaluée chez Action, ENT-8.5, et revient à chaque découverte ; ses questions clés entrent dans l'ouverture notée d'ENT-10.4) | livré (19-20/10/2026, `pret: true, ouverture: 'prof'`) |
| **C1.2 prendre son poste dans un entrepôt neuf** | 10.2 guidage · 10.3 entraînement, erreur induite tirée (« le site n'est pas fini » ou « l'engin n'a pas été contrôlé ») · 10.4 évaluation | 3 temps | livrés (19-20/10/2026, `pret: true, ouverture: 'prof'`) |
| **C1.3 recevoir le camion de ramasse** (« un camion, plusieurs clients ») | 10.5 guidage · 10.6 entraînement · 10.7 entraînement, erreur induite (feuille de ramasse fausse) · 10.8 évaluation | 3 temps | livrés (19-20/10/2026, `pret: true, ouverture: 'prof'`) |
| **C1.4 contrôler** | 10.9 guidage · 10.10 entraînement · 10.11 erreur induite (le piège du froid) · 10.12 évaluation | 3 temps | livrés (19-20/10/2026, `pret: true, ouverture: 'prof'`) |

## Règles communes à Pelleau (§0 de chaque brief)

1. **Public CAP** (comme Action) : une consigne par écran, **3 lignes au plus**, tout en cliquant, aucune saisie de texte ; collègue au **tu**,
   extérieur au **vous** ; `desc` à l'infinitif ; un écran par étape ; `bilanDetail: true`.
2. **Histoire** (décision 1 de Tristan) : **le démarrage de l'entrepôt neuf** des Transports Pelleau à Gouesnou (réel : pleinement opérationnel
   **début mai 2026**, Journal du Poids Lourd, 06/04/2026). L'élève est **stagiaire en PFMP**, parmi les premiers à y travailler ; rien n'est
   encore rodé.
3. **Personnages construits** (prénoms bretons courants, aucun salarié réel ; le dirigeant réel n'est jamais nommé ni cité) :
   **Erwan**, responsable de l'entrepôt, **tuteur** de l'élève ; **Yann**, magasinier-cariste, arrivé lui aussi pour l'ouverture (adulte, CACES du
   chariot frontal) ; **Loïc**, conducteur Pelleau (tournée de ramasse du matin) ; **Maëlys**, agent d'exploitation au bureau transport (planning
   des camions, saisie des réceptions).
4. **Le site** (construit) : **2 portes de quai** (Quai A, Quai B), zone de réception, zone de contrôle, zone litiges, bureau, vestiaire, deux allées
   de racks (stock ambiant), **local de charge** des transpalettes. Ce qu'on en dit de réel : « environ 1 000 palettes, sur racks, à température
   ambiante » (site Pelleau et presse ; **jamais la surface**, les deux sources se contredisent : 1 000 / 1 600 m²).
5. **Clients qui stockent : fictifs** (décision 2), mention « entreprise fictive » en pied de tout document :
   **Biscuiterie Ar Vag** (cartons de biscuits), **Agri-Kerlann** (négoce agricole : sacs de terreau et d'engrais), **Ferme de Kervéguen**
   (producteur : plants de pommes de terre, **4 à 8 °C, jamais au gel** — réel pour ce produit, site Pelleau ; ce client n'apparaît qu'en ENT-10.11
   et ENT-10.12). Noms cherchés le 18/10/2026 : aucune entreprise de ce nom trouvée. **Germicopa** (réel) n'est cité qu'en découverte (ENT-10.1),
   comme partenaire du transport depuis 1989.
6. **Engins** : **transpalette électrique à conducteur accompagnant** pour l'élève (formé par l'entreprise, encadré) ; **chariot frontal** pour
   Yann seul. Réel (Code du travail) : un jeune de moins de 18 ans ne conduit un équipement mobile automoteur que par dérogation (D4153-27,
   R4153-40, R4153-51 : formation, avis médical, encadrement, déclaration de l'employeur) : sert aux questions d'éco-droit d'ENT-10.2 et 10.3.
7. **Dates sans année** : 10.1 lundi 4 mai · 10.2 mardi 5 · 10.3 mercredi 6 · 10.4 lundi 11 (le 8 mai est férié) · 10.5 mardi 12 ·
   10.6 mercredi 13 · 10.7 lundi 18 (pont de l'Ascension) · 10.8 mardi 19 · 10.9 mercredi 20 · 10.10 jeudi 21 · 10.11 vendredi 22 · 10.12 mardi 26
   (le 25 mai est férié). Jours fériés de mai **2026** ; une autre année, les jours de la semaine changent (aucun message ne les écrit). La Messagerie affiche l'année
   (moteur, déjà vu chez Action) : le jour de la semaine peut ne pas coller ; ne pas écrire le jour de la semaine dans les messages datés.
8. **Notation** : jalons pondérés sur 20 (`bareme: 20`), questions au fil **4 points**, `parcours: true`, `correction: true`, `precedente` ;
   évaluation : `copie: true`, ouverture notée 4 / 20. **Les poids de chaque brief sont validés par Tristan** (18/10/2026, 22 h 03 ; règle du 10/10/2026). La forme (salutation, fin) ne dépasse jamais 1 point sur 20.
9. **Tirage et niveaux** : pièce fixe + banques ; standard / confirmé (bonus caché, aides éteintes) / accompagné = standard tant que la vue ne lit
   pas le niveau (comme Action).
10. **Ce qui est construit se dit** dans la séance (pied des documents, texte de fin de la découverte) : personnages, plan, clients, documents,
    planning, et **le passage des ramasses par l'entrepôt** (les ramasses quotidiennes chez les producteurs sont réelles ; qu'elles passent par
    l'entrepôt avant de repartir est construit).
11. **Cloisonnement** : un `id` de quai, d'inspection et de dialogue **différent par séance** (l'état du quai n'est pas cloisonné : FICHE-SEANCE).
12. **Univers commun** : `contenus/pelleau.js` (créé par ENT-10.1) : entreprise, charte, personnages, plan de l'entrepôt, clients, palettes types,
    gabarits de documents. Une séance n'importe jamais le fichier d'une autre séance.

## Logo, charte et poids (accords de Tristan, 18/10/2026, 22 h 03)

- **Logo accordé** : à récupérer sur le site officiel (identité refaite en juillet 2025) par script (alerte 10), ligne dans `CREDITS.md` ; bandeau et
  trame. Couleurs de la charte relevées sur le logo ; règle des chartes rouges ou vertes.
- **Poids des 12 briefs validés** tels que proposés par Cowork (« je prends tes poids ») : Claude Code les code sans redemander.

## Tests (alerte 7 : toucher `outils/test.mjs`)

Trois blocs : **`pelleau`** (ENT-10.1 à 10.4, plus la vue `inspection` si elle a son propre bloc), **`pelleau-recep`** (10.5 à 10.8),
**`pelleau-ctrl`** (10.9 à 10.12). Une ligne chacun dans `BLOCS` et dans `GROUPES` (groupe le plus léger). Lignes `ATTENDU_CAP` de
`outils/test/socle.mjs` à ajouter (12 séances).

## Sources (consultées le 18/10/2026)

Site Transports Pelleau : [accueil](https://www.transports-pelleau.fr/), [à propos](https://www.transports-pelleau.fr/a-propos/),
[stockage](https://www.transports-pelleau.fr/stockage-de-marchandises/), [transport](https://www.transports-pelleau.fr/transport-de-marchandises/),
[véhicules](https://www.transports-pelleau.fr/vehicules-2/), [engagements](https://www.transports-pelleau.fr/engagements/),
[actualités](https://www.transports-pelleau.fr/actualites/) ; [Journal du Poids Lourd, 06/04/2026](https://journaldupoidslourd.com/transport/les-transports-pelleau-deploient-une-nouvelle-activite-en-bretagne/) ;
[Bretagne Supply Chain, 30/04/2026](https://www.bretagne-supplychain.fr/quoi-de-neuf-dans-la-supply-chain-avril-2026/) ;
INRS [ED 36, transpalettes électriques à conducteur accompagnant](https://www.inrs.fr/dam/inrs/CataloguePapier/ED/TI-ED-36.pdf) (2e édition 1999,
réimpr. 2008 : **ancien**, à citer comme repère) ; [INRS, jeunes travailleurs](https://www.inrs.fr/demarche/jeunes-travailleurs/reglementation) ;
Code du travail D4153-27, R4153-40, R4153-51 ([code.travail.gouv.fr](https://code.travail.gouv.fr/code-du-travail/d4153-27)) ;
Code civil 1927, 1928, 1932 (dépôt ; [Criminocorpus](https://criminocorpus.org/fr/legislation/droit/versions/986/1932/pdf/), à recopier sur Légifrance) ;
Brest – Rungis ≈ 580 km par la route ([Kelbillet](https://kelbillet.com/itineraire/brest-rungis-v31105-25880.html), à recouper par Mappy).

## Les briefs (docs/briefs/)

| Code | `id` | Fichier | Temps |
|---|---|---|---|
| ENT-10.1 | `pelleau-se-situer` | `ENT-10.1-pelleau-se-situer.md` | guidage C1.1 |
| ENT-10.2 | `pelleau-premier-jour` | `ENT-10.2-pelleau-premier-jour.md` | guidage C1.2 |
| ENT-10.3 | `pelleau-on-commence-quand-meme` | `ENT-10.3-pelleau-on-commence-quand-meme.md` | entraînement C1.2, erreur induite |
| ENT-10.4 | `pelleau-evaluation-prise-de-poste` | `ENT-10.4-pelleau-evaluation-prise-de-poste.md` | évaluation C1.2 |
| ENT-10.5 | `pelleau-camion-de-ramasse` | `ENT-10.5-pelleau-camion-de-ramasse.md` | guidage C1.3 |
| ENT-10.6 | `pelleau-ramasse-du-mercredi` | `ENT-10.6-pelleau-ramasse-du-mercredi.md` | entraînement C1.3 |
| ENT-10.7 | `pelleau-feuille-de-ramasse` | `ENT-10.7-pelleau-feuille-de-ramasse.md` | entraînement C1.3, erreur induite |
| ENT-10.8 | `pelleau-evaluation-reception` | `ENT-10.8-pelleau-evaluation-reception.md` | évaluation C1.3 |
| ENT-10.9 | `pelleau-controler` | `ENT-10.9-pelleau-controler.md` | guidage C1.4 |
| ENT-10.10 | `pelleau-controle-seul` | `ENT-10.10-pelleau-controle-seul.md` | entraînement C1.4 |
| ENT-10.11 | `pelleau-palette-froide` | `ENT-10.11-pelleau-palette-froide.md` | entraînement C1.4, erreur induite (le froid) |
| ENT-10.12 | `pelleau-evaluation-controle` | `ENT-10.12-pelleau-evaluation-controle.md` | évaluation C1.4 |

**Décisions de Cowork à relire par Tristan** (toutes listées dans chaque brief) : personnages et prénoms ; clients fictifs et leurs noms ; plan à
2 quais ; les questions au fil retenues (§4 bis) ; C1.1 sans note séparée (ENT-10.4 §11) ; le repli si
« Refuser » n'existe pas en quai iso (ENT-10.11 §7) ; le dessin des sacs (ENT-10.9 §7).
