# ENT-6.4 France Boissons, le camion de la brasserie — trois propositions à trancher (questions au fil, « Avant de commencer », poids sur 20)

**Statut** : à trancher par Tristan **Date** : 10/10/2026 **Pour** : `docs/briefs/ENT-6.4-france-boissons-reception.md` (§4 bis, §4 ter, §5)
**Rien n'est construit.** Une fois tes choix faits, ils sont recopiés dans le brief (§4 bis, §4 ter, §5) et la séance s'écrit (`pret: false`).

**Vérifié dans le code** (lu le 10/10) : une question « au fil » a un énoncé fixe (pas de « {ton choix} » : ENT-6.3 les a retirés), 2 à 4 choix, une bonne réponse ou « réflexion », `apres: 'bilan'` pour corriger au bilan, un `groupe` obligatoire si elle est notée ; elle n'a **pas** de texte « à gauche » (seules les questions d'« Avant de commencer » en ont) : un texte de loi se met donc dans l'énoncé (2 lignes) ou en pièce jointe d'un message de Nadia. Gestes que la vue quai publie aujourd'hui : `quai:<id>:decharger`, `:valider` (une palette, **sans dire laquelle**), `:cloturer` ; et `messagerie:phrase:<ligne>`. L'écran d'ouverture tire 2 + 2 (+ 1 image) par élève dans une banque d'au moins le double, `variante` pour les valeurs tirées, `cle: true`, `calculette`.
**Supposé** : les deux gestes de la scène d'inspection (⚙ ci-dessous : à publier par la vue nouvelle, elle « naît avec ses gestes ») ; le texte exact de L133-1 et de R4323-56 (à relire sur Légifrance avant livraison, comme pour toute la série) ; le fait que le mail du message à Nadia porte une `cle` qui peut être fermée par un point d'étape.

