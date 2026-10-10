// Calage ENT-6.3 France Boissons — congés d'été des chauffeurs, avant et après le départ de Kevin.
// Lot 0 (lecture seule), 10/10/2026. Brief : docs/briefs/ENT-6.3-france-boissons-conges.md (§4), règles communes :
// docs/briefs/FRANCE-BOISSONS-refonte.md. Script autonome, sans dépendance : `node calage-6.3.mjs`.
//
// Il ÉNUMÈRE toutes les façons de poser les cartes de congé sur la grille (9 colonnes-semaines) et compte celles qui
// respectent les règles, avant puis après l'imprévu. Il ne reprend AUCUNE solution du brief : les attendus
// (« Lucas en S1-S2 », « Lucas en S8-S9 ») sont seulement COMPARÉS au résultat à la fin.
// Ce n'est pas un test du site (les tests écrivent leurs valeurs à la main) : il cale les données.
// Les règles sont celles que le moteur du Planning sait juger (core/types/planning.js) :
//   effectif (l.270), auMoinsUn (l.278), dateImposee (l.262), sansNecessite (l.322), critere (l.334).

// ───────────────────────────────────────────────────────────── DONNÉES (brief §4, point 2)
// Colonnes : index 0..8 = S1..S8 + « semaine du 30 août (après le pic) » (§4 : « 8 semaines du pic + une 9e »).
// S1 = semaine du 5 juillet 2027 (lundi), S8 = semaine du 23 août, S9 = semaine du 30 août.
const SEMAINES = ['S1 5 juil.', 'S2 12 juil.', 'S3 19 juil.', 'S4 26 juil.', 'S5 2 août', 'S6 9 août', 'S7 16 août', 'S8 23 août', 'S9 30 août'];
let N = SEMAINES.length;
// §4 : « Besoin (présents) : 6 par semaine en juillet (S1-S4), 5 en août (S5-S8), 0 après le pic. »
let BESOIN = [6, 6, 6, 6, 5, 5, 5, 5, 0];
// §4 : les 7 chauffeurs ; « Lucas, Amandine, Julien connaissent la côte » (repère visible, règle auMoinsUn).
const CHAUFFEURS_V1 = [
  { id: 'lucas', cote: true }, { id: 'amandine', cote: true }, { id: 'julien', cote: true },
  { id: 'sebastien' }, { id: 'fatou' }, { id: 'yoann' }, { id: 'kevin' },
];
// §4 point 3 (l'imprévu) : Kevin part (dernier jour vendredi 2 juillet = avant S1) ; « ligne Saisonnier (à recruter)
// disponible de S2 à S8, ne connaît pas la côte » (CDD du lundi 12 juillet au vendredi 27 août).
const CHAUFFEURS_V2 = [
  { id: 'lucas', cote: true }, { id: 'amandine', cote: true }, { id: 'julien', cote: true },
  { id: 'sebastien' }, { id: 'fatou' }, { id: 'yoann' },
  { id: 'saisonnier', de: 1, a: 7 },          // S2 (index 1) à S8 (index 7)
];
// §4 point 2, tableau des cartes : chauffeur, début demandé (index), durée en semaines, date de la demande (ISO).
// « Demandé le » : Amandine 2 mars, Sébastien 18 mars, Lucas 5 mai, Fatou 12 mai, Yoann 20 mai, Kevin 28 mai ; Julien : imposé.
const CARTES_V1 = [
  { id: 'amandine', dem: 2, L: 1, demande: '2027-03-02' },            // S3 (19 juil.)
  { id: 'sebastien', dem: 4, L: 2, demande: '2027-03-18' },           // S5-S6 (2 août)
  { id: 'lucas', dem: 1, L: 2, demande: '2027-05-05' },               // S2-S3 (12 juil.)
  { id: 'fatou', dem: 5, L: 2, demande: '2027-05-12' },               // S6-S7 (9 août)
  { id: 'yoann', dem: 6, L: 2, demande: '2027-05-20' },               // S7-S8 (16 août)
  { id: 'kevin', dem: 7, L: 1, demande: '2027-05-28' },               // S8 (23 août)
  { id: 'julien', dem: 4, L: 1, impose: true },                       // S5 (2 août) « déjà validé (imposé) »
];
const CARTES_V2 = CARTES_V1.filter((c) => c.id !== 'kevin');          // la carte de Kevin disparaît avec lui

