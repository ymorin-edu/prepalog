# Brief de chantier — MOTEUR : documents joints, fiche à remplir, menu de gauche rétractable

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-documents-formulaire.md (lot 1, puis 2, puis 3). Annonce la durée de chaque lot.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 04/10/2026
**Conversation d'origine** : Claude Code, en ouvrant ENT-5.1 (le moteur ne savait ni montrer un document ni faire remplir une
fiche). Maquette **validée par Tristan le 04/10/2026, agencement B (côte à côte)** :
`docs/briefs/smoby/maquette-documents-fiche.html` (s'ouvre d'un double-clic).
**Modèle** : Opus (vue nouvelle du moteur, `core/types/entreprise.js`).

## 0. Pourquoi

Trois séances de Smoby S1 ont besoin de **lire des documents** et de **remplir une fiche** dans l'environnement
d'entreprise, que le moteur ne sait pas faire aujourd'hui (un mail n'a que du texte, aucun écran « à remplir ») :

| Séance | Documents | Fiche à remplir |
|---|---|---|
| ENT-5.1 recrutement | fiche de poste, 5 CV | tableau de tri oui / non (5 × 3), candidat (liste), contrat (CDD / CDI) |
| ENT-5.2 arrivée | — | 8 pièces à cocher (4 justes), 5 étapes à remettre dans l'ordre |
| ENT-5.8 lettre de voiture | ordre d'enlèvement, fiche client, extrait du planning | lettre de voiture : listes de choix (noms, lieux), nombres, date, heure |

Une brique générique, déclarée par le contenu ; **rien de « Smoby » dans `core/`**.

## Lot 1 — Documents joints et visionneuse (~1 h 30)

- `creerEntreprise({ …, documents: [{ id, titre, court, html }] })` : `titre` en tête de la visionneuse (« CV — Yanis
  Morel »), `court` sur la pièce jointe et l'onglet (« Yanis Morel »), `html` = le document (contenu, jamais saisi par
  l'élève).
- Un mail semé (volet ou déclencheur) porte `pieces: ['poste', 'yanis', …]` : sous le texte, une rangée de **pièces
  jointes** (trombone + `court`, mention « · ouvert » une fois ouverte). Un clic ouvre le document **dans le lecteur du
  mail** : « ← Retour au message », titre, « ‹ Précédent / Suivant › » entre les pièces du même mail.
- **Mise en page des documents** : chaque document a sa propre allure (5 CV, 5 mises en page : c'est voulu). Les règles de
  la maquette (`.cv`, `.cv1` à `.cv5`, `.fp`) sont propres à Smoby : elles vont dans le **contenu**, pas dans
  `styles/base.css`. Proposition : `documentsStyle: '<css>'` déclaré par la séance, injecté par le moteur dans un
  `<style>` qui ne vise que l'intérieur de la visionneuse, retiré à la sortie de la séance. Un document est une **feuille
  de papier** (fond papier `#fdfbf7`, pas de blanc pur), quel que soit le thème. À trancher par Claude Code, et le dire.
- **Les mots cliquables** (lot 3 de `MOTEUR-2de-S1`) marchent dans le texte du mail ; dans un document, seulement si le
  contenu les marque.
- Chaque ouverture d'un document est comptée dans `db.indicateurs[idSeance].docs[id]` (repérage, lot 6) — pas de jalon.
- Mention en pied de chaque document reconstitué : écrite **par le contenu** (« CV fictif — document pédagogique
  Prepalog »), pas par le moteur.

## Lot 2 — La fiche à remplir (~2 h 30)

Un écran de plus, qui n'existe que si la séance le déclare (alerte 13) :

```js
fiche: {
  id: 'selection', libelle: 'Fiche de sélection',          // entrée du menu
  titre: 'Fiche de sélection', sousTitre: 'Poste : cariste en CDD saisonnier, prise de poste le mercredi 9 décembre 2026.',
  documents: ['poste', 'yanis', 'laura', 'mehdi', 'thomas', 'sabrina'],   // à gauche, en onglets (agencement B)
  blocs: [
    { type: 'ouinon', id: 'tri', titre: '1. Tableau de tri', consigne: '…',
      lignes: [{ id: 'yanis', lib: 'Yanis Morel' }, …], colonnes: [{ id: 'caces', lib: 'CACES 3 valide le 9/12' }, …] },
    { type: 'liste', id: 'candidat', titre: '2. Mon choix', lib: 'Je retiens', choix: [{ v: 'yanis', lib: 'Yanis Morel' }, …] },
    { type: 'choix', id: 'contrat', lib: 'Contrat proposé', choix: ['CDD', 'CDI'] },
    { type: 'encadre', titre: 'CDD ou CDI ?', texte: '…' },
  ],
  envoi: { bouton: 'Envoyer la fiche à Sophie', a: 'Sophie' },
}
```

- **Agencement B (décision de Tristan)** : documents à gauche en onglets, fiche à droite ; la colonne des documents reste à
  l'écran quand on descend dans la fiche. Sur un écran étroit : l'un sous l'autre. Sans `documents` : la fiche seule.
- Le mail porte un bouton **« Ouvrir la fiche de sélection »** (`ouvreFiche: 'selection'` sur le mail semé).
- **Oui / non** : deux boutons par case ; la case choisie prend un **contour** vert et un ✓, jamais un aplat (charte) ;
  `aria-pressed` ; **pas de redessin** à chaque clic (focus et place dans la page gardés).
- **Envoi** : refusé tant qu'il manque quelque chose ; la raison s'écrit sous le bouton (« Il manque : 3 cases du tableau
  sans réponse, le contrat. »), le travail est gardé. Une fois envoyée, la fiche est **figée** (relue en lecture seule) avec
  « Fiche envoyée à Sophie le 30/11 à 09:41. Réponds-lui maintenant dans la Messagerie. »
- **Rien n'est jugé avant l'envoi**, rien n'est corrigé à l'écran (guidage compris) : le bilan dit, à la fin, quelles cases
  étaient fausses (choix de Tristan pour ENT-5.1).
- État : `db.fiches[<fiche.id>] = { valeurs, envoye: { at } }` (cloisonné par séance).
- Pour les jalons : `ficheEnvoyee(db, 'selection')` → `{ envoye, valeurs, at }` ; les attendus restent dans la séance
  (calculés depuis ses données). Déclencheur : `apresFiche('selection')` dans `core/declencheurs.js` (vrai à l'envoi, juste
  ou faux). Convention du repérage : une étape rend `'attente'` tant que la fiche n'est pas envoyée.
- Les types de blocs de ce lot sont **ceux d'ENT-5.1** (`ouinon`, `liste`, `choix`, `encadre`). Ceux d'ENT-5.2 (`cases` :
  cocher plusieurs, `ordre` : remettre dans l'ordre) et d'ENT-5.8 (`texte` prérempli, `nombre`, `date`, `heure`) viennent
  dans un **lot 4**, au moment de ces séances : ne pas les écrire d'avance.

## Lot 3 — Menu de gauche rétractable, partout (~1 h)

Demande de Tristan (04/10/2026) : l'agencement côte à côte demande de la place. Le Planning a déjà « Agrandir le planning »,
qui replie le menu (`pl-agrandi`, `core/types/planning.js`). Le généraliser :
- Un bouton en tête du menu de l'environnement **replie / déplie le menu**, sur **tous** les écrans de toutes les
  entreprises ; replié, il reste une bande étroite avec le bouton pour le rouvrir. Libellé et `aria-expanded` clairs.
- Le choix est gardé d'un écran à l'autre et retrouvé à la séance suivante (dans la base de l'élève, comme `agrandi`).
- Le Planning garde son bouton « Agrandir » (qui replie aussi le panneau des consignes) ; les deux ne doivent pas se
  contredire. À dire au compte rendu.
- Risque : touche toutes les séances d'entreprise → la suite entière, et un coup d'œil à Boost, Picard et Cdiscount.

## Tests attendus

Bloc `smoby` (alerte 7 si `outils/test.mjs` bouge) : pièces jointes (ouvrir, précédent / suivant, retour, mention
« ouvert », comptage) ; fiche (rien de jugé avant l'envoi, envoi incomplet refusé et travail gardé, oui / non sans redessin
ni perte de focus, fiche figée après l'envoi, `apresFiche` une seule fois, `ficheEnvoyee` lu) ; écran absent sans
déclaration ; menu rétractable gardé d'un écran à l'autre et à la réouverture. Chaque cas éprouvé par un sabotage.
Suite entière avant le push (le lot 3 touche tout l'environnement).

## Critères de validation par Tristan

Sur `outils/essai-2de.html` (univers d'ENT-5.1) : même chose que la maquette, dans le vrai environnement ; menu replié et
déplié sur un écran de Boost ou de Picard ; au vidéoprojecteur.

## Questions ouvertes (valeur par défaut entre parenthèses)

- [ ] Style des documents : `documentsStyle` déclaré par la séance (oui, sauf mieux trouvé en construisant).
- [ ] Une fiche envoyée peut-elle être renvoyée en guidage ? (non : figée, comme dans la maquette validée).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
