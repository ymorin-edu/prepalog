// Tests des règles de sécurité de Prepalog, contre l'émulateur Firebase.
//
// Pourquoi ce fichier existe : les 46 tests de `outils/test.mjs` tournent en mode
// démonstration, où aucune règle n'est évaluée. Les règles n'avaient donc JAMAIS été
// éprouvées avant le 30/09/2026, et la mise en service a échoué quatre fois de suite sur
// des refus dont la cause était invisible depuis le navigateur. L'émulateur tranche en
// quelques secondes ce qu'un aller-retour console/navigateur met dix minutes à cerner.
//
// Lancement : double-clic sur `outils/tester-regles.bat`, qui installe ce qu'il faut,
// démarre les deux émulateurs et exécute ce fichier. Rien ne touche le vrai projet :
// l'identifiant `demo-prepalog` fait de ce projet un projet de démonstration, que le SDK
// refuse de joindre en ligne.
//
// Ce que chaque bloc défend est écrit au-dessus de lui. Un test qui ne tomberait pas si on
// remettait le bug qu'il surveille ne prouve rien : la procédure de régression volontaire
// est en fin de fichier.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// --- résolution des paquets -------------------------------------------------------
// Le dépôt n'a pas de package.json et n'en veut pas : aucune étape de compilation, ce qui
// est dans le dépôt est ce qui est servi. Les paquets de test vivent donc à part, dans
// `outils/paquets/`, posés par le .bat. On les charge par `createRequire`, qui remonte les
// `node_modules` depuis le chemin qu'on lui donne — les imports ES, eux, ignorent NODE_PATH.
const BASES = [
  process.env.PREPALOG_PAQUETS,
  path.join(ROOT, 'outils', 'paquets'),
  path.join(ROOT),
  process.env.HOME ? path.join(process.env.HOME, '.npm-global', 'lib') : null,
].filter(Boolean);

let req = null;
for (const base of BASES) {
  const essai = createRequire(path.join(base, 'ancre.js'));
  try { essai.resolve('@firebase/rules-unit-testing'); req = essai; break; } catch (e) {}
}
if (!req) {
  console.error("Paquets introuvables. Lance outils\\tester-regles.bat, qui les installe.");
  console.error('Cherché dans : ' + BASES.join(', '));
  process.exit(2);
}

const { initializeTestEnvironment, assertFails, assertSucceeds } =
  req('@firebase/rules-unit-testing');

// --- configuration ----------------------------------------------------------------
const conf = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase.json'), 'utf8'));
const PORT_FS = conf.emulators.firestore.port;
const PORT_DB = conf.emulators.database.port;
const HOTE = '127.0.0.1';
const PROJET = 'demo-prepalog';

// Les règles RTDB du dépôt portent un bloc `_commentaire` en tête : c'est leur
// documentation, et la console Firebase le refuse au collage. L'émulateur aussi. On le
// retire ici plutôt que d'appauvrir le fichier du dépôt.
function reglesRtdb() {
  const brut = JSON.parse(fs.readFileSync(path.join(ROOT, 'database.rules.json'), 'utf8'));
  delete brut._commentaire;
  return JSON.stringify(brut);
}

let env;
try {
  env = await initializeTestEnvironment({
    projectId: PROJET,
    firestore: {
      host: HOTE, port: PORT_FS,
      rules: fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8'),
    },
    database: { host: HOTE, port: PORT_DB, rules: reglesRtdb() },
  });
} catch (e) {
  // Sans ce garde-fou, l'absence d'émulateur se présente comme une pile d'appels undici
  // parfaitement illisible. Or c'est de loin la panne la plus probable.
  const cause = e.cause?.code || e.message;
  console.error(`\nLes émulateurs ne répondent pas sur ${HOTE}:${PORT_FS} (Firestore) et`);
  console.error(`${HOTE}:${PORT_DB} (Realtime Database) — ${cause}.`);
  console.error('\nCe fichier ne démarre pas les émulateurs lui-même : lance');
  console.error('outils\\tester-regles.bat, qui s\'en charge, ou bien');
  console.error('  firebase emulators:exec --project demo-prepalog --only firestore,database "node outils/test-regles.mjs"');
  process.exit(2);
}

// --- petit harnais, repris de outils/test.mjs -------------------------------------
const ok = [];
const ko = [];
const v = async (nom, fn) => {
  try { await fn(); ok.push(nom); } catch (e) { ko.push(`${nom} → ${e.message.split('\n')[0]}`); }
};

