# Chantier moteur — vue « Tri des colis » (pour Mondial Relay ENT-11.2 et 11.3, puis CAP Amazon, GLS, Bigblue)

**Statut** : à implémenter (page d'essai à valider par Tristan d'abord)
**Date du brief** : 26/10/2026 — Claude (cadrage S3 validé par Tristan le 26/10/2026 : « je prends tes propositions »)
**Modèle** : Opus (vue nouvelle du moteur)
**Page d'essai** : `docs/briefs/mondial-relay/maquette-tri-colis.html` (jetable ; elle FAIT FOI pour l'interaction une fois
validée par Tristan, comme les maquettes du quai et du planning).
**Cadrage** : `docs/briefs/mondial-relay/CADRAGE-S3-mondial-relay.md`.

## 1. Le besoin

Dans un hub ou une agence de messagerie, le geste central est le **tri** : chaque colis arrive au poste de lecture,
l'agent lit l'étiquette, trouve la sortie de sa tournée dans le **plan de tri** et l'y envoie, ou le **met à l'écart**
s'il ne peut pas partir. Aucune vue du moteur ne fait ce geste (le quai contrôle des palettes contre un BL, la
préparation prélève dans des emplacements). Décision 13 du 03/10 : une compétence qui gagne un angle nouveau et ludique
justifie une vue nouvelle, pensée pour plusieurs séances.

Séances qui s'en serviront : Mondial Relay ENT-11.2 (guidage) et 11.3 (évaluation), 2de ; au CAP, Amazon (n° 3), GLS
(n° 9, hub du Coudray-Montceaux), Bigblue (n° 11) ; en 2de, Colissimo et Kuehne+Nagel (groupage) s'ils sont construits ;
en 1re, l'expédition Cdiscount. Compétences : LOG C2.1 (préparer, expédier), D4 ; CAP-C3.x (expédition) ; C1.4 (contrôle,
anomalies).

## 2. Ce que voit et fait l'élève (d'après la page d'essai)

- **Poste de lecture** (dessin SVG) : un tapis, un portique ; le colis du moment, avec son **étiquette** (numéro de
  colis, point de livraison, code postal et commune), sa **pesée** (balance) et ses **dimensions** (portique) affichées
  sous le dessin. Un colis abîmé se voit (rabat ouvert, scotch déchiré) ; une étiquette illisible se voit (texte brouillé).
- **Plan de tri** (panneau à droite) : une ligne par sortie, les communes et codes postaux ; sous le plan, les **règles
  de mise à l'écart** déclarées par la séance (poids, longueur, somme des côtés, carton, étiquette).
- **Sorties** : un bouton par sortie (5 dans la page d'essai, de 3 à 8 selon la séance) + « À l'écart ». Clavier :
  chiffres 1 à 9, 0 pour l'écart. Le colis tombe dans le bac choisi, **juste ou pas** (petits cartons empilés, ni vert
  ni rouge).
