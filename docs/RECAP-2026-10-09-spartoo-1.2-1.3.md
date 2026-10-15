# Reprise : refonte Spartoo ENT-1.2 et ENT-1.3 — écrit le 09/10/2026 (Cowork) pour la conversation suivante

> Page de relais entre la conversation de conception (Cowork) et celle de construction (Claude Code).
> Les briefs font foi ; cette page dit où on en est, dans quel ordre construire et ce qu'il faut demander à Tristan d'abord.

## Où on en est

- **Briefs** (non commités, écrits par Cowork) : `docs/briefs/ENT-1.2-spartoo-poste-rfid.md` et
  `docs/briefs/ENT-1.3-spartoo-isoler-le-lot.md`.
- **Maquette du poste RFID VALIDÉE par Tristan le 09/10/2026** : `docs/briefs/spartoo/maquette-poste-rfid-1.2.html`
  (copie dans `G:\Mon Drive\Travail\Logistique\1L\Claude outputs`). Elle fait foi pour le rendu et l'interaction ;
  le code est jetable. Validées avec elle : le **manque se signale sur place** (bouton dans l'emplacement ouvert),
  et **un bac vide est toujours refusé** par le tunnel.
- **Décisions de Tristan (09/10)** : 1.2 = vue nouvelle « poste de préparation RFID » ; 1.3 = isoler les boîtes avec
  la fiche existante ; fil conducteur 1.1 → 1.2 → 1.3 (la 1.3 remonte les commandes que l'élève a préparées en 1.2).
- **Rien n'est écrit dans le code.** Les trois fichiers ci-dessus et cette page sont à commiter par la conversation
  suivante (par leur nom), avec une ligne dans `docs/decisions.md`, **pas avant que la session D-1 ait fini** (voir plus bas).

## ⚠ À vérifier avant d'écrire quoi que ce soit

1. **`docs/EN-COURS.md`** : le 09/10 au soir, la session **« D-1 messagerie Transférer à… puis ENT-6.1 France Boissons »**
   y était inscrite. Elle touche `core/types/entreprise.js`, `core/types/questions.js`, `activites/FICHE-SEANCE.md`,
   `activites/index.js`, `docs/decisions.md`, `docs/chantiers.md`. Or la refonte Spartoo touchera `entreprise.js`
   (option `preparation: 'poste'`, brief 1.2 §7.3) et `FICHE-SEANCE.md`. **Règle : un seul chantier moteur à la fois.**
   Tant que D-1 est inscrite, ne rien écrire dans ces fichiers.
2. **Ordre de la feuille de route** (`docs/chantiers.md`, lot D) : France Boissons passe en premier. **Demander à
   Tristan où placer la refonte Spartoo** : après le lot D ? ou intercalée (et alors avant ou après ENT-6.1) ?
3. **Fins de ligne** : `docs/briefs/ENT-1.2-spartoo-poste-rfid.md` est revenu en CRLF sur le poste le 09/10 au soir (le
   contenu n'avait pas changé). La version déposée avec cette page est en LF ; vérifier `git diff` avant de commiter.

## Questions à poser à Tristan au début (une à la fois, avec la proposition de Cowork)

| # | Question | Proposition de Cowork |
|---|---|---|
| 1 | Élèves **en cours** sur l'ancienne 1.2 / 1.3 : passent-ils à la nouvelle ? | Oui, sans remise à zéro de la base ; ceux qui ont **fini** gardent leur note (règle du 06/10) |
| 2 | Mode `CHR` « Chronopost Express » (non cité par les sources sur Toolog) | Le garder comme mode express construit, dit « construit » dans l'avertissement |
| 3 | Écran **Clients** dans le menu de 1.2 | Le retirer (il ne servait qu'à une lecture) |
| 4 | Adresses des emplacements | Garder `v.loc` du catalogue (forme `B-01-1`), comme la maquette |
| 5 | Texte de loi joint à la question « rupture » | Sans texte joint tant que Cowork ne l'a pas vérifié sur Légifrance (question métier) |
| 6 | Nadia, cheffe d'équipe (personnage construit) | Nom gardé |
| 7 | 1.3 : compte rendu par **fiche** au lieu du mail | Fiche seule |
| 8 | 1.3 : bandeau « Parcours Spartoo terminé ✓ » | Oui |
| 9 | 1.3 : la question « rappel » nomme les clients de l'élève | Oui |

## Ordre de construction (brief 1.2, en tête)

1. Objets du kit iso (`core/iso.js`) : chariot à 3 bacs, bac, boîte à chaussures, rayonnage, tunnel RFID, cartons,
   cage de départ (brief 1.2 §7.2 ; dessins de référence dans la maquette : `chariot()`, `rayon()`, `portique()`, `cage()`).
2. Vue `poste` (`core/types/poste.js`, `styles/poste.css`, page d'essai `outils/essai-poste.html`) — brief 1.2 §7.1.
3. Contenu ENT-1.2 et bases déjà commencées (§6, §7 bis), commandes de la nuit (§6.3, **vérifier d'abord** comment le
   moteur range l'ancien stock dans la sortie « au plus ancien lot »).
4. ENT-1.3 (brief jumeau : deux fiches, volet `tracabilite-2`, filets).
5. Validation de Tristan **en local** avant tout push (séances ouvertes, site en mode réel), puis trames réduites (Cowork).

**Modèle** : Opus pour les étapes 1 et 2 (vue nouvelle du moteur) ; Sonnet pour 3 à 5.
**Durée** : à annoncer au début ; la vue et ses tests sont le gros morceau (plusieurs heures, en plusieurs fois).

## Message d'ouverture à coller dans la conversation suivante (Claude Code)

```
Lis CLAUDE.md, puis docs/RECAP-2026-10-09-spartoo-1.2-1.3.md, et les briefs
docs/briefs/ENT-1.2-spartoo-poste-rfid.md et ENT-1.3-spartoo-isoler-le-lot.md.
La maquette docs/briefs/spartoo/maquette-poste-rfid-1.2.html est validée.
Vérifie docs/EN-COURS.md et git status, dis-moi si une autre session bloque,
pose-moi les questions de la page de reprise une à la fois, puis annonce la durée
et commence par le kit iso. Ne pousse rien avant ma validation en local.
```
