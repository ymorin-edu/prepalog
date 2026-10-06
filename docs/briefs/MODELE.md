# Brief de séance — <CODE> <Titre court>

> Copier ce fichier en `docs/briefs/<CODE>-<nom>.md` (ex. `ENT-3.3-boost-erreur-induite.md`).
> Écrit par Cowork (conception), lu et complété par Claude Code (construction).
> **Ne rien inventer** : ce qui n'est pas décidé va dans « Questions ouvertes ».

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : JJ/MM/AAAA
**Conversation d'origine** : *(lien ou titre, facultatif)*

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-x.y |
| `id` (jamais modifié ensuite) | `nom-en-minuscules` |
| Titre / desc | |
| Rubrique | simulog |
| Entreprise | *(réelle, vérifiée : voir §2)* |
| Niveau(x) | 2de / 1re / Tle / CAP |
| Compétence(s) | ex. C2.4 |
| Temps pédagogique | guidage / entraînement / erreur induite / évaluation |
| Notation | note sur 20 (jalons + note) / copie rendue (`meta.copie`) |
| Barème | |
| `pret` à la livraison | false → true après validation de Tristan |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié par recherche web** (avec la source et la date) :
- **Construit** (données internes plausibles, non publiques) :
- **Logo** : fichier fourni / à récupérer (accord de Tristan) ; support autorisé : trame, bandeau.
- **Documents reconstitués** : mention en pied « Document pédagogique — reconstitution, non contractuel ».
- **À vérifier avant d'écrire** :

## 3. Objectif pédagogique

Ce que l'élève sait faire à la fin, en une ou deux phrases. Pourquoi ce temps pédagogique
(prérequis, séance précédente, séance suivante).

## 4. Déroulé

Écran par écran, dans l'ordre : ce que l'élève voit, ce qu'il fait, ce qui est corrigé et quand.
Vues du moteur utilisées (plan, tournée, feuille de calcul, inventaire, messagerie, documents…).

## 5. Jalons / notation

| # | Jalon | Ce qu'il lit dans la base de l'élève | Piège à éviter |
|---|---|---|---|
| 1 | | | ne doit pas accuser avant que l'élève ait commencé ; ne doit pas récompenser l'inaction |

## 6. Contenu (données)

Fichier(s) à créer : `contenus/<entreprise>*.js`. Données de départ, valeurs attendues
(**recalculées par le code, jamais recopiées** ; dans un test, écrites à la main).

## 7. Demandes au moteur (si le moteur ne sait pas faire)

Ce dont la séance a besoin et que `core/` ne fait pas encore. **Une séance n'écrit rien dans
`core/` ni `styles/base.css` : elle liste ici sa demande**, et un chantier moteur dédié s'en charge.

### 7 bis. Séance déjà jouée par des élèves ? (règle de Tristan du 06/10/2026)

Si le brief **modifie une séance déjà ouverte** : les élèves qui l'ont **finie gardent leur note** et leur travail (score,
photo de fin de séance, séance suivante ouverte). Dire ici ce qui arrive aux élèves **en cours**, et comment c'est testé.

## 8. Tests attendus

Bloc concerné : `outils/test/<bloc>.mjs`. Cas à couvrir, y compris ceux qui doivent échouer
(sabotages).

## 9. Supports pour les élèves

- Trame élève (Word/PDF) : oui/non, générateur `outils/trame-*.py`
- Corrigé : `contenus/corriges/<code>.js`
- Diaporama / fiche enseignant : oui/non

## 10. Critères de validation par Tristan

Ce qu'il doit voir à l'écran pour dire « c'est bon » (page d'essai, parcours à jouer).

## 11. Questions ouvertes

- [ ]

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** : *(hash + message)*
- **Reste ouvert** :
