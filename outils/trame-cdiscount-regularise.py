# -*- coding: utf-8 -*-
"""Trame élève Cdiscount — séance ENT-2.4 « Régularisé à l'aveugle » (erreur induite, C1.6).

Écrite le 04/10/2026 par Cowork (brief `docs/briefs/ENT-2.4-regularise-export.md`, § 9 : encart SI / NB.SI en rappel,
encadré vérifié / construit avec le vendeur fictif, « Pour réfléchir » : que répondre au vendeur ?). Fonctions
communes : `trame_commun.py`. Libellés relevés en jouant la séance sur la page d'essai le 04/10/2026 (export depuis
l'écran Stock, classeur recalculé par LibreOffice, dépôt « 24 résultats justes sur 24 », réponse en huit lignes, 8/8).

Temps « erreur induite » : la trame donne la méthode (tableur, puis enquête) mais ne dit ni quel ajustement est
orphelin, ni où l'écart est né. Le retour du dépôt est celui de l'entraînement (« n résultats justes sur m », sans
détail) : la trame le dit.
Corrigé : `contenus/corriges/ENT-2.4.js` (réponses dans `corriges_cdiscount.py`).
"""
import os
from docx.shared import Cm
import trame_commun as T
import corriges_data, corriges_cdiscount

CODE = 'ENT-2.4'
corriges_data._DICOS[CODE] = [corriges_cdiscount.ENT_2_4]
LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'cdiscount.png')
LIGNES = ['Ajustement à revoir :', 'Ajustement justifié :', 'Réception concernée :',
          'Annoncé sur le bon de livraison :', 'Réellement reçu :', 'Valeur du manque :', 'Motif exact :',
          'Suite à donner :']

