# -*- coding: utf-8 -*-
"""Réponses attendues de toutes les questions des trames élèves (hors QCM, qui portent leur propre corrigé).

Écrit le 02/10/2026. Les générateurs `trame-*.py` recensent chaque question de leur trame, puis cherchent
ici sa réponse : une question sans réponse fait ÉCHOUER le générateur, pour que le corrigé de l'espace
enseignant couvre toujours toute la trame.

Clé = début du texte de la question (ou « T: » + en-têtes pour un tableau).
Contenu :
  rep      réponse attendue (fait, question courte)
  pistes   liste de pistes (question « Pour réfléchir » : pas de bonne réponse unique)
  lignes   tableau : liste de lignes attendues (mêmes colonnes que la trame)
  modele   message modèle (brouillon) ; criteres = ce que le message doit contenir
  note     précision pour l'enseignant (variation selon l'élève, source, réserve)

Les nombres du logiciel (stocks, lots, commandes) sont calculés à partir des données du dépôt
(contenus/spartoo*.js, contenus/boost*.js) ; ceux des recherches Internet sont sourcés dans `note`.
"""

# --------------------------------------------------------------------------------- ENT-1.1
ENT_1_1 = {
 "En quelle année Spartoo": {"rep": "2006.", "note": "Source : Wikipédia (« Spartoo ») et dossier de presse Spartoo. Relevé le 02/10/2026 : à revérifier, une page Internet peut changer."},
 "Dans quelle ville se trouve son siège": {"rep": "Grenoble.", "note": "Source : Wikipédia (« Spartoo »), dossier de presse Spartoo et annuaire d'entreprises. Relevé le 02/10/2026."},
 "Que vend Spartoo": {"rep": "Des chaussures, et aussi des sacs, du prêt-à-porter et des objets de décoration (le site se présente en quatre univers : chaussures, sacs, prêt-à-porter, maison et décoration). Accepter « des chaussures en ligne ».", "note": "Source : Wikipédia, dossier de presse Spartoo."},
 "Spartoo fabrique-t-elle": {"rep": "Non. Spartoo est un distributeur : elle achète les chaussures à des marques (ses fournisseurs : Nike, adidas, Puma…) et les revend.", "note": "Dossier de presse : plus de 10 000 marques au catalogue. Dans l'outil, les fournisseurs sont des marques (F001 Nike, F002 adidas, F003 Puma…)."},
 "Pour une entreprise qui vend en ligne": {"pistes": [
   "Le client ne voit jamais l'entrepôt : ce qu'il juge, c'est de recevoir la bonne chaussure, au bon moment, en bon état. Si la logistique échoue, le beau site ne sert à rien.",
   "Le stock, la préparation et l'expédition sont l'essentiel du service : une erreur de référence, une rupture non vue ou un retard coûte une vente, un retour et parfois un client.",
   "Accepter toute idée liée à la livraison, à la disponibilité des produits ou à la satisfaction du client."]},
 "Qu'est-ce qu'un bon de livraison": {"rep": "Le document qui accompagne une marchandise expédiée : il liste ce que le fournisseur annonce avoir envoyé (références, quantités), avec la date, le transporteur et le destinataire.", "note": "Il annonce l'envoi, il ne prouve pas ce qui est réellement arrivé : c'est tout l'objet du contrôle à réception."},
 "Qui rédige le bon de livraison": {"rep": "L'expéditeur, c'est-à-dire le fournisseur (ici Puma). Le destinataire le signe à la réception et y porte ses éventuelles réserves.", "note": "Accepter « le fournisseur / le vendeur / l'expéditeur »."},
 "Que veut dire « émettre des réserves »": {"rep": "Écrire sur le bon de livraison, au moment de la réception, ce qui ne va pas (colis manquant, quantité différente, carton abîmé), avant de signer. Cela garde la preuve du problème et protège le droit de se plaindre.", "note": "Les réserves doivent être précises (quels articles, combien, quel dommage). Écrire « sous réserve de déballage » seul ne suffit pas."},
 "De combien de jours dispose-t-on": {"rep": "3 jours (hors jours fériés) pour confirmer ses réserves au transporteur, par écrit (lettre recommandée ou équivalent).", "note": "Source : article L133-3 du Code de commerce (transport). Attention : dans l'exercice, Puma demande ses propres réserves « sous 48 heures » : c'est le délai du fournisseur, pas le délai légal vis-à-vis du transporteur."},
 "À ton avis, que risque une entreprise": {"pistes": [
   "Elle ne pourra plus prouver qu'il manquait des paires : le bon signé dit que tout est arrivé.",
   "Elle paiera peut-être des paires qu'elle n'a jamais reçues, ou perdra l'argent de la marchandise abîmée.",
   "Son stock informatique sera faux (il y aura des paires en théorie, pas en vrai), donc des commandes clients impossibles à préparer.",
 ]},
 "Dans quels deux cas une ligne": {"rep": "(1) Quand il y a un écart de quantité (compté différent d'annoncé). (2) Quand le carton est endommagé.", "note": "Message de M. Morin, règle n° 4 : « écart de quantité OU carton endommagé »."},
 "Dans quel cas seulement peut-on refuser": {"rep": "Seulement si la marchandise est inutilisable.", "note": "Règle n° 4 de M. Morin."},
 "À quoi sert le numéro de lot": {"rep": "À retrouver plus tard d'où vient une paire et chez qui elle est partie (traçabilité). Sans lot, pas de traçabilité.", "note": "Règle n° 5 de M. Morin."},
 "Quelle règle de M. Morin te paraît": {"pistes": [
   "Aucune règle n'est « la bonne » : l'élève doit choisir et expliquer pourquoi.",
   "Réponses fréquentes : compter colis par colis quand le quai est encombré ou que le transporteur est pressé ; refuser de signer tout de suite sous la pression du livreur ; recopier le lot sans erreur.",
   "Valoriser une justification liée à une situation réelle de quai (temps, pression, fatigue).",
 ]},
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Numéro du bon de livraison", "BL-77421"],
   ["Date d'expédition", "La date affichée sur le bon : 2 jours avant l'ouverture de la séance (elle change selon le jour où l'élève travaille)."],
   ["Transporteur", "Geodis (tournée 14)"],
   ["Numéro de lot", "LOT-PM-2609"],
   ["Nombre total de paires annoncées", "26 (12 + 8 + 6)"],
 ], "note": "Le numéro de lot doit être recopié avec ses tirets et sans espace : c'est ce que le suivi contrôle."},
 "T: Référence article | Article | Quantité annoncée": {"lignes": [
   ["PM-SUE-RG-39", "Puma Suede Classic XXI, rouge, pointure 39", "12"],
   ["PM-SUE-MA-41", "Puma Suede Classic XXI, bleu marine, pointure 41", "8"],
   ["PM-RSX-BL-42", "Puma RS-X, blanc, pointure 42", "6"],
 ]},
 "Qu'est-ce qui pourrait arriver si tu te trompais": {"pistes": [
   "Le lot ne serait plus retrouvé dans la base : en cas de rappel qualité, impossible de dire quelles paires et quels clients sont concernés.",
   "Le fournisseur ne saurait pas de quelle livraison on parle dans ton message de réserves.",
   "Un seul caractère faux suffit : le logiciel traite « LOT-PM-2609 » et « LOT-PM-2690 » comme deux lots différents.",
 ]},
 "T: Référence article | Colis concernés | Quantité comptée | Quantité annoncée | Écart": {"lignes": [
   ["PM-SUE-RG-39", "colis 1 et 2", "12", "12", "0"],
   ["PM-SUE-MA-41", "colis 3 et 4", "6", "8", "−2 (il manque 2 paires)"],
   ["PM-RSX-BL-42", "colis 5", "6", "6", "0 (mais carton endommagé)"],
 ], "note": "Colis : n° 1 = 6 paires RG-39, n° 2 = 6 RG-39, n° 3 = 4 MA-41, n° 4 = 2 MA-41, n° 5 = 6 BL-42 (carton enfoncé)."},
 "Sur quelle référence y a-t-il un écart": {"rep": "PM-SUE-MA-41."},
 "De combien de paires est cet écart": {"rep": "2 paires (8 annoncées, 6 comptées)."},
 "Quelle référence est arrivée dans un carton": {"rep": "PM-RSX-BL-42 (colis n° 5)."},
 "Un carton endommagé veut-il forcément": {"pistes": [
   "Non : un carton enfoncé peut protéger une marchandise intacte, ou au contraire l'avoir laissée se casser. Il faut ouvrir et vérifier.",
   "Mais on ne peut pas le savoir sur le quai : c'est pour cela qu'on accepte « sous réserve » et qu'on prévient le fournisseur.",
 ]},
 "T: Référence article | Annoncé | Compté | État des colis | Décision": {"lignes": [
   ["PM-SUE-RG-39", "12", "12", "conforme", "accepté"],
   ["PM-SUE-MA-41", "8", "6", "conforme", "accepté sous réserve"],
   ["PM-RSX-BL-42", "6", "6", "colis endommagé", "accepté sous réserve"],
 ], "note": "Numéro de lot saisi : LOT-PM-2609. Attendu par le suivi (jalon « contrôle »)."},
 "Pourquoi accepte-t-on quand même une ligne": {"pistes": [
   "Les paires reçues sont utilisables : les refuser bloquerait la vente de marchandise bonne.",
   "On ne refuse que si la marchandise est inutilisable (règle de M. Morin). On entre ce qui est là en stock, et on signale l'écart au fournisseur le jour même.",
 ]},
 "Que se passerait-il, pour l'inventaire": {"pistes": [
   "Le stock informatique serait plus grand que le stock réel (2 paires fantômes) : à l'inventaire, un écart inexplicable.",
   "Un client pourrait commander une paire que l'on n'a pas, donc une rupture découverte trop tard.",
 ]},
 "Combien de paires, au total, sont entrées": {"rep": "24 paires (12 + 6 + 6). Les trois lignes sont acceptées, deux sous réserve."},
 "Quel type de mouvement apparaît": {"rep": "« Entrée : réception ».", "note": "Type tel qu'écrit dans .movements pour les entrées de la réception."},
 "Quel fournisseur .getlot associe": {"rep": "Puma (F003)."},
 "Pourquoi la ligne « Sorties »": {"rep": "Parce qu'aucune commande n'a encore été préparée avec des paires de ce lot : tout ce qui est entré est encore en stock.", "note": "Le logiciel affiche « Aucune sortie : tout le lot est encore en stock »."},
 "En quoi le numéro de lot sera-t-il utile": {"pistes": [
   "Il permet de retrouver tout ce qui est venu avec cette livraison : où sont les paires en stock, et chez quels clients elles sont déjà parties.",
   "Sans lot, il faudrait contrôler toutes les paires de la référence, y compris celles qui viennent d'autres livraisons, sans défaut.",
   "Rappel : c'est le sujet de la séance de traçabilité (ENT-1.3).",
 ]},
 "Brouillon de ton message à Puma": {"modele": "Bonjour,\n\nNous avons réceptionné ce jour la livraison correspondant au bon de livraison BL-77421, lot LOT-PM-2609, réception REC-04127. Nous émettons les réserves suivantes :\n\n- PM-SUE-MA-41 : 8 paires annoncées, 6 reçues, il manque 2 paires ;\n- PM-RSX-BL-42 : 6 paires reçues dans un carton endommagé (carton enfoncé), l'état des paires reste à vérifier.\n\nMerci de nous indiquer la suite que vous donnez à ces réserves (envoi complémentaire ou avoir).\n\nCordialement,\n[prénom], service logistique, Spartoo",
   "criteres": ["Numéro de lot LOT-PM-2609 présent (c'est ce que contrôle le jalon).", "Quantité manquante écrite en chiffres (2) avec la référence PM-SUE-MA-41.", "Colis endommagé signalé avec sa référence PM-RSX-BL-42.", "Formules de politesse, signature, ton professionnel.", "Bonus : n° de bon de livraison (BL-77421) et de réception (REC-04127), demande d'une suite (envoi complémentaire ou avoir)."]},
 "Quelles informations un fournisseur": {"rep": "Le numéro de lot (et du bon de livraison), les références concernées, la nature du problème (manquant ou abîmé), les quantités exactes, et la date de réception.", "note": "Toute réponse qui permet au fournisseur d'identifier la livraison et le défaut est acceptée."},
 "Pourquoi faut-il écrire au fournisseur le jour même": {"pistes": [
   "Les délais de réserve sont courts (3 jours pour le transporteur, 48 h demandées par Puma dans l'exercice) : passé ce délai, on peut perdre ses droits.",
   "Plus on attend, plus il est facile au fournisseur de dire que le dommage s'est produit chez nous.",
 ]},
 "Qu'aurait-il fallu faire, en plus": {"pistes": [
   "Refuser la ligne (marchandise inutilisable) : ne pas l'entrer en stock.",
   "Prévenir le fournisseur et demander un remplacement ou un avoir ; garder les paires en zone séparée en attendant sa réponse.",
 ]},
}

