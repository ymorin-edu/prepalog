// Suite de tests de Prepalog — bloc « action-87 » : ENT-8.7 Action, « on décharge ensemble » (CAP OL, guidage CAP-C1.3).
// Brief `docs/briefs/ENT-8.7-action-decharger.md` §8 ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8.
// `node outils/test.mjs action-87` ne lance que ce bloc. Aides communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`.
// L'inspection se joue À LA SOURIS (zones du moteur lues dans `zonesScene`, clic au centre à la `boundingBox()` du <svg>, comme fb-6.4) ; la
// dépose, par un clic sur la case. Mouvement réduit : le camion arrive et Kevin pose d'emblée.
//
// Valeurs ÉCRITES À LA MAIN :
//   graines (db.tirage.graine) → anomalie du quai : temoin-0 → cale, temoin-1 → lampe, temoin-2 → niveleur, temoin-3 → cabine (relevé du
//   17/10/2026 sur `anomalieDe`). Élève TÉMOIN (tirage posé à la main) : situations s-partir (moyen), s-aerosols (difficile), s-vitesse (facile) ;
//   confirmé : en plus s-blesse (moyen). Consignes justes : s-partir → c-depart, s-aerosols → c-aerosols, s-vitesse → c-vitesse, s-blesse → c-sst ;
//   « qui décharge » → kevin-frontal. Dialogue juste : arrivee presente, documents ldv, quai quai2, attente local, fin fin-poli.
//   Dépose : cases justes R1 à R4, pièges allee-1 (allée piétonne) et quai3-1 (devant le quai 3) ; sortie P4, P3, P2, P1.
//   Poids : accueil 0,5 / 1 / 1 / 1,5 / 0,5 · situations 1,5 (moyen) / 1,5 (difficile) / 1 (facile) · danger 3, aucun faux 1 · engin 1, dépose
//   4 × 0,625 ; questions M 1,5, N 1,5, P 1 (part 4 ; L non notée).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT87 || '';

const ID = 'action-decharger';
const QID = 'action-quai2-decharger';
const GRAINE = { cale: 'temoin-0', lampe: 'temoin-1', niveleur: 'temoin-2', cabine: 'temoin-3' };
const REP_OUV = { protocole: 'document', 'plan-circulation': 'passages', anomalie: 'signale', 'zone-reception': 'devant', remorque: 'marchandise',
  caces: 'engin', vouvoiement: 'vous', 'img-cale': 'immobiliser', 'img-feux': 'chauffeur', 'img-niveleur': 'passer' };
const tirage = (o = {}) => ({ graine: `temoin|${ID}`, pieces: { situations: ['s-partir', 's-aerosols', 's-vitesse'] },
  difficultes: { situations: { 's-vitesse': 'facile', 's-partir': 'moyen', 's-aerosols': 'difficile', 's-blesse': 'moyen' } },
  ...(o.confirme ? { bonus: { situations: ['s-blesse'] } } : {}), essai: 0, secours: false, at: 1 });
