# -*- coding: utf-8 -*-
"""Les feuilles à détacher des trames (Cowork, 04/10/2026, décision de Tristan).

À la fin de chaque trame, une feuille : le COURS au recto (« L'essentiel » à trous + un lexique à compléter,
avec une banque de mots), une ACTIVITÉ à faire à la maison au verso (un petit cas sur papier, d'autres
chiffres que la séance). Rendue par `trame_commun.feuille_detachable(code)`.

Deux règles :
  · UNE définition par mot, pour toutes les trames : `LEXIQUE` ci-dessous. Une trame choisit ses mots.
  · aucun trou ne donne la réponse d'une question de SA trame (la trame est entière sous les yeux de l'élève) :
    les mots que la trame fait chercher (QCM, questions de définition) ne sont pas dans son lexique.

Les nombres des activités sont INVENTÉS pour l'exercice ; leurs réponses sont calculées à la main ici et
vérifiées par `verifier()` en bas de fichier (lancé par le générateur).
"""

# mot : (définition avec {} à la place du mot manquant, mot manquant)
LEXIQUE = {
    # --- réception (Picard, Spartoo)
    'Bon de livraison (BL)': ("document qui accompagne la marchandise : il dit ce que le {} a envoyé.", 'fournisseur'),
    'Fournisseur': ("entreprise qui {} la marchandise à son client.", 'vend'),
    'Transporteur': ("entreprise qui {} la marchandise jusqu'au quai.", 'conduit'),
    'Enregistreur de température': ("appareil du camion qui mesure la température de l'{} de la remorque.", 'air'),
    'Consigne de température': ("température que le camion doit {} pendant tout le trajet.", 'tenir'),
    'Sonder à cœur': ("planter une sonde au {} d'un carton, pour lire la température du produit.", 'centre'),
    'Réserve': ("remarque écrite sur le BL, devant le {}, quand quelque chose ne va pas.", 'chauffeur'),
    'Chaîne du froid': ("garder un surgelé au froid sans aucune {}, de l'usine jusqu'au client.", 'coupure'),
    'Quai': ("endroit où le camion se met, porte ouverte, pour être {}.", 'déchargé'),
    'Aléa': ("événement {} qui oblige à changer l'organisation prévue.", 'imprévu'),
    'Chambre froide': ("local fermé de l'entrepôt où le froid est {} : on y range les surgelés.", 'maintenu'),
    'Temps hors froid': ("durée pendant laquelle un lot attend sur le quai, avant d'entrer en {}.", 'chambre froide'),
    'Palette multi-références': ("palette qui porte plusieurs {} différents : chacun se compte à part.", 'produits'),
    'Ordre de déchargement': ("ordre dans lequel on fait {} les camions quand il n'y a qu'un quai.", 'passer'),
    'Litige': ("désaccord avec le transporteur ou le fournisseur sur une {} reçue.", 'livraison'),
    'Protestation motivée': ("lettre qui {} précisément le dommage constaté et ce qu'on réclame.", 'décrit'),
    'Dossier litige': ("ensemble des {} qui prouvent un dommage : BL, ticket, fiche de contrôle, photos.", 'documents'),
    'Destinataire': ("celui qui {} la marchandise à la fin du transport.", 'reçoit'),
    'Fiche de contrôle': ("feuille où le réceptionnaire {} ce qu'il constate sur chaque palette.", 'note'),
    'Bloquer un lot': ("mettre un lot de côté pour qu'il ne soit ni {} ni expédié, le temps de décider.", 'vendu'),
    'Colis': ("carton ou paquet qui voyage seul, avec une {} sur le dessus.", 'étiquette'),
    'Écart de livraison': ("différence entre la quantité {} et la quantité reçue.", 'annoncée'),
    'Bon de commande': ("document par lequel le client dit au fournisseur ce qu'il {}.", 'achète'),
    'Reliquat': ("partie d'une commande qui n'a pas pu partir et sera {} plus tard.", 'livrée'),
    'Rupture de stock': ("il ne reste {} article en stock.", 'aucun'),
    'Seuil de réapprovisionnement': ("niveau de stock sous lequel il faut {} au fournisseur.", 'commander'),
    'Stock maximum': ("quantité qu'on ne veut pas {} pour une référence.", 'dépasser'),
    'Minimum de commande': ("plus petite quantité que le fournisseur {} de livrer.", 'accepte'),
    'Emplacement de stockage': ("adresse précise où une référence est {} dans l'entrepôt.", 'rangée'),
    'Délai de livraison': ("temps entre la commande au fournisseur et l'{} de la marchandise.", 'arrivée'),
    'Réapprovisionner': ("commander au fournisseur pour {} le stock d'une référence.", 'remonter'),
    'Rappel de produit': ("le fabricant demande de {} des produits qui peuvent être dangereux ou défectueux.", 'retirer'),
    'Amont': ("tout ce qui s'est passé {} l'entrée en stock : fournisseur, réception.", 'avant'),
    'Aval': ("tout ce qui s'est passé {} l'entrée en stock : commandes, clients livrés.", 'après'),
    'Blocage qualité': ("sortie du stock d'un lot {}, pour qu'il ne soit plus vendu.", 'douteux'),
    'Compte rendu': ("message qui dit ce qu'on a {}, avec les preuves.", 'fait'),
    # --- stocks (Cdiscount)
    'Stock': ("quantité d'un article {} dans l'entrepôt à un moment donné.", 'présente'),
    'Mouvement de stock': ("toute {} ou sortie d'articles, enregistrée par le système.", 'entrée'),
    'Fiche de stock': ("suivi d'un seul {} : une ligne par mouvement, avec le stock après.", 'article'),
    'Inventaire': ("compter à la main ce qu'il y a dans les rayons, puis le {} au stock du système.", 'comparer'),
    'Bon de préparation (BP)': ("liste des articles à {} du rayon pour une commande client.", 'sortir'),
    'Retour client': ("article que le client {} à l'entreprise.", 'renvoie'),
    'Casse': ("article {} qu'on ne peut plus vendre.", 'abîmé'),
    'Stock du système': ("le stock qu'{} le logiciel, calculé à partir des mouvements enregistrés.", 'affiche'),
    "Constat d'écart": ("note d'un préparateur qui trouve au rayon un stock {} de celui du logiciel.", 'différent'),
    'Écart': ("différence entre le stock {} et le stock du logiciel.", 'trouvé'),
    'Extraction': ("liste de lignes {} dans le logiciel avec des critères, avant l'export.", 'choisies'),
    'Tableur': ("logiciel où l'on calcule avec des {} écrites dans des cellules.", 'formules'),
    'Cellule': ("case du tableur, repérée par une lettre et un {} (comme B2).", 'chiffre'),
    'Formule': ("calcul écrit dans une cellule ; il commence toujours par le signe {}.", '='),
    'Fonction SI': ("affiche un résultat si une condition est {}, un autre sinon.", 'vraie'),
    'Fonction NB.SI': ("{} les cellules qui respectent une condition.", 'compte'),
    'Fonction NB.SI.ENS': ("compte les lignes qui respectent {} conditions à la fois.", 'plusieurs'),
    "Écart d'inventaire": ("différence entre la quantité {} et le stock du système.", 'comptée'),
    'Emplacement': ("adresse précise d'un article dans l'entrepôt : allée, colonne, {}.", 'niveau'),
    "Taux d'écart": ("écarts additionnés sans leur signe, divisés par le stock du système, exprimés en {}.", 'pourcentage'),
    'Recomptage': ("deuxième comptage fait pour {} un écart avant de le corriger.", 'confirmer'),
    "Relevé d'inventaire": ("feuille où l'équipe {} les quantités comptées, emplacement par emplacement.", 'écrit'),
    'Ajustement de stock': ("correction du stock du système, toujours avec un {}.", 'motif'),
    'Régulariser': ("passer un ajustement pour que le système dise ce qu'on a {}.", 'compté'),
    'Ajustement orphelin': ("ajustement sans aucun {} : on ne sait pas pourquoi le stock a changé.", 'document'),
    'Motif': ("raison {} d'un ajustement : casse, inventaire, retour…", 'écrite'),
    'Clôture du mois': ("moment où le responsable {} les chiffres du stock du mois.", 'arrête'),
    'Démarque inconnue': ("perte de stock dont on ne connaît pas la {}.", 'cause'),
    'Bon de réception': ("document où le réceptionnaire écrit ce qu'il a vraiment {} à l'arrivée.", 'reçu'),
    'Nettoyer un export': ("retirer les lignes {} et les doublons, corriger les données mal écrites.", 'vides'),
    'Doublon': ("ligne présente {} fois dans un fichier.", 'deux'),
    'Priorité': ("ce qu'on traite en {}, parce que ça coûte ou risque le plus.", 'premier'),
    "Coût d'un écart": ("nombre d'articles en écart × leur {} unitaire.", 'prix'),
    # --- transport (Boost)
    'Tournée': ("parcours d'un véhicule qui {} plusieurs clients à la suite.", 'livre'),
    'Charge utile': ("poids {} que le véhicule peut transporter.", 'maximal'),
    'Ordre de passage': ("ordre dans lequel le livreur {} les clients.", 'sert'),
    'Temps de route': ("temps passé à rouler : distance ÷ {}.", 'vitesse'),
    'Temps aux arrêts': ("temps passé chez les clients : nombre d'arrêts × temps par {}.", 'arrêt'),
    'Contrainte': ("règle qu'on ne peut pas {} : la charge, l'heure du train…", 'dépasser'),
    'Vélo-cargo': ("vélo à assistance électrique qui {} des colis en ville.", 'transporte'),
    'Laisser à quai': ("garder une commande à l'entrepôt : elle partira le {} suivant.", 'jour'),
    'Créneau de livraison': ("heure {} à laquelle un client peut recevoir sa commande.", 'limite'),
    'Replanifier': ("refaire une organisation quand la {} change.", 'situation'),
    'Annulation': ("le client {} sa commande : elle ne part pas.", 'retire'),
    'Relecture': ("vérification d'un travail par une {} personne, avant le départ.", 'autre'),
    'Diagnostic': ("dire ce qui ne va pas en le {} par des chiffres.", 'prouvant'),
    'Surcharge': ("poids chargé {} à la charge utile.", 'supérieur'),
    'Barre de formule': ("zone au-dessus du tableau qui montre ce que {} vraiment une cellule.", 'contient'),
}

