// Généré par outils/trame-cdiscount-chiffres.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-2.2",
  "titre": "Cdiscount — ce que disent les chiffres",
  "trame": "ENT-2.2-cdiscount-chiffres-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Pourquoi un tableur ?",
      "genre": "fait",
      "texte": "Que veulent dire les lettres WMS (en anglais ou en français) ?",
      "rep": "Warehouse Management System : système (logiciel) de gestion d'entrepôt.",
      "note": "Définition courante (par exemple Wikipédia, « Warehouse management system »)."
    },
    {
      "etape": 1,
      "etapeTitre": "Pourquoi un tableur ?",
      "genre": "fait",
      "texte": "Date du Black Friday 2026",
      "rep": "Le vendredi 27 novembre 2026.",
      "note": "Le Black Friday est le lendemain de Thanksgiving (4e jeudi de novembre aux États-Unis, le 26/11/2026)."
    },
    {
      "etape": 1,
      "etapeTitre": "Pourquoi un tableur ?",
      "genre": "question",
      "texte": "À quoi sert un WMS dans un entrepôt ?",
      "rep": "À suivre tout ce qui se passe dans l'entrepôt : réceptions, emplacements, stock, préparations des commandes, expéditions, inventaires.",
      "note": "Accepter toute réponse qui parle de suivre le stock ou les flux de l'entrepôt."
    },
    {
      "etape": 1,
      "etapeTitre": "Pourquoi un tableur ?",
      "genre": "qcm",
      "texte": "Exporter des données d'un logiciel, c'est :",
      "choix": [
        "les copier dans un fichier qu'on ouvre ailleurs",
        "les effacer du logiciel",
        "les envoyer au client"
      ],
      "bonne": 0,
      "explication": "Exporter, c'est copier des données d'un logiciel (ici le WMS) dans un fichier qu'on ouvre ailleurs, par exemple un tableur. Les données restent dans le logiciel.",
      "notion": "Export"
    },
    {
      "etape": 1,
      "etapeTitre": "Pourquoi un tableur ?",
      "genre": "reflexion",
      "texte": "Le logiciel affiche déjà toutes les commandes. D'après toi, pourquoi Nadia veut-elle les avoir dans un tableur ?",
      "pistes": [
        "À l'écran, on lit une commande à la fois ; dans un tableur, on peut calculer sur toutes les lignes d'un coup.",
        "On peut trier, filtrer, compter, faire des totaux que l'écran ne propose pas.",
        "On garde une trace de l'analyse et on peut la transmettre."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la mission de Nadia",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Ouvre l'activité « Cdiscount — ce que disent les chiffres ». Dans le menu de gauche, clique sur « Messagerie » et ouvre le message de Nadia Ferrand : « Allée A : ce que disent les chiffres ». Lis-le en entier.",
      "reponses": [
        [
          "Quelle allée Nadia veut-elle vérifier ?",
          "L'allée A"
        ],
        [
          "Où trouves-tu le bouton pour exporter (quel menu) ?",
          "Commandes (bouton « Exporter les lignes de préparation »)"
        ],
        [
          "Nom de la première colonne à ajouter",
          "Écart"
        ],
        [
          "Nom de la deuxième colonne à ajouter",
          "Réf. en écart"
        ],
        [
          "Fonction à utiliser dans la deuxième colonne",
          "SI"
        ],
        [
          "Fonction à utiliser dans la feuille Synthèse",
          "NB.SI"
        ],
        [
          "Par quels mots doit commencer la ligne de ta réponse ?",
          "« À recompter : »"
        ]
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la mission de Nadia",
      "genre": "reflexion",
      "texte": "Nadia écrit : « On ne recompte pas tout ». D'après toi, pourquoi ne pas recompter toute l'allée ?",
      "pistes": [
        "Recompter prend du temps et mobilise des personnes, alors que l'entrepôt continue d'expédier.",
        "Les chiffres permettent de viser les références à risque : on recompte là où il y a un signal.",
        "Avant le Black Friday, le temps de l'équipe est précieux."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et ouvrir le fichier",
      "genre": "fait",
      "texte": "Combien de lignes de préparation contient l'export (sans la ligne des titres) ?",
      "rep": "30.",
      "note": "Confirmé : 45 (toute l'allée A, A-01 à A-06). L'export couvre le mois : 12 lignes d'avant le dernier inventaire, toutes sans écart."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et ouvrir le fichier",
      "genre": "fait",
      "texte": "Lettre de la colonne « Stock logiciel »",
      "rep": "H."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et ouvrir le fichier",
      "genre": "fait",
      "texte": "Lettre de la colonne « Stock trouvé »",
      "rep": "I."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et ouvrir le fichier",
      "genre": "fait",
      "texte": "Lettre de la première colonne vide, à droite du tableau",
      "rep": "K."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et ouvrir le fichier",
      "genre": "reflexion",
      "texte": "Choisis une ligne où le stock trouvé n'est pas égal au stock logiciel. Qu'a-t-il pu se passer dans le rayon ?",
      "pistes": [
        "Trouvé < logiciel : article cassé, perdu ou volé sans être saisi ; une erreur de préparation passée ; une réception saisie en trop.",
        "Trouvé > logiciel (câbles CAB-USBC-1M) : un retour ou une réception rangés sans être saisis, un article d'un autre emplacement.",
        "Accepter toute cause plausible reliée à la ligne choisie."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Calculer l'écart",
      "genre": "fait",
      "texte": "Formule que tu as écrite en ligne 2",
      "rep": "=I2-H2",
      "note": "Ou toute formule équivalente (=I2-H2 recopiée). Un nombre tapé est refusé au dépôt."
    },
    {
      "etape": 4,
      "etapeTitre": "Calculer l'écart",
      "genre": "fait",
      "texte": "Combien de lignes ont un écart différent de 0 ?",
      "rep": "8.",
      "note": "BP-732101 CAB +3 ; BP-732118 CHG −3 ; BP-732126 COQ −2 ; BP-732167 CHG −3 ; BP-732181 CAB +3 et COQ −2 ; BP-732195 BAT −2 ; BP-732210 CHG −3. Confirmé : 8 aussi (les références A-05 / A-06 n'ont aucun écart)."
    },
    {
      "etape": 4,
      "etapeTitre": "Calculer l'écart",
      "genre": "reflexion",
      "texte": "Pourquoi écrire une formule, plutôt que calculer de tête et taper le résultat ?",
      "pistes": [
        "Moins d'erreurs de calcul ; on recopie une fois pour toutes les lignes.",
        "Si une valeur change, le résultat se met à jour tout seul.",
        "On peut vérifier le calcul (la formule se lit) ; le contrôle du dépôt refuse d'ailleurs un nombre tapé."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Isoler les références en écart (SI)",
      "genre": "fait",
      "texte": "Formule que tu as écrite en ligne 2",
      "rep": "=SI(K2<>0;D2;\"\")",
      "note": "Équivalents acceptés : =SI(K2=0;\"\";D2). Le contrôle exige la fonction SI (IF) et la référence recopiée sur les seules lignes en écart."
    },
    {
      "etape": 5,
      "etapeTitre": "Isoler les références en écart (SI)",
      "genre": "reflexion",
      "texte": "Quelle partie de la formule SI t'a demandé le plus d'essais ?",
      "pistes": [
        "Réponse personnelle : le test (<> 0), les guillemets vides, les points-virgules, l'adresse D2 au lieu d'un texte.",
        "Valoriser l'élève qui explique comment il s'est corrigé."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Compter les constats (NB.SI)",
      "genre": "tableau",
      "texte": "Référence | Nb constats | Référence | Nb constats",
      "entetes": [
        "Référence",
        "Nb constats",
        "Référence",
        "Nb constats"
      ],
      "contexte": "Une même référence peut avoir plusieurs constats. Dans la feuille « Synthèse », tu vas compter, pour chaque référence, combien de fois elle apparaît dans ta colonne « Réf. en écart ».",
      "reponses": [
        [
          "CAB-USBC-1M",
          "2",
          "BAT-10K",
          "1"
        ],
        [
          "CHG-20W",
          "3",
          "CLE-64G",
          "0"
        ],
        [
          "ECO-BT-01",
          "0",
          "AMP-LED-E27",
          "0"
        ],
        [
          "SOU-SF-02",
          "0",
          "COQ-UNI-01",
          "2"
        ]
      ],
      "note": "Confirmé : quatre lignes de plus (CAS-FIL-01, SUP-VOIT, CLA-SF-01, HUB-USB-4), toutes à 0."
    },
    {
      "etape": 6,
      "etapeTitre": "Compter les constats (NB.SI)",
      "genre": "fait",
      "texte": "Formule que tu as écrite en B2",
      "rep": "=NB.SI(Préparations!L:L;A2)",
      "note": "Sous LibreOffice, la même formule s'affiche =NB.SI($Préparations.L:L;A2). Accepter une plage limitée (L2:L31) si elle couvre toutes les lignes."
    },
    {
      "etape": 6,
      "etapeTitre": "Compter les constats (NB.SI)",
      "genre": "reflexion",
      "texte": "Une référence a plusieurs constats, une autre un seul. Laquelle te paraît la plus urgente à recompter ? Explique.",
      "pistes": [
        "Plusieurs constats (CHG-20W, 3) : le défaut se répète, le stock est sûrement faux.",
        "Un seul constat (BAT-10K) peut être un écart réel aussi : le nombre d'articles manquants compte autant (2 batteries).",
        "Accepter tout choix argumenté ; à la séance suivante, toutes seront recomptées."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Déposer ton fichier",
      "genre": "tableau",
      "texte": "Dépôt | Résultats justes | Ce qui clochait (en quelques mots)",
      "entetes": [
        "Dépôt",
        "Résultats justes",
        "Ce qui clochait (en quelques mots)"
      ],
      "contexte": "Une même référence peut avoir plusieurs constats. Dans la feuille « Synthèse », tu vas compter, pour chaque référence, combien de fois elle apparaît dans ta colonne « Réf. en écart ».",
      "reponses": [
        [
          "1er",
          "Variable (68 sur 68 si tout est juste)",
          "Variable"
        ]
      ],
      "note": "Total des contrôles : 30 écarts + 30 « Réf. en écart » + 8 lignes de synthèse = 68 (confirmé : 45 + 45 + 12 = 102). Messages fréquents : « la cellule contient un nombre tapé, pas une formule » ; fonction SI ou NB.SI absente."
    },
    {
      "etape": 7,
      "etapeTitre": "Déposer ton fichier",
      "genre": "reflexion",
      "texte": "Si ton premier dépôt n'était pas tout juste, qu'as-tu corrigé ?",
      "pistes": [
        "Réponse personnelle : remplacer des nombres tapés par une formule, recopier la formule jusqu'en bas, corriger le test du SI, la plage du NB.SI.",
        "Valoriser l'élève qui cite le message « Ce qui cloche » et le geste qui l'a corrigé."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Choisir et écrire à Nadia",
      "genre": "tableau",
      "texte": "Référence | Nombre de constats",
      "entetes": [
        "Référence",
        "Nombre de constats"
      ],
      "contexte": "Ma liste de références à recompter (garde-la pour ENT-2.3) :",
      "reponses": [
        [
          "CHG-20W",
          "3"
        ],
        [
          "CAB-USBC-1M",
          "2"
        ],
        [
          "COQ-UNI-01",
          "2"
        ],
        [
          "BAT-10K",
          "1"
        ]
      ],
      "note": "La bonne liste est la même en confirmé. Le jalon 5 juge la liste contre la synthèse DÉPOSÉE par l'élève (une erreur de synthèse ne se paie qu'une fois)."
    },
    {
      "etape": 8,
      "etapeTitre": "Choisir et écrire à Nadia",
      "genre": "reflexion",
      "texte": "Nadia aurait pu faire recompter toute l'allée. Pourquoi ta liste est-elle un meilleur choix ?",
      "pistes": [
        "Quatre références au lieu de huit (ou douze) : deux à trois fois moins de travail, au moment où l'entrepôt est chargé.",
        "La liste est justifiée par des chiffres, pas au hasard.",
        "Limite à accepter : une référence sans constat peut aussi être fausse (personne ne l'a préparée) — d'où l'inventaire complet de temps en temps."
      ]
    }
  ]
};
