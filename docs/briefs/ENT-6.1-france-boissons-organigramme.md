# Brief de séance — ENT-6.1 France Boissons, bienvenue à Buchelay : qui fait quoi (2de, ouverture du scénario S2)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/ENT-6.1-france-boissons-organigramme.md puis implémente-le (avec ENT-6.2 : la première des deux construites crée l'univers commun `contenus/france-boissons.js`). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus). Demande de Tristan (05/10) : aborder l'organisation de l'entreprise
(organigramme, liens hiérarchiques et fonctionnels) dans S2. Décision : **une courte séance d'ouverture**, qui prend la
place de la visite de S1 (S2 n'en a pas) et présente les personnages une fois pour toutes ; **avec les vues existantes**
(document + fiche à remplir), pas de vue nouvelle.
**Modèle** : Sonnet suffit (vues existantes, contenu déclaré).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.1 (première séance de S2 ; renumérotation du 05/10, voir `docs/briefs/RENUMEROTATION-france-boissons.md`) |
| `id` | `france-boissons-organigramme` |
| Titre / desc | « France Boissons — bienvenue à Buchelay » / « Premier jour en renfort à la plateforme de Buchelay : lire l'organigramme, savoir qui dirige qui et qui travaille avec qui, et à qui s'adresser. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **à décider par Tristan** (§11) ; domaine **D1** (relations : identifier ses interlocuteurs) |
| Temps pédagogique | découverte (une seule séance sur la notion) |
| Notation | jalons + note sur 20 |
| Barème | 8 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (05/10/2026)** : France Boissons, filiale de Heineken ; plateforme de **Buchelay (78)**, inaugurée le
  16/06/2025, **80 salariés (150 à terme)**, 35 quais, 30 tournées par jour en haute saison, livre du nord-ouest parisien
  à la côte normande ; transport **pour compte propre** (ses camions, ses chauffeurs) ([france-boissons.fr](https://www.france-boissons.fr/nos-actualites/inauguration-de-la-nouvelle-plateforme-logistique-france-boissons-a-buchelay-78-performance-proximite-et-responsabilite-au-coeur-du-projet/),
  Stratégies Logistique).
- **Construit (annoncé comme tel à l'élève)** : l'organigramme de la plateforme, les intitulés de poste et tous les
  prénoms. L'organigramme réel de France Boissons n'est pas public ; on ne nomme aucun dirigeant réel.
- Document reconstitué : pied « Organigramme simplifié — document pédagogique, reconstitution, non contractuel ».

## 3. Objectif pédagogique

L'élève sait **lire un organigramme**, distinguer un **lien hiérarchique** (qui donne les ordres, qui valide) d'un **lien
fonctionnel** (qui apporte un service, une règle, une information sans être le chef), et **savoir à qui s'adresser**.
Ces notions resservent tout le scénario : en ENT-6.3, Karim valide le congé de Lucas (hiérarchique) et Inès l'enregistre
(fonctionnel) ; l'annonce du saisonnier dit « rattaché à ».

## 4. Déroulé (≈ 30 min)

1. **Message d'Inès** (3 blocs) : « Bonjour {prénom}, bienvenue à Buchelay ! / Tu vas travailler avec plusieurs
   services cet été. Avant tout, regarde l'organigramme de la plateforme. / Complète ensuite la fiche « Qui fait quoi ? »
   et renvoie-la-moi. Inès »
2. **Documents joints** :
   - **Organigramme simplifié de la plateforme** (HTML/CSS : cases et traits ; traits pleins = hiérarchique, pointillés =
     fonctionnel, légende) :

     ```
                         Hélène — directrice de la plateforme
          ┌──────────────────────────┼───────────────────────────┐
     Inès — assistante          [ case A ]                      [ case B ]
     administrative          responsable d'entrepôt      responsable d'exploitation transport
     (ventes, RH)                    │                               │
                              Nadia — cheffe de quai          [ case C ] chauffeur-livreur
                                     │                         (tournée de la côte) + 6 autres
                           préparateurs, caristes
     ```

     Cases vides : **A = Thomas** (responsable d'entrepôt), **B = Karim**, **C = Lucas**. Liens fonctionnels en
     pointillés : Inès → tous les services (congés, contrats, commandes clients) ; Nadia ↔ chauffeurs (ordre de
     chargement au quai).
   - **Cinq fiches « qui suis-je »** de 4 lignes (Thomas, Karim, Lucas, Nadia, Inès) : missions, à qui il rend compte,
     avec qui il travaille. C'est là que l'élève trouve qui va dans les cases.
3. **Fiche « Qui fait quoi ? »** (documents à gauche) :
   - **Les trois cases** (`liste` × 3) : case A, B, C → Thomas / Karim / Lucas / Nadia / Inès.
   - **Lucas dépend hiérarchiquement de** (`liste`) : Karim (juste) · Nadia · Inès · Hélène.
   - **Le lien est-il hiérarchique ?** (`ouinon`, 5 lignes) :

     | Situation | Hiérarchique ? |
     |---|---|
     | Karim donne à Lucas sa tournée du jour. | oui |
     | Inès rappelle à Lucas de poser ses congés d'été avant le 15 juin. | non (fonctionnel) |
     | Nadia indique à Lucas à quel quai charger son camion. | non (fonctionnel) |
     | Hélène valide le recrutement d'un saisonnier proposé par Karim. | oui |
     | Lucas demande à Inès une attestation d'employeur. | non (fonctionnel) |

   - **À qui t'adresses-tu ?** (`liste` × 2) : « Un chauffeur veut décaler ses congés : qui **décide** ? » → Karim ;
     « Un bar demande où en est sa commande : qui lui répond ? » → Inès.
   - **Encadré** (3 lignes) : « **Lien hiérarchique** : ton chef. Il te donne ton travail et valide tes demandes.
     **Lien fonctionnel** : un collègue d'un autre service qui t'aide ou te donne une règle à suivre, sans être ton chef. »
   - Envoi : « Envoyer la fiche à Inès ».
4. **Réponse d'Inès** (`apresFiche`, sans dire si c'est juste) : « Merci ! Demain, tu commences avec moi : un bar de la
   côte vient de nous écrire. » (transition vers ENT-6.2).

Mots cliquables : organigramme, lien hiérarchique, lien fonctionnel, service, rendre compte, exploitation.

## 5. Jalons (8)

| # | Jalon | Piège à éviter |
|---|---|---|
| 1 | Les trois cases justes (A, B, C) | fiche non envoyée = faux |
| 2 | Lucas → Karim | — |
| 3-5 | Lignes « Karim / tournée », « Nadia / quai », « Hélène / recrutement » justes | une ligne par jalon |
| 6 | Lignes « Inès / congés » et « Inès / attestation » justes (les deux fonctionnels vers Inès) | — |
| 7 | Qui décide d'un décalage de congés → Karim | — |
| 8 | Qui répond au bar → Inès | — |

## 6. Contenu

`contenus/france-boissons-ent60.js` (organigramme, fiches, fiche à remplir, messages, jalons) ; l'univers commun reste
`contenus/france-boissons.js` : **y ajouter** Hélène et Thomas (fictifs).

## 7. Demandes au moteur

Aucune : documents joints, fiche à remplir (`liste`, `ouinon`, `encadre`), mots cliquables, `apresFiche`. L'organigramme
est un document HTML (pas de dessin interactif, décision de Tristan du 05/10). Contraste et lisibilité des traits en
pointillés à vérifier au vidéoprojecteur.

## 8. Tests attendus

Bloc `france-boissons` : parcours juste 8/8 ; inaction 0/8 ; « Nadia / quai » marqué hiérarchique → jalon 4 faux ; cases
A et B inversées → jalon 1 faux ; sabotage par jalon.

## 9. Supports

Trame courte (l'organigramme à compléter sur papier) : Cowork, après validation à l'écran. Corrigé `contenus/corriges/ENT-6.1.js`.

## 10. Critères de validation par Tristan

L'organigramme se lit au vidéoprojecteur ; la différence hiérarchique / fonctionnel se comprend avec l'encadré seul ;
30 minutes suffisent.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [ ] **Compétence à déclarer** : la notion relève surtout de l'économie-gestion ; dans les trois référentiels, le plus
  proche est le domaine **D1** (identifier ses interlocuteurs). (Défaut : `competences: []`, domaine D1 seul ; la séance
  apparaît au suivi mais ne compte dans aucune note par compétence.)
- [ ] Prénoms Hélène (directrice) et Thomas (responsable d'entrepôt) : construits.
