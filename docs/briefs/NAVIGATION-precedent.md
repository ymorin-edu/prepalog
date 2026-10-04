# Brief — La flèche « Précédent » du navigateur revient d'un écran en arrière

- **Statut** : à implémenter
- **Rédigé par** : Cowork, 04/10/2026
- **Modèle conseillé** : Sonnet (navigation dans `core/app.js`, pas de vue nouvelle)
- **Durée estimée** : ~30 à 45 min, dont les essais à l'écran et la suite complète (~5 min).
- **À lancer après** le chantier « Repérage : colonne Documents ouverts » (inscrit dans
  `docs/EN-COURS.md` au 04/10) si `core/types/entreprise.js` doit être touché (voir §3.3).

## 1. Ce que veut Tristan

« Il m'arrive trop souvent de faire Précédent et de quitter le site. » Aujourd'hui, Prepalog
change d'écran sans que le navigateur le sache : pour lui, on est toujours sur la même page, donc
**Précédent (ou Alt + ←, ou le bouton retour de la souris) fait quitter le site** et ramène à
l'écran de connexion ou à la page d'avant.

Décision du 04/10/2026 : **chaque écran devient une étape de l'historique du navigateur**.
Précédent revient d'un écran en arrière, exactement comme le bouton « ← ACCUEIL / ← SIMULOG »
du site. **Rien ne change à l'affichage** : les boutons retour actuels (`.lien-accueil`, discrets)
restent tels quels. Règle valable partout.

Démonstration cliquable (même principe, sans le vrai moteur) :
`Claude outputs\prepalog-essai-retour.html` — option « 0. actuel », puis Précédent.

## 2. Comportement attendu

| Écran actuel | Précédent mène à |
|---|---|
| Une rubrique (Tableur, Logistique…) | l'accueil |
| Simulog : liste des entreprises | l'accueil |
| Simulog : séances d'une entreprise | la liste des entreprises |
| Une activité ouverte (immersive ou non) | l'écran d'où on l'a ouverte (rubrique, entreprise, ou accueil pour une rubrique à activité unique) |
| Espace enseignant / Suivi de classe | l'accueil |
| Accueil | comportement normal du navigateur (on quitte le site) |
| Écran de connexion | comportement normal du navigateur |

- **Suivant** (Alt + →) refait le chemin dans l'autre sens.
- **L'adresse ne change pas** (pas de `#…`, pas de lien profond) : recharger la page ramène à
  l'accueil, comme aujourd'hui. Seul l'historique s'allonge. *(Si Claude Code juge un `#`
  nécessaire, poser la question à Tristan avant.)*
- Les onglets internes de l'espace enseignant et les écrans internes d'une séance (messagerie,
  stock, réceptions…) **ne sont pas** des étapes : Précédent sort de l'espace ou de la séance.
- Les boutons du site (« ← ACCUEIL », « ← SIMULOG », « Quitter ») et Précédent doivent mener au
  même endroit et laisser l'historique propre : cliquer « ← ACCUEIL » puis Précédent ne doit pas
  rouvrir l'activité qu'on vient de quitter de façon surprenante. Piste : un bouton retour du site
  fait `history.back()` quand l'écran visé est l'étape précédente de l'historique, sinon il
  pousse une nouvelle étape (c'est ce que fait la page d'essai, fonction `aller`).

## 3. Points délicats (à vérifier dans le code)

### 3.1 Où brancher
`core/app.js` tient l'état de navigation dans `rubriqueActive`, `entrepriseActive`, et les appels
`vueAccueil()`, `vueActivite(aid)`, `vueProf(onglet)`. Piste : un seul endroit qui, à chaque
changement d'écran, fait `history.pushState({ rub, ent, act, prof }, '')`, et un écouteur
`popstate` qui remet l'état et rappelle la bonne vue **sans repousser** d'étape.
`history.replaceState` pour l'accueil au démarrage.

### 3.2 Connexion et déconnexion
- À la connexion (`B.onAuth` avec profil) : l'accueil remplace l'étape (`replaceState`), pour
  qu'un Précédent depuis l'accueil ne rejoue pas l'écran de connexion.
