// Suite de tests de Prepalog — bloc « vitrine » : ENT-25.1, « Et si tu choisissais la Logistique ? » (2de GATL, semaine des filières, 12/11/2026).
// `node outils/test.mjs vitrine` ne lance que ce bloc. Brief : `docs/briefs/ENT-25.1-vitrine-logistique.md`.
// Version « tout en écrans de jeu » (choix de Tristan du 12/11/2026) : carte, tri, bord de ligne, téléphone, plan d'entrepôt, puis une fiche.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS. Les valeurs attendues
// sont ÉCRITES À LA MAIN (12/11/2026) :
//   ⓪ carte : région et département des quatre sites au premier coup (0,5 × 8 = 4).
//   ① tri : Massy → Sud ; Orléans → Loiret ; Chartres → Eure ; Corbeil (carton ouvert) → écart ; Dreux (piège « Café d'Orléans ») → Eure ;
//      Olivet (carton enfoncé mais fermé) → Loiret ; Évry (étiquette floue) → écart ; Saran (piège) → Loiret.    communes 2 · pièges 1 · écarts 1
//   ② ligne : vingt minutes, les robots envoyés à temps (aucun arrêt).                                                voitures 2 · arrêt 2
//   ③ appel : au plus vite → coursier → messagerie → prévenir le client.                                            1 · 0,75 · 0,75 · 0,5
//   ④ rangement : P1 (chien, A) → A1-T01-N2-E2 ; P2 (chaton, C) → A2-T03-N1-E2 ; P3 (chiot, B) → A1-T02-N3-E1.        1 × 3
//   ⑤ Bac Pro : vrai, vrai, faux.                                                                                    0,5 · 0,5 · 1       = 20.

import { ouvrirPelleau, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'vitrine-logistique';
const ACT = '/activites/vitrine-logistique.js';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, bandeau, entrants, menu, clic, aller } = P;
const mont = (o = {}) => P.monter({ uid: 'vitrine', ...o });
const noter = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : { score: 0, max: 20, detail: {} }; });
const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };
const allerV = async (vue) => { await fermerCartes(); await aller(vue); };

const TRI_JUSTE = ['Sud', 'Loiret', 'Eure', 'ecart:carton', 'Eure', 'Loiret', 'ecart:etiquette', 'Loiret'];
const MOTIF = { carton: 'Carton ouvert', etiquette: 'Étiquette illisible', poids: 'Trop lourd' };
const APPEL_JUSTE = { aog: 'vite', transport: 'coursier', revision: 'messagerie', client: 'prevenir' };
const RANGE_JUSTE = [['P1', 'A1-T01-N2-E2'], ['P2', 'A2-T03-N1-E2'], ['P3', 'A1-T02-N3-E1']];
const BAC_JUSTE = { pfmp: 'vrai', engins: 'vrai', apres: 'faux', prefere: 'stellantis' };

