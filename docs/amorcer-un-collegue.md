# Ajouter un collègue enseignant — la procédure en une page

*Chantier 11, lot 11a (09/10/2026). Rien à publier dans les règles pour cette procédure : elle s'appuie sur les règles actuelles.*

Un collègue peut avoir deux rôles, et **ce n'est pas la même chose** :

- **Co-enseignant de tes groupes** : il voit tes élèves, le suivi, la conduite de séance de *ton* groupe. Il n'a besoin que des étapes 1, 2, 3 et 5.
- **Enseignant qui a ses propres groupes** (il crée « sa » 1L1) : même chose **plus l'étape 4**.

## Les cinq étapes

1. **Lui** ouvre le site, clique « Connexion enseignant » et choisit son compte Google. Le site répond *« Ce compte n'est pas encore autorisé »* : c'est normal et voulu. Son compte existe maintenant côté Firebase.
2. **Toi**, console Firebase → **Authentication** → **Utilisateurs** : copie son **UID** (la longue suite de lettres et de chiffres).
3. **Toi**, console Firebase → **Firestore** → collection `users` → *Ajouter un document* dont l'**identifiant** est son UID, avec les champs :
   `role` = `prof` · `nom` · `prenom` · `email` (son adresse Google, **en minuscules**) · `groupes` = tableau vide.
4. **Toi, seulement s'il doit créer ses propres groupes** : console Firebase → **Realtime Database** → nœud `profsGlobaux` → ajoute une clé égale à son UID, valeur `true`. *(Un simple co-enseignant n'en a pas besoin : c'est toi qui écris son accès au groupe.)*
5. **Lui** se reconnecte : il arrive dans l'espace enseignant, avec ses groupes (aucun au début).

## L'ajouter à ton groupe

Espace enseignant → **Groupes** → active ton groupe → panneau **« Enseignants de … »** → tape son adresse → **Ajouter un collègue**. Seul le **responsable** du groupe (celui qui l'a créé, toujours le premier de la liste) ajoute et retire.

- *« Aucun enseignant avec cette adresse »* : l'adresse est mal tapée, ou son profil (étape 3) n'a pas de champ `email` et il ne s'est pas encore reconnecté depuis. Le site écrit l'adresse dans le profil de chaque enseignant à sa connexion.
- *« … est dans le groupe, mais ses droits sur les bases partagées n'ont pas pu être écrits »* : l'ajout se fait en deux écritures (le groupe, puis les droits sur les bases partagées). Si la seconde échoue, clique **Reconstruire l'accès** sur la ligne du groupe : le collègue est déjà dans le groupe, ce bouton rétablit seulement ses droits.
- S'il a créé un groupe **avant** l'étape 4, ce groupe existe sans droits sur les bases partagées : après l'étape 4, **Reconstruire l'accès** sur ce groupe.

## Retirer un collègue, ou le laisser partir

- **Toi** (responsable) : bouton **Retirer** à côté de son nom. **Lui** : bouton **Quitter** (dans la liste des groupes ou dans le panneau).
- Rien n'est effacé. **Restent** dans le groupe : les élèves qu'il y a créés (tu peux les supprimer, tu es responsable) et ses écritures dans les bases partagées. Le message le dit à l'écran.
- Un groupe quitté ne se supprime pas : seul le responsable supprime un groupe. Un collègue ne supprime que les élèves qu'il a créés ; pour les autres, le bouton est **« Retirer du groupe »** (l'élève ne disparaît pas, il retourne dans « Élèves sans groupe » chez celui qui l'a créé).

## Si le responsable d'un groupe part

Le responsable est le premier de la liste `profs` du groupe, et rien dans le site ne le change. Pour en nommer un autre : console Firestore → `groupes` → le groupe → champ `profs` : remets l'UID du nouveau responsable **en premier** de la liste (garde les autres). Le miroir des bases partagées n'a pas à bouger : il liste les mêmes personnes.

## Pour mémoire

- Deux enseignants qui créent chacun « 1L1 » ont chacun le leur : le second reçoit en interne un identifiant suffixé (`1l1-ab12cd`), mais les deux s'affichent « 1L1 ». Dans la liste, un groupe qui n'est pas le tien porte « groupe de *Prénom Nom* ».
- Les élèves « sans groupe » sont rangés par auteur : chacun voit ceux qu'il a créés, et ceux qui n'ont pas d'auteur (créés à la console, étiquetés « créé hors du site »).
- Deux comptes élèves ne peuvent pas avoir le même matricule sur tout le site : le second reçoit *« Ce matricule est déjà utilisé »*.
- Les règles de sécurité ne sont pas encore resserrées entre enseignants (lot 11b) : l'équipe est de confiance, c'est le site qui protège de l'erreur.
