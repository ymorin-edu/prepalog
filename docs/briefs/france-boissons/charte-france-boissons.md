# France Boissons : logo et relevé de la charte

Chantier D-E, fait le **09/10/2026** par Claude Code, avec l'accord de Tristan du 05/10/2026
(ENT-6.2 §11). Ce fichier dit d'où vient le logo, ce qui a été **vu** sur le site (VÉRIFIÉ) et ce qui
a été **déduit** (CONSTRUIT), et propose le bloc `THEME` du futur `contenus/france-boissons.js`
(chantier ENT-6.1, non créé ici).

## 1. Le logo

| Fichier | Rôle | Taille | Empreinte SHA-256 |
|---|---|---|---|
| `contenus/trames/logos/france-boissons.svg` | Logo officiel, **copie exacte** du fichier du site (aucun octet changé) | 11 913 octets, 215 × 30 | `65731211946d318ace93c5cd935b69e42ba702fdce07f8900579a62fb72c053f` |
| `contenus/trames/logos/france-boissons.png` | Même logo en image (fond transparent, 645 × 90, RVB + transparence) pour les trames Word/PDF, que `python-docx` ne sait pas lire en SVG | 13 140 octets | `f0e61e9b81872b399ede3a487cde1c8773d8c4d555e0e75ad64e709d70a96d14` |

- **Source** : `https://www.france-boissons.fr/wp-content/themes/france-boissons-rgaa-seo-production/assets/images/Logo_FB.svg`
  (logo de l'en-tête de la page d'accueil `https://www.france-boissons.fr/`), récupéré le **09/10/2026**. Le serveur
  l'annonce modifié le 07/09/2026 (réponse HTTP `Last-Modified`).
- **Reproductible** : `node outils/logo-france-boissons.mjs` refait les deux fichiers (télécharge, écrit, relit, refuse un SVG
  qui contiendrait un script, une adresse ou une image intégrée, affiche les empreintes). Le PNG sort de Chromium (Playwright,
  déjà installé pour la suite de tests) : une autre version de Chromium peut changer l'empreinte du PNG, jamais celle du SVG.
- **Contenu du dessin** : « FRANCE » en brun très foncé (`#483B05`), « BOISSONS » en orange (`#F39200`), trois pastilles vertes
  dessous (`#95C11F`, `#007F2D`, `#00561F`). Dessin seul : aucun texte du fichier, aucune police à charger, aucune image
  intégrée.
