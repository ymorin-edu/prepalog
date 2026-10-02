// Suite de tests de Prepalog — bloc « socle » : le socle : connexion, groupes, comptes, base partagée, suivi, notes et compétences, thème, niveaux, conduite de séance, types de base (QCM, ordre, association, numérique, classeur, lien), séries tableur TAB-1 à TAB-4.
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs socle` ne lance que ce bloc.
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

export default async function bloc({ v, page, nav, ok, ROOT, baseXlsx }) {

// ---------- 1. connexion enseignant
await v('connexion enseignant', async () => {
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
});

// ---------- 2. création d'un groupe
await v('création de groupe', async () => {
  await page.click('#btnProfEspace');
  await page.waitForSelector('#gNom');
  await page.fill('#gNom', '1 LOG A');
  await page.click('#btnCreerG');
  await page.waitForSelector('text=1 LOG A', { timeout: 6000 });
});

// ---------- 3. création de comptes en lot
await v('création de comptes en lot', async () => {
  await page.click('[data-ong="comptes"]');
  await page.waitForSelector('#lot');
  await page.fill('#lot', 'DUPONT ; Léa ; 2601 ; aaa1\nMARTIN ; Noé ; 2602 ; bbb2');
  await page.click('#btnLot');
  await page.waitForSelector('text=2 comptes créés', { timeout: 6000 });
});

// ---------- 4. semer la base partagée
await v('semis de la base partagée', async () => {
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-semer="magasin"]');
  page.once('dialog', (d) => d.accept());
  await page.click('[data-semer="magasin"]');
  await page.waitForTimeout(600);
});

// ---------- 4 bis. les corrigés complets des trames sont dans l'espace enseignant
// Onglet « Corrigés » : un fichier par séance, déclaré par `meta.corrige`. La bonne réponse
// y est marquée par « ✓ » — une information portée par un signe, pas par la couleur seule.
await v('espace enseignant : onglet Corrigés', async () => {
  await page.click('[data-ong="corriges"]');
  await page.waitForSelector('text=un contrat de vente', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  if (!/✓ B\. un contrat de vente/.test(t)) throw new Error('bonne réponse non marquée');
  if (!/Pistes \(pas de réponse unique\)/.test(t)) throw new Error('pistes des questions de réflexion absentes');
  if (!/2006/.test(t) || !/Grenoble/.test(t)) throw new Error('réponses des questions de faits absentes');
  const nTab = await page.$$eval('#contenuProf table', (e) => e.length);
  if (nTab < 10) throw new Error(`${nTab} tableaux de réponses seulement`);
  for (const code of ['ENT-1.1', 'ENT-1.2', 'ENT-1.3', 'ENT-3.1']) {
    if (!t.includes(code)) throw new Error('corrigé absent : ' + code);
  }
  if (/n'a pas pu être chargé/.test(t)) throw new Error('un fichier de corrigé ne se charge pas');
});

// ---------- 5. l'enseignant voit la base semée
await v('lecture de la base partagée (enseignant)', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="magasin"]');
  await page.click('[data-rub="magasin"]');
  await page.waitForSelector('text=REF-0101', { timeout: 6000 });
});

// ---------- 6. déconnexion puis connexion élève
await v('connexion élève', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat', { timeout: 6000 });
  await page.fill('#mat', '2601');
  await page.fill('#code', 'aaa1');
  await page.click('#btnEleve');
  await page.waitForSelector('text=Bonjour Léa', { timeout: 6000 });
});

// ---------- 6 bis. l'accueil affiche bien les pastilles de rubrique
await v('accueil en pastilles de rubrique', async () => {
  const n = await page.$$eval('.rubrique[data-rub]', (e) => e.length);
  if (n < 2) throw new Error(`${n} pastille(s) seulement`);
  const t = (await page.$$eval('.rubriques', (e) => e.map((x) => x.textContent).join(' ')));
  if (!/Magasin/.test(t) || !/Quiz/.test(t)) throw new Error('rubrique manquante');
  const bandes = await page.$$eval('.rubriques-sep', (e) => e.length);
  if (bandes < 1) throw new Error('bandes non séparées');
  if (!/activité/.test(await page.textContent('body'))) throw new Error('compteur absent');
});

// ---------- 6 ter. chaque rubrique affiche ses activités par numéro de module
// TAB-5 s'était retrouvé affiché avant TAB-1, TAB-2 et TAB-3, parce que l'ordre venait de
// la liste `ACTIVITES` et non des numéros. Un seul oubli, visible à trois endroits : la
// pastille Tableur, les colonnes du suivi de classe et la conduite de séance. Ce test lit
// l'ordre que le noyau calcule, rubrique par rubrique, donc il garde les trois d'un coup.
//
// Il passe par le module chargé dans la page plutôt que par les tuiles : une rubrique à
// une seule activité s'ouvre directement dessus, sans tuile à lire, et c'est l'ordre
// calculé qu'on veut vérifier, pas la façon dont il est dessiné.
await v('rubriques : les activités sont rangées par numéro de module', async () => {
  const par = await page.evaluate(async () => {
    const m = await import('/activites/index.js');
    const mods = await m.chargerActivites();
    return m.RUBRIQUES.map((r) => ({
      label: r.label,
      codes: m.activitesDeRubrique(r, mods).map((a) => a.meta.code),
    }));
  });
  if (!par.length) throw new Error('aucune rubrique lue, test invalide');

  // Un numéro peut avoir plusieurs niveaux (`ENT-1.2`). On compare segment par segment,
  // jamais comme un décimal : sinon `ENT-1.10` passerait avant `ENT-1.9`. Ce test est écrit
  // à part du noyau exprès — il vérifie le résultat, il ne réutilise pas son comparateur.
  const segments = (c) => ((/^[A-Z]+-(\d+(?:\.\d+)*)$/.exec(c) || [, ''])[1] || '')
    .split('.').filter(Boolean).map(Number);
  const famille = (c) => (/^([A-Z]+)-/.exec(c) || [, c])[1];
  const avant = (a, b) => {               // a doit-il venir strictement avant b ?
    const x = segments(a); const y = segments(b);
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      const u = x[i] === undefined ? -1 : x[i];
      const w = y[i] === undefined ? -1 : y[i];
      if (u !== w) return u < w;
    }
    return false;                          // numéros égaux : pas strictement avant
  };

  let vues = 0;
  par.forEach(({ label, codes }) => {
    if (codes.length < 2) return;                 // une seule tuile : rien à ordonner
    vues++;
    for (let i = 1; i < codes.length; i++) {
      // Dans une même famille, le numéro doit croître. Une rubrique qui mélangerait deux
      // familles (ça n'arrive pas aujourd'hui) n'est pas en faute : on ne compare que ce
      // qui est comparable.
      if (famille(codes[i]) !== famille(codes[i - 1])) continue;
      if (!avant(codes[i - 1], codes[i])) {
        throw new Error(`rubrique ${label} : ${codes.join(' ')} — ${codes[i]} après ${codes[i - 1]}`);
      }
    }
  });
  if (vues < 3) throw new Error(`${vues} rubrique(s) à plusieurs tuiles seulement, test trop faible`);

  // Le comparateur du test doit lui-même tenir le piège des numéros de version : si `avant`
  // se trompait sur 1.10 / 1.9, la boucle ci-dessus laisserait passer le désordre qu'elle
  // est censée attraper. Deux lignes pour garder le garde-fou.
  if (!avant('ENT-1.9', 'ENT-1.10')) throw new Error('comparateur du test : 1.10 avant 1.9');
  if (!avant('ENT-1.2', 'ENT-2.1')) throw new Error('comparateur du test : 2.1 avant 1.2');

  // Repères explicites : Tableur, la rubrique qui portait le défaut, et Logisim, dont les
  // numéros sont à deux niveaux — une séance par tuile, une entreprise par premier chiffre.
  const repere = (label, attendu) => {
    const r = par.find((x) => x.label === label);
    if (!r) throw new Error(`rubrique ${label} introuvable`);
    if (r.codes.join(' ') !== attendu) throw new Error(`rubrique ${label} : ${r.codes.join(' ')}`);
  };
  repere('Tableur', 'TAB-1 TAB-2 TAB-3 TAB-4 TAB-5');
  // Trois entreprises, et le rang se lit sur le premier chiffre : les trois séances Spartoo
  // (ENT-1.x), puis Cdiscount (ENT-2.x, depuis le 02/10/2026), puis Boost (ENT-3.x). Une séance
  // nouvelle s'insère à son rang : on ne touche à cette liste qu'en l'allongeant.
  repere('Logisim', 'ENT-1.1 ENT-1.2 ENT-1.3 ENT-2.1 ENT-2.2 ENT-2.3 ENT-3.1 ENT-3.2 ENT-3.3');
});

// ---------- 7. l'élève voit la base commune de la classe
await v('base commune visible par l\'élève', async () => {
  await page.click('[data-rub="magasin"]');
  await page.waitForSelector('text=REF-0102', { timeout: 6000 });
});

// ---------- 8. l'élève ajoute une ligne partagée
await v('ajout d\'une ligne dans la base partagée', async () => {
  await page.click('[data-onglet="emplacements"]');
  await page.waitForSelector('#ch_code');
  await page.fill('#ch_code', 'C-09-4');
  await page.click('#btnAjouter');
  await page.waitForSelector('text=C-09-4', { timeout: 6000 });
});

// ---------- 9. QCM autocorrigé
await v('QCM autocorrigé et enregistrement du score', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="quiz"]');
  await page.click('[data-rub="quiz"]');
  await page.waitForSelector('[data-act="quiz-flux"]', { timeout: 6000 });
  await page.click('[data-act="quiz-flux"]');
  await page.waitForSelector('#btnValider', { timeout: 6000 });
  // On coche la première proposition de chaque question, au hasard.
  const qs = await page.$$('.question');
  for (const q of qs) {
    const c = await q.$('input');
    if (c) await c.check();
  }
  await page.click('#btnValider');
  await page.waitForSelector('#bilan .avis', { timeout: 6000 });
});

// ---------- 10. le corrigé n'est pas en clair dans la page
await v('corrigé non lisible en clair', async () => {
  const src = await page.content();
  if (src.includes('Une commande réelle du client') === false) throw new Error('énoncé absent, test invalide');
  const mod = await page.evaluate(async () => {
    const m = await import('/activites/quiz-flux.js');
    return JSON.stringify(m);
  });
  if (/justes["']?\s*:\s*\[\s*["']Une commande/.test(mod)) throw new Error('réponse en clair dans le module');
});

// ---------- 11. le suivi de classe remonte le score
await v('suivi de classe côté enseignant', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=QUI-5', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  if (!/DUPONT/.test(t)) throw new Error('élève absent du suivi');

  // Depuis le 01/10/2026 le suivi affiche une NOTE SUR 20, pas le score brut : le quiz
  // est noté sur 6 questions, et la colonne doit quand même annoncer « /20 ». Voir
  // `core/notes.js` pour le raisonnement.
  const colonne = await page.textContent('th[title*="flux"]');
  if (!/\/\s*20/.test(colonne)) {
    throw new Error('la colonne n\'annonce pas un barème sur 20 : ' + colonne.trim());
  }
  const cellule = (await page.$$eval('#contenuProf tbody tr', (lignes) => {
    const l = lignes.find((x) => /DUPONT/.test(x.textContent));
    return l ? [...l.querySelectorAll('td')].map((d) => ({ txt: d.textContent.replace(/\s+/g, ' ').trim(), titre: d.getAttribute('title') || '' })) : [];
  })).find((c) => /\/20/.test(c.txt));
  if (!cellule) throw new Error('aucune note sur 20 dans la ligne de l\'élève');
  if (!/^\d+(,\d)?\/20/.test(cellule.txt)) {
    throw new Error('la note n\'est pas au format attendu : ' + cellule.txt);
  }
  // Le score brut reste accessible : l'enseignant doit pouvoir savoir combien de questions
  // ont été réussies, pas seulement la note.
  if (!/\bsur\b/.test(cellule.titre)) {
    throw new Error('le détail brut n\'est pas en infobulle : ' + cellule.titre);
  }
});

// ---------- 11 bis. la note sur 20 : la règle, à l'unité
//
// Le calcul est écrit ICI à part de celui du noyau, exprès : un test qui réutiliserait la
// fonction qu'il vérifie ne vérifierait rien. Même précaution que pour le comparateur
// d'ordre des modules.
await v('note sur 20 : la conversion et ses cas de bord', async () => {
  const { noteSur20, noteConvertie, formaterNote, BAREME_AFFICHE } =
    await import(pathToFileURL(path.join(ROOT, 'core/notes.js')).href);

  if (BAREME_AFFICHE !== 20) throw new Error('le barème affiché n\'est plus 20');

  // Comparateur indépendant : proportion × 20, arrondie au demi-point.
  const attendu = (s, m) => Math.round((s / m) * 40) / 2;
  const cas = [[13, 13], [9, 13], [0, 13], [3, 3], [10, 10], [1, 6], [5, 6], [7, 10], [1, 3]];
  cas.forEach(([s, m]) => {
    const got = noteSur20(s, m);
    if (got !== attendu(s, m)) {
      throw new Error(`noteSur20(${s}, ${m}) = ${got}, attendu ${attendu(s, m)}`);
    }
  });

  // Ce qui a motivé la règle : des dénominateurs différents, la même réussite complète.
  if (noteSur20(3, 3) !== 20 || noteSur20(10, 10) !== 20 || noteSur20(13, 13) !== 20) {
    throw new Error('un sans-faute ne donne pas 20/20 selon le nombre d\'exercices');
  }
  // Et l'arrondi tombe bien sur un demi-point, jamais sur trois décimales.
  if (noteSur20(1, 3) !== 6.5) throw new Error('1/3 devrait donner 6,5 — ' + noteSur20(1, 3));
  if (noteSur20(5, 6) !== 16.5) throw new Error('5/6 devrait donner 16,5 — ' + noteSur20(5, 6));

  // Cas de bord : rien d'affichable plutôt qu'un NaN ou un faux zéro.
  [[1, 0], [1, undefined], [undefined, 10], [null, 10], [1, -3], ['4', 10]].forEach(([s, m]) => {
    if (noteSur20(s, m) !== null) throw new Error(`noteSur20(${s}, ${m}) devrait rendre null`);
  });
  if (formaterNote(null) !== '—') throw new Error('une note absente devrait s\'écrire «\u00a0—\u00a0»');
  if (formaterNote(13.5) !== '13,5') throw new Error('la note s\'écrit avec une virgule');

  // Les deux notations qui ne se convertissent pas, et pourquoi.
  if (!noteConvertie({ id: 'a' })) throw new Error('un module autocorrigé doit être converti');
  if (noteConvertie({ id: 'a', notation: 'prof' })) {
    throw new Error('une note saisie à la main ne doit pas être convertie');
  }
  if (noteConvertie({ id: 'a', notation: 'avancement' })) {
    throw new Error('des jalons ne doivent pas être convertis en note');
  }
});

// ---------- 11 ter. notes par compétence (chantier du 02/10/2026)
//
// Trois blocs : la règle de calcul à l'unité (valeurs écrites à la main, pas recalculées par
// la fonction vérifiée), le tableau des déclarations validé par Tristan (figé ici : une
// compétence qui change doit se voir), puis l'écran et l'export, pilotés comme un prof.

// Le nombre de séances du registre qui déclarent une compétence (ajouté le 02/10/2026, chantier D).
const nbSeances = (comp) => page.evaluate(async (k) => {
  const m = await import('/activites/index.js');
  return (await m.chargerActivites()).filter((a) => (a.meta.competences || []).includes(k)).length;
}, comp);

await v('compétences : moyenne pondérée, coefficients et cas de bord, à l\'unité', async () => {
  const C = await import(pathToFileURL(path.join(ROOT, 'core/competences.js')).href);
  // Coefficients : défauts 1 / 1 / 1 / 3, valeurs du groupe prioritaires, valeur abîmée = défaut.
  const d = C.coefsDuGroupe({});
  if (d.guidage !== 1 || d.entrainement !== 1 || d.erreur !== 1 || d.evaluation !== 3) {
    throw new Error('coefficients par défaut : ' + JSON.stringify(d));
  }
  const g = C.coefsDuGroupe({ coefs: { evaluation: 2, guidage: -1, entrainement: 'x', erreur: 0 } });
  if (g.evaluation !== 2 || g.guidage !== 1 || g.entrainement !== 1 || g.erreur !== 0) {
    throw new Error('coefficients du groupe : ' + JSON.stringify(g));
  }
  const s1 = { id: 's1', bareme: 2, temps: 'guidage', competences: ['C1.6'] };
  const s2 = { id: 's2', bareme: 10, temps: 'evaluation', competences: ['C1.6', 'C1.1'] };
  const s3 = { id: 's3', bareme: 3, notation: 'avancement', temps: 'guidage', competences: ['C1.6'] };
  const s4 = { id: 's4', bareme: 6, temps: 'entrainement', competences: ['C1.6'] };
  // 1/2 = 10 ; 8/10 = 16 ; 3 jalons sur 3 = 20 ; s4 pas faite (ne compte pas pour zéro).
  const travaux = { s1: { meilleur: 1, max: 2 }, s2: { meilleur: 8, max: 10 }, s3: { meilleur: 3, max: 3 } };
  const r = C.moyenneCompetence([s1, s2, s3, s4], travaux, d);
  // (10×1 + 16×3 + 20×1) / 5 = 78 / 5 = 15,6
  if (r.moyenne !== 15.6) throw new Error('moyenne ' + r.moyenne + ' au lieu de 15,6');
  if (r.nbNotes !== 3) throw new Error('séances notées ' + r.nbNotes + ' au lieu de 3');
  if (r.detail[3].note !== null) throw new Error('une séance pas faite a une note');
  // Évaluation au coefficient 1 : (10 + 16 + 20) / 3 = 15,33
  const r1 = C.moyenneCompetence([s1, s2, s3, s4], travaux, { ...d, evaluation: 1 });
  if (r1.moyenne !== 15.33) throw new Error('moyenne au coef 1 : ' + r1.moyenne + ' au lieu de 15,33');
  // Rien de fait, ou tout au coefficient 0 : pas de moyenne, pas de faux zéro.
  if (C.moyenneCompetence([s1, s4], {}, d).moyenne !== null) throw new Error('moyenne sans aucune note');
  const zero = { guidage: 0, entrainement: 0, erreur: 0, evaluation: 0 };
  if (C.moyenneCompetence([s1, s2], travaux, zero).moyenne !== null) throw new Error('moyenne à poids nul');
  // Une séance à deux compétences compte pour les deux ; l'ordre est celui du référentiel.
  const pc = C.seancesParCompetence([s1, s2, s3, s4, { id: 'x', bareme: 4, competences: [], temps: 'guidage' },
    { id: 'y', bareme: 4, competences: ['C1.6'] /* pas de temps : hors tableau */ }]);
  if (pc.map((c) => c.code).join(',') !== 'C1.1,C1.6') throw new Error('ordre des compétences : ' + pc.map((c) => c.code));
  if (pc[0].seances.map((m) => m.id).join() !== 's2') throw new Error('C1.1 : ' + pc[0].seances.map((m) => m.id));
  if (pc[1].seances.map((m) => m.id).join() !== 's1,s2,s3,s4') throw new Error('C1.6 : ' + pc[1].seances.map((m) => m.id));
  if (pc[1].libelle !== 'Gérer le suivi des stocks') throw new Error('libellé C1.6 : ' + pc[1].libelle);
});

await v('compétences : chaque séance déclare ce que Tristan a validé le 02/10', async () => {
  // Écrit à la main. Changer une ligne ici, c'est changer une note de bulletin : le dire.
  const ATTENDU = {
    'DEC-1': ['C1.1', 'guidage'], 'QUI-5': ['C1.1', 'entrainement'], 'QUI-6': ['C1.1', 'entrainement'],
    'QUI-7': ['C1.6', 'entrainement'], 'TAB-2': ['C1.6', 'entrainement'],
    'TAB-4': ['C1.4,C1.6', 'entrainement'], 'TAB-5': ['C1.6', 'entrainement'],
    'ENT-1.1': ['C1.4', 'guidage'], 'ENT-1.2': ['C2.2', 'guidage'], 'ENT-1.3': ['C3.2', 'guidage'],
    'ENT-3.1': ['C2.4', 'guidage'], 'ENT-3.2': ['C2.4', 'entrainement'], 'ENT-3.3': ['C2.4', 'erreur'],
    'SCE-1': ['C1.6', 'guidage'], 'SCE-2': ['C1.6', 'evaluation'], 'SCE-3': ['C1.6', 'evaluation'],
    'SCE-4': ['C1.5', 'guidage'], 'SCE-5': ['C1.3,C1.4', 'guidage'],
  };
  const HORS = ['TAB-1', 'TAB-3', 'QUI-8', 'QUI-9', 'QUI-10'];
  const metas = await page.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { COMPETENCES, TEMPS } = await import('/core/competences.js');
    return (await chargerActivites()).map(({ meta: m }) => ({
      code: m.code, bareme: m.bareme, comp: (m.competences || []).join(','), temps: m.temps,
      inconnues: (m.competences || []).filter((c) => !COMPETENCES[c]),
      tempsOk: m.temps === undefined || !!TEMPS[m.temps],
    }));
  });
  const faux = [];
  for (const [code, [comp, temps]] of Object.entries(ATTENDU)) {
    const m = metas.find((x) => x.code === code);
    if (!m) { faux.push(code + ' introuvable'); continue; }
    if (m.comp !== comp || m.temps !== temps) faux.push(`${code} : ${m.comp} ${m.temps} (attendu ${comp} ${temps})`);
    if (!m.bareme) faux.push(code + ' sans barème');
  }
  HORS.forEach((code) => { const m = metas.find((x) => x.code === code); if (m && m.comp) faux.push(code + ' devrait être hors tableau'); });
  metas.forEach((m) => {
    if (m.inconnues.length) faux.push(`${m.code} : code inconnu ${m.inconnues}`);
    if (!m.tempsOk) faux.push(`${m.code} : temps inconnu ${m.temps}`);
    // Une séance qui déclare une compétence sans temps disparaîtrait du tableau sans bruit.
    if (m.comp && !m.temps) faux.push(`${m.code} : compétence sans temps`);
  });
  if (faux.length) throw new Error(faux.join(' | '));
});

await v('compétences : l\'écran, les coefficients du groupe et l\'export CSV', async () => {
  // Deux notes saisies à la main sur C1.6 : SCE-1 (guidage) 8 et SCE-2 (évaluation) 16.
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie', { timeout: 6000 });
  const saisir = async (code, val) => {
    const sel = `.note-saisie[aria-label^="${code} — DUPONT"]`;
    await page.evaluate(() => { const t = document.getElementById('toast'); if (t) t.textContent = ''; });
    await page.fill(sel, val);
    await page.press(sel, 'Tab');
    await page.waitForFunction((s) => document.querySelector(s)?.classList.contains('enregistre')
      || /enregistrée|effacée/.test(document.getElementById('toast')?.textContent || ''), sel, { timeout: 4000 });
    await page.waitForTimeout(150);
  };
  await saisir('SCE-1', '8');
  await saisir('SCE-2', '16');

  const lire = async () => page.$$eval('#tabComp tbody tr', (lignes) => {
    const l = lignes.find((x) => /DUPONT/.test(x.textContent));
    const o = {};
    l.querySelectorAll('td[data-comp]').forEach((d) => {
      o[d.dataset.comp] = d.textContent.replace(/\s+/g, ' ').trim();
      o[d.dataset.comp + ':titre'] = d.getAttribute('title');
    });
    return o;
  });
  const ouvrir = async () => {
    await page.click('[data-ong="competences"]');
    await page.waitForSelector('#tabComp', { timeout: 6000 });
  };
  await ouvrir();
  const entetes = await page.$$eval('#tabComp thead th', (t) => t.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  if (!entetes.some((t) => /^C1\.6/.test(t))) throw new Error('pas de colonne C1.6 : ' + entetes.join(' | '));
  // (8×1 + 16×3) / 4 = 14 ; deux séances faites sur toutes celles de C1.6. Le nombre de séances
  // C1.6 est relu dans le registre (il était écrit en dur, 7, et chaque séance Cdiscount le
  // faisait tomber) : ce test juge la moyenne, pas l'inventaire des séances.
  const nC16 = await nbSeances('C1.6');
  if (nC16 < 7) throw new Error(`${nC16} séances C1.6 lues dans le registre : lecture cassée`);
  let c = await lire();
  if (c['C1.6'] !== `14/20 (2/${nC16})`) throw new Error('C1.6 : ' + c['C1.6'] + ` au lieu de 14/20 (2/${nC16})`);
  const titre = c['C1.6:titre'] || '';
  if (!/SCE-2 \(évaluation, coef 3\) : 16 \/ 20/.test(titre) || !/QUI-7 .*pas faite/.test(titre)) {
    throw new Error('détail en infobulle : ' + titre);
  }
  // Le prof passe l'évaluation au coefficient 1 : (8 + 16) / 2 = 12, et le réglage tient.
  await page.fill('.coef-saisie[data-temps="evaluation"]', '1');
  await page.click('#btnCoefs');
  await page.waitForFunction(() => /^12/.test(([...document.querySelectorAll('#tabComp tbody tr')].find((x) => /DUPONT/.test(x.textContent))?.querySelector('td[data-comp="C1.6"]')?.textContent.trim() || '')), null, { timeout: 4000 });
  // Rechargement complet : le coefficient doit venir de la base, pas de la mémoire de l'écran.
  await page.reload();
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  await page.click('#btnProfEspace');
  await ouvrir();
  if ((await page.inputValue('.coef-saisie[data-temps="evaluation"]')) !== '1') throw new Error('coefficient non conservé');
  c = await lire();
  if (!/^12\/20/.test(c['C1.6'])) throw new Error('après coef 1 : ' + c['C1.6']);
  // Un coefficient refusé ne s'enregistre pas.
  await page.fill('.coef-saisie[data-temps="guidage"]', '-2');
  await page.click('#btnCoefs');
  await page.waitForTimeout(300);
  if (!/entre 0 et 10/.test(await page.textContent('#toast'))) throw new Error('coefficient négatif accepté');
  // Retour aux défauts.
  await page.click('#btnCoefsDefaut');
  await page.waitForFunction(() => /^14/.test(([...document.querySelectorAll('#tabComp tbody tr')].find((x) => /DUPONT/.test(x.textContent))?.querySelector('td[data-comp="C1.6"]')?.textContent.trim() || '')), null, { timeout: 4000 });
  if ((await page.inputValue('.coef-saisie[data-temps="evaluation"]')) !== '3') throw new Error('défaut non rétabli');

  // L'export : une ligne par élève et par compétence.
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btnCsvComp')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8').replace(/^﻿/, '');
  const lignes = csv.split('\r\n');
  if (!/^Nom;Prénom;Compétence;Libellé;Séances .*;Séances faites;Moyenne pondérée \/20$/.test(lignes[0])) {
    throw new Error('en-tête : ' + lignes[0]);
  }
  const l16 = lignes.find((l) => /^DUPONT;Léa;C1\.6;/.test(l));
  if (!l16) throw new Error('pas de ligne DUPONT C1.6');
  if (!l16.endsWith(`;2 sur ${nC16};14`)) throw new Error('ligne C1.6 : ' + l16);
  if (!/SCE-1 \(guidage, coef 1\) : 8 \/ 20/.test(l16)) throw new Error('détail SCE-1 absent : ' + l16);
  const nbComp = (await page.$$('#tabComp thead th')).length - 1;
  const nbEl = (await page.$$('#tabComp tbody tr')).length;
  if (lignes.length - 1 !== nbComp * nbEl) throw new Error(`${lignes.length - 1} lignes au lieu de ${nbComp}×${nbEl}`);

  // Le suivi par séance n'a pas bougé : les notes saisies restent sur leur barème.
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie');
  if ((await page.inputValue('.note-saisie[aria-label^="SCE-1 — DUPONT"]')) !== '8') throw new Error('SCE-1 changé dans le suivi');
  // On remet le groupe comme on l'a trouvé.
  await saisir('SCE-1', '');
  await saisir('SCE-2', '');
});

await v('suivi : mettre 0 à un élève présent qui n\'a rien fait, l\'effacer, le voir remplacé', async () => {
  const BTN = '.btn-zero[aria-label="Mettre 0 — QUI-7 — DUPONT Léa"]';
  const EFF = '.btn-zero-eff[aria-label="Effacer le 0 — QUI-7 — DUPONT Léa"]';
  const celluleQui7 = () => page.$eval(`th[title^="Calculs de stock"]`, (th) => {
    const i = [...th.parentNode.children].indexOf(th);
    const l = [...document.querySelectorAll('#contenuProf tbody tr')].find((x) => /DUPONT/.test(x.textContent));
    return l.children[i].textContent.replace(/\s+/g, ' ').trim();
  });
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector(BTN, { timeout: 6000 });
  if ((await celluleQui7()) !== '—') throw new Error('case vide attendue : ' + await celluleQui7());
  await page.click(BTN);
  await page.waitForSelector(EFF, { timeout: 4000 });
  if (!/^0\/20 posé ×$/.test(await celluleQui7())) throw new Error('après 0 : ' + await celluleQui7());
  // Le 0 compte dans la moyenne par compétence (une séance pas faite, elle, ne compte pas).
  await page.click('[data-ong="competences"]');
  await page.waitForSelector('#tabComp');
  const c16 = await page.$$eval('#tabComp tbody tr', (lignes) => lignes.find((x) => /DUPONT/.test(x.textContent))
    .querySelector('td[data-comp="C1.6"]')?.textContent.replace(/\s+/g, ' ').trim());
  const nC16 = await nbSeances('C1.6');
  if (c16 !== `0/20 (1/${nC16})`) throw new Error('C1.6 avec le 0 : ' + c16 + ` au lieu de 0/20 (1/${nC16})`);
  // La croix efface le 0 : retour au tiret.
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector(EFF);
  await page.click(EFF);
  await page.waitForSelector(BTN, { timeout: 4000 });
  // Rattrapage : l'élève fait la séance après coup, sa vraie note remplace le 0.
  await page.click(BTN);
  await page.waitForSelector(EFF);
  const ids = await page.evaluate(async () => {
    const k = Object.keys(localStorage).find((x) => /travaux\/[^/]+\/[^/]+\/calculs-stock$/.test(x));
    const [, gid, uid] = k.match(/travaux\/([^/]+)\/([^/]+)\/calculs-stock$/);
    const { B } = await import('/core/backend.js');
    await B.ecrireScore(gid, uid, 'calculs-stock', { score: 6, max: 8 });
    return { gid, uid };
  });
  await page.click('[data-ong="competences"]');
  await page.waitForSelector('#tabComp');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('#contenuProf tbody tr');
  if (!/^15\/20/.test(await celluleQui7()) || /posé/.test(await celluleQui7())) {
    throw new Error('après rattrapage : ' + await celluleQui7());
  }
  // On remet le groupe comme on l'a trouvé.
  await page.evaluate(async ({ gid, uid }) => {
    const { B } = await import('/core/backend.js');
    await B.poserNote(gid, uid, 'calculs-stock', null);
  }, ids);
});

// ---------- 13. bascule clair / sombre
await v('bascule du thème et persistance', async () => {
  const fondDe = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const avant = await fondDe();
  await page.click('#btnTheme');
  await page.waitForTimeout(250);
  const apres = await fondDe();
  if (avant === apres) throw new Error('le fond n\'a pas changé');
  const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (!['clair', 'sombre'].includes(attr)) throw new Error('data-theme non posé');
  // Le logo du bandeau est fixe (tracé blanc sur l'aplat vert) ; c'est le favicon
  // qui suit le thème depuis le 01/10/2026.
  const src = await page.getAttribute('.entete .logo', 'src');
  if (!/logo-bandeau/.test(src)) throw new Error('le bandeau ne porte pas logo-bandeau.png');
  const fav = await page.getAttribute('#favicon', 'href');
  if (attr === 'sombre' && !/logo-sombre/.test(fav)) throw new Error('favicon clair en mode sombre');
  // et le choix survit au rechargement
  await page.reload();
  await page.waitForTimeout(600);
  const apresRechargement = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (apresRechargement !== attr) throw new Error('thème non conservé au rechargement');
});

// ---------- 14. écran de connexion : préambule, hiérarchie, touche Entrée
await v('écran de connexion', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  const pre = await page.textContent('.preambule');
  if (!/pédagogique/i.test(pre) || !/intelligence artificielle/i.test(pre)) {
    throw new Error('préambule absent ou incomplet');
  }
  // la partie élève doit être nettement plus large que la partie enseignant
  const le = await page.$eval('.panneau-eleve', (e) => e.getBoundingClientRect().width);
  const lp = await page.$eval('.panneau-prof', (e) => e.getBoundingClientRect().width);
  if (le <= lp * 1.4) throw new Error(`partie élève trop étroite (${Math.round(le)} vs ${Math.round(lp)})`);
  // champs de saisie plus grands que les champs ordinaires
  const t = await page.$eval('#mat', (e) => parseFloat(getComputedStyle(e).fontSize));
  if (t < 18) throw new Error(`champ trop petit (${t}px)`);
  // validation au clavier
  await page.fill('#mat', '2601');
  await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('text=Bonjour Léa', { timeout: 6000 });
});

// ---------- 15. niveaux : le mécanisme, vérifié à l'unité
//
// Depuis le 01/10/2026, aucune activité ne déclare de `niveaux` : tout est ouvert à tous
// les niveaux, et c'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir. Le
// filtrage par niveau reste donc dans le noyau, prêt à resservir, mais plus aucun contenu
// ne l'exerce — un parcours de bout en bout ne peut plus le vérifier.
//
// D'où ce test à l'unité, sur des métas fabriquées : il ne dépend d'aucun contenu, et il
// gardera le mécanisme en état le jour où des règles de niveaux reviendront. C'est le même
// raisonnement que pour le comparateur d'ordre : un garde-fou adossé à un seul cas de
// contenu disparaît avec ce contenu.
await v('niveaux : filtrage, forçage et fermeture, à l\'unité', async () => {
  const { activiteVisible, horsNiveau, concerneNiveau } =
    await import(pathToFileURL(path.join(ROOT, 'core/niveaux.js')).href);

  const tle = { id: 'g', niveau: 'tle', ouverts: {} };
  const sansNiveau = { id: 'g', niveau: '', ouverts: {} };
  const ouverte = { id: 'a', pret: true };                       // aucun `niveaux` : tous
  const restreinte = { id: 'a', pret: true, niveaux: ['2de', '1re'] };
  const pasPrete = { id: 'a', pret: false };

  const att = (cond, quoi) => { if (!cond) throw new Error(quoi); };

  // Par défaut — c'est désormais le cas de toutes les activités du dépôt — tout passe.
  att(activiteVisible(ouverte, tle), 'une activité sans `niveaux` devrait être visible');
  att(!horsNiveau(ouverte, tle), 'une activité sans `niveaux` n\'est pas hors niveau');

  // Le filtrage lui-même.
  att(!activiteVisible(restreinte, tle), 'une activité 2de/1re ne devrait pas être visible en Tle');
  att(horsNiveau(restreinte, tle), 'le hors-niveau n\'est pas signalé');
  att(activiteVisible(restreinte, { id: 'g', niveau: '1re', ouverts: {} }),
    'une activité 2de/1re devrait être visible en 1re');

  // L'enseignant garde le dernier mot, dans les deux sens.
  att(activiteVisible(restreinte, { ...tle, ouverts: { a: true } }),
    'le forçage ne rend pas visible une activité hors niveau');
  att(!activiteVisible(ouverte, { ...tle, ouverts: { a: false } }),
    'la fermeture ne masque pas une activité du bon niveau');

  // Deux garde-fous de bord : une activité pas prête ne sort jamais, et un groupe sans
  // niveau n'exclut rien — sinon un groupe mal renseigné viderait l'accueil.
  att(!activiteVisible(pasPrete, tle), 'une activité non prête ne doit pas être visible');
  att(activiteVisible(restreinte, sansNiveau), 'un groupe sans niveau ne doit rien exclure');

  // Le filtrage par exercice, qui sert aux séries de tableur.
  att(concerneNiveau(undefined, 'cap'), 'un exercice sans `niveaux` vaut pour tous');
  att(concerneNiveau([], 'cap'), 'un `niveaux` vide vaut pour tous');
  att(!concerneNiveau(['tle'], 'cap'), 'un exercice Tle ne concerne pas un CAP');
  att(concerneNiveau(['tle'], null), 'sans niveau de groupe connu, tout est concerné');
});

// ---------- 15 bis. l'enseignant ferme une activité, l'élève ne la voit plus
//
// C'est le geste qui remplace le filtrage automatique dans l'usage réel : tout est ouvert,
// l'enseignant ferme ce qui n'est pas au programme du jour. Le parcours crée aussi le
// groupe « TLE LOG » et Théo, réutilisés par les tests de suppression et de rattachement.
await v('conduite de séance : fermer une activité la retire chez l\'élève', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('#gNom');
  await page.fill('#gNom', 'TLE LOG');
  await page.selectOption('#gNiveau', 'tle');
  await page.click('#btnCreerG');
  await page.waitForTimeout(500);

  await page.click('[data-ong="comptes"]');
  await page.waitForSelector('#lot');
  await page.fill('#lot', 'ROUX ; Théo ; 2701 ; ccc3');
  await page.click('#btnLot');
  await page.waitForSelector('text=1 compte créé', { timeout: 6000 });

  // Rien n'est restreint : l'élève de Terminale voit la rubrique Logistique.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2701'); await page.fill('#code', 'ccc3');
  await page.press('#code', 'Enter');
  await page.waitForSelector('text=Bonjour Théo', { timeout: 6000 });
  if (!(await page.$('[data-rub="logistique"]'))) {
    throw new Error('la rubrique Logistique devrait être ouverte à tous les niveaux');
  }
  if (!(await page.$('[data-rub="magasin"]'))) throw new Error('magasin absent');

  // L'enseignant ferme la chaîne logistique pour ce groupe.
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="groupes"]');
  const aActiver = await page.$('[data-actif="tle-log"]');
  if (aActiver) { await aActiver.click(); await page.waitForTimeout(300); }
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-ouvre="chaine-logistique"]');
  if (!(await page.isChecked('[data-ouvre="chaine-logistique"]'))) {
    throw new Error('la chaîne devrait être cochée d\'office, plus rien n\'étant restreint');
  }
  await page.uncheck('[data-ouvre="chaine-logistique"]');
  await page.waitForTimeout(500);

  // L'élève ne la voit plus. C'est une seule activité dans sa rubrique : la pastille part.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2701'); await page.fill('#code', 'ccc3');
  await page.press('#code', 'Enter');
  await page.waitForSelector('text=Bonjour Théo', { timeout: 6000 });
  if (await page.$('[data-rub="logistique"]')) {
    throw new Error('la rubrique fermée est encore visible par l\'élève');
  }

  // L'enseignant la rouvre, et elle revient.
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="groupes"]');
  const r = await page.$('[data-actif="tle-log"]');
  if (r) { await r.click(); await page.waitForTimeout(300); }
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-ouvre="chaine-logistique"]');
  await page.check('[data-ouvre="chaine-logistique"]');
  await page.waitForTimeout(500);

  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2701'); await page.fill('#code', 'ccc3');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logistique"]', { timeout: 6000 });
});

// ---------- 16. remise en ordre
await v('remise en ordre : résolution complète', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logistique"]', { timeout: 6000 });
  await page.click('[data-rub="logistique"]');          // une seule activité → ouverture directe
  await page.waitForSelector('[data-scen="baskets"]', { timeout: 6000 });
  await page.click('[data-scen="baskets"]');
  await page.waitForSelector('#btnValider');
  // Tri à bulles à l'aide des flèches : on remonte chaque étape jusqu'à sa place.
  for (let tour = 0; tour < 10; tour++) {
    const textes = await page.$$eval('.ordre-texte', (e) => e.map((x) => x.textContent.trim().split('\n')[0]));
    const attendu = 'Le fournisseur fabrique les baskets';
    if (textes[0] === attendu) break;
    const i = textes.findIndex((t) => t === attendu);
    if (i <= 0) break;
    await page.click(`[data-haut="${i}"]`);
    await page.waitForTimeout(80);
  }
  const premier = await page.$eval('.ordre-texte', (e) => e.textContent.trim());
  if (!/fournisseur fabrique/.test(premier)) throw new Error('les flèches ne réordonnent pas');
  await page.click('#btnValider');
  await page.waitForSelector('#bilanOrdre .avis', { timeout: 6000 });
  const bilan = await page.textContent('#bilanOrdre');
  if (!/sur 8/.test(bilan)) throw new Error('bilan inattendu : ' + bilan.slice(0, 80));
});

// ---------- 17. association par clic
await v('association : rangement et correction', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="quiz"]');
  await page.click('[data-rub="quiz"]');
  await page.waitForSelector('[data-act="zones-entrepot"]', { timeout: 6000 });
  await page.click('[data-act="zones-entrepot"]');
  await page.waitForSelector('.bac[data-cat="reception"]', { timeout: 6000 });
  // On range les douze étiquettes au clic, toutes dans la même zone : le total doit
  // valoir 3 sur 12 (les trois étiquettes de la réception).
  for (let i = 0; i < 12; i++) {
    const e = await page.$('#reserve [data-etiq]');
    if (!e) break;
    await e.click();
    await page.click('.bac[data-cat="reception"] h3');
    await page.waitForTimeout(40);
  }
  await page.click('#btnValider');
  await page.waitForSelector('#bilanAssoc .avis', { timeout: 6000 });
  const b = await page.textContent('#bilanAssoc');
  if (!/3 étiquettes bien rangées sur 12/.test(b)) throw new Error('bilan inattendu : ' + b.slice(0, 90));
});

// ---------- 18. saisie numérique et tolérance
await v('saisie numérique : virgule et tolérance', async () => {
  // Le retour d'une activité ramène dans sa rubrique, pas à l'accueil.
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="calculs-stock"]', { timeout: 6000 });
  await page.click('[data-act="calculs-stock"]');
  await page.waitForSelector('#btnValiderNum', { timeout: 6000 });
  await page.fill('[data-q="c1"]', '250');
  await page.fill('[data-q="c3"]', '30,2');        // virgule française, dans la tolérance de 0,5
  await page.fill('[data-q="c7"]', '4 250');       // espace des milliers
  await page.fill('[data-q="c2"]', '7');           // faux
  await page.click('#btnValiderNum');
  await page.waitForSelector('#bilanNum .avis', { timeout: 6000 });
  const b = await page.textContent('#bilanNum');
  if (!/3 bonnes réponses sur 8/.test(b)) throw new Error('bilan inattendu : ' + b.slice(0, 90));
  const r = await page.textContent('[data-retour="c2"]');
  if (!/12/.test(r)) throw new Error('la réponse attendue n\'est pas affichée');
});

// ---------- 19. dépôt de classeur : le modèle est téléchargeable
await v('dépôt de classeur : modèle disponible', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil');
  await page.click('#btnAccueil');
  await page.waitForSelector('[data-rub="tableur"]', { timeout: 6000 });
  await page.click('[data-rub="tableur"]');
  await page.waitForSelector('[data-act="inventaire-tableur"]', { timeout: 6000 });
  await page.click('[data-act="inventaire-tableur"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  const href = await page.getAttribute('a[download]', 'href');
  const rep = await page.request.get(new URL(href, page.url()).toString());
  if (!rep.ok()) throw new Error('modèle introuvable (' + rep.status() + ')');
  const octets = (await rep.body()).length;
  if (octets < 3000) throw new Error('modèle trop petit : ' + octets + ' octets');
});

// ---------- 20. scénario : lien externe visible par l'élève
await v('scénario : la rubrique et le lien externe', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil', { timeout: 6000 });
  await page.click('#btnAccueil');
  await page.waitForSelector('[data-rub="scenario"]', { timeout: 6000 });
  await page.click('[data-rub="scenario"]');
  await page.waitForSelector('[data-act="yves-rocher"]', { timeout: 6000 });
  const ordre = await page.$$eval('[data-act]', (e) => e.map((x) => x.dataset.act));
  const attendu = ['yves-rocher', 'foot-locker', 'bouygues-telecom', 'brasseries-gatinais', 'reception-plateforme'];
  if (ordre.join() !== attendu.join()) throw new Error('ordre des scénarios : ' + ordre.join(', '));
  // L'affichage suit les codes : c'est le numéro de module qui décide du rang, pas la
  // place de la ligne dans `ACTIVITES` (voir `ordonner` dans activites/index.js).
  const codes = await page.$$eval('[data-act] .code', (e) => e.map((x) => x.textContent.trim().split(' ')[0]));
  if (codes.join() !== 'SCE-1,SCE-2,SCE-3,SCE-4,SCE-5') throw new Error('codes : ' + codes.join(', '));
  await page.click('[data-act="brasseries-gatinais"]');
  await page.waitForSelector('.lien-ouvrir', { timeout: 6000 });
  const href = await page.getAttribute('.lien-ouvrir', 'href');
  if (!/padlet\.com/.test(href)) throw new Error('lien Padlet absent : ' + href);
  if (await page.getAttribute('.lien-ouvrir', 'target') !== '_blank') throw new Error('le lien ne s\'ouvre pas dans un nouvel onglet');
  if (await page.$('.note-badge')) throw new Error('une note s\'affiche alors qu\'aucune n\'est saisie');
  const t = await page.textContent('#hoteActivite');
  if (!/apparaîtra ici une fois saisie/.test(t)) throw new Error('la mention d\'attente de note manque');
  // Les consignes vivent sur le Padlet : rien ne doit être recopié ici.
  if (/Rendu attendu|Calculer le poids/.test(t)) throw new Error('consigne recopiée côté site');
});

// ---------- 21. l'enseignant saisit la note dans le suivi de classe
await v('saisie de la note dans le suivi de classe', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  // Léa est dans « 1 LOG A » : c'est ce groupe qu'il faut activer.
  await page.waitForSelector('[data-ong="groupes"]');
  const a = await page.$('[data-actif="1-log-a"]');
  if (a) { await a.click(); await page.waitForTimeout(300); }
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie[data-aid="brasseries-gatinais"]', { timeout: 6000 });
  const champ = await page.$$('.note-saisie[data-aid="brasseries-gatinais"]');
  if (champ.length < 2) throw new Error('champs de saisie manquants');
  await champ[0].fill('14.5');
  await champ[0].dispatchEvent('change');
  await page.waitForTimeout(400);
  // Refus d'une note hors barème.
  await champ[1].fill('25');
  await champ[1].dispatchEvent('change');
  await page.waitForTimeout(300);
  if ((await champ[1].inputValue()) === '25') throw new Error('une note de 25/20 a été acceptée');
  // La note saisie survit au rechargement de l'écran.
  await page.click('[data-ong="groupes"]');
  await page.waitForSelector('#gNom');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie[data-aid="brasseries-gatinais"]');
  const v0 = await page.inputValue('.note-saisie[data-aid="brasseries-gatinais"]');
  if (Number(v0) !== 14.5) throw new Error('note non conservée : ' + v0);
});

// ---------- 22. l'élève retrouve sa note sur le scénario
await v('l\'élève voit la note de son scénario', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="scenario"]', { timeout: 6000 });
  await page.click('[data-rub="scenario"]');
  await page.click('[data-act="brasseries-gatinais"]');
  await page.waitForSelector('.note-badge', { timeout: 6000 });
  const b = await page.textContent('.note-badge');
  if (!/14,5\s*\/\s*20/.test(b)) throw new Error('badge inattendu : ' + b);
});

// ---------- 23. série TAB-2 : la série entière est proposée, et le modèle se télécharge
await v('série tableur : la série entière et le modèle', async () => {
  // Plus aucun exercice n'est restreint par niveau : Léa, en 1re, voit les dix.
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil', { timeout: 6000 });
  await page.click('#btnAccueil');
  await page.waitForSelector('[data-rub="tableur"]', { timeout: 6000 });
  await page.click('[data-rub="tableur"]');
  await page.waitForSelector('[data-act="excel-stock"]', { timeout: 6000 });
  await page.click('[data-act="excel-stock"]');
  await page.waitForSelector('[data-exo="exs1"]', { timeout: 6000 });
  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 10) throw new Error(`${vus.length} exercices au lieu de 10`);
  if (!vus.includes('exs10')) throw new Error('exs10 absent : un exercice est encore filtré');
  if (!/RECHERCHEV/.test(await page.textContent('#hoteActivite'))) throw new Error('groupes de notions absents');

  await page.click('[data-exo="exs1"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  const lien = await page.getAttribute('a[download]', 'href');
  const rep = await page.request.get(new URL(lien, page.url()).toString());
  if (!rep.ok()) throw new Error('classeur modèle introuvable (' + rep.status() + ')');
});

// ---------- 24. la correction d'un classeur déposé
await v('série tableur : correction d\'un classeur déposé', async () => {
  // On dépose le modèle non complété : les dix cellules de réponse sont vides.
  await page.setInputFiles('#fichier', ROOT + 'contenus/tab2/exs1-recherchev-prix.xlsx');
  await page.waitForSelector('#resultatTableur table', { timeout: 15000 });
  const bilan = await page.textContent('#resultatTableur');
  if (!/0 contrôle.* sur 10/.test(bilan.replace(/\s+/g, ' '))) {
    throw new Error('bilan inattendu : ' + bilan.replace(/\s+/g, ' ').slice(0, 100));
  }
  const lignes = await page.$$eval('#resultatTableur tbody tr', (e) => e.length);
  if (lignes !== 10) throw new Error(`${lignes} lignes de contrôle au lieu de 10`);
  if (!/Cellule vide/.test(bilan)) throw new Error('les cellules vides ne sont pas signalées');

  // Puis le même classeur, correctement rempli : les contrôles générés doivent tomber
  // exactement sur les cellules de réponse du modèle. C'est ce qui valide la migration.
  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  // `import()` attend une URL, pas un chemin : sous Windows un chemin absolu commence par
  // « C: », que le chargeur ESM prend pour un protocole inconnu. `pathToFileURL` est la
  // conversion inverse de `fileURLToPath` en tête de fichier — même piège, deux sens.
  const XLSX = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX.set_fs(fs);
  const { EXERCICES } = await import(pathToFileURL(path.join(ROOT, 'contenus/tab2-stocks.js')).href);
  const exs1 = EXERCICES.find((e) => e.id === 'exs1');
  const cl = XLSX.read(fs.readFileSync(ROOT + 'contenus/tab2/' + exs1.fichier));
  const f = cl.Sheets['Exercice'];
  exs1.controles.forEach((c) => { f[c.cellule] = { t: 'n', v: c.attendu }; });
  const rempli = path.join(os.tmpdir(), 'prepalog-exs1-rempli.xlsx');
  XLSX.writeFile(cl, rempli);
  await page.setInputFiles('#fichier', rempli);
  await page.waitForFunction(() => /10 contrôles réussis/.test(document.body.textContent), null, { timeout: 15000 });
  fs.unlinkSync(rempli);
});

// ---------- 24 bis. TAB-1 : les treize étapes, dont deux sans correction automatique
// La migration du module C-1 de la Suite. Deux choses à prouver : les contrôles générés
// tombent bien sur les cellules de réponse des classeurs repris (sinon toute la série est
// fausse sans qu'on le voie), et les deux étapes non corrigeables ne pénalisent pas
// l'élève — elles sont proposées, mais hors du total.
await v('TAB-1 : les treize étapes, et deux qui ne comptent pas', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="excel-pas-a-pas"]', { timeout: 6000 });
  await page.click('[data-act="excel-pas-a-pas"]');
  await page.waitForSelector('[data-exo="et01"]', { timeout: 6000 });

  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 13) throw new Error(`${vus.length} étapes au lieu de 13`);
  const entete = (await page.textContent('#hoteActivite')).replace(/\s+/g, ' ');
  // Le total exclut les 2 étapes non corrigeables, et la phrase annonce aussi la note
  // sur 20 — c'est sur ce dénominateur-là que l'élève est noté, pas sur 11.
  if (!/sur 11\b/.test(entete)) throw new Error('le total devrait exclure les 2 étapes non notées : ' + entete.slice(0, 160));
  if (!/soit .*\/ 20/.test(entete)) throw new Error('la note sur 20 n\'est pas annoncée à l\'élève : ' + entete.slice(0, 160));
  if (!/ne comptent pas dans ce total/.test(entete)) throw new Error('les étapes hors total ne sont pas annoncées');

  // L'étape 9 (mise en forme conditionnelle) n'a rien à déposer.
  await page.click('[data-exo="et09"]');
  await page.waitForSelector('a[download]', { timeout: 6000 });
  if (await page.$('#depot')) throw new Error('une étape sans contrôle propose quand même un dépôt');
  if (!/vérifie en classe/.test(await page.textContent('#hoteActivite'))) {
    throw new Error("l'étape sans correction n'explique pas comment elle est vérifiée");
  }
  await page.click('#btnListe');

  // L'étape 7 attend des VRAI / FAUX : c'est le seul endroit de la série où la réponse
  // est un booléen, et le classeur peut porter l'un ou l'autre selon le tableur.
  await page.waitForSelector('[data-exo="et07"]', { timeout: 6000 });
  await page.click('[data-exo="et07"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  const XLSX1 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX1.set_fs(fs);
  const { EXERCICES: EX1 } = await import(pathToFileURL(path.join(ROOT, 'contenus/tab1-excel.js')).href);
  const et07 = EX1.find((e) => e.id === 'et07');
  const cl1 = XLSX1.read(fs.readFileSync(path.join(ROOT, 'contenus/tab1/', et07.fichier)));
  const f1 = cl1.Sheets['Exercice'];
  if (!f1) throw new Error("le classeur de l'étape 7 n'a pas d'onglet « Exercice »");
  // Les cellules visées doivent être VIDES dans le modèle : si le corrigé y était déjà,
  // l'exercice n'en serait pas un. C'est ce qui a motivé le retrait de l'onglet Correction.
  et07.controles.forEach((c) => {
    if (f1[c.cellule]) throw new Error(`le modèle contient déjà une réponse en ${c.cellule}`);
    f1[c.cellule] = { t: 'b', v: c.attendu };
  });
  const rempli1 = path.join(os.tmpdir(), 'prepalog-et07-rempli.xlsx');
  XLSX1.writeFile(cl1, rempli1);
  await page.setInputFiles('#fichier', rempli1);
  await page.waitForFunction(() => /5 contrôles réussis/.test(document.body.textContent), null, { timeout: 15000 });
  fs.unlinkSync(rempli1);
});

// ---------- 24 ter. aucun classeur du dépôt ne contient le corrigé
// Les modèles viennent de la Suite, où un onglet « Correction » masqué portait les
// réponses — masqué seulement, donc à un clic droit de l'élève. Ce test est le garde-fou
// du retrait : il lit les fichiers du dépôt, donc il tient même si personne n'y pense.
//
// Il balaie **tout** `contenus/`, pas un seul dossier. Il ne visait que TAB-1 jusqu'au
// 01/10/2026 ; ce jour-là on a découvert que les dix classeurs de TAB-2, migrés avant
// que la règle soit écrite, portaient encore leur onglet. Un test qui ne regarde qu'un
// dossier ne garde que ce dossier : celui-ci couvre d'office toute série ajoutée ensuite.
// Le script `outils/modeles-sans-corrige.py` répare ce que ce test signale.
await v('classeurs du dépôt : aucun onglet Correction', async () => {
  if (!baseXlsx) throw new Error('module xlsx introuvable');
  const XLSX1 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX1.set_fs(fs);
  const racine = path.join(ROOT, 'contenus');
  const classeurs = [];
  (function parcourir(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) parcourir(p);
      else if (e.name.endsWith('.xlsx')) classeurs.push(p);
    });
  })(racine);
  // Repère de non-régression : 13 (tab1) + 10 (tab2) + 10 (tab3) + 13 (tab4) + 1 (tab5).
  // Un balayage qui ne trouverait plus rien passerait sinon en silence — c'est exactement
  // la panne qu'un garde-fou ne doit pas avoir.
  if (classeurs.length < 47) throw new Error(`${classeurs.length} classeurs trouvés, moins que les 47 attendus`);
  const fautifs = [];
  classeurs.forEach((p) => {
    const nom = path.relative(racine, p).split(path.sep).join('/');
    const cl = XLSX1.read(fs.readFileSync(p));
    if (cl.SheetNames.some((n) => /correction|corrig/i.test(n))) fautifs.push(nom);
    // Les classeurs d'une série vivent dans un sous-dossier et portent tous un onglet
    // « Exercice » ; un classeur isolé à la racine (tab5) a le sien, nommé autrement.
    if (path.dirname(p) !== racine && !cl.SheetNames.includes('Exercice')) {
      fautifs.push(nom + ' (sans onglet Exercice)');
    }
  });
  if (fautifs.length) throw new Error('classeur(s) avec corrigé : ' + fautifs.join(', '));
});

// ---------- 24 quater. TAB-3, les dix cas de calculs commerciaux
// Le cas 3 (établir un devis) est celui qu'on dépose : c'est le seul où une erreur de
// ligne se propage jusqu'aux totaux (remise de ligne → net → total HT → remise globale →
// TTC). Si les contrôles générés tombaient à côté des cellules de réponse, ou si le
// modèle portait déjà une valeur, ce cas le dirait avant les autres.
await v('TAB-3 : les dix cas de calculs commerciaux', async () => {
  await page.click('#btnListe');          // on sort de l'étape 7 de TAB-1
  await page.click('#btnRetour');          // retour à la rubrique Tableur
  await page.waitForSelector('[data-act="calculs-commerciaux"]', { timeout: 6000 });
  await page.click('[data-act="calculs-commerciaux"]');
  await page.waitForSelector('[data-exo="exc01"]', { timeout: 6000 });

  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 10) throw new Error(`${vus.length} cas au lieu de 10`);
  const entete = (await page.textContent('#hoteActivite')).replace(/\s+/g, ' ');
  // Les dix se corrigent automatiquement : aucun ne doit sortir du total, contrairement
  // à TAB-1 où deux étapes se vérifient en classe.
  if (/ne comptent pas dans ce total/.test(entete)) {
    throw new Error('un cas de TAB-3 est hors notation, alors que les dix sont corrigeables');
  }

  await page.click('[data-exo="exc03"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  const XLSX3 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX3.set_fs(fs);
  const { EXERCICES: EX3 } = await import(pathToFileURL(path.join(ROOT, 'contenus/tab3-calculs-commerciaux.js')).href);
  const exc03 = EX3.find((e) => e.id === 'exc03');
  const cl3 = XLSX3.read(fs.readFileSync(path.join(ROOT, 'contenus/tab3/', exc03.fichier)));
  const f3 = cl3.Sheets['Exercice'];
  if (!f3) throw new Error("le classeur du cas 3 n'a pas d'onglet « Exercice »");
  exc03.controles.forEach((c) => {
    if (f3[c.cellule]) throw new Error(`le modèle contient déjà une réponse en ${c.cellule}`);
    f3[c.cellule] = { t: 'n', v: c.attendu };
  });
  const rempli3 = path.join(os.tmpdir(), 'prepalog-exc03-rempli.xlsx');
  XLSX3.writeFile(cl3, rempli3);
  await page.setInputFiles('#fichier', rempli3);
  const attendus = exc03.controles.length;
  await page.waitForFunction(
    (n) => new RegExp(`${n} contrôles réussis sur ${n}`).test(document.body.textContent),
    attendus, { timeout: 15000 },
  );
  fs.unlinkSync(rempli3);
});

// ---------- 24 quinquies. TAB-4, la journée en entrepôt : le contenu et les positions
//
// Module neuf, pas une reprise de la Suite : il n'existe aucun corrigé d'origine à
// confronter, comme on l'a fait pour TAB-1 à TAB-3. Ce qui prend sa place : le générateur
// vérifie à chaque passage que les cellules visées sont vides et tombent sur des cases à
// remplir, et ce test porte des REPÈRES DE POSITION ÉCRITS À LA MAIN, qui ne descendent pas
// de la géométrie du JSON. Si les deux outils se mettaient un jour à viser des cellules
// différentes, c'est ici qu'on le verrait.
await v('TAB-4 : les treize étapes de la journée', async () => {
  const { EXERCICES: EX4 } =
    await import(pathToFileURL(path.join(ROOT, 'contenus/tab4-journee-entrepot.js')).href);

  if (EX4.length !== 13) throw new Error(`${EX4.length} étapes au lieu de 13`);
  const total = EX4.reduce((n, e) => n + e.controles.length, 0);
  if (total !== 93) throw new Error(`${total} contrôles au lieu de 93`);
  if (EX4.some((e) => !e.controles.length)) {
    throw new Error('une étape de TAB-4 est sans contrôle, donc hors notation');
  }

  // Quatre blocs de journée, et pas treize groupes d'une étape : le `groupe` sert à
  // regrouper les tuiles, donc il ne peut pas être l'heure, qui est unique à chaque étape.
  const blocs = [...new Set(EX4.map((e) => e.groupe))];
  if (blocs.length !== 4) throw new Error(`${blocs.length} blocs au lieu de 4 : ${blocs.join(' | ')}`);

  // Les repères, écrits à la main.
  const ex = (id) => EX4.find((e) => e.id === id) || (() => { throw new Error('étape absente : ' + id); })();
  const cellules = (id) => ex(id).controles.map((c) => c.cellule).join(' ');
  const repere = (id, attendu) => {
    if (cellules(id) !== attendu) {
      throw new Error(`${id} vise ${cellules(id)} au lieu de ${attendu}`);
    }
  };
  repere('cap01', 'E12 E13 E14 E15 E16 E17 E18');
  repere('cap13', 'C22 C23 C24 C25 C26 C27');
  repere('cap04', 'C30 C31 C32 C33 C34');
  repere('cap12', 'E12 F12 G12 H12 E13 F13 G13 H13');

  // Quelques valeurs attendues, recalculées ici à la main, sans passer par le générateur.
  const att = (id, cel, v, tol) => {
    const c = ex(id).controles.find((x) => x.cellule === cel);
    if (!c) throw new Error(`${id} : pas de contrôle en ${cel}`);
    const ok = typeof v === 'number' ? Math.abs(c.attendu - v) < (tol || 1e-9) : c.attendu === v;
    if (!ok) throw new Error(`${id} ${cel} : attendu ${v}, le générateur dit ${c.attendu}`);
  };
  att('cap02', 'E13', -2);                 // 8 reçus pour 10 commandés
  att('cap03', 'D12', true);               // 24 = 24
  att('cap03', 'D13', false);              // 8 ≠ 10
  att('cap04', 'C34', 217);                // 27 + 59 + 81 + 50
  att('cap05', 'F12', 52);                 // 40 + 24 − 12
  att('cap06', 'C22', 3195.25, 0.001);     // la valeur totale du stock
  att('cap07', 'C27', 15.67, 0.001);       // 156,7 / 10
  att('cap11', 'C21', 114.17, 0.001);      // le poids de l'envoi, en kilos
  att('cap12', 'H12', 0.912, 1e-9);        // 1,20 × 0,80 × 0,95
  att('cap13', 'C27', -10);                // 302 entrées − 312 sorties

  // Le piège volontaire de l'exercice 10 : un stock ÉGAL au mini n'est pas en alerte,
  // parce que le test est « strictement plus petit ». Deux lignes le rencontrent.
  att('cap10', 'E14', 'Stock suffisant');  // 15 en stock pour un mini de 15
  att('cap10', 'E18', 'Stock suffisant');  // 3 en stock pour un mini de 3
  att('cap10', 'E12', 'À commander');      // 52 pour un mini de 60

  // Les deux libellés que l'élève recopie. Ils sont écrits ici en clair : si quelqu'un
  // change « Stock suffisant » dans les données sans toucher aux consignes des classeurs,
  // ce test le dit avant les élèves.
  const textes = new Set(EX4.flatMap((e) => e.controles.map((c) => c.attendu))
    .filter((v) => typeof v === 'string'));
  ['À commander', 'Stock suffisant'].forEach((t) => {
    if (!textes.has(t)) throw new Error(`le libellé « ${t} » n'est attendu nulle part`);
  });
  if (textes.size !== 2) throw new Error('libellés inattendus : ' + [...textes].join(' | '));
});