C14 = 'Compétence C1.4 — Traiter les opérations de réception de produits selon les procédures'
C13_14 = 'Compétences C1.3 — Préparer l\'action de réception · C1.4 — Traiter les opérations de réception'
C16 = 'Compétence C1.6 — Gérer le suivi des stocks'
C24 = 'Compétence C2.4 — Organiser une tournée de livraison'

# Une feuille : titre du cours, compétence, essentiel [(phrase avec {}, mot)], mots du lexique, activité.
# Activité : titre, situation, blocs, corrigé. Blocs : ('liste', titre, [items]) · ('encadre', titre, texte) ·
# ('tableau', entetes, largeurs_cm, lignes_preremplies, hauteur_cm) · ('faits', [q]) · ('questions', [(q, n)]) ·
# ('reflechir', [q]). Corrigé : clés = début de la question, ou « T: » + en-têtes (format de corriges_data).
FEUILLES = {}

# ------------------------------------------------------------------------------------- Picard ENT-4.1
# Pas de « −18 °C » dans la chaîne du froid : c'est le QCM de l'étape 1.
FEUILLES['ENT-4.1'] = dict(
    titre='Le cours : réceptionner des surgelés', competence=C14,
    essentiel=[
        ("Avant d'ouvrir le camion, on lit le {} de l'enregistreur de température.", 'ticket'),
        ("Dès que la porte s'ouvre, le lot sort du froid : on le rentre en {} avant de remplir les papiers.", 'chambre froide'),
        ("Pour chaque palette, on compte les cartons, on sonde à {} et on lit l'étiquette.", 'cœur'),
        ("Un problème s'écrit sur le bon de livraison : c'est une {}. Elle dit quelle palette, quoi, combien.", 'réserve'),
    ],
    mots=['Bon de livraison (BL)', 'Fournisseur', 'Transporteur', 'Enregistreur de température',
          'Consigne de température', 'Sonder à cœur', 'Réserve', 'Chaîne du froid'],
    activite=dict(
        titre='Le camion du mardi',
        situation="Mardi, 6 h 00, quai 32. Un camion arrive avec trois palettes. Le ticket de l'enregistreur est parfait : "
                  "la consigne est −20 °C et la température est restée entre −20,5 °C et −21,2 °C. Voici ce que tu relèves.",
        blocs=[
            ('liste', 'Tes relevés :', [
                "M1, glaces au chocolat, BL : 40 cartons. Couche de 4 × 2 cartons, 5 couches, 2 cartons manquent dessus. "
                "Sonde : −19,0 °C. Étiquette conforme.",
                "M2, poêlée de légumes, BL : 36 cartons. Couche de 6 cartons, 6 couches complètes. Sonde : −16,4 °C. "
                "Étiquette conforme.",
                "M3, frites, BL : 30 cartons (réf. FRI-1000). Couche de 6 cartons, 5 couches complètes. Sonde : −20,8 °C. "
                "L'étiquette dit FRI-750."]),
            ('encadre', 'Règle du quai :', "−18 °C ou plus froid : on accepte. Entre −18 °C et −15 °C : on accepte avec "
             "réserves. Plus chaud que −15 °C : on refuse."),
            ('tableau', ['Palette', 'Mon calcul du comptage', 'Cartons', 'Décision', 'Motif'], [1.6, 5.0, 1.8, 4.2, 4.4],
             [['M1'], ['M2'], ['M3']], 1.1),
            ('questions', [("Écris la réserve de la palette M2, comme tu l'écrirais sur le BL.", 2)]),
            ('reflechir', ["Le ticket du camion était parfait. Qu'aurais-tu laissé passer si tu ne t'étais fié qu'à lui ?"]),
        ],
        corrige={
            "T: Palette | Mon calcul du comptage | Cartons | Décision | Motif": {"lignes": [
                ["M1", "4 × 2 = 8 ; 8 × 5 = 40 ; 40 − 2", "38", "Accepter avec réserves", "Manquant (2 cartons)"],
                ["M2", "6 × 6", "36", "Accepter avec réserves", "Température non conforme (−16,4 °C)"],
                ["M3", "6 × 5", "30", "Refuser", "Produit différent (FRI-750 au lieu de FRI-1000)"],
            ], "note": "Valeurs inventées pour l'activité. M2 : entre −18 et −15 °C (règle du quai de l'exercice)."},
            "Écris la réserve de la palette M2": {"rep": "« M2, poêlée de légumes : acceptée sous réserve, température à cœur relevée −16,4 °C (−18 °C exigé). »", "note": "Attendu : la palette, le problème, la valeur relevée."},
            "Le ticket du camion était parfait": {"pistes": [
                "La palette M2, trop chaude : le ticket mesure l'air de la remorque, pas le produit.",
                "Les 2 cartons manquants de M1 et la mauvaise référence de M3 : le ticket ne dit rien du contenu.",
                "Valoriser l'élève qui distingue ce que chaque contrôle peut voir."]},
        }),
)

