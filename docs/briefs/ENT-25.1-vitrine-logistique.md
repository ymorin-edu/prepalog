# ENT-25.1 — « Et si tu choisissais la Logistique ? » (vitrine du Bac Pro Logistique)

**Statut : livré** (12/11/2026), `pret: true, ouverture: 'prof'` : cachée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance ».

## 1. La demande

Tristan, 12/11/2026 : « semaine prochaine, nous avons la semaine des filières logistique, il faut préparer un travail de découverte pour les
secondes sur prepalog » ; « le but est de mettre en avant le BAC PRO logistique » ; « les élèves sont de GATL » ; « 1h ».

Public : 2de GATL, avant le choix de spécialité de fin d'année (Logistique, OTM, AGOrA). Une séance d'1 h (≈ 45 min de travail).

## 2. Le cadrage retenu (proposé à Tristan, option recommandée)

Une vitrine, pas une entreprise : la visite de **quatre entreprises réelles déjà vérifiées** dans Prepalog, choisies pour donner envie
(robots, voitures, hélicoptères, export), avec un petit geste à chaque arrêt, puis le Bac Pro en bref.

| Arrêt | Entreprise (univers déjà vérifié) | Geste | Points |
|---|---|---|---|
| ① | Amazon, Brétigny-sur-Orge (`contenus/amazon.js`) | remettre dans l'ordre le chemin d'un article ; qui se déplace (le robot) | 4 + 1 |
| ② | Stellantis, Sochaux (`contenus/stellantis.js`) | voitures par heure (60), roues par heure (240), pièce en retard (la ligne s'arrête) | 2 + 2 + 1 |
| ③ | Airbus Helicopters, Marignane (`contenus/airbus.js`) | choisir le transport : hélicoptère au sol → le plus rapide ; révision → le moins cher à temps | 2 + 2 |
| ④ | Royal Canin, Aimargues (`contenus/royal-canin.js`) | 85 tonnes sur 100 exportées ; quel lot sortir d'abord (FEFO) | 1 + 2 |
| ⑤ | Le Bac Pro Logistique en bref (fiche Onisep, relevée le 12/11/2026) | trois vrai ou faux ; le poste préféré (non jugé) | 1 + 1 + 1 |

Guide : **Sarah**, élève de Terminale Bac Pro Logistique (construite), par messages, au tu. Les fiches s'ouvrent l'une après l'autre.

## 3. Vérifié / construit (alerte 9)

- **Vérifié** (déjà vérifié pour les séances de ces entreprises, repris de leurs `MENTION`) : chiffres d'Amazon Brétigny (70 000 m², 4 000 robots,
  4 500 salariés, 500 000 colis/jour, pesée), de Stellantis Sochaux (≈ 1 045 voitures/jour, 250 camions, 500 fournisseurs, 1 200 personnes immobilisées
  par un arrêt), d'Airbus Helicopters (361 hélicoptères livrés en 2024, service AOG), de Royal Canin (≈ 349 000 t en 2024, ≈ 85 % exportées, 1 800
  emplacements). Bac Pro : fiche Onisep « Bac pro métiers de la logistique » (toute la chaîne logistique, conduite d'engins de manutention, 20 semaines de
  PFMP sur 3 ans, métiers, BTS Gestion des transports et logistique associée).
- **Construit** : Sarah ; les étapes détaillées du chemin d'un article chez Amazon ; les trois transports d'Airbus, leurs délais et leurs prix ; les trois
  lots de Royal Canin et leurs dates ; « 4 roues par voiture » (roue de secours oubliée).

## 4. Choix faits en construisant (à revoir à l'écran par Tristan)

- **Code `ENT-25.1`, pas `DEC-2`** : le moteur des séances d'entreprise exige un code `ENT-` et range chaque séance sous l'« entreprise » du premier
  nombre. La vitrine est donc l'entreprise n° 25 « Le Bac Pro Logistique » (logo de Prepalog), dans Simulog.
- **Non comptée dans les compétences** (`competences: []`) : c'est une découverte. Elle a un résultat sur 20 (l'élève voit son score, Tristan voit qui a
  fini dans le suivi de classe).
- Pas d'« Avant de commencer » ni de questions au fil (vitrine d'une heure) ; pas de trame papier ; pas de carte de France.
- Le poste préféré de chaque élève est rangé dans sa base (fiche « Et toi ? », champ `prefere`), visible nulle part ailleurs pour l'instant.

## 5. Compte rendu

- Fichiers : `contenus/vitrine-logistique.js`, `activites/vitrine-logistique.js`, `contenus/corriges/ENT-25.1.js`, ligne dans `activites/index.js`
  (registre + `ENTREPRISES` n° 25), `activites/catalogue.js` régénéré.
- Tests : bloc `vitrine` (8 cas, `outils/test/vitrine.mjs`), inscrit dans `BLOCS` et dans le groupe 7 de `GROUPES` (`outils/test.mjs` touché pour ces deux
  lignes seulement). Éprouvé par sabotage (lot juste et roues par heure faussés : trois cas tombent).
- Deux règles du site apprises à la suite entière : le logo d'une « entreprise » doit être dans `contenus/trames/logos/` (copie du logo de Prepalog,
  `prepalog.png`, même empreinte que `styles/logo.png`) ; une séance X.1 porte `reinitialisable: true`.
- Suite : 116 blocs en parallèle dans le cloud, puis les blocs tombés rejoués seuls, tous verts (les cas de `groupes` ne tombent que mélangés à d'autres
  blocs dans un seul navigateur ; seuls, 98/98).
