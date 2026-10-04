# -*- coding: utf-8 -*-
"""Corrigés des trames élève de la série Cdiscount refondue (ENT-2.1, 2.2, 2.3, 2.4, 2.6).

Écrit par Cowork le 04/10/2026. Un dictionnaire par séance, au format de `corriges_data.py` (clé = début de
la question, ou « T: » + en-têtes d'un tableau ; valeur = rep / pistes / lignes / note). Chaque générateur
l'inscrit dans `corriges_data._DICOS` avant d'appeler `trame_commun.finir` : `corriges_data.py`, fichier
partagé, n'est pas touché (sauf le retrait de l'ancien ENT_2_1, devenu faux avec le recadrage).

Les nombres viennent du code livré (contenus/cdiscount-*.js), relus le 04/10/2026, et de la séance jouée
sur la page d'essai (outils/essai-cdiscount.html). Les dates sont relatives : la base est semée à
l'ouverture (J-1 = la veille). Quand le niveau « confirmé » change une réponse, la note le dit.
"""

# --------------------------------------------------------------------------------- ENT-2.1
# Stock d'inventaire 4 ; réception REC-26-0415 (+10) ; six commandes à écouteurs ; retour RET-26-0091 (+1) ;
# casse DEM-26-0027 saisie −1 pour 2 constatés ; stock actuel 1 ; CMD-731602 annulée, sans mouvement.
# Confirmé : + REC-26-0409 (+6, J-7 14 h), CMD-731420 (−3, J-6), CMD-731515 (−3, J-4) : somme nulle.
ENT_2_1 = {
 "En quelle année Cdiscount": {"rep": "1998.", "note": "Source : Wikipédia, article « Cdiscount » (relu le 04/10/2026) : fondée en 1998 à Bordeaux par Hervé, Christophe et Nicolas Charle."},
 "Dans quelle ville a-t-elle été fondée": {"rep": "Bordeaux (Gironde).", "note": "Même source. Le siège est toujours à Bordeaux."},
 "Quel est le nom de sa filiale logistique": {"rep": "C-Logistics (créée en 2019).", "note": "Source : Voxlog, reportage du 04/10/2023 sur l'entrepôt de Réau (« la filiale logistique de Cdiscount créée en 2019 »)."},
 "Quels produits l'entrepôt de Cestas": {"rep": "Les produits de moins de 30 kg.", "note": "Source : Voxlog (04/10/2023) : Cestas (33) traite les produits de moins de 30 kg ; les encombrants (plus de 30 kg) vont près de Saint-Étienne. Accepter aussi « les petits colis »."},
 "D'après ce que tu as trouvé, pourquoi une erreur de stock": {"pistes": [
   "Fin novembre (Black Friday) puis jusqu'à Noël, les ventes explosent : un article affiché à tort se vend beaucoup plus de fois.",
   "Plus de commandes annulées, plus de clients mécontents, au moment où ils comparent les sites.",
   "Repère daté : à Noël 2017, Cestas expédiait 300 000 colis par jour, « en plein rush depuis Black Friday » (France Bleu, 19/12/2017). Chiffre ancien, à présenter comme tel.",
   "Accepter toute réponse qui relie la période chargée au nombre de ventes touchées par l'erreur."]},
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Qui t'écrit, et quel est son poste ?", "Nadia Ferrand, cheffe d'équipe stock"],
   ["Quelle commande a été annulée ce matin (numéro) ?", "CMD-731602 (Mme Moreau)"],
   ["Référence de l'article commandé", "ECO-BT-01 (écouteurs sans fil Bluetooth)"],
   ["Ce que le préparateur a trouvé à l'emplacement", "L'emplacement A-02-1 vide"],
   ["Combien d'articles le système dit-il qu'il en reste ?", "1 (« il en reste un »)"],
   ["Date du dernier inventaire de l'allée", "Il y a 7 jours (la date est écrite dans le message)"],
   ["Combien de lignes doit contenir ta réponse complète ?", "7"],
 ], "note": "La date d'inventaire est calculée à l'ouverture : J-7. Le message dit « il en reste un » en toutes lettres : c'est l'énoncé, l'élève le vérifie à l'étape 3."},
 "Le système dit qu'il reste des écouteurs": {"pistes": [
   "Une erreur de saisie, un article cassé ou perdu sans être enregistré, un vol, un article rangé ailleurs.",
   "Question de prévision : toute hypothèse est recevable ; on y revient à l'étape 6."]},
 "T: Où as-tu lu le stock ? | Stock actuel": {"lignes": [
   ["Écran « Stock »", "1"],
   ["Console", "1 (.getstock ECO-BT-01 : « 1 article », statut « Faible »)"],
 ], "note": "Code d'accès de l'écran Stock : donné par l'enseignant (STOCK24 sur la page d'essai). Confirmé : 1 aussi."},
 "Ce nombre te dit-il comment le stock": {"pistes": [
   "Non : 1 ne dit ni ce qui est entré, ni ce qui est sorti, ni pourquoi. Il faut les mouvements.",
   "Et il ne dit pas si ce 1 est vrai : le préparateur a trouvé le rayon vide."]},
 "T: Date | Document (Origine) | Entrée | Sortie | Stock après": {"lignes": [
   ["Dernier inventaire (J-7)", "Inventaire", "", "", "4 (trouvé à l'étape 7)"],
   ["J-6, 15 h 30", "BP-731402", "", "2", "2"],
   ["J-5, 10 h 00", "REC-26-0415", "10", "", "12"],
   ["J-4, 11 h 00", "BP-731488", "", "1", "11"],
   ["J-4, 16 h 45", "RET-26-0091", "1", "", "12"],
   ["J-3, 9 h 30", "DEM-26-0027", "", "1", "11"],
   ["J-3, 14 h 00", "BP-731530", "", "3", "8"],
   ["J-2, 10 h 15", "BP-731561", "", "3", "5"],
   ["J-1, 9 h 36", "BP-731578", "", "2", "3"],
   ["J-1, 15 h 12", "BP-731590", "", "2", "1"],
 ], "note": "9 mouvements (la fiche imprime 13 lignes vides). L'écran met le plus récent en haut. Confirmé : 12 mouvements — en plus REC-26-0409 (J-7, 14 h, +6 → 10), BP-731420 (J-6, 11 h, −3 → 7, avant BP-731402 qui laisse alors 5), BP-731515 (J-4, 13 h 30, −3) ; le stock actuel reste 1."},
 "Regarde la colonne « Type »": {"pistes": [
   "Il n'y a pas que des réceptions et des préparations : un retour client (une entrée) et une casse (une sortie).",
   "Une entrée n'est pas toujours un achat, une sortie n'est pas toujours une vente."]},
 "T: Type de mouvement | Où je retrouve": {"lignes": [
   ["Entrée : réception", "Menu « Réceptions »"],
   ["Sortie : préparation", "Menu « Commandes » (BP-… = CMD-… aux mêmes chiffres)"],
   ["Entrée : retour client", "Messagerie (Service retours)"],
   ["Sortie : casse", "Messagerie (Kevin Larrieu, cariste)"],
 ]},
 "T: N° de réception | Fournisseur": {"lignes": [
   ["REC-26-0415", "Sonoria", "oui", "10"],
   ["REC-26-0412", "Kabeo", "non (câbles, chargeurs, batteries)", "—"],
 ], "note": "Piège : REC-26-0412 est bien de la semaine mais sans écouteurs. Confirmé : aussi REC-26-0409, Sonoria, oui, 6. Quatre lignes imprimées pour ne pas donner le nombre."},
 "T: Bon de ta fiche (BP-…) | Commande (CMD-…)": {"lignes": [
   ["BP-731402", "CMD-731402", "Léa Guérin", "2"],
   ["BP-731488", "CMD-731488", "Enzo Lacoste", "1"],
   ["BP-731530", "CMD-731530", "Emma Simon", "3"],
   ["BP-731561", "CMD-731561", "Jade Darrieux", "3"],
   ["BP-731578", "CMD-731578", "Chloé Laffitte", "2"],
   ["BP-731590", "CMD-731590", "Maxime Fournier", "2"],
 ], "note": "Six commandes (confirmé : huit, avec CMD-731420 et CMD-731515, 3 chacune). CMD-731455 et CMD-731545 n'ont pas d'écouteurs : elles ne sont pas sur la fiche. Noms des clients relevés sur la page d'essai (même base pour tous)."},
 "Dans la liste « Commandes », quel est le statut": {"rep": "Annulée (CMD-731602, Clara Moreau).", "note": "L'écran de la commande dit : « Annulée le … à 7 h 24 — Rupture : emplacement A-02-1 vide à la préparation »."},
 "Cette commande a-t-elle fait bouger le stock": {"rep": "Non : aucun mouvement BP-731602 dans la liste ; son bon dit « Stock trouvé 0 », « À préparer 0 », « Rupture ».", "note": "C'est le piège du jalon 3 : la citer sur la ligne « Commandes » rend le jalon faux."},
 "T: Document (n°) | De qui ?": {"lignes": [
   ["RET-26-0091", "Service retours", "Un client (commande CMD-731402) renvoie 1 paire neuve, emballage intact, remise en rayon A-02-1", "Entrée"],
   ["DEM-26-0027", "Kevin Larrieu, cariste", "Un carton tombé du chariot en allée A-02 : 2 boîtiers écrasés, mis au rebut, « saisi sur le terminal »", "Sortie"],
 ], "note": "Ces deux messages arrivent après le premier envoi « Stock actuel : … » (juste ou faux)."},
 "Parmi les mouvements de ta fiche, lesquels ne sont ni un achat": {"pistes": [
   "Le retour client : une entrée sans achat ; l'article revient en rayon.",
   "La casse : une sortie sans vente ; l'article est jeté.",
   "Valoriser l'élève qui ajoute qu'il faut donc lire le type, pas seulement le signe."]},
 "T: Document | Quantité écrite sur le document": {"lignes": [
   ["BP-731402 (CMD-731402)", "2", "2", "oui"],
   ["REC-26-0415", "10 (annoncé 10, compté 10)", "10", "oui"],
   ["BP-731488 (CMD-731488)", "1", "1", "oui"],
   ["RET-26-0091", "1", "1", "oui"],
   ["DEM-26-0027", "2 (« Quantité : 2 »)", "1", "non"],
   ["BP-731530 (CMD-731530)", "3", "3", "oui"],
   ["BP-731561 (CMD-731561)", "3", "3", "oui"],
   ["BP-731578 (CMD-731578)", "2", "2", "oui"],
   ["BP-731590 (CMD-731590)", "2", "2", "oui"],
 ], "note": "Une seule ligne diffère. Confirmé : trois lignes de plus, toutes « oui »."},
 "Quel document ne dit pas la même chose": {"rep": "DEM-26-0027 (le constat de casse)."},
 "Écart entre le document et le mouvement": {"rep": "1 (2 constatés, 1 saisi)."},
 "T: Commande | Stock trouvé (bon de préparation)": {"lignes": [
   ["CMD-731402", "4", "4", "oui"],
   ["CMD-731488", "12", "12", "oui"],
   ["CMD-731530", "10", "11", "non"],
   ["CMD-731561", "7", "8", "non"],
   ["CMD-731578", "4", "5", "non"],
   ["CMD-731590", "2", "3", "non"],
   ["CMD-731602 (annulée)", "0", "1", "non"],
 ], "note": "Le « Stock trouvé » est le stock réel vu au rayon. Il décroche d'une unité à partir de CMD-731530, juste après la casse. Confirmé : avant la casse tout est pareil (CMD-731420 10 / 10, CMD-731402 7 / 7, CMD-731488 15 / 15, CMD-731515 14 / 14) ; après, mêmes valeurs que le standard."},
 "À partir de quelle commande le « Stock trouvé »": {"rep": "CMD-731530."},
 "Quel mouvement a eu lieu juste avant cette commande": {"rep": "La casse DEM-26-0027.", "note": "Seconde preuve, indépendante du constat : le rayon a toujours un écouteur de moins que le système après la casse."},
 "Comment as-tu su quel document était faux": {"pistes": [
   "En comparant ligne par ligne : une seule quantité ne correspondait pas.",
   "Le constat dit « saisi sur le terminal » : il fallait vérifier la saisie.",
   "La colonne « Stock trouvé » décroche juste après la casse.",
   "Valoriser l'élève qui dit avoir d'abord soupçonné le retour client (fausse piste) puis vérifié."]},
 "T: Ce que je calcule | Mon calcul | Résultat": {"lignes": [
   ["Total des entrées (colonne « Entrée »)", "10 + 1", "11"],
   ["Total des sorties (colonne « Sortie »)", "2 + 1 + 1 + 3 + 3 + 2 + 2", "14"],
   ["Stock actuel (étape 3)", "", "1"],
   ["Stock du dernier inventaire, calculé à l'envers", "1 − 11 + 14", "4"],
   ["Vérification à l'endroit : inventaire + entrées − sorties", "4 + 11 − 14", "1"],
 ], "note": "Confirmé : entrées 6 + 10 + 1 = 17, sorties 3 + 2 + 1 + 3 + 1 + 3 + 3 + 2 + 2 = 20 ; 1 − 17 + 20 = 4. On calcule avec les mouvements saisis : c'est bien le 4 de l'inventaire."},
 "Si le système avait enregistré la quantité écrite": {"pistes": [
   "Le système afficherait 0 (4 + 11 − 15 = 0) au lieu de 1.",
   "Les écouteurs seraient affichés « en rupture » : le site n'aurait pas vendu la paire de la cliente, sa commande n'aurait pas été annulée.",
   "Accepter la réponse sans le calcul si l'idée est là : un de moins, donc zéro."]},
 "T: Ligne de Nadia | Ce que j'écris": {"lignes": [
   ["Stock actuel :", "1"],
   ["Réception :", "REC-26-0415, 10"],
   ["Commandes :", "CMD-731402, CMD-731488, CMD-731530, CMD-731561, CMD-731578, CMD-731590"],
   ["Retour :", "RET-26-0091"],
   ["Casse :", "DEM-26-0027"],
   ["Stock au dernier inventaire :", "1 − 11 + 14 = 4"],
   ["Ce qui cloche :", "DEM-26-0027 : 2 constatés, 1 saisi, écart 1"],
 ], "note": "Ce que lisent les six jalons : dernier nombre de « Stock actuel » (1) ; « Réception » : REC-26-0415 et 10, sans REC-26-0412 ; « Commandes » : les six, ni CMD-731455, ni CMD-731545, ni CMD-731602 (annulée) ; RET et DEM sur leurs lignes ; dernier nombre de « Stock au dernier inventaire » (4) ; « Ce qui cloche » : DEM-26-0027, aucun autre document, dernier nombre 1. Confirmé : Réception REC-26-0409 et REC-26-0415, 16 (ou 6 et 10) ; Commandes + CMD-731420 et CMD-731515 ; calcul 1 − 17 + 20 = 4."},
 "Si tu étais à la place de Nadia": {"pistes": [
   "Corriger le stock du système : sortir l'écouteur cassé non saisi (un ajustement de −1, avec le constat comme justificatif).",
   "Vérifier les autres articles de l'allée : une erreur de saisie peut se répéter (c'est le mot de clôture de Nadia, et la suite de la série).",
   "Rappeler la règle à l'équipe : saisir la quantité du constat.",
   "Accepter : prévenir le service client, recontacter la cliente."]},
}


