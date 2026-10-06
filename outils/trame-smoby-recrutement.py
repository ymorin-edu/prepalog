# -*- coding: utf-8 -*-
"""Trame élève d'ENT-5.1 Smoby, « recruter le cariste de Noël » (Cowork, 06/10/2026).

Format LONG (6 étapes + feuille de cours à détacher), choisi par Tristan le 06/10/2026 au soir entre deux propositions
(courte 2 pages / longue 8 pages) : la règle « trame courte de 1-2 pages » de la fiche « élève de 2de » est suspendue
pour le moment.

Vérifié (web, 03-06/10/2026 : smoby.com « Nous connaître », L'Hebdo du Haut-Jura, Région Bourgogne-Franche-Comté,
hebdo39.net) : Smoby Toys appartient au groupe allemand Simba Dickie ; 4 sites dans le Jura (siège à Lavans-lès-Saint-Claude,
usine d'Arinthod, deux sites à Moirans-en-Montagne dont un entrepôt de 30 000 m²) ; 350 salariés en France ; 45 % des
ventes à l'international ; la logistique de Moirans emploie 25 à 60 personnes selon la saison. L'année de création
(1924 ou 1926 selon les sources) et l'année du rachat ne sont PAS demandées (sources en désaccord).
Construit (comme dans la séance) : Sophie, les cinq candidats, leurs CV, les dates.
Valeurs des CV relues dans `contenus/smoby-ent51.js` le 06/10/2026.

Lancer : python3 outils/trame-smoby-recrutement.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.1-smoby-recrutement-trame-eleve.docx
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
import corriges_data
from docx.shared import Cm

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'smoby.png')
CANDIDATS = ['Yanis Morel', 'Laura Petit', 'Mehdi Benali', 'Thomas Girod', 'Sabrina Lopez']

T.nouveau()
T.entete(LOGO, 'ENT-5.1 — Carnet de suivi : recruter le cariste de Noël', [
    ('Ce document est ta trame de travail :', "tu peux le suivre seul, étape par étape. Aujourd'hui, tu es en renfort "
     "au service RH (ressources humaines) de Smoby. Avant Noël, l'entrepôt manque de caristes : c'est toi qui choisis "
     "le bon candidat."),
    ('Ce que ton enseignant voit dans son suivi :', "neuf points : la ligne de chaque candidat dans ton tableau de tri "
     "(5), le candidat choisi, le contrat, la raison donnée à Sophie et le ton de ton message. Tes réponses écrites "
     "ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :', "Smoby, son entrepôt de Moirans-en-Montagne (Jura) et le CACES sont réels. "
     "Sophie, les cinq candidats, leurs CV et les dates sont inventés pour l'exercice.")],
    [("Découvrir l'entreprise Smoby", 'Internet et ce carnet'),
     ('Lire le message de Sophie et la fiche de poste', 'Prepalog : Messagerie'),
     ('Le CACES a une date de fin', 'Prepalog : les CV'),
     ('Trier les cinq candidats', 'Prepalog : fiche de sélection'),
     ('CDD ou CDI ?', 'Ce carnet et la fiche'),
     ('Répondre à Sophie', 'Prepalog : Messagerie')], nom_logo='SMOBY')

# ==================================================================== étape 1
T.etape(1, "Découvrir l'entreprise Smoby")
T.p("Smoby existe réellement : c'est un fabricant français de jouets. Fais une courte recherche sur Internet.")
T.consignes(["Ouvre un moteur de recherche et tape « Smoby jouets Jura ».",
             "Regarde le site de Smoby (page « Nous connaître ») ou un article de presse.",
             "Réponds aux quatre questions ci-dessous."])
T.faits(['Que fabrique Smoby ? Donne deux exemples de produits.', 'Dans quel département sont ses usines ?',
         'À quel groupe appartient Smoby ? De quel pays est ce groupe ?',
         'Smoby fabrique-t-elle elle-même ses produits ? (oui / non)'], hauteur=Cm(1.1))
T.encadre_liste('Smoby en quelques chiffres (sources publiques, 2024-2025)', [
    "4 sites dans le Jura : le siège à Lavans-lès-Saint-Claude, l'usine d'Arinthod, deux sites à Moirans-en-Montagne.",
    'Un entrepôt de 30 000 m² à Moirans-en-Montagne.', '350 salariés en France.',
    "Près de la moitié des ventes (45 %) se fait à l'étranger.",
    "À l'entrepôt, de 25 à 60 personnes travaillent selon la saison."])
T.qcm([
    ("Smoby produit des jouets pour les vendre. Dans l'économie, Smoby est…",
     ['un ménage', 'une entreprise', 'une administration'], 1),
    ("Les familles qui achètent des jouets Smoby sont…", ['des ménages', 'des entreprises', 'des banques'], 0),
    ("Smoby vend 45 % de ses jouets hors de France. Ces clients font partie…",
     ['des administrations', 'du reste du monde', 'des ménages français'], 1),
])
T.reflechir(["À l'entrepôt, on passe de 25 à 60 personnes selon la saison. Pourquoi faut-il plus de monde en "
             "novembre et en décembre ?"])

# ==================================================================== étape 2
T.etape(2, 'Lire le message de Sophie et la fiche de poste')
T.consignes(["Ouvre la Messagerie et lis le message de Sophie.",
             "Ouvre la pièce jointe « Fiche de poste ».",
             "Clique sur les mots soulignés si tu ne les connais pas.",
             "Réponds aux questions : tout se trouve dans la fiche de poste."])
T.faits(['Où se trouve le poste (ville) ?', 'Quel jour commence le contrat ?', 'Quel jour se termine-t-il ?',
         'Quel type de contrat est proposé ?', 'Quel CACES est exigé ?', 'Quel CACES est seulement apprécié ?'],
        hauteur=Cm(1.0))
T.qcm([("Dans une fiche de poste, « exigé » veut dire…",
        ['obligatoire pour être retenu', 'un plus, mais pas obligatoire', "à passer après l'embauche"], 0),
       ("Le CACES catégorie 3 permet de conduire…",
        ['un transpalette porté', 'un chariot frontal', 'un chariot à mât rétractable'], 1)])
T.reflechir(["Le CACES 5 est « apprécié ». Un candidat qui l'a en plus du 3 est-il forcément le meilleur choix ? "
             "Explique."])

# ==================================================================== étape 3
T.etape(3, 'Le CACES a une date de fin')
T.encadre('Retiens :', "un CACES est valable 5 ans. Obtenu en mai 2024, il reste valable jusqu'en mai 2029. "
          "Pour le poste, il doit être encore valable le mercredi 9 décembre 2026.")
T.p("Ouvre les cinq CV, l'un après l'autre. Attention : l'information n'est jamais au même endroit.", apres=4)
T.tableau(['Candidat', 'Quel CACES ?', 'Obtenu en…', "Valable jusqu'en…", 'Valable le 9/12/2026 ?'], 0,
          [Cm(3.6), Cm(3.0), Cm(3.0), Cm(3.4), Cm(4.0)], hauteur=Cm(1.15), remplis=[[c] for c in CANDIDATS])
T.faits(['Quel candidat a un CACES 3 périmé ?', "Quel candidat n'a pas du tout de CACES 3 ?"], hauteur=Cm(1.0))
T.reflechir(["Pourquoi la loi oblige-t-elle à repasser le CACES tous les 5 ans ? Pense à la sécurité."])

# ==================================================================== étape 4
T.etape(4, 'Trier les cinq candidats')
T.p("Remplis d'abord ce tableau au crayon (oui / non), puis recopie-le dans la fiche de sélection à l'écran. "
    "Rien n'est corrigé avant l'envoi : vérifie bien.", apres=4)
T.tableau(['Candidat', 'CACES 3 valide le 9/12', 'Disponible le 9/12', 'Accepte un CDD'], 0,
          [Cm(4.4), Cm(4.2), Cm(4.2), Cm(4.2)], hauteur=Cm(1.1), remplis=[[c] for c in CANDIDATS])
T.faits(['Quel candidat coche les trois cases ?', 'Thomas a un CACES valide : pourquoi ne convient-il pas ?',
         "Sabrina a tout ce qu'il faut, sauf une chose. Laquelle ?"], hauteur=Cm(1.0))
T.reflechir(["Le tableau de tri sert à comparer cinq CV qui ne se ressemblent pas. Pourquoi est-ce plus sûr que de "
             "choisir « au feeling » ?"])

# ==================================================================== étape 5
T.etape(5, 'CDD ou CDI ?')
T.encadre_liste('Les contrats de travail', [
    'CDI : contrat à durée indéterminée, sans date de fin.',
    "CDD : contrat à durée déterminée, avec une date de fin, pour un besoin limité (un pic d'activité, un remplacement).",
    'CDD saisonnier : pour un travail qui revient chaque année à la même période (Noël, vendanges…).',
    "Contrat de travail temporaire (intérim) : le salarié est employé par une agence, qui le met à disposition de l'entreprise."])
T.encadre('Dans tout contrat de travail, il y a trois éléments :', "un travail à faire, un salaire, et un chef qui "
          "donne les consignes (on dit « lien de subordination »).")
T.qcm([("Le poste dure du 9 décembre au 8 janvier. Quel contrat convient ?", ['un CDI', 'un CDD saisonnier', 'aucun contrat'], 1),
       ("Lequel n'est PAS un élément du contrat de travail ?",
        ['le salaire', 'le travail à faire', 'le CV du candidat'], 2),
       ("Smoby aurait pu demander un cariste à une agence d'intérim. Le contrat serait alors…",
        ['un contrat de travail temporaire', 'un CDI', 'un contrat de vente'], 0)])
T.questions([("Pourquoi Smoby ne propose-t-il pas un CDI pour ce poste ?", 2)])
T.reflechir(["Pour Yanis, quel est l'avantage d'un CDD chez Smoby ? Et l'inconvénient ?"])

# ==================================================================== étape 6
T.etape(6, 'Répondre à Sophie')
T.consignes(["Envoie ta fiche de sélection : Sophie te répond dans la Messagerie.",
             "Clique sur « Répondre » et choisis une phrase par ligne.",
             "Relis tout ton message avant de l'envoyer."])
T.encadre('Retiens :', "au travail, on peut tutoyer une collègue qui te tutoie. Mais on reste poli : on salue, "
          "on explique, on demande gentiment, on remercie.")
T.faits(['Par quelle formule commences-tu ton message ?', 'Quelles sont les trois raisons de ton choix ?',
         'Comment termines-tu ton message ?'], hauteur=Cm(1.1))
T.qcm([("Pour finir un message à une collègue, la meilleure formule est…",
        ['« Bisous »', '« Merci de valider vite »', '« Peux-tu valider ? Merci, bonne journée. »'], 2)])
T.reflechir(["« Car il a le CACES. » : pourquoi cette raison ne suffit-elle pas pour convaincre Sophie ?"])

# ==================================================================== feuille à détacher (cours)
ESSENTIEL = [('Pour conduire un chariot, il faut un {} de la bonne catégorie.', 'CACES'),
             ('Le CACES est valable {} : après, il faut le repasser.', '5 ans'),
             ("Pour un besoin limité dans le temps, l'entreprise propose un {}.", 'CDD'),
             ('Pour comparer des candidats, on utilise un {} avec les critères de la fiche de poste.', 'tableau de tri')]
LEXIQUE = [('fiche de poste', 'Document qui décrit un poste : missions, lieu, horaires, {} et profil.', 'contrat'),
           ('CDI', 'Contrat de travail {}.', 'sans date de fin'),
           ('saisonnier', 'Travail qui revient chaque année à la même {}.', 'période'),
           ('contrat de travail', 'Un travail, un {}, et un chef qui donne les consignes.', 'salaire')]
T.feuille_cours('ENT-5.1', 'Recruter : le CACES et le contrat de travail', "AGOrA — procédure d'entrée (AGO-3.1)",
                [ph.format(T.TROU) for ph, _ in ESSENTIEL],
                [m for _, m in ESSENTIEL] + [m for _, _, m in LEXIQUE],
                [(mot, df.format(T.TROU)) for mot, df, _ in LEXIQUE])

# ==================================================================== corrigé de la trame
ENT_5_1 = {
 "Que fabrique Smoby": {"rep": "Des jouets : jeux de plein air (toboggans, maisonnettes), porteurs et tricycles, cuisines et jeux d'imitation, poupées et poussettes…", "note": "Source : smoby.com, « Nous connaître ». Accepter deux jouets de la marque."},
 "Dans quel département sont ses usines": {"rep": "Le Jura (39).", "note": "Usine principale à Arinthod ; siège à Lavans-lès-Saint-Claude ; Moirans-en-Montagne (montage, entrepôt). Smoby a aussi une usine en Espagne (Alicante) : accepter le Jura."},
 "À quel groupe appartient Smoby": {"rep": "Au groupe Simba Dickie, un groupe allemand.", "note": "Sources : smoby.com ; L'Hebdo du Haut-Jura. L'année du rachat diffère selon les sources : elle n'est pas demandée."},
 "Smoby fabrique-t-elle elle-même": {"rep": "Oui : la plupart des jouets sont fabriqués dans ses usines du Jura (70 à 75 % selon les sources).", "note": "Smoby est un producteur (comparer avec un distributeur qui revend ce que d'autres fabriquent)."},
 "À l'entrepôt, on passe de 25 à 60": {"pistes": [
   "Les familles achètent la plupart des jouets pour Noël : les magasins commandent beaucoup en octobre-novembre.",
   "Il faut préparer et expédier beaucoup plus de palettes en peu de temps.",
   "Après Noël, l'activité baisse : on n'a plus besoin d'autant de monde (d'où le CDD saisonnier)."]},
 "Où se trouve le poste": {"rep": "À Moirans-en-Montagne (Jura), à la plateforme logistique."},
 "Quel jour commence le contrat": {"rep": "Le mercredi 9 décembre 2026."},
 "Quel jour se termine-t-il": {"rep": "Le vendredi 8 janvier 2027."},
 "Quel type de contrat est proposé": {"rep": "Un CDD saisonnier (pic d'activité de Noël)."},
 "Quel CACES est exigé": {"rep": "Le CACES R489 catégorie 3 (chariot frontal), encore valable le jour de la prise de poste."},
 "Quel CACES est seulement apprécié": {"rep": "Le CACES R489 catégorie 5 (chariot à mât rétractable)."},
 "Le CACES 5 est « apprécié »": {"pistes": [
   "Non : un « plus » ne remplace pas une condition exigée (CACES 3 valide, disponibilité, contrat).",
   "Sabrina a le 3 et le 5, mais elle refuse le CDD : elle ne peut pas être retenue.",
   "À conditions égales, le CACES 5 permet de départager deux candidats."]},
 "T: Candidat | Quel CACES": {"lignes": [
   ["Yanis Morel", "cat. 3 et 5", "mai 2024", "mai 2029", "oui"],
   ["Laura Petit", "cat. 3", "mars 2021", "mars 2026", "non (périmé)"],
   ["Mehdi Benali", "cat. 1A", "février 2025", "février 2030", "non : pas de CACES 3"],
   ["Thomas Girod", "cat. 3", "2023", "2028", "oui"],
   ["Sabrina Lopez", "cat. 3 et 5", "juin 2022", "juin 2027", "oui"],
 ], "note": "Thomas n'écrit pas le mois : valable de toute façon (au plus tôt janvier 2028). Mehdi : son 1A est valable, mais ce n'est pas le CACES exigé."},
 "Quel candidat a un CACES 3 périmé": {"rep": "Laura Petit (obtenu en mars 2021, périmé depuis mars 2026)."},
 "Quel candidat n'a pas du tout de CACES 3": {"rep": "Mehdi Benali (seulement la catégorie 1A, le transpalette porté)."},
 "Pourquoi la loi oblige-t-elle à repasser": {"pistes": [
   "Les règles de sécurité et les engins changent.",
   "On perd des réflexes ou on prend de mauvaises habitudes.",
   "Un chariot mal conduit peut blesser ou tuer : on vérifie régulièrement que le conducteur sait toujours faire.",
   "Le CACES est délivré pour 5 ans (recommandation R489) ; c'est l'employeur qui autorise ensuite la conduite."]},
 "T: Candidat | CACES 3 valide le 9/12": {"lignes": [
   ["Yanis Morel", "oui", "oui (dès le 30/11)", "oui"],
   ["Laura Petit", "non", "oui", "oui"],
   ["Mehdi Benali", "non", "oui", "oui"],
   ["Thomas Girod", "oui", "non (libre le 4/01/2027)", "oui"],
   ["Sabrina Lopez", "oui", "oui", "non (CDI uniquement)"],
 ], "note": "C'est le tableau attendu à l'écran (jalons 1 à 5), calculé dans contenus/smoby-ent51.js."},
 "Quel candidat coche les trois cases": {"rep": "Yanis Morel."},
 "Thomas a un CACES valide": {"rep": "Il n'est libre qu'à partir du 4 janvier 2027 : après le début du poste (et presque à la fin du pic)."},
 "Sabrina a tout ce qu'il faut": {"rep": "Elle ne veut qu'un CDI : elle refuse le CDD proposé."},
 "Le tableau de tri sert à comparer": {"pistes": [
   "On vérifie les mêmes critères pour tout le monde : c'est juste et on n'oublie rien.",
   "Les CV ne présentent pas les informations au même endroit : le tableau les remet en ordre.",
   "On peut expliquer son choix à sa tutrice (preuve écrite), et éviter de choisir quelqu'un parce qu'il « a l'air bien »."]},
 "Pourquoi Smoby ne propose-t-il pas un CDI": {"rep": "Parce que le besoin est limité dans le temps : le pic de Noël, du 9 décembre au 8 janvier. Après, l'entrepôt n'a plus besoin de ce cariste en plus.", "note": "Un CDD doit correspondre à un besoin temporaire (ici, l'activité saisonnière)."},
 "Pour Yanis, quel est l'avantage d'un CDD": {"pistes": [
   "Avantage : un emploi tout de suite, une expérience chez Smoby, un salaire, peut-être un nouveau contrat plus tard.",
   "Inconvénient : le travail s'arrête le 8 janvier ; il devra chercher un autre emploi.",
   "Accepter toute réponse qui oppose un avantage et un inconvénient."]},
 "Par quelle formule commences-tu": {"rep": "« Bonjour Sophie, »"},
 "Quelles sont les trois raisons de ton choix": {"rep": "Il a le CACES 3 valide, il est disponible le 9 décembre et il accepte un CDD."},
 "Comment termines-tu ton message": {"rep": "« Peux-tu valider ? Merci, bonne journée. »", "note": "Phrase du lot A du brief SMOBY-retours-5.1-5.2 (décision 4a de Tristan). Tant que le lot A n'est pas en ligne, l'écran propose « Pouvez-vous valider ? Cordialement, »."},
 "« Car il a le CACES. »": {"pistes": [
   "Elle est incomplète : Laura, Thomas et Sabrina ont aussi un CACES.",
   "Sophie doit pouvoir vérifier les trois critères : CACES 3 valide, disponible le 9/12, accepte un CDD.",
   "Une bonne raison permet à la direction de valider sans relire les cinq CV."]},
}
for ph, mot in ESSENTIEL:
    ENT_5_1[ph.split('{}')[0].strip()] = {"rep": mot + '.'}
ENT_5_1['T: Mot | Définition (complète avec la banque de mots)'] = {
    "lignes": [[mot, m] for mot, _, m in LEXIQUE], "note": "Un mot de la banque par trou."}
corriges_data._DICOS['ENT-5.1'] = [ENT_5_1]

NOTIONS = [
    ["Smoby produit des jouets", "Agents économiques (M1)", "Une entreprise produit des biens ou des services pour les vendre."],
    ["Les familles qui achètent", "Agents économiques (M1)", "Les ménages consomment les biens et services produits par les entreprises."],
    ["Smoby vend 45 %", "Agents économiques (M1)", "Le « reste du monde » regroupe les agents situés à l'étranger avec qui on échange."],
    ["Le poste dure du 9 décembre", "Types de contrats (M5)", "Un besoin limité dans le temps et qui revient chaque année appelle un CDD saisonnier."],
    ["Lequel n'est PAS un élément", "Contrat de travail (M5)", "Trois éléments : une prestation de travail, une rémunération, un lien de subordination."],
    ["Smoby aurait pu demander", "Types de contrats (M5)", "En intérim, le salarié signe un contrat de travail temporaire avec l'agence."],
]
T.finir('ENT-5.1', 'Smoby — recruter le cariste de Noël', 'ENT-5.1-smoby-recrutement-trame-eleve', NOTIONS,
        os.path.basename(__file__))
