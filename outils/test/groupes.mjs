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


// =====================================================================================================
// ---------- 39. Plusieurs enseignants (chantier 11, lot 11a, 09/10/2026)
// Deux enseignants en démonstration : l'écran de connexion de démo a un champ « adresse » (#mail) et
// `connexionProf(email)` crée un second enseignant. A = prof.demo@prepalog.local, B = collegue@prepalog.local.
// La démonstration imite le mode réel (même garde dans core/collegues.js, même message, mêmes suffixes) : ces
// cas éprouvent donc, côté mode réel, ce qui est écrit une fois dans ce fichier partagé.
// Chaque cas se termine en se reconnectant en A : le bloc suivant ne doit pas hériter de B. Les données de ces
// cas portent le préfixe « ZZ DUO » (groupes) et « zd » (matricules) ; `menageDuo` les efface toutes.
// =====================================================================================================
const MAIL_A = 'prof.demo@prepalog.local', MAIL_B = 'collegue@prepalog.local';
const seConnecter = async (mail) => {
  if (await page.$('#btnDeco')) await page.click('#btnDeco');
  await page.waitForSelector('#btnProf', { timeout: 6000 });
  await page.fill('#mail', mail);
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
};
const ongletEspace = async (ong) => {
  if (!(await page.$('[data-ong]'))) {
    if (await page.$('#btnRetour')) await page.click('#btnRetour');
    await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
    await page.click('#btnProfEspace');
  }
  await page.waitForSelector(`[data-ong="${ong}"]`, { timeout: 6000 });
  await page.click(`[data-ong="${ong}"]`);
  await page.waitForTimeout(250);
};
const viderToast = () => page.evaluate(() => { const t = document.getElementById('toast'); if (t) t.textContent = ''; });
// Rouvre l'espace enseignant depuis l'accueil : la liste des élèves sans groupe n'est relue qu'à son ouverture.
const rouvrirEspace = async (ong) => {
  if (await page.$('#btnRetour')) await page.click('#btnRetour');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector(`[data-ong="${ong}"]`, { timeout: 6000 });
  await page.click(`[data-ong="${ong}"]`);
  await page.waitForTimeout(250);
};
const leToast = () => page.evaluate(() => document.getElementById('toast')?.textContent || '');
const attendreToast = async (re) => {
  await page.waitForFunction((src) => new RegExp(src).test(document.getElementById('toast')?.textContent || ''), re.source, { timeout: 5000 })
    .catch(async () => { throw new Error(`message attendu ${re} — affiché : « ${await leToast()} »`); });
};
const lireDemo = (cle) => page.evaluate((k) => JSON.parse(localStorage.getItem('prepalog:' + k) || 'null'), cle);
const uidDe = async (mail) => (await page.evaluate((m) => {
  const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
  return Object.keys(u).find((k) => u[k].email === m) || null;
}, mail));
// Crée un groupe depuis l'écran (onglet Groupes).
const creerGroupeEcran = async (nom) => {
  await ongletEspace('groupes');
  await page.fill('#gNom', nom);
  await viderToast();
  await page.click('#btnCreerG');
};
// Active un groupe (s'il ne l'est pas déjà) depuis l'onglet Groupes.
const activerGroupe = async (gid) => {
  await ongletEspace('groupes');
  if (await page.$(`[data-actif="${gid}"]`)) await page.click(`[data-actif="${gid}"]`);
  await page.waitForSelector('#panProfs', { timeout: 6000 });
};
const lignesGroupes = () => page.$$eval('#contenuProf tbody tr', (l) => l.map((r) => r.textContent));
// Crée des élèves avec le backend de la page (celui du compte connecté : `creePar` = ce compte).
const creerElevesDuo = (gid, liste) => page.evaluate(async ([g, l]) => {
  const { creerBackendDemo } = await import('/core/backend-demo.js');
  return creerBackendDemo().creerEleves(g, l);
}, [gid, liste]);
const essaiBackend = (corps, arg) => page.evaluate(async ([c, a]) => {
  const { creerBackendDemo } = await import('/core/backend-demo.js');
  const B = creerBackendDemo();
  try { return { ok: true, r: await (new Function('B', 'a', `return (async () => { ${c} })()`))(B, a) }; }
  catch (e) { return { ok: false, message: e.message }; }
}, [corps, arg]);
const estConnecte = (mail) => page.evaluate((m) => {
  const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
  const s = JSON.parse(localStorage.getItem('prepalog:session') || 'null');
  return !!s && !!u[s] && u[s].email === m && !!document.getElementById('btnDeco');
}, mail);
const menageDuo = () => page.evaluate(() => {
  const j = (k) => JSON.parse(localStorage.getItem(k) || 'null');
  const g = j('prepalog:groupes') || {};
  const u = j('prepalog:users') || {};
  Object.keys(g).filter((k) => /^ZZ DUO/.test(g[k].nom)).forEach((k) => {
    delete g[k];
    Object.keys(localStorage).filter((x) => x.startsWith(`prepalog:travaux/${k}/`) || x === `prepalog:travauxIdx/${k}`).forEach((x) => localStorage.removeItem(x));
  });
  Object.keys(u).filter((k) => /^zd/.test(u[k].matricule || '')).forEach((k) => {
    Object.keys(localStorage).filter((x) => x.startsWith(`prepalog:prive/${k}/`)).forEach((x) => localStorage.removeItem(x));
    delete u[k];
  });
  localStorage.setItem('prepalog:groupes', JSON.stringify(g));
  localStorage.setItem('prepalog:users', JSON.stringify(u));
});
// Un cas à deux enseignants : on repart toujours de A, et on y revient, qu'il réussisse ou non.
const casDuo = (nom, corps) => v(nom, async () => {
  try {
    if (!(await estConnecte(MAIL_A))) await seConnecter(MAIL_A);
    await corps();
  } finally {
    if (!(await estConnecte(MAIL_A))) await seConnecter(MAIL_A).catch(() => {});
  }
});
await menageDuo();

