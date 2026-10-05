// Suite de tests de Prepalog — bloc « smoby » : les briques de la 2de (brief
// `docs/briefs/MOTEUR-2de-S1.md`), sur l'univers d'essai `outils/essai-2de.js`.
//
// `node outils/test.mjs smoby` ne lance que ce bloc. Il monte l'environnement d'entreprise à la main,
// dans un contexte de navigateur à lui.
// Lots 4 et 5 : quai sans froid, chariot, étape « Avant de décharger » (`monter({ quai })`).
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
  await pg.click(`${F} [data-fiche-envoyer]`);
  egal(await manqueAffiche(), 'Il manque : 15 cases du tableau sans réponse, le candidat, le contrat.', 'tout vide');
  await toutRemplir();
  egal(await manqueAffiche(), '', 'la raison reste affichée après une saisie');
  await ouinon('thomas', 'cdd', true);
  await pg.evaluate(() => { delete window.__s.db.fiches.selection.valeurs.tri.sabrina; });
  await pg.click(`${F} [data-fiche-envoyer]`);
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
  await pg.click(`${F} [data-fiche-envoyer]`);
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
    lireScore: async () => null,
  });
}, o);
// L'état des neuf étapes, lu par les jalons de la séance sur la base de l'élève.
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
  raison: 'car il a le CACES 3 valide, il est disponible le 9 décembre et il accepte un CDD.',
  contrat: 'Je propose un CDD saisonnier.',
  fin: 'Pouvez-vous valider ? Cordialement,',
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
  await pg.click(`${F51} [data-fiche-envoyer]`);
  await pg.waitForSelector(`${F51} [data-fiche-envoyee]`);
}
// Répond à Sophie par phrases (`remplace` : les lignes à changer).
async function repondre51(remplace = {}) {
  await ouvrirMail51('Ton choix pour le poste de cariste');
  await pg.click(`${Z51} [data-repondre]`);
  await pg.waitForSelector(`${Z51} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries({ ...PHR51, ...remplace })) await pg.selectOption(`${Z51} [data-phrase="${l}"]`, { label: t });
  await pg.click(`${Z51} #formPhr button[type="submit"]`);
}
const sujets51 = () => pg.evaluate(() => window.__51.db.mails.filter((m) => m.folder === 'in').map((m) => m.subject));
const NEUF = ['ligne-yanis', 'ligne-laura', 'ligne-mehdi', 'ligne-thomas', 'ligne-sabrina', 'candidat', 'contrat', 'raison', 'ton'];
const statuts = (ok, ko = []) => Object.fromEntries(NEUF.map((id) => [id, ko.includes(id) ? 'ko' : ok]));

await v('ENT-5.1 : déclaration (code, 2de, AGO-3.1, 9 jalons, livrée fermée aux élèves) et entreprise n° 5 avec son logo', async () => {
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
  egal(r.m, ['smoby-recrutement', 'ENT-5.1', 'simulog', ['2de'], ['AGO-3.1'], 'guidage', 9, true, 'prof', 'eleve', true], 'meta');
  vrai(r.compConnue, 'AGO-3.1 absente de core/competences.js');
  egal(r.e, ['Smoby', 200, true], 'entreprise n° 5');
  vrai(r.inscrite, 'séance absente du registre');
});

await v('ENT-5.1 : les attendus calculés sont ceux du brief (tableau, Yanis, CDD) et un seul candidat coche tout', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/smoby-ent51.js');
    return { tri: S.TRI_ATTENDU, retenu: S.RETENU.id, contrat: S.POSTE.contrat,
      complets: Object.entries(S.TRI_ATTENDU).filter(([, l]) => l.caces && l.dispo && l.cdd).map(([id]) => id) };
  });
  egal(r.tri, TRI51, 'tableau attendu');
  egal([r.retenu, r.contrat, r.complets], ['yanis', 'CDD', ['yanis']], 'choix attendu');
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

await v('ENT-5.1 : parcours juste à l’écran → fiche, message de Sophie par phrases, réponse, 9 / 9', async () => {
  await monter51();
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51();
  // Fiche envoyée : les lignes jugées, le message pas encore (pas de réponse envoyée).
  egal(await etapes51(), { ...statuts('ok'), raison: 'attente', ton: 'attente' }, 'après la fiche');
  egal(await sujets51(), ['Recrutement du cariste de Noël', 'Ton choix pour le poste de cariste'], 'Sophie demande la réponse');
  await repondre51();
  egal(await etapes51(), statuts('ok'), 'après la réponse');
  egal(await dernierScore51(), [9, 9], 'score remonté au suivi');
  vrai((await sujets51()).includes('RE : Ton choix pour le poste de cariste'), 'la réponse de Sophie (suite de l’histoire) n’arrive pas');
});

