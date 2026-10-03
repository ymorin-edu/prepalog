# Brief de séance — ENT-2.3 Cdiscount « Inventaire tournant » (recadrage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/ENT-2.3-inventaire-recadre.md : d'abord le lot moteur du §7 (écran Inventaire, commité à part), puis la séance. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : à implémenter — après la renumérotation (C3). **N'attend pas le geste tableur** (C5).
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 2 à 3 h (lot moteur 45 min à 1 h, séance et tests 1 h 30 à 2 h).
**Touche le moteur** : **oui pour le lot 0** (`core/types/inventaire.js`, `outils/test/inventaire.mjs`) → s'inscrire
dans `docs/EN-COURS.md` comme chantier moteur, commiter ce lot à part, puis la séance.
**Conception** : `claude/prepalog-cdiscount-serie-decisions.md` (décisions 1, 2, 8) ; fil rouge
`claude/prepalog-cdiscount-recadrage.md` ; format de l'inventaire `claude/prepalog-inventaire-format.md`.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-2.3 / `cdiscount-inventaire` (**id inchangé** ; code déjà changé en C3) |
| Titre | « Cdiscount — inventaire tournant » (inchangé) |
| desc | « Recompter les références qu'on a choisies, calculer les écarts, retrouver leur cause, décider et valider l'inventaire. » |
| Niveau / compétence | 1re / C1.6 (C1.6.2 inventaire) |
| Temps | entraînement (inchangé) |
| Notation | `avancement`, **5 jalons inchangés** |
| Volume | 8 références dans l'allée, 16 documents, 27 mouvements (inchangé) ; l'élève ne saisit que sa liste |
| Ouverture | `pret: true, ouverture: 'prof'` (posé en C3) |

## 2. Vérifié / construit

Inchangé (en-tête de `contenus/cdiscount.js` et de `contenus/cdiscount-inventaire.js`). Nouveau, **construit** : le
collègue qui a préparé la liste de l'élève absent, le préparateur qui signale un rayon douteux.

## 3. Objectif

En ENT-2.2, l'élève a analysé dans le tableur les constats d'écart des préparateurs et **choisi les références à
recompter** (message « À recompter : … » à Nadia). En ENT-2.3 il **recompte sa liste** : il reporte le relevé pour ces
références seulement, calcule les écarts, en cherche la cause (pièges validés : la paire de cartons qui s'annule, les
batteries rangées ailleurs après une préparation annulée, la ligne témoin de démarque inconnue), décide et calcule le
taux d'écart. **Le relevé couvre toute l'allée**, l'élève n'en saisit qu'une partie. Une référence douteuse **oubliée**
en ENT-2.2 **revient comme un aléa** : il la traite quand même, et son oubli ne se paie qu'une fois (dans ENT-2.2).

## 4. Déroulé

1. **Ouverture** : Bienvenue (garde existante) + message de Nadia : « Rappelez-moi les références que vous avez
   retenues » ; réponse à **amorce `À recompter : `**. Les messages d'enquête d'aujourd'hui arrivent aussi à l'ouverture
   (Kevin : doute sur la palette Kabeo ; Inès : annulation de CMD-732153 ; retour RET-26-0107 ; casse DEM-26-0031).