# --------------------------------------------------------------------------------- ENT-2.2
# Export : 30 lignes (A-01 à A-04, 8 références) ; confirmé 45 lignes (toute l'allée A, 12 références).
# Constats (stock trouvé ≠ logiciel) : CHG-20W 3, CAB-USBC-1M 2, COQ-UNI-01 2, BAT-10K 1 ; 8 lignes en écart.
# Colonnes de l'export : A Date … H Stock logiciel, I Stock trouvé, J Préparateur → K « Écart », L « Réf. en écart ».
ENT_2_2 = {
 "Que veulent dire les lettres WMS": {"rep": "Warehouse Management System : système (logiciel) de gestion d'entrepôt.", "note": "Définition courante (par exemple Wikipédia, « Warehouse management system »)."},
 "Date du Black Friday 2026": {"rep": "Le vendredi 27 novembre 2026.", "note": "Le Black Friday est le lendemain de Thanksgiving (4e jeudi de novembre aux États-Unis, le 26/11/2026)."},
 "À quoi sert un WMS": {"rep": "À suivre tout ce qui se passe dans l'entrepôt : réceptions, emplacements, stock, préparations des commandes, expéditions, inventaires.", "note": "Accepter toute réponse qui parle de suivre le stock ou les flux de l'entrepôt."},
 "Le logiciel affiche déjà toutes les commandes": {"pistes": [
   "À l'écran, on lit une commande à la fois ; dans un tableur, on peut calculer sur toutes les lignes d'un coup.",
   "On peut trier, filtrer, compter, faire des totaux que l'écran ne propose pas.",
   "On garde une trace de l'analyse et on peut la transmettre."]},
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Quelle allée Nadia veut-elle vérifier ?", "L'allée A"],
   ["Dans quel menu fais-tu l'export ?", "Extractions (partie Outils du menu de gauche)"],
   ["Quelle liste exportes-tu ?", "« Lignes de préparation »"],
   ["Nom de la première colonne à ajouter", "Écart"],
   ["Nom de la deuxième colonne à ajouter", "Réf. en écart"],
   ["Fonction à utiliser dans la deuxième colonne", "SI"],
   ["Fonction à utiliser dans la feuille Synthèse", "NB.SI"],
   ["Par quels mots doit commencer la ligne de ta réponse ?", "« À recompter : »"],
 ]},
 "Nadia écrit : « On ne recompte pas tout »": {"pistes": [
   "Recompter prend du temps et mobilise des personnes, alors que l'entrepôt continue d'expédier.",
   "Les chiffres permettent de viser les références à risque : on recompte là où il y a un signal.",
   "Avant le Black Friday, le temps de l'équipe est précieux."]},
 "Avec « Allée » sur « Toutes »": {"rep": "Il augmente."},
 "Explique pourquoi, avec ce que tu vois dans le tableau": {"rep": "S'ajoutent les lignes de préparation des allées B et C du mois, que Nadia ne demande pas.", "note": "12 lignes de plus (allées B et C, préparées dans les 20 derniers jours). Avec « Tout l'historique », 8 lignes de plus (allée A, il y a 32 à 45 jours). Valoriser l'élève qui explique par la colonne « Emplacement » ou « Date »."},
 "Nombre de lignes affiché dans Extractions": {"rep": "Lu à l'écran par l'élève : 30 avec les critères réglés (confirmé : 45).", "note": "La trame ne donne jamais ce nombre : il dépend du niveau (confirmé = toute l'allée A, A-01 à A-06). Le corrigé par élève (onglet Corrigés) donne son bon export. Les 30 lignes couvrent le mois, dont 12 d'avant le dernier inventaire, toutes sans écart."},
 "Ton fichier a-t-il le même nombre de lignes": {"rep": "Oui : le fichier contient exactement ce que montrait l'écran (sans la ligne des titres).", "note": "Si « non » : l'élève compte souvent la ligne des titres, ou a changé un critère entre la lecture et l'export."},
 "Pourquoi choisir les lignes dans le logiciel": {"pistes": [
   "Le fichier est plus petit et ne contient que ce qu'on va analyser : moins de risques de compter une ligne d'une autre allée ou d'un autre mois.",
   "Dans un vrai WMS, l'export complet peut faire des milliers de lignes ; on extrait ce qu'on veut.",
   "Les critères disent clairement sur quoi porte l'analyse : quelqu'un d'autre peut refaire le même export."]},
 "Lettre de la colonne « Stock logiciel »": {"rep": "H."},
 "Lettre de la colonne « Stock trouvé »": {"rep": "I."},
 "Lettre de la première colonne vide": {"rep": "K."},
 "Choisis une ligne où le stock trouvé n'est pas égal": {"pistes": [
   "Trouvé < logiciel : article cassé, perdu ou volé sans être saisi ; une erreur de préparation passée ; une réception saisie en trop.",
   "Trouvé > logiciel (câbles CAB-USBC-1M) : un retour ou une réception rangés sans être saisis, un article d'un autre emplacement.",
   "Accepter toute cause plausible reliée à la ligne choisie."]},
 "Combien de lignes ont un écart différent de 0": {"rep": "8.", "note": "BP-732101 CAB +3 ; BP-732118 CHG −3 ; BP-732126 COQ −2 ; BP-732167 CHG −3 ; BP-732181 CAB +3 et COQ −2 ; BP-732195 BAT −2 ; BP-732210 CHG −3. Confirmé : 8 aussi (les références A-05 / A-06 n'ont aucun écart)."},
 "Pourquoi écrire une formule, plutôt que": {"pistes": [
   "Moins d'erreurs de calcul ; on recopie une fois pour toutes les lignes.",
   "Si une valeur change, le résultat se met à jour tout seul.",
   "On peut vérifier le calcul (la formule se lit) ; le contrôle du dépôt refuse d'ailleurs un nombre tapé."]},
 "Quelle partie de la formule SI": {"pistes": [
   "Réponse personnelle : le test (<> 0), les guillemets vides, les points-virgules, l'adresse D2 au lieu d'un texte.",
   "Valoriser l'élève qui explique comment il s'est corrigé."]},
 "T: Référence | Nb constats | Référence | Nb constats": {"lignes": [
   ["CAB-USBC-1M", "2", "BAT-10K", "1"],
   ["CHG-20W", "3", "CLE-64G", "0"],
   ["ECO-BT-01", "0", "AMP-LED-E27", "0"],
   ["SOU-SF-02", "0", "COQ-UNI-01", "2"],
 ], "note": "Confirmé : quatre lignes de plus (CAS-FIL-01, SUP-VOIT, CLA-SF-01, HUB-USB-4), toutes à 0."},
 "Formule que tu as écrite en B2": {"rep": "=NB.SI(Préparations!L:L;A2)", "note": "Sous LibreOffice, la même formule s'affiche =NB.SI($Préparations.L:L;A2). Accepter une plage limitée (L2:L31) si elle couvre toutes les lignes."},
 "Une référence a plusieurs constats, une autre un seul": {"pistes": [
   "Plusieurs constats (CHG-20W, 3) : le défaut se répète, le stock est sûrement faux.",
   "Un seul constat (BAT-10K) peut être un écart réel aussi : le nombre d'articles manquants compte autant (2 batteries).",
   "Accepter tout choix argumenté ; à la séance suivante, toutes seront recomptées."]},
 "T: Dépôt | Résultats justes | Ce qui clochait": {"lignes": [
   ["1er", "Variable (68 sur 68 si tout est juste)", "Variable"],
 ], "note": "Total des contrôles, pour le bon export : 30 écarts + 30 « Réf. en écart » + 8 lignes de synthèse = 68 (confirmé : 45 + 45 + 12 = 102) ; il change si l'export de l'élève a d'autres lignes (les formules sont contrôlées sur SON fichier). L'export est jugé à part, au-dessus : « ✓ Export : vos critères donnent bien les lignes demandées. » ou « ✗ Export à refaire (Extractions) » avec le critère à changer (« « Allée » : choisissez « A ». »). Le jalon « export » reste en attente tant que rien n'est déposé. Messages fréquents : « la cellule contient un nombre tapé, pas une formule » ; fonction SI ou NB.SI absente."},
 "Si ton premier dépôt n'était pas tout juste": {"pistes": [
   "Réponse personnelle : remplacer des nombres tapés par une formule, recopier la formule jusqu'en bas, corriger le test du SI, la plage du NB.SI.",
   "Valoriser l'élève qui cite le message « Ce qui cloche » et le geste qui l'a corrigé."]},
 "T: Référence | Nombre de constats": {"lignes": [
   ["CHG-20W", "3"], ["CAB-USBC-1M", "2"], ["COQ-UNI-01", "2"], ["BAT-10K", "1"],
 ], "note": "La bonne liste est la même en confirmé. Le jalon 5 juge la liste contre la synthèse DÉPOSÉE par l'élève (une erreur de synthèse ne se paie qu'une fois)."},
 "Nadia aurait pu faire recompter toute l'allée": {"pistes": [
   "Quatre références au lieu de huit (ou douze) : deux à trois fois moins de travail, au moment où l'entrepôt est chargé.",
   "La liste est justifiée par des chiffres, pas au hasard.",
   "Limite à accepter : une référence sans constat peut aussi être fausse (personne ne l'a préparée) — d'où l'inventaire complet de temps en temps."]},
}
_EXTRAS_2_2 = {
 (4, "Formule que tu as écrite en ligne 2"): {"rep": "=I2-H2", "note": "Ou toute formule équivalente (=I2-H2 recopiée). Un nombre tapé est refusé au dépôt."},
 (5, "Formule que tu as écrite en ligne 2"): {"rep": "=SI(K2<>0;D2;\"\")", "note": "Équivalents acceptés : =SI(K2=0;\"\";D2). Le contrôle exige la fonction SI (IF) et la référence recopiée sur les seules lignes en écart."},
}