async function jouerTri(L = TRI_JUSTE) {
  await allerV('tri');
  const R = `${Z} [data-t-tri]`;
  await pg.waitForSelector(`${R} [data-t-scene]`);
  for (const x of L) {
    const [s, m] = x.split(':');
    await clic(`[data-t-tri] button[data-t="sortie"][data-s="${s}"]`);
    if (m) await pg.click(`${R} button[data-t="motif"]:has-text("${MOTIF[m]}")`);
    await clic('[data-t-tri] button[data-t="envoyer"]');
    await pause(40);
  }
  await pg.waitForSelector(`${R} [data-t-bilan]`);
}
// La matinée : « Démarrer », puis un joueur qui envoie les cartes (la plus urgente d'abord, groupées), sur l'état rangé, avec les fonctions de la
// vue (repris du bloc `stellantis-ligne`) ; `rien` : démarrer et laisser la ligne tourner sans un geste.
async function jouerLigne({ rien = false } = {}) {
  await allerV('ligne');
  const RL = `${Z} [data-l-ligne]`;
  await pg.waitForSelector(`${RL} [data-l="demarrer"]`);
  await clic('[data-l-ligne] [data-l="demarrer"]');
  const r = await pg.evaluate(([RL, sid, rien]) => (async () => {
    const L = await import('/core/types/ligne.js'), el = document.querySelector(RL), D = el.__ligne.declaration;
    const st = window.__f.db.lignes[sid][D.id];
    st.coach = { carte: true, deux: true, bas: true, arret: true };   // Karim a déjà tout expliqué
    const kg = (c) => D.postes.find((p) => p.id === c.p).kg;
    for (let i = 0; i < 300 && !st.fait; i++) {
      for (let j = 0; j < 4 && !rien; j++) {
        const C = st.cartes.filter((c) => st.stock[c.p] > 0).sort((a, b) => L.couverture(D, st, a.p) - L.couverture(D, st, b.p));
        if (!C.length) break;
        const ks = [C[0].k];
        const c2 = C.slice(1).find((c) => kg(C[0]) + kg(c) <= D.robots.kgMax && (c.p !== C[0].p || st.stock[c.p] >= 2)); if (c2) ks.push(c2.k);
        if (!L.envoyerRobot(D, st, ks).ok) break;
      }
      el.__ligne.avancer(1);
    }
    return { fait: !!st.fait, arret: st.arret };
  })(), [RL, ID, rien]);
  vrai(r.fait, 'la matinée n’est pas finie');
  await pause(200);
}
async function jouerAppel(rep = APPEL_JUSTE) {
  await allerV('telephone');
  await clic('[data-dlg-appeler="nathalie"]'); await pause();
  for (const r of ['aog', 'transport', 'revision', 'client']) {
    for (const x of [].concat(rep[r])) { await clic(`[data-dlg-choix="${x}"]`); await pause(); }
  }
  for (let i = 0; i < 4; i++) {
    await clic('[data-dlg-raccrocher]'); await pause(150);
    if (await pg.evaluate(() => { const D = window.__f.db.dialogues; return !!(D && D['vitrine-logistique'] && D['vitrine-logistique'].nathalie.appels.some((a) => a.fin)); })) break;
  }
}
async function jouerRangement(L = RANGE_JUSTE) {
  await allerV('entrepot');
  for (const [id, a] of L) {
    await pg.click(`${Z} .pe-bandeau [data-pe-pal="${id}"]`);
    if (await present('[data-pe="retour"]')) await pg.click(`${Z} [data-pe="retour"]`);
    await pg.click(`${Z} [data-pe-trav="${a.slice(0, 6)}"]`);
    await pg.click(`${Z} [data-pe-emp="${a}"]`);
    await pg.click(`${Z} [data-pe="retour"]`);
    await pause(60);
  }
}
async function envoyerBac(vals = BAC_JUSTE) {
  await allerV('fiche');
  for (const [k, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${k}"]`, x); await pause(30); }
  await fermerCartes();
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
}
async function jouer(o = {}) {
  await P.jouerCarte(o.carte || {});
  await jouerTri(o.tri);
  await jouerLigne(o.ligne);
  await jouerAppel(o.appel);
  await jouerRangement(o.rangement);
  await envoyerBac(o.bac);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-25.1 : la séance se charge (2de, aucune compétence, guidage, correction, cachée aux élèves) ; 23 jalons, poids = 20 ; inscrite au registre, entreprise n° 25', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/vitrine-logistique.js');
    const S = await import('/contenus/vitrine-logistique.js');
    const I = await import('/activites/index.js');
    const parGroupe = {};
    S.ETAPES.forEach((e) => { parGroupe[e.groupe] = (parGroupe[e.groupe] || 0) + e.poids; });
    return { meta: A.meta, n: S.ETAPES.length, total: S.ETAPES.reduce((s, e) => s + e.poids, 0), parGroupe: Object.values(parGroupe),
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'vitrine-logistique'), entreprise: (I.ENTREPRISES.find((e) => e.n === 25) || {}).nom,
      logos: await Promise.all(['amazon.svg', 'stellantis.svg', 'airbus.svg', 'royal-canin.svg', 'prepalog.png'].map((f) => fetch('/contenus/trames/logos/' + f).then((x) => x.status))) };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.correction, m.parcours, m.pret, m.ouverture, m.rubrique],
    ['ENT-25.1', ['2de'], [], 'guidage', 20, undefined, true, true, true, 'prof', 'simulog'], 'meta');
  egal(r.n, 23, 'nombre de jalons');
  proche(r.total, 20, 'somme des poids');
  egal(r.parGroupe, [4, 4, 4, 3, 3, 2], 'points par arrêt (carte, Amazon, Stellantis, Airbus, Royal Canin, Bac Pro)');
  egal([r.auRegistre, r.entreprise], [true, 'Le Bac Pro Logistique'], 'registre');
  egal(r.logos, [200, 200, 200, 200, 200], 'les logos sont servis par le site');
});

