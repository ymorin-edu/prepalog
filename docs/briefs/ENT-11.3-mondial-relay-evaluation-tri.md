# Brief de séance — ENT-11.3 Mondial Relay, évaluation : la ligne de tri (2de, poste C — logistique, évaluation)

**Statut** : livré (26/10/2026, `pret: true, ouverture: 'prof'`)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé
**Modèle** : Sonnet (évaluation sur des vues existantes une fois la vue Tri livrée)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-11.3 |
| `id` | `mondial-relay-evaluation-tri` |
| Titre / desc | « Mondial Relay — évaluation : la ligne de tri » / « Seul au poste : vérifier la sécurité avant de décharger la navette, trier une série de colis à la cadence du pic, écarter ceux qui ne peuvent pas partir. » |
| Niveau(x) | 2de |
| Compétence(s) | **C1.2** (sécurité), **C1.4** (contrôler, anomalies), **C2.1** (expédier : le tri) ; D4, D5 |
| Temps pédagogique | **évaluation** (C1.2 et C1.4 : 5.4, 6.4 ; C2.1 : 5.6, 6.7, 11.2) |
| Notation | copie rendue (`meta.copie: true`), jalons pondérés sur 20, **un jeu tiré par élève** |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 3. Objectif

Vérifier, sans aide, que l'élève sécurise un quai avant déchargement, trie juste et écarte avec le bon motif.

## 4. Déroulé (≈ 45 min)

1. **Avant de commencer**, notées (4 / 20) : questions ★ de 11.2 (mr2-a, b, c) et clés de 5.4 / 6.4 (sécurité au quai),
   tirées par élève, « Je ne sais pas » permis, faux = − 1 ÷ (mauvaises réponses), plancher 0.
2. **La navette de Reims arrive** (vue `quai`, étape « Avant de décharger » seule, comme 6.4 : sécurité **sans étape
   guidée**) : cales, frein, plaque de quai, éclairage ; 2 anomalies tirées parmi 5.
3. **La série** (vue Tri, temps `evaluation`) : 16 colis tirés, dont 3 à écarter (motifs différents) et 3 pièges ; le
   colis d'Inès en fixe (carton enfoncé mais fermé : part en T3).
4. **Copie rendue** ; bilan quand l'enseignant lève le verrou.

## 4 bis. Questions au fil — propositions (en évaluation, notées, sans retour)