# ------------------------------------------------------------------------------------- Picard ENT-4.2
# Pas de définition du groupe froid, de l'enregistreur ni de « sonder à cœur » : l'étape 1 les fait chercher.
FEUILLES['ENT-4.2'] = dict(
    titre='Le cours : un seul quai, plusieurs camions', competence=C13_14,
    essentiel=[
        ("Quand plusieurs camions attendent pour un seul quai, on choisit l'{} de déchargement en lisant leurs tickets.", 'ordre'),
        ("On fait passer en premier le camion dont la marchandise risque le plus de se {}.", 'réchauffer'),
        ("Un camion qui attend porte {} ne garde son froid que si son groupe froid marche.", 'fermée'),
        ("Chaque camion a son propre temps hors froid : il commence à l'ouverture de sa {}.", 'porte'),
    ],
    mots=['Quai', 'Aléa', 'Ordre de déchargement', 'Temps hors froid', 'Chambre froide', 'Palette multi-références',
          'Réserve', 'Chaîne du froid'],
    activite=dict(
        titre='Deux camions à 5 h 30',
        situation="Mercredi, 5 h 30. Deux camions arrivent en même temps. Tu n'as qu'un quai. Voici leurs tickets "
                  "(consigne : −20 °C pour les deux).",
        blocs=[
            ('tableau', ['Heure', 'Camion A (viandes surgelées)', 'Camion B (crèmes glacées)'], [3.0, 7.0, 7.0],
             [['4 h 30', '−21,0 °C', '−21,0 °C'], ['5 h 00', '−21,1 °C', '−20,2 °C'], ['5 h 15', '−20,9 °C', '−19,1 °C'],
              ['5 h 30', '−21,0 °C', '−18,0 °C'], ['Ce que montre le ticket', '', '']], 0.85),
            ('faits', ["Quel camion fais-tu décharger en premier ?"]),
            ('questions', [("Écris en une phrase, pour le chef de quai, la raison de ton choix.", 2)]),
            ('encadre', 'Un calcul :', "si le camion B attend 20 minutes porte fermée, sa température monte encore de "
             "0,2 °C par minute. Règle du quai : plus chaud que −15 °C, on refuse."),
            ('faits', ["Température du camion B après 20 minutes d'attente", "Que faudrait-il faire alors de ses palettes ?"]),
            ('reflechir', ["Un troisième camion arrive, avec un ticket parfait. À quelle place le mets-tu ? Explique."]),
        ],
        corrige={
            "T: Heure | Camion A (viandes surgelées) | Camion B (crèmes glacées)": {"lignes": [
                ["Ce que montre le ticket", "Rien à signaler : la température est stable", "La température remonte de plus en plus vite : le groupe froid faiblit"],
            ], "note": "Seule la dernière ligne est à compléter."},
            "Quel camion fais-tu décharger en premier": {"rep": "Le camion B (crèmes glacées)."},
            "Écris en une phrase, pour le chef de quai": {"rep": "« Le ticket du camion B montre que son froid faiblit : les glaces se réchauffent s'il attend. »"},
            "Température du camion B après 20 minutes": {"rep": "−14,0 °C.", "note": "−18,0 + 20 × 0,2 = −18,0 + 4,0."},
            "Que faudrait-il faire alors de ses palettes": {"rep": "Les refuser : −14,0 °C est plus chaud que −15 °C."},
            "Un troisième camion arrive": {"pistes": [
                "Après B, et sans doute après A ou à égalité : un ticket parfait peut attendre porte fermée.",
                "Valoriser l'élève qui pense à sonder quand même ses palettes."]},
        }),
)

# ------------------------------------------------------------------------------------- Picard ENT-4.3
# Ni le délai, ni le moyen de la protestation (étape 1) ; ni « sous réserve de déballage » ni « recongeler »
# (ce sont des erreurs que la séance fait trouver).
FEUILLES['ENT-4.3'] = dict(
    titre='Le cours : le dossier litige', competence=C14 + ' (C1.4.2 : dossier litige)',
    essentiel=[
        ("Le travail d'un collègue se {} avant d'être signé : on relit chaque pièce du dossier.", 'contrôle'),
        ("Une réserve dit quelle palette, quel problème et {}.", 'combien'),
        ("Pour protester contre le transporteur, on respecte un {} fixé par la loi.", 'délai'),
        ("Un lot douteux se {} en attendant la réponse du transporteur ou du fournisseur.", 'bloque'),
    ],
    mots=['Litige', 'Dossier litige', 'Protestation motivée', 'Destinataire', 'Fiche de contrôle', 'Bloquer un lot',
          'Réserve', 'Transporteur'],
    activite=dict(
        titre='Le dossier du lundi 9 mars',
        situation="Lundi 9 mars 2026, tu reprends le dossier d'une réception de la nuit. Le collègue a écrit sur le BL : "
                  "« sous réserve de déballage ». Le ticket du camion montre une remontée de 2 h 00 à 2 h 45, jusqu'à "
                  "−13,5 °C (consigne −20 °C). Ce matin, la palette sondée est à −20,5 °C.",
        blocs=[
            ('questions', [("Qu'est-ce qui ne va pas dans la réserve écrite par ton collègue ?", 2),
                           ("Réécris une réserve précise pour cette palette.", 2)]),
            ('faits', ["La palette est à −20,5 °C ce matin. Quelle pièce du dossier montre qu'elle a eu chaud ?",
                       "Que fais-tu de la palette en attendant ?"]),
            ('encadre', 'Code de commerce, article L133-3 (extrait) :', "la protestation doit partir dans les trois jours, "
             "non compris les jours fériés, qui suivent la réception."),
            ('faits', ["La réception a eu lieu le lundi 9 mars. Quel est le dernier jour pour envoyer la protestation ?"]),
            ('reflechir', ["Si tu étais le chef de quai, que demanderais-tu au collègue de nuit pour la prochaine fois ?"]),
        ],
        corrige={
            "Qu'est-ce qui ne va pas dans la réserve": {"rep": "Elle ne dit rien : ni la palette, ni le problème, ni la valeur. « Sous réserve de déballage » n'a aucune valeur."},
            "Réécris une réserve précise": {"rep": "« Palette … : remontée de température pendant le transport, jusqu'à −13,5 °C entre 2 h 00 et 2 h 45 (ticket de l'enregistreur, consigne −20 °C). »", "note": "Attendu : la palette, le problème, la valeur et sa source."},
            "La palette est à −20,5 °C ce matin": {"rep": "Le ticket de l'enregistreur (−13,5 °C dans la nuit)."},
            "Que fais-tu de la palette en attendant": {"rep": "Je la bloque (ni vendue ni expédiée)."},
            "La réception a eu lieu le lundi 9 mars": {"rep": "Le jeudi 12 mars 2026.", "note": "Trois jours qui suivent la réception : mardi 10, mercredi 11, jeudi 12 (aucun jour férié)."},
            "Si tu étais le chef de quai": {"pistes": [
                "Lire le ticket avant d'ouvrir, et sonder la nuit même.",
                "Écrire une réserve précise (palette, problème, valeur).",
                "Toute réponse qui part d'une erreur réelle du dossier."]},
        }),
)

