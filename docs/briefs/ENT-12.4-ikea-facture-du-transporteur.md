# Brief de séance — ENT-12.4 IKEA, la facture du transporteur (2de, poste A — gestion, guidage)

**Statut** : à implémenter (une vérification au moteur §7, peut-être une demande)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-12.4 |
| `id` | `ikea-facture-transporteur` |
| Titre / desc | « IKEA — la facture du transporteur » / « Assistant(e) de gestion au centre de Gennevilliers : contrôler la facture du prestataire de livraison contre les bons de livraison signés et le tarif, trouver les lignes fausses, calculer le bon montant et écrire la réclamation. » |
| Niveau(x) | `['2de']` |
| Compétence(s) | **AGO-2.1** (suivi administratif de l'activité de production : contrôle de la facture d'achat) ; D3 |
| Temps pédagogique | guidage (premier temps ; évaluation en 12.8) |
| Notation | jalons pondérés, `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : IKEA confie le dernier kilomètre à des transporteurs (en 2019 : Vir Transport et Trusk ; en 2022 : Trusk pour les
  utilitaires électriques depuis Bercy) ; donc il reçoit leurs factures. Réserves sur le bon de livraison (CGV art. 7.1).
- **Construit** (choix de Tristan du 26/10 : **le prestataire n'est pas nommé**) : « le prestataire de livraison », son tarif
  (prix par livraison selon le mode, supplément par étage sans ascenseur, livraison manquée), la facture de février, les bons de
  livraison signés, les clients. Ni nom ni logo de transporteur réel.
- **Documents reconstitués** : facture et bons, mention en pied « Document pédagogique — reconstitution, non contractuel ».

## 3. Objectif pédagogique

L'élève sait **contrôler une facture d'achat** : rapprocher chaque ligne d'une preuve (bon de livraison signé) et du tarif
convenu, repérer ce qui est faux, recalculer le montant (HT, TVA, TTC) et le réclamer par écrit. C'est la mission « contrôler la
facture du transporteur » décidée le 03/10/2026 pour la 2de. Évaluation en 12.8.

## 4. Déroulé (≈ 50 min)

**Lundi 8 mars 2027.** Hugo, responsable administratif (construit), dépose la facture de février dans la messagerie.

1. **Avant de commencer** (non noté) : banque §4 ter.
2. **Les pièces** (documents joints) : le **tarif** (une page), **12 bons de livraison** (signés, l'un avec la mention « client
   absent », l'un avec une réserve), la **facture** de 12 lignes (pièce fixe en guidage) avec **3 lignes fausses** :
   - une livraison **facturée deux fois** (même bon, même date) ;
   - une livraison **« dans la pièce »** facturée alors que le bon dit « devant chez vous » (mauvais tarif) ;
   - une livraison **non faite** (client absent, prévenu dans les règles : le prestataire ne peut facturer que la « livraison
     manquée » prévue au tarif, pas la livraison complète).
3. **Le contrôle** (fiche à remplir, une ligne par ligne de facture) : « juste / à contester », et pour une ligne contestée le
   motif (liste : doublon, mauvais tarif, livraison non faite, autre).
4. **Le bon montant** (vue `grille`) : total HT juste, TVA 20 %, TTC ; écart avec la facture.
5. **La réclamation** (courriel au prestataire, phrases à choisir) : les numéros de lignes, le motif, le montant à déduire,
   la demande d'avoir.
6. Bilan.

## 4 bis. Questions au fil — propositions

| Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| Première ligne marquée | Hugo | « Avec quelle pièce compares-tu chaque ligne ? » (le bon de livraison signé et le tarif / le catalogue IKEA / la commande du client) | fil | notée | tout de suite | méthode du rapprochement |
| Ligne « client absent » marquée | Hugo | « Pourquoi le prestataire ne peut-il pas facturer la livraison complète ? » (il n'a pas livré ; le tarif prévoit une "livraison manquée" / il a livré / le client a payé) | fil | notée | au bilan | ancrée sur la ligne de l'élève |
| Total HT recalculé | Hugo | « Ton écart est de X € HT (son calcul). Combien en TTC ? » | fil | notée | au bilan | calcul ancré sur son tableau |
| ★ Réclamation envoyée | Hugo | « Le prestataire répond : "payez d'abord, on verra après". IKEA doit-il payer la ligne en double ? » (non : on ne paie que ce qui est dû, on demande un avoir / oui, toujours / oui, puis on porte plainte) | point d'étape | réflexion | — | **éco-droit** : obligation de payer ce qui est dû (Code civil, art. 1302 : « ce qui a été reçu sans être dû est sujet à restitution », à recopier depuis Légifrance) |
| Fin | Hugo | « À quoi sert un avoir ? » (annuler tout ou partie d'une facture / payer plus tard / rembourser le client) | point d'étape | notée | tout de suite | vocabulaire de gestion |

## 4 ter. Avant de commencer (non noté ; ★ = reprise en 12.8)

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| facture | préparation | Une facture d'achat, c'est… | le document du fournisseur qui dit ce que l'entreprise doit payer | un bon de commande ; un reçu de caisse | — | ★ |
| preuve | préparation | Pour savoir si une livraison a eu lieu, on regarde… | le bon de livraison signé | le tarif ; le catalogue | — | ★ |
| ht-ttc | préparation | 200 € HT avec une TVA à 20 %, c'est… | 240 € TTC (valeurs tirées) | 220 € ; 180 € | — | ★ |
| doublon | préparation | Deux lignes avec le même numéro de bon et la même date, c'est sans doute… | un doublon | deux livraisons ; une remise | — | ★ |
| avoir | éco-droit | On t'a facturé une livraison qui n'a pas eu lieu. Tu demandes… | un avoir | une facture de plus ; rien | — | |
| du | éco-droit | Le prestataire a été payé deux fois pour la même livraison. Il doit… | rendre l'argent payé en trop (art. 1302 du Code civil) | le garder ; le partager | extrait du Code civil | ★ |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Ligne en double trouvée, motif juste | contrôle | 3 |
| 2 | Ligne au mauvais tarif trouvée, motif juste | contrôle | 3 |
| 3 | Livraison non faite trouvée, motif juste | contrôle | 3 |
| 4 | Aucune ligne juste contestée | contrôle | 2 |
| 5 | Total HT, TVA, TTC justes | calcul | 3 |
| 6 | Réclamation : lignes, motifs et montant justes | réclamation | 2 |
| — | Questions au fil | questions | 4 |

Pas de jalon de forme (phrases à choisir). Garde d'inaction : le jalon 4 n'est vrai que si au moins une ligne a été contestée
(une fiche vide n'accuse aucune ligne juste, mais ne doit pas rapporter 2 points).

## 6 bis. Tirage

Guidage : pièce fixe (la facture de février). Valeurs tirées : montants du tarif dans des bornes plausibles (recalculés par le
code ; dans les tests, valeurs écrites à la main). Confirmé : une 4e erreur bonus (supplément d'étage facturé alors que le bon dit
« ascenseur »). La consigne ne dit pas combien de lignes sont fausses.

## 7. Demandes au moteur

À vérifier : la **fiche à remplir** gère-t-elle 12 lignes avec une liste « juste / à contester » et un motif ? Sinon, **demande
au moteur** : la vue n° 2 décidée le 03/10 (« Document à contrôler : cliquer la ligne fausse en comparant à un autre document »),
qui servirait aussi 12.8, les réceptions (C1.4) et la 1re. **À trancher avec Tristan avant de construire** si elle manque.

## 8. Tests attendus

Bloc `outils/test/ikea-12.4.mjs`. Cas : contrôle juste ; une ligne juste contestée = jalon 4 faux seulement ; fiche vide = jalon 4
faux ; total faux ; sabotage (changer le tarif dans le contenu sans changer la facture doit faire tomber un cas).

## 10. Critères de validation par Tristan

Ouvrir les pièces, marquer les lignes, recalculer, envoyer la réclamation ; voir le bilan ligne par ligne.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] Le tarif du prestataire n'est pas public : entièrement construit, dit comme tel (oui).
- [ ] Livraison manquée : le tarif prévoit un forfait (construit : 30 % du prix de la livraison) (oui).