// ---------- 39 a. D1 : un nom pris par un collègue reçoit un suffixe ; le sien est refusé
await casDuo('plusieurs enseignants : un nom de groupe déjà pris par un collègue reçoit un suffixe, un nom déjà pris par soi est refusé', async () => {
  await creerGroupeEcran('ZZ DUO');
  await attendreToast(/Groupe créé/);
  const uidA = await page.evaluate(() => JSON.parse(localStorage.getItem('prepalog:session')));
  await seConnecter(MAIL_B);
  const uidB = await page.evaluate(() => JSON.parse(localStorage.getItem('prepalog:session')));
  if (uidA === uidB) throw new Error('le second enseignant est le même compte que le premier');
  await ongletEspace('groupes');
  if ((await lignesGroupes()).some((t) => /ZZ DUO/.test(t))) throw new Error('B voit le groupe de A dans sa liste');
  await creerGroupeEcran('ZZ DUO');
  await attendreToast(/Groupe créé/);
  const g = await lireDemo('groupes');
  const duo = Object.keys(g).filter((k) => g[k].nom === 'ZZ DUO').sort();
  if (duo.length !== 2) throw new Error('deux groupes « ZZ DUO » attendus : ' + duo.join(', '));
  const suffixe = duo.find((k) => k !== 'zz-duo');
  if (!/^zz-duo-[a-z0-9]{1,6}$/.test(suffixe)) throw new Error('identifiant suffixé inattendu : ' + suffixe);
  if (g['zz-duo'].profs.join() !== uidA) throw new Error('le groupe de A a changé de mains : ' + g['zz-duo'].profs);
  if (g[suffixe].profs.join() !== uidB) throw new Error('le groupe suffixé doit être à B seul : ' + g[suffixe].profs);
  // B ne voit que le sien, sous le même nom.
  const lignes = await lignesGroupes();
  if (lignes.filter((t) => /ZZ DUO/.test(t)).length !== 1) throw new Error('B doit voir un seul « ZZ DUO » : ' + lignes.join(' | '));
  // Le sien une seconde fois : refusé, et rien n'est créé.
  await creerGroupeEcran('ZZ DUO');
  await attendreToast(/Vous avez déjà un groupe de ce nom/);
  await seConnecter(MAIL_A);
  await creerGroupeEcran('ZZ DUO');
  await attendreToast(/Vous avez déjà un groupe de ce nom/);
  const apres = await lireDemo('groupes');
  const encore = Object.keys(apres).filter((k) => apres[k].nom === 'ZZ DUO');
  if (encore.length !== 2) throw new Error('un groupe en trop a été créé : ' + encore.join(', '));
});