# ----------------------------------------------------------------------------------- Cdiscount ENT-2.1
# Pas de « place de marché » : c'est le QCM de l'étape 1. « Une commande annulée ne fait pas bouger le stock »
# n'est pas écrit : l'étape 5 le fait trouver.
FEUILLES['ENT-2.1'] = dict(
    titre='Le cours : les mouvements de stock', competence=C16,
    essentiel=[
        ("Stock après = stock d'avant + les {} − les sorties.", 'entrées'),
        ("Chaque mouvement de stock doit avoir son {} : bon de livraison, bon de préparation, constat…", 'document'),
        ("Quand le rayon et le système ne disent pas la même chose, on cherche l'{} dans les mouvements depuis le dernier inventaire.", 'erreur'),
        ("Pour retrouver un stock passé, on refait le calcul à l'{} : on retire les entrées et on remet les sorties.", 'envers'),
    ],
    mots=['Stock', 'Stock du système', 'Mouvement de stock', 'Fiche de stock', 'Inventaire', 'Bon de préparation (BP)',
          'Retour client', 'Casse'],
    activite=dict(
        titre='La fiche de stock des chargeurs',
        situation="Le 1er mars, l'inventaire a compté 12 chargeurs CHG-USB. Voici les mouvements de la semaine. Le constat "
                  "de casse DEM-14 dit : « 3 chargeurs écrasés ».",
        blocs=[
            ('tableau', ['Date', 'Document', 'Entrée', 'Sortie', 'Stock après'], [2.6, 6.4, 2.4, 2.4, 3.2],
             [['1er mars', 'Inventaire', '', '', '12'], ['3 mars', 'Réception REC-31', '20', '', ''],
              ['4 mars', 'Bon de préparation BP-102', '', '5', ''], ['5 mars', 'Bon de préparation BP-118', '', '8', ''],
              ['6 mars', 'Retour client RET-07', '1', '', ''], ['7 mars', 'Casse DEM-14', '', '2', '']], 0.85),
            ('faits', ["Stock du système le 7 mars", "Quel document de la semaine ne correspond pas à son mouvement ?",
                       "Combien de chargeurs devrait-il vraiment rester ?"]),
            ('reflechir', ["Si personne ne corrige cette erreur, que risque-t-il de se passer pour un client ?"]),
        ],
        corrige={
            "T: Date | Document | Entrée | Sortie | Stock après": {"lignes": [
                ["1er mars", "Inventaire", "", "", "12"], ["3 mars", "Réception REC-31", "20", "", "32"],
                ["4 mars", "Bon de préparation BP-102", "", "5", "27"], ["5 mars", "Bon de préparation BP-118", "", "8", "19"],
                ["6 mars", "Retour client RET-07", "1", "", "20"], ["7 mars", "Casse DEM-14", "", "2", "18"],
            ]},
            "Stock du système le 7 mars": {"rep": "18."},
            "Quel document de la semaine ne correspond pas": {"rep": "Le constat de casse DEM-14 : 3 chargeurs écrasés, mais 2 seulement sortis du stock."},
            "Combien de chargeurs devrait-il vraiment rester": {"rep": "17."},
            "Si personne ne corrige cette erreur": {"pistes": [
                "Le site vend un chargeur qui n'existe pas : la commande ne peut pas être préparée.",
                "Le client attend, puis voit sa commande annulée."]},
        }),
)

# ----------------------------------------------------------------------------------- Cdiscount ENT-2.2
# Ni WMS ni « exporter » (étape 1). Rien sur « pourquoi une formule » (réflexion de l'étape 4).
FEUILLES['ENT-2.2'] = dict(
    titre='Le cours : faire parler les chiffres avec un tableur', competence=C16,
    essentiel=[
        ("Avant d'exporter, on vérifie le {} de lignes affiché.", 'nombre'),
        ("Écart = stock trouvé − stock du {}.", 'logiciel'),
        ("Le tableur sert à repérer vite les lignes en {} au milieu de centaines d'autres.", 'écart'),
        ("Un résultat de formule se {} sur quelques lignes calculées à la main.", 'vérifie'),
    ],
    mots=["Constat d'écart", 'Écart', 'Extraction', 'Tableur', 'Cellule', 'Formule', 'Fonction SI', 'Fonction NB.SI'],
    activite=dict(
        titre='Six lignes à vérifier',
        situation="Un extrait de constats d'écart, comme dans ton tableur. Colonne B : stock du logiciel ; colonne C : "
                  "stock trouvé au rayon.",
        blocs=[
            ('tableau', ['Ligne', 'A · Référence', 'B · Logiciel', 'C · Trouvé', 'D · Écart', 'E · Repère'],
             [1.5, 3.8, 2.8, 2.8, 2.8, 3.3],
             [['2', 'CHG-USB', '14', '14'], ['3', 'ECO-BT', '9', '7'], ['4', 'CAB-HDMI', '20', '20'],
              ['5', 'SOU-SF', '6', '8'], ['6', 'CLE-32', '11', '11'], ['7', 'PIL-AA', '30', '27']], 0.8),
            ('faits', ["Formule de l'écart, en D2", "Formule en E2 : « écart » si D2 n'est pas 0, sinon rien",
                       "Formule qui compte les « écart » de E2 à E7", "Résultat de ce comptage"]),
            ('reflechir', ["Avec 600 lignes au lieu de 6, qu'est-ce que le tableur changerait pour toi ?"]),
        ],
        corrige={
            "T: Ligne | A · Référence | B · Logiciel | C · Trouvé | D · Écart | E · Repère": {"lignes": [
                ["2", "CHG-USB", "14", "14", "0", ""], ["3", "ECO-BT", "9", "7", "−2", "écart"],
                ["4", "CAB-HDMI", "20", "20", "0", ""], ["5", "SOU-SF", "6", "8", "2", "écart"],
                ["6", "CLE-32", "11", "11", "0", ""], ["7", "PIL-AA", "30", "27", "−3", "écart"],
            ]},
            "Formule de l'écart, en D2": {"rep": "=C2-B2"},
            "Formule en E2": {"rep": "=SI(D2<>0;\"écart\";\"\")"},
            "Formule qui compte les « écart »": {"rep": "=NB.SI(E2:E7;\"écart\")"},
            "Résultat de ce comptage": {"rep": "3."},
            "Avec 600 lignes au lieu de 6": {"pistes": [
                "On écrit la formule une fois et on la recopie : le tableur fait les 600 calculs.",
                "On ne peut plus repérer les écarts à l'œil : SI et NB.SI le font sans oubli."]},
        }),
)

