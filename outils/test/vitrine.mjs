// Suite de tests de Prepalog — bloc « vitrine » : ENT-25.1, « Et si tu choisissais la Logistique ? » (2de GATL, semaine des filières, 12/11/2026).
// `node outils/test.mjs vitrine` ne lance que ce bloc. Brief : `docs/briefs/ENT-25.1-vitrine-logistique.md`.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS (flèches de l'ordre,
// boutons), les listes par `selectOption`, les nombres par `fill`. Les valeurs attendues sont ÉCRITES À LA MAIN (12/11/2026) :
//
//   ① Amazon : camion → ranger → commande → robot → emballer → peser (départ, le même pour tous : emballer, robot, peser, commande, camion, ranger) ;
//      qui se déplace : le robot.                                                                                   4 + 1
//   ② Stellantis : 60 voitures par heure ; 240 roues par heure ; la ligne s'arrête.                                  2 + 2 + 1
//   ③ Airbus : hélicoptère au sol → coursier dédié ; révision dans deux semaines → messagerie.                       2 + 2
//   ④ Royal Canin : 85 tonnes sur 100 ; le lot L-2604 (DDM 03/02/2027, la plus proche).                             1 + 2
//   ⑤ Le Bac Pro : 20 semaines en entreprise → vrai ; conduire des engins → vrai ; pas d'études après → faux.        1 + 1 + 1     = 20.

import { ouvrirPelleau, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'vitrine-logistique';
const ACT = '/activites/vitrine-logistique.js';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, bandeau, entrants, menu, clic, ouvrirParMessage } = P;
const mont = (o = {}) => P.monter({ uid: 'vitrine', ...o });
const noter = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : { score: 0, max: 20, detail: {} }; });
const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };

const CHEMIN = ['camion', 'ranger', 'commande', 'robot', 'emballer', 'peser'];
const DEPART = ['emballer', 'robot', 'peser', 'commande', 'camion', 'ranger'];
const JUSTE = {
  amazon: { chemin: CHEMIN, bouge: 'robot' },
  stellantis: { parheure: '60', roues: '240', retard: 'arret' },
  airbus: { aog: 'coursier', revision: 'messagerie' },
  royal: { export: '85', lot: 'L-2604' },
  bac: { pfmp: 'vrai', engins: 'vrai', apres: 'faux', prefere: 'airbus' },
};
const SUJETS = { amazon: null, stellantis: 'Deuxième arrêt : Stellantis', airbus: 'Troisième arrêt : Airbus Helicopters', royal: 'Quatrième arrêt : Royal Canin', bac: 'Et toi, en Logistique ?' };
const VUES = { amazon: 'fiche', stellantis: 'fiche:stellantis-251', airbus: 'fiche:airbus-251', royal: 'fiche:royal-251', bac: 'fiche:bac-251' };