// Contextes. `intrus` n'a aucun profil : c'est n'importe quel compte Google du monde qui
// se serait authentifié sur le site, lequel est public.
const fsDe = (uid) => env.authenticatedContext(uid).firestore();
const dbDe = (uid) => env.authenticatedContext(uid).database();

// =====================================================================================
//  FIRESTORE
// =====================================================================================

await env.clearFirestore();
await env.withSecurityRulesDisabled(async (ctx) => {
  const d = ctx.firestore();
  await d.doc('users/prof1').set({ role: 'prof', nom: 'Morin', groupes: [] });
  await d.doc('users/prof2').set({ role: 'prof', nom: 'Autre', groupes: [] });
  // prof3 n'a NI `groupes` NI rien d'autre que son rôle : c'est le profil incomplet qui a
  // rendu l'espace enseignant inaccessible le 30/09, `profilDe(moi()).groupes` valant null.
  await d.doc('users/prof3').set({ role: 'prof' });
  await d.doc('users/e1').set({ role: 'eleve', nom: 'Emma', matricule: '1001', code: 'ab12', groupes: ['g1'] });
  await d.doc('users/e2').set({ role: 'eleve', nom: 'Léo', matricule: '1002', code: 'cd34', groupes: ['g1'] });
  await d.doc('users/e3').set({ role: 'eleve', nom: 'Zoé', matricule: '1003', code: 'ef56', groupes: ['g2'] });
  await d.doc('groupes/g1').set({ nom: '1L', annee: 2026, profs: ['prof1'] });
  await d.doc('groupes/g2').set({ nom: 'TL', annee: 2026, profs: ['prof2'] });
  await d.doc('groupes/g3').set({ nom: '2L', annee: 2026, profs: ['prof3'] });
  await d.doc('travaux/g1/eleves/e1/activites/qcm1').set({ score: 12, max: 20 });
  await d.doc('prives/e1/jeux/logisim').set({ blob: '{}', rev: 1 });
});

// ---------- 1. le trou du 30/09 : se créer un profil enseignant
// L'authentification Google accepte tout compte Google, et prepalog-config.json est public
// depuis la mise en ligne. Si cette règle laisse passer, n'importe qui sur Terre devient
// enseignant, puis lit les noms, matricules et codes de tous les élèves.
await v("un inconnu ne peut pas se créer un profil enseignant", () =>
  assertFails(fsDe('intrus').doc('users/intrus').set({ role: 'prof', nom: 'Pirate' })));

await v("un élève ne peut pas se promouvoir en créant un profil", () =>
  assertFails(fsDe('e1').doc('users/nouveau').set({ role: 'prof', nom: 'Emma' })));

await v("un enseignant ne crée pas d'autre enseignant", () =>
  assertFails(fsDe('prof1').doc('users/p9').set({ role: 'prof', nom: 'Collègue' })));

await v("un enseignant crée un compte élève", () =>
  assertSucceeds(fsDe('prof1').doc('users/e9').set({ role: 'eleve', nom: 'Nouvelle', groupes: [] })));

await v("un élève ne crée pas de compte élève", () =>
  assertFails(fsDe('e1').doc('users/e8').set({ role: 'eleve', nom: 'Complice', groupes: [] })));

// ---------- 2. le rôle n'est pas modifiable par son porteur
await v("un élève modifie son profil sans toucher au rôle", () =>
  assertSucceeds(fsDe('e1').doc('users/e1').update({ nom: 'Emma D.' })));

await v("un élève ne se promeut pas enseignant", () =>
  assertFails(fsDe('e1').doc('users/e1').update({ role: 'prof' })));

// ---------- 3. lecture des profils
await v("chacun lit son profil", () => assertSucceeds(fsDe('e1').doc('users/e1').get()));

await v("un élève ne lit pas le profil d'un autre", () =>
  assertFails(fsDe('e1').doc('users/e2').get()));

await v("un inconnu ne lit aucun profil d'élève", () =>
  assertFails(fsDe('intrus').doc('users/e1').get()));

// Profil incomplet : `monRole()` passe par `.get('role', '')`. Avec `monProfil().role` sur
// un profil sans le champ, l'évaluation entière échouerait — c'est le troisième refus
// du 30/09. Ce test-là est donc discriminant.
await v("un enseignant au profil incomplet reste enseignant", () =>
  assertSucceeds(fsDe('prof3').doc('users/e1').get()));