const baseTemoin = (anomalie = 'cabine', o = {}) => ({ tirage: { graine: GRAINE[anomalie], pose: 1 }, tirages: { [ID]: tirage(o) } });
const PROTO = { 's-partir': 'c-depart', 's-aerosols': 'c-aerosols', 's-vitesse': 'c-vitesse', engin: 'kevin-frontal' };
const PROTO_FAUX = { 's-partir': 'c-vitesse', 's-aerosols': 'c-gerbage', 's-vitesse': 'c-butoirs', engin: 'moi-frontal' };
const DIAL = { arrivee: 'presente', documents: 'ldv', quai: 'quai2', attente: 'local', fin: 'fin-poli' };
const DIAL_FAUX = { arrivee: 'salut', documents: 'permis', quai: 'quai4', attente: 'cabine', fin: 'fin-copain' };
const ORDRE_DIAL = ['arrivee', 'documents', 'quai', 'attente', 'fin'];
const BONNES_Q = { 'qui-ecrit': 'ensemble', 'pourquoi-local': 'chariots', 'decharge-quand-meme': 'attendre', 'peut-partir': 'attendre' };
const FAUSSES_Q = { 'qui-ecrit': 'chauffeur', 'pourquoi-local': 'pas-pense', 'decharge-quand-meme': 'oui', 'peut-partir': 'oui' };
const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const DEPOSE_JUSTE = { P4: 'R1', P3: 'R2', P2: 'R3', P1: 'R4' };
const GROUPES = ['Accueillir le chauffeur', 'Le protocole', 'Avant de décharger', 'Diriger le déchargement', 'Les questions de Samia'];
const JALONS = ['accueil-salutation', 'accueil-documents', 'accueil-quai', 'accueil-attente', 'accueil-fin', 'situation-facile', 'situation-moyen',
  'situation-difficile', 'securite-danger', 'securite-aucun-faux', 'engin', 'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;

// Monte la séance dans la page. `o.db` : une base de départ ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-decharger.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac87' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: o.suivante || null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
let capturer = false;
const capture = async (nom, sel = null) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  if (sel) await pg.$eval(sel, (x) => x.scrollIntoView({ block: 'end' })); else await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};
const panneau = () => pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un. `vus` : les ids des questions répondues, dans l'ordre.
async function qrep(choix = BONNES_Q, vus = []) {
  for (let i = 0; i < 6; i++) {
    const id = await panneau();
    if (!id) return vus;
    vus.push(id);
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pause();
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
  return vus;
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };

// ① la fiche du protocole
async function protocole(rep = PROTO, choix = BONNES_Q, vus = []) {
  await allerV('fiche');
  const ids = await pg.$$eval(`${Z} [data-fiche="protocole"] input[data-fiche-champ]`, (L) => [...new Set(L.map((s) => s.dataset.ficheChamp))]);
  for (const id of ids) { await pg.check(`${Z} input[data-fiche-champ="${id}"][value="${rep[id]}"]`); await pause(30); }
  await capture('1-protocole');
  await pg.click(`${Z} [data-fiche-envoyer]`); await confirmer();
  await qrep(choix, vus);
  return ids;
}
// ② l'accueil de Marc : `rep` donne la première réponse de chaque réplique ; une maladroite est suivie de la juste (sauf `accepte`).
const dire = async (val) => { await pg.click(`${Z} [data-dlg-choix="${val}"]`); await pause(); };
async function accueil(rep = DIAL) {
  await allerV('telephone');
  await pg.click(`${Z} [data-dlg-appeler="marc"]`); await pause();
  for (const r of ORDRE_DIAL) {
    await dire(rep[r]);
    if (rep[r] !== DIAL[r] && !/^fin-/.test(rep[r])) await dire(DIAL[r]);
  }
  await capture('2-accueil');
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
}
// ③ le quai : l'inspection (zones du moteur), « C'est bon », puis la dépose.
const SVG = `${Z} [data-q-inspection]`;
const zones = () => pg.evaluate(async (QID) => {
  const Q = await import('/core/types/quai.js');
  const C = await import('/contenus/action-ent87.js');
  const S = C.quaiEleve(window.__f.db).securite, q = window.__f.db.quais[QID];
  return Q.zonesScene(S, Q.etatsScene(S, q && q.securite));
}, QID);
async function cliquerVB(x, y) {
  const loc = pg.locator(SVG);
  await loc.scrollIntoViewIfNeeded();
  const bb = await loc.boundingBox();
  const [vx, vy, vw, vh] = await loc.evaluate((s) => s.getAttribute('viewBox').split(' ').map(Number));
  const k = Math.min(bb.width / vw, bb.height / vh);
  await pg.mouse.click(bb.x + (bb.width - vw * k) / 2 + (x - vx) * k, bb.y + (bb.height - vh * k) / 2 + (y - vy) * k);
  await pause(40);
}
async function vueScene(vue) {
  if ((await pg.$eval(SVG, (s) => s.dataset.vue)) === vue) return;
  if (vue === 'dedans' && !(await present('[data-q="sc-vue"]'))) await pg.click(`${Z} [data-q="sc-ouvrir"]`);
  else await pg.click(`${Z} [data-q="sc-vue"]`);
  await pg.waitForFunction(({ Z, v }) => document.querySelector(`${Z} [data-q-inspection]`).dataset.vue === v, { Z, v: vue });
}
async function marquer(id) { const z = (await zones()).find((q) => q.id === id); await vueScene(z.vue); const r = z.rects[0]; await cliquerVB(r.x + r.w / 2, r.y + r.h / 2); }
const signaler = async () => { await pg.click(`${Z} [data-q="sc-signaler"]`); await pause(); };
const chef = () => pg.$eval(`${Z} [data-q-secu-chef]`, (n) => n.textContent.trim());
const cestBon = async () => { await pg.click(`${Z} [data-q="sc-decharger"]`); await pg.click(`${Z} [data-q="sc-decharger"]`); await pause(); };
const annonce = () => pg.$eval(`${Z} [data-q-annonce]`, (n) => n.textContent.trim()).catch(() => '');
const posees = () => pg.$$eval(`${Z} [data-iso-posee]`, (L) => L.length);
// `envois` : une liste d'envois (les objets marqués à chaque « Signaler ») ; `depose` : pour chaque palette, la liste des cases cliquées.
async function quai(o = {}) {
  const choix = o.choix || BONNES_Q;
  await allerV('quai');
  await pg.waitForSelector(SVG);
  await capture('3-quai-dehors');
  for (const ids of (o.envois || [[o.anomalie || 'cabine']])) {
    for (const id of ids) await marquer(id);
    await signaler();
    await qrep(choix, o.vus);
  }
  if (o.avant) await o.avant();
  await cestBon();
  await qrep(choix, o.vus);
  await pg.click(`${Z} [data-q="decharger"]`);
  await pg.waitForSelector(`${Z} [data-q-phase="choix"]`);
  for (const [k, pal] of SORTIE.entries()) {
    const L = (o.depose && o.depose[pal]) || [DEPOSE_JUSTE[pal]];
    for (const c of L) {
      const n = await posees();
      await pg.click(`${Z} [data-q="depose"][data-c="${c}"]`);
      await pause();
      if (k === 1 && c === L[0]) await capture('4-quai-depose', Z + ' [data-q-phase]');
      if (c !== L[L.length - 1]) vrai((await posees()) === n, `${pal} : la case ${c} n’aurait pas dû poser la palette`);
    }
  }
  await pause();
  await qrep(choix, o.vus);
}
async function parcoursComplet(o = {}) {
  await protocole(o.proto, o.q, o.vus);
  await accueil(o.dial);
  await quai({ ...o, choix: o.q });
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});

