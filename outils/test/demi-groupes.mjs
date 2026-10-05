// Suite de tests de Prepalog — bloc « demi-groupes » : une classe coupée en demi-groupes
// (1L → 1L1 / 1L2), brief `docs/briefs/MOTEUR-demi-groupes.md` (06/10/2026).
// `node outils/test.mjs demi-groupes` ne lance que ce bloc.
//
// Ce que ces cas gardent :
//   - une classe sans demi-groupes ne change pas : aucun sélecteur, aucune colonne ;
//   - priorité d'ouverture : le réglage d'un demi-groupe, s'il existe, l'emporte sur celui de la
//     classe (dans les deux sens) ; « revenir au réglage de la classe » SUPPRIME la clé ;
//   - base de classe (portée groupe, ACT-1 Magasin) : une par demi-groupe, la base de la classe
//     pour l'élève sans demi-groupe ; Réinitialiser sous un demi-groupe ne vide que la sienne ;
//   - renommer ne casse rien ; retirer efface la base du demi-groupe retiré et laisse les autres ;
//   - le suivi et son export se filtrent par demi-groupe.
//
// Deux séances de la rubrique Quiz servent de témoins d'ouverture, servies à CE navigateur de
// test seulement : `quiz-flux` avec `ouverture: 'prof'` (fermée tant qu'on ne la coche pas) et
// `zones-entrepot` telle quelle (ouverte d'office : on la ferme pour la classe).