- Le logo marche sur **fond clair** seulement (le brun de « FRANCE » disparaît sur un fond sombre : contraste 1,5 avec l'encre
  sombre de Prepalog). Le site propose aussi `Logo_FB-white.svg` (version blanche, non récupérée : pas besoin tant que
  l'écran reste en thème « papier »).
- Les deux fichiers sont cités ici, sous leur nom, parce qu'un test du dépôt refuse tout fichier de `contenus/` cité nulle part.
  Ils seront déclarés dans `ENTREPRISES` (`activites/index.js`) par ENT-6.1.

## 2. Ce qui est VÉRIFIÉ et ce qui est CONSTRUIT

**VÉRIFIÉ (vu sur le site le 09/10/2026)**
- Le SVG est bien celui de l'en-tête de la page d'accueil de `france-boissons.fr` (balise `<img>` de l'en-tête), site dont le
  titre est « Grossiste boissons - Fournisseur depuis 1964 France Boissons ».
- Les couleurs du logo sont celles écrites dans le SVG (liste ci-dessus).
- Le site déclare ses couleurs et sa police dans son CSS : orange principal `#f3971e` (boutons), orange `#e85d00` et vert `#83bb26`
  (palette de l'éditeur de pages), texte `#333333`, police **Lato** (repli : Helvetica Neue, Arial).
- Aucune annonce de changement de logo trouvée par recherche web (deux recherches le 09/10/2026, rien sur une refonte
  d'identité de France Boissons) ; le logo est en ligne sur le site au moment du relevé.

**CONSTRUIT (déduit, à ne pas présenter comme officiel)**
- L'accent proposé `#b34700` n'est **pas** une couleur de France Boissons : c'est l'orange du logo **foncé** pour tenir le contraste
  du texte (voir §3). Il n'existe nulle part sur le site.
- Que le site soit « la version en vigueur » est une déduction (logo en ligne aujourd'hui, pas de refonte annoncée) ; aucun kit
  média ni espace presse n'a été consulté (le site n'en expose pas de façon évidente).
- La police Lato n'est **pas** embarquée (règle « aucune requête hors du domaine » : une police va dans `styles/polices/`, avec
  sa licence, et ce n'est pas demandé ici). Prepalog garde sa police : l'écran de l'entreprise ne ressemblera pas au site sur ce point.

## 3. Couleurs et contrastes

| Couleur | Hex | Origine | Blanc dessus | Sur le papier de Prepalog (`#f4f1ea`) |
|---|---|---|---|---|
| Orange du logo | `#F39200` | VÉRIFIÉ (SVG) | **2,35 : insuffisant** | 2,09 : insuffisant en texte |
| Orange des boutons du site | `#F3971E` | VÉRIFIÉ (CSS) | 2,27 : insuffisant | |
| Orange `#E85D00` (palette du site) | `#E85D00` | VÉRIFIÉ (CSS) | 3,50 : insuffisant | 3,10 |
| **Orange foncé proposé** | **`#B34700`** | CONSTRUIT | **5,50** | **4,88** |
| Vert du logo (pastille moyenne) | `#007F2D` | VÉRIFIÉ (SVG) | 5,16 | |
| Brun de « FRANCE » | `#483B05` | VÉRIFIÉ (SVG) | 11,03 | |
| `--vert` de Prepalog (« juste ») | `#0B7A41` | `styles/base.css` | 5,42 | |

Pourquoi une teinte foncée : l'accent de l'entreprise sert à la fois de **fond de bandeau et de boutons** (texte blanc dessus) et de
**couleur de texte et de trait** sur le papier. Il lui faut donc 4,5 au moins dans les deux cas. L'orange du logo est trop clair
pour ça ; le logo, lui, garde ses vraies couleurs (il est une image).

**Rouge ou vert ?** `accentRougeOuVert('#b34700')` rend `false` (essayé dans `core/types/entreprise-theme.js`) : teinte 24°,
au-dessus de la limite rouge (20°) et loin du vert (75° à 170°). Le moteur **garde** donc l'orange dans la zone où l'élève
travaille, il ne le remplace pas par l'encre. Même réponse pour `#F39200` et `#E85D00`. Attention : 24° est à 4° de la limite
du rouge ; si on le fonçait ou le rougissait encore, il basculerait et deviendrait de l'encre dans la zone de travail.

**Distinct du « juste » ?** Oui : accent `#B34700` (orange brûlé, teinte 24°) contre `--vert` `#0B7A41` (vert, teinte 149°), deux
familles de couleurs éloignées, qui ne se confondent pas à l'écran. Deux voisins à garder en tête : `--terre` (`#9C620A`,
ambre, teinte 36°) est moins rouge que l'accent mais du même registre chaud (ne pas poser les deux côte à côte pour dire deux
choses), et `--rouge` (`#9D2727`, le « faux ») est plus sombre et plus rouge. Les **trois pastilles vertes du logo** (`#007F2D`
et `#00561F` surtout) ressemblent au vert « juste » : sans conséquence dans le bandeau, mais ne pas les agrandir ni les
détourner en repère de réussite.

## 4. Bloc `THEME` proposé pour `contenus/france-boissons.js`

```js
// Charte France Boissons (relevé du 09/10/2026, docs/briefs/france-boissons/charte-france-boissons.md).
// L'orange du logo (#F39200) est trop clair pour porter du texte : l'accent est cet orange FONCÉ (5,50 avec du blanc,
// 4,88 sur le papier). Le logo garde ses vraies couleurs. Orange (teinte 24°) : le moteur le garde dans la zone de travail.
// Papier imposé : le brun de « FRANCE » disparaîtrait sur fond sombre.
export const THEME = { accent: '#b34700', surAccent: '#ffffff', papier: true };
```

`surAccent: '#ffffff'` est la valeur par défaut du moteur : on peut l'omettre (`{ accent: '#b34700', papier: true }`,
comme Picard et Smoby). Le logo se déclare dans `ENTREPRISES` : `logo: './contenus/trames/logos/france-boissons.svg'`
(`picard` et `smoby` pointent aussi leur SVG ; le PNG sert aux trames).

## 5. Réserves

- **Droit d'usage** : c'est la marque d'une entreprise réelle. Usage pédagogique interne, comme les autres logos du dépôt ; aucune
  autorisation écrite de France Boissons n'a été demandée (décision de Tristan du 05/10 : « logo seul, aucune autre image »).
- **Sourcé sur le site, pas sur un kit média** : si un jour le logo change, relancer `node outils/logo-france-boissons.mjs`
  (le SVG est écrit tel quel, le PNG refait) et recontrôler les contrastes du §3.
- **À valider par Tristan à l'écran** : l'orange foncé `#B34700` est un **choix de lisibilité**, pas la couleur du site. S'il
  préfère l'orange vif de la marque, il faudra une encre foncée sur le bandeau et accepter que le texte orange sur le papier reste
  en dessous de 4,5 : à éviter.