// ───────────────────────────────────────────────────────────── MOTEUR DE RÈGLES (miroir de core/types/planning.js)
const present = (ligne, plan, cartes, t) => {
  const de = ligne.de ?? 0, a = ligne.a ?? N - 1;
  if (t < de || t > a) return false;                                  // « pas là » (hors dispo)
  const c = cartes.find((x) => x.id === ligne.id);                    // une carte par chauffeur, sur sa ligne
  return !(c && plan[c.id] <= t && t < plan[c.id] + c.L);
};
const presents = (lignes, cartes, plan, t) => lignes.filter((l) => present(l, plan, cartes, t));
// effectif : présents >= besoin de la colonne (planning.js:270)
const rEffectif = (lignes, cartes, plan) => BESOIN.every((b, t) => presents(lignes, cartes, plan, t).length >= b);
// auMoinsUn : un chauffeur qui connaît la côte présent chaque semaine (planning.js:278)
const rCote = (lignes, cartes, plan) => BESOIN.every((_, t) => presents(lignes, cartes, plan, t).some((l) => l.cote));
// dateImposee (planning.js:262)
const rImposee = (cartes, plan) => cartes.filter((c) => c.impose).every((c) => plan[c.id] === c.dem);
const valide = (lignes, cartes, plan) => rEffectif(lignes, cartes, plan) && rCote(lignes, cartes, plan) && rImposee(cartes, plan);
const decale = (c, plan) => !c.impose && plan[c.id] !== c.dem;
// sansNecessite (planning.js:322) : un congé décalé « pouvait rester à sa date » si, en le remettant à sa date (les autres
// cartes inchangées), TOUTES les autres règles (effectif, côte, date imposée) sont respectées.
const rSansNecessite = (lignes, cartes, plan) => cartes.filter((c) => decale(c, plan))
  .every((c) => !valide(lignes, cartes, { ...plan, [c.id]: c.dem }));
// Recouvrement de deux intervalles de semaines [dem, dem+L[
const recouvre = (a, b) => a.dem < b.dem + b.L && b.dem < a.dem + a.L;
// critere « priorité à la demande la plus ancienne » — LECTURE P1 (à écrire dans le contenu, `type: 'critere'`) :
// un congé décalé X ne doit pas avoir, à la place de sa date demandée, un congé PLUS RÉCENT Y resté à sa date.
const rPrioriteP1 = (cartes, plan) => {
  const X = cartes.filter((c) => decale(c, plan));
  const gardes = cartes.filter((c) => !c.impose && !decale(c, plan));
  return !X.some((x) => gardes.some((y) => recouvre(x, y) && y.demande > x.demande));
};
// LECTURE P2 (plus large) : idem, mais Y peut aussi être un congé imposé (Julien) — pas de date de demande, donc jamais « plus récent ».
// (Sans effet ici : Julien n'a pas de date de demande ; gardée pour le dire.)

// ───────────────────────────────────────────────────────────── ÉNUMÉRATION
// Julien (date imposée) est TOUJOURS posé à sa date : l'énumération cherche les solutions justes, pas les erreurs de l'élève
// (un Julien déplacé fait tomber son jalon « date imposée » et rien d'autre ; voir la contre-épreuve avec le vrai moteur).
function* tousLesPlans(cartes) {
  const libres = cartes.filter((c) => !c.impose);
  const fixes = cartes.filter((c) => c.impose);
  const plan = {};
  fixes.forEach((c) => { plan[c.id] = c.dem; });
  function* rec(k) {
    if (k === libres.length) { yield { ...plan }; return; }
    const c = libres[k];
    for (let s = 0; s + c.L <= N; s++) { plan[c.id] = s; yield* rec(k + 1); }   // la grille borne la carte (poser(), planning.js:575)
  }
  yield* rec(0);
}
const lib = (plan, cartes) => cartes.map((c) => {
  const s = plan[c.id];
  const lettre = `${c.id} S${s + 1}${c.L > 1 ? `-S${s + c.L}` : ''}`;
  return decale(c, plan) ? `${lettre} (décalé)` : lettre;
}).join(' · ');

