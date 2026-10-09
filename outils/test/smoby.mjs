// Suite de tests de Prepalog — bloc « smoby » : les briques de la 2de (brief
// `docs/briefs/MOTEUR-2de-S1.md`), sur l'univers d'essai `outils/essai-2de.js`.
//
// `node outils/test.mjs smoby` ne lance que ce bloc. Il monte l'environnement d'entreprise à la main,
// dans un contexte de navigateur à lui.
// Lots 4 et 5 : quai sans froid, chariot, étape « Avant de décharger » (`monter({ quai })`).
// Lot 2 (04/10/2026) : la réponse par phrases à choisir (`core/phrases.js`). Les phrases justes sont
// écrites À LA MAIN ici (jamais relues dans le contenu).

export default async function bloc({ v, nav, page, BASE, egal, vrai }) {

// Envoi définitif : la confirmation dans la page (06/10/2026, Smoby C2 / ENT-1.1 §7.11) n'apparaît que s'il ne
// manque rien ; on y répond « Oui ». Un envoi refusé (« Il manque… ») n'en montre pas : on continue.
const cliquerEtConfirmer = async (p, sel) => {
  await p.click(sel);
  const b = await p.waitForSelector('[data-confirme-oui]', { timeout: 1500 }).catch(() => null);
  if (b) await b.click();
};

const proche = (a, b, quoi) => { if (!Array.isArray(a) || Math.abs(a[0] - b) > 0.01 || a[1] !== 20) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de [${b}, 20]`); };

const ctxS = await nav.newContext({ viewport: { width: 1366, height: 1000 } });
const erreursS = [];
const pg = await ctxS.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreursS.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursS.push('CONSOLE: ' + m.text()); });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// Monte l'environnement. `garder` : la base est rangée dans le stockage du navigateur à chaque
// sauvegarde (remonter = la retrouver, comme une réouverture). `uid` : l'élève (graine des tirages).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-2de.js');
  document.querySelector('#smTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'smTest'; document.body.appendChild(hote);
  const CLE = 'essai-2de-base-' + (o.uid || 'u-lea');
  const db = o.garder ? JSON.parse(localStorage.getItem(CLE) || '{}') : {};
  const moteur = creerEntreprise(E.univers({ quai: o.quai || null }));
  window.__s = { db, quaiOpts: o.quai || null };
  moteur.rendre(hote, {
    meta: { id: 'essai-2de', code: 'ESSAI', titre: 'Essai 2de', portee: 'eleve', immersif: true, temps: 'guidage', reinitialisable: true,
      ...(o.quai && o.quai.evaluation ? { copie: true } : {}) },
    profil: { prenom: o.prenom || 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-lea' },
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: (res) => { window.__s.enreg = JSON.parse(JSON.stringify(res)); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  // En évaluation, le menu n'arrive qu'une fois la copie lue (`lireScore`) : le test va lui-même au quai.
  document.querySelector('#smTest .ent-nav[data-vue="mail"]')?.click();
}, o);

const Z = '#smTest .ent-main';
const JUSTES = {
  salut: 'Bonjour Sophie,',
  choix: 'Je retiens la candidature de Yanis Morel',
  raison: 'car il a le CACES 3 valide, il est disponible le 9 décembre et il accepte un CDD.',
  contrat: 'Je propose un CDD saisonnier.',
  fin: 'Pouvez-vous valider ? Cordialement,',
};
const LIGNES = ['salut', 'choix', 'raison', 'contrat', 'fin'];

// Ouvre le mail de Sophie (le seul reçu au départ) et son formulaire de réponse.
async function ouvrirReponse() {
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("Le cariste pour le pic de Noël")`);
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
}
const choisir = (ligne, texte) => pg.selectOption(`${Z} [data-phrase="${ligne}"]`, { label: texte });
const ordreAffiche = () => pg.$$eval(`${Z} [data-phrase]`, (S) => S.map((s) => [...s.options].slice(1).map((o) => o.textContent)));
const envoyer = () => cliquerEtConfirmer(pg, `${Z} #formPhr button[type="submit"]`);
const juge = (id = 'reponse-sophie') => pg.evaluate(async (id) => {
  const { phrasesJustes } = await import('/core/phrases.js');
  return phrasesJustes(window.__s.db, id);
}, id);
const etape = () => pg.evaluate(async () => {
  const E = await import('/outils/essai-2de.js');
  return E.ETAPES[0].verifier(window.__s.db).status;
});
const envoyes = () => pg.evaluate(() => window.__s.db.mails.filter((m) => m.folder === 'out')
  .map((m) => ({ to: m.toMail, text: m.text, phrases: m.phrases })));
const recus = () => pg.evaluate(() => window.__s.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));

await v('Phrases : « Répondre » ouvre une liste par ligne, avec tous les choix, sans juger avant l’envoi', async () => {
  await monter();
  await ouvrirReponse();
  const o = await ordreAffiche();
  egal(o.length, 5, 'nombre de listes');
  egal(o.map((x) => x.length), [3, 5, 3, 2, 3], 'nombre de choix par ligne');
  vrai(o[0].includes(JUSTES.salut) && o[2].includes(JUSTES.raison), 'une phrase juste manque dans sa liste');
  vrai(!(await pg.$(`${Z} textarea#repT`)), 'le champ de texte libre est encore là');
  // Rien n'est corrigé ni marqué avant l'envoi.
  await choisir('salut', 'Salut !');
  vrai(!(await pg.$(`${Z} #formPhr .faux, ${Z} #formPhr .juste`)), 'une marque juste/faux apparaît avant l’envoi');
});

// Envoi définitif (06/10/2026, Smoby C2) : une confirmation dans la page ; « Non » n'envoie rien.
await v('Phrases : l’envoi demande confirmation dans la page, « Non » n’envoie rien', async () => {
  await monter();
  await ouvrirReponse();
  for (const l of LIGNES) await choisir(l, JUSTES[l]);
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pg.waitForSelector(`${Z} [data-confirme]`);
  vrai(/Tu envoies ta réponse à .+\? Tu ne pourras plus la modifier\./.test(await pg.textContent(`${Z} [data-confirme]`)), 'texte de la confirmation');
  await pg.click(`${Z} [data-confirme-non]`);
  egal((await envoyes()).length, 0, 'messages envoyés après « Non »');
  await envoyer();
  egal((await envoyes()).length, 1, 'messages envoyés après « Oui »');
});

await v('Phrases : l’aperçu se compose ligne à ligne et le focus reste dans la liste', async () => {
  await monter();
  await ouvrirReponse();
  await choisir('salut', JUSTES.salut);
  // Pas de redessin à chaque choix : la liste reste le même élément, et garde le focus.
  await pg.$eval(`${Z} [data-phrase="contrat"]`, (s) => { s.__marque = true; s.focus(); });
  await choisir('contrat', JUSTES.contrat);
  const ap = (await pg.innerText(`${Z} [data-phr-apercu]`)).split('\n').map((x) => x.trim());
  egal(ap, [JUSTES.salut, '…', '…', JUSTES.contrat, '…'], 'aperçu');
  const focus = await pg.evaluate(() => document.activeElement && document.activeElement.dataset.phrase);
  egal(focus, 'contrat', 'élément qui a le focus');
  vrai(await pg.$eval(`${Z} [data-phrase="contrat"]`, (s) => s.__marque === true), 'la liste a été redessinée');
});

await v('Phrases : un message incomplet ne part pas (aucun mail envoyé, aucun jalon)', async () => {
  await monter();
  await ouvrirReponse();
  for (const l of LIGNES.slice(0, 4)) await choisir(l, JUSTES[l]);
  await envoyer();
  egal((await envoyes()).length, 0, 'mails envoyés');
  egal(await etape(), 'attente', 'étape');
  vrai(await pg.isVisible(`${Z} #formPhr`), 'le formulaire s’est refermé : les choix sont perdus');
});

await v('Phrases : rien d’envoyé = toutes les lignes fausses, l’étape n’est pas réussie (aucun jalon par inaction)', async () => {
  await monter();
  const r = await juge();
  egal(r, { envoye: false, justes: [], faux: LIGNES, envois: 0, premierCoup: false }, 'phrasesJustes');
  vrai((await etape()) !== 'ok', 'étape réussie sans rien faire');
});

await v('Phrases : message juste → mail envoyé ordinaire (texte, destinataire), choix gardés, jalon vrai, Sophie répond', async () => {
  await monter();
  await ouvrirReponse();
  for (const l of LIGNES) await choisir(l, JUSTES[l]);
  await envoyer();
  const E = await envoyes();
  egal(E.length, 1, 'mails envoyés');
  egal(E[0].to, 'sophie.martin@smoby-essai.example', 'destinataire');
  egal(E[0].text, LIGNES.map((l) => JUSTES[l]).join('\n'), 'texte du message');
  // Numéros dans l'ordre DÉCLARÉ (la phrase juste est la 1re déclarée partout dans l'essai).
  egal(E[0].phrases, { id: 'reponse-sophie', choix: { salut: 0, choix: 0, raison: 0, contrat: 0, fin: 0 } }, 'choix gardés');
  egal(await juge(), { envoye: true, justes: LIGNES, faux: [], envois: 1, premierCoup: true }, 'phrasesJustes');
  egal(await etape(), 'ok', 'étape');
  vrai((await recus()).includes('RE : Le cariste pour le pic de Noël'), 'la réponse de Sophie (apresMail) n’est pas arrivée');
  vrai(await pg.isVisible(`${Z} [data-dossier="out"].btn-p`), 'l’élève n’est pas ramené aux Envoyés');
});

await v('Phrases : une ligne fausse → le jalon la nomme, Sophie répond quand même (juste ou faux)', async () => {
  await monter();
  await ouvrirReponse();
  for (const l of LIGNES) await choisir(l, l === 'raison' ? 'car il a le CACES.' : JUSTES[l]);
  await envoyer();
  const r = await juge();
  egal([r.justes, r.faux, r.premierCoup], [['salut', 'choix', 'contrat', 'fin'], ['raison'], false], 'phrasesJustes');
  egal(await etape(), 'ko', 'étape');
  egal((await envoyes())[0].phrases.choix.raison, 2, 'numéro déclaré de la phrase choisie');
  vrai((await recus()).includes('RE : Le cariste pour le pic de Noël'), 'Sophie ne répond qu’à un message juste : elle révèle la correction');
});

await v('Phrases : l’élève qui se corrige est lu sur son dernier envoi, sans réussite du premier coup', async () => {
  await monter();
  await ouvrirReponse();
  for (const l of LIGNES) await choisir(l, l === 'choix' ? 'Je retiens la candidature de Tom Leroy' : JUSTES[l]);
  await envoyer();
  egal((await juge()).faux, ['choix'], 'faux au 1er envoi');
  await ouvrirReponse();
  // Le formulaire repart vide après un envoi.
  egal(await pg.$eval(`${Z} [data-phrase="salut"]`, (s) => s.value), '', 'valeur de la 1re liste au 2e envoi');
  for (const l of LIGNES) await choisir(l, JUSTES[l]);
  await envoyer();
  const r = await juge();
  egal([r.envois, r.faux, r.premierCoup], [2, [], false], 'phrasesJustes après correction');
  // Sophie ne répond qu'une fois.
  egal((await recus()).filter((s) => s.startsWith('RE :')).length, 1, 'réponses de Sophie');
});

await v('Phrases : l’ordre des choix est tiré par élève et ne bouge pas d’une ouverture à l’autre', async () => {
  await pg.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('essai-2de-base-')).forEach((k) => localStorage.removeItem(k)));
  await monter({ garder: true, uid: 'u-lea' });
  await ouvrirReponse();
  const lea1 = await ordreAffiche();
  await monter({ garder: true, uid: 'u-lea' });
  await ouvrirReponse();
  egal(await ordreAffiche(), lea1, 'ordre de Léa à la réouverture');
  // Huit autres élèves : au moins un ordre différent, et la phrase juste n'est pas toujours la 1re.
  const ordres = [lea1];
  for (let i = 0; i < 8; i++) {
    await monter({ uid: 'u-eleve-' + i, prenom: 'Eleve' + i });
    await ouvrirReponse();
    ordres.push(await ordreAffiche());
  }
  vrai(new Set(ordres.map((o) => JSON.stringify(o))).size > 1, 'tous les élèves ont le même ordre');
  const justeEnTete = ordres.every((o) => o[0][0] === JUSTES.salut && o[2][0] === JUSTES.raison);
  vrai(!justeEnTete, 'la phrase juste est toujours la première');
});

await v('Phrases : ligne imposée (texte) dans le message, jamais jugée ; valeurs calculées ; `melanger: false` garde l’ordre', async () => {
  const r = await pg.evaluate(async () => {
    const P = await import('/core/phrases.js');
    const db = { stock: { A: 12 }, mails: [] };
    const m = P.preparerPhrases({ folder: 'in', subject: 'x', phrases: { id: 'p', melanger: false, lignes: [
      { id: 'a', choix: ['Bonjour,', 'Salut'], juste: 0 },
      { id: 'b', texte: 'J’ai reçu les 4 palettes.' },
      { id: 'c', choix: (d) => [`${d.stock.A + 1} cartons`, `${d.stock.A} cartons`], juste: (d) => (d.stock.A === 12 ? 1 : 0) },
    ] } }, db, 'g');
    db.mails.push(m, { folder: 'out', ts: 1, phrases: { id: 'p', choix: { a: 0, c: 1 } } });
    return { lignes: m.phrases.lignes, texte: P.texteCompose(m.phrases, { a: 0, c: 1 }), juge: P.phrasesJustes(db, 'p'),
      json: JSON.stringify(m.phrases) === JSON.stringify(JSON.parse(JSON.stringify(m.phrases))) };
  });
  egal(r.lignes[2].choix, ['13 cartons', '12 cartons'], 'choix calculés');
  egal(r.lignes[2].juste, 1, 'juste calculé');
  egal(r.lignes[0].ordre, [0, 1], 'ordre non mélangé');
  egal(r.texte, 'Bonjour,\nJ’ai reçu les 4 palettes.\n12 cartons', 'texte composé');
  egal([r.juge.justes, r.juge.faux], [['a', 'c'], []], 'la ligne imposée est jugée');
  vrai(r.json, 'le mail préparé garde une fonction (il ne survivrait pas à la sauvegarde)');
});

// ── Lot 3 : les mots cliquables (`core/lexique.js`) ─────────────────────────────────────────────
const ouvrirSophie = async () => {
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("Le cariste pour le pic de Noël")`);
  await pg.waitForSelector(`${Z} .ent-lecteur .lex-mot`);
};
const corps = () => pg.$eval(`${Z} .ent-lecteur`, (l) => ({
  mots: [...l.querySelectorAll('.lex-mot')].map((b) => [b.textContent, b.dataset.lex]),
  texte: l.textContent.replace(/\s+/g, ' '),
}));
const reperage = () => pg.evaluate(() => JSON.parse(JSON.stringify((window.__s.db.indicateurs || {})['essai-2de'] || null)));
const bulleOuverte = () => pg.$$eval(`${Z} .lex-bulle:not([hidden])`, (L) => L.map((b) => b.textContent));

await v('Mots : les mots du lexique deviennent des boutons, un mot absent reste du texte, plus aucun crochet', async () => {
  await monter();
  await ouvrirSophie();
  const c = await corps();
  egal(c.mots, [['cariste', 'cariste'], ['CACES', 'CACES'], ['CDD', 'CDD'], ['saisonnier', 'saisonnier'], ['CDI', 'CDI']], 'mots cliquables');
  vrai(c.texte.includes('voir la fiche de poste)'), 'le mot absent du lexique n’est pas affiché en texte normal');
  vrai(!c.texte.includes('[[') && !c.texte.includes(']]'), 'des crochets restent à l’écran');
  egal(await bulleOuverte(), [], 'bulles ouvertes au départ');
  // Après un redessin (changer de dossier et revenir), les mots sont toujours cliquables.
  await pg.click(`${Z} [data-dossier="out"]`);
  await ouvrirSophie();
  egal((await corps()).mots.length, 5, 'mots cliquables après un redessin');
});

await v('Mots : un clic ouvre la définition en une bulle, un autre mot la remplace, Échap ferme et rend le focus', async () => {
  await monter();
  await ouvrirSophie();
  await pg.click(`${Z} .lex-mot[data-lex="CACES"]`);
  egal(await bulleOuverte(), ['CACES : Certificat qui prouve qu’on sait conduire un type d’engin ; une catégorie par sorte de chariot ; valable 5 ans.'], 'bulle de CACES');
  egal(await pg.getAttribute(`${Z} .lex-mot[data-lex="CACES"]`, 'aria-expanded'), 'true', 'aria-expanded');
  await pg.click(`${Z} .lex-mot[data-lex="CDD"]`);
  const b = await bulleOuverte();
  egal([b.length, b[0].startsWith('CDD : ')], [1, true], 'une seule bulle, celle de CDD');
  // Le focus est parti ailleurs dans l'écran (Tab) : Échap le ramène sur le mot dont la bulle est ouverte.
  await pg.focus(`${Z} [data-repondre]`);
  await pg.keyboard.press('Escape');
  egal(await bulleOuverte(), [], 'bulles après Échap');
  egal(await pg.evaluate(() => document.activeElement.dataset.lex), 'CDD', 'focus après Échap');
  // Au clavier : Entrée sur le mot ouvre la bulle, un clic ailleurs la ferme.
  await pg.focus(`${Z} .lex-mot[data-lex="cariste"]`);
  await pg.keyboard.press('Enter');
  egal((await bulleOuverte()).length, 1, 'bulle ouverte par Entrée');
  await pg.click(`${Z} .ent-lecteur h3`);
  egal(await bulleOuverte(), [], 'bulles après un clic ailleurs');
  // La messagerie est restée à l'écran (aucun changement de vue).
  vrai(await pg.isVisible(`${Z} .ent-lecteur`), 'le mail n’est plus affiché');
});

await v('Mots : chaque ouverture est comptée par mot et par séance (pas les fermetures, pas l’enseignant)', async () => {
  await monter();
  egal(await reperage(), null, 'repérage au départ');
  await ouvrirSophie();
  await pg.click(`${Z} .lex-mot[data-lex="CACES"]`);   // ouvre
  await pg.click(`${Z} .lex-mot[data-lex="CACES"]`);   // ferme : ne compte pas
  await pg.click(`${Z} .lex-mot[data-lex="CACES"]`);   // rouvre
  await pg.click(`${Z} .lex-bulle:not([hidden])`);   // un clic sur la bulle la ferme (elle couvre le mot suivant)
  egal(await bulleOuverte(), [], 'bulles après un clic sur la bulle');
  await pg.click(`${Z} .lex-mot[data-lex="CDI"]`);
  egal(await reperage(), { mots: { CACES: 2, CDI: 1 } }, 'repérage de l’élève');
  await monter({ role: 'prof' });
  await ouvrirSophie();
  await pg.click(`${Z} .lex-mot[data-lex="CACES"]`);
  egal((await bulleOuverte()).length, 1, 'bulle chez l’enseignant');
  egal(await reperage(), null, 'repérage chez l’enseignant');
});

await v('Mots : sur un écran étroit, la bulle d’un mot proche du bord droit reste entière à l’écran', async () => {
  await pg.setViewportSize({ width: 800, height: 900 });
  try {
    await monter();
    await ouvrirSophie();
    const dedans = [];
    for (const mot of ['cariste', 'CACES', 'CDD', 'saisonnier', 'CDI']) {
      await pg.click(`${Z} .lex-mot[data-lex="${mot}"]`);
      dedans.push(await pg.$eval(`${Z} .lex-bulle:not([hidden])`, (b) => {
        const r = b.getBoundingClientRect();
        return r.left >= 0 && r.right <= document.documentElement.clientWidth;
      }));
      // La bulle ouverte peut couvrir le mot suivant (polices de Linux, sur GitHub : le clic suivant
      // restait bloqué 6 s) : un clic sur la bulle la ferme, comme le ferait l'élève.
      await pg.click(`${Z} .lex-bulle:not([hidden])`);
    }
    egal(dedans, [true, true, true, true, true], 'bulles entières à l’écran');
  } finally { await pg.setViewportSize({ width: 1366, height: 1000 }); }
});

await v('Mots : pas de bouton dans un bouton, et rien n’est transformé sans lexique déclaré', async () => {
  const r = await pg.evaluate(async () => {
    const { brancherLexique } = await import('/core/lexique.js');
    const a = document.createElement('div'); document.body.appendChild(a);
    a.innerHTML = '<button>Le [[CACES]]</button><p>Le [[caces]] et le [[Inconnu]].</p>';
    const fin = brancherLexique(a, { CACES: 'Déf.' }, () => {});
    const b = document.createElement('div'); document.body.appendChild(b);
    b.innerHTML = '<p>Le [[CACES]].</p>';
    brancherLexique(b, {}, () => {});
    // Un texte ajouté APRÈS le branchement est transformé aussi (l'écran est observé).
    a.insertAdjacentHTML('beforeend', '<p>Encore le [[CACES]].</p>');
    await new Promise((ok) => setTimeout(ok, 30));
    const out = { btn: a.querySelector('button').innerHTML, p: a.querySelector('p').textContent,
      n: a.querySelectorAll('.lex-mot').length, sans: b.innerHTML };
    fin();
    a.insertAdjacentHTML('beforeend', '<p>Après [[CACES]].</p>');
    await new Promise((ok) => setTimeout(ok, 30));
    out.apres = a.lastElementChild.textContent;
    a.remove(); b.remove();
    return out;
  });
  egal(r.btn, 'Le CACES', 'mot dans un bouton');
  egal(r.p, 'Le cacesCACES : Déf. et le Inconnu.', 'paragraphe (mot, bulle fermée, mot inconnu)');
  egal(r.n, 2, 'mots cliquables (paragraphe + texte ajouté ensuite)');
  egal(r.sans, '<p>Le [[CACES]].</p>', 'sans lexique');
  egal(r.apres, 'Après [[CACES]].', 'après débranchement');
});

// ── Lot 6 : le repérage pour l'enseignant (temps, aides, premier coup) ───────────────────────────
const repondre = async (fausse) => {
  await ouvrirReponse();
  for (const l of LIGNES) await choisir(l, l === 'raison' && fausse ? 'car il habite le plus près.' : JUSTES[l]);
  await envoyer();
};

await v('Repérage : un jalon raté au premier envoi reste « raté du premier coup » même corrigé ; rien avant le premier envoi', async () => {
  await monter();
  await ouvrirSophie();
  await pg.click(`${Z} .lex-mot[data-lex="CACES"]`);
  // Un geste qui sauve sans rien envoyer : l'étape est « en attente », aucun premier jugement.
  egal(((await reperage()) || {}).premier, undefined, 'premier jugement avant tout envoi');
  await repondre(true);
  egal((await reperage()).premier, { message: 'ko' }, 'après un 1er envoi faux');
  await repondre(false);
  egal((await reperage()).premier, { message: 'ko' }, 'après correction');
  // Le détail remonté (lu par l'enseignant) porte le repérage de la séance.
  const d = await pg.evaluate(() => window.__s.enreg.detail.indicateurs['essai-2de']);
  egal([d.premier, d.mots], [{ message: 'ko' }, { CACES: 1 }], 'repérage dans le détail remonté');
  await monter();
  await repondre(false);
  egal((await reperage()).premier, { message: 'ok' }, 'juste au 1er envoi');
});

await v('Repérage : le temps passé compte l’onglet visible seulement, jamais chez l’enseignant', async () => {
  // Horloge simulée (06/10/2026, lot 2 de MOTEUR-tests-rapides) : `runFor` avance le temps d'un coup
  // et déclenche le comptage toutes les 5 s. Installée avant `monter()`, qui pose la minuterie.
  await pg.clock.install();
  await monter();
  await pg.clock.runFor(5600);
  const t1 = ((await reperage()) || {}).temps || 0;
  vrai(t1 >= 4.5 && t1 <= 7, `temps après 5,6 s visibles : ${t1}`);
  // Onglet caché : le temps s'arrête.
  await pg.evaluate(() => Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }));
  await pg.clock.runFor(5600);
  const t2 = (await reperage()).temps;
  await pg.evaluate(() => { delete document.visibilityState; });
  egal(t2, t1, 'temps pendant que l’onglet est caché');
  await monter({ role: 'prof' });
  await pg.clock.runFor(5600);
  egal(await reperage(), null, 'repérage chez l’enseignant');
});

await v('Repérage : « Réinitialiser » efface le travail mais garde le temps, les aides et le premier coup', async () => {
  await monter();
  await ouvrirSophie();
  await pg.click(`${Z} .lex-mot[data-lex="CDD"]`);
  await repondre(true);
  pg.once('dialog', (d) => d.accept());
  await pg.click('#smTest [data-raz]');
  const r = await pg.evaluate(() => ({ envoyes: window.__s.db.mails.filter((m) => m.folder === 'out').length,
    rep: window.__s.db.indicateurs['essai-2de'] }));
  egal(r.envoyes, 0, 'mails envoyés après remise à zéro');
  egal([r.rep.mots, r.rep.premier], [{ CDD: 1 }, { message: 'ko' }], 'repérage après remise à zéro');
});

await v('Repérage : l’enseignant voit, par séance d’entreprise, temps, mots, aides et premier coup de chaque élève', async () => {
  // Le groupe affiché par le suivi (les blocs précédents peuvent en avoir changé) : on le lit à l'écran.
  // Un bloc précédent a pu quitter le mode enseignant : on y revient (comme le bloc `groupes`).
  const ouvrirSuivi = async () => {
    await page.reload();
    await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
    if (!(await page.$('#btnProfEspace'))) {
      if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
      await page.click('#btnProf');
    }
    await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
    await page.click('#btnProfEspace');
    await page.click('[data-ong="suivi"]');
    await page.waitForSelector('#btnCsvSuivi', { timeout: 6000 });
  };
  await ouvrirSuivi();
  const nomGroupe = (await page.textContent('#btnCsvSuivi >> xpath=ancestor::div[1]//strong')).replace(/^Suivi de /, '').trim();
  const ids = await page.evaluate(async (nomGroupe) => {
    const k = Object.keys(localStorage).find((x) => /groupes$/.test(x));
    const gs = JSON.parse(localStorage.getItem(k));
    const gid = Object.keys(gs).find((id) => gs[id].nom === nomGroupe);
    const { B } = await import('/core/backend.js');
    await B.creerEleves(gid, [{ nom: 'REPERAGE', prenom: 'Test', matricule: 'reperage-test', code: 'x' }]);
    const el = (await B.elevesDuGroupe(gid)).find((x) => x.nom === 'REPERAGE');
    const { chargerActivites, estSimulog } = await import('/activites/index.js');
    // Séance choisie pour ne dépendre d'aucun autre bloc (chantier 13, 09/10/2026) : la première séance
    // d'entreprise à note automatique que personne du groupe n'a jouée — ni documents, ni repérage rangés.
    // Les blocs lancés avant celui-ci (spartoo, socle…) ont pu faire jouer des élèves ; on les évite.
    const eleves = await B.elevesDuGroupe(gid);
    const libre = async (x) => {
      for (const e of eleves) {
        const t = await B.lireScore(gid, e.uid, x.id);
        if (t && t.detail && (t.detail.documents || (t.detail.indicateurs && t.detail.indicateurs[x.id]))) return false;
      }
      return true;
    };
    let m = null;
    for (const x of (await chargerActivites()).map((a) => a.meta)) {
      if (x.portee === 'eleve' && estSimulog(x) && x.bareme && !x.copie && await libre(x)) { m = x; break; }
    }
    if (!m) throw new Error('aucune séance d’entreprise sans élève du groupe qui l’ait jouée : le cas ne prouve rien');
    await B.ecrireScore(gid, el.uid, m.id, { score: 2, max: 5, detail: { quai: { reel: 300 }, indicateurs: { [m.id]: {
      temps: 1500, mots: { CACES: 2, CDD: 1 }, aides: { 'Rappel tableur': 1 }, premier: { a: 'ok', b: 'ko', c: 'ok' } } } } });
    return { gid, uid: el.uid, aid: m.id };
  }, nomGroupe);
  try {
    await ouvrirSuivi();
    await page.waitForSelector(`#reperage [data-reperage="${ids.aid}"]`, { timeout: 6000 });
    const lu = await page.$eval(`#reperage [data-reperage="${ids.aid}"] tr[data-rep-eleve="${ids.uid}"]`, (tr) => ({
      temps: tr.querySelector('[data-rep="temps"]').textContent.replace(/\s+/g, ' ').trim(),
      mots: [tr.querySelector('[data-rep="mots"]').textContent, tr.querySelector('[data-rep="mots"]').title],
      aides: tr.querySelector('[data-rep="aides"]').textContent,
      premier: [tr.querySelector('[data-rep="premier"]').textContent, tr.querySelector('[data-rep="premier"]').title],
    }));
    egal(lu.temps, '25 min (quai : 5 min)', 'temps');
    egal(lu.mots, ['3', 'CACES (2), CDD (1)'], 'mots');
    egal(lu.aides, '1', 'aides');
    // Note écrite sans titres (avant le 07/10/2026) : l'identifiant du jalon raté, une ligne par jalon.
    egal(lu.premier, ['2 / 3', 'Ratés au premier jugement :\n– b\nJustes du premier coup : 2 sur 3.'], 'premier coup');
    // Une séance sans documents joints : pas de colonne « Documents ouverts ».
    vrai(!(await page.$(`#reperage [data-reperage="${ids.aid}"] [data-rep="docs"]`)), 'colonne des documents sans documents');
    // Un élève sans repérage dans le même groupe : un tiret, pas des zéros.
    const autre = await page.$$eval(`#reperage [data-reperage="${ids.aid}"] tbody tr:not([data-rep-eleve])`, (L) => L.length);
    vrai(autre > 0, 'les autres élèves du groupe n’apparaissent pas');
  } finally {
    await page.evaluate(async ({ gid, uid, aid }) => {
      const { B } = await import('/core/backend.js');
      await B.poserNote(gid, uid, aid, null);
      await B.supprimerEleve(uid);
    }, ids);
  }
  // Plus de données pour cette séance : son encadré disparaît (d'autres blocs ont pu laisser des
  // indicateurs sur d'autres séances : on ne regarde que la sienne).
  await ouvrirSuivi();
  vrai(!(await page.$(`#reperage [data-reperage="${ids.aid}"]`)), 'l’encadré de la séance reste affiché sans aucune donnée');
});

await v('Repérage : « Documents ouverts » = documents différents ouverts sur ceux de la séance, détail au survol', async () => {
  // Le détail tel que le moteur le range (`noter` de l'univers d'essai), écrit sur une séance d'entreprise du registre.
  const detail = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-2de.js');
    return creerEntreprise(E.univers({})).noter({ v: 1, mails: [], indicateurs: { 'essai-2de': { docs: { yanis: 3, laura: 1 } } } }).detail;
  });
  egal(detail.documents.total, 6, 'documents rangés avec la note');
  await page.reload();
  await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
  if (!(await page.$('#btnProfEspace'))) {
    if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
    await page.click('#btnProf');
  }
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('#btnCsvSuivi', { timeout: 6000 });
  const nomGroupe = (await page.textContent('#btnCsvSuivi >> xpath=ancestor::div[1]//strong')).replace(/^Suivi de /, '').trim();
  const ids = await page.evaluate(async ({ nomGroupe, detail }) => {
    const k = Object.keys(localStorage).find((x) => /groupes$/.test(x));
    const gs = JSON.parse(localStorage.getItem(k));
    const gid = Object.keys(gs).find((id) => gs[id].nom === nomGroupe);
    const { B } = await import('/core/backend.js');
    await B.creerEleves(gid, [{ nom: 'DOCS', prenom: 'Test', matricule: 'docs-test', code: 'x' }]);
    const el = (await B.elevesDuGroupe(gid)).find((x) => x.nom === 'DOCS');
    const { chargerActivites } = await import('/activites/index.js');
    const m = (await chargerActivites()).map((x) => x.meta).find((x) => x.portee === 'eleve' && x.immersif && x.bareme && !x.copie);
    // Les indicateurs du moteur sont rangés sous l'id de la séance : on les recopie sous celle du registre.
    // `ancien` : un document qui n'est plus dans la séance (retiré depuis) ne compte pas.
    const d = { documents: detail.documents, indicateurs: { [m.id]: { temps: 600, docs: { ...detail.indicateurs['essai-2de'].docs, ancien: 2 } } } };
    await B.ecrireScore(gid, el.uid, m.id, { score: 1, max: 5, detail: d });
    return { gid, uid: el.uid, aid: m.id };
  }, { nomGroupe, detail });
  try {
    await page.reload();
    await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
    await page.click('#btnProfEspace');
    await page.click('[data-ong="suivi"]');
    await page.waitForSelector(`#reperage [data-reperage="${ids.aid}"]`, { timeout: 6000 });
    const lu = await page.$eval(`#reperage [data-reperage="${ids.aid}"]`, (b, uid) => {
      const c = b.querySelector(`tr[data-rep-eleve="${uid}"] [data-rep="docs"]`);
      return { entete: [...b.querySelectorAll('thead th')].map((t) => t.textContent).includes('Documents ouverts'),
        case: c && [c.textContent, c.title] };
    }, ids.uid);
    egal(lu, { entete: true, case: ['2 / 6', 'Yanis Morel (3), Laura Petit (1)'] }, 'colonne des documents');
  } finally {
    await page.evaluate(async ({ gid, uid, aid }) => {
      const { B } = await import('/core/backend.js');
      await B.poserNote(gid, uid, aid, null);
      await B.supprimerEleve(uid);
    }, ids);
  }
});

await v('Repérage : les jalons ratés au premier jugement sont nommés par leur titre (rangé par le moteur avec la note)', async () => {
  // Le moteur range les titres avec la note quand il y a du repérage, et seulement alors.
  const moteur = await page.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-2de.js');
    const M = creerEntreprise(E.univers({}));
    return { avec: M.noter({ v: 1, mails: [], indicateurs: { 'essai-2de': {} } }).detail.titres || null,
      sans: M.noter({ v: 1, mails: [] }).detail.titres || null };
  });
  const [[id1, t1] = []] = Object.entries(moteur.avec || {});
  vrai(t1 && t1 !== id1, `titres rangés avec la note (lu : ${JSON.stringify(moteur.avec)})`);
  egal(moteur.sans, null, 'pas de titres sans repérage');
  await page.reload();
  await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
  if (!(await page.$('#btnProfEspace'))) {
    if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
    await page.click('#btnProf');
  }
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('#btnCsvSuivi', { timeout: 6000 });
  const nomGroupe = (await page.textContent('#btnCsvSuivi >> xpath=ancestor::div[1]//strong')).replace(/^Suivi de /, '').trim();
  const ids = await page.evaluate(async ({ nomGroupe, titres, id1 }) => {
    const k = Object.keys(localStorage).find((x) => /groupes$/.test(x));
    const gs = JSON.parse(localStorage.getItem(k));
    const gid = Object.keys(gs).find((id) => gs[id].nom === nomGroupe);
    const { B } = await import('/core/backend.js');
    await B.creerEleves(gid, [{ nom: 'TITRES', prenom: 'Test', matricule: 'titres-test', code: 'x' }]);
    const el = (await B.elevesDuGroupe(gid)).find((x) => x.nom === 'TITRES');
    const { chargerActivites } = await import('/activites/index.js');
    const m = (await chargerActivites()).map((x) => x.meta).find((x) => x.portee === 'eleve' && x.immersif && x.bareme && !x.copie);
    await B.ecrireScore(gid, el.uid, m.id, { score: 1, max: 2, detail: { titres,
      indicateurs: { [m.id]: { temps: 60, premier: { [id1]: 'ko', 'juste-du-premier-coup': 'ok' } } } } });
    return { gid, uid: el.uid, aid: m.id };
  }, { nomGroupe, titres: moteur.avec, id1 });
  try {
    await page.reload();
    await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
    await page.click('#btnProfEspace');
    await page.click('[data-ong="suivi"]');
    await page.waitForSelector(`#reperage [data-reperage="${ids.aid}"]`, { timeout: 6000 });
    const bulle = await page.$eval(`#reperage [data-reperage="${ids.aid}"] tr[data-rep-eleve="${ids.uid}"] [data-rep="premier"]`, (c) => c.title);
    egal(bulle, `Ratés au premier jugement :\n– ${t1}\nJustes du premier coup : 1 sur 2.`, 'jalon raté nommé par son titre');
  } finally {
    await page.evaluate(async ({ gid, uid, aid }) => {
      const { B } = await import('/core/backend.js');
      await B.poserNote(gid, uid, aid, null);
      await B.supprimerEleve(uid);
    }, ids);
  }
});