# --------------------------------------------------------------------------------- ENT-2.3
# Relevé (toute l'allée) : CAB 67, CHG 41, ECO 22, SOU 29, BAT 8, CLE 37, AMP 37, COQ 25, CAS 12, SUP 22, CLA 9, HUB 16.
# Système des quatre références à écart : CAB 64, CHG 44, BAT 10, COQ 27. Bonne liste : CAB, CHG, BAT, COQ.
# Une référence à écart oubliée revient par l'aléa « Rayon à vérifier : <réf> » (Yanis Cazenave) : le périmètre
# final contient toujours les quatre. Confirmé : + CAS-FIL-01, SUP-VOIT, CLA-SF-01, HUB-USB-4 (écart 0).
ENT_2_3 = {
 "Qu'est-ce qu'un inventaire tournant": {"rep": "Un inventaire fait par petites parties (une allée, une famille d'articles) tout au long de l'année, sans arrêter l'activité, au lieu de tout compter en une fois.", "note": "Accepter toute définition qui dit « par parties » et « au fil de l'année »."},
 "D'après l'article L123-12": {"rep": "Au moins une fois tous les douze mois.", "note": "Code de commerce, art. L123-12 : « Elle doit contrôler par inventaire, au moins une fois tous les douze mois, l'existence et la valeur des éléments actifs et passifs du patrimoine de l'entreprise. » L'inventaire tournant permet d'y répondre sans fermer l'entrepôt."},
 "D'après ce que tu as trouvé, pourquoi un entrepôt qui expédie": {"pistes": [
   "On n'arrête pas les expéditions : on compte une petite zone à la fois.",
   "Les erreurs sont trouvées plus tôt, avant qu'elles fassent vendre ce qu'on n'a pas (ENT-2.1).",
   "On peut viser les références à risque (ENT-2.2).",
   "Avant le Black Friday, fermer l'entrepôt pour compter serait impossible."]},
 "T: Ce que tu relèves | Références": {"lignes": [
   ["Les références que Nadia confirme", "Celles de la liste de l'élève (bonne liste : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01)"],
   ["Les références ajoutées par un message (s'il y en a)", "Chaque référence à écart oubliée revient par « Rayon à vérifier : <réf> »"],
 ], "note": "La première réponse reconnue fixe la liste. Élève absent en ENT-2.2 : l'enseignant lui dit de répondre « Absent » ; Nadia envoie alors la liste préparée par Mathis Darrigade (la bonne). Un intrus (par exemple ECO-BT-01) se compte aussi : écart 0, aucune décision."},
 "Un message t'a-t-il ajouté une référence": {"pistes": [
   "Si oui : souvent BAT-10K (un seul constat en ENT-2.2, on la croit moins urgente) ; une erreur de synthèse ou de recopie.",
   "Si non : la liste venait directement de la synthèse NB.SI (toutes les références à au moins un constat).",
   "L'oubli ne se paie qu'une fois (en ENT-2.2) : ici, la référence est traitée comme les autres."]},
 "Date du dernier inventaire de l'allée A": {"rep": "Il y a dix jours (la date est écrite dans la mission).", "note": "Calculée à l'ouverture de la séance."},
 "Numéro de la campagne d'inventaire": {"rep": "INV-2026-52."},
 "Que dit la note du relevé sur l'emplacement A-01-1": {"rep": "Le bac a été compté d'un coup, boîtes Kabeo en vrac.", "note": "Indice : le comptage des câbles est douteux (cartons de chargeurs dedans)."},
 "Que dit la note du relevé sur l'emplacement A-04-2": {"rep": "Recompté deux fois, bacs voisins vérifiés : rien d'étranger dedans.", "note": "Indice : le manque des coques ne vient ni d'un comptage ni d'un rangement."},
 "T: De qui ? | Article(s) concerné(s)": {"lignes": [
   ["Kevin Larrieu, cariste", "Câbles et chargeurs Kabeo (REC-26-0431)", "Il croit avoir rangé des cartons de la palette au mauvais endroit, côté A-01"],
   ["Inès Lagarde, préparatrice", "BAT-10K (CMD-732153, REI-26-0012)", "Commande annulée : 2 batteries réintégrées, posées dans un autre bac de A-03"],
   ["Service retours", "ECO-BT-01 (RET-26-0107)", "Retour client remis en stock en A-02-1"],
   ["Kevin Larrieu, cariste", "SOU-SF-02 (DEM-26-0031)", "Une souris cassée, sortie du stock"],
   ["Yanis Cazenave, préparateur (s'il y a un oubli)", "La référence oubliée", "« Rayon à vérifier » : moins (ou plus) d'articles que le système"],
 ], "note": "Le retour et la casse concernent des références sans écart (bien saisies) : ce sont des fausses pistes, utiles si l'élève a un intrus."},
 "Parmi ces messages, lequel te paraît le plus utile": {"pistes": [
   "Kevin (palette Kabeo) : il explique à la fois les câbles en trop et les chargeurs manquants.",
   "Inès (annulation) : elle explique les batteries manquantes.",
   "Accepter tout choix relié à un écart réel."]},
 "T: Emplacement | Référence | Compté (relevé)": {"lignes": [
   ["A-01-1", "CAB-USBC-1M", "67"],
   ["A-01-2", "CHG-20W", "41"],
   ["A-03-1", "BAT-10K", "8"],
   ["A-04-2", "COQ-UNI-01", "25"],
 ], "note": "Pour la bonne liste. Intrus éventuels : leur quantité du relevé (ECO 22, SOU 29, CLE 37, AMP 37). Confirmé : + A-05-1 CAS-FIL-01 12, A-05-2 SUP-VOIT 22, A-06-1 CLA-SF-01 9, A-06-2 HUB-USB-4 16."},
 "Pourquoi l'équipe compte-t-elle sans voir": {"pistes": [
   "Pour ne pas être influencée : si on voit 44, on a tendance à « trouver » 44.",
   "Le comptage doit dire ce qu'on voit, pas confirmer le système."]},
 "T: Référence | Système | Compté | Écart": {"lignes": [
   ["CAB-USBC-1M", "64", "67", "+3"],
   ["CHG-20W", "44", "41", "−3"],
   ["BAT-10K", "10", "8", "−2"],
   ["COQ-UNI-01", "27", "25", "−2"],
 ], "note": "Confirmé : quatre lignes de plus, écart 0 (CAS 12, SUP 22, CLA 9, HUB 16). Intrus : écart 0."},
 "Combien de tes références ont un écart différent de 0": {"rep": "4.", "note": "Les quatre références à écart sont toujours dans le périmètre (liste ou aléa)."},
 "Regarde tes écarts ensemble": {"pistes": [
   "Le +3 des câbles et le −3 des chargeurs s'annulent : même marque, même taille de carton, voisins en A-01 (message de Kevin).",
   "Tous les écarts ne sont pas des pertes : un surplus existe aussi.",
   "Valoriser l'élève qui fait le lien avant d'ouvrir les mouvements."]},
 "T: Référence | Écart | Cause trouvée": {"lignes": [
   ["CAB-USBC-1M", "+3", "Bac compté d'un coup (note du relevé) ; message de Kevin : cartons de chargeurs rangés côté A-01 ; aucun mouvement n'explique 3 câbles de plus", "Demander un recomptage (recompté : 64, écart 0)"],
   ["CHG-20W", "−3", "Mouvements : REC-26-0431 (+30) ; les 3 chargeurs sont dans le bac des câbles", "Ne pas régulariser : remettre en rayon"],
   ["BAT-10K", "−2", "Message d'Inès : CMD-732153 annulée, REI-26-0012 (+2) juste, batteries posées dans un autre bac", "Ne pas régulariser : remettre en rayon"],
   ["COQ-UNI-01", "−2", "Aucun mouvement, aucun message ; recompté deux fois, bacs voisins vérifiés", "Régulariser, motif « Démarque inconnue »"],
 ], "note": "Ce sont les quatre décisions jugées justes par l'écran (correction détaillée). Jalons : rangements repérés sans régulariser à tort (CHG, BAT, et pas de régularisation des câbles) ; témoin COQ régularisé avec son motif."},
 "Pour une référence que tu n'as pas régularisée": {"pistes": [
   "CHG-20W : les chargeurs existent, ils sont dans le bac voisin (message de Kevin, surplus des câbles).",
   "BAT-10K : la réintégration est saisie, Inès dit où elle a posé les batteries.",
   "CAB-USBC-1M : régulariser aurait créé trois câbles qui n'existent pas ; le recomptage le montre."]},
 "Pour la référence que tu as régularisée": {"pistes": [
   "COQ-UNI-01 : aucun mouvement, aucun message ; l'équipe a recompté deux fois et vérifié les bacs voisins (note du relevé).",
   "Toutes les pistes écartées : c'est de la démarque inconnue."]},
 "T: Ce que je calcule | Mon calcul | Résultat": {"lignes": [
   ["Somme des écarts, sans leur signe", "3 + 3 + 2 + 2", "10"],
   ["Somme des stocks système", "64 + 44 + 10 + 27", "145"],
   ["Taux d'écart (%), arrondi au dixième", "10 ÷ 145 × 100", "6,9 %"],
 ], "note": "Le taux se calcule sur le périmètre de l'élève, avant traitement (l'écart des câbles compte 3 même après le recomptage). Avec un intrus ECO-BT-01 : 10 ÷ 167 = 6,0 %. Confirmé : 10 ÷ 204 = 4,9 %. L'ancien 3,7 % (allée entière) est faux depuis le recadrage."},
 "Combien de décisions justes sur combien": {"rep": "Variable : 4 sur 4 pour un parcours juste.", "note": "Phrase de l'écran : « 4 décisions justes sur 4 »."},
 "Ton taux d'écart est-il juste": {"rep": "Variable (l'écran écrit « Taux d'écart : juste »)."},
 "Lis « Ce qu'il fallait voir »": {"pistes": [
   "Réponse personnelle. Le plus souvent : la paire câbles / chargeurs qui s'annule, ou le fait qu'une réintégration juste peut laisser un article au mauvais endroit.",
   "Valoriser l'élève qui relie son erreur à un indice qu'il n'avait pas lu (note du relevé, message)."]},
}


