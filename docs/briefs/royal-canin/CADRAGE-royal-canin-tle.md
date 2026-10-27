# Royal Canin — piloter l'entrepôt de produits finis (Terminale, C1.6, C2.2 et C3.1) : cadrage et compte rendu

**Statut : livré le 26/10/2026** (fil « Proposer les prochains blocs 1re et Terminale »). Construit par Claude seul, sans brief Cowork, sur la
délégation de Tristan du 26/10/2026 (poids des jalons et questions au fil décidés par Claude). Aucune vue nouvelle : documents joints, fiche
(nombres, cases, menus déroulants, choix), réponse par phrases, questions au fil. Les cinq séances sont livrées `pret: true, ouverture: 'prof'`.
Première entreprise de Terminale de la liste (Royal Canin, puis La Redoute, puis Airbus).

## 1. La situation et l'angle

L'élève est **adjoint(e) à la responsable de l'entrepôt de produits finis** de l'usine Royal Canin d'**Aimargues (Gard)** : un poste de pilotage, à la
hauteur de la Terminale. Trois gestes, chacun dans ses séances :

- **C1.6** (16.1, 16.2) : lire les **indicateurs du stock** du mois (rotation, couverture, taux de service), repérer surstocks et risques de rupture
  (couverture plus courte que le délai), dire quoi faire (avancer une production, en retarder une autre) ;
- **C2.2 et C3.1** (16.3) : **implanter la zone de picking** selon la demande et le poids (canal dynamique, palette au sol, réserve) et calculer les
  réappros des canaux ;
- **C3.1** (16.4, erreur induite) : préparer une **commande export** qui exige une durée de vie restante (DDM), en **FEFO** parmi les lots conformes ;
  Mehdi l'a préparée en FIFO.
- Les trois en **évaluation** (16.5, copie rendue, jeu neuf).

Sandrine (responsable, construite) **tutoie** l'élève ; l'élève lui écrit poliment (« Bonjour Sandrine, »).

## 2. Vérifié / construit

