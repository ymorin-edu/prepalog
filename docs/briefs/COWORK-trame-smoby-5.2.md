# Brief — trame élève ENT-5.2 Smoby, BROUILLON (déposée par Cowork le 06/10/2026 au soir)

> **📋 Phrase à copier-coller dans ccode (seulement quand Tristan le dit) :**
>
> ```
> Lis docs/briefs/COWORK-trame-smoby-5.2.md : commite les fichiers de la trame ENT-5.2 déposés par Cowork (liste §2), sans rien déclarer. Ne touche à aucun autre fichier.
> ```

**Statut** : **livré** le 06/10/2026 au soir (relue par Tristan, déclarée pour la classe du 07/10).

## 1. Ce que c'est

Trame élève d'ENT-5.2 au **format long** (comme ENT-5.1, décision de Tristan du 06/10 au soir) : 7 étapes + feuille de
cours à détacher, 9 pages. Écrite **avant** la validation à l'écran, à la demande de Tristan (« 5.2 go »), pour n'avoir
plus qu'à l'ajuster après le test.

Étapes : 1 Lire le message de Sophie (QCM M5 CDD saisonnier) · 2 Les pièces à demander (tableau oui / non / pourquoi,
QCM DPAE à l'Urssaf) · 3 Le premier jour (rang des 5 étapes dans l'ordre de départ de l'écran, encadré « Le CACES ne
suffit pas », QCM autorisation de conduite et EPI) · 4 Le planning : compter avant de poser (règles, tableau des
présents « si on accorde tout », trouver le mer 16) · 5 Poser les absences et envoyer (QCM absence imposée, réflexion
Karim / Léa) · 6 L'imprévu (Inès, Noa, le lun 14, Chloé décalée ; QCM intérimaire) · 7 Le point avec Sophie (« tu poli »).
Feuille : recto cours seulement (`feuille_cours`).

## 2. Fichiers déposés (neufs)

- `outils/trame-smoby-arrivee.py` : le générateur. Il inscrit lui-même ses réponses dans `corriges_data._DICOS`
  (`outils/corriges_data.py` **non modifié**). Les données du planning y sont recopiées depuis `contenus/smoby-ent52.js`
  (relues le 06/10) ; le tableau des présents, les dates possibles des congés et la solution `SOLUTION` sont
  **recalculés et vérifiés** par le script (il s'arrête si la solution ne respecte pas les règles, ou si le congé de
  Léa trouvait une place : la question de l'étape 5 repose là-dessus).
- `contenus/trames/ENT-5.2-smoby-arrivee-trame-eleve.docx` et `.pdf` ;
- `contenus/corriges/ENT-5.2-trame.js` (généré : 42 questions). Le corrigé calculé `ENT-5.2.js` **n'est pas touché**.

Message de commit proposé : « Smoby : trame élève ENT-5.2 et son corrigé (brouillon, non déclarée) ».

## 3. À revoir après le test du 07/10 (marqué « À REVOIR APRÈS LE TEST » dans le générateur)

- **Étapes 4 à 6 (planning)** : mots de l'écran repris (menu « Planning des présences », ligne « Besoin », cartes
  « Demandes d'absence », compteurs). Si le lot C change l'affichage, la confirmation avant envoi ou les libellés, les
  recaler. « Envoie le planning » est écrit sans le libellé exact du bouton exprès.
- **Durée** : 7 étapes pour une heure déjà chargée ; le tableau de l'étape 4 (10 jours) est le plus long. Version
  courte possible : supprimer ce tableau et ne garder que « Quel jour manque-t-il du monde ? ».
- Ordre de départ du premier jour (étape 3) : recopié de `DEPART` dans le contenu. S'il change, le recopier.

## 4. Plus tard, quand Tristan aura relu la trame (pas avant)

1. Retirer `sansTrame` et déclarer `trame: { pdf, docx }` dans `activites/smoby-arrivee.js`.
2. Dans `contenus/corriges/ENT-5.2.js`, importer `CORRIGE` de `./ENT-5.2-trame.js` et ajouter ses `items` après ceux
   calculés (comme Picard).
3. Régénérer : `python3 outils/trame-smoby-arrivee.py` puis
   `soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.2-smoby-arrivee-trame-eleve.docx`.

## 5. Vérifié / construit

- Vérifié : lien direct et nécessaire avec le poste (art. L1221-6) ; DPAE à l'Urssaf avant l'embauche ; autorisation de
  conduite délivrée par l'employeur (art. R4323-56) ; EPI fournis gratuitement par l'employeur (art. R4323-95) ;
  l'intérimaire est salarié de l'agence. Note enseignant au corrigé : en droit, les dates de congé ne se modifient pas
  moins d'un mois avant le départ sauf circonstances exceptionnelles (art. L3141-16) ; la séance simplifie.
- Construit (comme la séance) : Sophie, l'équipe, les besoins, les absences, l'imprévu.

## Compte rendu *(rempli par Claude Code)*

06/10/2026 au soir, à la demande de Tristan (trame relue par lui, sert en classe le 07/10) :
- Fichiers du §2 commités tels que déposés (générateur non relancé : `.docx`/`.pdf` sont ceux de Cowork).
- §4 fait : `sansTrame` retiré et `trame: { pdf, docx }` déclaré dans `activites/smoby-arrivee.js` ; le corrigé de la
  trame (42 questions) s'ajoute après le corrigé calculé dans `contenus/corriges/ENT-5.2.js`, étapes marquées
  « (trame) » comme chez Picard.
- À savoir : la trame s'intitule « l'arrivée de Yanis » alors que le titre de la tuile dit depuis ce soir « l'arrivée du
  cariste » (l'écran de la séance, lui, dit toujours « Séance 2 : l'arrivée de Yanis »). Non corrigé : c'est au
  générateur de Cowork de changer s'il le faut.
- Le §3 (à revoir après le test) reste ouvert.
