# ENT-25.1 — « Et si tu choisissais la Logistique ? » (vitrine du Bac Pro Logistique)

**Statut : livré** (12/11/2026), `pret: true, ouverture: 'prof'` : cachée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance ».

## 1. La demande

Tristan, 12/11/2026 : « semaine prochaine, nous avons la semaine des filières logistique, il faut préparer un travail de découverte pour les
secondes sur prepalog » ; « le but est de mettre en avant le BAC PRO logistique » ; « les élèves sont de GATL » ; « 1h ».

Public : 2de GATL, avant le choix de spécialité de fin d'année (Logistique, OTM, AGOrA). Une séance d'1 h (≈ 45 min de travail).

## 2. Le cadrage retenu

Première version (fiches de questions, 12/11 matin), puis Tristan : « il faut que ça soit plus ludique et interactif ». Option choisie :
**tout en écrans de jeu**, avec les vues existantes du moteur (aucune vue nouvelle).

| Arrêt | Entreprise (univers déjà vérifié) | Écran de jeu | Points |
|---|---|---|---|
| ⓪ | les quatre sites | **Carte de France** (vue Localiser) : région puis département de chaque site, au premier coup | 0,5 × 8 = 4 |
| ① | Amazon, Brétigny-sur-Orge | **Tri des colis** (vue Tri) : 8 colis vers 3 tournées ou à l'écart ; 2 pièges (Dreux « Café d'Orléans », Saran) | colis en règle 2, pièges 1, écarts 1 |
| ② | Stellantis, Sochaux | **Vingt minutes au bord de ligne** (vue Ligne) : 3 postes repris d'ENT-13.6, envoyer les robots à temps | voitures 2, arrêt 2 |
| ③ | Airbus Helicopters, Marignane | **L'appel de Nathalie** (vue Téléphone) : hélicoptère du SAMU au sol, quel transport, la révision, prévenir le client | 1 + 0,75 + 0,75 + 0,5 |
| ④ | Royal Canin, Aimargues | **Ranger trois palettes** (vue Plan d'entrepôt, mode rangement, guidage) : côté chiens / chats, rotation A / B / C | 1 × 3 |
| ⑤ | Le Bac Pro Logistique en bref (fiche Onisep, relevée le 12/11/2026) | trois vrai ou faux ; le poste préféré (non jugé) | 0,5 + 0,5 + 1 |

Guide : **Sarah**, élève de Terminale Bac Pro Logistique (construite), par messages, au tu. Chaque arrêt s'ouvre quand le précédent est fini.
Les poids ont été posés par Claude (découverte non comptée dans les compétences) : à revoir par Tristan s'il le souhaite.

## 3. Vérifié / construit (alerte 9)

- **Vérifié** (déjà vérifié pour les séances de ces entreprises, repris de leurs `MENTION`) : chiffres d'Amazon Brétigny, de Stellantis Sochaux
  (≈ 1 045 voitures/jour, 1 200 personnes immobilisées par un arrêt), d'Airbus Helicopters (service AOG), de Royal Canin (≈ 85 % exportés). Communes des
  quatre sites. Bac Pro : fiche Onisep « Bac pro métiers de la logistique » (20 semaines de PFMP sur 3 ans, conduite d'engins, poursuite d'études).
- **Construit** : Sarah, Théo, Karim, Nathalie, Sandrine ; les colis, relais et tournées d'Amazon ; les trois postes et la cadence ralentie de la ligne ; les
  trois transports d'Airbus, leurs délais et prix, le SAMU de Lyon et l'école de pilotage ; le plan, le stock et les palettes de Royal Canin. Places sur
  la carte : centre de la commune (approché).

## 4. Choix faits en construisant (à revoir à l'écran par Tristan)

- **Code `ENT-25.1`, pas `DEC-2`** : le moteur des séances d'entreprise exige un code `ENT-`. La vitrine est l'entreprise n° 25 « Le Bac Pro Logistique »
  (logo de Prepalog), dans Simulog.
- **Non comptée dans les compétences** (`competences: []`), résultat sur 20 (l'élève voit son score, Tristan voit qui a fini dans le suivi).
- Tout est en **guidage** : la ligne est ralentie et Karim l'arrête au premier geste pour expliquer ; chaque palette de Royal Canin porte sa consigne.
- La carte se joue au premier essai et ne se rejoue pas ; les autres arrêts peuvent être corrigés après le bilan.
- Le poste préféré de chaque élève est rangé dans sa base (fiche « Et toi ? », champ `prefere`), visible nulle part ailleurs pour l'instant.

## 5. Compte rendu

- Fichiers : `contenus/vitrine-logistique.js`, `activites/vitrine-logistique.js`, `contenus/corriges/ENT-25.1.js` (six arrêts), ligne dans
  `activites/index.js` (registre + `ENTREPRISES` n° 25), `activites/catalogue.js` régénéré.
- Tests : bloc `vitrine` (6 cas, `outils/test/vitrine.mjs`) : déclaration, ouverture et inaction (0/20), parcours juste (20/20), une erreur par arrêt
  (11,75/20, chaque jalon tombe seul), corrigé et documents. Éprouvé par sabotage (transport de la révision et rotation d'une palette faussés : deux cas
  tombent). `outils/test.mjs` : seulement les lignes `BLOCS` et `GROUPES` de la première version, pas retouché ensuite.
- Deux règles du site apprises à la suite entière : le logo d'une « entreprise » doit être dans `contenus/trames/logos/` ; une séance X.1 porte
  `reinitialisable: true`.