function etudier(nom, lignes, cartes) {
  let tous = 0, valides = [];
  for (const p of tousLesPlans(cartes)) { tous++; if (valide(lignes, cartes, p)) valides.push(p); }
  const nbDecales = (p) => cartes.filter((c) => decale(c, p)).length;
  const deplacement = (p) => cartes.filter((c) => !c.impose).reduce((a, c) => a + Math.abs(p[c.id] - c.dem), 0);
  const minCard = Math.min(...valides.map(nbDecales));
  const minDep = Math.min(...valides.map(deplacement));
  const lectures = [
    ['A  règles + sans nécessité (moteur) + priorité P1', (p) => rSansNecessite(lignes, cartes, p) && rPrioriteP1(cartes, p)],
    ['B  règles + nombre minimal de congés décalés + priorité P1', (p) => nbDecales(p) === minCard && rPrioriteP1(cartes, p)],
    ['C  règles + sans nécessité (moteur), SANS priorité', (p) => rSansNecessite(lignes, cartes, p)],
    ['D  règles + nombre minimal de congés décalés, SANS priorité', (p) => nbDecales(p) === minCard],
    ['E  règles + priorité P1, sans « décaler le moins »', (p) => rPrioriteP1(cartes, p)],
    ['F  règles + déplacement total minimal (en semaines) + priorité P1', (p) => deplacement(p) === minDep && rPrioriteP1(cartes, p)],
  ];
  console.log(`\n=== ${nom} ===`);
  console.log(`Façons de poser les cartes : ${tous} ; qui respectent effectif + côte + date imposée : ${valides.length} ; nombre minimal de congés décalés : ${minCard}`);
  const res = {};
  for (const [nomL, f] of lectures) {
    const L = valides.filter(f);
    res[nomL[0]] = L;
    console.log(`  Lecture ${nomL} -> ${L.length} solution${L.length > 1 ? 's' : ''}`);
    if (L.length <= 6) L.forEach((p) => console.log(`      ${lib(p, cartes)}`));
  }
  return { valides, res, tous };
}


// ───────────────────────────────────────────────────────────── LECTURE DES RÉSULTATS
// Combien de congés chaque plan décale (pour montrer ce que laisse passer la règle `sansNecessite` du moteur).
const repartition = (L, cartes) => {
  const r = {};
  L.forEach((p) => { const k = cartes.filter((c) => decale(c, p)).length; r[k] = (r[k] || 0) + 1; });
  return Object.entries(r).sort((a, b) => a[0] - b[0]).map(([k, n]) => `${n} avec ${k} congé${k > 1 ? 's' : ''} décalé${k > 1 ? 's' : ''}`).join(', ');
};
const unique = (nom, L, cartes, test) => {
  const ok = L.length === 1 && test(L[0]);
  console.log(`${nom} : ${L.length} solution${L.length > 1 ? 's' : ''} -> ${ok ? 'OK, c\'est celle du brief' : 'ÉCHEC'}`);
  return ok;
};

function tout(avecNeuvieme) {
  console.log(`\n################ ${avecNeuvieme ? 'Grille à 9 colonnes (S1 à S8 + semaine du 30 août) : le brief' : 'VARIANTE : grille à 8 colonnes (sans la semaine du 30 août)'} ################`);
  N = avecNeuvieme ? 9 : 8; BESOIN = [6, 6, 6, 6, 5, 5, 5, 5, 0].slice(0, N);
  const v1 = etudier('1er envoi (7 chauffeurs, avec Kevin)', CHAUFFEURS_V1, CARTES_V1);
  const v2 = etudier("Après l'imprévu (Kevin parti, saisonnier S2-S8)", CHAUFFEURS_V2, CARTES_V2);
  console.log(`\n  Ce que laisse passer la règle sansNecessite du moteur (lecture A) : 1er envoi : ${repartition(v1.res.A, CARTES_V1)}`);
  console.log(`                                                                      après l'imprévu : ${repartition(v2.res.A, CARTES_V2)}`);
  return { v1, v2 };
}

