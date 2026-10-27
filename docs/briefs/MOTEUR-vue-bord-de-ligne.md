# Chantier moteur — vue « Bord de ligne » (pour Stellantis ENT-13.6 à 13.9, puis Royal Canin, Airbus, Haribo)

**Statut** : livré (27/10/2026)
**Date du brief** : 27/10/2026 — Claude, d'après le cadrage Stellantis validé par Tristan (`stellantis/CADRAGE-stellantis-tle.md` §5 et §7)
et son choix du 27/10/2026 (« Les quatre, dans l'ordre conseillé » : le 4e bloc est « Stellantis ENT-13.6 à 13.9 avec la vue Bord de ligne »).
**Modèle** : Opus (vue nouvelle du moteur)
**Page d'essai** : `docs/briefs/stellantis/maquette-bord-de-ligne.html` (26/10/2026). Elle FAIT FOI pour l'interaction, comme celle du tri.

## 1. Le besoin

La compétence **C2.3** (« contribuer au processus de logistique industrielle » : approvisionner une ligne de production, mesurer l'impact
d'un dysfonctionnement) n'est travaillée par aucune séance : c'est le seul trou de la Terminale. Aucune vue du moteur ne montre une
**ligne qui consomme pendant que l'élève travaille**. Décision 13 du 03/10/2026 : une compétence qui gagne un angle nouveau justifie
une vue nouvelle, pensée pour plusieurs séances. Séances prévues : Stellantis ENT-13.6 à 13.9 ; plus tard Royal Canin (ensachage),
Airbus, Haribo (C2.3), et C3.4 (qui envoyer, quand).

## 2. Ce que voit et fait l'élève (d'après la page d'essai)

- **L'atelier** (dessin SVG, à gauche) : le transstockeur et ses contenants pleins, l'allée des robots, la ligne et ses voitures (3008
  et 5008, une par minute), les postes avec **deux emplacements** chacun (« en cours », « d'avance ») où les pièces sont dessinées dans
  leur contenant, le voyant du poste, la boîte kanban.
- **La boîte kanban** (à droite) : quand un contenant se vide, sa **carte** tombe dans la boîte (elle vole du poste vers la boîte). Chaque
  carte dit la pièce, le poste, le contenant, son poids, et depuis combien de minutes elle attend.
- **Envoyer un robot** : l'élève choisit une ou deux cartes (un robot porte **2 contenants et 1 000 kg au plus**), puis « Envoyer un
  robot ». Le robot met 5 minutes (3 en **appel urgent**, en nombre limité), livre, revient en 1 minute. Deux robots.
- **La rupture** : un poste qui n'a plus de quoi monter la voiture du moment **arrête la ligne** (« ✗ Ligne arrêtée : 1 200 personnes
  attendent »), en rouge texte, jamais en aplat.
- **Le camion en retard** (si la séance le déclare) : un message du chef d'équipe à l'heure dite ; la ligne s'arrête le temps de
  répondre : à quelle heure la ligne s'arrêtera-t-elle faute de cette pièce ? combien de voitures perdues si on attend le camion ? que
  fais-tu (convoi de secours et prévenir l'atelier, attendre, vider le transstockeur) ? Le convoi de secours avance l'arrivée.
- **Trois temps** : *guidage* (ralenti, « tient N voitures » affiché sous chaque poste, le collègue **arrête la ligne au premier
  geste** pour expliquer : début, première carte, deux cartes à grouper, poste qui baisse, premier arrêt) ; *entraînement* (plus vite,
  couverture cachée, pas de retour pendant la matinée, bilan à la fin) ; *évaluation* (comme l'entraînement, jeu tiré par élève, aucun
  bilan pour l'élève, copie rendue).
- **Bilan** : voitures montées, minutes d'arrêt, temps perdu (personnes × minutes, et en heures), robots envoyés (dont « à moitié
  vides » alors qu'une autre carte attendait), délai moyen entre la carte et l'envoi, appels urgents, réponses au camion.

## 3. Ce que la séance déclare (option `ligne` de `creerEntreprise`, format en tête de `core/types/ligne.js`)

```js
ligne: {
  id: 'st-ligne-136', libelle: 'Bord de ligne', lieu: 'Montage · ligne 3008 / 5008 · équipe du matin',
  qui: { prenom: 'Karim', poste: 'chef d’équipe logistique' },
  temps: 'guidage' | 'entrainement' | 'evaluation', debut: '06:00', minutes: 60, secondes: 2,   // secondes réelles par minute de ligne
  modeles: [{ id: '3008' }, { id: '5008', long: true }], sequence: ['3008', '3008', '5008', …],  // motif répété
  postes: [{ id: 'roue', poste: 'Poste 1', zone: 'roues', nom: 'Roues complètes', piece: 'roue', contenant: 'palette',
             par: 28, kg: 560, besoin: { 3008: 4, 5008: 4 }, depart: [12, 28], stock: 20 }, …],          // 2 à 5 postes
  robots: { nombre: 2, places: 2, kgMax: 1000, trajet: 5, retour: 1, urgent: 3, urgents: 2 },
  personnes: 1200,
  camion: { poste: 'pdb', annonce: '06:20', prevu: '06:30', arrivee: '07:15', contenants: 8, de: 'Karim',
            secours: '06:38', decisions: [{ v, lib, juste, secours, retour }] },                        // facultatif
  fin: 'Phrase de fin (facultative).',
}
```
ou une **fonction de la graine** (jeu tiré par élève, comme le tri et l'inspection). **Tout se calcule** : la couverture d'un poste,
l'heure d'arrêt, les voitures perdues ne s'écrivent jamais dans le contenu. Une déclaration fautive (poste sans besoin, contenant plus
lourd que le robot, départ plus grand que le contenant, modèle de la séquence inconnu, heure hors de la matinée…) empêche la séance de
se charger.

## 4. Jalons, état

- État par séance (cloisonné) : `db.lignes[<séance>][<id>]`, la matinée entière (minute, voitures, contenants, cartes, robots, réponses),
  sauvée à chaque geste et toutes les 5 minutes de ligne ; `premier` = le résumé de la première matinée finie.
- Jalons fournis par la vue (`jalonLigne(decl, séance, { mesure })`, la séance y ajoute `poids` et `groupe`) :
  `voitures` (part des voitures montées **au-delà de ce que la ligne monte sans aucun geste** : ne rien faire = 0), `arret` (aucune
  minute d'arrêt = tout ; 10 minutes ou plus = rien ; entre, au prorata), `groupes` (part des robots qui ne partent pas à moitié vides
  alors qu'une autre carte attendait et tenait dans la charge), `heure`, `perdues`, `decision` (les trois réponses au camion), `complet`.
  **Aucun jalon ne se gagne sans agir** : sans un robot envoyé, tout vaut 0 (le bloc de tests le vérifie).
- Le premier résultat compte : « Recommencer la matinée » est permis en guidage et en entraînement, jamais en évaluation.
- Un chiffre caché ne se déduit pas : en entraînement la couverture n'est pas affichée, mais elle se calcule (pièces dessinées et
  comptées dans chaque contenant, séquence des 12 voitures à venir).

## 5. Choix faits en écrivant (dans la ligne de la page d'essai ; à revoir par Tristan à l'écran)

1. **Un bouton « Démarrer la matinée »** : la ligne ne tourne pas tant que l'élève n'a pas lu la consigne.
2. **Pause** permise dans les trois temps, mais pendant la pause on ne peut rien envoyer (pas de « tour par tour » déguisé).
3. **Appels urgents limités** (2 par matinée dans les séances Stellantis) : sinon l'élève appellerait toujours en urgence.
4. **Le temps** : guidage 2 s par minute de ligne, entraînement 1,2 s, évaluation 1,3 s (tiers-temps × 4/3). Une matinée de 90 minutes
   dure ainsi environ 2 minutes à l'écran : c'est un jeu court qu'on rejoue, la séance d'une heure l'entoure de fiches et de questions.
5. **Le camion** : la ligne s'arrête de tourner le temps de répondre (l'élève lit les contenants et le stock) ; l'heure d'arrêt juste
   se calcule à l'instant du message, sur **son** bord de ligne (« si rien ne change et que la ligne tourne sans autre arrêt »).

## 6. Tests (bloc `ligne`, séance d'essai `outils/essai-ligne.js`)

Déclaration refusée (cinq fautes) ; la ligne consomme et fait tomber une carte au bon moment ; un robot à deux cartes trop lourdes est
refusé ; une rupture arrête la ligne et la compte ; le camion : heure juste calculée, convoi qui avance l'arrivée ; jalons : rien sans
agir, part juste ensuite ; premier résultat gardé après « Recommencer » ; évaluation sans bilan ; copie figée ; tirage : un joueur qui
groupe bien n'a aucun arrêt, un joueur qui envoie une carte par robot en a, sur des dizaines de graines (contrôle d'équité, cadrage §7).

## Compte rendu *(rempli par Claude Code à la livraison)*

Voir `docs/decisions.md` (27/10/2026, « Vue Bord de ligne ») et l'en-tête de `core/types/ligne.js`.