| Geste | Question | Pourquoi |
|---|---|---|
| Colis écarté pour la taille | « Ce colis, que devient-il maintenant ? » (expertise / poubelle / il repart demain tel quel) | contrôle compris, pas récité |
| Fin de la série | « Un colis est tombé dans la mauvaise sortie. Que fais-tu ? » (prévenir le chef d'équipe / le laisser / le reprendre plus tard sans rien dire) | rendre compte |
| **Éco-droit** | travail de nuit appliqué à un horaire tiré (texte fourni, comme 11.2) | reprise de la question clé |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Anomalies de sécurité repérées avant de décharger (sur 2), aucun déchargement si une reste | sécurité | 4 |
| 2 | Colis en règle bien triés | tri | 5 |
| 3 | Pièges bien triés | tri | 2 |
| 4 | Écarts avec le bon motif | contrôle | 3 |
| 5 | Aucun faux écart | contrôle | 1 |
| 6 | Questions au fil | questions | 1 |
| — | Avant de commencer | questions | 4 |

Le tri pèse 7 + 4 = 11 sur 20 : cœur de la compétence ; aucune forme notée à part.

## 6 bis. Tirage

Graine = élève (`core/tirage.js`, mécanisme de Picard ENT-4.4). Banque de 40 colis, contraintes : 3 écarts de motifs
différents, 3 pièges, chaque sortie servie, même nombre de colis pour tous. Test sur plusieurs centaines de graines.
Minuteur : à trancher dans `MOTEUR-vue-tri.md` §5.1 (proposé : 28 s par colis, tiers-temps : 42 s).

## 8. Tests

Bloc `mondial-relay` : copie rendue, verrou, recalcul de la note (`noter`), deux élèves = deux séries, même élève = même
série, sabotages (faux écart, sécurité sautée).

## 11. Questions ouvertes

- [ ] La navette arrive en semi chargée de quoi (cages, sacs, vrac) ? Non vérifié : le quai ne sert ici qu'à la sécurité,
  le contenu du camion n'est pas montré.

## Compte rendu *(rempli par Claude Code à la livraison, 26/10/2026)*

- **Fichiers créés** : `activites/mondial-relay-evaluation-tri.js`, `contenus/mondial-relay-ent113.js`, `contenus/questions/ENT-11.3.js`,
  `contenus/corriges/ENT-11.3.js`, `outils/test/mr-11.3.mjs`. **Modifiés** : `activites/index.js` (une ligne après `mondial-relay-au-tri.js`),
  `outils/test.mjs` (`'mr-11.3'` dans `BLOCS` et dans le groupe 6 de `GROUPES`), `activites/catalogue.js` (régénéré). Rien dans `core/`, `styles/`,
  ni dans la banque `contenus/mondial-relay-colis.js` (réutilisée telle quelle : `tirerSerie`, `COLIS_INES`, `SORTIES`, `REGLES`, `ECART`, `bonTriColis`).
- **Fait** : ordre des écrans Avant de commencer, puis le quai (sécurité), puis la ligne de tri (fermée par `fermetures` tant que l'inspection n'est pas figée
  par « C'est bon »), puis « Rendre ma copie » (moteur). Série unique de 16 colis tirés par élève (`tirerSerie(h, { ecarts: 3, pieges: 3, ordinaires: 9, en: [COLIS_INES] })`,
  graine = élève), 28 s par colis (37 s au tiers-temps, calculé par la vue). Quai : navette de Reims, **deux défauts tirés parmi les cinq objets** de la scène
  (cabine, cale, butoirs, niveleur, lampe), comme la scène d'ENT-6.4 / 8.7 ; en évaluation rien n'arrête l'élève et les défauts oubliés sont remis en ordre
  sans un mot. Questions : « Avant de commencer » noté 4 (banque 9 : tri 4 dont les trois ★ d'ENT-11.2, sécurité 5 dont trois d'ENT-6.4 ; l'élève en reçoit
  2 + 2) ; trois questions au fil (1 point en tout, un tiers de point chacune, « Merci, je note », corrigées au bilan) : ce que devient un colis écarté, un colis
  dans la mauvaise sortie, le travail de nuit sur un horaire tiré (article L3122-2 cité dans l'énoncé). Corrigé calculé par élève.
- **Poids** (validés par Tristan le 26/10/2026) : sécurité 4 (en trois jalons : danger n° 1 → 1,5 ; danger n° 2 → 1,5 ; aucun faux signalement → 1), colis en
  règle bien triés 5, pièges 2, écarts au bon motif 3, aucun faux écart 1, questions au fil 1, Avant de commencer 4 = 20.
- **Écarts par rapport au brief** :
  1. **Le quai ne sait pas s'arrêter avant le déchargement.** La séance utilise `arret: 'dechargement'` (comme ENT-8.7) : après « C'est bon », la navette est
     déchargée à l'écran (deux palettes de colis en cartons, dessin construit) et le quai s'arrête, sans contrôle ni jugement. ENT-6.4 est un entraînement
     complet, pas une évaluation « étape Avant de décharger seule » : c'est le plus proche possible. Le contenu du camion reste le dessin générique (§11 inchangé).
  2. **Le jalon sécurité du brief (un seul, poids 4) est en trois jalons** (1,5 + 1,5 + 1) : un élève qui repère un défaut sur deux garde sa part. « Aucun
     déchargement si une anomalie reste = 0 » : un défaut jamais signalé avant « C'est bon » est faux ; « aucun faux signalement » est faux si rien n'est signalé.
  3. **Question « Ce colis, que devient-il ? »** : posée au premier colis à écarter de la série de l'élève (geste `ecart`), sans nommer le motif, car le motif
     varie d'un élève à l'autre. Le geste est posé par `triDe` sur ce colis (les gestes de la banque, dont `ines`, sont retirés).
  4. **Éco-droit** : posée au clic « C'est bon, on peut décharger » du quai (la vue du quai n'a pas de volet « documents ») ; l'article est donc cité dans
     l'énoncé. L'horaire est tiré (21, 22 ou 23 h vers 5 ou 6 h) ; la bonne réponse est la même pour tous.
  5. Pas de bouton « Étape suivante » (le moteur le masque en copie) : l'ordre est tenu par `fermetures` et le message de Romain.
- **Vérifié** : le quai et les 300 séries (16 colis, 3 écarts de motifs différents, 3 pièges, 5 sorties, Inès en T3, un seul geste sur un colis à écarter, deux
  défauts distincts parmi cinq) ; tout juste = 20 ; copie rendue une fois puis note recalculée par `noter` ; deux élèves = deux séries, même élève = même série ;
  sabotages (Inès écartée : 18,5 ; sécurité sautée : 16 ; un seul défaut : 18,5 ; un faux signalement : 19 ; ouverture toute fausse : 16 ; questions au fil
  fausses : 19 ; série laissée passer) ; aucune requête hors du domaine.
- **Construit / non vérifié** : la navette de Reims, le quai 4, les cinq états de la scène (dessin), l'horaire, Romain et son message. Les textes R4515-4 et
  L4131-1 sont repris d'ENT-6.4 (relus par Cowork sur code.travail.gouv.fr le 10/10/2026) : **à relire sur Légifrance avant d'ouvrir aux élèves**. La scène du quai
  ne se joue qu'à la souris ou au doigt (pas de clavier), comme en 6.4.
- **Tests** : bloc `mr-11.3` (13 cas), plus `questions`, `dependances`, `tri`, `mr-11.2` ; `node outils/catalogue.mjs --verifier` à jour. Test éprouvé dans les
  deux sens : la ligne de tri rendue ouverte d'emblée fait tomber le cas « fermée tant que le quai n'est pas sécurisé ».
- **Commits** : voir le journal de la branche de travail.
- **Reste ouvert** : la suite entière n'a pas été rejouée ici (une autre session intègre) ; le cas « docs/EN-COURS.md » du bloc `dependances` signale un chemin
  inscrit absent (`outils/test/mondial-relay`), sans lien avec cette séance.