// ─────────────────────────────────────────────────────────── le contenu (hors écran)
await v('ENT-8.7 : contenu — chaque situation a une seule consigne qui s’applique, ses choix sont mot pour mot dans le protocole ; le contrôle refuse une banque fautive ; les 4 quais tirés passent verifierQuai', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent87-donnees.js');
    const C = await import('/contenus/action-ent87.js');
    const Q = await import('/core/types/quai.js');
    const doc = document.createElement('div'); doc.innerHTML = C.DOC_PROTOCOLE.html;
    const ecrites = Object.fromEntries([...doc.querySelectorAll('[data-consigne]')].map((li) => [li.dataset.consigne, li.textContent]));
    const pasDansLeDoc = D.BANQUE_SITUATIONS.flatMap((s) => D.choixDe(s).filter((c) => ecrites[c.v] !== c.lib).map((c) => `${s.id}:${c.v}`));
    const mod = (f) => { const B = JSON.parse(JSON.stringify(D.BANQUE_SITUATIONS)); f(B); return D.ecartsSituations(B); };
    return {
      ecarts: D.ecartsSituations(), pasDansLeDoc,
      rubriques: [...doc.querySelectorAll('[data-rubrique]')].map((x) => x.dataset.rubrique),
      deux: mod((B) => { B.find((s) => s.id === 's-partir').choix[1] = 'c-attente'; }),
      sansJuste: mod((B) => { B.find((s) => s.id === 's-pieton').choix[0] = 'c-epi'; }),
      inconnue: mod((B) => { B.find((s) => s.id === 's-gilet').choix[3] = 'c-pas-la'; }),
      deuxChoix: mod((B) => { B.find((s) => s.id === 's-vitesse').choix.pop(); }),
      quais: D.ANOMALIES_SOCLE.map((a) => [a, Q.verifierQuai(D.quaiDuTirage(a)), D.quaiDuTirage(a).securite.points.filter((p) => !p.ok).map((p) => p.objet)]),
      pied: /Document pédagogique — reconstitution, non contractuel\. Contenu d’après le Code du travail, art\. R4515-6 ; consignes et valeurs construites\./.test(doc.textContent),
      entete: (() => { const d = document.createElement('div'); d.innerHTML = C.DOCUMENTS.find((x) => x.id === 'protocole-entete').html; return d.querySelectorAll('[data-consigne]').length; })(),
    };
  });
  egal(r.ecarts, [], 'contrôle de la banque');
  egal(r.pasDansLeDoc, [], 'un choix de la fiche n’est pas écrit tel quel dans le protocole');
  egal(r.rubriques.slice().sort(), ['acces', 'engins', 'produits', 'responsable', 'secours', 'securite'], 'les rubriques 1 à 5 de R4515-6 et les produits');
  vrai(r.deux.some((x) => /s-partir : 2 consigne/.test(x)), 'deux consignes qui s’appliquent non vues : ' + r.deux);
  vrai(r.sansJuste.some((x) => /s-pieton : la consigne juste n’est pas parmi les choix/.test(x)), 'juste absente non vue : ' + r.sansJuste);
  vrai(r.inconnue.some((x) => /c-pas-la/.test(x)), 'consigne inconnue non vue : ' + r.inconnue);
  vrai(r.deuxChoix.some((x) => /s-vitesse : 2 choix/.test(x)), 'deux choix seulement non vus : ' + r.deuxChoix);
  egal(r.quais, [['cabine', [], ['cabine']], ['cale', [], ['cale']], ['niveleur', [], ['niveleur']], ['lampe', [], ['lampe']]], 'un seul danger par quai, accepté par le moteur');
  vrai(r.pied, 'pied du protocole');
  egal(r.entete, 0, 'l’en-tête d’« Avant de commencer » ne montre aucune consigne');
});

await v('ENT-8.7 : déclaration (CAP, CAP-C1.3, guidage, 20 points, parcours après ENT-8.4, livrée fermée aux élèves) ; poids par bloc ; questions M, L, N, P', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-decharger.js');
    const S = await import('/contenus/action-ent87.js');
    const Q = await import('/contenus/questions/ENT-8.7.js');
    const m = A.meta;
    const socle = S.ETAPES.filter((e) => !e.bonus);
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
        m.niveauxPrevus, m.questions, m.pret, m.ouverture, m.corrige],
      ids: socle.map((e) => e.id), poids: socle.map((e) => e.poids), somme: socle.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part,
      parGroupe: Object.entries(socle.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      sansEcran: socle.filter((e) => !e.ecran).map((e) => e.id),
      qFil: Q.QUESTIONS.liste.filter((q) => q.type === 'fil').map((q) => [q.id, q.de, q.poids, !!q.reflexion, q.apres || 'tout de suite', q.quand.gestes]),
      bonus: S.ETAPES.filter((e) => e.bonus).map((e) => [e.id, e.poids, e.groupe]),
      ouv: [Q.QUESTIONS.ouverture.tirage, Q.QUESTIONS.ouverture.questions.length],
    };
  });
  egal(r.m, ['action-decharger', 'ENT-8.7', 'simulog', ['cap'], [], ['CAP-C1.3'], 'guidage', 20, true, true, true, 'action-avant-noel', ['confirme'], 'ENT-8.7',
    true, 'prof', './contenus/corriges/ENT-8.7.js'], 'meta ENT-8.7');
  egal(r.ids, JALONS, 'jalons du socle');
  egal(r.poids, [0.5, 1, 1, 1.5, 0.5, 1, 1.5, 1.5, 3, 1, 1, 0.625, 0.625, 0.625, 0.625], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des poids des jalons et des questions');
  egal(r.parGroupe, [['Accueillir le chauffeur', 4.5], ['Le protocole', 4], ['Avant de décharger', 4], ['Diriger le déchargement', 3.5]], 'points par ligne du bandeau');
  egal(r.sansEcran, ['securite-danger', 'securite-aucun-faux', 'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4'], 'seul le quai ne se rouvre pas');
  egal(r.qFil, [['qui-ecrit', 'samia', 1.5, false, 'tout de suite', ['fiche:protocole:envoyer']],
    ['pourquoi-local', 'samia', undefined, true, 'tout de suite', ['fiche:protocole:envoyer']],
    ['decharge-quand-meme', 'kevin', 1.5, false, 'tout de suite', ['scene:action-quai2-decharger:signaler']],
    ['peut-partir', 'samia', 1, false, 'tout de suite', ['quai:action-quai2-decharger:dechargement']]], 'questions au fil');
  egal(r.bonus, [['bonus-situation', undefined, undefined]], 'cas bonus sans poids ni groupe');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 10], 'Avant de commencer : 10 notions, 3 + 1 tirées');
});

