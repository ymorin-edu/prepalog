// Suite de tests de Prepalog — bloc « smoby » : les briques de la 2de (brief
// `docs/briefs/MOTEUR-2de-S1.md`), sur l'univers d'essai `outils/essai-2de.js`.
//
// `node outils/test.mjs smoby` ne lance que ce bloc. Il monte l'environnement d'entreprise à la main,
// dans un contexte de navigateur à lui.
// Lot 2 (04/10/2026) : la réponse par phrases à choisir (`core/phrases.js`). Les phrases justes sont
// écrites À LA MAIN ici (jamais relues dans le contenu).

export default async function bloc({ v, nav, page }) {

const egal = (a, b, quoi) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`); };
const vrai = (c, quoi) => { if (!c) throw new Error(quoi); };

const ctxS = await nav.newContext({ viewport: { width: 1366, height: 1000 } });
const erreursS = [];
const pg = await ctxS.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreursS.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursS.push('CONSOLE: ' + m.text()); });
await pg.goto('http://127.0.0.1:8099/');
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
  const moteur = creerEntreprise(E.univers({}));
  window.__s = { db };
  moteur.rendre(hote, {
    meta: { id: 'essai-2de', code: 'ESSAI', titre: 'Essai 2de', portee: 'eleve', immersif: true, temps: 'guidage', reinitialisable: true },
    profil: { prenom: o.prenom || 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-lea' },
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: (res) => { window.__s.enreg = JSON.parse(JSON.stringify(res)); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  document.querySelector('#smTest .ent-nav[data-vue="mail"]').click();
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
const envoyer = () => pg.click(`${Z} #formPhr button[type="submit"]`);
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
  await monter();
  await pg.waitForTimeout(5600);
  const t1 = ((await reperage()) || {}).temps || 0;
  vrai(t1 >= 4.5 && t1 <= 7, `temps après 5,6 s visibles : ${t1}`);
  // Onglet caché : le temps s'arrête.
  await pg.evaluate(() => Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }));
  await pg.waitForTimeout(5600);
  const t2 = (await reperage()).temps;
  await pg.evaluate(() => { delete document.visibilityState; });
  egal(t2, t1, 'temps pendant que l’onglet est caché');
  await monter({ role: 'prof' });
  await pg.waitForTimeout(5600);
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
    const { chargerActivites } = await import('/activites/index.js');
    const m = (await chargerActivites()).map((x) => x.meta).find((x) => x.portee === 'eleve' && x.immersif && x.bareme && !x.copie);
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
    egal(lu.premier, ['2 / 3', 'Justes du premier coup : a, c. Ratés au premier jugement : b.'], 'premier coup');
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

await v('Smoby : aucune erreur JavaScript dans le bloc', async () => {
  if (erreursS.length) throw new Error([...new Set(erreursS)].slice(0, 5).join(' | '));
});

await ctxS.close();
}