// ---------- 24 sexies. TAB-4 : trois classeurs déposés, trois sans-faute
//
// Trois étapes choisies pour les trois sortes de valeur attendue, parce que le lecteur de
// classeurs ne les compare pas de la même façon : cap03 rend des booléens, cap09 du texte
// (comparaison indulgente sur la casse et les accents), cap13 des nombres posés dans le
// bloc d'indicateurs, sous le tableau — la position la plus fragile des treize.
await v('TAB-4 : trois classeurs déposés, trois sans-faute', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="journee-entrepot"]', { timeout: 6000 });
  await page.click('[data-act="journee-entrepot"]');
  await page.waitForSelector('[data-exo="cap01"]', { timeout: 6000 });

  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 13) throw new Error(`${vus.length} étapes affichées au lieu de 13`);
  const entete = (await page.textContent('#hoteActivite')).replace(/\s+/g, ' ');
  if (/ne comptent pas dans ce total/.test(entete)) {
    throw new Error('une étape de TAB-4 est hors notation, alors que les treize sont corrigeables');
  }
  if (!/sur 13/.test(entete)) throw new Error('le total n\'est pas sur 13 : ' + entete.slice(0, 120));

  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  const XLSX4 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX4.set_fs(fs);
  const { EXERCICES: EX4 } =
    await import(pathToFileURL(path.join(ROOT, 'contenus/tab4-journee-entrepot.js')).href);

  for (const id of ['cap03', 'cap09', 'cap13']) {
    const etape = EX4.find((e) => e.id === id);
    await page.click(`[data-exo="${id}"]`);
    await page.waitForSelector('#depot', { timeout: 6000 });

    const cl = XLSX4.read(fs.readFileSync(path.join(ROOT, 'contenus/tab4/', etape.fichier)));
    const f = cl.Sheets['Exercice'];
    if (!f) throw new Error(`${id} : le classeur n'a pas d'onglet « Exercice »`);
    etape.controles.forEach((c) => {
      // Les classeurs de TAB-4 sont fabriqués, donc les cases devraient être vides par
      // construction. On le revérifie : une construction juste aujourd'hui peut casser.
      if (f[c.cellule]) throw new Error(`${id} : le modèle contient déjà une réponse en ${c.cellule}`);
      const t = typeof c.attendu === 'boolean' ? 'b' : typeof c.attendu === 'string' ? 's' : 'n';
      f[c.cellule] = { t, v: c.attendu };
    });
    const rempli = path.join(os.tmpdir(), `prepalog-${id}-rempli.xlsx`);
    XLSX4.writeFile(cl, rempli);
    await page.setInputFiles('#fichier', rempli);
    const n = etape.controles.length;
    await page.waitForFunction(
      (k) => new RegExp(`${k} contrôles réussis sur ${k}`).test(document.body.textContent),
      n, { timeout: 15000 },
    );
    fs.unlinkSync(rempli);
    await page.click('#btnListe');
    await page.waitForSelector('[data-exo="cap01"]', { timeout: 6000 });
  }

  // On laisse la page sur une étape ouverte, pas sur la liste : le test suivant commence
  // par « revenir à la liste », et il ne trouverait pas le bouton.
  await page.click('[data-exo="cap01"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
});