// ─────────────────────────────────────────────────────────── le tirage (300 graines)
await v('ENT-8.7 : tirage — 300 graines : 3 situations (une de chaque difficulté), 4 chez le confirmé, zéro secours ; une seule anomalie par quai, jamais les butoirs, les quatre tirées', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent87-donnees.js');
    const out = { secours: 0, mix: new Set(), confirme: new Set(), anomalies: {}, unDanger: 0, situ: new Set() };
    for (let i = 0; i < 300; i++) {
      for (const confirme of [false, true]) {
        const t = D.TIRAGE.tirer(`eleve-${i}|action-decharger`, { confirme });
        if (t.secours) out.secours++;
        if (!confirme) { out.mix.add(t.pieces.situations.map((id) => t.difficultes.situations[id]).sort().join(',')); t.pieces.situations.forEach((s) => out.situ.add(s)); }
        else out.confirme.add(`${t.pieces.situations.length}+${t.bonus.situations.length}:${t.difficultes.situations[t.bonus.situations[0]]}`);
      }
      const Q = D.quaiDe(`eleve-${i}`);
      const dangers = Q.securite.points.filter((p) => !p.ok);
      if (dangers.length === 1) out.unDanger++;
      out.anomalies[dangers[0].objet] = (out.anomalies[dangers[0].objet] || 0) + 1;
    }
    return { ...out, mix: [...out.mix], confirme: [...out.confirme], situ: out.situ.size };
  });
  egal(r.secours, 0, 'secours');
  egal(r.mix, ['difficile,facile,moyen'], 'mélange du socle');
  egal(r.confirme, ['3+1:moyen'], 'confirmé : une situation moyenne de plus');
  egal(r.situ, 8, 'toutes les situations sont tirées un jour');
  egal(r.unDanger, 300, 'un seul danger par quai');
  egal(Object.keys(r.anomalies).sort(), ['cabine', 'cale', 'lampe', 'niveleur'], 'les quatre anomalies du socle, jamais les butoirs');
  vrai(Object.values(r.anomalies).every((n) => n > 40), 'répartition des anomalies : ' + JSON.stringify(r.anomalies));
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d.proto` : la fiche envoyée ; `d.dial` : les premières réponses de l'appel terminé ; `d.sec` : l'inspection ({ signaux, fait }) ;
// `d.depose` : { palette: premier choix } (posées ensuite en case juste), avec la fin du déchargement.
const jalonsSans = (d, o = {}) => pg.evaluate(async ({ T, d, g }) => {
  const S = await import('/contenus/action-ent87.js');
  const db = { tirage: { graine: g }, tirages: { 'action-decharger': T }, fiches: {}, quais: {} };
  if (d.proto) db.fiches.protocole = { valeurs: d.proto, envoye: { at: 1 } };
  if (d.dial) db.dialogues = { 'action-decharger': { marc: { appels: [{ debut: 1, fin: 2, pas: Object.entries(d.dial).map(([r, v], i) => ({ r, v, at: i })), reprises: 0 }] } } };
  if (d.sec || d.depose) {
    const q = db.quais['action-quai2-decharger'] = { depose: {} };
    if (d.sec) q.securite = { mode: 'scene', marques: [], compteur: 0, ouverte: true, arrete: false, chef: '', signaux: d.sec.signaux || [], fait: d.sec.fait !== false };
    if (d.depose) {
      const justes = ['R1', 'R2', 'R3', 'R4']; let k = 0;
      for (const [p, c] of Object.entries(d.depose)) q.depose[p] = { premier: c, essais: c === justes[k] ? [c] : [c, justes[k]], pose: justes[k++] };
      q.dechargeFini = d.finDecharge !== false;
    }
  }
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { T: tirage(o), d, g: GRAINE[o.anomalie || 'cale'] });
const SEC_JUSTE = { signaux: [{ points: ['cale'], rien: 0, marques: [1], apresArret: false }] };
const DEP_JUSTE = { P4: 'R1', P3: 'R2', P2: 'R3', P1: 'R4' };

await v('ENT-8.7 : jalons sans écran — rien : tout « à faire » ; chaque écran fait tomber SES jalons ; « aucun faux » faux quand rien n’est signalé ; une palette sur l’allée = SA case fausse', async () => {
  const vide = await jalonsSans({});
  egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien fait');
  egal(vide['bonus-situation'], 'null', 'standard : pas de cas bonus');
  const juste = { proto: PROTO, dial: DIAL, sec: SEC_JUSTE, depose: DEP_JUSTE };
  const s = await jalonsSans(juste);
  egal(JALONS.filter((j) => s[j] !== 'ok'), [], 'parcours juste');
  const ko = async (f, o) => { const d = JSON.parse(JSON.stringify(juste)); f(d); const x = await jalonsSans(d, o); return JALONS.filter((j) => x[j] !== 'ok'); };
  egal(await ko((d) => { d.dial.attente = 'cabine'; }), ['accueil-attente'], 'Marc laissé dans sa cabine');
  egal(await ko((d) => { d.dial.arrivee = 'salut'; d.dial.fin = 'fin-copain'; }), ['accueil-salutation', 'accueil-fin'], 'la forme');
  egal(await ko((d) => { d.proto['s-partir'] = 'c-chauffeur'; }), ['situation-moyen'], 'une consigne d’une autre rubrique pour « repartir »');
  egal(await ko((d) => { d.proto.engin = 'moi-frontal'; }), ['engin'], '« toi, au chariot élévateur frontal »');
  egal(await ko((d) => { d.sec.signaux = []; }), ['securite-danger', 'securite-aucun-faux'], 'rien signalé, inspection figée : danger ✗ ET aucun faux ✗');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['cale', 'lampe'], rien: 0, apresArret: false }]; }), ['securite-aucun-faux'], 'la lampe (en ordre) signalée aussi');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['cale'], rien: 1, apresArret: false }]; }), ['securite-aucun-faux'], 'une marque à côté');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['cale'], rien: 0, apresArret: true }]; }), ['securite-danger'], 'signalé après l’arrêt de Samia');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['cabine'], rien: 0, apresArret: false }]; }), ['securite-danger', 'securite-aucun-faux'], 'pas le bon objet');
  egal(await ko((d) => { d.depose.P3 = 'allee-1'; }), ['depose-P3'], 'P3 sur l’allée piétonne au premier choix');
  egal(await ko((d) => { d.depose.P1 = 'quai3-1'; d.depose.P4 = 'allee-1'; }), ['depose-P1', 'depose-P4'], 'P1 devant le quai 3, P4 sur l’allée');
  // Le danger d'un autre élève (une autre graine) : son jalon lit SON quai.
  egal(await ko((d) => { d.sec.signaux = [{ points: ['cabine'], rien: 0, apresArret: false }]; }, { anomalie: 'cabine' }), [], 'graine « cabine » : la cabine signalée est juste');
  // Pas figée / pas fini : « à faire », jamais faux.
  const enCours = await jalonsSans({ ...juste, sec: { ...SEC_JUSTE, fait: false }, finDecharge: false });
  egal([enCours['securite-danger'], enCours['securite-aucun-faux'], enCours['depose-P1']], ['attente', 'attente', 'attente'], 'inspection non figée, déchargement pas fini');
});

await v('ENT-8.7 : confirmé — la situation bonus est jugée à part (`null` chez un standard) ; fausse, elle ne change rien au socle', async () => {
  const d = { proto: { ...PROTO, 's-blesse': 'c-sst' }, dial: DIAL, sec: SEC_JUSTE, depose: DEP_JUSTE };
  egal((await jalonsSans(d, { confirme: true }))['bonus-situation'], 'ok', 'bonus juste');
  const f = await jalonsSans({ ...d, proto: { ...PROTO, 's-blesse': 'c-epi' } }, { confirme: true });
  egal(f['bonus-situation'], 'ko', 'bonus faux');
  egal(JALONS.filter((j) => f[j] !== 'ok'), [], 'le socle reste juste');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-8.7 : parcours juste à l’écran (anomalie : la cabine) — 20 / 20, bandeau de 5 lignes ✓ ; M puis L à l’envoi de la fiche, N (Kevin) au premier signalement, P quand la dernière palette est posée', async () => {
  capturer = true;
  await monter({ uid: 'ac87-juste', sansOuverture: true, db: baseTemoin('cabine') });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], 'questions d’ouverture tirées : 3 + 1 image');
  for (let k = 0; k < 4; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await pg.click(`${Z} [data-q-choix="${REP_OUV[ov[k]]}"][data-q="${ov[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${ov[k]}"]`); await pause();
  }
  await pg.click(`${Z} [data-ouv-continuer]`); await pause();
  vrai(await present('.ent-nav[data-vue-fermee="telephone"]') && await present('.ent-nav[data-vue-fermee="quai"]'), '« Au quai » et le quai grisés au départ');
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction : 0');
  const vus = [];
  const lignes = await protocole(PROTO, BONNES_Q, vus);
  egal(lignes, ['s-partir', 's-aerosols', 's-vitesse', 'engin'], 'les lignes de la fiche (ses situations, puis « qui décharge »)');
  egal(vus, ['qui-ecrit', 'pourquoi-local'], 'M puis L à l’envoi de la fiche');
  await accueil();
  const gestes = Object.keys((await base()).gestes[ID]);
  vrai(gestes.includes('dialogue:marc:fin'), 'l’accueil fini');
  await quai({ anomalie: 'cabine', vus });
  egal(vus, ['qui-ecrit', 'pourquoi-local', 'decharge-quand-meme', 'peut-partir'], 'N au signalement, P à la dernière palette');
  const e = (await base()).quais[QID];
  egal(Object.fromEntries(Object.entries(e.depose).map(([p, x]) => [p, x.premier])), DEPOSE_JUSTE, 'premiers choix de la dépose');
  vrai(e.dechargeFini === true, 'le quai s’est arrêté après la dépose');
  vrai(/Les 4 palettes sont en zone de réception\. Le contrôle, c’est la prochaine fois\./.test(await texte()), 'bandeau de fin du quai');
  await capture('5-quai-fin', Z + ' [data-q-phase]');
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
  egal(['question:qui-ecrit', 'question:decharge-quand-meme', 'question:peut-partir'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  egal(b.fin, 'ok', 'tout juste');
  await pg.$eval(`${Z} [data-fin-seance]`, (x) => x.scrollIntoView({ block: 'start' })); await capture('6-bilan');
  capturer = false;
  const sujets = (await entrants()).map((x) => x.subject);
  egal(sujets, ['Le protocole du quai 2', 'Le camion est là', 'Kevin est prêt', 'Les palettes sont au sol'], 'les messages de Samia, dans l’ordre');
  egal((await entrants()).filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  const ts = (await entrants()).map((x) => x.ts);
  vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
  vrai(new Date(ts[0]).getMonth() === 10 && new Date(ts[0]).getDate() === 9 && new Date(ts[0]).getHours() === 6, 'le 9 novembre à 6 h 45 : ' + new Date(ts[0]));
  const ecrit = [...(await entrants()).map((x) => x.text), ...(await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent87.js'); return S.DOCUMENTS.map((d) => d.html || ''); }))].join('\n');
  vrai(!/\b20\d\d\b/.test(ecrit.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un message ou un document (hors date de consultation du droit)');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.7 : inaction et pire cas — rien fait : 0 ; tout faux (maladroit d’abord à chaque réplique, pièges, faux signalement puis arrêt de Samia, les deux pièges à la dépose) : 1,25 / 20 (P2 et P1 n’ont plus de piège à essayer), premier bilan atteint, « Corriger » et la phrase du quai', async () => {
  await monter({ uid: 'ac87-pire', db: baseTemoin('lampe') });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction');
  await protocole(PROTO_FAUX, FAUSSES_Q);
  await accueil(DIAL_FAUX);
  await quai({ choix: FAUSSES_Q, envois: [['cale']], depose: { P4: ['allee-1', 'R1'], P3: ['quai3-1', 'R2'], P2: ['R3'], P1: ['R4'] },
    avant: async () => {
      await cestBon();
      vrai(await present('[data-q-secu-arret]'), 'Samia arrête l’élève');
      vrai(!/lampe/i.test(await pg.textContent(`${Z} [data-q-secu-arret]`)), 'l’arrêt ne nomme pas le danger');
      await marquer('lampe'); await signaler();
    } });
  const n = await note();
  // P2 et P1 : premier choix juste, mais les deux pièges sont grisés pour tous : le jalon de ces palettes est juste. On l'accepte : il reste
  // P4 et P3 fausses ; le reste est faux.
  egal(JALONS.filter((j) => n.detail[j] !== 'ko'), ['depose-P1', 'depose-P2'], 'tout faux sauf les deux palettes posées du premier coup');
  proche(n.score, 1.25, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige, 'Corriger et la phrase du premier essai : ' + b.texte);
  vrai(/Le quai se joue une fois : le camion est déchargé\./.test(b.texte), 'finFige');
  vrai(!!((await base()).points && (await base()).points[ID]), 'photo de fin rangée (la séance suivante s’ouvrirait)');
});

await v('ENT-8.7 : dialogue — « Restez au chaud » à la réplique « attente » : Marc réagit, la réplique revient, l’entretien finit ; seul ce jalon ✗ ; « Corriger » → « Revenir le voir », rejoué juste : ✓', async () => {
  await monter({ uid: 'ac87-dial', db: baseTemoin('cale') });
  await protocole();
  await allerV('telephone');
  vrai(/Samia : « Le camion est là\./.test(await pg.textContent(`${Z} .dlg-repos`).catch(() => '')), 'la consigne de Samia en haut de l’écran');
  await pg.click(`${Z} [data-dlg-appeler="marc"]`); await pause();
  for (const r of ['arrivee', 'documents', 'quai']) await dire(DIAL[r]);
  await dire('cabine');
  vrai(/votre protocole ne dit pas ça, il me semble/.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'Marc réagit');
  const libres = await pg.$$eval(`${Z} [data-dlg-choix]:not([disabled])`, (L) => L.map((x) => x.dataset.dlgChoix).sort());
  egal(libres, ['aider', 'local'], 'la réplique revient, la réponse maladroite grisée');
  await dire('local'); await dire('fin-poli');
  vrai(/Merci, à tout à l’heure\./.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'la dernière bulle de Marc');
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  await quai({ anomalie: 'cale' });
  let n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['accueil-attente'], 'seul le jalon « attente » est faux');
  await pg.click(`${Z} [data-fin-corriger]`); await pause();
  await allerV('telephone');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="marc"]`), 'Revenir le voir', 'le bouton de la correction');
  await pg.click(`${Z} [data-dlg-appeler="marc"]`); await pause();
  for (const r of ORDRE_DIAL) await dire(DIAL[r]);
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  n = await note();
  egal(n.detail['accueil-attente'], 'ok', 'rejoué juste');
  vrai(n.score > 19 && n.score < 20, 'note moyennée après correction : ' + n.score);
});

