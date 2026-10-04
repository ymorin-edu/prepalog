// Généré par outils/trame-cdiscount-regularise.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-2.4",
  "titre": "Cdiscount — régularisé à l’aveugle",
  "trame": "ENT-2.4-cdiscount-regularise-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "La place de marché et ses vendeurs",
      "genre": "fait",
      "texte": "Nom du service qui stocke et expédie les produits des vendeurs",
      "rep": "Octopia Fulfillment (« Fulfillment by Cdiscount »).",
      "note": "Source : marketplace.cdiscount.com, page « Octopia Fulfillment » (relue le 04/10/2026). Accepter « Cdiscount Fulfilment »."
    },
    {
      "etape": 1,
      "etapeTitre": "La place de marché et ses vendeurs",
      "genre": "fait",
      "texte": "Dans quel entrepôt vont les petits produits (moins de 30 kg) ?",
      "rep": "Cestas (Gironde).",
      "note": "Même page : Cestas pour les produits de moins de 30 kg et de moins de 2 m."
    },
    {
      "etape": 1,
      "etapeTitre": "La place de marché et ses vendeurs",
      "genre": "question",
      "texte": "Que fait ce service pour le vendeur ?",
      "rep": "Il stocke ses produits, les emballe et les expédie à ses clients ; il gère aussi les retours.",
      "note": "Même page : « stockage, emballage et expédition de vos produits »."
    },
    {
      "etape": 1,
      "etapeTitre": "La place de marché et ses vendeurs",
      "genre": "qcm",
      "texte": "Un ajustement de stock, c'est :",
      "choix": [
        "une correction du stock du système, avec un motif",
        "une commande d'un client",
        "une livraison d'un fournisseur"
      ],
      "bonne": 0,
      "explication": "Un ajustement corrige le stock du système pour qu'il corresponde au stock compté. Il doit porter un motif et, normalement, un document justificatif : sans lui, on efface la trace de la cause.",
      "notion": "Ajustement (régularisation)"
    },
    {
      "etape": 1,
      "etapeTitre": "La place de marché et ses vendeurs",
      "genre": "reflexion",
      "texte": "D'après ce que tu as trouvé, quand Cdiscount stocke les produits d'un vendeur, qui est gêné si le stock du système est faux ?",
      "pistes": [
        "Le vendeur : son espace affiche un stock faux, il ne vend pas ce qu'il a, ou vend ce qu'il n'a plus.",
        "Les clients du vendeur (commandes annulées) ; Cdiscount, responsable de la marchandise qu'on lui confie.",
        "Valoriser l'élève qui voit que la marchandise n'appartient pas à Cdiscount."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire les messages",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Ouvre l'activité « Cdiscount — régularisé à l'aveugle ». Dans « Messagerie », lis tous les messages, en commençant par ceux de Nadia Ferrand : sa mission, puis le message qu'elle te transfère.",
      "reponses": [
        [
          "Par quoi Nadia te demande-t-elle de commencer ?",
          "Par le tableur : exporter les ajustements du mois (Extractions, liste « Mouvements de stock »)"
        ],
        [
          "Les critères de l'extraction : « Type de mouvement »",
          "Ajustement inventaire"
        ],
        [
          "Les critères de l'extraction : « Allée »",
          "Toutes"
        ],
        [
          "Les critères de l'extraction : « Période »",
          "30 derniers jours"
        ],
        [
          "Combien d'ajustements Samir a-t-il passés dans l'allée B ?",
          "2 (campagne INV-2026-47)"
        ],
        [
          "Combien de lignes doit contenir ta réponse ?",
          "8"
        ],
        [
          "Délai pour réclamer auprès du fournisseur",
          "8 jours après la livraison"
        ],
        [
          "Le vendeur : combien de mixeurs livrés pour son compte ?",
          "12 (livrés par Gardéo le jour de REC-26-0447)"
        ],
        [
          "Le vendeur : combien son espace en affiche-t-il maintenant ?",
          "8"
        ]
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire les messages",
      "genre": "reflexion",
      "texte": "Samir écrit : « Pas besoin d'aller plus loin. » Avant de commencer, qu'en penses-tu ?",
      "pistes": [
        "Il a recompté, mais il n'a pas cherché de cause : « ça arrive » n'est pas une explication.",
        "Un ajustement efface la trace : sans enquête, on ne pourra plus réclamer à personne.",
        "Question de prévision : toute réponse argumentée est recevable."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Extraire, exporter, repérer avec SI",
      "genre": "fait",
      "texte": "Nombre de lignes affiché dans Extractions, une fois les critères réglés",
      "rep": "Lu à l'écran par l'élève : 20 avec les critères de Nadia (confirmé : 30).",
      "note": "La trame ne donne jamais ce nombre. Tout l'entrepôt (allées A, B, C) sur 30 jours. Un ajustement passé par l'élève à la console s'y ajoute. Le corrigé par élève (onglet Corrigés) donne son bon export. Erreurs typiques : Type laissé sur « Tous » (réceptions et préparations en trop), Allée sur « B » (4 ajustements seulement, dont les deux de Samir : 16 manquent, 26 en confirmé), Période laissée sur « 7 derniers jours » (ajustements manquants) ou « Tout l'historique » (7 ajustements du mois précédent en trop)."
    },
    {
      "etape": 3,
      "etapeTitre": "Extraire, exporter, repérer avec SI",
      "genre": "fait",
      "texte": "Ton fichier a-t-il autant de lignes de données ? (oui / non)",
      "rep": "Oui : le fichier contient ce que montrait l'écran (sans la ligne des titres)."
    },
    {
      "etape": 3,
      "etapeTitre": "Extraire, exporter, repérer avec SI",
      "genre": "fait",
      "texte": "Lettre de la colonne « Document »",
      "rep": "I.",
      "note": "L'export a maintenant 10 colonnes : la colonne B « Type » s'est ajoutée."
    },
    {
      "etape": 3,
      "etapeTitre": "Extraire, exporter, repérer avec SI",
      "genre": "fait",
      "texte": "Formule que tu as écrite en ligne 2",
      "rep": "=SI(I2=\"\";\"À VÉRIFIER\";\"\")",
      "note": "Écrite en K2. Équivalents : =SI(ESTVIDE(I2);\"À VÉRIFIER\";\"\"). Le contrôle exige SI (IF) et lit « À VÉRIFIER » sans tenir compte des majuscules ni des accents."
    },
    {
      "etape": 3,
      "etapeTitre": "Extraire, exporter, repérer avec SI",
      "genre": "fait",
      "texte": "Combien de lignes affichent À VÉRIFIER ?",
      "rep": "1 (AJ-26-0217, MIX-PLG, −4, Démarque inconnue, Samir Benkhelifa).",
      "note": "Une seule aussi en confirmé. Si l'élève a passé lui-même un ajustement à la console, il entre dans l'export, sans document."
    },
    {
      "etape": 3,
      "etapeTitre": "Extraire, exporter, repérer avec SI",
      "genre": "reflexion",
      "texte": "Au départ, la période était sur « 7 derniers jours ». Si tu l'avais laissée, qu'aurait-il manqué à Nadia pour clôturer son mois ?",
      "pistes": [
        "Les ajustements de plus d'une semaine : Nadia clôture le MOIS, elle doit tous les voir.",
        "Le compte par motif serait faux (trop peu d'ajustements) et la démarque inconnue paraîtrait plus faible ou plus forte qu'elle n'est.",
        "Au dépôt, le site l'aurait dit : « Il manque n lignes demandées »."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Extraire, exporter, repérer avec SI",
      "genre": "reflexion",
      "texte": "Un ajustement sans document : pourquoi est-ce un problème pour Nadia, qui doit signer la clôture du mois ?",
      "pistes": [
        "Elle signe sans savoir pourquoi le stock a changé : si c'est une erreur, elle l'officialise.",
        "Sans document, on ne peut ni réclamer, ni prouver, ni retrouver la cause plus tard.",
        "Mission de Nadia : « je ne signe pas un ajustement dont je ne connais pas la cause »."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Compter par motif avec NB.SI",
      "genre": "tableau",
      "texte": "Motif | Nombre",
      "entetes": [
        "Motif",
        "Nombre"
      ],
      "contexte": "Nadia trouve la démarque inconnue élevée ce mois-ci. Pour le vérifier, compte les ajustements par motif.",
      "reponses": [
        [
          "Casse",
          "7"
        ],
        [
          "Erreur de prélèvement",
          "5"
        ],
        [
          "Erreur de réception",
          "3"
        ],
        [
          "Démarque inconnue",
          "5"
        ]
      ],
      "note": "Confirmé : 10 / 8 / 5 / 7. Les motifs doivent être écrits comme dans l'export (le contrôle ignore majuscules et accents)."
    },
    {
      "etape": 4,
      "etapeTitre": "Compter par motif avec NB.SI",
      "genre": "fait",
      "texte": "Formule que tu as écrite en B2",
      "rep": "=NB.SI(Mouvements!H:H;A2)",
      "note": "Sous LibreOffice : =NB.SI($Mouvements.H:H;A2). Le contrôle exige NB.SI (COUNTIF)."
    },
    {
      "etape": 4,
      "etapeTitre": "Compter par motif avec NB.SI",
      "genre": "reflexion",
      "texte": "Regarde ta synthèse. La démarque inconnue te paraît-elle élevée ? Justifie avec tes chiffres.",
      "pistes": [
        "5 sur 20, un quart des ajustements : c'est beaucoup pour un motif qui veut dire « on ne sait pas ».",
        "Et l'un d'eux (les mixeurs) n'a même pas de fiche de recomptage : c'est lui qui gonfle le chiffre sans preuve.",
        "Accepter une réponse nuancée si elle s'appuie sur les nombres."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Déposer ton fichier",
      "genre": "tableau",
      "texte": "Dépôt | Résultats justes | Ce que j'ai corrigé avant de redéposer",
      "entetes": [
        "Dépôt",
        "Résultats justes",
        "Ce que j'ai corrigé avant de redéposer"
      ],
      "contexte": "Nadia trouve la démarque inconnue élevée ce mois-ci. Pour le vérifier, compte les ajustements par motif.",
      "reponses": [
        [
          "1er",
          "Variable (24 sur 24 si tout est juste)",
          "Variable"
        ]
      ],
      "note": "Total, pour le bon export : 20 lignes « À vérifier » + 4 motifs = 24 (confirmé : 30 + 4 = 34) ; il change si l'export de l'élève a d'autres lignes (les formules sont contrôlées sur SON fichier). Retour d'entraînement : « n résultats justes sur m. Vous pouvez corriger votre fichier et le déposer de nouveau. », sans détail. L'export est jugé à part, au-dessus (niveau 2) : « ✓ Export : vos critères donnent bien les lignes demandées. » ou « ✗ Export à refaire (Extractions) » avec « n lignes en trop : leur « Type de mouvement » ne correspond pas à la demande » ou « Il manque n lignes demandées ». Le jalon « export » reste en attente tant que rien n'est déposé."
    },
    {
      "etape": 5,
      "etapeTitre": "Déposer ton fichier",
      "genre": "reflexion",
      "texte": "Sans le détail des erreurs, comment as-tu vérifié ton fichier ?",
      "pistes": [
        "Compter soi-même les lignes sans document et les motifs (filtre, tri) et comparer avec ses formules.",
        "Vérifier que la somme de la synthèse égale le nombre de lignes de son export (celui affiché dans Extractions).",
        "Relire une formule recopiée en bas du tableau."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Retrouver chaque ajustement et son document",
      "genre": "tableau",
      "texte": "Référence | Quantité | Motif saisi | Document qui le justifie (ou « aucun »)",
      "entetes": [
        "Référence",
        "Quantité",
        "Motif saisi",
        "Document qui le justifie (ou « aucun »)"
      ],
      "contexte": "Le tableur t'a montré un ajustement sans document. Retourne dans le logiciel pour enquêter sur les deux ajustements de Samir.",
      "reponses": [
        [
          "MIX-PLG",
          "−4",
          "Démarque inconnue",
          "aucun (ajustement orphelin)"
        ],
        [
          "GRP-2F",
          "−1",
          "Casse",
          "DEM-26-0036 (constat de Kevin Larrieu)"
        ]
      ],
      "note": "Lignes « Ajustement inventaire » de l'onglet Mouvements, origine « INV-2026-47 · … », saisies par Samir Benkhelifa."
    },
    {
      "etape": 6,
      "etapeTitre": "Retrouver chaque ajustement et son document",
      "genre": "question",
      "texte": "Pour l'ajustement justifié, quelle phrase du message t'a convaincu ?",
      "rep": "Le constat DEM-26-0036 : un grille-pain GRP-2F, quantité 1, « Je n'ai pas eu le temps de le saisir : Samir l'a passé en ajustement « Casse » ce matin. »"
    },
    {
      "etape": 6,
      "etapeTitre": "Retrouver chaque ajustement et son document",
      "genre": "reflexion",
      "texte": "Pour l'un des deux ajustements, qu'est-ce qui t'a fait passer du doute à la certitude ?",
      "pistes": [
        "Le grille-pain : la casse paraît suspecte (même nuit, même magasinier), mais le constat de Kevin la justifie, quantité comprise.",
        "Les mixeurs : le message de Samir paraît sûr (« recompté deux fois »), mais aucun document ; le message de Kevin (un trou dans la couche) met sur la piste de la réception.",
        "Valoriser l'élève qui cite le document ou le message décisif."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Remonter à la réception et chiffrer",
      "genre": "tableau",
      "texte": "Colis n° | Référence | Contenu",
      "entetes": [
        "Colis n°",
        "Référence",
        "Contenu"
      ],
      "contexte": "Pour l'ajustement orphelin, remonte l'histoire de l'article : d'où viennent les articles qui manquent ?",
      "reponses": [
        [
          "6",
          "MIX-PLG",
          "4"
        ],
        [
          "7",
          "MIX-PLG",
          "4"
        ]
      ],
      "note": "REC-26-0447 a 7 colis : BOU-17L (1 à 3, 4 chacun), GRP-2F (4 et 5, 4 chacun), MIX-PLG (6 et 7, 4 chacun). Le tableau imprime 4 lignes."
    },
    {
      "etape": 7,
      "etapeTitre": "Remonter à la réception et chiffrer",
      "genre": "fait",
      "texte": "Numéro de la réception",
      "rep": "REC-26-0447 (Gardéo, BL-GD-30912, lot LOT-GD-2711)."
    },
    {
      "etape": 7,
      "etapeTitre": "Remonter à la réception et chiffrer",
      "genre": "fait",
      "texte": "Quantité annoncée pour l'article",
      "rep": "12."
    },
    {
      "etape": 7,
      "etapeTitre": "Remonter à la réception et chiffrer",
      "genre": "fait",
      "texte": "Quantité réellement reçue (total des colis)",
      "rep": "8 (4 + 4)."
    },
    {
      "etape": 7,
      "etapeTitre": "Remonter à la réception et chiffrer",
      "genre": "fait",
      "texte": "Prix d'achat HT de l'article",
      "rep": "12,60 €.",
      "note": "Console : .getprice MIX-PLG (prix TTC 27,99 €, à ne pas prendre)."
    },
    {
      "etape": 7,
      "etapeTitre": "Remonter à la réception et chiffrer",
      "genre": "tableau",
      "texte": "Ce que je calcule | Mon calcul | Résultat",
      "entetes": [
        "Ce que je calcule",
        "Mon calcul",
        "Résultat"
      ],
      "contexte": "Pour l'ajustement orphelin, remonte l'histoire de l'article : d'où viennent les articles qui manquent ?",
      "reponses": [
        [
          "Quantité manquante",
          "12 − 8",
          "4"
        ],
        [
          "Valeur du manque (quantité × prix d'achat)",
          "4 × 12,60",
          "50,40 €"
        ]
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Remonter à la réception et chiffrer",
      "genre": "reflexion",
      "texte": "Le bon de réception affiche une quantité comptée égale à l'annoncé. D'après toi, que s'est-il passé au quai le jour de la livraison ?",
      "pistes": [
        "Le réceptionnaire a recopié l'annoncé sans compter les colis (« comptage » de complaisance).",
        "Kevin a vu un vide dans la couche, mais la réception était déjà validée et il n'a rien dit.",
        "Le système a donc fait entrer 12 mixeurs ; il n'y en avait que 8 : l'écart est né là, pas dans le rayon."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Répondre à Nadia",
      "genre": "tableau",
      "texte": "Ligne de Nadia | Ce que j'écris sur cette ligne",
      "entetes": [
        "Ligne de Nadia",
        "Ce que j'écris sur cette ligne"
      ],
      "contexte": "Pour l'ajustement orphelin, remonte l'histoire de l'article : d'où viennent les articles qui manquent ?",
      "reponses": [
        [
          "Ajustement à revoir :",
          "MIX-PLG, −4"
        ],
        [
          "Ajustement justifié :",
          "GRP-2F, constat de casse DEM-26-0036"
        ],
        [
          "Réception concernée :",
          "REC-26-0447"
        ],
        [
          "Annoncé sur le bon de livraison :",
          "12"
        ],
        [
          "Réellement reçu :",
          "8"
        ],
        [
          "Valeur du manque :",
          "4 × 12,60 = 50,40 €"
        ],
        [
          "Motif exact :",
          "Erreur de réception"
        ],
        [
          "Suite à donner :",
          "Réclamation auprès de Gardéo (livraison incomplète), dans les 8 jours"
        ]
      ],
      "note": "Ce que lisent les jalons : MIX-PLG sur « à revoir » sans GRP ; GRP-2F et DEM-26-0036 sur « justifié » ; REC-26-0447 seule ; 12 et 8 ; dernier nombre 50,40 ; « erreur de réception » (ou livraison incomplète) ; « réclam », « litige », « avoir » ou « réserve » sur la suite. La mission renvoie, comme la trame, à la colonne Motif de l'export."
    },
    {
      "etape": 8,
      "etapeTitre": "Répondre à Nadia",
      "genre": "reflexion",
      "texte": "Julien Mounet attend une réponse. Que lui répondrais-tu, en deux ou trois phrases ?",
      "pistes": [
        "Ses 4 mixeurs ne sont jamais arrivés : Gardéo en a livré 8, pas 12 ; ce n'est ni une perte ni un vol à Cestas.",
        "Cdiscount réclame auprès de Gardéo (dans les 8 jours) et corrige l'ajustement : motif « Erreur de réception ».",
        "S'excuser du délai et lui dire quand son stock affiché sera juste.",
        "Pas de jalon sur ce point : valoriser une réponse claire, polie, qui ne promet pas ce qu'on ne maîtrise pas."
      ]
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Tout ajustement doit pouvoir être relié à un ………………….",
      "rep": "justificatif."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Un ajustement sans document se remonte jusqu'à son ………………… : souvent une réception mal comptée.",
      "rep": "origine."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "On regroupe les ajustements par ………………… pour voir d'où viennent les pertes.",
      "rep": "type."
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
      "contexte": "Pour l'ajustement orphelin, remonte l'histoire de l'article : d'où viennent les articles qui manquent ?",
      "reponses": [
        [
          "Régulariser",
          "compté"
        ],
        [
          "Ajustement orphelin",
          "document"
        ],
        [
          "Motif",
          "écrite"
        ],
        [
          "Clôture du mois",
          "arrête"
        ],
        [
          "Démarque inconnue",
          "cause"
        ],
        [
          "Bon de réception",
          "reçu"
        ],
        [
          "Fonction SI",
          "vraie"
        ],
        [
          "Fonction NB.SI",
          "compte"
        ]
      ],
      "note": "Un mot de la banque par trou."
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Formule en F2 : « À VÉRIFIER » si E2 est vide, sinon rien",
      "rep": "=SI(E2=\"\";\"À VÉRIFIER\";\"\")"
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Combien de lignes sont à vérifier ?",
      "rep": "2 (lignes 4 et 6)."
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Formule qui compte les « Inventaire » de D2 à D7",
      "rep": "=NB.SI(D2:D7;\"Inventaire\")"
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Résultat de ce comptage",
      "rep": "2."
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "question",
      "texte": "Pour la ligne 4 (−4 mixeurs, sans document), où chercherais-tu d'abord ?",
      "rep": "Dans les réceptions récentes de mixeurs MX-2 : un bon de réception mal compté explique souvent un manque."
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Que risque l'entreprise si personne ne vérifie ces lignes avant la clôture du mois ?",
      "pistes": [
        "Signer des chiffres de stock faux à la clôture.",
        "Ne jamais retrouver une erreur de réception, et la payer (au fournisseur ou au vendeur)."
      ]
    }
  ]
};