// ── Suivi de classe (07/10/2026, maquette validée par Tristan) : entreprises d'abord, repli, « corrigé n× » ──
await v('Suivi : séances d’entreprise d’abord, « corrigé 2× » à la place des tentatives, repli d’une entreprise', async () => {
  await page.reload();
  await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
  if (!(await page.$('#btnProfEspace'))) {
    if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
    await page.click('#btnProf');
  }
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  const ouvrir = async () => {
    await page.reload();
    await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
    await page.click('#btnProfEspace');
    await page.click('[data-ong="suivi"]');
    await page.waitForSelector('#suiviCadre table', { timeout: 6000 });
  };
  await ouvrir();
  const nomGroupe = (await page.textContent('#btnCsvSuivi >> xpath=ancestor::div[1]//strong')).replace(/^Suivi de /, '').trim();
  const ids = await page.evaluate(async (nomGroupe) => {
    const k = Object.keys(localStorage).find((x) => /groupes$/.test(x));
    const gs = JSON.parse(localStorage.getItem(k));
    const gid = Object.keys(gs).find((id) => gs[id].nom === nomGroupe);
    const { B } = await import('/core/backend.js');
    await B.creerEleves(gid, [{ nom: 'SUIVI', prenom: 'Corrige', matricule: 'suivi-corr', code: 'x' },
      { nom: 'SUIVI', prenom: 'Jamais', matricule: 'suivi-jamais', code: 'x' }]);
    const els = (await B.elevesDuGroupe(gid)).filter((x) => x.nom === 'SUIVI');
    const corr = els.find((x) => x.prenom === 'Corrige'), jamais = els.find((x) => x.prenom === 'Jamais');
    const { chargerActivites } = await import('/activites/index.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const tab = metas.find((m) => /^TAB-/.test(m.code) && m.bareme && !m.notation);
    await B.ecrireScore(gid, corr.uid, 'smoby-recrutement', { score: 17.5, max: 20,
      detail: { indicateurs: { 'smoby-recrutement': { corrections: 2 } } } });
    await B.ecrireScore(gid, jamais.uid, 'smoby-recrutement', { score: 12, max: 20,
      detail: { indicateurs: { 'smoby-recrutement': { corrections: 0 } } } });
    await B.ecrireScore(gid, corr.uid, tab.id, { score: tab.bareme, max: tab.bareme });
    const nbSmoby = metas.filter((m) => m.bareme && /^ENT-5\./.test(m.code)).length;
    return { gid, corr: corr.uid, jamais: jamais.uid, tab: tab.id, tabCode: tab.code, nbSmoby };
  }, nomGroupe);
  const lire = () => page.evaluate(({ tabCode }) => {
    const t = document.querySelector('#suiviCadre table');
    const codes = [...t.rows[1].cells].slice(1).map((c) => c.textContent.trim().split(/\s/)[0]);
    const col = (code) => codes.indexOf(code) + 1;
    const ligne = (prenom) => [...t.tBodies[0].rows].find((r) => r.cells[0].textContent.includes(`SUIVI ${prenom}`));
    const txt = (prenom, code) => { const i = col(code); return i ? ligne(prenom).cells[i].textContent.replace(/\s+/g, ' ').trim() : null; };
    const premierAutre = codes.findIndex((c) => !/^ENT-/.test(c) && c !== '…');
    return {
      // Toutes les colonnes d'entreprise avant la première colonne d'une autre famille.
      entD_abord: premierAutre > 0 && codes.slice(premierAutre).every((c) => !/^ENT-/.test(c)),
      bandeau: [...t.rows[0].cells].map((c) => c.textContent.replace(/[▾▸]/g, '').trim()).filter(Boolean),
      corr: txt('Corrige', 'ENT-5.1'), jamais: txt('Jamais', 'ENT-5.1'), tab: txt('Corrige', tabCode),
      ent11: codes.includes('ENT-1.1'), ent51: codes.includes('ENT-5.1'),
      plie: (() => { const c = ligne('Corrige').querySelector('td[data-plie="ent-5"]'); return c && c.textContent.trim(); })(),
      fige: [getComputedStyle(t.rows[1].cells[2]).position, getComputedStyle(ligne('Corrige').cells[0]).position],
    };
  }, ids);
  try {
    await ouvrir();
    const a = await lire();
    vrai(a.entD_abord, 'les séances d’entreprise viennent avant les autres familles');
    egal(a.bandeau.slice(1, 6), ['Spartoo', 'Cdiscount', 'Boost', 'Picard', 'Smoby'], 'bandeau des entreprises');
    egal(a.corr, '17,5/20corrigé 2×', 'note sur 20 et « corrigé 2× », sans tentatives');
    egal(a.jamais, '12/20', 'jamais corrigé : la note seule');
    vrai(/\(1\)$/.test(a.tab || ''), `une activité hors entreprise garde ses tentatives (lu : ${a.tab})`);
    egal(a.fige, ['sticky', 'sticky'], 'en-têtes et noms figés');
    // Replier Smoby : ses colonnes partent, une seule colonne dit les séances faites ; Spartoo reste.
    await page.click('[data-replier="ent-5"]');
    const b = await lire();
    egal([b.ent51, b.ent11, b.plie], [false, true, `1/${ids.nbSmoby}`], 'Smoby replié, Spartoo reste');
    await page.click('[data-replier="ent-5"]');
    const c = await lire();
    egal([c.ent51, c.corr], [true, '17,5/20corrigé 2×'], 'Smoby déplié');
  } finally {
    await page.evaluate(async ({ gid, corr, jamais, tab }) => {
      const { B } = await import('/core/backend.js');
      await B.poserNote(gid, corr, 'smoby-recrutement', null);
      await B.poserNote(gid, corr, tab, null);
      await B.poserNote(gid, jamais, 'smoby-recrutement', null);
      await B.supprimerEleve(corr);
      await B.supprimerEleve(jamais);
    }, ids);
  }
});

// ── Documents joints (brief MOTEUR-documents-formulaire, lot 1, `core/types/documents.js`) ─────────
const RECRUT = 'Recrutement du cariste de Noël';
const ouvrirRecrut = async () => {
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("${RECRUT}")`);
  await pg.waitForSelector(`${Z} .ent-pj-liste`);
};
const pj = () => pg.$$eval(`${Z} .ent-pj`, (L) => L.map((b) => [b.dataset.pj, b.classList.contains('vu'), b.textContent.includes('· ouvert')]));
const visio = () => pg.$eval(`${Z} .ent-visio`, (v) => ({
  doc: v.dataset.visio, titre: v.querySelector('.ent-visio-titre').textContent,
  prec: v.querySelector('.ent-visio-nav button:first-child').dataset.pj || null,
  suiv: v.querySelector('.ent-visio-nav button:last-child').dataset.pj || null,
  feuille: v.querySelector('.ent-doc').dataset.doc,
}));
const docsComptes = async () => ((await reperage()) || {}).docs || null;

await v('Documents : le mail montre ses pièces jointes ; un clic ouvre le document dans le lecteur, précédent / suivant entre les pièces', async () => {
  await monter();
  await ouvrirRecrut();
  egal(await pj(), ['poste', 'yanis', 'laura', 'mehdi', 'thomas', 'sabrina'].map((id) => [id, false, false]), 'pièces avant ouverture');
  vrai((await pg.textContent(`${Z} .ent-lecteur`)).includes('bienvenue au service RH'), 'le texte du mail n’est pas affiché');
  await pg.click(`${Z} .ent-pj[data-pj="yanis"]`);
  egal(await visio(), { doc: 'yanis', titre: 'CV — Yanis Morel', prec: 'poste', suiv: 'laura', feuille: 'yanis' }, 'visionneuse (Yanis)');
  vrai(!(await pg.textContent(`${Z} .ent-lecteur`)).includes('bienvenue au service RH'), 'le document ne remplace pas le texte du mail');
  await pg.click(`${Z} .ent-visio-nav button:has-text("Précédent")`);
  const p = await visio();
  egal([p.doc, p.prec, p.suiv], ['poste', null, 'yanis'], 'première pièce');
  vrai(await pg.$eval(`${Z} .ent-visio-nav button:first-child`, (b) => b.disabled), '« Précédent » actif sur la première pièce');
  await pg.click(`${Z} [data-pj-retour]`);
  vrai((await pg.textContent(`${Z} .ent-lecteur`)).includes('bienvenue au service RH'), '« Retour au message » ne rend pas le texte');
  egal(await pj(), [['poste', true, true], ['yanis', true, true], ['laura', false, false], ['mehdi', false, false],
    ['thomas', false, false], ['sabrina', false, false]], 'mention « ouvert » après lecture');
  // Le focus revient sur la pièce qu'on lisait (clavier : on reprend où on était).
  egal(await pg.evaluate(() => document.activeElement && document.activeElement.dataset.pj), 'poste', 'focus au retour');
  // Sur la dernière pièce, « Suivant » est grisé.
  await pg.click(`${Z} .ent-pj[data-pj="sabrina"]`);
  vrai(await pg.$eval(`${Z} .ent-visio-nav button:last-child`, (b) => b.disabled), '« Suivant » actif sur la dernière pièce');
  // Changer de message referme le document.
  await pg.click(`${Z} .ent-obj:text-is("Le cariste pour le pic de Noël")`);
  vrai(!(await pg.$(`${Z} .ent-visio`)), 'le document reste ouvert sur un autre message');
  vrai(!(await pg.$(`${Z} .ent-pj-liste`)), 'un mail sans pièce jointe en montre');
  await pg.click(`${Z} .ent-obj:text-is("${RECRUT}")`);
  vrai(!(await pg.$(`${Z} .ent-visio`)) && (await pg.textContent(`${Z} .ent-lecteur`)).includes('bienvenue au service RH'),
    'revenir au mail rouvre le document lu avant, pas le texte');
});

await v('Documents : chaque ouverture est comptée (repérage), jamais chez l’enseignant ; la mention « ouvert » survit à la réouverture', async () => {
  await pg.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('essai-2de-base-')).forEach((k) => localStorage.removeItem(k)));
  await monter({ garder: true, uid: 'u-docs' });
  await ouvrirRecrut();
  egal(await docsComptes(), null, 'compte avant toute ouverture');
  await pg.click(`${Z} .ent-pj[data-pj="laura"]`);
  await pg.click(`${Z} .ent-visio-nav button:has-text("Suivant")`);      // mehdi
  await pg.click(`${Z} .ent-visio-nav button:has-text("Précédent")`);    // laura, 2e fois
  egal(await docsComptes(), { laura: 2, mehdi: 1 }, 'ouvertures comptées');
  await monter({ garder: true, uid: 'u-docs' });
  await ouvrirRecrut();
  egal((await pj()).filter((x) => x[2]).map((x) => x[0]), ['laura', 'mehdi'], '« ouvert » après réouverture');
  await monter({ role: 'prof' });
  await ouvrirRecrut();
  await pg.click(`${Z} .ent-pj[data-pj="yanis"]`);
  await pg.click(`${Z} [data-pj-retour]`);
  egal(await reperage(), null, 'repérage chez l’enseignant');
  egal((await pj()).filter((x) => x[2]).map((x) => x[0]), ['yanis'], '« ouvert » chez l’enseignant (le temps de l’écran)');
});

await v('Documents : une feuille de papier quel que soit le thème, la mise en page de la séance seulement dans les documents, et retirée à la sortie', async () => {
  await pg.emulateMedia({ colorScheme: 'dark' });
  try {
    await monter();
    await ouvrirRecrut();
    await pg.click(`${Z} .ent-pj[data-pj="yanis"]`);
    const r = await pg.evaluate(() => {
      const d = document.querySelector('#smTest .ent-doc');
      const pied = d.querySelector('.pied');
      const site = document.createElement('div'); site.className = 'cv1'; document.querySelector('#smTest .ent-main').appendChild(site);
      const hors = getComputedStyle(site).display; site.remove();
      return { fond: getComputedStyle(d).backgroundColor, encre: getComputedStyle(d).color,
        filet: getComputedStyle(pied).borderTopColor, grille: getComputedStyle(d.querySelector('.cv1')).display, hors,
        style: document.head.querySelector('style[data-ent-documents]').textContent.startsWith('.ent-doc{') };
    });
    egal(r, { fond: 'rgb(253, 251, 247)', encre: 'rgb(26, 25, 21)', filet: 'rgb(227, 222, 211)', grille: 'grid', hors: 'block', style: true },
      'feuille en thème sombre');
  } finally { await pg.emulateMedia({ colorScheme: 'light' }); }
  await pg.click('#smTest [data-quitter]');
  egal(await pg.$$eval('style[data-ent-documents]', (L) => L.length), 0, 'mise en page restée après « Quitter »');
});

await v('Documents : les mots cliquables d’un document sont ceux que le contenu marque, et seulement eux', async () => {
  await monter();
  await ouvrirRecrut();
  await pg.click(`${Z} .ent-pj[data-pj="poste"]`);
  const r = await pg.$eval(`${Z} .ent-doc`, (d) => ({ mots: [...d.querySelectorAll('.lex-mot')].map((b) => b.dataset.lex),
    caces: d.textContent.includes('CACES R489'), crochets: d.textContent.includes('[[') }));
  egal(r, { mots: ['cariste'], caces: true, crochets: false }, 'mots du document');
  await pg.click(`${Z} .ent-doc .lex-mot`);
  egal(((await reperage()) || {}).mots, { cariste: 1 }, 'mot ouvert dans un document, compté');
});

await v('Documents : sans déclaration, ni pièce jointe ni mise en page (un mail qui en nomme n’affiche rien)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-2de.js');
    const U = E.univers({});
    delete U.documents; delete U.documentsStyle;
    document.querySelector('#smTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'smTest'; document.body.appendChild(hote);
    const db = {};
    creerEntreprise(U).rendre(hote, {
      meta: { id: 'essai-2de', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
      profil: { prenom: 'Lea', nom: 'T', role: 'eleve', uid: 'u-sans' }, jeu: { etat: () => db, sauver: () => {} },
      enregistrer: () => {}, quitter: () => {}, lireScore: async () => null, rendreCopie: async () => ({}),
    });
    hote.querySelector('.ent-nav[data-vue="mail"]').click();
    [...hote.querySelectorAll('.ent-mitem')].find((b) => b.textContent.includes('Recrutement')).click();
    return { pj: hote.querySelectorAll('.ent-pj').length, style: document.head.querySelectorAll('style[data-ent-documents]').length,
      texte: hote.querySelector('.ent-lecteur').textContent.includes('bienvenue') };
  });
  egal(r, { pj: 0, style: 0, texte: true }, 'environnement sans documents');
});

// ── Fiche à remplir (même brief, lot 2, `core/types/fiche.js`) ──────────────────────────────────────
const F = `${Z} .ent-fiche`;
const ouvrirFiche = async () => { await pg.click('#smTest .ent-nav[data-vue="fiche"]'); await pg.waitForSelector(F); };
const ouinon = (l, c, oui) => pg.click(`${F} [data-ouinon="tri|${l}|${c}|${oui ? 1 : 0}"]`);
const fiche = () => pg.evaluate(async () => {
  const { ficheEnvoyee } = await import('/core/types/fiche.js');
  return JSON.parse(JSON.stringify(ficheEnvoyee(window.__s.db, 'selection')));
});
const toutRemplir = async () => {
  for (const l of ['yanis', 'laura', 'mehdi', 'thomas', 'sabrina']) for (const c of ['caces', 'dispo', 'cdd']) await ouinon(l, c, l === 'yanis');
  await pg.selectOption(`${F} [data-fiche-champ="candidat"]`, 'yanis');
  await pg.check(`${F} input[data-fiche-champ="contrat"][value="CDD"]`);
};
const manqueAffiche = () => pg.textContent(`${F} [data-fiche-manque]`);
const recusFiche = () => pg.evaluate(() => window.__s.db.mails.filter((m) => m.subject === 'Fiche de sélection reçue').length);

await v('Fiche : une entrée de menu et un bouton dans le mail ; documents en onglets à gauche, la fiche ne bouge pas quand on change d’onglet', async () => {
  await monter();
  await ouvrirRecrut();
  await pg.click(`${Z} .ent-lecteur button:has-text("Ouvrir la fiche de sélection")`);
  await pg.waitForSelector(F);
  egal(await pg.textContent(`${Z} .ent-tete h2`), 'Fiche de sélection', 'titre');
  const onglets = () => pg.$$eval(`${F} [data-fiche-doc]`, (L) => L.map((b) => [b.dataset.ficheDoc, b.getAttribute('aria-selected')]));
  egal((await onglets()).map((x) => x[0]), ['poste', 'yanis', 'laura', 'mehdi', 'thomas', 'sabrina'], 'onglets');
  egal(await pg.$eval(`${F} [data-fiche-panneau] .ent-doc`, (d) => d.dataset.doc), 'poste', 'premier document affiché');
  await ouinon('yanis', 'caces', true);
  await pg.$eval(`${F} form[data-fiche]`, (f) => { f.__marque = true; });
  await pg.click(`${F} [data-fiche-doc="laura"]`);
  egal(await pg.$eval(`${F} [data-fiche-panneau] .ent-doc`, (d) => d.dataset.doc), 'laura', 'document après clic');
  egal((await onglets()).filter((x) => x[1] === 'true').map((x) => x[0]), ['laura'], 'onglet choisi');
  vrai(await pg.$eval(`${F} form[data-fiche]`, (f) => f.__marque === true), 'la fiche a été redessinée en changeant d’onglet');
  // Flèche droite au clavier : onglet suivant, focus dessus.
  await pg.focus(`${F} [data-fiche-doc="laura"]`);
  await pg.keyboard.press('ArrowRight');
  egal([await pg.$eval(`${F} [data-fiche-panneau] .ent-doc`, (d) => d.dataset.doc), await pg.evaluate(() => document.activeElement.dataset.ficheDoc)],
    ['mehdi', 'mehdi'], 'flèche droite');
  egal(await docsComptes(), { laura: 1, mehdi: 1 }, 'onglets ouverts comptés (pas le premier, affiché d’office)');
});

await v('Fiche : oui / non sans redessin ni perte de focus, un contour et jamais un aplat, rien de jugé ; le travail est gardé', async () => {
  await pg.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('essai-2de-base-')).forEach((k) => localStorage.removeItem(k)));
  await monter({ garder: true, uid: 'u-fiche' });
  await ouvrirFiche();
  const b = `${F} [data-ouinon="tri|mehdi|caces|0"]`;
  await pg.$eval(b, (x) => { x.__marque = true; });
  await pg.focus(b);
  await pg.keyboard.press('Enter');
  const r = await pg.$eval(b, (x) => ({ marque: x.__marque === true, focus: document.activeElement === x, pressed: x.getAttribute('aria-pressed'),
    autre: x.parentElement.querySelector('[data-ouinon$="|1"]').getAttribute('aria-pressed'),
    fond: getComputedStyle(x).backgroundColor, bord: getComputedStyle(x).borderTopWidth }));
  egal(r, { marque: true, focus: true, pressed: 'true', autre: 'false', fond: 'rgba(0, 0, 0, 0)', bord: '2px' }, 'case « non » choisie');
  await ouinon('mehdi', 'caces', true);
  egal(await pg.$eval(b, (x) => x.getAttribute('aria-pressed')), 'false', 'changer d’avis');
  // Rien de jugé avant l'envoi : aucun signe juste / faux dans la fiche.
  vrai(!(await pg.$(`${F} .ok, ${F} .ko, ${F} .juste, ${F} .faux, ${F} .avis-ok`)), 'un jugement s’affiche avant l’envoi');
  egal((await fiche()).valeurs, { tri: { mehdi: { caces: true } } }, 'valeurs rangées');
  await monter({ garder: true, uid: 'u-fiche' });
  await ouvrirFiche();
  egal(await pg.$eval(`${F} [data-ouinon="tri|mehdi|caces|1"]`, (x) => x.getAttribute('aria-pressed')), 'true', 'case retrouvée à la réouverture');
});

await v('Fiche : un envoi incomplet est refusé, la raison s’écrit sous le bouton, le travail reste', async () => {
  await monter();
  await ouvrirFiche();
  await cliquerEtConfirmer(pg, `${F} [data-fiche-envoyer]`);
  egal(await manqueAffiche(), 'Il manque : 15 cases du tableau sans réponse, le candidat, le contrat.', 'tout vide');
  await toutRemplir();
  egal(await manqueAffiche(), '', 'la raison reste affichée après une saisie');
  await ouinon('thomas', 'cdd', true);
  await pg.evaluate(() => { delete window.__s.db.fiches.selection.valeurs.tri.sabrina; });
  await cliquerEtConfirmer(pg, `${F} [data-fiche-envoyer]`);
  egal(await manqueAffiche(), 'Il manque : 3 cases du tableau sans réponse.', 'une ligne effacée');
  const e = await fiche();
  egal([e.envoye, e.valeurs.candidat, e.valeurs.contrat, e.valeurs.tri.yanis], [false, 'yanis', 'CDD', { caces: true, dispo: true, cdd: true }], 'travail gardé');
  egal(await recusFiche(), 0, 'Sophie répond à une fiche non envoyée');
});

await v('Fiche : envoyée, elle est figée et relue ; `apresFiche` une seule fois, `ficheEnvoyee` lit les valeurs', async () => {
  await pg.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('essai-2de-base-')).forEach((k) => localStorage.removeItem(k)));
  await monter({ garder: true, uid: 'u-envoi' });
  await ouvrirFiche();
  await toutRemplir();
  await ouinon('laura', 'caces', true);
  await cliquerEtConfirmer(pg, `${F} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F} [data-fiche-envoyee]`);
  vrai(/^Fiche envoyée à Sophie le \d\d\/\d\d à \d\d:\d\d\. Réponds-lui maintenant dans la Messagerie\./.test(await pg.textContent(`${F} [data-fiche-envoyee]`)),
    'message d’envoi');
  const r = await pg.evaluate(() => ({ fs: document.querySelector('#smTest .ent-fiche fieldset').disabled,
    bouton: !!document.querySelector('#smTest [data-fiche-envoyer]') }));
  egal(r, { fs: true, bouton: false }, 'fiche figée');
  // Un clic sur une case figée ne change rien, même si l'écran la laissait passer (cadre réactivé à la main).
  await pg.$eval(`${F} [data-ouinon="tri|mehdi|caces|1"]`, (x) => { x.closest('fieldset').disabled = false; x.click(); });
  const e = await fiche();
  egal([e.envoye, typeof e.at, e.valeurs.tri.laura.caces, e.valeurs.tri.mehdi.caces], [true, 'number', true, false], 'ficheEnvoyee après l’envoi');
  egal(await recusFiche(), 1, 'Sophie répond (apresFiche)');
  await monter({ garder: true, uid: 'u-envoi' });
  await ouvrirFiche();
  vrai(await pg.$eval(`${F} fieldset`, (f) => f.disabled), 'fiche plus figée à la réouverture');
  egal(await recusFiche(), 1, 'apresFiche rejoué à la réouverture');
  // « Ouvrir la Messagerie » mène au message de Sophie.
  await pg.click(`${F} [data-fiche-envoyee] button`);
  await pg.waitForSelector(`${Z} .ent-mitem`);
  vrai((await pg.textContent(`${Z} .ent-mlist`)).includes('Fiche de sélection reçue'), 'le message de Sophie n’est pas dans la Messagerie');
});

await v('Fiche : sans déclaration, ni écran, ni entrée de menu, ni bouton dans le mail', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-2de.js');
    const U = E.univers({});
    delete U.fiche;
    document.querySelector('#smTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'smTest'; document.body.appendChild(hote);
    const db = {};
    creerEntreprise(U).rendre(hote, {
      meta: { id: 'essai-2de', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
      profil: { prenom: 'Lea', nom: 'T', role: 'eleve', uid: 'u-sans' }, jeu: { etat: () => db, sauver: () => {} },
      enregistrer: () => {}, quitter: () => {}, lireScore: async () => null, rendreCopie: async () => ({}),
    });
    hote.querySelector('.ent-nav[data-vue="mail"]').click();
    [...hote.querySelectorAll('.ent-mitem')].find((b) => b.textContent.includes('Recrutement')).click();
    return { menu: !!hote.querySelector('.ent-nav[data-vue="fiche"]'), bouton: !!hote.querySelector('.ent-lecteur [data-vue2="fiche"]'),
      pj: hote.querySelectorAll('.ent-pj').length, fiches: 'fiches' in db };
  });
  egal(r, { menu: false, bouton: false, pj: 6, fiches: false }, 'environnement sans fiche');
});

// ── Fiche à remplir, lot 4 (05/10/2026) : blocs `cases` (cocher plusieurs) et `ordre` (remettre dans l'ordre) ──
// Une fiche d'essai déclarée ici (l'univers de la page d'essai, sa fiche remplacée). Valeurs écrites à la main.
const FB = `${Z} .ent-fiche`;
const monterBlocs = (o = {}) => pg.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-2de.js');
  const U = E.univers({});
  U.fiche = { id: 'essai-blocs', libelle: 'Fiche d’essai', titre: 'Fiche d’essai',
    blocs: [
      { type: 'cases', id: 'pieces', titre: '1. Pièces', choix: [{ v: 'a', lib: 'Alpha' }, { v: 'b', lib: 'Bravo' }, { v: 'c', lib: 'Charlie' }] },
      { type: 'ordre', id: 'jour', titre: '2. Ordre', choix: [{ v: 'z3', lib: 'Trois' }, { v: 'z1', lib: 'Un' }, { v: 'z2', lib: 'Deux' }] },
    ],
    envoi: { bouton: 'Envoyer', a: 'Sophie' } };
  document.querySelector('#smTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'smTest'; document.body.appendChild(hote);
  const CLE = 'essai-blocs-' + (o.uid || 'u-b');
  const db = o.garder ? JSON.parse(localStorage.getItem(CLE) || '{}') : {};
  window.__s = { db };
  creerEntreprise(U).rendre(hote, {
    meta: { id: 'essai-2de', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
    profil: { prenom: 'Lea', nom: 'T', role: 'eleve', uid: o.uid || 'u-b' },
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: () => {}, quitter: () => {}, lireScore: async () => null, rendreCopie: async () => ({}),
  });
  hote.querySelector('.ent-nav[data-vue="fiche"]').click();
}, o);
const valeursBlocs = () => pg.evaluate(() => JSON.parse(JSON.stringify((window.__s.db.fiches || {})['essai-blocs'] || null)));
const lignesOrdre = () => pg.$$eval(`${FB} [data-fiche-ordre="jour"] li`, (L) => L.map((li) => [li.querySelector('.ent-ordre-rang').textContent,
  li.dataset.v, li.querySelector('[data-ordre-sens="-1"]').disabled, li.querySelector('[data-ordre-sens="1"]').disabled]));

await v('Fiche, lot 4 : cases à cocher sans redessin ni perte de focus, rangées dans l’ordre déclaré, un contour et jamais un aplat', async () => {
  await monterBlocs();
  await pg.waitForSelector(FB);
  await pg.$eval(`${FB} form[data-fiche]`, (f) => { f.__marque = true; });
  egal(await valeursBlocs(), { valeurs: {} }, 'rien de rangé avant un geste');
  await pg.click(`${FB} label:has([data-fiche-case="pieces"][value="c"])`);
  await pg.focus(`${FB} [data-fiche-case="pieces"][value="a"]`);
  await pg.keyboard.press('Space');
  egal((await valeursBlocs()).valeurs.pieces, ['a', 'c'], 'cochées, dans l’ordre déclaré');
  egal(await pg.evaluate(() => document.activeElement.value), 'a', 'focus après Espace');
  vrai(await pg.$eval(`${FB} form[data-fiche]`, (f) => f.__marque === true), 'la fiche a été redessinée');
  await pg.click(`${FB} label:has([data-fiche-case="pieces"][value="c"])`);
  egal((await valeursBlocs()).valeurs.pieces, ['a'], 'décochée');
  // La case cochée : un contour de 2 px, aucun fond (charte : un champ ne prend jamais d'aplat).
  const st = await pg.$eval(`${FB} label:has([value="a"])`, (l) => { const c = getComputedStyle(l); return [c.borderTopWidth, c.backgroundColor]; });
  egal(st, ['2px', 'rgba(0, 0, 0, 0)'], 'style d’une case cochée');
  vrai(!(await pg.$(`${FB} .ok, ${FB} .ko, ${FB} .juste, ${FB} .faux`)), 'un jugement s’affiche avant l’envoi');
});

await v('Fiche, lot 4 : remise en ordre par les flèches, sans redessin, le focus suit la ligne ; gardée à la réouverture', async () => {
  await pg.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('essai-blocs-')).forEach((k) => localStorage.removeItem(k)));
  await monterBlocs({ garder: true, uid: 'u-ordre' });
  await pg.waitForSelector(FB);
  egal(await lignesOrdre(), [['1', 'z3', true, false], ['2', 'z1', false, false], ['3', 'z2', false, true]], 'départ = ordre déclaré, bouts désactivés');
  await pg.$eval(`${FB} form[data-fiche]`, (f) => { f.__marque = true; });
  // « Un » monte d'un cran : il passe premier, son ↑ se désactive, le focus va sur son ↓.
  await pg.click(`${FB} li[data-v="z1"] [data-ordre-sens="-1"]`);
  egal(await lignesOrdre(), [['1', 'z1', true, false], ['2', 'z3', false, false], ['3', 'z2', false, true]], 'après ↑ sur « Un »');
  egal(await pg.evaluate(() => [document.activeElement.closest('li').dataset.v, document.activeElement.dataset.ordreSens]), ['z1', '1'], 'focus après ↑ en tête');
  // Au clavier : « Trois » descend (Entrée sur son ↓), le focus reste sur ce bouton puis passe à ↑ en bas.
  await pg.focus(`${FB} li[data-v="z3"] [data-ordre-sens="1"]`);
  await pg.keyboard.press('Enter');
  egal(await lignesOrdre(), [['1', 'z1', true, false], ['2', 'z2', false, false], ['3', 'z3', false, true]], 'après ↓ sur « Trois »');
  egal(await pg.evaluate(() => [document.activeElement.closest('li').dataset.v, document.activeElement.dataset.ordreSens]), ['z3', '-1'], 'focus après ↓ en bas');
  egal(await pg.textContent(`${FB} [data-ordre-annonce]`), 'Trois : position 3 sur 3.', 'annonce aux lecteurs d’écran');
  vrai(await pg.$eval(`${FB} form[data-fiche]`, (f) => f.__marque === true), 'la fiche a été redessinée');
  egal((await valeursBlocs()).valeurs.jour, ['z1', 'z2', 'z3'], 'ordre rangé');
  await monterBlocs({ garder: true, uid: 'u-ordre' });
  await pg.waitForSelector(FB);
  egal((await lignesOrdre()).map((l) => l[1]), ['z1', 'z2', 'z3'], 'ordre à la réouverture');
});

await v('Fiche, lot 4 : envoyée sans rien toucher, rien ne manque ; cases vides et ordre de départ rangés ; figée ensuite', async () => {
  await monterBlocs();
  await pg.waitForSelector(FB);
  await cliquerEtConfirmer(pg, `${FB} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${FB} [data-fiche-envoyee]`);
  const f = await pg.evaluate(async () => {
    const { ficheEnvoyee } = await import('/core/types/fiche.js');
    return JSON.parse(JSON.stringify(ficheEnvoyee(window.__s.db, 'essai-blocs')));
  });
  egal([f.envoye, f.valeurs], [true, { jour: ['z3', 'z1', 'z2'], pieces: [] }], 'fiche envoyée sans geste');
  egal(await pg.$$eval(`${FB} [data-ordre-sens], ${FB} [data-fiche-case]`, (L) => L.every((b) => b.closest('fieldset').disabled)), true, 'figée');
  // Même un clic forcé ne change rien.
  await pg.$eval(`${FB} li[data-v="z1"] [data-ordre-sens="-1"]`, (b) => { b.closest('fieldset').disabled = false; b.click(); });
  await pg.$eval(`${FB} [data-fiche-case][value="b"]`, (c) => { c.click(); });
  egal((await valeursBlocs()).valeurs, { jour: ['z3', 'z1', 'z2'], pieces: [] }, 'valeurs après des clics sur une fiche figée');
});

// ── Menu de gauche rétractable (même brief, lot 3) ─────────────────────────────────────────────────
const menu = () => pg.evaluate(() => {
  const h = document.querySelector('#smTest'), b = h.querySelector('[data-menu-replier]');
  return { replie: h.querySelector('.ent-shell').classList.contains('ent-menu-replie'), liste: !h.querySelector('#entMenuListe').hidden,
    entrees: [...h.querySelectorAll('.ent-nav')].filter((x) => x.offsetParent !== null).length,
    expanded: b.getAttribute('aria-expanded'), label: b.getAttribute('aria-label'),
    largeur: Math.round(h.querySelector('.ent-side').getBoundingClientRect().width), db: window.__s.db.menuReplie };
});

await v('Menu : replié sur place (focus gardé, sans redessin), gardé d’un écran à l’autre, à la réouverture et à « Réinitialiser »', async () => {
  await pg.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('essai-2de-base-')).forEach((k) => localStorage.removeItem(k)));
  await monter({ garder: true, uid: 'u-menu' });
  const avant = await menu();
  egal([avant.replie, avant.liste, avant.expanded, avant.label, avant.db], [false, true, 'true', 'Replier le menu', undefined], 'menu déplié au départ');
  vrai(avant.entrees > 5 && avant.largeur > 150, 'menu déplié visible');
  await ouvrirRecrut();
  await pg.$eval(`${Z} .ent-lecteur`, (l) => { l.__marque = true; });
  await pg.focus('#smTest [data-menu-replier]');
  await pg.keyboard.press('Enter');
  const r = await menu();
  egal([r.replie, r.liste, r.entrees, r.expanded, r.label, r.db], [true, false, 0, 'false', 'Déplier le menu', true], 'menu replié');
  vrai(r.largeur < 70, `bande étroite : ${r.largeur} px`);
  vrai(await pg.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-menu-replier')), 'focus perdu');
  vrai(await pg.$eval(`${Z} .ent-lecteur`, (l) => l.__marque === true), 'l’écran a été redessiné');
  // Un autre écran (par le bouton du mail) : toujours replié.
  await pg.click(`${Z} .ent-lecteur button:has-text("Ouvrir la fiche de sélection")`);
  await pg.waitForSelector(F);
  egal((await menu()).replie, true, 'replié sur un autre écran');
  await monter({ garder: true, uid: 'u-menu' });
  egal((await menu()).replie, true, 'replié à la réouverture');
  pg.once('dialog', (d) => d.accept());
  await pg.click('#smTest [data-raz]');
  egal((await menu()).replie, true, 'replié après « Réinitialiser »');
  await pg.click('#smTest [data-menu-replier]');
  const d = await menu();
  egal([d.replie, d.liste, d.expanded, d.db], [false, true, 'true', false], 'déplié');
  await monter({ garder: true, uid: 'u-menu' });
  egal((await menu()).replie, false, 'déplié à la réouverture');
});

// ── ENT-5.1 « recruter le cariste de Noël » (brief `docs/briefs/ENT-5.1-smoby-recrutement.md`) ─────
// La séance réelle, montée par son activité (`activites/smoby-recrutement.js`). Les attendus sont écrits
// À LA MAIN ici, d'après le brief (§4, tableau des candidats), jamais relus dans le contenu.
const T51 = '#s51';
const Z51 = `${T51} .ent-main`;
const F51 = `${Z51} .ent-fiche`;
const monter51 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-recrutement.js');
  document.querySelector('#smTest')?.remove();
  document.querySelector('#s51')?.remove();
  const hote = document.createElement('div'); hote.id = 's51'; document.body.appendChild(hote);
  const db = {};
  window.__51 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-51' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__51.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null, suivante: { code: 'ENT-5.2', titre: 'L’arrivée de Yanis' },
  });
}, o);
// L'état des 22 jalons, lu par les jalons de la séance sur la base de l'élève.
const etapes51 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent51.js');
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, e.verifier(window.__51.db).status]));
});
const dernierScore51 = () => pg.evaluate(() => { const s = window.__51.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
const nav51 = (vue) => pg.click(`${T51} .ent-nav[data-vue="${vue}"]`);
const ouvrirMail51 = async (sujet) => {
  await nav51('mail');
  await pg.click(`${Z51} [data-dossier="in"]`);
  await pg.click(`${Z51} .ent-obj:text-is("${sujet}")`);
};
// Le tableau juste, écrit à la main d'après le brief : Laura (CACES de mars 2021, périmé), Mehdi (CACES 1A),
// Thomas (libre le 4 janvier), Sabrina (CDI seulement) ; Yanis coche tout.
const TRI51 = {
  yanis: { caces: true, dispo: true, cdd: true },
  laura: { caces: false, dispo: true, cdd: true },
  mehdi: { caces: false, dispo: true, cdd: true },
  thomas: { caces: true, dispo: false, cdd: true },
  sabrina: { caces: true, dispo: true, cdd: false },
};
const PHR51 = {
  salutation: 'Bonjour Sophie,',
  choix: 'Je retiens la candidature de Yanis Morel',
  raison: 'car ce candidat a le CACES 3 valide, est disponible le 9 décembre et accepte un CDD.',
  contrat: 'Je propose un CDD saisonnier.',
  fin: 'Peux-tu valider ? Merci, bonne journée.',
};
// Remplit et envoie la fiche (`tri` : le tableau à cocher ; `candidat`, `contrat`).
async function envoyerFiche51({ tri = TRI51, candidat = 'yanis', contrat = 'CDD' } = {}) {
  await pg.click(`${Z51} .ent-lecteur button:has-text("Ouvrir la fiche de sélection")`);
  await pg.waitForSelector(F51);
  for (const [l, cols] of Object.entries(tri)) for (const [c, oui] of Object.entries(cols)) {
    await pg.click(`${F51} [data-ouinon="tri|${l}|${c}|${oui ? 1 : 0}"]`);
  }
  await pg.selectOption(`${F51} [data-fiche-champ="candidat"]`, candidat);
  await pg.check(`${F51} input[data-fiche-champ="contrat"][value="${contrat}"]`);
  await cliquerEtConfirmer(pg, `${F51} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F51} [data-fiche-envoyee]`);
}
// Répond à Sophie par phrases (`remplace` : les lignes à changer).
async function repondre51(remplace = {}) {
  await ouvrirMail51('Ton choix pour le poste de cariste');
  await pg.click(`${Z51} [data-repondre]`);
  await pg.waitForSelector(`${Z51} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries({ ...PHR51, ...remplace })) await pg.selectOption(`${Z51} [data-phrase="${l}"]`, { label: t });
  await cliquerEtConfirmer(pg, `${Z51} #formPhr button[type="submit"]`);
}
const sujets51 = () => pg.evaluate(() => window.__51.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
// Lot A bis (07/10/2026) : une case = un jalon. 15 cases du tableau, candidat, contrat, 5 lignes du message.
const CASES51 = ['yanis', 'laura', 'mehdi', 'thomas', 'sabrina'].flatMap((c) => ['caces', 'dispo', 'cdd'].map((k) => `case-${c}-${k}`));
const MSG51 = ['msg-raison', 'msg-candidat', 'msg-contrat', 'msg-salutation', 'msg-fin'];
const FICHE51 = [...CASES51, 'candidat', 'contrat'];
const TOUS51 = [...FICHE51, ...MSG51];
const statuts = (ok, ko = []) => Object.fromEntries(TOUS51.map((id) => [id, ko.includes(id) ? 'ko' : ok]));
// Après la fiche, avant la réponse : le message n'est pas jugé.
const apresFiche51 = (ko = []) => ({ ...statuts('ok', ko), ...Object.fromEntries(MSG51.map((id) => [id, 'attente'])) });
// Le tableau juste avec UNE case retournée.
const flip51 = (id, col) => ({ ...TRI51, [id]: { ...TRI51[id], [col]: !TRI51[id][col] } });
// Le barème d'ENT-5.1, écrit à la main : tableau 8 (15 cases), candidat 5, contrat 2, raison 2, candidat du message 1,
// contrat du message 1, salutation 0,5, fin 0,5. Total 20.
const bandeau51 = () => pg.$$eval(`${T51} [data-fin-seance] [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finEtat, x.textContent.replace(/\s+/g, ' ').trim().replace(/^([✓✗])\s*/, '$1 ')]));

await v('ENT-5.1 : déclaration (code, 2de, AGO-3.1, barème sur 20, livrée fermée aux élèves) et entreprise n° 5 avec son logo', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-recrutement.js');
    const I = await import('/activites/index.js');
    const C = await import('/core/competences.js');
    const e = I.ENTREPRISES.find((x) => x.n === 5);
    const logo = await fetch(e.logo);
    const m = A.meta;
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.temps, m.bareme, m.pret, m.ouverture, m.portee, m.immersif],
      compConnue: JSON.stringify(C).includes('AGO-3.1'), e: [e.nom, logo.status, (await logo.text()).includes('<svg')],
      inscrite: (await Promise.all(I.ACTIVITES.map((f) => f()))).some((x) => x.meta.id === 'smoby-recrutement') };
  });
  egal(r.m, ['smoby-recrutement', 'ENT-5.1', 'simulog', ['2de'], ['AGO-3.1'], 'guidage', 20, true, 'prof', 'eleve', true], 'meta');
  vrai(r.compConnue, 'AGO-3.1 absente de core/competences.js');
  egal(r.e, ['Smoby', 200, true], 'entreprise n° 5');
  vrai(r.inscrite, 'séance absente du registre');
});

await v('ENT-5.1 : les attendus calculés sont ceux du brief (tableau, Yanis, CDD) et un seul candidat coche tout', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent51.js');
    const C = await import('/contenus/corriges/ENT-5.1.js');
    return { tri: S.TRI_ATTENDU, retenu: S.RETENU.id, contrat: S.POSTE.contrat,
      complets: Object.entries(S.TRI_ATTENDU).filter(([, l]) => l.caces && l.dispo && l.cdd).map(([id]) => id),
      items: C.CORRIGE.items.filter((it) => !/\(trame\)$/.test(String(it.etape))).length,
      trame: C.CORRIGE.items.filter((it) => /\(trame\)$/.test(String(it.etape))).length };
  });
  egal(r.tri, TRI51, 'tableau attendu');
  egal([r.retenu, r.contrat, r.complets], ['yanis', 'CDD', ['yanis']], 'choix attendu');
  // Le corrigé de la trame (41 questions, déclarée le 06/10/2026) s'ajoute après les 3 calculés.
  egal([r.items, r.trame], [3, 41], 'corrigé (écran, trame)');
});

await v('ENT-5.1 : à l’ouverture, un seul message (6 pièces jointes, la fiche), aucun jalon vrai : l’inaction vaut 0', async () => {
  await monter51();
  egal(await sujets51(), ['Recrutement du cariste de Noël'], 'messages au départ');
  await ouvrirMail51('Recrutement du cariste de Noël');
  egal(await pg.$$eval(`${Z51} .ent-pj`, (L) => L.map((b) => b.dataset.pj)), ['poste', 'yanis', 'laura', 'mehdi', 'thomas', 'sabrina'], 'pièces jointes');
  // Les mots cliquables du message (lexique de la séance) : « fiche de poste » compris.
  const mots = await pg.$$eval(`${Z51} .ent-lecteur .lex-mot, ${Z51} .ent-lecteur [data-lex]`, (L) => L.map((b) => b.textContent.trim()));
  vrai(['cariste', 'CDD', 'saisonnier', 'fiche de poste'].every((m) => mots.includes(m)), `mots cliquables : ${mots.join(', ')}`);
  // La fiche de poste porte le logo de Smoby (fichier du dépôt) et la mention de document reconstitué.
  await pg.click(`${Z51} .ent-pj[data-pj="poste"]`);
  const fp = await pg.$eval(`${Z51} .ent-doc`, (d) => ({ logo: d.querySelector('img') && d.querySelector('img').getAttribute('src'),
    charge: d.querySelector('img') ? d.querySelector('img').naturalWidth > 0 : false, pied: d.textContent.includes('reconstitution, non contractuel') }));
  egal([fp.logo, fp.pied], ['./contenus/trames/logos/smoby.svg', true], 'fiche de poste');
  egal(await etapes51(), statuts('attente'), 'étapes à l’ouverture');
  const s = await dernierScore51();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
});

await v('ENT-5.1 : parcours juste à l’écran → fiche, message de Sophie par phrases, réponse, 20 / 20', async () => {
  await monter51();
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51();
  // Fiche envoyée : les 17 jalons de la fiche jugés, les 5 du message pas encore (pas de réponse envoyée).
  egal(await etapes51(), apresFiche51(), 'après la fiche');
  egal(await sujets51(), ['Recrutement du cariste de Noël', 'Ton choix pour le poste de cariste'], 'Sophie demande la réponse');
  await repondre51();
  egal(await etapes51(), statuts('ok'), 'après la réponse');
  proche(await dernierScore51(), 20, 'score remonté au suivi');
  vrai((await sujets51()).includes('RE : Ton choix pour le poste de cariste'), 'la réponse de Sophie (suite de l’histoire) n’arrive pas');
});

await v('ENT-5.1 : chaque piège fait tomber son jalon, et lui seul — et coûte exactement son poids (sabotage par jalon, à l’écran)', async () => {
  // [jalons faux, fiche, phrases, points perdus] : une case du tableau vaut 8/15 de point ; le mauvais candidat 5.
  const cas = [
    [['case-yanis-dispo'], { tri: flip51('yanis', 'dispo') }, null, 8 / 15],
    [['case-laura-caces'], { tri: flip51('laura', 'caces') }, null, 8 / 15],   // Laura cochée « CACES valide » (piège du brief)
    [['case-mehdi-caces'], { tri: flip51('mehdi', 'caces') }, null, 8 / 15],
    [['case-thomas-dispo'], { tri: flip51('thomas', 'dispo') }, null, 8 / 15],
    [['case-sabrina-cdd'], { tri: flip51('sabrina', 'cdd') }, null, 8 / 15],
    [['candidat'], { candidat: 'sabrina' }, null, 5],
    [['contrat'], { contrat: 'CDI' }, null, 2],
    [['msg-raison'], null, { raison: 'car ce candidat a le CACES.' }, 2],
    [['msg-candidat'], null, { choix: 'Je retiens la candidature de Laura Petit' }, 1],
    [['msg-contrat'], null, { contrat: 'Je propose un CDI.' }, 1],
    [['msg-salutation'], null, { salutation: 'Salut !' }, 0.5],
    [['msg-fin'], null, { fin: 'Bisous' }, 0.5],
    // Deux cases du même candidat : le jalon de chaque case tombe, le coût s'additionne.
    [['case-yanis-dispo', 'case-yanis-cdd'], { tri: { ...flip51('yanis', 'dispo'), yanis: { caces: true, dispo: false, cdd: false } } }, null, 16 / 15],
  ];
  for (const [ko, fiche, phrases, perdu] of cas) {
    await monter51({ uid: 'u-' + ko.join('+') });
    await ouvrirMail51('Recrutement du cariste de Noël');
    await envoyerFiche51(fiche || {});
    await repondre51(phrases || {});
    egal(await etapes51(), statuts('ok', ko), `sabotage de « ${ko.join(', ')} »`);
    proche(await dernierScore51(), 20 - perdu, `score avec « ${ko.join(', ')} » faux`);
  }
});

await v('ENT-5.1 : le barème — 22 jalons, 15 cases à 8/15, parts par bloc 8 / 7 / 5, total 20, groupes du bandeau', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent51.js');
    const somme = (L) => Math.round(L.reduce((t, e) => t + e.poids, 0) * 1e6) / 1e6;
    const de = (re) => S.ETAPES.filter((e) => re.test(e.id));
    return { n: S.ETAPES.length, total: somme(S.ETAPES), tri: [de(/^case-/).length, somme(de(/^case-/))],
      decision: somme(de(/^(candidat|contrat)$/)), message: somme(de(/^msg-/)),
      groupes: [...new Set(S.ETAPES.map((e) => e.groupe))], poidsCase: S.ETAPES[0].poids };
  });
  egal([r.n, r.total, r.tri, r.decision, r.message], [22, 20, [15, 8], 7, 5], 'parts du barème');
  vrai(Math.abs(r.poidsCase - 8 / 15) < 1e-9, 'une case du tableau ne vaut pas 8/15');
  egal(r.groupes, ['Tableau de tri : la ligne de Yanis Morel', 'Tableau de tri : la ligne de Laura Petit', 'Tableau de tri : la ligne de Mehdi Benali',
    'Tableau de tri : la ligne de Thomas Girod', 'Tableau de tri : la ligne de Sabrina Lopez', 'Le candidat retenu', 'Le contrat choisi',
    'Message à Sophie : la raison', 'Message à Sophie : le ton et les informations'], 'les 9 lignes du bandeau');
});

await v('ENT-5.1 : somme des poids ≠ 20 → le moteur le dit à l’ouverture ; = 20 → la séance s’ouvre', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-animation.js');
    const essai = (poids) => {
      document.querySelector('#essaiPoids')?.remove();
      const hote = document.createElement('div'); hote.id = 'essaiPoids'; document.body.prepend(hote);
      const U = E.univers({ animations: [] });
      U.etapes = poids.map((p, i) => ({ id: 'p' + i, titre: 'P' + i, poids: p, verifier: () => ({ status: 'attente' }) }));
      const db = U.baseDeDepart();
      creerEntreprise(U).rendre(hote, { meta: { id: 'essai-poids', code: 'E-1', titre: 'E', portee: 'eleve', immersif: true, parcours: true, temps: 'guidage', bareme: 20 },
        profil: { prenom: 'Lea', nom: 'T', role: 'eleve', uid: 'u-p' }, jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null });
      const t = hote.textContent.replace(/\s+/g, ' ');
      hote.remove();
      return t;
    };
    return { faux: essai([10, 9]), juste: essai([10, 6, 4]) };
  });
  vrai(/somme des poids/.test(r.faux) && /19/.test(r.faux), 'poids 10 + 9 : le moteur ne dit rien : ' + r.faux.slice(0, 120));
  vrai(!/somme des poids/.test(r.juste), 'poids 10 + 6 + 4 : message à tort');
});

await v('ENT-5.1 : « Salut ! » fait aussi tomber la salutation ; la réponse se corrige (le dernier envoi compte)', async () => {
  await monter51({ uid: 'u-salut' });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51();
  await repondre51({ salutation: 'Salut !' });
  egal((await etapes51())['msg-salutation'], 'ko', 'salutation avec « Salut ! »');
  await repondre51();
  egal(await etapes51(), statuts('ok'), 'après correction');
  // La suite de l'histoire n'arrive qu'une fois.
  egal((await sujets51()).filter((s) => s.startsWith('RE :')).length, 1, 'réponse de Sophie en double');
});

await v('ENT-5.1 : une réponse libre au premier message n’ouvre pas la suite ; message sans envoi = ses 5 jalons jamais vrais', async () => {
  await monter51({ uid: 'u-libre' });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await pg.click(`${Z51} [data-repondre]`);
  await pg.fill(`${Z51} #formRep textarea`, 'Je retiens Yanis, CDD.');
  await pg.click(`${Z51} #formRep button[type="submit"]`);
  egal(await sujets51(), ['Recrutement du cariste de Noël'], 'aucun message ne doit arriver');
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51();
  // Phrases choisies mais pas envoyées.
  await ouvrirMail51('Ton choix pour le poste de cariste');
  await pg.click(`${Z51} [data-repondre]`);
  for (const [l, t] of Object.entries(PHR51)) await pg.selectOption(`${Z51} [data-phrase="${l}"]`, { label: t });
  const e = await etapes51();
  egal(MSG51.map((id) => e[id]), MSG51.map(() => 'attente'), 'message non envoyé');
  proche(await dernierScore51(), 15, 'score sans le message');
});

