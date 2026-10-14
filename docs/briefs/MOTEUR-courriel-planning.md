# Brief moteur — Nouveau courriel, ordre enregistré en pièce jointe, planning à créneaux pris (pour ENT-7.2, puis 7.3 et 7.4)

**Statut** : en cours (14/10/2026)
**Origine** : état des lieux du §7 d'`ENT-7.2-decathlon-ordre-de-transport.md` (Claude Code, 14/10/2026). Demandes n° 1, 2, 4, 5 ;
la n° 3 (vue Dialogue à choix) est livrée (`MOTEUR-vue-dialogue.md`).
**Modèle** : cadrage Opus (ce fichier) ; lots construits par Sonnet. **Durée** : ≈ 4 h (moteur) avant la séance (≈ 3 h 30).
**Version** : complète, choisie par Tristan le 14/10/2026.

## 1. Ce qui existe (vérifié dans le code, 14/10/2026)

- `core/types/entreprise-messagerie.js` : « Nouveau message » = destinataire **parmi les fournisseurs du catalogue** seulement,
  objet prérempli « Commande de réapprovisionnement », texte ; réponse automatique (`reponsesFournisseur`, sinon lecture des
  références) ; aucun carnet, aucune pièce jointe, aucun geste propre (`declencher()` seul), pas de brouillon.
- `core/types/documents.js` : documents de séance, pièces jointes d'un mail reçu (`pieces: [ids]`), `html` peut être `(db) => …`.
- `core/types/fiche.js` : `envoi: { bouton, a, suite }` ; sans `a` la fiche s'envoie déjà, mais les textes disent « envoyée » /
  « Tu envoies ta fiche ? ». Fiche figée après envoi.
- `core/types/planning.js` : une ligne = **une** plage de présence (`de`, `a`, `dispo`, `arrivee`) ; pas de bloc déjà posé ; le
  planning est toujours au menu (pas de `quand`). Le Téléphone a déjà son `quand` (`entreprise.js`).

## 2. Lots

**Lot 1 — page d'essai cliquable `outils/essai-courriel.html`** (changement d'interaction : Tristan clique avant qu'on branche).
L'écran « Nouveau courriel » d'ENT-7.2 avec les vraies feuilles de style du site, données de 7.2 en dur. Deux variantes à comparer
pour le champ **À** (liste déroulante du carnet / champ texte avec suggestions du carnet) et deux pour les **pièces jointes**
(cases à cocher sous le message / bouton « Joindre un fichier » qui ouvre la liste des fichiers disponibles). Objet vide au départ,
message libre, « Envoyer », liste « Envoyés », réponse automatique qui arrive dans la boîte (avec et sans l'ordre joint, au quai :
rien). L'ordre « OT-2027-0142.pdf » n'apparaît dans les fichiers qu'après « Enregistrer l'ordre » (bouton simulé). Brouillon gardé
en changeant d'onglet simulé. Rien n'est jugé. **Attendre le choix de Tristan avant le lot 2.**

**Lot 2 — le courriel dans le moteur.** Option d'entreprise (nom à fixer au lot, déclarée dans `entreprise-options.js`) :
`carnet: [{ id, nom, mail, role }]`, pièces proposables (documents de séance + fiches enregistrées), `reponses: (courriel, db,
prénom) → réponse | null` par destinataire, geste `courriel:envoyer` et `courriel:envoyer:<id>`, lecture `courrielsEnvoyes(db)` →
`[{ a, objet, corps, pieces, at }]` (cloisonnée par séance), brouillon gardé entre deux écrans. Fiche **enregistrée** :
`envoi: { enregistrer: true, nomPiece }` → textes « enregistré » (bouton, confirmation, bandeau), et la fiche devient une pièce
proposable qui s'ouvre **figée comme un document**. Sans l'option, l'ancien « Nouveau message » (fournisseurs) ne change pas : les
séances Spartoo et Boost gardent leurs tests verts sans retouche. Séance d'essai + bloc de tests neuf (`outils/test.mjs` touché :
BLOCS et GROUPES, à dire à Tristan).

**Lot 3 — le planning.** (a) Blocs **déjà pris** sur une ligne : `occupe: [{ de, a, titre }]` (nom à confirmer au lot), dessinés
dans la grille, non déplaçables, comptés par `unAlaFois` et `disponible` (une carte de l'élève posée dessus = problème, message qui
dit **que**, jamais de combien) ; jamais rangés dans la base (ils viennent de la déclaration). (b) `quand(db, séance)` du planning :
hors du menu tant que c'est faux (comme le Téléphone). Sans ces champs, rien ne change (blocs planning, Smoby, France Boissons verts).

**Lot 4 — la fiche de séance** (`activites/FICHE-SEANCE.md`) : les options nouvelles, avec exemple ; compte rendu ici ; ligne dans
`docs/decisions.md`.

## 3. Retours de Tristan à l'écran

- 14/10/2026, page `outils/essai-courriel.html` : champ **À = variante A** (liste déroulante du carnet) ; **pièces jointes =
  variante B** (bouton « Joindre un fichier », liste des fichiers disponibles, étiquettes avec croix). Bouton « Envoyer » : le style
  `btn-p` habituel du site (comme « Envoyer la fiche »), pas de cas à part.
- Lot 3 livré (ca3de0f) : `occupe` sur une ligne (jugé par `unAlaFois`), `quand` du planning.

## Compte rendu

*(à remplir à la livraison)*
