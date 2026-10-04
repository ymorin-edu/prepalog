// Généré par outils/trame-cdiscount-inventaire.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-2.3",
  "titre": "Cdiscount — inventaire tournant",
  "trame": "ENT-2.3-cdiscount-inventaire-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "L'inventaire, à quoi ça sert ?",
      "genre": "question",
      "texte": "Qu'est-ce qu'un inventaire tournant ?",
      "rep": "Un inventaire fait par petites parties (une allée, une famille d'articles) tout au long de l'année, sans arrêter l'activité, au lieu de tout compter en une fois.",
      "note": "Accepter toute définition qui dit « par parties » et « au fil de l'année »."
    },
    {
      "etape": 1,
      "etapeTitre": "L'inventaire, à quoi ça sert ?",
      "genre": "fait",
      "texte": "D'après l'article L123-12, tous les combien faut-il faire un inventaire, au moins ?",
      "rep": "Au moins une fois tous les douze mois.",
      "note": "Code de commerce, art. L123-12 : « Elle doit contrôler par inventaire, au moins une fois tous les douze mois, l'existence et la valeur des éléments actifs et passifs du patrimoine de l'entreprise. » L'inventaire tournant permet d'y répondre sans fermer l'entrepôt."
    },
    {
      "etape": 1,
      "etapeTitre": "L'inventaire, à quoi ça sert ?",
      "genre": "qcm",
      "texte": "La démarque inconnue, c'est :",
      "choix": [
        "une perte de stock dont on ne connaît pas la cause",
        "une casse constatée par écrit",
        "une baisse de prix"
      ],
      "bonne": 0,
      "explication": "La démarque inconnue est la différence entre le stock du système et le stock réel quand on n'en connaît pas la cause (vol, erreur non retrouvée, perte). La démarque connue a une cause identifiée (casse constatée, produit périmé).",
      "notion": "Démarque inconnue"
    },
    {
      "etape": 1,
      "etapeTitre": "L'inventaire, à quoi ça sert ?",
      "genre": "reflexion",
      "texte": "D'après ce que tu as trouvé, pourquoi un entrepôt qui expédie tous les jours préfère-t-il l'inventaire tournant à un grand inventaire une fois par an ?",
      "pistes": [
        "On n'arrête pas les expéditions : on compte une petite zone à la fois.",
        "Les erreurs sont trouvées plus tôt, avant qu'elles fassent vendre ce qu'on n'a pas (ENT-2.1).",
        "On peut viser les références à risque (ENT-2.2).",
        "Avant le Black Friday, fermer l'entrepôt pour compter serait impossible."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Redonner ta liste à Nadia",
      "genre": "tableau",
      "texte": "Ce que tu relèves | Références",
      "entetes": [
        "Ce que tu relèves",
        "Références"
      ],
      "contexte": "Ouvre l'activité « Cdiscount — inventaire tournant ». Si tu cliques sur « Inventaire », l'écran est en attente : il lui faut d'abord ta liste.",
      "reponses": [
        [
          "Les références que Nadia confirme",
          "Celles de la liste de l'élève (bonne liste : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01)"
        ],
        [
          "Les références ajoutées par un message (s'il y en a)",
          "Chaque référence à écart oubliée revient par « Rayon à vérifier : <réf> »"
        ]
      ],
      "note": "La première réponse reconnue fixe la liste. Élève absent en ENT-2.2 : l'enseignant lui dit de répondre « Absent » ; Nadia envoie alors la liste préparée par Mathis Darrigade (la bonne). Un intrus (par exemple ECO-BT-01) se compte aussi : écart 0, aucune décision."
    },
    {
      "etape": 2,
      "etapeTitre": "Redonner ta liste à Nadia",
      "genre": "reflexion",
      "texte": "Un message t'a-t-il ajouté une référence ? Explique pourquoi elle manquait à ta liste, ou pourquoi ta liste était complète.",
      "pistes": [
        "Si oui : souvent BAT-10K (un seul constat en ENT-2.2, on la croit moins urgente) ; une erreur de synthèse ou de recopie.",
        "Si non : la liste venait directement de la synthèse NB.SI (toutes les références à au moins un constat).",
        "L'oubli ne se paie qu'une fois (en ENT-2.2) : ici, la référence est traitée comme les autres."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Lire le relevé et les messages",
      "genre": "fait",
      "texte": "Date du dernier inventaire de l'allée A",
      "rep": "Il y a dix jours (la date est écrite dans la mission).",
      "note": "Calculée à l'ouverture de la séance."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire le relevé et les messages",
      "genre": "fait",
      "texte": "Numéro de la campagne d'inventaire",
      "rep": "INV-2026-52."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire le relevé et les messages",
      "genre": "fait",
      "texte": "Que dit la note du relevé sur l'emplacement A-01-1 ?",
      "rep": "Le bac a été compté d'un coup, boîtes Kabeo en vrac.",
      "note": "Indice : le comptage des câbles est douteux (cartons de chargeurs dedans)."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire le relevé et les messages",
      "genre": "fait",
      "texte": "Que dit la note du relevé sur l'emplacement A-04-2 ?",
      "rep": "Recompté deux fois, bacs voisins vérifiés : rien d'étranger dedans.",
      "note": "Indice : le manque des coques ne vient ni d'un comptage ni d'un rangement."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire le relevé et les messages",
      "genre": "tableau",
      "texte": "De qui ? | Article(s) concerné(s) | Ce que dit le message, en quelques mots",
      "entetes": [
        "De qui ?",
        "Article(s) concerné(s)",
        "Ce que dit le message, en quelques mots"
      ],
      "contexte": "Les messages de l'équipe (sans compter ceux de Nadia et le relevé) :",
      "reponses": [
        [
          "Kevin Larrieu, cariste",
          "Câbles et chargeurs Kabeo (REC-26-0431)",
          "Il croit avoir rangé des cartons de la palette au mauvais endroit, côté A-01"
        ],
        [
          "Inès Lagarde, préparatrice",
          "BAT-10K (CMD-732153, REI-26-0012)",
          "Commande annulée : 2 batteries réintégrées, posées dans un autre bac de A-03"
        ],
        [
          "Service retours",
          "ECO-BT-01 (RET-26-0107)",
          "Retour client remis en stock en A-02-1"
        ],
        [
          "Kevin Larrieu, cariste",
          "SOU-SF-02 (DEM-26-0031)",
          "Une souris cassée, sortie du stock"
        ],
        [
          "Yanis Cazenave, préparateur (s'il y a un oubli)",
          "La référence oubliée",
          "« Rayon à vérifier » : moins (ou plus) d'articles que le système"
        ]
      ],
      "note": "Le retour et la casse concernent des références sans écart (bien saisies) : ce sont des fausses pistes, utiles si l'élève a un intrus."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire le relevé et les messages",
      "genre": "reflexion",
      "texte": "Parmi ces messages, lequel te paraît le plus utile pour ton inventaire ? Explique.",
      "pistes": [
        "Kevin (palette Kabeo) : il explique à la fois les câbles en trop et les chargeurs manquants.",
        "Inès (annulation) : elle explique les batteries manquantes.",
        "Accepter tout choix relié à un écart réel."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Reporter le comptage",
      "genre": "tableau",
      "texte": "Emplacement | Référence | Compté (relevé)",
      "entetes": [
        "Emplacement",
        "Référence",
        "Compté (relevé)"
      ],
      "contexte": "Les messages de l'équipe (sans compter ceux de Nadia et le relevé) :",
      "reponses": [
        [
          "A-01-1",
          "CAB-USBC-1M",
          "67"
        ],
        [
          "A-01-2",
          "CHG-20W",
          "41"
        ],
        [
          "A-03-1",
          "BAT-10K",
          "8"
        ],
        [
          "A-04-2",
          "COQ-UNI-01",
          "25"
        ]
      ],
      "note": "Pour la bonne liste. Intrus éventuels : leur quantité du relevé (ECO 22, SOU 29, CLE 37, AMP 37). Confirmé : + A-05-1 CAS-FIL-01 12, A-05-2 SUP-VOIT 22, A-06-1 CLA-SF-01 9, A-06-2 HUB-USB-4 16."
    },
    {
      "etape": 4,
      "etapeTitre": "Reporter le comptage",
      "genre": "reflexion",
      "texte": "Pourquoi l'équipe compte-t-elle sans voir le stock du système ?",
      "pistes": [
        "Pour ne pas être influencée : si on voit 44, on a tendance à « trouver » 44.",
        "Le comptage doit dire ce qu'on voit, pas confirmer le système."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les écarts",
      "genre": "tableau",
      "texte": "Référence | Système | Compté | Écart (compté − système)",
      "entetes": [
        "Référence",
        "Système",
        "Compté",
        "Écart (compté − système)"
      ],
      "contexte": "Les messages de l'équipe (sans compter ceux de Nadia et le relevé) :",
      "reponses": [
        [
          "CAB-USBC-1M",
          "64",
          "67",
          "+3"
        ],
        [
          "CHG-20W",
          "44",
          "41",
          "−3"
        ],
        [
          "BAT-10K",
          "10",
          "8",
          "−2"
        ],
        [
          "COQ-UNI-01",
          "27",
          "25",
          "−2"
        ]
      ],
      "note": "Confirmé : quatre lignes de plus, écart 0 (CAS 12, SUP 22, CLA 9, HUB 16). Intrus : écart 0."
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les écarts",
      "genre": "fait",
      "texte": "Combien de tes références ont un écart différent de 0 ?",
      "rep": "4.",
      "note": "Les quatre références à écart sont toujours dans le périmètre (liste ou aléa)."
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les écarts",
      "genre": "reflexion",
      "texte": "Regarde tes écarts ensemble, pas un par un. Que remarques-tu ?",
      "pistes": [
        "Le +3 des câbles et le −3 des chargeurs s'annulent : même marque, même taille de carton, voisins en A-01 (message de Kevin).",
        "Tous les écarts ne sont pas des pertes : un surplus existe aussi.",
        "Valoriser l'élève qui fait le lien avant d'ouvrir les mouvements."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Chercher la cause et décider",
      "genre": "tableau",
      "texte": "Référence | Écart | Cause trouvée (mouvement ou message) | Ma décision (et motif)",
      "entetes": [
        "Référence",
        "Écart",
        "Cause trouvée (mouvement ou message)",
        "Ma décision (et motif)"
      ],
      "contexte": "Avant de toucher au stock, cherche la cause de chaque écart. Un écart n'est pas toujours une perte.",
      "reponses": [
        [
          "CAB-USBC-1M",
          "+3",
          "Bac compté d'un coup (note du relevé) ; message de Kevin : cartons de chargeurs rangés côté A-01 ; aucun mouvement n'explique 3 câbles de plus",
          "Demander un recomptage (recompté : 64, écart 0)"
        ],
        [
          "CHG-20W",
          "−3",
          "Mouvements : REC-26-0431 (+30) ; les 3 chargeurs sont dans le bac des câbles",
          "Ne pas régulariser : remettre en rayon"
        ],
        [
          "BAT-10K",
          "−2",
          "Message d'Inès : CMD-732153 annulée, REI-26-0012 (+2) juste, batteries posées dans un autre bac",
          "Ne pas régulariser : remettre en rayon"
        ],
        [
          "COQ-UNI-01",
          "−2",
          "Aucun mouvement, aucun message ; recompté deux fois, bacs voisins vérifiés",
          "Régulariser, motif « Démarque inconnue »"
        ]
      ],
      "note": "Ce sont les quatre décisions jugées justes par l'écran (correction détaillée). Jalons : rangements repérés sans régulariser à tort (CHG, BAT, et pas de régularisation des câbles) ; témoin COQ régularisé avec son motif."
    },
    {
      "etape": 6,
      "etapeTitre": "Chercher la cause et décider",
      "genre": "reflexion",
      "texte": "Pour une référence que tu n'as pas régularisée, qu'est-ce qui t'a convaincu ?",
      "pistes": [
        "CHG-20W : les chargeurs existent, ils sont dans le bac voisin (message de Kevin, surplus des câbles).",
        "BAT-10K : la réintégration est saisie, Inès dit où elle a posé les batteries.",
        "CAB-USBC-1M : régulariser aurait créé trois câbles qui n'existent pas ; le recomptage le montre."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Chercher la cause et décider",
      "genre": "reflexion",
      "texte": "Pour la référence que tu as régularisée (s'il y en a une), comment as-tu su que plus rien n'expliquait l'écart ?",
      "pistes": [
        "COQ-UNI-01 : aucun mouvement, aucun message ; l'équipe a recompté deux fois et vérifié les bacs voisins (note du relevé).",
        "Toutes les pistes écartées : c'est de la démarque inconnue."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Calculer le taux et valider",
      "genre": "tableau",
      "texte": "Ce que je calcule | Mon calcul | Résultat",
      "entetes": [
        "Ce que je calcule",
        "Mon calcul",
        "Résultat"
      ],
      "contexte": "Le taux d'écart dit si l'inventaire est bon : plus il est petit, plus le stock du système est fiable.",
      "reponses": [
        [
          "Somme des écarts, sans leur signe",
          "3 + 3 + 2 + 2",
          "10"
        ],
        [
          "Somme des stocks système",
          "64 + 44 + 10 + 27",
          "145"
        ],
        [
          "Taux d'écart (%), arrondi au dixième",
          "10 ÷ 145 × 100",
          "6,9 %"
        ]
      ],
      "note": "Le taux se calcule sur le périmètre de l'élève, avant traitement (l'écart des câbles compte 3 même après le recomptage). Avec un intrus ECO-BT-01 : 10 ÷ 167 = 6,0 %. Confirmé : 10 ÷ 204 = 4,9 %. L'ancien 3,7 % (allée entière) est faux depuis le recadrage."
    },
    {
      "etape": 7,
      "etapeTitre": "Calculer le taux et valider",
      "genre": "fait",
      "texte": "Combien de décisions justes sur combien ?",
      "rep": "Variable : 4 sur 4 pour un parcours juste.",
      "note": "Phrase de l'écran : « 4 décisions justes sur 4 »."
    },
    {
      "etape": 7,
      "etapeTitre": "Calculer le taux et valider",
      "genre": "fait",
      "texte": "Ton taux d'écart est-il juste ?",
      "rep": "Variable (l'écran écrit « Taux d'écart : juste »)."
    },
    {
      "etape": 7,
      "etapeTitre": "Calculer le taux et valider",
      "genre": "reflexion",
      "texte": "Lis « Ce qu'il fallait voir » pour une ligne de ta correction. Qu'as-tu appris que tu n'avais pas vu ?",
      "pistes": [
        "Réponse personnelle. Le plus souvent : la paire câbles / chargeurs qui s'annule, ou le fait qu'une réintégration juste peut laisser un article au mauvais endroit.",
        "Valoriser l'élève qui relie son erreur à un indice qu'il n'avait pas lu (note du relevé, message)."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Avant de régulariser un écart, on cherche s'il a une ………………… : un mouvement oublié, un article mal rangé…",
      "rep": "explication."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "On ne régularise que l'écart que plus ………………… n'explique.",
      "rep": "rien."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Une régularisation change le stock pour de ………………….",
      "rep": "bon."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Taux d'écart = somme des écarts sans leur signe ÷ somme des stocks du système × ………………….",
      "rep": "100."
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
      "contexte": "Le taux d'écart dit si l'inventaire est bon : plus il est petit, plus le stock du système est fiable.",
      "reponses": [
        [
          "Inventaire",
          "comparer"
        ],
        [
          "Écart d'inventaire",
          "comptée"
        ],
        [
          "Emplacement",
          "niveau"
        ],
        [
          "Recomptage",
          "confirmer"
        ],
        [
          "Relevé d'inventaire",
          "écrit"
        ],
        [
          "Ajustement de stock",
          "motif"
        ],
        [
          "Taux d'écart",
          "pourcentage"
        ],
        [
          "Stock du système",
          "affiche"
        ]
      ],
      "note": "Un mot de la banque par trou."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "tableau",
      "texte": "Référence | Système | Compté | Écart | Ta décision",
      "entetes": [
        "Référence",
        "Système",
        "Compté",
        "Écart",
        "Ta décision"
      ],
      "contexte": "Tu as compté cinq références. Deux informations sont arrivées : « 2 chargeurs CHG-USB attendent au poste des retours, pas encore rangés » et « la souris SOU-SF reçue ce matin n'est pas encore saisie ».",
      "reponses": [
        [
          "PIL-AA",
          "40",
          "40",
          "0",
          "rien à faire"
        ],
        [
          "CHG-USB",
          "15",
          "13",
          "−2",
          "ne pas régulariser : ranger les 2 chargeurs du poste des retours"
        ],
        [
          "ECO-BT",
          "8",
          "5",
          "−3",
          "recompter, puis régulariser (−3) si l'écart se confirme"
        ],
        [
          "CAB-HDMI",
          "12",
          "12",
          "0",
          "rien à faire"
        ],
        [
          "SOU-SF",
          "6",
          "7",
          "+1",
          "ne pas régulariser : saisir la réception de ce matin"
        ]
      ]
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Combien de références sont en écart ?",
      "rep": "3."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Taux d'écart (en %, arrondi au dixième) = somme des écarts sans leur signe ÷ somme des stocks du système × 100",
      "rep": "7,4 %.",
      "note": "Règle de l'écran d'ENT-2.3 : (2 + 3 + 1) ÷ (40 + 15 + 8 + 12 + 6) × 100 = 6 ÷ 81 × 100 = 7,41. Corrigé le 04/10 : la première version calculait 3 références sur 5 (60 %), ce qui n'est pas la règle de la séance."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "question",
      "texte": "Pour la référence que tu régularises, qu'est-ce qui te permet de le faire ?",
      "rep": "ECO-BT : aucune information n'explique l'écart, et le recomptage le confirme."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Si tu avais régularisé les trois écarts tout de suite, que serait devenu le stock du système le lendemain ?",
      "pistes": [
        "Faux pour CHG-USB et SOU-SF : une fois les chargeurs rangés et la souris saisie, l'écart repartirait dans l'autre sens.",
        "CHG-USB : le système passerait à 13 ; une fois les 2 chargeurs rangés, il y en aurait 15 au rayon pour 13 au système.",
        "SOU-SF : le système passerait à 7 ; une fois la réception saisie (+1), il dirait 8 pour 7 au rayon.",
        "Valoriser l'élève qui chiffre la nouvelle erreur créée."
      ]
    }
  ]
};