// Remplit et envoie une fiche. `vals` : { champ: valeur } ; le champ `chemin` (ordre) se joue aux flèches (null = jamais touché).
async function envoyer(cle, vals) {
  await fermerCartes();
  if (SUJETS[cle]) await ouvrirParMessage(SUJETS[cle], VUES[cle]);
  else { await P.aller('fiche'); }
  for (const [champ, x] of Object.entries(vals)) {
    if (champ === 'chemin') {
      if (!x) continue;
      for (let k = 0; k < x.length; k++) {
        for (let s = 0; s < 8; s++) {
          const cur = await pg.$$eval(`${Z} [data-fiche-ordre="chemin"] li`, (L) => L.map((e) => e.dataset.v));
          if (cur.indexOf(x[k]) <= k) break;
          await clic(`[data-fiche-ordre="chemin"] li[data-v="${x[k]}"] [data-ordre-sens="-1"]`);
          await pause(30);
        }
      }
    } else {
      // Les listes portent `data-fiche-champ`, les cases de nombre `data-fiche-saisie` (core/types/fiche.js).
      const liste = `${Z} [data-fiche-champ="${champ}"]`;
      if (await pg.$(liste)) await pg.selectOption(liste, x); else await pg.fill(`${Z} [data-fiche-saisie="${champ}"]`, x);
      await pause(30);
    }
  }
  await fermerCartes();
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
}
async function jouer(o = {}) {
  for (const cle of ['amazon', 'stellantis', 'airbus', 'royal', 'bac']) await envoyer(cle, { ...JUSTE[cle], ...(o[cle] || {}) });
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-25.1 : la séance se charge (2de, aucune compétence, guidage, correction, cachée aux élèves) ; 12 jalons, poids = 20 ; inscrite au registre, entreprise n° 25', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/vitrine-logistique.js');
    const S = await import('/contenus/vitrine-logistique.js');
    const I = await import('/activites/index.js');
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0),
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'vitrine-logistique'), entreprise: (I.ENTREPRISES.find((e) => e.n === 25) || {}).nom,
      logos: await Promise.all(['amazon.svg', 'stellantis.svg', 'airbus.svg', 'royal-canin.svg'].map((f) => fetch('/contenus/trames/logos/' + f).then((x) => x.status))) };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.correction, m.parcours, m.pret, m.ouverture, m.rubrique],
    ['ENT-25.1', ['2de'], [], 'guidage', 20, undefined, true, true, true, 'prof', 'simulog'], 'meta');
  egal(r.poids, [['chemin', 4], ['bouge', 1], ['parheure', 2], ['roues', 2], ['retard', 1], ['aog', 2], ['revision', 2], ['export', 1], ['lot', 2],
    ['vf-pfmp', 1], ['vf-engins', 1], ['vf-apres', 1]], 'jalons et poids');
  proche(r.total, 20, 'somme des poids');
  egal([r.auRegistre, r.entreprise], [true, 'Le Bac Pro Logistique'], 'registre');
  egal(r.logos, [200, 200, 200, 200], 'les quatre logos sont servis par le site');
});