# ----------------------------------------------------------------------------------- Cdiscount ENT-2.3
# Ni « inventaire tournant » (étape 1), ni « démarque inconnue » (QCM), ni « comptage à l'aveugle » (étape 4).
FEUILLES['ENT-2.3'] = dict(
    titre="Le cours : l'inventaire et les écarts", competence=C16 + ' (C1.6.2 : participer aux activités d\'inventaire)',
    essentiel=[
        ("Avant de régulariser un écart, on cherche s'il a une {} : un mouvement oublié, un article mal rangé…", 'explication'),
        ("On ne régularise que l'écart que plus {} n'explique.", 'rien'),
        ("Une régularisation change le stock pour de {}.", 'bon'),
        ("Taux d'écart = somme des écarts sans leur signe ÷ somme des stocks du système × {}.", '100'),
    ],
    mots=['Inventaire', "Écart d'inventaire", 'Emplacement', 'Recomptage', "Relevé d'inventaire",
          'Ajustement de stock', "Taux d'écart", 'Stock du système'],
    activite=dict(
        titre='Cinq références à décider',
        situation="Tu as compté cinq références. Deux informations sont arrivées : « 2 chargeurs CHG-USB attendent au poste "
                  "des retours, pas encore rangés » et « la souris SOU-SF reçue ce matin n'est pas encore saisie ».",
        blocs=[
            ('tableau', ['Référence', 'Système', 'Compté', 'Écart', 'Ta décision'], [3.0, 2.4, 2.4, 2.4, 6.8],
             [['PIL-AA', '40', '40'], ['CHG-USB', '15', '13'], ['ECO-BT', '8', '5'], ['CAB-HDMI', '12', '12'],
              ['SOU-SF', '6', '7']], 0.95),
            ('faits', ["Combien de références sont en écart ?", "Taux d'écart (en %, arrondi au dixième) = somme des écarts sans leur signe ÷ somme des stocks du système × 100"]),
            ('questions', [("Pour la référence que tu régularises, qu'est-ce qui te permet de le faire ?", 2)]),
            ('reflechir', ["Si tu avais régularisé les trois écarts tout de suite, que serait devenu le stock du système "
                           "le lendemain ?"]),
        ],
        corrige={
            "T: Référence | Système | Compté | Écart | Ta décision": {"lignes": [
                ["PIL-AA", "40", "40", "0", "rien à faire"],
                ["CHG-USB", "15", "13", "−2", "ne pas régulariser : ranger les 2 chargeurs du poste des retours"],
                ["ECO-BT", "8", "5", "−3", "recompter, puis régulariser (−3) si l'écart se confirme"],
                ["CAB-HDMI", "12", "12", "0", "rien à faire"],
                ["SOU-SF", "6", "7", "+1", "ne pas régulariser : saisir la réception de ce matin"],
            ]},
            "Combien de références sont en écart": {"rep": "3."},
            "Taux d'écart (en %, arrondi au dixième)": {"rep": "7,4 %.", "note": "Règle de l'écran d'ENT-2.3 : (2 + 3 + 1) ÷ (40 + 15 + 8 + 12 + 6) × 100 = 6 ÷ 81 × 100 = 7,41. Corrigé le 04/10 : la première version calculait 3 références sur 5 (60 %), ce qui n'est pas la règle de la séance."},
            "Pour la référence que tu régularises": {"rep": "ECO-BT : aucune information n'explique l'écart, et le recomptage le confirme."},
            "Si tu avais régularisé les trois écarts": {"pistes": [
                "Faux pour CHG-USB et SOU-SF : une fois les chargeurs rangés et la souris saisie, l'écart repartirait dans l'autre sens.",
                "CHG-USB : le système passerait à 13 ; une fois les 2 chargeurs rangés, il y en aurait 15 au rayon pour 13 au système.",
                "SOU-SF : le système passerait à 7 ; une fois la réception saisie (+1), il dirait 8 pour 7 au rayon.",
                "Valoriser l'élève qui chiffre la nouvelle erreur créée."]},
        }),
)

# ----------------------------------------------------------------------------------- Cdiscount ENT-2.4
# Pas d'« ajustement » (QCM de l'étape 1), ni ce que le service fait pour le vendeur.
FEUILLES['ENT-2.4'] = dict(
    titre='Le cours : justifier chaque ajustement', competence=C16 + ' (C1.6.1 : suivi des flux d\'information)',
    essentiel=[
        ("Tout ajustement doit pouvoir être relié à un {}.", 'justificatif'),
        ("Un ajustement sans document se remonte jusqu'à son {} : souvent une réception mal comptée.", 'origine'),
        ("On regroupe les ajustements par {} pour voir d'où viennent les pertes.", 'type'),
    ],
    mots=['Régulariser', 'Ajustement orphelin', 'Motif', 'Clôture du mois', 'Démarque inconnue', 'Bon de réception',
          'Fonction SI', 'Fonction NB.SI'],
    activite=dict(
        titre='Les ajustements de la semaine',
        situation="Voici six ajustements, tels qu'on les trouve dans un export. Colonne D : le motif ; colonne E : le "
                  "document (vide s'il n'y en a pas).",
        blocs=[
            ('tableau', ['Ligne', 'A · Article', 'B · Quantité', 'D · Motif', 'E · Document'], [1.5, 4.4, 2.8, 4.6, 3.7],
             [['2', 'Mixeur MX-2', '−1', 'Casse', 'DEM-12'], ['3', 'Bouilloire BO-1', '−2', 'Inventaire', 'INV-03'],
              ['4', 'Mixeur MX-2', '−4', 'Démarque inconnue', ''], ['5', 'Grille-pain GP-4', '+1', 'Retour', 'RET-08'],
              ['6', 'Bouilloire BO-1', '−1', 'Casse', ''], ['7', 'Mixeur MX-2', '−3', 'Inventaire', 'INV-03']], 0.8),
            ('faits', ["Formule en F2 : « À VÉRIFIER » si E2 est vide, sinon rien", "Combien de lignes sont à vérifier ?",
                       "Formule qui compte les « Inventaire » de D2 à D7", "Résultat de ce comptage"]),
            ('questions', [("Pour la ligne 4 (−4 mixeurs, sans document), où chercherais-tu d'abord ?", 2)]),
            ('reflechir', ["Que risque l'entreprise si personne ne vérifie ces lignes avant la clôture du mois ?"]),
        ],
        corrige={
            "T: Ligne | A · Article | B · Quantité | D · Motif | E · Document": {"lignes": [], "note": "Tableau donné : rien à compléter."},
            "Formule en F2": {"rep": "=SI(E2=\"\";\"À VÉRIFIER\";\"\")"},
            "Combien de lignes sont à vérifier": {"rep": "2 (lignes 4 et 6)."},
            "Formule qui compte les « Inventaire »": {"rep": "=NB.SI(D2:D7;\"Inventaire\")"},
            "Résultat de ce comptage": {"rep": "2."},
            "Pour la ligne 4": {"rep": "Dans les réceptions récentes de mixeurs MX-2 : un bon de réception mal compté explique souvent un manque."},
            "Que risque l'entreprise si personne": {"pistes": [
                "Signer des chiffres de stock faux à la clôture.",
                "Ne jamais retrouver une erreur de réception, et la payer (au fournisseur ou au vendeur)."]},
        }),
)

# ----------------------------------------------------------------------------------- Cdiscount ENT-2.6
# Pas de définition de RECHERCHEV, de FAUX ni de #N/A : l'étape 1 les fait chercher.
FEUILLES['ENT-2.6'] = dict(
    titre='Le cours : choisir ce qu\'on recompte', competence=C16,
    essentiel=[
        ("Un export doit être {} avant de calculer : une ligne vide ou un doublon fausse les comptes.", 'nettoyé'),
        ("Une date écrite en {} n'est pas comprise par le tableur comme une date.", 'texte'),
        ("Pour aller chercher une valeur dans un autre tableau, on utilise une fonction de {}.", 'recherche'),
    ],
    mots=['Nettoyer un export', 'Doublon', 'Fonction NB.SI.ENS', 'Priorité', "Coût d'un écart", "Constat d'écart",
          'Écart'],
    activite=dict(
        titre='Quatre références, une seule à recompter',
        situation="L'équipe n'a le temps de recompter qu'une seule référence aujourd'hui. Voici les écarts et les prix.",
        blocs=[
            ('tableau', ['Référence', 'Articles en écart', 'Prix unitaire', 'Coût de l\'écart'], [4.0, 4.0, 4.0, 5.0],
             [['BAT-10K', '2', '24,90 €'], ['PIL-AA', '6', '0,80 €'], ['CHG-USB', '1', '12,00 €'], ['ECO-BT', '3', '19,90 €']], 0.9),
            ('faits', ["Quelle référence fais-tu recompter ?",
                       "Formule qui va chercher le prix de la référence A2 dans la feuille Tarifs (A2:B50, prix en colonne 2)"]),
            ('reflechir', ["La référence qui a le plus d'articles en écart n'est pas celle que tu as choisie. Comment "
                           "l'expliquerais-tu à un collègue ?"]),
        ],
        corrige={
            "T: Référence | Articles en écart | Prix unitaire | Coût de l'écart": {"lignes": [
                ["BAT-10K", "2", "24,90 €", "49,80 €"], ["PIL-AA", "6", "0,80 €", "4,80 €"],
                ["CHG-USB", "1", "12,00 €", "12,00 €"], ["ECO-BT", "3", "19,90 €", "59,70 €"],
            ]},
            "Quelle référence fais-tu recompter": {"rep": "ECO-BT (59,70 €)."},
            "Formule qui va chercher le prix": {"rep": "=RECHERCHEV(A2;Tarifs!A2:B50;2;FAUX)", "note": "Accepter $A$2:$B$50 ou A:B."},
            "La référence qui a le plus d'articles": {"pistes": [
                "PIL-AA a 6 articles en écart, mais ils ne coûtent que 4,80 € : une erreur sur ECO-BT coûte bien plus.",
                "On recompte d'abord ce qui coûte le plus, pas ce qui est le plus fréquent."]},
        }),
)