# --------------------------------------------------------------------------------- ENT-1.2
ENT_1_2 = {
 "Combien de messages non lus": {"rep": "3 ou 4 : « Bienvenue chez Spartoo » (reçu en ENT-1.1) si elle n'a pas été ouverte, « Question sur les Stan Smith blanches », « Nouvelle commande web n° CMD-048213 », et la réponse de Puma aux réserves d'ENT-1.1 si l'élève ne l'a pas encore ouverte.", "note": "Vérifié le 02/10/2026 en jouant ENT-1.1 puis ENT-1.2 : 3 non lus si la réponse de Puma a été ouverte, 4 sinon. Un élève qui a déjà ouvert « Bienvenue » en a moins. Contrôler sur son écran. Sur une base neuve sans ENT-1.1 : 2 (la bienvenue arrive en ENT-1.1)."},
 "Combien de paires y a-t-il en stock": {"rep": "4 593 paires (4 569 au départ + les 24 paires réceptionnées en ENT-1.1).", "note": "Vérifié le 02/10/2026 en jouant ENT-1.1 puis ENT-1.2. Les séances se font dans l'ordre : le total suppose la réception d'ENT-1.1 validée comme attendu (24 paires). Un élève qui n'a pas fait ENT-1.1 lit 4 569."},
 "Combien de références sont en rupture": {"rep": "47 références en rupture (stock à 0).", "note": "Valeur de la tuile « références en rupture » de l'accueil. La réception d'ENT-1.1 ne change pas ce nombre (elle n'entre aucune référence en rupture)."},
 "Parmi ces trois chiffres": {"pistes": [
   "Les ruptures : elles empêchent de servir un client, donc elles sont à traiter en premier.",
   "On peut aussi défendre les messages non lus (une commande ou une question attend) : accepter si c'est justifié.",
   "Le stock total seul ne dit pas ce qui manque : il rassure à tort.",
 ]},
 "Combien de fournisseurs sont référencés": {"rep": "10 (F001 à F010).", "note": "Peut être plus si l'élève en a ajouté avec .addsupplier."},
 "T: Code | Marque fournisseur": {"lignes": [["F001", "Nike"], ["F002", "adidas"], ["F003", "Puma"]], "note": "N'importe quels trois parmi : F001 Nike, F002 adidas, F003 Puma, F004 New Balance, F005 Converse, F006 Vans, F007 ASICS, F008 Reebok, F009 Skechers, F010 Timberland."},
 "Choisis un de ces fournisseurs : quel est son délai": {"rep": "Selon le fournisseur choisi : Nike 3 j, adidas 4 j, Puma 4 j, New Balance 5 j, Converse 6 j, Vans 5 j, ASICS 4 j, Reebok 5 j, Skechers 3 j, Timberland 6 j."},
 "Quel est son minimum de commande": {"rep": "Selon le fournisseur : Nike 24 paires, adidas 20, Puma 20, New Balance 24, Converse 16, Vans 16, ASICS 20, Reebok 16, Skechers 12, Timberland 24."},
 "Les clients de Spartoo sont-ils": {"rep": "Des particuliers.", "note": "Les 32 clients ont un prénom, un nom, une adresse personnelle et une ville : ce sont des personnes, pas des sociétés."},
 "T: Code | Nom | Ville": {"lignes": [["C0001", "Camille Thomas", "Lille"], ["C0002", "Lucas Laurent", "Rennes"]], "note": "N'importe quels deux parmi les 32 clients (C0001 à C0032)."},
 "Qu'as-tu observé dans l'écran Clients": {"pistes": [
   "Les clients ont un prénom et un nom (pas un nom de société), une adresse de particulier (rue, ville), un e-mail personnel.",
   "On ne trouve ni raison sociale, ni SIRET, ni numéro de TVA : indices d'un client particulier (B2C).",
 ]},
 "Dans une entreprise, pourquoi garde-t-on": {"pistes": [
   "Le délai de livraison dit quand recommander : il faut commander assez tôt pour ne pas être en rupture avant l'arrivée.",
   "Le minimum de commande dit combien il faut commander au moins : on regroupe plusieurs références pour l'atteindre.",
   "Garder ces informations évite d'avoir à les redemander au fournisseur à chaque commande.",
 ]},
 "Par quel caractère commence toujours": {"rep": "Par un point (« . »).", "note": "Message de la console : « Une commande commence par un point. »"},
 "T: Commande | Ce qu'elle fait": {"lignes": [
   [".getstock <réf>", "Donne le stock d'une référence article ou d'un modèle."],
   [".getprice <réf>", "Donne le prix de vente et le prix d'achat."],
   [".getsupplier <code ou marque>", "Affiche la fiche d'un fournisseur."],
 ], "note": "Toute commande de la liste de .help est acceptée : .find, .getproduct, .getlocation, .lowstock, .stockvalue, .getclient, .getorder, .movements, .getlot, .setstock, .addstock, .removestock, .addclient, .addsupplier, .clear."},
 "Avec .getprice PM-SUE, quel est le prix de vente": {"rep": "89,99 € TTC.", "note": "Puma Suede Classic XXI."},
 "Avec .getprice PM-SUE, quel est le prix d'achat": {"rep": "41,00 € HT.", "note": "Prix de vente HT : 74,99 €, marge brute 33,99 € (45 %)."},
 "Avec .getsupplier Puma": {"rep": "4 jours.", "note": "Minimum de commande Puma : 20 paires ; franco 1 000 €."},
 "Parmi les commandes que tu viens d'essayer": {"pistes": [
   ".getstock : elle répond à la question qui revient tout le temps (« combien en reste-t-il ? »).",
   ".lowstock ou .getprice peuvent aussi être défendues. L'important est la justification liée au métier d'un responsable de stock.",
 ]},
 "Quel est l'objet du message de Léa Dubois": {"rep": "« Question sur les Stan Smith blanches »."},
 "Que demande-t-elle exactement": {"rep": "Si Spartoo a des Stan Smith blanches en pointure 44 en stock, et combien de paires."},
 "T: Marque | Modèle | Couleur | Pointure": {"lignes": [["adidas", "Stan Smith", "Blanc", "44"]]},
 "Quelle est la référence article complète": {"rep": "AD-STS-BL-44 (adidas, Stan Smith, blanc, pointure 44)."},
 "Quelle commande de la console permet": {"rep": ".getstock AD-STS-BL-44 (ou .getstock suivi de la référence)."},
 "Combien de paires sont disponibles": {"rep": "3 paires.", "note": "Valeur de départ du catalogue. C'est ce nombre, écrit en chiffres, que le jalon cherche dans la réponse de l'élève."},
 "Brouillon de ta réponse à Léa Dubois": {"modele": "Bonjour Madame,\n\nMerci pour votre message. Nous avons actuellement 3 paires de Stan Smith blanches en pointure 44 en stock.\n\nN'hésitez pas à nous contacter pour toute autre question.\n\nCordialement,\n[prénom]\nService logistique, Spartoo",
   "criteres": ["Le nombre de paires écrit en CHIFFRES (3) : c'est ce que vérifie le suivi.", "Formule de politesse au début et à la fin.", "Information claire en une lecture : combien, quel article, quelle pointure.", "Signature (prénom, service).", "Orthographe soignée, phrases complètes, pas d'abréviations."]},
 "Pourquoi ces attentes sont-elles importantes": {"pistes": [
   "Un message professionnel donne une bonne image de l'entreprise : le client est un client potentiel.",
   "Un message clair évite les allers-retours, donc fait gagner du temps aux deux côtés.",
   "L'information chiffrée évite les malentendus (« quelques paires » ne dit pas combien).",
 ]},
 "Si le stock avait été de zéro paire": {"pistes": [
   "Dire honnêtement qu'il n'y en a plus (« 0 paire » écrit en chiffres).",
   "Proposer une suite : une autre couleur ou pointure, ou une date de réapprovisionnement (4 jours chez adidas), et prévenir le client.",
 ]},
 "T: Référence | Stock trouvé | Emplacement | À préparer | Statut": {"lignes": [
   ["NK-AM270-NR-42", "8", "B-01-1", "1", "Complet"],
   ["AD-STS-BL-41", "1", "B-04-1", "1", "Partiel"],
   ["PM-SUE-NR-40", "0", "B-06-1", "0", "Rupture"],
 ], "note": "Commande CMD-048213 : commandé 1 + 2 + 1. Statut attendu = Complet si stock ≥ commandé, Partiel si 0 < stock < commandé, Rupture si stock = 0. Quantité à préparer = min(commandé, stock). Tout est contrôlé par le jalon « commande »."},
 "Combien de références (lignes)": {"rep": "3 lignes (NK-AM270-NR-42, AD-STS-BL-41, PM-SUE-NR-40)."},
 "Pour quelle ligne la quantité à préparer": {"rep": "AD-STS-BL-41 (2 commandées, 1 en stock : préparée à 1) et PM-SUE-NR-40 (1 commandée, 0 en stock : préparée à 0)."},
 "Que veut dire le statut « Rupture »": {"rep": "Qu'il n'y a plus aucune paire en stock pour cette référence : on ne peut rien préparer pour cette ligne (à préparer = 0)."},
 "Que dois-tu faire lorsque tu es en rupture": {"rep": "Mettre 0 à préparer et le statut « Rupture », valider la préparation (la ligne part en reliquat), et prévenir le client / prévoir de réapprovisionner (c'est l'étape 6)."},
 "Qu'appelle-t-on un « reliquat »": {"rep": "La partie d'une commande qui n'a pas pu être préparée faute de stock (ici 1 paire d'AD-STS-BL-41 et 1 paire de PM-SUE-NR-40) : elle sera livrée plus tard, quand le stock sera revenu."},
 "Que se passe-t-il exactement dans le stock": {"rep": "Le stock diminue des quantités préparées et les mouvements de sortie sont enregistrés : NK-AM270-NR-42 passe de 8 à 7, AD-STS-BL-41 de 1 à 0, PM-SUE-NR-40 reste à 0.", "note": "Type de mouvement : « Sortie : préparation » (bon de préparation BP-048213)."},
 "Pour la ligne où tu ne peux pas tout préparer": {"pistes": [
   "Parce qu'il n'y a pas assez de paires en stock : on ne peut pas préparer ce qu'on n'a pas.",
   "La quantité commandée est ce que le client veut, la quantité préparée est ce qui existe réellement ; la différence devient le reliquat.",
 ]},
 "Que dirais-tu à un client dont une ligne": {"pistes": [
   "Lui dire clairement qu'une partie de sa commande part tout de suite et le reste plus tard, avec une date si possible.",
   "S'excuser, proposer une alternative ou un remboursement de la ligne manquante s'il ne veut pas attendre.",
 ]},
 "Pourquoi relever le stock réel avant de préparer": {"pistes": [
   "La commande dit ce que le client veut, pas ce qu'il y a en stock : il faut aller voir pour ne pas promettre ce qu'on n'a pas.",
   "Se fier à la quantité commandée ferait un stock négatif ou une ligne marquée préparée alors que les paires n'existent pas.",
 ]},
 "T: Référence | Stock actuel | Seuil | Stock maximum | Quantité à commander": {"lignes": [
   ["PM-SUE-NR-40", "0", "4", "12", "12 (12 − 0)"],
   ["PM-SUE-NR-36 (exemple de 2e référence)", "0", "4", "12", "12 (12 − 0)"],
 ], "note": "Total 24 paires ≥ minimum de Puma (20) : atteint. Une seule ligne (12) n'atteint pas le minimum. Autres choix valables, tous en rupture ou sous le seuil : PM-SUE-RG-36 (12), PM-RSX-GR-41 (13), PM-RSX-GR-43 (13), PM-RSX-BL-45 (stock 2 → 11), PM-SUE-RG-42 (stock 4 → 8), PM-RSX-GR-46 (stock 4 → 9). Le suivi vérifie : quantité = stock maximum − stock actuel, PM-SUE-NR-40 présent, total ≥ 20."},
 "Qu'est-ce que le « seuil »": {"rep": "Le niveau de stock en dessous (ou à) duquel il faut réapprovisionner : un signal d'alerte (ici 4 paires pour PM-SUE)."},
 "Quelle est la différence entre le seuil": {"rep": "Le seuil est le minimum qui déclenche une commande ; le stock maximum est le niveau à ne pas dépasser (place, argent immobilisé). On commande pour revenir au maximum, pas au seuil."},
 "Dans la liste des destinataires": {"rep": "Au nom de la marque (Puma) et à son code F003 / son adresse e-mail (b2b@puma-pro.example), qui correspondent à la référence PM-SUE-NR-40 (fournisseur indiqué sur la fiche produit)."},
 "As-tu dû ajouter une deuxième référence": {"rep": "Oui : PM-SUE-NR-40 seule donne 12 paires, le minimum de Puma est 20.", "note": "Si l'élève répond non, il a probablement commandé plus que le maximum (le suivi le signale : quantité ≠ maximum − stock)."},
 "Pourquoi une entreprise se fixe-t-elle un stock maximum": {"pistes": [
   "Stocker coûte : place, argent immobilisé, risque d'invendus ou de démarque.",
   "Le seuil dit quand commander, le maximum dit combien : sans lui on commanderait au hasard.",
 ]},
 "Pourquoi un fournisseur impose-t-il un minimum": {"pistes": [
   "Préparer et expédier une commande a un coût fixe : une commande trop petite ne serait pas rentable pour lui.",
   "C'est une clause du contrat : en commandant, l'entreprise l'accepte.",
 ]},
 "Si tu as ajouté une référence": {"pistes": [
   "Critère attendu : une référence du même fournisseur en rupture ou sous son seuil, pour ne pas commander ce qui n'est pas nécessaire.",
   "Valoriser aussi : une référence qui se vend bien, ou qui permet de dépasser le minimum sans dépasser le maximum.",
 ]},
}

