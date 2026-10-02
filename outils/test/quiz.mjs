// Suite de tests de Prepalog — bloc « quiz » : les quiz d'entraînement QUI-8, QUI-9 et QUI-10.
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs quiz` ne lance que ce bloc.
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

export default async function bloc({ v, page, hotesExternes }) {

/* ============================================================
/* ===== BLOC QUIZ — début (core/types/entrainement.js) ===== */
/* ============================================================
   QUI-8 — entraînement « Conversions d'unités »
   ============================================================
   Ce qui est gardé ici, et pourquoi :
     — le contrat du module (20 questions, barème 20, portée élève) ;
     — l'écran de rappel AVANT le jeu, et plus d'aide ensuite : une aide posée dans
       l'écran de travail est prise par réflexe (alerte n° 23) ;
     — une question à la fois, correction immédiate, choix verrouillés après la réponse ;
     — le clavier : répondre par 1 à 4, avancer par Entrée, et le focus qui suit le
       bouton au lieu de remonter en haut de page (alerte n° 30) ;
     — les valeurs régénérées : deux tentatives ne posent pas les mêmes nombres ;
     — le classement, son tri, et le fait qu'un seul résultat par élève y figure ;
     — ce que le classement montre d'un élève : prénom et initiale, jamais le nom entier ;
     — `poserLigne`, qui remplace une ligne au lieu d'en ajouter une ;
     — la calculette, et sa disparition quand on quitte l'activité ;
     — et qu'un enseignant qui essaie le quiz ne s'enregistre ni note ni rang.
   ============================================================ */

// Ce bloc se donne SON groupe et SON élève, au lieu de réutiliser ceux du début de la
// suite : entre-temps, d'autres tests créent, déplacent et suppriment des groupes, et un
// élève emporté par une suppression de groupe faisait tomber tout ce qui suit avec un
// « sélecteur introuvable » qui ne désigne rien.
const GROUPE_QZ = '1 LOG QZ';
const MAT_QZ = '2901';
const CODE_QZ = 'zzz9';

async function deconnecter() {
  await page.goto('http://127.0.0.1:8099/');
  await page.waitForSelector('#mat, #btnDeco', { timeout: 8000 });
  if (await page.$('#btnDeco')) {
    await page.click('#btnDeco');
    await page.waitForSelector('#mat', { timeout: 8000 });
  }
}

async function connecterEleveQz() {
  await deconnecter();
  await page.fill('#mat', MAT_QZ);
  await page.fill('#code', CODE_QZ);
  await page.click('#btnEleve');
  await page.waitForSelector('[data-rub="quiz"]', { timeout: 8000 });
}

// Joue le quiz jusqu'au bilan, en répondant toujours le premier choix. Le nombre de
// questions restantes dépend de ce que le test précédent a déjà joué : on s'arrête sur
// l'apparition du bilan, pas sur un compteur.
async function jouerJusquAuBilan(max = 25) {
  for (let i = 0; i < max; i++) {
    if (await page.$('.qz-note')) return;
    const b = await page.$('.qz-opt:not([disabled])');
    if (!b) break;
    await b.click();
    await page.waitForSelector('#qzSuivant', { timeout: 6000 });
    await page.click('#qzSuivant');
  }
  await page.waitForSelector('.qz-note', { timeout: 6000 });
}

async function ouvrirQuizQz() {
  await page.click('[data-rub="quiz"]');
  await page.waitForSelector('[data-act="entr-conversions"]', { timeout: 6000 });
  await page.click('[data-act="entr-conversions"]');
  await page.waitForSelector('#qzCommencer', { timeout: 6000 });
}

await v('QUI-8 : un groupe et un élève dédiés pour ce bloc', async () => {
  await deconnecter();
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('#gNom', { timeout: 6000 });
  await page.fill('#gNom', GROUPE_QZ);
  await page.click('#btnCreerG');
  await page.waitForSelector(`text=${GROUPE_QZ}`, { timeout: 6000 });
  await page.click('[data-ong="comptes"]');
  await page.waitForSelector('#lot', { timeout: 6000 });
  await page.fill('#lot', `MORIN ; Zoé ; ${MAT_QZ} ; ${CODE_QZ}`);
  await page.click('#btnLot');
  await page.waitForSelector('text=MORIN', { timeout: 6000 });
});

await v('QUI-8 : le module déclare 20 questions, un barème de 20 et la portée élève', async () => {
  const m = await page.evaluate(async () => {
    const a = await import('/activites/entr-conversions.js');
    const c = await import('/contenus/entr-conversions.js');
    return { meta: a.meta, nbGen: c.GENERATEURS.length, nbRappel: c.RAPPEL.length };
  });
  if (m.nbGen !== 20) throw new Error(m.nbGen + ' générateurs au lieu de 20');
  if (m.meta.bareme !== 20) throw new Error('barème ' + m.meta.bareme);
  if (m.meta.portee !== 'eleve') throw new Error('portée ' + m.meta.portee);
  if (m.meta.rubrique !== 'quiz') throw new Error('rubrique ' + m.meta.rubrique);
  if (m.meta.code !== 'QUI-8') throw new Error('code ' + m.meta.code);
  if (m.meta.notation) throw new Error('notation déclarée : ' + m.meta.notation);
  if (m.nbRappel < 3) throw new Error('rappel trop court');
});

await v('QUI-8 : les 20 générateurs donnent des questions à quatre choix distincts', async () => {
  const r = await page.evaluate(async () => {
    const c = await import('/contenus/entr-conversions.js');
    const pbs = [];
    c.GENERATEURS.forEach((g, i) => {
      for (let n = 0; n < 60; n++) {
        const q = g();
        if (q.choix.length !== 4) pbs.push(`G${i + 1} : ${q.choix.length} choix`);
        if (new Set(q.choix).size !== 4) pbs.push(`G${i + 1} : doublon`);
        if (q.juste < 0 || q.juste > 3) pbs.push(`G${i + 1} : index ${q.juste}`);
        if (!q.explication) pbs.push(`G${i + 1} : pas d'explication`);
        if (/Aucune de ces réponses/.test(q.choix.join('|'))) pbs.push(`G${i + 1} : repli « Aucune de ces réponses »`);
      }
    });
    return [...new Set(pbs)];
  });
  if (r.length) throw new Error(r.slice(0, 3).join(' | '));
});

