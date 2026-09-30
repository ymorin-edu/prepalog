# Prepalog

Plateforme d'activités pour la famille des métiers GATL. Multi-enseignants : chacun ses
groupes, cloisonnés. Les activités s'autocorrigent et remontent automatiquement dans le
suivi de classe.

## Démarrer

Ouvrez `index.html` par un petit serveur local (les modules ES ne se chargent pas en
`file://`) :

```
python -m http.server 8000
```

puis http://localhost:8000. Sans fichier de configuration, le site démarre en **mode
démonstration** : tout est enregistré dans le navigateur, aucune connexion réseau. C'est le
mode à utiliser pour développer et tester.

## Passer en mode réel

Copiez `prepalog-config.exemple.json` en `prepalog-config.json` et renseignez la
configuration Firebase du projet ainsi que la liste des super-administrateurs (les adresses
Google autorisées à créer le premier compte enseignant).

Ce fichier n'est pas versionné : il est délibérément séparé du code pour survivre aux
mises à jour.

Dans la console Firebase :

1. Activer **Authentication** → Google, et E-mail/mot de passe (les élèves se connectent
   par matricule, transformé en adresse interne `matricule@prepalog.local`).
2. Activer **Cloud Firestore** et **Realtime Database**.
3. Coller `firestore.rules` et `database.rules.json` dans leurs onglets de règles respectifs.

## Ajouter une activité

1. Créer `activites/mon-activite.js` :

```js
import { creerQCM, sceller } from '../core/types/qcm.js';

export const meta = {
  id: 'ent2', code: 'ENT-2', titre: 'Mon activité',
  desc: 'Une phrase de présentation.',
  rubrique: 'quiz',     // doit exister dans activites/index.js
  bareme: 10,           // présence d'un barème = apparaît dans le suivi de classe
  portee: 'eleve',      // 'eleve' | 'equipe' | 'groupe' | 'commun'
  pret: true,
};

const moteur = creerQCM({ questions: sceller([ /* ... */ ]) });
export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
```

2. Ajouter une ligne dans `activites/index.js`.

C'est tout : l'accueil, les droits, la sauvegarde du score, l'export CSV et le suivi de
classe suivent automatiquement.

## Les portées de jeu de données

| Portée | Où vivent les données | Usage |
|---|---|---|
| `eleve` | Firestore, document privé | chacun sa base |
| `equipe` | Realtime Database | binôme, îlot |
| `groupe` | Realtime Database | base commune à la classe |
| `commun` | Realtime Database | référentiel partagé entre tous les groupes |

Changer de portée = changer un mot dans `meta`. Le reste du code de l'activité est
identique.

Pour une activité à tables (type `tableau`), déclarez `tables` dans `meta` et exportez
éventuellement `graines` : l'enseignant pourra installer ce contenu de départ en un clic
depuis « Conduite de séance ».

## Types d'activité disponibles

- `core/types/qcm.js` — choix unique ou multiple, réponses scellées par empreinte
- `core/types/tableau.js` — base de données à tables liées, quelle que soit la portée

## Conduite de séance

Depuis l'espace enseignant : ouvrir ou fermer une activité pour le groupe, semer le contenu
de départ, **geler** une base partagée en lecture seule à la fin de l'heure, réinitialiser,
exporter le suivi en CSV.

## Tester

`outils/test.mjs` lance onze vérifications de bout en bout avec Playwright en mode
démonstration : connexion enseignant et élève, création de groupe et de comptes, base
partagée, QCM autocorrigé, suivi de classe.

```
node outils/test.mjs
```

## Limite assumée

L'autocorrection a lieu dans le navigateur : les corrigés sont techniquement accessibles à
qui sait ouvrir les outils de développement. Les réponses de QCM sont stockées sous forme
d'empreinte, ce qui décourage la curiosité ordinaire, mais l'outil reste **formatif**. Toute
évaluation notée doit rester sur support surveillé.

## Hébergement

GitHub Pages, branche `main`, racine. Le fichier `.nojekyll` évite tout traitement Jekyll.
Aucune étape de compilation : ce qui est dans le dépôt est ce qui est servi.