// ── Lots A et A bis du brief SMOBY-retours-classe-5.1 (07/10/2026) : bandeau ✓ / ✗, correction après le bilan ──
// Valeurs écrites à la main : tableau de tri 8 points (8/15 la case), candidat 5, contrat 2, message 5.
await v('ENT-5.1 : bandeau de fin — rien avant la réponse ; ensuite 9 lignes, la fausse en ✗, les autres en ✓, sans points ni réponse, « Corriger » proposé', async () => {
  await monter51({ uid: 'u-bandeau' });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51({ tri: flip51('laura', 'caces') });
  vrai(!(await pg.$(`${T51} [data-fin-seance] [data-fin]`)), 'bandeau affiché alors que le message n’est pas envoyé');
  await repondre51();
  const L = await bandeau51();
  egal(L.map((x) => x[0]), ['ok', 'ko', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'], 'états des 9 lignes');
  egal(L.map((x) => x[1].replace(/ (juste|à corriger)$/, '')), ['✓ Tableau de tri : la ligne de Yanis Morel', '✗ Tableau de tri : la ligne de Laura Petit',
    '✓ Tableau de tri : la ligne de Mehdi Benali', '✓ Tableau de tri : la ligne de Thomas Girod', '✓ Tableau de tri : la ligne de Sabrina Lopez',
    '✓ Le candidat retenu', '✓ Le contrat choisi', '✓ Message à Sophie : la raison', '✓ Message à Sophie : le ton et les informations'], 'coche ou croix, puis la ligne');
  const t = await pg.textContent(`${T51} [data-fin-seance]`);
  vrai(!/point|8\/15|0,5|19|CACES|caces/.test(t), 'le bandeau donne des points ou la réponse : ' + t.replace(/\s+/g, ' '));
  vrai(/Tu as fini : voici ce qui est juste et ce qui est à corriger/.test(t) && /Corriger améliore ta note/.test(t), 'texte du bandeau : ' + t.replace(/\s+/g, ' '));
  vrai(await pg.$(`${T51} [data-fin-corriger]`), 'pas de bouton « Corriger »');
  // Tout juste : « Tout est juste », 9 lignes en ✓, et PAS de bouton « Corriger ».
  await monter51({ uid: 'u-bandeau-ok' });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51();
  await repondre51();
  const ok = await bandeau51();
  vrai(ok.length === 9 && ok.every((x) => x[0] === 'ok' && /^✓/.test(x[1])), 'tout juste : ' + JSON.stringify(ok));
  vrai(/Tout est juste/.test(await pg.textContent(`${T51} [data-fin-seance]`)), '« Tout est juste » absent');
  vrai(!(await pg.$(`${T51} [data-fin-corriger]`)), 'bouton « Corriger » alors que tout est juste');
});

await v('ENT-5.1 : une case fausse n’enferme plus — la 5.2 s’ouvre au premier bilan, « Corriger » rouvre la fiche, le renvoi fait la moyenne et remplace la photo', async () => {
  const uid = 'u-corriger', gid = 'g-corriger';
  await monter51({ uid });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51({ tri: flip51('laura', 'caces') });
  vrai(!(await pg.evaluate(() => window.__51.db.points)), 'photo rangée avant le bilan complet');
  await repondre51();
  proche(await dernierScore51(), 20 - 8 / 15, 'premier bilan');
  // La photo est rangée alors qu'une étape est fausse : c'est elle qui ouvre ENT-5.2 (verrou de core/parcours.js).
  egal(await pg.evaluate(() => Object.keys(window.__51.db.points || {})), ['smoby-recrutement'], 'photo du premier bilan');
  const verrou = await pg.evaluate(async ({ uid, gid }) => {
    const { chargerActivites } = await import('/activites/index.js');
    const P = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const k = `prepalog:prive/${uid}/smoby-recrutement`;
    localStorage.setItem(k, JSON.stringify({ data: window.__51.db, ts: 1 }));
    try { return await P.verrou(metas, metas.find((x) => x.id === 'smoby-arrivee'), { role: 'eleve', uid }, gid); } finally { localStorage.removeItem(k); }
  }, { uid, gid });
  egal(verrou, null, '5.2 ouverte malgré la case fausse');
  // « Corriger » : la fiche se rouvre (ses 17 jalons repassent « à faire », le message garde les siens), le bandeau s'efface.
  await pg.click(`${T51} [data-fin-corriger]`);
  await pg.waitForSelector(`${F51} [data-fiche-envoyer]`);
  vrai(!(await pg.$(`${F51} [data-fiche-envoyee]`)), 'la fiche reste figée');
  vrai(await pg.$eval(`${F51} fieldset`, (f) => !f.disabled), 'la fiche reste désactivée');
  egal(await etapes51(), { ...Object.fromEntries(FICHE51.map((id) => [id, 'attente'])), ...Object.fromEntries(MSG51.map((id) => [id, 'ok'])) }, 'jalons pendant la correction');
  vrai(!(await pg.$(`${T51} [data-fin-seance] [data-fin]`)), 'le bandeau reste pendant la correction');
  // Ce que l'élève avait coché est gardé (il corrige, il ne recommence pas).
  vrai(await pg.$eval(`${F51} [data-ouinon="tri|yanis|caces|1"]`, (b) => b.getAttribute('aria-pressed') === 'true'), 'les cases cochées ont disparu');
  await pg.click(`${F51} [data-ouinon="tri|laura|caces|0"]`);
  await pg.click(`${F51} [data-fiche-envoyer]`);
  const oui = await pg.waitForSelector('[data-confirme-oui]');
  vrai(/renvoies ta fiche corrigée/.test(await oui.evaluate((b) => b.closest('[data-confirme]').textContent)), 'la confirmation ne parle pas de correction');
  await oui.click();
  await pg.waitForSelector(`${F51} [data-fiche-envoyee]`);
  egal(await etapes51(), statuts('ok'), 'après le renvoi');
  // Moyenne du premier bilan et de l'état actuel : (20 − 8/15 + 20) / 2.
  proche(await dernierScore51(), (20 - 8 / 15 + 20) / 2, 'note après correction');
  // Sophie accuse réception de la correction, sans rejouer son message ni dire si c'est juste.
  const sujets = await sujets51();
  vrai(sujets.includes('Fiche de sélection corrigée'), 'pas d’accusé de Sophie : ' + sujets.join(' | '));
  egal(sujets.filter((x) => x === 'Ton choix pour le poste de cariste').length, 1, 'Sophie redemande la réponse');
  const accuse = await pg.evaluate(() => window.__51.db.mails.find((m) => m.subject === 'Fiche de sélection corrigée').text);
  vrai(/j’ai bien reçu ta fiche corrigée/.test(accuse) && !/juste|faux|bravo/i.test(accuse), 'texte de l’accusé : ' + accuse);
  // La photo est REMPLACÉE : la suite part du travail corrigé.
  egal(await pg.evaluate(() => window.__51.db.points['smoby-recrutement'].fiches.selection.valeurs.tri.laura.caces), false, 'photo non remplacée');
  vrai(/Tout est juste/.test(await pg.textContent(`${T51} [data-fin-seance]`)), 'bandeau « Tout est juste » absent après la correction');
});

await v('ENT-5.1 : corriger le message — « Corriger » ouvre la réponse avec les choix de l’élève, le renvoi fait la moyenne, Sophie accuse réception', async () => {
  await monter51({ uid: 'u-corriger-msg' });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51();
  await repondre51({ fin: 'Bisous' });
  egal((await bandeau51()).map((x) => x[0]), ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ko'], 'seule la ligne du message est fausse');
  proche(await dernierScore51(), 19.5, 'premier bilan');
  await pg.click(`${T51} [data-fin-corriger]`);
  await pg.waitForSelector(`${Z51} #formPhr:not([hidden])`);
  // Les choix de l'élève sont là (jamais la bonne réponse) ; la fiche, elle, n'a pas bougé.
  egal(await pg.$eval(`${Z51} [data-phrase="fin"]`, (s) => s.selectedOptions[0].textContent.trim()), 'Bisous', 'brouillon prérempli');
  await pg.selectOption(`${Z51} [data-phrase="fin"]`, { label: PHR51.fin });
  await pg.click(`${Z51} #formPhr button[type="submit"]`);
  const oui = await pg.waitForSelector('[data-confirme-oui]');
  vrai(/renvoies ta réponse corrigée/.test(await oui.evaluate((b) => b.closest('[data-confirme]').textContent)), 'la confirmation ne parle pas de correction');
  await oui.click();
  egal(await etapes51(), statuts('ok'), 'après le renvoi');
  proche(await dernierScore51(), (19.5 + 20) / 2, 'note après correction');
  const sujets = await sujets51();
  vrai(sujets.includes('Ta réponse corrigée'), 'pas d’accusé de Sophie : ' + sujets.join(' | '));
  egal(sujets.filter((x) => x.startsWith('RE :')).length, 1, 'la suite de l’histoire est rejouée');
  egal(await pg.evaluate(() => window.__51.db.fiches.selection.envoye !== undefined), true, 'la fiche a été rouverte à tort');
});

await v('ENT-5.1 : règle de note — premier bilan avant toute correction ; la 1re correction fait la moyenne avec l’état de ce moment ; les suivantes sont comptées, la note ne bouge plus', async () => {
  await monter51({ uid: 'u-regle' });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51({ tri: flip51('laura', 'caces') });
  await repondre51({ fin: 'Bisous' });
  const bilan1 = 20 - 8 / 15 - 0.5;
  proche(await dernierScore51(), bilan1, 'avant toute correction = premier bilan');
  // 1re correction : la fiche. Le message est encore faux à ce moment-là : l'état vaut 20 − 0,5.
  await pg.click(`${T51} [data-fin-corriger]`);
  await pg.waitForSelector(`${F51} [data-fiche-envoyer]`);
  await pg.click(`${F51} [data-ouinon="tri|laura|caces|0"]`);
  await cliquerEtConfirmer(pg, `${F51} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F51} [data-fiche-envoyee]`);
  proche(await dernierScore51(), (bilan1 + 19.5) / 2, 'après la 1re correction = moyenne du premier bilan et de l’état de ce moment');
  // 2e correction : le message. Elle est comptée, la note ne bouge plus.
  await pg.click(`${T51} [data-fin-corriger]`);
  await pg.waitForSelector(`${Z51} #formPhr:not([hidden])`);
  await pg.selectOption(`${Z51} [data-phrase="fin"]`, { label: PHR51.fin });
  await cliquerEtConfirmer(pg, `${Z51} #formPhr button[type="submit"]`);
  egal(await etapes51(), statuts('ok'), 'tout est juste après la 2e correction');
  proche(await dernierScore51(), (bilan1 + 19.5) / 2, 'la note a bougé à la 2e correction');
  const r = await pg.evaluate(() => { const i = window.__51.db.indicateurs['smoby-recrutement']; return [i.corrections, Object.keys(i.bilan1).length, i.bilan2['msg-fin']]; });
  egal(r, [2, 22, 'ko'], 'corrections comptées, premier bilan et état de la 1re correction rangés');
});

await v('ENT-5.1 : « meilleur » — un élève du 07/10 (9/9) garde sa note quand le barème passe à celui de la séance ; une note plus basse n’écrase rien (démonstration)', async () => {
  // L'identifiant et le barème viennent de `meta` (chantier 13, 09/10/2026) : le cas suit la séance, il ne
  // garde en dur que l'ANCIEN barème (9 jalons), qui est de l'histoire. Les scores « nouveau barème » sont
  // écrits en proportion du barème courant (x / 20 de `bareme`), donc valables si `bareme` bouge.
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const { meta } = await import('/activites/smoby-recrutement.js');
    const g = 'g-meilleur', u = 'u-meilleur', a = meta.id, N = meta.bareme;
    const sur = (x) => x * N / 20;
    const lire = async () => (await B.lireScore(g, u, a)).meilleur;
    const o = { id: a, N };
    await B.poserNote(g, u, a, null);
    await B.ecrireScore(g, u, a, { score: 9, max: 9 });                 // ancienne règle : 9 jalons
    await B.ecrireScore(g, u, a, { score: sur(5), max: N });            // il rouvre : la fiche rouverte repasse « à faire »
    o.complet = await lire();
    await B.poserNote(g, u, a, null);
    await B.ecrireScore(g, u, a, { score: 6, max: 9 });
    await B.ecrireScore(g, u, a, { score: sur(10), max: N });           // 6/9 = 13,33 sur 20 : plus haut que 10
    o.partiel = await lire();
    await B.ecrireScore(g, u, a, { score: sur(17), max: N });
    o.monte = await lire();
    await B.ecrireScore(g, u, a, { score: sur(12), max: N });           // même barème : le plus haut reste
    o.garde = await lire();
    await B.poserNote(g, u, a, null);
    return o;
  });
  vrai(r.N > 0, 'barème de la séance mal lu : ' + JSON.stringify(r.N));
  vrai(Math.abs(r.complet - r.N) < 0.01, `9/9 devenu ${r.complet} sur ${r.N}`);
  vrai(Math.abs(r.partiel - r.N * 6 / 9) < 0.01, `6/9 devenu ${r.partiel} sur ${r.N}`);
  egal([r.monte, r.garde], [r.N * 17 / 20, r.N * 17 / 20], 'meilleur à barème constant');
});

// ── ENT-5.2 « l'arrivée de Yanis » (brief `docs/briefs/ENT-5.2-smoby-arrivee.md`) ─────────────────
// La séance réelle, montée par son activité (`activites/smoby-arrivee.js`). Les attendus (pièces, ordre,
// placements du planning, phrases) sont écrits À LA MAIN ici, d'après le brief, jamais relus dans le contenu.
// Les règles du planning sont éprouvées par le bloc `planning` (même cas « personnel ») : ici, le parcours.
const T52 = '#s52';
const Z52 = `${T52} .ent-main`;
const F52 = `${Z52} .ent-fiche`;
const monter52 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-arrivee.js');
  ['#smTest', '#s51', '#s52'].forEach((s) => document.querySelector(s)?.remove());
  const hote = document.createElement('div'); hote.id = 's52'; document.body.appendChild(hote);
  const db = {};
  window.__52 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-52' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__52.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null, suivante: { code: 'ENT-5.3', titre: 'La visite de la plateforme' },
  });
}, o);
const etapes52 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent52.js');
  return S.ETAPES.map((e) => e.verifier(window.__52.db).status);
});
const dernierScore52 = () => pg.evaluate(() => { const s = window.__52.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
const sujets52 = () => pg.evaluate(() => window.__52.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
const ouvrirMail52 = async (sujet) => {
  await pg.click(`${T52} .ent-nav[data-vue="mail"]`);
  await pg.click(`${Z52} [data-dossier="in"]`);
  await pg.click(`${Z52} .ent-obj:text-is("${sujet}")`);
};
const ACCUEIL52 = 'L’arrivée de Yanis';
// Les pièces à demander et le premier jour, écrits à la main d'après le brief (§4, étapes 1 et 2).
const PIECES52 = ['identite', 'vitale', 'rib', 'caces'];
const JOUR52 = ['accueil', 'epi', 'visite', 'autorisation', 'dechargement'];
// Remplit la fiche à l'écran : cases cochées, puis l'ordre voulu par les flèches ↑, puis l'envoi.
async function envoyerFiche52({ pieces = PIECES52, ordre = JOUR52 } = {}) {
  await ouvrirMail52(ACCUEIL52);
  await pg.click(`${Z52} .ent-lecteur button:has-text("Ouvrir la fiche d’arrivée")`);
  await pg.waitForSelector(F52);
  for (const p of pieces) await pg.check(`${F52} [data-fiche-case="pieces"][value="${p}"]`);
  for (let k = 0; k < ordre.length; k++) {
    for (;;) {
      const pos = await pg.$$eval(`${F52} [data-fiche-ordre="jour"] li`, (L, v) => L.findIndex((li) => li.dataset.v === v), ordre[k]);
      if (pos <= k) break;
      await pg.click(`${F52} li[data-v="${ordre[k]}"] [data-ordre-sens="-1"]`);
    }
  }
  await cliquerEtConfirmer(pg, `${F52} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F52} [data-fiche-envoyee]`);
}
// Le planning : jour = rang (lun 7 = 0 … ven 18 = 9). Une solution juste, écrite à la main et
// recontrôlée par le bloc `planning` (maquette v8) : Karim décalé au lun 7 (Karim et Léa le mer 16 =
// pas assez de monde) ; après l'arrêt d'Inès, le congé de Chloé passe au jeu 17.
const PL1 = [['form-mathis', 'mathis', 1], ['visite-ines', 'ines', 3], ['cp-chloe', 'chloe', 5], ['cp-karim', 'karim', 0], ['cp-lea', 'lea', 7]];
const PL2 = [['cp-chloe', 'chloe', 8], ['am-ines', 'ines', 5]];
async function poser52(id, r, t) {
  await pg.click(`${T52} .ent-nav[data-vue="planning"]`);
  await pg.click(`${Z52} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z52} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
}
async function envoyerPlanning52(L) {
  await pg.click(`${T52} .ent-nav[data-vue="planning"]`);
  for (const [id, r, t] of L) await poser52(id, r, t);
  await cliquerEtConfirmer(pg, `${Z52} [data-pl="envoyer"]`);
  if (await pg.$(`${Z52} [data-pl="quandMeme"]`)) await pg.click(`${Z52} [data-pl="quandMeme"]`);
}
const PHR52 = { salut: 'Bonjour Sophie,', constat: 'Chaque jour a assez de monde et au moins un cariste CACES.', fin: 'Peux-tu valider ? Merci, bonne journée.' };
async function repondre52(remplace = {}) {
  await ouvrirMail52('Le point sur le planning');
  await pg.click(`${Z52} [data-repondre]`);
  await pg.waitForSelector(`${Z52} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries({ ...PHR52, ...remplace })) await pg.selectOption(`${Z52} [data-phrase="${l}"]`, { label: t });
  await cliquerEtConfirmer(pg, `${Z52} #formPhr button[type="submit"]`);
}
// Les 25 jalons (barème du 07/10/2026), dans l'ordre : 0-7 les pièces, 8-11 les liens du premier jour (la fiche),
// 12-16 le 1er envoi du planning, 17-21 après l'imprévu, 22-24 le point à Sophie (constat, salutation, fin).
const N52 = 25;
const tous52 = (s) => Array(N52).fill(s);
const FICHE52 = [0, 12], V1_52 = [12, 17], V2_52 = [17, 22], MSG52 = [22, 25];
const tranche = (L, [a, b]) => L.slice(a, b);
// Les placements (jour = rang) d'une erreur au 1er envoi : Karim laissé à la date demandée (mer 16, rang 7), le même
// jour que Léa → pas assez de monde ce jour-là. Écrit à la main d'après la maquette v8 (cas « personnel »).
const PL1_FAUX = PL1.map((x) => (x[0] === 'cp-karim' ? ['cp-karim', 'karim', 7] : x));
const bandeau52 = () => pg.$$eval(`${T52} [data-fin-seance] [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finEtat, x.textContent.replace(/\s+/g, ' ').trim().replace(/^([✓✗])\s*/, '$1 ').replace(/ (juste|à corriger)$/, '')]));

await v('ENT-5.2 : déclaration (code, 2de, AGO-3.1 et 3.2, barème sur 20, correction, livrée fermée aux élèves), inscrite au registre après ENT-5.1', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-arrivee.js');
    const I = await import('/activites/index.js');
    const C = await import('/core/competences.js');
    const m = A.meta;
    const metas = (await Promise.all(I.ACTIVITES.map((f) => f()))).map((x) => x.meta);
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.pret, m.ouverture, m.portee, m.immersif, m.coeur, m.correction],
      comp: ['AGO-3.1', 'AGO-3.2'].every((c) => JSON.stringify(C).includes(c)),
      rang: metas.filter((x) => /^ENT-5\./.test(x.code)).map((x) => x.code) };
  });
  egal(r.m, ['smoby-arrivee', 'ENT-5.2', 'simulog', ['2de'], ['AGO-3.1', 'AGO-3.2'], ['D2', 'D3'], 'guidage', 20, true, 'prof', 'eleve', true, true, true], 'meta');
  vrai(r.comp, 'AGO-3.1 ou AGO-3.2 absente de core/competences.js');
  egal(r.rang.slice(0, 3), ['ENT-5.1', 'ENT-5.2', 'ENT-5.3'], 'rang dans le registre');
});

await v('ENT-5.2 : les attendus calculés sont ceux du brief ; l’ordre de départ n’a aucune étape à sa place ; la solution vaut 10 / 10 ; le corrigé se charge', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent52.js');
    const P = await import('/core/types/planning.js');
    const C = await import('/contenus/corriges/ENT-5.2.js');
    const place = (v) => Object.fromEntries(Object.entries(S.SOLUTION[v]).map(([id, s]) => [id, { r: id === 'am-ines' ? 'ines' : S.PLANNING.cartes.liste.concat(S.PLANNING.alea.ajoutCartes).find((c) => c.id === id).qui, s }]));
    const db = { plannings: { [S.PLANNING.id]: { v1: { place: place('v1') }, v2: { place: place('v2') } } } };
    const depart = S.FICHE.blocs.find((b) => b.type === 'ordre').choix.map((c) => c.v);
    return { pieces: S.PIECES_ATTENDUES, ordre: S.ORDRE_ATTENDU, depart, nPieces: S.PIECES.length,
      jalons: P.jalonsPlanning(db, S.PLANNING).ok, code: C.CORRIGE.code,
      items: C.CORRIGE.items.filter((it) => !/\(trame\)$/.test(String(it.etape))).length,
      trame: C.CORRIGE.items.filter((it) => /\(trame\)$/.test(String(it.etape))).length };
  });
  egal([r.pieces, r.ordre, r.nPieces], [PIECES52, JOUR52, 8], 'pièces et ordre attendus');
  vrai(r.depart.every((v, k) => v !== JOUR52[k]) && r.depart.slice().sort().join() === JOUR52.slice().sort().join(), `ordre de départ : ${r.depart}`);
  // Le corrigé de la trame (42 questions, déclarée le 06/10/2026) s'ajoute après les 5 calculés.
  egal([r.jalons, r.items, r.trame, r.code], [10, 5, 42, 'ENT-5.2'], 'solution jugée par le moteur, corrigé (écran, trame)');
});

await v('ENT-5.2 : à l’ouverture, un message de Sophie, la fiche et le planning au menu, Yanis étiqueté CDD ; aucun jalon (inaction 0 / 20)', async () => {
  await monter52();
  egal(await sujets52(), [ACCUEIL52], 'messages au départ');
  await ouvrirMail52(ACCUEIL52);
  const mots = await pg.$$eval(`${Z52} .ent-lecteur [data-lex]`, (L) => L.map((b) => b.textContent.trim()));
  vrai(mots.includes('CDD saisonnier'), `mots cliquables du message : ${mots.join(', ')}`);
  vrai(await pg.isVisible(`${Z52} .ent-lecteur button:has-text("Ouvrir la fiche d’arrivée")`), 'bouton de la fiche absent du message');
  egal(await pg.$$eval(`${T52} .ent-nav`, (L) => ['fiche', 'planning'].map((v) => L.some((b) => b.dataset.vue === v))), [true, true], 'entrées du menu');
  await pg.click(`${T52} .ent-nav[data-vue="planning"]`);
  const yanis = await pg.$$eval(`${Z52} .pl-res`, (L) => (L.find((x) => x.textContent.startsWith('Yanis')) || {}).textContent);
  egal(yanis, 'YanisCACES · CDD', 'ligne de Yanis dans le planning');
  const infos = await pg.$eval(`${Z52} .pl-gauche`, (g) => { const c = g.cloneNode(true); c.querySelectorAll('.lex-bulle').forEach((b) => b.remove()); return c.textContent.replace(/\s+/g, ' '); });
  vrai(infos.includes('Yanis · CACES · CDD saisonnier · arrive le mer 9') && !/Yanis[^·]*·[^·]*· intérimaire/.test(infos), 'Yanis pas dit en CDD dans les informations');
  egal(await etapes52(), tous52('attente'), 'étapes à l’ouverture');
  const s = await dernierScore52();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
});

await v('ENT-5.2 : parcours juste à l’écran → fiche, planning, imprévu, planning repris, point à Sophie : 20 / 20', async () => {
  await monter52();
  await envoyerFiche52();
  const f = await etapes52();
  egal([tranche(f, FICHE52), f[12]], [Array(12).fill('ok'), 'attente'], 'après la fiche');
  egal(await sujets52(), [ACCUEIL52, 'Le planning des présences'], 'Sophie passe au planning');
  await envoyerPlanning52(PL1);
  egal(await sujets52(), [ACCUEIL52, 'Le planning des présences', 'Changement : planning à reprendre'], 'l’imprévu arrive');
  vrai(await pg.$(`${Z52} [data-pl-id="am-ines"][data-pl-vue="b"]`), 'la carte de l’arrêt d’Inès n’est pas arrivée');
  vrai(await pg.$(`${Z52} [data-pl-case][data-r="noa"]`), 'la ligne de Noa n’est pas arrivée');
  const e1 = await etapes52();
  egal([tranche(e1, V1_52), tranche(e1, V2_52)], [Array(5).fill('ok'), Array(5).fill('attente')], '1er envoi');
  await envoyerPlanning52(PL2);
  egal(tranche(await etapes52(), V2_52), Array(5).fill('ok'), 'après l’imprévu');
  egal((await sujets52()).slice(-1), ['Le point sur le planning'], 'Sophie demande le point');
  await repondre52();
  egal(await etapes52(), tous52('ok'), 'après le point');
  proche(await dernierScore52(), 20, 'score remonté au suivi');
  egal((await sujets52()).slice(-1), ['RE : Le point sur le planning'], 'la suite de l’histoire');
  const E = await pg.evaluate(() => window.__52.db.mails.filter((m) => m.folder === 'out').map((m) => m.text));
  egal(E, ['Bonjour Sophie,\nJ’ai repris le planning après l’arrêt d’Inès.\nChaque jour a assez de monde et au moins un cariste CACES.\nPeux-tu valider ? Merci, bonne journée.'], 'message envoyé');
  const b = await bandeau52();
  vrai(b.length === 6 && b.every((x) => x[0] === 'ok'), 'bandeau tout juste : ' + JSON.stringify(b));
  vrai(!(await pg.$(`${T52} [data-fin-corriger]`)), '« Corriger » alors que tout est juste');
});

await v('ENT-5.2 : pièges de la fiche — chaque pièce est jugée seule, aucune case = toutes fausses, chaque lien du premier jour seul, l’ordre de départ ne vaut rien', async () => {
  // Pièces : identite, vitale, notes, rib, sang, caces, casier, parents (0-7). Liens : accueil→epi, epi→visite,
  // visite→autorisation, autorisation→dechargement (8-11). Écrit à la main d'après le brief.
  const ok = 'ok', ko = 'ko';
  const cas = [
    [{ pieces: [] }, [ko, ko, ko, ko, ko, ko, ko, ko, ok, ok, ok, ok]],
    [{ pieces: [...PIECES52, 'casier'] }, [ok, ok, ok, ok, ok, ok, ko, ok, ok, ok, ok, ok]],
    [{ pieces: ['identite', 'rib', 'caces'] }, [ok, ko, ok, ok, ok, ok, ok, ok, ok, ok, ok, ok]],
    [{ ordre: ['accueil', 'epi', 'autorisation', 'visite', 'dechargement'] }, [ok, ok, ok, ok, ok, ok, ok, ok, ok, ko, ko, ko]],
    [{ ordre: ['autorisation', 'dechargement', 'epi', 'accueil', 'visite'] }, [ok, ok, ok, ok, ok, ok, ok, ok, ko, ko, ko, ko]],
  ];
  for (const [fiche, attendu] of cas) {
    await monter52({ uid: 'u-52-' + JSON.stringify(fiche) });
    await envoyerFiche52(fiche);
    egal(tranche(await etapes52(), FICHE52), attendu, `fiche ${JSON.stringify(fiche)}`);
  }
  // Le bilan dit pourquoi (à l'enseignant) : l'ordre de départ, puis l'autorisation avant la visite.
  egal(await pg.evaluate(async () => (await import('/contenus/smoby-ent52.js')).ETAPES.find((e) => e.id === 'lien-accueil-epi').verifier(window.__52.db).detail),
    'L’ordre n’a pas été changé.', 'détail de l’ordre de départ');
});

await v('ENT-5.2 : rien touché, tout envoyé → 0 / 20 ; un constat faux fait tomber le constat seul', async () => {
  await monter52({ uid: 'u-52-rien' });
  await ouvrirMail52(ACCUEIL52);
  await pg.click(`${Z52} .ent-lecteur button:has-text("Ouvrir la fiche d’arrivée")`);
  await cliquerEtConfirmer(pg, `${F52} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F52} [data-fiche-envoyee]`);
  await envoyerPlanning52([]);
  await envoyerPlanning52([]);
  egal((await etapes52()).filter((s) => s === 'ok').length, 0, 'jalons vrais sans rien faire');
  await repondre52({ constat: 'Il manque du monde mardi 15.' });
  const e = await etapes52();
  egal([e.filter((s) => s === 'ok').length - 2, e[22]], [0, 'ko'], 'message au constat faux (salutation et fin justes)');
  proche(await dernierScore52(), 2, 'score : la salutation et la formule de fin, rien d’autre');
});

await v('ENT-5.2 : le barème — 25 jalons, parts 4 / 3 / 3,5 / 5,5 / 4, total 20, 6 lignes au bandeau', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent52.js');
    const somme = (L) => Math.round(L.reduce((t, e) => t + e.poids, 0) * 1e6) / 1e6;
    const de = (re) => S.ETAPES.filter((e) => re.test(e.id));
    return { n: S.ETAPES.length, total: somme(S.ETAPES), pieces: [de(/^piece-/).length, somme(de(/^piece-/))], liens: [de(/^lien-/).length, somme(de(/^lien-/))],
      v1: [de(/^v1-/).length, somme(de(/^v1-/))], v2: [de(/^v2-/).length, somme(de(/^v2-/))], msg: [de(/^msg-/).length, somme(de(/^msg-/))],
      groupes: [...new Set(S.ETAPES.map((e) => e.groupe))], ecrans: [...new Set(S.ETAPES.map((e) => e.ecran))] };
  });
  egal([r.n, r.total, r.pieces, r.liens, r.v1, r.v2, r.msg], [25, 20, [8, 4], [4, 3], [5, 3.5], [5, 5.5], [3, 4]], 'parts du barème');
  egal(r.groupes, ['Les pièces à demander à Yanis', 'Le premier jour de Yanis', 'Le planning : première version', 'Le planning : après l’imprévu',
    'Message à Sophie : le constat', 'Message à Sophie : le ton'], 'les 6 lignes du bandeau');
  egal(r.ecrans, ['fiche:arrivee', 'planning:smoby-presences', 'phrases:point-sophie'], 'écrans à rouvrir');
});

await v('Planning : un jalon est « à faire » jusqu’à l’envoi de sa version, puis juste ou FAUX (plus jamais « à faire » pour toujours)', async () => {
  await monter52({ uid: 'u-52-ko' });
  await envoyerFiche52();
  egal(tranche(await etapes52(), V1_52), Array(5).fill('attente'), 'avant le 1er envoi');
  await envoyerPlanning52(PL1_FAUX);
  const e = await etapes52();
  // Karim et Léa en congé le mer 16 : l'effectif manque ce jour-là (règle « effectif » et critère métier « congés »).
  egal(tranche(e, V1_52), ['ok', 'ok', 'ko', 'ok', 'ko'], '1er envoi avec Karim à la date demandée');
  egal(tranche(e, V2_52), Array(5).fill('attente'), 'version d’après l’imprévu pas encore envoyée');
});

await v('Planning : rouvrir — la 1re version fausse repart au temps 1 avec le planning envoyé, celle d’après l’aléa revient au renvoi ; la 2e seule fausse repart au temps 2 ; rien de faux → rien', async () => {
  const r = await pg.evaluate(async ({ PL1, PL1_FAUX, PL2 }) => {
    const S = await import('/contenus/smoby-ent52.js');
    const { creerPlanning } = await import('/core/types/planning.js');
    const place = (L) => Object.fromEntries(L.map(([id, rr, t]) => [id, { r: rr, s: t }]));
    const v2 = Object.assign(place(PL1), place(PL2));
    const o = {};
    let e = { phase: 'fini', place: {}, v1: { place: place(PL1_FAUX) }, v2: { place: v2 }, aleaVu: true, envois: [1, 2], finis: 1 };
    o.r1 = creerPlanning(S.PLANNING).rouvrir(e);
    o.e1 = { phase: e.phase, v1: e.v1, v2: e.v2, karim: e.place['cp-karim'].s, avant: !!e.v2Avant };
    e = { phase: 'fini', place: {}, v1: { place: place(PL1) }, v2: { place: Object.assign(place(PL1), { 'am-ines': { r: 'ines', s: 5 } }) }, aleaVu: true, envois: [1, 2], finis: 1 };
    o.r2 = creerPlanning(S.PLANNING).rouvrir(e);
    o.e2 = { phase: e.phase, v1: !!e.v1, v2: e.v2, chloe: e.place['cp-chloe'].s };
    e = { phase: 'fini', place: {}, v1: { place: place(PL1) }, v2: { place: v2 }, aleaVu: true, envois: [1, 2], finis: 1 };
    o.r3 = creerPlanning(S.PLANNING).rouvrir(e);
    o.e3 = e.phase;
    return o;
  }, { PL1, PL1_FAUX, PL2 });
  egal([r.r1, r.e1], [true, { phase: 1, v1: null, v2: null, karim: 7, avant: true }], '1re version fausse');
  egal([r.r2, r.e2], [true, { phase: 2, v1: true, v2: null, chloe: 5 }], '2e version seule fausse (Chloé au lun 14, jour de l’arrêt d’Inès)');
  egal([r.r3, r.e3], [false, 'fini'], 'rien de faux');
});

await v('ENT-5.2 : « Corriger » le planning — la 5.3 s’ouvre au premier bilan, la 1re version se rouvre, le renvoi des deux versions fait UNE correction, la moyenne, l’accusé du responsable', async () => {
  await monter52({ uid: 'u-52-corr' });
  await envoyerFiche52();
  await envoyerPlanning52(PL1_FAUX);
  // Au temps 2, Karim est remis au lun 7, puis l'imprévu est traité : la 2e version est juste.
  await envoyerPlanning52([['cp-karim', 'karim', 0], ...PL2]);
  await repondre52();
  const bilan1 = 20 - 2 * 0.7;
  proche(await dernierScore52(), bilan1, 'premier bilan');
  egal(await bandeau52(), [['ok', '✓ Les pièces à demander à Yanis'], ['ok', '✓ Le premier jour de Yanis'], ['ko', '✗ Le planning : première version'],
    ['ok', '✓ Le planning : après l’imprévu'], ['ok', '✓ Message à Sophie : le constat'], ['ok', '✓ Message à Sophie : le ton']], 'bandeau');
  egal(await pg.evaluate(() => Object.keys(window.__52.db.points || {})), ['smoby-arrivee'], 'photo du premier bilan (la 5.3 s’ouvre)');
  await pg.click(`${T52} [data-fin-corriger]`);
  await pg.waitForSelector(`${Z52} [data-pl-phase="1"]`);
  const e = await etapes52();
  egal([tranche(e, V1_52), tranche(e, V2_52)], [Array(5).fill('attente'), Array(5).fill('attente')], 'jalons du planning pendant la correction');
  vrai(!(await pg.$(`${T52} [data-fin-seance] [data-fin]`)), 'le bandeau reste pendant la correction');
  egal(await pg.evaluate(() => window.__52.db.plannings['smoby-presences'].place['cp-karim'].s), 7, 'le planning envoyé n’est pas rendu tel quel');
  await poser52('cp-karim', 'karim', 0);
  await cliquerEtConfirmer(pg, `${Z52} [data-pl="envoyer"]`);
  if (await pg.$(`${Z52} [data-pl="quandMeme"]`)) await pg.click(`${Z52} [data-pl="quandMeme"]`);
  // Retour au temps 2 avec la version d'après l'aléa que l'élève avait envoyée (l'arrêt d'Inès posé au lun 14).
  await pg.waitForSelector(`${Z52} [data-pl-phase="2"]`);
  egal(await pg.evaluate(() => window.__52.db.plannings['smoby-presences'].place['am-ines'].s), 5, 'la 2e version n’est pas revenue');
  egal(await pg.evaluate(() => window.__52.db.mails.filter((m) => m.subject === 'Changement : planning à reprendre').length), 1, 'l’imprévu est rejoué');
  await cliquerEtConfirmer(pg, `${Z52} [data-pl="envoyer"]`);
  egal(await etapes52(), tous52('ok'), 'après la correction');
  proche(await dernierScore52(), (bilan1 + 20) / 2, 'moyenne du premier bilan et de l’état à la 1re correction');
  const r = await pg.evaluate(() => ({ c: window.__52.db.indicateurs['smoby-arrivee'].corrections,
    accuse: window.__52.db.mails.filter((m) => m.subject === 'Planning corrigé').map((m) => m.text) }));
  egal(r.c, 1, 'corriger la 1re version (deux envois) compte pour une correction');
  vrai(r.accuse.length === 1 && /bien reçu ton planning corrigé/.test(r.accuse[0]) && !/juste|faux/i.test(r.accuse[0]), 'accusé : ' + JSON.stringify(r.accuse));
});

await v('ENT-5.2 : garde d’inaction (Q4 du brief SMOBY-notation) — le planning juste renvoyé tel quel après l’arrêt d’Inès ne rapporte rien', async () => {
  // Vérifié le 07/10/2026 : l'arrêt d'Inès ajoute une carte à poser, qu'un renvoi sans changement laisse de côté.
  await monter52({ uid: 'u-52-tel-quel' });
  await envoyerFiche52();
  await envoyerPlanning52(PL1);
  await envoyerPlanning52([]);
  egal(tranche(await etapes52(), V2_52), Array(5).fill('ko'), 'la version d’après l’imprévu');
});

await v('Charte rouge ou verte : l’accent reste au bandeau et au menu, la zone de travail passe à l’encre (Smoby, Spartoo, Boost sauf ses aplats bleus) ; Picard garde son bleu', async () => {
  const r = await pg.evaluate(async () => {
    const out = {};
    for (const [nom, f] of [['smoby', 'smoby-arrivee'], ['spartoo', 'spartoo'], ['boost', 'boost-ent32'], ['picard', 'picard-ent41']]) {
      let act;
      try { act = await import(`/activites/${f}.js`); } catch (e) { out[nom] = 'absente : ' + f; continue; }
      document.querySelector('#neutre')?.remove();
      const hote = document.createElement('div'); hote.id = 'neutre'; document.body.appendChild(hote);
      const db = {};
      act.rendre(hote, { meta: act.meta, profil: { prenom: 'Lea', nom: 'T', role: 'eleve', uid: 'u-n' }, jeu: { etat: () => db, sauver: () => {} },
        enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null, rendreCopie: async () => ({}) });
      const page = hote.querySelector('.ent-page'), main = hote.querySelector('.ent-main');
      const v = (el, k) => getComputedStyle(el).getPropertyValue(k).trim().toLowerCase();
      out[nom] = { classe: page.classList.contains('ent-travail-neutre'), menu: v(page, '--ardoise'), travail: v(main, '--ardoise') === v(main, '--encre'),
        fond: v(main, '--ardoise-fond') === v(main, '--encre') ? 'encre' : v(main, '--ardoise-fond') };
      hote.remove();
    }
    return out;
  });
  egal(r.smoby, { classe: true, menu: '#e40613', travail: true, fond: 'encre' }, 'Smoby');
  egal([r.spartoo.classe, r.spartoo.travail, r.spartoo.fond], [true, true, 'encre'], 'Spartoo');
  // Boost : le texte menthe passe à l'encre, les aplats bleus (le client) restent.
  egal([r.boost.classe, r.boost.travail, r.boost.fond], [true, true, '#345cfd'], 'Boost');
  egal([r.picard.classe, r.picard.travail, r.picard.fond], [false, false, '#0011ac'], 'Picard');
  // À l'écran : une case cochée d'ENT-5.2 a son contour à l'encre, plus en rouge.
  await monter52({ uid: 'u-52-encre' });
  await ouvrirMail52(ACCUEIL52);
  await pg.click(`${Z52} .ent-lecteur button:has-text("Ouvrir la fiche d’arrivée")`);
  await pg.check(`${F52} [data-fiche-case="pieces"][value="rib"]`);
  const c = await pg.$eval(`${F52} label:has([value="rib"])`, (l) => [getComputedStyle(l).borderTopColor, getComputedStyle(l.closest('.ent-main')).color]);
  egal(c[0], c[1], 'contour de la case cochée = couleur du texte');
});

// ── Lots 4 et 5 : quai sans froid, cariste au chariot, étape « Avant de décharger » ─────────────
// Le poste de contrôle d'aujourd'hui : total noté par Entrée, décision et motifs en boutons, « OK /
// Pas OK » de la sécurité en boutons. Les décisions justes sont écrites À LA MAIN ici.
const QZ = '#smTest .ent-main';
const allerQuai = async (o = {}) => {
  await monter(Object.assign({ quai: { securite: true } }, o));
  await pg.click('#smTest .ent-nav[data-vue="quai"]');
  await pg.waitForSelector(`${QZ} .quai`);
};
const etatQ = () => pg.evaluate(() => JSON.parse(JSON.stringify(Object.values(window.__s.db.quais || {})[0] || null)));
const jalonsQ = () => pg.evaluate(async () => {
  const { jalonsQuai } = await import('/core/types/quai.js');
  const E = await import('/outils/essai-2de.js');
  const Q = E.quaiSansFroid(window.__s.quaiOpts || {});
  return jalonsQuai(window.__s.db, Q).L.map((l) => [l.id, l.ok]);
});
const secu = (id, val) => pg.click(`${QZ} #qSecu-${id}-${val}`);
const toutBien = async () => { await secu('moteur', 'ok'); await secu('cale', 'ko'); await secu('niveleur', 'ok'); await secu('epi', 'ok'); };
const versControle = async () => {
  await pg.click(`${QZ} [data-q="decharger"]`);
  await pg.waitForSelector(`${QZ} [data-q-scene2]`);
  if (await pg.isVisible(`${QZ} [data-q="passer"]`)) await pg.click(`${QZ} [data-q="passer"]`);
  await pg.click(`${QZ} [data-q="vers3"]`);
  await pg.waitForSelector(`${QZ} [data-q-fiche]`);
};

await v('Sécurité : le quai s’ouvre sur l’étape ⓪, les suivantes sont fermées ; sans rien faire, aucun jalon de sécurité', async () => {
  await allerQuai();
  vrai(await pg.isVisible(`${QZ} [data-q-securite]`), 'l’étape ⓪ n’est pas affichée');
  const pas = await pg.$$eval(`${QZ} .quai-stepper button`, (B) => B.map((b) => [b.textContent.trim(), b.disabled]));
  egal(pas, [['⓪ Avant de décharger', false], ['① Le camion arrive', true], ['② Déchargement', true], ['③ Contrôle des palettes', true],
    ['④ Réserves et zone de réception', true]], 'étapes');
  const J = Object.fromEntries(await jalonsQ());
  egal([J.securiteSignalee, J.securiteConstat], [false, false], 'jalons de sécurité sans rien faire');
});

await v('Sécurité : décharger sans signaler → le chef de quai arrête l’élève (sans dire quoi) ; signaler après l’arrêt ne rattrape pas le jalon', async () => {
  await allerQuai();
  await toutBien();
  await pg.click(`${QZ} [data-q="commencer"]`);
  const arret = await pg.textContent(`${QZ} [data-q-secu-arret]`);
  vrai(/Stop/.test(arret) && !/cale/i.test(arret), `arrêt : ${arret}`);
  vrai(await pg.isVisible(`${QZ} [data-q-securite]`), 'l’élève a quitté l’étape ⓪');
  egal((await etatQ()).securite.fait, false, 'déchargement commencé');
  await pg.click(`${QZ} [data-q="signaler"]`);
  egal(await pg.textContent(`${QZ} [data-q-secu-chef]`), 'Le chef de quai : « Bien vu, je fais poser la cale. Tu peux décharger. »', 'réponse du chef');
  await pg.click(`${QZ} [data-q="commencer"]`);
  await pg.waitForSelector(`${QZ} [data-q="decharger"]:not([disabled])`);
  const J = Object.fromEntries(await jalonsQ());
  egal([J.securiteSignalee, J.securiteConstat], [false, true], 'jalons (signalé après l’arrêt, constat juste)');
});

await v('Sécurité : constat juste et signalé avant → deux jalons justes ; le constat se fige quand on commence', async () => {
  await allerQuai();
  await toutBien();
  await pg.click(`${QZ} [data-q="signaler"]`);
  await pg.click(`${QZ} [data-q="commencer"]`);
  await pg.waitForSelector(`${QZ} [data-q="decharger"]:not([disabled])`);
  const J = Object.fromEntries(await jalonsQ());
  egal([J.securiteSignalee, J.securiteConstat], [true, true], 'jalons');
  await pg.click(`${QZ} .quai-stepper button[data-n="0"]`);
  egal(await pg.$$eval(`${QZ} [data-q="secu"]`, (B) => B.length === 8 && B.every((b) => b.disabled)), true, 'réponses figées');
  egal(await pg.$$eval(`${QZ} [data-q="secu"][aria-checked="true"]`, (B) => B.map((b) => b.id)),
    ['qSecu-moteur-ok', 'qSecu-cale-ko', 'qSecu-niveleur-ok', 'qSecu-epi-ok'], 'réponses gardées');
});

await v('Sécurité : signaler un point juste (pas le danger) → réponse neutre, jalon faux ; un « pas OK » sur un point juste rend le constat faux', async () => {
  await allerQuai();
  await secu('moteur', 'ok'); await secu('cale', 'ok'); await secu('niveleur', 'ko'); await secu('epi', 'ok');
  await pg.click(`${QZ} [data-q="signaler"]`);
  egal(await pg.textContent(`${QZ} [data-q-secu-chef]`), 'Le chef de quai : « Je viens voir… Ce que tu me signales est en ordre. »', 'réponse du chef');
  const J = Object.fromEntries(await jalonsQ());
  egal([J.securiteSignalee, J.securiteConstat], [false, false], 'jalons');
});

await v('Sécurité : en évaluation, personne n’arrête l’élève ; le jalon reste faux', async () => {
  await allerQuai({ quai: { securite: true, evaluation: true } });
  await pg.click(`${QZ} [data-q="commencer"]`);
  await pg.waitForSelector(`${QZ} [data-q="decharger"]`);
  vrai(!(await pg.$(`${QZ} [data-q-secu-arret]`)), 'arrêt du chef de quai en évaluation');
  const J = Object.fromEntries(await jalonsQ());
  egal([J.securiteSignalee, J.securiteConstat], [false, false], 'jalons');
});

await v('Sans froid : ni ticket, ni jauge, ni afficheur, ni sonde, ni case température ; motifs restreints ; étape ④ en zone de réception', async () => {
  await allerQuai({ quai: { securite: false } });
  vrai(!(await pg.$(`${QZ} [data-q="ticket"]`)), 'bouton du ticket');
  vrai(!(await pg.$(`${QZ} .quai-h-froid`)), 'jauge du temps hors froid');
  vrai(!/frigorifique/.test(await pg.textContent(`${QZ} .quai-tete`)), 'camion frigorifique dans la tête');
  await pg.click(`${QZ} [data-q="decharger"]`);
  await pg.waitForSelector(`${QZ} [data-q-scene2]`);
  vrai(!(await pg.$(`${QZ} [data-q-afficheur]`)), 'afficheur de température');
  if (await pg.isVisible(`${QZ} [data-q="passer"]`)) await pg.click(`${QZ} [data-q="passer"]`);
  await pg.click(`${QZ} [data-q="vers3"]`);
  await pg.waitForSelector(`${QZ} [data-q-fiche]`);
  vrai(!(await pg.$(`${QZ} [data-q="sonder"]`)), 'bouton de la sonde');
  egal(await pg.$$eval(`${QZ} [data-q-fiche-k]`, (I) => I.map((i) => i.dataset.qFicheK)), ['ref', 'endo', 'manq'], 'cases de la fiche');
  await pg.click(`${QZ} #qDec-reserves`);
  egal(await pg.$$eval(`${QZ} [data-q="motif"]`, (B) => B.map((b) => b.dataset.v)), ['avarie', 'manquant'], 'motifs proposés');
  const J = (await jalonsQ()).map(([id]) => id);
  vrai(!J.some((id) => /^ticket|securite/.test(id)), `jalons du ticket ou de la sécurité : ${J.join(', ')}`);
});

await v('Sans froid : une décision juste n’exige pas la sonde ; parcours complet, lot rentré en zone de réception, sans le « froid d’abord »', async () => {
  await allerQuai({ quai: { securite: false } });
  await versControle();
  const JUSTE = [['P1', 24, 'accepter'], ['P2', 24, 'accepter'], ['P3', 20, 'reserves', 'avarie'], ['P4', 22, 'reserves', 'manquant']];
  for (const [n, [id, c, d, m]] of JUSTE.entries()) {
    await pg.click(`${QZ} [data-q="sel"][data-n="${n}"]`);
    await pg.fill(`${QZ} [data-q-compte]`, String(c)); await pg.press(`${QZ} [data-q-compte]`, 'Enter');
    await pg.click(`${QZ} #qDec-${d}`);
    if (m) await pg.click(`${QZ} #qMot-${m}`);
    egal(await pg.textContent(`${QZ} [data-q="sel"][data-n="${n}"]`), `${id}comptée, décidée`, `onglet de ${id}`);
  }
  await pg.click(`${QZ} [data-q="vers4"]`);
  if (await pg.$(`${QZ} [data-q="vers4"].quai-arme`)) await pg.click(`${QZ} [data-q="vers4"]`);
  await pg.waitForSelector(`${QZ} [data-q="rentrer"]`);
  egal((await pg.textContent(`${QZ} [data-q="rentrer"]`)).replace(/\s+/g, ' ').trim(), 'Rentrer les palettes acceptées en zone de réception · 3 min de manutention', 'bouton rentrer');
  // Écrire avant de rentrer : sans froid, le chef de quai ne dit pas « le froid d'abord ».
  await pg.fill(`${QZ} #qRes-P3`, '1');
  await pg.fill(`${QZ} #qRes-P4`, '2');
  await pg.click(`${QZ} [data-q="ecrire"]`);
  vrai(!(await pg.$(`${QZ} [data-q-chef]`)), 'le chef de quai parle du froid');
  await pg.click(`${QZ} [data-q="rentrer"]`);
  await pg.click(`${QZ} [data-q="signer"]`);
  await pg.click(`${QZ} [data-q="clore"]`);
  if (await pg.$(`${QZ} [data-q="clore"].quai-arme`)) await pg.click(`${QZ} [data-q="clore"]`);
  const J = await jalonsQ();
  egal(J.filter(([, ok]) => !ok), [], 'jalons faux');
  egal(J.map(([id]) => id).slice(-1), ['rentre'], 'dernier jalon');
  await pg.waitForSelector(`${QZ} [data-q-bilan]`);
  egal(await pg.textContent(`${QZ} [data-q-bilan] tr[data-jalon="rentre"] td`), 'Palettes rentrées en zone de réception', 'libellé du jalon');
  vrai(!/hors froid/.test(await pg.textContent(`${QZ} .quai`)), 'l’écran parle du temps hors froid');
});

await v('Sans froid : une décision fausse reste fausse (sabotage du parcours juste)', async () => {
  await allerQuai({ quai: { securite: false } });
  await versControle();
  await pg.click(`${QZ} [data-q="sel"][data-n="2"]`);
  await pg.fill(`${QZ} [data-q-compte]`, '20'); await pg.press(`${QZ} [data-q-compte]`, 'Enter');
  await pg.click(`${QZ} #qDec-accepter`);
  const J = Object.fromEntries(await jalonsQ());
  egal([J['P3-comptage'], J['P3-decision']], [true, false], 'P3 acceptée sans réserve');
});

await v('Chariot : un cariste sort les palettes au chariot élévateur (légende) ; mouvement réduit : tout est posé d’un coup', async () => {
  await allerQuai({ quai: { securite: false } });
  await pg.click(`${QZ} [data-q="decharger"]`);
  await pg.waitForFunction((z) => /Yanis sort la palette P1 au chariot/.test((document.querySelector(`${z} [data-q-leg]`) || {}).textContent || ''), QZ, { timeout: 6000 });
  // Le chariot (carrosserie jaune #e0a514) est dessiné, pas le transpalette (#d9a514).
  const mob = await pg.$eval(`${QZ} [data-g="mobile"]`, (g) => g.innerHTML);
  vrai(mob.includes('#e0a514') && !mob.includes('#d9a514'), 'le chariot n’est pas dessiné');
  await pg.emulateMedia({ reducedMotion: 'reduce' });
  try {
    await allerQuai({ quai: { securite: false } });
    await pg.click(`${QZ} [data-q="decharger"]`);
    await pg.waitForSelector(`${QZ} [data-q-nb]`);
    egal(await pg.textContent(`${QZ} [data-q-nb]`), '4 / 4', 'palettes posées');
  } finally { await pg.emulateMedia({ reducedMotion: null }); }
});

await v('Sans froid : la note d’évaluation n’a pas de points de temps hors froid', async () => {
  const n = await pg.evaluate(async () => {
    const { noteQuai } = await import('/core/types/quai.js');
    const E = await import('/outils/essai-2de.js');
    const Q = Object.assign(E.quaiSansFroid({ securite: false, evaluation: true }), { note: { reception: 15, horsFroid: [[20, 3]], reel: [[12, 2]] } });
    const r = noteQuai({}, Q);
    return { max: r.max, sansFroid: r.sansFroid };
  });
  egal(n, { max: 17, sansFroid: true }, 'note');
});

// ── ENT-5.4 « premier déchargement » (brief `docs/briefs/ENT-5.4-smoby-reception.md`) ─────────────
// La séance réelle, montée par son activité (`activites/smoby-reception.js`). Les attendus sont écrits À
// LA MAIN d'après le brief : réels 8 / 45 / 36 / 34 ; P3 réserves 1 carton écrasé ; P4 réserves 2 manquants.
const T54 = '#s54';
const Z54 = `${T54} .ent-main`;
const monter54 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-reception.js');
  for (const id of ['smTest', 's51', 's54']) document.getElementById(id)?.remove();
  const hote = document.createElement('div'); hote.id = 's54'; document.body.appendChild(hote);
  const db = {};
  window.__54 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: o.uid || 'u-54' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__54.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
  });
}, o);
// Lot 2 de SMOBY-notation-5.3-5.8 (07/10/2026) : 16 jalons, barème sur 20 ; la signature ne compte pas.
const DIX = ['securite-signalee', 'securite-constat', 'P1-decision', 'P1-comptage', 'P2-decision', 'P2-comptage', 'P3-decision',
  'P3-comptage', 'P4-decision', 'P4-comptage', 'P3-reserve', 'P4-reserve', 'signature', 'message-reserves', 'message-salutation', 'message-fin'];