const { v1, v2 } = tout(true);

console.log('\n=== Vérifications complémentaires (grille à 9 colonnes) ===');
N = 9; BESOIN = [6, 6, 6, 6, 5, 5, 5, 5, 0];
// 1. La solution du 1er envoi survit-elle à l'imprévu ? (renvoyée sans changement, elle doit être fausse)
{
  const p = { ...v1.res.B[0] }; delete p.kevin;
  const ok = valide(CHAUFFEURS_V2, CARTES_V2, p);
  const pres = BESOIN.map((_, t) => presents(CHAUFFEURS_V2, CARTES_V2, p, t).length);
  console.log(`- Solution du 1er envoi renvoyée telle quelle après l'imprévu (carte de Kevin ôtée) : règles respectées ? ${ok ? 'OUI (problème : l\'inaction paie)' : 'NON'}`);
  console.log(`  Présents par semaine : ${pres.join(' ')} (besoin ${BESOIN.join(' ')}) -> effectif ${rEffectif(CHAUFFEURS_V2, CARTES_V2, p) ? 'ok' : 'FAUX'} · côte ${rCote(CHAUFFEURS_V2, CARTES_V2, p) ? 'ok' : 'faux'} · Julien ${rImposee(CARTES_V2, p) ? 'ok' : 'faux'}`);
}
// 2. « Points gratuits » : toutes les cartes posées à leur date demandée, sans réfléchir
for (const [nom, lignes, cartes] of [['1er envoi', CHAUFFEURS_V1, CARTES_V1], ['après l\'imprévu', CHAUFFEURS_V2, CARTES_V2]]) {
  const naif = Object.fromEntries(cartes.map((c) => [c.id, c.dem]));
  console.log(`- Toutes les cartes posées à la date demandée (${nom}) : effectif ${rEffectif(lignes, cartes, naif) ? 'ok' : 'FAUX'} · côte ${rCote(lignes, cartes, naif) ? 'ok' : 'FAUX'} · Julien ${rImposee(cartes, naif) ? 'ok' : 'FAUX'} · priorité ${rPrioriteP1(cartes, naif) ? 'ok (vide)' : 'FAUX'} · sans nécessité ${rSansNecessite(lignes, cartes, naif) ? 'ok (vide)' : 'FAUX'}`);
}
// 2 bis. La règle « un chauffeur de la côte présent chaque semaine » discrimine-t-elle quelque chose ?
for (const [nom, lignes, cartes] of [['1er envoi', CHAUFFEURS_V1, CARTES_V1], ["après l'imprévu", CHAUFFEURS_V2, CARTES_V2]]) {
  let effOk = 0, effOkCoteKo = 0, coteKo = 0;
  for (const p of tousLesPlans(cartes)) {
    const e = rEffectif(lignes, cartes, p), c = rCote(lignes, cartes, p);
    if (e) { effOk++; if (!c) effOkCoteKo++; }
    if (!c) coteKo++;
  }
  console.log(`- ${nom} : sur les plans qui respectent l'effectif (${effOk}), ${effOkCoteKo} violent la règle « côte » ; la règle « côte » seule est violée par ${coteKo} plans -> ${effOkCoteKo === 0 ? "elle ne discrimine JAMAIS une fois l'effectif respecté (jalon gratuit)" : 'elle discrimine'}`);
}
// 3. Le piège du brief §8 : « Amandine décalée au lieu de Lucas » -> seul le jalon « priorité » doit tomber
for (const [nom, lignes, cartes, V] of [['1er envoi', CHAUFFEURS_V1, CARTES_V1, v1], ["après l'imprévu", CHAUFFEURS_V2, CARTES_V2, v2]]) {
  const cherche = V.valides.filter((p) => cartes.filter((c) => decale(c, p)).map((c) => c.id).join() === 'amandine');
  console.log(`- ${nom} : plans valides où SEULE Amandine est décalée (Lucas garde S2-S3) : ${cherche.length}`);
  cherche.forEach((p) => console.log(`    ${lib(p, cartes)}  | nombre minimal de décalés : ok · priorité P1 : ${rPrioriteP1(cartes, p) ? 'ok' : 'FAUX'}`));
}
// 4. D3141-6 (alerte n° 1 de la banque) : jours entre le 15 juin 2027 et le premier départ de chaque version
{
  const lundi = (s) => Date.UTC(2027, 6, 5 + 7 * s);
  const jours = (s) => Math.round((lundi(s) - Date.UTC(2027, 5, 15)) / 86400000);
  const premier = (plan, cartes) => Math.min(...cartes.map((c) => plan[c.id]));
  const a = v1.res.B[0], b = v2.res.B[0];
  console.log(`- D3141-6 (un mois = environ 30 jours) : 1er envoi, premier départ = S${premier(a, CARTES_V1) + 1}, ${jours(premier(a, CARTES_V1))} jours après le 15 juin (Lucas, S${a.lucas + 1} : ${jours(a.lucas)} jours).`);
  console.log(`  Après l'imprévu, premier départ = S${premier(b, CARTES_V2) + 1}, ${jours(premier(b, CARTES_V2))} jours après le 15 juin (Amandine) ; Lucas, S${b.lucas + 1} : ${jours(b.lucas)} jours.`);
  console.log(`  Congé d'origine de Lucas (S2) : ${jours(1)} jours.`);
}

