# Picard — fichiers de référence pour Claude Code (déposés par Cowork le 03/10/2026)

Ce dossier n'est **pas servi aux élèves** : c'est la matière première des briefs Picard.
Claude Code **copie** ce dont la séance a besoin vers `contenus/` (jamais de lien vers `docs/`
depuis le site), avec la ligne de licence.

| Fichier | Quoi | Source / licence | Octets | SHA-256 |
|---|---|---|---|---|
| `maquette-quai-picard.html` | Maquette jouable v8 (un seul fichier, à ouvrir depuis ce dossier) : **la référence d'interaction** pour la vue « quai » et ENT-4.1 | écrite par Cowork | ~70 000 | — |
| `photos/quai-remorques.jpg` | Remorques frigorifiques à quai (étape 1) | [Pexels 27099093](https://www.pexels.com/photo/27099093/), licence Pexels (usage libre, attribution non obligatoire) | 103 863 | `b313d3dfb84e9124f7cf15ff07a0fc3f56b3e1766a3ebcd28290f667053af8e7` |
| `photos/quai-interieur.jpg` | Quai intérieur, porte sectionnelle « 32 » (étape 2) | [Pexels 16924265](https://www.pexels.com/photo/16924265/), licence Pexels | 154 775 | `f28e2e9628ca96521ff79392271cfd4f9981a2deea7fd53fe04a44c15d95276a` |
| `photos/logo-picard.svg` | Logo officiel Picard (flocon + « picard ») | `logo-picard-desktop.svg` du site picard.fr, téléchargé le 03/10/2026 avec l'accord de Tristan ; usage : bandeau de séance et trame (règle « entreprises réelles ») | 6 256 | `40db52e0d88b2a6a371530cf59258c567da5d5c4652467f4bb604d8fa802b0ed` |

**Avant de copier un binaire**, vérifier l'empreinte ci-dessus (alerte n° 10 de `CLAUDE.md`).
Aucune photo ne montre de visage. La chambre froide n'a pas de photo libre crédible : elle est dessinée.

## Couleurs relevées sur picard.fr (03/10/2026)

| Rôle | Valeur | Où |
|---|---|---|
| Accent (titres, boutons, liens) | `#0011AC` | couleur d'interface la plus fréquente du site |
| Bleu du logo | `#000BF7` | `fill` du SVG |
| Bleu très pâle | `#E5F4F6` | fonds du site → fond « glacier » `#EEF5F7` de la maquette (pas de blanc pur) |
| Texte | `#212529` | corps du site |

Thème sombre de la maquette : accent `#9AA6FF`. Le vert « juste » reste celui de Prepalog, distinct du bleu.
Contrastes à vérifier dans le site (≥ 4,5) — non mesurés par Cowork.
