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
// Personne du tout : ni élève, ni enseignant, ni compte Google. Le site étant public, cet
// état existe à chaque chargement de page avant la connexion.
const dbAnonyme = () => env.unauthenticatedContext().database();

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

// Niveau et tiers-temps (brief MOTEUR-tiers-temps, 03/10/2026) : réglés par l'enseignant
// seul. Le profil d'e1 ne porte au départ aucun des deux champs : la règle ne doit pas
// supposer qu'ils existent, ni pour refuser l'élève, ni pour laisser passer l'enseignant.
await v("un élève ne s'accorde pas le tiers-temps (champ absent au départ)", () =>
  assertFails(fsDe('e1').doc('users/e1').update({ tiersTemps: true })));

await v("un élève ne se met pas au niveau confirmé", () =>
  assertFails(fsDe('e1').doc('users/e1').update({ aisance: 'confirme' })));

await v("un élève ne glisse pas le tiers-temps dans une modification permise", () =>
  assertFails(fsDe('e1').doc('users/e1').update({ nom: 'Emma', tiersTemps: true })));

await v("l'enseignant accorde le tiers-temps et le niveau confirmé", () =>
  assertSucceeds(fsDe('prof1').doc('users/e1').update({ tiersTemps: true, aisance: 'confirme' })));

await v("un élève ne retire pas non plus son tiers-temps ni ne change son niveau", async () => {
  await assertFails(fsDe('e1').doc('users/e1').update({ tiersTemps: false }));
  await assertFails(fsDe('e1').doc('users/e1').update({ aisance: 'standard' }));
});

await v("un élève dont le tiers-temps est posé modifie toujours le reste de son profil", () =>
  assertSucceeds(fsDe('e1').doc('users/e1').update({ nom: 'Emma' })));

// Audit du 08/10/2026 (C1) : l'élève ne choisit ni ses groupes, ni son matricule, ni son code.
await v("un élève ne s'ajoute pas à un autre groupe", () =>
  assertFails(fsDe('e1').doc('users/e1').update({ groupes: ['g1', 'g2'] })));
await v("un élève ne vide ni ne remplace sa liste de groupes", () =>
  assertFails(fsDe('e1').doc('users/e1').update({ groupes: ['g2'] })));
await v("un élève ne change ni son matricule ni son code", async () => {
  await assertFails(fsDe('e1').doc('users/e1').update({ matricule: '9999' }));
  await assertFails(fsDe('e1').doc('users/e1').update({ code: 'zz99' }));
});
await v("un élève ne glisse pas un champ inconnu dans son profil", () =>
  assertFails(fsDe('e1').doc('users/e1').update({ creePar: 'e1' })));
await v("un élève change son prénom", () =>
  assertSucceeds(fsDe('e1').doc('users/e1').update({ prenom: 'Emma-Rose' })));
await v("l'enseignant ajoute puis retire un groupe au profil d'un élève", async () => {
  await assertSucceeds(fsDe('prof1').doc('users/e3').update({ groupes: ['g2', 'g1'] }));
  await assertSucceeds(fsDe('prof1').doc('users/e3').update({ groupes: ['g2'] }));
});
await v("un enseignant ne modifie pas le profil d'un collègue", () =>
  assertFails(fsDe('prof1').doc('users/prof2').update({ nom: 'Détourné' })));
await v("un enseignant ne supprime pas le profil d'un collègue", () =>
  assertFails(fsDe('prof1').doc('users/prof2').delete()));
await v("un enseignant modifie son propre profil", () =>
  assertSucceeds(fsDe('prof1').doc('users/prof1').update({ nom: 'Morin T.' })));
await v("un enseignant supprime le profil d'un élève", () =>
  assertSucceeds(fsDe('prof1').doc('users/e9').delete()));

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