await v('ENT-8.7 : inspection — « C’est bon » sans rien signaler : Samia arrête (sans nommer) ; signalé ensuite : danger ✗ ; la réponse de Samia est composée point par point ; une marque sur un objet en ordre : « aucun faux » ✗', async () => {
  await monter({ uid: 'ac87-insp', db: baseTemoin('niveleur') });
  await protocole(); await accueil();
  await allerV('quai'); await pg.waitForSelector(SVG);
  vrai(/Kevin est prêt\. Avant qu’il entre dans le camion, regarde le quai et le camion\./.test(await texte()), 'la consigne de Samia au-dessus de la scène');
  await cestBon();
  vrai(await present('[data-q-secu-arret]'), 'Samia arrête');
  vrai(!/niveleur/i.test(await pg.textContent(`${Z} [data-q-secu-arret]`)), 'l’arrêt ne nomme pas le niveleur');
  await marquer('niveleur'); await marquer('lampe'); await signaler();
  egal(await panneau(), 'decharge-quand-meme', 'N (Kevin) au premier signalement, sur l’écran du quai');
  vrai(/Kevin/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'posée par Kevin');
  await qrep();
  const c = await chef();
  vrai(/Bien vu : je pose le niveleur\./.test(c) && /Là, je ne vois rien qui cloche\./.test(c), 'la réponse de Samia, point par point : ' + c);
  vrai(!/lampe|cale|cabine|butoir/i.test(c), 'Samia ne parle pas de ce qui n’est pas signalé : ' + c);
  await cestBon();
  await pg.click(`${Z} [data-q="decharger"]`); await pg.waitForSelector(`${Z} [data-q-phase="choix"]`);
  for (const p of SORTIE) { await pg.click(`${Z} [data-q="depose"][data-c="${DEPOSE_JUSTE[p]}"]`); await pause(); }
  await qrep();
  const n = await note();
  egal(['securite-danger', 'securite-aucun-faux'].map((j) => n.detail[j]), ['ko', 'ko'], 'signalé après l’arrêt, et la lampe à tort');
});

