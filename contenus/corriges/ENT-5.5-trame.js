// Généré par outils/trame-smoby-rangement.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-5.5",
  "titre": "Smoby — ranger et saisir l’entrée",
  "trame": "ENT-5.5-smoby-rangement-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Les messages de Bruno",
      "genre": "fait",
      "texte": "Combien de palettes faut-il ranger ?",
      "rep": "4 : celles reçues d'Arinthod en ENT-5.4."
    },
    {
      "etape": 1,
      "etapeTitre": "Les messages de Bruno",
      "genre": "fait",
      "texte": "Où va l’établi Black+Decker ? Pourquoi ?",
      "rep": "En zone litiges : un carton est écrasé, il attend la réponse de l'usine."
    },
    {
      "etape": 1,
      "etapeTitre": "Les messages de Bruno",
      "genre": "fait",
      "texte": "Dans quel menu saisit-on l’entrée en stock ?",
      "rep": "Le menu Réceptions."
    },
    {
      "etape": 1,
      "etapeTitre": "Les messages de Bruno",
      "genre": "fait",
      "texte": "Quelles quantités faut-il saisir : celles du BL ou les autres ?",
      "rep": "Les quantités RÉELLEMENT reçues, pas celles du BL."
    },
    {
      "etape": 1,
      "etapeTitre": "Les messages de Bruno",
      "genre": "fait",
      "texte": "Quand part la commande de Noël ?",
      "rep": "Demain matin, jeudi 10 décembre."
    },
    {
      "etape": 1,
      "etapeTitre": "Les messages de Bruno",
      "genre": "qcm",
      "texte": "Une palette « en litige »…",
      "choix": [
        "part tout de suite chez le client",
        "attend à part la réponse du fournisseur",
        "est jetée"
      ],
      "bonne": 1,
      "explication": "Une marchandise en litige est isolée (zone litiges) en attendant la réponse du fournisseur : elle n'entre pas en stock disponible.",
      "notion": "Réception et litiges"
    },
    {
      "etape": 1,
      "etapeTitre": "Les messages de Bruno",
      "genre": "reflexion",
      "texte": "La commande de Noël part demain matin. Pourquoi tout doit-il être rangé ET saisi ce soir ?",
      "pistes": [
        "Demain, on prépare la commande en allant chercher les cartons à leur adresse : une palette pas rangée est introuvable.",
        "Si l'entrée n'est pas saisie, le stock affiché est faux : on croit manquer de produits (ou en avoir trop).",
        "Le transporteur attend une réponse ce soir pour confirmer le départ à son client."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la fiche de chaque palette",
      "genre": "tableau",
      "texte": "Palette | Produit | Poids | Rotation | Contrainte | Côté | Travée(s) possible(s)",
      "entetes": [
        "Palette",
        "Produit",
        "Poids",
        "Rotation",
        "Contrainte",
        "Côté",
        "Travée(s) possible(s)"
      ],
      "contexte": "Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions de celle-ci.",
      "reponses": [
        [
          "P1",
          "Maison Neo Jura Lodge",
          "420 kg",
          "A",
          "lourd",
          "A1",
          "T01 (N1 ou N2)"
        ],
        [
          "P2",
          "Cuisine Tefal",
          "270 kg",
          "B",
          "fragile",
          "B2",
          "T02"
        ],
        [
          "P3",
          "Établi Black+Decker",
          "290 kg",
          "B",
          "lourd, en litige",
          "— (litiges)",
          "zone litiges (L1 ou L2)"
        ],
        [
          "P4",
          "Porteur Little Smoby",
          "180 kg",
          "C",
          "—",
          "B1",
          "T03 ou T04"
        ]
      ],
      "note": "Recopié de la fiche de chaque palette à l'écran. P3 : lourd et rotation B, mais en litige → zone litiges."
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la fiche de chaque palette",
      "genre": "qcm",
      "texte": "La cuisine Tefal est fragile. Tu ne la poses jamais…",
      "choix": [
        "au niveau N1",
        "au niveau N3",
        "dans l’allée B"
      ],
      "bonne": 1,
      "explication": "Un produit fragile ne va pas en hauteur (règle de la plateforme : jamais en N3).",
      "notion": "Règles de stockage"
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la fiche de chaque palette",
      "genre": "reflexion",
      "texte": "Pourquoi range-t-on les produits à rotation rapide (A) dans la travée T01, la plus proche des quais ?",
      "pistes": [
        "Ils sortent le plus souvent : les ranger près des quais fait gagner du chemin à chaque préparation.",
        "Moins de trajets, moins de temps, moins de risques dans les allées.",
        "En N1 ou N2, on les prend sans monter haut : plus rapide et plus sûr."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Ranger les 4 palettes",
      "genre": "tableau",
      "texte": "Palette | Adresse où tu l’as posée | Deux règles que respecte cet emplacement",
      "entetes": [
        "Palette",
        "Adresse où tu l’as posée",
        "Deux règles que respecte cet emplacement"
      ],
      "contexte": "Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions de celle-ci.",
      "reponses": [
        [
          "P1",
          "A1-T01-N1-E3",
          "Côté de sa gamme (A1), lourd dans l’allée A, rotation A en T01 N1, 1 250 kg ≤ 3 000 kg au sol."
        ],
        [
          "P2",
          "B2-T02-N1-E2 ou B2-T02-N1-E3",
          "Côté des cuisines (B2), fragile dans l’allée B et pas en N3, rotation B en T02, emplacement libre."
        ],
        [
          "P3",
          "L1 ou L2",
          "En litige : zone litiges, pas dans le rack."
        ],
        [
          "P4",
          "B1-T03-N3-E1 ou B1-T04-N1-E2 ou B1-T04-N3-E2",
          "Côté des véhicules (B1), rotation C en T03 ou T04, plaque respectée, emplacement en service."
        ]
      ],
      "note": "Bonnes adresses recalculées sur le stock de départ (identiques au corrigé de la séance). Pièges : P1 en A1-T01-N2-E3 (poids), P1 en B2-T01-N1-E3 (parcours), P2 en B2-T02-N3-E2 (fragile en N3), P4 en B1-T04-N2-E3 (hors service)."
    },
    {
      "etape": 3,
      "etapeTitre": "Ranger les 4 palettes",
      "genre": "tableau",
      "texte": "Niveau | Déjà posé | Palette à poser | Total | Plaque | Possible ? (oui / non)",
      "entetes": [
        "Niveau",
        "Déjà posé",
        "Palette à poser",
        "Total",
        "Plaque",
        "Possible ? (oui / non)"
      ],
      "contexte": "Calcule. Plaque du côté A1 : 1 200 kg aux niveaux N2 et N3. Plaque du côté B1 : 1 000 kg.",
      "reponses": [
        [
          "A1-T01-N2",
          "840 kg",
          "P1 : 420 kg",
          "1260 kg",
          "1200 kg",
          "non : trop lourd"
        ],
        [
          "B1-T03-N3",
          "330 kg",
          "P4 : 180 kg",
          "510 kg",
          "1000 kg",
          "oui"
        ]
      ],
      "note": "Lu dans le stock de départ de la plateforme : A1-T01-N2 = 430 + 410 kg ; B1-T03-N3 = 190 + 140 kg."
    },
    {
      "etape": 3,
      "etapeTitre": "Ranger les 4 palettes",
      "genre": "reflexion",
      "texte": "La maison Neo Jura Lodge (lourde) ne va pas dans l'allée B, même s'il y a de la place. Pourquoi ? Pense à la préparation de commande de demain.",
      "pistes": [
        "Le parcours de préparation commence par l'allée A : on prend d'abord les produits lourds.",
        "Le lourd fait la base de la palette préparée ; le fragile, pris en dernier (allée B), va dessus.",
        "Si le lourd était au bout du parcours, on le poserait sur les cuisines : elles seraient écrasées."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Saisir l’entrée en stock",
      "genre": "tableau",
      "texte": "Palette | Référence | Annoncé (BL) | Réellement reçu | Décision",
      "entetes": [
        "Palette",
        "Référence",
        "Annoncé (BL)",
        "Réellement reçu",
        "Décision"
      ],
      "contexte": "Calcule. Plaque du côté A1 : 1 200 kg aux niveaux N2 et N3. Plaque du côté B1 : 1 000 kg.",
      "reponses": [
        [
          "P1",
          "SMB-NJL",
          "8",
          "8",
          "Accepté"
        ],
        [
          "P2",
          "SMB-CTF",
          "45",
          "45",
          "Accepté"
        ],
        [
          "P3",
          "SMB-EBD",
          "36",
          "36",
          "En litige : n’entre pas en stock disponible"
        ],
        [
          "P4",
          "SMB-PLS",
          "36",
          "34",
          "Accepté sous réserve"
        ]
      ],
      "note": "Jalons 5 à 7. P4 : 34 (accepté, avec ou sans réserve : les deux sont justes à l'écran). P3 « En litige », vrai seulement si la réception est validée."
    },
    {
      "etape": 4,
      "etapeTitre": "Saisir l’entrée en stock",
      "genre": "fait",
      "texte": "Quel est le numéro de lot écrit sur le BL ?",
      "rep": "ARI-26-49",
      "note": "Non noté à l'écran."
    },
    {
      "etape": 4,
      "etapeTitre": "Saisir l’entrée en stock",
      "genre": "qcm",
      "texte": "P4 : le BL annonce 36 cartons, tu en as compté 34. Tu saisis…",
      "choix": [
        "36",
        "34",
        "0"
      ],
      "bonne": 1,
      "explication": "On saisit la quantité réellement reçue : le stock informatique doit égaler le stock physique.",
      "notion": "Entrée en stock"
    },
    {
      "etape": 4,
      "etapeTitre": "Saisir l’entrée en stock",
      "genre": "reflexion",
      "texte": "Si tu saisissais 36 porteurs au lieu de 34, que se passerait-il demain, à la préparation de commande ?",
      "pistes": [
        "Le stock affiché compterait 2 cartons qui n'existent pas.",
        "Le préparateur irait chercher des cartons absents : la commande partirait incomplète, ou en retard.",
        "À l'inventaire, il faudrait chercher l'écart."
      ]
    },
    {
      "etape": 5,
      "etapeTitre": "Vérifier l’écran Stock",
      "genre": "tableau",
      "texte": "Calcul | Ta réponse",
      "entetes": [
        "Calcul",
        "Ta réponse"
      ],
      "contexte": "Avant de lire l'écran, calcule ce que tu devrais y trouver.",
      "reponses": [
        [
          "Palettes de porteurs déjà en stock",
          "10"
        ],
        [
          "Cartons par palette",
          "36"
        ],
        [
          "Avant ta saisie",
          "360"
        ],
        [
          "Reçus (P4)",
          "34"
        ],
        [
          "Après ta saisie",
          "394"
        ]
      ],
      "note": "Jalon 8 : « Il y a maintenant 394 cartons de porteurs Little Smoby en stock. » Pièges : 396 (le BL) et 360 (entrée pas validée). Compter les palettes sur le plan est long : accepter que l'élève lise directement l'écran Stock avant de calculer."
    },
    {
      "etape": 5,
      "etapeTitre": "Vérifier l’écran Stock",
      "genre": "fait",
      "texte": "L’écran Stock donne-t-il le même nombre que ton calcul ?",
      "rep": "Oui : 394 cartons, si l'entrée est validée."
    },
    {
      "etape": 5,
      "etapeTitre": "Vérifier l’écran Stock",
      "genre": "qcm",
      "texte": "L'écran Stock affiche encore 360 cartons de porteurs. Le plus probable :",
      "choix": [
        "l’entrée en stock n’est pas validée",
        "les porteurs sont partis",
        "le BL est faux"
      ],
      "bonne": 0,
      "explication": "Une saisie non validée ne modifie pas le stock.",
      "notion": "Entrée en stock"
    },
    {
      "etape": 5,
      "etapeTitre": "Vérifier l’écran Stock",
      "genre": "reflexion",
      "texte": "Pourquoi vérifier l'écran Stock après une saisie, au lieu de faire confiance à ce qu'on a tapé ?",
      "pistes": [
        "Une faute de frappe ou une saisie non validée se voit tout de suite.",
        "Le stock est ce que tout le monde regarde : s'il est faux, tout le monde se trompe.",
        "C'est ce qu'on va dire au transporteur : il faut en être sûr."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Répondre à Kuehne+Nagel",
      "genre": "fait",
      "texte": "Que demande Kuehne+Nagel ?",
      "rep": "Si la marchandise d'Arinthod est arrivée et rangée, et quand la commande de Noël pourra partir."
    },
    {
      "etape": 6,
      "etapeTitre": "Répondre à Kuehne+Nagel",
      "genre": "fait",
      "texte": "Par quelle formule commences-tu ?",
      "rep": "« Bonjour, »"
    },
    {
      "etape": 6,
      "etapeTitre": "Répondre à Kuehne+Nagel",
      "genre": "fait",
      "texte": "Quel jour la commande de Noël pourra-t-elle partir ?",
      "rep": "« La commande de Noël pourra partir jeudi 10 décembre. »",
      "note": "Piège : vendredi 11. Nous sommes mercredi 9 décembre."
    },
    {
      "etape": 6,
      "etapeTitre": "Répondre à Kuehne+Nagel",
      "genre": "fait",
      "texte": "Comment termines-tu ton message ?",
      "rep": "« Cordialement, Yanis — Smoby Moirans »",
      "note": "Jalon 9 : toutes les lignes justes (avec « La marchandise d'Arinthod est en stock. »)."
    },
    {
      "etape": 6,
      "etapeTitre": "Répondre à Kuehne+Nagel",
      "genre": "qcm",
      "texte": "Pour répondre à un transporteur, « Salut ! » est…",
      "choix": [
        "parfait, c’est plus sympa",
        "trop familier : on écrit « Bonjour, »",
        "obligatoire"
      ],
      "bonne": 1,
      "explication": "À un partenaire extérieur, on écrit au vous avec une formule de politesse.",
      "notion": "Communication écrite"
    },
    {
      "etape": 6,
      "etapeTitre": "Répondre à Kuehne+Nagel",
      "genre": "reflexion",
      "texte": "Bruno, tu le tutoies ; à Kuehne+Nagel, tu écris « Bonjour, … Cordialement ». Pourquoi cette différence ?",
      "pistes": [
        "Bruno est un collègue de Smoby : on le tutoie, poliment.",
        "Kuehne+Nagel est une autre entreprise, un partenaire : on le vouvoie, comme un client.",
        "On écrit au nom de Smoby : le message donne une image de l'entreprise."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Chaque produit a son côté de rack : c'est le plan d'………………….",
      "rep": "implantation."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Un produit à rotation rapide se range près des ………………….",
      "rep": "quais."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "Le poids posé sur un niveau ne dépasse jamais ce qu'indique la ………………… de charge.",
      "rep": "plaque."
    },
    {
      "etape": 7,
      "etapeTitre": "Cours à détacher",
      "genre": "fait",
      "texte": "On saisit en stock les quantités ………………… reçues, pas celles du BL.",
      "rep": "réellement."
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
      "contexte": "Avant de lire l'écran, calcule ce que tu devrais y trouver.",
      "reponses": [
        [
          "litige",
          "fournisseur"
        ],
        [
          "rotation",
          "sort"
        ],
        [
          "entrée en stock",
          "stock"
        ],
        [
          "chariot rétractable",
          "mât"
        ]
      ],
      "note": "Un mot de la banque par trou."
    }
  ]
};