// La 9e colonne est-elle nécessaire ?
const sans9 = tout(false);
N = 9; BESOIN = [6, 6, 6, 6, 5, 5, 5, 5, 0];

// ───────────────────────────────────────────────────────────── VERDICT (le brief dit : 1 et 1)
console.log('\n=== Verdict ===');
N = 9; BESOIN = [6, 6, 6, 6, 5, 5, 5, 5, 0];
const brief1 = (p) => p.lucas === 0 && p.amandine === 2 && CARTES_V1.filter((c) => decale(c, p)).length === 1;
const brief2 = (p) => p.lucas === 7 && p.amandine === 2 && CARTES_V2.filter((c) => decale(c, p)).length === 1;
const r1 = unique('1er envoi, lecture B (nombre minimal de congés décalés + priorité à la plus ancienne)', v1.res.B, CARTES_V1, brief1);
const r2 = unique("Après l'imprévu, lecture B", v2.res.B, CARTES_V2, brief2);
console.log(`1er envoi, lecture A (règle sansNecessite du moteur seule + priorité) : ${v1.res.A.length} solutions -> ${v1.res.A.length === 1 ? 'unique' : 'NON unique : sansNecessite ne suffit pas'}`);
console.log(`Après l'imprévu, lecture A : ${v2.res.A.length} solutions -> ${v2.res.A.length === 1 ? 'unique' : 'NON unique : sansNecessite ne suffit pas'}`);
console.log(`Sans la 9e colonne, après l'imprévu, lecture B : ${sans9.v2.res.B.length} solution(s) (la semaine du 30 août est donc nécessaire)`);
if (!(r1 && r2)) { console.log('ÉCHEC : le calage du brief n\'est pas retrouvé.'); process.exit(1); }
console.log('OK : exactement une solution dans chaque cas (lecture B), celle du brief.');

