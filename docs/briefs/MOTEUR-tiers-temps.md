# Brief de chantier — MOTEUR : tiers-temps réglé par élève

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md puis implémente le brief docs/briefs/MOTEUR-tiers-temps.md. Annonce la durée, dis-moi si les règles Firebase doivent changer avant de coder.
> ```

**Statut** : à implémenter
**Date du brief** : 03/10/2026
**Modèle** : Sonnet (petit chantier) — sauf si les règles Firebase changent (alors le dire, alerte 1).
**Durée estimée par Cowork** : 1 à 2 h.

## 1. Décision de Tristan (03/10/2026)

**Le tiers-temps se règle élève par élève, une fois pour toutes, par l'enseignant** (pas une case cochée par l'élève).
Toute épreuve chronométrée en tient compte : durée × 4/3. Première utilisatrice : la vue quai (ENT-4.4) ; resservira
à toute évaluation chronométrée.

## 2. À construire

- Côté enseignant : une case « Tiers-temps » sur la fiche de l'élève (là où l'enseignant gère ses élèves).
- Stockage : un booléen dans le profil de l'élève (mode réel) et dans le stockage local (mode démonstration).
- `ctx.tiersTemps` (booléen) transmis à `rendre(hote, ctx)` ; une ligne dans `activites/FICHE-SEANCE.md`.
- La vue qui chronomètre applique ×4/3 **aux seuils de rapidité** (le chrono mesure, il ne coupe pas : décision du
  03/10) et l'**affiche** à l'élève (« tiers-temps : seuils × 4/3 »).

## 3. Points d'attention

- **Données de santé indirectes** : le tiers-temps révèle un aménagement (PAP, PPS). Ne l'afficher **qu'à l'élève
  concerné et à ses enseignants**, jamais dans une vue de classe projetable ; ne pas l'exporter. Le dire à Tristan.
- Si le champ vit dans un document que l'élève peut écrire, il pourrait se l'accorder lui-même : **règles Firebase à
  vérifier** (seul l'enseignant écrit ce champ) ; toute modification de règle se **publie dans la console** (alerte 1).
- Les règles ne doivent jamais supposer que le champ existe (`.get('tiersTemps', false)`).

## 4. Tests

Mode démonstration : case cochée → `ctx.tiersTemps === true` dans une séance ; non cochée → `false` ; un élève
ne peut pas modifier sa propre case. Émulateur de règles si elles changent (`outils\tester-regles.bat`).

## 5. Questions ouvertes

- [x] Où exactement sur la fiche élève : **Claude Code choisit** (tranché le 03/10/2026) ; Tristan juge à l'écran.
- [ ] Faut-il d'autres aménagements plus tard (police agrandie, lecture audio) ? Ne pas les construire, ne pas fermer la porte.

---

## Compte rendu *(rempli par Claude Code)*

- **Fichiers créés / modifiés** :
- **Règles Firebase** : modifiées ? publiées ?
- **Tests** :
- **Commits** :
