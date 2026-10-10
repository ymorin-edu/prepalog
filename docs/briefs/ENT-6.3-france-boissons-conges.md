# Brief de séance — ENT-6.3 France Boissons, les congés d'été des chauffeurs et l'annonce du saisonnier (2de, poste A, entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/ENT-6.3-france-boissons-conges.md puis implémente-le (après ENT-6.2 et ENT-6.1). Commence par refaire le calage du §4 par script avant d'écrire. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (10/10/2026, `pret: true, ouverture: 'prof'` : à essayer à l'écran) — voir « Compte rendu » en fin de fichier
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus) ; cadrage `claude/prepalog-2de-s2-cadrage.md` (décisions 5, 14) ; choix de
Tristan du 05/10 : **chauffeurs-livreurs seuls**, besoin du saisonnier **né d'un imprévu**, annonce **avec pièges de
discrimination**, accueil par **Inès** (assistante administrative, ventes et RH).
**Modèle** : Opus (séance nouvelle de bout en bout, calage).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.3 |
| `id` | `france-boissons-conges` |
| Titre / desc | « France Boissons — les congés d'été » / « Planifier les congés d'été des chauffeurs-livreurs de la tournée de la côte, replanifier après un départ, rédiger l'annonce du chauffeur saisonnier et répondre à un chauffeur dont le congé est décalé. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **AGO-3.2** (planifier présences et congés), **AGO-3.1** (procédures d'entrée : l'annonce) ; D2, D3 |
| Temps pédagogique | **entraînement** (`temps: 'erreur'` côté Planning : « Vérifier mon planning », aide `regles` seule ; S1 ENT-5.2 était le guidage) |
| Notation | jalons + note sur 20 |
| Barème | 16 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié (05/10/2026)** : France Boissons publie des offres « **SAISON – Chauffeur livreur VL** » en CDD (titres
  d'annonces, cadrage) ; le permis **B** suffit pour un véhicule léger (moins de 3,5 t) ; 30 tournées par jour en haute
  saison à Buchelay. **Mentions interdites dans une offre d'emploi** (Code du travail, code.travail.gouv.fr) :
  le **sexe** et la **situation de famille** (art. [L1142-1](https://code.travail.gouv.fr/code-du-travail/l1142-1)) ; une
  **limite d'âge supérieure** (art. [L5331-2](https://code.travail.gouv.fr/code-du-travail/l5331-2), sauf condition d'âge
  imposée par la loi) ; tout motif de discrimination de l'art. L1132-1, dont l'**origine** et la **nationalité**
  (art. [L5321-2](https://code.travail.gouv.fr/code-du-travail/l5321-2)).
- **Construit (annoncé)** : l'équipe (prénoms), les demandes de congés, les besoins par semaine, la règle interne de
  priorité, le départ de Kevin, les dates du CDD.

## 3. Objectif pédagogique

Entraînement de ce qu'ENT-5.2 a guidé (Smoby) : planifier des **congés** sous contraintes, **replanifier** après un
imprévu, **justifier** un refus par un message ; puis **rédiger une annonce** légale (AGO-3.1, entraînée après ENT-5.1).
S'appuie sur ENT-6.1 : Karim **décide** (hiérarchique), Inès **enregistre et informe** (fonctionnel).

## 4. Déroulé (séance chargée, comme ENT-5.2 : un élève qui n'a pas fini reprend la fois suivante)

**Date du scénario : mardi 15 juin 2027, après-midi**, le jour de la commande de Malo (ENT-6.2, le matin) : les dates
suivent l'ordre de jeu. Calendrier de S2 (décision de Tristan du 05/10/2026, « A : lundi → vendredi ») : 6.1 lun. 14 juin · 6.2 mar. 15 · 6.3 mar. 15 après-midi · 6.4 mer. 16, 14 h · 6.5 mer. 16, 16 h · 6.6 jeu. 17, 7 h · 6.7 jeu. 17 après-midi · 6.8 ven. 18, 5 h · 6.9 ven. 18, 6 h 30 · 6.10 ven. 18, 17 h.

1. **Message d'Inès** (3 blocs) : « Bonjour {prénom} ! / Les chauffeurs ont posé leurs congés d'été. Karim veut le
   planning **ce soir** : il doit rester assez de chauffeurs chaque semaine. / Place les congés, puis envoie-le.
   Inès »
2. **Planning** (vue Planning, cas « personnel », échelle en **semaines**) :
   - Colonnes : **8 semaines du pic** (S1 = semaine du 5 juillet … S8 = semaine du 23 août) **+ une 9e « semaine du
     30 août (après le pic) »**, où un congé peut être reporté.
   - Lignes : les 7 chauffeurs-livreurs de l'équipe de Karim : **Lucas, Amandine, Julien** (connaissent la côte, repère
     visible), Sébastien, Fatou, Yoann, Kevin.
   - **Besoin** (présents) : **6** par semaine en juillet (S1-S4), **5** en août (S5-S8), 0 après le pic.
   - **Au moins un chauffeur qui connaît la côte** chaque semaine (`auMoinsUn`).
   - Cartes (date demandée · durée · **date de la demande**) :

     | Chauffeur | Congé demandé | Durée | Demandé le | Note |
     |---|---|---|---|---|
     | Amandine | S3 (19 juil.) | 1 sem. | 2 mars | |
     | Sébastien | S5-S6 (2 août) | 2 sem. | 18 mars | |
     | Lucas | S2-S3 (12 juil.) | 2 sem. | 5 mai | |
     | Fatou | S6-S7 (9 août) | 2 sem. | 12 mai | |
     | Yoann | S7-S8 (16 août) | 2 sem. | 20 mai | |
     | Kevin | S8 (23 août) | 1 sem. | 28 mai | |
     | Julien | S5 (2 août) | 1 sem. | — | **déjà validé** (imposé) |

   - **Règle interne** (construite, dans les consignes) : « En cas de conflit, la **demande la plus ancienne** garde sa
     date. On décale le moins de congés possible. » → règles `effectif`, `auMoinsUn`, `dateImposee`, `sansNecessite`, et un
     `critere` « priorité à la demande la plus ancienne ».
   - **Calage fait par Cowork (énumération, à refaire par script)** : 1er envoi → **une seule solution** qui ne décale
     qu'un congé en respectant la priorité : **Lucas en S1-S2** (5-16 juillet). Amandine (demandée la première) garde S3.
3. **L'imprévu** (après le 1er envoi, `apresPlanning` + `phasePlanning: 2`) : message d'Inès : « Kevin a trouvé un poste
   près de chez lui : son dernier jour est le **vendredi 2 juillet**. Karim a obtenu un **chauffeur saisonnier**, mais il
   ne pourra commencer que le **lundi 12 juillet** (le temps de recruter). Reprends le planning. » → ligne Kevin retirée
   (sa carte aussi), ligne **« Saisonnier (à recruter) »** disponible de S2 à S8, ne connaît pas la côte.
   **Calage (énumération)** : en S1 il faut les 6 restants → aucun congé en S1 ; **seule solution** qui ne décale qu'un
   congé avec la priorité : **Lucas en S8 + semaine du 30 août** (23 août – 3 septembre). C'est le congé de Lucas qui
   saute deux fois : c'est le cœur du message.
4. **Message à Lucas par phrases à choisir** (copie à Karim ; ordre des choix tiré par élève) :

   | Ligne | Juste | Pièges |
   |---|---|---|
   | salutation | « Bonjour Lucas, » | « Salut Lucas ! » |
   | décision | « Votre congé du 12 au 23 juillet ne peut pas être accordé. » | « Votre congé est accepté. » · « Votre congé est annulé. » |
   | raison | « Avec le départ de Kevin, il faut six chauffeurs chaque semaine de juillet, et Amandine avait demandé la semaine du 19 juillet avant vous. » | « Karim ne veut pas. » · « Il y a trop de travail. » (incomplète) |
   | proposition | « Karim vous propose du 23 août au 3 septembre. » | « Vous prendrez vos congés en septembre. » · « Vous n'aurez pas de congé cet été. » |
   | fin | « Je reste à votre disposition. Cordialement, {prénom}, pour Inès » | « Désolé ! » · « Bisous » |

5. **Annonce du saisonnier** (fiche à remplir, documents à gauche : le message de Karim sur le besoin et une **fiche de
   poste** courte : chauffeur-livreur VL, tournées CHR depuis Buchelay, livraison de fûts et casiers, reprise des vides) :
   - Intitulé (`liste`) : **Chauffeur-livreur VL saisonnier (H/F)** · Chauffeur poids lourd (H/F) · Préparateur de
     commandes (H/F).
   - Contrat (`choix`) : **CDD saisonnier** · CDI · Stage.
   - Dates (`liste`) : **du 12 juillet au 27 août 2027** · du 5 juillet au 27 août · à partir du 12 juillet, sans date de
     fin.
   - Rattaché à (`liste`) : **Karim, responsable d'exploitation transport** · Inès · Nadia.
   - « À écrire dans l'annonce ? » (`ouinon`, 8 lignes) — **oui** : Permis B exigé · Manutention de fûts et de casiers ·
     Lieu : Buchelay (78) · Horaires et salaire ; **non** : « Moins de 30 ans » · « Homme de préférence » · « Nationalité
     française exigée » · « Célibataire sans enfant ».
   - Encadré (3 lignes) : « Une annonce ne peut pas trier les candidats sur leur âge, leur sexe, leur origine ou leur
     famille : c'est une **discrimination**, interdite par le Code du travail. On demande ce qui sert au poste. »
   - Envoi : « Envoyer l'annonce à Karim ».
6. **Réponse de Karim** (`apresFiche`) : « Merci, je la transmets à Hélène pour validation. » (rappel du lien
   hiérarchique d'ENT-6.1 ; ne dit pas si c'est juste).

Mots cliquables : congé, effectif, CDD saisonnier, VL, permis B, discrimination, rattaché, priorité.

## 4 bis. Questions au fil — tranché par Tristan le 10/10/2026 (tout ce que Cowork propose est gardé)

Détail : `docs/briefs/france-boissons/PROPOSITIONS-questions-au-fil.md` § ENT-6.3 ; code : `contenus/questions/ENT-6.3.js`.

| # | Geste | Qui | Question | Type | Notée | Correction |
|---|---|---|---|---|---|---|
| 1 | `planning:fb-conges:poser` (premier geste) | Karim | Que regardes-tu d'abord ? | fil | réflexion | bilan |
| 2 | 1er envoi du planning (point d'étape, ferme le planning de la reprise) | Inès | Le départ de Kevin, comment s'appelle-t-il ? | étape | **réflexion** (aucun texte ne définit la démission) | — |
| 3 | `messagerie:phrase:raison` (message à Lucas) | Inès | Pourquoi donner la raison, pas seulement la décision ? | fil | réflexion | — |
| 4 | `fiche:annonce:envoyer` | Karim | Pourquoi la loi permet-elle un CDD saisonnier ? (L1242-2, 3°) | fil | 1,5 | bilan |
| 5 | même geste, après la 4 | Karim | Un candidat de 52 ans : l'écarter pour son âge ? (L1132-1) | fil | 1,5 | bilan |

### 4 ter. Avant de commencer — tranché par Tristan le 10/10/2026 (toute la banque est gardée)

Détail : `docs/briefs/france-boissons/BANQUE-avant-de-commencer.md` § ENT-6.3. 8 questions non notées, 4 tirées par élève
(`{ preparation: 2, droit: 2 }`), calculette du site. Préparation : `qui-decide-conges-2` ★, `besoin-semaine`, `demande-ancienne`
(valeurs tirées), `annonce-sert`. Droit : `conges-acquis` ★ (tirée), `plafond-30` (tirée), `bloc-24-jours`, `essai-cdd` (tirée).
Documents à gauche : demandes de congés, règle de la plateforme, annuaire, fiche de poste, « Le droit ».

## 5. Jalons (16)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1-5 | 1er envoi : effectif · un chauffeur de la côte · congé de Julien à sa date · priorité à la plus ancienne · aucun congé décalé sans nécessité | `etapesPlanning` (v1) | rien de vrai avant l'envoi ; envoyer à vide = 0 |
| 6-10 | Après l'imprévu : les mêmes 5 | `etapesPlanning` (v2) | idem |
| 11 | Intitulé, contrat et dates justes | `ficheEnvoyee` | non envoyée = faux |
| 12 | Rattaché à Karim | idem | — |
| 13 | Les 4 mentions utiles cochées « oui » | idem | — |
| 14 | Les 4 mentions interdites cochées « non » | idem | toutes les lignes sont obligatoires à l'envoi : pas de vrai par inaction |
| 15 | Message à Lucas : décision + raison + proposition justes | `phrasesJustes` | non envoyé = faux |
| 16 | Ton : salutation et fin justes | idem | idem |

## 6. Contenu

`contenus/france-boissons-ent63.js` (planning, imprévu, phrases, fiche de poste, annonce, jalons, accueil). Les attendus
du planning sont **calculés par le moteur** (règles), jamais recopiés ; le calage est vérifié par un script d'énumération
(sur le modèle de `outils/carte/calibrer.mjs`) qui échoue si la solution n'est plus unique.

## 7. Demandes au moteur

**À vérifier au lot 0 (lecture seule)** :
- l'échelle `jours` accepte des colonnes **semaines** (libellés libres, durée en colonnes) et une colonne à besoin 0 ;
- une ligne **retirée** par l'aléa (Kevin) : `alea` sait-il retirer une ligne et sa carte ? Sinon : Kevin reste, avec
  `dispo` vide à partir de S1, et sa carte devient sans objet → demande au moteur à écrire ici ;
- la règle « priorité à la demande la plus ancienne » en `critere`.
Rien d'autre : fiche à remplir (`liste`, `choix`, `ouinon`, `encadre`), phrases à choisir, déclencheurs existent.

## 8. Tests attendus

Bloc `france-boissons` : parcours juste 16/16 ; inaction 0/16 ; Amandine décalée au lieu de Lucas → jalon 4 (puis 9)
faux ; « Moins de 30 ans » coché oui → jalon 14 faux ; CDI → jalon 11 faux ; message « Votre congé est annulé » → jalon 15
faux ; calage : le script d'énumération retrouve 1 solution au 1er envoi et 1 après l'imprévu.

## 9. Supports

- Trame : Cowork, après validation. Corrigé `contenus/corriges/ENT-6.3.js` (les deux plannings, l'annonce, le message).
- **Questions « Pour réfléchir » de la trame** (décision de Tristan, 05/10/2026) : elles portent sur ce que l'élève vient de faire **et** le replacent dans la semaine de S2 (lundi 14 → vendredi 18 juin, fil rouge de la commande de Malo) : d'où vient ce qu'il a reçu, qui se servira de ce qu'il a produit, ce que son erreur aurait coûté plus loin. Pistes :
  - « Ton planning garde un chauffeur de la côte chaque semaine : pour quelle tournée de la semaine est-ce important ? »
  - « Si ton annonce n'avait trouvé personne avant le 12 juillet, qu'aurais-tu dû changer dans ton planning ? »
  Règles inchangées (`claude/prepalog-trames-eleve.md`) : une question à la fois, sur le travail de l'élève, sans réponse unique.

## 10. Critères de validation par Tristan

Le planning en semaines se lit au vidéoprojecteur ; l'imprévu se comprend sans aide ; le contraste « ce qu'on peut écrire
/ ce qu'on n'a pas le droit d'écrire » marche en classe.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Date : **mardi 15 juin 2027, après-midi** (calendrier « lundi → vendredi », Tristan, 05/10).
- [ ] Durée réelle : planning × 2 + message + annonce, c'est la séance la plus dense de S2. Si l'essai déborde, l'annonce
  peut passer en début d'ENT-6.4. (Garder tout.)

## Compte rendu *(rempli par Claude Code à la livraison)*

*Rempli par Claude Code le 10/10/2026 (agent constructeur, coordination Fable).*

- **Fichiers créés** : `activites/france-boissons-conges.js`, `contenus/france-boissons-ent63.js` (planning, messages, annonce, documents,
  jalons, accueil, lexique), `contenus/questions/ENT-6.3.js`, `contenus/corriges/ENT-6.3.js` (calculé : les deux plannings énumérés,
  l'annonce, le message). **Modifiés** : `activites/index.js` (une ligne, après ENT-6.2), `core/types/planning.js` et
  `core/types/entreprise.js` (chantier D-3, voir `docs/briefs/MOTEUR-vue-planning.md` et `docs/chantiers.md`), `activites/FICHE-SEANCE.md`,
  `outils/test/planning.mjs` (3 cas), `outils/test/questions.mjs` (1 cas), `outils/test/france-boissons.mjs` (21 cas ajoutés, aucun
  cas existant réécrit). Rien dans `styles/`.
- **VÉRIFIÉ** : le calage, relancé (`calage-6.3.mjs`) puis recalculé par le contenu et écrit à la main dans le test : 331 776 / 16 206 /
  minimum 1 / une solution (Lucas du 5 au 16 juillet) ; 36 864 / 1 818 / 1 / une solution (Lucas du 23 août au 3 septembre). Les
  textes de loi du document « Le droit » (L3141-3, L3141-17, L1242-2 3°, L1242-10 al. 1-2, L1132-1 en extrait) relus le 10/10/2026 sur
  **code.travail.gouv.fr** (reprise de Légifrance ; Légifrance lui-même non consulté). Suite entière verte (1075/1075).
- **SUPPOSÉ / construit** : l'équipe, les demandes, les besoins, la règle, le départ de Kevin, les dates du CDD, tous les messages
  (comme le brief) ; la fiche de poste (horaires « départ du quai à 6 h », « salaire selon la grille ») ; « jour » de L1242-10 lu
  comme jour calendaire (la question ne compte que des jours, pas de calcul ouvré) ; le rendu de la grille de 9 semaines au
  vidéoprojecteur (colonnes de 96 px, « S1 · 5 juil. »).
- **Écarts par rapport au brief** (et pourquoi) : barème 20 et 27 jalons (refonte) ; pas de « Vérifier » (Q6) ; message au tu, lignes
  datées ; Lucas écrit d'abord (le moteur répond à l'expéditeur), donc pas de copie à Karim ; Lucas répond, déçu, l'élève choisit sa
  réponse (non notée) ; l'annonce attend la réponse à Lucas ; « décaler le moins » = nombre minimal de décalés (décision de Tristan) ;
  pas de trame (refonte) ; D3141-6 laissé tel quel. Détail : `docs/decisions.md` (10/10/2026, ENT-6.3).
- **Tests** : `planning` 26 → 29, `questions` 110 → 111, `france-boissons` 61 → 82 ; suite entière en parallèle 1075/1075. Sabotages
  (dans les deux sens, chaque fois restauré) : priorité neutralisée, minimum neutralisé, `repriseIdentique` retiré, liens à l'effectif
  retirés, `retraits` remplacé par le repli `dispo: 9`, `aides.verifier` retiré, `fermetures` retirée, `apres: 'bilan'` retiré, correctif
  du menu retiré : chaque fois le ou les cas visés tombent.
- **Commits** : `d3a2a69` (moteur D-3), `54cfd7b` (séance en brouillon + correctif du menu), `c833dd1` (tests), puis le commit de livraison.
- **À vérifier à l'écran par Tristan** : grille de 9 semaines lisible (vidéoprojecteur, « Agrandir ») ; l'imprévu se comprend sans aide
  (Kevin disparaît, saisonnier « pas là » en S1 et S9) ; le point d'étape après le 1er envoi ; le message de Lucas et sa réponse déçue ;
  le contraste « ce qu'on écrit / ce qu'on n'écrit pas » de l'annonce ; les deux questions de Karim à l'envoi de l'annonce.