// ---------- 39 b. D3 : chacun ne voit que ses élèves sans groupe, plus ceux qui n'ont aucun auteur
await casDuo('plusieurs enseignants : les élèves sans groupe se répartissent par auteur, celui sans auteur est visible de tous', async () => {
  const uidB = await uidDe(MAIL_B);
  await page.evaluate(() => {
    const u = JSON.parse(localStorage.getItem('prepalog:users'));
    u['zd-a'] = { role: 'eleve', nom: 'DUOA', prenom: 'Alix', matricule: 'zd01', code: 'a1', groupes: [], creePar: JSON.parse(localStorage.getItem('prepalog:session')) };
    u['zd-sans'] = { role: 'eleve', nom: 'DUOS', prenom: 'Sam', matricule: 'zd03', code: 's1', groupes: [] };
    localStorage.setItem('prepalog:users', JSON.stringify(u));
  });
  await page.evaluate((b) => {
    const u = JSON.parse(localStorage.getItem('prepalog:users'));
    u['zd-b'] = { role: 'eleve', nom: 'DUOB', prenom: 'Bao', matricule: 'zd02', code: 'b1', groupes: [], creePar: b };
    localStorage.setItem('prepalog:users', JSON.stringify(u));
  }, uidB);
  // A : ses élèves et celui sans auteur, jamais ceux de B.
  await rouvrirEspace('groupes');
  if (!/\(2\)/.test(await page.textContent('[data-ong="orphelins"]'))) throw new Error('A doit en compter 2 : ' + await page.textContent('[data-ong="orphelins"]'));
  await page.click('[data-ong="orphelins"]');
  let t = await page.textContent('#contenuProf');
  if (!/DUOA/.test(t) || !/DUOS/.test(t)) throw new Error('A doit voir DUOA et DUOS : ' + t.slice(0, 300));
  if (/DUOB/.test(t)) throw new Error('A voit l\'élève sans groupe de B');
  const ligneSans = await page.$$eval('#contenuProf tbody tr', (l) => l.filter((r) => /DUOS/.test(r.textContent)).map((r) => r.textContent));
  if (!/créé hors du site/.test(ligneSans[0] || '')) throw new Error('l\'élève sans auteur n\'est pas étiqueté « créé hors du site »');
  if (/créé hors du site/.test((await page.$$eval('#contenuProf tbody tr', (l) => l.filter((r) => /DUOA/.test(r.textContent)).map((r) => r.textContent)))[0])) {
    throw new Error('l\'élève de A est étiqueté « créé hors du site » à tort');
  }
  // B : l'inverse.
  await seConnecter(MAIL_B);
  await ongletEspace('orphelins');
  t = await page.textContent('#contenuProf');
  if (!/DUOB/.test(t) || !/DUOS/.test(t)) throw new Error('B doit voir DUOB et DUOS : ' + t.slice(0, 300));
  if (/DUOA/.test(t)) throw new Error('B voit l\'élève sans groupe de A');
  // Ce qui reste : les trois profils sont intacts, personne n'a été supprimé ni rattaché.
  const u = await lireDemo('users');
  for (const k of ['zd-a', 'zd-b', 'zd-sans']) {
    if (!u[k] || (u[k].groupes || []).length) throw new Error(`${k} devait rester tel quel, sans groupe : ${JSON.stringify(u[k])}`);
  }
  await menageDuo();
});