T.nouveau()
T.entete(LOGO, "ENT-2.4 — Carnet de suivi : régularisé à l'aveugle", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul. Tu travailles dans Prepalog et dans un tableur (Excel ou LibreOffice Calc), comme en "
     "ENT-2.2."),
    ('Ce que ton enseignant voit dans son suivi :',
     "huit points : deux pour ton fichier (SI et NB.SI), six pour ta réponse à ta cheffe d'équipe. Cette fois, le "
     "dépôt ne te dit que le nombre de résultats justes, pas lesquels."),
    ('Ce qui est vrai, ce qui est construit :',
     "Cdiscount, son entrepôt de Cestas et sa place de marché sont réels, comme le service qui stocke chez Cdiscount "
     "les produits de vendeurs indépendants. Le vendeur Julien Mounet et sa boutique Bassin Cuisine sont "
     "inventés, comme les fournisseurs, les quantités et l'équipe."),
], [
    ('La place de marché et ses vendeurs', 'Sur Internet'),
    ('Lire les messages', 'Dans Prepalog'),
    ('Exporter et repérer avec SI', 'Prepalog, puis tableur'),
    ('Compter par motif avec NB.SI', 'Dans le tableur'),
    ('Déposer ton fichier', 'Dans Prepalog'),
    ('Retrouver chaque ajustement et son document', 'Dans Prepalog'),
    ('Remonter à la réception et chiffrer', 'Dans Prepalog'),
    ('Répondre à Nadia', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "La place de marché et ses vendeurs")
T.p("Sur cdiscount.com, une partie des produits est vendue par des vendeurs indépendants. Certains confient leur "
    "stock à Cdiscount. Fais une recherche sur Internet.")
T.consignes([
    "Cherche « Octopia Fulfillment Cdiscount » et ouvre la page du service sur le site de la place de marché "
    "Cdiscount.",
    "Réponds aux questions ci-dessous.",
])
T.faits([
    "Nom du service qui stocke et expédie les produits des vendeurs",
    "Dans quel entrepôt vont les petits produits (moins de 30 kg) ?",
])
T.questions([("Que fait ce service pour le vendeur ?", 2)])
T.qcm([
    ("Un ajustement de stock, c'est :",
     ["une correction du stock du système, avec un motif", "une commande d'un client", "une livraison d'un fournisseur"], 0),
])
T.reflechir([
    "D'après ce que tu as trouvé, quand Cdiscount stocke les produits d'un vendeur, qui est gêné si le stock du "
    "système est faux ?",
])

# ==================================================================== étape 2
T.etape(2, "Lire les messages")
T.p("Ouvre l'activité « Cdiscount — régularisé à l'aveugle ». Dans « Messagerie », lis tous les messages, en "
    "commençant par ceux de Nadia Ferrand : sa mission, puis le message qu'elle te transfère.")
T.tableau(['Information', 'Ce que tu relèves'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(0.95),
          remplis=[["Par quoi Nadia te demande-t-elle de commencer ?", ''],
                   ["Combien d'ajustements Samir a-t-il passés dans l'allée B ?", ''],
                   ["Combien de lignes doit contenir ta réponse ?", ''],
                   ["Délai pour réclamer auprès du fournisseur", ''],
                   ["Le vendeur : combien de mixeurs livrés pour son compte ?", ''],
                   ["Le vendeur : combien son espace en affiche-t-il maintenant ?", '']])
T.encadre('Un mot de métier :',
          "régulariser, c'est passer un ajustement : on corrige le stock du système pour qu'il dise ce qu'on a "
          "compté. Un ajustement porte un motif (casse, erreur de réception…) et, normalement, un document qui le "
          "justifie.")
T.reflechir([
    "Samir écrit : « Pas besoin d'aller plus loin. » Avant de commencer, qu'en penses-tu ?",
])

# ==================================================================== étape 3
T.etape(3, "Exporter et repérer avec SI")
T.consignes([
    "Clique sur « Stock » (code donné par ton enseignant si l'écran est verrouillé), puis sur l'onglet « Mouvements ».",
    "En haut de l'écran, clique sur « Exporter les ajustements du mois ». Ouvre le fichier dans ton tableur et "
    "enregistre-le en .xlsx ou .ods.",
    "Dans la feuille « Ajustements », écris le titre À vérifier dans la première colonne vide.",
    "En ligne 2, écris une formule SI : si la case « Document » de la ligne est vide, elle affiche À VÉRIFIER ; "
    "sinon, elle laisse la case vide. Recopie-la jusqu'en bas.",
])
T.encadre_liste('Rappel SI (vu en ENT-2.2) :', [
    "=SI(test ; valeur si vrai ; valeur si faux) ; un texte entre guillemets ;",
    "pour tester qu'une case est vide : =SI(B2=\"\";…) (deux guillemets collés = « rien ») ;",
    "le bouton « Rappel tableur », en haut de l'écran, redonne l'écriture des fonctions.",
])
T.faits([
    "Combien d'ajustements contient l'export ?",
    "Lettre de la colonne « Document »",
    "Formule que tu as écrite en ligne 2",
    "Combien de lignes affichent À VÉRIFIER ?",
])
T.reflechir([
    "Un ajustement sans document : pourquoi est-ce un problème pour Nadia, qui doit signer la clôture du mois ?",
])

# ==================================================================== étape 4
T.etape(4, "Compter par motif avec NB.SI")
T.p("Nadia trouve la démarque inconnue élevée ce mois-ci. Pour le vérifier, compte les ajustements par motif.")
T.consignes([
    "Va dans la feuille « Synthèse ». Elle n'a que deux titres : « Motif » et « Nombre ».",
    "Sous « Motif », écris un motif par ligne : ceux qui apparaissent dans la colonne « Motif » de l'export, "
    "écrits exactement pareil.",
    "Sous « Nombre », écris une formule NB.SI qui compte ce motif dans la colonne « Motif » de la feuille "
    "« Ajustements ». Recopie-la.",
])
T.encadre('Rappel NB.SI (vu en ENT-2.2) :',
          "=NB.SI(plage ; ce qu'on compte). Pour la plage, clique sur l'onglet « Ajustements » et sélectionne la "
          "colonne entière. Pour ce qu'on compte, l'adresse de la case du motif.")
T.tableau(['Motif', 'Nombre'], 5, [Cm(10.0), Cm(7.0)], hauteur=Cm(0.85))
T.faits(["Formule que tu as écrite en B2"])
T.reflechir([
    "Regarde ta synthèse. La démarque inconnue te paraît-elle élevée ? Justifie avec tes chiffres.",
])

# ==================================================================== étape 5
T.etape(5, "Déposer ton fichier")
T.consignes([
    "Enregistre ton fichier. Dans Prepalog, clique sur « Fichiers », puis dépose-le sous « Déposer mon fichier ».",
    "Lis le résultat.",
])
T.encadre_liste('Ce que tu dois voir :', [
    "« Dernier fichier déposé : » et le nom de ton fichier ;",
    "une phrase « … résultats justes sur … ».",
])
T.encadre('Attention, ce n\'est plus du guidage :',
          "le site ne dit pas ce qui cloche. Si tout n'est pas juste, vérifie toi-même : la formule SI recopiée "
          "jusqu'en bas, les motifs écrits exactement comme dans l'export, la plage du NB.SI. Tu peux redéposer.")
T.tableau(['Dépôt', 'Résultats justes', 'Ce que j\'ai corrigé avant de redéposer'], 0,
          [Cm(2.4), Cm(4.0), Cm(10.6)], hauteur=Cm(1.0),
          remplis=[['1er', '', ''], ['2e', '', ''], ['3e', '', '']])
T.reflechir([
    "Sans le détail des erreurs, comment as-tu vérifié ton fichier ?",
])

# ==================================================================== étape 6
T.etape(6, "Retrouver chaque ajustement et son document")
T.p("Le tableur t'a montré un ajustement sans document. Retourne dans le logiciel pour enquêter sur les deux "
    "ajustements de Samir.")
T.consignes([
    "Dans « Stock », onglet « Mouvements », repère les lignes de type « Ajustement inventaire ». La colonne "
    "« Origine » donne la campagne et le motif.",
    "Pour chacun, cherche un document qui le justifie : relis tes messages.",
])
T.tableau(['Référence', 'Quantité', 'Motif saisi', 'Document qui le justifie (ou « aucun »)'], 0,
          [Cm(3.6), Cm(2.4), Cm(4.6), Cm(6.4)], hauteur=Cm(1.0),
          remplis=[['', '', '', ''] for _ in range(3)])
T.encadre('Un mot de métier :',
          "un ajustement orphelin n'a aucun document : on ne sait pas pourquoi le stock a été changé. C'est celui "
          "qu'il faut revoir.")
T.questions([("Pour l'ajustement justifié, quelle phrase du message t'a convaincu ?", 2)])
T.reflechir([
    "Pour l'un des deux ajustements, qu'est-ce qui t'a fait passer du doute à la certitude ?",
])

# ==================================================================== étape 7
T.etape(7, "Remonter à la réception et chiffrer")
T.p("Pour l'ajustement orphelin, remonte l'histoire de l'article : d'où viennent les articles qui manquent ?")
T.consignes([
    "Dans « Stock », onglet « Mouvements », trouve la dernière entrée de cet article : son numéro de réception.",
    "Dans « Réceptions », ouvre cette réception. Le bon de réception dit ce qui était annoncé ; les colis disent "
    "ce qui est vraiment arrivé : additionne les colis de l'article.",
    "Cherche le prix d'achat de l'article : menu « Catalogue », ou console .getprice suivi de la référence.",
])
T.tableau(['Colis n°', 'Référence', 'Contenu'], 0, [Cm(3.0), Cm(7.0), Cm(7.0)], hauteur=Cm(0.8),
          remplis=[['', '', ''] for _ in range(4)])
T.faits([
    "Numéro de la réception",
    "Quantité annoncée pour l'article",
    "Quantité réellement reçue (total des colis)",
    "Prix d'achat HT de l'article",
])
T.tableau(['Ce que je calcule', 'Mon calcul', 'Résultat'], 0, [Cm(7.2), Cm(6.0), Cm(3.8)], hauteur=Cm(1.0),
          remplis=[['Quantité manquante', '', ''], ['Valeur du manque (quantité × prix d\'achat)', '', '']])
T.reflechir([
    "Le bon de réception affiche une quantité comptée égale à l'annoncé. D'après toi, que s'est-il passé au "
    "quai le jour de la livraison ?",
])

# ==================================================================== étape 8
T.etape(8, "Répondre à Nadia")
T.encadre_liste("À lire AVANT d'écrire : le suivi lit tes lignes.", [
    "ne modifie pas les intitulés : écris à la suite, sur la même ligne, nombres en chiffres ;",
    "pour un article, recopie sa référence ; pour un document, son code en entier ;",
    "« Valeur du manque » : ton calcul, avec le résultat en euros à la fin ;",
    "« Motif exact » : un des motifs de la colonne « Motif » de ton export ;",
    "« Suite à donner » : ce qu'il faut faire, et auprès de qui.",
])
T.consignes([
    "Prépare tes huit lignes dans le tableau.",
    "Dans « Messagerie », ouvre la mission de Nadia, clique sur « Répondre », recopie ses huit intitulés et "
    "complète-les. Envoie.",
])
T.tableau(['Ligne de Nadia', "Ce que j'écris sur cette ligne"], 0, [Cm(5.6), Cm(11.4)], hauteur=Cm(0.95),
          remplis=[[x, ''] for x in LIGNES])
T.reflechir([
    "Julien Mounet attend une réponse. Que lui répondrais-tu, en deux ou trois phrases ?",
])

NOTIONS = [["Un ajustement de stock, c'est", "Ajustement (régularisation)",
            "Un ajustement corrige le stock du système pour qu'il corresponde au stock compté. Il doit porter un "
            "motif et, normalement, un document justificatif : sans lui, on efface la trace de la cause."]]
T.finir(CODE, 'Cdiscount — régularisé à l’aveugle', 'ENT-2.4-cdiscount-regularise-trame-eleve', NOTIONS,
        os.path.basename(__file__), fichier=CODE)
