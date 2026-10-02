// Généré par outils/trame-cdiscount-mouvements.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-2.1",
  "titre": "Cdiscount — le stock raconte",
  "trame": "ENT-2.1-cdiscount-mouvements-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "fait",
      "texte": "En quelle année Cdiscount a-t-elle été créée ?",
      "rep": "1998.",
      "note": "Source : Wikipédia (« Cdiscount »), à recouper ; relevé le 02/10/2026. Une page Internet peut changer."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "fait",
      "texte": "Dans quelle ville a-t-elle été fondée ?",
      "rep": "Bordeaux.",
      "note": "Source : Wikipédia (« Cdiscount »), à recouper ; relevé le 02/10/2026."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "fait",
      "texte": "Dans quel département se trouve son entrepôt de Cestas ?",
      "rep": "La Gironde (33).",
      "note": "Entrepôt de Cestas, près de Bordeaux. Source : Journal du Net, article ancien : à dater et rafraîchir."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "fait",
      "texte": "Quel est le nom de sa filiale logistique ?",
      "rep": "C-Logistics.",
      "note": "Source : GlobeNewswire, 06/10/2022."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "qcm",
      "texte": "Cdiscount vend ses produits, mais aussi ceux de vendeurs indépendants sur son site. Comment appelle-t-on ce fonctionnement ?",
      "choix": [
        "une place de marché",
        "une franchise",
        "un grossiste"
      ],
      "bonne": 0,
      "explication": "Une place de marché est un site où des vendeurs indépendants vendent leurs produits à côté de ceux du site : Cdiscount vend les siens et héberge aussi ceux d'autres vendeurs.",
      "notion": "Place de marché (commerce en ligne)"
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "reflexion",
      "texte": "Pour un site de vente en ligne, pourquoi est-il important que le stock affiché soit le stock réel ?",
      "pistes": [
        "Le client commande ce qu'il voit disponible : si le stock affiché est faux, on vend un article qu'on n'a plus (client déçu, commande annulée, remboursement).",
        "À l'inverse, un stock affiché trop bas fait perdre des ventes, et on peut racheter à tort ce qu'on a déjà.",
        "Accepter toute réponse qui relie le stock affiché à la vente, à la satisfaction du client ou au coût."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire le message de Nadia",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Connecte-toi à Prepalog, ouvre la rubrique Logisim, puis l'activité « Cdiscount — le stock raconte ». Le logiciel s'ouvre aux couleurs de Cdiscount : un bandeau bleu en haut, un menu à gauche. Clique sur « Messagerie » : plusieurs messages t'attendent.",
      "reponses": [
        [
          "Qui t'écrit, et quel est son poste ?",
          "Nadia Ferrand, cheffe d'équipe stock"
        ],
        [
          "Selon le message de bienvenue, le stock affiché dans le système doit être égal à quoi ?",
          "Au stock réel, celui qui est dans les rayons"
        ],
        [
          "De quel article parle Nadia (nom et référence) ?",
          "Écouteurs sans fil Bluetooth, ECO-BT-01"
        ],
        [
          "À quelle date a eu lieu le dernier inventaire ?",
          "Il y a 7 jours (la date du jour moins 7 : le message l'écrit)"
        ],
        [
          "Combien de lignes doit contenir ta réponse ?",
          "6"
        ]
      ],
      "note": "La date de l'inventaire change chaque jour : elle est calculée à l'ouverture de la séance."
    },
    {
      "etape": 2,
      "etapeTitre": "Ouvrir son environnement et lire le message de Nadia",
      "genre": "reflexion",
      "texte": "Nadia veut comprendre comment le stock est arrivé là, pas seulement connaître son chiffre. Pourquoi, à ton avis ?",
      "pistes": [
        "Le chiffre seul ne dit pas d'où vient un écart : ce sont les mouvements et leurs documents qui permettent de comprendre, puis de corriger.",
        "Avant de recompter, on veut savoir ce qui est normal (ventes, réceptions) et ce qui est anormal (casse, retour, erreur de saisie).",
        "Accepter toute idée de justification, de contrôle ou de recherche d'erreur."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Relever le stock actuel",
      "genre": "tableau",
      "texte": "Où as-tu lu le stock ? | Stock actuel de l'article",
      "entetes": [
        "Où as-tu lu le stock ?",
        "Stock actuel de l'article"
      ],
      "contexte": "Tu vas relever le stock d'écouteurs qu'affiche le système aujourd'hui. Il y a deux façons de le faire : essaie les deux.",
      "reponses": [
        [
          "Écran « Stock »",
          "27"
        ],
        [
          "Console (.getstock ECO-BT-01)",
          "27"
        ]
      ],
      "note": "Les deux façons donnent le même nombre. Écran Stock : code d'accès donné par l'enseignant (STOCK24 sur la page d'essai)."
    },
    {
      "etape": 3,
      "etapeTitre": "Relever le stock actuel",
      "genre": "reflexion",
      "texte": "Quelle façon de lire le stock te paraît la plus sûre ? Explique ton choix.",
      "pistes": [
        "Réponse personnelle : la console est plus rapide quand on connaît la référence ; l'écran est plus visuel et montre tous les articles.",
        "Accepter tout choix argumenté."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Relever le stock actuel",
      "genre": "reflexion",
      "texte": "Ce nombre dit-il à lui seul comment le stock est arrivé là ? Explique.",
      "pistes": [
        "Non : un stock de 27 ne dit pas si c'est normal. Il faut savoir ce qui est entré et sorti, et pourquoi.",
        "C'est exactement ce que l'onglet Mouvements va montrer à l'étape suivante."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Lister les mouvements et remplir la fiche de stock",
      "genre": "tableau",
      "texte": "Date | Document (Origine) | Entrée | Sortie | Stock après",
      "entetes": [
        "Date",
        "Document (Origine)",
        "Entrée",
        "Sortie",
        "Stock après"
      ],
      "contexte": "Fiche de stock de l'article (référence) : …………………………………………",
      "reponses": [
        [
          "Il y a 7 jours",
          "Inventaire",
          "",
          "",
          "24 (trouvé à l'étape 6)"
        ],
        [
          "Il y a 6 jours, 15 h 30",
          "BP-731402 (commande CMD-731402)",
          "",
          "2",
          "22"
        ],
        [
          "Il y a 5 jours, 10 h 00",
          "REC-26-0415",
          "12",
          "",
          "34"
        ],
        [
          "Il y a 4 jours, 11 h 00",
          "BP-731488 (commande CMD-731488)",
          "",
          "1",
          "33"
        ],
        [
          "Il y a 4 jours, 16 h 45",
          "RET-26-0091",
          "1",
          "",
          "34"
        ],
        [
          "Il y a 3 jours, 9 h 30",
          "DEM-26-0027",
          "",
          "1",
          "33"
        ],
        [
          "Il y a 3 jours, 14 h 00",
          "BP-731530 (commande CMD-731530)",
          "",
          "3",
          "30"
        ],
        [
          "Il y a 2 jours, 10 h 15",
          "BP-731561 (commande CMD-731561)",
          "",
          "2",
          "28"
        ],
        [
          "Il y a 1 jour, 13 h 42",
          "BP-731602 (commande CMD-731602)",
          "",
          "1",
          "27"
        ]
      ],
      "note": "8 mouvements pour l'article ECO-BT-01 (la fiche en imprime 11 lignes). Piège de l'ordre : l'écran liste du plus récent au plus ancien, et le premier mouvement (une commande d'il y a 6 jours) est plus ancien que la réception. Les autres articles bougent aussi (19 mouvements au total) : il faut trier. Accepter BP-… ou CMD-… dans la colonne « Document »."
    },
    {
      "etape": 4,
      "etapeTitre": "Lister les mouvements et remplir la fiche de stock",
      "genre": "reflexion",
      "texte": "Regarde la colonne « Type » de ta fiche : que remarques-tu ?",
      "pistes": [
        "Les mouvements n'ont pas tous le même type : réception, préparation (commande), mais aussi retour client et casse.",
        "Une entrée n'est pas toujours un achat (un retour client), une sortie n'est pas toujours une vente (une casse). La colonne « Type » le dit."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Lister les mouvements et remplir la fiche de stock",
      "genre": "reflexion",
      "texte": "Pourquoi, à ton avis, le système garde-t-il le « Stock après » à chaque ligne, et pas seulement le stock du jour ?",
      "pistes": [
        "Pouvoir vérifier chaque ligne (stock avant + entrée − sortie) et repérer l'endroit exact où le chiffre devient faux.",
        "Retrouver le stock d'un jour passé sans recompter : c'est justement ce que fait l'étape 6.",
        "Accepter toute idée de contrôle, de preuve ou de traçabilité."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "tableau",
      "texte": "Type de mouvement | Où je retrouve le document",
      "entetes": [
        "Type de mouvement",
        "Où je retrouve le document"
      ],
      "contexte": "Un mouvement de stock doit toujours avoir un document : sans lui, personne ne peut dire pourquoi le stock a bougé. La colonne « Origine » de ta fiche te donne le code de ce document. À toi de retrouver chacun d'eux.",
      "reponses": [
        [
          "Entrée : réception",
          "Menu « Réceptions »"
        ],
        [
          "Sortie : préparation",
          "Menu « Commandes » (bon de préparation BP-… = commande CMD-… aux mêmes chiffres)"
        ],
        [
          "Entrée : retour client",
          "Messagerie (message du service retours)"
        ],
        [
          "Sortie : casse",
          "Messagerie (message du cariste)"
        ]
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "tableau",
      "texte": "N° de réception | Fournisseur | Écouteurs dans la livraison ? | Quantité d'écouteurs",
      "entetes": [
        "N° de réception",
        "Fournisseur",
        "Écouteurs dans la livraison ?",
        "Quantité d'écouteurs"
      ],
      "contexte": "Dans « Réceptions », ouvre chaque réception de la liste :",
      "reponses": [
        [
          "REC-26-0412",
          "Kabeo",
          "non (câbles, chargeurs, batteries)",
          "—"
        ],
        [
          "REC-26-0415",
          "Sonoria",
          "oui",
          "12"
        ]
      ],
      "note": "Piège : REC-26-0412 est une vraie réception de la semaine, mais sans écouteurs : l'élève qui la cite se trompe de ligne. Le tableau imprime 4 lignes pour ne pas donner le nombre de réceptions."
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "tableau",
      "texte": "N° de commande | Client | Écouteurs dans la commande ? | Quantité d'écouteurs",
      "entetes": [
        "N° de commande",
        "Client",
        "Écouteurs dans la commande ?",
        "Quantité d'écouteurs"
      ],
      "contexte": "Dans « Commandes », ouvre chaque commande de la liste (tu n'auras peut-être pas besoin de toutes les lignes) :",
      "reponses": [
        [
          "CMD-731402",
          "Léa Guérin",
          "oui",
          "2"
        ],
        [
          "CMD-731455",
          "Louis Roux",
          "non (câbles et chargeur)",
          "—"
        ],
        [
          "CMD-731488",
          "Enzo Lacoste",
          "oui",
          "1"
        ],
        [
          "CMD-731530",
          "Emma Simon",
          "oui",
          "3"
        ],
        [
          "CMD-731561",
          "Jade Darrieux",
          "oui",
          "2"
        ],
        [
          "CMD-731602",
          "Clara Moreau",
          "oui",
          "1"
        ]
      ],
      "note": "Piège : CMD-731455 n'a aucun écouteur. Cinq commandes sur six sont à citer. Les noms de clients sont générés par la base (même graine à chaque fois). Le tableau imprime 8 lignes."
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "tableau",
      "texte": "Document reçu (n°) | De qui ? | Que s'est-il passé ? | Entrée ou sortie ?",
      "entetes": [
        "Document reçu (n°)",
        "De qui ?",
        "Que s'est-il passé ?",
        "Entrée ou sortie ?"
      ],
      "contexte": "Dans la « Messagerie », les services ont écrit à Nadia au sujet de deux mouvements de ta fiche :",
      "reponses": [
        [
          "RET-26-0091",
          "Service retours",
          "Retour client : une paire d'écouteurs neuve, emballage intact, renvoyée par le client de CMD-731402 et remise en rayon",
          "Entrée"
        ],
        [
          "DEM-26-0027",
          "Kevin Larrieu, cariste",
          "Casse : un boîtier tombé du chariot, écrasé, invendable, mis au rebut",
          "Sortie"
        ]
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "reflexion",
      "texte": "Parmi les mouvements de ta fiche, lesquels ne sont ni un achat ni une vente ? Explique pourquoi le stock a bougé quand même.",
      "pistes": [
        "Le retour client est une entrée qui n'est pas un achat : l'article revient en rayon, le stock remonte.",
        "La casse est une sortie qui n'est pas une vente : l'article est jeté, le stock baisse sans qu'aucune commande ne soit partie.",
        "Les deux modifient le stock sans que l'entreprise gagne ou paie une vente : d'où l'intérêt de les distinguer dans les mouvements."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "reflexion",
      "texte": "Dans une vraie entreprise, que risque-t-on si un mouvement de stock n'a aucun document ?",
      "pistes": [
        "On ne peut plus expliquer un écart : on ne sait pas s'il vient d'une erreur, d'un vol, d'une casse ou d'une vente non enregistrée.",
        "Le stock du système devient impossible à justifier, donc à corriger sans risque (voir l'inventaire).",
        "Accepter : perte de traçabilité, litige avec un client ou un fournisseur, difficulté de comptabilité."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Refaire le calcul à l'envers",
      "genre": "tableau",
      "texte": "Ce que je calcule | Mon calcul | Résultat",
      "entetes": [
        "Ce que je calcule",
        "Mon calcul",
        "Résultat"
      ],
      "contexte": "Tu connais le stock d'aujourd'hui et tout ce qui a bougé depuis l'inventaire. Tu peux donc retrouver le stock du jour de l'inventaire en remontant le temps : ce qui est entré depuis, on le retire ; ce qui est sorti depuis, on le remet.",
      "reponses": [
        [
          "Total des entrées (colonne « Entrée »)",
          "12 + 1",
          "13"
        ],
        [
          "Total des sorties (colonne « Sortie »)",
          "2 + 1 + 1 + 3 + 2 + 1",
          "10"
        ],
        [
          "Stock actuel (étape 3)",
          "27",
          "27"
        ],
        [
          "Stock du dernier inventaire, calculé à l'envers",
          "27 − 13 + 10",
          "24"
        ],
        [
          "Vérification à l'endroit : inventaire + entrées − sorties",
          "24 + 13 − 10",
          "27"
        ]
      ],
      "note": "La ligne « Inventaire » de la fiche doit donc afficher 24, et la ligne suivante se vérifie : 24 − 2 = 22."
    },
    {
      "etape": 6,
      "etapeTitre": "Refaire le calcul à l'envers",
      "genre": "reflexion",
      "texte": "Si ta vérification n'était pas tombée juste, par où aurais-tu commencé à chercher l'erreur ?",
      "pistes": [
        "Refaire les totaux, puis vérifier l'ordre des lignes de la fiche, puis chercher un mouvement oublié (ou en trop : celui d'un autre article).",
        "Contrôler la fiche ligne à ligne grâce à la règle « stock après = ligne du dessus + entrée − sortie » (étape 4).",
        "Ne pas modifier un résultat « pour que ça tombe juste »."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Refaire le calcul à l'envers",
      "genre": "reflexion",
      "texte": "Au prochain inventaire, le comptage donne 2 articles de moins que le stock du système. Que ferais-tu en premier ?",
      "pistes": [
        "Ne pas corriger tout de suite : recompter, puis chercher dans les mouvements ce qui explique les 2 articles manquants (casse non déclarée, retour non enregistré, erreur de préparation).",
        "Seulement ensuite, si rien ne l'explique, régulariser avec un motif écrit. C'est la démarche de la séance suivante (ENT-2.2)."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Répondre à Nadia Ferrand",
      "genre": "tableau",
      "texte": "Ligne de Nadia | Ce que j'écris sur cette ligne",
      "entetes": [
        "Ligne de Nadia",
        "Ce que j'écris sur cette ligne"
      ],
      "contexte": "Tu as tout ce qu'il faut. Il reste à répondre à Nadia comme elle le demande : six lignes, une information par ligne.",
      "reponses": [
        [
          "Stock actuel :",
          "27"
        ],
        [
          "Réception :",
          "REC-26-0415, 12 écouteurs"
        ],
        [
          "Commandes :",
          "CMD-731402, CMD-731488, CMD-731530, CMD-731561, CMD-731602 (pas CMD-731455, sans écouteurs)"
        ],
        [
          "Retour :",
          "RET-26-0091"
        ],
        [
          "Casse :",
          "DEM-26-0027"
        ],
        [
          "Stock au dernier inventaire :",
          "27 − 13 + 10 = 24"
        ]
      ],
      "note": "Ce que lisent les 5 jalons du suivi : dernier nombre de la ligne « Stock actuel » ; numéro ET quantité sur « Réception », sans citer REC-26-0412 ; toutes les commandes à écouteurs et aucune autre ; RET et DEM sur leurs lignes ; dernier nombre de la ligne « Stock au dernier inventaire » (le calcul reste visible)."
    },
    {
      "etape": 7,
      "etapeTitre": "Répondre à Nadia Ferrand",
      "genre": "reflexion",
      "texte": "Le stock du système n'est pas un comptage. Qu'est-ce qui pourrait faire que le stock réel du rayon soit différent du chiffre de l'écran ?",
      "pistes": [
        "Une erreur de saisie, un mouvement non enregistré, une casse non déclarée, un vol, un article rangé au mauvais emplacement.",
        "Le système ne sait que ce qu'on lui a dit : seul le comptage physique (l'inventaire) dit ce qu'il y a vraiment dans le rayon.",
        "Accepter toute cause plausible avec une explication."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Répondre à Nadia Ferrand",
      "genre": "reflexion",
      "texte": "Relis ta réponse comme si tu étais Nadia : peut-elle comprendre comment tu as trouvé chaque nombre ? Explique.",
      "pistes": [
        "Réponse personnelle : les numéros de documents (REC, CMD, RET, DEM) et le calcul visible permettent de retrouver chaque nombre sans le logiciel.",
        "Valoriser l'élève qui constate qu'il manque une justification ou qui la complète."
      ]
    }
  ]
};