# --------------------------------------------------------------------------------- ENT-1.3
ENT_1_3 = {
 "Qu'est-ce qu'un numéro de lot": {"rep": "Un code qui identifie un groupe d'articles fabriqués ou expédiés ensemble, dans les mêmes conditions (même date, même production).", "note": "Ex. du cours : LOT-PM-2609."},
 "Qui attribue le numéro de lot": {"rep": "Le fabricant (ou le fournisseur : ici Puma), qui l'indique sur ses produits et sur le bon de livraison. Le destinataire le recopie, il ne l'invente pas."},
 "Que veut dire « tracer »": {"rep": "Pouvoir retrouver l'historique d'un produit : d'où il vient (amont) et où il est parti (aval), à l'aide d'identifiants comme le numéro de lot."},
 "Dans un rappel de produit que tu as trouvé": {"rep": "Selon la fiche choisie (RappelConso) : le produit (nom, marque, référence), le lot concerné, le motif et le risque, les lieux et dates de vente, ce que le client doit faire (arrêter de l'utiliser, le rapporter, être remboursé) et un contact.", "note": "Source : fiches du site officiel RappelConso (rappel.conso.gouv.fr), consultées le 02/10/2026. Tout rappel réel est accepté s'il est décrit."},
 "Si une entreprise ne sait pas dans quel lot": {"pistes": [
   "Elle doit rappeler ou bloquer toutes les paires de la référence, ou de toute la période, sans savoir lesquelles sont défectueuses.",
   "Elle doit prévenir tous ses clients ayant acheté ce produit, faute de pouvoir cibler.",
 ]},
 "Pourquoi cela lui coûte-t-il beaucoup plus cher": {"pistes": [
   "Plus de paires à retirer, plus de clients à prévenir et à rembourser, plus de temps de travail.",
   "Image de l'entreprise abîmée et risque juridique plus grand si un client est blessé.",
 ]},
 "T: Information | Ce que tu relèves": None,   # géré plus bas : deux tableaux portent cet intitulé, voir TABLEAUX_PAR_ETAPE
 "Le défaut est-il visible à l'œil nu": {"rep": "Non (« le défaut n'est pas visible à l'œil nu »)."},
 "Quelle conséquence cela a-t-il pour le contrôle": {"pistes": [
   "On ne peut pas le repérer en regardant les chaussures : un contrôle visuel à la réception ne suffit pas.",
   "Il faut donc s'appuyer sur la traçabilité (le numéro de lot) pour isoler ce qui est concerné.",
 ]},
 "Puma écrit que les paires de la même référence": {"pistes": [
   "Le défaut vient d'une production précise : seules les paires du lot LOT-PM-2609 sont concernées.",
   "Les autres paires de la même référence viennent d'autres lots, fabriqués à d'autres moments, donc non défectueux : on les garde vendables. C'est tout l'intérêt de bloquer par lot et non par référence.",
 ]},
 "Pourquoi est-il important de savoir par quelle réception": {"pistes": [
   "La réception donne la date d'entrée, le document de départ (bon de livraison) et la personne qui a contrôlé : on peut rendre compte au fournisseur et retrouver la preuve.",
   "Elle permet de relier le lot au bon de livraison et au contrat avec le fournisseur (responsabilité).",
 ]},
 "T: Référence article | Article | Quantité entrée": {"lignes": [
   ["PM-SUE-RG-39", "Puma Suede Classic XXI, rouge, 39", "12"],
   ["PM-SUE-MA-41", "Puma Suede Classic XXI, bleu marine, 41", "6"],
   ["PM-RSX-BL-42", "Puma RS-X, blanc, 42", "6"],
 ], "note": "Pour un élève qui a validé la réception d'ENT-1.1 comme attendu. Total 24. Un élève sans séance 1 reçoit la réception d'un collègue (REC-04118, Sonia Ferret) avec les mêmes quantités."},
 "Combien de clients différents ont reçu": {"rep": "3 clients : Inès Simon (C0011), Clara Bernard (C0019), Noah Fournier (C0026)."},
 "Sans le numéro de lot, qu'aurait-on été obligé": {"pistes": [
   "Contrôler toutes les commandes contenant ces références, y compris celles qui viennent d'autres lots, pour deviner qui est concerné.",
   "Ou prévenir tous les clients de ces références, sans pouvoir cibler.",
 ]},
 "Pourquoi ces deux nombres sont-ils différents": {"pistes": [
   "Le stock total d'une référence regroupe plusieurs lots (paires arrivées avant, de livraisons sans défaut) ; le « reste du lot » ne compte que les paires de LOT-PM-2609 encore en stock.",
   "Exemples : PM-SUE-RG-39 stock 26, reste du lot 9 ; PM-SUE-MA-41 stock 17, reste 5 ; PM-RSX-BL-42 stock 21, reste 4.",
 ]},
 "Avec .getstock suivi d'une de ces références": {"rep": "PM-SUE-RG-39 : 26 paires ; PM-SUE-MA-41 : 17 ; PM-RSX-BL-42 : 21.", "note": "Départ catalogue 17 / 12 / 17, + entrées du lot (12 / 6 / 6), − sorties (3 / 1 / 2). Valable pour un élève dont la base a suivi ENT-1.1 sans autre mouvement ; sinon lire l'écran."},
 "Combien reste-t-il de paires de ce lot": {"rep": "PM-SUE-RG-39 : 9 ; PM-SUE-MA-41 : 5 ; PM-RSX-BL-42 : 4 (total 18)."},
 "Que se passerait-il si tu bloquais le stock total": {"pistes": [
   "On bloquerait aussi des paires saines venant d'autres lots : elles ne pourraient plus être vendues, donc perte de ventes inutile.",
   "Le logiciel refuse d'ailleurs un blocage supérieur au reste du lot (« Le lot ne contient pas autant de paires de cette référence en stock »).",
 ]},
 "Que vaut maintenant le « Reste en stock »": {"rep": "0 : tout ce qui restait du lot a été bloqué (18 paires)."},
 "Quel type de mouvement apparaît dans le tableau": {"rep": "« Blocage qualité ».", "note": "Dans .getlot, les sorties comptent les ventes (6 paires) puis les blocages (18 paires)."},
 "À quoi sert le motif": {"pistes": [
   "À comprendre plus tard pourquoi ces paires ont quitté le stock : défaut fabricant, et non vente ou casse.",
   "À justifier le mouvement auprès du fournisseur, de l'inventaire et d'un contrôle.",
 ]},
 "Brouillon de ton compte rendu": {"modele": "Bonjour M. Morin,\n\nCompte rendu sur le lot LOT-PM-2609 (fournisseur : Puma).\n\n- Entré en stock le [jj/mm/aaaa : date lue dans .getlot], réception REC-04127.\n- Commandes parties avec des paires de ce lot : CMD-048301, CMD-048307 et CMD-048312.\n- Stock restant bloqué : 9 paires PM-SUE-RG-39, 5 paires PM-SUE-MA-41, 4 paires PM-RSX-BL-42 (total 18), motif : blocage qualité, défaut fabricant.\n\nCordialement,\n[prénom]",
   "criteres": ["Numéro du lot LOT-PM-2609.", "Date d'entrée au format jj/mm/aaaa (date de la réception de l'élève, lue dans .getlot).", "Nom du fournisseur : Puma.", "Les trois numéros de commande au format CMD-000000 : CMD-048301, CMD-048307, CMD-048312.", "Ce qui a été bloqué, référence par référence (9 / 5 / 4)."], "note": "Date et numéro de réception propres à chaque élève. Un élève sans séance 1 a REC-04118 (réception d'un collègue) : lire la base."},
 "Pourquoi le compte rendu doit-il donner les numéros de commande": {"pistes": [
   "Un numéro de commande est unique et se retrouve dans le logiciel et chez Puma ; un nom peut avoir des homonymes ou être mal orthographié.",
   "Puma doit contacter ces clients : le numéro de commande permet de les retrouver sans erreur.",
 ]},
 "Quelle première action Spartoo devra-t-elle mener": {"pistes": [
   "Retrouver la commande du client et vérifier que sa paire vient bien du lot LOT-PM-2609.",
   "Remplacer ou rembourser le client, et ne pas remettre la paire en stock ; informer Puma.",
 ]},
}
# Deux tableaux portent le même intitulé « Information | Ce que tu relèves » en ENT-1.3 (étapes 2 et 3).
TABLEAUX_PAR_ETAPE_1_3 = {
 2: {"lignes": [
   ["Lot concerné", "LOT-PM-2609"],
   ["Fournisseur / expéditeur de l'alerte", "Puma France, B2B — qualité (Marc Oberlé)"],
   ["Nature du défaut", "Collage de la semelle insuffisant sur une partie de la production"],
   ["Ce que Puma demande", "1. ne plus expédier de paires du lot ; 2. indiquer les commandes déjà livrées avec ce lot ; 3. isoler le stock restant"],
 ], "note": "Informations de l'alerte « URGENT — rappel qualité sur le lot LOT-PM-2609 » (lignes exactes à adapter à la fiche imprimée dans la trame)."},
 3: {"lignes": [
   ["Numéro de lot", "LOT-PM-2609"],
   ["Fournisseur", "Puma (F003)"],
   ["Date d'entrée en stock", "La date de la réception de l'élève, au format jj/mm/aaaa (lue dans .getlot, ligne « Entré le »)"],
   ["Numéro de réception", "REC-04127 (REC-04118 pour un élève sans séance 1)"],
   ["Nombre total de paires entrées", "24 paires"],
 ], "note": "Les cinq lignes que demande la trame. .getlot affiche aussi « Sorties : 6 paires » et « Reste en stock : 18 paires » : ces deux nombres servent à l'étape 4 (entrées moins sorties = reste en stock)."},
}
T_1_3_CLIENTS = {"lignes": [
   ["PM-SUE-RG-39", "2", "BP-048301", "CMD-048301", "Inès Simon (C0011)"],
   ["PM-SUE-MA-41", "1", "BP-048307", "CMD-048307", "Clara Bernard (C0019)"],
   ["PM-RSX-BL-42", "2", "BP-048307", "CMD-048307", "Clara Bernard (C0019)"],
   ["PM-SUE-RG-39", "1", "BP-048312", "CMD-048312", "Noah Fournier (C0026)"],
 ], "note": "Total sorti : 6 paires. Tableau rendu par .getlot (colonnes Document, Commande, Client)."}