await v('ENT-8.7 : dépose — P3 sur l’allée piétonne au premier choix : Kevin réagit, la case se grise, P3 finit posée en R2 ; seule P3 ✗ au bilan, sous « Diriger le déchargement »', async () => {
  await monter({ uid: 'ac87-dep', db: baseTemoin('cale') });
  await protocole(); await accueil();
  await allerV('quai'); await pg.waitForSelector(SVG);
  await marquer('cale'); await signaler(); await qrep(); await cestBon();
  await pg.click(`${Z} [data-q="decharger"]`); await pg.waitForSelector(`${Z} [data-q-phase="choix"]`);
  await pg.waitForFunction((Z) => document.querySelector(Z + ' [data-q-annonce]').textContent.trim() !== '', Z);
  vrai(/Kevin : « Dis-moi où je pose chaque palette\. Pas de gerbage à la réception\. »/.test(await annonce()), 'la première bulle de Kevin : ' + await annonce());
  await pg.click(`${Z} [data-q="depose"][data-c="R1"]`); await pause();
  await pg.click(`${Z} [data-q="depose"][data-c="allee-1"]`); await pause();
  await pg.waitForFunction((Z) => /piétonne/.test(document.querySelector(Z + ' [data-q-annonce]').textContent), Z).catch(() => {});
  vrai(/Kevin : « Là, c’est l’allée piétonne : je ne pose pas ici\. »/.test(await annonce()), 'Kevin réagit : ' + await annonce());
  vrai(!(await present('[data-q="depose"][data-c="allee-1"]')), 'la case de l’allée n’est plus proposée');
  const nom = await pg.getAttribute(`${Z} [data-q="depose"][data-c="quai3-1"]`, 'aria-label');
  egal(nom, 'Devant le quai 3', 'le nom lu au clavier : le lieu, jamais le verdict');
  await pg.click(`${Z} [data-q="depose"][data-c="R2"]`); await pause();
  for (const [p, c] of [['P2', 'R3'], ['P1', 'R4']]) { await pg.click(`${Z} [data-q="depose"][data-c="${c}"]`); await pause(); }
  await qrep();
  const e = (await base()).quais[QID].depose;
  egal([e.P3.premier, e.P3.essais, e.P3.pose], ['allee-1', ['allee-1', 'R2'], 'R2'], 'état de P3');
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['depose-P3'], 'seule P3 fausse');
  const b = await fin();
  egal(b.lignes.filter(([, x]) => x === 'ko').map(([g]) => g), ['Diriger le déchargement'], 'une seule ligne fausse');
  const detail = await pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim()]));
  vrai(detail.some(([id, x]) => id === 'depose-P3' && x === 'ko'), 'détail : P3 ✗ ' + JSON.stringify(detail));
  vrai(detail.every(([, , t]) => !/R[1-4]|allée|quai 3/i.test(t)), 'le détail ne dit pas la bonne case : ' + JSON.stringify(detail));
});