// Le garde-fou des doublons n'est plus atteint par aucun générateur de ce quiz — c'est
// justement pour ça qu'il est éprouvé ici directement. Sans lui, une question pourrait
// offrir deux fois la même valeur, dont la bonne : deux réponses justes cochables, et un
// élève sanctionné pour avoir choisi la seconde.
await v('questions : un distracteur qui tombe sur la bonne réponse est écarté', async () => {
  const r = await page.evaluate(async () => {
    const { question } = await import('/core/questions.js');
    const q = question('Combien ?', '2,5 h', ['3,5 h', '2,5 h', '2,5 h'], 'parce que');
    return { choix: q.choix, juste: q.choix[q.juste], distincts: new Set(q.choix).size };
  });
  if (r.distincts !== 4) throw new Error('choix obtenus : ' + r.choix.join(' / '));
  if (r.juste !== '2,5 h') throw new Error('la bonne réponse a bougé : ' + r.juste);
  if (!r.choix.some((c) => /Aucune de ces réponses/.test(c))) {
    throw new Error('le doublon a été écarté sans être remplacé : ' + r.choix.join(' / '));
  }
});

// Le quiz s'ouvre sur le rappel. C'est le seul endroit où l'aide est donnée : une fois la
// première question posée, elle ne doit plus être à portée de clic.
await v('QUI-8 : le quiz s’ouvre sur le rappel, et l’aide disparaît dès la première question', async () => {
  // La suite arrive ici avec une session ouverte, celle du test précédent : le mode
  // démonstration la restaure au rechargement. On se déconnecte d'abord si besoin.
  await connecterEleveQz();
  await ouvrirQuizQz();

  const nRappel = await page.$$eval('.qz-rappel li', (e) => e.length);
  if (nRappel < 3) throw new Error(nRappel + ' ligne(s) de rappel');
  if (await page.$('.qz-opt')) throw new Error('une question est déjà affichée avant « Commencer »');

  await page.click('#qzCommencer');
  await page.waitForSelector('.qz-opt', { timeout: 6000 });
  if (await page.$('.qz-rappel')) throw new Error('le rappel reste affiché pendant le jeu');
  const n = await page.$$eval('.qz-enonce', (e) => e.length);
  if (n !== 1) throw new Error(n + ' énoncé(s) affiché(s) : on en attend un seul');
  const c = await page.$$eval('.qz-opt', (e) => e.length);
  if (c !== 4) throw new Error(c + ' choix');
  if (!/Question 1 \/ 20/.test(await page.textContent('.qz-tete'))) throw new Error('compteur de question absent');
});