T_1_3_RESTE = {"lignes": [
   ["PM-SUE-RG-39", "12", "3", "9"],
   ["PM-SUE-MA-41", "6", "1", "5"],
   ["PM-RSX-BL-42", "6", "2", "4"],
 ], "note": "Total à bloquer : 18, égal au « Reste en stock » de .getlot. Le suivi vérifie les blocages référence par référence."}

# --------------------------------------------------------------------------------- ENT-3.1
ENT_3_1 = {
 "Que fait Boost pour ses clients": {"rep": "C'est un logisticien e-commerce : il reçoit et stocke les marchandises de marques, prépare leurs commandes et organise l'expédition vers leurs clients.", "note": "Source : fédération des entreprises d'insertion (article sur Boost) et Voxlog. Relevé le 02/10/2026."},
 "Qu'est-ce qu'un « logisticien e-commerce »": {"rep": "Une entreprise qui prend en charge, pour des boutiques en ligne, le stockage, la préparation des commandes et l'envoi des colis.", "note": "Définition de métier ; vérifiée avec la description de Boost."},
 "Boost est une « entreprise d'insertion »": {"rep": "Elle accueille des personnes éloignées de l'emploi : elles travaillent en étant salariées, retrouvent un rythme de travail, découvrent les métiers de la logistique et sont accompagnées pour ensuite trouver un emploi classique.", "note": "Source : article Voxlog sur Boost (salaires fixes, accompagnement par des conseillers en insertion)."},
 "Cite un avantage d'envoyer les colis en vélo-cargo": {"rep": "Moins de pollution et d'émissions de CO₂ que le camion (vélo-cargo puis train), pas de bruit, plus facile de circuler en centre-ville.", "note": "Accepter tout avantage écologique ou de circulation. Boost s'appuie sur le modèle WePost (vélo-cargo + train) cité comme alternative bas carbone."},
 "Cite une limite de ce mode de transport": {"rep": "Charge limitée (ici 180 kg), vitesse faible (12 km/h en ville), dépendance aux horaires du train, météo, distances courtes.", "note": "L'article Voxlog dit que le transport reste « complexe »."},
 "Boost livre des colis en vélo-cargo": {"pistes": [
   "Un colis lourd ou volumineux : le vélo-cargo est limité en charge (ici 180 kg).",
   "Une livraison urgente ou en dehors des horaires du train : le train fixe l'heure limite, un camion pourrait partir plus tard.",
   "Mauvaise météo ou longue distance en ville. Accepter toute situation justifiée : il n'y a pas une seule réponse.",
 ]},
 "M. Morin demande de situer les clients": {"pistes": [
   "Sans savoir où sont les clients, on ne peut pas organiser un parcours : on ne calcule ni la distance ni le temps.",
   "Les clients ne donnent que le nom de la rue : il faut d'abord les repérer pour décider de l'ordre des arrêts.",
 ]},
 "Pour le client le plus difficile à situer": {"pistes": [
   "Réponse personnelle : méthode attendue = cliquer la ligne du tableau pour faire apparaître le halo du point, lire la colonne puis la ligne du quadrillage, puis lire le nom du quartier dessiné autour du point.",
   "Valoriser les méthodes : zoomer sur le quartier pour lire le nom de la rue, vérifier la case en suivant les lignes du quadrillage, comparer avec les deux cases voisines.",
 ], "note": "Les deux points les plus piégeux : Comptoir des Halles et Atelier Mazet sont tous deux en D2, mais dans des quartiers différents (Écusson et Gambetta) : la case seule ne suffit pas, il faut lire le quartier."},
 "Qu'as-tu vu à l'écran": {"rep": "La jauge « Charge du vélo-cargo » monte à chaque commande chargée et prévient quand la limite de 180 kg est franchie : les sept commandes ne tiennent pas toutes.", "note": "Le total (237 kg) et le dépassement (57 kg) ne sont pas dits à l'élève : il les trouve à l'étape 7."},
 "Pourquoi as-tu laissé CE client à quai": {"pistes": [
   "Le seul choix qui permet de respecter la charge en écartant un seul client est La Pointe Sud (58 kg) : 237 − 58 = 179 kg ≤ 180 kg.",
   "Autre raison valable : c'est le client le plus loin / le plus pénalisant en temps ; ce qui reste à quai partira demain.",
   "Un élève qui écarte un autre client doit en écarter plusieurs ou obtient une charge trop élevée : le faire constater.",
 ]},
 "Qu'est-ce qui rendait ton premier ordre": {"pistes": [
   "Un ordre en zigzag oblige à des allers-retours : plus de kilomètres, donc plus de temps.",
   "Les kilomètres changent à chaque essai ; l'ordre qui enchaîne les clients proches est le plus court.",
 ]},
 "Quel principe as-tu trouvé": {"pistes": [
   "Aller de proche en proche, sans revenir en arrière, en terminant du côté de la gare.",
   "Ordre le plus court calculé (km par les rues de Nîmes) : Maison Lauze → Caveau Pélissier → Épicerie Verdier → Comptoir des Halles → Atelier Mazet → Studio Garance (11,9 km, arrivée 15 h 36). Tout ordre sous 18,8 km tient le train (189 ordres sur 720).",
 ]},
 "Ton poids total est-il": {"rep": "En dessous (ou égal) : 179 kg pour 180 kg maximum, si La Pointe Sud est restée à quai."},
 "Ton heure d'arrivée est-elle": {"rep": "Avant : 15 h 36 pour l'ordre le plus court (11,9 km), le train part à 16 h 10.", "note": "Dépend de l'ordre choisi : tout ordre de moins de 18,8 km tient le train (départ 14 h 00, 6 arrêts de 6 min, 12 km/h)."},
 "Tes formules sont justes, mais une contrainte": {"pistes": [
   "Le logiciel l'a dit : « Le calcul est bon : c'est la tournée qu'il faut revoir ». Les formules sont validées (« juste »), donc l'erreur est dans la tournée.",
   "Les formules mesurent la tournée. Modifier les formules pour « faire passer » le résultat serait tricher avec la réalité.",
 ]},
 "Si le vélo-cargo roulait à 15 km/h": {"pistes": [
   "La vitesse (cellule B12) passerait de 12 à 15 : les étapes 1 et 2 donnent un temps de route plus court (11,9 / 15 = 0,79 h, soit 47,6 min).",
   "L'heure d'arrivée serait plus tôt (≈ 15 h 24 pour l'ordre le plus court) : les formules ne changent pas, seule la donnée change et tout se recalcule.",
 ]},
 "Dans une vraie entreprise, qui prévient": {"pistes": [
   "Le responsable d'exploitation (M. Morin) ou le service client de Boost, qui prévient le client ou la marque cliente.",
   "Accepter « l'exploitant / le service client / le logisticien » avec une justification.",
 ]},
 "Que lui dit-on": {"pistes": [
   "Que la commande est retardée, pourquoi (vélo-cargo plein), et qu'elle partira demain par le train de la même heure.",
   "S'excuser, donner une date de livraison réaliste et proposer un contact en cas de besoin.",
 ]},
 "Si le vélo-cargo pouvait porter 250 kg": {"pistes": [
   "Les sept commandes (237 kg) tiendraient en une fois : plus de client laissé à quai.",
   "Le choix devient uniquement un problème d'ordre, et le temps aux arrêts (7 × 6 = 42 min) et les kilomètres du septième arrêt pèsent davantage : à vérifier face au train (la tournée dans l'ordre de la fiche, à sept arrêts, fait 23,9 km et arrive à 16 h 42 : train manqué).",
 ]},
}
ENT_3_1_TABLEAUX = {
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Heure de départ de l'entrepôt", "14 h 00"],
   ["Heure de départ du train pour Paris", "16 h 10"],
   ["Charge maximale du vélo-cargo (kg)", "180"],
   ["Vitesse du vélo-cargo en ville (km/h)", "12"],
   ["Temps passé à chaque arrêt (min)", "6"],
   ["Où doit arriver le vélo-cargo ?", "À la gare de Nîmes-Centre, avant 16 h 10"],
 ]},
 "T: N° | Rue | Quartier | Case": {"lignes": [
   ["1", "rue du Général Perrier", "Écusson", "D2"],
   ["2", "rue de Combret", "Jardins de la Fontaine", "C2"],
   ["3", "rue de l'Hostellerie", "Ville Active", "C5"],
   ["4", "rue de Mascard", "Saint-Césaire", "B5"],
   ["5", "rue Edmond Rostand", "Croix de Fer", "E1"],
   ["6", "rue Graverol", "Gambetta", "D2"],
   ["7", "rue Roger Sabatier", "Costières", "D4"],
 ], "note": "Les numéros sont ceux de la fiche de M. Morin : 1 Comptoir des Halles, 2 Épicerie Verdier, 3 La Pointe Sud, 4 Maison Lauze, 5 Studio Garance, 6 Atelier Mazet, 7 Caveau Pélissier. Cases recalculées par le logiciel depuis la position de chaque point sur la carte réelle (quadrillage de 1 km). Le logiciel tolère une case fausse ; le point du suivi exige les sept (case ET quartier). Les noms des clients n'apparaissent qu'après la validation. Vérifié le 03/10/2026 : les sept rues existent à Nîmes et tombent entièrement dans le contour de leur quartier (IRIS INSEE regroupés ; Costières = Marronniers + Capouchiné + Maréchal Juin)."},
 "T: Client | Chargé ou à quai ?": {"lignes": [
   ["Le Comptoir des Halles", "chargé"],
   ["Épicerie Verdier", "chargé"],
   ["La Pointe Sud", "à quai"],
   ["Maison Lauze", "chargé"],
   ["Studio Garance", "chargé"],
   ["Atelier Mazet", "chargé"],
   ["Caveau Pélissier", "chargé"],
 ], "note": "Un seul client à quai est possible : La Pointe Sud (58 kg ≥ 57 kg de trop). Vérifié par énumération des 128 combinaisons."},
 "T: Essai | Ordre des arrêts": {"lignes": [
   ["1", "réponse personnelle (ex. dans l'ordre de la fiche : Halles, Verdier, Lauze, Garance, Mazet, Pélissier)", "non : 21,3 km, arrivée 16 h 23"],
   ["2", "Lauze, Halles, Verdier, Mazet, Garance, Pélissier", "oui : 14,8 km, arrivée 15 h 50"],
   ["3", "Lauze, Pélissier, Verdier, Halles, Mazet, Garance (ordre le plus court)", "oui : 11,9 km, arrivée 15 h 36"],
   ["4", "libre", "libre"],
 ], "note": "Exemples calculés par le calibrage (départ entrepôt 14 h 00, arrivée gare, 6 clients, 12 km/h, 6 min par arrêt, km par les rues). La colonne « Train tenu ? » doit seulement être cohérente avec la jauge de l'élève. 189 ordres sur 720 tiennent le train."},
 "T: Ce qu'on calcule | Cellule | Ma formule": {"lignes": [
   ["Poids total chargé (kg)", "B8", "=SOMME(B2:B7)", "179"],
   ["Étape 1 · temps de route (h)", "B13", "=B11/B12", "0,99 (pour 11,9 km)"],
   ["Étape 2 · temps de route (min)", "B14", "=B13*60", "59,5"],
   ["Étape 3 · temps aux arrêts (min)", "B17", "=B15*B16", "36"],
   ["Heure d'arrivée à la gare", "B19", "=B18+B14+B17", "15:36 (935,5 min depuis minuit)"],
 ], "note": "Références de cellules déduites de l'ordre des lignes de la feuille avec 6 arrêts chargés (poids en B2 à B7 ; si l'élève charge 5 ou 7 arrêts, tout est décalé : lire l'écran). Les valeurs dépendent de l'ordre des arrêts de l'élève : distance (B11) = km parcourus. Toute formule équivalente est acceptée (ex. =B11/B12*60)."},
 "T: Client | Poids (kg)": {"lignes": [
   ["Le Comptoir des Halles", "31"], ["Épicerie Verdier", "24"], ["La Pointe Sud", "58"],
   ["Maison Lauze", "42"], ["Studio Garance", "19"], ["Atelier Mazet", "36"], ["Caveau Pélissier", "27"],
 ]},
 "T: Résultat | Mon calcul | Ma réponse": {"lignes": [
   ["Masse totale des sept commandes", "31 + 24 + 58 + 42 + 19 + 36 + 27", "237 kg"],
   ["Masse qui ne peut pas partir aujourd'hui", "237 − 180", "57 kg"],
 ], "note": "Les deux cases se corrigent seules (jalon « report »). Le logiciel refuse de valider si la tournée ne tient pas (charge, train, départ et arrivée posés)."},
}

