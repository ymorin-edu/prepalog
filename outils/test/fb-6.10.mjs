// Suite de tests de Prepalog — bloc « fb-6.10 » : ENT-6.10 (France Boissons, le retour de Lucas) et les pièces du chantier moteur D-10
// (feuille de calcul dans une fiche, dessin en document avec loupe, pastilles d'étape, menu progressif).
// `node outils/test.mjs fb-6.10` ne lance que ce bloc. Aides communes : `outils/test/france-boissons/commun.mjs`.
//
// Valeurs ÉCRITES À LA MAIN (brief §4 et §8) : commande d'ENT-6.2 = 6 Heineken 30 L (5 livrés, 1 refusé), 2 Affligem, 2 Pelforth, 3 casiers
// d'eau ; ticket : 9 fûts vides et 5 casiers « repris de la commande » ; au quai : 8 fûts vides, 5 casiers, 1 fût plein refusé ; avant la
// tournée : 9 fûts, 5 casiers ; livrés 9 / 3 ; après 10 / 3 ; écart +1 / −2 ; consignes 40 / 4 ; montants 40 € / −8 € ; total 32 €.
// Chiffrage : 30 L, 0,33 L, 0,225 kg, 53, 9,5 kg → 90,9 bouteilles, 20,5 kg, ≈ 1 084 kg, ≈ 114 fois.
// Poids (validés par Tristan le 13/10/2026, option A) : futs-vides 2 · casiers-plein 1 · ticket 1,5 · compte-lus 1,5 · compte-solde 1,5 ·
// compte-montants 2 · malo-fut-ton 1 · malo-vides-solde 1,5 · ines 1,5 · anim-q1 0,5 · anim-q2 0,5 · chiffrage 1,5 ; questions :
// qui-aurait-du-compter 1,5 · consigne-due 1,5 · reemploi-loi 1.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, entrants } = F;

const ID = 'france-boissons-retour';
const REP_OUV = { avoir: 'du', 'solde-chez-client': 'juste', 'ticket-terminal': 'terminal', 'qui-facture': 'ines',
  'consigne-nette': 'juste', 'reemploi-recyclage': 'fut', 'contrat-vides': 'non', 'terminal-chauffeur': 'oui' };
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-retour.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  const Q = ((db.questions = db.questions || {})['france-boissons-retour'] = db.questions['france-boissons-retour'] || {});
  for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb610' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP_OUV });

