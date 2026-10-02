> *Copie du 02/10/2026 de la fiche `claude/prepalog-progression-pedagogique.md` du projet Claude
> PREPALOG (source de conception : le projet). Voir `docs/LISEZMOI.md`.*

# Prepalog — la progression pédagogique des scénarios Logisim (02/10/2026)

**Doctrine énoncée par Tristan le 02/10, à appliquer à tous les environnements Logisim**, pas
seulement à Boost. Elle décide du découpage en séances, du mode de notation et de ce qu'on rend
à l'élève pendant l'exercice. **Ne pas la rediscuter ; s'y conformer en écrivant un scénario.**

> *« Cela doit dépendre de l'objectif du scénario et des prérequis. Si on aborde des notions
> nouvelles il faut commencer par un guidage, l'élève apprend. Une fois qu'il valide
> l'apprentissage l'élève doit s'entraîner (soit il réussit soit il se trompe). L'erreur doit lui
> permettre d'apprendre. On pourrait même créer des scénarios où on induit l'élève en erreur,
> qu'on le fasse analyser l'erreur puis la traiter. Enfin le dernier scénario doit avoir une
> vocation évaluative, on vérifie que l'élève a acquis et compris. On peut lui attribuer une note
> utilisable dans son bulletin. »*

## Les trois temps

Ce sont **trois séances distinctes**, pas trois parties d'une séance.

| Temps | Rôle | Ce que l'élève vit | Notation |
|---|---|---|---|
| **1. Guidage** | la notion est **nouvelle** | il est accompagné, l'erreur est rattrapée tout de suite, les cases se corrigent | jalons de progression **+ note sur 20 indicative** |
| **2. Entraînement** | la notion est acquise, le geste ne l'est pas | il fait seul, il réussit ou il se trompe, **l'erreur est le moment où il apprend** | jalons + note sur 20 |
| **3. Évaluation** | on vérifie l'acquis | pas de correction immédiate, un jeu de données neuf | **note sur 20 au bulletin** |

Une **variante du temps 2**, demandée explicitement par Tristan : **l'erreur induite**. On livre à
l'élève un travail **déjà fait et faux** ; il doit trouver *pourquoi* ça ne tient pas, puis le
réparer. C'est un type de séance à part entière, à prévoir dans chaque environnement où le moteur
le permet.

## Deux temps dans une séance ≠ deux séances

Question posée à Tristan sur ENT-3.1, et tranchée : **les deux temps d'un même travail restent
dans une seule séance.** Repérer les clients sur un plan puis ordonner la tournée, ce ne sont pas
deux étapes d'apprentissage — c'est le même geste professionnel en deux moments, et on ne peut pas
faire le second sans le premier. Une note, un document, un enchaînement naturel.

**Le critère de découpage est l'apprentissage, pas la tâche.** On ouvre une séance nouvelle quand
on change de temps pédagogique (guidage → entraînement → évaluation), pas quand on change d'écran.

## La note : tranchée le 02/10

> *« Les élèves sont motivés par les notes, je peux l'utiliser avec un petit coefficient pour
> récompenser leur implication. »*

Donc **même une séance de guidage produit une note sur 20**, enregistrée et visible. Ce n'est pas
une note de bulletin au même titre qu'une évaluation : c'est Tristan qui décide du coefficient.
Conséquence pour l'écriture : **ne pas écrire une séance de guidage en `notation: 'avancement'`
seul.** Il faut les jalons **et** le score ramené sur 20 par `core/notes.js`.

**Point à vérifier dans le moteur avant d'écrire** : qu'un environnement puisse porter en même
temps des jalons de progression et une note sur 20. Si le code ne le permet pas aujourd'hui, c'est
un petit ajout à faire, et à dire à Tristan.

## Ce que ça implique pour un environnement

Une compétence du référentiel ne tient plus en une séance. Elle en prend **trois ou quatre** :
guidage, entraînement, éventuellement erreur induite, évaluation. Le contenu est bon marché — les
vues du noyau sont génériques et l'état est cloisonné par séance — mais **le découpage doit être
posé avant d'écrire la première séance**, sinon la numérotation bouge après coup et les étiquettes
se déplacent partout (y compris dans des exports CSV déjà imprimés).

**Appliqué pour la première fois à Boost / C2.4**, voir `claude/prepalog-boost-c24-c26.md`
(fiche restée dans le projet).
