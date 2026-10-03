# -*- coding: utf-8 -*-
"""Trame élève Picard — séance ENT-4.3 « la réception de nuit » (erreur induite, C1.4).

Écrite le 03/10/2026 par Cowork, après la validation de la séance à l'écran par Tristan. Mêmes règles
que les autres trames (fiche `prepalog-trames-eleve`) ; fonctions communes dans `trame_commun.py`.

Deux temps, comme ENT-3.3 : contrôler le travail figé de Mathis (personnage fictif), envoyer un
diagnostic au chef de quai, puis corriger (bloquer, protester auprès du transporteur).
Pas à pas : la trame ne dit jamais quelle palette est en faute ni combien d'erreurs il y a. Elle fait
relever le dossier, puis recompter en chambre froide, et l'élève compare. Les lignes des deux messages
sont lues par le logiciel : la trame le dit AVANT que l'élève écrive (règle n° 6), avec la forme
attendue (N1…N5, nombres en chiffres, date en chiffres).
Le corrigé de la trame va dans `contenus/corriges/ENT-4.3-trame.js`.
"""
import os
from docx.shared import Cm
import trame_commun as T

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'picard.png')
PAL = ['N1', 'N2', 'N3', 'N4', 'N5']

T.nouveau()
T.entete(LOGO, "ENT-4.3 — Carnet de suivi : la réception de nuit", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Aujourd'hui, tu ne réceptionnes pas un camion : tu contrôles la "
     "réception qu'un collègue a faite cette nuit."),
    ('Ce que ton enseignant voit dans son suivi :',
     "10 points, qui donnent une note sur 20 : ton diagnostic au chef de quai (5 points), les palettes que tu "
     "bloques (2 points) et ton message au transporteur (3 points). Le logiciel lit tes messages ligne par "
     "ligne. Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :',
     "Picard, son entrepôt de Sainghin-en-Mélantois et la règle des 3 jours (Code de commerce) sont réels. "
     "Mathis, le quai 32, le fournisseur, le transporteur, les produits et les températures sont inventés pour "
     "l'exercice."),
], [
    ('Ce que dit la loi', 'Sur cette trame'),
    ('Lire les messages', 'Dans Prepalog'),
    ('Contrôler le dossier de Mathis', 'Dans Prepalog'),
    ('Contrôler en chambre froide', 'Dans Prepalog'),
    ('Envoyer ton diagnostic au chef de quai', 'Dans Prepalog'),
    ('Corriger : bloquer et protester', 'Dans Prepalog'),
    ('Lire ton bilan', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Ce que dit la loi")
T.p("Quand une marchandise arrive abîmée ou incomplète, on peut se retourner contre le transporteur. Mais pas "
    "n'importe comment, ni n'importe quand. Voici ce que dit la loi. Lis l'article deux fois : il est écrit en "
    "langage juridique.")
T.encadre_texte("Code de commerce, article L133-3", [
    "La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si "
    "dans les trois jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n'a "
    "pas notifié au voiturier, par acte extrajudiciaire ou par lettre recommandée, sa protestation motivée.",
    "Si dans le délai ci-dessus prévu il est formé une demande d'expertise en application de l'article L. 133-4, "
    "cette demande vaut protestation sans qu'il soit nécessaire de procéder comme il est dit au premier alinéa.",
    "Toutes stipulations contraires sont nulles et de nul effet. Cette dernière disposition n'est pas applicable "
    "aux transports internationaux.",
], source="Version en vigueur depuis le 10/12/2009 (Légifrance). Texte recopié mot pour mot.")
T.encadre_liste('Les mots du texte :', [
    "éteindre une action : on ne peut plus rien réclamer ;",
    "avarie : marchandise abîmée. Perte partielle : une partie manque ;",
    "le voiturier : l'ancien nom du transporteur ;",
    "notifier : faire savoir officiellement, par écrit ;",
    "acte extrajudiciaire : un acte envoyé par un commissaire de justice (un huissier) ;",
    "protestation motivée : une réclamation écrite qui dit précisément ce qui ne va pas.",
])
T.faits([
    "En combien de jours faut-il protester ?",
    "Les jours fériés comptent-ils ?",
    "Par quel moyen faut-il envoyer la protestation ?",
    "À qui l'envoie-t-on ?",
])
T.qcm([
    ("Le destinataire n'envoie rien dans le délai. Que se passe-t-il ?",
     ["il ne peut plus rien réclamer au transporteur", "le transporteur doit quand même payer",
      "le fournisseur rembourse à la place"], 0),
])
T.reflechir([
    "Pourquoi la loi laisse-t-elle si peu de temps pour protester, à ton avis ?",
])

# ==================================================================== étape 2
T.etape(2, "Lire les messages")
T.p("Connecte-toi à Prepalog, ouvre la rubrique Logisim, puis l'activité « Picard — la réception de nuit ». "
    "Dans le menu de gauche, clique sur « Messagerie ». Trois messages t'attendent. Lis-les tous, dans l'ordre "
    "où ils sont arrivés.")
T.tableau(['Qui écrit ?', 'Ce qu\'il dit, en une phrase'], 0, [Cm(5.0), Cm(12.0)], hauteur=Cm(1.3),
          remplis=[['Transports Givrex', ''], ['Mathis, réceptionnaire de nuit', ''], ['Le chef de quai', '']])
T.faits([
    "Numéro du bon de livraison",
    "À quelle heure Mathis a-t-il réceptionné le camion ?",
    "Où sont les palettes maintenant ?",
])
T.encadre_liste('La séance se fait en deux temps :', [
    "temps 1, contrôler : le dossier de Mathis est verrouillé. Tu regardes, tu recomptes, tu ne corriges rien ;",
    "tu réponds au chef de quai : ton diagnostic ;",
    "temps 2, corriger : sa réponse te déverrouille le dossier.",
])
T.reflechir([
    "Avant d'ouvrir le dossier, quelle pièce vas-tu regarder en premier ? Explique ton choix.",
])

# ==================================================================== étape 3
T.etape(3, "Contrôler le dossier de Mathis")
T.p("Dans le menu de gauche, clique sur « Quai de réception ». Tu dois voir le bandeau « Temps 1 — Contrôler » "
    "et deux onglets. Reste sur l'onglet « Le dossier de Mathis » : le BL signé, le ticket de l'enregistreur "
    "et sa fiche de comptage et de sonde.")
T.consignes([
    "Recopie dans le tableau ce que dit le BL, puis ce que Mathis a noté sur sa fiche.",
    "Dans la dernière colonne, note ce qui t'interroge (ou rien).",
    "Lis ensuite le ticket et la réserve écrite sur le BL.",
])
T.tableau(['Palette', 'BL (cartons)', 'Fiche : cartons', 'Fiche : T° à cœur', 'Décision de Mathis', 'Ce qui t\'interroge'], 0,
          [Cm(1.7), Cm(2.2), Cm(2.4), Cm(2.6), Cm(2.8), Cm(5.3)], hauteur=Cm(1.05),
          remplis=[[x, '', '', '', '', ''] for x in PAL])
T.faits([
    "Entre quelles heures la température de l'air dépasse-t-elle la consigne de −20 °C ?",
    "Quelle est la température la plus haute du ticket ?",
    "Quelle réserve Mathis a-t-il écrite sur le BL ?",
])
T.encadre_liste('Rappel — règle du quai pour la température à cœur :', [
    "−18 °C ou plus froid : on accepte ;",
    "entre −18 °C et −15 °C : on accepte avec réserves ;",
    "plus chaud que −15 °C : on refuse.",
])
T.reflechir([
    "Quelle ligne de la fiche de Mathis t'a paru la plus suspecte ? Explique.",
])

# ==================================================================== étape 4
T.etape(4, "Contrôler en chambre froide")
T.p("Clique sur l'onglet « En chambre froide ». Les cinq palettes y sont, avec un onglet par palette (N1… "
    "N5). Tu peux refaire les gestes de la réception, sans les payer en temps : les palettes sont au froid.")
T.consignes([
    "Pour chaque palette : fais le tour complet, puis compte les cartons.",
    "Écris ton total et clique sur « Noter mon comptage ».",
    "Clique sur « Sonder à cœur » et sur l'étiquette d'un carton.",
    "Remplis le tableau.",
])
T.tableau(['Palette', 'Ton comptage', 'Fiche de Mathis', 'BL', 'T° à cœur aujourd\'hui', 'Étiquette = BL ?'], 0,
          [Cm(1.7), Cm(2.8), Cm(2.8), Cm(2.0), Cm(3.6), Cm(4.1)], hauteur=Cm(1.05),
          remplis=[[x, '', '', '', '', ''] for x in PAL])
T.encadre('Bon à savoir :',
          "un surgelé qui s'est réchauffé puis a été remis au froid a perdu sa qualité, même s'il est redevenu bien "
          "froid. Le lendemain, la sonde ne voit plus rien.")
T.encadre_liste('Ce que tu dois voir :', [
    "sous ton comptage, le chiffre de la fiche de Mathis et celui du BL, pour comparer ;",
    "pas de bouton pour bloquer : au temps 1, tu ne corriges rien.",
])
T.reflechir([
    "Ta sonde d'aujourd'hui et la fiche de Mathis ne donnent pas la même température. Laquelle des deux prouve ce "
    "qui s'est passé cette nuit, selon toi ?",
])

# ==================================================================== étape 5
T.etape(5, "Envoyer ton diagnostic au chef de quai")
T.p("En haut du quai, clique sur « Messagerie ». Ouvre le message du chef de quai, puis clique sur « Répondre ». "
    "Les cinq lignes sont déjà écrites : complète chacune après les deux-points. Prépare d'abord ta réponse ici.")
T.encadre_liste('Le logiciel lit ta réponse ligne par ligne. Pour qu\'il te comprenne :', [
    "garde le début de chaque ligne tel qu'il est (« Palette acceptée à tort : » …) ;",
    "écris les palettes comme sur le BL : N1, N2, N3, N4, N5 ;",
    "écris les nombres en chiffres ;",
    "n'accuse pas une palette conforme : une palette accusée reste accusée, même si tu renvoies un message.",
])
T.tableau(['Ligne du message', 'Ce que tu écris après les deux-points'], 0, [Cm(5.0), Cm(12.0)], hauteur=Cm(1.5),
          remplis=[['Palette acceptée à tort :', ''], ['Preuve :', ''], ['Manquant :', ''],
                   ['Réserve :', ''], ['Délai :', '']])
T.p("Recopie tes lignes dans la réponse, relis-les, puis clique sur « Envoyer ».", apres=4)
T.encadre_liste('Ce que tu dois voir :', [
    "dans « Réception », la réponse du chef de quai : « Re : réception de nuit » ;",
    "au quai, le bandeau « Temps 2 — Corriger ».",
    "Sa réponse ne dit pas si ton diagnostic est juste : tu le sauras dans le bilan.",
])
T.reflechir([
    "Pour la ligne « Délai », comment as-tu su si l'on était encore dans les temps ?",
])

# ==================================================================== étape 6
T.etape(6, "Corriger : bloquer et protester")
T.p("Lis la réponse du chef de quai. Le dossier est maintenant à toi. Deux choses à faire, s'il le faut : bloquer, "
    "et protester auprès du transporteur.")
T.encadre('Bloquer une palette :',
          "la mettre à part avec l'étiquette « Bloqué — qualité ». Elle ne part plus en magasin tant que le service "
          "qualité n'a pas décidé. On ne bloque que ce qui est douteux.")
T.consignes([
    "Au quai, onglet « En chambre froide » : choisis la palette, puis clique sur « Bloquer … — qualité ».",
    "Dans la Messagerie, ouvre l'« Avis de livraison » de Transports Givrex et clique sur « Répondre ».",
    "Complète les cinq lignes déjà écrites. Prépare-les d'abord ci-dessous.",
])
T.encadre_liste('Pour que le logiciel te comprenne :', [
    "la date en chiffres, jour puis mois puis année : par exemple 21/11/2026 ;",
    "les palettes comme sur le BL (N1… N5), les quantités en chiffres ;",
    "« Constat : » dit ce qui ne va pas pour chaque palette citée.",
])
T.tableau(['Ligne du message', 'Ce que tu écris après les deux-points'], 0, [Cm(5.0), Cm(12.0)], hauteur=Cm(1.4),
          remplis=[['BL :', ''], ['Réceptionné le :', ''], ['Palette :', ''], ['Constat :', ''], ['Quantité :', '']])
T.saut_avant()
T.p("Envoie ton message. Retourne au quai et clique sur « J'ai terminé », en bas, puis confirme.", apres=4)
T.encadre_liste('Ce que tu dois voir :', [
    "la palette bloquée, rangée dans la « Zone de blocage qualité » ;",
    "après « J'ai terminé », le dossier se fige et ton bilan s'affiche en bas.",
])
T.faits([
    "Quelle palette as-tu bloquée ?",
])
T.reflechir([
    "Pourquoi as-tu bloqué cette palette, alors que sa température est bonne aujourd'hui ?",
])

# ==================================================================== étape 7
T.etape(7, "Lire ton bilan")
T.p("Le « Bilan de ton contrôle » compare, ligne par ligne, ce que tu as fait et ce qui était attendu. Lis-le en "
    "entier.")
T.faits([
    "Combien de lignes sont marquées « ✗ à revoir » ?",
    "Dans la vraie vie, comment doit partir ta protestation ?",
    "Avant quelle date doit-elle partir ?",
])
T.reflechir([
    "Qu'as-tu trouvé grâce aux documents, et que la chambre froide ne pouvait pas te montrer ?",
    "Si tu étais Mathis, que changerais-tu à ta façon de travailler la nuit ?",
    "Choisis une ligne « à revoir » de ton bilan (ou, si tout est juste, ta preuve la plus solide). Qu'aurais-tu "
    "fait autrement ?",
])

NOTIONS = [["Le destinataire n'envoie rien dans le délai", "Droit du transport — art. L133-3 du Code de commerce",
            "La réception éteint toute action contre le transporteur pour avarie ou perte partielle si, dans les 3 "
            "jours (jours fériés non compris), le destinataire n'a pas notifié sa protestation motivée par acte "
            "extrajudiciaire ou lettre recommandée."]]
T.finir('ENT-4.3', 'Picard — la réception de nuit', 'ENT-4.3-picard-reception-de-nuit-trame-eleve', NOTIONS,
        os.path.basename(__file__))
