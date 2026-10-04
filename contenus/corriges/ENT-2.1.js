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
      "note": "Source : Wikipédia, article « Cdiscount » (relu le 04/10/2026) : fondée en 1998 à Bordeaux par Hervé, Christophe et Nicolas Charle."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "fait",
      "texte": "Dans quelle ville a-t-elle été fondée ?",
      "rep": "Bordeaux (Gironde).",
      "note": "Même source. Le siège est toujours à Bordeaux."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "fait",
      "texte": "Quel est le nom de sa filiale logistique ?",
      "rep": "C-Logistics (créée en 2019).",
      "note": "Source : Voxlog, reportage du 04/10/2023 sur l'entrepôt de Réau (« la filiale logistique de Cdiscount créée en 2019 »)."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "fait",
      "texte": "Quels produits l'entrepôt de Cestas traite-t-il (quel poids) ?",
      "rep": "Les produits de moins de 30 kg.",
      "note": "Source : Voxlog (04/10/2023) : Cestas (33) traite les produits de moins de 30 kg ; les encombrants (plus de 30 kg) vont près de Saint-Étienne. Accepter aussi « les petits colis »."
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
      "explication": "Une place de marché est un site où des vendeurs indépendants vendent leurs produits à côté de ceux du site. Cdiscount a ouvert la sienne en 2010 (« C le marché »).",
      "notion": "Place de marché (commerce en ligne)"
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir Cdiscount",
      "genre": "reflexion",
      "texte": "D'après ce que tu as trouvé, pourquoi une erreur de stock coûte-t-elle plus cher à Cdiscount en novembre qu'en mars ?",
      "pistes": [
        "Fin novembre (Black Friday) puis jusqu'à Noël, les ventes explosent : un article affiché à tort se vend beaucoup plus de fois.",
        "Plus de commandes annulées, plus de clients mécontents, au moment où ils comparent les sites.",
        "Repère daté : à Noël 2017, Cestas expédiait 300 000 colis par jour, « en plein rush depuis Black Friday » (France Bleu, 19/12/2017). Chiffre ancien, à présenter comme tel.",
        "Accepter toute réponse qui relie la période chargée au nombre de ventes touchées par l'erreur."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la messagerie : le problème de ce matin",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Connecte-toi à Prepalog, ouvre la rubrique Logisim, puis l'activité « Cdiscount — le stock raconte ». Le logiciel s'ouvre aux couleurs de Cdiscount, avec un menu à gauche. L'accueil liste le travail de la séance, dans l'ordre.",
      "reponses": [
        [
          "Qui t'écrit, et quel est son poste ?",
          "Nadia Ferrand, cheffe d'équipe stock"
        ],
        [
          "Quelle commande a été annulée ce matin (numéro) ?",
          "CMD-731602 (Mme Moreau)"
        ],
        [
          "Référence de l'article commandé",
          "ECO-BT-01 (écouteurs sans fil Bluetooth)"
        ],
        [
          "Ce que le préparateur a trouvé à l'emplacement",
          "L'emplacement A-02-1 vide"
        ],
        [
          "Combien d'articles le système dit-il qu'il en reste ?",
          "1 (« il en reste un »)"
        ],
        [
          "Date du dernier inventaire de l'allée",
          "Il y a 7 jours (la date est écrite dans le message)"
        ],
        [
          "Combien de lignes doit contenir ta réponse complète ?",
          "7"
        ]
      ],
      "note": "La date d'inventaire est calculée à l'ouverture : J-7. Le message dit « il en reste un » en toutes lettres : c'est l'énoncé, l'élève le vérifie à l'étape 3."
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la messagerie : le problème de ce matin",
      "genre": "reflexion",
      "texte": "Le système dit qu'il reste des écouteurs, le rayon est vide. D'après toi, avant de chercher, qu'est-ce qui a pu se passer ?",
      "pistes": [
        "Une erreur de saisie, un article cassé ou perdu sans être enregistré, un vol, un article rangé ailleurs.",
        "Question de prévision : toute hypothèse est recevable ; on y revient à l'étape 6."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Relever le stock actuel et l'envoyer",
      "genre": "tableau",
      "texte": "Où as-tu lu le stock ? | Stock actuel de l'article",
      "entetes": [
        "Où as-tu lu le stock ?",
        "Stock actuel de l'article"
      ],
      "contexte": "Tu vas relever le stock d'écouteurs que le système affiche aujourd'hui. Il y a deux façons de le faire : essaie les deux.",
      "reponses": [
        [
          "Écran « Stock »",
          "1"
        ],
        [
          "Console",
          "1 (.getstock ECO-BT-01 : « 1 article », statut « Faible »)"
        ]
      ],
      "note": "Code d'accès de l'écran Stock : donné par l'enseignant (STOCK24 sur la page d'essai). Confirmé : 1 aussi."
    },
    {
      "etape": 3,
      "etapeTitre": "Relever le stock actuel et l'envoyer",
      "genre": "reflexion",
      "texte": "Ce nombre te dit-il comment le stock est arrivé là ? Explique ta réponse.",
      "pistes": [
        "Non : 1 ne dit ni ce qui est entré, ni ce qui est sorti, ni pourquoi. Il faut les mouvements.",
        "Et il ne dit pas si ce 1 est vrai : le préparateur a trouvé le rayon vide."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Lister les mouvements sur une fiche de stock",
      "genre": "tableau",
      "texte": "Date | Document (Origine) | Entrée | Sortie | Stock après",
      "entetes": [
        "Date",
        "Document (Origine)",
        "Entrée",
        "Sortie",
        "Stock après"
      ],
      "contexte": "Un mouvement de stock, c'est chaque fois que des articles entrent ou sortent. Le système les garde tous. Tu vas recopier ceux de l'article sur une fiche de stock.",
      "reponses": [
        [
          "Dernier inventaire (J-7)",
          "Inventaire",
          "",
          "",
          "4 (trouvé à l'étape 7)"
        ],
        [
          "J-6, 15 h 30",
          "BP-731402",
          "",
          "2",
          "2"
        ],
        [
          "J-5, 10 h 00",
          "REC-26-0415",
          "10",
          "",
          "12"
        ],
        [
          "J-4, 11 h 00",
          "BP-731488",
          "",
          "1",
          "11"
        ],
        [
          "J-4, 16 h 45",
          "RET-26-0091",
          "1",
          "",
          "12"
        ],
        [
          "J-3, 9 h 30",
          "DEM-26-0027",
          "",
          "1",
          "11"
        ],
        [
          "J-3, 14 h 00",
          "BP-731530",
          "",
          "3",
          "8"
        ],
        [
          "J-2, 10 h 15",
          "BP-731561",
          "",
          "3",
          "5"
        ],
        [
          "J-1, 9 h 36",
          "BP-731578",
          "",
          "2",
          "3"
        ],
        [
          "J-1, 15 h 12",
          "BP-731590",
          "",
          "2",
          "1"
        ]
      ],
      "note": "9 mouvements (la fiche imprime 13 lignes vides). L'écran met le plus récent en haut. Confirmé : 12 mouvements — en plus REC-26-0409 (J-7, 14 h, +6 → 10), BP-731420 (J-6, 11 h, −3 → 7, avant BP-731402 qui laisse alors 5), BP-731515 (J-4, 13 h 30, −3) ; le stock actuel reste 1."
    },
    {
      "etape": 4,
      "etapeTitre": "Lister les mouvements sur une fiche de stock",
      "genre": "reflexion",
      "texte": "Regarde la colonne « Type » de l'écran pour les lignes de ta fiche. Que remarques-tu ?",
      "pistes": [
        "Il n'y a pas que des réceptions et des préparations : un retour client (une entrée) et une casse (une sortie).",
        "Une entrée n'est pas toujours un achat, une sortie n'est pas toujours une vente."
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
      "contexte": "Un mouvement de stock doit toujours avoir un document : sans lui, personne ne peut dire pourquoi le stock a bougé. La colonne « Document » de ta fiche te donne son code. Retrouve chacun de ces documents.",
      "reponses": [
        [
          "Entrée : réception",
          "Menu « Réceptions »"
        ],
        [
          "Sortie : préparation",
          "Menu « Commandes » (BP-… = CMD-… aux mêmes chiffres)"
        ],
        [
          "Entrée : retour client",
          "Messagerie (Service retours)"
        ],
        [
          "Sortie : casse",
          "Messagerie (Kevin Larrieu, cariste)"
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
          "REC-26-0415",
          "Sonoria",
          "oui",
          "10"
        ],
        [
          "REC-26-0412",
          "Kabeo",
          "non (câbles, chargeurs, batteries)",
          "—"
        ]
      ],
      "note": "Piège : REC-26-0412 est bien de la semaine mais sans écouteurs. Confirmé : aussi REC-26-0409, Sonoria, oui, 6. Quatre lignes imprimées pour ne pas donner le nombre."
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "tableau",
      "texte": "Bon de ta fiche (BP-…) | Commande (CMD-…) | Client | Écouteurs commandés",
      "entetes": [
        "Bon de ta fiche (BP-…)",
        "Commande (CMD-…)",
        "Client",
        "Écouteurs commandés"
      ],
      "contexte": "Dans « Commandes », ouvre la commande de chaque bon de préparation de ta fiche :",
      "reponses": [
        [
          "BP-731402",
          "CMD-731402",
          "Léa Guérin",
          "2"
        ],
        [
          "BP-731488",
          "CMD-731488",
          "Enzo Lacoste",
          "1"
        ],
        [
          "BP-731530",
          "CMD-731530",
          "Emma Simon",
          "3"
        ],
        [
          "BP-731561",
          "CMD-731561",
          "Jade Darrieux",
          "3"
        ],
        [
          "BP-731578",
          "CMD-731578",
          "Chloé Laffitte",
          "2"
        ],
        [
          "BP-731590",
          "CMD-731590",
          "Maxime Fournier",
          "2"
        ]
      ],
      "note": "Six commandes (confirmé : huit, avec CMD-731420 et CMD-731515, 3 chacune). CMD-731455 et CMD-731545 n'ont pas d'écouteurs : elles ne sont pas sur la fiche. Noms des clients relevés sur la page d'essai (même base pour tous)."
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "fait",
      "texte": "Dans la liste « Commandes », quel est le statut de la commande de la cliente ?",
      "rep": "Annulée (CMD-731602, Clara Moreau).",
      "note": "L'écran de la commande dit : « Annulée le … à 7 h 24 — Rupture : emplacement A-02-1 vide à la préparation »."
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "question",
      "texte": "Cette commande a-t-elle fait bouger le stock d'écouteurs ? Justifie avec ce que tu as vu à l'écran.",
      "rep": "Non : aucun mouvement BP-731602 dans la liste ; son bon dit « Stock trouvé 0 », « À préparer 0 », « Rupture ».",
      "note": "C'est le piège du jalon 3 : la citer sur la ligne « Commandes » rend le jalon faux."
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "tableau",
      "texte": "Document (n°) | De qui ? | Que s'est-il passé ? | Entrée ou sortie ?",
      "entetes": [
        "Document (n°)",
        "De qui ?",
        "Que s'est-il passé ?",
        "Entrée ou sortie ?"
      ],
      "contexte": "Dans la « Messagerie », deux services t'ont écrit au sujet de deux mouvements de ta fiche :",
      "reponses": [
        [
          "RET-26-0091",
          "Service retours",
          "Un client (commande CMD-731402) renvoie 1 paire neuve, emballage intact, remise en rayon A-02-1",
          "Entrée"
        ],
        [
          "DEM-26-0027",
          "Kevin Larrieu, cariste",
          "Un carton tombé du chariot en allée A-02 : 2 boîtiers écrasés, mis au rebut, « saisi sur le terminal »",
          "Sortie"
        ]
      ],
      "note": "Ces deux messages arrivent après le premier envoi « Stock actuel : … » (juste ou faux)."
    },
    {
      "etape": 5,
      "etapeTitre": "Relier chaque mouvement à son document",
      "genre": "reflexion",
      "texte": "Parmi les mouvements de ta fiche, lesquels ne sont ni un achat ni une vente ? Explique pourquoi le stock a bougé quand même.",
      "pistes": [
        "Le retour client : une entrée sans achat ; l'article revient en rayon.",
        "La casse : une sortie sans vente ; l'article est jeté.",
        "Valoriser l'élève qui ajoute qu'il faut donc lire le type, pas seulement le signe."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Comparer chaque document à son mouvement",
      "genre": "tableau",
      "texte": "Document | Quantité écrite sur le document | Quantité du mouvement | Pareil ?",
      "entetes": [
        "Document",
        "Quantité écrite sur le document",
        "Quantité du mouvement",
        "Pareil ?"
      ],
      "contexte": "Le système ne sait que ce qu'on lui a saisi. Un document dit ce qui s'est passé dans l'entrepôt ; le mouvement dit ce qui a été saisi. Les deux doivent dire la même quantité.",
      "reponses": [
        [
          "BP-731402 (CMD-731402)",
          "2",
          "2",
          "oui"
        ],
        [
          "REC-26-0415",
          "10 (annoncé 10, compté 10)",
          "10",
          "oui"
        ],
        [
          "BP-731488 (CMD-731488)",
          "1",
          "1",
          "oui"
        ],
        [
          "RET-26-0091",
          "1",
          "1",
          "oui"
        ],
        [
          "DEM-26-0027",
          "2 (« Quantité : 2 »)",
          "1",
          "non"
        ],
        [
          "BP-731530 (CMD-731530)",
          "3",
          "3",
          "oui"
        ],
        [
          "BP-731561 (CMD-731561)",
          "3",
          "3",
          "oui"
        ],
        [
          "BP-731578 (CMD-731578)",
          "2",
          "2",
          "oui"
        ],
        [
          "BP-731590 (CMD-731590)",
          "2",
          "2",
          "oui"
        ]
      ],
      "note": "Une seule ligne diffère. Confirmé : trois lignes de plus, toutes « oui »."
    },
    {
      "etape": 6,
      "etapeTitre": "Comparer chaque document à son mouvement",
      "genre": "fait",
      "texte": "Quel document ne dit pas la même chose que son mouvement ?",
      "rep": "DEM-26-0027 (le constat de casse)."
    },
    {
      "etape": 6,
      "etapeTitre": "Comparer chaque document à son mouvement",
      "genre": "fait",
      "texte": "Écart entre le document et le mouvement (en nombre d'écouteurs)",
      "rep": "1 (2 constatés, 1 saisi)."
    },
    {
      "etape": 6,
      "etapeTitre": "Comparer chaque document à son mouvement",
      "genre": "tableau",
      "texte": "Commande | Stock trouvé (bon de préparation) | Stock du système juste avant | Pareil ?",
      "entetes": [
        "Commande",
        "Stock trouvé (bon de préparation)",
        "Stock du système juste avant",
        "Pareil ?"
      ],
      "contexte": "Le système ne sait que ce qu'on lui a saisi. Un document dit ce qui s'est passé dans l'entrepôt ; le mouvement dit ce qui a été saisi. Les deux doivent dire la même quantité.",
      "reponses": [
        [
          "CMD-731402",
          "4",
          "4",
          "oui"
        ],
        [
          "CMD-731488",
          "12",
          "12",
          "oui"
        ],
        [
          "CMD-731530",
          "10",
          "11",
          "non"
        ],
        [
          "CMD-731561",
          "7",
          "8",
          "non"
        ],
        [
          "CMD-731578",
          "4",
          "5",
          "non"
        ],
        [
          "CMD-731590",
          "2",
          "3",
          "non"
        ],
        [
          "CMD-731602 (annulée)",
          "0",
          "1",
          "non"
        ]
      ],
      "note": "Le « Stock trouvé » est le stock réel vu au rayon. Il décroche d'une unité à partir de CMD-731530, juste après la casse. Confirmé : avant la casse tout est pareil (CMD-731420 10 / 10, CMD-731402 7 / 7, CMD-731488 15 / 15, CMD-731515 14 / 14) ; après, mêmes valeurs que le standard."
    },
    {
      "etape": 6,
      "etapeTitre": "Comparer chaque document à son mouvement",
      "genre": "question",
      "texte": "À partir de quelle commande le « Stock trouvé » ne suit-il plus le stock du système ? Quel mouvement a eu lieu juste avant ?",
      "rep": "CMD-731530 ; juste avant, il y a eu la casse DEM-26-0027.",
      "note": "Seconde preuve, indépendante du constat : le rayon a toujours un écouteur de moins que le système après la casse."
    },
    {
      "etape": 6,
      "etapeTitre": "Comparer chaque document à son mouvement",
      "genre": "reflexion",
      "texte": "Comment as-tu su quel document était faux ?",
      "pistes": [
        "En comparant ligne par ligne : une seule quantité ne correspondait pas.",
        "Le constat dit « saisi sur le terminal » : il fallait vérifier la saisie.",
        "La colonne « Stock trouvé » décroche juste après la casse.",
        "Valoriser l'élève qui dit avoir d'abord soupçonné le retour client (fausse piste) puis vérifié."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Refaire le calcul à l'envers",
      "genre": "tableau",
      "texte": "Ce que je calcule | Mon calcul | Résultat",
      "entetes": [
        "Ce que je calcule",
        "Mon calcul",
        "Résultat"
      ],
      "contexte": "Tu connais le stock d'aujourd'hui et tout ce qui a bougé depuis l'inventaire. Tu peux retrouver le stock du jour de l'inventaire en remontant le temps : ce qui est entré depuis, on le retire ; ce qui est sorti depuis, on le remet.",
      "reponses": [
        [
          "Total des entrées (colonne « Entrée »)",
          "10 + 1",
          "11"
        ],
        [
          "Total des sorties (colonne « Sortie »)",
          "2 + 1 + 1 + 3 + 3 + 2 + 2",
          "14"
        ],
        [
          "Stock actuel (étape 3)",
          "",
          "1"
        ],
        [
          "Stock du dernier inventaire, calculé à l'envers",
          "1 − 11 + 14",
          "4"
        ],
        [
          "Vérification à l'endroit : inventaire + entrées − sorties",
          "4 + 11 − 14",
          "1"
        ]
      ],
      "note": "Confirmé : entrées 6 + 10 + 1 = 17, sorties 3 + 2 + 1 + 3 + 1 + 3 + 3 + 2 + 2 = 20 ; 1 − 17 + 20 = 4. On calcule avec les mouvements saisis : c'est bien le 4 de l'inventaire."
    },
    {
      "etape": 7,
      "etapeTitre": "Refaire le calcul à l'envers",
      "genre": "reflexion",
      "texte": "Si le système avait enregistré la quantité écrite sur le document de l'étape 6, qu'est-ce que ça aurait changé pour la cliente ?",
      "pistes": [
        "Le système afficherait 0 (4 + 11 − 15 = 0) au lieu de 1.",
        "Les écouteurs seraient affichés « en rupture » : le site n'aurait pas vendu la paire de la cliente, sa commande n'aurait pas été annulée.",
        "Accepter la réponse sans le calcul si l'idée est là : un de moins, donc zéro."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Répondre à Nadia Ferrand",
      "genre": "tableau",
      "texte": "Ligne de Nadia | Ce que j'écris sur cette ligne",
      "entetes": [
        "Ligne de Nadia",
        "Ce que j'écris sur cette ligne"
      ],
      "contexte": "Tu as tout ce qu'il faut. Envoie à Nadia la réponse complète : sept lignes, une information par ligne.",
      "reponses": [
        [
          "Stock actuel :",
          "1"
        ],
        [
          "Réception :",
          "REC-26-0415, 10"
        ],
        [
          "Commandes :",
          "CMD-731402, CMD-731488, CMD-731530, CMD-731561, CMD-731578, CMD-731590"
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
          "1 − 11 + 14 = 4"
        ],
        [
          "Ce qui cloche :",
          "DEM-26-0027 : 2 constatés, 1 saisi, écart 1"
        ]
      ],
      "note": "Ce que lisent les six jalons : dernier nombre de « Stock actuel » (1) ; « Réception » : REC-26-0415 et 10, sans REC-26-0412 ; « Commandes » : les six, ni CMD-731455, ni CMD-731545, ni CMD-731602 (annulée) ; RET et DEM sur leurs lignes ; dernier nombre de « Stock au dernier inventaire » (4) ; « Ce qui cloche » : DEM-26-0027, aucun autre document, dernier nombre 1. Confirmé : Réception REC-26-0409 et REC-26-0415, 16 (ou 6 et 10) ; Commandes + CMD-731420 et CMD-731515 ; calcul 1 − 17 + 20 = 4."
    },
    {
      "etape": 8,
      "etapeTitre": "Répondre à Nadia Ferrand",
      "genre": "reflexion",
      "texte": "Si tu étais à la place de Nadia, que ferais-tu maintenant pour que le système dise de nouveau la vérité ?",
      "pistes": [
        "Corriger le stock du système : sortir l'écouteur cassé non saisi (un ajustement de −1, avec le constat comme justificatif).",
        "Vérifier les autres articles de l'allée : une erreur de saisie peut se répéter (c'est le mot de clôture de Nadia, et la suite de la série).",
        "Rappeler la règle à l'équipe : saisir la quantité du constat.",
        "Accepter : prévenir le service client, recontacter la cliente."
      ]
    }
  ]
};