const BONNES = { 'ce-que-tu-compares': 'quai', 'consigne-due': 'consigne', 'reemploi-loi': 'reemploi' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un. La question libre reçoit une phrase.
async function qrep(choix = BONNES) {
  for (let i = 0; i < 5; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    if (await present(`[data-q-libre="${id}"]`)) await pg.fill(`${Z} [data-q-libre="${id}"]`, 'Malo aurait été remboursé d’un fût.');
    else await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
// Envoie la fiche ouverte (deux clics : « Envoyer », puis la confirmation dans la page).
async function envoyer() {
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause(60);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
// ① Le contrôle : chaque clé absente reste vide.
async function controle(c) {
  await aller('fiche');
  for (const k of ['futs', 'casiers', 'plein']) if (c[k] != null) { await pg.fill(`${Z} #fi-${k}`, String(c[k])); await pg.dispatchEvent(`${Z} #fi-${k}`, 'change'); }
  if (c.ticket) { await pg.selectOption(`${Z} #fi-ticket`, c.ticket); await pause(); await qrep(); }
  await envoyer();
}
async function etape(val = 'lucas') {
  await pg.click(`${Z} [data-qf-attend="apres-controle"] [data-q-aller-etape]`);
  await pause();
  await pg.click(`${Z} [data-q-choix="${val}"][data-q="qui-aurait-du-compter"]`);
  await pg.click(`${Z} [data-q-repondre="qui-aurait-du-compter"]`);
  await pause();
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
}
// Une feuille : chaque case tapée comme un élève (l'événement « input » de la page), puis l'envoi.
async function feuille(vue, cases, { envoi = true } = {}) {
  await aller(vue);
  for (const [ref, t] of Object.entries(cases)) { await pg.fill(`${Z} [data-gr="${ref}"]`, t); await pg.dispatchEvent(`${Z} [data-gr="${ref}"]`, 'change'); }
  await pause();
  await qrep();
  if (envoi) await envoyer();
  await qrep();
}
// Répondre à un message par phrases (la clé du message), une phrase par ligne.
async function phrases(cle, m) {
  await aller('mail');
  // Après un envoi, la Messagerie montre « Envoyés » : on revient à la réception.
  if (await present('[data-dossier="in"]')) { await pg.click(`${Z} [data-dossier="in"]`); await pause(); }
  const id = await pg.evaluate((cle) => window.__f.db.mails.find((x) => x.folder === 'in' && x.cle === cle).id, cle);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) {
    await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t });
    await pause();
    await qrep();
  }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep();
}
const COMPTE = (futs = '8', casiers = '5') => ({ B3: '9', C3: '3', B4: futs, C4: casiers, B5: '=B2+B3-B4', C5: '=C2+C3-C4', B6: '=B5-B2',
  C6: '=C5-C2', B7: '40', C7: '4', B8: '=B6*B7', C8: '=C6*C7', B9: '=B8+C8' });
const CHIFFRAGE = { B2: '30', B3: '0,33', B4: '0,225', B5: '53', B6: '9,5', B7: '=B2/B3', B8: '=B7*B4', B9: '=B8*B5', B10: '=B9/B6' };
const MALO = (prenom = 'Lea') => ({ salutation: 'Bonjour Malo,', fut: 'Le fût de Heineken 30 L abîmé à la livraison ne vous sera pas facturé.',
  vides: 'Nous avons repris 8 fûts vides et non 9 : il en reste donc un chez vous.',
  solde: 'Vous avez maintenant 10 fûts et 3 casiers en consigne chez vous.', fin: `Cordialement, ${prenom}, exploitation France Boissons` });
const INES = (prenom = 'Lea') => ({ bonjour: 'Bonjour Inès,', futs: 'Fûts : 40 € de consigne à facturer (1 fût de plus chez Malo).',
  casiers: 'Casiers : avoir de 8 € (2 casiers de moins chez Malo).', heineken: 'Facture 5 Heineken 30 L : le 6e a été refusé.', merci: `Merci, ${prenom}` });

const JALONS = ['futs-vides', 'casiers-plein', 'ticket', 'compte-lus', 'compte-solde', 'compte-montants', 'malo-fut-ton', 'malo-vides-solde',
  'ines', 'chiffrage'];

// ─────────────────────────────────────────────────────────── les données, calculées par le contenu (valeurs écrites ici à la main)
await v('ENT-6.10 : données — ticket, comptes au quai, compte de consignes et chiffrage calculés depuis la commande d’ENT-6.2 (valeurs écrites à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/france-boissons-ent610-donnees.js');
    return { livraison: D.LIVRAISON.map((l) => [l.article, l.commande, l.livre]), livres: D.LIVRES, ticket: D.VIDES_TICKET, quai: D.AU_QUAI,
      juste: D.TICKET_JUSTE, avant: D.AVANT, reel: D.REEL, ch: Object.values(D.CHIFFRAGE).map((x) => Math.round(x * 10) / 10) };
  });
  egal(r.livraison, [['heineken30', 6, 5], ['affligem20', 2, 2], ['pelforth20', 2, 2], ['eau', 3, 3]], 'lignes du ticket');
  egal([r.livres.futs, r.livres.casiers, r.livres.commandesFuts], [9, 3, 10], 'livrés');
  egal([r.ticket.futs, r.ticket.casiers], [9, 5], 'vides du ticket');
  egal([r.quai.futs, r.quai.casiers, r.quai.plein], [8, 5, 1], 'au quai');
  egal(r.juste, 'futs', 'réponse au ticket');
  egal([r.avant.futs, r.avant.casiers], [9, 5], 'avant la tournée');
  egal([r.reel.apres.futs, r.reel.apres.casiers, r.reel.ecart.futs, r.reel.ecart.casiers, r.reel.montant.futs, r.reel.montant.casiers, r.reel.total],
    [10, 3, 1, -2, 40, -8, 32], 'le réel');
  egal(r.ch, [90.9, 20.5, 1084.1, 114.1], 'chiffrage');
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
const jalonsSans = (o) => pg.evaluate(async (o) => {
  const S = await import('/contenus/france-boissons-ent610.js');
  const db = { fiches: {} };
  if (o.controle) db.fiches.controle = { valeurs: o.controle, envoye: { at: 1 } };
  if (o.compte) db.fiches.consignes = { valeurs: { compte: { cases: o.compte } }, envoye: { at: 2 } };
  if (o.chiffrage) db.fiches.chiffrage = { valeurs: { reemploi: { cases: o.chiffrage } }, envoye: { at: 3 } };
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, e.verifier(db).status]));
}, o);
const CTRL = { futs: '8', casiers: '5', plein: '1', ticket: 'futs' };
const ko = (r, L) => L.filter((j) => r[j] !== 'ok');
const FICHES_J = ['futs-vides', 'casiers-plein', 'ticket', 'compte-lus', 'compte-solde', 'compte-montants', 'chiffrage'];

