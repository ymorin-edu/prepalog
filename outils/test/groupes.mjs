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

}
