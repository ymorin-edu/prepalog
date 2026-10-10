# Brief de séance — ENT-6.8 France Boissons, chauffeurs et camions du vendredi : panne, location ou sous-traitance (2de, poste B — agent d'exploitation, entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-6.8-france-boissons-planning.md. Commence par le §7 (demandes au moteur, vue Planning) : dis-moi ce qui existe déjà et ce qui reste à faire, en lecture seule, avant d'écrire la séance. Rejoue le calage (docs/briefs/france-boissons/calage-6.8.py) contre le moteur dans les tests. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-reprise-6.8.md` (décisions 57 à 62) ; cadrage
`claude/prepalog-2de-s2-cadrage.md` (décisions 9, 11, 16) ; déroulé S2 `claude/prepalog-2de-s2-deroule.md` (règles 17-37).
Modèle de séance : **ENT-5.7 Smoby / K+N** (vue Planning, cas « chauffeurs et camions », guidage), ici au niveau **entraînement**.
**Modèle** : **Opus** pour les demandes au moteur (§7, vue Planning) ; **Sonnet** suffit ensuite pour la séance (elle déclare
des données) et le compte rendu.
**Calage** : `docs/briefs/france-boissons/calage-6.8.py` et sa sortie `calage-6.8-resultats.txt` (énumération exhaustive
sur les règles, 05/10/2026). **Il cale les données ; il ne remplace aucun test** (les tests écrivent leurs solutions à la main).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.8 |
| `id` (jamais modifié ensuite) | `france-boissons-planning` |
| Titre / desc | « France Boissons — chauffeurs et camions du vendredi » / « Agent d'exploitation à la plateforme de Buchelay : affecter un chauffeur et un camion aux 5 tournées du vendredi, puis, après une panne, louer un camion ou confier une tournée à un transporteur, et dire quel document part à bord. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **OTM-C2.2** (réserver les moyens, planifier, documents de transport) ; **OTM-C3.2** (temps de conduite et de repos, notion) |
| Temps pédagogique | **entraînement** (`temps: 'erreur'`) ; guidage de ces compétences en ENT-5.7 |
| Notation | jalons + note sur 20 |
| Barème | 13 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (05/10/2026)** :
  - Camions électriques de France Boissons : **Renault Trucks E-Tech (ZE) 16 t**, ≈ **200 km par cycle** de charge, **loués**
    (Zefirent, groupe Petit Forestier), pour les livraisons CHR des agglomérations ([Stratégies Logistique, 16/05/2024](https://www.strategieslogistique.com/France-Boissons-electrifie-sa,14171)).
  - Dans la [vidéo « Présentation de la Plateforme de France Boissons à Buchelay », Grand Paris Seine & Oise, YouTube, 20/06/2025](https://www.youtube.com/watch?v=LRa0qgI7Weo) (lu le 07/10) : **10 camions électriques**, objectif « +10 d'ici fin 2025 » ; « France Boissons passe à
    l'électrique ! » sur un porteur ; **18 tournées en basse saison, jusqu'à 30 en haute saison**. Le vendredi 18 juin (veille de la
    Fête de la musique) est en haute saison : 30 tournées, dont l'élève planifie 5.
  - Permis : porteur 16 t → **permis C** ; véhicule léger (3,5 t ou moins) → **permis B**.
  - Plus de 3,5 t, règlement CE 561/2006 : **4 h 30** de conduite puis **45 min** de pause, **9 h** de conduite par jour,
    **11 h** de repos journalier ([Prévention BTP](https://www.preventionbtp.fr/ressources/focus/temps-de-conduite-et-de-repos-des-conducteurs_gAsxJwvvLWLSZpHHi4Lk4m)).
  - **Documents à bord** ([arrêté du 9 novembre 1999](https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=LEGITEXT000005628727)) :
    compte propre → **facture, bon d'enlèvement ou bon de livraison** (art. 2) ; compte d'autrui → **lettre de voiture** (art. 4) ;
    **véhicule loué sans chauffeur → feuille de location (ou copie du contrat de location) à bord** (art. 7-8).
    ⚠ **Correction du cadrage (décision 61)** : pour Mantes sur le camion loué, ce n'est pas « BL seul » mais **BL + contrat de
    location**. Le §4 étape 3 et le jalon 13 en tiennent compte ; à confirmer par Tristan (§11).
  - Distance : la côte normande depuis Buchelay ≈ 150 km, aller-retour ≈ 300 km (calcul Mappy, cadrage) → un électrique ne fait
    pas la côte.
- **Construit (annoncé comme tel)** : les 5 tournées (fenêtres, km, durées), les 5 camions et leur nom (E1, E2, T1, T2, VL), les
  heures de fin de service d'hier, la panne de T2 et de la borne n° 2, le loueur et le transporteur (**fictifs**, noms à vérifier
  libres), l'organisateur du concert de Rouen (**fictif**). **Règles internes de France Boissons (construites)** :
  « Versailles se livre en électrique » (inspirée du fait vérifié) ; « **un chauffeur et un camion font une seule tournée dans
  la journée** » (nouvelle, issue du calage, §11).
- **Simplifications assumées** (comme 5.7) : la tournée est un bloc (service) qui affiche « dont conduite X » ; 4 h 30 et 9 h se
  calculent sur la conduite (décision 58) ; pas de règle de temps de service ; la VL n'est pas soumise aux règles du 561/2006
  (non dit à l'élève).
- **Dessins** : aucun. **Documents reconstitués** : aucun (la fiche est un formulaire de la plateforme, pas un document officiel).

## 3. Objectif pédagogique

L'élève sait **planifier une journée de distribution** sans aide (bon permis, bon camion, autonomie, fenêtre, repos), puis,
quand un camion tombe en panne, **choisir entre louer un camion et sous-traiter** à un transporteur, et en tirer **la notion de
compte propre / compte d'autrui** : *c'est qui transporte qui fait le compte propre, pas à qui est le camion* (décision 57).
Il sait dire quel document part à bord (bon de livraison, contrat de location, lettre de voiture).
Suit ENT-6.7 (la commande de Malo est prête, elle part dans la tournée de la côte) ; précède ENT-6.9 (ordonner la tournée de la
côte, vue Tournée) et ENT-6.10 (bon de livraison et de reprise des vides chez Malo).

## 4. Déroulé (≈ 45 min)

**Date : vendredi 18 juin 2027, 5 h** (veille de la Fête de la musique ; 5 h et non 6 h, décision de Tristan du 06/10/2026 : les tournées partent dès 06:00). L'élève joue **son propre rôle**, en renfort à
l'exploitation. Tuteur : **Karim**, responsable d'exploitation.

**Message d'accueil de Karim** (3 blocs, texte proposé, à relire par Tristan) : « Bonjour {prénom} ! / Ce matin, 30 tournées
partent de Buchelay. Je t'en confie 5 : tu fais le planning de leurs chauffeurs, 5 tournées, 5 chauffeurs, 5 camions. Un chauffeur et un camion pour chaque tournée. / Attention aux
permis, à l'autonomie des électriques et au repos de chacun. Karim »

### Étape 1 — Le planning du vendredi (≈ 20 min, jalons 1 à 5)

Vue **Planning**, cas « chauffeurs et camions » d'ENT-5.7 : grille **05:00–19:00** au quart d'heure ; lignes = chauffeurs ;
seconde ressource (bulle) = camion ; grille en lecture seule « Utilisation des camions ». **Entraînement** : « Vérifier mon
planning » (liste effacée au geste suivant), aide « règles » seule, ni bande ambrée, ni heure de reprise calculée, ni compteur.

**Chauffeurs** (lignes ; 5 des 7 d'ENT-6.3, Yoann et Kevin hors service ce jour) :

| Chauffeur | Permis | Fin de service hier | Repère d'ENT-6.3 |
|---|---|---|---|
| Lucas | C | 17:00 | connaît la côte |
| Amandine | C | 19:30 | connaît la côte |
| Julien | **B** | — (repos) | connaît la côte |
| Sébastien | C | **22:00** | — |
| Fatou | C | — (repos) | — |

Le panneau consigne affiche permis et fin de service ; **l'élève calcule lui-même l'heure de reprise** (Amandine 06:30,
Sébastien 09:00). « Connaît la côte » : **information, pas une règle** (§11).

**Camions** (seconde ressource) :

| Camion | Type | Permis | Autonomie |
|---|---|---|---|
| E1 | porteur **électrique** 16 t | C | ≈ 200 km |
| E2 | porteur **électrique** 16 t | C | ≈ 200 km |
| T1 | porteur **thermique** (gazole) 16 t | C | — |
| T2 | porteur **thermique** (gazole) 16 t | C | — |
| VL | fourgon 3,5 t | B (ou C) | — |

**Tournées** (cartes ; la carte affiche service, conduite, km, fenêtre, vides) :

| Tournée | Fenêtre (carte) | Km | Service / dont conduite | Vides | Camion |
|---|---|---|---|---|---|
| **Côte normande** (Honfleur → Houlgate, dont La Cabane à Malo) | départ dès 06:00, **retour avant 15:30** | 320 | 8 h 30 / 4 h 30 | oui | porteur |
| **Rouen** : fûts du concert de la Fête de la musique (organisateur fictif) | prêts dès 06:00, **fûts livrés avant 11:00, 2 h 30 après le départ** | 210 | 4 h 30 / 2 h 45 | **non** (repris mardi 22) | porteur |
| **Versailles** (cafés, hôtels, restaurants) | départ dès 06:30 | 110 | 7 h / 2 h 30 | oui | porteur **électrique** (règle interne) |
| **Mantes–Vernon** | **retour avant 16:00** | 90 | 6 h / 2 h | oui | porteur |
| **Évreux** (petits volumes) | — | 120 | 5 h / 2 h 15 | oui | VL ou porteur |

Rouen : l'élève déduit le départ au plus tard (**08:30**). Données : `des: '06:00'`, `avant: '13:00'` (= 08:30 + 4 h 30 ; le
moteur juge la fin du bloc) ; **la carte n'affiche jamais 13:00 ni 08:30** : elle dit « livrés avant 11:00, 2 h 30 après le départ ».

**Règles** (bouton « Les règles ▾ ») : 1. Un chauffeur et un camion font **une seule tournée** dans la journée. 2. Porteur 16 t :
**permis C** ; VL : permis B (ou C). 3. Un électrique ne fait pas plus de km que son autonomie ; **Versailles se livre en
électrique**. 4. Respecter la fenêtre de chaque tournée. 5. **11 h de repos** depuis la fin de service d'hier ; **4 h 30** de
conduite au plus sans pause ; **9 h** de conduite au plus dans la journée.
Pas de carte Pause : aucune tournée ne dépasse 4 h 30 de conduite (décision 58). La côte est **juste à 4 h 30** : à lire.

**1er envoi attendu (une solution parmi 48, voir calage)** : Lucas côte T1 06:00 · Amandine Rouen T2 06:30 · Fatou Versailles E1
06:30 · Sébastien Mantes E2 09:00 · Julien Évreux VL 06:00. Le calage montre que dans **tout** 1er envoi juste : Julien est sur
Évreux avec le VL, la côte et Rouen sont sur T1 et T2, Versailles et Mantes sur E1 et E2, Sébastien sur Versailles ou Mantes.

### Étape 2 — L'imprévu de 5 h 30 (≈ 10 min, jalons 6 à 11)

Après le 1er envoi, juste ou faux (`apresPlanning('fb-chauffeurs')` + `phasePlanning: 2`), **message de Karim** (texte proposé) :
« {prénom}, deux mauvaises nouvelles. / **T2 est en panne** : il ne roulera pas aujourd'hui. Et la **borne n° 2** a lâché cette
nuit : **E2 n'est chargé qu'à 40 %, environ 80 km**. / J'ai deux solutions : un **porteur de location sans chauffeur**
(<loueur fictif>), disponible à **09:00** ; ou un **transporteur** (<transporteur fictif>) qui vient avec son chauffeur et son
camion, dès **07:00**. Une règle : **une tournée avec des vides à reprendre reste chez nous**. Reprends le planning. Karim »

Données de la phase 2 :
- T2 : **en panne** (indisponible toute la journée, hachuré dans « Utilisation des camions ») ; E2 : autonomie **80 km**.
- Camion ajouté : **« Porteur de location »** (thermique 16 t, permis C, **disponible dès 09:00**).
- Ligne ajoutée : **« Transporteur (fictif) »**, disponible dès **07:00**, qui **porte son camion** : une tournée posée sur
  cette ligne n'a pas de bulle et compte comme « chauffeur + camion » (§7.2).

**Attendu après l'imprévu (le calage le montre unique pour les camions, 36 répartitions de chauffeurs)** : côte → **T1** (Lucas,
Amandine ou Fatou) ; **Rouen → transporteur** (départ 07:00 à 08:30) ; Versailles → **E1** ; **Mantes → porteur de location**
à partir de 09:00 (Sébastien, Fatou, Amandine ou Lucas) ; Évreux → **VL**. Un chauffeur reste libre.
**Aucun 1er envoi juste ne survit à l'imprévu** (les 48 utilisent T2).

### Étape 3 — Les documents à bord (≈ 8 min, jalons 12 et 13)

Après le 2e envoi, **message de Karim** (texte proposé) : « Merci {prénom}. Voici ce qui part ce matin : **Rouen avec <transporteur>**,
**Mantes sur le porteur de location**, le reste sur nos camions. Avant les départs, remplis la fiche « Documents à bord ». Karim »
(Le message donne l'organisation retenue : la fiche ne pénalise pas deux fois une erreur de planning.)

**Fiche à remplir** (vue existante `fiche`, `quand: apresPlanning('fb-chauffeurs', 2)`), titre « Documents à bord — vendredi
18 juin ». Un bloc **`ouinon`** : lignes = les 5 tournées ; colonnes =
« **Transportée par France Boissons** (son chauffeur) » · « **Lettre de voiture** à bord » · « **Contrat de location** à bord ».
Phrase au-dessus : « Le bon de livraison part toujours avec la marchandise. »
Encadré (`encadre`) « Compte propre ou compte d'autrui ? » : « **Compte propre** : l'entreprise transporte **ses** marchandises,
avec **ses** chauffeurs, dans ses camions ou dans des camions **loués sans chauffeur**. Le bon de livraison suffit ; un camion loué
emporte aussi son contrat de location. **Compte d'autrui** : un **transporteur** transporte les marchandises d'un autre, contre
paiement. Il faut une **lettre de voiture**. »
Envoi : « Envoyer la fiche à Karim ». Tout doit être répondu (règle de la vue).

Attendus (calculés depuis les données) : Rouen = non / **oui** / non ; Mantes = **oui** / non / **oui** ; côte, Versailles,
Évreux = oui / non / non (non notés).

**Fin** — message de Karim, quand la fiche est envoyée (texte proposé) : « C'est parti. Lucas est sur la route de la côte avec la
commande de Malo. Il roule vers la côte : tout de suite, tu vas ordonner ses arrêts. Karim » (corrigé le 06/10/2026, décision 66 : ENT-6.9 se joue pendant que Lucas roule) (lien vers ENT-6.9 ; si le chauffeur de la côte n'est
pas Lucas, dire « le chauffeur de la côte » : à trancher au code, défaut **nommer le chauffeur posé par l'élève sur la côte en
version 2**, ou « l'équipe » s'il n'y en a pas).

**Pour réfléchir** (bilan, réponse libre non notée, règle 32) : « Le camion de Mantes n'est pas à France Boissons. Pourquoi
n'a-t-il pas besoin d'une lettre de voiture ? »

Mots cliquables : compte propre, compte d'autrui, lettre de voiture, bon de livraison, contrat de location, location sans
chauffeur, transporteur, sous-traiter, autonomie, permis C, porteur, vides, temps de conduite, repos journalier.

## 4 bis. Questions au fil — À PROPOSER À TRISTAN AVANT DE CONSTRUIRE (règle du 10/10/2026)

Ce brief a été écrit avant la règle. **Avant d'écrire la moindre ligne de la séance**, Claude Code (ou Cowork) propose à
Tristan le tableau de `docs/briefs/MODELE.md` §4 bis : au moins 4 gestes de travail où une question peut arriver, dont une
d'éco-droit appliquée au cas ; jamais une question qui donne d'avance la réponse d'un jalon (sinon corrigée au bilan).
Tristan en garde 2 à 4 ; la part des questions notées (3 à 5 points sur 20) se prend sur les jalons, et le barème du §5
est revu en conséquence (pondération sur 20 : `docs/briefs/NOTATION-ponderation.md`, lot 2). Les pistes « Pour réfléchir »
du §9 sont une bonne source de questions.

### 4 ter. Avant de commencer — À PROPOSER AUSSI

Banque de questions de l'écran d'ouverture (`docs/briefs/MOTEUR-avant-de-commencer.md`, `MODELE.md` §4 ter) :
préparation de l'exercice, 2 ou 3 d'économie-droit appliquées au cas, images si la séance fait découvrir un matériel ;
au moins le double de ce qu'on tire ; validée par Tristan avant construction. Modèle : la banque d'ENT-6.2.

## 5. Jalons / notation (13)

Jalons 1-5 lus sur `v1`, 6-11 sur `v2`, 12-13 sur la fiche. Un jalon de planning est vrai si **toutes** les tournées sont posées
et affectées **et** aucune de ses règles n'a de problème (moteur). Rien de vrai avant l'envoi ; **inaction 0 / 13** (envoyer deux
fois à vide = 0 / 11 ; la fiche ne s'ouvre qu'après le 2e envoi et refuse les cases vides).

| # | Jalon | Règles (ids proposés) | Piège qui le fait tomber (calage) |
|---|---|---|---|
| 1 / 6 | Chaque tournée a un chauffeur et un camion | condition `tous` | une tournée non posée ou sans camion |
| 2 / 7 | Chauffeurs : une tournée chacun, avec le bon permis (le transporteur à partir de 07:00) | `uneTourneeChauffeur`, `permis`, `transporteurDispo` | Julien sur un 16 t ; un chauffeur sur deux tournées ; Rouen au transporteur à 06:30 |
| 3 / 8 | Camions : une tournée chacun, du bon type, assez d'autonomie, disponibles | `uneTourneeCamion`, `typeCamion`, `autonomie`, `disponible` | côte ou Rouen en électrique ; Versailles en thermique ; Mantes sur VL ; **T2 gardé** ; **Mantes sur E2 (80 km)** ; camion loué avant 09:00 |
| 4 / 9 | Fenêtres respectées | `fenetre` | côte partie après 07:00 ; Sébastien sur Rouen à 09:00 ; **Rouen sur le camion loué à 09:00** |
| 5 / 10 | Conduite et repos (4 h 30, 9 h, 11 h) | `repos`, `pause`, `jour` | **Sébastien avant 09:00** ; Amandine sur la côte à 06:00 |
| 11 | Aucune tournée avec des vides confiée au transporteur | `vides` (critère, phase 2) | **côte ou Mantes au transporteur** |
| 12 | Fiche : Rouen (transporteur) = lettre de voiture, pas de contrat de location, pas France Boissons | fiche | « Transportée par FB : oui » ; lettre de voiture « non » |
| 13 | Fiche : Mantes (camion loué) = France Boissons, contrat de location, **pas de lettre de voiture** | fiche | **« camion loué = lettre de voiture »** ; « Transportée par FB : non » |

Remarques :
- Mettre un chauffeur sur deux tournées fait tomber 2 / 7 **et** 5 / 10 (deux tournées = plus de 4 h 30 de conduite sans pause) :
  assumé (les deux règles sont réellement enfreintes).
- Le jalon 11 n'existe qu'après l'aléa (§7.3).
- Aucun jalon ne juge un attendu : les règles sont jugées. Les solutions de référence (§4) servent aux tests, écrites à la main.

## 6. Contenu

`contenus/france-boissons-ent68.js` : planning (`id: 'fb-chauffeurs'`, libellé « Planning des chauffeurs »), règles, jalons,
aléa, fiche, messages, lexique, `SOLUTION` (v1 et v2 de référence, en créneaux). Univers dans le fichier commun de France
Boissons (Karim, chauffeurs d'ENT-6.3 : **ne pas redéclarer** les prénoms s'ils y sont déjà).
Valeurs attendues de la fiche **calculées** depuis les données (ligne au transporteur → lettre de voiture ; ligne sur un camion
loué → contrat de location), jamais recopiées.

Esquisse des règles (types du moteur, API de `FICHE-SEANCE.md`) :

```js
regles: [
  { id: 'uneTourneeChauffeur', type: 'critere', verifier: (x) => /* une ligne qui porte 2 tournées ou plus */ },
  { id: 'permis', type: 'compatible', sur: 'affectation', exige: (k, c) => /* chauffeur de la carte */ ... },  // voir note
  { id: 'transporteurDispo', type: 'disponible', sur: 'ligne' },          // ligne Transporteur : dispo '07:00'
  { id: 'uneTourneeCamion', type: 'critere', verifier: (x) => /* un camion choisi pour 2 tournées */ },
  { id: 'typeCamion', type: 'compatible', sur: 'affectation', exige: (k, c) => c.camion === 'electrique' ? k.electrique : c.camion === 'porteur' ? k.genre === 'porteur' : true },
  { id: 'autonomie', type: 'compatible', sur: 'affectation', exige: (k, c) => !k.electrique || c.km <= k.autonomie },
  { id: 'disponible', type: 'disponible', sur: 'affectation' },         // T2 en panne, location dès 09:00
  { id: 'fenetre', type: 'fenetre', marque: 'ligne' },
  { id: 'repos', type: 'reposDepuisVeille', repos: 11 * 60 },
  { id: 'pause', type: 'cumulSansPause', max: 4 * 60 + 30 },            // sur la CONDUITE (§7.1)
  { id: 'jour', type: 'plafond', max: 9 * 60 },                          // idem
  { id: 'vides', type: 'critere', verifier: (x) => /* tournée avec vides sur la ligne Transporteur */ },
]
```

Note sur `permis` : la règle porte sur le **couple** chauffeur × camion (permis B + porteur). `compatible` ne voit qu'une
ressource : utiliser un `critere` (il reçoit `I` avec `r` et `k`), ou le §7.4. Les messages disent **que**, jamais **de combien**
(« E2 n'a pas assez d'autonomie pour cette tournée », jamais « il manque 10 km »).

Aléa (existe déjà dans le moteur, vérifié en lecture le 05/10 : `donnees()`, `alea.ressources` modifie une ligne **ou** une
ressource, `ajoutRessources` et `ajoutLignes` existent) :

```js
alea: { de: 'Karim — exploitation France Boissons', texte: '…',
  ressources: { T2: { dispo: '19:00', panne: true }, E2: { autonomie: 80 } },
  ajoutRessources: [{ id: 'LOC', nom: 'Porteur de location', genre: 'porteur', electrique: false, permis: 'C', dispo: '09:00' }],
  ajoutLignes: [{ id: 'TR', nom: 'Transporteur (fictif)', dispo: '07:00', porteAffectation: true }] }   // §7.2
```

## 7. Demandes au moteur (vue Planning ; une séance n'écrit rien dans `core/`)

1. **Champ `conduite` par carte** (décision 58) : `cumulSansPause` et `plafond` lisent `c.conduite` (minutes) à la place de la
   durée du bloc quand il est présent (repli : la durée). Le compteur « conduite X / 9 h » du guidage aussi. *Indispensable* : sans
   lui, la côte (8 h 30 de service) ferait tomber 4 h 30 et 9 h.
2. **Ligne qui porte sa seconde ressource** (`porteAffectation: true` sur une ligne, ici « Transporteur ») : pas de bulle, la
   carte y compte comme affectée (condition `tous`), les règles `sur: 'affectation'` l'ignorent, rien dans « Utilisation des
   camions » (ou une mention « camion du transporteur »). *Repli sans moteur* : une ressource « Camion du transporteur »
   (`ajoutRessources`) et un `critere` qui lie ligne TR ⇔ ce camion ; plus lourd pour l'élève (une bulle inutile). **Défaut :
   la demande moteur.**
3. **Jalon d'une seule version** (`versions: [2]` sur un jalon) : le jalon 11 n'existe qu'après l'aléa (sinon le barème passe à 14
   et le jalon 11 de la v1 serait vrai sans rien faire de plus). *Repli sans moteur* : filtrer `etapesPlanning(P)` pour retirer
   `v1-vides` (le bilan de la vue l'afficherait quand même en v1).
4. *(Facultatif)* **Règle sur le couple** ligne × seconde ressource (`compatible` avec `exige(ligne, ressource, carte)`), pour le
   permis. Repli : `critere` (aucun moteur à toucher). **Défaut : le repli.**
5. *(Facultatif)* **Une carte par ligne / par ressource** (type `uneSeule`), si Claude Code juge le `critere` trop lourd.
   **Défaut : `critere`.**

Ce qui existe déjà et sert tel quel (vérifié en lecture du code le 05/10) : modification d'une ressource par l'aléa
(`alea.ressources`, autonomie d'E2 et panne de T2), ajout d'une ressource (`ajoutRessources`) et d'une ligne (`ajoutLignes`),
indisponibilité hachurée, `apresPlanning(id, 2)` pour ouvrir la fiche, fiche `ouinon` + `encadre` avec `quand`.

## 8. Tests attendus

Bloc `france-boissons` (cas préfixés « ENT-6.8 ») ; les demandes moteur ont leurs cas dans le bloc `planning`.
- **Parcours juste 13 / 13** avec la solution de référence **écrite à la main** (v1 : Lucas côte T1 06:00 · Amandine Rouen T2
  06:30 · Fatou Versailles E1 06:30 · Sébastien Mantes E2 09:00 · Julien Évreux VL 06:00 ; v2 : Lucas côte T1 06:00 · Rouen
  Transporteur 07:00 · Fatou Versailles E1 06:30 · Sébastien Mantes Location 09:00 · Julien Évreux VL 06:00 ; fiche juste).
- **Une 2e solution juste** différente (ex. v2 : Amandine côte T1 06:30, Rouen transporteur 08:30, Sébastien Versailles E1 09:00,
  Lucas Mantes Location 09:00, Fatou Évreux VL 06:00) → 13 / 13 : les jalons jugent les règles.
- **Le 1er envoi juste, gardé tel quel en v2** → jalon 8 faux seul.
- **Chaque piège du tableau §5** fait tomber **son** jalon et **lui seul** (sauf « deux tournées » : 7 et 10, nommés).
  Valeurs écrites à la main ; liste et résultats attendus dans `calage-6.8-resultats.txt`.
- **Inaction** : deux envois à vide → 0 / 11, fiche jamais ouverte → 0 / 13 ; la fiche n'apparaît pas avant le 2e envoi.
- **Fiche** : Mantes « lettre de voiture : oui » → jalon 13 faux ; Rouen « FB : oui » → jalon 12 faux ; cases vides → envoi refusé.
- **« Que, pas de combien »** : aucun message de problème ne contient un nombre de km, de minutes ou une heure calculée.
- **La carte de Rouen** n'affiche ni « 13:00 » ni « 08:30 ».
- **Entraînement** : rien de signalé avant « Vérifier » ; pas de bande ambrée, ni de reprise calculée, ni de compteur.
- **Sabotages** (dans les deux sens) : faire lire la durée de service au lieu de `conduite` → jalons 5 et 10 tombent sur la côte (prouve le §7.1) ; retirer la règle
  `vides` → le piège « côte au transporteur » ne fait plus rien tomber (le test doit échouer).
- Aucune requête hors du domaine.

## 9. Supports

- Trame courte (Cowork, **après validation à l'écran**) : lexique ; les règles de la journée ; **compte propre / compte d'autrui**
  avec les trois documents (BL, contrat de location, lettre de voiture : vérifiés, arrêté du 9/11/1999) ; la grille vierge.
  La trame dit le réel : électriques FB loués, 16 t, ≈ 200 km (vérifié) ; tournées, horaires, pannes, loueur et transporteur
  construits.
- Corrigé `contenus/corriges/ENT-6.8.js` : une solution v1 et v2 + la fiche ; calculé (jugé par le moteur).
- Questions « Pour réfléchir » de la trame (règle 32, reprises du cadrage) : « Tu as gardé la tournée de la côte chez France
  Boissons : qui reprendra les fûts vides de Malo ce soir si elle part chez un transporteur ? » ; « Lucas part pour 8 h 30 sur la
  côte : que se passerait-il pour la commande de Malo si tu l'avais mis sur un électrique ? »

## 10. Critères de validation par Tristan

À l'écran (1366 × 768) : le planning se joue comme ENT-5.7 sans aides ; le message de Karim arrive après le 1er envoi ; la ligne
« Transporteur » apparaît **sans bulle** ; le porteur de location est hachuré avant 09:00 et T2 toute la journée ; « Vérifier »
signale « E2 n'a pas assez d'autonomie » sur Mantes sans donner de chiffre ; la fiche s'ouvre après le 2e envoi et le piège
« camion loué = lettre de voiture » fait tomber le jalon 13 ; la séance tient en 45 min.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Karim situe la séance : « 30 tournées partent ce matin, je t'en confie 5 » ; camions électriques appuyés sur la vidéo de Buchelay (Tristan, 07/10).

- [x] **Règle « un chauffeur et un camion font une seule tournée dans la journée »** : **validée par Tristan le 05/10/2026**. *Pourquoi* : sans elle, le
  calage trouve un trou qui vide la séance de son sens : **E1 fait Mantes (90 km) puis Versailles (110 km) = 200 km**, conduit par
  deux chauffeurs différents, et le camion de location ne sert plus ; un chauffeur peut aussi enchaîner 6 h + 7 h de service.
  272 premiers envois justes sans la règle, **48 avec** ; après l'imprévu, 96 sans (dont 60 où Mantes reste sur E1), **36 avec**,
  tous avec Mantes sur la location. *Autre voie possible* : une règle de **temps de service** (10 h par jour) + Versailles à
  120 km ; plus réaliste, plus dure à lire en 2de. Le jalon 2 / 7 devient « une tournée chacun » au lieu de « une tournée à la fois ».
- [ ] **Document du camion loué : BL + contrat de location** (correction vérifiée de la décision 61, qui disait « BL seul »).
  Fiche en **3 colonnes oui / non** (FB transporte ? · lettre de voiture ? · contrat de location ?) au lieu de deux listes
  (**oui**).
- [ ] « Connaît la côte » (repère d'ENT-6.3) : **affiché comme information, pas une règle**. Si c'était une règle, la côte n'irait
  qu'à Lucas ou Amandine (le calage le recompterait).
- [ ] La fiche ne note que Rouen et Mantes (jalons 12-13, validés) ; les 3 autres lignes servent de contraste (**non notées**).
- [ ] Le message de Karim après le 2e envoi donne l'organisation retenue (**oui**, la fiche ne pénalise pas une 2e fois le planning).
- [ ] Noms du **loueur** et du **transporteur** (fictifs, à vérifier libres ; Cowork propose avant l'implémentation) ; organisateur
  du concert de Rouen (fictif).
- [ ] Textes de Karim (accueil, imprévu, après envoi, fin) : proposés, à relire à l'écran.
- [ ] Durée réelle (≈ 45 min).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
