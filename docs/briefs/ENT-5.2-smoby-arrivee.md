# Brief de séance — ENT-5.2 Smoby, préparer l'arrivée de Yanis et planifier l'équipe (2de, poste A — assistant RH, guidage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.2-smoby-arrivee.md (il faut que la vue Planning et les lots 1, 2, 3 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter — la vue Planning est livrée (cas « personnel » dans `contenus/planning-essai.js`). **Vérifié le
05/10/2026 (§7)** : la fiche à remplir (`core/types/fiche.js`) n'a pas encore les blocs `cases` (liste à cocher) et `ordre`
(remise en ordre) ; **décision de Tristan : les construire d'abord** (lot 4 de `MOTEUR-documents-formulaire.md`, ces deux
blocs seulement), puis la séance.
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (section « Séance A2 ») ;
maquette `docs/briefs/planning/` (cas « personnel », v8 validée).
**Modèle** : Opus.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.2 |
| `id` | `smoby-arrivee` |
| Titre / desc | « Smoby — l'arrivée de Yanis » / « Assistant RH : préparer l'arrivée du cariste recruté (pièces à demander, programme du premier jour), puis planifier les présences et les congés de l'équipe avant le pic, et replanifier après un imprévu. » |
| Rubrique | simulog, entreprise n° 5 Smoby |
| Niveau(x) | 2de |
| Compétence(s) | **AGO-3.1** (procédures d'entrée), **AGO-3.2** (planifier présences et congés) ; domaines D2, D3 |
| Temps pédagogique | guidage ; `parcours: 'coeur'` |
| Notation | jalons + note sur 20 |
| Barème | 14 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : documents à l'embauche — l'employeur ne demande que ce qui a un **« lien direct et nécessaire »** avec le
  poste (Code du travail, art. L1221-6) : pièce d'identité, numéro de sécurité sociale (obligatoire pour la déclaration
  d'embauche), RIB ; diplômes ou **CACES** pour un poste de conduite ; **extrait de casier judiciaire réservé à certains
  métiers** (sécurité, petite enfance) ; **autorisation parentale si le salarié est mineur** (HelloWork). **Autorisation de
  conduite** : délivrée par l'**employeur** après formation (CACES), **aptitude médicale** (médecin du travail) et
  **connaissance des lieux** (CAPEB ; art. R4323-56 du Code du travail). Effectif saisonnier de la logistique de Moirans :
  25 à 60 personnes (hebdo39.net).
- **Construit** : l'équipe (prénoms fictifs), les besoins par jour, les absences et leurs dates, l'imprévu, les textes.

## 3. Objectif pédagogique

L'élève sait **préparer l'arrivée d'un salarié** (ce qu'on peut et ce qu'on ne peut pas lui demander, l'ordre d'un premier
jour, la différence **CACES / autorisation de conduite**) et **planifier les présences** d'une équipe en respectant des
règles, puis **replanifier** après un imprévu et rendre compte. Suit ENT-5.1 (Yanis recruté) ; précède ENT-5.3 (Yanis au
quai, l'après-midi du 9 décembre).

## 4. Déroulé (l'heure est chargée : c'est voulu ; un élève qui n'a pas fini reprend à la séance suivante)

Accueil — **Sophie Martin** (même personnage qu'ENT-5.1) : « Bonjour {prénom} ! / La direction a validé **Yanis Morel** :
il arrive le **mercredi 9 décembre**. / Aujourd'hui : préparer son arrivée, puis le planning de l'équipe pour les deux
semaines du pic. Sophie »

1. **Pièces à demander à Yanis** : 8 pièces, cocher celles à demander (4) :

   | Pièce | À demander ? | Phrase d'explication (guidage, au bilan) |
   |---|---|---|
   | Pièce d'identité | oui | Pour vérifier qui il est et établir le contrat. |
   | Numéro de sécurité sociale (carte Vitale) | oui | Obligatoire pour déclarer l'embauche. |
   | RIB | oui | Pour verser son salaire. |
   | Copie des CACES 3 et 5 | oui | Le poste demande de conduire des chariots. |
   | Relevé de notes du collège | non | Aucun lien avec le poste. |
   | Groupe sanguin | non | Donnée de santé : l'employeur n'a pas à la demander. |
   | Extrait de casier judiciaire | non | Réservé à certains métiers (sécurité, petite enfance). |
   | Autorisation parentale | non | Yanis est majeur. |

2. **Le premier jour de Yanis, à remettre dans l'ordre** (5 étapes) : accueil par Sophie et signature du contrat → remise
   des EPI (chaussures de sécurité, gilet haute visibilité, gants) → visite de sécurité de la plateforme avec le chef de
   quai → **remise de l'autorisation de conduite signée par Smoby** → premier déchargement au quai. Encadré **« Le CACES ne
   suffit pas »** (3 lignes) : « Pour conduire un chariot chez Smoby, Yanis a besoin d'une **autorisation de conduite**,
   signée par l'employeur. Elle se donne après le CACES, l'avis du médecin du travail et la visite des lieux. »
3. **Planning des présences** (vue Planning, **cas « personnel » de la maquette v8**, données reprises telles quelles) :
   semaines du 7 et du 14 décembre, lundi–vendredi, besoin 4-4-4-5-5 / 5-5-5-5-4, au moins un CACES présent par jour ;
   Karim (CACES), Léa (CACES), Mathis, Inès, Chloé, **Yanis (CACES, arrive le mer 9)**. ⚠ **Seul changement** par rapport à
   la maquette : Yanis n'est **plus « intérimaire »** — c'est le cariste en **CDD saisonnier** recruté en ENT-5.1 (étiquette
   « CDD » au lieu de « intérim »). Cartes : formation CACES de Mathis (imposée), visite médicale d'Inès (imposée), congés
   de Chloé, Karim, Léa ; piège Karim / Léa le mer 16 ; critère métier « aucun congé décalé sans nécessité ».
4. **L'imprévu** (après le premier envoi, juste ou faux ; `apresPlanning` + `phasePlanning: 2`) : arrêt maladie d'Inès
   lun 14 – mer 16 (nouvelle carte) + **Noa, intérimaire sans CACES**, dès le mar 15 (texte de la maquette).
5. **Message à Sophie par phrases à choisir** (lot 2) : salutation · « J'ai repris le planning après l'arrêt d'Inès. » ·
   « Chaque jour a assez de monde et au moins un cariste CACES. » (pièges : « Il manque du monde mardi 15. » ;
   « J'ai annulé tous les congés. ») · « Pouvez-vous valider ? Cordialement, » (pièges de ton).

Mots cliquables : EPI, autorisation de conduite, RIB, carte Vitale, intérimaire, CDD saisonnier, congé, effectif.

## 5. Jalons / notation (14, validés)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | Les 4 bonnes pièces cochées | la liste | — |
| 2 | Aucune pièce de trop | la liste | **compté seulement si au moins une pièce est cochée** (sinon vrai par inaction) |
| 3 | Le premier jour dans l'ordre | l'ordre | — |
| 4-13 | Les 10 jalons du planning (5 au 1er envoi, 5 après l'imprévu) | `etapesPlanning` | rien de vrai avant l'envoi |
| 14 | Message juste | `phrasesJustes` (ligne du constat + ton) | non envoyé = faux |

## 6. Contenu

`contenus/smoby-ent52.js` (pièces, ordre, déclaration `planning` du cas personnel, imprévu, messages, étapes).
`PLANNING` construit avec l'API livrée par le chantier Planning (relire son compte rendu ; données exactes : maquette).

## 7. Demandes au moteur

Vue Planning (`MOTEUR-vue-planning.md`) ; `MOTEUR-2de-S1.md` lots 1 (`AGO-3.1`, `AGO-3.2`), 2, 3, 7. **À vérifier** : la
liste à cocher et la remise en ordre existent-elles **dans** l'environnement d'entreprise (le type `ordre` existe comme
activité séparée) ? Sinon, le dire avant d'écrire.

## 8. Tests attendus

Bloc `smoby` : parcours juste 14/14 ; aucune case cochée → jalons 1 et 2 faux ; casier judiciaire coché → jalon 2 faux ;
autorisation de conduite avant la visite → jalon 3 faux ; planning : ceux du bloc `planning` (cas personnel) suffisent,
plus un cas « Yanis étiqueté CDD » ; inaction 0/14.

## 9. Supports

Trame courte : Cowork, après validation. Corrigé `contenus/corriges/ENT-5.2.js` (pièces + explications, ordre, une solution
du planning avant et après l'imprévu, message), calculé.

## 10. Critères de validation par Tristan

L'enchaînement pièces → premier jour → planning tient dans l'heure pour un bon élève ; le planning se joue comme la
maquette v8 (cas personnel).

## 11. Questions ouvertes (valeur par défaut)

- [ ] Reprise à la séance suivante si non fini : rien à construire (la base est gardée) ; le dire dans la fiche enseignant.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
