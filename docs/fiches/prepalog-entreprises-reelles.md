> *Copie du 02/10/2026 de la fiche `claude/prepalog-entreprises-reelles.md` du projet Claude
> PREPALOG (source de conception : le projet). Voir `docs/LISEZMOI.md`. Dans cette copie, le
> « navigateur » de la règle des logos désigne l'accès au navigateur de l'outil qui travaille
> (Cowork ou Claude Code), avec l'accord de Tristan.*

# Prepalog — les entreprises réelles dans les contenus (règle du 01/10/2026, révisée le soir)

**Cette règle remplace celle appliquée à TAB-4 le matin du 01/10.** La version précédente
refusait toute entreprise réelle dans un contenu ; elle était trop large et faisait perdre ce
que Tristan cherche. Toute session future applique celle-ci, pas l'ancienne.

## Ce que Tristan demande, et pourquoi

Ses prochains scénarios doivent porter sur des **entreprises réelles**, parce que c'est
déterminant pour la compréhension des élèves : un élève qui lit « Stockaval » ne voit rien, un
élève qui lit le nom d'une enseigne qu'il connaît — ou chez qui il partira en PFMP — sait déjà
de quoi on parle. C'est une demande pédagogique, pas un détail de présentation.

Entreprises déjà citées par Tristan, à vérifier avant usage (secteur, implantation, documents) :

| Entreprise | Usage | État |
|---|---|---|
| **Spartoo** | environnement Logisim `ENT-1.x` | en production |
| **Boost**, à Nîmes | environnement `ENT-3.x`, C2.4 et C2.6 | vérifiée le 01/10, maquette faite |
| **Sagenta** | produits dangereux (ADR, étiquetage) | à vérifier |

Il en donnera d'autres. Ne pas en inventer à sa place ; lui demander.

## Les trois niveaux, dont un seul est fermé

### 1. L'entreprise réelle comme contexte et comme sujet — oui, largement

Le nom, le secteur, les implantations réelles, les gammes réelles, l'organisation, les volumes
publiés. « Vous êtes préparateur de commandes sur la plateforme de… ». C'est déjà ce que fait
**Spartoo** dans Logisim (`ENT-1`), et ça marche.

Mieux : **aller chercher les données réelles** par recherche web plutôt que les inventer. Les
références, les unités de conditionnement, les flux d'une vraie enseigne sont plus parlants et
plus riches à exploiter qu'un catalogue inventé. C'est un travail de recherche à faire *avant*
d'écrire le contenu (ordre des opérations habituel).

### 2. Les documents au nom de l'entreprise réelle — oui, en reconstitution assumée

Un BL, un bon de transport, un bon de préparation, une fiche de stock peuvent porter le nom de
l'enseigne, avec la **mention en pied de document** : « Document pédagogique — reconstitution,
non contractuel ». C'est elle qui fait la différence entre une reconstitution et un faux.

### 3. Le document fabriqué pour passer pour authentique — non

En-tête imité à l'identique, aucune mention, conçu pour qu'on le prenne pour un vrai. C'est un
faux document commercial au nom d'une société qui existe.

Si Tristan redemande « est-ce qu'on peut le faire passer pour un vrai », la réponse est le
niveau 2 : la mention en pied coûte une ligne et ne retire rien au travail de l'élève.

## Le logo : la question s'est posée, voici la vraie ligne

**Formulation corrigée le 01/10 au soir.** Une première rédaction disait « aucun logo » comme
règle générale. **C'est faux, et ça contredisait le dépôt** : `contenus/trames/logos/spartoo.jpg`
est le vrai logo Spartoo, imprimé sur la trame élève, en production. Tristan l'a relevé.

La ligne ne porte pas sur le logo mais sur **le support où il est posé** :

