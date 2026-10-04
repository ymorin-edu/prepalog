# Brief de séance — ENT-5.3 Smoby, sécurité au quai et premier déchargement (2de, poste C — cariste, guidage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.3-smoby-reception.md (il faut que les lots 2, 3, 4, 5 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (section « Séance C1 »).
**Modèle** : Opus.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.3 |
| `id` | `smoby-reception` |
| Titre / desc | « Smoby — premier déchargement » / « Cariste au quai de réception de la plateforme de Moirans : vérifier la sécurité avant de décharger, décharger au chariot un camion de l'usine d'Arinthod, contrôler 4 palettes de jouets et porter des réserves précises. » |
| Rubrique | logisim, entreprise n° 5 Smoby |
| Niveau(x) | 2de |
| Compétence(s) | **C1.2** (sécurité), **C1.4** (réception ; C1.4.2 litige) ; domaines D4, D5 |
| Temps pédagogique | guidage ; `parcours: 'coeur'` |
| Notation | jalons + note sur 20 |
| Barème | 10 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : Smoby, usine d'**Arinthod** (principal site de production : soufflage, injection, montage) et plateforme
  logistique de **Moirans-en-Montagne** (hebdo39.net) ; gammes réelles **Smoby Life, Tefal, Cotoons, Little Smoby,
  Black+Decker**, fabrication française (smoby.com) ; **maison Neo Jura Lodge** (fiche produit smoby.com). Sécurité au quai :
  immobilisation du véhicule (cales), moteur coupé, chauffeur hors de la zone, niveleur, plancher, éclairage, EPI ; « plus de
  2/3 des accidents surviennent véhicule à l'arrêt » (Officiel Prévention). CACES 3 = chariot frontal pour décharger.
- **Construit** : le flux usine → plateforme (cohérent avec les sources, pas décrit mot pour mot), quai n° 2, horaire, le
  transporteur de la navette « Transports Jurassiens (fictif) », Bruno le chef de quai (prénom inventé), références,
  quantités, défauts.
- **Photos** (`docs/briefs/smoby/LISEZMOI.md`, empreintes vérifiées, marques réelles effacées par Cowork) :
  **`quai-remorques.jpg`** (arrivée du camion), **`quai-exterieur.jpg`** (étape « Avant de décharger » : niveleurs,
  butoirs), **`quai-interieur.jpg`** (porte ouverte, cariste de dos au chariot dans la remorque : déchargement — décor fixe
  proposé à la place de la « porte qui se lève », voir le `LISEZMOI`). Aucun visage.

## 3. Objectif pédagogique

L'élève (Yanis, recruté en ENT-5.1, sur son premier jour) sait **vérifier la sécurité avant de décharger et refuser de
commencer quand un point n'est pas bon**, puis **contrôler une réception** (compter, faire le tour, décider) et **écrire une
réserve précise**. Initiation de C1.2 et C1.4 ; reprise en 1re avec Picard (ENT-4.x).

## 4. Déroulé

Accueil : message de Bruno, chef de quai (texte proposé) : « Bonjour Yanis, bienvenue au quai ! / Ton premier camion arrive à
**14 h 00** au **quai 2** : la navette de l'**usine d'Arinthod**, 4 palettes de jouets. / Avant de décharger, on vérifie
toujours la sécurité. Bruno » — **mercredi 9 décembre 2026**, après-midi du premier jour (dernière étape du programme vu en
ENT-5.2).

1. **Avant de décharger — constater la situation** (lot 5 du brief moteur). Scène (3 lignes) : « La navette d'Arinthod est à
   quai. Le chauffeur a coupé le moteur et t'a remis ses clés ; il attend dans le local chauffeurs. Le niveleur est posé, la
   remorque est éclairée. Tu portes tes chaussures de sécurité et ton gilet. **Les roues arrière ne sont pas calées.** »
   *(la dernière phrase doit être lisible mais pas soulignée : la rédiger comme les autres)*

   | Point | Situation |
   |---|---|
   | Camion calé (cale ou bloqueur de roue) | **pas OK** |
   | Moteur coupé, clés remises | OK |
   | Chauffeur hors de la zone (local chauffeurs) | OK |
   | Niveleur bien posé | OK |
   | Plancher de la remorque en bon état et éclairé | OK |
   | EPI portés | OK |

   « Signaler au chef de quai » → Bruno : « Bien vu ! Je fais poser la cale. C'est bon, tu peux décharger. » Décharger sans
   avoir signalé : en guidage, Bruno arrête l'élève (« Stop ! Le camion n'est pas calé : il peut bouger pendant que tu es
   dedans. ») ; l'élève peut signaler puis reprendre ; le jalon 1 reste faux.