# --------------------------------------------------------------------------------- ENT-2.1
# Cdiscount « Le stock raconte ». Les nombres et les numéros viennent de la base semée
# (contenus/cdiscount-mouvements.js) : stock d'inventaire 24, une réception de 12, cinq commandes
# (la sixième, CMD-731455, n'a pas d'écouteurs), un retour client (+1), une casse (−1), stock actuel 27.
# Les dates sont relatives (« il y a N jours ») : la base est semée à partir du jour où l'élève ouvre la séance.
# L'inscription de ce dictionnaire dans l'assemblage (_DICOS) est faite par outils/trame-cdiscount-mouvements.py.
ENT_2_1 = {
 "En quelle année Cdiscount": {"rep": "1998.", "note": "Source : Wikipédia (« Cdiscount »), à recouper ; relevé le 02/10/2026. Une page Internet peut changer."},
 "Dans quelle ville a-t-elle été fondée": {"rep": "Bordeaux.", "note": "Source : Wikipédia (« Cdiscount »), à recouper ; relevé le 02/10/2026."},
 "Dans quel département se trouve son entrepôt": {"rep": "La Gironde (33).", "note": "Entrepôt de Cestas, près de Bordeaux. Source : Journal du Net, article ancien : à dater et rafraîchir."},
 "Quel est le nom de sa filiale logistique": {"rep": "C-Logistics.", "note": "Source : GlobeNewswire, 06/10/2022."},
 "Pour un site de vente en ligne": {"pistes": [
   "Le client commande ce qu'il voit disponible : si le stock affiché est faux, on vend un article qu'on n'a plus (client déçu, commande annulée, remboursement).",
   "À l'inverse, un stock affiché trop bas fait perdre des ventes, et on peut racheter à tort ce qu'on a déjà.",
   "Accepter toute réponse qui relie le stock affiché à la vente, à la satisfaction du client ou au coût."]},
 "Nadia veut comprendre comment": {"pistes": [
   "Le chiffre seul ne dit pas d'où vient un écart : ce sont les mouvements et leurs documents qui permettent de comprendre, puis de corriger.",
   "Avant de recompter, on veut savoir ce qui est normal (ventes, réceptions) et ce qui est anormal (casse, retour, erreur de saisie).",
   "Accepter toute idée de justification, de contrôle ou de recherche d'erreur."]},
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Qui t'écrit, et quel est son poste ?", "Nadia Ferrand, cheffe d'équipe stock"],
   ["Selon le message de bienvenue, le stock affiché dans le système doit être égal à quoi ?", "Au stock réel, celui qui est dans les rayons"],
   ["De quel article parle Nadia (nom et référence) ?", "Écouteurs sans fil Bluetooth, ECO-BT-01"],
   ["À quelle date a eu lieu le dernier inventaire ?", "Il y a 7 jours (la date du jour moins 7 : le message l'écrit)"],
   ["Combien de lignes doit contenir ta réponse ?", "6"],
 ], "note": "La date de l'inventaire change chaque jour : elle est calculée à l'ouverture de la séance."},
 "T: Où as-tu lu le stock ? | Stock actuel": {"lignes": [
   ["Écran « Stock »", "27"],
   ["Console (.getstock ECO-BT-01)", "27"],
 ], "note": "Les deux façons donnent le même nombre. Écran Stock : code d'accès donné par l'enseignant (STOCK24 sur la page d'essai)."},
 "Quelle façon de lire le stock": {"pistes": [
   "Réponse personnelle : la console est plus rapide quand on connaît la référence ; l'écran est plus visuel et montre tous les articles.",
   "Accepter tout choix argumenté."]},
 "Ce nombre dit-il à lui seul": {"pistes": [
   "Non : un stock de 27 ne dit pas si c'est normal. Il faut savoir ce qui est entré et sorti, et pourquoi.",
   "C'est exactement ce que l'onglet Mouvements va montrer à l'étape suivante."]},
 "T: Date | Document (Origine) | Entrée | Sortie | Stock après": {"lignes": [
   ["Il y a 7 jours", "Inventaire", "", "", "24 (trouvé à l'étape 6)"],
   ["Il y a 6 jours, 15 h 30", "BP-731402 (commande CMD-731402)", "", "2", "22"],
   ["Il y a 5 jours, 10 h 00", "REC-26-0415", "12", "", "34"],
   ["Il y a 4 jours, 11 h 00", "BP-731488 (commande CMD-731488)", "", "1", "33"],
   ["Il y a 4 jours, 16 h 45", "RET-26-0091", "1", "", "34"],
   ["Il y a 3 jours, 9 h 30", "DEM-26-0027", "", "1", "33"],
   ["Il y a 3 jours, 14 h 00", "BP-731530 (commande CMD-731530)", "", "3", "30"],
   ["Il y a 2 jours, 10 h 15", "BP-731561 (commande CMD-731561)", "", "2", "28"],
   ["Il y a 1 jour, 13 h 42", "BP-731602 (commande CMD-731602)", "", "1", "27"],
 ], "note": "8 mouvements pour l'article ECO-BT-01 (la fiche en imprime 11 lignes). Piège de l'ordre : l'écran liste du plus récent au plus ancien, et le premier mouvement (une commande d'il y a 6 jours) est plus ancien que la réception. Les autres articles bougent aussi (19 mouvements au total) : il faut trier. Accepter BP-… ou CMD-… dans la colonne « Document »."},
 "Regarde la colonne « Type »": {"pistes": [
   "Les mouvements n'ont pas tous le même type : réception, préparation (commande), mais aussi retour client et casse.",
   "Une entrée n'est pas toujours un achat (un retour client), une sortie n'est pas toujours une vente (une casse). La colonne « Type » le dit."]},
 "Pourquoi, à ton avis, le système garde-t-il": {"pistes": [
   "Pouvoir vérifier chaque ligne (stock avant + entrée − sortie) et repérer l'endroit exact où le chiffre devient faux.",
   "Retrouver le stock d'un jour passé sans recompter : c'est justement ce que fait l'étape 6.",
   "Accepter toute idée de contrôle, de preuve ou de traçabilité."]},
 "T: Type de mouvement | Où je retrouve": {"lignes": [
   ["Entrée : réception", "Menu « Réceptions »"],
   ["Sortie : préparation", "Menu « Commandes » (bon de préparation BP-… = commande CMD-… aux mêmes chiffres)"],
   ["Entrée : retour client", "Messagerie (message du service retours)"],
   ["Sortie : casse", "Messagerie (message du cariste)"],
 ]},
 "T: N° de réception | Fournisseur": {"lignes": [
   ["REC-26-0412", "Kabeo", "non (câbles, chargeurs, batteries)", "—"],
   ["REC-26-0415", "Sonoria", "oui", "12"],
 ], "note": "Piège : REC-26-0412 est une vraie réception de la semaine, mais sans écouteurs : l'élève qui la cite se trompe de ligne. Le tableau imprime 4 lignes pour ne pas donner le nombre de réceptions."},
 "T: N° de commande | Client": {"lignes": [
   ["CMD-731402", "Léa Guérin", "oui", "2"],
   ["CMD-731455", "Louis Roux", "non (câbles et chargeur)", "—"],
   ["CMD-731488", "Enzo Lacoste", "oui", "1"],
   ["CMD-731530", "Emma Simon", "oui", "3"],
   ["CMD-731561", "Jade Darrieux", "oui", "2"],
   ["CMD-731602", "Clara Moreau", "oui", "1"],
 ], "note": "Piège : CMD-731455 n'a aucun écouteur. Cinq commandes sur six sont à citer. Les noms de clients sont générés par la base (même graine à chaque fois). Le tableau imprime 8 lignes."},
 "T: Document reçu (n°) | De qui ?": {"lignes": [
   ["RET-26-0091", "Service retours", "Retour client : une paire d'écouteurs neuve, emballage intact, renvoyée par le client de CMD-731402 et remise en rayon", "Entrée"],
   ["DEM-26-0027", "Kevin Larrieu, cariste", "Casse : un boîtier tombé du chariot, écrasé, invendable, mis au rebut", "Sortie"],
 ]},
 "Parmi les mouvements de ta fiche": {"pistes": [
   "Le retour client est une entrée qui n'est pas un achat : l'article revient en rayon, le stock remonte.",
   "La casse est une sortie qui n'est pas une vente : l'article est jeté, le stock baisse sans qu'aucune commande ne soit partie.",
   "Les deux modifient le stock sans que l'entreprise gagne ou paie une vente : d'où l'intérêt de les distinguer dans les mouvements."]},
 "Dans une vraie entreprise, que risque-t-on": {"pistes": [
   "On ne peut plus expliquer un écart : on ne sait pas s'il vient d'une erreur, d'un vol, d'une casse ou d'une vente non enregistrée.",
   "Le stock du système devient impossible à justifier, donc à corriger sans risque (voir l'inventaire).",
   "Accepter : perte de traçabilité, litige avec un client ou un fournisseur, difficulté de comptabilité."]},
 "T: Ce que je calcule | Mon calcul | Résultat": {"lignes": [
   ["Total des entrées (colonne « Entrée »)", "12 + 1", "13"],
   ["Total des sorties (colonne « Sortie »)", "2 + 1 + 1 + 3 + 2 + 1", "10"],
   ["Stock actuel (étape 3)", "27", "27"],
   ["Stock du dernier inventaire, calculé à l'envers", "27 − 13 + 10", "24"],
   ["Vérification à l'endroit : inventaire + entrées − sorties", "24 + 13 − 10", "27"],
 ], "note": "La ligne « Inventaire » de la fiche doit donc afficher 24, et la ligne suivante se vérifie : 24 − 2 = 22."},
 "Si ta vérification n'était pas tombée juste": {"pistes": [
   "Refaire les totaux, puis vérifier l'ordre des lignes de la fiche, puis chercher un mouvement oublié (ou en trop : celui d'un autre article).",
   "Contrôler la fiche ligne à ligne grâce à la règle « stock après = ligne du dessus + entrée − sortie » (étape 4).",
   "Ne pas modifier un résultat « pour que ça tombe juste »."]},
 "Au prochain inventaire, le comptage": {"pistes": [
   "Ne pas corriger tout de suite : recompter, puis chercher dans les mouvements ce qui explique les 2 articles manquants (casse non déclarée, retour non enregistré, erreur de préparation).",
   "Seulement ensuite, si rien ne l'explique, régulariser avec un motif écrit. C'est la démarche de la séance suivante (ENT-2.2)."]},
 "T: Ligne de Nadia | Ce que j'écris": {"lignes": [
   ["Stock actuel :", "27"],
   ["Réception :", "REC-26-0415, 12 écouteurs"],
   ["Commandes :", "CMD-731402, CMD-731488, CMD-731530, CMD-731561, CMD-731602 (pas CMD-731455, sans écouteurs)"],
   ["Retour :", "RET-26-0091"],
   ["Casse :", "DEM-26-0027"],
   ["Stock au dernier inventaire :", "27 − 13 + 10 = 24"],
 ], "note": "Ce que lisent les 5 jalons du suivi : dernier nombre de la ligne « Stock actuel » ; numéro ET quantité sur « Réception », sans citer REC-26-0412 ; toutes les commandes à écouteurs et aucune autre ; RET et DEM sur leurs lignes ; dernier nombre de la ligne « Stock au dernier inventaire » (le calcul reste visible)."},
 "Le stock du système n'est pas un comptage": {"pistes": [
   "Une erreur de saisie, un mouvement non enregistré, une casse non déclarée, un vol, un article rangé au mauvais emplacement.",
   "Le système ne sait que ce qu'on lui a dit : seul le comptage physique (l'inventaire) dit ce qu'il y a vraiment dans le rayon.",
   "Accepter toute cause plausible avec une explication."]},
 "Relis ta réponse comme si tu étais Nadia": {"pistes": [
   "Réponse personnelle : les numéros de documents (REC, CMD, RET, DEM) et le calcul visible permettent de retrouver chaque nombre sans le logiciel.",
   "Valoriser l'élève qui constate qu'il manque une justification ou qui la complète."]},
}