2. **L'élève répond** `À recompter : …`. Le site **extrait les références connues de l'allée A** (§ 11 : fautes
   ignorées) ; la **première réponse reconnue fixe la liste** (les suivantes ne changent rien).
   - Au moins une référence reconnue → Nadia accuse réception, neutre (« C'est noté : vous recomptez … ») ; puis le
     **relevé de comptage** (toute l'allée, `kind: 'releve'`) et la **mission** (reprise de l'actuelle, réécrite pour
     « les références de votre liste ») ; puis, **pour chaque référence à écart absente de la liste**, l'**aléa** d'un
     préparateur (§ 5) : la référence s'ajoute à ce qu'il doit compter.
   - Réponse **« Absent »** (le mot, seul, sans référence) → le site envoie **la liste préparée par un collègue** (la
     bonne : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01), puis le relevé et la mission. **« Absent » n'est écrit dans
     aucun message : c'est Tristan qui le dit à l'élève** (fiche d'intention).
   - Ni référence ni « Absent » → un seul rappel de Nadia (« Je n'ai reconnu aucune référence de l'allée A… ») ; rien
     d'autre n'arrive tant qu'une réponse reconnue n'est pas envoyée.
3. **Écran Inventaire** (réglages du 02/10 inchangés : aveugle, écarts et taux par l'élève, correction détaillée, motif
   obligatoire) **sur le périmètre de l'élève** = sa liste + les références revenues par aléa (intrus compris : une
   référence sans écart se compte, écart 0, aucune décision). Tant que la liste n'est pas reçue : l'écran dit « En
   attente de votre liste : répondez à Nadia Ferrand (Messagerie) ».
4. Validation définitive ; correction détaillée.

## 5. Les messages nouveaux

| Arrivée | De | Contenu |
|---|---|---|
| ouverture | Nadia | « Bonjour <prénom>, avant que l'équipe ne vous envoie son relevé, rappelez-moi les références de l'allée A que vous avez retenues après l'analyse des constats. Répondez en commençant par « À recompter : », les références séparées par des virgules. » (amorce `À recompter : `) |
| liste reconnue | Nadia | « C'est noté : vous recomptez <références reconnues, dans l'ordre des emplacements>. L'équipe inventaire vous envoie son relevé de l'allée. » (ne dit jamais si la liste est bonne) |
| « Absent » | Nadia | « Pas de souci. Voici la liste préparée par Mathis Darrigade, de l'équipe stock : À recompter : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01. Le relevé arrive. » |
| rien de reconnu (une fois) | Nadia | « Je n'ai reconnu aucune référence de l'allée A dans votre message. Renvoyez-moi la liste, références écrites comme sur l'écran Stock. » |
| après la liste, pour chaque référence à écart oubliée | Yanis Cazenave, préparateur | CHG-20W : « En préparant ce matin, j'ai trouvé moins de chargeurs CHG-20W en A-01-2 que ce que le système affiche. Quelqu'un peut recompter ? » — CAB-USBC-1M : « Le bac A-01-1 des câbles déborde : il y a plus de boîtes que ce que le système affiche. » — BAT-10K : « Il manque des batteries BAT-10K en A-03-1 par rapport au système. » — COQ-UNI-01 : « Il manque des coques COQ-UNI-01 en A-04-2 par rapport au système. » Objet : « Rayon à vérifier : <réf> » |

## 6. Données (`contenus/cdiscount-inventaire.js`)

**Base = l'ancienne ENT-2.2, pièges compris** (validée le 03/10) : allée A, 8 références, relevé et explications
inchangés (CHG −3 / CAB +3 dans le bac des câbles ; BAT −2 après la préparation annulée ; COQ −2 témoin), taux calculé par
l'élève sur **son** périmètre (recalculé par `bilanInventaire`).

Deux changements de cohérence avec ENT-2.2 (qui exporte les mêmes bons de préparation) :

1. **« Stock trouvé » des bons de préparation = stock réel au rayon** (comme ENT-2.1, décision 3) : CHG −3 et CAB +3 après
   REC-26-0431, BAT −2 après REI-26-0012, COQ −2 après la démarque (placée entre l'inventaire précédent et CMD-732126).
   Calculé par le code sur un stock réel parallèle. Le comptage reste à l'aveugle : le stock **système** reste caché.
2. **CMD-732153** semée avec `annulee: { motif: 'Annulée par le client pendant la préparation', at }` (statut C1) ; ses
   mouvements (sortie puis REI-26-0012) inchangés.

Constantes à exporter pour ENT-2.2 (qui les importe) : `REFS_A_ECART = [CAB, CHG, BAT, COQ]`, les commandes, la date de la
démarque COQ, les fonctions de calcul du stock réel. **Une seule source** pour les deux séances.

## 7. Demande au moteur — lot 0, commité à part (`core/types/inventaire.js`)

Aujourd'hui `bilanInventaire` exige une saisie sur **toutes** les lignes (`saisieOk` faux si une ligne est vide).
Ajout : la déclaration `inventaire` peut porter

```js
perimetre(db) { return ['CAB-USBC-1M', 'CHG-20W'] /* ou null tant que rien n'est choisi */ }
```

- `perimetre` absent → comportement actuel, aucune séance existante ne change.
- `null` → l'écran affiche un message d'attente fourni par la séance (`attentePerimetre: '…'`) et ne crée pas d'état.
- tableau → l'écran, `etatNeuf` (photo du système), `bilanInventaire` (saisie, écarts, décisions, taux) et le récapitulatif
  ne voient **que ces lignes**, dans l'ordre des emplacements ; le relevé de la messagerie reste complet.
- Si le périmètre s'agrandit après le début (robustesse ; le scénario ne le fait pas), les lignes nouvelles s'ajoutent à
  l'état avec leur photo du moment.
- Tests dans `outils/test/inventaire.mjs` : sans `perimetre` → inchangé ; périmètre de 3 lignes → `saisieOk` avec 3
  saisies ; taux calculé sur 3 lignes ; **sabotage** : ignorer le périmètre → le cas « 3 saisies suffisent » échoue.

Une ligne dans `claude/prepalog-inventaire-format.md` est à ajouter par Cowork ensuite : **le dire au compte rendu**.

## 8. Jalons

Les 5 d'aujourd'hui (comptage, écarts, rangements, témoin, taux), **lus sur le périmètre**. Les quatre références à écart
y sont toujours (liste ou aléa) : `REFS_RANGEMENT` et `REF_TEMOIN` ne changent pas. Aucun jalon sur la liste elle-même
(elle est jugée en ENT-2.2). Rien ne doit récompenser l'inaction : périmètre `null` → tous `na` ou `attente`.

## 9. Tests (`outils/test/cdiscount.mjs`)

Valeurs écrites à la main :
- liste exacte (4 références) → 4 lignes à saisir, aucun aléa, 5/5 avec les bonnes décisions ;
- liste sans CAB → aléa CAB reçu, CAB dans le périmètre, 5/5 possible ;
- liste avec un intrus (ECO-BT-01) → 5 lignes, écart 0 pour ECO, taux recalculé (valeur à la main) ;
- « Absent » → liste du collègue, 4 lignes ;
- fautes : « chg20w, Cab-Usbc-1m ; bat 10k » → 3 références reconnues ;
- rien de reconnu → un seul rappel, pas de relevé ; une seconde réponse reconnue débloque ;
- deux réponses reconnues → la première fixe la liste ;
- « Stock trouvé » des BP : CHG et CAB décrochés de 3 après REC-26-0431 (valeurs à la main) ;
- CMD-732153 s'affiche « Annulée » ;
- **sabotages** : extraction sensible à la casse ; « Absent » écrit dans un message ; jalons lus sur l'allée entière.

## 10. Supports et validation

- Trame élève : **oui, nouvelle** (Cowork, après validation à l'écran) ; jusque-là `sansTrame` gardé. Pas de corrigé
  fixe (l'écran donne la correction détaillée ; la fiche d'intention dira les quatre écarts).
- **Tristan valide** en jouant trois fois : liste exacte ; liste sans CAB (l'aléa arrive, la paire se résout) ;
  « Absent ».

## 11. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul.

Décisions de fond : l'élève redonne lui-même sa liste ; « Absent » dit par l'enseignant, jamais écrit ; oubli = aléa ;
données de l'ancienne ENT-2.2, pièges compris ; écarts et taux calculés par l'élève.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] **Extraction** : sur la ligne « À recompter : » (sinon tout le message), on ignore casse, espaces, tirets et
  ponctuation ; un mot qui ne correspond à aucune des 8 références est ignoré sans message.
- [x] **« Absent »** : reconnu si la ligne ne contient aucune référence et contient le mot « absent » (casse et accents
  ignorés).
- [x] **La liste est calculée depuis la messagerie** (fonction pure de `db.mails`), pas rangée dans un état à part :
  rien à cloisonner de plus que la base de la séance.
- [x] **Moment de l'aléa** : en même temps que le relevé (quelques minutes plus tard dans l'horodatage), pas après la
  saisie — évite de rouvrir un comptage commencé.
- [x] **Noms construits** : Mathis Darrigade (équipe stock, auteur de la liste du collègue) ; Yanis Cazenave
  (préparateur, auteur des aléas) ; adresses en `.example`.
- [x] **Textes** des messages : ceux du § 5.
- [x] **Cohérence avec ENT-2.2** : « Stock trouvé » des BP sur le stock réel ; constantes partagées exportées par ce
  fichier.
- [x] **Lot moteur** mené dans la même conversation mais inscrit et commité à part (une séance n'écrit pas dans `core/`
  sans chantier déclaré).
- [x] Mission (texte actuel de `mailMission`) : « huit emplacements » → « les références de votre liste » ; le reste
  inchangé.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **API du périmètre livrée** (pour la fiche du format) :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
