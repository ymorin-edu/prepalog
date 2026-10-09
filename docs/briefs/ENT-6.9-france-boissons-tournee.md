# Brief de séance — ENT-6.9 France Boissons, ordonner la tournée de la côte pendant que Lucas roule (2de, poste B — agent d'exploitation, guidage OTM-C1.3)

> **📋 Phrase à copier-coller dans ccode (après le chantier `MOTEUR-vue-tournee-camion`, lots 1 à 3) :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-6.9-france-boissons-tournee.md. Vérifie d'abord que les lots 1 à 3 de MOTEUR-vue-tournee-camion sont livrés. Construis la carte de la côte, puis écris un script de calage (docs/briefs/france-boissons/calage-6.9.py) et propose-moi 2 ou 3 jeux de valeurs chiffrés (§6) avant d'écrire la séance. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 06/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-reprise-6.9.md` (décisions 65 à 71) ; cadrage
`claude/prepalog-2de-s2-cadrage.md` (décisions 9, 16) ; déroulé `claude/prepalog-2de-s2-deroule.md` (calendrier 31, règle 32) ;
séance précédente `ENT-6.8-france-boissons-planning.md`.
Modèles : **ENT-3.1 Boost** (vue Tournée en guidage, feuille colorée) et **ENT-3.2** (feuille en blocs, attendus sur saisies).
**Modèle** : **Opus** pour la carte et le calage ; **Sonnet** suffit ensuite pour la séance (données) et le compte rendu.
**Dépend de** : `docs/briefs/MOTEUR-vue-tournee-camion.md`, **lots 1 à 3** (fenêtres d'ouverture, approche + conduite, profil
camion). Les lots 4 et 5 (vides, plan de chargement) ne servent pas ici.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.9 |
| `id` (jamais modifié ensuite) | `france-boissons-tournee` |
| Titre / desc | « France Boissons — la tournée de la côte » / « Agent d'exploitation à Buchelay : pendant que Lucas roule sur l'A13, ordonner les six arrêts de la côte normande en tenant les horaires d'ouverture et le temps de conduite, calculer la feuille de route, puis envoyer la tournée à Lucas par SMS. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **OTM-C1.3** (déterminer un itinéraire ; déterminer les temps de conduite, de repos et de travail) ; OTM-C2.2 (transmettre les instructions, secondaire, non noté à part) |
| Temps pédagogique | **guidage** (décision 67 : exception assumée à « S2 = entraînement », C1.3 n'ayant aucun temps en S1 ; seul temps de travail avant l'évaluation de S3, règle 15) |
| Notation | jalons + note sur 20 |
| Barème | 12 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (06/10/2026)** :
  - Vitesses maximales d'un camion de plus de 12 t : **90 km/h sur autoroute**, 80 km/h sur les autres routes, **50 km/h en
    agglomération** (code de la route, art. R413 ; [Wikipédia](https://fr.wikipedia.org/wiki/Vitesse_maximale_autoris%C3%A9e_par_type_de_v%C3%A9hicule_en_France)).
  - Accès à la côte : **A13** puis **A132** (5,3 km, gratuite) jusqu'à Canapville / Touques, aux portes de Deauville
    ([Wikipédia](https://en.wikipedia.org/wiki/A132_autoroute)) ; péage en flux libre à Buchelay ([Sanef](https://www.autoroutes.sanef.com/en/my-journey/buchelay-toll-booth)).
  - **Marché de Deauville** : place du Marché, **7 h – 13 h 30**, le **vendredi** entre autres ([mairie de Deauville](https://www.mairie-deauville.fr/ville/boutiques/marche-de-deauville)) →
    le vendredi 18 juin 2027 est jour de marché.
  - Trouville a une **zone piétonne rue des Bains** (page de la mairie ; règles de livraison **non lues**).
  - Règlement 561/2006 (repris d'ENT-6.8) : **4 h 30** de conduite puis **45 min** de pause ; la manutention aux arrêts
    **n'est pas une pause**.
- **Construit (annoncé comme tel)** : les six clients (noms fictifs, à vérifier libres), leurs horaires d'ouverture, le temps
  par arrêt, la vitesse moyenne sur la côte, la règle « café de la place du Marché à livrer avant l'installation du marché »
  (inspirée du fait vérifié), l'heure à laquelle Lucas sort de l'autoroute.
- **Simplifications assumées** : sur l'autoroute, on roule à **90 km/h tout du long** (la vitesse maximale, pas une moyenne
  réelle) ; sur la côte, **une seule vitesse moyenne** ; le temps par arrêt est le même partout (ou par colis : voir §6) ; le
  camion arrivé avant l'ouverture **attend** (§11).
- **Adresses** : rues réelles (BAN), établissements inventés ; un point au milieu de la rue si la rue n'a pas de numéro.

## 3. Objectif pédagogique

L'élève sait **ordonner une tournée de livraison** en tenant les **horaires d'ouverture** des clients et le **temps de
conduite** (4 h 30 sans pause), et **calculer la feuille de route** : temps d'autoroute, heure d'arrivée chez chaque client,
conduite totale, besoin d'une pause, heure de retour. Il transmet la tournée au chauffeur par un message court.
Suit ENT-6.8 (la tournée de la côte est partie à 6 h avec Lucas sur T1) ; précède ENT-6.10 (Lucas revient avec le bon de
livraison et de reprise de Malo).
**Lien avec 6.8** : en 6.8, la carte « côte » annonçait 4 h 30 de conduite, « juste à 4 h 30 » ; ici l'élève découvre que
c'est **l'ordre des arrêts** qui décide si on tient ces 4 h 30.

## 4. Déroulé (≈ 45 min)

**Date : vendredi 18 juin 2027, 6 h 30** (décision 66). Lucas est parti de Buchelay à 6 h 00 avec T1 ; il est sur l'A13. Il
sortira de l'autoroute à Touques vers **7 h 35** (valeur calculée depuis les données : départ + km d'autoroute à 90 km/h).
L'élève doit lui envoyer l'ordre des arrêts avant. Tuteur : **Karim**.

**Message d'accueil de Karim** (texte proposé, 3 blocs) : « {prénom}, Lucas est sur l'A13 avec la tournée de la côte. Le
logiciel n'a pas sorti l'ordre des arrêts ce matin : c'est toi qui le fais. / Six clients, dont Malo à Villers. Regarde bien
les horaires d'ouverture, et n'oublie pas : **4 h 30 de conduite au plus sans pause**, autoroute comprise. Lucas doit être
rentré à Buchelay **avant 15 h 30**. / Envoie-lui la tournée par SMS avant qu'il sorte de l'autoroute. Karim »

### Étape 1 — Ordonner les arrêts (≈ 15 min, jalons 1 à 4)

Vue **Tournée** (carte réelle de la côte, de Honfleur à Houlgate, lot 3 du moteur). Points **visibles et nommés** dès le
départ (guidage : pas de repérage à faire, comme ENT-3.1). L'entrée sur la côte est un point « **Sortie de l'A13 (Touques)** » :
la tournée part de là et y revient. L'autoroute est **hors carte** (lot 2 : approche à part), rappelée dans le bandeau :
« Buchelay → sortie de Touques : {km} km d'autoroute ».
**Pas de quai** : tout le camion part, aucune commande n'est laissée (option du lot 2).

Les six clients (construits ; noms à vérifier libres ; fenêtres **provisoires, à caler par le script**, §6) :

| Point | Ville | Client (fictif) | Horaire (affiché sur la fiche du client) | D'où vient la contrainte |
|---|---|---|---|---|
| D | Deauville | café près de la place du Marché | **avant 8 h 30** (« vendredi, jour de marché : après, la place est fermée aux camions ») | marché vérifié, règle construite |
| H | Honfleur | restaurant du centre ancien | **avant 10 h 30** (« rue piétonne : livraisons le matin ») | construit |
| T | Trouville | brasserie, rue des Bains | **avant 11 h 00** (« zone piétonne ») | zone vérifiée, horaire construit |
| M | Villers-sur-Mer | **La Cabane à Malo** (bar de plage) | **pas avant 10 h 00** (« Malo n'ouvre qu'à 10 h ») | construit (Malo, fil rouge) |
| V | Villers-sur-Mer | hôtel-restaurant | aucune | contraste |
| G | Houlgate | restaurant | **avant 11 h 30** (« avant le service du midi ») | construit |

Les commandes (fûts, casiers) sont affichées pour le réalisme mais **ne jouent pas** (pas de plafond de charge : la
répartition est faite, le camion part plein ; les vides sont le sujet de 6.10).

**Aides du guidage** (décision 67) : les jauges disent **en direct QUE** une fenêtre est ratée (« trop tôt chez Malo, le
camion attend » / « Houlgate : après 11 h 30 »), **QUE** la conduite dépasse 4 h 30 et **QUE** le retour est après 15 h 30 —
**jamais de combien** ni l'heure calculée (c'est la feuille qui la donne, étape 2). Étapes numérotées en tête de vue
(pastilles : « Ordonner », « Calculer », « Envoyer »).

### Étape 2 — La feuille de route (≈ 20 min, jalons 5 à 9)

Feuille de calcul **colorée** (jaune = étape, violet = résultat), numéros d'étape et phrases d'aide **visibles** (guidage, comme
ENT-3.1). **Adresses de cellules stables** (comme 3.2) ; une erreur de lecture ne se paie qu'une fois (attendus calculés sur
les saisies de l'élève).

**Bloc A — Données de la journée** (déjà écrites, en lecture : guidage) : départ de Buchelay 06:00 · km d'autoroute (aller,
= retour) · vitesse sur autoroute 90 km/h · vitesse moyenne sur la côte · temps par arrêt · conduite maximale sans pause 4 h 30 ·
retour avant 15:30.

**Bloc B — L'aller** : temps d'autoroute (min) `=km/90*60` · heure de sortie à Touques (formule).

**Bloc C — Feuille de route** (6 lignes réservées, **dans l'ordre de la tournée**, remplie toute seule pour le client et les
km du tronçon, lot 2) : n° · client · **km depuis l'arrêt précédent** (donné par la carte) · **heure d'arrivée** (formule :
départ de l'arrêt précédent + km ÷ vitesse × 60) · **heure de départ** (formule : arrivée + temps par arrêt, **ou** ouverture +
temps par arrêt si le camion est arrivé trop tôt — aide : « s'il attend, il repart plus tard ») · horaire du client (rappel).
Puis : km du dernier arrêt à la sortie de l'A13.

**Bloc D — Le bilan** : km sur la côte (somme) · temps de conduite sur la côte (min) · **conduite totale** (aller + côte +
retour, en h min) · **« Pause de 45 min nécessaire ? »** (case oui / non, comparée à 4 h 30) · **heure de retour à
Buchelay** (départ du dernier arrêt + km jusqu'à l'A13 + autoroute retour, + 45 min si pause).

### Étape 3 — Le SMS à Lucas (≈ 8 min, jalons 10 à 12)

Bouton « **Envoyer la tournée à Lucas** » (deux clics, fige la carte et la feuille ; `termine` existant), puis **SMS en
phrases à choisir** (vue existante, ordre des choix tiré par élève) :

| Ligne | Choix (menus calculés depuis les données) |
|---|---|
| 1 | « Salut Lucas, ta tournée : » (fixe) |
| 2 | « 1er arrêt : {client} » — menu des 6 clients |
| 3 | « 2e arrêt : {client} » — menu des 6 clients |
| 4 | « 3e arrêt : {client} » — menu des 6 clients |
| 5 | « Retour prévu à Buchelay vers {heure} » — menu de 4 heures (au quart d'heure, dont celle de sa feuille) |
| 6 | « Pas de pause à prévoir. » · « Pense à ta pause de 45 min. » |
| 7 | « La suite de l'ordre est dans ton terminal. Karim » (fixe ; même mot qu'en ENT-6.10 : le terminal des chauffeurs FB est vérifié, cas client Rayonnance ; le nom d'appli « Ambassador » n'est pas repris) |

**Fin** — réponse de Lucas (`apresMail`, ne dit pas si c'était juste) : « Bien reçu, je sors à Touques. » ; puis Karim :
« Merci {prénom}. Ce soir, Lucas rentre avec les vides de Malo : tu l'accueilleras au quai. Karim » (lien vers 6.10).

**Pour réfléchir** (bilan, réponse libre non notée, règle 32) : « Malo n'ouvre qu'à 10 h. Qu'est-ce que ton ordre aurait coûté
à Lucas si tu étais passé chez lui en premier ? »

Mots cliquables : tournée, feuille de route, itinéraire, temps de conduite, pause, horaire d'ouverture, zone piétonne, porteur,
autoroute, vitesse moyenne.

## 5. Jalons / notation (12)

Rien de vrai avant l'envoi ; **inaction 0 / 12** (envoyer une tournée vide est impossible : le bouton exige les 6 arrêts).

| # | Jalon | Ce qu'il lit | Piège qui le fait tomber |
|---|---|---|---|
| 1 | Les six clients sont dans la tournée envoyée | `etat.ordre` à l'envoi | tournée envoyée incomplète (si le moteur le permet) |
| 2 | Toutes les fenêtres d'ouverture tenues (aucun « trop tard » ; « trop tôt » = attente, pas une faute) | bilan | ordre nord → sud ; Deauville pas en premier ; Houlgate en dernier |
| 3 | Conduite totale ≤ 4 h 30 (pas de pause nécessaire) | bilan (`conduite`, lot 2) | ordre qui tient les fenêtres mais zigzague (calage : il doit en exister) |
| 4 | Retour à Buchelay avant 15 h 30 | bilan | Malo en premier (longue attente), ordre avec pause |
| 5 | Temps d'autoroute et heure de sortie justes | feuille, blocs B | — |
| 6 | Heures d'arrivée et de départ justes **sur sa tournée** | feuille, bloc C (attendus sur ses saisies) | attente oubliée chez Malo |
| 7 | Conduite totale juste | bloc D | conduite comptée sans l'autoroute ; temps aux arrêts compté dans la conduite |
| 8 | « Pause nécessaire ? » cohérent avec **sa** conduite | bloc D | « non » avec 4 h 40 |
| 9 | Heure de retour juste (avec la pause si elle est due) | bloc D | pause oubliée |
| 10 | SMS : les 3 premiers arrêts sont ceux de sa tournée envoyée | phrases | — |
| 11 | SMS : heure de retour = la plus proche de celle **du bilan** (pas de sa feuille) | phrases | heure recopiée d'une feuille fausse |
| 12 | SMS : pause cohérente avec la conduite **réelle** de sa tournée | phrases | « pas de pause » avec 4 h 40 |

Remarques :
- Les jalons 6 à 9 jugent la feuille **sur sa propre tournée** : une mauvaise tournée bien calculée garde ses points de calcul.
- Les jalons 11 et 12 jugent ce que Lucas va vivre (bilan réel), pas la feuille : un calcul faux transmis au chauffeur se paie
  une fois au calcul, une fois au message. **Assumé** (c'est l'information qui part sur la route) — à confirmer (§11).
- Aucun jalon ne juge un ordre attendu : les fenêtres et la conduite sont jugées. La solution de référence sert aux tests.

## 6. Contenu et calage

`contenus/france-boissons-ent69.js` (tournée, clients, feuille, jalons, messages, phrases, lexique, `SOLUTION`) ;
`outils/carte/fb-ent69.json` → `contenus/fb-ent69-carte.js` (lot 3 du moteur). Univers dans le fichier commun de France
Boissons (Karim, Lucas, Malo : ne pas redéclarer).

**Calage (script `docs/briefs/france-boissons/calage-6.9.py`, énumération des 720 ordres)**, à proposer en **2 ou 3 jeux
chiffrés** avant d'écrire la séance (comme Boost 3.2), pour : vitesse moyenne sur la côte, temps par arrêt (fixe ou par
colis), fenêtres des 6 clients. Profil à garantir :
- **5 à 15 %** des ordres tiennent tout (fenêtres, 4 h 30, 15 h 30) ;
- l'ordre géographique **nord → sud** (Honfleur → Houlgate) **et sud → nord** ratent chacun au moins une contrainte ;
- l'ordre **le plus court** en km rate au moins une contrainte ;
- **il existe des ordres qui tiennent toutes les fenêtres mais dépassent 4 h 30** (piège du jalon 3), et des ordres sous 4 h 30
  qui ratent une fenêtre ;
- passer chez Malo **avant 10 h** coûte une attente qui fait rater une autre fenêtre ou le retour ;
- la meilleure tournée a **≈ 4 h 15 à 4 h 30** de conduite, pour rester cohérente avec la carte « côte » d'ENT-6.8 (320 km,
  4 h 30 de conduite, 8 h 30 de service) — **si le calage s'en écarte, le dire : la carte de 6.8 serait à recaler** ;
- km d'autoroute Buchelay → sortie de Touques : **mesurés** (OSM ou Mappy), pas inventés ; la sortie vers 7 h 35 en découle.

Valeurs attendues (feuille, bilan, menus du SMS) **calculées** depuis les données, jamais recopiées.

## 7. Demandes au moteur

Toutes dans `docs/briefs/MOTEUR-vue-tournee-camion.md` :
- **Lot 1** fenêtres d'ouverture (« pas avant », « entre », attente) ;
- **Lot 2** approche hors carte à 90 km/h, conduite comptée à part, pause de 45 min après 4 h 30, option sans quai, tronçons
  et heures de départ lisibles par la feuille ;
- **Lot 3** profil d'itinéraires **porteur** et carte de la côte (communes au lieu de quartiers).
À vérifier par Claude Code dans l'existant : phrases à choisir dont les **menus sont calculés** depuis les données (lignes 2-5).

## 8. Tests attendus

Bloc `france-boissons` (cas préfixés « ENT-6.9 ») ; les cas du moteur dans le bloc `boost` / `carte` (ou un bloc `tournee`).
- **Parcours juste 12 / 12** avec la solution de référence **écrite à la main** (ordre, feuille, SMS).
- **Une 2e tournée juste** différente → 12 / 12 (les jalons jugent les contraintes).
- **Chaque piège** du §5 fait tomber **son** jalon : nord → sud (2) ; ordre « fenêtres tenues, conduite > 4 h 30 » (3, et 4 si
  la pause fait rater le retour : le dire) ; Malo en premier (2 ou 4 selon le calage) ; feuille sans attente (6) ; conduite sans
  autoroute (7) ; pause « non » à tort (8, 12) ; SMS avec un autre 1er arrêt (10).
- **Une mauvaise tournée bien calculée** : jalons 5 à 9 vrais.
- **Inaction** : rien de vrai sans envoi ; le bouton refuse une tournée incomplète.
- **« Que, pas de combien »** : aucune jauge ni aucun message n'affiche une heure d'arrivée, un retard en minutes ou la
  conduite totale.
- **Carte** : chaque client sur sa rue et dans sa commune ; aucun tronçon par une rue piétonne ou une voie interdite au profil
  porteur.
- **Sabotages** : retirer l'attente (lot 1) → Malo en premier ne coûte plus rien (test qui échoue) ; compter le temps aux arrêts
  dans la conduite → la meilleure tournée dépasse 4 h 30 ; retirer l'autoroute de la conduite → le piège du jalon 3 disparaît.
- Aucune requête hors du domaine.

## 9. Supports

- Trame courte (Cowork, **après validation à l'écran**) : lexique ; la feuille de route vierge ; encadré « temps de conduite »
  (4 h 30 puis 45 min, 9 h par jour ; la manutention n'est pas une pause) ; ce qui est vérifié (vitesses, A13 / A132, marché de
  Deauville) et construit (clients, horaires, vitesse moyenne).
- Corrigé `contenus/corriges/ENT-6.9.js` : la tournée de référence + sa feuille ; calculé.
- Questions « Pour réfléchir » de la trame (règle 32) : « Lucas a sur son camion les deux palettes de Malo que tu as montées
  jeudi : que se passe-t-il pour Malo si la tournée rate son horaire ? » ; « Ta tournée dépasse 4 h 30 de conduite : qui paie
  les 45 minutes de pause, et qui attend au bout ? »

## 10. Critères de validation par Tristan

À l'écran (1366 × 768, puis au vidéoprojecteur) : la côte se lit (noms des communes, points nommés) ; le clic ordonne les
arrêts ; les jauges disent qu'une fenêtre est ratée sans donner l'heure ; la feuille se remplit dans l'ordre de la tournée ;
l'attente chez Malo se voit dans la feuille ; le SMS se compose en 1 min ; la séance tient en 45 min.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [ ] Camion **arrivé avant l'ouverture** : il **attend** (oui, plus réaliste ; l'attente n'est pas une pause de conduite si
  elle dure moins de 45 min) — ou la fenêtre est « ratée » ?
- [ ] Jalons 11-12 jugés sur le **bilan réel** et pas sur la feuille (oui : c'est ce que Lucas vivra).
- [ ] Temps par arrêt : **fixe** (défaut, plus lisible en 2de) ou par colis (fûts) ?
- [ ] Noms des six clients (fictifs, à vérifier libres ; Cowork propose avant l'implémentation).
- [ ] Textes de Karim et de Lucas : proposés, à relire à l'écran.
- [x] Fin d'ENT-6.8 à corriger (décision 66) — **fait dans le brief 6.8 le 06/10** : « Cet après-midi, tu m'aideras à ordonner ses arrêts » → « Il roule vers la côte :
  tout à l'heure, tu ordonneras ses arrêts. » (Claude Code, dans le brief 6.8 non encore construit.)
- [ ] Durée réelle (≈ 45 min).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