# --------------------------------------------------------------------------------- ENT-4.1 (Picard)
# Trame écrite par Cowork le 03/10/2026. Nombres du logiciel tirés de contenus/picard-ent41.js ;
# recherches Internet sourcées dans `note` (relevées le 03/10/2026).
ENT_4_1 = {
 "Que vend Picard": {"rep": "Des produits surgelés : plats cuisinés, légumes, viandes, poissons, desserts, glaces… sous sa propre marque, dans ses magasins et en ligne.", "note": "Source : picard.fr, « L'histoire de Picard »."},
 "En quelle année Picard ouvre-t-il": {"rep": "1974 (rue de Rome, à Paris).", "note": "Source : picard.fr, « L'histoire de Picard ». L'entreprise est plus ancienne (Les Glacières de Fontainebleau, 1906) : accepter 1974 seulement pour le premier magasin de surgelés."},
 "Combien de magasins Picard a-t-il": {"rep": "Plus de 1 000 (le 1 000e ouvre en 2018 ; plus de 1 200 aujourd'hui).", "note": "Sources : picard.fr (histoire) et recrutement.picard.fr. Accepter tout nombre au-dessus de 1 000 avec une source."},
 "Quelle entreprise fait tourner l'entrepôt": {"rep": "GXO (GXO Logistics), un logisticien : Picard lui confie l'entrepôt.", "note": "Source : Voxlog, reportage de 2023 sur l'entrepôt de Sainghin-en-Mélantois ; communiqué de GXO. C'est de l'externalisation."},
 "D'après l'article, que fait l'entrepôt": {"rep": "Il refuse le camion. Tous les camions ont des sondes ; aucune marchandise ne rentre sans contrôle de température (un expert peut venir contrôler chaque palette).", "note": "Source : Voxlog (2023) : « en cas de température non conforme, ils sont refusés »."},
 "D'après ce que tu as trouvé, qu'est-ce qui rend": {"pistes": [
   "Le temps compte : un surgelé se réchauffe dès qu'il sort du froid, une chaussure non.",
   "Il faut contrôler la température (ticket, sonde) en plus de la quantité et de l'état.",
   "Un produit réchauffé puis recongelé a perdu sa qualité, et cela ne se voit pas à l'œil.",
   "Accepter toute idée liée à la chaîne du froid ou à la sécurité alimentaire."]},
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Heure d'arrivée du camion", "6 h 00"],
   ["Fournisseur (qui envoie la marchandise)", "Surgelés du Littoral (fictif)"],
   ["Transporteur (qui conduit le camion)", "Transports Givrex (fictif)"],
   ["Nombre de palettes", "5"],
   ["La règle de la maison", "Le froid d'abord, les papiers ensuite."],
 ]},
 "Le chef de quai écrit : « le froid d'abord": {"pistes": [
   "Mettre les surgelés au froid avant de remplir les documents.",
   "Les papiers peuvent attendre, les surgelés non.",
   "Question de prévision : toute idée est recevable, on y revient à l'étape 6."]},
 "Numéro du bon de livraison": {"rep": "SL-26-1184."},
 "Température de consigne écrite sur le ticket": {"rep": "−20 °C."},
 "À quelle heure la température commence-t-elle": {"rep": "03:45 (−16,8 °C)."},
 "Quelle est la température la plus haute du ticket": {"rep": "−12,1 °C, à 04:15.", "note": "La remontée : 03:45 −16,8 · 04:00 −12,6 · 04:15 −12,1 · 04:30 −13,0 · 04:45 −17,4."},
 "À quelle heure revient-elle sous la consigne": {"rep": "05:00 (−20,8 °C).", "note": "À 04:45 (−17,4 °C), elle est encore au-dessus de la consigne. Réponse attendue à l'écran : « une remontée qui a duré : je la signale et je sonde chaque palette à cœur »."},
 "Pourquoi as-tu lu le ticket AVANT": {"pistes": [
   "Portes fermées, la marchandise reste au froid : lire le ticket ne lui coûte rien.",
   "Le ticket dit s'il faudra sonder chaque palette, ou même refuser le camion.",
   "Une fois les palettes sur le quai, chaque minute compte dans le temps hors froid."]},
 "T: Palette | Cartons par couche | Couches": {"lignes": [
   ["P1", "12 (4 × 3)", "5", "3", "57", "57"],
   ["P2", "9 (3 × 3)", "4", "0", "36", "36"],
   ["P3", "12 (4 × 3)", "4", "0", "48", "48"],
   ["P4", "6 (3 × 2)", "4", "2", "22", "24"],
   ["P5", "6 (3 × 2)", "5", "0", "30", "30"],
 ], "note": "P4 : un des deux manquants est dans le coin du fond, visible seulement en faisant le tour. P1 : la couche du dessus est incomplète mais le total est conforme au BL. Le bilan marque « à revoir (non compté) » les lignes « détail » si l'élève n'a rempli que le total."},
 "Pour la palette la plus difficile à compter": {"pistes": [
   "Souvent P4 (le carton manquant du fond ne se voit qu'en faisant le tour) ou P1 (couche du dessus incomplète).",
   "Valoriser la méthode : couche × nombre de couches − manquants, faire le tour, recompter.",]},
 "T: Palette | T° à cœur | Référence lue": {"lignes": [
   ["P1", "−21,5 °C", "oui (HVE-1000)", "bon état", "Accepter — aucun motif"],
   ["P2", "−19,8 °C", "oui (CRB-070)", "2 cartons écrasés, visibles de l'arrière", "Accepter avec réserves — cartons endommagés"],
   ["P3", "−14,2 °C", "oui (GVA-1000)", "bon état", "Refuser — température non conforme"],
   ["P4", "−20,4 °C", "oui (CAB-400)", "bon état (2 cartons manquants)", "Accepter avec réserves — manquant"],
   ["P5", "−20,9 °C", "NON : EPB-450 (épinards en branches) au lieu de EPH-450", "bon état", "Refuser — produit différent"],
 ], "note": "Le jalon de décision exige aussi la palette sondée. P3 : plus chaud que −15 °C, refus (règle du quai)."},
 "Pour une palette que tu as refusée": {"pistes": [
   "P3 : la sonde (−14,2 °C) est au-dessus de −15 °C : refus, quelle que soit la quantité.",
   "P5 : l'étiquette dit EPB-450, le BL EPH-450 : ce n'est pas le produit commandé.",
   "Valoriser l'élève qui cite la preuve (la valeur lue, la référence lue)."]},
 "Quel geste t'a fait découvrir un problème": {"pistes": [
   "Faire le tour : les cartons écrasés de P2, le carton manquant au fond de P4.",
   "Sonder : la glace de P3, qui avait l'air normale.",
   "Lire l'étiquette : la mauvaise référence de P5, invisible sans elle."]},
 "T: Palette | Décision | Ce que tu as écrit": {"lignes": [
   ["P2", "Accepter avec réserves", "2 (cartons endommagés)"],
   ["P3", "Refuser", "−14,2 (température à cœur relevée)"],
   ["P4", "Accepter avec réserves", "2 (cartons manquants)"],
   ["P5", "Refuser", "EPB-450 (référence réellement livrée)"],
 ], "note": "Phrases écrites sur le BL : voir le corrigé de la séance (ENT-4.1). Ne pas ajouter « sous réserve de déballage » (sans valeur)."},
 "Temps hors froid du lot quand il entre": {"rep": "Variable : environ 20 minutes pour un parcours juste ; sous le repère de 30 minutes.", "note": "Plus long si l'élève a écrit les réserves avant de rentrer le lot (le chef de quai l'arrête et le lui fait remarquer)."},
 "Que deviennent les palettes refusées": {"rep": "Elles restent sur le quai, puis repartent dans le camion avec le chauffeur (P3 et P5)."},
 "Qu'est-ce qui t'a fait perdre le plus de temps hors froid": {"pistes": [
   "Les gestes répétés (faire le tour plusieurs fois, recompter).",
   "Écrire les réserves avant de rentrer le lot (4 minutes de plus hors froid).",
   "Hésiter sur une décision. Valoriser l'élève qui chiffre sa perte de temps."]},
 "Combien de lignes sont marquées « ✗ à revoir »": {"rep": "Variable selon l'élève (0 pour un parcours parfait).", "note": "Les lignes « détail » (couche × couches − manquants) comptent dans le bilan affiché mais pas dans les 18 jalons du suivi."},
 "Temps réel passé": {"rep": "Variable : c'est le temps de l'élève à l'écran.", "note": "Mesuré pour caler les seuils de rapidité d'ENT-4.4 (provisoirement 12 et 16 min) ; non noté."},
 "Dans combien de jours faut-il confirmer": {"rep": "3 jours (jours fériés non compris), par lettre recommandée.", "note": "Code de commerce, art. L133-3 (version en vigueur depuis le 10/12/2009, lue sur Légifrance le 03/10/2026)."},
 "Pour quelles palettes faudra-t-il envoyer": {"rep": "P2 (cartons endommagés) et P4 (cartons manquants).", "note": "P3 et P5 sont refusées : elles repartent avec le transporteur."},
 "Choisis une ligne « à revoir »": {"pistes": [
   "Réponse personnelle : l'élève relie une erreur à un geste oublié (faire le tour, sonder, lire l'étiquette) ou à un ordre (papiers avant le froid).",
   "S'il n'a rien à revoir : le geste qui l'a le plus aidé, et pourquoi."]},
 "Les palettes refusées repartent dans le camion": {"pistes": [
   "Le service approvisionnement (ou les achats) : la marchandise manque, il faut la recommander.",
   "Le fournisseur, pour qu'il renvoie les bons produits.",
   "Les magasins qui attendaient ces produits, s'il y a un risque de rupture.",
   "Accepter toute réponse qui montre que le refus a des suites."]},
}


