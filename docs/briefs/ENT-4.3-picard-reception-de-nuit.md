# Brief de séance — ENT-4.3 Picard, la réception de nuit (erreur induite)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-picard.md, docs/briefs/ENT-3.3-deux-temps.md (le modèle des deux temps) puis implémente le brief docs/briefs/ENT-4.3-picard-reception-de-nuit.md. Annonce la durée, liste ce que la vue quai doit gagner (§7), fabrique une page d'essai puis enchaîne sur la séance sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : à implémenter — **après** ENT-4.2
**Date du brief** : 03/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-picard-4-seances.md`

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-4.3 / `picard-ent43` |
| Titre | « Picard — la réception de nuit » |
| Niveau | 1re |
| Compétence | **C1.4** (sous-compétence C1.4.2 « Contribuer à l'ouverture d'un dossier litige ») |
| Temps pédagogique | erreur induite |
| Notation | jalons + note sur 20 ; bilan à la fin |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : art. L133-3 du Code de commerce, **version en vigueur depuis le 10/12/2009, lue sur Légifrance le
  03/10/2026** : la réception éteint toute action contre le transporteur pour avarie ou perte partielle si, **dans les
  trois jours** (non compris les jours fériés) qui suivent la réception, le destinataire n'a pas notifié **par acte
  extrajudiciaire ou par lettre recommandée** sa **protestation motivée**. « Sous réserve de déballage » n'a aucune
  valeur juridique (Transcourrier).
- **Construit** : le collègue de nuit (**personnage fictif**, prénom neutre, aucun salarié réel), sa fiche, ses erreurs,
  le transporteur fictif, les données. Pas de photo nouvelle (le quai de nuit peut être la photo assombrie).

## 3. Objectif pédagogique

**Contrôler le travail d'un autre** et en tirer les suites : repérer trois erreurs de réception à partir des documents
(et d'un recomptage), ne pas accuser ce qui est conforme, **bloquer** une marchandise douteuse, **ouvrir un litige**
(protestation motivée au transporteur dans le délai) et **rendre compte** au chef de quai. Leçon métier : un produit
recongelé a déjà perdu sa qualité, la sonde du lendemain ne le voit plus — **la preuve est dans les documents**.

## 4. Déroulé : deux temps, comme ENT-3.3 (décision de Tristan)

**Accueil (6 h 00)** : mail du chef de quai : « Mathis (fictif, réceptionnaire de nuit) a réceptionné le camion de 3 h.
Vérifie sa réception avant que le transporteur ne soit trop loin. » Le camion est reparti ; les palettes sont en
chambre froide.

**Temps 1 « Contrôler »** — le travail du collègue est **FIGÉ** (lecture seule) :
- pièces du dossier : **BL signé** avec la mention « sous réserve de déballage », **ticket** de l'enregistreur, **fiche
  de comptage et de sonde** du collègue (« N2 : −14 °C à cœur — OK », « N3 : 40 cartons », etc.), son message
  « RAS, tout est rentré » ;
- en chambre froide : l'élève peut **recompter** (palette 3D), **relire les étiquettes**, **re-sonder** (toutes les
  palettes sont maintenant à −21 °C environ : la sonde ne prouve plus rien) ;
- il **envoie son diagnostic au chef de quai** : **message à lignes à intitulé** (comme ENT-2.3), lu par les jalons,
  ex. « Palette acceptée à tort : », « Preuve : », « Manquant : », « Réserve : ». **Cet envoi ouvre le temps 2**
  (`apresMail`, que le contenu soit juste ou faux : ne jamais révéler la réponse par l'arrivée).

**Temps 2 « Corriger »** :
- **bloquer** la palette tiède (geste dans le quai : étiquette « Bloqué — qualité », emplacement à part) ; ne pas bloquer
  les autres ;
- **protestation motivée au transporteur** : message à lignes « BL : », « Réceptionné le : », « Palette : »,
  « Constat : », « Quantité : » ; le site rappelle que **la vraie protestation part en lettre recommandée dans les 3
  jours** ;
- bouton « J'ai terminé » (sans verdict pendant le travail), puis bilan.

## 5. Les erreurs et la fausse piste (3 + 1, décision de Tristan)

| Palette | Ce que montre le dossier | Réalité | Attendu |
|---|---|---|---|
| N1 | couche du dessus incomplète | **conforme au BL** (fausse piste) | ne rien signaler |
| N2 | fiche du collègue : « −14 °C à cœur — OK », acceptée | température non conforme à la réception | signaler, **bloquer**, protestation |
| N3 | fiche : « 40 cartons » (= BL) | **37 réels** (3 manquants, dont un au cœur sous la couche du dessus) | signaler, protestation (quantité 3) |
| N4, N5 | conformes | conformes | rien |
| BL | « sous réserve de déballage » | réserve sans valeur | signaler ; d'où la protestation dans les 3 jours |

Délai : réception à 3 h le jour même → **dans le délai** (le diagnostic doit le dire).

> **Règle du quai pour la température à cœur (décision de Tristan, 03/10/2026, après ENT-4.2)** — vaut pour toutes
> les séances Picard. **−18 °C ou plus froid : accepter. Entre −18 et −15 °C : accepter avec réserves — température,
> en écrivant la valeur relevée. Au-dessus de −15 °C : refuser — température.** Vérifié : −18 °C exigé, tolérance
> brève −15 °C au déchargement ; les trois zones sont une règle du quai, construite (à annoncer comme telle). La vue
> l'applique d'elle-même pour un camion qui se réchauffe (`seuilReserve`, `seuilRefus`) ; pour les autres palettes, le
> contenu déclare `attendu` / `motifAttendu` conformes : un test du bloc `picard` relit chaque `contenus/picard-ent4*.js`
> et refuse une palette hors de la règle.

## 6. Aides

Erreur induite = pas de chef de quai qui guide, pas de repère P1. Indices dans les documents seulement. Bilan à la fin.

## 7. Ce que la vue quai doit gagner (chantier P4)

- Un **quai « déjà réceptionné »** : état initial chargé depuis le contenu (BL signé, mention, fiche du collègue,
  palettes en chambre froide), **en lecture seule au temps 1** (même principe que la feuille figée d'ENT-3.3).
- Le contrôle **en chambre froide** (recompter, relire, re-sonder) sans redécharger.
- Le geste **« Bloquer »** (et « Débloquer » tant que le temps 2 n'est pas clos).
- Un bouton **« Messagerie »** qui ouvre l'environnement de l'entreprise et revient au quai (plein écran tranché).
- Passage temps 1 → temps 2 par `apresMail` (fabriques existantes de `core/declencheurs.js`).

## 8. Jalons (à préciser par Claude Code)

Diagnostic : N2 signalée avec sa preuve (la fiche) · N3 signalée avec la quantité (3) · mention « déballage »
signalée · **N1 non accusée** (vrai seulement si le diagnostic a été envoyé) · N2 bloquée · aucune autre bloquée ·
protestation : BL, date, palette(s), constat, quantité justes. Lecture des lignes sans accents ni majuscules (comme
ENT-2.1 / 2.3).

## 9. Tests

Temps 1 figé (aucun geste ne modifie le dossier) ; envoi du diagnostic (même faux) → temps 2 ouvert ; re-sonde N2 à
−21 °C (la sonde ne « trahit » pas la réponse) ; N1 accusée → jalon faux ; bloquer N4 → jalon faux ; protestation sans
quantité → faux ; inaction → aucun jalon vrai.

## 10. Supports

Trame élève Word/PDF (Cowork) ; corrigé `contenus/corriges/ENT-4.3.js` (diagnostic + protestation attendus).

## 11. Questions ouvertes

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter pour les questions ci-dessous ; appliquer ces choix, et **lister au compte rendu** tout ce que tu as choisi seul (noms, textes, chiffres) pour que Tristan le corrige à l'écran.

- [x] **Intitulés des lignes** (tranché le 03/10/2026) : **écrits par Claude Code** à partir des exemples du §4
  (diagnostic : « Palette acceptée à tort », « Preuve », « Manquant », « Réserve » ; protestation : « BL », « Réceptionné
  le », « Palette », « Constat », « Quantité »), ajustés si les jalons l'exigent. Tristan les lit en jouant la séance.
- [x] **Collègue de nuit : « Mathis »** (personnage fictif).
- [x] **Mail d'accueil** : celui du §4, mis en forme par Claude Code.
- [ ] Faut-il une variante « livraison vieille de 4 jours → plus de recours » pour une autre séance ? (en réserve)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
