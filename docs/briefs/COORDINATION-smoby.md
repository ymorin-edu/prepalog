# Coordination — scénario S1 de la 2de GATL : Smoby → Kuehne+Nagel (« La commande de Noël »)

Écrit par Cowork le 04/10/2026, **mis à jour le 04/10 après-midi** (7e séance « visite », Plan d'entrepôt). Conception
complète : fiches projet `claude/prepalog-2de-s1-cadrage.md` (décisions de Tristan, vérifications web, 6 premières séances),
`claude/prepalog-2de-s1-visite.md` (la visite) et `claude/prepalog-plan-entrepot-cadrage.md` (Plan d'entrepôt) ; règles d'écriture : `claude/prepalog-2de-eleve-debut-annee.md`.
**Le dépôt fait foi** pour ce qui est construit (`docs/decisions.md`, comptes rendus des briefs).

## L'histoire

Fin 2026, la plateforme logistique **Smoby de Moirans-en-Montagne** (Jura) prépare le pic de Noël. L'élève, « en renfort »,
joue son propre rôle à trois postes : **assistant RH** (recrute le cariste Yanis, prépare son arrivée), **cariste** (Yanis
visite la plateforme, reçoit et range les palettes de l'usine d'Arinthod), **agent d'exploitation** à l'agence **Kuehne+Nagel de Besançon**
(planifie les enlèvements de la commande de Noël, prépare la lettre de voiture, gère un retard). Toute la classe au même
poste ; séances d'1 h ; guidage ; chaque séance repart d'un **dossier propre**. Le flux Smoby ↔ K+N est **construit et
annoncé comme tel**.

## Les séances, dans l'ordre de jeu (7 depuis le 04/10)

| Code | Poste | Séance | Brief | Dépend de | Jalons |
|---|---|---|---|---|---|
| ENT-5.1 | RH | Recruter le cariste | `ENT-5.1-smoby-recrutement.md` | MOTEUR-2de-S1 lots 1, 2, 3, 7 | 9 |
| ENT-5.2 | RH | L'arrivée de Yanis + planning des présences | `ENT-5.2-smoby-arrivee.md` | **vue Planning** + lots 1, 2, 3, 7 | 14 |
| **ENT-5.3** | Cariste | **La visite de la plateforme** (vue du ciel, parcours, vocabulaire du rack, adresse) — **nouvelle** | `ENT-5.3-smoby-visite.md` | **vue Plan d'entrepôt** (modes visite) + lots 1, 3, 7 | 8 |
| ENT-5.4 | Cariste | Sécurité au quai, premier déchargement | `ENT-5.4-smoby-reception.md` *(actuellement `ENT-5.3-…`)* | lots 2, 3, **4, 5**, 7 | 10 |
| ENT-5.5 | Cariste | Ranger, saisir l'entrée en stock | `ENT-5.5-smoby-rangement.md` *(actuellement `ENT-5.4-…`)* | **vue Plan d'entrepôt** + lots 1, 2, 3, 7 | 9 |
| ENT-5.6 | Agent K+N | Chauffeurs et camions | `ENT-5.6-smoby-enlevements.md` *(actuellement `ENT-5.5-…`)* | **vue Planning** + lots 1, 3, 7 | 10 |
| ENT-5.7 | Agent K+N | Lettre de voiture et retard | `ENT-5.7-smoby-lettre-voiture.md` *(actuellement `ENT-5.6-…`)* | lots 1, 2, 3, 7 | 8 |

### Renumérotation du 04/10 — à faire par Claude Code, en premier, en un seul commit

Décision de Tristan : la visite est **une séance à part, juste avant la réception**. Rien n'est encore construit, donc :
1. `git mv` dans cet ordre (du plus grand au plus petit, pour ne rien écraser) : `ENT-5.6-smoby-lettre-voiture.md` →
   `ENT-5.7-…` ; `ENT-5.5-smoby-enlevements.md` → `ENT-5.6-…` ; `ENT-5.4-smoby-rangement.md` → `ENT-5.5-…` ;
   `ENT-5.3-smoby-reception.md` → `ENT-5.4-…`. Le nouveau `ENT-5.3-smoby-visite.md` garde son nom.
2. Dans ces briefs et dans `MOTEUR-2de-S1.md`, remplacer les codes **5.6 → 5.7, 5.5 → 5.6, 5.4 → 5.5, 5.3 → 5.4** (dans
   cet ordre), **sauf** dans `ENT-5.3-smoby-visite.md`. Les `id` (`smoby-reception`, `smoby-rangement`…) **ne changent pas**.
3. Si une activité Smoby existe déjà dans `activites/`, changer son `code` (le dire à Tristan : alerte n° 8).
4. Une ligne dans `docs/decisions.md`.

## Ordre des chantiers (un seul chantier moteur à la fois)

1. **Vue Planning** (`MOTEUR-vue-planning.md`, en cours le 04/10).
2. **`MOTEUR-2de-S1.md`** : lot 0 (état des lieux, compte rendu à Tristan **avant** d'écrire) puis lots 1 → 7.
3. Séances **ENT-5.1, 5.7, 5.4** (ne demandent pas de vue nouvelle), puis **5.2 et 5.6** (Planning).
4. **Plan d'entrepôt** : maquette v2 Cowork → jeu de Tristan → brief moteur (**un seul chantier** pour le plan, la vue de
   face et les modes visite) → construction → séances **ENT-5.3** (visite) et **ENT-5.5** (rangement), données recalées sur
   la maquette.

## Ce que Cowork doit encore fournir

- [x] Trois photos du quai pour ENT-5.3 (remorques, extérieur, intérieur avec cariste au chariot), marques réelles effacées. Fait le 04/10.
- [x] Logo Smoby, **accord de Tristan le 04/10** : `docs/briefs/smoby/logo-smoby.svg` (empreinte et couleurs dans `LISEZMOI.md`).
- [ ] Maquette v2 du **Plan d'entrepôt** (page d'essai faite le 04/10 : `Claude outputs\essai-plan-zone.html`, pistes
  A à G ; Tristan retient A, B, C pour la sécurité, D pour le vocabulaire, F, G).
- [ ] Maquette jouable de la **visite** (ENT-5.3) et ses photos dans `smoby/` (Pexels 2804929, 5775099, 4483609 ;
  empreintes vérifiées).
- [ ] Trames élève courtes (après validation à l'écran de chaque séance) et **fiche d'intention** du scénario.
- [ ] Libellés OTM et AGOrA dans le dépôt si Claude Code ne les a pas (fiches projet `referentiel-bac-otm.md`,
  `referentiel-bac-agora.md`).

## Fichiers de référence (`docs/briefs/smoby/`)

| Fichier | Quoi |
|---|---|
| `exemple-cv-A1.html` | Deux des cinq CV d'ENT-5.1 (Yanis, Laura), format **validé par Tristan** le 04/10 : modèle des trois autres. |
| `logo-smoby.svg` | Logo officiel (accord de Tristan), accent proposé `#006FA6`. |
| `quai-remorques.jpg`, `quai-exterieur.jpg`, `quai-interieur.jpg` | Photos du quai (ENT-5.3), retouchées. |
| `LISEZMOI.md` | Sources, licences, empreintes, couleurs. |

La maquette du Planning (cas personnel et chauffeurs) est dans `docs/briefs/planning/`.

## Personnages et données partagés (`contenus/smoby.js`)

Sophie Martin (assistante RH, tutrice) · Yanis Morel (cariste recruté, CACES 3 et 5, CDD saisonnier du 9/12/2026 au
8/01/2027) · Bruno (chef de quai) · le responsable d'exploitation K+N Besançon (sans nom) · chauffeurs Sofiane, Julie, Marc,
Nadia · Semi n° 1, Semi n° 2, Porteur n° 3 · enlèvements E1 à E5 (maquette Planning) · équipe Karim, Léa, Mathis, Inès,
Chloé (+ Noa, intérimaire, à l'imprévu de 5.2). Tous **fictifs**, aucun visage.

## Calendrier de l'histoire

ENT-5.1 fin novembre · ENT-5.2 début décembre (planning des semaines du 7 et du 14) · **mer 9 décembre** : arrivée de Yanis,
**ENT-5.3 la visite (8 h)**, ENT-5.4 la réception (14 h) puis ENT-5.5 le rangement (fin d'après-midi) · **jeu 10 décembre** :
ENT-5.6 (planning de la journée) et ENT-5.7 (départ d'E1 à 6 h, retard à 8 h 30).

## Décisions du 04/10 (après-midi) sur le Plan d'entrepôt

- Le palettier est **découpé entre chaque échelle** ; logique **« je choisis la travée, puis l'emplacement »** (vue de dessus →
  vue de face de la travée).
- **3 palettes par niveau** ; **charge maximale par niveau** (somme) ; **plus de règle « lourd en bas » bloquante** (conseil
  seulement) ; un **cas picking** sera à ajouter (niveau du sol pour la préparation).
- Vocabulaire : **« emplacement », jamais « place »** ; adresse proposée `A-03-2-1` (allée-travée-niveau-emplacement,
  niveau 1 = sol).
- **Pas de maquette universelle** : le moteur fournit des briques, chaque séance déclare son plan.