export default async function bloc({ v, nav }) {

const ctxD = await nav.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
await ctxD.route('**/activites/quiz-flux.js*', async (route) => {
  const r = await route.fetch();
  await route.fulfill({ response: r, body: (await r.text()).replace(/pret:\s*true,/, "pret: true, ouverture: 'prof',") });
});
const pg = await ctxD.newPage();
pg.setDefaultTimeout(6000);
const erreursD = [];
pg.on('pageerror', (e) => erreursD.push('PAGEERROR: ' + e.message));
pg.on('dialog', (d) => d.accept());
await pg.goto('http://127.0.0.1:8099/');
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const GID = 'demi-1l';
const A = ['5101', 'da01'], B_ = ['5102', 'db02'], C = ['5103', 'dc03'];
const A_OUVRIR = 'quiz-flux', D_OFFICE = 'zones-entrepot';

const versAccueil = async () => {
  if (await pg.$('#btnRetour')) await pg.click('#btnRetour');
  if (await pg.$('#btnAccueil')) await pg.click('#btnAccueil');
};
const commeEleve = async ([mat, code]) => {
  await versAccueil();
  if (await pg.$('#btnDeco')) await pg.click('#btnDeco');
  await pg.waitForSelector('#mat');
  await pg.fill('#mat', mat);
  await pg.fill('#code', code);
  await pg.click('#btnEleve');
  await pg.waitForSelector('text=Bonjour');
};
const commeProf = async () => {
  await versAccueil();
  if (await pg.$('#btnDeco')) await pg.click('#btnDeco');
  await pg.waitForSelector('#btnProf');
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
};
const onglet = async (o) => {
  if (!(await pg.$('#contenuProf'))) { await versAccueil(); await pg.click('#btnProfEspace'); }
  await pg.click(`[data-ong="${o}"]`);
  await pg.waitForTimeout(250);
};
const groupe = () => pg.evaluate((g) => JSON.parse(localStorage.getItem('prepalog:groupes') || '{}')[g], GID);
const uidDe = (mat) => pg.evaluate((m) => {
  const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
  return Object.keys(u).find((k) => u[k].matricule === m) || null;
}, mat);
const idDemi = async (nom) => ((await groupe()).demis || []).find((d) => d.nom === nom)?.id;
// Les séances Quiz que voit l'élève connecté.
const quizVus = async () => {
  await versAccueil();
  const b = await pg.$('[data-rub="quiz"]');
  if (!b || await b.isDisabled()) return [];
  await b.click();
  await pg.waitForTimeout(200);
  return pg.$$eval('[data-act]', (els) => els.map((e) => e.dataset.act));
};
// L'élève connecté ouvre ACT-1 Magasin ; ajoute un produit si `ref`, et rend les références lues.
const magasin = async (ref) => {
  await versAccueil();
  await pg.click('[data-rub="magasin"]');
  // Une rubrique à une seule activité l'ouvre directement : la tuile n'existe qu'au-delà.
  await pg.waitForSelector('#btnAjouter, [data-act="magasin"]');
  if (await pg.$('[data-act="magasin"]')) await pg.click('[data-act="magasin"]');
  await pg.waitForSelector('#btnAjouter');
  if (ref) {
    await pg.fill('#ch_reference', ref);
    await pg.fill('#ch_designation', 'Article ' + ref);
    await pg.click('#btnAjouter');
    await pg.waitForSelector(`#hoteActivite >> text=${ref}`);
  }
  await pg.waitForTimeout(200);
  return (await pg.$eval('#hoteActivite', (e) => e.textContent)).match(/REF-[A-Z0-9]+/g) || [];
};
// Les références rangées sous une base, lues dans le stockage de démonstration.
const refsDe = (cle) => pg.evaluate((k) => Object.values(JSON.parse(localStorage.getItem(`prepalog:jeux/${k}/produits`) || '{}'))
  .map((l) => l.reference), cle);
const reglerSeance = async (demiNom) => {
  await onglet('seance');
  const s = await pg.$('[data-choix-demi]');
  if (s) {
    const val = demiNom ? await idDemi(demiNom) : '';
    if ((await s.inputValue()) !== val) { await s.selectOption(val); await pg.waitForTimeout(250); }
  }
};
const cocher = async (aid, etat) => {
  const c = pg.locator(`[data-ouvre="${aid}"]`);
  if ((await c.isChecked()) !== etat) { await c.click(); await pg.waitForTimeout(300); }
};

await v('demi-groupes : classe sans demi-groupes — aucun sélecteur, aucune colonne, export inchangé', async () => {
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
  await pg.click('#btnProfEspace');
  await pg.waitForSelector('#gNom');
  await pg.fill('#gNom', 'DEMI 1L');
  await pg.click('#btnCreerG');
  await pg.waitForSelector('#panDemis');
  if (await pg.$$eval('#panDemis [data-demi]', (l) => l.length)) throw new Error('demi-groupe présent à la création');
  await onglet('comptes');
  await pg.fill('#lot', `DEMIA ; Alice ; ${A[0]} ; ${A[1]}\nDEMIB ; Bruno ; ${B_[0]} ; ${B_[1]}\nDEMIC ; Chloé ; ${C[0]} ; ${C[1]}`);
  await pg.click('#btnLot');
  await pg.waitForSelector('[data-tiers]');
  if (await pg.$('[data-demi-eleve]') || await pg.$('#avisSansDemi')) throw new Error('colonne Demi-groupe sans demi-groupes');
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#btnCsvEleves')]);
  const fs = await import('node:fs');
  if (/Demi/.test(fs.readFileSync(await dl.path(), 'utf8'))) throw new Error('export de la liste avec une colonne Demi-groupe');
  for (const o of ['suivi', 'competences', 'seance']) {
    await onglet(o);
    if (await pg.$('[data-choix-demi]')) throw new Error(`sélecteur de demi-groupe dans l'onglet ${o}`);
  }
  if (await pg.$('[data-origine], [data-contredit]')) throw new Error('étiquette de demi-groupe en Conduite de séance');
});

await v('demi-groupes : déclarer 1L1 et 1L2 dans l’onglet Groupes — ids techniques, noms libres', async () => {
  await onglet('groupes');
  for (const nom of ['1L1', '1L2']) {
    await pg.fill('#demiNouveau', nom);
    await pg.click('#btnAjoutDemi');
    await pg.waitForSelector(`[data-renommer][value="${nom}"]`);
  }
  // Un doublon est refusé.
  await pg.fill('#demiNouveau', '1l1');
  await pg.click('#btnAjoutDemi');
  await pg.waitForTimeout(200);
  const g = await groupe();
  const d = g.demis || [];
  if (d.length !== 2 || d[0].nom !== '1L1' || d[1].nom !== '1L2') throw new Error(JSON.stringify(d));
  if (d.some((x) => !/^d[a-z0-9]+$/.test(x.id)) || d[0].id === d[1].id) throw new Error('ids : ' + JSON.stringify(d));
});

await v('demi-groupes : affecter A à 1L1 et B à 1L2 dans Comptes élèves — enregistré sans redessiner, C signalé', async () => {
  await onglet('comptes');
  const [ua, ub, uc] = [await uidDe(A[0]), await uidDe(B_[0]), await uidDe(C[0])];
  const [d1, d2] = [await idDemi('1L1'), await idDemi('1L2')];
  const sel = await pg.$(`[data-demi-eleve="${ua}"]`);
  await pg.selectOption(`[data-demi-eleve="${ua}"]`, d1);
  await pg.selectOption(`[data-demi-eleve="${ub}"]`, d2);
  await pg.waitForFunction(({ gid, ua, ub, d1, d2 }) => {
    const g = JSON.parse(localStorage.getItem('prepalog:groupes'))[gid];
    return g.demiDe && g.demiDe[ua] === d1 && g.demiDe[ub] === d2;
  }, { gid: GID, ua, ub, d1, d2 });
  if (!(await sel.isVisible()) || (await sel.inputValue()) !== d1) throw new Error('la liste a été redessinée ou a perdu sa valeur');
  if (((await groupe()).demiDe || {})[uc]) throw new Error('C affecté sans raison');
  const avis = await pg.$eval('#avisSansDemi', (e) => (e.hidden ? '' : e.textContent));
  if (!/^1 élève sans demi-groupe/.test(avis)) throw new Error('avis : ' + avis);
  // Relu depuis le stockage, l'onglet redit la même chose.
  await onglet('comptes');
  if ((await pg.$eval(`[data-demi-eleve="${ub}"]`, (s) => s.value)) !== d2) throw new Error('affectation perdue à la relecture');
});

await v('demi-groupes : séance « à ouvrir » cochée pour 1L1 seulement — A la voit, B et C non', async () => {
  await reglerSeance('1L1');
  if (!(await pg.$(`[data-ouvre="${A_OUVRIR}"]`))) throw new Error('séance témoin absente');
  if (await pg.isChecked(`[data-ouvre="${A_OUVRIR}"]`)) throw new Error('cochée d’office');
  await cocher(A_OUVRIR, true);
  const g = await groupe();
  const d1 = await idDemi('1L1');
  if (g.ouvertsDemi?.[d1]?.[A_OUVRIR] !== true) throw new Error('ouvertsDemi : ' + JSON.stringify(g.ouvertsDemi));
  if (A_OUVRIR in (g.ouverts || {})) throw new Error('le réglage de la classe a été touché');
  const ligne = pg.locator(`label:has([data-ouvre="${A_OUVRIR}"])`);
  if (!/réglé pour 1L1/.test(await ligne.textContent())) throw new Error('étiquette d’origine absente');
  await commeEleve(A);
  if (!(await quizVus()).includes(A_OUVRIR)) throw new Error('A (1L1) ne la voit pas');
  await commeEleve(B_);
  if ((await quizVus()).includes(A_OUVRIR)) throw new Error('B (1L2) la voit');
  await commeEleve(C);
  if ((await quizVus()).includes(A_OUVRIR)) throw new Error('C (sans demi-groupe) la voit');
});

await v('demi-groupes : « revenir au réglage de la classe » efface la clé — A suit de nouveau la classe', async () => {
  await commeProf();
  await reglerSeance('1L1');
  await pg.click(`[data-comme-classe="${A_OUVRIR}"]`);
  await pg.waitForTimeout(300);
  const g = await groupe();
  const d1 = await idDemi('1L1');
  if (g.ouvertsDemi?.[d1] && A_OUVRIR in g.ouvertsDemi[d1]) throw new Error('clé conservée : ' + JSON.stringify(g.ouvertsDemi));
  const ligne = pg.locator(`label:has([data-ouvre="${A_OUVRIR}"])`);
  if (!/comme la classe/.test(await ligne.textContent())) throw new Error('la ligne ne dit pas « comme la classe »');
  await commeEleve(A);
  if ((await quizVus()).includes(A_OUVRIR)) throw new Error('A la voit encore');
});

await v('demi-groupes : séance fermée pour la classe, ouverte pour 1L2 — seul B la voit, l’enseignant le lit', async () => {
  await commeProf();
  await reglerSeance('');
  await cocher(D_OFFICE, false);
  await reglerSeance('1L2');
  if (await pg.isChecked(`[data-ouvre="${D_OFFICE}"]`)) throw new Error('1L2 ne suit pas la classe fermée');
  await cocher(D_OFFICE, true);
  await reglerSeance('');
  const d2 = await idDemi('1L2');
  if (!(await pg.$(`label:has([data-ouvre="${D_OFFICE}"]) [data-contredit="${d2}"]`))) throw new Error('« Toute la classe » ne dit pas que 1L2 la contredit');
  // Tuile de l'enseignant à l'accueil : ce que voient les élèves.
  await versAccueil();
  await pg.click('[data-rub="quiz"]');
  const r = await pg.$eval(`[data-act="${D_OFFICE}"]`, (b) => b.querySelector('[data-cachee]')?.dataset.cachee || '');
  if (r !== 'ouverte pour 1L2 seulement') throw new Error('tuile : ' + r);
  await commeEleve(B_);
  if (!(await quizVus()).includes(D_OFFICE)) throw new Error('B (1L2) ne la voit pas');
  await commeEleve(A);
  if ((await quizVus()).includes(D_OFFICE)) throw new Error('A (1L1) la voit');
  await commeEleve(C);
  if ((await quizVus()).includes(D_OFFICE)) throw new Error('C (sans demi-groupe) la voit');
});

await v('demi-groupes : base de classe (ACT-1) — une par demi-groupe, celle de la classe pour C', async () => {
  const [d1, d2] = [await idDemi('1L1'), await idDemi('1L2')];
  await commeEleve(A);
  await magasin('REF-A');
  await commeEleve(B_);
  const vusB = await magasin('REF-B');
  if (vusB.includes('REF-A')) throw new Error('B voit la ligne de A');
  await commeEleve(C);
  const vusC = await magasin('REF-C');
  if (vusC.includes('REF-A') || vusC.includes('REF-B')) throw new Error('C voit : ' + vusC);
  await commeEleve(A);
  const vusA = await magasin();
  if (!vusA.includes('REF-A') || vusA.includes('REF-B') || vusA.includes('REF-C')) throw new Error('A voit : ' + vusA);
  const bases = { d1: await refsDe(`${GID}/magasin~${d1}`), d2: await refsDe(`${GID}/magasin~${d2}`), classe: await refsDe(`${GID}/magasin`) };
  if (bases.d1.join() !== 'REF-A' || bases.d2.join() !== 'REF-B' || bases.classe.join() !== 'REF-C') throw new Error(JSON.stringify(bases));
});

await v('demi-groupes : Réinitialiser sous 1L2 ne vide que la base de 1L2', async () => {
  const [d1, d2] = [await idDemi('1L1'), await idDemi('1L2')];
  await commeProf();
  await reglerSeance('1L2');
  await pg.click('[data-raz="magasin"]');
  await pg.waitForTimeout(300);
  const bases = { d1: await refsDe(`${GID}/magasin~${d1}`), d2: await refsDe(`${GID}/magasin~${d2}`), classe: await refsDe(`${GID}/magasin`) };
  if (bases.d2.length || bases.d1.join() !== 'REF-A' || bases.classe.join() !== 'REF-C') throw new Error(JSON.stringify(bases));
  // B réécrit sa ligne, pour le retrait plus bas.
  await commeEleve(B_);
  await magasin('REF-B');
});

await v('demi-groupes : renommer 1L1 en « 1L-A » — affectation, ouverture et base intactes', async () => {
  const d1 = await idDemi('1L1');
  const ua = await uidDe(A[0]);
  await commeProf();
  await reglerSeance('1L1');
  await cocher(A_OUVRIR, true);
  await onglet('groupes');
  await pg.fill(`[data-renommer="${d1}"]`, '1L-A');
  await pg.press(`[data-renommer="${d1}"]`, 'Tab');
  await pg.waitForFunction(({ gid, d1 }) => JSON.parse(localStorage.getItem('prepalog:groupes'))[gid].demis.find((d) => d.id === d1).nom === '1L-A', { gid: GID, d1 });
  const g = await groupe();
  if (g.demiDe[ua] !== d1 || g.ouvertsDemi[d1][A_OUVRIR] !== true) throw new Error(JSON.stringify(g));
  await onglet('comptes');
  const lu = await pg.$eval(`[data-demi-eleve="${ua}"]`, (s) => s.selectedOptions[0].textContent);
  if (lu !== '1L-A') throw new Error('Comptes élèves lit : ' + lu);
  await commeEleve(A);
  if (!(await quizVus()).includes(A_OUVRIR)) throw new Error('A a perdu son ouverture');
  const vus = await magasin();
  if (!vus.includes('REF-A')) throw new Error('A a perdu sa base : ' + vus);
});

await v('demi-groupes : retirer 1L2 — sa base est effacée, celles de 1L-A et de la classe restent, B repasse « — »', async () => {
  const [d1, d2] = [await idDemi('1L-A'), await idDemi('1L2')];
  const ub = await uidDe(B_[0]);
  if ((await refsDe(`${GID}/magasin~${d2}`)).join() !== 'REF-B') throw new Error('base de 1L2 vide avant le retrait : le cas ne prouverait rien');
  await commeProf();
  await onglet('groupes');
  await pg.click(`[data-retirer-demi="${d2}"]`);
  await pg.waitForFunction((gid) => JSON.parse(localStorage.getItem('prepalog:groupes'))[gid].demis.length === 1, GID);
  const g = await groupe();
  if (g.demis[0].id !== d1 || ub in (g.demiDe || {}) || d2 in (g.ouvertsDemi || {})) throw new Error(JSON.stringify(g));
  const restes = await pg.evaluate((d) => Object.keys(localStorage).filter((k) => k.includes('~' + d)), d2);
  if (restes.length) throw new Error('restes de 1L2 : ' + restes);
  // Ce qui reste : la base de 1L-A et celle de la classe.
  if ((await refsDe(`${GID}/magasin~${d1}`)).join() !== 'REF-A') throw new Error('base de 1L-A emportée');
  if ((await refsDe(`${GID}/magasin`)).join() !== 'REF-C') throw new Error('base de la classe emportée');
  await onglet('comptes');
  if ((await pg.$eval(`[data-demi-eleve="${ub}"]`, (s) => s.value)) !== '') throw new Error('B affiché dans un demi-groupe');
  // B suit maintenant la classe : la séance fermée pour la classe lui est fermée, et il a la base de la classe.
  await commeEleve(B_);
  if ((await quizVus()).includes(D_OFFICE)) throw new Error('B voit encore la séance ouverte pour 1L2');
  const vus = await magasin();
  if (!vus.includes('REF-C') || vus.includes('REF-B')) throw new Error('B lit : ' + vus);
});

await v('demi-groupes : suivi et compétences filtrés sous 1L-A — A seul, export nommé et filtré', async () => {
  const d1 = await idDemi('1L-A');
  await commeProf();
  await onglet('suivi');
  await pg.selectOption('[data-choix-demi]', d1);
  await pg.waitForTimeout(300);
  const t = await pg.$eval('#contenuProf', (e) => e.textContent);
  if (!/DEMIA/.test(t) || /DEMIB|DEMIC/.test(t)) throw new Error('suivi non filtré');
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#btnCsvSuivi')]);
  const fs = await import('node:fs');
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  if (dl.suggestedFilename() !== `suivi-${GID}-1L-A.csv`) throw new Error('nom : ' + dl.suggestedFilename());
  if (!/DEMIA/.test(csv) || /DEMIB|DEMIC/.test(csv)) throw new Error('export non filtré');
  // Le choix suit dans Compétences.
  await onglet('competences');
  if ((await pg.$eval('[data-choix-demi]', (s) => s.value)) !== d1) throw new Error('choix perdu en changeant d’onglet');
  const tc = await pg.$eval('#contenuProf', (e) => e.textContent);
  if (/DEMIB|DEMIC/.test(tc)) throw new Error('compétences non filtrées');
  // « Toute la classe » : tout le monde revient.
  await pg.selectOption('[data-choix-demi]', '');
  await pg.waitForTimeout(300);
  await onglet('suivi');
  const t2 = await pg.$eval('#contenuProf', (e) => e.textContent);
  if (!/DEMIA/.test(t2) || !/DEMIB/.test(t2) || !/DEMIC/.test(t2)) throw new Error('toute la classe incomplète');
});

await v('demi-groupes : aucune erreur JavaScript', async () => {
  if (erreursD.length) throw new Error(erreursD.slice(0, 3).join(' / '));
});

await ctxD.close();
}
