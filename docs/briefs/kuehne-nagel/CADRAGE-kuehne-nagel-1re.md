# Kuehne+Nagel — le hub aérien de Roissy-Charles-de-Gaulle (1re Bac Pro) : cadrage et compte rendu

**Statut : livré le 27/10/2026** (fil cloud « prochains blocs »). Construit par Claude seul, sans brief Cowork, sur le choix de Tristan du 27/10/2026
(« Les quatre, dans l'ordre conseillé » : Kuehne+Nagel 1re en deuxième) et sa délégation du 26/10/2026 (poids et questions au fil décidés par Claude).
Comble **C1.3 « Préparer l'action de réception »**, le seul trou de la 1re au 26/10/2026 (avec C1.3.2 : adapter l'organisation aux aléas).
Les cinq séances sont livrées `pret: true, ouverture: 'prof'` : à essayer à l'écran, puis à ouvrir au groupe dans « Conduite de séance ».

## 1. La situation

L'élève est stagiaire au **service réception import** du hub aérien de Kuehne+Nagel à Roissy. Les envois arrivent par avion ; la compagnie les met à
disposition à une heure donnée ; Kuehne+Nagel les reçoit à ses quais et les range dans leur zone de température. La veille, une **pré-alerte** les a
annoncés : c'est avec elle qu'on prépare la réception. Sophie (cheffe d'équipe, tutrice), Lucas (agent de réception) et Karim (chambre froide) sont
construits, prénoms seuls, tutoiement.

## 2. Vérifié / construit

- **Vérifié (recherche web du 27/10/2026)** : communiqué de l'inauguration (Galivel, octobre 2023) et Journal de l'Aviation (23/10/2023) : hub dans
  la Cargo City de Roissy-CDG, en bord de piste ; travaux d'août 2022 à juillet 2023 ; 12 900 m² de bâtiments dont 10 500 m² d'entrepôt et 4 500 m² à
  température dirigée (2 à 8 °C, 15 à 25 °C, -20 à -80 °C, jusqu'à moins de -150 °C) ; certification CEIV pharma de l'IATA ; 260 collaborateurs (environ
  60 opérateurs) ; environ 60 % d'activité pharmaceutique ; 300 palettes avion par semaine ; pièces d'avion AOG 24 h sur 24 ; rayons X et brigades
  canines ; 1 332 panneaux photovoltaïques. Droit (résumés, à relire avant la classe) : les bonnes pratiques de distribution en gros des médicaments
  (ANSM) ; l'obligation de formation des salariés (Code du travail).
- **Construit** (dit en pied de chaque document) : les quais Q1 à Q4 et leur zone, les envois, leurs lettres de transport (préfixe 999, qui n'est celui
  d'aucune compagnie), les vols, les heures de mise à disposition et les heures limites, la règle de durée (15 min + 10 min par palette), les retards,
  la panne de la porte froide, le planning de Lucas, les prénoms.
- **Logo** : SVG de Wikimedia Commons (`contenus/trames/logos/SOURCES-logos-22-24.txt`). **Charte** : le bleu marine du logo `#003369`, texte blanc.

## 3. Les séances

| Code | Temps | Ce que l'élève fait |
|---|---|---|
| ENT-24.1 « les pré-alertes de la nuit » | guidage (réinitialisable) | la zone de cinq envois, le temps au quai de trois, ce qu'on prépare avant le premier camion, qui passe en premier |
| ENT-24.2 « le planning des quais » | guidage | trois durées, puis le planning des quatre quais (vue Planning, aides en direct) ; un vol en retard et une pièce AOG : on reprend |
| ENT-24.3 « le lundi chargé » | entraînement | le planning seul (« Vérifier mon planning »), puis la porte froide du quai 2 se bloque : on reprend avec un seul quai froid ; qui prévenir |
| ENT-24.4 « le planning de Lucas » | entraînement, erreur induite | le défaut de chaque ligne du planning de Lucas, les corrections, les règles oubliées |
| ENT-24.5 « évaluation : préparer la réception » | évaluation (copie, jeu neuf) | quatre zones, deux durées, le planning du mercredi et sa reprise, sans aucune aide |

Chaîne du parcours : 24.1 → 24.2 → 24.3 → 24.4 ; l'évaluation est hors chaîne. Chaque planning a une solution avant et après son aléa (vérifié par
une recherche exhaustive, `solution()` de `contenus/kuehne-nagel-donnees.js`, et par le bloc de tests) ; en 24.2 et 24.5, la pièce urgente ne tient
qu'en décalant l'envoi qui n'a pas d'heure limite.

## 4. La notation (poids décidés par Claude, délégation du 26/10/2026)

Chaque séance : jalons + questions = 20. Le Planning compte deux fois (la 1re version et la reprise), chacune en trois jalons : la zone, les heures,
tout posé sans chevauchement. Guidages et entraînements : questions au fil notées 4 (dont une d'éco-droit), une réflexion, « Avant de commencer » non
noté. Évaluation : « Avant de commencer » noté 3, une réflexion. Une reprise renvoyée sans changement ne rapporte rien (règle du moteur). Le détail
est en tête de chaque fichier `contenus/kuehne-nagel-ent24x.js`.

## 5. Moteur et fabrique

Aucune vue nouvelle, rien dans `core/`. La **fabrique des séances en fiches** (`contenus/fabrique-fiches.js`) accepte désormais un écran **Planning**
(option `planning` : `apres`, la déclaration de la vue, les poids des jalons retenus, le message d'ouverture, celui de l'aléa) ; sans cette option,
rien ne change pour les séances déjà faites. Les plannings des quais sont fabriqués par `planningQuais()` de `contenus/kuehne-nagel.js` (règles du
moteur : `unAlaFois`, `compatible`, `fenetre`).

## 6. À savoir

- Tests : bloc `outils/test/kuehne-nagel.mjs` (valeurs à la main ; les cinq séances jouées au clic, sabotages éprouvés ; en évaluation, une erreur de
  zone n'est pas signalée, et le même contrôle la voit bien en guidage).
- À juger à l'écran : la largeur de la grille (6 h à 13 h, quarts d'heure) au vidéoprojecteur ; la lisibilité des cartes « A — Vaccins ».