**À savoir avant de lire** : Cowork avait déjà proposé des questions et une banque pour 6.4 (`docs/briefs/france-boissons/PROPOSITIONS-questions-au-fil.md` et `BANQUE-avant-de-commencer.md`), « tout gardé » le 10/10, **mais avant la réécriture du §7.3** (inspection sur le quai iso). Cette page les reprend et les corrige là où la réécriture les rend dangereuses : la question n°1 de Cowork disait « chauffeur au volant, moteur allumé » (elle nommait le défaut, alors que tu as voulu qu'un défaut oublié soit remis en ordre **sans un mot**), et la question `protocole` de la banque parlait de « où se met le chauffeur, comment le camion est immobilisé » (même fuite, **avant** la séance).

---

## 1. Questions au fil — propositions

Règle suivie : un geste de travail déclenche la question (jamais un clic de menu) ; une seule question par geste ; aucune ne dit où se trouve un défaut ni « de combien » ; ce qui éclairerait un envoi à venir est **corrigé au bilan**. Les inspections 1 à 3 sont figées au clic « C'est bon » : une question posée **après** ce clic ne change plus leurs jalons, mais elle ne doit quand même rien nommer.

| Geste (écran, case) | Qui pose | Question proposée | Type (fil / point d'étape) | Notée / réflexion | Corrigée tout de suite / au bilan | Pourquoi ici |
|---|---|---|---|---|---|---|
| **1.** Clic « C'est bon, on peut décharger » (⚙ `scene:<id>:decharger`, à publier par la scène) | Nadia | « Tu me dis qu'on peut décharger. Avant d'entrer dans une remorque avec le chariot, qu'est-ce qui doit être vrai ? » — **Le camion ne peut plus bouger et le passage vers la remorque est sûr** · Le chauffeur nous dit que tout va bien · Le quai est propre et rangé · On a du retard, il faut aller vite | fil | **notée 1,5** (C1.2) | **au bilan** | L'inspection est figée, mais le défaut oublié est réparé sans un mot : la question ne nomme ni cabine, ni cale, ni niveleur. Son retour est la phrase du bilan (§11, 1re case ouverte) : si tu la gardes, **une seule des deux** suffit. Remplace la n°1 de Cowork. |
| **2.** Premier « Signaler à Nadia » (⚙ `scene:<id>:signaler`) | Nadia | « Comment as-tu cherché ce qui ne va pas ? » — J'ai regardé toute la scène avant de cliquer · J'ai cliqué sur ce qui m'a paru bizarre · J'ai cliqué un peu partout, au cas où · Je ne savais pas quoi chercher | fil | **réflexion** | **au bilan** | Fait réfléchir à la méthode (« repérer seul »). Le retour dirait que cliquer partout compte comme de fausses alertes (jalon 3) : il arrive **après** le dernier envoi possible. Facultative. |
| **3.** Premier déchargement au chariot frontal (`quai:<id>:decharger`) | Nadia | « Tu conduis le chariot frontal. Qu'est-ce qui te donne le droit de le conduire ici ? » — **Une formation (comme le CACES) et l'autorisation de conduite donnée par France Boissons** · Le permis B · Rien : tout salarié peut le conduire · L'accord du chauffeur | fil | **notée 1** (C1.2) | tout de suite | **Éco-droit appliqué** : Code du travail R4323-56, sur le geste qu'il fait. Ne touche aucun jalon. Je la **sors de la banque** (`autorisation-conduite`) pour ne pas la poser deux fois. |
| **4.** Première palette validée (`quai:<id>:valider`) | Nadia | « Tu viens de valider une palette. Pour l'accepter, tu compares ce que tu as compté à… » — **Ce qu'annonce le BL** · Une palette pleine, 8 fûts · Ce que dit le chauffeur · La palette d'à côté | fil | **notée 1** (C1.4) | **au bilan** | Le retour (« pas une palette pleine ») soufflerait le piège de P4 avant qu'elle soit comptée. Le geste ne dit pas quelle palette : la question reste générale (⚙ seulement si tu veux viser P4). Remplace la n°4 de Cowork (« qu'as-tu regardé ? », dont le retour « tout le tour » soufflait P3). |
| **5.** BL signé (`quai:<id>:cloturer`) : point d'étape, il garde fermé « Répondre » à Nadia | Nadia | « Tu as signé le BL. Si on découvre demain, sous un film, un dommage que personne n'avait vu, combien de temps a-t-on pour protester auprès du transporteur ? » — **3 jours, jours fériés non compris, par lettre recommandée, en expliquant pourquoi** · 1 mois, par un simple mail · Le jour même seulement · Plus du tout | point d'étape | **notée 1,5** (C1.4.2) | tout de suite | **Éco-droit appliqué** : Code de commerce L133-3 al. 1 (texte repris d'ENT-4.1 et 4.3, relu sur Légifrance le 03/10/2026, version en vigueur depuis le 10/12/2009), cité dans l'énoncé. Ne dit pas quelles réserves étaient justes (jalons 5, 6, 9). Je la **sors de la banque** (`protestation`). |
| **6.** Phrase « fût qui fuit » du message à Nadia (`messagerie:phrase:fut-fuit`, premier choix) | Nadia | « Pourquoi ne met-on pas un fût abîmé en stock avec les autres ? » — Il est abîmé : on le met à part, le temps de régler avec la brasserie et le transporteur · Il prendrait trop de place · Il peut encore être livré à un client · Il faut le rendre au chauffeur tout de suite | fil | **réflexion** | **au bilan** | Le retour donnerait la phrase juste (jalon 10) avant l'envoi. Reprise de Cowork n°3 (Nadia pose, Thomas n'est pas encore là). |

**Ce que je recommande** : variante A (3 points) = lignes **1 et 5** notées + 6 en réflexion ; variante B (5 points) = lignes **1, 3, 4, 5** notées. La 2 est facultative (aucun point).
**Écartées, et pourquoi** : « Faut-il signaler le niveleur / la cale ? » (c'est l'inspection) ; « Où se met le chauffeur pendant le déchargement ? » (nomme la cabine) ; « Une palette incomplète est-elle fausse ? » (piège de P4) ; « Faut-il faire le tour de la palette ? » (piège de P3) ; « Qui est responsable du fût qui fuit, le transporteur ou la brasserie ? » (donne le motif de P3 ; reste en banque, sur un autre cas : `transporteur-garant`).
**Texte de loi à l'écran** : comme la vue quai n'a pas de volet « à gauche » pour une question au fil, l'énoncé de la 3 et de la 5 cite la phrase utile (2 lignes) ; une pièce jointe « Le droit » au message d'accueil de Nadia (comme en 6.2 et 6.3) est possible.
**Demande au moteur** (à ajouter au §7.3 du brief) : la scène publie `scene:<id>:signaler` et `scene:<id>:decharger` ; ils entrent dans la liste `signaux` de la vue.

---

## 2. Banque « Avant de commencer »

Tutrice : Nadia. Tirage proposé `{ preparation: 2, droit: 2, image: 1 }` = 5 questions par élève, `calculette: true`, non notées (l'élève ne le sait pas). Chaque rubrique contient au moins le double de ce qu'on tire. ★ = `cle: true` (reprise en évaluation, sans aide). Une question d'ouverture exige un document « à gauche » : ceux de la séance sont le **BL MON-27-0617**, l'**annuaire**, **« Le droit »**, **« Photos et dessins »** et un petit onglet **« Mots du quai »** (à créer, 8 lignes, **sans** dire où va le fût qui fuit).

| id | Rubrique | Question | Juste | Pièges | À gauche (document ou image) | ★ éval |
|---|---|---|---|---|---|---|
| `bl-cest-quoi` | préparation | Le BL que te donne le chauffeur, c'est… | Le bon de livraison : la liste de ce que le camion doit livrer | La facture à payer au chauffeur · Le bon de commande de Malo | BL | ★ |
| `reserve-cest-quoi` | préparation | Écrire une **réserve** sur le BL, c'est… | Écrire précisément ce qui ne va pas, avant de signer | Refuser tout le camion · Signer sans rien dire et prévenir plus tard | BL | ★ |
| `huit-futs` | préparation | **Tirée** : « Dans l'exercice, une palette complète porte 8 fûts. Un camion livre **{n}** palettes complètes. Combien de fûts doivent arriver ? » (n de 2 à 7, **jamais 4**) | 8 × n (calculé) | n + 8 · 4 × n | BL | |
| `zone-litiges` | préparation | La « zone litiges » de la plateforme, c'est… | Un endroit à part où l'on met la marchandise qui pose problème, en attendant de régler le désaccord | Le quai où les camions se garent · L'endroit où l'on range les palettes les plus anciennes | Mots du quai | |
| `reassort` | préparation | Ce camion apporte du réassort d'Affligem. Pourquoi l'attendait-on ? | Mardi, il n'en restait que 2 fûts pour la commande de Malo | Malo a annulé sa commande · C'est pour un inventaire | BL | |
| `bl-signature` | préparation | Pour la plateforme qui reçoit, signer le BL veut dire… | Que la marchandise est reçue, avec les réserves écrites avant | Que tout est parfait · Que la facture est payée | BL | |
| `transporteur-garant` | droit | Une palette de **casiers d'eau** tombe du camion pendant le trajet et des bouteilles se cassent. D'après l'article L133-1, qui est garant des dommages pendant le transport ? | Le transporteur (le « voiturier »), sauf force majeure ou vice propre de la marchandise | France Boissons, qui a signé le BL · La brasserie, qui a chargé le camion | Le droit : C. com. L133-1 *(à relire sur Légifrance)* | ★ |
| `reserve-motivee` | droit | Le chauffeur te dit : « Écris plutôt “sous réserve de déballage”, c'est plus rapide. » D'après l'article L133-3, est-ce que cela suffit pour garder un recours ? | Non : la loi demande une protestation **motivée**, qui dit ce qui ne va pas | Oui, toute réserve suffit · Oui, si le chauffeur est d'accord | Le droit : C. com. L133-3 | ★ |
| `protocole` | droit | Un transporteur vient décharger à Buchelay. Quel document **écrit** encadre la sécurité de ce déchargement ? | Le protocole de sécurité | Le bon de livraison · Le permis du chauffeur | Le droit : C. trav. R4515-4 | ★ |
| `droit-retrait` | droit | Une lisse de rack est pliée et une palette penche au-dessus de l'allée. Que peux-tu faire ? | Alerter tout de suite mon responsable et me retirer de ce danger | Continuer : ce n'est pas mon rôle · Redresser la lisse moi-même | Le droit : C. trav. L4131-1 | ★ |
| `protestation` | droit | **Tirée** : « Un BL est signé sans réserve. {Le lendemain / Deux jours après}, on voit que des bouteilles d'une palette d'eau sont cassées sous le film. Que faire pour garder un recours contre le transporteur ? » | Lui envoyer une protestation motivée, par lettre recommandée, dans les 3 jours | Rien : c'est trop tard · Le dire au chauffeur à son prochain passage | Le droit : C. com. L133-3 | |
| `autorisation-conduite` | droit | Un nouveau cariste a son CACES R489 catégorie 3. Peut-il conduire le chariot frontal dès son arrivée ? | Non : il lui faut aussi une autorisation de conduite délivrée par l'employeur | Oui, le CACES suffit · Oui, s'il a le permis B | Le droit : C. trav. R4323-56 | |
| `fut-cest-quoi` | image | Sur cette photo, que sont ces objets en métal ? | Des fûts : ils contiennent la bière pression et reviennent vides | Des bouteilles de gaz · Des poubelles | `futs-vrac.jpg` (**déjà dans le dépôt**, crédit en place : « Photo : Belinda Fewings, Unsplash ») | |
| `chariot-frontal` | image | Sur ce dessin, le **chariot frontal** sert à… | Soulever et déplacer les palettes, et les poser l'une sur l'autre (« gerber ») | Livrer les fûts chez les clients · Laver les fûts | `materiel-chariot-frontal.svg` (dessin de Cowork, **sans défaut** ; à copier dans `contenus/images/france-boissons/` avec sa ligne de crédit « Dessin — document pédagogique ») | |

**Notes pour trancher**
- **Doublons** : `protestation` et `autorisation-conduite` reprennent les lignes 5 et 3 du §1. Si tu gardes ces lignes, on retire ces deux-là : il reste 4 questions de droit (le minimum pour tirer 2). Si tu n'en gardes aucune, on les laisse.
- **`huit-futs`** donne la règle « 8 fûts par palette complète » : elle frôle le piège de P4 (7 sur le BL). Je dis « complète » pour que le BL reste la seule référence ; si tu trouves que ça aide à supposer P4 pleine, on la remplace par un calcul sans fûts.
- **`zone-litiges`** frôle le jalon 10 (« en zone litiges »). Le lexique de la séance la définit déjà (mot cliquable) ; la définition de l'onglet reste générale. À toi de dire si on la garde.
- **`protocole`** : j'ai réécrit son retour (Cowork parlait du chauffeur et de l'immobilisation du camion : c'est exactement l'inspection). Retour proposé : « Le protocole dit qui fait quoi quand un camion est déchargé : il est écrit à l'avance. » **`droit-retrait`** donne le réflexe « alerter » avant l'inspection : je le garde, mais c'est à toi.
- **Images** : pas de photo de chariot frontal dans le dépôt (`chariot-boissons.jpg` montre un chariot à mât rétractable, vérifié à l'écran : à ne pas utiliser pour cette question). **Ne pas** prendre `materiel-palette-retention.svg` : il montre un fût qui fuit dans le bac, donc le défaut de P3. Une version sans fuite n'existe pas : à demander à Cowork, ou on s'en passe.
- **Textes de loi** : L133-3 (déjà relu sur Légifrance le 03/10/2026) ; R4515-4 et L4131-1 (relus par Cowork le 10/10 sur code.travail.gouv.fr) ; **L133-1 et R4323-56 à relire sur Légifrance avant livraison**. Le moteur affiche « Texte de loi (réel) — source : Légifrance » en pied.
- **Tirage d'équité** : une question de chaque rubrique a le même poids (aucun `poids`), les valeurs tirées gardent la même clé de bonne réponse pour tous.

---

## 3. Poids sur 20 (règle du 10/10/2026, `NOTATION-ponderation.md` 0.1)

**Raisonnement.** (1) Le poids va au cœur des deux compétences : **C1.2** (repérer seul ce qui empêche de décharger : jalons 1 à 3 et la question 1) et **C1.4** (contrôler contre le BL, porter des réserves précises, mettre de côté : jalons 4 à 10). Les deux défauts de sécurité pèsent autant (l'un est vu de dehors, l'autre de dedans). (2) Les réserves de P2 et de P3 (les deux pièges de contrôle) sont les plus lourdes ; le BL signé, formalité, vaut 1 ; la salutation et la fin du message ne sont pas notées : la forme pèse **0 %**, bien sous 15 %. (3) Aucun jalon à 0, et « aucun faux signalement » ne rapporte rien à qui n'a rien signalé (inaction = 0). Dans les deux variantes, C1.2 vaut **7 points sur 20** et C1.4 **13** (questions comprises).

Ancienne règle : 10 jalons à 1 point (barème 10). ENT-6.4 n'est pas construite : aucune note à protéger (point 0.3 sans objet).

| # | Jalon | Groupe | **A** : questions 3 pts | **B** : questions 5 pts |
|---|---|---|---|---|
| 1 | Chauffeur / moteur signalé avant de décharger | sécurité | 2 | 1,5 |
| 2 | Niveleur signalé avant de décharger | sécurité | 2 | 1,5 |
| 3 | Aucun faux signalement (cale, butoirs, lampe, clic à côté) | sécurité | 1,5 | 1,5 |
| 4 | P1 comptée 8 et acceptée | contrôle des palettes | 1 | 1 |
| 7 | P4 comptée 7 et acceptée | contrôle des palettes | 2 | 1,5 |
| 5 | P2 : réserve « produit différent », référence lue | réserves et BL | 2,5 | 2,5 |
| 6 | P3 : réserve « fût endommagé », 1 fût | réserves et BL | 2,5 | 2,5 |
| 8 | BL signé | réserves et BL | 1 | 1 |
| 9 | Phrase « réserves » juste | message | 1 | 1 |
| 10 | Phrase « zone litiges » juste | message | 1,5 | 1 |
| | **Total des jalons** | | **17** | **15** |
| | Questions notées (§1) | une ligne au bilan chacune | n°1 : 1,5 · n°5 : 1,5 = **3** | n°1 : 1,5 · n°3 : 1 · n°4 : 1 · n°5 : 1,5 = **5** |
| | **Total** | | **20** | **20** |

**Sous-totaux par groupe** : A = sécurité 5,5 · contrôle des palettes 3 · réserves et BL 6 · message 2,5 (= 17) ; B = 4,5 · 2,5 · 6 · 2 (= 15). Les jalons gardent leur numéro du §5 du brief ; ceux de P4 (7) et de P1 (4) forment le groupe « contrôle des palettes ».

**Vérification de la somme.** A : 2 + 2 + 1,5 + 1 + 2,5 + 2,5 + 2 + 1 + 1 + 1,5 = **17** ; 17 + 1,5 + 1,5 = **20**. B : 1,5 + 1,5 + 1,5 + 1 + 2,5 + 2,5 + 1,5 + 1 + 1 + 1 = **15** ; 15 + 1,5 + 1 + 1 + 1,5 = **20**.
**Par compétence** : C1.2 = jalons 1 à 3 + question 1 ; C1.4 = le reste. A : 5,5 + 1,5 = **7** et 11,5 + 1,5 = **13**. B : 4,5 + 1,5 + 1 (n°3) = **7** et 10,5 + 1 + 1,5 = **13**.

**Ce que le code fera** : `bareme: 20`, un `poids` et un `groupe` par jalon, `part` = 3 ou 5 dans le fichier de questions ; chaque question notée porte son `groupe` (une ligne au bilan) ; les valeurs de test sont écrites à la main (parcours juste 20/20, inaction 0/20).

**Ta décision** : (a) quelles lignes du §1 ; (b) quelles questions de la banque du §2 (et le sort des doublons) ; (c) variante A ou B ; (d) la phrase du bilan (§11) si la ligne 1 est gardée.
