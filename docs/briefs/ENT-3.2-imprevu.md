# Brief de chantier — ENT-3.2 Un imprévu en cours de journée

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-boost.md puis implémente le brief ENT-3.2-imprevu. Annonce la durée avant de commencer, propose-moi 2 ou 3 imprévus chiffrés avec le script de calage, et attends mon choix avant de coder.
> ```

**Statut** : **livré**, `pret: true` et déjà ouverte aux élèves (statut mis à jour le 06/10/2026)
**Date du brief** : 03/10/2026
**Maquette validée** : « Maquette imprévu ENT-3.2 » (Cowork, 03/10/2026) : le message du responsable et l'écran Tournée.
**Séance concernée** : ENT-3.2 `boost-ent32`, **aujourd'hui `pret: false`** (cachée aux élèves) : on peut donc la
modifier sans risque pour la classe. `id` et `transportId` `boost-ent32` **ne changent jamais**.
**À faire après** : le brief `ENT-3.1-refonte-carte.md` (un seul chantier moteur à la fois) ; **avant ou avec**
`ENT-3.x-feuille-moins-guidee.md` pour les données de la journée (voir §5).

## 1. Pourquoi

Retour de Tristan : ENT-3.2 ressemble trop à ENT-3.1 (même geste : construire une tournée sous contrainte). Parmi trois pistes
(imprévu, contraintes multiples, deux vélos-cargos), **Tristan choisit l'imprévu** : en 3.1 on construit une fois, en 3.2
l'élève **s'adapte**. C'est un vrai geste du métier et il demande peu de moteur nouveau.

## 2. Décisions de Tristan (03/10/2026)

1. **L'imprévu arrive quand la tournée de la phase 1 tient tout** : un message du responsable change la journée.
2. **Deux changements ensemble : un client annule** (la charge change) **et un créneau est avancé** (l'ordre change).
   Exemple de la maquette : Atelier Ribot annule ; la Pâtisserie Arnaud passe de « avant 14 h 45 » à « avant 14 h 30 ». Les valeurs exactes sont
   **fixées par le script de calage, pas à la main** (§4).
3. Message rédigé en **texte courant**, comme un vrai message : l'élève cherche ce qui change au lieu de recevoir un tableau.
4. Le client annulé est **barré** et ne peut plus être chargé ; le créneau modifié est repéré ; les jauges restent muettes.
5. La carte, la feuille de calcul et « Recommencer la tournée » restent ; **« Recommencer » remet la tournée de départ de la phase en cours**.

## 3. Déroulé

1. **Phase 1** : comme aujourd'hui (repérer les nouveaux clients, écarter un client, ordonner, calculer, jalons 1 à 8 actuels).
2. **Déclencheur** : dès que la tournée de la phase 1 **tient tout** (même condition que le jalon `trajet5` : client à quai juste,
   charge, train, créneau, chaîne complète). Le message arrive alors dans la messagerie (notification « Nouveau message »).
3. **Phase 2** : le client annulé est barré, le créneau modifié ; la feuille suit la tournée affichée ; l'élève replanifie et recalcule.
4. **Fin** : jalons de la phase 1 + deux jalons de la phase 2.

## 4. Contenu (données) : propriétés à garantir, valeurs à calculer

Relancer `outils/carte/calibrer.mjs` (énumération des ordres) pour **choisir** le client qui annule et la nouvelle limite, de façon que :
- **l'ancienne tournée (celle de la phase 1) ne tienne plus** (sinon l'imprévu est sans effet) ;
- **une nouvelle tournée qui tient tout existe** (charge, train, nouveau créneau) ;
- **la meilleure nouvelle tournée soit différente de la meilleure de la phase 1** ;
- **ne pas replanifier ne rapporte aucun point de phase 2** (jalon qui ne récompense pas l'inaction) ;
- l'optimum de la phase 2 est **recalculé dans le contenu** (comme `optimum()` de la phase 1), jamais recopié.
Écarter l'idée d'un client qui annule sans conséquence (si le client annulé est justement celui qui était à quai, rien ne change).
**Tout est construit** (clients, message, chiffres) : le dire dans l'en-tête du contenu ; Boost reste documentée en tête de `contenus/boost.js`.

## 5. Dépendance avec « données qui changent »

Règle de Tristan (03/10) : les données (départ, train, vitesse, temps par arrêt, charge, créneau) changent d'une séance à l'autre ;
3.2 et 3.3 gardent la même journée. **Si le chantier `ENT-3.x-feuille-moins-guidee` est fait avant**, la journée de 3.2 a ses
propres valeurs : l'imprévu s'y calibre. **Sinon** : calibrer l'imprévu sur la journée actuelle, puis recaler quand les données changent.
ENT-3.3 reprend la même journée que 3.2 : **vérifier qu'elle n'est pas cassée** (3.3 importe la carte, la feuille et l'optimum de 3.2) :
l'imprévu ne doit exister **que dans 3.2**, pas dans 3.3.

## 6. Demandes au moteur (chantier moteur dédié, un seul à la fois)

1. **Message déclenché par une condition** : aujourd'hui `volet.semer` sème des messages **une seule fois, à l'ouverture**. Il faut
   un message qui **arrive plus tard**, quand une condition de la base de l'élève devient vraie (la tournée tient tout), **une seule fois**,
   marqué dans la base (comme `etatInitial`), qui ne se rejoue jamais au remontage ni à la reconnexion. **Vérifier d'abord** si un
   mécanisme existe (volet, messagerie) avant d'en créer un.
2. **Données de la journée qui changent en cours de séance** : client annulé (barré, non chargeable, absent du poids total et de
   l'optimum) et limite de créneau déplacée. Une **phase** déclarée par la séance, lue par le bilan de `tournee.js`, de façon que la
   feuille, les jauges, `exigeConforme` et les jalons lisent **les données de la phase en cours**. En dehors de ENT-3.2, rien ne change.
3. **Notification** « Nouveau message » en tête de l'écran Tournée (réutiliser le compteur de messagerie existant s'il y en a un).
4. **« Recommencer »** : remet l'état de départ **de la phase en cours** (pas celui de la phase 1).

## 7. Jalons

Les 8 jalons actuels (phase 1) **ne changent pas**. Ajouter **deux jalons de phase 2** (barème 8 → 10 ; 2 points sur 20 chacun si pas de
`notation`, à vérifier) :

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 9 | **Replanification** : la nouvelle tournée tient tout (client annulé absent, charge, train, nouveau créneau, chaîne complète) | `VTOUR.bilan` de la phase 2 | ko si la tournée de la phase 1 est laissée telle quelle (**ne pas récompenser l'inaction**) ; exige le départ posé |
| 10 | **Nouveau trajet** : à moins de 10 % de la meilleure nouvelle tournée | optimum de la phase 2 **recalculé** | tournée qui ne tient pas tout = ko |

Un jalon de phase 2 est **« en attente »** tant que le message n'est pas arrivé (jamais accusé avant que l'élève ait pu agir). Un élève qui
ne finit pas la phase 1 n'a ni message ni phase 2.

## 8. Tests attendus

Bloc `boost`, cas préfixés « ENT-3.2 ». **Les valeurs attendues sont écrites à la main dans le test** (pas recopiées du code).
- le message **n'est pas là** à l'ouverture ; il **arrive** quand la tournée tient tout ; **une seule fois** ; il survit au remontage et à la reconnexion ;
- la tournée de phase 1 laissée intacte après le message : jalons 9 et 10 ko ; la bonne replanification : ok ; replanification qui tient tout mais à plus de 10 % : 10 ko seul ;
- client annulé barré, **non chargeable**, absent du poids total ; créneau modifié repéré ; jauges muettes **sans fuite** (ni écran, ni refus) ;
- les propriétés du §4 (ancienne tournée fausse, nouvelle tournée possible, optimum différent) **tenues par un test qui lance le calage** ;
- ENT-3.3 non régressée ; ENT-3.1 et la page d'essai inchangées ; `test-seances.mjs` vert.
**Sabotages** : message rejoué au remontage ; message envoyé à l'ouverture ; client annulé encore chargeable ; phase 2 qui lit les données de la phase 1 ;
optimum de phase 2 recopié ; jalon 9 qui accepte la tournée d'origine.
**Alerte 7** : des tests d'ENT-3.2 seront réécrits : **le dire explicitement à Tristan**.

## 9. Supports

Pas de trame élève (déclarer = valider). Corrigé : à écrire après validation à l'écran. `pret: false` jusqu'à validation de Tristan à l'écran.

## 10. Critères de validation par Tristan

Jouer ENT-3.2 jusqu'au bout : (1) à l'ouverture, aucun message d'imprévu ; (2) une fois ma première tournée juste, le message arrive, une seule fois ; (3) Atelier
Ribot (ou le client choisi) est barré et je ne peux plus le charger ; (4) ma tournée d'avant ne tient plus et **rien à l'écran ne me le dit** : je dois recalculer ;
(5) replanifier me fait gagner les deux jalons ; ne rien faire ne me les donne pas ; (6) « Recommencer » remet la tournée de départ de la phase 2.

## 11. Questions ouvertes

- [x] *(Tristan, 03/10 : « Il est 14 h 00 » dans le texte)* Le message arrive-t-il avec un délai fictif (« il est 14 h 00 »), ou sans heure ? (la maquette met l'heure dans le texte.)
- [x] *(Tristan, 03/10 : 10 jalons)* Barème : rester à 8 jalons (les deux nouveaux remplaçant `trajet10`/`trajet5` ?) ou passer à 10 ? Recommandation : 10.
- [x] *(hors périmètre, gardé pour une autre séance)* Un client urgent qui s'ajoute (avec un point à situer) : hors périmètre, à garder pour une autre séance ?

## 12. Moteur touché et travail en parallèle *(ajouté le 03/10/2026)*

**Chantier C du plan Boost. À lancer après la consigne d'ENT-3.3 (A) ; le plus lourd côté moteur.**

| Partie | Fichiers touchés | Nature |
|---|---|---|
| Message déclenché par une condition | `core/types/entreprise.js` (volet / messagerie) | **moteur** |
| Phases : client annulé, créneau déplacé, « Recommencer » par phase | `core/types/tournee.js` (bilan, état), `core/types/carte.js` (client barré, créneau repéré) | **moteur** |
| Notification « Nouveau message » | `core/types/tournee.js`, `styles/base.css` | **moteur (petit)** |
| Journée, message, jalons 9 et 10, optimum de phase 2 | `contenus/boost-ent32.js`, `activites/boost-ent32.js` | contenu |
| Calage | `outils/carte/calibrer.mjs` | outil |
| Tests | `outils/test/boost.mjs`, `outils/test/carte.mjs` | à écrire |

- **Peut se faire en même temps que** : le **choix du client qui annule et de la nouvelle limite** (script de calage, sans moteur) ; la rédaction du message ; la trame élève de 3.2 plus tard.
- **Ne pas lancer en même temps** que A (consigne 3.3 : même `tournee.js`) ni que D (feuille de calcul : même `tournee.js` et `grille.js`). Un seul chantier moteur à la fois.
- **Dépend de A** si on veut réutiliser les pastilles d'avancement. **Interaction avec D** : si D passe avant, la journée de 3.2 a d'autres valeurs et l'imprévu se calibre dessus ; sinon il faudra le **recaler** après D.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
  - créé `contenus/boost-ent32-imprevu.js` (les données de l'imprévu, sans import : lues par la séance ET par le calage) ;
  - moteur : `core/types/tournee.js` (option `phases`, `passerPhase`, bilan par phase, « Recommencer » par phase,
    bandeau « Nouveau message », commande annulée barrée, créneau changé repéré), `core/types/entreprise.js`
    (`volet.declencheurs` : message déclenché par une condition, une seule fois, marqué dans `db.volets`),
    `core/types/carte.js` (rond barré, sans cible), `styles/base.css` (quatre petites règles, aucune variable touchée) ;
  - séance : `contenus/boost-ent32.js` (feuille qui suit la phase, `optimumImprevu()` recalculé, `TOURNEE_IMPREVU`,
    message, jalons `replanif` et `trajet2`), `activites/boost-ent32.js` (déclare `TOURNEE_IMPREVU`) ;
  - outil : `outils/carte/calibrer.mjs` (vérifie aussi l'imprévu ; sans argument = ENT-3.2 et son imprévu) ;
  - tests : `outils/test/boost.mjs` ; fiche `activites/FICHE-SEANCE.md` (une ligne sur `declencheurs`).
- **Écarts par rapport au brief** :
  - l'exemple de la maquette (Pâtisserie avant 14 h 30) est impossible (arrivée au plus tôt 14 h 34), et avancer le
    créneau de la Pâtisserie ne force rien (la meilleure tournée de la phase 1 commence chez elle : 312 tournées justes
    sur 371 tiendraient encore). Le créneau **change de client** : option 1 choisie par Tristan ;
  - déclencheur : tournée qui tient tout **et** feuille vérifiée juste (choix de Tristan), pas la seule condition de `trajet5` ;
  - « ancienne tournée » = la tournée de l'élève **client annulé retiré** (le moteur le retire de lui-même à l'arrivée du message).
- **Décisions prises en route** : voir `docs/decisions.md` (03/10/2026, trois lignes ENT-3.2). En bref : Cave fixée à quai par
  le message ; 14 h 00 ; 10 jalons ; jalons de la phase 1 figés à l'arrivée du message (ils lisent `phase.avant`) ;
  écran sans verdict en phase 2 ; ligne de la commande annulée gardée à 0 kg dans la feuille ; une tournée identique à celle
  de l'arrivée du message vaut « ko » au jalon 9 ; l'accueil n'annonce pas l'imprévu.
- **Tests** : bloc `boost`, 3 cas d'ENT-3.2 **réécrits** (barème 8 → 10, suivi 0/10, « 8 jalons sur 8 » devenu « les 8 jalons
  de la phase 1 ») et 16 cas ajoutés pour ENT-3.2. Le cas `carte : le calage d'ENT-3.2 tient` lance `calibrer.mjs` sans argument :
  il vérifie désormais aussi l'imprévu. Un cas « Moteur entreprise » ajouté (message déclenché une seule fois même si la
  condition reste vraie). Suite complète 362/362. Huit sabotages éprouvés, chacun fait tomber au moins un cas : message
  rejoué au remontage, message à l'ouverture, client annulé cliquable, phase 2 sur les données de la phase 1, optimum de
  phase 2 recopié, garde du jalon 9 retirée, phase 2 qui parle, « Recommencer » qui vide la tournée.
- **Commits** : voir l'historique (« ENT-3.2 : un imprévu en cours de journée … »).
- **Reste ouvert** :
  - validation à l'écran par Tristan (critères du §10), puis `pret: true` ;
  - corrigé à écrire après validation ;
  - à recaler si le chantier D (données qui changent) passe après : relancer `node outils/carte/calibrer.mjs` ;
  - `docs/briefs/COORDINATION-boost.md` (ligne C) est en cours de modification par une autre session : statut à mettre à jour.