- Après une **déconnexion**, Précédent ne doit **jamais** réafficher un écran de l'utilisateur
  précédent (poste partagé en classe !). Un `popstate` sans profil connecté → rester sur la
  connexion.
- Changement de session (`onAuth`) : repartir d'un historique propre (comme `rubriqueActive = null`
  aujourd'hui).

### 3.3 Quitter une séance par Précédent = cliquer « Quitter »
C'est le point qui compte le plus : **aucun travail perdu, aucune minuterie qui continue.**
- Une séance d'entreprise immersive sort aujourd'hui par `sortir(ctx.quitter)` dans
  `core/types/entreprise.js` : arrêt du chrono, arrêt du temps passé **avec sauvegarde**
  (`arreterTemps` → `ctx.jeu.sauver()` + `remonterEtapes()`), débranchement du lexique,
  `deshabiller()`. Par Précédent, rien de cela n'est appelé : seul `fermerJeuCourant()` remet la
  charte du site.
- Il faut donc que `app.js` puisse demander à l'activité ouverte de « sortir proprement » avant de
  changer d'écran. Piste : `ctx.surSortie(fn)` (l'activité déclare son nettoyage) ou un
  `jeuOuvert`/module qui expose `sortir()`, appelé par `popstate` **et** par les boutons. Vérifier
  aussi ce que fait déjà `jeuOuvert.fermer()` (sauvegarde ou non).
- Cela touche `core/types/entreprise.js`, pris par le chantier « Repérage » au 04/10 :
  **regarder `docs/EN-COURS.md` et attendre** s'il y est toujours.
- Les autres types d'activités (tableur, quiz, inventaire, tournée, grille…) : vérifier pour
  chacun qu'un Précédent au milieu ne perd rien de plus qu'un clic sur « ← ACCUEIL »
  aujourd'hui. Si l'un d'eux perd quelque chose, le dire à Tristan plutôt que d'élargir le
  chantier.
- Évaluation (`meta.copie`) : Précédent ne rend pas la copie, ne la ferme pas. Même effet que
  « Quitter ».

### 3.4 Ce qu'il ne faut pas faire
- Pas de `beforeunload` (« Voulez-vous quitter ce site ? ») : non demandé.
- Pas de changement visuel des boutons retour.
- Ne pas casser `ctx.quitter()` : une séance d'entreprise revient toujours à la liste des
  séances de son entreprise.

## 4. Tests

Changement dans `core/` : **suite complète avant le push**. Nouveau bloc ou cas dans
`outils/test/socle.mjs` (le dire à Tristan s'il faut toucher `outils/test/commun.mjs`).

- Accueil → Tableur → une activité ; `page.goBack()` → la rubrique Tableur ; `goBack()` →
  l'accueil ; `goForward()` → Tableur.
- Simulog → une entreprise → une séance immersive ; `goBack()` → les séances de l'entreprise,
  **charte du site revenue** (`body` sans `immersion`), `goBack()` → les logos des entreprises.
- Séance immersive : faire un geste qui s'enregistre, `goBack()`, rouvrir la séance → le geste
  est là. Et le temps passé a été sauvé (même attente que pour le bouton Quitter, s'il existe un
  test de ce genre : s'en inspirer).
- Déconnexion puis `goBack()` → toujours l'écran de connexion, aucun nom d'élève à l'écran.
- « ← ACCUEIL » depuis une rubrique, puis `goBack()` : ne rouvre rien d'inattendu (décrire dans
  le compte rendu ce qui se passe exactement).
- Éprouver dans les deux sens : sans l'écouteur `popstate`, les cas tombent.

## 5. Critères de validation par Tristan

À l'écran, en élève puis en enseignant : naviguer accueil → rubrique → activité, puis Précédent
plusieurs fois (flèche du navigateur, Alt + ←, bouton de la souris s'il en a un) : on remonte
écran par écran, et on ne quitte le site que depuis l'accueil. Dans une séance d'entreprise :
faire un geste, Précédent, rouvrir : rien n'est perdu. Se déconnecter, Précédent : on reste sur
la connexion.

## 6. Compte rendu (à remplir par Claude Code)
