# Brief de chantier — ENT-3.3 Consigne en trois étapes + pastilles d'avancement

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-boost.md puis implémente le brief ENT-3.3-consigne-trois-etapes. Annonce la durée avant de commencer et construis les pastilles et les textes ; dis-moi quels tests tu réécris.
> ```

**Statut** : livré (03/10/2026), à valider à l'écran *(petit chantier : textes + un petit ajout au moteur)*
**Date du brief** : 03/10/2026
**Maquette** : « Maquette consigne ENT-3.3 » (Cowork, 03/10/2026) : trois onglets, avant / après (écran Tournée, mail d'Inès, accueil).
**Séance concernée** : ENT-3.3 `boost-ent33`, **déjà `pret: true`** (livrée, validée à l'écran le 03/10). `id` et
`transportId` `boost-ent33` **ne changent jamais**.

## 1. Pourquoi

Retour de Tristan : la consigne d'ENT-3.3 est peu claire. Elle tient en un bloc d'environ 80 mots qui mélange trois actions
(contrôler, répondre, réparer), trois contraintes et un bouton ; le mail d'Inès place verdicts et chiffres en désordre ;
l'accueil a cinq étapes dont « contrôler » et « calculer » qui sont la même chose.

## 2. Décisions de Tristan (03/10/2026)

1. **Trois étapes courtes, dans l'ordre : 1. Contrôler, 2. Répondre, 3. Réparer**, un verbe et un rôle par étape.
2. **Pastilles d'avancement** : trois pastilles (une par étape) qui **passent au vert quand l'étape est faite**.
   « J'aime beaucoup l'idée des pastilles qui changent en fonction de l'avancement. »
3. Les pastilles **ne disent jamais si c'est juste** (le diagnostic se calcule, il ne se lit pas à l'écran).

## 3. Textes proposés (reprendre ceux de la maquette)

**Écran Tournée** (`TOURNEE.titre` / `TOURNEE.consigne` dans `contenus/boost-ent33.js`) :
*« La tournée d'Inès : contrôler, répondre, réparer »*, puis trois étapes :
1. **Contrôler** : ne touchez pas encore à la carte. Dans la feuille de calcul, calculez le poids chargé, l'heure d'arrivée
   à la gare et l'heure d'arrivée à la Pâtisserie Arnaud.
2. **Répondre** : dans la messagerie, dites à Inès pour chaque contrainte si elle est tenue, avec le chiffre qui le prouve.
3. **Réparer** : sur la carte, corrigez la tournée pour que les trois contraintes soient tenues. « Retrouver la tournée de
   départ » remet celle d'Inès.
Rappel en pastilles discrètes : charge utile, train, créneau : **valeurs lues dans `JOURNEE` / `CRENEAU`, jamais écrites en dur**.

**Mail d'Inès** (`VOLET.semer`) : blocs « Le rappel », « Les commandes », « Ce que j'ai fait », « Ce que j'attends de toi »,
puis **les mêmes six lignes à intitulés, regroupées en trois blocs** : 1. la charge (Charge utile / Poids chargé),
2. le train (Train de … / Arrivée à la gare), 3. le créneau (Créneau de … / Arrivée à la Pâtisserie). Même raisonnement
d'Inès (une commande à quai, l'ordre le plus court). **Les intitulés de `LIGNES_REPONSE` ne changent pas**.

**Accueil** (`ACCUEIL.etapes`), quatre étapes : Lire le message d'Inès · Contrôler (menu Tournée, sans modifier la carte) ·
Répondre (menu Messagerie) · Réparer (menu Tournée).

## 4. Demande au moteur : les pastilles (petit chantier, **Sonnet** suffit)

Un affichage générique de **pastilles d'étapes**, déclaré par la séance, par exemple
`pastilles: [{ libelle: 'Contrôler', fait: (db) => … }, …]`, rendu en tête de la vue Tournée (et seulement si la séance
les déclare : **rien ne change pour ENT-3.1, 3.2, 3.4 ni la page d'essai**). Chaque pastille est grise (à faire) ou verte (fait).
Les trois conditions pour ENT-3.3, **lues dans la base de l'élève, jamais d'un jugement juste/faux** :

| # | Pastille | « Fait » quand… |
|---|---|---|
| 1 | Contrôler | les trois cellules de résultat de la feuille (poids chargé, arrivée à la gare, arrivée chez le client à créneau) contiennent une valeur saisie |
| 2 | Répondre | un message est parti vers Inès (`mails`, dossier `out`, destinataire `INES.mail`) |
| 3 | Réparer | la tournée de l'élève **diffère de l'état initial** posé par `etatInitial` (ordre, quai ou départ) |

Points d'attention : (a) **aucune fuite** : une pastille verte ne doit pas révéler un diagnostic (en 1, « saisie » ≠ « juste ») ;
(b) la pastille 3 ne doit pas passer au vert sur l'état d'Inès intact, et « Recommencer / Retrouver la tournée de départ »
la repasse au gris ; (c) elle survit au redessin, au remontage, à la reconnexion ; (d) accessible : l'état n'est pas
porté par la seule couleur (texte « fait » ou coche) ; (e) charte : le vert plein dit « juste » ailleurs dans le site : **ne pas
utiliser un aplat vert plein pour « fait »** (trait, coche ou bordure verte, voir la charte visuelle de `docs/fiches/`).

## 5. Alertes

- **Séance en ligne** (`pret: true`) : Tristan (03/10/2026) accepte que les modifications soient en ligne tout de suite.
  **Aucun élève n'a encore ouvert ENT-3.3** : le mail d'Inès n'a pas été semé dans leur base, donc personne ne garde l'ancien
  mail et aucune remise à zéro n'est à prévoir. (À vérifier dans le suivi avant de pousser : si un élève l'a ouverte entre-temps,
  le dire à Tristan.)
- **Tests** du bloc `boost` qui comparent des textes du mail ou de l'accueil seront à réécrire : **le dire explicitement**
  (valeurs écrites à la main, pas recopiées du code). Vérifier que `juger` (réponse à Inès) lit toujours les six lignes dans
  leur nouvel ordre (il lit la dernière ligne qui COMMENCE par l'intitulé : ne doit pas dépendre de l'ordre).
- Jauges toujours muettes, jalons inchangés.

## 6. Tests attendus

Bloc `boost`, cas préfixés « ENT-3.3 ». Textes : les trois étapes présentes ; rappel des contraintes = valeurs de `JOURNEE`/`CRENEAU`.
Mail : six intitulés présents, une réponse conforme reste juste. Pastilles : grises à l'ouverture ; 1 verte après saisie des trois
cellules (même fausses) ; 2 verte après envoi ; 3 verte après modification et **grise après « Retrouver la tournée de départ »**.
Sabotages : pastille 3 verte sur l'état initial ; pastille 1 qui lit le juge ; pastilles affichées en ENT-3.2.

## 7. Critères de validation par Tristan

Ouvrir ENT-3.3 : voir la consigne en trois étapes et les trois pastilles grises ; calculer → la première passe au vert sans dire si
c'est juste ; envoyer la réponse → la deuxième ; modifier la tournée → la troisième ; « Retrouver la tournée de départ » → elle
redevient grise. Relire le mail d'Inès : il est plus clair, la réponse se recopie sans hésiter.

## 8. Questions ouvertes

- [ ] Les pastilles sont-elles aussi utiles en ENT-3.2 et 3.4 ? (Hors périmètre : à décider séance par séance.)
- [x] Élèves qui ont déjà le mail d'origine : **aucun** (Tristan, 03/10/2026) ; pas de remise à zéro.

## 9. Moteur touché et travail en parallèle *(ajouté le 03/10/2026)*

**Chantier A du plan Boost** (voir `docs/briefs/COORDINATION-boost.md`). **À lancer en premier : c'est le plus petit.**

| Partie | Fichiers touchés | Nature |
|---|---|---|
| Textes (consigne, mail d'Inès, accueil) | `contenus/boost-ent33.js` | **contenu seul**, aucun moteur |
| Pastilles d'avancement | `core/types/tournee.js` (rendu en tête de la vue), `core/types/entreprise.js` (déclaration), `styles/base.css` (pastilles) | **petit ajout moteur** |
| Tests | `outils/test/boost.mjs` (cas « ENT-3.3 ») | à réécrire en partie (alerte 7) |

- **Peut se faire en même temps que** : la préparation de contenu des autres chantiers (géocodage, calage, textes), car elle ne touche pas ces fichiers.
- **Ne pas lancer en même temps** qu'un autre chantier qui touche `tournee.js`, `entreprise.js` ou `styles/base.css` (imprévu 3.2, feuille de calcul, carte) : conflits probables. **Un seul chantier moteur à la fois.**
- **Les pastilles sont génériques** (`pastilles: […]` déclaré par la séance) : le chantier « imprévu 3.2 » pourra les réutiliser sans rien refaire.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `core/types/tournee.js` (option `pastilles` + `rappel`, rendu en tête de vue, mise à jour en direct), `core/types/entreprise.js` (passe `db` à la vue : 2 lignes), `styles/base.css` (`.tour-etapes`, `.tour-pastille`, `.tour-rappel`, variables existantes : rien à décliner par thème), `contenus/boost-ent33.js` (titre, étapes, rappel, mail, accueil), `outils/test/boost.mjs`, `docs/decisions.md`.
- **Écarts par rapport au brief** : les trois étapes et leurs pastilles forment **une seule liste** (chaque ligne = texte de l'étape + pastille), au lieu d'un paragraphe de consigne plus une rangée de pastilles à côté ; le rappel (charge utile, train, créneau) est une rangée de puces sous la liste. L'ancien paragraphe de consigne n'existe plus. Les trois adresses de cellules (poids chargé, gare, Pâtisserie) sont lues dans les lignes de la feuille, pas écrites en dur.
- **Décisions prises en route** : pastille 1 = trois cellules non vides (espaces seuls refusés) ; elle se met à jour **à la frappe, sans redessin** ; elle reste verte après « Retrouver la tournée de départ » (les formules sont gardées). La pastille 2 compte un message parti vers `INES.mail`, quel qu'en soit le contenu.
- **Tests** : **aucun cas existant réécrit** (les anciens cas qui lisent le mail et l'accueil passent tels quels : six intitulés, Mercerie, « le plus court » y sont toujours). **10 cas ajoutés** au bloc `boost` : étapes + rappel (valeurs écrites à la main), pastilles grises, pastille 1 en direct, état non porté par la couleur seule et pas d'aplat, survie à la reconnexion, pastille 2 (et message à un autre destinataire), pastille 3 (grise sur l'état d'Inès, verte après modification, grise après « Retrouver »), pas de pastilles en ENT-3.2, mail en blocs + réponse recopiée dans l'ordre du mail, accueil. Sabotages éprouvés : pastille 3 verte sur l'état initial, pastille 1 qui lit le juge, pastilles déclarées en ENT-3.2 : chacun fait tomber les cas attendus. Suite entière 346/346.
- **Commits** : voir `git log` (un commit « ENT-3.3 : consigne en trois étapes et pastilles d'avancement »).
- **Reste ouvert** : validation à l'écran par Tristan ; vérifier dans le suivi qu'aucun élève n'a ouvert ENT-3.3 (non vérifiable depuis ici). Pastilles en ENT-3.2 / 3.4 : à décider séance par séance (`pastilles` y est réutilisable sans rien toucher au moteur).
