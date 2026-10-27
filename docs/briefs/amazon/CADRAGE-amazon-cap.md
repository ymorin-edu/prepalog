# Amazon — le centre robotisé de Brétigny-sur-Orge (CAP OL) : cadrage et compte rendu

**Statut : livré le 27/10/2026** (fil cloud « prochains blocs »). Construit par Claude seul, sans brief Cowork, sur le choix de Tristan du 27/10/2026
(« Les quatre, dans l'ordre » : Amazon CAP d'abord) et sa délégation du 26/10/2026 (poids des jalons et questions au fil décidés par Claude).
Aucune vue nouvelle : documents joints, fiches (menus, nombres, cases, ordre), carte de France (vue « Localiser »), réponse par phrases, questions au
fil. Les dix séances sont livrées `pret: true, ouverture: 'prof'` : à essayer à l'écran, puis à ouvrir au groupe dans « Conduite de séance ».

## 1. La situation

L'élève est **stagiaire** au centre de distribution de **Brétigny-sur-Orge** (Essonne), où **la marchandise vient au salarié** : des robots apportent
les armoires mobiles devant le poste. Karima (manageuse de zone, tutrice), Théo (le « problem solver ») et Inès (l'emballage) sont construits et
tutoient l'élève. Une consigne par écran : chaque fiche s'ouvre par un message de Karima après l'envoi de la précédente (fabrique générique
`contenus/fabrique-fiches.js`, réutilisable pour Leroy Merlin et Lidl).

## 2. Vérifié / construit

- **Vérifié (recherche web)** : Brétigny, 70 000 m² sur trois niveaux, environ 4 500 salariés, environ 4 000 robots et 40 000 armoires mobiles,
  500 000 colis par jour en moyenne (reportage « Les coulisses de la conso », Clubic, 10/07/2025) ; à Brétigny, l'emplacement où le salarié pose
  l'article devient son adresse et un même produit est éclaté sur plusieurs cases (stockage aléatoire) ; au prélèvement, la case et la photo sont
  montrées, le salarié confirme au bouton ; à l'emballage, le système désigne le carton ; un colis au mauvais poids sort de la ligne
  (recherche du 10/10/2026, `knowledge/claude/prepalog-amazon-recherche.md`). Premier centre français à Saran en 2007 ; dixième à Beauvais, inauguré
  le 09/10/2026 (KultureGeek). Pic de fin d'année 2026 : 9 500 saisonniers, 40 sites, 2 700 dans les Hauts-de-France (Économie Matin, 01/10/2026).
  Retard toléré de 30 minutes pour un camion (procédure publique d'Amazon pour les transporteurs). Sanction de la CNIL contre Amazon France
  Logistique, 32 millions d'euros, fin 2023, pour un suivi trop intrusif de l'activité des salariés par leur scanner (presse, janvier 2024).
  Droit (résumé) : Code du travail L4121-1 et L4122-1.
- **Construit** : les armoires, leurs cases et leurs « places », les trois règles de rangement du poste (la place, jamais deux articles qui se
  ressemblent, plus de 5 kg en bas), les articles (aucun nom de marque), l'écran du poste, le planigramme et les vendeurs, les commandes, les cartons
  et leurs dimensions, la tolérance de pesée (50 g), les situations de sécurité, l'équipe et les prénoms. Le 4e fait d'ENT-19.9 (le prix du carton).
  Positions de la carte : centre des communes, approchées.
- **Logo** : le logo officiel (SVG Wikimedia Commons, `contenus/trames/logos/SOURCES-logos-19-21.txt`). **Charte** : le bleu nuit d'amazon.fr
  (`#232f3e`) ; l'orange `#ff9900` n'est pas repris (contraste insuffisant sur le papier).

## 3. Les séances

| Code | Temps | Compétences CAP | Ce que l'élève fait |
|---|---|---|---|
| ENT-19.1 « bienvenue à Brétigny » | guidage (réinitialisable) | C1.1 | qui fait quoi, trois centres sur la carte (Brétigny, Saran, Beauvais), le voyage d'un article, ce que font les robots |
| ENT-19.2 « prendre mon poste » | guidage | C1.2 | quatre situations de sécurité, l'écran du poste, le planigramme (quai, palettes, camion en retard), compte rendu de prise de poste |
| ENT-19.3 « ranger dans l'armoire » | guidage | C1.5 | ranger 5 articles selon les trois règles, les gestes dans l'ordre, l'adresse de deux articles (d'après SES cases) |
| ENT-19.4 « le bac du mardi » | entraînement | C1.5 | 6 articles dont un abîmé (la ligne « de côté » est offerte à tous), inventaire d'un article éclaté sur trois cases (6 pour 7), une adresse |
| ENT-19.5 « évaluation : mettre en stock » | évaluation (copie, jeu tiré par élève) | C1.5 | 2 situations de sécurité, 5 articles dont un abîmé, un inventaire (manque, juste ou trop selon le jeu), une adresse |
| ENT-19.6 « prélever pour les commandes » | guidage | C3.1, C3.2 | 4 lignes : prendre, ou signaler (article qui n'est pas celui de la photo, case vide) ; le bac de chaque commande ; les gestes |
| ENT-19.7 « emballer les commandes » | guidage | C3.3, C3.7 | le plus petit carton, caler la tasse, deux pesées (une sort de la ligne), les écogestes |
| ENT-19.8 « la commande du jeudi » | entraînement | C3.1, C3.2, C3.3 | 5 lignes (mauvaise taille, abîmé, case vide), 3 commandes dont une à deux articles, une cafetière à caler, une pesée |
| ENT-19.9 « les robots et moi » | guidage | C1.1, C3.6 | quatre faits et leur conséquence, deux calculs (6 800 ; 237,5), ce que les robots changent au poste ; réflexion CNIL |
| ENT-19.10 « évaluation : prélever et emballer » | évaluation (copie, jeu tiré par élève) | C3.1, C3.2, C3.3 | 4 lignes, 3 commandes, 2 pesées |

Parcours chaîné (`precedente`) de 19.1 à 19.9, les évaluations hors chaîne (ouvertes par l'enseignant). Les jeux des évaluations dépendent de
l'identifiant de l'élève (`db.tirage.graine`) : trois jeux chacun, tous atteints sur 300 graines (bloc de tests).

**Trois temps** : C1.5 (19.3 → 19.4 → 19.5) et C3.1 à C3.3 (19.6/19.7 → 19.8 → 19.10) ont leurs trois temps. **C1.2** n'a qu'un guidage : elle
n'est **pas** déclarée dans l'évaluation 19.5 (les deux situations de sécurité y comptent pour la note de C1.5 seule). **C1.1, C3.6 et C3.7** n'ont
qu'un guidage : à reprendre dans un autre bloc CAP (entraînement et évaluation).

## 4. Les poids (décidés par Claude, délégation de Tristan)

Écrits en tête de chaque fichier `contenus/amazon-ent19x.js`. En résumé : la forme (salutation, fin du compte rendu) ne compte pas ; le compte rendu
pèse 3 ou 4 ; les questions au fil 4 (trois notées, une réflexion libre) ; en évaluation, « Avant de commencer » noté 3 et une réflexion libre.

## 5. Ce qui reste à faire / à regarder

- Pas de trame Word ni de diaporama : tout se fait à l'écran (Cowork peut en faire si Tristan le veut).
- Corrigés : générés depuis les jalons (`corrige` de la fabrique), un par élève pour les évaluations.
- Un essai à l'écran par Tristan avant d'ouvrir à un groupe.