const POIDS54 = { 'securite-signalee': 3, 'securite-constat': 1, 'P1-decision': 1.25, 'P1-comptage': 0.75, 'P2-decision': 1.25,
  'P2-comptage': 0.75, 'P3-decision': 1.25, 'P3-comptage': 0.75, 'P4-decision': 1.25, 'P4-comptage': 0.75, 'P3-reserve': 2, 'P4-reserve': 2,
  signature: 0, 'message-reserves': 3, 'message-salutation': 0.5, 'message-fin': 0.5 };
const note54 = (ko = []) => 20 - ko.reduce((t, id) => t + POIDS54[id], 0);
const bandeau54 = () => pg.$$eval(`${T54} [data-fin-seance] [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finEtat, x.textContent.replace(/\s+/g, ' ').trim().replace(/^([✓✗])\s*/, '$1 ').replace(/ (juste|à corriger)$/, '')]));
const texteFin54 = () => pg.$eval(`${T54} [data-fin-seance] [data-fin]`, (b) => b.textContent.replace(/\s+/g, ' '));
const etapes54 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent54.js');
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, e.verifier(window.__54.db).status]));
});
const dernierScore54 = () => pg.evaluate(() => { const s = window.__54.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
const sujets54 = () => pg.evaluate(() => window.__54.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
const SECU54 = { cale: 'ko', moteur: 'ok', chauffeur: 'ok', niveleur: 'ok', plancher: 'ok', epi: 'ok' };
const JUSTE54 = { P1: [8, 'accepter'], P2: [45, 'accepter'], P3: [36, 'reserves', 'avarie'], P4: [34, 'reserves', 'manquant'] };
const PHR54 = { salutation: 'Bonjour Bruno,', reserves: 'Réserves : 1 carton écrasé sur l’établi Black+Decker et 2 porteurs manquants.',
  fin: 'Bonne fin de journée, Yanis' };
async function auQuai54() {
  await pg.click(`${T54} .ent-nav[data-vue="quai"]`);
  await pg.waitForSelector(`${Z54} [data-q-securite]`);
}
// L'étape ⓪ : le constat, puis signaler AVANT de commencer (ou commencer d'abord : arrêt du chef de quai).
async function securite54({ constat = SECU54, signalerAvant = true } = {}) {
  for (const [id, val] of Object.entries(constat)) await pg.click(`${Z54} #qSecu-${id}-${val}`);
  if (signalerAvant) await pg.click(`${Z54} [data-q="signaler"]`);
  await pg.click(`${Z54} [data-q="commencer"]`);
  if (!signalerAvant) {
    await pg.waitForSelector(`${Z54} [data-q-secu-arret]`);
    await pg.click(`${Z54} [data-q="signaler"]`);
    await pg.click(`${Z54} [data-q="commencer"]`);
  }
  await pg.waitForSelector(`${Z54} [data-q="decharger"]:not([disabled])`);
}
async function decharger54() {
  await pg.click(`${Z54} [data-q="decharger"]`);
  await pg.waitForSelector(`${Z54} [data-q-scene2]`);
  if (await pg.isVisible(`${Z54} [data-q="passer"]`)) await pg.click(`${Z54} [data-q="passer"]`);
  await pg.click(`${Z54} [data-q="vers3"]`);
  await pg.waitForSelector(`${Z54} [data-q-fiche]`);
}
async function controler54(decisions = JUSTE54) {
  for (const [n, id] of ['P1', 'P2', 'P3', 'P4'].entries()) {
    const [c, d, m] = decisions[id];
    await pg.click(`${Z54} [data-q="sel"][data-n="${n}"]`);
    await pg.fill(`${Z54} [data-q-compte]`, String(c)); await pg.press(`${Z54} [data-q-compte]`, 'Enter');
    await pg.click(`${Z54} #qDec-${d}`);
    if (m) await pg.click(`${Z54} #qMot-${m}`);
  }
  await pg.click(`${Z54} [data-q="vers4"]`);
  if (await pg.$(`${Z54} [data-q="vers4"].quai-arme`)) await pg.click(`${Z54} [data-q="vers4"]`);
  await pg.waitForSelector(`${Z54} [data-q="rentrer"]`);
}
async function papiers54(reserves = { P3: 1, P4: 2 }) {
  for (const [id, n] of Object.entries(reserves)) if (await pg.$(`${Z54} #qRes-${id}`)) await pg.fill(`${Z54} #qRes-${id}`, String(n));
  await pg.click(`${Z54} [data-q="ecrire"]`);
  await pg.click(`${Z54} [data-q="rentrer"]`);
  await pg.click(`${Z54} [data-q="signer"]`);
}
async function repondre54(remplace = {}) {
  await pg.click(`${T54} .ent-nav[data-vue="mail"]`);
  await pg.click(`${Z54} [data-dossier="in"]`);
  await pg.click(`${Z54} .ent-obj:text-is("La navette d’Arinthod")`);
  await pg.click(`${Z54} [data-repondre]`);
  await pg.waitForSelector(`${Z54} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries({ ...PHR54, ...remplace })) await pg.selectOption(`${Z54} [data-phrase="${l}"]`, { label: t });
  await cliquerEtConfirmer(pg, `${Z54} #formPhr button[type="submit"]`);
}
async function parcours54({ uid, secu = {}, decisions, reserves, phrases } = {}) {
  await monter54({ uid });
  await auQuai54();
  await securite54(secu);
  await decharger54();
  await controler54(decisions);
  await papiers54(reserves);
  await repondre54(phrases);
}
const statuts54 = (ko = []) => Object.fromEntries(DIX.map((id) => [id, ko.includes(id) ? 'ko' : 'ok']));

await v('ENT-5.4 : déclaration (code, 2de, C1.2 et C1.4, sur 20, correction, livrée fermée aux élèves), photos du quai de Smoby servies', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-reception.js');
    const I = await import('/activites/index.js');
    const S = await import('/contenus/smoby-ent54.js');
    const m = A.meta, Q = S.QUAI_ENT54;
    const urls = [Q.photos.arrivee, Q.photos.quai, Q.securite.photo];
    const st = await Promise.all(urls.map((u) => fetch(u).then((x) => [u, x.status, x.headers.get('content-type')])));
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.correction, m.pret, m.ouverture, m.portee],
      st, inscrite: (await Promise.all(I.ACTIVITES.map((f) => f()))).some((x) => x.meta.id === 'smoby-reception') };
  });
  egal(r.m, ['smoby-reception', 'ENT-5.4', 'simulog', ['2de'], ['C1.2', 'C1.4'], ['D4', 'D5'], 'guidage', 20, true, true, 'prof', 'eleve'], 'meta');
  egal(r.st, [['./contenus/smoby/quai-remorques.jpg', 200, 'image/jpeg'], ['./contenus/smoby/quai-interieur.jpg', 200, 'image/jpeg'],
    ['./contenus/smoby/quai-exterieur.jpg', 200, 'image/jpeg']], 'photos');
  vrai(r.inscrite, 'séance absente du registre');
});