# --------------------------------------------------------------------------------- ENT-2.4
# Export : 20 ajustements (confirmé 30), tout l'entrepôt ; un seul sans document : AJ-26-0217, MIX-PLG −4,
# « Démarque inconnue » (Samir). Motifs : Casse 7, Erreur de prélèvement 5, Erreur de réception 3, Démarque inconnue 5
# (confirmé 10 / 8 / 5 / 7). Enquête : GRP-2F −1 « Casse » justifié par DEM-26-0036 ; MIX-PLG : REC-26-0447,
# BL 12, colis 4 + 4 = 8, prix d'achat 12,60 €, manque 4 × 12,60 = 50,40 € ; motif « Erreur de réception » ;
# réclamation auprès de Gardéo dans les 8 jours. Export filtré (04/10/2026) : écran Extractions, liste « Mouvements de
# stock », critères du message de Nadia (Ajustement inventaire / Toutes / 30 derniers jours ; départ Tous / Toutes / 7 j).
# Colonnes : A Date, B Type, C N° mouvement, D Référence, E Désignation, F Allée, G Quantité, H Motif, I Document,
# J Saisi par → K « À vérifier ». Feuille « Mouvements ».
ENT_2_4 = {
 "Nom du service qui stocke et expédie": {"rep": "Octopia Fulfillment (« Fulfillment by Cdiscount »).", "note": "Source : marketplace.cdiscount.com, page « Octopia Fulfillment » (relue le 04/10/2026). Accepter « Cdiscount Fulfilment »."},
 "Dans quel entrepôt vont les petits produits": {"rep": "Cestas (Gironde).", "note": "Même page : Cestas pour les produits de moins de 30 kg et de moins de 2 m."},
 "Que fait ce service pour le vendeur": {"rep": "Il stocke ses produits, les emballe et les expédie à ses clients ; il gère aussi les retours.", "note": "Même page : « stockage, emballage et expédition de vos produits »."},
 "D'après ce que tu as trouvé, quand Cdiscount stocke": {"pistes": [
   "Le vendeur : son espace affiche un stock faux, il ne vend pas ce qu'il a, ou vend ce qu'il n'a plus.",
   "Les clients du vendeur (commandes annulées) ; Cdiscount, responsable de la marchandise qu'on lui confie.",
   "Valoriser l'élève qui voit que la marchandise n'appartient pas à Cdiscount."]},
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Par quoi Nadia te demande-t-elle de commencer ?", "Par le tableur : exporter les ajustements du mois (Extractions, liste « Mouvements de stock »)"],
   ["Les critères de l'extraction : « Type de mouvement »", "Ajustement inventaire"],
   ["Les critères de l'extraction : « Allée »", "Toutes"],
   ["Les critères de l'extraction : « Période »", "30 derniers jours"],
   ["Combien d'ajustements Samir a-t-il passés dans l'allée B ?", "2 (campagne INV-2026-47)"],
   ["Combien de lignes doit contenir ta réponse ?", "8"],
   ["Délai pour réclamer auprès du fournisseur", "8 jours après la livraison"],
   ["Le vendeur : combien de mixeurs livrés pour son compte ?", "12 (livrés par Gardéo le jour de REC-26-0447)"],
   ["Le vendeur : combien son espace en affiche-t-il maintenant ?", "8"],
 ]},
 "Samir écrit : « Pas besoin d'aller plus loin. »": {"pistes": [
   "Il a recompté, mais il n'a pas cherché de cause : « ça arrive » n'est pas une explication.",
   "Un ajustement efface la trace : sans enquête, on ne pourra plus réclamer à personne.",
   "Question de prévision : toute réponse argumentée est recevable."]},
 "Nombre de lignes affiché dans Extractions": {"rep": "Lu à l'écran par l'élève : 20 avec les critères de Nadia (confirmé : 30).", "note": "La trame ne donne jamais ce nombre. Tout l'entrepôt (allées A, B, C) sur 30 jours. Un ajustement passé par l'élève à la console s'y ajoute. Le corrigé par élève (onglet Corrigés) donne son bon export. Erreurs typiques : Type laissé sur « Tous » (réceptions et préparations en trop), Allée sur « B » (4 ajustements seulement, dont les deux de Samir : 16 manquent, 26 en confirmé), Période laissée sur « 7 derniers jours » (ajustements manquants) ou « Tout l'historique » (7 ajustements du mois précédent en trop)."},
 "Ton fichier a-t-il autant de lignes de données": {"rep": "Oui : le fichier contient ce que montrait l'écran (sans la ligne des titres)."},
 "Au départ, la période était sur « 7 derniers jours »": {"pistes": [
   "Les ajustements de plus d'une semaine : Nadia clôture le MOIS, elle doit tous les voir.",
   "Le compte par motif serait faux (trop peu d'ajustements) et la démarque inconnue paraîtrait plus faible ou plus forte qu'elle n'est.",
   "Au dépôt, le site l'aurait dit : « Il manque n lignes demandées »."]},
 "Lettre de la colonne « Document »": {"rep": "I.", "note": "L'export a maintenant 10 colonnes : la colonne B « Type » s'est ajoutée."},
 "Formule que tu as écrite en ligne 2": {"rep": "=SI(I2=\"\";\"À VÉRIFIER\";\"\")", "note": "Écrite en K2. Équivalents : =SI(ESTVIDE(I2);\"À VÉRIFIER\";\"\"). Le contrôle exige SI (IF) et lit « À VÉRIFIER » sans tenir compte des majuscules ni des accents."},
 "Combien de lignes affichent À VÉRIFIER": {"rep": "1 (AJ-26-0217, MIX-PLG, −4, Démarque inconnue, Samir Benkhelifa).", "note": "Une seule aussi en confirmé. Si l'élève a passé lui-même un ajustement à la console, il entre dans l'export, sans document."},
 "Un ajustement sans document : pourquoi": {"pistes": [
   "Elle signe sans savoir pourquoi le stock a changé : si c'est une erreur, elle l'officialise.",
   "Sans document, on ne peut ni réclamer, ni prouver, ni retrouver la cause plus tard.",
   "Mission de Nadia : « je ne signe pas un ajustement dont je ne connais pas la cause »."]},
 "T: Motif | Nombre": {"lignes": [
   ["Casse", "7"], ["Erreur de prélèvement", "5"], ["Erreur de réception", "3"], ["Démarque inconnue", "5"],
 ], "note": "Confirmé : 10 / 8 / 5 / 7. Les motifs doivent être écrits comme dans l'export (le contrôle ignore majuscules et accents)."},
 "Formule que tu as écrite en B2": {"rep": "=NB.SI(Mouvements!H:H;A2)", "note": "Sous LibreOffice : =NB.SI($Mouvements.H:H;A2). Le contrôle exige NB.SI (COUNTIF)."},
 "Regarde ta synthèse. La démarque inconnue": {"pistes": [
   "5 sur 20, un quart des ajustements : c'est beaucoup pour un motif qui veut dire « on ne sait pas ».",
   "Et l'un d'eux (les mixeurs) n'a même pas de fiche de recomptage : c'est lui qui gonfle le chiffre sans preuve.",
   "Accepter une réponse nuancée si elle s'appuie sur les nombres."]},
 "T: Dépôt | Résultats justes | Ce que j'ai corrigé": {"lignes": [
   ["1er", "Variable (24 sur 24 si tout est juste)", "Variable"],
 ], "note": "Total, pour le bon export : 20 lignes « À vérifier » + 4 motifs = 24 (confirmé : 30 + 4 = 34) ; il change si l'export de l'élève a d'autres lignes (les formules sont contrôlées sur SON fichier). Retour d'entraînement : « n résultats justes sur m. Vous pouvez corriger votre fichier et le déposer de nouveau. », sans détail. L'export est jugé à part, au-dessus (niveau 2) : « ✓ Export : vos critères donnent bien les lignes demandées. » ou « ✗ Export à refaire (Extractions) » avec « n lignes en trop : leur « Type de mouvement » ne correspond pas à la demande » ou « Il manque n lignes demandées ». Le jalon « export » reste en attente tant que rien n'est déposé."},
 "Sans le détail des erreurs, comment as-tu vérifié": {"pistes": [
   "Compter soi-même les lignes sans document et les motifs (filtre, tri) et comparer avec ses formules.",
   "Vérifier que la somme de la synthèse égale le nombre de lignes de son export (celui affiché dans Extractions).",
   "Relire une formule recopiée en bas du tableau."]},
 "T: Référence | Quantité | Motif saisi | Document": {"lignes": [
   ["MIX-PLG", "−4", "Démarque inconnue", "aucun (ajustement orphelin)"],
   ["GRP-2F", "−1", "Casse", "DEM-26-0036 (constat de Kevin Larrieu)"],
 ], "note": "Lignes « Ajustement inventaire » de l'onglet Mouvements, origine « INV-2026-47 · … », saisies par Samir Benkhelifa."},
 "Pour l'ajustement justifié, quelle phrase": {"rep": "Le constat DEM-26-0036 : un grille-pain GRP-2F, quantité 1, « Je n'ai pas eu le temps de le saisir : Samir l'a passé en ajustement « Casse » ce matin. »"},
 "Pour l'un des deux ajustements, qu'est-ce qui t'a fait passer": {"pistes": [
   "Le grille-pain : la casse paraît suspecte (même nuit, même magasinier), mais le constat de Kevin la justifie, quantité comprise.",
   "Les mixeurs : le message de Samir paraît sûr (« recompté deux fois »), mais aucun document ; le message de Kevin (un trou dans la couche) met sur la piste de la réception.",
   "Valoriser l'élève qui cite le document ou le message décisif."]},
 "T: Colis n° | Référence | Contenu": {"lignes": [
   ["6", "MIX-PLG", "4"], ["7", "MIX-PLG", "4"],
 ], "note": "REC-26-0447 a 7 colis : BOU-17L (1 à 3, 4 chacun), GRP-2F (4 et 5, 4 chacun), MIX-PLG (6 et 7, 4 chacun). Le tableau imprime 4 lignes."},
 "Numéro de la réception": {"rep": "REC-26-0447 (Gardéo, BL-GD-30912, lot LOT-GD-2711)."},
 "Quantité annoncée pour l'article": {"rep": "12."},
 "Quantité réellement reçue": {"rep": "8 (4 + 4)."},
 "Prix d'achat HT de l'article": {"rep": "12,60 €.", "note": "Console : .getprice MIX-PLG (prix TTC 27,99 €, à ne pas prendre)."},
 "T: Ce que je calcule | Mon calcul | Résultat": {"lignes": [
   ["Quantité manquante", "12 − 8", "4"],
   ["Valeur du manque (quantité × prix d'achat)", "4 × 12,60", "50,40 €"],
 ]},
 "Le bon de réception affiche une quantité comptée": {"pistes": [
   "Le réceptionnaire a recopié l'annoncé sans compter les colis (« comptage » de complaisance).",
   "Kevin a vu un vide dans la couche, mais la réception était déjà validée et il n'a rien dit.",
   "Le système a donc fait entrer 12 mixeurs ; il n'y en avait que 8 : l'écart est né là, pas dans le rayon."]},
 "T: Ligne de Nadia | Ce que j'écris": {"lignes": [
   ["Ajustement à revoir :", "MIX-PLG, −4"],
   ["Ajustement justifié :", "GRP-2F, constat de casse DEM-26-0036"],
   ["Réception concernée :", "REC-26-0447"],
   ["Annoncé sur le bon de livraison :", "12"],
   ["Réellement reçu :", "8"],
   ["Valeur du manque :", "4 × 12,60 = 50,40 €"],
   ["Motif exact :", "Erreur de réception"],
   ["Suite à donner :", "Réclamation auprès de Gardéo (livraison incomplète), dans les 8 jours"],
 ], "note": "Ce que lisent les jalons : MIX-PLG sur « à revoir » sans GRP ; GRP-2F et DEM-26-0036 sur « justifié » ; REC-26-0447 seule ; 12 et 8 ; dernier nombre 50,40 ; « erreur de réception » (ou livraison incomplète) ; « réclam », « litige », « avoir » ou « réserve » sur la suite. La mission renvoie, comme la trame, à la colonne Motif de l'export."},
 "Julien Mounet attend une réponse": {"pistes": [
   "Ses 4 mixeurs ne sont jamais arrivés : Gardéo en a livré 8, pas 12 ; ce n'est ni une perte ni un vol à Cestas.",
   "Cdiscount réclame auprès de Gardéo (dans les 8 jours) et corrige l'ajustement : motif « Erreur de réception ».",
   "S'excuser du délai et lui dire quand son stock affiché sera juste.",
   "Pas de jalon sur ce point : valoriser une réponse claire, polie, qui ne promet pas ce qu'on ne maîtrise pas."]},
}