# --------------------------------------------------------------------------------- ENT-4.2 (Picard)
# Trame écrite par Cowork le 03/10/2026. Nombres tirés de contenus/picard-ent42.js. Deux chemins : camion
# Glaces Néviane (A) d'abord = le bon ordre ; Légumes d'Orvalle (B) d'abord = les glaces passent au-dessus
# de −15 °C et sont à refuser, quoi que fasse l'élève (garde-fou testé par Claude Code).
ENT_4_2 = {
 "À quoi sert le groupe froid": {"rep": "C'est la machine frigorifique du camion : elle produit le froid et garde la remorque à la température de consigne pendant tout le trajet.", "note": "Définition de métier ; recherche « groupe froid camion frigorifique »."},
 "Que mesure l'enregistreur de température": {"rep": "La température de l'air dans la remorque, à intervalles réguliers (ici toutes les 15 minutes), du départ à l'arrivée ; il l'imprime sur un ticket.", "note": "Pour les surgelés, le transport doit être équipé d'instruments qui enregistrent la température de l'air (règlement (CE) n° 37/2005)."},
 "Que veut dire « sonder à cœur »": {"rep": "Planter une sonde au centre d'un carton pour lire la température du produit lui-même (pas celle de l'air)."},
 "Un camion arrive avec un ticket parfait": {"pistes": [
   "Le ticket mesure l'air de la remorque, pas le produit : une palette peut avoir chauffé avant d'être chargée.",
   "Un produit peut avoir été mal congelé chez le fournisseur.",
   "C'est la règle du quai : aucune marchandise ne rentre sans contrôle de température."]},
 "T: Information | Premier camion arrivé": {"lignes": [
   ["Heure d'arrivée", "06:00 (Glaces Néviane)", "06:10 (Légumes d'Orvalle)"],
   ["Fournisseur", "Glaces Néviane (fictif)", "Légumes d'Orvalle (fictif)"],
   ["Transporteur", "Transports Hivernel (fictif)", "Transports Calvenor (fictif)"],
   ["Nombre de palettes", "3", "5"],
   ["Ce qu'il transporte", "des glaces", "des légumes surgelés"],
 ]},
 "Combien de quais as-tu": {"rep": "Un seul (le quai 32) : un camion à la fois."},
 "Que dois-tu lire avant de décider": {"rep": "Les deux tickets de température (un par camion)."},
 "Avant d'avoir vu les tickets, quel camion": {"pistes": [
   "Réponse de prévision, toutes recevables : « le premier arrivé », « celui qui a le plus de palettes », « les glaces, plus fragiles »…",
   "On y revient à l'étape 3 : l'intérêt est de voir si le ticket fait changer d'avis."]},
 "T: Heure | Camion Glaces Néviane": {"lignes": [
   ["05:00", "−20,3 °C", "−20,8 °C"],
   ["05:30", "−19,3 °C", "−20,6 °C"],
   ["05:45", "−18,5 °C", "−20,7 °C"],
   ["06:00", "−17,4 °C", "−21,0 °C"],
   ["Ce que montre le ticket", "La température remonte encore à l'arrivée, de plus en plus vite : le groupe froid faiblit", "Rien à signaler : la température est restée stable"],
 ], "note": "Ticket Glaces Néviane : stable vers −21 °C jusqu'à 04:30, puis 04:45 −20,6 · 05:00 −20,3 · 05:15 −19,9 · 05:30 −19,3 · 05:45 −18,5 · 06:00 −17,4. Le ticket Légumes est le seul juste à « rien à signaler »."},
 "Le camion que tu fais décharger en premier": {"rep": "Le camion Glaces Néviane."},
 "La raison que tu as choisie": {"rep": "« Le ticket des Glaces Néviane montre que leur froid faiblit : les glaces se réchauffent si le camion attend. »", "note": "Le jalon exige le bon camion ET cette phrase. « Arrivé le premier » donne le bon camion pour une mauvaise raison : jalon faux."},
 "Qu'est-ce qui, sur les tickets, t'a fait choisir": {"pistes": [
   "La dernière heure du ticket des glaces : la température monte de plus en plus vite.",
   "Le ticket des légumes est stable : ce camion peut attendre sans dommage.",
   "Valoriser l'élève qui cite des valeurs lues (−18,5 puis −17,4 °C)."]},
 "Compare avec ta réponse de l'étape 2": {"pistes": [
   "Réponse personnelle. Intéressant : l'élève qui voulait « le premier arrivé » et qui garde le même camion pour une autre raison.",
   "Ou celui qui change d'avis grâce au ticket : c'est le but de la séance (adapter l'organisation à un aléa, C1.3)."]},
 "Temps hors froid de ce lot quand il entre": {"rep": "Variable : environ 13 à 15 minutes pour le lot de glaces (3 palettes) en bon ordre.", "note": "Une jauge par camion : elle démarre à l'ouverture de son camion, s'arrête quand son lot entre en chambre froide."},
 "Combien de lignes as-tu écrites sur le BL": {"rep": "3 pour le camion de glaces en bon ordre (une ligne de réserve « température » par palette).", "note": "Ex. : « A1 GVA-2500 : acceptée sous réserve — température à cœur −17,5 °C (−18 °C exigé). »"},
 "Quelle palette de ce camion t'a demandé": {"pistes": [
   "A2 (deux références sur une palette) ou la décision « avec réserves » pour une glace à −17,5 °C, ni bonne ni à refuser.",
   "Valoriser l'élève qui cite la règle du quai pour justifier."]},
 "Temps hors froid de ce second lot": {"rep": "Variable : environ 15 à 20 minutes pour les 5 palettes de légumes.", "note": "Le second lot ne démarre qu'à l'ouverture de son camion : l'attente porte fermée ne compte pas dans sa jauge."},
 "Que deviennent les palettes que tu as refusées": {"rep": "Elles restent au quai et repartent dans le camion avec le chauffeur (B2 et B3 en bon ordre).", "note": "Si l'élève a pris les légumes d'abord : les trois palettes de glaces sont aussi refusées."},
 "Ce camion a attendu porte fermée": {"pistes": [
   "Bon ordre (légumes en second) : rien, son groupe froid tient, ses légumes sont restés à −21 °C.",
   "Mauvais ordre (glaces en second) : les glaces ont continué de se réchauffer, au-dessus de −15 °C : tout le camion est refusé.",
   "Valoriser l'élève qui relie l'attente à la température relevée à la sonde."]},
 "La ligne « Ordre de déchargement": {"rep": "Juste si l'élève a choisi le camion Glaces Néviane ET la phrase sur le froid qui faiblit.", "note": "Variable selon l'élève."},
 "Combien de lignes sont marquées « ✗ à revoir »": {"rep": "Variable selon l'élève (0 pour un parcours parfait, sur 30 jalons)."},
 "Température à cœur des glaces quand": {"rep": "−17,5 °C si les glaces ont été déchargées en premier ; au-dessus de −15 °C (−14,9 °C au mieux) si elles ont attendu.", "note": "+0,25 °C par minute d'attente porte fermée, à partir de −18,5 °C à 06:10 (valeurs construites)."},
 "Si tu avais choisi l'autre camion en premier": {"pistes": [
   "Bon ordre choisi : les glaces auraient attendu au moins 14 minutes de plus et dépassé −15 °C : refusées, perdues pour Picard.",
   "Mauvais ordre choisi : en les prenant d'abord, elles seraient restées vers −17,5 °C, acceptées avec réserves.",
   "L'idée : l'ordre de réception a des conséquences sur la marchandise, pas seulement sur le temps."]},
 "Choisis une ligne « à revoir »": {"pistes": [
   "Réponse personnelle : relier l'erreur à un geste (faire le tour, lire l'étiquette arrière de B3, compter les deux références de A2, sonder B2 malgré le ticket parfait).",
   "S'il n'a rien à revoir : la décision la plus difficile, et pourquoi."]},
 "Dans une vraie entreprise, qui faut-il prévenir": {"pistes": [
   "Le chef de quai, pour décider de l'ordre et des suites.",
   "Le transporteur (son camion doit être réparé), et le fournisseur.",
   "Le service qualité de l'entrepôt.",
   "Accepter toute réponse qui montre qu'un aléa se signale, il ne se garde pas pour soi."]},
}
T_4_2_PREMIER = {"lignes": [
   ["A1", "36", "36", "−17,5 °C", "oui (GVA-2500)", "Accepter avec réserves — température"],
   ["A2", "18 + 6", "18 + 6", "−17,5 °C", "oui (SCI-500 et SFR-500)", "Accepter avec réserves — température"],
   ["A3", "48", "48", "−17,5 °C", "oui (BCH-060)", "Accepter avec réserves — température"],
   ["", "", "", "", "", ""],
   ["", "", "", "", "", ""],
 ], "note": "Si l'élève a pris le bon ordre (glaces d'abord). A2 porte deux références : 3 couches de sorbet citron (18) + 1 couche de framboise (6), à compter séparément. Les glaces se sont un peu réchauffées pendant la lecture des tickets : entre −18 et −15 °C, donc acceptées avec réserves (règle du quai). Si l'élève a pris les légumes d'abord, ce tableau porte les palettes B (voir l'étape 5)."}
T_4_2_SECOND = {"lignes": [
   ["B1", "60", "60", "−21,0 °C", "oui (PPO-1000)", "Accepter — aucun motif"],
   ["B2", "36", "36", "−14,8 °C", "oui (POE-750)", "Refuser — température"],
   ["B3", "30", "30", "−20,6 °C", "NON : face avant déchirée ; face arrière CFL-1000 (chou-fleur) au lieu de BRO-1000", "Refuser — produit différent"],
   ["B4", "31", "32", "−20,2 °C", "oui (HBE-1000)", "Accepter avec réserves — manquant (1)"],
   ["B5", "45", "45", "−20,8 °C", "oui (CAR-1000)", "Accepter — aucun motif"],
 ], "note": "Si l'élève a pris le bon ordre (légumes en second). B2 : chaude malgré un ticket parfait, seule la sonde la trouve. B3 : le refus n'est juste que si l'étiquette arrière a été lue. B4 : le carton manquant est dans le coin du fond, en haut. Mauvais ordre : ce tableau porte les glaces, toutes à refuser (température au-dessus de −15 °C)."}


