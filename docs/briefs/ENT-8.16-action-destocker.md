# Brief de séance — ENT-8.16 Action — déstocker et signaler (CAP OL, guidage CAP-C3.2)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/MOTEUR-preparation-vocale-cartons.md, docs/briefs/ENT-8.15-action-preparer.md (§0) puis docs/briefs/ENT-8.16-action-destocker.md en entier. Les lots 0 à 3 du chantier E-8 doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter (poids validés par Tristan le 25/10/2026)
**Date du brief** : 25/10/2026, projet PREPALOG. **Modèle** : Sonnet (la vue est faite par E-8). **Durée estimée** : ≈ 3 h.
**Place dans l'ordre** : après ENT-8.15. Attend les **lots 0 à 3** d'E-8 (le lot 3 : carton abîmé, emplacement vide, réserve descendue).

---

## 0. Ce qui vaut pour cette séance

- **§0 d'ENT-8.15** (règles communes 8.15 → 8.19). **Le lendemain, 6 h.**
- Même entrepôt de préparation que 8.15 (`contenus/action-prepa-donnees.js`), autre commande, autre magasin tiré.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-8.16 (provisoire) / `action-destocker` |
| Titre / desc | « Action — déstocker et signaler » / « Une commande plus longue : un carton abîmé à laisser, un emplacement vide à signaler pour que le cariste descende la réserve, et le stock que le système doit connaître. » |
| Compétence(s) | `competencesCap: ['CAP-C3.2']` ; ligne dans `ATTENDU_CAP` (alerte 7) |
| Temps / notation | `temps: 'guidage'` ; `parcours`, `correction`, `bilanDetail` ; `precedente: 'action-preparer'` ; `bareme: 20` |
| Niveaux | `niveauxPrevus: ['confirme', 'accompagne']` ; `questions: 'ENT-8.16'` ; `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit
Vérifié : §0 d'ENT-8.15 (préparation à la voix, scanner). Construit : la commande, l'abîmé, l'emplacement vide, la réserve, le stock affiché.

## 3. Objectif pédagogique
À la fin, l'élève sait **contrôler** ce qu'il prend (le bon emplacement, l'état du carton), **signaler une anomalie au terminal** avec le bon mot
(« Abîmé », « Emplacement vide »), **ne pas envoyer** un carton abîmé, et comprendre que ce qu'il dit **actualise le stock**.

## 4. Déroulé (≈ 45 min)

### Accueil (Samia)
« Bonjour {prénom} ! Commande plus longue aujourd'hui. Regarde bien chaque carton avant de le prendre. Si quelque chose ne va pas, tu le dis au
terminal. Samia »

### Étape 0 — Avant de commencer (non notée) — §4 ter

### Étape 1 — Préparer (Plan d'entrepôt, mode `preparation`, terminal vocal : lots 0 à 3)
- **7 lignes, une palette, un magasin** : 5 lignes normales ; **1 ligne avec un carton abîmé devant** (vu de près, jamais écrit) ; **1
  emplacement vide** (tiroir vide de près).
- Abîmé (**changé le 25/10 par Tristan**) : l'élève sélectionne l'abîmé et dit « Abîmé : 1 » ; il est mis de côté et le terminal redit la quantité : le bon carton se **reprend sur la même pile** (plus de ligne de remplacement) ; pris sans rien dire,
  le carton part **abîmé** sur la palette (dessiné), jalon faux.
- Vide : « Emplacement vide » → « Réserve demandée au cariste. » → **Kevin descend la palette de réserve** (geste de Smoby) → la ligne est redite.
- Critères jugés : `lignesJustes` et les jalons d'exception (lot 3). Montage, film, étiquettes : non jugés (8.17).
- Guidage : « Les mots du terminal ▾ » ouverts (Abîmé, Manquant, Emplacement vide) ; le terminal ne suggère jamais lequel dire.

### Étape 2 — Ce que sait le système (fiche, document à gauche)
- À gauche : **l'écran « Stock » du terminal** pour les deux adresses à anomalie, **calculé sur ce que l'élève a dit** (s'il n'a rien dit, le
  stock reste faux).
- Fiche « Le stock après ma préparation » (`liste` × 3), réponses **calculées sur la vérité** des gestes de l'élève :
  - « À l'adresse du carton abîmé, le système sait-il qu'un carton est abîmé ? » oui, je l'ai dit / non, je ne l'ai pas dit ;
  - « À l'adresse vide, que va faire le système ? » rien de plus : la réserve est descendue / il croit qu'il reste des cartons ;
  - « Si personne ne dit "Emplacement vide", le prochain préparateur… » trouvera l'emplacement vide lui aussi / trouvera des cartons.
- Envoi à Samia → « Exactement. Ce que tu dis au terminal, c'est le stock de demain. »

### Étape 3 — Rendre compte (Messagerie, phrases)
Samia écrit en premier : « Rien de spécial sur ta commande ? » ; réponse par phrases **calculées sur ce qu'il a signalé** : salutation · ce
qui s'est passé (« un carton abîmé en {adresse}, laissé au picking » · « l'emplacement {adresse} était vide, Kevin a descendu la réserve ») ·
politesse · fin. Seule la forme est notée (une erreur ne se paie qu'une fois).

### Fin
Samia : « Merci. Jeudi, on regarde comment tu montes ta palette. Samia » ; bilan ; « Corriger » rouvre la préparation, la fiche et le message.

**Mots cliquables** : anomalie, carton abîmé, emplacement vide, réapprovisionnement, réserve, actualiser, stock.

## 4 bis. Questions au fil — proposées (somme 4)

| id | Geste | Question (juste en gras) | Poids | Corrigée |
|---|---|---|---|---|
| `q-abime` | « Abîmé » dit (ou ligne abîmée finie) | « Pourquoi ne pas envoyer un carton abîmé au magasin ? » — **le magasin ne pourra pas le vendre : il sera refusé ou jeté** · le magasin le répare · personne ne le verra | 1 | au bilan |
| `q-vide` | « Emplacement vide » dit (ou ligne finie) | « Qui descend la palette de réserve ? » — **Kevin, le cariste : il faut un chariot qui monte** · moi, avec le transpalette · le chauffeur | 0,75 | tout de suite |
| `q-reappro` | réserve descendue | « Descendre la réserve dans le picking, ça s'appelle… » — **réapprovisionner** · inventorier · expédier | 0,75 | tout de suite |
| `q-tomber` | **éco-droit** — fiche envoyée | « Un carton t'échappe et se casse. Est-ce toi qui le paies ? » — **non : l'employeur supporte ce risque, sauf faute très grave et volontaire** · oui, sur ma paie · oui, la moitié | 1,5 | tout de suite ; texte joint « Le droit » : principe (Cour de cassation, responsabilité pécuniaire du salarié seulement en cas de faute lourde) **à vérifier et citer exactement à la construction** |

Retours : `q-abime` « Un carton abîmé envoyé, c'est un retour, un camion et de l'argent perdus. » · `q-vide` « Toi, tu signales ; Kevin
monte. » · `q-reappro` « Le picking ne doit jamais rester vide. » · `q-tomber` « Tu dois faire attention, mais casser par accident n'est pas une
faute. On le signale. »

## 4 ter. Avant de commencer — banque proposée (non notée)

| id | Question | Juste | Pièges |
|---|---|---|---|
| `k-anomalie` | Une anomalie, c'est… | quelque chose qui ne va pas : carton abîmé, emplacement vide | une commande urgente · un nouveau produit |
| `k-signaler` | Quand un carton est abîmé, je… | le laisse et je le signale | le cache au fond de la palette · le jette sans rien dire |
| `k-reserve` | Les niveaux au-dessus du sol, c'est… | la réserve | le picking · le quai |
| `k-code` (rappel 8.15) | Le code de contrôle se lit… | sur la lisse, devant l'emplacement | sur le carton · sur le terminal |
| `img-abime` | Ce carton (coin enfoncé, ruban déchiré) est… | abîmé | normal · fragile |

## 5. Jalons / notation (sur 20) — poids validés par Tristan (25/10/2026, 14 h 26)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Prélever** (adressage, prélèvement) | 5 lignes normales justes, 1 chacune | **5** | `ligne-…` | codes faux non notés |
| **Carton abîmé** (contrôler, signaler) | « Abîmé : 1 » dit et quantité reprise sur la pile (jalon `abime-dit`, 25/10) | **3** | jalons du lot 3 | pris sans rien dire = faux |
| **Emplacement vide** (signaler, réapprovisionner) | « Emplacement vide » dit 1,5 · ligne reprise après la réserve 1,5 | **3** | jalons du lot 3 | — |
| **Rien d'abîmé sur la palette** | aucun carton abîmé posé | **1** | palette | seulement si toutes les lignes sont faites (sinon l'inaction gagne) |
| **Ce que sait le système** (actualiser) | 3 lignes de la fiche, 1 chacune | **3** | fiche `stock` | jugée sur **ses** gestes, pas sur la bonne réponse générale |
| **Les questions de Samia** | §4 bis | **4** | moteur des questions | — |
| **Rendre compte** | forme (salutation, politesse) | **1** | phrases | contenu calculé sur ses signalements, non noté |
| **Total** | | **20** | | |

- Par sous-compétence de C3.2 : adressage et prélèvement 5 ; contrôler et signaler 7 ; actualiser 3.

## 6. Contenu (données)
`contenus/action-ent816.js`, `contenus/questions/ENT-8.16.js`, `activites/action-destocker.js`, `contenus/corriges/ENT-8.16.js`.
Commande : 7 lignes, 25 à 35 cartons, aucun fragile ; l'abîmé et le vide **jamais sur la même ligne** ni consécutifs ; la ligne de remplacement
dans le sens du circuit (pas de retour en arrière). Contrôle d'équité calculé par un test.

## 6 bis. Tirage et niveaux
- Tirés : magasin, lignes, quelle ligne est abîmée, laquelle est vide, codes.
- **Confirmé** : une 8e ligne avec **un manquant** (moins de cartons que demandé : « Manquant », bonus).
- **Accompagné** : « Les mots du terminal ▾ » avec une ligne d'aide chacun (« quand le carton est abîmé », « quand il n'y a rien ») ; l'allée en
  cours entourée.

## 7. Demandes au moteur
E-8 lots 0 à 3 ; l'écran « Stock » calculé (document à gauche de la fiche, calculé par la séance depuis la trace du terminal : à vérifier qu'elle
est lisible, sinon demande). Samia écrit en premier à « Vérifier ».

## 8. Tests attendus
Bloc `action-816` (alerte 7). Parcours juste (deux graines) 20/20 ; inaction 0/20 (« rien d'abîmé » non compté) ; carton abîmé pris sans rien dire
(deux jalons faux, carton dessiné sur la palette, fiche jugée sur ce geste) ; « Emplacement vide » non dit (quantité refusée, jamais bloquant) ;
confirmé, accompagné ; somme 20 ; `part` 4. Sabotage : fiche jugée contre la réponse « idéale » → le cas « abîmé pris sans rien dire » tombe.

## 10. Critères de validation par Tristan
- Le carton abîmé **se voit** de près sans être écrit ; l'emplacement vide aussi.
- L'élève trouve les mots du terminal sans aide.
- 45 minutes suffisent.

## 11. Questions ouvertes
1. **Tranché par Tristan (25/10)** : poids du §5. **Proposé** : questions, retours, banque ; la fiche « Ce que sait le système ».
2. **Proposé** : `q-tomber` (responsabilité pécuniaire) : la règle jurisprudentielle est à vérifier et citer exactement à la construction ;
   sinon remplacer par une autre question éco-droit.
