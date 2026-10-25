# Brief de séance — ENT-8.18 Action — deux magasins, deux palettes (CAP OL, entraînement CAP-C3.1 à C3.3, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/MOTEUR-preparation-vocale-cartons.md, docs/briefs/ENT-8.15-action-preparer.md (§0), docs/briefs/ENT-8.13-action-palette-a-cote.md (l'erreur induite) puis docs/briefs/ENT-8.18-action-deux-magasins.md en entier. Les lots 0 à 4 du chantier E-8 doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter (poids validés par Tristan le 25/10/2026)
**Date du brief** : 25/10/2026, projet PREPALOG. **Modèle** : Opus (erreur induite, deux palettes). **Durée estimée** : ≈ 4 h.
**Place dans l'ordre** : après ENT-8.17. Attend les **lots 0 à 4** d'E-8 (le lot 4 : deux commandes, deux palettes, « Contrôler mes palettes »).
**Décision de Tristan** (18/10/2026) : 8.18 = entraînement « deux commandes de magasins mélangées ».

---

## 0. Ce qui vaut pour cette séance

- **§0 d'ENT-8.15**. **Un vendredi, 6 h.** Même entrepôt de préparation.
- **Entraînement** : moins d'aide qu'en guidage (« Les règles ▾ » **fermées** au départ, le poids et la hauteur de la palette se lisent de près,
  sans alerte) ; questions au fil (4 points) ; `parcours`, `correction`.
- **Erreur induite** (comme ENT-8.13) : quelqu'un pousse à mal faire, et la séance permet de s'en rendre compte. **Les deux chemins convergent** :
  que l'élève tombe dans le piège ou non, il arrive au même écran de contrôle et peut tout remettre en ordre avant le film.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-8.18 (provisoire) / `action-deux-magasins` |