await v('ENT-5.4 : le barème — 16 jalons dont la signature non notée, parts 3 / 1 / 2 × 4 / 2 / 2 / 3 / 1, total 20, 10 lignes au bandeau', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent54.js');
    const notes = S.ETAPES.filter((e) => e.compte !== false);
    const somme = (L) => Math.round(L.reduce((t, e) => t + e.poids, 0) * 1e6) / 1e6;
    const groupes = [...new Set(notes.map((e) => e.groupe))];
    return { ids: S.ETAPES.map((e) => e.id), horsNote: S.ETAPES.filter((e) => e.compte === false).map((e) => e.id), total: somme(notes), groupes,
      parts: groupes.map((g) => somme(notes.filter((e) => e.groupe === g))),
      poids: Object.fromEntries(notes.map((e) => [e.id, e.poids])),
      ecrans: [...new Set(S.ETAPES.map((e) => e.ecran).filter(Boolean))], avecEcran: S.ETAPES.filter((e) => e.ecran).map((e) => e.id) };
  });
  egal(r.ids, DIX, 'les 16 jalons, dans l’ordre');
  egal(r.horsNote, ['signature'], 'la signature sort de la note (Q3)');
  egal(r.total, 20, 'total');
  egal(r.groupes, ['Sécurité : la cale signalée', 'Sécurité : le constat', 'Palette P1', 'Palette P2', 'Palette P3', 'Palette P4',
    'Réserve de la palette P3', 'Réserve de la palette P4', 'Compte rendu : les réserves', 'Compte rendu : le ton'], 'les 10 lignes du bandeau');
  egal(r.parts, [3, 1, 2, 2, 2, 2, 2, 2, 3, 1], 'parts par ligne');
  egal(r.poids, Object.fromEntries(Object.entries(POIDS54).filter(([k]) => k !== 'signature')), 'poids de chaque case');
  egal(r.ecrans, ['phrases:compte-rendu-bruno'], 'seul le compte rendu se rouvre (Q2)');
  egal(r.avecEcran, ['message-reserves', 'message-salutation', 'message-fin'], 'jalons qui se corrigent');
});

await v('ENT-5.4 : les attendus calculés sont ceux du brief (réels, réserves, phrase juste) et le corrigé les reprend', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent54.js');
    const { jalonsQuai } = await import('/core/types/quai.js');
    const C = (await import('/contenus/corriges/ENT-5.4.js')).CORRIGE;
    const L = jalonsQuai({}, S.QUAI_ENT54).L;
    return { reels: L.filter((l) => /-comptage$/.test(l.id)).map((l) => l.attendu),
      reserves: L.filter((l) => /-reserve$/.test(l.id)).map((l) => [l.id, l.attendu]),
      ligne: S.LIGNE_RESERVES, corrige: C.items.map((i) => i.reponses || i.rep) };
  });
  egal(r.reels, ['8 cartons (BL : 8)', '45 cartons (BL : 45)', '36 cartons (BL : 36)', '34 cartons (BL : 36)'], 'cartons réels');
  egal(r.reserves, [['P3-reserve', 'P3 SMB-EBD : acceptée sous réserve — 1 carton endommagé (écrasé).'],
    ['P4-reserve', 'P4 SMB-PLS : acceptée sous réserve — manque 2 cartons (BL 36, reçu 34).']], 'réserves attendues');
  egal(r.ligne, 'Réserves : 1 carton écrasé sur l’établi Black+Decker et 2 porteurs manquants.', 'phrase juste');
  egal(r.corrige[0][0], ['Camion calé (cale ou bloqueur de roue)', 'Pas OK → signaler'], 'corrigé : la cale, sans marque de mot cliquable');
  egal(r.corrige[1].map((l) => [l[0], l[3], l[5]]), [['P1', '8 (2 × 2 × 2)', 'Accepter — aucun motif'], ['P2', '45 (4 × 3 × 4 − 3)', 'Accepter — aucun motif'],
    ['P3', '36 (4 × 3 × 3)', 'Accepter avec réserves — Cartons endommagés'], ['P4', '34 (3 × 3 × 4 − 2)', 'Accepter avec réserves — Manquant']], 'corrigé : palettes');
  vrai(r.corrige[3].includes(r.ligne), 'corrigé : message');
});

await v('ENT-5.4 : à l’ouverture, le message de Bruno seul, aucun jalon vrai : l’inaction vaut 0', async () => {
  await monter54();
  egal(await sujets54(), ['Ton premier camion à 14 h 00'], 'messages au départ');
  egal(await etapes54(), Object.fromEntries(DIX.map((id) => [id, 'attente'])), 'étapes à l’ouverture');
  const s = await dernierScore54();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
});

await v('ENT-5.4 : parcours juste à l’écran → 20 / 20, bandeau tout juste, réponse de Bruno ; rien de froid ; déchargement sur le décor fixe de Smoby', async () => {
  await monter54();
  await auQuai54();
  egal(await pg.$eval(`${Z54} [data-q-securite] img`, (i) => i.getAttribute('src')), './contenus/smoby/quai-exterieur.jpg', 'photo de l’étape ⓪');
  await securite54();
  vrai(!(await pg.$(`${Z54} [data-q="ticket"]`)) && !(await pg.$(`${Z54} .quai-h-froid`)), 'ticket ou jauge du froid');
  await pg.click(`${Z54} [data-q="decharger"]`);
  await pg.waitForSelector(`${Z54} [data-q-scene2]`);
  const sc = await pg.$eval(`${Z54} [data-q-scene2]`, (s) => ({ img: s.querySelector('image').getAttribute('href'), sol: !!s.querySelector('[data-q-sol] rect'),
    porte: s.querySelector('[data-g="porte"]').innerHTML, remorque: s.querySelector('[data-g="remorque"]').innerHTML,
    afficheur: !!s.querySelector('[data-q-afficheur]') }));
  egal(sc, { img: './contenus/smoby/quai-interieur.jpg', sol: true, porte: '', remorque: '', afficheur: false }, 'scène du déchargement');
  await pg.waitForFunction((z) => /Yanis (entre dans la remorque|sort la palette)/.test((document.querySelector(`${z} [data-q-leg]`) || {}).textContent || ''), Z54);
  if (await pg.isVisible(`${Z54} [data-q="passer"]`)) await pg.click(`${Z54} [data-q="passer"]`);
  await pg.click(`${Z54} [data-q="vers3"]`);
  await pg.waitForSelector(`${Z54} [data-q-fiche]`);
  vrai(!(await pg.$(`${Z54} [data-q="sonder"]`)), 'sonde');
  egal(await pg.$$eval(`${Z54} [data-q-fiche-k]`, (I) => I.map((i) => i.dataset.qFicheK)), ['ref', 'endo', 'manq'], 'cases de la fiche');
  await controler54();
  await papiers54();
  egal(await sujets54(), ['Ton premier camion à 14 h 00', 'La navette d’Arinthod'], 'Bruno demande le compte rendu après la signature');
  await repondre54();
  egal(await etapes54(), statuts54(), 'étapes');
  proche(await dernierScore54(), 20, 'score remonté au suivi');
  vrai((await sujets54()).includes('RE : La navette d’Arinthod'), 'la réponse de Bruno n’arrive pas');
  const b = await bandeau54();
  vrai(b.length === 10 && b.every((x) => x[0] === 'ok'), 'bandeau tout juste : ' + JSON.stringify(b));
  vrai(!(await pg.$(`${T54} [data-fin-corriger]`)), 'bouton « Corriger » alors que tout est juste');
});

await v('ENT-5.4 : décor fixe — légende sans porte qui se lève, étiquette sans date de consommation, aucun mot du froid au quai', async () => {
  await monter54({ uid: 'u-54-decor' });
  await auQuai54();
  await securite54();
  await pg.click(`${Z54} [data-q="decharger"]`);
  await pg.waitForFunction((z) => /entre dans la remorque/.test((document.querySelector(`${z} [data-q-leg]`) || {}).textContent || ''), Z54);
  egal((await pg.textContent(`${Z54} [data-q-leg]`)).replace(/^[^—]*— /, ''), 'Yanis entre dans la remorque au chariot.', 'légende du début');
  if (await pg.isVisible(`${Z54} [data-q="passer"]`)) await pg.click(`${Z54} [data-q="passer"]`);
  await pg.click(`${Z54} [data-q="vers3"]`);
  await pg.waitForSelector(`${Z54} [data-q-fiche]`);
  await pg.click(`${Z54} [data-q-etiq] >> nth=-1`);
  const etiq = await pg.textContent(`${Z54} [data-q-etiquette]`);
  vrai(/Lot : ARI-26-4812/.test(etiq) && !/consommer/.test(etiq), `étiquette : ${etiq}`);
  vrai(!/froid|°C/i.test(await pg.textContent(`${Z54} .quai`)), 'un mot du froid au quai');
});

await v('ENT-5.4 : décharger sans signaler → arrêt du chef de quai, la cale fausse même après avoir signalé (17 / 20) ; rien à rouvrir : pas de « Corriger »', async () => {
  await monter54({ uid: 'u-54-arret' });
  await auQuai54();
  await securite54({ signalerAvant: false });
  await pg.click(`${Z54} .quai-stepper button[data-n="0"]`);
  egal(await pg.textContent(`${Z54} [data-q-secu-chef]`), 'Le chef de quai : « Bien vu ! Je fais poser la cale. C’est bon, tu peux décharger. »', 'réponse du chef');
  await pg.click(`${Z54} .quai-stepper button[data-n="1"]`);
  await decharger54(); await controler54(); await papiers54(); await repondre54();
  egal(await etapes54(), statuts54(['securite-signalee']), 'étapes');
  proche(await dernierScore54(), 17, 'score');
  egal((await bandeau54()).filter((x) => x[0] === 'ko').map((x) => x[1]), ['✗ Sécurité : la cale signalée'], 'bandeau');
  const t = await texteFin54();
  vrai(!(await pg.$(`${T54} [data-fin-corriger]`)), 'bouton « Corriger » alors que seul le quai est faux (il ne se rouvre pas)');
  vrai(/Le camion est reparti : le BL ne se corrige plus\./.test(t) && /Tu peux passer à la séance suivante/.test(t)
    && !/Tu peux corriger/.test(t), 'texte du bandeau : ' + t);
});

await v('ENT-5.4 : le texte de l’arrêt du chef de quai est celui du brief', async () => {
  await monter54({ uid: 'u-54-stop' });
  await auQuai54();
  for (const [id, val] of Object.entries(SECU54)) await pg.click(`${Z54} #qSecu-${id}-${val}`);
  await pg.click(`${Z54} [data-q="commencer"]`);
  egal(await pg.textContent(`${Z54} [data-q-secu-arret]`), 'Le chef de quai : « Stop ! Le camion n’est pas calé : il peut bouger pendant que tu es dedans. »', 'arrêt');
  egal((await etapes54())['securite-signalee'], 'ko', 'jalon 1 après l’arrêt');
});

await v('ENT-5.4 : chaque piège fait tomber sa case seule (constat, P2 refusée, P3 acceptée sans le tour, P4 comptée 36 mais bien décidée, réserves, message)', async () => {
  const cas = [
    [['securite-constat'], { secu: { constat: { ...SECU54, epi: 'ko' } } }],
    // Une palette refusée demande sa ligne de réserve (le chauffeur ne signe pas une réserve vide). Le comptage reste juste.
    [['P2-decision'], { decisions: { ...JUSTE54, P2: [45, 'refuser', 'manquant'] }, reserves: { P2: 3, P3: 1, P4: 2 } }],
    [['P3-decision', 'P3-reserve'], { decisions: { ...JUSTE54, P3: [36, 'accepter'] } }],
    // Comptage et décision séparés : la décision juste garde ses points malgré le comptage faux.
    [['P4-comptage'], { decisions: { ...JUSTE54, P4: [36, 'reserves', 'manquant'] } }],
    [['P4-reserve'], { reserves: { P3: 1, P4: 1 } }],
    [['message-reserves'], { phrases: { reserves: 'Tout est conforme.' } }],
    [['message-reserves'], { phrases: { reserves: 'Réserves : 2 cartons écrasés.' } }],
    [['message-salutation', 'message-fin'], { phrases: { salutation: 'Salut !', fin: 'Bisous' } }],
  ];
  for (const [n, [ko, o]] of cas.entries()) {
    await parcours54({ uid: `u-54-piege-${n}`, ...o });
    egal(await etapes54(), statuts54(ko), `sabotage ${ko.join(', ')}`);
    proche(await dernierScore54(), note54(ko), `score avec ${ko.join(', ')} faux`);
  }
});

await v('ENT-5.4 : « Corriger » ne rouvre que le compte rendu — premier bilan, moyenne à la 1re correction, accusé de Bruno ; le BL signé ne se refait pas', async () => {
  await parcours54({ uid: 'u-54-corr', decisions: { ...JUSTE54, P4: [36, 'reserves', 'manquant'] }, phrases: { reserves: 'Tout est conforme.' } });
  const bilan1 = note54(['P4-comptage', 'message-reserves']);
  proche(await dernierScore54(), bilan1, 'premier bilan');
  egal((await bandeau54()).filter((x) => x[0] === 'ko').map((x) => x[1]), ['✗ Palette P4', '✗ Compte rendu : les réserves'], 'bandeau');
  egal(await pg.evaluate(() => Object.keys(window.__54.db.points || {})), ['smoby-reception'], 'photo du premier bilan (la 5.5 s’ouvre)');
  const t = await texteFin54();
  vrai(/Le camion est reparti : le BL ne se corrige plus\./.test(t) && /Tu peux corriger pour améliorer ta note/.test(t), 'texte du bandeau : ' + t);
  // Le quai clos : plus de « Recommencer la réception » (choix de Tristan, 07/10/2026), la phrase à la place.
  await pg.click(`${T54} .ent-nav[data-vue="quai"]`);
  await pg.click(`${Z54} [data-q="clore"]`);
  await pg.waitForSelector(`${Z54} [data-q-bilan]`);
  vrai(!(await pg.$(`${Z54} [data-q="recommencer"]`)), '« Recommencer la réception » après la signature');
  egal(await pg.textContent(`${Z54} [data-q-fige]`), 'Le camion est reparti : le BL ne se corrige plus.', 'phrase du bilan du quai');
  await pg.click(`${T54} [data-fin-corriger]`);
  await pg.waitForSelector(`${Z54} #formPhr:not([hidden])`);
  egal(await pg.$eval(`${Z54} [data-phrase="reserves"]`, (s) => s.selectedOptions[0].textContent), 'Tout est conforme.', 'le brouillon reprend le choix de l’élève');
  await pg.selectOption(`${Z54} [data-phrase="reserves"]`, { label: PHR54.reserves });
  await cliquerEtConfirmer(pg, `${Z54} #formPhr button[type="submit"]`);
  egal(await etapes54(), statuts54(['P4-comptage']), 'après la correction : le quai garde son erreur');
  proche(await dernierScore54(), (bilan1 + note54(['P4-comptage'])) / 2, 'moyenne du premier bilan et de l’état à la 1re correction');
  vrai(!(await pg.$(`${T54} [data-fin-corriger]`)), 'plus rien à rouvrir : pas de « Corriger »');
  const r = await pg.evaluate(() => {
    const M = window.__54.db.mails.filter((m) => m.folder === 'in');
    return { c: window.__54.db.indicateurs['smoby-reception'].corrections, re: M.filter((m) => m.subject === 'RE : La navette d’Arinthod').length,
      accuses: M.filter((m) => /corrigé/.test(m.subject)).map((m) => [m.subject, m.text]) };
  });
  egal([r.c, r.re], [1, 1], 'une correction, la réponse de Bruno n’est pas rejouée');
  egal(r.accuses, [['Ton compte rendu corrigé', 'Bien reçu, merci Lea.\n\nBruno']], 'l’accusé de Bruno, sans dire juste ou faux');
});

await v('ENT-5.4 : « meilleur » — un élève qui a fini avec l’ancien barème (10 / 10) garde sa note quand le barème passe à celui de la séance (démonstration)', async () => {
  // Identifiant et barème lus dans `meta` (chantier 13, 09/10/2026) ; seul l'ancien barème (10) est écrit en dur.
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const { meta } = await import('/activites/smoby-reception.js');
    const g = 'g-54-meilleur', u = 'u-54-meilleur', a = meta.id, N = meta.bareme;
    await B.poserNote(g, u, a, null);
    await B.ecrireScore(g, u, a, { score: 10, max: 10 });
    await B.ecrireScore(g, u, a, { score: N * 0.6, max: N });         // il rouvre : 60 % du barème courant, plus bas
    const m = (await B.lireScore(g, u, a)).meilleur;
    await B.poserNote(g, u, a, null);
    return { id: a, N, m };
  });
  vrai(r.N > 0 && r.N !== 10, 'meta de la séance : ' + JSON.stringify([r.id, r.N]) + ' (le barème courant doit différer de l’ancien, sinon le cas ne prouve rien)');
  vrai(Math.abs(r.m - r.N) < 0.01, `10/10 devenu ${r.m} sur ${r.N}`);
});

// ── ENT-5.5 « ranger et saisir l'entrée » (brief `docs/briefs/ENT-5.5-smoby-rangement.md`) ──────────────
// La séance réelle, montée par son activité (`activites/smoby-rangement.js`). Les attendus sont écrits À
// LA MAIN d'après le brief : adresses justes P1 A1-T01-N1-E3, P2 B2-T02-N1-E2/E3, P3 L1/L2, P4 B1-T03-N3-E1,
// B1-T04-N1-E2, B1-T04-N3-E2 ; saisie 8 / 45 / P3 en litige / 34 ; porteurs : 10 palettes × 36 = 360 au
// départ, 394 après l'entrée ; départ de la commande de Noël jeudi 10 décembre.
const T55 = '#s55';
const Z55 = `${T55} .ent-main`;
const monter55 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-rangement.js');
  for (const id of ['smTest', 's51', 's54', 's55']) document.getElementById(id)?.remove();
  const hote = document.createElement('div'); hote.id = 's55'; document.body.appendChild(hote);
  const db = {};
  window.__55 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: o.uid || 'u-55' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__55.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
  });
}, o);
const NEUF55 = ['P1-rangee', 'P2-rangee', 'P3-rangee', 'P4-rangee', 'saisie-p1-p2', 'saisie-p4', 'p3-litige', 'stock-lu', 'message-kn'];
const etapes55 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent55.js');
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, e.verifier(window.__55.db).status]));
});
const statuts55 = (ko = []) => Object.fromEntries(NEUF55.map((id) => [id, ko.includes(id) ? 'ko' : 'ok']));
const dernierScore55 = () => pg.evaluate(() => { const s = window.__55.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
const sujets55 = () => pg.evaluate(() => window.__55.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
const stock55 = (sku) => pg.evaluate((sku) => window.__55.db.stock[sku], sku);
const RANGE55 = { P1: 'A1-T01-N1-E3', P2: 'B2-T02-N1-E2', P3: 'L1', P4: 'B1-T03-N3-E1' };
// Ranger au plan : prendre la palette, ouvrir la travée, cliquer l'emplacement (la zone litiges se clique sur le plan).
async function ranger55(place = RANGE55) {
  await pg.click(`${T55} .ent-nav[data-vue="entrepot"]`);
  for (const [id, a] of Object.entries(place)) {
    await pg.click(`${Z55} .pe-bandeau [data-pe-pal="${id}"]`);
    if (a.startsWith('L')) { await pg.click(`${Z55} [data-pe-lit="${a}"]`); continue; }
    await pg.click(`${Z55} [data-pe-trav="${a.slice(0, 6)}"]`);
    await pg.click(`${Z55} [data-pe-emp="${a}"]`);
    await pg.click(`${Z55} [data-pe="retour"]`);
  }
}
const SAISIE55 = { 'SMB-NJL': [8, 8, 'ok', 'accepte'], 'SMB-CTF': [45, 45, 'ok', 'accepte'], 'SMB-EBD': [36, 36, 'abime', 'litige'],
  'SMB-PLS': [36, 34, 'ok', 'reserve'] };
async function saisir55(lignes = SAISIE55, valider = true) {
  await pg.click(`${T55} .ent-nav[data-vue="receptions"]`);
  await pg.click(`${Z55} [data-ouvrir-rec]`);
  await pg.fill(`${Z55} #recLot`, 'ARI-26-49');
  for (const [sku, [an, co, et, de]] of Object.entries(lignes)) {
    await pg.fill(`${Z55} input[data-rec="annonce"][data-sku="${sku}"]`, String(an));
    await pg.fill(`${Z55} input[data-rec="compte"][data-sku="${sku}"]`, String(co));
    await pg.selectOption(`${Z55} select[data-rec="etat"][data-sku="${sku}"]`, et);
    await pg.selectOption(`${Z55} select[data-rec="decision"][data-sku="${sku}"]`, de);
  }
  if (valider) await cliquerEtConfirmer(pg, `${Z55} [data-valider-rec]`);
}
async function repondre55(sujet, choix) {
  await pg.click(`${T55} .ent-nav[data-vue="mail"]`);
  await pg.click(`${Z55} [data-dossier="in"]`);
  await pg.click(`${Z55} .ent-obj:text-is("${sujet}")`);
  await pg.click(`${Z55} [data-repondre]`);
  await pg.waitForSelector(`${Z55} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(choix)) await pg.selectOption(`${Z55} [data-phrase="${l}"]`, { label: t });
  await cliquerEtConfirmer(pg, `${Z55} #formPhr button[type="submit"]`);
}
const STOCK55 = { stock: 'Il y a maintenant 394 cartons de porteurs Little Smoby en stock.' };
const KN55 = { salutation: 'Bonjour,', stock: 'La marchandise d’Arinthod est en stock.', depart: 'La commande de Noël pourra partir jeudi 10 décembre.',
  fin: 'Cordialement, Yanis — Smoby Moirans' };
async function parcours55({ uid, place, saisie, stock = {}, kn = {} } = {}) {
  await monter55({ uid });
  await ranger55(place);
  await saisir55(saisie);
  await repondre55('Le stock de porteurs', { ...STOCK55, ...stock });
  await repondre55('Commande de Noël : la marchandise d’Arinthod', { ...KN55, ...kn });
}

await v('ENT-5.5 : déclaration (code, 2de, C1.5 et C1.6, 9 jalons, livrée fermée aux élèves), inscrite au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-rangement.js');
    const I = await import('/activites/index.js');
    const m = A.meta;
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.pret, m.ouverture, m.portee, m.coeur],
      inscrite: (await Promise.all(I.ACTIVITES.map((f) => f()))).some((x) => x.meta.id === 'smoby-rangement') };
  });
  egal(r.m, ['smoby-rangement', 'ENT-5.5', 'simulog', ['2de'], ['C1.5', 'C1.6'], ['D4'], 'guidage', 9, true, 'prof', 'eleve', true], 'meta');
  vrai(r.inscrite, 'séance absente du registre');
});

await v('ENT-5.5 : les attendus calculés sont ceux du brief (palettes d’ENT-5.4, bonnes adresses, 360 → 394) et le corrigé les reprend', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent55.js');
    const { bonnesReponses } = await import('/core/types/entrepot.js');
    const C = (await import('/contenus/corriges/ENT-5.5.js')).CORRIGE;
    return { pal: S.PALETTES.map((p) => [p.id, p.produit, p.kg, p.rotation, p.contrainte || '', p.reception || '', !!p.litige]),
      B: bonnesReponses(S.ENTREPOT), depart: S.STOCK_DEPART['SMB-PLS'], apres: S.PORTEURS_APRES,
      att: S.ATTENDU.map((a) => [a.sku, a.annonce, a.compte, a.litige]), corrige: C.items.map((i) => i.reponses || i.rep) };
  });
  egal(r.pal, [['P1', 'MAI', 420, 'A', 'lourd', '', false], ['P2', 'CUI', 270, 'B', 'fragile', '', false],
    ['P3', 'ETA', 290, 'B', 'lourd', '1 carton écrasé', true], ['P4', 'POR', 180, 'C', '', '2 cartons manquants', false]], 'palettes');
  egal(r.B, { P1: ['A1-T01-N1-E3'], P2: ['B2-T02-N1-E2', 'B2-T02-N1-E3'], P3: ['L1', 'L2'],
    P4: ['B1-T03-N3-E1', 'B1-T04-N1-E2', 'B1-T04-N3-E2'] }, 'bonnes adresses');
  egal([r.depart, r.apres], [360, 394], 'porteurs avant / après');
  egal(r.att, [['SMB-NJL', 8, 8, false], ['SMB-CTF', 45, 45, false], ['SMB-EBD', 36, 36, true], ['SMB-PLS', 36, 34, false]], 'saisie attendue');
  egal(r.corrige[0].map((l) => [l[0], l[5]]), [['P1', 'A1-T01-N1-E3'], ['P2', 'B2-T02-N1-E2, B2-T02-N1-E3'], ['P3', 'L1, L2'],
    ['P4', 'B1-T03-N3-E1, B1-T04-N1-E2, B1-T04-N3-E2']], 'corrigé : adresses');
  vrai(r.corrige[2].startsWith('394 cartons'), `corrigé : stock ${r.corrige[2]}`);
  vrai(r.corrige[3].includes('jeudi 10 décembre'), 'corrigé : message');
});

await v('ENT-5.5 : à l’ouverture, le message de Bruno et le BL, aucun jalon vrai ; la décision « En litige » est proposée', async () => {
  await monter55();
  egal(await sujets55(), ['On range les palettes d’Arinthod', 'BL ARI-26-1209 avec tes réserves'], 'messages au départ');
  egal(await etapes55(), Object.fromEntries(NEUF55.map((id) => [id, 'attente'])), 'étapes à l’ouverture');
  const s = await dernierScore55();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
  await pg.click(`${T55} .ent-nav[data-vue="receptions"]`);
  await pg.click(`${Z55} [data-ouvrir-rec]`);
  egal(await pg.$$eval(`${Z55} select[data-rec="decision"][data-sku="SMB-EBD"] option`, (O) => O.map((o) => o.value)),
    ['', 'accepte', 'reserve', 'refuse', 'litige'], 'décisions');
  vrai((await pg.textContent(Z55)).includes('Une ligne refusée ou en litige n’entre pas en stock.'.replace('’', "'")), 'consigne du bon de réception');
});

await v('ENT-5.5 : sans `receptionLitige`, l’écran Réceptions garde ses trois décisions (les autres séances ne changent pas)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const S = await import('/contenus/smoby-ent55.js');
    const SM = await import('/contenus/smoby.js');
    for (const id of ['smTest', 's51', 's54', 's55']) document.getElementById(id)?.remove();
    const hote = document.createElement('div'); hote.id = 's55'; document.body.appendChild(hote);
    const db = {};
    creerEntreprise({ ENTREPRISE: SM.ENTREPRISE, VOCAB: S.VOCAB, CATALOGUE: S.CATALOGUE, SUPPLIERS: [S.FOURNISSEUR],
      SUP_BY_ID: { ARI: S.FOURNISSEUR }, CUSTOMERS: [], CM: {}, baseDeDepart: S.baseDeDepart, THEME: SM.THEME, etapes: [],
      volet: S.VOLET }).rendre(hote, { meta: { id: 'x55', portee: 'eleve' }, profil: { prenom: 'A', role: 'eleve' },
      jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {} });
    hote.querySelector('.ent-nav[data-vue="receptions"]').click();
    hote.querySelector('[data-ouvrir-rec]').click();
    return [...hote.querySelector('select[data-rec="decision"]').options].map((o) => o.value);
  });
  egal(r, ['', 'accepte', 'reserve', 'refuse'], 'décisions sans l’option');
});

await v('ENT-5.5 : parcours juste à l’écran → 9 / 9 ; P3 n’entre pas en stock, porteurs 394 ; Kuehne+Nagel puis le relais de Bruno', async () => {
  await monter55();
  await ranger55();
  egal(await pg.evaluate(() => window.__55.db.entrepots['smoby-ent55'].place), RANGE55, 'palettes posées');
  await saisir55();
  egal([await stock55('SMB-PLS'), await stock55('SMB-EBD'), await stock55('SMB-NJL'), await stock55('SMB-CTF')], [394, 684, 136, 429], 'stock après l’entrée');
  egal(await sujets55(), ['On range les palettes d’Arinthod', 'BL ARI-26-1209 avec tes réserves', 'Le stock de porteurs'], 'Bruno demande le stock après la saisie');
  await repondre55('Le stock de porteurs', STOCK55);
  egal((await sujets55()).slice(3), ['Commande de Noël : la marchandise d’Arinthod'], 'Kuehne+Nagel écrit après la réponse à Bruno');
  await repondre55('Commande de Noël : la marchandise d’Arinthod', KN55);
  egal((await sujets55()).slice(4), ['Merci, et la suite'], 'relais vers ENT-5.6');
  egal(await etapes55(), statuts55(), 'étapes');
  egal(await dernierScore55(), [9, 9], 'score remonté au suivi');
});

await v('ENT-5.5 : chaque piège fait tomber son jalon (mal rangée, P4 saisie 36, P3 acceptée ou refusée, stock du BL, vendredi 11)', async () => {
  const cas = [
    [['P1-rangee'], { place: { ...RANGE55, P1: 'A1-T02-N1-E2' } }],
    [['P2-rangee'], { place: { ...RANGE55, P2: 'B2-T02-N3-E2' } }],
    [['P3-rangee'], { place: { ...RANGE55, P3: 'A1-T03-N1-E1' } }],
    [['P4-rangee'], { place: { ...RANGE55, P4: 'B1-T04-N2-E3' } }],
    [['saisie-p4'], { saisie: { ...SAISIE55, 'SMB-PLS': [36, 36, 'ok', 'accepte'] } }],
    [['saisie-p1-p2'], { saisie: { ...SAISIE55, 'SMB-CTF': [45, 48, 'ok', 'accepte'] } }],
    [['p3-litige'], { saisie: { ...SAISIE55, 'SMB-EBD': [36, 36, 'abime', 'reserve'] } }],
    [['p3-litige'], { saisie: { ...SAISIE55, 'SMB-EBD': [36, 36, 'abime', 'refuse'] } }],
    [['stock-lu'], { stock: { stock: 'Il y a maintenant 396 cartons de porteurs Little Smoby en stock.' } }],
    [['message-kn'], { kn: { depart: 'La commande de Noël pourra partir vendredi 11 décembre.' } }],
    [['message-kn'], { kn: { stock: 'Tout est parti.' } }],
  ];
  for (const [n, [ko, o]] of cas.entries()) {
    await parcours55({ uid: `u-55-piege-${n}`, ...o });
    egal(await etapes55(), statuts55(ko), `sabotage ${ko.join(', ')}`);
    egal(await dernierScore55(), [9 - ko.length, 9], `score avec ${ko.join(', ')} faux`);
  }
});