2. **Déchargement** : vue quai **sans froid** (lot 4), **Yanis décharge au chariot frontal** (silhouette sans visage), 4
   palettes. Durée simulée sans enjeu (pas de chrono, pas de note de rapidité).
3. **Contrôle des palettes** (aides de guidage toutes allumées : règle des couches, détail du comptage, repère P1, chef de
   quai). BL n° **ARI-26-1209** (construit), désignations de la **gamme réelle**, références construites :

   | Palette | Produit (désignation) | Cartons (W × D × L) | BL | Réel | Aléa | Attendu |
   |---|---|---|---|---|---|---|
   | P1 | Maison Neo Jura Lodge | 2 × 2 × 2 | 8 | 8 | aucun | Accepter |
   | P2 | Cuisine Tefal | 4 × 3 × 4, 3 absents en haut | 45 | 45 | couche du dessus incomplète **mais conforme** (piège de comptage) | Accepter |
   | P3 | Établi Black+Decker | 4 × 3 × 3 | 36 | 36 | **1 carton écrasé, visible seulement de l'arrière** (faire le tour) | Réserves — carton endommagé (1) |
   | P4 | Porteur Little Smoby | 3 × 3 × 4 | 36 | 34 | **2 manquants** dont un dans le coin du fond | Réserves — manquant (2) |

   Motifs proposés : conforme · carton endommagé · manquant (pas de température, pas de « produit différent » en S1).
4. **Réserves sur le BL** (P3, P4 : nombre de cartons), **pas de « sous réserve de déballage »** (le chef de quai l'explique en
   guidage, comme Picard), **signature du chauffeur**, rentrer les palettes en **zone de réception**.
5. **Message à Bruno par phrases à choisir** (lot 2) : salutation · « J'ai reçu les 4 palettes d'Arinthod. » ·
   « Réserves : 1 carton écrasé sur l'établi Black+Decker et 2 porteurs manquants. » (pièges : « Tout est conforme. » ;
   « Réserves : 2 cartons écrasés. ») · fin. Réponse de Bruno (`apresMail`) : « Merci Yanis. Maintenant, on range : la commande de Noël part demain. »

Mots cliquables : calé / cale, niveleur, EPI, BL, réserve, chariot frontal.

## 5. Jalons / notation (10, validés)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | La cale signalée **avant** de décharger | `securiteSignalee` (lot 5) | faux si l'élève décharge d'abord |
| 2 | Aucune erreur de constat | `securiteConstat` | faux si rien n'est coché |
| 3-6 | Chaque palette comptée et décidée juste | jalons de la vue quai | P2 acceptée malgré la couche incomplète |
| 7-8 | Les deux réserves précises (P3 : 1 ; P4 : 2) | réserves de la vue quai | réserve vide refusée par le chauffeur en guidage |
| 9 | BL signé | vue quai | — |
| 10 | Message juste | `phrasesJustes` (ligne des réserves) | non envoyé = faux |

## 6. Contenu

`contenus/smoby-ent53.js` (quai, palettes, sécurité, messages, étapes), univers dans `contenus/smoby.js`. Quantités et
réserves attendues **calculées** depuis les palettes (`W×D×L − manque`, `bl − réel`, nombre d'avaries).

## 7. Demandes au moteur

`MOTEUR-2de-S1.md` lots 2, 3, 4 (quai sans froid, cariste au chariot), 5 (étape sécurité), 7.

## 8. Tests attendus

Bloc `smoby` : parcours juste 10/10 ; décharger sans signaler → jalon 1 faux ; P2 refusée → jalon faux ; P3 sans faire le
tour → réserve manquée ; P4 comptée 36 → faux ; inaction 0/10 ; aucun élément de froid à l'écran (ticket, sonde, jauge).

## 9. Supports

Trame courte (contexte, lexique, les 6 points de sécurité, le tableau des palettes à remplir) : Cowork, après validation.
Corrigé `contenus/corriges/ENT-5.3.js` (constat attendu, tableau des palettes, réserves écrites), calculé.

## 10. Critères de validation par Tristan

On reconnaît la vue quai de Picard, **sans rien de froid**, avec le chariot ; la scène de sécurité se lit en 30 secondes ;
un élève de 2de finit en 45 min.

## 11. Questions ouvertes (valeur par défaut)

- [ ] Prénom du chef de quai (Bruno).
- [x] Photos : trois photos fournies et retouchées le 04/10 (voir §2).
- [ ] Plus tard : l'étape sécurité passera sur une **image à inspecter** (vue n° 6) — décision de Tristan, après Leroy Merlin.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