| Support | Logo réel | Pourquoi |
|---|---|---|
| Trame élève, couverture, fiche, diapo | **oui** | il identifie le sujet de la séance, comme dans un manuel |
| Bandeau du module immersif | **oui** | il dit dans quelle entreprise l'élève travaille |
| Document commercial fabriqué (BL, facture, bon de transport) | **non** | là, il ne dit plus « ça parle d'eux » mais « ils ont émis ce papier » |

Autrement dit : le logo sur la couverture de la trame, oui ; le logo en en-tête du bon de
livraison que l'élève remplit, non — la mention en pied y suffit.

La compétence `scenario-excel-bac-pro-logistique` de Tristan dit déjà « logo réel » : cette
formulation est cohérente avec elle.

### D'où vient le fichier

**Claude ne sait ni dessiner ni reconstituer un logo.** Le fichier Spartoo est dans le dépôt
parce qu'il existait déjà. Pour une entreprise neuve, il faut **le vrai fichier** : soit Tristan
le dépose dans un dossier connecté, soit Claude va le chercher au navigateur, avec son accord
au téléchargement. En attendant, un pictogramme générique tient la place — et on le dit, pour que
personne ne le prenne pour une proposition.

## Le gisement d'authentique à 100 %

Beaucoup de documents du métier **sont réels et libres**, parce qu'ils ne sont propres à aucune
entreprise. Les utiliser tels quels, c'est de l'authentique sans aucune réserve, et c'est au
programme :

- la **lettre de voiture CMR** et la lettre de voiture nationale ;
- les **Cerfa** (déclarations, transport) ;
- les **Incoterms 2020** ;
- l'**étiquette logistique GS1** et son SSCC ;
- le **certificat EUR.1** ;
- pour Sagenta et les produits dangereux : les **pictogrammes et classes ADR**, les
  **étiquettes CLP**, la **FDS** — formats normalisés, donc reproductibles à l'identique.

À privilégier chaque fois qu'un document normalisé existe : c'est plus vrai qu'une
reconstitution, et il n'y a rien à justifier.

## Ce que la nouvelle règle ne change pas

- **TAB-4 garde Stockaval, La Caisse à Outils et Transports Cévennes.** Ne pas le refaire :
  le module est fini, testé, en production. Les entreprises réelles sont pour les contenus
  **neufs**. Si Tristan veut le reprendre un jour, le nom de l'entreprise et du fournisseur
  est une seule valeur dans `outils/tab4-donnees.json`.
- **Le réalisme vient toujours de la structure du document**, pas du nom. Le raisonnement sur
  le bon de livraison de TAB-4 — numéro, date et heure, numéro de commande, expéditeur et
  destinataire en vis-à-vis, colonnes commandé/livré, cadre des réserves à signer — reste
  entièrement valable, et aucune de ces mentions n'est légalement obligatoire. Détail dans
  `claude/prepalog-tab4.md` (fiche restée dans le projet).

## Une décision que ça débloque

`claude/prepalog-images-spartoo.md` laissait ouverte une question : garder les **marques
réelles** du catalogue (Nike et autres) ou les renommer en fictif. Sous cette règle, **les
garder est acceptable** : nommer une marque pour désigner un produit est un usage normal. Ce
qui reste exclu, c'est une photo où un logo de marque s'étale en gros plan sur un produit
inventé — Pexels l'interdit explicitement dans sa licence. Les cinq silhouettes SVG dessinées
sont des formes génériques par catégorie, donc compatibles telles quelles.

## Le réflexe à garder

Avant d'écrire un contenu avec une entreprise réelle :

1. **vérifier l'entreprise** par recherche web — qu'elle existe bien, son secteur, son
   implantation, ses documents ; ne pas écrire un scénario sur une entreprise supposée ;
2. **chercher ses données réelles** avant d'en inventer, et **dire dans le livrable ce qui est
   vérifié et ce qui est construit** (fait pour Boost, dans la maquette du 01/10) ;
3. **mettre la mention en pied** de chaque document reconstitué ;
4. **le logo sur le support de cours, pas sur le document fabriqué** (voir plus haut) ;
5. préférer le **document normalisé réel** quand il en existe un.