- **Vérifié (recherche web, 26/10/2026)** : royalcanin.com — deux usines françaises de croquettes, Aimargues (siège mondial, site historique) et
  Cambrai ; 349 454 tonnes produites en 2024, environ 85 % exportées vers plus de 102 marchés ; marque du groupe Mars. mecalux.com (étude de cas) —
  l'entrepôt de produits finis d'Aimargues : 1 800 emplacements palettes, rayonnages de 7 m, **canaux dynamiques** à rouleaux aux niveaux bas pour les
  petits produits (réapprovisionnés par l'arrière), prélèvement sur palettes au sol, terminaux radio guidés par le WMS.
- **Construit** : les références (désignations génériques, pas de noms de gamme réels), les stocks, les sorties, les délais, les lignes de commande, les
  lots et leurs DDM, le client export et son exigence, les règles du site (objectif de couverture 15 jours, règle d'implantation, 24 cartons par
  canal), les prénoms (Sandrine, Mehdi). Pas le logo officiel : le nom en texte (`royal-canin-texte.svg`), dans un violet ardoise construit (le rouge
  de la marque dirait « faux »).
- **Droit** (résumé, pas une citation) : livrer conforme à la commande ; DDM ≠ DLC ; l'employeur évalue et réduit le risque de port de charges.

## 3. Les séances

| Code | Temps | Ce que l'élève fait | Valeurs justes |
|---|---|---|---|
| ENT-16.1 « lire les indicateurs du stock » | guidage (réinitialisable), C1.6 | 6 références d'octobre ; rotation et couverture de 2 ; ruptures, surstocks, service | CH-ADU-15 4 / 5 j ; CT-STE-04 5 / 6 j ; rupture CT-INT-02, CH-MIN-08 ; surstock CH-CHI-03, VET-REN-02 ; 92 % |
| ENT-16.2 « les indicateurs de novembre » | entraînement, C1.6 | 8 références ; une rotation décimale ; CT-INT-02 à 4 j pour 3 j n'est pas une rupture | CH-ADU-15 3 / 8 j ; CT-KIT-04 3,5 / 7 j ; rupture CH-CHI-03, CH-MIN-08 ; surstock CT-STE-04, VET-DIG-10 ; 94,5 % |
| ENT-16.3 « implanter la zone de picking » | guidage, C2.2 et C3.1 | 6 références à placer (la demande d'abord, puis le poids) ; réappros de 2 canaux | sol CH-ADU-15, CH-MIN-08 ; canal CT-INT-02, CT-KIT-04 ; réserve VET-REN-02, VET-DIG-10 (10 kg mais 4 colis) ; 5 et 3 réappros |
| ENT-16.4 « la commande export de Mehdi » | erreur induite, C3.1 | 9 mois de DDM exigés ; Mehdi a pris les 2 plus anciens lots ; refaire en FEFO | limite 01/12/2027 ; L7124 et L7203 (11 jours trop court) ; L7298 × 1 + L7312 × 3 |
| ENT-16.5 « évaluation : piloter l'entrepôt » | évaluation (copie), C1.6, C2.2, C3.1 | jeu neuf : indicateurs de mars, 2 références à implanter, une commande export | CT-STE-04 4 / 6 j ; rupture CT-INT-02 ; surstock CH-CHI-03, CH-MIN-08 ; 95 % ; réserve, canal ; L8056 × 2 + L8102 × 1 |

## 4. Les poids (décidés par Claude, délégation de Tristan)

- **16.1** : rotation 1,5 et couverture 1,5 (× 2 références) · ruptures 3 · surstocks 3 · taux de service 2 · compte rendu 2 · questions au fil 4.
- **16.2** : rotation 1,5 et couverture 1,5 (× 2) · ruptures 2,5 · surstocks 2,5 · service 2 · compte rendu 3 · questions au fil 4.
- **16.3** : chaque zone 1,5 (× 6) · réappros 2 (× 2) · compte rendu 3 · questions au fil 4.
- **16.4** : lots non conformes 4 · la cause 2 · les lots choisis 4 · les palettes par lot 2 · compte rendu 4 · questions au fil 4.
- **16.5** : rotation 1 · couverture 1 · ruptures 2 · surstocks 2 · service 2 · chaque zone 1,5 (× 2) · lots 2 · palettes 2 · compte rendu 2 ·
  « Avant de commencer » noté 3.
- Le compte rendu (phrases) reprend le contenu de la fiche ; salutation et formule de fin ne sont pas notées à part. Les titres des jalons ne donnent
  aucune réponse (« VET-REN-02 : sa zone »).

## 5. Les questions

- **Avant de commencer** (banque commune de 6, tirage 2 + 1) : la rotation, couverture et délai, le FEFO, le sac lourd ; droit : la DDM, la commande
  non conforme. Noté 3 points en 16.5 seulement.
- **Au fil** (3 notées + 1 réflexion non notée) : rotation divisée par deux, couverture contre délai, coût du surstock (16.1, réflexion : vendre ou
  donner plutôt que jeter, loi AGEC) ; 4 jours pour 3 n'est pas une rupture, l'aliment vétérinaire tourne lentement, avancer la production (16.2,
  réflexion : livrer souvent = plus de camions) ; la réserve passe avant le poids, 2,5 → 3, le lourd au sol (16.3, réflexion : l'employeur organise le
  poste) ; L7203 à quelques jours près, FEFO plutôt que FIFO, où vont les lots écartés (16.4, réflexion : qui paie une livraison refusée) ; 16.5 : ce
  qui passe en premier à la réunion.

## 6. Limites

- La fiche n'a été vue que par les tests (pas de capture relue) : **à essayer à l'écran**.
- Une saisie de nombre n'accepte qu'un nombre (« 92 », pas « 92 % ») : l'unité est écrite après la case, et le refus dit pourquoi à l'envoi.
- Tests : bloc `royal-canin` (11 cas, groupe 4), valeurs écrites à la main ; chaque sabotage fait tomber le jalon attendu.