// ---------- 39 c. D2 : le responsable ajoute un collègue par son adresse
await casDuo('plusieurs enseignants : le responsable ajoute un collègue par son adresse (adresse inconnue : message lisible)', async () => {
  await creerGroupeEcran('ZZ DUO C');
  await attendreToast(/Groupe créé/);
  const uidA = await page.evaluate(() => JSON.parse(localStorage.getItem('prepalog:session')));
  const uidB = await uidDe(MAIL_B);
  await page.waitForSelector('#collegueMail');
  // Le panneau montre le responsable seul, avec la case d'ajout.
  let panneau = await page.textContent('#panProfs');
  if (!/responsable/.test(panneau) || /Quitter/.test(panneau)) throw new Error('panneau du responsable inattendu : ' + panneau);
  await page.fill('#collegueMail', 'inconnu@prepalog.local');
  await viderToast();
  await page.click('#btnAjoutCollegue');
  await attendreToast(/Aucun enseignant avec cette adresse/);
  if ((await lireDemo('groupes'))['zz-duo-c'].profs.length !== 1) throw new Error('un inconnu a été ajouté');
  await page.fill('#collegueMail', ' ' + MAIL_B.toUpperCase() + ' ');
  await viderToast();
  await page.click('#btnAjoutCollegue');
  await attendreToast(/peut maintenant travailler/);
  const g = (await lireDemo('groupes'))['zz-duo-c'];
  if (g.profs.join() !== [uidA, uidB].join()) throw new Error('profs attendus [A, B] : ' + g.profs);
  panneau = await page.textContent('#panProfs');
  if ((await page.$$('[data-retirer-prof]')).length !== 1) throw new Error('un bouton « Retirer » attendu pour le collègue');
  // Une seconde fois : déjà dedans, et la liste ne change pas.
  await page.fill('#collegueMail', MAIL_B);
  await viderToast();
  await page.click('#btnAjoutCollegue');
  await attendreToast(/déjà dans le groupe/);
  if ((await lireDemo('groupes'))['zz-duo-c'].profs.length !== 2) throw new Error('doublon dans profs');
});

