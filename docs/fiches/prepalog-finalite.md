> *Copie de la fiche `claude/prepalog-finalite.md` du projet Claude PREPALOG, **mise à jour le
> 02/10/2026 au soir**. Source de conception : le projet. Voir `docs/LISEZMOI.md`. Les renvois à
> d'autres fiches `claude/…` pointent vers des fiches restées dans le projet, sauf celles recopiées
> dans ce dossier. Le commit et le push sont désormais faits par Claude Code.*

# Prepalog — finalité du projet (cadrage du 02/10/2026, décisions 13 à 15 ajoutées le 03/10/2026)

**Boussole de toutes les sessions.** Cette fiche passe avant les autres en cas de contradiction.
Les décisions ci-dessous sont celles de Tristan ; les « conséquences » sont des déductions à
lui faire valider si elles posent problème.

## Ce qu'est Prepalog, en une phrase

Le site qui fait travailler aux élèves de Bac Pro Logistique et de CAP OL **la totalité des
compétences de leur référentiel qui ne demandent pas de manipulation physique**, niveau par
niveau, dans des environnements numériques d'**entreprises réelles** (Simulog), avec un suivi
de classe et des **notes par compétence** qui comptent.

## Les décisions (Tristan, 02/10/2026, confirmées)

1. **La note porte sur une compétence** (c'est ce que demande l'Éducation nationale), et son
   **coefficient dépend du temps pédagogique** :
   - **guidage et entraînement** (dont l'erreur induite) = **évaluation formative,
     coefficient 1** ;
   - **évaluation** = **évaluation sommative, coefficient 3**, note au bulletin.
   - **Les coefficients doivent être modifiables par l'enseignant** depuis le site, sans
     toucher au code.
2. **Export élève × compétence.** Tristan doit pouvoir **extraire un tableau** : pour chaque
   élève, chaque compétence, **les scénarios associés** (séances qui l'ont travaillée) et
   **les notes** (note de chaque séance + moyenne pondérée de la compétence).
3. **Les trois temps sont obligatoires pour tous les travaux à venir** : guidage →
   entraînement (± erreur induite) → évaluation, chacun dans une séance distincte
   (`prepalog-progression-pedagogique.md`). Ne jamais écrire une compétence en une seule séance.
4. **Public : Tristan et l'équipe du lycée pour l'instant.** Une diffusion plus large est
   possible un jour : ne rien fermer qui l'empêcherait, mais ne pas concevoir pour elle.
5. **Périmètre : tout le référentiel, par niveau et par classe**, hors compétences qui
   demandent une vraie manipulation (bloc 4, conduite d'engins, en premier lieu).
   **Objectif : environ 15 entreprises par niveau** dans Simulog, qui portent à elles toutes
   l'ensemble des compétences travaillées.
6. **Niveaux : 2de, 1re et Terminale Bac Pro, plus le CAP OL** (Opérateur/Opératrice
   logistique), qui a **son propre référentiel**, à relever avant d'y écrire une séance.
7. **Ce sont les compétences travaillées qui déterminent le niveau.** La logique de
   construction est **entreprise × compétence × niveau**.
8. **On travaille ce que l'entreprise fait réellement.** On part du métier réel de
   l'entreprise et on y travaille les compétences qui s'y prêtent, pas l'inverse. **L'ancrage
   sur le réel est un point clé de la pédagogie : on limite le recours au fictif.** Vérifier
   par recherche ce que fait l'entreprise **avant** d'écrire (fait pour Boost ; restent à
   vérifier chez Boost le périssable et les camions).
9. **Une même entreprise sert plusieurs niveaux**, avec des missions plus difficiles.
10. **Ordre de marche : cadrage fait (Prepalog, Spartoo). Chantier « notes par compétence »
    FAIT le 02/10** (ci-dessous, B, et `prepalog-notes-competences.md`). **ENT-3.2 écrite le
    02/10 (cachée, à valider à l'écran) ; restent ENT-3.3 et 3.4**, chaque séance déclarée
    d'emblée avec `competences` et `temps`. Cdiscount (ENT-2.1 à 2.3) est en place.
11. **Prepalog et Simulog ne se mélangent pas** (Tristan, 02/10) :
    - **Prepalog** est la plateforme d'entrée. Elle porte les **entraînements sans logique de
      scénario** (tableur, quiz de notions), le **magasin pédagogique** et l'**organisation des
      activités** (groupes, suivi, compétences, conduite de séance).
    - **Simulog** est le module qui **simule des scénarios à travers des entreprises** ; il
      fonctionne **toujours** dans une logique de scénario.
    - But : ne pas tout mélanger et ne pas faire de l'outil une usine à gaz. Avant d'ajouter
      quelque chose, se demander de quel côté il va.
12. **Le module SCE (rubrique « Scénario », SCE-1 à SCE-5) regroupe d'anciens travaux de
    Tristan** et **sera supprimé à terme pour être inclus dans Simulog.** Ne pas l'enrichir. Au
    moment de la migration : reprendre `competences` et `temps` de chaque SCE dans la séance
    Simulog qui le remplace, sinon ses notes sortent du tableau par compétence (les scores
    restent dans la base, mais une séance retirée du registre n'est plus lue).
13. **Des expériences ludiques et innovantes** (Tristan, 03/10/2026). Si une compétence peut être
    abordée sous un nouvel angle grâce à de nouvelles vues, **on prend le temps de les insérer dans le
    moteur.** Nuance la conséquence C : la nouveauté pédagogique justifie un chantier moteur ; on garde
    les garde-fous (durée annoncée, un seul chantier moteur à la fois, vue pensée pour être réutilisée).
14. **Le temps face aux élèves n'est pas une contrainte de conception** (Tristan, 03/10/2026, règle
    valable pour tout Prepalog) : *« chaque année je n'ai pas le même volume horaire selon les niveaux,
    je veux donc disposer d'assez de contenu quel que soit mon volume de l'année. »*
    - on ne réduit jamais un contenu pour le faire tenir dans un horaire ;
    - Prepalog est un **réservoir** : **plus de contenu qu'une année n'en consomme**, à chaque niveau ;
      Tristan choisit ce qu'il ouvre (Conduite de séance) ;
    - chaque séance se range en **cœur** (parcours minimal qui couvre toutes les compétences du niveau
      avec leurs trois temps) ou **complément** (variantes, lots supplémentaires, entreprises en plus,
      reprises d'entraînement). **Validé** ; marquage dans le `meta` à concevoir (chantier moteur).
15. **La 2de GATL pioche dans trois référentiels** (Logistique 2025, OTM 2020, AGOrA 2020) avec des
    scénarios transversaux ; chaque élève fait les trois postes ; note par spécialité (accord de
    principe). Codes `OTM-…` et `AGO-…` (Tristan, 03/10/2026).

## Spartoo, l'exception assumée

Spartoo (`ENT-1.1` à `1.3`) est le **premier travail** : **on le laisse tel quel.** Il ne suit
pas les trois temps (une séance par compétence), il est noté en avancement (jalons) et non
vérifié sur l'activité réelle de l'entreprise. Il sert à Tristan de **point de comparaison
pour voir ce qu'il faut améliorer**. **Ne pas le prendre pour modèle** des prochains
environnements : le modèle, c'est Boost.

Seule retouche prévue : déclarer la compétence et le temps de ses trois séances — **faite le
02/10** (C1.4, C2.2, C3.2, toutes en guidage). Rien d'autre n'y change.

## TechPro Distribution : abandonné

Décision du 02/10/2026. Entreprise fictive, contraire à la règle 8. Les mentions « migrer
TechPro, `ENT-2.x` » dans `logisim.md`, `reprise-spartoo-2-tracabilite.md`,
`prepalog-nomenclature.md` et `prepalog-ou-on-en-est.md` sont **caduques**. Le numéro `ENT-2`
est libre (ne pas renuméroter Boost pour autant : un changement de `code` déplace les
étiquettes partout). *(Depuis, `ENT-2.x` a été attribué à Cdiscount.)*

## État technique

Le site tourne **en mode réel depuis le 30/09/2026** (Firebase `prepalog-e592d`). La fiche
`prepalog-architecture.md` dit encore « mode démonstration » : elle est périmée sur ce point,
`prepalog-firebase.md` fait foi.

## Conséquences à garder en tête

**A. Une note de bulletin, des corrigés lisibles dans le navigateur.** L'autocorrection
reste côté navigateur (pas de Cloud Functions sur le plan gratuit). Une évaluation
sommative se passe donc **en classe, sous surveillance**, et sur **un jeu de données neuf**.

**B. Le chantier « notes par compétence » — LIVRÉ le 02/10.** Détail, déclarations validées et
tests : `prepalog-notes-competences.md`. En bref : `core/competences.js` (libellés, temps,
coefficients par défaut, moyenne pondérée), onglet **« Compétences »** dans l'espace
enseignant (coefficients du groupe rangés dans `groupes/{gid}.coefs`, sans changement de
règles Firestore), **export CSV élève × compétence**. Règles tranchées par Tristan le 02/10 :
- **les séances en jalons (`notation: 'avancement'`, Spartoo) entrent dans la moyenne**,
  converties sur 20 (3 jalons sur 3 = 20/20), au coefficient de leur temps ;
- **une séance qui travaille deux compétences compte pour les deux** : la même note entre
  dans la moyenne de chacune.

Le suivi de classe et l'export par séance gardent leur affichage (« 3 / 3 » pour les jalons).
La conversion sur 20 ne vaut **que** dans la vue et l'export par compétence.

**C. L'ordre de grandeur.** 16 compétences dans les blocs 1 à 3 du Bac Pro, une compétence =
3 ou 4 séances, environ 15 entreprises par niveau sur quatre niveaux : **plusieurs centaines de
séances**. ENT-3.1 a pris environ quatre jours, surtout pour **construire le moteur** (carte
cliquable, feuille de calcul, jauges). L'objectif ne tient que si :
- **une séance nouvelle se fabrique avec les vues existantes**, en déclarant du contenu ;
- **une vue nouvelle du moteur est un investissement rare**, décidé en sachant combien de
  séances elle servira ;
- les tests restent proportionnés (consigne du 04/10 sur les tests qui valent leur prix).

**D. Le choix des entreprises décide de la couverture.** Certaines compétences exigent un
profil précis : C2.3 (logistique industrielle) un industriel, C2.5 (retour des supports de
charge et contenants) un acteur qui gère palettes ou bacs consignés, C2.6 (expédition par un
transporteur externe) un chargeur qui sous-traite. **Tenir une carte de couverture**
(entreprise × compétence × niveau) et choisir les prochaines entreprises pour combler les
trous, plutôt que forcer une compétence dans une entreprise qui ne la pratique pas.

**E. Le réel a des limites.** Les données internes (stocks, clients, volumes) ne sont pas
publiques : elles restent **reconstituées et vraisemblables**, dans le cadre de
`prepalog-entreprises-reelles.md`. Le réel porte le **métier, les lieux, les produits et les
contraintes** ; le fictif se limite aux chiffres qu'on ne peut pas connaître.

**F. Une entreprise sur plusieurs niveaux.** Son état doit être **cloisonné par niveau et par
séance** (alerte n° 16), et sa numérotation doit laisser de la place aux missions de niveau
supérieur.

**G. Une équipe d'enseignants.** L'amorçage d'un collègue doit rester faisable (procédure
dans `prepalog-firebase.md`, alerte n° 2), et chaque prof ne voit que ses groupes.

## Ce qui reste à cadrer

- La **carte de couverture** : quelle entreprise porte quelle compétence, à quel niveau.
  L'onglet « Compétences » en donne déjà l'état réel (tableau « Les séances de chaque
  compétence »).
- Le **référentiel du CAP OL** : à relever (source officielle) dans une fiche à part.
