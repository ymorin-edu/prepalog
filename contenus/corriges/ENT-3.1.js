// Généré par outils/trame-boost-tournee.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-3.1",
  "titre": "Boost — la tournée du vélo-cargo",
  "trame": "ENT-3.1-boost-tournee-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Découvrir Boost",
      "genre": "question",
      "texte": "Que fait Boost pour ses clients ?",
      "rep": "C'est un logisticien e-commerce : il reçoit et stocke les marchandises de marques, prépare leurs commandes et organise l'expédition vers leurs clients.",
      "note": "Source : fédération des entreprises d'insertion (article sur Boost) et Voxlog. Relevé le 02/10/2026."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Boost",
      "genre": "fait",
      "texte": "Qu'est-ce qu'un « logisticien e-commerce » ?",
      "rep": "Une entreprise qui prend en charge, pour des boutiques en ligne, le stockage, la préparation des commandes et l'envoi des colis.",
      "note": "Définition de métier ; vérifiée avec la description de Boost."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Boost",
      "genre": "qcm",
      "texte": "Pourquoi une marque comme Marou confie-t-elle l'envoi de ses colis à Boost ? (c'est l'externalisation)",
      "choix": [
        "parce que la loi l'y oblige",
        "pour se concentrer sur son métier pendant que Boost s'occupe de la logistique",
        "parce que Boost fabrique ses produits"
      ],
      "bonne": 1,
      "explication": "Une marque externalise la logistique pour se concentrer sur son métier (créer et vendre) ; c'est le cœur de métier de Boost.",
      "notion": "Module 3 — externalisation"
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Boost",
      "genre": "question",
      "texte": "Boost est une « entreprise d'insertion ». Qu'est-ce que cela veut dire ?",
      "rep": "Elle accueille des personnes éloignées de l'emploi : elles travaillent en étant salariées, retrouvent un rythme de travail, découvrent les métiers de la logistique et sont accompagnées pour ensuite trouver un emploi classique.",
      "note": "Source : article Voxlog sur Boost (salaires fixes, accompagnement par des conseillers en insertion)."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Boost",
      "genre": "question",
      "texte": "Cite un avantage d'envoyer les colis en vélo-cargo puis en train, plutôt qu'en camion.",
      "rep": "Moins de pollution et d'émissions de CO₂ que le camion (vélo-cargo puis train), pas de bruit, plus facile de circuler en centre-ville.",
      "note": "Accepter tout avantage écologique ou de circulation. Boost s'appuie sur le modèle WePost (vélo-cargo + train) cité comme alternative bas carbone."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Boost",
      "genre": "question",
      "texte": "Cite une limite de ce mode de transport.",
      "rep": "Charge limitée (ici 180 kg), vitesse faible (12 km/h en ville), dépendance aux horaires du train, météo, distances courtes.",
      "note": "L'article Voxlog dit que le transport reste « complexe »."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Boost",
      "genre": "reflexion",
      "texte": "Boost livre des colis en vélo-cargo puis en train plutôt qu'en camion. Dans quelle situation ce choix serait-il moins bon pour l'un de ses clients ?",
      "pistes": [
        "Un colis lourd ou volumineux : le vélo-cargo est limité en charge (ici 180 kg).",
        "Une livraison urgente ou en dehors des horaires du train : le train fixe l'heure limite, un camion pourrait partir plus tard.",
        "Mauvaise météo ou longue distance en ville. Accepter toute situation justifiée : il n'y a pas une seule réponse."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire la consigne",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Connecte-toi à Prepalog, ouvre la rubrique Simulog, puis l'activité « Boost — la tournée du vélo-cargo ». Le logiciel s'ouvre aux couleurs de Boost. Tu dois voir, à gauche, un menu avec « Messagerie ». Clique dessus : un message t'attend. Lis-le en entier avant de toucher à autre chose.",
      "reponses": [
        [
          "Heure de départ de l'entrepôt",
          "14 h 00"
        ],
        [
          "Heure de départ du train pour Paris",
          "16 h 10"
        ],
        [
          "Charge maximale du vélo-cargo (kg)",
          "180"
        ],
        [
          "Vitesse du vélo-cargo en ville (km/h)",
          "12"
        ],
        [
          "Temps passé à chaque arrêt (min)",
          "6"
        ],
        [
          "Où doit arriver le vélo-cargo ?",
          "À la gare de Nîmes-Centre, avant 16 h 10"
        ]
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire la consigne",
      "genre": "reflexion",
      "texte": "M. Morin demande de situer les clients sur un plan AVANT de construire la tournée. Pourquoi, à ton avis ?",
      "pistes": [
        "Sans savoir où sont les clients, on ne peut pas organiser un parcours : on ne calcule ni la distance ni le temps.",
        "Les clients ne donnent que le nom de la rue : il faut d'abord les repérer pour décider de l'ordre des arrêts."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Situer les sept clients sur le plan",
      "genre": "tableau",
      "texte": "N° | Rue | Quartier | Case",
      "entetes": [
        "N°",
        "Rue",
        "Quartier",
        "Case"
      ],
      "contexte": "Dans le menu de gauche, clique sur « Plan de Nîmes ». Tu vois la vraie carte de la ville, avec un quadrillage : des colonnes A à E et des lignes 1 à 5 (une case fait 1 km de côté). Une case s'écrit lettre puis chiffre, par exemple C2. Les sept quartiers sont dessinés avec leur nom, et les sept clients sont des points numérotés : le numéro est celui de la fiche de M. Morin. Leurs noms ne sont pas encore écrits sur la carte.",
      "reponses": [
        [
          "1",
          "rue du Général Perrier",
          "Écusson",
          "D2"
        ],
        [
          "2",
          "rue de Combret",
          "Jardins de la Fontaine",
          "C2"
        ],
        [
          "3",
          "rue de l'Hostellerie",
          "Ville Active",
          "C5"
        ],
        [
          "4",
          "rue de Mascard",
          "Saint-Césaire",
          "B5"
        ],
        [
          "5",
          "rue Edmond Rostand",
          "Croix de Fer",
          "E1"
        ],
        [
          "6",
          "rue Graverol",
          "Gambetta",
          "D2"
        ],
        [
          "7",
          "rue Roger Sabatier",
          "Costières",
          "D4"
        ]
      ],
      "note": "Les numéros sont ceux de la fiche de M. Morin : 1 Comptoir des Halles, 2 Épicerie Verdier, 3 La Pointe Sud, 4 Maison Lauze, 5 Studio Garance, 6 Atelier Mazet, 7 Caveau Pélissier. Cases recalculées par le logiciel depuis la position de chaque point sur la carte réelle (quadrillage de 1 km). Le logiciel tolère une case fausse ; le point du suivi exige les sept (case ET quartier). Les noms des clients n'apparaissent qu'après la validation. Vérifié le 03/10/2026 : les sept rues existent à Nîmes et tombent entièrement dans le contour de leur quartier (IRIS INSEE regroupés ; Costières = Marronniers + Capouchiné + Maréchal Juin)."
    },
    {
      "etape": 3,
      "etapeTitre": "Situer les sept clients sur le plan",
      "genre": "reflexion",
      "texte": "Pour le client le plus difficile à situer, comment as-tu trouvé la case et le quartier ?",
      "pistes": [
        "Réponse personnelle : méthode attendue = cliquer la ligne du tableau pour faire apparaître le halo du point, lire la colonne puis la ligne du quadrillage, puis lire le nom du quartier dessiné autour du point.",
        "Valoriser les méthodes : zoomer sur le quartier pour lire le nom de la rue, vérifier la case en suivant les lignes du quadrillage, comparer avec les deux cases voisines."
      ],
      "note": "Les deux points les plus piégeux : Comptoir des Halles et Atelier Mazet sont tous deux en D2, mais dans des quartiers différents (Écusson et Gambetta) : la case seule ne suffit pas, il faut lire le quartier."
    },
    {
      "etape": 4,
      "etapeTitre": "Charger le vélo-cargo",
      "genre": "fait",
      "texte": "Qu'as-tu vu à l'écran qui t'a fait comprendre que tu ne pouvais pas tout emporter ?",
      "rep": "La jauge « Charge du vélo-cargo » monte à chaque commande chargée et prévient quand la limite de 180 kg est franchie : les sept commandes ne tiennent pas toutes.",
      "note": "Le total (237 kg) et le dépassement (57 kg) ne sont pas dits à l'élève : il les trouve à l'étape 7."
    },
    {
      "etape": 4,
      "etapeTitre": "Charger le vélo-cargo",
      "genre": "tableau",
      "texte": "Client | Chargé ou à quai ?",
      "entetes": [
        "Client",
        "Chargé ou à quai ?"
      ],
      "contexte": "Note ta décision :",
      "reponses": [
        [
          "Le Comptoir des Halles",
          "chargé"
        ],
        [
          "Épicerie Verdier",
          "chargé"
        ],
        [
          "La Pointe Sud",
          "à quai"
        ],
        [
          "Maison Lauze",
          "chargé"
        ],
        [
          "Studio Garance",
          "chargé"
        ],
        [
          "Atelier Mazet",
          "chargé"
        ],
        [
          "Caveau Pélissier",
          "chargé"
        ]
      ],
      "note": "Un seul client à quai est possible : La Pointe Sud (58 kg ≥ 57 kg de trop). Vérifié par énumération des 128 combinaisons."
    },
    {
      "etape": 4,
      "etapeTitre": "Charger le vélo-cargo",
      "genre": "reflexion",
      "texte": "Pourquoi as-tu laissé CE client à quai plutôt qu'un autre ? (M. Morin précise que ce qui reste à quai partira demain.)",
      "pistes": [
        "Le seul choix qui permet de respecter la charge en écartant un seul client est La Pointe Sud (58 kg) : 237 − 58 = 179 kg ≤ 180 kg.",
        "Autre raison valable : c'est le client le plus loin / le plus pénalisant en temps ; ce qui reste à quai partira demain.",
        "Un élève qui écarte un autre client doit en écarter plusieurs ou obtient une charge trop élevée : le faire constater."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Ordonner les arrêts",
      "genre": "tableau",
      "texte": "Essai | Ordre des arrêts (numéros ou noms) | Train tenu ?",
      "entetes": [
        "Essai",
        "Ordre des arrêts (numéros ou noms)",
        "Train tenu ?"
      ],
      "contexte": "Note tes essais :",
      "reponses": [
        [
          "1",
          "réponse personnelle (ex. dans l'ordre de la fiche : Halles, Verdier, Lauze, Garance, Mazet, Pélissier)",
          "non : 21,3 km, arrivée 16 h 23"
        ],
        [
          "2",
          "Lauze, Halles, Verdier, Mazet, Garance, Pélissier",
          "oui : 14,8 km, arrivée 15 h 50"
        ],
        [
          "3",
          "Lauze, Pélissier, Verdier, Halles, Mazet, Garance (ordre le plus court)",
          "oui : 11,9 km, arrivée 15 h 36"
        ],
        [
          "4",
          "libre",
          "libre"
        ]
      ],
      "note": "Exemples calculés par le calibrage (départ entrepôt 14 h 00, arrivée gare, 6 clients, 12 km/h, 6 min par arrêt, km par les rues). La colonne « Train tenu ? » doit seulement être cohérente avec la jauge de l'élève. 189 ordres sur 720 tiennent le train."
    },
    {
      "etape": 5,
      "etapeTitre": "Ordonner les arrêts",
      "genre": "reflexion",
      "texte": "Qu'est-ce qui rendait ton premier ordre plus long ou plus court que les suivants ?",
      "pistes": [
        "Un ordre en zigzag oblige à des allers-retours : plus de kilomètres, donc plus de temps.",
        "Les kilomètres changent à chaque essai ; l'ordre qui enchaîne les clients proches est le plus court."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Ordonner les arrêts",
      "genre": "reflexion",
      "texte": "Quel principe as-tu trouvé pour choisir l'ordre des arrêts ?",
      "pistes": [
        "Aller de proche en proche, sans revenir en arrière, en terminant du côté de la gare.",
        "Ordre le plus court calculé (km par les rues de Nîmes) : Maison Lauze → Caveau Pélissier → Épicerie Verdier → Comptoir des Halles → Atelier Mazet → Studio Garance (11,9 km, arrivée 15 h 36). Tout ordre sous 18,8 km tient le train (189 ordres sur 720)."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Calculer dans la feuille de calcul",
      "genre": "tableau",
      "texte": "Ce qu'on calcule | Cellule | Ma formule | Résultat affiché",
      "entetes": [
        "Ce qu'on calcule",
        "Cellule",
        "Ma formule",
        "Résultat affiché"
      ],
      "contexte": "Note les formules que tu as écrites :",
      "reponses": [
        [
          "Poids total chargé (kg)",
          "B8",
          "=SOMME(B2:B7)",
          "179"
        ],
        [
          "Étape 1 · temps de route (h)",
          "B13",
          "=B11/B12",
          "0,99 (pour 11,9 km)"
        ],
        [
          "Étape 2 · temps de route (min)",
          "B14",
          "=B13*60",
          "59,5"
        ],
        [
          "Étape 3 · temps aux arrêts (min)",
          "B17",
          "=B15*B16",
          "36"
        ],
        [
          "Heure d'arrivée à la gare",
          "B19",
          "=B18+B14+B17",
          "15:36 (935,5 min depuis minuit)"
        ]
      ],
      "note": "Références de cellules déduites de l'ordre des lignes de la feuille avec 6 arrêts chargés (poids en B2 à B7 ; si l'élève charge 5 ou 7 arrêts, tout est décalé : lire l'écran). Les valeurs dépendent de l'ordre des arrêts de l'élève : distance (B11) = km parcourus. Toute formule équivalente est acceptée (ex. =B11/B12*60)."
    },
    {
      "etape": 6,
      "etapeTitre": "Calculer dans la feuille de calcul",
      "genre": "fait",
      "texte": "Ton poids total est-il au-dessus ou en dessous de la charge maximale ?",
      "rep": "En dessous (ou égal) : 179 kg pour 180 kg maximum, si La Pointe Sud est restée à quai."
    },
    {
      "etape": 6,
      "etapeTitre": "Calculer dans la feuille de calcul",
      "genre": "fait",
      "texte": "Ton heure d'arrivée est-elle avant ou après l'heure du train ?",
      "rep": "Avant : 15 h 36 pour l'ordre le plus court (11,9 km), le train part à 16 h 10.",
      "note": "Dépend de l'ordre choisi : tout ordre de moins de 18,8 km tient le train (départ 14 h 00, 6 arrêts de 6 min, 12 km/h)."
    },
    {
      "etape": 6,
      "etapeTitre": "Calculer dans la feuille de calcul",
      "genre": "reflexion",
      "texte": "Tes formules sont justes, mais une contrainte est franchie. Comment as-tu su que c'était ta tournée qu'il fallait revoir, et pas tes formules ?",
      "pistes": [
        "Le logiciel l'a dit : « Le calcul est bon : c'est la tournée qu'il faut revoir ». Les formules sont validées (« juste »), donc l'erreur est dans la tournée.",
        "Les formules mesurent la tournée. Modifier les formules pour « faire passer » le résultat serait tricher avec la réalité."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Calculer dans la feuille de calcul",
      "genre": "reflexion",
      "texte": "Si le vélo-cargo roulait à 15 km/h, qu'est-ce qui changerait dans ta feuille ?",
      "pistes": [
        "La vitesse (cellule B12) passerait de 12 à 15 : les étapes 1 et 2 donnent un temps de route plus court (11,9 / 15 = 0,79 h, soit 47,6 min).",
        "L'heure d'arrivée serait plus tôt (≈ 15 h 24 pour l'ordre le plus court) : les formules ne changent pas, seule la donnée change et tout se recalcule."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Reporter tes résultats",
      "genre": "tableau",
      "texte": "Client | Poids (kg)",
      "entetes": [
        "Client",
        "Poids (kg)"
      ],
      "contexte": "Dernière étape : en bas de la page « Tournée du 14 avril », deux cases à remplir. Elles portent sur ta DÉCISION, pas sur la feuille : aucune jauge ne te donne ces nombres.",
      "reponses": [
        [
          "Le Comptoir des Halles",
          "31"
        ],
        [
          "Épicerie Verdier",
          "24"
        ],
        [
          "La Pointe Sud",
          "58"
        ],
        [
          "Maison Lauze",
          "42"
        ],
        [
          "Studio Garance",
          "19"
        ],
        [
          "Atelier Mazet",
          "36"
        ],
        [
          "Caveau Pélissier",
          "27"
        ]
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Reporter tes résultats",
      "genre": "tableau",
      "texte": "Résultat | Mon calcul | Ma réponse (kg)",
      "entetes": [
        "Résultat",
        "Mon calcul",
        "Ma réponse (kg)"
      ],
      "contexte": "Dernière étape : en bas de la page « Tournée du 14 avril », deux cases à remplir. Elles portent sur ta DÉCISION, pas sur la feuille : aucune jauge ne te donne ces nombres.",
      "reponses": [
        [
          "Masse totale des sept commandes",
          "31 + 24 + 58 + 42 + 19 + 36 + 27",
          "237 kg"
        ],
        [
          "Masse qui ne peut pas partir aujourd'hui",
          "237 − 180",
          "57 kg"
        ]
      ],
      "note": "Les deux cases se corrigent seules (jalon « report »). Le logiciel refuse de valider si la tournée ne tient pas (charge, train, départ et arrivée posés)."
    },
    {
      "etape": 7,
      "etapeTitre": "Reporter tes résultats",
      "genre": "reflexion",
      "texte": "Dans une vraie entreprise, qui prévient le client dont la commande reste à quai ?",
      "pistes": [
        "Le responsable d'exploitation (M. Morin) ou le service client de Boost, qui prévient le client ou la marque cliente.",
        "Accepter « l'exploitant / le service client / le logisticien » avec une justification."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Reporter tes résultats",
      "genre": "reflexion",
      "texte": "Que lui dit-on ?",
      "pistes": [
        "Que la commande est retardée, pourquoi (vélo-cargo plein), et qu'elle partira demain par le train de la même heure.",
        "S'excuser, donner une date de livraison réaliste et proposer un contact en cas de besoin."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Reporter tes résultats",
      "genre": "reflexion",
      "texte": "Si le vélo-cargo pouvait porter 250 kg, qu'est-ce que cela changerait à ta tournée ?",
      "pistes": [
        "Les sept commandes (237 kg) tiendraient en une fois : plus de client laissé à quai.",
        "Le choix devient uniquement un problème d'ordre, et le temps aux arrêts (7 × 6 = 42 min) et les kilomètres du septième arrêt pèsent davantage : à vérifier face au train (la tournée dans l'ordre de la fiche, à sept arrêts, fait 23,9 km et arrive à 16 h 42 : train manqué)."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Avant de partir, on vérifie que le poids chargé ne dépasse pas la ………………….",
      "rep": "charge utile."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Heure d'arrivée = heure de départ + temps de ………………… + temps aux arrêts.",
      "rep": "route."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Changer l'ordre des arrêts change les kilomètres, donc le ………………….",
      "rep": "temps."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Quand tout ne rentre pas, on choisit ce qui reste à quai en ………………… ce qu'il faut retirer.",
      "rep": "calculant."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "tableau",
      "texte": "Mot | Définition (complète avec la banque de mots)",
      "entetes": [
        "Mot",
        "Définition (complète avec la banque de mots)"
      ],
      "contexte": "",
      "reponses": [
        [
          "Tournée",
          "livre"
        ],
        [
          "Charge utile",
          "maximal"
        ],
        [
          "Ordre de passage",
          "sert"
        ],
        [
          "Temps de route",
          "vitesse"
        ],
        [
          "Temps aux arrêts",
          "arrêt"
        ],
        [
          "Contrainte",
          "dépasser"
        ],
        [
          "Vélo-cargo",
          "transporte"
        ],
        [
          "Laisser à quai",
          "jour"
        ]
      ],
      "note": "Un mot de la banque par trou."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Poids total des cinq commandes (kg)",
      "rep": "445 kg."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Poids à laisser à quai, au moins (kg)",
      "rep": "115 kg (445 − 330)."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Quel client laisses-tu à quai ?",
      "rep": "D (140 kg) : le seul qui suffit à lui seul."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Temps de route (min)",
      "rep": "36 min (18 ÷ 30 × 60)."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Temps aux arrêts (min)",
      "rep": "40 min (4 × 10)."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Heure de retour",
      "rep": "9 h 16 (8 h 00 + 36 + 40 min)."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Si deux clients pesaient chacun plus que le poids à retirer, lequel laisserais-tu à quai ? Explique.",
      "pistes": [
        "Le plus léger des deux : on laisse le moins possible à quai.",
        "Ou celui qui est le moins pressé, ou le plus loin : toute raison argumentée."
      ]
    }
  ]
};