// ---------- 39 d. D2/principe 4 : ce que voit le collègue, et ce qu'il n'a pas le droit de supprimer
await casDuo('plusieurs enseignants : le collègue voit le groupe, ses élèves et le suivi, « Retirer du groupe » remplace « Supprimer » sur l\'élève d\'un autre', async () => {
  const uidA = await page.evaluate(() => JSON.parse(localStorage.getItem('prepalog:session')));
  await creerElevesDuo('zz-duo-c', [{ nom: 'DUOA', prenom: 'Alix', matricule: 'zd11', code: 'c1' }]);
  const uidEleveA = Object.entries(await lireDemo('users')).find(([, u]) => u.matricule === 'zd11')[0];
  if ((await lireDemo('users'))[uidEleveA].creePar !== uidA) throw new Error('creePar n\'est pas écrit à la création d\'un élève');
  // Du travail, une base privée et un classement à conserver : on les retrouvera intacts.
  await page.evaluate(async (uid) => {
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    const B = creerBackendDemo();
    await B.ecrireScore('zz-duo-c', uid, 'zz-act', { score: 1, max: 2 });
    await B.ecrireJeuPrive(uid, 'zz-act', { a: 1 });
  }, uidEleveA);

  await seConnecter(MAIL_B);
  await ongletEspace('groupes');
  const ligne = await page.$$eval('#contenuProf tbody tr', (l) => l.filter((r) => /ZZ DUO C/.test(r.textContent)).map((r) => r.textContent));
  if (ligne.length !== 1) throw new Error('B doit voir le groupe de A, une fois : ' + ligne.length);
  if (!/groupe de/.test(ligne[0])) throw new Error('l\'étiquette « groupe de <responsable> » manque : ' + ligne[0]);
  if (await page.$('[data-suppr="zz-duo-c"]')) throw new Error('B a « Supprimer » sur un groupe dont il n\'est pas responsable');
  if (!(await page.$('[data-quitter="zz-duo-c"]'))) throw new Error('B n\'a pas « Quitter » sur ce groupe');
  await activerGroupe('zz-duo-c');
  const panneau = await page.textContent('#panProfs');
  if (await page.$('#collegueMail') || !/Quitter ce groupe/.test(panneau)) throw new Error('le panneau du collègue est inattendu : ' + panneau);

  // Liste de classe : l'élève d'A est là, avec « Retirer du groupe », sans « Supprimer ».
  await page.click('[data-ong="comptes"]');
  await page.waitForSelector(`[data-retirere="${uidEleveA}"]`, { timeout: 6000 });
  if (await page.$(`[data-suppre="${uidEleveA}"]`)) throw new Error('« Supprimer » offert sur un élève créé par un collègue');
  if (!/DUOA/.test(await page.textContent('#contenuProf'))) throw new Error('l\'élève du groupe n\'est pas listé chez B');
  // Le suivi s'ouvre.
  await page.click('[data-ong="suivi"]');
  await page.waitForFunction(() => !/Chargement du suivi/.test(document.getElementById('contenuProf')?.textContent || ''), null, { timeout: 8000 });
  if (!/DUOA/.test(await page.textContent('#contenuProf'))) throw new Error('le suivi de B ne montre pas l\'élève d\'A');

  // Un élève créé par B dans ce groupe est à lui : il le supprime.
  await creerElevesDuo('zz-duo-c', [{ nom: 'DUOB', prenom: 'Bao', matricule: 'zd12', code: 'c2' }]);
  await page.click('[data-ong="comptes"]');
  const uidEleveB = Object.entries(await lireDemo('users')).find(([, u]) => u.matricule === 'zd12')[0];
  await page.waitForSelector(`[data-suppre="${uidEleveB}"]`, { timeout: 6000 });
  if (await page.$(`[data-retirere="${uidEleveB}"]`)) throw new Error('« Retirer du groupe » offert sur son propre élève');

  // Retirer l'élève d'A du groupe : il n'est pas supprimé, et ce qui reste est nommé.
  page.once('dialog', (d) => d.accept());
  await viderToast();
  await page.click(`[data-retirere="${uidEleveA}"]`);
  await attendreToast(/retiré du groupe/);
  if (!/Il reste : ses travaux/.test(await leToast())) throw new Error('le message ne nomme pas ce qui reste : ' + await leToast());
  const u = await lireDemo('users');
  if (!u[uidEleveA]) throw new Error('le profil de l\'élève d\'A a disparu');
  if (u[uidEleveA].groupes.length) throw new Error('l\'élève devait être détaché : ' + u[uidEleveA].groupes);
  if (!(await lireDemo(`travaux/zz-duo-c/${uidEleveA}/zz-act`))) throw new Error('ses travaux ont été effacés');
  if (!(await lireDemo(`prive/${uidEleveA}/zz-act`))) throw new Error('sa base privée a été effacée');
  if (u[uidEleveB].groupes.join() !== 'zz-duo-c') throw new Error('l\'élève de B a bougé');
  // Il n'apparaît pas chez B (créé par A), il réapparaît chez A.
  await ongletEspace('orphelins');
  if (/DUOA/.test(await page.textContent('#contenuProf'))) throw new Error('l\'élève détaché apparaît chez le collègue, pas chez son auteur');
  await seConnecter(MAIL_A);
  await ongletEspace('orphelins');
  if (!/DUOA/.test(await page.textContent('#contenuProf'))) throw new Error('l\'élève détaché ne réapparaît pas chez son auteur');
});