await v('QUI-8 : répondre corrige tout de suite, explique, et verrouille les choix', async () => {
  await page.click('.qz-opt');
  await page.waitForSelector('#qzSuivant', { timeout: 6000 });
  const a = await page.evaluate(() => ({
    retour: document.querySelector('#qzRetour').textContent.trim(),
    classe: document.querySelector('#qzRetour').className,
    verrouilles: [...document.querySelectorAll('.qz-opt')].every((b) => b.disabled),
    justes: document.querySelectorAll('.qz-opt.juste').length,
    marques: document.querySelectorAll('.qz-opt.juste, .qz-opt.faux').length,
    tete: document.querySelector('.qz-tete').textContent,
  }));
  if (!a.verrouilles) throw new Error('les choix restent cliquables après la réponse');
  if (a.justes !== 1) throw new Error(a.justes + ' bonne(s) réponse(s) signalée(s)');
  if (a.marques < 1 || a.marques > 2) throw new Error(a.marques + ' choix marqués');
  if (!/^[✓✗]/.test(a.retour)) throw new Error('pas de verdict : ' + a.retour);
  if (a.retour.length < 20) throw new Error("l'explication n'est pas affichée : " + a.retour);
  if (!/(juste|faux)/.test(a.classe)) throw new Error('retour sans habillage : ' + a.classe);
  if (!/Score : \d+ \/ 1/.test(a.tete)) throw new Error('score non mis à jour : ' + a.tete);
});

// Le clavier. Un élève qui enchaîne vingt questions à la souris perd un temps considérable ;
// et surtout, le second Entrée ne faisait rien quand l'écran se redessinait entièrement.
await v('QUI-8 : au clavier, 1 à 4 répondent, Entrée avance, et le focus suit le bouton', async () => {
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /Question 2 \/ 20/.test(document.querySelector('.qz-tete')?.textContent || ''), null, { timeout: 6000 });
  await page.keyboard.press('2');
  await page.waitForSelector('#qzSuivant', { timeout: 6000 });
  const focus = await page.evaluate(() => document.activeElement?.id || '');
  if (focus !== 'qzSuivant') throw new Error('focus sur « ' + (focus || 'rien') + " » au lieu du bouton suivant");
  // Deux Entrée d'affilée doivent faire avancer deux fois : c'est exactement ce qui ne
  // marchait plus quand le focus était perdu au redessin.
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /Question 3 \/ 20/.test(document.querySelector('.qz-tete')?.textContent || ''), null, { timeout: 6000 });
  await page.keyboard.press('1');
  await page.waitForSelector('#qzSuivant', { timeout: 6000 });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /Question 4 \/ 20/.test(document.querySelector('.qz-tete')?.textContent || ''), null, { timeout: 6000 });
  // Une touche hors 1-4 ne répond pas.
  await page.keyboard.press('7');
  if (await page.$('#qzSuivant')) throw new Error('la touche 7 a répondu à une question à quatre choix');
});

await v('QUI-8 : la calculette calcule, affiche la virgule française, et ne divise pas par zéro', async () => {
  await page.waitForSelector('#calcBascule', { timeout: 6000 });
  await page.click('#calcBascule');
  await page.waitForSelector('#calcPanneau.ouvert', { timeout: 4000 });
  const taper = async (suite) => {
    for (const t of suite) {
      if (t === '=') await page.click('[data-calc="egal"]');
      else if (t === ',') await page.click('[data-calc="virgule"]');
      else if ('+-×÷'.includes(t)) await page.click(`[data-calc="op"][data-op="${t}"]`);
      else await page.click(`[data-calc="chiffre"][data-d="${t}"]`);
    }
    return (await page.textContent('#calcEcran')).trim();
  };
  await page.click('[data-calc="effacer"]');
  if (await taper('12×7='.split('')) !== '84') throw new Error('12 × 7 : ' + await page.textContent('#calcEcran'));
  await page.click('[data-calc="effacer"]');
  if (await taper('5÷2='.split('')) !== '2,5') throw new Error('5 ÷ 2 ne donne pas 2,5 : ' + await page.textContent('#calcEcran'));
  await page.click('[data-calc="effacer"]');
  const r = await taper('8÷0='.split(''));
  if (/Infinity|NaN/.test(r)) throw new Error('division par zéro affichée brute : ' + r);
  // Ouverte, la calculette flotte au-dessus de la question : la page doit se réserver de
  // la place en bas, sinon les deux choix de droite passent dessous et deviennent
  // illisibles — constaté à l'écran, pas par un test.
  const recouvre = await page.evaluate(() => {
    const p = document.querySelector('#calcPanneau').getBoundingClientRect();
    const croise = (r) => !(r.right <= p.left || r.left >= p.right || r.bottom <= p.top || r.top >= p.bottom);
    return [...document.querySelectorAll('.qz-opt')].filter((b) => croise(b.getBoundingClientRect()))
      .map((b) => b.textContent.trim());
  });
  if (recouvre.length) throw new Error('la calculette recouvre ' + recouvre.length + ' choix : ' + recouvre.join(' / '));
  await page.click('[data-calc="effacer"]');
  await page.click('#calcFermer');
  if (await page.$('#calcPanneau.ouvert')) throw new Error('la calculette ne se referme pas');
  // Et la place cédée est bien rendue à la fermeture : sinon le quiz resterait étriqué
  // pour le reste de la séance.
  const mesurer = () => page.evaluate(() => document.querySelector('.qz-choix').getBoundingClientRect().width
    + (parseInt(getComputedStyle(document.body).paddingBottom, 10) || 0));
  const ferme = await mesurer();
  await page.click('#calcBascule');
  await page.waitForSelector('#calcPanneau.ouvert', { timeout: 4000 });
  const ouvert = await mesurer();
  if (ouvert === ferme) throw new Error('la page ne cède aucune place à la calculette ouverte');
  await page.click('#calcFermer');
  await page.waitForTimeout(100);
  if (await mesurer() !== ferme) throw new Error('la place cédée n’est pas rendue à la fermeture');
});

