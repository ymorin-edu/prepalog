# -*- coding: utf-8 -*-
"""Fiche d'intention pédagogique du scénario S1 de la 2de GATL : Smoby → Kuehne+Nagel, « La commande de Noël »
(ENT-5.1 à ENT-5.8). Écrite par Cowork le 04/10/2026.

Sources : docs/briefs/COORDINATION-smoby.md, les briefs ENT-5.1 à 5.8, le code livré d'ENT-5.1
(activites/smoby-recrutement.js, contenus/smoby.js, contenus/smoby-ent51.js), les fiches projet
prepalog-2de-s1-cadrage, prepalog-2de-s1-visite, prepalog-2de-socle-transversal.

À METTRE À JOUR à chaque séance livrée et validée à l'écran : passer la séance de PROVISOIRE à VALIDÉE dans
ETATS, recaler ses textes sur le code (libellés, messages, jalons), puis relancer :
    python outils/intention-smoby.py
Ne pas déclarer intention dans ENTREPRISES avant la relecture de Tristan.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import intention_commun as I
from docx.shared import Cm

LIVREE = 'Lue dans le code livré le 04/10/2026. Séance construite, fermée aux élèves tant que tu ne l\'as pas ouverte ' \
         'dans « Conduite de séance ». À valider à l\'écran.'
PROVISOIRE = 'PROVISOIRE — écrite d\'après le brief (04/10/2026), séance pas encore construite. Les libellés exacts ' \
             'seront recalés sur le code après ta validation à l\'écran.'
ETATS = {
    'ENT-5.1': LIVREE,
    'ENT-5.2': PROVISOIRE, 'ENT-5.3': PROVISOIRE, 'ENT-5.4': PROVISOIRE + ' (en construction le 04/10 au soir.)',
    'ENT-5.5': PROVISOIRE, 'ENT-5.6': PROVISOIRE, 'ENT-5.7': PROVISOIRE, 'ENT-5.8': PROVISOIRE,
}

I.nouveau()
I.couverture(
    [(os.path.join(I.LOGOS, 'simulog.png'), Cm(1.6)), (os.path.join(I.LOGOS, 'smoby.png'), Cm(1.4))],
    'La commande de Noël — Smoby → Kuehne+Nagel',
    '2de famille GATL · scénario S1 · 8 séances d\'1 h (ENT-5.1 à ENT-5.8) · temps du guidage',
    [
        'Version du **4 octobre 2026**. **ENT-5.1** est décrite d\'après le code livré ; **ENT-5.2 à ENT-5.8** d\'après '
        'leurs briefs : elles sont marquées **PROVISOIRE** et seront recalées à chaque séance validée à l\'écran.',
        'Ce document est **public** comme tout le site : il ne contient aucun mot de passe ni code d\'accès. Le '
        'scénario n\'en utilise d\'ailleurs aucun.',
        'Ce qui fait foi pour le détail technique : les briefs docs/briefs/ENT-5.x-smoby-*.md et COORDINATION-smoby.md.',
    ])

# ================================================================== A. LE SCÉNARIO
I.partie('A. Le scénario')

I.h2('1. L\'histoire en bref')
I.p('Fin 2026, la plateforme logistique **Smoby de Moirans-en-Montagne** (Jura) prépare le pic de Noël. L\'élève arrive '
    '« en renfort » et joue **son propre rôle** à trois postes, dans **l\'ordre du flux** :')
I.puces([
    '**Assistant RH** (ENT-5.1, 5.2) : il recrute Yanis, le cariste du pic, puis prépare son arrivée et le planning de l\'équipe.',
    '**Cariste** (ENT-5.3 à 5.6) : à la place de Yanis, il visite la plateforme, décharge et contrôle le camion de l\'usine '
    'd\'Arinthod, range les palettes, puis prépare la palette mixte de la commande de Noël.',
    '**Agent d\'exploitation chez Kuehne+Nagel**, agence de Besançon (ENT-5.7, 5.8) : il planifie les enlèvements de la '
    'commande, remplit la lettre de voiture et gère un retard.',
])
I.p('**Enjeu métier** : une même commande traverse trois métiers (gestion, logistique, transport). C\'est aussi le moyen '
    'd\'**ouvrir la 2de sur les trois spécialités** (AGOrA, Logistique, OTM) avant le choix de fin d\'année.')

I.h3('Calendrier de l\'histoire')
I.tableau(['Quand (dans l\'histoire)', 'Séance', 'Ce qui se passe'], [
    ['fin novembre', 'ENT-5.1', 'Recrutement du cariste.'],
    ['début décembre', 'ENT-5.2', 'Arrivée de Yanis préparée ; planning des semaines du 7 et du 14 décembre.'],
    ['mer. 9 déc., 8 h', 'ENT-5.3', 'Premier jour de Yanis : visite de la plateforme.'],
    ['mer. 9 déc., 14 h', 'ENT-5.4', 'Premier camion de l\'usine d\'Arinthod au quai 2.'],
    ['mer. 9 déc., fin d\'après-midi', 'ENT-5.5', 'Rangement des 4 palettes, entrée en stock.'],
    ['mer. 9 déc., 17 h 30', 'ENT-5.6', 'Préparation de la palette mixte de l\'enlèvement E1.'],
    ['jeu. 10 déc.', 'ENT-5.7', 'K+N planifie les 5 enlèvements de la journée.'],
    ['jeu. 10 déc., 6 h → 8 h 30', 'ENT-5.8', 'Départ d\'E1 (33 palettes, 6 091 kg) ; retard sur l\'A40.'],
], [Cm(4.2), Cm(2.0), Cm(11.2)])

I.h2('2. Ce qui est réel, ce qui est construit')
I.p('Règle du site : on part d\'entreprises **réelles et vérifiées**, et tout ce qui est inventé est **annoncé comme tel** '
    'à l\'élève (encadré « Bon à savoir », mention sous les photos, pied des documents reconstitués).')
I.tableau(['Vérifié (sources publiques, relevées les 03-04/10/2026)', 'Construit pour l\'exercice'], [
    ['Smoby Toys (groupe Simba Dickie) : 4 implantations dans le Jura, environ 350 salariés ; **Moirans-en-Montagne** = '
     'montage et **stockage logistique** ; la logistique y emploie **25 à 60 personnes selon la saison** ; usine '
     'd\'**Arinthod** (principal site de production) ; gammes Smoby Life, Tefal, Little Smoby, Black+Decker ; maison Neo Jura Lodge.',
     'Le besoin de recrutement, la fiche de poste, les 5 candidats et leurs CV, tous les personnages (Sophie Martin, Yanis '
     'Morel, Bruno, l\'équipe, les chauffeurs), les dates, références, quantités, poids, le plan de l\'entrepôt.'],
    ['**CACES R489** : cat. 3 chariot frontal (déchargement), cat. 5 chariot à mât rétractable (hauteur), valable 5 ans. '
     '**CDD saisonnier** possible pour Noël. Documents à l\'embauche : « lien direct et nécessaire » avec le poste '
     '(C. trav. L1221-6). **Autorisation de conduite** délivrée par l\'employeur (R4323-56).',
     'Le flux **Smoby → Kuehne+Nagel** (aucune source sur un contrat entre eux) et le rattachement de Moirans à l\'agence de '
     'Besançon ; le client **Jouets du Rhône (fictif)** à Corbas ; la navette « Transports Jurassiens (fictif) ».'],
    ['**Kuehne+Nagel**, agence Route de Besançon (École-Valentin). Temps de conduite (règlement CE 561/2006) : 4 h 30 '
     'puis pause de 45 min, 9 h par jour, repos de 11 h. Mentions de la **lettre de voiture nationale** (arrêté du 9/11/1999). '
     'Sécurité au quai (cales, moteur coupé, niveleur…).',
     'Les **photos** : libres de droits, d\'**autres entrepôts**, aucun visage, marques effacées. Aucune n\'est la plateforme '
     'Smoby, et l\'élève le lit sous chaque photo.'],
], [Cm(8.7), Cm(8.7)])
I.p('À savoir : en janvier 2024, Smoby a annoncé une extension de l\'usine d\'Arinthod (surtout du stockage). La scène reste '
    'à Moirans, **d\'après les sources publiques** de 2025-2026.', taille=9.5, couleur=I.GRIS)

I.h2('3. Compétences et savoirs travaillés')
I.p('En 2de GATL, il n\'y a pas de référentiel propre : on travaille les **cinq domaines communs** (D1 à D5) en '
    'piochant dans les trois référentiels de bac pro, **en initiation**. Codes du site : Logistique C1.4, '
    'transport OTM-C2.1, gestion AGO-3.1.')
I.tableau(['Séance', 'Compétences', 'Domaines', 'Spécialité ouverte'], [
    ['ENT-5.1', '**AGO-3.1** Suivi de la carrière du personnel (procédures d\'entrée)', 'D1', 'AGOrA'],
    ['ENT-5.2', '**AGO-3.1** ; **AGO-3.2** Suivi organisationnel (planifier présences et congés)', 'D2, D3', 'AGOrA'],
    ['ENT-5.3', '**C1.2** Règles de sécurité · **C1.5** Mettre en stock les produits (initiation : se repérer, adresse)', 'D4', 'Logistique'],
    ['ENT-5.4', '**C1.2** ; **C1.4** Traiter les opérations de réception (C1.4.2 litige)', 'D4, D5', 'Logistique'],
    ['ENT-5.5', '**C1.5** ; **C1.6** Gérer le suivi des stocks (C1.6.1 flux d\'information des entrées)', 'D4', 'Logistique'],
    ['ENT-5.6', '**C2.1** Répondre à la demande des clients internes et/ou externes', 'D4', 'Logistique'],
    ['ENT-5.7', '**OTM-C2.2** Exécuter la demande (réserver, planifier) ; **OTM-C3.2** temps de conduite (notion)', 'D2', 'OTM'],
    ['ENT-5.8', '**OTM-C2.1** Constituer le dossier transport ; **OTM-C2.3** Suivre l\'opération, communiquer', 'D3, D1', 'OTM'],
], [Cm(1.7), Cm(10.6), Cm(1.9), Cm(3.2)])
I.h3('Savoirs et notions rencontrés')
I.puces([
    '**Emploi** : fiche de poste, CV, CACES et sa validité, CDD / CDI, CDD saisonnier ; pièces qu\'on peut (ou non) demander '
    'à l\'embauche ; EPI ; autorisation de conduite ; planning des présences et des congés, effectif minimum.',
    '**Entrepôt** : quai, niveleur, cale ; zones (réception, stockage, litiges, expédition) ; rack, échelle, lisse, travée, '
    'niveau, emplacement ; **adresse A1-T03-N2-E1** (allée et côté, travée, niveau, emplacement ; niveau 1 = sol).',
    '**Réception** : BL, comptage par couches, faire le tour de la palette, réserve précise, signature, litige.',
    '**Stock** : règles de rangement (type de produit, parcours, rotation, fragile, charge maximale du niveau), entrée en stock '
    'à la quantité **réellement reçue**.',
    '**Préparation** : bon de préparation, picking et réserve, rupture et réapprovisionnement, palette stable (lourds en bas, '
    'fragiles en haut, poids et hauteur), film étirable, étiquettes.',
    '**Transport** : enlèvement, permis CE, semi-remorque / porteur, temps de conduite, pause, repos ; lettre de voiture '
    '(expéditeur, transporteur, destinataire) ; prévenir d\'un retard.',
    '**Communication écrite** : à chaque poste, un message professionnel **par phrases à choisir** (salutation, information, '
    'demande, formule de fin) — le ton est noté.',
])

I.h2('4. La progression')
I.tableau(['Séance', 'Poste', 'Écran principal', 'Temps', 'Jalons', 'État au 04/10'], [
    ['ENT-5.1 Recruter le cariste', 'RH', 'Messagerie, documents joints, fiche à remplir', 'guidage', '9', '**livrée, fermée**'],
    ['ENT-5.2 L\'arrivée de Yanis', 'RH', 'Fiche à remplir + **vue Planning** (personnel)', 'guidage', '14', 'à construire'],
    ['ENT-5.3 La visite', 'Cariste', '**Plan d\'entrepôt**, modes visite (photos)', 'guidage', '11', 'à construire (vue nouvelle)'],
    ['ENT-5.4 Premier déchargement', 'Cariste', 'Étape sécurité + **vue quai** sans froid', 'guidage', '10', 'en construction'],
    ['ENT-5.5 Ranger, saisir l\'entrée', 'Cariste', '**Plan d\'entrepôt** (rangement) + Réceptions, Stock', 'guidage', '9', 'à construire (vue nouvelle)'],
    ['ENT-5.6 La palette de Noël', 'Cariste', '**Plan d\'entrepôt** (préparation)', 'guidage', '9', 'à construire (vue nouvelle)'],
    ['ENT-5.7 Les enlèvements', 'Agent K+N', '**vue Planning** (chauffeurs et camions)', 'guidage', '10', 'à construire'],
    ['ENT-5.8 Lettre de voiture, retard', 'Agent K+N', 'Documents joints, fiche à remplir, messagerie', 'guidage', '8', 'à construire'],
], [Cm(4.3), Cm(1.8), Cm(5.4), Cm(1.5), Cm(1.3), Cm(3.1)])
I.puces([
    '**Tout S1 est au temps du guidage** : aides allumées, erreurs expliquées au bilan. Aucune évaluation dans S1.',
    '**Notation** : chaque séance a ses jalons, ramenés sur 20. **Aucun jalon par inaction** : une case vide ou un message '
    'non envoyé est faux.',
    '**Ce qui passe d\'une séance à l\'autre : l\'histoire, pas les données.** Chaque séance repart d\'un **dossier propre** '
    '(ex. ENT-5.5 commence avec les réserves d\'ENT-5.4 déjà portées, juste). Un élève absent peut donc jouer la séance '
    'suivante sans rattrapage.',
    '**Le passage de relais** : chaque poste finit par un message au poste suivant (Sophie → Bruno → l\'exploitation K+N).',
])

I.h2('5. Prérequis et place dans l\'année')
I.puces([
    '**Avant ENT-5.1**, en classe : le CV et le métier de cariste (l\'élève ne connaît le CACES que de nom : la séance l\'explique).',
    '**Avant ENT-5.7** : avoir vu, même rapidement, qu\'un chauffeur a des temps de conduite limités (la séance donne les trois règles).',
    'Niveau : **début de 2de, initiation pour tous**. Consignes courtes, une consigne par écran, mots cliquables.',
    'Placement : **le plus tôt possible dans l\'année** (décision du 03/10). L\'histoire se passe fin novembre - début '
    'décembre ; la jouer avant la PFMP du **11 janvier** garde la cohérence avec le pic de Noël.',
])

I.h2('6. Gestes de l\'enseignant, pour toutes les séances')
I.puces([
    '**Ouvrir la séance** : chaque séance est livrée **fermée aux élèves** ; tu l\'ouvres dans « Conduite de séance » le jour venu.',
    '**Repérer les élèves confirmés** : S1 sert aussi à ça. Dans le suivi de classe, la colonne « repérage » donne le temps '
    'passé, les aides ouvertes (dont les mots cliquables), les jalons réussis **du premier coup** et les documents ouverts. '
    'L\'élève ne voit rien de tout cela. Tu règles ensuite « standard / confirmé » sur sa fiche.',
    '**Fiche d\'intention et corrigé** : visibles de toi seul (onglet Corrigés, bandeau de la séance).',
    '**Le rouge Smoby** : les boutons, titres et cases choisies prennent le **rouge de la marque**. Ce n\'est pas une erreur : '
    'rien n\'est jugé à l\'écran avant l\'envoi. Le dire en début de première séance.',
    '**Annoncer le cadre** : Smoby et sa plateforme sont réels ; les personnes, les CV et les chiffres sont inventés ; les '
    'photos viennent d\'autres entrepôts.',
])

I.h2('7. Filet de sécurité (toutes séances)')
I.tableau(['Situation', 'Que faire'], [
    ['Internet coupé, site inaccessible', 'Pas de version papier de S1 pour l\'instant (trames courtes à venir). Prévoir l\'activité de repli de la classe.'],
    ['Poste qui plante', 'Le travail est enregistré au fil de l\'eau : l\'élève se reconnecte sur un autre poste et reprend.'],
    ['Élève absent la séance précédente', 'Rien à rattraper : la séance repart d\'un dossier propre. Lui raconter l\'histoire en deux phrases.'],
    ['Élève qui n\'a pas fini', 'Il reprend à la séance suivante (la base est gardée). En ENT-5.2, c\'est prévu : l\'heure est chargée.'],
    ['Élève qui a fini tôt', 'Lui faire relire le bilan et expliquer à l\'oral un jalon faux ; le noter comme indice de « confirmé ».'],
], [Cm(5.0), Cm(12.4)])

# ================================================================== B. PAR SÉANCE
I.saut()
I.partie('B. Séance par séance')
I.p('Pour chaque séance : l\'objectif, le parcours de l\'élève, ce que tu dois savoir ou dire, les pièges voulus et les jalons.')

# ---------------------------------------------------------------- ENT-5.1
I.seance('ENT-5.1', 'Recruter le cariste de Noël', ETATS['ENT-5.1'], nouvelle_page=False)
I.fiche_identite([
    ('Poste de l\'élève', 'Assistant RH, tutrice **Sophie Martin** (assistante RH, fictive)'),
    ('Dans l\'histoire', 'Fin novembre 2026'),
    ('Compétence', 'AGO-3.1 (procédures d\'entrée) · D1 · guidage · 9 jalons · ≈ 45 min de travail'),
    ('Objectif', 'Lire une fiche de poste, comparer cinq CV à trois critères, choisir un candidat **et** un contrat, rendre '
                 'compte par un message professionnel.'),
    ('Supports', 'Tout à l\'écran (pas de trame pour l\'instant ; une trame courte viendra après ta validation). Corrigé calculé '
                 'ENT-5.1.'),
])
I.h3('Parcours de l\'élève')
I.puces([
    '**Messagerie** : message de Sophie « Recrutement du cariste de Noël », avec **6 pièces jointes** : la fiche de poste et les 5 CV.',
    '**Fiche de poste** : cariste, CACES R489 **cat. 3 exigé** (en cours de validité), cat. 5 apprécié, prise de poste le '
    '**mercredi 9 décembre 2026**, **CDD saisonnier** jusqu\'au 8 janvier 2027. Encadré « Le CACES, c\'est quoi ? ».',
    '**Fiche de sélection** (documents à gauche, fiche à droite) : 1. tableau de tri, 5 candidats × 3 colonnes oui / non '
    '(**CACES 3 valide · disponible le 9/12 · accepte un CDD**) ; 2. « Je retiens » + contrat CDD / CDI (encadré « CDD ou CDI ? »). '
    'Envoi refusé tant qu\'une case manque ; la fiche est **figée après l\'envoi**.',
    '**Message déclenché** par l\'envoi de la fiche : Sophie demande « qui tu retiens, pourquoi, quel contrat ».',
    '**Réponse par phrases à choisir** (« Répondre », puis une phrase par ligne ; ordre des choix tiré par élève).',
    '**Message déclenché** par cette réponse : « La direction valide Yanis… » (ne dit pas si c\'était juste) → transition vers ENT-5.2.',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    '**Les informations ne sont jamais au même endroit** d\'un CV à l\'autre : c\'est voulu, le tableau de tri sert à ça.',
    'Le tableau **n\'est pas corrigé ligne par ligne** : tout est jugé à l\'envoi de la fiche ; le bilan dit quelles cases étaient fausses.',
    'Pour répondre à Sophie, il faut **« Répondre » au second message** et choisir les phrases : une réponse tapée librement '
    'ne déclenche pas la suite. Si un élève est bloqué, c\'est presque toujours ça.',
    'L\'élève peut **renvoyer** son message : le dernier envoi compte (il peut se corriger).',
    'Le menu montre aussi Commandes, Stock, Clients… **vides** : sans objet dans une séance RH, dire de les ignorer.',
    'Le CACES de Thomas porte une année sans mois (« 2023 ») : il est **valable** dans tous les cas.',
    'Mots cliquables : CACES, CDD, CDI, saisonnier, cariste, fiche de poste.',
])
I.h3('Pièges voulus (un défaut net par mauvais candidat)')
I.tableau(['Candidat', 'CACES 3 valide', 'Dispo le 9/12', 'Accepte un CDD', 'Ce que l\'élève doit voir'], [
    ['**Yanis Morel**', 'oui (cat. 3 et 5, mai 2024)', 'oui (dès le 30/11)', 'oui', '**le bon candidat**'],
    ['Laura Petit', '**non** (mars 2021)', 'oui', 'oui', 'lire la **date** : périmé depuis mars 2026 (5 ans)'],
    ['Mehdi Benali', '**non** (cat. 1A seulement)', 'oui', 'oui', 'le mot « CACES » ne suffit pas, il faut la catégorie'],
    ['Thomas Girod', 'oui (2023)', '**non** (4 janvier 2027)', 'oui', 'disponible après le pic'],
    ['Sabrina Lopez', 'oui (cat. 3 et 5, 2022)', 'oui', '**non** (CDI seulement)', 'rubrique « ce que je recherche »'],
], [Cm(2.6), Cm(3.6), Cm(2.8), Cm(2.6), Cm(5.8)])
I.p('Dans le message : « car il habite le plus près » (fausse raison), « car il a le CACES » (**incomplète**), « Salut ! », '
    '« Bisous », « Merci de valider vite » (ton).')
I.h3('Jalons (9)')
I.tableau(['#', 'Jalon', 'Faux si…'], [
    ['1-5', 'La ligne de chaque candidat est juste (ses 3 cases)', 'une case fausse ; fiche non envoyée'],
    ['6', 'Yanis retenu', 'autre candidat'],
    ['7', 'CDD choisi', 'CDI (« le besoin est limité au pic de Noël »)'],
    ['8', 'Message : la raison est complète (les trois critères)', 'raison fausse ou incomplète ; message non envoyé'],
    ['9', 'Message : ton professionnel (salutation **et** formule de fin)', 'une des deux familière ; non envoyé'],
], [Cm(1.2), Cm(9.0), Cm(7.2)])

# ---------------------------------------------------------------- ENT-5.2
I.seance('ENT-5.2', 'L\'arrivée de Yanis et le planning de l\'équipe', ETATS['ENT-5.2'])
I.fiche_identite([
    ('Poste de l\'élève', 'Assistant RH, tutrice Sophie Martin'),
    ('Dans l\'histoire', 'Début décembre 2026 (planning des semaines du 7 et du 14 décembre)'),
    ('Compétences', 'AGO-3.1, AGO-3.2 · D2, D3 · guidage · 14 jalons'),
    ('Objectif', 'Préparer l\'arrivée d\'un salarié (ce qu\'on peut lui demander, l\'ordre d\'un premier jour, CACES ≠ '
                 'autorisation de conduite), planifier les présences d\'une équipe, replanifier après un imprévu.'),
    ('Supports', 'À venir : trame courte. Corrigé calculé.'),
])
I.h3('Parcours de l\'élève')
I.puces([
    '**Pièces à demander à Yanis** : 8 pièces, en cocher 4 (identité, n° de sécurité sociale, RIB, copie des CACES).',
    '**Son premier jour, dans l\'ordre** : accueil et contrat → EPI → visite de sécurité avec le chef de quai → **autorisation '
    'de conduite signée par Smoby** → premier déchargement. Encadré « Le CACES ne suffit pas ».',
    '**Planning des présences** (vue Planning) : semaines du 7 et du 14 décembre ; besoin par jour ; au moins un CACES présent '
    'chaque jour ; formation de Mathis et visite médicale d\'Inès imposées ; congés de Chloé, Karim, Léa.',
    '**Imprévu** après le premier envoi : arrêt maladie d\'Inès (lun. 14 - mer. 16) et arrivée de **Noa, intérimaire sans CACES**. '
    'L\'élève replanifie et renvoie.',
    '**Message à Sophie** par phrases à choisir : ce qui a changé, constat, demande de validation.',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    'La règle des pièces : l\'employeur ne demande que ce qui a un **« lien direct et nécessaire »** avec le poste. Au bilan, '
    'une phrase explique chaque pièce (groupe sanguin = donnée de santé ; casier = certains métiers ; autorisation '
    'parentale = salarié mineur, or Yanis est majeur).',
    '**L\'heure est volontairement chargée** : un élève qui n\'a pas fini reprend à la séance suivante (travail gardé). '
    'Finir est un indice de « confirmé ».',
    'Yanis est en **CDD saisonnier** (étiquette « CDD »), Noa est **intérimaire** : première rencontre avec l\'intérim, '
    'sans le détailler (vu plus tard).',
    'Mots cliquables : EPI, autorisation de conduite, RIB, carte Vitale, intérimaire, CDD saisonnier, congé, effectif.',
])
I.h3('Pièges voulus')
I.puces([
    'Cocher le groupe sanguin, le casier judiciaire ou l\'autorisation parentale.',
    'Mettre la remise de l\'autorisation de conduite **avant** la visite des lieux.',
    'Planning : Karim et Léa (les deux CACES) absents le même jour, le mer. 16 ; décaler un congé sans nécessité ; après '
    'l\'imprévu, compter Noa comme un CACES.',
])
I.h3('Jalons (14)')
I.tableau(['#', 'Jalon', 'Remarque'], [
    ['1', 'Les 4 bonnes pièces cochées', ''],
    ['2', 'Aucune pièce de trop', 'compté seulement si au moins une pièce est cochée'],
    ['3', 'Le premier jour dans l\'ordre', ''],
    ['4-8', 'Planning, premier envoi (5 jalons de la vue Planning)', 'rien de vrai avant l\'envoi'],
    ['9-13', 'Planning après l\'imprévu (5 jalons)', ''],
    ['14', 'Message juste (constat + ton)', 'non envoyé = faux'],
], [Cm(1.2), Cm(9.0), Cm(7.2)])

# ---------------------------------------------------------------- ENT-5.3
I.seance('ENT-5.3', 'La visite de la plateforme', ETATS['ENT-5.3'])
I.fiche_identite([
    ('Poste de l\'élève', 'Cariste (Yanis), guidé par **Bruno**, chef de quai (fictif)'),
    ('Dans l\'histoire', 'Mercredi 9 décembre 2026, 8 h → 9 h (premier jour)'),
    ('Compétences', 'C1.2, C1.5 en initiation · D4 · guidage · 11 jalons'),
    ('Objectif', 'Se repérer sur une plateforme (vue du ciel, plan), nommer les éléments d\'un rack, délimiter une travée, '
                 'lire puis retrouver une adresse d\'emplacement.'),
    ('Supports', 'À venir : trame courte. Le vocabulaire et l\'adresse resservent en ENT-5.4 à 5.6.'),
])
I.h3('Parcours de l\'élève (8 étapes, une heure affichée par étape)')
I.puces([
    '**Accueil** sur la vue du ciel.',
    '**Vue du ciel** : 6 points à ouvrir, puis 3 questions où l\'on clique sur la photo (où attendent les camions, par où '
    'passe un piéton, où l\'on charge et décharge).',
    '**Le parcours** sur le plan, avec une photo à chaque arrêt : quai 2 → zone de réception (par le passage piétons) → '
    'allée principale → allée A → zone litiges → bureau du chef de quai.',
    '**Les mots du rack** : 8 mots sur une photo d\'allée.',
    '**Quiz** sur une autre photo sans légende : une échelle, une lisse, une palette filmée, l\'allée.',
    '**La travée** : placer les 4 coins de la travée complète, puis cliquer ses 3 lisses.',
    '**L\'adresse A1-T03-N2-E1** : la décomposer (4 listes, **une seule validation**), puis la retrouver sur le plan et dans '
    'la travée vue de face.',
    '**Fin** : Bruno annonce le premier camion d\'Arinthod cet après-midi.',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    'L\'élève peut **revenir** sur une étape faite, **pas sauter en avant** ; « Suivant » n\'apparaît que l\'étape finie.',
    '**Un clic faux ne fait pas perdre le jalon** : l\'élève recommence. Le repérage trace le « premier coup » et le nombre de '
    'clics pour retrouver l\'emplacement. Exception : la décomposition de l\'adresse se joue en une validation.',
    'La découverte (points du ciel, parcours, mots du rack) **ne donne pas de jalon** : elle débloque la suite.',
    'Toutes les photos sont celles **d\'autres entrepôts** (mention sous chacune). Une photo, la zone litiges, est un dessin. '
    'La photo de la travée a été gardée telle quelle malgré un détail en bas de l\'image : **à commenter en classe** (décision du 04/10).',
    'La lisse du haut d\'une travée **compte même vide**.',
    'Lire une adresse : **allée et côté** (A1 = côté 1 de l\'allée A), **travée** (T03), **niveau** (N2, le sol est N1), '
    '**emplacement** (E1). C\'est l\'outil de toutes les séances cariste suivantes.',
])
I.h3('Jalons (11)')
I.tableau(['#', 'Jalon'], [
    ['1-3', 'Vue du ciel : les 3 questions réussies'],
    ['4-7', 'Quiz : échelle, lisse, palette filmée, allée trouvées'],
    ['8', 'Travée délimitée (4 coins justes)'],
    ['9', 'Les 3 lisses de la travée trouvées'],
    ['10', 'Adresse décomposée (4 parties justes, une seule validation)'],
    ['11', 'Emplacement A1-T03-N2-E1 retrouvé'],
], [Cm(1.2), Cm(16.2)])

# ---------------------------------------------------------------- ENT-5.4
I.seance('ENT-5.4', 'Premier déchargement', ETATS['ENT-5.4'])
I.fiche_identite([
    ('Poste de l\'élève', 'Cariste (Yanis), chef de quai Bruno'),
    ('Dans l\'histoire', 'Mercredi 9 décembre 2026, 14 h, quai 2 : la navette de l\'usine d\'Arinthod, 4 palettes'),
    ('Compétences', 'C1.2, C1.4 (C1.4.2 litige) · D4, D5 · guidage · 10 jalons'),
    ('Objectif', 'Vérifier la sécurité avant de décharger et **refuser de commencer** si un point n\'est pas bon ; contrôler '
                 'une réception (compter, faire le tour, décider) ; écrire une réserve précise.'),
    ('Supports', 'À venir : trame courte. Reprise en 1re avec Picard (ENT-4.x).'),
])
I.h3('Parcours de l\'élève')
I.puces([
    '**Avant de décharger** : une scène en quelques lignes et une photo ; 6 points à dire OK / pas OK (camion calé, moteur '
    'coupé et clés remises, chauffeur hors zone, niveleur, plancher éclairé, EPI). **Les roues ne sont pas calées.** '
    'Deux boutons : « Signaler au chef de quai » / « Commencer à décharger ».',
    '**Déchargement** au chariot frontal dans la vue quai (version **sans froid**, pas de chrono).',
    '**Contrôle** des 4 palettes contre le BL **ARI-26-1209** (aides de guidage allumées).',
    '**Réserves** sur le BL, signature du chauffeur, palettes en zone de réception.',
    '**Message à Bruno** par phrases à choisir : ce qui est reçu, les deux réserves.',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    'La phrase « les roues arrière ne sont pas calées » est écrite **comme les autres**, sans être soulignée : c\'est à l\'élève de la voir.',
    'Si l\'élève décharge sans signaler, **Bruno l\'arrête** ; il peut signaler puis reprendre, mais le jalon 1 reste faux.',
    'Pas de « sous réserve de déballage » : la réserve doit être **précise** (Bruno l\'explique en guidage).',
    'Repère : plus de deux tiers des accidents au quai arrivent **camion à l\'arrêt** (Officiel Prévention) — bonne accroche orale.',
    'Plus tard, l\'étape sécurité passera sur une « image à inspecter » (après Leroy Merlin) sans changer l\'histoire.',
    'Mots cliquables : calé / cale, niveleur, EPI, BL, réserve, chariot frontal.',
])
I.h3('Pièges voulus')
I.tableau(['Palette', 'Produit', 'BL / réel', 'Piège', 'Décision attendue'], [
    ['P1', 'Maison Neo Jura Lodge', '8 / 8', 'aucun', 'Accepter'],
    ['P2', 'Cuisine Tefal', '45 / 45', 'couche du dessus incomplète **mais conforme** (comptage)', 'Accepter'],
    ['P3', 'Établi Black+Decker', '36 / 36', '1 carton écrasé **visible seulement de l\'arrière** (faire le tour)', 'Réserve : 1 carton endommagé'],
    ['P4', 'Porteur Little Smoby', '36 / 34', '2 manquants, dont un dans le coin du fond', 'Réserve : 2 manquants'],
], [Cm(1.3), Cm(3.6), Cm(1.8), Cm(6.3), Cm(4.4)])
I.h3('Jalons (10)')
I.tableau(['#', 'Jalon'], [
    ['1', 'La cale signalée **avant** de décharger'],
    ['2', 'Aucune erreur de constat (faux si rien n\'est coché)'],
    ['3-6', 'Chaque palette comptée et décidée juste'],
    ['7-8', 'Les deux réserves précises (P3 : 1 ; P4 : 2)'],
    ['9', 'BL signé'],
    ['10', 'Message juste (ligne des réserves)'],
], [Cm(1.2), Cm(16.2)])

# ---------------------------------------------------------------- ENT-5.5
I.seance('ENT-5.5', 'Ranger et saisir l\'entrée en stock', ETATS['ENT-5.5'])
I.fiche_identite([
    ('Poste de l\'élève', 'Cariste (Yanis), chef de quai Bruno'),
    ('Dans l\'histoire', 'Mercredi 9 décembre 2026, fin d\'après-midi'),
    ('Compétences', 'C1.5, C1.6 (C1.6.1) · D4 · guidage · 9 jalons'),
    ('Objectif', 'Choisir un emplacement en respectant des règles, isoler une marchandise en litige, saisir l\'entrée à la '
                 'quantité **réellement reçue** (pas celle du BL), vérifier l\'écran Stock.'),
    ('Supports', 'À venir : trame courte.'),
])
I.h3('Parcours de l\'élève')
I.puces([
    '**Ranger sur le plan d\'entrepôt** : « je choisis la travée (vue de dessus), puis l\'emplacement (vue de face, 3 niveaux × '
    '3 emplacements) » ; l\'adresse se construit sous ses yeux. Emplacement occupé refusé tout de suite.',
    '**Les règles** (bouton « Les règles ») : type de produit (côté de sa gamme), parcours (lourd au début, fragile à la fin), '
    'fragile jamais en N3, rotation (A → T01, B → T02, C → T03-T04), charge du niveau ≤ plaque jaune, emplacement libre et en '
    'service ; litige → zone litiges.',
    '**Saisir l\'entrée en stock** (écran Réceptions) : P1 = 8, P2 = 45, **P4 = 34** ; **P3 non saisie** en stock disponible.',
    '**Vérifier le Stock** : « Combien de porteurs Little Smoby maintenant ? »',
    '**Message à l\'exploitation K+N** : la marchandise est en stock, la commande partira **jeudi 10 décembre**.',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    '**Pas de règle « lourd en bas » dans un rack** (décision du 04/10) : chaque palette repose sur sa lisse ; seule compte la '
    '**charge totale du niveau**. « Lourd en bas » vaut quand une charge en écrase une autre : **préparation (ENT-5.6)**, '
    'gerbage. Contraste utile à faire dire aux élèves entre 5.5 et 5.6.',
    'Monter en N2 / N3 demande le **chariot rétractable, donc le CACES 5** : Yanis l\'a (lien avec ENT-5.1).',
    'Certaines palettes ont **une seule** bonne place, d\'autres plusieurs : « l\'élève prend une vraie décision ».',
    'Pas d\'imprévu dans cette séance.',
    'Mots cliquables : emplacement, travée, niveau, charge maximale, litige, chariot rétractable, entrée en stock.',
])
I.h3('Pièges voulus (un seul critère faux chacun)')
I.tableau(['Palette', 'Bonne(s) place(s)', 'Pièges'], [
    ['P1 Maison (420 kg, rotation A, lourd)', '**A1-T01-N1-E3**', 'N2 (poids) ; T02 / T03 (rotation) ; B2-T01 (parcours)'],
    ['P2 Cuisine (270 kg, B, fragile)', '**B2-T02-N1-E2** ou **E3**', 'N2 (poids) ; **N3 (fragile)** ; T01 / T03 (rotation)'],
    ['P3 Établi (1 carton écrasé)', '**L1** ou **L2** (zone litiges)', 'le ranger en stock'],
    ['P4 Porteur (180 kg, C)', 'B1-T03-N3-E1, B1-T04-N1-E2, B1-T04-N3-E2', 'T01 (rotation) ; B1-T04-N2-E3 (hors service)'],
], [Cm(5.0), Cm(5.2), Cm(7.2)])
I.p('À la saisie : **36** pour P4 (la quantité du BL) au lieu de 34 ; saisir P3 en stock.')
I.h3('Jalons (9)')
I.tableau(['#', 'Jalon', 'Remarque'], [
    ['1-4', 'Chaque palette au bon endroit', 'palette non posée = faux'],
    ['5', 'P1 et P2 saisies justes', ''],
    ['6', 'P4 saisie à 34', '36 = faux'],
    ['7', 'P3 non saisie en stock disponible', 'vrai seulement si l\'entrée a été saisie'],
    ['8', 'Lecture juste de l\'écran Stock', ''],
    ['9', 'Message juste', 'non envoyé = faux'],
], [Cm(1.2), Cm(9.0), Cm(7.2)])

# ---------------------------------------------------------------- ENT-5.6
I.seance('ENT-5.6', 'La palette de la commande de Noël', ETATS['ENT-5.6'])
I.fiche_identite([
    ('Poste de l\'élève', 'Cariste (Yanis), chef de quai Bruno'),
    ('Dans l\'histoire', 'Mercredi 9 décembre 2026, vers 17 h 30 ; départ demain 6 h avec l\'enlèvement E1 (quai 1)'),
    ('Compétence', 'C2.1 · D4 · guidage · 9 jalons'),
    ('Objectif', 'Préparer une commande au colis complet : lire un bon de préparation, prélever dans l\'ordre du parcours, '
                 'réapprovisionner un picking en rupture, monter une palette stable, filmer, étiqueter.'),
    ('Supports', 'À venir : trame courte. Prépare C2.2 (optimiser la préparation), travaillée en 1re.'),
])
I.h3('Parcours de l\'élève')
I.puces([
    '**Le bon de préparation** de la commande BP-1210-JDR (Jouets du Rhône, fictif) : 6 lignes dans l\'ordre du **parcours en '
    'serpentin**, dessiné sur le plan ; compteur de mètres.',
    '**Prélever** au niveau N1 (picking). Prélever en N2-N3 (réserve) est refusé.',
    '**La rupture** (ligne 5, Trotteur : 2 cartons au picking, 6 commandés) : « Descente de la réserve », puis choisir la '
    'bonne palette de réserve au-dessus.',
    '**Monter la palette** dans l\'ordre du prélèvement (vue de face, trait « 1,80 m max ») ; « Reposer le dernier » pour corriger.',
    '**Film** (1 à 6 tours) et **étiquettes** (avant, arrière, gauche, droite, dessus), puis « Vérifier ma préparation » : '
    'bilan ligne par ligne et règle par règle ; « Reprendre » pour corriger.',
    '**Fin** : message de Bruno. **Aucun message à rédiger** (l\'heure est pleine).',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    'Ici, **« lourds en bas, fragiles en haut » s\'applique** : sur une palette de commande, les cartons s\'écrasent les uns '
    'les autres. Rappeler le contraste avec le rack d\'ENT-5.5.',
    'C\'est cette palette qui fait passer l\'enlèvement E1 de 32 à **33 palettes** (et à 6 091 kg) : les chiffres d\'ENT-5.8 en viennent.',
    'Les jalons 3 à 9 **ne comptent que si toutes les lignes sont justes** : une palette vide respecterait sinon « lourds en bas ».',
    'Le parcours est jugé **sans marge** (47 m, le meilleur tour en serpentin).',
    'Textes de Bruno proposés par Cowork, à relire à l\'écran.',
])
I.h3('Pièges voulus')
I.puces([
    'Juste au-dessus du picking du Trotteur, en B1-T01-N2-E1, la palette de réserve est un **Porteur** : refusée.',
    'Prélever un fragile trop tôt (rien ne doit venir dessus) ; dépasser 800 kg ou 1,80 m ; trop ou pas assez de film '
    '(3 à 5 tours) ; étiqueter deux côtés voisins au lieu de **deux côtés opposés + dessus**.',
])
I.h3('Jalons (9)')
I.tableau(['#', 'Jalon', 'Remarque'], [
    ['1', 'Les 6 lignes prélevées en quantité juste, aucune hors commande', 'rien prélevé = faux'],
    ['2', 'Rupture réapprovisionnée par une palette Trotteur de réserve', ''],
    ['3', 'Lourds en bas', 'seulement si le jalon 1 est vrai'],
    ['4', 'Fragiles en haut', 'idem'],
    ['5', 'Poids ≤ 800 kg (support compris)', 'idem'],
    ['6', 'Hauteur ≤ 1,80 m', 'idem'],
    ['7', 'Film : 3 à 5 tours', 'idem'],
    ['8', 'Étiquettes : 2 côtés opposés + dessus', 'idem'],
    ['9', 'Parcours ≤ 47 m', 'idem'],
], [Cm(1.2), Cm(9.0), Cm(7.2)])

# ---------------------------------------------------------------- ENT-5.7
I.seance('ENT-5.7', 'Les enlèvements de Noël (Kuehne+Nagel)', ETATS['ENT-5.7'])
I.fiche_identite([
    ('Poste de l\'élève', 'Agent d\'exploitation, agence Kuehne+Nagel Route de Besançon ; le responsable d\'exploitation (sans nom)'),
    ('Dans l\'histoire', 'Jeudi 10 décembre 2026, planning de la journée'),
    ('Compétences', 'OTM-C2.2, OTM-C3.2 (notion) · D2 · guidage · 10 jalons'),
    ('Objectif', 'Planifier une journée d\'exploitation : un chauffeur et un camion par enlèvement, bon permis, bon camion, '
                 'dans la fenêtre du client, en respectant pauses, plafond journalier et repos ; replanifier après une panne.'),
    ('Supports', 'À venir : trame courte.'),
])
I.h3('Parcours de l\'élève')
I.puces([
    '**Message de Bruno** (passage de relais : la commande est prête) puis du responsable d\'exploitation.',
    '**Vue Planning** (05:00-19:00 au quart d\'heure) : chauffeurs Sofiane, Julie, Marc, Nadia ; camions Semi n° 1, Semi n° 2, '
    'Porteur n° 3 ; 5 enlèvements (E1 Lyon, E2 Dijon, E4 Mâcon en semi ; E3, E5 Besançon en porteur) ; 4 cartes « Pause 45 min ».',
    '**Aides de guidage** : fenêtre du client, heure de reprise après le repos, compteur « conduite X / 9 h », problèmes signalés en direct.',
    '**Imprévu** après le premier envoi : le **Semi n° 2 est à l\'atelier jusqu\'à 12:00** → replanifier, renvoyer.',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    'Les trois règles (règlement CE 561/2006) : **4 h 30** de conduite au plus puis **45 min** de pause ; **9 h** par jour ; '
    '**11 h** de repos entre deux journées.',
    '**Simplifications assumées** (à dire si un élève connaît les règles) : une pause ne compte que si une **carte Pause** est '
    'posée ; un trajet compte en entier comme de la conduite ; pas de 10 h deux fois par semaine.',
    'Le site dit **que** c\'est faux, jamais **de combien** : à l\'élève de chercher.',
    'Mots cliquables : enlèvement, permis CE, semi-remorque, porteur, temps de conduite, pause, repos journalier.',
])
I.h3('Pièges voulus')
I.puces([
    '**Marc** n\'a que le permis C : pas de semi-remorque.',
    '**Nadia** a fini à 23 h hier : pas de départ avant 10 h (repos de 11 h).',
    'Enchaîner deux trajets sans pause ; dépasser 9 h de conduite ; un camion sur deux trajets en même temps.',
])
I.h3('Jalons (10 : 5 au premier envoi, 5 après la panne)')
I.tableau(['Jalon (par version)', 'Ce qu\'il vérifie'], [
    ['Affectation', 'un chauffeur et un camion pour chaque enlèvement'],
    ['Chauffeurs', 'un trajet à la fois, bon permis'],
    ['Camions', 'un trajet à la fois, bon type, disponibles'],
    ['Fenêtres', 'chaque enlèvement dans la fenêtre du client'],
    ['Conduite et repos', '4 h 30, 9 h, 11 h'],
], [Cm(5.0), Cm(12.4)])

# ---------------------------------------------------------------- ENT-5.8
I.seance('ENT-5.8', 'La lettre de voiture et le retard', ETATS['ENT-5.8'])
I.fiche_identite([
    ('Poste de l\'élève', 'Agent d\'exploitation, K+N Besançon ; chauffeuse **Julie** (fictive), Semi n° 1'),
    ('Dans l\'histoire', 'Jeudi 10 décembre 2026 : départ d\'E1 à 6 h de Moirans, retard annoncé à 8 h 30'),
    ('Compétences', 'OTM-C2.1, OTM-C2.3 · D3, D1 · guidage · 8 jalons'),
    ('Objectif', 'Constituer un document de transport à partir de plusieurs documents ; réagir à un incident : calculer la '
                 'nouvelle heure d\'arrivée, prévenir le client et l\'expéditeur.'),
    ('Supports', 'À venir : trame courte. « Contrôler une lettre remplie avec erreurs » est gardé pour S2.'),
])
I.h3('Parcours de l\'élève')
I.puces([
    '**Trois documents** : l\'ordre d\'enlèvement Smoby (OE-26-1210-01 : 33 palettes Europe, **6 091 kg**), la fiche du client '
    '(Jouets du Rhône, Corbas, **livraison avant 12:00**, quai 4), l\'extrait du planning (Julie, Semi n° 1, départ 06:00, 4 h de conduite).',
    '**Remplir la lettre de voiture nationale** : expéditeur, destinataire, transporteur, lieux et dates de chargement et de '
    'livraison, nature de la marchandise, nombre de palettes, poids, chauffeur, véhicule. Envoi une fois.',
    '**Le retard** (message de Julie, 8 h 30) : accident sur l\'A40, 1 h de retard. Nouvelle heure d\'arrivée (**11:00**) ? '
    'Encore avant l\'heure limite ? (oui)',
    '**Deux messages** par phrases à choisir : au client, puis à Smoby (l\'expéditeur).',
], numeros=True)
I.h3('Ce que tu dois savoir ou dire')
I.puces([
    'Les trois rôles à faire dire : **expéditeur** (Smoby, qui remet la marchandise), **transporteur** (K+N), **destinataire** '
    '(Jouets du Rhône). La lettre est signée par l\'expéditeur et le transporteur au départ, par le destinataire à la livraison.',
    'Simplification assumée : le temps arrêté, **moteur coupé**, ne compte pas comme de la conduite (Julie reste à 4 h).',
    'Le poids **6 091 kg** = 32 palettes × 180 kg + la palette mixte d\'ENT-5.6 (331 kg).',
    'Le planning d\'ENT-5.7 est **fourni juste** (dossier propre).',
    'Les documents portent « Document pédagogique, reconstitution, non contractuel ». Pas de logo K+N.',
    'Mots cliquables : lettre de voiture, expéditeur, destinataire, transporteur, ordre d\'enlèvement, palette Europe.',
])
I.h3('Pièges voulus')
I.puces([
    'Inverser expéditeur et destinataire ; mettre Smoby comme transporteur ; Corbas comme lieu de chargement.',
    'Message au client : « 10 h 00 » ou « 12 h 30 » au lieu de 11 h 00.',
])
I.h3('Jalons (8)')
I.tableau(['#', 'Jalon'], [
    ['1', 'Expéditeur et destinataire justes'],
    ['2', 'Transporteur, chauffeur et véhicule justes'],
    ['3', 'Lieux et dates de chargement et de livraison justes'],
    ['4', 'Marchandise juste (nature, 33 palettes, 6 091 kg)'],
    ['5', 'Lettre envoyée complète (aucune case vide)'],
    ['6', 'Nouvelle heure juste (11:00)'],
    ['7', 'Message au client juste'],
    ['8', 'Message à Smoby juste'],
], [Cm(1.2), Cm(16.2)])

I.finir('smoby')