// ---------- 4. groupes : la requête de l'espace enseignant
// La règle de `list` s'appuie sur `resource.data` et jamais sur un `get()` du document
// listé : un `get()` par document renvoyé serait inévaluable sur une requête, en plus
// d'être une lecture facturée de plus. C'était le troisième refus du 30/09.
await v("un enseignant liste ses groupes", () =>
  assertSucceeds(fsDe('prof1').collection('groupes').where('profs', 'array-contains', 'prof1').get()));

await v("un enseignant au profil incomplet liste ses groupes", () =>
  assertSucceeds(fsDe('prof3').collection('groupes').where('profs', 'array-contains', 'prof3').get()));

await v("un élève ne liste pas tous les groupes", () =>
  assertFails(fsDe('e1').collection('groupes').get()));

await v("un élève lit le groupe dont il est membre", () =>
  assertSucceeds(fsDe('e1').doc('groupes/g1').get()));

await v("un élève ne lit pas un groupe étranger", () =>
  assertFails(fsDe('e1').doc('groupes/g2').get()));

// ---------- 5. création de groupe : lire un groupe qui n'existe pas
// Quatrième refus du 30/09. L'application lit `groupes/{gid}` AVANT de créer, pour refuser
// un nom déjà pris. Sur un document absent, `resource` vaut null : sans la branche
// `resource == null`, la lecture échoue et aucun groupe ne peut jamais être créé.
// Discriminant : le résultat attendu est « autorisé ».
await v("lire un groupe inexistant est permis", () =>
  assertSucceeds(fsDe('prof1').doc('groupes/pasencore').get()));

await v("un enseignant crée un groupe où il figure", () =>
  assertSucceeds(fsDe('prof1').doc('groupes/g9').set({ nom: '1M', annee: 2026, profs: ['prof1'] })));

await v("un enseignant ne crée pas un groupe sans s'y mettre", () =>
  assertFails(fsDe('prof1').doc('groupes/g8').set({ nom: '1N', annee: 2026, profs: ['prof2'] })));

await v("un élève ne crée pas de groupe", () =>
  assertFails(fsDe('e1').doc('groupes/g7').set({ nom: '1P', annee: 2026, profs: ['e1'] })));

await v("un enseignant ne modifie pas le groupe d'un collègue", () =>
  assertFails(fsDe('prof1').doc('groupes/g2').update({ nom: 'détourné' })));

await v("un enseignant supprime son groupe", () =>
  assertSucceeds(fsDe('prof1').doc('groupes/g9').delete()));

// ---------- 6. travaux : cloisonnement
await v("un élève écrit ses résultats dans son groupe", () =>
  assertSucceeds(fsDe('e1').doc('travaux/g1/eleves/e1/activites/qcm2').set({ score: 15, max: 20 })));