| Titre / desc | « Action — deux magasins, deux palettes » / « Le terminal mélange les lignes de deux magasins : poser chaque carton sur la bonne palette, contrôler ses palettes avec la liste de colisage avant de filmer, étiqueter chacune pour son magasin. » |
| Compétence(s) | `competencesCap: ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3']` (la note se répartit par bloc, §5) ; ligne dans `ATTENDU_CAP` (alerte 7) |
| Temps / notation | `temps: 'entrainement'`, erreur induite ; `parcours`, `correction`, `bilanDetail` ; `precedente: 'action-conditionner'` ; `bareme: 20` |
| Niveaux | `niveauxPrevus: ['confirme', 'accompagne']` ; `questions: 'ENT-8.18'` ; `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit
Vérifié : §0 d'ENT-8.15. Construit : préparer deux magasins à la fois (méthode courante en entrepôt, non vérifiée à Ensuès : le dire dans la
mention), la liste de colisage, Yanis et son conseil.

## 3. Objectif pédagogique
À la fin, l'élève sait **grouper par client** (C3.3 : chaque carton sur la palette de son magasin), **contrôler** ses palettes avec la **liste de
colisage** avant de filmer, et **ne pas suivre** un raccourci qui mélangerait deux commandes.

## 4. Déroulé (≈ 50 min)

### Accueil (Samia)
« Bonjour {prénom} ! Aujourd'hui, deux magasins dans la même tournée de l'allée : {Marseille La Valentine} et {Nîmes}. Deux palettes. Le
terminal te dit chaque fois pour qui. Samia »

### Étape 0 — Avant de commencer (non notée) — §4 ter

### Étape 1 — Préparer deux commandes (Plan d'entrepôt, mode `preparation`, terminal vocal, lot 4)
- **8 lignes** dans l'ordre du circuit, **les deux magasins mélangés** : le terminal dit « Pour {La Valentine}. Allée … » à chaque ligne ; la pose
  propose **Palette {La Valentine} · Palette {Nîmes} · À côté**. **Deux lignes consécutives du même produit pour les deux magasins** (le piège des
  données). **Un carton abîmé** sur une ligne (rappel 8.16).
- **L'erreur induite** : après la 3e ligne, **Yanis** écrit (notification à l'écran) : « Salut ! On est en retard, mets tout sur une palette, on
  triera au quai. Yanis ». Aucun bouton ne « suit » Yanis : l'élève continue à poser où il veut. Le conseil n'est jamais repris par Samia avant
  l'écran de contrôle.

### Étape 2 — Contrôler mes palettes (lot 4)
- « Contrôler mes palettes » ouvre, pour chaque palette, **la liste de colisage** (ce que le système attend pour ce magasin) à côté du **dessin**
  de la palette. Le système ne dit pas où est l'erreur.
- L'élève peut **déplacer un carton** d'une palette à l'autre (clic carton, clic palette). Les deux chemins (tout juste / tout mélangé) arrivent
  ici.
- Message de Samia à l'ouverture (même texte pour tous) : « Avant de filmer, on compare chaque palette à sa liste. Un carton par ligne. Samia »

### Étape 3 — Filmer et étiqueter
Film et étiquettes **pour chaque palette** (l'étiquette porte le magasin : poser l'étiquette de Nîmes sur la palette de La Valentine est faux).
« Vérifier mes palettes » : verdict par palette et par critère.

### Étape 4 — Répondre à Yanis (Messagerie, phrases)
Réponse par phrases à Yanis : salutation · « je fais une palette par magasin, sinon on se trompe au quai » (juste) / « OK, je mets tout
ensemble » (piège) · politesse · fin. La ligne du fond est notée (elle dit la règle, non calculée).

### Fin
Samia : « Deux palettes, deux magasins, zéro erreur au quai : c'est le métier. Samia » ; bilan ; « Corriger » rouvre le contrôle, le film,
les étiquettes et la réponse (la préparation au terminal reste figée : le contrôle sert justement à corriger).

**Mots cliquables** : liste de colisage, grouper par client, palette, colis, contrôle, étiquette, tournée.

## 4 bis. Questions au fil — proposées (somme 4)

| id | Geste | Question (juste en gras) | Poids | Corrigée |
|---|---|---|---|---|
| `q-pour-qui` | 2e ligne posée | « Le terminal dit le magasin à chaque ligne. Pourquoi ? » — **parce que chaque carton doit aller sur la palette de son magasin** · pour faire joli · parce qu'il se trompe parfois | 0,75 | tout de suite |
| `q-colisage` | contrôle ouvert | « La liste de colisage, c'est… » — **la liste de ce qui doit être sur la palette** · la facture du magasin · la liste des préparateurs | 1 | tout de suite |
| `q-melange` | contrôle fermé | « Un carton de Nîmes part à La Valentine. Que se passe-t-il ? » — **Nîmes en manque, La Valentine en a trop : il faudra le reprendre et le renvoyer** · rien, c'est le même produit · le chauffeur s'en occupe | 1 | au bilan (proche du jalon) |
| `q-retour` | **écogeste / éco-droit** — palettes étiquetées | « Renvoyer un carton parti au mauvais magasin, ça coûte… » — **un transport en plus : du carburant, du temps et de l'argent** · rien, le camion repasse · seulement un coup de téléphone | 0,75 | tout de suite (C3.7, logistique inversée) |
| `q-yanis` | réponse à Yanis envoyée | « Yanis te demandait de tout mettre sur une palette. Tu aurais dû… » — **faire une palette par magasin et lui expliquer pourquoi** · obéir, il a plus d'expérience · ne rien répondre | 0,5 | tout de suite |

## 4 ter. Avant de commencer — banque proposée (non notée)
`k-lourds`, `k-fragile` (8.17) ; `k-abime` (8.16) ; `k-colisage` « Avant de filmer, on compare la palette à… » — **sa liste de colisage** · la
palette d'à côté · rien ; `img-etiquette` « Cette étiquette (nom du magasin, n° de commande) se colle… » — **sur la palette de ce magasin** ·
sur le terminal · sur le rack.

## 5. Jalons / notation (sur 20) — poids validés par Tristan (25/10/2026, 14 h 26)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Grouper par client** (C3.3) | chaque palette ne porte que ses lignes, après contrôle : 2,5 par palette | **5** | lot 4 | jugé sur l'état **final** (après déplacements) ; une palette vide = faux |
| **Prélever** (C3.2) | 8 lignes justes, 0,25 chacune | **2** | `ligne-…` | — |
| **Carton abîmé** (C3.2) | « Abîmé » dit et quantité reprise sur la pile (25/10) | **2** | lot 3 | pris sans rien dire = faux |
| **Calage** (C3.3) | lourds en bas et fragiles en haut, 1 par palette | **2** | ordre de pose (et déplacements) | jugé seulement si la palette porte ses lignes |
| **Poids et hauteur** (C3.3) | 1 par palette | **2** | palette | idem |
| **Film et étiquettes** (C3.3) | film 0,5 par palette · étiquettes du **bon magasin** 1 par palette | **3** | `film`, `etiquettes` | étiquette d'un autre magasin = faux |
| **Les questions** | §4 bis | **4** | moteur des questions | — |
| **Total** | | **20** | | |

- La réponse à Yanis : la ligne du fond est dans `q-yanis` (pas de jalon à part : une erreur ne se paie qu'une fois). Forme non notée ici.
- Inaction : 0/20. Par compétence (pour Tristan) : C3.2 = 4 ; C3.3 = 12 ; questions 4. *(C3.1 n'a pas de bloc propre : elle est dans les
  questions `q-pour-qui` et `q-yanis` ; à dire si Tristan veut un bloc C3.1.)*

## 6. Contenu (données)
`contenus/action-ent818.js`, `contenus/questions/ENT-8.18.js`, `activites/action-deux-magasins.js`, `contenus/corriges/ENT-8.18.js`.
Deux magasins tirés, **Nîmes toujours l'un des deux** (§0 d'ENT-8.15) ; 8 lignes (4 par magasin, 12 à 20 cartons par magasin) ; un produit
commun aux deux, sur deux lignes consécutives ; un abîmé ; les deux palettes tiennent toujours dans 600 kg / 1,80 m (contrôle).

## 6 bis. Tirage et niveaux
- Tirés : le second magasin, les lignes, la ligne abîmée, l'ordre du circuit (le produit commun toujours sur deux lignes consécutives).
- **Confirmé** : 10 lignes (bonus : les deux lignes de plus, `bonus: true`).
- **Accompagné** : au contrôle, chaque ligne de la liste de colisage se coche d'elle-même quand le carton est sur la palette (l'élève voit ce
  qui manque) ; règles ouvertes.

## 7. Demandes au moteur
E-8 lots 0 à 4 ; message de Yanis à `apresGeste('terminal:<id>:ligne:3')` (à vérifier : nom du geste au lot 1) ; la préparation au terminal
figée à la fin du terminal, le contrôle et le montage restent ouverts à « Corriger ».

## 8. Tests attendus
Bloc `action-818` (alerte 7). Deux parcours justes (graines différentes, dont un où l'élève suit Yanis puis corrige tout au contrôle) : 20/20 ;
inaction 0/20 ; tout sur une palette sans contrôle → grouper 0, étiquettes du bon magasin seulement là où elles le sont ; un carton déplacé au
contrôle rend « grouper » juste ; étiquettes inversées ; confirmé, accompagné ; somme 20 ; `part` 4. Sabotage : « grouper » jugé sur la pose au
terminal au lieu de l'état final → le parcours « suit Yanis puis corrige » tombe.

## 10. Critères de validation par Tristan
- Le message de Yanis tente vraiment (il arrive au bon moment, notification visible).
- La liste de colisage et la palette se comparent d'un coup d'œil, sans défilement à 1366 × 768.
- 50 minutes suffisent.

## 11. Questions ouvertes
1. **Tranché par Tristan (25/10)** : poids du §5 (sans bloc C3.1 à part). **Proposé** : questions, retours, banque ; Yanis comme auteur de l'erreur induite ; Nîmes toujours
   dans le lot.