# ---------------------------------------------------------------------------------------- Boost ENT-3.1
# Ni « logisticien e-commerce », ni « externalisation », ni « entreprise d'insertion » (étape 1).
FEUILLES['ENT-3.1'] = dict(
    titre='Le cours : organiser une tournée', competence=C24,
    essentiel=[
        ("Avant de partir, on vérifie que le poids chargé ne dépasse pas la {}.", 'charge utile'),
        ("Heure d'arrivée = heure de départ + temps de {} + temps aux arrêts.", 'route'),
        ("Changer l'ordre des arrêts change les kilomètres, donc le {}.", 'temps'),
        ("Quand tout ne rentre pas, on choisit ce qui reste à quai en {} ce qu'il faut retirer.", 'calculant'),
    ],
    mots=['Tournée', 'Charge utile', 'Ordre de passage', 'Temps de route', 'Temps aux arrêts', 'Contrainte',
          'Vélo-cargo', 'Laisser à quai'],
    activite=dict(
        titre='La tournée de la camionnette',
        situation="Une camionnette part à 8 h 00. Charge utile : 330 kg. Vitesse en ville : 30 km/h. Temps par arrêt : "
                  "10 minutes. Cinq commandes attendent.",
        blocs=[
            ('tableau', ['Client', 'A', 'B', 'C', 'D', 'E'], [3.0, 2.8, 2.8, 2.8, 2.8, 2.8],
             [['Poids (kg)', '60', '90', '70', '140', '85']], 0.8),
            ('faits', ["Poids total des cinq commandes (kg)", "Poids à laisser à quai, au moins (kg)",
                       "Quel client laisses-tu à quai ?"]),
            ('encadre', 'Ta tournée :', "les quatre autres clients, puis retour : 18 km en tout."),
            ('faits', ["Temps de route (min)", "Temps aux arrêts (min)", "Heure de retour"]),
            ('reflechir', ["Si deux clients pesaient chacun plus que le poids à retirer, lequel laisserais-tu à quai ? "
                           "Explique."]),
        ],
        corrige={
            "T: Client | A | B | C | D | E": {"lignes": [], "note": "Tableau donné : rien à compléter."},
            "Poids total des cinq commandes": {"rep": "445 kg."},
            "Poids à laisser à quai, au moins": {"rep": "115 kg (445 − 330)."},
            "Quel client laisses-tu à quai": {"rep": "D (140 kg) : le seul qui suffit à lui seul."},
            "Temps de route (min)": {"rep": "36 min (18 ÷ 30 × 60)."},
            "Temps aux arrêts (min)": {"rep": "40 min (4 × 10)."},
            "Heure de retour": {"rep": "9 h 16 (8 h 00 + 36 + 40 min)."},
            "Si deux clients pesaient chacun plus": {"pistes": [
                "Le plus léger des deux : on laisse le moins possible à quai.",
                "Ou celui qui est le moins pressé, ou le plus loin : toute raison argumentée."]},
        }),
)

# ---------------------------------------------------------------------------------------- Boost ENT-3.2
# Rien sur l'imprévu ni sur la place du client à créneau dans la tournée (la séance le fait trouver).
FEUILLES['ENT-3.2'] = dict(
    titre='Le cours : une tournée sous contraintes', competence=C24,
    essentiel=[
        ("Le trajet le plus court n'est bon que s'il tient {} les contraintes.", 'toutes'),
        ("L'heure d'arrivée chez un client = départ + temps de route jusqu'à lui + les {} déjà faits.", 'arrêts'),
        ("Quand la journée change, on vérifie par le {} si l'ancienne tournée tient encore.", 'calcul'),
        ("Entre deux tournées qui tiennent tout, on garde celle qui {} le moins.", 'roule'),
    ],
    mots=['Créneau de livraison', 'Contrainte', 'Charge utile', 'Ordre de passage', 'Replanifier', 'Annulation',
          'Temps de route', 'Laisser à quai'],
    activite=dict(
        titre='Le créneau de la boulangerie',
        situation="Départ à 9 h 00, vitesse 15 km/h, 5 minutes par arrêt. La boulangerie ne reçoit qu'avant 9 h 30. "
                  "Deux ordres sont possibles.",
        blocs=[
            ('tableau', ['Ordre', 'Place de la boulangerie', 'Distance jusqu\'à elle', 'Distance totale'],
             [2.6, 4.6, 4.8, 5.0],
             [['Ordre 1', '3e arrêt', '6 km', '12 km'], ['Ordre 2', '1er arrêt', '4,5 km', '13,5 km']], 0.85),
            ('faits', ["Ordre 1 : heure d'arrivée à la boulangerie", "Ordre 1 : créneau tenu ?",
                       "Ordre 2 : heure d'arrivée à la boulangerie", "Ordre 2 : créneau tenu ?", "Quel ordre choisis-tu ?"]),
            ('reflechir', ["Comment expliquerais-tu à un collègue que le trajet le plus court n'est pas toujours le meilleur ?"]),
        ],
        corrige={
            "T: Ordre | Place de la boulangerie | Distance jusqu'à elle | Distance totale": {"lignes": [], "note": "Tableau donné : rien à compléter."},
            "Ordre 1 : heure d'arrivée": {"rep": "9 h 34 (6 ÷ 15 × 60 = 24 min de route + 2 arrêts × 5 min)."},
            "Ordre 1 : créneau tenu": {"rep": "Non (après 9 h 30)."},
            "Ordre 2 : heure d'arrivée": {"rep": "9 h 18 (4,5 ÷ 15 × 60 = 18 min, aucun arrêt avant)."},
            "Ordre 2 : créneau tenu": {"rep": "Oui."},
            "Quel ordre choisis-tu": {"rep": "L'ordre 2 : un peu plus long, mais il tient le créneau."},
            "Comment expliquerais-tu à un collègue": {"pistes": [
                "Le plus court ne sert à rien s'il fait rater un client ou le train.",
                "On vérifie d'abord les contraintes, puis on cherche le plus court parmi les tournées qui les tiennent."]},
        }),
)