// ---------- 25. l'enseignant voit la même série que l'élève
await v('série tableur : l\'enseignant voit la même série que l\'élève', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('[data-rub="tableur"]', { timeout: 6000 });
  await page.click('[data-rub="tableur"]');
  await page.click('[data-act="excel-stock"]');
  await page.waitForSelector('[data-exo="exs10"]', { timeout: 6000 });
  const n = await page.$$eval('[data-exo]', (e) => e.length);
  if (n !== 10) throw new Error(`${n} exercices au lieu de 10 côté enseignant`);
  // Plus aucun exercice n'est restreint : aucune étiquette de niveau ne doit subsister,
  // sinon c'est qu'un `niveaux` traîne encore dans le contenu.
  const etiq = await page.$$eval('[data-exo] .code', (e) => e.map((x) => x.textContent).join(' '));
  if (/2de|1re|Tle|CAP/.test(etiq)) {
    throw new Error('une étiquette de niveau subsiste : ' + etiq.slice(0, 120));
  }
});

// ---------- 25 bis. contrôle de liste : l'ordre des lignes est indifférent
// Pour les exercices du genre « relevez les références sous le minimum », l'ordre des
// lignes n'a aucun sens : le contrôle cellule par cellule compterait faux un travail juste.
// On exerce le moteur directement, sur un classeur fabriqué à la main — pas besoin
// d'ouvrir un fichier, et les quatre cas qui comptent tiennent dans un seul test : bon
// ordre, ordre inversé, un oubli, un intrus.
await v('tableur : contrôle de liste à ordre libre', async () => {
  const r = await page.evaluate(async () => {
    const { controler, decouperPlage } = await import('/core/types/tableur.js');
    // Un classeur SheetJS, réduit à ce que le moteur en lit : des cellules { v }.
    const feuille = (paires) => {
      const f = {};
      Object.entries(paires).forEach(([k, v]) => { f[k] = { v }; });
      return { SheetNames: ['Exercice'], Sheets: { Exercice: f } };
    };
    const ctrl = {
      plage: 'A2:B4', libelle: 'Références sous le minimum', tolerance: 0.01,
      lignes: [['REF-104', 12], ['REF-110', 3], ['REF-101', 7]],
    };
    const passe = (paires) => controler(feuille(paires), [ctrl], 'Exercice')[0];
    return {
      plage: decouperPlage('A2:B4'),
      // 1. l'ordre du corrigé
      ordre: passe({ A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3, A4: 'REF-101', B4: 7 }),
      // 2. le même travail, dans un autre ordre, avec accents et casse libres
      melange: passe({ A2: 'ref-101', B2: 7, A3: 'REF-104', B3: 12.004, A4: 'REF-110', B4: 3 }),
      // 3. une ligne oubliée
      oubli: passe({ A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3 }),
      // 4. une ligne écrite hors de la plage : elle ne compte pas
      horsPlage: passe({
        A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3,
        A4: 'REF-101', B4: 7, A5: 'REF-999', B5: 1,
      }),
      // 5. une ligne en trop, dans la plage
      intrus: controler(feuille({
        A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3,
        A4: 'REF-101', B4: 7, A5: 'REF-999', B5: 1,
      }), [{ ...ctrl, plage: 'A2:B5' }], 'Exercice')[0],
      // 6. un trou au milieu de la liste : ce n'est pas une faute
      trou: controler(feuille({
        A2: 'REF-104', B2: 12, A4: 'REF-110', B4: 3, A5: 'REF-101', B5: 7,
      }), [{ ...ctrl, plage: 'A2:B5' }], 'Exercice')[0],
      // 7. rien de saisi
      vide: passe({}),
    };
  });

  if (!r.plage || r.plage.colonnes.join('') !== 'AB' || r.plage.lignes.join(',') !== '2,3,4') {
    throw new Error('découpage de plage faux : ' + JSON.stringify(r.plage));
  }
  if (!r.ordre.ok) throw new Error('la liste dans l\'ordre du corrigé est refusée : ' + r.ordre.remarque);
  if (!r.melange.ok) throw new Error('l\'ordre libre est refusé : ' + r.melange.remarque);
  if (r.oubli.ok) throw new Error('une liste incomplète est acceptée');
  if (!/manquante/.test(r.oubli.remarque) || !/REF-101/.test(r.oubli.remarque)) {
    throw new Error('la ligne oubliée n\'est pas nommée : ' + r.oubli.remarque);
  }
  // Une ligne écrite hors de la plage ne compte pas : A5 est en dehors de A2:B4.
  if (!r.horsPlage.ok) throw new Error('une ligne hors plage fait échouer le contrôle : ' + r.horsPlage.remarque);
  if (r.intrus.ok) throw new Error('une ligne en trop dans la plage est acceptée');
  if (!/en trop/.test(r.intrus.remarque) || !/REF-999/.test(r.intrus.remarque)) {
    throw new Error('la ligne en trop n\'est pas nommée : ' + r.intrus.remarque);
  }
  if (!r.trou.ok) throw new Error('une ligne vide au milieu de la liste est comptée comme une faute : ' + r.trou.remarque);
  if (r.vide.ok) throw new Error('une plage vide est acceptée');
  if (!/Aucune ligne/.test(r.vide.remarque)) throw new Error('plage vide mal signalée : ' + r.vide.remarque);
});


