# Royal Canin — piloter l'entrepôt de produits finis (Terminale, C1.6, C2.2, C3.1 et C3.4) : cadrage et compte rendu

**Statut : livré le 26/10/2026, revu le 27/10/2026** (calculs au tableur et séance « présenter à la réunion », voir §7). Première livraison : fil
« Proposer les prochains blocs 1re et Terminale ». Construit par Claude seul, sans brief Cowork, sur la
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

Depuis le 27/10/2026 (§7) : les indicateurs se calculent **au tableur** (16.1, 16.2, 16.6) et l'élève **présente** ses indicateurs à la réunion de
production (16.3 nouvelle, oral noté par l'enseignant) ; le picking, l'export et l'évaluation deviennent 16.4, 16.5 et 16.6. Les §3 à §5 décrivent la
première livraison ; le §7 dit ce qui a changé.

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

## 7. Révision du 27/10/2026 : le tableur et la présentation (fil « Revoir Royal Canin avec le tableur »)

**Demande de Tristan** : « Royal Canin doit fonctionner avec des extractions Excel avec correction pour la partie calcul. On ajoute aussi rendre compte, et
l'élève doit préparer une présentation type Canva, PPT. » Options proposées, acceptées (« ok ») : geste tableur comme Cdiscount 2.2 / 2.6 et Stellantis
13.3 ; une séance nouvelle pour l'oral ; PowerPoint ou LibreOffice Impress plutôt que Canva (installés, hors ligne, pas de compte élève) ; le fichier de
présentation ne passe pas par le site ; l'oral est noté par l'enseignant. **Aucune vue nouvelle**, rien dans `core/` ni `styles/`.

| Code (id inchangé) | Ce qui change |
|---|---|
| ENT-16.1 `royal-canin-indicateurs` | Guidage au tableur : export « État du stock — octobre » (20 références, le même jeu pour tous, plus de fiche), colonnes Stock moyen, Rotation, Conso par jour, Couverture, Alerte (SI), taux de service sur la feuille « Commandes » ; retour détaillé, redépôt illimité. Ruptures CT-INT-02, CH-MIN-08 (la plus urgente), CH-SEN-12 ; surstocks CH-CHI-03, VET-REN-02, CH-LIG-12, VET-URI-04 ; 92 %. |
| ENT-16.2 `royal-canin-indicateurs-novembre` | Entraînement au tableur : valeurs **tirées par élève** (24 références, 3 ruptures, 4 surstocks, une « presque rupture »), l'extraction du WMS France mélange 8 références de Cambrai à écarter (critère « Site », indications 3) ; retour « n justes sur m ». |
| **ENT-16.3 `royal-canin-reunion` (nouvelle)** | Rendre compte à l'oral (C1.6, C3.4) : export de décembre tiré par élève, calcul et dépôt (retour détaillé), graphique en barres dans le tableur, plan des trois diapos envoyé à Sandrine (phrases), support fait dans PowerPoint ou Impress avec la fiche « Préparer tes diapos » et la grille de l'oral, présentation de 3 minutes en classe. `notation: 'prof'` : la note de l'oral saisie dans le Suivi remplace la note de préparation du site. Temps : entraînement. |
| ENT-16.4 `royal-canin-picking` | Ancienne 16.3, inchangée (date : jeudi 7 janvier). |
| ENT-16.5 `royal-canin-export` | Ancienne 16.4, inchangée. |
| ENT-16.6 `royal-canin-evaluation` | Ancienne 16.5 : les indicateurs de mars au tableur (tirés par élève, Cambrai à écarter, indications 4, **un seul dépôt**, « Fichier reçu ») ; la fiche ne garde que l'implantation et la commande export ; le compte rendu attend la fiche ET le fichier. |

**Poids** (Claude, délégation du 26/10) :
- 16.1 : stock moyen 1 · rotation 2,5 · consommation 1 · couverture 3 · alerte 3,5 · taux de service 2 · compte rendu 3 · questions 4.
- 16.2 : bon export 2 · stock moyen et rotation 2,5 · consommation et couverture 3 · alerte 3,5 · service 1,5 · compte rendu 3,5 · questions 4.
- 16.3 (note de préparation) : stock moyen et rotation 2 · consommation et couverture 3 · alerte 3 · service 1 · titre de la diapo 1 2 · graphique 2 ·
  décisions dans l'ordre 3 · questions 4 (titre-message, peu de texte, défendre une rupture devant le directeur, discrétion : Code du travail L1222-1).
  **Grille de l'oral (enseignant, sur 20)** : chiffres justes et lisibles 5 · alertes expliquées 4 · décision proposée et justifiée 4 · graphique adapté 4 ·
  l'oral 3 (la forme : 15 %).
- 16.6 : bon export 1 · stock moyen et rotation 1,5 · consommation et couverture 2 · alerte 2,5 · service 1 · chaque zone 1,5 (× 2) · lots 2 · palettes 2 ·
  compte rendu 2 · « Avant de commencer » 3.
- Le compte rendu des séances au tableur ajoute une ligne « la plus urgente » (la rupture à qui il manque le plus de jours).

**Code** : `contenus/royal-canin-tableur.js` (export, tirage équitable, contrôles ; une instance par séance), `contenus/royal-canin-ent163.js` (la
réunion), la fabrique `seance()` de `contenus/royal-canin.js` accepte `tab` et `jalonsTab`. Références ajoutées (construites) : 16 d'Aimargues, 8 de
Cambrai, chacune avec son délai.

**Vérifié / construit** : rien de nouveau sur l'entreprise ; Cambrai est l'autre usine française réelle (déjà vérifiée le 26/10), ses références sont
construites. L'article L1222-1 du Code du travail (« Le contrat de travail est exécuté de bonne foi ») est cité ; l'obligation de discrétion qui en découle
est présentée comme une lecture des juges, pas comme le texte.

**Limites** : le site ne voit ni le graphique (SheetJS ne lit pas les graphiques) ni le support : l'enseignant les juge à l'oral. Tant que l'enseignant n'a
pas saisi la note de 16.3, la colonne du Suivi montre la note de préparation. Le compte rendu se juge sur les vraies valeurs de l'élève, même si son
fichier était faux (en guidage et en entraînement, le dépôt lui a dit quoi corriger). Tests : bloc `royal-canin` réécrit (17 cas), valeurs de 16.1
écrites à la main, 300 graines par séance tirée. Rien n'a été vu à l'écran par Tristan.