await v("un élève n'écrit pas les résultats d'un autre", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e2/activites/qcm2').set({ score: 20, max: 20 })));

await v("un élève n'écrit pas dans un groupe étranger", () =>
  assertFails(fsDe('e3').doc('travaux/g1/eleves/e3/activites/qcm2').set({ score: 20, max: 20 })));

await v("l'enseignant du groupe lit les résultats d'un élève", () =>
  assertSucceeds(fsDe('prof1').doc('travaux/g1/eleves/e1/activites/qcm1').get()));

await v("un enseignant étranger ne lit pas ces résultats", () =>
  assertFails(fsDe('prof2').doc('travaux/g1/eleves/e1/activites/qcm1').get()));

await v("l'enseignant saisit une note à la main", () =>
  assertSucceeds(fsDe('prof1').doc('travaux/g1/eleves/e1/activites/scenario').set({ score: 14, max: 20 })));

// ---------- 7. jeux privés : l'enseignant efface sans pouvoir écrire
await v("un élève écrit son jeu privé", () =>
  assertSucceeds(fsDe('e1').doc('prives/e1/jeux/logisim').set({ blob: '{"a":1}', rev: 2 })));

await v("un élève n'écrit pas le jeu privé d'un autre", () =>
  assertFails(fsDe('e2').doc('prives/e1/jeux/logisim').set({ blob: 'x', rev: 9 })));

await v("un enseignant lit le jeu privé d'un élève", () =>
  assertSucceeds(fsDe('prof1').doc('prives/e1/jeux/logisim').get()));

// La purge d'un élève supprimé passe par là. Écrire à sa place reste interdit : un
// enseignant efface le travail d'un élève, il ne le refait pas.
await v("un enseignant n'écrit pas à la place d'un élève", () =>
  assertFails(fsDe('prof1').doc('prives/e1/jeux/logisim').update({ blob: 'corrigé' })));

await v("un enseignant supprime le jeu privé d'un élève", () =>
  assertSucceeds(fsDe('prof1').doc('prives/e1/jeux/logisim').delete()));

// ---------- 8. tout le reste est fermé
await v("aucune collection hors contrat n'est lisible", () =>
  assertFails(fsDe('prof1').doc('divers/x').get()));

await v("aucune collection hors contrat n'est écrivable", () =>
  assertFails(fsDe('prof1').doc('divers/x').set({ a: 1 })));

// =====================================================================================
//  REALTIME DATABASE
// =====================================================================================

const semerRtdb = () => env.withSecurityRulesDisabled(async (ctx) => {
  const r = ctx.database().ref();
  await r.set({
    acces: { g1: { profs: { prof1: true }, eleves: { e1: true, e2: true } } },
    jeux: {
      g1: {
        // `act1` n'a PAS de `meta` : c'est le jeu jamais gelé, sur lequel `!gele` échouait
        // avec « ! only operates on booleans ».
        act1: { produits: { L1: { nom: 'Vis', _par: 'e1', _parNom: 'Emma', _ts: 1 } } },
        gele1: { meta: { gele: true }, produits: { L1: { nom: 'Écrou', _par: 'e1', _parNom: 'Emma', _ts: 1 } } },
        ouvert1: { meta: { ouvert: { produits: 'tous' } }, produits: { L1: { nom: 'Boulon', _par: 'e1', _parNom: 'Emma', _ts: 1 } } },
      },
    },
  });
});

await env.clearDatabase();
await semerRtdb();

const ligne = (par, nom) => ({ nom: 'Article', _par: par, _parNom: nom, _ts: 1700000000000 });

// ---------- 9. le premier refus : `gele != true` et non `!gele`
// Le jeu `act1` n'a jamais été gelé, donc `meta/gele` n'existe pas et vaut null. `!null`
// fait échouer la règle entière — l'élève ne pouvait rien publier. Discriminant : le
// résultat attendu est « autorisé ».
await v("un élève écrit dans un jeu jamais gelé", () =>
  assertSucceeds(dbDe('e1').ref('jeux/g1/act1/produits/L2').set(ligne('e1', 'Emma'))));

// ---------- 10. gel de séance
await v("un élève n'écrit pas dans un jeu gelé", () =>
  assertFails(dbDe('e1').ref('jeux/g1/gele1/produits/L2').set(ligne('e1', 'Emma'))));

await v("l'enseignant écrit malgré le gel", () =>
  assertSucceeds(dbDe('prof1').ref('jeux/g1/gele1/produits/L2').set(ligne('prof1', 'M. Morin'))));

await v("un élève ne gèle pas la séance lui-même", () =>
  assertFails(dbDe('e1').ref('jeux/g1/act1/meta/gele').set(true)));

await v("l'enseignant gèle la séance", () =>
  assertSucceeds(dbDe('prof1').ref('jeux/g1/act1/meta/gele').set(true)));

// ---------- 11. propriété de la ligne, et table à écriture partagée
await v("un élève ne récrit pas la ligne d'un autre", () =>
  assertFails(dbDe('e2').ref('jeux/g1/ouvert1/produits/L9').set(ligne('e1', 'Emma'))));

await v("un élève récrit la ligne d'un autre si la table est ouverte à tous", () =>
  assertSucceeds(dbDe('e2').ref('jeux/g1/ouvert1/produits/L1').set(ligne('e2', 'Léo'))));

await v("un élève ne signe pas une ligne au nom d'un autre", () =>
  assertFails(dbDe('e1').ref('jeux/g1/ouvert1/produits/L7').set(ligne('e2', 'Léo'))));

await v("_ts doit être un nombre", () =>
  assertFails(dbDe('e1').ref('jeux/g1/ouvert1/produits/L6')
    .set({ nom: 'A', _par: 'e1', _parNom: 'Emma', _ts: 'hier' })));

// ---------- 12. cloisonnement des jeux
await v("un membre du groupe lit le jeu", () =>
  assertSucceeds(dbDe('e1').ref('jeux/g1/act1').once('value')));

await v("un élève étranger ne lit pas le jeu", () =>
  assertFails(dbDe('e3').ref('jeux/g1/act1').once('value')));

await v("un inconnu ne lit pas le jeu", () =>
  assertFails(dbDe('intrus').ref('jeux/g1/act1').once('value')));

await v("un élève étranger n'écrit pas dans le jeu", () =>
  assertFails(dbDe('e3').ref('jeux/g1/act1/produits/L5').set(ligne('e3', 'Zoé'))));

// ---------- 13. miroir des droits
await v("un élève ne s'ajoute pas aux enseignants du groupe", () =>
  assertFails(dbDe('e1').ref('acces/g1/profs/e1').set(true)));

await v("un inconnu ne s'ajoute pas aux élèves du groupe", () =>
  assertFails(dbDe('intrus').ref('acces/g1/eleves/intrus').set(true)));

await v("l'enseignant inscrit un élève au groupe", () =>
  assertSucceeds(dbDe('prof1').ref('acces/g1/eleves/e9').set(true)));

// Trou connu, non corrigé au 30/09/2026 : `acces/$gid` accepte l'écriture de tout compte
// authentifié tant que le nœud n'existe pas (`!data.exists()`), ce qui est nécessaire à la
// création d'un groupe mais laisse n'importe qui fabriquer des groupes de toutes pièces —
// sur un plan facturé à la bande passante. Ce test constate l'état actuel ; le jour où la
// création sera réservée à `profsGlobaux`, il faudra le retourner en assertFails.
await v("CONNU : un inconnu peut fabriquer un groupe inexistant", () =>
  assertSucceeds(dbDe('intrus').ref('acces/gpirate/profs/intrus').set(true)));

// ---------- 14. suppression d'un groupe entier
// La règle `.write` au niveau `jeux/$gid` a été ajoutée le 30/09 : sans elle, l'enseignant
// ne pouvait effacer que ligne par ligne, et la suppression d'un groupe échouait en cours
// de route. Un droit accordé plus haut ne profite pas aux élèves : leurs règles plus
// profondes restent évaluées, ce que vérifie le test suivant.
await v("un élève n'efface pas la branche du groupe", () =>
  assertFails(dbDe('e1').ref('jeux/g1').remove()));

await v("l'enseignant efface la branche du groupe", () =>
  assertSucceeds(dbDe('prof1').ref('jeux/g1').remove()));

// ---------- 15. référentiels communs
await v("un élève lit les référentiels communs", () =>
  assertSucceeds(dbDe('e1').ref('communs/ref1').once('value')));

await v("un élève n'écrit pas dans les référentiels communs", () =>
  assertFails(dbDe('e1').ref('communs/ref1/table/L1').set({ a: 1 })));

await v("nul ne s'inscrit dans profsGlobaux", () =>
  assertFails(dbDe('prof1').ref('profsGlobaux/prof1').set(true)));

// =====================================================================================
//  Verdict
// =====================================================================================

await env.cleanup();

for (const n of ok) console.log('  ✓ ' + n);
for (const n of ko) console.log('  ✗ ' + n);
console.log(`\n${ok.length}/${ok.length + ko.length} tests de règles réussis.`);
process.exit(ko.length ? 1 : 0);

// --- régression volontaire ---------------------------------------------------------
// Un test qui ne tombe pas quand on remet le bug ne prouve rien. Les quatre refus du
// 30/09/2026 se rejouent ainsi, un à la fois, dans le fichier de règles :
//
//  1. database.rules.json, `jeux/$gid/$cle/$table/$ligne` :
//     remplacer `.child('gele').val() != true` par `!...child('gele').val()`
//     → « un élève écrit dans un jeu jamais gelé » doit tomber.
//  2. firestore.rules, `monRole()` : remplacer `monProfil().get('role', '')`
//     par `monProfil().role`
//     → « un enseignant au profil incomplet reste enseignant » doit tomber.
//  3. firestore.rules, `match /groupes/{gid}` : retirer la branche `resource == null`
//     → « lire un groupe inexistant est permis » doit tomber, et avec lui toute création.
//  4. firestore.rules, `match /users/{uid}` : remettre la branche
//     `(uid == moi() && request.resource.data.role == 'prof')` dans `allow create`
//     → « un inconnu ne peut pas se créer un profil enseignant » doit tomber.
//
// À refaire après toute retouche des règles : c'est le seul moyen de savoir que la suite
// surveille encore quelque chose.
