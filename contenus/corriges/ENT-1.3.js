// Généré par outils/trame-spartoo-tracabilite.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-1.3",
  "titre": "Spartoo — remonter la trace d'un lot",
  "trame": "ENT-1.3-spartoo-tracabilite-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Comprendre la traçabilité",
      "genre": "fait",
      "texte": "Qu'est-ce qu'un numéro de lot ?",
      "rep": "Un code qui identifie un groupe d'articles fabriqués ou expédiés ensemble, dans les mêmes conditions (même date, même production).",
      "note": "Ex. du cours : LOT-PM-2609."
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre la traçabilité",
      "genre": "fait",
      "texte": "Qui attribue le numéro de lot ?",
      "rep": "Le fabricant (ou le fournisseur : ici Puma), qui l'indique sur ses produits et sur le bon de livraison. Le destinataire le recopie, il ne l'invente pas."
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre la traçabilité",
      "genre": "question",
      "texte": "Que veut dire « tracer » un produit en logistique ?",
      "rep": "Pouvoir retrouver l'historique d'un produit : d'où il vient (amont) et où il est parti (aval), à l'aide d'identifiants comme le numéro de lot."
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre la traçabilité",
      "genre": "question",
      "texte": "Dans un rappel de produit que tu as trouvé, quelles informations l'entreprise donne-t-elle au client ?",
      "rep": "Selon la fiche choisie (RappelConso) : le produit (nom, marque, référence), le lot concerné, le motif et le risque, les lieux et dates de vente, ce que le client doit faire (arrêter de l'utiliser, le rapporter, être remboursé) et un contact.",
      "note": "Source : fiches du site officiel RappelConso (rappel.conso.gouv.fr), consultées le 02/10/2026. Tout rappel réel est accepté s'il est décrit."
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre la traçabilité",
      "genre": "reflexion",
      "texte": "Si une entreprise ne sait pas dans quel lot était un article, que doit-elle faire en cas de défaut ?",
      "pistes": [
        "Elle doit rappeler ou bloquer toutes les paires de la référence, ou de toute la période, sans savoir lesquelles sont défectueuses.",
        "Elle doit prévenir tous ses clients ayant acheté ce produit, faute de pouvoir cibler."
      ]
    },
    {
      "etape": 1,
      "etapeTitre": "Comprendre la traçabilité",
      "genre": "reflexion",
      "texte": "Pourquoi cela lui coûte-t-il beaucoup plus cher ?",
      "pistes": [
        "Plus de paires à retirer, plus de clients à prévenir et à rembourser, plus de temps de travail.",
        "Image de l'entreprise abîmée et risque juridique plus grand si un client est blessé."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire l'alerte du fournisseur et la consigne",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Relève les informations de l'alerte :",
      "reponses": [
        [
          "Lot concerné",
          "LOT-PM-2609"
        ],
        [
          "Fournisseur / expéditeur de l'alerte",
          "Puma France, B2B — qualité (Marc Oberlé)"
        ],
        [
          "Nature du défaut",
          "Collage de la semelle insuffisant sur une partie de la production"
        ],
        [
          "Ce que Puma demande",
          "1. ne plus expédier de paires du lot ; 2. indiquer les commandes déjà livrées avec ce lot ; 3. isoler le stock restant"
        ]
      ],
      "note": "Informations de l'alerte « URGENT — rappel qualité sur le lot LOT-PM-2609 » (lignes exactes à adapter à la fiche imprimée dans la trame)."
    },
    {
      "etape": 2,
      "etapeTitre": "Lire l'alerte du fournisseur et la consigne",
      "genre": "fait",
      "texte": "Le défaut est-il visible à l'œil nu ?",
      "rep": "Non (« le défaut n'est pas visible à l'œil nu »)."
    },
    {
      "etape": 2,
      "etapeTitre": "Lire l'alerte du fournisseur et la consigne",
      "genre": "reflexion",
      "texte": "Quelle conséquence cela a-t-il pour le contrôle en entrepôt ?",
      "pistes": [
        "On ne peut pas le repérer en regardant les chaussures : un contrôle visuel à la réception ne suffit pas.",
        "Il faut donc s'appuyer sur la traçabilité (le numéro de lot) pour isoler ce qui est concerné."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire l'alerte du fournisseur et la consigne",
      "genre": "reflexion",
      "texte": "Puma écrit que les paires de la même référence venues d'autres livraisons ne sont pas en cause. Pourquoi, avec tes mots ?",
      "pistes": [
        "Le défaut vient d'une production précise : seules les paires du lot LOT-PM-2609 sont concernées.",
        "Les autres paires de la même référence viennent d'autres lots, fabriqués à d'autres moments, donc non défectueux : on les garde vendables. C'est tout l'intérêt de bloquer par lot et non par référence."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Remonter l'amont : d'où vient ce lot ?",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Remplis la fiche d'identité du lot :",
      "reponses": [
        [
          "Numéro de lot",
          "LOT-PM-2609"
        ],
        [
          "Fournisseur",
          "Puma (F003)"
        ],
        [
          "Date d'entrée en stock",
          "La date de la réception de l'élève, au format jj/mm/aaaa (lue dans .getlot, ligne « Entré le »)"
        ],
        [
          "Numéro de réception",
          "REC-04127 (REC-04118 pour un élève sans séance 1)"
        ],
        [
          "Nombre total de paires entrées",
          "24 paires"
        ]
      ],
      "note": "Les cinq lignes que demande la trame. .getlot affiche aussi « Sorties : 6 paires » et « Reste en stock : 18 paires » : ces deux nombres servent à l'étape 4 (entrées moins sorties = reste en stock)."
    },
    {
      "etape": 3,
      "etapeTitre": "Remonter l'amont : d'où vient ce lot ?",
      "genre": "tableau",
      "texte": "Référence article | Article | Quantité entrée",
      "entetes": [
        "Référence article",
        "Article",
        "Quantité entrée"
      ],
      "contexte": "Recopie maintenant le détail des entrées :",
      "reponses": [
        [
          "PM-SUE-RG-39",
          "Puma Suede Classic XXI, rouge, 39",
          "12"
        ],
        [
          "PM-SUE-MA-41",
          "Puma Suede Classic XXI, bleu marine, 41",
          "6"
        ],
        [
          "PM-RSX-BL-42",
          "Puma RS-X, blanc, 42",
          "6"
        ]
      ],
      "note": "Pour un élève qui a validé la réception d'ENT-1.1 comme attendu. Total 24. Un élève sans séance 1 reçoit la réception d'un collègue (REC-04118, Sonia Ferret) avec les mêmes quantités."
    },
    {
      "etape": 3,
      "etapeTitre": "Remonter l'amont : d'où vient ce lot ?",
      "genre": "reflexion",
      "texte": "Pourquoi est-il important de savoir par quelle réception ce lot est entré en stock ?",
      "pistes": [
        "La réception donne la date d'entrée, le document de départ (bon de livraison) et la personne qui a contrôlé : on peut rendre compte au fournisseur et retrouver la preuve.",
        "Elle permet de relier le lot au bon de livraison et au contrat avec le fournisseur (responsabilité)."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Remonter l'aval : où sont parties les paires ?",
      "genre": "tableau",
      "texte": "Référence article | Qté | Bon de préparation | N° de commande | Client livré",
      "entetes": [
        "Référence article",
        "Qté",
        "Bon de préparation",
        "N° de commande",
        "Client livré"
      ],
      "contexte": "Relève les sorties du lot :",
      "reponses": [
        [
          "PM-SUE-RG-39",
          "2",
          "BP-048301",
          "CMD-048301",
          "Inès Simon (C0011)"
        ],
        [
          "PM-SUE-MA-41",
          "1",
          "BP-048307",
          "CMD-048307",
          "Clara Bernard (C0019)"
        ],
        [
          "PM-RSX-BL-42",
          "2",
          "BP-048307",
          "CMD-048307",
          "Clara Bernard (C0019)"
        ],
        [
          "PM-SUE-RG-39",
          "1",
          "BP-048312",
          "CMD-048312",
          "Noah Fournier (C0026)"
        ]
      ],
      "note": "Total sorti : 6 paires. Tableau rendu par .getlot (colonnes Document, Commande, Client)."
    },
    {
      "etape": 4,
      "etapeTitre": "Remonter l'aval : où sont parties les paires ?",
      "genre": "fait",
      "texte": "Combien de clients différents ont reçu des paires de ce lot ?",
      "rep": "3 clients : Inès Simon (C0011), Clara Bernard (C0019), Noah Fournier (C0026)."
    },
    {
      "etape": 4,
      "etapeTitre": "Remonter l'aval : où sont parties les paires ?",
      "genre": "qcm",
      "texte": "Ces clients sont des consommateurs. Si un produit peut être dangereux, que doit faire le vendeur ?",
      "choix": [
        "attendre que les clients se plaignent",
        "les informer rapidement",
        "ne rien dire pour ne pas perdre de ventes"
      ],
      "bonne": 1,
      "explication": "Pour un produit potentiellement dangereux, le vendeur doit informer rapidement les clients concernés (la traçabilité sert à les retrouver).",
      "notion": "Module 2 — consommateur, obligation d'information"
    },
    {
      "etape": 4,
      "etapeTitre": "Remonter l'aval : où sont parties les paires ?",
      "genre": "reflexion",
      "texte": "Sans le numéro de lot, qu'aurait-on été obligé de faire pour savoir quels clients avaient reçu ces paires ?",
      "pistes": [
        "Contrôler toutes les commandes contenant ces références, y compris celles qui viennent d'autres lots, pour deviner qui est concerné.",
        "Ou prévenir tous les clients de ces références, sans pouvoir cibler."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Compter ce qui reste, référence par référence",
      "genre": "tableau",
      "texte": "Référence article | Entré avec ce lot | Déjà sorti | Reste à bloquer",
      "entetes": [
        "Référence article",
        "Entré avec ce lot",
        "Déjà sorti",
        "Reste à bloquer"
      ],
      "contexte": "Fais ton calcul ici, avant de toucher au stock :",
      "reponses": [
        [
          "PM-SUE-RG-39",
          "12",
          "3",
          "9"
        ],
        [
          "PM-SUE-MA-41",
          "6",
          "1",
          "5"
        ],
        [
          "PM-RSX-BL-42",
          "6",
          "2",
          "4"
        ]
      ],
      "note": "Total à bloquer : 18, égal au « Reste en stock » de .getlot. Le suivi vérifie les blocages référence par référence."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter ce qui reste, référence par référence",
      "genre": "fait",
      "texte": "Avec .getstock suivi d'une de ces références, quel est le stock total de cette référence ?",
      "rep": "PM-SUE-RG-39 : 26 paires ; PM-SUE-MA-41 : 17 ; PM-RSX-BL-42 : 21.",
      "note": "Départ catalogue 17 / 12 / 17, + entrées du lot (12 / 6 / 6), − sorties (3 / 1 / 2). Valable pour un élève dont la base a suivi ENT-1.1 sans autre mouvement ; sinon lire l'écran."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter ce qui reste, référence par référence",
      "genre": "fait",
      "texte": "Combien reste-t-il de paires de ce lot pour cette même référence ?",
      "rep": "PM-SUE-RG-39 : 9 ; PM-SUE-MA-41 : 5 ; PM-RSX-BL-42 : 4 (total 18)."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter ce qui reste, référence par référence",
      "genre": "reflexion",
      "texte": "Pourquoi ces deux nombres sont-ils différents ?",
      "pistes": [
        "Le stock total d'une référence regroupe plusieurs lots (paires arrivées avant, de livraisons sans défaut) ; le « reste du lot » ne compte que les paires de LOT-PM-2609 encore en stock.",
        "Exemples : PM-SUE-RG-39 stock 26, reste du lot 9 ; PM-SUE-MA-41 stock 17, reste 5 ; PM-RSX-BL-42 stock 21, reste 4."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Compter ce qui reste, référence par référence",
      "genre": "reflexion",
      "texte": "Que se passerait-il si tu bloquais le stock total de la référence au lieu du reste du lot ?",
      "pistes": [
        "On bloquerait aussi des paires saines venant d'autres lots : elles ne pourraient plus être vendues, donc perte de ventes inutile.",
        "Le logiciel refuse d'ailleurs un blocage supérieur au reste du lot (« Le lot ne contient pas autant de paires de cette référence en stock »)."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Bloquer le stock restant",
      "genre": "fait",
      "texte": "Que vaut maintenant le « Reste en stock » du lot ?",
      "rep": "0 : tout ce qui restait du lot a été bloqué (18 paires)."
    },
    {
      "etape": 6,
      "etapeTitre": "Bloquer le stock restant",
      "genre": "fait",
      "texte": "Quel type de mouvement apparaît dans le tableau des sorties, à côté des ventes ?",
      "rep": "« Blocage qualité ».",
      "note": "Dans .getlot, les sorties comptent les ventes (6 paires) puis les blocages (18 paires)."
    },
    {
      "etape": 6,
      "etapeTitre": "Bloquer le stock restant",
      "genre": "reflexion",
      "texte": "À quoi sert le motif, plusieurs mois plus tard, quand quelqu'un relit l'historique des mouvements ?",
      "pistes": [
        "À comprendre plus tard pourquoi ces paires ont quitté le stock : défaut fabricant, et non vente ou casse.",
        "À justifier le mouvement auprès du fournisseur, de l'inventaire et d'un contrôle."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Rendre compte à M. Morin",
      "genre": "brouillon",
      "texte": "Brouillon de ton compte rendu à M. Morin :",
      "modele": "Bonjour M. Morin,\n\nCompte rendu sur le lot LOT-PM-2609 (fournisseur : Puma).\n\n- Entré en stock le [jj/mm/aaaa : date lue dans .getlot], réception REC-04127.\n- Commandes parties avec des paires de ce lot : CMD-048301, CMD-048307 et CMD-048312.\n- Stock restant bloqué : 9 paires PM-SUE-RG-39, 5 paires PM-SUE-MA-41, 4 paires PM-RSX-BL-42 (total 18), motif : blocage qualité, défaut fabricant.\n\nCordialement,\n[prénom]",
      "criteres": [
        "Numéro du lot LOT-PM-2609.",
        "Date d'entrée au format jj/mm/aaaa (date de la réception de l'élève, lue dans .getlot).",
        "Nom du fournisseur : Puma.",
        "Les trois numéros de commande au format CMD-000000 : CMD-048301, CMD-048307, CMD-048312.",
        "Ce qui a été bloqué, référence par référence (9 / 5 / 4)."
      ],
      "note": "Date et numéro de réception propres à chaque élève. Un élève sans séance 1 a REC-04118 (réception d'un collègue) : lire la base."
    },
    {
      "etape": 7,
      "etapeTitre": "Rendre compte à M. Morin",
      "genre": "reflexion",
      "texte": "Pourquoi le compte rendu doit-il donner les numéros de commande, et pas seulement les noms des clients ?",
      "pistes": [
        "Un numéro de commande est unique et se retrouve dans le logiciel et chez Puma ; un nom peut avoir des homonymes ou être mal orthographié.",
        "Puma doit contacter ces clients : le numéro de commande permet de les retrouver sans erreur."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Rendre compte à M. Morin",
      "genre": "reflexion",
      "texte": "Quelle première action Spartoo devra-t-elle mener si un client rapporte une paire du lot ?",
      "pistes": [
        "Retrouver la commande du client et vérifier que sa paire vient bien du lot LOT-PM-2609.",
        "Remplacer ou rembourser le client, et ne pas remettre la paire en stock ; informer Puma."
      ]
    }
  ]
};
