# -*- coding: utf-8 -*-
"""Trame élève Cdiscount — séance ENT-2.2 « Ce que disent les chiffres » (guidage du geste tableur, C1.6).

Écrite le 04/10/2026 par Cowork (brief `docs/briefs/ENT-2.2-ce-que-disent-les-chiffres.md`, § 9 : encart SI /
NB.SI, cadre « Ma liste de références à recompter » que l'élève garde pour ENT-2.3). Fonctions communes :
`trame_commun.py`. Libellés relevés en jouant la séance sur la page d'essai, le 04/10/2026 : export téléchargé,
classeur travaillé puis recalculé par LibreOffice, déposé deux fois (nombres tapés, puis formules), liste envoyée.

Refaite le 04/10/2026 par Cowork après l'export filtré (brief `docs/briefs/MOTEUR-export-filtre.md`) : l'export part
de l'écran « Extractions », niveau d'indication 1 (critères DÉJÀ RÉGLÉS : Allée A, 30 derniers jours) ; la trame
nomme les critères, dit pourquoi et les fait vérifier ; le dépôt juge l'export à part (« quel critère changer »).
Aucun nombre de lignes attendu : les exports diffèrent d'un élève à l'autre (niveau, ce qu'il a fait dans le logiciel).

Les trois exigences :
  1. autonomie : où cliquer, ce qu'on doit voir, le geste tableur expliqué pas à pas (exemples sur d'autres
     données, jamais sur celles de l'élève) ; le dépôt dit lui-même ce qui cloche (guidage) ;
  2. pas à pas : la trame ne dit ni quelles références ont un écart, ni combien ;
  3. une analyse réflexive par étape.
Corrigé : `contenus/corriges/ENT-2.2.js` (réponses dans `corriges_cdiscount.py`).
"""
import os
from docx.shared import Cm
import trame_commun as T
import corriges_data, corriges_cdiscount

CODE = 'ENT-2.2'
corriges_data._DICOS[CODE] = [corriges_cdiscount.ENT_2_2]
corriges_data._EXTRAS[CODE] = corriges_cdiscount._EXTRAS_2_2
LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'cdiscount.png')

