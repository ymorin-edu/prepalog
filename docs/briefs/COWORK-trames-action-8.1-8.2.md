# Brief — trames élève ENT-8.1 et ENT-8.2 Action (CAP OL), déposées par Cowork le 15/10/2026 au soir

> **📋 Phrase à copier-coller dans Claude Code (seulement quand Tristan le dit) :**
>
> ```
> Lis docs/briefs/COWORK-trames-action-8.1-8.2.md : commite les fichiers des deux trames Action déposés par Cowork (liste §2), sans rien déclarer. Ne touche à aucun autre fichier.
> ```

**Statut** : déposé, **non commité, non déclaré** (une trame se déclare quand Tristan l'a relue).

## 1. Ce que c'est

Les trames élève d'ENT-8.1 et ENT-8.2 au **format court** (règle du 07/10/2026 depuis France Boissons : pas de texte à trous, pas
de corrigé de trame ; briefs ENT-8.1 et ENT-8.2 §9). Écrites **avant** l'essai à l'écran par Tristan, d'après le code livré le
15/10 au soir. Noir et gris seulement (seuls les logos sont en couleur).

| Trame | Pages |
|---|---|
| ENT-8.1 (2 pages) | p. 1 : logos, nom/classe, **je me connecte** (Prepalog → matricule → Simulog → logo Action → ENT-8.1), ma mission, déroulé à cocher, vrai/construit · **cours** (feuille à part) : la chaîne en 6 cases (schéma, « je suis en stage ici » sur Ensuès), qui fait quoi (Action / Geodis client-prestataire), ce que change mon travail, régions et départements (carte muette IGN, tableau « mes trois lieux » à compléter à la fin avec la carte de l'écran), 4 mots du lexique |
| ENT-8.2 (3 pages) | p. 1 : idem pour ENT-8.2 · p. 2 **brouillon** : planigramme vierge (4 quais × 6 h-12 h, demi-heures) à recopier depuis le document de Julie, le nouveau camion (durée, quais libres), notes du compte rendu · **cours** (feuille à part) : les 6 zones dans l'ordre du tour, l'équipe (4 métiers), les 3 documents, rendre compte, 8 mots du lexique |

**Le cours est une feuille à part** (section « page impaire » : en recto-verso, il ne s'imprime jamais au dos de la page 1 ou du
brouillon) et porte la mention « **distribué à la fin de la séance** » : il donne des réponses notées (ordre de la chaîne, Action
client de Geodis, qui fait quoi, les documents). À imprimer à part si Tristan distribue la trame au début.

Aucune valeur tirée par élève (heure et quai du camion du Havre, n° de commande, N et k) n'est imprimée.

## 2. Fichiers déposés (tous neufs)

- `outils/trame-action.py` : le générateur des deux trames (dessine aussi le schéma de la chaîne et la carte muette avec matplotlib,
  à partir de `contenus/france-contours.js` : aucune image ajoutée au dépôt). Lancer : `python3 outils/trame-action.py`, puis
  `soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/<fichier>.docx`.
- `contenus/trames/ENT-8.1-action-se-situer-trame-eleve.{docx,pdf}`
- `contenus/trames/ENT-8.2-action-prise-de-poste-trame-eleve.{docx,pdf}`
- ce brief.

Message de commit proposé : « Action : trames élève ENT-8.1 et ENT-8.2 (brouillons, non déclarées) ».

## 3. À revoir après l'essai à l'écran (marqué en tête du générateur)

- Textes repris du code (LEXIQUE, EQUIPE, CHAINE, QUAIS, ECHELLE, VISITE, CHOIX_DOCS) : si Claude Code les change après l'essai, recaler
  les constantes en tête de `trame-action.py`.
- Libellés de connexion (« pastille Simulog », « logo d'Action ») et noms d'écrans du déroulé (Messagerie, Carte de France, Visite de la
  réception, planning des quais) : repris du code, pas vus à l'écran.
- L'adresse du site n'est pas imprimée (« donnée par mon professeur ») : à remplacer si Tristan veut l'adresse en clair.

## 4. Plus tard, quand Tristan aura relu (pas avant)

Déclarer `trame: { pdf, docx }` dans `activites/action-se-situer.js` et `activites/action-prise-de-poste.js` (pas de corrigé de trame).

## 5. Vérifié / construit

- Vérifié (fiches du projet, comme les séances) : Action, Geodis à Ensuès-la-Redonne pour Action, hub d'import du Havre ; 13 régions et
  96 départements métropolitains (contours IGN Admin Express, Licence Ouverte, mention sous la carte).
- Construit (comme les séances, dit en p. 1) : Samia, Kevin, Julie, le trajet, le plan, le planigramme, les documents.

## Compte rendu *(rempli par Claude Code)*


- 16/10/2026, Claude Code : les quatre fichiers de trames, le générateur et ce brief sont commités tels que déposés (brouillons, **non déclarés** dans les activités). Relecture faite : aucune valeur tirée par élève n'est imprimée ; le cours est bien une feuille à part. **À revoir par Cowork** : dans le cours d'ENT-8.1 (§3 « Ce que change mon travail »), « Le premier à le voir, c'est le client » contredit la question E de la séance, dont la bonne réponse est **le personnel du magasin** (en ouvrant les colis ou en remplissant le rayon) ; à recaler avec la question. Le générateur fixe les dates du document (reproductible) et ne cite aucune adresse d'hébergeur.
