# Brief de séance — ENT-6.2 France Boissons, la commande de La Cabane à Malo (2de, poste A — administration des ventes, entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/ENT-6.2-france-boissons-commande.md. Commence par la demande au moteur du §7 (case « nombre » et lignes de commande dans la fiche à remplir), puis implémente la séance. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à valider par Tristan *(à implémenter → en cours → à valider par Tristan → livré | abandonné)* — livrée le 10/10/2026 en `pret: true, ouverture: 'prof'`
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s2-cadrage.md` (décisions 1 à 20).
Règles d'écriture 2de : `claude/prepalog-2de-eleve-debut-annee.md` (3 lignes par bloc, une consigne par écran).
**Modèle** : Opus pour la séance (séance nouvelle de bout en bout). Sonnet suffit pour la demande au moteur du §7.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.2 |
| `id` (jamais modifié ensuite) | `france-boissons-commande` |
| Titre / desc | « France Boissons — la commande de La Cabane à Malo » / « Renfort à l'administration des ventes de la plateforme de Buchelay : prendre la commande d'un bar de plage pour la Fête de la musique, vérifier le stock et les conditions de vente, proposer un remplacement, confirmer au client. » |
| Rubrique | simulog, entreprise **n° 6 France Boissons** (ligne `ENTREPRISES` nouvelle, logo à récupérer : accord de Tristan donné le 05/10, voir §11) |
| Entreprise | France Boissons (réelle, vérifiée : §2) |
| Niveau(x) | 2de (`niveaux: ['2de']`) |
| Compétence(s) | **AGO-1.1** (identifier la demande, apporter une réponse adaptée) et **AGO-1.2** (appliquer les procédures internes, produire les documents de la relation client) ; domaine D1 (et D3) |
| Temps pédagogique | entraînement (scénario S2). **Seul temps de travail d'AGO-1.1 / 1.2 avant l'évaluation de S3** (règle 15 du cadrage) : la séance garde des encadrés et des mots cliquables |
| Notation | jalons + note sur 20 (pas de `notation`, comme ENT-5.1) |
| Barème | 8 (nombre de jalons) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (web, 05/10/2026)** : France Boissons, filiale de Heineken, distributeur de boissons des CHR ; plateforme de
  **Buchelay (78)** qui livre « du nord-ouest parisien à la côte normande » ; retours de fûts et de bouteilles consignés
  (sources dans le cadrage). Les CHR commandent sur **eazle**, la plateforme de commande en ligne de France Boissons
  (24 h/24, depuis novembre 2023 ; [L'Hôtellerie Restauration](https://www.lhotellerie-restauration.fr/actualite/eazle-la-commande-en-ligne-par-france-boissons)).
- **Vérifié le 05/10** : Heineken, Affligem, Pelforth et Edelweiss sont des marques de Heineken France
  ([heinekenfrance.fr](https://www.heinekenfrance.fr/nos-marques/nos-systemes-de-pression/)) ; **Affligem Blonde et
  Pelforth Blonde existent en fût de 20 L** chez des distributeurs CHR (fiches produit Le Chai Prulière, Adam Boissons).
- **Consignes, vérifié le 05/10 (soir)** : la scène se passe en juin 2027, donc on applique l'**arrêté du 6 février 2026**
  (JO du 26/02/2026, en vigueur le **1er janvier 2027**) qui fixe les taux de consignation du secteur des boissons :
  **40 € par fût de 20 à 50 L** (au lieu de 30 € depuis 2001), **4 € par casier** (taux unique, au lieu de 1,80 € à 4,60 €),
  bouteilles ≥ 50 cl 0,30 €, palette 13,50 € (inchangé) ([FNB](https://www.fnb-info.fr/actualites/economie/consignation-des-emballages-dans-le-secteur-des-boissons-%C2%A0-%C2%A0),
  [L'Officiel des métiers](https://www.lofficieldesmetiers.fr/consigne-des-emballages-ce-qui-va-changer-a-partir-du-1er-janvier-2027/),
  [Légifrance JORFTEXT000053580478](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053580478) — texte de l'arrêté non relu, Légifrance
  bloqué). Le fût de 20 L et celui de 30 L sont donc tous deux à 40 €. Montants valables pour **toute la S2** (6.2 à 6.10).
  *Ancienne version (30 € / 4,20 €, montants du marché 2024) remplacée le 05/10, décision de Tristan.*
- **Construit (annoncé comme tel)** : le bar « La Cabane à Malo » (Villers-sur-Mer, nom vérifié libre) et son gérant Malo ;
  Inès (administration des ventes, fictive, prénom seul) ; le fait que Malo écrive par mail plutôt que de passer par eazle
  (plausible pour une grosse commande d'événement) ; les formats, les stocks, le minimum de commande, l'heure limite, le
  jour de tournée, le numéro client.
  **Références article** (10/10/2026, décision de Tristan) : `FUT-HEI-30` (Heineken fût 30 L), `FUT-AFF-20` (Affligem), `FUT-PEL-20` (Pelforth),
  `FUT-EDE-20` (Edelweiss), `FUT-HEI-20` (Heineken fût 20 L), `CAS-EAU-12` (eau, casier de 12) : construites, les vraies références
  de France Boissons ne sont pas connaissables ; posées dans l'univers (`contenus/france-boissons.js`) pour toute la S2.
- **Documents reconstitués** : en pied « Document pédagogique — reconstitution, non contractuel ». Aucun visage.

## 3. Objectif pédagogique

L'élève sait **lire une demande de client** et en relever ce qui pose problème, **la confronter aux procédures** (stock,
minimum de commande, jour de tournée), **saisir un bon de commande juste** et **répondre au client** par un message
professionnel qui annonce une rupture et propose une solution. Deuxième séance de S2, après l'organigramme (ordre : 6.1 → 6.2 → 6.3 … → 6.10).
Fil rouge : c'est cette commande que l'élève préparera en ENT-6.7, qui partira en tournée en 6.8 et 6.9, et dont les vides
reviendront en 6.10.

## 4. Déroulé (≈ 45 min de travail)

**Date du scénario : mardi 15 juin 2027, 9 h 40** (livraison demandée pour la Fête de la musique, tournée de la côte du vendredi 18). Calendrier de S2 (décision de Tristan du 05/10/2026, « A : lundi → vendredi ») : 6.1 lun. 14 juin · 6.2 mar. 15 · 6.3 mar. 15 après-midi · 6.4 mer. 16, 14 h · 6.5 mer. 16, 16 h · 6.6 jeu. 17, 7 h · 6.7 jeu. 17 après-midi · 6.8 ven. 18, 5 h · 6.9 ven. 18, 6 h 30 · 6.10 ven. 18, 17 h.
 La Fête de la musique tombe le **lundi 21 juin 2027** (vérifié au
calendrier). L'élève joue **son propre rôle** : « Tu es en renfort à l'administration des ventes de France Boissons, à
Buchelay. »

1. **Message d'accueil d'Inès** (3 blocs) :
   « Bonjour {prénom}, bienvenue à l'administration des ventes ! / Les bars de la côte normande préparent la Fête de la
   musique. Malo, le gérant de La Cabane à Malo, vient de nous écrire. / Prends sa commande : vérifie le stock et les
   conditions de vente, remplis le bon de commande, puis réponds-lui. Inès »
2. **Mail de Malo** (tutoiement, ton familier : c'est voulu, l'élève ne doit pas le recopier) :
   « Salut ! Pour la Fête de la musique il me faut 6 fûts de Heineken 30 L, 4 fûts d'Affligem 20 L et 3 casiers d'eau
   plate. Si jamais il manque quelque chose, mets-moi une autre blonde en 20 L. Livre-moi samedi, c'est mieux pour moi.
   Et reprends mes vides : 9 fûts et 5 casiers. Merci ! Malo — La Cabane à Malo, Villers-sur-Mer »
   Pièces jointes : les trois documents ci-dessous.
3. **Documents** (pièces jointes, aussi à gauche de la fiche) :
   - **Fiche client** : La Cabane à Malo, bar de plage, Villers-sur-Mer (14) ; n° client construit ; **tournée de la côte :
     le vendredi** ; ouverture du bar à 10 h ; consignes chez le client : 9 fûts, 5 casiers.
   - **Extrait du stock de Buchelay** (mardi 15/06, 9 h ; le réassort d'Affligem attendu de la brasserie n'est pas encore reçu : on ne promet que le stock disponible) :

     | Article | Format | Disponible |
     |---|---|---|
     | Heineken | fût 30 L | 16 |
     | Affligem Blonde | fût 20 L | **2** |
     | Pelforth Blonde | fût 20 L | 24 |
     | Edelweiss (bière **blanche**) | fût 20 L | 24 |
     | Heineken | fût 20 L | **0** |
     | Eau minérale plate 1 L, verre consigné | casier de 12 | 60 |

     Ces chiffres sont **ceux du plan de stockage de masse d'ENT-6.5** (palettes de 8 fûts, décision 52 : Heineken 30 L : 2 palettes en M01 ;
     Pelforth : 16 + 8 en M03 et M04 ; Affligem : 1 palette de 2 en M05 ; Edelweiss : 3 palettes en M07), recalés le
     05/10/2026 (Tristan) pour que le stock reste le même d'une séance à l'autre.
   - **Conditions de vente CHR** (extrait) : **minimum de 10 fûts par livraison** (les casiers ne comptent pas) ; commande
     reçue **avant 12 h la veille** = livrée le jour de la tournée ; consigne : **40 € par fût** et **4 € par casier** (taux fixés par l'arrêté du 6 février 2026, en vigueur depuis le
     1er janvier 2027, §2) ;
     vides repris par le chauffeur à la livraison.
4. **Bon de commande** (fiche à remplir, documents à gauche, agencement B) :
   - Heineken fût 30 L : [nombre]
   - Affligem Blonde fût 20 L : [nombre]
   - Remplacement : [liste : aucun / Pelforth Blonde 20 L / Edelweiss 20 L / Heineken 20 L] et quantité [nombre]
   - Eau plate, casiers : [nombre]
   - Jour de livraison : [choix : vendredi 18 juin / samedi 19 juin / lundi 21 juin]
   - Vides à reprendre : fûts [nombre], casiers [nombre]
   - **Encadré « Prendre une commande »** (3 lignes) : « 1. Ce que le client demande. 2. Ce qu'on peut livrer : stock,
     minimum, jour de tournée. 3. Ce qu'on lui propose quand ça ne colle pas. »
   - Envoi : « Envoyer le bon de commande à Inès ». Rien n'est jugé avant l'envoi ; fiche figée ensuite.
5. **Second message d'Inès** (déclencheur `apresFiche`) : « Bon de commande reçu. Réponds maintenant à Malo : il attend
   de savoir ce qu'il aura, et quand. »
6. **Réponse à Malo par phrases à choisir**, 6 lignes, ordre des choix tiré par élève :

   | Ligne | Juste | Pièges |
   |---|---|---|
   | salutation | « Bonjour Malo, » | « Salut Malo ! » · « Coucou, » |
   | commande | « Votre commande pour la Fête de la musique est bien enregistrée. » | « C'est bon, j'ai noté ta commande. » |
   | rupture | « Il ne nous reste que 2 fûts d'Affligem : je vous propose 2 fûts de Pelforth Blonde 20 L à la place. » | « L'Affligem est en rupture, je retire la ligne. » · « Je vous livre bien 4 fûts d'Affligem. » · « …2 fûts d'Edelweiss à la place. » |
   | livraison | « Vous serez livré vendredi 18 juin, par notre tournée de la côte. » | « …samedi 19 juin, comme vous le souhaitez. » · « …lundi 21 juin. » |
   | vides | « Le chauffeur reprendra vos 9 fûts et 5 casiers vides. » | « …vos 5 fûts et 9 casiers vides. » · « Gardez vos vides jusqu'à la prochaine fois. » |
   | fin | « Cordialement, {prénom}, administration des ventes France Boissons » | « Bisous » · « À plus ! » |

7. **Réponse de Malo** (`apresMail`, juste ou faux, ne dit pas si c'était juste) : « Ok pour la Pelforth, à vendredi !
   Malo ». Transition vers ENT-6.3.

Mots cliquables : fût, consigne, vides, casier, CHR, rupture, minimum de commande, tournée, bon de commande.

**Le piège en chaîne** (décision de Tristan, 05/10) : la rupture d'Affligem (2 sur 4) fait tomber la commande à 8 fûts,
**sous le minimum de 10** ; Malo a donné la solution (« une autre blonde en 20 L ») : 2 fûts de **Pelforth Blonde 20 L**.
Distracteurs : Edelweiss (blanche, pas blonde), Heineken 20 L (à 0). Samedi n'est pas un jour de tournée ; la commande est
reçue avant 12 h la veille du vendredi.

## 5. Jalons / notation (8)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | Heineken 30 L = 6 | `ficheEnvoyee` | fiche non envoyée = faux |
| 2 | Affligem = 2 (jamais plus que le stock) | idem | 4 = faux (on ne promet pas ce qu'on n'a pas) |
| 3 | Remplacement = Pelforth Blonde 20 L × 2 (total des fûts = 10) | idem | Edelweiss ou Heineken 20 L = faux ; « aucun » = faux (minimum non atteint) |
| 4 | Livraison vendredi 18 juin | idem | — |
| 5 | Vides : 9 fûts et 5 casiers ; eau : 3 casiers | idem | inverser fûts et casiers = faux |
| 6 | Phrase « rupture » juste | `phrasesJustes` | message non envoyé = faux |
| 7 | Phrase « livraison » juste | idem | idem |
| 8 | Ton professionnel : lignes salutation, commande **et** fin justes | idem | idem |

Valeurs attendues **calculées** depuis les données (commande de Malo, stock, minimum, jour de tournée), jamais recopiées ;
dans les tests, écrites à la main. Ligne « vides » du message non notée (déjà jugée au jalon 5), comme les lignes
« choix » et « contrat » d'ENT-5.1. Le dernier envoi du message compte.

## 6. Contenu

`contenus/france-boissons.js` (univers commun aux 10 séances : identité, `THEME` d'après la charte réelle — vérifier que
l'accent et le vert « juste » ne se confondent pas —, lieux, personnages : Inès, Nadia, Karim, Lucas, Malo ; lexique) et
`contenus/france-boissons-ent62.js` (mails, documents, fiche, phrases, jalons, accueil). Une base par séance.

## 7. Demandes au moteur

**Fiche à remplir : case « nombre »** (le lot 4 prévu au brief `MOTEUR-documents-formulaire.md`, attendu aussi par
ENT-5.8). Bloc `nombre` (`id`, `lib`, `min: 0`, entier, unité affichée après la case : « fûts », « casiers ») ; une case
vide compte comme manquante à l'envoi ; un nombre non entier ou négatif est refusé à l'envoi avec la raison. Sans aplat sur
le champ (charte). Si possible, un bloc `lignes` qui aligne libellé + case nombre (+ liste facultative) pour un bon de
commande ; sinon, une suite de blocs `nombre` et `liste` suffit. Décider en regardant ce qu'ENT-5.8 demande (date, heure),
mais **ne construire que `nombre`** maintenant.

Ce que la séance réutilise tel quel : documents joints, fiche à remplir (`ouvreFiche`, `apresFiche`), phrases à choisir,
mots cliquables, menu déclaré par séance (chantier en cours au 05/10, voir `docs/EN-COURS.md` : ne montrer que Messagerie
et Bon de commande).

## 8. Tests attendus

Bloc `france-boissons` (nouveau, une ligne dans `BLOCS` : alerte 7) : parcours juste 8/8 ; inaction 0/8 ; chaque piège
(Affligem 4 → jalon 2 faux ; remplacement aucun → jalon 3 faux ; Edelweiss → jalon 3 faux ; samedi → jalon 4 faux ; vides
inversés → jalon 5 faux ; « Salut Malo ! » → jalon 8 faux) ; message non envoyé → jalons 6 à 8 faux ; sabotage par jalon.
Case nombre : vide refusée, négatif refusé, valeur gardée sans redessin.

## 9. Supports

- Trame élève courte (contexte, lexique, bon de commande sur papier) : Cowork, **après validation à l'écran**.
- Corrigé `contenus/corriges/ENT-6.2.js` : bon de commande attendu + message attendu, calculés.
- **Questions « Pour réfléchir » de la trame** (décision de Tristan, 05/10/2026) : elles portent sur ce que l'élève vient de faire **et** le replacent dans la semaine de S2 (lundi 14 → vendredi 18 juin, fil rouge de la commande de Malo) : d'où vient ce qu'il a reçu, qui se servira de ce qu'il a produit, ce que son erreur aurait coûté plus loin. Pistes :
  - « Tu as remplacé 2 Affligem par 2 Pelforth : qui, d'ici vendredi, va travailler à partir de ton bon de commande ? »
  - « Tu as noté 9 fûts vides à reprendre : que se passera-t-il vendredi soir si ton chiffre est faux ? »
  Règles inchangées (`claude/prepalog-trames-eleve.md`) : une question à la fois, sur le travail de l'élève, sans réponse unique.

## 10. Critères de validation par Tristan

Le piège en chaîne se comprend sans aide orale ; un élève de 2de finit en 45 min ; le contraste tutoiement / vouvoiement
saute aux yeux.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Date : mi-juin (décision de Tristan, 05/10) ; **mardi 15 juin 2027** depuis le calendrier « lundi → vendredi » (Tristan, 05/10).
- [x] Piège en chaîne complet (décision de Tristan, 05/10).
- [x] Saisie des quantités : demande au moteur, case « nombre » (décision de Tristan, 05/10).
- [x] Tutrice : Inès, administration des ventes (décision de Tristan, 05/10).
- [x] Montants de consigne : **40 € le fût, 4 € le casier** (arrêté du 6/02/2026, en vigueur au 1/01/2027 ; remplace 30 € / 4,20 €, 05/10 soir, §2).
- [x] Logo France Boissons : **accord de Tristan le 05/10/2026**. Claude Code le récupère par script dans
  `contenus/trames/logos/` (lire, encoder, écrire, relire, vérifier par empreinte : alerte 10), relève la charte
  (accent, police) et vérifie que l'accent ne se confond pas avec le vert « juste ». Logo seul : aucune autre image.
  **Fait le 09/10/2026 (D-E)** : `contenus/trames/logos/france-boissons.svg` (copie exacte du logo de l'en-tête de france-boissons.fr)
  et `france-boissons.png` (645 × 90, fond transparent), refaisables par `node outils/logo-france-boissons.mjs`. Relevé de la charte,
  sources, empreintes, contrastes et bloc `THEME` proposé (accent orange foncé `#b34700`) : `docs/briefs/france-boissons/charte-france-boissons.md`.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

