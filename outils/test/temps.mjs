// Suite de tests de Prepalog — bloc « temps » : le temps passé dans une séance d'entreprise remonte à
// l'enseignant toutes les 2 minutes (brief `docs/briefs/MOTEUR-temps-passe.md`, 06/10/2026).
// `node outils/test.mjs temps` ne lance que ce bloc ; il n'a besoin d'aucun autre.
//
// Ce que ces cas gardent :
//   - un élève qui ouvre la séance et ne touche à rien : l'enseignant lit quand même le vrai temps,
//     sans que le compteur de tentatives bouge (l'envoi ne passe pas par `ecrireScore`) ;
//   - résultat pas encore créé : le premier envoi le crée (une tentative, une seule fois) ;
//   - onglet caché : ni temps compté, ni écriture ;
//   - fermeture de l'onglet sans « Quitter » : à la réouverture, le temps repart de la dernière valeur
//     envoyée (le jeu privé est sauvé avec l'envoi) et ne redescend jamais ;
//   - évaluation (copie) et compte enseignant : aucun envoi.
//
// Horloge simulée : `clock.install()` avant d'ouvrir la séance (la minuterie est posée à l'ouverture),
// puis `runFor` avance le temps d'un coup.

export default async function bloc({ v, nav, BASE }) {

const ctxT = await nav.newContext({ viewport: { width: 1366, height: 900 } });
const pg = await ctxT.newPage();
pg.setDefaultTimeout(6000);
const erreursT = [];
pg.on('pageerror', (e) => erreursT.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursT.push('CONSOLE: ' + m.text()); });
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const SEANCE = 'boost-ent33';   // prête, sans niveau, sans ouverture par l'enseignant, notée par étapes
const MAT = '4951';
let uid = null;

// Le résultat lu par l'enseignant et le jeu privé de l'élève (base partagée de Boost).
const lire = () => pg.evaluate(({ uid, aid }) => {
  const l = (x) => (x ? JSON.parse(localStorage.getItem(x)) : null);
  const t = l(Object.keys(localStorage).find((x) => x.startsWith('prepalog:travaux/') && x.endsWith(`/${uid}/${aid}`)));
  const p = l(`prepalog:prive/${uid}/boost`);
  return {
    travaux: t,
    tentatives: t ? t.tentatives : 0,
    temps: t?.detail?.indicateurs?.[aid]?.temps ?? null,
    prive: p?.data?.indicateurs?.[aid]?.temps ?? null,
  };
}, { uid, aid: SEANCE });

const ouvrir = async () => {
  if (await pg.$('#btnAccueil')) await pg.click('#btnAccueil');
  await pg.click('[data-rub="simulog"]');
  await pg.click('[data-ent="3"]');
  await pg.click(`[data-act="${SEANCE}"]`);
  await pg.waitForSelector('.ent-nav');
};
const cacher = (oui) => pg.evaluate((oui) => {
  if (oui) Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
  else delete document.visibilityState;
}, oui);

await v('temps : préparation (un groupe, un élève)', async () => {
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
  await pg.click('#btnProfEspace');
  await pg.waitForSelector('#gNom');
  await pg.fill('#gNom', 'TPS 1');
  await pg.click('#btnCreerG');
  await pg.waitForSelector('text=TPS 1');
  await pg.click('[data-ong="comptes"]');
  await pg.waitForSelector('#lot');
  await pg.fill('#lot', `TEMPS ; Élève ; ${MAT} ; tp01`);
  await pg.click('#btnLot');
  await pg.waitForSelector('[data-tiers]');
  uid = await pg.evaluate((m) => {
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    return Object.keys(u).find((k) => u[k].matricule === m) || null;
  }, MAT);
  if (!uid) throw new Error('élève introuvable');
  if (await pg.$('#btnAccueil')) await pg.click('#btnAccueil');
  if (await pg.$('#btnRetour')) await pg.click('#btnRetour');
  await pg.click('#btnDeco');
  await pg.waitForSelector('#mat');
  await pg.fill('#mat', MAT);
  await pg.fill('#code', 'tp01');
  await pg.click('#btnEleve');
  await pg.waitForSelector('text=Bonjour');
});

let tentatives0 = 0;
await v('temps : séance ouverte sans aucun geste — au bout de 2 min, l’enseignant lit le temps (une seule tentative)', async () => {
  await pg.clock.install();
  await ouvrir();
  await pg.clock.runFor(1000);
  const a = await lire();
  await pg.clock.runFor(130000);
  await pg.waitForTimeout(200);
  const b = await lire();
  if (!(b.temps >= 115)) throw new Error(`temps lu par l’enseignant après 2 min 10 : ${b.temps} (à l’ouverture : ${JSON.stringify(a.temps)})`);
  // Résultat absent à l'ouverture : il est créé une fois (une tentative). Déjà présent : rien de plus.
  if (b.tentatives !== Math.max(a.tentatives, 1)) throw new Error(`tentatives : ${a.tentatives} → ${b.tentatives}`);
  tentatives0 = b.tentatives;
});

