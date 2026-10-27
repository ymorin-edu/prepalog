# Lidl — la plateforme et direction régionale de Meaux (2de GATL) : cadrage et compte rendu

**Statut : livré le 27/10/2026** (fil cloud « prochains blocs »). Construit par Claude seul, sans brief Cowork, sur le choix de Tristan du 27/10/2026
(« Les quatre, dans l'ordre » : Lidl 2de en troisième) et sa délégation du 26/10/2026 (poids des jalons et questions au fil décidés par Claude).
Aucune vue nouvelle : la fabrique « en fiches » (`contenus/fabrique-fiches.js`), documents joints, réponse par phrases, questions au fil.
Les six séances sont livrées `pret: true, ouverture: 'prof'` : à essayer à l'écran, puis à ouvrir au groupe dans « Conduite de séance ».

## 1. La situation

L'élève est stagiaire à la **plateforme de Meaux**, qui abrite aussi la **direction régionale**. Il découvre trois métiers autour d'un même camion
de fournisseur : la **réception** avec Fatou (cheffe de quai), le **transport** avec Mehdi (service transport), la **comptabilité des fournisseurs**
avec Claire. Tous construits, prénoms seuls, tutoiement.

## 2. Vérifié / construit

- **Vérifié (recherche web du 27/10/2026)** : Meaux, en activité depuis le 20 juin 2022, inaugurée le 16 septembre 2022, 85 M€ ; 55 000 m² dont
  28 000 m² de produits secs et 24 000 m² de cellules froides de +14 °C à -28 °C, environ 6 700 m² de fruits et légumes ; 3 500 m² de bureaux de la
  direction régionale ; 61 magasins ; le non-alimentaire reste à Crégy-lès-Meaux (Réussir / Pleinchamp, 26/09/2022). Fruits et légumes gardés un
  peu sous +10 °C (étude de cas Condair, xpair). Environ 1 600 magasins Lidl en France (Bourse Inside, 17/09/2026). Droit (résumés) : surgelés à
  -18 °C au plus ; délai de paiement des denrées périssables : 30 jours après la fin de la décade de livraison (Code de commerce, L441-11) ; TVA à
  5,5 % sur l'alimentaire ; temps de conduite et pauses des chauffeurs (réglementation européenne) ; information CO₂ des prestations de transport.
- **Construit** (dit en pied de chaque document) : les quais et leur zone, les limites de température des fruits et légumes (+6 à +12 °C), les
  fournisseurs (jamais nommés : « une laiterie de Normandie »…), les camions, les relevés, la règle des rendez-vous, les durées, la grille du
  transporteur, les coûts de la plateforme et la marge, les distances des magasins (« magasin 1, 2, 3 », sans ville), les factures et leurs prix,
  les fiches fournisseurs (numéros fictifs), le courriel frauduleux (imitation d'une fraude réelle, « au faux fournisseur »), les prénoms.
- **Logo** : le logo officiel (SVG Wikimedia Commons, `contenus/trames/logos/SOURCES-logos-19-21.txt`). **Charte** : le bleu du logo (`#0050aa`),
  texte blanc dessus.

## 3. Les séances

| Code | Temps | Compétences | Ce que l'élève fait |
|---|---|---|---|
| ENT-21.1 « bienvenue à Meaux : préparer la réception » | guidage (réinitialisable) | C1.3 | la zone de six produits, le quai de quatre camions, les contrôles à l'arrivée, trois relevés de température |
| ENT-21.2 « le planning du lundi » | entraînement | C1.3 | la zone de six camions, leur créneau (un créneau d'une heure par quai, dans l'ordre des demandes), la durée d'un déchargement, un camion de surgelés en retard |
| ENT-21.3 « combien coûte une livraison ? » | guidage | OTM-C1.4 | la zone tarifaire de trois magasins, la cotation d'une livraison (transport, froid, annexes), le coût de revient et le prix de vente avec notre camion |
| ENT-21.4 « la facture du fournisseur » | guidage | AGO-2.2, AGO-1.3 | rapprocher commande, réception et facture, le montant à payer (HT, TVA, TTC), la date limite (décade), la fiche fournisseur et le faux changement de RIB |
| ENT-21.5 « évaluation : chiffrer une livraison » | évaluation (copie, jeu tiré) | OTM-C1.4 | comme 21.3, sur un des trois jeux |
| ENT-21.6 « évaluation : la facture du fournisseur » | évaluation (copie, jeu tiré) | AGO-2.2, AGO-1.3 | comme 21.4, sur un des trois jeux |

Règle de la 2de (décision 3) tenue : la logistique (C1.3) a deux temps sans évaluation (découverte, reprise en 1re) ; l'OTM et l'AGOrA ont chacun un
temps de travail, puis leur évaluation. Chaîne du parcours : 21.1 → 21.2 → 21.3 → 21.4 ; les évaluations sont hors chaîne.

## 4. La notation (poids décidés par Claude, délégation du 26/10/2026)

Chaque séance : jalons + questions = 20. Guidages et entraînement : questions au fil notées 4 (dont une d'éco-droit), une réflexion non notée,
« Avant de commencer » non noté. Évaluations : « Avant de commencer » noté 3 (trois questions tirées, sans aide), une réflexion non notée.
Le détail est en tête de chaque fichier `contenus/lidl-ent21x.js`. Montants acceptés au centime près.

## 5. À savoir

- Les jeux des évaluations dépendent de la graine de l'élève et de `contenus/lidl-donnees.js` : ne rien y changer pendant qu'une classe joue.
- Tests : bloc `outils/test/lidl.mjs` (valeurs écrites à la main, sabotages éprouvés).
