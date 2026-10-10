# Brief de séance — ENT-6.10 France Boissons, le retour de Lucas : vides, consignes et boucle des vides (2de, poste B — agent d'exploitation, entraînement OTM-C2.3, découverte LOG-C2.5)

> **📋 Phrase à copier-coller dans ccode (après ENT-6.9) :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-6.10-france-boissons-retour.md. Fais d'abord l'état des lieux du §7 en lecture seule (grille dans la fiche, image en document, objets du kit iso, menu progressif) et dis-moi ce qui manque. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code. Ne construis pas la séance avant que Tristan ait validé la maquette de Cowork (§4 bis).
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 06/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-reprise-6.10.md` (décisions 72 à 80) ; cadrage
`claude/prepalog-2de-s2-cadrage.md` (décisions 10, 13) ; déroulé `claude/prepalog-2de-s2-deroule.md` (calendrier 31, règle 32) ;
décisions 38 (consignes 2027) et 40 (RSE) dans `claude/prepalog-reprise-6.6.md`. Séances liées : `ENT-6.2` (la commande),
`ENT-6.7` (la préparation), `ENT-6.9` (la tournée).
Modèles : **ENT-5.8** (fiche + phrases à choisir), **ENT-6.9 / Boost 3.x** (grille de calcul), **ENT-6.5** (animation à questions).
**Modèle** : **Opus** pour le §7 (moteur) et l'animation ; **Sonnet** suffit pour la séance (données) une fois le §7 livré.
Règles d'écriture 2de : `claude/prepalog-2de-eleve-debut-annee.md` (3 lignes par bloc, une consigne par écran).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.10 |
| `id` (jamais modifié ensuite) | `france-boissons-retour` |
| Titre / desc | « France Boissons — le retour de Lucas » / « Agent d'exploitation à Buchelay : contrôler au quai les vides rapportés de chez Malo, trouver l'erreur du ticket signé, tenir le compte de consignes du client dans la feuille de calcul, prévenir Malo et la facturation, puis chiffrer ce que rapporte un fût qui revient. » |
| Rubrique | simulog, entreprise n° 6 France Boissons (dernière séance de S2) |
| Niveau(x) | 2de |
| Compétence(s) | **OTM-C2.3** (suivre l'opération : traçabilité, traiter un incident, rendre compte aux interlocuteurs) ; **LOG-C2.5** (traiter les retours des supports de charge et des contenants) ; domaines D3 (supports consignés : enregistrer les mouvements, suivre les retours) et D1 |
| Temps pédagogique | **OTM-C2.3 : entraînement** (guidage en ENT-5.8). **LOG-C2.5 : premier et seul temps en 2de** (règle 15 : « découvert », reprise en 1re) → la feuille garde ses **phrases d'aide visibles** (§4, étape 2) |
| Notation | jalons + note sur 20 |
| Barème | 12 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (web, 06/10/2026)** :
  - **Le terminal des chauffeurs-livreurs de France Boissons** (Rayonnance, cas client) : environ 1 200 terminaux Zebra et
    imprimantes portables, ~1 200 tournées par jour ; chez le client, il **enregistre le non-livré avec son motif**, **traite les
    consignes et calcule les montants**, **imprime le bon et la facture** ([Rayonnance](https://rayonnance.fr/en/customer-cases/france-boissons/)).
    → Le « ticket de livraison et de reprise » de la séance est **un ticket imprimé par ce terminal**.
  - Reprise des consignes en livraison : le chauffeur signe un **bordereau de reprise** ; les emballages rendus donnent un
    **avoir déduit de la facture suivante** (pratique décrite par METRO pour les CHR : [metro.fr](https://www.metro.fr/service/developpement-durable/rapporter-emballage-consigne)).
  - Digitalisation du bon de livraison dans le commerce de boissons : déconsignes et reprises saisies sur le terminal ; la
    ressaisie des reprises est une source d'erreurs et de litiges ([Orisha](https://distribution.orisha.com/blog/logistique/digitaliser-bons-de-livraison-commerce-boissons/)).
  - **Conseil national de l'emballage** (chiffres 2014) : ~3 millions de fûts en France, **53,5 utilisations sur 15 ans** ; la
    logistique retour se fait **dans les mêmes camions** que l'aller, par le distributeur, qui trie et massifie avant le retour
    ([CNE](https://conseil-emballage.org/wp-content/uploads/2016/04/Emballages-et-Consigne_Fr.pdf)).
  - Consignes 2027 (arrêté du 6 février 2026, décision 38) : **40 € le fût, 4 € le casier**.
  - Fût Euro 30 L : **9,5 kg vide**, Ø 395 mm ([Thielmann](https://www.thielmann.com/en/stainless-steel-kegs/euro-keg)) ;
    bouteille de bière 33 cl (long neck) : **225 g vide** ([Le Comptoir du Brasseur](https://www.lecomptoirdubrasseur.fr/conditionnement/embouteillage/bouteilles-vides/bouteille-long-neck-33cl-couronne-26-x12/)).
- **Construit (annoncé comme tel)** : le fût cabossé au déchargement, le ticket et son n°, le préremplissage des vides depuis la
  commande, le 9e vide resté dans la réserve de Malo, le solde de consignes de Malo, les textes des personnages. Le nom « Totem »
  de l'appli n'est **pas** repris dans la séance (on dit « le terminal de Lucas »).
- **Documents reconstitués** : en pied « Document pédagogique — reconstitution, non contractuel ». Aucun visage.

## 3. Objectif pédagogique

L'élève sait **contrôler un retour d'emballages consignés** en comptant avant de croire un document signé, **tenir le compte de
consignes d'un client** (avant + livré − repris = nouveau solde, puis la consigne à facturer ou l'avoir), **rendre compte** au
client et au service qui facture, et **chiffrer l'intérêt du réemploi**. Dernière séance de S2 : la commande prise en 6.2,
préparée en 6.7, livrée en 6.8-6.9, revient ici avec ses vides.

## 4. Déroulé (≈ 45 min)

**Date : vendredi 18 juin 2027, 17 h** (calendrier 31). Lucas est rentré à Buchelay avec T1 ; il est au **quai 14**.
Tuteur : **Karim**. Fil : la fin de 6.9 annonçait « Ce soir, Lucas rentre avec les vides de Malo : tu l'accueilleras au quai. »

**Message d'accueil de Karim** (3 blocs) : « {prénom}, Lucas est au quai 14 avec les vides de la côte. / Il a mis à part ceux de
La Cabane à Malo et il te donne le ticket que Malo a signé. / **Compte les vides avant de croire le ticket**, puis envoie-moi ton
contrôle. Karim »
**Message de Lucas** (même moment) : « Tout est livré chez Malo, sauf un Heineken 30 L : je l'ai cabossé en déchargeant, Malo l'a
refusé. Il est revenu avec moi. Le ticket est signé. Lucas »

### Étape 1 — Contrôler les vides au quai (≈ 8 min, jalons 1 à 3)

Fiche « **Contrôle du retour — La Cabane à Malo** » (fiche à remplir, agencement B). Documents à gauche (2 onglets) :
1. **Le quai** — dessin iso `quai-retour-vides.svg` (Cowork le dessine, §6) : l'arrière de T1, rideau ouvert ; au sol, **les
   vides de Malo** sur une palette de rétention : **8 fûts vides** (bouchons gris, étiquette « VIDE ») à plat en quinconce
   3 + 2 + 3 ; **5 casiers vides** empilés (3 + 2) ; **à l'écart, un fût plein cabossé** avec une étiquette rouge « REFUSÉ —
   fût abîmé ». Au fond, grisés, les vides des autres clients (« autres clients », non comptés).
2. **Le ticket de Lucas** (§4.1).

À droite :
- Fûts vides comptés : [nombre] fûts
- Casiers vides comptés : [nombre] casiers
- Fût plein revenu (refusé) : [nombre] fût(s)
- Le ticket est-il juste ? [liste : Oui · Non, écart sur les fûts vides · Non, écart sur les casiers · Non, écart sur les deux]
- **Encadré « Compter avant de croire »** (3 lignes) : « Un ticket signé peut être faux. / On compte ce qui est **au quai**. /
  Un fût **plein** refusé n'est **pas** un vide. »
- Envoi : « Envoyer le contrôle à Karim ». Rien n'est jugé avant l'envoi ; fiche figée ensuite.

#### 4.1 Le ticket (document, reconstitution)

```
FRANCE BOISSONS — Plateforme de Buchelay        TICKET DE LIVRAISON ET DE REPRISE
N° LR-27-0618-C04 · Tournée de la côte · T1 · chauffeur : Lucas · vendredi 18/06/2027
Client : La Cabane à Malo — Villers-sur-Mer · n° client (celui d'ENT-6.2)

LIVRAISON                     Commandé   Livré   Non livré (motif)
Heineken fût 30 L                 6        5     1 — fût abîmé au déchargement, refusé
Affligem Blonde fût 20 L          2        2
Pelforth Blonde fût 20 L          2        2
Eau plate 1 L, casier de 12       3        3

EMBALLAGES REPRIS
Fûts vides                         9   (repris de la commande)
Casiers vides                      5   (repris de la commande)

Signature du client : Malo ✍          Signature du chauffeur : Lucas ✍
```
La mention « (repris de la commande) » est **petite et grise** : c'est l'indice de la cause (décision 75), pas une aide
mise en avant. Elle sert au débat de fin de séance et à la trame.

**Suite (déclencheur `apresFiche`, juste ou faux, neutre)** — Karim : « Contrôle reçu. Fais maintenant le compte de consignes de
Malo **avec tes chiffres** : Inès en a besoin pour sa facture. » (Ne dit pas si le contrôle était juste : alerte 28.)

### Étape 2 — Le compte de consignes de Malo (≈ 12 min, jalons 4 à 6)

Fiche « **Compte de consignes — La Cabane à Malo** » : **la grille de calcul** (tableur intégré, `core/types/grille.js`) posée
**dans la fiche** (demande au moteur n° 1). Documents à gauche (3 onglets) : le ticket ; la **fiche client** (« consignes chez
le client avant la tournée : **9 fûts, 5 casiers** », d'ENT-6.2) ; les **conditions de vente** (40 € le fût, 4 € le casier).

| | A | B — Fûts | C — Casiers | Aide (colonne à droite) |
|---|---|---|---|---|
| 1 | *(en-tête)* | Fûts | Casiers | |
| 2 | Chez le client avant la tournée | **9** *(donné)* | **5** *(donné)* | « Donné (fiche client). » |
| 3 | + Pleins livrés | [saisie] | [saisie] | « Colonne « Livré » du ticket. » |
| 4 | − Vides repris | [saisie] | [saisie] | « Tu as compté au quai : **{n} fûts** » / « **{n} casiers** » (ses chiffres de la fiche 1) |
| 5 | = Chez le client après la tournée | [formule] | [formule] | « Avant + livré − repris. » |
| 6 | Écart (après − avant) | [formule] | [formule] | « Après − avant. » |
| 7 | Consigne (€) | [saisie] | [saisie] | « Conditions de vente. » |
| 8 | Montant (€) | [formule] | [formule] | « Écart × consigne. Négatif = avoir. » |
| 9 | Total de la tournée (€) | [formule] | | « Fûts + casiers. » |

**Décisions de Tristan sur la maquette (06/10/2026)** : « chez Malo avant » ne parlait pas → **« Chez le client avant la tournée »** et
**« Chez le client après la tournée »** (libellés choisis par Tristan) ; la ligne 2 est **préremplie** (donnée, grisée) ; **le prix des consignes n'est pas prérempli** : l'élève
le lit dans les conditions de vente (ligne 7) ; **une formule se construit en cliquant sur les cases**, comme dans un tableur
(demande au moteur n° 5, §7).

**Décision de Tristan (07/10/2026, en jouant la maquette)** : l'élève doit **retrouver ce qu'il a compté** sans quitter la
grille. L'aide de la ligne 4 affiche **ses** comptes de la fiche 1, tels quels (même faux, sans dire s'ils sont justes : alerte
28) : « Tu as compté au quai : 8 fûts » / « 5 casiers ». Il les **recopie lui-même** dans la ligne 4 (la case reste une saisie,
jugée au jalon 5). La fiche 1 reste aussi ouverte dans le menu, figée. Écartés : pastilles d'étape cliquables ; rien à ajouter.

**Attendus** (calculés, jamais recopiés) : ligne 2 donnée (9 / 5) ; ligne 3 = 9 / 3 ; ligne 7 = 40 / 4 ; ligne 4 = **les comptes de l'élève à l'étape 1**
(8 / 5 si juste) ; ligne 5 = `=B2+B3-B4` → **10 / 3** ; ligne 6 = `=B5-B2` → **+1 / −2** ; ligne 8 = `=B6*B7` → **40 € / −8 €** (jugée sur **sa** ligne 7) ;
ligne 9 = `=B8+C8` → **32 €**. Règle « une erreur de lecture ne se paie qu'une fois » : les lignes 5 à 9 se jugent sur **ses
saisies** (attendu `(lire) => …`). Les cases des lignes 5, 6, 8, 9 exigent **une formule** (valeur tapée = fausse, règle de la grille).
Envoi : « Envoyer le compte à Inès ».

*Pourquoi c'est juste dans le réel* : la facture porte la consigne des 9 fûts livrés (360 €) et la déconsigne des 8 repris
(320 €), soit +40 € ; casiers 3 × 4 − 5 × 4 = −8 €. La feuille passe par le **solde chez le client**, plus parlant en 2de ; la
trame montre l'autre calcul.

### Étape 3 — Rendre compte (≈ 8 min, jalons 7 à 9)

Les phrases à choisir ne se font qu'en réponse (règle du moteur) : **deux messages arrivent** après l'envoi du compte
(`apresFiche`), menus tirés par élève. **Jugés sur le réel** (8 vides, 10 / 3, +40 / −8 €), pas sur la feuille : c'est
l'information qui part chez le client et à la facturation (même choix qu'ENT-6.9, jalons 11-12).

**Malo** : « Alors, mes consignes ? Et le Heineken cabossé, je le paie ? Malo »

| Ligne | Juste | Pièges |
|---|---|---|
| salutation | « Bonjour Malo, » | « Salut Malo ! » |
| fût abîmé | « Le fût de Heineken abîmé à la livraison ne vous sera pas facturé. » | « …vous sera facturé, consigne comprise. » · « …sera retiré de vos vides. » |
| vides | « Nous avons repris 8 fûts vides et non 9 : il en reste donc un chez vous. » | « Nous avons bien repris vos 9 fûts vides. » · « Il manque un fût vide : il vous sera facturé 40 €. » |
| solde | « Vous avez maintenant 10 fûts et 3 casiers en consigne chez vous. » | « …9 fûts et 5 casiers… » · « …8 fûts et 5 casiers… » |
| fin | « Cordialement, {prénom}, exploitation France Boissons » | « À plus ! » |

**Inès** : « J'édite la facture de Malo. Qu'est-ce que je mets en consignes, et pour le Heineken ? Inès »

| Ligne | Juste | Pièges |
|---|---|---|
| salutation | « Bonjour Inès, » | « Coucou Inès ! » |
| fûts | « Fûts : 40 € de consigne à facturer (1 fût de plus chez Malo). » | « Fûts : avoir de 40 €. » · « Fûts : 360 € à facturer. » |
| casiers | « Casiers : avoir de 8 € (2 casiers de moins chez Malo). » | « Casiers : 8 € à facturer. » · « Casiers : avoir de 20 €. » |
| Heineken | « Facture 5 Heineken 30 L : le 6e a été refusé. » | « Facture les 6 Heineken commandés. » |
| fin | « Merci, {prénom} » | « Bisous » |

### Étape 4 — La boucle des vides (≈ 12 min, jalons 10 à 12)

**4a. L'animation** (vue « animation à questions », livrée le 05/10) — écran ouvert par Karim après les deux messages : « Les 8
vides de Malo ne restent pas ici. Regarde où ils vont, puis chiffre-le pour moi. Karim »
- **Partie 1** : Buchelay → le porteur part **plein** → chez Malo : il pose les pleins, **reprend les vides dans le même camion** →
  retour au quai 14. Arrêt, **question 1** : « Pourquoi Lucas reprend-il les vides dans le même camion ? » — juste : « Sinon, le
  camion rentrerait vide et il faudrait un autre trajet pour les vides. » ; pièges : « Parce que les vides sont dangereux. » ·
  « Parce que Malo n'a pas de poubelle assez grande. » · « Pour les vendre à un ferrailleur. »
- **Partie 2** : les vides regroupés repartent vers la brasserie (Mons-en-Barœul, comme en 6.4) → **lavage** → **remplissage** →
  le fût revient **plein** à Buchelay. Bulle : « Un fût sert environ 50 fois en 15 ans (Conseil national de l'emballage). »
  **Question 2** : « Un fût vide perdu, qu'est-ce que ça coûte à France Boissons ? » — juste : « 40 € de consigne, et un fût de
  moins dans la boucle. » ; pièges : « Rien, le client paie toujours. » · « Seulement le prix de la bière. » · « 4 €. »
- **À retenir** : « Un fût **revient** : il est lavé et rempli de nouveau. Chaque vide repris, c'est **un emballage qui n'est pas
  jeté**. »
- Questions comptées sur la **1re réponse** (règle de la vue).

**4b. Le chiffrage** — fiche « **Ce que rapporte un fût qui revient** » (grille seule, même présentation qu'à l'étape 2).
Documents à gauche : « **Un fût, une bouteille** » (5 lignes numérotées : 30 L ; 33 cl = 0,33 L ; 225 g = 0,225 kg ; 53 ;
9,5 kg ; sources en pied : CNE 2014, fiche d'un fabricant de fûts, fiche d'un vendeur de bouteilles) et « Revoir l'animation ».
**Décision de Tristan (07/10/2026)** : **l'élève recopie les données** de la fiche dans les lignes 2 à 6 (saisies, comme dans la
maquette), elles ne sont pas préremplies.

| | A | B | Phrase d'aide |
|---|---|---|---|
| 2 | Volume d'un fût (L) | [saisie] → 30 | « Fiche, ligne 1. » |
| 3 | Volume d'une bouteille (L) | [saisie] → 0,33 | « Fiche, ligne 2 — en litres. » |
| 4 | Poids d'une bouteille vide (kg) | [saisie] → 0,225 | « Fiche, ligne 3 — en kg. » |
| 5 | Utilisations d'un fût | [saisie] → 53 | « Fiche, ligne 4. » *(CNE 2014 : 53,5, arrondi)* |
| 6 | Poids d'un fût vide (kg) | [saisie] → 9,5 | « Fiche, ligne 5. » |
| 7 | Bouteilles pour remplacer 1 fût | [formule] | « Volume du fût ÷ volume d'une bouteille. » |
| 8 | Verre jeté pour 1 fût (kg) | [formule] | « Bouteilles × poids d'une bouteille. » |
| 9 | Verre jeté sur la vie du fût (kg) | [formule] | « × le nombre d'utilisations. » |
| 10 | Combien de fois le poids du fût ? | [formule] | « Verre jeté ÷ poids du fût. » |

Attendus : lignes 2 à 6 = les valeurs de la fiche (virgule ou point acceptés ; 33 au lieu de 0,33 ou 225 au lieu de 0,225 =
faux : piège d'unité) ; lignes 7 à 10 calculées sur les saisies de l'élève (1 décimale, tolérance 1 %) : `=B2/B3` → **90,9** (91 accepté) ; `=B7*B4` →
**20,5 kg** ; `=B8*B5` → **≈ 1 084 kg** ; `=B9/B6` → **≈ 114**. Formules exigées. Envoi : « Envoyer à Karim ».
**Fin** — Karim (neutre) : « Merci {prénom}. Une tonne de verre pour un seul fût… Bonne Fête de la musique à Malo ! Karim »
**Pour réfléchir** (bilan, réponse libre non notée, règle 32 + décision 40) : « Le ticket disait 9 vides parce qu'il avait recopié
la commande que tu as saisie mardi. Qu'est-ce qui se serait passé ce soir si personne n'avait compté ? »

Mots cliquables : consigne, déconsigne, avoir, vide, ticket de livraison, non-livré, réemploi, solde, emballage consigné, RSE.

### 4 bis. Ergonomie (demande de Tristan, 06/10/2026 : « attention à l'ergonomie »)

La séance enchaîne 4 écrans de nature différente : c'est son risque principal. Règles :
1. **1366 × 768 et 1280 × 720 sans aucun défilement de page**, à chaque étape ; le bouton d'envoi est **toujours visible** sans
   descendre (s'il ne tient pas, on réduit la phrase d'aide, pas le bouton).
2. **Pastilles d'étape en tête** (comme 6.9) : ① Contrôler · ② Compter les consignes · ③ Prévenir · ④ La boucle des vides. Une
   étape faite est cochée (sans dire si c'est juste).
3. **Menu de séance réduit et progressif** : Messagerie toujours ; chaque fiche et l'animation **n'apparaissent qu'à leur tour**
   (`quand`), pour qu'un élève qui clique partout au début ne se perde pas. Un élève qui revient d'absence retrouve tout ce
   qui est ouvert.
4. **Une seule chose à faire par écran** ; consigne en 3 lignes au plus, en haut de la fiche ; jamais deux fiches à la fois.
5. **Documents à gauche, travail à droite** (agencement B) ; **3 onglets au plus** ; l'onglet ouvert par défaut est celui dont
   l'étape a besoin (le quai à l'étape 1, le ticket à l'étape 2).
6. **Le dessin du quai doit se compter** : chaque fût ≥ 40 px à 1366 × 768, casiers bien séparés, fût refusé nettement à l'écart ;
   **loupe au clic** (le dessin s'agrandit en plein écran, Échap ferme) ; texte alternatif qui **ne donne pas** les nombres.
7. **Grille** : 9 lignes au plus ; formule et résultat côte à côte (déjà le cas) ; **l'aide dans une colonne « Aide » à droite**
   (et non sous la case : sous la case, la grille ne tient pas en hauteur à 1280 × 720 — essayé sur la maquette) ; libellés
   courts (une ligne) ; lignes données (2 de l'étape 2 seulement ; à l'étape 4 l'élève recopie les lignes 2 à 6, décision du 07/10) **grisées, non saisissables** ; colonnes de
   largeur fixe (une formule comme `=B2+B3-B4` se lit en entier).
8. **Phrases à choisir** : 5 lignes, 4 choix au plus par menu, ordre tiré par élève.
9. Clavier : Tab suit l'ordre de lecture ; Entrée **n'envoie pas** une fiche (règle d'ENT-5.8).
10. **Maquette cliquable par Cowork avant construction** des écrans ① et ② : `docs/briefs/france-boissons/maquette-6.10-retour-vides.html`
    (06/10/2026 ; vérifiée par Cowork sans défilement à 1366 × 657 et 1280 × 610 de fenêtre utile, parcours juste 13 / 13 cases).
    À jouer par Tristan à 1366 × 768, puis au vidéoprojecteur. Claude Code ne construit pas la séance avant cette validation.
    La maquette montre aussi : bouton « 🔍 Agrandir » sur le dessin, Entrée qui passe à la case suivante (n'envoie pas),
    message d'arrivée en bas à gauche (ne couvre jamais le bouton d'envoi).

## 4 bis. Questions au fil — À PROPOSER À TRISTAN AVANT DE CONSTRUIRE (règle du 10/10/2026)

Ce brief a été écrit avant la règle. **Avant d'écrire la moindre ligne de la séance**, Claude Code (ou Cowork) propose à
Tristan le tableau de `docs/briefs/MODELE.md` §4 bis : au moins 4 gestes de travail où une question peut arriver, dont une
d'éco-droit appliquée au cas ; jamais une question qui donne d'avance la réponse d'un jalon (sinon corrigée au bilan).
Tristan en garde 2 à 4 ; la part des questions notées (3 à 5 points sur 20) se prend sur les jalons, et le barème du §5
est revu en conséquence (pondération sur 20 : `docs/briefs/NOTATION-ponderation.md`, lot 2). Les pistes « Pour réfléchir »
du §9 sont une bonne source de questions.

### 4 ter. Avant de commencer — À PROPOSER AUSSI

Banque de questions de l'écran d'ouverture (`docs/briefs/MOTEUR-avant-de-commencer.md`, `MODELE.md` §4 ter) :
préparation de l'exercice, 2 ou 3 d'économie-droit appliquées au cas, images si la séance fait découvrir un matériel ;
au moins le double de ce qu'on tire ; validée par Tristan avant construction. Modèle : la banque d'ENT-6.2.

## 5. Jalons / notation (12)

Rien de vrai avant l'envoi de la fiche concernée ; **inaction 0 / 12**.

| # | Jalon | Ce qu'il lit | Piège qui le fait tomber |
|---|---|---|---|
| 1 | Fûts vides comptés = 8 | fiche 1 | 9 (ticket recopié ou fût plein compté) |
| 2 | Casiers vides = 5 **et** fût plein revenu = 1 | fiche 1 | fût refusé oublié ou compté avec les vides |
| 3 | Ticket : « écart sur les fûts vides » | fiche 1 | « Oui » ; « écart sur les deux » |
| 4 | Lignes 3 et 7 justes (9 / 3 ; 40 / 4) | grille 1 | livrés = 10 (la commande, pas le ticket) ; 30 € (l'ancien taux) |
| 5 | Ligne 4 = ses comptes **et** ligne 5 juste en formule | grille 1 (attendus sur ses saisies) | ligne 4 = 9 du ticket ; solde tapé sans formule |
| 6 | Lignes 6, 8, 9 justes en formule | grille 1 | montant sur le solde au lieu de l'écart ; signe perdu |
| 7 | Malo : fût abîmé non facturé + ton (salutation **et** fin) | `phrasesJustes` | « Salut Malo ! » ; fût facturé |
| 8 | Malo : vides (8, le 9e chez vous) **et** solde (10 / 3) | `phrasesJustes` (réel) | « bien repris vos 9 » ; 9 fûts et 5 casiers |
| 9 | Inès : fûts +40 €, casiers avoir 8 €, 5 Heineken | `phrasesJustes` (réel) | 360 € ; 6 Heineken |
| 10 | Animation, question 1 juste (1re réponse) | `db.animations` | — |
| 11 | Animation, question 2 juste (1re réponse) | `db.animations` | « 4 € » |
| 12 | Chiffrage : lignes 2 à 6 lues justes **et** lignes 7 à 10 justes en formule | grille 2 (7-10 sur ses saisies) | 33 cl ou 225 g sans conversion ; valeurs tapées ; division inversée |

Remarques : un élève qui a compté 9 à l'étape 1 perd les jalons 1 et 3, **garde 4 à 6** s'il calcule juste avec ses chiffres, et
perd 8 et 9 (ce qui part chez Malo et chez Inès est faux) : **assumé**, comme en 6.9 (à confirmer, §11).

## 6. Contenu

`contenus/france-boissons-ent610.js` (messages, ticket, fiches, grilles, phrases, animation, jalons, lexique, `SOLUTION`) ; univers
dans `contenus/france-boissons.js` (Karim, Lucas, Malo, Inès, commande de Malo, solde avant tournée : **ne pas redéclarer**, lire).
Valeurs **calculées** depuis les données communes (commande d'ENT-6.2, non-livré, solde avant, taux 2027), jamais recopiées.
**Dessin du quai** : `docs/briefs/france-boissons/quai-retour-vides.svg`, **fourni par Cowork** (06/10/2026, extrait de la maquette),
style iso de 6.4 / 6.7 : bande de quai jaune et noire ; zone de Malo en bleu (8 fûts vides à bouchon gris sur palette de
rétention noire, une pile de 3 et une pile de 2 casiers vides, le fût plein cabossé à l'écart avec l'étiquette « REFUSÉ — fût
abîmé ») ; à gauche, hors de la zone, 5 fûts « autres clients — ne pas compter », pâles.
**Casier validé par Tristan le 06/10** : plastique anthracite ajouré, poignée sur chaque côté, dessus ouvert avec 12 bouteilles en
verre clair au goulot ouvert (= vides), pied sombre et rebord clair pour compter les casiers d'une pile. Le kit iso reprend **ce**
casier (pas celui de la maquette 6.7, une boîte à bouchons). Dessin **à reprendre par le kit iso** si
Claude Code préfère le dessiner (mêmes positions), sinon servi tel quel.

## 7. Demandes au moteur (état des lieux d'abord, en lecture seule)

1. **Grille de calcul dans la fiche à remplir** : bloc `grille` (réutilise `creerGrille`, sans la carte), plusieurs colonnes de
   saisie (B et C), lignes données grisées, envoi et figement comme une fiche, `ficheEnvoyee` lisible par les jalons. Les attendus
   d'une case doivent pouvoir lire **une autre fiche de la séance** (ligne 4 = les comptes de la fiche 1). **La phrase d'aide aussi**
   (décision du 07/10) : l'aide de la ligne 4 affiche les comptes envoyés à la fiche 1 (« Tu as compté au quai : {n} fûts »).
   Si le moteur ne sait pas, **le dire** avant de contourner (pas de copie automatique dans la case : l'élève recopie).
2. **Image dans les documents joints** : un SVG en grand, **loupe plein écran**, texte alternatif ; vérifier `documents.js`.
3. **Kit iso — objets nouveaux** pour l'animation (§10 bis du brief animation) : **porteur** (caisse à rideaux, déjà prévu pour la
   sécurité au quai), **fût vide** (bouchon gris), **casier**, **trois bâtiments simplifiés** (plateforme, bar de plage,
   brasserie) et une **route en boucle** ; laveuse = simple bâtiment légendé « lavage ». Jamais de dessin dans `contenus/`.
4. **Menu progressif** : les fiches ont `quand` ; vérifier que **l'écran d'animation** peut aussi n'apparaître qu'après un
   déclencheur (`apresMail`). Sinon, le dire (défaut : il apparaît dès le début, la séance le place en dernier).
5. **Formule en cliquant** (grille, `core/types/grille.js`) : quand la case commence par `=` et que le curseur suit `=`, `+`, `−`,
   `×`, `÷` ou `(`, un clic sur une autre case (saisie **ou donnée**) **ajoute sa référence** (B4, C7…) au curseur, sans quitter la
   case ; sinon le clic change de case normalement (comme Excel / LibreOffice). Pendant ce mode, les cases montrent un curseur
   « copie » et un pointillé au survol ; la case cliquée clignote une fois. Les cases données (ligne 2) doivent donc porter leur
   référence. Clavier inchangé (taper `B4` marche toujours). Essayé sur la maquette. Sert à toutes les feuilles (Boost, 6.9).
Réutilisé tel quel : fiche à remplir (cases nombre, liste, encadré), phrases à choisir, déclencheurs `apresFiche` / `apresMail`,
mots cliquables, pastilles d'étapes, menu déclaré par séance.

## 8. Tests attendus

Bloc `france-boissons` (cas « ENT-6.10 ») :
- **Parcours juste 12 / 12** avec la solution écrite à la main (8 / 5 / 1 ; grille 9-5 / 9-3 / 8-5 / 10-3 / +1 −2 / 40 −8 / 32 ;
  phrases ; animation ; 90,9 / 20,5 / 1 084 / 114).
- **Inaction 0 / 12** ; aucune fiche envoyable vide.
- **Lecture** : 33 au lieu de 0,33 (ligne 3) → 12 faux, même avec des formules justes ; aide de la ligne 4 = les comptes envoyés à
  la fiche 1 (essayé avec 8 / 5 et avec 9 / 5).
- **Pièges** : 9 vides → jalons 1, 3, 8, 9 faux et 4-6 vrais si calcul juste ; fût plein compté avec les vides → 1 et 2 ;
  livrés = 10 → 4 ; solde tapé « 10 » sans formule → 5 ; montant sur le solde (10 × 40) → 6 ; « bien repris vos 9 » → 8 ;
  « 360 € » → 9 ; question 2 fausse puis juste → 11 faux ; chiffrage tapé en valeurs → 12.
- **Une erreur ne se paie qu'une fois** : grille juste sur des comptes faux → 5 et 6 vrais.
- **Ergonomie** : 1366 × 768 et 1280 × 720, aucun défilement à chaque étape, bouton d'envoi visible ; menu progressif.
- **Sabotages** : retirer « une formule exigée » → le cas « valeur tapée » doit échouer ; juger la ligne 4 sur le ticket → le
  cas « erreur payée une fois » doit échouer ; message de Karim qui dit « juste » → test d'alerte 28.

## 9. Supports

- Trame courte (Cowork, **après validation à l'écran**) : lexique ; le compte de consignes vierge ; encadré « consigne,
  déconsigne, avoir » ; l'**autre calcul** (360 − 320 = 40 € ; 12 − 20 = −8 €) ; ce qui est vérifié / construit.
- Corrigé `contenus/corriges/ENT-6.10.js`, calculé.
- **Questions « Pour réfléchir »** (règle 32 : la semaine entière) :
  - « Mardi, tu as noté “9 fûts vides à reprendre” sur le bon de commande. Ce soir, le ticket l'a recopié. Qui aurait dû
    vérifier, et à quel moment ? »
  - « Le fût cabossé est revenu plein. Où va-t-il maintenant, et qui l'avait déjà vu en 6.4 avec un fût qui fuyait ? »
  - « Une bouteille jetable se recycle aussi. Qu'est-ce que le fût fait de mieux qu'elle ? » (RSE, éco-droit)

## 10. Critères de validation par Tristan

À l'écran (1366 × 768, puis vidéoprojecteur) : on compte les vides sur le dessin sans plisser les yeux ; le fût refusé se
distingue au premier regard ; on comprend sans aide orale que le ticket a recopié la commande (au débat) ; la grille se remplit
de haut en bas sans chercher ; aucun écran ne défile ; l'animation tourne de façon fluide en salle 112 ; la séance tient en 45 min.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [ ] Jalons 8-9 jugés sur le **réel** et non sur la feuille (oui, comme 6.9).
- [ ] Phrases d'aide **visibles** dans la grille de l'étape 2, sans couleurs (oui : premier temps de C2.5) ; numéros de lignes
  gardés.
- [ ] Le fût cabossé : à la **zone litiges** (dit dans la trame, aucun geste dans la séance) — oui.
- [ ] N° du ticket `LR-27-0618-C04` (construit).
- [x] Animation : **soignée** (Tristan, 07/10, après avoir joué la maquette : « il faudra s'appliquer sur l'animation : camion,
  route, bâtiments »). Le camion, la route et les trois bâtiments de la maquette sont **trop sommaires** : à redessiner avec le kit
  iso au niveau du dessin du quai (porteur reconnaissable avec cabine, roues et caisse ; route avec bas-côtés ; brasserie, plateforme
  et bar de plage qui se reconnaissent). **Pas de version schéma.** Montrer à Tristan une capture de chaque objet avant de brancher.
- [x] Chiffrage : données **lues** dans « Un fût, une bouteille » et recopiées par l'élève (Tristan, 07/10).
- [x] Ligne 4 de l'étape 2 : l'aide rappelle les comptes de l'élève (Tristan, 07/10).
- [ ] Durée réelle (≈ 45 min ; l'étape 4 peut glisser en devoir si l'essai déborde).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
