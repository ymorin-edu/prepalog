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
      "explication": "Exporter, c'est copier des données d'un logiciel (ici le WMS) dans un fichier qu'on ouvre ailleurs, par exemple un tableur. Les données restent dans le logiciel. Avant d'exporter, on choisit les lignes à sortir avec des critères (une zone, une période…) : le fichier contient ce qu'on voit à l'écran.",
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
          "Dans quel menu fais-tu l'export ?",
          "Extractions (partie Outils du menu de gauche)"
        ],
        [
          "Quelle liste exportes-tu ?",
          "« Lignes de préparation »"
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
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "fait",
      "texte": "Avec « Allée » sur « Toutes », le nombre de lignes augmente-t-il ou diminue-t-il ?",
      "rep": "Il augmente."
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "question",
      "texte": "Explique pourquoi, avec ce que tu vois dans le tableau.",
      "rep": "S'ajoutent les lignes de préparation des allées B et C du mois, que Nadia ne demande pas.",
      "note": "12 lignes de plus (allées B et C, préparées dans les 20 derniers jours). Avec « Tout l'historique », 8 lignes de plus (allée A, il y a 32 à 45 jours). Valoriser l'élève qui explique par la colonne « Emplacement » ou « Date »."
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "fait",
      "texte": "Nombre de lignes affiché dans Extractions, avec les critères de Nadia",
      "rep": "Lu à l'écran par l'élève : 30 avec les critères réglés (confirmé : 45).",
      "note": "La trame ne donne jamais ce nombre : il dépend du niveau (confirmé = toute l'allée A, A-01 à A-06). Le corrigé par élève (onglet Corrigés) donne son bon export. Les 30 lignes couvrent le mois, dont 12 d'avant le dernier inventaire, toutes sans écart."
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "fait",
      "texte": "Ton fichier a-t-il le même nombre de lignes que l'écran Extractions ? (oui / non)",
      "rep": "Oui : le fichier contient exactement ce que montrait l'écran (sans la ligne des titres).",
      "note": "Si « non » : l'élève compte souvent la ligne des titres, ou a changé un critère entre la lecture et l'export."
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "fait",
      "texte": "Lettre de la colonne « Stock logiciel »",
      "rep": "H."
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "fait",
      "texte": "Lettre de la colonne « Stock trouvé »",
      "rep": "I."
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "fait",
      "texte": "Lettre de la première colonne vide, à droite du tableau",
      "rep": "K."
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "reflexion",
      "texte": "Choisis une ligne où le stock trouvé n'est pas égal au stock logiciel. Qu'a-t-il pu se passer dans le rayon ?",
      "pistes": [
        "Trouvé < logiciel : article cassé, perdu ou volé sans être saisi ; une erreur de préparation passée ; une réception saisie en trop.",
        "Trouvé > logiciel (câbles CAB-USBC-1M) : un retour ou une réception rangés sans être saisis, un article d'un autre emplacement.",
        "Accepter toute cause plausible reliée à la ligne choisie."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Vérifier l'extraction, exporter, ouvrir",
      "genre": "reflexion",
      "texte": "Pourquoi choisir les lignes dans le logiciel, plutôt que tout exporter et faire le tri dans le tableur ?",
      "pistes": [
        "Le fichier est plus petit et ne contient que ce qu'on va analyser : moins de risques de compter une ligne d'une autre allée ou d'un autre mois.",
        "Dans un vrai WMS, l'export complet peut faire des milliers de lignes ; on extrait ce qu'on veut.",
        "Les critères disent clairement sur quoi porte l'analyse : quelqu'un d'autre peut refaire le même export."
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
      "note": "Total des contrôles, pour le bon export : 30 écarts + 30 « Réf. en écart » + 8 lignes de synthèse = 68 (confirmé : 45 + 45 + 12 = 102) ; il change si l'export de l'élève a d'autres lignes (les formules sont contrôlées sur SON fichier). L'export est jugé à part, au-dessus : « ✓ Export : vos critères donnent bien les lignes demandées. » ou « ✗ Export à refaire (Extractions) » avec le critère à changer (« « Allée » : choisissez « A ». »). Le jalon « export » reste en attente tant que rien n'est déposé. Messages fréquents : « la cellule contient un nombre tapé, pas une formule » ; fonction SI ou NB.SI absente."
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
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Avant d'exporter, on vérifie le ………………… de lignes affiché.",
      "rep": "nombre."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Écart = stock trouvé − stock du ………………….",
      "rep": "logiciel."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Le tableur sert à repérer vite les lignes en ………………… au milieu de centaines d'autres.",
      "rep": "écart."
    },
    {
      "etape": 9,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Un résultat de formule se ………………… sur quelques lignes calculées à la main.",
      "rep": "vérifie."
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
      "contexte": "Ma liste de références à recompter (garde-la pour ENT-2.3) :",
      "reponses": [
        [
          "Constat d'écart",
          "différent"
        ],
        [
          "Écart",
          "trouvé"
        ],
        [
          "Extraction",
          "choisies"
        ],
        [
          "Tableur",
          "formules"
        ],
        [
          "Cellule",
          "chiffre"
        ],
        [
          "Formule",
          "="
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
      "genre": "tableau",
      "texte": "Ligne | A · Référence | B · Logiciel | C · Trouvé | D · Écart | E · Repère",
      "entetes": [
        "Ligne",
        "A · Référence",
        "B · Logiciel",
        "C · Trouvé",
        "D · Écart",
        "E · Repère"
      ],
      "contexte": "Un extrait de constats d'écart, comme dans ton tableur. Colonne B : stock du logiciel ; colonne C : stock trouvé au rayon.",
      "reponses": [
        [
          "2",
          "CHG-USB",
          "14",
          "14",
          "0",
          ""
        ],
        [
          "3",
          "ECO-BT",
          "9",
          "7",
          "−2",
          "écart"
        ],
        [
          "4",
          "CAB-HDMI",
          "20",
          "20",
          "0",
          ""
        ],
        [
          "5",
          "SOU-SF",
          "6",
          "8",
          "2",
          "écart"
        ],
        [
          "6",
          "CLE-32",
          "11",
          "11",
          "0",
          ""
        ],
        [
          "7",
          "PIL-AA",
          "30",
          "27",
          "−3",
          "écart"
        ]
      ]
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Formule de l'écart, en D2",
      "rep": "=C2-B2"
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Formule en E2 : « écart » si D2 n'est pas 0, sinon rien",
      "rep": "=SI(D2<>0;\"écart\";\"\")"
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Formule qui compte les « écart » de E2 à E7",
      "rep": "=NB.SI(E2:E7;\"écart\")"
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Résultat de ce comptage",
      "rep": "3."
    },
    {
      "etape": 10,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Avec 600 lignes au lieu de 6, qu'est-ce que le tableur changerait pour toi ?",
      "pistes": [
        "On écrit la formule une fois et on la recopie : le tableur fait les 600 calculs.",
        "On ne peut plus repérer les écarts à l'œil : SI et NB.SI le font sans oubli."
      ]
    }
  ]
};