# ---------------------------------------------------------------------------------------- Boost ENT-3.3
# Ni « plage » ni « la plus petite commande ne suffit pas » : la séance fait trouver la formule fausse et l'erreur
# de chargement.
FEUILLES['ENT-3.3'] = dict(
    titre='Le cours : contrôler le travail d\'un collègue', competence=C24,
    essentiel=[
        ("On ne se fie pas au résultat d'une feuille : on {} ses formules.", 'vérifie'),
        ("Pour chaque contrainte, on dit si elle est tenue et on donne le {} qui le prouve.", 'chiffre'),
        ("Une contrainte tenue se dit aussi : on n'accuse pas tout par {}.", 'principe'),
        ("Corriger, c'est refaire le calcul {} chaque changement.", 'après'),
    ],
    mots=['Relecture', 'Diagnostic', 'Surcharge', 'Barre de formule', 'Formule', 'Contrainte', 'Charge utile',
          'Créneau de livraison'],
    activite=dict(
        titre='La feuille de Karim',
        situation="Karim a préparé sa tournée. Charge utile : 200 kg. Il part à 10 h 00, roule à 15 km/h, sa tournée fait "
                  "12 km. Voici sa feuille.",
        blocs=[
            ('tableau', ['Cellule', 'Ce qu\'elle calcule', 'Formule de Karim', 'Résultat affiché'], [2.2, 5.0, 5.4, 4.4],
             [['B2 à B6', 'poids des 5 colis', '40 · 55 · 30 · 25 · 60', ''], ['B7', 'poids chargé', '=SOMME(B2:B5)', '150'],
              ['E5', 'temps de route (min)', '=E3/E4  (E3 : 12 km, E4 : 15 km/h)', '0,8']], 0.95),
            ('faits', ["Poids chargé, calculé par toi (kg)", "Formule corrigée en B7", "La charge est-elle respectée ?",
                       "Formule corrigée en E5", "Temps de route juste (min)"]),
            ('reflechir', ["Karim dit : « la feuille l'a calculé, donc c'est juste ». Que lui réponds-tu ?"]),
        ],
        corrige={
            "T: Cellule | Ce qu'elle calcule | Formule de Karim | Résultat affiché": {"lignes": [], "note": "Tableau donné : rien à compléter."},
            "Poids chargé, calculé par toi": {"rep": "210 kg (40 + 55 + 30 + 25 + 60)."},
            "Formule corrigée en B7": {"rep": "=SOMME(B2:B6)"},
            "La charge est-elle respectée": {"rep": "Non : 210 kg pour 200 kg (10 kg de trop)."},
            "Formule corrigée en E5": {"rep": "=E3/E4*60"},
            "Temps de route juste": {"rep": "48 min (12 ÷ 15 = 0,8 h, × 60)."},
            "Karim dit": {"pistes": [
                "La feuille calcule ce qu'on lui écrit : une formule fausse donne un résultat faux, sans prévenir.",
                "On vérifie une formule en refaisant le calcul à la main sur un cas."]},
        }),
)


# --------------------------------------------------------------------------------------- Spartoo ENT-1.1
# Ni bon de livraison, ni « émettre des réserves », ni délai, ni contrat de vente, ni dommages-intérêts (étapes 2, 3 et
# 8 les font chercher) ; pas de définition du numéro de lot (étape 3 : « à quoi sert le numéro de lot »).
FEUILLES['ENT-1.1'] = dict(
    titre='Le cours : contrôler une livraison', competence=C14,
    essentiel=[
        ("On compare toujours ce qui est {} sur le bon de livraison à ce qui est réellement arrivé.", 'annoncé'),
        ("Plusieurs colis peuvent contenir la même référence : on les {}.", 'additionne'),
        ("Le logiciel ne corrige rien : ce qu'on saisit entre {} dans le stock.", 'vraiment'),
        ("Après la validation, on vérifie dans la base que les entrées portent le bon {}.", 'lot'),
    ],
    mots=['Fournisseur', 'Transporteur', 'Quai', 'Colis', 'Écart de livraison', 'Bon de réception',
          'Mouvement de stock', 'Stock du système'],
    activite=dict(
        titre='La livraison des Baskets du Nord',
        situation="Un fournisseur (inventé pour l'exercice) livre trois références. Voici son bon de livraison et "
                  "les colis déposés sur le quai.",
        blocs=[
            ('liste', 'Bon de livraison BL-5512, lot LOT-BN-0704 :', [
                "BK-RUN-40 : 10 paires · BK-RUN-42 : 6 paires · BK-TRL-41 : 8 paires."]),
            ('liste', 'Colis sur le quai :', [
                "colis 1 : BK-RUN-40, 5 paires, carton en bon état ;",
                "colis 2 : BK-RUN-40, 5 paires, carton en bon état ;",
                "colis 3 : BK-RUN-42, 4 paires, carton en bon état ;",
                "colis 4 : BK-TRL-41, 8 paires, carton mouillé."]),
            ('encadre', 'Règle :', "écart de quantité ou carton abîmé → accepté sous réserve ; on ne refuse que si la "
             "marchandise est inutilisable."),
            ('tableau', ['Référence', 'Annoncé', 'Compté', 'Écart', 'État', 'Décision'], [3.2, 2.2, 2.2, 2.0, 3.4, 4.0],
             [['BK-RUN-40'], ['BK-RUN-42'], ['BK-TRL-41']], 1.0),
            ('questions', [("Écris en deux phrases ton message de réserves au fournisseur.", 3)]),
            ('reflechir', ["Le chauffeur est pressé et te demande de signer sans compter. Que lui réponds-tu ?"]),
        ],
        corrige={
            "T: Référence | Annoncé | Compté | Écart | État | Décision": {"lignes": [
                ["BK-RUN-40", "10", "10 (5 + 5)", "0", "bon état", "accepté"],
                ["BK-RUN-42", "6", "4", "−2", "bon état", "accepté sous réserve (manque 2 paires)"],
                ["BK-TRL-41", "8", "8", "0", "carton mouillé", "accepté sous réserve (carton abîmé)"],
            ]},
            "Écris en deux phrases ton message de réserves": {"rep": "« Livraison BL-5512, lot LOT-BN-0704 : il manque 2 paires de BK-RUN-42 (4 reçues pour 6 annoncées). Le colis de BK-TRL-41 est arrivé mouillé : nous l'acceptons sous réserve. »", "note": "Attendu : le lot (ou le BL), la référence et la quantité manquante en chiffres, la référence au carton abîmé."},
            "Le chauffeur est pressé": {"pistes": [
                "Je compte d'abord : une signature sans réserve vaut « livraison complète ».",
                "Je peux compter vite (colis par colis) et écrire mes réserves devant lui."]},
        }),
)