- **Mise à l'écart** : l'élève choisit le **motif** parmi les motifs déclarés (geste qui montre qu'il a vu la raison ;
  un bon écart avec un mauvais motif n'est pas juste).
- **Trois temps** :
  - *guidage* : le tapis attend ; retour tout de suite (« ✓ Juste » en vert texte, « ✗ … » en rouge texte, avec ce qu'il
    faut regarder : la balance, le portique, le carton, la commune dans le plan) ;
  - *entraînement* : un **temps par colis** (14 s dans la page d'essai, déclaré par la séance) ; un colis laissé passer
    **fait le tour de la boucle** et revient en fin de série (comme sur un trieur réel qui recircule) ; au deuxième passage
    raté, il compte « non trié » ; pas de retour juste/faux pendant la série, **bilan à la fin** ;
  - *évaluation* : aucun retour, aucun minuteur affiché (à trancher : voir §5), copie rendue, bilan quand l'enseignant
    lève le verrou.
- **Bilan** : tableau colis par colis (commune, ton tri, le bon tri, ✓ / ✗) et le total. Le premier résultat est gardé ;
  « Rejouer la série » en guidage seulement.

## 3. Déclaration proposée (à affiner à l'état des lieux)

```js
tri: {
  sorties: [ { id: 'T1', nom: 'Troyes', communes: [['Troyes', '10000']] }, … ],
  ecart: { libelle: "À l'écart", sous: 'expertise' },
  regles: { poidsMax: 30, longueurMax: 120, sommeMax: 150 },          // affichées et appliquées
  motifs: ['poids', 'taille', 'carton', 'etiquette'],                  // libellés dans le moteur
  serie: { fixe: [ … ], banque: [ … ], tirage: { … } },                // colis : n, commune, relais, kg, dim, anomalie, piege
  temps: 'guidage' | 'entrainement' | 'evaluation',
  secondesParColis: 14,                                                // entraînement seulement
  personnage: { nom: 'Romain', role: "chef d'équipe" },
}
```

**Le bon tri se calcule** (anomalie → écart + motif ; sinon sortie de la commune), jamais écrit dans le contenu. Une
anomalie se **déduit des mesures** quand c'est possible (poids > `poidsMax`, longueur > `longueurMax`, somme > `sommeMax`)
et un test vérifie qu'un colis déclaré « poids » pèse bien plus que la limite (et l'inverse : un colis sans anomalie
reste sous toutes les limites).

## 4. Jalons, état

- État par séance (cloisonné, règle du dépôt) : liste des colis, choix (`sortie`, `motif`, `passage`), série finie.
- Jalons fournis par la vue, regroupables par la séance (poids décidés dans le brief de séance) :
  `tri.communes` (colis en règle bien triés, sur le nombre), `tri.pieges` (colis à piège bien triés), `tri.ecarts` (colis
  à écarter écartés avec le bon motif), `tri.fauxEcarts` (aucun colis en règle mis à l'écart), `tri.complet` (série
  finie). **Aucun jalon ne se gagne sans trier** : une série laissée passer donne 0 partout, `fauxEcarts` compris (il ne
  compte que sur les colis triés, et seulement si la série est finie).
- Un chiffre caché ne se déduit pas : le bilan dit « trop lourd », jamais « 1,6 kg de trop ».

## 5. Ce qui reste au choix (à trancher par Tristan à l'écran)

1. **Évaluation avec ou sans minuteur** ? Proposition : un minuteur **large** (le double de l'entraînement), affiché,
   pour que la cadence compte sans piéger ; le tiers-temps l'allonge.
2. **Combien de sorties** en 2de : 5 (page d'essai) ; jusqu'à 8 pour le CAP.
3. **L'étiquette illisible** : la page d'essai la propose comme motif mais aucun colis ne l'a encore ; la garder (un colis
   sur 12) ou la retirer.
4. **Couleur du bandeau** : bordeaux construit (la charte Mondial Relay n'est pas vérifiée). Si la vraie couleur est
   rouge, elle reste au bandeau, jamais dans la zone de travail (décision du 05/10).

## 6. Tests attendus (bloc `tri` à créer, puis `mondial-relay`)

- Un colis bien trié, un mal trié, un bon écart, un écart au mauvais motif, un faux écart : chaque jalon tombe et monte
  comme dit au §4 ; sabotage : le bon tri écrit en dur dans le contenu doit être refusé par le test de calcul.
- Entraînement : un colis laissé passer revient en fin de série ; raté deux fois = non trié ; le minuteur ne compte pas
  quand l'onglet est caché (à vérifier sur le terminal vocal, qui a peut-être déjà ce réglage).
- Clavier : 1 à 5 et 0 ; focus gardé au clavier seulement.
- `reducedMotion: 'reduce'` sur le bloc si une animation de tapis est ajoutée.
- Tirage (11.3) : quelques centaines de graines, chaque série respecte ses contraintes d'équité (même nombre d'écarts et
  de pièges, toutes les sorties servies).

## 7. Page d'essai

`docs/briefs/mondial-relay/maquette-tri-colis.html`, en ligne sur prepalog.fr. Retours de Tristan à noter au §8 avant de
coder la vue.

## 8. Retours d'écran de Tristan

- **26/10/2026 (v1 → v2 de la page d'essai)** : (1) le **carton est cliquable** : de loin, son étiquette ne se lit pas ;
  au clic, une fiche « Le colis de près » montre l'étiquette lisible (numéro, Point Relais, adresse, code postal et
  commune) et **le carton dessiné avec ses trois dimensions** (cotes) ; (2) la **balance** est une balance numérique
  **au milieu, sous le tapis** (afficheur à chiffres), plus de pastilles « Balance » et « Portique » ; (3) **envoyer
  demande une validation** : l'élève choisit une sortie (ou l'écart et son motif), puis clique « Envoyer le colis en T3 »
  (ou « Mettre le colis à l'écart ») ; clavier : 1 à 5 et 0 choisissent, Entrée valide. Conséquences : le temps par colis
  de l'entraînement passe de 14 à 20 s (proposition) ; le motif « étiquette illisible » a désormais un colis (Les Riceys,
  étiquette floue dans la fiche).
- **26/10/2026 (v2 → v3)** : (4) **tout tient dans un seul bloc, sans défiler** : le tapis et la balance à gauche, « Le
  colis de près » à droite dans le même bloc (place réservée même fermée), sorties dessous, motif + choix + bouton d'envoi
  sur une seule ligne ; vérifié sans barre de défilement en 1366 × 768 et 1280 × 720 ; (5) en entraînement, **le premier
  colis n'a pas de minuteur** (le temps de lire) ; le minuteur part au deuxième colis.
- **26/10/2026 (v3 → v4, « applique-toi sur le carton ouvert »)** : (6) tous les cartons sont dessinés **en volume**
  (perspective cavalière), sur le tapis comme dans la vue de près, **à l'échelle de leurs dimensions** (un carton de
  130 cm paraît long, un de 20 cm petit ; tailles minimales pour rester cliquable) ; un carton fermé a son scotch sur le
  dessus et la face avant ; (7) le **carton ouvert** a ses quatre rabats ouverts (arrière levé, côtés rabattus vers
  l'extérieur, avant retombé avec un coin plié), l'intérieur sombre avec du papier froissé qui dépasse, et le scotch
  arraché qui pend, bord déchiré ; il se reconnaît sans cliquer.

## Compte rendu *(rempli par Claude Code à la livraison)*
