// Généré par outils/trame-spartoo.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-1.2",
  "titre": "Spartoo — préparer une commande",
  "trame": "ENT-1.2-spartoo-preparation-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Ouvrir ton environnement de travail",
      "genre": "fait",
      "texte": "Combien de messages non lus t'attendent en arrivant ?",
      "rep": "3 ou 4 : « Bienvenue chez Spartoo » (reçu en ENT-1.1) si elle n'a pas été ouverte, « Question sur les Stan Smith blanches », « Nouvelle commande web n° CMD-048213 », et la réponse de Puma aux réserves d'ENT-1.1 si l'élève ne l'a pas encore ouverte.",
      "note": "Vérifié le 02/10/2026 en jouant ENT-1.1 puis ENT-1.2 : 3 non lus si la réponse de Puma a été ouverte, 4 sinon. Un élève qui a déjà ouvert « Bienvenue » en a moins. Contrôler sur son écran. Sur une base neuve sans ENT-1.1 : 2 (la bienvenue arrive en ENT-1.1)."
    },
    {
      "etape": 1,
      "etapeTitre": "Ouvrir ton environnement de travail",
      "genre": "fait",
      "texte": "Combien de paires y a-t-il en stock au total ?",
      "rep": "4 593 paires (4 569 au départ + les 24 paires réceptionnées en ENT-1.1).",
      "note": "Vérifié le 02/10/2026 en jouant ENT-1.1 puis ENT-1.2. Les séances se font dans l'ordre : le total suppose la réception d'ENT-1.1 validée comme attendu (24 paires). Un élève qui n'a pas fait ENT-1.1 lit 4 569."
    },
    {
      "etape": 1,
      "etapeTitre": "Ouvrir ton environnement de travail",
      "genre": "fait",
      "texte": "Combien de références sont en rupture ?",
      "rep": "47 références en rupture (stock à 0).",
      "note": "Valeur de la tuile « références en rupture » de l'accueil. La réception d'ENT-1.1 ne change pas ce nombre (elle n'entre aucune référence en rupture)."
    },
    {
      "etape": 1,
      "etapeTitre": "Ouvrir ton environnement de travail",
      "genre": "reflexion",
      "texte": "Parmi ces trois chiffres, lequel un responsable de stock doit-il regarder en premier le matin ?",
      "pistes": [
        "Les ruptures : elles empêchent de servir un client, donc elles sont à traiter en premier.",
        "On peut aussi défendre les messages non lus (une commande ou une question attend) : accepter si c'est justifié.",
        "Le stock total seul ne dit pas ce qui manque : il rassure à tort."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "fait",
      "texte": "Combien de fournisseurs sont référencés ?",
      "rep": "10 (F001 à F010).",
      "note": "Peut être plus si l'élève en a ajouté avec .addsupplier."
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "tableau",
      "texte": "Code (par exemple F001) | Trois marques fournisseurs",
      "entetes": [
        "Code (par exemple F001)",
        "Trois marques fournisseurs"
      ],
      "contexte": "Dans le menu de gauche, ouvre l'écran Fournisseurs : ce sont les marques de chaussures qui livrent Spartoo.",
      "reponses": [
        [
          "F001",
          "Nike"
        ],
        [
          "F002",
          "adidas"
        ],
        [
          "F003",
          "Puma"
        ]
      ],
      "note": "N'importe quels trois parmi : F001 Nike, F002 adidas, F003 Puma, F004 New Balance, F005 Converse, F006 Vans, F007 ASICS, F008 Reebok, F009 Skechers, F010 Timberland."
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "fait",
      "texte": "Choisis un de ces fournisseurs : quel est son délai de livraison ?",
      "rep": "Selon le fournisseur choisi : Nike 3 j, adidas 4 j, Puma 4 j, New Balance 5 j, Converse 6 j, Vans 5 j, ASICS 4 j, Reebok 5 j, Skechers 3 j, Timberland 6 j."
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "fait",
      "texte": "Quel est son minimum de commande ?",
      "rep": "Selon le fournisseur : Nike 24 paires, adidas 20, Puma 20, New Balance 24, Converse 16, Vans 16, ASICS 20, Reebok 16, Skechers 12, Timberland 24."
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "fait",
      "texte": "Les clients de Spartoo sont-ils des entreprises ou des particuliers ?",
      "rep": "Des particuliers.",
      "note": "Les 32 clients ont un prénom, un nom, une adresse personnelle et une ville : ce sont des personnes, pas des sociétés."
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "tableau",
      "texte": "Code | Deux clients : nom | Ville",
      "entetes": [
        "Code",
        "Deux clients : nom",
        "Ville"
      ],
      "contexte": "Ouvre maintenant l'écran Clients.",
      "reponses": [
        [
          "C0001",
          "Camille Thomas",
          "Lille"
        ],
        [
          "C0002",
          "Lucas Laurent",
          "Rennes"
        ]
      ],
      "note": "N'importe quels deux parmi les 32 clients (C0001 à C0032)."
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "qcm",
      "texte": "Entre un fournisseur et Spartoo, qu'est-ce qui circule ?",
      "choix": [
        "de l'argent seulement",
        "des marchandises seulement",
        "des marchandises dans un sens, de l'argent dans l'autre"
      ],
      "bonne": 2,
      "explication": "Les marchandises vont du fournisseur vers l'entreprise, l'argent (paiement) circule en sens inverse.",
      "notion": "Module 1 — échanges entre agents économiques, circuit économique"
    },
    {
      "etape": 2,
      "etapeTitre": "Repérer les fournisseurs et les clients",
      "genre": "reflexion",
      "texte": "Qu'as-tu observé dans l'écran Clients qui te permet de dire s'il s'agit d'entreprises ou de particuliers ?",
      "pistes": [
        "Les clients ont un prénom et un nom (pas un nom de société), une adresse de particulier (rue, ville), un e-mail personnel.",
        "On ne trouve ni raison sociale, ni SIRET, ni numéro de TVA : indices d'un client particulier (B2C)."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Comprendre la console et la commande .help",
      "genre": "fait",
      "texte": "Par quel caractère commence toujours une commande ?",
      "rep": "Par un point (« . »).",
      "note": "Message de la console : « Une commande commence par un point. »"
    },
    {
      "etape": 3,
      "etapeTitre": "Comprendre la console et la commande .help",
      "genre": "tableau",
      "texte": "Commande | Ce qu'elle fait",
      "entetes": [
        "Commande",
        "Ce qu'elle fait"
      ],
      "contexte": "Cite 3 commandes de la liste (par exemple .getstock) et explique en une phrase ce que fait chacune :",
      "reponses": [
        [
          ".getstock <réf>",
          "Donne le stock d'une référence article ou d'un modèle."
        ],
        [
          ".getprice <réf>",
          "Donne le prix de vente et le prix d'achat."
        ],
        [
          ".getsupplier <code ou marque>",
          "Affiche la fiche d'un fournisseur."
        ]
      ],
      "note": "Toute commande de la liste de .help est acceptée : .find, .getproduct, .getlocation, .lowstock, .stockvalue, .getclient, .getorder, .movements, .getlot, .setstock, .addstock, .removestock, .addclient, .addsupplier, .clear."
    },
    {
      "etape": 3,
      "etapeTitre": "Comprendre la console et la commande .help",
      "genre": "fait",
      "texte": "Avec .getprice PM-SUE, quel est le prix de vente TTC ?",
      "rep": "89,99 € TTC.",
      "note": "Puma Suede Classic XXI."
    },
    {
      "etape": 3,
      "etapeTitre": "Comprendre la console et la commande .help",
      "genre": "fait",
      "texte": "Avec .getprice PM-SUE, quel est le prix d'achat HT ?",
      "rep": "41,00 € HT.",
      "note": "Prix de vente HT : 74,99 €, marge brute 33,99 € (45 %)."
    },
    {
      "etape": 3,
      "etapeTitre": "Comprendre la console et la commande .help",
      "genre": "fait",
      "texte": "Avec .getsupplier Puma, quel est le délai de livraison de ce fournisseur ?",
      "rep": "4 jours.",
      "note": "Minimum de commande Puma : 20 paires ; franco 1 000 €."
    },
    {
      "etape": 3,
      "etapeTitre": "Comprendre la console et la commande .help",
      "genre": "reflexion",
      "texte": "Parmi les commandes que tu viens d'essayer, laquelle serait la plus utile à un responsable de stock au quotidien ?",
      "pistes": [
        ".getstock : elle répond à la question qui revient tout le temps (« combien en reste-t-il ? »).",
        ".lowstock ou .getprice peuvent aussi être défendues. L'important est la justification liée au métier d'un responsable de stock."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "fait",
      "texte": "Quel est l'objet du message de Léa Dubois ?",
      "rep": "« Question sur les Stan Smith blanches »."
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "question",
      "texte": "Que demande-t-elle exactement ?",
      "rep": "Si Spartoo a des Stan Smith blanches en pointure 44 en stock, et combien de paires."
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "tableau",
      "texte": "Marque | Modèle | Couleur | Pointure",
      "entetes": [
        "Marque",
        "Modèle",
        "Couleur",
        "Pointure"
      ],
      "contexte": "Note ce que tu as trouvé sur l'article demandé :",
      "reponses": [
        [
          "adidas",
          "Stan Smith",
          "Blanc",
          "44"
        ]
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "fait",
      "texte": "Quelle est la référence article complète correspondante ?",
      "rep": "AD-STS-BL-44 (adidas, Stan Smith, blanc, pointure 44)."
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "fait",
      "texte": "Quelle commande de la console permet de connaître son stock ?",
      "rep": ".getstock AD-STS-BL-44 (ou .getstock suivi de la référence)."
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "fait",
      "texte": "Combien de paires sont disponibles ?",
      "rep": "3 paires.",
      "note": "Valeur de départ du catalogue. C'est ce nombre, écrit en chiffres, que le jalon cherche dans la réponse de l'élève."
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "brouillon",
      "texte": "Brouillon de ta réponse à Léa Dubois :",
      "modele": "Bonjour Madame,\n\nMerci pour votre message. Nous avons actuellement 3 paires de Stan Smith blanches en pointure 44 en stock.\n\nN'hésitez pas à nous contacter pour toute autre question.\n\nCordialement,\n[prénom]\nService logistique, Spartoo",
      "criteres": [
        "Le nombre de paires écrit en CHIFFRES (3) : c'est ce que vérifie le suivi.",
        "Formule de politesse au début et à la fin.",
        "Information claire en une lecture : combien, quel article, quelle pointure.",
        "Signature (prénom, service).",
        "Orthographe soignée, phrases complètes, pas d'abréviations."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "qcm",
      "texte": "Léa Dubois est une cliente. S'il n'y a plus de stock, que doit faire le vendeur ?",
      "choix": [
        "lui dire que le produit n'est pas disponible",
        "lui envoyer un autre produit sans la prévenir",
        "ne pas lui répondre"
      ],
      "bonne": 0,
      "explication": "Le vendeur doit informer honnêtement le consommateur, notamment de l'indisponibilité d'un produit.",
      "notion": "Module 2 — consommateur, obligation d'information"
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à une question client sur le stock",
      "genre": "reflexion",
      "texte": "Si le stock avait été de zéro paire, qu'aurais-tu répondu à Léa Dubois ?",
      "pistes": [
        "Dire honnêtement qu'il n'y en a plus (« 0 paire » écrit en chiffres).",
        "Proposer une suite : une autre couleur ou pointure, ou une date de réapprovisionnement (4 jours chez adidas), et prévenir le client."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "tableau",
      "texte": "Référence | Stock trouvé | Emplacement | À préparer | Statut",
      "entetes": [
        "Référence",
        "Stock trouvé",
        "Emplacement",
        "À préparer",
        "Statut"
      ],
      "contexte": "Recopie ici ce que tu as trouvé pour chaque ligne, avant de valider :",
      "reponses": [
        [
          "NK-AM270-NR-42",
          "8",
          "B-01-1",
          "1",
          "Complet"
        ],
        [
          "AD-STS-BL-41",
          "1",
          "B-04-1",
          "1",
          "Partiel"
        ],
        [
          "PM-SUE-NR-40",
          "0",
          "B-06-1",
          "0",
          "Rupture"
        ]
      ],
      "note": "Commande CMD-048213 : commandé 1 + 2 + 1. Statut attendu = Complet si stock ≥ commandé, Partiel si 0 < stock < commandé, Rupture si stock = 0. Quantité à préparer = min(commandé, stock). Tout est contrôlé par le jalon « commande »."
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "fait",
      "texte": "Combien de références (lignes) différentes compte cette commande ?",
      "rep": "3 lignes (NK-AM270-NR-42, AD-STS-BL-41, PM-SUE-NR-40)."
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "fait",
      "texte": "Pour quelle ligne la quantité à préparer est-elle inférieure à la quantité commandée ?",
      "rep": "AD-STS-BL-41 (2 commandées, 1 en stock : préparée à 1) et PM-SUE-NR-40 (1 commandée, 0 en stock : préparée à 0)."
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "question",
      "texte": "Que veut dire le statut « Rupture » pour une ligne ?",
      "rep": "Qu'il n'y a plus aucune paire en stock pour cette référence : on ne peut rien préparer pour cette ligne (à préparer = 0)."
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "question",
      "texte": "Que dois-tu faire lorsque tu es en rupture sur une ligne ?",
      "rep": "Mettre 0 à préparer et le statut « Rupture », valider la préparation (la ligne part en reliquat), et prévenir le client / prévoir de réapprovisionner (c'est l'étape 6)."
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "question",
      "texte": "Qu'appelle-t-on un « reliquat » sur un bon de préparation ?",
      "rep": "La partie d'une commande qui n'a pas pu être préparée faute de stock (ici 1 paire d'AD-STS-BL-41 et 1 paire de PM-SUE-NR-40) : elle sera livrée plus tard, quand le stock sera revenu."
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "question",
      "texte": "Que se passe-t-il exactement dans le stock quand tu valides la préparation ?",
      "rep": "Le stock diminue des quantités préparées et les mouvements de sortie sont enregistrés : NK-AM270-NR-42 passe de 8 à 7, AD-STS-BL-41 de 1 à 0, PM-SUE-NR-40 reste à 0.",
      "note": "Type de mouvement : « Sortie : préparation » (bon de préparation BP-048213)."
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "qcm",
      "texte": "Une ligne de la commande part en reliquat. Que doit faire le vendeur ?",
      "choix": [
        "le prévenir que la ligne arrive plus tard",
        "ne rien dire",
        "annuler toute la commande"
      ],
      "bonne": 0,
      "explication": "En cas de livraison partielle (reliquat), le vendeur prévient le client et lui indique quand le reste arrivera.",
      "notion": "Module 2 — obligation d'information du vendeur"
    },
    {
      "etape": 5,
      "etapeTitre": "Traiter la commande CMD-048213",
      "genre": "reflexion",
      "texte": "Que dirais-tu à un client dont une ligne de commande part en reliquat ?",
      "pistes": [
        "Lui dire clairement qu'une partie de sa commande part tout de suite et le reste plus tard, avec une date si possible.",
        "S'excuser, proposer une alternative ou un remboursement de la ligne manquante s'il ne veut pas attendre."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Réapprovisionner un fournisseur",
      "genre": "tableau",
      "texte": "Référence | Stock actuel | Seuil | Stock maximum | Quantité à commander",
      "entetes": [
        "Référence",
        "Stock actuel",
        "Seuil",
        "Stock maximum",
        "Quantité à commander"
      ],
      "contexte": "Note ici ton calcul :",
      "reponses": [
        [
          "PM-SUE-NR-40",
          "0",
          "4",
          "12",
          "12 (12 − 0)"
        ],
        [
          "PM-SUE-NR-36 (exemple de 2e référence)",
          "0",
          "4",
          "12",
          "12 (12 − 0)"
        ]
      ],
      "note": "Total 24 paires ≥ minimum de Puma (20) : atteint. Une seule ligne (12) n'atteint pas le minimum. Autres choix valables, tous en rupture ou sous le seuil : PM-SUE-RG-36 (12), PM-RSX-GR-41 (13), PM-RSX-GR-43 (13), PM-RSX-BL-45 (stock 2 → 11), PM-SUE-RG-42 (stock 4 → 8), PM-RSX-GR-46 (stock 4 → 9). Le suivi vérifie : quantité = stock maximum − stock actuel, PM-SUE-NR-40 présent, total ≥ 20."
    },
    {
      "etape": 6,
      "etapeTitre": "Réapprovisionner un fournisseur",
      "genre": "question",
      "texte": "Qu'est-ce que le « seuil » d'une référence ?",
      "rep": "Le niveau de stock en dessous (ou à) duquel il faut réapprovisionner : un signal d'alerte (ici 4 paires pour PM-SUE)."
    },
    {
      "etape": 6,
      "etapeTitre": "Réapprovisionner un fournisseur",
      "genre": "question",
      "texte": "Quelle est la différence entre le seuil et le stock maximum ?",
      "rep": "Le seuil est le minimum qui déclenche une commande ; le stock maximum est le niveau à ne pas dépasser (place, argent immobilisé). On commande pour revenir au maximum, pas au seuil."
    },
    {
      "etape": 6,
      "etapeTitre": "Réapprovisionner un fournisseur",
      "genre": "question",
      "texte": "Dans la liste des destinataires, comment as-tu reconnu le bon fournisseur ?",
      "rep": "Au nom de la marque (Puma) et à son code F003 / son adresse e-mail (b2b@puma-pro.example), qui correspondent à la référence PM-SUE-NR-40 (fournisseur indiqué sur la fiche produit)."
    },
    {
      "etape": 6,
      "etapeTitre": "Réapprovisionner un fournisseur",
      "genre": "fait",
      "texte": "As-tu dû ajouter une deuxième référence pour atteindre le minimum de commande ?",
      "rep": "Oui : PM-SUE-NR-40 seule donne 12 paires, le minimum de Puma est 20.",
      "note": "Si l'élève répond non, il a probablement commandé plus que le maximum (le suivi le signale : quantité ≠ maximum − stock)."
    },
    {
      "etape": 6,
      "etapeTitre": "Réapprovisionner un fournisseur",
      "genre": "qcm",
      "texte": "Le minimum de commande est une clause du contrat avec le fournisseur. Une clause, c'est quoi ?",
      "choix": [
        "une règle écrite dans le contrat",
        "un type de camion",
        "une réduction de prix"
      ],
      "bonne": 0,
      "explication": "Une clause est une règle écrite dans le contrat ; le minimum de commande en est une.",
      "notion": "Module 1 — contrat (parties, objet, clauses)"
    },
    {
      "etape": 6,
      "etapeTitre": "Réapprovisionner un fournisseur",
      "genre": "reflexion",
      "texte": "Si tu as ajouté une référence, quel critère as-tu utilisé pour la choisir ?",
      "pistes": [
        "Critère attendu : une référence du même fournisseur en rupture ou sous son seuil, pour ne pas commander ce qui n'est pas nécessaire.",
        "Valoriser aussi : une référence qui se vend bien, ou qui permet de dépasser le minimum sans dépasser le maximum."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Avant de préparer, on relève le stock ………………… de chaque ligne.",
      "rep": "réel."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "On prélève les articles dans l'ordre des ………………… pour parcourir moins de chemin.",
      "rep": "emplacements."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Une réponse à un client donne l'information demandée en ………………….",
      "rep": "chiffres."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Une commande au fournisseur précise chaque référence et sa ………………….",
      "rep": "quantité."
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
      "contexte": "",
      "reponses": [
        [
          "Bon de préparation (BP)",
          "sortir"
        ],
        [
          "Emplacement de stockage",
          "rangée"
        ],
        [
          "Minimum de commande",
          "accepte"
        ],
        [
          "Délai de livraison",
          "arrivée"
        ],
        [
          "Réapprovisionner",
          "remonter"
        ],
        [
          "Fournisseur",
          "vend"
        ],
        [
          "Mouvement de stock",
          "entrée"
        ],
        [
          "Stock du système",
          "affiche"
        ]
      ],
      "note": "Un mot de la banque par trou."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "tableau",
      "texte": "Référence | Stock | Seuil | Stock maximum | Sous le seuil ? | À commander",
      "entetes": [
        "Référence",
        "Stock",
        "Seuil",
        "Stock maximum",
        "Sous le seuil ?",
        "À commander"
      ],
      "contexte": "Kicks (fournisseur inventé pour l'exercice) impose un minimum de commande de 20 paires. On commande les références dont le stock est sous le seuil, pour les amener à leur stock maximum.",
      "reponses": [
        [
          "KX-01",
          "2",
          "5",
          "15",
          "oui",
          "13 (15 − 2)"
        ],
        [
          "KX-02",
          "8",
          "6",
          "14",
          "non",
          "0"
        ],
        [
          "KX-03",
          "3",
          "6",
          "12",
          "oui",
          "9 (12 − 3)"
        ]
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Total commandé",
      "rep": "22 paires (13 + 9)."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Le minimum de commande est-il atteint ?",
      "rep": "Oui : 22 ≥ 20."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "question",
      "texte": "Écris ta commande au fournisseur, en deux lignes.",
      "rep": "« Bonjour, merci de nous livrer : KX-01, 13 paires ; KX-03, 9 paires. »",
      "note": "Attendu : chaque référence avec sa quantité, en chiffres (KX-01 : 13 ; KX-03 : 9)."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Si le minimum de commande était de 30 paires, que ferais-tu ? Explique.",
      "pistes": [
        "Ajouter KX-02 jusqu'à son maximum (6 paires) : 28, toujours sous 30.",
        "Pour atteindre 30, il faudrait dépasser un stock maximum : on peut le faire en le disant, ou attendre une commande plus grosse.",
        "Toute réponse qui pèse les deux règles l'une contre l'autre."
      ]
    }
  ]
};
