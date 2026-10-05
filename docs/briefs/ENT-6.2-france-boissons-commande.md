# Brief de séance — ENT-6.2 France Boissons, la commande de La Cabane à Malo (2de, poste A — administration des ventes, entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/ENT-6.2-france-boissons-commande.md. Commence par la demande au moteur du §7 (case « nombre » et lignes de commande dans la fiche à remplir), puis implémente la séance. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
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
- **Consignes, vérifié le 05/10** : **30 € par fût** (Heineken 30 L chez Atlantique Boissons, 197,48 € HT + 30 € de
  consigne ; « 30 € par fût » donné comme montant courant par [The Beer Lantern](https://www.thebeerlantern.com/la-logistique-des-futs-vides-chainon-manquant-de-la-supply-chain-brassicole/), 2024) ;
  **4,20 € par casier de 12 bouteilles d'eau de 1 L en verre consigné** (deux revendeurs : ClicMarket, Le Chai Prulière).
  Le montant exact pour un fût de 20 L n'a pas été trouvé : on garde 30 €, comme pour le 30 L. Les montants **propres à
  France Boissons** ne sont pas publics : ceux-ci sont ceux du marché.
- **Construit (annoncé comme tel)** : le bar « La Cabane à Malo » (Villers-sur-Mer, nom vérifié libre) et son gérant Malo ;
  Inès (administration des ventes, fictive, prénom seul) ; le fait que Malo écrive par mail plutôt que de passer par eazle
  (plausible pour une grosse commande d'événement) ; les formats, les stocks, le minimum de commande, l'heure limite, le
  jour de tournée, les montants de consigne, le numéro client.
- **Documents reconstitués** : en pied « Document pédagogique — reconstitution, non contractuel ». Aucun visage.

## 3. Objectif pédagogique

L'élève sait **lire une demande de client** et en relever ce qui pose problème, **la confronter aux procédures** (stock,
minimum de commande, jour de tournée), **saisir un bon de commande juste** et **répondre au client** par un message
professionnel qui annonce une rupture et propose une solution. Deuxième séance de S2, après l'organigramme (ordre : 6.1 → 6.2 → 6.3 … → 6.10).
Fil rouge : c'est cette commande que l'élève préparera en ENT-6.7, qui partira en tournée en 6.8 et 6.9, et dont les vides
reviendront en 6.10.

## 4. Déroulé (≈ 45 min de travail)

**Date du scénario : mardi 15 juin 2027, 9 h 40** (livraison demandée pour la Fête de la musique, tournée de la côte du vendredi 18). Calendrier de S2 (décision de Tristan du 05/10/2026, « A : lundi → vendredi ») : 6.1 lun. 14 juin · 6.2 mar. 15 · 6.3 mar. 15 après-midi · 6.4 mer. 16, 14 h · 6.5 mer. 16, 16 h · 6.6 jeu. 17, 7 h · 6.7 jeu. 17 après-midi · 6.8 ven. 18, 6 h · 6.9 ven. 18, 6 h 30 · 6.10 ven. 18, 17 h.
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

     Ces chiffres sont **ceux du plan de stockage de masse d'ENT-6.5** (Heineken 30 L : 4 palettes de 4 fûts en M01 ;
     Pelforth : 16 + 8 en M03 et M04 ; Affligem : 1 palette de 2 en M05 ; Edelweiss : 6 palettes de 4 en M07), recalés le
     05/10/2026 (Tristan) pour que le stock reste le même d'une séance à l'autre.
   - **Conditions de vente CHR** (extrait) : **minimum de 10 fûts par livraison** (les casiers ne comptent pas) ; commande
     reçue **avant 12 h la veille** = livrée le jour de la tournée ; consigne : **30 € par fût** et **4,20 € par casier de 12 bouteilles d'eau en verre** (montants vérifiés chez des
     distributeurs, §2) ;
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

`contenus/france-boissons.js` (univers commun aux 9 séances : identité, `THEME` d'après la charte réelle — vérifier que
l'accent et le vert « juste » ne se confondent pas —, lieux, personnages : Inès, Nadia, Karim, Lucas, Malo ; lexique) et
`contenus/france-boissons-ent61.js` (mails, documents, fiche, phrases, jalons, accueil). Une base par séance.

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
- [x] Montants de consigne : 30 € le fût, 4,20 € le casier d'eau en verre (vérifiés sur le marché le 05/10, §2).
- [x] Logo France Boissons : **accord de Tristan le 05/10/2026**. Claude Code le récupère par script dans
  `contenus/trames/logos/` (lire, encoder, écrire, relire, vérifier par empreinte : alerte 10), relève la charte
  (accent, police) et vérifie que l'accent ne se confond pas avec le vert « juste ». Logo seul : aucune autre image.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
