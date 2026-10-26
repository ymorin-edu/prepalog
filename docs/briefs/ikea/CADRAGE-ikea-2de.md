# Prepalog 2de — cadrage IKEA (entreprise n° 12, après Mondial Relay)

Proposition de Claude du 26/10/2026. **Entreprise choisie par Tristan le 26/10/2026** (IKEA, parmi IKEA, Leroy Merlin et
Yves Rocher : `/mnt/project-files/2de-apres-mondial-relay/proposition-entreprise-suivante.md`). **Options du §7 validées par Tristan le 26/10/2026 (« tout ok »)** : les recommandations en gras. Briefs ENT-12.1 à 12.8
écrits le 26/10 ; choix restants dans `docs/briefs/ikea/A-TRANCHER.md`. Rien n'est construit. Suite de `docs/briefs/mondial-relay/CADRAGE-S3-mondial-relay.md`.

## 1. Pourquoi IKEA, pourquoi après Mondial Relay

Une fois Mondial Relay fini, le cœur de la 2de est complet (S1 Smoby / Kuehne+Nagel, S2 France Boissons, S3 Mondial
Relay), mais des compétences n'auront **jamais été travaillées** en 2de (relevé dans `activites/catalogue.js` et les
briefs ENT-11.x) :

- **AGO-2.1** contrôler une facture d'achat : mission décidée le 03/10/2026 pour les trois scénarios (« contrôler la
  facture du transporteur »), jamais construite ;
- **OTM-C1.1** prendre en compte la demande du client, **OTM-C1.2** choisir les modalités du transport, **OTM-C3.1**
  contrôler les engagements (délai, créneau promis) ;
- **C1.3** préparer la réception (le planning de quais : « cas quai du Planning sans séance en 2de », noté le 04/10) ;
  **C2.2** optimiser les préparations.

IKEA les porte toutes dans son métier réel : il **vend à distance des meubles lourds et volumineux**, propose plusieurs
modes de livraison à prix publics, **confie le dernier kilomètre à des transporteurs** (donc reçoit leurs factures) et
fait tourner des **centres de distribution clients** à plusieurs dizaines de quais. Elle était validée pour la 2de
depuis le 02/10/2026 (carte de couverture). Et elle fait le **lien avec S3** : ses petits colis vont en Point Relais
**par Mondial Relay**.

## 2. Ce qui est vérifié (recherches du 26/10/2026)