// ─────────────────────────────────────────────────────────── l'ouverture et l'inaction
await v('ENT-25.1 : à l’ouverture — un seul message de Sarah, la carte ouverte, les cinq autres arrêts fermés ; rien fait → 0/20, rien de « juste »', async () => {
  await mont();
  egal((await entrants()).map((m) => m.subject), ['Bienvenue : on part en visite !'], 'messages');
  const mn = await menu();
  vrai(mn.includes('localiser'), 'carte au menu : ' + mn);
  for (const x of ['tri', 'ligne', 'telephone', 'entrepot', 'fiche']) vrai(mn.includes(`fermee:${x}`), `« ${x} » fermé : ${mn}`);
  const n = await noter();
  egal(n.score, 0, 'note');
  vrai(!Object.values(n.detail || {}).includes('ok'), 'un jalon juste sans rien faire');
});

// ─────────────────────────────────────────────────────────── le parcours
await v('ENT-25.1 : parcours juste — les six arrêts s’ouvrent l’un après l’autre, 20/20, bandeau ✓, messages de Sarah dans l’ordre, poste préféré rangé et non jugé', async () => {
  await mont();
  await P.jouerCarte();
  vrai((await menu()).includes('tri'), 'le tri s’ouvre après la carte');
  vrai((await menu()).includes('fermee:ligne'), 'la ligne reste fermée');
  await jouerTri();
  vrai((await menu()).includes('ligne'), 'la ligne s’ouvre après le tri');
  await jouerLigne();
  vrai((await menu()).includes('telephone'), 'le téléphone s’ouvre après la ligne');
  await jouerAppel();
  vrai((await menu()).includes('entrepot'), 'le plan s’ouvre après l’appel');
  await jouerRangement();
  vrai((await menu()).includes('fiche'), 'la fiche s’ouvre après le rangement');
  await envoyerBac();
  const n = await noter();
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  const B = await bandeau();
  vrai(B.length >= 6 && B.every(([, e]) => e === 'ok'), 'bandeau : ' + JSON.stringify(B));
  egal((await entrants()).map((m) => m.subject), ['Bienvenue : on part en visite !', 'Premier arrêt : Amazon', 'Deuxième arrêt : Stellantis', 'Troisième arrêt : Airbus Helicopters',
    'Quatrième arrêt : Royal Canin', 'Et toi, en Logistique ?', 'Merci pour la visite'], 'messages');
  egal((await base()).fiches['bac-251'].valeurs.prefere, 'stellantis', 'poste préféré rangé');
  vrai(!Object.keys(n.detail).some((k) => /prefere/.test(k)), 'le poste préféré est jugé');
});

await v('ENT-25.1 : une erreur par arrêt — chaque jalon tombe seul (région d’Airbus, piège de Dreux, ligne sans robot, express pour l’hélicoptère, chaton côté chiens, « vrai » pour les études)', async () => {
  await mont();
  await jouer({
    carte: { 'airbus:region': 1 },
    tri: ['Sud', 'Loiret', 'Eure', 'ecart:carton', 'Loiret', 'Loiret', 'ecart:etiquette', 'Loiret'],
    ligne: { rien: true },
    appel: { ...APPEL_JUSTE, transport: ['express', 'coursier'] },
    rangement: [['P1', 'A1-T01-N2-E2'], ['P2', 'A1-T03-N1-E2'], ['P3', 'A1-T02-N3-E1']],
    bac: { ...BAC_JUSTE, apres: 'vrai' },
  });
  const n = await noter();
  const faux = Object.entries(n.detail).filter(([, e]) => e === 'ko').map(([k]) => k).sort();
  egal(faux, ['appel-transport', 'ligne-arret', 'ligne-voitures', 'localiser:airbus:region', 'palette-P2', 'vf-apres'], 'jalons faux');
  // Un piège sur deux : le jalon des pièges reste « juste » à moitié (la vue Tri compte la part juste), il perd 0,5 point sur 1.
  egal(n.detail['tri-pieges'], 'ok', 'pièges : un sur deux');
  proche(n.score, 20 - 0.5 - 0.5 - 2 - 2 - 0.75 - 1 - 1, 'note');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
});

// ─────────────────────────────────────────────────────────── le corrigé, les documents, le réseau
await v('ENT-25.1 : le corrigé est servi, chaque document dit le réel et le construit, aucun hôte externe, aucune erreur', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-25.1.js');
    const S = await import('/contenus/vitrine-logistique.js');
    return { status: (await fetch('/contenus/corriges/ENT-25.1.js')).status, n: C.CORRIGE.items.length,
      pieds: S.DOCUMENTS.map((d) => /Document pédagogique/.test(d.html) && /(Réels|D’après)/.test(d.html)) };
  });
  egal([r.status, r.n], [200, 6], 'corrigé');
  egal(r.pieds, [true, true, true, true, true], 'mention en pied de chaque document');
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