# --------------------------------------------------------------------------------- ENT-2.6
# Export brut 158 lignes (4 vides, 3 doublons, 5 dates en texte ; positions tirées par élève) → 151 propres ;
# confirmé 234 → 223. Dernier inventaire J-14 (date du message). Colonnes A Date … D Référence … H Stock logiciel,
# I Stock trouvé → K Écart, L Réf. en écart (SI + ET), M Écart retenu. Constats depuis J-14 et valeurs (écart × coût) :
# PIL-AA-8 8 / −2 / −6,20 ; CAB-USBC-1M 7 / +1 / +4,90 ; SUP-VOIT 5 / −2 / −9,60 ; CHG-20W 4 / −3 / −29,70 ;
# CLA-SF-01 3 / −2 / −28,40 ; ECO-BT-01 2 / −3 / −59,70 ; BOU-17L 2 / −2 / −27,80 ; MIX-PLG 2 / +2 / +25,20.
# Top 5 en valeur : ECO, CHG, CLA, BOU, MIX. Top 5 en fréquence : PIL, CAB, SUP, CHG, CLA. Piège : BAT-10K (avant J-14).
# Export filtré (04/10/2026) : niveau 3, bon réglage Allée « Toutes », Période « 30 derniers jours » (départ : Toutes,
# 7 derniers jours) ; 14 lignes des allées A et B d'avant le mois à écarter. L'écran montre les lignes propres (151).
ENT_2_6 = {
 "Que fait la fonction RECHERCHEV": {"rep": "Elle cherche une valeur dans la première colonne d'un tableau et rend la valeur d'une autre colonne, sur la même ligne.", "note": "Source : support.microsoft.com, « RECHERCHEV, fonction » (relue le 04/10/2026)."},
 "Dans quelle colonne de la plage doit se trouver": {"rep": "Dans la première colonne de la plage."},
 "Que veut dire FAUX en dernier argument": {"rep": "Correspondance exacte : la fonction cherche la valeur exacte, pas une valeur proche."},
 "Que s'affiche-t-il quand la valeur cherchée": {"rep": "#N/A."},
 "Dans un entrepôt, à quoi pourrait servir RECHERCHEV": {"pistes": [
   "Retrouver le prix, le poids, l'emplacement ou le fournisseur d'une référence à partir d'un tableau de référence (tarifs, catalogue).",
   "Rapprocher deux exports (commandes et stock, par exemple) par la référence.",
   "Accepter tout exemple avec une clé (référence, numéro) et une information rendue."]},
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Combien de références l'équipe peut-elle recompter ?", "5"],
   ["Quelles lignes Nadia te demande-t-elle d'exporter ? (recopie ses mots)", "« les lignes de préparation du mois »"],
   ["Quelles allées ?", "A et B"],
   ["Date du dernier inventaire", "Il y a 14 jours (date écrite dans le message)"],
   ["Quelle fonction pour compter les constats ?", "NB.SI.ENS"],
   ["Quelle fonction pour trouver le coût ?", "RECHERCHEV"],
   ["Sur quoi Nadia veut-elle que tu choisisses : le nombre de constats ou les euros ?", "Les euros : là où l'écart pèse le plus"],
 ]},
 "Nadia écrit : « Une erreur coûte plus cher": {"pistes": [
   "Un écart d'une batterie (24,90 €) coûte autant que huit lots de piles (3,10 €).",
   "Ce n'est pas le nombre d'erreurs qui compte, c'est leur valeur : on recompte d'abord ce qui coûte cher."]},
 "Critère « Allée » que tu as choisi": {"rep": "Toutes.", "note": "La demande porte sur les allées A et B ; la liste ne contient que ces deux allées. « A » ou « B » seule ferait manquer la moitié des lignes. Au départ, l'écran est déjà sur « Toutes »."},
 "Critère « Période » que tu as choisi": {"rep": "30 derniers jours.", "note": "« Du mois ». Au départ, l'écran est sur « 7 derniers jours » : il manquerait les constats depuis l'inventaire du J-14 et la ligne-piège BAT-10K. « Tout l'historique » ajoute 14 lignes d'avant le mois. Une période « Personnalisée » qui donne les mêmes lignes est jugée juste (on juge les lignes, pas le menu)."},
 "Nombre de lignes affiché dans Extractions": {"rep": "Lu à l'écran par l'élève : 151 avec les bons critères (confirmé : 223).", "note": "La trame ne donne jamais ce nombre. L'écran montre les lignes PROPRES ; le fichier sort brut (lignes vides et doublons en plus). Le corrigé par élève (onglet Corrigés) donne son bon export."},
 "Explique tes deux choix avec les mots de la demande": {"pistes": [
   "« Dans les allées A et B » : il faut les deux, donc « Toutes » (la liste n'a pas d'autres allées).",
   "« Du mois » : 30 derniers jours ; 7 jours ferait manquer des constats depuis l'inventaire, tout l'historique ajouterait des lignes anciennes.",
   "Au dépôt, le site dit seulement « ne correspond pas à la demande » : relire la demande est la seule aide (niveau 3)."]},
 "Nombre de lignes de données avant nettoyage": {"rep": "158 avec les bons critères.", "note": "Confirmé : 234. Plus que le nombre affiché dans Extractions : les lignes vides et les doublons ne sont que dans le fichier."},
 "Nombre de lignes vides supprimées": {"rep": "4.", "note": "Positions tirées pour chaque élève (graine) ; le nombre ne change pas pour un niveau donné."},
 "Nombre de doublons supprimés": {"rep": "3.", "note": "Au moins un doublon tombe sur un constat d'après l'inventaire : non supprimé, il fausse NB.SI.ENS."},
 "Nombre de dates en texte corrigées": {"rep": "5.", "note": "Au moins trois sur des constats d'après l'inventaire. Le contrôle « Export nettoyé » vérifie le nombre de lignes, les doublons ET la colonne Date entièrement en vraies dates."},
 "Nombre de lignes de données après nettoyage": {"rep": "151 avec les bons critères : oui, le même nombre que dans Extractions.", "note": "Confirmé : 223. C'est le contrôle que la trame donne à l'élève à la place d'un nombre attendu."},
 "Comment as-tu repéré la salissure": {"pistes": [
   "Souvent les dates en texte (elles ressemblent aux autres) ou les doublons (il faut trier pour les voir).",
   "Valoriser la méthode : trier, regarder l'alignement, compter avant / après."]},
 "Formule que tu as écrite en L2": {"rep": "=SI(ET(K2<>0;A2>=DATE(aaaa;mm;jj));D2;\"\")", "note": "Avec la date du dernier inventaire du message (J-14), par exemple DATE(2026;9;20) pour une séance ouverte le 04/10/2026. M2 : =K2."},
 "Une référence avait beaucoup d'écarts avant l'inventaire": {"rep": "Ses écarts ont été corrigés (régularisés) le jour de l'inventaire : ils n'existent plus dans le stock. La recompter serait un recomptage perdu.", "note": "BAT-10K : 5 constats avant J-14 (6 en confirmé), aucun après. Sans critère de date, elle entre 2e dans les cinq."},
 "Si tu avais oublié le critère de date": {"pistes": [
   "Des références déjà régularisées à l'inventaire seraient revenues dans la liste (BAT-10K entrait 2e) : un recomptage perdu.",
   "Une référence vraiment en difficulté aurait pu sortir des cinq.",
   "Valoriser l'élève qui cite une référence de son fichier."]},
 "Formule que tu as écrite en B2": {"rep": "=NB.SI.ENS(Préparations!D:D;A2;Préparations!K:K;\"<>0\";Préparations!A:A;\">=\"&DATE(aaaa;mm;jj))", "note": "Le contrôle exige NB.SI.ENS (COUNTIFS) et les bonnes valeurs (voir l'en-tête du dictionnaire). Variante acceptée : compter la colonne L (Réf. en écart) avec NB.SI.ENS sur la seule référence."},
 "Pourquoi as-tu besoin de trois critères": {"pistes": [
   "Il faut à la fois la bonne référence, un écart non nul ET une date après l'inventaire.",
   "NB.SI ne sait tester qu'une condition ; NB.SI.ENS les teste toutes ensemble sur la même ligne."]},
 "Formule que tu as écrite en C2": {"rep": "=SIERREUR(RECHERCHEV(A2;Préparations!L:M;2;FAUX);0)", "note": "L'écart d'une référence est constant après son apparition : la première ligne trouvée suffit."},
 "Formule que tu as écrite en D2": {"rep": "=RECHERCHEV(A2;Tarifs!A:C;3;FAUX)", "note": "E2 : =C2*D2. Le contrôle « Valeur de l'écart » exige une formule dans chaque case, RECHERCHEV quelque part dans la feuille Synthèse, et une tolérance de 0,01 €."},
 "Pourquoi RECHERCHEV vaut-elle mieux": {"pistes": [
   "Moins d'erreurs de recopie ; si un coût change dans Tarifs, la synthèse suit.",
   "Rapide sur 18 références, indispensable sur des milliers."]},
 "T: Référence | Constats | Valeur de l'écart (€) | Référence": {"lignes": [
   ["ECO-BT-01", "2", "−59,70", "SUP-VOIT", "5", "−9,60"],
   ["CHG-20W", "4", "−29,70", "PIL-AA-8", "8", "−6,20"],
   ["CLA-SF-01", "3", "−28,40", "CAB-USBC-1M", "7", "+4,90"],
   ["BOU-17L", "2", "−27,80", "", "", ""],
   ["MIX-PLG", "2", "+25,20", "", "", ""],
 ], "note": "Les cinq à entourer : ECO-BT-01, CHG-20W, CLA-SF-01, BOU-17L, MIX-PLG. Mêmes valeurs et même top 5 en confirmé (plus de constats). À égalité au 5e rang, l'une ou l'autre est acceptée."},
 "Résultats justes à ton dernier dépôt": {"rep": "37 sur 37 si tout est juste.", "note": "1 (export nettoyé) + 18 constats + 18 valeurs = 37. L'export est jugé à part, au-dessus (niveau 3) : « ✓ Export : vos critères donnent bien les lignes demandées. » ou « ✗ Export : votre fichier ne correspond pas à la demande. Relisez-la, puis refaites l'export (Extractions). » Les formules sont contrôlées sur le fichier de l'élève : une erreur d'export ne se paie qu'au jalon « export », en attente tant que rien n'est déposé."},
 "Compare tes cinq références aux cinq": {"pistes": [
   "Par constats : PIL, CAB, SUP, CHG, CLA ; par valeur : ECO, CHG, CLA, BOU, MIX. Trois différences.",
   "Les piles et les câbles sont souvent signalés, mais pour 1 ou 2 unités bon marché ; les écouteurs, deux fois seulement, mais 3 × 19,90 €.",
   "Un surplus (MIX-PLG, +2) coûte aussi : de la marchandise qu'on ne vend pas parce que le système l'ignore."]},
}
