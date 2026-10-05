# Brief de séance — ENT-5.7 Kuehne+Nagel, affecter chauffeurs et camions aux enlèvements de Noël (2de, poste B — agent d'exploitation, guidage)

> **Renuméroté par Cowork le 04/10/2026 (soir)** : la préparation de la palette mixte d'E1 s'insère avant les séances K+N et
> prend ENT-5.6 ; cette séance (`id` inchangé : `smoby-enlevements`) devient **ENT-5.7**. Ancien fichier
> `ENT-5.6-smoby-enlevements.md` à supprimer (`git rm`) par Claude Code.

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.7-smoby-enlevements.md (il faut que la vue Planning et les lots 1, 3 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : **livré** (05/10/2026, `pret: true, ouverture: 'prof'` : fermée aux élèves, à essayer à l'écran)
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (décisions 11, 12, 18) ;
maquette `docs/briefs/planning/` (cas « chauffeurs et camions », v8 validée).
**Modèle** : Sonnet suffit si la vue Planning est livrée (la séance déclare surtout des données de la maquette).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.7 |
| `id` | `smoby-enlevements` |
| Titre / desc | « Kuehne+Nagel — les enlèvements de Noël » / « Agent d'exploitation à l'agence Kuehne+Nagel de Besançon : affecter un chauffeur et un camion à chacun des 5 enlèvements de la commande de Noël chez Smoby, en respectant permis, pauses, temps de conduite et repos, puis replanifier après une panne. » |
| Rubrique | simulog, entreprise n° 5 Smoby |
| Niveau(x) | 2de |
| Compétence(s) | **OTM-C2.2** (réserver et planifier l'opération), **OTM-C3.2** (temps de conduite, notion) ; domaine D2 |
| Temps pédagogique | guidage ; `coeur: true` (nom retenu au lot 1 de `MOTEUR-2de-S1`) |
| Notation | jalons + note sur 20 |
| Barème | 10 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : Kuehne+Nagel, agence Route de Besançon ; règles de conduite et de repos du **règlement CE 561/2006** :
  **4 h 30** de conduite au plus puis **pause de 45 min**, **9 h** de conduite par jour, **repos journalier de 11 h**
  (Webfleet) ; une semi-remorque demande le permis **CE**.
- **Construit** (déjà écrit dans la maquette, mention « (fictif) » sur les clients) : chauffeurs (Sofiane, Julie, Marc,
  Nadia), camions (Semi n° 1, Semi n° 2, Porteur n° 3), trajets, durées, fenêtres, la panne.
- **Simplifications assumées** (validées avec la maquette v8, à reconfirmer en classe) : une pause ne compte que si une
  **carte Pause** est posée ; le trajet compte en entier comme de la conduite ; pas de critère métier.

## 3. Objectif pédagogique

L'élève sait **planifier une journée d'exploitation** : un chauffeur et un camion par enlèvement, un trajet à la fois, le
bon permis et le bon camion, dans la fenêtre du client, en respectant **pauses, plafond journalier et repos**, puis
**replanifier** quand un camion tombe en panne. Suit ENT-5.6 (préparation : la palette mixte d'E1 est prête, la commande peut partir) ;
précède ENT-5.8 (lettre de voiture d'E1).

## 4. Déroulé

Accueil — message du **cariste (Yanis) relayé par Bruno, chef de quai Smoby** (passage de relais de ENT-5.6, texte proposé) :
« Bonjour l'exploitation ! La commande de Noël est en stock, prête à partir **jeudi 10 décembre** : 5 enlèvements
(détail joint). Bruno — Smoby Moirans » ; puis le **responsable d'exploitation** de l'agence : « {prénom}, planifie les
5 enlèvements de jeudi : un chauffeur et un camion pour chacun. Attention aux temps de conduite ! »

1. **Planning des chauffeurs** (vue Planning, **cas « chauffeurs et camions » de la maquette v8**, données reprises telles
   quelles) : grille 05:00–19:00 au quart d'heure, lignes = chauffeurs (permis, fin de service hier), cartes = 5 enlèvements
   (E1 Lyon, E2 Dijon, E4 Mâcon en semi ; E3 et E5 Besançon en porteur) + 4 cartes « Pause 45 min », **bulle** « Quel
   camion pour E3 ? », grille « Utilisation des camions » en lecture seule. Pièges : Marc n'a que le permis C ; Nadia a fini
   à 23 h hier (pas de départ avant 10 h) ; enchaîner deux trajets sans pause ; dépasser 9 h.
2. **Guidage** (aides de la maquette) : bande ambrée de la fenêtre, heure de reprise calculée et zone de repos hachurée,
   compteur « conduite X / 9 h » par ligne, problèmes signalés en direct.
3. **L'imprévu** (après le 1er envoi, juste ou faux) : message de l'**atelier K+N** : le **Semi n° 2 est à l'atelier
   jusqu'à 12:00** (hachuré sur sa ligne) → replanifier et renvoyer.

Mots cliquables : enlèvement, permis CE, semi-remorque, porteur, temps de conduite, pause, repos journalier.

## 5. Jalons / notation (10)

Ceux de la maquette, **5 par version** : chauffeur + camion pour chacun ; chauffeurs (un trajet à la fois, bon permis) ;
camions (un trajet à la fois, bon type, disponibles) ; fenêtres ; conduite et repos (4 h 30, 9 h, 11 h). Rien de vrai avant
l'envoi ; inaction 0/10 (déjà vérifié dans la maquette).

## 6. Contenu

`contenus/smoby-ent55.js` : déclaration `planning` du cas chauffeurs (API livrée par le chantier Planning ; données exactes
en tête du script de la maquette), messages, imprévu (`apresPlanning` + `phasePlanning: 2`), étapes. **Mêmes chauffeurs,
camions et trajets que ENT-5.8** (mettre ces données dans `contenus/smoby.js` pour ne pas les recopier).

## 7. Demandes au moteur

Vue Planning ; `MOTEUR-2de-S1.md` lots 1 (`OTM-C2.2`, `OTM-C3.2`), 3, 7. Rien d'autre.

## 8. Tests attendus

Bloc `smoby` : parcours juste 10/10 (les deux solutions de la maquette, écrites à la main) ; la solution du 1er envoi ne tient
plus après la panne ; Marc sur une semi → jalon chauffeurs faux ; Nadia avant 10:00 → jalon conduite faux ; inaction 0/10.

## 9. Supports

Trame courte (lexique, les trois règles de conduite, la grille vierge) : Cowork, après validation. Corrigé
`contenus/corriges/ENT-5.7.js` (une solution avant / après la panne), calculé.

## 10. Critères de validation par Tristan

La séance se joue comme le cas « chauffeurs et camions » de la maquette v8, dans l'environnement Smoby / K+N.

## 11. Questions ouvertes (valeur par défaut)

- [ ] Compte rendu de la replanification par un message (phrases à choisir) : **non** pour l'instant (barème 10, comme la
  maquette) ; à ajouter si Tristan le demande après essai.
- [ ] Le passage de relais de ENT-5.6 (préparation) vient de Bruno, chef de quai (oui).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `activites/smoby-enlevements.js` (nouveau), une ligne dans `activites/index.js` ;
  `contenus/smoby-ent57.js` (nouveau : planning, messages, accueil, lexique, solution) ; `contenus/smoby.js` (bloc
  Kuehne+Nagel : `KN_AGENCE`, `CHAUFFEURS`, `CAMIONS`, `ENLEVEMENTS`, communs à ENT-5.8) ; `contenus/corriges/ENT-5.7.js`
  (nouveau, calculé) ; `outils/test/smoby.mjs` (6 cas) ; `outils/test/socle.mjs` (ENT-5.7 ajouté au repère de l'ordre Simulog).
- **Écarts par rapport au brief** : fichier de données `contenus/smoby-ent57.js` et non `smoby-ent55.js` (nom déjà pris par
  ENT-5.5). Les messages de départ sont deux mails : Bruno (Smoby) annonce les 5 enlèvements (liste calculée depuis les données),
  le responsable d'exploitation confie le planning. Après le 2e envoi, un mail de fin du responsable (« demain, la lettre de
  voiture d'E1 »), sans dire si c'était juste.
- **Décisions prises en route** : environnement Smoby (logo, charte), sous-titre et adresse de messagerie de l'agence K+N
  (`docs/decisions.md`). Données et règles du planning reprises telles quelles du cas « chauffeurs » de la maquette v8.
- **Tests** : bloc `smoby` 152 / 152 (déclaration et rang ; les deux solutions à 10 / 10 et le 1er envoi qui ne tient plus
  après la panne ; Marc sur une semi → jalon chauffeurs faux seul ; Nadia à 07:00 → conduite fausse seule ; 7 h sans pause →
  conduite fausse ; ouverture sans jalon ; parcours juste à l'écran 10 / 10 ; rien posé envoyé deux fois → 0 / 10). Éprouvés
  dans l'autre sens : Marc en permis CE et panne retirée font tomber les deux cas visés. Suite complète : voir le commit.
- **Commits** : voir `git log` (« ENT-5.7 Smoby / K+N : les enlèvements de Noël… »).
- **Reste ouvert** : compte rendu de la replanification par phrases (non pour l'instant, brief §11) ; trame courte (Cowork,
  après essai à l'écran).
