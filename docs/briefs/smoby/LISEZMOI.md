# Smoby (S1 de la 2de) — fichiers de référence pour Claude Code (déposés par Cowork le 04/10/2026)

Ce dossier n'est **pas servi aux élèves** : c'est la matière première des briefs `ENT-5.x`. Claude Code **copie** ce dont
une séance a besoin vers `contenus/` (jamais de lien vers `docs/` depuis le site), avec la ligne de licence.

| Fichier | Quoi | Source / licence | Octets | SHA-256 |
|---|---|---|---|---|
| `logo-smoby.svg` | Logo officiel Smoby (lettres jaune / rouge / bleu, contour noir) | `smoby_logo.svg` de smoby.com (`/build/img/svg/smoby_logo.svg`), récupéré le 04/10/2026 **avec l'accord de Tristan** ; usage : bandeau de séance, ligne `ENTREPRISES` n° 5, trames | 10 789 (original, voir ⚠) | `c93a59bf389f73f2019e29540de5be53de0187e7bca4ed7ffa28ad02d6993b25` |
| `quai-remorques.jpg` | Trois semi-remorques fourgons (non frigorifiques) à quai, ciel bleu : **arrivée du camion** (ENT-5.3, étape 1) | [Pexels 1267325](https://www.pexels.com/photo/three-white-enclosed-trailers-1267325/), licence Pexels ; **retouchée par Cowork** : nom et logos du transporteur réel (« Cascade »), numéros de remorque et badges du fabricant **effacés** | 149 910 | `c8fa000b3db69bb14b757de6ad4c068b98f242e17b0b7e697df67863fa996e97` |
| `quai-exterieur.jpg` | Quai vu de l'extérieur : portes à quai jaunes avec sas, niveleurs, butoirs, cartons au sol : **étape « Avant de décharger »** (ENT-5.3) | [Pexels 12585837](https://www.pexels.com/photo/cartons-near-warehouse-gates-12585837/), BOOM Photography, licence Pexels, non retouchée | 94 730 | `c684776baedeb1561d7e9855e9f40bbbcdb8209099bfde8b4537ac0ef4cb3e05` |
| `quai-interieur.jpg` | Quai vu de l'intérieur, **porte ouverte sur une remorque**, un cariste **de dos** (casque, gilet) au chariot frontal dans la remorque, palettes au fond : **déchargement** (ENT-5.3, étapes 2-3) | [Pexels 1267327](https://www.pexels.com/photo/pathway-for-forklifts-1267327/), licence Pexels ; **retouchée par Cowork** : marque du chariot, marque des commandes de quai, étiquettes de bière sur les palettes, bouteille « Drink beer », carton de marque et écritures des tableaux blancs **effacées ou floutées** | 196 780 | `9f0b3657c044b4bf78bd5096b9ad939aebf5083ece0e1b74e0b0e1eeb724a9f5` |
| `exemple-cv-A1.html` | Deux des cinq CV d'ENT-5.1 (format validé par Tristan) | écrit par Cowork | — | — |

**Avant de copier un binaire**, vérifier l'empreinte (alerte n° 10 de `CLAUDE.md`). Aucune photo ne montre de visage ; aucune
marque réelle ne reste lisible (vérifié à l'œil par Cowork, zoom × 2).

⚠ **Le logo est modifié par le pont de fichiers de Cowork** (vérifié le 04/10) : à l'écriture, il ajoute un bloc de
provenance (`xmlns:c2pa="http://c2pa.org/manifest"` dans la balise `<svg>` et un `<metadata><c2pa:manifest>…</c2pa:manifest></metadata>`)
→ 18 563 octets au lieu de 10 789. **Avant de copier le logo dans `contenus/`** : retirer cet attribut et ce bloc
(l'empreinte redevient exactement `c93a59bf…3b25`, vérifié par Cowork), ou retélécharger le fichier depuis smoby.com et
vérifier l'empreinte. `logo-smoby.svg.txt` est un doublon d'essai (même problème) : **à supprimer**. Les JPEG arrivent
intacts (empreintes vérifiées sur le disque).

✅ **Nettoyé par Claude Code le 04/10/2026** : le même bloc de provenance (segment APP11 C2PA, 5 771 octets) avait aussi été
ajouté à `quai-remorques.jpg` et `quai-interieur.jpg`. Bloc retiré des trois fichiers (logo compris), rien d'autre touché :
les quatre empreintes du tableau correspondent maintenant exactement. Doublon `logo-smoby.svg.txt` supprimé.

**Pour l'animation du déchargement** : la photo intérieure montre la porte **déjà ouverte** et un cariste au chariot dans
la remorque : c'est exactement la scène d'ENT-5.3 (« Yanis décharge au chariot »). Proposition : s'en servir comme **décor
fixe** de l'étape 2 (les palettes sortent une à une, dessinées comme au quai Picard, depuis l'ouverture de la porte) au lieu
de l'animation « porte qui se lève » ; ou, si c'est plus simple, garder l'animation sur la photo intérieure de Picard. À
trancher par Claude Code au lot 4 de `MOTEUR-2de-S1.md` et à dire au compte rendu. **Le quai de Smoby s'appelle quai 2.**

## Couleurs du logo (relevées dans le SVG)

| Rôle | Valeur | Contraste sur le fond papier `#FDFBF7` |
|---|---|---|
| Jaune « S », « b » | `#FFED00` | décor seulement |
| Rouge « m », « y » | `#E3000B` | 4,76 : texte possible, mais **le rouge est réservé au « faux »** dans Prepalog → pas d'accent rouge |
| Bleu « o » | `#0095DB` | **3,21 : trop faible pour du texte** |
| Accent proposé (bleu Smoby assombri) | `#006FA6` | 5,31 : titres, boutons, liens |

Le vert « juste » de Prepalog reste distinct du bleu. Fond : papier de Prepalog (décision prise pour Picard).