| Point | Fait | Source | Statut |
|---|---|---|---|
| IKEA France | plus de 12 000 salariés, 36 magasins, **5 dépôts**, CA 3,7 milliards d'euros, **27 % des ventes en ligne** (exercice 2023-2024) | [IKEA, salle de presse](https://www.ikea.com/fr/fr/newsroom/corporate-news/ikea-france-livre-ses-clients-parisiens-par-la-seine-pub9aa0f8b0/) | vérifié |
| **Le site retenu : centre de distribution clients (CDC) de Gennevilliers** (Hauts-de-Seine, port de Gennevilliers, à 5 km de Paris) | inauguré le 29/01/2019, livraisons depuis le 04/02/2019 ; **50 000 m²** sur deux niveaux ; **71 portes de quai** ; environ **6 000 références**, surtout les plus lourdes et les plus grosses ; dessert Paris et l'ouest parisien ; approvisionné par les **autres centres IKEA de France et d'Allemagne** et par des **fournisseurs en direct** ; exploité à l'ouverture par le prestataire **XPO Logistics** (réception, stockage, préparation) ; transporteurs du dernier kilomètre cités : Vir Transport, Trusk ; objectif J+2 puis J+1 | [Stratégies Logistique, 04/02/2019](https://www.strategieslogistique.com/IKEA-ouvre-son-5eme-CDC-national-a) | vérifié (2019) ; **qui exploite aujourd'hui** (XPO est devenu GXO en 2021 ?) **à vérifier** |
| Les autres CDC | Saint-Quentin-Fallavier (Isère, environ 440 salariés, plus de 100 000 m², **100 % livraison client**, équipes en 2 × 8 : 6 h-13 h 20 et 13 h 30-20 h 50), Metz, Fos, Châtres | [Stratégies Logistique](https://www.strategieslogistique.com/IKEA-ouvre-son-5eme-CDC-national-a) ; [offre France Travail, chef d'équipe](https://candidat.francetravail.fr/offres/recherche/detail/188HRJD) | vérifié |
| **La Seine** | depuis le **14/12/2022** : commandes préparées à Gennevilliers, chargées dans des **caisses mobiles** (Box2Home), **péniche jusqu'au port de Bercy**, puis **utilitaires électriques** (Trusk) ; objectif **455 commandes par jour, 35 caisses** ; environ **300 000 km de camion évités par an** ; le fluvial émet jusqu'à 5 fois moins de CO₂ par tonne | [IKEA](https://www.ikea.com/fr/fr/newsroom/corporate-news/ikea-france-livre-ses-clients-parisiens-par-la-seine-pub9aa0f8b0/) ; [HAROPA](https://www.haropaport.com/sites/default/files/media/downloads/ikea_france_livre_ses_clients_parisiens_par_la_seine.pdf) ; [L'Info durable](https://www.linfodurable.fr/ikea-lance-la-livraison-par-peniche-pour-ses-clients-parisiens-35930) (caisses de 18 m³, 13 commandes au plus) | vérifié (2022) ; caisse de 18 m³ : une seule source |
| **Limay** (Yvelines) | futur CDC sur la Seine, **60 000 m²**, **350 emplois**, 120 millions d'euros, 380 000 m³ par an, deux rotations fluviales par jour, **mise en service prévue fin 2026** ; recrutements en août 2026 | [HAROPA, 27/03/2025](https://www.haropaport.com/fr/actualites/ikea-pose-la-premiere-pierre-de-son-futur-centre-de-distribution-limay) ; [La Clé publique, 23/08/2026](https://laclepublique.fr/yvelines/articles/2026/2026-08-23-ikea-limay-recrutements/) | vérifié **comme projet** : pas encore ouvert le 23/08/2026 ; donc **pas le site de l'histoire**, seulement une actualité |
| **Les modes de livraison et leurs prix** (non-membre / membre IKEA Family) | **Point Relais** 7 € / 2 € : article de moins de 19 kg, 115 cm au plus par côté, commande de moins de 20 kg ; **colis à domicile** 14 € / 9 € : moins de 60 kg, sous 3 jours ouvrables ; **devant chez vous** (au pied de l'immeuble) 60 € / 40 € jusqu'à 500 €, commande de moins de 1 000 € ; **dans la pièce de votre choix** de 80 € à 320 € selon le montant ; **express** 24 à 48 h ; **livraison fluviale** déclenchée d'office pour Paris intra-muros (sauf plans de travail de plus de 3 m) ; dimanche et soirée dans certaines villes | [IKEA, page Livraison](https://www.ikea.com/fr/fr/customer-service/services/delivery/) | vérifié le 26/10/2026 (prix susceptibles de changer : figer une date dans la séance) |
| Le Point Relais | **Mondial Relay** livre les colis IKEA en Point Relais, **5 jours** de garde | [IKEA, aide en ligne](https://www.ikea.com/fr/fr/customer-service/knowledge/articles/g55g0gg2-48g5-4gf7-b21b-92efg16d2411.html) | vérifié |
| **Les conditions de vente** (version du 10/08/2026) | gros colis : IKEA s'engage sur **la date et le créneau choisis** (art. 4.1.2) ; meuble qui ne passe pas (escalier, ascenseur) : reprise ou livraison par la fenêtre **aux frais du client** ; absence : prévenir **72 h** avant ; réserves **précises et motivées** sur le bon de livraison, « sous réserve de déballage » sans valeur ; sinon **72 h** avec photo (art. 7) ; retard : le client peut résilier après un délai supplémentaire raisonnable (**art. L216-6 du Code de la consommation**, art. 4.4) ; **rétractation 14 jours**, retour à la charge du client (art. 9) ; **reprise de l'ancien meuble « un pour un »** à la livraison, même nature, démonté (art. 14.2.2) ; **éco-participation** comprise dans le prix (art. 2, 14.1) | [CGV IKEA France](https://www.ikea.com/fr/fr/customer-service/terms-conditions/conditions-generales-de-vente-pub91a0d710/) | vérifié (lu par un outil de résumé : **relire mot à mot** les articles cités avant d'écrire une question notée) |
| La crue | la navigation sur la Seine à Paris s'arrête lors des fortes crues (juin 2016, janvier 2018) ; à 3,70 m à Austerlitz (février 2026) elle continuait | [TourMaG, 19/02/2026](https://www.tourmag.com/Tourisme-fluvial-au-dela-des-crues-l-ombre-persistante-de-la-secheresse_a130572.html) | vérifié en gros ; **seuil d'arrêt à sourcer** (VNF) avant d'écrire l'imprévu |

**Construit, et dit comme tel** : la cliente et sa commande, les prénoms des salariés (prénoms seuls, comme partout),
les quais tenus par l'élève (5 ou 6 sur 71), les camions et leurs heures, la facture du transporteur (montants, lignes),
le tarif entre IKEA et son transporteur (non public), les créneaux. **Aucun document IKEA réel reproduit** : bon de
livraison et facture sont reconstitués, avec la mention en pied.

**Ce qui ne colle pas** : un CDC IKEA ne vend pas au comptoir et ne voit pas la cliente ; le service client est ailleurs.
Le poste B est donc placé « au service livraison du CDC », qui rappelle la cliente pour caler sa livraison (pratique
plausible, **non vérifiée** : construite).

## 3. Ce que fait la règle 15 ici

En 2de, une compétence de **transport ou de gestion** travaillée doit être **évaluée dans l'année** ; une compétence de
**logistique** travaillée une fois compte comme **découverte** (reprise en 1re). Donc :

| Compétence | Temps proposés ici |
|---|---|
| OTM-C1.1, OTM-C1.2, OTM-C3.1 (nouvelles en 2de) | travail **puis évaluation** |
| AGO-2.1 (nouvelle en 2de) | travail **puis évaluation** |
| C1.3, C2.2 (nouvelles en 2de) | **découverte** seulement (reprises en 1re) |
| C1.1 (situer l'entreprise) | découverte (déjà travaillée en 6.1, 11.1) |

## 4. Le scénario proposé

**Fil rouge** : un mardi de mars au CDC de Gennevilliers. **Mme Leïla Benali** (construite) habite Paris 11e, au
4e étage sans ascenseur. Elle commande en ligne une **armoire** (plusieurs colis, plus de 100 kg), un **canapé** et une
**lampe**. Une seule commande, **deux chemins** : la lampe part en Point Relais par Mondial Relay (clin d'œil à S3), les
meubles par la Seine jusqu'à Bercy puis en utilitaire électrique. Elle veut aussi faire reprendre son vieux canapé.

Trois postes, comme S1, S2 et S3 :

- **A (AGOrA), assistant(e) de gestion du service transport** : contrôler chaque mois la **facture du transporteur du
  dernier kilomètre** contre les bons de livraison signés et le tarif.
- **B (OTM), agent(e) du service livraison** : prendre la demande de la cliente, **choisir le mode** selon les règles
  réelles (poids, dimensions, montant, adresse), tenir le **créneau promis** quand la péniche est arrêtée.
- **C (Logistique), employé(e) logistique** : planifier les **quais de réception** du matin, préparer une commande
  **lourde et volumineuse**.

**Code** : IKEA = **entreprise n° 12**, séances **ENT-12.x**, niveau `2de` seul.

### Séances (structure B, recommandée : 8 séances)

| Code | Poste | Séance (1 h) | Temps | Compétences | Vues (toutes existent) |
|---|---|---|---|---|---|
| ENT-12.1 | tous | **Une commande, deux chemins** : situer Gennevilliers (carte de France, région et département notés), remettre dans l'ordre le parcours de la commande (site → CDC → péniche → Bercy → utilitaire → cliente ; lampe : CDC → Mondial Relay → Point Relais), lire la page « Livraison » (quel mode pour quel article) | découverte | C1.1, D1 | `localiser`, `ordre`, questions |
| ENT-12.2 | B | **La demande de Mme Benali** : l'appeler pour caler la livraison (étage, ascenseur, créneau, reprise de l'ancien canapé), puis choisir le mode de chaque article d'après les règles d'IKEA, et dire le prix | guidage | OTM-C1.1, OTM-C1.2 | `dialogue` (téléphone), fiche à remplir, questions |
| ENT-12.3 | B | **La Seine est en crue** : la péniche ne part pas ; quels créneaux tenir (camion à la place), qui prévenir, que dire à la cliente qui veut annuler (art. L216-6) | entraînement | OTM-C3.1, OTM-C1.2 | `planning` (créneaux × véhicules, aléa en cours de séance), messagerie |
| ENT-12.4 | A | **La facture du transporteur** : comparer la facture du mois aux bons de livraison signés et au tarif ; trouver les lignes fausses (livraison facturée deux fois, livraison refusée facturée, mauvais tarif) ; écrire la réclamation | guidage | AGO-2.1 | documents joints, `grille`, courriel |
| ENT-12.5 | C | **Les quais du mardi** : poser les camions du matin (Saint-Quentin-Fallavier, Allemagne, un fournisseur en direct) sur 5 ou 6 quais, un camion en retard | découverte | C1.3 | `planning` (mode quais, `occupe`) |
| ENT-12.6 | C | **L'armoire de Mme Benali** : préparer une commande lourde (ordre de prélèvement : le lourd d'abord, à deux au-delà d'un poids), la mettre dans la caisse mobile du matin | découverte | C2.2, C2.1 | plan d'entrepôt (prélever), questions |
| ENT-12.7 | B | **Évaluation transport** : une autre cliente tirée par élève (adresse, articles, étage) ; choisir les modes, tenir les créneaux après l'aléa | évaluation | OTM-C1.1, C1.2, C3.1 | `dialogue`, `planning` |
| ENT-12.8 | A | **Évaluation gestion** : la facture du mois suivant, lignes fausses tirées par élève | évaluation | AGO-2.1 | documents joints, `grille`, courriel |

Ordre de jeu = ordre du flux : 12.1, puis C (12.5, 12.6), B (12.2, 12.3, 12.7), A (12.4, 12.8). Évaluations : copie
rendue, un jeu tiré par élève, questions clés reprises sans aide, « Je ne sais pas » permis, jalons pondérés sur 20
(poids soumis avant de coder).

### Questions d'économie-droit possibles (appliquées au cas)

- La **reprise « un pour un »** : Mme Benali veut faire reprendre son vieux canapé et une vieille chaise ; IKEA doit-il
  reprendre les deux ? (CGV art. 14.2.2 ; règle issue de la loi anti-gaspillage, **à sourcer** au texte de loi).
- Le **retard** : la cliente peut-elle annuler tout de suite ? (L216-6 : seulement après un délai supplémentaire
  raisonnable, sauf date essentielle).
- La **rétractation** : 14 jours après réception, retour à sa charge.
- Les **réserves** : « sous réserve de déballage » ne vaut rien ; 72 h avec photo.
- L'**éco-participation** sur la facture du client : qui la paie, à quoi elle sert.

## 5. Les vues

**Aucune vue nouvelle n'est nécessaire** : téléphone (`dialogue`), `planning` (quais et créneaux, aléa), documents
joints, `grille`, plan d'entrepôt, `localiser`, `ordre`, messagerie existent. À contrôler en écrivant les briefs :

- **la jauge en m³** de la caisse mobile (13 commandes, 18 m³) : `tournee` a des jauges, mais je n'ai pas vérifié
  qu'elle accepte un volume ; sinon une question de calcul suffit ;
- **la fiche « choisir le mode »** de 12.2 : un tableau article × mode (liste déroulante par ligne) ; la vue `tableau`
  ou une fiche de `documents formulaire` devrait le faire, à confirmer.

Vue nouvelle **possible** (option 4) : le **Suivi d'envoi**, promis depuis le 03/10 : la commande change d'état pendant
la séance (préparée, à bord, péniche arrêtée, en livraison, refusée) et l'élève réagit à chaque événement. Elle
servirait aussi OTM-C2.3 partout. À construire **après** la vue Tri de Mondial Relay (un seul chantier moteur à la fois).

## 6. La charte

Bleu et jaune d'IKEA. Ni rouge ni vert, donc pas de conflit avec « juste / faux ». Mais **le bleu sert déjà de repère
« client » sur les cartes et vues de transport** : le bleu d'IKEA reste au bandeau et au menu, jamais dans la zone de
travail. Le jaune sur fond clair ne passe pas le contraste de texte (WCAG 4,5) : jaune en aplat seulement, texte en
encre. Logo : à récupérer par script avec ton accord (alerte 10).

## 7. Options à trancher (ma recommandation en gras)

1. **Le site** : **Gennevilliers** (en service depuis 2019, la Seine, les 71 quais, bien sourcé) · Saint-Quentin-Fallavier
   (près de Lyon, horaires et effectif sourcés, pas de Seine) · Limay (pas encore ouvert : non).
2. **La structure** : A. découverte seulement, 4 séances, sans toucher aux compétences transport et gestion nouvelles ·
   **B. 8 séances** (tableau ci-dessus) · C. les trois temps partout, environ 11 séances.
3. **Le transporteur du dernier kilomètre** : **le nommer sans le nommer** (« le prestataire de livraison », facture
   reconstituée, sans nom d'entreprise : sa relation avec IKEA en 2026 n'est pas vérifiée et la facture est inventée) ·
   nommer Trusk (vérifié en 2022 seulement).
4. **Vue nouvelle** : **aucune** · le Suivi d'envoi, après la vue Tri.
5. **Le poste C** : **deux séances de découverte** (quais, préparation) · une seule (quais) pour aller plus vite.
6. **La place dans l'année** : **après Mondial Relay**, en fin de 2de · en complément, à placer librement.

## 8. Durées

- Ce cadrage : fait.
- Une fois tes choix faits : 8 briefs avec les propositions de questions au fil et « Avant de commencer », **environ
  3 h** (relire mot à mot les CGV et le texte de la reprise un pour un, sourcer le seuil de crue).
- Construction : une demi-journée par séance en moyenne, **après Mondial Relay** (fichiers communs : `activites/index.js`,
  `outils/test.mjs`, `docs/decisions.md` sont tenus par ce chantier en ce moment).
- Version courte possible : 12.1, 12.2, 12.4, puis les deux évaluations (12.7, 12.8) d'abord : 5 séances qui couvrent
  toutes les compétences transport et gestion nouvelles ; le poste C ensuite.