await v('ENT-6.10 : jalons sans écran — référence juste ; chaque piège fait tomber SON jalon ; une erreur de comptage ne se paie qu’une fois ; rien de vrai sans envoi', async () => {
  let r = await jalonsSans({ controle: CTRL, compte: COMPTE(), chiffrage: CHIFFRAGE });
  egal(ko(r, FICHES_J), [], 'référence');
  // 9 vides (le ticket recopié) : jalons 1 et 3 ; la feuille juste sur SES 9 garde 4 à 6 (une erreur ne se paie qu'une fois).
  r = await jalonsSans({ controle: { ...CTRL, futs: '9', ticket: 'oui' }, compte: COMPTE('9', '5') });
  egal(ko(r, FICHES_J.slice(0, 6)), ['futs-vides', 'ticket'], '9 vides recopiés du ticket');
  // Le fût plein compté avec les vides : 9 vides, 0 plein → jalons 1 et 2.
  r = await jalonsSans({ controle: { ...CTRL, futs: '9', plein: '0' } });
  egal(ko(r, FICHES_J.slice(0, 3)), ['futs-vides', 'casiers-plein'], 'fût plein compté avec les vides');
  r = await jalonsSans({ controle: { ...CTRL, ticket: 'deux' } });
  egal(ko(r, FICHES_J.slice(0, 3)), ['ticket'], 'écart « sur les deux »');
  // La feuille : la ligne 4 se juge sur SES comptes, pas sur le quai ni le ticket.
  r = await jalonsSans({ controle: CTRL, compte: COMPTE('9', '5') });
  egal(ko(r, ['compte-solde']), ['compte-solde'], 'ligne 4 = le ticket alors qu’il a compté 8');
  r = await jalonsSans({ controle: CTRL, compte: { ...COMPTE(), B3: '10' } });
  egal(ko(r, ['compte-lus', 'compte-solde', 'compte-montants']), ['compte-lus'], 'livrés = 10 (la commande)');
  r = await jalonsSans({ controle: CTRL, compte: { ...COMPTE(), B7: '30' } });
  egal(ko(r, ['compte-lus', 'compte-solde', 'compte-montants']), ['compte-lus'], 'consigne à 30 € (l’ancien taux) : seule la lecture tombe');
  r = await jalonsSans({ controle: CTRL, compte: { ...COMPTE(), B5: '10' } });
  egal(ko(r, ['compte-lus', 'compte-solde', 'compte-montants']), ['compte-solde'], 'solde tapé sans formule');
  r = await jalonsSans({ controle: CTRL, compte: { ...COMPTE(), B8: '=B5*B7' } });
  egal(ko(r, ['compte-lus', 'compte-solde', 'compte-montants']), ['compte-montants'], 'montant sur le solde au lieu de l’écart');
  r = await jalonsSans({ controle: CTRL, compte: { ...COMPTE(), C6: '=C2-C5' } });
  egal(ko(r, ['compte-montants']), ['compte-montants'], 'signe perdu');
  // Le chiffrage : 33 au lieu de 0,33 (formules justes) → faux ; valeurs tapées → faux ; division inversée → faux ; 91 accepté (1 %).
  r = await jalonsSans({ chiffrage: { ...CHIFFRAGE, B3: '33' } });
  egal(r.chiffrage, 'ko', '33 cl sans conversion');
  r = await jalonsSans({ chiffrage: { ...CHIFFRAGE, B4: '225' } });
  egal(r.chiffrage, 'ko', '225 g sans conversion');
  r = await jalonsSans({ chiffrage: { ...CHIFFRAGE, B7: '90,9', B8: '20,5', B9: '1084', B10: '114' } });
  egal(r.chiffrage, 'ko', 'calculs tapés en valeurs');
  r = await jalonsSans({ chiffrage: { ...CHIFFRAGE, B10: '=B6/B9' } });
  egal(r.chiffrage, 'ko', 'division inversée');
  r = await jalonsSans({ chiffrage: { ...CHIFFRAGE, B7: '=ARRONDI(B2/B3;0)' } });
  egal(r.chiffrage, 'ok', '91 bouteilles (arrondi) accepté');
  // Rien de vrai sans envoi.
  r = await jalonsSans({});
  egal(Object.values(r).every((s) => s === 'attente'), true, 'rien envoyé : ' + JSON.stringify(r));
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-6.10 : parcours juste à l’écran — contrôle, point d’étape, feuille remplie à la frappe, phrases à Malo et à Inès, chiffrage : toutes les notes justes', async () => {
  await monter({ uid: 'fb610-juste' });
  // Menu progressif : au départ, seule la fiche ① ; aucune pastille faite.
  let menu = await pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || b.dataset.vueFermee));
  egal(menu.filter((x) => /^fiche/.test(x)), ['fiche'], 'menu de départ');
  egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 0, 'aucune pastille faite au départ');
  await controle(CTRL);
  menu = await pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || b.dataset.vueFermee));
  vrai(menu.includes('fiche:consignes'), 'fiche ② au menu après le contrôle (fermée par le point d’étape)');
  egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.map((x) => x.dataset.pastille)), ['0'], 'pastille ① faite');
  await etape('lucas');
  // L'aide de la ligne 4 rappelle SES comptes.
  await aller('fiche:consignes');
  const aide4 = await pg.$eval(`${Z} [data-fiche-grille="compte"] tbody tr:nth-child(4) .gr-aide-col`, (e) => e.textContent.trim());
  egal(aide4, 'Tu as compté au quai : 8 fûts, 5 casiers.', 'aide de la ligne 4');
  await feuille('fiche:consignes', COMPTE());
  // Les résultats affichés à côté des formules.
  const res = await pg.$$eval(`${Z} [data-fiche-grille="compte"] [data-gr-res]`, (L) => Object.fromEntries(L.map((b) => [b.dataset.grRes, b.textContent.trim()])));
  egal([res.B5, res.C5, res.B6, res.C6, res.B8, res.C8, res.B9], ['10', '3', '1', '-2', '40', '-8', '32'], 'résultats affichés');
  vrai(await pg.$eval(`${Z} [data-gr="B5"]`, (i) => i.readOnly || i.disabled), 'feuille figée après l’envoi');
  await phrases('malo-consignes', MALO());
  await phrases('ines-facture', INES());
  await feuille('fiche:chiffrage', CHIFFRAGE);
  const n = await note();
  const faux = JALONS.filter((j) => n.detail[j] !== 'ok');
  egal(faux, [], 'jalons justes');
  egal(['question:qui-aurait-du-compter', 'question:consigne-due', 'question:reemploi-loi'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 4, 'quatre pastilles faites');
  // Les messages de Karim ne disent jamais si c'était juste (alerte 28) ni combien de vides.
  const karim = (await entrants()).filter((m) => m.from === 'Karim').map((m) => m.text).join(' | ');
  egal(/juste|faux|erreur|bravo|\b8\b|\b9\b/i.test(karim.replace(/[\s\S]*?Lucas est au quai 14/, '')), false, 'Karim neutre : ' + karim);
});