*Rempli par Claude Code le 10/10/2026.*

- **Fichiers créés / modifiés** : créés `activites/france-boissons-commande.js` (la séance, fabrique `seanceEntreprise`),
  `contenus/france-boissons-ent62.js` (messages, documents, bon de commande, phrases, jalons, accueil), `contenus/corriges/ENT-6.2.js`
  (corrigé calculé) ; modifiés `contenus/france-boissons.js` (univers : `STOCK_BUCHELAY`, `CONDITIONS_CHR`, `CONSIGNES`, `CABANE`,
  sept mots au lexique ; rien de changé pour ENT-6.1), `activites/index.js` (une ligne : le code ENT-6.2 range la séance après
  ENT-6.1 sous France Boissons), `outils/test/france-boissons.mjs` (21 cas ajoutés, aucun cas d'ENT-6.1 réécrit),
  `activites/FICHE-SEANCE.md` (exemple du bon de commande, limite connue de « Répondre »). Rien dans `core/` ni `styles/`.
- **Écarts par rapport au brief** (et pourquoi) :
  - §1 « ligne `ENTREPRISES` nouvelle », §7 « case nombre », §8 « bloc nouveau, une ligne dans `BLOCS` » : déjà faits (ENT-6.1, D-E,
    D-2) ; rien à refaire. Pas de bloc `lignes` (décision D-2).
  - §4.6 : la réponse par phrases est portée par le **mail de Malo dès l'ouverture** (le moteur répond toujours à l'expéditeur du mail
    qui porte les phrases, et ne sait pas fermer « Répondre » tant que le bon n'est pas envoyé). L'élève peut donc répondre avant
    d'envoyer le bon ; la **réponse de Malo** n'arrive qu'une fois **le bon et la réponse** envoyés (sinon « Ok pour la Pelforth, à
    vendredi ! » donnerait la solution avant le bon), et Inès, au bon reçu, remercie au lieu de redemander la réponse.
  - §4.3 : en plus des trois documents, **le message de Malo est recopié en premier onglet à gauche du bon** (« Message de Malo ») :
    l'élève a la demande sous les yeux en remplissant, sans repasser par la Messagerie. Non reconstitué : pied « Copie du message reçu ».
  - Le message d'accueil d'Inès joint l'organigramme et l'annuaire de la plateforme (idée de Tristan du 07/10/2026, univers).
