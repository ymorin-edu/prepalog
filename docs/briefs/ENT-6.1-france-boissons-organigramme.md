# Brief de séance — ENT-6.1 France Boissons, bienvenue à Buchelay : qui fait quoi (2de, ouverture du scénario S2)

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-6.1-france-boissons-organigramme.md en entier. Vérifie d'abord que les chantiers « questions au fil » (lots 1 à 3), « jugé au premier essai », « tirage et niveaux » sont livrés ; puis fais la demande au moteur du §7 (transférer un message), puis la séance. ENT-6.1 crée l'univers commun `contenus/france-boissons.js`. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : **livré** le 09/10/2026 (Claude Code, `pret: true, ouverture: 'prof'` : à essayer à l'écran par Tristan, voir le
compte rendu en fin de brief) — **réécrit le 08/10/2026** d'après `FRANCE-BOISSONS-refonte.md` (Q1 à Q10 du 07/10) et les règles
du 08/10 (tirage et niveaux, questions contre le copier-coller). Remplace la version du 05/10.
**Date du brief** : 05/10/2026, réécrit le 08/10/2026
**Conversation d'origine** : Cowork (Opus). Demande de Tristan (05/10) : aborder l'organisation de l'entreprise
(organigramme, liens hiérarchiques et fonctionnels) dans S2. Séance d'ouverture courte, qui présente les personnages une
fois pour toutes (S2 n'a pas de visite).
**Modèle** : **Opus** (séance nouvelle de bout en bout, première séance tirée de la série de référence). La demande au
moteur du §7 aussi (vue de la messagerie).
**Place dans l'ordre** (Q2, Tristan 07/10) : après les chantiers moteur communs — questions au fil (lots 1 à 3), « jugé au
premier essai », `MOTEUR-tirage-et-niveaux` — puis la demande du §7, puis la séance.
**Durée estimée par Cowork** : demande du §7 ≈ 3 h ; séance ≈ 5 à 6 h (univers commun, banques, tirage, tests du pire cas
et de l'équité). Rien n'a été essayé dans le site.

---

## 0. Règles communes à France Boissons (refonte du 07/10, rappel)

1. **Trame** : page de connexion, brouillon des étapes compliquées, cours pour réviser. Pas de corrigé de trame, pas de
   texte à trous : les questions passent à l'écran (« questions au fil »).
2. **Notation** : `parcours`, `correction: true`, une case = un jalon, poids par bloc, `bareme: 20`, bandeau ✓/✗ par bloc
   sans jamais donner la réponse ; « Corriger » rouvre la fiche et les transferts faux, jamais une question.
3. **Jamais un élève bloqué** : la séance suivante (ENT-6.2) s'ouvre au premier bilan, justes ou faux. Test du pire cas.
   Anti-inaction : rien fait = 0.
4. **Un jalon reste « à faire » jusqu'à l'envoi** (fini le « fiche non envoyée = faux »).
5. Repris tel quel : confirmation dans la page avant tout envoi définitif ; `fermetures` ; accusé de réception d'un collègue
   à chaque envoi corrigé, jamais « juste » ni « faux » ; titres des jalons au Repérage.
6. Un collègue est au **tu**, une personne extérieure au **vous**. `desc` à l'infinitif.
7. **Tirage et niveaux** (08/10) : pièce fixe + banque, tirage rangé, mélange équilibré, bonus du confirmé caché (§6 bis).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.1 (première séance de S2) |
| `id` (jamais modifié ensuite) | `france-boissons-organigramme` |
| Titre / desc | « France Boissons — bienvenue à Buchelay » / « Lire l'organigramme de la plateforme de Buchelay, distinguer qui dirige et qui aide, et transmettre chaque message à la bonne personne. » |
| Rubrique | simulog, entreprise n° 6 France Boissons (ligne `ENTREPRISES` à créer si absente : logo, accord donné le 05/10) |
| Niveau(x) | 2de |
| Compétence(s) | **`C1.1`** (« Positionner des activités logistiques dans la supply chain » — décision de Tristan, 08/10) ; `domaines: ['D1']` |
| Temps pédagogique | `temps: 'guidage'` (Q5, Tristan 07/10 : coefficient 1, compte dans la compétence) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true` (première séance du parcours : pas de `precedente`) |
| Barème | `bareme: 20` |
| Niveaux | `niveauxPrevus: ['confirme']` (cas bonus, §6 bis) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (05/10/2026)** : France Boissons, filiale de Heineken ; plateforme de **Buchelay (78)**, inaugurée le
  16/06/2025, **80 salariés (150 à terme)**, 35 quais, livre du nord-ouest parisien à la côte normande ; transport **pour
  compte propre** ([france-boissons.fr](https://www.france-boissons.fr/nos-actualites/inauguration-de-la-nouvelle-plateforme-logistique-france-boissons-a-buchelay-78-performance-proximite-et-responsabilite-au-coeur-du-projet/), Stratégies Logistique).
- **Vérifié (07/10/2026, lecture image par image par Cowork)** dans la [vidéo « Présentation de la Plateforme de France
  Boissons à Buchelay », Grand Paris Seine & Oise, YouTube, 20/06/2025](https://www.youtube.com/watch?v=LRa0qgI7Weo) :
  18 tournées en basse saison, **jusqu'à 30 en haute saison** ; **« Objectif prioritaire : 0 accident »** ; **10 camions
  électriques** (objectif « +10 d'ici fin 2025 ») ; « jusqu'à 150 collaborateurs à terme ». Relevé complet : fiche Cowork
  `prepalog-fb-video-buchelay`. La vidéo **n'est pas mise dans le site** (aucune requête hors du domaine, pas
  d'iframe) : l'enseignant la projette lui-même depuis YouTube (lien et minutage dans le corrigé enseignant).
- **Construit (annoncé comme tel)** : l'organigramme de la plateforme, les intitulés de poste, tous les prénoms, tous les
  messages de la banque. L'organigramme réel n'est pas public ; on ne nomme aucun dirigeant réel.
- Documents reconstitués : pied « Organigramme simplifié — document pédagogique, reconstitution, non contractuel ».

## 3. Objectif pédagogique

L'élève sait **lire un organigramme**, distinguer un **lien hiérarchique** (qui donne le travail, qui décide, qui valide)
d'un **lien fonctionnel** (qui apporte un service, une règle, une information sans être le chef), et **transmettre une
demande à la bonne personne**.

Ces notions resservent toute la semaine : en ENT-6.3, **Karim décide** des congés de ses chauffeurs (il refuse la date
demandée par Lucas et en propose une autre) et **Inès les enregistre** ; Karim transmet l'annonce du saisonnier à Hélène
pour validation ; l'annonce dit « rattaché à ». (Corrigé le 08/10 : la version du 05/10 disait « Karim valide le congé de
Lucas », contraire à 6.3.)

## 4. Déroulé (≈ 35 min)

**Date du scénario : lundi 14 juin 2027, 8 h** (premier jour en renfort). Calendrier de S2 inchangé (6.1 lun. 14 juin ·
6.2 mar. 15 · 6.3 mar. 15 après-midi · 6.4 mer. 16, 14 h · 6.5 mer. 16, 16 h · 6.6 jeu. 17, 7 h · 6.7 jeu. 17 après-midi ·
6.8 ven. 18, 5 h · 6.9 ven. 18, 6 h 30 · 6.10 ven. 18, 17 h).

### Étape 0 — La plateforme en vidéo (≈ 5 min, non notée, Tristan 07/10)

- Consigne à l'accueil, hors fiction : « Ton professeur projette une vidéo d'1 min 30 sur la plateforme de Buchelay.
  Regarde-la, puis réponds aux questions de la fiche « Ce que j'ai vu ». Si la vidéo ne passe pas, envoie la fiche vide :
  ce n'est pas noté. »
- Fiche **« Ce que j'ai vu »** (fiche à remplir, `liste` × 4, ordre des choix tiré par élève et rangé par le contenu,
  **aucun jalon**, `envoi: { incomplet: true }` : envoyer vide = passer) :

  | Question | Choix (juste en gras) |
  |---|---|
  | En haute saison, combien de tournées partent de Buchelay chaque jour ? | 18 · **30** · 150 · 2 300 |
  | Et en basse saison ? | **18** · 30 · 80 · 2 300 |
  | Quel est l'objectif prioritaire de la plateforme ? | **Zéro accident** · Livrer en moins de 2 heures · Zéro carton perdu |
  | Combien de camions électriques la vidéo annonce-t-elle ? | 2 · **10** · 35 |

- À l'envoi (`apresFiche('vu')`), Inès répond avec les bonnes réponses (non noté, formatif) : « Merci ! Pour retenir :
  30 tournées par jour en haute saison, 18 en basse saison, zéro accident comme objectif prioritaire, 10 camions
  électriques. On en reparle cette semaine. » Les chiffres reviennent ensuite : 30 tournées (6.8), zéro accident (6.4),
  camions électriques (6.8).
- **Filet de sécurité** (vidéo bloquée, vidéoprojecteur en panne) : la fiche s'envoie vide, rien n'est noté, **la suite
  n'en dépend pas** (aucune fermeture sur cette fiche).

### Étape 1 — Le message d'Inès et les documents

- **Message d'Inès** (3 blocs) : « Bonjour {prénom}, bienvenue à Buchelay ! / Ce matin, tu tiens l'accueil avec moi :
  avant tout, regarde l'organigramme de la plateforme et les fiches de chacun. / Complète la fiche « Qui fait quoi ? »
  et renvoie-la-moi. Ensuite, je te confie le courrier du matin. Inès »
- **Documents joints** (`documents`, rangés dans l'univers commun, voir §6) :
  - **Organigramme simplifié de la plateforme** (HTML/CSS : cases et traits ; **traits pleins = hiérarchique,
    pointillés = fonctionnel**, légende). Six personnes nommées : Hélène — directrice de la plateforme ; Inès —
    assistante administrative (ventes et RH) ; Thomas — responsable d'entrepôt ; Nadia — cheffe d'équipe quai et
    préparation ; Karim — responsable d'exploitation transport ; Lucas — chauffeur-livreur (tournée de la côte).
    Sous Nadia : « préparateurs, caristes » ; sous Karim : « Lucas + 6 chauffeurs-livreurs ».

    ```
                        Hélène — directrice de la plateforme
         ┌──────────────────────────┼───────────────────────────┐
    Inès — assistante          Thomas — responsable        Karim — responsable
    administrative             d'entrepôt                  d'exploitation transport
    (ventes, RH)                     │                               │
                              Nadia — cheffe d'équipe        Lucas — chauffeur-livreur
                              quai et préparation            (côte) + 6 chauffeurs
                                     │
                           préparateurs, caristes
    ```

    **Trois cases sont vides chez chaque élève** (tirées, §6 bis) : la case de **Karim** (pour tous) et deux autres. Les
    cases vides portent une lettre (A, B, C) attribuée dans l'ordre de lecture, de haut en bas puis de gauche à droite.
    Liens fonctionnels en pointillés : Inès → tous les services (congés, contrats, candidatures, commandes clients) ;
    Nadia ↔ chauffeurs (ordre de chargement au quai).
  - **Six fiches « qui suis-je »** de 4 lignes : missions, à qui il rend compte, qui il dirige, avec qui il travaille.
    C'est là que l'élève trouve qui va dans les cases et à qui transmettre chaque message. Ce qu'elles doivent rendre
    clair (sinon les messages de la banque deviennent ambigus) :
    - **Hélène** : dirige la plateforme ; valide les recrutements et les budgets ; seule à parler aux journalistes et aux
      élus au nom de la plateforme.
    - **Inès** : reçoit les commandes des clients et leurs réclamations (factures, consignes) ; s'occupe des papiers du
      personnel (attestations, visites médicales, congés **une fois décidés**) ; reçoit les candidatures et les transmet ;
      rend compte à Hélène.
    - **Thomas** : responsable de l'entrepôt (stockage, matériel, racks, sécurité de l'entrepôt) ; dirige Nadia ; rend
      compte à Hélène.
    - **Nadia** : dirige les préparateurs et les caristes (horaires, tâches du jour) ; organise le quai : réceptions des
      brasseries, ordre de chargement des camions ; rend compte à Thomas.
    - **Karim** : dirige les chauffeurs-livreurs ; décide de leurs tournées, de leurs congés, de leurs camions ; suit les
      camions au garage ; rend compte à Hélène.
    - **Lucas** : chauffeur-livreur, tournée de la côte ; rend compte à Karim.
- **Encadré** dans la fiche (3 lignes) : « **Lien hiérarchique** : ton chef. Il te donne ton travail, décide et valide
  tes demandes. **Lien fonctionnel** : un collègue d'un autre service qui t'aide, t'informe ou te donne une règle à
  suivre, sans être ton chef. »

### Étape 2 — Fiche « Qui fait quoi ? » (documents à gauche, fiche à droite)

- **Les cases vides** (`liste` × 3 pour un standard, × 4 pour un confirmé) : « Case A », « Case B »… → Hélène / Inès /
  Thomas / Nadia / Karim / Lucas. Consigne neutre : « Complète chaque case vide de l'organigramme. »
- **Lucas dépend hiérarchiquement de** (`liste`) : Karim (juste) · Nadia · Inès · Hélène.
- **Le lien est-il hiérarchique ?** (`ouinon`, 5 lignes pour un standard, 7 pour un confirmé, tirées §6 bis) :
  colonnes « Hiérarchique » / « Fonctionnel ».
- Envoi : « Envoyer la fiche à Inès » (confirmation dans la page). Rien n'est jugé avant l'envoi ; fiche figée ensuite.
- Réponse d'Inès (`apresFiche('qui-fait-quoi')`, sans dire si c'est juste) : « Merci, j'ai ta fiche. Avant de te
  confier le courrier, une question. » → point d'étape (étape 3).

### Étape 3 — Point d'étape avec Inès (question de transition, notée)

Écran « Point d'étape » (`QUESTIONS.etapes`), déclenché par `apresFiche('qui-fait-quoi')`, qui **ferme le courrier du
matin** (aucun message à transmettre n'arrive avant la réponse). Une question :

- **`qui-decide-conges`** (Inès, transition, notée) : « Lucas m'écrit qu'il veut décaler ses congés d'été. D'après
  l'organigramme, à qui dois-je transmettre sa demande pour qu'elle soit **décidée** ? » Choix : **Karim** (`karim`) ·
  Moi, Inès (`ines`) · Nadia (`nadia`) · Hélène (`helene`). Retour (✓/✗ puis la parole d'Inès) : « C'est Karim, son
  chef, qui décide : il connaît les tournées et sait qui peut remplacer Lucas. Moi, j'enregistre le congé une fois
  qu'il est décidé : c'est un lien fonctionnel. » Elle prépare l'étape 4 (et ENT-6.3) sans donner la réponse d'un
  message tiré (le message « échange de congés » de la banque juge la même règle : voir §11).

### Étape 4 — Le courrier du matin : transmettre chaque message (demande au moteur, §7)

- Inès : « Je pars en réunion avec Hélène. Le courrier du matin arrive dans ta messagerie : transfère chaque message à la
  personne qui doit s'en occuper. » Consigne neutre, **sans nombre de messages**.
- Les messages arrivent **un par un** dans la messagerie (notification du lot 1 des questions au fil) : le premier après
  le point d'étape, chaque suivant **après le transfert du précédent, quel que soit le destinataire**
  (`apresTransfert`). Premier message pour tous : **Malo** (pièce fixe, §6 bis). Les autres sont tirés.
- Sous chaque message reçu : bouton **« Transférer à… »** → liste des six personnes de l'annuaire → confirmation dans la
  page (« Transférer le message de La Cabane à Malo à Inès ? ») → le message est marqué « transféré à Inès ».
- **Accusé de réception neutre** du destinataire à chaque transfert (« Bien reçu, merci. » — signé de la personne choisie),
  **jamais** « ce n'est pas pour moi » (cela donnerait la réponse).
- **Question au fil** (`pourquoi-pas-helene`, Karim, **non notée**, réflexion) au **premier transfert, quel qu'il soit** :
  « Je te vois transférer le courrier. Pourquoi ne pas tout envoyer à Hélène, puisqu'elle dirige tout le monde ? »
  Choix : « Hélène serait débordée : chaque service traite ce qui le concerne » · « Hélène ne connaît pas le détail des
  tournées ou du quai » · « On ne dérange la directrice que pour ce qu'elle seule peut décider » · « Je n'y avais pas
  pensé ». Retour : « Ce qu'en pense Karim : … chacun des trois est vrai ; un organigramme sert justement à envoyer
  chaque demande au bon niveau. »

### Étape 5 — Fin

- Quand le dernier message (socle et, pour un confirmé, bonus) est transféré : Inès (`seanceFinie` ou dernier
  `apresTransfert`) : « Merci pour ce matin ! Demain, tu commences avec moi : un bar de la côte, La Cabane à Malo, va
  nous envoyer sa commande. » (transition vers ENT-6.2, cohérente avec le message fixe de Malo).
- Premier bilan → bandeau ✓/✗ par bloc (§5), « Corriger » rouvre la fiche « Qui fait quoi ? » et les messages dont le
  transfert est faux ; ENT-6.2 s'ouvre.

Mots cliquables : organigramme, lien hiérarchique, lien fonctionnel, service, rendre compte, exploitation, transférer.

## 4 bis. Questions au fil et « Avant de commencer » — À REPRENDRE (règle du 10/10/2026)

Séance déjà construite avec deux questions (`contenus/questions/ENT-6.1.js` : un point d'étape noté, une question au fil
de réflexion). Pour suivre la règle du 10/10/2026 comme les autres séances France Boissons : (1) proposer à Tristan le
tableau de `docs/briefs/MODELE.md` §4 bis (au moins 4 gestes, dont une question d'éco-droit appliquée au cas) et garder
ce qu'il choisit ; (2) ajouter l'écran « Avant de commencer » (`docs/briefs/MOTEUR-avant-de-commencer.md`) avec sa
banque, validée par Tristan. Séance déjà jouée par des élèves ? Vérifier d'abord : ceux qui l'ont finie gardent leur note.

## 5. Jalons / notation (sur 20)

| Bloc (ligne du bandeau) | Cases (un jalon chacune) | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **L'organigramme** | case de Karim (fixe) 2 ; chacune des 2 cases tirées 1,5 | **5** | `ficheEnvoyee(db,'qui-fait-quoi').valeurs.cases[<id du poste>]` contre le poste tiré | « à faire » jusqu'à l'envoi ; le jalon compare au **poste de la case de l'élève**, jamais à une lettre |
| **Le chef de Lucas** | Lucas → Karim | **2** | `valeurs.chefLucas === 'karim'` | — |
| **Hiérarchique ou fonctionnel** | 5 lignes tirées (§6 bis), 1 chacune | **5** | `valeurs.liens[<id de la situation>]` | la banque garantit au moins 2 « hiérarchique » et 2 « fonctionnel » (sinon une colonne cochée partout rapporte 3/5) |
| **Le courrier du matin** | 4 messages (Malo fixe + 3 tirés), 1,5 chacun | **6** | transfert du message (§7) : destinataire **du premier transfert** contre l'attendu | non transféré = « à faire » ; la banque garantit 3 destinataires différents au moins (sinon « tout à Inès » rapporte des points) |
| **Point d'étape : qui décide** | question `qui-decide-conges` | **2** (`part: 2` du fichier de questions) | moteur des questions | — |
| **Total** | 14 jalons (13 déclarés par la séance + 1 ajouté par le moteur des questions) | **20** | | |

- **Corriger** : `ecran: 'fiche:qui-fait-quoi'` pour les trois premiers blocs ; pour le courrier, l'écran de transfert du
  §7 (`'transfert:<id du message>'` ou équivalent choisi par Claude Code) rouvre **seulement les messages mal
  transférés** ; le destinataire accuse réception (`volet.corrections`). La question ne se rouvre jamais (le bandeau le dit).
- **Anti-inaction** : rien fait = 0/20 (aucun jalon « juste » par défaut, les questions non répondues sont fausses au
  rattrapage).
- **Fiche vidéo** : aucun jalon, aucun poids, aucune ligne au bandeau.
- **Confirmé** : cases, lignes et messages bonus = jalons `bonus: true`, sans poids ni groupe (lot 3 de
  `MOTEUR-tirage-et-niveaux`) ; le bandeau d'un confirmé a exactement les mêmes 5 lignes que celui d'un standard.

## 6. Contenu (données)

- **`contenus/france-boissons.js`** — univers commun aux 10 séances, **créé par ENT-6.1** (première construite) :
  identité, `THEME` d'après la charte réelle (vérifier que l'accent et le vert « juste » ne se confondent pas ; règle des
  chartes rouges ou vertes), lieux, `EQUIPE` (Hélène, Inès, Thomas, Nadia, Karim, Lucas ; Malo et les autres extérieurs ;
  tu / vous), lexique, et les **documents communs** : l'organigramme **complet** et l'**annuaire** (les six fiches « qui
  suis-je ») — idée prise par Tristan le 07/10 : « l'annuaire rempli ici devient un document joint de toute la S2 ». Les
  séances 6.2 à 6.10 les joignent à leur premier message (à écrire dans leurs briefs à la réécriture). En 6.1, l'organigramme
  est construit **avec les cases vides de l'élève** à partir de ce document commun.
- **`contenus/france-boissons-ent61.js`** (et non `ent60` : corrigé le 08/10) : messages, fiches « Ce que j'ai vu » et
  « Qui fait quoi ? », banques et tirage, jalons, accueil.
- **`contenus/questions/ENT-6.1.js`** : `part: 2`, un point d'étape (`qui-decide-conges`), une question au fil de réflexion
  (`pourquoi-pas-helene`).
- Valeurs attendues **recalculées par le code** à partir des banques ; dans les tests, écrites à la main.

## 6 bis. Tirage et niveaux (règle du 08/10/2026)

Graine par séance, tirage **rangé** à la première ouverture (`MOTEUR-tirage-et-niveaux`, lot 2). Ids des pièces stables,
jamais supprimés (`retiree: true` pour mettre de côté).

### Banque `cases` — les cases vides de l'organigramme

| id | Poste | Difficulté |
|---|---|---|
| `case-karim` | Karim | **fixe** (fil conducteur : le chef de Lucas, 6.3, 6.8, 6.9) |
| `case-ines` | Inès | facile |
| `case-lucas` | Lucas | facile |
| `case-thomas` | Thomas | difficile (se confond avec Nadia) |
| `case-nadia` | Nadia | difficile (se confond avec Thomas) |

- Socle : fixe + `{ facile: 1, difficile: 1 }` → 3 cases. Bonus confirmé : `{ difficile: 1 }` (si déjà prise :
  `{ facile: 1 }`) → 4 cases. Hélène n'est jamais vide (elle donne le sommet).
- `ordre: 'fixe'` : les lettres A, B, C (D) suivent l'ordre de lecture de l'organigramme, pas l'ordre du tirage.

### Banque `liens` — « Le lien est-il hiérarchique ? »

| id | Situation | Attendu | Difficulté |
|---|---|---|---|
| `lien-karim-tournee` | Karim donne à Lucas sa tournée du jour. | hiérarchique | **fixe** |
| `lien-nadia-cariste` | Nadia demande à un cariste de ranger les fûts dans l'allée M. | hiérarchique | facile |
| `lien-ines-formulaire` | Inès envoie à Lucas le formulaire de congés à remplir. | fonctionnel | facile |
| `lien-helene-objectif` | Hélène fixe à Thomas l'objectif « zéro accident » de l'entrepôt. | hiérarchique | facile |
| `lien-nadia-quai` | Nadia indique à Lucas à quel quai charger son camion. | fonctionnel | moyen |
| `lien-lucas-attestation` | Lucas demande à Inès une attestation d'employeur. | fonctionnel | moyen |
| `lien-thomas-heures` | Thomas valide les heures supplémentaires de Nadia. | hiérarchique | moyen |
| `lien-karim-horaire` | Karim prévient Nadia que le camion de la côte part à 6 h. | fonctionnel | moyen |
| `lien-helene-recrutement` | Hélène valide le recrutement d'un saisonnier proposé par Karim. | hiérarchique | difficile |
| `lien-thomas-securite` | Thomas rappelle à Lucas qu'on ne fume pas sur le quai. | fonctionnel | difficile |
| `lien-karim-preparateur` | Karim demande à un préparateur de finir vite le chargement de Lucas. | fonctionnel | difficile |

- Socle : fixe + `{ facile: 1, moyen: 2, difficile: 1 }` → 5 lignes. Bonus confirmé : `{ moyen: 1, difficile: 1 }`.
  `ordre: 'melange'`.
- `verifier` : le socle compte **au moins 2 hiérarchiques et 2 fonctionnels** (contrôle d'équité, re-tirage sinon).
- Corrigé du 08/10 : « Inès rappelle à Lucas de poser ses congés avant le 15 juin » est retiré (Lucas les a demandés le
  5 mai, voir 6.3).

### Banque `courrier` — les messages à transférer

Messages courts (2 à 3 lignes), signés ; extérieurs au **vous**, collègues au **tu**.

| id | De | Le message dit | Transférer à | Difficulté |
|---|---|---|---|---|
| `msg-malo` | Malo, La Cabane à Malo (bar, côte) | « Je vous envoie demain ma commande de fûts pour vendredi : à qui dois-je l'adresser ? » | **Inès** | **fixe** (prépare 6.2) |
| `msg-amandine-planning` | Amandine, chauffeur-livreur | « Je n'ai pas reçu ma tournée de jeudi. » | Karim | facile |
| `msg-attestation` | Un cariste | « Il me faut une attestation d'employeur pour mon logement. » | Inès | facile |
| `msg-brasserie-quai` | Brasserie de Mons-en-Barœul | « Notre camion arrivera mercredi à 14 h : à quel quai se présenter ? » | Nadia | facile (fil de 6.4) |
| `msg-medecine` | Service de santé au travail | « Nous confirmons la visite médicale d'un de vos caristes le 22 juin. » | Inès | facile |
| `msg-rack` | Un préparateur | « Une lisse de rack est pliée dans l'allée B. » | Thomas | moyen |
| `msg-facture-consignes` | Un restaurant client | « Votre facture compte 3 fûts vides que nous vous avons rendus. » | Inès | moyen |
| `msg-garage` | Garage poids lourds | « Le camion électrique n° 3 sera prêt jeudi midi. » | Karim | moyen |
| `msg-chauffeur-quai` | Julien, chauffeur-livreur | « Je ne sais pas dans quel ordre charger mes palettes demain. » | Nadia | moyen |
| `msg-candidature` | Un candidat | « Voici mon CV pour le poste de chauffeur saisonnier. » | Inès | difficile (tentation : Karim) |
| `msg-echange-conges` | Lucas | « Je voudrais échanger ma semaine de congés avec Julien. » | Karim | difficile (tentation : Inès) |
| `msg-partir-tot` | Un préparateur | « Puis-je finir à 15 h vendredi ? » | Nadia | difficile (tentation : Thomas, Inès) |
| `msg-journaliste` | Un journaliste du quotidien local | « Je prépare un article sur votre première année à Buchelay. » | Hélène | difficile |

- Socle : fixe + `{ facile: 1, moyen: 1, difficile: 1 }` → 4 messages. Bonus confirmé : `{ moyen: 1, difficile: 1 }`.
  `ordre: 'melange'` **sauf** Malo toujours en premier.
- `verifier` : au moins **3 destinataires différents** dans le socle.
- Les noms et la brasserie sont construits ; l'heure de la brasserie (mercredi 14 h) est celle de 6.4.

### Le reste

- **Valeurs tirées** : aucune (pas de calcul dans cette séance).
- **Accompagné** : contenu standard tant que ce niveau n'est pas conçu.
- **Consignes neutres** : aucune ne donne le nombre de cases, de lignes ou de messages (« Complète chaque case vide »,
  « transfère chaque message »).
- **Questions à l'écran** ancrées sur le travail de l'élève, réponse en choisissant (pas de texte libre). Pas de question
  d'éco-droit dans cette séance (la notion d'organisation est appliquée par les transferts).
- **Fiche vidéo** : ordre des choix tiré par élève et rangé (pas de banque).

## 7. Demandes au moteur

### 7.1 Transférer un message (décision de Tristan, 08/10 : bouton « Transférer à… » dans la messagerie)

Idée prise le 07/10 (Q9) : « des messages arrivent en cours de séance, l'élève choisit à qui les transférer ». Tristan a
choisi le **geste réel** plutôt qu'une fiche. Vue de la messagerie, chantier à part (Opus, ≈ 3 h tests compris), pensé
pour servir à plusieurs séances (toute la S2, et toute séance où l'élève tient un accueil ou une boîte partagée).

- Un mail semé ou déclenché peut porter `transfert: { a: ['helene','ines','thomas','nadia','karim','lucas'] }` (ids de
  `EQUIPE`). Sous ce mail : bouton **« Transférer à… »**, liste des destinataires (nom et fonction, ordre de l'annuaire,
  jamais d'aplat), confirmation dans la page, puis le mail porte « Transféré à Nadia, 8 h 42 ».
- État cloisonné par séance : `db.transferts[<séance>][<id du mail>] = { a, at, premier }` ; `premier` = destinataire du
  premier transfert, écrit une fois (premier bilan).
- Déclencheur **`apresTransfert(idMail)`** (vrai au transfert, juste ou faux) et **signal** `messagerie:transfert` (lot 3
  des questions au fil) pour la question au fil.
- Jalon : `transfertDe(db, idMail)` → `{ fait, a, at }` ; « à faire » tant que rien n'est transféré.
- **Corriger** : un `ecran` qui rouvre le transfert d'un mail dont le jalon est faux (nouveau transfert possible, le
  premier reste rangé pour le premier bilan) ; accusé de réception neutre par `volet.corrections`.
- Gel (`gele: true`) pendant une question au fil : le bouton « Transférer à… » est grisé, la lecture reste possible.
- L'enseignant voit le bouton et la liste, rien n'est écrit pour lui.
- Tests (bloc de la messagerie ou `questions`) : transfert rangé, une fois ; déclencheur ; « Corriger » rouvre un faux,
  pas un juste ; gel ; enseignant sans écriture ; sabotage (jalon lu sur le dernier transfert au lieu du premier pour
  le premier bilan → un test doit tomber).

### 7.2 À vérifier à l'état des lieux (pas de chantier)

- Une fiche **sans aucun jalon** (« Ce que j'ai vu ») avec `envoi: { incomplet: true }` : s'envoie vide, ne bloque ni
  `correction` ni `seanceFinie`. Si le moteur la compte comme étape, le dire à Tristan avant de contourner.
- Documents communs déclarés dans `contenus/france-boissons.js` et importés par la séance : rien à demander au moteur.
- Organigramme en HTML (pas de dessin interactif, décision de Tristan du 05/10). Contraste et lisibilité des pointillés
  à vérifier au vidéoprojecteur.

### 7.3 Fiche et documents « fonction de la base de l'élève » (demande ajoutée par Claude Code, 09/10/2026) — **LIVRÉ** (chantier D-1 bis, 7900170)

**Livré le 09/10/2026 (option B choisie par Tristan)** : `fiche.blocs`, `fiche.documents`, `documents[].html` et `ecran` d'un
jalon acceptent une fonction `(db) => …`, évaluée à chaque dessin, jamais rangée ; contrôle au chargement sur une base vide ;
au dessin, une fonction qui plante est signalée et laisse un avis d'erreur (`core/types/fiche.js`, `core/types/documents.js`,
`core/types/entreprise.js`, une ligne dans `core/types/entreprise-messagerie.js` ; doc dans `activites/FICHE-SEANCE.md`,
« Fonction de la base de l'élève »). Le contournement ci-dessous est **retiré** : ENT-6.1 déclare ses écrans comme les autres
séances, et la limite après « Réinitialiser » a disparu (cas de test dédié, qui tombait avec le contournement). Historique :

Relevé à la construction : dans le moteur, une **fiche** (`fiche`, `fiches`) et les **documents joints** (`documents`) sont
des objets **fixes**, déclarés une fois pour toute la séance (`core/types/fiche.js` : `creerFiche(F)` ; `core/types/documents.js` :
`html` est un texte). Or le §6 bis donne à chaque élève **ses** cases vides (l'organigramme et les listes « Case A, B… »),
**ses** situations (les lignes du tableau oui / non) et **son** courrier (l'écran de « Corriger » de chaque message, `ecran` d'un
jalon, fixe lui aussi). Le tirage mémorisé (D-C) range bien les pièces dans la base, mais aucun écran ne sait s'en servir.

- **Contournement livré d'abord (rien dans `core/`), RETIRÉ par D-1 bis** : l'activité fabrique le moteur **à l'ouverture**, pour l'élève qui l'ouvre
  (`activites/france-boissons-organigramme.js`, `rendre`) : `jeuAOuverture(ctx)` range d'abord le tirage par `TIRAGE.assurer`
  (même graine, même niveau que le moteur), puis `optionsPour(jeu)` rend sa fiche, ses documents et ses jalons. Limite : la
  règle qui fige le niveau est recopiée de `core/types/entreprise.js` (`figerAisance`) ; après « Réinitialiser » avec un niveau
  changé entre-temps par l'enseignant, les écrans restent ceux de l'ancien tirage jusqu'à la réouverture.
- **Demande au moteur** (chantier à part, petit) : accepter `fiche.blocs`, `fiche.documents` et `documents[].html` **en
  fonction de la base** (`(db) => …`), et `ecran` d'un jalon en fonction de la base ; la séance déclarerait alors ses écrans comme
  les autres, et le contournement disparaîtrait (`optionsPour` resservirait tel quel). Toute la S2 en aura besoin (6.2 à 6.10
  tirent aussi leurs pièces).

### 7 bis. Séance déjà jouée par des élèves ?

Non : séance nouvelle.

## 8. Tests attendus

Bloc **nouveau** `france-boissons` (`outils/test/france-boissons.mjs`, une ligne dans `BLOCS` : **alerte 7, le dire à
Tristan**). Graines choisies dans le test, valeurs attendues écrites à la main pour ces graines.

- **Parcours juste** (standard) : 20/20, bandeau 5 lignes ✓ ; ENT-6.2 ouverte (dès qu'elle existe ; d'ici là, séance finie).
- **Inaction** : rien fait → 0/20, rien de jugé « juste ».
- **Pire cas** : tout faux, question comprise → premier bilan, séance suivante ouverte sans l'enseignant.
- « Nadia / quai » marqué hiérarchique (graine où elle est tirée) → bloc 3 ✗, les autres ✓.
- Case de Karim répondue « Thomas » → bloc 1 ✗.
- Message de Malo transféré à Karim → bloc 4 ✗ ; « Corriger » le rouvre, pas les messages justes ; renvoi juste →
  note = moyenne du premier bilan et du nouvel état.
- **Tirage** : mêmes cases, lignes et messages après rechargement et sur une nouvelle page ; 300 graines → mélanges
  respectés, Karim / Karim-tournée / Malo toujours présents, ≥ 2 hiérarchiques et ≥ 2 fonctionnels, ≥ 3 destinataires,
  zéro secours.
- **Confirmé** : 4 cases, 7 lignes, 6 messages ; bandeau identique ligne pour ligne à celui d'un standard ; le mot
  « bonus » absent côté élève ; cas bonus faux → note du socle inchangée.
- **Fiche vidéo** envoyée vide → aucun effet sur la note ni sur la suite ; non envoyée → la séance se finit quand même.
- **Point d'étape** : aucun message du courrier n'arrive avant la réponse ; réponse fausse → le courrier arrive quand même.
- **Question au fil** au premier transfert, une seule fois, jamais notée.
- Sabotage par bloc (chaque jalon inversé fait tomber un cas) ; sabotage de `verifier` (garde des 2 + 2 retirée → le
  test des 300 graines tombe).

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) : page de connexion (Prepalog → Simulog → logo France Boissons →
  ENT-6.1) ; **cours** d'une demi-page : lien hiérarchique / fonctionnel avec un petit organigramme d'exemple, lexique ;
  pas de brouillon (rien de compliqué à calculer). **Pas de corrigé de trame** (Q4).
- Les anciennes questions « Pour réfléchir » de la trame passent à l'écran (question au fil `pourquoi-pas-helene`).
- **Corrigé enseignant** : `contenus/corriges/ENT-6.1.js` (onglet Corrigés, par élève : ses cases, ses lignes, ses
  messages et leurs destinataires attendus, cas bonus marqués « bonus » ; lien et minutage de la vidéo YouTube ; réponses
  de la fiche vidéo).

## 10. Critères de validation par Tristan

- La fiche vidéo se remplit en 2 minutes après la projection et s'envoie vide sans gêne si la vidéo ne passe pas.
- L'organigramme se lit au vidéoprojecteur ; pleins et pointillés se distinguent.
- La différence hiérarchique / fonctionnel se comprend avec l'encadré seul.
- Le transfert d'un message se fait sans aide, et deux voisins n'ont pas les mêmes messages ni les mêmes cases vides.
- 35 minutes suffisent.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Compétence : **C1.1** (Tristan, 08/10) ; domaine D1.
- [x] Temps : guidage (Q5, 07/10).
- [x] Transférer : bouton « Transférer à… » dans la messagerie (Tristan, 08/10), demande §7.1.
- [x] Vidéo projetée en début de séance, fiche non notée (Tristan, 07/10).
- [ ] Barème par bloc 5 / 2 / 5 / 6 / 2. (Défaut : celui-ci ; la refonte proposait 6 / 3 / 5 / 6 sans question notée.)
- [ ] L'annuaire joint de 6.2 à 6.10 est **la version complète et juste**, pas la fiche de l'élève. (Défaut : complète.)
- [ ] Textes des 13 messages et des 11 situations : construits, à relire à l'écran. Le message `msg-echange-conges`
  reprend la règle de la question du point d'étape (Karim décide) : c'est voulu (application directe), à retirer de la
  banque si Tristan juge que la question donne la réponse.
- [ ] Prénoms Hélène, Thomas, Amandine, Julien : construits (Amandine et Julien déjà dans 6.3).
- [ ] Intitulé de Nadia passé de « cheffe de quai » à « cheffe d'équipe quai et préparation » (elle dirige préparateurs et
  caristes dans l'organigramme) : à reporter dans les briefs 6.4 à 6.7 à leur réécriture si Tristan le garde.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

*Rempli le 09/10/2026 (Claude Code, Opus).*

- **Fichiers créés / modifiés** :
  - créés : `contenus/france-boissons.js` (univers commun : identité, `THEME` `{ accent: '#b34700', papier: true }` du relevé D-E,
    lieux, `EQUIPE` des six personnes dans l'ordre de l'annuaire, `EXTERIEURS` (Malo), lexique, organigramme en SVG
    `organigrammeHtml({ vides })`, annuaire, documents communs `DOC_ORGANIGRAMME` et `DOC_ANNUAIRE` complets, `STYLE_DOCUMENTS`) ;
    `contenus/france-boissons-ent61.js` (banques `cases`, `liens`, `courrier`, `TIRAGE` et `ecartsEquite`, fiches « Ce que j'ai vu »
    et « Qui fait quoi ? », jalons, messages, accusés, accueil, `optionsPour(jeu)`) ; `contenus/questions/ENT-6.1.js` ;
    `activites/france-boissons-organigramme.js` ; `contenus/corriges/ENT-6.1.js` ; `outils/test/france-boissons.mjs` (14 cas).
  - modifiés : `activites/index.js` (une ligne au registre ; entreprise n° 6 dans `ENTREPRISES`, logo SVG du dépôt) ;
    `outils/test.mjs` (**alerte 7** : `'france-boissons'` dans `BLOCS` et dans le groupe 1 de `GROUPES`, rien d'autre) ;
    `outils/test/tirage-niveaux.mjs` (les trois banques dans `BANQUES_FIGEES`, règle de D-C ; **cas existant réécrit** : l'onglet
    « Niveaux » a désormais trois colonnes, Cdiscount, Picard **et France Boissons**, puisque ENT-6.1 déclare
    `niveauxPrevus: ['confirme']`).
- **Écarts par rapport au brief** (et pourquoi) :
  - **Fiche et documents de l'élève** : le moteur ne savait pas les déclarer « fonction de la base » ; d'abord un contournement dans
    l'activité (moteur fabriqué à l'ouverture). **Tranché par Tristan : option B** — chantier moteur D-1 bis livré (§7.3, 7900170),
    contournement retiré : la séance déclare `blocs: (db) => …`, `html: (db) => …` et `ecran: (db) => …`.
  - « Le lien est-il hiérarchique ? » : un `ouinon` donne oui / non **par colonne** ; deux colonnes « Hiérarchique » /
    « Fonctionnel » feraient cliquer deux fois par ligne (et permettraient oui / oui). Livré : **une colonne « Lien hiérarchique ? »**,
    oui = hiérarchique, non = fonctionnel (consigne dans la fiche). Autre option : une ligne `choix` (« Hiérarchique » /
    « Fonctionnel ») par situation. *DÉCISION À VALIDER.*
  - Cases vides rangées **par lettre** (`valeurs['case-a']`), pas par id de poste : l'id du poste dans la page (`data-fiche-champ`)
    aurait donné la réponse. Le jalon lit la lettre de la case du poste dans le tirage de l'élève (jamais une lettre fixe).
  - Courrier d'un confirmé : les deux cas bonus arrivent en **3e et 5e** position (pas à la fin), pour que le dernier message soit
    toujours du socle : le premier bilan (et le bandeau de fin) tombe au dernier transfert, cas bonus compris.
  - Réponse d'Inès à la fiche (« Merci, j'ai ta fiche. Avant de te confier le courrier, une question. ») : c'est la phrase du
    **point d'étape** (pas un message de plus). Le point d'étape porte `ferme: 'repondre:msg-malo'` : « Continuer » ouvre le message de
    Malo, arrivé avec le message d'Inès « Je pars en réunion… ».
  - Équipe : **prénoms seuls** (aucun nom de famille dans les briefs) ; Malo est dans `EXTERIEURS`, pas dans `EQUIPE` (la liste
    « Transférer à… » = les six de l'annuaire).
  - Corrigé enseignant : lien YouTube en texte ; **le minutage n'y est pas** (relevé de Cowork `prepalog-fb-video-buchelay`, absent du
    dépôt) : à recopier par Cowork.
- **Décisions prises en route** : celles ci-dessus, une ligne chacune dans `docs/decisions.md` (09/10/2026). Valeurs par défaut du
  §11 appliquées (barème 5 / 2 / 5 / 6 / 2 ; annuaire complet joint de 6.2 à 6.10 ; textes, prénoms et intitulé de Nadia tels que
  le brief les donne ; message « échange de congés » gardé).
- **Vérifié §7.2** : la fiche « Ce que j'ai vu » sans jalon, `envoi: { incomplet: true }`, s'envoie vide et ne compte pas comme étape
  (la séance se finit sans elle : cas « pire cas »).
- **Tests** : bloc `france-boissons` **14/14** ; `france-boissons tirage-niveaux questions dependances` 167/167 ; **suite entière
  971/971** (avec `pret: true`). Sabotages éprouvés (saboter, voir tomber, remettre) : jalon des cases inversé, du chef de
  Lucas inversé, des liens inversé, du courrier inversé, `juste` de la question changé → 6 cas tombent à chaque fois (parcours
  juste, pire cas, Nadia / quai, case de Karim, Malo → Karim, confirmé) ; garde « 2 + 2 » retirée de `ecartsEquite` → le cas des
  300 graines tombe. Le cas des 300 graines se contrôle aussi lui-même (la même banque sans règle doit y être prise en faute).
  **D-1 bis** : bloc `france-boissons` 17/17 (3 cas de plus : niveau changé puis « Réinitialiser » → les écrans suivent le nouveau
  tirage, cas qui **tombait** avec le contournement — 3 cases au lieu de 4 ; contrôle au chargement ; fonction qui plante au
  dessin) ; `france-boissons questions dependances` 146/146 ; suite entière : **974/974**. Sabotages D-1 bis : contrôle au chargement de
  la fiche retiré → le cas « au chargement » tombe ; `ecran` fonction ignoré → « Malo → Karim » tombe (pas de « Corriger ») ;
  rattrapage du document au dessin retiré → le cas « au dessin » et « aucune erreur JavaScript » tombent.
- **Commits** : 8713104 « ENT-6.1 : univers France Boissons, organigramme et annuaire, fiches, tirage et jalons (brouillon) » ;
  fddd1f6 « ENT-6.1 : bloc de tests france-boissons » ; 5f01757 (livraison, `pret: true`, ce compte rendu) ; 7900170 (D-1 bis :
  moteur « fonction de la base », contournement retiré).
- **Reste ouvert** : la *DÉCISION À VALIDER* sur « Le lien est-il hiérarchique ? » (une colonne ou deux boutons) ; le minutage de la vidéo au corrigé ;
  la trame (Cowork, après validation à l'écran) ; la ligne ENT-6.1 du cas « compétences : chaque séance déclare ce que Tristan a
  validé » (`outils/test/socle.mjs`) n'est pas ajoutée (liste écrite à la main par Tristan) ; `activites/FICHE-SEANCE.md` sur le
  socle d'un confirmé : corrigé par la session mère (99f88cc).