await v('ENT-5.1 : chaque piège fait tomber son jalon, et lui seul (sabotage par jalon, à l’écran)', async () => {
  // Un tableau avec UNE case fausse sur la ligne d'un candidat → seul son jalon tombe.
  const flip = (id, col) => ({ ...TRI51, [id]: { ...TRI51[id], [col]: !TRI51[id][col] } });
  const cas = [
    ['ligne-yanis', { tri: flip('yanis', 'dispo') }],
    ['ligne-laura', { tri: flip('laura', 'caces') }],   // Laura cochée « CACES valide » (piège du brief)
    ['ligne-mehdi', { tri: flip('mehdi', 'caces') }],
    ['ligne-thomas', { tri: flip('thomas', 'dispo') }],
    ['ligne-sabrina', { tri: flip('sabrina', 'cdd') }],
    ['candidat', { candidat: 'sabrina' }],
    ['contrat', { contrat: 'CDI' }],
    ['raison', null, { raison: 'car il a le CACES.' }],
    ['ton', null, { fin: 'Bisous' }],
  ];
  for (const [jalon, fiche, phrases] of cas) {
    await monter51({ uid: 'u-' + jalon });
    await ouvrirMail51('Recrutement du cariste de Noël');
    await envoyerFiche51(fiche || {});
    await repondre51(phrases || {});
    egal(await etapes51(), statuts('ok', [jalon]), `sabotage de « ${jalon} »`);
    egal(await dernierScore51(), [8, 9], `score avec « ${jalon} » faux`);
  }
});

await v('ENT-5.1 : « Salut ! » fait aussi tomber le ton ; la réponse se corrige (le dernier envoi compte)', async () => {
  await monter51({ uid: 'u-salut' });
  await ouvrirMail51('Recrutement du cariste de Noël');
  await envoyerFiche51();
  await repondre51({ salutation: 'Salut !' });
  egal((await etapes51()).ton, 'ko', 'ton avec « Salut ! »');
  await repondre51();
  egal(await etapes51(), statuts('ok'), 'après correction');
  // La suite de l'histoire n'arrive qu'une fois.
  egal((await sujets51()).filter((s) => s.startsWith('RE :')).length, 1, 'réponse de Sophie en double');
});

await v('ENT-5.1 : une réponse libre au premier message n’ouvre pas la suite ; message sans envoi = jalons 8 et 9 jamais vrais', async () => {
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
  egal([e.raison, e.ton], ['attente', 'attente'], 'message non envoyé');
  egal(await dernierScore51(), [7, 9], 'score sans le message');
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
const DIX = ['securite-signalee', 'securite-constat', 'P1-palette', 'P2-palette', 'P3-palette', 'P4-palette', 'P3-reserve', 'P4-reserve',
  'signature', 'message'];
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
  await pg.click(`${Z54} #formPhr button[type="submit"]`);
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

await v('ENT-5.4 : déclaration (code, 2de, C1.2 et C1.4, 10 jalons, livrée fermée aux élèves), photos du quai de Smoby servies', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/smoby-reception.js');
    const I = await import('/activites/index.js');
    const S = await import('/contenus/smoby-ent54.js');
    const m = A.meta, Q = S.QUAI_ENT54;
    const urls = [Q.photos.arrivee, Q.photos.quai, Q.securite.photo];
    const st = await Promise.all(urls.map((u) => fetch(u).then((x) => [u, x.status, x.headers.get('content-type')])));
    return { m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.pret, m.ouverture, m.portee],
      st, inscrite: (await Promise.all(I.ACTIVITES.map((f) => f()))).some((x) => x.meta.id === 'smoby-reception') };
  });
  egal(r.m, ['smoby-reception', 'ENT-5.4', 'simulog', ['2de'], ['C1.2', 'C1.4'], ['D4', 'D5'], 'guidage', 10, true, 'prof', 'eleve'], 'meta');
  egal(r.st, [['./contenus/smoby/quai-remorques.jpg', 200, 'image/jpeg'], ['./contenus/smoby/quai-interieur.jpg', 200, 'image/jpeg'],
    ['./contenus/smoby/quai-exterieur.jpg', 200, 'image/jpeg']], 'photos');
  vrai(r.inscrite, 'séance absente du registre');
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

