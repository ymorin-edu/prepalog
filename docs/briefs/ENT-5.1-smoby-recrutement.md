# Brief de séance — ENT-5.1 Smoby, recruter le cariste du pic de Noël (2de, poste A — assistant RH, guidage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.1-smoby-recrutement.md (il faut que les lots 1, 2, 3 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (section « Séance A1 »),
`claude/prepalog-2de-eleve-debut-annee.md` (règles d'écriture). Exemple de CV validé : `docs/briefs/smoby/exemple-cv-A1.html`.
**Modèle** : Opus (séance nouvelle de bout en bout).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.1 |
| `id` (jamais modifié ensuite) | `smoby-recrutement` |
| Titre / desc | « Smoby — recruter le cariste de Noël » / « Assistant RH à la plateforme Smoby de Moirans-en-Montagne : lire une fiche de poste, trier cinq CV, choisir le bon candidat et le bon contrat, rendre compte à sa tutrice. » |
| Rubrique | logisim, entreprise **n° 5 Smoby** (lot 7 de `MOTEUR-2de-S1`) |
| Entreprise | Smoby (réelle, vérifiée : §2) |
| Niveau(x) | 2de (`niveaux: ['2de']`) |
| Compétence(s) | **AGO-3.1** (suivi de carrière : procédures d'entrée) ; domaine D1 |
| Temps pédagogique | guidage ; `parcours: 'coeur'` (nom du champ : lot 1 du brief moteur) |
| Notation | jalons + note sur 20 (pas de `notation`, comme Boost et Picard) |
| Barème | 9 (nombre de jalons) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (web, 03-04/10/2026)** : Smoby Toys (groupe Simba Dickie), 4 implantations dans le Jura, 350 salariés ;
  **Moirans-en-Montagne : montage et stockage logistique**, la logistique y emploie **25 à 60 personnes selon la saison**
  (hebdo39.net) ; 75 % des jouets fabriqués en France. CACES R489 : cat. 1A/1B transpalettes et gerbeurs, **cat. 3
  chariot frontal (chargement / déchargement de camions)**, **cat. 5 chariot à mât rétractable (stockage en hauteur)**,
  **valable 5 ans** (gefor.com). Pic de Noël : **CDD saisonnier** possible (mention du caractère saisonnier, pas
  d'indemnité de fin de contrat) (GERESO, 28/11/2024). Sources détaillées : fiche S1.
- **Construit (annoncé comme tel)** : le besoin de recrutement, Sophie (tutrice, prénom et nom inventés), la fiche de poste,
  les 5 candidats et leurs CV (noms, adresses, numéros `06 00 00 00 0x`, courriels `@exemple.fr` inventés ; villes réelles
  du Jura et de l'Ain), les dates.
- **Logo** : à récupérer avec l'accord de Tristan (lot 7). **Pas de visage, aucune photo sur les CV.**
- **Documents reconstitués** : fiche de poste et CV portent en pied « CV fictif — document pédagogique Prepalog » /
  « Document pédagogique, reconstitution, non contractuel ».

## 3. Objectif pédagogique

L'élève (début de 2de, a vu en classe le CV et le métier de cariste) sait **lire une fiche de poste**, **comparer des CV à
des critères** (le CACES et **sa date**, la disponibilité, le type de contrat recherché), **choisir un candidat et un
contrat** (CDD / CDI) et **rendre compte** par un message professionnel. Première séance du scénario S1 (ordre :
ENT-5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6). Suite : ENT-5.2 (préparer l'arrivée de Yanis).

## 4. Déroulé (≈ 45 min de travail, règles de `prepalog-2de-eleve-debut-annee.md`)

L'élève joue **son propre rôle** : « Tu arrives en renfort chez Smoby, au service RH ». Environnement d'entreprise
(messagerie), une consigne par écran.

1. **Message d'accueil de Sophie Martin**, assistante RH (texte proposé, 3 blocs courts) :
   « Bonjour {prénom}, bienvenue au service RH ! / Pour le pic de Noël, la plateforme a besoin d'un **cariste en CDD
   saisonnier**, à partir du **mercredi 9 décembre**. / Voici la fiche de poste et les 5 CV reçus. Remplis le tableau de tri,
   puis dis-moi qui tu retiens. Sophie »
2. **Fiche de poste** (document) : cariste – plateforme logistique de Moirans-en-Montagne ; **CACES R489 cat. 3 exigé**
   (en cours de validité), **cat. 5 apprécié** ; **prise de poste le mercredi 9 décembre 2026** ; **CDD saisonnier jusqu'au
   vendredi 8 janvier 2027** (construit) ; horaires en équipe. **Encadré « Le CACES, c'est quoi ? »** (3 lignes) :
   « Un certificat qui prouve que tu sais conduire un type d'engin. Une catégorie par sorte de chariot : 1 = transpalette
   porté, 3 = chariot frontal, 5 = chariot à mât rétractable. Il est **valable 5 ans**. »
3. **Les 5 CV** (pièces jointes du message, lisibles une par une) : **vrais CV d'une page, sans photo, une mise en page
   différente pour chacun** — modèle validé par Tristan : `docs/briefs/smoby/exemple-cv-A1.html` (Yanis et Laura y sont
   déjà écrits ; écrire les trois autres sur le même principe, avec d'autres mises en page).

   | Candidat | Ville | CACES (date) | Disponibilité | Ce qu'il recherche | Défaut |
   |---|---|---|---|---|---|
   | **Yanis Morel** | Saint-Claude (39) | cat. 3 et 5, **mai 2024** | dès le **30 novembre 2026** | CDD ou CDI | — **le bon** |
   | Laura Petit | Moirans-en-Montagne (39) | cat. 3, **mars 2021** | immédiatement | CDD accepté | CACES **périmé** (mars 2026) |
   | Mehdi Benali | Oyonnax (01) | **cat. 1A seulement** (2025) | immédiatement | CDD ou CDI | pas de CACES 3 |
   | Thomas Girod | Lons-le-Saunier (39) | cat. 3, 2023 | **à partir du 4 janvier 2027** | CDD | après le pic |
   | Sabrina Lopez | Saint-Claude (39) | cat. 3 et 5, 2022 | immédiatement | **un CDI uniquement** | refuse le CDD |

   Les informations ne sont **jamais au même endroit** d'un CV à l'autre (c'est voulu : le tableau de tri sert à ça).
4. **Tableau de tri** : 5 lignes (candidats) × 3 colonnes à cocher « oui / non » : **CACES 3 valide** · **disponible le
   9/12** · **accepte un CDD**. **Pas de correction ligne par ligne** (choix de Tristan) : le tableau est jugé au moment du
   choix (étape 5), et le bilan dit quelles cases étaient fausses.
5. **Choix** : « Je retiens : [candidat] » et « Contrat : CDD / CDI », avec l'**encadré CDD / CDI** (3 lignes) :
   « **CDI** : contrat sans date de fin. **CDD** : contrat avec une date de fin, pour un besoin limité dans le temps (un pic
   d'activité, un remplacement). Le **CDD saisonnier** sert aux activités qui reviennent chaque année à la même période. »
6. **Réponse à Sophie par phrases à choisir** (lot 2 du brief moteur), 5 lignes, ordre des choix tiré par élève :

   | Ligne | Juste | Pièges |
   |---|---|---|
   | salutation | « Bonjour Sophie, » | « Salut ! » · « Coucou Sophie » |
   | choix | « Je retiens la candidature de Yanis Morel » | les 4 autres noms |
   | raison | « car il a le CACES 3 valide, il est disponible le 9 décembre et il accepte un CDD. » | « car il habite le plus près. » · « car il a le CACES. » (incomplète) |
   | contrat | « Je propose un CDD saisonnier. » | « Je propose un CDI. » |
   | fin | « Pouvez-vous valider ? Cordialement, » | « Merci de valider vite » · « Bisous » |

7. **Réponse de Sophie** (déclencheur `apresMail`, juste ou faux) : « Merci ! La direction valide Yanis. Il arrive le
   mercredi 9 décembre : on prépare son arrivée la prochaine fois. » (transition vers ENT-5.2 ; ne dit pas si le choix était
   juste).

Mots cliquables (lot 3) : CACES, CDD, CDI, saisonnier, cariste, fiche de poste.

## 5. Jalons / notation (9, validés par Tristan)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1-5 | La ligne de **chaque candidat** est juste (ses 3 cases) | le tableau de tri | case vide = fausse ; rien n'est vrai avant le choix |
| 6 | Yanis retenu | le choix | — |
| 7 | CDD choisi | le choix | — |
| 8 | La raison juste dans le message | `phrasesJustes` (ligne `raison`) | message non envoyé = faux |
| 9 | Ton professionnel | lignes `salutation` **et** `fin` justes | idem |

Valeurs attendues **calculées** depuis les données des candidats (date du CACES + 5 ans ≥ 9/12/2026, disponibilité ≤
9/12/2026, contrat recherché), jamais recopiées ; dans les tests, écrites à la main.

## 6. Contenu

`contenus/smoby.js` (univers commun aux 6 séances : identité, `THEME`, lieux, personnages fictifs : Sophie Martin (RH),
le chef de quai, l'exploitation K+N Besançon) et `contenus/smoby-ent51.js` (fiche de poste, CV, tableau, messages, étapes,
accueil). Une base par séance (pas de `jeuId`).

**Niveau confirmé** : non utilisé en S1 (S1 sert à repérer ; décision 4).

## 7. Demandes au moteur

Toutes dans `MOTEUR-2de-S1.md` : lot 1 (`AGO-3.1`), lot 2 (phrases à choisir), lot 3 (mots cliquables), lot 7 (entreprise
n° 5). **À vérifier au lot 0** : comment afficher une fiche de poste et des CV (pièces jointes HTML d'un mail ? écran
« documents » ?) et un tableau de cases à cocher dans l'environnement (grille existante ?). Si rien n'existe, le dire avant
d'écrire.

## 8. Tests attendus

Bloc `smoby` : parcours juste 9/9 ; inaction 0/9 ; chaque piège (Laura cochée « CACES valide » → jalon 2 faux ; message
sans envoi → jalons 8 et 9 faux ; CDI → jalon 7 faux) ; sabotage par jalon.

## 9. Supports

- Trame élève courte (1-2 pages : contexte, lexique du jour, tableau de tri sur papier) : **Cowork, après validation à
  l'écran** ; ne pas la déclarer avant.
- Corrigé `contenus/corriges/ENT-5.1.js` : tableau de tri attendu + message attendu, calculés.

## 10. Critères de validation par Tristan

La séance se lit sans décrocher (3 lignes par bloc), les CV ressemblent à l'exemple validé, un élève peut finir en 45 min.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [ ] Fin du CDD (vendredi 8 janvier 2027, construit).
- [ ] Nom de famille de Sophie (Martin).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