// ───────────────────────────────────────────────────────────── CONTRE-ÉPREUVE AVEC LE VRAI MOTEUR (facultative)
// `node calage-6.3.mjs C:/chemin/vers/prepalog` : le script importe core/types/planning.js (qui se charge hors navigateur),
// juge CHAQUE plan valide du 1er envoi avec le vrai moteur et compare à ma règle « sans nécessité ». Lecture seule.
if (process.argv[2]) {
  const { pathToFileURL } = await import('node:url');
  const { jalonsPlanning } = await import(pathToFileURL(`${process.argv[2].replace(/\/$/, '')}/core/types/planning.js`).href);
  N = 9; BESOIN = [6, 6, 6, 6, 5, 5, 5, 5, 0];
  const nomDe = { lucas: 'Lucas', amandine: 'Amandine', julien: 'Julien', sebastien: 'Sébastien', fatou: 'Fatou', yoann: 'Yoann', kevin: 'Kevin', saisonnier: 'Saisonnier' };
  const lignes = (L) => L.map((l) => ({ id: l.id, nom: nomDe[l.id], cote: !!l.cote, ...(l.de != null ? { dispo: l.de, a: l.a } : {}) }));
  const P = {
    id: 'calage63', echelle: { type: 'jours', jours: SEMAINES.map((s) => s.split(' ')[0]) },
    lignes: { liste: lignes(CHAUFFEURS_V1) },
    cartes: { liste: CARTES_V1.map((c) => ({ id: c.id, qui: c.id, jours: c.L, date: c.dem, impose: !!c.impose, famille: c.impose ? 'impose' : 'conge' })),
      duree: (c) => c.jours, ligne: (c) => c.qui, aPlacer: 'À placer' },
    familles: { conge: { couleur: '#f0be00', legende: 'congé' }, impose: { couleur: '#8b5cf6', legende: 'imposé' } },
    regles: [{ id: 'effectif', type: 'effectif', besoin: BESOIN }, { id: 'cote', type: 'auMoinsUn', filtre: (l) => !!l.cote, libelle: 'chauffeur de la côte' },
      { id: 'imposee', type: 'dateImposee' }, { id: 'sans', type: 'sansNecessite' }],
    jalons: ['effectif', 'cote', 'imposee', 'sans'].map((id) => ({ id, lib: id, regles: [id] })),
    alea: { de: 'Inès', texte: '-', ajoutLignes: lignes([CHAUFFEURS_V2[6]]), ressources: { kevin: { dispo: 9 } } },   // repli : Kevin « jamais là »
  };
  const place = (p, cartes) => Object.fromEntries(cartes.map((c) => [c.id, { r: c.id, s: p[c.id] }]));
  const juge1 = (p) => Object.fromEntries(jalonsPlanning({ plannings: { calage63: { v1: { place: place(p, CARTES_V1) } } } }, P).L
    .filter((l) => l.version === '1er envoi').map((l) => [l.jalon, l.ok]));
  let pareil = 0, diff = 0, vraisValides = 0;
  for (const p of tousLesPlans(CARTES_V1)) {
    if (!valide(CHAUFFEURS_V1, CARTES_V1, p)) continue;
    const j = juge1(p);
    if (!(j.effectif && j.cote && j.imposee)) { diff++; continue; }
    vraisValides++;
    if (j.sans === rSansNecessite(CHAUFFEURS_V1, CARTES_V1, p)) pareil++; else diff++;
  }
  console.log(`\n=== Contre-épreuve avec le vrai moteur ===\n- ${vraisValides} plans valides jugés par le vrai moteur ; « sans nécessité » identique à ma règle pour ${pareil}, différent pour ${diff}.`);
  const jugeV2 = (s2) => jalonsPlanning({ plannings: { calage63: { v1: { place: place(v1.res.B[0], CARTES_V1) }, v2: { place: s2 } } } }, P).L
    .filter((l) => l.version !== '1er envoi').map((l) => `${l.jalon}:${l.ok ? 'ok' : 'KO'}`).join(' ');
  const solV2 = place({ ...v2.res.B[0], kevin: 7 }, CARTES_V1);
  console.log(`- Repli « Kevin reste, dispo: 9 » : solution attendue après l'imprévu, carte de Kevin restée posée : ${jugeV2(solV2)}`);
  const sansK = { ...solV2 }; delete sansK.kevin;
  console.log(`- Même plan, mais l'élève a retiré la carte de Kevin (elle reste « à placer ») : ${jugeV2(sansK)}`);
  console.log(`- Planning du 1er envoi renvoyé sans changement : ${jugeV2(place(v1.res.B[0], CARTES_V1))}`);
  P.repriseIdentique = 'faux';
  console.log(`- Idem avec repriseIdentique: 'faux' : ${jugeV2(place(v1.res.B[0], CARTES_V1))}`);
}