// ---------- Logisim rangé par entreprise (02/10/2026, brief MOTEUR-logisim-par-entreprise)
// Pastille Logisim → les logos → les séances de l'entreprise. Fenêtre à part : ces cas créent
// leur propre groupe et ne dérangent pas la page partagée des autres cas.
{
const ctxL = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const pl = await ctxL.newPage();
pl.setDefaultTimeout(6000);
const erreursL = [];
const horsSite = [];
pl.on('pageerror', (e) => erreursL.push('PAGEERROR: ' + e.message));
pl.on('dialog', (d) => d.accept());
pl.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:8099/') && !r.url().startsWith('data:')) horsSite.push(r.url()); });
await pl.goto('http://127.0.0.1:8099/');
await pl.waitForSelector('#btnProf', { timeout: 8000 });

const cartes = () => pl.$$eval('.entreprise', (els) => els.map((e) => ({
  id: e.dataset.ent, texte: e.textContent.trim(), title: e.title, aria: e.getAttribute('aria-label'),
  img: e.querySelector('img') ? { alt: e.querySelector('img').alt, src: e.querySelector('img').getAttribute('src'),
    charge: e.querySelector('img').complete && e.querySelector('img').naturalWidth > 0 } : null })));
const tuilesL = () => pl.$$eval('.module-tile', (els) => els.map((e) => ({
  id: e.dataset.act, code: e.querySelector('.code').textContent, cachee: e.querySelector('[data-cachee]')?.dataset.cachee || null })));

await v('Logisim : l’enseignant voit trois logos, et rien d’autre sur la carte', async () => {
  await pl.click('#btnProf');
  await pl.waitForSelector('#btnProfEspace');
  await pl.click('#btnProfEspace');
  await pl.waitForSelector('#gNom');
  await pl.fill('#gNom', 'LOGI 1');
  await pl.click('#btnCreerG');
  await pl.waitForSelector('text=LOGI 1');
  await pl.click('[data-ong="comptes"]');
  await pl.waitForSelector('#lot');
  await pl.fill('#lot', 'LOGO ; Inès ; 3951 ; ll01');
  await pl.click('#btnLot');
  await pl.waitForTimeout(400);
  await pl.click('#btnRetour');
  await pl.click('[data-rub="logisim"]');
  await pl.waitForSelector('.entreprise');
  // Les logos se chargent après l'affichage : on leur laisse le temps, sans en faire une condition.
  await pl.waitForFunction(() => [...document.querySelectorAll('.entreprise img')].every((i) => i.complete), null, { timeout: 4000 }).catch(() => {});
  const c = await cartes();
  const attendu = { 1: 'Spartoo', 2: 'Cdiscount', 3: 'Boost' };
  if (c.map((x) => x.id).join() !== '1,2,3') throw new Error('cartes : ' + c.map((x) => x.id).join());
  for (const x of c) {
    if (x.texte) throw new Error(`carte ${x.id} : du texte visible « ${x.texte} »`);
    if (x.title !== attendu[x.id] || x.aria !== attendu[x.id] || !x.img || x.img.alt !== attendu[x.id]) throw new Error('nom d’accessibilité : ' + JSON.stringify(x));
    if (!/^\.\/contenus\/trames\/logos\//.test(x.img.src)) throw new Error('logo hors du dépôt : ' + x.img.src);
    if (!x.img.charge) throw new Error('logo non chargé : ' + x.img.src);
  }
  // Aucune tuile de séance au niveau des logos : elles sont derrière le logo.
  if ((await tuilesL()).length) throw new Error('des tuiles de séance s’affichent à côté des logos');
});

await v('Logisim : un logo ouvre les séances de son entreprise, nom et métier en tête', async () => {
  await pl.click('[data-ent="3"]');
  await pl.waitForSelector('.entreprise-tete');
  const h = await pl.$eval('.entreprise-tete', (e) => ({ h1: e.querySelector('h1').textContent, p: e.querySelector('p').textContent }));
  if (h.h1 !== 'Boost' || h.p !== 'Logistique e-commerce — Nîmes') throw new Error('en-tête : ' + JSON.stringify(h));
  const t = await tuilesL();
  if (!t.length || t.some((x) => !/^ENT-3\./.test(x.code))) throw new Error('tuiles : ' + t.map((x) => x.code).join(', '));
  // L'enseignant voit aussi les séances en préparation, étiquetées.
  if (!t.some((x) => x.cachee === 'en préparation')) throw new Error('aucune séance Boost étiquetée « en préparation »');
});

await v('Logisim : « ← LOGISIM » ramène aux logos, « ← ACCUEIL » à l’accueil', async () => {
  const lib = (await pl.textContent('#btnLogisim')).trim();
  if (lib !== '← LOGISIM') throw new Error('libellé : ' + lib);
  await pl.click('#btnLogisim');
  await pl.waitForSelector('.entreprise');
  if ((await cartes()).length !== 3) throw new Error('retour aux logos incomplet');
  await pl.click('#btnAccueil');
  await pl.waitForSelector('[data-rub="logisim"]');
  if (await pl.$('.entreprise')) throw new Error('les logos restent affichés à l’accueil');
});

await v('Logisim : l’élève ne voit pas la carte d’une entreprise sans séance ouverte', async () => {
  // On ferme pour ce groupe la seule séance prête de Cdiscount.
  await pl.click('#btnProfEspace');
  await pl.click('[data-ong="seance"]');
  await pl.waitForSelector('[data-ouvre="cdiscount-inventaire"]');
  await pl.uncheck('[data-ouvre="cdiscount-inventaire"]');
  await pl.waitForFunction(() => !document.querySelector('[data-ouvre="cdiscount-inventaire"]').checked);
  // L'enseignant, lui, garde la carte Cdiscount.
  await pl.click('#btnRetour');
  await pl.click('[data-rub="logisim"]');
  await pl.waitForSelector('.entreprise');
  if (!(await cartes()).some((x) => x.id === '2')) throw new Error('l’enseignant a perdu la carte Cdiscount');
  await pl.click('[data-ent="3"]');               // on quitte l'enseignant DANS une entreprise
  await pl.waitForSelector('.entreprise-tete');
  await pl.click('#btnDeco');
  await pl.waitForSelector('#mat');
  await pl.fill('#mat', '3951');
  await pl.fill('#code', 'll01');
  await pl.click('#btnEleve');
  await pl.waitForSelector('text=Bonjour Inès');
  // Un changement de session repart de l'accueil, pas de l'entreprise de l'utilisateur précédent.
  if (await pl.$('.entreprise-tete')) throw new Error('l’élève arrive dans l’entreprise ouverte par l’enseignant');
  await pl.click('[data-rub="logisim"]');
  await pl.waitForSelector('.entreprise');
  const ids = (await cartes()).map((x) => x.id).join();
  if (ids !== '1,3') throw new Error('cartes chez l’élève : ' + ids);
});

await v('Logisim : une entreprise à une seule séance ouverte montre quand même la liste', async () => {
  // Boost : ENT-3.1 seule est prête, les deux autres sont en préparation.
  await pl.click('[data-ent="3"]');
  await pl.waitForSelector('.entreprise-tete');
  const t = await tuilesL();
  if (t.map((x) => x.code).join() !== 'ENT-3.1') throw new Error('tuiles chez l’élève : ' + t.map((x) => x.code).join(', '));
  if (t.some((x) => x.cachee)) throw new Error('étiquette d’enseignant chez l’élève');
  if (await pl.$('.ent-shell')) throw new Error('la séance s’est ouverte sans passer par la liste');
});

await v('Logisim : « Quitter » une séance ramène à la liste de son entreprise', async () => {
  await pl.click('[data-act="boost-tournee"]');
  await pl.waitForSelector('[data-quitter]');
  await pl.click('[data-quitter]');
  await pl.waitForSelector('.entreprise-tete');
  const ent = await pl.getAttribute('.entreprise-tete', 'data-entreprise');
  if (ent !== '3') throw new Error('retour dans l’entreprise ' + ent);
  if (!(await pl.$('[data-act="boost-tournee"]'))) throw new Error('la tuile ENT-3.1 manque au retour');
});

await v('Logisim : une séance au numéro d’entreprise inconnu reste visible (« Autres »)', async () => {
  const r = await pl.evaluate(async () => {
    const { entreprisesDe } = await import('/activites/index.js');
    const m = (code) => ({ meta: { id: code, code } });
    return entreprisesDe([m('ENT-1.1'), m('ENT-9.1'), m('ENT'), m('ENT-3.2')])
      .map((e) => ({ id: e.id, logo: !!e.logo, codes: e.acts.map((a) => a.meta.code).join() }));
  });
  const vu = r.map((e) => `${e.id}:${e.codes}`).join(' | ');
  if (vu !== '1:ENT-1.1 | 3:ENT-3.2 | autres:ENT-9.1,ENT') throw new Error(vu);
  if (r.find((e) => e.id === 'autres').logo) throw new Error('« Autres » ne doit pas avoir de logo');
});

await v('Logisim : aucune requête hors du site, aucune erreur JavaScript', async () => {
  if (horsSite.length) throw new Error('requêtes hors du site : ' + horsSite.slice(0, 3).join(', '));
  if (erreursL.length) throw new Error(erreursL.slice(0, 3).join(' / '));
});

await ctxL.close();
}

}