await v('ENT-5.4 : parcours juste à l’écran → 10 / 10, réponse de Bruno ; rien de froid ; déchargement sur le décor fixe de Smoby', async () => {
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
  egal(await dernierScore54(), [10, 10], 'score remonté au suivi');
  vrai((await sujets54()).includes('RE : La navette d’Arinthod'), 'la réponse de Bruno n’arrive pas');
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

await v('ENT-5.4 : décharger sans signaler → arrêt du chef de quai, jalon 1 faux même après avoir signalé (9 / 10)', async () => {
  await monter54({ uid: 'u-54-arret' });
  await auQuai54();
  await securite54({ signalerAvant: false });
  await pg.click(`${Z54} .quai-stepper button[data-n="0"]`);
  egal(await pg.textContent(`${Z54} [data-q-secu-chef]`), 'Le chef de quai : « Bien vu ! Je fais poser la cale. C’est bon, tu peux décharger. »', 'réponse du chef');
  await pg.click(`${Z54} .quai-stepper button[data-n="1"]`);
  await decharger54(); await controler54(); await papiers54(); await repondre54();
  egal(await etapes54(), statuts54(['securite-signalee']), 'étapes');
  egal(await dernierScore54(), [9, 10], 'score');
});

await v('ENT-5.4 : le texte de l’arrêt du chef de quai est celui du brief', async () => {
  await monter54({ uid: 'u-54-stop' });
  await auQuai54();
  for (const [id, val] of Object.entries(SECU54)) await pg.click(`${Z54} #qSecu-${id}-${val}`);
  await pg.click(`${Z54} [data-q="commencer"]`);
  egal(await pg.textContent(`${Z54} [data-q-secu-arret]`), 'Le chef de quai : « Stop ! Le camion n’est pas calé : il peut bouger pendant que tu es dedans. »', 'arrêt');
  egal((await etapes54())['securite-signalee'], 'ko', 'jalon 1 après l’arrêt');
});

await v('ENT-5.4 : chaque piège fait tomber son jalon (constat, P2 refusée, P3 acceptée sans le tour, P4 comptée 36, réserves, message)', async () => {
  const cas = [
    [['securite-constat'], { secu: { constat: { ...SECU54, epi: 'ko' } } }],
    // Une palette refusée demande sa ligne de réserve (le chauffeur ne signe pas une réserve vide).
    [['P2-palette'], { decisions: { ...JUSTE54, P2: [45, 'refuser', 'manquant'] }, reserves: { P2: 3, P3: 1, P4: 2 } }],
    [['P3-palette', 'P3-reserve'], { decisions: { ...JUSTE54, P3: [36, 'accepter'] } }],
    [['P4-palette'], { decisions: { ...JUSTE54, P4: [36, 'reserves', 'manquant'] } }],
    [['P4-reserve'], { reserves: { P3: 1, P4: 1 } }],
    [['message'], { phrases: { reserves: 'Tout est conforme.' } }],
    [['message'], { phrases: { reserves: 'Réserves : 2 cartons écrasés.' } }],
  ];
  for (const [n, [ko, o]] of cas.entries()) {
    await parcours54({ uid: `u-54-piege-${n}`, ...o });
    egal(await etapes54(), statuts54(ko), `sabotage ${ko.join(', ')}`);
    egal(await dernierScore54(), [10 - ko.length, 10], `score avec ${ko.join(', ')} faux`);
  }
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
  if (valider) await pg.click(`${Z55} [data-valider-rec]`);
}
async function repondre55(sujet, choix) {
  await pg.click(`${T55} .ent-nav[data-vue="mail"]`);
  await pg.click(`${Z55} [data-dossier="in"]`);
  await pg.click(`${Z55} .ent-obj:text-is("${sujet}")`);
  await pg.click(`${Z55} [data-repondre]`);
  await pg.waitForSelector(`${Z55} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(choix)) await pg.selectOption(`${Z55} [data-phrase="${l}"]`, { label: t });
  await pg.click(`${Z55} #formPhr button[type="submit"]`);
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

await ctxS.close();
}