// Vingt questions jouées pour de bon : c'est le seul test qui vérifie le chronomètre, le
// bilan et la remontée au suivi de classe.
await v('QUI-8 : les vingt questions se jouent, le bilan donne le score et le temps', async () => {
  await jouerJusquAuBilan();
  const t = await page.textContent('.qz-bilan');
  const m = /(\d+) \/ 20/.exec(t);
  if (!m) throw new Error('pas de score au bilan : ' + t.replace(/\s+/g, ' ').slice(0, 120));
  if (!/en \d+:\d\d/.test(t)) throw new Error('pas de temps au bilan');
  if (!(await page.$('#qzRecommencer'))) throw new Error('pas de bouton pour recommencer');
});

await v('QUI-8 : les nombres changent d’une tentative à l’autre', async () => {
  const lire = async () => {
    await page.waitForSelector('.qz-enonce', { timeout: 6000 });
    const e = [];
    for (let i = 0; i < 6; i++) {
      e.push((await page.textContent('.qz-enonce')).trim());
      await page.click('.qz-opt');
      await page.waitForSelector('#qzSuivant', { timeout: 6000 });
      await page.click('#qzSuivant');
    }
    return e;
  };
  await page.click('#qzRecommencer');
  const a = await lire();
  await jouerJusquAuBilan();
  await page.click('#qzRecommencer');
  const b = await lire();
  // Les six premières questions portent sur les mêmes notions dans le même ordre : ce
  // qui doit changer, ce sont les NOMBRES. On exige au moins la moitié des énoncés
  // différents — avec sept à dix tirages par générateur, deux séries identiques sont
  // possibles mais invraisemblables.
  const differents = a.filter((x, i) => x !== b[i]).length;
  if (differents < 3) throw new Error(`${differents} énoncé(s) différents sur 6 : les valeurs ne sont pas régénérées`);
  if (!(await page.$('.qz-opt'))) throw new Error('le quiz ne redémarre pas');
});

await v('QUI-8 : au classement, le résultat est anonyme par défaut', async () => {
  await jouerJusquAuBilan();
  await page.waitForSelector('#qzVoirClassement2', { timeout: 6000 });
  await page.click('#qzVoirClassement2');
  await page.waitForSelector('.qz-table, .vide', { timeout: 6000 });
  const t = await page.textContent('.panneau');
  if (/Zoé/.test(t) || /MORIN/.test(t)) throw new Error('un nom apparaît au classement sans que l’élève l’ait demandé');
  if (!/Anonyme \(moi\)/.test(t.replace(/\s+/g, ' '))) throw new Error('l’élève ne se reconnaît pas dans le classement');
  if (!(await page.$('.qz-table tr.qz-moi'))) throw new Error('la ligne de l’élève n’est pas mise en avant');
  const n = await page.$$eval('.qz-table tbody tr', (l) => l.length);
  if (n !== 1) throw new Error(n + ' ligne(s) alors que le même élève a joué trois fois');
  await page.click('[data-o="tous"]');
  await page.waitForSelector('.qz-table', { timeout: 4000 });
  if (!/1 LOG QZ/.test(await page.textContent('.panneau'))) throw new Error('le nom du groupe n’est pas affiché');
  if (!(await page.$('#qzMontrer'))) throw new Error('rien ne permet à l’élève de s’attribuer son score');
});

