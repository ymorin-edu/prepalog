# Coordination — scénario S1 de la 2de GATL : Smoby → Kuehne+Nagel (« La commande de Noël »)

Écrit par Cowork le 04/10/2026, **mis à jour le 04/10 après-midi** (7e séance « visite », Plan d'entrepôt) **et le 04/10 au soir** (maquette de la visite validée, brief `MOTEUR-modes-visite.md` ; **8e séance : la préparation de
la palette mixte d'E1**, ENT-5.6, K+N renuméroté en 5.7 et 5.8). Conception
complète : fiches projet `claude/prepalog-2de-s1-cadrage.md` (décisions de Tristan, vérifications web, 6 premières séances),
`claude/prepalog-2de-s1-visite.md` (la visite) et `claude/prepalog-plan-entrepot-cadrage.md` (Plan d'entrepôt) ; règles d'écriture : `claude/prepalog-2de-eleve-debut-annee.md`.
**Le dépôt fait foi** pour ce qui est construit (`docs/decisions.md`, comptes rendus des briefs).

## L'histoire

Fin 2026, la plateforme logistique **Smoby de Moirans-en-Montagne** (Jura) prépare le pic de Noël. L'élève, « en renfort »,
joue son propre rôle à trois postes : **assistant RH** (recrute le cariste Yanis, prépare son arrivée), **cariste** (Yanis
visite la plateforme, reçoit et range les palettes de l'usine d'Arinthod, prépare la palette mixte de la commande de Noël), **agent d'exploitation** à l'agence **Kuehne+Nagel de Besançon**
(planifie les enlèvements de la commande de Noël, prépare la lettre de voiture, gère un retard). Toute la classe au même
poste ; séances d'1 h ; guidage ; chaque séance repart d'un **dossier propre**. Le flux Smoby ↔ K+N est **construit et
annoncé comme tel**.

## Les séances, dans l'ordre de jeu (8 depuis le 04/10 au soir)

| Code | Poste | Séance | Brief | Dépend de | Jalons |
|---|---|---|---|---|---|
| ENT-5.1 | RH | Recruter le cariste | `ENT-5.1-smoby-recrutement.md` | MOTEUR-2de-S1 lots 1, 2, 3, 7 | 9 |
| ENT-5.2 | RH | L'arrivée de Yanis + planning des présences | `ENT-5.2-smoby-arrivee.md` | **vue Planning** + lots 1, 2, 3, 7 | 14 |
| **ENT-5.3** | Cariste | **La visite de la plateforme** (vue du ciel, parcours, vocabulaire du rack, **la travée**, adresse) — **nouvelle** | `ENT-5.3-smoby-visite.md` | **vue Plan d'entrepôt** + **`MOTEUR-modes-visite.md`** + lot 7 (lots 1, 3, 6 livrés) | **11** |
| ENT-5.4 | Cariste | Sécurité au quai, premier déchargement | `ENT-5.4-smoby-reception.md` | lots 2, 3, **4, 5**, 7 | 10 |
| ENT-5.5 | Cariste | Ranger, saisir l'entrée en stock | `ENT-5.5-smoby-rangement.md` | **vue Plan d'entrepôt** + lots 1, 2, 3, 7 | 9 |
| **ENT-5.6** | Cariste | **Préparer la palette mixte d'E1** (picking, réappro, palette, film, étiquettes) — **nouvelle** | `ENT-5.6-smoby-preparation.md` | **vue Plan d'entrepôt** (mode préparation) + lot 7 | **9** |
| ENT-5.7 | Agent K+N | Chauffeurs et camions | `ENT-5.7-smoby-enlevements.md` *(ancien `ENT-5.6-…`)* | **vue Planning** + lots 1, 3, 7 | 10 |
| ENT-5.8 | Agent K+N | Lettre de voiture et retard | `ENT-5.8-smoby-lettre-voiture.md` *(ancien `ENT-5.7-…`)* | lots 1, 2, 3, 7 | 8 |

### Renumérotation du 04/10 — **faite** par Claude Code (commit 822c98d, ligne dans `docs/decisions.md`)

Décision de Tristan : la visite est **une séance à part, juste avant la réception**. Rien n'est encore construit, donc :
1. `git mv` dans cet ordre (du plus grand au plus petit, pour ne rien écraser) : `ENT-5.6-smoby-lettre-voiture.md` →
   `ENT-5.7-…` ; `ENT-5.5-smoby-enlevements.md` → `ENT-5.6-…` ; `ENT-5.4-smoby-rangement.md` → `ENT-5.5-…` ;
   `ENT-5.3-smoby-reception.md` → `ENT-5.4-…`. Le nouveau `ENT-5.3-smoby-visite.md` garde son nom.
2. Dans ces briefs et dans `MOTEUR-2de-S1.md`, remplacer les codes **5.6 → 5.7, 5.5 → 5.6, 5.4 → 5.5, 5.3 → 5.4** (dans
   cet ordre), **sauf** dans `ENT-5.3-smoby-visite.md`. Les `id` (`smoby-reception`, `smoby-rangement`…) **ne changent pas**.
3. Si une activité Smoby existe déjà dans `activites/`, changer son `code` (le dire à Tristan : alerte n° 8).
4. Une ligne dans `docs/decisions.md`.

### Seconde renumérotation (04/10 au soir) — **briefs déjà écrits par Cowork**, reste le ménage à Claude Code

Décision de Tristan : la **préparation de la palette mixte d'E1** s'insère après le rangement, avant K+N. Cowork a déposé
`ENT-5.6-smoby-preparation.md` (nouveau), `ENT-5.7-smoby-enlevements.md` et `ENT-5.8-smoby-lettre-voiture.md` (contenus
renumérotés, `id` inchangés). **Claude Code** : `git rm` de `ENT-5.6-smoby-enlevements.md` et `ENT-5.7-smoby-lettre-voiture.md`
(anciens), puis commit avec les nouveaux (git voit le renommage). Aucune activité Smoby n'existe encore : aucun `code` à
changer. Poids d'E1 recalculé : **6 091 kg** (32 × 180 + la palette mixte de 331 kg).

## Ordre des chantiers (un seul chantier moteur à la fois)

1. **Vue Planning** (`MOTEUR-vue-planning.md`, en cours le 04/10).
2. **`MOTEUR-2de-S1.md`** : lot 0 (état des lieux, compte rendu à Tristan **avant** d'écrire) puis lots 1 → 7.
3. **`MOTEUR-documents-formulaire.md`** (04/10 : documents joints, fiche à remplir, menu de gauche rétractable ; maquette
   validée, agencement B) — demandé par ENT-5.1, 5.2 et 5.8.
4. Séances **ENT-5.1, 5.8, 5.4** (5.4 attend aussi les lots 4-5 de `MOTEUR-2de-S1`), puis **5.2 et 5.7** (Planning).
5. **Plan d'entrepôt** : maquette v2 **validée par Tristan le 04/10** → brief **`MOTEUR-vue-plan-entrepot.md`** (plan, vue
   de face, modes rangement / comptage / préparation) → construction → séances **ENT-5.5** (rangement, données recalées) et **ENT-5.6** (préparation, mode préparation en guidage).
   **Les modes « visite » sont un second chantier** (décision de Tristan, 04/10) : maquette de la visite **v2 validée le 04/10
   au soir** → brief **`MOTEUR-modes-visite.md`** (accueil, photo à points, photo à cliquer, parcours sur le plan,
   délimiter sur une photo, zones à trouver, adresse décomposer / retrouver) → construction → séance **ENT-5.3**.

## Ce que Cowork doit encore fournir

- [x] Trois photos du quai pour ENT-5.3 (remorques, extérieur, intérieur avec cariste au chariot), marques réelles effacées. Fait le 04/10.
- [x] Logo Smoby, **accord de Tristan le 04/10** : `docs/briefs/smoby/logo-smoby.svg` (empreinte et couleurs dans `LISEZMOI.md`).
- [x] Maquette v2 du **Plan d'entrepôt** : **validée le 04/10**, déposée dans `docs/briefs/plan-entrepot/` avec ses données
  figées ; brief `MOTEUR-vue-plan-entrepot.md` écrit. Restent pour la visite : pistes B, C (sécurité), D (vocabulaire), F, G.
- [x] Maquette jouable de la **visite** (ENT-5.3) : **v2 validée le 04/10 au soir**, déposée dans `smoby/visite/` avec ses
  photos (parcours, travée) et leurs empreintes (`smoby/visite/LISEZMOI.md`) ; briefs `ENT-5.3-smoby-visite.md` (à jour)
  et `MOTEUR-modes-visite.md` écrits. La v1 de la maquette est à supprimer (`git rm`).
- [ ] Trames élève courtes (après validation à l'écran de chaque séance) et **fiche d'intention** du scénario.
- [x] Libellés OTM et AGOrA dans le dépôt : `docs/fiches/referentiel-bac-otm.md` et `-agora.md` (lot 1 de `MOTEUR-2de-S1`).
- [x] Valeurs par défaut **confirmées par Tristan** (04/10 soir) : CDD jusqu'au 8/01/2027, Sophie Martin, Bruno, client à
  Corbas sans rue ; compétences d'ENT-5.3 **C1.2 et C1.5** ; ENT-5.6 **C2.1**, 9 jalons, rupture gardée, pas de compte rendu.
- [ ] **Inventaire au plan** (comptage à une liste, maquette v2 cas ②) : **pas dans S1** → à cadrer avec **S2 France
  Boissons** (décision de Tristan, 04/10 soir).

## Fichiers de référence (`docs/briefs/smoby/`)

| Fichier | Quoi |
|---|---|
| `exemple-cv-A1.html` | Deux des cinq CV d'ENT-5.1 (Yanis, Laura), format **validé par Tristan** le 04/10 : modèle des trois autres. |
| `logo-smoby.svg` | Logo officiel (accord de Tristan), accent proposé `#006FA6`. |
| `quai-remorques.jpg`, `quai-exterieur.jpg`, `quai-interieur.jpg` | Photos du quai (ENT-5.4), retouchées. `quai-interieur.jpg` sert aussi à l'étape ① du parcours de la visite. |
| `visite/` | Maquette v2 de la visite (ENT-5.3) et ses photos, `LISEZMOI.md` (sources, retouches, empreintes). |
| `LISEZMOI.md` | Sources, licences, empreintes, couleurs. |

La maquette du Planning (cas personnel et chauffeurs) est dans `docs/briefs/planning/`.

## Personnages et données partagés (`contenus/smoby.js`)

Sophie Martin (assistante RH, tutrice) · Yanis Morel (cariste recruté, CACES 3 et 5, CDD saisonnier du 9/12/2026 au
8/01/2027) · Bruno (chef de quai) · le responsable d'exploitation K+N Besançon (sans nom) · chauffeurs Sofiane, Julie, Marc,
Nadia · Semi n° 1, Semi n° 2, Porteur n° 3 · enlèvements E1 à E5 (maquette Planning) · équipe Karim, Léa, Mathis, Inès,
Chloé (+ Noa, intérimaire, à l'imprévu de 5.2). Tous **fictifs**, aucun visage.

## Calendrier de l'histoire

ENT-5.1 fin novembre · ENT-5.2 début décembre (planning des semaines du 7 et du 14) · **mer 9 décembre** : arrivée de Yanis,
**ENT-5.3 la visite (8 h)**, ENT-5.4 la réception (14 h), ENT-5.5 le rangement (fin d'après-midi) puis **ENT-5.6 la
préparation de la palette mixte d'E1 (17 h 30)** · **jeu 10 décembre** : ENT-5.7 (planning de la journée) et ENT-5.8 (départ
d'E1 à 6 h, 33 palettes, 6 091 kg ; retard à 8 h 30).

## Décisions du 04/10 (après-midi) sur le Plan d'entrepôt

- Le palettier est **découpé entre chaque échelle** ; logique **« je choisis la travée, puis l'emplacement »** (vue de dessus →
  vue de face de la travée).
- **3 palettes par niveau** ; **charge maximale par niveau** (somme) ; **plus de règle « lourd en bas »** ; un **cas
  picking** sera à ajouter plus tard (niveau du sol pour la préparation).
- Vocabulaire : **« emplacement », jamais « place »** ; **adresse `A1-T03-N2-E1`** (allée A côté 1, travée, niveau,
  emplacement ; lettres devant chaque partie ; niveau 1 = sol). **Allées à double sens** : A1 / A2 de part et d'autre de
  l'allée A, numérotation qui se suit selon le plan (A1, A2, B1, B2…), déclarée par le contenu.
- Emplacement occupé **refusé** ; **pas d'imprévu** dans le rangement ; **aucun conseil « lourd en bas » dans un rack**
  (il ne vaut que pour le gerbage et la préparation de commandes).
- **Maquette v2 du Plan d'entrepôt : deux cas, Smoby rangement (2de) et Inventaire** (comptage à une liste d'adresses,
  à l'aveugle).
- **Pas de maquette universelle** : le moteur fournit des briques, chaque séance déclare son plan.