await v('ENT-6.10 : inaction 0 ; aucune fiche ne part vide ; aide de la ligne 4 avec des comptes faux (9 / 5)', async () => {
  await monter({ uid: 'fb610-vide' });
  await aller('fiche');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  const manque = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/Il manque/.test(manque), 'fiche ① vide refusée : ' + manque);
  const n0 = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent610.js');
    return S.ETAPES.map((e) => e.verifier(window.__f.db).status);
  });
  egal(n0.every((s) => s === 'attente'), true, 'tout « à faire »');
  await controle({ futs: '9', casiers: '5', plein: '1', ticket: 'oui' });
  await etape('ines');
  await aller('fiche:consignes');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  const m2 = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/B3, C3/.test(m2), 'feuille vide refusée : ' + m2);
  egal(await pg.$eval(`${Z} [data-fiche-grille="compte"] tbody tr:nth-child(4) .gr-aide-col`, (e) => e.textContent.trim()),
    'Tu as compté au quai : 9 fûts, 5 casiers.', 'aide de la ligne 4 avec ses comptes faux');
});

// ─────────────────────────────────────────────────────────── l'écran : sans défilement, loupe, formule en cliquant
for (const [w, h] of [[1366, 768], [1280, 720]]) {
  await v(`ENT-6.10 : ergonomie ${w} × ${h} — aucune fiche ne fait défiler la page, le bouton d’envoi se voit ; un fût du dessin fait au moins 40 px (1366)`, async () => {
    await pg.setViewportSize({ width: w, height: h });
    try {
      const db = { fiches: { controle: { valeurs: CTRL, envoye: { at: 1 } }, consignes: { valeurs: { compte: { cases: COMPTE() } }, envoye: { at: 2 } } } };
      await monter({ uid: 'fb610-ecran', db });
      // Les messages et l'envoi de Malo et d'Inès, posés tels quels (envois de phrases) pour ouvrir la fiche ④.
      await pg.evaluate(() => {
        const db = window.__f.db;
        db.mails.filter((m) => m.phrases).forEach((m, k) => db.mails.push({ id: 900 + k, folder: 'out', toMail: m.fromMail, ts: Date.now() + k, text: 'x',
          phrases: { id: m.phrases.id, choix: {} } }));
        db.questions['france-boissons-retour']['qui-aurait-du-compter'] = { arrivee: 1, premiere: 'lucas', duree: 1 };
        db.questions['france-boissons-retour']['ce-que-tu-compares'] = { arrivee: 1, premiere: 'quai', duree: 1 };
        db.questions['france-boissons-retour']['consigne-due'] = { arrivee: 1, premiere: 'consigne', duree: 1 };
      });
      await monter({ uid: 'fb610-ecran', db: await base() });
      const mesures = [];
      for (const vue of ['fiche', 'fiche:consignes', 'fiche:chiffrage']) {
        await aller(vue);
        await pg.$$eval('[data-carte-fermer]', (L) => L.forEach((b) => b.click()));
        await pause(200);
        // La hauteur de la SÉANCE (le montage de test la pose au-dessus de la page d'accueil du site, qui reste dessous), SANS la pile
        // des cartes de messages : elle pousse l'écran de travail dans toutes les séances (question posée à Tristan le 13/10/2026).
        mesures.push(await pg.evaluate(() => { window.scrollTo(0, 0); const p = document.querySelector('#fTest .ent-page');
          const cartes = document.querySelector('#fTest .ent-cartes-ancre').getBoundingClientRect().height;
          return { h: p.scrollHeight - cartes, bas: document.querySelector('#fTest [data-fiche-envoyee], #fTest [data-fiche-envoyer]').getBoundingClientRect().bottom - cartes }; }));
      }
      const dit = mesures.map((m, i) => `fiche ${i + 1} : ${Math.round(m.h)} px, bouton à ${Math.round(m.bas)}`).join(' ; ');
      vrai(mesures.every((m) => m.h <= h + 1 && m.bas <= h), `${dit} (pour ${h})`);
      if (w === 1366) {
        await aller('fiche');
        // Le dessin : 1312 unités de large ; un fût (ellipse du dessus) fait 73,4 unités.
        const larg = await pg.$eval(`${Z} .ent-doc-loupe img`, (i) => i.getBoundingClientRect().width);
        vrai(larg * 73.4 / 1312 >= 40, `dessin ${Math.round(larg)} px de large : un fût (73,4 unités sur 1312) fait ${Math.round(larg * 73.4 / 1312)} px`);
      }
    } finally { await pg.setViewportSize({ width: 1366, height: 900 }); }
  });
}