await v('ENT-8.7 : bilan détaillé — la ligne d’une situation porte la SITUATION (jamais la consigne attendue) et rouvre la fiche', async () => {
  await monter({ uid: 'ac87-detail', db: baseTemoin('cale') });
  await parcoursComplet({ anomalie: 'cale', proto: { ...PROTO, 's-aerosols': 'c-gerbage' } });
  const lignes = await pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim(),
    l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
  const t = lignes.find(([id]) => id === 'situation-difficile');
  vrai(t && t[1] === 'ko' && /Le protocole : Le chauffeur dit qu’une palette contient des aérosols/.test(t[2]), 'situation nommée : ' + JSON.stringify(t));
  vrai(!/précautions|cheffe d’équipe décide/.test(t[2]), 'la consigne attendue n’est pas dite');
  egal(t[3], 'fiche:protocole', 'la ligne rouvre la fiche');
  if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/7-bilan-detail.png`, fullPage: true });
});

await v('ENT-8.7 : confirmé à l’écran — 4 situations + « qui décharge », bandeau identique (5 lignes), aucun « bonus » écrit, bonus faux sans effet sur la note du socle', async () => {
  await monter({ uid: 'ac87-conf', aisance: 'confirme', db: baseTemoin('cale', { confirme: true }) });
  const ids = await protocole({ ...PROTO, 's-blesse': 'c-epi' });
  egal(ids, ['s-partir', 's-aerosols', 's-vitesse', 's-blesse', 'engin'], 'quatre situations, puis « qui décharge »');
  await accueil(); await quai({ anomalie: 'cale' });
  const n = await note();
  proche(n.score, 20, 'note du socle');
  egal(n.detail.bonus && [n.detail.bonus.justes, n.detail.bonus.total], [0, 1], 'bonus faux');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau identique');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-8.7 : étape suivante — la barre mène du protocole à « Au quai », puis au quai ; rien quand le bandeau de fin est là', async () => {
  const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  await monter({ uid: 'ac87-suite', db: baseTemoin('cale') });
  egal(await barre(), 'Étape suivante : Le protocole du quai 2 Y aller →', 'au départ');
  await protocole();
  egal(await barre(), 'Étape suivante : Au quai : accueillir le chauffeur Y aller →', 'après la fiche');
  await pg.click(`${Z} [data-suite-aller]`); await pause();
  vrai(await present('[data-dlg-appeler="marc"]'), 'la barre ouvre « Au quai »');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="marc"]`), 'Aller le voir', 'face à face');
  await accueil();
  egal(await barre(), 'Étape suivante : Le quai 2 : inspecter, puis décharger Y aller →', 'après l’accueil');
  await pg.click(`${Z} [data-suite-aller]`); await pause();
  vrai(await present('[data-q-inspection]'), 'la barre ouvre le quai');
});