await v('ENT-5.5 : P3 « En litige » sans valider l’entrée ne rapporte rien (pas de jalon par inaction)', async () => {
  await monter55();
  await saisir55(SAISIE55, false);
  const e = await etapes55();
  egal([e['p3-litige'], e['saisie-p1-p2'], e['saisie-p4']], ['attente', 'attente', 'attente'], 'jalons de la saisie avant validation');
  egal(await stock55('SMB-PLS'), 360, 'stock avant validation');
});

// ── ENT-5.6 « la palette de la commande de Noël » (brief `docs/briefs/ENT-5.6-smoby-preparation.md`) ───────
// La séance réelle, montée par son activité (`activites/smoby-preparation.js`). Les mécaniques de la vue
// (refus en réserve, réappro par le Porteur, écran partagé…) sont testées dans le bloc `entrepot` ; ici, ce
// que la séance déclare. Attendus écrits À LA MAIN d'après le brief : serpentin 47 m, 331 kg, 1,74 m ;
// rupture du Trotteur (2 au picking, 6 commandés), réserve juste B1-T01-N2-E2 ou B1-T01-N3-E1/E2/E3 ;
// départ jeudi 10 décembre, 6 h 00.
const T56 = '#s56';
const Z56 = `${T56} .ent-main`;
const monter56 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-preparation.js');
  for (const id of ['smTest', 's51', 's54', 's55', 's56']) document.getElementById(id)?.remove();
  const hote = document.createElement('div'); hote.id = 's56'; document.body.appendChild(hote);
  const db = {};
  window.__56 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: o.uid || 'u-56' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__56.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
  });
}, o);
const NEUF56 = ['lignesJustes', 'reappro', 'lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes', 'parcours'];
const etapes56 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent56.js');
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, e.verifier(window.__56.db).status]));
});
const statuts56 = (ko = []) => Object.fromEntries(NEUF56.map((id) => [id, ko.includes(id) ? 'attente' : 'ok']));
const dernierScore56 = () => pg.evaluate(() => { const s = window.__56.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
const sujets56 = () => pg.evaluate(() => window.__56.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
const metres56 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent56.js');
  const E = await import('/core/types/entrepot.js');
  return Math.round(E.calculPreparation(S.ENTREPOT, window.__56.db.entrepots['smoby-ent56']).metres);
});
const L56 = [['A1-T01-N1-E1', 2], ['A1-T02-N1-E1', 6], ['B1-T02-N1-E3', 4], ['B1-T01-N1-E2', 6], ['B1-T01-N1-E1', 6], ['B2-T01-N1-E1', 8]];
const P56 = `${Z56} .pe`;
async function prelever56(a, q) {
  for (let i = 0; i < 4 && await pg.$(`${P56} [data-pe="retour"]`); i++) await pg.click(`${P56} [data-pe="retour"]`);
  await pg.click(`${P56} [data-pe-trav="${a.slice(0, 6)}"]`);
  if (a === 'B1-T01-N1-E1') {
    await pg.click(`${P56} [data-pe-emp="${a}"]`);
    await pg.click(`${P56} [data-pe="reappro"]`);
    await pg.click(`${P56} [data-pe-emp="B1-T01-N2-E2"]`);
  }
  await pg.click(`${P56} [data-pe-emp="${a}"]`);
  await pg.fill('#peNb', String(q));
  await pg.click(`${P56} [data-pe="prelever"]`);
}
async function finir56({ film = '4', etiq = ['avant', 'arriere', 'dessus'] } = {}) {
  for (let i = 0; i < 4 && await pg.$(`${P56} [data-pe="retour"]`); i++) await pg.click(`${P56} [data-pe="retour"]`);
  await pg.click(`${P56} [data-pe="terminer"]`);
  await pg.selectOption(`${P56} [data-pe-film]`, film);
  for (const k of etiq) await pg.check(`${P56} [data-pe-etiq="${k}"]`);
  await pg.click(`${P56} [data-pe="verifierPrep"]`);
}
async function parcours56({ uid, ordre = [0, 1, 2, 3, 4, 5], ...fin } = {}) {
  await monter56({ uid });
  await pg.click(`${T56} .ent-nav[data-vue="entrepot"]`);
  for (const i of ordre) await prelever56(...L56[i]);
  await finir56(fin);
}

await v('ENT-5.6 : déclaration (code, 2de, C2.1, 9 jalons, livrée fermée aux élèves), inscrite au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-preparation.js');
    const I = await import('/activites/index.js');
    const m = A.meta;
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.pret, m.ouverture, m.portee, m.coeur],
      inscrite: (await Promise.all(I.ACTIVITES.map((f) => f()))).some((x) => x.meta.id === 'smoby-preparation') };
  });
  egal(r.m, ['smoby-preparation', 'ENT-5.6', 'simulog', ['2de'], ['C2.1'], ['D4'], 'guidage', 9, true, 'prof', 'eleve', true], 'meta');
  vrai(r.inscrite, 'séance absente du registre');
});

await v('ENT-5.6 : les attendus calculés sont ceux du brief (47 m, 331 kg, 1,74 m, réserve du Trotteur) et le corrigé les reprend', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent56.js');
    const E = await import('/core/types/entrepot.js');
    const C = (await import('/contenus/corriges/ENT-5.6.js')).CORRIGE;
    const A = E.attendusPreparation(S.ENTREPOT);
    return { A: [Math.round(A.serpentin), A.poids, Math.round(A.hauteur * 100) / 100], heure: S.COMMANDE.heure,
      ordre: S.COMMANDE.lignes.map((l) => [l.a, l.q]), corrige: C.items.map((i) => i.reponses || i.rep) };
  });
  egal(r.A, [47, 331, 1.74], 'serpentin, poids, hauteur');
  egal(r.heure, 'jeudi 10 décembre, 6 h 00', 'heure de l’enlèvement');
  egal(r.ordre, L56, 'lignes du bon dans l’ordre du serpentin');
  egal(r.corrige[0].map((l) => [l[1], l[4]]), L56.map(([a, q]) => [a, String(q)]), 'corrigé : lignes');
  vrai(r.corrige[1].includes('B1-T01-N2-E2, B1-T01-N3-E1, B1-T01-N3-E2, B1-T01-N3-E3'), `corrigé : réserve ${r.corrige[1]}`);
  vrai(r.corrige[2].startsWith('331 kg') && r.corrige[2].includes('1,74 m'), `corrigé : palette ${r.corrige[2]}`);
  vrai(r.corrige[3].startsWith('47 m'), `corrigé : parcours ${r.corrige[3]}`);
});

await v('ENT-5.6 : à l’ouverture, le message de Bruno, aucun jalon (inaction 0 / 9) ; menu « Préparer la commande », départ jeudi 6 h', async () => {
  await monter56();
  egal(await sujets56(), ['La palette de la commande de Noël'], 'messages au départ');
  egal(await etapes56(), Object.fromEntries(NEUF56.map((id) => [id, 'attente'])), 'étapes à l’ouverture');
  const s = await dernierScore56();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
  egal((await pg.textContent(`${T56} .ent-nav[data-vue="entrepot"]`)).trim(), 'Préparer la commande', 'entrée de menu');
  await pg.click(`${T56} .ent-nav[data-vue="entrepot"]`);
  egal((await pg.textContent(`${P56} [data-pe-heure]`)).trim(), 'jeudi 10 décembre, 6 h 00', 'heure affichée');
  egal(await pg.$$eval(`${P56} [data-pe-ligne] .pe-ttl .pe-mono`, (L) => L.map((x) => x.textContent)), L56.map((l) => l[0]), 'bon trié (guidage)');
  await pg.waitForSelector(`${P56} .lex`, { timeout: 3000 });
});

await v('ENT-5.6 : parcours juste à l’écran → 47 m, 9 / 9 remonté au suivi, puis le message de fin de Bruno', async () => {
  await parcours56();
  egal(await metres56(), 47, 'mètres');
  egal(await etapes56(), statuts56(), 'étapes');
  egal(await dernierScore56(), [9, 9], 'score remonté au suivi');
  egal(await sujets56(), ['La palette de la commande de Noël', 'La palette est prête'], 'Bruno conclut');
});

await v('ENT-5.6 : palette vide terminée → 0 / 9 ; une seule ligne puis Terminer → 0 / 9, parcours compris', async () => {
  await monter56({ uid: 'u-56-vide' });
  await pg.click(`${T56} .ent-nav[data-vue="entrepot"]`);
  await prelever56(...L56[0]);
  await pg.click(`${P56} [data-pe="reposer"]`);
  vrai(await pg.$eval(`${P56} [data-pe="terminer"]`, (b) => b.disabled), 'Terminer actif sur une palette vide');
  // L'écran refuse de terminer une palette vide : l'état est posé à la main (film et étiquettes justes).
  await pg.evaluate(() => Object.assign(window.__56.db.entrepots['smoby-ent56'],
    { fin: true, verifie: true, film: '4', etiq: { avant: true, arriere: true, dessus: true } }));
  egal(await etapes56(), statuts56(NEUF56), 'palette vide');
  await parcours56({ uid: 'u-56-une', ordre: [0] });
  egal(await etapes56(), statuts56(NEUF56), 'une seule ligne');
  egal(await sujets56(), ['La palette de la commande de Noël'], 'pas de message de fin');
});

await v('ENT-5.6 : chaque piège fait tomber son jalon (Cuisine avant Porteur et Trotteur, film 2 tours, étiquettes voisines), sans message de fin', async () => {
  const cas = [
    [['fragiles'], { ordre: [0, 1, 2, 5, 3, 4] }],
    [['film'], { film: '2' }],
    [['etiquettes'], { etiq: ['avant', 'gauche', 'dessus'] }],
  ];
  for (const [n, [ko, o]] of cas.entries()) {
    await parcours56({ uid: `u-56-piege-${n}`, ...o });
    egal(await etapes56(), statuts56(ko), `sabotage ${ko.join(', ')}`);
    egal(await dernierScore56(), [9 - ko.length, 9], `score avec ${ko.join(', ')} faux`);
    egal(await metres56(), 47, `mètres inchangés (${ko.join(', ')})`);
    egal((await sujets56()).length, 1, `pas de message de fin (${ko.join(', ')})`);
  }
});

// ── ENT-5.3 « la visite de la plateforme » (brief `docs/briefs/ENT-5.3-smoby-visite.md`) ──────────────
// La séance réelle, montée par son activité (`activites/smoby-visite.js`). Les mécaniques du mode visite
// (ordre, pièges, tolérance, sabotages, images) sont testées dans le bloc `entrepot` sur la même
// déclaration ; ici, ce que la séance ajoute : sa déclaration, son ouverture et le score remonté au suivi.
// Gestes justes écrits À LA MAIN d'après le brief (mêmes valeurs que le bloc `entrepot`).
const T53 = '#s53';
const Z53 = `${T53} .pv`;
const monter53 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-visite.js');
  for (const id of ['smTest', 's51', 's54', 's55', 's56', 's53']) document.getElementById(id)?.remove();
  const hote = document.createElement('div'); hote.id = 's53'; document.body.appendChild(hote);
  const db = {};
  window.__53 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: o.uid || 'u-53' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__53.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null, suivante: { code: 'ENT-5.4', titre: 'La réception au quai' },
  });
}, o);
const etapes53 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent53.js');
  return S.ETAPES.map((e) => e.verifier(window.__53.db).status);
});
const dernierScore53 = () => pg.evaluate(() => { const s = window.__53.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
async function clic53(x, y) {
  const [a, b] = await pg.evaluate(([x, y]) => {
    const svg = document.querySelector('#s53 .pv-calque');
    svg.scrollIntoView({ block: 'nearest' });
    const q = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM());
    return [q.x, q.y];
  }, [x, y]);
  await pg.mouse.click(a, b);
}
const suivant53 = () => pg.click(`${Z53} [data-pv="suivant"]`);

// Toute la visite à l'écran. Par défaut, tout juste du premier coup ; `o.fautes` ajoute des erreurs AVANT le bon geste
// (l'élève recommence toujours jusqu'à trouver) : ciel, photo, quiz, coin, lisse, adresse (décomposition et clics faux).
// Index des 23 cases : ciel 0-2, photos 3-8, quiz 9-12, coins 13-16 (hg hd bg bd), lisses 17, parties 18-21, retrouver 22.
async function parcours53(o = {}) {
  const F = o.fautes || {};
  await monter53({ uid: o.uid || 'u-53-parcours' });
  await pg.click(`${T53} .ent-nav[data-vue="entrepot"]`);
  await suivant53();
  for (const n of [1, 2, 3, 4, 5, 6]) await pg.click(`${Z53} button[data-pv-point="${n}"]`);
  await pg.click(`${Z53} [data-pv="questions"]`);
  if (F.ciel) await clic53(400, 575);                       // le passage piétons, à la question des camions
  await clic53(1000, 560); await clic53(400, 575); await clic53(500, 400);
  await suivant53();
  for (const n of [1, 2, 3, 4, 5, 6]) {
    if (await pg.$(`${Z53} [data-pv="retour"]`)) await pg.click(`${Z53} [data-pv="retour"]`);
    await pg.click(`${Z53} g[data-pv-etape="${n}"]`);
  }
  await suivant53();
  if (F.photo) await pg.click(`${Z53} [data-pv-num="1"]`);   // la 1re photo (l'allée, n° 4) placée au quai
  for (const n of [4, 1, 6, 2, 5, 3]) await pg.click(`${Z53} [data-pv-num="${n}"]`);
  await suivant53();
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) await pg.click(`${Z53} button[data-pv-point="${n}"]`);
  await suivant53();
  await clic53(300, 500);
  if (F.quiz) await clic53(800, 1700);                       // l'allée, à la question de la lisse
  await clic53(700, 120); await clic53(450, 600); await clic53(800, 1700);
  await suivant53();
  if (F.coin) {                                              // le coin en haut à gauche 200 trop à droite, puis tout effacé
    for (const [x, y] of [[487, 45], [847, 47], [258, 1175], [876, 1173]]) await clic53(x, y);
    await pg.click(`${Z53} [data-pv="verifierCoins"]`);
    await pg.click(`${Z53} [data-pv="effacerCoins"]`);
  }
  for (const [x, y] of [[287, 45], [847, 47], [258, 1175], [876, 1173]]) await clic53(x, y);
  await pg.click(`${Z53} [data-pv="verifierCoins"]`);
  if (F.lisse) await clic53(570, 160);                       // une barre du fond
  await clic53(570, 80); await clic53(570, 454); await clic53(570, 687);
  await suivant53();
  const sens = F.adresse ? ['allée et côté', 'niveau', 'travée', 'emplacement'] : ['allée et côté', 'travée', 'niveau', 'emplacement'];
  for (let i = 0; i < 4; i++) await pg.selectOption(`${Z53} [data-pv-choix="${i}"]`, sens[i]);
  await pg.click(`${Z53} [data-pv="valider"]`);
  await pg.click(`${Z53} [data-pe-trav="A1-T03"]`);
  for (const a of ['A1-T03-N1-E1', 'A1-T03-N1-E2', 'A1-T03-N1-E3'].slice(0, F.clics || 0)) await pg.click(`${Z53} [data-pe-emp="${a}"]`);
  await pg.click(`${Z53} [data-pe-emp="A1-T03-N2-E1"]`);
  await suivant53();
  egal(await pg.$eval(Z53, (e) => e.dataset.pvEtape), 'fin', 'dernière étape');
}
const bandeau53 = () => pg.evaluate(() => {
  const b = document.querySelector('#s53 [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, titre: b.querySelector('h2')?.textContent.trim() || '', texte: b.textContent.replace(/\s+/g, ' '),
    lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat, l.querySelector('.ent-fin-a').textContent.trim()]),
    corriger: !!b.querySelector('[data-fin-corriger]'), photo: !!(window.__53.db.points && window.__53.db.points['smoby-visite']) } : null;
});
const BLOCS53 = ['Vue du ciel', 'Où est-ce ?', 'Les éléments du rack', 'La travée', 'L’adresse : la décomposer', 'L’adresse : la retrouver'];

await v('ENT-5.3 : déclaration (code, 2de, C1.2 et C1.5, 23 cases sur 20, notée au premier essai, livrée fermée aux élèves), inscrite au registre, rangée avant ENT-5.4', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-visite.js');
    const I = await import('/activites/index.js');
    const S = await import('/contenus/smoby-ent53.js');
    const m = A.meta;
    const codes = (await Promise.all(I.ACTIVITES.map((f) => f()))).map((x) => x.meta.code).filter((c) => /^ENT-5\./.test(c));
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.pret, m.ouverture, m.portee, m.coeur],
      codes, premier: S.VISITE.premierEssai, n: S.ETAPES.length };
  });
  egal(r.m, ['smoby-visite', 'ENT-5.3', 'simulog', ['2de'], ['C1.2', 'C1.5'], ['D4'], 'guidage', 20, true, 'prof', 'eleve', true], 'meta');
  egal([r.premier, r.n], [true, 23], 'premier essai, 23 cases');
  vrai(r.codes.includes('ENT-5.3'), 'séance absente du registre');
  vrai(r.codes.indexOf('ENT-5.3') === r.codes.indexOf('ENT-5.4') - 1, `ordre du registre : ${r.codes.join(', ')}`);
});

await v('ENT-5.3 : le barème (brief SMOBY-notation §5.1, écrit à la main) : 6 blocs, 20 points, chaque case à sa place', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent53.js');
    const G = {};
    S.ETAPES.forEach((e) => { G[e.groupe] = G[e.groupe] || [0, 0]; G[e.groupe][0] += 1; G[e.groupe][1] += e.poids; });
    return { ids: S.ETAPES.map((e) => e.id), G: Object.entries(G).map(([k, [n, p]]) => [k, n, Math.round(p * 1000) / 1000]) };
  });
  egal(r.G, [['Vue du ciel', 3, 3], ['Où est-ce ?', 6, 4], ['Les éléments du rack', 4, 3], ['La travée', 5, 4],
    ['L’adresse : la décomposer', 4, 4], ['L’adresse : la retrouver', 1, 2]], 'blocs : cases et points');
  egal(r.ids.slice(13), ['travee-hg', 'travee-hd', 'travee-bg', 'travee-bd', 'travee-cibles',
    'adresse-partie1', 'adresse-partie2', 'adresse-partie3', 'adresse-partie4', 'adresse-retrouver'], 'cases de la travée et de l’adresse');
});

await v('ENT-5.3 : à l’ouverture, le message de Bruno, aucun jalon (0 / 20) ; menu « Visite de la plateforme » seul, les 8 mots du rack cliquables', async () => {
  await monter53();
  egal(await pg.evaluate(() => window.__53.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject)), ['Ton premier jour : la visite'], 'messages au départ');
  // Retours 5.3, A6 : le message est daté du jour de la visite, mercredi 9 décembre à 7 h 55, de l'année scolaire en cours.
  const quand = await pg.evaluate(() => { const d = new Date(window.__53.db.mails[0].ts), n = new Date();
    return [d.getDate(), d.getMonth() + 1, d.getHours(), d.getMinutes(), d.getFullYear() === (n.getMonth() >= 8 ? n.getFullYear() : n.getFullYear() - 1)]; });
  egal(quand, [9, 12, 7, 55, true], 'date du message de Bruno');
  egal(await etapes53(), Array(23).fill('attente'), 'étapes à l’ouverture');
  const s = await dernierScore53();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
  egal(await pg.$$eval(`${T53} .ent-side-liste > *`, (L) => L.map((e) => e.dataset.vue || `[${e.textContent.trim()}]`)),
    ['accueil', 'mail', '[Mon poste]', 'entrepot'], 'menu');
  egal((await pg.textContent(`${T53} .ent-nav[data-vue="entrepot"]`)).trim(), 'Visite de la plateforme', 'entrée de menu');
  const lex = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent53.js');
    return ['échelle', 'lisse', 'étiquette d’adresse', 'palette filmée', 'allée', 'niveau', 'travée', 'croisillons'].map((k) => S.LEXIQUE[k] || null);
  });
  egal(lex.map((d) => !!d), Array(8).fill(true), 'les 8 mots dans le lexique');
  vrai(lex[6].startsWith('L’espace entre deux échelles'), `définition de travée : ${lex[6]}`);
  await pg.waitForSelector(`${T53} .lex`, { timeout: 3000 });
  await pg.click(`${T53} .ent-nav[data-vue="entrepot"]`);
  egal(await pg.$eval(Z53, (e) => e.dataset.pvEtape), 'accueil', 'la visite s’ouvre sur l’accueil');
});

await v('ENT-5.3 : la visite juste du premier coup de bout en bout à l’écran → 20 / 20, bandeau « Tout est juste du premier coup », pas de « Corriger »', async () => {
  await parcours53({ uid: 'u-53-juste' });
  egal(await etapes53(), Array(23).fill('ok'), 'étapes');
  egal(await dernierScore53(), [20, 20], 'score remonté au suivi');
  const b = await bandeau53();
  egal([b.fin, b.titre, b.corriger, b.photo], ['ok', 'Tout est juste du premier coup ✓', false, true], 'bandeau, photo de fin');
  egal(b.lignes, BLOCS53.map((n) => [n, 'ok', 'du premier coup']), 'les 6 lignes');
});

await v('ENT-5.3 : au premier essai — une erreur dans chaque bloc sauf le rack, toutes rattrapées : la note garde les erreurs (11,833 / 20), le bandeau aussi, la 5.4 s’ouvre', async () => {
  await parcours53({ uid: 'u-53-premier', fautes: { ciel: true, photo: true, coin: true, lisse: true, adresse: true, clics: 3 } });
  const st = await etapes53();
  const ko = st.map((x, i) => (x === 'ko' ? i : null)).filter((i) => i !== null);
  egal(ko, [0, 3, 13, 17, 19, 20, 22], 'cases ratées au premier essai : camions, photo de l’allée, coin en haut à gauche, lisses, travée et niveau, emplacement');
  vrai(st.every((x) => x === 'ok' || x === 'ko'), `tout jugé : ${st.join(' ')}`);
  // 20 − 1 (ciel) − 2/3 (photo) − 0,5 (coin) − 2 (lisses) − 2 (deux parties) − 2 (4 clics) = 11,833
  egal(await dernierScore53(), [11.833, 20], 'score remonté au suivi');
  const b = await bandeau53();
  egal([b.fin, b.titre, b.corriger, b.photo], ['ko', 'Tu as fini : voici ce que tu as réussi du premier coup.', false, true], 'bandeau sans « Corriger », photo de fin');
  egal(b.lignes, BLOCS53.map((n) => (n === 'Les éléments du rack' ? [n, 'ok', 'du premier coup'] : [n, 'ko', 'après une erreur'])), 'les 6 lignes');
  vrai(/ENT-5\.4/.test(b.texte) && /est ouverte/.test(b.texte), `la suite annoncée : ${b.texte}`);
  vrai(!/corrig/i.test(b.texte), `le bandeau ne promet aucune correction : ${b.texte}`);
  // L'emplacement : 3 clics au plus. Le repérage (premier jugement) dit la même chose que la note.
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent53.js');
    const x = window.__53.db.entrepots['smoby-visite'].x.adresse, J = S.ETAPES[22];
    const d = (n) => { x.clics = Array(n).fill('A1-T03-N1-E1'); return J.verifier(window.__53.db).status; };
    return { out: [d(1), d(3), d(4)], premier: window.__53.db.indicateurs['smoby-visite'].premier };
  });
  egal(r.out, ['ok', 'ok', 'ko'], 'emplacement trouvé en 1, 3, 4 clics');
  egal(['ciel-camions', 'travee-hg', 'travee-hd', 'adresse-partie1', 'adresse-partie2'].map((k) => r.premier[k]), ['ko', 'ko', 'ok', 'ok', 'ko'], 'repérage « du premier coup »');
});

await v('ENT-5.3 : une base d’avant le premier essai (sans les coins de la 1re vérification) — une vérification = coins justes, plusieurs = coins ratés ; rien n’est effacé', async () => {
  await monter53({ uid: 'u-53-ancienne' });
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent53.js');
    const db = window.__53.db;
    db.entrepots = db.entrepots || {};
    const x = { pts: [[287, 45], [847, 47], [258, 1175], [876, 1173]], ok: true, verifs: 1, faux: [], cibles: [0, 1, 2] };
    db.entrepots['smoby-visite'] = { courante: 6, atteinte: 6, x: { travee: x } };
    const coins = () => S.ETAPES.slice(13, 18).map((e) => e.verifier(db).status);
    const a = coins();
    x.verifs = 3;
    return [a, coins(), JSON.stringify(db.entrepots['smoby-visite'].x.travee.pts)];
  });
  egal(r[0], ['ok', 'ok', 'ok', 'ok', 'ok'], 'une vérification');
  egal(r[1], ['ko', 'ko', 'ko', 'ko', 'ok'], 'trois vérifications');
  egal(r[2], '[[287,45],[847,47],[258,1175],[876,1173]]', 'les coins posés restent');
});

await v('ENT-5.3 : « meilleur » — un élève qui a fini avec l’ancien barème (17 / 17) garde sa note quand le barème passe à celui de la séance (démonstration)', async () => {
  // Identifiant et barème lus dans `meta` (chantier 13, 09/10/2026) ; seul l'ancien barème (17) est écrit en dur.
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const { meta } = await import('/activites/smoby-visite.js');
    const g = 'g-53-meilleur', u = 'u-53-meilleur', a = meta.id, N = meta.bareme;
    await B.poserNote(g, u, a, null);
    await B.ecrireScore(g, u, a, { score: 17, max: 17 });
    await B.ecrireScore(g, u, a, { score: N * 0.6, max: N });         // il rouvre : 60 % du barème courant, plus bas
    const m = (await B.lireScore(g, u, a)).meilleur;
    await B.poserNote(g, u, a, null);
    return { id: a, N, m };
  });
  vrai(r.N > 0 && r.N !== 17, 'meta de la séance : ' + JSON.stringify([r.id, r.N]) + ' (le barème courant doit différer de l’ancien, sinon le cas ne prouve rien)');
  vrai(Math.abs(r.m - r.N) < 0.01, `17/17 devenu ${r.m} sur ${r.N}`);
});

// ── ENT-5.7 « les enlèvements de Noël » (brief `docs/briefs/ENT-5.7-smoby-enlevements.md`) ─────────────
// La séance réelle, montée par son activité (`activites/smoby-enlevements.js`). Les placements sont écrits
// À LA MAIN ici (créneau = quart d'heure depuis 05:00 : 07:00 → 8), d'après la recherche de Cowork sur la
// maquette v8 ; les règles elles-mêmes sont éprouvées par le bloc `planning` (même cas « chauffeurs »).
const T57 = '#s57';
const Z57 = `${T57} .ent-main`;
const monter57 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-enlevements.js');
  ['#smTest', '#s51', '#s52', '#s57'].forEach((s) => document.querySelector(s)?.remove());
  const hote = document.createElement('div'); hote.id = 's57'; document.body.appendChild(hote);
  const db = {};
  window.__57 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-57' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__57.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
  });
}, o);
const etapes57 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent57.js');
  return S.ETAPES.map((e) => e.verifier(window.__57.db).status);
});
const dernierScore57 = () => pg.evaluate(() => { const s = window.__57.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
const sujets57 = () => pg.evaluate(() => window.__57.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
const ACCUEIL57 = ['Commande de Noël : 5 enlèvements jeudi', 'Planning de jeudi'];
// Juge des placements { carte: { r, s, k } } pour les deux versions, sans passer par l'écran.
const juger57 = (v1, v2) => pg.evaluate(async ([v1, v2]) => {
  const S = await import('/contenus/smoby-ent57.js');
  const P = await import('/core/types/planning.js');
  const db = { plannings: { [S.PLANNING.id]: { v1: { place: v1 }, ...(v2 ? { v2: { place: v2 } } : {}) } } };
  return P.jalonsPlanning(db, S.PLANNING).L.map((l) => l.ok);
}, [v1, v2]);
// Une solution juste avant la panne, et une après (Semi n° 2 à l'atelier jusqu'à 12:00).
const CH1 = { E1: { r: 'sofiane', s: 8, k: 's1' }, E3: { r: 'marc', s: 8, k: 'p3' }, E2: { r: 'julie', s: 12, k: 's2' },
  'pause-1': { r: 'julie', s: 26 }, 'pause-2': { r: 'sofiane', s: 24 }, E4: { r: 'sofiane', s: 27, k: 's1' }, E5: { r: 'julie', s: 29, k: 'p3' } };
const CH2 = { E1: { r: 'julie', s: 4, k: 's1' }, E3: { r: 'marc', s: 8, k: 'p3' }, 'pause-1': { r: 'julie', s: 20 },
  E2: { r: 'sofiane', s: 20, k: 's1' }, E4: { r: 'julie', s: 28, k: 's2' }, 'pause-2': { r: 'sofiane', s: 34 }, E5: { r: 'sofiane', s: 37, k: 'p3' } };
// À l'écran : la carte, puis la case, puis le camion dans la bulle (même geste que le bloc `planning`).
async function poser57(id, { r, s, k }) {
  await pg.click(`${Z57} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z57} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${s}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  if (k) await pg.click(`${Z57} .pl-bulle [data-pl-choix="${k}"]`);
}
async function envoyer57() {
  await cliquerEtConfirmer(pg, `${Z57} [data-pl="envoyer"]`);
  if (await pg.$(`${Z57} [data-pl="quandMeme"]`)) await pg.click(`${Z57} [data-pl="quandMeme"]`);
}
// Lot 1 de SMOBY-notation-5.3-5.8 (07/10/2026) : une règle = un jalon, 8 avant la panne (pas l'atelier), 9 après.
// Ordre du moteur : v1 chauffeurUnique, permis, camionUnique, typeCamion, fenetre, repos, pause, jour ; v2 les mêmes
// avec l'atelier après typeCamion. Écrit à la main.
const REGLES57 = ['chauffeurUnique', 'permis', 'camionUnique', 'typeCamion', 'fenetre', 'repos', 'pause', 'jour'];
const IDS57 = [...REGLES57.map((r) => `v1-${r}`), ...['chauffeurUnique', 'permis', 'camionUnique', 'typeCamion', 'atelier', 'fenetre', 'repos', 'pause', 'jour'].map((r) => `v2-${r}`)];
const tous57 = (s) => Array(17).fill(s);
// Le juge par identifiant : { 'v1-permis': true, … }.
const juger57n = async (v1, v2) => Object.fromEntries((await juger57(v1, v2)).map((ok, i) => [IDS57[i], ok]));
const faux57 = (o) => Object.keys(o).filter((k) => !o[k]);
const bandeau57 = () => pg.$$eval(`${T57} [data-fin-seance] [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finEtat, x.textContent.replace(/\s+/g, ' ').trim().replace(/^([✓✗])\s*/, '$1 ').replace(/ (juste|à corriger)$/, '')]));

await v('ENT-5.7 : déclaration (code, 2de, OTM-C2.2 et C3.2, sur 20, correction, livrée fermée aux élèves), inscrite au registre après ENT-5.6', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-enlevements.js');
    const I = await import('/activites/index.js');
    const C = await import('/core/competences.js');
    const m = A.meta;
    const metas = (await Promise.all(I.ACTIVITES.map((f) => f()))).map((x) => x.meta);
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.correction, m.pret, m.ouverture, m.portee, m.immersif, m.coeur],
      comp: ['OTM-C2.2', 'OTM-C3.2'].every((c) => JSON.stringify(C).includes(c)),
      rang: metas.filter((x) => /^ENT-5\./.test(x.code)).map((x) => x.code) };
  });
  egal(r.m, ['smoby-enlevements', 'ENT-5.7', 'simulog', ['2de'], ['OTM-C2.2', 'OTM-C3.2'], ['D2'], 'guidage', 20, true, true, 'prof', 'eleve', true, true], 'meta');
  vrai(r.comp, 'OTM-C2.2 ou OTM-C3.2 absente de core/competences.js');
  egal(r.rang.slice(r.rang.indexOf('ENT-5.6'), r.rang.indexOf('ENT-5.6') + 2), ['ENT-5.6', 'ENT-5.7'], 'rang dans le registre');
});

await v('ENT-5.7 : le barème — 17 jalons (pas d’atelier avant la panne), 9 + 11 = 20, permis et type 1,5, atelier 2, 8 lignes au bandeau', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent57.js');
    const somme = (L) => Math.round(L.reduce((t, e) => t + e.poids, 0) * 1e6) / 1e6;
    const de = (re) => S.ETAPES.filter((e) => re.test(e.id));
    return { ids: S.ETAPES.map((e) => e.id), total: somme(S.ETAPES), v1: somme(de(/^v1-/)), v2: somme(de(/^v2-/)),
      poids: Object.fromEntries(S.ETAPES.filter((e) => e.id.startsWith('v2-')).map((e) => [e.id.slice(3), e.poids])),
      groupes: [...new Set(S.ETAPES.map((e) => e.groupe))], ecrans: [...new Set(S.ETAPES.map((e) => e.ecran))] };
  });
  egal(r.ids, IDS57, 'les 17 jalons, dans l’ordre');
  egal([r.total, r.v1, r.v2], [20, 9, 11], 'parts du barème');
  egal(r.poids, { chauffeurUnique: 1, permis: 1.5, camionUnique: 1, typeCamion: 1.5, atelier: 2, fenetre: 1, repos: 1, pause: 1, jour: 1 }, 'poids');
  egal(r.groupes, ['Avant la panne : les chauffeurs', 'Avant la panne : les camions', 'Avant la panne : les horaires d’enlèvement',
    'Avant la panne : la conduite et le repos', 'Après la panne : les chauffeurs', 'Après la panne : les camions',
    'Après la panne : les horaires d’enlèvement', 'Après la panne : la conduite et le repos'], 'les 8 lignes du bandeau');
  egal(r.ecrans, ['planning:kn-chauffeurs'], 'écran à rouvrir');
});

// Le corrigé de la trame s'ajoute (17 bis, 09/10/2026) à la suite du corrigé calculé, étapes « (trame) » : on compte ici le corrigé calculé seul.
await v('ENT-5.7 : les deux solutions valent 17 / 17 ; le corrigé se charge', async () => {
  egal(await juger57(CH1, CH2), tous57(true), 'solutions avant / après la panne');
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-5.7.js');
    return [C.CORRIGE.code, C.CORRIGE.items.filter((i) => !/\(trame\)$/.test(String(i.etape))).length, C.CORRIGE.items[1].reponses.find((x) => x[1].startsWith('E1'))];
  });
  egal(c, ['ENT-5.7', 2, ['Julie', 'E1 — Moirans → Lyon — Jouets du Rhône (fictif)', 'Semi n° 1', '06:00 → 10:00', 'prêt dès 06:00, livré avant 12:00']],
    'corrigé (E1 après la panne : celui que reprend ENT-5.8)');
});

await v('ENT-5.7 : garde d’inaction (Q4) — 1er envoi renvoyé tel quel après la panne : 0 sur 9 ; s’il respectait déjà la panne : jugé normalement ; un seul geste changé : l’atelier seul tombe', async () => {
  egal(faux57(await juger57n(CH1, CH1)), IDS57.filter((id) => id.startsWith('v2-')), 'renvoyé tel quel : toutes les cases d’après la panne');
  egal(faux57(await juger57n(CH2, CH2)), [], 'le planning respectait déjà la panne : rien de faux');
  // E5 déplacé d'un quart d'heure plus tard (Julie, Porteur n° 3) : le planning a changé, le Semi n° 2 roule toujours à 08:00.
  const bouge = { ...CH1, E5: { ...CH1.E5, s: CH1.E5.s + 1 } };
  egal(faux57(await juger57n(CH1, bouge)), ['v2-atelier'], 'un geste changé, la panne ignorée');
});