await v('ENT-6.10 : la loupe — un clic ouvre le dessin en plein écran, Échap le ferme et le focus revient ; le texte de remplacement ne donne aucun nombre', async () => {
  await monter({ uid: 'fb610-loupe' });
  await aller('fiche');
  const alt = await pg.$eval(`${Z} .ent-doc-loupe img`, (i) => i.alt);
  egal(/\d/.test(alt), false, 'alt sans nombre : ' + alt);
  await pg.click(`${Z} .ent-doc-loupe`);
  await pause();
  vrai(await pg.$('[data-doc-loupe-ouverte]'), 'loupe ouverte');
  const t = await pg.$eval('[data-doc-loupe-ouverte] img', (i) => { const r = i.getBoundingClientRect(); return [r.width, innerWidth]; });
  vrai(t[0] > t[1] * 0.8, `dessin agrandi : ${Math.round(t[0])} px`);
  await pg.keyboard.press('Escape');
  await pause();
  egal(await pg.$('[data-doc-loupe-ouverte]'), null, 'loupe fermée');
  vrai(await pg.evaluate(() => document.activeElement && document.activeElement.matches('.ent-doc-loupe')), 'focus revenu au dessin');
});

await v('ENT-6.10 : formule en cliquant — « = », clic sur B2, « + », clic sur B3, « - », clic sur B4 écrit =B2+B3-B4 (la case donnée se pointe) ; Entrée passe à la case suivante', async () => {
  const db = { fiches: { controle: { valeurs: CTRL, envoye: { at: 1 } } } };
  await monter({ uid: 'fb610-pointe', db });
  await pg.evaluate(() => { window.__f.db.questions['france-boissons-retour']['qui-aurait-du-compter'] = { arrivee: 1, premiere: 'lucas', duree: 1 }; });
  await monter({ uid: 'fb610-pointe', db: await base() });
  await aller('fiche:consignes');
  const cel = async (ref) => { const b = await (await pg.$(`${Z} [data-fiche-grille="compte"] td[data-ref="${ref}"]`)).boundingBox(); return [b.x + 8, b.y + b.height / 2]; };
  await pg.click(`${Z} [data-gr="B3"]`);
  await pg.keyboard.type('9');
  await pg.keyboard.press('Enter');
  egal(await pg.evaluate(() => document.activeElement.dataset.gr), 'C3', 'Entrée → C3');
  await pg.click(`${Z} [data-gr="B5"]`);
  await pg.keyboard.type('=');
  for (const [ref, op] of [['B2', '+'], ['B3', '-'], ['B4', '']]) {
    const [x, y] = await cel(ref);
    await pg.mouse.click(x, y);
    if (op) await pg.keyboard.type(op);
  }
  egal(await pg.$eval(`${Z} [data-gr="B5"]`, (i) => i.value), '=B2+B3-B4', 'formule pointée');
  egal((await base()).fiches.consignes.valeurs.compte.cases.B5, '=B2+B3-B4', 'rangée dans la base');
});

F.fermer();
}
