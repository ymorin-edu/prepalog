> *Copie du 02/10/2026 de la fiche `claude/prepalog-notes-competences.md` du projet Claude
> PREPALOG (source de conception : le projet). Voir `docs/LISEZMOI.md`. Les mentions de commit par
> Tristan dans GitHub Desktop sont historiques.*

# Prepalog — chantier « notes par compétence » (livré le 02/10/2026)

Cadrage : `prepalog-finalite.md`, section B.

## Ce qui a été livré

- **`core/competences.js` (neuf)** : libellés officiels C1.1 à C3.4 (arrêté du 8 janvier 2025),
  les quatre temps (`guidage`, `entrainement`, `erreur`, `evaluation`), coefficients par défaut
  1 / 1 / 1 / 3, `coefsDuGroupe`, `noteDeSeance` (toute séance ramenée sur 20, jalons compris),
  `seancesParCompetence` (ordre du référentiel), `moyenneCompetence` (pondérée, deux décimales).
- **16 séances déclarent `competences` et `temps`** dans leur `meta` (tableau ci-dessous).
- **`core/prof.js`** : onglet **« Compétences »** entre « Suivi de classe » et « Conduite de
  séance » :
  - coefficients du groupe (quatre cases, 0 à 10, pas de 0,5), bouton « Enregistrer » et
    « Revenir aux coefficients par défaut » ; rangés dans `groupes/{gid}.coefs` via
    `B.majGroupe` — **aucune règle Firestore à changer** (`allow update: if profDuGroupe(gid)`) ;
  - tableau élève × compétence : moyenne /20, « (faites/total) », infobulle avec le détail de
    chaque séance (temps, coef, note ou « pas faite ») ;
  - tableau « Les séances de chaque compétence » (sert aussi de carte de couverture) ;
  - **export CSV** `competences-{gid}.csv`, une ligne par élève × compétence : Nom ; Prénom ;
    Compétence ; Libellé ; Séances (temps, coefficient, note sur 20) ; Séances faites
    (« 2 sur 7 », pas « 2/7 » qu'Excel lirait comme une date) ; Moyenne pondérée /20.
- **`styles/base.css`** : `td.juste .note{color:inherit; opacity:.85}` — le « /20 (2/7) » était
  illisible (gris sur vert) dans une cellule verte. Le défaut existait déjà dans le suivi de
  classe, corrigé du même coup. Vérifié en clair et en sombre.
- **`outils/test.mjs`** (alerte n° 7) : **trois cas ajoutés**, aucun réécrit — calcul à l'unité
  (valeurs à la main : 15,6 ; 15,33 ; pas de faux zéro), tableau des déclarations figé, écran +
  coefficients (avec rechargement complet) + export. **163/163.** Quatre sabotages, quatre
  détections (jalons exclus, coefficient ignoré, SCE-2 passé en guidage, coefficient non
  enregistré en base — ce dernier n'était PAS détecté avant l'ajout du rechargement).

## Mettre 0 à un élève présent qui n'a rien fait (ajouté le 02/10, demande de Tristan)

- Onglet « Suivi de classe » : sur une séance corrigée par le site, le tiret « — » d'une case
  vide est un bouton (au survol : « 0 ? »). Un clic met **0** via `B.poserNote(…, { score: 0,
  max: meta.bareme })` (marqué `parProf: true`). La case affiche « 0/20 posé × » (ou « 0/3 »
  pour des jalons) ; la croix efface le 0. Pas de confirmation : tout est réversible.
- **Choix de Tristan : case par case** (pas de saisie en lot), et **la vraie note remplace le 0**
  si l'élève fait la séance plus tard (`ecrireScore` garde le meilleur score et ne recopie pas
  `parProf`).
- Un 0 **compte** dans la moyenne par compétence ; un tiret (absent, pas fait) **ne compte pas**.
- Un 0 ne débloque pas la séance suivante d'un parcours (le verrou lit la photo dans la base
  de l'élève, pas le score).
- Les colonnes notées à la main (SCE) acceptaient déjà 0 dans leur case de saisie.
- Test ajouté (164/164), deux sabotages détectés.

## Règles de calcul

- Une séance pas faite **ne compte pas pour zéro** : elle n'entre pas dans la moyenne.
- Jalons (`notation: 'avancement'`) convertis sur 20 **ici seulement** ; le suivi garde « 3/3 ».
- Note saisie à la main (`notation: 'prof'`) ramenée sur 20 depuis son barème.
- Une séance à deux compétences compte pour les deux.
- Coefficient 0 = ce temps sort des moyennes. Tout à 0 = « — », pas zéro.
- Une séance sans `temps` ou sans `competences` n'entre pas dans le tableau (un test interdit
  une compétence déclarée sans temps).

## Déclarations validées par Tristan (02/10)

| Séance | Compétence | Temps |
|---|---|---|
| DEC-1 La chaîne logistique | C1.1 | guidage |
| QUI-5 Les flux logistiques | C1.1 | entraînement |
| QUI-6 Zones de l'entrepôt | C1.1 | entraînement |
| QUI-7 Calculs de stock | C1.6 | entraînement |
| TAB-2 Excel, gestion des stocks | C1.6 | entraînement |
| TAB-4 Une journée en entrepôt | C1.4 + C1.6 | entraînement |
| TAB-5 Inventaire tournant | C1.6 | entraînement |
| ENT-1.1 Spartoo, réception | C1.4 | guidage |
| ENT-1.2 Spartoo, préparation | C2.2 | guidage |
| ENT-1.3 Spartoo, traçabilité | C3.2 | guidage |
| ENT-3.1 Boost, tournée | C2.4 | guidage |
| SCE-1 Yves Rocher | C1.6 | guidage |
| SCE-2 Foot Locker | C1.6 | **évaluation** |
| SCE-3 Bouygues Telecom | C1.6 | **évaluation** |
| SCE-4 Brasseries du Gâtinais | C1.5 | guidage |
| SCE-5 Réception sur plateforme | C1.3 + C1.4 | guidage |

- **Hors tableau** (transversaux, voulu) : TAB-1, TAB-3, QUI-8, QUI-9, QUI-10. ACT-1 sans note.
- Codes de compétence (C1.6), pas les sous-codes, pour l'instant.
- Le module SCE sera migré dans Simulog (finalité, décision 12) : reporter ces lignes.

## Pour toute séance nouvelle

Ajouter dans `meta` :

```js
competences: ['C2.4'],
temps: 'entrainement',   // guidage | entrainement | erreur | evaluation
```

**puis ajouter la ligne au tableau `ATTENDU` du test** « chaque séance déclare ce que Tristan a
validé » (sinon rien ne protège la déclaration). Changer une ligne de ce tableau, c'est changer
une note de bulletin : le dire à Tristan.

## Mode sombre

Question de Tristan le 02/10 (« si le mode sombre demande trop de travail on peut oublier ») :
**il ne coûte presque rien** — l'écran Compétences n'a demandé aucun travail spécifique, tout
passe par les couleurs de thème. Seule précaution récurrente : les aplats fixes (alerte n° 33,
voir `CLAUDE.md`).
