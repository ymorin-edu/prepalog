// Suite de tests de Prepalog — bloc « groupes » : la suppression d'un groupe et les élèves sans groupe.
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs groupes` ne lance que ce bloc (précédé de : socle, dont il a besoin).
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

export default async function bloc({ v, page }) {

// ---------- 38 bis. suppression d'un groupe : qui part, qui reste
// Régression du 01/10/2026, trouvée en production et pas par la suite. `supprimerGroupe`
// se contentait de détacher les élèves. Or `elevesDuGroupe` interroge `users` par
// appartenance à un groupe et l'application n'a pas de vue « tous les élèves » : un élève
// détaché de son dernier groupe ne remontait plus dans aucun écran, profil, code et
// identifiant compris, et devenait impossible à supprimer autrement que dans la console.
// Ce test tient les deux moitiés de la règle à la fois — sans la seconde, « purger tout »
// passerait aussi, et ce serait un autre dégât.
await v('suppression de groupe : les élèves sans autre groupe partent avec lui', async () => {
  const r = await page.evaluate(async () => {
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    const B = creerBackendDemo();
    // Pas de connexionProf ici : `courant` est au niveau du module, donc partagé avec
    // l'application de la page, et s'y connecter rejouerait tout son rendu.
    const profUid = 'zz-prof-test';
    const g1 = await B.creerGroupe({ nom: 'ZZ TEST A', annee: '', niveau: '', profUid });
    const g2 = await B.creerGroupe({ nom: 'ZZ TEST B', annee: '', niveau: '', profUid });
    await B.creerEleves(g1.id, [
      { nom: 'SOLO', prenom: 'Sam', matricule: 'zz01', code: 'x1' },
      { nom: 'DOUBLE', prenom: 'Dia', matricule: 'zz02', code: 'x2' },
    ]);
    // Rattacher Dia au second groupe : l'interface ne sait pas le faire, le champ si.
    const dia = (await B.elevesDuGroupe(g1.id)).find((e) => e.matricule === 'zz02');
    const u = JSON.parse(localStorage.getItem('prepalog:users'));
    u[dia.uid].groupes = [g1.id, g2.id];
    localStorage.setItem('prepalog:users', JSON.stringify(u));

    const res = await B.supprimerGroupe(g1.id);

    const apres = Object.values(JSON.parse(localStorage.getItem('prepalog:users')))
      .filter((x) => x.role === 'eleve');
    const sortie = {
      res,
      restants: apres.map((x) => x.matricule),
      orphelins: apres.filter((x) => !(x.groupes || []).length).length,
    };
    await B.supprimerGroupe(g2.id);   // ménage
    return sortie;
  });
  if (r.res.supprimes !== 1) throw new Error(`supprimes = ${r.res.supprimes}, 1 attendu`);
  if (r.res.detaches !== 1) throw new Error(`detaches = ${r.res.detaches}, 1 attendu`);
  if (r.restants.includes('zz01')) throw new Error('l\'élève qui n\'avait que ce groupe a survécu');
  if (!r.restants.includes('zz02')) throw new Error('l\'élève du second groupe a été supprimé à tort');
  if (r.orphelins) throw new Error(`${r.orphelins} élève(s) sans aucun groupe après suppression`);
});

// ---------- 38 ter. la confirmation dit ce qu'elle emporte, et l'emporte vraiment
// Une suppression irréversible ne se juge pas sur son code mais sur la phrase que
// l'enseignant lit avant de cliquer : c'est la seule protection qu'il ait.
await v('suppression de groupe : la confirmation nomme les élèves qui partent', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf', { timeout: 6000 });
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  const ong = await page.$('[data-ong="groupes"]');
  if (ong) await ong.click();
  await page.waitForSelector('[data-suppr]', { timeout: 6000 });

  let texte = '';
  page.once('dialog', (d) => { texte = d.message(); d.accept(); });
  await page.click('[data-suppr]');
  await page.waitForTimeout(900);

  if (!/qu'à ce groupe/.test(texte)) throw new Error('la confirmation ne prévient pas que des élèves partent : ' + texte);
  if (!/DUPONT/.test(texte) || !/MARTIN/.test(texte)) throw new Error('la confirmation ne nomme pas les élèves : ' + texte);

  // Léa et Noé n'avaient que « 1 LOG A » : ils partent avec lui. Théo est dans « TLE LOG »,
  // créé au test 12 : il doit rester intact, et c'est la moitié de la règle qu'on oublie
  // facilement — un « on purge tout » passerait le premier contrôle et pas celui-ci.
  const etat = await page.evaluate(() => Object.values(
    JSON.parse(localStorage.getItem('prepalog:users') || '{}'))
    .filter((x) => x.role === 'eleve')
    .map((x) => ({ matricule: x.matricule, groupes: (x.groupes || []).length })));
  const mat = etat.map((x) => x.matricule);
  if (mat.includes('2601') || mat.includes('2602')) throw new Error('un élève du groupe supprimé a survécu : ' + mat.join(', '));
  if (!mat.includes('2701')) throw new Error('l\'élève d\'un autre groupe a été supprimé à tort');
  const orphelins = etat.filter((x) => !x.groupes).length;
  if (orphelins) throw new Error(`${orphelins} élève(s) sans aucun groupe après la suppression`);
});

// ---------- 38 quater. la vue « élèves sans groupe » voit l'orphelin et le rattache
// L'autre moitié du cul-de-sac du 01/10/2026 : la suppression de groupe ne fabrique plus
// d'orphelins, mais ceux d'avant — et ceux que crée une manipulation dans la console
// Firebase — restaient introuvables, toutes les listes de l'application partant d'un
// groupe. On fabrique donc exactement cet état-là : un profil d'élève au champ `groupes`
// vide, comme en laisserait la console, puis on vérifie qu'il remonte et qu'il se répare.
await v('élèves sans groupe : l\'orphelin est visible et se rattache', async () => {
  await page.evaluate(() => {
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    u['zz-orphelin'] = {
      role: 'eleve', nom: 'PERDU', prenom: 'Paul',
      matricule: 'zz99', code: 'x9', groupes: [],
    };
    localStorage.setItem('prepalog:users', JSON.stringify(u));
  });

  // Rouvrir l'espace enseignant : la liste est relue à son ouverture.
  await page.click('#btnRetour');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="orphelins"]', { timeout: 6000 });

  // L'onglet porte le compte, et l'onglet « Groupes » prévient : sans cela, personne
  // n'irait regarder — c'est tout l'intérêt de la vue.
  const libelle = await page.textContent('[data-ong="orphelins"]');
  if (!/\(1\)/.test(libelle)) throw new Error('l\'onglet ne compte pas l\'orphelin : ' + libelle);
  if (!/aucun groupe/.test(await page.textContent('#contenuProf'))) {
    throw new Error('l\'onglet Groupes ne signale pas l\'élève sans groupe');
  }

  await page.click('[data-ong="orphelins"]');
  await page.waitForSelector('[data-ratt="zz-orphelin"]', { timeout: 6000 });
  const table = await page.textContent('#contenuProf');
  if (!/PERDU/.test(table) || !/zz99/.test(table)) throw new Error('l\'orphelin n\'est pas listé');
  if (!/x9/.test(table)) throw new Error('le code de l\'orphelin n\'est pas affiché');

  await page.selectOption('[data-grp="zz-orphelin"]', 'tle-log');
  await page.click('[data-ratt="zz-orphelin"]');
  await page.waitForTimeout(700);

  const etat = await page.evaluate(() => {
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    return {
      groupes: u['zz-orphelin'] ? u['zz-orphelin'].groupes : null,
      restants: Object.values(u).filter((x) => x.role === 'eleve' && !(x.groupes || []).length).length,
    };
  });
  if (!etat.groupes || !etat.groupes.includes('tle-log')) {
    throw new Error('le rattachement n\'a pas pris : ' + JSON.stringify(etat.groupes));
  }
  if (etat.restants) throw new Error(`${etat.restants} élève(s) encore sans groupe`);
  if (/PERDU/.test(await page.textContent('#contenuProf'))) {
    throw new Error('l\'élève rattaché figure encore dans la liste des sans-groupe');
  }
  const apres = await page.textContent('[data-ong="orphelins"]');
  if (/\(/.test(apres)) throw new Error('l\'onglet compte encore un orphelin : ' + apres);

  // Ménage : l'élève ajouté ne doit pas fausser les tests suivants.
  await page.evaluate(() => {
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    delete u['zz-orphelin'];
    localStorage.setItem('prepalog:users', JSON.stringify(u));
  });
});

// ---------- 38 quinquies. suppression d'un élève : on liste ce qui RESTE (chantier 6, 08/10/2026)
// Une suppression ne se juge pas à ce qu'elle dit emporter mais à ce qu'elle laisse. Avant le
// chantier 6, un élève supprimé laissait sa ligne de classement, les travaux d'un groupe que son
// profil ne citait plus, et son entrée demiDe / equipes. Ces tests inventorient le localStorage
// de la démonstration pour CET élève (profil, travaux, index, base privée, classements, demiDe,
// equipes) et exigent une liste vide pour celui qui part, complète pour celui qui reste.
// `lister` est recopiée dans chaque test : `page.evaluate` n'emporte pas de fermeture.
const LISTER = `(uid) => {
  const L = [];
  const K = Object.keys(localStorage).filter((k) => k.startsWith('prepalog:'));
  const j = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  if ((j('prepalog:users') || {})[uid]) L.push('profil');
  K.filter((k) => k.startsWith('prepalog:travaux/') && k.split('/')[2] === uid)
    .forEach((k) => L.push('travaux:' + k.split('/')[1]));
  K.filter((k) => k.startsWith('prepalog:travauxIdx/'))
    .forEach((k) => (j(k) || []).filter((e) => e.startsWith(uid + '|')).forEach(() => L.push('index:' + k.split('/')[1])));
  K.filter((k) => k.startsWith('prepalog:prive/' + uid + '/')).forEach(() => L.push('prive'));
  K.filter((k) => k.startsWith('prepalog:classements/')).forEach((k) => { if ((j(k) || {})[uid]) L.push('classement:' + k.split('/')[1]); });
  const g = j('prepalog:groupes') || {};
  Object.keys(g).forEach((gid) => {
    if (g[gid].demiDe && uid in g[gid].demiDe) L.push('demiDe:' + gid);
    if (g[gid].equipes && uid in g[gid].equipes) L.push('equipes:' + gid);
  });
  return L.sort();
}`;
const CATEGORIES = ['classement', 'demiDe', 'equipes', 'index', 'prive', 'profil', 'travaux'];

await v('suppression d\'un élève : rien de lui ne reste, l\'autre élève et le groupe voisin sont intacts', async () => {
  const r = await page.evaluate(async (LISTER) => {
    const lister = eval(LISTER);
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    const B = creerBackendDemo();
    const prof = B.profilCourant().uid;
    const AID = 'zz-quiz', ACT = 'zz-act';
    const gids = {};
    for (const nom of ['ZZ SUP', 'ZZ SUP B', 'ZZ AUTRE']) gids[nom] = (await B.creerGroupe({ nom, annee: '', niveau: '', profUid: prof })).id;
    const [gs, gsb, ga] = [gids['ZZ SUP'], gids['ZZ SUP B'], gids['ZZ AUTRE']];
    await B.creerEleves(gs, [
      { nom: 'PART', prenom: 'Xavier', matricule: 'zx01', code: 'c1' },
      { nom: 'RESTE', prenom: 'Yann', matricule: 'zx02', code: 'c2' },
    ]);
    const els = await B.elevesDuGroupe(gs);
    const X = els.find((e) => e.matricule === 'zx01').uid, Y = els.find((e) => e.matricule === 'zx02').uid;
    const semer = async (uid, gid) => {
      await B.ecrireScore(gid, uid, ACT, { score: 1, max: 2 });
      await B.ecrireJeuPrive(uid, ACT, { a: 1 });
      await B.poserLigne('classements', AID, uid, { gid, groupe: 'ZZ', score: 1, max: 2, temps: 3, ts: 1 });
    };
    await semer(X, gs); await semer(Y, gs);
    // Les travaux de X dans un groupe de l'enseignant que son profil NE CITE PAS.
    await B.ecrireScore(ga, X, ACT, { score: 1, max: 2 });
    await B.majGroupe(gs, { demiDe: { [X]: 'd1', [Y]: 'd1' }, equipes: { [X]: 'e1', [Y]: 'e1' } });
    await B.majGroupe(ga, { demiDe: { [X]: 'd1' } });
    await B.majGroupe(gsb, { demiDe: { [X]: 'd2' } });
    await B.ajouterLigne(`jeux/${gs}/${ACT}`, 'tab', { id: 'l1', nom: 'partagée' });
    await B.ajouterLigne(`jeux/${gsb}/${ACT}`, 'tab', { id: 'l1', nom: 'voisine' });
    const jeux = (gid) => Object.keys(localStorage).filter((k) => k.startsWith(`prepalog:jeux/${gid}/`)).length;

    const avantX = lister(X), avantY = lister(Y);
    const res = await B.supprimerEleve(X, { aids: [AID] });
    const sortie = {
      avantX, avantY, res, apresX: lister(X), apresY: lister(Y),
      jeuxGs: jeux(gs), jeuxGsb: jeux(gsb),
      groupeVoisin: !!(await B.groupe(gsb)),
    };
    // ménage
    for (const gid of [gs, gsb, ga]) await B.supprimerGroupe(gid, { aids: [AID] });
    localStorage.removeItem('prepalog:classements/' + AID);
    return sortie;
  }, LISTER);
  const cat = (l) => [...new Set(l.map((x) => x.split(':')[0]))].sort().join(',');
  // Le test n'est pas vide : avant, la liste de X porte bien les sept catégories, dont les travaux, le demiDe
  // d'un groupe que le profil ne cite pas et celui du groupe au préfixe voisin.
  if (cat(r.avantX) !== CATEGORIES.join(',')) throw new Error('semis incomplet pour l\'élève supprimé : ' + r.avantX.join(' '));
  if (!r.avantX.includes('travaux:zz-autre') || !r.avantX.includes('demiDe:zz-autre') || !r.avantX.includes('demiDe:zz-sup-b')) {
    throw new Error('semis : il manque les traces hors du groupe du profil : ' + r.avantX.join(' '));
  }
  if (r.apresX.length) throw new Error('il reste de l\'élève supprimé : ' + r.apresX.join(' '));
  // Ce qui reste, nommé : tout ce qui appartient à l'autre élève (sept catégories) ; les bases partagées ; le groupe voisin.
  if (cat(r.apresY) !== CATEGORIES.join(',')) throw new Error('l\'autre élève a perdu quelque chose : ' + r.apresY.join(' '));
  if (r.apresY.join(' ') !== r.avantY.join(' ')) throw new Error('l\'autre élève a changé : ' + r.avantY.join(' ') + ' → ' + r.apresY.join(' '));
  if (!r.jeuxGs || !r.jeuxGsb) throw new Error(`les bases partagées de la classe ont été touchées (${r.jeuxGs}, ${r.jeuxGsb})`);
  if (!r.groupeVoisin) throw new Error('le groupe voisin a disparu');
  if (!r.res || r.res.compte !== true || (r.res.restes || []).length) throw new Error('compte rendu inattendu : ' + JSON.stringify(r.res));
});

// ---------- 38 sexies. suppression d'un groupe : ni l'élève partagé, ni le groupe au préfixe voisin ne bougent
// Le groupe `zz-grp` et `zz-grp-b` : l'un est le préfixe de l'autre. Q appartient aux deux (détaché, pas
// supprimé), R seulement au voisin, P seulement au groupe supprimé. Ce qui RESTE est nommé : les bases
// partagées et le document du groupe voisin, et pour Q son profil, ses travaux du voisin, sa base privée,
// sa ligne de classement (volontairement : il existe encore) et son demiDe du voisin.
await v('suppression de groupe : P part entièrement, Q n\'est que détaché, le groupe au préfixe voisin est intact', async () => {
  const r = await page.evaluate(async (LISTER) => {
    const lister = eval(LISTER);
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    const B = creerBackendDemo();
    const prof = B.profilCourant().uid;
    const AID = 'zz-quiz', ACT = 'zz-act';
    const g1 = (await B.creerGroupe({ nom: 'ZZ GRP', annee: '', niveau: '', profUid: prof })).id;
    const g2 = (await B.creerGroupe({ nom: 'ZZ GRP B', annee: '', niveau: '', profUid: prof })).id;
    await B.creerEleves(g1, [
      { nom: 'PEU', prenom: 'Paul', matricule: 'zg01', code: 'c1' },
      { nom: 'DOUBLE', prenom: 'Quentin', matricule: 'zg02', code: 'c2' },
    ]);
    await B.creerEleves(g2, [{ nom: 'VOISIN', prenom: 'Rémi', matricule: 'zg03', code: 'c3' }]);
    const tous = [...await B.elevesDuGroupe(g1), ...await B.elevesDuGroupe(g2)];
    const P = tous.find((e) => e.matricule === 'zg01').uid, Q = tous.find((e) => e.matricule === 'zg02').uid,
      R = tous.find((e) => e.matricule === 'zg03').uid;
    await B.rattacherEleve(Q, g2);
    const semer = async (uid, gid) => {
      await B.ecrireScore(gid, uid, ACT, { score: 1, max: 2 });
      await B.poserLigne('classements', AID, uid, { gid, groupe: 'ZZ', score: 1, max: 2, temps: 3, ts: 1 });
    };
    await semer(P, g1); await semer(Q, g1); await semer(R, g2);
    await B.ecrireScore(g2, Q, ACT, { score: 1, max: 2 });
    for (const u of [P, Q, R]) await B.ecrireJeuPrive(u, ACT, { a: 1 });
    await B.majGroupe(g1, { demiDe: { [P]: 'd1', [Q]: 'd1' }, equipes: { [P]: 'e1', [Q]: 'e1' } });
    await B.majGroupe(g2, { demiDe: { [Q]: 'd1', [R]: 'd1' }, equipes: { [Q]: 'e2', [R]: 'e2' } });
    await B.ajouterLigne(`jeux/${g1}/${ACT}`, 'tab', { id: 'l1', nom: 'a' });
    await B.ajouterLigne(`jeux/${g2}/${ACT}`, 'tab', { id: 'l1', nom: 'b' });
    const jeux = (gid) => Object.keys(localStorage).filter((k) => k.startsWith(`prepalog:jeux/${gid}/`)).length;

    const avantR = lister(R);
    const res = await B.supprimerGroupe(g1, { aids: [AID] });
    const u = JSON.parse(localStorage.getItem('prepalog:users'));
    const g = JSON.parse(localStorage.getItem('prepalog:groupes'));
    const sortie = {
      res, g1, g2, avantR,
      apresP: lister(P), apresQ: lister(Q), apresR: lister(R),
      groupesQ: u[Q] && u[Q].groupes,
      jeuxG1: jeux(g1), jeuxG2: jeux(g2),
      groupe1: !!g[g1], groupe2: !!g[g2], demiDe2: g[g2] && g[g2].demiDe, equipes2: g[g2] && g[g2].equipes,
      idx1: localStorage.getItem('prepalog:travauxIdx/' + g1),
    };
    await B.supprimerGroupe(g2, { aids: [AID] });
    localStorage.removeItem('prepalog:classements/' + AID);
    return sortie;
  }, LISTER);
  if (r.res.supprimes !== 1 || r.res.detaches !== 1) throw new Error('compte rendu : ' + JSON.stringify(r.res));
  if (r.apresP.length) throw new Error('il reste de l\'élève du groupe supprimé : ' + r.apresP.join(' '));
  // Q : détaché, tout le reste est nommé.
  const attenduQ = [`classement:zz-quiz`, `demiDe:${r.g2}`, `equipes:${r.g2}`, `index:${r.g2}`, 'prive', 'profil', `travaux:${r.g2}`].sort().join(' ');
  if (r.apresQ.join(' ') !== attenduQ) throw new Error('Q devait garder exactement : ' + attenduQ + ' — liste : ' + r.apresQ.join(' '));
  if (JSON.stringify(r.groupesQ) !== JSON.stringify([r.g2])) throw new Error('Q devait n\'appartenir plus qu\'au groupe voisin : ' + JSON.stringify(r.groupesQ));
  if (r.apresR.join(' ') !== r.avantR.join(' ')) throw new Error('R (groupe voisin) a changé : ' + r.avantR.join(' ') + ' → ' + r.apresR.join(' '));
  if (r.jeuxG1) throw new Error('les bases partagées du groupe supprimé restent (' + r.jeuxG1 + ')');
  if (!r.jeuxG2) throw new Error('les bases partagées du groupe au préfixe voisin ont été emportées');
  if (r.groupe1 || r.idx1) throw new Error('le groupe supprimé ou son index de travaux subsiste');
  if (!r.groupe2) throw new Error('le groupe voisin a été supprimé');
  if (Object.keys(r.demiDe2 || {}).length !== 2) throw new Error('demiDe du groupe voisin touché : ' + JSON.stringify(r.demiDe2));
});

// ---------- 38 septies. suppression depuis l'onglet « sans groupe » : l'affectation part de TOUS les groupes
// Avant le chantier 6, ce chemin ne nettoyait aucun document de groupe (le nettoyage de demiDe n'existait
// que dans la liste de classe). On pose un orphelin affecté à un demi-groupe et à une équipe dans « TLE LOG »,
// avec une ligne de classement sur une vraie activité du registre, et on supprime depuis l'écran.
await v('élèves sans groupe : la suppression retire demiDe, équipe, classement et travaux, et laisse les autres', async () => {
  const prep = await page.evaluate(() => {
    const j = (k) => JSON.parse(localStorage.getItem(k) || 'null');
    const g = j('prepalog:groupes');
    if (!g['tle-log']) return { erreur: 'le groupe tle-log (test 12) est absent' };
    const u = j('prepalog:users');
    u['zz-sg1'] = { role: 'eleve', nom: 'SANSGROUPE', prenom: 'Sacha', matricule: 'zz98', code: 'x8', groupes: [] };
    u['zz-sg2'] = { role: 'eleve', nom: 'TEMOIN', prenom: 'Tess', matricule: 'zz97', code: 'x7', groupes: ['tle-log'] };
    localStorage.setItem('prepalog:users', JSON.stringify(u));
    g['tle-log'].demiDe = { ...(g['tle-log'].demiDe || {}), 'zz-sg1': 'd1', 'zz-sg2': 'd1' };
    g['tle-log'].equipes = { ...(g['tle-log'].equipes || {}), 'zz-sg1': 'e1', 'zz-sg2': 'e1' };
    localStorage.setItem('prepalog:groupes', JSON.stringify(g));
    for (const uid of ['zz-sg1', 'zz-sg2']) {
      localStorage.setItem(`prepalog:travaux/tle-log/${uid}/zz-act`, JSON.stringify({ uid, aid: 'zz-act', gid: 'tle-log', score: 1, max: 2 }));
      localStorage.setItem(`prepalog:prive/${uid}/zz-act`, JSON.stringify({ data: { a: 1 }, ts: 1 }));
    }
    const idx = j('prepalog:travauxIdx/tle-log') || [];
    localStorage.setItem('prepalog:travauxIdx/tle-log', JSON.stringify([...idx, 'zz-sg1|zz-act', 'zz-sg2|zz-act']));
    const cl = j('prepalog:classements/entr-conversions') || {};
    cl['zz-sg1'] = { id: 'zz-sg1', gid: 'tle-log', groupe: 'TLE LOG', score: 5, max: 20, temps: 9, ts: 1 };
    cl['zz-sg2'] = { id: 'zz-sg2', gid: 'tle-log', groupe: 'TLE LOG', score: 6, max: 20, temps: 9, ts: 1 };
    localStorage.setItem('prepalog:classements/entr-conversions', JSON.stringify(cl));
    return {};
  });
  if (prep.erreur) throw new Error(prep.erreur);

  await page.click('#btnRetour');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="orphelins"]', { timeout: 6000 });
  await page.click('[data-ong="orphelins"]');
  await page.waitForSelector('[data-suppro="zz-sg1"]', { timeout: 6000 });
  page.once('dialog', (d) => d.accept());
  await page.click('[data-suppro="zz-sg1"]');
  await page.waitForFunction(() => !JSON.parse(localStorage.getItem('prepalog:users') || '{}')['zz-sg1'], null, { timeout: 6000 });
  await page.waitForTimeout(500);

  const r = await page.evaluate((LISTER) => {
    const lister = eval(LISTER);
    return { sg1: lister('zz-sg1'), sg2: lister('zz-sg2') };
  }, LISTER);
  if (r.sg1.length) throw new Error('il reste de l\'élève sans groupe supprimé : ' + r.sg1.join(' '));
  const cat = [...new Set(r.sg2.map((x) => x.split(':')[0]))].sort().join(',');
  if (cat !== CATEGORIES.join(',')) throw new Error('l\'élève témoin a perdu quelque chose : ' + r.sg2.join(' '));

  // Ménage : le témoin et ses traces ne doivent pas fausser les blocs suivants.
  await page.evaluate(() => {
    const j = (k) => JSON.parse(localStorage.getItem(k) || 'null');
    const u = j('prepalog:users'); delete u['zz-sg2']; localStorage.setItem('prepalog:users', JSON.stringify(u));
    const g = j('prepalog:groupes');
    delete g['tle-log'].demiDe['zz-sg2']; delete g['tle-log'].equipes['zz-sg2'];
    localStorage.setItem('prepalog:groupes', JSON.stringify(g));
    localStorage.removeItem('prepalog:travaux/tle-log/zz-sg2/zz-act');
    localStorage.removeItem('prepalog:prive/zz-sg2/zz-act');
    localStorage.setItem('prepalog:travauxIdx/tle-log', JSON.stringify((j('prepalog:travauxIdx/tle-log') || []).filter((e) => !e.startsWith('zz-sg2|'))));
    const cl = j('prepalog:classements/entr-conversions') || {}; delete cl['zz-sg2'];
    localStorage.setItem('prepalog:classements/entr-conversions', JSON.stringify(cl));
  });
});

// ---------- 38 octies. « Reconstruire l'accès » : le bouton existe et répond (6b, chantier 6)
// En démonstration la fonction est un non-évènement qui réussit ; le refus (enseignant hors
// profsGlobaux) se tient dans les règles (`outils/test-regles.mjs`, 15 quater), pas ici.
await v('groupes : le bouton « Reconstruire l\'accès » répond « Accès reconstruit » en démonstration', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="groupes"]', { timeout: 6000 });
  await page.click('[data-ong="groupes"]');
  await page.waitForSelector('[data-acces]', { timeout: 6000 });
  const n = await page.$$eval('[data-acces]', (l) => l.length);
  const g = await page.$$eval('[data-suppr]', (l) => l.length);
  if (n !== g) throw new Error(`un bouton « Reconstruire l'accès » par groupe : ${n} pour ${g} groupes`);
  const txt = await page.textContent('[data-acces]');
  if (!/Reconstruire l'accès/.test(txt)) throw new Error('libellé inattendu : ' + txt);
  await page.click('[data-acces]');
  await page.waitForFunction(() => /Accès reconstruit/.test(document.getElementById('toast')?.textContent || ''), null, { timeout: 4000 });
});

}