T.nouveau()
T.entete(LOGO, "ENT-2.2 — Carnet de suivi : ce que disent les chiffres", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Tu travailles dans Prepalog et dans un tableur (Excel ou LibreOffice "
     "Calc)."),
    ('Ce que ton enseignant voit dans son suivi :',
     "cinq points : ton export, tes trois calculs dans le fichier que tu déposes, et la liste que tu envoies à ta "
     "cheffe d'équipe. Quand tu déposes ton fichier, le site juge aussi ton export, à part : s'il n'a pas les bonnes "
     "lignes, il te dit quel critère changer. Pour tes calculs, il te dit ce qui est juste et ce qui cloche : tu peux "
     "corriger et déposer de nouveau."),
    ('Ce qui est vrai, ce qui est construit :',
     "Cdiscount, son entrepôt de Cestas et le travail sur tableur à partir d'un export du logiciel d'entrepôt sont "
     "réels. Les commandes, les chiffres, les préparateurs et l'équipe sont construits pour l'exercice."),
    ('Garde cette trame :', "tu en auras besoin à la séance suivante (ENT-2.3)."),
], [
    ('Pourquoi un tableur ?', 'Sur Internet'),
    ('Lire la mission de Nadia', 'Dans Prepalog'),
    ('Vérifier l\'extraction, exporter, ouvrir', 'Prepalog, puis tableur'),
    ('Calculer l\'écart', 'Dans le tableur'),
    ('Isoler les références en écart (SI)', 'Dans le tableur'),
    ('Compter les constats (NB.SI)', 'Dans le tableur'),
    ('Déposer ton fichier', 'Dans Prepalog'),
    ('Choisir et écrire à Nadia', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Pourquoi un tableur ?")
T.p("Dans un entrepôt, le logiciel qui suit le stock s'appelle un WMS. Il affiche les chiffres, mais pour les "
    "analyser, on les sort souvent dans un tableur. Fais une recherche sur Internet.")
T.consignes([
    "Cherche « WMS logistique définition » et ouvre une page qui l'explique.",
    "Cherche « Black Friday 2026 date ».",
    "Réponds aux questions ci-dessous.",
])
T.faits([
    "Que veulent dire les lettres WMS (en anglais ou en français) ?",
    "Date du Black Friday 2026",
])
T.questions([("À quoi sert un WMS dans un entrepôt ?", 2)])
T.qcm([
    ("Exporter des données d'un logiciel, c'est :",
     ["les copier dans un fichier qu'on ouvre ailleurs", "les effacer du logiciel", "les envoyer au client"], 0),
])
T.reflechir([
    "Le logiciel affiche déjà toutes les commandes. D'après toi, pourquoi Nadia veut-elle les avoir dans un "
    "tableur ?",
])

# ==================================================================== étape 2
T.etape(2, "Lire la mission de Nadia")
T.p("Ouvre l'activité « Cdiscount — ce que disent les chiffres ». Dans le menu de gauche, clique sur « Messagerie » "
    "et ouvre le message de Nadia Ferrand : « Allée A : ce que disent les chiffres ». Lis-le en entier.")
T.encadre('Un mot de métier :',
          "un constat d'écart, c'est quand un préparateur trouve au rayon un stock différent de celui du logiciel. "
          "Il le note sur son bon de préparation, dans la colonne « Stock trouvé ».")
T.tableau(['Information', 'Ce que tu relèves'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(1.0),
          remplis=[["Quelle allée Nadia veut-elle vérifier ?", ''],
                   ["Dans quel menu fais-tu l'export ?", ''],
                   ["Quelle liste exportes-tu ?", ''],
                   ["Nom de la première colonne à ajouter", ''],
                   ["Nom de la deuxième colonne à ajouter", ''],
                   ["Fonction à utiliser dans la deuxième colonne", ''],
                   ["Fonction à utiliser dans la feuille Synthèse", ''],
                   ["Par quels mots doit commencer la ligne de ta réponse ?", '']])
T.reflechir([
    "Nadia écrit : « On ne recompte pas tout ». D'après toi, pourquoi ne pas recompter toute l'allée ?",
])

# ==================================================================== étape 3
T.etape(3, "Vérifier l'extraction, exporter, ouvrir")
T.p("Dans un logiciel d'entrepôt, on n'exporte pas tout : on choisit d'abord les lignes à sortir, avec des "
    "critères. Ici, les critères sont déjà réglés pour toi. Ton travail : les vérifier et comprendre pourquoi ce "
    "sont les bons.")
T.consignes([
    "Dans le menu de gauche, partie « Outils », clique sur « Extractions ». La liste « Lignes de préparation » "
    "s'affiche : ses critères sont au-dessus du tableau.",
    "Vérifie les deux critères : « Allée » doit être sur « A », et « Période » sur « 30 derniers jours ».",
    "Sous les critères, à gauche du bouton « Exporter », lis le nombre de lignes : c'est ce que contiendra ton "
    "fichier.",
    "Clique sur « Exporter ». Le fichier cdiscount-lignes-de-preparation.xlsx se télécharge. Ouvre-le dans ton "
    "tableur.",
    "Dès l'ouverture, enregistre-le dans ton dossier, au format .xlsx (Excel) ou .ods (LibreOffice). Jamais en "
    ".csv : un .csv perd tes formules.",
])
T.encadre_liste('Pourquoi ces critères ?', [
    "Allée « A » : Nadia veut vérifier l'allée A. Les lignes des allées B et C ne la concernent pas : elles "
    "fausseraient tes comptes ;",
    "Période « 30 derniers jours » : Nadia veut savoir si le stock est faux maintenant. Un constat d'il y a deux "
    "mois ne dit plus grand-chose : le stock a pu être corrigé depuis.",
])
T.encadre('Pour voir, avant d\'exporter :',
          "mets « Allée » sur « Toutes » et regarde le tableau et le nombre de lignes changer. Puis remets « A ». "
          "Fais-le aussi avec la « Période ». Exporte seulement quand les deux critères sont revenus sur ceux de "
          "Nadia.")
T.faits(["Avec « Allée » sur « Toutes », le nombre de lignes augmente-t-il ou diminue-t-il ?"])
T.questions([("Explique pourquoi, avec ce que tu vois dans le tableau.", 2)])
T.faits(["Nombre de lignes affiché dans Extractions, avec les critères de Nadia"])
T.encadre_liste('Ce que tu dois voir dans ton fichier :', [
    "deux onglets en bas : « Préparations » et « Synthèse » ;",
    "dans « Préparations », une ligne par article préparé, avec le stock du logiciel et le stock trouvé ; "
    "toutes les lignes sont de l'allée A (colonne « Emplacement » : A-…) ;",
    "autant de lignes de données (sans la ligne des titres) que le nombre affiché dans Extractions ;",
    "dans « Synthèse », la liste des références, et une colonne « Nb constats » vide.",
])
T.encadre('Si tu as perdu ton fichier :',
          "retourne dans « Extractions » et exporte de nouveau, avec les mêmes critères : tu obtiens les mêmes "
          "lignes. Le menu « Fichiers » ne sert qu'à déposer.")
T.faits([
    "Ton fichier a-t-il le même nombre de lignes que l'écran Extractions ? (oui / non)",
    "Lettre de la colonne « Stock logiciel »",
    "Lettre de la colonne « Stock trouvé »",
    "Lettre de la première colonne vide, à droite du tableau",
])
T.reflechir([
    "Choisis une ligne où le stock trouvé n'est pas égal au stock logiciel. Qu'a-t-il pu se passer dans le rayon ?",
    "Pourquoi choisir les lignes dans le logiciel, plutôt que tout exporter et faire le tri dans le tableur ?",
])

# ==================================================================== étape 4
T.etape(4, "Calculer l'écart")
T.p("L'écart, c'est le stock trouvé moins le stock du logiciel. Tu vas le calculer avec une formule, sur toutes "
    "les lignes d'un coup.")
T.encadre_liste('Écrire une formule :', [
    "une formule commence toujours par le signe = ;",
    "on écrit l'adresse des cellules (par exemple C2), pas leur valeur : si la valeur change, le résultat suit ;",
    "pour recopier une formule vers le bas : sélectionne la cellule, puis double-clique sur le petit carré en bas "
    "à droite de la cellule (la poignée de recopie).",
], intro="")
T.encadre('Un exemple, sur d\'autres données :',
          "si B2 contient 12 cartons commandés et C2 10 cartons livrés, on écrit en D2 : =C2-B2. Le résultat est −2 : "
          "il manque 2 cartons.")
T.consignes([
    "Dans la feuille « Préparations », écris le titre Écart dans la première case vide de la ligne 1.",
    "Juste en dessous, écris la formule : stock trouvé moins stock logiciel, avec les adresses de la ligne 2.",
    "Recopie la formule jusqu'à la dernière ligne du tableau.",
])
T.faits([
    "Formule que tu as écrite en ligne 2",
    "Combien de lignes ont un écart différent de 0 ?",
])
T.encadre_liste('Ce que tu dois voir :', [
    "un 0 sur la plupart des lignes ;",
    "quelques nombres négatifs (le rayon a moins que le logiciel) ou positifs (il a plus) ;",
    "en cliquant sur une cellule de la colonne, la formule s'affiche dans la barre du haut, pas un nombre.",
])
T.reflechir([
    "Pourquoi écrire une formule, plutôt que calculer de tête et taper le résultat ?",
])

# ==================================================================== étape 5
T.etape(5, "Isoler les références en écart (SI)")
T.p("Sur une trentaine de lignes, les écarts se perdent au milieu des zéros. Tu vas faire écrire au tableur la "
    "référence seulement quand l'écart n'est pas nul.")
T.encadre_liste('La fonction SI :', [
    "=SI(test ; valeur si vrai ; valeur si faux) ;",
    "le test compare deux choses : = (égal), <> (différent de), > (plus grand que), < (plus petit que) ;",
    "un texte s'écrit entre guillemets ; \"\" (deux guillemets collés) veut dire « rien, une case vide ».",
])
T.encadre('Un exemple, sur d\'autres données :',
          "=SI(C2>=20;\"Complète\";\"\") écrit « Complète » si la palette de la ligne 2 a 20 cartons ou plus, et "
          "laisse la case vide sinon.")
T.encadre_liste('Erreurs fréquentes :', [
    "oublier les guillemets autour d'un texte ;",
    "séparer avec des virgules : en français, le tableur sépare avec des points-virgules ;",
    "taper une référence entre guillemets au lieu de l'adresse de sa cellule : la formule ne marche que pour "
    "cette ligne.",
])
T.consignes([
    "Écris le titre Réf. en écart dans la colonne vide suivante, ligne 1.",
    "En ligne 2, écris une formule SI : si l'écart n'est pas égal à 0, elle recopie la référence de la ligne ; "
    "sinon, elle laisse la case vide.",
    "Recopie-la jusqu'à la dernière ligne.",
])
T.faits(["Formule que tu as écrite en ligne 2"])
T.encadre('Ce que tu dois voir :',
          "une colonne presque vide : une référence apparaît seulement sur les lignes où l'écart n'est pas 0.")
T.reflechir([
    "Quelle partie de la formule SI t'a demandé le plus d'essais ?",
])

# ==================================================================== étape 6
T.etape(6, "Compter les constats (NB.SI)")
T.p("Une même référence peut avoir plusieurs constats. Dans la feuille « Synthèse », tu vas compter, pour chaque "
    "référence, combien de fois elle apparaît dans ta colonne « Réf. en écart ».")
T.encadre_liste('La fonction NB.SI :', [
    "=NB.SI(plage ; ce qu'on compte) : elle compte les cases de la plage égales à ce qu'on cherche ;",
    "la plage peut être dans une autre feuille : tape =NB.SI( puis clique sur l'onglet « Préparations » et "
    "sélectionne la colonne entière en cliquant sur sa lettre ;",
    "ce qu'on compte : l'adresse de la cellule qui porte la référence, dans la feuille Synthèse.",
])
T.encadre('Un exemple, sur d\'autres données :',
          "=NB.SI(B:B;\"Lyon\") compte combien de cases de la colonne B contiennent Lyon. Avec =NB.SI(B:B;E2), on "
          "compte ce qui est écrit en E2 : en recopiant vers le bas, chaque ligne compte sa propre ville.")
T.consignes([
    "Va dans la feuille « Synthèse ». En B2 (colonne « Nb constats »), écris la formule NB.SI.",
    "Recopie-la jusqu'à la dernière référence.",
    "Recopie tes résultats dans le tableau ci-dessous.",
])
T.tableau(['Référence', 'Nb constats', 'Référence', 'Nb constats'], 6,
          [Cm(5.0), Cm(3.5), Cm(5.0), Cm(3.5)], hauteur=Cm(0.75))
T.faits(["Formule que tu as écrite en B2"])
T.reflechir([
    "Une référence a plusieurs constats, une autre un seul. Laquelle te paraît la plus urgente à recompter ? "
    "Explique.",
])

# ==================================================================== étape 7
T.etape(7, "Déposer ton fichier")
T.consignes([
    "Enregistre ton fichier et ferme-le dans le tableur.",
    "Dans Prepalog, clique sur « Fichiers » dans le menu de gauche.",
    "Sous « Déposer mon fichier », clique sur « parcourir » (ou glisse ton fichier dans le cadre).",
    "Lis le tableau du résultat, ligne par ligne.",
])
T.encadre_liste('Ce que tu dois voir :', [
    "« Dernier fichier déposé : » et le nom de ton fichier ;",
    "une ligne sur ton export : « ✓ Export : vos critères donnent bien les lignes demandées. », ou « ✗ Export à "
    "refaire (Extractions) » suivi du critère à changer ;",
    "une phrase « … résultats justes sur … » ;",
    "un tableau : une ligne par calcul, ✓ s'il est juste, ✗ sinon, et la colonne « Ce qui cloche ».",
])
T.encadre('Si l\'export est ✗ :',
          "le site te dit quel critère changer. Retourne dans « Extractions », règle-le, exporte de nouveau, recopie "
          "tes formules dans le nouveau fichier et redépose. Une erreur d'export ne te coûte que ce point-là : tes "
          "calculs sont contrôlés sur le fichier que tu as réellement exporté.")
T.encadre('Si un calcul est ✗ :',
          "lis « Ce qui cloche » (par exemple « la cellule contient un nombre tapé, pas une formule »), corrige ton "
          "fichier, enregistre-le et dépose-le de nouveau. Tu peux le faire autant de fois que tu veux : le "
          "meilleur dépôt est retenu.")
T.tableau(['Dépôt', 'Résultats justes', 'Ce qui clochait (en quelques mots)'], 0,
          [Cm(2.4), Cm(4.0), Cm(10.6)], hauteur=Cm(1.0),
          remplis=[['1er', '', ''], ['2e', '', ''], ['3e', '', '']])
T.encadre('Tu peux passer à l\'étape 8 quand :',
          "le site affiche « ✓ Export » et « Tout est juste. »")
T.reflechir([
    "Si ton premier dépôt n'était pas tout juste, qu'as-tu corrigé ?",
])

# ==================================================================== étape 8
T.etape(8, "Choisir et écrire à Nadia")
T.p("Ta synthèse montre quelles références ont des constats d'écart. Ce sont elles que Nadia fera recompter.")
T.p("Ma liste de références à recompter (garde-la pour ENT-2.3) :", taille=10.5, gras=True, avant=4, apres=4)
T.tableau(['Référence', 'Nombre de constats'], 6, [Cm(8.6), Cm(8.4)], hauteur=Cm(0.85))
T.encadre_liste("À lire AVANT d'écrire : le suivi lit ta ligne.", [
    "la ligne commence par « À recompter : » (elle est déjà écrite quand tu cliques sur « Répondre ») ;",
    "recopie chaque référence en entier, séparées par des virgules ;",
    "seulement les références que tes chiffres désignent, pas une de plus.",
])
T.consignes([
    "Dans « Messagerie », ouvre le message de Nadia et clique sur « Répondre ».",
    "Complète la ligne « À recompter : » avec ta liste, puis clique sur « Envoyer ».",
])
T.encadre('Ce que tu dois voir :',
          "Nadia répond qu'elle a noté ta liste. Sa réponse ne dit pas si elle est juste : tu le verras en recomptant, "
          "à la séance suivante.")
T.reflechir([
    "Nadia aurait pu faire recompter toute l'allée. Pourquoi ta liste est-elle un meilleur choix ?",
])

NOTIONS = [["Exporter des données d'un logiciel", "Export",
            "Exporter, c'est copier des données d'un logiciel (ici le WMS) dans un fichier qu'on ouvre ailleurs, "
            "par exemple un tableur. Les données restent dans le logiciel. Avant d'exporter, on choisit les lignes "
            "à sortir avec des critères (une zone, une période…) : le fichier contient ce qu'on voit à l'écran."]]
# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026 :
# contenu dans `feuilles_detachables.py`.
T.feuille_detachable('ENT-2.2')

T.finir(CODE, 'Cdiscount — ce que disent les chiffres', 'ENT-2.2-cdiscount-chiffres-trame-eleve', NOTIONS,
        os.path.basename(__file__), fichier=CODE)