await v('ENT-5.7 : pièges — Marc sur une semi (permis), Nadia avant 10:00 (repos), 7 h sans pause (pause), chacun seul', async () => {
  // Marc fait E3 puis E4 : la pause de Sofiane passe chez lui (sinon 5 h 30 sans pause ferait aussi tomber la pause).
  const marc = { ...CH1, E4: { r: 'marc', s: 27, k: 's1' }, 'pause-2': { r: 'marc', s: 18 } };
  egal(faux57(await juger57n(marc, CH2)), ['v1-permis'], 'Marc sur le Semi n° 1');
  const nadia = { ...CH1, E3: { r: 'nadia', s: 8, k: 'p3' } };
  egal(faux57(await juger57n(nadia, CH2)), ['v1-repos'], 'Nadia à 07:00');
  const sansPause = { ...CH1 };
  delete sansPause['pause-2'];
  egal(faux57(await juger57n(sansPause, CH2)), ['v1-pause'], 'Sofiane 7 h sans pause');
  const sansE5 = { ...CH1 };
  delete sansE5.E5;
  egal(faux57(await juger57n(sansE5, CH2)), IDS57.filter((id) => id.startsWith('v1-')), 'un enlèvement non posé : toute la version fausse');
});

await v('ENT-5.7 : à l’ouverture, Bruno et le responsable K+N, le planning au menu, les mots cliquables ; aucun jalon (inaction 0 / 20)', async () => {
  await monter57();
  egal((await sujets57()).slice().sort(), ACCUEIL57.slice().sort(), 'messages au départ');
  egal(await pg.$$eval(`${T57} .ent-nav`, (L) => L.some((b) => b.dataset.vue === 'planning')), true, 'entrée du planning au menu');
  await pg.click(`${T57} .ent-nav[data-vue="planning"]`);
  const mots = await pg.$$eval(`${Z57} .pl-gauche [data-lex]`, (L) => L.map((b) => b.textContent.trim()));
  vrai(['temps de conduite', 'pause', 'repos journalier', 'semi-remorque', 'porteur'].every((m) => mots.includes(m)), `mots du planning : ${mots}`);
  egal(await etapes57(), tous57('attente'), 'étapes à l’ouverture');
  const s = await dernierScore57();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
  vrai(/kn-besancon/.test(await pg.evaluate(() => JSON.stringify(window.__57.db.mails))), 'adresses de l’agence K+N');
});

await v('ENT-5.7 : parcours juste à l’écran → 1er envoi, panne de l’atelier, planning repris : 20 / 20, bandeau tout juste, puis la suite de l’histoire', async () => {
  await monter57({ uid: 'u-57-juste' });
  await pg.click(`${T57} .ent-nav[data-vue="planning"]`);
  for (const [id, p] of Object.entries(CH1)) await poser57(id, p);
  egal((await sujets57()).length, 2, 'pas de panne avant l’envoi');
  await envoyer57();
  egal((await etapes57()).slice(0, 8), Array(8).fill('ok'), '1er envoi');
  vrai((await sujets57()).includes('Changement : planning à reprendre'), 'la panne n’arrive pas après l’envoi');
  await pg.click(`${T57} .ent-nav[data-vue="planning"]`);
  for (const id of Object.keys(CH1)) await pg.click(`${Z57} [data-pl-id="${id}"][data-pl-vue="b"] [data-pl-act="retirer"]`);
  for (const [id, p] of Object.entries(CH2)) await poser57(id, p);
  await envoyer57();
  egal(await etapes57(), tous57('ok'), 'après la panne');
  proche(await dernierScore57(), 20, 'score remonté au suivi');
  vrai((await sujets57()).includes('RE : Planning de jeudi'), 'la suite de l’histoire');
  const b = await bandeau57();
  vrai(b.length === 8 && b.every((x) => x[0] === 'ok'), 'bandeau tout juste : ' + JSON.stringify(b));
  vrai(!(await pg.$(`${T57} [data-fin-corriger]`)), '« Corriger » alors que tout est juste');
});

await v('ENT-5.7 : rien posé, envoyé deux fois → 0 / 20', async () => {
  await monter57({ uid: 'u-57-rien' });
  await pg.click(`${T57} .ent-nav[data-vue="planning"]`);
  await envoyer57();
  await envoyer57();
  egal((await etapes57()).filter((s) => s === 'ok').length, 0, 'jalons vrais sans rien faire');
  vrai((await sujets57()).includes('RE : Planning de jeudi'), 'les deux envois ont bien eu lieu');
  proche(await dernierScore57(), 0, 'score');
});

await v('ENT-5.7 : « Corriger » — renvoyé tel quel après la panne (0 sur 11), la 5.8 s’ouvre, la 2e version se rouvre, la moyenne, l’accusé du responsable', async () => {
  await monter57({ uid: 'u-57-corr' });
  await pg.click(`${T57} .ent-nav[data-vue="planning"]`);
  for (const [id, p] of Object.entries(CH1)) await poser57(id, p);
  await envoyer57();
  await pg.click(`${T57} .ent-nav[data-vue="planning"]`);
  await envoyer57();
  proche(await dernierScore57(), 9, 'premier bilan : avant la panne seulement');
  egal(await bandeau57(), [['ok', '✓ Avant la panne : les chauffeurs'], ['ok', '✓ Avant la panne : les camions'], ['ok', '✓ Avant la panne : les horaires d’enlèvement'],
    ['ok', '✓ Avant la panne : la conduite et le repos'], ['ko', '✗ Après la panne : les chauffeurs'], ['ko', '✗ Après la panne : les camions'],
    ['ko', '✗ Après la panne : les horaires d’enlèvement'], ['ko', '✗ Après la panne : la conduite et le repos']], 'bandeau');
  egal(await pg.evaluate(() => Object.keys(window.__57.db.points || {})), ['smoby-enlevements'], 'photo du premier bilan (la 5.8 s’ouvre)');
  await pg.click(`${T57} [data-fin-corriger]`);
  await pg.waitForSelector(`${Z57} [data-pl-phase="2"]`);
  egal((await etapes57()).slice(8), Array(9).fill('attente'), 'la 2e version pendant la correction');
  for (const id of Object.keys(CH1)) await pg.click(`${Z57} [data-pl-id="${id}"][data-pl-vue="b"] [data-pl-act="retirer"]`);
  for (const [id, p] of Object.entries(CH2)) await poser57(id, p);
  await envoyer57();
  egal(await etapes57(), tous57('ok'), 'après la correction');
  proche(await dernierScore57(), (9 + 20) / 2, 'moyenne du premier bilan et de l’état à la 1re correction');
  const r = await pg.evaluate(() => ({ c: window.__57.db.indicateurs['smoby-enlevements'].corrections,
    panne: window.__57.db.mails.filter((m) => m.subject === 'Changement : planning à reprendre').length,
    accuse: window.__57.db.mails.filter((m) => m.subject === 'Planning corrigé').map((m) => m.text) }));
  egal([r.c, r.panne], [1, 1], 'une correction, la panne n’est pas rejouée');
  vrai(r.accuse.length === 1 && /bien reçu ton planning corrigé/.test(r.accuse[0]) && !/juste|faux/i.test(r.accuse[0]), 'accusé : ' + JSON.stringify(r.accuse));
});

await v('ENT-5.7 : « meilleur » — un élève qui a fini avec l’ancien barème (10 / 10) garde sa note quand le barème passe à celui de la séance (démonstration)', async () => {
  // Identifiant et barème lus dans `meta` (chantier 13, 09/10/2026) ; seul l'ancien barème (10) est écrit en dur.
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const { meta } = await import('/activites/smoby-enlevements.js');
    const g = 'g-57-meilleur', u = 'u-57-meilleur', a = meta.id, N = meta.bareme;
    await B.poserNote(g, u, a, null);
    await B.ecrireScore(g, u, a, { score: 10, max: 10 });
    await B.ecrireScore(g, u, a, { score: N * 0.6, max: N });         // il rouvre : 60 % du barème courant, plus bas
    const m = (await B.lireScore(g, u, a)).meilleur;
    await B.poserNote(g, u, a, null);
    return { id: a, N, m };
  });
  vrai(r.N > 0 && r.N !== 10, 'meta de la séance : ' + JSON.stringify([r.id, r.N]) + ' (le barème courant doit différer de l’ancien, sinon le cas ne prouve rien)');
  vrai(Math.abs(r.m - r.N) < 0.01, `10/10 devenu ${r.m} sur ${r.N}`);
});

// ── Fiche à remplir, lot 4 suite (05/10/2026, ENT-5.8) : saisies, cadres, envoi incomplet, plusieurs fiches ──
// Une fiche d'essai déclarée ici (l'univers de la page d'essai, ses fiches remplacées). Valeurs écrites à la main.
const monterSaisies = (o = {}) => pg.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { apresFiche } = await import('/core/declencheurs.js');
  const E = await import('/outils/essai-2de.js');
  const U = E.univers({});
  delete U.fiche;
  U.fiches = [{ id: 'essai-saisies', libelle: 'Saisies', titre: 'Saisies', grille: true, entete: '<p>EN-TÊTE</p>', pied: 'Mention en pied',
    blocs: [
      { type: 'cadre', titre: '1. Cadre', large: true, blocs: [
        { type: 'texte', id: 'num', lib: 'N°', valeur: 'LV-1', fige: true },
        { type: 'nombre', id: 'kg', lib: 'Poids', unite: 'kg', manque: 'le poids' }] },
      { type: 'cadre', titre: '2. Cadre', blocs: [{ type: 'heure', id: 'h', lib: 'Heure', manque: 'l’heure' }] },
      { type: 'cadre', titre: '3. Cadre', blocs: [{ type: 'date', id: 'd', lib: 'Date', manque: 'la date' }] },
    ],
    envoi: { bouton: 'Envoyer', a: 'Sophie', incomplet: !!o.incomplet } },
  { id: 'essai-suite', libelle: 'La suite', titre: 'La suite', quand: apresFiche('essai-saisies'),
    blocs: [{ type: 'texte', id: 'mot', lib: 'Un mot' }], envoi: { bouton: 'Envoyer la suite' } }];
  document.querySelector('#smTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'smTest'; document.body.appendChild(hote);
  const db = {};
  window.__s = { db };
  creerEntreprise(U).rendre(hote, {
    meta: { id: 'essai-2de', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
    profil: { prenom: 'Lea', nom: 'T', role: 'eleve', uid: 'u-s' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, lireScore: async () => null, rendreCopie: async () => ({}),
  });
  hote.querySelector('.ent-nav[data-vue="fiche"]').click();
}, o);
const valeursSaisies = () => pg.evaluate(() => JSON.parse(JSON.stringify((window.__s.db.fiches || {})['essai-saisies'] || null)));
const vuesMenu = () => pg.$$eval('#smTest .ent-nav', (L) => L.map((b) => b.dataset.vue).filter((x) => /^fiche/.test(x)));

await v('Fiche, saisies : rangées telles que tapées, sans redessin ; Entrée ne fait pas partir ; une saisie vide manque ; la case préremplie part avec sa valeur', async () => {
  await monterSaisies();
  await pg.waitForSelector(FB);
  egal(await pg.$$eval(`${FB} .ent-cadre-t`, (L) => L.map((h) => h.textContent)), ['1. Cadre', '2. Cadre', '3. Cadre'], 'cadres');
  egal(await pg.$eval(`${FB} #fi-num`, (i) => [i.value, i.readOnly, i.hasAttribute('data-fiche-saisie')]), ['LV-1', true, false], 'case préremplie');
  egal([await pg.textContent(`${FB} .ent-fiche-entete`), await pg.textContent(`${FB} .ent-fiche-pied`)], ['EN-TÊTE', 'Mention en pied'], 'en-tête et pied');
  await pg.$eval(`${FB} form[data-fiche]`, (f) => { f.__marque = true; });
  await pg.fill(`${FB} #fi-kg`, '6 091');
  await pg.press(`${FB} #fi-kg`, 'Enter');
  vrai(!(await pg.$(`${FB} [data-fiche-envoyee]`)), 'Entrée dans une case a envoyé la fiche');
  egal(await pg.evaluate(() => document.activeElement.id), 'fi-kg', 'focus après la saisie');
  vrai(await pg.$eval(`${FB} form[data-fiche]`, (f) => f.__marque === true), 'la fiche a été redessinée');
  await cliquerEtConfirmer(pg, `${FB} [data-fiche-envoyer]`);
  egal(await pg.textContent(`${FB} [data-fiche-manque]`), 'Il manque : l’heure, la date.', 'manque des saisies vides');
  await pg.fill(`${FB} #fi-h`, '11h00');
  await pg.fill(`${FB} #fi-d`, '2026-12-10');
  await cliquerEtConfirmer(pg, `${FB} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${FB} [data-fiche-envoyee]`);
  egal((await valeursSaisies()).valeurs, { kg: '6 091', h: '11h00', d: '2026-12-10', num: 'LV-1' }, 'valeurs envoyées');
  egal(await pg.$$eval(`${FB} input`, (L) => L.every((i) => i.closest('fieldset').disabled)), true, 'figée');
});

await v('Fiche, envoi incomplet : la fiche part avec ses cases vides (null) ; une 2e fiche n’apparaît qu’une fois sa condition vraie, sur son propre écran', async () => {
  await monterSaisies({ incomplet: true });
  await pg.waitForSelector(FB);
  egal(await vuesMenu(), ['fiche'], 'menu avant l’envoi');
  await pg.fill(`${FB} #fi-kg`, '  ');
  await pg.press(`${FB} #fi-kg`, 'Enter');
  vrai(!(await pg.$(`${FB} [data-fiche-envoyee]`)), 'Entrée dans une case a envoyé la fiche incomplète');
  await cliquerEtConfirmer(pg, `${FB} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${FB} [data-fiche-envoyee]`);
  egal((await valeursSaisies()).valeurs, { kg: null, num: 'LV-1', h: null, d: null }, 'valeurs envoyées vides');
  egal(await vuesMenu(), ['fiche', 'fiche:essai-suite'], 'menu après l’envoi');
  await pg.click('#smTest .ent-nav[data-vue="fiche:essai-suite"]');
  egal(await pg.textContent(`${FB} [data-fiche-envoyer]`), 'Envoyer la suite', 'écran de la 2e fiche');
  await cliquerEtConfirmer(pg, `${FB} [data-fiche-envoyer]`);
  egal(await pg.textContent(`${FB} [data-fiche-manque]`), 'Il manque : « Un mot ».', 'la 2e fiche refuse l’envoi incomplet');
  await pg.click('#smTest .ent-nav[data-vue="fiche"]');
  vrai(!!(await pg.$(`${FB} [data-fiche-envoyee]`)) && !(await pg.$(`${FB} [data-fiche-manque]`)), 'la 1re fiche a pris l’état de la 2e');
});

await v('Fiche, saisies : lecture des nombres et des heures (lireNombre, lireHeure), et la copie de la séance ENT-5.8 dit la même chose', async () => {
  const r = await pg.evaluate(async () => {
    const F = await import('/core/types/fiche.js');
    const S = await import('/contenus/smoby-ent58.js');
    const N = ['6 091', '6091', '6 091', ' 33 ', '2,5', '6.091', '6 091 kg', '', null, 'abc'];
    const H = ['11:00', '11h00', '11 h', '11H', '9:05', '11:0', '24:00', '11:60', '', 'onze'];
    return { n: N.map(F.lireNombre), h: H.map(F.lireHeure), memeN: N.every((x) => Object.is(F.lireNombre(x), S.lireNombre(x))),
      memeH: H.every((x) => Object.is(F.lireHeure(x), S.lireHeure(x))) };
  });
  egal(r.n, [6091, 6091, 6091, 33, 2.5, 6.091, null, null, null, null], 'nombres');
  egal(r.h, [660, 660, 660, 660, 545, null, null, null, null, null], 'heures');
  vrai(r.memeN && r.memeH, 'la séance et le moteur ne lisent pas pareil');
});

// ── ENT-5.8 « la lettre de voiture et le retard » (brief `docs/briefs/ENT-5.8-smoby-lettre-voiture.md`) ─────────
// La séance réelle, montée par son activité. Les attendus sont écrits à la main d'après le brief.
const T58 = '#s58';
const Z58 = `${T58} .ent-main`;
const F58 = `${Z58} .ent-fiche`;
const monter58 = (o = {}) => pg.evaluate(async (o) => {
  const act = await import('/activites/smoby-lettre-voiture.js');
  ['#smTest', '#s51', '#s52', '#s57', '#s58'].forEach((s) => document.querySelector(s)?.remove());
  const hote = document.createElement('div'); hote.id = 's58'; document.body.appendChild(hote);
  const db = {};
  window.__58 = { db, suivi: [] };
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-58' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__58.suivi.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
  });
}, o);
const etapes58 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent58.js');
  return S.ETAPES.map((e) => e.verifier(window.__58.db).status);
});
const details58 = () => pg.evaluate(async () => {
  const S = await import('/contenus/smoby-ent58.js');
  return S.ETAPES.map((e) => e.verifier(window.__58.db).detail || '');
});
const dernierScore58 = () => pg.evaluate(() => { const s = window.__58.suivi; return s.length ? [s[s.length - 1].score, s[s.length - 1].max] : null; });
const sujets58 = () => pg.evaluate(() => window.__58.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
const nav58 = (vue) => pg.click(`${T58} .ent-nav[data-vue="${vue}"]`);
const ouvrirMail58 = async (sujet) => {
  await nav58('mail');
  await pg.click(`${Z58} [data-dossier="in"]`);
  await pg.click(`${Z58} .ent-obj:text-is("${sujet}")`);
};
// La lettre juste, écrite à la main : Smoby → Jouets du Rhône, K+N, Julie sur le Semi n° 1, jeudi 10/12,
// 33 palettes, 6 091 kg (32 × 180 + la palette mixte de 331 kg d'ENT-5.6).
const LETTRE58 = {
  date: '2026-12-10', expNom: 'smoby', expLieu: 'moirans', destNom: 'jdr', destLieu: 'corbas',
  transporteur: 'kn', chauffeur: 'julie', vehicule: 's1', chargLieu: 'moirans', chargDate: '2026-12-10',
  livLieu: 'corbas', livDate: '2026-12-10', nature: 'jouets', palettes: '33', poids: '6 091',
};
async function envoyerLettre58(remplace = {}) {
  await ouvrirMail58('Lettre de voiture d’E1');
  await pg.click(`${Z58} .ent-lecteur button:has-text("Ouvrir la lettre de voiture")`);
  await pg.waitForSelector(F58);
  for (const [k, x] of Object.entries({ ...LETTRE58, ...remplace })) {
    if (x == null) continue;
    const tag = await pg.$eval(`${F58} #fi-${k}`, (el) => el.tagName);
    if (tag === 'SELECT') await pg.selectOption(`${F58} #fi-${k}`, x); else await pg.fill(`${F58} #fi-${k}`, x);
  }
  await cliquerEtConfirmer(pg, `${F58} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F58} [data-fiche-envoyee]`);
}
async function envoyerSuivi58({ heure = '11:00', avant = 'Oui' } = {}) {
  await ouvrirMail58('E1 : accident sur l’A40');
  await pg.click(`${Z58} .ent-lecteur button:has-text("Ouvrir le suivi de l’enlèvement E1")`);
  await pg.waitForSelector(`${F58} #fi-arrivee`);
  await pg.fill(`${F58} #fi-arrivee`, heure);
  await pg.check(`${F58} input[data-fiche-champ="avant"][value="${avant}"]`);
  await cliquerEtConfirmer(pg, `${F58} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F58} [data-fiche-envoyee]`);
}
const CLIENT58 = {
  salut: 'Bonjour,', cause: 'Notre camion a 1 h de retard à cause d’un accident sur l’A40.',
  heure: 'Il arrivera vers 11 h 00, avant votre heure limite.', quai: 'Pouvez-vous nous confirmer que le quai 4 sera libre ?',
  fin: 'Cordialement, l’exploitation Kuehne+Nagel Besançon',
};
const SMOBY58 = {
  salut: 'Bonjour Bruno,', retard: 'La livraison E1 pour Jouets du Rhône aura 1 h de retard (accident).',
  client: 'Le client est prévenu.', fin: 'Cordialement,',
};
async function repondre58(sujet, lignes) {
  await ouvrirMail58(sujet);
  await pg.click(`${Z58} [data-repondre]`);
  await pg.waitForSelector(`${Z58} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) await pg.selectOption(`${Z58} [data-phrase="${l}"]`, { label: t });
  await cliquerEtConfirmer(pg, `${Z58} #formPhr button[type="submit"]`);
}
async function parcours58({ lettre = {}, suivi = {}, client = {}, smoby = {} } = {}) {
  await envoyerLettre58(lettre);
  await envoyerSuivi58(suivi);
  await repondre58('Livraison E1 de ce matin', { ...CLIENT58, ...client });
  await repondre58('E1 bien parti ?', { ...SMOBY58, ...smoby });
}
// Lot 1 de SMOBY-notation-5.3-5.8 (07/10/2026) : 26 jalons, une case = un jalon. Écrits à la main, dans l'ordre.
const LETTRE_IDS58 = ['expNom', 'expLieu', 'destNom', 'destLieu', 'transporteur', 'chauffeur', 'vehicule',
  'date', 'chargLieu', 'chargDate', 'livLieu', 'livDate', 'nature', 'palettes', 'poids'].map((k) => `lettre-${k}`);
const IDS58 = [...LETTRE_IDS58, 'suivi-heure', 'suivi-avant',
  'client-cause', 'client-heure', 'client-quai', 'client-salut', 'client-fin', 'smoby-retard', 'smoby-client', 'smoby-salut', 'smoby-fin'];
// Les statuts attendus : `ok` partout, sauf les identifiants de `ko` (et `autre` pour ceux de `sauf`).
const cases58 = (ok, ko = []) => IDS58.map((id) => (ko.includes(id) ? 'ko' : ok));
const detail58 = (id) => pg.evaluate(async (id) => {
  const S = await import('/contenus/smoby-ent58.js');
  return S.ETAPES.find((e) => e.id === id).verifier(window.__58.db).detail || '';
}, id);
const bandeau58 = () => pg.$$eval(`${T58} [data-fin-seance] [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finEtat, x.textContent.replace(/\s+/g, ' ').trim().replace(/^([✓✗])\s*/, '$1 ').replace(/ (juste|à corriger)$/, '')]));

await v('ENT-5.8 : déclaration (code, 2de, OTM-C2.1 et C2.3, sur 20, correction, livrée fermée aux élèves), inscrite au registre après ENT-5.7', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-lettre-voiture.js');
    const I = await import('/activites/index.js');
    const C = await import('/core/competences.js');
    const m = A.meta;
    const metas = (await Promise.all(I.ACTIVITES.map((f) => f()))).map((x) => x.meta);
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.correction, m.pret, m.ouverture, m.portee, m.immersif, m.coeur],
      comp: ['OTM-C2.1', 'OTM-C2.3'].every((c) => JSON.stringify(C).includes(c)),
      rang: metas.filter((x) => /^ENT-5\./.test(x.code)).map((x) => x.code) };
  });
  egal(r.m, ['smoby-lettre-voiture', 'ENT-5.8', 'simulog', ['2de'], ['OTM-C2.1', 'OTM-C2.3'], ['D3', 'D1'], 'guidage', 20, true, true, 'prof', 'eleve', true, true], 'meta');
  vrai(r.comp, 'OTM-C2.1 ou OTM-C2.3 absente de core/competences.js');
  egal(r.rang.slice(-2), ['ENT-5.7', 'ENT-5.8'], 'rang dans le registre');
});

await v('ENT-5.8 : le barème — 26 jalons, parts 3 / 2,25 / 2,5 / 3,25 / 2 / 4 / 3, total 20, 9 lignes au bandeau', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent58.js');
    const somme = (L) => Math.round(L.reduce((t, e) => t + e.poids, 0) * 1e6) / 1e6;
    const groupes = [...new Set(S.ETAPES.map((e) => e.groupe))];
    return { ids: S.ETAPES.map((e) => e.id), total: somme(S.ETAPES), groupes,
      parts: groupes.map((g) => somme(S.ETAPES.filter((e) => e.groupe === g))),
      poids: ['lettre-palettes', 'lettre-poids', 'suivi-heure', 'suivi-avant', 'client-cause', 'client-salut'].map((id) => S.ETAPES.find((e) => e.id === id).poids),
      ecrans: [...new Set(S.ETAPES.map((e) => e.ecran))] };
  });
  egal(r.ids, IDS58, 'les 26 jalons, dans l’ordre');
  egal(r.total, 20, 'total');
  egal(r.groupes, ['Lettre : les parties', 'Lettre : le transport', 'Lettre : lieux et dates', 'Lettre : la marchandise', 'Le suivi de l’enlèvement',
    'Message au client : les informations', 'Message au client : le ton', 'Message à Smoby : les informations', 'Message à Smoby : le ton'], 'les 9 lignes du bandeau');
  egal(r.parts, [3, 2.25, 2.5, 3.25, 2, 3, 1, 2, 1], 'parts par ligne');
  egal(r.poids, [1, 1.5, 1.5, 0.5, 1, 0.5], 'poids de quelques cases');
  egal(r.ecrans, ['fiche:lettre', 'fiche:suivi', 'phrases:message-client', 'phrases:message-smoby'], 'écrans à rouvrir');
});

await v('ENT-5.8 : valeurs calculées — 6 091 kg (et la palette mixte pèse ce que dit le moteur d’ENT-5.6), départ 06:00, arrivée 11:00 ; le corrigé se charge', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent58.js');
    const P = await import('/contenus/smoby-ent56.js');
    const EN = await import('/core/types/entrepot.js');
    const C = (await import('/contenus/corriges/ENT-5.8.js')).CORRIGE;
    return { v: [S.POIDS, S.KG_MIXTE, S.DEPART, S.ARRIVEE_PREVUE, S.ARRIVEE, S.LIMITE, S.ATTENDU.chauffeur, S.ATTENDU.vehicule],
      moteur: EN.attendusPreparation(P.ENTREPOT).poids, c: [C.code, C.items.filter((i) => !/\(trame\)$/.test(String(i.etape))).length, C.items[0].reponses[4][1], C.items[0].reponses[7][1], C.items[1].rep] };
  });
  egal(r.v, [6091, 331, 360, 600, 660, 720, 'julie', 's1'], 'valeurs');
  egal(r.moteur, 331, 'poids de la palette mixte selon le moteur');
  egal(r.c.slice(0, 4), ['ENT-5.8', 4, 'Julie · Semi n° 1', 'Jouets (maisons de jardin, cuisines, porteurs) · 33 palettes · 6 091 kg'], 'corrigé');
  vrai(r.c[4].startsWith('06:00 + 4 h de conduite = 10:00 prévu ; + 1 h de retard = 11:00. Oui'), `corrigé, heure : ${r.c[4]}`);
});

await v('ENT-5.8 : inaction 0 / 20 — lettre envoyée vide : ses 15 cases fausses ; le suivi refuse de partir vide', async () => {
  await monter58();
  egal(await etapes58(), cases58('attente'), 'avant tout geste');
  await ouvrirMail58('Lettre de voiture d’E1');
  await pg.click(`${Z58} .ent-lecteur button:has-text("Ouvrir la lettre de voiture")`);
  await cliquerEtConfirmer(pg, `${F58} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F58} [data-fiche-envoyee]`);
  egal(await etapes58(), cases58('attente', LETTRE_IDS58), 'lettre vide');
  egal(await detail58('lettre-poids'), 'Case vide.', 'détail d’une case vide');
  await nav58('fiche:suivi');
  await cliquerEtConfirmer(pg, `${F58} [data-fiche-envoyer]`);
  egal(await pg.textContent(`${F58} [data-fiche-manque]`), 'Il manque : l’heure d’arrivée, la réponse oui / non.', 'suivi vide');
  egal((await etapes58()).filter((s) => s === 'ok').length, 0, 'jalons vrais sans rien faire');
  const s = await dernierScore58();
  vrai(!s || s[0] === 0, `score sans rien faire : ${JSON.stringify(s)}`);
});

await v('ENT-5.8 : le retard n’arrive qu’après l’envoi de la lettre (message de Julie, suivi au menu et dans le mail) ; puis le client, puis Smoby', async () => {
  await monter58();
  egal(await sujets58(), ['Lettre de voiture d’E1'], 'messages au départ');
  egal(await pg.$$eval(`${T58} .ent-nav`, (L) => L.map((b) => b.dataset.vue)), ['accueil', 'mail', 'fiche'], 'menu au départ');
  // La lettre remplie mais pas envoyée : rien n'arrive.
  await ouvrirMail58('Lettre de voiture d’E1');
  await pg.click(`${Z58} .ent-lecteur button:has-text("Ouvrir la lettre de voiture")`);
  await pg.selectOption(`${F58} #fi-expNom`, 'smoby');
  await nav58('mail');
  egal(await sujets58(), ['Lettre de voiture d’E1'], 'messages avant l’envoi');
  await envoyerLettre58({ poids: '5760' });
  egal(await sujets58(), ['Lettre de voiture d’E1', 'E1 : accident sur l’A40'], 'après la lettre (même fausse)');
  egal(await pg.$$eval(`${T58} .ent-nav`, (L) => L.map((b) => b.dataset.vue)), ['accueil', 'mail', 'fiche', 'fiche:suivi'], 'menu après la lettre');
  await envoyerSuivi58();
  vrai((await sujets58()).includes('Livraison E1 de ce matin') && !(await sujets58()).includes('E1 bien parti ?'), 'après le suivi : le client seul');
  await repondre58('Livraison E1 de ce matin', CLIENT58);
  vrai((await sujets58()).includes('E1 bien parti ?'), 'Smoby après le client');
  await repondre58('E1 bien parti ?', SMOBY58);
  vrai((await sujets58()).includes('RE : Lettre de voiture d’E1'), 'message de fin');
  egal(await etapes58(), cases58('ok', ['lettre-poids']), 'poids faux (32 × 180 kg, sans la palette mixte)');
  proche(await dernierScore58(), 18.5, 'le poids pèse 1,5');
});

await v('ENT-5.8 : parcours juste à l’écran, 20 / 20, score remonté au suivi, bandeau tout juste', async () => {
  await monter58();
  await parcours58();
  egal(await etapes58(), cases58('ok'), 'jalons');
  proche(await dernierScore58(), 20, 'score');
  const b = await bandeau58();
  vrai(b.length === 9 && b.every((x) => x[0] === 'ok'), 'bandeau tout juste : ' + JSON.stringify(b));
});

await v('ENT-5.8 : pièges — chaque case tombe seule (inversés, poids vide, 10:00, « Non », 10 h 00 au client, Smoby transporteur, demander à Smoby)', async () => {
  await monter58();
  await parcours58({ lettre: { expNom: 'jdr', expLieu: 'corbas', destNom: 'smoby', destLieu: 'moirans' } });
  egal(await etapes58(), cases58('ok', ['lettre-expNom', 'lettre-expLieu', 'lettre-destNom', 'lettre-destLieu']), 'inversés');
  vrai((await detail58('lettre-expNom')).includes('inversés'), 'le bilan dit « inversés »');
  await monter58();
  await parcours58({ lettre: { poids: null } });
  egal(await etapes58(), cases58('ok', ['lettre-poids']), 'poids vide');
  await monter58();
  await parcours58({ suivi: { heure: '10:00' } });
  egal(await etapes58(), cases58('ok', ['suivi-heure']), '10:00 au suivi');
  vrai((await detail58('suivi-heure')).includes('il manque le retard'), 'le bilan dit « il manque le retard »');
  await monter58();
  await parcours58({ suivi: { avant: 'Non' } });
  egal(await etapes58(), cases58('ok', ['suivi-avant']), '« Non » au suivi');
  await monter58();
  await parcours58({ lettre: { transporteur: 'smoby' }, client: { heure: 'Il arrivera vers 10 h 00, avant votre heure limite.' },
    smoby: { client: 'Pouvez-vous prévenir le client ?' } });
  egal(await etapes58(), cases58('ok', ['lettre-transporteur', 'client-heure', 'smoby-client']),
    'Smoby transporteur, 10 h 00 au client, demander à Smoby de prévenir le client');
  proche(await dernierScore58(), 20 - 0.75 - 1 - 1, 'chaque case coûte son poids');
  await monter58();
  await parcours58({ client: { salut: 'Coucou', fin: 'Bisous' } });
  egal(await etapes58(), cases58('ok', ['client-salut', 'client-fin']), 'le ton au client');
  egal((await bandeau58()).filter((x) => x[0] === 'ko').map((x) => x[1]), ['✗ Message au client : le ton'], 'une seule ligne du bandeau');
});

await v('ENT-5.8 : « Corriger » — la séance est finie au premier bilan, la lettre se rouvre (le Suivi reste au menu), puis le message ; la moyenne ; les accusés ; Julie n’écrit qu’une fois', async () => {
  await monter58({ uid: 'u-58-corr' });
  await parcours58({ lettre: { transporteur: 'smoby' }, client: { heure: 'Il arrivera vers 10 h 00, avant votre heure limite.' } });
  const bilan1 = 20 - 0.75 - 1;
  proche(await dernierScore58(), bilan1, 'premier bilan');
  egal((await bandeau58()).filter((x) => x[0] === 'ko').map((x) => x[1]), ['✗ Lettre : le transport', '✗ Message au client : les informations'], 'bandeau');
  egal(await pg.evaluate(() => Object.keys(window.__58.db.points || {})), ['smoby-lettre-voiture'], 'photo du premier bilan');
  await pg.click(`${T58} [data-fin-corriger]`);
  await pg.waitForSelector(`${F58} [data-fiche-envoyer]`);
  egal(await pg.$$eval(`${T58} .ent-nav`, (L) => L.map((b) => b.dataset.vue)), ['accueil', 'mail', 'fiche', 'fiche:suivi'], 'le Suivi reste au menu (Q6)');
  egal((await etapes58()).slice(0, 15), Array(15).fill('attente'), 'la lettre rouverte repasse « à faire »');
  await pg.selectOption(`${F58} #fi-transporteur`, 'kn');
  await cliquerEtConfirmer(pg, `${F58} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F58} [data-fiche-envoyee]`);
  egal(await etapes58(), cases58('ok', ['client-heure']), 'la lettre corrigée');
  proche(await dernierScore58(), (bilan1 + 19) / 2, 'moyenne du premier bilan et de l’état à la 1re correction');
  await pg.click(`${T58} [data-fin-corriger]`);
  await pg.waitForSelector(`${Z58} #formPhr:not([hidden])`);
  await pg.selectOption(`${Z58} [data-phrase="heure"]`, { label: CLIENT58.heure });
  await cliquerEtConfirmer(pg, `${Z58} #formPhr button[type="submit"]`);
  egal(await etapes58(), cases58('ok'), 'après les deux corrections');
  proche(await dernierScore58(), (bilan1 + 19) / 2, 'la note ne bouge plus');
  const r = await pg.evaluate(() => {
    const M = window.__58.db.mails.filter((m) => m.folder === 'in');
    return { c: window.__58.db.indicateurs['smoby-lettre-voiture'].corrections, julie: M.filter((m) => m.subject === 'E1 : accident sur l’A40').length,
      client: M.filter((m) => m.subject === 'Livraison E1 de ce matin').length,
      accuses: M.filter((m) => /corrigé/.test(m.subject)).map((m) => [m.subject, m.text]) };
  });
  egal([r.c, r.julie, r.client], [2, 1, 1], 'deux corrections, Julie et le client n’écrivent qu’une fois');
  egal(r.accuses.map((x) => x[0]), ['Lettre de voiture corrigée', 'Votre message corrigé'], 'les accusés');
  vrai(r.accuses.every((x) => !/juste|faux/i.test(x[1])), 'un accusé ne dit jamais juste ou faux');
});