// Le nom n'est pas masqué : il n'est pas écrit. C'est la différence entre « on ne
// l'affiche pas » et « il n'y est pas », et c'est la seule promesse tenable sur une base
// que toutes les classes lisent.
await v('QUI-8 : tant que l’élève reste anonyme, son nom n’est pas dans la base', async () => {
  const ligne = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const l = await B.lireTable('classements', 'entr-conversions');
    return l[0] || null;
  });
  if (!ligne) throw new Error('aucune ligne de classement enregistrée');
  const texte = JSON.stringify(ligne);
  if (/Zoé|MORIN|Morin/.test(texte)) throw new Error('la ligne enregistrée porte un nom : ' + texte);
  if (typeof ligne.score !== 'number' || !ligne.groupe) throw new Error('ligne incomplète : ' + texte);
});

await v('QUI-8 : l’élève peut s’attribuer son score, et revenir en arrière', async () => {
  await page.click('#qzMontrer');
  await page.waitForSelector('#qzAnonyme', { timeout: 6000 });
  let t = await page.textContent('.panneau');
  if (!/Zoé M\./.test(t)) throw new Error('le prénom n’apparaît pas après l’avoir demandé');
  if (/MORIN/.test(t)) throw new Error('le nom de famille entier est affiché : seule l’initiale doit l’être');

  // Le choix tient d'une tentative à l'autre : sinon l'élève devrait le refaire à chaque
  // partie, et finirait par ne plus le faire du tout.
  await page.click('#qzRejouer');
  await page.waitForSelector('#qzCommencer', { timeout: 6000 });
  await page.click('#qzCommencer');
  await jouerJusquAuBilan();
  await page.click('#qzVoirClassement2');
  await page.waitForSelector('.qz-table', { timeout: 6000 });
  if (!/Zoé M\./.test(await page.textContent('.panneau'))) throw new Error('le choix de s’afficher n’a pas survécu à une nouvelle tentative');

  // Et revenir à l'anonymat efface le nom de la base, au lieu de cesser de l'afficher.
  await page.click('#qzAnonyme');
  await page.waitForSelector('#qzMontrer', { timeout: 6000 });
  t = await page.textContent('.panneau');
  if (/Zoé/.test(t)) throw new Error('le prénom reste affiché après le retour à l’anonymat');
  const texte = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    return JSON.stringify(await B.lireTable('classements', 'entr-conversions'));
  });
  if (/Zoé|MORIN/.test(texte)) throw new Error('le nom est seulement caché, pas effacé : ' + texte);
  if (!/"score"/.test(texte)) throw new Error('le résultat a disparu avec le nom : ' + texte);
});

await v('QUI-8 : le classement trie par score, puis par temps à égalité', async () => {
  const r = await page.evaluate(async () => {
    const m = await import('/core/types/entrainement.js');
    const rangs = m.classer([
      { id: 'a', score: 12, temps: 60 },
      { id: 'b', score: 18, temps: 300 },
      { id: 'c', score: 18, temps: 120 },
      { id: 'd', score: 18 },
      { id: 'e', score: null, temps: 10 },
    ]).map((l) => l.id);
    return {
      rangs,
      mieuxScore: m.meilleurQue({ score: 15, temps: 400 }, { score: 14, temps: 10 }),
      mieuxTemps: m.meilleurQue({ score: 14, temps: 80 }, { score: 14, temps: 90 }),
      pasMieux: m.meilleurQue({ score: 14, temps: 95 }, { score: 14, temps: 90 }),
      premier: m.meilleurQue({ score: 0, temps: 5 }, null),
      mm: [m.minSec(0), m.minSec(65), m.minSec(600), m.minSec(null)],
    };
  });
  if (r.rangs.join(',') !== 'c,b,d,a') throw new Error('ordre obtenu : ' + r.rangs.join(','));
  if (!r.mieuxScore) throw new Error('un meilleur score plus lent devrait gagner');
  if (!r.mieuxTemps) throw new Error('à score égal, le plus rapide devrait gagner');
  if (r.pasMieux) throw new Error('un temps plus lent à score égal ne doit pas remplacer');
  if (!r.premier) throw new Error('un premier résultat doit toujours s’enregistrer');
  if (r.mm.join('|') !== '0:00|1:05|10:00|—') throw new Error('temps mal formatés : ' + r.mm.join('|'));
});

await v('poserLigne : une clé choisie, et une ligne remplacée au lieu d’ajoutée', async () => {
  const r = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const c = 'communs/essai-poser';
    await B.viderTable(c, 'scores');
    await B.poserLigne(c, 'scores', 'u1', { score: 5, max: 20, temps: 100, nom: 'A.' });
    await B.poserLigne(c, 'scores', 'u1', { score: 9, max: 20, temps: 90, nom: 'A.' });
    await B.poserLigne(c, 'scores', 'u2', { score: 7, max: 20, temps: 50, nom: 'B.' });
    const l = await B.lireTable(c, 'scores');
    await B.viderTable(c, 'scores');
    return l.map((x) => `${x.id}:${x.score}`).sort();
  });
  if (r.join(',') !== 'u1:9,u2:7') throw new Error('contenu obtenu : ' + r.join(','));
});

