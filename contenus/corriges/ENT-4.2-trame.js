// Généré par outils/trame-picard-deux-camions.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-4.2",
  "titre": "Picard — deux camions, un seul quai",
  "trame": "ENT-4.2-picard-deux-camions-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Comprendre le camion frigorifique",
      "genre": "question",
      "texte": "À quoi sert le groupe froid d'un camion frigorifique ?",
      "rep": "C'est la machine frigorifique du camion : elle produit le froid et garde la remorque à la température de consigne pendant tout le trajet.",
      "note": "Définition de métier ; recherche « groupe froid camion frigorifique »."
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre le camion frigorifique",
      "genre": "question",
      "texte": "Que mesure l'enregistreur de température d'un camion ?",
      "rep": "La température de l'air dans la remorque, à intervalles réguliers (ici toutes les 15 minutes), du départ à l'arrivée ; il l'imprime sur un ticket.",
      "note": "Pour les surgelés, le transport doit être équipé d'instruments qui enregistrent la température de l'air (règlement (CE) n° 37/2005)."
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre le camion frigorifique",
      "genre": "qcm",
      "texte": "Le groupe froid d'un camion tombe en panne pendant le trajet. Sur le ticket de l'enregistreur, on voit :",
      "choix": [
        "la température qui monte",
        "la température qui descend",
        "rien de spécial"
      ],
      "bonne": 0,
      "explication": "Sans groupe froid, rien ne retient la chaleur : la température de l'air de la remorque monte, et le ticket de l'enregistreur le montre (c'est à ça qu'il sert).",
      "notion": "Chaîne du froid — transport"
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre le camion frigorifique",
      "genre": "fait",
      "texte": "Que veut dire « sonder à cœur » ?",
      "rep": "Planter une sonde au centre d'un carton pour lire la température du produit lui-même (pas celle de l'air)."
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre le camion frigorifique",
      "genre": "reflexion",
      "texte": "Un camion arrive avec un ticket parfait. Pourquoi faut-il quand même sonder ses palettes ?",
      "pistes": [
        "Le ticket mesure l'air de la remorque, pas le produit : une palette peut avoir chauffé avant d'être chargée.",
        "Un produit peut avoir été mal congelé chez le fournisseur.",
        "C'est la règle du quai : aucune marchandise ne rentre sans contrôle de température."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire le message",
      "genre": "tableau",
      "texte": "Information | Premier camion arrivé | Second camion arrivé",
      "entetes": [
        "Information",
        "Premier camion arrivé",
        "Second camion arrivé"
      ],
      "contexte": "Connecte-toi à Prepalog, ouvre la rubrique Simulog, puis l'activité « Picard — deux camions, un seul quai ». Dans le menu de gauche, clique sur « Messagerie » et ouvre le message du chef de quai : « Quai 32 : deux camions ce matin ».",
      "reponses": [
        [
          "Heure d'arrivée",
          "06:00 (Glaces Néviane)",
          "06:10 (Légumes d'Orvalle)"
        ],
        [
          "Fournisseur",
          "Glaces Néviane (fictif)",
          "Légumes d'Orvalle (fictif)"
        ],
        [
          "Transporteur",
          "Transports Hivernel (fictif)",
          "Transports Calvenor (fictif)"
        ],
        [
          "Nombre de palettes",
          "3",
          "5"
        ],
        [
          "Ce qu'il transporte",
          "des glaces",
          "des légumes surgelés"
        ]
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire le message",
      "genre": "fait",
      "texte": "Combien de quais as-tu pour décharger ?",
      "rep": "Un seul (le quai 32) : un camion à la fois."
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire le message",
      "genre": "fait",
      "texte": "Que dois-tu lire avant de décider de l'ordre ?",
      "rep": "Les deux tickets de température (un par camion)."
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire le message",
      "genre": "reflexion",
      "texte": "Avant d'avoir vu les tickets, quel camion aurais-tu fait décharger en premier ? Explique ton idée.",
      "pistes": [
        "Réponse de prévision, toutes recevables : « le premier arrivé », « celui qui a le plus de palettes », « les glaces, plus fragiles »…",
        "On y revient à l'étape 3 : l'intérêt est de voir si le ticket fait changer d'avis."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Lire les deux tickets et choisir l'ordre",
      "genre": "tableau",
      "texte": "Heure | Camion Glaces Néviane | Camion Légumes d'Orvalle",
      "entetes": [
        "Heure",
        "Camion Glaces Néviane",
        "Camion Légumes d'Orvalle"
      ],
      "contexte": "Dans le menu de gauche, clique sur « Quai de réception ». Tu es à l'étape ① « Les camions arrivent ». Les deux camions sont présentés l'un sous l'autre, chacun avec son bon de livraison et son ticket.",
      "reponses": [
        [
          "05:00",
          "−20,3 °C",
          "−20,8 °C"
        ],
        [
          "05:30",
          "−19,3 °C",
          "−20,6 °C"
        ],
        [
          "05:45",
          "−18,5 °C",
          "−20,7 °C"
        ],
        [
          "06:00",
          "−17,4 °C",
          "−21,0 °C"
        ],
        [
          "Ce que montre le ticket",
          "La température remonte encore à l'arrivée, de plus en plus vite : le groupe froid faiblit",
          "Rien à signaler : la température est restée stable"
        ]
      ],
      "note": "Ticket Glaces Néviane : stable vers −21 °C jusqu'à 04:30, puis 04:45 −20,6 · 05:00 −20,3 · 05:15 −19,9 · 05:30 −19,3 · 05:45 −18,5 · 06:00 −17,4. Le ticket Légumes est le seul juste à « rien à signaler »."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire les deux tickets et choisir l'ordre",
      "genre": "fait",
      "texte": "Le camion que tu fais décharger en premier",
      "rep": "Le camion Glaces Néviane."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire les deux tickets et choisir l'ordre",
      "genre": "fait",
      "texte": "La raison que tu as choisie",
      "rep": "« Le ticket des Glaces Néviane montre que leur froid faiblit : les glaces se réchauffent si le camion attend. »",
      "note": "Le jalon exige le bon camion ET cette phrase. « Arrivé le premier » donne le bon camion pour une mauvaise raison : jalon faux."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire les deux tickets et choisir l'ordre",
      "genre": "reflexion",
      "texte": "Qu'est-ce qui, sur les tickets, t'a fait choisir ton premier camion ?",
      "pistes": [
        "La dernière heure du ticket des glaces : la température monte de plus en plus vite.",
        "Le ticket des légumes est stable : ce camion peut attendre sans dommage.",
        "Valoriser l'élève qui cite des valeurs lues (−18,5 puis −17,4 °C)."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Lire les deux tickets et choisir l'ordre",
      "genre": "reflexion",
      "texte": "Compare avec ta réponse de l'étape 2. As-tu changé d'avis ? Explique.",
      "pistes": [
        "Réponse personnelle. Intéressant : l'élève qui voulait « le premier arrivé » et qui garde le même camion pour une autre raison.",
        "Ou celui qui change d'avis grâce au ticket : c'est le but de la séance (adapter l'organisation à un aléa, C1.3)."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Réceptionner le premier camion",
      "genre": "tableau",
      "texte": "Palette | Cartons comptés | BL | T° à cœur | Étiquette = BL ? | Décision — motif",
      "entetes": [
        "Palette",
        "Cartons comptés",
        "BL",
        "T° à cœur",
        "Étiquette = BL ?",
        "Décision — motif"
      ],
      "contexte": "Clique sur « Oui, vous pouvez ouvrir et décharger ». Le temps hors froid de CE lot démarre ; l'autre camion attend porte fermée. Quand les palettes sont posées, clique sur « Contrôler les palettes → ».",
      "reponses": [
        [
          "A1",
          "36",
          "36",
          "−17,5 °C",
          "oui (GVA-2500)",
          "Accepter avec réserves — température"
        ],
        [
          "A2",
          "18 + 6",
          "18 + 6",
          "−17,5 °C",
          "oui (SCI-500 et SFR-500)",
          "Accepter avec réserves — température"
        ],
        [
          "A3",
          "48",
          "48",
          "−17,5 °C",
          "oui (BCH-060)",
          "Accepter avec réserves — température"
        ],
        [
          "",
          "",
          "",
          "",
          "",
          ""
        ],
        [
          "",
          "",
          "",
          "",
          "",
          ""
        ]
      ],
      "note": "Si l'élève a pris le bon ordre (glaces d'abord). A2 porte deux références : 3 couches de sorbet citron (18) + 1 couche de framboise (6), à compter séparément. Les glaces se sont un peu réchauffées pendant la lecture des tickets : entre −18 et −15 °C, donc acceptées avec réserves (règle du quai). Si l'élève a pris les légumes d'abord, ce tableau porte les palettes B (voir l'étape 5)."
    },
    {
      "etape": 4,
      "etapeTitre": "Réceptionner le premier camion",
      "genre": "fait",
      "texte": "Temps hors froid de ce lot quand il entre en chambre froide",
      "rep": "Variable : environ 13 à 15 minutes pour le lot de glaces (3 palettes) en bon ordre.",
      "note": "Une jauge par camion : elle démarre à l'ouverture de son camion, s'arrête quand son lot entre en chambre froide."
    },
    {
      "etape": 4,
      "etapeTitre": "Réceptionner le premier camion",
      "genre": "fait",
      "texte": "Combien de lignes as-tu écrites sur le BL ?",
      "rep": "3 pour le camion de glaces en bon ordre (une ligne de réserve « température » par palette).",
      "note": "Ex. : « A1 GVA-2500 : acceptée sous réserve — température à cœur −17,5 °C (−18 °C exigé). »"
    },
    {
      "etape": 4,
      "etapeTitre": "Réceptionner le premier camion",
      "genre": "reflexion",
      "texte": "Quelle palette de ce camion t'a demandé le plus de réflexion pour décider ? Explique.",
      "pistes": [
        "A2 (deux références sur une palette) ou la décision « avec réserves » pour une glace à −17,5 °C, ni bonne ni à refuser.",
        "Valoriser l'élève qui cite la règle du quai pour justifier."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Réceptionner le second camion",
      "genre": "tableau",
      "texte": "Palette | Cartons comptés | BL | T° à cœur | Étiquette = BL ? | Décision — motif",
      "entetes": [
        "Palette",
        "Cartons comptés",
        "BL",
        "T° à cœur",
        "Étiquette = BL ?",
        "Décision — motif"
      ],
      "contexte": "Clique sur « Faire mettre à quai le camion … et décharger ». La manœuvre prend 3 minutes, puis le déchargement commence. Mêmes gestes qu'à l'étape 4, palette par palette.",
      "reponses": [
        [
          "B1",
          "60",
          "60",
          "−21,0 °C",
          "oui (PPO-1000)",
          "Accepter — aucun motif"
        ],
        [
          "B2",
          "36",
          "36",
          "−14,8 °C",
          "oui (POE-750)",
          "Refuser — température"
        ],
        [
          "B3",
          "30",
          "30",
          "−20,6 °C",
          "NON : face avant déchirée ; face arrière CFL-1000 (chou-fleur) au lieu de BRO-1000",
          "Refuser — produit différent"
        ],
        [
          "B4",
          "31",
          "32",
          "−20,2 °C",
          "oui (HBE-1000)",
          "Accepter avec réserves — manquant (1)"
        ],
        [
          "B5",
          "45",
          "45",
          "−20,8 °C",
          "oui (CAR-1000)",
          "Accepter — aucun motif"
        ]
      ],
      "note": "Si l'élève a pris le bon ordre (légumes en second). B2 : chaude malgré un ticket parfait, seule la sonde la trouve. B3 : le refus n'est juste que si l'étiquette arrière a été lue. B4 : le carton manquant est dans le coin du fond, en haut. Mauvais ordre : ce tableau porte les glaces, toutes à refuser (température au-dessus de −15 °C)."
    },
    {
      "etape": 5,
      "etapeTitre": "Réceptionner le second camion",
      "genre": "fait",
      "texte": "Temps hors froid de ce second lot",
      "rep": "Variable : environ 15 à 20 minutes pour les 5 palettes de légumes.",
      "note": "Le second lot ne démarre qu'à l'ouverture de son camion : l'attente porte fermée ne compte pas dans sa jauge."
    },
    {
      "etape": 5,
      "etapeTitre": "Réceptionner le second camion",
      "genre": "fait",
      "texte": "Que deviennent les palettes que tu as refusées ?",
      "rep": "Elles restent au quai et repartent dans le camion avec le chauffeur (B2 et B3 en bon ordre).",
      "note": "Si l'élève a pris les légumes d'abord : les trois palettes de glaces sont aussi refusées."
    },
    {
      "etape": 5,
      "etapeTitre": "Réceptionner le second camion",
      "genre": "reflexion",
      "texte": "Ce camion a attendu porte fermée pendant toute ta première réception. Qu'est-ce que cette attente a changé pour lui ?",
      "pistes": [
        "Bon ordre (légumes en second) : rien, son groupe froid tient, ses légumes sont restés à −21 °C.",
        "Mauvais ordre (glaces en second) : les glaces ont continué de se réchauffer, au-dessus de −15 °C : tout le camion est refusé.",
        "Valoriser l'élève qui relie l'attente à la température relevée à la sonde."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Lire ton bilan",
      "genre": "fait",
      "texte": "La ligne « Ordre de déchargement et justification » : juste ou à revoir ?",
      "rep": "Juste si l'élève a choisi le camion Glaces Néviane ET la phrase sur le froid qui faiblit.",
      "note": "Variable selon l'élève."
    },
    {
      "etape": 6,
      "etapeTitre": "Lire ton bilan",
      "genre": "fait",
      "texte": "Combien de lignes sont marquées « ✗ à revoir » ?",
      "rep": "Variable selon l'élève (0 pour un parcours parfait, sur 30 jalons)."
    },
    {
      "etape": 6,
      "etapeTitre": "Lire ton bilan",
      "genre": "fait",
      "texte": "Température à cœur des glaces quand tu les as sondées",
      "rep": "−17,5 °C si les glaces ont été déchargées en premier ; au-dessus de −15 °C (−14,9 °C au mieux) si elles ont attendu.",
      "note": "+0,25 °C par minute d'attente porte fermée, à partir de −18,5 °C à 06:10 (valeurs construites)."
    },
    {
      "etape": 6,
      "etapeTitre": "Lire ton bilan",
      "genre": "reflexion",
      "texte": "Si tu avais choisi l'autre camion en premier, qu'est-ce qui aurait changé pour les glaces ?",
      "pistes": [
        "Bon ordre choisi : les glaces auraient attendu au moins 14 minutes de plus et dépassé −15 °C : refusées, perdues pour Picard.",
        "Mauvais ordre choisi : en les prenant d'abord, elles seraient restées vers −17,5 °C, acceptées avec réserves.",
        "L'idée : l'ordre de réception a des conséquences sur la marchandise, pas seulement sur le temps."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Lire ton bilan",
      "genre": "reflexion",
      "texte": "Choisis une ligne « à revoir » de ton bilan (ou, si tout est juste, ta décision la plus difficile). Qu'aurais-tu fait autrement ?",
      "pistes": [
        "Réponse personnelle : relier l'erreur à un geste (faire le tour, lire l'étiquette arrière de B3, compter les deux références de A2, sonder B2 malgré le ticket parfait).",
        "S'il n'a rien à revoir : la décision la plus difficile, et pourquoi."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Lire ton bilan",
      "genre": "reflexion",
      "texte": "Dans une vraie entreprise, qui faut-il prévenir quand un camion arrive avec un groupe froid qui faiblit ?",
      "pistes": [
        "Le chef de quai, pour décider de l'ordre et des suites.",
        "Le transporteur (son camion doit être réparé), et le fournisseur.",
        "Le service qualité de l'entrepôt.",
        "Accepter toute réponse qui montre qu'un aléa se signale, il ne se garde pas pour soi."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Quand plusieurs camions attendent pour un seul quai, on choisit l'………………… de déchargement en lisant leurs tickets.",
      "rep": "ordre."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "On fait passer en premier le camion dont la marchandise risque le plus de se ………………….",
      "rep": "réchauffer."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Un camion qui attend porte ………………… ne garde son froid que si son groupe froid marche.",
      "rep": "fermée."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Chaque camion a son propre temps hors froid : il commence à l'ouverture de sa ………………….",
      "rep": "porte."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "tableau",
      "texte": "Mot | Définition (complète avec la banque de mots)",
      "entetes": [
        "Mot",
        "Définition (complète avec la banque de mots)"
      ],
      "contexte": "Le bilan compare, ligne par ligne, ce que tu as fait et ce qui était attendu. Chaque ligne finit par « ✓ juste » ou « ✗ à revoir ». Lis-le en entier.",
      "reponses": [
        [
          "Quai",
          "déchargé"
        ],
        [
          "Aléa",
          "imprévu"
        ],
        [
          "Ordre de déchargement",
          "passer"
        ],
        [
          "Temps hors froid",
          "chambre froide"
        ],
        [
          "Chambre froide",
          "maintenu"
        ],
        [
          "Palette multi-références",
          "produits"
        ],
        [
          "Réserve",
          "chauffeur"
        ],
        [
          "Chaîne du froid",
          "coupure"
        ]
      ],
      "note": "Un mot de la banque par trou."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "tableau",
      "texte": "Heure | Camion A (viandes surgelées) | Camion B (crèmes glacées)",
      "entetes": [
        "Heure",
        "Camion A (viandes surgelées)",
        "Camion B (crèmes glacées)"
      ],
      "contexte": "Mercredi, 5 h 30. Deux camions arrivent en même temps. Tu n'as qu'un quai. Voici leurs tickets (consigne : −20 °C pour les deux).",
      "reponses": [
        [
          "Ce que montre le ticket",
          "Rien à signaler : la température est stable",
          "La température remonte de plus en plus vite : le groupe froid faiblit"
        ]
      ],
      "note": "Seule la dernière ligne est à compléter."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Quel camion fais-tu décharger en premier ?",
      "rep": "Le camion B (crèmes glacées)."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "question",
      "texte": "Écris en une phrase, pour le chef de quai, la raison de ton choix.",
      "rep": "« Le ticket du camion B montre que son froid faiblit : les glaces se réchauffent s'il attend. »"
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Température du camion B après 20 minutes d'attente",
      "rep": "−14,0 °C.",
      "note": "−18,0 + 20 × 0,2 = −18,0 + 4,0."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Que faudrait-il faire alors de ses palettes ?",
      "rep": "Les refuser : −14,0 °C est plus chaud que −15 °C."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Un troisième camion arrive, avec un ticket parfait. À quelle place le mets-tu ? Explique.",
      "pistes": [
        "Après B, et sans doute après A ou à égalité : un ticket parfait peut attendre porte fermée.",
        "Valoriser l'élève qui pense à sonder quand même ses palettes."
      ]
    }
  ]
};
