# -*- coding: utf-8 -*-
"""Trame élève Cdiscount — séance ENT-2.6 « Cinq recomptages, pas un de plus » (bonus, entraînement, C1.6).

Écrite le 04/10/2026 par Cowork (brief `docs/briefs/ENT-2.6-bonus.md`, § 9 : encarts NB.SI.ENS et RECHERCHEV avec
syntaxe, exemple et erreurs fréquentes, une page « nettoyer un export »). Fonctions communes : `trame_commun.py`.
Séance jouée sur la page d'essai le 04/10/2026 : export brut (158 lignes), nettoyé à 151, synthèse recalculée par
LibreOffice, dépôt « 37 résultats justes sur 37 », cinq références envoyées, 4/4.

Réserve connue (à corriger dans le moteur avant d'ouvrir la séance) : le titre « Valeur de l'écart » tapé avec une
apostrophe droite (') n'est pas reconnu par le contrôle, qui attend l'apostrophe typographique (’) : la colonne
entière est comptée fausse, sans détail (retour d'entraînement). Voir le brief de commit des trames.
Refaite le 04/10/2026 par Cowork après l'export filtré (brief `docs/briefs/MOTEUR-export-filtre.md`) : l'export part
de l'écran « Extractions », niveau d'indication 3 (demande métier seule : « les lignes de préparation du mois »,
allées A et B ; bon réglage Allée Toutes, 30 derniers jours). La trame ne donne PAS les critères ; au dépôt, le site
dit seulement « relisez la demande ». 5 jalons (export + nettoyé + constats + valeur + priorités). Aucun nombre de
lignes attendu : l'élève compare son fichier nettoyé au nombre affiché dans Extractions (l'écran montre les lignes
propres, le fichier sort brut).
Corrigé : `contenus/corriges/ENT-2.6.js` (réponses dans `corriges_cdiscount.py`).
"""
import os
from docx.shared import Cm
import trame_commun as T
import corriges_data, corriges_cdiscount

CODE = 'ENT-2.6'
corriges_data._DICOS[CODE] = [corriges_cdiscount.ENT_2_6]
LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'cdiscount.png')