await v('ENT-8.7 : parcours — fermée tant qu’ENT-8.4 n’a pas son premier bilan (photo de fin dans sa base), ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-action87', gid = 'g-verrou-action87', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/action-avant-noel`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('action-decharger'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'action-avant-noel': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('action-decharger'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r.avant, 'Termine d\'abord ENT-8.4.', 'avant le premier bilan d’ENT-8.4');
  egal(r.apres, null, 'après');
});

await v('ENT-8.7 : écrans à 1366 × 768 — protocole à gauche de la fiche, lisible en entier sans défiler, « Le droit » et la photo du chariot en onglets ; l’accueil ; le quai pendant le choix d’une case ; aucun défilement horizontal', async () => {
  await monter({ uid: 'ac87-ecran', db: baseTemoin('cale') });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['protocole-quai2', 'droit-quai', 'photo-chariot'], 'trois documents en onglets');
  const g = await pg.evaluate((Z) => {
    const doc = document.querySelector(`${Z} [data-fiche-panneau] .pr-doc`).getBoundingClientRect();
    const f = document.querySelector(`${Z} [data-fiche="protocole"]`).getBoundingClientRect();
    return { docBas: doc.bottom, docG: doc.left, ficheG: f.left, h: window.innerHeight };
  }, Z);
  vrai(g.docG < g.ficheG, 'le protocole est à gauche de la fiche');
  vrai(g.docBas <= g.h, `le protocole dépasse le bas de l’écran (${Math.round(g.docBas)} > ${g.h})`);
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await pg.click(`${Z} [data-fiche-doc="droit-quai"]`); await pause();
  const droit = await pg.textContent(`${Z} [data-fiche-panneau]`);
  vrai(/R4515-4/.test(droit) && /R4515-6/.test(droit) && /R4515-8/.test(droit) && /consulté le 17\/10\/2026/.test(droit), 'le document « Le droit »');
  await pg.click(`${Z} [data-fiche-doc="photo-chariot"]`); await pause();
  vrai(!!(await pg.$(`${Z} [data-fiche-panneau] img[src$="chariot-elevateur.jpg"]`)), 'la photo du chariot');
  await protocole();
  await allerV('telephone');
  vrai(await large() <= 0, 'accueil : défilement horizontal');
  await accueil();
  await allerV('quai'); await pg.waitForSelector(SVG);
  await marquer('cale'); await signaler(); await qrep(); await cestBon();
  await pg.click(`${Z} [data-q="decharger"]`); await pg.waitForSelector(`${Z} [data-q-phase="choix"]`);
  egal(await pg.$$eval(`${Z} [data-q="depose"]`, (L) => L.map((x) => x.dataset.c)), ['allee-1', 'R1', 'R2', 'R3', 'R4', 'quai3-1'], 'six cases proposées, de gauche à droite');
  vrai(await large() <= 0, 'quai : défilement horizontal');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.7 : corrigé enseignant — par élève : ses situations et leur consigne, « qui décharge », son anomalie, les cases justes ; la situation bonus marquée', async () => {
  const r = await pg.evaluate(async ({ T, g }) => {
    const C = await import('/contenus/corriges/ENT-8.7.js');
    const e = C.corrigeEleve({ tirage: { graine: g }, tirages: { 'action-decharger': T } }, 'x');
    const vide = C.corrigeEleve({}, 'temoin-3');
    return { items: e.items.map((i) => [i.texte, i.rep, !!i.bonus]), vide: [vide.texte.length > 0, vide.items.find((i) => /anomalie/.test(i.texte)).rep], n: C.CORRIGE.items.length };
  }, { T: tirage({ confirme: true }), g: GRAINE.niveleur });
  egal(r.items, [
    ['Situation (moyen) : Le chauffeur veut repartir avant la fin du contrôle.', 'Le chauffeur ne repart qu’après la signature des documents.', false],
    ['Situation (difficile) : Le chauffeur dit qu’une palette contient des aérosols.', 'Marchandises non alimentaires d’Action. Aérosols (produits inflammables) : le transporteur le signale, la cheffe d’équipe décide des précautions.', false],
    ['Situation (facile) : Un camion entre dans la cour à vive allure.', 'Vitesse 10 km/h dans la cour.', false],
    ['Situation (moyen) : Kevin se coince la main en descendant du chariot.', 'Accident : prévenir le sauveteur secouriste du travail (SST) de l’équipe et la cheffe d’équipe.', true],
    ['Qui décharge le camion du Havre, et avec quoi ?', 'Kevin, cariste, au chariot élévateur frontal', false],
    ['Son anomalie au quai', 'Niveleur relevé, pas posé sur la remorque', false],
    ['Les cases justes de la dépose', 'R1, R2, R3, R4', false]], 'corrigé du témoin');
  egal(r.vide, [true, 'Chauffeur au volant, moteur allumé'], 'élève qui n’a pas ouvert la séance : son anomalie à venir (graine = son identifiant)');
  egal(r.n, 5, 'parties du corrigé commun');
});

await F.fermer();
}