await v('temps : 5 min de plus sans geste — le temps avance d’au moins 4 min, les tentatives ne bougent pas', async () => {
  const a = await lire();
  await pg.clock.runFor(300000);
  await pg.waitForTimeout(200);
  const b = await lire();
  if (!(b.temps - a.temps >= 240)) throw new Error(`temps : ${a.temps} → ${b.temps}`);
  if (b.tentatives !== tentatives0) throw new Error(`tentatives : ${tentatives0} → ${b.tentatives} (l’envoi du temps compte une tentative)`);
  // Le jeu privé est sauvé avec l'envoi : il porte au moins le temps envoyé.
  if (!(b.prive >= b.temps)) throw new Error(`jeu privé ${b.prive} < temps envoyé ${b.temps}`);
});

await v('temps : onglet caché 5 min — temps arrêté, aucune écriture', async () => {
  const a = await lire();
  await cacher(true);
  try {
    await pg.clock.runFor(300000);
    await pg.waitForTimeout(200);
  } finally { await cacher(false); }
  const b = await lire();
  if (JSON.stringify(b.travaux) !== JSON.stringify(a.travaux)) throw new Error(`résultat réécrit onglet caché : ${a.temps} → ${b.temps}`);
  if (b.prive !== a.prive) throw new Error(`jeu privé : ${a.prive} → ${b.prive}`);
});

await v('temps : onglet fermé sans « Quitter » puis rouvert — le temps repart de la valeur envoyée, sans redescendre', async () => {
  // Avancer jusqu'au prochain envoi, puis 1 min 30 sans envoi (perdues à la fermeture, c'est admis).
  const avant = (await lire()).temps;
  let envoye = avant;
  for (let i = 0; i < 30 && envoye === avant; i++) {
    await pg.clock.runFor(5000);
    await pg.waitForTimeout(30);
    envoye = (await lire()).temps;
  }
  if (envoye === avant) throw new Error('aucun envoi en 2 min 30');
  await pg.clock.runFor(90000);
  // Fermer l'onglet = recharger la page (aucune sauvegarde à la fermeture, voulu).
  await pg.reload();
  await pg.waitForSelector('text=Bonjour');
  const a = await lire();
  if (a.temps !== envoye) throw new Error(`temps lu après fermeture : ${a.temps} (envoyé : ${envoye})`);
  if (!(a.prive >= envoye)) throw new Error(`jeu privé ${a.prive} < temps envoyé ${envoye} : la réouverture repartirait plus bas`);
  await ouvrir();
  const suivis = [];
  for (let i = 0; i < 3; i++) {
    await pg.clock.runFor(60000);
    await pg.waitForTimeout(100);
    suivis.push((await lire()).temps);
  }
  if (suivis.some((t) => !(t >= envoye))) throw new Error(`le temps redescend : ${envoye} → ${suivis.join(', ')}`);
  if (!(suivis[2] >= envoye + 115)) throw new Error(`temps après 3 min rouvert : ${suivis[2]} (envoyé avant : ${envoye})`);
});

// Banc d'essai (moteur seul, contexte simulé) : l'envoi est-il demandé ?
const monter = (o = {}) => pg.evaluate(async (o) => {
  document.getElementById('tp-hote')?.remove();
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-2de.js');
  const db = {};
  const S = window.__tp = { envois: [], enregistrer: 0 };
  const moteur = creerEntreprise({ ...E.univers({}), ...(o.copie ? { copie: true } : {}) });
  const hote = document.createElement('div'); hote.id = 'tp-hote'; document.body.appendChild(hote);
  moteur.rendre(hote, {
    meta: { id: 'essai-tp', code: 'ESSAI', titre: 'Essai temps', portee: 'eleve', immersif: true, ...(o.copie ? { copie: true } : {}) },
    profil: { prenom: 'Lea', nom: 'T', role: o.prof ? 'prof' : 'eleve', uid: 'u-tp' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => { S.enregistrer++; },
    enregistrerTemps: async (s) => { S.envois.push(s); return true; },
    lireScore: async () => null, rendreCopie: async () => ({}), quitter: () => {}, codeStock: '',
  });
}, o);
const envois = () => pg.evaluate(() => window.__tp.envois.slice());

await v('temps (banc) : un élève en entraînement envoie son temps toutes les 2 min (témoin du banc)', async () => {
  if (await pg.$('#btnAccueil')) await pg.click('#btnAccueil');
  await monter();
  await pg.clock.runFor(300000);
  const e = await envois();
  if (e.length !== 2 || !(e[0] >= 115 && e[0] <= 130) || !(e[1] - e[0] >= 115)) throw new Error('envois : ' + JSON.stringify(e));
});

await v('temps (banc) : en évaluation (copie), aucun envoi pendant le travail', async () => {
  await monter({ copie: true });
  await pg.clock.runFor(300000);
  const e = await envois();
  if (e.length) throw new Error('envois en évaluation : ' + JSON.stringify(e));
});

await v('temps (banc) : chez l’enseignant, aucun envoi', async () => {
  await monter({ prof: true });
  await pg.clock.runFor(300000);
  const e = await envois();
  if (e.length) throw new Error('envois chez l’enseignant : ' + JSON.stringify(e));
  await pg.evaluate(() => document.getElementById('tp-hote')?.remove());
});

await v('temps : aucune erreur dans la console', async () => {
  if (erreursT.length) throw new Error(erreursT.slice(0, 5).join(' | '));
});

await ctxT.close();
}