// Audit du 08/10/2026 (C1) : ce qu'un élève ne peut pas écrire dans son propre dossier.
await env.withSecurityRulesDisabled(async (ctx) => {
  await ctx.firestore().doc('travaux/g1/eleves/e1/activites/noteprof').set({ score: 12, max: 20, parProf: true });
});
await v("un élève ne supprime pas un travail non rendu", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/qcm2').delete()));
await v("un élève ne pose pas la marque d'une note d'enseignant", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/qcm3').set({ score: 20, max: 20, parProf: true })));
await v("un élève ne réécrit pas une note posée par l'enseignant", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/noteprof').set({ score: 20, max: 20 })));
await v("un élève ne pose pas de drapeau de déblocage de parcours", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/_debloque-m1').set({ score: 0, max: 0 })));
await v("l'enseignant pose et retire un drapeau de déblocage", async () => {
  await assertSucceeds(fsDe('prof1').doc('travaux/g1/eleves/e1/activites/_debloque-m1').set({ score: 0, max: 0 }));
  await assertSucceeds(fsDe('prof1').doc('travaux/g1/eleves/e1/activites/_debloque-m1').delete());
});
await v("un élève n'écrit pas un uid ou un groupe étranger dans son résultat", async () => {
  await assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/qcm4').set({ score: 5, max: 20, uid: 'e2' }));
  await assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/qcm4').set({ score: 5, max: 20, gid: 'g2' }));
});
await v("un élève n'écrit pas un score qui n'est pas un nombre", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/qcm4').set({ score: 'vingt', max: 20 })));
await v("un élève met à jour son résultat (temps passé, tentative)", () =>
  assertSucceeds(fsDe('e1').doc('travaux/g1/eleves/e1/activites/qcm2').update({ score: 16, max: 20, tentatives: 2 })));
await v("un élève qui s'est ajouté un groupe n'y écrit rien (profil verrouillé)", () =>
  assertFails(fsDe('e1').doc('travaux/g2/eleves/e1/activites/qcm2').set({ score: 20, max: 20 })));

// ---------- 6 bis. la copie rendue (évaluations, 02/10/2026) : figée pour l'élève
// Un résultat qui porte `rendu` ne se réécrit plus par l'élève — ni à la main dans la console
// du navigateur, ni par un onglet resté ouvert. Seul l'enseignant du groupe le ramasse ou le
// rouvre (core/copie.js).
await env.withSecurityRulesDisabled(async (ctx) => {
  await ctx.firestore().doc('travaux/g1/eleves/e1/activites/eval1').set({ score: 3, max: 6, meilleur: 3, rendu: 1790000000000 });
});
await v("copie rendue : l'élève ne réécrit pas sa note", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/eval1').set({ score: 6, max: 6, meilleur: 6 })));
await v("copie rendue : l'élève ne retire pas le marqueur de remise", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/eval1').update({ rendu: null, meilleur: 6 })));
await v("copie rendue : l'élève ne l'efface pas pour la rendre de nouveau", () =>
  assertFails(fsDe('e1').doc('travaux/g1/eleves/e1/activites/eval1').delete()));
await v("copie : l'élève rend une copie neuve (création)", () =>
  assertSucceeds(fsDe('e1').doc('travaux/g1/eleves/e1/activites/eval2').set({ score: 2, max: 6, meilleur: 2, rendu: 1790000000001 })));
await v("copie rendue : l'enseignant du groupe la rouvre (effacement)", () =>
  assertSucceeds(fsDe('prof1').doc('travaux/g1/eleves/e1/activites/eval1').delete()));
await v("copie : l'enseignant du groupe ramasse une copie (écrit au nom de l'élève)", () =>
  assertSucceeds(fsDe('prof1').doc('travaux/g1/eleves/e2/activites/eval1').set({ score: 1, max: 6, meilleur: 1, rendu: 1790000000002, ramasse: true })));
await v("copie : un enseignant étranger ne ramasse pas", () =>
  assertFails(fsDe('prof2').doc('travaux/g1/eleves/e2/activites/eval3').set({ score: 6, max: 6, rendu: 1 })));

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
    // prof1 est inscrit dans profsGlobaux : c'est lui qui a le droit de créer un groupe.
    profsGlobaux: { prof1: true },
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

// Second trou, bouché le 01/10/2026. `acces/$gid` acceptait l'écriture de tout compte
// authentifié tant que le nœud n'existait pas (`!data.exists()`) : nécessaire à la création
// d'un groupe, mais n'importe qui pouvait fabriquer des groupes de toutes pièces et écrire
// dans `jeux/<gid>` à volonté — sur un plan Spark facturé à la bande passante. La création
// est désormais réservée aux uid inscrits dans `profsGlobaux`, nœud en `.write: false`.
await v("un inconnu ne fabrique pas un groupe inexistant", () =>
  assertFails(dbDe('intrus').ref('acces/gpirate/profs/intrus').set(true)));

// Discriminant : l'attente est « autorisé ». Sans la branche `profsGlobaux`, la création
// d'un groupe devient impossible à tout le monde, et c'est ce test qui le dit.
await v("un enseignant global crée un groupe", () =>
  assertSucceeds(dbDe('prof1').ref('acces/gneuf/profs/prof1').set(true)));

await v("un enseignant non global ne crée pas de groupe", () =>
  assertFails(dbDe('prof2').ref('acces/gneuf2/profs/prof2').set(true)));

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

// ---------- 15 bis. les classements de quiz (02/10/2026)
// Les quiz d'entraînement (QUI-8 et suivants) rangent leur classement sous
// `classements/{activité}/{uid}`, commun à toutes les classes. C'est la SEULE écriture
// d'un élève hors de son propre groupe dans tout Prepalog, d'où ces cas.
//
// Pourquoi une branche à part et pas `communs/` : `communs/` est le référentiel partagé,
// en lecture seule pour les élèves. Y ouvrir l'écriture en aurait fait une branche à deux
// régimes et aurait imposé aux futurs référentiels des contraintes écrites pour les quiz.
const CL = 'classements/entr-conversions';
const resultat = (n) => ({ gid: 'g1', groupe: '1 LOG A', score: n, max: 20, temps: 212, ts: 1700000000000 });

// Discriminant : l'attente est « autorisé ». Sans `$uid === auth.uid`, plus aucun élève ne
// peut s'inscrire au classement, et c'est ce test qui le dit.
await v("un élève s'inscrit au classement sous sa propre clé", () =>
  assertSucceeds(dbDe('e1').ref(`${CL}/e1`).set(resultat(14))));

await v("un élève n'écrit pas la ligne de classement d'un autre", () =>
  assertFails(dbDe('e2').ref(`${CL}/e1`).set(resultat(20))));

await v("un élève n'efface pas la ligne de classement d'un autre", () =>
  assertFails(dbDe('e2').ref(`${CL}/e1`).remove()));

// S'attribuer son score, puis revenir à l'anonymat : deux réécritures de sa propre ligne.
await v("un élève reprend sa propre ligne de classement", () =>
  assertSucceeds(dbDe('e1').ref(`${CL}/e1`).set({ ...resultat(17), nom: 'Emma D.' })));

await v("un élève redevient anonyme en réécrivant sa ligne sans nom", () =>
  assertSucceeds(dbDe('e1').ref(`${CL}/e1`).set(resultat(17))));

// Le classement est lu par toutes les classes : c'est le but, et c'est aussi ce qu'il faut
// regarder en face. Un élève d'un autre groupe le lit, et n'importe quel compte Google
// authentifié aussi — raison pour laquelle le site n'y écrit AUCUN nom par défaut.
await v("un élève d'un autre groupe lit le classement", () =>
  assertSucceeds(dbDe('e3').ref(CL).once('value')));

await v("un compte authentifié quelconque lit le classement", () =>
  assertSucceeds(dbDe('intrus').ref(CL).once('value')));

await v("un visiteur non connecté ne lit pas le classement", () =>
  assertFails(dbAnonyme().ref(CL).once('value')));

await v("un visiteur non connecté n'écrit pas au classement", () =>
  assertFails(dbAnonyme().ref(`${CL}/x`).set(resultat(20))));

// Les `.validate` ne protègent aucun secret : ils empêchent de se servir du classement
// comme d'un espace de stockage libre, la Realtime Database étant facturée à la bande
// passante.
await v("un nom trop long est refusé au classement", () =>
  assertFails(dbDe('e1').ref(`${CL}/e1`).set({ ...resultat(12), nom: 'x'.repeat(200) })));

await v("un score qui n'est pas un nombre est refusé", () =>
  assertFails(dbDe('e1').ref(`${CL}/e1`).set({ ...resultat(12), score: 'vingt' })));

// L'enseignant remet un classement à zéro d'un seul geste. Le `.write` est posé un cran
// plus haut, sur `$aid` : sans lui, la suppression ne passe que ligne par ligne et
// s'arrête en chemin — c'est exactement ce qui était arrivé sur `jeux/$gid` le 30/09.
// Le 02/10, ce cas a échoué au premier passage et c'est la règle qui a été corrigée.
await v("un élève n'efface pas tout le classement", () =>
  assertFails(dbDe('e1').ref(CL).remove()));

await v("un enseignant global efface le classement", () =>
  assertSucceeds(dbDe('prof1').ref(CL).remove()));

// Et `communs/` n'a pas bougé : toujours en lecture seule pour les élèves.
await v("un élève n'écrit toujours pas dans les référentiels communs", () =>
  assertFails(dbDe('e1').ref('communs/ref1/table/L2').set({ a: 1 })));

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

// --- régression volontaire -----------------------------------------------------------
// Un test qui ne tombe pas quand on remet le bug ne prouve rien. Procédure exécutée le
// 01/10/2026, résultats constatés — à refaire après toute retouche des règles.
//
//  1. database.rules.json, `jeux/$gid/$cle/$table/$ligne` :
//     remplacer `.child('gele').val() != true` par `.child('gele').val() == false`
//     → tombe : « un élève écrit dans un jeu jamais gelé », et par ricochet
//       « un élève récrit la ligne d'un autre si la table est ouverte à tous ».
//     NE PAS écrire `!...child('gele').val()` comme la version précédente de cette
//     procédure le demandait : le compilateur de règles RTDB le refuse au chargement
//     (`! only operates on booleans`), l'émulateur ne démarre pas et aucun test ne tourne.
//     `== false` a le même défaut sémantique — un `null` n'est pas `false` — et compile.
//  2. firestore.rules, `match /groupes/{gid}` : retirer la branche `resource == null`
//     → tombe : « lire un groupe inexistant est permis », et lui seul. La création de
//       groupe n'en dépend pas : `allow create` ne passe pas par `allow read`.
//  3. firestore.rules, `match /users/{uid}` : remettre la branche
//     `(uid == moi() && request.resource.data.role == 'prof')` dans `allow create`
//     → tombent : « un inconnu ne peut pas se créer un profil enseignant » puis
//       « un inconnu ne lit aucun profil d'élève » — la chaîne complète de l'exploit du
//       30/09, l'intrus se faisant enseignant avant de lire les codes des élèves.
//       Discrimine par l'autre mécanisme : l'attente est un refus, et le bug accorde.
//  4. database.rules.json, `acces/$gid` : retirer la branche `profsGlobaux`
//     → tombe : « un enseignant global crée un groupe ».
//  5 bis. database.rules.json, `classements/$aid` : retirer le `.write` du niveau dossier
//     → tombe : « un enseignant global efface le classement ». Constaté pour de vrai le
//       02/10 : la règle n'avait pas ce droit, et c'est le test qui l'a dit.
//  5. database.rules.json, `classements/$aid/$uid` : retirer `$uid === auth.uid`
//     → tombe : « un élève s'inscrit au classement sous sa propre clé ».
//     Et en sens inverse, remplacer la condition par `auth != null` tout court
//     → tombe : « un élève n'écrit pas la ligne de classement d'un autre ».
//     Les deux sens sont couverts. (Ajouté le 02/10/2026 avec les classements de quiz.)
//
// Hors de portée, et ce n'est pas un oubli : les gardes `monProfil().get('role', '')` et
// `monProfil().get('groupes', [])`, ainsi que le `exists()` de `monProfil()`. Essai du
// 01/10/2026 : `monRole()` ramené à `monProfil().role` laisse la suite à 57/57.
// Ces gardes protègent d'une erreur d'évaluation sur un profil incomplet — or dans ce jeu
// de règles un profil incomplet n'aboutit jamais à une autorisation : `.role` n'échoue que
// sur un profil sans `role`, donc sur quelqu'un qui n'est jamais enseignant, et tout ce
// qu'obtient un non-enseignant passe par `uid == moi()`, qui court-circuite `estProf()`
// avant lui ; `.groupes` n'échoue que sur un profil sans `groupes`, et `gid in mesGroupes()`
// est la dernière branche du `allow read`, après `resource == null` et
// `moi() in resource.data.profs`. Aucun `assertSucceeds` ne peut les voir. Le profil
// incomplet du harnais, `users/prof3`, porte d'ailleurs `role` et pas `groupes` : le test
// « un enseignant au profil incomplet reste enseignant » ne surveille donc pas `monRole()`.