// ---------- 39 e. la garde du backend refuse AVANT d'écrire, et nomme ce qui reste
await casDuo('plusieurs enseignants : la garde du backend refuse la suppression d\'un élève ou d\'un groupe qui n\'est pas à soi, sans rien effacer', async () => {
  await creerGroupeEcran('ZZ DUO E');
  await attendreToast(/Groupe créé/);
  await creerElevesDuo('zz-duo-e', [{ nom: 'DUOE', prenom: 'Eva', matricule: 'zd21', code: 'e1' }]);
  const uidEleve = Object.entries(await lireDemo('users')).find(([, u]) => u.matricule === 'zd21')[0];
  await page.evaluate(async (uid) => {
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    const B = creerBackendDemo();
    await B.ecrireScore('zz-duo-e', uid, 'zz-act', { score: 1, max: 2 });
    await B.ecrireJeuPrive(uid, 'zz-act', { a: 1 });
    await B.ajouterCollegue('zz-duo-e', 'collegue@prepalog.local');
  }, uidEleve);

  await seConnecter(MAIL_B);
  const r1 = await essaiBackend('return B.supprimerEleve(a)', uidEleve);
  if (r1.ok || !/créé par un collègue/.test(r1.message)) throw new Error('la suppression de l\'élève d\'un autre devait être refusée : ' + JSON.stringify(r1));
  const r2 = await essaiBackend('return B.supprimerGroupe(a)', 'zz-duo-e');
  if (r2.ok || !/responsable/.test(r2.message)) throw new Error('la suppression du groupe par un collègue devait être refusée : ' + JSON.stringify(r2));
  // Tout est resté : profil, travaux, base privée, groupe avec ses deux enseignants.
  const u = await lireDemo('users');
  const g = await lireDemo('groupes');
  if (!u[uidEleve] || u[uidEleve].groupes.join() !== 'zz-duo-e') throw new Error('l\'élève a été touché par un refus');
  if (!(await lireDemo(`travaux/zz-duo-e/${uidEleve}/zz-act`)) || !(await lireDemo(`prive/${uidEleve}/zz-act`))) throw new Error('un refus a laissé l\'élève sans travaux ou sans base privée');
  if (!g['zz-duo-e'] || g['zz-duo-e'].profs.length !== 2) throw new Error('le groupe a été touché par un refus');
  // Un élève aussi présent dans le groupe d'un collègue : jamais supprimé, même par son auteur.
  await seConnecter(MAIL_A);
  await creerGroupeEcran('ZZ DUO E2');
  await attendreToast(/Groupe créé/);
  await page.evaluate((uid) => {
    const u = JSON.parse(localStorage.getItem('prepalog:users'));
    u[uid].groupes = ['zz-duo-e', 'zz-duo-e2'];
    localStorage.setItem('prepalog:users', JSON.stringify(u));
    const g = JSON.parse(localStorage.getItem('prepalog:groupes'));
    g['zz-duo-e2'].profs = [JSON.parse(localStorage.getItem('prepalog:session'))];
    localStorage.setItem('prepalog:groupes', JSON.stringify(g));
  }, uidEleve);
  await seConnecter(MAIL_B);
  const r3 = await essaiBackend('return B.supprimerEleve(a)', uidEleve);
  if (r3.ok || !/pas le vôtre|créé par un collègue/.test(r3.message)) throw new Error('l\'élève de deux groupes devait être refusé à B : ' + JSON.stringify(r3));
  if (!(await lireDemo('users'))[uidEleve]) throw new Error('l\'élève de deux groupes a été supprimé');
});