await v('ENT-5.8 : « meilleur » — un élève qui a fini avec l’ancien barème (8 / 8) garde sa note quand le barème passe à celui de la séance (démonstration)', async () => {
  // Identifiant et barème lus dans `meta` (chantier 13, 09/10/2026) ; seul l'ancien barème (8) est écrit en dur.
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const { meta } = await import('/activites/smoby-lettre-voiture.js');
    const g = 'g-58-meilleur', u = 'u-58-meilleur', a = meta.id, N = meta.bareme;
    await B.poserNote(g, u, a, null);
    await B.ecrireScore(g, u, a, { score: 8, max: 8 });
    await B.ecrireScore(g, u, a, { score: N * 0.6, max: N });         // il rouvre : 60 % du barème courant, plus bas
    const m = (await B.lireScore(g, u, a)).meilleur;
    await B.poserNote(g, u, a, null);
    return { id: a, N, m };
  });
  vrai(r.N > 0 && r.N !== 8, 'meta de la séance : ' + JSON.stringify([r.id, r.N]) + ' (le barème courant doit différer de l’ancien, sinon le cas ne prouve rien)');
  vrai(Math.abs(r.m - r.N) < 0.01, `8/8 devenu ${r.m} sur ${r.N}`);
});

// ── Lot 0 de SMOBY-notation-5.3-5.8 (07/10/2026, règle absolue de Tristan) : aucun élève bloqué en fin de séance ──
// Pour chaque séance de 5.3 à 5.8, le PIRE CAS à l'écran (tout faux, ou le geste irréversible raté) : à la fin, la
// photo de fin de séance est rangée (c'est elle qui ouvre la suivante, core/parcours.js) et le bandeau ne dit plus
// « La séance suivante s'ouvrira quand tout sera juste ». Sabotage : retirer `suiteAuBilan` d'une séance fait tomber son cas.
const finLot0 = (hote, win, id) => pg.evaluate(([hote, win, id]) => {
  const b = document.querySelector(`${hote} [data-fin-seance] [data-fin]`);
  return { photo: !!(window[win].db.points && window[win].db.points[id]), bandeau: b ? b.dataset.fin : null,
    texte: b ? b.textContent.replace(/\s+/g, ' ') : '' };
}, [hote, win, id]);
const pasBloque = async (hote, win, id, quoi) => {
  const f = await finLot0(hote, win, id);
  vrai(f.photo, `${quoi} : pas de photo de fin, la séance suivante resterait fermée`);
  egal(f.bandeau, 'ko', `${quoi} : bandeau de fin`);
  vrai(!/quand tout sera juste/.test(f.texte), `${quoi} : le bandeau dit encore « quand tout sera juste »`);
};

await v('Lot 0 : 5.3 à 5.8 déclarent toutes `suiteAuBilan` ou `correction` (la suite s’ouvre à la fin, justes ou faux)', async () => {
  const r = await pg.evaluate(async () => {
    const L = ['visite', 'reception', 'rangement', 'preparation', 'enlevements', 'lettre-voiture'];
    return Promise.all(L.map(async (n) => { const m = (await import(`/activites/smoby-${n}.js`)).meta; return m.suiteAuBilan === true || m.correction === true; }));
  });
  egal(r, Array(6).fill(true), '5.3, 5.4, 5.5, 5.6, 5.7, 5.8');
});

await v('Lot 0 : ENT-5.3 — l’adresse décomposée fausse (une seule validation, irréversible) : la 5.4 s’ouvre', async () => {
  await parcours53({ uid: 'u-53-pire', fautes: { ciel: true, adresse: true, clics: 1 } });
  const st = await etapes53();
  vrai(st.every((x) => x === 'ok' || x === 'ko') && st[19] === 'ko' && st[20] === 'ko', `étapes : ${st.join(' ')}`);
  await pasBloque(T53, '__53', 'smoby-visite', 'ENT-5.3');
});

await v('Lot 0 : ENT-5.4 — rien signalé, constat faux, tout accepté sans réserve, BL signé, compte rendu faux : la 5.5 s’ouvre', async () => {
  await parcours54({ uid: 'u-54-pire', secu: { constat: { ...SECU54, epi: 'ko' }, signalerAvant: false },
    decisions: { P1: [8, 'accepter'], P2: [45, 'accepter'], P3: [36, 'accepter'], P4: [36, 'accepter'] }, reserves: {},
    phrases: { reserves: 'Tout est conforme.' } });
  const st = await etapes54();
  egal(Object.values(st).filter((x) => x !== 'ok' && x !== 'ko'), [], 'tout est jugé');
  egal(Object.entries(st).filter(([, x]) => x === 'ok').map(([k]) => k).sort(),
    ['P1-comptage', 'P1-decision', 'P2-comptage', 'P2-decision', 'P3-comptage', 'message-fin', 'message-salutation', 'signature'], 'seuls justes');
  await pasBloque(T54, '__54', 'smoby-reception', 'ENT-5.4');
});

await v('Lot 0 : ENT-5.5 — palettes mal rangées, saisie fausse (validée : irréversible), stock et message faux : la 5.6 s’ouvre', async () => {
  await parcours55({ uid: 'u-55-pire', place: { P1: 'L1', P2: 'L2', P3: 'A1-T01-N1-E3', P4: 'B2-T02-N1-E2' },
    saisie: { ...SAISIE55, 'SMB-NJL': [8, 6, 'ok', 'accepte'], 'SMB-EBD': [36, 36, 'ok', 'accepte'], 'SMB-PLS': [36, 36, 'ok', 'accepte'] },
    stock: { stock: 'Il y a maintenant 396 cartons de porteurs Little Smoby en stock.' },
    kn: { depart: 'La commande de Noël pourra partir vendredi 11 décembre.' } });
  const st = await etapes55();
  egal(Object.values(st).filter((x) => x !== 'ko'), [], `tout faux : ${JSON.stringify(st)}`);
  await pasBloque(T55, '__55', 'smoby-rangement', 'ENT-5.5');
});

await v('Lot 0 : ENT-5.6 — une seule ligne, mauvais film, une étiquette, terminée et vérifiée : la 5.7 s’ouvre ; rien avant « Vérifier »', async () => {
  await monter56({ uid: 'u-56-pire' });
  await pg.click(`${T56} .ent-nav[data-vue="entrepot"]`);
  await prelever56(...L56[0]);
  for (let i = 0; i < 4 && await pg.$(`${P56} [data-pe="retour"]`); i++) await pg.click(`${P56} [data-pe="retour"]`);
  await pg.click(`${P56} [data-pe="terminer"]`);
  await pg.selectOption(`${P56} [data-pe-film]`, '2');
  await pg.check(`${P56} [data-pe-etiq="avant"]`);
  egal((await finLot0(T56, '__56', 'smoby-preparation')).photo, false, 'photo avant « Vérifier ma préparation »');
  await pg.click(`${P56} [data-pe="verifierPrep"]`);
  egal(Object.values(await etapes56()).filter((x) => x === 'ok'), [], 'aucun jalon juste');
  await pasBloque(T56, '__56', 'smoby-preparation', 'ENT-5.6');
  // « Reprendre la préparation » ne referme pas la suite.
  await pg.click(`${P56} [data-pe="reprendre"]`);
  egal((await finLot0(T56, '__56', 'smoby-preparation')).photo, true, 'photo gardée après « Reprendre »');
});

await v('Lot 0 : ENT-5.7 — rien posé, envoyé avant et après la panne : la 5.8 s’ouvre', async () => {
  await monter57({ uid: 'u-57-pire' });
  await pg.click(`${T57} .ent-nav[data-vue="planning"]`);
  await envoyer57();
  await envoyer57();
  egal(await etapes57(), tous57('ko'), 'tout faux');
  await pasBloque(T57, '__57', 'smoby-enlevements', 'ENT-5.7');
});

await v('Lot 0 : ENT-5.8 — lettre vide, suivi faux, messages faux : la séance est finie (photo rangée)', async () => {
  await monter58({ uid: 'u-58-pire' });
  await parcours58({ lettre: Object.fromEntries(Object.keys(LETTRE58).map((k) => [k, null])), suivi: { heure: '10:00', avant: 'Non' },
    client: { salut: 'Coucou', cause: 'Notre camion ne pourra pas livrer aujourd’hui.', heure: 'Il arrivera vers 10 h 00, avant votre heure limite.',
      quai: 'Pouvez-vous nous confirmer que le quai 1 sera libre ?', fin: 'Bisous' },
    smoby: { salut: 'Salut !', retard: 'La livraison E1 pour Jouets du Rhône est annulée.', client: 'Pouvez-vous prévenir le client ?', fin: 'Bisous' } });
  const st = await etapes58();
  egal(st.filter((x) => x !== 'ko'), [], `tout faux : ${st.join(' ')}`);
  await pasBloque(T58, '__58', 'smoby-lettre-voiture', 'ENT-5.8');
});

// ── 17 bis (09/10/2026) : trames et fiche d'intention Smoby relues par Tristan, donc déclarées ──────────────────────
// La séance réelle est montée par son activité. Tout est écrit À LA MAIN (noms de fichiers, nombres de questions des
// corrigés de trame d'après le brief COWORK-trames-smoby-5.3-5.8) : rien n'est relu dans le code qu'on éprouve.
// `n` = numéro de la séance, `nom` = nom de l'activité, `base` = nom de la trame, `q` = questions de la trame au corrigé.
const TRAMES_SMOBY = [
  { code: 'ENT-5.3', act: 'smoby-visite', base: 'ENT-5.3-smoby-visite-trame-eleve', q: 39, declare: undefined, fichier: './contenus/corriges/ENT-5.3-trame.js' },
  { code: 'ENT-5.4', act: 'smoby-reception', base: 'ENT-5.4-smoby-reception-trame-eleve', q: 37, declare: './contenus/corriges/ENT-5.4.js', fichier: './contenus/corriges/ENT-5.4.js' },
  { code: 'ENT-5.5', act: 'smoby-rangement', base: 'ENT-5.5-smoby-rangement-trame-eleve', q: 32, declare: './contenus/corriges/ENT-5.5.js', fichier: './contenus/corriges/ENT-5.5.js' },
  { code: 'ENT-5.6', act: 'smoby-preparation', base: 'ENT-5.6-smoby-preparation-trame-eleve', q: 36, declare: './contenus/corriges/ENT-5.6.js', fichier: './contenus/corriges/ENT-5.6.js' },
  { code: 'ENT-5.7', act: 'smoby-enlevements', base: 'ENT-5.7-smoby-enlevements-trame-eleve', q: 39, declare: './contenus/corriges/ENT-5.7.js', fichier: './contenus/corriges/ENT-5.7.js' },
  { code: 'ENT-5.8', act: 'smoby-lettre-voiture', base: 'ENT-5.8-smoby-lettre-voiture-trame-eleve', q: 35, declare: './contenus/corriges/ENT-5.8.js', fichier: './contenus/corriges/ENT-5.8.js' },
];
const INTENTION_SMOBY = { pdf: './contenus/intentions/smoby-intention-pedagogique.pdf', docx: './contenus/intentions/smoby-intention-pedagogique.docx' };
// Monte la séance (fichier d'activité `smoby-<fichier>.js`) en élève ou en enseignant ; rend les liens `download` du bandeau.
const monterTrameSmoby = async (fichier, role, intention) => {
  await pg.evaluate(async ([fichier, role, intention]) => {
    const act = await import(`/activites/${fichier}.js`);
    document.getElementById('sTrame')?.remove();
    const hote = document.createElement('div'); hote.id = 'sTrame'; document.body.appendChild(hote);
    const db = {};
    act.rendre(hote, {
      meta: act.meta, profil: { prenom: 'Lea', nom: 'Test', role, uid: 'u-trame' },
      jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
      lireScore: async () => null, intention,
    });
  }, [fichier, role, intention]);
  await pg.waitForSelector('#sTrame .ent-bandeau');
  return pg.$$eval('#sTrame .ent-bandeau a[download]', (L) => L.map((a) => ({ href: a.getAttribute('href'), intention: a.hasAttribute('data-intention') })));
};
const statut = (url) => pg.evaluate(async (u) => (await fetch(u, { cache: 'no-store' })).status, url);

await v('Trames Smoby (17 bis) : chaque séance de 5.3 à 5.8 montre ses deux liens de trame à l’élève (PDF puis Word), les fichiers sont servis', async () => {
  for (const t of TRAMES_SMOBY) {
    const liens = (await monterTrameSmoby(t.act, 'eleve', null)).filter((l) => !l.intention).map((l) => l.href);
    egal(liens, [`./contenus/trames/${t.base}.pdf`, `./contenus/trames/${t.base}.docx`], `${t.code} : liens de trame du bandeau`);
    for (const l of liens) egal(await statut(l.replace(/^\./, '')), 200, `${t.code} : ${l} servi`);
    vrai(!/Tout à l.écran/.test(await pg.textContent('#sTrame .ent-bandeau')), `${t.code} : l’étiquette « Tout à l’écran » est encore là`);
  }
});

await v('Trames Smoby (17 bis) : le corrigé de chaque séance porte la trame (5.4 à 5.8 : après le corrigé calculé, étapes « (trame) » ; 5.3 : pas de corrigé déclaré, le fichier de trame se charge)', async () => {
  for (const t of TRAMES_SMOBY) {
    const r = await pg.evaluate(async ([act, fichier]) => {
      const { meta } = await import(`/activites/${act}.js`);
      const C = (await import(fichier.replace(/^\./, ''))).CORRIGE;
      return { declare: meta.corrige, trame: C.trame, code: C.code, nTrame: C.items.filter((i) => /\(trame\)$/.test(String(i.etape))).length, n: C.items.length };
    }, [t.act, t.fichier]);
    egal(r.declare, t.declare, `${t.code} : corrigé déclaré par la séance`);
    egal([r.code, r.trame], [t.code, t.base], `${t.code} : code et trame du corrigé`);
    if (t.code === 'ENT-5.3') egal(r.n, t.q, `${t.code} : questions du corrigé (celui de la trame)`);
    else { egal(r.nTrame, t.q, `${t.code} : questions « (trame) » ajoutées au corrigé calculé`); vrai(r.n > r.nTrame, `${t.code} : plus de corrigé calculé`); }
  }
});

await v('Fiche d’intention Smoby (17 bis) : déclarée pour 5.1 à 5.8, fichiers servis ; à l’enseignant dans le bandeau, jamais à l’élève', async () => {
  const r = await pg.evaluate(async () => {
    const { intentionDe } = await import('/activites/index.js');
    return ['ENT-5.1', 'ENT-5.3', 'ENT-5.8'].map((c) => intentionDe(c));
  });
  egal(r, [INTENTION_SMOBY, INTENTION_SMOBY, INTENTION_SMOBY], 'intentionDe');
  for (const f of [INTENTION_SMOBY.pdf, INTENTION_SMOBY.docx]) egal(await statut(f.replace(/^\./, '')), 200, `${f} servi`);
  const prof = await monterTrameSmoby('smoby-visite', 'prof', INTENTION_SMOBY);
  egal(prof.filter((l) => l.intention).map((l) => l.href), [INTENTION_SMOBY.pdf, INTENTION_SMOBY.docx], 'bandeau de l’enseignant');
  const eleve = await monterTrameSmoby('smoby-visite', 'eleve', INTENTION_SMOBY);
  egal(eleve.filter((l) => l.intention).length, 0, 'lien d’intention chez l’élève');
});

await v('Fiche d’intention Smoby (17 bis) : onglet Corrigés de l’enseignant, sous Smoby, PDF puis Word', async () => {
  await page.reload();
  await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
  if (!(await page.$('#btnProfEspace'))) {
    if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
    await page.click('#btnProf');
  }
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  await page.click('#btnProfEspace');
  await page.click('[data-ong="corriges"]');
  await page.waitForSelector('#corrSommaire [data-entreprise="5"]', { timeout: 6000 });
  const liens = await page.$$eval('#corrSommaire [data-entreprise="5"] [data-intention] a', (L) => L.map((a) => a.textContent.trim() + '=' + a.getAttribute('href')));
  egal(liens, [`PDF=${INTENTION_SMOBY.pdf}`, `Word=${INTENTION_SMOBY.docx}`], 'fiche sous Smoby');
  const seances = await page.$$eval('#corrSommaire [data-entreprise="5"] [data-corrige]', (L) => L.length);
  vrai(seances >= 7, `Smoby n’a que ${seances} corrigés au sommaire (7 attendus : 5.1, 5.2 et 5.4 à 5.8 ; 5.3 n’en a pas)`);
});

await v('Smoby : aucune erreur JavaScript dans le bloc', async () => {
  if (erreursS.length) throw new Error([...new Set(erreursS)].slice(0, 5).join(' | '));
});

// ── Le menu de gauche déclaré par séance (05/10/2026, demande de Tristan) ────────────────────────────
await v('Menu : ENT-5.5 — Mon poste, Données, Outils ; seuls ses écrans ; le Stock s’ouvre sans code chez Smoby', async () => {
  await monter55();
  egal(await pg.$$eval(`${T55} .ent-side-liste > *`, (L) => L.map((e) => e.dataset.vue || `[${e.textContent.trim()}]`)),
    ['accueil', 'mail', '[Mon poste]', 'entrepot', '[Données]', 'receptions', 'stock', '[Outils]', 'console'], 'menu');
  await pg.click(`${T55} .ent-nav[data-vue="stock"]`);
  vrai(!(await pg.$(`${Z55} #codeStock`)), 'le Stock demande un code');
  vrai(!!(await pg.$(`${Z55} table`)), 'tableau du Stock');
});

await v('Menu : un écran inconnu dans `menu` empêche la séance de se charger ; sans `menu`, tous les écrans restent', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-entrepot.js');
    let err = '';
    try { creerEntreprise(Object.assign(E.univers({}), { menu: ['stock', 'planning'] })); } catch (e) { err = e.message; }
    document.getElementById('smMenu')?.remove();
    const h = document.createElement('div'); h.id = 'smMenu'; document.body.appendChild(h);
    const U = E.univers({}); delete U.menu;
    creerEntreprise(U).rendre(h, { meta: { id: 'x', portee: 'eleve' }, profil: { prenom: 'A', role: 'eleve' },
      jeu: { etat: () => ({}), sauver: () => {} }, enregistrer: () => {}, quitter: () => {} });
    const vues = [...h.querySelectorAll('.ent-nav[data-vue]')].map((b) => b.dataset.vue);
    h.remove();
    return { err, vues };
  });
  vrai(r.err.includes('écran inconnu « planning »'), `erreur : ${r.err}`);
  egal(r.vues, ['accueil', 'mail', 'entrepot', 'commandes', 'receptions', 'stock', 'catalogue', 'blocage', 'clients', 'fournisseurs', 'console'], 'sans menu');
});

// ── Parcours strict de Smoby (brief SMOBY-retours-5.1-5.2, lot B, 06/10/2026) ─────────────────────────────
// Une base PAR SÉANCE (pas de `jeuId`) : la photo de fin de 5.1 reste dans la base de 5.1, et c'est là que le
// verrou de 5.2 doit la lire. Spartoo (une base commune) est éprouvé à côté : il ne doit pas bouger.
// Les codes et identifiants attendus sont écrits à la main.
const SMOBY = ['ENT-5.1', 'ENT-5.2', 'ENT-5.3', 'ENT-5.4', 'ENT-5.5', 'ENT-5.6', 'ENT-5.7', 'ENT-5.8'];
await v('Parcours Smoby : les 8 séances se suivent malgré leurs bases séparées ; « remettre au début de 5.2 » touche 5.2 à 5.8 ; Spartoo inchangé', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const P = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    return {
      smoby: P.seancesDuParcours(metas, de('smoby-arrivee')).map((x) => x.code),
      depuis: P.seancesDepuis(metas, de('smoby-arrivee')).map((x) => x.code),
      spartoo: P.seancesDuParcours(metas, de('spartoo')).map((x) => x.id),
      boost: P.seancesDuParcours(metas, de('smoby-recrutement')).some((x) => !/^ENT-5\./.test(x.code)),
    };
  });
  egal(r.smoby, SMOBY, 'séances du parcours Smoby');
  egal(r.depuis, SMOBY.slice(1), 'séances défaites par « remettre au début de 5.2 »');
  egal(r.spartoo, ['spartoo-reception', 'spartoo', 'spartoo-tracabilite'], 'parcours Spartoo');
  vrai(!r.boost, 'une séance d’une autre entreprise est entrée dans le parcours Smoby');
});

await v('Verrou Smoby : 5.2 fermée sans la photo de 5.1 (même rangée dans la base de 5.2), ouverte avec, ouverte par « Débloquer » ; Spartoo inchangé', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou, versionDuParcours } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-smoby', gid = 'g-verrou-smoby', profil = { role: 'eleve', uid };
    const cles = [];
    const base = (jeu, data) => { const k = `prepalog:prive/${uid}/${jeu}`; cles.push(k); localStorage.setItem(k, JSON.stringify({ data, ts: 1 })); };
    const debloquer = (aid) => { const k = `prepalog:travaux/${gid}/${uid}/_debloque-${aid}`; cles.push(k);
      localStorage.setItem(k, JSON.stringify({ uid, aid: '_debloque-' + aid, gid, score: 0, max: 0, meilleur: 0, tentatives: 0 })); };
    const V = async (id) => verrou(metas, de(id), profil, gid);
    const o = {};
    o.rien = [await V('smoby-recrutement'), await V('smoby-arrivee')];
    base('smoby-arrivee', { v: 1, points: { 'smoby-recrutement': { v: 1 } } });
    o.mauvaiseBase = await V('smoby-arrivee');
    base('smoby-recrutement', { v: 1, points: { 'smoby-recrutement': { v: 1 } } });
    o.photo = [await V('smoby-arrivee'), await V('smoby-visite')];
    debloquer('smoby-visite');
    o.debloque = [await V('smoby-visite'), await V('smoby-reception')];
    o.spartooRien = await V('spartoo');
    base('spartoo', { v: 1, versionBase: versionDuParcours(metas, de('spartoo')), points: { 'spartoo-reception': { v: 1 } } });
    o.spartooPhoto = [await V('spartoo'), await V('spartoo-tracabilite')];
    cles.forEach((k) => localStorage.removeItem(k));
    return o;
  });
  egal(r.rien, [null, 'Termine d\'abord ENT-5.1.'], 'aucune photo');
  egal(r.mauvaiseBase, 'Termine d\'abord ENT-5.1.', 'photo de 5.1 rangée dans la base de 5.2 (pas la sienne)');
  egal(r.photo, [null, 'Termine d\'abord ENT-5.2.'], 'photo de 5.1 dans la base de 5.1');
  egal(r.debloque, [null, 'Termine d\'abord ENT-5.3.'], '5.3 débloquée à la main');
  egal(r.spartooRien, 'Termine d\'abord ENT-1.1.', 'Spartoo sans photo');
  egal(r.spartooPhoto, [null, 'Termine d\'abord ENT-1.2.'], 'Spartoo avec la photo de 1.1 dans la base commune');
});

await v('Reprise Smoby : « remettre au début de 5.2 » remet 5.2 et 5.3 à leur base de départ (sans la photo de 5.1), laisse 5.1, une seule fois ; Spartoo inchangé', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { appliquerReprise } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const drapeaux = (D) => async (id) => D[id] || null;
    const lire = drapeaux({ 'smoby-arrivee': { dateMaj: 100 } });
    const b51 = { v: 1, travail: '5.1', points: { 'smoby-recrutement': { v: 1, travail: '5.1' } } };
    const b52 = { v: 1, travail: '5.2', points: { 'smoby-arrivee': { v: 1 } } };
    const b53 = { v: 1, travail: '5.3', points: { 'smoby-visite': { v: 1 } } };
    const o = {
      a51: await appliquerReprise(metas, de('smoby-recrutement'), b51, lire),
      a52: await appliquerReprise(metas, de('smoby-arrivee'), b52, lire),
      a53: await appliquerReprise(metas, de('smoby-visite'), b53, lire),
    };
    o.encore = await appliquerReprise(metas, de('smoby-arrivee'), b52, lire);
    Object.assign(o, { b51, b52, b53 });
    // Spartoo, base commune : la reprise de 1.2 s'applique même ouverte depuis 1.1, et rend la photo de 1.1.
    const bs = { v: 2, travail: '1.3', versionBase: 2, points: { 'spartoo-reception': { v: 1, travail: '1.1' }, spartoo: { v: 1 }, 'spartoo-tracabilite': { v: 1 } } };
    o.as = await appliquerReprise(metas, de('spartoo-reception'), bs, drapeaux({ spartoo: { dateMaj: 50 } }));
    o.bs = bs;
    return o;
  });
  egal([r.a51, r.a52, r.a53, r.encore], [false, true, true, false], 'reprises appliquées');
  egal(r.b51, { v: 1, travail: '5.1', points: { 'smoby-recrutement': { v: 1, travail: '5.1' } } }, 'base de 5.1 (reste telle quelle)');
  egal(r.b52, { reprise: 100 }, 'base de 5.2 (repart de sa base de départ)');
  egal(r.b53, { reprise: 100 }, 'base de 5.3');
  egal([r.as, r.bs], [true, { v: 1, travail: '1.1', points: { 'spartoo-reception': { v: 1, travail: '1.1' } }, versionBase: 2, reprise: 50 }], 'Spartoo');
});

// ── Un jalon qui plante n'est pas un jalon faux (chantier 5 de docs/chantiers.md, 08/10/2026) ───────────────────────
// Le moteur monte l'univers d'essai de la 2de avec DEUX jalons déclarés ici : `bon` (toujours juste) et `casse`, dont la
// vérification lève une exception (cas 'plante') ou rend 'ko' (cas 'faux', le sens inverse). Contexte de navigateur à
// part : le `console.error` du moteur est ATTENDU ici, il ne doit pas compter dans les erreurs du bloc.
// Valeurs attendues écrites à la main : 2 jalons de 1 point ; le jalon qui plante rapporte 0 et n'est pas « faux ».
const ctxE = await nav.newContext({ viewport: { width: 1366, height: 1000 } });
const pe = await ctxE.newPage();
pe.setDefaultTimeout(6000);
const journalE = [];
pe.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) journalE.push(m.text()); });
await pe.goto(BASE);
await pe.waitForSelector('#btnProf', { timeout: 8000 });
const monterE = async (o) => {
  journalE.length = 0;
  await pe.evaluate(async (o) => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-2de.js');
    document.querySelector('#erTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'erTest'; document.body.appendChild(hote);
    const db = {};
    const U = E.univers({});
    window.__e = { db, mode: o.casse, enreg: [] };
    U.etapes = [
      { id: 'bon', titre: 'Jalon qui marche', verifier: () => ({ status: 'ok' }) },
      { id: 'casse', titre: 'Jalon cassé', verifier: () => {
        if (window.__e.mode === 'plante') throw new Error('clé renommée');
        return { status: window.__e.mode === 'faux' ? 'ko' : 'ok' };
      } },
    ];
    window.__e.moteur = creerEntreprise(U);
    window.__e.moteur.rendre(hote, {
      meta: { id: 'essai-2de', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage', parcours: true, ...(o.correction ? { correction: true } : {}) },
      profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-erreur' },
      suivante: { code: 'ESSAI-2', titre: 'La suivante' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (res) => { window.__e.enreg.push(JSON.parse(JSON.stringify(res))); }, quitter: () => {}, codeStock: 'ABC',
      lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
    });
  }, o);
  await pe.waitForSelector('#erTest [data-fin-seance]');
};
const dernierE = () => pe.evaluate(() => JSON.parse(JSON.stringify({ res: window.__e.enreg[window.__e.enreg.length - 1], db: window.__e.db })));
const finE = () => pe.$eval('#erTest [data-fin-seance]', (z) => ({ texte: z.textContent.replace(/\s+/g, ' ').trim(),
  fin: z.querySelector('[data-fin]') && z.querySelector('[data-fin]').dataset.fin,
  averifier: !!z.querySelector('[data-fin-averifier]'),
  casse: (() => { const li = z.querySelector('li[data-fin-jalon="casse"]'); return li ? { etat: li.dataset.finEtat, classe: li.className, texte: li.textContent.replace(/\s+/g, ' ').trim() } : null; })() }));

await v('Jalon qui plante : état « erreur », 0 point, pas compté faux ni « premier coup », journalisé, rangé pour l’enseignant', async () => {
  await monterE({ casse: 'plante' });
  const { res, db } = await dernierE();
  egal([res.detail.bon, res.detail.casse], ['ok', 'erreur'], 'états des jalons');
  egal([res.score, res.max], [1, 2], 'note : le jalon qui plante rapporte 0');
  egal(db.indicateurs['essai-2de'].erreurs, { casse: 'clé renommée' }, 'erreurs rangées chez l’élève');
  egal(db.indicateurs['essai-2de'].premier, { bon: 'ok' }, 'premier coup : le bug n’y est pas');
  egal(res.detail.indicateurs['essai-2de'].erreurs, { casse: 'clé renommée' }, 'erreurs remontées avec la note');
  const nous = journalE.filter((t) => t.includes('essai-2de') && t.includes('casse') && t.includes('clé renommée'));
  egal(nous.length, 1, `console.error (séance, jalon, message), une fois : ${journalE.join(' | ')}`);
  vrai(db.points && db.points['essai-2de'], 'la photo de fin (qui ouvre la séance suivante) manque : l’élève serait bloqué');
  const f = await finE();
  egal([f.fin, f.averifier], ['averifier', true], 'bandeau de fin (ancien)');
  vrai(f.texte.includes('Jalon cassé') && !f.texte.includes('✗') && !f.texte.includes('à corriger') && f.texte.includes('La suivante'), `bandeau : ${f.texte}`);
  vrai(!(await pe.$('#erTest [data-fin="ko"]')), 'le bandeau dit « à corriger »');
});

await v('Jalon qui plante, séance à bilan par blocs : ligne « à vérifier » (?), jamais ✗ ni faux', async () => {
  await monterE({ casse: 'plante', correction: true });
  const f = await finE();
  egal([f.fin, f.averifier], ['averifier', true], 'bandeau de fin (par blocs)');
  egal(f.casse.etat, 'erreur', 'état de la ligne');
  vrai(!/ent-fin-faux|ent-fin-juste/.test(f.casse.classe) && !f.casse.texte.includes('✗') && f.casse.texte.includes('à vérifier'), `ligne : ${JSON.stringify(f.casse)}`);
  vrai(!(await pe.$('#erTest [data-fin-corriger]')), 'un bouton « Corriger » est offert pour un bug');
  egal(await pe.$eval('#erTest li[data-fin-jalon="bon"]', (li) => li.dataset.finEtat), 'ok', 'la ligne juste reste juste');
});

await v('Jalon qui rend « faux » (sens inverse) : état « ko », ✗ au bandeau, premier coup raté, rien en erreur ni dans le journal', async () => {
  await monterE({ casse: 'faux' });
  const { res, db } = await dernierE();
  egal([res.detail.bon, res.detail.casse], ['ok', 'ko'], 'états des jalons');
  egal([res.score, res.max], [1, 2], 'note');
  egal(db.indicateurs['essai-2de'].erreurs, undefined, 'erreurs rangées');
  egal(db.indicateurs['essai-2de'].premier, { bon: 'ok', casse: 'ko' }, 'premier coup');
  egal(journalE, [], 'console.error');
  const f = await finE();
  egal([f.fin, f.averifier], ['ko', false], 'bandeau de fin (ancien)');
  vrai(f.texte.includes('Jalon cassé'), `bandeau : ${f.texte}`);
  await monterE({ casse: 'faux', correction: true });
  const g = await finE();
  egal(g.casse.etat, 'ko', 'état de la ligne');
  vrai(/ent-fin-faux/.test(g.casse.classe) && g.casse.texte.includes('✗') && !g.casse.texte.includes('à vérifier'), `ligne : ${JSON.stringify(g.casse)}`);
  egal(g.averifier, false, 'mention « à vérifier »');
});

await v('Jalon qui plante : une fois la cause corrigée, la mention s’efface du repérage au prochain bilan', async () => {
  await monterE({ casse: 'plante' });
  egal((await dernierE()).db.indicateurs['essai-2de'].erreurs, { casse: 'clé renommée' }, 'avant');
  await pe.evaluate(() => { window.__e.mode = 'ok'; });
  // Ouvrir un message sauvegarde la base : le moteur recalcule la note et le repérage.
  await pe.click('#erTest .ent-nav[data-vue="mail"]');
  await pe.click('#erTest [data-dossier="in"]');
  await pe.click('#erTest .ent-obj:text-is("Le cariste pour le pic de Noël")');
  await pe.waitForTimeout(150);
  const { res, db } = await dernierE();
  egal(db.indicateurs['essai-2de'].erreurs, undefined, 'erreurs rangées après correction');
  egal(res.detail.casse, 'ok', 'état du jalon');
});

await v('Suivi de classe : « ⚠ jalon en erreur : <id> » sous le nom de l’élève concerné, rien pour les autres', async () => {
  const ouvrirSuivi = async () => {
    await page.reload();
    await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
    if (!(await page.$('#btnProfEspace'))) {
      if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
      await page.click('#btnProf');
    }
    await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
    await page.click('#btnProfEspace');
    await page.click('[data-ong="suivi"]');
    await page.waitForSelector('#btnCsvSuivi', { timeout: 6000 });
  };
  await ouvrirSuivi();
  const nomGroupe = (await page.textContent('#btnCsvSuivi >> xpath=ancestor::div[1]//strong')).replace(/^Suivi de /, '').trim();
  const ids = await page.evaluate(async (nomGroupe) => {
    const k = Object.keys(localStorage).find((x) => /groupes$/.test(x));
    const gs = JSON.parse(localStorage.getItem(k));
    const gid = Object.keys(gs).find((id) => gs[id].nom === nomGroupe);
    const { B } = await import('/core/backend.js');
    await B.creerEleves(gid, [{ nom: 'ERREURUN', prenom: 'Test', matricule: 'erreur-un', code: 'x' }, { nom: 'ERREURDEUX', prenom: 'Test', matricule: 'erreur-deux', code: 'x' }]);
    const L = await B.elevesDuGroupe(gid);
    const un = L.find((x) => x.nom === 'ERREURUN'), deux = L.find((x) => x.nom === 'ERREURDEUX');
    const { chargerActivites } = await import('/activites/index.js');
    const m = (await chargerActivites()).map((x) => x.meta).find((x) => x.portee === 'eleve' && x.immersif && x.bareme && !x.copie);
    await B.ecrireScore(gid, un.uid, m.id, { score: 1, max: 5, detail: { casse: 'erreur', indicateurs: { [m.id]: {
      temps: 600, premier: { bon: 'ok' }, erreurs: { casse: 'clé renommée' } } } } });
    await B.ecrireScore(gid, deux.uid, m.id, { score: 1, max: 5, detail: { casse: 'ko', indicateurs: { [m.id]: {
      temps: 600, premier: { bon: 'ok', casse: 'ko' } } } } });
    return { gid, un: un.uid, deux: deux.uid, aid: m.id };
  }, nomGroupe);
  try {
    await ouvrirSuivi();
    await page.waitForSelector(`#reperage [data-reperage="${ids.aid}"]`, { timeout: 6000 });
    const T = `#reperage [data-reperage="${ids.aid}"] tr[data-rep-eleve=`;
    const mention = await page.$eval(`${T}"${ids.un}"] [data-rep-erreur]`, (s) => ({ texte: s.textContent.trim(), bulle: s.title, couleur: getComputedStyle(s).backgroundColor }));
    egal(mention.texte, '⚠ jalon en erreur : casse', 'mention');
    vrai(mention.bulle.includes('clé renommée'), 'le message est dans la bulle : ' + mention.bulle);
    vrai(mention.couleur === 'rgba(0, 0, 0, 0)', 'aplat de couleur sur la mention : ' + mention.couleur);
    vrai(!(await page.$(`${T}"${ids.deux}"] [data-rep-erreur]`)), 'la mention apparaît pour un jalon simplement faux');
    // Le jalon faux compte toujours comme raté au premier coup, le jalon en erreur n'y figure pas.
    egal(await page.$eval(`${T}"${ids.un}"] [data-rep="premier"]`, (c) => c.textContent), '1 / 1', 'premier coup de l’élève dont un jalon plante');
    egal(await page.$eval(`${T}"${ids.deux}"] [data-rep="premier"]`, (c) => c.textContent), '1 / 2', 'premier coup de l’élève dont un jalon est faux');
  } finally {
    await page.evaluate(async ({ gid, un, deux, aid }) => {
      const { B } = await import('/core/backend.js');
      for (const u of [un, deux]) { await B.poserNote(gid, u, aid, null); await B.supprimerEleve(u); }
    }, ids);
  }
});

await ctxE.close();

await ctxS.close();
}