// ─────────────────────────────────────────────────────────── l'ouverture et l'inaction
await v('ENT-25.1 : à l’ouverture — un seul message de Sarah (document Amazon joint), la fiche Amazon au menu, aucune autre fiche, l’ordre de départ est celui écrit à la main', async () => {
  await mont();
  egal((await entrants()).map((m) => m.subject), ['Bienvenue : on part en visite !'], 'messages');
  const mn = await menu();
  vrai(mn.includes('fiche'), 'fiche Amazon au menu : ' + mn);
  for (const f of ['stellantis-251', 'airbus-251', 'royal-251', 'bac-251']) vrai(!mn.includes(`fiche:${f}`), `fiche ${f} déjà au menu : ${mn}`);
  await P.aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-ordre="chemin"] li`, (L) => L.map((e) => e.dataset.v)), DEPART, 'ordre de départ');
  vrai(await present('img.vl-logo[src*="amazon.svg"]'), 'le logo d’Amazon dans le document');
});

await v('ENT-25.1 : inaction — rien fait → 0/20, rien de jugé « juste », pas de bandeau de fin ; l’ordre jamais touché ne rapporte rien', async () => {
  await mont({ uid: 'vitrine-rien' });
  const n = await noter();
  egal(n.score, 0, 'note');
  vrai(!Object.values(n.detail || {}).includes('ok'), 'un jalon juste sans rien faire');
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
  await envoyer('amazon', { chemin: null, bouge: 'robot' });
  const d = (await noter()).detail;
  egal([d.chemin, d.bouge], ['ko', 'ok'], 'ordre de départ envoyé tel quel : faux');
});

// ─────────────────────────────────────────────────────────── le parcours
await v('ENT-25.1 : parcours juste — 20/20, bandeau ✓, messages de Sarah dans l’ordre, le poste préféré rangé et non jugé', async () => {
  await mont();
  await jouer();
  const n = await noter();
  proche(n.score, 20, 'note');
  egal(await bandeau(), [['chemin', 'ok'], ['parheure', 'ok'], ['aog', 'ok'], ['export', 'ok'], ['vf-pfmp', 'ok']], 'bandeau (une ligne par arrêt)');
  egal((await entrants()).map((m) => m.subject), ['Bienvenue : on part en visite !', 'Deuxième arrêt : Stellantis', 'Troisième arrêt : Airbus Helicopters',
    'Quatrième arrêt : Royal Canin', 'Et toi, en Logistique ?', 'Merci pour la visite'], 'messages');
  const b = await base();
  egal(b.fiches['bac-251'].valeurs.prefere, 'airbus', 'poste préféré rangé');
  vrai(!Object.keys(n.detail).some((k) => /prefere/.test(k)), 'le poste préféré est jugé');
});

await v('ENT-25.1 : une erreur par arrêt — chaque jalon tombe seul (une inversion, 59 voitures, 236 roues, express pour l’AOG, lot L-2611, « vrai » pour les études) → 7/20, « Corriger » proposé', async () => {
  await mont();
  await jouer({
    amazon: { chemin: ['camion', 'ranger', 'commande', 'emballer', 'robot', 'peser'] },
    stellantis: { parheure: '59', roues: '236' },
    airbus: { aog: 'express' },
    royal: { lot: 'L-2611' },
    bac: { apres: 'vrai' },
  });
  const n = await noter();
  egal(Object.entries(n.detail).filter(([, e]) => e === 'ko').map(([k]) => k).sort(), ['aog', 'chemin', 'lot', 'parheure', 'roues', 'vf-apres'], 'jalons faux');
  proche(n.score, 20 - 4 - 2 - 2 - 2 - 2 - 1, 'note');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
});

await v('ENT-25.1 : les cases de nombre refusent un texte (« soixante ») et la fiche Stellantis ne part pas vide', async () => {
  await mont();
  await envoyer('amazon', JUSTE.amazon);
  await fermerCartes();
  await ouvrirParMessage(SUJETS.stellantis, VUES.stellantis);
  await fermerCartes();
  await clic('[data-fiche-envoyer]');
  await pause();
  vrai(!(await base()).fiches?.['stellantis-251']?.envoye, 'fiche Stellantis partie vide');
  await pg.fill(`${Z} [data-fiche-saisie="parheure"]`, 'soixante');
  await pg.fill(`${Z} [data-fiche-saisie="roues"]`, '240');
  await pg.selectOption(`${Z} [data-fiche-champ="retard"]`, 'arret');
  await pause();
  await fermerCartes();
  await clic('[data-fiche-envoyer]');
  await pause();
  vrai(/nombre entier/.test(await texte()), 'refus d’un texte dans une case de nombre');
  vrai(!(await base()).fiches?.['stellantis-251']?.envoye, 'fiche Stellantis partie avec un texte');
});

// ─────────────────────────────────────────────────────────── le corrigé, les documents, le réseau
await v('ENT-25.1 : le corrigé est servi (5 étapes, réponses justes), chaque document dit le réel et le construit, aucun hôte externe, aucune erreur', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-25.1.js');
    const S = await import('/contenus/vitrine-logistique.js');
    return { status: (await fetch('/contenus/corriges/ENT-25.1.js')).status, n: C.CORRIGE.items.length, airbus: C.CORRIGE.items[2].reponses.map((x) => x[1]),
      royal: C.CORRIGE.items[3].rep, pieds: S.DOCUMENTS.map((d) => /Document pédagogique/.test(d.html) && /(Réels|D’après)/.test(d.html)) };
  });
  egal([r.status, r.n], [200, 5], 'corrigé');
  egal(r.airbus, ['Coursier dédié', 'Messagerie'], 'Airbus');
  vrai(/^85 tonnes/.test(r.royal) && /L-2604/.test(r.royal), 'Royal Canin : ' + r.royal);
  egal(r.pieds, [true, true, true, true, true], 'mention en pied de chaque document');
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
