# Brief de séance — ENT-11.3 Mondial Relay, évaluation : la ligne de tri (2de, poste C — logistique, évaluation)

**Statut** : à implémenter, après ENT-11.2
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