// Le moteur lui-même, joué sans faute, hors du site : c'est le seul test qui vérifie
// qu'un parcours parfait remonte bien 3 sur 3 avec un temps.
await v('entraînement : un parcours sans faute remonte le score complet et le temps', async () => {
  const r = await page.evaluate(async () => {
    const { creerEntrainement } = await import('/core/types/entrainement.js');
    const QS = [
      { enonce: 'Q1', choix: ['bon1', 'f1', 'f2', 'f3'], juste: 0, explication: 'parce que' },
      { enonce: 'Q2', choix: ['g1', 'bon2', 'g2', 'g3'], juste: 1, explication: 'parce que' },
      { enonce: 'Q3', choix: ['h1', 'h2', 'bon3', 'h3'], juste: 2, explication: 'parce que' },
    ];
    const BONS = { Q1: 'bon1', Q2: 'bon2', Q3: 'bon3' };
    let enregistre = null;
    const hote = document.createElement('div');
    document.body.appendChild(hote);
    const moteur = creerEntrainement({ rappel: ['a', 'b', 'c'], questions: QS, calculette: false, classement: false });
    moteur.rendre(hote, {
      profil: { uid: 'x', role: 'eleve', prenom: 'Test', nom: 'Essai' },
      groupe: 'g', groupeNom: 'G', meta: { id: 'essai-moteur' },
      async lireScore() { return null; },
      async enregistrer(res) { enregistre = res; },
    });
    const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
    await attendre(30);
    hote.querySelector('#qzCommencer').click();
    const ordre = [];
    for (let i = 0; i < 3; i++) {
      await attendre(20);
      const enonce = hote.querySelector('.qz-enonce').textContent.trim();
      ordre.push(enonce);
      const cible = [...hote.querySelectorAll('.qz-opt')].find((b) => b.textContent.includes(BONS[enonce]));
      cible.click();
      await attendre(20);
      hote.querySelector('#qzSuivant').click();
    }
    await attendre(80);
    const bilan = hote.querySelector('.qz-bilan')?.textContent || '';
    hote.remove();
    return { enregistre, bilan: bilan.replace(/\s+/g, ' ').trim(), ordre };
  });
  if (!r.enregistre) throw new Error('rien n’a été remonté au suivi');
  if (r.enregistre.score !== 3 || r.enregistre.max !== 3) throw new Error('score remonté : ' + JSON.stringify(r.enregistre));
  if (typeof r.enregistre.detail?.temps !== 'number') throw new Error('pas de temps dans le détail');
  if (!/3 \/ 3/.test(r.bilan)) throw new Error('bilan : ' + r.bilan.slice(0, 120));
});

// Les quiz figés (géographie, français, CACES) viendront après celui-ci. Le mélange est
// ce qui les empêche d'être appris par cœur : sans lui, un élève retient « c'était la
// troisième réponse » sans avoir rien compris. Le témoin, lui, porte des générateurs,
// donc rien dans le site n'exerce encore ce chemin — d'où ce test.
await v('entraînement : des questions figées sont mélangées, énoncés ET réponses', async () => {
  const r = await page.evaluate(async () => {
    const { melangerQuestionsFixes } = await import('/core/questions.js');
    const QS = [1, 2, 3, 4, 5, 6].map((n) => ({
      enonce: 'Q' + n, choix: ['bon' + n, 'a' + n, 'b' + n, 'c' + n], juste: 0, explication: 'x',
    }));
    const premiers = new Set();
    const places = new Set();
    let incoherences = 0;
    for (let i = 0; i < 60; i++) {
      const m = melangerQuestionsFixes(QS);
      if (m.length !== QS.length) incoherences++;
      premiers.add(m[0].enonce);
      places.add(m[0].choix.indexOf('bon' + m[0].enonce.slice(1)));
      // La bonne réponse doit suivre son déplacement : `juste` pointe toujours dessus.
      m.forEach((q) => {
        if (q.choix[q.juste] !== 'bon' + q.enonce.slice(1)) incoherences++;
      });
    }
    return { premiers: premiers.size, places: places.size, incoherences };
  });
  if (r.incoherences) throw new Error(r.incoherences + ' question(s) dont la bonne réponse a été perdue au mélange');
  if (r.premiers < 3) throw new Error("l'ordre des questions ne change pas (" + r.premiers + ' premières questions différentes sur 60 tirages)');
  if (r.places < 3) throw new Error("la place de la bonne réponse ne change pas (" + r.places + ' positions sur 60 tirages)');
});