# --------------------------------------------------------------------------------------- Spartoo ENT-1.2
# Ni seuil, ni stock maximum, ni reliquat, ni rupture (questions des étapes 5 et 6) ; rien sur ce que fait la
# validation au stock (étape 5) ni sur le caractère qui commence une commande (étape 3).
FEUILLES['ENT-1.2'] = dict(
    titre='Le cours : préparer une commande et réapprovisionner',
    competence='Compétence C2.2 — Optimiser les préparations de commandes en fonction des demandes',
    essentiel=[
        ("Avant de préparer, on relève le stock {} de chaque ligne.", 'réel'),
        ("On prélève les articles dans l'ordre des {} pour parcourir moins de chemin.", 'emplacements'),
        ("Une réponse à un client donne l'information demandée en {}.", 'chiffres'),
        ("Une commande au fournisseur précise chaque référence et sa {}.", 'quantité'),
    ],
    mots=['Bon de préparation (BP)', 'Emplacement de stockage', 'Minimum de commande', 'Délai de livraison',
          'Réapprovisionner', 'Fournisseur', 'Mouvement de stock', 'Stock du système'],
    activite=dict(
        titre='Réapprovisionner le fournisseur Kicks',
        situation="Kicks (fournisseur inventé pour l'exercice) impose un minimum de commande de 20 paires. On commande "
                  "les références dont le stock est sous le seuil, pour les amener à leur stock maximum.",
        blocs=[
            ('tableau', ['Référence', 'Stock', 'Seuil', 'Stock maximum', 'Sous le seuil ?', 'À commander'],
             [2.8, 2.0, 2.0, 3.0, 3.2, 4.0], [['KX-01', '2', '5', '15'], ['KX-02', '8', '6', '14'], ['KX-03', '3', '6', '12']], 1.0),
            ('faits', ["Total commandé", "Le minimum de commande est-il atteint ?"]),
            ('questions', [("Écris ta commande au fournisseur, en deux lignes.", 2)]),
            ('reflechir', ["Si le minimum de commande était de 30 paires, que ferais-tu ? Explique."]),
        ],
        corrige={
            "T: Référence | Stock | Seuil | Stock maximum | Sous le seuil ? | À commander": {"lignes": [
                ["KX-01", "2", "5", "15", "oui", "13 (15 − 2)"],
                ["KX-02", "8", "6", "14", "non", "0"],
                ["KX-03", "3", "6", "12", "oui", "9 (12 − 3)"],
            ]},
            "Total commandé": {"rep": "22 paires (13 + 9)."},
            "Le minimum de commande est-il atteint": {"rep": "Oui : 22 ≥ 20."},
            "Écris ta commande au fournisseur": {"rep": "« Bonjour, merci de nous livrer : KX-01, 13 paires ; KX-03, 9 paires. »", "note": "Attendu : chaque référence avec sa quantité, en chiffres (KX-01 : 13 ; KX-03 : 9)."},
            "Si le minimum de commande était de 30 paires": {"pistes": [
                "Ajouter KX-02 jusqu'à son maximum (6 paires) : 28, toujours sous 30.",
                "Pour atteindre 30, il faudrait dépasser un stock maximum : on peut le faire en le disant, ou attendre une commande plus grosse.",
                "Toute réponse qui pèse les deux règles l'une contre l'autre."]},
        }),
)

# --------------------------------------------------------------------------------------- Spartoo ENT-1.3
# Ni numéro de lot, ni « tracer » (étape 1) ; rien sur la différence stock total / reste du lot (étape 5).
FEUILLES['ENT-1.3'] = dict(
    titre="Le cours : remonter la trace d'un lot",
    competence='Compétence C3.2 — Mettre en œuvre le processus de traçabilité dans la chaîne logistique',
    essentiel=[
        ("En cas de défaut, on ne rappelle pas toute la production : seulement le {} concerné.", 'lot'),
        ("Ce qui reste d'un lot = ce qui est entré − ce qui est {}.", 'sorti'),
        ("On bloque seulement le reste du lot, pas tout le stock de la {}.", 'référence'),
        ("Un blocage s'annonce par écrit, avec les {} des commandes concernées.", 'numéros'),
    ],
    mots=['Rappel de produit', 'Amont', 'Aval', 'Blocage qualité', 'Compte rendu', 'Fournisseur',
          'Mouvement de stock', 'Stock du système'],
    activite=dict(
        titre='Le lot LOT-AD-1203',
        situation="Un fabricant (inventé pour l'exercice) signale un défaut sur le lot LOT-AD-1203. Voici ce que donne "
                  "le logiciel pour ce lot.",
        blocs=[
            ('liste', 'Entrées du lot :', ["AD-A : 10 paires · AD-B : 8 paires · AD-C : 6 paires."]),
            ('liste', 'Sorties du lot :', [
                "CMD-1201 (Mme Roux) : AD-A, 2 paires ;",
                "CMD-1207 (M. Petit) : AD-B, 3 paires, et AD-A, 1 paire ;",
                "CMD-1215 (Mme Garnier) : AD-C, 2 paires."]),
            ('tableau', ['Référence', 'Entré avec le lot', 'Déjà sorti', 'Reste à bloquer'], [4.0, 4.2, 4.2, 4.6],
             [['AD-A'], ['AD-B'], ['AD-C']], 0.95),
            ('faits', ["Combien de clients ont reçu des paires du lot ?", "Total à bloquer",
                       "Le stock total de AD-A est de 15 paires. Combien restent vendables après le blocage ?"]),
            ('reflechir', ["Pour aller plus vite, un collègue propose de bloquer tout le stock des trois références. "
                           "Qu'en penses-tu ?"]),
        ],
        corrige={
            "T: Référence | Entré avec le lot | Déjà sorti | Reste à bloquer": {"lignes": [
                ["AD-A", "10", "3 (2 + 1)", "7"], ["AD-B", "8", "3", "5"], ["AD-C", "6", "2", "4"],
            ]},
            "Combien de clients ont reçu des paires du lot": {"rep": "3 (Mme Roux, M. Petit, Mme Garnier)."},
            "Total à bloquer": {"rep": "16 paires (7 + 5 + 4)."},
            "Le stock total de AD-A est de 15 paires": {"rep": "8 paires (15 − 7) : elles viennent d'un autre lot."},
            "Pour aller plus vite, un collègue propose": {"pistes": [
                "On bloquerait aussi des paires saines, venues d'autres livraisons : des ventes perdues pour rien.",
                "C'est plus simple, mais le numéro de lot sert justement à ne bloquer que ce qui est en cause."]},
        }),
)


def verifier():
    """Garde-fous : chaque mot de lexique existe ; chaque trou porte exactement un « {} » ; la banque n'a pas deux
    fois le même mot dans une feuille ; les calculs des activités tombent juste."""
    for code, f in FEUILLES.items():
        mots = [LEXIQUE[m][1] for m in f['mots']] + [m for _, m in f['essentiel']]
        assert all(m in LEXIQUE for m in f['mots']), code
        assert all(LEXIQUE[m][0].count('{}') == 1 for m in f['mots']), code
        assert all(p.count('{}') == 1 for p, _ in f['essentiel']), code
        assert len(mots) == len(set(mots)), (code, sorted(m for m in mots if mots.count(m) > 1))
    assert 12 + 20 - 5 - 8 + 1 - 2 == 18
    assert 4 * 2 * 5 - 2 == 38
    assert abs(-18.0 + 20 * 0.2 - (-14.0)) < 1e-9
    assert 60 + 90 + 70 + 140 + 85 == 445 and 445 - 330 == 115
    assert [x for x in (60, 90, 70, 140, 85) if x >= 115] == [140]
    assert 18 / 30 * 60 == 36 and 9 * 60 + 16 == 8 * 60 + 36 + 40
    assert 6 / 15 * 60 + 2 * 5 == 34 and 4.5 / 15 * 60 == 18
    assert 40 + 55 + 30 + 25 + 60 == 210 and 40 + 55 + 30 + 25 == 150 and 12 / 15 * 60 == 48
    assert 5 + 5 == 10 and 6 - 4 == 2
    assert 15 - 2 == 13 and 12 - 3 == 9 and 13 + 9 == 22 >= 20 and 22 + 6 == 28
    assert (10 - 3) + (8 - 3) + (6 - 2) == 16 and 15 - 7 == 8
    assert round(6 / (40 + 15 + 8 + 12 + 6) * 100, 1) == 7.4
    assert round(3 * 19.90, 2) == 59.70 and round(2 * 24.90, 2) == 49.80