# --------------------------------------------------------------------------------- ENT-4.3 (Picard)
# Trame écrite par Cowork le 03/10/2026. Nombres tirés de contenus/picard-ent43.js. La date de la réception
# est le jour où l'élève ouvre la séance. Article L133-3 lu sur Légifrance le 03/10/2026.
ENT_4_3 = {
 "En combien de jours faut-il protester": {"rep": "3 jours, qui suivent la réception.", "note": "Code de commerce, art. L133-3 (version en vigueur depuis le 10/12/2009)."},
 "Les jours fériés comptent-ils": {"rep": "Non : « non compris les jours fériés »."},
 "Par quel moyen faut-il envoyer la protestation": {"rep": "Par lettre recommandée, ou par acte extrajudiciaire (commissaire de justice, ex-huissier)."},
 "À qui l'envoie-t-on": {"rep": "Au transporteur (le « voiturier » du texte)."},
 "Pourquoi la loi laisse-t-elle si peu de temps": {"pistes": [
   "Plus on attend, moins on peut prouver que le dommage vient du transport et pas de l'entrepôt.",
   "Le transporteur doit pouvoir vérifier vite, tant que le camion, le chauffeur et les documents sont disponibles.",
   "Accepter toute idée liée à la preuve ou à l'équité entre les deux parties."]},
 "T: Qui écrit ? | Ce qu'il dit": {"lignes": [
   ["Transports Givrex", "Il confirme la livraison du BL SL-26-1207 cette nuit, avec la réserve « sous réserve de déballage » ; pour réclamer, il faut lui répondre."],
   ["Mathis, réceptionnaire de nuit", "« RAS, tout est rentré » : 5 palettes en chambre froide n° 2, la fiche est dans le dossier."],
   ["Le chef de quai", "Vérifier la réception de Mathis avant que le transporteur soit trop loin, puis lui répondre en complétant cinq lignes."],
 ]},
 "Numéro du bon de livraison": {"rep": "SL-26-1207."},
 "À quelle heure Mathis a-t-il réceptionné": {"rep": "À 3 h 10 (le camion est arrivé à 3 h 00)."},
 "Où sont les palettes maintenant": {"rep": "En chambre froide n° 2 (le camion est reparti)."},
 "Avant d'ouvrir le dossier, quelle pièce": {"pistes": [
   "La fiche de Mathis (ce qu'il a compté et sondé), le BL (ce qui a été signé), ou le ticket (le trajet).",
   "Toute réponse justifiée est recevable ; valoriser celle qui compare deux pièces entre elles."]},
 "T: Palette | BL (cartons) | Fiche : cartons": {"lignes": [
   ["N1", "44", "44", "−19,6 °C", "Acceptée", "couche du dessus pas complète… mais 44 = BL : rien à signaler"],
   ["N2", "36", "36", "−14 °C", "Acceptée (« OK »)", "−14 °C, c'est plus chaud que −15 °C : il fallait refuser"],
   ["N3", "40", "40", "−19,8 °C", "Acceptée", "40, exactement le chiffre du BL : a-t-il vraiment compté ?"],
   ["N4", "45", "45", "−20,1 °C", "Acceptée", "rien"],
   ["N5", "30", "30", "−19,2 °C", "Acceptée", "rien"],
 ], "note": "N1 est la fausse piste : la remarque de Mathis attire l'œil, mais la palette est conforme. Le doute sur N3 ne se lève qu'en recomptant (étape 4)."},
 "Entre quelles heures la température de l'air dépasse": {"rep": "De 01:15 à 02:45 (−18,2 °C à 01:15, −18,0 °C à 02:45 ; −20,1 °C à 03:00).", "note": "Une remontée qui a duré environ 1 h 30."},
 "Quelle est la température la plus haute du ticket": {"rep": "−11,1 °C, à 02:00."},
 "Quelle réserve Mathis a-t-il écrite": {"rep": "« Sous réserve de déballage. »", "note": "Mention sans valeur juridique : elle ne dit ni quoi, ni combien, ni sur quelle palette."},
 "Quelle ligne de la fiche de Mathis": {"pistes": [
   "N2 : −14 °C noté « OK », alors que c'est au-dessus de −15 °C : Mathis a accepté une palette à refuser.",
   "N3 : un comptage qui recopie le BL peut cacher un comptage non fait.",
   "N1 : l'élève peut la citer ; l'étape 4 montre qu'elle est conforme. Valoriser l'explication."]},
 "T: Palette | Ton comptage | Fiche de Mathis": {"lignes": [
   ["N1", "44 (12 × 4 − 4)", "44", "44", "−21,4 °C", "oui"],
   ["N2", "36", "36", "36", "−21,0 °C", "oui"],
   ["N3", "37 (8 × 5 − 3)", "40", "40", "−21,6 °C", "oui"],
   ["N4", "45", "45", "45", "−21,2 °C", "oui"],
   ["N5", "30", "30", "30", "−20,9 °C", "oui"],
 ], "note": "N3 : deux trous en haut au fond et un troisième juste dessous, visible en faisant le tour. N2 : la sonde d'aujourd'hui ne montre plus rien, la preuve est la fiche (−14 °C) et le ticket."},
 "Ta sonde d'aujourd'hui et la fiche de Mathis": {"pistes": [
   "La fiche : c'est la température à la réception, au moment où ça comptait. Aujourd'hui, la palette a été recongelée.",
   "Le ticket confirme : l'air de la remorque est monté jusqu'à −11,1 °C pendant le trajet.",
   "Idée clé : la preuve est dans les documents, pas dans la sonde du lendemain."]},
 "Pour la ligne « Délai », comment as-tu su": {"pistes": [
   "La réception date de cette nuit : on est le jour même, donc bien avant 3 jours.",
   "Valoriser l'élève qui cite la règle de l'étape 1 (3 jours, jours fériés non compris)."]},
 "Quelle palette as-tu bloquée": {"rep": "N2 (et elle seule).", "note": "Bloquer une palette conforme fait tomber le jalon « aucune palette conforme bloquée ». N3 n'est pas à bloquer : son problème est une quantité, pas une qualité."},
 "Pourquoi as-tu bloqué cette palette": {"pistes": [
   "Elle a été réceptionnée à −14 °C : elle s'est réchauffée puis a été recongelée, sa qualité n'est plus garantie.",
   "La sonde d'aujourd'hui ne prouve rien : c'est la fiche de la réception qui compte.",
   "Le service qualité décidera (détruire, déclasser) ; en attendant, elle ne doit pas partir en magasin."]},
 "Combien de lignes sont marquées « ✗ à revoir »": {"rep": "Variable selon l'élève (0 pour un parcours parfait, sur 10 jalons)."},
 "Dans la vraie vie, comment doit partir": {"rep": "Par lettre recommandée (ou acte d'un commissaire de justice), au transporteur."},
 "Avant quelle date doit-elle partir": {"rep": "Dans les 3 jours qui suivent la réception, jours fériés non compris : la date de la séance + 3 jours.", "note": "La date de réception affichée est le jour où l'élève a ouvert la séance."},
 "Qu'as-tu trouvé grâce aux documents": {"pistes": [
   "La palette N2 réceptionnée trop chaude (la fiche à −14 °C, le ticket) : la sonde d'aujourd'hui dit −21 °C.",
   "La mention « sous réserve de déballage », qui ne protège de rien.",
   "Le délai, qui se calcule depuis la date du BL."]},
 "Si tu étais Mathis": {"pistes": [
   "Compter vraiment (couches × cartons − manquants) au lieu de recopier le BL.",
   "Appliquer la règle des températures même quand on est pressé, et refuser à −14 °C.",
   "Écrire des réserves précises, prévenir le chef de quai au lieu d'écrire « RAS »."]},
 "Choisis une ligne « à revoir »": {"pistes": [
   "Réponse personnelle : relier l'erreur à une pièce mal lue ou à un geste oublié (recompter N3, accuser N1 à tort, oublier la date).",
   "S'il n'a rien à revoir : la preuve la plus solide (souvent la fiche de Mathis pour N2)."]},
}
T_4_3_DIAG = {"lignes": [
   ["Palette acceptée à tort :", "N2"],
   ["Preuve :", "la fiche de Mathis dit −14 °C à cœur (plus chaud que −15 °C)"],
   ["Manquant :", "N3, 3 cartons (37 au lieu de 40)"],
   ["Réserve :", "« sous réserve de déballage » ne vaut rien"],
   ["Délai :", "encore dans le délai (réception cette nuit, moins de 3 jours)"],
 ], "note": "Lecture des jalons : N2 et elle seule, preuve avec « 14 » ou « fiche » ; N3 avec 3 (ou 37 et 40) ; « déballage » + « ne vaut rien / sans valeur / inutile… » ; délai : « encore », « dans le délai », « oui »… Citer N1 dans « Palette acceptée à tort » ou « Manquant » fait tomber « N1 non accusée », même dans un second message."}
T_4_3_PROT = {"lignes": [
   ["BL :", "SL-26-1207"],
   ["Réceptionné le :", "la date du jour de la séance, en chiffres (jj/mm/aaaa)"],
   ["Palette :", "N2 et N3"],
   ["Constat :", "N2 : température non conforme à la réception (−14 °C à cœur) ; N3 : cartons manquants"],
   ["Quantité :", "3 cartons manquants sur N3 (37 au lieu de 40)"],
 ], "note": "« Constat » doit parler de la température ET du manquant ; « Palette » doit citer N2 et N3, et elles seules."}


# --------------------------------------------------------------------------------- assemblage
import json as _json
import os as _os

# ENT-1.3 : tableaux dont l'en-tête se répète ou dont la clé est propre à une étape
_EXTRAS = {
    'ENT-4.3': {
        (5, 'T: Ligne du message'): T_4_3_DIAG,
        (6, 'T: Ligne du message'): T_4_3_PROT,
    },
    'ENT-4.2': {
        (4, 'T: Palette | Cartons comptés'): T_4_2_PREMIER,
        (5, 'T: Palette | Cartons comptés'): T_4_2_SECOND,
    },
    'ENT-1.3': {
        (2, 'T: Information | Ce que tu relèves'): TABLEAUX_PAR_ETAPE_1_3[2],
        (3, 'T: Information | Ce que tu relèves'): TABLEAUX_PAR_ETAPE_1_3[3],
        (4, 'T: Référence article | Qté | Bon de préparation'): T_1_3_CLIENTS,
        (5, 'T: Référence article | Entré avec ce lot'): T_1_3_RESTE,
    },
}
_DICOS = {
    'ENT-1.1': [ENT_1_1],
    'ENT-1.2': [ENT_1_2],
    'ENT-1.3': [ENT_1_3],
    'ENT-3.1': [ENT_3_1, ENT_3_1_TABLEAUX],
    'ENT-4.1': [ENT_4_1],
    'ENT-4.2': [ENT_4_2],
    'ENT-4.3': [ENT_4_3],
}


def ecrire_corrige(code, titre, trame, items, cles, notions, dossier, script, fichier=None):
    """Écrit contenus/corriges/<fichier ou code>.js (`fichier` : Picard, où <code>.js est le corrigé calculé de la séance) : TOUTES les questions de la trame, dans l'ordre, avec leur réponse.
    Échoue si une question n'a pas de réponse, ou si une clé de réponse ne correspond à aucune question."""
    dicos = _DICOS[code]
    extras = _EXTRAS.get(code, {})
    utilises = set()
    sortie, manques = [], []
    for it in items:
        o = dict(etape=it['etape'], etapeTitre=it['etapeTitre'], genre=it['genre'], texte=it['texte'])
        if it['genre'] == 'qcm':
            cle = next((x for x in cles if x['question'] == it['texte']), None)
            if cle is None:
                manques.append(('qcm sans clé', it['texte'])); continue
            n = next((x for x in notions if cle['question'].startswith(x[0])), None)
            o.update(choix=cle['choix'], bonne=cle['bonne'],
                     explication=n[2] if n else '', notion=n[1] if n else '')
            sortie.append(o); continue
        cible = ('T: ' + it['texte']) if it['genre'] == 'tableau' else it['texte']
        rep = None
        for (et, k), v in extras.items():
            if et == it['etape'] and cible.startswith(k):
                rep = v; utilises.add(('x', et, k)); break
        if rep is None:
            cands = [(k, d[k]) for d in dicos for k in d if d[k] is not None and cible.startswith(k)]
            if len(cands) > 1:
                cands.sort(key=lambda kv: -len(kv[0]))
                if len(cands[0][0]) == len(cands[1][0]):
                    manques.append(('clé ambiguë', cible)); continue
            if cands:
                utilises.add(('d', cands[0][0])); rep = cands[0][1]
        if rep is None:
            manques.append(('sans réponse', cible)); continue
        if it['genre'] == 'tableau':
            o['entetes'] = it['texte'].split(' | ')
            o['contexte'] = it.get('contexte') or ''
        for champ in ('rep', 'pistes', 'lignes', 'modele', 'criteres', 'note'):
            if champ in rep:
                o['reponses' if (champ == 'lignes' and it['genre'] == 'tableau') else champ] = rep[champ]
        sortie.append(o)
    inutiles = [k for d in dicos for k, v in d.items() if v is not None and ('d', k) not in utilises]
    inutiles = [k for k in inutiles if not any(k == kk for (_, kk) in extras)]
    if manques or inutiles:
        raise SystemExit('Corrigé %s incomplet :\n  manques : %s\n  clés inutilisées : %s' % (
            code, [(a, b[:60]) for a, b in manques], [k[:60] for k in inutiles]))
    os_ = _os
    os_.makedirs(dossier, exist_ok=True)
    with open(os_.path.join(dossier, (fichier or code) + '.js'), 'w', encoding='utf-8') as f:
        f.write("// Généré par outils/%s — ne pas modifier à la main : modifier le générateur, puis le relancer.\n" % script)
        f.write("export const CORRIGE = " + _json.dumps(dict(code=code, titre=titre, trame=trame, items=sortie),
                                                        ensure_ascii=False, indent=2) + ";\n")
    genres = {}
    for o in sortie:
        genres[o['genre']] = genres.get(o['genre'], 0) + 1
    print('corrigé :', code, len(sortie), 'questions', genres)