await v('QUI-8 : la calculette quitte l’écran avec l’activité', async () => {
  await connecterEleveQz();
  await ouvrirQuizQz();
  if (!(await page.$('#calcBascule'))) throw new Error('la calculette ne s’affiche pas dans le quiz');
  // Le retour ramène à la rubrique Quiz, pas aux pastilles : la rubrique ouverte est
  // conservée. On attend donc la tuile du module, pas la pastille.
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="entr-conversions"]', { timeout: 6000 });
  await page.waitForTimeout(200);
  if (await page.$('#calcBascule')) throw new Error('la calculette flotte encore après avoir quitté le quiz');
});

await v('QUI-8 : le suivi de classe affiche la note sur 20 du quiz', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf', { timeout: 6000 });
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=QUI-8', { timeout: 6000 });
  const cellule = (await page.$$eval('#contenuProf tbody tr', (lignes) => {
    const l = lignes.find((x) => /MORIN/.test(x.textContent));
    return l ? [...l.querySelectorAll('td')].map((d) => ({ txt: d.textContent.replace(/\s+/g, ' ').trim(), titre: d.getAttribute('title') || '' })) : [];
  })).filter((c) => /\/20/.test(c.txt));
  if (!cellule.length) throw new Error('aucune note sur 20 dans la ligne de l’élève');
  const colonne = await page.textContent('th[title*="Conversions"]');
  if (!/\/\s*20/.test(colonne)) throw new Error('la colonne n’annonce pas un barème sur 20 : ' + colonne.trim());
});

// Un enseignant essaie un module sans fausser les données de la classe. C'est déjà la
// règle pour les séries tableur ; elle doit tenir ici aussi, note ET classement.
await v('QUI-8 : un enseignant qui joue ne s’enregistre ni note ni rang', async () => {
  const avant = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    return (await B.lireTable('classements', 'entr-conversions')).length;
  });
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="quiz"]', { timeout: 6000 });
  await page.click('[data-rub="quiz"]');
  await page.click('[data-act="entr-conversions"]');
  await page.waitForSelector('#qzCommencer', { timeout: 6000 });
  if (!/enseignant/.test(await page.textContent('.panneau'))) throw new Error('rien ne prévient l’enseignant que son score n’est pas enregistré');
  await page.click('#qzCommencer');
  await jouerJusquAuBilan();
  const apres = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    return (await B.lireTable('classements', 'entr-conversions')).length;
  });
  if (apres !== avant) throw new Error(`le classement est passé de ${avant} à ${apres} ligne(s)`);
});

await v('QUI-8 : rien n’est allé chercher quoi que ce soit à l’extérieur', async () => {
  if (hotesExternes.size) throw new Error('dépendance extérieure : ' + [...hotesExternes].join(', '));
});

/* ===== BLOC QUIZ — fin ===== */


/* ===== BLOC QUIZ CALCUL — début (QUI-9 Proportionnalité, QUI-10 Arrondis et pourcentages) ===== */
/* Les deux quiz tournent sur le même moteur que QUI-8 ; ce bloc ne reteste donc pas le moteur,
   seulement ce qui leur est propre : leur contrat, leurs 20 générateurs (énumérés avec bien
   plus de tirages que QUI-8, car c'est ce qui a trouvé les défauts de la Suite), et le fait
   qu'on peut les ouvrir et les jouer jusqu'au bilan. Il réutilise le groupe et l'élève du
   bloc précédent (GROUPE_QZ / MAT_QZ). */

const QUIZ_CALCUL = [
  { id: 'entr-proportionnalite', code: 'QUI-9' },
  { id: 'entr-arrondis', code: 'QUI-10' },
];

