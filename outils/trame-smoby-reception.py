# -*- coding: utf-8 -*-
"""Trame élève d'ENT-5.4 Smoby, « premier déchargement » (Cowork, 06/10/2026 au soir) — BROUILLON.

Format LONG (6 étapes + feuille de cours à détacher), comme ENT-5.1 à 5.3 (décision de Tristan du 06/10/2026).
Écrite AVANT la validation à l'écran, à la demande de Tristan (« toute la suite 5.3 → 5.8 »). Libellés de l'écran
repris de `core/types/quai.js` (quai sans froid, non iso) sans avoir joué la séance : les passages marqués
« À REVOIR APRÈS L'ESSAI À L'ÉCRAN » sont à relire quand Tristan l'aura validée.

Vérifié (brief ENT-5.4 §2) : l'usine Smoby d'Arinthod et la plateforme de Moirans-en-Montagne ; les gammes ; les
points de sécurité au quai (camion calé ou bloqué, moteur coupé, chauffeur hors de la zone, niveleur, éclairage,
EPI) ; la réserve précise sur le bon de livraison (« sous réserve de déballage » n'a pas de valeur).
Construit (comme dans la séance) : le quai 2, l'horaire, le transporteur, Bruno, les références, quantités, défauts.
Palettes relues dans `contenus/smoby-ent54.js` le 06/10/2026 et recopiées ci-dessous (PALETTES) : cartons réels,
manquants et réserves sont CALCULÉS depuis elles.

Lancer : python3 outils/trame-smoby-reception.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.4-smoby-reception-trame-eleve.docx
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
import corriges_data
from docx.shared import Cm

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'smoby.png')

# ==================================================================== données (relues dans contenus/smoby-ent54.js)
# id : (désignation, BL, W, D, L, manquants, cartons écrasés et côté où ils se voient, décision attendue)
PALETTES = {
    'P1': ('Maison Neo Jura Lodge', 8, 2, 2, 2, 0, None, 'accepter'),
    'P2': ('Cuisine Tefal', 45, 4, 3, 4, 3, None, 'accepter'),            # couche du dessus incomplète, conforme
    'P3': ('Établi Black+Decker', 36, 4, 3, 3, 0, (1, 'l’arrière'), 'reserves'),
    'P4': ('Porteur Little Smoby', 36, 3, 3, 4, 2, None, 'reserves'),      # dont un dans le coin du fond
}
reel = {k: v[2] * v[3] * v[4] - v[5] for k, v in PALETTES.items()}
assert reel == {'P1': 8, 'P2': 45, 'P3': 36, 'P4': 34}, reel
manque_bl = {k: PALETTES[k][1] - reel[k] for k in PALETTES}
assert manque_bl == {'P1': 0, 'P2': 0, 'P3': 0, 'P4': 2}, manque_bl
DECISION = {'accepter': 'Accepter', 'reserves': 'Accepter avec réserves'}
for k, v in PALETTES.items():   # la décision suit des données : une réserve si manque au BL ou carton abîmé
    assert v[7] == ('reserves' if (manque_bl[k] or v[6]) else 'accepter'), k
SECURITE = [('Camion calé (cale ou bloqueur de roue)', False), ('Moteur coupé, clés remises', True),
            ('Chauffeur hors de la zone (local chauffeurs)', True), ('Niveleur bien posé', True),
            ('Plancher de la remorque en bon état et éclairé', True), ('EPI portés', True)]
RESERVES = {'P3': '1 carton endommagé (écrasé) sur l’établi Black+Decker',
            'P4': '2 cartons manquants de porteur Little Smoby (34 reçus pour 36 au BL)'}
LIGNE_RESERVES = 'Réserves : 1 carton écrasé sur l’établi Black+Decker et 2 porteurs manquants.'

# ==================================================================== la trame
T.nouveau()
T.entete(LOGO, 'ENT-5.4 — Carnet de suivi : premier déchargement', [
    ('Ce document est ta trame de travail :', "tu peux le suivre seul, étape par étape. Tu es Yanis, cariste chez "
     "Smoby depuis ce matin. Cet après-midi, tu reçois ton premier camion au quai 2 : la navette de l'usine "
     "d'Arinthod."),
    ('Ce que ton enseignant voit dans son suivi :', "dix points : la sécurité avant de décharger (2), le contrôle de "
     "chaque palette (4), tes deux réserves (2), la signature du chauffeur (1) et ton compte rendu à Bruno (1). Tes "
     "réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :', "Smoby, son usine d'Arinthod, sa plateforme de Moirans-en-Montagne, "
     "ses jouets et les règles de sécurité au quai sont réels. Le quai 2, l'horaire, le transporteur, Bruno, les "
     "quantités et les défauts sont inventés pour l'exercice.")],
    [('Le message de Bruno', 'Prepalog : Messagerie'),
     ('Avant de décharger : la sécurité', 'Prepalog : Quai de réception'),
     ('Décharger et compter', 'Prepalog : Quai de réception'),
     ('Faire le tour et décider', 'Prepalog : Quai de réception'),
     ('Les réserves et la signature', 'Prepalog : Quai de réception'),
     ('Rendre compte à Bruno', 'Prepalog : Messagerie')], nom_logo='SMOBY')

# ==================================================================== étape 1
T.etape(1, 'Le message de Bruno')
T.consignes(["Ouvre la Messagerie et lis le message de Bruno.",
             "Clique sur les mots soulignés si tu ne les connais pas.",
             "Réponds aux questions : tout se trouve dans le message."])
T.faits(['À quelle heure arrive ton premier camion ?', 'À quel quai ?', 'D’où vient ce camion ?',
         'Combien de palettes apporte-t-il ?', 'Que vérifie-t-on toujours avant de décharger ?'], hauteur=Cm(0.95))
T.encadre('Une navette :', "un camion qui fait toujours le même trajet entre deux sites d'une même entreprise. Ici, "
          "il apporte à la plateforme de Moirans les jouets fabriqués à l'usine d'Arinthod (Jura).")
T.qcm([("Le bon de livraison (BL), c'est…",
        ['la facture que Smoby doit payer', 'la liste de ce que le camion apporte', 'le contrat du chauffeur'], 1)])
T.reflechir(["Le camion vient d'une usine Smoby, pour une plateforme Smoby. Pourquoi contrôler quand même ce qu'il "
             "apporte ?"])

# ==================================================================== étape 2
T.etape(2, 'Avant de décharger : la sécurité')
T.consignes(["Ouvre le menu « Quai de réception ». Lis la scène : trois lignes, à lire jusqu'au bout.",
             "Pour chaque point, décide au crayon : OK ou pas OK ?",
             "Juge chaque point à l'écran. Si un point n'est pas OK, signale-le au chef de quai AVANT de commencer à "
             "décharger."])
T.tableau(['Point à vérifier', 'OK ou pas OK ?', 'Pourquoi ce point compte'], 0, [Cm(6.4), Cm(2.8), Cm(7.8)],
          hauteur=Cm(1.0), remplis=[[x] for x, _ in SECURITE])
T.faits(['Quel point n’est pas OK ?', 'Qu’a fait Bruno quand tu l’as signalé ?'], hauteur=Cm(0.9))
T.qcm([("Un point de sécurité n'est pas OK, le chauffeur est pressé. Tu…",
        ['commences quand même, ce sera rapide', 'le signales au chef de quai et tu attends',
         'demandes au chauffeur de surveiller'], 1)])
T.reflechir(["Que pourrait-il arriver si le camion bougeait pendant que tu es dedans avec le chariot ?"])

# ==================================================================== étape 3   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(3, 'Décharger et compter')
T.consignes(["Décharge les 4 palettes au chariot frontal (Yanis a le CACES 3).",
             "Pour chaque palette : compte les cartons d'une couche, puis le nombre de couches.",
             "Écris ton total à l'écran et compare-le au bon de livraison (BL)."])
T.encadre_liste('Compter une palette sans compter chaque carton :', [
    'cartons d’une couche = cartons en largeur × cartons en profondeur ;',
    'total = cartons d’une couche × nombre de couches ;',
    'puis on enlève les cartons qui manquent (une couche du haut incomplète, un trou dans un coin).'])
T.tableau(['Palette', 'Produit', 'Cartons d’une couche', 'Couches', 'Cartons qui manquent', 'Total compté', 'BL'],
          0, [Cm(1.5), Cm(4.4), Cm(2.4), Cm(1.8), Cm(2.5), Cm(2.4), Cm(2.0)], hauteur=Cm(1.0),
          remplis=[[k, v[0]] for k, v in PALETTES.items()])
T.faits(['Sur quelle palette ton total est-il différent du BL ? De combien ?',
         'Sur P2, la couche du dessus n’est pas complète. Manque-t-il des cartons par rapport au BL ?'],
        hauteur=Cm(0.95))
T.reflechir(["Pourquoi est-il plus sûr de compter par couches que carton par carton ?"])

# ==================================================================== étape 4   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(4, 'Faire le tour et décider')
T.consignes(["Pour chaque palette, clique « Faire le tour de la palette » : regarde ses quatre côtés.",
             "Lis l'étiquette d'un carton et compare-la au BL.",
             "Note ce que tu vois sur ta fiche de contrôle, puis décide : accepter, ou accepter avec réserves."])
T.tableau(['Palette', 'Étiquette = BL ? (oui / non)', 'Cartons abîmés (combien, de quel côté)', 'Ta décision'], 0,
          [Cm(1.6), Cm(3.4), Cm(6.4), Cm(5.6)], hauteur=Cm(1.05), remplis=[[k] for k in PALETTES])
T.qcm([("Le carton écrasé de P3 se voit…", ['de l’avant', 'seulement de l’arrière', 'd’en haut'], 1),
       ("P4 a 34 cartons pour 36 sur le BL. Tu…",
        ['acceptes : 2 cartons, ce n’est rien', 'acceptes avec réserves : 2 cartons manquants',
         'refuses toute la palette'], 1)])
T.reflechir(["Pourquoi faut-il faire le tour de chaque palette, même quand l'avant est parfait ?"])

# ==================================================================== étape 5
T.etape(5, 'Les réserves et la signature')
T.encadre('Une réserve :', "c'est ce que tu écris sur le BL, devant le chauffeur, quand la livraison n'est pas "
          "conforme. Elle doit être précise : quelle palette, quoi, combien. Le chauffeur la signe : il reconnaît "
          "qu'il l'a vue.")
T.consignes(["Rentre les palettes acceptées en zone de réception.",
             "Écris tes réserves, puis « Écrire les réserves sur le BL ». Relis-les avant.",
             "Fais signer le chauffeur."])
T.tableau(['Palette', 'Ta réserve (quoi, combien)'], 0, [Cm(2.0), Cm(15.0)], hauteur=Cm(1.1),
          remplis=[['P3'], ['P4']])
T.faits(['Pourquoi n’y a-t-il pas de réserve pour P1 et P2 ?', 'Où vont les palettes après la signature ?'],
        hauteur=Cm(0.95))
T.qcm([("La mention « Sous réserve de déballage »…",
        ['protège Smoby', 'ne vaut rien : ce n’est pas une réserve', 'remplace la signature'], 1),
       ("Le chauffeur signe le BL après tes réserves. C'est pour…",
        ['reconnaître qu’il les a vues', 'être payé plus vite', 'dire au revoir'], 0)])
T.reflechir(["Le chauffeur est reparti. Tu découvres un autre carton écrasé, que tu n'avais pas noté. Pourquoi "
             "est-ce plus difficile de réclamer maintenant ?"])

# ==================================================================== étape 6
T.etape(6, 'Rendre compte à Bruno')
T.consignes(["Quand le chauffeur est reparti, Bruno t'écrit : ouvre son message et clique sur « Répondre ».",
             "Choisis une phrase par ligne. La ligne des réserves doit dire ce que tu as écrit sur le BL.",
             "Relis tout ton message avant de l'envoyer."])
T.faits(['Par quelle formule commences-tu ton message ?', 'Quelle ligne des réserves choisis-tu ?',
         'Comment termines-tu ton message ?', 'Qu’annonce Bruno dans sa réponse ?'], hauteur=Cm(1.0))
T.qcm([("Tu as porté deux réserves sur le BL. La phrase « Tout est conforme. » est…",
        ['juste', 'fausse : elle contredit le BL', 'plus courte, donc meilleure'], 1)])
T.reflechir(["Pourquoi Bruno a-t-il besoin de ton compte rendu, alors que le BL est signé ?"])

# ==================================================================== feuille à détacher (cours)
ESSENTIEL = [('Avant de décharger, on vérifie que le camion est {} : sinon, on signale et on attend.', 'calé'),
             ('Cartons d’une palette = cartons d’une couche × nombre de {}, moins ceux qui manquent.', 'couches'),
             ('On fait le {} de chaque palette : un carton abîmé peut être caché derrière.', 'tour'),
             ('Une réserve est {} : quelle palette, quoi, combien.', 'précise')]
LEXIQUE = [('BL', 'Bon de {} : la liste de ce que le camion apporte.', 'livraison'),
           ('niveleur', 'Plaque mobile qui fait le {} entre le quai et la remorque.', 'pont'),
           ('réserve', 'Remarque écrite sur le BL avant la {} du chauffeur.', 'signature'),
           ('cale', 'Bloc posé contre une {} du camion pour qu’il ne bouge pas.', 'roue')]
T.feuille_cours('ENT-5.4', 'Recevoir un camion en sécurité',
                'Logistique — C1.2 règles de sécurité, C1.4 réception (initiation)',
                [ph.format(T.TROU) for ph, _ in ESSENTIEL],
                [m for _, m in ESSENTIEL] + [m for _, _, m in LEXIQUE],
                [(mot, df.format(T.TROU)) for mot, df, _ in LEXIQUE])

# ==================================================================== corrigé de la trame
POURQUOI = {'Camion calé (cale ou bloqueur de roue)': 'Un camion qui avance laisse un vide entre quai et remorque : le chariot tombe.',
            'Moteur coupé, clés remises': 'Personne ne peut démarrer le camion pendant le déchargement.',
            'Chauffeur hors de la zone (local chauffeurs)': 'Il ne risque pas d’être heurté et ne peut pas repartir.',
            'Niveleur bien posé': 'Le chariot passe du quai au camion sans marche ni trou.',
            'Plancher de la remorque en bon état et éclairé': 'Le chariot ne passe pas au travers ; le cariste voit où il roule.',
            'EPI portés': 'Chaussures et gilet protègent le cariste (chute de charge, être vu).'}
ENT_5_4 = {
 "À quelle heure arrive ton premier camion": {"rep": "À 14 h 00."},
 "À quel quai": {"rep": "Au quai 2."},
 "D’où vient ce camion": {"rep": "De l'usine Smoby d'Arinthod (la navette)."},
 "Combien de palettes apporte-t-il": {"rep": f"{len(PALETTES)} palettes de jouets."},
 "Que vérifie-t-on toujours": {"rep": "La sécurité."},
 "Le camion vient d'une usine Smoby": {"pistes": [
   "Une erreur de chargement ou un choc pendant le trajet est toujours possible.",
   "Le stock de la plateforme doit être juste : on ne range que ce qu'on a vraiment reçu.",
   "Un carton abîmé non signalé finirait chez un client.",
   "Le transporteur (Transports Jurassiens) n'est pas Smoby : c'est lui qui répond des dégâts du trajet."]},
 "T: Point à vérifier | OK ou pas OK": {"lignes": [[p, 'OK' if ok else 'pas OK → signaler', POURQUOI[p]] for p, ok in SECURITE],
   "note": "Jalon 1 : la cale signalée AVANT « Commencer à décharger ». Jalon 2 : chaque point jugé juste. Accepter toute raison équivalente."},
 "Quel point n’est pas OK": {"rep": "Le camion n'est pas calé : les roues arrière n'ont pas de cale."},
 "Qu’a fait Bruno quand tu l’as signalé": {"rep": "Il a fait poser la cale, puis a dit qu'on pouvait décharger."},
 "Que pourrait-il arriver si le camion bougeait": {"pistes": [
   "Le camion avance, la remorque s'éloigne du quai : le chariot tombe dans le vide entre les deux.",
   "Le cariste peut être écrasé ou éjecté ; la charge tombe.",
   "C'est un des accidents graves les plus connus au quai : on ne prend jamais ce risque, même pressé."]},
 "T: Palette | Produit | Cartons d’une couche": {"lignes": [[k, v[0], f'{v[2]} × {v[3]} = {v[2] * v[3]}', str(v[4]),
     str(v[5]), str(reel[k]), str(v[1])] for k, v in PALETTES.items()],
   "note": "P2 : 4 × 3 × 4 = 48, moins 3 en haut = 45 = BL (le piège : la couche incomplète n'est pas un manque). P4 : 3 × 3 × 4 = 36, moins 2 = 34 (un trou dans le coin du fond, en haut). Un jalon par palette : comptage ET décision."},
 "Sur quelle palette ton total": {"rep": "P4 : 34 cartons pour 36 au BL, il en manque 2."},
 "Sur P2, la couche du dessus": {"rep": "Non : 45 cartons comptés, 45 au BL. La palette a été préparée ainsi : elle est conforme."},
 "Pourquoi est-il plus sûr de compter par couches": {"pistes": [
   "On ne voit pas les cartons du milieu : on ne peut pas les compter un par un.",
   "Une multiplication évite d'en oublier ou d'en compter deux fois.",
   "C'est plus rapide : le chauffeur attend.",
   "Ensuite, on cherche seulement les trous (couche du haut, coins)."]},
 "T: Palette | Étiquette = BL": {"lignes": [[k, 'oui', (f'{v[6][0]}, visible de {v[6][1]}' if v[6] else '0'),
     DECISION[v[7]] + (' — ' + ('cartons endommagés' if v[6] else 'manquant') if v[7] == 'reserves' else '')]
     for k, v in PALETTES.items()],
   "note": "Motifs proposés à l'écran : conforme, cartons endommagés, manquant (pas de température ni de produit différent en 2de)."},
 "Pourquoi faut-il faire le tour de chaque palette": {"pistes": [
   "Un carton écrasé peut être caché derrière ou sur un côté (P3 : seulement de l'arrière).",
   "Un trou dans un coin du fond ne se voit pas de face (P4).",
   "Après la signature, il est trop tard pour réclamer."]},
 "T: Palette | Ta réserve": {"lignes": [[k, RESERVES[k]] for k in RESERVES],
   "note": "Jalons 7 et 8 : la ligne exacte attendue par l'écran est dans le corrigé calculé de la séance (ENT-5.4.js, « Les réserves écrites sur le BL »). Ici, accepter toute réserve qui dit la palette, quoi et combien."},
 "Pourquoi n’y a-t-il pas de réserve pour P1 et P2": {"rep": "Elles sont conformes : le nombre est celui du BL et aucun carton n'est abîmé."},
 "Où vont les palettes après la signature": {"rep": "En zone de réception (elles y attendent d'être rangées)."},
 "Le chauffeur est reparti. Tu découvres": {"pistes": [
   "Sans réserve sur le BL, rien ne prouve que le carton était abîmé à l'arrivée.",
   "Le transporteur peut dire que le dégât a eu lieu chez Smoby, après son départ.",
   "C'est pour ça qu'on fait le tour et qu'on compte AVANT de signer."],
   "note": "Pour l'enseignant : le destinataire a trois jours (hors jours fériés) pour confirmer une réserve, ou pour signaler un dommage non apparent, par lettre recommandée au transporteur (Code de commerce, art. L133-3). Ici, la navette relie deux sites Smoby : simplifié."},
 "Par quelle formule commences-tu": {"rep": "« Bonjour Bruno, »"},
 "Quelle ligne des réserves choisis-tu": {"rep": f"« {LIGNE_RESERVES} »",
   "note": "Jalon 10 : seule cette ligne est notée. Pièges : « Tout est conforme. » ; « Réserves : 2 cartons écrasés. »"},
 "Comment termines-tu ton message": {"rep": "« Bonne fin de journée, Yanis »"},
 "Qu’annonce Bruno dans sa réponse": {"rep": "Qu'il faut maintenant ranger : la commande de Noël part demain (ENT-5.5)."},
 "Pourquoi Bruno a-t-il besoin de ton compte rendu": {"pistes": [
   "Il n'était pas au quai : il doit savoir vite ce qui manque ou est abîmé.",
   "Il prévient l'usine d'Arinthod ou le transporteur, et prévoit le stock (la commande de Noël part demain).",
   "Le BL est un papier ; le message lui donne l'essentiel en une phrase."]},
}
for ph, mot in ESSENTIEL:
    ENT_5_4[ph.split('{}')[0].strip()] = {"rep": mot + '.'}
ENT_5_4['T: Mot | Définition (complète avec la banque de mots)'] = {
    "lignes": [[mot, m] for mot, _, m in LEXIQUE], "note": "Un mot de la banque par trou."}
corriges_data._DICOS['ENT-5.4'] = [ENT_5_4]

NOTIONS = [
    ["Le bon de livraison (BL)", "Documents de la réception", "Le BL accompagne la marchandise : on compare ce qu'on reçoit à ce papier."],
    ["Un point de sécurité n'est pas OK", "Sécurité au quai", "Un point de sécurité qui n'est pas bon se signale au responsable ; on ne décharge pas avant."],
    ["Le carton écrasé de P3", "Contrôle de la réception", "On fait le tour complet de chaque palette : un dommage peut n'être visible que d'un côté."],
    ["P4 a 34 cartons", "Contrôle de la réception", "Un manque se note en réserve précise ; on ne refuse pas toute une palette pour quelques cartons."],
    ["La mention « Sous réserve de déballage »", "Réserves", "Une réserve doit être précise (quelle palette, quoi, combien) ; une mention générale n'a pas de valeur."],
    ["Le chauffeur signe le BL", "Réserves", "La signature du chauffeur montre que les réserves ont été écrites devant lui, à la livraison."],
    ["Tu as porté deux réserves", "Rendre compte", "Le compte rendu redit fidèlement ce qui est écrit sur le BL."],
]
T.finir('ENT-5.4', 'Smoby — premier déchargement', 'ENT-5.4-smoby-reception-trame-eleve', NOTIONS,
        os.path.basename(__file__))