// ---------- 39 f. le responsable supprime ce que son collègue a créé, puis le retire : ce qui reste est nommé
await casDuo('plusieurs enseignants : le responsable supprime l\'élève créé par son collègue, retire le collègue, et la liste de B se vide', async () => {
  const uidB = await uidDe(MAIL_B);
  await seConnecter(MAIL_B);
  await creerElevesDuo('zz-duo-e', [{ nom: 'DUOF', prenom: 'Fred', matricule: 'zd31', code: 'f1' }]);
  const uidEleveB = Object.entries(await lireDemo('users')).find(([, u]) => u.matricule === 'zd31')[0];
  if ((await lireDemo('users'))[uidEleveB].creePar !== uidB) throw new Error('creePar de B attendu');
  await seConnecter(MAIL_A);
  // L'élève du collègue figure dans une liste de classe dont A est responsable : « Supprimer » est offert à A.
  await activerGroupe('zz-duo-e');
  await page.click('[data-ong="comptes"]');
  await page.waitForSelector(`[data-suppre="${uidEleveB}"]`, { timeout: 6000 });
  // Retirer le collègue : confirmation, puis message qui nomme l'élève qu'il a créé.
  await page.click('[data-ong="groupes"]');
  await page.waitForSelector('[data-retirer-prof]');
  page.once('dialog', (d) => d.accept());
  await viderToast();
  await page.click('[data-retirer-prof]');
  await attendreToast(/n'est plus dans le groupe/);
  if (!/1 élève qu'il a créé/.test(await leToast())) throw new Error('le message ne nomme pas l\'élève resté : ' + await leToast());
  const g = (await lireDemo('groupes'))['zz-duo-e'];
  if (g.profs.length !== 1) throw new Error('profs après retrait : ' + g.profs);
  const u = await lireDemo('users');
  if (!u[uidEleveB] || u[uidEleveB].groupes.join() !== 'zz-duo-e') throw new Error('l\'élève créé par le collègue devait rester dans la classe');
  // Chez B, le groupe a disparu.
  await seConnecter(MAIL_B);
  await ongletEspace('groupes');
  if ((await lignesGroupes()).some((t) => /ZZ DUO E\b/.test(t))) throw new Error('le groupe retiré figure encore chez B');
  // Retour chez A : l'élève du collègue, il est responsable, se supprime.
  await seConnecter(MAIL_A);
  const rr = await essaiBackend('return B.supprimerEleve(a)', uidEleveB);
  if (!rr.ok) throw new Error('le responsable devait pouvoir supprimer l\'élève créé par son collègue : ' + rr.message);
  if ((await lireDemo('users'))[uidEleveB]) throw new Error('l\'élève est encore là');
});

// ---------- 39 g. le collègue quitte le groupe de lui-même
await casDuo('plusieurs enseignants : le collègue quitte le groupe, qui reste entier chez son responsable', async () => {
  await page.evaluate(async () => {
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    await creerBackendDemo().ajouterCollegue('zz-duo-e', 'collegue@prepalog.local');
  });
  await creerElevesDuo('zz-duo-e', [{ nom: 'DUOG', prenom: 'Gus', matricule: 'zd41', code: 'g1' }]);
  await seConnecter(MAIL_B);
  await ongletEspace('groupes');
  await page.waitForSelector('[data-quitter="zz-duo-e"]');
  page.once('dialog', (d) => d.accept());
  await viderToast();
  await page.click('tbody [data-quitter="zz-duo-e"]');
  await attendreToast(/Vous avez quitté le groupe/);
  const g = (await lireDemo('groupes'))['zz-duo-e'];
  if (!g || g.profs.length !== 1) throw new Error('le groupe doit rester, au responsable seul : ' + JSON.stringify(g && g.profs));
  if (await page.$('[data-quitter="zz-duo-e"]')) throw new Error('le groupe quitté figure encore chez B');
  const u = Object.values(await lireDemo('users')).filter((x) => x.matricule === 'zd41');
  if (u.length !== 1 || u[0].groupes.join() !== 'zz-duo-e') throw new Error('l\'élève du groupe a bougé');
  // Le responsable, lui, ne peut pas être retiré, ni quitter par ce chemin.
  await seConnecter(MAIL_A);
  const uidA = await page.evaluate(() => JSON.parse(localStorage.getItem('prepalog:session')));
  const r = await essaiBackend('return B.retirerCollegue("zz-duo-e", a)', uidA);
  if (r.ok || !/responsable/.test(r.message)) throw new Error('le responsable ne doit pas pouvoir être retiré : ' + JSON.stringify(r));
});

// ---------- 39 h. Conduite de séance : deux enseignants qui ouvrent chacun une séance ne s'écrasent pas
await casDuo('plusieurs enseignants : ouvrir une séance ne réécrit que sa case (la réécriture de la table entière écraserait le collègue)', async () => {
  await creerGroupeEcran('ZZ DUO H');
  await attendreToast(/Groupe créé/);
  await ongletEspace('seance');
  await page.waitForSelector('[data-ouvre]', { timeout: 6000 });
  const ids = await page.$$eval('[data-ouvre]:not(:checked):not(:disabled)', (l) => l.slice(0, 2).map((c) => c.dataset.ouvre));
  if (ids.length < 2) throw new Error('il faut deux séances fermées et ouvrables : ' + ids);
  const [X, Y] = ids;
  // La page d'A a chargé le groupe avant que B n'ouvre X (simulé par une écriture directe dans le stockage).
  await page.evaluate((x) => {
    const g = JSON.parse(localStorage.getItem('prepalog:groupes'));
    g['zz-duo-h'].ouverts = { ...(g['zz-duo-h'].ouverts || {}), [x]: true };
    localStorage.setItem('prepalog:groupes', JSON.stringify(g));
  }, X);
  await viderToast();
  await page.click(`[data-ouvre="${Y}"]`);
  await attendreToast(/Activité ouverte/);
  const ouv = (await lireDemo('groupes'))['zz-duo-h'].ouverts;
  if (ouv[Y] !== true) throw new Error('la séance cochée n\'est pas ouverte : ' + JSON.stringify(ouv));
  if (ouv[X] !== true) throw new Error('la séance ouverte par le collègue a été écrasée : ' + JSON.stringify(ouv));
  // Demi-groupe : même garantie, sous `ouvertsDemi`.
  await page.evaluate(() => {
    const g = JSON.parse(localStorage.getItem('prepalog:groupes'));
    g['zz-duo-h'].demis = [{ id: 'dh1', nom: 'DH1' }];
    localStorage.setItem('prepalog:groupes', JSON.stringify(g));
  });
  const nouvelle = await page.evaluate(async () => {
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    const B = creerBackendDemo();
    await B.majGroupe('zz-duo-h', { 'ouvertsDemi.dh1.a-b': true });
    await B.majGroupe('zz-duo-h', { 'ouvertsDemi.dh1.c-d': false });
    return (await B.groupe('zz-duo-h')).ouvertsDemi;
  });
  if (JSON.stringify(nouvelle) !== JSON.stringify({ dh1: { 'a-b': true, 'c-d': false } })) throw new Error('champ pointé sous un demi-groupe : ' + JSON.stringify(nouvelle));
});

// ---------- 39 i. les refus se lisent en français
await v('plusieurs enseignants : un refus des règles et un matricule déjà pris se lisent en français', async () => {
  const r = await page.evaluate(async () => {
    const { lisible } = await import('/core/collegues.js');
    return {
      refus: lisible({ code: 'permission-denied', message: 'Missing or insufficient permissions.' }),
      mat: lisible({ code: 'auth/email-already-in-use', message: 'Firebase: Error (auth/email-already-in-use).' }),
      autre: lisible({ message: 'Autre chose.' }), vide: lisible({}, 'Défaut.'),
    };
  });
  if (!/Refusé par les règles de sécurité/.test(r.refus) || /Missing|insufficient/.test(r.refus)) throw new Error('refus : ' + r.refus);
  if (!/matricule est déjà utilisé/.test(r.mat) || /auth\//.test(r.mat)) throw new Error('matricule : ' + r.mat);
  if (r.autre !== 'Autre chose.' || r.vide !== 'Défaut.') throw new Error('messages ordinaires altérés : ' + JSON.stringify(r));
});

// ---------- 39 j. ménage : plus aucune trace de ces cas, et le bloc suivant repart de A
await v('plusieurs enseignants : le ménage ne laisse rien, la session est celle de prof.demo', async () => {
  await seConnecter(MAIL_A);
  await menageDuo();
  const r = await page.evaluate(() => {
    const g = JSON.parse(localStorage.getItem('prepalog:groupes') || '{}');
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    const s = JSON.parse(localStorage.getItem('prepalog:session'));
    return { groupes: Object.keys(g).filter((k) => /duo/i.test(k)), eleves: Object.values(u).filter((x) => /^zd/.test(x.matricule || '')).length, email: u[s] && u[s].email };
  });
  if (r.groupes.length || r.eleves) throw new Error('reste : ' + JSON.stringify(r));
  if (r.email !== MAIL_A) throw new Error('session inattendue : ' + r.email);
});

}
