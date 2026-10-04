// Suite de tests de Prepalog — bloc « spartoo » : Spartoo, ENT-1.1 à 1.3 (préparation, réception, traçabilité).
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs spartoo` ne lance que ce bloc (précédé de : socle, dont il a besoin).
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function bloc({ v, page, ROOT }) {

// ---------- 26. Spartoo : l'environnement s'ouvre et la base de l'élève est semée
await v('Spartoo : ouverture de l\'environnement', async () => {
  // On revient de l'activité précédente vers l'espace enseignant, sur le bon groupe.
  if (await page.$('#btnListe')) await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil').catch(() => {});
  if (await page.$('#btnAccueil')) await page.click('#btnAccueil');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="groupes"]');
  const aActiver = await page.$('[data-actif="1-log-a"]');
  if (aActiver) { await aActiver.click(); await page.waitForTimeout(300); }
  // L'enseignant pose ensuite le code qui déverrouille la vue d'ensemble du stock.
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('#codeStock');
  await page.fill('#codeStock', 'STOCK24');
  await page.click('#btnCodeStock');
  await page.waitForTimeout(400);
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  // Parcours strict (02/10/2026) : ENT-1.2 et ENT-1.3 ne s'ouvrent qu'après validation de la séance
  // précédente. Ces cas-ci testent le CONTENU des séances, pas l'ordre (c'est `test-seances.mjs`) :
  // on pose donc, comme le ferait le bouton « Débloquer » de l'enseignant, les deux drapeaux.
  await page.evaluate(() => {
    let uid = localStorage.getItem('prepalog:session');
    try { uid = JSON.parse(uid); } catch (e) { /* déjà une chaîne */ }
    ['spartoo', 'spartoo-tracabilite'].forEach((aid) => {
      localStorage.setItem(`prepalog:travaux/1-log-a/${uid}/_debloque-${aid}`,
        JSON.stringify({ uid, aid: '_debloque-' + aid, gid: '1-log-a', score: 0, max: 0, meilleur: 0, tentatives: 0 }));
    });
  });
  // La rubrique Logisim porte désormais une tuile par SÉANCE de l'entreprise : réception,
  // préparation. On ouvre ici la préparation ; la réception est testée plus bas.
  await page.click('[data-rub="logisim"]');
  await page.click('[data-ent="1"]');          // Logisim est rangé par entreprise : le logo Spartoo
  await page.waitForSelector('[data-act="spartoo"]', { timeout: 6000 });
  await page.click('[data-act="spartoo"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });
  if ((await page.$$eval('.ent-nav', (e) => e.length)) < 8) throw new Error('navigation incomplète');
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('.ent-mitem');
  if ((await page.$$eval('.ent-mitem', (e) => e.length)) !== 2) throw new Error('les 2 messages de la préparation manquent (la bienvenue arrive en ENT-1.1)');
});

// ---------- 26 bis. la trame de la séance se télécharge depuis le bandeau
// Règle révisée le 01/10/2026 : la trame reste le support des consignes, mais le fichier
// est à portée de clic. Un lien de trame qui tombe dans le vide se découvrirait en séance,
// au pire moment — on vérifie donc que les fichiers partent vraiment, pas seulement que
// les liens sont là.
await v('Spartoo : la trame se télécharge depuis le bandeau', async () => {
  // Le bandeau doit aussi nommer la séance en cours : c'est ce que l'enseignant lit
  // en passant dans les rangs. On ne fige pas le libellé, seulement sa présence.
  const seance = (await page.textContent('.ent-bandeau .ent-seance') || '').trim();
  if (seance.length < 3) throw new Error('la séance en cours n\'est pas nommée dans le bandeau');
  const liens = await page.$$eval('.ent-bandeau a[download]', (a) => a.map((x) => x.getAttribute('href')));
  if (liens.length !== 2) throw new Error(`${liens.length} lien(s) de trame au lieu de 2 (PDF et Word)`);
  if (!liens.some((h) => /\.pdf$/.test(h)) || !liens.some((h) => /\.docx$/.test(h))) {
    throw new Error('les deux formats ne sont pas proposés : ' + liens.join(', '));
  }
  for (const h of liens) {
    const rep = await page.request.get(new URL(h, page.url()).toString());
    if (!rep.ok()) throw new Error(`trame introuvable (${rep.status()}) : ${h}`);
    const octets = (await rep.body()).length;
    if (octets < 5000) throw new Error(`trame suspecte (${octets} octets) : ${h}`);
  }
});

// ---------- 26 ter. toute trame déclarée existe dans le dépôt
// Relecture statique, sans navigateur : elle couvre les trois séances d'un coup, y compris
// celles qu'aucun test ne parcourt, et toute séance ajoutée plus tard.
await v('toute trame déclarée existe dans le dépôt', async () => {
  const manquants = [];
  const parcourir = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { if (!['.git', 'node_modules', 'vendor'].includes(e.name)) parcourir(f); continue; }
      if (!/\.js$/.test(e.name)) continue;
      const src = fs.readFileSync(f, 'utf8');
      // Les chemins déclarés sont relatifs à la racine du site : './contenus/trames/…'.
      for (const m of src.matchAll(/(?:pdf|docx):\s*'(\.\/contenus\/trames\/[^']+)'/g)) {
        const cible = path.join(ROOT, m[1].replace(/^\.\//, ''));
        if (!fs.existsSync(cible)) manquants.push(`${path.relative(ROOT, f)} → ${m[1]}`);
      }
    }
  };
  parcourir(path.join(ROOT, 'activites'));
  if (manquants.length) throw new Error('trame déclarée mais absente : ' + manquants.join(', '));
});

// ---------- 26 ter bis. une trame se déclare dans la config du moteur, pas dans `meta`
// Le bandeau lit `trame` dans ce que reçoit `creerEntreprise` ; rangée dans `meta`, elle n'y
// apparaît jamais, sans que rien ne le dise (Picard ENT-4.1 à 4.3, corrigé le 04/10/2026).
await v('une trame déclarée l\'est dans creerEntreprise, jamais dans meta (sinon le bandeau ne la montre pas)', async () => {
  const fautifs = [];
  for (const e of fs.readdirSync(path.join(ROOT, 'activites'))) {
    if (!/\.js$/.test(e)) continue;
    const src = fs.readFileSync(path.join(ROOT, 'activites', e), 'utf8');
    const i = src.indexOf('export const meta');
    if (i < 0) continue;
    const fin = src.indexOf('\n};', i);
    if (/^\s*trame:\s*\{/m.test(src.slice(i, fin))) fautifs.push(e);
  }
  if (fautifs.length) throw new Error('trame rangée dans meta : ' + fautifs.join(', '));
});

// ---------- 26 quater. tout corrigé déclaré existe et reste cohérent
// Statique, comme le test des trames. Un QCM de trame doit avoir trois choix et une bonne
// réponse valide : le générateur Python l'assure, ce test garde le fichier produit.
await v('tout corrigé de trame déclaré existe, couvre toute la trame et est cohérent', async () => {
  const problemes = [];
  let total = 0, qcm = 0;
  for (const e of fs.readdirSync(path.join(ROOT, 'activites'))) {
    if (!/\.js$/.test(e)) continue;
    const src = fs.readFileSync(path.join(ROOT, 'activites', e), 'utf8');
    for (const m of src.matchAll(/corrige:\s*'(\.\/contenus\/corriges\/[^']+)'/g)) {
      const cible = path.join(ROOT, m[1].replace(/^\.\//, ''));
      if (!fs.existsSync(cible)) { problemes.push(`${e} → ${m[1]} absent`); continue; }
      const { CORRIGE } = await import(pathToFileURL(cible).href);
      if (!CORRIGE?.items?.length) problemes.push(`${m[1]} vide`);
      for (const it of CORRIGE.items) {
        total++;
        const nom = `${m[1]} : « ${String(it.texte).slice(0, 40)} »`;
        if (!it.texte || !it.genre) { problemes.push(`${nom} sans texte ni genre`); continue; }
        if (it.genre === 'qcm') {
          qcm++;
          if (it.choix?.length !== 3 || !(it.bonne >= 0 && it.bonne < 3)) problemes.push(`${nom} QCM invalide`);
        } else if (it.genre === 'tableau') {
          if (!it.entetes?.length || !it.reponses?.length || it.reponses.some((l) => l.length !== it.entetes.length)) problemes.push(`${nom} tableau invalide`);
        } else if (it.genre === 'brouillon') {
          if (!it.modele && !it.criteres) problemes.push(`${nom} sans modèle`);
        } else if (!it.rep && !(it.pistes?.length)) {
          problemes.push(`${nom} sans réponse`);
        }
      }
    }
  }
  if (problemes.length) throw new Error(problemes.join(' ; '));
  if (qcm < 14) throw new Error(`seulement ${qcm} QCM corrigés (14 attendus : ils ne doivent pas diminuer)`);
  if (total < 140) throw new Error(`seulement ${total} questions corrigées (au moins 140 attendues : toute la trame doit être couverte)`);
});

const ouvrirMail = async (motif) => {
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('[data-dossier="in"]');
  await page.click('[data-dossier="in"]');
  await page.waitForSelector('.ent-mitem');
  for (const m of await page.$$('.ent-mitem')) {
    if (new RegExp(motif, 'i').test(await m.textContent())) { await m.click(); return; }
  }
  throw new Error('mail introuvable : ' + motif);
};

// ---------- 27. la console interroge la base
await v('Spartoo : la console répond', async () => {
  await page.click('[data-vue="console"]');
  await page.waitForSelector('#champCmd');
  await page.fill('#champCmd', '.getstock AD-STS-BL-44');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Stan Smith/.test(t)) throw new Error('article non trouvé');
  if (!/Stock\s*3\b/.test(t)) throw new Error('stock attendu 3 : ' + (t.match(/Stock\s*\d+/) || ['?'])[0]);
  await page.fill('#champCmd', '.nimportequoi');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Commande inconnue/.test(await page.textContent('.ent-cout'))) throw new Error('commande inconnue non signalée');
});

// ---------- 28. le stock d'ensemble est verrouillé, le code l'ouvre
await v('Spartoo : le stock est verrouillé par un code', async () => {
  await page.click('[data-vue="stock"]');
  await page.waitForSelector('#codeStock');
  await page.fill('#codeStock', 'FAUX');
  await page.click('[data-deverrouiller]');
  await page.waitForTimeout(250);
  if (!/Code incorrect/.test(await page.textContent('.ent-main'))) throw new Error('un code faux a été accepté');
  await page.fill('#codeStock', 'stock24');          // la casse ne doit pas compter
  await page.click('[data-deverrouiller]');
  await page.waitForSelector('#sQ', { timeout: 6000 });
});

// ---------- 29. l'exercice de bout en bout : les trois jalons
await v('Spartoo : exercice complet, trois jalons au vert', async () => {
  // Étape 4 — répondre à Léa avec le stock réel.
  await ouvrirMail('Stan Smith');
  await page.waitForSelector('[data-repondre]');
  await page.click('[data-repondre]');
  await page.fill('#repT', 'Bonjour Madame,\n\nIl nous reste 3 paires en pointure 44.\n\nCordialement');
  await page.click('#formRep button[type=submit]');
  await page.waitForTimeout(500);

  // Étape 5 — traiter la commande. Valeurs attendues : une ligne complète, une partielle,
  // une en rupture. C'est ce qui rend l'exercice intéressant.
  await ouvrirMail('Nouvelle commande');
  await page.click('[data-enreg-cmd]');
  await page.waitForSelector('[data-prep="seen"]');
  const attendu = {
    'NK-AM270-NR-42': { seen: 8, loc: 'B-01-1', qty: 1, status: 'ok' },
    'AD-STS-BL-41': { seen: 1, loc: 'B-04-1', qty: 1, status: 'warn' },
    'PM-SUE-NR-40': { seen: 0, loc: 'B-06-1', qty: 0, status: 'crit' },
  };
  for (const [sku, a] of Object.entries(attendu)) {
    await page.fill(`[data-prep="seen"][data-sku="${sku}"]`, String(a.seen));
    await page.fill(`[data-prep="loc"][data-sku="${sku}"]`, a.loc);
    await page.fill(`[data-prep="qty"][data-sku="${sku}"]`, String(a.qty));
    await page.selectOption(`[data-prep="status"][data-sku="${sku}"]`, a.status);
  }
  await page.waitForSelector('[data-bon]:not([disabled])', { timeout: 6000 });
  await page.click('[data-bon]');
  await page.waitForSelector('[data-valider]');
  await page.click('[data-valider]');
  await page.waitForTimeout(500);
  const t = await page.textContent('.ent-main');
  if (!/Préparation validée/.test(t)) throw new Error('préparation non validée');
  if (!/reliquat/i.test(t)) throw new Error('le reliquat n\'est pas signalé');

  // Le stock a réellement bougé, et le mouvement est tracé.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock NK-AM270-NR-42');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Stock\s*7\b/.test(await page.textContent('.ent-cout'))) throw new Error('le stock n\'est pas descendu à 7');
  await page.fill('#champCmd', '.movements');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Sortie : préparation/.test(await page.textContent('.ent-cout'))) throw new Error('mouvement non journalisé');

  // Étape 6 — réapprovisionner Puma : quantités exactes et minimum de commande atteint.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('[data-nouveau]');
  await page.click('[data-nouveau]');
  await page.waitForSelector('#mTo');
  await page.selectOption('#mTo', 'F003');
  await page.fill('#mTxt', 'Bonjour,\n\nPM-SUE-NR-40 : 12 paires\nPM-SUE-NR-36 : 12 paires\n\nCordialement');
  await page.click('[data-envoyer-fou]');
  await page.waitForTimeout(600);
});

// ---------- 30. le suivi de classe voit l'avancement
await v('Spartoo : avancement remonté au suivi de classe', async () => {
  // L'environnement est immersif : pas de bandeau Prepalog, on en sort par son propre bouton.
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=ENT-1.1', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  if (!/3\/3/.test(t)) throw new Error('avancement attendu 3/3, lu : ' + (t.match(/\d\/3/g) || ['aucun']).join(' '));
});

// ---------- 31. la réception : même base, volet propre à la séance
await v('Spartoo réception : la séance s\'ajoute à la base de l\'élève', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  await page.click('[data-rub="logisim"]');
  await page.click('[data-ent="1"]');          // Logisim est rangé par entreprise : le logo Spartoo
  await page.waitForSelector('[data-act="spartoo-reception"]', { timeout: 6000 });
  await page.click('[data-act="spartoo-reception"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });
  // La base est celle de la préparation (meta.jeuId) : les 3 messages de départ sont
  // toujours là, et les 2 messages de la séance de réception s'y ajoutent.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('.ent-mitem');
  // 3 messages de départ + la réponse de Puma au réapprovisionnement de la séance
  // précédente + les 2 messages de la séance de réception.
  const n = await page.$$eval('.ent-mitem', (e) => e.length);
  if (n !== 6) throw new Error(`${n} messages au lieu de 6 : la base n'est pas partagée, ou le volet n'est pas semé`);
  // Et le travail de la séance précédente est toujours là : le stock a bien été diminué.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock NK-AM270-NR-42');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Stock\s*7\b/.test(await page.textContent('.ent-cout'))) throw new Error('la préparation de la séance précédente a été perdue');
});

// ---------- 32. la réception de bout en bout : contrôle, écart, entrée en stock
await v('Spartoo réception : trois jalons au vert', async () => {
  // Le bon de livraison est dans la messagerie ; la réception s'ouvre depuis le message.
  await ouvrirMail('Bon de livraison');
  await page.waitForSelector('[data-ouvrir-rec]');
  if (!/LOT-PM-2609/.test(await page.textContent('.ent-lecteur'))) throw new Error('le numéro de lot n\'est pas sur le bon de livraison');
  await page.click('[data-ouvrir-rec]');
  await page.waitForSelector('#recLot');
  if (!/Le bon de livraison est dans votre messagerie/.test(await page.textContent('.ent-main .avis'))) throw new Error("l'encadré ne renvoie plus à la messagerie");

  // Ce que l'élève doit trouver : 12 conformes, 6 au lieu de 8, 6 dans un carton abîmé.
  await page.fill('#recLot', 'LOT-PM-2609');
  const attendu = {
    'PM-SUE-RG-39': { annonce: 12, compte: 12, etat: 'ok', decision: 'accepte' },
    'PM-SUE-MA-41': { annonce: 8, compte: 6, etat: 'ok', decision: 'reserve' },
    'PM-RSX-BL-42': { annonce: 6, compte: 6, etat: 'abime', decision: 'reserve' },
  };
  for (const [sku, a] of Object.entries(attendu)) {
    await page.fill(`[data-rec="annonce"][data-sku="${sku}"]`, String(a.annonce));
    await page.fill(`[data-rec="compte"][data-sku="${sku}"]`, String(a.compte));
    await page.selectOption(`[data-rec="etat"][data-sku="${sku}"]`, a.etat);
    await page.selectOption(`[data-rec="decision"][data-sku="${sku}"]`, a.decision);
  }
  await page.waitForSelector('[data-valider-rec]:not([disabled])', { timeout: 6000 });
  await page.click('[data-valider-rec]');
  await page.waitForTimeout(500);
  if (!/Réception validée/.test(await page.textContent('.ent-main'))) throw new Error('réception non validée');

  // Le lot est entré en stock, et il se remonte d'un bout à l'autre.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Entrées\s*24\b/.test(t)) throw new Error('24 paires attendues au lot, lu : ' + (t.match(/Entrées\s*\d+/) || ['?'])[0]);
  if (!/Puma/.test(t)) throw new Error('le fournisseur du lot n\'est pas retrouvé');

  // Les réserves partent chez le fournisseur.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('[data-nouveau]');
  await page.click('[data-nouveau]');
  await page.waitForSelector('#mTo');
  await page.selectOption('#mTo', 'F003');
  await page.fill('#mObj', 'Réserves sur le lot LOT-PM-2609');
  await page.fill('#mTxt', 'Bonjour,\n\nRéserves sur la livraison BL-77421, lot LOT-PM-2609 :\n- PM-SUE-MA-41 : il manque 2 paires sur les 8 annoncées\n- PM-RSX-BL-42 : carton endommagé à la livraison\n\nCordialement');
  await page.click('[data-envoyer-fou]');
  await page.waitForTimeout(600);
});

// ---------- 33. l'avancement de la réception remonte, à côté de celui de la préparation
await v('Spartoo réception : avancement remonté au suivi', async () => {
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=ENT-1.2', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  // Deux séances, deux avancements distincts : c'est tout l'intérêt d'une activité par séance.
  const av = (t.match(/3\/3/g) || []).length;
  if (av < 2) throw new Error('deux avancements 3/3 attendus (réception et préparation), lu : ' + av);
});

// ---------- 34. la traçabilité : l'aval est semé, le lot se remonte dans les deux sens
// La date d'entrée du lot est lue dans la remontée, jamais écrite d'avance : c'est celle de
// la base de l'élève, donc celle du jour où il a réceptionné.
const dateDuLot = (texte) => (texte.match(/Entré le\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1] || '';
await v('Spartoo traçabilité : l\'aval est semé et le lot se remonte', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  await page.click('[data-rub="logisim"]');
  await page.click('[data-ent="1"]');          // Logisim est rangé par entreprise : le logo Spartoo
  await page.waitForSelector('[data-act="spartoo-tracabilite"]', { timeout: 6000 });
  await page.click('[data-act="spartoo-tracabilite"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });

  // Même base que les deux séances précédentes : 6 messages, plus les 2 de la traçabilité.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('.ent-mitem');
  // 6 messages à l'issue de la réception, plus la réponse de Puma aux réserves, plus les
  // 2 messages de la traçabilité.
  const n = await page.$$eval('.ent-mitem', (e) => e.length);
  if (n !== 9) throw new Error(`${n} messages au lieu de 9 : la base n'est pas partagée, ou le volet n'est pas semé`);

  // La commande de la séance 2 ne touchait aucune référence du lot : sans les trois
  // commandes semées ici, il n'y aurait personne à retrouver.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Entrées\s*24\b/.test(t)) throw new Error('24 paires attendues au lot, lu : ' + (t.match(/Entrées\s*\d+/) || ['?'])[0]);
  if (!/Sorties\s*6\b/.test(t)) throw new Error('6 paires sorties attendues, lu : ' + (t.match(/Sorties\s*\d+/) || ['?'])[0]);
  if (!/Reste en stock\s*18\b/.test(t)) throw new Error('18 paires attendues en reste, lu : ' + (t.match(/Reste en stock\s*\d+/) || ['?'])[0]);
  for (const no of ['CMD-048301', 'CMD-048307', 'CMD-048312']) {
    if (!t.includes(no)) throw new Error('commande absente de la remontée du lot : ' + no);
  }
  if (!/Simon|Bernard|Fournier/.test(t)) throw new Error('les clients livrés ne remontent pas');
  // La date d'entrée du lot est celle de la base de l'élève, pas une date écrite d'avance :
  // c'est elle qu'il devra recopier dans son compte rendu.
  if (!dateDuLot(t)) throw new Error('la date d\'entrée du lot ne s\'affiche pas');
});

// ---------- 35. le blocage qualité ne sort que du lot, et ne souffle pas la réponse
await v('Blocage qualité : le lot seul est touché, sans réponse soufflée', async () => {
  await page.click('[data-vue="blocage"]');
  await page.waitForSelector('#blLot');
  // Le stock total de la référence est bien plus élevé que ce qu'il reste du lot : c'est
  // exactement le piège que .removestock (premier entré, premier sorti) ne saurait éviter.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock PM-SUE-RG-39');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  const avant = Number((await page.textContent('.ent-cout')).match(/Stock\s*(\d+)/g).pop().match(/\d+/)[0]);
  if (avant !== 26) throw new Error('stock de départ attendu 26 (17 + 12 reçues − 3 vendues), lu : ' + avant);

  // Une quantité trop grande est refusée, et le message ne dit pas combien il en reste.
  await page.click('[data-vue="blocage"]');
  await page.waitForSelector('#blLot');
  await page.fill('#blLot', 'LOT-PM-2609');
  await page.fill('#blRef', 'PM-SUE-RG-39');
  await page.fill('#blQte', '99');
  await page.fill('#blMotif', 'blocage qualité, défaut fabricant');
  await page.click('#formBloc button[type=submit]');
  await page.waitForTimeout(300);
  const err = await page.textContent('.ent-main');
  if (!/ne contient pas autant/.test(err)) throw new Error('une quantité supérieure au lot a été acceptée');
  if (/\b9\b/.test(err.split('Blocages enregistrés')[0].replace(/LOT-PM-2609|PM-SUE-RG-39|99/g, ''))) {
    throw new Error('le message d\'erreur souffle la quantité restante');
  }

  // Le bon compte : 9 paires de ce lot, et pas une de plus.
  await page.fill('#blQte', '9');
  await page.click('#formBloc button[type=submit]');
  await page.waitForTimeout(400);
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock PM-SUE-RG-39');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  const apres = Number((await page.textContent('.ent-cout')).match(/Stock\s*(\d+)/g).pop().match(/\d+/)[0]);
  if (apres !== 17) throw new Error('stock attendu 17 après blocage des 9 paires du lot, lu : ' + apres);
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  if (!/Reste en stock\s*9\b/.test(await page.textContent('.ent-cout'))) throw new Error('le reste du lot n\'est pas tombé à 9');
});

// ---------- 36. la traçabilité de bout en bout : les trois jalons
await v('Spartoo traçabilité : trois jalons au vert', async () => {
  // Les deux références qui restent : 5 et 4 paires du lot.
  await page.click('[data-vue="blocage"]');
  await page.waitForSelector('#blLot');
  for (const [ref, q] of [['PM-SUE-MA-41', '5'], ['PM-RSX-BL-42', '4']]) {
    await page.fill('#blLot', 'LOT-PM-2609');
    await page.fill('#blRef', ref);
    await page.fill('#blQte', q);
    await page.fill('#blMotif', 'blocage qualité, défaut fabricant');
    await page.click('#formBloc button[type=submit]');
    await page.waitForTimeout(350);
  }
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Reste en stock\s*0\b/.test(t)) throw new Error('le lot n\'est pas entièrement bloqué');
  if (!/Blocage qualité/.test(t)) throw new Error('le mouvement de blocage n\'apparaît pas dans la remontée du lot');
  const dateEntreeLot = dateDuLot(t);
  if (!dateEntreeLot) throw new Error('la date d\'entrée du lot est introuvable');

  // Le compte rendu à M. Morin, en répondant à son message.
  await ouvrirMail('traçabilité et blocage');
  await page.waitForSelector('[data-repondre]');
  await page.click('[data-repondre]');
  await page.fill('#repT', `Bonjour,\n\nLot LOT-PM-2609, entré en stock le ${dateEntreeLot}, fournisseur Puma.\n\n`
    + 'Commandes déjà livrées avec des paires de ce lot :\n'
    + '- CMD-048301\n- CMD-048307\n- CMD-048312\n\n'
    + 'Stock restant bloqué : 9 PM-SUE-RG-39, 5 PM-SUE-MA-41, 4 PM-RSX-BL-42.\n\nCordialement');
  await page.click('#formRep button[type=submit]');
  await page.waitForTimeout(600);
});

// ---------- 37. trois avancements côte à côte dans le suivi
await v('Spartoo traçabilité : avancement remonté au suivi', async () => {
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=ENT-1.3', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  // Trois séances, trois avancements distincts, sur une seule et même base.
  const av = (t.match(/3\/3/g) || []).length;
  if (av < 3) throw new Error('trois avancements 3/3 attendus, lu : ' + av);
});

// ---------- 38. la traçabilité sans les séances précédentes : l'amont est posé
await v('Spartoo traçabilité : jouable sans les deux séances précédentes', async () => {
  // Noé n'a fait ni la réception ni la préparation : sans amorçage, il n'aurait ni lot ni
  // sortie à remonter. La séance lui pose la réception d'un collègue.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2602'); await page.fill('#code', 'bbb2');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  // Séance fermée à qui n'a pas validé la 1.2 : l'enseignant la débloque (voir test-seances.mjs).
  await page.evaluate(() => {
    let uid = localStorage.getItem('prepalog:session');
    try { uid = JSON.parse(uid); } catch (e) { /* déjà une chaîne */ }
    localStorage.setItem(`prepalog:travaux/1-log-a/${uid}/_debloque-spartoo-tracabilite`,
      JSON.stringify({ uid, aid: '_debloque-spartoo-tracabilite', gid: '1-log-a', score: 0, max: 0, meilleur: 0, tentatives: 0 }));
  });
  await page.click('[data-rub="logisim"]');
  await page.click('[data-ent="1"]');          // Logisim est rangé par entreprise : le logo Spartoo
  await page.waitForSelector('[data-act="spartoo-tracabilite"]', { timeout: 6000 });
  await page.click('[data-act="spartoo-tracabilite"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Entrées\s*24\b/.test(t)) throw new Error('le lot n\'a pas été posé : ' + (t.match(/Entrées\s*\d+/) || ['rien'])[0]);
  if (!/Sorties\s*6\b/.test(t)) throw new Error('les sorties du lot manquent');
  if (!/CMD-048301/.test(t)) throw new Error('les commandes livrées ne remontent pas');
  // Et la réception posée porte son propre numéro : celle de la séance 1 reste disponible.
  if (!/REC-04118/.test(t)) throw new Error('la réception du collègue n\'est pas celle attendue');
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
});

}
