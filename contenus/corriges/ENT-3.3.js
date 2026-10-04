// Généré par outils/trame-boost-ent33.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-3.3",
  "titre": "Boost — la tournée à corriger",
  "trame": "ENT-3.3-boost-a-corriger-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Lire le message d'Inès",
      "genre": "fait",
      "texte": "Quelle commande Inès a-t-elle laissée à quai ?",
      "rep": "La Mercerie Pellet (12 kg)."
    },
    {
      "etape": 1,
      "etapeTitre": "Lire le message d'Inès",
      "genre": "fait",
      "texte": "Pourquoi l'a-t-elle choisie ?",
      "rep": "C'est la plus petite commande : elle partira demain « sans gêner personne »."
    },
    {
      "etape": 1,
      "etapeTitre": "Lire le message d'Inès",
      "genre": "fait",
      "texte": "Comment a-t-elle choisi l'ordre des arrêts ?",
      "rep": "Elle a pris l'ordre le plus court sur la carte (« moins de kilomètres, donc forcément de la marge partout »)."
    },
    {
      "etape": 1,
      "etapeTitre": "Lire le message d'Inès",
      "genre": "fait",
      "texte": "Combien de kilos charge-t-elle, d'après sa feuille ?",
      "rep": "166 kg.",
      "note": "Ce chiffre est faux : sa formule oublie la dernière ligne de la tournée (la Cave Teissier, 52 kg)."
    },
    {
      "etape": 1,
      "etapeTitre": "Lire le message d'Inès",
      "genre": "fait",
      "texte": "Que peux-tu modifier dans l'outil pour l'instant ?",
      "rep": "Rien : la tournée et la feuille sont verrouillées jusqu'à ma réponse."
    },
    {
      "etape": 1,
      "etapeTitre": "Lire le message d'Inès",
      "genre": "reflexion",
      "texte": "Avant de contrôler, le raisonnement d'Inès te paraît-il juste ? Explique ce que tu en penses.",
      "pistes": [
        "Réponse de prévision, toutes recevables. Beaucoup d'élèves le trouvent juste : c'est le piège.",
        "Un élève attentif se souvient d'ENT-3.2 : il fallait retirer au moins 40 kg, et le plus court ratait le créneau.",
        "On y revient à l'étape 5."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Contrôler sa tournée",
      "genre": "tableau",
      "texte": "Arrêt n° | Commande chargée | Poids (kg)",
      "entetes": [
        "Arrêt n°",
        "Commande chargée",
        "Poids (kg)"
      ],
      "contexte": "Dans le menu de gauche, clique sur « Tournée de l'après-midi ». La tournée d'Inès est sur la carte. Elle est figée : tu la lis, tu ne la modifies pas. Les jauges ne disent pas si les contraintes tiennent.",
      "reponses": [
        [
          "1",
          "Herboristerie Mazel",
          "16"
        ],
        [
          "2",
          "Atelier Ribot",
          "34"
        ],
        [
          "3",
          "Épicerie Roussel",
          "38"
        ],
        [
          "4",
          "Torréfaction Guiraud",
          "18"
        ],
        [
          "5",
          "Papeterie Bonnet",
          "29"
        ],
        [
          "6",
          "Pâtisserie Arnaud",
          "31"
        ],
        [
          "7",
          "Cave Teissier",
          "52"
        ],
        [
          "",
          "Poids chargé (total)",
          "218"
        ]
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Contrôler sa tournée",
      "genre": "fait",
      "texte": "Charge maximale du vélo-cargo (kg)",
      "rep": "190 kg."
    },
    {
      "etape": 2,
      "etapeTitre": "Contrôler sa tournée",
      "genre": "fait",
      "texte": "Le poids chargé que tu as calculé est-il sous cette charge ?",
      "rep": "Non : 218 kg, soit 28 kg de trop."
    },
    {
      "etape": 2,
      "etapeTitre": "Contrôler sa tournée",
      "genre": "reflexion",
      "texte": "Comment as-tu vérifié le poids chargé sans te fier à ce qu'Inès annonce ?",
      "pistes": [
        "En additionnant moi-même les poids lus dans le message, commande par commande.",
        "En comptant les arrêts sur la carte (7), pas les lignes de la feuille.",
        "Valoriser l'élève qui remarque l'écart avec les 166 kg annoncés."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Contrôler sa feuille de calcul",
      "genre": "tableau",
      "texte": "Ce que la cellule calcule | Formule d'Inès | Juste ou fausse ?",
      "entetes": [
        "Ce que la cellule calcule",
        "Formule d'Inès",
        "Juste ou fausse ?"
      ],
      "contexte": "Sous la carte, la feuille de calcul d'Inès. Elle est figée aussi. Clique une cellule : ce qu'elle contient (une formule ou une valeur tapée) s'affiche dans la barre au-dessus du tableau.",
      "reponses": [
        [
          "Poids chargé (kg)",
          "=SOMME(B2:B7)",
          "fausse : il manque B8 (la Cave Teissier) → =SOMME(B2:B8)"
        ],
        [
          "Temps de route (min)",
          "=E9/E3*60",
          "juste"
        ],
        [
          "Temps aux arrêts (min)",
          "=7*E4",
          "juste (7 arrêts)"
        ],
        [
          "Arrivée à la gare",
          "=E2+E10+E11",
          "juste"
        ],
        [
          "Arrivée chez le client à créneau",
          "=E2+E13/E3*60+E14*E4",
          "juste"
        ]
      ],
      "note": "Une seule formule fausse. Le bouton « Vérifier » n'existe pas dans cette séance : l'erreur se trouve par le calcul de l'étape 2."
    },
    {
      "etape": 3,
      "etapeTitre": "Contrôler sa feuille de calcul",
      "genre": "fait",
      "texte": "Heure d'arrivée à la gare",
      "rep": "15 h 59."
    },
    {
      "etape": 3,
      "etapeTitre": "Contrôler sa feuille de calcul",
      "genre": "fait",
      "texte": "Est-elle avant le train ?",
      "rep": "Oui (train à 16 h 15) : le train est tenu.",
      "note": "C'est le leurre : l'élève ne doit pas accuser toutes les contraintes."
    },
    {
      "etape": 3,
      "etapeTitre": "Contrôler sa feuille de calcul",
      "genre": "fait",
      "texte": "Heure d'arrivée chez le client à créneau",
      "rep": "15 h 40 (Pâtisserie Arnaud)."
    },
    {
      "etape": 3,
      "etapeTitre": "Contrôler sa feuille de calcul",
      "genre": "fait",
      "texte": "Est-elle avant la limite du créneau ?",
      "rep": "Non : le créneau finit à 15 h 05. Il est raté de 35 minutes."
    },
    {
      "etape": 3,
      "etapeTitre": "Contrôler sa feuille de calcul",
      "genre": "reflexion",
      "texte": "Comment as-tu repéré une formule qui ne calcule pas ce qu'elle annonce ?",
      "pistes": [
        "Mon poids calculé à la main (218 kg) ne donnait pas les 166 kg de la feuille.",
        "En lisant la plage de SOMME : elle s'arrête à B7, la tournée va jusqu'à B8.",
        "Valoriser l'élève qui a comparé la formule à son titre."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à Inès",
      "genre": "brouillon",
      "texte": "Brouillon de ta réponse à Inès :",
      "modele": "Charge utile : dépassée\nPoids chargé : 218 kg\nTrain de 16 h 15 : attrapé\nArrivée à la gare : 15 h 59\nCréneau de la Pâtisserie Arnaud : raté\nArrivée à la Pâtisserie Arnaud : 15 h 40",
      "note": "Jalons : « contraintes » (les trois verdicts, leurre compris) et « preuves » (poids exact, heures à une minute près). Le meilleur des messages envoyés compte."
    },
    {
      "etape": 4,
      "etapeTitre": "Répondre à Inès",
      "genre": "reflexion",
      "texte": "Pour la contrainte où tu as le plus hésité, qu'est-ce qui t'a décidé ?",
      "pistes": [
        "Souvent le train : il est tenu, alors que tout le reste va mal.",
        "Ou la charge, parce que la feuille d'Inès disait 166 kg.",
        "Valoriser l'élève qui s'appuie sur son propre calcul plutôt que sur la feuille d'Inès."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Corriger la tournée et la feuille",
      "genre": "tableau",
      "texte": "Essai | À quai | Poids chargé | Arrivée créneau | Arrivée gare | Distance",
      "entetes": [
        "Essai",
        "À quai",
        "Poids chargé",
        "Arrivée créneau",
        "Arrivée gare",
        "Distance"
      ],
      "contexte": "Retourne dans « Tournée de l'après-midi ». Tout est débloqué : tu peux changer la tournée et la feuille. Corrige tout ce que tu as trouvé à l'étape 3 et à l'étape 4.",
      "reponses": [
        [
          "meilleure",
          "Cave Teissier",
          "178 kg",
          "14 h 55",
          "16 h 04",
          "12,54 km"
        ]
      ],
      "note": "Ordre de la meilleure tournée : Pâtisserie Arnaud > Papeterie Bonnet > Épicerie Roussel > Atelier Ribot > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet (celle d'ENT-3.2). Jalons de réparation : formule corrigée, Cave à quai et charge tenue, train, créneau, tournée à moins de 10 % (13,79 km au plus). Ils se lisent en continu, même sans « J'ai terminé »."
    },
    {
      "etape": 5,
      "etapeTitre": "Corriger la tournée et la feuille",
      "genre": "reflexion",
      "texte": "Inès avait laissé à quai la plus petite commande. Comment tes calculs t'ont-ils montré que ce choix ne suffisait pas ?",
      "pistes": [
        "Il fallait retirer au moins 40 kg (230 − 190) : 12 kg ne suffisent pas.",
        "Seule la Cave Teissier (52 kg) ramène la charge sous 190 kg à elle seule.",
        "Valoriser l'élève qui cite ses chiffres."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Terminer",
      "genre": "fait",
      "texte": "Commande laissée à quai dans ta correction",
      "rep": "La Cave Teissier."
    },
    {
      "etape": 6,
      "etapeTitre": "Terminer",
      "genre": "fait",
      "texte": "Distance de ta tournée corrigée (km)",
      "rep": "Variable : 12,54 km pour la meilleure tournée, 13,79 km au plus pour le jalon."
    },
    {
      "etape": 6,
      "etapeTitre": "Terminer",
      "genre": "fait",
      "texte": "Heure d'arrivée à la gare",
      "rep": "Variable : 16 h 04 pour la meilleure tournée ; avant 16 h 15 dans tous les cas."
    },
    {
      "etape": 6,
      "etapeTitre": "Terminer",
      "genre": "reflexion",
      "texte": "Si tu donnais un conseil à Inès pour sa prochaine tournée, lequel serait le plus utile ?",
      "pistes": [
        "Calculer ce qu'il faut retirer avant de choisir la commande à laisser à quai.",
        "Vérifier les contraintes (le créneau) avant de chercher le plus court.",
        "Relire la plage de ses formules SOMME.",
        "Toute réponse qui part d'une erreur réelle d'Inès."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "On ne se fie pas au résultat d'une feuille : on ………………… ses formules.",
      "rep": "vérifie."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Pour chaque contrainte, on dit si elle est tenue et on donne le ………………… qui le prouve.",
      "rep": "chiffre."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Une contrainte tenue se dit aussi : on n'accuse pas tout par ………………….",
      "rep": "principe."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Corriger, c'est refaire le calcul ………………… chaque changement.",
      "rep": "après."
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
      "contexte": "Quand ta correction est finie, clique sur « J'ai terminé » en bas de la page, puis clique à nouveau pour confirmer. C'est définitif : ta correction est enregistrée telle quelle.",
      "reponses": [
        [
          "Relecture",
          "autre"
        ],
        [
          "Diagnostic",
          "prouvant"
        ],
        [
          "Surcharge",
          "supérieur"
        ],
        [
          "Barre de formule",
          "contient"
        ],
        [
          "Formule",
          "="
        ],
        [
          "Contrainte",
          "dépasser"
        ],
        [
          "Charge utile",
          "maximal"
        ],
        [
          "Créneau de livraison",
          "limite"
        ]
      ],
      "note": "Un mot de la banque par trou."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Poids chargé, calculé par toi (kg)",
      "rep": "210 kg (40 + 55 + 30 + 25 + 60)."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Formule corrigée en B7",
      "rep": "=SOMME(B2:B6)"
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "La charge est-elle respectée ?",
      "rep": "Non : 210 kg pour 200 kg (10 kg de trop)."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Formule corrigée en E5",
      "rep": "=E3/E4*60"
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Temps de route juste (min)",
      "rep": "48 min (12 ÷ 15 = 0,8 h, × 60)."
    },
    {
      "etape": 8,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Karim dit : « la feuille l'a calculé, donc c'est juste ». Que lui réponds-tu ?",
      "pistes": [
        "La feuille calcule ce qu'on lui écrit : une formule fausse donne un résultat faux, sans prévenir.",
        "On vérifie une formule en refaisant le calcul à la main sur un cas."
      ]
    }
  ]
};
