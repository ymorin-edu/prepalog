# Planning — fichiers de référence pour Claude Code (déposés par Cowork le 04/10/2026)

Ce dossier n'est **pas servi aux élèves** : c'est la matière première du brief `docs/briefs/MOTEUR-vue-planning.md`.
Rien sur le site ne doit pointer vers `docs/`.

| Fichier | Quoi | Source | Octets | SHA-256 |
|---|---|---|---|---|
| `maquette-planning.html` | Maquette jouable **v8**, validée par Tristan le 04/10/2026 (« ok c'est bon ») : **la référence d'interaction** de la vue Planning. Un seul fichier, aucune requête externe, s'ouvre en double-clic. En-tête de la maquette : choix du cas (quai / personnel / chauffeurs) et du temps (guidage / entraînement / évaluation). | écrite par Cowork (copie de `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-planning.html`) | 71 971 | `20cf81ef2c4372f6251e979df0ae666757fb6ead338d6f930e1103b7ae1d50a2` |

**Elle fait foi pour l'interaction, pas pour le code** (état global, un fichier) : reprendre le comportement, pas le
code tel quel. Les données sont en tête du script : `QUAI`, `PERSO`, `CHAUF`. Les règles : `analyseQuai`,
`analysePerso`, `analyseChauf`.

Contrôlé par Cowork le 04/10/2026 (navigateur sans écran) : les 3 cas × 3 temps s'affichent sans erreur, aucune requête
hors du fichier, fins de ligne LF, envoi à vide deux fois → bilan 0 / 10 jalons.