T.nouveau()
T.entete(LOGO, "ENT-2.6 — Carnet de suivi : cinq recomptages, pas un de plus", [
    ('Une séance bonus :',
     "pour ceux qui ont fini. Tu travailles seul, dans Prepalog et dans un tableur. Tu réutilises ce que tu as "
     "appris en ENT-2.2 et ENT-2.4, et tu découvres deux fonctions : NB.SI.ENS et RECHERCHEV."),
    ('Ce que ton enseignant voit dans son suivi :',
     "cinq points : ton export (jugé à part, au moment du dépôt), ton export nettoyé, tes constats comptés, tes "
     "écarts chiffrés en euros, et les cinq références que tu choisis. Le dépôt te dit combien de résultats sont "
     "justes, pas lesquels ; pour l'export, il te dit seulement s'il correspond à la demande."),
    ('Ce qui est vrai, ce qui est construit :',
     "Cdiscount et le travail sur tableur à partir d'un export sont réels. Les commandes, les chiffres, les coûts "
     "et l'équipe sont construits pour l'exercice."),
], [
    ('Découvrir RECHERCHEV', 'Sur Internet'),
    ('Lire la mission de Nadia', 'Dans Prepalog'),
    ('Choisir l\'extraction, exporter, nettoyer', 'Prepalog, puis tableur'),
    ('Repérer les écarts depuis l\'inventaire', 'Dans le tableur'),
    ('Compter les constats (NB.SI.ENS)', 'Dans le tableur'),
    ('Chiffrer les écarts (RECHERCHEV)', 'Dans le tableur'),
    ('Déposer, choisir et écrire à Nadia', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Découvrir RECHERCHEV")
T.p("RECHERCHEV est une des fonctions les plus utilisées en entreprise. Avant de t'en servir, lis sa fiche d'aide "
    "officielle.")
T.consignes([
    "Cherche « RECHERCHEV fonction support Microsoft » et ouvre la page du site support.microsoft.com.",
    "Lis le début de la page, jusqu'à l'exemple.",
    "Réponds aux questions ci-dessous.",
])
T.questions([("Que fait la fonction RECHERCHEV ?", 2)])
T.faits([
    "Dans quelle colonne de la plage doit se trouver la valeur cherchée ?",
    "Que veut dire FAUX en dernier argument ?",
    "Que s'affiche-t-il quand la valeur cherchée n'est pas trouvée ?",
])
T.reflechir([
    "Dans un entrepôt, à quoi pourrait servir RECHERCHEV ? Donne un exemple avec tes mots.",
])

# ==================================================================== étape 2
T.etape(2, "Lire la mission de Nadia")
T.p("Ouvre l'activité « Cdiscount — cinq recomptages, pas un de plus ». Dans « Messagerie », lis le message de "
    "Nadia Ferrand : « Bonus : cinq recomptages, pas un de plus ».")
T.tableau(['Information', 'Ce que tu relèves'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(1.0),
          remplis=[["Combien de références l'équipe peut-elle recompter ?", ''],
                   ["Quelles lignes Nadia te demande-t-elle d'exporter ? (recopie ses mots)", ''],
                   ["Quelles allées ?", ''],
                   ["Date du dernier inventaire", ''],
                   ["Quelle fonction pour compter les constats ?", ''],
                   ["Quelle fonction pour trouver le coût ?", ''],
                   ["Sur quoi Nadia veut-elle que tu choisisses : le nombre de constats ou les euros ?", '']])
T.reflechir([
    "Nadia écrit : « Une erreur coûte plus cher sur une batterie que sur une pile. » Explique ce qu'elle veut dire.",
])

# ==================================================================== étape 3
T.etape(3, "Choisir l'extraction, exporter, nettoyer")
T.p("Cette fois, personne ne règle les critères pour toi : c'est la demande de Nadia, relevée à l'étape 2, qui dit "
    "quelles lignes sortir.")
T.consignes([
    "Dans le menu de gauche, partie « Outils », clique sur « Extractions ». La liste « Lignes de préparation » "
    "s'affiche, avec ses critères au-dessus du tableau.",
    "Pour chaque critère, choisis la valeur qui répond à la demande de Nadia. Regarde le tableau et le nombre de "
    "lignes changer.",
    "Avant d'exporter, vérifie dans le tableau que tu as bien toutes les lignes demandées, et rien de plus. Note "
    "le nombre de lignes affiché.",
    "Clique sur « Exporter ». Le fichier cdiscount-lignes-de-preparation.xlsx se télécharge. Ouvre-le et "
    "enregistre-le en .xlsx ou .ods.",
])
T.faits([
    "Critère « Allée » que tu as choisi",
    "Critère « Période » que tu as choisi",
    "Nombre de lignes affiché dans Extractions",
])
T.reflechir([
    "Explique tes deux choix avec les mots de la demande de Nadia. Pourquoi pas une autre valeur ?",
])
T.consignes([
    "Dans ton fichier, regarde les trois feuilles : « Préparations », « Tarifs », « Synthèse ».",
    "Nettoie la feuille « Préparations » : l'export sort brut du logiciel. Suis l'encadré ci-dessous.",
])
T.encadre_liste('Nettoyer un export, en trois gestes :', [
    "les lignes vides : trie le tableau par date (Données, Trier) ; les lignes vides se rangent à la fin et ne "
    "gênent plus. Ou supprime-les une à une (clic droit sur le numéro de ligne, Supprimer) ;",
    "les doublons : deux lignes identiques (même bon, même référence, mêmes chiffres). Trie par « N° bon » : les "
    "doublons se suivent. Supprime l'une des deux. Excel a aussi : Données, Supprimer les doublons ;",
    "les dates en texte : une vraie date se cale à droite de la case, une date en texte à gauche. Clique dans la "
    "case et retape la date (jj/mm/aaaa) : elle passe à droite.",
])
T.encadre('Pourquoi c\'est important :',
          "un doublon compte un constat deux fois ; une date en texte n'est pas reconnue comme une date, et une "
          "formule qui trie par date l'oublie. Tes calculs seraient faux sans que tu le voies.")
T.encadre('Pour vérifier ton nettoyage :',
          "l'écran Extractions montre les lignes propres, mais le fichier sort brut, avec des lignes vides et des "
          "doublons en plus. Une fois nettoyé, ton fichier doit avoir exactement le nombre de lignes affiché dans "
          "Extractions.")
T.faits([
    "Nombre de lignes de données avant nettoyage (sans les titres)",
    "Nombre de lignes vides supprimées",
    "Nombre de doublons supprimés",
    "Nombre de dates en texte corrigées",
    "Nombre de lignes de données après nettoyage : est-ce celui d'Extractions ?",
])
T.reflechir([
    "Comment as-tu repéré la salissure la plus difficile à trouver ?",
])

# ==================================================================== étape 4
T.etape(4, "Repérer les écarts depuis l'inventaire")
T.p("Comme en ENT-2.2, tu calcules l'écart de chaque ligne. Mais cette fois, seuls les constats faits depuis le "
    "dernier inventaire comptent : les écarts d'avant ont été corrigés ce jour-là.")
T.encadre_liste('La fonction ET, dans un SI :', [
    "ET(test1 ; test2) est vrai seulement si les deux tests sont vrais ;",
    "pour comparer une date : A2>=DATE(2026;1;15) (année ; mois ; jour) veut dire « le 15/01/2026 ou après » ;",
    "exemple, sur d'autres données : =SI(ET(C2>0;B2>=DATE(2026;1;1));\"Oui\";\"\").",
])
T.consignes([
    "Colonne K, titre Écart : stock trouvé moins stock logiciel, en formule, recopiée jusqu'en bas.",
    "Colonne L, titre Réf. en écart : la référence si l'écart n'est pas 0 ET si la date est le jour du dernier "
    "inventaire ou après ; sinon, rien. Prends la date du message de Nadia.",
    "Colonne M, titre Écart retenu : recopie l'écart de la ligne (=K2). Elle servira à RECHERCHEV.",
])
T.faits([
    "Formule que tu as écrite en L2",
])
T.encadre('Ce que tu dois voir :',
          "des écarts non nuls avant l'inventaire, qui n'apparaissent pas dans la colonne L : c'est voulu.")
T.questions([("Une référence avait beaucoup d'écarts avant l'inventaire, aucun après. Pourquoi ne faut-il pas la "
              "compter ?", 2)])
T.reflechir([
    "Si tu avais oublié le critère de date, qu'est-ce que cela aurait changé pour la liste que tu rends à Nadia ?",
])

# ==================================================================== étape 5
T.etape(5, "Compter les constats (NB.SI.ENS)")
T.p("Dans la feuille « Synthèse », tu comptes, pour chaque référence, les lignes en écart depuis l'inventaire.")
T.encadre_liste('La fonction NB.SI.ENS :', [
    "=NB.SI.ENS(plage1 ; critère1 ; plage2 ; critère2 ; …) : elle compte les lignes qui respectent TOUS les "
    "critères à la fois ;",
    "un critère peut être une case (A2), un texte (\"<>0\" = différent de 0), ou une comparaison avec une date : "
    "\">=\"&DATE(2026;1;15) ;",
    "exemple, sur d'autres données : =NB.SI.ENS(B:B;\"Lyon\";C:C;\">10\") compte les lignes de Lyon avec plus de "
    "10 colis.",
])
T.encadre_liste('Erreurs fréquentes :', [
    "des plages de tailles différentes (D2:D200 et K2:K150) : prends des colonnes entières ;",
    "le signe > écrit hors des guillemets : \">=\"&DATE(…), pas >=DATE(…).",
])
T.consignes([
    "Dans « Synthèse », écris en B1 le titre Constats.",
    "En B2 : NB.SI.ENS avec trois critères : la référence de la ligne (colonne Référence de « Préparations »), "
    "l'écart différent de 0 (colonne Écart), la date du dernier inventaire ou après (colonne Date). Recopie.",
])
T.faits(["Formule que tu as écrite en B2"])
T.reflechir([
    "Pourquoi as-tu besoin de trois critères, et pas d'un seul comme avec NB.SI ?",
])

# ==================================================================== étape 6
T.etape(6, "Chiffrer les écarts (RECHERCHEV)")
T.p("Tu sais combien de fois chaque référence a été signalée. Il te faut maintenant ce que l'écart coûte.")
T.encadre_liste('La fonction RECHERCHEV :', [
    "=RECHERCHEV(ce qu'on cherche ; plage ; n° de la colonne à rendre ; FAUX) ;",
    "elle cherche dans la PREMIÈRE colonne de la plage et rend la valeur de la colonne demandée, sur la même ligne ;",
    "exemple, sur d'autres données : =RECHERCHEV(E2;A:C;3;FAUX) cherche E2 dans la colonne A et rend la "
    "colonne C de cette ligne.",
])
T.encadre_liste('Erreurs fréquentes :', [
    "oublier FAUX : le tableur prend une valeur « proche », souvent fausse ;",
    "une plage qui ne commence pas par la colonne cherchée (par exemple K:M pour chercher une référence en L) ;",
    "#N/A : la valeur n'est pas trouvée. =SIERREUR(RECHERCHEV(…);0) écrit 0 à la place.",
])
T.consignes([
    "C1, titre Écart : avec SIERREUR et RECHERCHEV, cherche la référence dans les colonnes L:M de « Préparations » "
    "et rends la 2e colonne (Écart retenu). 0 si elle n'est pas trouvée.",
    "D1, titre Coût : RECHERCHEV dans la feuille « Tarifs », colonnes A:C, 3e colonne.",
    "E1, titre Valeur de l'écart (écrit exactement ainsi) : Écart × Coût. Recopie les trois formules.",
])
T.faits([
    "Formule que tu as écrite en C2",
    "Formule que tu as écrite en D2",
])
T.reflechir([
    "Pourquoi RECHERCHEV vaut-elle mieux que recopier les coûts à la main ?",
])

# ==================================================================== étape 7
T.etape(7, "Déposer, choisir et écrire à Nadia")
T.consignes([
    "Enregistre ton fichier, puis dépose-le dans « Fichiers ». Lis « … résultats justes sur … ». Si tout n'est pas "
    "juste, vérifie seul et redépose.",
    "Lis aussi la ligne sur ton export : « ✓ Export : vos critères donnent bien les lignes demandées. », ou « ✗ "
    "Export : votre fichier ne correspond pas à la demande ». Si c'est ✗, le site ne dit pas quel critère : relis "
    "la demande de Nadia, refais l'extraction, nettoie, recopie tes formules et redépose.",
    "Dans ta synthèse, classe les références de la plus grande valeur à la plus petite, sans tenir compte du signe "
    "(un surplus coûte aussi).",
    "Recopie ci-dessous les références qui ont une valeur, puis entoure les cinq plus grandes.",
])
T.tableau(['Référence', 'Constats', 'Valeur de l\'écart (€)', 'Référence', 'Constats', 'Valeur de l\'écart (€)'], 5,
          [Cm(3.4), Cm(2.0), Cm(3.1), Cm(3.4), Cm(2.0), Cm(3.1)], hauteur=Cm(0.8))
T.faits(["Résultats justes à ton dernier dépôt"])
T.consignes([
    "Dans « Messagerie », réponds à Nadia : complète la ligne « À recompter : » avec tes cinq références, séparées "
    "par des virgules. Envoie.",
])
T.encadre('Ce que tu dois voir :', "Nadia répond qu'elle lance les cinq recomptages. Sa réponse ne dit pas si ton "
          "choix est juste.")
T.reflechir([
    "Compare tes cinq références aux cinq qui ont le plus de constats. Pourquoi ne sont-elles pas toutes les mêmes ?",
])

NOTIONS = []
# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026 :
# contenu dans `feuilles_detachables.py`.
T.feuille_detachable('ENT-2.6')

T.finir(CODE, 'Cdiscount — cinq recomptages, pas un de plus', 'ENT-2.6-cdiscount-priorites-trame-eleve', NOTIONS,
        os.path.basename(__file__), fichier=CODE)
