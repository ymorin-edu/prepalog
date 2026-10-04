// Généré par outils/trame-spartoo-reception.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-1.1",
  "titre": "Spartoo — réceptionner une livraison",
  "trame": "ENT-1.1-spartoo-reception-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "fait",
      "texte": "En quelle année Spartoo a-t-elle été créée ?",
      "rep": "2006.",
      "note": "Source : Wikipédia (« Spartoo ») et dossier de presse Spartoo. Relevé le 02/10/2026 : à revérifier, une page Internet peut changer."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "fait",
      "texte": "Dans quelle ville se trouve son siège social ?",
      "rep": "Grenoble.",
      "note": "Source : Wikipédia (« Spartoo »), dossier de presse Spartoo et annuaire d'entreprises. Relevé le 02/10/2026."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "fait",
      "texte": "Que vend Spartoo ?",
      "rep": "Des chaussures, et aussi des sacs, du prêt-à-porter et des objets de décoration (le site se présente en quatre univers : chaussures, sacs, prêt-à-porter, maison et décoration). Accepter « des chaussures en ligne ».",
      "note": "Source : Wikipédia, dossier de presse Spartoo."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "fait",
      "texte": "Spartoo fabrique-t-elle elle-même les chaussures qu'elle vend ? (oui / non)",
      "rep": "Non. Spartoo est un distributeur : elle achète les chaussures à des marques (ses fournisseurs : Nike, adidas, Puma…) et les revend.",
      "note": "Dossier de presse : plus de 10 000 marques au catalogue. Dans l'outil, les fournisseurs sont des marques (F001 Nike, F002 adidas, F003 Puma…)."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "qcm",
      "texte": "Quand un client commande sur le site, quel contrat est conclu entre lui et Spartoo ?",
      "choix": [
        "un contrat de travail",
        "un contrat de vente",
        "un contrat de location"
      ],
      "bonne": 1,
      "explication": "Le client et Spartoo concluent un contrat de vente : Spartoo s'engage à livrer, le client à payer.",
      "notion": "Module 1 et 2 — contrat de vente"
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "qcm",
      "texte": "Quel organisme protège les données personnelles des clients ?",
      "choix": [
        "la CNIL",
        "la Banque de France",
        "La Poste"
      ],
      "bonne": 0,
      "explication": "La CNIL (Commission nationale de l'informatique et des libertés) veille à la protection des données personnelles.",
      "notion": "Module 2 — protection des données personnelles, CNIL"
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "qcm",
      "texte": "Après un achat sur Internet, combien de jours le client a-t-il pour changer d'avis ?",
      "choix": [
        "2 jours",
        "14 jours",
        "60 jours"
      ],
      "bonne": 1,
      "explication": "Délai légal de rétractation de 14 jours pour un achat à distance (Code de la consommation).",
      "notion": "Module 2 — protection du consommateur"
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "qcm",
      "texte": "Pourquoi la loi protège-t-elle davantage celui qui achète sur Internet ?",
      "choix": [
        "les produits y sont plus chers",
        "il ne peut pas toucher ni essayer le produit avant d'acheter",
        "les magasins n'ont pas le droit de vendre en ligne"
      ],
      "bonne": 1,
      "explication": "À distance, le consommateur ne voit ni ne touche le produit : il est moins bien informé que le vendeur, la loi compense.",
      "notion": "Module 2 — asymétrie d'information"
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir l'entreprise Spartoo",
      "genre": "reflexion",
      "texte": "Pour une entreprise qui vend en ligne, pourquoi l'entrepôt et la logistique sont-ils aussi importants que le site Internet ?",
      "pistes": [
        "Le client ne voit jamais l'entrepôt : ce qu'il juge, c'est de recevoir la bonne chaussure, au bon moment, en bon état. Si la logistique échoue, le beau site ne sert à rien.",
        "Le stock, la préparation et l'expédition sont l'essentiel du service : une erreur de référence, une rupture non vue ou un retard coûte une vente, un retour et parfois un client.",
        "Accepter toute idée liée à la livraison, à la disponibilité des produits ou à la satisfaction du client."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Comprendre le contrôle à réception",
      "genre": "fait",
      "texte": "Qu'est-ce qu'un bon de livraison ?",
      "rep": "Le document qui accompagne une marchandise expédiée : il liste ce que le fournisseur annonce avoir envoyé (références, quantités), avec la date, le transporteur et le destinataire.",
      "note": "Il annonce l'envoi, il ne prouve pas ce qui est réellement arrivé : c'est tout l'objet du contrôle à réception."
    },
    {
      "etape": 2,
      "etapeTitre": "Comprendre le contrôle à réception",
      "genre": "fait",
      "texte": "Qui rédige le bon de livraison ?",
      "rep": "L'expéditeur, c'est-à-dire le fournisseur (ici Puma). Le destinataire le signe à la réception et y porte ses éventuelles réserves.",
      "note": "Accepter « le fournisseur / le vendeur / l'expéditeur »."
    },
    {
      "etape": 2,
      "etapeTitre": "Comprendre le contrôle à réception",
      "genre": "question",
      "texte": "Que veut dire « émettre des réserves » à la réception d'une marchandise ?",
      "rep": "Écrire sur le bon de livraison, au moment de la réception, ce qui ne va pas (colis manquant, quantité différente, carton abîmé), avant de signer. Cela garde la preuve du problème et protège le droit de se plaindre.",
      "note": "Les réserves doivent être précises (quels articles, combien, quel dommage). Écrire « sous réserve de déballage » seul ne suffit pas."
    },
    {
      "etape": 2,
      "etapeTitre": "Comprendre le contrôle à réception",
      "genre": "fait",
      "texte": "De combien de jours dispose-t-on, en général, pour confirmer ses réserves au transporteur ?",
      "rep": "3 jours (hors jours fériés) pour confirmer ses réserves au transporteur, par écrit (lettre recommandée ou équivalent).",
      "note": "Source : article L133-3 du Code de commerce (transport). Attention : dans l'exercice, Puma demande ses propres réserves « sous 48 heures » : c'est le délai du fournisseur, pas le délai légal vis-à-vis du transporteur."
    },
    {
      "etape": 2,
      "etapeTitre": "Comprendre le contrôle à réception",
      "genre": "qcm",
      "texte": "Spartoo signe un bon de livraison sans réserve, alors qu'il manque des paires. Que se passe-t-il ?",
      "choix": [
        "le fournisseur rembourse les paires manquantes",
        "le fournisseur peut dire que la livraison était complète",
        "le bon de livraison n'a aucune valeur"
      ],
      "bonne": 1,
      "explication": "Un bon de livraison signé sans réserve est en général considéré comme la preuve d'une livraison conforme : se plaindre ensuite devient difficile.",
      "notion": "Module 1 — contrat, responsabilité contractuelle"
    },
    {
      "etape": 2,
      "etapeTitre": "Comprendre le contrôle à réception",
      "genre": "reflexion",
      "texte": "À ton avis, que risque une entreprise qui signe un bon de livraison sans avoir compté ?",
      "pistes": [
        "Elle ne pourra plus prouver qu'il manquait des paires : le bon signé dit que tout est arrivé.",
        "Elle paiera peut-être des paires qu'elle n'a jamais reçues, ou perdra l'argent de la marchandise abîmée.",
        "Son stock informatique sera faux (il y aura des paires en théorie, pas en vrai), donc des commandes clients impossibles à préparer."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Lire la procédure de l'entreprise",
      "genre": "question",
      "texte": "Dans quels deux cas une ligne doit-elle être « acceptée sous réserve » ?",
      "rep": "(1) Quand il y a un écart de quantité (compté différent d'annoncé). (2) Quand le carton est endommagé.",
      "note": "Message de M. Morin, règle n° 4 : « écart de quantité OU carton endommagé »."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire la procédure de l'entreprise",
      "genre": "question",
      "texte": "Dans quel cas seulement peut-on refuser une ligne ?",
      "rep": "Seulement si la marchandise est inutilisable.",
      "note": "Règle n° 4 de M. Morin."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire la procédure de l'entreprise",
      "genre": "question",
      "texte": "À quoi sert le numéro de lot, d'après M. Morin ?",
      "rep": "À retrouver plus tard d'où vient une paire et chez qui elle est partie (traçabilité). Sans lot, pas de traçabilité.",
      "note": "Règle n° 5 de M. Morin."
    },
    {
      "etape": 3,
      "etapeTitre": "Lire la procédure de l'entreprise",
      "genre": "qcm",
      "texte": "Dans le contrat de vente entre Spartoo et son fournisseur, quelle est l'obligation du fournisseur ?",
      "choix": [
        "payer les factures de Spartoo",
        "compter les colis à la place de Spartoo",
        "livrer les marchandises commandées"
      ],
      "bonne": 2,
      "explication": "L'obligation principale du vendeur est de livrer ce qui a été commandé ; celle de l'acheteur est de payer.",
      "notion": "Module 1 — droits et obligations"
    },
    {
      "etape": 3,
      "etapeTitre": "Lire la procédure de l'entreprise",
      "genre": "reflexion",
      "texte": "Quelle règle de M. Morin te paraît la plus difficile à appliquer sur un quai ?",
      "pistes": [
        "Aucune règle n'est « la bonne » : l'élève doit choisir et expliquer pourquoi.",
        "Réponses fréquentes : compter colis par colis quand le quai est encombré ou que le transporteur est pressé ; refuser de signer tout de suite sous la pression du livreur ; recopier le lot sans erreur.",
        "Valoriser une justification liée à une situation réelle de quai (temps, pression, fatigue)."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Lire le bon de livraison",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Relève les informations du document :",
      "reponses": [
        [
          "Numéro du bon de livraison",
          "BL-77421"
        ],
        [
          "Date d'expédition",
          "La date affichée sur le bon : 2 jours avant l'ouverture de la séance (elle change selon le jour où l'élève travaille)."
        ],
        [
          "Transporteur",
          "Geodis (tournée 14)"
        ],
        [
          "Numéro de lot",
          "LOT-PM-2609"
        ],
        [
          "Nombre total de paires annoncées",
          "26 (12 + 8 + 6)"
        ]
      ],
      "note": "Le numéro de lot doit être recopié avec ses tirets et sans espace : c'est ce que le suivi contrôle."
    },
    {
      "etape": 4,
      "etapeTitre": "Lire le bon de livraison",
      "genre": "tableau",
      "texte": "Référence article | Article | Quantité annoncée",
      "entetes": [
        "Référence article",
        "Article",
        "Quantité annoncée"
      ],
      "contexte": "Recopie maintenant les lignes annoncées :",
      "reponses": [
        [
          "PM-SUE-RG-39",
          "Puma Suede Classic XXI, rouge, pointure 39",
          "12"
        ],
        [
          "PM-SUE-MA-41",
          "Puma Suede Classic XXI, bleu marine, pointure 41",
          "8"
        ],
        [
          "PM-RSX-BL-42",
          "Puma RS-X, blanc, pointure 42",
          "6"
        ]
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Lire le bon de livraison",
      "genre": "reflexion",
      "texte": "Qu'est-ce qui pourrait arriver si tu te trompais d'un seul caractère dans le numéro de lot ?",
      "pistes": [
        "Le lot ne serait plus retrouvé dans la base : en cas de rappel qualité, impossible de dire quelles paires et quels clients sont concernés.",
        "Le fournisseur ne saurait pas de quelle livraison on parle dans ton message de réserves.",
        "Un seul caractère faux suffit : le logiciel traite « LOT-PM-2609 » et « LOT-PM-2690 » comme deux lots différents."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les colis sur le quai",
      "genre": "tableau",
      "texte": "Référence article | Colis concernés | Quantité comptée | Quantité annoncée | Écart",
      "entetes": [
        "Référence article",
        "Colis concernés",
        "Quantité comptée",
        "Quantité annoncée",
        "Écart"
      ],
      "contexte": "Fais ton comptage ici, avant de saisir quoi que ce soit dans le logiciel :",
      "reponses": [
        [
          "PM-SUE-RG-39",
          "colis 1 et 2",
          "12",
          "12",
          "0"
        ],
        [
          "PM-SUE-MA-41",
          "colis 3 et 4",
          "6",
          "8",
          "−2 (il manque 2 paires)"
        ],
        [
          "PM-RSX-BL-42",
          "colis 5",
          "6",
          "6",
          "0 (mais carton endommagé)"
        ]
      ],
      "note": "Colis : n° 1 = 6 paires RG-39, n° 2 = 6 RG-39, n° 3 = 4 MA-41, n° 4 = 2 MA-41, n° 5 = 6 BL-42 (carton enfoncé)."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les colis sur le quai",
      "genre": "fait",
      "texte": "Sur quelle référence y a-t-il un écart ?",
      "rep": "PM-SUE-MA-41."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les colis sur le quai",
      "genre": "fait",
      "texte": "De combien de paires est cet écart ?",
      "rep": "2 paires (8 annoncées, 6 comptées)."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les colis sur le quai",
      "genre": "fait",
      "texte": "Quelle référence est arrivée dans un carton endommagé ?",
      "rep": "PM-RSX-BL-42 (colis n° 5)."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les colis sur le quai",
      "genre": "qcm",
      "texte": "Le fournisseur livre moins de paires que prévu. Qu'est-ce qui n'est pas respecté ?",
      "choix": [
        "la quantité commandée",
        "le prix des chaussures",
        "la couleur des cartons"
      ],
      "bonne": 0,
      "explication": "Livrer moins que la quantité commandée est une inexécution du contrat (point de départ de la responsabilité contractuelle).",
      "notion": "Module 1 — inexécution du contrat"
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les colis sur le quai",
      "genre": "reflexion",
      "texte": "Un carton endommagé veut-il forcément dire que la marchandise est abîmée ?",
      "pistes": [
        "Non : un carton enfoncé peut protéger une marchandise intacte, ou au contraire l'avoir laissée se casser. Il faut ouvrir et vérifier.",
        "Mais on ne peut pas le savoir sur le quai : c'est pour cela qu'on accepte « sous réserve » et qu'on prévient le fournisseur."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Remplir le bon de réception",
      "genre": "tableau",
      "texte": "Référence article | Annoncé | Compté | État des colis | Décision",
      "entetes": [
        "Référence article",
        "Annoncé",
        "Compté",
        "État des colis",
        "Décision"
      ],
      "contexte": "Recopie ici ce que tu as saisi :",
      "reponses": [
        [
          "PM-SUE-RG-39",
          "12",
          "12",
          "conforme",
          "accepté"
        ],
        [
          "PM-SUE-MA-41",
          "8",
          "6",
          "conforme",
          "accepté sous réserve"
        ],
        [
          "PM-RSX-BL-42",
          "6",
          "6",
          "colis endommagé",
          "accepté sous réserve"
        ]
      ],
      "note": "Numéro de lot saisi : LOT-PM-2609. Attendu par le suivi (jalon « contrôle »)."
    },
    {
      "etape": 6,
      "etapeTitre": "Remplir le bon de réception",
      "genre": "reflexion",
      "texte": "Pour la ligne où il manque des paires, pourquoi as-tu choisi ta décision plutôt qu'une autre ?",
      "pistes": [
        "Attendu : « accepté sous réserve ». Les paires reçues sont utilisables : les refuser bloquerait la vente de marchandise bonne.",
        "On ne refuse que si la marchandise est inutilisable (règle de M. Morin) ; on entre ce qui est là, et on signale l'écart au fournisseur le jour même.",
        "Si l'élève a mis une autre décision, l'amener à relire la procédure de M. Morin."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Valider et vérifier dans la base",
      "genre": "fait",
      "texte": "Combien de paires, au total, sont entrées en stock avec ce lot ?",
      "rep": "24 paires (12 + 6 + 6). Les trois lignes sont acceptées, deux sous réserve."
    },
    {
      "etape": 7,
      "etapeTitre": "Valider et vérifier dans la base",
      "genre": "fait",
      "texte": "Quel type de mouvement apparaît dans .movements pour ces entrées ?",
      "rep": "« Entrée : réception ».",
      "note": "Type tel qu'écrit dans .movements pour les entrées de la réception."
    },
    {
      "etape": 7,
      "etapeTitre": "Valider et vérifier dans la base",
      "genre": "fait",
      "texte": "Quel fournisseur .getlot associe-t-il à ce lot ?",
      "rep": "Puma (F003)."
    },
    {
      "etape": 7,
      "etapeTitre": "Valider et vérifier dans la base",
      "genre": "question",
      "texte": "Pourquoi la ligne « Sorties » de .getlot est-elle vide pour l'instant ?",
      "rep": "Parce qu'aucune commande n'a encore été préparée avec des paires de ce lot : tout ce qui est entré est encore en stock.",
      "note": "Le logiciel affiche « Aucune sortie : tout le lot est encore en stock »."
    },
    {
      "etape": 7,
      "etapeTitre": "Valider et vérifier dans la base",
      "genre": "reflexion",
      "texte": "En quoi le numéro de lot sera-t-il utile si, dans un mois, le fournisseur signale un défaut de fabrication ?",
      "pistes": [
        "Il permet de retrouver tout ce qui est venu avec cette livraison : où sont les paires en stock, et chez quels clients elles sont déjà parties.",
        "Sans lot, il faudrait contrôler toutes les paires de la référence, y compris celles qui viennent d'autres livraisons, sans défaut.",
        "Rappel : c'est le sujet de la séance de traçabilité (ENT-1.3)."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Signaler les réserves au fournisseur",
      "genre": "brouillon",
      "texte": "Brouillon de ton message à Puma :",
      "modele": "Bonjour,\n\nNous avons réceptionné ce jour la livraison correspondant au bon de livraison BL-77421, lot LOT-PM-2609, réception REC-04127. Nous émettons les réserves suivantes :\n\n- PM-SUE-MA-41 : 8 paires annoncées, 6 reçues, il manque 2 paires ;\n- PM-RSX-BL-42 : 6 paires reçues dans un carton endommagé (carton enfoncé), l'état des paires reste à vérifier.\n\nMerci de nous indiquer la suite que vous donnez à ces réserves (envoi complémentaire ou avoir).\n\nCordialement,\n[prénom], service logistique, Spartoo",
      "criteres": [
        "Numéro de lot LOT-PM-2609 présent (c'est ce que contrôle le jalon).",
        "Quantité manquante écrite en chiffres (2) avec la référence PM-SUE-MA-41.",
        "Colis endommagé signalé avec sa référence PM-RSX-BL-42.",
        "Formules de politesse, signature, ton professionnel.",
        "Bonus : n° de bon de livraison (BL-77421) et de réception (REC-04127), demande d'une suite (envoi complémentaire ou avoir)."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Signaler les réserves au fournisseur",
      "genre": "question",
      "texte": "Quelles informations un fournisseur a-t-il besoin de recevoir pour traiter une réserve ?",
      "rep": "Le numéro de lot (et du bon de livraison), les références concernées, la nature du problème (manquant ou abîmé), les quantités exactes, et la date de réception.",
      "note": "Toute réponse qui permet au fournisseur d'identifier la livraison et le défaut est acceptée."
    },
    {
      "etape": 8,
      "etapeTitre": "Signaler les réserves au fournisseur",
      "genre": "qcm",
      "texte": "Si le fournisseur ne répond pas, Spartoo peut demander des dommages-intérêts. Que sont des dommages-intérêts ?",
      "choix": [
        "une réduction offerte aux clients fidèles",
        "un impôt payé à l'État",
        "une somme d'argent versée pour réparer le dommage subi"
      ],
      "bonne": 2,
      "explication": "Les dommages-intérêts sont une somme d'argent qui répare le dommage causé par l'inexécution du contrat.",
      "notion": "Module 1 — responsabilité civile contractuelle, dommages-intérêts"
    },
    {
      "etape": 8,
      "etapeTitre": "Signaler les réserves au fournisseur",
      "genre": "reflexion",
      "texte": "Qu'aurait-il fallu faire, en plus, si la marchandise du carton endommagé avait été inutilisable ?",
      "pistes": [
        "Refuser la ligne (marchandise inutilisable) : ne pas l'entrer en stock.",
        "Prévenir le fournisseur et demander un remplacement ou un avoir ; garder les paires en zone séparée en attendant sa réponse."
      ]
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "On compare toujours ce qui est ………………… sur le bon de livraison à ce qui est réellement arrivé.",
      "rep": "annoncé."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Plusieurs colis peuvent contenir la même référence : on les ………………….",
      "rep": "additionne."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Le logiciel ne corrige rien : ce qu'on saisit entre ………………… dans le stock.",
      "rep": "vraiment."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Après la validation, on vérifie dans la base que les entrées portent le bon ………………….",
      "rep": "lot."
    },
    {
      "etape": 9,
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
          "Fournisseur",
          "vend"
        ],
        [
          "Transporteur",
          "conduit"
        ],
        [
          "Quai",
          "déchargé"
        ],
        [
          "Colis",
          "étiquette"
        ],
        [
          "Écart de livraison",
          "annoncée"
        ],
        [
          "Bon de réception",
          "reçu"
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
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "tableau",
      "texte": "Référence | Annoncé | Compté | Écart | État | Décision",
      "entetes": [
        "Référence",
        "Annoncé",
        "Compté",
        "Écart",
        "État",
        "Décision"
      ],
      "contexte": "Un fournisseur (inventé pour l'exercice) livre trois références. Voici son bon de livraison et les colis déposés sur le quai.",
      "reponses": [
        [
          "BK-RUN-40",
          "10",
          "10 (5 + 5)",
          "0",
          "bon état",
          "accepté"
        ],
        [
          "BK-RUN-42",
          "6",
          "4",
          "−2",
          "bon état",
          "accepté sous réserve (manque 2 paires)"
        ],
        [
          "BK-TRL-41",
          "8",
          "8",
          "0",
          "carton mouillé",
          "accepté sous réserve (carton abîmé)"
        ]
      ]
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "question",
      "texte": "Écris en deux phrases ton message de réserves au fournisseur.",
      "rep": "« Livraison BL-5512, lot LOT-BN-0704 : il manque 2 paires de BK-RUN-42 (4 reçues pour 6 annoncées). Le colis de BK-TRL-41 est arrivé mouillé : nous l'acceptons sous réserve. »",
      "note": "Attendu : le lot (ou le BL), la référence et la quantité manquante en chiffres, la référence au carton abîmé."
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Le chauffeur est pressé et te demande de signer sans compter. Que lui réponds-tu ?",
      "pistes": [
        "Je compte d'abord : une signature sans réserve vaut « livraison complète ».",
        "Je peux compter vite (colis par colis) et écrire mes réserves devant lui."
      ]
    }
  ]
};