for (const { id, code } of QUIZ_CALCUL) {
  await v(`${code} : contrat du module et 20 générateurs sans « Aucune de ces réponses » (1 500 tirages chacun)`, async () => {
    const r = await page.evaluate(async (id) => {
      const a = await import(`/activites/${id}.js`);
      const c = await import(`/contenus/${id}.js`);
      const pbs = [];
      c.GENERATEURS.forEach((g, i) => {
        for (let n = 0; n < 1500; n++) {
          const q = g();
          const bonne = q.choix[q.juste];
          if (q.choix.length !== 4) pbs.push(`G${i + 1} : ${q.choix.length} choix`);
          if (new Set(q.choix).size !== 4) pbs.push(`G${i + 1} : doublon`);
          if (bonne === undefined) pbs.push(`G${i + 1} : index ${q.juste}`);
          if (!q.explication) pbs.push(`G${i + 1} : pas d'explication`);
          if (/Aucune de ces réponses/.test(q.choix.join('|'))) pbs.push(`G${i + 1} : repli « Aucune de ces réponses » (« ${q.enonce} »)`);
          if (/NaN|undefined|Infinity/.test(q.enonce + q.choix.join('') + q.explication)) pbs.push(`G${i + 1} : NaN`);
        }
      });
      return { meta: a.meta, nbGen: c.GENERATEURS.length, nbRappel: c.RAPPEL.length, pbs: [...new Set(pbs)] };
    }, id);
    if (r.nbGen !== 20) throw new Error(r.nbGen + ' générateurs au lieu de 20');
    if (r.meta.bareme !== 20) throw new Error('barème ' + r.meta.bareme);
    if (r.meta.portee !== 'eleve') throw new Error('portée ' + r.meta.portee);
    if (r.meta.rubrique !== 'quiz') throw new Error('rubrique ' + r.meta.rubrique);
    if (r.meta.code !== code) throw new Error('code ' + r.meta.code);
    if (r.nbRappel < 3) throw new Error('rappel trop court');
    if (r.pbs.length) throw new Error(r.pbs.slice(0, 3).join(' | '));
  });
}

// Défaut de la Suite : en flottants, 2,425 × 100 tombe à 242,4999… et l'arrondi au centième
// donnait 2,42 — la BONNE réponse affichée était fausse. Le calcul est maintenant en entiers ;
// ce test relit chaque énoncé « Arrondir X … près » et recalcule la réponse sur le texte, sans
// aucun flottant.
await v('QUI-10 : toute réponse d’arrondi est juste (recalculée sur le texte, en entiers)', async () => {
  const r = await page.evaluate(async () => {
    const c = await import('/contenus/entr-arrondis.js');
    const faux = []; let verifs = 0;
    c.GENERATEURS.forEach((g) => {
      for (let n = 0; n < 3000; n++) {
        const q = g();
        const m = q.enonce.match(/Arrondir ([\d\s  ,]+) (?:à l'unité|au (dixième|centième)) près/);
        if (!m) continue;
        const x = m[1].replace(/[\s  ]/g, '');
        const dec = m[2] === 'dixième' ? 1 : m[2] === 'centième' ? 2 : 0;
        const [ip, fp = ''] = x.split(',');
        const chiffres = ip + fp.padEnd(dec + 1, '0');
        const garde = chiffres.slice(0, ip.length + dec);
        const suivant = Number(chiffres[ip.length + dec]);
        const s = (BigInt(garde) + (suivant >= 5 ? 1n : 0n)).toString().padStart(dec + 1, '0');
        const attendu = dec ? s.slice(0, -dec) + ',' + s.slice(-dec) : s;
        verifs++;
        if (q.choix[q.juste].replace(/[\s  ]/g, '') !== attendu) faux.push(`${q.enonce} → ${q.choix[q.juste]} (attendu ${attendu})`);
      }
    });
    return { faux: [...new Set(faux)], verifs };
  });
  if (r.verifs < 1000) throw new Error('seulement ' + r.verifs + ' arrondis relus : le test ne voit plus les énoncés');
  if (r.faux.length) throw new Error(r.faux.slice(0, 2).join(' | '));
});

for (const { id, code } of QUIZ_CALCUL) {
  await v(`${code} : la tuile s’ouvre sur le rappel et le quiz se joue jusqu’au bilan sur 20`, async () => {
    await connecterEleveQz();
    await page.click('[data-rub="quiz"]');
    await page.waitForSelector(`[data-act="${id}"]`, { timeout: 6000 });
    await page.click(`[data-act="${id}"]`);
    await page.waitForSelector('#qzCommencer', { timeout: 6000 });
    if ((await page.$$eval('.qz-rappel li', (e) => e.length)) < 3) throw new Error('rappel absent');
    await page.click('#qzCommencer');
    await page.waitForSelector('.qz-opt', { timeout: 6000 });
    if (!/Question 1 \/ 20/.test(await page.textContent('.qz-tete'))) throw new Error('compteur de question absent');
    await jouerJusquAuBilan();
    if (!/\/ 20/.test(await page.textContent('.qz-note'))) throw new Error('bilan non noté sur 20');
  });
}

await v('QUI-9 et QUI-10 : rien n’est allé chercher quoi que ce soit à l’extérieur', async () => {
  if (hotesExternes.size) throw new Error('dépendance extérieure : ' + [...hotesExternes].join(', '));
});

/* ===== BLOC QUIZ CALCUL — fin ===== */

}
