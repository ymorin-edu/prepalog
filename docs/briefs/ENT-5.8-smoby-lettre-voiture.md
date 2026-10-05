# Brief de séance — ENT-5.8 Smoby / Kuehne+Nagel, la lettre de voiture et le retard (2de, poste B — agent d'exploitation, guidage)

> **Renuméroté par Cowork le 04/10/2026 (soir)** : la préparation (ENT-5.6) s'insère avant les séances K+N ; cette séance
> (`id` inchangé : `smoby-lettre-voiture`) devient **ENT-5.8**. Ancien fichier `ENT-5.7-smoby-lettre-voiture.md` à supprimer
> (`git rm`) par Claude Code. **Poids d'E1 recalculé : 6 091 kg.**

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.8-smoby-lettre-voiture.md (il faut que les lots 1, 2, 3 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (05/10/2026, `pret: true, ouverture: 'prof'` : à essayer à l'écran, puis à ouvrir au groupe)
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (section « Séance B2 »).
**Modèle** : Opus.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.8 |
| `id` | `smoby-lettre-voiture` |
| Titre / desc | « Kuehne+Nagel — la lettre de voiture et le retard » / « Agent d'exploitation à l'agence Kuehne+Nagel de Besançon : remplir la lettre de voiture d'un enlèvement chez Smoby, puis gérer un retard et prévenir le client et l'expéditeur. » |
| Rubrique | simulog, entreprise n° 5 Smoby (le scénario S1 réunit Smoby et K+N) |
| Niveau(x) | 2de |
| Compétence(s) | **OTM-C2.1** (constituer le dossier transport), **OTM-C2.3** (suivre l'opération, rendre compte) ; domaines D3, D1 |
| Temps pédagogique | guidage ; `coeur: true` (nom retenu au lot 1 de `MOTEUR-2de-S1`) |
| Notation | jalons + note sur 20 |
| Barème | 8 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : Kuehne+Nagel, transporteur réel, **agence Route à Besançon** (École-Valentin) (site K+N, PagesJaunes) ;
  mentions de la **lettre de voiture nationale** (arrêté du 9 novembre 1999 : expéditeur, transporteur, destinataire, lieux et
  dates de prise en charge et de livraison, nature, quantité et poids de la marchandise ; signatures de l'expéditeur et du
  transporteur au départ, du destinataire à la livraison) (Légifrance, Dashdoc).
- **Construit et annoncé** : le contrat Smoby ↔ K+N (aucune source), le rattachement de Moirans à l'agence de Besançon, le
  client « Jouets du Rhône (fictif) » à Corbas (69), Julie (chauffeuse, prénom inventé), le Semi n° 1, l'ordre d'enlèvement,
  l'accident, les durées, le poids.
- **Documents reconstitués** : lettre de voiture, ordre d'enlèvement, fiche client portent « Document pédagogique,
  reconstitution, non contractuel ». Pas de logo K+N (le logo de la séance est celui de Smoby, lot 7).

## 3. Objectif pédagogique

L'élève sait **constituer un document de transport** à partir de plusieurs documents sources, puis **réagir à un incident**
pendant le transport : calculer la nouvelle heure d'arrivée et **prévenir** le client et l'expéditeur. Dernière séance de S1 ;
la séance précédente (ENT-5.7) a planifié l'enlèvement E1 (dossier propre : son planning est fourni juste).

## 4. Déroulé

Accueil : message du **responsable d'exploitation** de l'agence (personnage fictif, sans nom de salarié réel) : « Bonjour
{prénom} ! / Ce matin, Julie part à **6 h 00** chez Smoby à Moirans pour l'enlèvement **E1** (commande de Noël, 33
palettes pour Lyon). / Prépare sa **lettre de voiture** avec l'ordre d'enlèvement, la fiche client et le planning. » —
**jeudi 10 décembre 2026**.

1. **Trois documents sources** (lecture) :
   - **Ordre d'enlèvement Smoby** n° **OE-26-1210-01** : expéditeur Smoby Toys — plateforme logistique, Moirans-en-Montagne
     (39260) ; marchandise « jouets (maisons de jardin, cuisines, porteurs) », **33 palettes Europe**, **poids brut 6 091 kg**
     (construit : 32 palettes complètes × 180 kg + la palette mixte préparée en ENT-5.6, 331 kg) ; enlèvement jeudi 10/12 à partir de 06:00.
   - **Fiche client** : Jouets du Rhône (fictif), entrepôt, Corbas (69960) ; **livraison avant 12:00**, quai 4.
   - **Planning d'ENT-5.7** (extrait) : E1 → **Julie**, **Semi n° 1**, départ 06:00, 4 h de conduite (arrivée prévue 10:00).
2. **Remplir la lettre de voiture nationale** (formulaire dessiné comme le document) — cases : n° (prérempli), date ;
   **expéditeur** (nom, adresse) ; **destinataire** (nom, adresse) ; **transporteur** (Kuehne+Nagel, agence Route de
   Besançon) ; **lieu et date de chargement** ; **lieu et date de livraison** ; **nature de la marchandise** ; **nombre de
   palettes** ; **poids** ; **chauffeur** ; **véhicule**. Listes de choix pour les noms et lieux (pièges : inverser expéditeur
   et destinataire, mettre Smoby comme transporteur, Corbas comme lieu de chargement), saisie pour les nombres. Bouton
   « Envoyer la lettre de voiture » (une fois ; en guidage, le bilan dit ce qui était faux).
3. **Le retard** (déclencheur après l'envoi, juste ou faux) : message de **Julie** à **8 h 30** : « Accident sur l'A40,
   l'autoroute est fermée. Je suis arrêtée, moteur coupé. **On m'annonce 1 h de retard.** » Question : « À quelle heure Julie
   arrivera-t-elle chez Jouets du Rhône ? » (attendu **11:00**, saisie HH:MM) puis « Est-ce encore avant l'heure limite de
   livraison ? » (oui). Simplification assumée et écrite dans le corrigé : le temps arrêté, moteur coupé, ne compte pas comme
   de la conduite (Julie reste à 4 h).
4. **Deux messages par phrases à choisir** (lot 2) :
   - **au client** (Jouets du Rhône) : salutation · « Notre camion a 1 h de retard à cause d'un accident sur l'A40. » ·
     « Il arrivera vers **11 h 00**, avant votre heure limite. » (pièges : 10 h 00, 12 h 30) · « Pouvez-vous nous confirmer
     que le quai 4 sera libre ? » · fin ;
   - **à Smoby** (l'expéditeur) : salutation · « La livraison E1 pour Jouets du Rhône aura 1 h de retard (accident). » ·
     « Le client est prévenu. » · fin.

Mots cliquables : lettre de voiture, expéditeur, destinataire, transporteur, ordre d'enlèvement, palette Europe.

## 5. Jalons / notation (8, validés)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | Expéditeur et destinataire justes | la lettre envoyée | rien n'est vrai avant l'envoi |
| 2 | Transporteur, chauffeur et véhicule justes | idem | — |
| 3 | Lieux et dates de chargement et de livraison justes | idem | — |
| 4 | Marchandise juste (nature, 33 palettes, 6 091 kg) | idem | — |
| 5 | Lettre envoyée **complète** (aucune case vide) | idem | case vide = faux |
| 6 | Nouvelle heure juste (11:00) | la réponse saisie | — |
| 7 | Message au client juste | `phrasesJustes` | non envoyé = faux |
| 8 | Message à Smoby juste | `phrasesJustes` | non envoyé = faux |

Valeurs attendues **calculées** depuis les données (heure prévue + retard), jamais recopiées.

## 6. Contenu

`contenus/smoby-ent56.js` (documents sources, formulaire de la lettre, messages, déclencheur du retard, étapes) ; univers
`contenus/smoby.js` (K+N agence de Besançon, Julie, Semi n° 1 : **mêmes données que le cas chauffeurs d'ENT-5.7**).

## 7. Demandes au moteur

`MOTEUR-2de-S1.md` lots 1 (`OTM-C2.1`, `OTM-C2.3`), 2, 3, 7. **À vérifier au lot 0** : un écran « document à remplir »
(cases + listes de choix + envoi) existe-t-il dans l'environnement (formulaire de réception ? grille ?) ? Sinon, le dire :
la vue n° 2 « Document à contrôler et à remplir » est prévue plus tard ; pour B2, un formulaire simple suffit.
Le retard s'appuie sur les **messages en cours de séance** existants (`declencheurs`, condition après l'envoi de la lettre).

## 8. Tests attendus

Bloc `smoby` : parcours juste 8/8 ; expéditeur / destinataire inversés → jalon 1 faux ; une case vide → jalon 5 faux ;
10:00 → jalon 6 faux ; le retard n'arrive qu'après l'envoi de la lettre ; inaction 0/8.

## 9. Supports

Trame courte (lexique, lettre de voiture vierge à remplir sur papier) : Cowork, après validation. Corrigé
`contenus/corriges/ENT-5.8.js` (lettre attendue, heure, messages), calculé. « Contrôler une lettre remplie avec erreurs » :
gardé pour **S2** (vue « Document à contrôler »).

## 10. Critères de validation par Tristan

La lettre ressemble à une vraie lettre de voiture (mention de reconstitution en pied) ; un élève de 2de trouve chaque
information dans les trois documents ; le retard arrive au bon moment.

## 11. Questions ouvertes (valeur par défaut)

- [x] Poids brut d'E1 : **6 091 kg** = 32 × 180 kg + 331 kg (palette mixte d'ENT-5.6) — décision de Tristan, 04/10 (soir).
- [x] Adresse du client : Corbas, 69960, sans rue (gardé, Tristan 04/10).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `activites/smoby-lettre-voiture.js` (nouveau), une ligne dans `activites/index.js` ;
  `contenus/smoby-ent58.js` (nouveau : documents, deux fiches, messages, déclencheurs, jalons, accueil, lexique) ;
  `contenus/corriges/ENT-5.8.js` (nouveau, calculé) ; **moteur** (lot 4 de `MOTEUR-documents-formulaire`, annoncé pour cette
  séance) : `core/types/fiche.js` (saisies `texte` / `nombre` / `date` / `heure`, `cadre`, `grille`, `entete`, `pied`,
  `envoi.incomplet`, `lireNombre`, `lireHeure`), `core/types/entreprise.js` (plusieurs fiches par séance, `quand`),
  `styles/base.css` (cadres et saisies, sans couleur nouvelle) ; `activites/FICHE-SEANCE.md` ; tests `outils/test/smoby.mjs`
  (9 cas) et `outils/test/socle.mjs` (ENT-5.8 au repère de l'ordre Simulog).
- **Écarts par rapport au brief** :
  - Données dans `contenus/smoby-ent58.js` (le brief disait `smoby-ent56.js`, déjà pris par ENT-5.6).
  - **Décision de Tristan (05/10)** : la lettre peut partir **incomplète** (sinon le jalon 5 ne pouvait jamais être faux) ;
    une case vide fait tomber le jalon 5 **et** celui de son groupe (chaque case appartient à un des jalons 1 à 4).
  - **Décision de Tristan (05/10)** : la nouvelle heure se saisit dans une **2e fiche** « Suivi de l'enlèvement E1 », ouverte
    par le message de Julie (absente du menu avant). Le jalon 6 lit l'heure **et** le « oui, avant l'heure limite ».
  - La date d'établissement de la lettre est jugée avec les lieux et dates (jalon 3).
  - Les messages par phrases ne se font qu'en réponse (règle du moteur) : après le suivi, le **client** écrit (« Tout se
    passe bien ? ») ; une fois le client prévenu, **Bruno** (Smoby) demande des nouvelles d'E1 ; puis un mot de fin du
    responsable, sans dire si c'était juste. Pièges ajoutés : « quai 1 » (celui de Smoby) au client, « Pouvez-vous prévenir
    le client ? » à Smoby, et une cause ou une livraison fausse sur une ligne.
  - Le planning joint montre les 5 enlèvements (l'élève cherche la ligne d'E1), pas seulement E1.
- **Décisions prises en route** : n° de lettre `LV-BES-26-12-0417` et date d'émission de l'ordre (09/12) construits ;
  listes de choix communes (les trois mêmes noms, les trois mêmes lieux partout : le piège est de les confondre) ; la fiche
  « Lettre de voiture » est dessinée en cases numérotées (1 Expéditeur … 7 Signatures) dans la fiche du moteur, avec la
  mention de reconstitution en pied. Valeurs **calculées** : chauffeur, camion et départ d'E1 depuis la solution du
  planning d'ENT-5.7 ; poids = (33 − 1) × 180 kg + la palette mixte d'ENT-5.6 pesée comme le moteur (331 kg) ; arrivée =
  06:00 + 4 h + 1 h = 11:00.
- **Tests** : bloc `smoby` 161 / 161 — moteur : saisies sans redessin, Entrée n'envoie pas, manques, case préremplie ;
  envoi incomplet et 2e fiche qui attend sa condition ; lecture des nombres et des heures. Séance : déclaration et rang ;
  valeurs calculées (6 091 kg, et 331 kg = le moteur d'ENT-5.6) et corrigé ; inaction 0 / 8 ; le retard n'arrive qu'après
  la lettre, puis le client, puis Smoby ; parcours juste à l'écran 8 / 8 ; pièges (inversés → jalon 1 seul ; poids vide →
  jalons 4 et 5 ; 10:00 → jalon 6 seul ; Smoby transporteur, 10 h 00 au client, Smoby prié de prévenir → 2, 7, 8).
  Éprouvés dans l'autre sens : Entrée qui envoie, condition de la 2e fiche retirée, retard sans condition, poids sans la
  palette mixte, envoi incomplet refusé — chacun fait tomber ses cas. Un cas existant d'ENT-5.7 réécrit (il vérifiait
  qu'ENT-5.7 était la dernière séance Smoby ; il vérifie maintenant qu'elle suit ENT-5.6). Suite complète : voir le commit.
- **Commits** : voir `git log` (« Fiche à remplir : saisies… » puis « ENT-5.8 Smoby / K+N : la lettre de voiture… »).
- **Reste ouvert** : trame courte (Cowork, après essai à l'écran) ; « Contrôler une lettre remplie avec erreurs » gardé
  pour S2 ; la date « Fiche envoyée le … » est l'heure réelle du poste (comme les mails), pas celle de l'histoire.
