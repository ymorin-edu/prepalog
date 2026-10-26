# Brief de séance — ENT-13.2 Stellantis Sochaux, les camions du matin (Tle, rentrée)

**Statut** : à construire
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10 (`stellantis/CADRAGE-stellantis-tle.md`)
**Modèle** : Sonnet (vues existantes)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-13.2 |
| `id` | `stellantis-camions-du-matin` |
| Titre / desc | « Stellantis Sochaux — les camions du matin » / « Poser les camions des fournisseurs sur les quais de l'usine, en servant d'abord la pièce qui va manquer à la ligne, puis recevoir un camion de pièces et écrire des réserves précises. » |
| Niveau(x) | `['tle']` |
| Compétence(s) | **C1.3** (préparer la réception), **C1.4** (réceptionner, contrôler, réserves), révision de 1re |
| Temps pédagogique | entraînement (**révision** : réception apprise en 1re avec Picard et Spartoo) |
| Notation | jalons pondérés, `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : 250 camions par jour, 500 fournisseurs ; stock sur place de quelques heures à une journée et demie ; production
  calée ≈ 10 jours à l'avance et approvisionnement planifié en conséquence ; une équipe logistique de ≈ 500 personnes, dont la
  **planification des camions** et la **réception** (Le Trois, 16/07/2026).
- **Construit** : les 5 quais tenus par l'élève (le nombre réel de quais n'est pas connu), les 8 camions du matin, leurs
  fournisseurs (familles génériques : « fournisseur de faisceaux électriques », etc., **aucun nom d'équipementier réel** sauf
  SMRC déjà cité en 13.1, sans pièce), les heures, les palettes, la couverture de chaque pièce à la ligne, le contenu du camion
  contrôlé et son anomalie. Le BL est **reconstitué** (mention en pied).

## 3. Objectif pédagogique

L'élève **refait seul** ce qu'il a appris en 1re : planifier les quais (sans chevauchement, quai adapté), recevoir un camion,
contrôler contre le bon de livraison, **écrire des réserves précises** et signer. Ce que la Terminale ajoute : **la priorité
vient de la ligne**. Un camion dont la pièce ne couvre plus que deux heures de production passe avant un camion arrivé plus
tôt dont la pièce couvre une journée.

## 4. Déroulé (≈ 55 min)

**Mardi 14 septembre 2027, 5 h 30**, bureau de réception du montage. Karim : « 8 camions ce matin, 5 quais. Et la ligne a
besoin de ses pièces. »

1. **Avant de commencer** (non noté) : banque §4 ter.
2. **Le planning des quais** (vue `planning`, mode quais, 5 h 30 - 11 h, pas 15 min ; lignes = quais 1 à 5 ; cartes = 8
   camions). Chaque carte : fournisseur, nombre de palettes, arrivée prévue, **couverture de la pièce à la ligne** (« reste
   2 h 10 de production »). Le quai 5 est réservé aux porteurs ; le quai 2 est déjà pris jusqu'à 6 h 30 (`occupe`). Pas d'aide
   « Vérifier » qui dit les problèmes (entraînement) : correction au bilan.
3. **L'urgence** (au milieu du planning) : message de Karim, le camion de **faisceaux** (couverture 1 h 40) annonce 40 min
   d'avance. L'élève replanifie (`repriseIdentique: 'faux'` : renvoyer le planning sans le toucher ne suffit pas, sauf s'il
   donne déjà un quai libre à la nouvelle heure).
4. **Recevoir le camion de faisceaux** (vue `quai`, `froid: false`, rendu `iso` comme Smoby) : BL de 6 palettes ; une palette
   **filmée déchirée avec cartons écrasés** (réserves), une palette **manquante** au regard du BL (5 livrées sur 6 annoncées) ;
   décisions par palette, réserves précises (nombre, nature, référence), signature du chauffeur.
5. **Le message à Karim** (phrases à choisir) : ce qui est reçu, ce qui manque, combien d'heures la ligne tient encore avec ce
   qui est arrivé (calcul simple sur la couverture : 5 palettes sur 6 → construit).
6. Bilan, photo de fin.

## 4 bis. Questions au fil — propositions

| Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| Premier camion urgent posé | Karim | « Le camion de sièges est arrivé à 5 h 45, celui de faisceaux à 6 h 15. Tu décharges les faisceaux d'abord : pourquoi ? » (sa pièce manquera la première à la ligne / il est plus petit / il est arrivé avant) | fil | notée | tout de suite | la priorité vient de la ligne |
| Camion posé sur le quai 5 (s'il le fait) | Karim | « Pourquoi une semi ne va-t-elle pas au quai 5 ? » (quai pour porteurs / il est trop loin / il est fermé) | fil | notée | tout de suite | ancrée sur son erreur ; sinon posée au bilan |
| Palette écrasée décidée | Karim | « Sur le BL, tu écris "1 palette abîmée". Le fournisseur pourra-t-il contester ? » (oui : il faut le nombre de cartons, la nature du dommage, la référence / non, c'est assez / non, le chauffeur a vu) | fil | notée | au bilan | réserves précises (révision de 1re) |
| ★ BL signé | Karim | « Demain, en ouvrant un carton intact, on découvre des faisceaux coupés. On n'avait rien écrit. Que peut-on faire ? » (envoyer au transporteur une **protestation motivée** dans les **3 jours**, jours fériés non compris, par lettre recommandée / plus rien : le BL est signé / appeler le chauffeur quand on veut) | point d'étape | notée | au bilan | **éco-droit** : contrat de transport, Code de commerce **art. L133-3** (texte relevé le 26/10/2026, à relire mot à mot sur Légifrance avant d'écrire) |

## 4 ter. Avant de commencer (non noté)

| id | Rubrique | Question | Juste | Pièges | À gauche |
|---|---|---|---|---|---|
| bl | réception | Le bon de livraison, c'est… | le document qui dit ce que le fournisseur a envoyé | la facture ; la commande | BL reconstitué (mention en pied) |
| reserve | réception | Une réserve, c'est… | ce qu'on écrit sur le BL quand la livraison n'est pas conforme | un stock de sécurité ; une place réservée au quai | — |
| precise | réception | Une réserve bien écrite dit… | combien, quoi, quel dommage | « sous réserve de déballage » ; « colis abîmés » | — |
| couverture | stock | 12 contenants à la ligne, 3 consommés par heure : la ligne tient… | 4 h (valeurs tirées) | 9 h ; 36 h | — |
| delai | éco-droit | Un dommage découvert après la livraison se signale au transporteur… | dans les 3 jours, par écrit motivé | quand on veut ; jamais | extrait du Code de commerce |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Planning : tous les camions posés, aucun avant son arrivée, aucun chevauchement, quai adapté | planning | 4 |
| 2 | Priorité à la ligne : les deux camions les plus urgents déchargés en premier | planning | 3 |
| 3 | Après l'avance du camion : planning sans conflit (version 2) | planning | 2 |
| 4 | Contrôle : la bonne décision sur chaque palette | réception | 4 |
| 5 | Réserves précises sur le BL (nombre, nature, référence) et signature | réception | 3 |
| 6 | Message à Karim : le manquant et la couverture justes | message | 1 |
| — | Questions au fil | questions | 3 |

Forme : aucune (le message est fait de phrases à choisir ; seul le fond compte). Garde d'inaction : jalon 3 avec
`repriseIdentique: 'faux'` ; jalon 2 ne se donne que si tous les camions sont posés (un planning vide ne « respecte » rien).

## 6 bis. Tirage

Pièce fixe : 8 camions, 5 quais, le quai 5 pour porteurs. Valeurs tirées : palettes par camion (bornes : la matinée tient
toujours sur 5 quais, contrôlé sur 500 tirages), heures d'arrivée (± 15 min), couvertures (les deux urgents restent les deux
mêmes rangs), le nombre de cartons écrasés (2 à 5). Confirmé : un 9e camion sans rendez-vous et une troisième anomalie au quai
(une étiquette qui ne correspond pas à la référence du BL).

## 7. Demandes au moteur

À vérifier en écrivant, sans rien écrire dans `core/` :
1. `planning` sait-il afficher une donnée de plus sur une carte (la couverture) ? Sinon, la mettre dans le libellé de la carte.
2. Un jalon de **priorité** (tel camion commence avant tel autre) : se lit dans l'état du planning par la séance (fonction de
   jalon du contenu), comme les jalons d'ENT-5.7 ; pas de règle nouvelle au moteur.
3. `quai` en `froid: false` + rendu `iso` + **palette manquante** au regard du BL : vérifier que le rendu `iso` (Smoby, un seul
   camion) sait déclarer une ligne de BL sans palette livrée. Sinon : repli sur le rendu habituel sans froid, ou demande au
   moteur en section 7 avant de coder.

## 8. Tests attendus

Bloc `outils/test/stellantis-13.2.mjs`. Cas : parcours juste (20/20) ; urgent déchargé après un camion moins urgent (jalon 2 à
0) ; semi au quai 5 ; reprise identique après l'avance ; palette écrasée acceptée sans réserve ; réserve vague (« colis
abîmés ») refusée par le jalon 5 ; équité des tirages ; sabotage.

## 10. Critères de validation par Tristan

Poser les camions, voir l'urgence arriver, recevoir le camion, écrire les réserves : dire si la révision est assez dure pour
des Terminales (et pas plus longue qu'une heure).

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] 5 quais tenus par l'élève (le nombre réel n'est pas connu) (oui, dit « construit »).
- [ ] Le camion contrôlé est celui des faisceaux, le plus urgent : ses palettes manquantes donnent le calcul du message (oui).
- [ ] L133-3 en question notée en Tle (oui : la notion a été vue en 1re avec les réserves).

## Compte rendu *(à remplir à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
