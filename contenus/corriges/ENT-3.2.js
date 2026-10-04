// Généré par outils/trame-boost-ent32.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-3.2",
  "titre": "Boost — la tournée sous contrainte",
  "trame": "ENT-3.2-boost-sous-contrainte-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Ouvrir son environnement et lire le message",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Tu connais déjà Boost et son vélo-cargo (séance ENT-3.1). Aujourd'hui, une autre journée, avec une contrainte de plus. Connecte-toi à Prepalog, ouvre la rubrique Simulog, puis l'activité « Boost — la tournée sous contrainte » (ENT-3.2).",
      "reponses": [
        [
          "Heure de départ de l'entrepôt",
          "14 h 35"
        ],
        [
          "Heure de départ du train pour Paris",
          "16 h 15"
        ],
        [
          "Charge maximale du vélo-cargo (kg)",
          "190"
        ],
        [
          "Vitesse du vélo-cargo en ville (km/h)",
          "14"
        ],
        [
          "Temps passé à chaque arrêt (min)",
          "5"
        ],
        [
          "Nombre de commandes",
          "8"
        ],
        [
          "Client qui a un créneau de livraison",
          "Pâtisserie Arnaud"
        ],
        [
          "Heure limite de ce créneau",
          "15 h 05"
        ]
      ],
      "note": "Valeurs de la journée d'ENT-3.2 (chantier D, lot 2). Le message dit aussi : un colis qui arrive après le train est livré un jour plus tard."
    },
    {
      "etape": 1,
      "etapeTitre": "Ouvrir son environnement et lire le message",
      "genre": "reflexion",
      "texte": "M. Morin écrit que plusieurs ordres tiennent les contraintes, mais qu'ils ne se valent pas. Avant de commencer, comment comptes-tu choisir entre eux ?",
      "pistes": [
        "Prendre le plus court : moins de kilomètres, moins de temps (c'est ce que dit M. Morin).",
        "D'abord tenir les contraintes (train, créneau), puis seulement chercher le plus court.",
        "Question de prévision : on y revient à l'étape 6 (le plus court ne tient pas forcément le créneau)."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Situer les nouveaux clients",
      "genre": "tableau",
      "texte": "Nouveau client | Rue (dans le message) | Quartier | Case",
      "entetes": [
        "Nouveau client",
        "Rue (dans le message)",
        "Quartier",
        "Case"
      ],
      "contexte": "Dans le menu de gauche, clique sur « Plan de Nîmes ». Les clients habituels sont déjà sur la carte. Les nouveaux clients ne donnent que leur adresse : à toi de les poser sur la bonne rue.",
      "reponses": [
        [
          "Torréfaction Guiraud",
          "rue de l'Horloge",
          "Écusson",
          "D2"
        ],
        [
          "Mercerie Pellet",
          "rue Régale",
          "Écusson",
          "D3"
        ],
        [
          "Atelier Ribot",
          "rue Canteduc",
          "Jardins de la Fontaine",
          "C2"
        ],
        [
          "Herboristerie Mazel",
          "corniche de l'Ermitage",
          "Jardins de la Fontaine",
          "B2"
        ]
      ],
      "note": "Pièges de l'index : « Place de l'Horloge » à côté de la rue ; trois « Ermitage » (allée, corniche, impasse). Le suivi note seulement que le client est situé ; le nombre de clics sur une autre rue s'affiche à l'écran."
    },
    {
      "etape": 2,
      "etapeTitre": "Situer les nouveaux clients",
      "genre": "reflexion",
      "texte": "Pour le client que tu as eu le plus de mal à situer, qu'est-ce qui t'a trompé ?",
      "pistes": [
        "Souvent l'Herboristerie Mazel (trois rues « de l'Ermitage ») ou la Torréfaction (rue et place de l'Horloge).",
        "Valoriser l'élève qui dit avoir comparé le nom en entier, ou ouvert le mauvais quartier d'abord."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Décider ce qui part",
      "genre": "fait",
      "texte": "Poids total des commandes (kg)",
      "rep": "230 kg.",
      "note": "18 + 12 + 34 + 16 + 52 + 31 + 29 + 38. Formule : =SOMME(B2:B9)."
    },
    {
      "etape": 3,
      "etapeTitre": "Décider ce qui part",
      "genre": "fait",
      "texte": "Poids à laisser à quai, au moins (kg)",
      "rep": "40 kg.",
      "note": "230 − 190. Formule : poids total − charge utile (=B10-F5)."
    },
    {
      "etape": 3,
      "etapeTitre": "Décider ce qui part",
      "genre": "fait",
      "texte": "Commande que tu laisses à quai",
      "rep": "Cave Teissier.",
      "note": "C'est la seule commande qui pèse à elle seule au moins 40 kg. Le jalon « choix » exige le calcul juste ET la Cave à quai, seule."
    },
    {
      "etape": 3,
      "etapeTitre": "Décider ce qui part",
      "genre": "fait",
      "texte": "Poids de cette commande (kg)",
      "rep": "52 kg."
    },
    {
      "etape": 3,
      "etapeTitre": "Décider ce qui part",
      "genre": "reflexion",
      "texte": "Pourquoi as-tu laissé CETTE commande à quai plutôt qu'une autre ?",
      "pistes": [
        "Il faut retirer au moins 40 kg : seule la Cave Teissier (52 kg) y suffit à elle seule.",
        "Laisser deux petites commandes ferait deux clients mécontents au lieu d'un.",
        "Valoriser l'élève qui part de son calcul (40 kg) plutôt que d'un essai à la jauge."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Construire la tournée",
      "genre": "tableau",
      "texte": "Essai | Ordre des arrêts (numéros ou noms) | Train tenu ? | Créneau tenu ?",
      "entetes": [
        "Essai",
        "Ordre des arrêts (numéros ou noms)",
        "Train tenu ?",
        "Créneau tenu ?"
      ],
      "contexte": "Clique sur l'onglet « Tournée ». Clique l'entrepôt, puis tes clients dans l'ordre de passage, puis la gare. La commande que tu laisses à quai ne se clique pas.",
      "reponses": [
        [
          "exemple",
          "Pâtisserie Arnaud > Papeterie Bonnet > Épicerie Roussel > Atelier Ribot > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet",
          "oui (16 h 04)",
          "oui (14 h 55)"
        ]
      ],
      "note": "Réponse personnelle : les essais de l'élève. 264 ordres tiennent le train et le créneau. Un ordre qui passe à la Pâtisserie en dernier rate le créneau (15 h 05)."
    },
    {
      "etape": 4,
      "etapeTitre": "Construire la tournée",
      "genre": "reflexion",
      "texte": "Qu'est-ce qui t'a fait changer d'ordre entre ton premier essai et le dernier ?",
      "pistes": [
        "Le créneau raté : il faut passer tôt à la Pâtisserie Arnaud.",
        "Le train manqué : un ordre qui fait des allers-retours entre les quartiers.",
        "Valoriser l'élève qui cite la jauge qu'il a vue passer au rouge."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les heures",
      "genre": "tableau",
      "texte": "Ce que tu calcules | Ma formule | Résultat affiché",
      "entetes": [
        "Ce que tu calcules",
        "Ma formule",
        "Résultat affiché"
      ],
      "contexte": "Clique sur l'onglet « Heures ». En bas de la feuille, « Après la tournée » : ce qui part, et les heures. La colonne « Arrêt n° » suit ta tournée : la commande sans numéro est restée à quai.",
      "reponses": [
        [
          "Poids chargé (kg)",
          "=B10-B13",
          "178"
        ],
        [
          "Temps de route (min)",
          "=F13/F3*60",
          "53,7 (pour 12,54 km)"
        ],
        [
          "Temps aux arrêts (min)",
          "=7*F4 (7 arrêts)",
          "35"
        ],
        [
          "Heure d'arrivée à la gare",
          "=F2+F14+F15",
          "16 h 04 (pour 12,54 km)"
        ],
        [
          "Heure d'arrivée chez le client à créneau",
          "=F2+F17/F3*60+F18*F4",
          "14 h 55 si la Pâtisserie est le 1er arrêt"
        ]
      ],
      "note": "Les résultats dépendent de la tournée de l'élève ; ceux-ci sont ceux de la meilleure tournée. Poids laissé à quai (B13) : la cellule du poids de la Cave (=B6). Les formules se jugent sur ce que l'élève a tapé (une erreur de lecture ne se paie qu'une fois)."
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les heures",
      "genre": "fait",
      "texte": "Ton poids chargé est-il sous la charge maximale ?",
      "rep": "Oui : 178 kg pour 190 kg."
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les heures",
      "genre": "fait",
      "texte": "Ton heure d'arrivée à la gare est-elle avant le train ?",
      "rep": "Oui si la tournée tient (16 h 04 pour la meilleure, train à 16 h 15).",
      "note": "Variable selon la tournée."
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les heures",
      "genre": "fait",
      "texte": "Ton heure d'arrivée chez le client à créneau est-elle avant sa limite ?",
      "rep": "Oui si la tournée tient (avant 15 h 05).",
      "note": "Variable selon la tournée."
    },
    {
      "etape": 5,
      "etapeTitre": "Calculer les heures",
      "genre": "reflexion",
      "texte": "Pour la formule qui t'a demandé le plus d'essais, qu'as-tu corrigé ?",
      "pistes": [
        "Souvent l'heure chez le client à créneau (distance ÷ vitesse × 60 + arrêts servis avant × temps par arrêt).",
        "Ou le temps de route, oublié en heures sans le × 60.",
        "Valoriser l'élève qui dit ce qu'il a lu dans « ? Aide » ou dans le rouge."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Chercher le trajet le plus court",
      "genre": "tableau",
      "texte": "Essai | Ordre des arrêts | Distance (km) | Tout tient ?",
      "entetes": [
        "Essai",
        "Ordre des arrêts",
        "Distance (km)",
        "Tout tient ?"
      ],
      "contexte": "Ta tournée tient les contraintes. Mais moins le vélo-cargo roule, mieux c'est. Cherche s'il existe un ordre plus court qui tient toujours tout.",
      "reponses": [
        [
          "meilleure",
          "Pâtisserie Arnaud > Papeterie Bonnet > Épicerie Roussel > Atelier Ribot > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet",
          "12,54",
          "oui"
        ]
      ],
      "note": "Jalons : moins de 10 % de plus que 12,54 km (13,79 km au plus), puis moins de 5 % (13,17 km au plus). Le plus court sans créneau (11,00 km, Pâtisserie en dernier) rate le créneau. Le message de 14 h 00 arrive quand la tournée tient tout ET que la feuille est vérifiée juste."
    },
    {
      "etape": 6,
      "etapeTitre": "Chercher le trajet le plus court",
      "genre": "reflexion",
      "texte": "Quel principe t'a aidé à raccourcir ta tournée ?",
      "pistes": [
        "Servir les clients d'un même quartier à la suite, sans revenir en arrière.",
        "Passer d'abord par le client à créneau, puis faire une boucle qui finit près de la gare.",
        "Valoriser l'élève qui s'appuie sur la distance lue dans sa feuille."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Quelle commande est annulée ?",
      "rep": "Celle de l'Atelier Ribot (34 kg)."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Quel client a maintenant un créneau ?",
      "rep": "L'Épicerie Roussel."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Jusqu'à quelle heure ?",
      "rep": "Avant 14 h 55."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Quel client n'a plus de créneau ?",
      "rep": "La Pâtisserie Arnaud."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Qu'est-ce qui ne change pas ? (cite une contrainte)",
      "rep": "Le train de 16 h 15, la charge de 190 kg, le départ à 14 h 35 ; la Cave Teissier reste à quai.",
      "note": "Une seule contrainte citée suffit."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Poids chargé de ta nouvelle tournée (kg)",
      "rep": "144 kg.",
      "note": "230 − 34 (annulée) − 52 (Cave à quai). La ligne de la commande annulée garde sa place dans la feuille, à 0 kg."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Heure d'arrivée chez le client à créneau",
      "rep": "Avant 14 h 55 (14 h 55 pour la meilleure tournée : l'Épicerie Roussel en premier).",
      "note": "Variable selon la tournée."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Heure d'arrivée à la gare",
      "rep": "Avant 16 h 15 (15 h 58 pour la meilleure tournée).",
      "note": "Variable selon la tournée."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "fait",
      "texte": "Distance de ta nouvelle tournée (km)",
      "rep": "12,38 km pour la meilleure : Épicerie Roussel > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet > Papeterie Bonnet > Pâtisserie Arnaud.",
      "note": "Jalons de phase 2 : la tournée replanifiée tient tout (et a changé depuis le message), puis moins de 10 % de plus que 12,38 km (13,62 km au plus). Aucune tournée de la phase 1 ne tient plus."
    },
    {
      "etape": 7,
      "etapeTitre": "Quand la journée change",
      "genre": "reflexion",
      "texte": "Qu'est-ce qui, dans le message, t'a obligé à changer l'ordre de ta tournée ?",
      "pistes": [
        "Le créneau de l'Épicerie Roussel (avant 14 h 55) : il faut la servir en premier.",
        "La Pâtisserie n'a plus de créneau : elle peut passer plus tard.",
        "L'annulation de l'Atelier Ribot retire un arrêt et libère du poids, mais ne suffit pas à elle seule."
      ]
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Le trajet le plus court n'est bon que s'il tient ………………… les contraintes.",
      "rep": "toutes."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "L'heure d'arrivée chez un client = départ + temps de route jusqu'à lui + les ………………… déjà faits.",
      "rep": "arrêts."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Quand la journée change, on vérifie par le ………………… si l'ancienne tournée tient encore.",
      "rep": "calcul."
    },
    {
      "etape": 8,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Entre deux tournées qui tiennent tout, on garde celle qui ………………… le moins.",
      "rep": "roule."
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
      "contexte": "Retourne dans « Tournée de l'après-midi ». Ta tournée était faite pour la journée d'avant.",
      "reponses": [
        [
          "Créneau de livraison",
          "limite"
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
          "Ordre de passage",
          "sert"
        ],
        [
          "Replanifier",
          "situation"
        ],
        [
          "Annulation",
          "retire"
        ],
        [
          "Temps de route",
          "vitesse"
        ],
        [
          "Laisser à quai",
          "jour"
        ]
      ],
      "note": "Un mot de la banque par trou."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Ordre 1 : heure d'arrivée à la boulangerie",
      "rep": "9 h 34 (6 ÷ 15 × 60 = 24 min de route + 2 arrêts × 5 min)."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Ordre 1 : créneau tenu ?",
      "rep": "Non (après 9 h 30)."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Ordre 2 : heure d'arrivée à la boulangerie",
      "rep": "9 h 18 (4,5 ÷ 15 × 60 = 18 min, aucun arrêt avant)."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Ordre 2 : créneau tenu ?",
      "rep": "Oui."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "fait",
      "texte": "Quel ordre choisis-tu ?",
      "rep": "L'ordre 2 : un peu plus long, mais il tient le créneau."
    },
    {
      "etape": 9,
      "etapeTitre": "À la maison",
      "genre": "reflexion",
      "texte": "Comment expliquerais-tu à un collègue que le trajet le plus court n'est pas toujours le meilleur ?",
      "pistes": [
        "Le plus court ne sert à rien s'il fait rater un client ou le train.",
        "On vérifie d'abord les contraintes, puis on cherche le plus court parmi les tournées qui les tiennent."
      ]
    }
  ]
};
