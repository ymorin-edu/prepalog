// Contrôle d'équilibre : rejoue avec ce moteur la stratégie « ville honnête » du simulateur de référence v15
// (stratelog-sim-v15.py, fichiers du projet) et compare. Repère v15 : 165 points, famine 6 %, 17,2/20.
// Lancer : node stratelog/avant-l-hiver/equilibre.mjs [parties] [villes]
import * as R from './regles.js';

const CIBLE = [['atelier', 1], ['grenier', 1], ['quartier', 1], ['champ', 4], ['carriere', 1],
  ['choeur', 1], ['nef', 1], ['quartier', 2], ['champ', 5]];

export function jouer(p, id) {
  const v = p.etat[id];
  const s = R.saisonDu(p.tour);
  const t = p.tour - 1;
  const d = { ...R.decisionsVides(), reserve: true };
  let caisse = v.deniers; let bois = v.bois; let pierre = v.pierre;
  let pa = R.PA;
  const acheter = (m, q) => {
    while (q > 0 && q * R.prix(m, s) + R.charrettesPour(q) * R.COUT_CHARRETTE > caisse) q -= 5;
    if (q <= 0) return false;
    const a = { m, q, charrettes: R.charrettesPour(q) };
    caisse -= R.coutAchat(a, s); d.achats.push(a); pa -= 1;
    return true;
  };
  // Grain jusqu'au prochain été (comme assurer_grain de la v15).
  let hab = v.hab; let besoin = 0; let prod = 0;
  for (let i = t; i < R.SAISONS.length; i++) {
    const x = R.SAISONS[i];
    if (x === 'Été' && i > t) break;
    besoin += R.besoinGrain(hab, x);
    prod += ({ 'Été': 50, 'Automne': 20 })[x] * v.bats.champ || 0;
    hab = Math.min(v.log, hab + Math.floor(hab / 10));
  }
  const auQuai = v.quai.filter((c) => c.m === 'grain').reduce((a, c) => a + c.q, 0);
  const manque = besoin - prod - v.grain - auQuai;
  const q = Math.min(manque, Math.max(v.capGrain - v.grain, 0) + R.besoinGrain(v.hab, s));
  if (q > 0) acheter('grain', q);
  if (pa && v.drap) {
    const a = { m: 'drap', q: v.drap, charrettes: R.charrettesPour(v.drap) };
    d.ventes.push(a); caisse += R.recetteVente(a, s); pa -= 1;
  }
  const n = (b) => (v.bats[b] || 0) + v.enCours.filter((x) => x === b).length + d.chantiers.filter((x) => x === b).length;
  for (const [b, k] of CIBLE.filter(([b, k]) => n(b) < k).slice(0, pa)) {
    const B = R.BATIMENTS[b];
    if (n(b) >= k || (b === 'nef' && !v.bats.choeur)) continue;
    if (pa && caisse - 60 >= B.d && bois >= B.b && pierre >= B.p) {
      d.chantiers.push(b); caisse -= B.d; bois -= B.b; pierre -= B.p; pa -= 1;
    }
  }
  if (pa && bois < 40) acheter('bois', 30);   // stock après chantiers, comme la v15
  // Équipes, dans l'ordre « prévoyant » de la v15.
  let E = R.equipesDe(v.hab);
  const quai = v.quai.length + v.aRelivrer.length + d.achats.reduce((a, x) => a + x.charrettes, 0);
  const besoins = { champ: R.equipesParChamp(s) * v.bats.champ, dech: quai, atelier: v.bats.atelier || 0,
    carriere: s === 'Hiver' ? 0 : (v.bats.carriere || 0), bucheron: v.bats.bucheron || 0 };
  for (const [poste, b] of Object.entries(besoins)) { const x = Math.min(b, E); d.equipes[poste] = x; E -= x; }
  const err = R.valider(p, id, d);
  if (err.length) throw new Error(`${id} tour ${p.tour} : ${err.join(' ')}`);
  return d;
}

export function experience(parties = 1000, nVilles = 3, graine = 7) {
  const r = R.hasard(graine);
  let somme = 0; let famines = 0; let note = 0; const villes = 'ABCDE'.slice(0, nVilles).split('');
  for (let k = 0; k < parties; k++) {
    let p = R.remettreAZero(R.nouvellePartie({ villes, graine: graine * 100000 + k }));
    while (p.tour <= R.DERNIER_TOUR) {
      const D = Object.fromEntries(villes.map((id) => [id, jouer(p, id)]));
      const carte = p.tour === 1 ? 'calme' : R.PAQUET[Math.floor(r() * R.PAQUET.length)];
      const cible = R.CARTES[carte].cible ? villes[Math.floor(r() * nVilles)] : null;
      p = R.resoudreTour(p, D, { carte, cible }).partie;
    }
    const sc = Object.fromEntries(villes.map((id) => [id, R.score(p.etat[id]) - p.etat[id].bonus]));
    const n = R.notes(sc);
    villes.forEach((id) => { somme += sc[id]; famines += p.etat[id].famines > 0; note += n[id].note; });
  }
  const tot = parties * nVilles;
  return { score: somme / tot, famine: famines / tot, note: note / tot };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = Number(process.argv[2]) || 1000;
  for (const nv of process.argv[3] ? [Number(process.argv[3])] : [3, 4, 5]) {
    const x = experience(n, nv);
    console.log(`${nv} villes honnêtes : score ${x.score.toFixed(1)}  famine ${(x.famine * 100).toFixed(0)} %  note ${x.note.toFixed(2)}   (v15 : 165, 6 %, 17,2)`);
  }
}