- **Décisions prises en route** (une ligne chacune dans `docs/decisions.md`, 10/10/2026) : `parcours` + `precedente:
  'france-boissons-organigramme'` + `correction: true` (règle du premier bilan, comme ENT-6.1 et les séances Smoby), sans
  `reinitialisable` (réservé aux séances X.1) ; bandeau de fin
  en **6 lignes** (les trois jalons des fûts en un bloc « Le bon de commande : les fûts », le piège en chaîne se raisonne en entier) ;
  quantité de remplacement attendue = ce qui manque, au moins de quoi atteindre le minimum (2 ici ; « Pelforth × 4 » est faux) ;
  construits en plus : n° client `C-14-2047`, heure du mail de Malo (9 h 32), libellé « Quantité de remplacement (0 si aucun) ».
- **Tests** : bloc `france-boissons` 38/38 ; suite complète **998/998** le 10/10/2026 (un premier passage à 997 : le bloc
  `transport` refuse `reinitialisable` hors séance X.1, retiré). Valeurs attendues écrites à la main.
  Cas ajoutés : valeurs calculées = brief (et copie de `lireNombre` = original) ; ouverture (messages, pièces, menu = Messagerie et Bon
  de commande, documents lisibles avec leur pied, mots cliquables) ; inaction 0/8 ; parcours juste 8/8 (bandeau 6 ✓, photo) ; huit
  pièges du bon (Affligem 4, aucun, Edelweiss, Heineken 20 L, Pelforth × 4, samedi, vides inversés, eau 4) qui ne font tomber que
  leur jalon ; lignes du message (« Salut Malo ! », « Bisous », « C'est bon… », Edelweiss, samedi ; ligne « vides » non notée) ;
  réponse jamais envoyée (5/8) ; réponse avant le bon ; « Corriger » (7,5/8) ; case nombre (vide, négatif, non entier refusés à
  l'envoi) ; sabotage jalon par jalon (13 sabotages de la base) ; corrigé ; enseignant ; aucune erreur JavaScript.
  **Éprouvés dans les deux sens** (9 sabotages du code, chacun restauré et comparé octet par octet) : stock d'Affligem 2 → 3 (17 cas
  tombent), jalon « jour » toujours juste (2), jalon « ton » sur la salutation seule (2), bon non envoyé jugé juste (1, l'inaction),
  Malo qui répond sans attendre le bon (1), quantité de remplacement non lue (2), eau non lue (2), case nombre sans `min` (1),
  copie de `lireNombre` sans la virgule décimale (1).
- **Commits** : `cd289ad` (séance en brouillon), `c341f32` (tests), puis le commit de livraison (`pret: true, ouverture: 'prof'`,
  brief, décisions, chantiers).
- **Reste ouvert** :
  - **À vérifier à l'écran par Tristan** : le piège en chaîne se comprend-il sans aide orale (stock, minimum, « une autre blonde en
    20 L ») ; le contraste tutoiement de Malo / vouvoiement de la réponse saute-t-il aux yeux ; le rendu de la ligne « Il manque … À
    corriger : … » sous le bouton (rouge, une seule ligne qui peut être longue) ; l'élève peut répondre à Malo avant le bon (acceptable ?).
  - **Demande au moteur** (facultative) : fermer « Répondre » d'un mail par phrases tant qu'une condition est fausse (`phrases.quand(db)`,
    ici `apresFiche('bon-de-commande')`), pour imposer « le bon d'abord ».
  - Trame élève (Cowork, après validation à l'écran), questions « Pour réfléchir » du §9.
- **Références article ajoutées le 10/10/2026 à la demande de Tristan** : champ `ref` sur les six articles de `STOCK_BUCHELAY` ; colonne « Référence » (première) dans l'extrait du stock ; référence dans chaque libellé du bon de commande (cases fûts et eau, liste de remplacement) et dans le corrigé ; mot « référence » au lexique et cliquable (titre de colonne du stock, message d'Inès) ; le mail de Malo ne change pas. Cas de test modifiés : libellés du message « Il manque / À corriger », corrigé attendu, tableau du stock ; cas ajouté : références (unicité, format, affichage).
